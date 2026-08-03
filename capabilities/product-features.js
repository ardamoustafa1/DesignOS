'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

const LEADER_FEATURES = Object.freeze([
  ['adapter-conformance', 'Adapter Conformance Engine', ['runtime/motion/controller.js', 'fixtures/frameworks/test-matrix.js']],
  ['motion-trace', 'Motion Trace Engine', ['bin/motion-profiler.js', 'bin/temporal-motion.js']],
  ['motion-state-graph', 'Motion State Graph Compiler', ['runtime/motion/state-graph.js']],
  ['interruption-torture', 'Interruption Torture Lab', ['bin/interruption-torture.js', 'fixtures/motion/torture.html']],
  ['live-director-2', 'Live Director 2', ['bin/live/component-transform.js', 'bin/live-director.js']],
  ['design-genome', 'Design Genome Scanner', ['bin/design-genome.js']],
  ['composition-compiler', 'Executable Composition Grammar', ['bin/composition-compiler.js']],
  ['responsive-solver', 'Responsive Constraint Solver', ['bin/responsive-constraint.js']],
  ['state-matrix', 'State Matrix Generator', ['bin/state-matrix.js']],
  ['mutation-testing', 'Visual and Motion Mutation Testing', ['bin/mutation-testing.js']],
  ['consistency-graph', 'Cross-page Consistency Graph', ['bin/consistency-graph.js']],
  ['native-motion', 'Native Motion Runtime', ['runtime/native/adapters.js', 'bin/native-motion.js']],
  ['motion-semantics', 'Motion Semantics Compiler', ['runtime/motion/semantics.js', 'validators/test-motion-semantics.js']],
  ['live-director-studio', 'Live Director Studio', ['bin/live-director.js', 'validators/test-live-component.js']],
  ['deterministic-claims', 'Deterministic Claim Compiler', ['capabilities/public-claims.js', 'scripts/compile-public-claims.js']],
  ['pattern-atlas', 'Inspectable Motion Pattern Atlas', ['runtime/pattern-atlas.js', 'bin/cli/commands/atlas.js']],
  ['explainable-motion', 'Explainable Frequency-Aware Motion Decisions', ['runtime/motion/semantics.js', 'validators/test-category-leadership.js']],
  ['leader-workflow', 'Unified Improve Workflow', ['bin/leader-workflow.js', 'bin/cli/commands/improve.js']],
].map(([id, name, sources]) => Object.freeze({
  id,
  name,
  sources: Object.freeze(sources),
  implemented: sources.every(source => fs.existsSync(path.join(ROOT, source))),
  test: 'validators/test-leader-features.js',
})));

module.exports = { LEADER_FEATURES };
