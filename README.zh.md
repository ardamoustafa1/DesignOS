<div align="center">

# ⬡ DesignOS

**面向 AI 编码智能体的设计智能操作系统**

*Claude、Fable、Cursor、Copilot —— 任何智能体。输入一句提示，输出 Stripe 级别的 UI。*

[English](README.md) · [Türkçe](README.tr.md) · [Español](README.es.md)

</div>

---

## 问题

AI 智能体能写出无懈可击的代码，却仍然产出 2015 年水准的界面：拥挤的间距、五个互相
竞争的 CTA、灰上加灰的对比度失败。缺的不是能力——缺的是**品味、流程和质量门槛**。

## 答案

DesignOS 不是提示词合集，而是智能体启动加载的**操作系统**：

```
你输入：   "设计一个 Stripe 级别的 SaaS 落地页。"

DesignOS： 启动内核 → 路由到对应模块 → 加载行业规则
           → 运行设计循环 → 六个维度自我评分
           → 低于 95 分的全部重做 → 把决策写入记忆
```

智能体不再想"我来做个按钮"，而是开始想："注意力落在哪里？CTA 是否足够突出？
Apple 会不会直接删掉这个元素？"

---

## 五层架构

| 层 | 作用 | 位置 |
|---|---|---|
| **1 · 知识** | 60+ 个观点鲜明的模块——基础、20 个组件、8 个心理学、动效、12 个模式 | `foundations/` `components/` `psychology/` `motion/` `patterns/` `native/` |
| **2 · 循环** | 调研 → 线框 → UI → 评审 → 无障碍 → 性能 → SEO → 重构 → 评分 | `loops/` |
| **3 · 评审引擎** | 对抗式自我评分，6 个维度，95 分硬门槛 | `scoring/` + `validators/` |
| **4 · 记忆** | 每个项目 7 个文件：客户、品牌、设计、页面、待办、缺陷、笔记 | `memory/` |
| **5 · 行业智能** | 24 份行业手册，各有独立的视觉语言 | `industries/` |

外加 **九人智能体工作室**（`agents/`）：创意总监、UX 研究员、UI 设计师、前端工程师、
动效设计师、无障碍专家、文案、SEO，以及拥有否决权的对抗式评审员。

---

## 快速开始

在项目目录中一条命令：

```bash
npx github:<you>/DesignOS init --agents
```

系统复制到 `./DesignOS`，自动接入 `CLAUDE.md`，九位专家注册为真正的 Claude Code
子智能体。然后直接提需求：

> *为一家网络安全 SaaS 设计定价页，深色主题。*

## 眼见为实

[`examples/`](examples/README.md) 画廊包含系统产出的四个完整页面——落地页、仪表盘、
定价页、文档——全部共享同一套设计令牌。决策全过程记录在
[walkthrough](examples/saas-landing-walkthrough.md) 中。

## 许可证

MIT — [LICENSE](LICENSE)。使用、fork、随产品发布。
