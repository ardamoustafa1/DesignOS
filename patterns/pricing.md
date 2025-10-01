# Pricing Pages

The pricing page is where interest becomes intent. Users arrive with two questions —
*"can I afford this?"* and *"which one am I?"* — and every design decision either answers
or obstructs them.

## Principles
1. **Three tiers, one recommended.** Two feels like a trap, four+ is a homework assignment (`psychology/cognition.md` Hick's law). Enterprise "Contact us" may stand as a visually-lighter fourth.
2. **The page identifies the buyer, not just the price.** Tier names + one-line "for whom" descriptors do more than feature lists ("For solo founders" / "For growing teams" / "For compliance-heavy orgs").
3. **Total honesty is the conversion strategy.** Surprise costs at checkout refund themselves as churn and chargebacks.

## The tier card (`components/cards.md`)

```
Tier name        18px 600 — human names ok (Starter/Pro/Scale), cute names cost clarity
For-whom line    13–14px muted — the self-identification hook
Price            36–48px 700 tabular · currency smaller · "/seat/mo" muted adjacent
Billing note     13px — "billed annually" + monthly-price transparency
CTA              full-width in card · recommended tier = solid primary, others = outline
Feature list     "Everything in X, plus:" inheritance pattern · 5–8 lines · ✓ icons accent
                 tooltips for jargon features (ⓘ) — never a mystery feature name alone
```

### The recommended tier
- Marked by: accent border (1–2px) + "Most popular" chip + slight elevation/scale (1.02–1.04) — **not** an inverted background that tanks feature-list contrast.
- Which tier: the one you *want* to sell — anchored by the tier above it (`psychology/persuasion.md` anchoring). Center position when three across.

## Billing toggle
- Monthly/Annual switch above the cards; annual discount stated as both % and money ("Save 20% — 2 months free").
- Prices crossfade on toggle (200ms), cards must NOT reflow/jump; the toggle state must be unmissable (active side solid).
- Default to annual (honest default: it's cheaper for them, better for you) with monthly one click away.

## Feature comparison table
- Below the cards, collapsed or secondary — the cards sell, the table verifies.
- Sticky first column (feature names) + sticky tier header row; group rows by category with section headers; ✓ / — / value cells (never ✗ red — absence isn't error); highlight the recommended column subtly.
- Mobile: tier-picker tabs above a single-column list beats a pinch-zoom table (`components/tables.md` responsive doctrine).

## Trust infrastructure (doubt peaks here — `psychology/persuasion.md`)
- Directly under cards: risk reversal line ("14-day free trial · No credit card · Cancel anytime").
- Money-back guarantee: badge + plain-language terms link.
- One testimonial *about value/price* ("Paid for itself in the first week") — not generic praise.
- Security/compliance chips for B2B (SOC2, GDPR) near the Enterprise tier.
- FAQ tuned to pricing objections: proration, seat changes, what happens on downgrade, invoice/PO for enterprise, VAT.

## Special models
- **Usage-based:** interactive calculator (slider → live price, tabular-nums, 200ms count) + worked examples ("A team like yours: ~$240/mo"); always show the cap/estimate story — usage anxiety kills adoption.
- **Free tier:** present as a real tier with its genuine limits stated (not "Free forever*"); its CTA is the page's volume winner — make it primary-adjacent, not hidden.
- **Enterprise:** lighter visual weight, value bullets (SSO, SLA, DPA), CTA "Talk to sales" + what-happens-next microcopy.
- **Single-price products:** one big confident card + what's-included + guarantee; resist inventing fake tiers.

## Currency & localization
- Auto-detect currency with manual override; round localized prices to market-natural points (₺999, not ₺1,037.42); state tax inclusion policy per region.

## Anti-patterns
- Hidden prices for self-serve products ("Contact us" for a $29 tool = bounce)
- 40-row feature lists on cards (cards sell outcomes; tables hold inventory)
- Fake anchor tiers nobody can buy; fake "was $99" strikethroughs
- Toggle defaulting to annual while *displaying* monthly math without saying so (dark pattern)
- Recommended-tier styling so heavy other tiers look disabled
- Downgrade/cancel paths absent from FAQ (procurement checks this)

## Checklist
- [ ] 3 tiers + for-whom lines; one honest recommendation, properly anchored
- [ ] Price typography: big, tabular, unit-clear, billing-transparent
- [ ] Toggle: no reflow, savings stated both ways, honest default
- [ ] Risk reversal under cards; pricing-specific proof + FAQ
- [ ] Comparison table: grouped, sticky, mobile strategy chosen
- [ ] Zero surprise costs anywhere on the path
