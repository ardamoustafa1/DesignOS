#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const MAX_BYTES = 512 * 1024;
const MAX_SKEW_MS = 60_000;

function signature(secret, timestamp, body) { return crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex'); }
function safeEqual(left, right) { const a = Buffer.from(left || '', 'hex'); const b = Buffer.from(right || '', 'hex'); return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b); }
function run(file, args, timeout = 55_000) { return new Promise((resolve, reject) => execFile(process.execPath, [file, ...args], { cwd: ROOT, timeout, maxBuffer: 2 * 1024 * 1024 }, (error, stdout, stderr) => error ? reject(new Error(stderr || stdout || error.message)) : resolve(stdout))); }

async function inspectArtifact(artifact, options = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-gate-'));
  const html = path.join(directory, 'artifact.html');
  const browser = path.join(directory, 'browser.json');
  const profile = path.join(directory, 'profile.json');
  const temporal = path.join(directory, 'temporal.json');
  try {
    fs.writeFileSync(html, artifact, { flag: 'wx' });
    await run(path.join(ROOT, 'bin/browser-gate.js'), [html, '--out', browser, '--screenshots', path.join(directory, 'screenshots')]).catch(() => undefined);
    await run(path.join(ROOT, 'bin/motion-profiler.js'), [html, '--selector', 'body', '--duration', '1200', '--cpu-rate', '4', '--out', profile]).catch(() => undefined);
    await run(path.join(ROOT, 'bin/temporal-motion.js'), [html, '--selector', '[data-motion-role="arrival"]', '--duration', '700', '--out', temporal]).catch(() => undefined);
    const browserReport = JSON.parse(fs.readFileSync(browser, 'utf8'));
    const profileReport = JSON.parse(fs.readFileSync(profile, 'utf8'));
    const temporalReport = JSON.parse(fs.readFileSync(temporal, 'utf8'));
    const summary = browserReport.summary || {};
    const metrics = profileReport.metrics || profileReport.summary || {};
    const p95FrameMs = metrics.p95FrameMs ?? metrics.frameTimeMs?.p95;
    const axTreesCollected = browserReport.results?.filter(result => Array.isArray(result.accessibilityTree) && result.accessibilityTree.length > 0).length || 0;
    const axeRuns = browserReport.results?.filter(result => result.axe?.testEngine).length || 0;
    const temporalPassed = temporalReport.passed === true || temporalReport.summary?.passed === true;
    const checks = [
      { id: 'artifact-browser', label: 'Artifact browser matrix', status: summary.passed && summary.tasksDeclared > 0 && summary.tasksPassed === summary.tasksDeclared ? 'PASS' : 'FAIL', score: summary.passed && summary.tasksDeclared > 0 && summary.tasksPassed === summary.tasksDeclared ? 100 : 0, evidence: `${summary.scenarios || 0} scenarios; ${summary.tasksPassed || 0}/${summary.tasksDeclared || 0} tasks; P1 ${summary.p1 || 0}; P2 ${summary.p2 || 0}` },
      { id: 'artifact-accessibility', label: 'Artifact accessibility evidence', status: axTreesCollected >= 20 && axeRuns >= 20 ? 'PASS' : 'FAIL', score: axTreesCollected >= 20 && axeRuns >= 20 ? 100 : 0, evidence: `${axTreesCollected} AX trees; ${axeRuns} Axe runs; zoom-only scenarios use geometry evidence` },
      { id: 'artifact-motion-parity', label: 'Full/reduced temporal parity', status: temporalPassed ? 'PASS' : 'FAIL', score: temporalPassed ? 100 : 0, evidence: temporalPassed ? 'Temporal full/reduced evidence passed' : 'Temporal evidence incomplete or failed' },
      { id: 'artifact-performance', label: '4× CPU motion performance', status: Number(p95FrameMs) <= 20 && Number(metrics.droppedFrameRatio) <= 0.05 && metrics.cleanup?.leakFree === true ? 'PASS' : 'FAIL', score: Number(p95FrameMs) <= 20 && Number(metrics.droppedFrameRatio) <= 0.05 && metrics.cleanup?.leakFree === true ? 100 : 0, evidence: `p95 ${p95FrameMs ?? 'NA'}ms; dropped ${metrics.droppedFrameRatio ?? 'NA'}; cleanup ${metrics.cleanup?.leakFree === true ? 'clean' : 'failed'}` },
    ];
    return { schema: 'designos.artifact-evidence/v1', artifactDigest: crypto.createHash('sha256').update(artifact).digest('hex'), isolated: true, generatedAt: new Date().toISOString(), checks, passed: checks.every(check => check.status === 'PASS'), raw: options.includeRaw ? { browser: browserReport, profile: profileReport, temporal: temporalReport } : undefined };
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

async function handle(request, response, secret = process.env.DESIGNOS_GATE_WORKER_SECRET || '') {
  if (request.method === 'GET' && request.url === '/health') return void response.end(JSON.stringify({ ok: true, isolation: 'process+browser' }));
  if (request.method !== 'POST' || request.url !== '/v1/gate') { response.writeHead(404); return void response.end(); }
  let body = ''; request.setEncoding('utf8');
  request.on('data', chunk => { body += chunk; if (Buffer.byteLength(body) > MAX_BYTES) request.destroy(new Error('PAYLOAD_TOO_LARGE')); });
  request.on('end', async () => {
    const timestamp = request.headers['x-designos-timestamp'];
    const supplied = request.headers['x-designos-signature'];
    if (!secret || !timestamp || Math.abs(Date.now() - Number(timestamp)) > MAX_SKEW_MS || !safeEqual(supplied, signature(secret, timestamp, body))) { response.writeHead(401); return void response.end(JSON.stringify({ error: 'INVALID_SIGNATURE' })); }
    try {
      const payload = JSON.parse(body);
      if (typeof payload.artifact !== 'string' || Buffer.byteLength(payload.artifact) > MAX_BYTES) throw new Error('INVALID_ARTIFACT');
      const report = await inspectArtifact(payload.artifact);
      response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify(report));
    } catch (error) { response.writeHead(422, { 'content-type': 'application/json' }); response.end(JSON.stringify({ error: error.message })); }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8788);
  http.createServer((request, response) => handle(request, response)).listen(port, '127.0.0.1', () => console.log(`DesignOS artifact gate worker listening on 127.0.0.1:${port}`));
}

module.exports = { MAX_BYTES, signature, safeEqual, inspectArtifact, handle };
