# PR Review Workflow

Use this to review UI pull requests with DesignOS. The aim is faster, more precise
feedback, not longer design debates.

## Review Order

1. Run the deterministic floor:

   ```bash
   node DesignOS/bin/designos.js review src/ --min 95
   ```

2. Inspect screenshots at 375, 768, 1024, and 1440.
3. Check the state matrix from `components/states.md`.
4. Score the six dimensions in `scoring/rubric.md`.
5. Leave comments as specific fixes, not taste adjectives.

## Comment Format

Good PR review comments use this shape:

```text
[P1 Accessibility] The filter button removes focus outline without replacement.
Expected: visible focus ring that meets the token system.
Why: keyboard users cannot track position.
Module: foundations/accessibility.md + components/buttons.md
```

Avoid:

- "Make it pop."
- "Feels off."
- "Can we make this premium?"
- "Looks AI-generated."

Those are instincts, not reviewable instructions.

## Severity

| Severity | Meaning | Merge? |
|---|---|---|
| P0 | broken task, security, data loss, severe a11y | no |
| P1 | WCAG issue, fake proof, missing critical state | no |
| P2 | token drift, weak hierarchy, copy ambiguity | maybe |
| P3 | polish, future improvement | yes |

## What To Check

- primary CTA visible in 3 seconds
- every form has loading, error, disabled, and success states
- every dashboard has empty, partial, loading, and error states
- no invented metrics, fake customers, fake awards, or fake urgency
- no raw color drift without documented exception
- mobile does not compress important decisions into hidden menus
- motion respects `prefers-reduced-motion`

## Anti-patterns

- Commenting on personal preference without a module reference.
- Approving a beautiful screen with missing keyboard support.
- Letting fake proof pass because "it's just placeholder."
- Asking for broad redesign in a late PR instead of naming the failing dimension.

## Checklist

- [ ] `designos review` run or action report inspected
- [ ] Mobile and desktop screenshots reviewed
- [ ] State matrix checked
- [ ] Fake proof/dark patterns checked
- [ ] Comments name severity, reason, and module
- [ ] Merge decision matches the highest severity
