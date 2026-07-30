'use strict';

const assert = require('assert');
const { computeInvertMatrix, compileFlipTransition } = require('../bin/flip-morph-compiler');

function testFlipMorph() {
  const firstRect = { left: 100, top: 200, width: 200, height: 100 };
  const lastRect = { left: 400, top: 200, width: 400, height: 200 };
  
  const invert = computeInvertMatrix(firstRect, lastRect);
  assert.strictEqual(invert.deltaX, -300);
  assert.strictEqual(invert.deltaY, 0);
  assert.strictEqual(invert.scaleX, 0.5);
  assert.strictEqual(invert.scaleY, 0.5);
  
  const result = compileFlipTransition('Card', firstRect, lastRect);
  assert.ok(result.code.includes('`translate(${-300}px, ${0}px) scale(${0.5}, ${0.5})`'));
  assert.ok(result.code.includes('el.style.transform = \'none\''));
  
  console.log('test-flip-morph: FLIP invert matrix and transition code verified successfully.');
}

try {
  testFlipMorph();
} catch (err) {
  console.error(err);
  process.exit(1);
}
