# Grids

## Principles
1. **The grid is invisible until it's broken.** Users can't name it, but they feel every violation.
2. **12 columns for marketing, regions for apps.** Different jobs, different systems.
3. **Break the grid on purpose, once.** A deliberate full-bleed or overhang is a designed moment; two accidental ones are sloppiness.

## Marketing grid

```
Desktop:  12 col · 24–32px gutter · 1140–1200px container
Tablet:   12 col (compose in 6s) · 24px gutter
Mobile:   4 col · 16px gutter · 16–24px margins
```

Standard occupancies: text block 5–6 cols, hero visual 6–7 cols, card trio 4+4+4,
feature quad 3+3+3+3 (desktop) → 6+6 (tablet) → stack (mobile), prose 8 centered (or 6 offset-left + 2 col margin notes).

## Application grid
- Shell: fixed sidebar (240–280px) + fluid main; main content uses an *internal* 12-col or CSS grid areas.
- Dashboards: CSS Grid with named areas; cards span areas — `grid-template-areas` beats manual spans for reflow sanity.
- Keep a **baseline rhythm** vertically: rows of cards share top edges; mixed-height cards must resolve to aligned rows at least every other row, or use masonry *only* for genuinely uniform content (galleries).

## CSS implementation

```css
/* Marketing sections */
.section-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gutter, 32px);
}
/* Auto-fit card walls (equal-importance content only) */
.card-wall {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
/* Full-bleed child inside a contained parent */
.bleed { width: 100vw; margin-inline: calc(50% - 50vw); }
```

- `auto-fit + minmax` for card walls; explicit spans when hierarchy exists.
- Subgrid for aligning card internals (title/body/footer rows) across a row — the difference between 90 and 95 in card design.
- Never nest containers-with-padding inside containers-with-padding (compound gutters).

## Bento grids (the modern feature wall)
- One hero cell (2×2), supporting cells 1×1/2×1; total 5–7 cells.
- All cells share radius, padding scale, and internal alignment rules.
- Each cell needs a *visual* (mini-demo, icon composition, metric) — a bento of text paragraphs is a table wearing a costume.
- Reflow: hero cell first on mobile, then supporting in importance order.

## Vertical grid
- Baseline unit 4px (with the spacing scale); section boundaries land on the rhythm.
- Adjacent columns: align *first baselines*, not box tops (or use consistent heading sizes so tops work out).

## Anti-patterns
- 5 equal columns of anything on desktop (unreadable at card minimums; use 3+2 rows or a slider)
- Masonry for content with hierarchy
- Grid gaps smaller than card internal padding (cards read as merged)
- Centering a 7-col asymmetric composition (asymmetry needs an anchor edge)
- Different gutters in adjacent sections without a boundary cue

## Checklist
- [ ] Declared grid per region; every element snapped
- [ ] Card internals aligned across rows (subgrid or fixed zones)
- [ ] ≤1 deliberate grid break per page
- [ ] Reflow order = importance order at every breakpoint
- [ ] Gutters ≥ consistent, from the spacing scale
