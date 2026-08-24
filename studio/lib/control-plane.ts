import { createHash, randomUUID } from "node:crypto";

export type Identity = { userId: string; mode: "authenticated" | "demo" };
export type UsageSnapshot = { used: number; limit: number; remaining: number; resetAt: number; costMicros: number };
export type RunRecord = {
  id: string; userId: string; projectId: string; idempotencyKey: string; status: string;
  brief: string; systemId: string; variation: number; providerId: string | null;
  inputTokens: number; outputTokens: number; costMicros: number; createdAt: number; resultJson: string | null;
};
export type ProjectRecord = { id: string; userId: string; name: string; systemId: string; brief: string; selectedVariation: number; createdAt: number; updatedAt: number };

const RUN_LIMIT = Number(process.env.DESIGNOS_FREE_RUN_LIMIT || 20);
const WINDOW_MS = 24 * 60 * 60 * 1000;

type UserLedger = { count: number; resetAt: number; costMicros: number };
type State = { ledgers: Map<string, UserLedger>; projects: Map<string, ProjectRecord>; runs: Map<string, RunRecord>; idempotency: Map<string, string> };
declare global { var __designosControlState: State | undefined; }
const state = globalThis.__designosControlState ?? { ledgers: new Map(), projects: new Map(), runs: new Map(), idempotency: new Map() };
globalThis.__designosControlState = state;

export function identityFor(request: Request): Identity {
  const authenticated = request.headers.get("oai-authenticated-user-id")?.trim();
  if (authenticated) return { userId: `oai:${authenticated}`, mode: "authenticated" };
  if (process.env.DESIGNOS_REQUIRE_AUTH === "true") throw new Error("AUTH_REQUIRED");
  const address = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return { userId: `demo:${createHash("sha256").update(address).digest("hex").slice(0, 24)}`, mode: "demo" };
}

function ledger(userId: string, now = Date.now()) {
  const current = state.ledgers.get(userId);
  if (!current || current.resetAt <= now) {
    const fresh = { count: 0, resetAt: now + WINDOW_MS, costMicros: 0 };
    state.ledgers.set(userId, fresh);
    return fresh;
  }
  return current;
}

export function usage(userId: string): UsageSnapshot {
  const current = ledger(userId);
  return { used: current.count, limit: RUN_LIMIT, remaining: Math.max(0, RUN_LIMIT - current.count), resetAt: current.resetAt, costMicros: current.costMicros };
}

export function reserve(userId: string) {
  const current = ledger(userId);
  if (current.count >= RUN_LIMIT) return { allowed: false as const, usage: usage(userId) };
  current.count += 1;
  return { allowed: true as const, usage: usage(userId) };
}

export function recordCost(userId: string, costMicros: number) {
  ledger(userId).costMicros += Math.max(0, Math.round(costMicros));
}

export function createProject(userId: string, input: { name: string; brief: string; systemId?: string }) {
  const now = Date.now();
  const project: ProjectRecord = { id: randomUUID(), userId, name: input.name.slice(0, 80), brief: input.brief.slice(0, 640), systemId: input.systemId || "kiln", selectedVariation: 0, createdAt: now, updatedAt: now };
  state.projects.set(project.id, project);
  return project;
}

export function listProjects(userId: string) {
  return [...state.projects.values()].filter((item) => item.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function projectFor(userId: string, projectId: string) {
  const project = state.projects.get(projectId);
  return project?.userId === userId ? project : null;
}

export function beginRun(userId: string, input: { projectId?: string; idempotencyKey: string; brief: string; systemId: string; variation: number }) {
  const scope = `${userId}:${input.idempotencyKey}`;
  const existingId = state.idempotency.get(scope);
  if (existingId) return { record: state.runs.get(existingId)!, replay: true };
  let project = input.projectId ? projectFor(userId, input.projectId) : null;
  if (input.projectId && !project) throw new Error("PROJECT_NOT_FOUND");
  if (!project) project = createProject(userId, { name: input.brief.split(/[.!?]/)[0] || "Untitled project", brief: input.brief, systemId: input.systemId });
  project.brief = input.brief; project.systemId = input.systemId; project.selectedVariation = input.variation; project.updatedAt = Date.now();
  const record: RunRecord = { id: randomUUID(), userId, projectId: project.id, idempotencyKey: input.idempotencyKey, status: "RUNNING", brief: input.brief, systemId: input.systemId, variation: input.variation, providerId: null, inputTokens: 0, outputTokens: 0, costMicros: 0, createdAt: Date.now(), resultJson: null };
  state.runs.set(record.id, record); state.idempotency.set(scope, record.id);
  return { record, replay: false };
}

export function completeRun(id: string, update: { status: string; providerId?: string | null; inputTokens?: number; outputTokens?: number; costMicros?: number; result: unknown }) {
  const record = state.runs.get(id);
  if (!record) throw new Error("RUN_NOT_FOUND");
  Object.assign(record, { status: update.status, providerId: update.providerId || null, inputTokens: update.inputTokens || 0, outputTokens: update.outputTokens || 0, costMicros: update.costMicros || 0, resultJson: JSON.stringify(update.result) });
  return record;
}

export function runsFor(userId: string, projectId?: string) {
  return [...state.runs.values()].filter((item) => item.userId === userId && (!projectId || item.projectId === projectId)).sort((a, b) => b.createdAt - a.createdAt);
}

export function replayResult(record: RunRecord) {
  return record.resultJson ? JSON.parse(record.resultJson) : null;
}
