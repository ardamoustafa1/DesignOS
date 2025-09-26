# Tabs, Accordions & Segmented Controls

The progressive-disclosure trio. They all hide content — which means they all carry the
same risk: **hidden content is unread content.** Every use must earn the concealment.

## Choosing the mechanism
| Content relationship | Use |
|---|---|
| Parallel *views* of one thing (Overview/Activity/Settings of a record) | **Tabs** |
| Independent long sections, read selectively (FAQ, advanced options) | **Accordion** |
| Mutually exclusive *modes* changing data in place (Monthly/Annual, Chart/Table) | **Segmented control** |
| Sequential steps | neither — a wizard (`components/steppers-wizards.md`) |
| 2–3 short sections | nothing — just show them; disclosure has overhead |

## Tabs
```
Row        underline style (modern default): 14–15px · 500 · muted → primary
           active: 2px underline (accent or strong-neutral) + text-primary
           OR contained style (pills on surface) — one style per product
Height     40–44px row · items gap 24–32px (underline) / 4px (contained)
Indicator  slides between tabs 200ms ease-out (the licensed signature of tabs)
Overflow   horizontal scroll + edge-fade cue on mobile · never wrap to 2 rows · never
           hide tabs in a "More ▾" unless >6 (then reconsider the IA)
```

### Behavior
- Keyboard: roving tabindex, arrow keys move, `aria-selected` — selection-follows-focus for
  instant panels; Enter-activates for panels that load (pick per switching cost).
- **Tab state survives:** deep-linkable (`?tab=activity` or route), preserved on back-nav.
  A user losing their tab on refresh learns not to trust the page.
- Content height: keep the container stable when switching (min-height from tallest tab
  or animate height 200ms) — no page-length jumping.
- Badge counts in tab labels (Activity **12**): tabular-nums, muted.
- Lazy-load heavy panels; but never blank-flash — skeleton in-panel
  (`components/states.md`).

### Tabs vs. navigation (a common confusion)
If it changes the URL and the page, it's **secondary navigation** styled as tabs
(`components/navigation.md`) — fine, but then browser back works per-click and each "tab"
is an `<a>`, not `role="tab"`. Don't mix models in one row.

## Accordions
```
Header     full-width click target · 16px 500–600 · chevron trailing (rotates 200ms)
           padding-y 16–20px · hairline between items
Panel      opens 200–250ms (grid-rows technique — motion/performance.md) · body text
           14–16px secondary color · padding-bottom 20px
```
- **Single-open vs multi-open:** FAQs and settings: multi-open (users compare). Space-
  critical or step-flavored: single-open. Decide, record, keep.
- Icons: one chevron language — not +/− and chevron mixed.
- Semantics: header is a `<button aria-expanded>` inside a heading tag (h3) — screen-reader
  navigation depends on this.
- Never hide the page's PRIMARY content in an accordion (the pricing answer, the actual
  docs content) — the reader's main path stays open.
- Find-in-page should survive — prefer `hidden="until-found"` where supported.

## Segmented controls
```
One bordered/filled container · 2–4 segments (5 max) · equal or content-sized widths
Selection: sliding filled thumb 150–200ms · selected text-primary, rest muted
Height 32–36px (toolbar) / 40px (form context)
```
- It's an *input* (radio semantics), not buttons — the change applies instantly
  (`components/forms.md` toggle doctrine: if it needs Save, use radios).
- Classic uses: billing toggle (`patterns/pricing.md`), chart/table view, density switch,
  time ranges (1D/1W/1M/1Y — tabular widths).
- Both states must look "enabled" — the unselected side often accidentally looks disabled;
  verify contrast on muted segments.

## Anti-patterns
- Tabs for sequence ("Step 1 | Step 2 | Step 3" as tabs — no gating, no order)
- One-tab tab bars (it happens; delete it)
- Accordion-of-accordions; accordion inside a modal inside a tab
- Auto-collapsing the section the user just opened (scroll-jacked accordions)
- Segmented controls with 7 segments (that's a select)
- Mystery icons as tab labels (label them — `psychology/cognition.md` recognition)

## Checklist
- [ ] Mechanism matches content relationship (table above)
- [ ] Tabs: keyboard pattern, deep-linkable state, stable height, one visual style
- [ ] Accordion: button-in-heading semantics, chevron animation, multi/single decided
- [ ] Primary content never concealed; find-in-page survives
- [ ] Segmented: instant effect, ≤5 segments, unselected ≠ disabled-looking
