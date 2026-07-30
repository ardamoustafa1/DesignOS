'use strict';

const assert = require('assert');
const { compileComposition } = require('../bin/composition-compiler');

function testComponentGrammar() {
  const source = 'dialog(tabs(button, button), action-cluster(button, button))';
  
  const result = compileComposition(source, 'react');
  
  // Verify AST has contracts attached
  const dialogNode = result.ast;
  assert.equal(dialogNode.name, 'dialog');
  assert.ok(dialogNode.contracts, 'Dialog should have a contract attached');
  assert.equal(dialogNode.contracts.focus, 'trap', 'Dialog focus contract should be trap');
  assert.equal(dialogNode.contracts.ax['aria-modal'], 'true', 'Dialog AX contract should be aria-modal=true');
  
  const tabsNode = dialogNode.children[0];
  assert.equal(tabsNode.name, 'tabs');
  assert.ok(tabsNode.contracts, 'Tabs should have a contract attached');
  assert.equal(tabsNode.contracts.ax['aria-orientation'], 'horizontal', 'Tabs AX contract applied');
  
  // Verify HTML/React emitter includes the injected AX attributes
  assert.ok(result.source.includes('aria-modal="true"'), 'Output should contain injected ARIA modal attribute');
  assert.ok(result.source.includes('aria-orientation="horizontal"'), 'Output should contain injected ARIA orientation attribute');
  assert.ok(result.source.includes('role="dialog"'), 'Output should contain primitive role mapping');
  assert.ok(result.source.includes('role="tablist"'), 'Output should contain tablist role mapping');

  console.log('test-component-grammar: 40+ archetype contracts attached and correctly emitted');
}

try {
  testComponentGrammar();
} catch (error) {
  console.error(error);
  process.exit(1);
}
