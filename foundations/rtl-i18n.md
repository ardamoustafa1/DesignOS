# RTL & Internationalization

**Status: added after a field stress-test found this coverage missing** (see
`evals/field-report-001.md`). A design system that claims worldwide relevance and has
no RTL specification is making a claim it can't back — Arabic, Hebrew, Persian, and
Urdu alone represent 500M+ speakers. This module closes that gap.

## The core discipline: logical properties, always

The single highest-leverage rule: **write CSS in logical properties from day one**, even
for LTR-only projects. Retrofitting RTL onto a physical-property codebase (`margin-left`,
`left`, `text-align: left`) is a rewrite; building on logical properties from the start
makes RTL a **one-line flip** (`dir="rtl"` on `<html>`).

```css
/* NEVER (physical — breaks under RTL) */
margin-left: 16px; padding-right: 24px; left: 0; text-align: left; border-left: 1px solid;

/* ALWAYS (logical — flips automatically with `dir`) */
margin-inline-start: 16px; padding-inline-end: 24px; inset-inline-start: 0;
text-align: start; border-inline-start: 1px solid;
```

Layout: `display: flex; flex-direction: row` already flips correctly under `dir="rtl"` —
don't manually reverse it. Grid: `grid-template-columns` order also flips automatically.
The only manual work is content that was hardcoded physical.

## What mirrors, and what doesn't (the part people get wrong)

Mirroring is not "flip everything" — it's flip *directional* meaning, preserve *universal*
meaning. This distinction is where naive RTL implementations fail review:

| Mirrors (direction-dependent) | Does NOT mirror (universal) |
|---|---|
| Back/forward chevrons, breadcrumb arrows | Play, pause, refresh, undo/redo icons |
| "Next/Previous" button order | Clocks, calendars (numbers stay LTR-read) |
| Progress bars, carousels, sliders | Media controls (volume, skip) |
| Sidebar position (nav often flips to right) | Checkmarks, warning/error icons |
| Text alignment, table column order | Brand logos (never mirror a wordmark) |
| Form label-to-input relationship | Phone numbers, emails, URLs (stay LTR even in RTL flow) |
| Icon-with-text pairs (icon follows reading start) | Charts' numeric axes (numbers LTR internally) |

Rule of thumb: if the icon represents **sequence or direction**, it mirrors. If it
represents **a real-world object or a fixed convention**, it doesn't. When unsure, check
how the OS/platform (iOS, Android, Windows) handles that exact icon in RTL — don't invent
a new convention (`psychology/cognition.md` Jakob's Law applies to RTL too).

## Bidi text (the genuinely hard part)

Real interfaces mix RTL prose with LTR tokens (an Arabic sentence containing an English
product name, a phone number, a price). Browsers handle base bidi via the Unicode
Bidirectional Algorithm automatically for plain text, but **isolate embedded LTR content
explicitly** wherever it's user-generated or dynamic, to prevent scrambling:

```html
<!-- Arabic paragraph containing an English brand name and a number -->
<p>نستخدم <bdi>Stripe</bdi> للدفعات، حتى <bdi>4,200</bdi> عملية يوميًا.</p>
```

- `<bdi>` (bidirectional isolate) around any dynamically-inserted content whose
  directionality is unknown at author time — usernames, product names, search queries.
- `dir="auto"` on inputs/textareas that accept mixed-script user content — lets the
  browser detect direction from the first strong character instead of inheriting the
  page's `dir`.
- Numbers stay LTR-internally always (١٢٣ Eastern Arabic numerals aside — Western digits
  used in most modern Arabic UI read left-to-right even mid-RTL-sentence); never manually
  reverse a number string to "fix" its position.

## Typography for non-Latin scripts

- **Arabic/Urdu (Nastaliq/Naskh):** taller x-height needs, generous line-height (1.7–1.9
  vs. Latin's 1.6), a script-appropriate typeface (system Arabic fonts — San Francisco
  Arabic, Segoe UI Arabic, Noto Naskh Arabic) — Latin fonts render Arabic ugly or not at
  all; never fake it with a Latin font-family and hope for fallback.
- **Hebrew:** shorter descenders than Latin, works well at Latin-comparable line-heights;
  bold weights render heavier visually — recalibrate the weight scale per script.
- Mixed-script pages (e.g., an app with Arabic UI + Latin code blocks): code blocks and
  `<pre>` content stay LTR always (`dir="ltr"` explicit), regardless of page direction —
  code is not language content (`components/code-blocks.md`).
- Letter-spacing/tracking rules from `foundations/typography.md` are **Latin-specific** —
  do not apply negative tracking to Arabic or Hebrew display type; connected scripts
  (Arabic) break visually when letterforms are forced apart or together.

## Locale-aware formatting (beyond RTL — this applies LTR too)

- **Numbers:** thousands/decimal separators vary (1,234.56 vs. 1.234,56 vs. ١٬٢٣٤٫٥٦) —
  use `Intl.NumberFormat`, never string-template numbers.
- **Dates:** format order varies (MM/DD/YYYY US, DD/MM/YYYY most of world, YYYY-MM-DD
  ISO/Asia-common) and some locales use non-Gregorian calendars (Hijri, Persian) as a
  primary or parallel system — `Intl.DateTimeFormat`, never hardcoded format strings
  (`components/pickers.md` date picker doctrine extends here).
- **Currency:** symbol position varies (leads in most Latin locales, trails in some
  European ones), and *which* currency displays should follow the user's locale/region,
  not just their language — `Intl.NumberFormat` with `style: 'currency'`.
- **Names:** don't assume "first name / last name" — many cultures use single names,
  patronymics, or family-name-first order; prefer one `full_name` field over rigid
  first/last splitting unless the product genuinely needs the split.

## Testing protocol (add to the review loop's edge-attack list)

`loops/design-loop.md` and `agents/reviewer.md` edge-attacks now include, for any product
with non-English locales in scope:
1. Force `dir="rtl"` and walk the entire flow — nav, forms, tables, modals, charts.
2. Check icon mirroring against the table above — flag any icon that mirrored but
   shouldn't have (or vice versa).
3. Test with a long mixed-script string in every text-truncating UI element (chips,
   table cells, breadcrumbs) — bidi truncation bugs are common and ugly.
4. Verify numbers, dates, currency render via `Intl` APIs, not string templates.
5. Zoom/reflow test at 200% with the target script — some scripts need more vertical
   space than the Latin-tuned line-height assumed.

## Anti-patterns

Physical CSS properties in a project with RTL in scope · mirroring universal icons
(mirrored play buttons, mirrored clocks) · Latin fonts force-applied to Arabic text ·
hardcoded "First name / Last name" forms · string-templated numbers/dates/currency ·
negative letter-spacing on Arabic/Hebrew display type · code blocks that flip direction ·
treating RTL as a low-priority "nice to have" for products with real RTL-market users.

## Checklist

- [ ] All spacing/position CSS uses logical properties, project-wide
- [ ] Icon mirroring audited against the direction-vs-universal table
- [ ] `<bdi>`/`dir="auto"` applied to dynamic/user-generated mixed-script content
- [ ] Script-appropriate typeface + line-height for non-Latin scripts in scope
- [ ] Numbers, dates, currency via `Intl` APIs, not templates
- [ ] Full `dir="rtl"` walkthrough completed before ship, per the testing protocol
