'use strict';

const COMMAND_RE = /([A-Z-]+)\(([^)]*)\)/g;

function duration(value, fallback = 200) {
  const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)(ms|s)?$/i);
  if (!match) return fallback;
  const amount = Number(match[1]);
  return Math.round(match[2]?.toLowerCase() === 's' ? amount * 1000 : amount);
}

function parseDsl(input) {
  const steps = [];
  let cursor = 0;
  for (const match of String(input).matchAll(COMMAND_RE)) {
    if (String(input).slice(cursor, match.index).trim()) throw new Error(`Unexpected token near "${String(input).slice(cursor, match.index).trim()}"`);
    cursor = match.index + match[0].length;
    const op = match[1].toUpperCase();
    const args = match[2].split(',').map(item => item.trim()).filter(Boolean);
    if (op === 'WAIT') {
      steps.push({ op: 'wait', durationMs: duration(args[0]) });
    } else if (op === 'STAGGER') {
      if (!args[0]) throw new Error('STAGGER requires a selector');
      steps.push({ op: 'stagger', selector: args[0], staggerMs: duration(args[1], 40), durationMs: duration(args[2], 220) });
    } else if (op === 'REVEAL' || op === 'FADE') {
      if (!args[0]) throw new Error(`${op} requires a selector`);
      steps.push({ op: op.toLowerCase(), selector: args[0], durationMs: duration(args[1], 200) });
    } else if (op === 'MOVE') {
      if (!args[0]) throw new Error('MOVE requires a selector');
      steps.push({ op: 'move', selector: args[0], x: Number(args[1]) || 0, y: Number(args[2]) || 0, durationMs: duration(args[3], 200) });
    } else {
      throw new Error(`Unsupported orchestration operation ${op}`);
    }
  }
  if (String(input).slice(cursor).trim()) throw new Error(`Unexpected trailing token "${String(input).slice(cursor).trim()}"`);
  if (!steps.length) throw new Error('Orchestration contains no operations');
  return steps;
}

function compileOrchestration(input) {
  const steps = parseDsl(input);
  return `'use strict';

export function runDesignOSOrchestration(root = document) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const controls = [];
  const wait = ms => new Promise(resolve => setTimeout(resolve, reduce ? 0 : ms));
  const animate = (element, frames, options) => {
    if (reduce) { Object.assign(element.style, frames.at(-1)); return Promise.resolve(); }
    const control = element.animate(frames, options);
    controls.push(control);
    return control.finished.catch(() => undefined);
  };
  const run = async () => {
    const steps = ${JSON.stringify(steps, null, 2)};
    for (const step of steps) {
      if (step.op === 'wait') { await wait(step.durationMs); continue; }
      const elements = [...root.querySelectorAll(step.selector)];
      if (step.op === 'stagger') {
        await Promise.all(elements.map((element, index) => wait(index * step.staggerMs).then(() => animate(element,
          [{ opacity: 0, transform: 'translate3d(0, 8px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
          { duration: step.durationMs, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }))));
      } else if (step.op === 'reveal') {
        await Promise.all(elements.map(element => animate(element,
          [{ opacity: 0, transform: 'translate3d(0, 8px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
          { duration: step.durationMs, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' })));
      } else if (step.op === 'fade') {
        await Promise.all(elements.map(element => animate(element, [{ opacity: 0 }, { opacity: 1 }],
          { duration: step.durationMs, easing: 'linear', fill: 'both' })));
      } else if (step.op === 'move') {
        await Promise.all(elements.map(element => animate(element,
          [{ transform: 'translate3d(0, 0, 0)' }, { transform: \`translate3d(\${step.x}px, \${step.y}px, 0)\` }],
          { duration: step.durationMs, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' })));
      }
    }
  };
  return { run, cancel: () => controls.splice(0).forEach(control => control.cancel()) };
}
`;
}

function execute(args, context) {
  const dsl = context.positionals(args).join(' ').trim();
  if (!dsl) context.fail(`Usage: ${context.run} orchestrate "STAGGER(.card, 40ms, 220ms) WAIT(120ms) REVEAL(.proof, 200ms)"`);
  let source;
  try { source = compileOrchestration(dsl); }
  catch (error) { context.fail(`orchestrate: ${error.message}`); }
  console.log(source);
  context.ok('Orchestration compiled to cancellable WAAPI code with reduced-motion equivalence.');
}

module.exports = { duration, parseDsl, compileOrchestration, execute };
