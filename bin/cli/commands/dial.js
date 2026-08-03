/**
 * designos dial — read/write/apply the three design-control dials.
 *
 * DESIGN_VARIANCE  1–10  1=centered/clean, 10=asymmetric/brutalist
 * MOTION_INTENSITY 1–10  1=hover-only,    10=magnetic/scroll/physics
 * VISUAL_DENSITY   1–10  1=spacious,      10=data-dense dashboard
 * SECTOR           string → auto-routes to industries/<sector>.md
 * THEME            'light' | 'dark'
 *
 * Usage:
 *   node DesignOS/bin/designos.js dial
 *   node DesignOS/bin/designos.js dial --motion 8 --variance 5 --density 3
 *   node DesignOS/bin/designos.js dial --sector fintech --theme dark
 *   node DesignOS/bin/designos.js dial --reset
 *   node DesignOS/bin/designos.js dial --prompt   → prints agent-ready context block
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const CONFIG_FILE = 'designos.config.js';

// Human-readable descriptions for each level band
const VARIANCE_LABELS  = ['', 'Centered · safe', '', 'Clean asymmetry', '', 'Editorial tension', '', 'Strong asymmetry', '', 'Near-brutalist', 'Brutalist / avant-garde'];
const MOTION_LABELS    = ['', 'Hover-only', '', 'Subtle transitions', '', 'Stagger + reveals', '', 'Scroll-driven', '', 'Signature physics', 'Full magnetic / cinematic'];
const DENSITY_LABELS   = ['', 'Air-spacious', '', 'Comfortable', '', 'Balanced', '', 'Compact', '', 'Dense dashboard', 'Data-warehouse density'];

const VALID_SECTORS = [
  'saas', 'ai-startup', 'fintech', 'healthcare', 'cybersecurity', 'ecommerce',
  'real-estate', 'education', 'gaming', 'portfolio-agency', 'crm-erp',
  'analytics-hosting', 'legal', 'travel-hospitality', 'food-restaurant',
  'media-news', 'web3-crypto', 'nonprofit-government', 'hr-recruiting',
  'events-entertainment', 'insurance', 'logistics', 'automotive', 'manufacturing-b2b',
];

const DEFAULTS = {
  DESIGN_VARIANCE:  5,
  MOTION_INTENSITY: 5,
  VISUAL_DENSITY:   4,
  SECTOR:           'saas',
  THEME:            'light',
};

function clamp(n, lo = 1, hi = 10) {
  return Math.min(hi, Math.max(lo, Math.round(Number(n))));
}

function configPath(cwd) {
  return path.join(cwd, CONFIG_FILE);
}

function readConfig(cwd) {
  const fp = configPath(cwd);
  if (!fs.existsSync(fp)) return { ...DEFAULTS };
  try {
    // strip module.exports wrapper and eval safely
    const src = fs.readFileSync(fp, 'utf8')
      .replace(/module\.exports\s*=\s*/, '')
      .replace(/;?\s*$/, '');
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${src})`)();
  } catch {
    return { ...DEFAULTS };
  }
}

function writeConfig(cwd, cfg) {
  const fp = configPath(cwd);
  const body = [
    '// DesignOS Dial Configuration',
    '// Edit manually or via: node DesignOS/bin/designos.js dial --motion <1-10> --variance <1-10> --density <1-10>',
    '// DESIGN_VARIANCE  : 1=centered/clean  →  10=asymmetric/brutalist',
    '// MOTION_INTENSITY : 1=hover-only      →  10=magnetic/scroll/physics',
    '// VISUAL_DENSITY   : 1=spacious        →  10=data-dense dashboard',
    '',
    'module.exports = {',
    `  DESIGN_VARIANCE:  ${cfg.DESIGN_VARIANCE},   // ${VARIANCE_LABELS[cfg.DESIGN_VARIANCE] || ''}`,
    `  MOTION_INTENSITY: ${cfg.MOTION_INTENSITY},   // ${MOTION_LABELS[cfg.MOTION_INTENSITY] || ''}`,
    `  VISUAL_DENSITY:   ${cfg.VISUAL_DENSITY},   // ${DENSITY_LABELS[cfg.VISUAL_DENSITY] || ''}`,
    `  SECTOR:           '${cfg.SECTOR}',`,
    `  THEME:            '${cfg.THEME}',`,
    '};',
    '',
  ].join('\n');
  fs.writeFileSync(fp, body);
}

