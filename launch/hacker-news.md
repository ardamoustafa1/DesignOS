# Hacker News

## Title options

1. `Show HN: DesignOS – an open-source design brain for AI coding agents`
2. `Show HN: I built a design-review OS for Claude, Cursor, Copilot, and friends`
3. `Show HN: DesignOS – markdown-native design judgment for coding agents`

## First comment

I built DesignOS because AI coding agents are increasingly good at logic, but still
ship a lot of visually plausible UI with weak hierarchy, contrast misses, fake proof,
and inconsistent decisions across sessions.

DesignOS is not a component library. It is a markdown-native operating layer for agent
judgment: 60+ design modules, 24 industry playbooks, project memory, specialist review
agents, and a hard scoring gate across UI craft, UX, accessibility, performance,
modernity, and conversion.

The honest caveat: the published validator numbers are maintainer-run sanity checks,
not independent proof yet. They show the mechanical floor works: the control fixture
has 43 token-drift findings and 6 a11y findings; the DesignOS showcase pages clear
those checks. The important next step is Run 003, where someone outside the maintainer
account runs the protocol on their own agent/model and PRs the raw results, positive
or negative.

Links:
- Repo: https://github.com/ardamoustafa1/DesignOS
- Website: https://ardamoustafa1.github.io/DesignOS/website/
- Before/After demo: https://ardamoustafa1.github.io/DesignOS/website/before-after.html
- Eval protocol: https://github.com/ardamoustafa1/DesignOS/tree/main/evals

I would especially like criticism on the protocol, the module boundaries, and where the
rules might overfit my taste.
