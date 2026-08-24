export type StudioMotionScene = {
  id: string;
  character: string;
  recipes: [string, string, string, string];
  roles: [string, string, string, string];
  fallback: string;
};

// The compiler's prefers-reduced-motion branch consumes each complete static fallback.
const scenes: Record<string, StudioMotionScene> = {
  "editorial-ledger": { id: "kinetic-editorial-hero", character: "editorial", recipes: ["word-cascade", "line-mask-rise", "depth-parallax", "magnetic-intent"], roles: ["arrival", "scroll", "interaction", "transition"], fallback: "complete-static-editorial-state" },
  "split-proof": { id: "cinematic-product-stage", character: "cinematic", recipes: ["image-curtain", "product-orbit", "light-sweep", "scroll-progress"], roles: ["arrival", "interaction", "scroll", "transition"], fallback: "poster-and-css-depth" },
  "rail-story": { id: "inspectable-case-study", character: "technical", recipes: ["sticky-chapter", "image-curtain", "chapter-handoff", "cursor-spotlight"], roles: ["arrival", "scroll", "interaction", "transition"], fallback: "linear-labelled-document" },
};

export function studioMotionScene(family: string) {
  return scenes[family] ?? scenes["editorial-ledger"];
}

export function sceneAttributes(scene: StudioMotionScene, complete: boolean) {
  const recipes = complete ? scene.recipes : scene.recipes.slice(0, 3);
  return `data-motion-scene="${scene.id}" data-motion-character="${scene.character}" data-motion-recipes="${recipes.join(" ")}" data-motion-fallback="${scene.fallback}"`;
}
