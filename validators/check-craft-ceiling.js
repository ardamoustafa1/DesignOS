#!/usr/bin/env node
/**
 * DesignOS craft-ceiling checker — the flatness gate.
 *
 *   node check-craft-ceiling.js <src-dir-or-file> [--strict] [--json]
 *
 * Every other validator here polices a FLOOR: contrast that must pass, tokens that must
 * exist, motion that must not exceed a budget. A page can be clean under all of them and
 * still be flat — unlit surfaces, one black shadow, the system font stack, four identical
 * card sections, no arrival. That page satisfies CLAUDE.md §4 and misses §4.5, and it is
 * exactly the output people mean by "correct but not premium."
 *
 * This mechanizes the Ceiling Contract (CLAUDE.md §4.5). Each rule below is a line already
 * written in a module:
 *   ceiling-system-font-brand   foundations/typography.md "an unnamed typeface is an unowned identity"
 *   ceiling-black-shadow        foundations/materiality.md "the shadow hue is never black"
 *   ceiling-lcp-opacity-fade    motion/arrival.md "the LCP element never animates from opacity: 0"
 *   ceiling-display-no-tracking foundations/typography.md display tracking table
 *   ceiling-flat-elevation      foundations/materiality.md "elevation is a stack, never a shadow"
 *   ceiling-no-edge-highlight   foundations/materiality.md "the lit top edge"
 *   ceiling-no-texture          foundations/materiality.md "no large area is one flat colour"
 *   ceiling-uniform-rhythm      foundations/layout.md "no composition repeats twice in a row"
 *   ceiling-single-container    foundations/layout.md "≥2 container widths"
 *   ceiling-no-arrival          motion/arrival.md beat structure
 *   ceiling-no-memorable-moment brain/wow-calibration.md §1 "the four routes to memorable"
 *
 * ceiling-no-memorable-moment deliberately does NOT mandate motion. wow-calibration.md
 * names four routes to memorable — composition, material, voice, motion — and ranks motion
 * fourth: "before opening the catalogue, answer: could composition, material, or voice
 * carry this?" Composition is already covered by ceiling-uniform-rhythm; voice (copy
 * specificity) cannot be judged by a regex. This rule accepts EITHER route it can measure —
 * an inspectable material artifact (taste-ladder.md Level 95: "screenshot, workflow, table,
 * code, report... ") OR evidence of a licensed signature technique
 * (motion/signature-moments.md, components/visual-effects.md) — and a page satisfying
 * neither gets a soft advisory, never a mandate to add an effect it doesn't need.
 *

 * Severity model (same shape as check-aesthetic-slop.js):
 *   P2  a written ceiling rule is contradicted by the source → non-zero exit
 *   P3  a ceiling requirement is absent → printed, exit 0 unless --strict, because
 *       "you did not add texture" is a conversation and "you shadowed in pure black"
 *       is a mistake.
 *
 * Honest scope (workflows/final-gate.md still applies):
 *   - It reads source, not pixels. Whether the light model is coherent, whether the
 *     rhythm actually reads as rhythm, and whether the typeface has an opinion are
 *     judgments a regex cannot make. These rules catch the *literal, named* tells.
 *   - A clean run means "no known flatness tell was found", never "this is premium."
 *   - Runtime-composed styles (CSS-in-JS behind props, Tailwind resolved at build time)
 *     are skipped, not judged. Pass the compiled output to check those.
 *
 * Opt-outs for deliberate exceptions:
 *   file-level:  `designos-ceiling-ignore-file` anywhere in the file
 *   local:       `ceiling-ok: <reason>` on the finding's line or the 3 lines above it —
 *                the reason is mandatory, an escape without a why is drift.
 *
 * Exit: 0 clean (or P3-only without --strict) · 1 findings · 2 usage error
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { detectSignatures } = require('./signature-fingerprints');

const argv = process.argv.slice(2);
const strict = argv.includes('--strict');
const asJson = argv.includes('--json');
const target = argv.find(a => !a.startsWith('--'));
if (!target) {
  console.error('usage: check-craft-ceiling.js <src-dir-or-file> [--strict] [--json]');
  process.exit(2);
}

const SEVERITY = new Map([
  ['ceiling-system-font-brand',   'P2'],
  ['ceiling-black-shadow',        'P2'],
  ['ceiling-lcp-opacity-fade',    'P2'],
  ['ceiling-display-no-tracking', 'P2'],
  ['ceiling-flat-elevation',      'P3'],
  ['ceiling-no-edge-highlight',   'P3'],
  ['ceiling-no-texture',          'P3'],
  ['ceiling-uniform-rhythm',      'P3'],
  ['ceiling-single-container',    'P3'],
  ['ceiling-no-arrival',          'P3'],
  ['ceiling-no-memorable-moment', 'P3'],
]);

/* ---------- primitives (shared conventions with check-motion.js) ---------- */

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

