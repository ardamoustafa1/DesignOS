# Community Outreach

## Claude Code / Cursor / builder Discords

I built DesignOS, an open-source design-intelligence layer for coding agents. It is a
markdown system that gives Claude/Cursor/Copilot/etc. design process, industry rules,
project memory, and an adversarial review loop.

I am not looking for stars here; I am looking for criticism and real runs. The repo is
explicit about the current caveat: the published evals are maintainer-run checks, and
the missing proof is an independent Run 003 from someone outside the project.

If anyone wants to try it on a real UI task, the install is:

```bash
npx github:ardamoustafa1/DesignOS init --agents --skills
```

Repo: https://github.com/ardamoustafa1/DesignOS
Eval template: https://github.com/ardamoustafa1/DesignOS/blob/main/evals/RUN_TEMPLATE.md

## Reddit: r/ClaudeAI / r/cursor

Title: `I built DesignOS, a design-review OS for AI coding agents — looking for harsh feedback`

Body:

I built an open-source markdown system that gives AI coding agents a design process:
module routing, project memory, sector rules, adversarial review, validators, and a
hard 95/100 score gate.

The thing I am trying to test: can agent UI quality improve if the agent is given
explicit design judgment and a self-review process, instead of just a prompt like
"make it beautiful"?

Important caveat: the published results are maintainer-run validator checks, not
independent validation. I am actively looking for external users to run the protocol
and publish mixed/negative results too.

Repo: https://github.com/ardamoustafa1/DesignOS
Protocol: https://github.com/ardamoustafa1/DesignOS/tree/main/evals

What would make this more useful for your actual workflow?

## Cursor forum

I built DesignOS, a markdown-native design intelligence layer that exports rules for
Cursor and other agents. It is intended to make UI tasks less dependent on vague
"make it polished" prompts by giving the agent specific modules, review criteria, and
memory rules.

Cursor path:

```bash
npx github:ardamoustafa1/DesignOS init
node DesignOS/bin/designos.js export cursor
```

I would appreciate feedback on whether the generated `.cursorrules` shape feels natural
for Cursor projects.
