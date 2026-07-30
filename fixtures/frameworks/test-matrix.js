#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright');
const { TraceMap, eachMapping } = require('@jridgewell/trace-mapping');
const live = require('../../bin/live-director');
const { RECIPES } = require('../../runtime/motion/recipes');
const { recipeInitialState, recipeState } = require('../../runtime/motion/controller');

const ROOT = path.resolve(__dirname, '../..');
const MATRIX = __dirname;
const DIST = path.join(__dirname, 'dist');
const stacks = ['vanilla', 'react', 'motion', 'gsap', 'vue', 'svelte'];
const build = spawnSync(process.execPath, [path.join(__dirname, 'build-matrix.js')], { cwd: ROOT, encoding: 'utf8' });
if (build.status) {
  process.stderr.write(build.stderr || build.stdout);
  process.exit(build.status || 1);
}
process.stdout.write(build.stdout);
for (const [stack, sourceSuffix] of [
  ['react', 'react/entry.jsx'],
  ['vue', 'vue/entry.js'],
  ['svelte', 'svelte/App.svelte'],
]) {
  const mapFile = path.join(DIST, stack, 'bundle.js.map');
  const traceMap = new TraceMap(fs.readFileSync(mapFile, 'utf8'));
  let generated = null;
  eachMapping(traceMap, mapping => {
    if (!generated && mapping.source?.replaceAll('\\', '/').endsWith(sourceSuffix)) generated = mapping;
  });
  if (!generated) throw new Error(`${stack}: source map has no mapping for ${sourceSuffix}`);
  const target = path.join(DIST, stack, 'index.html');
  const resolved = live.resolveComponentSource({ source: target }, fs.readFileSync(target, 'utf8'), {
    selector: '#run',
    generatedSourceMap: {
      map: mapFile,
      line: generated.generatedLine,
      column: generated.generatedColumn,
    },
  });
  const expected = path.join(MATRIX, sourceSuffix);
  if (resolved.kind !== 'source-map' || resolved.file !== expected) {
    throw new Error(`${stack}: source-map resolution expected ${expected}, received ${resolved.file}`);
  }
  console.log(`  ✓ ${stack} source map → ${path.relative(ROOT, resolved.file)}`);
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.map': 'application/json' };
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
  const requested = pathname === '/' ? '/vanilla/index.html' : pathname;
  const file = path.resolve(DIST, `.${requested}`);
  if (!file.startsWith(`${DIST}${path.sep}`) || !fs.existsSync(file)) { response.statusCode = 404; return response.end('not found'); }
  response.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});
(async () => {
  await new Promise(resolve => server.listen(43181, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  let assertions = 0;
  let combinations = 0;
  try {
    for (const stack of stacks) for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      const errors = [];
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('pageerror', error => errors.push(error.message));
      for (const recipe of RECIPES) {
        errors.length = 0;
        const label = `${stack}/${reducedMotion}/${recipe.id}`;
        await page.goto(`http://127.0.0.1:43181/${stack}/index.html?recipe=${recipe.id}`, { waitUntil: 'networkidle' });
        try {
          await page.waitForFunction(() => window.__designosReady === true, null, { timeout: 5000 });
        } catch {
          throw new Error(`${label}: fixture did not mount${errors.length ? `; ${errors.join('; ')}` : ''}`);
        }
        const button = page.locator('#run');
        const box = await button.boundingBox();
        if (!box || box.width < 44 || box.height < 44) throw new Error(`${label}: target below 44×44`);
        const source = await button.getAttribute('data-designos-source');
        if (!source) throw new Error(`${label}: source marker missing`);

        const mounted = await page.evaluate(() => window.__designosAdapter.snapshot());
        if (mounted.listenerCount !== 1 || mounted.destroyed) throw new Error(`${label}: mount/listener contract failed`);
        const contract = await page.evaluate(() =>
          ['mount', 'play', 'reverse', 'cancel', 'update', 'destroy']
            .every(method => typeof window.__designosAdapter[method] === 'function'));
        if (!contract) throw new Error(`${label}: MotionController interface is incomplete`);

        const phaseAfterClick = await page.evaluate(() => {
          document.querySelector('#run').click();
          return window.__designosAdapter.snapshot().phase;
        });
        if (phaseAfterClick !== 'running' && reducedMotion !== 'reduce') throw new Error(`${label}: click listener did not start run`);
        await page.waitForFunction(() => window.__designosAdapter.snapshot().phase === 'settled');
        const final = await page.evaluate(() => window.__designosAdapter.snapshot());
        const expected = recipeState(recipe.id);
        for (const key of ['x', 'y', 'scaleX', 'scaleY', 'opacity', 'progress', 'value']) {
          if (Math.abs(final.state[key] - expected[key]) > 0.001) throw new Error(`${label}: final ${key} was ${final.state[key]}, expected ${expected[key]}`);
        }
        if (!final.computed.transform || final.computed.opacity === '') throw new Error(`${label}: computed final style was not measurable`);
        if (final.reduced !== (reducedMotion === 'reduce')) throw new Error(`${label}: reduced-motion state mismatch`);

        const reversed = await page.evaluate(() => window.__designosAdapter.reverse());
        const expectedInitial = recipeInitialState(recipe.id);
        for (const key of ['x', 'y', 'scaleX', 'scaleY', 'opacity', 'progress', 'value']) {
          if (Math.abs(reversed.state[key] - expectedInitial[key]) > 0.001) throw new Error(`${label}: reverse did not restore ${key}`);
        }

        const played = await page.evaluate(expectedState => {
          window.__designosAdapter.update({ x: expectedState.x, event: 'pointerup' });
          return window.__designosAdapter.play();
        }, expected);
        if (played.status !== 'completed' || !played.stateGraph) throw new Error(`${label}: play/update/state-graph contract failed`);
        await page.evaluate(() => window.__designosAdapter.reverse());

        await page.evaluate(() => {
          window.__designosPendingRun = window.__designosAdapter.play();
        });
        await page.waitForTimeout(reducedMotion === 'reduce' ? 0 : 12);
        await page.evaluate(() => window.__designosAdapter.cancel());
        const cancelled = await page.evaluate(async () => {
          await window.__designosPendingRun;
          return window.__designosAdapter.snapshot();
        });
        if (reducedMotion !== 'reduce' && cancelled.phase !== 'cancelled') throw new Error(`${label}: active run was not cancellable`);

        const adapter = await page.evaluate(async () => {
          const before = window.__designosAdapter;
          window.__designosUnmount();
          await Promise.resolve();
          return before.snapshot();
        });
        if (!adapter.destroyed || adapter.listenerCount !== 0) throw new Error(`${label}: unmount leaked event listeners`);
        if (errors.length) throw new Error(`${label}: ${errors.join('; ')}`);
        assertions += reducedMotion === 'reduce' ? 19 : 20;
        combinations += 1;
      }
      console.log(`  ✓ ${stack} / ${reducedMotion} / ${RECIPES.length} recipes`);
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log(`framework-matrix: ${combinations} adapter fixtures (${RECIPES.length} recipes × ${stacks.length} stacks × 2 motion modes), ${assertions} browser assertions + 3 source-map resolutions clean`);
})().catch(error => { console.error(error); server.close(); process.exit(1); });
