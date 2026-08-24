# Extended Multi-Tool Integration Guide

DesignOS ships **21 export adapters** plus the built-in Claude path. Rules-file parity is
backed by a Universal Agent Runtime for deterministic routing, memory and review gates.
That is outcome parity; it is not a claim that every host exposes Claude's native UI,
slash commands or subagent process model.

---

## Supported Tools

### Core Tools

| Tool | Export command | Rules file(s) |
|---|---|---|
| **Claude Code** | (built-in via `CLAUDE.md`) | `CLAUDE.md` |
| **Cursor** | `export cursor` | `.cursorrules` (legacy, still read) + `.cursor/rules/designos.mdc` (current, `alwaysApply: true`) |
| **GitHub Copilot** | `export copilot` | `.github/copilot-instructions.md` |
| **Windsurf / Devin Desktop** | `export windsurf` | `.windsurfrules` (legacy) + `.windsurf/rules/designos.md` (current) |
| **Cline** | `export cline` | `.clinerules` |
| **Aider** | `export aider` | `CONVENTIONS.md` |
| **Gemini CLI** | `export gemini` | `GEMINI.md` |
| **Kiro** | `export kiro` | `.kiro/steering/designos.md` |
| **Trae** | `export trae` | `.trae/rules/designos.md` |

### Extended Tools

| Tool | Export command | Rules file(s) |
|---|---|---|
| **OpenAI Codex CLI** | `export codex` | `AGENTS.md` (confirmed auto-load path) + `.codex/instructions.md` (defensive extra) |
| **Google Antigravity** | `export antigravity` | `AGENTS.md` (confirmed auto-load path) + `.agent/rules/designos.md` (native format) |
| **Kimi Code** | `export kimi` | `AGENTS.md` portable kernel; runtime supplies deterministic capabilities |
| **Hermes Agent** | `export hermes` | `AGENTS.md` portable kernel; runtime supplies deterministic capabilities |
| **OpenCode** | `export opencode` | `.opencode/rules/designos.md` |
| **Grok Build (xAI)** | `export grok` | `.grok/rules/designos.md` |
| **Pi (Inflection AI)** | `export pi` | `.pi/context/designos.md` |
| **Qoder** | `export qoder` | `.qoder/context.md` |
| **Rovo Dev (Atlassian)** | `export rovodev` | `.rovo/designos.md` |
| **Vibe Coding** | `export vibe` | `.vibe/rules/designos.md` |
| **Amp (Sourcegraph)** | `export amp` | `.amp/designos.md` |
| **Zed AI** | `export zed` | `.zed/designos.md` |

---

## Export Commands

### Export a single tool
```bash
node DesignOS/bin/designos.js export codex
node DesignOS/bin/designos.js export grok
node DesignOS/bin/designos.js export vibe
node DesignOS/bin/designos.js agent-runtime status all
node DesignOS/bin/designos.js agent-runtime config
```

### Export all supported tools at once
```bash
node DesignOS/bin/designos.js export all
```

### List all supported tools
```bash
node DesignOS/bin/designos.js tools
node DesignOS/bin/designos.js tools --json
```

---

## How it works

All export targets receive the same DesignOS kernel (`CLAUDE.md`), with module paths
rewritten to point at `./DesignOS/<dir>/...` — the location `init` copies modules into.

The kernel contains:
- The full routing table (50+ surface → module mappings)
- The 10-step boot sequence
- Non-negotiable standards (WCAG 2.2 AA, Lighthouse ≥95, 4px grid, etc.)
- The Sixteen Questions pre-delivery checklist
- The Output Contract

> **Note:** The generated rules file is a snapshot. Re-export after every DesignOS upgrade:
> ```bash
> node DesignOS/bin/designos.js export all --force
> ```

---

## AGENTS.md Standard

The `agentsmd` target (`export agentsmd`) writes an `AGENTS.md` file that the
[AGENTS.md standard](https://agents.md) defines. This is confirmed to be auto-discovered
by: Codex CLI, Google Antigravity, and any tool following the emerging cross-tool
convention.

`agentsmd`, `codex`, and `antigravity` all resolve to the same `AGENTS.md` at the repo
root — they are different names for overlapping work, kept separate only because a user
searching for "codex" or "antigravity" should find a matching command. Running any one of
them (or `export all`) writes `AGENTS.md` once; the export writer dedupes shared paths
across targets in a single invocation.
