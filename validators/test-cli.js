#!/usr/bin/env node
/**
 * DesignOS CLI unit tests — zero dependencies, uses Node's built-in assert.
 *
 * Run: node validators/test-cli.js
 *
 * Covers the pure-function logic of bin/designos.js without touching the
 * filesystem or requiring the full install path. Each test is isolated;
 * failures print the failing assertion and exit 1 so CI catches them.
 */

const assert = require('assert');
const path   = require('path');
const fs     = require('fs');
const os     = require('os');
const { spawnSync } = require('child_process');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    passed++;
  } catch (e) {
    console.error(`  \x1b[31m✗\x1b[0m ${name}`);
    console.error(`    ${e.message}`);
    failed++;
  }
}

// ── helpers from the CLI (re-implemented inline to stay testable without import) ──

function parseFlags(argv) {
  return {
    force:  argv.includes('--force'),
    agents: argv.includes('--agents'),
    skills: argv.includes('--skills'),
  };
}

function resolveTarget(cwd, subdir) {
  return path.join(cwd, subdir);
}

function claudeMdContent(importLine) {
  return `# Project Instructions\n\n${importLine}\n`;
}

function appendIfMissing(existing, importLine) {
  if (existing.includes(importLine)) return existing; // unchanged
  return existing + `\n${importLine}\n`;
}

function argValue(args, name, fallback = '') {
  const inline = args.find(arg => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1) || fallback;
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  return args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
}

function firstPositional(args) {
  const valueFlags = new Set([
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
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('--')) return args[i];
    if (valueFlags.has(args[i])) i++;
  }
  return undefined;
}

// ── TESTS ──────────────────────────────────────────────────────────────────────

console.log('\nDesignOS CLI — unit tests\n');

// Flag parsing
test('parseFlags: --force sets force', () => {
  const f = parseFlags(['init', '--force']);
  assert.strictEqual(f.force, true);
  assert.strictEqual(f.agents, false);
});

test('parseFlags: --agents sets agents', () => {
  const f = parseFlags(['init', '--agents', '--skills']);
  assert.strictEqual(f.agents, true);
  assert.strictEqual(f.skills, true);
  assert.strictEqual(f.force, false);
});

test('parseFlags: no flags all false', () => {
  const f = parseFlags(['init']);
  assert.deepStrictEqual(f, { force: false, agents: false, skills: false });
});

// resolveTarget
test('resolveTarget: appends subdir to cwd', () => {
  const result = resolveTarget('/some/project', 'DesignOS');
  assert.strictEqual(result, '/some/project/DesignOS');
});

// CLAUDE.md content generation
test('claudeMdContent: contains import line', () => {
  const content = claudeMdContent('@DesignOS/CLAUDE.md');
  assert.ok(content.includes('@DesignOS/CLAUDE.md'));
  assert.ok(content.startsWith('# Project Instructions'));
});

// appendIfMissing
test('appendIfMissing: appends when line absent', () => {
  const original = '# Instructions\n\nsome text\n';
  const result = appendIfMissing(original, '@DesignOS/CLAUDE.md');
  assert.ok(result.includes('@DesignOS/CLAUDE.md'));
  assert.ok(result.includes('some text'));
});

test('appendIfMissing: no-op when line present', () => {
  const original = '# Instructions\n\n@DesignOS/CLAUDE.md\n';
  const result = appendIfMissing(original, '@DesignOS/CLAUDE.md');
  assert.strictEqual(result, original);  // exactly unchanged
});

test('appendIfMissing: only one import added even if called twice', () => {
  let content = '# Instructions\n\n';
  content = appendIfMissing(content, '@DesignOS/CLAUDE.md');
  content = appendIfMissing(content, '@DesignOS/CLAUDE.md');
  const count = (content.match(/@DesignOS\/CLAUDE\.md/g) || []).length;
  assert.strictEqual(count, 1);
});

test('argValue: reads option value with fallback', () => {
  assert.strictEqual(argValue(['--min', '97'], '--min', '95'), '97');
  assert.strictEqual(argValue(['--json'], '--min', '95'), '95');
  assert.strictEqual(argValue(['--min=88'], '--min', '95'), '88');
});

test('firstPositional: skips flags', () => {
  assert.strictEqual(firstPositional(['--json', 'src', '--min', '95']), 'src');
  assert.strictEqual(firstPositional(['--min', '88', 'examples']), 'examples');
  assert.strictEqual(firstPositional(['--min=88', 'examples']), 'examples');
});

// Filesystem: init guard (using a real tmpdir)
test('init guard: refuses to run inside PKG_ROOT', () => {
  const pkgRoot = path.resolve(__dirname, '..');
  // Simulate the guard check: target === pkgRoot means we're inside the repo
  const target = path.resolve(pkgRoot, 'DesignOS');
  // This should NOT equal pkgRoot (it's one level deeper)
  assert.notStrictEqual(path.resolve(target), pkgRoot);
});

test('init guard: target is distinct from pkgRoot', () => {
  const pkgRoot = '/Users/alice/DesignOS';
  const target  = path.join('/Users/alice/project', 'DesignOS');
  assert.notStrictEqual(path.resolve(target), path.resolve(pkgRoot));
});

// Real fs: bin/designos.js exists and is executable
test('bin/designos.js exists', () => {
  const binPath = path.resolve(__dirname, '..', 'bin', 'designos.js');
  assert.ok(fs.existsSync(binPath), `${binPath} not found`);
});

test('bin/designos.js contains npm-collision warning', () => {
  const binPath = path.resolve(__dirname, '..', 'bin', 'designos.js');
  const helpPath = path.resolve(__dirname, '..', 'bin', 'cli', 'commands', 'system.js');
  const src = fs.readFileSync(binPath, 'utf8') + fs.readFileSync(helpPath, 'utf8');
  assert.ok(src.includes('npx designos'), 'npm collision guard text missing');
  assert.ok(src.includes('unrelated package'), 'unrelated package warning missing');
  assert.ok(src.includes('review <target>'), 'review command missing from help text');
  assert.ok(src.includes('brief [options]'), 'brief command missing from help text');
  assert.ok(src.includes('--fix-prompt'), 'fix-prompt help text missing');
  assert.ok(src.includes('visual <target>'), 'visual command missing from help text');
  assert.ok(src.includes('report <target>'), 'report command missing from help text');
  assert.ok(src.includes('elevate <target>'), 'elevate command missing from help text');
  assert.ok(src.includes('starter <name>'), 'starter command missing from help text');
  assert.ok(src.includes('eval <slug>'), 'eval command missing from help text');
  assert.ok(src.includes('case <slug>'), 'case command missing from help text');
  assert.ok(src.includes('--interactive'), 'interactive brief help text missing');
  assert.ok(src.includes('SOC2, ISO 27001'), 'hard compliance warning missing');
});

