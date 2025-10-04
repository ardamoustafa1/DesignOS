# Workflow: New Project Kickoff

From zero to a scored first deliverable. Trigger: any brief for a new site/product.

## 1. Intake (don't design yet)
Extract from the brief — ask (or state assumptions per the 70% rule,
`brain/decision-framework.md`) for anything missing:
- Product in one sentence · sector (→ `industries/` routing) · audiences · the ONE behavior
  to cause · brand assets that exist · constraints (stack, timeline, legal) · references the
  client loves/hates.

## 2. Memory bootstrap
```bash
mkdir -p memory && cp DesignOS/memory/templates/*.md memory/
```
Fill `client.md` (incl. the one-reader sentence) and as much of `brand.md` as intake gave.
Missing brand decisions become the next step's output, not blanks to skip.

## 3. System definition (before any page)
Run the decision recipes (`brain/decision-framework.md`) + the color procedure
(`psychology/color-psychology.md` step list) + type pairing (`foundations/typography.md`)
+ motion preset (`motion/principles.md`). Output: the canonical `:root` token block and
scale decisions → `memory/design.md` + `memory/brand.md`, each with reasons.
**This step is the project's constitution — 30 minutes here saves every future session.**

## 4. IA & page plan (ux-researcher)
Page inventory with per-page intent + metric, nav structure, key flows with doubt-peaks
→ `memory/pages.md`. Client-visible checkpoint if the scope is large: confirm the plan
before production.

## 5. First deliverable through the full Design Loop
Highest-leverage page first (usually Home/Landing). Full ceremony
(`loops/design-loop.md`), all agents, scored to ≥95. This first pass also *stress-tests
the system* — token gaps found here get fixed in `design.md`, not patched locally.

## 6. Deliver per the Output Contract (kernel §6)
Artifact + scorecard + rationale + memory writes. Then `pages.md` status advances and
`todo.md` holds the queue.

## Subsequent pages
Inherit stages 1–2 from memory; loop stages 3→9 per page; the system means each page gets
*faster and more consistent* — if a page fights the system, the refactor loop
(`loops/refactor-loop.md`) arbitrates whether the system or the page is wrong.
