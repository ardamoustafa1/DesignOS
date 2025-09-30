# Motion Performance & Reduced Motion

Beautiful at 60fps or not at all. A dropped-frame animation communicates "cheap" more
loudly than no animation ever could. And for a meaningful share of users, motion is not
delight — it's nausea, distraction, or an accessibility barrier.

## The compositor rule

Animate ONLY properties the compositor can handle without layout/paint:

```
✓ transform (translate / scale / rotate)
✓ opacity
✓ filter (cheap ones: blur is EXPENSIVE — small areas only)
✗ width, height, top, left, margin, padding   → layout storm
✗ box-shadow directly                          → paint storm (crossfade a pseudo-element instead)
✗ background-position on large areas
```

Recipes for the "impossible" cases:
- **Accordion/height:** `grid-template-rows: 0fr→1fr` (+ inner `min-height: 0`) or FLIP; not `height: auto` tweens.
- **Shadow hover:** two layered shadows via `::after` opacity crossfade.
- **Underline grow:** `transform: scaleX` on a pseudo-element, `transform-origin` set.
- **Layout moves (reorder, shared-element):** FLIP — measure, invert with transform, play.

## Budget & hygiene
- `will-change`: apply just-before animating, remove after; a page with 30 `will-change` layers ate its own GPU memory.
- Concurrent animations: ≤3 simultaneous moving elements (attention *and* frames).
- Infinite animations (shimmer, marquee): pause when off-viewport (`IntersectionObserver`) and when tab hidden.
- JS animation only for interruptible/physics needs (use WAAPI/springs); scroll handlers never do style reads+writes (use `animation-timeline`/IO; if JS is unavoidable: rAF + passive listeners).
- Test on a 4× CPU throttle. Marketing pages die on mid-range Android, not on your Mac.

## Metrics coupling (`checklists/performance.md`)
- **INP < 200ms:** interaction feedback must not wait for a long task — feedback first, work after (or in a worker).
- **CLS < 0.1:** entrance animations must not shift neighbors — animate transforms, reserve space; skeleton→content at matched dimensions.
- **LCP:** hero entrance must not delay the LCP element (don't opacity-0 the hero image waiting for JS — animate *in CSS* from visible-enough, or mark the text visible immediately).

## prefers-reduced-motion (binding, tested, every deliverable)

Who: vestibular disorders, migraine/seizure sensitivity, ADHD, motion-sick users, and
people who just chose calm. Respecting it is a WCAG expectation and a DesignOS instant-fail if missed.

### The policy
Reduce ≠ remove all feedback. Keep *state communication*, remove *movement*:

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
The blanket kill-switch is the *floor*. The craft version — token-level:

```css
:root { --motion: 1; }
@media (prefers-reduced-motion: reduce) { :root { --motion: 0; } }
/* translate distances multiply by var(--motion); opacities stay */
```

### Per-pattern reductions
| Full motion | Reduced |
|---|---|
| Slide/scale entrances | opacity fade ≤150ms or instant |
| Parallax, scroll-scrub | static composition |
| Autoplaying video/carousel | poster frame + play button |
| Count-up numbers | final value immediately |
| Skeleton shimmer | static skeleton |
| Success confetti/springs | static checkmark |
| Smooth scroll | instant jump (focus still moves) |

### Verify
DevTools → Rendering → emulate reduced motion; then keyboard-walk the whole page: everything
must remain functional, comprehensible, and CLS-clean.

## Vestibular red flags (avoid even for full-motion users)
- Large-area zoom/scale movements; rotation of big surfaces; parallax with >15% offsets; anything oscillating >3 cycles; full-viewport translation on scroll. If it moves the *world*, it moves stomachs.

## Anti-patterns
- Animating layout properties, then "fixing" with `will-change` everywhere
- Shimmer/marquee running in hidden tabs (battery arson)
- Entrance JS that holds content hostage (blank page until bundle parses)
- Reduced-motion "supported" by killing the loading indicators users need
- 60fps on M-series Mac, slideshow on Moto G — untested is unshipped

## Checklist
- [ ] Only transform/opacity animated (audited)
- [ ] Accordions/shadows/moves via recipes; FLIP for layout
- [ ] ≤3 concurrent; infinite loops pause off-screen/off-tab
- [ ] INP/CLS/LCP unharmed by any animation
- [ ] Reduced-motion: implemented, per-pattern sensible, actually tested
- [ ] 4× CPU throttle test passed