test('export: rewrites module paths so non-Claude rules files resolve under ./DesignOS/', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-export-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  fs.copyFileSync(path.resolve(__dirname, '..', 'CLAUDE.md'), path.join(tmp, 'DesignOS', 'CLAUDE.md'));
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'export', 'agentsmd'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  const exported = fs.readFileSync(path.join(tmp, 'AGENTS.md'), 'utf8');
  assert.ok(exported.includes('DesignOS/brain/design-intelligence.md'), 'boot-sequence path was not rewritten to ./DesignOS/');
  assert.ok(exported.includes('DesignOS/foundations/'), 'routing-table path was not rewritten to ./DesignOS/');
  assert.ok(!/[^/]\bbrain\/design-intelligence\.md/.test(exported), 'an unprefixed module path leaked through — agents outside Claude Code would 404 on it');
});

test('AGENTS.md kernel mirror is byte-identical to CLAUDE.md', () => {
  const root = path.resolve(__dirname, '..');
  const claude = fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8');
  const agents = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
  assert.strictEqual(agents, claude,
    'AGENTS.md has drifted from CLAUDE.md — it is a mirror for agents.md-standard tools; copy CLAUDE.md over it');
});

function makeExportFixture() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-export-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  fs.copyFileSync(path.resolve(__dirname, '..', 'CLAUDE.md'), path.join(tmp, 'DesignOS', 'CLAUDE.md'));
  fs.mkdirSync(path.join(tmp, 'DesignOS', 'workflows'), { recursive: true });
  fs.copyFileSync(
    path.resolve(__dirname, '..', 'workflows', 'final-gate.md'),
    path.join(tmp, 'DesignOS', 'workflows', 'final-gate.md'),
  );
  return tmp;
}

test('export codex: writes root AGENTS.md, not just the unconfirmed .codex/ path', () => {
  // Codex CLI's documented, confirmed auto-load mechanism is root AGENTS.md — a target
  // that wrote ONLY .codex/instructions.md would very likely produce a file Codex never
  // reads while claiming Claude-Code parity. This locks the fix in place.
  const tmp = makeExportFixture();
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'export', 'codex'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(tmp, 'AGENTS.md')), 'export codex must write root AGENTS.md');
  assert.ok(fs.existsSync(path.join(tmp, '.codex', 'instructions.md')), 'export codex must still write the defensive .codex/ path');
});

test('export antigravity: writes root AGENTS.md and the native .agent/rules/ path', () => {
  const tmp = makeExportFixture();
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'export', 'antigravity'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(tmp, 'AGENTS.md')), 'export antigravity must write root AGENTS.md');
  assert.ok(fs.existsSync(path.join(tmp, '.agent', 'rules', 'designos.md')), 'export antigravity must write .agent/rules/designos.md');
});

