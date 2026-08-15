#!/usr/bin/env node
/**
 * DesignOS system-conformance checker — does this page actually belong to its system?
 *
 *   node check-system-conformance.js <target> --system <slug> [--json]
 *   node check-system-conformance.js --list
 *
 * The other validators enforce rules that are true of every good page: contrast, tokens,
 * motion budgets, the craft ceiling. This one enforces rules that are true of exactly one
 * *declared* design system — its palette, its three typefaces, its radius scale, its
 * elevation levels, its accent budget. Those are the rules a brand contract is made of,
 * and they are unenforceable in prose: an agent handed a design system in a prompt will
 * follow it for the first screen and drift by the fourth.
 *
 * The palette is DERIVED FROM tokens.css at run time rather than duplicated into
 * lint.json, so the contract can never disagree with the source of truth. lint.json holds
 * only policy (which tokens are required, what the budgets are, what is forbidden).
 *
 * Rules — every one of them is a line in the system's own SYSTEM.md:
 *   system-unknown             the declared system does not exist or is incomplete
 *   system-token-missing       a required token is neither defined nor imported
 *   system-offpalette-color    a colour literal outside the system palette
 *   system-forbidden-color     a value the system bans outright (e.g. pure black)
 *   system-typeface-drift      a font stack whose first family is not a declared face
 *   system-radius-offscale     a border-radius off the declared scale
 *   system-container-offscale  a container width off the declared set
 *   system-container-single    fewer distinct containers than the system requires
 *   system-easing-offsystem    an easing outside the declared set
 *   system-elevation-adhoc     a cast shadow written inline instead of an elevation token
 *   system-accent-overuse      more solid accent fills than the declared budget
 *   system-texture-missing     the system requires a texture layer and none is present
 *
 * Conformance is binary against a declared contract, so every finding is P2 — there is no
 * advisory tier here. "Should this page use Kiln at all?" is a design judgment
 * (brain/decision-framework.md); "does this page obey Kiln?" is what this file answers.
 *
 * Honest scope: it reads source, not pixels. It cannot see whether the ember lands on the
 * right element, whether the rhythm reads as rhythm, or whether the system suits the
 * brief. A clean run means "nothing in this file contradicts the contract."
 *
 * Opt-outs:
 *   file-level:  `designos-system-ignore-file`
 *   local:       `system-ok: <reason>` on the finding's line or the 3 lines above it
 *
 * Exit: 0 clean · 1 findings · 2 usage error
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const wantList = argv.includes('--list');

function flag(name) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
}

const systemsDir = path.resolve(ROOT, flag('--systems-dir') || 'systems');

function listSystems() {
  if (!fs.existsSync(systemsDir)) return [];
  return fs.readdirSync(systemsDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
    .filter(e => fs.existsSync(path.join(systemsDir, e.name, 'manifest.json')))
    .map(e => e.name)
    .sort();
}

if (wantList) {
  const systems = listSystems();
  for (const slug of systems) {
    const manifest = JSON.parse(fs.readFileSync(path.join(systemsDir, slug, 'manifest.json'), 'utf8'));
    console.log(`${slug.padEnd(18)} ${manifest.name} — ${manifest.category}`);
  }
  if (!systems.length) console.log('no systems found in ' + path.relative(ROOT, systemsDir));
  process.exit(0);
}

const target = argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--system'
  && argv[argv.indexOf(a) - 1] !== '--systems-dir');
if (!target) {
  console.error('usage: check-system-conformance.js <target> --system <slug> [--json]');
  console.error('       check-system-conformance.js --list');
  process.exit(2);
}

/* ---------- primitives (shared conventions with the other source validators) ---------- */

function* walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) {
      if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(e)) continue;
      yield* walk(path.join(p, e));
    }
  } else if (/\.(css|html|jsx?|tsx?|vue|svelte)$/.test(p)) {
    yield p;
  }
}

const blankComments = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '));

const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

function hasException(raw, idx) {
  const lines = raw.split('\n');
  const n = lineOf(raw, idx) - 1;
  for (let i = Math.max(0, n - 3); i <= n; i++) {
    if (/system-ok:\s*\S/.test(lines[i] || '')) return true;
  }
  return false;
}

/** Comma-split a CSS value at depth 0 (box-shadow layers, font stacks). */
function splitTop(value) {
  const out = [];
  let depth = 0, current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(current); current = ''; continue; }
    current += ch;
  }
  if (current.trim()) out.push(current);
  return out.map(s => s.trim()).filter(Boolean);
}

