import {
  motionDirectorCss,
  motionDirectorRuntime,
  motionStageCss,
  motionStageRuntime,
  sceneAttributes,
  sceneLayer,
  type MotionScene,
} from "./motion-director";
import { runVisualTournament, type TournamentCandidate } from "./visual-tournament";
import { requestDesignPlan } from "./central-gateway";
import { collectArtifactEvidence } from "./artifact-gate";
import generationKernel from "../../runtime/generation/kernel.js";
import runtimeCatalog from "./system-runtime-catalog.json";

const { executeGeneration } = generationKernel;

export type CompositionFamily =
  "editorial-ledger" | "split-proof" | "rail-story";

type RuntimeSystem = {
  id: string;
  name: string;
  category: string;
  families: CompositionFamily[];
  css: string;
  aliases: string;
};

const systems = runtimeCatalog.systems as RuntimeSystem[];

export type DesignPlan = {
  productName: string;
  eyebrow: string;
  headline: string;
  summary: string;
  proof: [string, string, string];
  material: [string, string, string];
  visualThesis: string;
  family: CompositionFamily;
  sceneId: string;
  motionEngine: MotionScene["engine"];
  motionSignature: string;
  tournamentPolicy: "weighted-six-candidate-v1";
  candidateTournament: TournamentCandidate[];
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
  systemId: string;
  systemName: string;
  family: CompositionFamily;
  provider: "deterministic-demo" | "central-model-gateway";
  providerLabel: string;
  providerId: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimatedCostMicros: number;
  };
  mechanicalGate: "PASS" | "FAIL";
  releaseDecision: "REVEALED" | "WITHHELD";
  finalDesignScore: "NOT_ASSESSED";
  evidenceMode: "isolated-worker" | "local-static" | "required-worker-missing";
  checks: GateCheck[];
  attemptLog: Array<{
    attempt: number;
    result: "PASS" | "FAIL";
    fingerprint: string;
    repair: string;
  }>;
};

const families: CompositionFamily[] = [
  "editorial-ledger",
  "split-proof",
  "rail-story",
];

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
  const clean = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.?!]+$/, "");
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
      proof: [
        "Source-linked records",
        "Board-ready exports",
        "Live variance alerts",
      ],
      material: [
        "Raw operating data",
        "Traceable variance model",
        "Decision-ready carbon report",
      ],
      visualThesis:
        "A living evidence trace turns scattered operating data into one defensible record.",
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
      material: [
        "Scattered security signals",
        "Attributed risk decisions",
        "One defensible answer",
      ],
      visualThesis:
        "Signals converge into a single inspectable decision surface.",
      family,
    };
  }

  return {
    productName: "Signal Foundry",
    eyebrow: "A clearer operating layer",
    headline: "Make the invisible work legible.",
    summary: sentenceCase(brief),
    proof: ["Trusted inputs", "Visible decisions", "Shareable outcomes"],
    material: [
      "Unstructured source material",
      "Visible decision logic",
      "A shareable final artifact",
    ],
    visualThesis:
      "The interface performs the move from ambiguity to a legible outcome.",
    family,
  };
}

function normalizePlan(
  raw: Partial<DesignPlan>,
  fallback: DesignPlan,
): DesignPlan {
  const safe = (value: unknown, fallbackValue: string, max: number) => {
    const candidate =
      typeof value === "string" ? value.trim().slice(0, max) : "";
    return candidate || fallbackValue;
  };
  const family = families.includes(raw.family as CompositionFamily)
    ? (raw.family as CompositionFamily)
    : fallback.family;
  const proof =
    Array.isArray(raw.proof) && raw.proof.length >= 3
      ? raw.proof
          .slice(0, 3)
          .map((item, index) => safe(item, fallback.proof[index], 52))
      : fallback.proof;
  const material =
    Array.isArray(raw.material) && raw.material.length >= 3
      ? raw.material
          .slice(0, 3)
          .map((item, index) => safe(item, fallback.material[index], 64))
      : fallback.material;

  return {
    productName: safe(raw.productName, fallback.productName, 36),
    eyebrow: safe(raw.eyebrow, fallback.eyebrow, 68),
    headline: safe(raw.headline, fallback.headline, 92),
    summary: safe(raw.summary, fallback.summary, 240),
    proof: proof as [string, string, string],
    material: material as [string, string, string],
    visualThesis: safe(raw.visualThesis, fallback.visualThesis, 180),
    family,
  };
}

async function createPlan(brief: string, variation: number) {
  const fallback = deriveDemoPlan(brief, variation);
  const response = await requestDesignPlan(brief);
  if (!response) {
    return {
      plan: fallback,
      provider: "deterministic-demo" as const,
      providerLabel: "Deterministic demo planner",
      providerId: "deterministic-demo",
      usage: { inputTokens: 0, outputTokens: 0, estimatedCostMicros: 0 },
    };
  }
  return {
    plan: normalizePlan(response.plan, fallback),
    provider: "central-model-gateway" as const,
    providerLabel: response.providerLabel,
    providerId: response.providerId,
    usage: response.usage,
  };
}