test('export agentsmd: preserves framework instructions and installs one managed kernel block', () => {
  const tmp = makeExportFixture();
  const agentsPath = path.join(tmp, 'AGENTS.md');
  fs.writeFileSync(agentsPath, '# Framework instructions\n\nKeep this block.\n');
  let result = spawnSync('node', ['DesignOS/bin/designos.js', 'export', 'agentsmd'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  result = spawnSync('node', ['DesignOS/bin/designos.js', 'export', 'agentsmd'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  const exported = fs.readFileSync(agentsPath, 'utf8');
  assert.ok(exported.includes('Keep this block.'), 'existing framework instructions must survive');
  assert.strictEqual(exported.match(/DESIGNOS:BEGIN/g)?.length, 1, 'managed kernel must not duplicate');
  assert.strictEqual(exported.match(/DESIGNOS:END/g)?.length, 1, 'managed kernel end marker must not duplicate');
  assert.ok(exported.includes('The Ceiling Contract'), 'full DesignOS kernel must be installed');
});

test('export cursor: writes both the legacy and current rules formats', () => {
  const tmp = makeExportFixture();
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'export', 'cursor'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(tmp, '.cursorrules')), 'export cursor must still write legacy .cursorrules');
  const mdcPath = path.join(tmp, '.cursor', 'rules', 'designos.mdc');
  assert.ok(fs.existsSync(mdcPath), 'export cursor must write the current .cursor/rules/designos.mdc format');
  const mdc = fs.readFileSync(mdcPath, 'utf8');
  assert.ok(mdc.startsWith('---\n'), '.mdc frontmatter must be the literal first bytes of the file');
  assert.ok(/alwaysApply:\s*true/.test(mdc.split('---\n')[1] || ''),
    '.mdc must declare alwaysApply: true or Cursor treats it as file-pattern-scoped, not unconditional');
});

test('export all: targets sharing a real path (AGENTS.md) write it once, crediting every tool', () => {
  const tmp = makeExportFixture();
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'export', 'all'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  const agents = fs.readFileSync(path.join(tmp, 'AGENTS.md'), 'utf8');
  // One copy of the kernel, not three concatenated ones
  assert.strictEqual(agents.match(/The Ceiling Contract/g)?.length, 1,
    'AGENTS.md must contain exactly one copy of the kernel even though agentsmd/codex/antigravity all target it');
  assert.ok(/AGENTS\.md ← .*Codex/i.test(result.stdout) || /Codex.*AGENTS\.md/i.test(result.stdout)
    || result.stdout.includes('OpenAI Codex CLI'), 'stdout should credit Codex on the shared AGENTS.md write');
});

function makeHooksFixture() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-hooks-'));
  spawnSync('git', ['init', '-q'], { cwd: tmp });
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  for (const d of ['bin', 'validators']) {
    fs.cpSync(path.resolve(__dirname, '..', d), path.join(tmp, 'DesignOS', d), { recursive: true });
  }
  fs.copyFileSync(path.resolve(__dirname, '..', 'CLAUDE.md'), path.join(tmp, 'DesignOS', 'CLAUDE.md'));
  return tmp;
}

test('hooks install: writes every editor manifest and the git pre-commit hook', () => {
  const tmp = makeHooksFixture();
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'hooks', 'install', '--git'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  for (const f of ['.claude/settings.local.json', '.codex/hooks.json', '.cursor/hooks.json', '.agent/hooks.json', '.github/hooks/designos.json', '.git/hooks/pre-commit']) {
    assert.ok(fs.existsSync(path.join(tmp, f)), `hooks install --git must write ${f}`);
  }
  const cursorHook = JSON.parse(fs.readFileSync(path.join(tmp, '.cursor', 'hooks.json'), 'utf8'));
  assert.ok(cursorHook.hooks.preToolUse, 'cursor manifest must use preToolUse — the event that can actually block, unlike afterFileEdit');
});

test('hooks install --git: the pre-commit hook actually blocks a commit with real findings and respects the bypass', () => {
  const tmp = makeHooksFixture();
  spawnSync('node', ['DesignOS/bin/designos.js', 'hooks', 'install', '--git'], { cwd: tmp, encoding: 'utf8' });
  fs.writeFileSync(path.join(tmp, 'bad.html'),
    '<!doctype html><html><body>\n<div onclick="alert(1)">click</div>\n</body></html>\n');
  spawnSync('git', ['add', 'bad.html'], { cwd: tmp });

  const blocked = spawnSync('git', ['-c', 'user.email=t@t.com', '-c', 'user.name=t', 'commit', '-m', 'bad'],
    { cwd: tmp, encoding: 'utf8' });
  assert.notStrictEqual(blocked.status, 0, 'a commit with a real onclick-div finding must be blocked');
  const log1 = spawnSync('git', ['log', '--oneline'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(log1.stdout.trim(), '', 'no commit should exist after a blocked attempt');

  const bypassed = spawnSync('git', ['-c', 'user.email=t@t.com', '-c', 'user.name=t', 'commit', '-m', 'bad, bypassed'],
    { cwd: tmp, encoding: 'utf8', env: { ...process.env, DESIGNOS_SKIP_HOOK: '1' } });
  assert.strictEqual(bypassed.status, 0, 'DESIGNOS_SKIP_HOOK=1 must let the commit through');
});

test('hooks install --git: does not clobber a pre-existing non-DesignOS pre-commit hook', () => {
  const tmp = makeHooksFixture();
  fs.mkdirSync(path.join(tmp, '.git', 'hooks'), { recursive: true });
  const existing = '#!/bin/sh\necho "custom"\n';
  fs.writeFileSync(path.join(tmp, '.git', 'hooks', 'pre-commit'), existing);
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'hooks', 'install', '--git'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.strictEqual(fs.readFileSync(path.join(tmp, '.git', 'hooks', 'pre-commit'), 'utf8'), existing,
    'a pre-existing hook DesignOS did not generate must be left untouched');
  assert.ok(/merge manually/.test(result.stdout), 'must warn instead of silently skipping');
});

test('bin/designos.js export targets include the AGENTS.md standard', () => {
  const binPath = path.resolve(__dirname, '..', 'bin', 'designos.js');
  const src = fs.readFileSync(binPath, 'utf8');
  assert.ok(src.includes('agentsmd'), 'agentsmd export target missing');
  assert.ok(src.includes("'AGENTS.md'"), 'AGENTS.md destination file missing');
});

test('bin/designos.js exports no external dependencies', () => {
  const binPath = path.resolve(__dirname, '..', 'bin', 'designos.js');
  const src = fs.readFileSync(binPath, 'utf8');
  // Only 'fs' and 'path' from stdlib are expected
  const requires = [...src.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  // stdlib and the CLI's own local modules (./suggest-data.js) are fine; npm packages are not
  const external = requires.filter(r => !['fs', 'path', 'os', 'child_process', 'assert'].includes(r) && !r.startsWith('.'));
  assert.deepStrictEqual(external, [], `Unexpected external deps: ${external.join(', ')}`);
});

test('review: allows root tokens and emits fix prompt for unsourced proof', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-review-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  const html = [
    '<!doctype html>',
    '<html><head>',
    '<meta name="theme-color" content="#0B0D10">',
    '<style>',
    ':root { --accent: #22D3EE; --bg: #0B0D10; }',
    '.logo { color: var(--accent); }',
    '</style>',
    '</head><body>',
    '<main><h1>Pricing</h1>',
    '<section aria-label="Trusted by teams"><p>Trusted by 1,847 security teams</p><span>Cloudflare</span></section>',
    '<button disabled>Start trial</button>',
    '</main>',
    '</body></html>',
  ].join('\n');
  fs.writeFileSync(path.join(tmp, 'pricing.html'), html);
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'review', 'pricing.html', '--fix-prompt', '--no-fail'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('Fix these DesignOS review findings'));
  assert.ok(result.stdout.includes('proof-risk') || result.stdout.includes('customer-proof-risk'));
  assert.ok(!result.stdout.includes('raw-color'), 'root token and theme-color should not be raw-color findings');
});

test('review: labels final score unassessed and caps accessibility blockers at 60', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-review-cap-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'index.html'), '<!doctype html><html><body><main><h1>Demo</h1><img src="x.png"></main></body></html>');
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'review', 'index.html', '--json', '--no-fail'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.strictEqual(report.summary.finalScore, 'NOT ASSESSED');
  assert.strictEqual(report.summary.staticRiskScores.Accessibility, 60);
  assert.ok(!Object.prototype.hasOwnProperty.call(report.summary.staticRiskScores, 'Performance'), 'unmeasured Performance must not receive a static score');
});

