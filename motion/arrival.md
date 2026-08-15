# Arrival — The First 1200ms

Every module in `motion/` covers what happens *after* the user acts: hover, press, scroll,
navigate. This one covers the only moment that happens on every visit and can never be
replayed — the page appearing.

It is the highest-leverage animation on a site and the one DesignOS pages most often skip,
because `motion/principles.md` says "default: it does not move" and `page-and-scroll.md`
explicitly excludes above-the-fold content from scroll reveals. Both are right, and the gap
between them is where a page arrives as a static screenshot: correct, instant, and inert.

An arrival is not a scroll reveal moved to the top. It is a **composed sequence with a beat
structure**, and it is not a signature moment — it does not consume the signature budget in
`brain/wow-calibration.md`. It is the baseline every page above rung 3 is expected to have.

---

## 1 · The beat structure

Four beats, ~900–1200ms total, and every element on the first viewport belongs to exactly one.

| Beat | Window | What moves | Why it's there |
|---|---|---|---|
| 0 · Ground | 0ms | page chrome, background, surfaces, **the LCP element** | the page is *already there*; nothing is animated in |
| 1 · Statement | 60–120ms | the headline | the eye's first landing point (`psychology/attention.md`) arrives first |
| 2 · Support | +80–140ms after beat 1 | lead paragraph, then the CTA row | the argument follows the claim |
| 3 · Context | +100–200ms after beat 2 | nav links, eyebrow, trust strip, hero visual's inner detail | frame settles last |

Two laws govern the whole sequence:

**The LCP element never animates from `opacity: 0`.** If the hero image or the headline is
your largest contentful paint, fading it in *delays LCP by exactly the animation duration* —
a self-inflicted Core Web Vitals failure that `checklists/performance.md` will catch.
Animate a **mask, a clip, or a child**, never the opacity of the LCP node itself.

**Beat 0 must be complete at first paint.** Surfaces, backgrounds, borders, and layout are
final before beat 1 starts. A page whose *containers* animate in reads as a loading screen.

```
0ms      ████ ground: full layout, full colour, zero movement
80ms     ▓▓ headline mask-rises
200ms    ▓ lead fades + rises 12px
300ms    ▓ CTA row, 40ms stagger across two buttons
420ms    ▓ nav + eyebrow + trust strip, 30ms stagger
900ms    ░ done. nothing moves again until the user does something.
```

---

## 2 · The reveal vocabulary (pick one per page, use it everywhere)

The generic `opacity 0 → 1, translateY(16px)` is the fade-up that makes every AI-built page
look like every other AI-built page. It is not banned — it is the *default you must beat*.
Choose one of these and apply it consistently; mixing three is worse than using the default.

| Reveal | Mechanism | Reads as | Best for |
|---|---|---|---|
| **Mask rise** | line wrapped in `overflow: hidden`, inner `translateY(100%) → 0` | typeset, editorial, deliberate | display headlines, always a strong choice |
| **Clip wipe** | `clip-path: inset(0 100% 0 0) → inset(0)` along the reading direction | drawn, precise, engineered | dev tools, fintech, rules and dividers |
| **Blur settle** | `filter: blur(8px) → 0` with `scale(1.02) → 1` | photographic, focus pulling | image-led, luxury, editorial covers |
| **Weight settle** | variable-font `wght` 300 → 700 over 500ms | typographic, unmistakably intentional | type-led brands; needs a variable font |
| **Fade-up** | opacity + `translateY(12–20px)` | neutral, safe | body copy, supporting content — the *fallback*, not the identity |

**Distances are small.** 100% inside a mask, or 12–20px outside one. Anything travelling
40px+ at the top of the page is a curtain call.

**Durations:** 500–700ms for the arrival (it plays once, so the frequency discount in
`motion/principles.md` licenses ceremony here), easing `cubic-bezier(0.16, 1, 0.3, 1)` or
the brand's `--ease-out`. Never `ease-in`. Never linear.

---

## 3 · One timeline, not fifteen delays

Hard-coded `animation-delay` per element is how arrivals drift out of sync the moment
copy changes. Drive the sequence from an index:

