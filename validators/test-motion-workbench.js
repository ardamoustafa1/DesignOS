'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { motionLab } = require('../bin/motion-lab');

function testWorkbenchHTML() {
  const dummyHtml = path.join(__dirname, 'dummy.html');
  fs.writeFileSync(dummyHtml, '<!doctype html><title>Test</title><body><div class="test"></div></body>');
  
  const output = motionLab(dummyHtml, [], __dirname);
  const result = fs.readFileSync(output, 'utf8');
  
  assert.ok(result.includes('id="scrubber"'), 'Workbench should include timeline scrubber');
  assert.ok(result.includes('id="trajectory"'), 'Workbench should include trajectory canvas');
  assert.ok(result.includes('id="velocity"'), 'Workbench should include velocity canvas');
  assert.ok(result.includes('id="acceleration"'), 'Workbench should include acceleration canvas');
  assert.ok(result.includes('id="layerPromo"'), 'Workbench should include layer promotion button');
  assert.ok(result.includes('id="symmetry"'), 'Workbench should include symmetry metric');
  
  fs.unlinkSync(dummyHtml);
  fs.unlinkSync(output);
  console.log('test-motion-workbench: Scrubber, Canvases, Layer Promo, and Symmetry views injected successfully');
}

try {
  testWorkbenchHTML();
} catch (error) {
  console.error(error);
  process.exit(1);
}
