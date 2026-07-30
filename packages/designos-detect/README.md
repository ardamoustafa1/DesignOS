# designos-detect

A standalone, dependency-free static detector for design/UI anti-patterns — 40 rules
covering token discipline, accessibility basics, motion budgets, aesthetic "AI slop"
tells, and brand-signature consistency. No LLM calls, no network access, no API key.

Vendored from [DesignOS](https://github.com/ardamoustafa1/DesignOS)'s validator registry
(`validators/rule-registry.js`) — this package exists so a project can install the
detector alone, without the rest of DesignOS's knowledge base.

## Install

```bash
npm install --save-dev designos-detect
```

## Use

```bash
npx designos-detect src/                              # the full sweep
npx designos-detect src/ --rule motion-transition-all  # one rule only
npx designos-detect src/ --json --out ledger.json      # machine-readable, written to a file

npx designos-detect motion-gaps src/                   # advisory — never fails a build
npx designos-detect signature-check src/               # brand-signature-lock consistency
npx designos-detect originality-check page.html --add  # structural self-similarity
```

Exit codes: `0` clean, `2` findings exist, `1` a provider itself failed to run.

## What it checks

| Category | Examples |
|---|---|
| Tokens | raw hex outside `:root`, off-grid spacing, `!important` outside the reset layer |
| Accessibility | missing alt text, no focus-visible treatment, non-semantic click handlers |
| Motion | `transition: all`, non-compositor properties, unlicensed springs, missing reduced-motion, uncleared transitions during a drag gesture |
| Aesthetic slop | named defaults (`Acme Corp`, `Lorem ipsum`), unsourced trust claims |
| Brand consistency | a page drifting from a project's declared signature motif (opt-in, see `signature-check`) |

Full rule list, severities, and fix guidance: see the vendored `lib/rule-registry.js`, or
the canonical source at
[`validators/rule-registry.js`](https://github.com/ardamoustafa1/DesignOS/blob/main/validators/rule-registry.js).

## Honest limits

This is static analysis over source text — it reads declarations, not rendered pixels or
frame timing. A clean run means "no known anti-pattern was found in the source," never
"this design is good." Treat every finding as a heuristic prompt to look, not a proof.

## Maintaining this package (for DesignOS contributors)

`lib/` is vendored from the parent repo's `validators/` directory — never edit it
directly; edit `validators/` and re-run:

```bash
npm run vendor         # copy validators/*.js into lib/
npm run check:vendor   # CI guard: fails if lib/ has drifted from validators/
```

## License

MIT
