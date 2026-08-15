# DesignOS Edit Hooks

`designos-hook.js` runs the unified detector registry after an agent edit. It accepts a
JSON event on stdin and recognizes `file_path`, `path`, or `tool_input.file_path`.

Set `DESIGNOS_HOOK_MODE` to `observe`, `warn` (default), `block`, or `deep-on-stop`.
Provider manifests are installed by `designos hooks install`; unrelated hook entries are
preserved.

## Two different layers — read this before assuming either one "forces" anything

`designos hooks install` writes **two kinds of hook**, and they are not equally strong.

**Editor/agent manifests** (`.claude/settings.local.json`, `.codex/hooks.json`,
`.cursor/hooks.json`, `.agent/hooks.json`, `.github/hooks/designos.json`) are requests to
a specific tool's own binary. DesignOS cannot make a closed-source app honor a file it
didn't write the reader for — every one of these depends on that tool actually
implementing hooks, having them enabled, and choosing to run this one. Concretely, as
verified against each tool's own docs (2026-08):

| Target | Confidence | The catch |
|---|---|---|
| Claude Code | confirmed | none — this is the mechanism this project's own agent uses |
| Cursor | confirmed | `preToolUse` can block; `afterFileEdit` (which sounds like the obvious choice) cannot |
| Codex CLI | confirmed, but gated | hooks are **off by default** — requires the user's own `~/.codex/config.toml` to enable the feature; `hooks install` prints this, it cannot flip the flag for them |
| Google Antigravity | best-effort | schema was still hedged in Google's own docs at time of writing; verify with `hooks status` after a real session, don't trust it blind |
| GitHub Copilot | confirmed, narrow scope | only the **cloud** coding agent, not the interactive VS Code/JetBrains extension most people mean by "Copilot" |

Every other export target (Windsurf, Cline, Aider, Gemini CLI, OpenCode, Grok, Pi, Qoder,
Rovo Dev, Vibe, Amp, Zed) has **no hook mechanism at all** as of this writing — a rules
file, yes; a way to gate an edit before it lands, no.

**The git pre-commit hook** (`designos hooks install --git`) is the layer that is not
advisory. It does not ask any AI tool to cooperate — it runs on `git commit`, inspects the
staged diff, and calls `designos review` on every staged `.html`/`.jsx`/`.tsx`/`.vue`/
`.svelte` file. If any of them score below the threshold, the commit is rejected before it
exists. This works identically whether Claude Code, Cursor, Codex, Antigravity, a tool
with no hook support at all, or a human typing by hand produced the diff — the check is on
the artifact, not on trusting the agent's behavior.

```bash
node DesignOS/bin/designos.js hooks install --git [--review-min 95]
```

Preserves an existing non-DesignOS `pre-commit` hook (warns instead of overwriting; merge
by hand). Detects Husky (`.husky/`) and installs there instead of `.git/hooks/` if
present. Escape hatch for a genuine one-off: `DESIGNOS_SKIP_HOOK=1 git commit ...` — this
is intentionally not un-bypassable; the point is to stop unreviewed drift, not to make an
emergency fix impossible.

**If you actually want every tool to behave the same way**, install both layers. The
editor manifests catch problems earlier (before the agent even finishes), where they
work; the git hook is the backstop that catches everything else, unconditionally.

## Status

```bash
node DesignOS/bin/designos.js hooks status
```

Reports install state and the confidence level for every manifest, plus whether the git
hook is installed.
