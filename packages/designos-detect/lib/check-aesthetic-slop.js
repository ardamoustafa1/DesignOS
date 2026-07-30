#!/usr/bin/env node
/**
 * DesignOS aesthetic-slop checker — mechanizes the failure modes DesignOS already names.
 *
 *   node check-aesthetic-slop.js <src-dir-or-file> [--strict]
 *
 * brain/design-intelligence.md names the model's own default failure modes (centered-
 * everything, gradient abuse, card-itis, emoji-as-icons, fake numbers) and brain/
 * originality.md bans template defaults — but naming a failure mode in prose only helps
 * a reader who is already looking for it. This turns the named list into a gate.
 *
 * Severity model (unlike the other validators, which are binary):
 *   P1/P2  violations of a written DesignOS rule → non-zero exit
 *   P3     taste advisories (defaults that are legal but unearned) → printed, exit 0
 *          unless --strict, because "you picked the default" is a conversation,
 *          not a compile error.
 *
 * Honest scope (final-gate.md still applies):
 *   - It reads source, not pixels. Card-itis, weak hierarchy, and bad composition are
 *     judgments a regex cannot make; these rules only catch the *named, literal* tells.
 *   - A clean run means "no known default was used verbatim", never "this is original".
 *     Originality is argued in the derivation chain (brain/brief-compiler.md), not here.
 *
 * Opt-outs:
 *   file-level:  `designos-slop-ignore-file`
 *   local:       `slop-ok: <reason>` within ~200 chars — the reason is mandatory
 */
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const target = argv.find(a => !a.startsWith('--'));
const strict = argv.includes('--strict');
if (!target) {
  console.error('usage: check-aesthetic-slop.js <src-dir-or-file> [--strict]');
  process.exit(2);
}

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

const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

/**
 * Line-scoped, not character-scoped: a single CSS rule is routinely 300+ characters, so a
 * byte window either misses the comment above the rule or leaks into the next one. The
 * directive is honoured on the finding's own line and the three lines above it.
 */
function hasException(raw, idx) {
  const lines = raw.split('\n');
  const n = lineOf(raw, idx) - 1;
  return lines.slice(Math.max(0, n - 3), n + 1).some(l => /slop-ok\s*:/i.test(l));
}
const blankComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '));

/* ---------- color math (hue is what identifies a palette default) ---------- */

function hexToHsl(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue;
  if (max === r) hue = ((g - b) / d) % 6;
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return { h: hue, s, l };
}

// the violet→fuchsia band every image model and every LLM reaches for first
const AI_PURPLE = (c) => c && c.h >= 250 && c.h <= 330 && c.s >= 0.35 && c.l > 0.25 && c.l < 0.85;
const NAMED_PURPLE = /\b(purple|violet|indigo|fuchsia|magenta|rebeccapurple)\b/i;
// the "warm craft" reflex: cream + clay/brass + near-black, shipped as if it were a decision
const WARM_CRAFT = (c) => c && c.h >= 18 && c.h <= 52 && c.s >= 0.12 && c.s <= 0.75 && c.l > 0.2 && c.l < 0.8;
const CREAM = (c) => c && c.h >= 20 && c.h <= 60 && c.s >= 0.1 && c.l >= 0.88;

/* ---------- named defaults (brain/originality.md: transfer a tactic, not a costume) ---------- */

const DEFAULT_TYPEFACES = /\b(Inter|Roboto|Poppins|Montserrat|Space Grotesk|Fraunces|Instrument Serif|Plus Jakarta Sans|DM Sans|Manrope)\b/;

const FILLER_COPY = new RegExp([
  'elevate your', 'unlock the (power|potential)', 'take your \\w+ to the next level',
  'revolutioniz(e|ing)', 'game[- ]changing', 'cutting[- ]edge', 'supercharge',
  'seamlessly integrat', 'effortlessly', 'in just seconds', '\\b10x\\b',
  'harness the power', 'transform the way', 'built for the future', 'reimagine',
  'the future of \\w+ is here', 'say goodbye to',
].join('|'), 'gi');

const PLACEHOLDER_IDENTITY = /\b(acme(\s+(corp|inc|co))?|john doe|jane doe|jane smith|john smith|company name|your company|example@example\.com|user@example\.com|lorem ipsum|placeholder\.com|via\.placeholder)\b/gi;

/* ---------- HTML helpers ---------- */

function visibleText(raw) {
  return raw
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, m => m.replace(/[^\n]/g, ' '))
    .replace(/<[^>]+>/g, m => m.replace(/[^\n]/g, ' '));
}

/**
 * naive but sufficient element stack — finds a card-ish box inside a card-ish box.
 * BEM-aware: only the LAST segment counts, so `feature-card` is a card while
 * `card-top` / `panel-head` are regions *of* one and must not trip the rule.
 */
