'use strict';

const assert = require('assert');
const { compileScrollTimeline } = require('../bin/scroll-timeline-compiler');

function testScrollTimeline() {
  const mockAst = {
    elements: [
      { id: 'box1', attributes: { 'data-scroll-effect': 'fade-in' } },
      { id: 'box2', attributes: { 'data-scroll-effect': 'scrub' } }
    ]
  };
  
  const result = compileScrollTimeline(mockAst);
  
  assert.strictEqual(result.length, 2, 'Should extract exactly 2 timelines');
  assert.strictEqual(result[0].id, 'box1');
  assert.strictEqual(result[0].effect, 'fade-in');
  assert.ok(result[0].code.includes('opacity: 0'), 'Fade-in should contain opacity keyframes');
  assert.ok(result[0].code.includes('new ScrollTimeline'), 'Must use native ScrollTimeline API');
  
  assert.strictEqual(result[1].id, 'box2');
  assert.ok(result[1].code.includes('transform: \'scale(1.5)\''), 'Scrub should contain scale keyframes');
  
  console.log('test-scroll-timeline: WAAPI Scroll Timeline generation verified successfully.');
}

try {
  testScrollTimeline();
} catch (err) {
  console.error(err);
  process.exit(1);
}
