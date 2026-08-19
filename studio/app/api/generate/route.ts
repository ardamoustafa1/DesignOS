import { runPipeline } from "../../../lib/studio-pipeline";

type QuotaRecord = { count: number; resetAt: number };

declare global {
  var __designosStudioQuota: Map<string, QuotaRecord> | undefined;
}

const quota = globalThis.__designosStudioQuota ?? new Map<string, QuotaRecord>();
globalThis.__designosStudioQuota = quota;

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("cf-connecting-ip") || "local-demo";
}

function reserve(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const current = quota.get(key);
  const record = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + WINDOW_MS }
    : current;

  if (record.count >= LIMIT) {
    return { allowed: false as const, remaining: 0, resetAt: record.resetAt };
  }
  record.count += 1;
  quota.set(key, record);
  return { allowed: true as const, remaining: LIMIT - record.count, resetAt: record.resetAt };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const forbidden = ["apiKey", "providerKey", "baseUrl", "provider", "model"].find((key) => key in payload);
  if (forbidden) {
    return Response.json(
      { error: `Client-controlled provider field '${forbidden}' is not accepted.` },
      { status: 400 },
    );
  }

  const allowed = new Set(["brief", "systemId", "variation"]);
  const unknown = Object.keys(payload).find((key) => !allowed.has(key));
  if (unknown) {
    return Response.json({ error: `Unknown field '${unknown}'.` }, { status: 400 });
  }

  const brief = typeof payload.brief === "string" ? payload.brief.trim().replace(/\s+/g, " ") : "";
  const systemId = payload.systemId;
  const variation = Number.isInteger(payload.variation) ? Number(payload.variation) : 0;

  if (brief.length < 24 || brief.length > 640) {
    return Response.json({ error: "Brief must contain 24–640 characters." }, { status: 422 });
  }
  if (systemId !== "kiln") {
    return Response.json({ error: "Only the conformance-checked Kiln package is available in this MVP." }, { status: 422 });
  }
  if (variation < 0 || variation > 2) {
    return Response.json({ error: "Variation must be 0, 1, or 2." }, { status: 422 });
  }

  const reservation = reserve(request);
  if (!reservation.allowed) {
    return Response.json(
      {
        error: "Demo generation quota reached. No provider charge was attempted.",
        quota: { remaining: 0, limit: LIMIT, resetAt: reservation.resetAt },
      },
      { status: 429, headers: { "retry-after": String(Math.ceil((reservation.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    const result = await runPipeline(brief, variation);
    return Response.json({
      ...result,
      quota: { remaining: reservation.remaining, limit: LIMIT, resetAt: reservation.resetAt },
      costControl: {
        planningCalls: 1,
        repairLimit: 3,
        clientProviderCredentialsAccepted: false,
      },
    }, { status: result.releaseDecision === "REVEALED" ? 200 : 422 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    return Response.json(
      {
        error: message,
        releaseDecision: "WITHHELD",
        artifact: null,
        quota: { remaining: reservation.remaining, limit: LIMIT, resetAt: reservation.resetAt },
      },
      { status: 502 },
    );
  }
}
