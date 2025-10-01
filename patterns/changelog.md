# Changelog & Release Notes

Momentum is a feature (`brain/reference-library.md` — Linear doctrine). A living changelog
sells to prospects ("they ship"), retains users ("my tool improves"), and re-engages the
churned. It's the cheapest marketing surface most products waste.

## The page
```
Layout     single column 680–760px · reverse-chronological entries · left time-rail
           (date markers, optional connecting line) or clean stacked cards
Entry      date + version (if versioned) → title (the HEADLINE change, benefit-phrased)
           → typed chips (New · Improved · Fixed · Deprecated — badges-chips.md status
           discipline, fixed vocabulary) → body: short prose + media → deep links
Media      the money: a crop/gif/15s-clip of the feature IN USE — release notes with
           visuals get shared; text-only gets skimmed (motion licensed: short loops,
           pausable, reduced-motion poster)
```
- Write benefit-first, feature-second: "Find anything in half the keystrokes — the new
  command palette…" not "Added CommandPalette v2".
- Voice: human, first-person-plural, brief. The changelog is where corporate voice can
  relax one notch (`agents/copywriter.md` register shifts).
- Fixed/minor items: grouped in a compact list per entry ("Also: 12 fixes —" expandable).
  Don't pad; a quiet week is a quiet entry, credibility comes from honesty.

## Cadence & grouping
- Ship-frequency products (weekly+): weekly digest entries beat 30 micro-entries.
- Big releases: a dedicated feature page/post (`patterns/blog-content.md`) with the
  changelog entry linking to it.
- Breaking changes: **Deprecated/Breaking chips + migration links + dates** — the
  changelog is a contract surface for API products (`patterns/docs-sites.md` versioning).

## Distribution (the entry is written once, travels five times)
1. The page itself (linked in footer — `components/footer.md`, with "New" dot when fresh)
2. **In-app "What's new"**: a badge-dotted menu item opening a panel of the last 2–3
   entries — read state tracked, never a blocking modal tour
3. Email digest (monthly, opt-in — `patterns/email-templates.md`)
4. Social cards: og:image per entry designed (the feature visual + title)
5. RSS/JSON feed — the power users and aggregators channel; trivially cheap, oddly rare

## For whom (three readers, one page)
- **Prospects** skim density and dates (is this alive?) — keep dates prominent.
- **Users** scan for "affects me" — typed chips + product-area tags enable it.
- **Churned users** return via the digest — each entry's deep link must work for a
  logged-out reader (marketing-page fallbacks, not app-only URLs).

## SEO & structure
Entries individually linkable (`/changelog/command-palette-v2`) with stable anchors;
one h1 for the page, h2 per entry; ItemList/Article structured data; the changelog often
ranks for "<product> updates" — let it.

## Anti-patterns
- "Bug fixes and performance improvements" as the entire entry (the app-store shrug —
  says "we stopped trying")
- Version-number soup with no human sentences (v2.4.1→v2.4.2 diffs are git's job)
- Marketing-hype register ("We're THRILLED to announce…" ×40 entries — thrill inflation)
- Dead changelog (last entry 8 months ago is worse than no page — delete or revive)
- In-app what's-new as a forced modal parade on login
- Silent breaking changes (the support-ticket generator)

## Checklist
- [ ] Entry anatomy: date, benefit-first title, typed chips (fixed vocab), visual, links
- [ ] Cadence chosen; minors grouped; breaking changes contracted with migration paths
- [ ] Footer link with fresh-dot; in-app panel with read state; RSS exists
- [ ] Entries deep-linkable + designed social cards
- [ ] Voice human; density honest; no dead months unexplained
