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

/* Editor/agent hook manifests. Every one of these is advisory in the strictest sense —
 * the tool's own binary decides whether to honor it, and DesignOS cannot reach into a
 * closed-source app and force that. What we CAN do is (a) place the manifest at the
 * exact path/schema the tool documents, verified against its current primary docs
 * rather than guessed, and (b) tell the truth about a tool's own limits — an unverified
 * or feature-flagged mechanism is labeled as such rather than asserted as "just works",
 * which is exactly the mistake `export codex` used to make with `.codex/instructions.md`.
 * The one mechanism that is NOT advisory is the git hook below (installGitHook) — it
 * runs on every commit regardless of which tool produced the diff, because it checks
 * the artifact, not the agent's behavior.
 */
function hooks(args, context) {
  const action = context.positionals(args)[0] || 'status';
  const mode = context.argValue(args, '--mode', 'warn');
  const hookPath = path.join(context.pkgRoot, 'hooks/designos-hook.js');
  const configPath = path.join(context.cwd, '.designos/config.json');
  const manifests = {
    claude: {
      // The one manifest verified from first-hand knowledge of the mechanism, not
      // third-party docs — this is Claude Code's own hook schema.
      file: path.join(context.cwd, '.claude/settings.local.json'),
      confidence: 'confirmed',
      value: { hooks: {
        PostToolUse: [{ matcher: 'Edit|Write', hooks: [{ type: 'command', command: `DESIGNOS_HOOK_MODE=${mode} node "${hookPath}"`, timeout: 8 }] }],
        Stop: [{ hooks: [{ type: 'command', command: `DESIGNOS_HOOK_MODE=deep-on-stop node "${hookPath}"`, timeout: 120 }] }],
      } },
    },
    codex: {
      // developers.openai.com/codex/hooks (fetched 2026-08): PreToolUse/PostToolUse
      // matchers accept `apply_patch`, `Edit`, or `Write` for file edits (not Bash-only,
      // despite some third-party writeups). Requires the hooks feature enabled in the
      // user's own ~/.codex/config.toml — DesignOS cannot flip that from here, so
      // `hooks install` prints the prerequisite instead of silently no-op'ing.
      file: path.join(context.cwd, '.codex/hooks.json'),
      confidence: 'confirmed, but requires a feature flag DesignOS cannot set for you',
      prerequisite: 'Enable Codex hooks first: add `[features]\\nhooks = true` to ~/.codex/config.toml (flag name has moved across Codex versions — check `codex --help` if this manifest silently does nothing).',
      value: { hooks: {
        PostToolUse: [{ matcher: 'Edit|Write|apply_patch', hooks: [{ type: 'command', command: `DESIGNOS_HOOK_MODE=${mode} node "${hookPath}"`, timeout: 8, statusMessage: 'DesignOS edit gate' }] }],
        Stop: [{ hooks: [{ type: 'command', command: `DESIGNOS_HOOK_MODE=deep-on-stop node "${hookPath}"`, timeout: 120, statusMessage: 'DesignOS browser gate' }] }],
      } },
    },
    cursor: {
      // cursor.com/docs/hooks (fetched 2026-08): project-level config at
      // .cursor/hooks.json, top-level {version, hooks}. preToolUse is one of the events
      // that can actually block (return a decision) — afterFileEdit cannot, so this is
      // NOT the same hook Cursor's own docs list as "informational only". failClosed is
      // tied to --mode block so a crashing hook doesn't silently fail open when the
      // point was enforcement.
      file: path.join(context.cwd, '.cursor/hooks.json'),
      confidence: 'confirmed',
      value: { version: 1, hooks: {
        preToolUse: [{ matcher: 'edit|write|apply_patch', command: `DESIGNOS_HOOK_MODE=${mode} node "${hookPath}"`, type: 'command', timeout: 8, failClosed: mode === 'block' }],
        stop: [{ command: `DESIGNOS_HOOK_MODE=deep-on-stop node "${hookPath}"`, type: 'command', timeout: 120 }],
      } },
    },
    antigravity: {
      // antigravity.google/docs/hooks (fetched 2026-08): schema and exact directory
      // name were still hedged in Google's own docs at fetch time ("e.g. .agents/ ...
      // doesn't mandate a single location"). Written to .agent/hooks.json to match the
      // .agent/rules/ convention `export antigravity` already uses, but treat this one
      // as best-effort — verify with `hooks status` after an Antigravity session
      // actually fires it, not before.
      file: path.join(context.cwd, '.agent/hooks.json'),
      confidence: 'best-effort — schema not fully confirmed at time of writing',
      value: { 'designos-edit-gate': { enabled: true, PreToolUse: [
        { matcher: 'edit_file|write_file|apply_patch', hooks: [{ command: `DESIGNOS_HOOK_MODE=${mode} node "${hookPath}"`, timeout: 8 }] },
      ] } },
    },
    github: {
      // docs.github.com/copilot/.../cloud-agent/use-hooks (fetched 2026-08): this is
      // the GitHub Copilot CLOUD coding agent's hook mechanism specifically — it does
      // NOT apply to the interactive VS Code/JetBrains Copilot extension, which has no
      // documented hook mechanism as of this writing. Config must live on the repo's
      // default branch to take effect for the cloud agent.
      file: path.join(context.cwd, '.github/hooks/designos.json'),
      confidence: 'confirmed, but scoped to the Copilot cloud coding agent only — not the IDE extension',
      value: { postToolUse: [{ bash: `DESIGNOS_HOOK_MODE=${mode} node "${hookPath}"`, matcher: 'edit|create|apply_patch', timeoutSec: 8 }] },
    },
  };
  if (action === 'status') {
    for (const [name, manifest] of Object.entries(manifests)) {
      context.log(`${name}: ${fs.existsSync(manifest.file) ? 'installed' : 'not installed'} (${path.relative(context.cwd, manifest.file)}) — ${manifest.confidence}`);
    }
    context.log(`git: ${gitHookInstalled(context) ? 'installed' : 'not installed'} — the tool-agnostic layer; run "hooks install --git" (see hooks install --help)`);
    return;
  }
  if (action !== 'install') context.fail(`Unknown hooks action "${action}". Use hooks install or hooks status.`);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  // Single read-and-catch-ENOENT, not existsSync()-then-readFileSync() — see the note on
  // installGitHook below (js/file-system-race).
  let config = {};
  try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (_) { /* first run */ }
  config.hook = { ...(config.hook || {}), mode, target: context.argValue(args, '--target', config.hook?.target || '') };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  for (const [name, manifest] of Object.entries(manifests)) {
    fs.mkdirSync(path.dirname(manifest.file), { recursive: true });
    let existingManifest = null;
    try { existingManifest = JSON.parse(fs.readFileSync(manifest.file, 'utf8')); } catch (_) { /* does not exist yet, or unparsable — either way, safe to (re)write below */ }
    if (existingManifest && existingManifest.hooks && JSON.stringify(existingManifest.hooks) !== JSON.stringify(manifest.value.hooks)) {
      context.warn(`${name}: existing hook manifest preserved; merge manually (${path.relative(context.cwd, manifest.file)})`);
      continue;
    }
    fs.writeFileSync(manifest.file, JSON.stringify(manifest.value, null, 2) + '\n');
    context.ok(`${name} hook installed (${manifest.confidence})`);
    if (manifest.prerequisite) context.warn(`  ${name}: ${manifest.prerequisite}`);
  }
  if (args.includes('--git')) installGitHook(context, mode, args);
  else context.log('\n  Every manifest above is advisory — the tool decides whether to honor it.\n  For enforcement that does not depend on any tool\'s cooperation, also run:\n    node DesignOS/bin/designos.js hooks install --git\n  That blocks the COMMIT itself if changed UI files fail review, regardless of\n  which agent (or human) wrote them.');
}

