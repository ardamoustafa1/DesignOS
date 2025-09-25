# Search & Command Palettes

Search is a conversation with an impatient user. Every keystroke is a question; latency,
ranking, and empty results are your answers. The command palette (⌘K) is search's
power-user sibling — and increasingly the signature of a serious product.

## Search input
```
Field      44px height · leading magnifier icon (16–20px, muted) · placeholder states
           SCOPE not "Search…" ("Search invoices, customers, docs…")
Shortcut   "/" or ⌘K chip trailing in the field (desktop) — teach it, it's free speed
Clear      ✕ appears with content · Esc clears, second Esc blurs
Debounce   150–300ms as-you-type · show spinner IN the field (trailing) after 300ms
```
- Placement: topbar center/right in apps (`components/navigation.md`); the hero itself in
  search-first products (`industries/real-estate.md` doctrine).
- Mobile: expands to full-width sheet with its own back/cancel; keyboard type `search`
  (shows the Search key).

## Results
- **Latency budget:** perceived-instant <100ms (local/cached), spinner past 300ms, stale
  results NEVER shown as fresh (label or clear while loading).
- **Grouping:** multi-entity results grouped with 12px caps headers (Customers / Invoices /
  Docs), 3–5 per group + "View all N" — a flat mixed list forces users to parse types.
- **Highlighting:** match substring bolded in results — the why-am-I-seeing-this signal.
- **Ranking is design:** exact > prefix > fuzzy; recent/frequent boosted; the user's own
  items above global items. Bad ranking reads as broken search regardless of coverage.
- Keyboard: ↑↓ traverse (roving highlight, wraps), Enter opens, ⌘Enter opens-in-new,
  results announced (`aria-live` count: "8 results").
- **Empty results** (`components/states.md` filtered-empty species): show what was searched,
  offer corrections — spelling suggestion, broader scope, "search in docs instead". Never
  a dead "No results." with no exits.
- Recent searches + clear-history when the field focuses empty; popular/suggested searches
  for cold starts.

## Command palette (⌘K)
The modern product's keyboard heart (Linear/Raycast standard — `brain/reference-library.md`):
```
Overlay    centered top-third · 560–640px wide · radius-lg · shadow tier-3 · scrim light
Input      borderless, 16–18px, autofocused · placeholder "Type a command or search…"
List       icon (16px) + label + optional context (right-aligned muted: parent, shortcut)
           40–44px rows · roving selection (bg tint, not just text color)
Footer     hint bar: ↑↓ navigate · ↵ select · esc close (12px muted)
Motion     opens 150ms fade+scale(0.98→1) · closes 100ms — must FEEL instant
```
- **Content model:** actions ("Create invoice", "Toggle theme") + navigation ("Go to
  Settings") + entities (records by name) — grouped, fuzzy-matched, frequency-learned.
- Command mode prefixes (`>` actions, `#` tags, `@` people) for power depth — discoverable
  via the placeholder and footer hints.
- Nested flows: a command may open a sub-palette (assignee picker) — breadcrumb chip shows
  the stack, Backspace pops it.
- Every palette action MUST also exist in the visible UI — the palette is an accelerator,
  never the only path (discoverability law).
- Register the shortcut properly: ⌘K/Ctrl+K, not stolen from the browser (never override
  ⌘L, ⌘T); document it in the UI (topbar chip).

## Filters vs search (both, distinctly)
Search finds; filters narrow. Products with both: search field + filter chips coexist,
active filters visible as removable chips (`components/badges-chips.md`), and search runs
*within* active filters — say so ("Searching in: Active projects").

## Anti-patterns
- Search that requires Enter with no as-you-type feedback (feels dead) — or the opposite:
  full-page reload per keystroke
- Results reordering under the cursor as late responses land (race conditions — cancel
  stale requests)
- ⌘K palettes with 8 commands (theater; earn it with real coverage)
- Placeholder "Search" with no scope; magnifier icon-button that reveals a field on click
  in a desktop app with acres of space
- Fuzzy matching so loose that "inv" surfaces "Kevin" above "Invoices"

## Checklist
- [ ] Scope-stating placeholder, shortcut taught, Esc/clear behaviors
- [ ] <100ms cached feel; stale results never masquerade; races cancelled
- [ ] Grouped + highlighted + rank-sane results; keyboard complete; aria-live count
- [ ] Empty results offer exits; recent/suggested on focus
- [ ] Palette: instant motion, grouped commands, footer hints, UI-parity for every action
