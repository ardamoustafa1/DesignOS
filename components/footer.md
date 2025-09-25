# Footer

The footer is where serious visitors go to judge you: investors, procurement, job seekers,
and buyers doing due diligence. Big, organized footers signal established companies.
It's also the last conversion chance on every page.

## Principles
1. **The footer is a sitemap with typography.** Comprehensive, grouped, quiet.
2. **Nobody bounces from a good footer — they were leaving anyway.** Density is fine here; this is the one place link-rich beats minimal.
3. **End with an ask.** A pre-footer CTA band converts readers who made it to the bottom — they're the most engaged visitors on the page.

## Anatomy (top to bottom)

```
[ Pre-footer CTA band ]     — optional but recommended on marketing pages
[ Main footer grid ]        — brand column + link columns
[ Legal bar ]               — copyright, legal links, locale/theme switches
```

### Pre-footer CTA band
- One headline (repeat the core promise, shorter), one primary CTA, optional secondary.
- Visually distinct: accent-tinted surface, inverse block, or the page's single gradient moment.
- Padding-y 64–96px. This is a *section*, not a banner.

### Main grid
```
Desktop:  brand column (3–4 cols) + 3–4 link columns (2 cols each)
Tablet:   brand full-width row + link columns 2×2
Mobile:   brand block, then link groups as accordions or stacked lists
Padding:  64–96px top, 48 bottom · background: --bg-surface or inverse
```
- **Brand column:** logo (smaller than nav, monochrome ok) → one-line description → social icons (20px, muted → primary hover) → optional compliance badges (SOC2/ISO — real ones only).
- **Link columns:** 13px caps muted group label (Product / Company / Resources / Legal) → 5–8 links, 14–15px, `--text-secondary`, 12px row gap, hover → `--text-primary` (no underline needed at this density, but underline on hover is fine — pick one).
- **Newsletter block** (if used): single email input + button in one row, one-line value promise, privacy microcopy. Lives in brand column or its own column — never a full-width interruption mid-footer.

### Legal bar
- Hairline top border; 13px muted; © year auto-updated; Privacy/Terms/Cookies links.
- Right side: locale selector, theme toggle, status page link ("All systems operational" dot — great trust signal for SaaS/hosting).

## Content strategy
- Column taxonomy that fits most products: **Product** (features, pricing, changelog, integrations, docs) · **Company** (about, blog, careers, press, contact) · **Resources** (guides, community, support, API status) · **Legal/Compliance**.
- Careers link says "Careers — we're hiring" when true; changelog link with a "New" chip drives return visits.
- Every link must resolve. A footer full of `#` hrefs fails review instantly.

## Tone variants
- **Startup (small footer):** single row — logo, 4–6 links, socials, legal line. Honest beats inflated: a 4-column footer of dead links looks worse than a clean one-row footer.
- **Enterprise:** full grid + compliance badges + office locations if trust demands it.
- **Dark footers on light sites:** classic grounding move; ensure link contrast recalculated for the inverse surface.

## Anti-patterns
- Footer nav ≠ header nav in naming (same page, different labels = confusion)
- Social icons in brand colors (rainbow row) — monochrome, hover reveals
- Giant logo, three links, 200px of emptiness (the "we ran out of ideas" footer)
- Auto-playing map embeds; heavyweight widgets (footer must not cost LCP/INP)
- Back-to-top buttons on short pages; missing on genuinely long ones

## Checklist
- [ ] Pre-footer CTA present on marketing pages
- [ ] Groups labeled, links real, taxonomy sane
- [ ] Legal bar complete; © year current
- [ ] Contrast valid on footer surface (inverse recalculated)
- [ ] Mobile: readable stacking or accordions, 44px touch rows
- [ ] Footer weight matches company stage (no fake bigness, no false modesty)
