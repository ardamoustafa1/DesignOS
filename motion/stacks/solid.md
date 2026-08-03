# Motion Stack — Solid

`motion/recipes.md` sets the law; this file is the Solid-idiomatic wiring for it —
`<Show>`/`<Transition>` (`solid-transition-group`) for enter/exit, `onMount`/`onCleanup`
for anything imperative. Solid's fine-grained reactivity means effects re-run per signal
change, not per component render, which changes where cleanup has to live.

## 1 · Enter/exit with `solid-transition-group`

```jsx
import { Transition } from 'solid-transition-group';

function Toast(props) {
  return (
    <Transition
      onEnter={(el, done) => {
        const a = el.animate(
          [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
          { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },  // --duration-base / --ease-out
        );
        a.finished.then(done);
      }}
      onExit={(el, done) => {
        const a = el.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },  // --duration-fast: exits faster
        );
        a.finished.then(done);
      }}
    >
      <Show when={props.open}><div class="toast">{props.children}</div></Show>
    </Transition>
  );
}
```

Using the Web Animations API directly inside `onEnter`/`onExit` keeps the same
compositor-only guarantee as the CSS recipes — animate `transform`/`opacity` in the
keyframe objects, nothing else.

## 2 · Scroll entrance — `IntersectionObserver` + `onCleanup`

```jsx
import { onMount, onCleanup, createSignal } from 'solid-js';

function Reveal(props) {
  let el;
  const [isIn, setIsIn] = createSignal(false);
  onMount(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsIn(true); io.unobserve(el); }
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    onCleanup(() => io.disconnect());   // registered from inside onMount, tied to this owner
  });
  return <div ref={el} class="reveal" classList={{ 'is-in': isIn() }}>{props.children}</div>;
}
```

`onCleanup` must be called synchronously within a reactive scope (here, inside `onMount`)
— calling it later from an async callback silently does nothing, which is the Solid-
specific shape of the generic `motion-missing-cleanup` failure.

## 3 · GSAP + ScrollTrigger

```jsx
import { onMount, onCleanup } from 'solid-js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

function PinnedRail(props) {
  let rail;
  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.to('.panel', {
        xPercent: -100 * (rail.children.length - 1),
        ease: 'none',
        scrollTrigger: { trigger: rail, pin: true, scrub: 1, start: 'top top' },
      });
    }, rail);
    onCleanup(() => ctx.revert());
  });
  return <div ref={rail} class="rail">{props.children}</div>;
}
```

## Anti-patterns specific to this stack

- Calling `onCleanup` outside a synchronous reactive scope (e.g. after an `await`) —
  Solid ties cleanup registration to the currently-running owner, not to closures.
- Driving animation state through a `createSignal` read inside a hot `requestAnimationFrame`
  loop — Solid's fine-grained updates make this cheap, but it still bypasses the
  compositor if the signal writes a layout-affecting style rather than a transform.

## Checklist

- [ ] `onCleanup` is called synchronously inside the reactive scope that owns the resource, never after an `await`
- [ ] Web Animations API keyframes in `onEnter`/`onExit` animate only `transform`/`opacity`
- [ ] `gsap.context` is reverted via `onCleanup`, not left to garbage collection
- [ ] `node validators/check-motion.js <target>` is clean
