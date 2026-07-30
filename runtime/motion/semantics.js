'use strict';

const { RECIPES } = require('./recipes');

const FREQUENCY = Object.freeze({
  continuous: { factor: .25, ceiling: 0 },
  'very-high': { factor: .4, ceiling: 80 },
  high: { factor: .6, ceiling: 120 },
  medium: { factor: 1, ceiling: 200 },
  low: { factor: 1.35, ceiling: 300 },
  rare: { factor: 1.8, ceiling: 500 },
});

const COMPONENTS = Object.freeze({
  button: { base: 120, importance: 'feedback', origin: 'center center', recipe: 'hold-to-confirm' },
  toggle: { base: 120, importance: 'feedback', origin: 'center center', recipe: 'spring-reversal' },
  tooltip: { base: 100, importance: 'orientation', origin: 'trigger', recipe: 'origin-aware-popover' },
  popover: { base: 180, importance: 'orientation', origin: 'trigger', recipe: 'origin-aware-popover' },
  menu: { base: 160, importance: 'orientation', origin: 'trigger', recipe: 'origin-aware-popover' },
  accordion: { base: 200, importance: 'continuity', origin: 'top edge', recipe: 'interruptible-accordion' },
  dialog: { base: 220, importance: 'orientation', origin: 'viewport center', recipe: 'origin-aware-popover' },
  modal: { base: 220, importance: 'orientation', origin: 'viewport center', recipe: 'origin-aware-popover' },
  drawer: { base: 280, importance: 'continuity', origin: 'attached viewport edge', recipe: 'swipe-to-dismiss' },
  sheet: { base: 280, importance: 'continuity', origin: 'attached viewport edge', recipe: 'swipe-to-dismiss' },
  toast: { base: 180, importance: 'feedback', origin: 'notification edge', recipe: 'swipe-to-dismiss' },
  list: { base: 220, importance: 'continuity', origin: 'previous item geometry', recipe: 'flip-layout-transition' },
  sortable: { base: 0, importance: 'continuity', origin: 'pointer contact point', recipe: 'drag-reorder' },
  carousel: { base: 240, importance: 'continuity', origin: 'navigation direction', recipe: 'momentum-projection' },
  page: { base: 300, importance: 'orientation', origin: 'navigation source', recipe: 'shared-element-transition' },
  value: { base: 200, importance: 'feedback', origin: 'numeric baseline', recipe: 'odometer' },
  progress: { base: 0, importance: 'feedback', origin: 'track start', recipe: 'scroll-linked-progress' },
  generic: { base: 180, importance: 'feedback', origin: 'interaction source', recipe: null },
});

const TRANSITIONS = Object.freeze({
  hover: { travel: false, feedback: true, path: ['rest', 'emphasized'] },
  press: { travel: false, feedback: true, path: ['rest', 'compressed'] },
  select: { travel: false, feedback: true, path: ['unselected', 'selected'] },
  open: { travel: true, feedback: false, path: ['origin', 'rest'] },
  close: { travel: true, feedback: false, path: ['rest', 'origin'] },
  enter: { travel: true, feedback: false, path: ['origin', 'rest'] },
  exit: { travel: true, feedback: false, path: ['rest', 'origin'] },
  expand: { travel: true, feedback: false, path: ['collapsed', 'expanded'] },
  collapse: { travel: true, feedback: false, path: ['expanded', 'collapsed'] },
  reorder: { travel: true, feedback: false, direct: true, path: ['previous-geometry', 'next-geometry'] },
  drag: { travel: true, feedback: false, direct: true, path: ['pointer-down', 'pointer-current'] },
  dismiss: { travel: true, feedback: false, direct: true, path: ['rest', 'dismiss-boundary'] },
  update: { travel: false, feedback: true, path: ['previous-value', 'next-value'] },
  navigate: { travel: true, feedback: false, path: ['source-context', 'destination-context'] },
});

