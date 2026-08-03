'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function testTortureSimulator() {
  const dummyHtml = path.join(__dirname, 'torture.html');
  fs.writeFileSync(dummyHtml, `<!doctype html><title>Torture Test</title><body>
    <header style="height: 50px"></header>
    <main style="position: absolute; top: 10px;">Main overlapping header</main>
    <div style="width: 10px; height: 10px; overflow: hidden">
      <button class="primary" style="margin-top: 50px">Orphaned</button>
    </div>
    <div style="display:flex;">
      <a href="#" style="width: 20px; height: 20px">A</a>
      <a href="#" style="width: 20px; height: 20px">B</a>
    </div>
  </body>`);
  
  const result = spawnSync('node', ['bin/responsive-constraint.js', dummyHtml, '--torture', '--no-fail'], { encoding: 'utf8' });
  const reportPath = path.resolve('.designos/responsive-constraints.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  const violations = report.violations;
  const types = violations.map(v => v.type);
  
  assert.ok(types.includes('hierarchy-collapse'), 'Torture Simulator should detect hierarchy collapse');
  assert.ok(types.includes('orphan-cta'), 'Torture Simulator should detect orphan CTA');
  assert.ok(types.includes('touch-collision'), 'Torture Simulator should detect touch collision');
  
  fs.unlinkSync(dummyHtml);
  fs.unlinkSync(reportPath);
  console.log('test-torture-simulator: Detected hierarchy collapse, orphan CTA, and touch collision via DOM injection');
}

try {
  testTortureSimulator();
} catch (error) {
  console.error(error);
  process.exit(1);
}