/* ---------- the one enforcement layer that isn't advisory ----------
 * A vendor hook is a request the tool's own binary can ignore, skip, or never have
 * implemented for the surface that actually changed the file (Cursor's afterFileEdit
 * cannot block at all; Codex's hooks are off by default; there is no hook mechanism for
 * a dozen of the smaller export targets at all). A git pre-commit hook has none of
 * those escape hatches: it runs on every commit, from every tool, including a human
 * typing code by hand, because it inspects the diff about to be committed rather than
 * trusting an agent's own behavior. This is the actual answer to "can we force it." */
function gitHookPath(context) {
  const husky = path.join(context.cwd, '.husky');
  if (fs.existsSync(husky)) return path.join(husky, 'pre-commit');
  return path.join(context.cwd, '.git', 'hooks', 'pre-commit');
}

function gitHookInstalled(context) {
  const p = gitHookPath(context);
  return fs.existsSync(p) && fs.readFileSync(p, 'utf8').includes('DESIGNOS_GIT_HOOK');
}

function installGitHook(context, mode, args) {
  if (!fs.existsSync(path.join(context.cwd, '.git')) && !fs.existsSync(path.join(context.cwd, '.husky'))) {
    context.warn('git: not a git repository (no .git/) — skipped');
    return;
  }
  const dest = gitHookPath(context);
  const min = context.argValue(args, '--review-min', '95');
  const script = [
    '#!/bin/sh',
    '# DESIGNOS_GIT_HOOK — installed by `designos hooks install --git`.',
    '# Blocks the commit if staged UI files fail the deterministic DesignOS review,',
    '# regardless of which AI tool (or human) produced the diff. Do not hand-edit;',
    '# re-run the install command after upgrading DesignOS.',
    '',
    'if [ -n "$DESIGNOS_SKIP_HOOK" ]; then exit 0; fi',
    '',
    'cli="DesignOS/bin/designos.js"',
    'if [ ! -f "$cli" ]; then',
    '  echo "DesignOS git hook: $cli not found — commit blocked." >&2',
    '  echo "Reinstall DesignOS, or bypass once with DESIGNOS_SKIP_HOOK=1 git commit ..." >&2',
    '  exit 1',
    'fi',
    '',
    "files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(html|jsx?|tsx?|vue|svelte)$')",
    'if [ -z "$files" ]; then exit 0; fi',
    '',
    'fail=0',
    'for f in $files; do',
    '  [ -f "$f" ] || continue',
    `  node "$cli" review "$f" --min "\${DESIGNOS_REVIEW_MIN:-${min}}" || fail=1`,
    'done',
    '',
    'if [ "$fail" -eq 1 ]; then',
    '  echo "" >&2',
    '  echo "DesignOS review found findings below the threshold on staged UI files — commit blocked." >&2',
    '  echo "Fix them, or bypass once with: DESIGNOS_SKIP_HOOK=1 git commit ..." >&2',
    '  exit 1',
    'fi',
    'exit 0',
    '',
  ].join('\n');
  // Single read-and-catch-ENOENT instead of existsSync()-then-readFileSync(): see the
  // matching fix in bin/designos.js's exportRules() for why (js/file-system-race).
  let existingHook = null;
  try { existingHook = fs.readFileSync(dest, 'utf8'); } catch (_) { /* does not exist yet */ }
  if (existingHook !== null && !existingHook.includes('DESIGNOS_GIT_HOOK')) {
    context.warn(`git: ${path.relative(context.cwd, dest)} exists and is not DesignOS-generated — merge manually (mode: ${mode})`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, script, { mode: 0o755 });
  fs.chmodSync(dest, 0o755);
  context.ok(`git pre-commit hook installed (${path.relative(context.cwd, dest)}) — this one is not advisory, it blocks the commit`);
}

function help(context) {
  console.log(`
  DesignOS — the Design Intelligence Operating System for AI coding agents

  First install:
    npx github:ardamoustafa1/DesignOS init [--agents] [--skills] [--force]

  Core:
    ${context.run} improve <target> --brief "<product/surface>" [--deep]
    ${context.run} ship <target> [--surface portfolio]
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
  Universal agents:
    ${context.run} agent install <agent>
    ${context.run} agent uninstall <agent>
    ${context.run} agent doctor <agent> [--json]
    ${context.run} agent-runtime status [agent|all] [--json]
    ${context.run} agent-runtime config [--out designos-mcp.json]
    ${context.run} agent-runtime serve
  System: agents · skills · export · hooks · doctor · help
  Catalog: system-certify [--json] [--write]

  Run ${context.run} <command> with the documented flags in README.md.
  ⚠ Bare "npx designos" refers to an unrelated registry package; use the local CLI path.
`);
}

module.exports = { doctor, hooks, help };
