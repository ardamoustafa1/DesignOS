# Open Work

- No open Mission 4 implementation item recorded as of 2026-07-29.
- Re-run `npm test`, `npm run validate:strict`, `npm run test:goldens`,
  `npm run test:lighthouse`, link checks, and the browser final gate after any rule,
  runtime, golden, or CLI change.
- Treat future framework API changes as adapter maintenance; the pure motion math fixtures remain the compatibility baseline.
- Branch protection is active on `main`; keep the workflow job names
  `browser-gate-required` and `golden-pixel-required` stable or update the protected
  contexts in the same change.
- No open P0 product-truth item remains from the 2026-07-30 adapter/dependency/
  architecture hardening. Run `npm run ledger:update` intentionally whenever a counted
  executable source changes; CI must use `npm run check:ledger`, never regenerate drift.
- No open P1/P2 implementation item remains from the 2026-07-30 Live Director, motion
  evidence, eval-truth, package-boundary, CLI routing, and generated-doc hardening.
- `externalEval` intentionally remains false until a qualifying third-party run is
  registered. This is external evidence work, not an internal implementation TODO.
- No internal implementation item remains from the fifteen-feature Mission 4 leader
  backlog. Native device-lab evidence (real haptics, VoiceOver/TalkBack, keyboard/insets,
  mid-range Android frame traces) remains an external hardware/toolchain verification
  requirement and must not be represented as completed by source conformance.
- No open implementation item remains from the Motion Semantics Compiler, Live Director
  Studio, or Deterministic Claim Compiler P0 scope. Any new public claim source must be
  registered in `capabilities/public-claims.js` and regenerated through CI.
- ~~Align visible `v2.2` website language with package metadata.~~ Resolved 2026-08-03:
  package, lockfile, generated claims, plugin metadata, docs, and visible site now use 2.2.0.
- ~~Replace prototype-grade `motion-playground`, `signature-compile`, and `scroll-animate`
  paths with source-locked, tested implementations.~~ Resolved 2026-08-03: the playground
  is an accessible functional editor with static export; signature compilation supports
  dependency-free Vanilla/React/Vue/Svelte output with cleanup and reduced motion; scroll
  recipes generate fail-closed, target-adjacent progressive-enhancement CSS.
- Run an independent design panel and a physical screen-reader listening pass for the public site.
- Extend Pattern Atlas from source-backed discovery to an interactive browser surface with
  per-pattern live full/reduced playback and WebKit/Firefox temporal evidence.
- Add verified physical iOS/Android device runs before changing native evidence from
  `source-conformance-only`.
