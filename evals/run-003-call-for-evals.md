# Run 003 Call For Evals

Run 003 is the next credibility unlock for DesignOS. It should be external, repeatable,
and run across more than one agent surface.

## Target

Collect 5-10 independent runs across:

- Claude Code
- Cursor
- GitHub Copilot
- Windsurf
- one additional agent or human baseline if available

The goal is not to win every comparison. The goal is to learn where DesignOS reliably
helps and where it still needs modules, validators, or clearer routing.

## Suggested Briefs

Use one of these to make runs comparable:

1. Cybersecurity SaaS pricing page.
2. Fintech onboarding and KYC flow.
3. Analytics dashboard with empty, loading, and error states.
4. Developer docs landing page.
5. Mobile onboarding for a habit app.

Each brief should include mobile and desktop expectations.

## What To Submit

- A run folder under `evals/runs/`.
- A short summary PR description.
- The exact prompt.
- Screenshots or deployed artifact links.
- `designos review` output when source files are available.
- Honest caveats.

## Maintainer Review

Run reports should be accepted even when DesignOS underperforms, as long as the protocol
is honest. Failures are product data.

Questions reviewers should ask:

- Did the runner change only the system/context, not the brief?
- Are fake proof, invented metrics, and dark patterns identified?
- Are mobile screenshots present?
- Is the scorecard specific enough to reproduce the judgment?

## Anti-patterns

- Treating Run 003 as launch marketing before there are real submissions.
- Asking friends for vague praise instead of reproducible artifacts.
- Rejecting negative results because they weaken the headline.

## Checklist

- [ ] At least 5 external runs targeted
- [ ] At least 3 agent surfaces represented
- [ ] Each run has exact prompt, date, tool, artifact, and caveats
- [ ] Negative results are allowed
- [ ] README claims updated only after the evidence exists
