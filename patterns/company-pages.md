# Company Pages — About, Careers, Contact

The "who are these people" layer. Prospects, candidates, journalists, and procurement all
end up here doing the same thing: looking for evidence of real humans and real competence
behind the claims (`components/footer.md` — the due-diligence reader).

## About
```
Spine:  the WHY (origin/mission in ≤3 short paragraphs, specific, zero mission-statement
        soup) → the numbers strip (founded, team size, customers, funding — real only)
        → the team → investors/press logos (if real) → values (only if they cost
        something — see below) → CTA (join us / try product)
```
- **Origin stories work when concrete:** "We were the on-call team; we built the tool we
  needed" beats "We believe in empowering synergy." Name the moment, the problem, the year.
- **Values sections earn their space only with receipts:** a value stated with a practice
  attached ("Default to transparency — our metrics dashboard is public") is credibility;
  five abstract nouns on cards is wallpaper. No receipts → cut the section.
- Mission voice: `agents/copywriter.md` ban-list applies doubly here.

## The team section
- Real photos, one consistent style (same crop/grade/background family — mixed selfies
  and LinkedIn crops read as chaos; a photo *system* reads as culture).
- Name + role; links (LinkedIn/GitHub) optional; fun-fact hover flips only if the brand
  is genuinely playful (`memory/brand.md` voice).
- Small team? Show it proudly — 6 real faces beat a padded grid. Big team? Leadership +
  a real team-wide photo, not 200 tiles.
- Founders visible for early-stage (investors and enterprise buyers look for them).

## Careers
- **The jobs list is the page.** Above any culture prose: open roles — title, team,
  location/remote, type — filterable when >8 (`components/tables.md` lite). "No openings
  right now + talent-pool email" beats hiding the page.
- Sell honestly: what's hard about working here too ("early stage, ambiguity daily") —
  the filter is the feature; wrong-fit applicants cost everyone.
- Show: real benefits (concrete: "€2k learning budget", not "competitive package"),
  interview process steps with timeline (candidates rank this above perks), salary ranges
  where law or courage permits (increasingly the norm and a differentiator).
- Job detail pages: role mission → what you'll do (first-90-days flavored) → requirements
  split MUST vs NICE (over-long must-lists filter out great candidates, disproportionately
  women — 5 musts max) → team context → process → apply (`components/forms.md`: ≤5 fields
  + CV/LinkedIn; a 40-field ATS iframe is a 70% abandonment machine — at minimum restyle it).

## Contact
- **Route by intent, not one dumb form:** Support (→ help center/email with response-time
  promise) · Sales (→ short form or calendar) · Press (→ email + press-kit link) ·
  Security (→ security.txt/disclosure — `industries/cybersecurity.md`) · General.
  Four labeled doors beat one funnel to a shared inbox nobody owns.
- A real email address VISIBLE (form-only contact reads as evasion —
  `industries/portfolio-agency.md` doctrine); physical address + legal entity where
  regulation or trust demands (fintech/health: mandatory — `industries/` files).
- Forms: name/email/message, that's it; confirmation states the SLA ("We reply within
  1 business day") and honors it.
- Sales contact: what-happens-next disarms ("30 min, live product, no deck" —
  `patterns/landing-pages.md` demo doctrine).

## Press/media kit (one quiet page, huge leverage)
Logo pack (SVG/PNG, light+dark, usage one-liner), founder photos (print-res), boilerplate
paragraph, key facts, press contact. Journalists on deadline write about whoever makes
it easy (`industries/gaming.md` presskit doctrine generalized).

## Anti-patterns
- Mission-statement bingo ("empowering people to unlock potential through innovation")
- Stock photos of not-your-team · values with no practices · culture-page ping-pong tables
- Careers pages that are 90% culture video, 10% findable jobs
- Contact forms that route to /dev/null (test the SLA quarterly — `loops/review-loop.md`
  rot detection)
- Hiding the entity/address on a product that charges money

## Checklist
- [ ] About: concrete origin, real numbers, receipts-or-no-values
- [ ] Team: photo system, real people, right depth for company size
- [ ] Careers: jobs first, honest sell, process + concrete benefits, ≤5-must requirements,
      humane apply form
- [ ] Contact: intent-routed doors, visible email, stated + honored SLA
- [ ] Press kit exists; entity/address where trust or law demands
