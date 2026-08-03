'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function testDesignGenome() {
  const dummyDir = path.join(process.cwd(), '.tmp-genome-test');
  fs.mkdirSync(dummyDir, { recursive: true });
  fs.writeFileSync(path.join(dummyDir, 'style.css'), `
    :root {
      --color-primary: #ff0000;
      --color-danger: #ff0000;
      --spacing-1: 8px;
    }
    .button { color: #ff0000; font-family: Inter; }
    .card { font-family: Roboto; }
    .alert { font-family: Arial; }
    .toast { font-family: 'Comic Sans MS'; }
  `);
  
  const reportPath = path.resolve('.designos/design-genome.json');
  const result = spawnSync('node', ['bin/design-genome.js', dummyDir, '--export-design-md'], { encoding: 'utf8' });
  
  const genome = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const designMd = fs.readFileSync(path.join(path.dirname(reportPath), 'DESIGN.md'), 'utf8');
  
  // Verify anomalies
  const duplicateTokens = genome.anomalies.duplicateTokens;
  assert.ok(duplicateTokens.some(group => group.includes('--color-primary') && group.includes('--color-danger')), 'Should detect duplicate hex tokens');
  assert.equal(genome.anomalies.fontClashes, 'Too many font families declared', 'Should detect font clashes');
  
  // Verify codemods
  const redCodemod = genome.codemods.find(m => m.target.toLowerCase() === '#ff0000');
  assert.ok(redCodemod, 'Should propose codemod for raw #ff0000 matching a token');
  
  // Verify DESIGN.md
  assert.ok(designMd.includes('# Design DNA'), 'DESIGN.md should include title');
  assert.ok(designMd.includes('--color-primary'), 'DESIGN.md should include colors');
  assert.ok(designMd.includes('--color-primary = --color-danger'), 'DESIGN.md should list duplicate tokens');
  
  fs.rmSync(dummyDir, { recursive: true, force: true });
  console.log('test-design-genome: Detected duplicate tokens, font clashes, emitted codemods and DESIGN.md successfully');
}

try {
  testDesignGenome();
} catch (error) {
  console.error(error);
  process.exit(1);
}
