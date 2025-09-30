# Motion Principles

Motion is hierarchy in time. It exists to communicate three things — **causality**
(you did this, that happened), **continuity** (where things came from and went), and
**character** (how the brand feels). Anything else moving is noise.

## The system

Define once, use everywhere. Motion tokens are as binding as color tokens:

```css
:root {
  --duration-instant: 100ms;   /* hovers on small elements, toggles */
  --duration-fast:    150ms;   /* buttons, inputs, most micro-interactions */
  --duration-base:    200ms;   /* dropdowns, tooltips, small reveals */
  --duration-slow:    300ms;   /* modals, drawers, page-level shifts */
  --duration-slower:  500ms;   /* hero entrances, signature moments only */

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);     /* DEFAULT — entrances, responses */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);    /* moves within view */
  --ease-in:     cubic-bezier(0.7, 0, 0.84, 0);     /* exits only, use sparingly */
}
```

## Duration laws
1. **Smaller = faster.** A checkbox (100ms) vs. a modal (250ms) vs. a page transition (300ms). Duration scales with distance traveled and area changed.
2. **Nothing interactive over 300ms.** Past 300ms, feedback becomes latency. 400ms+ is reserved for once-per-visit signature moments.
3. **Exits faster than entrances** (~75% of the entrance duration). Users asked it to leave; don't make them watch it go.
4. **Frequency discount:** the more often an animation plays, the shorter it must be. Daily-use app transitions trend toward 0; marketing moments can afford ceremony.

## Easing laws
- **Ease-out is the default.** Fast start = instant response feel; gentle landing = polish.
- **Never linear** for spatial movement (only for opacity-only fades and marquees).
- **Never ease-in for entrances** (feels laggy — the element hesitates before obeying).
- **Springs** (small overshoot) express playfulness — allowed in consumer/gaming/creative sectors, banned in fintech/health/enterprise dashboards (`industries/`). One spring config system-wide if used.

## Choreography
- **Stagger** related items 30–60ms apart, cap ~5–6 items (beyond that, animate as one group). Total sequence ≤500ms.
- **One thing at a time:** simultaneous unrelated animations compete (`psychology/attention.md` — motion is the heaviest attention lever). Sequence: outgoing → incoming.
- **Origin honesty:** things enter from where they conceptually live (dropdown from its trigger, drawer from its edge, modal from center-scale or slight-below). Never from random directions.
- **Continuity over teleportation:** when an element persists across states (card → detail), move it; when it doesn't, crossfade. FLIP technique for layout moves.

## What animates (whitelist)
```
State changes    hover, press, selection, toggle, validation
Spatial reveals  dropdowns, modals, drawers, accordions, tooltips
Feedback         progress, loading, success/error moments
Data changes     value transitions, chart updates, live highlights
Orientation      page transitions, scroll-position cues
ONE signature    per page — the branded moment (hero entrance, demo, etc.)
```
Default for everything else: **it does not move.** Decoration-in-motion (floating blobs,
perpetual gradient swirls, bouncing icons) fails review unless the sector file explicitly
licenses it — and even then, one, subtle, GPU-cheap, pausable.

## Character presets (pick per brand, record in memory/design.md)
| Brand feel | Duration bias | Easing | Extras |
|---|---|---|---|
| Precise/technical (Linear-class) | fast end of tokens | strict ease-out | zero springs, tight staggers |
| Confident/premium (Stripe/Apple) | base | soft ease-out, longer signature | large-scale slow hero moves |
| Friendly/consumer | base | gentle spring (1 config) | playful success moments |
| Calm/health/edu | slow end, fewer animations | ease-in-out | opacity-led, minimal translation |

## Accessibility & performance (binding — details in performance.md)
- `prefers-reduced-motion: reduce` → all movement collapses to opacity ≤150ms or none. Non-negotiable.
- Animate only `transform` and `opacity` (compositor). `height/top/margin` animations budget-approved only for accordions (or use grid-template-rows trick).

## Checklist
- [ ] All durations/easings from tokens; no inline magic values
- [ ] Interactive feedback ≤150ms start; nothing interactive >300ms
- [ ] Exits < entrances; staggers ≤60ms × ≤6 items
- [ ] Origins honest; one signature moment max
- [ ] Character preset chosen and consistent
- [ ] Whitelist obeyed — nothing decorative moving without license
