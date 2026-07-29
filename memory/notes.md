# Notes

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
- Independent eval ledger: 36/36 rule IDs passed isolated static, browser, Lighthouse, and
  pixel black-box runs. Capability coverage reports 36/36 fixtures, automated engines,
  golden evidence, and independent evaluations with no remaining row gap.
- Final Lighthouse CI-lab run: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 113.671ms, CLS 0, TBT 0, provided throttling.
- Dependency audit after adding Lighthouse 13.4.1: 0 vulnerabilities.
- GitHub branch protection API verification: `main` uses strict required status checks
  `browser-gate-required` and `golden-pixel-required`, with admin enforcement enabled.
- Final link sweep: 26 unique URLs across 252 files, clean; four intentionally skipped by
  fast-mode policy.
