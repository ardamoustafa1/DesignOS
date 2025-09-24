# SEO Checklist

Structural findability — enforced by the `seo` agent at Design Loop stage 7. Marketing
surfaces: mandatory. Apps/internal tools: skip with a stated reason.

## Intent & structure
- [ ] Page targets ONE primary intent/query family (recorded in `memory/pages.md`)
- [ ] `<h1>` states it; exactly one; heading outline = the answer's table of contents
- [ ] URL slug short, hyphenated, meaningful, stable
- [ ] Content answers the intent above the fold (search visitors bounce faster than anyone)

## Metadata
- [ ] `<title>` unique, ≤60ch, promise-first (not "Home | Brand")
- [ ] Meta description ≤155ch — written as the reason to click (copywriter voice, not keyword soup)
- [ ] Canonical tag correct (esp. with params/variants)
- [ ] og:title/description/image (1200×630, designed — `checklists/pre-flight.md`) + twitter:card
- [ ] Favicon suite; `lang` attribute correct; hreflang where multi-locale

## Structured data (JSON-LD)
- [ ] Organization (sitewide) · page-type schema: Product / FAQPage / Article / BreadcrumbList / SoftwareApplication as applicable
- [ ] FAQ section marked up (`patterns/landing-pages.md` — free rich-result real estate)
- [ ] Validated syntax; NOTHING marked up that isn't visible on-page (penalty bait)

## Semantics & crawlability
- [ ] Content renders without JS (progressive enhancement doctrine — shared with performance)
- [ ] Internal links: real `<a href>`, descriptive anchors (never "click here"/"learn more" as the only text)
- [ ] Footer sitemap coherent; nav labels = page titles conceptually (`components/footer.md`)
- [ ] Images: descriptive filenames + alt (a11y overlap); no headline text baked into images
- [ ] robots.txt sane; sitemap.xml present and current (full sites)
- [ ] No orphan pages (every page reachable ≤3 clicks from home)

## Core Web Vitals (ranking inputs — shared gate)
- [ ] `checklists/performance.md` passed — LCP/CLS/INP are SEO items too
- [ ] Mobile rendering verified (mobile-first indexing means 375px IS the page)

## Honesty gate
- [ ] Zero keyword stuffing, hidden text, doorway pages, fake markup
- [ ] Copy quality bar outranks keyword density everywhere (`agents/seo.md` boundaries)

**Verdict:** ☐ PASS ☐ FAIL ☐ SKIPPED (reason: ____) — findings ranked INDEXING BLOCKER → HIGH → MEDIUM → NICE.
