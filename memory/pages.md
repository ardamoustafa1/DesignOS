# Surfaces

- `website/index.html` — public product surface; responsive/browser gate clean in the 22-scenario matrix.
- `goldens/ai-copilot-landing/index.html` — AI copilot landing reference; browser evidence generated.
- `goldens/cybersecurity-pricing/index.html` — cybersecurity pricing reference; browser evidence generated.
- `goldens/fintech-dashboard/index.html` — dense fintech dashboard reference; browser evidence generated.
- `goldens/flagship-launch/index.html` — high-intensity signature reference; browser evidence generated.
- Live Director Studio — hover/select inspector, source/component boundaries, variant
  carousel, semantic impact diffs, locks, conflict-safe manual merge, four-gate
  transactional acceptance, reject, and rollback.
- Motion Lab — generated engineering surface for timing, physics, CDP trace attribution,
  cleanup/latency metrics, temporal comparison, torture scenarios, and replay.
- `website/index.html` (2026-08-03) — motion elevation implemented; strict validation clean;
  browser gate clean across 22 scenarios; Lighthouse lab 100/100/100/100 with LCP 656.99ms,
  CLS 0.00002035, and TBT 0ms. Final design score remains NOT ASSESSED pending independent review.
- `website/index.html` (2026-08-03, v2.2 leadership update) — public fake score/SHIP theater
  removed; five-upgrade composition now exposes Pattern Atlas and the unified Improve workflow;
  emoji feature icons replaced with system SVGs. Browser gate passed 22/22 scenarios,
  22 screenshots, five keyboard paths, and two declared tasks. Final design score remains
  NOT ASSESSED pending an isolated panel.
# 2026-08-19 — `test-cv-site`

- Upgraded to the MotionOS runtime contract with arrival, interaction, scroll and transition roles.
- Browser gate: 22 scenarios, 22 screenshots, five keyboard paths, zero P1/P2. No task flow is declared, so task success is not claimed.
- Temporal motion evidence: 88 sampled full/reduced frames, clean.
- Runtime inspection: motion ready, 16 binding tokens, no horizontal overflow, no browser warnings/errors.
- 4× CPU profile after warm-up: 59.23 average FPS, 17.5ms p95 frame time,
  1.32% dropped-frame ratio, zero blocking tasks, zero listener/heap leak.
- Physical mid-range phone profiling: NOT ASSESSED; no connected device evidence was available.

# 2026-08-19 — MotionOS flagship artifacts

- Three production-style local artifacts added: bundled Three.js physical-material stage,
  raw WebGL2 shader field and interactive SVG path morph.
- Three.js artifact passed the full Chromium 22-scenario gate and Firefox/WebKit smoke gates.
- Shader and SVG artifacts passed Chromium smoke gates with zero P1/P2.
- Three.js 4× CPU profile: 59.97 FPS average, 17.6ms p95, 0% dropped frames,
  zero blocking tasks and leak-free cleanup.
- Bundled Three.js payload is about 493 KB and is intentionally signature-only, never a default page dependency.
- Added a two-document shared-element route fixture with native cross-document View
  Transitions and a 1ms reduced-motion path.
- Studio-generated artifacts now execute three scene-graph families; browser evidence
  covers all three and confirms cinematic canvas suppression under reduced motion.

# 2026-08-19 — Studio P0 workbench

- Added resumable project history, explicit three-direction selection, stable project/run IDs and idempotent generation.
- Added `/api/projects` and `/api/status`; generation ownership and quota decisions are server-side.
- Sites `DB` D1 binding and generated four-table migration persist users, projects, generation runs and daily usage/cost windows.

# 2026-08-24 — Studio P1 artifact evidence

- Generated artifact passed its own 22-scenario browser matrix with one declared task, zero P1/P2, 20 AX trees and 20 Axe runs.

# 2026-08-24 — Studio P2 catalog surface

- Studio exposes 201 certified systems through `/api/systems`; the client receives metadata only, while full token contracts remain server-side.
- Direction cards follow the selected system's ordered composition contract and project history restores both system and variation.
- Representative generated artifacts for Kiln, Stripe and Aster Ledger each passed 22 browser scenarios, 1/1 task, 20 AX trees, 20 Axe runs, temporal parity and 4× CPU profiling with zero P1/P2.
- Temporal full/reduced evidence passed; 4× CPU profile measured 17.5ms p95, zero dropped frames and clean teardown.
- Studio → signed isolated worker → evidence envelope → reveal integration passed end to end.