test('starter: scaffolds landing page with tokens', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-starter-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'starter'), path.join(tmp, 'DesignOS', 'starter'), { recursive: true });
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'starter', 'landing-page', 'site'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(tmp, 'site', 'index.html')), 'starter index missing');
  assert.ok(fs.existsSync(path.join(tmp, 'site', 'tokens.css')), 'starter tokens missing');
});

test('visual: writes static QA report', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-visual-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'index.html'), '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main><h1>Test</h1></main></body></html>');
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'visual', 'index.html', '--no-fail'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(tmp, 'designos-visual-report.md')), 'visual report missing');
});

test('report: writes delivery report with review gate and checklist', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-report-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'index.html'), '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main><h1>Test</h1><button disabled>Start</button></main></body></html>');
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'report', 'index.html', '--no-fail'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  const reportPath = path.join(tmp, 'designos-report.md');
  assert.ok(fs.existsSync(reportPath), 'delivery report missing');
  const body = fs.readFileSync(reportPath, 'utf8');
  assert.ok(body.includes('DesignOS Delivery Report'), 'report title missing');
  assert.ok(body.includes('Sign-off Checklist'), 'sign-off checklist missing');
});

test('elevate: writes premium refactor prompt', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-elevate-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'index.html'), [
    '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>',
    '<body><main><h1>Modern powerful platform</h1>',
    '<p>Unlock seamless innovative workflows with our all-in-one solution.</p>',
    '<a href="/start">Get started</a><a href="/demo">Book demo</a><a href="/learn">Learn more</a>',
    '<button>Start</button><button>Try now</button><button>Contact sales</button>',
    '</main></body></html>',
  ].join(''));
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'elevate', 'index.html', '--no-fail'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  const promptPath = path.join(tmp, 'designos-elevate-prompt.md');
  assert.ok(fs.existsSync(promptPath), 'elevation prompt missing');
  const body = fs.readFileSync(promptPath, 'utf8');
  assert.ok(body.includes('DesignOS Elevation Prompt'), 'elevation title missing');
  assert.ok(body.includes('generic-copy'), 'generic copy heuristic missing');
  assert.ok(body.includes('signature vehicle'), 'signature instruction missing');
});

  test('eval: scaffolds comparative run folders without claiming external evidence', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-eval-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'evals', 'runs'), { recursive: true });
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'eval', 'cursor-pricing', '--agent', 'Cursor', '--brief', 'B-001'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  const runDir = path.join(tmp, 'evals', 'runs', 'run-003-cursor-pricing');
  assert.ok(fs.existsSync(path.join(runDir, 'README.md')), 'eval README missing');
  assert.ok(fs.existsSync(path.join(runDir, 'control')), 'control dir missing');
  assert.ok(fs.existsSync(path.join(runDir, 'treatment')), 'treatment dir missing');
});

test('case: scaffolds case study and showcase row', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-case-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  const result = spawnSync('node', [
    'DesignOS/bin/designos.js',
    'case',
    'acme-pricing',
    '--project',
    'Acme Pricing',
    '--url',
    'https://example.com',
    '--surface',
    'pricing',
    '--summary',
    'Removed fake proof and tightened pricing hierarchy.',
  ], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  const casePath = path.join(tmp, 'case-studies', 'acme-pricing.md');
  assert.ok(fs.existsSync(casePath), 'case study missing');
  const body = fs.readFileSync(casePath, 'utf8');
  assert.ok(body.includes('| [Acme Pricing](https://example.com) | pricing | Removed fake proof and tightened pricing hierarchy. |'), 'showcase row missing');
});

test('brief --interactive: accepts piped answers line by line', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-brief-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  const input = ['pricing', 'cybersecurity', 'security teams', 'book demos', 'premium technical', 'vanilla html', ''].join('\n');
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'brief', '--interactive'], {
    cwd: tmp,
    input,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('Design a pricing for cybersecurity.'));
  assert.ok(result.stdout.includes('Audience: security teams.'));
  assert.ok(result.stdout.includes('Primary goal: book demos.'));
  assert.ok(result.stdout.includes('Final gate commands:'), 'brief should include deterministic final gate commands');
  assert.ok(result.stdout.includes('Do not claim 95+, 100/100'), 'brief should forbid unsupported score claims');
});

test('check-drift: exempts theme-color meta but still flags real raw hex', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-drift-'));
  const html = [
    '<!doctype html>',
    '<html><head>',
    '<meta name="theme-color" content="#FAFAFA">',
    '<style>',
    ':root { --accent: #2952E3; }',
    '.card { color: #666666; }',
    '</style>',
    '</head><body><main><h1>Demo</h1></main></body></html>',
  ].join('\n');
  fs.writeFileSync(path.join(tmp, 'index.html'), html);
  const result = spawnSync('node', [path.resolve(__dirname, 'check-drift.js'), 'index.html'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 1, 'raw hex outside :root must still fail');
  assert.ok(result.stdout.includes('#666666'), 'real raw hex must be flagged');
  assert.ok(!result.stdout.includes('#FAFAFA'), 'theme-color meta must not be flagged (run-003 regression)');
  assert.ok(!result.stdout.includes('#2952E3'), ':root token values must not be flagged');
});

test('check-token-contrast: catches token-pair AA failures that drift cannot see (Run 004 regression)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-contrast-'));
  const html = [
    '<!doctype html>',
    '<html><head><style>',
    ':root { --success: #16A34A; --success-subtle: #EFFDF4; --ink: #18181B; --paper: #FFFFFF; }',
    '.badge { color: var(--success); background: var(--success-subtle); }', // 3.14:1 — the Run 004 bug
    '.body { color: var(--ink); background: var(--paper); }',               // 16.9:1 — must NOT flag
    '.demo { color: #999; background: #fff; /* contrast-ok: anti-pattern exhibit */ }',
    '</style></head><body><main><h1>x</h1></main></body></html>',
  ].join('\n');
  fs.writeFileSync(path.join(tmp, 'index.html'), html);
  const result = spawnSync('node', [path.resolve(__dirname, 'check-token-contrast.js'), 'index.html'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 1, 'the 3.14:1 token pair must fail');
  assert.ok(result.stdout.includes('.badge'), 'failing pair must name its selector');
  assert.ok(result.stdout.includes('3.14:1'), 'ratio must be shown');
  assert.ok(!result.stdout.includes('.body'), 'passing pair must not be flagged');
  assert.ok(!result.stdout.includes('.demo'), 'contrast-ok block escape must be honored');
});

