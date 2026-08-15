#!/usr/bin/env node
/**
 * test-craft-ceiling.js — contract test for validators/check-craft-ceiling.js.
 *
 * Two fixtures, one contract:
 *   flat.html  must raise every ceiling rule and exit non-zero
 *   rich.html  must raise none and exit zero
 *
 * A ceiling rule that cannot separate these two files is not enforcing anything, so the
 * test asserts rule ids individually rather than counting findings — a rule that silently
 * stops matching would otherwise hide behind the others.
 */
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHECKER = path.join(__dirname, 'check-craft-ceiling.js');
const FIXTURES = path.join(__dirname, 'fixtures', 'ceiling');

const EXPECTED = [
  'ceiling-system-font-brand',
  'ceiling-black-shadow',
  'ceiling-lcp-opacity-fade',
  'ceiling-display-no-tracking',
  'ceiling-flat-elevation',
  'ceiling-no-edge-highlight',
  'ceiling-no-texture',
  'ceiling-uniform-rhythm',
  'ceiling-single-container',
  'ceiling-no-arrival',
  'ceiling-no-memorable-moment',
];

function run(fixture, extra = []) {
  try {
    const stdout = execFileSync('node', [CHECKER, path.join(FIXTURES, fixture), ...extra],
      { cwd: ROOT, encoding: 'utf8' });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status, stdout: String(err.stdout || '') };
  }
}

const failures = [];
const assert = (ok, message) => { if (!ok) failures.push(message); };

/* ---- flat.html: every rule fires, exit 1 ---- */
const flat = run('flat.html', ['--json']);
const flatReport = JSON.parse(flat.stdout);
const flatRules = new Set(flatReport.findings.map(f => f.rule));

for (const rule of EXPECTED) {
  assert(flatRules.has(rule), `flat.html: expected ${rule} to fire, it did not`);
}
assert(flat.code === 1, `flat.html: expected exit 1, got ${flat.code}`);
assert(
  flatReport.findings.every(f => f.file && f.line > 0 && f.message),
  'flat.html: every finding needs a file, a positive line number, and a message',
);
assert(
  flatReport.findings.some(f => f.severity === 'P2') && flatReport.findings.some(f => f.severity === 'P3'),
  'flat.html: both severities must be represented, or the P2/P3 split is not wired',
);

/* ---- rich.html: clean, exit 0 ---- */
const rich = run('rich.html', ['--json']);
const richReport = JSON.parse(rich.stdout);
assert(richReport.findings.length === 0,
  `rich.html: expected no findings, got ${richReport.findings.map(f => f.rule).join(', ')}`);
assert(rich.code === 0, `rich.html: expected exit 0, got ${rich.code}`);

/* ---- advisories alone are non-blocking without --strict, blocking with it ---- */
const strictRich = run('rich.html', ['--strict']);
assert(strictRich.code === 0, `rich.html --strict: expected exit 0, got ${strictRich.code}`);

/* ---- the local opt-out must work, and must require a reason ---- */
const fs = require('fs');
const os = require('os');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-ceiling-'));
const optOut = path.join(tmp, 'opt-out.css');
fs.writeFileSync(optOut, [
  ':root {',
  '  /* ceiling-ok: fixture proving the escape hatch resolves */',
  '  --font: system-ui, sans-serif;',
  '}',
].join('\n'));
const escaped = (() => {
  try {
    execFileSync('node', [CHECKER, optOut, '--json'], { cwd: ROOT, encoding: 'utf8' });
    return true;
  } catch (_) { return false; }
})();
assert(escaped, 'ceiling-ok: <reason> within three lines must suppress the finding');

const noReason = path.join(tmp, 'no-reason.css');
fs.writeFileSync(noReason, ':root {\n  --font: system-ui, sans-serif;\n}\n');
let unescaped = false;
try { execFileSync('node', [CHECKER, noReason, '--json'], { cwd: ROOT, encoding: 'utf8' }); }
catch (_) { unescaped = true; }
assert(unescaped, 'a file without the opt-out must still report the finding');

/* ---- ceiling-no-memorable-moment accepts EITHER route independently ----
   The rule must never require both the material and the motion route — a page that closes
   one is done, and a page (like the Rehearsal reference example) that is deliberately
   material-led and carries no motion signature must not be told to add one. */
const materialOnly = path.join(tmp, 'material-only.html');
fs.writeFileSync(materialOnly, [
  '<html><body><main><h1>Report</h1>',
  '<table><tr><td>a table is enough on its own</td></tr></table>',
  '</main></body></html>',
].join('\n'));
const runAbs = (absPath) => {
  try {
    return { code: 0, stdout: execFileSync('node', [CHECKER, absPath, '--json'], { cwd: ROOT, encoding: 'utf8' }) };
  } catch (err) {
    return { code: err.status, stdout: String(err.stdout || '') };
  }
};

const materialResult = runAbs(materialOnly);
assert(!JSON.parse(materialResult.stdout).findings.some(f => f.rule === 'ceiling-no-memorable-moment'),
  'a page with only an inspectable table must not need a motion signature too');

const motionOnly = path.join(tmp, 'motion-only.html');
fs.writeFileSync(motionOnly, [
  '<html><body><main><h1>Landing</h1><div class="plate"></div></main>',
  '<script>',
  "window.addEventListener('pointermove', function (e) {",
  "  document.querySelector('.plate').style.transform = 'translate3d(' + e.clientX + 'px,0,0)';",
  '});',
  "document.querySelector('.plate').style.willChange = 'transform';",
  '</script></body></html>',
].join('\n'));
const motionResult = runAbs(motionOnly);
assert(!JSON.parse(motionResult.stdout).findings.some(f => f.rule === 'ceiling-no-memorable-moment'),
  'a page with only a pointer-follow signature must not need a table too');

fs.rmSync(tmp, { recursive: true, force: true });

/* ---- report ---- */
if (failures.length) {
  failures.forEach(f => console.error(`  ✗ ${f}`));
  console.error(`\ntest-craft-ceiling: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`test-craft-ceiling: ok (${EXPECTED.length} rules separated flat.html from rich.html)`);
