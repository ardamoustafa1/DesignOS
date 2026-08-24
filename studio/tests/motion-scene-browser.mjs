#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

const studioRoot = new URL("../", import.meta.url);
const workerFile = new URL("../dist/server/index.js", import.meta.url);
if (!existsSync(workerFile)) {
  execFileSync("npm", ["run", "build"], { cwd: studioRoot, stdio: "inherit" });
}
const workerUrl = new URL(workerFile);
workerUrl.searchParams.set("motion-browser", `${process.pid}-${Date.now()}`);
const worker = (await import(workerUrl.href)).default;

async function generate(variation, intent) {
  const response = await worker.fetch(
    new Request("http://localhost/api/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `motion-browser-${intent}`,
      },
      body: JSON.stringify({
        brief: `An art-directed ${intent} experience with a complete inspectable product story.`,
        systemId: "kiln",
        variation: variation % 3,
      }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.releaseDecision, "REVEALED");
  return payload;
}

const browser = await chromium.launch({ headless: true });
try {
  const cases = [
    ["webgl-field", 1, "cinematic atmosphere premium media gallery visual launch"],
    ["spatial-orbit", 1, "product platform technical architecture inspectable system 3d"],
    ["particle-field", 0, "network signals community creative portfolio synthesis ambient"],
    ["vector-morph", 0, "brand identity workflow transformation continuity logo process"],
    ["signal-trace", 2, "evidence data analytics risk security climate compliance trace"],
    ["kinetic-type", 0, "editorial story message campaign writing chapter narrative"],
  ];
  const specimens = new Map();
  for (const [expectedEngine, variation, intent] of cases) {
    const payload = await generate(variation, intent);
    assert.equal(payload.motionEngine, expectedEngine);
    specimens.set(payload.motionEngine, payload);
  }
  assert.deepEqual(
    [...specimens.keys()].sort(),
    ["kinetic-type", "particle-field", "signal-trace", "spatial-orbit", "vector-morph", "webgl-field"],
  );

  const selectors = {
    "webgl-field": "[data-scene-canvas]",
    "spatial-orbit": "[data-scene-canvas]",
    "particle-field": "[data-scene-canvas]",
    "vector-morph": "[data-scene-vector]",
    "signal-trace": "[data-scene-signal]",
    "kinetic-type": "[data-scene-type]",
  };

  for (const [engine, payload] of specimens) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(payload.artifact, { waitUntil: "load" });
    await page.waitForFunction(
      (expected) =>
        document.body.dataset.motionRuntimeState === "mounted" &&
        document.body.dataset.motionEngineActive === expected,
      engine,
    );
    assert.equal(await page.locator("body").getAttribute("data-motion-engine"), engine);
    assert.equal(await page.locator(selectors[engine]).count(), 1);
    assert.deepEqual(errors, []);
    await page.close();
  }

  const reducedPayload = specimens.values().next().value;
  const reducedContext = await browser.newContext({ reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.setContent(reducedPayload.artifact, { waitUntil: "load" });
  await reducedPage.waitForFunction(
    () => document.body.dataset.motionRuntimeState === "reduced",
  );
  assert.equal(
    await reducedPage.locator(".scene-engine").evaluate((node) => getComputedStyle(node).display),
    "none",
  );
  await reducedContext.close();
  console.log("studio-motion-scenes: six authored renderer families mounted without page errors; reduced-motion fallback clean");
} finally {
  await browser.close();
}
