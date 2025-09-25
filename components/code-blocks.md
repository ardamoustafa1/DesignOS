# Code Blocks & Technical Content

For developer-facing products, code blocks ARE the marketing (`industries/analytics-hosting.md`:
docs quality is evaluated before the product). A broken copy button loses more trials than
a weak headline.

## Code block spec
```
Surface     one step darker than page (light themes: neutral-900 block is fine — code
            blocks may be the sole dark island) or raised surface (dark themes)
Type        13–14px mono (--font-mono) · line-height 1.6 · NEVER italic code
Padding     16–20px · radius-md · max-height ~480px then internal scroll
Overflow    horizontal scroll inside the block (never wraps mid-token, never page-scrolls)
            + edge-fade cue
Line nums   docs/tutorials: yes, muted, unselectable (user copies code, not numbers)
            snippets ≤5 lines: no
```

## Syntax highlighting
- One theme, designed with the token system — not a default Prism theme beside a custom
  brand (the mismatch is instantly visible). 5–7 token colors max, all ≥4.5:1 on the block
  surface, both product themes covered.
- Highlight *semantics that matter*: keywords, strings, comments distinct; don't rainbow
  every token class.
- **Line highlighting** for tutorials: tinted bg on the lines under discussion + optional
  diff notation (`+`/`-` with subtle green/red tints — colorblind-safe: keep the symbols).

## The copy button (the most important button in dev marketing)
- Top-right, visible always (not hover-only — touch, and discoverability), 32px target.
- Click → icon swaps to ✓ + "Copied" 1.5s (`motion/micro-interactions.md` canonical).
- Copies the CODE only: no line numbers, no `$` prompts, no output lines — test this;
  a pasted `$ npm install` fails and the user blames the product.
- Multi-command blocks: consider per-line copy or split blocks.

## Terminal/shell blocks
- Distinguish command from output visually (prompt glyph muted + command bright; output
  dimmed) — and exclude prompts/output from copy.
- No fake window chrome (traffic lights) on every block — that's a screenshot device;
  inline docs blocks stay chromeless. Pick one convention.

## Code in context
- **Inline code:** `--accent-subtle`-tinted bg, 0.9em mono, 1px padding-x radius-sm —
  readable inside prose without shouting; never for emphasis of non-code.
- **Tabbed language switchers** (npm/yarn/pnpm, curl/js/python): user's choice persists
  globally across the page and across visits (localStorage) — re-picking npm on every
  block is the classic docs rage (`components/tabs-accordions.md` mechanics).
- **File names/paths:** header bar on the block (13px mono muted) when identity matters.
- **Interactive playgrounds:** earn them (real execution, real value) — a fake editable
  block that doesn't run is worse than a static one. Fallback content for JS-off.

## The hero code block (marketing)
The dev-product hero's product-shot equivalent (`components/hero.md` product-first):
real code that would actually run, short enough to read in 5s (≤10 lines), demonstrating
the CORE value ("git push → deployed"). Typing animation licensed here — once, skippable,
reduced-motion → static (`industries/ai-startup.md` streaming rules).

## Accessibility & SEO
- `<pre><code class="language-x">` semantics; block labeled (aria-label or visible
  filename) when its identity matters.
- Keyboard: block focusable when scrollable (`tabindex="0"` + visible focus) — trapped
  horizontal scroll without keyboard access fails the audit.
- Don't ship code as images. Ever. (Unsearchable, uncopyable, uncrawlable, unreadable
  at zoom.)

## Anti-patterns
- Copy button that copies prompts/line numbers (test it!)
- Light-gray-on-white code at 11px (the "we don't actually expect you to read this" look)
- Wrapping long lines mid-token; page-level horizontal scroll from a wide block
- Screenshot-of-code in docs; syntax theme clashing with brand theme
- Ten-language tab switchers where three are untested guesses (wrong sample code is
  negative documentation)

## Checklist
- [ ] Block spec + one designed syntax theme, both product themes, tokens ≥4.5:1
- [ ] Copy: always visible, copies clean code, confirms — tested by pasting
- [ ] Command vs output distinguished and copy-excluded
- [ ] Language tabs persist globally; inline code styled; filenames where needed
- [ ] Focusable-when-scrollable, semantic markup, zero code-as-image
