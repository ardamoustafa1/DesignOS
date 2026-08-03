#!/usr/bin/env node
/**
 * DesignOS originality-checker unit tests — validators/check-originality.js.
 * Run: node validators/test-originality.js
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  \x1b[32m✓\x1b[0m ${name}`); passed++; }
  catch (e) { console.error(`  \x1b[31m✗\x1b[0m ${name}\n    ${e.message}`); failed++; }
}

const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'validators', 'check-originality.js');
const FIXTURES = path.join(ROOT, 'validators', 'fixtures', 'originality');
const CORPUS = path.join(FIXTURES, 'test-corpus.json');

function run(file, args = []) {
  if (fs.existsSync(CORPUS)) fs.unlinkSync(CORPUS);
  return spawnSync(process.execPath, [SCRIPT, file, '--corpus', CORPUS, '--json', ...args], { cwd: ROOT, encoding: 'utf8' });
}

test('an empty corpus always reports clean', () => {
  const result = run(path.join(FIXTURES, 'template-a.html'));
  assert.strictEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.strictEqual(report.corpusSize, 0);
  assert.deepStrictEqual(report.findings, []);
});

test('--add seeds the corpus with the checked file\'s fingerprint', () => {
  run(path.join(FIXTURES, 'template-a.html'), ['--add']);
  const corpus = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
  assert.strictEqual(corpus.length, 1);
  assert.ok(corpus[0].id.endsWith('template-a.html'));
});

test('a near-identical page skeleton is flagged as a structural-clone-risk', () => {
  spawnSync(process.execPath, [SCRIPT, path.join(FIXTURES, 'template-a.html'), '--corpus', CORPUS, '--add', '--json'], { cwd: ROOT });
  const result = spawnSync(process.execPath,
    [SCRIPT, path.join(FIXTURES, 'template-b-clone.html'), '--corpus', CORPUS, '--json'], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(result.status, 2);
  const report = JSON.parse(result.stdout);
  assert.strictEqual(report.findings.length, 1);
  assert.strictEqual(report.findings[0].rule, 'structural-clone-risk');
  assert.ok(report.closestMatch.similarity >= 0.82);
});

test('a structurally distinct page produces no finding against the same corpus', () => {
  spawnSync(process.execPath, [SCRIPT, path.join(FIXTURES, 'template-a.html'), '--corpus', CORPUS, '--add', '--json'], { cwd: ROOT });
  const result = spawnSync(process.execPath,
    [SCRIPT, path.join(FIXTURES, 'distinct-shape.html'), '--corpus', CORPUS, '--json'], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.deepStrictEqual(report.findings, []);
});

test('a file never gets compared against its own prior corpus entry', () => {
  spawnSync(process.execPath, [SCRIPT, path.join(FIXTURES, 'template-a.html'), '--corpus', CORPUS, '--add', '--json'], { cwd: ROOT });
  const result = spawnSync(process.execPath,
    [SCRIPT, path.join(FIXTURES, 'template-a.html'), '--corpus', CORPUS, '--json'], { cwd: ROOT, encoding: 'utf8' });
  const report = JSON.parse(result.stdout);
  assert.deepStrictEqual(report.findings, [], 'a file re-checked against a corpus containing only itself must not self-flag');
});

if (fs.existsSync(CORPUS)) fs.unlinkSync(CORPUS);
console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
