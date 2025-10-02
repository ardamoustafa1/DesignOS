# Design Review Report

> Copy this template for every scored deliverable. Fill every field — "NOT ASSESSED"
> is valid, blank is not. File the completed report with the deliverable and log the
> scores line in `memory/notes.md`.

---

## Summary (client-readable)

**Deliverable:** <what was built/reviewed — page, component, site>
**Date / cycle:** <date> · loop cycle <1/2/3>
**Scope reviewed:** <surfaces, breakpoints, themes covered>
**Not reviewed:** <explicit exclusions>

**Verdict:** ☐ SHIP ☐ RETURN TO LOOP ☐ ESCALATED

| Dimension | Score | Gate |
|---|---|---|
| UI Craft | /100 | ≥95 |
| UX & Flow | /100 | ≥95 |
| Accessibility | /100 | ≥95 |
| Performance | /100 | ≥95 |
| Modernity | /100 | ≥95 |
| Conversion | /100 | ≥95 |

**One-paragraph assessment:** <the design's idea, its strongest quality, its weakest, in plain language>

**Instant-fail sweep:** ☐ clean ☐ hits: <list — these capped dimensions at 60>

---

## Findings (builder-readable)

Ordered: instant-fails → largest score impact → cheap wins. Every finding follows the form:
**element → violated rule (module citation) → concrete fix**.

### Blocking (must fix before ship)
1. <finding>

### Serious (costs the score, fix this cycle)
1. <finding>

### Advisory (post-ship improvements, → memory/todo.md)
1. <finding>

### Protected (creative director: do NOT lose in revision)
- <element/quality to preserve>

---

## Verification log

| Check | Method | Result |
|---|---|---|
| Contrast sweep | <tool/manual> | |
| Keyboard walk | manual | |
| Lighthouse | <run/projected/not assessed> | LCP · CLS · INP · scores |
| Breakpoints | 375 / 768 / 1024 / 1440 | |
| Themes | light / dark | |
| Reduced motion | emulated | |
| States matrix | loading/empty/error/success | |

---

## Loop routing

- Findings returning to WIREFRAME (structural): <list or none>
- Findings returning to UI (surface): <list or none>
- Findings for REFACTOR: <list or none>

## Memory writes completed
- ☐ design.md (decisions/overrides) ☐ pages.md (status) ☐ todo.md (advisories)
- ☐ bugs.md (defects found) ☐ notes.md (scores line)
