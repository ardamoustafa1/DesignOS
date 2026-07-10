<div align="center">

# ⬡ DesignOS

**Le système d'exploitation d'intelligence design pour agents de code IA**

*Claude, Fable, Cursor, Copilot — n'importe quel agent. Un prompt en entrée, une UI niveau Stripe en sortie.*

[English](README.md) · [Türkçe](README.tr.md) · [中文](README.zh.md) · [Español](README.es.md) · [日本語](README.ja.md) · [Deutsch](README.de.md)

</div>

---

## Le problème

Les agents IA écrivent du code impeccable et livrent pourtant des interfaces de 2015 :
espacements étouffés, cinq CTA en concurrence, contrastes gris-sur-gris en échec.
Ce n'est pas la capacité qui manque — c'est **le goût, le processus et un seuil de qualité**.

## La réponse

DesignOS n'est pas un pack de prompts : c'est un **système d'exploitation** que l'agent démarre :

```
Vous tapez :  « Conçois une landing page SaaS niveau Stripe. »

DesignOS :    démarre le noyau → route vers les bons modules → charge les règles du secteur
              → exécute le Design Loop → s'auto-évalue sur 6 dimensions
              → refait tout ce qui est sous 95 → écrit les décisions en mémoire
```

L'agent cesse de penser « je vais faire un bouton » et commence à penser : « où tombe
l'attention ? le CTA gagne-t-il ? Apple supprimerait-il cet élément ? »

---

## Les cinq couches

| Couche | Rôle | Emplacement |
|---|---|---|
| **1 · Savoir** | 60+ modules assumés — fondations, 20 composants, 8 de psychologie, motion, 12 patterns | `foundations/` `components/` `psychology/` `motion/` `patterns/` `native/` |
| **2 · Boucles** | Research → Wireframe → UI → Review → A11y → Perf → SEO → Refactor → Score | `loops/` |
| **3 · Moteur de revue** | Auto-évaluation adversariale, 6 dimensions, seuil dur à 95 | `scoring/` + `validators/` |
| **4 · Mémoire** | 7 fichiers par projet : client, marque, design, pages, tâches, bugs, notes | `memory/` |
| **5 · Intelligence sectorielle** | 24 playbooks d'industrie aux langages visuels distincts | `industries/` |

Plus un **studio de neuf agents** (`agents/`) : directeur créatif, chercheur UX,
designer UI, ingénieur frontend, motion designer, spécialiste accessibilité, copywriter,
SEO — et un reviewer adversarial avec droit de veto.

---

## Démarrage rapide

Une commande depuis votre projet :

```bash
npx github:ardamoustafa1/DesignOS init --agents --skills
```

Le système est copié dans `./DesignOS`, branché sur votre `CLAUDE.md`, et les 9
spécialistes sont enregistrés comme de vrais sous-agents Claude Code. Puis demandez :

> *Conçois une page de tarifs pour un SaaS de cybersécurité. Thème sombre.*

## Voir pour croire

La galerie [`examples/`](examples/README.md) contient quatre pages complètes produites
par le système — landing, dashboard, tarifs, docs — sur un unique système de tokens.
La piste de décisions est dans le [walkthrough](examples/saas-landing-walkthrough.md).

## Licence

MIT — [LICENSE](LICENSE). Utilisez, forkez, livrez avec votre produit.
