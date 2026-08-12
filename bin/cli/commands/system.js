'use strict';

const fs = require('fs');
const path = require('path');

function doctorSelf(context) {
  // Running from inside the DesignOS source repo itself (cwd === pkgRoot) — there is no
  // nested ./DesignOS install to look for; check the source tree's own structure instead.
  let problems = 0;
  const check = (condition, okMessage, failMessage, critical = true) => {
    if (condition) context.ok(okMessage);
    else {
      (critical ? context.fail : context.warn)(failMessage);
      if (!critical) problems += 1;
    }
  };
  context.ok('running inside the DesignOS source repo (self-check mode)');
  check(fs.existsSync(path.join(context.cwd, 'CLAUDE.md')), 'kernel (CLAUDE.md) present', 'kernel missing at repo root', false);
  check(fs.existsSync(path.join(context.cwd, 'bin/designos.js')), 'local CLI present at bin/designos.js', 'bin/designos.js missing', false);
  const pwPath = path.join(context.cwd, 'node_modules/playwright');
  if (fs.existsSync(pwPath)) context.ok('playwright dependency installed');
  else { context.warn('playwright not installed — run "npm install"'); problems += 1; }
  const manifest = path.join(context.pkgRoot, 'package.json');
  const version = fs.existsSync(manifest) ? JSON.parse(fs.readFileSync(manifest, 'utf8')).version : '(unknown)';
  context.log(`\n  DesignOS ${version} (source repo) · ${problems === 0 ? '\x1b[32mall systems go\x1b[0m' : `\x1b[33m${problems} advisory item(s)\x1b[0m`}`);
}

function doctor(context) {
  if (context.cwd === context.pkgRoot) return doctorSelf(context);
  let problems = 0;
  const check = (condition, okMessage, failMessage, critical = true) => {
    if (condition) context.ok(okMessage);
    else {
      (critical ? context.fail : context.warn)(failMessage);
      if (!critical) problems += 1;
    }
  };
  const dir = path.join(context.cwd, 'DesignOS');
  if (!fs.existsSync(dir)) context.fail('./DesignOS not found — run "npx github:ardamoustafa1/DesignOS init" from your project root.');
  context.ok('./DesignOS present');
  check(fs.existsSync(path.join(dir, 'CLAUDE.md')), 'kernel (DesignOS/CLAUDE.md) present', 'kernel missing — reinstall with --force');
  if (fs.existsSync(path.join(dir, 'bin/designos.js'))) context.ok('local CLI present at DesignOS/bin/designos.js (the safe invocation path)');
  else context.warn('DesignOS/bin/designos.js missing — re-run init to get the local CLI copy');
  const claude = path.join(context.cwd, 'CLAUDE.md');
  if (fs.existsSync(claude) && fs.readFileSync(claude, 'utf8').includes('@DesignOS/CLAUDE.md')) context.ok('CLAUDE.md imports the kernel');
  else { context.warn('CLAUDE.md does not import @DesignOS/CLAUDE.md — the agent will not boot the system'); problems += 1; }
  const agents = path.join(context.cwd, '.claude/agents');
  const agentCount = fs.existsSync(agents) ? fs.readdirSync(agents).filter(file => file.endsWith('.md')).length : 0;
  if (agentCount >= 9) context.ok(`${agentCount} subagents registered`);
  else { context.warn(`subagents: ${agentCount}/9 — run "${context.run} agents"`); problems += 1; }
  const commands = path.join(context.cwd, '.claude/commands');
  const commandCount = fs.existsSync(commands) ? fs.readdirSync(commands).filter(file => file.startsWith('design-')).length : 0;
  if (commandCount) context.ok(`${commandCount} DesignOS slash commands installed`);
  else { context.warn(`no slash commands — run "${context.run} skills"`); problems += 1; }
  if (fs.existsSync(path.join(context.cwd, 'memory/brand.md'))) context.ok('project memory/ bootstrapped');
  else { context.warn('memory/ not bootstrapped'); problems += 1; }
  const manifest = path.join(context.pkgRoot, 'package.json');
  const version = fs.existsSync(manifest) ? JSON.parse(fs.readFileSync(manifest, 'utf8')).version : '(unknown)';
  context.log(`\n  DesignOS ${version} · ${problems === 0 ? '\x1b[32mall systems go\x1b[0m' : `\x1b[33m${problems} advisory item(s)\x1b[0m`}`);
}

function hooks(args, context) {
  const action = context.positionals(args)[0] || 'status';
  const mode = context.argValue(args, '--mode', 'warn');
  const hookPath = path.join(context.pkgRoot, 'hooks/designos-hook.js');
  const configPath = path.join(context.cwd, '.designos/config.json');
  const manifests = {
    codex: {
      file: path.join(context.cwd, '.codex/hooks.json'),
      value: { hooks: {
        PostToolUse: [{ matcher: 'Edit|Write|apply_patch', hooks: [{ type: 'command', command: `DESIGNOS_HOOK_MODE=${mode} node "${hookPath}"`, timeout: 8, statusMessage: 'DesignOS edit gate' }] }],
        Stop: [{ hooks: [{ type: 'command', command: `DESIGNOS_HOOK_MODE=deep-on-stop node "${hookPath}"`, timeout: 120, statusMessage: 'DesignOS browser gate' }] }],
      } },
    },
    github: {
      file: path.join(context.cwd, '.github/hooks/designos.json'),
      value: { version: 1, hooks: { postToolUse: [{ type: 'command', matcher: 'edit|create|apply_patch', bash: `DESIGNOS_HOOK_MODE=${mode} node "${hookPath}"`, timeoutSec: 8 }] } },
    },
    claude: {
      file: path.join(context.cwd, '.claude/settings.local.json'),
      value: { hooks: {
        PostToolUse: [{ matcher: 'Edit|Write', hooks: [{ type: 'command', command: `DESIGNOS_HOOK_MODE=${mode} node "${hookPath}"`, timeout: 8 }] }],
        Stop: [{ hooks: [{ type: 'command', command: `DESIGNOS_HOOK_MODE=deep-on-stop node "${hookPath}"`, timeout: 120 }] }],
      } },
    },
  };
  if (action === 'status') {
    for (const [name, manifest] of Object.entries(manifests)) {
      context.log(`${name}: ${fs.existsSync(manifest.file) ? 'installed' : 'not installed'} (${path.relative(context.cwd, manifest.file)})`);
    }
    return;
  }
  if (action !== 'install') context.fail(`Unknown hooks action "${action}". Use hooks install or hooks status.`);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
  config.hook = { ...(config.hook || {}), mode, target: context.argValue(args, '--target', config.hook?.target || '') };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  for (const [name, manifest] of Object.entries(manifests)) {
    fs.mkdirSync(path.dirname(manifest.file), { recursive: true });
    if (fs.existsSync(manifest.file)) {
      const existing = JSON.parse(fs.readFileSync(manifest.file, 'utf8'));
      if (existing.hooks && JSON.stringify(existing.hooks) !== JSON.stringify(manifest.value.hooks)) {
        context.warn(`${name}: existing hook manifest preserved; merge manually (${path.relative(context.cwd, manifest.file)})`);
        continue;
      }
    }
    fs.writeFileSync(manifest.file, JSON.stringify(manifest.value, null, 2) + '\n');
    context.ok(`${name} hook installed`);
  }
}

function help(context) {
  console.log(`
  DesignOS — the Design Intelligence Operating System for AI coding agents

  First install:
    npx github:ardamoustafa1/DesignOS init [--agents] [--skills] [--force]

  Core:
    ${context.run} improve <target> --brief "<product/surface>" [--deep]
    ${context.run} audit <target>
    ${context.run} review <target> [--fix-prompt]
    ${context.run} visual <target>
    ${context.run} report <target>
    ${context.run} elevate <target>
    ${context.run} brief [options] [--interactive]
    ${context.run} find <query>
    ${context.run} suggest <brief>
    ${context.run} starter <name>

  Discover: atlas [query] [--category <type>] [--motion 1-10] · knowledge · coverage

  Intelligence: motion-decide · motion-recipe · signature · compose · asset-direct
  Motion: motion-lab [--profile] · motion-profile · motion-regression --selector <css>
          motion-playground [--out playground.html] · scroll-animate · signature-compile
  Direction: live <html> (component AST variants, gates, transactions, rollback)
  Product engines:
    adapter-conformance · motion-graph · motion-torture · genome
    composition-compile · responsive-solve · state-matrix · mutation-test
    consistency · native-motion
  Evidence:
    ${context.run} golden [--update]
    ${context.run} eval <slug>
    ${context.run} case <slug>
    npm run pack:evidence
  System: agents · skills · export · hooks · doctor · help

  Run ${context.run} <command> with the documented flags in README.md.
  ⚠ Bare "npx designos" refers to an unrelated registry package; use the local CLI path.
`);
}

module.exports = { doctor, hooks, help };
