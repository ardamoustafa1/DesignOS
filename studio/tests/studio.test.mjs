import assert from "node:assert/strict";
import test from "node:test";

let worker;

async function getWorker() {
  if (!worker) {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
    worker = (await import(workerUrl.href)).default;
  }
  return worker;
}

async function request(path, init = {}) {
  const runtime = await getWorker();
  return runtime.fetch(
    new Request(`http://localhost${path}`, init),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete Studio workbench", async () => {
  const response = await request("/", { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>DesignOS Studio — Brief to gated prototype<\/title>/i);
  assert.match(html, /Describe the result/);
  assert.match(html, /Generate gated prototype/);
  assert.match(html, /No provider key accepted/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("generation repairs a hidden draft and reveals only the passing artifact", async () => {
  const response = await request("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "test-generation" },
    body: JSON.stringify({
      brief: "A launch page for a climate reporting API used by operations leaders.",
      systemId: "kiln",
      variation: 0,
    }),
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.mechanicalGate, "PASS");
  assert.equal(payload.releaseDecision, "REVEALED");
  assert.equal(payload.finalDesignScore, "NOT_ASSESSED");
  assert.equal(payload.attempts, 2);
  assert.equal(payload.attemptLog[0].result, "FAIL");
  assert.equal(payload.attemptLog[1].result, "PASS");
  assert.ok(payload.artifact.length > 10_000);
  assert.equal(new Set([...payload.artifact.matchAll(/data-motion-role="([^"]+)"/g)].map((match) => match[1])).size, 4);
  assert.match(payload.artifact, /Content-Security-Policy/);
  assert.match(payload.artifact, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(payload.artifact, /(?:src|href)="https?:\/\//i);
  assert.ok(payload.checks.every((check) => check.status === "PASS" && check.score >= 95));
});

test("the same brief can cycle through three structural families", async () => {
  const families = [];
  for (const variation of [0, 1, 2]) {
    const response = await request("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `variant-${variation}` },
      body: JSON.stringify({
        brief: "A technical launch page for an evidence platform serving compliance teams.",
        systemId: "kiln",
        variation,
      }),
    });
    const payload = await response.json();
    families.push(payload.family);
  }
  assert.deepEqual(families, ["editorial-ledger", "split-proof", "rail-story"]);
});

test("client provider controls are rejected before quota or model access", async () => {
  const response = await request("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "provider-injection" },
    body: JSON.stringify({
      brief: "A sufficiently detailed product launch brief for a technical audience.",
      systemId: "kiln",
      variation: 0,
      apiKey: "must-never-be-accepted",
    }),
  });
  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.match(payload.error, /not accepted/);
  assert.equal(payload.artifact, undefined);
});

test("invalid briefs are withheld without an artifact", async () => {
  const response = await request("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "bad-brief" },
    body: JSON.stringify({ brief: "too short", systemId: "kiln", variation: 0 }),
  });
  assert.equal(response.status, 422);
  const payload = await response.json();
  assert.equal(payload.artifact, undefined);
});
