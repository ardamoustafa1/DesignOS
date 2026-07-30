'use strict';

const fs = require('fs');
const path = require('path');

function execute(target, args, context) {
  if (!target) context.fail(`Usage: ${context.run} live <html-target> [--init-only|--port 4179|--accept a|--reject b|--edits edits.json|--rollback]`);
  const director = require('../../live-director');
  try {
    const initialized = director.initSession(target, context.cwd);
    if (args.includes('--init-only')) {
      context.ok(`Live session initialized at ${path.relative(context.cwd, initialized.files.root)}`);
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
      const transactions = JSON.parse(fs.readFileSync(initialized.files.transactions, 'utf8'));
      transactions.push({
        id: `reject-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'variant-reject',
        variant: rejectId,
        reason: context.argValue(args, '--reason', ''),
        createdAt: new Date().toISOString(),
      });
      fs.writeFileSync(initialized.files.transactions, JSON.stringify(transactions, null, 2) + '\n');
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