const expandHex = (hex) => {
  const h = hex.replace('#', '').toLowerCase();
  if (h.length === 3) return h.split('').map(c => c + c).join('');
  if (h.length === 8) return h.slice(0, 6);
  return h;
};

/** Every colour literal in a chunk of CSS: #hex and rgb()/rgba() triplets. */
function colorLiterals(css) {
  const hexes = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => ({ raw: m[0], key: expandHex(m[0]), index: m.index, kind: 'hex' }));
  const rgbs = [...css.matchAll(/rgba?\(\s*([0-9.]+)[\s,]+([0-9.]+)[\s,]+([0-9.]+)/g)]
    .map(m => ({ raw: m[0], key: `${m[1]} ${m[2]} ${m[3]}`, index: m.index, kind: 'rgb' }));
  return [...hexes, ...rgbs];
}

/* ---------- load the system ---------- */

const slug = flag('--system');
const findings = [];
const push = (file, line, rule, message) => findings.push({ file, line, rule, severity: 'P2', message });

if (!slug) {
  console.error('a system is required: --system <slug>   (available: ' + (listSystems().join(', ') || 'none') + ')');
  process.exit(2);
}

const systemDir = path.join(systemsDir, slug);
const tokensFile = path.join(systemDir, 'tokens.css');
const lintFile = path.join(systemDir, 'lint.json');
const manifestFile = path.join(systemDir, 'manifest.json');

for (const [label, file] of [['manifest.json', manifestFile], ['tokens.css', tokensFile], ['lint.json', lintFile]]) {
  if (!fs.existsSync(file)) {
    console.error(`check-system-conformance: system "${slug}" is missing ${label} (looked in ${path.relative(ROOT, systemDir)})`);
    process.exit(2);
  }
}

const lint = JSON.parse(fs.readFileSync(lintFile, 'utf8'));
const tokensRaw = fs.readFileSync(tokensFile, 'utf8');
const tokensCss = blankComments(tokensRaw);

/* The palette, derived — never duplicated into lint.json.
   Both notations of the same colour are registered: `#100D0A` and `rgb(16 13 10 / .72)`
   are one palette entry, and a page that needs the ground at alpha must not be told it
   invented a colour. */
const palette = new Set();
const addColor = (key, kind) => {
  palette.add(key);
  if (kind !== 'hex') return;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(key.slice(i, i + 2), 16));
  palette.add(`${r} ${g} ${b}`);
};
for (const m of tokensCss.matchAll(/--[\w-]+\s*:\s*([^;{}]+)/g)) {
  for (const c of colorLiterals(m[1])) addColor(c.key, c.kind);
}
const declaredTokens = new Set([...tokensCss.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));

/* Token values, for resolving `var(--kiln-r-md)` back to `10px`. Without this every rule
   below is dead on exactly the pages that use the system correctly — a page written in
   tokens would evade the radius, container, and easing checks entirely. Later definitions
   win, which matches the cascade for the light-theme block. */
