'use strict';

const fs = require('fs');
const path = require('path');
const { RULES, PROVIDERS } = require('../validators/rule-registry');
const { RECIPES, STACKS } = require('../runtime/motion/recipes');
const { graphNodes } = require('../bin/intelligence');
const { verifyExternalRegistry } = require('../bin/external-eval');
const { LEADER_FEATURES } = require('./product-features');
const { STATES } = require('../bin/state-matrix');
const { MUTATIONS } = require('../bin/mutation-testing');
const { SCENARIOS } = require('../bin/interruption-torture');
const { STACKS: COMPOSITION_STACKS } = require('../bin/composition-compiler');
const { SOURCES: NATIVE_SOURCES } = require('../runtime/native/adapters');
const { matrixCounts } = require('../fixtures/frameworks/contracts');
const { PATTERNS } = require('../runtime/pattern-atlas');

const ROOT = path.resolve(__dirname, '..');
const KNOWLEDGE_DIRECTORIES = Object.freeze([
  'foundations', 'components', 'patterns', 'psychology', 'motion', 'native',
]);
const GENERATED_DOCUMENTS = Object.freeze([
  'README.md', 'ARCHITECTURE.md', 'ROADMAP.md', 'LIMITATIONS.md',
]);

function countMarkdown(directory) {
  if (!fs.existsSync(directory)) return 0;
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return total + countMarkdown(target);
    return total + (entry.name.endsWith('.md') && entry.name !== 'README.md' ? 1 : 0);
  }, 0);
}

function buildCapabilityLedger() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const production = Object.entries(pkg.dependencies || {}).map(([name, range]) => ({ name, range }));
  const optional = Object.entries(pkg.optionalDependencies || {}).map(([name, range]) => ({ name, range }));
  const development = Object.entries(pkg.devDependencies || {}).map(([name, range]) => ({ name, range }));
  const external = verifyExternalRegistry(path.join(ROOT, 'evals/external/registry.json'));
  const committedLedgerFile = path.join(ROOT, 'capabilities/ledger.json');
  const committedLedger = fs.existsSync(committedLedgerFile)
    ? JSON.parse(fs.readFileSync(committedLedgerFile, 'utf8')) : null;
  const goldenRoot = path.join(ROOT, 'goldens');
  const matrix = matrixCounts(RECIPES.length);
  const cliModules = fs.readdirSync(path.join(ROOT, 'bin/cli/commands'))
    .filter(file => file.endsWith('.js')).length;
  return {
    schemaVersion: 2,
    package: { name: pkg.name, version: pkg.version, node: pkg.engines?.node || null },
    dependencies: {
      productionCount: production.length, production,
      optionalCount: optional.length, optional,
      developmentCount: development.length, development,
    },
    capabilities: {
      registryRules: RULES.length,
      registryProviders: PROVIDERS.length,
      knowledgeModules: KNOWLEDGE_DIRECTORIES.reduce(
        (total, directory) => total + countMarkdown(path.join(ROOT, directory)), 0),
      industryPacks: countMarkdown(path.join(ROOT, 'industries')),
      motionRecipes: RECIPES.length,
      frameworkStacks: STACKS.length,
      executableAdapterCombinations: RECIPES.length * STACKS.length,
      reducedMotionBrowserScenarios: RECIPES.length * STACKS.length,
      browserFixtureScenarios: matrix.fixtureCount,
      browserAssertions: matrix.browserAssertions,
      knowledgeGraphNodes: graphNodes().length,
      goldenProjects: fs.existsSync(goldenRoot)
        ? fs.readdirSync(goldenRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).length
        : committedLedger?.capabilities?.goldenProjects || 0,
      cliCommandModules: cliModules,
      componentAstTransforms: 3,
      motionEvidenceEngines: 2,
      leaderProductFeatures: LEADER_FEATURES.length,
      leaderProductFeaturesImplemented: LEADER_FEATURES.filter(feature => feature.implemented).length,
      motionStateGraphCompiler: true,
      interruptionTortureScenarios: SCENARIOS.length,
      designGenomeScanner: true,
      compositionCompilerStacks: COMPOSITION_STACKS.length,
      responsiveConstraintSolver: true,
      generatedComponentStates: STATES.length,
      mutationOperators: MUTATIONS.length,
      crossPageConsistencyGraph: true,
      nativeMotionAdapters: Object.keys(NATIVE_SOURCES).length,
      motionSemanticCompiler: true,
      liveDirectorStudio: true,
      deterministicClaimCompiler: true,
      patternAtlasItems: PATTERNS.length,
      explainableMotionDecisions: true,
      unifiedImproveWorkflow: true,
      isolatedRuleEval: true,
      externalEval: external.externalEval,
      externalEvalRuns: external.validRuns,
    },
    distribution: {
      corePackageExcludesGeneratedEvidence: true,
      evidencePackageBuilder: 'scripts/build-evidence-package.js',
    },
    documents: GENERATED_DOCUMENTS,
    sources: {
      dependencies: 'package.json',
      rulesAndProviders: 'validators/rule-registry.js',
      motion: 'runtime/motion/recipes.js',
      browserConformance: 'fixtures/frameworks/test-matrix.js',
      componentTransforms: 'bin/live/component-transform.js',
      motionProfile: 'bin/motion-profiler.js',
      temporalRegression: 'bin/temporal-motion.js',
      leaderFeatures: 'capabilities/product-features.js',
      motionStateGraph: 'runtime/motion/state-graph.js',
      interruptionTorture: 'bin/interruption-torture.js',
      designGenome: 'bin/design-genome.js',
      compositionCompiler: 'bin/composition-compiler.js',
      responsiveSolver: 'bin/responsive-constraint.js',
      stateMatrix: 'bin/state-matrix.js',
      mutationTesting: 'bin/mutation-testing.js',
      consistencyGraph: 'bin/consistency-graph.js',
      nativeMotion: 'runtime/native/adapters.js',
      motionSemantics: 'runtime/motion/semantics.js',
      liveDirectorStudio: 'bin/live-director.js',
      publicClaims: 'capabilities/public-claims.js + scripts/compile-public-claims.js',
      patternAtlas: 'runtime/pattern-atlas.js',
      improveWorkflow: 'bin/leader-workflow.js',
      evals: 'evals/isolated/registry-eval.json + evals/external/registry.json',
      knowledgeGraph: 'bin/intelligence.js',
    },
  };
}

module.exports = { ROOT, KNOWLEDGE_DIRECTORIES, GENERATED_DOCUMENTS, countMarkdown, buildCapabilityLedger };
