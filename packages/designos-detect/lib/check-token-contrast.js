#!/usr/bin/env node
/**
 * DesignOS token-pair contrast checker — closes the gap Run 004 proved:
 * a file can pass token discipline (check-drift) with zero raw hex and still
 * ship a WCAG contrast failure, because tokens hide the actual color values.
 *
 *   node check-token-contrast.js <src-dir-or-file> [token-file ...]
 *
 * Two passes:
 *
 *   1. Same-rule pass (all CSS/HTML). Every rule that declares BOTH a text color and a
 *      background in the same block: resolve var(), compute the WCAG 2.x ratio, flag.
 *
 *   2. Cascade pass (HTML only). The original tool's documented blind spot was inherited
 *      color over an ancestor's background — the ordinary case, since almost nobody
 *      re-declares the background on the element that holds the text. This pass builds the
 *      element tree, matches simple selectors against it with real specificity ordering,
 *      inherits `color` down the tree, walks *up* for the nearest painted background
 *      (background is not inherited), composites translucent layers, and only then judges.
 *
 * Honest scope (what a static tool still cannot see — final-gate.md still applies):
 *   - Pass 2 understands type, class, id, compound, and descendant selectors. Anything
 *     with a combinator (`>`, `+`, `~`), an attribute, or a pseudo-class/element is
 *     SKIPPED, not guessed — so state colors (:hover, :focus, [aria-current]) are out.
 *   - Gradients, images, currentColor, color-mix(), and system colors end the walk as
 *     "unknown" and the element is skipped rather than judged.
 *   - Media queries are flattened: a rule inside `@media (min-width: 768px)` is treated as
 *     if it applied, which is right for catching failures and wrong for narrow-only
 *     overrides. Verify the reported viewport by hand.
 *   - Font size is not computed, so the 3:1 large-text allowance is reported, not decided.
 *   - Passing here is a floor, not a contrast clearance for the page.
 *
 * Opt-outs for deliberate-violation fixtures (anti-pattern demos, trap pages):
 *   file-level:  put `designos-contrast-ignore-file` anywhere in the file
 *   block-level: put a `contrast-ok: <reason>` comment inside the rule block —
 *                the reason is mandatory, an escape without a why is drift
 *   element:     add `data-contrast-ok="<reason>"` to the element (cascade pass)
 */
const fs = require('fs');
const path = require('path');

