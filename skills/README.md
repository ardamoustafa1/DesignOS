# Skills — DesignOS Slash Commands

Turnkey Claude Code slash commands. Install into a project:

```bash
npx designos skills        # copies these into .claude/commands/
```

Then in any session:

| Command | Does |
|---|---|
| `/design-review [path or scope]` | Runs the Review Loop on existing work — six-dimension report, no fixes applied |
| `/design-score` | Score-only pass on the current working state; fills the report template |
| `/design-brief` | Interactive intake — asks the five answers, then runs the right workflow |
| `/design-tokens` | Generates or refreshes the project's canonical token block from memory + foundations |

These are thin entry points — each command routes into the same kernel, loops, and
rubric the system always uses. They exist so the loop is one keystroke away instead of
one paragraph away.

Files here are plain Claude Code command format: markdown prompt bodies, `$ARGUMENTS`
substituted. Edit freely per project; regenerate from this folder after DesignOS upgrades.
