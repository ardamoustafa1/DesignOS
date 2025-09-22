# Getting Started with DesignOS

Five minutes from clone to first Stripe-grade screen.

## 1. Install

**Per project (recommended):**

```bash
cp -r DesignOS /path/to/your-project/DesignOS
```

Add to your project's `CLAUDE.md` (create it if missing):

```markdown
# Project Instructions
@DesignOS/CLAUDE.md
```

Claude Code resolves the `@` import automatically. Other agents (Cursor, Copilot Workspace):
paste the contents of `DesignOS/CLAUDE.md` into their rules file (`.cursorrules`,
`.github/copilot-instructions.md`) and keep the folder in the repo so the agent can read modules.

**Globally for every project:**

```bash
cp -r DesignOS ~/.claude/DesignOS
echo "@~/.claude/DesignOS/CLAUDE.md" >> ~/.claude/CLAUDE.md
```

## 2. Optional: register the agents

The files in `agents/` use Claude Code subagent frontmatter. To make them spawnable:

```bash
mkdir -p .claude/agents
cp DesignOS/agents/*.md .claude/agents/
```

Now `reviewer`, `accessibility`, etc. are available as real subagents — the kernel's
review stage can run as a genuinely independent second opinion.

## 3. First run

Start a session and give it a real brief:

> Design a landing page for an AI meeting-notes startup. Audience: heads of sales.
> Tone: confident, technical, not hypey. Dark theme.

Watch for the DesignOS signature behaviors:

1. It announces which modules it loaded (`industries/ai-startup.md`, `patterns/landing-pages.md`, …).
2. It works through the Design Loop stages, not straight to code.
3. It ends with a scorecard — and if anything is under 95, it iterates *before* showing you.
4. It creates `memory/` files recording the decisions it made.

## 4. Steering it

- **Lock a decision:** "Record in brand.md: primary color is #6366F1, never purple gradients."
  It persists across sessions via `memory/brand.md`.
- **Request a re-score:** "Run the review loop on the current page."
- **Change sector:** "Treat this as fintech from now on" → it reloads `industries/fintech.md`.
- **Tighten the gate:** "Threshold is 97 for this client."

## 5. Project memory

Each project gets seven files (templates in `memory/templates/`):

| File | Holds |
|---|---|
| `client.md` | Who the client is, goals, constraints |
| `brand.md` | Colors, type, voice, logo rules |
| `design.md` | System decisions: scale, spacing, radius, shadows |
| `pages.md` | Page inventory + status |
| `todo.md` | Open work, prioritized |
| `bugs.md` | Known visual/UX defects |
| `notes.md` | Everything else worth remembering |

The agent reads them at boot and appends after every work session. Nothing gets forgotten.

## Troubleshooting

- **Agent skips the loop** → your rules file isn't loading `CLAUDE.md`; check the `@` import path.
- **Generic-looking output** → no sector was routed; state the industry explicitly once.
- **Scores feel inflated** → spawn `reviewer` as a separate subagent (step 2) so the grader isn't grading its own homework.
