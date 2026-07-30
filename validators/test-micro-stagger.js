'use strict';

const assert = require('assert');
const { calculateStagger } = require('../bin/micro-stagger-orchestrator');

function testMicroStagger() {
  const elements = [
    { id: 'item-top-left', rect: { left: 0, top: 0, width: 100, height: 100 } }, // center: 50, 50
    { id: 'item-bottom-right', rect: { left: 100, top: 100, width: 100, height: 100 } } // center: 150, 150
  ];
  
  // Origin close to bottom right
  const result = calculateStagger(elements, 160, 160, 50);
  
  assert.strictEqual(result.length, 2);
  // item-bottom-right is closer to (160, 160)
  assert.strictEqual(result[0].id, 'item-bottom-right');
  assert.strictEqual(result[0].delayMs, 0, 'Closest item should have 0 delay');
  
  assert.strictEqual(result[1].id, 'item-top-left');
  assert.strictEqual(result[1].delayMs, 50, 'Further item should have 50ms delay');
  
  console.log('test-micro-stagger: Radial stagger matrix validated successfully.');
}

try {
  testMicroStagger();
} catch (err) {
  console.error(err);
  process.exit(1);
}
