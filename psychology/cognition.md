# Cognition — Laws of Mental Load

The user's working memory is ~4 items, their patience is seconds, and their attention is
borrowed. Design is the art of spending as little of their cognition as possible.

## Hick's Law — choice has a price
Decision time grows with the number and complexity of options.
- Navigation ≤6 items; pricing = 3 tiers; hero = 1 primary action; settings grouped into ≤7 sections.
- Kill or defer options: "Advanced" disclosure, smart defaults, recommended badges.
- The paradox-of-choice moment to watch: templates/plans/integrations galleries — add curation ("Popular", "Recommended for you") or search, never a raw wall of 200 equal tiles.

## Decision fatigue
Every choice depletes the next one. Sequence flows so that:
- Early steps are trivial (email → name), commitment grows with investment (`psychology/persuasion.md` commitment).
- One decision per screen in wizards; combined mega-decisions ("choose plan + seats + billing cycle + add-ons") split apart.
- Defaults carry the tired user: the no-thought path must be a *good* path.

## Miller's Law — chunking (7±2, realistically 4)
- Group everything: form fields into sections, features into 3s, nav into labeled clusters, phone/card numbers into visual chunks (`components/forms.md` masking).
- Lists >5 items need grouping, ranking, or progressive reveal.

## Jakob's Law — users live on other sites
Expectations are imported: logo top-left→home, cart top-right, search magnifier, blue-ish underlined links in prose, ⚙ settings.
- Innovate in your *value*, standardize your *chrome*. A novel nav costs comprehension that your feature story then can't spend.
- Follow platform conventions on placement (dialog button order, mobile tab bars) — `components/` files encode these.

## Fitts's Law — targets: big, close, or edge
- Frequently used = larger + nearer to the interaction locus (the cursor/thumb, not abstract screen center).
- Screen edges/corners are infinitely deep targets (docks, ⌘K bars, close corners) — use them.
- Mobile thumb zone: primary actions bottom-half, destructive out of thumb's lazy arc; 44px minimum everywhere.
- Related controls adjacent (the "Save" far from the form it saves = a pilgrimage).

## Cognitive load types (reduce the right one)
- **Intrinsic** (task complexity): can't remove, but can sequence — wizards, sane defaults.
- **Extraneous** (interface noise): your fault — decoration, inconsistent patterns, mystery icons, jargon. Ruthlessly cut (`psychology/attention.md` noise budget).
- **Germane** (learning the system): invest once — consistent patterns mean lesson #1 applies everywhere. Consistency is compounding UX interest.

## Recognition over recall
- Never make users remember across screens: show the selected plan in checkout, the applied filters above results, the file name in the delete confirm.
- Autocomplete, recent items, and visual pickers beat blank fields asking for remembered strings.
- Icons without labels = recall tests. Label them (`foundations/iconography.md`).

## Goal-gradient effect
Motivation rises near completion:
- Progress bars start pre-filled (step 1 of 4 shows 25%, or "profile 20% complete" from signup alone).
- Onboarding checklists: first item pre-checked ("Created account ✓") — momentum is inherited.
- Show remaining, not just done, near the end ("1 step left").

## Peak-end rule
Experiences are remembered by their peak and their end, not their average.
- Engineer one peak: the aha-moment (first successful deploy/report/design) deserves the ceremony budget (`components/states.md` milestone success).
- Ends matter: the post-purchase page, the cancel flow, the offboarding email — most products end on their worst screen. End on grace (easy export, genuine thanks, door left open).

## Aesthetic-usability effect
Beautiful interfaces are *perceived* as more usable and are forgiven more errors. This is why
craft (`brain/quality-bar.md`) is not vanity: polish literally buys usability credit. It's also
a warning: your beautiful design will test better than it works — usability-test the ugly prototype.

## Checklist
- [ ] Choice counts within limits (nav ≤6, tiers = 3, 1 primary CTA)
- [ ] Everything chunked; no raw walls of options
- [ ] Chrome conventional (Jakob), value novel
- [ ] Targets sized/placed by frequency; thumb zone respected
- [ ] Zero cross-screen recall demands
- [ ] Progress pre-seeded; one designed peak; graceful end
