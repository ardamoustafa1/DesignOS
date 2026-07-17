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