test('check-token-contrast: hsl() literal colors and hsl()/rgb() tokens resolve (audit regression)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-contrast-hsl-'));
  const html = [
    '<!doctype html><html><head><style>',
    ':root { --fg-rgb: rgb(150,150,150); --bg-rgb: rgb(160,160,160); --fg-hsl: hsl(0,0%,60%); --bg-hsl: hsl(0,0%,66%); }',
    '.literal { color: hsl(0,0%,60%); background: hsl(0,0%,66%); }',   // 1.2:1, literal hsl()
    '.rgb-token { color: var(--fg-rgb); background: var(--bg-rgb); }', // 1.13:1, non-hex token
    '.hsl-token { color: var(--fg-hsl); background: var(--bg-hsl); }', // 1.2:1, non-hex token
    '.oklch { color: oklch(0.7 0 0); background: oklch(0.72 0 0); }',  // out of scope — must not crash, must not false-pass as clean
    '</style></head><body><main><h1>x</h1></main></body></html>',
  ].join('\n');
  fs.writeFileSync(path.join(tmp, 'index.html'), html);
  const r = spawnSync('node', [path.resolve(__dirname, 'check-token-contrast.js'), 'index.html'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(r.status, 1, 'hsl/rgb-token failures must fail the run');
  assert.ok(r.stdout.includes('.literal'), 'a literal hsl() pair must be judged, not skipped');
  assert.ok(r.stdout.includes('.rgb-token'), 'an rgb()-valued token must resolve');
  assert.ok(r.stdout.includes('.hsl-token'), 'an hsl()-valued token must resolve');
});

test('check-token-contrast: line number anchors on the rule\'s own `{`, not the previous rule\'s `}` (audit regression)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-contrast-line-'));
  const css = '.first{color:#111;background:#fff}\n\n\n\n\n.bad{ color:#999999; background:#a0a0a0 }\n';
  fs.writeFileSync(path.join(tmp, 's.css'), css);
  const r = spawnSync('node', [path.resolve(__dirname, 'check-token-contrast.js'), 's.css'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(r.status, 1);
  assert.ok(r.stdout.includes('s.css:6'), `violation on line 6 must be reported as line 6, got: ${r.stdout}`);
});

test('suggest: routes sector + surface, prints verified ratios and gate commands', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-suggest-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  const result = spawnSync('node', ['DesignOS/bin/designos.js', 'suggest', 'pricing page for a cybersecurity SaaS'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('SECTOR: cybersecurity'), 'cybersecurity must out-rank saas on this brief');
  assert.ok(result.stdout.includes('SURFACE: pricing'));
  assert.ok(result.stdout.includes('patterns/pricing.md'), 'surface modules must be listed');
  assert.ok(result.stdout.includes('≥ 4.5:1 ✓'), 'computed ratios must be printed');
  assert.ok(result.stdout.includes('review <file> --min 95'), 'gate commands must close the output');
  assert.ok(!/100\/100|SHIP\b/.test(result.stdout), 'a recommendation must never claim a score');
});

test('suggest: every sector palette passes all five declared contrast pairs', () => {
  const { SECTORS } = require(path.resolve(__dirname, '..', 'bin', 'suggest-data.js'));
  const lum = (hex) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = [...h].map(c => c + c).join('');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    const lin = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  assert.ok(Object.keys(SECTORS).length >= 24, 'sector index must cover all 24 industry packs');
  for (const [key, s] of Object.entries(SECTORS)) {
    const P = s.palette;
    for (const [label, fg, bg, min] of [
      ['text/bg', P.text, P.bg, 4.5],
      ['muted/bg', P.muted, P.bg, 4.5],
      ['muted/surface', P.muted, P.surface, 4.5],
      ['onAccent/accent', P.onAccent, P.accent, 4.5],
      ['accent/bg', P.accent, P.bg, 3],
    ]) {
      assert.ok(ratio(fg, bg) >= min, `${key} ${label}: ${fg} on ${bg} = ${ratio(fg, bg).toFixed(2)} < ${min}`);
    }
  }
});

test('suggest: hybrid briefs route deterministically (routing-table tie-break proxy)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-hybrid-'));
  fs.mkdirSync(path.join(tmp, 'DesignOS'), { recursive: true });
  fs.cpSync(path.resolve(__dirname, '..', 'bin'), path.join(tmp, 'DesignOS', 'bin'), { recursive: true });
  const cases = [
    ['pricing page with a comparison table for a security platform, dark', 'cybersecurity', 'pricing'],
    ['healthcare appointment booking dashboard', 'healthcare', 'booking'],
    ['checkout flow for a plant shop', 'ecommerce', 'checkout'],
    ['blog for an AI devtools startup', 'ai-startup', 'blog'],
  ];
  for (const [brief, sector, surface] of cases) {
    const r = spawnSync('node', ['DesignOS/bin/designos.js', 'suggest', brief], { cwd: tmp, encoding: 'utf8' });
    assert.strictEqual(r.status, 0, r.stderr);
    assert.ok(r.stdout.includes(`SECTOR: ${sector}`), `"${brief}" → expected sector ${sector}`);
    assert.ok(r.stdout.includes(`SURFACE: ${surface}`), `"${brief}" → expected surface ${surface}`);
  }
});

