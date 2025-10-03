Generate or refresh this project's canonical design-token block. $ARGUMENTS

Follow `DesignOS/foundations/design-tokens.md` (the three-tier architecture) exactly:

1. **Source the decisions:** read `memory/brand.md` + `memory/design.md`. If no brand
   decisions exist yet, run the choosing procedures first — accent by
   `DesignOS/psychology/color-psychology.md`'s five-step procedure, type pairing by
   `DesignOS/foundations/typography.md`, motion preset by
   `DesignOS/motion/principles.md` — and record each choice WITH its reason in
   `memory/brand.md`.

2. **Build the Tier-2 semantic block** on the skeleton of
   `DesignOS/starter/tokens.css`: color (surfaces, text, borders, accent, semantics),
   type scale (base 16, chosen ratio, clamp() display), 4px spacing scale, radius/
   elevation ladders, motion tokens, containers — plus the dark-theme override block
   built per `DesignOS/foundations/dark-mode.md` physics (lightness-ladder elevation,
   desaturated accents, no pure black/white).

3. **Verify before delivering:** run `DesignOS/validators/contrast.js` on every
   text-token × surface-token pair that will co-occur (both themes — muted-on-raised
   is the classic failure); adjust failing values (shift lightness, keep hue).

4. **Deliver:** the complete `:root` block (+ dark override) as the project's single
   source of truth, a short rationale (which decisions, why), and paste the block into
   `memory/design.md`'s token section. If tokens already existed: show a diff of what
   changed and why, and alias deprecated names for one cycle rather than deleting.
