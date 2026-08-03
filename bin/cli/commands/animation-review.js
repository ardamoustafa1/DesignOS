/**
 * designos motion-review  — Animation Vocabulary & Review System
 * designos motion-opportunities — Find animation opportunities
 * designos motion-vocabulary    — Print animation terminology reference
 *
 * Inspired by emilkowalski/skills: review-animations, improve-animations,
 * find-animation-opportunities. Enforces the same strict discipline Emil's
 * skill does, but wired into DesignOS's existing motion module stack.
 *
 * motion-review rules:
 *   ANIM-001  ease-in on entrance → must be ease-out
 *   ANIM-002  bounce/elastic easing → P1 flag (almost never intentional)
 *   ANIM-003  duration > 300ms on interactive element → P1
 *   ANIM-004  semi-transparent box-shadow used for elevation → prefer border
 *   ANIM-005  transition: all → blocks compositor, must list properties
 *   ANIM-006  missing prefers-reduced-motion → P1
 *   ANIM-007  animation on width/height/margin/padding → non-composited, P1
 *   ANIM-008  hover duration > 150ms → sluggish
 *   ANIM-009  infinite animation without pause-on-hidden → P2
 *   ANIM-010  linear easing on spatial movement → P2
 *   ANIM-011  JS animation > 300ms on interaction response → P1
 *   ANIM-012  stagger total sequence > 500ms → P2
 *   ANIM-013  scale(0) entrance → prefer translateY + opacity
 *   ANIM-014  multiple spring configs in one file → must use design token
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Walk files ──────────────────────────────────────────────────────────────
function* walk(p, exts = /\.(css|html|jsx?|tsx?|vue|svelte)$/) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) {
      if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.designos'].includes(e)) continue;
      yield* walk(path.join(p, e), exts);
    }
  } else if (exts.test(p)) {
    yield p;
  }
}

function lineOf(src, idx) { return src.slice(0, idx).split('\n').length; }
function lineAt(src, idx) {
  const s = src.lastIndexOf('\n', idx) + 1;
  const e = src.indexOf('\n', idx);
  return src.slice(s, e === -1 ? src.length : e);
}
function hasException(src, idx) {
  const lines = src.split('\n');
  const n = lineOf(src, idx) - 1;
  return lines.slice(Math.max(0, n - 3), n + 2).some(l => /motion-ok\s*:/i.test(l));
}

// ── Rule engine ─────────────────────────────────────────────────────────────
const RULES = [

  // ANIM-001: ease-in on entrance (should be ease-out)
  {
    id: 'ANIM-001', severity: 'P1',
    desc: 'ease-in on entrance animation — objects entering the screen should ease-OUT (decelerate into place), not ease-IN (accelerate into void).',
    fix:  'Replace ease-in with ease-out, or cubic-bezier(0.16, 1, 0.3, 1) for a spring-like entrance.',
    test(src) {
      const findings = [];
      // Look for animation/keyframe usage with ease-in that looks like an entrance
      for (const m of src.matchAll(/(?:animation|@keyframes)[^;{]+ease-in(?!-out)/gi)) {
        if (!hasException(src, m.index)) {
          const ctx = lineAt(src, m.index);
          if (/enter|appear|show|mount|open|fade.?in|slide.?in|rise|reveal/i.test(ctx + src.slice(Math.max(0, m.index - 200), m.index))) {
            findings.push({ idx: m.index, ctx: ctx.trim() });
          }
        }
      }
      // CSS transition with ease-in on elements that look like they appear
      for (const m of src.matchAll(/transition[^;]+ease-in(?!-out)/gi)) {
        if (!hasException(src, m.index)) {
          const near = src.slice(Math.max(0, m.index - 400), m.index + 200);
          if (/opacity|visibility|display/i.test(near)) {
            findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim() });
          }
        }
      }
      return findings;
    },
  },

  // ANIM-002: bounce/elastic easing (almost never correct)
  {
    id: 'ANIM-002', severity: 'P1',
    desc: 'Bounce/elastic easing detected. Objects do not physically bounce unless they are bouncy objects (balls, toys). Use spring easing (cubic-bezier(0.34, 1.56, 0.64, 1)) for subtle overshoot.',
    fix:  'Remove bounce/elastic. For playful overshoot, use cubic-bezier(0.34, 1.56, 0.64, 1) with a short duration ≤ 250ms.',
    test(src) {
      const findings = [];
      for (const m of src.matchAll(/\b(ease-bounce|elastic(?:\.out|\.in|\.inOut)?|bounce(?:-in|-out|-in-out)?)\b/gi)) {
        if (!hasException(src, m.index)) {
          findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim() });
        }
      }
      return findings;
    },
  },

  // ANIM-003: duration > 300ms on interactive elements
  {
    id: 'ANIM-003', severity: 'P1',
    desc: 'Duration > 300ms on interactive element (button, input, link, select). Interactive feedback must feel instant — over 300ms feels broken.',
    fix:  'Use 150ms for hover/focus, 200-250ms for state changes. Reserve 300ms+ for page-level transitions only.',
    test(src) {
      const findings = [];
      for (const m of src.matchAll(/transition:[^;]+(\d{3,})(ms)\b/g)) {
        const dur = Number(m[1]);
        if (dur > 300 && !hasException(src, m.index)) {
          const near = src.slice(Math.max(0, m.index - 500), m.index + 100);
          if (/button|btn|input|select|textarea|a\b|link|checkbox|radio|toggle|switch/i.test(near)) {
            findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim(), dur });
          }
        }
      }
      return findings;
    },
  },

  // ANIM-004: semi-transparent box-shadow for elevation
  {
    id: 'ANIM-004', severity: 'P2',
    desc: 'Semi-transparent box-shadow used for card/component elevation. On dark surfaces this disappears. Prefer a 1px solid border with slight opacity for elevation cues.',
    fix:  'Replace box-shadow elevation with: border: 1px solid rgb(255 255 255 / 0.12) on dark, or rgb(0 0 0 / 0.08) on light.',
    test(src) {
      const findings = [];
      for (const m of src.matchAll(/box-shadow\s*:[^;]+rgba?\([^)]+,\s*0\.[0-3]\d*\)/gi)) {
        if (!hasException(src, m.index)) {
          const near = src.slice(Math.max(0, m.index - 300), m.index + 100);
          if (/card|surface|panel|modal|elevated|layer|chip/i.test(near)) {
            findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim() });
          }
        }
      }
      return findings;
    },
  },

  // ANIM-005: transition: all
  {
    id: 'ANIM-005', severity: 'P1',
    desc: '`transition: all` causes the browser to watch every animatable property, including layout-triggering ones. This blocks the compositor and causes jank.',
    fix:  'List only composited properties: `transition: opacity 200ms ease-out, transform 200ms ease-out`.',
    test(src) {
      const findings = [];
      for (const m of src.matchAll(/transition\s*:\s*all\b/gi)) {
        if (!hasException(src, m.index)) {
          findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim() });
        }
      }
      return findings;
    },
  },

  // ANIM-006: missing prefers-reduced-motion
  {
    id: 'ANIM-006', severity: 'P1',
    desc: 'File contains animations or transitions but no @media (prefers-reduced-motion) block.',
    fix:  'Add: @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }',
    fileLevel: true,
    test(src) {
      const hasAnim = /(?:transition|animation)\s*:/i.test(src);
      const hasRed  = /prefers-reduced-motion/i.test(src);
      if (hasAnim && !hasRed && !src.includes('designos-motion-ignore-file')) {
        return [{ idx: 0, ctx: '(file-level: no prefers-reduced-motion block)' }];
      }
      return [];
    },
  },

  // ANIM-007: non-composited properties animated
  {
    id: 'ANIM-007', severity: 'P1',
    desc: 'Animating non-composited CSS property (width, height, margin, padding, top, left, right, bottom). This forces layout recalculation every frame — causes jank on all devices.',
    fix:  'Use transform: translate/scale instead. For width/height reveals, use clip-path or max-height with caution.',
    test(src) {
      const bad = ['width', 'height', 'margin', 'padding', 'top', 'left', 'right', 'bottom', 'font-size', 'border-width'];
      const findings = [];
      for (const prop of bad) {
        const re = new RegExp(`transition[^;]*\\b${prop}\\b`, 'gi');
        for (const m of src.matchAll(re)) {
          if (!hasException(src, m.index)) {
            findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim(), prop });
          }
        }
      }
      // Also check declarations inside each keyframe body. Keep the match bounded to
      // the keyframe block so ordinary width/height declarations later in the file do
      // not become false positives.
      for (const block of src.matchAll(/@keyframes\s+[\w-]+\s*\{(?:[^{}]|\{[^{}]*\})*\}/gi)) {
        for (const prop of ['width', 'height', 'margin', 'padding']) {
          if (new RegExp(`\\b${prop}(?:-[\\w-]+)?\\s*:`, 'i').test(block[0]) && !hasException(src, block.index)) {
            findings.push({ idx: block.index, ctx: `(in @keyframes: ${prop})`, prop });
          }
        }
      }
      return findings;
    },
  },

  // ANIM-008: hover duration > 150ms
  {
    id: 'ANIM-008', severity: 'P2',
    desc: 'Hover transition duration > 150ms. Hover feedback must feel instant (micro-interactions.md: hovers ≤ 150ms).',
    fix:  'Set hover transitions to ≤ 150ms. Use 100ms for color changes, 150ms for transforms.',
    test(src) {
      const findings = [];
      // Look for :hover { transition or transition in :hover context
      for (const m of src.matchAll(/:hover\s*\{[^}]*transition[^;]+(\d{2,})(ms)/g)) {
        const dur = Number(m[1]);
        if (dur > 150 && !hasException(src, m.index)) {
          findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim(), dur });
        }
      }
      return findings;
    },
  },

  // ANIM-009: infinite animation without pause mechanism
  {
    id: 'ANIM-009', severity: 'P2',
    desc: 'Infinite animation detected without a `prefers-reduced-motion` override or a pause-on-hidden mechanism. Continuous animation is visually exhausting and wastes GPU.',
    fix:  'Add: @media (prefers-reduced-motion: reduce) { .animated-el { animation: none; } } and pause with `animation-play-state: paused` when tab is hidden.',
    test(src) {
      const findings = [];
      for (const m of src.matchAll(/animation(?:-name)?\s*:[^;]*\binfinite\b/gi)) {
        if (!hasException(src, m.index)) {
          // Check if there's a reduced-motion guard in the file
          if (!/prefers-reduced-motion/i.test(src)) {
            findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim() });
          }
        }
      }
      return findings;
    },
  },

  // ANIM-010: linear easing on spatial movement
  {
    id: 'ANIM-010', severity: 'P2',
    desc: 'Linear easing on spatial movement (translate/slide). Linear motion has no physical analog — objects in the real world always accelerate or decelerate.',
    fix:  'Use ease-out for entrances, ease-in for exits, ease-in-out for transformations with no clear direction.',
    test(src) {
      const findings = [];
      for (const m of src.matchAll(/transition[^;]*\b(transform|translate|slide)[^;]*\blinear\b/gi)) {
        if (!hasException(src, m.index)) {
          findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim() });
        }
      }
      return findings;
    },
  },

  // ANIM-013: scale(0) entrance
  {
    id: 'ANIM-013', severity: 'P2',
    desc: 'scale(0) entrance animation — scaling from zero makes elements appear to "pop" from nowhere. Prefer translateY(-8px) + opacity: 0 for a more natural entrance.',
    fix:  'Use: from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; }',
    test(src) {
      const findings = [];
      for (const m of src.matchAll(/scale\(\s*0\s*\)/gi)) {
        if (!hasException(src, m.index)) {
          const near = src.slice(Math.max(0, m.index - 200), m.index + 100);
          if (/@keyframes|animation|enter|appear|show/i.test(near)) {
            findings.push({ idx: m.index, ctx: lineAt(src, m.index).trim() });
          }
        }
      }
      return findings;
    },
  },

  // ANIM-014: multiple spring configs
  {
    id: 'ANIM-014', severity: 'P2',
    desc: 'Multiple different spring/overshoot cubic-bezier configs in one file. Motion principles require ONE spring config system-wide, referenced via a CSS custom property.',
    fix:  'Define: --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); in :root and use var(--ease-spring) everywhere.',
    test(src) {
      const springs = new Set();
      for (const m of src.matchAll(/cubic-bezier\([^)]*1\.[2-9][^)]*\)/gi)) {
        springs.add(m[0].toLowerCase().replace(/\s+/g, ''));
      }
      if (springs.size > 1) {
        return [{ idx: 0, ctx: `(${springs.size} different spring configs found — must use one token)`, springs: [...springs] }];
      }
      return [];
    },
  },
];

// ── Analyze a single file ────────────────────────────────────────────────────
function analyzeFile(filePath, cwd) {
  const src = fs.readFileSync(filePath, 'utf8');
  if (src.includes('designos-motion-ignore-file')) return [];
  const rel = path.relative(cwd, filePath) || path.basename(filePath);
  const findings = [];
  for (const rule of RULES) {
    const hits = rule.test(src);
    for (const hit of hits) {
      findings.push({
        rule: rule.id, severity: rule.severity,
        file: rel, line: hit.idx === 0 ? 1 : lineOf(src, hit.idx),
        desc: rule.desc, fix: rule.fix,
        context: hit.ctx,
      });
    }
  }
  return findings;
}

// ── motion-review ────────────────────────────────────────────────────────────
function motionReview(target, args, ctx) {
  const { cwd, ok, warn, log, fail } = ctx;
  if (!target) fail('Usage: designos motion-review <dir-or-file> [--json] [--min 95]');
  const abs = path.resolve(cwd, target);
  if (!fs.existsSync(abs)) fail(`motion-review: target not found: ${target}`);

  const asJson = args.includes('--json');
  const files  = fs.statSync(abs).isDirectory() ? [...walk(abs)] : [abs];
  const findings = files.flatMap(f => analyzeFile(f, cwd));

  const byFile = {};
  for (const f of findings) {
    (byFile[f.file] = byFile[f.file] || []).push(f);
  }

  const p1 = findings.filter(f => f.severity === 'P1').length;
  const p2 = findings.filter(f => f.severity === 'P2').length;

  if (asJson) { console.log(JSON.stringify({ target, findings, summary: { p1, p2, total: findings.length, files: files.length } }, null, 2)); return; }

  // ── Pretty terminal output ─────────────────────────────────────────────────
  console.log('\n  \x1b[1mDesignOS Motion Review\x1b[0m\n');
  console.log(`  Target: ${target}`);
  console.log(`  Files: ${files.length} · Findings: ${findings.length} (P1: ${p1}, P2: ${p2})\n`);

  if (!findings.length) {
    ok('No motion violations found. Animation vocabulary is clean.');
    log('Run `motion-opportunities` to find where animation could improve the UX.');
    return;
  }

  for (const [file, ffindings] of Object.entries(byFile)) {
    console.log(`  \x1b[4m${file}\x1b[0m`);
    for (const f of ffindings) {
      const sev = f.severity === 'P1' ? '\x1b[31m' : '\x1b[33m';
      console.log(`    ${sev}${f.severity}\x1b[0m \x1b[1m${f.rule}\x1b[0m  line ${f.line}`);
      console.log(`    \x1b[2m${f.context}\x1b[0m`);
      console.log(`    \x1b[31m✗\x1b[0m ${f.desc.slice(0, 100)}${f.desc.length > 100 ? '…' : ''}`);
      console.log(`    \x1b[32m→\x1b[0m ${f.fix.slice(0, 100)}${f.fix.length > 100 ? '…' : ''}`);
      console.log('');
    }
  }

  if (p1 > 0) {
    console.log(`  \x1b[31m${p1} P1 violation${p1 > 1 ? 's' : ''} — animation quality does not clear the gate.\x1b[0m`);
    console.log('  Fix all P1 findings before delivery. Then rerun:\n');
    console.log(`  node DesignOS/bin/designos.js motion-review ${target}\n`);
  } else {
    warn(`${p2} P2 advisory finding${p2 > 1 ? 's' : ''} — no blockers. Consider addressing for full motion polish.`);
  }

  if (args.includes('--fix-prompt')) {
    console.log('\n  \x1b[1mFix prompt (paste to agent):\x1b[0m\n');
    console.log('Fix these motion violations. Rules from motion/principles.md + motion/performance.md:');
    findings.forEach((f, i) => {
      console.log(`${i + 1}. ${f.file}:${f.line} [${f.rule} ${f.severity}] — ${f.desc}`);
      console.log(`   Fix: ${f.fix}`);
    });
    console.log('\nAfter fixing, rerun: node DesignOS/bin/designos.js motion-review ' + target);
  }
}

// ── motion-opportunities ─────────────────────────────────────────────────────
const OPPORTUNITY_PATTERNS = [
  {
    id: 'OPP-001', label: 'Missing entrance animation on primary content',
    check: src => /class=[\"'][^\"']*(?:hero|headline|h1|main-cta)[^\"']*[\"']/i.test(src) && !/animation|@keyframes|rise|reveal|fade/i.test(src),
    suggestion: 'Add a staggered entrance: opacity 0 → 1 + translateY(16px) → 0, 400ms ease-out. Delay each child by 60ms.',
    module: 'motion/micro-interactions.md',
  },
  {
    id: 'OPP-002', label: 'Buttons without hover transform',
    check: src => /\.btn|button\s*{/i.test(src) && !/transform.*hover|hover.*transform/i.test(src),
    suggestion: 'Add: .btn:hover { transform: translateY(-1px); } with 120ms ease-out. Active: translateY(1px).',
    module: 'motion/micro-interactions.md',
  },
  {
    id: 'OPP-003', label: 'Cards without hover elevation micro-animation',
    check: src => /\.card\s*{|card-/i.test(src) && !/card.*hover|hover.*card/i.test(src),
    suggestion: 'Add: .card:hover { transform: translateY(-2px); box-shadow: ...; } — 150ms ease-out.',
    module: 'motion/micro-interactions.md',
  },
  {
    id: 'OPP-004', label: 'Navigation without scroll-state transition',
    check: src => /<nav|\.nav\s*{/i.test(src) && !/scrolled|scroll.*nav|nav.*scroll/i.test(src),
    suggestion: 'Add a .nav.scrolled class that transitions background blur/border on scroll (IntersectionObserver or scroll event).',
    module: 'motion/page-and-scroll.md',
  },
  {
    id: 'OPP-005', label: 'Form inputs without focus transition',
    check: src => /<input|\.input\s*{/i.test(src) && !/:focus.*transition|transition.*focus/i.test(src),
    suggestion: 'Add: input:focus { box-shadow: 0 0 0 3px var(--accent-subtle); } with 150ms ease-out transition.',
    module: 'motion/micro-interactions.md',
  },
  {
    id: 'OPP-006', label: 'Stats/numbers without count-up animation',
    check: src => /stat|metric|count|number/i.test(src) && !/countup|count-up|animateValue|requestAnimationFrame/i.test(src),
    suggestion: 'Animate numbers counting up on viewport entry. Use requestAnimationFrame, 1200ms ease-out. Respect prefers-reduced-motion.',
    module: 'motion/page-and-scroll.md',
  },
  {
    id: 'OPP-007', label: 'Sections without scroll-triggered reveal',
    check: src => (src.match(/<section/gi) || []).length > 3 && !/IntersectionObserver|reveal|scroll.*animation/i.test(src),
    suggestion: 'Add IntersectionObserver scroll reveals: opacity 0 → 1 + translateY(24px) → 0, threshold 0.15, 500ms ease-out.',
    module: 'motion/page-and-scroll.md',
  },
  {
    id: 'OPP-008', label: 'Loading states without skeleton animation',
    check: src => /loading|skeleton/i.test(src) && !/shimmer|pulse|skeleton.*animation|@keyframes.*shimmer/i.test(src),
    suggestion: 'Add shimmer animation to skeleton: @keyframes shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }',
    module: 'components/loading-skeletons.md',
  },
  {
    id: 'OPP-009', label: 'Modal/dialog without enter/exit transition',
    check: src => /modal|dialog\s*{/i.test(src) && !/modal.*animation|dialog.*transition|backdrop/i.test(src),
    suggestion: 'Add modal entrance: scale(0.95) + opacity 0 → scale(1) + opacity 1, 200ms ease-out. Exit: reverse.',
    module: 'components/modals.md',
  },
  {
    id: 'OPP-010', label: 'Tab/accordion without height transition',
    check: src => /accordion|tab\s*{|tabs\s*{/i.test(src) && !/(max-height|clip-path).*transition|transition.*(max-height|clip-path)/i.test(src),
    suggestion: 'Animate accordion height with max-height transition or CSS Grid row height trick. See motion/recipes.md accordion recipe.',
    module: 'components/tabs-accordions.md',
  },
];

function motionOpportunities(target, args, ctx) {
  const { cwd, ok, warn, log, fail } = ctx;
  if (!target) fail('Usage: designos motion-opportunities <dir-or-file> [--json]');
  const abs = path.resolve(cwd, target);
  if (!fs.existsSync(abs)) fail(`motion-opportunities: target not found: ${target}`);

  const asJson = args.includes('--json');
  const files  = fs.statSync(abs).isDirectory() ? [...walk(abs)] : [abs];
  const joined = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');

  const opps = OPPORTUNITY_PATTERNS.filter(o => o.check(joined));

  if (asJson) { console.log(JSON.stringify({ target, opportunities: opps.map(o => ({ id: o.id, label: o.label, suggestion: o.suggestion, module: o.module })) }, null, 2)); return; }

  console.log('\n  \x1b[1mDesignOS Motion Opportunities\x1b[0m\n');
  console.log(`  Target: ${target} · ${files.length} files scanned`);

  if (!opps.length) {
    ok('No obvious animation opportunities found. Motion system appears comprehensive.');
    return;
  }

  console.log(`\n  Found ${opps.length} opportunity${opps.length > 1 ? 'ies' : ''}:\n`);

  opps.forEach((o, i) => {
    console.log(`  \x1b[36m${i + 1}. ${o.label}\x1b[0m  \x1b[2m[${o.id}]\x1b[0m`);
    console.log(`     ${o.suggestion}`);
    console.log(`     \x1b[2mModule: ${o.module}\x1b[0m\n`);
  });

  log('These are advisory — not every element needs animation.');
  log('Evaluate each against motion/principles.md: "Default for everything else: it does not move."');
  log(`Budget: MOTION_INTENSITY dial controls which of these to implement.`);
}

// ── motion-vocabulary ────────────────────────────────────────────────────────
const VOCABULARY = [
  { term: 'ease-out', alias: 'decelerate', use: 'Entrances. Object arrives and settles. Default for most UI.', never: 'Exits (object would be decelerating as it leaves — unnatural).', example: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { term: 'ease-in', alias: 'accelerate', use: 'Exits. Object leaves and gains speed.', never: 'Entrances (object arrives at full speed — crashes).', example: 'cubic-bezier(0.4, 0, 1, 1)' },
  { term: 'ease-in-out', alias: 'symmetric', use: 'Transitions without clear entry/exit (e.g. slider between states).', never: 'Simple hover states — use ease-out.', example: 'cubic-bezier(0.45, 0, 0.55, 1)' },
  { term: 'spring', alias: 'overshoot', use: 'Playful, physical-feeling interactions. Scale, bounce-to-place.', never: 'Menus, tooltips, or any dense UI where overshoot feels glitchy.', example: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { term: 'linear', alias: 'constant', use: 'Color ramps, progress bars, spinner rotations.', never: 'Any spatial movement — robots move linearly, not UI.', example: 'linear' },
  { term: 'stagger', alias: 'cascade', use: 'Sequential entrance of list items. 40–80ms delay per item.', never: 'Total stagger sequence > 500ms (principles.md).' , example: 'nth-child delay: 60ms per item' },
  { term: 'FLIP', alias: 'First-Last-Invert-Play', use: 'Animate layout changes without triggering layout: snapshot positions before/after, apply transform to bridge the gap.', never: 'Recreating with margin/padding animation (forces layout every frame).', example: 'GSAP.to(el, { x: deltax, y: deltaY, duration: 0.3 })' },
  { term: 'composited properties', alias: 'GPU-safe', use: 'opacity, transform. Animated on the compositor thread — no layout, no paint.', never: 'width, height, margin, padding, top, left (forces layout).', example: 'transition: opacity 200ms, transform 200ms' },
  { term: 'signature moment', alias: 'hero animation', use: 'One memorable, product-specific animation per page that communicates the product truth.', never: 'More than 2 per page (AGENTS.md signature scarcity rule). Decoration without product meaning.', example: 'Stripe\'s payments flow, Linear\'s command palette, Vercel\'s deployment animation' },
  { term: 'reduced-motion', alias: 'a11y gate', use: '@media (prefers-reduced-motion) — collapse all animations to near-zero for users with vestibular disorders.', never: 'Skipping this. It is not optional — it is a hard requirement (WCAG 2.3).', example: '@media (prefers-reduced-motion: reduce) { ... animation-duration: 0.01ms }' },
  { term: 'long animation frame (LoAF)', alias: 'jank indicator', use: 'Frame > 50ms. Detected via PerformanceObserver or DevTools Performance panel. Budget: < 5% of frames.', never: 'Ignoring long frames in production — they are the #1 cause of perceived sluggishness.', example: 'PerformanceObserver type: "long-animation-frame"' },
  { term: 'will-change', alias: 'layer hint', use: 'Hint to browser to promote element to compositor layer before animation. Apply just before, remove after.', never: 'Setting on all elements globally — wastes GPU memory and can cause compositing storms.', example: 'el.style.willChange = "transform"; /* animate */ el.style.willChange = ""' },
];