function printStatus(cfg, { ok, log }) {
  const bar = (n) => '█'.repeat(n) + '░'.repeat(10 - n);
  console.log('\n  \x1b[1mDesignOS Design Dials\x1b[0m\n');
  console.log(`  \x1b[36mDESIGN_VARIANCE \x1b[0m  ${bar(cfg.DESIGN_VARIANCE)}  ${cfg.DESIGN_VARIANCE}/10  ${VARIANCE_LABELS[cfg.DESIGN_VARIANCE] || ''}`);
  console.log(`  \x1b[35mMOTION_INTENSITY\x1b[0m  ${bar(cfg.MOTION_INTENSITY)}  ${cfg.MOTION_INTENSITY}/10  ${MOTION_LABELS[cfg.MOTION_INTENSITY] || ''}`);
  console.log(`  \x1b[33mVISUAL_DENSITY  \x1b[0m  ${bar(cfg.VISUAL_DENSITY)}  ${cfg.VISUAL_DENSITY}/10  ${DENSITY_LABELS[cfg.VISUAL_DENSITY] || ''}`);
  console.log(`  \x1b[2mSECTOR          \x1b[0m  ${cfg.SECTOR}  →  industries/${cfg.SECTOR}.md`);
  console.log(`  \x1b[2mTHEME           \x1b[0m  ${cfg.THEME}  →  foundations/${cfg.THEME === 'dark' ? 'dark-mode' : 'colors'}.md`);
  console.log('');
  ok(`Config written to ${CONFIG_FILE}`);
  log('Use  --prompt  to print the agent context block.');
  log('Use  --reset   to restore defaults.');
  console.log('');
}

function printPromptBlock(cfg) {
  const moduleRoutes = [
    `industries/${cfg.SECTOR}.md`,
    cfg.MOTION_INTENSITY >= 7 ? 'motion/signature-moments.md' : cfg.MOTION_INTENSITY >= 4 ? 'motion/micro-interactions.md' : 'motion/principles.md',
    cfg.MOTION_INTENSITY >= 7 ? 'motion/physics.md' : null,
    cfg.VISUAL_DENSITY >= 7 ? 'components/data-density.md' : null,
    cfg.VISUAL_DENSITY >= 7 ? 'components/tables.md' : null,
    cfg.DESIGN_VARIANCE >= 7 ? 'brain/originality.md' : null,
    cfg.THEME === 'dark' ? 'foundations/dark-mode.md' : null,
  ].filter(Boolean);

  const motionBudget = cfg.MOTION_INTENSITY <= 3
    ? 'Hover states only (≤150ms). No scroll-driven or physics effects.'
    : cfg.MOTION_INTENSITY <= 6
      ? 'Stagger reveals, scroll reveals, and micro-interactions within 300ms budget. One signature moment allowed.'
      : 'Full motion budget: scroll-driven, physics springs, magnetic effects, signature moments. Budget: motion/signature-moments.md.';

  const densityNote = cfg.VISUAL_DENSITY <= 3
    ? 'Air-spacious: generous whitespace, few elements per viewport. Calm UX.'
    : cfg.VISUAL_DENSITY <= 6
      ? 'Comfortable density: balanced information-to-space ratio.'
      : 'High density: compact rhythm, tables-first, minimal decorative whitespace.';

  const varianceNote = cfg.DESIGN_VARIANCE <= 3
    ? 'Centered, symmetric, safe. No visual tension.'
    : cfg.DESIGN_VARIANCE <= 6
      ? 'Moderate asymmetry: editorial layouts allowed, grid-breaking in hero only.'
      : 'High variance: strong asymmetry, layered depth, editorial tension throughout.';

  console.log('\n\x1b[2m--- DesignOS Dial Context Block (paste into agent prompt) ---\x1b[0m\n');
  console.log(`<!-- DESIGNOS_DIALS
  DESIGN_VARIANCE:  ${cfg.DESIGN_VARIANCE}/10  — ${varianceNote}
  MOTION_INTENSITY: ${cfg.MOTION_INTENSITY}/10  — ${motionBudget}
  VISUAL_DENSITY:   ${cfg.VISUAL_DENSITY}/10  — ${densityNote}
  SECTOR:           ${cfg.SECTOR}
  THEME:            ${cfg.THEME}

  Load before designing:
${moduleRoutes.map(m => `    · ${m}`).join('\n')}

  Motion governor (motion/principles.md):
    - Nothing interactive over 300ms.
    - Hover effects ≤ 150ms.
    - Only transform/opacity animated (no layout thrash).
    - prefers-reduced-motion: collapse all of it.
    - Signature moments: max 2 per page at MOTION_INTENSITY ≥ 6.
-->\n`);
}

