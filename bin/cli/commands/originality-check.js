'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * `designos originality-check <file> [--add]` — checks a page's structural fingerprint
 * against the project's own corpus of prior shipped pages (validators/check-originality.js).
 * `--add` seeds/updates the corpus with this file's fingerprint after checking it. The
 * corpus defaults to `.designos/originality-corpus.json` and grows only when asked —
 * nothing is added automatically on a plain check.
 */
function execute(target, args, context) {
  if (!target || !fs.existsSync(path.join(context.cwd, target))) {
    context.fail(`Usage: ${context.run} originality-check <file> [--corpus path.json] [--threshold 0.82] [--add] [--json]`);
  }
  const vdir = fs.existsSync(path.join(context.cwd, 'DesignOS', 'validators'))
    ? path.join(context.cwd, 'DesignOS', 'validators')
    : path.join(context.pkgRoot, 'validators');
  const corpus = context.argValue(args, '--corpus', '.designos/originality-corpus.json');
  const threshold = context.argValue(args, '--threshold', '0.82');
  const scriptArgs = [path.join(vdir, 'check-originality.js'), target, '--corpus', corpus, '--threshold', threshold];
  if (args.includes('--add')) scriptArgs.push('--add');
  if (args.includes('--json')) scriptArgs.push('--json');
  const result = spawnSync(process.execPath, scriptArgs, { cwd: context.cwd, encoding: 'utf8', stdio: 'inherit' });
  process.exitCode = result.status || 0;
}

module.exports = { execute };
