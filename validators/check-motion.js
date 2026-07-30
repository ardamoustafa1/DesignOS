#!/usr/bin/env node
/**
 * DesignOS motion checker — the animation half of the mechanical floor.
 *
 *   node check-motion.js <src-dir-or-file> [token-file ...]
 *
 * check-drift.js polices color and spacing tokens; nothing policed motion, so a file
 * could be drift-clean, contrast-clean, and still ship `transition: all 400ms ease-in-out`
 * on a hover — three separate violations of motion/ that no gate could see.
 *
 * Every rule below is a mechanization of a line already written in motion/:
 *   motion-transition-all      performance.md compositor rule (unbounded property list)
 *   motion-noncomposited       performance.md "✗ width, height, top, left, margin, padding"
 *   motion-duration-ceiling    principles.md "Nothing interactive over 300ms"
 *   motion-hover-sluggish      micro-interactions.md "Hover effects >150ms"
 *   motion-ease-in-entrance    principles.md "Never ease-in for entrances"
 *   motion-linear-spatial      principles.md "Never linear for spatial movement"
 *   motion-spring-unlicensed   principles.md "One spring config system-wide if used"
 *   motion-no-reduced-motion   performance.md "binding, tested, every deliverable"
 *   motion-untokenized         principles.md "All durations/easings from tokens"
 *   motion-infinite-decoration principles.md "Default for everything else: it does not move"
 *   motion-infinite-unpaused   performance.md "pause when off-viewport and when tab hidden"
 *   motion-stagger-overrun     principles.md "Total sequence ≤500ms"
 *   motion-will-change-static  performance.md "apply just-before animating, remove after"
 *   motion-scroll-listener     performance.md "rAF + passive listeners"
 *   motion-scroll-jacking      page-and-scroll.md scroll-jacking ban
 *   motion-missing-cleanup     performance.md "Entrance JS that holds content hostage"
 *
 * Honest scope (what a static tool cannot see — final-gate.md still applies):
 *   - It reads declarations, not frames. A rule can pass every check here and still
 *     drop frames on a mid-range Android; the 4× CPU throttle test is not automatable.
 *   - Runtime-composed styles (JS string building, Tailwind arbitrary values resolved at
 *     build time, CSS-in-JS behind props) are skipped, not judged.
 *   - "Signature moment" is a design decision, not a token — the 500ms ceiling is
 *     enforced with an opt-out, and the opt-out must carry its reason.
 *
 * Opt-outs for deliberate exceptions (anti-pattern fixtures, licensed signature moments):
 *   file-level:  put `designos-motion-ignore-file` anywhere in the file
 *   local:       put a `motion-ok: <reason>` comment within ~200 chars of the declaration —
 *                the reason is mandatory, an escape without a why is drift
 */
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const positional = argv.filter(a => !a.startsWith('--'));
const target = positional[0];
const tokenFiles = positional.slice(1);
if (!target) {
  console.error('usage: check-motion.js <src-dir-or-file> [token-file ...]');
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

/* ---------- primitives ---------- */

// keeps byte offsets stable so every finding still maps to its real line
const blankComments = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));

const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

/**
 * Local escape hatch — the reason is the point, `motion-ok` alone is drift.
 * Line-scoped, not character-scoped: one CSS rule is routinely 300+ characters, so a byte
 * window either misses the comment above the rule or leaks into the next one. The directive
 * is honoured on the finding's own line and the three lines above it.
 */
function hasException(raw, idx) {
  const lines = raw.split('\n');
  const n = lineOf(raw, idx) - 1;
  return lines.slice(Math.max(0, n - 3), n + 1).some(l => /motion-ok\s*:/i.test(l));
}

const toMs = (num, unit) => (unit === 's' ? parseFloat(num) * 1000 : parseFloat(num));

function durationsIn(value) {
  const out = [];
  for (const m of value.matchAll(/(-?\d*\.?\d+)(ms|s)\b/g)) out.push(toMs(m[1], m[2]));
  return out;
}

