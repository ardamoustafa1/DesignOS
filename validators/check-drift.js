#!/usr/bin/env node
/**
 * DesignOS drift checker — token discipline for CSS/HTML codebases.
 *
 *   node check-drift.js <src-dir-or-file> [token-file ...]
 *
 * Findings (foundations/design-tokens.md + spacing.md + a11y):
 *   raw-hex        hex colors outside the token file(s)
 *   off-grid-px    px values not on the 4px grid (and not 0/1/2px hairlines)
 *   bare-outline   `outline: none/0` with no adjacent replacement in the same file
 *   important      `!important` (allowed only in token files' reduced-motion blocks)
 */
const fs = require('fs');
const path = require('path');

const [, , target, ...tokenFiles] = process.argv;
if (!target) {
  console.error('usage: check-drift.js <src-dir-or-file> [token-file ...]');
  process.exit(2);
}
const tokenSet = new Set(tokenFiles.map(f => path.resolve(f)));

function* walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) {
      if (['node_modules', '.git', 'dist', 'build'].includes(e)) continue;
      yield* walk(path.join(p, e));
    }
  } else if (/\.(css|html|jsx?|tsx?|vue|svelte)$/.test(p)) {
    yield p;
  }
}

const findings = [];
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const PX = /\b(\d+)px\b/g;
const GRID_OK = new Set([0, 1, 2]); // hairlines + zero; everything else must be %4===0

for (const file of walk(path.resolve(target))) {
  const isTokenFile = tokenSet.has(path.resolve(file));
  const raw = fs.readFileSync(file, 'utf8');
  // opt-out directive for deliberate-violation files (e.g. anti-pattern demos)
  if (raw.includes('designos-drift-ignore-file')) {
    console.log(`skipped (ignore directive): ${path.relative(process.cwd(), file)}`);
    continue;
  }
  const lines = raw.split('\n');
  let rootDepth = 0; // inside a :root { … } block = the file's inline token layer
  lines.forEach((line, i) => {
    const loc = `${path.relative(process.cwd(), file)}:${i + 1}`;
    const inRoot = rootDepth > 0;
    if (/:root\b/.test(line)) {
      // count BOTH braces so a single-line `:root { … }` doesn't leave the
      // tracker stuck open and exempt the rest of the file
      rootDepth += (line.match(/{/g) || []).length || 1;
      rootDepth -= (line.match(/}/g) || []).length;
      if (rootDepth < 0) rootDepth = 0;
    } else if (rootDepth > 0) {
      rootDepth += (line.match(/{/g) || []).length;
      rootDepth -= (line.match(/}/g) || []).length;
      if (rootDepth < 0) rootDepth = 0;
    }
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) return;
    // token layers may hold raw values — that's their job; the `:root` line itself
    // counts (single-line :root blocks put declarations on that same line)
    if (isTokenFile || inRoot || /:root\b/.test(line)) return;
    if (line.includes('drift-ok')) return; // line-level exception — must carry its reason
    // browser-UI meta values (theme-color, msapplication-TileColor) are not component
    // styling — they have no token indirection available and must stay raw hex
    if (/<meta\b[^>]*(theme-color|tilecolor)/i.test(line)) return;

    // hex only in CSS-value position (guards against content like incident "#4128")
    if (/(color|background|border|fill|stroke|shadow|outline|gradient)[^;{]*#[0-9a-fA-F]/i.test(line)) {
      for (const m of line.matchAll(HEX)) {
        findings.push(`${loc}  raw-hex  ${m[0]} — move to the token layer (design-tokens.md tier rule)`);
      }
    }
    // the 4px grid governs SPACING declarations only — type has its own scale
    // (typography.md), radius its own (6/10/16), sizes their component specs.
    // Parse per-declaration so `height: 34px; padding: 8px` flags nothing.
    for (const decl of line.matchAll(/(?:margin|padding|gap|inset)[\w-]*\s*:\s*([^;}"']+)/gi)) {
      for (const m of decl[1].matchAll(PX)) {
        const v = Number(m[1]);
        if (!GRID_OK.has(v) && v % 4 !== 0) {
          findings.push(`${loc}  off-grid-px  ${v}px — 4px grid violation (spacing.md)`);
        }
      }
    }
    if (/outline:\s*(none|0)/.test(line) && !/:focus-visible|outline-offset|box-shadow/.test(lines.slice(Math.max(0, i - 3), i + 4).join(' '))) {
      findings.push(`${loc}  bare-outline  focus indicator removed without replacement (accessibility.md instant-fail)`);
    }
    if (/!important/.test(line) && !isTokenFile) {
      findings.push(`${loc}  important  !important outside token/reset layer (frontend-engineer.md)`);
    }
  });
}

if (findings.length) {
  findings.forEach(f => console.log(f));
  console.log(`\ncheck-drift: ${findings.length} finding(s)`);
  process.exit(1);
}
console.log('check-drift: clean');
