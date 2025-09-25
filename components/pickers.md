# Pickers — Date, Time, Color & Advanced Selects

Pickers are micro-applications inside forms. Each one trades a free-text field's speed
for structure — the trade only pays if the picker is faster than typing. When it isn't,
you've built a cage.

## Date picker
```
Input       masked text field FIRST (users type dates faster than they click them):
            placeholder shows format (DD.MM.YYYY per locale) · calendar icon opens picker
Calendar    month grid · 40px day cells · today outlined · selected filled accent ·
            weekend/muted-month days visually distinct · week starts per locale
Header      month/year label as TWO fast controls (month dropdown + year input/spinner —
            birthdays need 1987 without 400 clicks) + prev/next chevrons
Keyboard    arrows move days · PgUp/Dn months · Enter selects · Esc closes · typed input
            always works in parallel
```
- **Context tunes the default view:** birthday → year-first entry; booking → next 60 days
  with disabled past; deadline → this month. One calendar widget, context-aware configs.
- Disabled dates: visibly muted AND explained (tooltip: "Fully booked" —
  `components/tooltips-popovers.md` disabled doctrine).
- Relative shortcuts where the domain thinks that way: Today / Tomorrow / Next Monday
  chips above the grid (scheduling tools live on these).

## Date RANGE picker
- Two-in-one calendar (dual month panes on desktop); first click = start, second = end,
  hover previews the span (tinted); clicking before start restarts cleanly.
- **Preset ranges are the real UI:** Last 7 days / 30 days / This month / Quarter / Custom —
  80% of analytics range-picking is presets (`components/dashboard.md` timeframe);
  the calendar is the escape hatch.
- Show the resolved dates always ("Last 30 days · Jun 10 – Jul 10") — presets that hide
  their math breed off-by-one distrust.

## Time picker
- Type-first: masked input (HH:MM, locale 12/24h) with a dropdown of 15/30-min increments
  as accelerator — the iOS-style wheel is touch-only furniture.
- Duration vs. clock-time are different controls (a 90-min meeting length ≠ 14:30) —
  don't force clock UI onto durations ("1h 30m" stepper/quick-chips instead).
- **Timezones (the silent killer):** show the assumed zone whenever times cross users
  ("14:00 GMT+3 — your time") · store UTC, display local, SAY which is shown. Scheduling
  across zones: show both parties' local times.

## Color picker
- Product contexts (labels, calendars): a **designed palette of 8–12 swatches** beats a
  free spectrum — curation prevents the rainbow-chaos the tag system will otherwise
  become (`components/badges-chips.md`).
- Design-tool contexts: full picker = spectrum area + hue slider + alpha + **hex/rgb input
  that accepts paste in any format** + eyedropper where supported + recent colors.
- Show the color IN CONTEXT (label preview with the text on it) — a swatch in a vacuum
  lies about contrast; surface an AA warning when the pick will carry text
  (`foundations/accessibility.md`).

## Advanced selects (combobox, multi-select, cascader)
- **Combobox** (>15 options — `components/forms.md` ladder): input + filtered list ·
  highlights match · arrows + Enter · free-text allowed only if the domain allows new
  values (then "Create '<x>'" as an explicit list item — the tag-creation pattern).
- **Multi-select:** selected items as chips in the field (`components/badges-chips.md`
  chip rules: remove targets, Backspace) · list shows checkmarks, stays OPEN during
  multi-picking (closing per pick is rage-inducing) · "n selected" summary collapse
  beyond ~4 chips.
- **Cascader** (hierarchies: category → subcategory): columns beat nested dropdowns;
  breadcrumb shows the path; search flattens the tree ("jump to leaf directly").
- All of them: loading state in-list (async options), empty state with create-or-clear
  exits, virtualized past ~200 options.

## Universal picker rules
1. Typing is never punished — every picker has a text path.
2. The field always displays the CURRENT value in reading format, never a raw token
   ("Jul 10, 2026", not "2026-07-10T00:00:00Z").
3. Mobile: pickers become bottom sheets (`components/modals.md`) or native inputs
   (`<input type="date">` is fine when styling permits — native beats a cramped custom
   calendar on a phone).
4. Clear affordance when the field is optional (✕ to unset).

## Anti-patterns
Dropdown-only year selection spanning 1920–2026 · range pickers without presets ·
timezone-less times in cross-zone products · spectrum pickers for label colors ·
multi-selects that close per selection · pickers that open on focus AND block the typed
path · custom mobile calendars worse than the native control they replaced

## Checklist
- [ ] Every picker has a parallel typed path; value displays human-readable
- [ ] Date: locale format/week-start, fast year travel, explained disabled dates
- [ ] Range: presets + resolved-dates label; hover span preview
- [ ] Time: 12/24h locale, duration ≠ clock, timezone stated when it matters
- [ ] Selects: correct tier for option count, multi stays open, create-new explicit
- [ ] Mobile: sheet or native; keyboard complete everywhere
