#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { PATTERNS, searchPatterns, getPattern } = require('../runtime/pattern-atlas');
const { buildLeaderReport, markdown } = require('../bin/leader-workflow');
const { parseDsl, compileOrchestration } = require('../bin/cli/commands/orchestrate');
const { buildReviewPacket } = require('../bin/cli/commands/ai-review');
const { analyzeFile } = require('../bin/cli/commands/animation-review');

const ROOT = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-category-leader-'));
const fixture = path.join(temp, 'surface.html');
fs.writeFileSync(fixture, `<!doctype html><html><head><style>
:root{--duration-fast:120ms;--ease-out:cubic-bezier(.16,1,.3,1)}
button{transition:transform var(--duration-fast) var(--ease-out)}
@media (prefers-reduced-motion:reduce){button{transition:none}}
</style></head><body><button type="button">Open menu</button></body></html>`);

assert(PATTERNS.length >= 15);
for (const pattern of PATTERNS) {
  for (const key of ['id', 'category', 'scale', 'intent', 'earnedWhen', 'avoidWhen', 'productTruth', 'modalities', 'reducedMotion', 'performance', 'modules']) {
    assert(pattern[key], `${pattern.id || 'pattern'} missing ${key}`);
  }
  assert(pattern.earnedWhen.length >= 2);
  assert(pattern.avoidWhen.length >= 2);
  assert.deepStrictEqual(Object.keys(pattern.modalities).sort(), ['keyboard', 'pointer', 'touch']);
  assert(pattern.performance.maxDurationMs <= 2000);
}
assert.strictEqual(getPattern('swipe-to-dismiss').category, 'gesture');
assert(searchPatterns('gesture velocity touch', { intensity: 7 }).some(pattern => pattern.id === 'swipe-to-dismiss'));
assert(searchPatterns('product inspection pointer', { category: 'signature', intensity: 7 }).some(pattern => pattern.id === 'cursor-spotlight'));
const routing = JSON.parse(fs.readFileSync(path.join(ROOT, 'evals/category-leadership/pattern-routing.json'), 'utf8'));
for (const item of routing.cases) {
  const ids = searchPatterns(item.query, { limit: 5 }).map(pattern => pattern.id);
  assert(ids.includes(item.expected), `${item.query} did not retrieve ${item.expected}: ${ids.join(', ')}`);
}

const report = buildLeaderReport({
  target: fixture, cwd: temp, root: ROOT,
  brief: 'developer tool command menu', motionIntensity: 5, deep: false,
});
assert.strictEqual(report.finalDesignScore, 'NOT ASSESSED');
assert.strictEqual(report.inventory.files, 1);
assert(report.inventory.components.includes('button'));
assert.strictEqual(report.motion.findings.length, 0, JSON.stringify(report.motion.findings, null, 2));
assert(report.motion.decisions.every(decision => decision.explanation && decision.recommendation));
assert(markdown(report).includes('Final design score: **NOT ASSESSED**'));

const steps = parseDsl('STAGGER(.card, 40ms, 220ms) WAIT(120ms) REVEAL(.proof, 200ms)');
assert.deepStrictEqual(steps.map(step => step.op), ['stagger', 'wait', 'reveal']);
const orchestration = compileOrchestration('MOVE(.panel, 12, 0, 180ms) FADE(.status, 120ms)');
assert(orchestration.includes('prefers-reduced-motion'));
assert(orchestration.includes('cancel:'));
assert(!orchestration.includes('elastic.out'));

const reviewPacket = buildReviewPacket({
  target: fixture,
  brief: 'developer command menu',
  reviewer: 'isolated-reviewer',
  context: { cwd: temp, pkgRoot: ROOT, motionIntensity: 5, deep: false },
});
assert.strictEqual(reviewPacket.status, 'READY_FOR_EXTERNAL_REVIEW');
assert(reviewPacket.provenance.includes('no model was called'));
assert.strictEqual(reviewPacket.sourceAssessment.finalDesignScore, 'NOT ASSESSED');

const motionFixture = path.join(temp, 'motion.css');
fs.writeFileSync(motionFixture, `:root{--ease-spring:cubic-bezier(.34,1.56,.64,1)}
@keyframes reveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.panel{width:20rem;height:auto;margin:0;padding:1rem;animation:reveal 200ms var(--ease-spring)}
@media (prefers-reduced-motion:reduce){.panel{animation:none}}`);
assert.strictEqual(analyzeFile(motionFixture, temp).length, 0, JSON.stringify(analyzeFile(motionFixture, temp), null, 2));
fs.writeFileSync(motionFixture, `@keyframes grow{from{width:0}to{width:100%}}
.panel{animation:grow 200ms ease-out}@media (prefers-reduced-motion:reduce){.panel{animation:none}}`);
assert(analyzeFile(motionFixture, temp).some(finding => finding.rule === 'ANIM-007'));

let result = spawnSync(process.execPath, [path.join(ROOT, 'bin/designos.js'), 'atlas', '--id', 'origin-aware-popover', '--json'], {
  cwd: ROOT, encoding: 'utf8', timeout: 30000,
});
assert.strictEqual(result.status, 0, result.stderr || result.stdout);
assert.strictEqual(JSON.parse(result.stdout).patterns[0].id, 'origin-aware-popover');

result = spawnSync(process.execPath, [path.join(ROOT, 'bin/designos.js'), 'improve', fixture, '--brief', 'developer command', '--json'], {
  cwd: temp, encoding: 'utf8', timeout: 30000,
});
assert.strictEqual(result.status, 0, result.stderr || result.stdout);
assert.strictEqual(JSON.parse(result.stdout).finalDesignScore, 'NOT ASSESSED');

fs.rmSync(temp, { recursive: true, force: true });
console.log(`category-leadership: ${PATTERNS.length} inspectable patterns, ${routing.cases.length}/${routing.cases.length} routing cases, explainable no-motion decisions and unified improve workflow clean`);
