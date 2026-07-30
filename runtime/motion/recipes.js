'use strict';

const STACKS = ['vanilla', 'react', 'motion', 'gsap', 'vue', 'svelte'];

const RECIPES = [
  ['momentum-projection', 'projectMomentum', 'compositor', 'Snap immediately to the nearest point.', '0.5ms calculation; one transform write per frame'],
  ['velocity-handoff', 'springPhysics', 'compositor', 'Critically damped settle with no inherited momentum.', '≤500ms settle; cancellable animation'],
  ['rubber-band-boundary', 'rubberBand', 'compositor', 'Clamp at the boundary.', 'one transform write per pointer frame'],
  ['swipe-to-dismiss', 'shouldDismiss', 'compositor', 'Keep 1:1 tracking; snap without bounce.', 'INP <200ms; visible close-button equivalent'],
  ['spring-reversal', 'springPhysics', 'compositor', 'Instant or critically damped state reversal.', 'cancel previous animation before replacement'],
  ['interruptible-accordion', 'reducedMotionPolicy', 'compositor', 'Instant disclosure with preserved focus.', '≤200ms; no height:auto tween'],
  ['origin-aware-popover', 'reducedMotionPolicy', 'compositor', 'Opacity ≤80ms at the same anchor.', '≤150ms entry; ≤110ms exit'],
  ['shared-element-transition', 'flipDelta', 'compositor', 'Crossfade without spatial travel.', '≤300ms; no LCP delay'],
  ['flip-layout-transition', 'flipDelta', 'compositor', 'Apply the final layout immediately.', 'measure once; mutate once; transform only'],
  ['odometer', 'odometerFrames', 'compositor', 'Render the final value immediately.', '≤500ms; aria-live announces final value once'],
  ['hold-to-confirm', 'scrollProgress', 'compositor', 'Preserve deliberate hold; remove decorative movement.', 'pointer cancellation required; ≤1 progress write/frame'],
  ['magnetic-interaction', 'magneticOffset', 'compositor', 'Disable attraction; retain focus emphasis.', 'fine-pointer only; stop rAF when settled'],
  ['drag-reorder', 'flipDelta', 'compositor', 'Keyboard move commands update order instantly.', 'pointer capture; ≤1 transform write/frame'],
  ['scroll-linked-progress', 'scrollProgress', 'compositor', 'Static progress or direct section state.', 'CSS timeline preferred; passive+rAF fallback'],
  ['haptic-audio-feedback', 'feedback', 'system', 'Respect OS/user feedback preferences.', 'user gesture required; no autoplay audio'],
].map(([id, core, cost, reduced, budget]) => Object.freeze({
  id,
  core,
  cost,
  reduced,
  budget,
  adapters: STACKS,
  fixture: `runtime/motion/fixtures/${id}.json`,
}));

function adapterSource(recipeId, stack) {
  const recipe = RECIPES.find(item => item.id === recipeId);
  if (!recipe) throw new Error(`Unknown motion recipe: ${recipeId}`);
  if (!STACKS.includes(stack)) throw new Error(`Unsupported motion adapter: ${stack}`);
  const common = `import { createMotionController } from './runtime/motion/controller.js';`;
  const bodies = {
    vanilla: `${common}\nexport function mountDesignOSMotion(target, options = {}) {\n  const controller = createMotionController('${recipe.id}', target, options);\n  controller.mount();\n  return { ...controller, unmount: () => controller.destroy() };\n}`,
    react: `import { useEffect, useRef } from 'react';\n${common}\nexport function useDesignOSMotion(options = {}) {\n  const ref = useRef(null); const controller = useRef(null);\n  useEffect(() => {\n    controller.current = createMotionController('${recipe.id}', ref.current, options);\n    controller.current.mount();\n    return () => controller.current.destroy();\n  }, [options.reduced]);\n  return { ref, controller };\n}`,
    motion: `import { animate } from 'motion';\n${common}\nexport function mountDesignOSMotion(target, options = {}) {\n  const driver = { animate: (from, to, timing) => {\n    Object.assign(target.style, from);\n    const controls = animate(target, to, { duration: timing.duration / 1000, ease: 'ease-out' }); let settle;\n    const finished = new Promise(resolve => { settle = resolve; controls.finished.then(resolve, resolve); });\n    return { finished, cancel: () => { controls.stop(); settle(); } };\n  } };\n  const controller = createMotionController('${recipe.id}', target, { ...options, driver });\n  controller.mount(); return { ...controller, unmount: () => controller.destroy() };\n}`,
    gsap: `import { gsap } from 'gsap';\n${common}\nexport function mountDesignOSMotion(target, options = {}) {\n  const driver = { animate: (from, to, timing) => {\n    let tween; let settle; const finished = new Promise(resolve => {\n      settle = resolve;\n      tween = gsap.fromTo(target, from, { ...to, duration: timing.duration / 1000, ease: 'power2.out', onComplete: resolve });\n    });\n    return { finished, cancel: () => { tween?.kill(); settle(); } };\n  } };\n  const controller = createMotionController('${recipe.id}', target, { ...options, driver });\n  controller.mount(); return { ...controller, unmount: () => controller.destroy() };\n}`,
    vue: `import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue';\n${common}\nexport function useDesignOSMotion(options = {}) {\n  const element = ref(null); const controller = shallowRef(null);\n  onMounted(() => { controller.value = createMotionController('${recipe.id}', element.value, options); controller.value.mount(); });\n  onBeforeUnmount(() => controller.value?.destroy());\n  return { element, controller };\n}`,
    svelte: `${common}\nexport function designOSMotion(node, options = {}) {\n  const controller = createMotionController('${recipe.id}', node, options);\n  controller.mount();\n  return { controller, destroy: () => controller.destroy() };\n}`,
  };
  return `/* ${recipe.id}\n * budget: ${recipe.budget}\n * reduced motion: ${recipe.reduced}\n */\n${bodies[stack]}`;
}

module.exports = { STACKS, RECIPES, adapterSource };
