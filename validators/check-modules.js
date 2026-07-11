#!/usr/bin/env node
/**
 * check-modules.js — module minimum content checker.
 *
 * Verifies that every DesignOS module (in the primary knowledge directories)
 * meets these minimum criteria:
 *   1. Has at least one H2 section (## heading)
 *   2. Has at least one checklist item (- [ ] or - [x]) OR a "Checklist" heading
 *   3. Has at least one anti-pattern reference (negative guidance)
 *   4. Is not suspiciously short (< 30 lines suggests stub/placeholder)
 *
 * These are pragmatic checks, not strict anatomy enforcement — DesignOS modules
 * use varied heading styles by design. For anatomy compliance, see CONTRIBUTING.md.
 *
 * Usage:
 *   node validators/check-modules.js              # check all module dirs
 *   node validators/check-modules.js foundations/ # check a specific dir
 *   node validators/check-modules.js foundations/typography.md  # single file
 *
 * Exit: 0 clean · 1 incomplete module(s) found
 * Zero external dependencies.
 */

const fs   = require('fs');
const path = require('path');

const MODULE_DIRS = [
  'foundations', 'components', 'patterns', 'psychology',
  'motion', 'native',
];

// Files to skip — structural docs, not knowledge modules
const SKIP_NAMES = new Set([
  'README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'ARCHITECTURE.md',
  'CODE_OF_CONDUCT.md', 'SECURITY.md', 'FUNDING.md', 'LAUNCH.md',
  'ROADMAP.md', 'SHOWCASE.md', 'GETTING-STARTED.md', 'DISCUSSIONS.md',
  'CHEATSHEET.md', 'LIMITATIONS.md',
]);

const MIN_LINES = 30;

const args   = process.argv.slice(2);
const TARGET = args.find(a => !a.startsWith('--')) || null;

function getFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  const results = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) results.push(...getFiles(full));
    else if (entry.name.endsWith('.md') && !SKIP_NAMES.has(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines   = content.split('\n');
  const issues  = [];

  // Minimum length
  if (lines.length < MIN_LINES) {
    issues.push(`stub (${lines.length} lines < ${MIN_LINES} minimum)`);
  }

  // At least one H2
  if (!content.match(/^## /m)) {
    issues.push('no H2 sections found');
  }

  // Has some negative guidance
  const hasAntiPattern = /anti[-\s]?pattern|don't|never|avoid|warning|fail|wrong|bad practice/i.test(content);
  if (!hasAntiPattern) {
    issues.push('no anti-pattern or negative guidance');
  }

  // Has a checklist or clear binary test
  const hasChecklist = content.includes('- [ ]') || content.includes('- [x]') ||
                       /checklist|testing protocol|review\s+checklist/i.test(content);
  if (!hasChecklist) {
    issues.push('no checklist or review protocol');
  }

  return issues;
}

function main() {
  const targets = TARGET
    ? [TARGET]
    : MODULE_DIRS.filter(d => fs.existsSync(d));

  let files = [];
  for (const t of targets) files.push(...getFiles(t));
  files = [...new Set(files)];

  let incomplete = 0;

  for (const file of files) {
    const issues = checkFile(file);
    if (issues.length > 0) {
      incomplete++;
      process.stdout.write(`  ${file}  issues: ${issues.join(' · ')}\n`);
    }
  }

  if (incomplete === 0) {
    process.stdout.write(`check-modules: clean (${files.length} modules checked)\n`);
    process.exit(0);
  } else {
    process.stdout.write(`check-modules: ${incomplete} incomplete module(s)\n`);
    process.exit(1);
  }
}

main();
