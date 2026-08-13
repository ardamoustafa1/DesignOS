'use strict';

const fs = require('fs');

// Ordered low → high. A single passing CI boot on one Expo/RN starter app proves the
// starter boots — it does not prove frame pacing, haptics, Dynamic Type, or
// TalkBack/VoiceOver behavior, and it says nothing at all about the other three native
// stacks DesignOS ships recipes for. Collapsing all of that into one word
// ("device-verified") the moment any run lands would be exactly the false-precision
// PROOF_STANDARD.md and LIMITATIONS.md exist to prevent — so the claim is tracked
// per platform, at the tier actually earned, not as one global flag.
const NATIVE_EVIDENCE_TIERS = Object.freeze([
  'source-conformance', // type-checked / structurally validated only, never executed
  'simulator-smoke', // booted in a CI simulator/emulator: builds, installs, launches, doesn't crash
  'platform-verified', // interaction/accessibility assertions on-device (frame pacing, haptics, a11y tree)
  'real-device-verified', // physical hardware lab evidence, not just CI's simulator/emulator
]);

// Matches runtime/native/adapters.js's SOURCES keys — the four stacks DesignOS ships
// motion adapter recipes for.
const NATIVE_PLATFORMS = Object.freeze(['react-native', 'swiftui', 'compose', 'flutter']);

function tierRank(tier) {
  const rank = NATIVE_EVIDENCE_TIERS.indexOf(tier);
  return rank < 0 ? 0 : rank;
}

function computeNativeEvidence(registryPath) {
  const runs = [];
  if (fs.existsSync(registryPath)) {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    for (const run of registry.runs || []) {
      if (run.verified === true && NATIVE_PLATFORMS.includes(run.platform) && NATIVE_EVIDENCE_TIERS.includes(run.tier)) {
        runs.push(run);
      }
    }
  }
  const platforms = {};
  for (const platform of NATIVE_PLATFORMS) {
    const best = runs
      .filter(run => run.platform === platform)
      .reduce((highest, run) => (tierRank(run.tier) > tierRank(highest) ? run.tier : highest), 'source-conformance');
    platforms[platform] = best;
  }
  const advanced = NATIVE_PLATFORMS.filter(platform => platforms[platform] !== 'source-conformance');
  const summary = advanced.length === 0
    ? `source-conformance-only across all ${NATIVE_PLATFORMS.length} platforms (${NATIVE_PLATFORMS.join(', ')}) — 0 CI device/simulator runs`
    : `${advanced.length}/${NATIVE_PLATFORMS.length} platform(s) beyond source-conformance: ${advanced.map(platform => `${platform} (${platforms[platform]})`).join(', ')}; ` +
      `${NATIVE_PLATFORMS.filter(p => !advanced.includes(p)).join(', ') || 'none'} remain source-conformance-only`;
  return { platforms, summary };
}

module.exports = { NATIVE_EVIDENCE_TIERS, NATIVE_PLATFORMS, computeNativeEvidence };
