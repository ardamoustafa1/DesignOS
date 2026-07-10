#!/usr/bin/env node
/**
 * DesignOS installer & toolkit — zero dependencies.
 *
 * IMPORTANT: "designos" is NOT published to the npm registry, and the bare name
 * already belongs to an unrelated package there. Bare `npx designos <command>`
 * will silently run THAT package, not this one — never invoke it that way.
 *
 * First install (fetches this exact GitHub repo, unambiguous):
 *   npx github:ardamoustafa1/DesignOS init [--agents] [--skills]
 *
 * Every command after that (runs the copy `init` placed at ./DesignOS/bin/):
 *   node DesignOS/bin/designos.js agents
 *   node DesignOS/bin/designos.js skills
 *   node DesignOS/bin/designos.js export <target>   cursor · copilot · windsurf · cline · aider · all
 *   node DesignOS/bin/designos.js audit <dir>
 *   node DesignOS/bin/designos.js doctor
 *   node DesignOS/bin/designos.js help
 */
const fs = require('fs');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');
const CWD = process.cwd();
const SKIP = new Set(['.git', 'node_modules', '.DS_Store']);
const RUN = 'node DesignOS/bin/designos.js'; // the one safe, unambiguous invocation form

const log = (msg) => console.log(`  ${msg}`);
const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const warn = (msg) => console.log(`  \x1b[33m!\x1b[0m ${msg}`);
const fail = (msg) => { console.error(`  \x1b[31m✗\x1b[0m ${msg}`); process.exit(1); };

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function init(flags) {
  const target = path.join(CWD, 'DesignOS');
  if (path.resolve(target) === PKG_ROOT) fail('Run this from your project directory, not from inside DesignOS itself.');
  if (fs.existsSync(target) && !flags.force) {
    fail('./DesignOS already exists. Re-run with --force to overwrite.');
  }
  copyDir(PKG_ROOT, target);
  ok('DesignOS copied to ./DesignOS (including bin/ — that copy is now your CLI entry point)');

  const claudeMd = path.join(CWD, 'CLAUDE.md');
  const importLine = '@DesignOS/CLAUDE.md';
  if (fs.existsSync(claudeMd)) {
    const body = fs.readFileSync(claudeMd, 'utf8');
    if (body.includes(importLine)) {
      warn('CLAUDE.md already imports DesignOS — left untouched');
    } else {
      fs.appendFileSync(claudeMd, `\n${importLine}\n`);
      ok('Added import to existing CLAUDE.md');
    }
  } else {
    fs.writeFileSync(claudeMd, `# Project Instructions\n\n${importLine}\n`);
    ok('Created CLAUDE.md with DesignOS import');
  }

  if (flags.agents) registerAgents();
  if (flags.skills) installSkills();

  console.log('\n  DesignOS is live. Try:\n');
  log('\x1b[36m"Design a Stripe-level SaaS landing page."\x1b[0m');
  log('The agent boots the kernel, routes modules, runs the Design Loop,');
  log('and refuses to ship anything scoring under 95.\n');
  log(`Health check: ${RUN} doctor · Other agents: ${RUN} export all`);
  log('(Not "npx designos …" — that name belongs to an unrelated npm package.)');
}

function registerAgents() {
  const srcAgents = path.join(PKG_ROOT, 'agents');
  const destAgents = path.join(CWD, '.claude', 'agents');
  fs.mkdirSync(destAgents, { recursive: true });
  let n = 0;
  for (const f of fs.readdirSync(srcAgents)) {
    if (!f.endsWith('.md')) continue;
    fs.copyFileSync(path.join(srcAgents, f), path.join(destAgents, f));
    n++;
  }
  ok(`Registered ${n} subagents in .claude/agents/ (reviewer, accessibility, ...)`);
}

