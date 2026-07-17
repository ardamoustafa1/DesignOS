# Scorecard Examples

These examples show how to write useful scorecards. The score is less important than
the evidence attached to it.

## Strong Scorecard

| Dimension | Score | Evidence | Required fix |
|---|---:|---|---|
| UI Craft | 96 | tokenized spacing, clear hierarchy, no raw color drift | none |
| UX Flow | 92 | core flow works, but empty state lacks sample-data path | add first-use empty state |
| Accessibility | 98 | keyboard path, focus ring, contrast checked | none |
| Performance | 95 | no layout shift, images sized | verify Lighthouse before ship |
| Modernity | 96 | restrained app-shell density | none |
| Conversion | 90 | CTA clear, but proof claim unsourced | remove or source proof |

Good because it names evidence and fixes. It does not hide weak dimensions inside an
average.

## Weak Scorecard

| Dimension | Score | Evidence |
|---|---:|---|
| UI Craft | 95 | looks good |
| UX Flow | 95 | easy |
| Accessibility | 95 | should be fine |

Bad because the numbers are decorative. No reviewer can reproduce them.

## Comment Templates

### Under-threshold dimension

```text
UX Flow: 88/100.
Reason: the filtered-empty table state has no clear-filters recovery path.
Fix: add "No results for X" copy, active filter chips, and one clear action.
Module: components/states.md
```

### Fake proof

```text
Conversion: capped until proof is real.
Reason: "Trusted by 10,000 teams" has no source.
Fix: remove the claim or link to a real customer/source.
Module: PROOF_STANDARD.md
```

### Accessibility cap

```text
Accessibility: capped at 60.
Reason: keyboard user cannot reach the billing plan toggle.
Fix: semantic radio group or roving-tab segmented control with visible focus.
Module: foundations/accessibility.md
```

## Anti-patterns

- Averaging six dimensions into one flattering number while hiding a failure.
- Giving 95 because the output is visually attractive.
- Scoring accessibility from a screenshot.
- Listing fixes without naming the dimension they affect.

## Checklist

- [ ] Each score has evidence
- [ ] Any score under 95 has a required fix
- [ ] Accessibility caps are applied
- [ ] Fake proof blocks conversion score
- [ ] Reviewer can reproduce the judgment from the notes