const VALID = Object.freeze({
  modality: ['keyboard', 'pointer', 'touch', 'voice', 'programmatic'],
  preference: ['full', 'reduce', 'none'],
  power: ['low', 'medium', 'high'],
  importance: ['decorative', 'low', 'normal', 'high', 'critical'],
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const normal = (value, fallback) => String(value || fallback).trim().toLowerCase();
const recipeExists = id => id && RECIPES.some(recipe => recipe.id === id);

/**
 * Normalizes geometric properties (dimensions, distance, edge) into a standard format
 * for motion scaling calculations.
 * 
 * @param {Object|string} input - Geometry string (e.g. "320x240") or object with width/height/distance.
 * @returns {Object} Normalized geometry with calculated area and viewport coverage.
 */
function normalizeGeometry(input = {}) {
  if (typeof input === 'string') {
    const [width, height, distance = 0] = input.split(/[x,]/).map(Number);
    return normalizeGeometry({ width, height, distance });
  }
  const width = Math.max(0, Number(input.width) || 0);
  const height = Math.max(0, Number(input.height) || 0);
  const distance = Math.max(0, Number(input.distance) || 0);
  return {
    width, height, distance,
    area: width * height,
    viewportCoverage: clamp(Number(input.viewportCoverage) || 0, 0, 1),
    anchor: input.anchor || null,
    edge: input.edge || null,
  };
}

/**
 * Computes a duration scale factor based on the physical size and travel distance 
 * of the animated element, penalizing excessively large or far-traveling layers.
 * 
 * @param {Object} geometry - Normalized geometry object.
 * @returns {number} Scale multiplier for base duration (1.0 to 1.35).
 */
function geometryFactor(geometry) {
  const areaFactor = geometry.area > 500000 ? 1.35 : geometry.area > 120000 ? 1.15 : geometry.area && geometry.area < 5000 ? .8 : 1;
  const distanceFactor = geometry.distance > 600 ? 1.25 : geometry.distance > 200 ? 1.1 : geometry.distance && geometry.distance < 24 ? .85 : 1;
  return Math.max(areaFactor, distanceFactor);
}

/**
 * Resolves the physical origin point from which the motion should emanate,
 * prioritizing explicitly passed coordinates before falling back to component semantics.
 * 
 * @param {Object} component - The component semantic definition.
 * @param {Object} transition - The transition context.
 * @param {Object} geometry - The geometry of the element or interaction.
 * @returns {{value: string, reason: string}} Resolved transform-origin string and rationale.
 */
function resolveOrigin(component, transition, geometry) {
  if (geometry.anchor) return { value: geometry.anchor, reason: 'explicit geometry anchor' };
  if (geometry.edge) return { value: `${geometry.edge} edge`, reason: 'component is attached to a measured edge' };
  if (transition.direct) return { value: 'pointer contact point', reason: 'direct manipulation begins at the contact geometry' };
  return { value: component.origin, reason: `the ${component.origin} is the component’s conceptual source` };
}

/**
 * Determines motion parameters specific to a single input modality (touch/pointer/keyboard),
 * applying accessibility limits (e.g. keyboard travel suppression) and duration overrides.
 * 
 * @param {string} modality - The interaction modality (e.g., 'keyboard', 'pointer').
 * @param {Object} context - Execution context containing transition, frequency, and preference info.
 * @returns {Object} Modality-specific animation decisions.
 */
function modalityDecision(modality, context) {
  const { transition, frequency, duration, preference } = context;
  if (preference !== 'full') return { animate: preference !== 'none', durationMs: preference === 'none' ? 0 : Math.min(80, duration), spatialTravel: false };
  if (modality === 'keyboard' && ['high', 'very-high', 'continuous'].includes(frequency)) {
    return { animate: true, durationMs: Math.min(80, duration), spatialTravel: false };
  }
  if (['touch', 'pointer'].includes(modality) && transition.direct) {
    return { animate: true, durationMs: 0, spatialTravel: true, tracking: '1:1' };
  }
  if (modality === 'voice' || modality === 'programmatic') {
    return { animate: true, durationMs: Math.min(120, duration), spatialTravel: false };
  }
  return { animate: true, durationMs: duration, spatialTravel: transition.travel };
}

/**
 * The DesignOS Motion Semantics Compiler.
 * Deterministically computes animation rules, durations, easings, and paths 
 * without requiring the developer to hardcode motion parameters.
 * 
 * @param {Object} input - Context parameters including component type, transition, frequency, modality, geometry, etc.
 * @returns {Object} A comprehensive motion specification including timing, dynamics, reduced motion equivalents, and provenance.
 */
function compileMotionSemantics(input = {}) {
  const componentType = normal(input.componentType || input.component, 'generic');
  const transitionName = normal(input.stateTransition || input.transition, 'update');
  const frequencyName = normal(input.frequency, 'medium');
  const modality = normal(input.inputModality || input.modality || input.initiator, 'pointer');
  const preference = normal(input.userPreference || input.preference, 'full');
  const devicePower = normal(input.devicePower || input.power, 'medium');
  const semanticImportance = normal(input.semanticImportance || input.importance, 'normal');
  const motionIntensity = clamp(Number(input.motionIntensity ?? input.intensity ?? 4) || 4, 1, 10);
  const geometry = normalizeGeometry(input.geometry);
  const component = COMPONENTS[componentType] || COMPONENTS.generic;
  const transition = TRANSITIONS[transitionName] || TRANSITIONS.update;
  const frequency = FREQUENCY[frequencyName] || FREQUENCY.medium;
  const reasons = [];

  let animate = true;
  let decision = 'animate';
  if (preference === 'none') {
    animate = false;
    decision = 'do-not-animate';
    reasons.push('the user explicitly disabled non-essential animation');
  } else if (semanticImportance === 'decorative' && motionIntensity < 6) {
    animate = false;
    decision = 'do-not-animate';
    reasons.push('decorative motion is not licensed below motion intensity 6');
  } else if (devicePower === 'low' && semanticImportance === 'low') {
    animate = false;
    decision = 'do-not-animate';
    reasons.push('low-power devices suppress low-importance motion');
  } else if (preference === 'reduce') {
    decision = 'reduced-feedback';
    reasons.push('reduced-motion preference preserves state feedback without spatial travel');
  } else if (modality === 'keyboard' && ['high', 'very-high', 'continuous'].includes(frequencyName)) {
    decision = 'feedback-only';
    reasons.push('frequent keyboard interaction removes spatial travel and caps acknowledgement at 80ms');
  } else if (transition.direct) {
    decision = 'track-then-settle';
    reasons.push('direct manipulation tracks input 1:1 before a cancellable settle');
  }

  const rawDuration = component.base * frequency.factor * geometryFactor(geometry);
  const powerFactor = devicePower === 'low' ? .75 : 1;
  const importanceFactor = semanticImportance === 'critical' ? .85 : semanticImportance === 'high' ? .95 : 1;
  let durationMs = animate ? Math.round(Math.min(frequency.ceiling || rawDuration, rawDuration) * powerFactor * importanceFactor / 10) * 10 : 0;
  if (transition.direct) durationMs = 0;
  if (preference === 'reduce') durationMs = Math.min(80, durationMs || 80);
  durationMs = clamp(durationMs, 0, transition.travel ? 300 : 200);
  const exitDurationMs = durationMs ? Math.max(40, Math.round(durationMs * .75 / 10) * 10) : 0;
  reasons.push(`${frequencyName} frequency applies a ${frequency.factor}× duration factor with a ${frequency.ceiling}ms ceiling`);
  if (geometry.area || geometry.distance) reasons.push('measured area and travel distance scale duration inside the interaction ceiling');
  if (devicePower === 'low') reasons.push('low device power shortens or removes non-essential work');

  const origin = resolveOrigin(component, transition, geometry);
  const entrancePath = transition.path;
  const exitPath = [...entrancePath].reverse();
  const symmetric = entrancePath[0] === exitPath.at(-1) && entrancePath.at(-1) === exitPath[0];
  const useSpring = animate && preference === 'full' && motionIntensity >= 6
    && ['touch', 'pointer'].includes(modality) && transition.direct && devicePower !== 'low';
  const easing = useSpring
    ? { type: 'spring', token: 'var(--spring-interaction)', interruptible: true }
    : { type: 'curve', token: transition.travel ? 'var(--ease-out)' : 'var(--ease-out)', interruptible: true };
  const recipeId = recipeExists(component.recipe) ? component.recipe : null;
  const performanceBudget = {
    properties: ['transform', 'opacity'],
    maximumDurationMs: durationMs,
    maximumConcurrentAnimations: semanticImportance === 'critical' ? 1 : 3,
    maximumMainThreadBlockingMs: 50,
    targetFrameTimeMs: devicePower === 'high' ? 8.33 : 16.67,
    requiresCpuThrottlePass: motionIntensity >= 6 || geometry.viewportCoverage > .3,
    layoutAnimation: recipeId === 'interruptible-accordion' ? 'licensed grid/FLIP exception' : 'forbidden',
  };
  const modalities = Object.fromEntries(VALID.modality.slice(0, 3).map(name => [
    name,
    modalityDecision(name, { transition, frequency: frequencyName, duration: durationMs, preference }),
  ]));

  return {
    schemaVersion: 1,
    inputs: {
      componentType, stateTransition: transitionName, frequency: frequencyName,
      inputModality: modality, geometry, motionIntensity, userPreference: preference,
      devicePower, semanticImportance,
    },
    decision,
    animate,
    timing: { durationMs, exitDurationMs, frequencyDiscount: frequency.factor },
    dynamics: { easing, transformOrigin: origin.value, originReason: origin.reason },
    path: { enter: entrancePath, exit: exitPath, symmetric },
    interruption: transition.direct
      ? { strategy: 'pointer-tracking-with-velocity-handoff', cancellable: true, reversible: true }
      : { strategy: 'replace-current-animation-from-computed-state', cancellable: true, reversible: true },
    reducedMotion: {
      animate: preference !== 'none',
      durationMs: preference === 'none' ? 0 : Math.min(80, durationMs || 80),
      spatialTravel: false,
      equivalent: transition.feedback ? 'instant semantic state plus opacity acknowledgement' : 'final state immediately plus optional opacity acknowledgement',
    },
    modalities,
    performanceBudget,
    provenance: [
      { type: 'module', id: 'motion/principles.md', claim: 'duration, frequency, easing, origin and symmetry laws' },
      { type: 'module', id: 'motion/performance.md', claim: 'compositor, reduced-motion and device budgets' },
      { type: 'rule', id: 'motion-semantic-decision', claim: 'context determines whether motion is licensed' },
      ...(recipeId ? [{ type: 'recipe', id: recipeId, source: 'runtime/motion/recipes.js' }] : []),
    ],
    reasons,
    verification: [
      'keyboard/pointer/touch modality parity',
      'enter/exit path symmetry',
      'transform-origin matches measured source geometry',
      'cancel/reverse from computed state',
      'reduced-motion functional equivalence',
      '4× CPU throttle when required by the performance budget',
    ],
  };
}

module.exports = {
  FREQUENCY, COMPONENTS, TRANSITIONS, VALID, normalizeGeometry, compileMotionSemantics,
};
