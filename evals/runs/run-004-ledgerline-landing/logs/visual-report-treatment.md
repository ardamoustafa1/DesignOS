# DesignOS Visual QA

Target: evals/runs/run-004-ledgerline-landing/treatment/index.html
Generated: 2026-07-18T08:47:53.622Z

## Browser Pass

**NOT RUN.** Playwright unavailable — no screenshots exist and no viewport was rendered.
Every viewport row below is therefore **UNVERIFIED**. Reporting any of them as
"inspected", "verified", or "CLEAN" without running this pass is fabrication
(`workflows/final-gate.md`). Install Playwright (`npm i -D playwright && npx playwright install chromium`) and rerun.


## Static Visual Risk Findings

- **P3 / overlap-risk** — Absolute/transform/nowrap usage present; inspect mobile screenshots for overlap.

## Manual Viewports

An unchecked box means UNVERIFIED — report it as unverified, never as inspected.

- [ ] 375px mobile
- [ ] 768px tablet
- [ ] 1024px laptop
- [ ] 1440px desktop
- [ ] Keyboard-only path
- [ ] Reduced-motion mode
