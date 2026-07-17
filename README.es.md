<div align="center">

# ⬡ DesignOS

**El Sistema Operativo de Inteligencia de Diseño para Agentes de IA**

*Claude, Fable, Cursor, Copilot — cualquier agente. Entra un prompt, sale UI de nivel Stripe.*

[English](README.md) · [Türkçe](README.tr.md) · [中文](README.zh.md)

</div>

---

## El problema

Los agentes de IA escriben código impecable y aun así entregan interfaces de 2015:
espaciado asfixiado, cinco CTAs compitiendo, fallos de contraste gris sobre gris.
No les falta capacidad — les falta **criterio, proceso y un umbral de calidad**.

## La respuesta

DesignOS no es un paquete de prompts: es un **sistema operativo** que el agente arranca:

```
Escribes:   "Diseña una landing SaaS de nivel Stripe."

DesignOS:   arranca el kernel → enruta a los módulos correctos → carga reglas del sector
            → ejecuta el Design Loop → se autoevalúa en 6 dimensiones
            → rehace todo lo que baje de 95 → escribe las decisiones en memoria
```

El agente deja de pensar *"haré un botón"* y empieza a pensar: *"¿dónde cae la atención?,
¿gana el CTA?, ¿Apple eliminaría este elemento por completo?"*

---

## Las cinco capas

| Capa | Qué hace | Dónde |
|---|---|---|
| **1 · Conocimiento** | 60+ módulos con criterio: fundamentos, 21 componentes, 8 de psicología, motion, 12 patrones | `foundations/` `components/` `psychology/` `motion/` `patterns/` `native/` |
| **2 · Loops** | Research → Wireframe → UI → Review → A11y → Perf → SEO → Refactor → Score | `loops/` |
| **3 · Motor de revisión** | Autoevaluación adversarial, 6 dimensiones, umbral duro de 95 | `scoring/` + `validators/` |
| **4 · Memoria** | 7 archivos por proyecto: cliente, marca, diseño, páginas, tareas, bugs, notas | `memory/` |
| **5 · Inteligencia sectorial** | 24 playbooks de industria con lenguajes visuales propios | `industries/` |

Más un **estudio de nueve agentes** (`agents/`): director creativo, investigador UX,
diseñador UI, ingeniero frontend, diseñador de motion, especialista en accesibilidad,
copywriter, SEO y un revisor adversarial con poder de veto.

---

## Inicio rápido

Un comando desde tu proyecto:

```bash
npx github:ardamoustafa1/DesignOS init --agents
```

Copia el sistema a `./DesignOS`, lo conecta a tu `CLAUDE.md` y registra los 9
especialistas como subagentes reales de Claude Code. Luego solo pide:

> *Diseña una página de precios para un SaaS de ciberseguridad. Tema oscuro.*

## Verlo para creerlo

La galería [`examples/`](examples/README.md) contiene cuatro páginas completas
producidas por el sistema — landing, dashboard, precios y docs — todas sobre un mismo
sistema de tokens. El rastro de decisiones está en el
[walkthrough](examples/saas-landing-walkthrough.md).

## Licencia

MIT — [LICENSE](LICENSE). Úsalo, haz fork, envíalo con tu producto.
