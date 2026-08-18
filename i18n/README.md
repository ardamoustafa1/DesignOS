# i18n — Module Translations

`README.*.md` (repo root) covers marketing/onboarding copy in 7 languages. This directory
is different: it translates the actual **operating modules** an agent loads at runtime
(the kernel, `brain/`, `foundations/`, etc.) — content that shapes decisions, not just
content that explains the project to a human reader.

## Status

| Language | Files translated | Coverage |
|---|---|---|
| Turkish (`tr/`) | `CLAUDE.md` (the kernel) | 1 of 98 knowledge modules — see `npm run ledger:update`'s "Validated knowledge modules" count in `ROADMAP.md` |

This is a starting point, not parity. `ROADMAP.md`'s Planned section still lists broader
module translation coverage as open — do not read this directory's existence as "TR is
done."

## Why the kernel first

`CLAUDE.md` is the one file every agent reads before anything else (`AGENTS.md`,
`CLAUDE.md` boot sequence, §1). Translating it first makes the routing table, the Ceiling
Contract, and the Sixteen Questions legible to a Turkish-speaking operator deciding
*whether* to adopt DesignOS, even before any module content is translated.

## Rules for adding a translation

1. **The English source is binding.** A translated module is a reading aid, not an
   independent copy — if the two ever disagree, the English file under version control
   wins. Say so at the top of the translated file (see `i18n/tr/CLAUDE.md`'s header
   comment) so nobody promotes a stale translation to authoritative by accident.
2. **Never translate file paths, module names, code, CLI flags, or fenced examples.**
   Those are literal references another file or command depends on — translating
   `foundations/typography.md` to a Turkish phrase breaks every internal link.
3. **Mirror the source path**: `i18n/<lang>/<same-relative-path>`. `CLAUDE.md` → `i18n/tr/CLAUDE.md`,
   a future `foundations/typography.md` → `i18n/tr/foundations/typography.md`.
4. **Keep it out of the validators' module scan.** `validators/check-modules.js`'s
   `MODULE_DIRS` intentionally does not include `i18n/` — translated copies are reference
   material, not standalone modules subject to the anatomy checks the English originals
   get. Don't add `i18n/` to that list; a translation drifting one release behind its
   source is expected, not a validator failure.
5. **Update the table above** with the new file and an honest coverage note when you add one.
