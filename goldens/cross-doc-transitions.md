# Golden: Cross-Document View Transitions

The newest technique in `motion/page-and-scroll.md` and `motion/signature-moments.md`, made
real. Every other multi-page pattern in this repo's examples treats navigation as a hard
cut; this golden is the first to demonstrate the `@view-transition { navigation: auto; }`
at-rule — full-page continuity with zero JavaScript, zero client-side router, and zero
fallback code (unsupported browsers simply navigate normally).

## Brief

> Waypoint, a fictional release-planning tool. Three teams' release plans on a list page;
> click one to see its timeline. The product's truth is continuity — you're looking at the
> same plan, just zoomed in — so the brand mark in the header should visibly persist across
> the navigation instead of flashing away and back.

Fictional product, clearly labelled as such (`PROOF_STANDARD.md`) — no real company,
customers, or metrics.

## Artifacts

- [`cross-doc-transitions/index.html`](cross-doc-transitions/index.html) — the plan list.
- [`cross-doc-transitions/plan-detail.html`](cross-doc-transitions/plan-detail.html) — one
  plan's timeline, reached by clicking a card.

Open `index.html` in a browser that supports the API (Chrome 126+) and click a plan: the
green "W" mark in the header stays visibly anchored while the rest of the page cross-fades
underneath it — a real, working demonstration, not a mockup of one.

## The mechanism

```css
@view-transition { navigation: auto; }
.brand .mark { view-transition-name: waypoint-mark; }   /* identical on BOTH pages */
@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }
```

That is the entire implementation. No `document.startViewTransition()`, no router, no
JavaScript at all — this is the cross-document variant of the API
(`motion/page-and-scroll.md` "Cross-document View Transitions" section), distinct from the
SPA `document.startViewTransition()` variant `motion/signature-moments.md` §10 already
documented. `waypoint-mark` is the **only** named element on either page — the scarcity
law applies here exactly as it does to in-page signatures: name a small handful of
elements, not the whole layout, or every element becomes its own competing transition
group.

## Why two separate pages, not one SPA

The brief's truth — "you're looking at the same plan, just zoomed in" — could also be
expressed with a client-side router and the SPA View Transitions API. This golden
deliberately uses two real, separately-served HTML documents instead, because that is the
more common real-world case this technique was built for: a documentation site, a
marketing site, a blog with a post-list-to-post-detail flow — anything that is not already
a client-side-routed app. Reaching for a router just to get this effect would be the
`ui-styling`-for-cross-doc-transitions equivalent of importing a 40KB library for a 150ms
hover state — a decision this repo's own `motion/recipes.md` anti-patterns section warns
against for a different technique but the same reason.

## Recorded gate result (2026-07-30)

```
node validators/check-motion.js           goldens/cross-doc-transitions  → clean
node validators/check-drift.js            goldens/cross-doc-transitions  → clean
node validators/check-a11y-basics.js      goldens/cross-doc-transitions  → clean
node validators/check-aesthetic-slop.js   goldens/cross-doc-transitions  → clean
node validators/check-token-contrast.js   goldens/cross-doc-transitions  → clean
node validators/check-registry.js         goldens/cross-doc-transitions  → clean
node validators/check-motion-gaps.js      goldens/cross-doc-transitions  → 0 candidates
```

**Final design score: NOT ASSESSED.** No `designos review` run and no adversarial panel
ran against these files (`workflows/final-gate.md` — DEGRADED, single-context review). The
validator results above are quoted, not interpreted.

## Must show

- both pages carry the identical `view-transition-name` on the identical element
- `prefers-reduced-motion` collapses the transition to a plain navigation, not just a
  faster one (`navigation: none`, not a shorter duration)
- exactly one named element per page — the mark, not the header, not the whole layout
- the timeline conveys real state (done / active / pending) through shape and color
  together, never color alone
- keyboard focus reaches both the brand mark's link and every plan card without a mouse

## Known gaps

- Browser support is real but not universal (Chromium-based browsers as of this writing;
  Safari and Firefox do not yet implement cross-document view transitions). The page
  degrades to a plain, correct navigation everywhere else — but that degradation has not
  been manually verified in this pass, only reasoned from the spec's documented behavior.
- No Lighthouse run and no cross-browser screenshot evidence — this golden's claim is
  about the mechanism (`@view-transition` wiring), not a measured performance or visual
  regression baseline the way `flagship-launch` carries one.
