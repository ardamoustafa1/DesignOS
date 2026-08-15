# OpenAI Codex CLI Setup Guide

**Platform:** OpenAI Codex CLI (`codex` command-line tool)  
**Rules file:** `AGENTS.md` at the project root — this is Codex CLI's documented,
confirmed auto-discovery path, not `.codex/instructions.md`. The export command also
writes `.codex/instructions.md` as a defensive extra in case a given Codex build checks
it too, but do not rely on that file alone; `AGENTS.md` is the one to trust.

---

## Step-by-step installation

### 1. Install DesignOS

```bash
npx github:ardamoustafa1/DesignOS init
```

### 2. Export the Codex rules files

```bash
node DesignOS/bin/designos.js export codex
```

This writes both `AGENTS.md` (root — the path Codex CLI actually auto-discovers) and
`.codex/instructions.md` (defensive extra). Running `export agentsmd` instead produces
the identical `AGENTS.md` — `codex` and `agentsmd` are two names for overlapping work.

> ⚠️ Re-run after upgrading DesignOS. Edit `DesignOS/CLAUDE.md`, not the generated file.

### 3. Verify

```bash
codex "Design a fintech dashboard landing page"
```

You should see references to DesignOS token discipline and the scoring threshold.

---

## Capability notes for Codex CLI

| Feature | Status |
|---|---|
| Kernel + all modules | ✅ Full (root `AGENTS.md`, Codex's confirmed auto-load path) |
| Memory persistence | ✅ Via workspace files |
| Module routing | ✅ Full — Codex reads workspace context |
| Slash commands | ❌ Not supported (use CLI equivalents) |
| `.codex/instructions.md` | ⚠️ Written defensively; not confirmed to be read by Codex CLI |
