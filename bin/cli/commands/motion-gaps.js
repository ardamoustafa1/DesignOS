'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * `designos motion-gaps <dir>` — a restraint-first, read-only sweep for interactive
 * elements that plausibly want state feedback and have none (validators/check-motion-gaps.js).
 * Unlike every other validator, this one never fails a build: absence of motion is a
 * judgment call, not a mechanical violation, so it always reports and always exits 0.
 */
function execute(target, args, context) {
  const dir = target || '.';
  if (!fs.existsSync(path.join(context.cwd, dir)) && dir !== '.') {
    context.fail(`Target "${dir}" not found — usage: ${context.run} motion-gaps <dir> [--limit 7] [--json]`);
  }
  const vdir = fs.existsSync(path.join(context.cwd, 'DesignOS', 'validators'))
    ? path.join(context.cwd, 'DesignOS', 'validators')
    : path.join(context.pkgRoot, 'validators');
  const limit = context.argValue(args, '--limit', '7');
  const scriptArgs = [path.join(vdir, 'check-motion-gaps.js'), dir, '--limit', limit];
  if (args.includes('--json')) scriptArgs.push('--json');
  const result = spawnSync(process.execPath, scriptArgs, { cwd: context.cwd, encoding: 'utf8', stdio: 'inherit' });
  process.exitCode = result.status || 0;
}

module.exports = { execute };
