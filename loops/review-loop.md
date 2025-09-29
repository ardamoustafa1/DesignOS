# The Review Loop

The standalone audit cycle — run on demand ("review this page"), on inherited/legacy work,
or as the recurring health check on a living project. Where the Design Loop *produces*,
the Review Loop *interrogates what exists*.

```
INVENTORY → CONTRACT CHECK → INSTANT-FAIL SWEEP → SIX-DIMENSION AUDIT
     → FINDINGS REPORT → (fixes) → RE-VERIFY changed surfaces only
```

## Stages

### 1. Inventory
List what's being reviewed: pages/screens, states, breakpoints, themes. Explicitly note
what's OUT of scope — an unreviewed surface must never be implied as passed
(no silent caps: coverage gaps are stated in the report).

### 2. Contract check
Reconstruct what this work was *supposed* to obey: the routed modules, the sector file,
project memory decisions. On legacy work with no memory: reverse-engineer the implicit
system (scales, tokens, patterns actually in use) and record it in `memory/design.md` —
the review's first gift is documentation.

### 3. Instant-fail sweep (`brain/quality-bar.md`)
The eight instant-fails, checked mechanically first. Grep-able ones get grepped
(`outline: none`, raw hex, magic numbers, missing alt/labels); visual ones get inspected
per breakpoint/theme. Hits cap dimensions at 60 immediately — this ordering stops
wasted fine-grading on failing work.

### 4. Six-dimension audit
`agents/reviewer.md` protocol against `scoring/rubric.md`, with the edge-attack doctrine:
states, 375px, dark theme, keyboard, reduced-motion, zoom. Specialists spawn where depth
demands: `accessibility` for stage-5-grade audit, `frontend-engineer` for implementation/
performance, `seo` for marketing surfaces.

### 5. Findings report
The filled `scoring/report-template.md` plus, for review-loop runs, a **prioritized fix
plan**: instant-fails → structural findings (things needing the Design Loop's early stages)
→ surface findings → advisories. Each finding costed roughly (trivial / hours / structural)
so the user can decide scope. New defects discovered → `memory/bugs.md` regardless of
whether they'll be fixed now.

### 6. Re-verify
After fixes: re-audit *changed surfaces + anything they touch* (a spacing-system fix
touches everything; a copy fix touches its section). Re-score only dimensions with changed
inputs; carry unchanged scores forward with their date. Full re-audit only when the fix
list was structural.

## Recurring health-check mode
On living projects, run quarterly or pre-launch:
- Drift detection: has the implemented product diverged from `memory/design.md` decisions?
  (New magic numbers, off-scale spacing, rogue colors — entropy is the default.)
- Rot detection: dead links, stale screenshots vs. current product, outdated claims/numbers,
  © year, dependency-related slowdowns.
- Memory sync: update `pages.md` statuses, prune done `todo.md` items, close fixed `bugs.md`.

## Discipline
- Reviewer never fixes what it grades in the same breath — findings first, fixes as a
  separate pass (self-graded fixes inherit the author's blind spots).
- Honesty over completeness theater: "not checked" is a valid and required label.
- The report's summary must be readable by the *client*, findings by the *builder* —
  two altitudes, one document (`scoring/report-template.md` handles this).
