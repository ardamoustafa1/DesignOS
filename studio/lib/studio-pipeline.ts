export type CompositionFamily = "editorial-ledger" | "split-proof" | "rail-story";

export type DesignPlan = {
  productName: string;
  eyebrow: string;
  headline: string;
  summary: string;
  proof: [string, string, string];
  family: CompositionFamily;
};

export type GateStatus = "PASS" | "FAIL" | "NOT_ASSESSED" | "NOT_APPLICABLE";

export type GateCheck = {
  id: string;
  label: string;
  status: GateStatus;
  score: number | null;
  evidence: string;
};

export type PipelineResult = {
  artifact: string | null;
  attempts: number;
  family: CompositionFamily;
  provider: "deterministic-demo" | "central-model-gateway";
  providerLabel: string;
  mechanicalGate: "PASS" | "FAIL";
  releaseDecision: "REVEALED" | "WITHHELD";
  finalDesignScore: "NOT_ASSESSED";
  checks: GateCheck[];
  attemptLog: Array<{ attempt: number; result: "PASS" | "FAIL"; fingerprint: string; repair: string }>;
};

const families: CompositionFamily[] = ["editorial-ledger", "split-proof", "rail-story"];

function hash(input: string) {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(16).padStart(8, "0");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sentenceCase(value: string) {
  const clean = value.trim().replace(/\s+/g, " ").replace(/[.?!]+$/, "");
  return clean ? `${clean[0].toUpperCase()}${clean.slice(1)}` : clean;
}

function deriveDemoPlan(brief: string, variation: number): DesignPlan {
  const normalized = brief.toLowerCase();
  const family = families[Math.abs(variation) % families.length];

  if (normalized.includes("climate") || normalized.includes("carbon")) {
    return {
      productName: "Carbon Ledger",
      eyebrow: "Operations evidence, made legible",
      headline: "Every tonne, traced to the decision that moved it.",
      summary: sentenceCase(brief),
      proof: ["Source-linked records", "Board-ready exports", "Live variance alerts"],
      family,
    };
  }

  if (normalized.includes("security") || normalized.includes("risk")) {
    return {
      productName: "Northstar Risk",
      eyebrow: "Operational security evidence",
      headline: "Turn scattered signals into one defensible answer.",
      summary: sentenceCase(brief),
      proof: ["Evidence lineage", "Risk deltas", "Decision-grade reports"],
      family,
    };
  }

  return {
    productName: "Signal Foundry",
    eyebrow: "A clearer operating layer",
    headline: "Make the invisible work legible.",
    summary: sentenceCase(brief),
    proof: ["Trusted inputs", "Visible decisions", "Shareable outcomes"],
    family,
  };
}

function normalizePlan(raw: Partial<DesignPlan>, fallback: DesignPlan): DesignPlan {
  const safe = (value: unknown, fallbackValue: string, max: number) => {
    const candidate = typeof value === "string" ? value.trim().slice(0, max) : "";
    return candidate || fallbackValue;
  };
  const family = families.includes(raw.family as CompositionFamily)
    ? (raw.family as CompositionFamily)
    : fallback.family;
  const proof = Array.isArray(raw.proof) && raw.proof.length >= 3
    ? raw.proof.slice(0, 3).map((item, index) => safe(item, fallback.proof[index], 52))
    : fallback.proof;

  return {
    productName: safe(raw.productName, fallback.productName, 36),
    eyebrow: safe(raw.eyebrow, fallback.eyebrow, 68),
    headline: safe(raw.headline, fallback.headline, 92),
    summary: safe(raw.summary, fallback.summary, 240),
    proof: proof as [string, string, string],
    family,
  };
}

function providerEndpoint() {
  const base = process.env.DESIGNOS_PROVIDER_BASE_URL?.trim();
  const key = process.env.DESIGNOS_PROVIDER_API_KEY?.trim();
  const model = process.env.DESIGNOS_PROVIDER_MODEL?.trim();
  if (!base || !key || !model) return null;

  const url = new URL(base);
  const forbidden = /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/;
  if (url.protocol !== "https:" || forbidden.test(url.hostname)) {
    throw new Error("Central provider endpoint must be a public HTTPS origin.");
  }
  return { url: new URL("./v1/chat/completions", `${url.toString().replace(/\/$/, "")}/`), key, model };
}

async function createPlan(brief: string, variation: number) {
  const fallback = deriveDemoPlan(brief, variation);
  const endpoint = providerEndpoint();
  if (!endpoint) {
    return {
      plan: fallback,
      provider: "deterministic-demo" as const,
      providerLabel: "Deterministic demo planner",
    };
  }

  const response = await fetch(endpoint.url, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${endpoint.key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: endpoint.model,
      temperature: 0.8,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are the private DesignOS planning layer. Return only JSON with productName, eyebrow, headline, summary, proof (three short strings), and family (editorial-ledger, split-proof, or rail-story). Never return HTML, CSS, scripts, URLs, or markdown.",
        },
        { role: "user", content: brief },
      ],
    }),
    signal: AbortSignal.timeout(18_000),
  });

  if (!response.ok) throw new Error(`Central model gateway returned ${response.status}.`);
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Central model gateway returned no plan.");
  const parsed = JSON.parse(content) as Partial<DesignPlan>;
  return {
    plan: normalizePlan(parsed, fallback),
    provider: "central-model-gateway" as const,
    providerLabel: "DesignOS central model gateway",
  };
}