const isCardClass = (cls) =>
  cls.split(/\s+/).filter(Boolean).some(token =>
    /^(card|panel|tile|surface)$/i.test(token.split(/[-_]/).pop()));

function nestedCards(raw) {
  const VOID_TAG = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
  const hits = [];
  const stack = [];
  for (const m of raw.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g)) {
    const [, closing, tag, attrs] = m;
    if (VOID_TAG.test(tag) || /\/\s*$/.test(attrs)) continue;
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag.toLowerCase() === tag.toLowerCase()) { stack.length = i; break; }
      }
      continue;
    }
    const cls = (attrs.match(/class(?:Name)?\s*=\s*["']([^"']*)["']/) || [])[1] || '';
    const isCard = isCardClass(cls);
    if (isCard && stack.some(s => s.isCard)) hits.push({ index: m.index, cls: cls.trim().slice(0, 48) });
    stack.push({ tag, isCard });
  }
  return hits;
}

/* ---------- the pass ---------- */

const findings = [];
for (const file of [...walk(path.resolve(target))]) {
  const raw = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file);
  if (raw.includes('designos-slop-ignore-file')) {
    console.log(`skipped (ignore directive): ${rel}`);
    continue;
  }
  const clean = blankComments(raw);
  const isHtmlish = /\.(html|jsx?|tsx?|vue|svelte)$/.test(file);
  const push = (idx, severity, rule, detail) => {
    if (hasException(raw, idx)) return;
    findings.push({ severity, line: `${rel}:${lineOf(raw, idx)}`, rule, detail });
  };

  /* ── the AI-default gradient ── */
  for (const m of clean.matchAll(/(linear|radial|conic)-gradient\(([^;]*?)\)/g)) {
    const stops = [...m[2].matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(x => hexToHsl(x[0]));
    const purpleStops = stops.filter(AI_PURPLE).length;
    const namedPurple = (m[2].match(NAMED_PURPLE) || []).length;
    if (purpleStops >= 2 || (purpleStops >= 1 && namedPurple >= 1) || namedPurple >= 2) {
      push(m.index, 'P2', 'slop-ai-gradient',
        `violet→fuchsia gradient is the single most recognizable AI-default palette — it says "generated", not "designed" (brain/originality.md; brain/design-intelligence.md "gradient abuse")`);
    }
  }

  /* ── gradient text ── */
  for (const m of clean.matchAll(/-webkit-background-clip\s*:\s*text|background-clip\s*:\s*text/g)) {
    const near = clean.slice(Math.max(0, m.index - 400), m.index + 400);
    if (/gradient\(/.test(near)) {
      push(m.index, 'P2', 'slop-gradient-text',
        'gradient-filled text — the contrast ratio becomes unmeasurable across the fill, and it is a template tell; color the text with a token and let the composition carry the emphasis (foundations/colors.md, brain/originality.md)');
    }
  }

  /* ── glass as decoration ── */
  for (const m of clean.matchAll(/backdrop-filter\s*:\s*[^;]*blur/g)) {
    const block = clean.slice(Math.max(0, clean.lastIndexOf('{', m.index)), m.index);
    const selector = clean.slice(Math.max(0, clean.lastIndexOf('}', m.index) + 1), clean.lastIndexOf('{', m.index));
    const overlay = /position\s*:\s*(fixed|sticky)/.test(block) ||
      /(nav|header|modal|dialog|overlay|drawer|sheet|toast|popover|dropdown|backdrop|scrim)/i.test(selector);
    if (!overlay) {
      push(m.index, 'P3', 'slop-glass-decoration',
        'backdrop-blur on a non-overlay surface — glass is a depth cue for something floating over content; on a static card it is costume, and it costs a full-surface repaint (components/visual-effects.md, motion/performance.md)');
    }
  }

  if (isHtmlish) {
    /* ── nested cards ── */
    for (const hit of nestedCards(clean)) {
      push(hit.index, 'P2', 'slop-nested-card',
        `card inside a card ("${hit.cls}") — two borders and two paddings for one idea; the inner box needs no chrome (brain/design-intelligence.md "card-itis", components/cards.md)`);
    }

    /* ── emoji standing in for an icon system ── */
    const vis = visibleText(clean);
    for (const m of clean.matchAll(/<(button|a|h[1-6]|li|summary|th|legend)\b[^>]*>([\s\S]{0,200}?)<\/\1>/gi)) {
      const inner = m[2].replace(/<[^>]+>/g, '');
      // pictographic emoji only — arrows (↗ →), check marks (✓), and other dingbats are
      // typography, not emoji-as-icons, and flagging them was noise
      const emoji = inner.match(/[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u{2600}-\u{26FF}\u{2728}\u{2705}\u{274C}\u{2B50}]/gu);
      if (emoji) {
        push(m.index, 'P2', 'slop-emoji-icon',
          `emoji "${emoji[0]}" used as UI iconography in <${m[1]}> — emoji render differently per platform, cannot inherit color or stroke weight, and are read aloud by screen readers as their CLDR name (brain/design-intelligence.md "emoji-as-icons", foundations/iconography.md)`);
      }
    }

    /* ── copy tells ── */
    for (const m of vis.matchAll(FILLER_COPY)) {
      push(m.index, 'P2', 'slop-filler-copy',
        `"${m[0].trim()}" is category filler — it would be true of any competitor, so it says nothing about this product (psychology/persuasion.md, brain/originality.md)`);
    }
    for (const m of vis.matchAll(PLACEHOLDER_IDENTITY)) {
      push(m.index, 'P2', 'slop-placeholder-identity',
        `"${m[0].trim()}" is placeholder identity left in the artifact — either make the fiction explicit and internally consistent, or use real material (PROOF_STANDARD.md)`);
    }

    /* ── the em-dash cadence tell ── */
    const words = (vis.match(/\b[\w']+\b/g) || []).length;
    const dashes = (vis.match(/—/g) || []).length;
    if (dashes >= 6 && words > 0 && dashes / words > 1 / 60) {
      const idx = vis.indexOf('—');
      push(idx < 0 ? 0 : idx, 'P3', 'slop-em-dash-cadence',
        `${dashes} em-dashes in ~${words} words — that rhythm is a generated-prose fingerprint, not house voice; most become a period or a comma (agents/copywriter.md)`);
    }

    /* ── everything centered ── */
    const centered = [...clean.matchAll(/text-align\s*:\s*center/g)];
    if (centered.length >= 6) {
      push(centered[0].index, 'P3', 'slop-centered-everything',
        `${centered.length} centered text rules — centering every block flattens hierarchy and destroys the left edge the eye scans; center the hero, left-align the argument (brain/design-intelligence.md "centered-everything", foundations/layout.md)`);
    }

    /* ── eyebrow inflation (the label above every heading) ── */
    const eyebrows = [...clean.matchAll(/class(?:Name)?\s*=\s*["'][^"']*\b(eyebrow|kicker|overline|pretitle|section-label)\b/gi)];
    const sections = (clean.match(/<section\b/gi) || []).length;
    if (eyebrows.length > Math.max(1, Math.ceil(sections / 3))) {
      push(eyebrows[0].index, 'P3', 'slop-eyebrow-inflation',
        `${eyebrows.length} eyebrow labels across ${sections} sections — when every section announces itself, the announcement stops meaning anything; roughly one per three sections earns its keep (foundations/typography.md)`);
    }
  }

  /* ── palette defaults ── */
  const tokenHexes = [...clean.matchAll(/--[\w-]+\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)].map(m => m[1]);
  const hsls = tokenHexes.map(hexToHsl).filter(Boolean);
  if (hsls.filter(WARM_CRAFT).length >= 3 && hsls.some(CREAM)) {
    const idx = clean.search(/--[\w-]+\s*:\s*#/);
    push(idx < 0 ? 0 : idx, 'P3', 'slop-warm-craft-default',
      'cream + clay/brass + near-black is the "premium artisan" reflex palette — legal, but it arrives by default rather than by argument; if it is right for this brand, record why in memory/design.md (brain/originality.md)');
  }

  for (const m of clean.matchAll(/font-family\s*:\s*([^;}\n]+)/g)) {
    const hit = m[1].match(DEFAULT_TYPEFACES);
    if (hit && !/var\(\s*--/.test(m[1])) {
      push(m.index, 'P3', 'slop-default-typeface',
        `${hit[1]} is a default-tier typeface choice — it is a fine face, but picking it is not yet a decision; either justify it against the brand belief or rotate (brain/originality.md, foundations/typography.md)`);
    }
  }
}

/* ---------- report ---------- */

const order = { P1: 0, P2: 1, P3: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity]);

const blocking = findings.filter(f => f.severity !== 'P3');
const advisory = findings.filter(f => f.severity === 'P3');

if (argv.includes('--json')) {
  const structured = findings.map(f => {
    const at = f.line.lastIndexOf(':');
    return { file: f.line.slice(0, at), line: Number(f.line.slice(at + 1)), rule: f.rule, severity: f.severity, message: f.detail };
  });
  console.log(JSON.stringify({ target, findings: structured, count: structured.length }, null, 2));
  process.exit((strict ? findings.length : blocking.length) ? 2 : 0);
}

for (const f of findings) console.log(`${f.line}  ${f.severity}  ${f.rule}  ${f.detail}`);

if (findings.length) {
  console.log(`\ncheck-aesthetic-slop: ${blocking.length} violation(s), ${advisory.length} advisory`);
} else {
  console.log('check-aesthetic-slop: clean (no named default used verbatim — this is not a claim of originality)');
}
process.exit(blocking.length || (strict && advisory.length) ? 1 : 0);
