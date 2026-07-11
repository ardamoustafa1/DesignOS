# Integrations — One System, Every Agent

DesignOS is markdown + conventions, so it runs anywhere an agent reads rules. The
difference per tool is only *how the kernel gets loaded*. One command generates the
right rules file for each:

```bash
node DesignOS/bin/designos.js export all      # or: cursor · copilot · windsurf · cline · aider
```

**Per-agent step-by-step guides:**
- [cursor.md](cursor.md) — Cursor (AI code editor)
- [copilot.md](copilot.md) — GitHub Copilot (VS Code, JetBrains, GitHub.com)
- [windsurf-cline-aider.md](windsurf-cline-aider.md) — Windsurf, Cline, Aider

⚠️ Not `npx designos export` — that bare name resolves to an unrelated package on the
npm registry, not this project. `init` copies the CLI to `DesignOS/bin/`; invoke it
from there for every command after the first install.

| Agent | Rules file generated | Modules loading | Subagents | Slash commands |
|---|---|---|---|---|
| **Claude Code** | native `@DesignOS/CLAUDE.md` import (via `init`) | on-demand (routing table) | ✓ real (`node DesignOS/bin/designos.js agents`) | ✓ (`node DesignOS/bin/designos.js skills`) |
| **Cursor** | `.cursorrules` | agent reads `DesignOS/` files on request | persona-adopted | Cursor rules-triggered |
| **GitHub Copilot** | `.github/copilot-instructions.md` | same | persona-adopted | — |
| **Windsurf** | `.windsurfrules` | same | persona-adopted | — |
| **Cline** | `.clinerules` | same | persona-adopted | — |
| **Aider** | `CONVENTIONS.md` | same | persona-adopted | — |
| **Any other** | paste `DesignOS/CLAUDE.md` into its rules slot | same | persona-adopted | — |

## How the export works
`export` writes the current kernel (your `./DesignOS/CLAUDE.md`, so project overrides
travel) into the target's rules file with a generated-file header. The knowledge
modules stay in `./DesignOS/` — **keep that folder in the repo**; the kernel's routing
table tells the agent which files to open per task, and every listed agent can read
workspace files.

Re-run after upgrading DesignOS or editing the kernel. The rules files are build
artifacts: edit `DesignOS/CLAUDE.md`, not them (the header says so too).

## Capability degradation, honestly
- **Full experience (Claude Code):** lazy module routing, a genuinely independent
  `reviewer` subagent, slash commands, memory persistence via CLAUDE.md conventions.
- **Rules-file agents:** the kernel + modules work; the *adversarial* review runs as a
  persona in the same context — grading its own homework somewhat. Compensate by
  running `/design-score`'s prompt (`skills/design-score.md`) as a fresh conversation.
- **Context-limited agents:** if the tool chokes on the kernel size, trim the routing
  table to your project's surface types — the kernel degrades gracefully; the modules
  don't need to be loaded until routed.

## CI (agent-agnostic)
The validators run everywhere Node runs — `.github/workflows/validate.yml` is the
copyable GitHub Actions example; the scripts themselves (`validators/`) have zero
dependencies and honest exit codes for any CI system.
