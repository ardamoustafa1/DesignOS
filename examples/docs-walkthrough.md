# Walkthrough: Relay Docs Quickstart

The decision trail behind [showcase-relay-docs.html](showcase-relay-docs.html).

## Routing
`patterns/docs-sites.md` + `components/code-blocks.md` + `tabs-accordions.md`
(language tabs) + `search-command.md` (the ⌘K affordance); brand from memory.

## The decisions that shipped
- **Three-panel shell:** 260px content-map sidebar (grouped Diátaxis-style: Getting
  started → Guides → Reference → Resources) · 720px reading column · 220px scrollspy
  TOC that collapses first on narrow screens (docs-sites.md shell spec, verbatim).
- **The quickstart IS the product demo:** numbered steps, ONE happy path, zero theory,
  each step ending in visible output — "your first context-briefed alert in under 10
  minutes" is a promise the page structure keeps.
- **Copy buttons copy CLEAN commands:** prompts (`$`) and output lines are separate
  spans excluded from the `data-copy` payload — paste-tested (code-blocks.md: "a pasted
  `$ npm install` fails and the user blames the product"). Button confirms with the
  canonical icon-swap 1.5s revert.
- **Command vs output distinguished:** prompt glyph muted and unselectable-styled,
  output dimmed — the terminal-block discipline.
- **Anchors are infrastructure:** every h2 has a hover-revealed `#` link and
  `scroll-margin-top` compensating the sticky bar; the TOC tracks via
  IntersectionObserver (scrollspy from the allowed set in motion/page-and-scroll.md).
- **Freshness + feedback + escape hatches:** "Updated Jul 2026 · ≈ 8 min" meta row,
  "Was this helpful?" + "Edit this page" footer, prev/next pagination — docs-sites.md's
  trust furniture, all present.
- **Language tabs** (CLI / relay.yaml / Terraform) rendered as proper `role="tab"`
  structure — and flagged honestly: in a real build the choice would persist globally
  via localStorage (the docs-rage rule); a static showcase can only model the markup.

## Register note
Docs voice is plain throughout — no marketing adjectives crossed the boundary
(docs-sites.md: "docs speak plainly or lose trust"). The one personality allowance:
"ends 2am archaeology," inherited from the brand's core claim.
