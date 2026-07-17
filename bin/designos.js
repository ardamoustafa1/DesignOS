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
 *   node DesignOS/bin/designos.js review <file-or-dir> [--min 95] [--json] [--no-fail]
 *   node DesignOS/bin/designos.js brief [--type landing] [--industry saas] [--audience "CFOs"] [--goal "book demos"]
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
const VALUE_FLAGS = new Set(['--min', '--type', '--industry', '--audience', '--goal', '--tone', '--constraints', '--out']);

function argValue(args, name, fallback = '') {
  const inline = args.find(arg => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1) || fallback;
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  return args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
}

function firstPositional(args) {
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('--')) return args[i];
    if (VALUE_FLAGS.has(args[i])) i++;
  }
  return undefined;
}

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

/* ---------- review: deterministic design-risk report for CI and local use ---------- */
const REVIEW_EXT = /\.(html|css|jsx?|tsx?|vue|svelte|mdx)$/;

function* walkReviewFiles(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) {
      if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(e)) continue;
      yield* walkReviewFiles(path.join(p, e));
    }
  } else if (REVIEW_EXT.test(p)) {
    yield p;
  }
}

function lineOf(src, idx) {
  return src.slice(0, idx).split('\n').length;
}

function lineAt(src, idx) {
  return src.slice(0, idx).split('\n').pop() || '';
}

function pushFinding(findings, file, line, dimension, severity, code, message) {
  findings.push({ file, line, dimension, severity, code, message });
}

