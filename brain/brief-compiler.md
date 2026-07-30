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

## Design dials

The contract fixes *what* the surface must do. The dials fix **how far** to push it — the
three axes where "premium" means opposite things depending on the brief. Set them once,
from the contract, before any module is loaded; every downstream decision reads them.

| Dial | 1 | 5 | 10 |
|---|---|---|---|
| `DESIGN_VARIANCE` | strict grid, symmetric, one column rhythm | asymmetry with intent, one broken rule | editorial collage, overlap, rule-breaking as the language |
| `MOTION_INTENSITY` | state feedback only, nothing else moves | entrances, one signature moment | scroll choreography, pinned sequences, cinematic |
| `VISUAL_DENSITY` | gallery — one idea per screen | product default | cockpit — every pixel is a live value |

### Inferring them (do not ask; derive, label, continue)

| Signal in the brief | Variance | Motion | Density |
|---|---|---|---|
| Enterprise dashboard, admin, ops console | 2–3 | 2–3 | 8–9 |
| Fintech / health / legal / insurance surface | 2–4 | 2–3 | 5–7 |
| Developer tool, docs, technical product | 3–4 | 3–4 | 6–7 |
| B2B SaaS marketing page | 4–5 | 4–5 | 4–5 |
| Consumer app onboarding | 5–6 | 5–7 | 3–4 |
| Agency, portfolio, creative studio | 8–10 | 7–9 | 2–4 |
| Gaming, entertainment, media launch | 7–9 | 7–9 | 4–6 |
| Print, invoice, report, PDF | 2–3 | 1 | 6–8 |

The sector file wins on conflict (`CLAUDE.md` §2 rule 3). A "playful fintech" brief does not
license `MOTION_INTENSITY: 8` — `industries/fintech.md` caps it, and the rationale records
the override.

### What each dial actually binds to

**`DESIGN_VARIANCE`** → `foundations/grids.md` (column count and whether the grid may be
broken), `foundations/layout.md`, `brain/originality.md` (how aggressive the signature
vehicle may be). Below 4, every element sits on the grid. Above 7, the brief must name the
one structural rule being broken and why — variance without a reason is noise, not taste.

**`MOTION_INTENSITY`** → `motion/principles.md` character preset, `motion/recipes.md`,
`motion/page-and-scroll.md`. Binding thresholds:

- **≤ 2** — state feedback only. No entrances, no scroll reveals. `motion/micro-interactions.md` alone.
- **3–5** — entrances allowed; exactly one signature moment; scroll reveals fire once.
- **6–8** — scroll choreography licensed; `motion/page-and-scroll.md` applies in full;
  `prefers-reduced-motion` handling stops being a checkbox and becomes a designed second state.
- **9–10** — pinned/scrubbed sequences; requires an explicit performance budget and a
  measured 4× CPU-throttle pass, or it is not shipped.

Above 3, a reduced-motion path is not optional and the deliverable is incomplete without it.

**`VISUAL_DENSITY`** → `components/data-density.md`, `foundations/spacing.md`,
`foundations/typography.md` (scale compression). Below 4, whitespace is the primary
compositional tool and the type scale opens up. Above 7, `components/tables.md` and
`components/data-density.md` govern; row height, not margin, becomes the rhythm.

### Recording them

The chosen triple goes in `memory/design.md` next to the signature vehicle, in this form:

```
dials: variance 4 · motion 3 · density 6
why:   B2B SaaS pricing page for procurement readers; industries/saas.md caps motion,
       the comparison table sets density, variance stays low so the table reads first.
```

Two surfaces in one product may not disagree on the dials without a recorded reason. A
landing page at `motion 7` next to an app shell at `motion 2` is not a range — it is two
products wearing one logo.

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
