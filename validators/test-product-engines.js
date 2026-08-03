#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { RULES, PROVIDERS } = require('./rule-registry');
const { RECIPES, STACKS, adapterSource } = require('../runtime/motion/recipes');
const { graphNodes, COMPOSITIONS } = require('../bin/intelligence');
const live = require('../bin/live-director');
const { motionLab } = require('../bin/motion-lab');
const { verifyExternalRegistry } = require('../bin/external-eval');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin/designos.js');
const run = args => spawnSync(process.execPath, [CLI, ...args], { cwd: ROOT, encoding: 'utf8' });

assert(RULES.length >= 27, 'unified registry must cover the P0/P1 rule contract');
for (const rule of RULES) {
  assert(rule.id && rule.category && rule.severity && rule.engines.length);
  assert(rule.message && rule.fix && rule.module && rule.exception && rule.fixture);
  assert(fs.existsSync(path.join(ROOT, rule.fixture)), `${rule.id} fixture must exist`);
}
assert(PROVIDERS.length >= 7, 'central registry must own every validator provider');
for (const provider of PROVIDERS) {
  assert(provider.id && provider.command && provider.capabilities.length && Array.isArray(provider.ruleIds), 'provider metadata must be executable and mapped');
  for (const id of provider.ruleIds) assert(RULES.some(rule => rule.id === id), `${provider.id} maps unknown rule ${id}`);
}

const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/registry/expected.json'), 'utf8'));
for (const [fixture, ids] of Object.entries(expected)) {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'check-registry.js'),
    path.join(__dirname, 'fixtures/registry', fixture), '--json'], { cwd: ROOT, encoding: 'utf8' });
  const report = JSON.parse(result.stdout);
  for (const id of ids) assert(report.findings.some(item => item.id === id), `${fixture} must produce ${id}`);
}

assert.strictEqual(RECIPES.length, 15);
assert.deepStrictEqual(STACKS, ['vanilla', 'react', 'motion', 'gsap', 'vue', 'svelte']);
for (const recipe of RECIPES) for (const stack of STACKS) {
  assert(adapterSource(recipe.id, stack).includes(recipe.id));
}
assert.strictEqual(COMPOSITIONS.length, 10);
const nodes = graphNodes();
for (const type of ['sector', 'surface', 'component', 'platform', 'motion', 'validator', 'recipe', 'golden']) {
  assert(nodes.some(node => node.type === type), `knowledge graph needs ${type} nodes`);
}

