#!/usr/bin/env node
'use strict';

const assert = require('assert');
const core = require('./core');
const { STACKS, RECIPES, adapterSource } = require('./recipes');

assert(Math.abs(core.rubberBand(100, 400) - 48.35) < 0.1);
assert(Math.abs(core.projectMomentum(1) - 0.499) < 0.001);
assert.strictEqual(core.chooseSnap(88, [0, 100, 200]), 100);
assert.strictEqual(core.springPhysics({ duration: 0.5, bounce: 0 }).dampingRatio, 1);
assert(core.updateVelocity(0, 10, 0, 10) > 0);
assert.strictEqual(core.shouldDismiss({ distance: 10, dimension: 400, velocity: 0.2 }).dismiss, true);
assert.deepStrictEqual(core.flipDelta(
  { left: 10, top: 20, width: 100, height: 50 },
  { left: 30, top: 40, width: 200, height: 100 }),
{ x: -20, y: -20, scaleX: 0.5, scaleY: 0.5 });
assert.strictEqual(core.scrollProgress(50, 0, 100), 0.5);
assert(core.magneticOffset({ x: 50, y: 50 }, { left: 0, top: 0, width: 100, height: 100 }).pull === 1);
assert.strictEqual(core.odometerFrames(0, 10, 5).at(-1), 10);
assert.strictEqual(core.reducedMotionPolicy(true, { duration: 300 }, { duration: 0 }).duration, 0);
assert.strictEqual(core.feedback({ reduced: true }).vibration, 0);
assert.strictEqual(RECIPES.length, 15);
for (const recipe of RECIPES) {
  assert(recipe.reduced && recipe.budget && recipe.fixture);
  for (const stack of STACKS) {
    const source = adapterSource(recipe.id, stack);
    assert(source.includes(recipe.id));
    assert(/abort|stop|revert|destroy/i.test(source), `${recipe.id}/${stack} needs cleanup`);
  }
}
console.log(`motion-runtime: ${RECIPES.length} recipes × ${STACKS.length} adapters clean`);
