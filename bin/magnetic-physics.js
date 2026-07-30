#!/usr/bin/env node
'use strict';

/**
 * DesignOS Magnetic Physics Compiler
 * Generates magnetic mouse-trapping physics code for interactive elements.
 */

function compileMagneticPhysics(componentId, magneticForce = 0.5, radiusPx = 100) {
  // Ensure force is a float between 0.1 and 1.0
  const force = Math.max(0.1, Math.min(parseFloat(magneticForce), 1.0));
  
  const code = `
// Magnetic Physics for ${componentId}
function attachMagneticPhysics_${componentId}() {
  const el = document.getElementById('${componentId}');
  if (!el) return;
  
  let rect = el.getBoundingClientRect();
  
  // Update rect on resize or scroll
  const updateRect = () => { rect = el.getBoundingClientRect(); };
  window.addEventListener('resize', updateRect);
  window.addEventListener('scroll', updateRect);
  
  const magneticForce = ${force};
  const radius = ${radiusPx};
  
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = mouseX - centerX;
    const distanceY = mouseY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (distance < radius) {
      // Pull element towards mouse
      const pullX = distanceX * magneticForce;
      const pullY = distanceY * magneticForce;
      
      el.style.transform = \`translate(\${pullX}px, \${pullY}px)\`;
      el.style.transition = 'transform 0.1s ease-out';
    } else {
      // Snap back
      el.style.transform = 'translate(0px, 0px)';
      el.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Spring-like bounce
    }
  });
}
  `.trim();
  
  return { id: componentId, force, radius: radiusPx, code };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--demo')) {
    console.log('Compiling magnetic physics for FAB (Floating Action Button)...');
    const result = compileMagneticPhysics('FAB', 0.4, 150);
    console.log(result.code);
  }
}

if (require.main === module) main();
module.exports = { compileMagneticPhysics };
