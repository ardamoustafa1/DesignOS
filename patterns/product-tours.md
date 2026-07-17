# Product Tours

Most product tours are ignored. Good onboarding teaches at the moment of need and
gets out of the way.

## Tour Types

| Type | Use | Pattern |
|---|---|---|
| First-run checklist | broad onboarding | 4-6 value milestones |
| Contextual hint | one new feature | small callout near action |
| Guided setup | required configuration | stepper with saved progress |
| Release tour | major redesign | dismissible what's-new summary |

Avoid the classic 9-tooltip parade. It teaches nothing because users have no context.

## First-Run Checklist

Good checklist items are outcomes:

- Create first project
- Import sample data
- Invite one teammate
- Publish first report

Bad checklist items are chores:

- Watch tutorial
- Read docs
- Complete profile
- Follow us

The first item should already be complete when possible. Goal-gradient is real.

## Contextual Hints

Use hints when:

- the feature is useful but hidden
- the user is already near the task
- the hint can be dismissed
- repeated exposure is capped

Never cover the thing the user needs to click.

## Progress And Skip

- Progress must be honest.
- Every non-legal step can be skipped.
- Skipped items move to a recoverable checklist.
- Back preserves state.
- Completion should lead to the next valuable action, not a dead celebration modal.

## Metrics To Watch

- time to first value
- checklist completion
- skipped step rate
- activation event completion
- support tickets about setup

Do not optimize tour completion if product activation does not improve.

## Anti-patterns

- Forced tours before the product is usable.
- Tooltips that block navigation.
- Fake progress percentages.
- Confetti for completing admin chores.
- Asking "how did you hear about us" before value.

## Checklist

- [ ] Tour type chosen intentionally
- [ ] First value appears before heavy configuration
- [ ] Steps are skippable and recoverable
- [ ] Hints are contextual, dismissible, and capped
- [ ] Completion points to next real action
- [ ] Metrics track activation, not just tour completion