function execute(args, ctx) {
  const { cwd, ok, warn, log, fail, argValue } = ctx;

  if (args.includes('--reset')) {
    writeConfig(cwd, { ...DEFAULTS });
    ok('Dials reset to defaults.');
    return;
  }

  if (args.includes('--prompt')) {
    const cfg = readConfig(cwd);
    printPromptBlock(cfg);
    return;
  }

  // Read current config (or defaults)
  const cfg = readConfig(cwd);

  // Apply overrides from flags
  const motionArg   = argValue(args, '--motion',   '');
  const varianceArg = argValue(args, '--variance',  '');
  const densityArg  = argValue(args, '--density',   '');
  const sectorArg   = argValue(args, '--sector',    '');
  const themeArg    = argValue(args, '--theme',     '');

  if (motionArg)   cfg.MOTION_INTENSITY = clamp(motionArg);
  if (varianceArg) cfg.DESIGN_VARIANCE  = clamp(varianceArg);
  if (densityArg)  cfg.VISUAL_DENSITY   = clamp(densityArg);
  if (sectorArg) {
    if (!VALID_SECTORS.includes(sectorArg)) {
      warn(`Unknown sector "${sectorArg}". Valid: ${VALID_SECTORS.join(' · ')}`);
    } else {
      cfg.SECTOR = sectorArg;
    }
  }
  if (themeArg) {
    if (!['light', 'dark'].includes(themeArg)) {
      fail(`--theme must be "light" or "dark"`);
    }
    cfg.THEME = themeArg;
  }

  // If no args at all, just print status
  if (!motionArg && !varianceArg && !densityArg && !sectorArg && !themeArg) {
    const current = readConfig(cwd);
    const bar = (n) => '█'.repeat(n) + '░'.repeat(10 - n);
    console.log('\n  \x1b[1mDesignOS Design Dials — current\x1b[0m\n');
    console.log(`  \x1b[36mDESIGN_VARIANCE \x1b[0m  ${bar(current.DESIGN_VARIANCE)}  ${current.DESIGN_VARIANCE}/10`);
    console.log(`  \x1b[35mMOTION_INTENSITY\x1b[0m  ${bar(current.MOTION_INTENSITY)}  ${current.MOTION_INTENSITY}/10`);
    console.log(`  \x1b[33mVISUAL_DENSITY  \x1b[0m  ${bar(current.VISUAL_DENSITY)}  ${current.VISUAL_DENSITY}/10`);
    console.log(`  \x1b[2mSECTOR\x1b[0m           ${current.SECTOR}`);
    console.log(`  \x1b[2mTHEME\x1b[0m            ${current.THEME}`);
    console.log('');
    log('To change: node DesignOS/bin/designos.js dial --motion 8 --variance 5 --density 3');
    log('For agent prompt block: node DesignOS/bin/designos.js dial --prompt');
    return;
  }

  writeConfig(cwd, cfg);
  printStatus(cfg, { ok, log });
}

module.exports = { execute };
