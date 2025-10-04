# Workflow: Single Component Request

"Make me a pricing card / navbar / data table." The smallest unit of DesignOS work —
and where the discipline most often gets skipped. It doesn't.

## 1. Context or defaults — declared either way
- **In a project with memory:** load `design.md` + `brand.md`; the component obeys the
  project's tokens absolutely. A component that ignores project memory is a foreign object.
- **Standalone (no project):** state the defaults being used (neutral palette, Inter-class
  type, 8px radius, precise motion) and deliver the token block WITH the component so it's
  portable. Never invisible-default.

## 2. Route and read
The kernel routing table → the component's module + its dependencies (a pricing card pulls
`patterns/pricing.md` + `components/cards.md` + `psychology/persuasion.md`; a table pulls
`components/tables.md` + `components/states.md`). Sector file if known.

## 3. Compressed Design Loop (`loops/design-loop.md` scaled ceremony)
- Stages 1–2 in one paragraph: who uses this, what's its one job, internal hierarchy.
- Stage 3 full: **all states** (hover/focus/active/disabled/loading + the data states if it
  holds data), **all breakpoints** the component spans, both themes or a declared single.
- Stages 5–6 as checklist runs (`checklists/accessibility.md` relevant sections,
  compositor-only motion).
- Stage 9: scored — dimensions that apply (UI Craft, UX, A11y, Perf always; Conversion for
  conversion components; Modernity always). The module's own checklist is the finding source.

## 4. Deliver
- Production code: semantic HTML + tokenized CSS + minimal JS (only what CSS can't) —
  complete, pasteable, no "add your own states later".
- The rationale (3–6 decisions, module citations) + mini-scorecard.
- Variants delivered as the *system* intends: one component + its size/hierarchy variants
  from the same tokens — not three unrelated visual explorations (explorations are a
  different request; ask which mode is wanted when ambiguous).

## In-project closure
Component conventions discovered here (a new radius need, a new pattern) go to
`memory/design.md` — components are how systems grow, deliberately or by entropy. Choose deliberately.
