# Claude Code Adapter

Best path:

```bash
npx github:ardamoustafa1/DesignOS init --agents --skills
node DesignOS/bin/designos.js doctor
```

## Recommended Workflow

1. Start with `designos brief` and paste the generated brief into Claude Code.
2. Let Claude load `@DesignOS/CLAUDE.md`.
3. Use the installed subagents for review-heavy work.
4. Ask for `/design-review` before accepting UI changes.
5. Run `node DesignOS/bin/designos.js review <changed-path>` locally before PR.

## Best For

- multi-file UI work
- redesigns
- long-lived projects where memory matters
- agentic loops with reviewer subagents

## Watch For

Claude can still over-score its own work. For important screens, spawn the reviewer as
a separate subagent or run `designos review` as a deterministic floor.
