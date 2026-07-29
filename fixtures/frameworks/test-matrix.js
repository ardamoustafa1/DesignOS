#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright');
const { TraceMap, eachMapping } = require('@jridgewell/trace-mapping');
const live = require('../../bin/live-director');

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
  const requested = request.url === '/' ? '/vanilla/index.html' : request.url;
  const file = path.resolve(DIST, `.${requested}`);
  if (!file.startsWith(`${DIST}${path.sep}`) || !fs.existsSync(file)) { response.statusCode = 404; return response.end('not found'); }
  response.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});
(async () => {
  await new Promise(resolve => server.listen(43181, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  let assertions = 0;
  try {
    for (const stack of stacks) for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      const errors = [];
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:43181/${stack}/index.html`, { waitUntil: 'networkidle' });
      const button = page.locator('#run');
      const box = await button.boundingBox();
      if (!box || box.width < 44 || box.height < 44) throw new Error(`${stack}/${reducedMotion}: target below 44×44`);
      await button.click();
      await page.waitForFunction(() => document.querySelector('#run')?.dataset.complete === 'true', null, { timeout: 5000 });
      const source = await button.getAttribute('data-designos-source');
      if (!source) throw new Error(`${stack}: source marker missing`);
      if (errors.length) throw new Error(`${stack}/${reducedMotion}: ${errors.join('; ')}`);
      assertions += 4;
      console.log(`  ✓ ${stack} / ${reducedMotion}`);
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log(`framework-matrix: ${stacks.length} stacks × 2 motion modes, ${assertions} browser assertions + 3 source-map resolutions clean`);
})().catch(error => { console.error(error); server.close(); process.exit(1); });
