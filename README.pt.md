<div align="center">

# ⬡ DesignOS

**O Sistema Operacional de Inteligência de Design para Agentes de IA**

*Claude, Fable, Cursor, Copilot — qualquer agente. Entra um prompt, sai UI nível Stripe.*

[English](README.md) · [Türkçe](README.tr.md) · [中文](README.zh.md) · [Español](README.es.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Français](README.fr.md)

</div>

---

## O problema

Agentes de IA escrevem código impecável e ainda assim entregam interfaces de 2015:
espaçamento sufocado, cinco CTAs competindo, falhas de contraste cinza-sobre-cinza.
Não falta capacidade — faltam **critério, processo e um limiar de qualidade**.

## A resposta

DesignOS não é um pacote de prompts: é um **sistema operacional** que o agente inicializa:

```
Você digita:  "Crie uma landing page SaaS nível Stripe."

DesignOS:     inicializa o kernel → roteia para os módulos certos → carrega regras do setor
              → executa o Design Loop → se autoavalia em 6 dimensões
              → refaz tudo que ficar abaixo de 95 → grava as decisões na memória
```

O agente para de pensar *"vou fazer um botão"* e começa a pensar: *"onde cai a atenção?
o CTA está ganhando? a Apple cortaria esse elemento por completo?"*

---

## As cinco camadas

| Camada | O que faz | Onde |
|---|---|---|
| **1 · Conhecimento** | 60+ módulos opinativos — fundamentos, 20 componentes, 8 de psicologia, motion, 12 padrões | `foundations/` `components/` `psychology/` `motion/` `patterns/` `native/` |
| **2 · Loops** | Research → Wireframe → UI → Review → A11y → Perf → SEO → Refactor → Score | `loops/` |
| **3 · Motor de revisão** | Autoavaliação adversarial, 6 dimensões, limiar rígido de 95 | `scoring/` + `validators/` |
| **4 · Memória** | 7 arquivos por projeto: cliente, marca, design, páginas, tarefas, bugs, notas | `memory/` |
| **5 · Inteligência setorial** | 24 playbooks de indústria com linguagens visuais próprias | `industries/` |

Mais um **estúdio de nove agentes** (`agents/`): diretor criativo, pesquisador UX,
designer UI, engenheiro frontend, motion designer, especialista em acessibilidade,
copywriter, SEO — e um revisor adversarial com poder de veto.

---

## Início rápido

Um comando a partir do seu projeto:

```bash
npx github:<you>/DesignOS init --agents --skills
```

O sistema é copiado para `./DesignOS`, conectado ao seu `CLAUDE.md`, e os 9
especialistas são registrados como subagentes reais do Claude Code. Depois é só pedir:

> *Crie uma página de preços para um SaaS de cibersegurança. Tema escuro.*

## Ver para crer

A galeria [`examples/`](examples/README.md) contém quatro páginas completas produzidas
pelo sistema — landing, dashboard, preços e docs — sobre um único sistema de tokens.
A trilha de decisões está no [walkthrough](examples/saas-landing-walkthrough.md).

## Licença

MIT — [LICENSE](LICENSE). Use, faça fork, envie com o seu produto.
