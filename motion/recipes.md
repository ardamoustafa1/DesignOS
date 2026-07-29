# Motion Recipes

`principles.md` sets the law, `micro-interactions.md` sets the spec, `performance.md` sets
the budget. This file is the **implementation layer**: the exact code, already using the
DesignOS tokens, already compositor-safe, already reduced-motion-aware.

Copy a recipe, change the selector, ship. Every one of these passes
`validators/check-motion.js` as written — if you edit a duration or an easing out of the
token layer, the validator will say so.

## The token layer these recipes assume

```css
:root {
  --duration-instant: 100ms;   --duration-fast:   150ms;
  --duration-base:    200ms;   --duration-slow:   300ms;
  --duration-slower:  500ms;

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-in:     cubic-bezier(0.7, 0, 0.84, 0);   /* exits only */

  /* Optional, and at most ONE per system (principles.md easing law 4). */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --motion: 1; /* the reduced-motion multiplier — see the last recipe */
}
@media (prefers-reduced-motion: reduce) { :root { --motion: 0; } }
```

## 1 · Button — press, hover, and the loading handoff

```css
.btn {
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color     var(--duration-fast) var(--ease-out),
    transform        var(--duration-fast) var(--ease-out);
}
.btn:hover  { transform: translateY(-1px); }
.btn:active { transform: translateY(0) scale(0.99); } /* the mechanical click */
.btn[aria-busy="true"] { width: var(--btn-locked-width); pointer-events: none; }
```

Lock the width *before* swapping the label for a spinner, or the row reflows and you have
bought a CLS penalty for a 200ms flourish.

## 2 · Dropdown / popover — enters from its trigger

```css
.menu {
  transform-origin: top center;      /* origin honesty: it grows out of the button */
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
  transition:
    opacity   var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}
.menu[data-open="true"] { opacity: 1; transform: translateY(0) scale(1); }
```

Exit at `--duration-instant`: the user asked it to close, do not make them watch.

## 3 · Modal + backdrop — two elements, one gesture

```css
.backdrop { opacity: 0; transition: opacity var(--duration-base) var(--ease-out); }
.backdrop[data-open="true"] { opacity: 1; }

.dialog {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
  transition:
    opacity   var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}
.dialog[data-open="true"] { opacity: 1; transform: none; }
```

Never `scale(0)` → `scale(1)`. Nothing in the physical world collapses to a point and comes
back; start near the final size and let the fade do the work.

## 4 · Drawer / sheet — from the edge it lives on

```css
.sheet {
  transform: translateX(100%);
  transition: transform var(--duration-slow) var(--ease-out);
}
.sheet[data-open="true"] { transform: none; }
```

While dragging, drop the transition entirely and write `transform` from the pointer
position — a transition during a drag is 300ms of lag between finger and surface. See
`physics.md` for the release throw.

## 5 · Accordion — the height animation that is not a height animation

```css
.acc-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-base) var(--ease-out);
}
.acc-panel > * { overflow: hidden; min-height: 0; } /* min-height: 0 is load-bearing */
.acc-panel[data-open="true"] { grid-template-rows: 1fr; }
```

This is the one layout property DesignOS licenses for animation, because there is no
compositor-only alternative that also handles unknown content height.

## 6 · Shadow on hover — crossfade, never animate `box-shadow`

```css
.card { position: relative; transition: transform var(--duration-fast) var(--ease-out); }
.card::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  box-shadow: 0 12px 28px rgb(0 0 0 / 0.22);
  opacity: 0; pointer-events: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}
.card:hover        { transform: translateY(-2px); }
.card:hover::after { opacity: 1; }
```

Animating `box-shadow` directly repaints the element every frame. Two static shadows
crossfading by opacity cost nothing.

## 7 · Underline grow — `scaleX` on a pseudo-element

```css
.link { position: relative; }
.link::after {
  content: ""; position: absolute; left: 0; bottom: -2px; width: 100%; height: 1px;
  background: currentColor;
  transform: scaleX(0); transform-origin: left;
  transition: transform var(--duration-fast) var(--ease-out);
}
.link:hover::after, .link:focus-visible::after { transform: scaleX(1); }
```

## 8 · Scroll entrance — one observer, unobserve after firing

```css
.reveal {
  opacity: 0;
  transform: translateY(calc(16px * var(--motion)));
  transition:
    opacity   var(--duration-slower) var(--ease-out),
    transform var(--duration-slower) var(--ease-out);
}
.reveal.is-in { opacity: 1; transform: none; }
```
```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-in');
    io.unobserve(e.target);          // fire once — re-entrance on every scroll pass is noise
  }
}, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));
// in a component: return () => io.disconnect()
```

Never gate the LCP element on this. Above-the-fold content is visible at first paint or the
entrance costs you a Core Web Vital.

## 9 · Stagger — capped, and never blocking

```css
.stagger > * { animation: rise var(--duration-slower) var(--ease-out) backwards; }
.stagger > :nth-child(1) { animation-delay:   0ms; }
.stagger > :nth-child(2) { animation-delay:  40ms; }
.stagger > :nth-child(3) { animation-delay:  80ms; }
.stagger > :nth-child(4) { animation-delay: 120ms; }
.stagger > :nth-child(5) { animation-delay: 160ms; }
.stagger > :nth-child(n+6) { animation-delay: 200ms; } /* the tail animates as one group */

@keyframes rise { from { opacity: 0; transform: translateY(12px); } }
```

