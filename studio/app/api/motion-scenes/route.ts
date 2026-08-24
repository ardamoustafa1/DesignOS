import { MOTION_SCENES } from "../../../lib/motion-director";

export async function GET() {
  const engines = [...new Set(MOTION_SCENES.map((scene) => scene.engine))];
  return Response.json({
    schema: "designos.motion-scenes/v1",
    total: MOTION_SCENES.length,
    engineCount: engines.length,
    engines,
    scenes: MOTION_SCENES.map((scene) => ({
      id: scene.id,
      character: scene.character,
      engine: scene.engine,
      recipes: scene.recipes,
      roles: scene.roles,
      signature: scene.signature,
      productTruth: scene.productTruth,
      fallback: scene.fallback,
    })),
  });
}