function applySystemTheme(artifact: string, system: RuntimeSystem) {
  const themedRoot = `${system.css.trim()}\n:root{${system.aliases}}`;
  const themed = artifact.replace(
    /<style>\n:root\{[^\n]*\}\n\*\{/,
    `<style>\n${themedRoot}\n*{`,
  );
  if (themed === artifact)
    throw new Error(
      "The trusted artifact theme boundary could not be replaced.",
    );
  const label = escapeHtml(system.name);
  return themed
    .replace(
      'data-kiln-theme="dark"',
      `data-design-system="${escapeHtml(system.id)}"`,
    )
    .replace(" — Kiln prototype", ` — ${label} prototype`)
    .replace(
      "KILN / 01 — gated prototype",
      `${label.toUpperCase()} / 01 — gated prototype`,
    )
    .replace("A composed Kiln prototype", `A composed ${label} prototype`)
    .replace(
      "Built with DesignOS · Kiln system",
      `Built with DesignOS · ${label} system`,
    );
}

function compileMotionStage(
  plan: DesignPlan,
  motionScene: MotionScene,
  traceId: string,
) {
  const productName = escapeHtml(plan.productName);
  const summary = escapeHtml(plan.summary);
  const headline = escapeHtml(plan.headline);
  const thesis = escapeHtml(plan.visualThesis);
  const material = plan.material.map(escapeHtml);
  const proof = plan.proof.map(escapeHtml);
  const engineLabel = escapeHtml(motionScene.engine.replaceAll("-", " "));
  return `<figure class="motion-stage" data-motion-stage data-stage-state="playing" data-engine="${escapeHtml(motionScene.engine)}" data-motion-duration="6400" data-motion-playback="single-pass-replayable" data-motion-poster="resolved-outcome" data-motion-media="procedural-self-contained" aria-label="${productName} cinematic proof film">
    <div class="stage-bar">
      <span class="stage-brand"><i aria-hidden="true"></i>${productName}</span>
      <span class="stage-controls"><span class="stage-engine">${engineLabel}</span><button class="stage-toggle" type="button" data-stage-toggle aria-pressed="false">Pause motion</button></span>
    </div>
    <div class="stage-viewport">
      ${sceneLayer(motionScene)}
      <article class="motion-shot shot-source" data-frame="01 / INPUT"><strong>${material[0]}</strong><p>${summary}</p></article>
      <article class="motion-shot shot-resolve" data-frame="02 / TRANSFORM"><strong>${material[1]}</strong><div class="shot-nodes">${proof.map((item) => `<span><i aria-hidden="true"></i>${item}</span>`).join("")}</div></article>
      <article class="motion-shot shot-output" data-frame="03 / OUTCOME"><strong>${material[2]}</strong><p>${headline}</p><span class="output-mark"><i aria-hidden="true"></i>${productName} · resolved artifact · ${traceId}</span></article>
      <p class="stage-thesis">${thesis}</p>
    </div>
    <div class="stage-timeline" aria-hidden="true"><span>Motion proof / 06.4s</span><span class="stage-track"><i></i></span><span class="stage-frame-count">01 → 03</span></div>
  </figure>`;
}

function compileArtifact(
  plan: DesignPlan,
  completeMotionContract: boolean,
  system: RuntimeSystem,
  motionScene: MotionScene,
) {
  const motionAttributes = sceneAttributes(motionScene, completeMotionContract);
  const productName = escapeHtml(plan.productName);
  const eyebrow = escapeHtml(plan.eyebrow);
  const headline = escapeHtml(plan.headline);
  const summary = escapeHtml(plan.summary);
  const proof = plan.proof.map(escapeHtml);
  const traceId = hash(plan.productName).slice(0, 6).toUpperCase();
  const motionStage = compileMotionStage(plan, motionScene, traceId);
  const transitionRole = completeMotionContract
    ? ' data-motion-role="state-transition"'
    : "";

  const artifact = `<!doctype html>
<html lang="en" data-kiln-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<title>${productName} — Kiln prototype</title>
<style>
:root{--kiln-display:"Fraunces","Iowan Old Style",Georgia,serif;--kiln-text:"Inter Tight","Inter","Helvetica Neue",Arial,sans-serif;--kiln-mono:"JetBrains Mono",ui-monospace,"SF Mono",monospace;--kiln-ground:#100D0A;--kiln-ground-lo:#0C0A07;--kiln-ground-hi:#17120D;--kiln-surface:#1B1611;--kiln-raised:#221C15;--kiln-inverse:#F3EDE4;--kiln-on-inverse:#17120D;--kiln-ink:#F5EFE7;--kiln-ink-2:#B3A797;--kiln-ink-3:#8A7E70;--kiln-ember:#E8703A;--kiln-ember-lift:#FF8A55;--kiln-on-ember:#1A0F08;--kiln-ember-wash:rgb(232 112 58/.14);--kiln-ok:#7BD88F;--kiln-ring:rgb(255 244 230/.075);--kiln-ring-loud:rgb(255 244 230/.16);--kiln-edge-lit:rgb(255 246 235/.08);--kiln-edge-shade:rgb(0 0 0/.28);--kiln-shadow-rgb:24 12 4;--kiln-elev-1:0 1px 2px rgb(var(--kiln-shadow-rgb)/.30),0 8px 24px -8px rgb(var(--kiln-shadow-rgb)/.26),inset 0 1px 0 var(--kiln-edge-lit);--kiln-elev-2:0 2px 5px rgb(var(--kiln-shadow-rgb)/.34),0 20px 50px -14px rgb(var(--kiln-shadow-rgb)/.36),inset 0 1px 0 rgb(255 246 235/.10);--kiln-elev-3:0 4px 10px rgb(var(--kiln-shadow-rgb)/.40),0 44px 96px -24px rgb(var(--kiln-shadow-rgb)/.52),inset 0 1px 0 rgb(255 246 235/.12);--kiln-shadow-1:0 1px 2px rgb(var(--kiln-shadow-rgb)/.30),0 8px 24px -8px rgb(var(--kiln-shadow-rgb)/.26),inset 0 1px 0 var(--kiln-edge-lit);--kiln-shadow-2:0 2px 5px rgb(var(--kiln-shadow-rgb)/.34),0 20px 50px -14px rgb(var(--kiln-shadow-rgb)/.36),inset 0 1px 0 rgb(255 246 235/.10);--kiln-shadow-3:0 4px 10px rgb(var(--kiln-shadow-rgb)/.40),0 44px 96px -24px rgb(var(--kiln-shadow-rgb)/.52),inset 0 1px 0 rgb(255 246 235/.12);--kiln-r-sm:6px;--kiln-r-md:10px;--kiln-r-lg:18px;--kiln-w-wide:1340px;--kiln-w-base:1120px;--kiln-w-narrow:680px;--kiln-t-fast:130ms;--kiln-t-base:200ms;--kiln-t-slow:300ms;--kiln-t-arrive:620ms;--kiln-arrive-step:90ms;--kiln-ease:cubic-bezier(.16,1,.3,1);--kiln-grain:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27180%27 height=%27180%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.82%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27180%27 height=%27180%27 filter=%27url(%23n)%27/%3E%3C/svg%3E");--ground:var(--kiln-ground);--ground-hi:var(--kiln-ground-hi);--ground-lo:var(--kiln-ground-lo);--surface:var(--kiln-surface);--raised:var(--kiln-raised);--ink:var(--kiln-ink);--ink-2:var(--kiln-ink-2);--ink-3:var(--kiln-ink-3);--ring:var(--kiln-ring);--ring-loud:var(--kiln-ring-loud);--ember:var(--kiln-ember);--ember-lift:var(--kiln-ember-lift);--on-ember:var(--kiln-on-ember);--wash:var(--kiln-ember-wash);--ok:var(--kiln-ok);--r-sm:var(--kiln-r-sm);--r-md:var(--kiln-r-md);--r-lg:var(--kiln-r-lg);--ease:var(--kiln-ease);--fast:var(--kiln-t-fast);--base:var(--kiln-t-base);--slow:var(--kiln-t-arrive);--display:var(--kiln-display);--text:var(--kiln-text);--mono:var(--kiln-mono);--shadow-1:var(--kiln-shadow-1);--shadow-2:var(--kiln-shadow-2);--shadow-3:var(--kiln-shadow-3)}
*{box-sizing:border-box}html{scroll-behavior:smooth;scrollbar-color:var(--ring-loud) var(--ground);scrollbar-width:thin;background:var(--ground-lo)}body{margin:0;color:var(--ink-2);background:radial-gradient(circle at 68% -10%,var(--wash),transparent 34%),linear-gradient(180deg,var(--ground-hi),var(--ground) 46%,var(--ground-lo));font:16px/1.6 var(--text)}body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:20;opacity:.12;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.24'/%3E%3C/svg%3E");mix-blend-mode:overlay}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:var(--ground)}::-webkit-scrollbar-thumb{background:var(--ring-loud);border-radius:var(--r-sm)}a,button{font:inherit}a{color:inherit}button{min-height:44px}.wrap{width:min(1120px,calc(100% - 40px));margin:auto}.narrow{width:min(680px,calc(100% - 40px));max-width:680px;margin:auto}.nav{height:76px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--ring);font:700 12px var(--mono);letter-spacing:.06em;text-transform:uppercase}.nav a{text-decoration:none}.nav-links{display:flex;gap:24px;color:var(--ink-3)}.brand{display:flex;align-items:center;gap:12px;color:var(--ink)}.brand:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--ember);box-shadow:0 0 0 8px var(--wash)}.hero{min-height:calc(100vh - 76px);padding:clamp(84px,11vw,160px) 0 96px;display:grid;align-items:center;position:relative}.hero-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:clamp(40px,7vw,112px);align-items:end}.kicker{margin:0 0 24px;color:var(--ember);font:600 12px var(--mono);letter-spacing:.1em;text-transform:uppercase}.mask{display:block;overflow:hidden;padding-bottom:.08em}h1{max-width:1120px;margin:0;color:var(--ink);font:430 clamp(58px,8vw,124px)/.87 var(--display);font-variation-settings:"opsz" 144,"SOFT" 18;letter-spacing:-.06em;text-wrap:balance}.hero-copy{max-width:42ch;margin:0 0 8px;color:var(--ink-2);font-size:clamp(16px,1.5vw,20px)}.trace-plate{padding:20px;border:1px solid var(--ring-loud);border-radius:var(--r-lg);background:linear-gradient(145deg,var(--raised),var(--surface));box-shadow:var(--shadow-2);position:relative;overflow:hidden}.trace-plate:after{content:"";position:absolute;width:150px;height:150px;right:-72px;top:-76px;border:1px solid var(--ember);border-radius:50%;opacity:.25}.trace-top{display:flex;justify-content:space-between;gap:12px;color:var(--ink-3);font:10px var(--mono);letter-spacing:.08em;text-transform:uppercase}.trace-id{color:var(--ember)}.trace-summary{margin:28px 0 24px;color:var(--ink);font:450 20px/1.1 var(--display);letter-spacing:-.025em}.trace-flow{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding-top:20px;border-top:1px solid var(--ring)}.trace-flow:before{content:"";position:absolute;left:9px;right:9px;top:8px;height:1px;background:linear-gradient(90deg,var(--ember),var(--ring-loud))}.trace-step{min-width:0;color:var(--ink-3);font:9px/1.35 var(--mono);text-transform:uppercase}.trace-step:before{content:"";position:absolute;top:4px;width:8px;height:8px;border-radius:50%;background:var(--ember);box-shadow:0 0 0 5px var(--wash)}.trace-step strong{display:block;margin-top:8px;color:var(--ink-2);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cta-row{margin-top:36px;display:flex;gap:16px;flex-wrap:wrap}.button{display:inline-flex;align-items:center;justify-content:center;gap:16px;min-height:48px;padding:12px 20px;border:1px solid var(--ring-loud);border-radius:var(--r-md);background:var(--raised);box-shadow:var(--shadow-1);color:var(--ink);cursor:pointer;text-decoration:none;font-weight:700;transition:transform var(--fast) var(--ease),background var(--fast) var(--ease),border-color var(--fast) var(--ease)}.button.primary{color:var(--on-ember);background:var(--ember);border-color:var(--ember)}@media(hover:hover) and (pointer:fine){.button:hover{transform:translateY(-2px);border-color:var(--ember-lift)}}.button:active{transform:translateY(1px) scale(.99)}.button:focus-visible,a:focus-visible{outline:2px solid var(--ember-lift);outline-offset:4px}.index{position:absolute;right:0;bottom:28px;color:var(--ink-3);font:12px var(--mono)}section{position:relative}.proof-band{padding:28px 0;background:var(--ink);color:var(--ground);box-shadow:var(--shadow-3)}.proof-grid{display:grid;grid-template-columns:repeat(3,1fr)}.proof{padding:12px 28px;border-right:1px solid var(--ring)}.proof:last-child{border:0}.proof strong{display:block;font:500 clamp(22px,2.6vw,36px)/1 var(--display);letter-spacing:-.035em}.proof span{display:block;margin-top:8px;font:12px var(--mono);letter-spacing:.08em;text-transform:uppercase;opacity:.66}.story{padding:clamp(100px,12vw,180px) 0}.story-head{display:grid;grid-template-columns:1fr 1fr;gap:64px;margin-bottom:72px}.section-label{color:var(--ember);font:11px var(--mono);letter-spacing:.1em;text-transform:uppercase}.story h2,.console h2,.closing h2{margin:0;color:var(--ink);font:450 clamp(42px,5.2vw,76px)/.98 var(--display);font-variation-settings:"opsz" 112,"SOFT" 26;letter-spacing:-.046em;text-wrap:balance}.story-intro{max-width:45ch;margin:12px 0 0;color:var(--ink-3)}.ledger{display:grid;grid-template-columns:repeat(12,1fr);gap:20px}.ledger-card{min-height:250px;padding:28px;border:1px solid var(--ring);border-radius:var(--r-lg);background:linear-gradient(145deg,var(--raised),var(--surface));box-shadow:var(--shadow-2);position:relative;overflow:hidden}.ledger-card:after{content:"";position:absolute;inset:auto -20% -50% 30%;height:180px;background:radial-gradient(circle,var(--wash),transparent 70%)}.ledger-card:nth-child(1){grid-column:span 7}.ledger-card:nth-child(2){grid-column:span 5}.ledger-card:nth-child(3){grid-column:3/span 8;min-height:190px}.card-index{color:var(--ember);font:11px var(--mono)}.ledger-card h3{max-width:13ch;margin:64px 0 0;color:var(--ink);font:450 32px/1.06 var(--display);letter-spacing:-.035em}.signal{height:72px;margin-top:40px;display:flex;align-items:end;gap:8px}.signal i{width:11%;height:var(--h);background:linear-gradient(var(--ember-lift),var(--ember));border-radius:var(--r-sm) var(--r-sm) 0 0;opacity:.72}.console{padding:112px 0;background:linear-gradient(180deg,var(--ground-lo),var(--ground));border-block:1px solid var(--ring)}.console-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:72px;align-items:center}.console-copy p{max-width:38ch;color:var(--ink-3)}.artifact{padding:24px;border:1px solid var(--ring-loud);border-radius:var(--r-lg);background:var(--raised);box-shadow:var(--shadow-3)}.artifact-top{display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:1px solid var(--ring);font:12px var(--mono);text-transform:uppercase}.live{color:var(--ok)}.artifact-body{padding:28px 0}.artifact-row{display:grid;grid-template-columns:1fr auto;gap:20px;padding:16px 0;border-bottom:1px solid var(--ring);transition:opacity var(--base) var(--ease),transform var(--base) var(--ease)}.artifact-row span:last-child{color:var(--ink);font:600 13px var(--mono)}.artifact[data-mode="scenario"] .artifact-row:nth-child(2){opacity:.36;transform:translateX(8px)}.mode-switch{width:100%;margin-top:20px}.closing{min-height:74vh;padding:140px 0;display:flex;align-items:center;text-align:center}.closing h2{max-width:14ch;margin:auto}.closing p{max-width:44ch;margin:24px auto 0;color:var(--ink-3)}footer{padding:32px 0;border-top:1px solid var(--ring);color:var(--ink-3);font:12px var(--mono);text-transform:uppercase}.footer-row{display:flex;justify-content:space-between;gap:24px}.route-wipe{position:fixed;inset:0;z-index:30;background:var(--ember);transform:scaleY(0);transform-origin:bottom;pointer-events:none}.route-wipe.is-active{animation:wipe 360ms var(--ease) both}@keyframes wipe{0%{transform:scaleY(0)}46%{transform:scaleY(1);transform-origin:bottom}54%{transform:scaleY(1);transform-origin:top}100%{transform:scaleY(0);transform-origin:top}}
[data-motion-role="arrival"] .mask>span{display:block;animation:arrive var(--slow) var(--ease) both;animation-delay:calc(var(--i)*90ms)}[data-motion-role="arrival"] .kicker,[data-motion-role="arrival"] .hero-copy,[data-motion-role="arrival"] .cta-row{animation:fadeUp 480ms var(--ease) both;animation-delay:calc(180ms + var(--i)*80ms)}@keyframes arrive{from{transform:translateY(108%)}to{transform:none}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}[data-reveal]{opacity:0;transform:translateY(28px);transition:opacity var(--slow) var(--ease),transform var(--slow) var(--ease);transition-delay:calc(var(--i,0)*70ms)}[data-reveal].is-visible{opacity:1;transform:none}
body[data-family="split-proof"] .hero-grid{grid-template-columns:.82fr 1.18fr}body[data-family="split-proof"] h1{font-size:clamp(56px,7vw,110px)}body[data-family="split-proof"] .hero-copy{order:-1}body[data-family="rail-story"] .hero-grid{display:block}body[data-family="rail-story"] h1{max-width:1120px}body[data-family="rail-story"] .hero-copy{margin:48px 0 0 auto}body[data-family="rail-story"] .ledger-card:nth-child(1){grid-column:1/span 4}body[data-family="rail-story"] .ledger-card:nth-child(2){grid-column:5/span 4}body[data-family="rail-story"] .ledger-card:nth-child(3){grid-column:9/span 4;min-height:250px}
.scene-canvas{position:absolute;inset:4% 0 auto auto;width:min(48vw,680px);height:72%;pointer-events:none;opacity:.62;mix-blend-mode:screen;mask-image:linear-gradient(90deg,transparent,var(--ground-lo) 24%)}.scene-progress{position:fixed;inset:0 auto auto 0;z-index:40;width:100%;height:2px;transform:scaleX(var(--scene-progress,0));transform-origin:left;background:var(--ember);pointer-events:none}.scene-cursor{position:fixed;z-index:19;width:240px;height:240px;border-radius:50%;pointer-events:none;transform:translate3d(calc(var(--scene-x,-300px) - 50%),calc(var(--scene-y,-300px) - 50%),0);background:radial-gradient(circle,var(--wash),transparent 68%);mix-blend-mode:screen;opacity:.72}.hero-grid,.ledger-card{transform:perspective(1200px) rotateX(var(--scene-rx,0deg)) rotateY(var(--scene-ry,0deg));transition:transform var(--fast) var(--ease)}
${motionDirectorCss()}
${motionStageCss()}
.hero{padding:clamp(64px,7vw,112px) 0 80px}.hero-grid{grid-template-columns:minmax(0,.88fr) minmax(480px,1.12fr);gap:clamp(40px,5vw,80px);align-items:center}.hero-statement{position:relative;z-index:3;min-width:0}.hero-statement h1{max-width:720px;font-size:clamp(52px,6.3vw,96px);line-height:.9}.hero-summary{max-width:44ch;margin:28px 0 0;color:var(--ink-2);font-size:clamp(16px,1.35vw,19px);line-height:1.58}.mask{overflow:clip;padding-bottom:.12em}[data-motion-role="arrival"] .hero-summary{animation:fadeUp 480ms var(--ease) both;animation-delay:calc(180ms + var(--i)*80ms)}body[data-family="editorial-ledger"] .motion-stage{margin-top:56px}body[data-family="split-proof"] .hero-grid{grid-template-columns:minmax(0,.72fr) minmax(520px,1.28fr)}body[data-family="split-proof"] .hero-statement h1{font-size:clamp(48px,5.6vw,84px)}body[data-family="rail-story"] .hero-grid{display:block}body[data-family="rail-story"] .hero-statement{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:48px;align-items:end}body[data-family="rail-story"] .hero-statement h1{max-width:920px}body[data-family="rail-story"] .hero-summary{margin:0 0 8px}body[data-family="rail-story"] .hero-statement .cta-row{grid-column:2;margin-top:24px}body[data-family="rail-story"] .motion-stage{width:100%;margin-top:56px}
@media(max-width:760px){.wrap,.narrow{width:min(100% - 28px,1120px)}.nav-links{display:none}.hero{padding:56px 0}.hero-grid,body[data-family] .hero-grid,body[data-family="rail-story"] .hero-statement,.story-head,.console-grid{display:grid;grid-template-columns:1fr}.hero-summary{margin-top:20px}.proof-grid{grid-template-columns:1fr}.proof{border-right:0;border-bottom:1px solid var(--ring)}.story{padding:92px 0}.story-head{gap:20px;margin-bottom:40px}.ledger{display:block}.ledger-card{margin-bottom:16px;min-height:212px}.console{padding:88px 0}.console-grid{gap:40px}.closing{padding:100px 0}.footer-row{display:block}.footer-row span{display:block;margin:8px 0}body[data-family] .motion-stage{margin-top:40px}body[data-family="rail-story"] .hero-statement .cta-row{grid-column:auto}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}[data-motion-role="arrival"] .mask>span,[data-motion-role="arrival"] .kicker,[data-motion-role="arrival"] .hero-summary,[data-motion-role="arrival"] .cta-row,.route-wipe.is-active{animation:none}.button,.artifact-row,[data-reveal],.hero-grid,.ledger-card{transition:none;transform:none}[data-reveal]{opacity:1;transform:none}.scene-canvas,.scene-cursor,.scene-progress{display:none}}
.hero{overflow:clip}.hero .scene-engine{right:0;max-width:100%;overflow:hidden}@media(max-width:760px){.hero .scene-engine{inset:8% 0 auto 0;width:100%}}
/* P1 artifact-browser corrections: controls remain tappable, evidence labels keep the 12px floor, and mobile family overrides cannot outrank reflow. */
:root{--on-ember:var(--ground-lo)}.brand{min-height:44px}.trace-top,.section-label,.card-index{font-size:12px}@keyframes fadeUp{from{transform:translateY(16px)}to{transform:none}}@media(max-width:760px){body[data-family] .hero-grid{display:grid;grid-template-columns:1fr}.trace-flow{grid-template-columns:1fr}.trace-step{min-height:44px}.index{position:static;display:block;margin-top:32px}}
.nav a{min-height:44px;display:inline-flex;align-items:center}.trace-step,.trace-step strong{font-size:12px;white-space:normal;overflow:visible;text-overflow:clip}.trace-plate,.ledger-card{overflow:visible}.trace-plate:after{right:12px;top:12px;width:72px;height:72px}.ledger-card:after{inset:auto 0 0 30%;height:120px}.ledger-card h3{margin-top:56px}@media(max-width:760px){.trace-plate,.ledger-card{min-width:0}.ledger-card{min-height:auto;padding-bottom:40px}.trace-flow{gap:16px}}
.nav-links a{min-width:44px;justify-content:center}.hero-grid,.hero-grid>*{min-width:0}h1,.kicker,.hero-copy{overflow-wrap:anywhere}.button{white-space:normal;text-align:center;min-width:0}@media(max-width:760px){.wrap,.narrow{width:min(calc(100% - 28px),1120px)}.cta-row .button{width:100%}}
</style></head>
<body data-family="${plan.family}" data-composition-family="${plan.family}" ${motionAttributes}><div class="route-wipe" aria-hidden="true"></div>
<header><nav class="nav wrap" aria-label="Primary"><a class="brand" href="#top">${productName}</a><div class="nav-links"><a href="#proof">Proof</a><a href="#workflow">Workflow</a><a href="#decision">Decision view</a></div></nav></header>
<main id="top"><section class="hero" data-motion-role="arrival"><div class="wrap hero-grid"><div class="hero-statement"><p class="kicker" style="--i:0">${eyebrow}</p><h1><span class="mask"><span style="--i:1">${headline}</span></span></h1><p class="hero-summary" style="--i:2">${summary}</p><div class="cta-row" style="--i:3"><a class="button primary" href="#workflow" data-route>Explore the evidence <span aria-hidden="true">↓</span></a><a class="button" href="#decision">See decision view</a></div></div>${motionStage}</div><span class="index wrap">KILN / 01 — gated prototype</span></section>
<section class="proof-band" id="proof" aria-label="Product proof"><div class="wrap proof-grid">${proof.map((item, index) => `<div class="proof"><strong>0${index + 1}</strong><span>${item}</span></div>`).join("")}</div></section>
<section class="story" id="workflow" data-motion-role="scroll-reveal"><div class="wrap"><div class="story-head" data-reveal style="--i:0"><p class="section-label">02 / Trace the chain</p><div><h2>From raw signal to a record you can defend.</h2><p class="story-intro">Each stage keeps its source, owner, and decision attached—so the final report is an explanation, not a black box.</p></div></div><div class="ledger"><article class="ledger-card ledger-source" data-reveal style="--i:0"><span class="card-index">A / INGEST</span><h3>Inputs arrive with lineage intact.</h3><div class="signal" aria-hidden="true">${[42, 65, 38, 88, 56, 72, 94].map((height) => `<i style="--h:${height}%"></i>`).join("")}</div></article><article class="ledger-card ledger-variance" data-reveal style="--i:1"><span class="card-index">B / RESOLVE</span><h3>Variance becomes a visible decision.</h3></article><article class="ledger-card ledger-publish" data-reveal style="--i:2"><span class="card-index">C / PUBLISH</span><h3>One decision trail. Every audience.</h3></article></div></div></section>
<section class="console" id="decision"><div class="narrow console-grid"><div class="console-copy" data-reveal><p class="section-label">03 / Test the model</p><h2>Make the trade-off tangible.</h2><p>Switch the evidence view to see how one changed assumption propagates through the record.</p></div><div class="artifact" data-mode="baseline"${transitionRole} data-reveal><div class="artifact-top"><span>Scenario / Q3 operations</span><span class="live">● demo state</span></div><div class="artifact-body"><div class="artifact-row"><span>Primary evidence coverage</span><span>94.8%</span></div><div class="artifact-row"><span>Unresolved variance</span><span>3.1%</span></div><div class="artifact-row"><span>Confidence band</span><span>±1.6%</span></div></div><button class="button mode-switch" type="button" data-motion-role="interaction" aria-pressed="false">Compare scenario <span aria-hidden="true">↔</span></button></div></div></section>
<section class="closing"><div class="narrow" data-reveal><p class="section-label">04 / Keep the proof</p><h2>Move fast without losing the reason why.</h2><p>A composed Kiln prototype generated from a structured plan, checked before reveal, and isolated from external network access.</p></div></section></main>
<footer><div class="wrap footer-row"><span>${productName} / prototype</span><span>Built with DesignOS · Kiln system</span></div></footer>
<script type="application/json" data-designos-tasks>[{"id":"compare-decision-scenario","steps":[{"action":"click","selector":".mode-switch"},{"assert":"attribute","selector":".mode-switch","name":"aria-pressed","equals":"true"}]}]</script>
<script>(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const disposers=[];const reveal=()=>document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('is-visible'));if(reduce||!('IntersectionObserver'in window)){reveal()}else{const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.14});document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));disposers.push(()=>io.disconnect())}const artifact=document.querySelector('.artifact');const toggle=document.querySelector('.mode-switch');toggle?.addEventListener('click',()=>{const active=artifact.dataset.mode==='scenario';artifact.dataset.mode=active?'baseline':'scenario';toggle.setAttribute('aria-pressed',String(!active));toggle.firstChild.textContent=active?'Compare scenario ':'Return to baseline '});document.querySelectorAll('[data-route]').forEach(link=>link.addEventListener('click',event=>{if(reduce)return;event.preventDefault();const target=document.querySelector(link.getAttribute('href'));const wipe=document.querySelector('.route-wipe');wipe.classList.remove('is-active');requestAnimationFrame(()=>wipe.classList.add('is-active'));setTimeout(()=>target?.scrollIntoView(),180)}));const mountScene=()=>{const root=document.body,character=root.dataset.motionCharacter;if(reduce){root.dataset.motionRuntimeState='reduced';return}const progress=document.createElement('i');progress.className='scene-progress';progress.setAttribute('aria-hidden','true');root.append(progress);let raf=0;const update=()=>{raf=0;const max=document.documentElement.scrollHeight-innerHeight;root.style.setProperty('--scene-progress',String(max?scrollY/max:0))};const request=()=>{if(!raf)raf=requestAnimationFrame(update)};addEventListener('scroll',request,{passive:true});update();disposers.push(()=>{removeEventListener('scroll',request);cancelAnimationFrame(raf)});if(character==='cinematic'){const canvas=document.createElement('canvas');canvas.className='scene-canvas';canvas.setAttribute('aria-hidden','true');document.querySelector('.hero')?.append(canvas);const context=canvas.getContext('2d');let frame=0;const draw=time=>{const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio,2),width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}context.clearRect(0,0,width,height);for(let index=0;index<28;index++){const phase=time*.00025+index*.67,x=(.5+.46*Math.sin(phase*1.2+index))*width,y=(.5+.42*Math.cos(phase+index*.41))*height,r=(2+(index%5))*ratio;context.fillStyle='rgba(232,112,58,'+(0.1+(index%4)*.06)+')';context.beginPath();context.arc(x,y,r,0,Math.PI*2);context.fill()}frame=requestAnimationFrame(draw)};frame=requestAnimationFrame(draw);disposers.push(()=>cancelAnimationFrame(frame))}if(character==='technical'){const cursor=document.createElement('i');cursor.className='scene-cursor';cursor.setAttribute('aria-hidden','true');root.append(cursor);const move=event=>{root.style.setProperty('--scene-x',event.clientX+'px');root.style.setProperty('--scene-y',event.clientY+'px')};addEventListener('pointermove',move,{passive:true});disposers.push(()=>removeEventListener('pointermove',move))}if(character==='editorial'){const stage=document.querySelector('.hero-grid');const move=event=>{const rect=stage.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;stage.style.setProperty('--scene-rx',(-y*2.6).toFixed(2)+'deg');stage.style.setProperty('--scene-ry',(x*3.2).toFixed(2)+'deg')};stage?.addEventListener('pointermove',move,{passive:true});disposers.push(()=>stage?.removeEventListener('pointermove',move))}root.dataset.motionRuntimeState='mounted'};mountScene();addEventListener('pagehide',()=>disposers.splice(0).forEach(dispose=>dispose()),{once:true})})();</script>
<script>(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const disposers=[];${motionDirectorRuntime(motionScene)}${motionStageRuntime()}mountScene();mountMotionStage();addEventListener('pagehide',()=>disposers.splice(0).forEach(dispose=>dispose()),{once:true})})();</script>
</body></html>`;
  const commonRuntime = `<script>(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,disposers=[];const reveal=()=>document.querySelectorAll('[data-reveal]').forEach(element=>element.classList.add('is-visible'));if(reduce||!('IntersectionObserver'in window))reveal();else{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.14});document.querySelectorAll('[data-reveal]').forEach(element=>observer.observe(element));disposers.push(()=>observer.disconnect())}const artifact=document.querySelector('.artifact'),modeToggle=document.querySelector('.mode-switch');const onMode=()=>{const active=artifact.dataset.mode==='scenario';artifact.dataset.mode=active?'baseline':'scenario';modeToggle.setAttribute('aria-pressed',String(!active));modeToggle.firstChild.textContent=active?'Compare scenario ':'Return to baseline '};modeToggle?.addEventListener('click',onMode);disposers.push(()=>modeToggle?.removeEventListener('click',onMode));document.querySelectorAll('[data-route]').forEach(link=>{const onRoute=event=>{if(reduce)return;event.preventDefault();const target=document.querySelector(link.getAttribute('href')),wipe=document.querySelector('.route-wipe');wipe.classList.remove('is-active');requestAnimationFrame(()=>wipe.classList.add('is-active'));setTimeout(()=>target?.scrollIntoView(),180)};link.addEventListener('click',onRoute);disposers.push(()=>link.removeEventListener('click',onRoute))});addEventListener('pagehide',()=>disposers.splice(0).forEach(dispose=>dispose()),{once:true})})();</script>`;
  const cleanedArtifact = artifact.replace(
    /(<script type="application\/json" data-designos-tasks>[\s\S]*?<\/script>\n)<script>[\s\S]*?<\/script>/,
    `$1${commonRuntime}`,
  );
  return applySystemTheme(cleanedArtifact, system);
}

function evaluateArtifact(html: string, system: RuntimeSystem): GateCheck[] {
  const roleCount = new Set(
    [...html.matchAll(/data-motion-role="([^"]+)"/g)].map((match) => match[1]),
  ).size;
  const recipeCount =
    html
      .match(/data-motion-recipes="([^"]+)"/)?.[1]
      .trim()
      .split(/\s+/)
      .filter(Boolean).length ?? 0;
  const hasSceneGraph =
    /data-motion-scene="[^"]+"/.test(html) &&
    /data-motion-character="[^"]+"/.test(html) &&
    /data-motion-runtime="scene-graph"/.test(html) &&
    /const mountScene=/.test(html);
  const sceneRuntimeCount = (html.match(/const mountScene=/g) ?? []).length;
  const hasMotionFilm =
    /data-motion-stage/.test(html) &&
    /data-motion-duration="6400"/.test(html) &&
    /data-motion-playback="single-pass-replayable"/.test(html) &&
    /data-motion-poster="resolved-outcome"/.test(html) &&
    (html.match(/class="motion-shot/g) ?? []).length === 3;
  const hasMotionFilmRuntime =
    /const mountMotionStage=/.test(html) &&
    /IntersectionObserver/.test(html) &&
    /visibilitychange/.test(html) &&
    /data-stage-toggle/.test(html);
  const engine = html.match(/data-motion-engine="([^"]+)"/)?.[1] ?? "missing";
  const engineNodes: Record<string, RegExp> = {
    "webgl-field": /<canvas[^>]+data-scene-canvas/,
    "spatial-orbit": /<canvas[^>]+data-scene-canvas/,
    "particle-field": /<canvas[^>]+data-scene-canvas/,
    "vector-morph": /data-scene-vector/,
    "signal-trace": /data-scene-signal/,
    "kinetic-type": /data-scene-type/,
  };
  const hasAuthoredRenderer =
    Boolean(engineNodes[engine]?.test(html)) &&
    html.includes("motionEngineActive") &&
    (engine.includes("webgl") || engine.includes("spatial")
      ? html.includes("getContext('webgl2'")
      : true);
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  const bannedExternal = /(?:src|href)="https?:\/\//i.test(html);
  const requiredLandmarks = ["<header", "<nav", "<main", "<footer"].every(
    (item) => html.includes(item),
  );
  const sectionCount = (html.match(/<section[\s>]/g) ?? []).length;
  const hasReducedMotion = html.includes("prefers-reduced-motion:reduce");
  const hasSystemMaterial = [
    "--ember:",
    "--shadow-1:",
    "--shadow-2:",
    "--shadow-3:",
    "background-image:url",
    `data-design-system="${system.id}"`,
  ].every((item) => html.includes(item));
  const hasHierarchy =
    html.includes("--display:") &&
    html.includes("font-variation-settings") &&
    h1Count === 1;
  const hasInteraction =
    html.includes('aria-pressed="false"') &&
    html.includes("addEventListener('click'");
  const checks: GateCheck[] = [
    {
      id: "animation-richness",
      label: "Animation richness",
      status:
        roleCount >= 4 &&
        recipeCount >= 4 &&
        hasSceneGraph &&
        hasMotionFilm &&
        hasMotionFilmRuntime &&
        hasReducedMotion
          ? "PASS"
          : "FAIL",
      score:
        roleCount >= 4 &&
        recipeCount >= 4 &&
        hasSceneGraph &&
        hasMotionFilm &&
        hasMotionFilmRuntime &&
        hasReducedMotion
          ? 97
          : 72,
      evidence: `${roleCount}/4 roles; ${recipeCount}/4 scene recipes; 6.4s proof film ${hasMotionFilm ? "present" : "missing"}; pausable runtime ${hasMotionFilmRuntime ? "present" : "missing"}; reduced-motion ${hasReducedMotion ? "present" : "missing"}`,
    },
    {
      id: "motion-runtime-integrity",
      label: "Motion runtime integrity",
      status:
        sceneRuntimeCount === 1 && hasMotionFilmRuntime ? "PASS" : "FAIL",
      score: sceneRuntimeCount === 1 && hasMotionFilmRuntime ? 97 : 67,
      evidence: `${sceneRuntimeCount} scene runtime; single-pass replay, pause, off-screen and hidden-tab controls ${hasMotionFilmRuntime ? "present" : "missing"}`,
    },
    {
      id: "product-material-story",
      label: "Inspectable product material",
      status: hasMotionFilm ? "PASS" : "FAIL",
      score: hasMotionFilm ? 96 : 70,
      evidence: hasMotionFilm
        ? "Three readable input → transformation → outcome frames with a resolved poster"
        : "Foreground product-material story is incomplete",
    },
    {
      id: "authored-motion-renderer",
      label: "Authored motion renderer",
      status: hasAuthoredRenderer ? "PASS" : "FAIL",
      score: hasAuthoredRenderer ? 98 : 68,
      evidence: hasAuthoredRenderer
        ? `${engine} has a matching scene node, runtime dispatch and explicit fallback`
        : `${engine} renderer contract is incomplete`,
    },
    {
      id: "typography-hierarchy",
      label: "Typography hierarchy",
      status: hasHierarchy ? "PASS" : "FAIL",
      score: hasHierarchy ? 96 : 74,
      evidence: hasHierarchy
        ? "Named display/text/mono stack, one H1, optical display settings"
        : "Hierarchy contract incomplete",
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
      label: `${system.name} consistency`,
      status: hasSystemMaterial && !bannedExternal ? "PASS" : "FAIL",
      score: hasSystemMaterial && !bannedExternal ? 98 : 70,
      evidence:
        hasSystemMaterial && !bannedExternal
          ? "Selected system tokens, signal accent, texture and three-level elevation contract"
          : "Material or isolation contract failed",
    },
    {
      id: "first-three-seconds",
      label: "First-view structure",
      status:
        requiredLandmarks && h1Count === 1 && hasInteraction ? "PASS" : "FAIL",
      score: requiredLandmarks && h1Count === 1 && hasInteraction ? 96 : 73,
      evidence:
        "Single dominant claim, visible action, semantic interactive proof",
    },
  ];
  return checks;
}

