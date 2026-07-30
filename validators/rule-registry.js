'use strict';

/**
 * Single source of truth for deterministic DesignOS findings.
 *
 * `engines` names where a rule can be enforced:
 * static (source), dom (computed browser state), visual (screenshots/diffs).
 */
const RULES = [
  ['source-raw-color', 'tokens', 'P1', ['static'], 'Raw color found outside the token layer.', 'Move the value into a semantic token and consume the token.', 'foundations/design-tokens.md', 'drift-ok: <reason>', 'validators/fixtures/registry/raw-color.css'],
  ['source-clickable-noncontrol', 'accessibility', 'P1', ['static', 'dom'], 'Click behavior is attached to a non-interactive element.', 'Use a button for actions or an anchor for navigation.', 'foundations/accessibility.md', 'a11y-ok: <documented equivalent>', 'validators/fixtures/registry/clickable-div.html'],
  ['source-missing-focus', 'accessibility', 'P1', ['static', 'dom'], 'Interactive UI has no visible focus treatment.', 'Add a :focus-visible treatment with at least 3:1 adjacent contrast.', 'foundations/accessibility.md', 'a11y-ok: inherited focus system', 'validators/fixtures/registry/missing-focus.html'],
  ['source-fake-proof', 'proof', 'P1', ['static'], 'A hard trust or proof claim has no inspectable source.', 'Link the source, downgrade the claim, or label the artifact fictional.', 'PROOF_STANDARD.md', 'proof-source: <url-or-path>', 'validators/fixtures/registry/fake-proof.html'],
  ['source-image-dimensions', 'performance', 'P1', ['static', 'dom'], 'An image has no explicit width and height contract.', 'Declare intrinsic width/height or a verified aspect-ratio wrapper to prevent layout shift.', 'checklists/performance.md', 'runtime-ok: <verified intrinsic wrapper>', 'validators/fixtures/registry/missing-image-dimensions.html'],
  ['source-named-default', 'distinctiveness', 'P3', ['static'], 'A named default is used without a derivation.', 'Record the brand/audience/material derivation or choose a specific alternative.', 'brain/originality.md', 'slop-ok: <derivation>', 'validators/fixtures/registry/named-default.html'],
  ['motion-transition-all', 'motion', 'P1', ['static'], 'transition: all hides layout/paint work and accidental animation.', 'List only the properties that are intentionally animated.', 'motion/performance.md', 'motion-ok: <measured reason>', 'validators/fixtures/registry/transition-all.css'],
  ['motion-scale-zero', 'motion', 'P2', ['static'], 'scale(0) entrance collapses the element to an unnatural point.', 'Start near scale(.96) with opacity, or use an origin-honest reveal.', 'motion/principles.md', 'motion-ok: <product-truth>', 'validators/fixtures/registry/scale-zero.css'],
  ['motion-hover-without-pointer-query', 'motion', 'P2', ['static'], 'Spatial hover motion is not gated to a fine pointer.', 'Wrap it in @media (hover:hover) and (pointer:fine).', 'motion/micro-interactions.md', 'motion-ok: non-spatial fallback', 'validators/fixtures/registry/hover-touch.css'],
  ['motion-keyboard-latency', 'motion', 'P1', ['static', 'dom'], 'A frequent keyboard-triggered action has visible entrance latency.', 'Remove the entrance or limit it to an 80ms opacity response.', 'motion/decision-engine.md', 'motion-ok: <frequency evidence>', 'validators/fixtures/registry/keyboard-motion.html'],
  ['motion-unbounded-loop', 'performance', 'P1', ['static', 'dom'], 'An infinite animation has no offscreen and hidden-tab pause.', 'Pause with IntersectionObserver and visibilitychange.', 'motion/performance.md', 'motion-ok: <pause implementation>', 'validators/fixtures/registry/unbounded-loop.css'],
  ['motion-scroll-unthrottled', 'performance', 'P1', ['static'], 'Scroll work is not passive and rAF-throttled.', 'Prefer CSS scroll timelines/IntersectionObserver or use passive + rAF.', 'motion/performance.md', 'motion-ok: <measured handler>', 'validators/fixtures/registry/scroll-handler.js'],
  ['motion-drag-no-capture', 'interaction', 'P1', ['static'], 'Pointer drag has no pointer capture and can lose the gesture.', 'Call setPointerCapture on pointerdown and release it on completion.', 'motion/physics.md', 'motion-ok: library guarantee', 'validators/fixtures/registry/drag-no-capture.js'],
  ['motion-no-cancellation', 'interaction', 'P1', ['static'], 'Gesture or programmatic motion has no cancellation path.', 'Use AbortController, animation.cancel(), cleanup, or framework teardown.', 'motion/physics.md', 'motion-ok: <library teardown>', 'validators/fixtures/registry/no-cancel.js'],
  ['motion-no-visibility-pause', 'performance', 'P1', ['static'], 'Long-running JavaScript motion has no hidden-tab pause.', 'Pause on visibilitychange and resume only when visible.', 'motion/performance.md', 'motion-ok: <finite interaction>', 'validators/fixtures/registry/no-visibility.js'],
  ['motion-spring-no-reduction', 'accessibility', 'P1', ['static'], 'Spring motion has no reduced-motion alternative.', 'Use a critically damped or instant reduced-motion path.', 'motion/physics.md', 'motion-ok: <reduced path>', 'validators/fixtures/registry/spring-no-reduce.js'],
  ['motion-reduced-motion-missing', 'accessibility', 'P1', ['static', 'dom'], 'Motion has no prefers-reduced-motion behavior.', 'Preserve semantic feedback while removing spatial travel in a reduced-motion branch.', 'motion/principles.md', 'motion-ok: <non-spatial or user-controlled motion>', 'validators/fixtures/registry/no-reduced-motion.css'],
  ['motion-stagger-budget', 'performance', 'P2', ['static'], 'Stagger sequence exceeds the 500ms interaction budget.', 'Cap the delay steps and animate later items as a group.', 'motion/principles.md', 'motion-ok: <signature budget>', 'validators/fixtures/registry/stagger-budget.css'],
  ['motion-interaction-blocked', 'interaction', 'P1', ['static', 'dom'], 'Animation blocks user interaction while it plays.', 'Keep the target operable or shorten/remove the transition.', 'motion/decision-engine.md', 'motion-ok: <safety critical lock>', 'validators/fixtures/registry/blocked-animation.css'],
  ['motion-enter-exit-symmetry', 'motion', 'P2', ['static'], 'Enter and exit use the same duration even though exits should complete faster.', 'Use an exit duration around 60–80% of the entrance duration.', 'motion/principles.md', 'motion-ok: <symmetry reason>', 'validators/fixtures/registry/enter-exit-symmetry.css'],
  ['motion-transform-origin', 'motion', 'P2', ['static'], 'A scale-based anchored surface has no explicit transform origin.', 'Set transform-origin to the trigger/attachment edge.', 'motion/recipes.md', 'motion-ok: <center-origin reason>', 'validators/fixtures/registry/missing-transform-origin.css'],
  ['motion-uninterruptible-transition', 'interaction', 'P2', ['static'], 'A pointermove/touchmove drag never clears its CSS transition on grab.', "Set el.style.transition = 'none' on pointerdown before writing transform, so the surface tracks the pointer 1:1.", 'motion/physics.md', 'motion-ok: <transition already cleared elsewhere>', 'validators/fixtures/registry/uninterruptible-transition.js'],
  ['dom-horizontal-overflow', 'responsive', 'P1', ['dom', 'visual'], 'Rendered content exceeds the viewport width.', 'Fix the named overflowing element; never mask it with overflow-x:hidden.', 'foundations/layout.md', 'visual-ok: <two-dimensional region>', 'validators/fixtures/browser/horizontal-overflow.html'],
  ['dom-header-collision', 'responsive', 'P1', ['dom', 'visual'], 'Header content wraps, collides, or escapes its bar.', 'Introduce a compact navigation state before content no longer fits.', 'components/navigation.md', 'visual-ok: <intentional multi-row header>', 'validators/fixtures/browser/header-collision.html'],
  ['dom-tap-target', 'accessibility', 'P1', ['dom'], 'An actionable control is smaller than the DesignOS 44×44px target.', 'Increase the hit area without necessarily increasing the visible glyph.', 'foundations/accessibility.md', 'a11y-ok: <WCAG exception>', 'validators/fixtures/browser/tap-target.html'],
  ['dom-text-too-small', 'accessibility', 'P2', ['dom'], 'Rendered body/control text is below the 12px absolute floor.', 'Use the documented type scale and preserve zoom/reflow.', 'foundations/typography.md', 'a11y-ok: <decorative context>', 'validators/fixtures/browser/small-text.html'],
  ['dom-focus-obscured', 'accessibility', 'P1', ['dom', 'visual'], 'A focused element is obscured by sticky or fixed UI.', 'Add scroll-margin/scroll-padding or reposition the overlay.', 'foundations/accessibility.md', 'a11y-ok: <verified alternative>', 'validators/fixtures/browser/focus-obscured.html'],
  ['dom-clipped-text', 'responsive', 'P2', ['dom'], 'Text is clipped without an accessible full-value path.', 'Allow wrapping or expose the full value through a labelled disclosure.', 'components/data-density.md', 'visual-ok: <dense-data behavior>', 'validators/fixtures/browser/clipped-text.html'],
  ['dom-fixed-overlap', 'responsive', 'P1', ['dom', 'visual'], 'Fixed or sticky UI overlaps actionable content.', 'Reserve space and verify every breakpoint and zoom mode.', 'foundations/layout.md', 'visual-ok: <intentional overlay>', 'validators/fixtures/browser/fixed-overlap.html'],
  ['runtime-console-error', 'runtime', 'P1', ['dom'], 'The page emitted a runtime console or page error.', 'Resolve the originating exception before review.', 'workflows/final-gate.md', 'runtime-ok: <contained third-party issue>', 'validators/fixtures/browser/console-error.html'],
  ['runtime-broken-resource', 'performance', 'P1', ['dom'], 'An image, font, stylesheet, script, or fetch request failed.', 'Repair the URL or provide an explicit fallback.', 'checklists/performance.md', 'runtime-ok: <optional resource>', 'validators/fixtures/browser/broken-resource.html'],
  ['axe-violation', 'accessibility', 'P1', ['dom'], 'Axe reported a serious or critical accessibility violation.', 'Resolve every affected node and rerun the browser gate.', 'foundations/accessibility.md', 'a11y-ok: <verified false positive>', 'validators/fixtures/browser/axe-violation.html'],
  ['dom-text-spacing', 'accessibility', 'P1', ['dom', 'visual'], 'WCAG text-spacing overrides cause clipping, collision, or horizontal overflow.', 'Remove fixed text containers and allow content to reflow under 1.5 line-height, 0.12em letter spacing, and 0.16em word spacing.', 'foundations/accessibility.md', 'a11y-ok: <non-text content>', 'validators/fixtures/browser/text-spacing.html'],
  ['dom-forced-colors', 'accessibility', 'P1', ['dom', 'visual'], 'An actionable control becomes indiscernible in forced-colors mode.', 'Use system colors, retain a visible border/focus indicator, and avoid disabling forced-color adjustment without an equivalent.', 'foundations/accessibility.md', 'a11y-ok: <verified system-color equivalent>', 'validators/fixtures/browser/forced-colors.html'],
  ['dom-task-flow', 'interaction', 'P1', ['dom'], 'A declared browser task did not reach its asserted state.', 'Repair the interaction, state transition, or task contract and rerun the browser gate.', 'workflows/final-gate.md', 'runtime-ok: <obsolete task contract>', 'validators/fixtures/browser/task-flow.html'],
  ['dom-live-announcement', 'accessibility', 'P1', ['dom'], 'A declared dynamic update has no valid live-region or status announcement contract.', 'Expose the resulting message through role=status/alert or an appropriate aria-live region.', 'foundations/accessibility.md', 'a11y-ok: <non-verbal equivalent>', 'validators/fixtures/browser/live-announcement.html'],
  ['runtime-interaction-latency', 'performance', 'P1', ['dom'], 'A declared task interaction exceeds the 200ms response budget.', 'Remove main-thread blocking work, yield long tasks, and retest the interaction under the browser gate.', 'checklists/performance.md', 'runtime-ok: <measured unavoidable operation>', 'validators/fixtures/browser/interaction-latency.html'],
  ['lighthouse-budget', 'performance', 'P1', ['lighthouse'], 'Lighthouse category or lab metric misses the DesignOS release budget.', 'Resolve the failed category, LCP, CLS, or total-blocking-time audit before release.', 'checklists/performance.md', 'runtime-ok: <documented lab variance>', 'validators/fixtures/lighthouse/budget.html'],
  ['visual-regression', 'visual', 'P1', ['visual'], 'Screenshot change exceeds the declared regression budget.', 'Inspect the diff band and accept or correct the changed region.', 'workflows/final-gate.md', 'visual-ok: <approved redesign>', 'validators/fixtures/browser/regression.html'],
].map(([id, category, severity, engines, message, fix, module, exception, fixture]) =>
  Object.freeze({ id, category, severity, engines, message, fix, module, exception, fixture }));

