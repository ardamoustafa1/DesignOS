'use strict';

const assert = require('assert');
const { calculateVelocity, compileHandoffConfig } = require('../bin/physics-handoff');

function testPhysicsHandoff() {
  // Test 1: calculateVelocity
  // 100px in 16ms = 6250 px/s
  const v1 = calculateVelocity(0, 100, 16);
  assert.strictEqual(v1, 6250, 'Velocity should be exactly 6250 px/s');
  
  // Test 2: compileHandoffConfig
  const events = [
    { x: 0, y: 0, timestamp: 0 },
    { x: 50, y: 10, timestamp: 16 },
    { x: 100, y: -10, timestamp: 32 }
  ];
  
  const result = compileHandoffConfig(events, 'Drawer');
  
  assert.strictEqual(result.target, 'Drawer');
  assert.strictEqual(result.spring.velocity.x, 3125, 'X velocity should be 50px / 0.016s = 3125 px/s');
  assert.strictEqual(result.spring.velocity.y, -1250, 'Y velocity should be -20px / 0.016s = -1250 px/s');
  assert.ok(result.codeEmission.includes('velocity: { x: 3125.00, y: -1250.00 }'), 'Code emission should contain formatted velocity');
  
  console.log('test-physics-handoff: Velocity transfer math and code generation verified successfully.');
}

try {
  testPhysicsHandoff();
} catch (err) {
  console.error(err);
  process.exit(1);
}
