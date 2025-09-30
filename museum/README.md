# ⬡ The Anti-Pattern Museum

A curated collection of design crimes — each exhibit: the crime, why it keeps
happening, the damage, and the rule that prevents it. The review engine's field guide;
also the most shareable document in the system. Add exhibits via PR (evidence required,
`CONTRIBUTING.md`).

---

## Wing I — Typography & Layout

**№ 001 · The Full-Width Paragraph** — Text spanning 1440px because the container
forgot a measure. *Why it happens:* defaults. *Damage:* unreadable 200-character lines.
*The law:* 60–75ch, `foundations/typography.md`.

**№ 002 · The Centered Essay** — Four center-aligned paragraphs, ragged both sides,
no anchor for the eye. *The law:* center ≤2 lines, `foundations/typography.md`.

**№ 003 · The 2px Hierarchy** — Headings at 18/20/22/24px; "levels" nobody can see.
*The law:* visibly different scale steps, ratio 1.2+, `foundations/typography.md`.

**№ 004 · Magic Number 37** — `margin-top: 37px`, alone, unexplained, forever.
*The law:* the 4px grid, `foundations/spacing.md`; detected by `validators/check-drift.js`.

**№ 005 · The Metronome Page** — Every section exactly 80px apart; rhythm of a
heart monitor flatline. *The law:* deliberate tempo variation, `foundations/spacing.md`.

**№ 006 · Slideshow Disease** — Every section exactly 100vh, content floating in
voids. *The law:* content decides height, `foundations/layout.md`.

## Wing II — Color & Theme

**№ 010 · The Contrast Graveyard** — Gray text on gray cards on gray background with
gray borders. *Damage:* WCAG failure + reading fatigue. *The law:* 4.5:1 body,
`foundations/accessibility.md`; measured by `validators/contrast.js`.

**№ 011 · The AI Startup Uniform** — Purple-blue gradient mesh, orb hero, sparkle
emoji. *Why:* 2024 template gravity. *Damage:* files you under "wrapper".
*The law:* `industries/ai-startup.md`, `brain/trend-radar.md`.

**№ 012 · Rainbow Feature Cards** — Six cards, six saturated colors, zero meaning.
*The law:* accent = punctuation, 60/30/10, `foundations/colors.md`.

**№ 013 · Dark Mode by Inversion** — `filter: invert(1)` and prayers. *Damage:*
inverted photos, vibrating accents, halation. *The law:* `foundations/dark-mode.md` physics.

**№ 014 · The Pure-Black Premium Fallacy** — #000 background + #FFF text at 21:1,
"because luxury". *Damage:* halation for astigmatic users, no elevation room.
*The law:* `foundations/dark-mode.md`.

## Wing III — Components

**№ 020 · The Twin Primaries** — Two solid accent buttons side by side, both shouting,
neither winning. *The law:* one primary per view, `components/buttons.md`.

**№ 021 · The Ghost Hero CTA** — Outline-only primary CTA: "we don't believe in our
own product." *The law:* `components/buttons.md`.

**№ 022 · Placeholder-as-Label** — Labels that vanish the moment you type. *Damage:*
memory tax, a11y failure, autofill chaos. *The law:* `components/forms.md`; caught by
`validators/check-a11y-basics.js`.

**№ 023 · The Vengeful Validator** — Red errors on the first keystroke. *The law:*
validate on blur/submit, `components/forms.md`.

**№ 024 · Modal-on-Modal** — A dialog opening a dialog opening a confirm. *The law:*
redesign the flow, `components/modals.md` ladder.

**№ 025 · The Div Button** — `<div onclick>` with dreams. *Damage:* no keyboard, no
focus, no semantics. *The law:* `foundations/accessibility.md`; caught by validators.

**№ 026 · Carousel Hero** — Five rotating slides; slide 2's CTR is a rounding error.
*The law:* `components/hero.md` anti-patterns.

**№ 027 · The Spinning Void** — A lone spinner replacing an entire page for 4 seconds.
*The law:* content-shaped skeletons, `components/states.md`.

**№ 028 · "Something Went Wrong"** — The error message that answers nothing: what?
where? now what? *The law:* cause + action, `components/states.md`.

**№ 029 · The 99-Column Table** — Twelve equal-width columns, centered numbers, mixed
date formats. *The law:* `components/tables.md` alignment doctrine.

**№ 030 · Uppercase Ghost Button, Letterspaced** — A 2016 Material séance.
*The law:* `components/buttons.md`; exhibit also hangs in `brain/trend-radar.md`.

## Wing IV — Motion

**№ 040 · The Scroll Hijack** — Wheel input reinterpreted as cinema. *Damage:* user
rage, a11y failure, instant back-button. *The law:* the user owns the scrollbar,
`motion/page-and-scroll.md`.

**№ 041 · Everything Fades In Forever** — Twenty elements queuing for their 600ms
entrance, on every scroll pass, both directions. *The law:* once-only, group-staggered,
budget depleting downward, `motion/page-and-scroll.md`.

**№ 042 · The Breathing UI** — Idle elements pulsing "for life". *The law:* rest state
means rest, `motion/micro-interactions.md`.

**№ 043 · Layout-Property Tweens** — Animating `height`/`top`/`margin`, then adding
`will-change: everything` as an apology. *The law:* compositor-only,
`motion/performance.md`.

## Wing V — Persuasion & Trust

**№ 050 · The Immortal Countdown** — "Offer ends in 04:59" … refresh … "04:59".
*Damage:* trust bankruptcy, legal exposure. *The law:* `psychology/persuasion.md`
instant-fails.

**№ 051 · Confirm-Shaming** — "No thanks, I hate saving money." *The law:*
`psychology/persuasion.md` dark patterns; also hangs in the emotional-failure wing.

**№ 052 · The Invented Ten Thousand** — "Trusted by 10,000+ teams" (day 3 of launch).
*The law:* every proof element real, `brain/quality-bar.md` instant-fail.

**№ 053 · The Fee Ambush** — The real total revealed at step 4 of checkout. *Damage:*
~70% cart abandonment has a face, and this is it. *The law:* `industries/ecommerce.md`,
`industries/travel-hospitality.md`, `industries/events-entertainment.md` — thrice-legislated.

**№ 054 · The Roach Motel** — Subscribe in one click, cancel via a phone call to a
retention specialist named Chad. *The law:* `patterns/settings.md` cancellation doctrine.

**№ 055 · The Guilt Notification** — "Your streak dies at midnight 😢" at 11:47pm.
*The law:* `psychology/gamification.md` ethics gate.

## Wing VI — Content & Chrome

**№ 060 · Lorem in Production** — The Latin that shipped. *The law:*
`checklists/pre-flight.md` content integrity.

**№ 061 · The PDF Menu** — A restaurant's entire utility, trapped in a 6MB download.
*The law:* `industries/food-restaurant.md` — the sector's most common felony.

**№ 062 · Emoji Iconography** — 🚀 as the deploy button in a professional tool.
*The law:* `foundations/iconography.md`.

**№ 063 · The Dead Changelog** — Last entry: 8 months ago. Worse than no page.
*The law:* `patterns/changelog.md`.

**№ 064 · "Click Here"** — The link text that describes nothing, for readers and
crawlers alike. *The law:* `checklists/seo.md`, `foundations/accessibility.md`.

**№ 065 · The Mission-Statement Bingo Card** — "Empowering people to unlock potential
through innovative solutions." *The law:* `patterns/company-pages.md`,
`agents/copywriter.md` ban list.

---

*Every exhibit was shipped by someone having a normal day. The loop exists because
none of us is exempt — the museum is a mirror, not a pillory.*
