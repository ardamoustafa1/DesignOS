'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runPipeline } = require('../bin/image-to-code');

async function testImageToCode() {
  const outDir = path.resolve('.designos/test-image-to-code');
  fs.mkdirSync(outDir, { recursive: true });

  const result = await runPipeline({
    payload: null, // Forces mock OCR fallback
    stack: 'react',
    outDir
  });

  // 1. Verify DSL Inference
  assert.ok(result.dsl.includes('hero('), 'Inferred DSL should contain hero');
  assert.ok(result.dsl.includes('action-cluster(button,button)'), 'Inferred DSL should contain the correct buttons');
  
  // 2. Verify Output Code
  assert.ok(result.code.includes('import \'./composition.css\''), 'React code should be generated');
  assert.ok(result.code.includes('className="dos-action-cluster"'), 'React code should contain primitive classes');
  
  // 3. Verify Perceptual Diff Outputs
  assert.ok(fs.existsSync(result.heatmapPath), 'Uncertainty heatmap should be saved');
  assert.ok(fs.existsSync(result.screenshotPath), 'Browser screenshot should be saved');
  
  fs.rmSync(outDir, { recursive: true, force: true });
  console.log('test-image-to-code: Successfully mocked OCR payload, inferred React component behavior, and diffed browser render.');
}

testImageToCode().catch(error => {
  console.error(error);
  process.exit(1);
});
