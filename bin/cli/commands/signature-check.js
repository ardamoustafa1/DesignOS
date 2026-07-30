'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * `designos signature-check <dir>` — enforces the brand-signature lock recorded in
 * memory/design.md (validators/check-signature-consistency.js). At most two signatures
 * per PAGE is motion/signature-moments.md's law; this is the project-wide law above it —
 * at most one signature SYSTEM, once a brief has chosen one.
 */
function execute(target, args, context) {
  const dir = target || '.';
  if (!fs.existsSync(path.join(context.cwd, dir)) && dir !== '.') {
    context.fail(`Target "${dir}" not found — usage: ${context.run} signature-check <dir> [--memory memory/design.md] [--json]`);
  }
  const vdir = fs.existsSync(path.join(context.cwd, 'DesignOS', 'validators'))
    ? path.join(context.cwd, 'DesignOS', 'validators')
    : path.join(context.pkgRoot, 'validators');
  const memory = context.argValue(args, '--memory', 'memory/design.md');
  const scriptArgs = [path.join(vdir, 'check-signature-consistency.js'), dir, '--memory', memory];
  if (args.includes('--json')) scriptArgs.push('--json');
  const result = spawnSync(process.execPath, scriptArgs, { cwd: context.cwd, encoding: 'utf8', stdio: 'inherit' });
  process.exitCode = result.status || 0;
}

module.exports = { execute };
