#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { createMotionController } = require('../runtime/motion/controller');
const { DEFAULT_GRAPH, compileMotionStateGraph, validateMotionStateGraph } = require('../runtime/motion/state-graph');
const { summarizeTrace } = require('../bin/motion-profiler');
const { VARIANT_TRANSFORMS, transformComponent } = require('../bin/live/component-transform');
const { scanGenome, compareGenome } = require('../bin/design-genome');
const { STACKS, compileComposition } = require('../bin/composition-compiler');
const { solveResponsiveConstraints } = require('../bin/responsive-constraint');
const { STATES, writeStateMatrix } = require('../bin/state-matrix');
const { runMutationSuite } = require('../bin/mutation-testing');
const { buildConsistencyGraph } = require('../bin/consistency-graph');
const { CAPABILITIES, buildNativeAdapters } = require('../runtime/native/adapters');
const esbuild = require('esbuild');
const { parse: parseVue, compileTemplate } = require('@vue/compiler-sfc');
const { compile: compileSvelte } = require('svelte/compiler');

const ROOT = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-leader-'));

class FakeTarget {
  constructor() {
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.listeners = new Map();
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  removeEventListener(type) { this.listeners.delete(type); }
  setAttribute(name, value) { this.attributes[name] = value; }
  animate(_frames, _options) {
    return { finished: Promise.resolve(), cancel() {} };
  }
}

(async () => {
  const target = new FakeTarget();
  const controller = createMotionController('spring-reversal');
  for (const method of ['mount', 'play', 'reverse', 'cancel', 'update', 'destroy']) {
    assert.strictEqual(typeof controller[method], 'function', `MotionController missing ${method}`);
  }
  controller.mount(target);
  const played = await controller.play({ x: 12 });
  assert.strictEqual(played.status, 'completed');
  controller.update({ event: 'pointerup', x: 8 });
  await controller.reverse();
  controller.cancel();
  controller.destroy();
  assert.strictEqual(controller.snapshot().listenerCount, 0);

  const graph = compileMotionStateGraph(DEFAULT_GRAPH);
  assert(graph.valid);
  assert.strictEqual(graph.createMachine().snapshot().state, 'idle');
  const invalid = JSON.parse(JSON.stringify(DEFAULT_GRAPH));
  invalid.states.loading.suppress = [];
  assert(validateMotionStateGraph(invalid).findings.some(item => item.code === 'loading-hover-conflict'));

  const profile = summarizeTrace([
    { name: 'RunTask', dur: 70000 }, { name: 'Layout', dur: 1000 },
    { name: 'Paint', dur: 1000 }, { name: 'CompositeLayers', dur: 1000 },
  ], {
    frameTimes: [16, 16, 34],
    inputToMotionLatencyMs: 8,
    settleTimeMs: 120,
    overshoot: .04,
    cancelResponseTimeMs: 12,
    listenerDelta: 0,
    heapDeltaBytes: 0,
    reducedMotion: 'full-motion-observed',
  }, 2);
  for (const field of ['averageFps', 'worstFrameMs', 'droppedFrameRatio', 'interaction', 'cleanup', 'reducedMotion']) {
    assert(field in profile, `Motion trace missing ${field}`);
  }
  assert.strictEqual(profile.rendering.compositeOnly, false);

  const component = `<section id="hero"><h1>Material</h1><p>Evidence-led copy.</p><div data-proof>Source</div><button class="primary">Act</button></section>`;
  for (const id of Object.keys(VARIANT_TRANSFORMS)) {
    const result = transformComponent(component, '#hero', id);
    assert(result.source.includes(`data-direction="${VARIANT_TRANSFORMS[id].direction}"`));
    assert(result.source.includes('--designos-direction-gap'));
    assert(result.impact.accessibility && result.impact.performance && result.impact.proofProvenance);
    for (const change of ['componentTree', 'designTokens', 'copyHierarchy', 'motionGraph', 'responsiveRules', 'accessibilityImpact', 'performanceImpact', 'proofProvenance']) {
      assert(result.changes[change], `${id} missing Live Director diff ${change}`);
    }
  }

  const genome = scanGenome(path.join(ROOT, 'starter/landing-page'));
  assert(genome.dialectFingerprint.length === 24);
  for (const field of ['colorTokens', 'typeScale', 'spacingScale', 'radii', 'shadows', 'borders', 'componentFamilies', 'layoutGrammar', 'motion', 'iconFamily', 'density', 'contrast', 'copyTone']) {
    assert(field in genome, `Genome missing ${field}`);
  }
  const comparison = compareGenome(genome, genome);
  assert(comparison.conformity > .9);
  const driftFile = path.join(temp, 'drift.css');
  fs.writeFileSync(driftFile, '.card{padding:13px}.panel{gap:13px}');
  const driftComparison = compareGenome(genome, scanGenome(driftFile));
  assert(driftComparison.conformity < 1);
  assert(driftComparison.tokenProposals.some(item => item.value === '13px'));

  const dsl = 'hero(split(proof-stack,interactive-product-model),trust-rail,action-cluster)';
  for (const stack of STACKS) {
    const result = compileComposition(dsl, stack);
    assert(result.source.includes('data-composition'));
    assert.deepStrictEqual(result.constraints.widths, [375, 768, 1024, 1440]);
    if (stack === 'react' || stack === 'css-modules') {
      esbuild.transformSync(result.source, { loader: 'jsx', jsx: 'automatic' });
    } else if (stack === 'vue') {
      const parsed = parseVue(result.source, { filename: 'Composition.vue' });
      assert.strictEqual(parsed.errors.length, 0);
      assert.strictEqual(compileTemplate({
        source: parsed.descriptor.template.content,
        filename: 'Composition.vue',
        id: 'designos-composition',
      }).errors.length, 0);
    } else if (stack === 'svelte') {
      compileSvelte(result.source, { filename: 'Composition.svelte', generate: 'client' });
    } else if (stack === 'tailwind') {
      assert(result.source.includes('md:grid-cols-'));
    }
  }
  const compiledFile = path.join(temp, 'compiled.html');
  fs.writeFileSync(compiledFile, compileComposition(dsl, 'html').source);
  const responsive = await solveResponsiveConstraints({ target: compiledFile, cwd: ROOT });
  assert.strictEqual(responsive.passed, true, JSON.stringify(responsive.violations, null, 2));
  const brokenResponsive = path.join(temp, 'broken-responsive.html');
  fs.writeFileSync(brokenResponsive, `<!doctype html><meta name="viewport" content="width=device-width"><style>*{box-sizing:border-box}.overflow{width:calc(100vw + 1px)}button{width:40px;height:40px}</style><div class="overflow"><button>Act</button></div>`);
  const solvedBroken = await solveResponsiveConstraints({ target: brokenResponsive, cwd: ROOT });
  assert(solvedBroken.violations.some(item => item.type === 'horizontal-overflow'));
  assert(solvedBroken.violations.some(item => item.type === 'touch-target'));
  assert(solvedBroken.minimalChanges.every(item => item.property || item.action || item.breakpoint));

  const matrixDir = path.join(temp, 'matrix');
  const matrix = writeStateMatrix(matrixDir, { id: 'control', label: 'Control' });
  assert.strictEqual(matrix.rows.length, STATES.length);
  for (const file of ['state-matrix.json', 'state-matrix.html', 'screenshot-scenarios.json', 'accessibility-tasks.json', 'interaction.spec.js', 'motion.spec.js']) {
    assert(fs.existsSync(path.join(matrixDir, file)), `State matrix missing ${file}`);
  }

  const mutations = runMutationSuite();
  assert.strictEqual(mutations.summary.recall, 1, JSON.stringify(mutations.rows, null, 2));
  assert.strictEqual(mutations.summary.precision, 1, JSON.stringify(mutations.rows, null, 2));

  const consistencyDir = path.join(temp, 'consistency');
  fs.mkdirSync(consistencyDir);
  const page = `<!doctype html><style>.primary{transition:opacity 120ms}</style><nav aria-label="Primary"></nav><button class="primary" data-cta>Continue</button><h1>Title</h1><p data-proof="source">Proof</p>`;
  fs.writeFileSync(path.join(consistencyDir, 'a.html'), page);
  fs.writeFileSync(path.join(consistencyDir, 'b.html'), page);
  assert(buildConsistencyGraph(consistencyDir).passed);
  fs.writeFileSync(path.join(consistencyDir, 'b.html'), page.replace('class="primary"', 'class="primary alternate"'));
  assert(!buildConsistencyGraph(consistencyDir).passed);

  const nativeDir = path.join(temp, 'native');
  const native = buildNativeAdapters(nativeDir);
  assert(native.passed);
  assert(native.results.every(result => CAPABILITIES.every(capability => result.capabilities[capability])));
  assert(Object.values(native.probe).every(Boolean));
  let result = spawnSync(process.execPath, [path.join(ROOT, 'bin/native-motion.js'), '--out', path.join(temp, 'native-cli')], {
    cwd: ROOT, encoding: 'utf8', timeout: 60000,
  });
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);

  result = spawnSync(process.execPath, [
    path.join(ROOT, 'bin/interruption-torture.js'), 'fixtures/motion/torture.html',
    '--selector', '#torture-target', '--out', path.join(temp, 'torture.json'),
  ], { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  const torture = JSON.parse(fs.readFileSync(path.join(temp, 'torture.json'), 'utf8'));
  assert.strictEqual(torture.summary.passed, 8, JSON.stringify(torture.scenarios, null, 2));

  fs.rmSync(temp, { recursive: true, force: true });
  console.log(`leader-features: ${STATES.length} states, ${mutations.summary.mutations} mutations, ${torture.summary.total} torture scenarios, ${native.results.length} native adapters clean`);
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
