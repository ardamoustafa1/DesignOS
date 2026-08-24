import { randomUUID } from "node:crypto";
import * as memory from "./control-plane";
import type { ProjectRecord, RunRecord, UsageSnapshot } from "./control-plane";

type Statement = { bind: (...values: unknown[]) => Statement; first: <T>() => Promise<T | null>; all: <T>() => Promise<{ results: T[] }>; run: () => Promise<{ meta?: { changes?: number } }> };
type D1 = { prepare: (sql: string) => Statement; batch: (statements: Statement[]) => Promise<unknown> };
const LIMIT = Number(process.env.DESIGNOS_FREE_RUN_LIMIT || 20);
const WINDOW_MS = 24 * 60 * 60 * 1000;
async function db() {
  try {
    const runtime = await import("cloudflare:workers");
    return (runtime.env.DB as unknown as D1 | undefined) || null;
  } catch {
    return null;
  }
}
const windowStart = (now = Date.now()) => Math.floor(now / WINDOW_MS) * WINDOW_MS;

export const identityFor = memory.identityFor;

export async function usage(userId: string): Promise<UsageSnapshot> {
  const d1 = await db(); if (!d1) return memory.usage(userId);
  const start = windowStart();
  const row = await d1.prepare("SELECT run_count AS used, cost_micros AS costMicros FROM usage_windows WHERE user_id = ? AND window_start = ?").bind(userId, start).first<{ used: number; costMicros: number }>();
  const used = row?.used || 0;
  return { used, limit: LIMIT, remaining: Math.max(0, LIMIT - used), resetAt: start + WINDOW_MS, costMicros: row?.costMicros || 0 };
}

export async function reserve(userId: string) {
  const d1 = await db(); if (!d1) return memory.reserve(userId);
  const start = windowStart();
  await d1.prepare("INSERT OR IGNORE INTO usage_windows (user_id, window_start, run_count, input_tokens, output_tokens, cost_micros) VALUES (?, ?, 0, 0, 0, 0)").bind(userId, start).run();
  const updated = await d1.prepare("UPDATE usage_windows SET run_count = run_count + 1 WHERE user_id = ? AND window_start = ? AND run_count < ?").bind(userId, start, LIMIT).run();
  return { allowed: Boolean(updated.meta?.changes), usage: await usage(userId) } as { allowed: boolean; usage: UsageSnapshot };
}

export async function recordCost(userId: string, costMicros: number, inputTokens = 0, outputTokens = 0) {
  const d1 = await db(); if (!d1) { memory.recordCost(userId, costMicros); return; }
  await d1.prepare("UPDATE usage_windows SET cost_micros = cost_micros + ?, input_tokens = input_tokens + ?, output_tokens = output_tokens + ? WHERE user_id = ? AND window_start = ?").bind(Math.max(0, Math.round(costMicros)), inputTokens, outputTokens, userId, windowStart()).run();
}

