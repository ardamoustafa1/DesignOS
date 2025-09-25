# Charts & Data Visualization

A chart is a sentence about data. If the reader can't state that sentence in five seconds,
the chart failed — no matter how beautiful. This module is the component-level spec;
question-first dashboard composition lives in `components/dashboard.md`.

## Chart choice = question type (never decoration)
| Question | Chart | Notes |
|---|---|---|
| How did X change over time? | line / area | area only when volume/cumulation matters |
| How do categories compare? | horizontal bar | horizontal = labels stay readable |
| What's the composition? | stacked bar | pie ONLY ≤3 slices + one obvious winner |
| How is X distributed? | histogram / box | |
| Do X and Y relate? | scatter | add trend line only with honest fit |
| Part-of-whole over time? | stacked area | ≤4 series or it's mud |
| Single KPI vs target? | number + delta (+ spark) | NOT a gauge |
| Flow between states? | sankey (rare, earned) | |

When two chart types both work, choose the one with fewer dimensions. Nobody ever
complained a chart was too easy to read.

## Visual spec
```
Palette     designed categorical ramp (≤6 + "other") from brand-adjacent hues, dark-theme
            variants desaturated ~10% (foundations/colors.md) · sequential/diverging ramps
            perceptually uniform — NEVER rainbow
Gridlines   y-only · 6–8% opacity · no chart border/box · zero axis line weight inflation
Axes        12px muted labels · abbreviated smartly (1.2K, Mar, '25) · y starts at ZERO for
            bars (always) · lines may zoom with a visible axis-break cue
Series      2.5px lines · dots only on hover/sparse data · bars radius 2–4px top,
            gap ≥ 30% of bar width
Type        tabular-nums everywhere · title = the FINDING ("Churn down 12% since March"),
            not the metric name ("Churn Rate Chart")
```

## Interaction
- **Tooltip:** shared-x crosshair for time series (all series at that x, sorted by value);
  value + series + date; 100ms fade; keyboard-reachable equivalents (see a11y).
- **Legend:** only >1 series; direct-label lines when ≤3 (legend forces eye ping-pong);
  legend items toggle series (opacity 0.2, not removal — keep scale context).
- **Hover focus:** dim siblings to 40% when hovering one series — the comparison tool.
- **Zoom/brush:** earned by genuinely long series; always with a reset affordance.
- Data updates: morph 250ms; entrance draw-in once, never on refresh
  (`motion/micro-interactions.md` data rules).

## Honesty rules (violations are Conversion-dimension instant-fails)
- Bar charts start at zero. Truncated bar axes manufacture drama — that's chart fraud.
- Consistent y-scales across side-by-side comparisons of the same metric.
- No dual y-axes without heroic justification (two charts beat one lie).
- Show absent data as *gaps*, not interpolated fiction; label projections vs. actuals.
- N is visible when small ("based on 23 responses") — smoothed small-N curves deceive.
- 3D: never. Not once. Not for the pitch deck.

## Accessibility (charts are the most-failed a11y surface)
- Color-only series differentiation is banned: vary dash/marker/direct-label too.
- Every chart: text alternative — a one-sentence `aria-label` finding + a data-table
  toggle (or `<table>` in a details element) for the full numbers.
- Interactive points keyboard-reachable (roving focus along series) or the table IS the
  keyboard path — declare which.
- Contrast: series vs background ≥3:1; gridlines may be faint, data may not.

## Empty/loading/error
- Loading: skeleton of the chart's *shape* (axis lines + ghost bars), no spinner-in-void.
- Empty: "No data for this range" + range-widening action — distinguish from zero
  (a flatline at 0 is DATA; absence is not; never render absence as zero).
- Partial: render what arrived, mark the gap (`components/states.md` partial doctrine).

## Sparklines
40–60px tall, no axes, no gridlines, one series, current-value dot at end — trend
*texture* next to a number, never a readable chart. If someone needs values, it graduates
to a real chart.

## Anti-patterns
Gauge charts · pie charts with 7 slices + legend on another continent · gradient-filled
bars (data ≠ decoration) · animated perpetual redraws · legends for single series ·
smoothed lines hiding real volatility (`curveMonotone` on financial data misleads) ·
axis labels rotated 90° (flip the chart horizontal instead)

## Checklist
- [ ] Chart type answers the stated question; title states the finding
- [ ] Palette designed, dark-variant exists, ≤6 series, color+shape differentiation
- [ ] Zero-based bars, honest scales, gaps ≠ zeros, N visible when small
- [ ] Tooltip/legend/hover per spec; keyboard + table alternative + aria finding
- [ ] Loading/empty/partial designed; entrance animates once only
