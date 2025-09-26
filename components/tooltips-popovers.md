# Tooltips & Popovers

The just-in-time information layer. Rule zero: **critical information never lives ONLY
here** — hover surfaces are invisible to touch users, keyboard flows, and screenshots.

## Tooltip vs popover vs hint (choose correctly)
| | Tooltip | Popover | Inline hint |
|---|---|---|---|
| Trigger | hover/focus | click | always visible |
| Content | ≤1 short sentence, no interaction | rich: actions, forms, links | one line |
| Dismiss | pointer leaves / blur | explicit (✕, Esc, outside click) | — |
| Use | label icon-buttons, abbreviations, disabled-reasons | filters, share menus, inline help | form help text |

If the content needs a heading, it's a popover. If it needs to be read to complete the
task, it's inline text. Tooltips are *captions*, not documentation.

## Tooltip spec
```
Surface    --bg-inverse (light themes) / raised surface + border (dark) · radius-sm/md
Type       12–13px · max-width 240px · 1–2 lines · sentence case
Padding    6×10px
Offset     8px from trigger · arrow optional (pick with/without product-wide)
Delay IN   400–600ms first tooltip (intent filter) · 0ms between adjacent (warm state)
Delay OUT  0–100ms
Motion     opacity fade 100ms · NEVER animate position/scale (motion/micro-interactions.md)
Position   auto-flip at viewport edges · never covers the trigger
```

### Accessibility (where most tooltips fail)
- Show on **focus**, not just hover; dismiss on Esc (WCAG 1.4.13: dismissible, hoverable,
  persistent — the tooltip itself must be hoverable without vanishing).
- Icon-only buttons: `aria-label` carries the name; the tooltip is the *visual* echo.
- Truncation tooltips (full text of an ellipsized cell): also provide the value on focus.
- Touch: long-press is undiscoverable — anything tooltip-only must have a visible
  alternative path (detail view, a ⓘ popover, or just… visible).

## Disabled-element tooltips (the golden use case)
"Why can't I click this?" is the most valuable tooltip in any product: *"Add a payment
method to enable exports."* Disabled elements don't fire pointer events — wrap them or use
a positioned sibling. A disabled button with no explanation is a dead end
(`components/states.md` doctrine).

## Popover spec
```
Surface    --bg-surface-raised · border --border-default · shadow tier-2 · radius-md/lg
Width      280–360px typical · padding 16px
Entrance   150ms fade + 4px translate from trigger side · exit 100ms
Focus      moves into popover if interactive · Esc closes, focus returns to trigger ·
           outside-click closes
A11y       trigger: aria-expanded + aria-controls · popover labelled by its heading
```

- Anatomy: optional heading (14px, 600) → content → optional action row. One job per
  popover — a popover with tabs is a modal in denial (`components/modals.md` ladder).
- Position: default below-start; flip smartly; the arrow (if used) tracks the trigger.
- Nesting: never popover-from-popover (menus may cascade one level; that's a menu, with
  arrow-key semantics).

## Inline help hierarchy (use the cheapest that works)
```
visible help text (forms.md)  >  ⓘ-triggered popover  >  tooltip  >  "learn more" link out
```
Recurring confusion is a *naming* problem — fix the label before adding an ⓘ. An interface
growing ⓘ icons is accruing debt, not documentation.

## Anti-patterns
- Tooltips restating the visible label ("Save" button → tooltip "Save")
- Rich HTML "tooltips" with links nobody can click before it vanishes (that's a popover)
- Tooltip walls: 8 ⓘ icons in one form section
- Instant tooltips on everything (cursor travel becomes a firework show)
- Popovers that close while the user is selecting text inside them
- Onboarding tooltip *tours* — 9-step parades; use contextual first-use hints instead
  (`patterns/onboarding-auth.md`)

## Checklist
- [ ] Nothing critical is tooltip-only; touch path exists for everything
- [ ] Tooltips: focus-triggered too, Esc-dismissible, hoverable, 400ms+ first delay
- [ ] Disabled controls explain themselves
- [ ] Popovers: focus management + aria-expanded + outside-click/Esc
- [ ] Every ⓘ audited: could better labeling delete it?