const BY_ID = new Map(RULES.map(rule => [rule.id, rule]));

const PROVIDERS = Object.freeze([
  { id: 'references', command: 'check-refs.sh', runtime: 'bash', scope: 'repository', capabilities: ['internal-reference-integrity'], ruleIds: [] },
  { id: 'token-drift', command: 'check-drift.js', runtime: 'node', scope: 'target', capabilities: ['tokens', 'spacing', 'focus-source'], ruleIds: ['source-raw-color', 'source-missing-focus'] },
  { id: 'a11y-basics', command: 'check-a11y-basics.js', runtime: 'node', scope: 'target', capabilities: ['semantics', 'accessible-names'], ruleIds: ['source-clickable-noncontrol', 'source-missing-focus'] },
  { id: 'token-contrast', command: 'check-token-contrast.js', runtime: 'node', scope: 'target', capabilities: ['computed-token-contrast'], ruleIds: [] },
  { id: 'motion-source', command: 'check-motion.js', runtime: 'node', scope: 'target', capabilities: ['motion-budget', 'motion-performance'], ruleIds: RULES.filter(rule => rule.id.startsWith('motion-')).map(rule => rule.id) },
  { id: 'aesthetic-slop', command: 'check-aesthetic-slop.js', runtime: 'node', scope: 'target', capabilities: ['named-defaults', 'copy-tells'], ruleIds: ['source-named-default', 'source-fake-proof'] },
  { id: 'unified-source', command: 'check-registry.js', runtime: 'node', scope: 'target', capabilities: ['registry-static-contract'], ruleIds: RULES.filter(rule => rule.engines.includes('static')).map(rule => rule.id) },
]);

function getRule(id) {
  const rule = BY_ID.get(id);
  if (!rule) throw new Error(`Unknown DesignOS rule: ${id}`);
  return rule;
}

function finding(id, details = {}) {
  const rule = getRule(id);
  return {
    id,
    category: rule.category,
    severity: details.severity || rule.severity,
    message: details.message || rule.message,
    fix: rule.fix,
    module: rule.module,
    engine: details.engine || 'static',
    ...details,
  };
}

module.exports = { RULES, PROVIDERS, getRule, finding };
