# Design System Decisions

<!-- The living spec. Every value the project uses, with reasons. Tokens here are LAW
     for all future sessions (kernel conflict order: memory > modules). -->

## Scales
- **Type scale:** base 16px · ratio ____ · steps used: ____
- **Spacing:** 4-grid · section rhythm: mobile ____ / desktop ____
- **Radius:** sm ____ · md ____ · lg ____ · (language: sharp/soft/pill)
- **Elevation:** tier-1 ____ · tier-2 ____ · tier-3 ____ (shadow recipes or dark-surface steps)
- **Motion tokens:** durations ____ · easings ____ · character preset ____

## Token block (canonical CSS)
```css
:root {
  /* paste the project's actual :root block here — this is the single source */
}
```

## Signature Lock
<!-- Optional. Once the project has chosen a recurring signature (motion/signature-moments.md),
     record it here — one motif, not one per page. `node DesignOS/bin/designos.js
     signature-check <dir>` flags any page carrying evidence of a DIFFERENT signature
     technique with no documented `signature-override: <reason>` comment. Leave this
     section out entirely if the project hasn't earned or chosen a recurring signature yet. -->
- Technique: <one of the eleven ids in validators/signature-fingerprints.js, e.g. magnetic-button>
- Derivation: <the product truth this expresses — brain/wow-calibration.md style>
- Locked: <date>

## Composition decisions
- Container widths: prose ____ / marketing ____ / wide ____
- Hero variant chosen + reason:
- Grid conventions (card counts per breakpoint, gutters):
- Density mode (marketing/app surfaces):

## Component conventions
- Button radius/sizes/casing: · Primary-button placement convention (dialogs/forms):
- Card separation strategy (whitespace/tint/border/shadow):
- Table density default: · Responsive table strategy:
- Toast corner: · Modal widths used:

## Overrides (module rules deliberately broken)
| Date | Rule (module) | Override | Reason | Scope |
|---|---|---|---|---|

## Superseded decisions
<!-- strike through, point to replacement, keep the reasoning trail -->
