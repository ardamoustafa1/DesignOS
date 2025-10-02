# The Scoring Rubric

Six dimensions, 0–100 each, threshold **95**. Scores come from the bands below — never
from overall impression. The reviewer walks each dimension's checks, tallies findings,
and lands in the band the findings dictate. Calibration: `brain/quality-bar.md` —
95 means "a design director at a reference company would ship this."

## Universal mechanics
- **Instant-fail caps:** any hit from the instant-fail list (`brain/quality-bar.md`) caps
  its dimension at **60** until fixed. Multiple hits don't stack below 60 — one is enough.
- **Bands:** 96–100 zero findings after adversarial pass · 90–95 minor findings only
  (cheap fixes, no user harm) · 80–89 real findings (visible quality loss) · 60–79
  serious findings (user harm or systemic violations) · <60 reserved for instant-fail +
  additional serious findings.
- **Unverified = not passed.** A dimension whose checks weren't run reports "NOT ASSESSED,"
  never a guessed number.

## 1. UI Craft
Typography discipline (scale, tracking, line-height, measure — `foundations/typography.md`) ·
spacing-grid adherence + rhythm (`foundations/spacing.md`) · color-token discipline, 60/30/10,
theme correctness (`foundations/colors.md`) · alignment/grid integrity (`foundations/grids.md`) ·
detail craft (radii scale, shadow quality, focus styling, optical corrections —
`brain/quality-bar.md` tells) · component-module checklist compliance for every routed component.
*Auto-findings:* magic numbers, raw hexes, mixed radius languages, borrowed-dialect elements.

## 2. UX & Flow
Eye-path clarity (declared and enforced — `psychology/attention.md`) · one-primary-action
discipline · cognitive-load limits (choices, chunking, recall — `psychology/cognition.md`) ·
convention adherence where users expect it (Jakob) · **complete state matrix**
(`components/states.md` — a missing empty/error state is a serious finding, not minor) ·
flow integrity (no dead ends, safe backs, preserved work) · responsive behavior as
*decisions* not shrinkage.

## 3. Accessibility
The `agents/accessibility.md` protocol verbatim: contrast sweep, keyboard walk, semantics/
tree, dynamic announcements, motion/perception, zoom/reflow. **Any WCAG AA blocker = the
60 cap.** 95+ requires: zero blockers, zero serious, and the craft extras (styled focus,
smart reduced-motion, aria-live correctness). This dimension has the least discretion —
it's nearly mechanical.

## 4. Performance
`checklists/performance.md` budgets: LCP < 2.0s, CLS < 0.1, INP < 200ms, Lighthouse ≥ 95,
weight budgets, font/image discipline, animation cost (`motion/performance.md` compositor
rule), JS restraint, off-screen/hidden-tab hygiene. Measured where tooling exists; projected
with stated assumptions where it doesn't (and labeled as projection).

## 5. Modernity
Does it read as *current-year professional* against the reference canon — without trend
cosplay? Composition currency (bento/sticky-tour/editorial moves used where fitting, not
everywhere) · absence of dated tells (ripples, 2016-caps-buttons, corporate-Memphis, skill
bars, carousel heroes) · absence of *cliché* currency (the AI-gradient-mesh problem —
`industries/ai-startup.md`) · craft signatures present (the details list in
`brain/quality-bar.md`) · sector-appropriate boldness (`industries/` license levels).
This is the most judgment-heavy dimension: findings must still cite specifics.

## 6. Conversion
The argument structure (claim → mechanism → proof → objections → ask —
`patterns/landing-pages.md`) · headline-stack completeness (the layer-cake test) · CTA
hierarchy, cadence, copy (verb+outcome, anxiety reducers at doubt peaks —
`psychology/persuasion.md` map) · proof reality and placement · friction audit on the
conversion path (every field/step justified) · **honesty gate: any dark pattern or fabricated
proof = instant-fail cap.** For non-converting surfaces (apps, docs), grade task-completion
efficiency instead and say so.

## Reporting
Scores go into `scoring/report-template.md` with findings attached to dimensions.
Verdict: all ≥95 → SHIP · any <95 → RETURN TO LOOP with fix-ordered findings ·
3 cycles without convergence → escalate cause (`loops/design-loop.md` discipline).
