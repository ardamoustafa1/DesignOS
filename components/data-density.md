# Data Density

Data-heavy products fail when they look either starved or suffocated. Density is a
product decision: how much work can a user safely do per screen?

## Density Modes

| Mode | Use | Rules |
|---|---|---|
| Comfortable | default SaaS, mixed users | 44-52px rows, clear grouping |
| Compact | expert dashboards, operations | 32-40px rows, stronger separators |
| Spacious | marketing/admin hybrids | 56-72px rows, more explanation |

Let users choose compact mode only when the product is used repeatedly. Do not default
new users into spreadsheet density.

## App Shell Rhythm

- Header chrome should not steal vertical space from the work area.
- Sidebars: 240-280px comfortable, 64-80px collapsed icon rail.
- Tables: row height maps to task risk. Financial approvals need more room than log rows.
- Cards in dashboards should align to a grid and share baseline rhythm.

## Information Hierarchy

Use density to make scanning easier:

- primary metric: bigger, tabular numerals
- secondary context: muted, not tiny
- status: badge/chip with color + text
- row actions: visible on hover/focus, but critical actions always discoverable
- filters: compact chips once applied

## Responsive Density

Mobile is not "same table, smaller text."

- choose top 3-5 columns
- move secondary fields into expandable row detail
- keep actions reachable with thumb zones
- avoid horizontal scroll unless the content is inherently tabular and expert-facing

## Failure Signals

- users zoom out to see more rows
- users export to CSV because the UI cannot compare
- every dashboard card has the same visual weight
- key actions only appear on hover, breaking touch and keyboard

## Anti-patterns

- Landing-page spacing inside operational tools.
- 12px body text used to fake density.
- Hiding important columns to preserve a decorative card grid.
- Hover-only controls with no focus equivalent.
- Color-only status in dense tables.

## Checklist

- [ ] Density mode chosen for audience and task frequency
- [ ] Row height and typography support scanning
- [ ] Critical actions available on keyboard and touch
- [ ] Mobile column strategy defined
- [ ] Status uses text plus color
- [ ] Dashboard cards have clear priority, not equal weight
