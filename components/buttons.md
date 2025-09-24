# Buttons

The button is the design system in miniature: if the buttons are right, the system's
color, type, spacing, radius, and motion decisions are probably right.

## Hierarchy (one primary per view)
| Rank | Style | Use |
|---|---|---|
| **Primary** | solid accent, `--text-on-accent` | THE action. One per view/section. |
| **Secondary** | outline (1px `--border-strong`) or subtle-filled (`--accent-subtle`) | Alternative action beside a primary |
| **Tertiary/Ghost** | text-only, weight 500 | Low-stakes actions, toolbars, "Learn more" |
| **Destructive** | solid/outline `--danger` | Delete/remove — never adjacent-twin styling with primary |

Two solid accent buttons side by side = no hierarchy = both lose. "Get started" (primary) +
"View docs" (ghost with →) is the canonical hero pair.

## Specs
- **Sizes:** sm 32px / md 40px / lg 48px height; padding-x ≈ 2–2.5× padding-y; hero CTAs lg.
- **Type:** 14–16px, weight 500–600, no caps (except tiny utility buttons), no letter-spacing.
- **Radius:** from the system scale — 6–8px (product default), 10–12px (friendly), full-pill (marketing/consumer). One radius language per product.
- **Icons:** 16–20px, gap 8px; leading icon = category, trailing → = navigation/progress. Never both.
- **Min touch target 44×44** (visual can be smaller with padding hit-area).
- **Width:** hug content + padding. Full-width only on mobile or inside narrow forms/modals. Never stretch a lone CTA across a desktop container.

## States (all mandatory)
```
default → hover → active → focus-visible → disabled → loading
```
- **Hover:** background shift (~8% darken light / lighten dark) + optional 1px translate-y-up or subtle shadow raise. Transition 120–150ms ease-out. Cursor: pointer.
- **Active:** darker still + translate-y back to 0 / scale(0.98) — the press must *feel* mechanical.
- **Focus-visible:** 2px ring, 2px offset, brand-colored (`foundations/accessibility.md`).
- **Disabled:** reduced opacity (~50%) + `cursor: not-allowed`; keep label readable; prefer *enabled with validation feedback* over disabled submit buttons where feasible.
- **Loading:** spinner (16px) replaces or precedes label, label switches to progressive verb ("Saving…"), width locked to pre-loading width (no jump), `aria-busy="true"`, double-submit prevented.

## Micro-interaction spec
```css
.btn {
  transition: background-color 120ms ease-out, transform 120ms ease-out,
              box-shadow 120ms ease-out;
}
.btn:active { transform: translateY(1px) scale(0.99); }
```
No spring wobbles on buttons; they're tools, not toys. Reserve springs for playful sectors (`industries/gaming.md`).

## CTA copy (with `agents/copywriter.md`)
- Verb + outcome: "Start free trial", "Get the report", "Book a demo".
- Never "Submit", "Click here", "Learn more" as a *primary* (fine as ghost).
- First person converts in tests ("Start my trial") for consumer; B2B stays second/neutral.
- Reduce anxiety at the point of click: microcopy under the CTA ("No credit card · 2-min setup"), 12–13px muted.

## Icon-only buttons
- 40×40 (36 minimum in dense toolbars), `aria-label` required, tooltip on hover+focus (500ms delay), radius consistent with system.

## Button groups
- Related actions: 8–12px gap; primary rightmost in LTR dialogs (platform convention), or leftmost in inline forms — pick one convention per product and never mix.
- Segmented controls are inputs, not buttons — style as one bordered unit with a moving selection.

## Anti-patterns
- Gradient primary buttons (state changes become mud)
- Uppercase + letterspaced labels (2016 Material ghost)
- Hover states that grow layout (`padding` change → neighbors shift)
- Ghost primary CTA in the hero ("we don't believe in our own product")
- Three sizes on one screen; two radius languages anywhere
- `<div onClick>` — buttons are `<button>`

## Checklist
- [ ] Exactly one primary per view; hierarchy visibly ranked
- [ ] All six states implemented and tested (keyboard too)
- [ ] Loading state locks width, prevents double-submit
- [ ] Copy = verb + outcome; anxiety-reducer near high-commitment CTAs
- [ ] Touch targets ≥44px; contrast ≥4.5:1 label, ≥3:1 boundaries
