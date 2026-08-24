'use strict';

function fingerprint(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) { hash ^= input.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

async function executeGeneration({ ir, maxAttempts = 3, initialState = { completeMotionContract: false }, render, evaluate, repair }) {
  const attempts = [];
  let state = Object.freeze({ ...initialState });
  let previous = null;
  for (let number = 1; number <= maxAttempts; number += 1) {
    const artifact = await render(ir, state);
    const digest = fingerprint(artifact);
    if (digest === previous) {
      attempts.push(Object.freeze({ attempt: number, result: 'FAIL', fingerprint: digest, repair: 'Stopped: repair produced no material change', evidence: [] }));
      break;
    }
    previous = digest;
    const evidence = await evaluate(artifact, ir);
    const passed = evidence.every(item => item.status === 'PASS' && Number(item.score) >= 95);
    const failedIds = evidence.filter(item => item.status !== 'PASS' || Number(item.score) < 95).map(item => item.id);
    attempts.push(Object.freeze({ attempt: number, result: passed ? 'PASS' : 'FAIL', fingerprint: digest, repair: passed ? 'No further repair required' : `Finding-directed repair: ${failedIds.join(', ') || 'unknown'}`, evidence: Object.freeze(evidence.map(item => Object.freeze({ ...item }))) }));
    if (passed) return Object.freeze({ artifact, ir, attempts: Object.freeze(attempts), evidence, passed: true });
    state = Object.freeze(await repair({ ir, state, failedIds, evidence, attempt: number }));
  }
  return Object.freeze({ artifact: null, ir, attempts: Object.freeze(attempts), evidence: attempts.at(-1)?.evidence || [], passed: false });
}

module.exports = { fingerprint, executeGeneration };
