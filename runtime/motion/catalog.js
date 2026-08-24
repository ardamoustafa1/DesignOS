'use strict';

/**
 * MotionOS executable catalogue. Entries are implementation contracts, not visual
 * adjectives: every recipe maps to a runtime driver and declares its fallbacks.
 */
const GROUPS = Object.freeze({
  typography: [
    ['word-cascade', 'reveal', 'hero'], ['line-mask-rise', 'reveal', 'hero'],
    ['glyph-wave', 'stagger', 'display'], ['tracking-resolve', 'resolve', 'display'],
    ['type-scramble', 'scramble', 'label'], ['character-flip', 'stagger', 'display'],
    ['kinetic-emphasis', 'pulse', 'display'], ['marquee-drift', 'loop', 'ambient'],
    ['baseline-sweep', 'reveal', 'display'], ['serif-sans-morph', 'resolve', 'display'], ['word-orbit', 'orbit', 'display'], ['headline-shutter', 'clip', 'hero'], ['variable-weight-pulse', 'pulse', 'display'], ['caption-decoder', 'scramble', 'label'], ['vertical-type-stream', 'loop', 'ambient'],
  ],
  media: [
    ['image-curtain', 'clip', 'media'], ['lens-reveal', 'spotlight', 'media'],
    ['depth-parallax', 'parallax', 'media'], ['filmstrip-cascade', 'stagger', 'media'],
    ['poster-to-motion', 'resolve', 'media'], ['chromatic-hover', 'tilt', 'media'],
    ['mask-wipe', 'clip', 'media'], ['focus-pull', 'resolve', 'media'],
    ['duotone-resolve', 'resolve', 'media'], ['split-image-drift', 'parallax', 'media'], ['pixel-sort-reveal', 'shader', 'media'], ['contact-sheet-focus', 'spotlight', 'media'], ['cinematic-letterbox', 'clip', 'media'], ['before-after-scrub', 'progress', 'media'], ['material-light-pass', 'spotlight', 'media'],
  ],
  scroll: [
    ['section-reveal', 'reveal', 'scroll'], ['sticky-chapter', 'progress', 'scroll'],
    ['scroll-progress', 'progress', 'scroll'], ['horizontal-story', 'progress', 'scroll'],
    ['stacked-cards', 'progress', 'scroll'], ['image-sequence', 'progress', 'scroll'],
    ['depth-journey', 'parallax', 'scroll'], ['chapter-handoff', 'handoff', 'scroll'],
    ['pinned-specimen', 'progress', 'scroll'], ['scroll-snap-narrative', 'handoff', 'scroll'], ['timeline-trace', 'draw', 'scroll'], ['viewport-type-scale', 'progress', 'scroll'], ['layer-peel', 'progress', 'scroll'], ['ambient-ground-shift', 'resolve', 'scroll'], ['scroll-velocity-skew', 'parallax', 'scroll'],
  ],
  pointer: [
    ['magnetic-intent', 'magnetic', 'interaction'], ['cursor-spotlight', 'spotlight', 'interaction'],
    ['surface-tilt', 'tilt', 'interaction'], ['cursor-parallax', 'parallax', 'interaction'],
    ['proximity-label', 'magnetic', 'interaction'], ['elastic-arrow', 'spring', 'interaction'],
    ['inspection-lens', 'spotlight', 'interaction'], ['hover-depth-stack', 'tilt', 'interaction'],
    ['cursor-trail', 'particles', 'interaction'], ['edge-attraction', 'magnetic', 'interaction'], ['pointer-ripple', 'pulse', 'interaction'], ['image-pan-intent', 'parallax', 'interaction'], ['card-glare', 'spotlight', 'interaction'], ['elastic-label', 'spring', 'interaction'], ['cursor-mode-switch', 'state', 'interaction'],
  ],
  transition: [
    ['shared-element', 'handoff', 'navigation'], ['route-curtain', 'clip', 'navigation'],
    ['editorial-wipe', 'clip', 'navigation'], ['project-zoom', 'handoff', 'navigation'],
    ['crossfade-depth', 'resolve', 'navigation'], ['menu-takeover', 'clip', 'navigation'],
    ['section-morph', 'handoff', 'navigation'], ['continuity-slide', 'handoff', 'navigation'],
    ['iris-transition', 'clip', 'navigation'], ['paper-fold-transition', 'clip', 'navigation'], ['depth-blur-handoff', 'handoff', 'navigation'], ['tile-collapse', 'stagger', 'navigation'], ['portal-transition', 'handoff', 'navigation'], ['chapter-index-swap', 'resolve', 'navigation'], ['navigation-light-pass', 'spotlight', 'navigation'],
  ],
  vector: [
    ['path-draw', 'draw', 'vector'], ['logo-assemble', 'stagger', 'vector'],
    ['icon-morph', 'morph', 'vector'], ['data-trace', 'draw', 'vector'],
    ['orbital-diagram', 'loop', 'vector'], ['signal-pulse', 'pulse', 'vector'],
    ['contour-reveal', 'draw', 'vector'], ['state-machine-art', 'state', 'vector'],
    ['topology-draw', 'draw', 'vector'], ['radar-scan', 'pulse', 'vector'], ['node-network', 'stagger', 'vector'], ['signature-stroke', 'draw', 'vector'], ['diagram-handoff', 'handoff', 'vector'], ['shape-breath', 'morph', 'vector'], ['vector-depth-shift', 'parallax', 'vector'],
  ],
  spatial: [
    ['product-orbit', 'orbit', 'spatial'], ['shader-displacement', 'shader', 'spatial'],
    ['particle-type', 'particles', 'spatial'], ['noise-field', 'particles', 'spatial'],
    ['liquid-plane', 'shader', 'spatial'], ['camera-dolly', 'orbit', 'spatial'],
    ['depth-gallery', 'orbit', 'spatial'], ['light-sweep', 'shader', 'spatial'],
    ['refractive-orb', 'shader', 'spatial'], ['mesh-gradient-field', 'shader', 'spatial'], ['point-cloud-reveal', 'particles', 'spatial'], ['glass-caustics', 'shader', 'spatial'], ['volumetric-type', 'particles', 'spatial'], ['model-explode', 'orbit', 'spatial'], ['terrain-scroll', 'orbit', 'spatial'],
  ],
  micro: [
    ['button-press', 'press', 'feedback'], ['focus-ring-arrival', 'resolve', 'feedback'],
    ['toggle-spring', 'spring', 'feedback'], ['accordion-retarget', 'spring', 'feedback'],
    ['toast-entry', 'reveal', 'feedback'], ['odometer', 'stagger', 'feedback'],
    ['success-confirmation', 'draw', 'feedback'], ['loading-orbit', 'loop', 'feedback'],
    ['checkbox-draw', 'draw', 'feedback'], ['tab-indicator-handoff', 'handoff', 'feedback'], ['input-validity-pulse', 'pulse', 'feedback'], ['drag-lift', 'spring', 'feedback'], ['progress-complete', 'resolve', 'feedback'], ['notification-stack', 'stagger', 'feedback'], ['skeleton-resolve', 'resolve', 'feedback'],
  ],
});