40ms × 5, tail clamped: the whole sequence lands inside 500ms + the item duration. A
per-item delay that keeps climbing past the sixth row is how a list ends up taking two
seconds to become readable.

## 10 · Skeleton shimmer — paused when nobody is looking

```css
.skeleton {
  background: linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-surface-raised) 37%, var(--bg-surface) 63%);
  background-size: 400% 100%;
  animation: shimmer 1400ms linear infinite;
}
@keyframes shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
```
```js
const pause = new IntersectionObserver(entries => {
  for (const e of entries) e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
});
document.querySelectorAll('.skeleton').forEach(el => pause.observe(el));
```

An infinite animation with no off-screen guard burns frames and battery for pixels nobody
can see. `check-motion.js` enforces this as `motion-infinite-unpaused`.

## 11 · Tooltip — 500ms intent filter, 100ms fade

```js
let timer;
trigger.addEventListener('pointerenter', () => {
  timer = setTimeout(() => tip.dataset.open = 'true', 500); // filter the pass-through
});
trigger.addEventListener('pointerleave', () => {
  clearTimeout(timer);
  tip.dataset.open = 'false';                               // exits instantly
});
```

Never animate a tooltip's *position*. It appears where it belongs, or it does not appear.

## 12 · Copy-to-clipboard — the canonical acknowledgement

```js
async function copy(btn, text) {
  await navigator.clipboard.writeText(text);
  btn.dataset.state = 'copied';                 // swaps icon + label via CSS, 150ms
  setTimeout(() => { btn.dataset.state = ''; }, 1500);
}
```

## 13 · FLIP — the only honest way to animate a layout change

```js
function flip(elements, mutate) {
  const first = new Map([...elements].map(el => [el, el.getBoundingClientRect()]));
  mutate();                                              // reorder / filter / resize
  for (const el of elements) {
    const last = el.getBoundingClientRect();
    const f = first.get(el);
    const dx = f.left - last.left;
    const dy = f.top - last.top;
    if (!dx && !dy) continue;
    el.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
      { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
  }
}
```

Measure, mutate, invert with a transform, play. The layout happens once; the movement is
pure compositor.

## 14 · Framer Motion / `motion` — the same law, a different envelope

```jsx
const EASE = [0.16, 1, 0.3, 1];        // --ease-out, as an array

export const enter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: 4 },
  transition: { duration: 0.2, ease: EASE },        // --duration-base
};

// Springs are the exception, not the default. Apple's two-parameter model reads better
// than stiffness/damping — see physics.md.
export const springy = { type: 'spring', duration: 0.5, bounce: 0.2 };
```

```jsx
const reduce = useReducedMotion();
<motion.div {...enter} transition={reduce ? { duration: 0.1 } : enter.transition} />
```

A JS animation library does not exempt you from the compositor rule: animate `x`/`y`/
`scale`/`opacity`, not `width`/`top`/`boxShadow`.

## 15 · GSAP + ScrollTrigger — pinned sections without scroll-jacking

```js
const ctx = gsap.context(() => {
  gsap.to('.panel', {
    xPercent: -100 * (panels.length - 1),
    ease: 'none',                                   // scrubbed motion is linear by definition
    scrollTrigger: {
      trigger: '.rail',
      pin: true,
      scrub: 1,
      start: 'top top',                             // NOT 'top 80%' — the pin would jump
      end: () => '+=' + rail.offsetWidth,
      invalidateOnRefresh: true,
    },
  });
}, railRef);

return () => ctx.revert();   // the cleanup is not optional
```

`ease: 'none'` is correct here and only here: the scroll position *is* the timeline, so any
other curve fights the user's finger. Everywhere else, `linear` on spatial movement is a
`check-motion.js` finding.

## 16 · Reduced motion — the craft version

The blanket kill-switch is the floor:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The craft version keeps the *state communication* and removes only the *travel*:

```css
.reveal   { transform: translateY(calc(16px * var(--motion))); }
.sheet    { transform: translateX(calc(100% * var(--motion))); }
.toast-in { transform: translateY(calc(-12px * var(--motion))); }
/* opacity transitions survive; distances collapse to zero */
```

Reduce means fewer and gentler, not none. A user who asked for calm still needs to know
their save succeeded.

## Anti-patterns

- Copying a recipe and hard-coding `300ms` instead of `var(--duration-slow)` — the token
  layer stops being the single source of truth the moment one component opts out.
- `transition: all` "because it is shorter" — it silently animates every property a future
  edit adds, including layout ones.
- Reaching for GSAP/Framer for a hover state. CSS beats JS under load, and a 6KB dependency
  for a 150ms colour change is a budget decision made by accident.
- Springs everywhere. One config, system-wide, and never in fintech, health, or enterprise
  dashboards (`industries/`).
- Entrance animations that re-fire on every scroll pass, every hover, or every data refresh.
- Cleanup omitted in `useEffect` / `onMounted` — the tween outlives the component, holds a
  reference to a detached node, and stacks on the next mount.

## Checklist

- [ ] Every duration and easing in the recipe resolves to a token, not a literal
- [ ] Only `transform`/`opacity` animate (accordion `grid-template-rows` excepted)
- [ ] Entrances have honest origins; exits run at ~75% of the entrance duration
- [ ] Staggers capped at ≤6 steps and ≤500ms of total delay
- [ ] Infinite loops pause off-screen and on hidden tabs
- [ ] Every JS effect that starts motion returns a cleanup
- [ ] Reduced motion tested by emulation, not assumed from the media query's presence
- [ ] `node validators/check-motion.js <target>` is clean