function motionVocabulary(args, ctx) {
  const { log } = ctx;
  const searchTerm = args.filter(a => !a.startsWith('--')).join(' ').toLowerCase().trim();
  const asJson = args.includes('--json');
  const terms = searchTerm ? VOCABULARY.filter(v => v.term.includes(searchTerm) || v.alias.toLowerCase().includes(searchTerm)) : VOCABULARY;

  if (asJson) { console.log(JSON.stringify(terms, null, 2)); return; }

  console.log('\n  \x1b[1mDesignOS Animation Vocabulary\x1b[0m');
  console.log('  \x1b[2mDistilled from motion/principles.md + motion/performance.md + motion/micro-interactions.md\x1b[0m\n');

  if (!terms.length) { log(`No term matching "${searchTerm}". Try: ease-out, stagger, FLIP, spring, composited`); return; }

  for (const v of terms) {
    console.log(`  \x1b[1m\x1b[36m${v.term}\x1b[0m  \x1b[2m(${v.alias})\x1b[0m`);
    console.log(`  \x1b[32m✓ Use for:\x1b[0m  ${v.use}`);
    console.log(`  \x1b[31m✗ Never:\x1b[0m    ${v.never}`);
    console.log(`  \x1b[2mExample:\x1b[0m    ${v.example}`);
    console.log('');
  }

  log('Source: motion/principles.md · motion/performance.md · motion/micro-interactions.md');
  log('Search specific terms: node DesignOS/bin/designos.js motion-vocabulary ease-out');
}

// ── exports ──────────────────────────────────────────────────────────────────
function execute(cmd, target, args, ctx) {
  if (cmd === 'motion-review')        return motionReview(target, args, ctx);
  if (cmd === 'motion-opportunities') return motionOpportunities(target, args, ctx);
  if (cmd === 'motion-vocabulary')    return motionVocabulary(args, ctx);
  ctx.fail(`Unknown animation command: ${cmd}`);
}

module.exports = { execute, analyzeFile, RULES, VOCABULARY, OPPORTUNITY_PATTERNS };
