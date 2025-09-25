# Forms

Forms are where products win or lose money. Every field is a toll booth; every unclear
label is a lost user. Design forms as *conversations*, not database mirrors.

## Principles
1. **Every field must justify its existence.** Can it be inferred, deferred, or deleted? (Signup: email + password. Everything else is post-signup.)
2. **One column.** Multi-column forms break scanning and completion order. (Exception: true pairs — First/Last name, City/ZIP.)
3. **Labels above inputs, always visible.** Placeholder-as-label fails memory, a11y, and autofill audits.
4. **Validate at the right moment.** On blur for format checks, on submit for the rest, *instantly* only for availability/strength. Never on first keystroke.
5. **Errors are guidance, not blame.**

## Field anatomy & specs
```
Label        14px · 500 · text-primary · 8px gap below
Input        44–48px height · 14–16px text · padding 12×14 · radius from scale
             1px --border-default → --border-strong (hover) → 2px ring --border-focus (focus)
Help text    13px · text-muted · 6px gap above input's bottom edge
Error        13px · --danger + icon · replaces help text · input border → --danger
```
- Background: `--bg-surface` on light; on dark use raised surface, not outline-only.
- Width maps to content: ZIP ≈ 8ch, phone ≈ 16ch, email/name full-width of the (narrow) form column. A 100%-width 5-digit field misleads.
- Form column: 400–480px max, even inside wide pages.

## Field selection logic
| Data | Control |
|---|---|
| ≤5 known options | Radio group (visible beats hidden) |
| 6–15 options | Select |
| >15 / searchable | Combobox with typeahead |
| Binary setting (instant effect) | Toggle |
| Binary consent (takes effect on submit) | Checkbox |
| Date | Calendar picker + manual entry both |
| Phone/credit card | Auto-formatting masked input |

## Errors & validation
- Message pattern: what's wrong + how to fix. "Password needs 8+ characters" not "Invalid password."
- Error summary at top for long forms (with anchor links), field-level detail inline; focus moves to first error on submit.
- `aria-describedby` links error to input; `aria-invalid="true"` set.
- Never clear the user's input on error. Never make them re-pick a file.
- Success states: subtle check for high-stakes format fields (email); don't confetti every field.

## Flow & progression
- Group logically with section headings (`fieldset/legend` for radio groups); ~5–7 fields per visual group max.
- Multi-step beats mega-form at >8 fields: progress indicator (steps, labelled), Back always safe (state preserved), one topic per step.
- Autofocus first field (desktop, single-purpose pages only). Enter submits; correct `inputmode` and `autocomplete` attributes on every field (email/tel/cc — this is free conversion).
- Smart defaults: pre-select the popular plan, infer country from locale — but *never* pre-check consent boxes.

## Submit zone
- Primary button: verb + outcome, right- or full-width per platform convention; loading state locks width (`components/buttons.md`).
- Anxiety reducers at point of commitment: "No credit card required", privacy one-liner, lock icon on payment.
- Don't disable submit as validation strategy — allow submit, show errors well. (Disabled submit + no explanation is a dead end.)

## Special forms
- **Auth:** see `patterns/onboarding-auth.md` — SSO first, email fallback, password rules stated upfront, show-password toggle.
- **Search:** icon-in-field, instant results ≤300ms debounce, recent searches, Esc clears.
- **Payment:** card field grouping (number/exp/CVC in one visual unit), realtime brand detection, errors *never* generic ("card declined — check with your bank" beats "error").

## Anti-patterns
- Placeholder-only labels; disappearing context
- Resetting the form on validation failure
- "Confirm email" fields (use verification post-submit)
- Password rules revealed only after failure
- Star-only required marking with no legend; or 9 of 10 fields required with `*` noise — mark *optional* instead
- Toggles that require a Save button (toggle = instant; if it needs Save, it's a checkbox)

## Checklist
- [ ] Every field justified; optional marked; ≤1 column
- [ ] Labels visible; help before error; errors specific and linked
- [ ] Correct control type, `autocomplete`, `inputmode` per field
- [ ] Keyboard-complete; focus order = visual order; Enter submits
- [ ] Submit: loading state, double-submit guard, anxiety reducer
- [ ] Long form → steps with safe Back
