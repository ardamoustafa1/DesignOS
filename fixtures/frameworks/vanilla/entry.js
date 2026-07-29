import { projectMomentum } from '../../../runtime/motion/core.js';
const button = document.querySelector('#run');
button.addEventListener('click', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  button.style.transform = `translateX(${reduce ? 0 : projectMomentum(120, .8)}px)`;
  button.dataset.complete = 'true';
});
