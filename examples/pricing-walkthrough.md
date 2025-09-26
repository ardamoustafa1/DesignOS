# Walkthrough: Relay Pricing

The decision trail behind [showcase-relay-pricing.html](showcase-relay-pricing.html).

## Routing
`patterns/pricing.md` + `components/cards.md` + `buttons.md` + `tabs-accordions.md`
(toggle, FAQ) + `psychology/persuasion.md`; brand from memory.

## The decisions that shipped
- **Three tiers, for-whom lines first.** Each card answers "which one am I?" before any
  feature list ("For teams who page each other and want to page less") — pricing.md's
  self-identification hook.
- **The recommended tier is marked, not shouting:** accent border + "Most popular" chip
  + raised surface — NOT an inverted background (the rule exists because inverted cards
  tank feature-list contrast). Enterprise deliberately ghost-buttoned and lighter: it
  anchors Pro without competing (persuasion.md anchoring).
- **The billing toggle never reflows the cards.** Prices swap via data-attributes on a
  fixed layout; the annual default is the honest default (cheaper for them), with
  monthly one click away and both prices always stated ("$23 billed annually · $29 if
  monthly") — the anti-dark-pattern line pricing.md demands.
- **Risk reversal at the doubt peak:** directly under the cards — trial length, no card,
  cancel-with-export. The one testimonial is about VALUE ("paid for itself"), not
  generic praise (persuasion.md: proof matched to the page's anxiety).
- **FAQ answers the real objections:** trial-end consequences, proration mechanics,
  downgrade behavior, per-incident-fee fear ("profiting from your bad days" — the
  sector-honest answer), invoice/PO. Multi-open accordions (users compare answers),
  native `<details>` for free semantics.
- **"$0 forever"** is presented as a real tier with true limits — no "Free*" asterisk
  theater.

## Numbers craft
All prices tabular-nums; the unit ("per seat / month") adjacent and muted; savings
stated both ways ("Save 20% — 2 months free") per the toggle spec.
