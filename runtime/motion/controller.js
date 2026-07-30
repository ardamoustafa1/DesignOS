'use strict';

const {
  rubberBand,
  projectMomentum,
  springPhysics,
  shouldDismiss,
  flipDelta,
  scrollProgress,
  magneticOffset,
  odometerFrames,
  feedback,
} = require('./core');
const { compileMotionStateGraph, DEFAULT_GRAPH } = require('./state-graph');

const INITIAL = Object.freeze({
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  progress: 0,
  value: 0,
});

function recipeState(recipeId) {
  const states = {
    'momentum-projection': { x: projectMomentum(120, 0.8) },
    'velocity-handoff': { x: 32, spring: springPhysics({ duration: 0.32, bounce: 0 }) },
    'rubber-band-boundary': { x: rubberBand(80, 240) },
    'swipe-to-dismiss': {
      x: 120,
      opacity: shouldDismiss({ distance: 220, dimension: 320, velocity: 0.2 }).dismiss ? 0 : 1,
    },
    'spring-reversal': { x: 28, spring: springPhysics({ duration: 0.28, bounce: 0.12 }) },
    'interruptible-accordion': { progress: 1, origin: 'top center' },
    'origin-aware-popover': { progress: 1, origin: 'top left' },
    'shared-element-transition': { progress: 1 },
    'flip-layout-transition': { progress: 1 },
    odometer: { value: odometerFrames(0, 100, 12).at(-1) },
    'hold-to-confirm': { scaleX: scrollProgress(1000, 0, 1000), progress: 1, origin: 'left center' },
    'magnetic-interaction': {
      ...magneticOffset(
        { x: 170, y: 74 },
        { left: 40, top: 40, width: 100, height: 44 },
        { strength: 0.35, radius: 160 }),
    },
    'drag-reorder': {
      ...flipDelta(
        { left: 0, top: 0, width: 100, height: 44 },
        { left: 0, top: 56, width: 100, height: 44 }),
    },
    'scroll-linked-progress': { scaleX: scrollProgress(720, 0, 720), origin: 'left center', progress: 1 },
    'haptic-audio-feedback': { feedback: feedback({ haptic: 'selection' }), progress: 1 },
  };
  if (!states[recipeId]) throw new Error(`Unknown motion recipe: ${recipeId}`);
  return { ...INITIAL, ...states[recipeId] };
}

function recipeInitialState(recipeId) {
  const states = {
    'interruptible-accordion': { scaleY: 0.82, opacity: 0.72, origin: 'top center' },
    'origin-aware-popover': { scaleX: 0.92, scaleY: 0.92, opacity: 0.76, origin: 'top left' },
    'shared-element-transition': {
      ...flipDelta(
        { left: 16, top: 12, width: 96, height: 44 },
        { left: 48, top: 32, width: 120, height: 52 }),
      opacity: 0.84,
    },
    'flip-layout-transition': {
      ...flipDelta(
        { left: 0, top: 0, width: 100, height: 44 },
        { left: 40, top: 16, width: 112, height: 44 }),
    },
    odometer: { y: 10 },
    // Fixtures animate the semantic control itself; retain a >=44px hit area at 56px.
    // Product integrations should bind progress scaling to a non-interactive child.
    'hold-to-confirm': { scaleX: 0.8, origin: 'left center' },
    'scroll-linked-progress': { scaleX: 0.8, origin: 'left center' },
    'haptic-audio-feedback': { scaleX: 0.98, scaleY: 0.98 },
  };
  return { ...INITIAL, ...(states[recipeId] || {}) };
}

function visualState(state, reduced) {
  if (reduced) {
    return {
      ...state,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      // Opacity can still encode the final semantic state (for example dismiss).
      opacity: state.opacity,
    };
  }
  return state;
}

function frameFor(state) {
  return {
    transform: `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scaleX}, ${state.scaleY})`,
    opacity: String(state.opacity),
    transformOrigin: state.origin || 'center center',
  };
}

function createWaapiDriver(target) {
  return {
    animate(from, to, options) {
      if (options.duration === 0 || typeof target.animate !== 'function') {
        Object.assign(target.style, to);
        return { finished: Promise.resolve(), cancel() {} };
      }
      const animation = target.animate([from, to], {
        duration: options.duration,
        easing: options.easing,
        fill: 'forwards',
      });
      return {
        finished: animation.finished.catch(error => {
          if (error?.name !== 'AbortError') throw error;
        }),
        cancel: () => animation.cancel(),
      };
    },
  };
}

