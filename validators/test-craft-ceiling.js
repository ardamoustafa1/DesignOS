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

/* ---- ceiling-flat-elevation must fire on ZERO shadows, not just a wrong one ----
   The rule used to require at least one resolvable box-shadow before it would judge
   anything — a page with rounded/filled surfaces and no shadow anywhere (the flattest
   possible page, and the actual shape of un-reviewed AI output) produced no finding at
   all, while a page that tried and got one flat shadow did. Both must fire now. */
const zeroShadow = path.join(tmp, 'zero-shadow.html');
fs.writeFileSync(zeroShadow, [
  '<html><head><style>.card{border-radius:12px;background:#fff;border:1px solid #eee}</style></head>',
  '<body><main><h1>x</h1><div class="card">no shadow anywhere</div></main></body></html>',
].join('\n'));
const zeroShadowResult = runAbs(zeroShadow);
assert(JSON.parse(zeroShadowResult.stdout).findings.some(f => f.rule === 'ceiling-flat-elevation'),
  'rounded/filled surfaces with zero box-shadow anywhere must still trip ceiling-flat-elevation');

const plainText = path.join(tmp, 'plain-text.html');
fs.writeFileSync(plainText, '<html><head><style>p{color:#333}</style></head><body><main><h1>x</h1><p>Just a paragraph, no surfaces at all.</p></main></body></html>');
const plainTextResult = runAbs(plainText);
assert(!JSON.parse(plainTextResult.stdout).findings.some(f => f.rule === 'ceiling-flat-elevation'),
  'a page with no card-shaped surfaces at all must not be told its (nonexistent) elevation is flat');

/* ---- ceiling-uniform-rhythm must catch a repeated card grid even without <section> ----
   The original rule only looked at >=4 <section> tags — a short hero + one features-grid
   page (the most common shape, and never wrapped in 4 <section>s) carries the exact same
   tell (N identical cards, each with its own heading) and used to be invisible to this
   rule entirely. */
const cardGrid = path.join(tmp, 'card-grid.html');
fs.writeFileSync(cardGrid, [
  '<html><head><style>.card{padding:8px}</style></head><body><main><h1>Everything you need</h1>',
  '<div class="grid">',
  '<div class="card"><h3>One</h3><p>a</p></div>',
  '<div class="card"><h3>Two</h3><p>b</p></div>',
  '<div class="card"><h3>Three</h3><p>c</p></div>',
  '</div></main></body></html>',
].join('\n'));
const cardGridResult = runAbs(cardGrid);
assert(JSON.parse(cardGridResult.stdout).findings.some(f => f.rule === 'ceiling-uniform-rhythm'),
  '3 sibling divs sharing one class, each with its own heading, must trip ceiling-uniform-rhythm without needing <section> wrappers');

const twoCards = path.join(tmp, 'two-cards.html');
fs.writeFileSync(twoCards, [
  '<html><head><style>.card{padding:8px}</style></head><body><main><h1>x</h1><div class="grid">',
  '<div class="card"><h3>One</h3></div>',
  '<div class="card"><h3>Two</h3></div>',
  '</div></main></body></html>',
].join('\n'));
const twoCardsResult = runAbs(twoCards);
assert(!JSON.parse(twoCardsResult.stdout).findings.some(f => f.rule === 'ceiling-uniform-rhythm'),
  'only 2 repeated cards must not trip the rule — 3+ is the actual "grid" tell, not a legitimate 2-up layout');

fs.rmSync(tmp, { recursive: true, force: true });

/* ---- report ---- */
if (failures.length) {
  failures.forEach(f => console.error(`  ✗ ${f}`));
  console.error(`\ntest-craft-ceiling: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`test-craft-ceiling: ok (${EXPECTED.length} rules separated flat.html from rich.html)`);
