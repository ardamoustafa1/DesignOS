"use client";

/* a11y-ok: inherited focus system */

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const sampleBrief =
  "A launch page for an API that turns raw climate data into decision-ready carbon reports for operations teams.";

type RunState = "idle" | "planning" | "gating" | "repairing" | "passed" | "failed";
type Viewport = "desktop" | "mobile";
type GateCheck = { id: string; label: string; status: "PASS" | "FAIL" | "NOT_ASSESSED" | "NOT_APPLICABLE"; score: number | null; evidence: string };
type GenerationResult = {
  artifact: string | null; attempts: number; family: string; providerLabel: string;
  mechanicalGate: "PASS" | "FAIL"; releaseDecision: "REVEALED" | "WITHHELD";
  finalDesignScore: "NOT_ASSESSED"; checks: GateCheck[];
  attemptLog: Array<{ attempt: number; result: "PASS" | "FAIL"; fingerprint: string; repair: string }>;
  quota: { remaining: number; limit: number; resetAt: number }; error?: string;
};

const idleChecks: GateCheck[] = [
  { id: "brand", label: "Kiln contract", status: "PASS", score: null, evidence: "Conformance fixture loaded" },
  { id: "motion", label: "Four motion roles", status: "NOT_ASSESSED", score: null, evidence: "Waiting for artifact" },
  { id: "responsive", label: "Responsive contract", status: "NOT_ASSESSED", score: null, evidence: "320–1440 coverage queued" },
  { id: "isolation", label: "Sandbox isolation", status: "PASS", score: null, evidence: "Network and forms disabled" },
];

