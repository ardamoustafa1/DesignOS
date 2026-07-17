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
 *   node DesignOS/bin/designos.js export <target>   cursor · copilot · windsurf · cline · aider · agentsmd · all
 *   node DesignOS/bin/designos.js audit <dir>
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
]);

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

function exportRules(targetName, force) {
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
  for (const m of raw.matchAll(knownLogoProof)) {
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
  console.log(`Current gate: ${report.summary.overall}/100. Required gate: ${min}/100.\n`);
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
  if (!noFail && summary.overall < min) process.exit(1);
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
    `Overall gate: ${report.summary.overall}/100`,
    '',
    '| Dimension | Score |',
    '|---|---:|',
  ];
  for (const [dim, score] of Object.entries(report.summary.scores)) {
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
    `Gate: ${reviewReport.summary.overall}/100 (required ${min}/100)`,
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
    '- [ ] Mobile 375px inspected',
    '- [ ] Desktop 1440px inspected',
    '- [ ] Keyboard-only path verified',
    '- [ ] Reduced-motion mode verified',
    '- [ ] Fake proof removed or sourced',
    '- [ ] Memory updated with final decisions',
    '',
  ].join('\n');
  fs.writeFileSync(outPath, sections);
  ok(`Delivery report written to ${path.relative(CWD, outPath)}`);
  if (!args.includes('--no-fail') && reviewReport.summary.overall < min) process.exit(1);
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
  if (reviewReport.summary.overall < min && !args.includes('--no-fail')) process.exit(1);
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
    '- Run research -> wireframe -> UI -> review -> accessibility -> performance -> refactor.',
    '- Score UI Craft, UX Flow, Accessibility, Performance, Modernity, and Conversion.',
    '- Run the deterministic final gate before claiming a score: review, elevate, visual, then report.',
    '- Redo any dimension under 95 before delivery.',
    '- Do not claim 95+, 100/100, zero findings, or SHIP unless the deterministic review output proves it.',
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
    '- A production-ready artifact plus deterministic gate output, scorecard, key decisions, and remaining risks.',
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
  if (!target) fail(`Usage: ${RUN} visual <html-file-or-url> [--out designos-visual-report.md]`);
  const outPath = path.resolve(CWD, argValue(args, '--out', 'designos-visual-report.md'));
  const shotDir = path.resolve(CWD, argValue(args, '--screenshots', 'designos-visual'));
  const isUrl = /^https?:\/\//i.test(target);
  const abs = isUrl ? target : path.resolve(CWD, target);
  if (!isUrl && !fs.existsSync(abs)) fail(`Visual target not found: ${target}`);

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

  let browserNote = 'Browser render not run. Install Playwright in the project to enable screenshot QA.';
  let browserFindings = [];
  let screenshots = [];
  const playwrightCheck = spawnSync('node', ['-e', 'const m="play"+"wright"; require(m); console.log("ok")'], { cwd: CWD, encoding: 'utf8' });
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
      'const viewports=[["mobile",375,812],["tablet",768,1024],["desktop",1440,1000]];',
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
      '    return {',
      '      scrollWidth: document.documentElement.scrollWidth,',
      '      clientWidth: document.documentElement.clientWidth,',
      '      bodyTextLength: bodyText.length,',
      '      h1: Boolean(h1),',
      '      main: Boolean(main),',
      '      heroHeight: main ? main.getBoundingClientRect().height : 0',
      '    };',
      '  });',
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
    const run = spawnSync('node', ['-e', script], { cwd: CWD, encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
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
    '## Static Visual Risk Findings',
    '',
    findings.length ? findings.map(f => `- **${f.severity} / ${f.code}** — ${f.message}`).join('\n') : 'No static visual-risk findings.',
    '',
    '## Manual Viewports',
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

/* ---------- eval/case: community proof scaffolding ---------- */
function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';
}

function nextRunId() {
  const runsDir = path.join(CWD, 'evals', 'runs');
  const names = fs.existsSync(runsDir) ? fs.readdirSync(runsDir) : [];
  const max = names.reduce((acc, name) => {
    const m = name.match(/run-(\d+)/i);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 2);
  return String(max + 1).padStart(3, '0');
}

function evalRun(slug, args) {
  if (!slug) fail(`Usage: ${RUN} eval <slug> [--agent cursor] [--brief B-001] [--runner "@you"] [--model "model name"]`);
  const id = nextRunId();
  const safeSlug = slugify(slug);
  const relDir = path.join('evals', 'runs', `run-${id}-${safeSlug}`);
  const absDir = path.join(CWD, relDir);
  if (fs.existsSync(absDir) && !args.includes('--force')) fail(`${relDir} already exists. Re-run with --force to overwrite.`);
  fs.mkdirSync(path.join(absDir, 'control'), { recursive: true });
  fs.mkdirSync(path.join(absDir, 'treatment'), { recursive: true });
  fs.mkdirSync(path.join(absDir, 'logs'), { recursive: true });
  const data = {
    id,
    date: new Date().toISOString().slice(0, 10),
    runner: argValue(args, '--runner', 'TODO'),
    agent: argValue(args, '--agent', 'TODO'),
    model: argValue(args, '--model', 'TODO'),
    brief: argValue(args, '--brief', 'TODO'),
  };
  const body = [
    `# Run ${data.id} — ${safeSlug}`,
    '',
    '> Independent eval runs can be positive, mixed, or negative. The only failure is hiding raw conditions.',
    '',
    '## Metadata',
    '',
    '| Field | Value |',
    '|---|---|',
    `| Date | ${data.date} |`,
    `| Runner | ${data.runner} |`,
    `| Agent surface | ${data.agent} |`,
    `| Model(s) | ${data.model} |`,
    `| Brief set | ${data.brief} |`,
    '| DesignOS commit SHA | TODO |',
    '| Time budget | TODO |',
    '| Follow-up steering | none / explain |',
    '',
    '## Raw Artifacts',
    '',
    '- Control output: `control/`',
    '- Treatment output: `treatment/`',
    '- Logs: `logs/`',
    '',
    '## Commands',
    '',
    '```bash',
    'node validators/check-drift.js evals/runs/' + `run-${data.id}-${safeSlug}` + '/control',
    'node validators/check-a11y-basics.js evals/runs/' + `run-${data.id}-${safeSlug}` + '/control',
    'node validators/check-drift.js evals/runs/' + `run-${data.id}-${safeSlug}` + '/treatment',
    'node validators/check-a11y-basics.js evals/runs/' + `run-${data.id}-${safeSlug}` + '/treatment',
    '```',
    '',
    '## Validator Results',
    '',
    '| Brief | Arm | Drift findings | A11y findings | Contrast notes |',
    '|---|---|---:|---:|---|',
    `| ${data.brief} | Control | TODO | TODO | TODO |`,
    `| ${data.brief} | Treatment | TODO | TODO | TODO |`,
    '',
    '## Blind Judge Results',
    '',
    '| Brief | Arm | Hierarchy | Craft | Accessibility | States | Distinctiveness | Fitness | Median total |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|',
    `| ${data.brief} | Control | TODO | TODO | TODO | TODO | TODO | TODO | TODO |`,
    `| ${data.brief} | Treatment | TODO | TODO | TODO | TODO | TODO | TODO | TODO |`,
    '',
    '## Findings',
    '',
    '### Where DesignOS helped',
    '',
    '- TODO',
    '',
    '### Where DesignOS hurt or added cost',
    '',
    '- TODO',
    '',
    '### Ambiguous results',
    '',
    '- TODO',
    '',
    '## Conclusion',
    '',
    'TODO: State the result honestly. Avoid universal claims.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(absDir, 'README.md'), body);
  ok(`Eval run scaffolded at ${relDir}`);
  log(`Next: add raw outputs to control/ and treatment/, then run validators and fill README.md.`);
}

function caseStudy(slug, args) {
  if (!slug) fail(`Usage: ${RUN} case <slug> [--project "Project"] [--url https://...] [--author "@you"] [--surface pricing]`);
  const safeSlug = slugify(slug);
  const rel = path.join('case-studies', `${safeSlug}.md`);
  const abs = path.join(CWD, rel);
  if (fs.existsSync(abs) && !args.includes('--force')) fail(`${rel} already exists. Re-run with --force to overwrite.`);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const project = argValue(args, '--project', safeSlug);
  const url = argValue(args, '--url', 'TODO');
  const source = argValue(args, '--source', 'TODO');
  const author = argValue(args, '--author', 'TODO');
  const stack = argValue(args, '--stack', 'TODO');
  const surface = argValue(args, '--surface', 'TODO');
  const summary = argValue(args, '--summary', 'TODO: one honest sentence on what DesignOS changed.');
  const body = [
    `# ${project} — DesignOS Case Study`,
    '',
    '## Summary',
    '',
    `- Project: ${project}`,
    `- Author: ${author}`,
    `- Date: ${new Date().toISOString().slice(0, 10)}`,
    `- Agent/tool: TODO`,
    `- Stack: ${stack}`,
    `- Surface: ${surface}`,
    `- Public link: ${url}`,
    `- Source link: ${source}`,
    `- Honest summary: ${summary}`,
    '',
    '## Starting Point',
    '',
    'TODO: Describe the original brief, target user, business goal, constraints, and known design issues.',
    '',
    '## DesignOS Setup',
    '',
    '- `brain/design-intelligence.md`',
    '- `loops/design-loop.md`',
    '- TODO: relevant component/pattern modules',
    '- TODO: relevant industry module',
    '- TODO: memory files used or created',
    '',
    '## Before / After',
    '',
    '- Desktop before: TODO',
    '- Desktop after: TODO',
    '- Mobile before: TODO',
    '- Mobile after: TODO',
    '',
    '## Decisions',
    '',
    '| Decision | Why it was made | Module/rule |',
    '|---|---|---|',
    '| TODO | TODO | TODO |',
    '',
    '## Scorecard',
    '',
    '| Dimension | Score | Evidence |',
    '|---|---:|---|',
    '| UI Craft | TODO | TODO |',
    '| UX Flow | TODO | TODO |',
    '| Accessibility | TODO | TODO |',
    '| Performance | TODO | TODO |',
    '| Modernity | TODO | TODO |',
    '| Conversion | TODO | TODO |',
    '',
    '## What Failed First',
    '',
    '- TODO: contrast miss, hierarchy issue, fake proof removed, missing state added, or mobile layout fixed.',
    '',
    '## Caveats',
    '',
    'TODO: State what this case study does not prove.',
    '',
    '## Showcase Row',
    '',
    '```markdown',
    `| [${project}](${url}) | ${surface} | ${summary} |`,
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(abs, body);
  ok(`Case study scaffolded at ${rel}`);
  log(`Showcase row ready inside ${rel}.`);
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
    ${RUN} export <target>    rules for: cursor · copilot · windsurf · cline · aider · agentsmd · all
    ${RUN} audit <dir>        run all validators against a directory
    ${RUN} review <target>    deterministic design-risk report + six-dimension score
                             add --fix-prompt to print an agent-ready repair prompt
    ${RUN} visual <target>    visual QA checklist/report for HTML or URL
    ${RUN} report <target>    one-file delivery report: review gate + fix prompt + sign-off
    ${RUN} elevate <target>   premium refactor prompt: taste, signature, proof, hierarchy
    ${RUN} brief [options]    generate a high-signal brief for the agent
                             add --interactive for the 6-question prompt builder
    ${RUN} starter <name>     scaffold a DesignOS starter project
    ${RUN} eval <slug>        scaffold an independent benchmark run folder
    ${RUN} case <slug>        scaffold an external case study + SHOWCASE row
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
  case 'export': exportRules(rest.find(a => !a.startsWith('--')) || 'all', flags.force); break;
  case 'audit': audit(firstPositional(rest)); break;
  case 'review': review(firstPositional(rest), rest); break;
  case 'visual': visual(firstPositional(rest), rest); break;
  case 'report': report(firstPositional(rest), rest); break;
  case 'elevate': elevate(firstPositional(rest), rest); break;
  case 'brief': brief(rest); break;
  case 'starter': starter(firstPositional(rest), rest); break;
  case 'eval': evalRun(firstPositional(rest), rest); break;
  case 'case': caseStudy(firstPositional(rest), rest); break;
  case 'doctor': doctor(); break;
  case 'help':
  case undefined: help(); break;
  default: fail(`Unknown command "${cmd}" — try: ${RUN} help`);
}
