#!/usr/bin/env node
'use strict';

/**
 * DesignOS Directional Motion Blur Injector
 * Dynamically computes SVG <feGaussianBlur> strings based on transform vectors.
 */

function computeMotionBlur(velocityX, velocityY) {
  // Base heuristic: 1px blur per 100px/s velocity
  const blurFactor = 0.01;
  const stdDeviationX = Math.abs(velocityX) * blurFactor;
  const stdDeviationY = Math.abs(velocityY) * blurFactor;
  
  // Cap the blur to prevent excessive GPU cost or visual artifacts
  const cappedX = Math.min(Math.max(stdDeviationX, 0), 20);
  const cappedY = Math.min(Math.max(stdDeviationY, 0), 20);
  
  const svgFilter = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="designos-svg-filter">
  <defs>
    <filter id="directional-blur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${cappedX.toFixed(2)},${cappedY.toFixed(2)}" />
    </filter>
  </defs>
</svg>
  `.trim();
  
  return {
    stdDeviationX: cappedX,
    stdDeviationY: cappedY,
    svgFilter,
    cssRule: `filter: url('#directional-blur');`
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--demo')) {
    console.log('Generating directional motion blur filter for 1200px/s X and 0px/s Y...');
    const result = computeMotionBlur(1200, 0);
    console.log(result.svgFilter);
    console.log(result.cssRule);
  }
}

if (require.main === module) main();
module.exports = { computeMotionBlur };