```css
[data-arrive] {
  --arrive-delay: calc(var(--i, 0) * 70ms);
  animation: arrive 620ms var(--ease-out) var(--arrive-delay) both;
}
@keyframes arrive { from { opacity: 0; transform: translateY(14px); } }

/* the beat offsets live in one place */
.hero h1     { --i: 1; }
.hero .lead  { --i: 2; }
.hero .ctas  { --i: 3; }
.site nav a  { --i: 4; }
```

Add or remove an element and the rhythm holds. This is also what makes the sequence
auditable — a reviewer reads five numbers, not fifteen delays.

---

## 4 · The three failure states the arrival must survive

An arrival that only works on a fast connection with JS enabled is a bug that ships as a
blank hero. All three of these are mandatory, and all three are cheap.

**Slow or failed JS.** If any element starts at `opacity: 0` in CSS and is revealed by JS,
a JS failure leaves the page blank. Either drive the arrival in **pure CSS animation**
(which runs regardless), or gate the hidden state behind a class that JS adds first:

```html
<html class="no-js">   <!-- swapped to .js by an inline script in <head> -->
```
```css
.js [data-arrive] { opacity: 0; }   /* only hide when we know we can un-hide */
```

**Reduced motion.** `prefers-reduced-motion: reduce` collapses distance and blur to zero.
The content is fully visible; only the transform is removed — never the element.

```css
@media (prefers-reduced-motion: reduce) {
  [data-arrive] { animation: none; opacity: 1; transform: none; filter: none; }
}
```

**The repeat visitor.** The arrival is charming once and friction on the fourth navigation.
Within a session, suppress it after the first play (`sessionStorage` flag set at beat 3),
or scope it to landing surfaces only and never to app routes, settings, or checkout.

Cross-document View Transitions (`motion/page-and-scroll.md`) replace the arrival on
internal navigations — an arrival on top of a page transition is two animations arguing.

---

## 5 · Budget

| Line | Ceiling |
|---|---|
| Total sequence, first beat to last | ≤ 1200ms |
| Any single element's animation | ≤ 700ms |
| JS required for the arrival | 0 KB (CSS animation) or ≤ 1 KB for the `.js` class swap |
| LCP delay attributable to arrival | **0ms** |
| CLS from the arrival | 0 — reserve final layout at beat 0 |
| Properties animated | `transform`, `opacity`, `clip-path`, `filter`, registered custom properties only |

If a sequence exceeds 1200ms, cut a beat — do not compress the durations. A rushed
four-beat arrival reads worse than a calm three-beat one.

---

## Anti-patterns

- **Fading in the LCP element.** The single most common "premium" arrival, and a measurable
  Core Web Vitals regression every time.
- **Animating containers.** Cards, sections, and the nav bar sliding in turns arrival into
  page construction. Ground is still; content arrives.
- **Everything at once with the same delay** — that is a page-level fade, not choreography,
  and it reads as a slow-loading site rather than an intentional one.
- **Fifteen hard-coded delays** that silently break when a line of copy is added.
- **JS-gated hidden states with no `no-js` guard** — the blank-hero bug.
- **Arrival on app surfaces.** Dashboards, settings, checkout, and error states show content
  immediately. Ceremony belongs where the visitor is deciding, never where they are working.
- **Re-running on every route change** in an SPA, so the app feels like it reloads.
- **Mixing three reveal vocabularies** on one page — the arrival stops reading as a system.
- **Arrival as the substitute for a signature.** It is the baseline; it does not make a page
  memorable on its own (`brain/wow-calibration.md`).

## Checklist

- [ ] Beat 0 is complete at first paint — layout, surfaces, and colour do not animate
- [ ] The LCP element is not opacity-animated; any reveal on it is mask/clip-based
- [ ] Exactly one reveal vocabulary is used, and it is named in the rationale
- [ ] The sequence is index-driven (`--i`), not a list of hard-coded delays
- [ ] Total sequence ≤ 1200ms, single element ≤ 700ms
- [ ] `no-js` guard present, or the arrival is pure CSS
- [ ] `prefers-reduced-motion` collapses movement without hiding content
- [ ] Repeat visits and internal navigations do not replay the arrival
- [ ] No arrival on app, settings, checkout, or error surfaces
- [ ] `node validators/check-motion.js <target>` is clean
