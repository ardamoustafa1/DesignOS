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
- No internal implementation item remains from the twelve-feature Mission 4 leader
  backlog. Native device-lab evidence (real haptics, VoiceOver/TalkBack, keyboard/insets,
  mid-range Android frame traces) remains an external hardware/toolchain verification
  requirement and must not be represented as completed by source conformance.