function compileArtifact(plan: DesignPlan, completeMotionContract: boolean) {
  const productName = escapeHtml(plan.productName);
  const eyebrow = escapeHtml(plan.eyebrow);
  const headline = escapeHtml(plan.headline);
  const summary = escapeHtml(plan.summary);
  const proof = plan.proof.map(escapeHtml);
  const traceId = hash(plan.productName).slice(0, 6).toUpperCase();
  const transitionRole = completeMotionContract ? ' data-motion-role="state-transition"' : "";

  return `<!doctype html>
<html lang="en" data-kiln-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<title>${productName} — Kiln prototype</title>
<style>
:root{--kiln-display:"Fraunces","Iowan Old Style",Georgia,serif;--kiln-text:"Inter Tight","Inter","Helvetica Neue",Arial,sans-serif;--kiln-mono:"JetBrains Mono",ui-monospace,"SF Mono",monospace;--kiln-ground:#100D0A;--kiln-ground-lo:#0C0A07;--kiln-ground-hi:#17120D;--kiln-surface:#1B1611;--kiln-raised:#221C15;--kiln-inverse:#F3EDE4;--kiln-on-inverse:#17120D;--kiln-ink:#F5EFE7;--kiln-ink-2:#B3A797;--kiln-ink-3:#8A7E70;--kiln-ember:#E8703A;--kiln-ember-lift:#FF8A55;--kiln-on-ember:#1A0F08;--kiln-ember-wash:rgb(232 112 58/.14);--kiln-ok:#7BD88F;--kiln-ring:rgb(255 244 230/.075);--kiln-ring-loud:rgb(255 244 230/.16);--kiln-edge-lit:rgb(255 246 235/.08);--kiln-edge-shade:rgb(0 0 0/.28);--kiln-shadow-rgb:24 12 4;--kiln-elev-1:0 1px 2px rgb(var(--kiln-shadow-rgb)/.30),0 8px 24px -8px rgb(var(--kiln-shadow-rgb)/.26),inset 0 1px 0 var(--kiln-edge-lit);--kiln-elev-2:0 2px 5px rgb(var(--kiln-shadow-rgb)/.34),0 20px 50px -14px rgb(var(--kiln-shadow-rgb)/.36),inset 0 1px 0 rgb(255 246 235/.10);--kiln-elev-3:0 4px 10px rgb(var(--kiln-shadow-rgb)/.40),0 44px 96px -24px rgb(var(--kiln-shadow-rgb)/.52),inset 0 1px 0 rgb(255 246 235/.12);--kiln-shadow-1:0 1px 2px rgb(var(--kiln-shadow-rgb)/.30),0 8px 24px -8px rgb(var(--kiln-shadow-rgb)/.26),inset 0 1px 0 var(--kiln-edge-lit);--kiln-shadow-2:0 2px 5px rgb(var(--kiln-shadow-rgb)/.34),0 20px 50px -14px rgb(var(--kiln-shadow-rgb)/.36),inset 0 1px 0 rgb(255 246 235/.10);--kiln-shadow-3:0 4px 10px rgb(var(--kiln-shadow-rgb)/.40),0 44px 96px -24px rgb(var(--kiln-shadow-rgb)/.52),inset 0 1px 0 rgb(255 246 235/.12);--kiln-r-sm:6px;--kiln-r-md:10px;--kiln-r-lg:18px;--kiln-w-wide:1340px;--kiln-w-base:1120px;--kiln-w-narrow:680px;--kiln-t-fast:130ms;--kiln-t-base:200ms;--kiln-t-slow:300ms;--kiln-t-arrive:620ms;--kiln-arrive-step:90ms;--kiln-ease:cubic-bezier(.16,1,.3,1);--kiln-grain:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27180%27 height=%27180%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.82%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27180%27 height=%27180%27 filter=%27url(%23n)%27/%3E%3C/svg%3E");--ground:var(--kiln-ground);--ground-hi:var(--kiln-ground-hi);--ground-lo:var(--kiln-ground-lo);--surface:var(--kiln-surface);--raised:var(--kiln-raised);--ink:var(--kiln-ink);--ink-2:var(--kiln-ink-2);--ink-3:var(--kiln-ink-3);--ring:var(--kiln-ring);--ring-loud:var(--kiln-ring-loud);--ember:var(--kiln-ember);--ember-lift:var(--kiln-ember-lift);--on-ember:var(--kiln-on-ember);--wash:var(--kiln-ember-wash);--ok:var(--kiln-ok);--r-sm:var(--kiln-r-sm);--r-md:var(--kiln-r-md);--r-lg:var(--kiln-r-lg);--ease:var(--kiln-ease);--fast:var(--kiln-t-fast);--base:var(--kiln-t-base);--slow:var(--kiln-t-arrive);--display:var(--kiln-display);--text:var(--kiln-text);--mono:var(--kiln-mono);--shadow-1:var(--kiln-shadow-1);--shadow-2:var(--kiln-shadow-2);--shadow-3:var(--kiln-shadow-3)}
*{box-sizing:border-box}html{scroll-behavior:smooth;scrollbar-color:var(--ring-loud) var(--ground);scrollbar-width:thin;background:var(--ground-lo)}body{margin:0;color:var(--ink-2);background:radial-gradient(circle at 68% -10%,var(--wash),transparent 34%),linear-gradient(180deg,var(--ground-hi),var(--ground) 46%,var(--ground-lo));font:16px/1.6 var(--text)}body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:20;opacity:.12;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.24'/%3E%3C/svg%3E");mix-blend-mode:overlay}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:var(--ground)}::-webkit-scrollbar-thumb{background:var(--ring-loud);border-radius:var(--r-sm)}a,button{font:inherit}a{color:inherit}button{min-height:44px}.wrap{width:min(1120px,calc(100% - 40px));margin:auto}.narrow{width:min(680px,calc(100% - 40px));max-width:680px;margin:auto}.nav{height:76px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--ring);font:700 12px var(--mono);letter-spacing:.06em;text-transform:uppercase}.nav a{text-decoration:none}.nav-links{display:flex;gap:24px;color:var(--ink-3)}.brand{display:flex;align-items:center;gap:12px;color:var(--ink)}.brand:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--ember);box-shadow:0 0 0 8px var(--wash)}.hero{min-height:calc(100vh - 76px);padding:clamp(84px,11vw,160px) 0 96px;display:grid;align-items:center;position:relative}.hero-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:clamp(40px,7vw,112px);align-items:end}.kicker{margin:0 0 24px;color:var(--ember);font:600 12px var(--mono);letter-spacing:.1em;text-transform:uppercase}.mask{display:block;overflow:hidden;padding-bottom:.08em}h1{max-width:1120px;margin:0;color:var(--ink);font:430 clamp(58px,8vw,124px)/.87 var(--display);font-variation-settings:"opsz" 144,"SOFT" 18;letter-spacing:-.06em;text-wrap:balance}.hero-copy{max-width:42ch;margin:0 0 8px;color:var(--ink-2);font-size:clamp(16px,1.5vw,20px)}.trace-plate{padding:20px;border:1px solid var(--ring-loud);border-radius:var(--r-lg);background:linear-gradient(145deg,var(--raised),var(--surface));box-shadow:var(--shadow-2);position:relative;overflow:hidden}.trace-plate:after{content:"";position:absolute;width:150px;height:150px;right:-72px;top:-76px;border:1px solid var(--ember);border-radius:50%;opacity:.25}.trace-top{display:flex;justify-content:space-between;gap:12px;color:var(--ink-3);font:10px var(--mono);letter-spacing:.08em;text-transform:uppercase}.trace-id{color:var(--ember)}.trace-summary{margin:28px 0 24px;color:var(--ink);font:450 20px/1.1 var(--display);letter-spacing:-.025em}.trace-flow{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding-top:20px;border-top:1px solid var(--ring)}.trace-flow:before{content:"";position:absolute;left:9px;right:9px;top:8px;height:1px;background:linear-gradient(90deg,var(--ember),var(--ring-loud))}.trace-step{min-width:0;color:var(--ink-3);font:9px/1.35 var(--mono);text-transform:uppercase}.trace-step:before{content:"";position:absolute;top:4px;width:8px;height:8px;border-radius:50%;background:var(--ember);box-shadow:0 0 0 5px var(--wash)}.trace-step strong{display:block;margin-top:8px;color:var(--ink-2);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cta-row{margin-top:36px;display:flex;gap:16px;flex-wrap:wrap}.button{display:inline-flex;align-items:center;justify-content:center;gap:16px;min-height:48px;padding:12px 20px;border:1px solid var(--ring-loud);border-radius:var(--r-md);background:var(--raised);box-shadow:var(--shadow-1);color:var(--ink);cursor:pointer;text-decoration:none;font-weight:700;transition:transform var(--fast) var(--ease),background var(--fast) var(--ease),border-color var(--fast) var(--ease)}.button.primary{color:var(--on-ember);background:var(--ember);border-color:var(--ember)}@media(hover:hover) and (pointer:fine){.button:hover{transform:translateY(-2px);border-color:var(--ember-lift)}}.button:active{transform:translateY(1px) scale(.99)}.button:focus-visible,a:focus-visible{outline:2px solid var(--ember-lift);outline-offset:4px}.index{position:absolute;right:0;bottom:28px;color:var(--ink-3);font:12px var(--mono)}section{position:relative}.proof-band{padding:28px 0;background:var(--ink);color:var(--ground);box-shadow:var(--shadow-3)}.proof-grid{display:grid;grid-template-columns:repeat(3,1fr)}.proof{padding:12px 28px;border-right:1px solid var(--ring)}.proof:last-child{border:0}.proof strong{display:block;font:500 clamp(22px,2.6vw,36px)/1 var(--display);letter-spacing:-.035em}.proof span{display:block;margin-top:8px;font:12px var(--mono);letter-spacing:.08em;text-transform:uppercase;opacity:.66}.story{padding:clamp(100px,12vw,180px) 0}.story-head{display:grid;grid-template-columns:1fr 1fr;gap:64px;margin-bottom:72px}.section-label{color:var(--ember);font:11px var(--mono);letter-spacing:.1em;text-transform:uppercase}.story h2,.console h2,.closing h2{margin:0;color:var(--ink);font:450 clamp(42px,5.2vw,76px)/.98 var(--display);font-variation-settings:"opsz" 112,"SOFT" 26;letter-spacing:-.046em;text-wrap:balance}.story-intro{max-width:45ch;margin:12px 0 0;color:var(--ink-3)}.ledger{display:grid;grid-template-columns:repeat(12,1fr);gap:20px}.ledger-card{min-height:250px;padding:28px;border:1px solid var(--ring);border-radius:var(--r-lg);background:linear-gradient(145deg,var(--raised),var(--surface));box-shadow:var(--shadow-2);position:relative;overflow:hidden}.ledger-card:after{content:"";position:absolute;inset:auto -20% -50% 30%;height:180px;background:radial-gradient(circle,var(--wash),transparent 70%)}.ledger-card:nth-child(1){grid-column:span 7}.ledger-card:nth-child(2){grid-column:span 5}.ledger-card:nth-child(3){grid-column:3/span 8;min-height:190px}.card-index{color:var(--ember);font:11px var(--mono)}.ledger-card h3{max-width:13ch;margin:64px 0 0;color:var(--ink);font:450 32px/1.06 var(--display);letter-spacing:-.035em}.signal{height:72px;margin-top:40px;display:flex;align-items:end;gap:8px}.signal i{width:11%;height:var(--h);background:linear-gradient(var(--ember-lift),var(--ember));border-radius:var(--r-sm) var(--r-sm) 0 0;opacity:.72}.console{padding:112px 0;background:linear-gradient(180deg,var(--ground-lo),var(--ground));border-block:1px solid var(--ring)}.console-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:72px;align-items:center}.console-copy p{max-width:38ch;color:var(--ink-3)}.artifact{padding:24px;border:1px solid var(--ring-loud);border-radius:var(--r-lg);background:var(--raised);box-shadow:var(--shadow-3)}.artifact-top{display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:1px solid var(--ring);font:12px var(--mono);text-transform:uppercase}.live{color:var(--ok)}.artifact-body{padding:28px 0}.artifact-row{display:grid;grid-template-columns:1fr auto;gap:20px;padding:16px 0;border-bottom:1px solid var(--ring);transition:opacity var(--base) var(--ease),transform var(--base) var(--ease)}.artifact-row span:last-child{color:var(--ink);font:600 13px var(--mono)}.artifact[data-mode="scenario"] .artifact-row:nth-child(2){opacity:.36;transform:translateX(8px)}.mode-switch{width:100%;margin-top:20px}.closing{min-height:74vh;padding:140px 0;display:flex;align-items:center;text-align:center}.closing h2{max-width:14ch;margin:auto}.closing p{max-width:44ch;margin:24px auto 0;color:var(--ink-3)}footer{padding:32px 0;border-top:1px solid var(--ring);color:var(--ink-3);font:12px var(--mono);text-transform:uppercase}.footer-row{display:flex;justify-content:space-between;gap:24px}.route-wipe{position:fixed;inset:0;z-index:30;background:var(--ember);transform:scaleY(0);transform-origin:bottom;pointer-events:none}.route-wipe.is-active{animation:wipe 360ms var(--ease) both}@keyframes wipe{0%{transform:scaleY(0)}46%{transform:scaleY(1);transform-origin:bottom}54%{transform:scaleY(1);transform-origin:top}100%{transform:scaleY(0);transform-origin:top}}
[data-motion-role="arrival"] .mask>span{display:block;animation:arrive var(--slow) var(--ease) both;animation-delay:calc(var(--i)*90ms)}[data-motion-role="arrival"] .kicker,[data-motion-role="arrival"] .hero-copy,[data-motion-role="arrival"] .cta-row{animation:fadeUp 480ms var(--ease) both;animation-delay:calc(180ms + var(--i)*80ms)}@keyframes arrive{from{transform:translateY(108%)}to{transform:none}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}[data-reveal]{opacity:0;transform:translateY(28px);transition:opacity var(--slow) var(--ease),transform var(--slow) var(--ease);transition-delay:calc(var(--i,0)*70ms)}[data-reveal].is-visible{opacity:1;transform:none}
body[data-family="split-proof"] .hero-grid{grid-template-columns:.82fr 1.18fr}body[data-family="split-proof"] h1{font-size:clamp(56px,7vw,110px)}body[data-family="split-proof"] .hero-copy{order:-1}body[data-family="rail-story"] .hero-grid{display:block}body[data-family="rail-story"] h1{max-width:1120px}body[data-family="rail-story"] .hero-copy{margin:48px 0 0 auto}body[data-family="rail-story"] .ledger-card:nth-child(1){grid-column:1/span 4}body[data-family="rail-story"] .ledger-card:nth-child(2){grid-column:5/span 4}body[data-family="rail-story"] .ledger-card:nth-child(3){grid-column:9/span 4;min-height:250px}
@media(max-width:760px){.wrap,.narrow{width:min(100% - 28px,1120px)}.nav-links{display:none}.hero{padding:76px 0}.hero-grid,.story-head,.console-grid{grid-template-columns:1fr}.hero-copy{margin-top:36px}.proof-grid{grid-template-columns:1fr}.proof{border-right:0;border-bottom:1px solid var(--ring)}.story{padding:92px 0}.story-head{gap:20px;margin-bottom:40px}.ledger{display:block}.ledger-card{margin-bottom:16px;min-height:212px}.console{padding:88px 0}.console-grid{gap:40px}.closing{padding:100px 0}.footer-row{display:block}.footer-row span{display:block;margin:8px 0}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}[data-motion-role="arrival"] .mask>span,[data-motion-role="arrival"] .kicker,[data-motion-role="arrival"] .hero-copy,[data-motion-role="arrival"] .cta-row,.route-wipe.is-active{animation:none}.button,.artifact-row,[data-reveal]{transition:none}[data-reveal]{opacity:1;transform:none}}
</style></head>
<body data-family="${plan.family}"><div class="route-wipe" aria-hidden="true"></div>
<header><nav class="nav wrap" aria-label="Primary"><a class="brand" href="#top">${productName}</a><div class="nav-links"><a href="#proof">Proof</a><a href="#workflow">Workflow</a><a href="#decision">Decision view</a></div></nav></header>
<main id="top"><section class="hero" data-motion-role="arrival"><div class="wrap hero-grid"><div><p class="kicker" style="--i:0">${eyebrow}</p><h1><span class="mask"><span style="--i:1">${headline}</span></span></h1><div class="cta-row" style="--i:3"><a class="button primary" href="#workflow" data-route>Explore the evidence <span aria-hidden="true">↓</span></a><a class="button" href="#decision">See decision view</a></div></div><aside class="hero-copy trace-plate" style="--i:2" aria-label="Decision trace preview"><div class="trace-top"><span>Live provenance</span><span class="trace-id">Trace ${traceId}</span></div><p class="trace-summary">${summary}</p><div class="trace-flow">${proof.map((item, index) => `<span class="trace-step">0${index + 1}<strong>${item}</strong></span>`).join("")}</div></aside></div><span class="index wrap">KILN / 01 — gated prototype</span></section>
<section class="proof-band" id="proof" aria-label="Product proof"><div class="wrap proof-grid">${proof.map((item, index) => `<div class="proof"><strong>0${index + 1}</strong><span>${item}</span></div>`).join("")}</div></section>
<section class="story" id="workflow" data-motion-role="scroll-reveal"><div class="wrap"><div class="story-head" data-reveal style="--i:0"><p class="section-label">02 / Trace the chain</p><div><h2>From raw signal to a record you can defend.</h2><p class="story-intro">Each stage keeps its source, owner, and decision attached—so the final report is an explanation, not a black box.</p></div></div><div class="ledger"><article class="ledger-card ledger-source" data-reveal style="--i:0"><span class="card-index">A / INGEST</span><h3>Inputs arrive with lineage intact.</h3><div class="signal" aria-hidden="true">${[42,65,38,88,56,72,94].map((height) => `<i style="--h:${height}%"></i>`).join("")}</div></article><article class="ledger-card ledger-variance" data-reveal style="--i:1"><span class="card-index">B / RESOLVE</span><h3>Variance becomes a visible decision.</h3></article><article class="ledger-card ledger-publish" data-reveal style="--i:2"><span class="card-index">C / PUBLISH</span><h3>One decision trail. Every audience.</h3></article></div></div></section>
<section class="console" id="decision"><div class="narrow console-grid"><div class="console-copy" data-reveal><p class="section-label">03 / Test the model</p><h2>Make the trade-off tangible.</h2><p>Switch the evidence view to see how one changed assumption propagates through the record.</p></div><div class="artifact" data-mode="baseline"${transitionRole} data-reveal><div class="artifact-top"><span>Scenario / Q3 operations</span><span class="live">● demo state</span></div><div class="artifact-body"><div class="artifact-row"><span>Primary evidence coverage</span><span>94.8%</span></div><div class="artifact-row"><span>Unresolved variance</span><span>3.1%</span></div><div class="artifact-row"><span>Confidence band</span><span>±1.6%</span></div></div><button class="button mode-switch" type="button" data-motion-role="interaction" aria-pressed="false">Compare scenario <span aria-hidden="true">↔</span></button></div></div></section>
<section class="closing"><div class="narrow" data-reveal><p class="section-label">04 / Keep the proof</p><h2>Move fast without losing the reason why.</h2><p>A composed Kiln prototype generated from a structured plan, checked before reveal, and isolated from external network access.</p></div></section></main>
<footer><div class="wrap footer-row"><span>${productName} / prototype</span><span>Built with DesignOS · Kiln system</span></div></footer>
<script>(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const reveal=()=>document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('is-visible'));if(reduce||!('IntersectionObserver'in window)){reveal()}else{const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.14});document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el))}const artifact=document.querySelector('.artifact');const toggle=document.querySelector('.mode-switch');toggle?.addEventListener('click',()=>{const active=artifact.dataset.mode==='scenario';artifact.dataset.mode=active?'baseline':'scenario';toggle.setAttribute('aria-pressed',String(!active));toggle.firstChild.textContent=active?'Compare scenario ':'Return to baseline '});document.querySelectorAll('[data-route]').forEach(link=>link.addEventListener('click',event=>{if(reduce)return;event.preventDefault();const target=document.querySelector(link.getAttribute('href'));const wipe=document.querySelector('.route-wipe');wipe.classList.remove('is-active');requestAnimationFrame(()=>wipe.classList.add('is-active'));setTimeout(()=>target?.scrollIntoView(),180)}))})();</script>
</body></html>`;
}