function installSkills() {
  const srcSkills = path.join(PKG_ROOT, 'skills');
  if (!fs.existsSync(srcSkills)) return warn('skills/ not found in package — skipped');
  const destCmds = path.join(CWD, '.claude', 'commands');
  fs.mkdirSync(destCmds, { recursive: true });
  let n = 0;
  for (const f of fs.readdirSync(srcSkills)) {
    if (!f.endsWith('.md') || f === 'README.md') continue;
    fs.copyFileSync(path.join(srcSkills, f), path.join(destCmds, f));
    n++;
  }
  ok(`Installed ${n} slash commands in .claude/commands/ (/design-review, /design-score, ...)`);
}

/* ---------- export: rules files for other agents ---------- */
const EXPORT_TARGETS = {
  cursor:   { file: '.cursorrules',                        label: 'Cursor' },
  copilot:  { file: '.github/copilot-instructions.md',     label: 'GitHub Copilot' },
  windsurf: { file: '.windsurfrules',                      label: 'Windsurf' },
  cline:    { file: '.clinerules',                         label: 'Cline' },
  aider:    { file: 'CONVENTIONS.md',                      label: 'Aider' },
};

function exportRules(targetName) {
  const kernelPath = path.join(CWD, 'DesignOS', 'CLAUDE.md');
  const srcKernel = fs.existsSync(kernelPath) ? kernelPath : path.join(PKG_ROOT, 'CLAUDE.md');
  if (!fs.existsSync(srcKernel)) fail(`Kernel not found — run "npx github:ardamoustafa1/DesignOS init" first.`);
  const kernel = fs.readFileSync(srcKernel, 'utf8');

  const names = targetName === 'all' ? Object.keys(EXPORT_TARGETS) : [targetName];
  if (!names.every(n => EXPORT_TARGETS[n])) {
    fail(`Unknown export target "${targetName}" — use: ${Object.keys(EXPORT_TARGETS).join(' · ')} · all`);
  }
  const header = [
    `<!-- Generated by \`${RUN} export\` — DesignOS kernel follows. -->`,
    '<!-- The module files it routes to live in ./DesignOS/ — keep that folder in the repo. -->',
    '<!-- Regenerate after upgrading DesignOS. Do not edit by hand; edit DesignOS/CLAUDE.md. -->',
    '',
  ].join('\n');

  for (const n of names) {
    const t = EXPORT_TARGETS[n];
    const dest = path.join(CWD, t.file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, header + kernel);
    ok(`${t.label} → ${t.file}`);
  }
  log('\n  Note: these agents read the rules file but load DesignOS modules from ./DesignOS/.');
}

/* ---------- audit: run all validators against a target ---------- */
function audit(target) {
  const { spawnSync } = require('child_process');
  const dir = target || 'src';
  if (!fs.existsSync(path.join(CWD, dir))) fail(`Target "${dir}" not found — usage: ${RUN} audit <dir> [token-file]`);
  const vdir = fs.existsSync(path.join(CWD, 'DesignOS', 'validators'))
    ? path.join(CWD, 'DesignOS', 'validators')
    : path.join(PKG_ROOT, 'validators');
  const tokenFile = process.argv[4] && !process.argv[4].startsWith('--') ? [process.argv[4]] : [];

  log(`auditing ${dir} …\n`);
  let failures = 0;
  const run = (label, args) => {
    console.log(`  \x1b[36m▸ ${label}\x1b[0m`);
    const r = spawnSync('node', args, { stdio: 'inherit', cwd: CWD });
    if (r.status !== 0) failures++;
    console.log('');
  };
  run('token drift', [path.join(vdir, 'check-drift.js'), dir, ...tokenFile]);
  run('a11y basics', [path.join(vdir, 'check-a11y-basics.js'), dir]);

  if (failures) fail(`${failures} validator(s) reported findings — the mechanical floor is not clear.`);
  ok('audit clean — the mechanical floor holds. The six-dimension review still applies above it.');
}

