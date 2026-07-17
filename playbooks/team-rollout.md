# Team Rollout Playbook

This playbook turns DesignOS from a personal prompt system into a team workflow.
Use it when a startup, agency, or product team wants consistent UI output across agents.

## Week 0: Baseline

Before installing anything, capture the current state:

- 3 representative UI files
- 1 common product brief
- screenshots at desktop and mobile
- existing design tokens or style guide
- current review pain: a11y, inconsistency, fake proof, weak hierarchy, slow PR review

Run `designos review` on the baseline if source files are available.

## Week 1: Pilot

Pick one low-risk surface:

- settings page
- pricing section
- dashboard empty states
- onboarding step
- internal admin panel

Install DesignOS in the repo and use `playbooks/real-project-adoption.md`.

Success for week 1 is not "perfect UI." Success is:

- fewer repeated review comments
- state coverage is explicit
- fake proof is removed before review
- one shared vocabulary appears in PR feedback

## Week 2: PR Gate

Add the DesignOS Review Action from `actions/README.md`.

Start non-blocking:

```yaml
fail-under-min: "false"
```

After two clean weeks, make it blocking for changed UI paths.

## Week 3: Memory

Create project memory:

- brand decisions
- component exceptions
- product voice
- approved proof sources
- page-specific tradeoffs

Do not let every agent rediscover the same design decisions.

## Week 4: Scale

Add team conventions:

- which modules are mandatory per surface
- which score threshold blocks merge
- who can approve `drift-ok`
- how external case studies are submitted

## Roles

| Role | Owns |
|---|---|
| Design lead | taste bar, exceptions, visual references |
| Frontend lead | tokens, semantics, performance |
| PM/founder | business goal, proof sources, copy honesty |
| Accessibility reviewer | keyboard, contrast, screen reader states |

## Anti-patterns

- Rolling out as a giant process change on day one.
- Blocking PRs before the team understands the report.
- Treating DesignOS as a replacement for design review.
- Letting every exception become `drift-ok`.

## Checklist

- [ ] Baseline captured before adoption
- [ ] One pilot surface selected
- [ ] Review Action starts non-blocking
- [ ] Project memory created
- [ ] Exception owner named
- [ ] Blocking gate enabled only after calibration
