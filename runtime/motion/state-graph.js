'use strict';

const REQUIRED_STATES = Object.freeze(['idle', 'hover', 'pressed', 'loading', 'success', 'exit']);

const DEFAULT_GRAPH = Object.freeze({
  id: 'designos-control',
  initial: 'idle',
  states: {
    idle: { origin: 'center center', motion: 'none' },
    hover: { origin: 'center center', motion: 'feedback', phase: 'enter', pair: 'exit' },
    pressed: { origin: 'center center', motion: 'feedback' },
    loading: { origin: 'center center', motion: 'progress', suppress: ['hover'] },
    success: { origin: 'center center', motion: 'acknowledgement' },
    exit: { origin: 'center center', motion: 'exit', phase: 'exit', pair: 'hover' },
  },
  transitions: [
    { from: 'idle', event: 'pointerenter', to: 'hover', reverse: 'pointerleave' },
    { from: 'idle', event: 'focus', to: 'hover', reverse: 'blur' },
    { from: 'hover', event: 'pointerdown', to: 'pressed', reverse: 'pointerup' },
    { from: 'hover', event: 'keydown:Enter', to: 'pressed', reverse: 'keyup:Enter' },
    { from: 'pressed', event: 'submit', to: 'loading', reverse: 'cancel' },
    { from: 'loading', event: 'resolve', to: 'success', reverse: 'reset' },
    { from: 'loading', event: 'reject', to: 'idle', reverse: 'submit' },
    { from: 'success', event: 'dismiss', to: 'exit', reverse: 'reopen', continuity: true },
    { from: 'exit', event: 'reopen', to: 'success', reverse: 'dismiss', continuity: true },
    { from: 'success', event: 'clear', to: 'idle', reverse: 'restore' },
  ],
  inputParity: {
    pointer: { enter: 'pointerenter', activate: 'pointerdown', leave: 'pointerleave' },
    focus: { enter: 'focus', activate: 'keydown:Enter', leave: 'blur' },
  },
});

function normalizeGraph(spec = DEFAULT_GRAPH) {
  const states = Object.fromEntries(Object.entries(spec.states || {}).map(([id, state]) =>
    [id, Object.freeze({ id, origin: 'center center', motion: 'none', ...state })]));
  const declared = (spec.transitions || []).map((transition, index) =>
    Object.freeze({ id: transition.id || `t${index + 1}`, interruptible: true, ...transition }));
  const transitions = [...declared];
  for (const transition of declared) {
    if (!transition.reverse) continue;
    const reverseExists = transitions.some(candidate =>
      candidate.from === transition.to && candidate.event === transition.reverse && candidate.to === transition.from);
    if (!reverseExists) transitions.push(Object.freeze({
      id: `${transition.id}:reverse`,
      from: transition.to,
      event: transition.reverse,
      to: transition.from,
      reverse: transition.event,
      interruptible: transition.interruptible,
      continuity: transition.continuity,
      implicit: true,
    }));
  }
  return Object.freeze({
    id: spec.id || 'motion-graph',
    initial: spec.initial || 'idle',
    states: Object.freeze(states),
    transitions: Object.freeze(transitions),
    inputParity: Object.freeze(spec.inputParity || {}),
  });
}

