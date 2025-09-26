# Walkthrough: Relay Dashboard

The decision trail behind [showcase-relay-dashboard.html](showcase-relay-dashboard.html) —
condensed to the calls that shaped it.

## Routing
`components/dashboard.md` + `tables.md` + `charts.md` + `navigation.md` +
`badges-chips.md` + `states.md`; brand inherited from the landing page's memory
(amber accent, dark-first, mono telemetry).

## The decisions that shipped
- **Top row = the #1 question.** Operators ask "are we OK and getting better?" —
  so the KPI row leads with Open Incidents and MTTR, deltas contextualized ("vs last
  week"), semantics encoded per metric: ▼ MTTR is GREEN (dashboard.md: good-direction
  depends on the metric; a naive sign-color mapping would paint improvement red).
- **Chart title states the finding** ("MTTR is trending down — 7-day view"), not the
  metric name (charts.md title doctrine). Two series differentiated by color AND
  dash pattern — the color-only ban made mechanical. Y-gridlines at 6% opacity, no
  chart border, SVG carries a one-sentence `aria-label` finding.
- **Sidebar selection is unmistakable:** accent-subtle fill + accent text
  (navigation.md: "not just a text color change"); count badge on Incidents is
  needs-action only (badges-chips.md count rules).
- **Table discipline:** IDs in mono, numbers right-aligned tabular, status chips with
  dots (never color-only), full-row hover, `<th scope>` semantics, horizontal-scroll
  container with `tabindex="0"` (tables.md responsive strategy #2).
- **Timeframe segmented control** applies instantly (input semantics, not buttons —
  tabs-accordions.md), and its scope governs everything below.
- "Updated 24s ago" + "All systems operational" pill: refresh-honesty and the ambient
  status signal (dashboard.md real-time doctrine).

## What the review pass caught
A CSS cascade bug: the ≤900px media query's `.sidebar { display: none }` was defeated
by the later-in-source base rule (same specificity) — sidebar rendered full-width on
narrow viewports. Fixed by raising specificity (`.shell .sidebar`). Logged here because
it's the exact class of bug `checklists/responsive.md`'s width-matrix test exists to
catch: it WAS caught in the browser, at 577px, not in theory.
