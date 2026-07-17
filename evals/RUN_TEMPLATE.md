# Independent Eval Run Template

Copy this file into a PR section or attach it as `evals/runs/run-00X.md`.
Reports can be positive, mixed, or negative. The only bad report is one that hides
conditions or raw outputs.

## Run metadata

| Field | Value |
|---|---|
| Run ID | Run 003 |
| Date | YYYY-MM-DD |
| Runner | name / GitHub handle |
| Agent surface | Claude Code / Cursor / Copilot / Windsurf / Cline / Aider / other |
| Model(s) | exact model names and versions, if visible |
| OS / browser | environment details |
| Brief set | all 10 / declared subset |
| Time budget | per arm |
| Follow-up steering | none / explain deviation |

## Installation notes

- Control arm setup:
- Treatment arm setup:
- DesignOS commit SHA:
- Any local modifications:

## Validator results

Run the same commands for both arms and paste the raw output or a link to the raw log.

```bash
node validators/check-drift.js path/to/control-output.html
node validators/check-a11y-basics.js path/to/control-output.html
node validators/check-drift.js path/to/treatment-output.html
node validators/check-a11y-basics.js path/to/treatment-output.html
```

| Brief | Arm | Drift findings | A11y findings | Contrast notes |
|---|---|---:|---:|---|
| B-001 | Control |  |  |  |
| B-001 | Treatment |  |  |  |

## Blind judge results

Use `evals/judge-prompt.md`. Run three judge passes when using a model judge and report
medians, not just the best pass.

| Brief | Arm | Hierarchy | Craft | Accessibility | States | Distinctiveness | Fitness | Median total |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| B-001 | A/B label |  |  |  |  |  |  |  |

## Raw artifacts

- Control outputs:
- Treatment outputs:
- Judge transcripts:
- Validator logs:

## Findings

### Where DesignOS helped

- 

### Where DesignOS hurt or added cost

- 

### Ambiguous results

- 

## Conclusion

State the result in one honest paragraph. Avoid universal claims. This run measures
this model, this surface, this brief set, under these conditions.
