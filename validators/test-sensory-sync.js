'use strict';

const assert = require('assert');
const { compileSensoryFeedback } = require('../bin/sensory-sync-compiler');

function testSensorySync() {
  const lightResult = compileSensoryFeedback('HoverBtn', 'hover', 'light');
  assert.strictEqual(lightResult.pattern[0], 5, 'Light intensity should have short 5ms vibration');
  assert.strictEqual(lightResult.frequency, 800, 'Light intensity should have high 800Hz frequency');
  assert.ok(lightResult.code.includes('navigator.vibrate([5])'));
  assert.ok(lightResult.code.includes('osc.frequency.setValueAtTime(800'));
  
  const heavyResult = compileSensoryFeedback('DeleteBtn', 'click', 'heavy');
  assert.deepStrictEqual(heavyResult.pattern, [20, 10, 20], 'Heavy intensity should have multi-step pattern');
  assert.strictEqual(heavyResult.frequency, 300, 'Heavy intensity should have lower 300Hz frequency');
  assert.ok(heavyResult.code.includes('navigator.vibrate([20, 10, 20])'));
  assert.ok(heavyResult.code.includes('osc.frequency.setValueAtTime(300'));
  
  console.log('test-sensory-sync: Web Audio and Haptic pattern generation verified successfully.');
}

try {
  testSensorySync();
} catch (err) {
  console.error(err);
  process.exit(1);
}
