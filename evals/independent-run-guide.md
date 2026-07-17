# Independent Run Guide

Use this when a person outside the maintainer account runs DesignOS against another
agent, project, or model. The goal is reproducibility, not flattering screenshots.

## Who Should Run It

Good evaluators:

- have a real UI task or a repo with existing UI files
- can run both a control pass and a DesignOS pass
- are willing to publish failures and caveats
- can name the agent/tool used: Claude Code, Cursor, Copilot, Windsurf, or another agent

Avoid anonymous "looks good" reports. They are useful feedback, not benchmark evidence.

## Minimum Protocol

1. Pick one brief from `evals/briefs.md` or write a real project brief.
2. Run the control condition without DesignOS.
3. Run the DesignOS condition with the same brief and constraints.
4. Save output artifacts, screenshots, and source diffs.
5. Run validators and `designos review` where applicable.
6. Score both outputs with `evals/judge-prompt.md`.
7. Write the run report using `evals/RUN_TEMPLATE.md`.

## Required Metadata

| Field | Example |
|---|---|
| Runner | Name or GitHub handle |
| Date | 2026-07-17 |
| Agent | Claude Code / Cursor / Copilot / Windsurf |
| Model | model name if visible |
| Repo or artifact | public link, ZIP, or gist |
| Brief | exact prompt used |
| Constraints | framework, tokens, time limit, browser targets |
| Reviewers | human reviewer, model judge, or both |

## Scoring

Report both objective and judgment-based measures:

- `validators/check-a11y-basics.js`
- `validators/check-drift.js`
- `designos review <target> --json`
- six-dimension rubric from `scoring/rubric.md`
- screenshots at desktop and mobile widths

Do not average away a hard failure. If accessibility scores 60 because of a WCAG issue,
the final report must show that clearly.

## Submission Shape

Create a folder under `evals/runs/`:

```text
evals/runs/run-003-claude-code-pricing/
├── README.md
├── control/
├── designos/
├── screenshots/
└── review.json
```

If the output is too large, put links in the README and keep the scoring report in repo.

## Anti-patterns

- Only publishing the DesignOS result.
- Changing the brief between control and DesignOS.
- Removing failed screenshots because they look bad.
- Calling a maintainer-run report "independent."
- Using invented customer logos or fake proof inside the generated UI.

## Checklist

- [ ] Control and DesignOS conditions use the same brief
- [ ] Tool/model/date are named
- [ ] Raw artifacts or links are inspectable
- [ ] Objective validators and rubric scores are both included
- [ ] Failures and caveats are visible in the report
