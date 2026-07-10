# Dashboards

A dashboard is a decision instrument, not a data dump. Every widget must answer a question
someone actually asks — "is anything wrong?", "are we on track?", "what needs me today?"

## Principles
1. **Answer-first hierarchy.** The top row answers the #1 question at a glance; drill-down deepens below. Layout order = question priority.
2. **Density is a feature, calm is the constraint.** Pack information, not decoration. High data-ink ratio: every pixel either informs or separates.
3. **Numbers are the typography.** Tabular-nums, consistent precision, units always, deltas always contextualized (vs. what period?).
4. **The empty and loading states ARE the dashboard** for new users (`components/states.md`) — design them with equal care.

## Shell
- Sidebar (240–280px) + topbar (search ⌘K, notifications, user) + content (`components/navigation.md`).
- Content padding 24–32px; grid gap 16–24px; page title row with timeframe selector at the
  reading-end edge (`inset-inline-end`, not literally "right" — under RTL the sidebar and
  this selector both flip to the opposite physical side: `foundations/rtl-i18n.md`).

## Widget taxonomy & specs

### Stat cards (KPI row)
```
Label   12–13px caps muted        "MONTHLY RECURRING REVENUE"→ prefer "MRR" if audience knows it
Value   28–36px · 600 · tabular   "$48,210"  — abbreviate consistently ($48.2K) per card set
Delta   chip: ▲ 12.4% + color + "vs last month" · never color-only
Spark   optional 40px-high sparkline, no axes
```
3–5 per row. The delta's *good direction* depends on the metric (▼ churn is green) — encode semantics, not sign.

### Charts (with the `dataviz` discipline)
- Chart type by question: trend→line, composition→stacked bar (not pie beyond 3 slices), comparison→bar, distribution→histogram, relationship→scatter.
- Series colors from a designed categorical ramp; ≤6 series then group "other".
- Axes: muted 12px, gridlines y-only at 6–8% opacity, no chart borders, no 3D ever.
- Tooltips: shared-x crosshair for time series; value + delta + date; 150ms fade.
- Legends: only when >1 series; direct-label lines when ≤3.

### Tables → `components/tables.md`
### Activity feeds
- Icon-typed rows, relative timestamps ("2h ago", title attribute holds absolute), actor + verb + object copy, group by day after 24h. Cap at 8–10 with "View all".

## Layout patterns
- **Overview page:** KPI row → primary trend chart (8 cols) + breakdown (4 cols) → table/feed row.
- **Grid discipline:** widgets share row heights per band; `grid-template-areas` for the reflow story (`foundations/grids.md`).
- Widget anatomy: header (title 14px 600 + optional info tooltip + overflow menu ⋯) / body / optional footer link. Header height uniform across all widgets.

## Interaction
- Timeframe switch animates data, not layout (250ms value transitions; no full-widget skeleton flash on refetch — keep stale data with a subtle refresh indicator).
- Cross-filtering (click a bar → filters the table): show an active-filter chip row, one-click clear.
- Auto-refresh: silent, with "Updated 30s ago" — never a jarring reflow mid-read.
- Customization (if offered): drag handles appear on an explicit "Edit layout" mode, not always-on jiggle.

## Color discipline
- Surfaces neutral; color belongs to *data* and *state*. A dashboard where chrome competes with charts is unreadable.
- Semantic thresholds (red/amber/green) need defined boundaries and a legend; ambient redness causes alarm fatigue.
- Dark mode is the natural habitat for ops/dev dashboards — elevation by surface lightness, chart colors desaturated ~10% (`foundations/colors.md`).

## Real-time & alerting dashboards (ops, security, trading)
- State banner at top: one glanceable system status ("All systems operational" / incident bar).
- Anomalies announce themselves: threshold-crossed widgets get border/glow treatment, `aria-live` for critical alerts.
- Refresh cadence visible; timestamps absolute in incident contexts (audits need "14:32:07", not "just now").

## Anti-patterns
- Pie charts for >3 categories; gauges for anything (a number + delta beats a speedometer)
- 12 KPI cards of equal weight (nobody's first question has 12 answers)
- Decorative gradients inside chart fills; rainbow categorical palettes
- Spinners replacing entire widgets on every refetch
- "Last 30 days" default when the business runs weekly — defaults must match the review cadence
- Numbers without comparison (48,210 of *what*, vs *when*, is it *good*?)

## Checklist
- [ ] Top row answers the #1 user question; layout = question priority
- [ ] tabular-nums everywhere; units + comparison on every number
- [ ] Chart types match questions; palettes designed; no color-only meaning
- [ ] Loading = skeletons mirroring layout; empty = onboarding, error = retry per widget
- [ ] Timeframe scope unambiguous; refresh non-disruptive
- [ ] Keyboard: widget focus order logical; charts have accessible data alternatives (table toggle or aria summary)
