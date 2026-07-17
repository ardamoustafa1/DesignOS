# Getting Started with DesignOS

Five minutes from install to your first scored screen.

## 1. Install

```bash
npx github:ardamoustafa1/DesignOS init --agents --skills
```

This is the tested, verified path — it fetches the live repo, copies it into
`./DesignOS` (including the CLI itself, at `DesignOS/bin/`), wires
`@DesignOS/CLAUDE.md` into your project's `CLAUDE.md`, registers the 9 specialist
subagents in `.claude/agents/`, and installs the `/design-*` slash commands in
`.claude/commands/`.

⚠️ **After install, every follow-up command uses the local copy — never bare `npx
designos …`.** That name is already taken by an unrelated package on the npm registry;
running it silently invokes the wrong tool. Always:

```bash
node DesignOS/bin/designos.js doctor        # health check
node DesignOS/bin/designos.js export all    # rules for Cursor/Copilot/Windsurf/Cline/Aider
node DesignOS/bin/designos.js audit src/    # run the validators against your own code
node DesignOS/bin/designos.js review src/ --fix-prompt --no-fail
node DesignOS/bin/designos.js report src/ --no-fail
```

<details>
<summary><b>Manual install (no npx)</b></summary>

```bash
git clone https://github.com/ardamoustafa1/DesignOS.git
cd your-project
cp -r ../DesignOS ./DesignOS
echo "@DesignOS/CLAUDE.md" >> CLAUDE.md         # Claude Code auto-loads it
cp DesignOS/agents/*.md .claude/agents/          # optional: real subagents
cp DesignOS/skills/design-*.md .claude/commands/ # optional: slash commands

# or globally, for every project:
cp -r ../DesignOS ~/.claude/DesignOS
echo "@~/.claude/DesignOS/CLAUDE.md" >> ~/.claude/CLAUDE.md
```

Other agents (Cursor, Copilot, Windsurf, Cline, Aider): don't hand-paste `CLAUDE.md` —
run `node DesignOS/bin/designos.js export <target>` instead; it generates the correctly
formatted rules file for each and keeps a regenerable link back to the kernel.
</details>

## 2. Verify the install

```bash
node DesignOS/bin/designos.js doctor
```

Confirms: `DesignOS/CLAUDE.md` present, the local CLI copy present, `CLAUDE.md` imports
the kernel, subagent and slash-command counts, and whether project memory is
bootstrapped yet. Run this anytime something feels off — see also
[integrations/README.md](integrations/README.md) for the per-agent capability matrix.

## 3. First run

Start a session (Claude Code, or your export target) and give it a real brief:

> Design a landing page for an AI meeting-notes startup. Audience: heads of sales.
> Tone: confident, technical, not hypey. Dark theme.

Watch for the DesignOS signature behaviors — this is the whole point, and it's
directly observable, not a black box:

1. It states which modules it loaded (`industries/ai-startup.md`,
   `patterns/landing-pages.md`, …) — see `CLAUDE.md`'s routing table for how that
   decision gets made.
2. It works through the Design Loop stages (`loops/design-loop.md`), not straight to code.
3. It ends with a scorecard (`scoring/rubric.md`) — and if any dimension is under 95,
   it iterates *before* showing you, not after.
4. It creates `memory/` files recording the decisions it made, with reasons.

Don't want to write a real brief yet? `examples/README.md` has four complete pages
already built this way, each with its full decision trail — read one first if you want
to see the destination before driving there yourself.

## 4. Steering it

- **Lock a decision:** "Record in brand.md: primary color is #6366F1, never purple
  gradients." Persists across sessions via `memory/brand.md`.
- **Request a re-score:** "Run `/design-review` on the current page" or "run the review
  loop on the current page."
- **Change sector:** "Treat this as fintech from now on" → reloads `industries/fintech.md`.
- **Tighten the gate:** "Threshold is 97 for this client."
- **Check a rule:** "Why did you choose X?" — it should cite the module and the reason,
  not just assert taste.

## 5. Project memory

Each project accumulates seven files (templates in `memory/templates/`):

| File | Holds |
|---|---|
| `client.md` | Who the client is, goals, constraints |
| `brand.md` | Colors, type, voice, logo rules |
| `design.md` | System decisions: scale, spacing, radius, shadows |
| `pages.md` | Page inventory + status |
| `todo.md` | Open work, prioritized |
| `bugs.md` | Known visual/UX defects |
| `notes.md` | Everything else worth remembering |

The agent reads them at boot and appends after every work session. Nothing gets
forgotten — see `memory/README.md` for the write discipline.

## 6. Prove and publish the work

Once you have a real screen, turn the result into something inspectable:

```bash
node DesignOS/bin/designos.js report src/ --no-fail
node DesignOS/bin/designos.js eval cursor-pricing --agent Cursor --brief B-001
node DesignOS/bin/designos.js case acme-pricing --project "Acme Pricing" --url https://example.com
```

- `report` creates a delivery report with the deterministic review gate, an agent-ready
  fix prompt, and the manual sign-off checklist.
- `eval` creates the folders and README needed for an independent benchmark run:
  `control/`, `treatment/`, and `logs/`.
- `case` creates a full case-study page plus a ready-to-paste `SHOWCASE.md` row.

## 7. Going deeper

- **How the system is built:** [ARCHITECTURE.md](ARCHITECTURE.md) — the layer stack,
  the control-flow for one brief, why it's markdown instead of code.
- **The whole system on one page:** [CHEATSHEET.md](CHEATSHEET.md).
- **The vocabulary:** [GLOSSARY.md](GLOSSARY.md).
- **What DesignOS gets wrong by default (and how it's caught):**
  [museum/README.md](museum/README.md).
- **CI integration:** copy `.github/workflows/validate.yml` into your own repo to run
  the validators on every PR.

## Troubleshooting

- **`doctor` reports the kernel missing** → re-run install with `--force`, or check you
  didn't accidentally `.gitignore` `CLAUDE.md` in your own project.
- **Agent skips the loop** → your rules file isn't loading `CLAUDE.md`; check the `@`
  import line is actually present and unbroken.
- **Generic-looking output** → no sector was routed; state the industry explicitly once.
- **Scores feel inflated** → spawn `reviewer` as a separate subagent (installed by
  `--agents`) so the grader isn't grading its own homework.
- **`npx designos <command>` did something weird / touched files outside your project**
  → you hit the npm name collision (see the warning in step 1). Undo whatever it
  changed and use `node DesignOS/bin/designos.js <command>` instead.
