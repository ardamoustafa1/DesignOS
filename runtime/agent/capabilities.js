'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '../..');

const AGENTS = Object.freeze({
  claude:      { label: 'Claude Code', rules: ['CLAUDE.md'], native: ['rules', 'commands', 'subagents'], runtime: true },
  codex:       { label: 'OpenAI Codex', rules: ['AGENTS.md'], native: ['rules'], runtime: true },
  cursor:      { label: 'Cursor', rules: ['.cursor/rules/designos.mdc', '.cursorrules'], native: ['rules'], runtime: true },
  copilot:     { label: 'GitHub Copilot', rules: ['.github/copilot-instructions.md'], native: ['rules'], runtime: true },
  antigravity: { label: 'Google Antigravity', rules: ['AGENTS.md', '.agent/rules/designos.md'], native: ['rules'], runtime: true },
  kimi:        { label: 'Kimi Code', rules: ['AGENTS.md'], native: ['portable-rules'], runtime: true },
  hermes:      { label: 'Hermes Agent', rules: ['AGENTS.md'], native: ['portable-rules'], runtime: true },
  gemini:      { label: 'Gemini CLI', rules: ['GEMINI.md'], native: ['rules'], runtime: true },
  opencode:    { label: 'OpenCode', rules: ['.opencode/rules/designos.md'], native: ['rules'], runtime: true },
  cline:       { label: 'Cline', rules: ['.clinerules'], native: ['rules'], runtime: true },
  windsurf:    { label: 'Windsurf / Devin Desktop', rules: ['.windsurf/rules/designos.md', '.windsurfrules'], native: ['rules'], runtime: true },
  aider:       { label: 'Aider', rules: ['CONVENTIONS.md'], native: ['rules'], runtime: true },
  kiro:        { label: 'Kiro', rules: ['.kiro/steering/designos.md'], native: ['rules'], runtime: true },
  trae:        { label: 'Trae', rules: ['.trae/rules/designos.md'], native: ['rules'], runtime: true },
  grok:        { label: 'Grok Build', rules: ['.grok/rules/designos.md'], native: ['rules'], runtime: true },
  pi:          { label: 'Pi', rules: ['.pi/context/designos.md'], native: ['rules'], runtime: true },
  qoder:       { label: 'Qoder', rules: ['.qoder/context.md'], native: ['rules'], runtime: true },
  rovodev:     { label: 'Rovo Dev', rules: ['.rovo/designos.md'], native: ['rules'], runtime: true },
  vibe:        { label: 'Vibe Coding', rules: ['.vibe/rules/designos.md'], native: ['rules'], runtime: true },
  amp:         { label: 'Amp', rules: ['.amp/designos.md'], native: ['rules'], runtime: true },
  zed:         { label: 'Zed AI', rules: ['.zed/designos.md'], native: ['rules'], runtime: true },
  roo:         { label: 'Roo Code', rules: ['.roo/rules/designos.md'], native: ['rules'], runtime: true },
  junie:       { label: 'JetBrains Junie', rules: ['.junie/guidelines.md'], native: ['rules'], runtime: true },
  amazonq:     { label: 'Amazon Q Developer', rules: ['.amazonq/rules/designos.md'], native: ['rules'], runtime: true },
  continue:    { label: 'Continue', rules: ['.continue/rules/designos.md'], native: ['portable-rules'], runtime: true },
});

const RUNTIME_CAPABILITIES = Object.freeze([
  'kernel-boot', 'deterministic-routing', 'capability-report', 'gate-execution',
  'panel-contracts', 'project-memory', 'motion-intelligence',
]);

function kernelDigest(root = ROOT) {
  const source = fs.readFileSync(path.join(root, 'CLAUDE.md'));
  return `sha256:${crypto.createHash('sha256').update(source).digest('hex')}`;
}

function report(agent, root = ROOT) {
  const entry = AGENTS[agent];
  if (!entry) throw new Error(`Unknown agent "${agent}". Expected: ${Object.keys(AGENTS).join(', ')}`);
  return {
    agent,
    label: entry.label,
    kernelDigest: kernelDigest(root),
    rules: entry.rules,
    nativeCapabilities: entry.native,
    runtimeCapabilities: entry.runtime ? RUNTIME_CAPABILITIES : [],
    outcomeParity: entry.runtime,
    parityMeaning: 'Same DesignOS kernel, routing, memory and executable gates through the runtime; host-native UI, model behavior and native subagent APIs may still differ.',
  };
}

module.exports = { AGENTS, RUNTIME_CAPABILITIES, ROOT, kernelDigest, report };
