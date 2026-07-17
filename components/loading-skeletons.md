# Loading Skeletons

Skeletons are promises about incoming content. If the promise does not match the final
layout, the product feels unstable.

## When To Use

Use skeletons for:

- page sections that load after shell chrome
- cards, tables, feeds, and dashboards
- known layout with unknown content
- waits longer than about 300ms

Avoid skeletons for:

- actions under 300ms
- unknown layout
- tiny inline operations where a button spinner is clearer
- blocking states where progress stages matter more

## Shape Rules

- Match final dimensions and spacing.
- Reserve media aspect ratios.
- Use varied line widths: title 40-60%, body 80-100%.
- Keep chrome real: nav, labels, and static controls should render immediately.
- Swap skeleton to content with zero layout shift.

## Motion

Default shimmer:

- 1.2-1.5s linear sweep
- low contrast
- no bright bands
- disabled under `prefers-reduced-motion`

For dense apps, static blocks often feel calmer than shimmer.

## Table Skeleton

```text
Header row: real labels when known
Rows: 5-8 placeholders
Cells: shape by content type
Status: small pill block
Actions: icon-size blocks
```

Do not skeletonize the entire viewport if only the table body is loading.

## Copy Pairing

Skeletons sometimes need text:

- "Loading incidents..."
- "Analyzing 1,240 rows..."
- "Importing customers..."

Use text when the wait has meaningful stages or anxiety.

## Anti-patterns

- Skeleton that changes size when content loads.
- Full-page spinner for app-shell data.
- Shimmer so bright it becomes the hero.
- Skeleton rows that imply data exists when permissions failed.
- Showing skeleton and error at the same time.

## Checklist

- [ ] Skeleton mirrors final layout
- [ ] No layout shift on swap
- [ ] Motion respects reduced-motion
- [ ] Scope matches the loading region
- [ ] Error and empty states are distinct from loading
- [ ] Long waits communicate stage or progress
