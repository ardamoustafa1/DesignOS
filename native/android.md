# Native: Android (Material, operationalized)

Android is not iOS-with-different-icons: different navigation physics, different type
system, wilder device diversity, and a user base spanning $80 phones to folding tablets.
Platform-adaptive design means THIS file governs the Android build even in
React Native/Flutter codebases.

## Navigation physics
- **The system back affordance rules everything:** predictive back (the peek-behind
  gesture) must work coherently from every screen — apps that trap or misroute back are
  uninstalled on reflex. Define the back-stack story per screen in `memory/pages.md`.
- Top-level: bottom navigation bar (3–5, icons + labels, Material state layer) or
  navigation drawer only for genuinely many destinations; within sections: stack
  navigation with the top app bar.
- Material sheets: bottom sheets (standard + modal, drag handle) are the platform's
  drawer/modal hybrid — half-expanded states expected (`components/modals.md` ladder
  mapping).
- Tabs swipe horizontally between siblings (unlike iOS) — if you render Material tabs,
  support the swipe.

## Layout & type
- Density reality: dp grid (8dp rhythm, 16dp margins), 48dp minimum touch targets
  (Android's 44pt), list rows 56–72dp.
- Type: Roboto/brand face via Material type scale (Display/Headline/Title/Body/Label) —
  the scale roles map cleanly to DesignOS's (`foundations/typography.md`); font scaling
  respected to 200% (the Dynamic Type equivalent, same non-negotiable).
- Screen diversity is the layout constraint: 360dp budget phones → foldables/tablets —
  responsive breakpoints INSIDE the app (list-detail canonical layouts at ≥600dp,
  `foundations/layout.md` thinking applied to window-size classes).

## Material as the token layer
- Material 3's color system (primary/secondary/surface containers, tonal elevation) is
  the platform's Tier-1; brand tokens map ONTO it (`foundations/design-tokens.md`) —
  fight it and every native component looks alien.
- **Dynamic color (Material You):** decide explicitly — embrace wallpaper-derived
  palettes (consumer apps, delight) or lock brand color (brand-critical products);
  record the decision + reason in `memory/brand.md`.
- Elevation: tonal (surface tint) over shadow in dark; both themes mandatory
  (`foundations/dark-mode.md`).

## Platform components & behaviors
FABs (one per screen max, THE primary action — `components/buttons.md` hierarchy
translated), snackbars (the toast+undo native — `components/modals.md` undo doctrine),
swipe-to-dismiss/refresh, chips (Material chips ≈ `components/badges-chips.md` with
platform skin), system share sheet, app widgets/shortcuts as re-engagement surfaces
(`psychology/habit-retention.md` cues).

## Motion
Material motion: emphasized easing curves, container-transform for continuity
(list card → detail = the platform's shared-element story), 200–400ms tokens —
map to DesignOS motion tokens per `native/motion-gestures.md`; Remove Animations
setting honored.

## Android-specific trust & reality
- Permission flow: runtime permissions with the same priming doctrine as iOS
  (`native/ios.md`) + graceful denial paths (Android users deny more, and partial-access
  states — approximate location, selected photos — must be first-class states, not
  errors: `components/states.md`).
- Notifications: CHANNELS are the contract — one channel per event type from the ledger
  (`components/notifications.md`), correctly prioritized, so users mute types, not the app.
- Performance floor: mid-range hardware IS the target (`motion/performance.md` throttle
  doctrine, but native: overdraw, list virtualization, startup time <2s cold).
- Back-stack + deep links + notification taps land coherently (the notification that
  opens a detail with no back-path to the app fails the audit).

## Anti-patterns
iOS-styled back chevrons + edge-swipe assumptions on Android · drawers hiding 4 items ·
FAB inflation (three FABs = zero FABs) · ignoring predictive back · fixed-width layouts
crumbling on foldables · notification spam on one default channel · uninstall-bait
full-screen interstitials.

## Checklist
- [ ] Predictive back coherent from every screen incl. deep links
- [ ] Bottom nav/drawer chosen by destination count; tabs swipe
- [ ] Brand mapped onto M3 tokens; dynamic-color decision recorded; both themes
- [ ] 48dp targets, font-scale 200%, window-size-class layouts
- [ ] One FAB max; snackbar+undo for reversibles; channels per event type
- [ ] Cold start <2s on mid-range; lists virtualized
