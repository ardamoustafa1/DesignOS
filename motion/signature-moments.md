# Signature Moments — The Wow Layer

`recipes.md` makes motion **correct**. This file makes one moment per page **unforgettable**.

The distinction matters because they are different failure modes. A page can pass every
rule in `check-motion.js`, ship at 60fps, respect reduced motion, and still be forgotten
before the tab closes. Correctness is the floor you must not fall through; a signature is
the one thing a visitor describes to someone else afterwards.

`components/visual-effects.md` covers the *static* wow layer (glow, grain, mesh, beams).
This is the **interactive** one — the moments that only exist because a human moved.

---

## The scarcity law

**Two signature moments per page. Maximum. Usually one.**

This is the whole discipline. Every technique below is individually impressive and
collectively fatal: a page with magnetic buttons *and* tilt cards *and* scramble text *and*
a noise canvas is not five times as memorable, it is noise with a loading penalty. When
everything is remarkable, nothing is.

The budget:

| Page motion budget | What it buys |
|---|---|
| 1 hero-scale signature | the thing they remember (scroll story, split reveal, canvas field) |
| 1 interaction-scale signature | the thing they *play* with (magnetic CTA, tilt card, spotlight) |
| everything else | `recipes.md` — correct, fast, invisible |

Gate every candidate against `MOTION_INTENSITY` (`brain/brief-compiler.md`):

- **≤ 5** — nothing on this page is licensed. Close the file.
- **6–8** — one signature, chosen from the interaction-scale tier.
- **9–10** — two, at most one of them hero-scale, and `brain/wow-calibration.md` must have
  recorded *why* in the derivation chain.

A signature that cannot answer "which product truth does this express?" is decoration.
Decoration is the thing `brain/originality.md` calls a costume.

---

## Universal contract

Every technique in this file obeys these or it does not ship:

```css
:root { --motion: 1; }
@media (prefers-reduced-motion: reduce) { :root { --motion: 0; } }
```

1. **Pointer-driven effects require a pointer.** Wrap every one in
   `@media (hover: hover) and (pointer: fine)`. On touch they are dead weight — a magnetic
   button that never magnetises is 40 lines of JS shipped to a phone for nothing.
2. **Reduced motion removes the movement, never the content.** Scramble text resolves
   instantly. Split reveals become a single fade. Canvas fields render one static frame.
3. **The content exists without the effect.** Split text carries `aria-label`; scramble
   starts from the real string; scroll stories work as a plain scrolled document.
4. **Compositor only.** `transform`, `opacity`, and CSS custom properties feeding a
   `background` — nothing that triggers layout.
5. **Every listener and every rAF loop has a cleanup.** `check-motion.js` enforces this as
   `motion-missing-cleanup`.
6. **Lazy by viewport.** Nothing initialises above a `IntersectionObserver` gate it does
   not need; nothing keeps running off-screen or in a hidden tab.

---

## 1 · Magnetic button — interaction-scale

The Awwwards signature. The control leans toward the cursor inside an invisible field and
springs back when it leaves. It works because it implies the button *wants* to be pressed.

**Earned when:** there is exactly one primary CTA and the brand is confident/creative.
Never on a form with several equal actions — magnetism on three buttons reads as a bug.

```js
const STRENGTH = 0.35;   // 0.25–0.4 reads magnetic; past 0.5 it detaches from its label
const RADIUS   = 120;    // px of field around the control

function magnetic(el) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  let raf = 0;
  let tx = 0, ty = 0, cx = 0, cy = 0;

  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    const pull = Math.max(0, 1 - dist / RADIUS);     // linear falloff to the field edge
    tx = dx * STRENGTH * pull;
    ty = dy * STRENGTH * pull;
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); };

  // critically-damped-ish follow: no overshoot, no lag the hand can feel
  function tick() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
    raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(tick) : 0;
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave);
  return () => {
    window.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    cancelAnimationFrame(raf);
    el.style.transform = '';
  };
}
```

