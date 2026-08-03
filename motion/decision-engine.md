# Motion Decision Engine

## The semantic contract

`MOTION_INTENSITY` controls the page-wide ceiling. `runtime/motion/semantics.js` then
compiles each interaction from nine explicit inputs:

1. **Component type** — button, popover, accordion, dialog, drawer, toast, sortable,
   carousel, page, value, progress, or generic.
2. **State transition** — hover, press, select, open/close, enter/exit,
   expand/collapse, reorder, drag, dismiss, update, or navigate.
3. **Frequency** — continuous, very-high, high, medium, low, or rare.
4. **Input modality** — keyboard, pointer, touch, voice, or programmatic.
5. **Element geometry** — width, height, travel distance, viewport coverage, anchor,
   and attached edge.
6. **Motion intensity** — the project-wide 1–10 ceiling.
7. **User preference** — full, reduce, or none.
8. **Device power** — low, medium, or high.
9. **Semantic importance** — decorative, low, normal, high, or critical.

Run:

```bash
designos motion-decide "account menu" \
  --component popover --transition open --frequency high \
  --modality keyboard --geometry 280x180,8 --motion 4 \
  --preference full --device-power medium --importance high
```

## Compiler output

The result is a machine-readable decision containing:

- animate or do-not-animate;
- entry and 75%-duration exit timing after frequency/geometry/device discounts;
- curve or cancellable spring;
- transform origin and the geometry reason;
- exactly reversed enter/exit paths plus a symmetry result;
- computed-state replacement or pointer-tracking/velocity-handoff interruption;
- a functionally equivalent reduced-motion contract;
- separate keyboard, pointer, and touch decisions;
- compositor, concurrency, main-thread, frame-time, CPU-throttle, and layout budgets;
- module, rule, and executable recipe provenance;
- an explanation chain and verification plan.

Decorative motion below intensity 6 and low-importance motion on low-power devices can
legitimately compile to `do-not-animate`. Very frequent keyboard paths change semantic and
visual state immediately with no animation; repeated expert input must never queue ceremony.
Direct manipulation remains 1:1 while input is down; only the release settles.

## Anti-patterns

- Animating a command-palette or keyboard shortcut entrance that runs dozens of times daily.
- Calling decorative motion “feedback” when the state remains equally clear without it.
- Using a spring for direct manipulation while the pointer is still down.
- Accepting layout or main-thread cost without a measured compositor alternative analysis.
- Shipping gesture motion with no cancellation, reduced-motion path, or keyboard equivalent.

## Checklist

- [ ] All nine compiler inputs are explicit or carry documented defaults.
- [ ] Keyboard, pointer, and touch outputs are present.
- [ ] The decision may legitimately be `do-not-animate` or `reduced-feedback`.
- [ ] Entry/exit duration, symmetry, origin, easing, and interruption are stated.
- [ ] Reduced-motion preserves the task and final state.
- [ ] Every decision cites modules, the semantic rule, and an executable recipe when one applies.
- [ ] Performance budgets and required CPU/reversal checks are in the verification plan.