const tokenValues = new Map();
for (const m of tokensCss.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)) {
  tokenValues.set(m[1], m[2].trim());
}
/** Resolve var() references one or two levels deep; unknown vars are left alone. */
function resolveVars(value, depth = 2) {
  let out = value;
  for (let i = 0; i < depth && /var\(/.test(out); i++) {
    out = out.replace(/var\(\s*(--[\w-]+)\s*(?:,[^()]*)?\)/g,
      (whole, name) => (tokenValues.has(name) ? tokenValues.get(name) : whole));
  }
  return out;
}
/** Escape every regex metacharacter, not just hyphen — `token` is read from a package's
 *  own lint.json, but building a RegExp from it without a full escape is the same shape
 *  as a regex-injection bug even when the source is repo-controlled today. */
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

/** Whole-token match — `--kiln-ember` must not match inside `--kiln-ember-lift`. */
const usesToken = (value, token) => new RegExp(`${escapeRegExp(token)}(?![\\w-])`).test(value);

const faces = Object.entries(lint.typefaces || {})
  .filter(([k]) => k !== 'reason')
  .map(([, v]) => String(v).toLowerCase());
const radii = new Set((lint.radiusScale || []).map(v => v.toLowerCase()));
const containers = new Set((lint.containerWidths || []).map(v => v.toLowerCase()));
const easings = new Set((lint.easings || []).map(v => v.replace(/\s+/g, '').toLowerCase()));
const elevationTokens = new Set((lint.elevation && lint.elevation.tokens) || []);
const forbidden = new Set(((lint.forbiddenColors && lint.forbiddenColors.values) || []).map(expandHex));

/* ---------- check each target file ---------- */

const files = [];
for (const f of walk(path.resolve(target))) files.push(f);

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.includes('designos-system-ignore-file')) continue;
  const src = blankComments(raw);

  let css = '';
  if (/\.css$/.test(file)) css = src;
  else for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css += m[1];
  if (!css.trim()) continue;

  const report = (idx, rule, message) => {
    if (hasException(raw, idx)) return;
    push(rel, lineOf(raw, idx), rule, message);
  };
  const anchor = (needle, fallback = 0) => {
    const i = src.indexOf(needle);
    return i === -1 ? fallback : i;
  };

  const importsTokens = /tokens\.css/.test(src);
  const localTokens = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));

  /* ── required tokens ─────────────────────────────────────────────────────────────── */
  if (!importsTokens) {
    const missing = (lint.requiredTokens || []).filter(t => !localTokens.has(t));
    if (missing.length) {
      // one finding, not one per token — a page missing the contract has a single problem
      report(anchor(':root'), 'system-token-missing',
        `${missing.length} required ${lint.id} token(s) are neither defined here nor imported from ${slug}/tokens.css (${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ', …' : ''}). The page uses the system's token names without carrying its contract.`);
    }
  }

  /* ── palette membership ──────────────────────────────────────────────────────────── */
  for (const c of colorLiterals(css)) {
    const idx = anchor(c.raw, 0);
    if (c.kind === 'hex' && forbidden.has(c.key)) {
      report(idx, 'system-forbidden-color',
        `${c.raw} is a forbidden value in ${lint.id} — ${(lint.forbiddenColors && lint.forbiddenColors.reason) || 'the system bans it'}`);
      continue;
    }
    if (palette.has(c.key)) continue;
    report(idx, 'system-offpalette-color',
      `${c.raw} is not in the ${lint.id} palette derived from tokens.css. Use a token, or add the value to the system if it genuinely belongs to it — inventing colour at the page level is how a design system stops being one.`);
  }

  /* ── typefaces ───────────────────────────────────────────────────────────────────── */
  for (const m of css.matchAll(/font-family\s*:\s*([^;{}]+)/gi)) {
    const first = splitTop(m[1])[0] || '';
    if (/var\(/.test(first)) continue;
    const name = first.replace(/^['"]|['"]$/g, '').toLowerCase();
    if (faces.includes(name)) continue;
    report(anchor(m[0].slice(0, 60)), 'system-typeface-drift',
      `"${first.trim()}" leads this stack, but ${lint.id} declares ${faces.map(f => `"${f}"`).join(', ')}. Three faces, three jobs — a fourth family, or a generic first entry, dissolves the system's voice.`);
  }

  /* ── radius scale ────────────────────────────────────────────────────────────────── */
  for (const m of css.matchAll(/border-radius\s*:\s*([^;{}]+)/gi)) {
    for (const part of resolveVars(m[1]).trim().split(/\s+/)) {
      if (/var\(|inherit|%|^0$/.test(part)) continue;
      if (radii.has(part.toLowerCase())) continue;
      report(anchor(m[0].slice(0, 50)), 'system-radius-offscale',
        `border-radius ${part} is off the ${lint.id} scale (${[...radii].join(' / ')}). Mixed radius languages are an auto-finding in scoring/rubric.md.`);
    }
  }

  /* ── containers ──────────────────────────────────────────────────────────────────── */
  const widths = new Set();
  // `(?<![(])` keeps media features — `@media (max-width: 720px)` — out of this: a
  // breakpoint is not a container, and flagging it would punish correct responsive code.
  for (const m of css.matchAll(/(?<![(\w-])max-width\s*:\s*([^;{}]+)/gi)) {
    const resolved = resolveVars(m[1]).trim();
    const px = /^([\d.]+)px$/.exec(resolved);
    if (!px) continue;
    const value = resolved.toLowerCase();
    if (parseFloat(value) < 600) continue;
    widths.add(value);
    if (containers.has(value)) continue;
    report(anchor(m[0].slice(0, 40)), 'system-container-offscale',
      `container width ${value} is not one of ${lint.id}'s declared widths (${[...containers].join(' / ')}).`);
  }
  const minContainers = lint.minDistinctContainers || 0;
  if (minContainers && widths.size && widths.size < minContainers) {
    report(anchor('max-width'), 'system-container-single',
      `${widths.size} container width in use; ${lint.id} requires at least ${minContainers}. One width for a whole page is a column, not a composition.`);
  }

  /* ── easing set ──────────────────────────────────────────────────────────────────── */
  for (const m of css.matchAll(/(?:transition|animation)(?:-timing-function)?\s*:\s*([^;{}]+)/gi)) {
    for (const bez of resolveVars(m[1]).matchAll(/cubic-bezier\([^)]*\)/gi)) {
      const key = bez[0].replace(/\s+/g, '').toLowerCase();
      if (easings.has(key)) continue;
      report(anchor(bez[0]), 'system-easing-offsystem',
        `${bez[0]} is not one of ${lint.id}'s easings. One easing character per system, or the motion stops reading as one hand.`);
    }
  }

  /* ── elevation ───────────────────────────────────────────────────────────────────── */
  if (lint.elevation && lint.elevation.allowAdHoc === false) {
    // custom shadow properties count too: `--shadow: 0 4px 12px …` is a fourth level with
    // a different name. The system's own token definitions are exempt.
    const exemptProps = new Set((lint.elevation.exemptProperties || []).concat([...elevationTokens]));
    for (const m of css.matchAll(/(box-shadow|--[\w-]*shadow[\w-]*)\s*:\s*([^;{}]+)/gi)) {
      if (m[1].startsWith(lint.tokenPrefix || '--') || exemptProps.has(m[1])) continue;
      const value = m[2];
      if ([...elevationTokens].some(t => value.includes(t))) continue;
      const cast = splitTop(value).filter(l => !/\binset\b/i.test(l));
      // a solid ring (0 0 0 6px) or a focus glow is an edge, not an elevation level: what
      // makes it elevation is a non-zero blur in the third length slot
      const isElevation = cast.some(l => {
        const geometry = l.replace(/(?:rgba?|hsla?|var|color-mix)\([^)]*\)/gi, ' ')
          .replace(/#[0-9a-fA-F]{3,8}/g, ' ');
        const lengths = geometry.match(/-?[\d.]+(?:px|rem|em)?/g) || [];
        return lengths.length >= 3 && parseFloat(lengths[2]) > 0;
      });
      if (!isElevation) continue;
      report(anchor(m[0].slice(0, 40)), 'system-elevation-adhoc',
        `an inline cast shadow is used instead of ${[...elevationTokens].join(' / ')} — ${(lint.elevation.reason) || 'elevation comes from the declared levels'}`);
    }
  }

  /* ── accent budget ───────────────────────────────────────────────────────────────── */
  if (lint.accent && lint.accent.maxSolidFills) {
    const token = lint.accent.token;
    let fills = 0;
    let firstIdx = 0;
    for (const m of css.matchAll(/background(?:-color)?\s*:\s*([^;{}]+)/gi)) {
      // whole-token match: --kiln-ember-lift is a hover value, not a resting ember fill
      if (!usesToken(m[1], token)) continue;
      // gradients and alpha washes are not solid fills
      if (/gradient|rgb\(|\/\s*0?\./.test(m[1])) continue;
      if (!fills) firstIdx = anchor(m[0].slice(0, 50));
      fills++;
    }
    if (fills > lint.accent.maxSolidFills) {
      report(firstIdx, 'system-accent-overuse',
        `${fills} solid ${token} fills; ${lint.id} allows ${lint.accent.maxSolidFills}. ${(lint.accent.reason) || ''}`.trim());
    }
  }

  /* ── texture ─────────────────────────────────────────────────────────────────────── */
  if (lint.texture && lint.texture.required) {
    const present = (lint.texture.signals || []).some(sig => src.includes(sig));
    if (!present) {
      report(anchor('body'), 'system-texture-missing',
        `no texture layer found (looked for ${(lint.texture.signals || []).join(', ')}) — ${(lint.texture.reason) || 'the system requires one'}`);
    }
  }
}

/* ---------- report ---------- */

if (asJson) {
  console.log(JSON.stringify({ target, system: slug, findings, count: findings.length }, null, 2));
  // exitCode, not exit(): a directory scan can outrun the 64KB pipe buffer and exit()
  // truncates the JSON mid-string for anything reading our stdout.
  process.exitCode = findings.length ? 1 : 0;
  return;
}

for (const f of findings) console.log(`${f.file}:${f.line}  ${f.severity}  ${f.rule}  ${f.message}`);

if (findings.length) {
  console.log(`\ncheck-system-conformance (${slug}): ${findings.length} finding(s)`);
  process.exit(1);
}
console.log(`check-system-conformance (${slug}): clean — nothing in this source contradicts the contract (composition and fit still need eyes)`);
