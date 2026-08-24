#!/usr/bin/env node
'use strict';
const assert = require('assert');
const { loadSystem, routeModules, buildDesignIR, executeGeneration } = require('../runtime/generation/core');

(async () => {
  const system = loadSystem('kiln');
  const plan = { family: 'editorial-ledger', productName: 'Proof', eyebrow: 'Trace', headline: 'Decide with evidence.', summary: 'A test.', proof: ['A', 'B', 'C'] };
  const ir = buildDesignIR({ brief: 'A cybersecurity landing page for operators', system, plan, variation: 0 });
  assert.equal(ir.schema, 'designos.design-ir/v1');
  assert.ok(routeModules(ir.brief).includes('industries/cybersecurity.md'));
  const result = await executeGeneration({ ir, render: (_value, state) => state.fixed ? '<main data-ready></main>' : '<main></main>', evaluate: artifact => [{ id: 'ready', status: artifact.includes('data-ready') ? 'PASS' : 'FAIL', score: artifact.includes('data-ready') ? 100 : 0 }], repair: ({ state }) => ({ ...state, fixed: true }) });
  assert.equal(result.passed, true);
  assert.equal(result.attempts.length, 2);
  assert.notEqual(result.attempts[0].fingerprint, result.attempts[1].fingerprint);
  assert.ok(Object.isFrozen(result.ir));
  console.log('generation-core: system → routing → immutable IR → render → finding repair passes');
})().catch(error => { console.error(error); process.exit(1); });
