# The Refactor Loop

The entropy-reversal cycle. Design systems decay by a thousand small exceptions: one
off-scale margin "just this once," a second gray that's almost the first, a fourth button
variant. This loop runs when the codebase/design has accumulated drift — after fast
feature pushes, before major releases, or when the Review Loop's drift detection fires.

```
MEASURE DRIFT → DECIDE CANON → CONSOLIDATE → VERIFY NOTHING BROKE → RECORD
```

## Stages

### 1. Measure drift (mechanical first)
- **Token audit:** grep for raw hex/rgb outside the token block; px values outside the
  spacing scale; font-sizes outside the type scale; durations/easings outside motion tokens;
  z-index anarchy. Count and list — the number is the drift metric.
- **Pattern census:** how many button variants, card paddings, shadow recipes, radius values
  actually exist vs. how many the system defines? (The census regularly finds 9 grays and
  5 "almost the same" paddings.)
- **Orphan sweep:** unused classes/styles/assets; duplicate components diverging quietly.

### 2. Decide canon
For each drift cluster: which variant is *correct*? Priority: project memory decision >
module rule > majority usage > best-crafted instance. The wrong-but-common variant is not
canon by popularity — but a memory-recorded decision beats a module default
(kernel conflict rule). Contentious calls go to `creative-director`; the decisions
(with reasons) are written to `memory/design.md` BEFORE consolidation starts.

### 3. Consolidate
- Replace strays with tokens; collapse near-duplicates to canon; extract repeated patterns
  into components/utilities; delete orphans.
- **Behavior-preserving by default:** refactor changes *implementation*, not appearance —
  except where the stray was itself a defect (off-scale spacing, contrast-failing gray),
  which is a fix, listed as such.
- Small batches, verifiable each: one drift cluster per pass (all spacing, then all color),
  not a big-bang rewrite that can't be reviewed.

### 4. Verify
- Visual: walk every affected surface at the four breakpoints, both themes — consolidation's
  classic failure is the one place that *needed* the exception (that place either gets a
  recorded override or a redesign, never a silent re-stray).
- Mechanical: re-run the stage-1 greps — drift metric should approach zero; tests/build pass;
  `checklists/performance.md` spot-check (refactors that inflate bundles aren't refactors).

### 5. Record
- `memory/design.md`: the canon decisions + any legitimate overrides discovered.
- `memory/notes.md`: drift metric before/after (the trend across refactor runs tells you if
  the system is being maintained or fighting its users — recurring drift in the same spot
  means the *system* is wrong there: fix the scale, not the users).
- `memory/bugs.md`: defects found but out of scope.

## Discipline
- Never mix refactor and feature work in one pass — reviewability dies.
- The loop's output is ALSO scored (`scoring/rubric.md` — UI Craft dimension especially):
  a refactor that leaves the surface worse than it found it fails.
- Frequency beats heroism: a small refactor loop after each project phase outperforms the
  annual great-rewrite that never ships.
