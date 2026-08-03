#!/usr/bin/env node
'use strict';

/**
 * DesignOS Fluid Typography Interpolator AST
 * Generates exact clamp() equations for fluid responsive typography.
 */

function generateFluidClamp(minSizePx, maxSizePx, minViewportPx = 375, maxViewportPx = 1440) {
  // Convert px to rem for accessibility (assuming 16px base)
  const baseFontSize = 16;
  const minSizeRem = minSizePx / baseFontSize;
  const maxSizeRem = maxSizePx / baseFontSize;
  
  const minViewportRem = minViewportPx / baseFontSize;
  const maxViewportRem = maxViewportPx / baseFontSize;
  
  // Calculate the slope
  const slope = (maxSizeRem - minSizeRem) / (maxViewportRem - minViewportRem);
  
  // Calculate the intersection point
  const intersectionRem = -minViewportRem * slope + minSizeRem;
  
  // Convert slope to vw
  const slopeVw = slope * 100;
  
  // Generate the clamp string
  const clampStr = `clamp(${minSizeRem.toFixed(4)}rem, ${intersectionRem.toFixed(4)}rem + ${slopeVw.toFixed(4)}vw, ${maxSizeRem.toFixed(4)}rem)`;
  
  return {
    minSizeRem,
    maxSizeRem,
    slopeVw,
    intersectionRem,
    cssValue: clampStr
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--demo')) {
    console.log('Generating fluid typography clamp for 16px to 24px between 375px and 1440px viewports...');
    const result = generateFluidClamp(16, 24, 375, 1440);
    console.log(`CSS Token Value: ${result.cssValue}`);
  }
}

if (require.main === module) main();
module.exports = { generateFluidClamp };