for (const [command, required] of [
  [['motion-decide', 'command palette', '--frequency', 'very-high', '--initiator', 'keyboard'], '"decision": "do-not-animate"'],
  [['knowledge', 'fintech transaction success motion', '--platform', 'ios'], '"nodes"'],
  [['coverage'], '"capabilities"'],
  [['signature', 'developer tool', '--material', 'deployment timeline'], '"material-led"'],
  [['compose', 'analytics dashboard', '--density', '9'], '"selected"'],
  [['asset-direct', 'product screenshot', '--surface', 'web'], '"fileSizeBudgetBytes"'],
  [['motion-recipe', 'momentum-projection', '--stack', 'react'], 'useDesignOSMotion'],
]) {
  const result = run(command);
  assert.strictEqual(result.status, 0, `${command[0]} should exit cleanly: ${result.stderr}`);
  assert(result.stdout.includes(required), `${command[0]} should include ${required}`);
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-product-'));
const target = path.join(temp, 'index.html');
fs.writeFileSync(target, '<!doctype html><html><head></head><body><main><button id="go">Go</button></main></body></html>');
const session = live.initSession(target, temp);
assert(fs.existsSync(session.files.session));
const annotation = live.annotate(target, {
  selector: '#go', classification: 'Hierarchy weak', note: 'Primary action is visually flat',
  rect: { x: 0, y: 0, width: 80, height: 44 },
}, temp);
assert.strictEqual(annotation.source.line, 1);
const component = path.join(temp, 'src/App.vue');
const built = path.join(temp, 'dist/index.html');
fs.mkdirSync(path.dirname(component), { recursive: true });
fs.mkdirSync(path.dirname(built), { recursive: true });
fs.writeFileSync(component, '<template><button>Go</button></template>');
fs.writeFileSync(built, '<!doctype html><html><head></head><body><button data-designos-source="src/App.vue:1:11">Go</button></body></html>');
const builtSession = live.initSession(built, temp);
const mapped = live.annotate(built, {
  selector: 'button', sourceMarker: 'src/App.vue:1:11',
  classification: 'Hierarchy weak', note: 'Vue runtime marker',
}, temp);
assert.strictEqual(mapped.source.file, component);
assert.strictEqual(mapped.source.kind, 'runtime-marker');
const sourceMap = path.join(temp, 'dist/app.js.map');
fs.writeFileSync(sourceMap, JSON.stringify({
  version: 3, file: 'app.js', sources: ['../src/App.vue'], names: [], mappings: 'AAAA',
}));
const traced = live.resolveComponentSource(builtSession.files, fs.readFileSync(built, 'utf8'), {
  selector: 'button', generatedSourceMap: { map: sourceMap, line: 1, column: 0 },
});
assert.strictEqual(traced.file, component);
assert.strictEqual(traced.kind, 'source-map');
assert.deepStrictEqual(
  live.performanceRegressions(
    { transferBytes: 100, domContentLoadedMs: 100, loadMs: 100, longTaskMs: 0, layoutShift: 0 },
    { transferBytes: 100, domContentLoadedMs: 100, loadMs: 100, longTaskMs: 250, layoutShift: 0 },
    { transferBytes: 1000, domContentLoadedMs: 1000, loadMs: 1000, longTaskMs: 200, layoutShift: .1 },
  ).map(item => item.metric),
  ['longTaskMs'],
);
assert(live.contextualVariants(temp, annotation).c.provenance.compiler.includes('brief-compiler'));
const injected = live.injectVariant(fs.readFileSync(target, 'utf8'), '#go', 'b');
assert(injected.includes('data-designos-live="b"'));
assert(!injected.includes('<style data-designos-live'), 'Live Director must not fall back to CSS injection');
const componentSource = '<section id="hero"><p>Support</p><button>Later</button><div class="proof" data-proof>99%</div><button class="primary">Start</button><h2>Headline</h2></section>';
for (const id of ['a', 'b', 'c']) {
  const transformed = live.transformComponent(componentSource, '#hero', id);
  assert(Object.values(transformed.changes).every(Boolean), `${id}: every component transform dimension must be active`);
  for (const marker of ['data-slot="copy"', 'data-slot="proof"', 'data-slot="actions"', 'data-state=', 'data-motion=', 'data-responsive=', 'data-copy-hierarchy=', 'data-cta-order=', 'data-proof-placement=']) {
    assert(transformed.source.includes(marker), `${id}: missing ${marker}`);
  }
  assert(transformed.source.indexOf('class="primary"') < transformed.source.indexOf('>Later</button>'), `${id}: primary CTA must come first`);
}
for (const source of [
  'export default () => <section id="hero"><h2>JSX</h2><button>Go</button></section>;',
  '<template><section id="hero"><h2>Vue</h2><button>Go</button></section></template>',
  '<script>let ready=true;</script><section id="hero"><h2>Svelte</h2><button>Go</button></section>',
]) assert(live.transformComponent(source, '#hero', 'a').source.includes('data-designos-component'));
const lab = motionLab(target, ['--out', path.join(temp, 'lab.html')], temp);
assert(fs.existsSync(lab));
const labText = fs.readFileSync(lab, 'utf8');
for (const feature of ['0.25×', 'Frame +16.7ms', 'Easing curve', 'Spring response', 'Interaction recording', 'Full ↔ reduced', 'CDP trace profile', 'Dropped frames', 'Frame P50 / P95 / P99']) {
  assert(labText.includes(feature), `motion lab needs ${feature}`);
}
assert.strictEqual(verifyExternalRegistry(path.join(ROOT, 'evals/external/registry.json')).externalEval, false);
const isolated = JSON.parse(fs.readFileSync(path.join(ROOT, 'evals/isolated/registry-eval.json'), 'utf8'));
assert.strictEqual(isolated.isolatedRuleEval, true);
assert.strictEqual(isolated.externalEval, false);
for (const module of ['intelligence', 'motion', 'live', 'evidence', 'community', 'leader', 'system']) {
  assert(fs.existsSync(path.join(ROOT, `bin/cli/commands/${module}.js`)), `CLI command module missing: ${module}`);
}

console.log(`product-engines: ${RULES.length} rules, ${RECIPES.length * STACKS.length} adapters, ${nodes.length} graph nodes clean`);