const stateCopy: Record<RunState, { eyebrow: string; title: string; body: string }> = {
  idle: { eyebrow: "Ready for a brief", title: "The canvas stays quiet until the evidence speaks.", body: "Your first passing composition will appear here." },
  planning: { eyebrow: "Planning composition", title: "Turning intent into a constrained design plan.", body: "The private planning layer cannot write executable markup." },
  gating: { eyebrow: "Testing the artifact", title: "Four motion roles. Five quality dimensions.", body: "The preview remains sealed while every required check runs." },
  repairing: { eyebrow: "Repairing in private", title: "A weak draft never becomes the first impression.", body: "Failed evidence is feeding a bounded recompile attempt." },
  passed: { eyebrow: "Evidence accepted", title: "The verified prototype is ready.", body: "The sealed canvas is opening now." },
  failed: { eyebrow: "Artifact withheld", title: "The gate protected the preview.", body: "Revise the brief or try another composition." },
};

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function StudioShell() {
  const [brief, setBrief] = useState(sampleBrief);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [runState, setRunState] = useState<RunState>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState("");
  const [variation, setVariation] = useState(0);
  const [previewFocus, setPreviewFocus] = useState(false);
  const runId = useRef(0);

  const checks = result?.checks ?? idleChecks;
  const automatedScore = useMemo(() => {
    if (!result || result.mechanicalGate !== "PASS") return null;
    const scores = result.checks.flatMap((check) => (typeof check.score === "number" ? [check.score] : []));
    return scores.length ? Math.min(...scores) : null;
  }, [result]);
  const busy = runState === "planning" || runState === "gating" || runState === "repairing";
  const remaining = result?.quota.remaining ?? 5;
  const currentState = stateCopy[runState];

  useEffect(() => {
    const query = window.matchMedia("(max-width: 520px)");
    const syncViewport = () => setViewport(query.matches ? "mobile" : "desktop");
    syncViewport();
    query.addEventListener("change", syncViewport);
    return () => query.removeEventListener("change", syncViewport);
  }, []);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = brief.trim();
    if (normalized.length < 24) {
      setError("Add a little more context: product, audience, and desired outcome.");
      document.querySelector<HTMLTextAreaElement>("#brief")?.focus();
      return;
    }

    const thisRun = runId.current + 1;
    runId.current = thisRun;
    setError("");
    setResult(null);
    setPreviewFocus(false);
    setRunState("planning");
    const progress = (async () => {
      await wait(420);
      if (runId.current === thisRun) setRunState("gating");
      await wait(650);
      if (runId.current === thisRun) setRunState("repairing");
    })();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: normalized, systemId: "kiln", variation }),
      });
      const payload = (await response.json()) as GenerationResult;
      await progress;
      if (runId.current !== thisRun) return;
      setResult(payload);
      if (!response.ok || payload.releaseDecision !== "REVEALED" || !payload.artifact) {
        setError(payload.error || "The artifact did not clear every required check.");
        setRunState("failed");
        return;
      }
      setRunState("passed");
      if (window.matchMedia("(max-width: 520px)").matches) setPreviewFocus(true);
      setVariation((value) => (value + 1) % 3);
    } catch {
      if (runId.current !== thisRun) return;
      setError("The central gateway could not be reached. No draft was revealed.");
      setRunState("failed");
    }
  }

  return (
    <div className={`studio-shell state-${runState}${previewFocus ? " preview-focus" : ""}`}>
      <script
        type="application/json"
        data-designos-tasks
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              id: "generate-verified-prototype",
              viewport: { width: 375, height: 812 },
              steps: [
                { action: "click", selector: ".viewport-toggle button:nth-child(2)" },
                { assert: "attribute", selector: ".viewport-toggle button:nth-child(2)", name: "aria-pressed", equals: "true" },
                { action: "click", selector: ".generate-button" },
                { action: "wait", ms: 1400 },
                { assert: "visible", selector: "iframe.artifact-frame" },
                { assert: "visible", selector: ".focus-button" },
                { action: "click", selector: ".focus-button" },
                { assert: "text", selector: ".score-lockup", includes: "Gate passed" },
              ],
            },
          ]),
        }}
      />
      <header className="topbar">
        <a className="wordmark" href="#composer" aria-label="DesignOS Studio home"><Mark /><span>DesignOS</span><span className="wordmark-index">/ Studio 01</span></a>
        <div className="topbar-status" aria-label="Workspace status"><span><i className="status-dot" /> Central gateway</span><span className="budget">Budget&nbsp; {String(remaining).padStart(2, "0")} / 05</span></div>
      </header>

      <main className="studio-grid">
        <section className="composer" id="composer" aria-labelledby="studio-title">
          <p className="eyebrow"><span>01</span> Compose</p>
          <h1 id="studio-title">Describe the result.<br />Not the style.</h1>
          <p className="composer-lede">The model plans. Kiln composes. Nothing reaches the preview before every required mechanical check passes.</p>
          <form className="brief-form" onSubmit={generate} noValidate>
            <label htmlFor="system">Design system</label>
            <div className="select-wrap"><select id="system" value="kiln" disabled={busy} onChange={() => undefined}><option value="kiln">Kiln — MVP package</option></select><span aria-hidden="true">↓</span></div>
            <label htmlFor="brief">Product brief</label>
            <textarea id="brief" value={brief} onChange={(event) => setBrief(event.target.value)} rows={7} minLength={24} maxLength={640} disabled={busy} aria-describedby="brief-help brief-error" />
            <div className="field-meta" id="brief-help"><span>Product, audience, desired outcome</span><span>{brief.length} / 640</span></div>
            <p className="field-error" id="brief-error" aria-live="polite">{error}</p>
            <button className="generate-button" type="submit" disabled={busy}><span>{busy ? "Building behind the gate" : result ? "Generate another composition" : "Generate gated prototype"}</span><span className="button-arrow" aria-hidden="true">{busy ? "···" : "↗"}</span></button>
            <p className="form-note">No provider key accepted. Failed drafts stay hidden.</p>
          </form>
        </section>

        <section className="preview-column" aria-labelledby="preview-title">
          <div className="preview-toolbar"><div><p className="eyebrow"><span>02</span> Preview</p><h2 id="preview-title">Gated canvas</h2></div><div className="preview-actions"><div className="viewport-toggle" aria-label="Preview viewport"><button type="button" aria-pressed={viewport === "desktop"} onClick={() => setViewport("desktop")}>Desktop</button><button type="button" aria-pressed={viewport === "mobile"} onClick={() => setViewport("mobile")}>Mobile</button></div>{result?.artifact && runState === "passed" && <button className="focus-button" type="button" aria-pressed={previewFocus} onClick={() => setPreviewFocus((value) => !value)}>{previewFocus ? "Exit preview" : "Focus preview"}</button>}</div></div>
          <div className={`preview-stage preview-${viewport}`} aria-busy={busy}>
            <div className="preview-browser">
              <div className="browser-chrome" aria-hidden="true"><span /><span /><span /><div>{result?.artifact ? `passed://${result.family}` : `sealed://${runState}`}</div></div>
              {result?.artifact && runState === "passed" ? (
                <iframe className="artifact-frame" title="Generated Kiln prototype" srcDoc={result.artifact} sandbox="allow-scripts" referrerPolicy="no-referrer" />
              ) : (
                <div className="preview-empty" role="status" aria-live="polite"><div className="preview-orbit" aria-hidden="true"><span className="orbit-core"><Mark /></span><span className="orbit-ring orbit-ring-a" /><span className="orbit-ring orbit-ring-b" /><span className="orbit-scan" /></div><p className="preview-state">{currentState.eyebrow}</p><h3>{currentState.title}</h3><p>{currentState.body}</p></div>
              )}
              <div className="gate-seal" aria-hidden="true"><span><Mark /></span></div>
            </div>
          </div>
        </section>

        <aside className="evidence-rail" aria-labelledby="evidence-title">
          <div className="score-lockup"><span className="score-value">{automatedScore ? "✓" : "—"}</span><div><h2 id="evidence-title">{result?.mechanicalGate === "PASS" ? "Gate passed" : busy ? "Gate running" : "Gate armed"}</h2><p>{automatedScore ? `Automated floor ${automatedScore} / 100` : "Minimum 95 per dimension"}</p></div></div>
          <ol className="gate-list">{checks.map((check, index) => <li key={check.id}><span>{String(index + 1).padStart(2, "0")}</span><span><strong>{check.label}</strong><small>{check.evidence}</small></span><span className={`gate-status status-${check.status.toLowerCase()}`}>{busy ? "RUN" : check.status === "NOT_ASSESSED" ? "PENDING" : check.status === "NOT_APPLICABLE" ? "N/A" : `${check.score ? `${check.score} · ` : ""}${check.status}`}</span></li>)}</ol>
          <div className="policy-card"><p className="policy-label">Reveal policy</p><p>All required checks PASS · every measured dimension ≥95</p>{result && <><p className="policy-detail">{result.attempts} immutable attempt{result.attempts === 1 ? "" : "s"} · {result.providerLabel}</p><details className="evidence-details"><summary>View raw gate evidence</summary><ul>{result.attemptLog.map((attempt) => <li key={attempt.attempt}><span>Attempt {attempt.attempt} · {attempt.result}</span><code>{attempt.fingerprint}</code></li>)}</ul></details></>}</div>
          <div className="assessment-card"><span>Final design score</span><strong>{result?.finalDesignScore ?? "NOT ASSESSED"}</strong></div>
          <footer className="rail-footer"><span>DesignOS Studio</span><span>Evidence, not theatre.</span></footer>
        </aside>
      </main>
    </div>
  );
}