export async function runPipeline(
  brief: string,
  variation: number,
  systemId = "kiln",
): Promise<PipelineResult> {
  const system = systems.find((candidate) => candidate.id === systemId);
  if (!system)
    throw new Error(
      "The selected design system is not available to the compiler.",
    );
  const planned = await createPlan(brief, variation);
  planned.plan.family =
    system.families[Math.abs(variation) % system.families.length];
  const tournament = runVisualTournament({
    family: planned.plan.family,
    systemId: system.id,
    brief,
    variation,
  });
  const motionScene = tournament.winner;
  const ir = Object.freeze({
    schema: "designos.design-ir/v1",
    brief,
    system: { id: system.id },
    routedModules: [
      "brain/design-intelligence.md",
      "brain/decision-framework.md",
      "brain/brief-compiler.md",
      "patterns/landing-pages.md",
      "components/hero.md",
      "motion/signature-moments.md",
    ],
    composition: { family: planned.plan.family, variation },
    motion: {
      sceneId: motionScene.id,
      engine: motionScene.engine,
      recipes: motionScene.recipes,
      signature: motionScene.signature,
      productTruth: motionScene.productTruth,
    },
    content: planned.plan,
  });
  let evidenceMode: PipelineResult["evidenceMode"] = "local-static";
  const generated = (await executeGeneration({
    ir,
    initialState: {
      completeMotionContract: planned.provider === "central-model-gateway",
    },
    render: (_designIr: unknown, state: { completeMotionContract: boolean }) =>
      compileArtifact(
        planned.plan,
        state.completeMotionContract,
        system,
        motionScene,
      ),
    evaluate: async (artifact: string) => {
      const mechanical = evaluateArtifact(artifact, system);
      if (
        !mechanical.every(
          (check) => check.status === "PASS" && (check.score ?? 0) >= 95,
        )
      )
        return mechanical;
      const external = await collectArtifactEvidence(artifact);
      evidenceMode = external.mode;
      return [...mechanical, ...external.checks];
    },
    repair: ({ state }: { state: { completeMotionContract: boolean } }) => ({
      ...state,
      completeMotionContract: true,
    }),
  })) as {
    artifact: string | null;
    passed: boolean;
    evidence: GateCheck[];
    attempts: Array<{
      attempt: number;
      result: "PASS" | "FAIL";
      fingerprint: string;
      repair: string;
    }>;
  };
  const attemptLog = generated.attempts.map((attempt) => ({
    ...attempt,
    repair:
      attempt.result === "FAIL" && !attempt.repair.includes("restored")
        ? `${attempt.repair}; restored the complete scene recipe contract`
        : attempt.repair,
  }));
  if (generated.passed && generated.artifact)
    return {
      artifact: generated.artifact,
      attempts: attemptLog.length,
      systemId: system.id,
      systemName: system.name,
      family: planned.plan.family,
      sceneId: motionScene.id,
      motionEngine: motionScene.engine,
      motionSignature: motionScene.signature,
      tournamentPolicy: tournament.policy,
      candidateTournament: tournament.candidates,
      provider: planned.provider,
      providerLabel: planned.providerLabel,
      providerId: planned.providerId,
      usage: planned.usage,
      mechanicalGate: "PASS",
      releaseDecision: "REVEALED",
      finalDesignScore: "NOT_ASSESSED",
      evidenceMode,
      checks: generated.evidence,
      attemptLog,
    };
  return {
    artifact: null,
    attempts: attemptLog.length,
    systemId: system.id,
    systemName: system.name,
    family: planned.plan.family,
    sceneId: motionScene.id,
    motionEngine: motionScene.engine,
    motionSignature: motionScene.signature,
    tournamentPolicy: tournament.policy,
    candidateTournament: tournament.candidates,
    provider: planned.provider,
    providerLabel: planned.providerLabel,
    providerId: planned.providerId,
    usage: planned.usage,
    mechanicalGate: "FAIL",
    releaseDecision: "WITHHELD",
    finalDesignScore: "NOT_ASSESSED",
    evidenceMode,
    checks: generated.evidence,
    attemptLog,
  };
}
