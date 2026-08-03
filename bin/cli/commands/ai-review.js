'use strict';

const fs = require('fs');
const path = require('path');
const { buildLeaderReport } = require('../../leader-workflow');

function buildReviewPacket({ target, brief, reviewer, context }) {
  const report = buildLeaderReport({
    target,
    cwd: context.cwd,
    root: context.pkgRoot,
    brief,
    motionIntensity: Number(context.motionIntensity) || 5,
    deep: context.deep,
  });
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    reviewer: reviewer || null,
    status: 'READY_FOR_EXTERNAL_REVIEW',
    provenance: 'DesignOS assembled this packet; no model was called and no independent verdict is claimed.',
    target,
    brief: brief || null,
    instructions: [
      'Refute rather than confirm the implementation.',
      'Return findings with file, line, severity, affected user and reproduction steps.',
      'Score only dimensions supported by attached evidence; leave the rest NOT ASSESSED.',
      'Do not accept source-only checks as visual, accessibility-tree or performance proof.',
    ],
    sourceAssessment: report,
    requiredResponse: {
      dimensions: ['UI Craft', 'UX & Flow', 'Accessibility', 'Performance', 'Modernity', 'Conversion or task completion', 'Brand Fit & Distinctiveness'],
      fields: ['scoreOrNotAssessed', 'findings', 'blocking', 'evidenceUsed', 'evidenceMissing'],
    },
  };
}

function execute(args, context) {
  const target = context.positionals(args)[0];
  if (!target) context.fail(`Usage: ${context.run} ai-review <target> --brief "<brief>" [--reviewer <model-or-human>] [--deep]`);
  const packet = buildReviewPacket({
    target,
    brief: context.argValue(args, '--brief', ''),
    reviewer: context.argValue(args, '--reviewer', context.argValue(args, '--model', '')),
    context: {
      cwd: context.cwd,
      pkgRoot: context.pkgRoot,
      motionIntensity: context.argValue(args, '--motion', '5'),
      deep: args.includes('--deep'),
    },
  });
  if (args.includes('--json')) {
    console.log(JSON.stringify(packet, null, 2));
    return;
  }
  const out = path.resolve(context.cwd, context.argValue(args, '--out', '.designos/review-packet.json'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(packet, null, 2)}\n`);
  context.ok(`External review packet written to ${path.relative(context.cwd, out)}`);
  context.log('No AI or human reviewer was invoked. The packet is ready for an isolated reviewer.');
}

module.exports = { buildReviewPacket, execute };
