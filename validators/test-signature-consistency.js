#!/usr/bin/env node
/**
 * DesignOS signature-consistency unit tests — validators/check-signature-consistency.js.
 * Run: node validators/test-signature-consistency.js
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
const SCRIPT = path.join(ROOT, 'validators', 'check-signature-consistency.js');
const FIXTURES = path.join(ROOT, 'validators', 'fixtures', 'signature-lock');
const MEMORY = path.join(FIXTURES, 'memory-design.md');

const run = (target, memory) =>
  spawnSync(process.execPath, [SCRIPT, target, '--memory', memory, '--json'], { cwd: ROOT, encoding: 'utf8' });

test('no Signature Lock section: reports null lock and exits clean', () => {
  const result = run(FIXTURES, path.join(FIXTURES, 'nonexistent.md'));
  assert.strictEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.strictEqual(report.lock, null);
  assert.deepStrictEqual(report.findings, []);
});

test('a page matching the locked technique produces no finding', () => {
  const result = run(path.join(FIXTURES, 'matches-lock.html'), MEMORY);
  assert.strictEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.deepStrictEqual(report.findings, []);
});

test('a page drifting to a different technique, undocumented, is flagged', () => {
  const result = run(path.join(FIXTURES, 'drifts-from-lock.html'), MEMORY);
  assert.strictEqual(result.status, 2);
  const report = JSON.parse(result.stdout);
  assert.strictEqual(report.findings.length, 1);
  assert.strictEqual(report.findings[0].rule, 'signature-drift');
});

test('a page drifting with a signature-override comment is not flagged', () => {
  const result = run(path.join(FIXTURES, 'drifts-with-override.html'), MEMORY);
  assert.strictEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.deepStrictEqual(report.findings, []);
});

test('scanning the whole fixture directory finds exactly the one undocumented drift', () => {
  const result = run(FIXTURES, MEMORY);
  const report = JSON.parse(result.stdout);
  assert.strictEqual(report.findings.length, 1);
  assert.ok(report.findings[0].file.includes('drifts-from-lock.html'));
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
