#!/usr/bin/env node
'use strict';

// Appends one verified native-evidence run to evals/native-device/registry.json.
// Called only from .github/workflows/promote-native-evidence.yml, itself triggered
// only by a passing native-smoke.yml run on main — never invoked by hand with
// verified:true. Idempotent: re-running for a SHA/platform/tier that's already
// recorded is a no-op, so a re-triggered promotion workflow can't double-append.

const fs = require('fs');
const path = require('path');
const { NATIVE_EVIDENCE_TIERS, NATIVE_PLATFORMS } = require('../capabilities/native-evidence');

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0 || !process.argv[index + 1]) throw new Error(`Missing required --${name}`);
  return process.argv[index + 1];
}

function main() {
  const sha = arg('sha');
  const platform = arg('platform');
  const tier = arg('tier');
  const runId = arg('run-id');
  const runUrl = arg('run-url');
  const notes = arg('notes');
  const registryPath = path.resolve(__dirname, '..', 'evals/native-device/registry.json');

  if (!NATIVE_PLATFORMS.includes(platform)) {
    throw new Error(`Unknown platform "${platform}" — expected one of ${NATIVE_PLATFORMS.join(', ')}`);
  }
  if (!NATIVE_EVIDENCE_TIERS.includes(tier)) {
    throw new Error(`Unknown tier "${tier}" — expected one of ${NATIVE_EVIDENCE_TIERS.join(', ')}`);
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  registry.runs = registry.runs || [];

  const alreadyRecorded = registry.runs.some(run =>
    run.sha === sha && run.platform === platform && run.tier === tier && run.verified === true);
  if (alreadyRecorded) {
    console.log(`promote-native-evidence: ${platform}/${tier} already recorded for ${sha} — no-op`);
    return;
  }

  registry.runs.push({
    sha,
    platform,
    tier,
    verified: true,
    runId,
    runUrl,
    date: new Date().toISOString(),
    notes,
  });
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
  console.log(`promote-native-evidence: recorded ${platform}/${tier} for ${sha}`);
}

main();