**Cost:** one rAF while in range, one composited layer. Negligible.
**Failure mode:** listening on `window` for a page full of magnets. Use one delegated
listener, or gate on `pointerenter` of a wrapper with `RADIUS` padding.
**A11y:** focus must produce the same emphasis by another means — magnetism is invisible to
a keyboard.

---

## 2 · Text scramble — interaction-scale

Characters resolve out of noise into the real string. Terminal lineage, but at the right
speed it reads as *decryption*, not as a gimmick.

**Earned when:** the product is about data, security, inference, or transformation — the
effect is literally a metaphor for the product doing its job. Cybersecurity, AI, dev tools.
**Never** on a headline a user must read quickly, and never on more than one string.

```js
const CHARS = '▓▒░<>/\\[]{}=+*^?#________';

function scramble(el, finalText, { duration = 900, stagger = 28 } = {}) {
  el.setAttribute('aria-label', finalText);   // the real string is always in the a11y tree
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = finalText; return () => {}; }

  const start = performance.now();
  let raf = 0;
  const tick = (now) => {
    const t = now - start;
    let out = '';
    let done = true;
    for (let i = 0; i < finalText.length; i++) {
      const settleAt = i * stagger + duration * 0.35;
      if (t >= settleAt || finalText[i] === ' ') out += finalText[i];
      else { out += CHARS[(Math.random() * CHARS.length) | 0]; done = false; }
    }
    el.textContent = out;
    raf = done ? 0 : requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
```

**Cost:** one rAF for under a second, text-node writes only. Set `font-variant-numeric:
tabular-nums` and a fixed `min-width`/`ch` on the element or the line reflows every frame —
that is the CLS this effect is famous for.
**Failure mode:** scrambling on every scroll pass. Fire once, then `unobserve`.

---

## 3 · Cursor spotlight — interaction-scale

A radial light follows the pointer across a surface, revealing a border or lifting a
gradient. The grown-up replacement for glassmorphism: the same premium read, a tenth of the
cost, and it responds to a human instead of just sitting there.

**Earned when:** there is a grid of cards competing for attention and you want the one
under the cursor to feel *selected* without a heavy hover state. Excellent on pricing tiers
and feature grids.

```css
.spot {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
}
.spot::before {
  content: "";
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(
    240px circle at var(--mx, 50%) var(--my, 50%),
    rgb(from var(--accent) r g b / 0.16), transparent 70%);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out);
}
.spot:hover::before { opacity: 1; }

@media (prefers-reduced-motion: reduce) { .spot::before { transition: none; } }
```

```js
function spotlight(grid) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const onMove = (e) => {
    const card = e.target.closest('.spot');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  grid.addEventListener('pointermove', onMove, { passive: true });
  return () => grid.removeEventListener('pointermove', onMove);
}
```

**Cost:** a repaint of the pseudo-element per move. Cheap at card size, expensive at
full-viewport — cap the surface, not the gradient.
**Failure mode:** one listener per card. Delegate from the grid, as above.

---

## 4 · 3D tilt — interaction-scale

The card rotates a few degrees toward the cursor. Depth without a shadow stack.

**Earned when:** the card contains something worth inspecting — a product shot, a real UI
screenshot, an artefact. Tilting a text card is theatre.

```css
.tilt-scene { perspective: 900px; }
.tilt {
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transform-style: preserve-3d;
  transition: transform var(--duration-base) var(--ease-out);
  will-change: transform;                 /* only while armed — remove on leave */
}
.tilt:hover { transition: none; }         /* follow the pointer 1:1 while hovering */
```

