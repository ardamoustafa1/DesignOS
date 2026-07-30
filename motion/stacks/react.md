# Motion Stack — React

`motion/recipes.md` sets the law (tokens, compositor-only properties, reduced motion);
this file is the React-idiomatic wiring for it. Same rules, `useEffect`/`useLayoutEffect`
cleanup instead of a generic teardown function.

## 1 · Enter/exit with `motion` (formerly Framer Motion)

```jsx
import { motion, useReducedMotion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1];        // --ease-out
const enter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.2, ease: EASE },   // --duration-base
};

function Toast({ children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div {...enter} transition={reduce ? { duration: 0.1 } : enter.transition}>
      {children}
    </motion.div>
  );
}
```

Springs are the exception, not the default (`motion/physics.md` two-parameter model):
`{ type: 'spring', duration: 0.5, bounce: 0.2 }`. One config, imported from a shared
`motionTokens.ts`, never inlined per component.

## 2 · Scroll entrance — `IntersectionObserver` + `useEffect` cleanup

```jsx
import { useEffect, useRef, useState } from 'react';

function useRevealOnce({ threshold = 0.15 } = {}) {
  const ref = useRef(null);
  const [isIn, setIsIn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsIn(true); io.unobserve(el); }
    }, { threshold, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();   // the cleanup React expects on unmount/deps change
  }, [threshold]);
  return [ref, isIn];
}
```

The observer is created and torn down entirely inside the effect — never store it in a
ref that outlives the component, and never skip the cleanup return, or the tween
described in `motion/recipes.md` "anti-patterns" (a stale observer on a detached node)
happens on every remount in dev's StrictMode double-invoke.

## 3 · GSAP + ScrollTrigger — `useLayoutEffect` + `gsap.context`

```jsx
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

function PinnedRail({ children }) {
  const railRef = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.panel', {
        xPercent: -100 * (railRef.current.children.length - 1),
        ease: 'none',
        scrollTrigger: { trigger: railRef.current, pin: true, scrub: 1, start: 'top top' },
      });
    }, railRef);
    return () => ctx.revert();   // required — GSAP state does not follow React's lifecycle
  }, []);
  return <div ref={railRef} className="rail">{children}</div>;
}
```

`useLayoutEffect`, not `useEffect`, for anything GSAP measures synchronously before
paint (pin heights, initial transforms) — `useEffect` fires after paint and the pinned
element flashes at its natural position first.

## Anti-patterns specific to this stack

- Passing `x`/`y`/`scale` shorthand props to `motion.div` and assuming they're GPU-only —
  verify the rendered `transform` in devtools; some `motion` versions resolve shorthand
  through a main-thread path under load.
- `gsap.context` created outside `useLayoutEffect` (e.g. at module scope) — it then
  targets whatever DOM existed at import time, not the mounted instance.
- Reduced motion checked once at mount instead of via `useReducedMotion()`'s live value —
  a user who toggles the OS setting mid-session keeps the old behavior until refresh.

## Checklist

- [ ] Every `useEffect`/`useLayoutEffect` that starts an observer, tween, or GSAP context returns a cleanup
- [ ] `gsap.context` is created inside `useLayoutEffect`, scoped to a ref, and reverted on cleanup
- [ ] Reduced motion is read live via `useReducedMotion()`, not cached once at mount
- [ ] No `motion.div` shorthand prop (`x`/`y`/`scale`) is trusted without verifying the rendered `transform` is compositor-only
- [ ] `node validators/check-motion.js <target>` is clean
