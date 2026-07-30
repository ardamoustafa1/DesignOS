#!/usr/bin/env node
/**
 * DesignOS installer & toolkit — Node-first, with Playwright for browser evidence.
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
 *   node DesignOS/bin/designos.js export <target>   cursor · copilot · windsurf · cline · aider · agentsmd · all
 *   node DesignOS/bin/designos.js audit <dir>
 *   node DesignOS/bin/designos.js detect [dir] [--rule <id>] [--json] [--out ledger.json]
 *   node DesignOS/bin/designos.js motion-gaps [dir] [--limit 7] [--json]   (advisory, never fails)
 *   node DesignOS/bin/designos.js review <file-or-dir> [--min 95] [--json] [--no-fail] [--fix-prompt]
 *   node DesignOS/bin/designos.js visual <file-or-url> [--out designos-visual-report.md]
 *   node DesignOS/bin/designos.js report <file-or-dir> [--min 95] [--out designos-report.md]
 *   node DesignOS/bin/designos.js elevate <file-or-dir> [--out designos-elevate-prompt.md]
 *   node DesignOS/bin/designos.js brief [--interactive] [--type landing] [--industry saas] [--audience "CFOs"] [--goal "book demos"]
 *   node DesignOS/bin/designos.js starter <name> [target-dir]
 *   node DesignOS/bin/designos.js eval <slug> [--agent cursor] [--brief B-001]
 *   node DesignOS/bin/designos.js case <slug> [--project "Acme"] [--url https://...]
 *   node DesignOS/bin/designos.js doctor
 *   node DesignOS/bin/designos.js help
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PKG_ROOT = path.resolve(__dirname, '..');
const CWD = process.cwd();
const SKIP = new Set(['.git', 'node_modules', '.DS_Store']);
const RUN = 'node DesignOS/bin/designos.js'; // the one safe, unambiguous invocation form

const log = (msg) => console.log(`  ${msg}`);
const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const warn = (msg) => console.log(`  \x1b[33m!\x1b[0m ${msg}`);
const fail = (msg) => { console.error(`  \x1b[31m✗\x1b[0m ${msg}`); process.exit(1); };
const VALUE_FLAGS = new Set([
  '--min',
  '--type',
  '--industry',
  '--audience',
  '--goal',
  '--tone',
  '--constraints',
  '--out',
  '--screenshots',
  '--agent',
  '--brief',
  '--runner',
  '--model',
  '--project',
  '--author',
  '--url',
  '--source',
  '--stack',
  '--surface',
  '--summary',
  '--limit',
  '--kind',
  '--max-diff',
  '--json-out',
  '--baseline-dir',
  '--frequency',
  '--purpose',
  '--initiator',
  '--interruptibility',
  '--cost',
  '--motion',
  '--material',
  '--audience',
  '--belief',
  '--variance',
  '--density',
  '--sector',
  '--platform',
  '--state',
  '--evidence',
  '--role',
  '--mode',
  '--aspect',
  '--port',
  '--accept',
  '--reject',
  '--reason',
  '--edits',
  '--target',
  '--rule',
  '--axis',
]);

function argValue(args, name, fallback = '') {
  const inline = args.find(arg => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1) || fallback;
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  return args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
}

function firstPositional(args) {
  return positionals(args)[0];
}

/** every non-flag argument, skipping the values consumed by value-taking flags */
function positionals(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('--')) { out.push(args[i]); continue; }
    if (VALUE_FLAGS.has(args[i]) && args[i + 1] && !args[i + 1].startsWith('--')) i++;
  }
  return out;
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

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort();
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
  agentsmd: { file: 'AGENTS.md',                           label: 'AGENTS.md standard (Codex · Gemini CLI · Amp · Zed · …)' },
};

// Directories the kernel's routing table and boot sequence reference by relative
// path (`foundations/x.md`, `brain/x.md`, ...). Non-Claude-Code rules files don't get
// Claude's `@import`-relative path resolution, so every reference must be rewritten to
// point at ./DesignOS/<dir>/... — the actual location `init` copies modules into.
const KERNEL_MODULE_DIRS = [
  'agents', 'brain', 'checklists', 'components', 'foundations', 'industries',
  'loops', 'memory', 'motion', 'native', 'patterns', 'psychology', 'references',
  'scoring', 'workflows',
];

function rewriteKernelPathsForExport(kernel) {
  const dirAlt = KERNEL_MODULE_DIRS.join('|');
  const re = new RegExp(`\\b(${dirAlt})/[a-zA-Z0-9_./-]+\\.md\\b`, 'g');
  return kernel.replace(re, (match) => `DesignOS/${match}`);
}

function exportRules(targetName, force) {
  const kernelPath = path.join(CWD, 'DesignOS', 'CLAUDE.md');
  const srcKernel = fs.existsSync(kernelPath) ? kernelPath : path.join(PKG_ROOT, 'CLAUDE.md');
  if (!fs.existsSync(srcKernel)) fail(`Kernel not found — run "npx github:ardamoustafa1/DesignOS init" first.`);
  const kernel = rewriteKernelPathsForExport(fs.readFileSync(srcKernel, 'utf8'));

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
    if (fs.existsSync(dest) && !fs.readFileSync(dest, 'utf8').includes('Generated by') && !force) {
      warn(`${t.file} exists and is not DesignOS-generated — skipped (re-run with --force to overwrite, or append the kernel by hand)`);
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, header + kernel);
    ok(`${t.label} → ${t.file}`);
  }
  log('\n  Note: these agents read the rules file but load DesignOS modules from ./DesignOS/.');
}

/* ---------- audit: run all validators against a target ---------- */
function audit(target) {
  const dir = target || 'src';
  if (!fs.existsSync(path.join(CWD, dir))) fail(`Target "${dir}" not found — usage: ${RUN} audit <dir> [token-file]`);
  const vdir = fs.existsSync(path.join(CWD, 'DesignOS', 'validators'))
    ? path.join(CWD, 'DesignOS', 'validators')
    : path.join(PKG_ROOT, 'validators');
  const ledger = path.join(CWD, '.designos', 'validator-ledger.json');
  const result = spawnSync(process.execPath, [
    path.join(vdir, 'run-registry.js'), dir, '--json-out', ledger,
  ], { stdio: 'inherit', cwd: CWD });
  if (result.status !== 0) fail('Registry-driven validator providers reported findings — the mechanical floor is not clear.');
  ok('audit clean — the mechanical floor holds. The six-dimension review still applies above it.');
}

/* ---------- starter: copy real starter files into a project ---------- */
function starter(name, args) {
  const startersDir = path.join(PKG_ROOT, 'starter');
  const names = listDirs(startersDir);
  if (!name || name === 'list') {
    console.log('Available DesignOS starters:\n');
    for (const n of names) console.log(`- ${n}`);
    console.log(`\nUsage: ${RUN} starter <name> [target-dir]`);
    return;
  }
  if (!names.includes(name)) fail(`Unknown starter "${name}". Use one of: ${names.join(' · ')}`);
  const targetArg = args.find((a, i) => i > 0 && !a.startsWith('--')) || name;
  const dest = path.resolve(CWD, targetArg);
  if (fs.existsSync(dest) && !args.includes('--force')) {
    fail(`${targetArg} already exists. Re-run with --force to overwrite.`);
  }
  copyDir(path.join(startersDir, name), dest);
  for (const token of ['tokens.css', 'tokens.json']) {
    const src = path.join(startersDir, token);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dest, token));
  }
  ok(`Starter "${name}" copied to ${path.relative(CWD, dest) || '.'}`);
  log(`Next: cd ${path.relative(CWD, dest) || '.'} && ${RUN} review . --no-fail`);
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
  const start = src.lastIndexOf('\n', idx) + 1;
  const end = src.indexOf('\n', idx);
  return src.slice(start, end === -1 ? src.length : end);
}

function windowAround(src, idx, radius = 180) {
  return src.slice(Math.max(0, idx - radius), Math.min(src.length, idx + radius));
}

function isWithinRootTokenBlock(src, idx) {
  const before = src.slice(0, idx);
  const root = before.lastIndexOf(':root');
  if (root === -1) return false;
  const open = src.indexOf('{', root);
  if (open === -1 || open > idx) return false;
  const close = src.indexOf('}', open);
  return close !== -1 && idx < close;
}

