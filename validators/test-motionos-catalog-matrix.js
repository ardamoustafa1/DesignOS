#!/usr/bin/env node
'use strict';

const assert = require('assert');
const http = require('http');
const path = require('path');
const esbuild = require('esbuild');
const { chromium } = require('playwright');
const { RECIPES } = require('../runtime/motion/catalog');
const { STACKS, matrix } = require('../runtime/motion/catalog-adapters');

const root = path.resolve(__dirname, '..');
const runtimeDirectory = path.join(root, 'runtime/motion');

async function compileAdapters() {
  const entries = matrix();
  assert.strictEqual(entries.length, 720);
  for (const entry of entries) {
    await esbuild.build({
      stdin: {
        contents: entry.source,
        resolveDir: runtimeDirectory,
        sourcefile: `${entry.stack}/${entry.recipe}.js`,
        loader: 'js',
      },
      bundle: true,
      write: false,
      format: 'esm',
      platform: 'browser',
      external: ['react', 'vue', 'svelte', 'motion', 'gsap'],
      logLevel: 'silent',
    });
  }
  return entries.length;
}

async function browserHarness() {
  const result = await esbuild.build({
    stdin: {
      contents: `const {RECIPES}=require('./catalog');const {mountMotionRecipe}=require('./motionos-runtime');window.__motionos={RECIPES,mountMotionRecipe};`,
      resolveDir: runtimeDirectory,
      sourcefile: 'motionos-browser-harness.js',
      loader: 'js',
    },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    logLevel: 'silent',
  });
  return result.outputFiles[0].text;
}

(async () => {
  const compiled = await compileAdapters();
  const bundle = await browserHarness();
  const server = http.createServer((request, response) => {
    if (request.url === '/bundle.js') {
      response.setHeader('content-type', 'text/javascript');
      return response.end(bundle);
    }
    response.setHeader('content-type', 'text/html');
    response.end('<!doctype html><html><body><main id="target"></main><script src="/bundle.js"></script></body></html>');
  });
  await new Promise(resolve => server.listen(43194, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  let browserRuns = 0;
  try {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:43194/');
      const outcomes = await page.evaluate(async () => {
        const target = document.querySelector('#target');
        const values = [];
        for (const contract of window.__motionos.RECIPES) {
          const destroy = window.__motionos.mountMotionRecipe(target, contract);
          await new Promise(resolve => requestAnimationFrame(resolve));
          const mounted = target.dataset.motionRecipe === contract.id;
          const reduced = target.dataset.motionReduced === 'true';
          destroy();
          values.push({ mounted, reduced, cleaned: !target.dataset.motionRecipe && !target.dataset.motionReduced });
        }
        return values;
      });
      assert.strictEqual(outcomes.length, RECIPES.length);
      assert(outcomes.every(item => item.mounted && item.cleaned));
      assert(outcomes.every(item => item.reduced === (reducedMotion === 'reduce')));
      browserRuns += outcomes.length;
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`motionos-catalog-matrix: ${compiled} generated adapters (${RECIPES.length} recipes × ${STACKS.length} stacks) compiled; ${browserRuns} Chromium mount/cleanup runs clean`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