function createMotionController(recipeId, initialTarget = null, options = {}) {
  let target = initialTarget;
  if (target && typeof target.addEventListener !== 'function') {
    throw new TypeError('createMotionController target must be an EventTarget element');
  }
  const reduced = Boolean(options.reduced);
  const duration = reduced ? 0 : (options.duration ?? 96);
  const customDriver = options.driver || null;
  let driver = customDriver || (target ? createWaapiDriver(target) : null);
  const startState = recipeInitialState(recipeId);
  let endState = recipeState(recipeId);
  let currentState = startState;
  let active = null;
  let destroyed = false;
  let mounted = false;
  let listenerCount = 0;
  let operation = 0;
  const stateGraph = compileMotionStateGraph(options.stateGraph || DEFAULT_GRAPH);
  const stateMachine = stateGraph.createMachine();

  function apply(state) {
    if (!target) throw new Error(`${recipeId}: controller is not mounted`);
    currentState = { ...state };
    Object.assign(target.style, frameFor(visualState(currentState, reduced)));
    target.dataset.motionState = JSON.stringify(currentState);
    target.dataset.motionPhase = 'settled';
    target.dataset.motionRecipe = recipeId;
    target.dataset.motionReduced = String(reduced);
    if (Number.isFinite(currentState.value)) target.dataset.motionValue = String(currentState.value);
    if (Number.isFinite(currentState.progress)) target.setAttribute('aria-valuenow', String(currentState.progress));
  }

  async function move(next, phase) {
    if (destroyed) throw new Error(`${recipeId}: controller is destroyed`);
    if (!mounted || !target || !driver) throw new Error(`${recipeId}: controller is not mounted`);
    cancel();
    const ownOperation = ++operation;
    target.dataset.motionPhase = phase;
    const from = frameFor(visualState(currentState, reduced));
    const to = frameFor(visualState(next, reduced));
    const handle = driver.animate(from, to, {
      duration,
      easing: endState.spring ? 'cubic-bezier(.2,.8,.2,1)' : 'cubic-bezier(.2,0,0,1)',
    });
    active = handle;
    await handle.finished;
    if (!destroyed && ownOperation === operation) {
      apply(next);
      active = null;
    }
    return { status: 'completed', ...snapshot() };
  }

  function cancel() {
    if (active) {
      operation += 1;
      active.cancel();
      active = null;
      target.dataset.motionPhase = 'cancelled';
    }
  }

  function onActivate() {
    const graphState = stateMachine.snapshot().state;
    if (graphState === 'idle') stateMachine.dispatch('pointerenter');
    if (stateMachine.snapshot().state === 'hover') stateMachine.dispatch('pointerdown');
    void move(endState, 'running');
  }

  function mount(nextTarget = null) {
    if (destroyed) throw new Error(`${recipeId}: cannot remount a destroyed controller`);
    if (mounted) {
      if (!nextTarget || nextTarget === target) return api;
      throw new Error(`${recipeId}: controller is already mounted to another target`);
    }
    if (nextTarget) target = nextTarget;
    if (!target || typeof target.addEventListener !== 'function') {
      throw new TypeError(`${recipeId}: mount(target) requires an EventTarget element`);
    }
    if (!customDriver) driver = createWaapiDriver(target);
    target.addEventListener('click', onActivate);
    listenerCount += 1;
    mounted = true;
    target.dataset.motionMounted = 'true';
    apply(startState);
    return api;
  }

  function destroy() {
    if (destroyed) return;
    cancel();
    if (mounted && target) {
      target.removeEventListener('click', onActivate);
      listenerCount = Math.max(0, listenerCount - 1);
    }
    mounted = false;
    destroyed = true;
    if (target) {
      target.dataset.motionMounted = 'false';
      target.dataset.motionDestroyed = 'true';
    }
  }

  function snapshot() {
    if (!target) {
      return {
        recipeId, reduced, phase: 'unmounted', state: { ...currentState },
        computed: null, listenerCount, mounted, destroyed,
      };
    }
    const computed = typeof getComputedStyle === 'function' ? getComputedStyle(target) : target.style;
    return {
      recipeId,
      reduced,
      phase: target.dataset.motionPhase,
      state: { ...currentState },
      computed: {
        transform: computed.transform,
        opacity: computed.opacity,
        transformOrigin: computed.transformOrigin,
      },
      listenerCount,
      mounted,
      destroyed,
      stateGraph: stateMachine.snapshot(),
    };
  }

  function update(input = {}) {
    if (destroyed) throw new Error(`${recipeId}: controller is destroyed`);
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new TypeError(`${recipeId}: update(input) requires an object`);
    }
    if (input.event) stateMachine.dispatch(input.event);
    const { event: _event, ...motionInput } = input;
    endState = { ...endState, ...motionInput };
    target?.setAttribute('data-motion-input', JSON.stringify(input));
    return snapshot();
  }

  const api = {
    recipeId,
    mount,
    play: input => {
      if (input) update(input);
      return move(endState, 'running');
    },
    run: () => move(endState, 'running'),
    reverse: () => move(startState, 'reversing'),
    cancel,
    update,
    transition: event => stateMachine.dispatch(event),
    destroy,
    snapshot,
  };
  return api;
}

module.exports = {
  INITIAL,
  recipeState,
  recipeInitialState,
  visualState,
  frameFor,
  createWaapiDriver,
  createMotionController,
};
