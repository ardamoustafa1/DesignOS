#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { summarizeTrace } = require('../bin/motion-profiler');
const { cubicBezierValue, phaseMetrics } = require('../bin/temporal-motion');

const ROOT = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-motion-evidence-'));
const temporalOut = path.join(temp, 'temporal.json');
const profileOut = path.join(temp, 'profile.json');

assert(Math.abs(cubicBezierValue('cubic-bezier(0,0,1,1)', 0.5) - 0.5) < 0.01);
const synthetic = summarizeTrace([
  { name: 'RunTask', dur: 80000 },
  { name: 'UpdateLayoutTree', dur: 3000 },
  { name: 'Layout', dur: 2000 },
  { name: 'Paint', dur: 1000 },
  { name: 'CompositeLayers', dur: 500 },
  { name: 'Animation', cat: 'animation', args: { data: { name: 'fixture-motion' } } },
], { frameTimes: [16, 17, 55], longAnimationFrames: [{ blockingDuration: 8 }] }, 4);
assert.strictEqual(synthetic.mainThread.blockingTaskCount, 1);
assert.strictEqual(synthetic.rendering.maxCompositeLayers, 4);
assert(synthetic.animationAttribution.targets.includes('fixture-motion'));
assert.strictEqual(synthetic.frameTimeMs.p95, 55);

const samples = [
  { t: 0, rect: { x: 0, y: 0, width: 10, height: 10 }, opacity: '1', matrix: [1, 0, 0, 1, 0, 0], easing: 'linear' },
  { t: 16, rect: { x: 5, y: 0, width: 10, height: 10 }, opacity: '1', matrix: [1, 0, 0, 1, 5, 0], easing: 'linear' },
  { t: 32, rect: { x: 10, y: 0, width: 10, height: 10 }, opacity: '1', matrix: [1, 0, 0, 1, 10, 0], easing: 'linear' },
];
assert.strictEqual(phaseMetrics(samples).frameTimes.p50, 16);

let result = spawnSync(process.execPath, [
  path.join(ROOT, 'bin/temporal-motion.js'), 'fixtures/motion/temporal.html',
  '--selector', '#motion-target', '--duration', '260', '--out', temporalOut,
], { cwd: ROOT, encoding: 'utf8', timeout: 30000 });
assert.strictEqual(result.status, 0, result.stderr || result.stdout);
const temporal = JSON.parse(fs.readFileSync(temporalOut, 'utf8'));
assert(temporal.sequence.fullFrames >= 5 && temporal.sequence.reducedFrames >= 5);
assert(temporal.comparison.transformOriginMatch);
assert(temporal.comparison.reducedMotionSemanticEquivalent);

result = spawnSync(process.execPath, [
  path.join(ROOT, 'bin/motion-profiler.js'), 'fixtures/motion/temporal.html',
  '--selector', '#motion-target', '--duration', '300', '--out', profileOut,
], { cwd: ROOT, encoding: 'utf8', timeout: 30000 });
assert.strictEqual(result.status, 0, result.stderr || result.stdout);
const profile = JSON.parse(fs.readFileSync(profileOut, 'utf8'));
for (const field of ['droppedFrames', 'longAnimationFrames', 'mainThread', 'rendering', 'animationAttribution']) {
  assert(field in profile.metrics, `profile missing ${field}`);
}
for (const field of ['averageFps', 'worstFrameMs', 'droppedFrameRatio', 'interaction', 'cleanup', 'reducedMotion']) {
  assert(field in profile.metrics, `profile missing ${field}`);
}
for (const field of ['inputToMotionLatencyMs', 'settleTimeMs', 'overshoot', 'cancelResponseTimeMs']) {
  assert(field in profile.metrics.interaction, `profile interaction missing ${field}`);
}
for (const field of ['layoutCount', 'paintCount', 'compositeOnly']) {
  assert(field in profile.metrics.rendering, `profile rendering missing ${field}`);
}
for (const quantile of ['p50', 'p95', 'p99']) assert(quantile in profile.metrics.frameTimeMs);

fs.rmSync(temp, { recursive: true, force: true });
console.log('motion-evidence: CDP profile + temporal trajectory regression clean');