// splits on a delimiter only at paren depth 0 so cubic-bezier(0.16, 1, 0.3, 1) survives
function splitTop(value, delimiter) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth === 0 && (delimiter === ' ' ? /\s/.test(ch) : ch === delimiter)) {
      if (cur.trim()) parts.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

const TIMING_KEYWORD = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)$/;
const TIMING_FN = /^(cubic-bezier|steps|linear|spring)\(/;
const isTiming = (t) => TIMING_KEYWORD.test(t) || TIMING_FN.test(t);
const isTime = (t) => /^-?\d*\.?\d+(ms|s)$/.test(t);

/** cubic-bezier control points outside [0,1] on Y = overshoot (spring/back/anticipation) */
function bezierOvershoots(timing) {
  const m = timing.match(/^cubic-bezier\(([^)]*)\)/);
  if (!m) return false;
  const n = m[1].split(',').map(v => parseFloat(v.trim()));
  if (n.length !== 4 || n.some(Number.isNaN)) return false;
  return n[1] > 1 || n[3] > 1 || n[1] < 0 || n[3] < 0;
}

/** the ease-in family, excluding ease-in-out which is a legitimate move-within-view curve */
const isEaseIn = (timing) =>
  /^ease-in$/.test(timing) || (/^cubic-bezier\(/.test(timing) && slowStart(timing));

function slowStart(timing) {
  const m = timing.match(/^cubic-bezier\(([^)]*)\)/);
  if (!m) return false;
  const n = m[1].split(',').map(v => parseFloat(v.trim()));
  if (n.length !== 4 || n.some(Number.isNaN)) return false;
  // x1 well ahead of y1 means the curve loiters before it obeys — principles.md's
  // "the element hesitates before obeying". 0.7,0,0.84,0 (the exit token) matches.
  return n[0] - n[1] >= 0.4;
}

// motion/principles.md licenses infinite loops for loaders and marquees only
const LOOP_LICENSED = /(spin|spinner|load|loading|shimmer|skeleton|marquee|ticker|scroll|progress|wave|orbit|carousel)/i;
// "exits only, use sparingly" — ease-in is legal when the thing is leaving
const EXIT_CONTEXT = /(exit|leave|clos|dismiss|hide|collaps|remov|out\b|backdrop)/i;

/* motion/performance.md: "✗ width, height, top, left, margin, padding → layout storm" */
const LAYOUT_PROPS = new Set([
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'top', 'left', 'right', 'bottom', 'inset',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-width', 'font-size', 'line-height', 'letter-spacing', 'flex-basis',
]);
/* "✗ box-shadow directly → paint storm"; backdrop-filter repaints the stack behind it */
const PAINT_PROPS = new Set(['box-shadow', 'text-shadow', 'background-position', 'background-size', 'backdrop-filter']);

const RECIPE = {
  height: 'grid-template-rows: 0fr→1fr (+ inner min-height: 0) or FLIP — performance.md',
  'max-height': 'grid-template-rows: 0fr→1fr — max-height tweens fake it and mistime the ease',
  'box-shadow': 'crossfade two layered shadows via ::after opacity — performance.md',
  width: 'transform: scaleX on a pseudo-element with transform-origin set — performance.md',
  top: 'transform: translateY — performance.md',
  left: 'transform: translateX — performance.md',
};
const recipeFor = (prop) => RECIPE[prop] || 'animate transform/opacity instead (performance.md compositor rule)';

/* ---------- CSS extraction ---------- */

function cssChunks(file, raw) {
  if (/\.css$/.test(file)) return [{ text: raw, offset: 0 }];
  const chunks = [];
  for (const m of raw.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    chunks.push({ text: m[1], offset: m.index + m[0].indexOf(m[1]) });
  }
  // styled-components, emotion, css`` — the same declarations, a different envelope
  for (const m of raw.matchAll(/(?:styled\.[\w.]+|styled\([^)]*\)|css|createGlobalStyle|keyframes)\s*`([\s\S]*?)`/g)) {
    chunks.push({ text: m[1], offset: m.index + m[0].indexOf(m[1]) });
  }
  return chunks;
}

const BLOCK = /([^{}]+)\{([^{}]*)\}/g; // innermost blocks only — declarations live nowhere else