```js
const MAX_DEG = 6;   // past ~8° the text edges alias and it reads as a toy

function tilt(el) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${(px * MAX_DEG * 2).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-py * MAX_DEG * 2).toFixed(2)}deg`);
  };
  const onLeave = () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave);
  return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); };
}
```

**Cost:** composited transform, free. `preserve-3d` promotes a layer — do not apply it to
fifty cards.
**Failure mode:** tilting the whole card *including* its text. Put the text on a
`translateZ(30px)` child so it rises with the tilt instead of shearing.

---

## 5 · Split-text reveal — hero-scale

The headline arrives word by word (or line by line). The Linear/Vercel launch signature.
Done at the right stagger it reads as *composition*; done wrong it reads as a loading bar.

**Earned when:** the headline is the argument. If the hero's job is the product shot, the
headline should just be there.

```css
.split { display: inline-block; overflow: hidden; vertical-align: bottom; }
.split > span {
  display: inline-block;
  transform: translateY(calc(100% * var(--motion)));
  opacity: 0;
  animation: split-in var(--duration-slower) var(--ease-out) forwards;
}
@keyframes split-in { to { transform: translateY(0); opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .split > span { animation: none; opacity: 1; transform: none; }
}
```

```js
function splitWords(el) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);      // one readable string for AT…
  el.textContent = '';
  text.split(/\s+/).forEach((word, i) => {
    const outer = document.createElement('span');
    outer.className = 'split';
    outer.setAttribute('aria-hidden', 'true');   // …and the shards are hidden from it
    const inner = document.createElement('span');
    inner.textContent = word;
    inner.style.animationDelay = `${Math.min(i * 60, 420)}ms`;  // capped, per principles.md
    outer.append(inner);
    el.append(outer, document.createTextNode(' '));
  });
}
```

**Word stagger 50–70ms, capped at ~420ms total.** Per-character staggering is almost always
wrong on a headline: at 12 words it takes two seconds to become readable, and the LCP
element is text.
**Cost:** one layout at split time. Do it before paint, or reserve the height.
**Failure mode:** splitting the LCP heading and animating from `opacity: 0` — you have just
delayed your own Largest Contentful Paint. Animate from `opacity: 0.001` with the text
already laid out, or split only sub-headings.

---

## 6 · Scroll-driven storytelling — hero-scale

One section pins while its content advances through states. Apple's product pages, Stripe
Sessions. The most expensive signature in this file and the most memorable.

**Earned when:** there is a genuine sequence — a process with steps, a before/after, a
transformation. A pinned section that just fades three unrelated cards is a scroll tax.

Prefer the CSS scroll-driven animations path where support allows: it runs off the main
thread entirely.

```css
@supports (animation-timeline: view()) {
  .scene-layer {
    animation: scene-advance linear both;
    animation-timeline: view();
    animation-range: entry 20% cover 60%;
  }
  @keyframes scene-advance {
    from { opacity: 0; transform: translateY(calc(24px * var(--motion))); }
    to   { opacity: 1; transform: none; }
  }
}
```

`ease: linear` is correct here and only here: the scroll position *is* the timeline, so any
other curve fights the user's finger. Everywhere else it is a `motion-linear-spatial`
finding.

The JS fallback stays declarative — a progress custom property, never a style write per
frame:

```js
function scene(section) {
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const r = section.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      section.style.setProperty('--progress', p.toFixed(4));
      raf = 0;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });   // passive is mandatory
  onScroll();
  return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
}
```

**Never `preventDefault` on `wheel`.** That is scroll-jacking, it is banned outright
(`page-and-scroll.md`), and `check-motion.js` fails the build on it.
**Reduced motion:** the pin is removed and the scenes become a normal stacked document.
Pinning is exactly the vestibular red flag `performance.md` names.

---

## 7 · Odometer number morph — interaction-scale

Digits roll like a mechanical counter instead of counting up in place. The difference
between "a number changed" and "a number *moved*".

**Earned when:** the number *is* the product — pricing, savings, throughput, a live metric
that the page is arguing about.

```css
.odo { display: inline-flex; font-variant-numeric: tabular-nums; overflow: hidden; }
.odo-col { display: block; height: 1em; overflow: hidden; }
.odo-col > span {
  display: block; height: 1em; line-height: 1;
  transform: translateY(calc(var(--d, 0) * -1em * var(--motion)));
  transition: transform var(--duration-slower) var(--ease-out);
}
```

```js
function odometer(root, value) {
  root.setAttribute('aria-label', String(value));
  const digits = String(value).split('');
  root.replaceChildren(...digits.map((d, i) => {
    const col = document.createElement('span');
    col.className = 'odo-col';
    col.setAttribute('aria-hidden', 'true');
    const strip = document.createElement('span');
    strip.textContent = '0123456789'.split('').join('\n');
    strip.style.whiteSpace = 'pre';
    col.append(strip);
    // stagger the columns so the number settles left-to-right, not as a block
    requestAnimationFrame(() => setTimeout(() => strip.style.setProperty('--d', d), i * 60));
    return col;
  }));
}
```

**`tabular-nums` is not optional** — proportional digits change the element width as they
roll, and the layout jitters.
**Failure mode:** running it on a live-updating metric. A number that rolls every two
seconds is a casino. Roll once on reveal; after that, crossfade
(`micro-interactions.md`).

---

## 8 · Cursor parallax layers — hero-scale

Two or three hero layers translate at different rates against pointer movement. Depth from
nothing but maths.

**Earned when:** the hero is composed of separable art — a product shot over a field, a
foreground device over a background grid.

```js
const DEPTHS = [0.012, 0.028, 0.05];   // back → front; keep the spread under ~0.06

