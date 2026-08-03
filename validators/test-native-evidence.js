'use strict';

const assert = require('assert');
const { analyzeNativeEvidence } = require('../bin/native-evidence-lab');

function testNativeEvidence() {
  const mockReport = {
    platform: 'iOS',
    engine: 'XCTest',
    frames: [
      { durationMs: 16 },
      { durationMs: 16 },
      { durationMs: 40 }, // Jitter
      { durationMs: 16 }
    ],
    gestures: [
      { type: 'edge-swipe', cancelled: true, stateRestored: false }
    ],
    haptics: [], // Should fail because gesture fired without haptics
    thermalState: 'serious',
    animationsActive: true, // Should fail because thermal throttling requires reduced animations
    dynamicTypeScale: 2.0,
    layout: {
      textClipped: true, // Should fail dynamic type
      keyboardVisible: true,
      keyboardY: 400,
      focusedElementY: 450 // Should fail safe area inset
    }
  };
  
  const result = analyzeNativeEvidence(mockReport);
  
  assert.equal(result.passed, false, 'Should fail native conformance');
  const types = result.violations.map(v => v.type);
  
  assert.ok(types.includes('frame-pacing'), 'Should detect frame pacing jitter');
  assert.ok(types.includes('haptic-verification'), 'Should detect missing haptic feedback');
  assert.ok(types.includes('thermal-throttling'), 'Should detect thermal throttling violation');
  assert.ok(types.includes('dynamic-type'), 'Should detect dynamic type clipping');
  assert.ok(types.includes('safe-area-inset'), 'Should detect keyboard safe area inset violation');
  assert.ok(types.includes('gesture-cancellation'), 'Should detect un-restored gesture cancellation');
  
  console.log('test-native-evidence: Successfully detected iOS XCTest violations (Frame Pacing, Thermal, Haptics, Gestures)');
}

try {
  testNativeEvidence();
} catch (error) {
  console.error(error);
  process.exit(1);
}
