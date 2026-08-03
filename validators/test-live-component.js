#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const live = require('../bin/live-director');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-live-component-'));
const source = path.join(temp, 'src/component.html');
const preview = path.join(temp, 'dist/index.html');
const build = path.join(temp, 'build.js');
fs.mkdirSync(path.dirname(source), { recursive: true });
fs.mkdirSync(path.dirname(preview), { recursive: true });
fs.mkdirSync(path.join(temp, '.designos'), { recursive: true });
const original = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Live component</title>
<style>*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui}section{padding:24px}button{min-width:56px;min-height:56px}button:focus-visible{outline:3px solid currentColor;outline-offset:3px}</style>
<body><main><section id="hero"><h1>Inspectable decision</h1><p>Existing product copy stays intact.</p><div class="proof" data-proof>Verified fixture</div><button>Secondary</button><button class="primary">Primary</button></section></main></body></html>`;
fs.writeFileSync(source, original);
fs.writeFileSync(build, `const fs=require('fs'),path=require('path');fs.mkdirSync(path.join(__dirname,'dist'),{recursive:true});fs.copyFileSync(path.join(__dirname,'src/component.html'),path.join(__dirname,'dist/index.html'));`);
fs.writeFileSync(path.join(temp, '.designos/config.json'), JSON.stringify({
  live: { buildCommand: [process.execPath, 'build.js'], previewTarget: 'dist/index.html' },
}, null, 2));
require('child_process').execFileSync(process.execPath, [build], { cwd: temp });

live.initSession(preview, temp);
live.annotate(preview, {
  selector: '#hero',
  sourceMarker: 'src/component.html:3:13',
  classification: 'Hierarchy weak',
  note: 'Exercise a source-mapped component transaction',
}, temp);
const diff = live.variantDiff(preview, 'b', temp);
assert.strictEqual(diff.framework, 'html');
assert.strictEqual(diff.diffs.slotStructure.changed, true);
assert.strictEqual(diff.diffs.copyHierarchy.value, 'proof-headline-support');
assert.strictEqual(diff.diffs.ctaOrder.value, 'primary-first');
assert.strictEqual(diff.diffs.motion.changed, true);
assert.strictEqual(diff.diffs.responsive.changed, true);
assert.strictEqual(diff.diffs.accessibility.changed, true);
assert.strictEqual(diff.diffs.performance.changed, true);
assert.deepStrictEqual(live.setLocks(preview, { route: true, component: true }, temp), {
  route: true, component: true,
});
const studio = live.directorHtml(preview);
for (const contract of [
  'data-variant=', '/api/accept', '/api/reject', '/api/rollback', '/api/merge',
  'Component boundary', 'Semantic diff', 'Route lock', 'Component lock',
]) assert(studio.includes(contract), `studio missing ${contract}`);
const transaction = live.acceptVariant(preview, 'b', 'Component AST acceptance fixture', temp);
assert.strictEqual(transaction.componentNative, true);
assert.strictEqual(transaction.target, source);
assert(Object.values(transaction.componentTransform.changes).every(Boolean));
assert(transaction.componentTransform.impact.accessibility);
assert(transaction.componentTransform.impact.performance);
assert(transaction.componentTransform.impact.proofProvenance);
assert(transaction.acceptanceGates.browser.passed);
assert(transaction.acceptanceGates.accessibility.passed);
assert(transaction.acceptanceGates.motion.passed);
assert(transaction.acceptanceGates.performance.passed);
const transformed = fs.readFileSync(source, 'utf8');
assert(transformed.includes('data-slot="copy"'));
assert(transformed.includes('data-proof-placement="before-copy"'));
assert(transformed.includes('data-direction="audience-led"'));
assert(transformed.includes('--designos-direction-gap'));
assert(transformed.includes('data-motion-graph='));
assert(transformed.indexOf('class="primary"') < transformed.indexOf('>Secondary</button>'));
const rollback = live.rollback(preview, temp);
assert.strictEqual(rollback.id, transaction.id);
assert.strictEqual(fs.readFileSync(source, 'utf8'), original);
assert.strictEqual(live.detectFramework('/app/page.tsx'), 'next');
assert.strictEqual(live.detectFramework('/src/App.vue'), 'vue');
assert.strictEqual(live.detectFramework('/src/routes/+page.svelte'), 'sveltekit');
assert.strictEqual(live.detectFramework('/src/pages/index.astro'), 'astro');

for (const [relative, framework] of [
  ['src/App.jsx', 'react'],
  ['src/App.vue', 'vue'],
  ['src/routes/+page.svelte', 'sveltekit'],
  ['src/pages/index.astro', 'astro'],
  ['app/page.tsx', 'next'],
]) {
  const file = path.join(temp, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '<section id="mapped">Mapped component</section>');
  const resolved = live.resolveComponentSource({ source: preview }, original, {
    selector: '#mapped', sourceMarker: `${relative}:1:1`,
  });
  assert.strictEqual(resolved.file, file);
  assert.strictEqual(live.detectFramework(resolved.file), framework);
  assert.strictEqual(resolved.confidence, 1);
}

const plain = path.join(temp, 'plain.html');
fs.writeFileSync(plain, original);
live.initSession(plain, temp);
live.annotate(plain, {
  selector: '#hero',
  classification: 'Too generic',
  note: 'Exercise conflict-safe generated/manual merge',
}, temp);
const merged = live.mergeManualWithVariant(plain, 'a', [{
  search: 'Existing product copy stays intact.',
  replace: 'Manual copy survives the generated structure.',
}], 'Merged fixture', temp);
assert.strictEqual(merged.type, 'variant-manual-merge');
assert.strictEqual(merged.conflicts.length, 0);
assert(Object.values(merged.acceptanceGates).every(gate => gate.passed));
assert(fs.readFileSync(plain, 'utf8').includes('Manual copy survives the generated structure.'));
live.rollback(plain, temp);
assert.strictEqual(fs.readFileSync(plain, 'utf8'), original);

fs.rmSync(temp, { recursive: true, force: true });
console.log('live-component: source-mapped AST transaction, build gate, acceptance and rollback clean');
