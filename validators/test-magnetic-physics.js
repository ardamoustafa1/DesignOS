'use strict';

const assert = require('assert');
const { compileMagneticPhysics } = require('../bin/magnetic-physics');

function testMagneticPhysics() {
  const result = compileMagneticPhysics('MenuBtn', 0.8, 200);
  
  assert.strictEqual(result.id, 'MenuBtn');
  assert.strictEqual(result.force, 0.8);
  assert.strictEqual(result.radius, 200);
  
  // Boundary check on force
  const resultHigh = compileMagneticPhysics('MenuBtn', 1.5, 200);
  assert.strictEqual(resultHigh.force, 1.0, 'Force should be capped at 1.0');
  
  const resultLow = compileMagneticPhysics('MenuBtn', 0.05, 200);
  assert.strictEqual(resultLow.force, 0.1, 'Force should have a minimum of 0.1');
  
  assert.ok(result.code.includes('distance < radius'));
  assert.ok(result.code.includes('distanceX * magneticForce'));
  
  console.log('test-magnetic-physics: Magnetic physics proximity code generation verified successfully.');
}

try {
  testMagneticPhysics();
} catch (err) {
  console.error(err);
  process.exit(1);
}
