# Motion Decision Engine

## The five gates

`MOTION_INTENSITY` controls the page-wide ceiling. A specific interaction still passes
five gates before receiving motion:

1. **Frequency** — `very-high`, `high`, `medium`, `low`, `rare`.
2. **Purpose** — feedback, orientation, continuity, explanation, or delight.
3. **Initiator** — keyboard, pointer, touch, or system.
4. **Interruptibility** — none, reversible, or direct-manipulation.
5. **Cost** — compositor, paint, layout, or main-thread.

Run:

```bash
designos motion-decide "command palette" \
  --frequency very-high --purpose orientation --initiator keyboard \
  --interruptibility reversible --cost compositor --motion 4
```

## Hard decisions

- Very-high-frequency keyboard actions: no entrance; at most 80ms opacity feedback.
- Direct manipulation: 1:1 tracking; no easing while the pointer is down.
- Layout/main-thread cost: reject unless no compositor alternative exists and a measured
  performance budget is attached.
- Delight requires low/rare frequency and `MOTION_INTENSITY >= 6`.
- Springs require interruptibility, one product-wide configuration, and a reduced-motion
  settle path.
- Exit duration is 70–80% of entry duration.

The CLI returns a decision, maximum duration, easing family, implementation route,
reduced-motion path, performance verification and the reason chain. A rejected interaction
is a successful decision; “nothing moves” is often the premium result.

## Anti-patterns

- Animating a command-palette or keyboard shortcut entrance that runs dozens of times daily.
- Calling decorative motion “feedback” when the state remains equally clear without it.
- Using a spring for direct manipulation while the pointer is still down.
- Accepting layout or main-thread cost without a measured compositor alternative analysis.
- Shipping gesture motion with no cancellation, reduced-motion path, or keyboard equivalent.

## Checklist

- [ ] Frequency, purpose, initiator, interruptibility and cost are explicit.
- [ ] The decision may legitimately be `reject` or `feedback-only`.
- [ ] Maximum entry and exit durations are stated.
- [ ] Implementation and cancellation routes are named.
- [ ] Reduced-motion preserves the task and final state.
- [ ] 4× CPU, INP and reversal checks are in the verification plan.
