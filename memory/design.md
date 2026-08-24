# Design Decisions

## 2026-07-29 — Mission 4 execution layer

- A unified 36-rule registry is the canonical finding contract across source, DOM, visual, Lighthouse, hook, golden, and Live Director gates; legacy provider orchestration is driven from the same registry metadata.
- Browser evidence uses five widths, both themes, both motion modes, equivalent 200%/400% reflow, keyboard traversal, Axe, Chromium accessibility trees, text-spacing overrides, forced colors, declared tasks, runtime failures, and screenshots.
- Pixel regression is thresholded per golden; dimensions are a hard mismatch and changed pixels use a 16-channel-delta tolerance.
- Motion recipes share pure runtime physics and emit six framework adapters; reduced motion and teardown are part of the adapter contract.
- Live edits are source-locked transactions with backup, before/after gate comparison, memory write, and hash-verified rollback.
- Goldens accept no P1/P2 browser findings and no unearned P3 aesthetic advisories.
- Dynamic task results must appear in a valid `status`/`alert` live region and in Chromium's
  accessibility tree; DOM attributes alone are insufficient evidence.
- Lighthouse uses a pinned Node 22 runner. The CI lab gate records its throttling method
  and blocks category scores below 95, LCP above 2s, CLS above 0.1, or TBT above 200ms.
- CI exposes separate `browser-gate-required` and `golden-pixel-required` checks; deployment
  consumes the same gates and produces an exact commit/SHA browser ledger.
- Live Director acceptance is blocked by configurable transfer/load/long-task/layout-shift
  budgets. Context variants record sector, memory hash, proof policy, and Signature Compiler provenance.

## 2026-07-30 — Executable adapter and capability truth

- Motion recipes use one recipe-specific state/controller contract with explicit
  `mount`, `play`, `reverse`, `cancel`, `update`, and `destroy` behavior (`run` remains
  a backward-compatible alias). Framework adapters own
  lifecycle binding; the shared controller owns semantic state, computed visual state,
  cancellation, and listener accounting.
- “90 adapters” means 15 recipes exercised in six real framework stacks, not 90 copied
  source files. Both 90 emitted sources and 180 full/reduced browser scenarios are
  mandatory evidence.
- `capabilities/ledger.json` is generated from `package.json`, the unified rule registry,
  knowledge modules, industries, motion recipes/stacks, knowledge graph, and goldens.
  README and Architecture capability tables are generated from the same ledger.

## 2026-07-30 — P1/P2 product-depth architecture

- Live Director variants are syntax-aware component-source transactions. A variant owns
  component tree, slots, copy hierarchy, CTA priority, state, motion, responsive policy,
  and proof placement; acceptance requires build output plus browser/performance gates.
- Motion evidence has two complementary engines: CDP tracing attributes browser work and
  frame-time percentiles; temporal regression samples trajectories, easing, enter/exit,
  transform origin, overshoot, settle time, interruption, and reduced-motion equivalence.
- Internal process isolation is named `isolatedRuleEval`. `externalEval` can become true
  only from the separately verified external registry with an independent maintainer,
  blind protocol, immutable evidence, and rule-level results.
- The npm core excludes golden/generated evidence. `designos-evidence` is assembled by a
  separate builder, and a 2 MiB package-boundary gate prevents accidental reintroduction.
- CLI domains are routed through command modules. Capability counts and the generated
  sections of README, Architecture, Roadmap, and Limitations share one registry.

## 2026-07-30 — Mission 4 leader-engine layer

- dials: variance 3 · motion 7 · density 8
- why: DesignOS is a developer-facing verification system; the engine APIs stay
  conservative and dense while motion receives deep executable evidence rather than
  decorative intensity.
- The canonical controller contract is `mount/play/reverse/cancel/update/destroy`.
  All web adapters expose it and a compiled state graph owns reverse, interruption,
  loading suppression, origin, and pointer/focus parity.
- Live Director directions are material-led, audience-led, and belief-led. Each
  transaction records tree, slot, token, copy, CTA, state graph, responsive,
  accessibility, performance, and proof-provenance effects.
- Genome, responsive, state-matrix, mutation, and consistency engines operate on the
  product dialect rather than judging one screenshot in isolation.
- Composition grammar is a compiler contract for HTML, React, Vue, Svelte, Tailwind,
  and CSS Modules; all generated layouts carry the same four-width constraint contract.
