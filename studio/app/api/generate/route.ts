import { randomUUID } from "node:crypto";
import { runPipeline } from "../../../lib/studio-pipeline";
import { beginRun, completeRun, identityFor, recordCost, replayResult, reserve, usage } from "../../../lib/control-plane-store";
// proof-source: ../../../lib/certified-systems.json
import certifiedSystems from "../../../lib/certified-systems.json";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Request body must be an object." }, { status: 400 });
  const payload = body as Record<string, unknown>;
  const forbidden = ["apiKey", "providerKey", "baseUrl", "provider", "model"].find((key) => key in payload);
  if (forbidden) return Response.json({ error: `Client-controlled provider field '${forbidden}' is not accepted.` }, { status: 400 });
  const allowed = new Set(["brief", "systemId", "variation", "projectId"]);
  const unknown = Object.keys(payload).find((key) => !allowed.has(key));
  if (unknown) return Response.json({ error: `Unknown field '${unknown}'.` }, { status: 400 });

  const brief = typeof payload.brief === "string" ? payload.brief.trim().replace(/\s+/g, " ") : "";
  const variation = Number.isInteger(payload.variation) ? Number(payload.variation) : 0;
  const systemId = typeof payload.systemId === "string" ? payload.systemId : "";
  const projectId = typeof payload.projectId === "string" ? payload.projectId : undefined;
  if (brief.length < 24 || brief.length > 640) return Response.json({ error: "Brief must contain 24–640 characters." }, { status: 422 });
  if (!certifiedSystems.systems.some((system) => system.id === systemId)) return Response.json({ error: "This system has not passed the production certification ledger." }, { status: 422 });
  if (variation < 0 || variation > 2) return Response.json({ error: "Variation must be 0, 1, or 2." }, { status: 422 });

  let identity;
  try { identity = identityFor(request); }
  catch { return Response.json({ error: "Sign in is required before generation." }, { status: 401 }); }
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() || randomUUID();
  if (idempotencyKey.length > 128) return Response.json({ error: "Idempotency key is too long." }, { status: 400 });

  let run;
  try { run = await beginRun(identity.userId, { projectId, idempotencyKey, brief, systemId, variation }); }
  catch { return Response.json({ error: "Project was not found for this user." }, { status: 404 }); }
  if (run.replay) {
    const replay = replayResult(run.record);
    if (replay) return Response.json({ ...replay, idempotentReplay: true });
    return Response.json({ error: "The matching generation is still running.", runId: run.record.id }, { status: 409, headers: { "retry-after": "2" } });
  }

  const reservation = await reserve(identity.userId);
  if (!reservation.allowed) {
    await completeRun(run.record.id, { status: "QUOTA_REJECTED", result: { error: "Generation quota reached." } });
    return Response.json({ error: "Generation quota reached. No provider charge was attempted.", quota: reservation.usage }, { status: 429, headers: { "retry-after": String(Math.ceil((reservation.usage.resetAt - Date.now()) / 1000)) } });
  }

  try {
    const result = await runPipeline(brief, variation, systemId);
    await recordCost(identity.userId, result.usage.estimatedCostMicros, result.usage.inputTokens, result.usage.outputTokens);
    const responsePayload = { ...result, projectId: run.record.projectId, runId: run.record.id, identityMode: identity.mode, quota: await usage(identity.userId), costControl: { planningCalls: result.provider === "deterministic-demo" ? 0 : 1, repairLimit: 3, clientProviderCredentialsAccepted: false } };
    await completeRun(run.record.id, { status: result.releaseDecision, providerId: result.providerId, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, costMicros: result.usage.estimatedCostMicros, result: responsePayload });
    return Response.json(responsePayload, { status: result.releaseDecision === "REVEALED" ? 200 : 422 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    const responsePayload = { error: message, releaseDecision: "WITHHELD", artifact: null, projectId: run.record.projectId, runId: run.record.id, quota: await usage(identity.userId) };
    await completeRun(run.record.id, { status: "FAILED", result: responsePayload });
    return Response.json(responsePayload, { status: 502 });
  }
}