/**
 * Byte ranges of `@media (prefers-reduced-motion …) { … }` at-rules, by brace matching.
 * A proximity window cannot do this job: a kill-switch block declared at the top of a file
 * would swallow every rule beneath it and silently suppress real findings.
 */
function reducedMotionRanges(text) {
  const ranges = [];
  const re = /@media[^{]*prefers-reduced-motion[^{]*\{/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < text.length && depth > 0) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      i++;
    }
    ranges.push([m.index, i]);
  }
  return ranges;
}

function* blocksOf(chunk) {
  for (const m of chunk.text.matchAll(BLOCK)) {
    yield {
      selector: m[1].trim().split('\n').pop().trim(),
      body: m[2],
      bodyOffset: chunk.offset + m.index + m[0].indexOf('{') + 1,
      offset: chunk.offset + m.index,
      chunk,
    };
  }
}

function declsOf(body, baseOffset) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i <= body.length; i++) {
    const ch = body[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (i === body.length || (ch === ';' && depth === 0)) {
      const seg = body.slice(start, i);
      const c = seg.indexOf(':');
      if (c !== -1) {
        const prop = seg.slice(0, c).trim().toLowerCase();
        if (/^[-a-z]+$/.test(prop)) {
          const lead = seg.search(/\S/);
          out.push({ prop, value: seg.slice(c + 1).trim(), offset: baseOffset + start + (lead < 0 ? 0 : lead) });
        }
      }
      start = i + 1;
    }
  }
  return out;
}

const KEYFRAME_STEP = /^(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+(\.\d+)?%))*$/i;

function keyframeNameBefore(text, idx) {
  const found = [...text.slice(0, idx).matchAll(/@(?:-\w+-)?keyframes\s+([\w-]+)/g)].pop();
  return found ? found[1] : null;
}

/* ---------- shorthand parsing ---------- */

