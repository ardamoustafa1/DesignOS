'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { AGENTS } = require('../../../runtime/agent/capabilities');

const JSON_CONFIGS = Object.freeze({
  claude: { file: '.mcp.json', key: 'mcpServers' },
  cursor: { file: '.cursor/mcp.json', key: 'mcpServers' },
  copilot: { file: '.vscode/mcp.json', key: 'servers' },
  antigravity: { file: '.agent/mcp.json', key: 'mcpServers' },
  kimi: { file: '.kimi/mcp.json', key: 'mcpServers' },
  hermes: { file: '.hermes/mcp.json', key: 'mcpServers' },
  gemini: { file: '.gemini/settings.json', key: 'mcpServers' },
  opencode: { file: '.opencode/mcp.json', key: 'mcpServers' },
  cline: { file: '.cline/mcp.json', key: 'mcpServers' },
  windsurf: { file: '.windsurf/mcp.json', key: 'mcpServers' },
  kiro: { file: '.kiro/settings/mcp.json', key: 'mcpServers' },
  trae: { file: '.trae/mcp.json', key: 'mcpServers' },
  roo: { file: '.roo/mcp.json', key: 'mcpServers' },
  junie: { file: '.junie/mcp/mcp.json', key: 'mcpServers' },
  amazonq: { file: '.amazonq/mcp.json', key: 'mcpServers' },
});

function runtimeEntry(context) {
  return { command: process.execPath, args: [path.join(context.pkgRoot, 'runtime/agent/server.js')], env: { DESIGNOS_WORKSPACE: context.cwd } };
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') return {};
    throw new Error(`${path.relative(process.cwd(), file)} is not valid JSON; left untouched.`);
  }
}

function writeJsonAdapter(agent, context) {
  const adapter = JSON_CONFIGS[agent] || { file: `.designos/agents/${agent}.mcp.json`, key: 'mcpServers' };
  const file = path.join(context.cwd, adapter.file);
  const config = readJson(file);
  config[adapter.key] = { ...(config[adapter.key] || {}), designos: runtimeEntry(context) };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
  return adapter.file;
}

