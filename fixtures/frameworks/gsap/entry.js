import { gsap } from 'gsap';
import { createMotionController } from '../../../runtime/motion/controller.js';
const button = document.querySelector('#run');
const recipe = new URLSearchParams(location.search).get('recipe') || 'momentum-projection';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const driver = {
  animate(from, to, timing) {
    Object.assign(button.style, from);
    let tween;
    let settle;
    const finished = new Promise(resolve => {
      settle = resolve;
      tween = gsap.to(button, {
        ...to,
        duration: timing.duration / 1000,
        ease: 'power2.out',
        onComplete: resolve,
      });
    });
    return {
      finished,
      cancel() {
        tween?.kill();
        settle();
      },
    };
  },
};
const controller = createMotionController(recipe, button, { reduced, duration: 72, driver });
controller.mount();
window.__designosAdapter = controller;
window.__designosUnmount = () => controller.destroy();
window.__designosReady = true;
