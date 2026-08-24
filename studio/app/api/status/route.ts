import { gatewayStatus } from "../../../lib/central-gateway";
import { identityFor, usage } from "../../../lib/control-plane-store";
// proof-source: ../../../lib/certified-systems.json
import certifiedSystems from "../../../lib/certified-systems.json";

export async function GET(request: Request) {
  let identity;
  try { identity = identityFor(request); } catch { return Response.json({ authenticated: false, providers: gatewayStatus() }, { status: 401 }); }
  return Response.json({ authenticated: identity.mode === "authenticated", identityMode: identity.mode, quota: await usage(identity.userId), providers: gatewayStatus(), certifiedSystemCount: certifiedSystems.systems.length, clientProviderCredentialsAccepted: false });
}
