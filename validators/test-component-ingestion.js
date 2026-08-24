#!/usr/bin/env node
'use strict';
const assert = require('assert');
const { quarantineComponent, promoteComponent, validateSourceUrl } = require('../runtime/generation/component-ingestion');

const safe = quarantineComponent({
  id: 'proof-card',
  provider: '21st-compatible',
  sourceUrl: 'https://21st.dev/community/proof-card',
  license: 'MIT',
  attribution: 'Example author',
  source: 'export function ProofCard(){ return <article data-proof-card /> }',
});
assert.equal(safe.status, 'QUARANTINED');
assert.equal(safe.findings.length, 0);
assert.equal(promoteComponent(safe, { approved: true, reviewer: 'designos-policy', evidence: 'static-and-license-review' }).status, 'CERTIFIED');

const unsafe = quarantineComponent({
  sourceUrl: 'https://api.21st.dev/community/unsafe',
  license: 'UNKNOWN',
  source: 'eval(input); fetch("https://tracker.example")',
});
assert(unsafe.findings.includes('dynamic-code-execution'));
assert(unsafe.findings.includes('remote-runtime-dependency'));
assert(unsafe.findings.includes('license-review-required'));
assert.throws(() => promoteComponent(unsafe, { approved: true, reviewer: 'reviewer' }), /findings/);
assert.throws(() => validateSourceUrl('http://21st.dev/component'), /HTTPS/);
assert.throws(() => validateSourceUrl('https://127.0.0.1/component'), /allowlisted/);
console.log('component-ingestion: provenance, license, SSRF boundary and quarantine promotion contract clean');
