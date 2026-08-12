# Motion Stack — Svelte

`motion/recipes.md` sets the law; this file is the Svelte-idiomatic wiring for it —
built-in transitions for enter/exit, `onMount`'s cleanup return for anything imperative.

## 1 · Enter/exit with built-in transitions

```svelte
<script>
  import { fly, fade } from 'svelte/transition';
  export let open;
</script>

{#if open}
  <div class="toast"
       in:fly={{ y: 8, duration: 200, easing: t => 1 - Math.pow(1 - t, 3) }}
       out:fade={{ duration: 150 }}>
    <slot />
  </div>
{/if}
```

Svelte's `in:`/`out:` split is the enter/exit asymmetry law (`motion/principles.md`
duration law 3 — exits ~75% of the entrance) made syntactic: give `out:` its own,
shorter duration explicitly, the same way `<Transition>` classes do in Vue.

## 2 · Scroll entrance — `IntersectionObserver` + `onMount` cleanup

```svelte
<script>
  import { onMount } from 'svelte';
  let el;
  let isIn = false;

  onMount(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { isIn = true; io.unobserve(el); }
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();   // onMount's own return IS the cleanup, no onDestroy needed
  });
</script>

<div bind:this={el} class="reveal" class:is-in={isIn}><slot /></div>
```

Svelte's `onMount` returning a cleanup function directly (no separate `onDestroy` import
required for this shape) is a common place to forget the return — the observer then
survives every subsequent mount of a component reused inside an `{#each}` block.

## 3 · GSAP + ScrollTrigger

```svelte
<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);
  let rail;

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.to('.panel', {
        xPercent: -100 * (rail.children.length - 1),
        ease: 'none',
        scrollTrigger: { trigger: rail, pin: true, scrub: 1, start: 'top top' },
      });
    }, rail);
    return () => ctx.revert();
  });
</script>

<div bind:this={rail} class="rail"><slot /></div>
```

## Anti-patterns specific to this stack

- Using `in:`/`out:` with the same duration for both — that is the manual version of the
  `motion-enter-exit-symmetry` finding; set `out:` explicitly shorter.
- Forgetting `onMount`'s return value entirely (easy to do since it looks optional) — no
  compiler warning fires, only a slow leak across remounts.

## Checklist

- [ ] `out:` transitions are given an explicitly shorter duration than `in:` (exit ~75% of entrance)
- [ ] Every `onMount` that creates an observer/tween/GSAP context returns its cleanup
- [ ] Reused components inside `{#each}` don't leak an observer per mount
- [ ] `node validators/check-motion.js <target>` is clean
