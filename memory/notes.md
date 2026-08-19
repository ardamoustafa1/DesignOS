# Notes

## 2026-08-19 keyless Studio planning record

- Current `nexu-io/open-design` evidence describes 151 bundled design systems, 100+ functional skills, 277 official plugins plus 183 reference examples, HyperFrames, and 26 distinct local CLI executables. Counts are time-sensitive and must be cited from a pinned upstream commit at implementation time.
- The competitor is no longer accurately described as BYOK-only: its current README announces an official zero-config Cloud model service, while its public-site FAQ still describes a BYOK-only/no-server model. Treat keyless access as table stakes and compete on governance, cost visibility, and output quality.
- The competitor's Design Jury is a single CLI/model context role-playing five panelists, defaults to an 8.0/10 threshold, and can retain the best sub-threshold round. The proposed DesignOS gate must use isolated judging contexts plus deterministic browser/accessibility/performance evidence and must not reveal a sub-threshold artifact as passed.
- Repository audit found 153 complete DesignOS system packages (`SYSTEM.md`, `tokens.css`, `manifest.json`, `lint.json`, `example.html`), including imported Open Design packages with pinned commit, Apache-2.0 provenance, NOTICE pointer, and recorded modifications.
- Apache-2.0 redistribution requirements and the absence of a trademark grant make provenance retention, modified-file notices, and “inspired by / not affiliated” labeling mandatory product work, not documentation cleanup.
- No product code was written in this planning pass. An accidental read-only-help attempt generated untracked agent export files; the exact generated files were removed immediately and the worktree was returned clean.

## 2026-08-19 keyless Studio MVP implementation record

- Owner approval was received and a Sites/vinext React Studio was implemented in `studio/` with a brief composer, Kiln system selection, sandboxed generated preview, mechanical gate evidence, and a mobile focus-preview mode.
- The API boundary accepts only `brief`, `systemId`, and `variation`; client provider fields are rejected. Operator-only `DESIGNOS_PROVIDER_BASE_URL`, `DESIGNOS_PROVIDER_API_KEY`, and `DESIGNOS_PROVIDER_MODEL` variables drive the optional central provider path.
- No provider secrets were available during verification. The live central-provider integration is therefore `NOT_ASSESSED`; the clearly labelled deterministic demo planner exercised the remaining orchestration, compiler, repair, gate, quota, and reveal path.
- The compiler exposes three composition families and enforces four motion roles. The deterministic demo intentionally fails attempt one and passes after a fingerprinted repair, proving that the failed artifact remains withheld.
- Only Kiln is exposed. The 153 packages are structurally complete, but the current integrity audit reports substantial prose-to-token color drift across most judged systems; catalog-wide production readiness is not claimed.
- MVP quota is an in-memory, IP-derived limit of five accepted runs per hour. Authenticated durable quota/cost ledgers, provider failover, isolated render workers, and multi-region coordination remain production work.
- Final browser gate: 22 scenarios, five keyboard paths, one declared task passed, zero P1/P2 findings. The initial failing browser report is preserved in `studio/evidence/browser-gate.initial.json`.
- Final Lighthouse evidence before the closing typography-only adjustment: performance 100, accessibility 100, best practices 96, SEO 100; LCP about 150ms, CLS 0, TBT 0. Final rerun evidence must be copied, not inferred.
- Deterministic source review previously returned zero findings and a static risk indicator of 100/100. The final seven-dimension design score remains `NOT_ASSESSED`.
- Blind closing review confirmed the mobile task-surface blocker and overclaim were resolved. It retained a distinctiveness critique and requested stronger small-text readability; the latter was increased before final verification. Runtime screen-reader behavior remains `NOT_ASSESSED` without a physical listening pass.

## 2026-07-29 verification record

- Static unit and structural suites cover CLI behavior, module integrity, motion math, 36 detector contracts, 90 adapters, graph nodes, Live Director primitives, and Motion Lab controls.
- Four golden manifests cover 88 standard browser scenarios, eight supplemental screenshots,
  ten declared tasks, text-spacing, forced colors, and AX-tree announcement contracts.