/* ---------- doctor: install health ---------- */
function doctor() {
  let problems = 0;
  const check = (cond, okMsg, failMsg, critical = true) => {
    if (cond) ok(okMsg);
    else { (critical ? fail : warn)(failMsg); if (!critical) problems++; }
  };

  const dir = path.join(CWD, 'DesignOS');
  if (!fs.existsSync(dir)) fail('./DesignOS not found — run "npx github:ardamoustafa1/DesignOS init" from your project root.');
  ok('./DesignOS present');

  const kernel = path.join(dir, 'CLAUDE.md');
  check(fs.existsSync(kernel), 'kernel (DesignOS/CLAUDE.md) present', 'kernel missing — reinstall with --force');

  const localBin = path.join(dir, 'bin', 'designos.js');
  if (fs.existsSync(localBin)) ok('local CLI present at DesignOS/bin/designos.js (the safe invocation path)');
  else warn(`DesignOS/bin/designos.js missing — re-run init to get the local CLI copy (don't rely on bare "npx designos")`);

  const claudeMd = path.join(CWD, 'CLAUDE.md');
  if (fs.existsSync(claudeMd) && fs.readFileSync(claudeMd, 'utf8').includes('@DesignOS/CLAUDE.md')) {
    ok('CLAUDE.md imports the kernel');
  } else { warn('CLAUDE.md does not import @DesignOS/CLAUDE.md — the agent will not boot the system'); problems++; }

  const agentsDir = path.join(CWD, '.claude', 'agents');
  const agentCount = fs.existsSync(agentsDir) ? fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length : 0;
  if (agentCount >= 9) ok(`${agentCount} subagents registered`);
  else { warn(`subagents: ${agentCount}/9 — run "${RUN} agents" for the independent reviewer`); problems++; }

  const cmdsDir = path.join(CWD, '.claude', 'commands');
  const cmdCount = fs.existsSync(cmdsDir) ? fs.readdirSync(cmdsDir).filter(f => f.startsWith('design-')).length : 0;
  if (cmdCount > 0) ok(`${cmdCount} DesignOS slash commands installed`);
  else { warn(`no slash commands — run "${RUN} skills" for /design-review etc.`); problems++; }

  const mem = path.join(CWD, 'memory');
  if (fs.existsSync(path.join(mem, 'brand.md'))) ok('project memory/ bootstrapped');
  else { warn('memory/ not bootstrapped — the agent creates it at first kickoff (or: cp DesignOS/memory/templates/*.md memory/)'); problems++; }

  const pkgJsonPath = path.join(PKG_ROOT, 'package.json');
  const pkgVersion = fs.existsSync(pkgJsonPath) ? JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).version : '(unknown)';
  log(`\n  DesignOS ${pkgVersion} · ${problems === 0 ? '\x1b[32mall systems go\x1b[0m' : `\x1b[33m${problems} advisory item(s)\x1b[0m`}`);
}

function help() {
  console.log(`
  DesignOS — the Design Intelligence Operating System for AI coding agents

  ⚠ "designos" is already taken on the npm registry by an unrelated package.
    Bare "npx designos <command>" will run THAT package, not this one.

  First install (unambiguous — fetches this exact GitHub repo):
    npx github:ardamoustafa1/DesignOS init [--agents] [--skills] [--force]

  Every command after that (uses the local copy init placed at DesignOS/bin/):
    ${RUN} agents             only register subagents
    ${RUN} skills             only install slash commands
    ${RUN} export <target>    rules for: cursor · copilot · windsurf · cline · aider · all
    ${RUN} audit <dir>        run all validators against a directory
    ${RUN} doctor             check the install's health
`);
}

const [, , cmd, ...rest] = process.argv;
const flags = {
  agents: rest.includes('--agents'),
  skills: rest.includes('--skills'),
  force: rest.includes('--force'),
};

console.log('');
switch (cmd) {
  case 'init': init(flags); break;
  case 'agents': registerAgents(); break;
  case 'skills': installSkills(); break;
  case 'export': exportRules(rest.find(a => !a.startsWith('--')) || 'all'); break;
  case 'audit': audit(rest.find(a => !a.startsWith('--'))); break;
  case 'doctor': doctor(); break;
  case 'help':
  case undefined: help(); break;
  default: fail(`Unknown command "${cmd}" — try: ${RUN} help`);
}
