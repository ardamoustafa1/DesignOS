# Windsurf / Cline / Aider Setup Guide

These three tools all use the same rules-file mechanism. The only difference is the filename the export command writes.

---

## Windsurf

**Rules file:** `.windsurfrules`

```bash
npx github:ardamoustafa1/DesignOS init
node DesignOS/bin/designos.js export windsurf
```

Windsurf reads `.windsurfrules` from the project root automatically. After export, open any design task — you should see module routing in the agent's reasoning.

---

## Cline (VS Code extension)

**Rules file:** `.clinerules`

```bash
npx github:ardamoustafa1/DesignOS init
node DesignOS/bin/designos.js export cline
```

Cline reads `.clinerules` from the project root. Restart the extension after creating the file.

---

## Aider

**Rules file:** `CONVENTIONS.md`

```bash
npx github:ardamoustafa1/DesignOS init
node DesignOS/bin/designos.js export aider
```

Aider reads `CONVENTIONS.md` from the project root. Start a session:

```bash
aider --conventions CONVENTIONS.md
```

Or add to your `.aider.conf.yml`:

```yaml
conventions: CONVENTIONS.md
```

---

## Capability comparison

| Feature | Windsurf | Cline | Aider |
|---|---|---|---|
| Kernel + modules | ✅ | ✅ | ✅ |
| Memory persistence | ✅ (workspace) | ✅ (workspace) | ✅ (workspace) |
| Module routing | ⚠️ On-request | ⚠️ On-request | ⚠️ On-request |
| Adversarial review | ⚠️ Persona | ⚠️ Persona | ⚠️ Persona |
| Slash commands | ❌ | ❌ | ❌ |

All three support the full knowledge system. The limitation is that the adversarial reviewer runs as a persona (same context), not as an independent agent. For the most rigorous review, run the scoring prompt from `skills/design-score.md` as a fresh conversation.

---

## Updating

Re-run the export command after upgrading DesignOS:

```bash
node DesignOS/bin/designos.js export windsurf   # or cline / aider
```

The generated file includes a header with the DesignOS version — check it to verify you're on the latest export.

---

## Any other agent

If your tool isn't listed here, copy the DesignOS kernel into its rules/system-prompt slot:

```bash
cat DesignOS/CLAUDE.md
# → paste the output into your tool's system prompt or rules file
```

The kernel is self-contained. Project-specific overrides live in the local copy of `CLAUDE.md`; the knowledge modules are referenced by path from `DesignOS/`.
