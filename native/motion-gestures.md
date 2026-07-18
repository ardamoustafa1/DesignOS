# Native: Motion & Gestures

Web motion communicates state; native motion communicates *physics*. Screens are sheets
of glass the user's finger actually moves — the moment motion disobeys finger physics,
the app feels like a website in a costume.

## The physics contract
1. **Gestures track the finger 1:1.** A dismissible sheet follows the drag exactly —
   not an animation triggered BY the drag. Release decides: past threshold or with
   velocity → complete; otherwise → spring back. This tracking is THE native feel;
   nothing else compensates for its absence.
2. **Everything is interruptible.** A user can catch a mid-flight transition and reverse
   it; queued, blocking animations are web-era artifacts
   (`motion/micro-interactions.md` never-block rule, promoted to law).
3. **Velocity transfers.** A flung sheet leaves at fling speed; springs inherit the
   gesture's momentum — the animation continues the physics the finger started.
4. **Springs over durations** for anything gesture-adjacent: stiffness/damping tuned per
   platform voice (iOS: fluid interactive springs; Android: Material's emphasized
   curves) — one spring configuration per platform, recorded in `memory/design.md`
   (the motion-token doctrine, natively rendered).

## Transition vocabulary (map to DesignOS tokens)
| Move | iOS voice | Android voice |
|---|---|---|
| Push/pop | slide + parallax under, interactive edge-swipe | fade-through / shared-axis, predictive back peek |
| Sheet up/down | detent springs, grabber, drag-dismiss | bottom-sheet drag, half-expanded states |
| List → detail | subtle push (or matched-geometry hero) | container transform (shared element) |
| Tab switch | instant or crossfade — never slide (tabs aren't spatial siblings on iOS) | crossfade; swipeable where Material tabs |
| In-content state | 150–250ms ease-out, same as web tokens | same |

Continuity rule (`motion/principles.md` origin honesty, upgraded): the tapped thing
*becomes* the next screen where the platform supports it (matched geometry / container
transform) — the strongest native continuity device; spend it on the app's core
list→detail path, once.

## Gesture design rules
- **Every gesture has a visible twin** (`native/app-patterns.md`): swipe-to-archive ↔
  the archive button exists; edge-swipe back ↔ the back affordance exists. Gestures are
  earned speed, not hidden requirements.
- Don't fight the OS for edges: system back (Android), system home indicator, edge-swipe
  (iOS) own their zones — custom gestures live in the content area.
- Thresholds forgive: dismiss thresholds ~30–40% of travel OR a velocity flick; near-miss
  springs back gently (rubber-banding at boundaries, always — hard stops feel broken).
- Multi-step gestures (drag-reorder): lift confirmation (scale 1.02–1.05 + haptic +
  shadow), live displacement of siblings (FLIP), drop settles with a spring
  (`components/tables.md` reorder, native physics).

## Haptics (the invisible motion channel)
- Vocabulary, used at OS-taught moments only: selection ticks (pickers, toggles),
  impact on drag lift/drop and threshold-crossing, notification haptics on
  success/warning/error outcomes.
- Haptics confirm PHYSICS, not decoration — a haptic on scroll is noise; on
  crossing-the-dismiss-threshold it's information ("release now = closes").
- Budget like celebrations (`components/states.md`): constant buzzing = numbness;
  respect system settings (haptics off = off).

## Spring & duration reference values

| Context | iOS (response s / damping) | Android (M3 token) |
|---|---|---|
| Sheet settle / dismiss completion | 0.40–0.50 / 0.80–0.90 | emphasized 400–500ms |
| Small state change (toggle, chip) | 0.25–0.30 / 0.90 | standard 200ms |
| Drag-release spring-back | 0.30–0.35 / 0.75–0.85 (velocity-inheriting) | spring: medium damping |
| Full-screen push/pop | interactive (gesture-driven) | emphasized 300–400ms |

Starting points, not laws — tune per product voice, then freeze ONE configuration per
context in `memory/design.md`; per-screen spring drift is the native version of the
random-easing web sin (`motion/principles.md`).

## Performance & accessibility floors
- 60fps minimum, 120fps-aware on ProMotion-class displays (springs render beautifully
  at high refresh; jank is doubly visible) — profile on mid-range Android, not the
  flagship (`motion/performance.md` doctrine, native edition).
- Animations on the UI thread's fast path (native driver / composited transforms) —
  JS-thread-bound animation in RN stutters exactly when the app is busy, which is
  exactly when users interact.
- **Reduce Motion honored per platform:** replace slides/zooms with crossfades, kill
  parallax, keep gesture *tracking* (it's user-generated motion — allowed and expected)
  but soften completion springs (`motion/performance.md` policy, translated).

## Anti-patterns
Drag-triggered (not drag-tracked) dismissals · non-interruptible hero transitions ·
gesture-only features · haptic confetti · fighting system edge gestures · 500ms
screen transitions (native tolerance is ~250–350ms MAX for full-screen moves) ·
Lottie loops running on every idle screen (battery + attention).

## Checklist
- [ ] All dismissibles: 1:1 tracking, velocity-aware thresholds, rubber-banding
- [ ] Transitions interruptible; one spring config per platform, recorded
- [ ] Continuity spent on the core list→detail path via platform shared-element
- [ ] Every gesture twinned visibly; system edges unfought
- [ ] Haptics per vocabulary, settings-respecting
- [ ] 60fps on mid-range, UI-thread animation path, Reduce Motion honored