// keeps byte offsets stable so every finding still maps to its real line
const blankComments = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '));

const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

/** Line-scoped escape hatch: the finding's own line and the three above it. */
function hasException(raw, idx) {
  const lines = raw.split('\n');
  const n = lineOf(raw, idx) - 1;
  for (let i = Math.max(0, n - 3); i <= n; i++) {
    if (/ceiling-ok:\s*\S/.test(lines[i] || '')) return true;
  }
  return false;
}

/** px value of a CSS length token, resolving rem at the 16px root. null if unknown. */
function toPx(value) {
  const m = /^(-?[\d.]+)(px|rem|em)$/.exec(value.trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] === 'px' ? n : n * 16;
}

/** Largest px length inside a font-size value, including clamp()/min()/max() arguments. */
function largestLength(value) {
  let max = null;
  for (const m of value.matchAll(/(-?[\d.]+)(px|rem)\b/g)) {
    const px = toPx(m[1] + m[2]);
    if (px !== null && (max === null || px > max)) max = px;
  }
  return max;
}

/** Split a comma-separated CSS value into layers, ignoring commas inside parentheses. */
function layers(value) {
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

/**
 * Does this shadow value cast anything? A ring (`0 0 0 1px`), a focus glow, and an inset
 * highlight are edge treatments — judging them as failed elevation would report a flat
 * page on a file whose only shadows are correct edges.
 */
function isCastShadow(value) {
  return layers(value).filter(l => !/\binset\b/i.test(l)).some(l => {
    const geometry = l.replace(/(?:rgba?|hsla?|var|color-mix)\([^)]*\)/gi, ' ')
      .replace(/#[0-9a-fA-F]{3,8}/g, ' ');
    const lengths = geometry.match(/-?[\d.]+(?:px|rem|em)?/g) || [];
    return lengths.length >= 3 && parseFloat(lengths[2]) > 0;
  });
}

/** Final simple selector of each comma-separated part — "hero h1, .x .y" → ["h1", ".y"]. */
function leafSelectors(selector) {
  return selector.split(',')
    .map(part => part.trim().split(/[\s>+~]+/).filter(Boolean).pop() || '')
    .filter(Boolean);
}

/** Split a stylesheet into { selector, body, index } rule blocks (one level deep). */
function ruleBlocks(css) {
  const out = [];
  const re = /([^{}@]+)\{([^{}]*)\}/g;
  for (const m of css.matchAll(re)) {
    out.push({ selector: m[1].trim(), body: m[2], index: m.index + m[1].length });
  }
  return out;
}

/* ---------- run ---------- */

const findings = [];
const files = [];
for (const f of walk(target)) files.push(f);

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.includes('designos-ceiling-ignore-file')) continue;
  const src = blankComments(raw);
  const isMarkup = /\.(html|jsx?|tsx?|vue|svelte)$/.test(file);

  const push = (idx, rule, message) => {
    if (hasException(raw, idx)) return;
    findings.push(`${file}:${lineOf(raw, idx)}  ${rule}  ${message}`);
  };

  /* Only the style surface of a markup file is CSS. For .html/.vue/.svelte that is the
     <style> content; for plain .css it is the whole file. Everything outside is markup. */
  let css = '';
  if (/\.css$/.test(file)) {
    css = src;
  } else {
    for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css += m[1];
  }
  // Offsets inside the extracted CSS no longer map to file lines, so CSS findings are
  // anchored by re-finding the matched text in the original source.
  const anchor = (needle, fallback = 0) => {
    const i = src.indexOf(needle);
    return i === -1 ? fallback : i;
  };

  const hasStyle = css.trim().length > 0;

  /* ── P2 · named typefaces (typography.md — type identity) ────────────────────────── */
  const SYSTEM_FIRST = /^(system-ui|ui-sans-serif|ui-serif|ui-monospace|-apple-system|BlinkMacSystemFont|sans-serif|serif|monospace|Arial|Helvetica(\s+Neue)?|Times(\s+New\s+Roman)?)$/i;
  for (const m of css.matchAll(/(?:^|[;{])\s*(--[\w-]*font[\w-]*|font-family)\s*:\s*([^;{}]+)/gi)) {
    const first = m[2].split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    if (!SYSTEM_FIRST.test(first)) continue;
    // Monospace stacks are out of scope: `ui-monospace` is the conventional first entry for
    // code surfaces and does not carry the brand the way the display face does.
    if (/mono/i.test(first) || /mono/i.test(m[1])) continue;
    // anchor on the declaration, not the rule's opening brace, so `ceiling-ok:` on the
    // three lines above the declaration resolves where an author would put it
    const decl = m[0].slice(m[0].indexOf(m[1]));
    push(anchor(decl.slice(0, 60)), 'ceiling-system-font-brand',
      `"${first}" is the first family in ${m[1].trim()} — the brand face resolves to whatever the OS ships, so the page has no typographic identity and renders differently on every platform. Name the display face (foundations/typography.md § Type identity).`);
  }

  /* ── P2 · shadows must carry the page hue, never pure black ──────────────────────────
   * Cast layers only. An `inset ... rgb(0 0 0 / .2)` is the shaded bottom edge from
   * materiality.md §3, which is meant to be neutral — flagging it would contradict the
   * module the rule enforces. */
  const BLACK = /rgba?\(\s*0\s*[, ]\s*0\s*[, ]\s*0\s*[,/ )]|#000\b|#000000\b/i;
  for (const m of css.matchAll(/(?:box-shadow|--[\w-]*shadow[\w-]*)\s*:\s*([^;{}]+)/gi)) {
    const cast = layers(m[1]).filter(l => !/\binset\b/i.test(l));
    if (!cast.some(l => BLACK.test(l))) continue;
    push(anchor(m[0].trim().slice(0, 60)), 'ceiling-black-shadow',
      'a cast shadow layer is pure black alpha — on any tinted surface this renders as grey film, the "dusty" tell. Tint --shadow-rgb toward the page hue, darker and more saturated (foundations/materiality.md §2).');
  }

  /* ── P2 · the LCP element must not fade in ───────────────────────────────────────── */
  for (const block of ruleBlocks(css)) {
    if (!/\bh1\b|\.hero[\w-]*\s+h1|\bhero-title\b/i.test(block.selector)) continue;
    if (!/opacity\s*:\s*0\s*(;|$)/.test(block.body)) continue;
    push(anchor(block.selector), 'ceiling-lcp-opacity-fade',
      `"${block.selector}" starts at opacity: 0 — if the h1 is the LCP element this delays Largest Contentful Paint by the full animation duration. Animate a mask, clip-path, or child instead (motion/arrival.md §1).`);
  }

  /* ── P2 · display sizes need display optics ──────────────────────────────────────────
   * Tracking is routinely set on a shared `h1, h2, h3` rule and the size on a scoped one,
   * so a block-local check alone would fire on correct code. Collect every leaf selector
   * that receives negative tracking anywhere in the file first. */
  const tracked = new Set();
  for (const block of ruleBlocks(css)) {
    const ls = /letter-spacing\s*:\s*(-?[\d.]+)(px|rem|em)/i.exec(block.body);
    if (ls && parseFloat(ls[1]) < 0) for (const leaf of leafSelectors(block.selector)) tracked.add(leaf);
  }
  for (const block of ruleBlocks(css)) {
    const fs_ = /(?:^|[;{\s])font-size\s*:\s*([^;{}]+)/i.exec(block.body);
    if (!fs_) continue;
    const px = largestLength(fs_[1]);
    if (px === null || px < 40) continue;
    if (leafSelectors(block.selector).every(leaf => tracked.has(leaf))) continue;
    push(anchor(block.selector), 'ceiling-display-no-tracking',
      `"${block.selector}" sets display type (~${Math.round(px)}px) with no negative letter-spacing — display sizes need −0.02em to −0.04em or they read as enlarged body text (foundations/typography.md § Type identity table).`);
  }

  if (!hasStyle) continue;

  /* A stylesheet that only defines custom properties is a token layer, not a page. Judging
     its elevation or its edges reports "this file is flat" on a file that has no surfaces
     at all — the same class of false positive as reading `var(--elev-2)` as single-layer.
     The value rules below (black shadow, system font, display tracking) still apply: those
     are wrong wherever they appear. */
  const declarations = [...css.replace(/@[\w-]+[^;{]*[;{]/g, ' ')
    .matchAll(/(^|[;{])\s*(--)?[a-z-]+\s*:/gi)];
  const customCount = declarations.filter(m => m[2]).length;
  // "Token layer" is a ratio, not an absolute: a token file legitimately carries a handful
  // of real declarations (`color-scheme`, a reduced-motion reset) alongside its properties.
  const tokenOnly = /\.css$/.test(file)
    && declarations.length > 0
    && customCount / declarations.length >= 0.9;

  /* ── P3 · elevation must be a stack with more than one level ─────────────────────── */
  const shadowValues = [...css.matchAll(/box-shadow\s*:\s*([^;{}]+)/gi)].map(m => m[1].trim());
  /* `--shadow-rgb: 4 6 12` is a colour channel set, not a shadow. Without the unit test it
     parses as a single-layer cast shadow and reports the flattest possible page on files
     whose elevation is correct — which is the opposite of this rule's job. */
  const shadowVars = [...css.matchAll(/--[\w-]*shadow[\w-]*\s*:\s*([^;{}]+)/gi)]
    .map(m => m[1].trim())
    .filter(v => /-?[\d.]+(px|rem|em)/.test(v));
  const allShadows = [...shadowValues, ...shadowVars].filter(v => !/^\s*none\s*$/i.test(v));
  /* A `box-shadow: var(--elev-2)` hides its layer count behind the token. Judging those as
     single-layer would punish exactly the pages that keep elevation in a token layer — the
     thing this file is asking for. They are unresolvable here, not flat; the system
     conformance checker resolves them against the package that defines them. */
  const resolvable = allShadows.filter(v => !/^\s*var\(/.test(v)).filter(isCastShadow);
  const multiLayer = resolvable.filter(v => layers(v).length > 1);
  const distinct = new Set(resolvable.map(v => v.replace(/\s+/g, ' ')));
  // A card/panel-shaped surface (rounded corner + a fill or border) with ZERO shadow
  // anywhere is the flattest possible page — more absent than the single-layer or
  // reused-token cases below, which at least attempted elevation. Checking
  // `resolvable.length` before this used to mean a page that never tried had nothing to
  // compare against and produced no finding at all, while a page that tried and got it
  // slightly wrong (one flat shadow) did — rewarding not trying. Gate on hasSurfaces
  // (computed once here, reused by the edge-highlight check below) rather than firing on
  // any shadow-free file, so plain-text content with no surfaces at all isn't flagged.
  const hasSurfaces = /border-radius\s*:/.test(css) && /border\s*:|background(-color)?\s*:/.test(css);
  if (tokenOnly) { /* page-level depth rules do not apply to a token layer */ }
  else if (!resolvable.length && hasSurfaces) {
    push(anchor('border-radius'), 'ceiling-flat-elevation',
      'rounded, filled/bordered surfaces exist but no box-shadow (or --shadow-* token) appears anywhere — zero elevation is flatter than a wrong one. A raised surface is occlusion + key shadow + edge highlight + surface tint (foundations/materiality.md §2).');
  } else if (resolvable.length && multiLayer.length === 0) {
    push(anchor(allShadows[0].slice(0, 40)), 'ceiling-flat-elevation',
      `every shadow in this file is single-layer (${distinct.size} distinct value(s)) — a raised surface is occlusion + key shadow + edge highlight + surface tint, not one blur (foundations/materiality.md §2).`);
  } else if (distinct.size === 1 && resolvable.length > 1) {
    push(anchor(resolvable[0].slice(0, 40)), 'ceiling-flat-elevation',
      'one shadow value is reused for every raised surface — that is an elevation token, not an elevation hierarchy. Three levels, and something must sit above level 1 (foundations/materiality.md §2).');
  }

  /* ── P3 · lit edges ──────────────────────────────────────────────────────────────── */
  if (!tokenOnly && hasSurfaces && resolvable.length && !/inset\b/i.test(css)) {
    push(anchor('box-shadow'), 'ceiling-no-edge-highlight',
      'surfaces cast shadows but no inset highlight exists anywhere — real material catches light on the edge opposite the shadow. `inset 0 1px 0 rgb(255 255 255 / .07)` (foundations/materiality.md §3).');
  }

  /* ── P3 · texture on large fills ─────────────────────────────────────────────────── */
  if (isMarkup) {
    const hasGrain = /feTurbulence|baseFrequency|noise|grain/i.test(src);
    const hasGradation = /(linear|radial|conic)-gradient/i.test(css);
    if (!hasGrain && !hasGradation) {
      push(anchor('body'), 'ceiling-no-texture',
        'no grain and no fill gradation anywhere — every large area is one flat colour, the most synthetic thing on a screen. Add an feTurbulence tile at 2–4% and a 2–4% gradation across large fills (foundations/materiality.md §5).');
    }
  }

  /* ── P3 · section rhythm ─────────────────────────────────────────────────────────── */
  if (isMarkup) {
    const sections = [...src.matchAll(/<section\b([^>]*)>/gi)];
    if (sections.length >= 4) {
      const signature = sections.map(m => {
        const cls = /class\s*=\s*["']([^"']*)["']/.exec(m[1]);
        return (cls ? cls[1] : '').split(/\s+/).sort().join(' ');
      });
      const unique = new Set(signature);
      if (unique.size <= 1) {
        push(sections[1].index, 'ceiling-uniform-rhythm',
          `${sections.length} sections share one class signature ("${signature[0] || '(none)'}") — eyebrow → heading → equal cards → divider, repeated, is the uniform-rhythm tell. Vary at least two of width / structure / density / ground between neighbours (foundations/layout.md § Section rhythm).`);
      }
    }
    // The >=4 <section>-tag check above only sees pages built from top-level <section>
    // wrappers. A short landing page (hero + one features grid + footer — the single most
    // common "MVP" shape, and never >=4 <section>s) can still carry the exact tell the
    // check above exists to catch: 3+ sibling cards sharing one class, each with its own
    // heading — "eyebrow → h2 → equal cards", just not wrapped in <section>. Same finding,
    // reached a different way, so a short page isn't exempt from the one thing this rule
    // is named for.
    const cardGroups = new Map();
    for (const m of src.matchAll(/<(div|article|li)\s+class="([^"]+)"[^>]*>/gi)) {
      const key = `${m[1].toLowerCase()}.${m[2].trim()}`;
      const hasHeading = /<h[3-6]\b/i.test(src.slice(m.index, m.index + 400));
      if (!hasHeading) continue;
      if (!cardGroups.has(key)) cardGroups.set(key, []);
      cardGroups.get(key).push(m.index);
    }
    for (const [key, positions] of cardGroups) {
      if (positions.length < 3) continue;
      // clustered = these are siblings in one grid, not the same class reused in
      // unrelated parts of a long page
      const span = positions[positions.length - 1] - positions[0];
      if (span > 6000) continue;
      push(positions[1], 'ceiling-uniform-rhythm',
        `${positions.length} elements share the exact class "${key}", each with its own heading — icon → heading → one-liner, repeated N times in a grid, is the uniform-rhythm tell just as much as repeated <section>s (foundations/layout.md § Section rhythm).`);
      break; // one finding per file for this path is enough signal
    }

    // `(?<![(])` keeps `@media (max-width: 720px)` out of this — a breakpoint is not a
    // container, and counting it inverts the finding on correct responsive code.
    const widths = new Set(
      [...css.matchAll(/(?<![(\w-])max-width\s*:\s*([\d.]+)(px|rem)/gi)]
        .map(m => toPx(m[1] + m[2]))
        .filter(px => px !== null && px >= 600)
        .map(px => Math.round(px)),
    );
    if (widths.size === 1) {
      push(anchor('max-width'), 'ceiling-single-container',
        `one container width (${[...widths][0]}px) for the whole page — with no narrow, wide, or full-bleed moment the page has a column, not a composition (foundations/layout.md § Section rhythm).`);
    }
  }

  /* ── P3 · the arrival ────────────────────────────────────────────────────────────── */
  const isAppSurface = /\b(dashboard|settings|checkout|admin|console)\b/i.test(path.basename(file));
  if (isMarkup && /<h1\b/i.test(src)) {
    // A cross-document View Transition replaces the arrival on internal navigations —
    // running both is two animations arguing (motion/arrival.md §4).
    const hasViewTransition = /view-transition|::view-transition/i.test(src);
    const hasArrival = /@keyframes/.test(css) || /animation\s*:/.test(css) || /animate\b/.test(src);
    if (!isAppSurface && !hasViewTransition && !hasArrival) {
      push(anchor('<h1'), 'ceiling-no-arrival',
        'the page has an h1 and no arrival — no keyframes, no animation declaration. A marketing surface appearing fully formed and inert is a screenshot; give it a beat-structured entrance (motion/arrival.md §1).');
    }
  }

  /* ── P3 · one memorable moment — the material OR motion route, never a motion mandate ─
     wow-calibration.md's four routes: composition (already ceiling-uniform-rhythm), material,
     voice (unfalsifiable by regex), motion. A page that has neither an inspectable artifact
     nor evidence of a licensed signature technique is the "correct but forgettable" failure
     the module names — but a page carrying either is DONE; this never asks for both, and
     never asks for motion specifically. */
  if (isMarkup && /<h1\b/i.test(src) && !isAppSurface) {
    // material route: taste-ladder.md Level 95 — "an inspectable artifact: screenshot,
    // workflow, table, code, report, map, feed, timeline, or demo state."
    const hasTable = /<table\b/i.test(src);
    const hasCodeBlock = /<(?:pre|code)\b[^>]*>[\s\S]{80,}?<\/(?:pre|code)>/i.test(src);
    const hasChart = /<svg\b[\s\S]{0,4000}?<\/svg>/i.test(src) && /<(?:path|rect|circle|polyline|polygon)\b/i.test(src);
    // "Framed screenshot" recipe (components/visual-effects.md): a shadowed, radiused
    // container whose selector name signals it holds the product artefact.
    const framedNames = [...css.matchAll(/([.#][\w-]*(?:shot|screenshot|frame|artifact|report|plate|preview)[\w-]*)\s*\{([^{}]*)\}/gi)]
      .some(m => /border-radius\s*:/.test(m[2]) && /box-shadow\s*:/.test(m[2]));
    const materialRoute = hasTable || hasCodeBlock || hasChart || framedNames;

    // motion route: the 11 named techniques by exact code shape, PLUS the broader mechanism
    // patterns from components/visual-effects.md's element recipes, matched by shape rather
    // than by the literal function names motion/signature-moments.md's samples happen to
    // use — a hand-rolled "index preview plate" is still a signature.
    const namedSignature = detectSignatures(src).length > 0;
    const hasBorderBeam = /@property\s+--angle/.test(src) && /conic-gradient\(\s*from\s+var\(--angle\)/.test(css);
    // pointer-follow: a decorative element whose transform is written from pointermove,
    // with will-change armed/dropped around the loop — the shape shared by the magnetic,
    // spotlight, and tilt recipes regardless of what the page's own functions are named.
    const hasPointerFollow = /pointermove/.test(src) && /\.style\.transform\s*=/.test(src) && /will-change/i.test(src);
    // scroll story broadened past the literal `scene(` fingerprint: a sticky stage pinned
    // inside a rail tall enough to actually drive a multi-beat scroll sequence.
    const stickyRail = /position:\s*sticky/.test(css)
      && [...css.matchAll(/height:\s*([\d.]+)vh/gi)].some(m => parseFloat(m[1]) >= 150);
    const motionRoute = namedSignature || hasBorderBeam || hasPointerFollow || stickyRail;

    if (!materialRoute && !motionRoute) {
      push(anchor('<h1'), 'ceiling-no-memorable-moment',
        'no inspectable material artifact (table, code block, chart, framed screenshot) and no evidence of a licensed signature technique — this is the "correct but forgettable" failure named in brain/wow-calibration.md §1. Either route closes this: an inspectable artifact is usually cheaper than a motion signature, and motion is not required (composition and voice are also valid routes this checker cannot measure).');
    }
  }
}

/* ---------- report ---------- */

const LINE_RE = /^(.+?):(\d+)\s{2}([\w-]+)\s{2}([\s\S]*)$/;
function toStructured(line) {
  const m = LINE_RE.exec(line);
  if (!m) return { file: '', line: 0, rule: '', severity: 'P2', message: line };
  const [, file, ln, rule, message] = m;
  return { file, line: Number(ln), rule, severity: SEVERITY.get(rule) || 'P2', message };
}

const structured = findings.map(toStructured);
const blocking = structured.filter(f => f.severity !== 'P3');
const advisories = structured.filter(f => f.severity === 'P3');

if (asJson) {
  console.log(JSON.stringify({ target, findings: structured, count: structured.length }, null, 2));
  // exitCode, not exit(): see check-system-integrity.js — exit() truncates large piped JSON.
  process.exitCode = blocking.length || (strict && advisories.length) ? 1 : 0;
  return;
}

for (const f of structured) console.log(`${f.file}:${f.line}  ${f.severity}  ${f.rule}  ${f.message}`);

if (blocking.length || (strict && advisories.length)) {
  console.log(`\ncheck-craft-ceiling: ${blocking.length} violation(s), ${advisories.length} advisory(ies)`);
  process.exit(1);
}
if (advisories.length) {
  console.log(`\ncheck-craft-ceiling: ${advisories.length} advisory(ies) — ceiling requirements absent, not contradicted. Re-run with --strict to make these blocking.`);
  process.exit(0);
}
console.log('check-craft-ceiling: clean (source-level only — whether the light is coherent and the type has an opinion still needs eyes)');
