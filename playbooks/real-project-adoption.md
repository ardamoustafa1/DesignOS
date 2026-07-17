# Real Project Adoption

How to bring DesignOS into a real codebase without turning the first week into a
documentation migration.

## Path 1 — Existing App

Use this when the product already has screens, customers, and design debt.

1. Install DesignOS in a branch.
2. Run `node DesignOS/bin/designos.js doctor`.
3. Create `memory/brand.md` from the current product, not from aspiration.
4. Run `node DesignOS/bin/designos.js review src/ --no-fail` and triage findings.
5. Pick one high-traffic surface. Do not redesign the whole app first.
6. Ask the agent for a before/after plan and require a scorecard.
7. Record the decisions in `memory/design.md`.

Success metric: fewer repeated UI review comments on the next three PRs.

## Path 2 — Redesign

Use this when the product is being visually repositioned.

1. Capture the old system: colors, type, spacing, recurring components, failure modes.
2. Write the new brand constraints into `memory/brand.md`.
3. Load `workflows/redesign.md`, relevant `patterns/`, and the industry module.
4. Redesign one representative page first.
5. Run `designos review` on the result.
6. Convert accepted decisions into tokens and component rules.

Success metric: the second and third redesigned screens reuse decisions instead of
inventing a new visual language.

## Path 3 — New Landing Page

Use this for launches, waitlists, product pages, and campaigns.

1. Generate the brief with `designos brief`.
2. Route `patterns/landing-pages.md`, `components/hero.md`, `psychology/persuasion.md`,
   and the relevant industry module.
3. Demand real proof only: screenshots, workflow, metrics with source, or no metric.
4. Run `designos review` before shipping.
5. Add one screenshot or live link to `SHOWCASE.md` if public.

Success metric: one primary CTA, no fake proof, visible product proof above the fold.

## Path 4 — Dashboard / Product UI

Use this for SaaS interiors, admin panels, and operational tools.

1. Route `components/dashboard.md`, `components/tables.md`, `components/charts.md`,
   `components/navigation.md`, and the sector module.
2. Define the top three jobs the screen must support.
3. Require loading, empty, error, disabled, and success states.
4. Review density and scan path before color polish.
5. Run `designos review` against the changed files.

Success metric: a user can identify status, next action, and risk within 5 seconds.

## Path 5 — Mobile App

Use this for iOS, Android, React Native, Flutter, and mobile web.

1. Route `native/app-patterns.md`, `native/ios.md` or `native/android.md`, and
   `native/motion-gestures.md`.
2. Define platform-native navigation and gesture expectations.
3. Treat thumb reach, offline states, permission prompts, and interruption recovery as
   required UI.
4. Run the review loop with accessibility and reduced motion enabled.

Success metric: the first build feels platform-native, not like a desktop layout squeezed
into a phone.
