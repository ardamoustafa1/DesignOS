# Bugs

- No unresolved P1/P2 Mission 4 defect recorded as of 2026-07-29.
- Closed 2026-07-29: keyboard focus audit falsely reported animated skip links as obscured; keyboard audit now removes transition latency before geometry inspection.
- Closed 2026-07-29: mobile golden headers, inline links, table rows, toggles, and copy controls fell below the 44×44 target floor.
- Closed 2026-07-29: visually hidden captions and clipped line-box rounding produced clipping false positives.
- Closed 2026-07-29: Axe found a mobile CTA whose text became inaccessible and three
  scrollable golden regions without keyboard access; accessible names/focus paths were added.
- Closed 2026-07-29: the flagship golden used paragraph children inside a definition-list
  group; descriptions now use valid additional `dd` elements.
- Closed 2026-07-29: eleven P3 typography/copy advisories remained; the copy cadence,
  unnecessary eyebrow, and unearned Inter declarations were removed and strict mode is clean.
- Closed 2026-07-29: dashboard demo controls were inert. Filter, retry, hedge, and export
  actions now produce real state changes and AX-tree-verifiable status announcements.
- Closed 2026-07-29: browser evidence did not exercise text spacing, forced colors, task
  completion, announcement semantics, or interaction latency; all are now blocker rules.
- Closed 2026-07-30: motion adapter output contained framework placeholders and the
  framework matrix exercised only one generic control per stack. All recipe/stack
  combinations now compile and pass lifecycle browser conformance in both motion modes.
- Closed 2026-07-30: the README claimed zero dependencies and Architecture claimed the
  product had no runtime. Both are ledger-guarded against executable sources and stale
  claims now fail validation.
- Closed 2026-07-30: progress recipe transforms could shrink the conformance target below
  44×44. Fixtures preserve a safe hit area and recommend binding progress transforms to
  a non-interactive child in product integrations.
- Closed 2026-07-30: Live Director variants were preview CSS injection rather than source
  component variants. Transactions now transform component structure and rebuild/gate
  the mapped preview, with source restoration on rejection and rollback.
- Closed 2026-07-30: Motion Lab exposed simulation controls without browser attribution
  or temporal regression. CDP trace metrics and trajectory comparisons are now executable
  blockers with full/reduced-motion evidence.
- Closed 2026-07-30: internal child-process isolation was presented as independent
  evaluation. The property is now `isolatedRuleEval`; external evidence has a separate,
  fail-closed registry and verifier.
- Closed 2026-07-30: core npm distribution included tens of megabytes of golden evidence.
  Evidence now has a separate package builder and the core boundary is CI-enforced.
- Closed 2026-07-30: mutation testing exposed two ungoverned cases: missing intrinsic
  image dimensions and motion without an explicit reduced-motion contract. Both now have
  centralized rules, fixtures, isolated eval coverage, and real public-site fixes.
- Closed 2026-07-30: the shared motion controller exposed `run` but not the complete
  public contract requested by adapters. `play`, `update`, deferred `mount(target)`, and
  compiled state-graph snapshots now run through all framework fixtures.
- Closed 2026-07-30: Motion Lab omitted average FPS, worst frame, drop ratio, render
  counts, compositor status, input/settle/cancel timings, and cleanup evidence. The CDP
  report and lab UI now expose each field.