/** transition: <property> <duration> <timing> <delay>, … */
function parseTransition(value) {
  return splitTop(value, ',').map(part => {
    const tokens = splitTop(part, ' ');
    const times = tokens.filter(isTime);
    const timing = tokens.find(isTiming);
    const property = tokens.find(t => !isTime(t) && !isTiming(t) && !/^(!important|var\()/.test(t));
    return {
      property: (property || 'all').toLowerCase(),
      duration: times.length ? toMs(...times[0].match(/^(-?\d*\.?\d+)(ms|s)$/).slice(1)) : null,
      delay: times.length > 1 ? toMs(...times[1].match(/^(-?\d*\.?\d+)(ms|s)$/).slice(1)) : null,
      timing: timing || null,
      hasVar: /var\(\s*--/.test(part),
    };
  });
}

/** animation: <name> <duration> <timing> <delay> <iteration> … */
function parseAnimation(value) {
  return splitTop(value, ',').map(part => {
    const tokens = splitTop(part, ' ');
    const times = tokens.filter(isTime);
    const timing = tokens.find(isTiming);
    const name = tokens.find(t =>
      !isTime(t) && !isTiming(t) && !/^(infinite|alternate|alternate-reverse|reverse|normal|forwards|backwards|both|none|running|paused|!important)$/i.test(t) &&
      !/^\d/.test(t) && !/^var\(/.test(t));
    return {
      name: name || null,
      duration: times.length ? toMs(...times[0].match(/^(-?\d*\.?\d+)(ms|s)$/).slice(1)) : null,
      delay: times.length > 1 ? toMs(...times[1].match(/^(-?\d*\.?\d+)(ms|s)$/).slice(1)) : null,
      timing: timing || null,
      infinite: /\binfinite\b/i.test(part),
      hasVar: /var\(\s*--/.test(part),
    };
  });
}

/* ---------- the pass ---------- */

const findings = [];
const files = [...walk(path.resolve(target))];

// a project-level reduced-motion policy in a shared token file covers every component
let globalReducedMotion = false;
let globalMotionTokens = false;
for (const f of tokenFiles) {
  if (!fs.existsSync(f)) continue;
  const t = fs.readFileSync(path.resolve(f), 'utf8');
  if (/prefers-reduced-motion/i.test(t)) globalReducedMotion = true;
  if (/--(duration|ease|motion|transition)[\w-]*\s*:/i.test(t)) globalMotionTokens = true;
}

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file);
  if (raw.includes('designos-motion-ignore-file')) {
    console.log(`skipped (ignore directive): ${rel}`);
    continue;
  }
  const clean = blankComments(raw);
  const loc = (idx) => `${rel}:${lineOf(raw, idx)}`;
  const push = (idx, rule, detail) => {
    if (hasException(raw, idx)) return;
    findings.push(`${loc(idx)}  ${rule}  ${detail}`);
  };

  const hasReducedMotion = globalReducedMotion || /prefers-reduced-motion/i.test(clean);
  const hasMotionTokens = globalMotionTokens || /--(duration|ease|motion|transition)[\w-]*\s*:/i.test(clean);
  const pausesLoops = /IntersectionObserver|animation-play-state|visibilitychange|document\.hidden/i.test(clean);
  let motionDeclared = false;

  /* ── CSS declarations ── */
  for (const chunk of cssChunks(file, clean)) {
    const reducedRanges = reducedMotionRanges(chunk.text);
    for (const block of blocksOf(chunk)) {
      const { selector, body, bodyOffset } = block;
      const isKeyframeStep = KEYFRAME_STEP.test(selector);
      const keyframeName = isKeyframeStep ? keyframeNameBefore(chunk.text, block.offset - chunk.offset) : null;
      const context = `${selector} ${keyframeName || ''}`;
      const isHover = /:hover\b/.test(selector);
      const isRoot = /(^|\s):root\s*$/.test(selector) || selector === ':root';
      const localOffset = block.offset - chunk.offset;
      const isReducedBlock = reducedRanges.some(([s, e]) => localOffset >= s && localOffset < e);

      for (const d of declsOf(body, bodyOffset)) {
        /* keyframe steps: every declared property is, by definition, animated */
        if (isKeyframeStep) {
          if (LAYOUT_PROPS.has(d.prop) || PAINT_PROPS.has(d.prop)) {
            push(d.offset, 'motion-noncomposited',
              `@keyframes ${keyframeName || '?'} animates ${d.prop} — ${recipeFor(d.prop)}`);
          }
          continue;
        }

        if (d.prop === 'will-change' && !/^(auto|initial|inherit|unset)$/.test(d.value)) {
          // "armed" = the rule only applies while something is actually animating, which is
          // exactly what performance.md asks for. Pseudo-classes, is-/will-/anim- state
          // classes, and boolean state attributes all qualify.
          const armed = /:hover|:focus|:active|\.is-|\.will-|\.anim|\[data-(anim|state|motion|armed|active|open|dragging|playing)/.test(selector);
          if (!armed) {
            push(d.offset, 'motion-will-change-static',
              `will-change: ${d.value} on a rest-state rule — apply just before animating and remove after (performance.md budget & hygiene)`);
          }
          continue;
        }

        /* ── transitions ── */
        if (d.prop === 'transition' || d.prop === 'transition-property') {
          const parts = d.prop === 'transition'
            ? parseTransition(d.value)
            : splitTop(d.value, ',').map(p => ({ property: p.toLowerCase(), duration: null, delay: null, timing: null, hasVar: false }));
          for (const p of parts) {
            if (p.property === 'all') {
              push(d.offset, 'motion-transition-all',
                'transition: all — every future property becomes animated by accident, including layout ones; name the properties (performance.md compositor rule)');
            } else if (LAYOUT_PROPS.has(p.property) || PAINT_PROPS.has(p.property)) {
              push(d.offset, 'motion-noncomposited',
                `transitions ${p.property} — ${recipeFor(p.property)}`);
            }
          }
        }

        if (['transition', 'transition-duration', 'animation', 'animation-duration'].includes(d.prop)) {
          if (durationsIn(d.value).some(ms => ms > 0)) motionDeclared = true;
        }

        if (d.prop === 'transition' || d.prop === 'transition-duration') {
          const ds = d.prop === 'transition'
            ? parseTransition(d.value).map(p => p.duration).filter(v => v !== null)
            : durationsIn(d.value);
          for (const ms of ds) {
            if (isReducedBlock || ms === 0) continue;
            if (ms > 300) {
              push(d.offset, 'motion-duration-ceiling',
                `${ms}ms transition — nothing interactive may exceed 300ms; past that, feedback reads as latency (principles.md duration law 2)`);
            } else if (isHover && ms > 150) {
              push(d.offset, 'motion-hover-sluggish',
                `${ms}ms hover transition — hovers are 100–150ms; slower and the UI feels underwater (micro-interactions.md)`);
            }
          }
        }

        if (d.prop === 'animation' || d.prop === 'animation-duration') {
          const ds = d.prop === 'animation'
            ? parseAnimation(d.value).map(p => p.duration).filter(v => v !== null)
            : durationsIn(d.value);
          const looping = d.prop === 'animation'
            ? parseAnimation(d.value).some(p => p.infinite)
            : /infinite/i.test(body);
          for (const ms of ds) {
            if (isReducedBlock || ms === 0 || looping) continue; // loops are duration-per-cycle, not a wait
            if (ms > 500) {
              push(d.offset, 'motion-duration-ceiling',
                `${ms}ms animation exceeds --duration-slower (500ms) — reserved for one signature moment per page; if this is it, mark it \`motion-ok: signature\` (principles.md)`);
            }
          }
        }

        /* ── delays and stagger budget ── */
        if (['transition-delay', 'animation-delay'].includes(d.prop) || d.prop === 'transition' || d.prop === 'animation') {
          const delays = d.prop === 'transition' ? parseTransition(d.value).map(p => p.delay)
            : d.prop === 'animation' ? parseAnimation(d.value).map(p => p.delay)
              : durationsIn(d.value);
          for (const ms of delays) {
            if (ms === null || ms <= 500 || isReducedBlock) continue;
            push(d.offset, 'motion-stagger-overrun',
              `${ms}ms delay — a staggered sequence must finish inside 500ms total; the last item is already past the user's patience (principles.md choreography)`);
          }
        }

        /* ── easing ── */
        const timings = [];
        if (d.prop === 'transition') timings.push(...parseTransition(d.value).map(p => p.timing));
        else if (d.prop === 'animation') timings.push(...parseAnimation(d.value).map(p => p.timing));
        else if (d.prop === 'transition-timing-function' || d.prop === 'animation-timing-function') {
          timings.push(...splitTop(d.value, ','));
        }
        const animatesTransform =
          /transform|translate|scale|rotate/i.test(d.value) ||
          /transform|translate|scale|rotate/i.test(body);

        for (const t of timings.filter(Boolean)) {
          if (isRoot) continue; // the token layer defines the curves; using them is the point
          if (isEaseIn(t) && !EXIT_CONTEXT.test(context)) {
            push(d.offset, 'motion-ease-in-entrance',
              `${t} outside an exit — ease-in makes the element hesitate before obeying; entrances and responses use ease-out (principles.md easing law 3)`);
          }
          if (/^linear$/.test(t) && animatesTransform && !LOOP_LICENSED.test(context)) {
            push(d.offset, 'motion-linear-spatial',
              'linear easing on spatial movement — linear is for opacity fades and marquees only; real objects accelerate (principles.md easing law 2)');
          }
          // a literal overshoot curve inline is a one-off spring; the licensed form is
          // one config in the token layer, referenced as var(--ease-spring)
          if (bezierOvershoots(t)) {
            push(d.offset, 'motion-spring-unlicensed',
              `${t} overshoots inline — springs are a brand decision (banned in fintech/health/enterprise) and must be ONE config system-wide: define it in :root and reference the token (principles.md easing law 4)`);
          }
        }

        /* ── token discipline ── */
        if (hasMotionTokens && !isRoot && !isReducedBlock &&
          ['transition', 'animation', 'transition-duration', 'animation-duration', 'transition-timing-function', 'animation-timing-function'].includes(d.prop)) {
          const literalDuration = durationsIn(d.value).some(ms => ms > 0);
          const literalEase = timings.filter(Boolean).some(t => TIMING_KEYWORD.test(t) || /^cubic-bezier\(/.test(t));
          if ((literalDuration || literalEase) && !/var\(\s*--/.test(d.value)) {
            push(d.offset, 'motion-untokenized',
              `${d.prop}: ${d.value.slice(0, 48)} bypasses the motion token layer this project already defines — use var(--duration-*) / var(--ease-*) (principles.md checklist)`);
          }
        }

        /* ── infinite loops ── */
        if (d.prop === 'animation' || d.prop === 'animation-iteration-count') {
          const loops = d.prop === 'animation'
            ? parseAnimation(d.value).filter(p => p.infinite)
            : (/infinite/i.test(d.value) ? [{ name: null }] : []);
          for (const l of loops) {
            const licensed = LOOP_LICENSED.test(`${context} ${l.name || ''}`);
            if (!licensed) {
              push(d.offset, 'motion-infinite-decoration',
                `infinite animation on "${selector}" — perpetual motion is decoration-in-motion; the whitelist is loaders and marquees, everything else rests (principles.md "What animates")`);
            } else if (!pausesLoops) {
              push(d.offset, 'motion-infinite-unpaused',
                `infinite animation with no IntersectionObserver / animation-play-state / visibilitychange guard — it keeps burning frames off-screen and in hidden tabs (performance.md budget & hygiene)`);
            }
          }
        }
      }
    }
  }

  /* ── script-side motion ── */
  if (/\.(html|jsx?|tsx?|vue|svelte)$/.test(file)) {
    for (const m of clean.matchAll(/addEventListener\(\s*['"`]scroll['"`]([\s\S]{0,160})/g)) {
      if (!/passive\s*:\s*true/.test(m[1])) {
        push(m.index, 'motion-scroll-listener',
          'scroll listener without { passive: true } — it blocks the compositor on every frame; prefer IntersectionObserver or animation-timeline, and pass passive when JS is unavoidable (performance.md)');
      }
    }
    for (const m of clean.matchAll(/addEventListener\(\s*['"`](wheel|touchmove|mousewheel)['"`]([\s\S]{0,400})/g)) {
      if (/preventDefault\s*\(/.test(m[2])) {
        push(m.index, 'motion-scroll-jacking',
          `${m[1]} listener calling preventDefault — the page is overriding the user's scroll; scroll-jacking is banned outright (page-and-scroll.md)`);
      }
    }
    // effects that start motion must stop it — a missing cleanup leaks timers and tweens
    for (const m of clean.matchAll(/\b(useEffect|useLayoutEffect|onMounted|onMount)\s*\(/g)) {
      const open = clean.indexOf('(', m.index + m[1].length);
      let depth = 0;
      let end = -1;
      for (let i = open; i < clean.length; i++) {
        if (clean[i] === '(') depth++;
        else if (clean[i] === ')') { depth--; if (depth === 0) { end = i; break; } }
      }
      if (end === -1) continue;
      const bodyText = clean.slice(open, end);
      const startsMotion = /\b(gsap|anime|ScrollTrigger|Motion|animate)\s*[.(]|requestAnimationFrame\s*\(|setInterval\s*\(|addEventListener\s*\(|new\s+IntersectionObserver|new\s+ResizeObserver/.test(bodyText);
      if (startsMotion && !/\breturn\b/.test(bodyText)) {
        push(m.index, 'motion-missing-cleanup',
          `${m[1]} starts an animation/observer/listener with no cleanup return — the tween survives unmount, keeps a stale node alive, and re-fires on the next mount (performance.md)`);
      }
    }
  }

  /* ── reduced motion: once per file, and only if the file actually moves ── */
  if (motionDeclared && !hasReducedMotion) {
    const anchor = clean.search(/transition\s*:|animation\s*:/);
    push(anchor < 0 ? 0 : anchor, 'motion-no-reduced-motion',
      'file declares motion but no prefers-reduced-motion policy is in scope — this is a DesignOS instant-fail, not a nice-to-have (performance.md). Pass the shared token file as an argument if the policy lives there.');
  }
}

if (findings.length) {
  findings.forEach(f => console.log(f));
  console.log(`\ncheck-motion: ${findings.length} finding(s)`);
  process.exit(1);
}
console.log('check-motion: clean (declaration-level only — frame rate, choreography, and taste still need eyes)');
