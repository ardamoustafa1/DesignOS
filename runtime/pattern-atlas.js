'use strict';

const PATTERNS = Object.freeze([
  {
    id: 'origin-aware-popover', category: 'state', scale: 'interaction', intensity: [2, 7],
    intent: 'Preserve the relationship between a trigger and the surface it opened.',
    earnedWhen: ['popover, menu or tooltip has a measurable trigger', 'orientation would otherwise be lost'],
    avoidWhen: ['modal is viewport-owned', 'action is keyboard-high-frequency'],
    productTruth: 'The opened surface belongs to this control.',
    modalities: { pointer: 'scale/translate from measured trigger edge', keyboard: 'instant or opacity-only at high frequency', touch: 'same origin with coarse-pointer target spacing' },
    reducedMotion: 'Final state immediately; optional opacity acknowledgement up to 80ms.',
    performance: { properties: ['transform', 'opacity'], maxDurationMs: 220, compositorOnly: true },
    recipe: 'origin-aware-popover', modules: ['motion/principles.md', 'motion/recipes.md'],
  },
  {
    id: 'shared-element-transition', category: 'continuity', scale: 'navigation', intensity: [4, 8],
    intent: 'Keep an object identifiable while its context changes.',
    earnedWhen: ['the same semantic object exists in both states', 'geometry can be measured before and after'],
    avoidWhen: ['unrelated objects merely look similar', 'route latency cannot be bounded'],
    productTruth: 'This detail view is the same object you selected.',
    modalities: { pointer: 'FLIP from selected geometry', keyboard: 'preserve focus and use short continuity', touch: 'inherit gesture velocity only when directly manipulated' },
    reducedMotion: 'Crossfade the persistent object without spatial travel.',
    performance: { properties: ['transform', 'opacity'], maxDurationMs: 300, compositorOnly: true },
    recipe: 'shared-element-transition', modules: ['motion/recipes.md', 'motion/performance.md'],
  },
  {
    id: 'interruptible-accordion', category: 'state', scale: 'interaction', intensity: [2, 6],
    intent: 'Reveal hierarchy without making rapid reversal feel broken.',
    earnedWhen: ['content disclosure is user initiated', 'open and close may be reversed rapidly'],
    avoidWhen: ['content should always be visible', 'layout movement would obscure focus'],
    productTruth: 'More detail exists inside this section.',
    modalities: { pointer: 'retarget from computed state', keyboard: 'instant at very-high frequency, otherwise short continuity', touch: 'same state contract with 44px target' },
    reducedMotion: 'Immediate layout state plus opacity acknowledgement.',
    performance: { properties: ['transform', 'opacity'], maxDurationMs: 240, compositorOnly: false, exception: 'grid/FLIP reveal' },
    recipe: 'interruptible-accordion', modules: ['motion/recipes.md', 'components/tabs-accordions.md'],
  },
  {
    id: 'swipe-to-dismiss', category: 'gesture', scale: 'interaction', intensity: [5, 9],
    intent: 'Make dismissal follow the user’s hand and release velocity.',
    earnedWhen: ['surface is spatially attached to an edge', 'touch dismissal is conventional'],
    avoidWhen: ['destructive action lacks undo', 'pointer capture cannot be guaranteed'],
    productTruth: 'This temporary surface can be physically moved away.',
    modalities: { pointer: 'optional drag handle with capture', keyboard: 'semantic close action with no travel at high frequency', touch: '1:1 tracking, resistance and velocity handoff' },
    reducedMotion: 'Dismiss immediately and restore focus.',
    performance: { properties: ['transform', 'opacity'], maxDurationMs: 280, compositorOnly: true },
    recipe: 'swipe-to-dismiss', modules: ['motion/physics.md', 'native/motion-gestures.md'],
  },
  {
    id: 'drag-reorder', category: 'gesture', scale: 'interaction', intensity: [4, 8],
    intent: 'Preserve object identity while list geometry changes.',
    earnedWhen: ['reordering is a primary task', 'keyboard reordering has an equivalent path'],
    avoidWhen: ['items cannot announce their new position', 'a simple move menu is clearer'],
    productTruth: 'The user is changing order, not creating a copy.',
    modalities: { pointer: 'capture and track from grab offset', keyboard: 'move command plus live position announcement', touch: '1:1 tracking with edge auto-scroll' },
    reducedMotion: 'Immediate reorder with focus preservation and announcement.',
    performance: { properties: ['transform'], maxDurationMs: 220, compositorOnly: true },
    recipe: 'drag-reorder', modules: ['motion/physics.md', 'foundations/accessibility.md'],
  },
  {
    id: 'spring-reversal', category: 'physics', scale: 'interaction', intensity: [5, 9],
    intent: 'Carry velocity through an interrupted or reversed gesture.',
    earnedWhen: ['the user can redirect motion mid-flight', 'physical continuity communicates control'],
    avoidWhen: ['enterprise density makes overshoot distracting', 'the interaction is keyboard-high-frequency'],
    productTruth: 'The interface remains attached to the user’s intent.',
    modalities: { pointer: 'retarget from current velocity', keyboard: 'instant state', touch: 'velocity-preserving spring' },
    reducedMotion: 'No overshoot or spatial travel.',
    performance: { properties: ['transform'], maxDurationMs: 300, compositorOnly: true },
    recipe: 'spring-reversal', modules: ['motion/physics.md', 'motion/principles.md'],
  },
  {
    id: 'flip-layout-transition', category: 'continuity', scale: 'component', intensity: [3, 8],
    intent: 'Animate layout changes without animating layout properties.',
    earnedWhen: ['elements persist across layout states', 'first and last geometry are stable'],
    avoidWhen: ['content identity changes', 'measurement causes visible synchronous work'],
    productTruth: 'The same objects moved to new positions.',
    modalities: { pointer: 'invert measured delta', keyboard: 'short or instant according to frequency', touch: 'same continuity with no hover dependency' },
    reducedMotion: 'Apply final layout immediately.',
    performance: { properties: ['transform'], maxDurationMs: 260, compositorOnly: true },
    recipe: 'flip-layout-transition', modules: ['motion/recipes.md', 'motion/performance.md'],
  },
  {
    id: 'scroll-linked-progress', category: 'scroll', scale: 'page', intensity: [3, 8],
    intent: 'Expose reading or process progress without taking over scrolling.',
    earnedWhen: ['the document has meaningful sequential progress', 'native scroll remains authoritative'],
    avoidWhen: ['progress has no user value', 'animation drives layout or blocks reading'],
    productTruth: 'The user has completed this portion of a sequence.',
    modalities: { pointer: 'native scroll-linked transform', keyboard: 'updates on scroll/page navigation', touch: 'native scroll, no hijacking' },
    reducedMotion: 'Static semantic progress value or discrete section updates.',
    performance: { properties: ['transform'], maxDurationMs: 0, compositorOnly: true },
    recipe: 'scroll-linked-progress', modules: ['motion/page-and-scroll.md', 'motion/performance.md'],
  },
  {
    id: 'odometer', category: 'data', scale: 'component', intensity: [3, 7],
    intent: 'Make a meaningful numeric change noticeable while keeping digits stable.',
    earnedWhen: ['the changed value is decision-relevant', 'updates are occasional'],
    avoidWhen: ['rapid market data changes', 'every number on the screen would animate'],
    productTruth: 'This value changed from a known prior state.',
    modalities: { pointer: 'not pointer dependent', keyboard: 'no repeated command animation', touch: 'same semantic update' },
    reducedMotion: 'Replace digits immediately and announce only meaningful changes.',
    performance: { properties: ['transform', 'opacity'], maxDurationMs: 240, compositorOnly: true },
    recipe: 'odometer', modules: ['motion/recipes.md', 'components/charts.md'],
  },
  {
    id: 'magnetic-intent', category: 'signature', scale: 'interaction', intensity: [6, 8],
    intent: 'Express a single primary action as responsive to pointer intent.',
    earnedWhen: ['there is exactly one focal CTA', 'the product truth concerns guidance, attraction or intent'],
    avoidWhen: ['multiple equal actions exist', 'coarse pointer or reduced motion', 'the control can leave its hit target'],
    productTruth: 'The system recognizes and guides an explicit intention.',
    modalities: { pointer: 'bounded field with spring follow', keyboard: 'equivalent focus emphasis without movement', touch: 'static control' },
    reducedMotion: 'Static focus/hover emphasis.',
    performance: { properties: ['transform'], maxDurationMs: 0, compositorOnly: true, runtime: 'rAF only while engaged' },
    recipe: 'magnetic-cta', modules: ['motion/signature-moments.md', 'motion/performance.md'],
  },
  {
    id: 'cursor-spotlight', category: 'signature', scale: 'interaction', intensity: [6, 8],
    intent: 'Reveal the currently inspected surface without lifting every card.',
    earnedWhen: ['a dense comparison grid needs local emphasis', 'the effect communicates inspection'],
    avoidWhen: ['single-card surfaces', 'touch-first interfaces', 'contrast depends on the effect'],
    productTruth: 'The system exposes detail where the user is investigating.',
    modalities: { pointer: 'local CSS coordinates on active surface', keyboard: 'focus-visible border with equal emphasis', touch: 'selected/pressed state only' },
    reducedMotion: 'Static focus and hover border.',
    performance: { properties: ['opacity'], maxDurationMs: 150, compositorOnly: true },
    recipe: null, modules: ['motion/signature-moments.md', 'components/visual-effects.md'],
  },
  {
    id: 'text-scramble', category: 'signature', scale: 'interaction', intensity: [7, 9],
    intent: 'Turn decoding or transformation into one legible branded moment.',
    earnedWhen: ['security, data or inference is the real product action', 'one short non-critical string is used'],
    avoidWhen: ['headline comprehension depends on immediate reading', 'text width is not reserved'],
    productTruth: 'The product resolves uncertain input into a known result.',
    modalities: { pointer: 'optional one-shot activation', keyboard: 'resolved text immediately', touch: 'one-shot only when explicitly activated' },
    reducedMotion: 'Render final text immediately.',
    performance: { properties: ['text node'], maxDurationMs: 900, compositorOnly: false, exception: 'short fixed-width text only' },
    recipe: null, modules: ['motion/signature-moments.md', 'motion/performance.md'],
  },
  {
    id: 'split-reveal', category: 'signature', scale: 'hero', intensity: [9, 10],
    intent: 'Stage one launch-scale claim without delaying access to content.',
    earnedWhen: ['first-visit ceremony is justified', 'the reveal expresses a real transformation'],
    avoidWhen: ['daily-use app surface', 'content is hidden without JavaScript', 'another hero signature already exists'],
    productTruth: 'A before/after boundary is intrinsic to the product.',
    modalities: { pointer: 'not pointer dependent', keyboard: 'content available before animation', touch: 'shortened, non-pinned version' },
    reducedMotion: 'One opacity acknowledgement or complete still state.',
    performance: { properties: ['transform', 'opacity', 'clip-path'], maxDurationMs: 500, compositorOnly: true },
    recipe: null, modules: ['motion/signature-moments.md', 'brain/wow-calibration.md'],
  },
  {
    id: 'sticky-product-tour', category: 'scroll', scale: 'page', intensity: [6, 9],
    intent: 'Keep one inspectable artifact stable while narrative steps change its state.',
    earnedWhen: ['steps map to real product states', 'the artifact remains useful without choreography'],
    avoidWhen: ['content is decorative', 'mobile fallback would lose information', 'multiple pinned sequences exist'],
    productTruth: 'The workflow progresses through these concrete states.',
    modalities: { pointer: 'native scroll with discrete state thresholds', keyboard: 'landmark and step navigation', touch: 'linear document or short sticky region' },
    reducedMotion: 'Linear document with all states visible and labelled.',
    performance: { properties: ['transform', 'opacity'], maxDurationMs: 220, compositorOnly: true },
    recipe: null, modules: ['motion/page-and-scroll.md', 'patterns/landing-pages.md'],
  },
  {
    id: 'hold-to-confirm', category: 'feedback', scale: 'interaction', intensity: [3, 7],
    intent: 'Make irreversible intent continuous and cancelable before commitment.',
    earnedWhen: ['action is destructive or costly', 'holding reduces accidental activation'],
    avoidWhen: ['ordinary primary CTA', 'keyboard alternative is absent'],
    productTruth: 'Commitment accumulates while the user keeps control.',
    modalities: { pointer: 'continuous press progress', keyboard: 'explicit confirmation dialog or sustained key only when conventional', touch: 'press progress with cancellation on leave' },
    reducedMotion: 'Static progress/state change without spatial movement.',
    performance: { properties: ['transform', 'opacity'], maxDurationMs: 2000, compositorOnly: true, exception: 'deliberate hold duration' },
    recipe: 'hold-to-confirm', modules: ['motion/micro-interactions.md', 'components/buttons.md'],
  },
]);

const tokenize = value => String(value || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

function searchPatterns(query, options = {}) {
  const terms = tokenize(query);
  const intensity = Number(options.intensity) || null;
  const category = options.category || null;
  const limit = Math.max(1, Math.min(50, Number(options.limit) || 8));
  return PATTERNS
    .filter(pattern => !category || pattern.category === category)
    .filter(pattern => !intensity || (intensity >= pattern.intensity[0] && intensity <= pattern.intensity[1]))
    .map(pattern => {
      const title = tokenize(pattern.id);
      const corpus = tokenize(JSON.stringify(pattern));
      const score = terms.length === 0 ? 1 : terms.reduce((total, term) => {
        if (title.includes(term)) return total + 8;
        return total + corpus.filter(token => token === term).length;
      }, 0);
      return { ...pattern, score };
    })
    .filter(pattern => terms.length === 0 || pattern.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}

function getPattern(id) {
  return PATTERNS.find(pattern => pattern.id === id) || null;
}

module.exports = { PATTERNS, searchPatterns, getPattern };
