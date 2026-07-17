# DesignOS GitHub Action

The DesignOS Review Action turns the project from a local design brain into a PR gate.
It runs the deterministic `designos review` command against changed UI surfaces or a
chosen directory and reports:

- contrast risk
- missing states
- semantic/a11y tells
- fake proof or unverifiable social proof
- token drift risk
- six-dimension gate score

It does not call a model. That is deliberate for v1: CI should be deterministic,
cheap, and safe by default. A future v2 can layer a model-judged rubric pass on top.

## Usage

```yaml
name: DesignOS review
on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  design-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ardamoustafa1/DesignOS/.github/actions/design-review@main
        with:
          path: src
          min-score: "95"
          fail-under-min: "true"
          github-token: ${{ github.token }}
```

On pull requests, the action creates or updates one sticky DesignOS review comment.
Set `comment: "false"` to keep the report in logs only.

## Non-blocking mode

```yaml
- uses: ardamoustafa1/DesignOS/.github/actions/design-review@main
  with:
    path: app
    fail-under-min: "false"
    github-token: ${{ github.token }}
```

## Upload the JSON report

```yaml
- uses: ardamoustafa1/DesignOS/.github/actions/design-review@main
  id: designos
  with:
    path: src
- uses: actions/upload-artifact@v4
  with:
    name: designos-review
    path: ${{ steps.designos.outputs.report-json }}
```

## What It Catches

| Risk | Example |
|---|---|
| Contrast risk | `#999`, low-opacity text, muted foregrounds that need verification |
| Missing states | forms/buttons with no loading, error, disabled, success, or empty state language |
| Fake proof | "Trusted by 10,000 teams", generic testimonials, star rows without source |
| Token drift | inline raw colors and off-grid spacing |
| A11y tells | missing `alt`, missing `<main>`, `div onclick`, removed focus outlines |

## What It Does Not Claim

- It is not axe, Lighthouse, Playwright, or a full browser engine.
- It is not a taste oracle.
- It is the deterministic floor before the human/model review loop.
