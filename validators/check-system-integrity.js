#!/usr/bin/env node
/**
 * DesignOS system-integrity checker — does a design system agree with itself?
 *
 *   node check-system-integrity.js [systems-dir] [--threshold 20] [--json] [--quiet]
 *
 * `check-system-conformance.js` asks whether a PAGE obeys its system. This asks whether
 * the SYSTEM is coherent in the first place, which turns out to be the prior question.
 *
 * A design-system package has two halves that an agent may read independently: prose that
 * a human argues with, and tokens a machine consumes. When they disagree, an agent handed
 * the package builds one page from `SYSTEM.md` and a different page from `tokens.css`, and
 * neither is wrong by its own lights. Nothing catches it, because prose is not executable
 * and nobody diffs it against the values.
 *
 * The failure is not hypothetical. Sweeping an imported 151-package catalog with this file
 * found that **63% of the colour values named in prose do not exist in the token layer at
 * all** — 25 packages disagreed with themselves completely, including one whose prose says
 * "warm ivory paper #efe7d2, coral accent #ed6f5c, all values are tokens, do not invent new
 * hex" above a token file that reads pure white with a black accent.
 *
 * Rules:
 *   system-prose-token-drift   a colour named in the prose exists nowhere in tokens.css
 *   system-prose-ground-drift  the prose's stated ground/background is not the ground token
 *                              — the single value everything else is derived from
 *
 * What it deliberately does NOT do: judge which half is right. Prose can be the stale one
 * or the tokens can be; the package author knows and the checker does not. It reports the
 * disagreement and the ratio, and `systems/README.md` states the rule that tokens win.
 *
 * Scope: colour is checked because colour is the half that is named unambiguously in both
 * halves. Type, spacing, and radius are described in prose too loosely to diff without
 * inventing intent.
 *
 * Exit: 0 every package under the threshold · 1 at least one over · 2 usage error
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const quiet = argv.includes('--quiet');
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const THRESHOLD = Number(flag('--threshold', '20'));
if (!Number.isFinite(THRESHOLD) || THRESHOLD < 0 || THRESHOLD > 100) {
  console.error('--threshold must be a percentage between 0 and 100');
  process.exit(2);
}
const target = argv.find(a => !a.startsWith('--') && a !== String(THRESHOLD))
  || path.join(ROOT, 'systems');
const SYSTEMS = path.resolve(target);
if (!fs.existsSync(SYSTEMS)) {
  console.error(`systems directory not found: ${SYSTEMS}`);
  process.exit(2);
}

/* ---------- primitives ---------- */

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));