function isThemeColorMeta(src, idx) {
  const line = lineAt(src, idx);
  return /<meta\b[^>]*name=["']theme-color["'][^>]*>/i.test(line);
}

function hasInlineException(src, idx) {
  const near = windowAround(src, idx, 140);
  return /(drift-ok|token-ok|proof-ok):/i.test(near);
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
    pushFinding(findings, rel, lineOf(raw, m.index), 'UX & Flow', 'P1', 'empty-control', 'Interactive control has no visible label.');
  }
  for (const m of raw.matchAll(/<(div|span)\b[^>]*\bonclick=/gi)) {
    pushFinding(findings, rel, lineOf(raw, m.index), 'Accessibility', 'P1', 'nonsemantic-click', `${m[1]} uses onclick; prefer a semantic button/link.`);
  }
  if (absFile.endsWith('.html') && !/<main[\s>]/i.test(raw)) {
    pushFinding(findings, rel, 1, 'Accessibility', 'P2', 'missing-main', 'HTML page has no <main> landmark.');
  }
  if (absFile.endsWith('.html') && !/<h1[\s>]/i.test(raw)) {
    pushFinding(findings, rel, 1, 'UX & Flow', 'P2', 'missing-h1', 'HTML page has no <h1>; hierarchy may be unclear.');
  }

  for (const m of raw.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const line = lineAt(raw, m.index);
    if (
      /(color|background|border|fill|stroke|shadow|outline|gradient)/i.test(line) &&
      !hasInlineException(raw, m.index) &&
      !isWithinRootTokenBlock(raw, m.index) &&
      !isThemeColorMeta(raw, m.index)
    ) {
      pushFinding(findings, rel, lineOf(raw, m.index), 'UI Craft', 'P2', 'raw-color', `${m[0]} appears inline; prefer a token or documented exception.`);
    }
  }
  for (const m of raw.matchAll(/(?:margin|padding|gap|inset)[\w-]*\s*:\s*([^;}"']+)/gi)) {
    const line = lineAt(raw, m.index);
    if (/(drift-ok|token-ok):/i.test(line) || hasInlineException(raw, m.index)) continue;
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

  const fakeProof = /(trusted by|used by|loved by|join \d|[\d,.]+\+?\s*(users|customers|teams|companies)|★★★★★|john d\.|acme corp|fortune 500|soc 2 type ii|iso 27001|hipaa compliant|pci dss|gdpr compliant|mitre evaluations?)/gi;
  for (const m of raw.matchAll(fakeProof)) {
    if (hasInlineException(raw, m.index)) continue;
    pushFinding(findings, rel, lineOf(raw, m.index), 'Conversion', 'P1', 'proof-risk', `Proof claim "${m[0]}" needs a real source or should be removed.`);
  }
  const knownLogoProof = /(cloudflare|vercel|tailscale|linear|planetscale|supabase|stripe|apple|google|microsoft|netflix|airbnb)/gi;
  const proofSurface = raw.replace(
    /<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<link\b[^>]*>|<meta\b[^>]*>/gi,
    block => block.replace(/[^\n]/g, ' '),
  );
  for (const m of proofSurface.matchAll(knownLogoProof)) {
    const line = lineAt(raw, m.index);
    const near = windowAround(raw, m.index).toLowerCase();
    if (hasInlineException(raw, m.index)) continue;
    if (/\bstripe-level\b/i.test(line)) continue;
    if (/(logo|trusted|customer|testimonial|proof|used by|loved by)/i.test(line) || /logo-strip|logo-item|customer-logo/i.test(near)) {
      pushFinding(findings, rel, lineOf(raw, m.index), 'Conversion', 'P1', 'customer-proof-risk', `Customer/logo proof "${m[0]}" needs a real source or should be replaced with fictional/neutral wording.`);
    }
  }
  for (const m of raw.matchAll(/<blockquote\b[\s\S]*?<\/blockquote>/gi)) {
    const body = m[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (hasInlineException(raw, m.index)) continue;
    if (/(testimonial|customer|quote|what .* say|trusted|proof)/i.test(windowAround(raw, m.index, 260)) && body.length > 20) {
      pushFinding(findings, rel, lineOf(raw, m.index), 'Conversion', 'P1', 'quote-proof-risk', 'Blockquote appears to be proof/testimonial content; use a real source or normal explanatory copy.');
    }
  }

  if (isUiSurface && /<form|type=["']submit|button/i.test(raw) && !/(error|invalid|required|aria-invalid|loading|pending|disabled|success|empty)/i.test(raw)) {
    pushFinding(findings, rel, 1, 'UX & Flow', 'P2', 'missing-states', 'Interactive surface appears to lack loading/error/disabled/success/empty states.');
  }
  if (isUiSurface && /(hero|pricing|dashboard|onboarding|checkout|signup|sign up|book demo)/i.test(raw) && !/(focus-visible|aria-|alt=|prefers-reduced-motion|loading|error|empty|disabled)/i.test(raw)) {
    pushFinding(findings, rel, 1, 'Modernity', 'P2', 'surface-thinness', 'Important UI surface lacks evidence of states, accessibility hooks, or motion safeguards.');
  }
  if (lower.includes('lorem ipsum')) {
    pushFinding(findings, rel, 1, 'Conversion', 'P2', 'placeholder-copy', 'Placeholder copy remains in the UI.');
  }

  // Prompt-artifact leakage: LaTeX / markdown syntax rendered as visible UI text.
  if (absFile.endsWith('.html')) {
    const visibleText = raw.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
    for (const m of visibleText.matchAll(/\\(to|times|rightarrow|leftarrow|infty|approx|neq|leq|geq|cdot|frac)\b|\$[^$\n]{1,60}\\[a-z]+[^$\n]{0,60}\$/g)) {
      pushFinding(findings, rel, 1, 'UI Craft', 'P1', 'artifact-leak', `LaTeX markup "${m[0].slice(0, 40)}" is rendered as visible text — replace with real characters (→, ×, ≤).`);
    }
    for (const m of visibleText.matchAll(/\*\*[^*\n]{2,60}\*\*|(?:^|\s)```/g)) {
      pushFinding(findings, rel, 1, 'UI Craft', 'P1', 'artifact-leak', `Markdown syntax "${m[0].trim().slice(0, 40)}" is rendered as visible text — use real HTML emphasis/code elements.`);
    }
  }

  // Nav links hidden by a media query with no menu control anywhere in the document.
  if (absFile.endsWith('.html') && /@media[^{]*\{[^@]*?(nav-links|nav\s+ul|\.nav\s+a|nav\s+a)[^{}]*\{[^}]*display\s*:\s*none/is.test(raw)) {
    const hasMenuControl = /<button[^>]*(aria-expanded|aria-label=["'][^"']*menu|class=["'][^"']*(menu|burger|hamburger|nav-toggle))/i.test(raw);
    if (!hasMenuControl) {
      pushFinding(findings, rel, 1, 'Accessibility', 'P1', 'nav-hidden-no-menu', 'Nav links are hidden at some viewport but no menu button exists — navigation becomes unreachable (components/navigation.md).');
    }
  }

  return findings;
}

function summarizeReview(findings, files) {
  const assessedDims = ['UI Craft', 'UX & Flow', 'Accessibility', 'Modernity', 'Conversion'];
  const staticRiskScores = Object.fromEntries(assessedDims.map(d => [d, 100]));
  const weights = { P0: 25, P1: 12, P2: 5 };
  const blockerCodes = new Set([
    'img-no-alt', 'empty-control', 'nonsemantic-click', 'focus-removed',
    'proof-risk', 'customer-proof-risk', 'quote-proof-risk', 'placeholder-copy',
  ]);
  for (const f of findings) {
    staticRiskScores[f.dimension] = Math.max(0, staticRiskScores[f.dimension] - weights[f.severity]);
    if (blockerCodes.has(f.code)) staticRiskScores[f.dimension] = Math.min(60, staticRiskScores[f.dimension]);
  }
  const staticRiskFloor = Math.min(...Object.values(staticRiskScores));
  const unassessed = [
    'visual hierarchy and brand fit', 'keyboard completion', 'accessibility tree and screen reader',
    'computed contrast across real states', '320px reflow/400% zoom', 'reduced motion',
    'Lighthouse/Core Web Vitals', 'task completion and conversion quality',
  ];
  return {
    filesReviewed: files.length,
    findingCount: findings.length,
    status: findings.length ? 'FINDINGS' : 'STATIC CHECKS CLEAN',
    finalScore: 'NOT ASSESSED',
    staticRiskScores,
    staticRiskFloor,
    unassessed,
  };
}

function printReviewMarkdown(report) {
  console.log('# DesignOS Review\n');
  console.log(`Files reviewed: ${report.summary.filesReviewed}`);
  console.log(`Findings: ${report.summary.findingCount}`);
  console.log(`Static risk floor: ${report.summary.staticRiskFloor}/100 (not a final design score)`);
  console.log(`Final design score: ${report.summary.finalScore}\n`);
  console.log('| Dimension | Static risk indicator |');
  console.log('|---|---:|');
  for (const [dim, score] of Object.entries(report.summary.staticRiskScores)) {
    console.log(`| ${dim} | ${score} |`);
  }
  console.log(`\nNot assessed: ${report.summary.unassessed.join('; ')}.`);
  if (!report.findings.length) {
    console.log('\nNo deterministic findings. Run the human/model review loop for taste, hierarchy, and fit.');
    return;
  }
  console.log('\n## Findings\n');
  for (const f of report.findings) {
    console.log(`- **${f.severity} ${f.dimension} / ${f.code}** — ${f.file}:${f.line} — ${f.message}`);
  }
}

function fixAdviceFor(f) {
  const base = `${f.file}:${f.line} (${f.severity} ${f.dimension}/${f.code})`;
  if (f.code === 'raw-color') return `${base}: Replace inline color with a CSS token, move it into :root, use currentColor for SVG, or add a documented token-ok exception.`;
  if (f.code === 'off-grid-spacing') return `${base}: Move spacing to the 4px scale or add a documented drift-ok exception with the module reason.`;
  if (f.code.includes('proof') || f.code.includes('quote')) return `${base}: Remove unsourced proof, replace with neutral/fictional wording, or add a real source and proof-ok note.`;
  if (f.code === 'missing-states') return `${base}: Add loading, error, disabled, success, and empty states where applicable.`;
  if (f.code === 'contrast-risk') return `${base}: Verify contrast against the actual background and adjust the token if below threshold.`;
  if (f.code === 'focus-removed') return `${base}: Restore a visible :focus-visible style with outline/offset or an equivalent tokenized ring.`;
  return `${base}: Fix the reported issue and rerun DesignOS review.`;
}

function printFixPrompt(report, min) {
  console.log('Fix these DesignOS review findings, then rerun the DesignOS loop.');
  console.log(`Target: ${report.target}`);
  console.log(`Current static risk floor: ${report.summary.staticRiskFloor}/100. Requested mechanical floor: ${min}/100.`);
  console.log('Final design score: NOT ASSESSED until the manual/browser evidence ledger is complete.\n');
  console.log('Rules:');
  console.log('- Do not trust the agent self-score; the final pass is this deterministic review output.');
  console.log('- Do not invent customers, testimonials, certifications, usage counts, awards, urgency, or compliance claims.');
  console.log('- Do not claim SOC2, ISO 27001, HIPAA, PCI, GDPR, FIPS, audited, or certified unless a real source is linked.');
  console.log('- Keep visual direction unless a finding directly contradicts it.\n');
  console.log('Required fixes:');
  if (!report.findings.length) {
    console.log('- No deterministic findings remain. Run the human/model review loop for taste, hierarchy, and fit.');
    return;
  }
  report.findings.forEach((f, i) => console.log(`${i + 1}. ${fixAdviceFor(f)}`));
  console.log('\nAfter editing, run:');
  console.log(`node DesignOS/bin/designos.js review ${report.target} --min ${min}`);
}

function review(target, args) {
  const min = Number(argValue(args, '--min', '95'));
  const asJson = args.includes('--json');
  const noFail = args.includes('--no-fail');
  const fixPrompt = args.includes('--fix-prompt');
  if (!target) fail(`Usage: ${RUN} review <file-or-dir> [--min 95] [--json] [--no-fail] [--fix-prompt]`);
  const abs = path.resolve(CWD, target);
  if (!fs.existsSync(abs)) fail(`Review target not found: ${target}`);
  const files = [...walkReviewFiles(abs)];
  if (!files.length) fail(`No reviewable UI files found in ${target}`);
  const findings = files.flatMap(file => analyzeDesignFile(file, CWD));
  const summary = summarizeReview(findings, files);
  const report = { target, generatedAt: new Date().toISOString(), summary, findings };
  if (fixPrompt) printFixPrompt(report, min);
  else if (asJson) console.log(JSON.stringify(report, null, 2));
  else printReviewMarkdown(report);
  if (!noFail && summary.staticRiskFloor < min) process.exit(1);
}

function buildReviewReport(target) {
  const abs = path.resolve(CWD, target);
  if (!fs.existsSync(abs)) fail(`Review target not found: ${target}`);
  const files = [...walkReviewFiles(abs)];
  if (!files.length) fail(`No reviewable UI files found in ${target}`);
  const findings = files.flatMap(file => analyzeDesignFile(file, CWD));
  const summary = summarizeReview(findings, files);
  return { target, generatedAt: new Date().toISOString(), summary, findings };
}

function markdownForReviewReport(report) {
  const lines = [
    '# DesignOS Review',
    '',
    `Target: ${report.target}`,
    `Generated: ${report.generatedAt}`,
    `Files reviewed: ${report.summary.filesReviewed}`,
    `Findings: ${report.summary.findingCount}`,
    `Static risk floor: ${report.summary.staticRiskFloor}/100 (not a final design score)`,
    `Final design score: ${report.summary.finalScore}`,
    '',
    '| Dimension | Static risk indicator |',
    '|---|---:|',
  ];
  for (const [dim, score] of Object.entries(report.summary.staticRiskScores)) {
    lines.push(`| ${dim} | ${score} |`);
  }
  lines.push('', '## Findings', '');
  if (!report.findings.length) lines.push('No deterministic findings.');
  else report.findings.forEach(f => lines.push(`- **${f.severity} ${f.dimension} / ${f.code}** — ${f.file}:${f.line} — ${f.message}`));
  return lines.join('\n');
}

function report(target, args) {
  const min = Number(argValue(args, '--min', '95'));
  const outPath = path.resolve(CWD, argValue(args, '--out', 'designos-report.md'));
  if (!target) fail(`Usage: ${RUN} report <file-or-dir> [--min 95] [--out designos-report.md] [--no-fail]`);
  const reviewReport = buildReviewReport(target);
  const sections = [
    '# DesignOS Delivery Report',
    '',
    `Target: ${target}`,
    `Generated: ${new Date().toISOString()}`,
    `Static risk floor: ${reviewReport.summary.staticRiskFloor}/100 (requested ${min}/100)`,
    'Final design score: NOT ASSESSED until sign-off evidence is completed',
    '',
    '## Review Gate',
    '',
    markdownForReviewReport(reviewReport).replace(/^# DesignOS Review\n\n/, ''),
    '',
    '## Agent Fix Prompt',
    '',
    'Use this if any findings remain:',
    '',
    '```text',
    `Fix these DesignOS review findings, then rerun: ${RUN} review ${target} --min ${min}`,
    'Do not invent metrics, customers, testimonials, badges, urgency, or compliance claims.',
    'Do not claim SOC2, ISO 27001, HIPAA, PCI, GDPR, FIPS, audited, or certified unless a real source is linked.',
    ...reviewReport.findings.map((f, i) => `${i + 1}. ${fixAdviceFor(f)}`),
    reviewReport.findings.length ? '' : 'No deterministic findings remain. Run human/model review for taste and fit.',
    '```',
    '',
    '## Sign-off Checklist',
    '',
    '- [ ] 320px reflow / 400% zoom inspected',
    '- [ ] Mobile 375px inspected',
    '- [ ] Tablet 768px inspected',
    '- [ ] Laptop 1024px inspected',
    '- [ ] Desktop 1440px inspected',
    '- [ ] Keyboard-only path verified',
    '- [ ] Reduced-motion mode verified',
    '- [ ] Fake proof removed or sourced',
    '- [ ] Memory updated with final decisions',
    '',
  ].join('\n');
  fs.writeFileSync(outPath, sections);
  ok(`Delivery report written to ${path.relative(CWD, outPath)}`);
  if (!args.includes('--no-fail') && reviewReport.summary.staticRiskFloor < min) process.exit(1);
}

/* ---------- elevate: premium refactor prompt for better-than-clean UI ---------- */
function readReviewBodies(target) {
  const abs = path.resolve(CWD, target);
  if (!fs.existsSync(abs)) fail(`Elevate target not found: ${target}`);
  const files = [...walkReviewFiles(abs)];
  if (!files.length) fail(`No reviewable UI files found in ${target}`);
  return files.map(file => {
    const raw = fs.readFileSync(file, 'utf8');
    return { file, rel: path.relative(CWD, file) || path.basename(file), raw };
  });
}

function detectSurfaceKind(src) {
  const lower = src.toLowerCase();
  if (/pricing|price|plan|billing|enterprise/.test(lower)) return 'pricing';
  if (/dashboard|metric|table|chart|analytics|sidebar/.test(lower)) return 'dashboard';
  if (/docs|api|code|quickstart|developer/.test(lower)) return 'docs';
  if (/onboarding|signup|sign up|welcome|step/.test(lower)) return 'onboarding';
  if (/checkout|cart|payment/.test(lower)) return 'checkout';
  return 'landing';
}

function selectReferencePacks(src) {
  const lower = src.toLowerCase();
  const refs = new Set(['brain/quality-bar.md', 'brain/originality.md']);
  if (/pricing|landing|hero|cta|demo|sales|marketing/.test(lower)) refs.add('references/stripe-level-marketing.md');
  if (/dashboard|sidebar|table|command|changelog|dark/.test(lower)) refs.add('references/linear-style-app.md');
  if (/docs|api|developer|code|deploy/.test(lower)) refs.add('references/vercel-docs-style.md');
  if (/product|iphone|mobile|hardware|launch/.test(lower)) refs.add('references/apple-product-page.md');
  if (/security|cyber|soc|edr|siem|risk|threat/.test(lower)) refs.add('references/cybersecurity-dark-ui.md');
  return [...refs];
}

function premiumHeuristics(files) {
  const joined = files.map(f => f.raw).join('\n').slice(0, 500000);
  const stripped = joined.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const lower = stripped.toLowerCase();
  const findings = [];
  const add = (code, message, action) => findings.push({ code, message, action });

  const genericWords = stripped.match(/\b(seamless|powerful|beautiful|modern|innovative|next-gen|cutting-edge|all-in-one|unlock|supercharge|transform your)\b/gi) || [];
  if (genericWords.length >= 3) {
    add('generic-copy', 'Copy leans on generic SaaS adjectives.', 'Replace with concrete product mechanics, tradeoffs, named workflows, or before/after user outcomes.');
  }
  const ctaMatches = stripped.match(/\b(start|try|get started|book|schedule|demo|contact sales|learn more|sign up)\b/gi) || [];
  if (ctaMatches.length > 8) {
    add('cta-noise', `Detected ${ctaMatches.length} CTA-like phrases.`, 'Collapse to one primary action and one secondary action per viewport.');
  }
  if (!/\b(screenshot|screen|demo|preview|table|chart|timeline|workflow|terminal|code|invoice|report|map|calendar|feed)\b/i.test(stripped)) {
    add('missing-product-artifact', 'No obvious product artifact or inspectable proof object found.', 'Add a real-feeling product surface: dashboard crop, workflow timeline, tabular pricing, code sample, report preview, or annotated demo.');
  }
  if (!/\b(error|empty|loading|disabled|success|offline|retry|skeleton)\b/i.test(stripped)) {
    add('missing-state-story', 'No state language found in the surface.', 'Show at least one realistic edge state so the interface feels built, not staged.');
  }
  if (!/\b(because|so that|instead of|without|tradeoff|constraint|why)\b/i.test(stripped)) {
    add('weak-rationale', 'The page does not expose much product reasoning.', 'Add compact explanatory proof: why the architecture, pricing, workflow, or UX choice exists.');
  }
  if (/(gradient|blur|glow|glass|orb|bento)/i.test(joined) && !/\b(system|data|artifact|workflow|proof|screenshot)\b/i.test(stripped)) {
    add('decorative-modernity', 'Visual-modernity words appear without enough product substance.', 'Make the product artifact carry the design. Use decoration only to support hierarchy.');
  }
  if (!/\b(focus-visible|aria-|prefers-reduced-motion|alt=|role=)\b/i.test(joined)) {
    add('thin-interaction-contract', 'Few accessibility or interaction hooks detected.', 'Add focus-visible, semantic labels, reduced-motion handling, and visible disabled/loading states.');
  }
  if (!/\b(signature|motif|ritual|timeline|map|canvas|ledger|signal|trace|command|notebook|studio)\b/i.test(stripped)) {
    add('no-signature-vehicle', 'The design may pass quality checks but still feel swappable.', 'Pick one signature vehicle from brain/originality.md and repeat it across hero, section rhythm, and microcopy.');
  }
  return findings;
}

function elevate(target, args) {
  if (!target) fail(`Usage: ${RUN} elevate <file-or-dir> [--out designos-elevate-prompt.md] [--min 97]`);
  const min = Number(argValue(args, '--min', '97'));
  const outPath = path.resolve(CWD, argValue(args, '--out', 'designos-elevate-prompt.md'));
  const files = readReviewBodies(target);
  const src = files.map(f => f.raw).join('\n');
  const surface = detectSurfaceKind(src);
  const refs = selectReferencePacks(src);
  const reviewReport = buildReviewReport(target);
  const premiumFindings = premiumHeuristics(files);
  const visualTarget = (files.find(f => /\.html$/i.test(f.rel)) || files[0]).rel;
  const lines = [
    '# DesignOS Elevation Prompt',
    '',
    `Target: ${target}`,
    `Surface detected: ${surface}`,
    `Required bar: every deterministic and creative dimension >= ${min}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Load These Modules First',
    '',
    ...refs.map(ref => `- \`${ref}\``),
    `- \`patterns/${surface === 'landing' ? 'landing-pages' : surface}.md\` if present; otherwise use the closest pattern module.`,
    '- `loops/refactor-loop.md`',
    '- `scoring/rubric.md`',
    '',
    '## Mission',
    '',
    'Refactor this UI from clean/competent to memorable, premium, and inspectable. Preserve the product intent, stack, and truthful claims. Do not redesign for novelty alone.',
    '',
    '## Deterministic Gate Findings',
    '',
    reviewReport.findings.length
      ? reviewReport.findings.map((f, i) => `${i + 1}. ${fixAdviceFor(f)}`).join('\n')
      : 'No deterministic findings remain. The elevation work is now taste, hierarchy, product substance, and originality.',
    '',
    '## Premium Elevation Findings',
    '',
    premiumFindings.length
      ? premiumFindings.map((f, i) => `${i + 1}. **${f.code}** — ${f.message}\n   Action: ${f.action}`).join('\n')
      : 'No obvious premium-elevation heuristics fired. Still perform a creative-director pass against the reference packs.',
    '',
    '## Required Upgrade Moves',
    '',
    '1. Create one signature vehicle derived from the product material, not decoration.',
    '2. Make the first viewport communicate product, audience, and primary action within 3 seconds.',
    '3. Add one inspectable product artifact: screenshot-like UI, workflow, data table, code sample, report, or demo state.',
    '4. Reduce CTA noise to one primary and one secondary action per viewport.',
    '5. Add real states: loading, empty, disabled, error, success, and keyboard focus where relevant.',
    '6. Remove fake proof. Use sourced proof, transparent placeholders, or architecture/economic proof instead.',
    '7. Tighten typographic rhythm, spacing hierarchy, and section contrast against `brain/quality-bar.md`.',
    '',
    '## Forbidden Moves',
    '',
    '- Do not add fake logos, fake testimonials, invented usage counts, invented compliance badges, or unsourced awards.',
    '- Do not claim SOC2, ISO 27001, HIPAA, PCI, GDPR, FIPS, audited, or certified unless a real source is linked.',
    '- Do not hide layout bugs with `overflow-x: hidden`.',
    '- Do not add decoration that does not explain the product, data, workflow, or brand belief.',
    '- Do not make every section the same card/grid rhythm.',
    '',
    '## Final Verification',
    '',
    'Run these before delivery:',
    '',
    '```bash',
    `${RUN} review ${target} --min ${min}`,
    `${RUN} visual ${visualTarget} --no-fail`,
    `${RUN} report ${target} --min ${min} --no-fail`,
    '```',
    '',
    'Deliver: changed files, scorecard, before/after rationale, remaining caveats, and memory updates.',
    '',
  ];
  fs.writeFileSync(outPath, lines.join('\n'));
  ok(`Elevation prompt written to ${path.relative(CWD, outPath)}`);
  if (reviewReport.summary.staticRiskFloor < min && !args.includes('--no-fail')) process.exit(1);
}

/* ---------- brief: generate a high-signal DesignOS brief ---------- */
let pipedAnswers = null;
function ask(question) {
  process.stdout.write(`${question}: `);
  if (!process.stdin.isTTY) {
    if (pipedAnswers === null) {
      pipedAnswers = fs.readFileSync(0, 'utf8').split(/\r?\n/);
    }
    const answer = (pipedAnswers.shift() || '').trim();
    process.stdout.write(`${answer}\n`);
    return answer;
  }
  let out = '';
  const buffer = Buffer.alloc(1);
  while (true) {
    const bytes = fs.readSync(0, buffer, 0, 1, null);
    if (!bytes) break;
    const char = buffer.toString('utf8', 0, bytes);
    if (char === '\n' || char === '\r') break;
    out += char;
  }
  return out.trim();
}

function brief(args) {
  if (args.includes('--interactive')) {
    const answers = {
      type: ask('Surface type (landing, pricing, dashboard, onboarding, mobile app)'),
      industry: ask('Industry'),
      audience: ask('Primary audience'),
      goal: ask('Primary goal'),
      tone: ask('Tone'),
      constraints: ask('Constraints'),
    };
    args = [
      '--type', answers.type,
      '--industry', answers.industry,
      '--audience', answers.audience,
      '--goal', answers.goal,
      '--tone', answers.tone,
      '--constraints', answers.constraints,
    ];
  }
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
    '- Compile the design contract, compare directions, then run research -> wireframe -> UI -> render/inspect -> review -> accessibility -> performance -> refactor.',
    '- Score UI Craft, UX & Flow, Accessibility, Performance, Modernity, Conversion, and Brand Fit & Distinctiveness.',
    '- Run the static risk gate and complete the evidence ledger before claiming a score: review, elevate, visual, then report.',
    '- Redo any dimension under 95 before delivery.',
    '- Do not claim 95+, 100/100, zero findings, or SHIP while any applicable evidence row is NOT ASSESSED.',
    '- Do not invent metrics, customers, testimonials, badges, urgency, or compliance claims.',
    '- Do not claim SOC2, ISO 27001, HIPAA, PCI, GDPR, FIPS, audited, or certified unless a real source is linked.',
    '- Write durable decisions to memory/ after delivery.',
    '',
    'Final gate commands:',
    '```bash',
    'node DesignOS/bin/designos.js review <target-file-or-dir> --min 95',
    'node DesignOS/bin/designos.js elevate <target-file-or-dir> --no-fail',
    'node DesignOS/bin/designos.js visual <target-html-file> --no-fail',
    'node DesignOS/bin/designos.js report <target-file-or-dir> --min 95 --no-fail',
    '```',
    '',
    'Deliverable:',
    '- A production-ready artifact plus static gate output, evidence ledger, scorecard or NOT ASSESSED labels, key decisions, and remaining risks.',
  ].join('\n');
  const outPath = argValue(args, '--out', '');
  if (outPath) {
    fs.writeFileSync(path.resolve(CWD, outPath), out + '\n');
    ok(`Brief written to ${outPath}`);
  } else {
    console.log(out);
  }
}

/* ---------- visual: static/optional-browser visual QA report ---------- */
function visual(target, args) {
  if (!target) fail(`Usage: ${RUN} visual <html-file-or-url> [--baseline|--compare] [--out designos-visual-report.md]`);
  const outPath = path.resolve(CWD, argValue(args, '--out', 'designos-visual-report.md'));
  const rootShotDir = path.resolve(CWD, argValue(args, '--screenshots', 'designos-visual'));
  // Iteration mode: --baseline records the "before", --compare renders the "after" and
  // measures what actually moved. Neither flag = the original single-pass behaviour.
  const mode = args.includes('--baseline') ? 'baseline' : args.includes('--compare') ? 'compare' : 'single';
  const shotDir = mode === 'single' ? rootShotDir : path.join(rootShotDir, mode);
  const baselineDir = path.join(rootShotDir, 'baseline');
  const maxDiff = Number(argValue(args, '--max-diff', 'NaN'));
  const isUrl = /^https?:\/\//i.test(target);
  const abs = isUrl ? target : path.resolve(CWD, target);
  if (!isUrl && !fs.existsSync(abs)) fail(`Visual target not found: ${target}`);

  // The browser gate is the authoritative path. Unlike the legacy source-risk report
  // below, it renders the page across themes, reduced motion, zoom and five viewports.
  // The legacy path remains as an explicit degraded fallback so old installs produce an
  // honest NOT RUN ledger rather than silently claiming browser evidence.
  const browserGatePath = path.join(PKG_ROOT, 'bin', 'browser-gate.js');
  const browserJsonPath = path.resolve(CWD, argValue(args, '--json-out',
    outPath.replace(/\.(?:md|markdown)$/i, '') + '.json'));
  if (fs.existsSync(browserGatePath) && !args.includes('--legacy-static')) {
    const gateArgs = [browserGatePath, target, '--out', browserJsonPath,
      '--screenshots', mode === 'baseline' ? baselineDir : mode === 'compare' ? path.join(rootShotDir, 'compare') : rootShotDir];
    if (mode === 'compare') gateArgs.push('--baseline-dir', baselineDir);
    if (!Number.isNaN(maxDiff)) gateArgs.push('--max-diff', String(maxDiff));
    const gate = spawnSync('node', gateArgs, {
      cwd: CWD,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 32,
      env: { ...process.env, NODE_PATH: [path.join(CWD, 'node_modules'), path.join(PKG_ROOT, 'node_modules'),
        process.env.NODE_PATH || ''].filter(Boolean).join(path.delimiter) },
    });
    if (gate.status !== 2 && fs.existsSync(browserJsonPath)) {
      const data = JSON.parse(fs.readFileSync(browserJsonPath, 'utf8'));
      const report = [
        '# DesignOS Browser-native Final Gate',
        '',
        `Target: ${target}`,
        `Generated: ${data.generatedAt}`,
        `JSON evidence: ${path.relative(CWD, browserJsonPath)}`,
        '',
        '## Measured coverage',
        '',
        `- ${data.summary.scenarios} rendered scenarios and ${data.summary.screenshots} screenshots`,
        `- viewports: ${data.viewports.map(item => item.width).join(' / ')} CSS px`,
        `- themes: ${data.themes.join(' / ')}`,
        `- motion: ${data.motions.join(' / ')}`,
        `- zoom/reflow: ${data.zooms.join('% / ')}%`,
        '',
        '## Findings',
        '',
        data.findings.length
          ? data.findings.map(item => `- **${item.severity} / ${item.id} / ${item.scenario || 'global'}** — ${item.message}`).join('\n')
          : 'No P1/P2 browser-gate findings.',
        '',
        '## Evidence ledger',
        '',
        '- [x] 320 / 375 / 768 / 1024 / 1440 render',
        '- [x] Light and dark color schemes',
        '- [x] Full and reduced-motion modes',
        '- [x] 200% and 400% text zoom/reflow',
        '- [x] Runtime console and failed-resource capture',
        '- [x] DOM geometry, clipping, target size and semantic snapshots',
        `- [${data.summary.keyboardPaths ? 'x' : ' '}] Keyboard path and focus-obscured traversal`,
        '- [ ] Human hierarchy, brand and conversion review',
        '- [ ] Screen-reader listening pass',
        '- [ ] Lighthouse lab run',
        '',
        `Browser gate: ${data.summary.passed ? 'MECHANICAL PASS' : 'RETURN TO LOOP'}.`,
        'This is not the seven-dimension final design score.',
        '',
      ].join('\n');
      fs.writeFileSync(outPath, report);
      ok(`Browser-native visual gate written to ${path.relative(CWD, outPath)}`);
      if (!data.summary.passed && !args.includes('--no-fail')) process.exit(1);
      return;
    }
    if (!args.includes('--no-fail')) {
      fail((gate.stderr || gate.stdout || 'Browser gate did not run.').trim());
    }
  }

  const body = isUrl ? '' : fs.readFileSync(abs, 'utf8');
  const findings = [];
  const add = (severity, code, message) => findings.push({ severity, code, message });

  if (!isUrl) {
    if (!/<meta[^>]+name=["']viewport["']/i.test(body)) add('P1', 'missing-viewport', 'No viewport meta tag; mobile rendering is likely broken.');
    if (/<img\b(?![^>]*(width|height)=)/i.test(body)) add('P2', 'image-dimensions', 'At least one image lacks explicit width/height; verify CLS.');
    if (/overflow-x\s*:\s*hidden/i.test(body)) add('P2', 'overflow-hidden', 'overflow-x hidden can mask mobile layout bugs; verify 375px manually.');
    if (!/prefers-reduced-motion/i.test(body)) add('P2', 'motion-qa', 'No prefers-reduced-motion handling found.');
    if (!/:focus-visible|outline-offset/i.test(body)) add('P1', 'focus-qa', 'No obvious focus-visible style found.');
    if (/(position:\s*absolute|transform:\s*translate|white-space:\s*nowrap)/i.test(body)) add('P3', 'overlap-risk', 'Absolute/transform/nowrap usage present; inspect mobile screenshots for overlap.');
  }

  let browserNote = [
    '**NOT RUN.** Playwright unavailable — no screenshots exist and no viewport was rendered.',
    'Every viewport row below is therefore **UNVERIFIED**. Reporting any of them as',
    '"inspected", "verified", or "CLEAN" without running this pass is fabrication',
    '(`workflows/final-gate.md`). Install Playwright (`npm i -D playwright && npx playwright install chromium`) and rerun.',
  ].join('\n');
  let browserFindings = [];
  let screenshots = [];
  // Resolve Playwright from the project first, then DesignOS's own node_modules.
  const pwEnv = { ...process.env, NODE_PATH: [path.join(CWD, 'node_modules'), path.join(PKG_ROOT, 'node_modules'), process.env.NODE_PATH || ''].filter(Boolean).join(path.delimiter) };
  const playwrightCheck = spawnSync('node', ['-e', 'const m="play"+"wright"; require(m); console.log("ok")'], { cwd: CWD, encoding: 'utf8', env: pwEnv });
  if (playwrightCheck.status === 0) {
    fs.mkdirSync(shotDir, { recursive: true });
    const script = [
      'const fs=require("fs");',
      'const path=require("path");',
      'const m="play"+"wright";',
      'const { chromium } = require(m);',
      '(async()=>{',
      `const target=${JSON.stringify(isUrl ? target : `file://${abs}`)};`,
      `const out=${JSON.stringify(shotDir)};`,
      'const viewports=[["mobile",375,812],["tablet",768,1024],["laptop",1024,900],["desktop",1440,1000]];',
      'const browser=await chromium.launch();',
      'const result={screenshots:[],findings:[]};',
      'for (const [name,width,height] of viewports) {',
      '  const page=await browser.newPage({ viewport:{ width, height } });',
      '  const errors=[];',
      '  page.on("console", msg => { if (["error","warning"].includes(msg.type())) errors.push(`${msg.type()}: ${msg.text()}`); });',
      '  page.on("pageerror", err => errors.push(`pageerror: ${err.message}`));',
      '  await page.goto(target, { waitUntil:"networkidle", timeout:30000 });',
      '  const metrics=await page.evaluate(() => {',
      '    const main=document.querySelector("main");',
      '    const h1=document.querySelector("h1");',
      '    const bodyText=(document.body.innerText||"").trim();',
      '    const header=document.querySelector("header, [role=banner]");',
      '    const navLinks=[...document.querySelectorAll("header nav a, [role=banner] nav a, header .nav-links a")];',
      '    const visible=el=>{ const r=el.getBoundingClientRect(); const s=getComputedStyle(el); return r.width>0 && r.height>0 && s.visibility!=="hidden" && s.display!=="none" && r.left>=-2 && r.right<=document.documentElement.clientWidth+2; };',
      '    const visibleLinks=navLinks.filter(visible).length;',
      '    const menuButton=[...document.querySelectorAll("header button, [role=banner] button, header [aria-expanded]")].some(b=>{ const s=getComputedStyle(b); const r=b.getBoundingClientRect(); return s.display!=="none" && r.width>0 && (b.hasAttribute("aria-expanded") || /menu|nav|burger/i.test(b.getAttribute("aria-label")||b.className||"")); });',
      '    let headerOverflow=0, headerWrapped=false;',
      '    if (header) {',
      '      headerOverflow=Math.max(0, header.scrollWidth-header.clientWidth);',
      '      const kids=[...header.querySelectorAll("*")].filter(visible);',
      '      const hr=header.getBoundingClientRect();',
      '      headerWrapped=hr.height>120 || kids.some(k=>{ const r=k.getBoundingClientRect(); return r.right>hr.right+2 || r.left<hr.left-2; });',
      '    }',
      '    return {',
      '      scrollWidth: document.documentElement.scrollWidth,',
      '      clientWidth: document.documentElement.clientWidth,',
      '      bodyTextLength: bodyText.length,',
      '      h1: Boolean(h1),',
      '      main: Boolean(main),',
      '      heroHeight: main ? main.getBoundingClientRect().height : 0,',
      '      hasHeader: Boolean(header),',
      '      navLinkCount: navLinks.length, visibleLinks, menuButton, headerOverflow, headerWrapped',
      '    };',
      '  });',
      '  if (metrics.hasHeader && metrics.headerOverflow>4) result.findings.push({ severity:"P1", code:"nav-overflow", message:`${name}: header content overflows its bar by ${metrics.headerOverflow}px (items colliding or clipped)` });',
      '  if (metrics.hasHeader && metrics.headerWrapped) result.findings.push({ severity:"P1", code:"nav-wrap", message:`${name}: header items wrap or escape the bar bounds — nav does not fit at this width` });',
      '  if (metrics.navLinkCount>0 && metrics.visibleLinks===0 && !metrics.menuButton) result.findings.push({ severity:"P1", code:"nav-unreachable", message:`${name}: all nav links are hidden and no menu button exists — navigation is unreachable` });',
      '  if (metrics.scrollWidth > metrics.clientWidth + 2) result.findings.push({ severity:"P1", code:"horizontal-scroll", message:`${name}: document scrollWidth ${metrics.scrollWidth}px exceeds viewport ${metrics.clientWidth}px` });',
      '  if (!metrics.h1) result.findings.push({ severity:"P2", code:"missing-h1-render", message:`${name}: rendered page has no h1` });',
      '  if (!metrics.main) result.findings.push({ severity:"P2", code:"missing-main-render", message:`${name}: rendered page has no main landmark` });',
      '  if (metrics.bodyTextLength < 40) result.findings.push({ severity:"P1", code:"blank-render", message:`${name}: rendered body text is suspiciously empty` });',
      '  for (const e of errors) result.findings.push({ severity:"P1", code:"console", message:`${name}: ${e}` });',
      '  const file=path.join(out, `${name}.png`);',
      '  await page.screenshot({ path:file, fullPage:true });',
      '  result.screenshots.push(file);',
      '  await page.close();',
      '}',
      'await browser.close();',
      'console.log(JSON.stringify(result));',
      '})().catch(err=>{ console.error(err.stack||err.message); process.exit(1); });',
    ].join('\n');
    const run = spawnSync('node', ['-e', script], { cwd: CWD, encoding: 'utf8', maxBuffer: 1024 * 1024 * 10, env: pwEnv });
    if (run.status === 0) {
      const result = JSON.parse(run.stdout);
      browserFindings = result.findings || [];
      screenshots = result.screenshots || [];
      browserNote = `Browser render completed with ${screenshots.length} screenshot(s).`;
    } else {
      add('P2', 'browser-qa-failed', `Playwright was available but browser QA failed: ${(run.stderr || run.stdout).trim()}`);
      browserNote = 'Browser render attempted but failed; see static findings.';
    }
  }
  for (const f of browserFindings) add(f.severity, f.code, f.message);

  /* ---------- iteration diff: what actually moved between two renders ---------- */
  let diffNote = '';
  let diffRows = [];
  if (mode === 'compare') {
    if (!fs.existsSync(baselineDir)) {
      diffNote = `**NO BASELINE.** ${path.relative(CWD, baselineDir)} does not exist — run \`${RUN} visual ${target} --baseline\` before the change, then \`--compare\` after it. Nothing was measured.`;
    } else if (!screenshots.length) {
      diffNote = '**NOT RUN.** The browser pass produced no screenshots, so there was nothing to compare. Treat every viewport as unmeasured.';
    } else {
      const pairs = screenshots
        .map(cur => ({ name: path.basename(cur, '.png'), current: cur, baseline: path.join(baselineDir, path.basename(cur)) }))
        .filter(p => fs.existsSync(p.baseline));
      const missing = screenshots.length - pairs.length;
      if (!pairs.length) {
        diffNote = '**NO MATCHING VIEWPORTS.** The baseline directory holds no screenshot with a matching name. Re-record the baseline.';
      } else {
        const diffDir = path.join(rootShotDir, 'diff');
        fs.mkdirSync(diffDir, { recursive: true });
        // The comparison runs in the page: canvas gives real per-pixel access with no
        // image-decoding dependency. Images go in as data URLs so the canvas is never
        // tainted (a file:// image would make getImageData throw).
        const diffScript = [
          'const fs=require("fs");const path=require("path");',
          'const m="play"+"wright";const { chromium }=require(m);',
          '(async()=>{',
          `const pairs=${JSON.stringify(pairs)};`,
          `const diffDir=${JSON.stringify(diffDir)};`,
          'const browser=await chromium.launch();',
          'const page=await browser.newPage();',
          'const rows=[];',
          'for (const p of pairs) {',
          '  const a="data:image/png;base64,"+fs.readFileSync(p.baseline).toString("base64");',
          '  const b="data:image/png;base64,"+fs.readFileSync(p.current).toString("base64");',
          '  const r=await page.evaluate(async ([a,b])=>{',
          '    const load=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error("decode"));i.src=src;});',
          '    const A=await load(a), B=await load(b);',
          '    const w=Math.max(A.width,B.width), h=Math.max(A.height,B.height);',
          '    const draw=img=>{const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d",{willReadFrequently:true});x.fillStyle="#ffffff";x.fillRect(0,0,w,h);x.drawImage(img,0,0);return x.getImageData(0,0,w,h).data;};',
          '    const da=draw(A), db=draw(B);',
          '    const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;',
          '    const ctx=canvas.getContext("2d");const out=ctx.createImageData(w,h);',
          '    let changed=0, top=-1, bottom=-1;',
          '    for (let i=0;i<da.length;i+=4) {',
          '      const d=Math.abs(da[i]-db[i])+Math.abs(da[i+1]-db[i+1])+Math.abs(da[i+2]-db[i+2]);',
          '      if (d>24) {',
          '        changed++;',
          '        const y=Math.floor((i/4)/w);',
          '        if (top===-1) top=y; bottom=y;',
          '        out.data[i]=255; out.data[i+1]=32; out.data[i+2]=96; out.data[i+3]=255;',
          '      } else {',
          '        out.data[i]=db[i]; out.data[i+1]=db[i+1]; out.data[i+2]=db[i+2]; out.data[i+3]=36;',
          '      }',
          '    }',
          '    ctx.putImageData(out,0,0);',
          '    return { w, h, changed, total:w*h, top, bottom, heightDelta:B.height-A.height, png:canvas.toDataURL("image/png") };',
          '  }, [a,b]);',
          '  const file=path.join(diffDir, p.name+".png");',
          '  fs.writeFileSync(file, Buffer.from(r.png.split(",")[1], "base64"));',
          '  delete r.png;',
          '  rows.push(Object.assign({ name:p.name, file }, r));',
          '}',
          'await browser.close();',
          'console.log(JSON.stringify(rows));',
          '})().catch(err=>{ console.error(err.stack||err.message); process.exit(1); });',
        ].join('\n');
        const dr = spawnSync('node', ['-e', diffScript], { cwd: CWD, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32, env: pwEnv });
        if (dr.status === 0) {
          diffRows = JSON.parse(dr.stdout);
          diffNote = `Compared ${diffRows.length} viewport(s) against ${path.relative(CWD, baselineDir)}.`;
          if (missing) diffNote += ` ${missing} viewport(s) had no baseline and were skipped.`;
          for (const row of diffRows) {
            const pct = (row.changed / row.total) * 100;
            if (!Number.isNaN(maxDiff) && pct > maxDiff) {
              add('P1', 'visual-regression', `${row.name}: ${pct.toFixed(2)}% of pixels changed, over the --max-diff ${maxDiff}% budget (diff: ${path.relative(CWD, row.file)})`);
            }
            if (row.heightDelta) {
              add('P2', 'layout-height-shift', `${row.name}: full-page height moved by ${row.heightDelta}px — confirm this was intended and did not push content below the fold`);
            }
          }
        } else {
          diffNote = `**DIFF FAILED.** ${(dr.stderr || dr.stdout).trim().split('\n')[0]} — viewports remain uncompared.`;
        }
      }
    }
  } else if (mode === 'baseline') {
    diffNote = screenshots.length
      ? `Baseline recorded in ${path.relative(CWD, shotDir)}. Make the change, then rerun with \`--compare\`.`
      : '**NOT RUN.** No screenshots were captured, so no baseline exists. Install Playwright and rerun.';
  }

  const diffSection = mode === 'single' ? [] : [
    '## Iteration Diff',
    '',
    diffNote || 'Not applicable.',
    '',
    diffRows.length
      ? ['| Viewport | Pixels changed | % of frame | Changed band (y) | Height Δ | Diff image |',
        '|---|---|---|---|---|---|',
        ...diffRows.map(r => `| ${r.name} | ${r.changed.toLocaleString()} | ${((r.changed / r.total) * 100).toFixed(2)}% | ${r.top === -1 ? '—' : `${r.top}–${r.bottom}`} | ${r.heightDelta > 0 ? '+' : ''}${r.heightDelta}px | ${path.relative(CWD, r.file)} |`),
        '',
        'A percentage is a measurement, not a verdict: a deliberate redesign *should* move',
        'most of the frame. Read the changed band — motion outside the region you edited is',
        'the finding worth chasing.'].join('\n')
      : '',
    '',
  ];

  const report = [
    '# DesignOS Visual QA',
    '',
    `Target: ${target}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Browser Pass',
    '',
    browserNote,
    screenshots.length ? '\nScreenshots:\n' + screenshots.map(s => `- ${path.relative(CWD, s)}`).join('\n') : '',
    '',
    ...diffSection,
    '## Static Visual Risk Findings',
    '',
    findings.length ? findings.map(f => `- **${f.severity} / ${f.code}** — ${f.message}`).join('\n') : 'No static visual-risk findings.',
    '',
    '## Manual Viewports',
    '',
    'An unchecked box means UNVERIFIED — report it as unverified, never as inspected.',
    '',
    '- [ ] 375px mobile',
    '- [ ] 768px tablet',
    '- [ ] 1024px laptop',
    '- [ ] 1440px desktop',
    '- [ ] Keyboard-only path',
    '- [ ] Reduced-motion mode',
    '',
  ].join('\n');
  fs.writeFileSync(outPath, report);
  ok(`Visual QA report written to ${path.relative(CWD, outPath)}`);
  if (findings.some(f => f.severity === 'P1') && !args.includes('--no-fail')) process.exit(1);
}

/* ---------- suggest: deterministic design-system recommendation ---------- */
function suggestLuminance(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function suggestRatio(a, b) {
  const [l1, l2] = [suggestLuminance(a), suggestLuminance(b)].sort((x, y) => y - x);
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
}

function suggest(args) {
  const briefText = args.filter(a => !a.startsWith('--')).join(' ').toLowerCase();
  if (!briefText) fail(`usage: ${RUN} suggest <brief text>  e.g. ${RUN} suggest "pricing page for a security SaaS, dark"`);
  const { SECTORS, SURFACES } = require('./suggest-data.js');

  const score = (keywords) => keywords.reduce((s, k) =>
    s + (new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(briefText) ? (k.includes(' ') ? 2 : 1) : 0), 0);

  const rank = (table) => Object.entries(table)
    .map(([key, v]) => {
      // the entry's own name is its strongest keyword ("cybersecurity", "real-estate")
      const nameHit = new RegExp(`\\b${key.replace(/-/g, '[ -]?')}`, 'i').test(briefText) ? 2 : 0;
      // generic buckets (saas) lose ties to specific sectors: "cybersecurity SaaS" → cybersecurity
      return { key, v, s: score(v.keywords) + nameHit - (v.generic ? 0.5 : 0) };
    })
    .sort((a, b) => b.s - a.s);

  const sectors = rank(SECTORS);
  const surfaces = rank(SURFACES);
  const sector = sectors[0].s > 0 ? sectors[0] : null;
  const surface = surfaces[0].s > 0 ? surfaces[0] : null;
  const S = sector ? sector.v : SECTORS.saas;
  const P = S.palette;

  // verify every declared pair at output time — a recommendation that fails its
  // own ratios must never print (the honesty guarantee vs. mood-board generators)
  const pairs = [
    ['text on bg', P.text, P.bg, 4.5],
    ['muted on bg', P.muted, P.bg, 4.5],
    ['muted on surface', P.muted, P.surface, 4.5],
    ['CTA label on accent', P.onAccent, P.accent, 4.5],
    ['accent on bg (UI/large)', P.accent, P.bg, 3],
  ];
  const verified = pairs.map(([label, fg, bg, min]) => {
    const r = suggestRatio(fg, bg);
    if (r < min) fail(`suggest-data integrity: "${label}" ${fg} on ${bg} = ${r}:1 < ${min}:1 — fix bin/suggest-data.js before shipping recommendations`);
    return `    ${label.padEnd(26)} ${fg} on ${bg}  ${String(r).padEnd(6)} ≥ ${min}:1 ✓`;
  });

  const lines = [];
  const push = (s = '') => lines.push(s);
  push(`# DesignOS recommendation`);
  push();
  push(`BRIEF: ${args.filter(a => !a.startsWith('--')).join(' ')}`);
  push(`SECTOR: ${sector ? sector.key : 'none matched — generic SaaS defaults'}  ·  SURFACE: ${surface ? surface.key : 'unspecified'}`);
  push();
  push(`STYLE DIRECTION (${S.module})`);
  push(`  ${S.style}`);
  const wantsDark = /\bdark\b/.test(briefText);
  const wantsLight = /\blight\b/.test(briefText);
  if ((wantsDark && S.theme === 'light') || (wantsLight && S.theme === 'dark')) {
    const asked = wantsDark ? 'dark' : 'light';
    push(`  Theme: brief explicitly asks ${asked}; sector default is ${S.theme}. Honor the brief —`);
    push(`  derive the ${asked} variant deliberately via foundations/dark-mode.md (the palette below`);
    push(`  is the ${S.theme} reference; re-verify every pair after conversion).`);
  } else {
    push(`  Theme: ${S.theme} — committed deliberately (foundations/dark-mode.md), not by accident.`);
  }
  push();
  if (surface) {
    push(`STRUCTURE (${surface.v.modules[0]})`);
    push(`  ${surface.v.spine}`);
    push(`  ${surface.v.note}`);
    push();
  }
  push(`PALETTE — every pair computed now, not assumed (foundations/colors.md)`);
  push(`  accent ${P.accent} · hover ${P.accentHover} · on-accent ${P.onAccent}`);
  push(`  bg ${P.bg} · surface ${P.surface} · text ${P.text} · muted ${P.muted}`);
  verified.forEach(v => push(v));
  push();
  push(`TYPOGRAPHY (foundations/typography.md)`);
  push(`  Display: ${S.type.display}`);
  push(`  Body:    ${S.type.body}`);
  push(`  Mood:    ${S.type.mood}`);
  push();
  push(`KEY EFFECTS (motion/principles.md budget applies)`);
  S.effects.forEach(e => push(`  · ${e}`));
  push();
  push(`AVOID (sector anti-patterns)`);
  S.avoid.forEach(a => push(`  · ${a}`));
  push();
  push(`LOAD BEFORE DESIGNING`);
  const mods = [S.module, ...(surface ? surface.v.modules : ['patterns/landing-pages.md'])];
  [...new Set(mods)].forEach(m => push(`  · ${m}`));
  push();
  push(`GATE — a recommendation is not a score. Before any "done":`);
  push(`  node ${path.relative(CWD, path.join(PKG_ROOT, 'bin', 'designos.js'))} review <file> --min 95`);
  push(`  node ${path.relative(CWD, path.join(PKG_ROOT, 'bin', 'designos.js'))} audit <dir>`);
  if (sectors[1] && sectors[1].s > 0 && sector) {
    push();
    push(`(runner-up sector: ${sectors[1].key} — if the brief leans that way, re-run with clearer wording)`);
  }
  console.log(lines.join('\n'));
}

/* ---------- doctor: install health ---------- */
/* ---------- find: retrieval over the curated library ---------- */
const STOPWORDS = new Set(['a', 'an', 'and', 'the', 'for', 'to', 'of', 'in', 'on', 'with', 'is', 'it', 'that', 'i', 'my', 'me', 'how', 'do']);
const tokenize = (s) => String(s).toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1 && !STOPWORDS.has(t));

/**
 * Okapi BM25 over the library. Small corpus, but the saturation and length-normalisation
 * still matter: without them a long `when` field outranks an exact tag match, which is
 * the opposite of useful.
 */
function bm25(docs, query, k1 = 1.2, b = 0.75) {
  const terms = tokenize(query);
  if (!terms.length) return [];
  const N = docs.length;
  const lens = docs.map(d => d.tokens.length);
  const avgdl = lens.reduce((a, c) => a + c, 0) / N || 1;
  const df = new Map();
  for (const d of docs) for (const t of new Set(d.tokens)) df.set(t, (df.get(t) || 0) + 1);

  return docs.map((d, i) => {
    let score = 0;
    for (const t of terms) {
      const n = df.get(t) || 0;
      if (!n) continue;
      const tf = d.tokens.filter(x => x === t).length;
      if (!tf) continue;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (lens[i] / avgdl)));
    }
    return { doc: d, score };
  }).filter(r => r.score > 0).sort((a, b2) => b2.score - a.score);
}

function find(args) {
  const query = positionals(args).join(' ').trim();
  const limit = Number(argValue(args, '--limit', '3')) || 3;
  const kindFlag = argValue(args, '--kind', '');
  if (!query) {
    fail(`Usage: ${RUN} find <query> [--kind motion|type|graph] [--limit 3]\n  e.g. ${RUN} find "accordion expand height"\n       ${RUN} find "dashboard dense table" --kind type\n       ${RUN} find "fintech success state" --kind graph --platform ios`);
  }
  const { MOTION_PRESETS, TYPE_PAIRINGS } = require('./library-data.js');
  const docs = [];
    if (!kindFlag || kindFlag === 'motion') {
    for (const p of MOTION_PRESETS) {
      // name and tags are weighted by repetition — the cheapest honest field boost
      const text = `${p.name} ${p.name} ${p.tags.join(' ')} ${p.tags.join(' ')} ${p.id} ${p.tier} ${p.when} ${p.doNot} ${p.module}`;
      docs.push({ kind: 'motion', item: p, tokens: tokenize(text) });
    }
  }
    if (!kindFlag || kindFlag === 'type') {
    for (const t of TYPE_PAIRINGS) {
      const text = `${t.display} ${t.body} ${t.mono} ${t.tags.join(' ')} ${t.tags.join(' ')} ${t.sectors.join(' ')} ${t.sectors.join(' ')} ${t.why} ${t.avoidWhen} typography typeface font pairing`;
      docs.push({ kind: 'type', item: t, tokens: tokenize(text) });
    }
  }
  const graphFilterEntries = ['platform', 'state', 'evidence', 'sector', 'surface']
    .map(name => [name, argValue(args, `--${name}`, '')]).filter(([, filterValue]) => filterValue);
  const graphFilters = graphFilterEntries.map(([, filterValue]) => filterValue);
  if (!kindFlag || kindFlag === 'graph') {
    const { graphNodes } = require('./intelligence.js');
    for (const node of graphNodes()) {
      const text = `${node.label} ${node.label} ${node.type} ${node.file} ${node.text || ''}`;
      docs.push({ kind: 'graph', item: node, tokens: tokenize(text) });
    }
  }

  const queryTokens = tokenize(query);
  const hits = bm25(docs, `${query} ${graphFilters.join(' ')}`).map(hit => {
    if (hit.doc.kind !== 'graph') return hit;
    const node = hit.doc.item;
    const labelTokens = tokenize(node.label);
    const exactLabelBoost = queryTokens.some(token => labelTokens.includes(token)) ? 10 : 0;
    const filterBoost = graphFilterEntries.reduce((score, [filterType, filterValue]) => {
      const filterTokens = tokenize(filterValue);
      const exactTypeMatch = node.type === filterType && filterTokens.some(token => labelTokens.includes(token));
      const contentMatch = filterTokens.some(token => hit.doc.tokens.includes(token));
      return score + (exactTypeMatch ? 14 : contentMatch ? 2 : 0);
    }, 0);
    return { ...hit, score: hit.score + exactLabelBoost + filterBoost };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
  if (!hits.length) {
    warn(`No library entry matches "${query}".`);
    log('The library is deliberately small and curated — a miss means the answer is not in it,');
    log('not that any answer will do. Route to the module instead (CLAUDE.md §2) and decide there.');
    return;
  }

  console.log(`\n  \x1b[36mDesignOS library — "${query}"\x1b[0m\n`);
  for (const { doc, score } of hits) {
    const it = doc.item;
    if (doc.kind === 'motion') {
      console.log(`  \x1b[1m${it.name}\x1b[0m  \x1b[2m[${it.tier} · score ${score.toFixed(2)}]\x1b[0m`);
      console.log(`  ${it.when}`);
      if (it.tokens.length) console.log(`  \x1b[2mtokens:\x1b[0m ${it.tokens.join(' · ')}`);
      console.log('');
      for (const line of it.code.split('\n')) console.log(`    \x1b[2m${line}\x1b[0m`);
      console.log(`\n  \x1b[33m✗\x1b[0m ${it.doNot}`);
      console.log(`  \x1b[2mgoverned by ${it.module}\x1b[0m\n`);
    } else if (doc.kind === 'type') {
      console.log(`  \x1b[1m${it.display} + ${it.body}\x1b[0m \x1b[2m(mono: ${it.mono}) [score ${score.toFixed(2)}]\x1b[0m`);
      console.log(`  ${it.why}`);
      console.log(`  \x1b[33m✗ avoid when:\x1b[0m ${it.avoidWhen}`);
      console.log(`  \x1b[2msectors: ${it.sectors.join(' · ')}\x1b[0m\n`);
    } else {
      console.log(`  \x1b[1m${it.label}\x1b[0m  \x1b[2m[graph:${it.type} · score ${score.toFixed(2)}]\x1b[0m`);
      console.log(`  ${it.file}`);
      console.log(`  \x1b[2mgoverning graph node ${it.id}\x1b[0m\n`);
    }
  }
  log('Retrieved, not recalled. The module still governs — this is the artefact, not the argument.');
}

function doctor() {
  require('./cli/commands/system').doctor(commandContext());
}

/* ---------- product intelligence engines ---------- */
function commandContext() {
  return { cwd: CWD, pkgRoot: PKG_ROOT, run: RUN, fail, ok, warn, log, argValue, firstPositional, positionals };
}

function intelligence(command, args) {
  require('./cli/commands/intelligence').execute(command, args, commandContext());
}

function motionLabCommand(target, args) {
  require('./cli/commands/motion').execute('motion-lab', target, args, commandContext());
}

function liveCommand(target, args) {
  require('./cli/commands/live').execute(target, args, commandContext());
}

function gestureStudioCommand(args) {
  const output = require('./gesture-studio').gestureStudio(args, commandContext().cwd);
  commandContext().ok(`Gesture Studio generated at ${output}`);
}

function hooksCommand(args) {
  require('./cli/commands/system').hooks(args, commandContext());
}

function goldenCommand(args) {
  require('./cli/commands/evidence').execute(args, commandContext());
}

function help() {
  require('./cli/commands/system').help(commandContext());
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
  case 'export': exportRules(rest.find(a => !a.startsWith('--')) || 'all', flags.force); break;
  case 'audit': audit(firstPositional(rest)); break;
  case 'detect': require('./cli/commands/detect').execute(firstPositional(rest), rest, commandContext()); break;
  case 'motion-gaps': require('./cli/commands/motion-gaps').execute(firstPositional(rest), rest, commandContext()); break;
  case 'review': review(firstPositional(rest), rest); break;
  case 'visual': visual(firstPositional(rest), rest); break;
  case 'report': report(firstPositional(rest), rest); break;
  case 'elevate': elevate(firstPositional(rest), rest); break;
  case 'brief': brief(rest); break;
  case 'find': find(rest); break;
  case 'knowledge':
  case 'coverage':
  case 'motion-decide':
  case 'motion-recipe':
  case 'signature':
  case 'compose':
  case 'asset-direct': intelligence(cmd, rest); break;
  case 'motion-lab': motionLabCommand(firstPositional(rest), rest); break;
  case 'gesture-studio': gestureStudioCommand(rest); break;
  case 'motion-profile':
  case 'motion-regression':
    require('./cli/commands/motion').execute(cmd, firstPositional(rest), rest, commandContext()); break;
  case 'adapter-conformance':
  case 'motion-graph':
  case 'motion-torture':
  case 'genome':
  case 'composition-compile':
  case 'responsive-solve':
  case 'state-matrix':
  case 'mutation-test':
  case 'consistency':
  case 'native-motion':
    require('./cli/commands/leader').execute(cmd, rest, commandContext()); break;
  case 'live': liveCommand(firstPositional(rest), rest); break;
  case 'hooks': hooksCommand(rest); break;
  case 'golden': goldenCommand(rest); break;
  case 'suggest': suggest(rest); break;
  case 'starter': starter(firstPositional(rest), rest); break;
  case 'eval':
  case 'case':
    require('./cli/commands/community').execute(cmd, firstPositional(rest), rest, commandContext()); break;
  case 'doctor': doctor(); break;
  case 'help':
  case undefined: help(); break;
  default: fail(`Unknown command "${cmd}" — try: ${RUN} help`);
}
