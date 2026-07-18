# Golden: Fintech Dashboard

Use for CFO, controller, and risk dashboards.

## Load

- `components/dashboard.md`
- `components/data-density.md`
- `industries/fintech.md`
- `references/linear-style-app.md`

## Must Show

- dense but readable metrics
- audit trail and data freshness
- empty/error/partial states
- keyboard-friendly tables
- no fake compliance badges

## Failure To Catch

Decorative dashboard cards with equal visual weight and no decision path.

## Recorded Gate Result (2026-07-18)

```
designos review goldens/fintech-dashboard/index.html
Findings: 0 · Static risk floor: 100/100 (not a final design score)
Final design score: NOT ASSESSED (static gate only)
check-drift: clean · check-a11y-basics: clean · check-token-contrast: clean
```

Browser pass (maintainer, Chrome via local server): rendered at desktop + narrow
widths, zero horizontal overflow, interactive elements exercised (see the artifact's
own JS states). Hierarchy/taste review and Lighthouse remain NOT ASSESSED — the
honest ceiling of a static + manual pass.
