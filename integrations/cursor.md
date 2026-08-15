# Cursor Setup Guide

**Platform:** Cursor (AI code editor)
**Rules files:** `.cursorrules` (legacy, deprecated in Cursor 0.43 but still read
unconditionally) **and** `.cursor/rules/designos.mdc` (current format, with
`alwaysApply: true` frontmatter so it behaves like the old unconditional file rather
than the file-pattern-scoped default). The export command writes both — Cursor has been
migrating rules formats for a while, and shipping only the deprecated one risks the day
Cursor stops reading it silently.

---

## Step-by-step installation

### 1. Install DesignOS

From your project root:

```bash
npx github:ardamoustafa1/DesignOS init
```

This copies the full DesignOS system into `./DesignOS/` and generates `CLAUDE.md` (if not present).

### 2. Export the Cursor rules files

```bash
node DesignOS/bin/designos.js export cursor
```

This writes `.cursorrules` and `.cursor/rules/designos.mdc` to your project root, both
carrying the identical DesignOS kernel. Cursor reads both automatically; the `.mdc` file
is the one to trust going forward.

> ⚠️ Re-run after upgrading DesignOS. Both files are generated build artifacts — edit `DesignOS/CLAUDE.md`, not the rules files directly.

### 3. Verify

Open Cursor, start a chat, and type:

```
Design a pricing page for a SaaS product.
```

You should see the agent reference DesignOS modules in its reasoning (e.g. mentioning token discipline, the 95 scoring threshold, or routing to `patterns/pricing.md`).

### 4. Optional: add agents and skills

```bash
node DesignOS/bin/designos.js export cursor  # already done above
node DesignOS/bin/designos.js agents         # registers the reviewer subagent
node DesignOS/bin/designos.js skills         # installs /design-score and other slash commands
```

---

## Capability notes for Cursor

| Feature | Status |
|---|---|
| Kernel + all modules | ✅ Full (`.cursor/rules/designos.mdc`, `alwaysApply: true`) |
| Memory persistence (`memory/*.md`) | ✅ Full (files in workspace) |
| Module routing | ✅ Agent reads `DesignOS/` files on request |
| Adversarial review | ⚠️ Persona-mode (same context, not a separate agent) |
| Slash commands | ⚠️ Rules-triggered only |

The adversarial reviewer runs as a persona within the same context rather than as a true independent agent. To compensate, run the `/design-score` prompt from `skills/design-score.md` as a *separate* conversation after the design is complete.

---

## Troubleshooting

**Agent doesn't reference DesignOS:**
- Make sure `.cursor/rules/designos.mdc` exists (`ls -la .cursor/rules/`) and its
  frontmatter reads `alwaysApply: true` — without that line Cursor treats it as
  file-pattern-scoped and may never load it for a fresh chat
- Re-run `node DesignOS/bin/designos.js export cursor`
- Cursor sometimes caches rules — restart the editor

**Rules file too long (Cursor truncates):**
- Open `DesignOS/CLAUDE.md` and trim the routing table to only your project's surface types
- The kernel degrades gracefully; unused routing entries don't need to be loaded

**DesignOS upgraded but agent still cites old rules:**
- Re-export: `node DesignOS/bin/designos.js export cursor`
- The generated header in `.cursor/rules/designos.mdc` shows the version that was exported
