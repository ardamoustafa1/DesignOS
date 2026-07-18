#!/usr/bin/env node
/**
 * DesignOS token-pair contrast checker — closes the gap Run 004 proved:
 * a file can pass token discipline (check-drift) with zero raw hex and still
 * ship a WCAG contrast failure, because tokens hide the actual color values.
 *
 *   node check-token-contrast.js <src-dir-or-file> [token-file ...]
 *
 * What it does:
 *   1. Collects `--name: #hex` tokens from every `:root` block in the target
 *      files plus any explicitly passed token files.
 *   2. Finds every CSS rule that declares BOTH a text color and a background
 *      in the same block, resolves var() references (including fallbacks),
 *      and computes the WCAG 2.x contrast ratio.
 *   3. Flags pairs below 3:1 as hard failures and pairs in [3, 4.5) as
 *      large-text-only risks (AA body needs 4.5:1 — checklists/accessibility.md).
 *
 * Honest scope (what a static tool cannot see — final-gate.md still applies):
 *   - Only same-rule pairs. Inherited color over an ancestor's background
 *     needs a renderer; this tool does not guess.
 *   - Gradients, images, rgba()/hsl(), currentColor, and system colors are
 *     skipped, not judged.
 *   - Passing here is a floor, not a contrast clearance for the page.
 *
 * Opt-outs for deliberate-violation fixtures (anti-pattern demos, trap pages):
 *   file-level:  put `designos-contrast-ignore-file` anywhere in the file
 *   block-level: put a `contrast-ok: <reason>` comment inside the rule block —
 *                the reason is mandatory, an escape without a why is drift
 */
const fs = require('fs');
const path = require('path');

const [, , target, ...tokenFiles] = process.argv;
if (!target) {
  console.error('usage: check-token-contrast.js <src-dir-or-file> [token-file ...]');
  process.exit(2);
}

function* walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) {
      if (['node_modules', '.git', 'dist', 'build'].includes(e)) continue;
      yield* walk(path.join(p, e));
    }
  } else if (/\.(css|html)$/.test(p)) {
    yield p;
  }
}

function parseHex(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null; // 8-digit alpha hex → skip, honestly
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
}

function luminance([r, g, b]) {
  const lin = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fgHex, bgHex) {
  const fg = parseHex(fgHex);
  const bg = parseHex(bgHex);
  if (!fg || !bg) return null;
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

// innermost `selector { declarations }` blocks — declarations only live at the
// innermost level, so one pass catches rules inside @media too
const BLOCK = /([^{}]+)\{([^{}]*)\}/g;

function collectTokens(text, tokens) {
  for (const m of text.matchAll(BLOCK)) {
    if (!/:root\s*$/.test(m[1].trim())) continue;
    for (const d of m[2].matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)) {
      tokens.set(d[1], d[2]); // later definitions win, matching the cascade
    }
  }
}

function resolveValue(value, tokens) {
  const v = value.trim();
  const varMatch = v.match(/^var\(\s*--([\w-]+)\s*(?:,\s*([^)]+))?\)/);
  if (varMatch) {
    if (tokens.has(varMatch[1])) return tokens.get(varMatch[1]);
    if (varMatch[2]) return resolveValue(varMatch[2], tokens);
    return null;
  }
  const hexMatch = v.match(/^#[0-9a-fA-F]{3,8}\b/);
  if (hexMatch) return hexMatch[0];
  return null; // rgba, gradients, keywords — out of scope, skipped not judged
}

function lastDecl(body, prop) {
  let out = null;
  const re = new RegExp(`(?:^|[;\\s])${prop}\\s*:\\s*([^;}]+)`, 'gi');
  for (const m of body.matchAll(re)) out = m[1];
  return out;
}

const findings = [];
const globalTokens = new Map();
const files = [...walk(path.resolve(target))];

// only explicitly passed token files are shared — sibling pages in a directory
// are independent palettes and must never contaminate each other's judgment
for (const f of tokenFiles) {
  if (fs.existsSync(f)) collectTokens(fs.readFileSync(path.resolve(f), 'utf8'), globalTokens);
}

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const tokens = new Map(globalTokens);
  collectTokens(raw, tokens); // the file's own :root wins over shared tokens
  if (raw.includes('designos-contrast-ignore-file')) {
    console.log(`skipped (ignore directive): ${path.relative(process.cwd(), file)}`);
    continue;
  }
  for (const m of raw.matchAll(BLOCK)) {
    const selector = m[1].trim().split('\n').pop().trim();
    if (/:root\s*$/.test(selector)) continue;
    const body = m[2];
    if (body.includes('contrast-ok')) continue; // block-level exception — must carry its reason
    const colorRaw = lastDecl(body, 'color');
    const bgRaw = lastDecl(body, 'background-color') || lastDecl(body, 'background');
    if (!colorRaw || !bgRaw) continue;
    const fg = resolveValue(colorRaw, tokens);
    const bg = resolveValue(bgRaw, tokens);
    if (!fg || !bg) continue;
    const r = ratio(fg, bg);
    if (r === null) continue;
    const line = raw.slice(0, m.index).split('\n').length;
    const loc = `${path.relative(process.cwd(), file)}:${line}`;
    const pair = `${colorRaw.trim()} on ${bgRaw.trim()} → ${fg} on ${bg} = ${Math.round(r * 100) / 100}:1`;
    if (r < 3) {
      findings.push(`${loc}  contrast-fail  ${selector} — ${pair} — fails AA even for large text (3:1)`);
    } else if (r < 4.5) {
      findings.push(`${loc}  contrast-large-only  ${selector} — ${pair} — fails AA body text (4.5:1); acceptable ONLY if every use is ≥24px or ≥18.66px bold`);
    }
  }
}

if (findings.length) {
  findings.forEach(f => console.log(f));
  console.log(`\ncheck-token-contrast: ${findings.length} finding(s)`);
  process.exit(1);
}
console.log('check-token-contrast: clean (same-rule pairs only — not a full contrast clearance)');
