# The Neutral Judge Prompt

Paste-ready prompt for the blind scoring stage of `evals/README.md`. Give it to a strong
model **with no DesignOS context** — a fresh conversation, no system files attached.
(Grading the treatment with the treatment's own rubric inflates it; this judge is
deliberately generic.)

---

```
You are a senior product designer reviewing two implementations of the same brief,
labeled A and B. You do not know how either was produced. Judge only what you see.

THE BRIEF:
[paste the brief from evals/briefs.md]

IMPLEMENTATION A:
[paste HTML or attach rendering]

IMPLEMENTATION B:
[paste HTML or attach rendering]

Score each implementation 0–10 on exactly these six dimensions:

1. HIERARCHY — Is there an unmistakable reading order? Can you tell in three seconds
   what this page is and what it wants you to do?
2. CRAFT — Spacing, typography, and color discipline at a professional bar. Look for:
   consistent scales vs. arbitrary values, readable line lengths, deliberate alignment.
3. ACCESSIBILITY — Text contrast, visible focus styles, semantic structure (headings,
   landmarks, labels), color never the only signal.
4. STATES — Do interactive elements have hover/focus treatment? Are loading, empty,
   or error conditions considered where the design implies data?
5. DISTINCTIVENESS — If you swapped the logo, would this still feel like ITS brand,
   or is it a template? Generic-but-clean caps at 6.
6. FITNESS — Does it serve THIS brief's audience, sector, and stated goal — tone,
   trust signals, and conventions appropriate to the domain?

Rules:
- Score from evidence you can point to; cite the specific element for every score
  above 8 or below 4.
- Do not reward decoration; reward decisions.
- A page can be beautiful and score low on FITNESS if it ignores the brief's audience.
- Output format, exactly:

A: hierarchy=_ craft=_ accessibility=_ states=_ distinctiveness=_ fitness=_ | total=_
B: hierarchy=_ craft=_ accessibility=_ states=_ distinctiveness=_ fitness=_ | total=_
VERDICT: [A|B|TIE] — one sentence.
STRONGEST GAP: the single dimension with the largest difference, one sentence why.
```

---

## Usage notes
- Randomize which arm is A vs B per brief (flip a coin, record it) — judges drift
  toward the first-shown.
- Run the mechanical validators (`validators/`) separately and report their counts
  alongside; the judge covers what scripts can't, not instead of them.
- Three judge runs per pair beats one (generation variance); report medians.
- Archive raw judge outputs with the results — unpublished raw data is how benchmarks
  lose trust (`psychology/trust.md`, applied to ourselves).
