# Hero

The hero decides in 3 seconds whether the next 30 exist. It must answer three questions
in order: **What is this? Why should I care? What do I do next?**

## Anatomy

```
[ Announcement chip ]   optional — "Series B" / "v2.0 is here" pill, 13px, links out
EYEBROW                 optional — category anchor, caps 12–13px tracked
Headline                the claim · 6–12 words · 2 lines max
Subheadline             the mechanism + audience · 1–2 sentences · 18–20px
[ CTA row ]             primary + ghost secondary · anxiety microcopy beneath
[ Trust strip ]         logos or metric or rating — one credibility cue
[ Visual ]              product screenshot / demo / abstract — or nothing
```

Not every element every time — but this *order* whenever elements exist.

## Headline craft (with `agents/copywriter.md`)
- Formulas that work: **outcome** ("Ship docs your users actually read") · **capability + speed** ("Deploy in seconds, scale to millions") · **category redefinition** ("The CRM that runs itself") · **enemy** ("Meetings are broken. Fix them.").
- Specific beats grand: "Cut AWS costs 40%" > "Supercharge your cloud journey."
- Ban list: *supercharge, unleash, revolutionize, empower, seamless, next-generation, all-in-one* (unless literally the category).
- Typography: display scale with `clamp()` (`foundations/typography.md`), tracking −0.02 to −0.04em, `text-wrap: balance`, break lines by *meaning* (`<br>` or max-width tuned so clauses don't orphan).
- Gradient text: at most a 2–3 word span, only if it's the page's single gradient moment.

## Subheadline
- Job: convert the headline's claim into a believable mechanism. Name the user, the action, the result. 65ch max, `--text-secondary`, 1.6 line-height.
- Never a rephrase of the headline ("We help you do the thing the headline said").

## CTA row
- One primary + one ghost ("Get started" + "View docs →" / "Book a demo" + "Watch 2-min demo").
- Microcopy under primaries with commitment friction: "Free 14 days · No credit card".
- Height lg (48px); on mobile CTAs stack full-width, primary first.

## Trust strip
Choose ONE per hero (stacking all three = flea market):
- **Logo row:** 5–7 monochrome, 45–60% opacity, specific caption (`foundations/iconography.md`)
- **Metric:** "12,400 teams shipped this week" — real numbers only; placeholder → `memory/todo.md`
- **Rating/social:** G2/ProductHunt badge, star row + count

## Layout variants (choose by asset inventory — `brain/decision-framework.md`)
| Variant | When | Notes |
|---|---|---|
| **Split 55/45** | strong product screenshot | text left; visual may bleed right edge; screenshot framed (`foundations/iconography.md`) |
| **Centered spotlight** | pure message or centered demo below | max 800px column; only one element chain |
| **Editorial left** | brand plays confidence | oversized type, 8–10 cols, visual below or none |
| **Full-bleed visual** | photography sectors (real estate, travel) | scrim discipline; text zone cleared |
| **Product-first** | dev tools with wow-demo | slim text block, giant interactive/video demo, "the product is the hero" |

## Background treatments (one, subtle)
- Gradient mesh (the page's gradient moment) · dot/line grid fading out · soft radial glow behind the visual · plain (`--bg-page`) — the strongest choice more often than not.
- Decorative layers: `pointer-events: none`, contrast-checked under text, no parallax that moves text.

## Motion
- Entrance: one staggered sequence — headline → sub → CTA → visual, 300–500ms total, 40–80ms staggers, opacity + 8–16px translate-y, ease-out. Runs once. Nothing re-animates on scroll-up.
- The visual may own one signature move (screenshot tilt settling flat, demo autoplay muted).
- `prefers-reduced-motion`: all entrances collapse to plain visibility.

## Responsive
- 390px: headline drops 2 scale steps, visual moves below CTAs (or is cut if decorative), trust strip may compress to a single metric, everything still above a *complete-thought* fold.
- Test the awkward middle (768–1024): split heroes often break here first — stack earlier rather than squeeze.

## Anti-patterns
- Two primary CTAs · carousel heroes (nobody reads slide 2) · headline stating the company name (that's the logo's job) · auto-playing sound · stock photo of handshakes · claim without any proof cue · 100vh hero with nothing peeking (scroll dead-end) · animated gradient consuming GPU (LCP casualty)

## Checklist
- [ ] 3-second test: what/why/next all answered
- [ ] Headline ≤12 words, specific, ban-list clean
- [ ] One primary CTA + friction microcopy
- [ ] Exactly one trust cue, real data
- [ ] Entrance ≤500ms once; reduced-motion safe
- [ ] Fold complete at 1440 and 390; LCP element optimized (preloaded image / plain text)
