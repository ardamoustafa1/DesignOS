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
