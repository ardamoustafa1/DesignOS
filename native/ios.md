# Native: iOS (Human Interface Guidelines, operationalized)

iOS users have OS-trained reflexes; violating them costs more than any brand gain.
Rule zero: **the platform is the design system; your brand is a guest in it.**
(For cross-platform stacks — React Native/Expo/Flutter — this file still governs the
iOS build: platform-adaptive beats identical-everywhere.)

## Navigation physics
- **Stack + tab bar is the skeleton:** bottom tab bar (2–5 items, SF Symbols + labels)
  for top-level destinations; push/pop stacks within each tab, per-tab state preserved.
- **The back gesture is sacred:** interactive swipe-from-left-edge pop must always work —
  custom gesture handlers that eat it are the #1 native-feel killer.
- Large title collapsing to inline on scroll = the native scroll signature; adopt it
  rather than fighting it.
- Modality: sheets (`.pageSheet`/detents — half-sheet for quick tasks) with grabber +
  pull-to-dismiss; full-screen covers reserved for immersive flows
  (`components/modals.md` ladder, translated: sheet ≈ drawer, cover ≈ modal).

## Layout & type
- Safe areas are law (notch, home indicator, Dynamic Island) — content never hides
  under them; the home-indicator zone stays gesture-clean.
- **Dynamic Type is the a11y contract:** layouts must survive the user's text size up
  through accessibility sizes — test at AX3, not just Large. Fixed-height rows that clip
  scaled text fail review (`foundations/accessibility.md` extended to platform).
- System type (SF Pro) unless the brand face earns its place in *display* roles only;
  text styles (Body/Headline/Caption) over raw sizes — they inherit Dynamic Type free.
- Spacing rhythm: 16pt default margins, 44pt minimum touch targets (the origin of the
  DesignOS-wide rule), list rows 44–56pt.

## Platform components (use, don't rebuild)
Native pickers/date wheels, swipe-actions on list rows (leading/trailing, destructive
full-swipe), pull-to-refresh, context menus (long-press preview), share sheet,
searchable navigation bars. Every custom rebuild of these must beat the native version
at ITS OWN conventions — almost none do. Custom is for your *content*, native for chrome
(`brain/originality.md` doctrine, platform edition).

## Motion & haptics
- Spring-based, interruptible transitions are the platform voice — abrupt linear motion
  reads as web-view (`native/motion-gestures.md` for the full spec).
- Haptics vocabulary: light impact (selection), medium (action confirm), success/warning/
  error notifications — used at the moments the OS taught, never decoratively.
- Respect Reduce Motion (crossfade instead of slide/zoom) — the OS-level setting maps to
  the DesignOS reduced-motion doctrine.

## Dark mode & theming
System-following by default (both appearances mandatory — `foundations/dark-mode.md`
physics apply); semantic system colors (`label`, `systemBackground` ladders) as the
Tier-1 layer under brand tokens (`foundations/design-tokens.md` — the elevation ladder
maps to system grouped-background levels).

## iOS-specific trust surfaces
- **Permission priming:** never fire the OS dialog cold — a pre-prompt explains value
  first ("Relay pages you only for incidents you own"), THEN requests; a denied OS prompt
  is nearly unrecoverable (`psychology/trust.md` point-of-disclosure).
- Push notifications: provisional/quiet first where fitting; the notification ledger
  (`components/notifications.md`) governs — iOS users uninstall over spam.
- App Store presence: screenshots are the real landing page (design them as
  `components/hero.md` artifacts), ratings prompt only after a genuine success moment,
  never on launch.

## Anti-patterns
Android back-button UI on iOS · hamburger menus where a tab bar fits · custom navbars
that break the swipe-back · fixed 17px text ignoring Dynamic Type · onboarding walls
before value (`patterns/onboarding-auth.md` applies) · web-view-in-a-wrapper feel:
300ms tap delays, no scroll bounce, dead haptics.

## Checklist
- [ ] Tab-bar + stack IA; swipe-back intact everywhere; per-tab state preserved
- [ ] Safe areas + Dynamic Type through AX sizes verified
- [ ] Native components for chrome; custom only for content
- [ ] Haptics per vocabulary; Reduce Motion honored
- [ ] Both appearances via semantic colors under brand tokens
- [ ] Permissions primed; notifications ledgered; store screenshots designed
