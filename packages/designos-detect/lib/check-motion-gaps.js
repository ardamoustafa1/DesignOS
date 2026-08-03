#!/usr/bin/env node
/**
 * DesignOS motion-gaps audit — a restraint-first, READ-ONLY sweep for interactive
 * elements that plausibly want state feedback and have none, and dialog-like surfaces
 * with no enter/exit transition at all.
 *
 *   node check-motion-gaps.js <src-dir-or-file> [--json] [--limit 7]
 *
 * This is NOT a gate. Every other validator in this directory enforces a rule already
 * written in motion/ against motion that exists; this one looks at motion that is
 * ABSENT, which is inherently a judgment call, not a mechanical violation. So it:
 *   - never exits non-zero (advisory only — it cannot fail a build)
 *   - caps output at --limit (default 7) findings, honoring the two-signature scarcity
 *     law (motion/signature-moments.md) — a page does not need ten new animations
 *   - always prints a "Considered and rejected" section for anything it found but
 *     dropped past the cap, or judged already-adequate, so silence never reads as
 *     "nothing was checked"
 *
 * Two candidate classes, both from motion/recipes.md's own default whitelist
 * ("State changes: hover, press, selection, toggle" / dialogs get an enter transition):
 *   missing-press-feedback   a <button>/submit control with no :hover/:active rule
 *                            anywhere in scope (recipes.md §1)
 *   missing-dialog-transition a modal/dialog-shaped surface with no transition/animation
 *                            declared on it or its backdrop (recipes.md §3)
 */
const fs = require('fs');
const path = require('path');

const rawArgs = process.argv.slice(2);
const asJson = rawArgs.includes('--json');
const limitIdx = rawArgs.indexOf('--limit');
const limit = limitIdx >= 0 ? Number(rawArgs[limitIdx + 1]) || 7 : 7;
const target = rawArgs.find((a, i) => !a.startsWith('--') && rawArgs[i - 1] !== '--limit');
if (!target) {
  console.error('usage: check-motion-gaps.js <src-dir-or-file> [--json] [--limit 7]');
  process.exit(2);
}

function* walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) {
      if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(e)) continue;
      yield* walk(path.join(p, e));
    }
  } else if (/\.(html|jsx?|tsx?|vue|svelte)$/.test(p)) yield p;
}

const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

const candidates = []; // { file, line, code, message, weight }
const rejected = [];   // { reason }

for (const file of walk(path.resolve(target))) {
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.includes('designos-motion-ignore-file') || /motion-gaps-ok:/i.test(raw)) {
    rejected.push({ reason: `${path.relative(process.cwd(), file)}: file carries an explicit opt-out — not scanned` });
    continue;
  }
  const rel = path.relative(process.cwd(), file);

  /* ---------- missing press feedback ---------- */
  const hasAnyStateFeedback = /:hover\s*\{[^}]*(transform|background|color|border|opacity)/is.test(raw)
    || /:active\s*\{[^}]*(transform|background|opacity)/is.test(raw);
  const buttons = [...raw.matchAll(/<button\b[^>]*>/gi), ...raw.matchAll(/<input\b[^>]*type=["']submit["'][^>]*>/gi)];
  if (buttons.length && !hasAnyStateFeedback) {
    candidates.push({
      file: rel, line: lineOf(raw, buttons[0].index), code: 'missing-press-feedback',
      message: `${buttons.length} button-like control(s) in this file and no :hover/:active rule anywhere in scope — state changes are the first entry on the motion whitelist (motion/recipes.md §1: press, hover, selection, toggle)`,
      weight: buttons.length,
    });
  } else if (buttons.length) {
    rejected.push({ reason: `${rel}: ${buttons.length} button-like control(s) already have hover/active treatment in scope — no gap` });
  }

  /* ---------- missing dialog transition ---------- */
  const dialogMatch = raw.match(/class=["'][^"']*\b(modal|dialog)\b[^"']*["']|role=["']dialog["']/i);
  if (dialogMatch) {
    const hasTransition = /\.(modal|dialog)\b[^{]*\{[^}]*(transition|animation)\s*:/is.test(raw)
      || /\[data-open=|\.is-open|\.open\b/.test(raw) && /(transition|animation)\s*:/is.test(raw);
    if (!hasTransition) {
      candidates.push({
        file: rel, line: lineOf(raw, dialogMatch.index), code: 'missing-dialog-transition',
        message: 'modal/dialog-shaped surface has no transition or animation declared — it will snap open/closed with no enter/exit (motion/recipes.md §3: modal + backdrop, never scale(0)→scale(1))',
        weight: 2,
      });
    } else {
      rejected.push({ reason: `${rel}: modal/dialog surface already declares a transition — no gap` });
    }
  }
}

candidates.sort((a, b) => b.weight - a.weight);
const kept = candidates.slice(0, limit);
const overflow = candidates.slice(limit);
for (const c of overflow) {
  rejected.push({ reason: `${c.file}:${c.line} (${c.code}): found, but past the --limit ${limit} cap — the scarcity law means this list stays short, not exhaustive; rerun with --limit to see more` });
}

if (asJson) {
  console.log(JSON.stringify({
    target, findings: kept.map(c => ({ file: c.file, line: c.line, rule: c.code, severity: 'advisory', message: c.message })),
    consideredAndRejected: rejected, count: kept.length,
  }, null, 2));
  process.exit(0);
}

console.log(`check-motion-gaps: ${kept.length} candidate(s) (advisory — this never fails a build)\n`);
for (const c of kept) console.log(`  ${c.file}:${c.line}  ${c.code}\n    ${c.message}\n`);
console.log('Considered and rejected:');
if (!rejected.length) console.log('  (nothing else was found or skipped)');
for (const r of rejected) console.log(`  - ${r.reason}`);
