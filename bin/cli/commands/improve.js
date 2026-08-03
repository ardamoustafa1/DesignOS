'use strict';

const fs = require('fs');
const path = require('path');
const { buildLeaderReport, markdown } = require('../../leader-workflow');

function execute(args, context) {
  const target = context.positionals(args)[0];
  if (!target) context.fail(`Usage: ${context.run} improve <target> --brief "<product and surface>" [--motion 1-10] [--deep] [--json]`);
  const report = buildLeaderReport({
    target,
    cwd: context.cwd,
    root: context.pkgRoot,
    brief: context.argValue(args, '--brief', ''),
    motionIntensity: Math.max(1, Math.min(10, Number(context.argValue(args, '--motion', '5')) || 5)),
    deep: args.includes('--deep'),
  });
  if (args.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const outputDir = path.join(context.cwd, '.designos');
  fs.mkdirSync(outputDir, { recursive: true });
  const jsonFile = path.join(outputDir, 'leader-report.json');
  const markdownFile = path.join(outputDir, 'leader-report.md');
  fs.writeFileSync(jsonFile, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownFile, markdown(report));
  context.log(markdown(report));
  context.ok(`Leader report written to ${path.relative(context.cwd, markdownFile)}`);
  context.log(`Machine report: ${path.relative(context.cwd, jsonFile)}`);
}

module.exports = { execute };
