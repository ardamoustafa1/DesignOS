# Motion Stack — Vue

`motion/recipes.md` sets the law; this file is the Vue-idiomatic wiring for it —
`<Transition>` for enter/exit, `onMounted`/`onBeforeUnmount` for anything imperative.

## 1 · Enter/exit with `<Transition>`

```vue
<template>
  <Transition name="toast">
    <div v-if="open" class="toast">{{ message }}</div>
  </Transition>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
.toast-leave-active { transition-duration: var(--duration-fast); } /* exits faster */
</style>
```

Vue's transition classes ARE the token layer's enter/exit split made structural — there
is no separate JS timing to keep in sync, which is why `<Transition>` is preferred over
a manually toggled class for anything that is purely enter/exit.

## 2 · Scroll entrance — `IntersectionObserver` + `onMounted`/`onBeforeUnmount`

```vue
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';

const el = ref(null);
const isIn = ref(false);
let io;

onMounted(() => {
  io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { isIn.value = true; io.unobserve(el.value); }
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  io.observe(el.value);
});
onBeforeUnmount(() => io?.disconnect());
</script>

<template>
  <div ref="el" class="reveal" :class="{ 'is-in': isIn }"><slot /></div>
</template>
```

`onBeforeUnmount` is not optional — a component inside a `v-for` or route-guarded view
that never disconnects its observer leaks one per mount, exactly the
`motion-missing-cleanup` failure mode `validators/check-motion.js` flags in React/JSX
but cannot see across a `.vue` SFC's compiled output.

## 3 · GSAP + ScrollTrigger

```vue
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const rail = ref(null);
let ctx;
onMounted(() => {
  ctx = gsap.context(() => {
    gsap.to('.panel', {
      xPercent: -100 * (rail.value.children.length - 1),
      ease: 'none',
      scrollTrigger: { trigger: rail.value, pin: true, scrub: 1, start: 'top top' },
    });
  }, rail);
});
onBeforeUnmount(() => ctx?.revert());
</script>
```

## Anti-patterns specific to this stack

- Toggling a class with `:class` for something that could be a `<Transition>` — the
  manual path re-implements enter/exit timing that `<Transition>` already gives for free
  and is easy to get asymmetric (equal enter/exit duration, `motion-enter-exit-symmetry`).
- Creating the `IntersectionObserver`/`gsap.context` in `setup()` body instead of
  `onMounted` — the target ref is `null` until the component has actually mounted.

## Checklist

- [ ] Pure enter/exit uses `<Transition>` classes, not a manually toggled class
- [ ] `-leave-active` has its own, shorter duration than `-enter-active` (exit ~75% of entrance)
- [ ] Every `onMounted` that creates an observer/tween/GSAP context has a matching `onBeforeUnmount`
- [ ] `gsap.context`/`IntersectionObserver` are created only after the ref is mounted
- [ ] `node validators/check-motion.js <target>` is clean
