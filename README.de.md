<div align="center">

# ⬡ DesignOS

**Das Design-Intelligenz-Betriebssystem für KI-Coding-Agenten**

*Claude, Fable, Cursor, Copilot — jeder Agent. Ein Prompt rein, UI auf Stripe-Niveau raus.*

[English](README.md) · [Türkçe](README.tr.md) · [中文](README.zh.md) · [Español](README.es.md) · [日本語](README.ja.md)

</div>

---

## Das Problem

KI-Agenten schreiben fehlerfreien Code und liefern trotzdem Interfaces von 2015:
gequetschte Abstände, fünf konkurrierende CTAs, Grau-auf-Grau-Kontrastfehler.
Es fehlt nicht an Fähigkeit — es fehlen **Geschmack, Prozess und eine Qualitätsschwelle**.

## Die Antwort

DesignOS ist kein Prompt-Paket, sondern ein **Betriebssystem**, in das der Agent bootet:

```
Du tippst:  „Gestalte eine SaaS-Landingpage auf Stripe-Niveau."

DesignOS:   bootet den Kernel → routet zu den richtigen Modulen → lädt Branchenregeln
            → durchläuft den Design Loop → bewertet sich selbst in 6 Dimensionen
            → überarbeitet alles unter 95 → schreibt Entscheidungen ins Gedächtnis
```

Der Agent denkt nicht mehr „ich baue einen Button", sondern: „Wo landet die
Aufmerksamkeit? Gewinnt der CTA? Würde Apple dieses Element komplett streichen?"

---

## Die fünf Schichten

| Schicht | Aufgabe | Ort |
|---|---|---|
| **1 · Wissen** | 60+ meinungsstarke Module — Grundlagen, 20 Komponenten, 8× Psychologie, Motion, 12 Patterns | `foundations/` `components/` `psychology/` `motion/` `patterns/` `native/` |
| **2 · Loops** | Research → Wireframe → UI → Review → A11y → Perf → SEO → Refactor → Score | `loops/` |
| **3 · Review-Engine** | Adversariale Selbstbewertung, 6 Dimensionen, harte 95er-Schwelle | `scoring/` + `validators/` |
| **4 · Gedächtnis** | 7 Dateien pro Projekt: Client, Brand, Design, Seiten, Todos, Bugs, Notizen | `memory/` |
| **5 · Branchenintelligenz** | 24 Sektor-Playbooks mit eigener visueller Sprache | `industries/` |

Dazu ein **Studio aus neun Agenten** (`agents/`): Creative Director, UX-Researcher,
UI-Designer, Frontend-Engineer, Motion-Designer, Accessibility-Spezialist, Copywriter,
SEO — und ein adversarialer Reviewer mit Vetorecht.

---

## Schnellstart

Ein Befehl aus deinem Projektverzeichnis:

```bash
npx github:ardamoustafa1/DesignOS init --agents --skills
```

Das kopiert das System nach `./DesignOS`, verdrahtet es mit deiner `CLAUDE.md` und
registriert die 9 Spezialisten als echte Claude-Code-Subagenten. Dann einfach fragen:

> *Gestalte eine Preisseite für ein Cybersecurity-SaaS. Dunkles Theme.*

## Sehen statt glauben

Die [`examples/`](examples/README.md)-Galerie enthält vier vollständige, vom System
erzeugte Seiten — Landing, Dashboard, Pricing, Docs — auf einem einzigen Token-System.
Der Entscheidungspfad steht im [Walkthrough](examples/saas-landing-walkthrough.md).

## Lizenz

MIT — [LICENSE](LICENSE). Nutzen, forken, mit dem Produkt ausliefern.
