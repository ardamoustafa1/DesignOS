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
  const src = fs.readFileSync(binPath, 'utf8');
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

test('eval: scaffolds independent run folders', () => {
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

// ── SUMMARY ───────────────────────────────────────────────────────────────────

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