const rawArgs = process.argv.slice(2);
const asJson = rawArgs.includes('--json');
const [target, ...tokenFiles] = rawArgs.filter(a => a !== '--json');
if (!target) {
  console.error('usage: check-token-contrast.js <src-dir-or-file> [token-file ...] [--json]');
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

/* ---------- color ---------- */

/** → { r, g, b, a } in 0..1, or null when the value is not a flat resolvable color */
function parseColor(value) {
  const v = String(value).trim().toLowerCase().replace(/\s*!important$/, '');
  if (!v || v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const hex = v.match(/^#([0-9a-f]{3,8})\b/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = [...h].map(c => c + c).join('');
    if (h.length === 4) h = [...h].map(c => c + c).join('');
    if (h.length === 6) h += 'ff';
    if (h.length !== 8) return null;
    const [r, g, b, a] = [0, 2, 4, 6].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    return { r, g, b, a };
  }
  // rgb()/rgba(), both the legacy comma form and the modern space form with `/ alpha`
  const rgb = v.match(/^rgba?\(([^)]*)\)/);
  if (rgb) {
    const body = rgb[1].replace(/\//g, ' / ');
    const nums = body.split(/[\s,]+/).filter(Boolean);
    const slash = nums.indexOf('/');
    const parts = slash === -1 ? nums : nums.slice(0, slash);
    const alphaRaw = slash === -1 ? nums[3] : nums[slash + 1];
    if (parts.length < 3) return null;
    const chan = parts.slice(0, 3).map(n =>
      n.endsWith('%') ? parseFloat(n) / 100 : parseFloat(n) / 255);
    if (chan.some(Number.isNaN)) return null;
    let a = 1;
    if (alphaRaw !== undefined) {
      a = alphaRaw.endsWith('%') ? parseFloat(alphaRaw) / 100 : parseFloat(alphaRaw);
      if (Number.isNaN(a)) a = 1;
    }
    return { r: chan[0], g: chan[1], b: chan[2], a };
  }
  const NAMED = { white: '#ffffff', black: '#000000', red: '#ff0000', blue: '#0000ff', green: '#008000', gray: '#808080', grey: '#808080' };
  if (NAMED[v]) return parseColor(NAMED[v]);
  return null; // gradients, currentColor, color-mix, system colors — skipped, not judged
}

/** src over dst, both premultiplied out; dst is assumed opaque (the walk guarantees it) */
const composite = (src, dst) => ({
  r: src.r * src.a + dst.r * (1 - src.a),
  g: src.g * src.a + dst.g * (1 - src.a),
  b: src.b * src.a + dst.b * (1 - src.a),
  a: 1,
});

function luminance({ r, g, b }) {
  const lin = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratioOf(fg, bg) {
  if (!fg || !bg) return null;
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

const hexOf = ({ r, g, b }) =>
  '#' + [r, g, b].map(c => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0')).join('');

/* ---------- CSS parsing ---------- */

// innermost `selector { declarations }` blocks — declarations only live at the
// innermost level, so one pass catches rules inside @media too
const BLOCK = /([^{}]+)\{([^{}]*)\}/g;

/**
 * A block's captured "selector" is everything since the previous `}`, so a comment sitting
 * above the rule becomes part of it and every selector match silently fails. Strip comments
 * from selector text only — rule *bodies* keep theirs, because `contrast-ok` lives there.
 */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ');

function collectTokens(text, tokens) {
  for (const m of text.matchAll(BLOCK)) {
    if (!/:root\s*$/.test(m[1].trim())) continue;
    for (const d of m[2].matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)) {
      tokens.set(d[1], d[2]); // later definitions win, matching the cascade
    }
  }
}

function resolveValue(value, tokens, depth = 0) {
  const v = String(value).trim();
  if (depth > 8) return null; // circular var() reference
  const varMatch = v.match(/^var\(\s*--([\w-]+)\s*(?:,\s*([\s\S]+))?\)\s*$/);
  if (varMatch) {
    if (tokens.has(varMatch[1])) return tokens.get(varMatch[1]);
    if (varMatch[2]) return resolveValue(varMatch[2], tokens, depth + 1);
    return null;
  }
  const hexMatch = v.match(/^#[0-9a-fA-F]{3,8}\b/);
  if (hexMatch) return hexMatch[0];
  if (/^(rgba?\(|transparent$|white$|black$|gray$|grey$)/i.test(v)) return v;
  return null; // gradients, keywords — out of scope, skipped not judged
}

function lastDecl(body, prop) {
  let out = null;
  const re = new RegExp(`(?:^|[;\\s])${prop}\\s*:\\s*([^;}]+)`, 'gi');
  for (const m of body.matchAll(re)) out = m[1];
  return out;
}

/* ---------- pass 2 support: element tree + selector matching ---------- */

const VOID_TAG = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
const NO_TEXT_TAG = /^(script|style|head|title|meta|link|template|svg|path|option|noscript)$/i;

function parseHtmlTree(raw) {
  const root = { tag: 'html', id: '', classes: [], inline: '', attrs: '', children: [], parent: null, text: '', index: 0 };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const [, closing, tag, attrs, text] = m;
    if (text !== undefined) {
      const t = text.replace(/&[a-z]+;|&#\d+;/gi, ' ').replace(/\s+/g, ' ').trim();
      if (t) {
        const top = stack[stack.length - 1];
        top.text = top.text ? `${top.text} ${t}` : t;
      }
      continue;
    }
    if (!tag) continue; // comment
    if (closing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag.toLowerCase() === tag.toLowerCase()) { stack.length = i; break; }
      }
      continue;
    }
    if (/^(script|style)$/i.test(tag)) {
      const close = new RegExp(`</${tag}\\s*>`, 'i');
      const cm = raw.slice(re.lastIndex).match(close);
      if (cm) re.lastIndex += cm.index + cm[0].length;
      continue;
    }
    const node = {
      tag,
      id: (attrs.match(/\bid\s*=\s*["']([^"']*)["']/) || [])[1] || '',
      classes: ((attrs.match(/\bclass\s*=\s*["']([^"']*)["']/) || [])[1] || '').split(/\s+/).filter(Boolean),
      inline: (attrs.match(/\bstyle\s*=\s*["']([^"']*)["']/) || [])[1] || '',
      attrs,
      children: [],
      parent: stack[stack.length - 1],
      text: '',
      index: m.index,
    };
    node.parent.children.push(node);
    if (!VOID_TAG.test(tag) && !/\/\s*$/.test(attrs)) stack.push(node);
  }
  return root;
}

const flatten = (node, out = []) => {
  out.push(node);
  for (const c of node.children) flatten(c, out);
  return out;
};

/** compound simple selector: `a.btn#id`, `.x.y`, `div` */
function matchesSimple(sel, el) {
  if (sel === '*') return true;
  if (sel === ':root') return el.tag === 'html';
  const parts = sel.match(/[.#]?[\w-]+/g);
  if (!parts) return false;
  for (const p of parts) {
    if (p.startsWith('.')) { if (!el.classes.includes(p.slice(1))) return false; }
    else if (p.startsWith('#')) { if (el.id !== p.slice(1)) return false; }
    else if (el.tag.toLowerCase() !== p.toLowerCase()) return false;
  }
  return true;
}

/** descendant combinators only — anything richer is skipped rather than guessed */
const UNSUPPORTED = /[>+~[\]()]|::|:(?!root\b)/;

function matchesSelector(selector, el) {
  const sel = selector.trim();
  if (!sel || UNSUPPORTED.test(sel)) return false;
  const parts = sel.split(/\s+/);
  if (!matchesSimple(parts[parts.length - 1], el)) return false;
  let i = parts.length - 2;
  let anc = el.parent;
  while (i >= 0 && anc) {
    if (matchesSimple(parts[i], anc)) i--;
    anc = anc.parent;
  }
  return i < 0;
}

function specificity(sel) {
  const ids = (sel.match(/#[\w-]+/g) || []).length;
  const classes = (sel.match(/\.[\w-]+/g) || []).length;
  const tags = (sel.replace(/[#.][\w-]+/g, ' ').match(/\b[a-zA-Z][\w-]*/g) || []).length;
  return ids * 10000 + classes * 100 + tags;
}

/* ---------- run ---------- */

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
  const rel = path.relative(process.cwd(), file);
  const tokens = new Map(globalTokens);
  collectTokens(raw, tokens); // the file's own :root wins over shared tokens
  if (raw.includes('designos-contrast-ignore-file')) {
    console.log(`skipped (ignore directive): ${rel}`);
    continue;
  }

  /* ── pass 1: same-rule pairs ── */
  const seenPairs = new Set();
  for (const m of raw.matchAll(BLOCK)) {
    const selector = stripComments(m[1]).trim().split('\n').pop().trim();
    if (/:root\s*$/.test(selector)) continue;
    const body = m[2];
    if (body.includes('contrast-ok')) continue; // block-level exception — must carry its reason
    const colorRaw = lastDecl(body, 'color');
    const bgRaw = lastDecl(body, 'background-color') || lastDecl(body, 'background');
    if (!colorRaw || !bgRaw) continue;
    const fgVal = resolveValue(colorRaw, tokens);
    const bgVal = resolveValue(bgRaw, tokens);
    const fg = fgVal && parseColor(fgVal);
    const bg = bgVal && parseColor(bgVal);
    if (!fg || !bg || fg.a === 0 || bg.a < 1) continue; // pass 1 judges opaque pairs only
    const r = ratioOf(fg, bg);
    if (r === null) continue;
    const line = raw.slice(0, m.index).split('\n').length;
    const loc = `${rel}:${line}`;
    const pair = `${colorRaw.trim()} on ${bgRaw.trim()} → ${fgVal} on ${bgVal} = ${Math.round(r * 100) / 100}:1`;
    if (r < 3) {
      seenPairs.add(`${hexOf(fg)}|${hexOf(bg)}`);
      findings.push(`${loc}  contrast-fail  ${selector} — ${pair} — fails AA even for large text (3:1)`);
    } else if (r < 4.5) {
      seenPairs.add(`${hexOf(fg)}|${hexOf(bg)}`);
      findings.push(`${loc}  contrast-large-only  ${selector} — ${pair} — fails AA body text (4.5:1); acceptable ONLY if every use is ≥24px or ≥18.66px bold`);
    }
  }

  /* ── pass 2: cascade — inherited color over an ancestor's painted background ── */
  if (!/\.html$/.test(file)) continue;

  const rules = [];
  let order = 0;
  const styleText = [...raw.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(s => s[1]).join('\n');
  for (const m of styleText.matchAll(BLOCK)) {
    const body = m[2];
    if (body.includes('contrast-ok')) continue;
    const color = lastDecl(body, 'color');
    const bg = lastDecl(body, 'background-color') || lastDecl(body, 'background');
    if (!color && !bg) continue;
    for (const sel of stripComments(m[1]).trim().split(',')) {
      const s = sel.trim().replace(/\s+/g, ' ');
      if (!s || UNSUPPORTED.test(s)) continue;
      rules.push({ sel: s, spec: specificity(s), order: order++, color, bg });
    }
  }
  if (!rules.length) continue;

  const nodes = flatten(parseHtmlTree(raw)).filter(n => !NO_TEXT_TAG.test(n.tag));

  // own declarations per element: highest specificity wins, then source order, then inline
  for (const el of nodes) {
    let color = null;
    let bg = null;
    let cWin = -1;
    let bWin = -1;
    for (const rule of rules) {
      if (!matchesSelector(rule.sel, el)) continue;
      const rank = rule.spec * 100000 + rule.order;
      if (rule.color && rank > cWin) { color = rule.color; cWin = rank; }
      if (rule.bg && rank > bWin) { bg = rule.bg; bWin = rank; }
    }
    if (el.inline) {
      const ic = lastDecl(el.inline, 'color');
      const ib = lastDecl(el.inline, 'background-color') || lastDecl(el.inline, 'background');
      if (ic) color = ic;
      if (ib) bg = ib;
    }
    el.ownColor = color ? parseColor(resolveValue(color, tokens) || '') : null;
    el.ownColorRaw = color;
    el.ownBgValue = bg;
    el.ownBg = bg ? parseColor(resolveValue(bg, tokens) || '') : null;
    // a declared background we cannot resolve (gradient, image, color-mix) is not "no
    // background" — it is an unknown surface, and guessing past it invents findings
    el.bgUnknown = Boolean(bg) && el.ownBg === null;
  }

  /** nearest painted surface, compositing translucent layers on the way down */
  function resolveBg(el) {
    const chain = [];
    for (let n = el; n; n = n.parent) {
      if (n.bgUnknown) return null;
      if (n.ownBg && n.ownBg.a > 0) {
        chain.push(n.ownBg);
        if (n.ownBg.a >= 1) {
          let acc = chain.pop();
          while (chain.length) acc = composite(chain.pop(), acc);
          return acc;
        }
      }
    }
    return null; // never reached an opaque surface — the canvas is undeclared, so say nothing
  }

  const inheritedColor = (el) => {
    for (let n = el; n; n = n.parent) {
      if (n.ownColorRaw) return n.ownColor ? { color: n.ownColor, from: n } : null;
    }
    return null;
  };

  for (const el of nodes) {
    if (!el.text || el.text.length < 2) continue;
    // an opt-out on a container covers its contents — the reason was written once, for the
    // whole decorative layer, not per text node inside it
    let escaped = false;
    for (let n = el; n; n = n.parent) {
      if (/contrast-ok/.test(n.attrs || '')) { escaped = true; break; }
    }
    if (escaped) continue;
    const fgRes = inheritedColor(el);
    if (!fgRes || !fgRes.color || fgRes.color.a === 0) continue;
    const bg = resolveBg(el);
    if (!bg) continue;
    const fg = fgRes.color.a < 1 ? composite(fgRes.color, bg) : fgRes.color;
    const r = ratioOf(fg, bg);
    if (r === null || r >= 4.5) continue;
    const key = `${hexOf(fg)}|${hexOf(bg)}`;
    if (seenPairs.has(key)) continue; // pass 1 already reported this exact pair
    seenPairs.add(key);
    const line = raw.slice(0, el.index).split('\n').length;
    const who = `<${el.tag}${el.id ? '#' + el.id : ''}${el.classes.length ? '.' + el.classes.join('.') : ''}>`;
    const via = fgRes.from === el ? 'own color' : `color inherited from <${fgRes.from.tag}${fgRes.from.classes.length ? '.' + fgRes.from.classes.join('.') : ''}>`;
    const snippet = el.text.length > 40 ? `${el.text.slice(0, 40)}…` : el.text;
    const pair = `${hexOf(fg)} on ${hexOf(bg)} = ${Math.round(r * 100) / 100}:1 (${via})`;
    if (r < 3) {
      findings.push(`${rel}:${line}  contrast-inherited-fail  ${who} "${snippet}" — ${pair} — fails AA even for large text (3:1)`);
    } else {
      findings.push(`${rel}:${line}  contrast-inherited-large-only  ${who} "${snippet}" — ${pair} — fails AA body text (4.5:1); acceptable ONLY if this text is ≥24px or ≥18.66px bold`);
    }
  }
}

if (asJson) {
  const { emitJson, severityResolver } = require('./finding-format');
  const severityFor = severityResolver({
    'contrast-fail': 'P1', 'contrast-large-only': 'P2',
    'contrast-inherited-fail': 'P1', 'contrast-inherited-large-only': 'P2',
  });
  const structured = emitJson(target, findings, severityFor);
  process.exit(structured.length ? 2 : 0);
}

if (findings.length) {
  findings.forEach(f => console.log(f));
  console.log(`\ncheck-token-contrast: ${findings.length} finding(s)`);
  process.exit(1);
}
console.log('check-token-contrast: clean (same-rule pairs + inherited cascade — states, gradients, and computed type size still need eyes)');
