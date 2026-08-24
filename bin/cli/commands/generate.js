/**
 * designos generate — Design System Generator
 *
 * Analyzes a brief and produces a complete, ready-to-use design system:
 * industry playbook routing · color palette (contrast-verified) · typography pairing ·
 * motion budget · component pattern spine · anti-pattern list · delivery checklist.
 *
 * Usage:
 *   node DesignOS/bin/designos.js generate --brief "SaaS pricing page, dark, B2B"
 *   node DesignOS/bin/designos.js generate --brief "spa booking app" --out my-design-system.md
 *   node DesignOS/bin/designos.js generate --brief "fintech dashboard" --json
 *   node DesignOS/bin/designos.js generate --brief "AI copilot" --dial    (respects designos.config.js)
 *
 * Runs 5 parallel scoring passes (sector · style · palette · pattern · typography)
 * then merges them into a single actionable design system document.
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ────────────────────────────────────────────────────────────────────────────────
// 192 style categories (condensed — representative set for scoring)
// ────────────────────────────────────────────────────────────────────────────────
const STYLE_CATEGORIES = [
  { id: 'confident-minimalism', label: 'Confident Minimalism', keywords: ['saas', 'b2b', 'productivity', 'software', 'stripe', 'linear'], weight: 8 },
  { id: 'dark-technical',       label: 'Dark Technical',       keywords: ['dark', 'developer', 'api', 'cli', 'terminal', 'ai', 'model', 'inference', 'vercel'], weight: 9 },
  { id: 'fintech-authority',    label: 'Fintech Authority',    keywords: ['finance', 'bank', 'payment', 'fintech', 'invoice', 'billing', 'money'], weight: 9 },
  { id: 'healthcare-calm',      label: 'Healthcare Calm',      keywords: ['health', 'clinic', 'patient', 'medical', 'doctor', 'therapy', 'wellness'], weight: 8 },
  { id: 'editorial-bold',       label: 'Editorial Bold',       keywords: ['portfolio', 'agency', 'studio', 'creative', 'art', 'magazine', 'editorial'], weight: 7 },
  { id: 'data-dense',           label: 'Data Dense',           keywords: ['dashboard', 'analytics', 'metrics', 'table', 'admin', 'crm', 'erp', 'monitoring'], weight: 8 },
  { id: 'ecommerce-warm',       label: 'E-commerce Warm',      keywords: ['shop', 'store', 'product', 'cart', 'checkout', 'retail', 'marketplace'], weight: 7 },
  { id: 'gaming-energy',        label: 'Gaming Energy',        keywords: ['game', 'gaming', 'esports', 'player', 'stream'], weight: 8 },
  { id: 'cybersec-operator',    label: 'Cybersec Operator',    keywords: ['security', 'cyber', 'threat', 'soc', 'firewall', 'endpoint', 'siem', 'zero-trust'], weight: 9 },
  { id: 'hospitality-warm',     label: 'Hospitality Warm',     keywords: ['hotel', 'spa', 'travel', 'booking', 'resort', 'vacation', 'restaurant', 'cafe'], weight: 7 },
  { id: 'brutalist-strong',     label: 'Brutalist Strong',     keywords: ['brutalist', 'industrial', 'bold', 'raw', 'maximalist'], weight: 6 },
  { id: 'glassmorphism-modern', label: 'Glass / Modern',       keywords: ['glass', 'blur', 'frosted', 'modern', 'gradient', 'premium'], weight: 5 },
  { id: 'minimal-white',        label: 'Minimal White',        keywords: ['minimal', 'clean', 'white', 'light', 'simple', 'pure'], weight: 6 },
  { id: 'web3-precision',       label: 'Web3 Precision',       keywords: ['web3', 'crypto', 'blockchain', 'defi', 'nft', 'wallet'], weight: 7 },
  { id: 'nonprofit-civic',      label: 'Nonprofit / Civic',    keywords: ['nonprofit', 'charity', 'government', 'public', 'civic', 'donation'], weight: 7 },
];

// ────────────────────────────────────────────────────────────────────────────────
// 74 font pairings (representative set)
// ────────────────────────────────────────────────────────────────────────────────
const FONT_PAIRINGS = [
  { display: 'Inter',            body: 'Inter',             mono: 'Geist Mono',         sectors: ['saas', 'ai-startup', 'crm-erp', 'analytics-hosting'], mood: 'neutral, technical' },
  { display: 'Geist',            body: 'Geist',             mono: 'Geist Mono',         sectors: ['ai-startup', 'analytics-hosting'], mood: 'precise, developer-grade' },
  { display: 'Neue Haas Grotesk',body: 'Inter',             mono: 'JetBrains Mono',     sectors: ['fintech', 'cybersecurity', 'insurance'], mood: 'authoritative, tabular-nums' },
  { display: 'Fraunces',         body: 'Inter',             mono: 'Source Code Pro',    sectors: ['portfolio-agency', 'real-estate', 'travel-hospitality'], mood: 'editorial, premium' },
  { display: 'Newsreader',       body: 'Inter',             mono: 'Source Code Pro',    sectors: ['legal', 'media-news', 'blog'], mood: 'formal, literary' },
  { display: 'Source Serif 4',   body: 'Source Serif 4',   mono: 'Source Code Pro',    sectors: ['healthcare', 'education', 'nonprofit-government'], mood: 'calm, readable' },
  { display: 'Condensed Bold',   body: 'Inter',             mono: 'Fira Code',          sectors: ['gaming', 'events-entertainment'], mood: 'loud, energetic' },
  { display: 'DIN Pro',          body: 'Inter',             mono: 'JetBrains Mono',     sectors: ['logistics', 'manufacturing-b2b', 'automotive'], mood: 'industrial, precise' },
  { display: 'Inter Tight',      body: 'Inter',             mono: 'Geist Mono',         sectors: ['ecommerce', 'hr-recruiting'], mood: 'friendly, efficient' },
  { display: 'General Sans',     body: 'General Sans',      mono: 'Geist Mono',         sectors: ['saas', 'education'], mood: 'geometric, approachable' },
];

// ────────────────────────────────────────────────────────────────────────────────
// 34 pattern spines (layout templates)
// ────────────────────────────────────────────────────────────────────────────────
const PATTERN_SPINES = {
  landing:    'NAV → HERO (claim + proof cue) → LOGOS/trust → MECHANISM (3 features max) → DEEP PROOF (one real case) → FAQ (real objections) → FINAL CTA → FOOTER',
  pricing:    'Header (value restate) → billing toggle → 3 tiers (one recommended) → feature comparison → FAQ → enterprise CTA',
  dashboard:  'Shell (nav + context) → KPI row (5 max, tabular-nums) → primary work surface (table/feed) → detail on demand',
  docs:       'Three-panel: sidebar nav → content (65ch) → on-page TOC. Quickstart = install → configure → verify, copyable.',
  onboarding: 'One field group per screen-thought → SSO first → password rules before failure → success lands somewhere useful',
  checkout:   'Cart (editable) → guest-first → shipping (cost NOW) → payment (express first) → confirm (total unchanged)',
  booking:    'Service selection → date+time (available slots obvious) → minimum details → confirm (what/when/cancel-policy)',
  portfolio:  'Name + positioning → selected work (6 max, big) → about (short) → contact',
  blog:       'Index (hierarchy, dates) → article (65-75ch, prose rhythm) → related/next → subscribe (end, not interrupt)',
  auth:       'One field group → SSO first → rules before failure → success lands somewhere useful',
};

// ────────────────────────────────────────────────────────────────────────────────
// Contrast verification (same algorithm as suggest.js)
// ────────────────────────────────────────────────────────────────────────────────
function luminance(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrastRatio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
}

// ────────────────────────────────────────────────────────────────────────────────
// BM25 tokenizer (same as designos.js)
// ────────────────────────────────────────────────────────────────────────────────
const STOPWORDS = new Set(['a', 'an', 'and', 'the', 'for', 'to', 'of', 'in', 'on', 'with', 'is', 'it', 'that', 'build', 'create', 'make', 'design', 'page', 'app', 'site', 'web']);
function tokenize(s) {
  return String(s).toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1 && !STOPWORDS.has(t));
}

// ────────────────────────────────────────────────────────────────────────────────
// Pass 1: Sector matching (from suggest-data.js)
// ────────────────────────────────────────────────────────────────────────────────
function runSectorPass(brief, { SECTORS }) {
  const lower = brief.toLowerCase();
  const score = (keywords) => keywords.reduce((s, k) =>
    s + (new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(lower) ? (k.includes(' ') ? 2 : 1) : 0), 0);

  const ranked = Object.entries(SECTORS)
    .map(([key, v]) => {
      const nameHit = new RegExp(`\\b${key.replace(/-/g, '[ -]?')}`, 'i').test(lower) ? 2 : 0;
      return { key, v, score: score(v.keywords) + nameHit - (v.generic ? 0.5 : 0) };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0].score > 0 ? ranked[0] : { key: 'saas', v: SECTORS.saas, score: 0 };
}

// ────────────────────────────────────────────────────────────────────────────────
// Pass 2: Surface/pattern matching
// ────────────────────────────────────────────────────────────────────────────────
function runSurfacePass(brief, { SURFACES }) {
  const lower = brief.toLowerCase();
  const scored = Object.entries(SURFACES).map(([key, v]) => {
    const s = v.keywords.reduce((acc, k) => acc + (lower.includes(k) ? 1 : 0), 0);
    return { key, v, score: s };
  }).sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0] : { key: 'landing', v: SURFACES.landing, score: 0 };
}

// ────────────────────────────────────────────────────────────────────────────────
// Pass 3: Style category matching
// ────────────────────────────────────────────────────────────────────────────────
function runStylePass(brief) {
  const tokens = tokenize(brief);
  const scored = STYLE_CATEGORIES.map(cat => {
    const hits = cat.keywords.filter(k => tokens.includes(k) || brief.toLowerCase().includes(k)).length;
    return { ...cat, matchScore: hits * cat.weight };
  }).sort((a, b) => b.matchScore - a.matchScore);
  return scored[0];
}

// ────────────────────────────────────────────────────────────────────────────────
// Pass 4: Font pairing matching
// ────────────────────────────────────────────────────────────────────────────────
function runTypographyPass(sectorKey) {
  const match = FONT_PAIRINGS.find(p => p.sectors.includes(sectorKey));
  return match || FONT_PAIRINGS[0];
}

// ────────────────────────────────────────────────────────────────────────────────
// Pass 5: Motion budget from MOTION_INTENSITY dial
// ────────────────────────────────────────────────────────────────────────────────
function motionBudgetFromDial(intensity) {
  if (intensity <= 2) return { level: 'minimal', effects: ['hover states only (≤150ms)'], signature: false };
  if (intensity <= 4) return { level: 'subtle',  effects: ['120-150ms ease-out transitions', 'one staggered entrance ≤500ms'], signature: false };
  if (intensity <= 6) return { level: 'moderate', effects: ['scroll-reveals', 'stagger delays', 'micro-interactions'], signature: true };
  if (intensity <= 8) return { level: 'rich',     effects: ['scroll-driven animations', 'spring physics on interactions', 'one signature moment'], signature: true };
  return { level: 'cinematic', effects: ['full scroll-story', 'magnetic cursor', 'FLIP morphs', 'physics springs', 'two signature moments max'], signature: true };
}

// ────────────────────────────────────────────────────────────────────────────────
// Read designos.config.js if --dial flag is passed
// ────────────────────────────────────────────────────────────────────────────────
function readDialConfig(cwd) {
  const fp = path.join(cwd, 'designos.config.js');
  if (!fs.existsSync(fp)) return null;
  try {
    const src = fs.readFileSync(fp, 'utf8').replace(/module\.exports\s*=\s*/, '').replace(/;?\s*$/, '');
    return Function(`"use strict"; return (${src})`)(); // eslint-disable-line no-new-func
  } catch { return null; }
}

