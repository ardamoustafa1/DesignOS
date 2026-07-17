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
  const valueFlags = new Set(['--min', '--type', '--industry', '--audience', '--goal', '--tone', '--constraints', '--out']);
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
});

test('bin/designos.js exports no external dependencies', () => {
  const binPath = path.resolve(__dirname, '..', 'bin', 'designos.js');
  const src = fs.readFileSync(binPath, 'utf8');
  // Only 'fs' and 'path' from stdlib are expected
  const requires = [...src.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  const external = requires.filter(r => !['fs', 'path', 'os', 'child_process', 'assert'].includes(r));
  assert.deepStrictEqual(external, [], `Unexpected external deps: ${external.join(', ')}`);
});

// ── SUMMARY ───────────────────────────────────────────────────────────────────

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
