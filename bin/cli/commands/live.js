'use strict';

const fs = require('fs');
const path = require('path');

const AXES = new Set(['motion', 'layout', 'density']);

function execute(target, args, context) {
  if (!target) context.fail(`Usage: ${context.run} live <html-target> [--init-only|--port 4179|--accept a|--reject b|--edits edits.json|--rollback] [--axis motion|layout|density]`);
  const director = require('../../live-director');
  try {
    const axis = context.argValue(args, '--axis', '');
    if (axis && !AXES.has(axis)) context.fail(`Unknown --axis "${axis}" — use one of: ${[...AXES].join(' · ')}`);
    const initialized = director.initSession(target, context.cwd, axis || null);
    if (args.includes('--init-only')) {
      context.ok(`Live session initialized at ${path.relative(context.cwd, initialized.files.root)}${axis ? ` (axis: ${axis})` : ''}`);
      return;
    }
    if (args.includes('--rollback')) {
      const transaction = director.rollback(target, context.cwd);
      context.ok(`Rolled back live transaction ${transaction.id}`);
      return;
    }
    const acceptId = context.argValue(args, '--accept', '');
    if (acceptId) {
      const transaction = director.acceptVariant(target, acceptId, context.argValue(args, '--reason', ''), context.cwd);
      context.ok(`Accepted variant ${acceptId}; transaction ${transaction.id}`);
      return;
    }
    const rejectId = context.argValue(args, '--reject', '');
    if (rejectId) {
      director.recordRejection(target, rejectId, context.argValue(args, '--reason', ''), context.cwd);
      context.ok(`Rejected variant ${rejectId}; decision recorded`);
      return;
    }
    const editsFile = context.argValue(args, '--edits', '');
    if (editsFile) {
      const edits = JSON.parse(fs.readFileSync(path.resolve(context.cwd, editsFile), 'utf8'));
      const transaction = director.applyManualEdits(
        target, edits, context.argValue(args, '--reason', 'Manual Live Director edit'), context.cwd);
      context.ok(`Applied manual edit transaction ${transaction.id}`);
      return;
    }
    director.serve(target, { port: Number(context.argValue(args, '--port', '4179')) }, context.cwd);
  } catch (error) {
    context.fail(error.message);
  }
}

module.exports = { execute };
