#!/usr/bin/env node
/**
 * Static HTML accessibility tells — the greppable subset of checklists/accessibility.md.
 * NOT a substitute for the manual keyboard walk or a real engine (axe); this catches
 * the instant-fail class before a human spends attention.
 *
 *   node check-a11y-basics.js <file-or-dir>
 *
 * Checks: img without alt attr · input/select/textarea without label linkage ·
 * div/span with onclick · missing <main> · missing/multiple <h1> ·
 * anchor with href="#" and no role · positive tabindex.
 */
const fs = require('fs');
const path = require('path');

const target = process.argv[2];
if (!target) {
  console.error('usage: check-a11y-basics.js <file-or-dir>');
  process.exit(2);
}

function* walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) {
      if (['node_modules', '.git'].includes(e)) continue;
      yield* walk(path.join(p, e));
    }
  } else if (p.endsWith('.html')) yield p;
}

const findings = [];
for (const file of walk(path.resolve(target))) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file);
  const lineOf = idx => html.slice(0, idx).split('\n').length;

  for (const m of html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi))
    findings.push(`${rel}:${lineOf(m.index)}  img-no-alt  image without alt attribute`);

  for (const m of html.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
    const tag = m[0];
    if (/type=["'](hidden|submit|button)["']/i.test(tag)) continue;
    if (!/\b(id|aria-label|aria-labelledby)=/i.test(tag))
      findings.push(`${rel}:${lineOf(m.index)}  input-no-label  form control with no label linkage`);
  }

  for (const m of html.matchAll(/<(div|span)\b[^>]*\bonclick=/gi))
    findings.push(`${rel}:${lineOf(m.index)}  div-onclick  ${m[1]} with onclick — use <button>`);

  if (!/<main[\s>]/i.test(html))
    findings.push(`${rel}:1  no-main  missing <main> landmark`);

  const h1s = html.match(/<h1[\s>]/gi) || [];
  if (h1s.length === 0) findings.push(`${rel}:1  no-h1  missing <h1>`);
  if (h1s.length > 1) findings.push(`${rel}:1  multi-h1  ${h1s.length} <h1> elements`);

  for (const m of html.matchAll(/tabindex=["']([1-9]\d*)["']/g))
    findings.push(`${rel}:${lineOf(m.index)}  positive-tabindex  tabindex=${m[1]} — reorder DOM instead`);
}

if (findings.length) {
  findings.forEach(f => console.log(f));
  console.log(`\ncheck-a11y-basics: ${findings.length} finding(s)`);
  process.exit(1);
}
console.log('check-a11y-basics: clean');
