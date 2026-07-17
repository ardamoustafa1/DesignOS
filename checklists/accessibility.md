# Accessibility Checklist (WCAG 2.2 AA gate)

The mechanical companion to `foundations/accessibility.md` and the `accessibility` agent's
protocol. Any unchecked box in the BLOCKER sections = audit FAIL = dimension capped at 60.

## Contrast & color — BLOCKERS
- [ ] Body text ≥ 4.5:1 on every surface it sits on (both themes)
- [ ] Large text (≥24px / ≥18.66px bold) and UI components/borders ≥ 3:1
- [ ] Hover/focus/disabled/placeholder states re-checked (disabled may relax, placeholder may not if it carries info — it shouldn't)
- [ ] Text over images: passes at the worst pixel (scrim verified)
- [ ] No color-only meaning: errors, statuses, chart series, links-in-prose all have a second channel (icon/label/underline/pattern)

## Keyboard — BLOCKERS
- [ ] Tab reaches every interactive element; order = visual order
- [ ] Focus visible at every stop (styled `:focus-visible`, ≥3:1, never `outline:none` bare)
- [ ] Focus is not obscured by sticky headers, cookie banners, drawers, or overlays (2.4.11)
- [ ] No traps; Esc closes every overlay; focus returns to trigger
- [ ] Skip link first, functional, visible on focus
- [ ] Dropdowns/menus/tabs: arrow keys, Enter/Space, Esc per pattern
- [ ] Custom widgets reachable AND operable (or replaced with native elements)

## Structure & semantics — BLOCKERS
- [ ] One `<h1>`; heading levels unskipped; headings describe their sections
- [ ] Landmarks: header/nav/main/footer; exactly one main
- [ ] Buttons are `<button>`, links are `<a href>`; no div-with-onClick
- [ ] Every input has a visible `<label>`; errors linked `aria-describedby` + `aria-invalid`
- [ ] Visible control text is included in the accessible name (2.5.3); page and language changes are named
- [ ] Authentication does not require a cognitive-function test without an accessible alternative (3.3.8)
- [ ] Images: meaningful alt or `alt=""`; icon-only buttons `aria-label`ed
- [ ] Tables: real semantics, `<th scope>`, named

## Dynamic content
- [ ] Async results/toasts announced (`aria-live="polite"`; assertive only for critical)
- [ ] Modals: focus in / trapped / restored; `aria-modal`; background inert
- [ ] SPA route changes move focus (h1/main); loading states announced
- [ ] State ARIA truthful: `aria-expanded`, `aria-current`, `aria-selected` match reality

## Motion & media — BLOCKERS where marked
- [ ] `prefers-reduced-motion` implemented per-pattern and TESTED — BLOCKER
- [ ] Flashing stays below WCAG's general/red-flash thresholds; DesignOS house rule avoids >3×/second — BLOCKER
- [ ] Autoplay: muted, pausable; carousels pausable (or absent)
- [ ] Prerecorded video: captions and required audio description; audio-only: transcript

## Reflow & targets — BLOCKERS
- [ ] 200% text zoom and browser text-size override: no content/function loss
- [ ] 320 CSS px reflow (equivalent to 400% at 1280px): no two-dimensional scrolling except allowed content such as maps/data tables
- [ ] WCAG text-spacing override causes no clipping or loss (1.4.12)
- [ ] Hover/focus-triggered content is dismissible, hoverable, and persistent where required (1.4.13)
- [ ] Pointer gestures have simple alternatives; dragging has a non-drag alternative; actions support cancellation
- [ ] Targets meet WCAG 2.2 AA 24×24 or its spacing/exceptions; DesignOS house target is ≥44×44 (AAA-sized)
- [ ] Orientation is not locked without essential reason; autocomplete/input-purpose tokens are correct

## Verification methods
- [ ] Automated pass run (axe/Lighthouse) where tooling exists — findings triaged, not just run
- [ ] Manual keyboard walk done (tooling can't check this)
- [ ] Accessibility-tree read-through: page comprehensible without pixels
- [ ] Forced-colors/high-contrast mode inspected where the target platform supports it
- [ ] Both themes, all four breakpoints audited

**Verdict:** ☐ PASS ☐ FAIL (n blockers) — one blocker fails; partial credit doesn't exist.
