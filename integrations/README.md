# Integrations — One System, Every Agent

DesignOS has two layers. The portable rules layer loads the same kernel in every agent;
the Universal Agent Runtime supplies deterministic routing, memory and executable gates
over MCP/stdio so those outcomes do not depend on a model remembering a long prompt.

```bash
node DesignOS/bin/designos.js export all      # or: cursor · copilot · windsurf · cline · aider · agentsmd
```

**Per-agent step-by-step guides:**
- [cursor.md](cursor.md) — Cursor (AI code editor)
- [copilot.md](copilot.md) — GitHub Copilot (VS Code, JetBrains, GitHub.com)
- [windsurf-cline-aider.md](windsurf-cline-aider.md) — Windsurf, Cline, Aider

⚠️ Not `npx designos export` — that bare name resolves to an unrelated package on the
npm registry, not this project. `init` copies the CLI to `DesignOS/bin/`; invoke it
from there for every command after the first install.

| Agent | Rules file(s) generated | Modules loading | Subagents | Slash commands |
|---|---|---|---|---|
| **Claude Code** | native `@DesignOS/CLAUDE.md` import (via `init`) | on-demand (routing table) | ✓ real (`node DesignOS/bin/designos.js agents`) | ✓ (`node DesignOS/bin/designos.js skills`) |
| **Cursor** | `.cursorrules` (legacy) + `.cursor/rules/designos.mdc` (current, `alwaysApply: true`) | agent reads `DesignOS/` files on request | persona-adopted | Cursor rules-triggered |
| **GitHub Copilot** | `.github/copilot-instructions.md` | same | persona-adopted | — |
| **Windsurf / Devin Desktop** | `.windsurfrules` (legacy) + `.windsurf/rules/designos.md` (current) | same | persona-adopted | — |
| **Cline** | `.clinerules` | same | persona-adopted | — |
| **Aider** | `CONVENTIONS.md` | same | persona-adopted | — |
| **OpenAI Codex CLI** | `AGENTS.md` (`export codex` — confirmed auto-load path, not the old `.codex/` guess) | same | persona-adopted | — |
| **Google Antigravity** | `AGENTS.md` + `.agent/rules/designos.md` (`export antigravity`) | same | persona-adopted | — |
| **Kimi Code** | `AGENTS.md` (`export kimi`) | runtime-routed | runtime panel contract | runtime tools |
| **Hermes Agent** | `AGENTS.md` (`export hermes`) | runtime-routed | runtime panel contract | runtime tools |
| **AGENTS.md standard** (Gemini CLI, Amp, Zed, Jules, …) | `AGENTS.md` (`export agentsmd`) | same | persona-adopted | — |
| **Any other** | paste `DesignOS/CLAUDE.md` into its rules slot | same | persona-adopted | — |

The DesignOS repo itself also ships a root-level `AGENTS.md` — a byte-identical mirror
of the kernel (CI enforces the sync) — so any agents.md-standard tool pointed at a clone
of this repo boots the system with zero setup. `export` **never overwrites** a hand-written
rules file it didn't generate: if your project already has its own `AGENTS.md` (or
`CONVENTIONS.md`, etc.), the target is skipped with a warning — append the kernel yourself
or re-run with `--force`.

## How the export works
`export` writes the current kernel (your `./DesignOS/CLAUDE.md`, so project overrides
travel) into the target's rules file with a generated-file header. The knowledge
modules stay in `./DesignOS/` — **keep that folder in the repo**; the kernel's routing
table tells the agent which files to open per task, and every listed agent can read
workspace files.

Re-run after upgrading DesignOS or editing the kernel. The rules files are build
artifacts: edit `DesignOS/CLAUDE.md`, not them (the header says so too).

## Universal Agent Runtime

```bash
node DesignOS/bin/designos.js agent-runtime status all
node DesignOS/bin/designos.js agent-runtime config --out designos-mcp.json
node DesignOS/bin/designos.js agent-runtime serve
```

`config` emits a standard `mcpServers.designos` entry. Put that entry in the host's MCP
configuration using the host's documented location. The runtime exposes six tools:
kernel boot, brief routing, capability evidence, panel contracts, deterministic review,
and allow-listed project-memory append. It never receives or proxies model API keys.

## Capability degradation, honestly
- **Outcome parity through the runtime:** every listed adapter receives the same kernel
  digest, deterministic router, memory protocol and executable review gate.
- **Native UX is not identical:** slash-command surfaces, model behavior, permission UI
  and true parallel subagents remain host capabilities. `designos_panel` returns binding
  independent-review contracts; if a host cannot isolate contexts, the result must carry
  the `DEGRADED` label instead of pretending independence.
- **Rules-only fallback:** without MCP, the kernel + modules still work, but execution
  depends on the host model following the rules. Run the deterministic CLI gate directly.
- **Context-limited agents:** if the tool chokes on the kernel size, trim the routing
  table to your project's surface types — the kernel degrades gracefully; the modules
  don't need to be loaded until routed.

## CI (agent-agnostic)
The validators run everywhere Node runs — `.github/workflows/validate.yml` is the
copyable GitHub Actions example; the scripts themselves (`validators/`) have zero
dependencies and honest exit codes for any CI system.
