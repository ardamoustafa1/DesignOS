#!/usr/bin/env node
'use strict';

/**
 * DesignOS Sensory Sync Compiler
 * Injects haptic vibration and Web Audio API micro-sounds into component ASTs.
 */

function compileSensoryFeedback(componentId, interactionType, intensity = 'medium') {
  // Map intensity to vibration pattern and frequency
  let pattern = [10];
  let frequency = 600; // Hz
  let duration = 0.05; // Seconds
  
  if (intensity === 'light') {
    pattern = [5];
    frequency = 800;
    duration = 0.03;
  } else if (intensity === 'heavy') {
    pattern = [20, 10, 20];
    frequency = 300;
    duration = 0.1;
  }
  
  const code = `
// Sensory Feedback for ${componentId} on ${interactionType}
function triggerSensory_${componentId}() {
  // Haptic feedback
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([${pattern.join(', ')}]);
  }
  
  // Web Audio API micro-sound
  if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(${frequency}, ctx.currentTime);
      
      // Envelope to avoid clicking
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ${duration});
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + ${duration});
    } catch (e) {
      // Audio context might require user interaction first
    }
  }
}
  `.trim();
  
  return { id: componentId, pattern, frequency, code };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--demo')) {
    console.log('Compiling sensory feedback for SubmitButton (heavy intensity)...');
    const result = compileSensoryFeedback('SubmitButton', 'click', 'heavy');
    console.log(result.code);
  }
}

if (require.main === module) main();
module.exports = { compileSensoryFeedback };