function validateMotionStateGraph(spec) {
  const graph = normalizeGraph(spec);
  const findings = [];
  const add = (code, message, details = {}) => findings.push({ code, message, ...details });
  for (const state of REQUIRED_STATES) {
    if (!graph.states[state]) add('missing-state', `Required state "${state}" is missing.`, { state });
  }
  if (!graph.states[graph.initial]) add('invalid-initial', `Initial state "${graph.initial}" does not exist.`);

  const transitionKey = new Set(graph.transitions.map(item => `${item.from}:${item.event}:${item.to}`));
  const deterministic = new Map();
  for (const transition of graph.transitions) {
    if (!graph.states[transition.from] || !graph.states[transition.to]) {
      add('dangling-transition', `${transition.id} references an unknown state.`, { transition });
    }
    if (!transition.reverse) add('missing-reverse', `${transition.id} has no reverse event.`, { transition });
    const route = `${transition.from}:${transition.event}`;
    if (deterministic.has(route) && deterministic.get(route) !== transition.to) {
      add('nondeterministic-transition', `${route} resolves to multiple states.`, { transition });
    } else deterministic.set(route, transition.to);
    const reverseEdge = graph.transitions.find(candidate =>
      candidate.from === transition.to && candidate.event === transition.reverse && candidate.to === transition.from);
    if (transition.reverse && !reverseEdge) {
      add('missing-reverse-edge', `${transition.id} declares "${transition.reverse}" but no reverse edge resolves.`, { transition });
    }
    if (transition.from === 'exit' && transition.event === 'reopen' && !transition.continuity) {
      add('reopen-discontinuity', 'Reopening during exit must preserve current visual continuity.', { transition });
    }
  }

  for (const state of Object.values(graph.states)) {
    if (state.phase === 'enter') {
      const paired = Object.values(graph.states).find(candidate =>
        candidate.id === state.pair && candidate.phase === 'exit');
      if (!paired) add('missing-exit-pair', `Enter state "${state.id}" has no declared exit pair.`, { state: state.id });
    }
    if (/popover|menu|sheet|drawer/.test(`${state.id} ${state.motion}`) &&
        (!state.origin || state.origin === 'center center')) {
      add('dishonest-origin', `Anchored state "${state.id}" needs a non-central transform origin.`, { state: state.id });
    }
  }

  if (graph.states.loading && !(graph.states.loading.suppress || []).includes('hover')) {
    add('loading-hover-conflict', 'Loading must suppress hover motion.', { state: 'loading' });
  }

  const parity = graph.inputParity;
  if (!parity.pointer || !parity.focus) add('input-parity-missing', 'Pointer and focus mappings are both required.');
  else {
    for (const role of ['enter', 'activate', 'leave']) {
      if (!parity.pointer[role] || !parity.focus[role]) {
        add('input-parity-gap', `Pointer/focus parity is missing "${role}".`, { role });
      } else {
        const pointerTargets = graph.transitions.filter(edge => edge.event === parity.pointer[role]).map(edge => edge.to).sort();
        const focusTargets = graph.transitions.filter(edge => edge.event === parity.focus[role]).map(edge => edge.to).sort();
        if (!pointerTargets.length || JSON.stringify(pointerTargets) !== JSON.stringify(focusTargets)) {
          add('input-parity-mismatch', `Pointer and focus "${role}" do not reach the same state graph targets.`, {
            role, pointerTargets, focusTargets,
          });
        }
      }
    }
  }

  const reachable = new Set([graph.initial]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of graph.transitions) {
      if (reachable.has(edge.from) && !reachable.has(edge.to)) {
        reachable.add(edge.to);
        changed = true;
      }
    }
  }
  for (const state of Object.keys(graph.states)) {
    if (!reachable.has(state)) add('unreachable-state', `State "${state}" is unreachable.`, { state });
  }
  return { graph, valid: findings.length === 0, findings, transitionKey };
}

function compileMotionStateGraph(spec = DEFAULT_GRAPH, options = {}) {
  const validation = validateMotionStateGraph(spec);
  if (!validation.valid && options.strict !== false) {
    const error = new Error(`Motion state graph invalid: ${validation.findings.map(item => item.code).join(', ')}`);
    error.findings = validation.findings;
    throw error;
  }
  const byStateEvent = new Map(validation.graph.transitions.map(edge => [`${edge.from}:${edge.event}`, edge]));
  return {
    schema: 1,
    graph: validation.graph,
    valid: validation.valid,
    findings: validation.findings,
    createMachine(initial = validation.graph.initial) {
      let current = initial;
      let previous = null;
      let revision = 0;
      return {
        dispatch(event) {
          const edge = byStateEvent.get(`${current}:${event}`);
          if (!edge) return { accepted: false, state: current, previous, revision };
          previous = current;
          current = edge.to;
          revision += 1;
          return {
            accepted: true, state: current, previous, revision,
            transition: edge.id, interruptible: edge.interruptible, continuity: Boolean(edge.continuity),
          };
        },
        snapshot: () => ({ state: current, previous, revision, definition: validation.graph.states[current] }),
      };
    },
  };
}

module.exports = {
  REQUIRED_STATES,
  DEFAULT_GRAPH,
  normalizeGraph,
  validateMotionStateGraph,
  compileMotionStateGraph,
};
