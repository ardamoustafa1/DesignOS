import { createMotionController } from '../../../runtime/motion/controller.js';
const button = document.querySelector('#run');
const recipe = new URLSearchParams(location.search).get('recipe') || 'momentum-projection';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const controller = createMotionController(recipe, button, { reduced, duration: 72 });
controller.mount();
window.__designosAdapter = controller;
window.__designosUnmount = () => controller.destroy();
window.__designosReady = true;
