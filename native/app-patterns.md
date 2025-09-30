# Native: App Patterns — Structure, Onboarding, Offline

Cross-platform app-shaped decisions that sit above iOS/Android specifics
(`native/ios.md`, `native/android.md` govern the per-platform rendering).

## App IA (decide before any screen)
- **3–5 top-level destinations,** named by user jobs — the tab bar is the app's thesis
  statement. Everything else nests or lives behind search. If you can't cut to 5, the
  product needs an IA pass, not a "More" tab (a More tab = 4 orphaned features).
- **One primary creation/action** per app gets the privileged slot (center tab action,
  FAB, prominent button) — the mobile equivalent of the one-primary-CTA law.
- Screen census early (`memory/pages.md`): mobile apps rot by screen-sprawl; every
  screen added is navigation tax on all others.

## Mobile onboarding (`patterns/onboarding-auth.md`, compressed harder)
- The app-store install WAS the signup intent — don't re-sell with a 5-screen benefit
  carousel (swipe-through tutorial screens have ~single-digit read rates; users tap
  through blind). Straight to value or to the ONE required setup step.
- Auth: platform-native first — Sign in with Apple (required if any social login on
  iOS), Google One Tap, passkeys where feasible; email forms are the fallback, not the
  default. Biometric unlock offered AFTER first successful session, with the value
  stated.
- Permission requests staged at moments of need, each primed (`native/ios.md` doctrine,
  both platforms): notifications after the first thing worth notifying about exists.
- First session must produce the aha-artifact (`patterns/onboarding-auth.md` table) —
  on mobile the window is ~2 minutes, interrupted.

## Offline & connectivity (mobile's defining state problem)
Connectivity is a spectrum (airplane → elevator → flaky LTE), and mobile users live on
it. The state matrix (`components/states.md`) grows a dimension:
- **Read path:** cache-first rendering — show the last-known data with a quiet staleness
  cue ("Updated 2h ago"), refresh underneath; a blank screen behind a spinner because
  the radio is slow is a design failure, not a network one.
- **Write path:** queue mutations offline where the domain allows (drafts, likes,
  form entries), sync on reconnect with conflict rules decided; say what's queued
  ("Will send when online"). Where queuing is impossible (payments), fail fast +
  preserve input.
- Connectivity banners: one quiet persistent indicator, not a toast per fluctuation.
- Test in airplane mode as a review-loop step — the offline walk is mobile's keyboard walk.

## Lists, feeds & touch ergonomics
- Virtualize everything scrollable; skeleton per `components/states.md`; pull-to-refresh
  + new-content pills (`components/notifications.md` arrival doctrine).
- **Thumb-zone economics** (`psychology/cognition.md` Fitts, mobile edition): primary
  actions bottom-half, destructive actions OUT of the lazy arc, reachability on tall
  screens (key actions duplicated low when the top bar is unreachable one-handed).
- Swipe actions: max two per side, destructive full-swipe only with undo
  (`components/modals.md` undo doctrine); every swipe action needs a visible alternative
  (long-press menu / detail screen) — gestures are accelerators, never the only path.
- Text inputs: correct keyboard types/autofill hints (the `components/forms.md`
  inputmode rule, natively: textContentType/autofillHints), form never hidden under the
  keyboard (scroll-into-view + inset handling).

## Mobile-specific review additions (append to the loop)
- Interruption resilience: call/app-switch mid-flow → state survives (the mobile
  dirty-state rule; OS kills processes — persist drafts aggressively)
- Deep links & notification taps land with a coherent back-story
- Cold start <2s mid-range; 60fps scroll on the longest list
- Offline walk passes; airplane-mode mutations queue or fail gracefully
- Both platforms' checklists (`native/ios.md`, `native/android.md`) run separately —
  one build passing does not certify the other

## Anti-patterns
Benefit-carousel onboarding · login walls before any value · "rate us" on second launch ·
hamburger-hiding a 4-item IA · gesture-only affordances · infinite feeds in productivity
tools (`psychology/habit-retention.md` engagement-theater warning) · desktop web
responsive-shrunk and shipped as "the app".

## Checklist
- [ ] ≤5 destinations, job-named; one privileged action; screen census in memory
- [ ] Zero-carousel onboarding; native-first auth; staged primed permissions
- [ ] Cache-first reads with staleness cues; writes queue-or-fail-fast; offline walk passes
- [ ] Thumb-zone audit; swipe accelerators with visible alternatives
- [ ] Interruption/deep-link/cold-start/scroll-fps review additions run per platform
