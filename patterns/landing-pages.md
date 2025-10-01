# Landing Pages

A landing page is an argument with a structure: claim → mechanism → proof → objections →
ask. Every section is a paragraph in that argument. Sections that don't advance the
argument get cut, no matter how pretty.

## The canonical spine

```
1. NAV          identity + escape routes + CTA                    components/navigation.md
2. HERO         the claim + first proof cue                       components/hero.md
3. LOGOS        borrowed trust (may live inside hero)             foundations/iconography.md
4. PROBLEM      optional — agitate only if the pain isn't obvious
5. HOW/FEATURES the mechanism: 3 features or sticky product tour  below
6. PROOF        deep evidence: case metric, testimonial, demo     psychology/persuasion.md
7. PRICING      or CTA-to-pricing for complex sales               patterns/pricing.md
8. FAQ          objection handling in disguise
9. FINAL CTA    the pre-footer band: repeat promise + ask         components/footer.md
10. FOOTER      the due-diligence layer                           components/footer.md
```

Deviations are decisions: developer tools may put a code demo at #2; marketplaces put
search in the hero; enterprise adds a security section before pricing. Record deviations
+ reasons in `memory/pages.md`.

## Section craft

### Features (the mechanism section)
- **Three is the number.** Pick the 3 that map to the top 3 buyer problems; the rest live on a features page. 6+ equal cards = nobody remembers any.
- Each feature: eyebrow (category) → benefit headline (outcome language, not noun-naming: "Know before it breaks" not "Monitoring") → 2 lines mechanism → visual evidence (real UI crop > icon).
- Formats by content: **bento** (feature breadth, one hero cell — `foundations/grids.md`) · **zig-zag** (3 deep features with big screenshots) · **sticky tour** (workflow story — `motion/page-and-scroll.md`) · **tabbed demo** (one surface, multiple modes).

### Problem section (use sparingly)
Only when the audience doesn't already feel the pain (new categories). Two beats max:
the costly status quo (specific: "4 hours/week lost to…") → pivot to mechanism. Skip for
obvious pains — agitating a known pain wastes scroll budget.

### Proof section
One *deep* proof beats five shallow ones: a case study block (customer logo + context
sentence + big metric + quote + face) is the strongest single section in B2B.
Rotate proof types across the page (`psychology/persuasion.md` placement).

### FAQ
- 5–8 questions, real objections (price, security, migration, lock-in, "vs X") — not softballs.
- Accordions (single-open), schema.org FAQ markup (`checklists/seo.md`), last item links to contact/support.

### Final CTA band
Highest-intent zone on the page. Short repeat of the core promise (5–8 words), primary CTA,
risk-reversal microcopy. One proof echo (rating stars or a one-line quote) is allowed;
a *new* argument is not — the arguing is done.

## Page-level rhythm & attention
- Section padding rhythm with deliberate tempo changes (`foundations/spacing.md`); alternate surface tints (page ↔ subtle) to delineate sections without divider lines — max 2 background switches.
- Each section: one dominant element; heading scan alone must carry the whole argument (`psychology/attention.md` layer-cake test).
- CTA cadence: hero → mid-page (after proof) → final band. Between: zero competing asks (newsletter boxes mid-argument are self-sabotage).
- Scroll animations obey the depleting budget (`motion/page-and-scroll.md`).

## Copy system (with `agents/copywriter.md`)
- One reader, one promise, one voice: define the target persona sentence in `memory/client.md` and write every headline to them.
- Headline stack coherence: hero claims outcome → section headlines each claim a sub-outcome → no headline restates another.
- Concrete beats clever everywhere except the hero, where memorable-and-clear ties break toward clear.

## Conversion mechanics
- Primary conversion = ONE action (trial/demo/waitlist). Secondary (docs, video) styled ghost everywhere.
- High-ticket B2B: "Book a demo" pages pair the ask with what-happens-next ("30 min, no deck, live product") — uncertainty kills demo bookings.
- Waitlist pages (pre-launch): hero + 3 proof bullets + email field + position feedback ("You're #214") + share loop.
- Measure: define the page's one metric before designing (signup rate / demo rate / scroll-to-pricing) and instrument it.

## Anti-patterns
- Slogan hero + feature dump + "contact us" (no argument, just inventory)
- 9 sections of alternating image/text sameness (rhythm coma)
- Carousel *anything* on a conversion path
- Mid-page newsletter interrupts; chat widgets auto-opening at 3s
- Claims of "loved by thousands" above four G2 reviews (proof must match claim volume)
- Video hero that needs sound; background video over 2MB

## Checklist
- [ ] Spine present or deviations recorded with reasons
- [ ] Headline-only read = complete argument
- [ ] 3 features mapped to top 3 buyer problems, each with visual evidence
- [ ] One deep proof; types rotated; all real
- [ ] CTA cadence clean; single conversion goal
- [ ] FAQ handles the actual objections incl. "vs competitor"
- [ ] Full checklists pass: `pre-flight`, `seo`, `performance`, `responsive`
