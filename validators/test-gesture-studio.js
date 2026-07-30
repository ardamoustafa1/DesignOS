'use strict';

const assert = require('assert');
const fs = require('fs');
const { gestureStudio } = require('../bin/gesture-studio');

function testGestureStudioHTML() {
  const output = gestureStudio([]);
  const result = fs.readFileSync(output, 'utf8');
  
  assert.ok(result.includes('id="hz"'), 'Gesture Studio should include Hz simulation');
  assert.ok(result.includes('Pointer Velocity (EMA)'), 'Gesture Studio should include EMA velocity');
  assert.ok(result.includes('simulateSpring'), 'Gesture Studio should include spring simulation math');
  assert.ok(result.includes('id="framework"'), 'Gesture Studio should include framework exporter');
  assert.ok(result.includes('framer-motion'), 'Gesture Studio should support React (framer-motion)');
  assert.ok(result.includes('rubberBand('), 'Gesture Studio should include rubber band physics');
  
  fs.unlinkSync(output);
  console.log('test-gesture-studio: Velocity tracking, spring physics, and exporters generated correctly');
}

try {
  testGestureStudioHTML();
} catch (error) {
  console.error(error);
  process.exit(1);
}
