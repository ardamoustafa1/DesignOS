# Command Palette

A command palette is expert navigation, action search, and power-user acceleration in
one surface. It is not a decorative modal with a search field.

## When To Use

Use a command palette when the product has:

- many pages or actions
- keyboard-heavy users
- admin/developer workflows
- cross-object search
- commands that are faster by name than by navigation

Do not add one to a simple landing page or tiny CRUD app. Complexity must earn it.

## Anatomy

```text
Trigger        cmd/ctrl+k button, search affordance, or global shortcut
Dialog         centered or top-biased, 560-720px wide desktop
Input          autofocus, clear label, placeholder names scope
Results        grouped by type: pages, actions, records, docs
Active item    strong focus, visible keyboard state
Footer         hints: Enter, Esc, arrows; keep compact
```

Mobile: full-screen sheet with input pinned top and results below. Do not squeeze a
desktop command modal into 375px.

## Search Behavior

- Debounce remote search 150-250ms.
- Local commands respond instantly.
- Rank exact prefix, acronym, fuzzy match, recent use, then frequency.
- Highlight matched text subtly; never turn results into a confetti of marks.
- Empty query shows recent/frequent commands plus key navigation entries.

## Result Types

| Type | Example | Action |
|---|---|---|
| Page | "Billing settings" | navigate |
| Record | "Acme Inc" | open object |
| Command | "Invite teammate" | run flow |
| Help | "API keys docs" | open docs |

Commands that mutate data must ask for confirmation unless they are trivially reversible.

## Keyboard Contract

- `Cmd/Ctrl+K` opens.
- `Esc` closes, then returns focus to trigger.
- Arrow keys move active item.
- `Enter` activates.
- `Tab` does not trap inside result list unexpectedly.
- Screen reader announces result count changes with restraint.

## Empty, Loading, Error

- Empty query: recent/frequent.
- No results: "No results for X" plus docs/support fallback.
- Loading: content-shaped skeleton rows, not a spinner-only void.
- Error: in-place retry, preserves query.

## Anti-patterns

- Results with no keyboard active state.
- Mutating commands that run on accidental Enter.
- Searching only page titles while pretending to search the product.
- Generic "Search..." placeholder that hides scope.
- Global shortcut that steals focus from text inputs.

## Checklist

- [ ] Trigger visible and shortcut documented accessibly
- [ ] Result groups and ranking defined
- [ ] Keyboard contract complete
- [ ] Empty/loading/error states designed
- [ ] Destructive commands confirm
- [ ] Mobile uses full-screen sheet or native pattern
