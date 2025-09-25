# States — Loading, Empty, Error, Success

Users spend a shocking share of their time in "non-happy" states. Products feel premium
precisely when these states feel designed. **No component ships with only its success state.**

## Loading

### Choosing the pattern
| Wait | Pattern |
|---|---|
| <300ms | nothing (a flash of skeleton is worse than none — delay indicators 300ms) |
| 300ms–2s | skeleton (content-shaped) or inline spinner (action-shaped) |
| 2–10s | skeleton + progress communication ("Analyzing 1,240 rows…") |
| >10s / async jobs | progress bar with stages, or move to background + notify |

### Skeletons
- Mirror the *exact* final layout: same heights, widths vary (title 40%, lines 100%/80%), same grid. Skeleton→content swap must produce **zero layout shift**.
- Shimmer: subtle gradient sweep 1.2–1.5s linear infinite; respect `prefers-reduced-motion` (static blocks).
- Skeleton only what loads: chrome, nav, and known labels render immediately (app shell pattern).

### Spinners & progress
- Spinner: for user-triggered actions, *inside* the triggering element (`components/buttons.md`). 16–20px, accent or currentColor.
- Determinate progress bar whenever progress is knowable; never fake-freeze at 90% — ease asymptotically or show stages ("Uploading → Processing → Done").
- Optimistic UI for high-confidence mutations (like, rename, toggle): apply instantly, reconcile in background, roll back with a toast on failure.

## Empty states

Three species, three designs:

### First-use (nothing created yet) — an onboarding opportunity
```
Illustration/icon   subdued, on-system (foundations/iconography.md)
Title               what this space becomes: "Your reports will live here"
Body                1–2 lines: the value + the first step
Primary action      "Create your first report" — THE most important button in onboarding
Secondary           "Import existing" / docs link / sample-data option
```
Sample/demo data ("Explore with example data") outperforms blank canvases for complex tools.

### Filtered-empty (data exists, query excludes it)
- "No results for 'fintech' + Archived" + **Clear filters** action. Never the first-use illustration here — it gaslights users who have data.

### Cleared/done (inbox zero)
- Positive completion tone: "All caught up." Small, calm, maybe delightful — not a giant CTA to make more work.

## Error states

### Hierarchy of intrusiveness (match severity)
```
Field error        inline, under the field                  (components/forms.md)
Component error    in-place card: icon + message + Retry    (one widget failing ≠ page failing)
Page error         full-state: title + explanation + action
Banner             degraded-but-working conditions
Toast              transient failure of a background action (with retry)
```

### Error copy rules
- What happened + what to do, human language: "We couldn't save your changes — check your connection and try again." Never raw codes alone (code in small print for support).
- Never blame ("You entered an invalid value" → "Value must be a number").
- Preserve user work at all costs: keep input, offer copy-to-clipboard on hard failures.
- Retry: idempotent one-click; exponential backoff behind the scenes; after 2 failed retries escalate the message (status page link, support).

### Canonical pages
- **404:** on-brand, short, search + home link. Personality allowed here.
- **500:** apologize, auto-report noted, status link. No jokes when data is at stake.
- **Offline:** detect + banner; queue mutations if the product plausibly supports it.
- **Permission denied:** explain *who* can grant access, offer "request access" — dead ends breed tickets.

## Success states
- Routine saves: toast or inline check, 2–4s (`components/modals.md`). Auto-save: quiet "Saved" ambient text beats toast-spam.
- Milestone successes (first deploy, payment complete, onboarding done): full moment — check animation (400–600ms draw), summary of what happened, clear *next* action. Confetti: once per genuine milestone, never for routine ops, always reduced-motion aware.
- Success must state consequence: "Invite sent to ana@…" not just "Success!"

## The state matrix (ship requirement)
Every data-bearing component declares all cells before review:

| | loading | empty | partial | error | success |
|---|---|---|---|---|---|
| designed? | ▢ | ▢ | ▢ | ▢ | ▢ |

"Partial" = some data + some failure (3 of 4 widgets loaded) — degrade gracefully per-region, never all-or-nothing.

## Anti-patterns
- Spinner-only full-page loads (skeleton exists for a reason) · skeletons that don't match final layout (CLS) · "Error occurred" (which? where? now what?) · empty state = blank white void · celebration modals for trivial actions · error toasts that vanish before readable · disabled retry with no explanation

## Checklist
- [ ] State matrix complete for every data component
- [ ] Indicators delayed 300ms; skeleton swap = zero CLS
- [ ] Three empty species distinguished
- [ ] Error copy: cause + action, work preserved, retry idempotent
- [ ] Success communicates consequence; celebrations rationed
- [ ] All states reduced-motion safe and announced (aria-live where async)
