# Starters

Starter packages are lightweight project recipes, not framework lock-in. Each one tells
the agent which modules to load, what to build first, and how to verify the result.

## Scaffold

```bash
node DesignOS/bin/designos.js starter landing-page my-launch
node DesignOS/bin/designos.js starter react-dashboard ops-console
node DesignOS/bin/designos.js starter next-saas acme-saas
```

Each scaffold copies the starter files plus `tokens.css` and `tokens.json`.

- [Next SaaS](next-saas/README.md)
- [React Dashboard](react-dashboard/README.md)
- [Landing Page](landing-page/README.md)
- [Mobile App](mobile-app/README.md)
- [Docs Site](docs-site/README.md)

Shared token seeds:

- [`tokens.css`](tokens.css)
- [`tokens.json`](tokens.json)
