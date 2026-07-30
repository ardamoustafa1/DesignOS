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
