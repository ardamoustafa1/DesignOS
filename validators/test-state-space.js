'use strict';

const assert = require('assert');
const { generatePairwise, DIMENSIONS, exploreStateSpace } = require('../bin/state-space-explorer');

function testStateSpace() {
  const dummyHtml = `<div class="card">
    <img src="test.jpg" />
    <h2>Title</h2>
    <ul><li>Item 1</li></ul>
  </div>`;
  
  const result = exploreStateSpace(dummyHtml);
  
  // Total combinations without pairwise: 2^14 * 3 = 49152
  // Pairwise should cap this significantly (usually around 15-30)
  assert.ok(result.count < 50, 'Pairwise algorithm should aggressively cap combinatorial explosion');
  assert.ok(result.count > 10, 'Pairwise algorithm should generate at least minimum coverage');
  
  // Verify HTML output contains mutated variations
  assert.ok(result.html.includes('Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft'), 'Should contain long content mutation');
  assert.ok(result.html.includes('<img  />'), 'Should contain missing media mutation (removed src)');
  
  console.log(`test-state-space: Successfully generated ${result.count} pairs, avoiding 49,152 permutations.`);
}

try {
  testStateSpace();
} catch (error) {
  console.error(error);
  process.exit(1);
}
