type DesignPlan = {
  productName: string;
  eyebrow: string;
  headline: string;
  summary: string;
  proof: [string, string, string];
  family: "editorial-ledger" | "split-proof" | "rail-story";
};

type ProviderConfig = {
  id: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  inputUsdPerMillion?: number;
  outputUsdPerMillion?: number;
};

type GatewayResult = {
  plan: Partial<DesignPlan>;
  providerId: string;
  providerLabel: string;
  usage: { inputTokens: number; outputTokens: number; estimatedCostMicros: number };
};

type Circuit = { failures: number; openedUntil: number };

declare global {
  var __designosProviderCircuits: Map<string, Circuit> | undefined;
}

const circuits = globalThis.__designosProviderCircuits ?? new Map<string, Circuit>();
globalThis.__designosProviderCircuits = circuits;

const forbiddenHost = /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/;

function validateProvider(raw: Partial<ProviderConfig>, index: number): ProviderConfig {
  if (!raw.id || !raw.baseUrl || !raw.apiKey || !raw.model) throw new Error(`Provider ${index + 1} is incomplete.`);
  const url = new URL(raw.baseUrl);
  if (url.protocol !== "https:" || forbiddenHost.test(url.hostname)) throw new Error(`Provider '${raw.id}' must use a public HTTPS origin.`);
  return {
    id: raw.id,
    baseUrl: url.toString(),
    apiKey: raw.apiKey,
    model: raw.model,
    inputUsdPerMillion: Number(raw.inputUsdPerMillion) || 0,
    outputUsdPerMillion: Number(raw.outputUsdPerMillion) || 0,
  };
}

export function providerConfigs(): ProviderConfig[] {
  const encoded = process.env.DESIGNOS_PROVIDERS_JSON?.trim();
  if (encoded) {
    const parsed = JSON.parse(encoded) as Partial<ProviderConfig>[];
    if (!Array.isArray(parsed)) throw new Error("DESIGNOS_PROVIDERS_JSON must be an array.");
    return parsed.map(validateProvider);
  }
  const legacy = {
    id: "primary",
    baseUrl: process.env.DESIGNOS_PROVIDER_BASE_URL,
    apiKey: process.env.DESIGNOS_PROVIDER_API_KEY,
    model: process.env.DESIGNOS_PROVIDER_MODEL,
  };
  return legacy.baseUrl && legacy.apiKey && legacy.model ? [validateProvider(legacy, 0)] : [];
}

function estimateCost(provider: ProviderConfig, inputTokens: number, outputTokens: number) {
  return Math.max(0, Math.round(
    inputTokens * (provider.inputUsdPerMillion || 0) + outputTokens * (provider.outputUsdPerMillion || 0),
  ));
}

function isAvailable(provider: ProviderConfig, now = Date.now()) {
  return (circuits.get(provider.id)?.openedUntil || 0) <= now;
}

function recordFailure(provider: ProviderConfig) {
  const current = circuits.get(provider.id) ?? { failures: 0, openedUntil: 0 };
  const failures = current.failures + 1;
  circuits.set(provider.id, { failures, openedUntil: failures >= 3 ? Date.now() + 30_000 : 0 });
}

function recordSuccess(provider: ProviderConfig) {
  circuits.set(provider.id, { failures: 0, openedUntil: 0 });
}

export function gatewayStatus() {
  return providerConfigs().map((provider) => ({
    id: provider.id,
    model: provider.model,
    state: isAvailable(provider) ? "available" : "circuit-open",
    failures: circuits.get(provider.id)?.failures || 0,
  }));
}

export async function requestDesignPlan(brief: string): Promise<GatewayResult | null> {
  const configured = providerConfigs();
  if (!configured.length) return null;
  const failures: string[] = [];
  for (const provider of configured) {
    if (!isAvailable(provider)) continue;
    try {
      const endpoint = new URL("./v1/chat/completions", `${provider.baseUrl.replace(/\/$/, "")}/`);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { authorization: `Bearer ${provider.apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.8,
          max_tokens: 900,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are the private DesignOS planning layer. Return only JSON with productName, eyebrow, headline, summary, proof (three short strings), and family (editorial-ledger, split-proof, or rail-story). Never return HTML, CSS, scripts, URLs, or markdown." },
            { role: "user", content: brief },
          ],
        }),
        signal: AbortSignal.timeout(18_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error("empty plan");
      const plan = JSON.parse(content) as Partial<DesignPlan>;
      const inputTokens = Math.max(0, payload.usage?.prompt_tokens || Math.ceil(brief.length / 4));
      const outputTokens = Math.max(0, payload.usage?.completion_tokens || Math.ceil(content.length / 4));
      recordSuccess(provider);
      return { plan, providerId: provider.id, providerLabel: `${provider.id} / ${provider.model}`, usage: { inputTokens, outputTokens, estimatedCostMicros: estimateCost(provider, inputTokens, outputTokens) } };
    } catch (error) {
      recordFailure(provider);
      failures.push(`${provider.id}: ${error instanceof Error ? error.message : "failed"}`);
    }
  }
  throw new Error(`Central model gateway exhausted configured providers (${failures.join("; ") || "all circuits open"}).`);
}
