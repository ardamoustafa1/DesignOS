# Brief Compiler — Turn Requests into Design Contracts

Great output is usually won before the first component is drawn. This module converts a
loose request into a compact, testable design contract without turning intake into an
interview marathon. Run it after `brain/decision-framework.md` and before task routing.

## The contract

Compile every design request into these fields. Read project memory first; ask only for
missing information that would materially change the result. Otherwise use the 70% rule,
label the assumption, and continue.

| Field | Decision it controls | Minimum usable answer |
|---|---|---|
| Intent | hierarchy and primary action | one behavior the surface must cause |
| Reader | density, language, proof | role, expertise, emotional state, likely device |
| Job and doubt | flow and objection handling | top job plus the moment confidence drops |
| Product material | inspectable artifact and signature | real inputs, outputs, data shapes, workflow, or object |
| Proof inventory | trust strategy | verified assets, unavailable proof, claim level from `PROOF_STANDARD.md` |
| Asset inventory | composition | screenshots, brand assets, photography, illustration, and their quality |
| Brand belief | copy and art direction | a specific opinion the product can credibly own |
| Never-list | anti-template constraints | clichés, competitors, tones, colors, or patterns to avoid |
| Constraints | implementation | stack, target files, themes, locales, performance, legal, timeline |
| Acceptance | completion | breakpoints, states, task success, measured checks, required gate |

## Originality synthesis

Do not ask the user to invent a visual style. Derive three meaningfully different
directions from their material:

1. **Material-led** — turn a real product object, workflow, data shape, or transformation
   into the hero and recurring visual language.
2. **Audience-led** — borrow a credible structure or texture from the reader's working
   world, not from the sector's most common landing-page template.
3. **Belief-led** — express the brand's specific point of view through type voice,
   composition, copy rhythm, or one interaction.

For a full page or expensive-to-reverse system, compare all three. Score each direction
against intent, clarity, product truth, distinctiveness, accessibility, and performance.
Choose one and record why in `memory/design.md`. For a small component, one derived
direction is enough; do not manufacture three cosmetic variants.

The chosen direction declares:

- **signature vehicle** — type, product artifact, layout gesture, motion, data language,
  copy voice, or image system;
- **derivation chain** — product/audience/belief fact → design move → user benefit;
- **repetition rule** — where the signature returns so it becomes a language;
- **cost guard** — how it avoids usability, accessibility, and performance debt;
- **anti-clone check** — which reference tactic is transferred and which branded motif
  is explicitly prohibited.

## Prompt assembly

Use this order when producing an agent-ready prompt. Constraints placed after visual
requests are often ignored; the contract comes first.

```text
ROLE AND OUTCOME
Act as DesignOS. Cause: <one behavior>. Reader: <one-reader sentence>.

TRUTH AND MATERIAL
Product material: <inputs/outputs/workflow/data>. Verified proof: <inventory + levels>.
Unavailable or forbidden claims: <list>. Assets: <inventory and quality>.

DIRECTION
Brand belief: <specific opinion>. Never-list: <anti-references>.
Chosen signature: <vehicle>. Derivation: <fact -> move -> benefit>.

SCOPE AND CONSTRAINTS
Target: <files/surface>. Stack: <stack>. Breakpoints/themes/locales: <scope>.
Required states: <applicable matrix>. Performance/legal constraints: <list>.

PROCESS
Boot the kernel; route only relevant modules; run the Design Loop; render and inspect
applicable viewports; run the deterministic Final Gate when a file target exists.

DELIVERY
Artifact + verification evidence + deterministic result (or clearly labeled self-review)
+ rationale + project-memory updates. Never claim a pass for an unmeasured check.
```

## Anti-patterns

- Adjective briefs: "premium, modern, beautiful" without material, audience, or truth.
- Reference cosplay: "make it Linear" without naming a transferable tactic and a
  prohibited brand-specific motif.
- Fake specificity: inventing metrics, logos, testimonials, compliance, or product UI to
  make a sparse brief feel complete.
- Intake theater: blocking on low-impact questions instead of using labeled assumptions.
- Prompt inflation: pasting every module into the prompt; route only what changes action.
- Variant theater: three versions that differ only by color, radius, or gradient.

## Checklist

- [ ] Contract names intent, reader state, product material, proof, assets, belief,
  never-list, constraints, and acceptance evidence
- [ ] Missing facts are either asked once or recorded as labeled assumptions
- [ ] Full-page direction choice compares three structurally distinct hypotheses
- [ ] Signature includes a derivation chain, repetition rule, cost guard, and anti-clone check
- [ ] Prompt boots the kernel and requires render inspection plus the Final Gate
- [ ] No unverified claim, alternate mini-kernel, or unnecessary module dump remains