- Native sources share one capability contract across SwiftUI, Compose, Reanimated,
  and Flutter. Device evidence is reported separately from source/type conformance.

## 2026-07-30 — P0 semantic motion, Studio, and claim truth

- Motion is compiled from component, state transition, frequency, modality, measured
  geometry, intensity, user preference, device power, and semantic importance. The
  compiler may choose no motion; every positive decision exposes modality parity,
  symmetry, origin, interruption, reduction, budgets, reasons, and provenance.
- Live Director is a Studio surface rather than a preview-only CLI. Source-locked AST
  transactions expose semantic diffs and cannot be accepted until browser,
  accessibility, motion, and performance gates independently pass.
- Public capability language is generated from executable sources. Native evidence stays
  `source-conformance-only` and external evaluation stays false until their registries
  contain qualifying evidence.

## 2026-08-03 — Public-site motion elevation

- dials: variance 5 · motion 7 · density 5
- rung: 7; one staged hero entrance and one interaction-scale terminal response.
- Signature vehicle: the boot terminal responds to pointer intent with bounded 3D depth and a
  translated glow, expressing “intent becomes a governed design decision.”
- Motion is compositor-only, requestAnimationFrame-batched, gated to fine pointers, and collapses
  to a complete still state under reduced motion.
- Rejected: magnetic navigation, custom cursor, perpetual cursor blink, multi-section parallax,
  and Penta's purple motif.

## 2026-08-03 — Category-leadership product layer

- DesignOS 2.2 uses `improve` as the truthful primary workflow: inventory, explainable
  motion decisions, pattern shortlist, deterministic gates, fix order, and explicit
  evidence gaps share one report; unsupported dimensions remain `NOT ASSESSED`.
- High-frequency keyboard actions compile to an immediate semantic and visual state with
  zero animation. The earlier 80ms acknowledgement was superseded because repeated expert
  input must not accumulate ceremonial latency.
- The Pattern Atlas is the canonical discovery contract. Every pattern must declare intent,
  product truth, earned/avoid contexts, pointer/keyboard/touch behavior, reduced-motion
  equivalence, performance budget, recipe, and governing modules.
- Simulated review output is forbidden. `ai-review` now produces a provenance-labelled
  packet for an actual isolated reviewer and never claims that a model was invoked.
- Motion orchestration compiles a parsed DSL to cancellable WAAPI output with reduced-motion
  equivalence; hard-coded demonstration timelines are not product features.

## 2026-08-03 — Portable motion tooling

- Public motion generators fail closed on unknown recipes and stacks; silent fallback is
  forbidden because it can ship a technically valid but semantically wrong interaction.
- Signature output has no undeclared runtime dependency and shares cleanup, fine-pointer,
  requestAnimationFrame, blur/reset, and reduced-motion behavior across Vanilla, React,
  Vue, and Svelte.
- Scroll recipes write a companion stylesheet rather than mutating user source. Native
  scroll timelines are progressive enhancement; the no-support and reduced-motion states
  keep content visible and complete.

## 2026-08-19 — Generation trust repair

- dials: variance 8 · motion 8 · density 4
- why: creative/portfolio output must audition the system visibly; composition and motion
  are licensed, while verified content and accessibility remain non-negotiable.
- `init` now installs a managed DesignOS kernel block into an existing root `AGENTS.md`
  instead of silently skipping framework-owned instructions. This closes the observed
  failure where neutral starter tokens were present but the designing agent never loaded
  the DesignOS kernel.
- `prototype` now compares structural composition families rather than cosmetic minimal,
  glass, and brutalist skins. Its motion language is arrival + scroll orientation +
  pointer/keyboard interaction + View Transition, with content-visible fallback and a
  complete reduced-motion path.
- A new portfolio generation contract blocks fake identity/proof, prose-only portfolios,
  one-column composition, starter typography/material, incomplete motion semantics, and
  missing reduced-motion handling. `designos ship` withholds failures; a clean mechanical
  result still does not claim a final design score.
- Signature: oversized editorial type plus a proof-artifact stage. It expresses that
  DesignOS designs from inspectable product truth, not from decorative cards.
- Rejected: perpetual ambient loops, glassmorphism variants, system-font starter output,
  opacity-hostaged scroll content, and motion-role counting as a substitute for browser
  performance or accessibility evidence.
# 2026-08-19 — MotionOS executable direction

