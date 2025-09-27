# Accessibility — Foundation

Accessibility is not a compliance checkbox; it's a quality multiplier. Every a11y fix
(contrast, focus, structure, motion respect) makes the design better for everyone.
Target: **WCAG 2.2 AA everywhere, AAA where free.**

## The non-negotiables (instant-fail if violated)
1. Body text contrast ≥ 4.5:1; large text (≥24px / ≥18.66px bold) and UI components ≥ 3:1.
2. Complete keyboard path: every action reachable and operable via Tab/Enter/Space/Esc/arrows.
3. Visible focus indicator on every interactive element — styled, on-brand, ≥3:1 against adjacent colors, never removed.
4. `prefers-reduced-motion` respected (`motion/performance.md`).
5. Touch targets ≥ 44×44px (24×24 absolute minimum per WCAG 2.2, but 44 is the bar).

## Structure
- Landmarks: `<header> <nav> <main> <footer> <aside>` — exactly one `<main>`.
- Heading outline: one `<h1>`; no skipped levels; headings describe sections (screen-reader users navigate by them).
- Skip link: first focusable element, "Skip to content", visible on focus.
- Buttons do actions (`<button>`), links go places (`<a href>`). A div with onClick is neither.
- Forms: every input has a `<label>` (visible, not placeholder-as-label); errors linked via `aria-describedby`; required marked in text, not color/asterisk alone.

## Focus management
```css
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```
- Use `:focus-visible` (not `:focus`) so mouse users don't see rings, keyboard users always do.
- Modals: focus moves in on open, is trapped inside, returns to the trigger on close.
- Route changes (SPA): move focus to the new page's h1 or main.
- Focus order = visual order. If CSS reorders (grid/flex `order`), fix the DOM instead.

## Screen readers
- Images: meaningful → descriptive `alt`; decorative → `alt=""`.
- Icon-only buttons: `aria-label`.
- Live updates (toasts, async results): `aria-live="polite"` region.
- State exposed: `aria-expanded`, `aria-current="page"`, `aria-selected` — match ARIA to actual state, and prefer native elements over ARIA reconstruction ("No ARIA is better than bad ARIA").
- Test narrative: can you understand the page hearing only the accessibility tree?

## Color & perception
- Never color-only meaning: pair with icon/label/pattern (chart lines: vary dash/marker too — `dataviz` discipline).
- Check both themes; dark mode contrast fails differently (muted text on raised surfaces is the usual casualty).
- Text over images: measure against the lightest/darkest pixel under the text, not the average.

## Motion & cognition
- No flashing >3×/second, ever.
- Autoplaying carousels/videos: pausable, or better, absent.
- Timeouts: warn and extend.
- Reading level: interface copy at ~8th grade; jargon only where the audience owns it.

## Testing protocol (per deliverable)
1. Tab through the entire page — every stop visible, order logical, no traps.
2. Contrast-check text tokens against every surface they appear on (including hover/disabled).
3. Headings/landmarks audit (browser a11y tree).
4. Zoom 200% — no loss of content or function, no horizontal scroll.
5. `prefers-reduced-motion: reduce` — page still fully functional and non-janky.
6. Run the full `checklists/accessibility.md` before scoring.

Score coupling: any non-negotiable failure caps the Accessibility dimension at 60 (`scoring/rubric.md`).