const DRIVER_DEFAULTS = Object.freeze({
  reveal: { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)', properties: ['transform', 'opacity'] },
  stagger: { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)', properties: ['transform', 'opacity'] },
  resolve: { duration: 480, easing: 'cubic-bezier(.2,0,0,1)', properties: ['transform', 'opacity'] },
  scramble: { duration: 780, easing: 'linear', properties: ['text'] },
  pulse: { duration: 900, easing: 'ease-in-out', properties: ['transform', 'opacity'] },
  loop: { duration: 12000, easing: 'linear', properties: ['transform'] },
  clip: { duration: 720, easing: 'cubic-bezier(.77,0,.18,1)', properties: ['clip-path', 'transform'] },
  spotlight: { duration: 120, easing: 'linear', properties: ['opacity'] },
  parallax: { duration: 0, easing: 'linear', properties: ['transform'] },
  progress: { duration: 0, easing: 'linear', properties: ['transform'] },
  handoff: { duration: 640, easing: 'cubic-bezier(.16,1,.3,1)', properties: ['transform', 'opacity'] },
  tilt: { duration: 120, easing: 'cubic-bezier(.2,0,0,1)', properties: ['transform'] },
  magnetic: { duration: 0, easing: 'spring', properties: ['transform'] },
  spring: { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)', properties: ['transform'] },
  draw: { duration: 720, easing: 'cubic-bezier(.16,1,.3,1)', properties: ['stroke-dashoffset'] },
  morph: { duration: 600, easing: 'cubic-bezier(.65,0,.35,1)', properties: ['path'] },
  state: { duration: 300, easing: 'state-machine', properties: ['state'] },
  orbit: { duration: 0, easing: 'damped', properties: ['transform'] },
  shader: { duration: 0, easing: 'realtime', properties: ['canvas'] },
  particles: { duration: 0, easing: 'realtime', properties: ['canvas'] },
  press: { duration: 120, easing: 'cubic-bezier(.2,0,0,1)', properties: ['transform'] },
});

const RECIPES = Object.freeze(Object.entries(GROUPS).flatMap(([category, entries]) =>
  entries.map(([id, driver, role], index) => Object.freeze({
    id, category, driver, role,
    ...DRIVER_DEFAULTS[driver],
    reducedMotion: driver === 'loop' || ['parallax', 'progress', 'orbit', 'shader', 'particles'].includes(driver)
      ? 'static-final-state' : 'opacity-acknowledgement',
    mobileFallback: ['orbit', 'shader', 'particles'].includes(driver) ? 'poster-or-css-depth' : 'same-semantic-shortened',
    cleanup: 'abort-controller-and-cancel-animation-frame',
    provenance: 'DesignOS original executable contract',
    demo: Object.freeze({
      composition: ['orbital-specimen','editorial-type','material-card','signal-field','vector-mark'][index % 5],
      accentHue: (18 + index * 37 + category.length * 11) % 360,
      travel: 12 + (index % 4) * 8,
      phase: index * 43,
      live: true,
    }),
  }))));

function getRecipe(id) { return RECIPES.find(recipe => recipe.id === id) || null; }
function recipesByCategory(category) { return RECIPES.filter(recipe => recipe.category === category); }

module.exports = { GROUPS, DRIVER_DEFAULTS, RECIPES, getRecipe, recipesByCategory };
