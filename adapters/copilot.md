# Copilot Adapter

Best path:

```bash
npx github:ardamoustafa1/DesignOS init
node DesignOS/bin/designos.js export copilot
```

This writes `.github/copilot-instructions.md`.

## Recommended Workflow

1. Keep prompts smaller and more explicit than Claude/Cursor prompts.
2. Name the exact DesignOS module path in the issue or PR description.
3. Use `designos brief` to create a structured issue body.
4. Use the DesignOS Review Action as the deterministic PR floor.

## Best For

- GitHub-native workflows
- issue-to-PR tasks
- teams already using Copilot instructions

## Watch For

Copilot is strongest when the repo itself contains the context. Commit `DesignOS/`,
`memory/`, and generated instructions together.
