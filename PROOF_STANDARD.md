# Proof Standard

DesignOS should grow by evidence, not by louder claims. This file defines what counts
as proof, what must stay caveated, and what never belongs in the repo.

## Claim Levels

| Level | Allowed wording | Required evidence |
|---|---|---|
| L0 | "DesignOS provides a process" | The relevant module or workflow exists |
| L1 | "DesignOS catches this class of issue" | A validator, checklist, or documented review example |
| L2 | "DesignOS improved this project" | Before/after artifact, scorecard, and author notes |
| L3 | "Independent users reproduced this" | External run report in `evals/runs/` or a linked PR |
| L4 | "Teams adopt this in workflow" | External project using the action, adapter, or starter |

Anything below L3 must not be described as independently proven.

## Evidence That Counts

- A public repo, PR, issue, discussion, or benchmark run another person can inspect.
- A before/after artifact with the same brief, same constraints, and the same scoring rubric.
- A saved `designos review` JSON report plus human/model scorecard.
- Screenshots or deploy links for UI output, not only prose descriptions.
- Clear caveats: model used, date, prompt, project type, reviewer, and known weak spots.

## Evidence That Does Not Count

- Self-authored testimonials.
- Fictional customers, fictional logos, or fake usage counts.
- "Looks better" screenshots without the starting brief and scoring rubric.
- Cherry-picked model outputs without the failed attempts.
- Private claims that cannot be inspected.

## Hard Trust Claims

These words are regulated trust objects, not decorative copy:

- SOC 2 / SOC2
- ISO 27001
- HIPAA compliant
- PCI DSS
- GDPR compliant
- FIPS validated
- audited, certified, independently verified

They may appear only when the artifact links to, names, or clearly references a real
source. If the page is fictional, a starter, a demo, or a first-pass concept, replace
them with neutral procurement language:

- security packet available
- DPA available
- subprocessor list
- architecture notes
- security questionnaire
- BAA support
- export controls

Never place hard compliance claims in a footer, trust strip, pricing table, testimonial,
or badge as a way to make a fictional product feel credible.

## Named Defaults

Fabricated proof is the loud failure. The quiet one is the **default that arrives without a
decision** — the palette, the typeface, the phrase, and the fake name that every generated
page reaches for. It is not dishonest the way a fake SOC 2 badge is, but it makes the
artifact indistinguishable from every other artifact, which is its own kind of untruth: the
page claims a point of view it does not have.

These are enforced by `validators/check-aesthetic-slop.js`. P1/P2 fail the run; P3 prints as
an advisory, because "you picked the obvious thing" is a conversation, not a compile error.

### Placeholder identity — never ships (P2)

`Acme` / `Acme Corp` · `John Doe` / `Jane Doe` / `Jane Smith` · `Company Name` /
`Your Company` · `example@example.com` · `Lorem ipsum` · `placeholder.com` / `via.placeholder`

A fictional product needs a fiction that is *internally consistent and labelled fictional*
(see "Evidence That Does Not Count"). `Acme` is not a fiction; it is an unfilled field.

### Filler copy — true of every competitor, so it says nothing (P2)

`Elevate your …` · `Unlock the power/potential of …` · `Take your X to the next level` ·
`Revolutionize` · `Game-changing` · `Cutting-edge` · `Supercharge` ·
`Seamlessly integrates` · `Effortlessly` · `In just seconds` · `10x` ·
`Harness the power` · `Transform the way …` · `Built for the future` · `Reimagine` ·
`The future of X is here` · `Say goodbye to …`

The test: swap in a direct competitor's name. If the sentence stays true, it was never
about this product. Replace it with the specific thing the product does
(`brain/brief-compiler.md` — product material).

### Visual defaults — legal, but argue for them (P3)

| Default | Why it reads as generated |
|---|---|
| Violet → fuchsia gradient (hue 250–330) | the single most recognizable AI-default palette |
| Gradient-filled text | contrast becomes unmeasurable across the fill, and it is a template tell |
| Cream + clay/brass + near-black | the "premium artisan" reflex, shipped as if it were a decision |
| Inter · Roboto · Poppins · Montserrat · Space Grotesk · Fraunces · Instrument Serif · Plus Jakarta Sans · DM Sans · Manrope | fine faces; picking one is not yet a choice |
| Backdrop-blur on a non-overlay surface | glass is a depth cue for something floating, not a card texture |
| Emoji as iconography | platform-variable, cannot inherit colour or stroke weight, read aloud by their CLDR name |
| Everything centered | flattens hierarchy and destroys the left edge the eye scans |
| An eyebrow label above every section | when every section announces itself, the announcement stops meaning anything |

None of these are forbidden. They are **unearned until argued**: if the artifact uses one,
the derivation chain in `memory/design.md` must say why this brand, this audience, and this
material led there. "It looked good" is not a derivation.

### Em-dash cadence (P3)

More than roughly one em-dash per 60 words of visible copy is a generated-prose
fingerprint, not house voice. Most of them are a period or a comma. This is a rhythm check
on *rendered UI text*, not on documentation or code comments.

## Review Rule

When adding a growth claim to README, launch copy, or press material, ask:

1. Is this L0-L4 claim level named in the surrounding copy?
2. Can a reader click through to the evidence?
3. Would the claim survive a skeptical Hacker News comment?
4. Is the limitation stated near the claim, not hidden at the bottom?

If not, soften it or remove it.

## Anti-patterns

- "Trusted by" without named projects.
- "Used by teams" when the evidence is one maintainer test.
- Hiding caveats in a footnote after a bold claim above the fold.
- Replacing independent evals with more internal examples.

## Checklist

- [ ] Every major claim has a level and a linked evidence path
- [ ] External proof is separated from maintainer-run proof
- [ ] Fictional examples are clearly labelled fictional
- [ ] Metrics include date, prompt, model/tool, and reviewer context
- [ ] README wording does not outrun the strongest evidence