function writeCodex(context) {
  const relative = '.codex/config.toml';
  const file = path.join(context.cwd, relative);
  let content = '';
  try { content = fs.readFileSync(file, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const begin = '# DESIGNOS:MCP:BEGIN'; const end = '# DESIGNOS:MCP:END';
  const server = path.join(context.pkgRoot, 'runtime/agent/server.js').replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  const cwd = context.cwd.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  const block = `${begin}\n[mcp_servers.designos]\ncommand = "${process.execPath}"\nargs = ["${server}"]\n[mcp_servers.designos.env]\nDESIGNOS_WORKSPACE = "${cwd}"\n${end}`;
  if (content.includes(begin) && content.includes(end)) content = content.slice(0, content.indexOf(begin)) + block + content.slice(content.indexOf(end) + end.length);
  else content = `${content.trimEnd()}${content.trim() ? '\n\n' : ''}${block}\n`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return relative;
}

function install(agent, context) {
  if (!AGENTS[agent]) context.fail(`Unknown agent "${agent}" — use: ${Object.keys(AGENTS).join(' · ')}`);
  if (agent === 'codex') writeCodex(context); else writeJsonAdapter(agent, context);
  if (agent === 'claude') {
    const file = path.join(context.cwd, 'CLAUDE.md');
    let body = '';
    try { body = fs.readFileSync(file, 'utf8'); } catch (_) { /* create */ }
    if (!body.includes('@DesignOS/CLAUDE.md') && path.resolve(context.cwd) !== context.pkgRoot) fs.writeFileSync(file, `${body.trimEnd()}${body.trim() ? '\n\n' : ''}@DesignOS/CLAUDE.md\n`);
  } else {
    const exported = spawnSync(process.execPath, [path.join(context.pkgRoot, 'bin/designos.js'), 'export', agent], { cwd: context.cwd, encoding: 'utf8' });
    if (exported.status !== 0) context.fail(exported.stderr || exported.stdout || `Could not export ${agent} rules.`);
  }
  context.ok(`${AGENTS[agent].label}: rules + project MCP runtime installed without replacing unrelated config.`);
  return doctor(agent, context);
}

function configExists(agent, context) {
  const file = agent === 'codex' ? '.codex/config.toml' : (JSON_CONFIGS[agent]?.file || `.designos/agents/${agent}.mcp.json`);
  const absolute = path.join(context.cwd, file);
  if (!fs.existsSync(absolute)) return { file, installed: false };
  const body = fs.readFileSync(absolute, 'utf8');
  return { file, installed: agent === 'codex' ? body.includes('[mcp_servers.designos]') : body.includes('"designos"') };
}

function uninstall(agent, context) {
  if (!AGENTS[agent]) context.fail(`Unknown agent "${agent}".`);
  if (agent === 'codex') {
    const file = path.join(context.cwd, '.codex/config.toml');
    let body = '';
    try { body = fs.readFileSync(file, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const begin = '# DESIGNOS:MCP:BEGIN'; const end = '# DESIGNOS:MCP:END';
    if (body.includes(begin) && body.includes(end)) {
      const next = (body.slice(0, body.indexOf(begin)) + body.slice(body.indexOf(end) + end.length)).replace(/\n{3,}/g, '\n\n').trim();
      fs.writeFileSync(file, next ? `${next}\n` : '');
    }
  } else {
    const adapter = JSON_CONFIGS[agent] || { file: `.designos/agents/${agent}.mcp.json`, key: 'mcpServers' };
    const file = path.join(context.cwd, adapter.file);
    if (fs.existsSync(file)) {
      const config = readJson(file);
      if (config[adapter.key] && typeof config[adapter.key] === 'object') delete config[adapter.key].designos;
      fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
    }
  }
  context.ok(`${AGENTS[agent].label}: DesignOS MCP entry removed; project rules were preserved to avoid deleting shared instructions.`);
}

function handshake(context) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [path.join(context.pkgRoot, 'runtime/agent/server.js')], { cwd: context.cwd, stdio: ['pipe', 'pipe', 'ignore'], env: { ...process.env, DESIGNOS_WORKSPACE: context.cwd } });
    let output = ''; const timeout = setTimeout(() => { child.kill(); resolve(false); }, 2500);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      output += chunk;
      if (!output.includes('\n')) return;
      clearTimeout(timeout); child.kill();
      try { resolve(JSON.parse(output.trim().split(/\r?\n/)[0]).result?.serverInfo?.name === 'designos-universal-runtime'); } catch (_) { resolve(false); }
    });
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })}\n`);
  });
}

async function doctor(agent, context) {
  if (!AGENTS[agent]) context.fail(`Unknown agent "${agent}".`);
  const config = configExists(agent, context);
  const rules = AGENTS[agent].rules.some(file => fs.existsSync(path.join(context.cwd, file)) || fs.existsSync(path.join(context.pkgRoot, file)));
  const runtime = await handshake(context);
  const report = { agent, config: config.installed, configFile: config.file, rules, runtimeHandshake: runtime, ready: config.installed && rules && runtime };
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    for (const [label, value] of [['MCP config', report.config], ['Rules', report.rules], ['Runtime handshake', report.runtimeHandshake]]) console.log(`  ${value ? '✓' : '✗'} ${label}`);
    console.log(`\n  ${report.ready ? 'READY' : 'NOT READY'} · ${AGENTS[agent].label}`);
  }
  if (!report.ready) process.exitCode = 1;
  return report;
}

function execute(args, context) {
  const [actionOrAgent, maybeAgent] = context.positionals(args);
  const action = ['install', 'uninstall', 'doctor'].includes(actionOrAgent) ? actionOrAgent : 'install';
  const agent = action === 'install' && actionOrAgent !== 'install' ? actionOrAgent : maybeAgent;
  if (!agent) context.fail(`Usage: ${context.run} agent install <agent> | agent uninstall <agent> | agent doctor <agent>`);
  if (action === 'doctor') return doctor(agent, context);
  if (action === 'uninstall') return uninstall(agent, context);
  return install(agent, context);
}

module.exports = { execute, install, uninstall, doctor, runtimeEntry, JSON_CONFIGS };
