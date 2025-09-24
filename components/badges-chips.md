# Badges, Chips & Tags

The smallest components carry the highest information density per pixel — and multiply
fastest into visual noise. Discipline here is discipline everywhere.

## Taxonomy (name them precisely; they behave differently)
| Kind | Job | Interactive? |
|---|---|---|
| **Status badge** | state of a thing (Active, Failed, Draft) | no |
| **Count badge** | quantity on another element (inbox 12) | no |
| **Tag/label** | categorization, often user-created | sometimes (filter link) |
| **Chip** | removable selection (filters, recipients) | yes — remove ×, sometimes toggle |
| **Promo/meta chip** | "New", "Beta", "Most popular", "PRO" | no (or links to changelog) |

Never let one visual style serve two kinds — users learn "this shape = status" and you
must not break the lesson.

## Specs
```
Height      20px (dense/table) · 24px (default) · 28px (filter chips)
Padding-x   8–10px · with dot/icon: 6px gap
Type        11–12px (badge) · 13px (chip) · weight 500–600 · NO all-caps chips;
            caps ok for tiny status badges with +0.05em tracking
Radius      full-pill (status/chips) or radius-sm 4–6px (tags) — pick ONE per product
Colors      tinted background (semantic -subtle token) + strong text + optional dot
            e.g. success-subtle bg + success text · NEVER solid saturated bg with white
            text for everything (screams of 2015 Bootstrap)
```

## Status badges (the workhorse)
- Vocabulary fixed product-wide: define the full state list in `memory/design.md`
  (Active/Paused/Failed/Draft…) — synonyms (Enabled vs Active) are bugs.
- Color + **dot or icon + label** — never color alone (`foundations/accessibility.md`).
- Neutral states exist: Draft/Archived get gray, not a semantic color. Not everything is
  good or bad.
- In tables: same column position, same width feel (don't let "Deprovisioning" blow up a
  column a two-state design assumed).

## Count badges
- On icons: 16–18px circle, top-right overlap, tabular-nums, cap at "99+".
- Zero = absent, not "0". A visible zero is noise; disappearing teaches the signal.
- Live updates pulse ONCE (`motion/micro-interactions.md` change highlight), never bounce
  perpetually.

## Chips (interactive)
- Anatomy: optional leading icon/avatar → label → remove ✕ (its own 24px hit target,
  `aria-label="Remove <label>"`).
- Keyboard: chip focusable; Backspace/Delete removes when focused; input-adjacent chips
  (recipient fields) integrate with the input's caret flow.
- Overflow: wrap up to 2 rows, then "+4 more" expander — never horizontal-scroll a chip row
  in a form.
- Applied-filter chips row (`components/tables.md` filters): one-click clear-all at the end.

## Promo chips ("New", "Beta", "PRO")
- Budget: ONE per viewport. Five "New" chips = zero new chips.
- "New" expires — set a removal date in `memory/todo.md` at creation (stale "New" from
  8 months ago is an anti-trust signal).
- "Beta" must mean something defined (stability? support level?) — link or tooltip it.
- Plan-gate chips ("PRO") style consistently with the upgrade surface, and click through
  to the upgrade story, never to a dead end.

## Anti-patterns
- Rainbow tag systems (12 user-created tags = 12 saturated colors — auto-assign from a
  designed 6-color muted ramp and recycle)
- Badge-as-button (if it's clickable, it needs affordance — make it a chip or a link)
- ALL-CAPS pill soup in tables ("ACTIVE" "SYNCED" "ENABLED" shouting in every row)
- Chips for non-removable facts (that's a tag; the ✕ implies agency)
- Status badge vocab drifting per page (Failed vs Error vs Errored)

## Checklist
- [ ] Every badge/chip mapped to one taxonomy kind; styles don't cross kinds
- [ ] Status: fixed vocabulary + dot/icon + never color-only; neutrals for neutral states
- [ ] Counts: cap 99+, zero disappears, tabular-nums
- [ ] Chips: remove target ≥24px, keyboard path, wrap-then-expand overflow
- [ ] ≤1 promo chip per viewport; "New" has an expiry note
