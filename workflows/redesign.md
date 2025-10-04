# Workflow: Redesign

Improving something that exists — where the killer mistake is redesigning what worked.
Trigger: "redesign X", "modernize our site", "this page underperforms".

## 1. Autopsy before surgery
Run the Review Loop (`loops/review-loop.md`) on the existing work FIRST:
- Six-dimension scores establish the baseline (the redesign must beat these numbers —
  that's the definition of success).
- Reverse-engineer the implicit system into `memory/design.md` (legacy documentation gift).
- Critically: list what WORKS — recognized patterns users have muscle-memory for,
  content that converts, equity in the current visual identity. This is the
  **protected list**; a redesign that discards working assets is a regression with
  better fonts.

## 2. Diagnose the actual disease
Underperformance diagnosis order (`brain/decision-framework.md` build-vs-decorate):
1. Wrong hierarchy/IA? → structural redesign justified
2. Weak copy? → copy pass may outperform any visual work
3. Missing proof/trust? → content problem wearing design clothes
4. Dated surface? → reskin on preserved structure
State the diagnosis explicitly in `memory/notes.md` — "the client asked for prettier but
the disease is IA" is a conversation to have NOW, not after delivery.

## 3. Scope the migration reality
- Big-bang vs. incremental (page-by-page with a bridging token layer)?
- What must users re-learn? (Jakob's law applies to your OWN previous design — moving
  everything at once breaks daily users: `industries/crm-erp.md` muscle-memory warning.)
- SEO preservation: URL stability, redirect map, heading-structure continuity
  (`checklists/seo.md` — redesigns are where rankings go to die).

## 4. Design Loop with redesign deltas
Full loop (`loops/design-loop.md`) with:
- RESEARCH inherits the autopsy; WIREFRAME must justify every departure from a *working*
  pattern (novelty is not a reason); protected list checked at every stage gate.
- Score target: every dimension ≥95 AND ≥ baseline + meaningful delta on the diagnosed
  dimension (a redesign that moves Conversion 82→84 while dropping UX 96→90 failed).

## 5. Deliver with the comparison story
Output Contract + a before/after section in the report: baseline scores vs. new scores,
the diagnosis, what was preserved and why. Memory updated; old system's decisions
superseded-not-deleted (`memory/README.md` rule 6).
