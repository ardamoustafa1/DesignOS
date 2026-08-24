import runtimeCatalog from "../../../lib/system-runtime-catalog.json";

export async function GET() {
  return Response.json({
    systems: runtimeCatalog.systems.map(({ id, name, category, families }) => ({ id, name, category, families })),
    total: runtimeCatalog.systems.length,
  });
}