function analyzeDesignFile(absFile, root) {
  const raw = fs.readFileSync(absFile, 'utf8');
  const rel = path.relative(root, absFile) || path.basename(absFile);
  const findings = [];
  const lower = raw.toLowerCase();
  const isUiSurface = /\.(html|jsx?|tsx?|vue|svelte|mdx)$/.test(absFile);

  for (const m of raw.matchAll(/<(img)\b(?![^>]*\balt=)[^>]*>/gi)) {
    pushFinding(findings, rel, lineOf(raw, m.index), 'Accessibility', 'P1', 'img-no-alt', 'Image is missing alt text.');
  }
  for (const m of raw.matchAll(/<(button|a)\b([^>]*)>(\s*)<\/\1>/gi)) {
    pushFinding(findings, rel, lineOf(raw, m.index), 'UX Flow', 'P1', 'empty-control', 'Interactive control has no visible label.');
  }
  for (const m of raw.matchAll(/<(div|span)\b[^>]*\bonclick=/gi)) {
    pushFinding(findings, rel, lineOf(raw, m.index), 'Accessibility', 'P1', 'nonsemantic-click', `${m[1]} uses onclick; prefer a semantic button/link.`);
  }
  if (absFile.endsWith('.html') && !/<main[\s>]/i.test(raw)) {
    pushFinding(findings, rel, 1, 'Accessibility', 'P2', 'missing-main', 'HTML page has no <main> landmark.');
  }
  if (absFile.endsWith('.html') && !/<h1[\s>]/i.test(raw)) {
    pushFinding(findings, rel, 1, 'UX Flow', 'P2', 'missing-h1', 'HTML page has no <h1>; hierarchy may be unclear.');
  }

  for (const m of raw.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const line = lineAt(raw, m.index);
    if (/(color|background|border|fill|stroke|shadow|outline|gradient)/i.test(line) && !line.includes('drift-ok')) {
      pushFinding(findings, rel, lineOf(raw, m.index), 'UI Craft', 'P2', 'raw-color', `${m[0]} appears inline; prefer a token or documented exception.`);
    }
  }
  for (const m of raw.matchAll(/(?:margin|padding|gap|inset)[\w-]*\s*:\s*([^;}"']+)/gi)) {
    const line = lineAt(raw, m.index);
    if (line.includes('drift-ok')) continue;
    for (const px of m[1].matchAll(/\b(\d+)px\b/g)) {
      const v = Number(px[1]);
      if (![0, 1, 2].includes(v) && v % 4 !== 0) {
        pushFinding(findings, rel, lineOf(raw, m.index), 'UI Craft', 'P2', 'off-grid-spacing', `${v}px spacing is off the 4px grid.`);
      }
    }
  }
  for (const m of raw.matchAll(/outline\s*:\s*(none|0)/gi)) {
    const near = raw.split('\n').slice(Math.max(0, lineOf(raw, m.index) - 4), lineOf(raw, m.index) + 3).join(' ');
    if (!/:focus-visible|outline-offset|box-shadow/.test(near)) {
      pushFinding(findings, rel, lineOf(raw, m.index), 'Accessibility', 'P1', 'focus-removed', 'Focus outline removed without an obvious replacement.');
    }
  }

  const weakContrast = /#[a-fA-F0-9]{3,8}|rgba?\(|opacity\s*:/g;
  for (const m of raw.matchAll(weakContrast)) {
    const token = m[0].toLowerCase();
    if (/(#999|#aaa|#bbb|#ccc|opacity\s*:\s*0\.[0-5]|rgba?\([^)]*,\s*0\.[0-5]\))/.test(token)) {
      pushFinding(findings, rel, lineOf(raw, m.index), 'Accessibility', 'P2', 'contrast-risk', 'Muted/transparent visual value may fail contrast; verify against the actual background.');
    }
  }

  const fakeProof = /(trusted by|used by|loved by|join \d|[\d,.]+\+?\s*(users|customers|teams|companies)|★★★★★|john d\.|acme corp|fortune 500)/gi;
  for (const m of raw.matchAll(fakeProof)) {
    pushFinding(findings, rel, lineOf(raw, m.index), 'Conversion', 'P1', 'proof-risk', `Proof claim "${m[0]}" needs a real source or should be removed.`);
  }

  if (isUiSurface && /<form|type=["']submit|button/i.test(raw) && !/(error|invalid|required|aria-invalid|loading|pending|disabled|success|empty)/i.test(raw)) {
    pushFinding(findings, rel, 1, 'UX Flow', 'P2', 'missing-states', 'Interactive surface appears to lack loading/error/disabled/success/empty states.');
  }
  if (isUiSurface && /(hero|pricing|dashboard|onboarding|checkout|signup|sign up|book demo)/i.test(raw) && !/(focus-visible|aria-|alt=|prefers-reduced-motion|loading|error|empty|disabled)/i.test(raw)) {
    pushFinding(findings, rel, 1, 'Modernity', 'P2', 'surface-thinness', 'Important UI surface lacks evidence of states, accessibility hooks, or motion safeguards.');
  }
  if (lower.includes('lorem ipsum')) {
    pushFinding(findings, rel, 1, 'Conversion', 'P2', 'placeholder-copy', 'Placeholder copy remains in the UI.');
  }

  return findings;
}

function summarizeReview(findings, files) {
  const dims = ['UI Craft', 'UX Flow', 'Accessibility', 'Performance', 'Modernity', 'Conversion'];
  const scores = Object.fromEntries(dims.map(d => [d, 100]));
  const weights = { P0: 25, P1: 12, P2: 5 };
  for (const f of findings) {
    scores[f.dimension] = Math.max(0, scores[f.dimension] - weights[f.severity]);
  }
  const overall = Math.min(...Object.values(scores));
  return { filesReviewed: files.length, findingCount: findings.length, scores, overall };
}

function printReviewMarkdown(report) {
  console.log('# DesignOS Review\n');
  console.log(`Files reviewed: ${report.summary.filesReviewed}`);
  console.log(`Findings: ${report.summary.findingCount}`);
  console.log(`Overall gate: ${report.summary.overall}/100\n`);
  console.log('| Dimension | Score |');
  console.log('|---|---:|');
  for (const [dim, score] of Object.entries(report.summary.scores)) {
    console.log(`| ${dim} | ${score} |`);
  }
  if (!report.findings.length) {
    console.log('\nNo deterministic findings. Run the human/model review loop for taste, hierarchy, and fit.');
    return;
  }
  console.log('\n## Findings\n');
  for (const f of report.findings) {
    console.log(`- **${f.severity} ${f.dimension} / ${f.code}** — ${f.file}:${f.line} — ${f.message}`);
  }
}

function review(target, args) {
  const min = Number(argValue(args, '--min', '95'));
  const asJson = args.includes('--json');
  const noFail = args.includes('--no-fail');
  if (!target) fail(`Usage: ${RUN} review <file-or-dir> [--min 95] [--json] [--no-fail]`);
  const abs = path.resolve(CWD, target);
  if (!fs.existsSync(abs)) fail(`Review target not found: ${target}`);
  const files = [...walkReviewFiles(abs)];
  if (!files.length) fail(`No reviewable UI files found in ${target}`);
  const findings = files.flatMap(file => analyzeDesignFile(file, CWD));
  const summary = summarizeReview(findings, files);
  const report = { target, generatedAt: new Date().toISOString(), summary, findings };
  if (asJson) console.log(JSON.stringify(report, null, 2));
  else printReviewMarkdown(report);
  if (!noFail && summary.overall < min) process.exit(1);
}

/* ---------- brief: generate a high-signal DesignOS brief ---------- */
function brief(args) {
  const data = {
    type: argValue(args, '--type', '[surface: landing page / dashboard / pricing / onboarding / mobile app]'),
    industry: argValue(args, '--industry', '[industry]'),
    audience: argValue(args, '--audience', '[primary audience]'),
    goal: argValue(args, '--goal', '[one primary user/business goal]'),
    tone: argValue(args, '--tone', '[tone: calm, technical, premium, playful, etc.]'),
    constraints: argValue(args, '--constraints', '[stack, brand, compliance, deadline, content, accessibility constraints]'),
  };
  const out = [
    '# DesignOS Brief',
    '',
    `Design a ${data.type} for ${data.industry}.`,
    '',
    `Audience: ${data.audience}.`,
    `Primary goal: ${data.goal}.`,
    `Tone: ${data.tone}.`,
    `Constraints: ${data.constraints}.`,
    '',
    'Required process:',
    '- State which DesignOS modules you are loading and why.',
    '- Run research -> wireframe -> UI -> review -> accessibility -> performance -> refactor.',
    '- Score UI Craft, UX Flow, Accessibility, Performance, Modernity, and Conversion.',
    '- Redo any dimension under 95 before delivery.',
    '- Do not invent metrics, customers, testimonials, badges, urgency, or compliance claims.',
    '- Write durable decisions to memory/ after delivery.',
    '',
    'Deliverable:',
    '- A production-ready artifact plus scorecard, key decisions, and remaining risks.',
  ].join('\n');
  const outPath = argValue(args, '--out', '');
  if (outPath) {
    fs.writeFileSync(path.resolve(CWD, outPath), out + '\n');
    ok(`Brief written to ${outPath}`);
  } else {
    console.log(out);
  }
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
    ${RUN} review <target>    deterministic design-risk report + six-dimension score
    ${RUN} brief [options]    generate a high-signal brief for the agent
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
  case 'audit': audit(firstPositional(rest)); break;
  case 'review': review(firstPositional(rest), rest); break;
  case 'brief': brief(rest); break;
  case 'doctor': doctor(); break;
  case 'help':
  case undefined: help(); break;
  default: fail(`Unknown command "${cmd}" — try: ${RUN} help`);
}
