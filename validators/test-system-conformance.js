#!/usr/bin/env node
/**
 * test-system-conformance.js — contract test for validators/check-system-conformance.js.
 *
 * The separation the checker exists for:
 *   systems/kiln/example.html                       written in the system → clean
 *   validators/fixtures/system/drifts-from-kiln.html claims the system → every rule fires
 *
 * Rule ids are asserted individually. A checker whose rules quietly stop matching would
 * otherwise still "pass" on a total-count assertion, and a conformance gate that has
 * stopped conforming is worse than no gate.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHECKER = path.join(__dirname, 'check-system-conformance.js');

const EXPECTED = [
  'system-token-missing',
  'system-offpalette-color',
  'system-forbidden-color',
  'system-typeface-drift',
  'system-radius-offscale',
  'system-container-offscale',
  'system-container-single',
  'system-easing-offsystem',
  'system-elevation-adhoc',
  'system-accent-overuse',
  'system-texture-missing',
];

function run(args) {
  try {
    return { code: 0, stdout: execFileSync('node', [CHECKER, ...args], { cwd: ROOT, encoding: 'utf8' }) };
  } catch (err) {
    return { code: err.status, stdout: String(err.stdout || ''), stderr: String(err.stderr || '') };
  }
}

const failures = [];
const assert = (ok, message) => { if (!ok) failures.push(message); };

/* ---- the drift fixture: every rule fires, exit 1 ---- */
const drift = run(['validators/fixtures/system/drifts-from-kiln.html', '--system', 'kiln', '--json']);
const driftReport = JSON.parse(drift.stdout);
const driftRules = new Set(driftReport.findings.map(f => f.rule));
for (const rule of EXPECTED) {
  assert(driftRules.has(rule), `drifts-from-kiln.html: expected ${rule} to fire, it did not`);
}
assert(drift.code === 1, `drifts-from-kiln.html: expected exit 1, got ${drift.code}`);
assert(driftReport.system === 'kiln', 'the JSON report must name the system it checked against');
assert(driftReport.findings.every(f => f.file && f.line > 0 && f.message && f.severity === 'P2'),
  'every finding needs a file, a positive line, a message, and P2 severity');

/* ---- the system's own fixture is clean, exit 0 ---- */
const clean = run(['systems/kiln/example.html', '--system', 'kiln', '--json']);
const cleanReport = JSON.parse(clean.stdout);
assert(cleanReport.findings.length === 0,
  `systems/kiln/example.html must be clean, got: ${cleanReport.findings.map(f => f.rule).join(', ')}`);
assert(clean.code === 0, `systems/kiln/example.html: expected exit 0, got ${clean.code}`);

/* ---- the palette is derived from tokens.css, not duplicated in lint.json ---- */
const lint = JSON.parse(fs.readFileSync(path.join(ROOT, 'systems/kiln/lint.json'), 'utf8'));
assert(!JSON.stringify(lint).match(/#[0-9a-fA-F]{6}/g)?.some(hex => !['#000000', '#ffffff'].includes(hex.toLowerCase())),
  'lint.json must not carry palette hexes — the palette is derived from tokens.css so it cannot drift');

/* ---- --list enumerates packaged systems ---- */
const list = run(['--list']);
assert(list.code === 0 && /kiln/.test(list.stdout), '--list must enumerate kiln');

/* ---- an unknown system is a usage error, not a silent pass ---- */
const unknown = run(['systems/kiln/example.html', '--system', 'no-such-system']);
assert(unknown.code === 2, `unknown system: expected exit 2, got ${unknown.code}`);

/* ---- the local opt-out works and requires a reason ---- */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-system-'));
const escaped = path.join(tmp, 'escaped.css');
fs.writeFileSync(escaped, [
  '.thing {',
  '  /* system-ok: documented one-off for the print stylesheet */',
  '  border-radius: 14px;',
  '}',
].join('\n'));
const escapedRun = run([escaped, '--system', 'kiln', '--json']);
assert(!JSON.parse(escapedRun.stdout).findings.some(f => f.rule === 'system-radius-offscale'),
  'system-ok: <reason> within three lines must suppress the finding');

const bare = path.join(tmp, 'bare.css');
fs.writeFileSync(bare, '.thing { border-radius: 14px; }\n');
assert(JSON.parse(run([bare, '--system', 'kiln', '--json']).stdout).findings
  .some(f => f.rule === 'system-radius-offscale'),
  'without the opt-out the finding must still report');
fs.rmSync(tmp, { recursive: true, force: true });

/* ---- every packaged system is structurally complete ---- */
let packagesChecked = 0;
const systemsDir = path.join(ROOT, 'systems');
for (const entry of fs.readdirSync(systemsDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
  for (const file of ['manifest.json', 'SYSTEM.md', 'tokens.css', 'lint.json', 'example.html']) {
    assert(fs.existsSync(path.join(systemsDir, entry.name, file)),
      `systems/${entry.name} is missing ${file}`);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(systemsDir, entry.name, 'manifest.json'), 'utf8'));
  assert(manifest.id === entry.name, `systems/${entry.name}: manifest id "${manifest.id}" must match the folder slug`);
  const own = run([`systems/${entry.name}/example.html`, '--system', entry.name, '--json']);
  assert(JSON.parse(own.stdout).findings.length === 0,
    `systems/${entry.name}/example.html does not conform to its own system`);
  packagesChecked += 1;
}

/* ---- report ---- */
if (failures.length) {
  failures.forEach(f => console.error(`  ✗ ${f}`));
  console.error(`\ntest-system-conformance: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`test-system-conformance: ok (${EXPECTED.length} rules separated the drift fixture from the system's own example; ${packagesChecked} package(s) conform to their own contract)`);
