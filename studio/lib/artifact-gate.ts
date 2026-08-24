import type { GateCheck } from "./studio-pipeline";

type WorkerReport = { schema: string; isolated: boolean; passed: boolean; artifactDigest: string; checks: GateCheck[] };

function bytesToHex(bytes: Uint8Array) { return [...bytes].map((value) => value.toString(16).padStart(2, "0")).join(""); }

async function sign(secret: string, timestamp: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`))));
}

export async function collectArtifactEvidence(artifact: string): Promise<{ mode: "isolated-worker" | "local-static" | "required-worker-missing"; checks: GateCheck[]; report?: WorkerReport }> {
  const endpoint = process.env.DESIGNOS_GATE_WORKER_URL?.trim();
  const secret = process.env.DESIGNOS_GATE_WORKER_SECRET?.trim();
  if (!endpoint || !secret) {
    if (process.env.DESIGNOS_REQUIRE_GATE_WORKER === "true") return { mode: "required-worker-missing", checks: [{ id: "isolated-artifact-evidence", label: "Isolated artifact evidence", status: "NOT_ASSESSED", score: null, evidence: "Required gate worker is not configured; artifact remains withheld" }] };
    return { mode: "local-static", checks: [] };
  }
  const url = new URL("/v1/gate", endpoint);
  if (url.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(url.hostname)) throw new Error("Gate worker must use HTTPS outside local development.");
  const body = JSON.stringify({ artifact });
  const timestamp = String(Date.now());
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", "x-designos-timestamp": timestamp, "x-designos-signature": await sign(secret, timestamp, body) }, body, signal: AbortSignal.timeout(60_000) });
  if (!response.ok) {
    const failure = await response.text();
    throw new Error(`Artifact gate worker failed with ${response.status}: ${failure.slice(0, 300)}`);
  }
  const report = await response.json() as WorkerReport;
  if (report.schema !== "designos.artifact-evidence/v1" || report.isolated !== true || !Array.isArray(report.checks)) throw new Error("Artifact gate worker returned an invalid evidence envelope.");
  return { mode: "isolated-worker", checks: report.checks, report };
}
