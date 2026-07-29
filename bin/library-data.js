/**
 * DesignOS library data — the retrieval layer.
 *
 * The kernel's first prime directive is "never design from memory alone". Loading a module
 * satisfies that for *rules*, but the moment the work needs a concrete artefact — a motion
 * spec, a type pairing — the model falls back on whatever it can recall, which is exactly
 * the default it was told to avoid. This file is the lookup those decisions read from.
 *
 * Every entry carries the module that governs it, so a retrieved answer stays traceable
 * back to the rule that justifies it. Searched by `designos find <query>`.
 *
 * Consumed by bin/designos.js. Zero dependencies.
 */

/* ---------------------------------------------------------------------------
 * MOTION PRESETS — the structured form of motion/recipes.md.
 * `tier` maps to the MOTION_INTENSITY dial (brain/brief-compiler.md):
 *   subtle     → intensity 1–2 (state feedback only)
 *   standard   → intensity 3–5 (entrances, one signature)
 *   expressive → intensity 6+  (choreography; needs a measured perf budget)
 * ------------------------------------------------------------------------- */
const MOTION_PRESETS = [
  {
    id: 'button-press',
    name: 'Button press and hover',
    tier: 'subtle',
    tags: ['button', 'cta', 'press', 'hover', 'feedback', 'active', 'tap'],
    when: 'Any interactive control. The 100-150ms layer where a product earns the word polished.',
    tokens: ['--duration-fast', '--ease-out'],
    code: `.btn {\n  transition: background-color var(--duration-fast) var(--ease-out),\n              transform var(--duration-fast) var(--ease-out);\n}\n.btn:hover  { transform: translateY(-1px); }\n.btn:active { transform: translateY(0) scale(0.99); }`,
    doNot: 'Do not exceed 150ms on hover — micro-interactions.md calls it "underwater". Lock the width before swapping in a spinner or you buy a CLS penalty.',
    module: 'motion/micro-interactions.md',
  },
  {
    id: 'dropdown-reveal',
    name: 'Dropdown / popover reveal',
    tier: 'subtle',
    tags: ['dropdown', 'menu', 'popover', 'select', 'reveal', 'origin'],
    when: 'Any overlay anchored to a trigger. Origin honesty: it grows out of the button it belongs to.',
    tokens: ['--duration-fast', '--ease-out'],
    code: `.menu {\n  transform-origin: top center;\n  opacity: 0; transform: translateY(-4px) scale(0.98);\n  transition: opacity var(--duration-fast) var(--ease-out),\n              transform var(--duration-fast) var(--ease-out);\n}\n.menu[data-open="true"] { opacity: 1; transform: none; }`,
    doNot: 'Never enter from a random direction, and exit faster than you entered (~75%).',
    module: 'motion/principles.md',
  },
  {
    id: 'modal-backdrop',
    name: 'Modal with backdrop',
    tier: 'standard',
    tags: ['modal', 'dialog', 'backdrop', 'overlay', 'scrim'],
    when: 'Blocking dialogs. Two elements, one gesture — the backdrop and the panel share a duration.',
    tokens: ['--duration-base', '--ease-out'],
    code: `.backdrop { opacity: 0; transition: opacity var(--duration-base) var(--ease-out); }\n.dialog {\n  opacity: 0; transform: translateY(8px) scale(0.98);\n  transition: opacity var(--duration-base) var(--ease-out),\n              transform var(--duration-base) var(--ease-out);\n}\n[data-open="true"] { opacity: 1; transform: none; }`,
    doNot: 'Never scale(0) → scale(1). Nothing in the physical world collapses to a point and returns.',
    module: 'components/modals.md',
  },
  {
    id: 'accordion-grid-rows',
    name: 'Accordion without animating height',
    tier: 'standard',
    tags: ['accordion', 'collapse', 'expand', 'height', 'disclosure', 'faq'],
    when: 'Any expand/collapse where the content height is unknown.',
    tokens: ['--duration-base', '--ease-out'],
    code: `.acc-panel {\n  display: grid; grid-template-rows: 0fr;\n  transition: grid-template-rows var(--duration-base) var(--ease-out);\n}\n.acc-panel > * { overflow: hidden; min-height: 0; }\n.acc-panel[data-open="true"] { grid-template-rows: 1fr; }`,
    doNot: 'Do not tween height:auto or max-height. min-height:0 on the child is load-bearing — without it the row never collapses.',
    module: 'motion/performance.md',
  },
  {
    id: 'shadow-crossfade',
    name: 'Hover shadow via ::after crossfade',
    tier: 'subtle',
    tags: ['shadow', 'card', 'hover', 'elevation', 'box-shadow', 'lift'],
    when: 'Card and surface hover states. Animating box-shadow directly repaints every frame.',
    tokens: ['--duration-fast', '--ease-out'],
    code: `.card { position: relative; transition: transform var(--duration-fast) var(--ease-out); }\n.card::after {\n  content: ""; position: absolute; inset: 0; border-radius: inherit;\n  box-shadow: 0 12px 28px rgb(0 0 0 / 0.22);\n  opacity: 0; pointer-events: none;\n  transition: opacity var(--duration-fast) var(--ease-out);\n}\n.card:hover { transform: translateY(-2px); }\n.card:hover::after { opacity: 1; }`,
    doNot: 'Never put box-shadow in a transition list — check-motion.js flags it as motion-noncomposited.',
    module: 'motion/performance.md',
  },
  {
    id: 'scroll-entrance',
    name: 'Scroll entrance, fires once',
    tier: 'standard',
    tags: ['scroll', 'reveal', 'entrance', 'intersection', 'fade-up', 'on-scroll'],
    when: 'Below-the-fold sections. Never the LCP element.',
    tokens: ['--duration-slower', '--ease-out', '--motion'],
    code: `.reveal {\n  opacity: 0; transform: translateY(calc(16px * var(--motion)));\n  transition: opacity var(--duration-slower) var(--ease-out),\n              transform var(--duration-slower) var(--ease-out);\n}\n.reveal.is-in { opacity: 1; transform: none; }\n/* io.unobserve(entry.target) after adding .is-in — fire once, never on every pass */`,
    doNot: 'Do not gate above-the-fold content on JS; do not re-run the entrance on every scroll pass.',
    module: 'motion/page-and-scroll.md',
  },
  {
    id: 'stagger-capped',
    name: 'Staggered list entrance',
    tier: 'standard',
    tags: ['stagger', 'list', 'sequence', 'cascade', 'delay', 'grid'],
    when: 'A group of sibling items entering together.',
    tokens: ['--duration-slower', '--ease-out'],
    code: `.stagger > :nth-child(1) { animation-delay: 0ms; }\n.stagger > :nth-child(2) { animation-delay: 40ms; }\n.stagger > :nth-child(3) { animation-delay: 80ms; }\n.stagger > :nth-child(4) { animation-delay: 120ms; }\n.stagger > :nth-child(5) { animation-delay: 160ms; }\n.stagger > :nth-child(n+6) { animation-delay: 200ms; }`,
    doNot: 'Do not let per-item delay keep climbing. 30-60ms apart, cap ~6 steps, total sequence inside 500ms.',
    module: 'motion/principles.md',
  },
  {
    id: 'skeleton-shimmer',
    name: 'Skeleton shimmer, paused off-screen',
    tier: 'subtle',
    tags: ['skeleton', 'shimmer', 'loading', 'placeholder', 'infinite', 'pulse'],
    when: 'Content-shaped loading states. Matched dimensions so the swap costs zero layout shift.',
    tokens: [],
    code: `.skeleton { animation: shimmer 1400ms linear infinite; }\n/* pause it: */\nnew IntersectionObserver(es => es.forEach(e =>\n  e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused'\n)).observe(el);`,
    doNot: 'An infinite animation with no off-screen guard burns frames and battery. check-motion.js flags it as motion-infinite-unpaused.',
    module: 'components/loading-skeletons.md',
  },
  {
    id: 'tooltip-intent',
    name: 'Tooltip with hover-intent delay',
    tier: 'subtle',
    tags: ['tooltip', 'hint', 'hover', 'delay', 'intent', 'popover'],
    when: 'Supplementary hints on hover. The 500ms delay filters the pass-through.',
    tokens: ['--duration-instant'],
    code: `let t;\ntrigger.addEventListener('pointerenter', () => { t = setTimeout(() => tip.dataset.open = 'true', 500); });\ntrigger.addEventListener('pointerleave', () => { clearTimeout(t); tip.dataset.open = 'false'; });`,
    doNot: 'Never animate a tooltip position, and never put information there that exists nowhere else — touch has no hover.',
    module: 'components/tooltips-popovers.md',
  },
  {
    id: 'flip-reorder',
    name: 'FLIP layout move',
    tier: 'standard',
    tags: ['flip', 'reorder', 'sort', 'filter', 'layout', 'shared-element', 'drag'],
    when: 'Reorder, filter, or any layout change where elements persist and should be followed, not blinked.',
    tokens: ['--duration-base', '--ease-out'],
    code: `const first = new Map([...els].map(el => [el, el.getBoundingClientRect()]));\nmutate();\nfor (const el of els) {\n  const last = el.getBoundingClientRect(), f = first.get(el);\n  el.animate([{ transform: \`translate(\${f.left-last.left}px, \${f.top-last.top}px)\` }, { transform: 'none' }],\n    { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });\n}`,
    doNot: 'Do not animate the layout properties themselves. Measure, mutate, invert, play.',
    module: 'motion/performance.md',
  },
  {
    id: 'drag-dismiss',
    name: 'Drag to dismiss with velocity threshold',
    tier: 'expressive',
    tags: ['drag', 'swipe', 'dismiss', 'gesture', 'sheet', 'velocity', 'momentum'],
    when: 'Sheets, cards, and toasts a user can throw away. Distance OR velocity — never distance alone.',
    tokens: ['--duration-slow', '--ease-out'],
    code: `// during drag: element.style.transition = 'none' and write transform from pointer\nconst flicked = Math.abs(v) > 0.11 && Math.sign(v) === Math.sign(dx); // v in px/ms\nconst dragged = Math.abs(dx) > el.offsetWidth * 0.5;\nif (flicked || dragged) dismiss(); else snapBack();`,
    doNot: 'Distance-only thresholds punish the fast, confident flick. Never ship a gesture with no keyboard equivalent.',
    module: 'motion/physics.md',
  },
  {
    id: 'scrubbed-scroll',
    name: 'Pinned / scrubbed scroll sequence',
    tier: 'expressive',
    tags: ['gsap', 'scrolltrigger', 'pin', 'scrub', 'horizontal', 'parallax', 'cinematic'],
    when: 'MOTION_INTENSITY 6+ only, and only with a measured 4x CPU-throttle pass.',
    tokens: [],
    code: `gsap.to('.panel', {\n  xPercent: -100 * (panels.length - 1), ease: 'none',\n  scrollTrigger: { trigger: '.rail', pin: true, scrub: 1, start: 'top top',\n                   end: () => '+=' + rail.offsetWidth, invalidateOnRefresh: true },\n});\n// return () => ctx.revert()`,
    doNot: 'start: "top top", not "top 80%" — the pin jumps. ease:"none" is correct only when scroll IS the timeline. Never preventDefault on wheel: that is scroll-jacking.',
    module: 'motion/page-and-scroll.md',
  },
  /* --- signature moments: the wow layer (motion/signature-moments.md).
     All `expressive`, all gated on MOTION_INTENSITY 6+, all subject to the scarcity law:
     two per page, maximum. brain/wow-calibration.md decides whether you may open these. --- */
  {
    id: 'magnetic-button',
    name: 'Magnetic button',
    tier: 'expressive',
    tags: ['magnetic', 'cursor', 'cta', 'button', 'awwwards', 'hover', 'wow', 'signature', 'pull', 'attract'],
    when: 'Exactly one primary CTA, confident or creative brand. The control leans toward the cursor inside an invisible field.',
    tokens: [],
    code: `const STRENGTH = 0.35, RADIUS = 120;\nfunction onMove(e){\n  const r = el.getBoundingClientRect();\n  const dx = e.clientX - (r.left + r.width/2), dy = e.clientY - (r.top + r.height/2);\n  const pull = Math.max(0, 1 - Math.hypot(dx,dy)/RADIUS);\n  tx = dx*STRENGTH*pull; ty = dy*STRENGTH*pull;\n}\n// follow loop: cx += (tx-cx)*0.18 → translate3d, stop when settled`,
    doNot: 'Never on three equal buttons — magnetism on all of them reads as a bug, not hierarchy. Gate on (hover:hover) and (pointer:fine); arm will-change only while the loop runs. Focus must produce the same emphasis by another means.',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'text-scramble',
    name: 'Text scramble / decrypt reveal',
    tier: 'expressive',
    tags: ['scramble', 'decrypt', 'terminal', 'hacker', 'reveal', 'text', 'glitch', 'cipher', 'wow', 'signature'],
    when: 'Products about data, security, inference, or transformation — the effect is a metaphor for the product doing its job.',
    tokens: [],
    code: `const CHARS = '▓▒░<>/\\\\[]{}=+*^?#________';\n// per character: settle at i*28ms + 320ms, otherwise draw a random glyph\nel.setAttribute('aria-label', finalText);   // real string always in the a11y tree\nel.style.minWidth = finalText.length + 'ch'; // reserve width or the line reflows per frame`,
    doNot: 'Never on a headline the user must read quickly, never on more than one string, never re-fired on each scroll pass. Without a reserved width this is the classic CLS offender.',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'cursor-spotlight',
    name: 'Cursor spotlight on a card grid',
    tier: 'expressive',
    tags: ['spotlight', 'cursor', 'glow', 'card', 'grid', 'pricing', 'hover', 'radial', 'glassmorphism', 'wow'],
    when: 'A grid of cards competing for attention — pricing tiers, feature sets. The grown-up replacement for glassmorphism.',
    tokens: ['--duration-base', '--ease-out'],
    code: `.spot::before {\n  background: radial-gradient(240px circle at var(--mx,50%) var(--my,50%),\n    rgb(from var(--accent) r g b / 0.16), transparent 70%);\n  opacity: 0; transition: opacity var(--duration-base) var(--ease-out);\n}\n.spot:hover::before { opacity: 1; }\n// ONE delegated pointermove on the grid sets --mx/--my on e.target.closest('.spot')`,
    doNot: 'One listener per card is the common mistake — delegate from the grid. Cap the surface: a full-viewport spotlight repaints the whole page every frame.',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'tilt-3d',
    name: '3D tilt on hover',
    tier: 'expressive',
    tags: ['tilt', '3d', 'perspective', 'rotate', 'depth', 'card', 'parallax', 'hover', 'wow'],
    when: 'The card holds something worth turning over — a product shot, real data, an artefact.',
    tokens: ['--duration-base', '--ease-out'],
    code: `.tilt-scene { perspective: 900px; }\n.tilt { transform: rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)); }\n.tilt[data-armed="true"] { transition: none; will-change: transform; }\n.tilt .rise { transform: translateZ(36px); }   /* text rises, does not shear */\n// MAX_DEG = 6 — past ~8° text edges alias and it reads as a toy`,
    doNot: 'Tilting a text-only card is theatre. preserve-3d promotes a layer — never on fifty cards.',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'split-text-reveal',
    name: 'Split-text headline reveal',
    tier: 'expressive',
    tags: ['split', 'text', 'headline', 'reveal', 'stagger', 'words', 'linear', 'vercel', 'launch', 'hero', 'wow'],
    when: 'The headline IS the argument. If the hero is carried by a product shot, let the headline just be there.',
    tokens: ['--duration-slower', '--ease-out', '--motion'],
    code: `.split { display:inline-block; overflow:hidden; }\n.split > span {\n  transform: translateY(calc(100% * var(--motion)));\n  animation: split-in var(--duration-slower) var(--ease-out) forwards;\n}\n// word stagger 50-70ms, delay CAPPED at ~420ms total\nel.setAttribute('aria-label', text);   // shards get aria-hidden`,
    doNot: 'Per-character stagger on a headline takes two seconds to become readable. Animating the LCP heading from opacity:0 delays your own Largest Contentful Paint — split sub-headings instead, or start from 0.001.',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'scroll-story',
    name: 'Scroll-driven storytelling',
    tier: 'expressive',
    tags: ['scroll', 'story', 'pin', 'sticky', 'apple', 'sequence', 'steps', 'narrative', 'scrub', 'hero', 'wow'],
    when: 'There is a genuine sequence — a process, a before/after, a transformation. The most expensive signature and the most memorable.',
    tokens: ['--motion'],
    code: `@supports (animation-timeline: view()) {\n  .scene-layer { animation: advance linear both;\n    animation-timeline: view(); animation-range: entry 20% cover 60%; }\n}\n// JS fallback: rAF-throttled scroll listener writing ONE custom property\naddEventListener('scroll', onScroll, { passive: true });   // passive is mandatory`,
    doNot: 'Never preventDefault on wheel — that is scroll-jacking, banned outright and a build failure. ease:"none"/linear is correct ONLY here, because scroll IS the timeline. Reduced motion removes the pin entirely: pinning is a named vestibular red flag.',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'odometer',
    name: 'Odometer number morph',
    tier: 'expressive',
    tags: ['odometer', 'number', 'counter', 'digits', 'roll', 'metric', 'price', 'count-up', 'wow'],
    when: 'The number IS the product — pricing, savings, throughput, the metric the page argues about.',
    tokens: ['--duration-slower', '--ease-out', '--motion'],
    code: `.odo { font-variant-numeric: tabular-nums; }\n.odo-col { height: 1em; overflow: hidden; }\n.odo-col > span {\n  transform: translateY(calc(var(--d,0) * -1em * var(--motion)));\n  transition: transform var(--duration-slower) var(--ease-out);\n}\n// stagger columns ~60-70ms so the number settles left to right`,
    doNot: 'tabular-nums is load-bearing — proportional digits change the element width as they roll. Never on a live-updating metric: a number that rolls every two seconds is a casino. Roll once, then crossfade.',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'cursor-parallax',
    name: 'Cursor parallax layers',
    tier: 'expressive',
    tags: ['parallax', 'cursor', 'layers', 'depth', 'mouse', 'hero', 'scene', 'wow'],
    when: 'The hero is composed of separable art — a device over a field, a foreground object over a grid.',
    tokens: [],
    code: `const DEPTHS = [0.012, 0.028, 0.05];   // back → front, spread under ~0.06\nlayers.forEach((l,i) => {\n  l.style.transform = 'translate3d(' + (mx*DEPTHS[i]) + 'px,' + (my*DEPTHS[i]) + 'px,0)';\n});\n// rAF-throttled, pointermove passive, cleanup on unmount`,
    doNot: 'Never parallax body text — text that drifts under the cursor is unreadable and nauseating. Max offset ~15% of the layer size; never tie this to scroll on mobile.',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'noise-canvas',
    name: 'Noise canvas atmosphere field',
    tier: 'expressive',
    tags: ['noise', 'canvas', 'perlin', 'field', 'atmosphere', 'background', 'webgl', 'shader', 'organic', 'ambient', 'wow'],
    when: 'The brand needs atmosphere and the alternative is a stock gradient. Best on dark themes. No WebGL, no shader compile, no 600KB bundle.',
    tokens: [],
    code: `// hash-based value noise, HALF resolution, sparse alpha\nconst hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453; return n-Math.floor(n);};\nd[i+3] = Math.max(0, noise(x*s + t*speed, y*s) - 0.55) * 150;\n// BOTH guards are load-bearing:\nnew IntersectionObserver(...)              // off-screen\ndocument.addEventListener('visibilitychange', ...)  // hidden tab`,
    doNot: 'Half resolution, sparse alpha, and both guards are not optimisations — remove any one and this is why a laptop fan spins up. Measure at 4x CPU throttle; if it cannot hold 60fps, ship a single static frame.',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'liquid-morph',
    name: 'Liquid / shared-element morph',
    tier: 'expressive',
    tags: ['morph', 'liquid', 'blob', 'clip-path', 'view-transition', 'shared-element', 'shape', 'continuity', 'wow'],
    when: 'Two states are genuinely the SAME object — a button becoming a panel, a card becoming a detail hero.',
    tokens: ['--duration-slow', '--ease-out'],
    code: `.morph { clip-path: polygon(6% 0%, 94% 0%, 100% 50%, 94% 100%, 6% 100%, 0% 50%);\n  transition: clip-path var(--duration-slow) var(--ease-out); }\n.morph[aria-expanded="true"] { clip-path: polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%); }\n\n/* cross-page: the SAME view-transition-name on both sides */\n.card-hero { view-transition-name: feature-hero; }\nif (document.startViewTransition) document.startViewTransition(() => render(next));`,
    doNot: 'clip-path polygons with mismatched vertex counts do not interpolate, they cut — pad the simpler shape with duplicate vertices. Morph the element the user clicked; everything else crossfades. A morph between unrelated elements raises "where did my button go?".',
    module: 'motion/signature-moments.md',
  },
  {
    id: 'reduced-motion-multiplier',
    name: 'Reduced motion, the craft version',
    tier: 'subtle',
    tags: ['accessibility', 'reduced-motion', 'vestibular', 'a11y', 'prefers'],
    when: 'Every deliverable that moves. Binding, not optional.',
    tokens: ['--motion'],
    code: `:root { --motion: 1; }\n@media (prefers-reduced-motion: reduce) { :root { --motion: 0; } }\n.reveal { transform: translateY(calc(16px * var(--motion))); }`,
    doNot: 'Reduce means fewer and gentler, not none — a user who asked for calm still needs to know the save succeeded.',
    module: 'motion/performance.md',
  },
];

