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
  const common = `const { ${recipe.core} } = require('./runtime/motion/core');`;
  const bodies = {
    vanilla: `${common}\nconst controller = new AbortController();\nconst reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;\n// Apply ${recipe.id} with transform/opacity only; abort on teardown.\nexport const cleanup = () => controller.abort();`,
    react: `import { useEffect, useRef } from 'react';\nimport { ${recipe.core} } from './runtime/motion/core';\nexport function useDesignOSMotion(reduced) {\n  const ref = useRef(null);\n  useEffect(() => { const controller = new AbortController();\n    // ${recipe.id}: bind to ref.current with controller.signal.\n    return () => controller.abort();\n  }, [reduced]);\n  return ref;\n}`,
    motion: `import { useReducedMotion, useMotionValue, animate } from 'motion/react';\nimport { ${recipe.core} } from './runtime/motion/core';\nexport function useDesignOSMotion() {\n  const reduced = useReducedMotion(); const value = useMotionValue(0); let controls;\n  const run = target => { controls?.stop(); controls = animate(value, target, reduced ? { duration: 0 } : { type: 'spring', duration: .5, bounce: .15 }); };\n  return { value, run, stop: () => controls?.stop() };\n}`,
    gsap: `import gsap from 'gsap';\nimport { ${recipe.core} } from './runtime/motion/core';\nexport function mountDesignOSMotion(root) {\n  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;\n  const context = gsap.context(() => { /* ${recipe.id}; use transform/opacity */ }, root);\n  return () => context.revert();\n}`,
    vue: `import { onMounted, onBeforeUnmount, ref } from 'vue';\nimport { ${recipe.core} } from './runtime/motion/core';\nexport function useDesignOSMotion() {\n  const element = ref(); const controller = new AbortController();\n  onMounted(() => { /* ${recipe.id}; bind with controller.signal */ });\n  onBeforeUnmount(() => controller.abort()); return element;\n}`,
    svelte: `import { onMount } from 'svelte';\nimport { ${recipe.core} } from './runtime/motion/core';\nexport function designOSMotion(node) {\n  const controller = new AbortController();\n  // ${recipe.id}; bind with controller.signal and reduced-motion query.\n  return { destroy: () => controller.abort() };\n}`,
  };
  return `/* ${recipe.id}\n * budget: ${recipe.budget}\n * reduced motion: ${recipe.reduced}\n */\n${bodies[stack]}`;
}

module.exports = { STACKS, RECIPES, adapterSource };
