'use strict';

const assert = require('assert');
const { computeMotionBlur } = require('../bin/motion-blur-injector');

function testMotionBlur() {
  const result1 = computeMotionBlur(1500, 0);
  assert.strictEqual(result1.stdDeviationX, 15, '1500px/s X should yield 15 blur');
  assert.strictEqual(result1.stdDeviationY, 0, '0px/s Y should yield 0 blur');
  assert.ok(result1.svgFilter.includes('stdDeviation="15.00,0.00"'), 'SVG should contain correct stdDeviation');
  
  const result2 = computeMotionBlur(3000, -500); // Beyond cap for X
  assert.strictEqual(result2.stdDeviationX, 20, 'Should cap X blur at 20');
  assert.strictEqual(result2.stdDeviationY, 5, 'Should absolute and scale Y blur to 5');
  
  console.log('test-motion-blur: Directional motion blur SVG injection verified successfully.');
}

try {
  testMotionBlur();
} catch (err) {
  console.error(err);
  process.exit(1);
}
