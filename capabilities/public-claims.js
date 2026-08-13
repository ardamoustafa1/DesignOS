'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, buildCapabilityLedger } = require('./registry');
const { matrixCounts } = require('../fixtures/frameworks/contracts');
const { NATIVE_EVIDENCE_TIERS, computeNativeEvidence } = require('./native-evidence');

function buildPublicClaims() {
  const ledger = buildCapabilityLedger();
  const matrix = matrixCounts(ledger.capabilities.motionRecipes);
  const nativeRegistry = path.join(ROOT, 'evals/native-device/registry.json');
  const nativeEvidence = computeNativeEvidence(nativeRegistry);
  return {
    schemaVersion: 1,
    package: {
      name: ledger.package.name,
      version: ledger.package.version,
    },
    rules: {
      count: ledger.capabilities.registryRules,
      providers: ledger.capabilities.registryProviders,
      source: ledger.sources.rulesAndProviders,
    },
    motion: {
      recipes: ledger.capabilities.motionRecipes,
      stacks: ledger.capabilities.frameworkStacks,
      adapterCombinations: ledger.capabilities.executableAdapterCombinations,
      fixtureScenarios: matrix.fixtureCount,
      browserAssertions: matrix.browserAssertions,
      sourceMapAssertions: matrix.sourceMapAssertions,
      source: ledger.sources.motion,
      fixtureSource: ledger.sources.browserConformance,
    },
    discovery: {
      patternAtlasItems: ledger.capabilities.patternAtlasItems,
      explainableMotionDecisions: ledger.capabilities.explainableMotionDecisions,
      unifiedImproveWorkflow: ledger.capabilities.unifiedImproveWorkflow,
      source: ledger.sources.patternAtlas,
    },
    dependencies: {
      runtime: ledger.dependencies.productionCount,
      names: ledger.dependencies.production.map(item => item.name),
      optional: ledger.dependencies.optionalCount,
      optionalNames: ledger.dependencies.optional.map(item => item.name),
      source: ledger.sources.dependencies,
    },
    evaluation: {
      isolatedRuleEval: ledger.capabilities.isolatedRuleEval,
      externalEval: ledger.capabilities.externalEval,
      externalEvalRuns: ledger.capabilities.externalEvalRuns,
      source: ledger.sources.evals,
    },
    nativeEvidence: {
      tiers: NATIVE_EVIDENCE_TIERS,
      platforms: nativeEvidence.platforms,
      summary: nativeEvidence.summary,
      sourceAdapters: ledger.capabilities.nativeMotionAdapters,
      source: ledger.sources.nativeMotion,
    },
    generatedTargets: [
      'README.md', 'ARCHITECTURE.md', 'ROADMAP.md', 'LIMITATIONS.md',
      '.claude-plugin/plugin.json', 'website/index.html',
    ],
  };
}

module.exports = { buildPublicClaims };
