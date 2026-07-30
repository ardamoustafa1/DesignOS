'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

function execute(args, context) {
  const result = spawnSync(process.execPath, [path.join(context.pkgRoot, 'bin', 'golden-suite.js'), ...args], {
    cwd: context.cwd,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.status) process.exit(result.status);
}

module.exports = { execute };
