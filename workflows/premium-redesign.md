# Workflow: Premium Redesign

Use this when the ask is "make it beautiful," "make it top-tier," "more premium," or
"it works but does not feel world-class."

## 1. Preserve the working core

Before changing visuals, list:

- the primary audience
- the primary action
- the content that already explains the product well
- constraints that must not move
- proof that is real and proof that must be removed

Never make a redesign that is prettier but less truthful, slower, or harder to use.

## 2. Diagnose the level

Use `brain/taste-ladder.md`:

- 70: functional
- 80: clean
- 90: credible
- 95: premium
- 99: category-defining

State the current level and the exact blockers. Do not say "needs polish" without
naming the blocker.

## 3. Choose one signature vehicle

Pick one, rarely two:

- type voice
- product artifact
- layout gesture
- motion moment
- data visualization language
- copy voice
- image/illustration system

The signature must come from the product's material: data, workflow, audience, belief,
or constraint. Decoration is not a signature.

## 4. Add inspectable substance

Every premium screen needs something a skeptical user can inspect:

- real-feeling dashboard crop
- pricing table with caveats
- code/API sample
- workflow timeline
- report preview
- comparison matrix
- settings/state panel
- before/after artifact

If there is no artifact, the page is probably marketing theater.

## 5. Refactor composition

- One primary action per viewport.
- Vary section rhythm by meaning.
- Use cards only for repeated items or framed tools.
- Make whitespace encode relationships.
- Make typography do more work than color.
- Add mobile-specific hierarchy, not just stacked desktop.

## 6. Verify

Run:

```bash
node DesignOS/bin/designos.js elevate <target> --no-fail
node DesignOS/bin/designos.js review <target> --min 97
node DesignOS/bin/designos.js visual <target> --no-fail
node DesignOS/bin/designos.js report <target> --min 97 --no-fail
```

Deliver with:

- before/current level
- target level
- signature vehicle
- proof changes
- scorecard
- remaining caveats
