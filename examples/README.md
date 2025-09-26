# Examples — The Proof Gallery

Every page here was produced *by* DesignOS rules, for one coherent fictional product
(**Relay**, an incident-management tool) — deliberately: the shared token system across
four different surface types demonstrates the memory layer doing its job. Same brand
decisions (`memory/brand.md`-style: amber-signal accent, dark-first, mono-for-telemetry),
four different pattern stacks.

| Page | Demonstrates | Key modules |
|---|---|---|
| [showcase-relay.html](showcase-relay.html) | Marketing landing | `patterns/landing-pages.md`, `components/hero.md`, `psychology/persuasion.md` |
| [showcase-relay-dashboard.html](showcase-relay-dashboard.html) | App shell + data UI | `components/dashboard.md`, `tables.md`, `charts.md`, `navigation.md`, `badges-chips.md` |
| [showcase-relay-pricing.html](showcase-relay-pricing.html) | Pricing + FAQ | `patterns/pricing.md`, `components/tabs-accordions.md`, honesty doctrine |
| [showcase-relay-docs.html](showcase-relay-docs.html) | Docs three-panel shell | `patterns/docs-sites.md`, `components/code-blocks.md` |

The decision paper-trail for the landing page — including the two review failures the
loop caught before delivery — is in
[saas-landing-walkthrough.md](saas-landing-walkthrough.md).

## What to look for

- **Token discipline:** view-source any page — every value resolves to the same `:root`
  block; zero magic numbers (`foundations/design-tokens.md`).
- **States & a11y:** skip links, `focus-visible` rings, `aria-current`, semantic tables,
  reduced-motion collapses, chart text-alternatives.
- **The details tier:** copy buttons that copy *clean* commands, a billing toggle that
  never reflows the cards, status badges with dots (never color-only), tabular-nums on
  every number.
- **Restraint:** one accent, one gradient budget (spent nowhere — the plain dark surface
  won), one signature texture (mono telemetry).

## Viewing locally

```bash
cd DesignOS/examples && python3 -m http.server 4173
# → http://localhost:4173/showcase-relay.html
```
