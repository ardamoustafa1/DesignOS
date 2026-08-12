# Extended Multi-Tool Integration Guide

DesignOS v2.2+ supports **18 AI coding tools** — 9 original + 9 new extended targets.

---

## Supported Tools

### Core Tools (original)

| Tool | Export command | Rules file |
|---|---|---|
| **Claude Code** | (built-in via `CLAUDE.md`) | `CLAUDE.md` |
| **Cursor** | `export cursor` | `.cursorrules` |
| **GitHub Copilot** | `export copilot` | `.github/copilot-instructions.md` |
| **Windsurf** | `export windsurf` | `.windsurfrules` |
| **Cline** | `export cline` | `.clinerules` |
| **Aider** | `export aider` | `CONVENTIONS.md` |
| **Gemini CLI** | `export gemini` | `GEMINI.md` |
| **Kiro** | `export kiro` | `.kiro/steering/designos.md` |
| **Trae** | `export trae` | `.trae/rules/designos.md` |

### Extended Tools (new in v2.2)

| Tool | Export command | Rules file |
|---|---|---|
| **OpenAI Codex CLI** | `export codex` | `.codex/instructions.md` |
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
- The Fourteen Questions pre-delivery checklist
- The Output Contract

> **Note:** The generated rules file is a snapshot. Re-export after every DesignOS upgrade:
> ```bash
> node DesignOS/bin/designos.js export all --force
> ```

---

## AGENTS.md Standard

The `agentsmd` target (`export agentsmd`) writes an `AGENTS.md` file that the
[AGENTS.md standard](https://agents.md) defines. This is recognized by:
Codex CLI, Amp (Sourcegraph), Zed AI, and any tool following the emerging standard.

For maximum coverage across multiple tools, export both:
```bash
node DesignOS/bin/designos.js export agentsmd
node DesignOS/bin/designos.js export codex
```