- Browser baseline comparison was exercised with identical baselines and produced 0% diff without dimension mismatch.
- Live Director annotation integration produced a real element screenshot crop.
- Deterministic review output, test counts, and any degraded panel status must be copied from the final verification run; do not infer a score from this memory.
- Final deterministic review (2026-07-29): `website/index.html` — 0 findings,
  `STATIC CHECKS CLEAN`, `Final design score: NOT ASSESSED`.
- Hardening verification: website browser gate 22/22 with 0 P1/P2; four goldens 88/88;
  every standard golden scenario carries Axe and full Chromium AX-tree evidence.
- Framework matrix: six real package builds, twelve full/reduced browser runs, 48 browser
  assertions, and real React/Vue/Svelte source-map resolution.
- Isolated rule ledger: 36/36 rule IDs passed isolated static, browser, Lighthouse, and
  pixel black-box runs. This proves process/rule isolation, not third-party independence;
  the external evaluation count remains zero.
- Final Lighthouse CI-lab run: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 113.671ms, CLS 0, TBT 0, provided throttling.
- Dependency audit after adding Lighthouse 13.4.1: 0 vulnerabilities.
- GitHub branch protection API verification: `main` uses strict required status checks
  `browser-gate-required` and `golden-pixel-required`, with admin enforcement enabled.
- Final link sweep: 26 unique URLs across 252 files, clean; four intentionally skipped by
  fast-mode policy.

## 2026-07-30 P0 product-truth verification

- `npm run validate:strict`: clean, including generated dependency/capability drift.
- `npm test`: 43/43 CLI tests; 67 modules; 15 recipes × 6 executable adapter contracts;
  36 rules, 90 adapters, and 138 graph nodes.
- `npm run test:frameworks`: 90 emitted adapter sources compiled against their real
  dependencies; 180 adapter fixtures passed 2,970 browser assertions across full and
  reduced motion; React/Vue/Svelte source-map resolution also passed.
- The machine ledger records three production dependencies, seven registry providers,
  36 rules, 67 validated modules, 24 industries, 15 recipes, six stacks, 90 executable
  combinations, 180 browser scenarios, 138 graph nodes, and four goldens.
- No deterministic visual design score was inferred from this runtime/documentation task.

## 2026-07-30 P1/P2 verification

- AST Live Director integration passed source mapping, component transform, real build,
  browser acceptance, transaction recording, and hash-safe rollback.
- Motion evidence passed real Chromium CDP profiling and temporal full/reduced trajectory
  regression, including frame percentiles, continuity, symmetry, origin, overshoot, and
  semantic equivalence.
- Core npm consumer installation passed coverage from the packed artifact: 36 capabilities,
  36 isolated rule rows, zero external rows. Core size was about 535 KB packed/1.5 MB
  unpacked; four-golden evidence builds separately at about 68.7 MB unpacked.
- Golden suite passed four projects × 22 scenarios with 24 screenshots per project.
- Framework conformance passed 180 adapter fixtures and 2,970 browser assertions.
- `externalEval: false` is the verified current state; no third-party claim was inferred.

## 2026-07-30 Mission 4 leader-feature verification

- Canonical feature inventory: 12/12 executable sources present.
- Registry coverage: 38/38 rules have fixtures, automation, golden evidence, and
  isolated black-box results; external evaluation remains 0.
- Web adapter matrix: 15 recipes × 6 stacks × 2 motion modes = 180 fixtures and 3,510
  browser assertions, plus React/Vue/Svelte source-map resolution.
- Leader suite: 16 generated states, nine mutation operators at 100% recall and 100%
  precision, eight interruption torture scenarios, six compiled composition stacks,
  and four native adapter capability contracts.
- Native source evidence on the available machine: SwiftUI passed iOS SDK type-check,
  Flutter passed `flutter analyze`, Reanimated passed TSX parsing; Compose passed
  structural/capability validation because no Kotlin/Android compiler was installed.
- Public site browser gate: 22/22 scenarios, zero P1/P2; Lighthouse categories 100/100/
  100/100 with LCP 152.288ms, CLS 0, and TBT 0.
- Golden verification: four projects × 22 scenarios and 24 screenshots per project.
- Deterministic source review: zero findings, static risk floor 100/100. Final
  seven-dimension design score remains NOT ASSESSED; human hierarchy/brand/conversion
  and screen-reader listening were not performed.
