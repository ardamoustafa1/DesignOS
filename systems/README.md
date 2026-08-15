# Design Systems — Packages With a Contract

A DesignOS module tells an agent **how to think** about type, light, motion, and hierarchy.
It does not tell it what this product's amber is, what its radius scale is, or how many
solid accent fills a page is allowed. That gap is where output goes generic: reasoning
without a system produces a competent median, every time.

A **system package** closes it. It is a brand-grade contract an agent loads before it
builds, and — this is the part that matters — a contract that can be **checked afterwards**.

## Why checkable is the whole point

Injecting a design system into a prompt is well-understood and several tools do it. It has
one failure mode, and it is the same one every time: the first screen obeys the system and
the fourth has drifted. Nobody notices, because nothing was measuring. The system becomes
documentation of an intention.

DesignOS packages are the same contract, plus a gate:

```bash
node validators/check-system-conformance.js <target> --system kiln
```

That reads the page and reports every place it left the system: an off-palette colour, a
fourth typeface, a radius off the scale, an easing nobody declared, an inline shadow that
invents a fourth elevation level, one accent fill too many, a missing texture layer. It is
deterministic, it runs offline, and it takes no key.

**The palette is derived from `tokens.css` at check time**, never copied into the lint file.
A contract that keeps a second copy of the values will eventually disagree with them.

## Package shape

```
systems/<slug>/
├── manifest.json     discovery, dials, signature, declared paths
├── SYSTEM.md         the prose contract — what the system is and why
├── tokens.css        the compiled semantic tokens — the single source of truth
├── lint.json         the machine-readable half: required tokens, budgets, scales
└── example.html      the baked component fixture, clean under its own checker
```

Every file is required. `validators/test-system-conformance.js` asserts the shape, asserts
that `manifest.id` matches the folder, and asserts that **each system's own `example.html`
conforms to its own system** — a package that cannot pass its own contract is not a
package.

### `manifest.json`

Discovery metadata plus the three things a routing agent needs to *choose* a system rather
than take the first one: `suits`, `avoid`, and the three dials (`variance`, `motion`,
`density`). `signature` names the system's canonical signature moment and the product truth
it expresses. `ceiling` records how the system satisfies `CLAUDE.md` §4.5.

### `SYSTEM.md`

The prose contract, and the part a human argues with. It must open with the **light model**
(`foundations/materiality.md` §1) — a system that does not declare where its light comes
from cannot produce material surfaces — and must state its rules as budgets, not
adjectives. "Restrained accent" is not a rule. "At most three solid accent fills per
document, everything else uses the wash" is.

### `lint.json`

Policy only. Required tokens, forbidden values, the typeface roles, the radius scale, the
container widths, the easing set, the elevation tokens, the accent budget, the texture
requirement. No colours — those come from `tokens.css`.

### `example.html`

A component fixture, not a landing page: type scale, palette, the three elevation levels,
controls, the system's default list shape, tabular data, and its statement treatment, in
both themes. It is what a reviewer opens to see whether the system is worth using, and what
CI runs the conformance checker against.

## Using one

```bash
designos system list                    # what is packaged
designos system show kiln               # the full contract on stdout — pipe it anywhere
designos system tokens kiln             # just tokens.css
designos system check <target> --system kiln
```

`show` is the entire integration story. It prints to stdout, so any agent in any CLI
consumes it by pipe or paste. There is no daemon, no account, no key, and nothing leaves
the machine.

## Catalog

**152 packages.** One (`kiln`) is authored for DesignOS; 151 are imported from an upstream
catalog and upgraded on the way in (see below). Browse them with the CLI rather than a table
that would be 152 rows long:

```bash
designos system list                       # grouped by category
designos system list --category fintech
designos system list --grep "developer tools"
designos system list --verbose             # full entries
```

Every one of the 152 passes `check-system-conformance.js` against its own contract and
`check-craft-ceiling.js` with zero findings — `validators/test-system-conformance.js`
asserts both for every package in this directory on every `npm test`.

### Imported packages are upgraded, not copied

The upstream catalog shares one token schema across all its packages, and that schema tops
out at `--elev-flat` and `--elev-ring`: a two-value elevation with no light source, no
tinted shadow, no lit edge, no texture, and no arrival. Those are precisely the absences
`CLAUDE.md` §4.5 calls the difference between a page that is correct and a page that is
material. Importing verbatim would have imported the flatness.

So `scripts/import-design-systems.js` derives, **from each package's own palette**:

- a **light model** — direction and temperature, as tokens, not prose
- a **three-level elevation stack** whose shadow hue is that package's own ground, darkened
  and saturated; never black alpha
- a **lit-edge value** chosen by whether the ground reads light or dark, because dark
  grounds raise with light and light grounds raise with shadow
- **grain**, at the opacity that ground can carry
- **arrival timing**, with the easing character taken from the upstream `--ease-standard`

and then generates `lint.json` and `example.html` so the result is *checkable*, which the
upstream packages are not.

**Two of the seven ceiling requirements cannot be imported.** Section rhythm and optical
corrections are composition decisions, not values. A conforming token layer does not make a
page meet the ceiling on its own, and every imported `SYSTEM.md` says so in its supplement
table.

To re-run or update the import:

```bash
git clone --filter=blob:none --sparse --depth 1 https://github.com/nexu-io/open-design.git
cd open-design && git sparse-checkout set design-systems && cd -
node scripts/import-design-systems.js --from open-design/design-systems --all
```

### Licensing

DesignOS is MIT. **The imported packages are not** — their prose and token values stay under
the upstream project's licence, recorded with the commit and the full modification list in
[`NOTICE`](NOTICE). Several are named after and derived from real companies' public design
languages; those marks belong to their owners, and shipping a product that imitates another
company's identity is a decision for the shipper (`brain/originality.md` argues against it
on craft grounds regardless).

An authored package like `kiln` carries none of that — which is the argument for authoring
more of them.

## Choosing a system is a design decision

Loading a system does not excuse the choice. `manifest.json` carries an `avoid` list for a
reason: Kiln is wrong for a trading terminal, and answering "this brief wants a cooler,
denser system than anything packaged here — here is why" is a better outcome than dressing
the wrong product in the nearest available skin (`brain/decision-framework.md`,
`brain/originality.md`).

Conformance is necessary and not sufficient. A page can satisfy every rule in a system's
`lint.json` and still be badly composed; `scoring/rubric.md`, the Ceiling Contract
(`CLAUDE.md` §4.5), and `workflows/final-gate.md` all still apply.
