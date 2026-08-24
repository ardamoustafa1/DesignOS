import { createProject, identityFor, listProjects, runsFor, usage } from "../../../lib/control-plane-store";
// proof-source: ../../../lib/certified-systems.json
import certifiedSystems from "../../../lib/certified-systems.json";

export async function GET(request: Request) {
  let identity;
  try { identity = identityFor(request); } catch { return Response.json({ error: "Sign in is required." }, { status: 401 }); }
  const projectId = new URL(request.url).searchParams.get("projectId") || undefined;
  return Response.json({ projects: await listProjects(identity.userId), runs: await runsFor(identity.userId, projectId), quota: await usage(identity.userId), identityMode: identity.mode });
}

export async function POST(request: Request) {
  let identity;
  try { identity = identityFor(request); } catch { return Response.json({ error: "Sign in is required." }, { status: 401 }); }
  let payload: { name?: unknown; brief?: unknown; systemId?: unknown };
  try { payload = await request.json(); } catch { return Response.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const brief = typeof payload.brief === "string" ? payload.brief.trim() : "";
  const systemId = typeof payload.systemId === "string" ? payload.systemId : "kiln";
  if (name.length < 2 || name.length > 80 || brief.length < 24 || brief.length > 640) return Response.json({ error: "Project name or brief is outside the allowed length." }, { status: 422 });
  if (!certifiedSystems.systems.some((system) => system.id === systemId)) return Response.json({ error: "This system has not passed the production certification ledger." }, { status: 422 });
  return Response.json({ project: await createProject(identity.userId, { name, brief, systemId }) }, { status: 201 });
}
