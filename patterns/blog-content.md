# Blog & Content Design

The blog is where a brand proves it thinks. Layout can't fake substance — but bad reading
design can bury good substance. The metric: **finished reads**, not pageviews.

## The article page (the product)
```
Measure     660–720px · body 18–20px · line-height 1.7 · the foundations/typography.md
            prose rules at maximum strictness
Header      category eyebrow → title (display scale, balance) → dek (1–2 sentence
            standfirst, text-lg secondary) → byline block (real author: face, name, role,
            date, read time)
Rhythm      h2 every 3–5 paragraphs (the F-pattern defeat — psychology/attention.md) ·
            images/diagrams as argument, not decoration · pull-quotes sparingly (1–2)
Footer      author card (bio + more-by) → related posts (3, same topic) → ONE CTA
            relevant to the article's topic — not a generic product pitch
```
- Links: underlined in prose (a11y law), external marked subtly.
- Figures: captioned (13px muted), full-measure or deliberate bleed (one language),
  dimensions set (CLS), zoomable when detail matters.
- Reading progress bar for 1500+ words (`motion/page-and-scroll.md` allowed set);
  estimated read time honest (225 wpm).
- Footnotes/asides: margin notes at wide widths, tap-expandable inline on mobile —
  never numbered teleports to page bottom with no way back.

## Content credibility (with `psychology/persuasion.md` authority)
- Real named authors with real faces — "Team" bylines waste the trust a face earns.
- Claims cited (linked, dated); data posts show methodology; updated-date shown when
  material ("Updated Jul 2026" builds trust; silent edits burn it).
- Opinions labeled as such. Engineering blogs: the honest post-mortem outperforms ten
  we're-so-great posts (`industries/analytics-hosting.md`).

## The index (blog home)
- **Featured + grid:** 1 hero card (latest/best: image, title, dek) + 2–3 secondary +
  chronological grid below (`components/cards.md` blog recipe).
- Category filter as chips/tabs — 4–7 categories max, each with real volume (a category
  with 2 posts is a tag).
- NO infinite scroll above the footer; paginate (`components/tables.md` doctrine applies).
- Thumbnails: a designed system (template per category with title-typography, or real
  art per post) — random stock per post makes the grid look like an ad network.

## Newsletter capture (the conversion layer)
- One placement mid-article (after value delivered, ~60% depth) + one in the footer —
  never a popup at second three (`components/modals.md` anti-patterns).
- The ask states cadence + content ("One essay on design systems, monthly") — vague
  "subscribe for updates" converts the uncommitted who then never open.

## Content SEO (this is the organ SEO grows in — `checklists/seo.md`)
- One search intent per post; title tag = the query's answer promise; H1 may differ
  (crafted for readers).
- Article structured data + author entity; og:image per post DESIGNED (the social card is
  the real first impression — title legible at 400px wide).
- Internal links: every post links 2–4 older relevant posts (topic clusters); orphan
  posts are invisible posts.
- Slugs short and dateless (`/design-tokens-guide`, not `/2026/07/10/a-complete-guide…`).

## Anti-patterns
- Hero images that are stock metaphors (lightbulbs, chess pieces) — no image beats a
  filler image
- 14 tags per post, none with an index page worth visiting
- Auto-playing anything mid-article; ads-shaped internal promos mid-paragraph
- "5-minute read" on a 3,000-word post (they check)
- Walls of untitled paragraphs (the skim-reader gets nothing —
  `psychology/attention.md` layer-cake)
- Comment sections nobody moderates (dead/spam comments = abandoned-building signal;
  no comments beats bad comments)

## Checklist
- [ ] Prose spec at maximum; header anatomy complete; real bylines
- [ ] H2 rhythm, cited claims, honest dates, designed figures
- [ ] Index: featured+grid, real categories, designed thumbnails, pagination
- [ ] Newsletter: two placements, specific promise, zero popups
- [ ] Per-post: one intent, designed og:image, 2–4 internal links, clean slug
