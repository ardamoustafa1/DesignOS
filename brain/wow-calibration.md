# Wow Calibration — Turning "Make It Legendary" Into a Decision

Someone has asked for **unforgettable**. Not "clean", not "modern" — memorable. This module
converts that into something a design loop can execute and a gate can check.

It exists because the request is a trap in both directions. Under-reading it ships another
correct, forgettable page and quietly fails the brief. Over-reading it ships a
portfolio-of-effects: five techniques, no hierarchy, 400ms of jank, and a visitor who
remembers the animation and not the product. Both are failures; the second is more
expensive because it looks like effort.

Load this **before** `motion/signature-moments.md`. That file is the catalogue; this one
decides whether you are allowed to open it, and what to take.

---

## 1 · What actually makes a page memorable

The brief says "wow". The instinct is to reach for effects. The instinct is wrong most of
the time, and knowing *why* is the whole skill.

Memory attaches to **one violated expectation inside an otherwise calm frame**. That is the
mechanism — `psychology/attention.md` calls it salience, and salience is a ratio, not a
quantity. A single moving element on a still page is remarkable. Five moving elements is a
texture, and textures are forgettable by definition.

So the four routes to memorable, in order of how often they are the right answer:

| Route | What it looks like | When it wins |
|---|---|---|
| **Composition** | an unexpected layout, a broken grid, extreme scale contrast | almost always available, costs nothing, survives reduced motion |
| **Material** | the real product artefact used as the hero rather than described | when the product is visually interesting and you have assets |
| **Voice** | copy nobody else would write, a specific opinion stated plainly | when the product is visually boring — the most under-used route |
| **Motion** | a signature moment from `motion/signature-moments.md` | when the product's truth is *itself* about change, speed, or depth |

**Motion is the fourth option, not the first.** Before opening the catalogue, answer: could
composition, material, or voice carry this? If yes, do that and keep the motion budget for
a page that needs it. A brutal type-scale jump and one honest product screenshot beat a
magnetic button on almost every brief.

The exception, and it is real: when the product's truth *is* motion — it is fast, it
transforms things, it has depth, it happens in steps — then a signature moment is not
decoration, it is the argument. That is the case this module is calibrated for.

---

## 2 · The courage ladder

`brain/taste-ladder.md` grades visual sophistication. This grades **nerve** — how far the
page is allowed to deviate from the safe centre. Same 1–10 scale as `MOTION_INTENSITY`
(`brain/brief-compiler.md`), and they move together.

| Rung | Posture | Motion licence | Typical brief |
|---|---|---|---|
| 1–2 | Invisible | state feedback only | banking, health records, government |
| 3–4 | Composed | entrances, one quiet reveal | enterprise SaaS, docs, dashboards |
| 5 | Confident | one interaction-scale signature | most marketing pages |
| 6–7 | Distinctive | one signature, deliberately placed | launches, developer tools, AI products |
| 8 | Bold | two signatures, one hero-scale | agencies, creative tools, category-defining launches |
| 9–10 | Uncompromising | two signatures + a scroll story, full choreography | portfolio, awards submission, brand moment |

**Climbing a rung costs something.** Every step up trades safety, load, and maintenance for
memorability. State the trade in the rationale: "rung 8, accepting a 40KB motion budget and
a mandatory throttle test, because the brief is a launch and the competitor set is loud."

**The sector cap is absolute.** `industries/fintech.md`, `healthcare.md`, `legal.md`, and
`insurance.md` cap the ladder at 4 regardless of what the client asked for. A user asking
for "wow" on a banking dashboard is asking for *confidence*, and the answer is composition
and density craft, not a scroll story. Say so, in one sentence, and deliver the confident
version — this is the most common place DesignOS should push back rather than comply.

---

## 3 · The decision tree

Run this in order. Stop at the first line that resolves.

```
1. Is the sector capped (fintech / health / legal / insurance / gov)?
   → YES: rung ≤4. Deliver composition + density craft. Name the cap in the rationale. STOP.

2. Is there a real product artefact (screenshot, data, live output, physical object)?
   → YES: material-led is the hero. Motion supports it — tilt on the artefact,
           or a scroll story that walks through it. Do NOT add a second signature.

3. Does the product's truth involve change, speed, depth, or steps?
   → NO:  voice-led or composition-led. Motion stays at rung 5. STOP.
   → YES: open motion/signature-moments.md §"Choosing one" and take exactly one.

4. Is this a launch, an agency page, or an awards-facing brand moment?
   → YES: rung 8+. A SECOND signature is licensed — one hero-scale, one interaction-scale.
           They must share the accent and the easing character.
   → NO:  one signature. You are done.

5. Did you just choose more than two?
   → Go back to 2. The answer is always no.
```

**The tie-break at step 3** is the one that matters. "Does the product's truth involve
change?" is not "would motion look nice here" — every page would look nice with motion.
It is: if you removed this animation, would the visitor understand the product *less*? If
not, it is decoration, and decoration does not get a budget.

