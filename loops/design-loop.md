# The Design Loop

The mandatory production process. Every deliverable — full page or single button — moves
through these stages. Stage depth scales with scope (a button gets minutes-equivalent,
a site gets the full ceremony), but **no stage is skipped**, because each stage exists to
catch a class of failure the others can't see.

```
RESEARCH → WIREFRAME → UI → REVIEW → ACCESSIBILITY → PERFORMANCE → SEO → REFACTOR → SCORE
   │                                                                            │
   └────────────────────── findings loop back (max 3 cycles) ◄─────────────────┘
```

## Stage contracts

### 1. RESEARCH (owner: ux-researcher)
**In:** the brief, project memory, sector file. **Out:** audience + one-reader sentence,
top jobs, page/section priority list (the eye-path source), conventions to honor, assumption
list. **Gate:** you can state in one sentence what this artifact must cause
(`brain/design-intelligence.md` intent).

### 2. WIREFRAME (owner: ui-designer, structure mode)
**In:** research out. **Out:** structure without surface — section order, composition choice
per section (named from `foundations/layout.md`), content hierarchy, eye path per screen,
the headline stack skeleton (with copywriter). **Gate:** the squint test passes *as boxes*;
the headline-only read makes the argument. Surface work before structure sign-off is wasted work.

### 3. UI (owner: ui-designer + motion-designer + copywriter)
**In:** approved structure. **Out:** the full surface — tokens applied, all states, all
breakpoints, motion specs, real copy (no lorem — ever). **Gate:** module checklists for
every routed component pass; the author's own audit (attention audit, squint, biases sweep)
is clean.

### 4. REVIEW (owner: creative-director)
Coherence, idea, brand-fit, courage-placement judgment. **Out:** SHIP / SHIP WITH FIXES /
REWORK + protected-elements list. Fixes fold back into stage 3 before proceeding — never
carried forward as "we'll fix it later."

### 5. ACCESSIBILITY (owner: accessibility)
The full audit protocol. **Out:** PASS or blockers. Blockers return to stage 3.
No "ship now, fix a11y later" exists in this system.

### 6. PERFORMANCE (owner: frontend-engineer)
Budget verification (`checklists/performance.md`): weights, CWV projections/measures,
animation cost, font/image discipline. **Out:** PASS or violations with fixes.

### 7. SEO (owner: seo — marketing surfaces; apps: skip with a stated reason)
Structure, metadata, structured data, crawlability (`checklists/seo.md`).

### 8. REFACTOR (owner: frontend-engineer)
The cleanup pass everyone else skips: token stragglers (grep for magic numbers/raw hex),
duplicate patterns extracted, dead styles removed, naming consistency, comment-what-can't-be-
seen only. **Gate:** the code reads as if designed, not accreted.

### 9. SCORE (owner: reviewer)
Six-dimension adversarial grading (`scoring/rubric.md`). ≥95 all dimensions → deliver
(with the Output Contract: artifact + scorecard + rationale + memory writes — kernel §6).
<95 → findings return to the appropriate stage.

## Loop discipline
- **Findings route to their stage:** a hierarchy problem goes back to WIREFRAME, not to a
  CSS patch. Fixing structure problems at the surface layer is how designs die of a thousand
  band-aids.
- **Max 3 score cycles.** Not converging means something upstream is broken (conflicting
  brief, missing assets, wrong scope) — escalate the cause to the user honestly instead of
  grinding (`agents/reviewer.md`).
- **Protected elements survive revisions:** the creative director's "don't lose this" list
  is checked after every loop-back.
- **Memory writes are not optional:** decisions (with reasons) → `design.md`/`brand.md`,
  status → `pages.md`, open items → `todo.md`, discovered defects → `bugs.md`. The loop
  isn't done when the artifact ships; it's done when memory reflects it.

## Scaled ceremony
| Scope | How the loop runs |
|---|---|
| Full site/page | every stage explicit, agents distinct (spawn if available) |
| Section/component | stages compressed but *answered* — one pass may cover 1–2 in a paragraph, 5–9 as checklist runs |
| Tweak to existing | stages 1–2 inherited from memory; 3 → 5/6 → 9 minimum |

The compressed form still ends with a score. Unscored work does not ship.
