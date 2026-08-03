#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { compileMotionSemantics } = require('../runtime/motion/semantics');

const popover = compileMotionSemantics({
  componentType: 'popover',
  stateTransition: 'open',
  frequency: 'high',
  inputModality: 'pointer',
  geometry: { width: 280, height: 180, distance: 8, anchor: 'top right' },
  motionIntensity: 4,
  userPreference: 'full',
  devicePower: 'medium',
  semanticImportance: 'high',
});
assert.strictEqual(popover.animate, true);
assert(popover.timing.durationMs <= 120);
assert.strictEqual(popover.dynamics.transformOrigin, 'top right');
assert.strictEqual(popover.path.symmetric, true);
assert(popover.provenance.some(item => item.type === 'recipe' && item.id === 'origin-aware-popover'));
assert.deepStrictEqual(popover.path.exit, [...popover.path.enter].reverse());

const keyboard = compileMotionSemantics({
  componentType: 'menu', stateTransition: 'open', frequency: 'very-high',
  inputModality: 'keyboard', userPreference: 'full',
});
assert.strictEqual(keyboard.animate, false);
assert.strictEqual(keyboard.timing.durationMs, 0);
assert.strictEqual(keyboard.modalities.keyboard.durationMs, 0);
assert.strictEqual(keyboard.decision, 'do-not-animate');
assert.strictEqual(keyboard.modalities.keyboard.spatialTravel, false);
assert.strictEqual(keyboard.modalities.pointer.spatialTravel, true);
assert(keyboard.explanation.why.some(reason => reason.includes('latency')));
assert(keyboard.rejectedTechniques.includes('ceremonial entrance'));

const drag = compileMotionSemantics({
  componentType: 'sortable', stateTransition: 'drag', frequency: 'continuous',
  inputModality: 'touch', geometry: { width: 320, height: 64, distance: 240 },
  motionIntensity: 7, userPreference: 'full', devicePower: 'high', semanticImportance: 'normal',
});
assert.strictEqual(drag.decision, 'track-then-settle');
assert.strictEqual(drag.timing.durationMs, 0);
assert.strictEqual(drag.modalities.touch.tracking, '1:1');
assert.strictEqual(drag.interruption.strategy, 'pointer-tracking-with-velocity-handoff');

const reduced = compileMotionSemantics({
  componentType: 'drawer', stateTransition: 'open', frequency: 'low',
  inputModality: 'touch', userPreference: 'reduce', devicePower: 'low',
});
assert.strictEqual(reduced.decision, 'reduced-feedback');
assert.strictEqual(reduced.reducedMotion.spatialTravel, false);
assert(reduced.reducedMotion.durationMs <= 80);

const rejected = compileMotionSemantics({
  componentType: 'generic', stateTransition: 'enter', frequency: 'low',
  semanticImportance: 'decorative', motionIntensity: 4,
});
assert.strictEqual(rejected.animate, false);
assert.strictEqual(rejected.timing.durationMs, 0);
assert(rejected.reasons.length >= 2);

console.log('motion-semantics: contextual decisions, modality parity, frequency discount, symmetry, origin, provenance and reduction clean');