function parallax(scene, layers) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  let raf = 0, mx = 0, my = 0;
  const onMove = (e) => {
    const r = scene.getBoundingClientRect();
    mx = e.clientX - (r.left + r.width / 2);
    my = e.clientY - (r.top + r.height / 2);
    if (!raf) raf = requestAnimationFrame(apply);
  };
  function apply() {
    layers.forEach((l, i) => {
      const d = DEPTHS[i] ?? 0.02;
      l.style.transform = `translate3d(${(mx * d).toFixed(2)}px, ${(my * d).toFixed(2)}px, 0)`;
    });
    raf = 0;
  }
  scene.addEventListener('pointermove', onMove, { passive: true });
  return () => { scene.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
}
```

**Max offset ~15% of the layer's size** (`performance.md` vestibular limit), never on body
text, never tied to *scroll* on mobile.
**Failure mode:** parallaxing the headline. Text that drifts under the cursor is unreadable
and nauseating.

---

## 9 · Noise canvas field — hero-scale

An organic, slowly-drifting field rendered in a 2D canvas. WebGL-grade atmosphere without
a WebGL dependency, a shader compile, or a 600KB bundle.

**Earned when:** the brand needs *atmosphere* and the alternative is a stock gradient. Best
on dark themes (`visual-effects.md`: light effects read as craft on dark, smudge on white).

```js
function noiseField(canvas, { accent = [16, 185, 129], scale = 0.006, speed = 0.00012 } = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0, running = true, w = 0, h = 0, img = null;

  // value noise: hash-based, no dependency, plenty organic at this scale
  const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), u),
                lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v);
  };

  function resize() {
    // render at half resolution and let the browser upscale — the field is soft anyway
    w = canvas.width = Math.ceil(canvas.clientWidth / 2);
    h = canvas.height = Math.ceil(canvas.clientHeight / 2);
    img = ctx.createImageData(w, h);
  }

  function draw(t) {
    const d = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = noise(x * scale * 8 + t * speed, y * scale * 8);
        const i = (y * w + x) * 4;
        d[i] = accent[0]; d[i + 1] = accent[1]; d[i + 2] = accent[2];
        d[i + 3] = Math.max(0, (n - 0.55)) * 150;    // sparse: most of the field is empty
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  const loop = (t) => { if (!running) return; draw(t); raf = requestAnimationFrame(loop); };
  resize();
  if (reduce) draw(0); else raf = requestAnimationFrame(loop);

  // stop paying for pixels nobody is looking at
  const io = new IntersectionObserver(([e]) => {
    running = e.isIntersecting && !reduce;
    if (running && !raf) raf = requestAnimationFrame(loop); else if (!running) cancelAnimationFrame(raf), raf = 0;
  });
  io.observe(canvas);
  const onVis = () => { if (document.hidden) { running = false; cancelAnimationFrame(raf); raf = 0; } };
  document.addEventListener('visibilitychange', onVis);
  addEventListener('resize', resize, { passive: true });

  return () => {
    running = false; cancelAnimationFrame(raf); io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    removeEventListener('resize', resize);
  };
}
```

**Cost:** the honest one in this file. Half-resolution, a sparse alpha field, and both an
`IntersectionObserver` and a `visibilitychange` guard are all load-bearing — remove any of
them and this becomes the reason a laptop fan spins up. Measure it on a 4× CPU throttle
before shipping; if it cannot hold 60fps there, drop to a static single frame.
**Reduced motion:** one frame, no loop. The atmosphere survives; the drift does not.

---

## 10 · Liquid morph — interaction-scale

A shape flows into another shape: a button becoming a panel, a blob settling behind a
feature. Continuity made literal.

**Earned when:** two states are genuinely the *same object*. A morph between unrelated
elements is a magic trick that raises the question "where did my button go?".

The cheapest correct version is `clip-path`, which interpolates natively when both shapes
have the same vertex count:

```css
.morph {
  clip-path: polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%);
  transition: clip-path var(--duration-slow) var(--ease-out);
}
.morph[data-open="true"] { clip-path: polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%); }
```

For a true shared-element morph across a navigation, use the platform:

```css
@supports (view-transition-name: none) {
  .card-hero { view-transition-name: feature-hero; }   /* the SAME name on both pages */
  ::view-transition-group(feature-hero) { animation-duration: var(--duration-slow); }
}
```

```js
if (document.startViewTransition) document.startViewTransition(() => render(nextState));
else render(nextState);
```

**Morph the element the user clicked** — that is the thread of continuity. Everything else
crossfades.
**Failure mode:** `clip-path` polygons with mismatched vertex counts do not interpolate;
they cut. Pad the simpler shape with duplicate vertices.

---

## Choosing one

| The product's truth | The signature that expresses it |
|---|---|
| It transforms messy input into clean output | text scramble · liquid morph |
| It is fast | magnetic CTA · split reveal at the short end of the stagger |
| It has depth / many layers | cursor parallax · 3D tilt on a real screenshot |
| It is a process with steps | scroll-driven storytelling |
| It is a number that matters | odometer |
| It is atmosphere, craft, a place | noise canvas |
| It is a set of options to compare | cursor spotlight across the grid |

If two rows fit, the brief is not compiled yet — go back to `brain/brief-compiler.md` and
name the one behaviour the surface must cause.

---

## Anti-patterns

- **Stacking signatures.** Three of these on one page is the single most common way a
  "premium" redesign becomes a portfolio-of-effects with no hierarchy.
- **Effects on touch.** Anything cursor-driven that ships unguarded to a phone is dead JS,
  dead bytes, and a dead first impression on the majority of traffic.
- **Animating the LCP element from zero opacity.** The split reveal and the scramble both
  do this by default. Fix it or lose the Core Web Vital.
- **Scroll-jacking to buy a scroll story.** `preventDefault` on `wheel` fails the gate and
  fails the user.
- **Perpetual motion at rest.** A noise field that never stops, a blob that always breathes:
  rest state means REST (`principles.md`).
- **Signature without derivation.** If `memory/design.md` cannot say which product fact
  produced this moment, it is a costume borrowed from a site you liked.
- **Skipping the throttle test.** These are the only techniques in DesignOS where the
  4× CPU-throttle pass is not advisory. Untested is unshipped.

---

## Checklist

- [ ] `MOTION_INTENSITY` is 6+ and recorded; the page carries at most two signatures
- [ ] Each signature names the product truth it expresses in `memory/design.md`
- [ ] Every pointer-driven effect is behind `(hover: hover) and (pointer: fine)`
- [ ] Reduced motion resolves content instantly and removes pins, drifts, and loops
- [ ] The LCP element is not gated on any effect
- [ ] Split/scramble text carries `aria-label`; shards are `aria-hidden`
- [ ] Numbers use `tabular-nums`; scrambles have a reserved width
- [ ] Every listener, rAF, and observer returns a cleanup
- [ ] Canvas and infinite fields pause off-screen and on hidden tabs
- [ ] Measured at 4× CPU throttle, still 60fps — or downgraded to a static frame
- [ ] `node validators/check-motion.js <target>` is clean
