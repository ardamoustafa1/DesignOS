# Attention — Where the Eye Goes

Design is attention engineering. You don't get to decide *whether* users scan — only
*what the scan finds*.

## Scanning patterns (and when each applies)

### F-pattern
Text-heavy pages (articles, search results, docs): two horizontal sweeps near the top,
then a vertical skim down the left edge. Consequences:
- Front-load meaning: first 2 words of headings/links carry the click decision.
- Left edge is prime real estate — bullets, keywords, and numbers live there.
- Nobody reads the bottom-right of a text wall. Don't put the CTA there.
- Defeat the F (when you must): break the wall with subheads every 3–4 paragraphs, pull-quotes, and visuals — each restarts attention.

### Z-pattern
Sparse marketing layouts: top-left (logo) → top-right (CTA/nav) → diagonal through the hero →
bottom-right (action). Consequences:
- Navbar CTA top-right isn't a convention, it's a fixation point.
- The diagonal should cross your headline and key visual.
- Section-ending CTAs bottom-right (or centered after the content column) land on the natural exit.

### Layer-cake / spotted (real behavior on modern pages)
Users scan headings + bold + images, skipping prose entirely. Design for the skim-reader:
the page must make its full argument through **headlines + visuals + captions alone**.
Test: read only the headings top to bottom — is the pitch complete?

## Visual weight — the attention currency
Ranked levers (spend deliberately, budget is finite):
1. **Motion** (strongest — and most expensive; one moving thing owns the page)
2. **Faces** (humans look at eyes first, then follow the face's gaze — point faces at your CTA)
3. **Size contrast** (not size — *contrast*; 80px next to 16px, not 40px next to 32px)
4. **Color contrast** (the lone accent in a neutral field)
5. **Isolation** (whitespace moat — the cheapest, most underused lever)
6. **Position** (top-left start; center dominance)

Every lever spent on a non-priority element is stolen from the CTA. The "attention audit":
list the 3 heaviest elements on the screen — are they the 3 most important?

## Attention economics
- **One primary per viewport.** Two rivals split fixation; neither converts.
- **Progressive disclosure:** reveal complexity on demand (tabs, accordions, "show more") — but never hide the primary action or the price behind interaction.
- **Banner blindness is real:** anything shaped like an ad (boxed, right-column, stock-photo+text) is invisible. Integrate proof into content flow instead.
- **Change blindness:** updates outside the fixation point go unseen — animate the *changed value* (200ms highlight pulse) when data updates matter.

## Serial position effects
- First and last items in any list are remembered; the middle is mush. Order features accordingly: strongest first, second-strongest last.
- Same for page sections: hero (primacy) and pre-footer CTA (recency) are the persuasion bookends — `components/footer.md`.

## Visual noise budget
Attention is depleted by *everything*: every border, color, icon, and font-change withdraws.
- Count "attention events" per viewport (distinct colors, boxes, animations, weights). >7 = noise.
- Removing an element is a gift to every remaining element.

## Checklist
- [ ] Eye path declared (1st→2nd→3rd fixation) and enforced by weight ranking
- [ ] Headings-only read-through makes the complete argument
- [ ] First-2-words rule on headings, links, buttons
- [ ] Faces gaze toward content/CTA; one motion moment max
- [ ] Attention audit: 3 heaviest = 3 most important
- [ ] Primacy/recency spent on strongest content
