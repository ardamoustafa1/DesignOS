'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

function spawn(script, args, context) {
  const result = spawnSync(process.execPath, [path.join(context.pkgRoot, 'bin', script), ...args], {
    cwd: context.cwd,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.status) process.exit(result.status || 1);
}

function execute(command, target, args, context) {
  if (!target) context.fail(`Usage: ${context.run} ${command} <html-or-url>`);
  if (command === 'motion-profile') {
    spawn('motion-profiler.js', [target, ...args.filter(arg => arg !== target)], context);
    return;
  }
  if (command === 'motion-regression') {
    spawn('temporal-motion.js', [target, ...args.filter(arg => arg !== target)], context);
    return;
  }
  try {
    let labArgs = [...args];
    if (args.includes('--profile')) {
      const profile = context.argValue(args, '--profile-report',
        path.join('.designos', 'motion-profile.json'));
      const profileArgs = [target, '--out', profile];
      const selector = context.argValue(args, '--selector', '');
      if (selector) profileArgs.push('--selector', selector);
      const duration = context.argValue(args, '--duration', '');
      if (duration) profileArgs.push('--duration', duration);
      spawn('motion-profiler.js', profileArgs, context);
      if (!labArgs.includes('--profile-report')) labArgs.push('--profile-report', profile);
    }
    const output = require('../../motion-lab').motionLab(target, labArgs, context.cwd);
    context.ok(`Motion Lab written to ${path.relative(context.cwd, output)}`);
  } catch (error) {
    context.fail(error.message);
  }
}

module.exports = { execute };