export async function createProject(userId: string, input: { name: string; brief: string; systemId?: string }): Promise<ProjectRecord> {
  const d1 = await db(); if (!d1) return memory.createProject(userId, input);
  const now = Date.now(); const project: ProjectRecord = { id: randomUUID(), userId, name: input.name.slice(0, 80), brief: input.brief.slice(0, 640), systemId: input.systemId || "kiln", selectedVariation: 0, createdAt: now, updatedAt: now };
  await d1.batch([
    d1.prepare("INSERT OR IGNORE INTO users (id, auth_mode, created_at) VALUES (?, ?, ?)").bind(userId, userId.startsWith("oai:") ? "authenticated" : "demo", now),
    d1.prepare("INSERT INTO projects (id, user_id, name, brief, system_id, selected_variation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(project.id, userId, project.name, project.brief, project.systemId, 0, now, now),
  ]);
  return project;
}

export async function listProjects(userId: string): Promise<ProjectRecord[]> {
  const d1 = await db(); if (!d1) return memory.listProjects(userId);
  const rows = await d1.prepare("SELECT id, user_id AS userId, name, brief, system_id AS systemId, selected_variation AS selectedVariation, created_at AS createdAt, updated_at AS updatedAt FROM projects WHERE user_id = ? ORDER BY updated_at DESC").bind(userId).all<ProjectRecord>();
  return rows.results;
}

export async function beginRun(userId: string, input: { projectId?: string; idempotencyKey: string; brief: string; systemId: string; variation: number }) {
  const d1 = await db(); if (!d1) return memory.beginRun(userId, input);
  const existing = await d1.prepare("SELECT id, user_id AS userId, project_id AS projectId, idempotency_key AS idempotencyKey, status, brief, system_id AS systemId, variation, provider_id AS providerId, input_tokens AS inputTokens, output_tokens AS outputTokens, cost_micros AS costMicros, created_at AS createdAt, result_json AS resultJson FROM generation_runs WHERE user_id = ? AND idempotency_key = ?").bind(userId, input.idempotencyKey).first<RunRecord>();
  if (existing) return { record: existing, replay: true };
  let projectId = input.projectId;
  if (projectId) {
    const project = await d1.prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?").bind(projectId, userId).first<{ id: string }>();
    if (!project) throw new Error("PROJECT_NOT_FOUND");
  } else projectId = (await createProject(userId, { name: input.brief.split(/[.!?]/)[0] || "Untitled project", brief: input.brief, systemId: input.systemId })).id;
  const id = randomUUID(); const now = Date.now();
  await d1.batch([
    d1.prepare("UPDATE projects SET brief = ?, system_id = ?, selected_variation = ?, updated_at = ? WHERE id = ? AND user_id = ?").bind(input.brief, input.systemId, input.variation, now, projectId, userId),
    d1.prepare("INSERT INTO generation_runs (id, user_id, project_id, idempotency_key, status, brief, system_id, variation, created_at) VALUES (?, ?, ?, ?, 'RUNNING', ?, ?, ?, ?)").bind(id, userId, projectId, input.idempotencyKey, input.brief, input.systemId, input.variation, now),
  ]);
  return { record: { id, userId, projectId, idempotencyKey: input.idempotencyKey, status: "RUNNING", brief: input.brief, systemId: input.systemId, variation: input.variation, providerId: null, inputTokens: 0, outputTokens: 0, costMicros: 0, createdAt: now, resultJson: null }, replay: false };
}

export async function completeRun(id: string, update: { status: string; providerId?: string | null; inputTokens?: number; outputTokens?: number; costMicros?: number; result: unknown }) {
  const d1 = await db(); if (!d1) return memory.completeRun(id, update);
  const result = update.result && typeof update.result === "object" ? update.result as Record<string, unknown> : {};
  const attempts = Array.isArray(result.attemptLog) ? result.attemptLog as Array<Record<string, unknown>> : [];
  const now = Date.now();
  const statements = [d1.prepare("UPDATE generation_runs SET status = ?, provider_id = ?, input_tokens = ?, output_tokens = ?, cost_micros = ?, result_json = ? WHERE id = ?").bind(update.status, update.providerId || null, update.inputTokens || 0, update.outputTokens || 0, update.costMicros || 0, JSON.stringify(update.result), id)];
  for (const attempt of attempts) statements.push(d1.prepare("INSERT OR REPLACE INTO generation_attempts (id, run_id, attempt_number, result, fingerprint, repair, checks_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(`${id}:${attempt.attempt}`, id, Number(attempt.attempt), String(attempt.result), String(attempt.fingerprint), String(attempt.repair), JSON.stringify(attempt.evidence || result.checks || []), now));
  if (result.evidenceMode) statements.push(d1.prepare("INSERT INTO gate_evidence (id, run_id, mode, schema, artifact_digest, report_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(randomUUID(), id, String(result.evidenceMode), "designos.artifact-evidence/v1", null, JSON.stringify(result.checks || []), now));
  await d1.batch(statements);
}

export async function runsFor(userId: string, projectId?: string): Promise<RunRecord[]> {
  const d1 = await db(); if (!d1) return memory.runsFor(userId, projectId);
  const where = projectId ? "user_id = ? AND project_id = ?" : "user_id = ?";
  const statement = d1.prepare(`SELECT id, user_id AS userId, project_id AS projectId, idempotency_key AS idempotencyKey, status, brief, system_id AS systemId, variation, provider_id AS providerId, input_tokens AS inputTokens, output_tokens AS outputTokens, cost_micros AS costMicros, created_at AS createdAt, result_json AS resultJson FROM generation_runs WHERE ${where} ORDER BY created_at DESC`);
  return (await (projectId ? statement.bind(userId, projectId) : statement.bind(userId)).all<RunRecord>()).results;
}

export const replayResult = memory.replayResult;
