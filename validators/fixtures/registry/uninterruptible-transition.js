// Anti-pattern fixture: a drag handler that never clears its CSS transition on grab.
// The transition below keeps smoothing every pointermove frame instead of the surface
// tracking the pointer 1:1 (motion/physics.md tracking law).
const sheet = document.querySelector('.sheet');

sheet.addEventListener('pointerdown', (e) => {
  sheet.setPointerCapture(e.pointerId);
  // BUG: never sets sheet.style.transition = 'none' here.
});

sheet.addEventListener('pointermove', (e) => {
  sheet.style.transform = `translateX(${e.clientX}px)`;
});

const styleTag = document.createElement('style');
styleTag.textContent = `.sheet { transition: transform 300ms ease-out; }`;
document.head.append(styleTag);
