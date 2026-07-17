# Cursor Adapter

Best path:

```bash
npx github:ardamoustafa1/DesignOS init
node DesignOS/bin/designos.js export cursor
```

This creates `.cursorrules` from the DesignOS kernel while keeping the module library in
`./DesignOS/`.

## Recommended Workflow

1. Keep DesignOS committed in the repo so Cursor can read the modules.
2. Use `designos brief` to generate a precise task prompt.
3. Tell Cursor which surface is being edited and which industry applies.
4. Ask Cursor to cite loaded modules before implementation.
5. Run `designos review` on changed UI files.

## Best For

- Cursor project rules
- quick UI iteration
- codebase-aware refactors

## Watch For

Cursor may not load every referenced markdown file unless the task names it. Be explicit:
"Load `DesignOS/patterns/pricing.md` and `DesignOS/industries/fintech.md` before editing."
