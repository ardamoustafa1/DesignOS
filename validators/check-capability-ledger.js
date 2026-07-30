#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, GENERATED_DOCUMENTS, buildCapabilityLedger } = require('../capabilities/registry');

const LEDGER = path.join(ROOT, 'capabilities/ledger.json');
const START = '<!-- DESIGNOS_CAPABILITY_LEDGER:START -->';
const END = '<!-- DESIGNOS_CAPABILITY_LEDGER:END -->';
const WRITE = process.argv.includes('--write');

function markdown(ledger) {
  const { dependencies, capabilities } = ledger;
  const dependencyNames = dependencies.production.map(item => `\`${item.name}\``).join(', ');
  return `${START}
> Generated from executable sources by \`npm run ledger:update\`. Do not edit this block manually.

| Capability | Verified source count |
|---|---:|
| Production dependencies | ${dependencies.productionCount} (${dependencyNames || 'none'}) |
| Registry rules / providers | ${capabilities.registryRules} / ${capabilities.registryProviders} |
| Validated knowledge modules | ${capabilities.knowledgeModules} |
| Industry packs | ${capabilities.industryPacks} |
| Motion recipes / framework stacks | ${capabilities.motionRecipes} / ${capabilities.frameworkStacks} |
| Executable adapter combinations | ${capabilities.executableAdapterCombinations} |
| Full + reduced-motion browser scenarios | ${capabilities.executableAdapterCombinations + capabilities.reducedMotionBrowserScenarios} |
| Knowledge graph nodes | ${capabilities.knowledgeGraphNodes} |
| Golden projects | ${capabilities.goldenProjects} |
| Component AST directions / CLI command modules | ${capabilities.componentAstTransforms} / ${capabilities.cliCommandModules} |
| Motion evidence engines | ${capabilities.motionEvidenceEngines} (CDP profile + temporal regression) |
| Mission 4 leader features | ${capabilities.leaderProductFeaturesImplemented} / ${capabilities.leaderProductFeatures} implemented |
| Torture scenarios / generated component states | ${capabilities.interruptionTortureScenarios} / ${capabilities.generatedComponentStates} |
| Composition compiler stacks / native motion adapters | ${capabilities.compositionCompilerStacks} / ${capabilities.nativeMotionAdapters} |
| Mutation operators | ${capabilities.mutationOperators} |
| Isolated rule eval / external eval | ${capabilities.isolatedRuleEval ? 'yes' : 'no'} / ${capabilities.externalEval ? `yes (${capabilities.externalEvalRuns})` : 'not yet'} |
${END}`;
}

function replaceBlock(file, block) {
  const source = fs.readFileSync(file, 'utf8');
  const start = source.indexOf(START);
  const end = source.indexOf(END);
  if (start < 0 || end < start) throw new Error(`${path.relative(ROOT, file)}: capability ledger markers missing`);
  return source.slice(0, start) + block + source.slice(end + END.length);
}

function stableJson(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

function main() {
  const ledger = buildCapabilityLedger();
  const block = markdown(ledger);
  const documents = GENERATED_DOCUMENTS.map(file => path.join(ROOT, file));
  const expectedLedger = stableJson(ledger);
  if (WRITE) {
    fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
    fs.writeFileSync(LEDGER, expectedLedger);
    for (const document of documents) fs.writeFileSync(document, replaceBlock(document, block));
    console.log(`capability-ledger: generated capabilities/ledger.json and ${GENERATED_DOCUMENTS.join(', ')}`);
    return;
  }

  const failures = [];
  if (!fs.existsSync(LEDGER) || fs.readFileSync(LEDGER, 'utf8') !== expectedLedger) {
    failures.push('capabilities/ledger.json differs from executable sources');
  }
  for (const document of documents) {
    const current = fs.readFileSync(document, 'utf8');
    if (replaceBlock(document, block) !== current) failures.push(`${path.basename(document)} generated capability block drifted`);
  }
  const staleClaims = [
    ['README.md', /Zero dependencies|zero-dependency CLI/i],
    ['ARCHITECTURE.md', /\bNo runtime\b/i],
  ];
  for (const [file, pattern] of staleClaims) {
    if (pattern.test(fs.readFileSync(path.join(ROOT, file), 'utf8'))) failures.push(`${file} contains stale claim: ${pattern}`);
  }
  if (failures.length) {
    console.error(`capability-ledger: ${failures.length} drift finding(s)\n- ${failures.join('\n- ')}\nRun npm run ledger:update.`);
    process.exit(1);
  }
  console.log(`capability-ledger: clean (${dependenciesSummary(ledger)})`);
}

function dependenciesSummary(ledger) {
  return `${ledger.dependencies.productionCount} production dependencies, ${ledger.capabilities.executableAdapterCombinations} executable adapters`;
}

main();