---

## 4 · The composition of a wow page

Rung 8+ is not "more effects everywhere". It is a specific shape:

```
Hero            ONE signature moment · everything else absolutely still
Section 2-3     calm. recipes.md only. this is where the argument lives
Mid-page        the SECOND signature (if licensed) — the payoff for scrolling
Remaining       calm. proof, detail, objection handling
Footer          still
```

The stillness is doing the work. A visitor who has scrolled through two calm sections and
then hits the mid-page moment feels it *because* of the two calm sections. Remove them and
the same effect lands on nothing.

This is also why "add wow to every section" is the request behind most disappointing
redesigns, and why the correct response is to make the other sections **quieter**, not the
signature louder.

---

## 5 · The budget, stated as numbers

A signature has a price. Write it down before you build it, and check it after.

| Line | Ceiling at rung 8+ |
|---|---|
| Added JS for all motion, gzipped | ≤ 25KB (a signature that needs GSAP+plugins is usually the wrong signature) |
| Added blocking requests | 0 — every effect initialises after paint |
| LCP impact | 0ms. The LCP element is never gated on an effect |
| CLS from any signature | 0. Reserve width/height before the effect runs |
| Sustained frame time, 4× CPU throttle | ≤ 16ms. Not advisory at this rung |
| Main-thread work during scroll | ≤ 4ms/frame; prefer `animation-timeline` over listeners |
| Reduced-motion path | exists, tested by emulation, content complete |

If a line blows its ceiling, the signature is downgraded — not the ceiling raised. The
noise canvas becomes a static frame; the scroll story becomes a stack of revealed sections.
A page that stutters is remembered as *cheap*, which is the exact opposite of the brief.

---

## 6 · Recording the decision

Every wow decision goes in `memory/design.md` in this shape, or it did not happen:

```
rung:        8 (of 10) — launch page, loud competitor set
signature 1: hero-scale · scroll-driven storytelling
             truth it expresses: the product turns 6 manual steps into 1
signature 2: interaction-scale · magnetic primary CTA
             truth it expresses: the product is fast and wants to be used
rejected:    text scramble (no data-transformation story), 3D tilt (no artefact to inspect)
budget:      18KB gz motion JS · LCP unaffected · 14.2ms sustained @4x throttle
cap check:   industries/saas.md — no cap; would have been 4 under fintech
```

The **rejected** line is not bookkeeping. It is the evidence that a choice was made rather
than a catalogue browsed, and it is the first thing a reviewer should ask for.

---

## 7 · When "wow" means the opposite

Some briefs say "make it unforgettable" and mean "make me feel safe about spending
money here". Read the reader (`brain/brief-compiler.md` — reader field), not the adjective.

| They said | They meant | Deliver |
|---|---|---|
| "make it wow" + enterprise buyer + procurement flow | make me look smart for choosing this | density craft, real data, obsessive alignment |
| "make it wow" + consumer signup | make it feel effortless | fewer fields, one delightful confirmation |
| "make it pop" + dense dashboard | I cannot find anything | hierarchy, not effects |
| "like Apple" | restraint, scale, and one perfect product shot | composition, not animation |
| "like Awwwards" | genuine rung 9–10 | the full catalogue, with the budget enforced |

Only the last row is a request for the effects catalogue. Misreading the other four is the
most expensive error in this module, because the work looks impressive and misses entirely.

---

## Anti-patterns

- **Effect shopping.** Opening `signature-moments.md` before running the decision tree, and
  picking what looks fun rather than what the product's truth demands.
- **Escalating on request.** The client asked for "more wow", so a third signature is added.
  More is the wrong axis; make the rest of the page quieter instead.
- **Ignoring the sector cap** because the client insisted. Deliver the confident version and
  name the cap — that is the professional answer, not compliance.
- **Rung inflation without budget.** Claiming rung 9 while skipping the throttle test.
- **Wow in the wrong place.** A signature on a settings page, a checkout, or an error state.
  Ceremony belongs where the visitor is deciding, never where they are working.
- **Confusing novelty with memorability.** A technique nobody has seen is not automatically
  memorable; it is often just confusing. Familiar technique + unexpected placement beats
  unfamiliar technique almost every time.
- **Skipping the rejected list.** Without it there is no evidence a decision occurred.

---

## Checklist

- [ ] The four routes were considered and motion was chosen for a reason, not by reflex
- [ ] The decision tree ran in order and stopped where it resolved
- [ ] The sector cap was checked and honoured, or the pushback is written in the rationale
- [ ] Rung recorded with the trade it accepts
- [ ] At most two signatures; the calm sections between them are deliberate
- [ ] Each signature names the product truth it expresses
- [ ] The rejected candidates are listed
- [ ] Every budget line has a measured number, not an assumption
- [ ] The reduced-motion version was opened and read as a complete page
- [ ] `node validators/check-motion.js <target>` is clean
