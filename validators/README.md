# Validators

Mechanical enforcement for the rules machines can check — so the review loop's attention
goes where judgment is needed. Zero dependencies (bash + node ≥18); wire them into CI or
run locally. They mechanize the refactor-loop's *measure* stage (`loops/refactor-loop.md`).

| Script | Checks | Fails on |
|---|---|---|
| `check-refs.sh` | DesignOS internal cross-references | broken module cross-references |
| `check-drift.js` | token discipline in a CSS/HTML codebase | raw hex outside token blocks, px values off the 4-grid, `outline: none` without replacement, `!important` |
| `contrast.js` | WCAG contrast ratio of a color pair | ratio below the threshold you pass |
| `check-token-contrast.js` | contrast of token-resolved color/background pairs declared in the same rule | pairs below 3:1 (hard) or 4.5:1 (flagged as large-text-only) |
| `check-a11y-basics.js` | static HTML accessibility tells | images without alt, inputs without labels, missing `<main>`/h1, div-onclick |

## Usage

```bash
# Inside DesignOS: verify the knowledge base itself
./validators/check-refs.sh

# Against your project:
node DesignOS/validators/check-drift.js ./src ./styles/tokens.css
node DesignOS/validators/contrast.js "#9a9fa8" "#1b1e24" --min 4.5
node DesignOS/validators/check-token-contrast.js ./src ./styles/tokens.css
node DesignOS/validators/check-a11y-basics.js ./dist/index.html
```

`check-token-contrast.js` exists because of eval Run 004: a page passed token discipline
with zero raw hex and still shipped a 3.14:1 badge, because tokens hide the values that
`check-drift.js` polices. Scope is honest — same-rule pairs only; inherited color over an
ancestor background needs a renderer. Passing it is a floor, not a contrast clearance.

Exit codes: `0` clean, `1` findings (CI-friendly). Output format: one finding per line,
`file:line  rule  detail` — pasteable straight into a review report
(`scoring/report-template.md` verification log).

## CI example (GitHub Actions)

```yaml
- name: DesignOS validators
  run: |
    ./DesignOS/validators/check-refs.sh
    node DesignOS/validators/check-drift.js ./src ./src/tokens.css
    node DesignOS/validators/check-a11y-basics.js ./dist
```

## What they deliberately DON'T do

Static checks can't judge hierarchy, taste, or honesty — a page can pass every validator
and still score 70. Validators clear the mechanical floor (`brain/quality-bar.md`
instant-fail sweep, automated); the six-dimension review still runs above them.
Conversely: a validator finding is never overridden by taste — fix it or record the
exception in `memory/design.md` with a reason.