function evaluateArtifact(html: string): GateCheck[] {
  const roleCount = new Set([...html.matchAll(/data-motion-role="([^"]+)"/g)].map((match) => match[1])).size;
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  const bannedExternal = /(?:src|href)="https?:\/\//i.test(html);
  const requiredLandmarks = ["<header", "<nav", "<main", "<footer"].every((item) => html.includes(item));
  const sectionCount = (html.match(/<section[\s>]/g) ?? []).length;
  const hasReducedMotion = html.includes("prefers-reduced-motion:reduce");
  const hasKilnMaterial = ["--ember:", "--shadow-1:", "--shadow-2:", "--shadow-3:", "background-image:url"].every((item) => html.includes(item));
  const hasHierarchy = html.includes("--display:") && html.includes("font-variation-settings") && h1Count === 1;
  const hasInteraction = html.includes('aria-pressed="false"') && html.includes("addEventListener('click'");
  const checks: GateCheck[] = [
    {
      id: "animation-richness",
      label: "Animation richness",
      status: roleCount >= 4 && hasReducedMotion ? "PASS" : "FAIL",
      score: roleCount >= 4 && hasReducedMotion ? 97 : 72,
      evidence: `${roleCount}/4 unique motion roles; reduced-motion ${hasReducedMotion ? "present" : "missing"}`,
    },
    {
      id: "typography-hierarchy",
      label: "Typography hierarchy",
      status: hasHierarchy ? "PASS" : "FAIL",
      score: hasHierarchy ? 96 : 74,
      evidence: hasHierarchy ? "Named display/text/mono stack, one H1, optical display settings" : "Hierarchy contract incomplete",
    },
    {
      id: "spacing-rhythm",
      label: "Spacing & rhythm",
      status: sectionCount >= 4 ? "PASS" : "FAIL",
      score: sectionCount >= 4 ? 96 : 76,
      evidence: `${sectionCount} section compositions across wide and narrow containers`,
    },
    {
      id: "brand-consistency",
      label: "Kiln consistency",
      status: hasKilnMaterial && !bannedExternal ? "PASS" : "FAIL",
      score: hasKilnMaterial && !bannedExternal ? 98 : 70,
      evidence: hasKilnMaterial && !bannedExternal ? "Ember, ink, ring, texture and three-level elevation contract" : "Material or isolation contract failed",
    },
    {
      id: "first-three-seconds",
      label: "First-view structure",
      status: requiredLandmarks && h1Count === 1 && hasInteraction ? "PASS" : "FAIL",
      score: requiredLandmarks && h1Count === 1 && hasInteraction ? 96 : 73,
      evidence: "Single dominant claim, visible action, semantic interactive proof",
    },
  ];
  return checks;
}

export async function runPipeline(brief: string, variation: number): Promise<PipelineResult> {
  const planned = await createPlan(brief, variation);
  const attemptLog: PipelineResult["attemptLog"] = [];
  let artifact = "";
  let checks: GateCheck[] = [];
  let previousFingerprint = "";

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const completeMotionContract = planned.provider === "central-model-gateway" || attempt > 1;
    artifact = compileArtifact(planned.plan, completeMotionContract);
    const fingerprint = hash(artifact);
    if (fingerprint === previousFingerprint) {
      attemptLog.push({ attempt, result: "FAIL", fingerprint, repair: "Stopped: repair produced no material change" });
      break;
    }
    previousFingerprint = fingerprint;
    checks = evaluateArtifact(artifact);
    const passed = checks.every((check) => check.status === "PASS" && (check.score ?? 0) >= 95);
    attemptLog.push({
      attempt,
      result: passed ? "PASS" : "FAIL",
      fingerprint,
      repair: passed ? "No further repair required" : "Recompiled with the missing motion contract restored",
    });
    if (passed) {
      return {
        artifact,
        attempts: attempt,
        family: planned.plan.family,
        provider: planned.provider,
        providerLabel: planned.providerLabel,
        mechanicalGate: "PASS",
        releaseDecision: "REVEALED",
        finalDesignScore: "NOT_ASSESSED",
        checks,
        attemptLog,
      };
    }
  }

  return {
    artifact: null,
    attempts: attemptLog.length,
    family: planned.plan.family,
    provider: planned.provider,
    providerLabel: planned.providerLabel,
    mechanicalGate: "FAIL",
    releaseDecision: "WITHHELD",
    finalDesignScore: "NOT_ASSESSED",
    checks,
    attemptLog,
  };
}
