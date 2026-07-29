import { gsap } from 'gsap';
const button = document.querySelector('#run');
button.addEventListener('click', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.to(button, { x: reduce ? 0 : 24, duration: reduce ? 0 : .12, onComplete: () => { button.dataset.complete = 'true'; } });
});