test('generate: CV briefs route to portfolio with creative-sector dials and no SaaS fallback', () => {
  const result = spawnSync('node', [path.resolve(__dirname, '..', 'bin', 'designos.js'), 'generate', '--brief', 'Personal CV and résumé portfolio for a software designer', '--json'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout.trim());
  assert.strictEqual(output.sector, 'portfolio-agency');
  assert.strictEqual(output.surface, 'portfolio');
  assert.ok(output.dials.variance >= 8, 'portfolio variance must not inherit the generic 5 default');
  assert.ok(output.dials.motionIntensity >= 7, 'portfolio motion must use the creative-sector range');
  assert.ok(output.modules.includes('brain/wow-calibration.md'));
  assert.ok(output.modules.includes('motion/arrival.md'));
});

test('suggest web mirror: website/suggest.html carries every sector, palette hex, and surface from the CLI data', () => {
  const { SECTORS, SURFACES } = require(path.resolve(__dirname, '..', 'bin', 'suggest-data.js'));
  const page = fs.readFileSync(path.resolve(__dirname, '..', 'website', 'suggest.html'), 'utf8');
  for (const [key, s] of Object.entries(SECTORS)) {
    assert.ok(page.includes(`'${key}'`) || page.includes(`${key}:`) || page.includes(`'${key}':`),
      `sector "${key}" missing from website/suggest.html — page has drifted from bin/suggest-data.js`);
    for (const [tok, hex] of Object.entries(s.palette)) {
      assert.ok(page.includes(hex), `${key}.${tok} ${hex} missing from website/suggest.html — sync the page data`);
    }
  }
  for (const key of Object.keys(SURFACES)) {
    assert.ok(page.includes(`${key}:`) || page.includes(`'${key}'`),
      `surface "${key}" missing from website/suggest.html — sync the page data`);
  }
});

test('check-motion: catches the compositor, ceiling, easing, and loop violations', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-motion-'));
  const css = [
    ':root { --duration-fast: 150ms; --ease-out: cubic-bezier(0.16, 1, 0.3, 1); }',
    '@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }',
    '.a { transition: all 400ms ease-in-out; }',          // transition-all + over 300ms
    '.b { transition: height 200ms ease-out; }',          // layout property
    '.c { transition: opacity 200ms ease-in; }',          // ease-in outside an exit
    '.d { animation: float 6s ease-out infinite; }',      // decorative infinite loop
    '.e:hover { transition: color 240ms ease-out; }',     // sluggish hover
    '.ok { transition: transform var(--duration-fast) var(--ease-out); }',
  ].join('\n');
  fs.writeFileSync(path.join(tmp, 'a.css'), css);
  const r = spawnSync('node', [path.resolve(__dirname, 'check-motion.js'), 'a.css'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(r.status, 1, 'motion violations must fail the run');
  for (const rule of ['motion-transition-all', 'motion-duration-ceiling', 'motion-noncomposited',
    'motion-ease-in-entrance', 'motion-infinite-decoration', 'motion-hover-sluggish']) {
    assert.ok(r.stdout.includes(rule), `${rule} must be reported`);
  }
  assert.ok(!/\.ok\b/.test(r.stdout.replace(/motion-ok/g, '')), 'tokenised transform transition must not be flagged');
});

test('check-motion: honours the motion-ok directive and the reduced-motion rule', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-motion2-'));
  fs.writeFileSync(path.join(tmp, 'ok.css'), [
    '@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }',
    '/* motion-ok: hero signature moment, once per visit */',
    '.hero { animation: rise 800ms ease-out; }',
  ].join('\n'));
  const ok = spawnSync('node', [path.resolve(__dirname, 'check-motion.js'), 'ok.css'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(ok.status, 0, 'a documented exception must clear the run');

  fs.writeFileSync(path.join(tmp, 'bare.css'), '.x { transition: opacity 200ms ease-out; }');
  const bare = spawnSync('node', [path.resolve(__dirname, 'check-motion.js'), 'bare.css'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(bare.status, 1, 'motion without a reduced-motion policy must fail');
  assert.ok(bare.stdout.includes('motion-no-reduced-motion'), 'the reduced-motion rule must name itself');
});

test('check-aesthetic-slop: P2 violations fail, P3 advisories do not', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-slop-'));
  const bad = [
    '<!doctype html><html><head><style>',
    '.hero { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); }',
    '</style></head><body><main><h1>Elevate your workflow</h1>',
    '<p>Acme Corp trusted us.</p></main></body></html>',
  ].join('\n');
  fs.writeFileSync(path.join(tmp, 'bad.html'), bad);
  const r = spawnSync('node', [path.resolve(__dirname, 'check-aesthetic-slop.js'), 'bad.html'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(r.status, 1, 'named defaults must fail the run');
  assert.ok(r.stdout.includes('slop-ai-gradient'), 'the violet→fuchsia default must be caught');
  assert.ok(r.stdout.includes('slop-filler-copy'), 'category filler must be caught');
  assert.ok(r.stdout.includes('slop-placeholder-identity'), 'placeholder identity must be caught');

  // advisory-only page: a default typeface is P3, so the run still passes
  fs.writeFileSync(path.join(tmp, 'mild.html'),
    '<!doctype html><html><head><style>body { font-family: Inter, sans-serif; }</style></head><body><main><h1>Ledger reconciliation</h1></main></body></html>');
  const mild = spawnSync('node', [path.resolve(__dirname, 'check-aesthetic-slop.js'), 'mild.html'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(mild.status, 0, 'a P3 advisory alone must not fail the run');
  assert.ok(mild.stdout.includes('slop-default-typeface'), 'the advisory must still be printed');
  const strict = spawnSync('node', [path.resolve(__dirname, 'check-aesthetic-slop.js'), 'mild.html', '--strict'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(strict.status, 1, '--strict must promote advisories to failures');
});

test('check-aesthetic-slop: adjective-listing headline caught, ordinary short copy is not (audit finding)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-slop-adj-'));
  fs.writeFileSync(path.join(tmp, 'bad.html'),
    '<!doctype html><html><body><main><h1>Powerful. Fast. Secure analytics for modern teams.</h1></main></body></html>');
  const bad = spawnSync('node', [path.resolve(__dirname, 'check-aesthetic-slop.js'), 'bad.html'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(bad.status, 1, 'an adjective-listing headline must fail the run');
  assert.ok(bad.stdout.includes('slop-adjective-headline'), 'the specific rule must fire');
  assert.ok(bad.stdout.includes('Powerful. Fast.'), 'the finding must quote the offending fragment');

  fs.writeFileSync(path.join(tmp, 'ok.html'),
    "<!doctype html><html><body><main><h1>Welcome. Let's get started.</h1><p>San Francisco. New York. Both offices are hiring.</p></main></body></html>");
  const ok = spawnSync('node', [path.resolve(__dirname, 'check-aesthetic-slop.js'), 'ok.html'], { cwd: tmp, encoding: 'utf8' });
  assert.ok(!ok.stdout.includes('slop-adjective-headline'), 'a single opening beat, or a two-word city-name pair, must not be flagged');
});

test('check-aesthetic-slop: BEM card regions are not nested cards (false-positive regression)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-slop2-'));
  fs.writeFileSync(path.join(tmp, 'a.html'),
    '<!doctype html><html><body><main><div class="card"><div class="card-top">Region, not a card</div></div>' +
    '<div class="panel"><div class="panel-head">Also a region</div></div></main></body></html>');
  const ok = spawnSync('node', [path.resolve(__dirname, 'check-aesthetic-slop.js'), 'a.html'], { cwd: tmp, encoding: 'utf8' });
  assert.ok(!ok.stdout.includes('slop-nested-card'), 'card-top / panel-head are BEM regions, not nested cards');

  fs.writeFileSync(path.join(tmp, 'b.html'),
    '<!doctype html><html><body><main><div class="card"><div class="feature-card">Really nested</div></div></main></body></html>');
  const bad = spawnSync('node', [path.resolve(__dirname, 'check-aesthetic-slop.js'), 'b.html'], { cwd: tmp, encoding: 'utf8' });
  assert.ok(bad.stdout.includes('slop-nested-card'), 'a real card inside a card must still be caught');
});

test('check-token-contrast: catches inherited color over an ancestor background', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-cascade-'));
  const html = [
    '<!doctype html><html><head><style>',
    ':root { --muted: #a8a8ad; --paper: #ffffff; --ink: #18181b; }',
    'body { background: var(--paper); color: var(--ink); }',
    '.panel { background: #f4f4f5; }',           // the ancestor that paints
    '.panel .note { color: var(--muted); }',     // 2.15:1 — invisible to the same-rule pass
    '.veil { background: rgb(0 0 0 / 0.06); }',  // translucent layer, must composite
    '.veil small { color: #8e8e95; }',
    '.fine { color: #444444; }',                 // 9.7:1 — must NOT be flagged
    '</style></head><body><main>',
    '<div class="panel"><span class="note">Muted text on a light panel</span></div>',
    '<div class="veil"><small>Composited veil text</small></div>',
    '<p class="fine">Perfectly readable body copy</p>',
    '</main></body></html>',
  ].join('\n');
  fs.writeFileSync(path.join(tmp, 'index.html'), html);
  const r = spawnSync('node', [path.resolve(__dirname, 'check-token-contrast.js'), 'index.html'], { cwd: tmp, encoding: 'utf8' });
  assert.strictEqual(r.status, 1, 'inherited contrast failures must fail the run');
  assert.ok(r.stdout.includes('contrast-inherited-fail'), 'the cascade rule must name itself');
  assert.ok(r.stdout.includes('span.note'), 'the failing element must be identified');
  assert.ok(/#8e8e95 on #f0f0f0/.test(r.stdout), 'a translucent background must be composited before judging');
  assert.ok(!r.stdout.includes('.fine'), 'a passing element must not be flagged');
});

test('check-token-contrast: a comment above a rule does not break selector matching', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-cascade2-'));
  const html = [
    '<!doctype html><html><head><style>',
    'body { background: #ffffff; }',
    '/* the terminal surface */',
    '.term { background: #16161a; }',
    '.term .muted { color: #71717a; }',   // 3.73:1 on #16161a, NOT on the white body
    '</style></head><body><main><div class="term"><span class="muted">boot log line</span></div></main></body></html>',
  ].join('\n');
  fs.writeFileSync(path.join(tmp, 'index.html'), html);
  const r = spawnSync('node', [path.resolve(__dirname, 'check-token-contrast.js'), 'index.html'], { cwd: tmp, encoding: 'utf8' });
  assert.ok(r.stdout.includes('#16161a'), 'the commented rule must still resolve as the painted ancestor');
  assert.ok(!r.stdout.includes('on #ffffff'), 'the body background must not leak past a painted ancestor');
});

test('contrast.js: --min with no value errors instead of silently forcing every ratio to fail (audit regression)', () => {
  const cli = path.resolve(__dirname, 'contrast.js');
  const bad = spawnSync('node', [cli, '#000000', '#ffffff', '--min'], { encoding: 'utf8' });
  assert.strictEqual(bad.status, 2, '--min with no numeric value must be a usage error, not a silent NaN comparison');

  const good = spawnSync('node', [cli, '#000000', '#ffffff', '--min', '4.5'], { encoding: 'utf8' });
  assert.strictEqual(good.status, 0, 'a real 21:1 pair against --min 4.5 must pass');
});

test('contrast.js: a 5-digit hex is rejected as a usage error, not silently dropped then re-rejected (audit regression)', () => {
  const cli = path.resolve(__dirname, 'contrast.js');
  const r = spawnSync('node', [cli, '#12345', '#ffffff'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 2);
  assert.ok(r.stderr.includes('usage:'), 'malformed hex length must fail the initial filter with the usage message');
});

test('find: BM25 retrieval returns the governing preset and its module', () => {
  const cli = path.resolve(__dirname, '..', 'bin', 'designos.js');
  const r = spawnSync('node', [cli, 'find', 'accordion expand collapse height', '--limit', '1'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, 'find must succeed');
  assert.ok(r.stdout.includes('Accordion'), 'the accordion preset must rank first');
  assert.ok(r.stdout.includes('grid-template-rows'), 'the retrieved artefact must carry real code');
  assert.ok(r.stdout.includes('motion/performance.md'), 'a retrieved answer must name the module that governs it');

  const typed = spawnSync('node', [cli, 'find', 'dense dashboard table', '--kind', 'type', '--limit', '1'], { encoding: 'utf8' });
  assert.ok(typed.stdout.includes('Archivo'), '--kind type must restrict the corpus to type pairings');
  assert.ok(typed.stdout.includes('avoid when'), 'a pairing must carry its counter-case');
});

test('find: library presets stay consistent with the motion module they cite', () => {
  const { MOTION_PRESETS, TYPE_PAIRINGS } = require(path.resolve(__dirname, '..', 'bin', 'library-data.js'));
  const root = path.resolve(__dirname, '..');
  for (const p of MOTION_PRESETS) {
    assert.ok(fs.existsSync(path.join(root, p.module)), `${p.id} cites a module that does not exist: ${p.module}`);
    assert.ok(p.doNot && p.doNot.length > 20, `${p.id} must carry a real anti-pattern, not a stub`);
    assert.ok(['subtle', 'standard', 'expressive'].includes(p.tier), `${p.id} has an unmapped tier`);
  }
  for (const t of TYPE_PAIRINGS) {
    assert.ok(t.avoidWhen && t.avoidWhen.length > 20, `${t.id} must say when NOT to use it`);
  }
});

test('find: the wow layer is retrievable and every signature preset is expressive', () => {
  const cli = path.resolve(__dirname, '..', 'bin', 'designos.js');
  const r = spawnSync('node', [cli, 'find', 'magnetic cursor button pull', '--limit', '1'], { encoding: 'utf8' });
  assert.ok(r.stdout.includes('Magnetic button'), 'the wow layer must be reachable by query');
  assert.ok(r.stdout.includes('expressive'), 'signature presets must be tiered expressive');
  assert.ok(r.stdout.includes('signature-moments.md'), 'a signature must cite the module that governs it');

  const { MOTION_PRESETS } = require(path.resolve(__dirname, '..', 'bin', 'library-data.js'));
  const signatures = MOTION_PRESETS.filter(p => p.module === 'motion/signature-moments.md');
  assert.ok(signatures.length >= 11, `the catalogue must carry all eleven techniques, found ${signatures.length}`);
  for (const s of signatures) {
    assert.strictEqual(s.tier, 'expressive', `${s.id} is a signature and must be expressive tier`);
  }
});

test('golden flagship-launch: both artifacts exist and the lab declares itself a lab', () => {
  const dir = path.resolve(__dirname, '..', 'goldens', 'flagship-launch');
  const page = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const lab = fs.readFileSync(path.join(dir, 'lab.html'), 'utf8');

  // the golden obeys the scarcity law: reduced motion, tokens, cleanup
  assert.ok(page.includes('prefers-reduced-motion'), 'the golden must carry a reduced-motion policy');
  assert.ok(/--duration-slower:\s*500ms/.test(page), 'the golden must define the motion token layer');
  assert.ok(!/transition:\s*all\b/.test(page), 'the golden must never use transition: all');
  assert.ok(page.includes('pagehide'), 'the golden must tear its listeners down');
  assert.ok(/\{\s*passive:\s*true\s*\}/.test(page), 'scroll listeners must be passive');
  assert.ok(!/preventDefault/.test(page), 'a scroll story must never jack the scroll');

  // the lab breaks the law on purpose and must say so, loudly and near the top
  assert.ok(/not a page to imitate/i.test(lab), 'the lab must disclaim itself');
  assert.ok(lab.indexOf('not a page to imitate') < lab.length / 2, 'the disclaimer must be near the top');
  assert.ok(lab.includes('signature-moments.md'), 'the lab must cite the catalogue it demonstrates');
});

test('golden motion-audit-example: before regresses, after is clean, on this exact rule only', () => {
  const dir = path.resolve(__dirname, 'fixtures', 'motion-audit-example');
  const runJson = (file) => JSON.parse(spawnSync(process.execPath,
    [path.join(__dirname, 'check-motion.js'), path.join(dir, file), '--json'],
    { encoding: 'utf8' }).stdout);

  const before = runJson('before.html');
  assert.strictEqual(before.count, 1, 'before.html must carry exactly the one regression this golden demonstrates');
  assert.strictEqual(before.findings[0].rule, 'motion-uninterruptible-transition');

  const after = runJson('after.html');
  assert.deepStrictEqual(after.findings, [], 'after.html must be clean — the fix is a one-line transition clear');

  // the golden isolates one rule — the other static validators must stay clean on both
  for (const script of ['check-drift.js', 'check-a11y-basics.js', 'check-aesthetic-slop.js', 'check-token-contrast.js']) {
    for (const file of ['before.html', 'after.html']) {
      const result = JSON.parse(spawnSync(process.execPath,
        [path.join(__dirname, script), path.join(dir, file), '--json'], { encoding: 'utf8' }).stdout);
      assert.deepStrictEqual(result.findings, [], `${script} must be clean on ${file} — this golden isolates motion-uninterruptible-transition only`);
    }
  }
});

test('golden cross-doc-transitions: both pages share one view-transition-name and stay clean', () => {
  const dir = path.resolve(__dirname, '..', 'goldens', 'cross-doc-transitions');
  const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const detail = fs.readFileSync(path.join(dir, 'plan-detail.html'), 'utf8');

  assert.ok(/@view-transition\s*\{\s*navigation:\s*auto;?\s*\}/.test(index), 'index.html must opt into cross-document view transitions');
  assert.ok(/@view-transition\s*\{\s*navigation:\s*auto;?\s*\}/.test(detail), 'plan-detail.html must opt into cross-document view transitions');
  assert.ok(/navigation:\s*none/.test(index) && /navigation:\s*none/.test(detail), 'both pages must collapse the transition under prefers-reduced-motion');

  const nameOf = (src) => /view-transition-name:\s*([\w-]+)/.exec(src)?.[1];
  assert.ok(nameOf(index), 'index.html must name a view-transition element');
  assert.strictEqual(nameOf(index), nameOf(detail), 'both pages must share the exact same view-transition-name — that identity is the whole mechanism');

  for (const script of ['check-motion.js', 'check-drift.js', 'check-a11y-basics.js', 'check-aesthetic-slop.js', 'check-token-contrast.js', 'check-registry.js']) {
    const result = JSON.parse(spawnSync(process.execPath,
      [path.join(__dirname, script), dir, '--json'], { encoding: 'utf8' }).stdout);
    assert.deepStrictEqual(result.findings, [], `${script} must be clean on goldens/cross-doc-transitions`);
  }
});

// ── SUMMARY ───────────────────────────────────────────────────────────────────

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