/* ---------------------------------------------------------------------------
 * TYPE PAIRINGS — the answer to check-aesthetic-slop's `slop-default-typeface`.
 *
 * That rule flags Inter/Roboto/Poppins/Montserrat/Space Grotesk/Fraunces and friends as
 * P3: fine faces, but reaching for one is not yet a decision. These are alternatives that
 * carry an argument. `avoidWhen` is the honest half — none of them is universally right.
 *
 * All are available under open licences (SIL OFL or similar); confirm before commercial
 * use, and self-host with font-display: swap (CLAUDE.md §4 performance floor).
 * ------------------------------------------------------------------------- */
const TYPE_PAIRINGS = [
  {
    id: 'grotesk-technical',
    display: 'Geist',
    body: 'Geist',
    mono: 'Geist Mono',
    tags: ['developer', 'saas', 'technical', 'neutral', 'precise', 'linear-like'],
    sectors: ['saas', 'ai-startup', 'analytics-hosting', 'cybersecurity'],
    why: 'A single superfamily across display, body, and code. The mono is metrically related, so terminal blocks sit on the same rhythm as prose instead of reading as a foreign object.',
    avoidWhen: 'The brand belief is warmth or craft. Geist is deliberately cool and will fight that copy.',
  },
  {
    id: 'humanist-trust',
    display: 'Source Serif 4',
    body: 'Source Sans 3',
    mono: 'Source Code Pro',
    tags: ['fintech', 'legal', 'healthcare', 'trust', 'institutional', 'serif', 'document'],
    sectors: ['fintech', 'legal', 'insurance', 'healthcare', 'nonprofit-government'],
    why: 'A serif display over a humanist sans reads as considered rather than launched. Designed for long-form legibility at small sizes, which is what a disclosure or a policy page actually is.',
    avoidWhen: 'The product is a fast consumer app. This pairing implies deliberation, and a checkout does not want that.',
  },
  {
    id: 'editorial-voice',
    display: 'Newsreader',
    body: 'Public Sans',
    mono: 'IBM Plex Mono',
    tags: ['editorial', 'blog', 'media', 'longform', 'publication', 'magazine'],
    sectors: ['media-news', 'education', 'portfolio-agency'],
    why: 'Newsreader has real optical sizing, so a 64px headline and a 20px deck are different drawings rather than the same one scaled. That is the difference between an editorial page and a blog template.',
    avoidWhen: 'Dense product UI. Optical-size ranges are wasted below 16px and the serif costs scanability in tables.',
  },
  {
    id: 'geometric-consumer',
    display: 'Outfit',
    body: 'Figtree',
    mono: 'JetBrains Mono',
    tags: ['consumer', 'friendly', 'app', 'onboarding', 'approachable', 'geometric'],
    sectors: ['ecommerce', 'education', 'events-entertainment', 'travel-hospitality'],
    why: 'Geometric display over a slightly rounder body: warm without tipping into a toy. Figtree keeps its counters open at 14px, which is where consumer UI actually lives.',
    avoidWhen: 'Enterprise or regulated surfaces. Geometric display faces read as marketing and undercut a compliance page.',
  },
  {
    id: 'industrial-density',
    display: 'Archivo',
    body: 'Archivo',
    mono: 'Roboto Mono',
    tags: ['dashboard', 'dense', 'industrial', 'data', 'condensed', 'cockpit', 'admin'],
    sectors: ['crm-erp', 'logistics', 'manufacturing-b2b', 'automotive'],
    why: 'Archivo carries a real condensed axis, so column headers can tighten without switching family. At VISUAL_DENSITY 8+ that variable width is the difference between a readable table and a wrapped one.',
    avoidWhen: 'Marketing pages with generous whitespace — condensed axes look anxious when nothing is competing for room.',
  },
  {
    id: 'quiet-clinical',
    display: 'Instrument Sans',
    body: 'Instrument Sans',
    mono: 'Martian Mono',
    tags: ['healthcare', 'calm', 'clinical', 'quiet', 'accessible', 'wellbeing'],
    sectors: ['healthcare', 'insurance', 'nonprofit-government'],
    why: 'Large x-height and unambiguous 1/l/I — the disambiguation that matters when the number on screen is a dosage. Quiet enough that the interface does not add stress to a stressed reader.',
    avoidWhen: 'The brand needs to be memorable at a glance. This face is deliberately unremarkable.',
  },
];

module.exports = { MOTION_PRESETS, TYPE_PAIRINGS };
