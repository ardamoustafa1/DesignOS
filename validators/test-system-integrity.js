#!/usr/bin/env node
/**
 * test-system-integrity.js — contract test for validators/check-system-integrity.js.
 *
 * Three fixture packages stand in for the three states the checker has to tell apart:
 *   agrees/     prose and tokens name the same colours        → 0% drift, exit 0
 *   contradicts/ prose names colours the tokens never define  → 100% drift, exit 1
 *   ground-drift/ prose and tokens disagree about the ground  → the named-ground rule
 *
 * A drift checker that cannot separate these is measuring nothing, so the rules are
 * asserted individually rather than by a total count.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHECKER = path.join(__dirname, 'check-system-integrity.js');

const failures = [];
const assert = (ok, message) => { if (!ok) failures.push(message); };

/* ---------- build a throwaway catalog ---------- */

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-integrity-'));
const write = (slug, md, css) => {
  fs.mkdirSync(path.join(dir, slug), { recursive: true });
  fs.writeFileSync(path.join(dir, slug, 'SYSTEM.md'), md);
  fs.writeFileSync(path.join(dir, slug, 'tokens.css'), css);
};

write('agrees',
  `# Agrees\n\n- **Ground:** \`#101014\` — the page background.\n- **Ink:** \`#F2F0EC\`\n- **Accent:** \`#E8703A\`\n- **Surface:** \`#1A1A20\`\n- **Muted:** \`#8A8A94\`\n`,
  `:root {\n  --bg: #101014;\n  --fg: #F2F0EC;\n  --accent: #E8703A;\n  --surface: #1A1A20;\n  --muted: #8A8A94;\n}\n`);

write('contradicts',
  `# Contradicts\n\nAll values are tokens. Do not invent new hex.\n\n- **Paper:** \`#EFE7D2\` — primary background, warm ivory.\n- **Ink:** \`#15140F\`\n- **Coral (accent):** \`#ED6F5C\`\n- **Bone:** \`#F7F1DE\`\n- **Olive:** \`#6E7448\`\n`,
  `:root {\n  --bg: #ffffff;\n  --fg: #111111;\n  --accent: #111111;\n  --surface: #f7f7f7;\n  --muted: #707070;\n}\n`);

write('ground-drift',
  `# Ground Drift\n\n- **Paper:** \`#EFE7D2\` — primary background, warm ivory.\n- **Ink:** \`#111111\`\n- **Accent:** \`#707070\`\n- **Surface:** \`#f7f7f7\`\n`,
  `:root {\n  --bg: #ffffff;\n  --fg: #111111;\n  --accent: #707070;\n  --surface: #f7f7f7;\n}\n`);

/* a package with almost no named colour cannot be judged and must be skipped, not scored */
write('too-thin', '# Too Thin\n\nMostly prose, one value: `#101014`.\n',
  ':root {\n  --bg: #101014;\n}\n');

/* ---------- run ---------- */

function run(args) {
  try {
    return { code: 0, stdout: execFileSync('node', [CHECKER, ...args], { cwd: ROOT, encoding: 'utf8' }) };
  } catch (err) {
    return { code: err.status, stdout: String(err.stdout || ''), stderr: String(err.stderr || '') };
  }
}

const all = run([dir, '--json']);
let report;
try {
  report = JSON.parse(all.stdout);
} catch (err) {
  failures.push(`--json did not emit parseable JSON (${err.message}) — the large-payload flush regression`);
  report = { results: [], findings: [] };
}

const by = Object.fromEntries((report.results || []).map(r => [r.slug, r]));

assert(by.agrees && by.agrees.drift === 0, `agrees/ must report 0% drift, got ${by.agrees && by.agrees.drift}`);
assert(by.contradicts && by.contradicts.drift === 100,
  `contradicts/ must report 100% drift, got ${by.contradicts && by.contradicts.drift}`);
assert(by['too-thin'] && by['too-thin'].skipped,
  'a package with too few named colours must be skipped, not scored');

const rules = new Set((report.findings || []).map(f => f.rule));
assert(rules.has('system-prose-token-drift'), 'system-prose-token-drift must fire on contradicts/');
assert(rules.has('system-prose-ground-drift'), 'system-prose-ground-drift must fire on ground-drift/');
assert((report.findings || []).every(f => f.file && f.line > 0 && f.message && f.severity === 'P2'),
  'every finding needs a file, a positive line, a message, and P2 severity');
assert(all.code === 1, `a catalog containing drift must exit 1, got ${all.code}`);

/* a threshold above the worst package makes the same catalog pass */
const lax = run([dir, '--threshold', '100', '--quiet']);
assert(lax.code === 0, `--threshold 100 must pass this catalog, got exit ${lax.code}`);

/* the packaged catalog: kiln is authored against its own tokens and must be coherent */
const real = run([path.join(ROOT, 'systems'), '--json']);
try {
  const realReport = JSON.parse(real.stdout);
  const kiln = (realReport.results || []).find(r => r.slug === 'kiln');
  assert(kiln && kiln.drift === 0,
    `systems/kiln must agree with its own token layer, got ${kiln && kiln.drift}% drift`);
} catch (err) {
  failures.push(`scanning systems/ did not emit parseable JSON: ${err.message}`);
}

fs.rmSync(dir, { recursive: true, force: true });

/* ---------- report ---------- */
if (failures.length) {
  failures.forEach(f => console.error(`  ✗ ${f}`));
  console.error(`\ntest-system-integrity: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log('test-system-integrity: ok (agrees / contradicts / ground-drift / too-thin separated; kiln coherent)');
