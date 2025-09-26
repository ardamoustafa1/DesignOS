# Data Tables

Tables are where B2B products are actually *used*. A great table feels like a tool;
a bad one feels like a spreadsheet screenshot.

## Principles
1. **Rows are the unit of thought.** Everything optimizes row scanability: alignment, height, hover, density.
2. **Columns earn width by information, not by title length.** The identifying column gets the space; metadata compresses.
3. **Alignment by data type:** text left · numbers right (tabular-nums, same precision) · dates left in one consistent format · actions right-pinned.
4. **The table is interactive furniture:** sort, filter, select, paginate are part of the design, not bolt-ons.

## Specs
```
Row height    44–48px comfortable · 36–40px dense (offer a density toggle for power users)
Cell padding  12–16px x · first column 16–24px from edge
Header        12–13px · 600 · caps or sentence-case muted · sticky on scroll
Divider       hairline rows (--border-default at ~60%) · no vertical rules unless truly matrix-like
Zebra         avoid; hover highlight does the job better (zebra + hover + selection = soup)
Hover         full-row --bg-surface tint · 100ms
Type          13–14px · values --text-primary · meta --text-secondary
```

## Column craft
- Identifying column: entity name + optional secondary line (avatar/email under name) — the anchor, always leftmost, often sticky-left on wide tables.
- Status: chips/badges (tinted bg + label + optional dot), consistent vocabulary, never color-only.
- Numbers: right-aligned, uniform precision, units in the header not per-cell ("Revenue ($)"), negative values with − sign and color+parens for finance.
- Truncation: single-line ellipsis + full value in tooltip; never wrap IDs; wrap only prose columns.
- Column widths: fixed for dates/status/numbers, fluid for names — table shouldn't reflow on data change.

## Interaction
- **Sort:** click header toggles asc/desc, arrow indicator on the active column only; default sort must be meaningful (recent first, usually).
- **Filter:** filter bar above table (chips for active filters, one-click clear-all); faceted dropdowns per column for complex data. Search filters as-you-type ≤300ms debounce.
- **Selection:** leading checkbox column (40px); header checkbox = select-page with "select all N" escalation banner; selected rows tinted; **bulk action bar** slides in (bottom or replacing filter bar) with count + actions.
- **Row actions:** ≤2 inline icon-buttons visible + ⋯ overflow; on hover-revealed actions keep them keyboard-reachable (visible on focus-within).
- **Row click:** if rows navigate, entire row is clickable (cursor + hover) and actions stop propagation; if rows don't navigate, no row-cursor lies.
- **Expansion:** chevron leading, expands detail panel in-place (250ms) — better than modal for compare-scan workflows.

## Pagination vs. infinite
- Work tables: pagination (25/50/100 selector, "1–25 of 1,204", page controls right) — users need positional memory.
- Feeds/exploration: infinite with sentinel loading + "back to top". Never infinite scroll above a footer users need.
- Virtualize >200 rows; keep scrollbar honest.

## States
- **Loading:** skeleton rows (same height, shimmering cells) ×5–8; sorting/filtering keeps stale data at 50% + spinner in header (no full-table flash).
- **Empty (no data yet):** onboarding empty state in the table body (`components/states.md`).
- **Empty (filters exclude all):** "No results for these filters" + clear-filters action — *different message than no-data*.
- **Error:** inline banner + retry, stale data preserved if any.

## Responsive strategy (decide, don't shrink)
1. **Priority columns:** drop tertiary columns under 1024/768 (define the priority list per table).
2. **Sticky identity + horizontal scroll:** for genuinely wide data — with edge-fade cue and sticky first column.
3. **Card transform:** each row becomes a key-value card under 640px — only for ≤6-field rows.
Never: font-size 10px to "make it fit".

## Accessibility
- Real `<table>` semantics (`<thead> <th scope>`), caption or aria-label naming the table.
- Sort buttons announce state (`aria-sort`); bulk bar focus-managed; row actions labelled per-row ("Delete invoice #1042", not "Delete").

## Anti-patterns
- Centered numbers · mixed date formats · vertical rules everywhere · 12 columns of equal width · actions column wider than data · tooltips hiding the only copy of critical info · checkbox selection with no bulk actions (why select?)

## Checklist
- [ ] Alignment by type; tabular-nums; uniform precision
- [ ] Sticky header; sensible default sort; active filters visible
- [ ] Selection → bulk bar; actions keyboard-reachable
- [ ] All four states designed (loading/empty/filtered-empty/error)
- [ ] Responsive strategy chosen deliberately
- [ ] Semantic table markup + aria-sort
