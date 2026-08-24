'use strict';

const frame = (target, keyframes, options) => {
  if (typeof target.animate !== 'function') return null;
  return target.animate(keyframes, { fill: 'both', ...options });
};
const listen = (target, type, handler, options, cleanups) => {
  target.addEventListener(type, handler, options);
  cleanups.push(() => target.removeEventListener(type, handler, options));
};
const pointer = (event, target) => {
  const rect = target.getBoundingClientRect();
  return { x: (event.clientX - rect.left) / Math.max(rect.width, 1) - .5, y: (event.clientY - rect.top) / Math.max(rect.height, 1) - .5 };
};
const timing = contract => ({ duration: contract.duration || 480, easing: contract.easing === 'spring' ? 'cubic-bezier(.2,.8,.2,1)' : contract.easing, fill: 'both' });

const DRIVER_IMPLEMENTATIONS = Object.freeze({
  reveal(target, contract, state) { state.animations.push(frame(target, [{ opacity: 0, transform: 'translate3d(0,18px,0)' }, { opacity: 1, transform: 'none' }], timing(contract))); },
  resolve(target, contract, state) { state.animations.push(frame(target, [{ opacity: .35, filter: 'blur(10px)', transform: 'scale(.985)' }, { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' }], timing(contract))); },
  press(target, contract, state) { const run = () => state.animations.push(frame(target, [{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], timing(contract))); listen(target, 'pointerdown', run, { passive: true }, state.cleanups); },
  clip(target, contract, state) { state.animations.push(frame(target, [{ clipPath: 'inset(0 100% 0 0)', transform: 'translate3d(-8px,0,0)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }], timing(contract))); },
  handoff(target, contract, state) { state.animations.push(frame(target, [{ opacity: 0, transform: 'translate3d(24px,0,0) scale(.98)' }, { opacity: 1, transform: 'none' }], timing(contract))); },
  stagger(target, contract, state) { const nodes = target.children.length ? [...target.children] : [target]; nodes.forEach((node, index) => state.animations.push(frame(node, [{ opacity: 0, transform: 'translate3d(0,14px,0)' }, { opacity: 1, transform: 'none' }], { ...timing(contract), delay: index * 55 }))); },
  scramble(target, contract, state) { const original = target.textContent || ''; const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const start = performance.now(); const tick = now => { const p = Math.min(1, (now - start) / (contract.duration || 780)); target.textContent = [...original].map((letter, index) => index / Math.max(original.length, 1) < p || /\s/.test(letter) ? letter : alphabet[(index * 13 + Math.floor(now / 34)) % alphabet.length]).join(''); if (p < 1) state.raf = requestAnimationFrame(tick); }; state.raf = requestAnimationFrame(tick); state.cleanups.push(() => { target.textContent = original; }); },
  pulse(target, contract, state) { state.animations.push(frame(target, [{ opacity: .62, transform: 'scale(.97)' }, { opacity: 1, transform: 'scale(1.025)' }, { opacity: .62, transform: 'scale(.97)' }], { ...timing(contract), iterations: Infinity })); },
  loop(target, contract, state) { state.animations.push(frame(target, [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-32px,0,0)' }], { ...timing(contract), iterations: Infinity })); },
  spotlight(target, _contract, state) { const move = event => { const point = pointer(event, target); target.style.setProperty('--motion-x', `${(point.x + .5) * 100}%`); target.style.setProperty('--motion-y', `${(point.y + .5) * 100}%`); }; listen(target, 'pointermove', move, { passive: true }, state.cleanups); },
  parallax(target, _contract, state) { const update = () => { state.raf = 0; const rect = target.getBoundingClientRect(); const p = (innerHeight / 2 - (rect.top + rect.height / 2)) / Math.max(innerHeight, 1); target.style.transform = `translate3d(0,${(p * 28).toFixed(2)}px,0)`; }; const request = () => { if (!state.raf) state.raf = requestAnimationFrame(update); }; listen(globalThis, 'scroll', request, { passive: true }, state.cleanups); update(); },
  progress(target, _contract, state) { const update = () => { state.raf = 0; const max = document.documentElement.scrollHeight - innerHeight; target.style.setProperty('--motion-progress', String(max ? Math.max(0, Math.min(1, scrollY / max)) : 0)); }; const request = () => { if (!state.raf) state.raf = requestAnimationFrame(update); }; listen(globalThis, 'scroll', request, { passive: true }, state.cleanups); update(); },
  tilt(target, _contract, state) { const move = event => { const point = pointer(event, target); target.style.transform = `perspective(900px) rotateX(${(-point.y * 6).toFixed(2)}deg) rotateY(${(point.x * 8).toFixed(2)}deg)`; }; listen(target, 'pointermove', move, { passive: true }, state.cleanups); listen(target, 'pointerleave', () => { target.style.transform = ''; }, { passive: true }, state.cleanups); },
  magnetic(target, _contract, state) { const move = event => { const point = pointer(event, target); target.style.transform = `translate3d(${(point.x * 18).toFixed(2)}px,${(point.y * 18).toFixed(2)}px,0)`; }; listen(target, 'pointermove', move, { passive: true }, state.cleanups); listen(target, 'pointerleave', () => { target.style.transform = ''; }, { passive: true }, state.cleanups); },
  spring(target, contract, state) { const run = () => state.animations.push(frame(target, [{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }], timing(contract))); listen(target, 'pointerdown', run, { passive: true }, state.cleanups); },
  draw(target, contract, state) { const length = typeof target.getTotalLength === 'function' ? target.getTotalLength() : 100; target.style.strokeDasharray = String(length); state.animations.push(frame(target, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }], timing(contract))); },
  morph(target, contract, state) { const to = target.dataset?.motionTo; if (!to || !target.getAttribute?.('d')) return DRIVER_IMPLEMENTATIONS.resolve(target, contract, state); const from = target.getAttribute('d'); const number = /-?\d*\.?\d+/g; const a = from.match(number)?.map(Number) || []; const b = to.match(number)?.map(Number) || []; if (a.length !== b.length) return DRIVER_IMPLEMENTATIONS.resolve(target, contract, state); const start = performance.now(); const tick = now => { const p = Math.min(1, (now - start) / (contract.duration || 600)); let index = 0; target.setAttribute('d', from.replace(number, () => String(a[index] + (b[index] - a[index++]) * p))); if (p < 1) state.raf = requestAnimationFrame(tick); }; state.raf = requestAnimationFrame(tick); },
  state(target, _contract, state) { const update = () => { target.dataset.motionState = target.dataset.motionState === 'active' ? 'idle' : 'active'; }; listen(target, 'click', update, undefined, state.cleanups); },
  orbit(target, _contract, state) { let px = 0, py = 0; listen(target, 'pointermove', event => { const point = pointer(event, target); px = point.x; py = point.y; }, { passive: true }, state.cleanups); const tick = now => { target.style.transform = `perspective(1000px) rotateX(${(py * -8).toFixed(2)}deg) rotateY(${(px * 12 + now * .004).toFixed(2)}deg)`; state.raf = requestAnimationFrame(tick); }; state.raf = requestAnimationFrame(tick); },
  shader(target, _contract, state) { const canvas = target.tagName === 'CANVAS' ? target : target.querySelector?.('canvas'); const context = canvas?.getContext?.('2d'); if (!context) return DRIVER_IMPLEMENTATIONS.resolve(target, { duration: 360, easing: 'ease-out' }, state); const tick = now => { const width = canvas.width = Math.max(1, canvas.clientWidth); const height = canvas.height = Math.max(1, canvas.clientHeight); const gradient = context.createRadialGradient(width * (.5 + Math.sin(now * .0003) * .2), height * .42, 0, width * .5, height * .5, width * .7); gradient.addColorStop(0, 'rgba(255,110,55,.7)'); gradient.addColorStop(1, 'rgba(0,0,0,0)'); context.clearRect(0, 0, width, height); context.fillStyle = gradient; context.fillRect(0, 0, width, height); state.raf = requestAnimationFrame(tick); }; state.raf = requestAnimationFrame(tick); },
  particles(target, _contract, state) { const canvas = target.tagName === 'CANVAS' ? target : target.querySelector?.('canvas'); const context = canvas?.getContext?.('2d'); if (!context) return DRIVER_IMPLEMENTATIONS.resolve(target, { duration: 360, easing: 'ease-out' }, state); const points = Array.from({ length: 36 }, (_, i) => ({ phase: i * .73, radius: 1 + i % 4 })); const tick = now => { const width = canvas.width = Math.max(1, canvas.clientWidth); const height = canvas.height = Math.max(1, canvas.clientHeight); context.clearRect(0, 0, width, height); context.fillStyle = 'rgba(255,110,55,.38)'; for (const point of points) { context.beginPath(); context.arc((.5 + .42 * Math.sin(point.phase + now * .0002)) * width, (.5 + .42 * Math.cos(point.phase * 1.7 + now * .00016)) * height, point.radius, 0, Math.PI * 2); context.fill(); } state.raf = requestAnimationFrame(tick); }; state.raf = requestAnimationFrame(tick); },
});

function mountMotionRecipe(target, contract, drivers = {}) {
  if (!target || !contract) throw new TypeError('MotionOS runtime requires target and contract');
  if (!DRIVER_IMPLEMENTATIONS[contract.driver]) throw new Error(`MotionOS driver is not implemented: ${contract.driver}`);
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  target.dataset.motionRecipe = contract.id;
  target.dataset.motionDriver = contract.driver;
  if (reduced) {
    target.dataset.motionReduced = 'true';
    return () => { delete target.dataset.motionRecipe; delete target.dataset.motionDriver; delete target.dataset.motionReduced; };
  }
  const state = { animations: [], cleanups: [], raf: 0 };
  if (drivers.animate && ['reveal', 'resolve', 'clip', 'handoff'].includes(contract.driver)) {
    const control = drivers.animate(target, { opacity: 1, transform: 'none' }, { duration: (contract.duration || 480) / 1000 });
    state.animations.push(control);
  } else if (drivers.gsap && ['reveal', 'resolve', 'clip', 'handoff'].includes(contract.driver)) {
    state.animations.push(drivers.gsap.fromTo(target, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: (contract.duration || 480) / 1000, ease: 'power3.out' }));
  } else DRIVER_IMPLEMENTATIONS[contract.driver](target, contract, state);
  return () => {
    cancelAnimationFrame(state.raf);
    state.animations.forEach(animation => { animation?.cancel?.(); animation?.stop?.(); animation?.kill?.(); });
    state.cleanups.splice(0).forEach(cleanup => cleanup());
    ['--motion-x', '--motion-y', '--motion-progress'].forEach(property => target.style.removeProperty(property));
    target.style.transform = '';
    delete target.dataset.motionRecipe;
    delete target.dataset.motionDriver;
  };
}

module.exports = { DRIVER_IMPLEMENTATIONS, mountMotionRecipe };
