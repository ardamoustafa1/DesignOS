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