/** Prose minus fenced code blocks: a fence quoting tokens.css is not an independent claim. */
const proseOnly = (md) => md
  .split(/^## Upstream contract\s*$/m)[0]
  .replace(/```[\s\S]*?```/g, '');

const expandHex = (hex) => {
  const h = hex.replace('#', '').toLowerCase();
  if (h.length === 3) return h.split('').map(c => c + c).join('');
  if (h.length === 8) return h.slice(0, 6);
  return h;
};

const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

/* ---------- run ---------- */

const packages = fs.readdirSync(SYSTEMS, { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
  .map(e => e.name)
  .filter(slug => fs.existsSync(path.join(SYSTEMS, slug, 'SYSTEM.md'))
    && fs.existsSync(path.join(SYSTEMS, slug, 'tokens.css')))
  .sort();

const results = [];
const findings = [];

for (const slug of packages) {
  const dir = path.join(SYSTEMS, slug);
  const md = fs.readFileSync(path.join(dir, 'SYSTEM.md'), 'utf8');
  const css = stripComments(fs.readFileSync(path.join(dir, 'tokens.css'), 'utf8'));

  const tokenHexes = new Set([...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => expandHex(m[0])));
  const tokenValues = new Map();
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)) {
    if (!tokenValues.has(m[1])) tokenValues.set(m[1], m[2].trim());
  }

  const prose = proseOnly(md);
  const named = [...prose.matchAll(/#[0-9a-fA-F]{6}\b/g)]
    .map(m => ({ raw: m[0], key: expandHex(m[0]), index: m.index }));
  const unique = new Map();
  for (const n of named) if (!unique.has(n.key)) unique.set(n.key, n);

  if (unique.size < 4) {
    results.push({ slug, named: unique.size, absent: 0, drift: 0, skipped: 'too few named colours to judge' });
    continue;
  }

  const absent = [...unique.values()].filter(n => !tokenHexes.has(n.key));
  const drift = Math.round((absent.length / unique.size) * 100);
  results.push({ slug, named: unique.size, absent: absent.length, drift });

  if (drift > THRESHOLD) {
    for (const n of absent.slice(0, 3)) {
      findings.push({
        file: path.relative(process.cwd(), path.join(dir, 'SYSTEM.md')),
        line: lineOf(md, n.index),
        rule: 'system-prose-token-drift',
        severity: 'P2',
        message: `${n.raw} is named in the prose contract but exists nowhere in tokens.css (${absent.length} of ${unique.size} named colours, ${drift}%, are absent). An agent reading the prose and an agent reading the tokens build different pages.`,
      });
    }
  }

  /* The ground is the one value everything else derives from, so it is checked by name
     rather than by ratio: a package whose prose declares a different background than its
     token layer is not "slightly drifted", it is two systems. */
  const groundToken = ['--bg', '--kiln-ground', '--ground', '--background', '--surface']
    .map(t => tokenValues.get(t)).find(Boolean);
  const groundHex = groundToken && /#[0-9a-fA-F]{3,8}/.exec(groundToken);
  const proseGround = /(?:background|canvas|paper|ground|page)[^\n#]{0,80}(#[0-9a-fA-F]{6})/i.exec(prose)
    || /(#[0-9a-fA-F]{6})[^\n]{0,60}(?:primary background|page background|main .{0,12}surface)/i.exec(prose);
  if (groundHex && proseGround) {
    const a = expandHex(groundHex[0]);
    const b = expandHex(proseGround[1]);
    if (a !== b) {
      findings.push({
        file: path.relative(process.cwd(), path.join(SYSTEMS, slug, 'SYSTEM.md')),
        line: lineOf(md, proseGround.index),
        rule: 'system-prose-ground-drift',
        severity: 'P2',
        message: `the prose names ${proseGround[1]} as the ground, the token layer says ${groundHex[0]}. Every shadow, tint, and elevation value in this package derives from the ground — these are two different systems sharing a folder.`,
      });
    }
  }
}

/* ---------- report ---------- */

const judged = results.filter(r => !r.skipped);
const over = judged.filter(r => r.drift > THRESHOLD);
const totalNamed = judged.reduce((n, r) => n + r.named, 0);
const totalAbsent = judged.reduce((n, r) => n + r.absent, 0);
const overall = totalNamed ? Math.round((totalAbsent / totalNamed) * 100) : 0;

if (asJson) {
  console.log(JSON.stringify({
    target: path.relative(ROOT, SYSTEMS) || 'systems',
    threshold: THRESHOLD,
    packages: judged.length,
    packagesOverThreshold: over.length,
    namedColours: totalNamed,
    absentFromTokens: totalAbsent,
    overallDriftPercent: overall,
    results, findings, count: findings.length,
  }, null, 2));
  /* Never process.exit() after a large write: a report covering 150 packages runs well past
     the 64KB pipe buffer, and exiting truncates the JSON mid-string for any consumer that
     pipes us. Setting exitCode lets Node flush first. */
  process.exitCode = over.length ? 1 : 0;
  return;
}

if (!quiet) {
  const worst = [...over].sort((a, b) => b.drift - a.drift).slice(0, 12);
  for (const r of worst) {
    console.log(`${String(r.drift).padStart(3)}% drift  ${r.slug.padEnd(24)} ${r.absent}/${r.named} named colours absent from tokens.css`);
  }
  if (over.length > worst.length) console.log(`… and ${over.length - worst.length} more over ${THRESHOLD}%`);
  console.log('');
}

console.log(`check-system-integrity: ${judged.length} package(s) judged · ${over.length} over the ${THRESHOLD}% threshold`);
console.log(`  ${totalAbsent}/${totalNamed} colours named in prose (${overall}%) do not exist in the token layer`);

if (over.length) {
  console.log('\nThe prose and the tokens are two halves of one contract. Where they disagree the');
  console.log('tokens win (systems/README.md) — but an agent handed the prose does not know that.');
  process.exit(1);
}
console.log('every judged package agrees with its own token layer');
process.exit(0);
