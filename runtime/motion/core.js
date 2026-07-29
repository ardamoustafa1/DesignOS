'use strict';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function rubberBand(overshoot, dimension, resistance = 0.55) {
  if (!Number.isFinite(overshoot) || !Number.isFinite(dimension) || dimension <= 0) throw new TypeError('rubberBand expects finite overshoot and a positive dimension');
  return (overshoot * dimension * resistance) / (dimension + resistance * Math.abs(overshoot));
}

function projectMomentum(velocity, deceleration = 0.998) {
  if (!Number.isFinite(velocity) || !(deceleration > 0 && deceleration < 1)) throw new TypeError('projectMomentum expects velocity and 0 < deceleration < 1');
  return (velocity / 1000) * deceleration / (1 - deceleration);
}

function chooseSnap(point, snapPoints) {
  if (!snapPoints?.length) throw new TypeError('chooseSnap requires at least one snap point');
  return snapPoints.reduce((best, candidate) =>
    Math.abs(candidate - point) < Math.abs(best - point) ? candidate : best);
}

function springPhysics({ duration = 0.5, bounce = 0, mass = 1 } = {}) {
  if (!(duration > 0) || bounce < 0 || bounce >= 1 || !(mass > 0)) throw new TypeError('Invalid spring parameters');
  const dampingRatio = 1 - bounce;
  const naturalFrequency = (2 * Math.PI) / duration;
  return {
    stiffness: naturalFrequency ** 2 * mass,
    damping: 2 * dampingRatio * naturalFrequency * mass,
    mass,
    dampingRatio,
    duration,
    bounce,
  };
}

function updateVelocity(previous, currentX, lastX, deltaMs, smoothing = 0.7) {
  const instant = (currentX - lastX) / Math.max(1, deltaMs);
  return smoothing * instant + (1 - smoothing) * previous;
}

function shouldDismiss({ distance, dimension, velocity, direction = Math.sign(distance), velocityThreshold = 0.11, distanceRatio = 0.5 }) {
  const flicked = Math.abs(velocity) > velocityThreshold && Math.sign(velocity) === direction;
  const dragged = Math.abs(distance) > dimension * distanceRatio;
  return { dismiss: flicked || dragged, flicked, dragged };
}

function flipDelta(first, last) {
  return {
    x: first.left - last.left,
    y: first.top - last.top,
    scaleX: last.width ? first.width / last.width : 1,
    scaleY: last.height ? first.height / last.height : 1,
  };
}

function scrollProgress(scrollTop, start, end) {
  return clamp((scrollTop - start) / Math.max(1, end - start), 0, 1);
}

function magneticOffset(pointer, rect, { strength = 0.35, radius = 120 } = {}) {
  const dx = pointer.x - (rect.left + rect.width / 2);
  const dy = pointer.y - (rect.top + rect.height / 2);
  const pull = Math.max(0, 1 - Math.hypot(dx, dy) / radius);
  return { x: dx * strength * pull, y: dy * strength * pull, pull };
}

function odometerFrames(from, to, steps = 20) {
  return Array.from({ length: Math.max(2, steps) }, (_, index) => {
    const t = index / (Math.max(2, steps) - 1);
    const eased = 1 - (1 - t) ** 3;
    return from + (to - from) * eased;
  });
}

function reducedMotionPolicy(reduced, full, fallback = {}) {
  return reduced ? { ...fallback, reduced: true } : { ...full, reduced: false };
}

function feedback({ haptic = 'selection', audio = null, reduced = false } = {}) {
  const vibration = reduced ? 0 : ({ selection: 10, success: [10, 30, 20], warning: [20, 40, 20] }[haptic] || 0);
  return { vibration, audio, requiresUserGesture: Boolean(audio), reduced };
}

module.exports = {
  clamp,
  rubberBand,
  projectMomentum,
  chooseSnap,
  springPhysics,
  updateVelocity,
  shouldDismiss,
  flipDelta,
  scrollProgress,
  magneticOffset,
  odometerFrames,
  reducedMotionPolicy,
  feedback,
};
