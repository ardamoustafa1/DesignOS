#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { RULES } = require('../validators/rule-registry');

const ROOT = path.resolve(__dirname, '..');

function validRun(run) {
  const ruleIds = new Set(RULES.map(rule => rule.id));
  const evidence = run.evidence || {};
  return Boolean(
    run.id &&
    run.evaluator?.organization &&
    run.evaluator?.independentFromMaintainer === true &&
    run.blindProtocol?.briefsHiddenUntilSubmission === true &&
    run.blindProtocol?.expectedFindingsHidden === true &&
    (evidence.url || (evidence.file && evidence.sha256)) &&
    Array.isArray(run.results) &&
    run.results.length &&
    run.results.every(result => ruleIds.has(result.ruleId) && typeof result.passed === 'boolean')
  );
}

function verifyExternalRegistry(file = path.join(ROOT, 'evals/external/registry.json')) {
  const registry = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = (registry.runs || []).map(run => {
    let evidenceHashValid = true;
    if (run.evidence?.file) {
      const evidenceFile = path.resolve(path.dirname(file), run.evidence.file);
      evidenceHashValid = fs.existsSync(evidenceFile) &&
        crypto.createHash('sha256').update(fs.readFileSync(evidenceFile)).digest('hex') === run.evidence.sha256;
    }
    return { id: run.id, valid: validRun(run) && evidenceHashValid, evidenceHashValid };
  });
  return {
    schema: 1,
    externalEval: rows.some(row => row.valid),
    validRuns: rows.filter(row => row.valid).length,
    invalidRuns: rows.filter(row => !row.valid).length,
    rows,
  };
}

if (require.main === module) {
  const report = verifyExternalRegistry(process.argv[2] ? path.resolve(process.argv[2]) : undefined);
  console.log(JSON.stringify(report, null, 2));
  if (report.invalidRuns) process.exit(1);
}

module.exports = { validRun, verifyExternalRegistry };
