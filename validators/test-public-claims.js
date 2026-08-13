#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { ROOT } = require('../capabilities/registry');
const { buildPublicClaims } = require('../capabilities/public-claims');
const { compile, futureShippedClaims } = require('../scripts/compile-public-claims');

const claims = buildPublicClaims();
assert.strictEqual(claims.package.version, require('../package.json').version);
assert.strictEqual(claims.rules.count, 40);
assert.strictEqual(claims.motion.recipes * claims.motion.stacks, claims.motion.adapterCombinations);
assert.strictEqual(claims.motion.fixtureScenarios, claims.motion.adapterCombinations * 2);
assert.strictEqual(claims.motion.browserAssertions, 3510);
assert.strictEqual(claims.dependencies.runtime, Object.keys(require('../package.json').dependencies).length);
assert.strictEqual(claims.evaluation.externalEval, false);
assert.deepStrictEqual(
  claims.nativeEvidence.platforms,
  { 'react-native': 'source-conformance', swiftui: 'source-conformance', compose: 'source-conformance', flutter: 'source-conformance' },
  'evals/native-device/registry.json should be empty on a clean checkout — if this fails because it genuinely has verified runs now, update this assertion to match, don\'t just delete it',
);
assert.ok(claims.nativeEvidence.summary.includes('source-conformance-only across all 4 platforms'));
assert.deepStrictEqual(futureShippedClaims(claims), []);

for (const [relative, expected] of compile().expected) {
  assert.strictEqual(fs.readFileSync(path.join(ROOT, relative), 'utf8'), expected, `${relative} drifted`);
}

console.log('public-claims: package, rules, recipes, stacks, fixtures, assertions, dependencies, eval, native status and generated targets clean');
