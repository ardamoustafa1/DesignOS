# Conversational & AI-Native UI

Chat surfaces, copilots, and voice interfaces — where the interface is a *dialogue* and
the "content" arrives generated, streaming, and occasionally wrong. The conventions are
still forming (`brain/trend-radar.md` watch list); these are the rules stable enough to
enforce now.

## When conversation is the right shape (gate first)
Conversation excels at: open-ended intent ("figure out what I need"), synthesis across
sources, iterative refinement. It's the WRONG shape for: known repeated tasks (a button
beats typing the same request), precise parameter entry (forms exist —
`components/forms.md`), and browsing (lists/search beat "ask me anything").
**Hybrid is the doctrine:** chat for intent, structured UI for execution — the model
proposes, real components confirm (a date change renders a `components/pickers.md`
picker inline, not a "did you mean the 15th?" loop).

## The message stream
```
Layout     single column, 680–760px reading measure · user vs assistant visually
           distinct (alignment or surface, one convention) · timestamps quiet
Assistant  rich blocks: prose (typography.md prose rules), code (code-blocks.md,
           copy buttons), tables, charts — generated content gets FULL component
           treatment, not monospace soup
Grouping   day markers · long outputs get internal headings (attention.md layer-cake
           applies to generated prose too)
History    searchable (search-command.md), conversations named (auto-titled, editable),
           deep-linkable
```

## Streaming (the genre's signature state)
- Token-streaming with a stable layout: the stream container reserves growing space
  smoothly — no per-token reflow of surrounding UI (`components/states.md` zero-CLS
  doctrine under generation).
- **Stop and skip are user rights:** a visible stop button during generation; instant-
  complete affordance where the content is already determined
  (`industries/ai-startup.md` typing-animation rules).
- Phase honesty: "Searching → Reading 4 sources → Writing" beats a spinner — generated
  work has stages; show the real ones (`components/states.md` progress communication).
- `aria-live` strategy: announce message-complete, never every token (screen-reader
  users drown otherwise); reduced-motion: stream without the cursor theatrics.

## Trust surfaces (where AI UI is won or lost)
- **Uncertainty is a UI state:** confidence framing in the prose, sources cited inline
  (chips/footnotes linking out — verifiable beats fluent), and "I can't do X" stated
  plainly (`industries/ai-startup.md` capability-boundary doctrine).
- **Provenance:** generated vs. retrieved vs. user-authored content visually
  distinguishable — a hallucinated number styled identically to a database value is a
  design failure, not a model failure.
- **Actions need consent gradients:** reading is free; the model *doing* things
  (sending, deleting, buying) gets a preview-and-confirm block rendered as real UI
  (`components/modals.md` consequence doctrine) — never buried in prose ("I've gone
  ahead and…" is the genre's dark pattern).
- Feedback loop: per-response rating (👍/👎 + optional why) styled quietly; correction
  ("edit my message" / "regenerate") always available — dead-end responses violate the
  no-dead-ends law.

## The input
- Auto-growing textarea (1→~8 lines), Enter sends / Shift+Enter newlines (or the
  platform convention — decide, keep), send button visible for touch.
- Affordance scaffolding for the blank-canvas problem: suggested prompts (contextual,
  3–4, real — `components/states.md` empty-state doctrine for chat), attachment/tool
  affordances discoverable (`components/file-upload.md` for the drop path).
- Slash/command grammar where power users live (`components/search-command.md` prefix
  doctrine).

## Voice interfaces (the eyes-free variant)
- State must be audible AND visible: listening / processing / speaking states with
  distinct visuals (waveform conventions) for the glanceable check.
- Barge-in (interrupting the assistant) supported — the voice equivalent of the stop
  button; confirmation for consequential actions is verbal + on-screen.
- Always a text fallback path (noisy rooms, accents, a11y — voice-only is
  exclusion-by-design).

## Anti-patterns
Fake typing delays on canned content · chat as the ONLY path to core features ·
uncited authoritative-sounding claims · action-taking announced in past tense ·
infinite personality, zero capability honesty (`psychology/emotional-design.md`
condescension mode) · suggestion chips that don't match real capability · walls of
un-headed generated prose · the 👍👎 that visibly changes nothing.

## Checklist
- [ ] Conversation-shape gate passed; hybrid execution via real components
- [ ] Streaming: stable layout, stop/skip, phase honesty, sane aria-live
- [ ] Provenance + citations + capability boundaries rendered as UI states
- [ ] Consequential actions: preview-and-confirm blocks, never prose-buried
- [ ] Blank canvas scaffolded; input conventions decided and consistent
- [ ] Voice: audible+visible states, barge-in, text fallback
