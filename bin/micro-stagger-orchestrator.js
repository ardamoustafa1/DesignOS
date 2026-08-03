#!/usr/bin/env node
'use strict';

/**
 * DesignOS Micro-Stagger Bounding Box Orchestrator
 * Calculates radial animation stagger delays based on viewport coordinates.
 */

function calculateStagger(elements, originX, originY, baseDelayMs = 50) {
  // elements should be an array of { id, rect: { left, top, width, height } }
  
  // Calculate distance from each element's center to the origin
  const mapped = elements.map(el => {
    const centerX = el.rect.left + (el.rect.width / 2);
    const centerY = el.rect.top + (el.rect.height / 2);
    
    const dx = centerX - originX;
    const dy = centerY - originY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return { id: el.id, distance };
  });
  
  // Sort by distance
  mapped.sort((a, b) => a.distance - b.distance);
  
  // Assign delays
  const result = mapped.map((item, index) => {
    return {
      id: item.id,
      distance: item.distance,
      delayMs: index * baseDelayMs,
      cssRule: `transition-delay: ${index * baseDelayMs}ms;`
    };
  });
  
  return result;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--demo')) {
    const mockElements = [
      { id: 'item-1', rect: { left: 0, top: 0, width: 100, height: 100 } },
      { id: 'item-2', rect: { left: 110, top: 0, width: 100, height: 100 } },
      { id: 'item-3', rect: { left: 0, top: 110, width: 100, height: 100 } },
      { id: 'item-4', rect: { left: 110, top: 110, width: 100, height: 100 } }
    ];
    
    // Origin at (160, 160) - closest to item-4
    const origin = { x: 160, y: 160 };
    
    console.log(`Calculating radial stagger from origin (${origin.x}, ${origin.y})...`);
    const result = calculateStagger(mockElements, origin.x, origin.y, 100);
    console.table(result);
  }
}

if (require.main === module) main();
module.exports = { calculateStagger };
