#!/usr/bin/env node
/**
 * Smoke test for the standalone designos-detect package — proves the vendored lib/ is
 * self-contained (no requires reaching outside this package) and the CLI actually detects
 * a real, known finding. Not a substitute for the parent repo's validators/test-*.js,
 * which test the rules themselves; this only tests that the packaging holds together.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'designos-detect.js');
const LIB = path.join(ROOT, 'lib');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  \x1b[32m✓\x1b[0m ${name}`); passed++; }
  catch (e) { console.error(`  \x1b[31m✗\x1b[0m ${name}\n    ${e.message}`); failed++; }
}

test('lib/ is vendored and self-contained (no requires reaching outside the package)', () => {
  assert.ok(fs.existsSync(LIB), 'lib/ must exist — run `npm run vendor` first');
  for (const file of fs.readdirSync(LIB)) {
    if (!file.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(LIB, file), 'utf8');
    const external = [...src.matchAll(/require\(\s*['"](\.\.\/[^'"]+)['"]\s*\)/g)]
      .filter(m => !fs.existsSync(path.join(LIB, m[1])));
    assert.deepStrictEqual(external.map(m => m[1]), [], `${file} must not require anything outside lib/`);
  }
});

test('a known bad fixture produces the expected finding via the CLI', () => {
  const fixture = path.join(ROOT, 'test', 'fixtures', 'raw-color.css');
  const result = spawnSync(process.execPath, [CLI, path.dirname(fixture), '--json', '--out', path.join(ROOT, 'test', '.tmp-ledger.json')], { encoding: 'utf8' });
  assert.strictEqual(result.status, 2, `expected exit 2 (findings), got ${result.status}: ${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.ok(report.findings.some(f => f.rule === 'source-raw-color'), 'must detect the raw hex color in the fixture');
  fs.rmSync(path.join(ROOT, 'test', '.tmp-ledger.json'), { force: true });
});

test('a clean directory exits 0 with zero findings', () => {
  const cleanDir = path.join(ROOT, 'test', 'fixtures', 'clean');
  const result = spawnSync(process.execPath, [CLI, cleanDir, '--json', '--out', path.join(ROOT, 'test', '.tmp-ledger2.json')], { encoding: 'utf8' });
  assert.strictEqual(result.status, 0, `expected exit 0, got ${result.status}: ${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.strictEqual(report.summary.findingCount, 0);
  fs.rmSync(path.join(ROOT, 'test', '.tmp-ledger2.json'), { force: true });
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