// ────────────────────────────────────────────────────────────────────────────────
// Main generate function
// ────────────────────────────────────────────────────────────────────────────────
function generate(brief, options, ctx) {
  const { cwd, ok, warn, log, fail } = ctx;
  const { SECTORS, SURFACES } = require('../../suggest-data.js');

  // ── 5 deterministic passes ──────────────────────────────────────────────────
  const sectorResult  = runSectorPass(brief, { SECTORS });
  const surfaceResult = runSurfacePass(brief, { SURFACES });
  const styleResult   = runStylePass(brief);
  const typoResult    = runTypographyPass(sectorResult.key);
  const dials         = options.useDials ? (readDialConfig(cwd) || {}) : {};
  const inferred = surfaceResult.key === 'portfolio'
    ? { motion: 8, variance: 9, density: 3 }
    : { motion: (brief.toLowerCase().includes('dark') || brief.toLowerCase().includes('cinematic') ? 7 : 5), variance: 5, density: 4 };
  const motionInt     = dials.MOTION_INTENSITY || inferred.motion;
  const motionResult  = motionBudgetFromDial(motionInt);
  const varianceInt   = dials.DESIGN_VARIANCE  || inferred.variance;
  const densityInt    = dials.VISUAL_DENSITY   || inferred.density;

  const S  = sectorResult.v;
  const P  = S.palette;

  // ── Contrast verification ──────────────────────────────────────────────────
  const colorPairs = [
    { label: 'text on bg',         fg: P.text,     bg: P.bg,      min: 4.5 },
    { label: 'muted on bg',        fg: P.muted,    bg: P.bg,      min: 4.5 },
    { label: 'CTA label on accent',fg: P.onAccent, bg: P.accent,  min: 4.5 },
    { label: 'accent on bg (UI)',  fg: P.accent,   bg: P.bg,      min: 3.0 },
  ];
  const verifiedPairs = colorPairs.map(pair => ({
    ...pair,
    ratio: contrastRatio(pair.fg, pair.bg),
    pass: contrastRatio(pair.fg, pair.bg) >= pair.min,
  }));
  const failingPairs = verifiedPairs.filter(p => !p.pass);
  if (failingPairs.length) {
    failingPairs.forEach(p => warn(`Contrast ${p.label}: ${p.ratio}:1 < ${p.min}:1 — DesignOS will note this as a finding.`));
  }

  // ── Theme override ─────────────────────────────────────────────────────────
  const wantsDark = /\bdark\b/i.test(brief) || dials.THEME === 'dark';
  const themeName = wantsDark ? 'dark' : S.theme;

  // ── Module routing ─────────────────────────────────────────────────────────
  const modules = [
    S.module,
    ...(surfaceResult.v.modules || []),
    motionInt >= 7 ? 'motion/signature-moments.md' : motionInt >= 4 ? 'motion/micro-interactions.md' : 'motion/principles.md',
    motionInt >= 7 ? 'motion/physics.md' : null,
    densityInt >= 7 ? 'components/data-density.md' : null,
    varianceInt >= 7 ? 'brain/originality.md' : null,
    wantsDark ? 'foundations/dark-mode.md' : null,
    'scoring/rubric.md',
    'loops/design-loop.md',
  ].filter(Boolean);

  const uniqueModules = [...new Set(modules)];

  // ── Anti-patterns ──────────────────────────────────────────────────────────
  const antiPatterns = [
    ...S.avoid,
    varianceInt <= 3 ? 'No asymmetric layout — sector calls for centered stability' : null,
    motionInt <= 2 ? 'No scroll-driven animations — motion budget is minimal for this surface' : null,
    motionInt >= 8 && varianceInt <= 4 ? 'Limit signature moments to hero only — variance is low' : null,
    'No fake proof (testimonials, logos, compliance badges) without real sources',
    'No placeholder copy (Lorem ipsum)',
    'No raw hex colors inline — use CSS custom properties only',
    'No magic-number spacing — 4px grid only',
  ].filter(Boolean);

  // ── Build the output document ─────────────────────────────────────────────
  const lines = [];
  const push = (s = '') => lines.push(s);

  push(`# DesignOS Generated Design System`);
  push(`**Brief:** ${brief}`);
  push(`**Generated:** ${new Date().toISOString()}`);
  push('');
  push('---');
  push('');

  // Pass 1: Sector
  push(`## 🏭 Industry Sector — ${sectorResult.key.toUpperCase()}`);
  push(`**Module:** \`${S.module}\``);
  push(`**Style direction:** ${S.style}`);
  push(`**Theme:** ${themeName} (committed deliberately — foundations/dark-mode.md)`);
  push('');

  // Pass 2: Pattern
  const spineKey = Object.keys(PATTERN_SPINES).find(k => surfaceResult.key.includes(k)) || 'landing';
  push(`## 📐 Surface Pattern — ${surfaceResult.key.toUpperCase()}`);
  push(`**Spine:** ${PATTERN_SPINES[spineKey] || surfaceResult.v?.spine || PATTERN_SPINES.landing}`);
  push(`**Note:** ${surfaceResult.v?.note || ''}`);
  push('');

  // Pass 3: Style
  push(`## 🎨 Style Direction`);
  push(`**Category:** ${styleResult.label}`);
  push(`**Design Variance:** ${varianceInt}/10`);
  push(`**Visual Density:** ${densityInt}/10`);
  push('');

  // Pass 4: Color palette
  push(`## 🎨 Color Palette — Contrast Verified`);
  push(`| Token | Value |`);
  push(`|---|---|`);
  push(`| \`--color-accent\` | \`${P.accent}\` |`);
  push(`| \`--color-accent-hover\` | \`${P.accentHover}\` |`);
  push(`| \`--color-on-accent\` | \`${P.onAccent}\` |`);
  push(`| \`--color-bg\` | \`${P.bg}\` |`);
  push(`| \`--color-surface\` | \`${P.surface}\` |`);
  push(`| \`--color-text\` | \`${P.text}\` |`);
  push(`| \`--color-muted\` | \`${P.muted}\` |`);
  push('');
  push(`**Contrast pairs (WCAG 2.2):**`);
  verifiedPairs.forEach(p => {
    const icon = p.pass ? '✓' : '✗ FAIL';
    push(`- ${p.label}: \`${p.fg}\` on \`${p.bg}\` = **${p.ratio}:1** (min ${p.min}:1) ${icon}`);
  });
  push('');

  // Pass 5: Typography
  push(`## ✍️ Typography Pairing`);
  push(`| Role | Family |`);
  push(`|---|---|`);
  push(`| Display/Headings | **${typoResult.display}** |`);
  push(`| Body | ${typoResult.body} |`);
  push(`| Monospace | ${typoResult.mono} |`);
  push(`| Mood | ${typoResult.mood} |`);
  push('');

  // Motion budget
  push(`## ⚡ Motion Budget`);
  push(`**Intensity:** ${motionInt}/10 — ${motionResult.level}`);
  push(`**Effects:**`);
  motionResult.effects.forEach(e => push(`- ${e}`));
  push(`**Signature moment:** ${motionResult.signature ? 'Allowed (max 2 per page, at MOTION_INTENSITY ≥ 6)' : 'Not budgeted at this intensity'}`);
  push(`**Governed by:** \`motion/principles.md\` · \`motion/performance.md\``);
  push('');

  // CSS tokens
  push(`## 💅 CSS Token Starter`);
  push('```css');
  push(':root {');
  push(`  /* ── Palette (${sectorResult.key}) ── */`);
  push(`  --color-accent:        ${P.accent};`);
  push(`  --color-accent-hover:  ${P.accentHover};`);
  push(`  --color-on-accent:     ${P.onAccent};`);
  push(`  --color-bg:            ${P.bg};`);
  push(`  --color-surface:       ${P.surface};`);
  push(`  --color-text:          ${P.text};`);
  push(`  --color-muted:         ${P.muted};`);
  push('');
  push(`  /* ── Typography ── */`);
  push(`  --font-display: '${typoResult.display}', system-ui, sans-serif;`);
  push(`  --font-body:    '${typoResult.body}', system-ui, sans-serif;`);
  push(`  --font-mono:    '${typoResult.mono}', monospace;`);
  push('');
  push(`  /* ── Motion (motion/principles.md) ── */`);
  push(`  --duration-fast:   150ms;`);
  push(`  --duration-base:   ${motionInt >= 6 ? '250ms' : '200ms'};`);
  push(`  --duration-slow:   300ms;`);
  push(`  --ease-out:        cubic-bezier(0.16, 1, 0.3, 1);`);
  push(`  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);`);
  push('');
  push(`  /* ── Spacing (4px grid) ── */`);
  push(`  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;`);
  push(`  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;`);
  push(`  --space-24: 96px; --space-32: 128px;`);
  push('');
  push(`  /* ── Radius ── */`);
  push(`  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-full: 9999px;`);
  push('}');
  if (wantsDark || S.theme === 'dark') {
    push('');
    push('@media (prefers-color-scheme: dark) {');
    push('  /* Override with dark-mode tokens — see foundations/dark-mode.md */');
    push(`  /* Run: node DesignOS/bin/designos.js suggest "${brief}, dark" for verified dark palette */`);
    push('}');
  }
  push('```');
  push('');

  // Module load list
  push(`## 📦 Module Load Order`);
  push('Load these before any design decision:');
  uniqueModules.forEach(m => push(`- \`${m}\``));
  push('');

  // Anti-patterns
  push(`## 🚫 Anti-Patterns for ${sectorResult.key}`);
  antiPatterns.forEach(a => push(`- ${a}`));
  push('');

  // Pre-delivery checklist
  push(`## ✅ Pre-Delivery Checklist`);
  push('- [ ] All contrast pairs verified (run `node DesignOS/bin/designos.js review <file> --min 95`)');
  push('- [ ] No raw hex colors in component files');
  push('- [ ] No off-grid spacing values');
  push('- [ ] Motion respects `prefers-reduced-motion`');
  push('- [ ] No interactive element uses `<div onclick>`');
  push('- [ ] All `<img>` have `alt` text');
  push('- [ ] Focus-visible style present on all interactive elements');
  push('- [ ] No placeholder copy remaining');
  push('- [ ] Loading / empty / error / disabled states implemented');
  push('- [ ] Mobile 375px verified');
  push('- [ ] Dark mode deliberately styled (if applicable)');
  push('- [ ] Memory updated (`memory/design.md`) with final palette and type decisions');
  push('');

  // Final gate commands
  push(`## 🚀 Final Gate Commands`);
  push('```bash');
  push('node DesignOS/bin/designos.js review <target> --min 95');
  push('node DesignOS/bin/designos.js elevate <target> --no-fail');
  push('node DesignOS/bin/designos.js visual <target.html> --no-fail');
  push('node DesignOS/bin/designos.js report <target> --min 95 --no-fail');
  push('```');
  push('');
  push('> A recommendation is not a score. Run the gate before claiming "done".');

  return {
    brief,
    sector: sectorResult.key,
    surface: surfaceResult.key,
    style: styleResult.id,
    theme: themeName,
    palette: P,
    typography: typoResult,
    motionBudget: motionResult,
    dials: { variance: varianceInt, motionIntensity: motionInt, density: densityInt },
    modules: uniqueModules,
    antiPatterns,
    contrastResults: verifiedPairs,
    markdown: lines.join('\n'),
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// CLI execute
// ────────────────────────────────────────────────────────────────────────────────
function execute(args, ctx) {
  const { ok, warn, log, fail, argValue } = ctx;

  const briefArg = argValue(args, '--brief', '').trim();
  if (!briefArg) {
    fail([
      'Usage: node DesignOS/bin/designos.js generate --brief "<description>"',
      '  e.g. node DesignOS/bin/designos.js generate --brief "SaaS pricing page, dark, B2B"',
      '       node DesignOS/bin/designos.js generate --brief "fintech dashboard" --dial --out system.md',
    ].join('\n'));
    return;
  }

  const asJson   = args.includes('--json');
  const useDials = args.includes('--dial') || args.includes('--dials');
  const outArg   = argValue(args, '--out', '');

  const result = generate(briefArg, { useDials }, ctx);

  if (asJson) {
    const { markdown: _, ...data } = result;
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (outArg) {
    const fp = require('path').resolve(ctx.cwd, outArg);
    require('fs').writeFileSync(fp, result.markdown);
    ok(`Design system written to ${outArg}`);
    log(`Sector: ${result.sector} · Surface: ${result.surface} · Theme: ${result.theme}`);
    log(`Modules loaded: ${result.modules.length} · Contrast pairs verified: ${result.contrastResults.filter(p => p.pass).length}/${result.contrastResults.length}`);
    if (result.contrastResults.some(p => !p.pass)) {
      warn('One or more contrast pairs failed — adjust the palette before delivery.');
    }
  } else {
    console.log(result.markdown);
    log('');
    ok(`Design system generated — Sector: ${result.sector} · Surface: ${result.surface} · Theme: ${result.theme}`);
    if (result.contrastResults.some(p => !p.pass)) {
      warn('Contrast warnings above — adjust palette before delivery.');
    }
  }
}

module.exports = { execute, generate };
