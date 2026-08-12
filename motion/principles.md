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
4. **Frequency discount:** the more often an animation plays, the shorter it must be. Daily-use app transitions trend toward 0; marketing moments can afford ceremony. As a hard gate, not a vibe:

| Trigger frequency | License |
|---|---|
| 100+ times/day (⌘K toggle, keyboard nav, list scrubbing) | No animation. Instant. Every millisecond is paid back a hundred times. |
| Tens of times/day (hover states, row nav, tab switches) | Strip to the minimum — a single property, ≤120ms, or nothing |
| Occasional (modal open, drawer, toast, settings save) | Standard token-layer animation applies in full |
| Rare / once-per-visit (onboarding step, empty-state illustration, milestone) | Delight budget — this is where a spring or a signature moment is earned |

"It looks nice" does not survive contact with frequency. A command palette animated at
250ms feels premium in a demo and becomes 250ms of friction by the tenth open that hour.

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

## Interruptibility

`physics.md` covers this for gestures under a finger; the same law applies to any element a
user can re-trigger faster than its own animation finishes — a toast that can be dismissed
mid-slide, a dropdown re-opened before its close finishes, a tooltip that follows a fast
mouse across three targets in one second.

**CSS transitions retarget from wherever the element currently is. `@keyframes` restarts
from its `0%` state.** This is the entire reason to default to `transition` for anything
state-driven (open/closed, hover, selected) and reserve `@keyframes` for motion that has no
mid-flight state to interrupt (a spinner, a shimmer, a one-shot celebration).

```css
/* Correct: re-triggering .open/.closed mid-transition retargets smoothly from the
   current computed value — no jump, no restart. */
.toast { transform: translateY(120%); transition: transform var(--duration-base) var(--ease-out); }
.toast.open { transform: translateY(0); }

/* Wrong for anything re-triggerable: a keyframe restarts at 0% even if the element
   was already 80% of the way through the previous run — the reversal jumps. */
@keyframes slide-in { from { transform: translateY(120%); } to { transform: translateY(0); } }
```

A component that fails this in practice: open it, then close it, then open it again fast.
If it stutters, jumps, or briefly shows the wrong state, it is not interruptible — fix the
mechanism (transition, not keyframes) rather than adding a debounce that just hides the seam.

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
