#!/usr/bin/env node
'use strict';

/**
 * DesignOS FLIP Morphing Compiler
 * Computes Invert matrices for First, Last, Invert, Play transitions.
 */

function computeInvertMatrix(firstRect, lastRect) {
  const deltaX = firstRect.left - lastRect.left;
  const deltaY = firstRect.top - lastRect.top;
  const scaleX = firstRect.width / lastRect.width;
  const scaleY = firstRect.height / lastRect.height;
  
  return { deltaX, deltaY, scaleX, scaleY };
}

function compileFlipTransition(componentId, firstRect, lastRect) {
  const invert = computeInvertMatrix(firstRect, lastRect);
  
  const code = `
// Generated FLIP Morphing code for ${componentId}
function playFlipTransition_${componentId}() {
  const el = document.getElementById('${componentId}');
  if (!el) return;
  
  // Invert
  el.style.transformOrigin = 'top left';
  el.style.transform = \`translate(\${${invert.deltaX}}px, \${${invert.deltaY}}px) scale(\${${invert.scaleX}}, \${${invert.scaleY}})\`;
  
  // Force layout
  el.getBoundingClientRect();
  
  // Play
  el.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
  el.style.transform = 'none';
  
  // Cleanup
  el.addEventListener('transitionend', () => {
    el.style.transition = '';
    el.style.transformOrigin = '';
  }, { once: true });
}
  `.trim();
  
  return {
    id: componentId,
    invert,
    code
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--demo')) {
    const firstRect = { left: 100, top: 200, width: 200, height: 100 };
    const lastRect = { left: 400, top: 200, width: 400, height: 200 };
    
    console.log('Computing FLIP morphing matrix...');
    const result = compileFlipTransition('SharedCard', firstRect, lastRect);
    console.log(`Invert Matrix: dX=${result.invert.deltaX}, dY=${result.invert.deltaY}, sX=${result.invert.scaleX}, sY=${result.invert.scaleY}`);
    console.log('\nGenerated Code:\n' + result.code);
  }
}

if (require.main === module) main();
module.exports = { computeInvertMatrix, compileFlipTransition };
