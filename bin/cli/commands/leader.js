'use strict';

const path = require('path');
const { spawnSync } = require('child_process');
const { compileMotionStateGraph, DEFAULT_GRAPH } = require('../../../runtime/motion/state-graph');

const SCRIPT_COMMANDS = Object.freeze({
  'adapter-conformance': ['fixtures/frameworks/test-matrix.js'],
  'motion-torture': ['bin/interruption-torture.js'],
  genome: ['bin/design-genome.js'],
  'composition-compile': ['bin/composition-compiler.js'],
  'responsive-solve': ['bin/responsive-constraint.js'],
  'state-matrix': ['bin/state-matrix.js'],
  'mutation-test': ['bin/mutation-testing.js'],
  consistency: ['bin/consistency-graph.js'],
  'native-motion': ['bin/native-motion.js'],
});

function execute(command, args, context) {
  if (command === 'motion-graph') {
    const compiled = compileMotionStateGraph(DEFAULT_GRAPH);
    context.log(JSON.stringify({
      schema: compiled.schema,
      valid: compiled.valid,
      states: Object.keys(compiled.graph.states),
      transitions: compiled.graph.transitions,
      findings: compiled.findings,
    }, null, 2));
    return;
  }
  const entry = SCRIPT_COMMANDS[command];
  if (!entry) context.fail(`Unknown leader command "${command}"`);
  const script = path.join(context.pkgRoot, entry[0]);
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: context.cwd,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

module.exports = { SCRIPT_COMMANDS, execute };
