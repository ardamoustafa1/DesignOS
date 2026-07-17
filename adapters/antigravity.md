# Antigravity Adapter

Antigravity is useful for fast agentic UI generation, but it can over-trust its own
scorecard. Use DesignOS as the deterministic floor after the agent writes files.

## Setup

Run these in the terminal inside your project:

```bash
npx github:ardamoustafa1/DesignOS init --agents --skills
node DesignOS/bin/designos.js doctor
```

If `DesignOS/` already exists, use:

```bash
npx github:ardamoustafa1/DesignOS init --agents --skills --force
```

## What Goes Where

| Surface | Put this there |
|---|---|
| Terminal | install, doctor, review, git commands |
| Antigravity chat | task prompt, DesignOS instructions, review fix prompt |
| Files panel | inspect generated HTML/React/CSS files |

Do not paste terminal output file lists as commands. `DesignOS/`, `CLAUDE.md`, and
`.claude/agents/` are paths, not commands.

## First Test Prompt

Paste this into Antigravity chat:

```text
Use DesignOS. Read @DesignOS/CLAUDE.md first.

Design a Stripe-level pricing page for a cybersecurity SaaS.
Load the relevant modules, especially:
- DesignOS/patterns/pricing.md
- DesignOS/industries/cybersecurity.md
- DesignOS/components/states.md
- DesignOS/PROOF_STANDARD.md

Create the result as pricing.html.
Run the design loop, include loading/error/empty/success states where applicable,
score all six dimensions, and redo anything under 95.

Important: do not invent customers, logos, testimonials, certifications, awards,
usage counts, or compliance claims. Fictional brands must be labelled fictional.
```

## Deterministic Review

After Antigravity writes the file, run:

```bash
node DesignOS/bin/designos.js review pricing.html --min 95
```

If it fails, generate an agent-ready repair prompt:

```bash
node DesignOS/bin/designos.js review pricing.html --min 95 --fix-prompt --no-fail
```

Paste that output back into Antigravity.

## What To Watch For

Antigravity often writes a confident report before the deterministic review passes.
Treat that report as draft notes, not the final gate.

Common issues:

- fake logo strips
- "Trusted by" claims
- synthetic testimonial names
- certification claims such as SOC 2 Type II without evidence
- real quotes represented by `<blockquote>` without sources
- raw SVG colors instead of `currentColor`

## Best Loop

1. Antigravity creates the file.
2. Terminal runs `designos review`.
3. Terminal prints `--fix-prompt`.
4. Antigravity applies the fix prompt.
5. Terminal reruns `designos review --min 95`.

Stop only when the deterministic review passes and the human/model taste review still
agrees with the direction.

## Anti-patterns

- Trusting Antigravity's self-score when `designos review` disagrees.
- Letting fictional brands look like real adoption.
- Fixing proof copy while leaving testimonial class names and blockquotes that imply
  real quotes.
- Running terminal commands in the Antigravity chat instead of the shell.

## Checklist

- [ ] `doctor` is clean or only has explained advisory items
- [ ] Antigravity prompt names `@DesignOS/CLAUDE.md`
- [ ] `PROOF_STANDARD.md` is explicitly loaded for marketing/pricing work
- [ ] `designos review` passes at 95+
- [ ] Any repair prompt from `--fix-prompt` is pasted back into Antigravity
