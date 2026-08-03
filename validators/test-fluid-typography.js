'use strict';

const assert = require('assert');
const { generateFluidClamp } = require('../bin/fluid-typography');

function testFluidTypography() {
  // Test generating fluid clamp from 16px to 24px between 375px and 1440px
  const result = generateFluidClamp(16, 24, 375, 1440);
  
  // 16px = 1rem
  assert.strictEqual(result.minSizeRem, 1.0);
  // 24px = 1.5rem
  assert.strictEqual(result.maxSizeRem, 1.5);
  
  assert.ok(result.cssValue.startsWith('clamp(1.0000rem, '));
  assert.ok(result.cssValue.endsWith(', 1.5000rem)'));
  assert.ok(result.cssValue.includes('vw'));
  
  console.log('test-fluid-typography: Fluid clamp mathematical scaling verified successfully.');
}

try {
  testFluidTypography();
} catch (err) {
  console.error(err);
  process.exit(1);
}
