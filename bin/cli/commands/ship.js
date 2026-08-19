'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

function runNode(script, args, cwd) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
}

function execute(args, ctx) {
  const target = ctx.positionals(args)[0];
  const surface = ctx.argValue(args, '--surface', 'auto');
  if (!target) ctx.fail('Usage: designos ship <target> [--surface portfolio]');
  const absolute = path.resolve(ctx.cwd, target);
  const contract = runNode(path.join(ctx.pkgRoot, 'validators/check-generation-contract.js'), [absolute, '--surface', surface], ctx.cwd);
  process.stdout.write(contract.stdout || '');
  process.stderr.write(contract.stderr || '');
  if (contract.status !== 0) ctx.fail('SHIP BLOCKED — generation contract failed. The artifact is withheld until the findings are fixed.');

  const review = runNode(path.join(ctx.pkgRoot, 'bin/designos.js'), ['review', absolute], ctx.cwd);
  process.stdout.write(review.stdout || '');
  process.stderr.write(review.stderr || '');
  if (review.status !== 0) ctx.fail('SHIP BLOCKED — deterministic review failed.');
  ctx.ok('Mechanical ship gate passed. Human visual review, browser evidence, and final design score remain required.');
}

module.exports = { execute };
