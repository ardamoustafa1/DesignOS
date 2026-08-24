#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { AGENTS, ROOT, kernelDigest, report } = require('./capabilities');
const { graphNodes } = require('../../bin/intelligence');

const workspace = path.resolve(process.env.DESIGNOS_WORKSPACE || process.cwd());
const installedRoot = path.join(workspace, 'DesignOS');
const designosRoot = fs.existsSync(path.join(installedRoot, 'CLAUDE.md')) ? installedRoot
  : fs.existsSync(path.join(workspace, 'CLAUDE.md')) && fs.existsSync(path.join(workspace, 'bin', 'designos.js')) ? workspace : ROOT;
const MEMORY_FILES = new Set(['client.md', 'brand.md', 'design.md', 'pages.md', 'todo.md', 'bugs.md', 'notes.md']);

const tools = [
  { name: 'designos_boot', description: 'Return the binding DesignOS boot contract and kernel identity.', inputSchema: { type: 'object', properties: {} } },
  { name: 'designos_route', description: 'Route a brief to relevant DesignOS modules, validators and recipes.', inputSchema: { type: 'object', required: ['brief'], properties: { brief: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 12 } } } },
  { name: 'designos_capabilities', description: 'Report native and runtime-backed capabilities for an agent.', inputSchema: { type: 'object', required: ['agent'], properties: { agent: { type: 'string', enum: Object.keys(AGENTS) } } } },
  { name: 'designos_panel', description: 'Return the mandatory UI, accessibility and adversarial-review panel contracts.', inputSchema: { type: 'object', required: ['brief'], properties: { brief: { type: 'string' } } } },
  { name: 'designos_review', description: 'Run the deterministic DesignOS review for a workspace-local target.', inputSchema: { type: 'object', required: ['target'], properties: { target: { type: 'string' }, min: { type: 'integer', minimum: 1, maximum: 100 } } } },
  { name: 'designos_memory_append', description: 'Append a dated decision to an allowed DesignOS project-memory file.', inputSchema: { type: 'object', required: ['file', 'entry'], properties: { file: { type: 'string', enum: ['client.md', 'brand.md', 'design.md', 'pages.md', 'todo.md', 'bugs.md', 'notes.md'] }, entry: { type: 'string' } } } },
];

const textResult = value => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] });
const tokens = value => String(value).toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 1);

function boot() {
  const files = ['brain/design-intelligence.md', 'brain/decision-framework.md', 'brain/brief-compiler.md', 'loops/design-loop.md', 'scoring/rubric.md', 'workflows/final-gate.md'];
  return { kernelDigest: kernelDigest(designosRoot), designosRoot, sequence: files.map((file, index) => ({ order: index + 1, file, exists: fs.existsSync(path.join(designosRoot, file)) })), rule: 'Load routed modules, run the design loop, then execute—not invent—the final gate.' };
}

function route(brief, limit = 8) {
  const query = tokens(brief);
  return graphNodes().map(node => {
    const haystack = tokens(`${node.label} ${node.type} ${node.file} ${node.text || ''}`);
    const score = query.reduce((sum, token) => sum + (haystack.includes(token) ? (node.label.includes(token) ? 6 : 1) : 0), 0);
    return { type: node.type, label: node.label, file: node.file, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.file.localeCompare(b.file)).slice(0, Math.max(1, Math.min(12, limit)));
}

function safeTarget(input) {
  const target = path.resolve(workspace, input);
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Target must stay inside the workspace.');
  if (!fs.existsSync(target)) throw new Error(`Target not found: ${input}`);
  return relative || '.';
}

function runReview(args) {
  const target = safeTarget(args.target);
  const cli = path.join(designosRoot, 'bin/designos.js');
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, 'review', target, '--min', String(args.min || 95), '--json', '--no-fail'], { cwd: workspace, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ executed: true, exitCode: code, target, stdout: stdout.trim(), stderr: stderr.trim() }));
  });
}

async function call(name, args = {}) {
  if (name === 'designos_boot') return boot();
  if (name === 'designos_route') return { brief: args.brief, modules: route(args.brief, args.limit) };
  if (name === 'designos_capabilities') return report(args.agent, designosRoot);
  if (name === 'designos_panel') return { brief: args.brief, execution: 'Run each contract in an independent host context when available; otherwise label the review DEGRADED.', panel: [
    { role: 'ui-designer', contract: 'Audit hierarchy, composition, materiality, typography and responsive behavior. Return evidence-linked findings.' },
    { role: 'accessibility', contract: 'Audit WCAG 2.2 AA, keyboard, focus, semantics, reduced motion and zoom. Return reproducible findings.' },
    { role: 'reviewer', contract: 'Adversarially score the artifact using scoring/rubric.md. Never self-certify; quote executed gate evidence.' },
  ] };
  if (name === 'designos_review') return runReview(args);
  if (name === 'designos_memory_append') {
    if (!MEMORY_FILES.has(args.file)) throw new Error('Memory file is not allow-listed.');
    if (!String(args.entry || '').trim()) throw new Error('Memory entry must not be empty.');
    const dir = fs.existsSync(path.join(workspace, 'memory')) ? path.join(workspace, 'memory') : path.join(workspace, 'DesignOS', 'memory');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, args.file);
    const date = new Date().toISOString().slice(0, 10);
    fs.appendFileSync(file, `\n- ${date} — ${String(args.entry).trim()}\n`);
    return { written: path.relative(workspace, file), date };
  }
  throw new Error(`Unknown tool: ${name}`);
}

async function handle(message) {
  if (message.method === 'initialize') return { protocolVersion: '2025-06-18', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'designos-universal-runtime', version: '1.0.0' } };
  if (message.method === 'tools/list') return { tools };
  if (message.method === 'tools/call') return textResult(await call(message.params?.name, message.params?.arguments || {}));
  if (message.method?.startsWith('notifications/')) return undefined;
  throw new Error(`Method not found: ${message.method}`);
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/); buffer = lines.pop();
  for (const line of lines.filter(Boolean)) {
    let message;
    try { message = JSON.parse(line); } catch (error) { process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: error.message } })}\n`); continue; }
    Promise.resolve(handle(message)).then(result => {
      if (message.id !== undefined && result !== undefined) process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: message.id, result })}\n`);
    }).catch(error => {
      if (message.id !== undefined) process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: message.id, error: { code: -32603, message: error.message } })}\n`);
    });
  }
});

module.exports = { boot, route, safeTarget, call, handle, tools };