- dials: variance 9 · motion 9 · density 3
- why: owner requested a portfolio/agency-grade motion ceiling; `industries/portfolio-agency.md` licenses cinematic scroll choreography when a measured fallback exists.
- signature vehicle: kinetic editorial typography; repeated through word-level arrival and section handoff, not through unrelated effect stacking.
- architecture: deterministic motion genome → four-recipe scene → dependency-free runtime → temporal and browser gates.
- inventory: 120 executable contracts across eight categories and 12 composed scenes; each scene carries at least three semantic roles and every contract declares reduced/mobile/cleanup policy.
- cost guard: one hero signature, two page signatures maximum, native scroll, fine-pointer gates, rAF batching and static reduced-motion state.
- engine layer: WebGL2 shader, Three.js product scene, Rive state machine, SVG path morph,
  native shared-element transition and asset manifest pipeline all fail to an explicit static state.
- Studio integration: each family emits a scene id, character, four recipes and fallback;
  the artifact runtime now mounts an editorial pointer-depth scene, cinematic procedural
  canvas field, or technical cursor/scroll scene from that graph. The hidden retry reports
  the actual failed gate ids before recompilation.
- Adapter evidence: all 720 generated modules compile; all 120 contracts mount and clean
  up in Chromium under full and reduced motion. This is kept distinct from the existing
  real-framework lifecycle matrix.
- optical corrections: display tracking tightened at hero scale; circular CTA content optically centred; project depth uses perspective from the card centre rather than viewport coordinates.

## 2026-08-19 — P0 product control plane

- dials: variance 3 · motion 2 · density 8
- why: Studio is an expert workbench; answer-first hierarchy, dense evidence and immediate state feedback outrank marketing arrival choreography.
- Sites identity headers own authentication; D1 owns project, run, idempotency, quota, token and cost state. In-memory storage is a local/test fallback only.
- Provider credentials remain server-only. The ordered router validates public HTTPS origins, fails over between providers and opens a 30-second circuit after three consecutive failures.
- Studio directions are structural (`editorial-ledger`, `split-proof`, `rail-story`), persisted per project and selected before generation rather than cosmetically cycled afterward.
- Agent installation preserves unrelated configuration, installs the shared runtime and refuses readiness until an MCP initialize handshake succeeds.

## 2026-08-24 — P1 evidence boundary

- Studio and CLI share `designos.design-ir/v1` and one immutable render/evaluate/repair kernel.
- P1 release evidence belongs to the generated artifact, never the parent Studio shell.

## 2026-08-24 — P2 certified system runtime

- The production selector is certification-led: 201/201 packages are certified and only ledger members enter Studio.
- Every system owns an ordered permutation of three licensed composition families; the chosen variation is resolved against that system order before Design IR compilation.
- Runtime compilation injects the selected package's normatively certified tokens plus a complete semantic alias boundary. Imported upstream prose remains provenance archive and never becomes executable styling.
- The selected system ID persists through projects, runs, evidence labels and the generated artifact's `data-design-system` marker.
- A first isolated Kiln run exposed a 4.44:1 light-mode CTA regression. The light ember token was corrected to `#A73510`, recertified, and rerun at zero P1/P2; failed evidence stayed withheld.
- The artifact worker requires an HMAC-signed, timestamp-bounded request, runs in a separate process/browser boundary and returns a digest-bound `designos.artifact-evidence/v1` envelope.
- Required worker evidence that is missing or incomplete is `NOT_ASSESSED` and cannot reveal an artifact.

## 2026-08-24 — P3 authored motion selection

- dials: variance 9 · motion 8 · density 4.
- Studio compiles one of twelve art-directed scenes through six distinct renderer families: WebGL field, spatial orbit, particle field, SVG morph, signal trace, and kinetic type.
- Scene choice is retrieval-led and inspectable. Six candidates are scored for semantic fit, first-view impact, performance, accessibility fallback, and distinctiveness; the response exposes the complete tournament rather than hiding a random template choice.
- The 120-recipe catalog now dispatches to 21 authored driver implementations. Framework adapters share lifecycle wiring, but no longer collapse every recipe into one generic fade behavior.
- External component code enters only through a provenance/license/SSRF quarantine boundary. An operator key is never accepted from or serialized to the browser.
- Signature: an inspectable motion field tied to product truth. The scene engine is selected because it explains the brief, not because an effect keyword was requested.
- Runtime support now means 25 agents passing install, rules discovery, MCP initialize handshake and safe uninstall.
- Catalog selection is certification-led: structural completeness, provenance, prose/token integrity, conformance and craft-ceiling evidence are all required.
