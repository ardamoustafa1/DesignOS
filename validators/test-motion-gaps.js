#!/usr/bin/env node
/**
 * DesignOS motion-gaps unit tests — validators/check-motion-gaps.js.
 * Run: node validators/test-motion-gaps.js
 */
const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  \x1b[32m✓\x1b[0m ${name}`); passed++; }
  catch (e) { console.error(`  \x1b[31m✗\x1b[0m ${name}\n    ${e.message}`); failed++; }
}

const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'validators', 'check-motion-gaps.js');
const run = (target, extraArgs = []) =>
  spawnSync(process.execPath, [SCRIPT, target, '--json', ...extraArgs], { cwd: ROOT, encoding: 'utf8' });

test('flags a button with no hover/active treatment anywhere in scope', () => {
  const result = run('validators/fixtures/motion-gaps/no-press-feedback.html');
  assert.strictEqual(result.status, 0, 'the audit is advisory — it must never fail a build');
  const report = JSON.parse(result.stdout);
  assert.ok(report.findings.some(f => f.rule === 'missing-press-feedback'), 'must catch the unstyled button');
});

test('flags a dialog-shaped surface with no transition declared', () => {
  const result = run('validators/fixtures/motion-gaps/no-press-feedback.html');
  const report = JSON.parse(result.stdout);
  assert.ok(report.findings.some(f => f.rule === 'missing-dialog-transition'), 'must catch the untransitioned modal');
});

test('a real, already-animated example produces no findings (false-positive regression)', () => {
  const result = run('examples/showcase-relay-pricing.html');
  const report = JSON.parse(result.stdout);
  assert.deepStrictEqual(report.findings, [], 'an example with real hover/active states must not be flagged');
});

test('always exits 0, even when findings exist — advisory, not a gate', () => {
  const result = run('validators/fixtures/motion-gaps/no-press-feedback.html');
  assert.strictEqual(result.status, 0);
});

test('--limit caps output and moves the overflow into consideredAndRejected', () => {
  const result = run('validators/fixtures/motion-gaps/no-press-feedback.html', ['--limit', '1']);
  const report = JSON.parse(result.stdout);
  assert.strictEqual(report.findings.length, 1, 'must respect the scarcity-law cap');
  assert.ok(report.consideredAndRejected.some(r => /past the --limit/.test(r.reason)), 'overflow must be explained, not silently dropped');
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
