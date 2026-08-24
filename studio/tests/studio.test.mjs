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
  assert.match(payload.artifact, /data-motion-scene="[^"]+"/);
  assert.match(payload.artifact, /data-motion-runtime="scene-graph"/);
  assert.match(payload.artifact, /data-motion-engine="(?:webgl-field|spatial-orbit|particle-field|vector-morph|signal-trace|kinetic-type)"/);
  assert.match(payload.artifact, /data-scene-(?:canvas|vector|signal|type)/);
  assert.equal(typeof payload.sceneId, "string");
  assert.equal(typeof payload.motionEngine, "string");
  assert.equal(payload.tournamentPolicy, "weighted-six-candidate-v1");
  assert.equal(payload.candidateTournament.length, 6);
  assert.equal(payload.candidateTournament[0].sceneId, payload.sceneId);
  assert.ok(payload.candidateTournament.every((candidate) => candidate.total >= 90));
  assert.match(payload.artifact, /const mountScene=/);
  assert.equal(payload.artifact.match(/data-motion-recipes="([^"]+)"/)[1].trim().split(/\s+/).length, 4);
  assert.match(payload.attemptLog[0].repair, /Finding-directed repair: animation-richness/);
  assert.match(payload.artifact, /Content-Security-Policy/);
  assert.match(payload.artifact, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(payload.artifact, /(?:src|href)="https?:\/\//i);
  assert.ok(payload.checks.every((check) => check.status === "PASS" && check.score >= 95));
});

test("motion catalog exposes twelve art-directed scenes across six real renderer families", async () => {
  const response = await request("/api/motion-scenes");
  const catalog = await response.json();
  assert.equal(response.status, 200);
  assert.equal(catalog.schema, "designos.motion-scenes/v1");
  assert.equal(catalog.total, 12);
  assert.equal(catalog.engineCount, 6);
  assert.equal(new Set(catalog.scenes.map((scene) => scene.id)).size, 12);
  assert.ok(catalog.scenes.every((scene) => scene.recipes.length === 4));
  assert.ok(catalog.scenes.every((scene) => scene.roles.length === 4));
  assert.ok(catalog.scenes.every((scene) => scene.signature && scene.productTruth && scene.fallback));
});

test("the same brief can cycle through three structural families", async () => {
  const catalog = await (await request("/api/systems")).json();
  const expected = catalog.systems.find((system) => system.id === "kiln").families;
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
  assert.deepEqual(families, expected);
  assert.equal(new Set(families).size, 3);
});

test("the certified catalog drives both the picker API and the compiler", async () => {
  const catalogResponse = await request("/api/systems");
  const catalog = await catalogResponse.json();
  assert.equal(catalogResponse.status, 200);
  assert.equal(catalog.total, 201);
  assert.ok(catalog.systems.every((system) => system.families.length === 3));

  const artifacts = [];
  for (const systemId of ["stripe", "aster-ledger"]) {
    const response = await request("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `system-${systemId}` },
      body: JSON.stringify({
        brief: "A decision-grade launch page for an evidence product used by operations leaders.",
        systemId,
        variation: 1,
      }),
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.systemId, systemId);
    assert.match(payload.artifact, new RegExp(`data-design-system="${systemId}"`));
    assert.match(payload.checks.find((check) => check.id === "brand-consistency").label, new RegExp(payload.systemName));
    artifacts.push(payload.artifact);
  }
  assert.notEqual(artifacts[0], artifacts[1]);
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

test("generation is idempotent and creates resumable project history", async () => {
  const headers = { "content-type": "application/json", "x-forwarded-for": "idempotent-user", "idempotency-key": "stable-run-001" };
  const body = JSON.stringify({ brief: "A portfolio for a motion designer showing verifiable process and final artifacts.", systemId: "kiln", variation: 2 });
  const first = await request("/api/generate", { method: "POST", headers, body });
  const firstPayload = await first.json();
  assert.equal(first.status, 200);
  const second = await request("/api/generate", { method: "POST", headers, body });
  const secondPayload = await second.json();
  assert.equal(second.status, 200);
  assert.equal(secondPayload.idempotentReplay, true);
  assert.equal(secondPayload.runId, firstPayload.runId);
  assert.equal(secondPayload.quota.used, firstPayload.quota.used);

  const projects = await request("/api/projects", { headers: { "x-forwarded-for": "idempotent-user" } });
  const history = await projects.json();
  assert.equal(projects.status, 200);
  assert.ok(history.projects.some((project) => project.id === firstPayload.projectId && project.selectedVariation === 2));
  assert.ok(history.runs.some((run) => run.id === firstPayload.runId && run.status === "REVEALED"));
});

test("project ownership is enforced server-side", async () => {
  const created = await request("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "owner-a" },
    body: JSON.stringify({ name: "Private project", brief: "A private launch brief with enough detail for a valid project record.", systemId: "kiln" }),
  });
  const { project } = await created.json();
  assert.equal(created.status, 201);
  assert.equal(project.systemId, "kiln");
  const stolen = await request("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "owner-b" },
    body: JSON.stringify({ brief: "A different user's attempt to mutate a private project through generation.", systemId: "kiln", variation: 0, projectId: project.id }),
  });
  assert.equal(stolen.status, 404);
});

test("status exposes quota and provider health without accepting client keys", async () => {
  const response = await request("/api/status", { headers: { "x-forwarded-for": "status-user" } });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.clientProviderCredentialsAccepted, false);
  assert.equal(payload.identityMode, "demo");
  assert.ok(Array.isArray(payload.providers));
  assert.equal(payload.quota.limit, 20);
  assert.equal(payload.certifiedSystemCount, 201);
});
