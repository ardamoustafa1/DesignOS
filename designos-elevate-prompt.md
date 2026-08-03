# DesignOS Elevation Prompt

Target: website/index.html
Surface detected: pricing
Required bar: every deterministic and creative dimension >= 97
Generated: 2026-08-03T06:51:30.933Z

## Load These Modules First

- `brain/quality-bar.md`
- `brain/originality.md`
- `references/stripe-level-marketing.md`
- `references/linear-style-app.md`
- `references/vercel-docs-style.md`
- `references/apple-product-page.md`
- `references/cybersecurity-dark-ui.md`
- `patterns/pricing.md` if present; otherwise use the closest pattern module.
- `loops/refactor-loop.md`
- `scoring/rubric.md`

## Mission

Refactor this UI from clean/competent to memorable, premium, and inspectable. Preserve the product intent, stack, and truthful claims. Do not redesign for novelty alone.

## Deterministic Gate Findings

No deterministic findings remain. The elevation work is now taste, hierarchy, product substance, and originality.

## Premium Elevation Findings

1. **cta-noise** — Detected 9 CTA-like phrases.
   Action: Collapse to one primary action and one secondary action per viewport.
2. **weak-rationale** — The page does not expose much product reasoning.
   Action: Add compact explanatory proof: why the architecture, pricing, workflow, or UX choice exists.

## Required Upgrade Moves

1. Create one signature vehicle derived from the product material, not decoration.
2. Make the first viewport communicate product, audience, and primary action within 3 seconds.
3. Add one inspectable product artifact: screenshot-like UI, workflow, data table, code sample, report, or demo state.
4. Reduce CTA noise to one primary and one secondary action per viewport.
5. Add real states: loading, empty, disabled, error, success, and keyboard focus where relevant.
6. Remove fake proof. Use sourced proof, transparent placeholders, or architecture/economic proof instead.
7. Tighten typographic rhythm, spacing hierarchy, and section contrast against `brain/quality-bar.md`.

## Forbidden Moves

- Do not add fake logos, fake testimonials, invented usage counts, invented compliance badges, or unsourced awards.
- Do not claim SOC2, ISO 27001, HIPAA, PCI, GDPR, FIPS, audited, or certified unless a real source is linked.
- Do not hide layout bugs with `overflow-x: hidden`.
- Do not add decoration that does not explain the product, data, workflow, or brand belief.
- Do not make every section the same card/grid rhythm.

## Final Verification

Run these before delivery:

```bash
node DesignOS/bin/designos.js review website/index.html --min 97
node DesignOS/bin/designos.js visual website/index.html --no-fail
node DesignOS/bin/designos.js report website/index.html --min 97 --no-fail
```

Deliver: changed files, scorecard, before/after rationale, remaining caveats, and memory updates.
