# Modals, Dialogs & Toasts

Overlays interrupt. Interruption is expensive. Every overlay must justify stealing focus —
and most "modals" should actually be inline sections, drawers, or nothing.

## Decision ladder (before building any modal)
```
Can it be inline?            → inline edit / expandable section
Is it a side task?           → drawer/panel (keeps context visible)
Is it a quick confirm?       → small dialog
Does it *require* isolation? → modal (checkout step, destructive confirm, auth wall)
Is it just FYI?              → toast — or nothing
```

## Modal spec
```
Widths      sm 400px (confirms) · md 560px (forms) · lg 720px (rich content) · never >90vw/85vh
Scrim       rgba(0,0,0,0.5–0.6) light · rgba(0,0,0,0.7) dark themes · click closes (except destructive/dirty)
Surface     --bg-surface-raised · radius 12–16px · shadow tier-3
Padding     24–32px · header/body/footer zones
Entrance    200ms: scrim fade + panel fade/translate-y(8px) or scale(0.98→1) ease-out
Exit        150ms (exits are faster than entrances)
Mobile      bottom sheet: full-width, radius-top 16px, drag handle, slide-up 250ms
```

### Anatomy
- **Header:** title 18–20px 600 (states the task: "Invite teammates", not "Modal"); close X top-right 40px target.
- **Body:** one task only. If a modal needs tabs, it wanted to be a page.
- **Footer:** actions right-aligned (LTR): ghost Cancel + primary Confirm; destructive confirms get danger-styled primary + the consequence spelled out.

### Focus & keyboard (non-negotiable)
- Focus moves to modal on open (first field, or the *least* destructive action in confirms).
- Focus trapped inside; Tab cycles; **Esc closes**; focus returns to trigger on close.
- Background `inert` / `aria-hidden`; body scroll locked (with scrollbar-width compensation — no layout jump).
- `role="dialog" aria-modal="true" aria-labelledby={title}`.

### Dirty-state protection
Form modals with entered data: closing (Esc/scrim/X) asks "Discard changes?" — a small nested confirm, or better, draft-preserving close.

## Confirmation dialogs
- Reserve for destructive/irreversible only — confirm-fatigue trains users to click through.
- Copy pattern: **title = the question** ("Delete 'Q3 Report'?") · body = consequence ("This can't be undone. 4 collaborators lose access.") · buttons = verbs ("Delete report" / "Cancel") — never Yes/No/OK.
- High-stakes (delete org, drop database): type-to-confirm the resource name.
- Prefer **undo over confirm** for medium-stakes actions: act immediately + toast with Undo (10s window). Faster and safer than dialog roulette.

## Drawers / side panels
- Right-side, 400–560px, full-height; for create/edit/detail tasks where the list behind stays relevant.
- Same focus rules as modals; scrim optional (visible-context drawers may keep the page interactive — then it's a panel, not a drawer: pick one behavior).
- Entrance 250ms translate-x ease-out.

## Toasts
```
Position    bottom-left or bottom-center (desktop) · above nav (mobile) · one consistent corner
Size        320–400px · icon + message (+ optional action: Undo / View)
Duration    4s info/success · 6s+ with action · errors: sticky until dismissed if actionable
Stack       max 3 visible, then queue · newest on top · collapse duplicates ("3 files uploaded")
Motion      slide+fade in 200ms, out 150ms
A11y        aria-live="polite" (assertive only for critical errors) · pauses on hover/focus
```
- Toasts confirm outcomes ("Saved", "Invite sent") — they never carry the only copy of critical info or required actions.
- Errors that need reading go inline/banner, not toast.

## Banners & inline alerts
- Page/section-level persistent conditions (trial expiring, degraded service, unsaved changes).
- Tinted semantic background (`--warning-subtle` etc.) + icon + message + one action; dismissible only if the condition is ignorable.

## Anti-patterns
- Modal-on-modal (redesign the flow) · marketing popups within 5s of landing · newsletter modal before content was read · modals for content that fits inline · X-only close with no Esc/scrim · toast asking a question · success modal for routine saves (toast suffices) · full-screen takeover for a yes/no
- **Layout shift on open** from scrollbar removal — compensate.

## Checklist
- [ ] Ladder consulted — is a modal truly needed?
- [ ] Focus trap + Esc + return-to-trigger + inert background
- [ ] Title=task, buttons=verbs, consequence stated (destructive)
- [ ] Dirty-state guarded; undo preferred where possible
- [ ] Mobile bottom-sheet behavior; body scroll locked without jump
- [ ] Toasts: one corner, capped stack, aria-live, no critical-only info
