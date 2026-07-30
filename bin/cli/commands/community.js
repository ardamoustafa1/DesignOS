'use strict';

const fs = require('fs');
const path = require('path');

function slugify(input) {
  return String(input || '').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled';
}

function nextRunId(cwd) {
  const runsDir = path.join(cwd, 'evals', 'runs');
  const names = fs.existsSync(runsDir) ? fs.readdirSync(runsDir) : [];
  const max = names.reduce((acc, name) => {
    const match = name.match(/run-(\d+)/i);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 2);
  return String(max + 1).padStart(3, '0');
}

function evalRun(slug, args, context) {
  if (!slug) context.fail(`Usage: ${context.run} eval <slug> [--agent cursor] [--brief B-001] [--runner "@you"] [--model "model name"]`);
  const id = nextRunId(context.cwd);
  const safeSlug = slugify(slug);
  const relDir = path.join('evals', 'runs', `run-${id}-${safeSlug}`);
  const absDir = path.join(context.cwd, relDir);
  if (fs.existsSync(absDir) && !args.includes('--force')) {
    context.fail(`${relDir} already exists. Re-run with --force to overwrite.`);
  }
  fs.mkdirSync(path.join(absDir, 'control'), { recursive: true });
  fs.mkdirSync(path.join(absDir, 'treatment'), { recursive: true });
  fs.mkdirSync(path.join(absDir, 'logs'), { recursive: true });
  const data = {
    id,
    date: new Date().toISOString().slice(0, 10),
    runner: context.argValue(args, '--runner', 'TODO'),
    agent: context.argValue(args, '--agent', 'TODO'),
    model: context.argValue(args, '--model', 'TODO'),
    brief: context.argValue(args, '--brief', 'TODO'),
  };
  const body = [
    `# Run ${data.id} — ${safeSlug}`,
    '',
    '> Comparative eval runs can be positive, mixed, or negative. A scaffold is not external evidence.',
    '',
    '## Metadata',
    '',
    '| Field | Value |',
    '|---|---|',
    `| Date | ${data.date} |`,
    `| Runner | ${data.runner} |`,
    `| Agent surface | ${data.agent} |`,
    `| Model(s) | ${data.model} |`,
    `| Brief set | ${data.brief} |`,
    '| DesignOS commit SHA | TODO |',
    '| Time budget | TODO |',
    '| Follow-up steering | none / explain |',
    '',
    '## Raw Artifacts',
    '',
    '- Control output: `control/`',
    '- Treatment output: `treatment/`',
    '- Logs: `logs/`',
    '',
    '## Commands',
    '',
    '```bash',
    `node validators/check-drift.js ${relDir}/control`,
    `node validators/check-a11y-basics.js ${relDir}/control`,
    `node validators/check-drift.js ${relDir}/treatment`,
    `node validators/check-a11y-basics.js ${relDir}/treatment`,
    '```',
    '',
    '## Validator Results',
    '',
    '| Brief | Arm | Drift findings | A11y findings | Contrast notes |',
    '|---|---|---:|---:|---|',
    `| ${data.brief} | Control | TODO | TODO | TODO |`,
    `| ${data.brief} | Treatment | TODO | TODO | TODO |`,
    '',
    '## Blind Judge Results',
    '',
    '| Brief | Arm | Hierarchy | Craft | Accessibility | States | Distinctiveness | Fitness | Median total |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|',
    `| ${data.brief} | Control | TODO | TODO | TODO | TODO | TODO | TODO | TODO |`,
    `| ${data.brief} | Treatment | TODO | TODO | TODO | TODO | TODO | TODO | TODO |`,
    '',
    '## Findings',
    '',
    '### Where DesignOS helped',
    '',
    '- TODO',
    '',
    '### Where DesignOS hurt or added cost',
    '',
    '- TODO',
    '',
    '### Ambiguous results',
    '',
    '- TODO',
    '',
    '## Conclusion',
    '',
    'TODO: State the result honestly. Avoid universal claims.',
    '',
    '## External evidence eligibility',
    '',
    'This run changes `externalEval` only after an independent maintainer, blind protocol,',
    'immutable evidence reference, and rule-level results are registered and verified.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(absDir, 'README.md'), body);
  context.ok(`Eval run scaffolded at ${relDir}`);
  context.log('Next: add raw outputs, run validators, blind-judge outputs, then verify external eligibility.');
}

function caseStudy(slug, args, context) {
  if (!slug) context.fail(`Usage: ${context.run} case <slug> [--project "Project"] [--url https://...] [--author "@you"] [--surface pricing]`);
  const safeSlug = slugify(slug);
  const rel = path.join('case-studies', `${safeSlug}.md`);
  const abs = path.join(context.cwd, rel);
  if (fs.existsSync(abs) && !args.includes('--force')) {
    context.fail(`${rel} already exists. Re-run with --force to overwrite.`);
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const project = context.argValue(args, '--project', safeSlug);
  const url = context.argValue(args, '--url', 'TODO');
  const source = context.argValue(args, '--source', 'TODO');
  const author = context.argValue(args, '--author', 'TODO');
  const stack = context.argValue(args, '--stack', 'TODO');
  const surface = context.argValue(args, '--surface', 'TODO');
  const summary = context.argValue(args, '--summary', 'TODO: one honest sentence on what DesignOS changed.');
  const body = [
    `# ${project} — DesignOS Case Study`,
    '',
    '## Summary',
    '',
    `- Project: ${project}`,
    `- Author: ${author}`,
    `- Date: ${new Date().toISOString().slice(0, 10)}`,
    '- Agent/tool: TODO',
    `- Stack: ${stack}`,
    `- Surface: ${surface}`,
    `- Public link: ${url}`,
    `- Source link: ${source}`,
    `- Honest summary: ${summary}`,
    '',
    '## Starting Point',
    '',
    'TODO: Describe the original brief, target user, business goal, constraints, and known design issues.',
    '',
    '## DesignOS Setup',
    '',
    '- `brain/design-intelligence.md`',
    '- `loops/design-loop.md`',
    '- TODO: relevant component/pattern modules',
    '- TODO: relevant industry module',
    '- TODO: memory files used or created',
    '',
    '## Before / After',
    '',
    '- Desktop before: TODO',
    '- Desktop after: TODO',
    '- Mobile before: TODO',
    '- Mobile after: TODO',
    '',
    '## Decisions',
    '',
    '| Decision | Why it was made | Module/rule |',
    '|---|---|---|',
    '| TODO | TODO | TODO |',
    '',
    '## Scorecard',
    '',
    '| Dimension | Score | Evidence |',
    '|---|---:|---|',
    '| UI Craft | TODO | TODO |',
    '| UX & Flow | TODO | TODO |',
    '| Accessibility | TODO | TODO |',
    '| Performance | TODO | TODO |',
    '| Modernity | TODO | TODO |',
    '| Conversion | TODO | TODO |',
    '',
    '## What Failed First',
    '',
    '- TODO: contrast miss, hierarchy issue, fake proof removed, missing state added, or mobile layout fixed.',
    '',
    '## Caveats',
    '',
    'TODO: State what this case study does not prove.',
    '',
    '## Showcase Row',
    '',
    '```markdown',
    `| [${project}](${url}) | ${surface} | ${summary} |`,
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(abs, body);
  context.ok(`Case study scaffolded at ${rel}`);
  context.log(`Showcase row ready inside ${rel}.`);
}

function execute(command, slug, args, context) {
  if (command === 'eval') return evalRun(slug, args, context);
  if (command === 'case') return caseStudy(slug, args, context);
  context.fail(`Unknown community command "${command}"`);
}

module.exports = { execute, slugify, nextRunId };
