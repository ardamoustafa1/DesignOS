<div align="center">

# ⬡ DesignOS

**AI Kodlama Ajanları için Tasarım Zekâsı İşletim Sistemi**

*Claude, Fable, Cursor, Copilot — herhangi bir ajan. Bir prompt girer, Stripe kalitesinde UI çıkar.*

[English](README.md) · [Başlangıç](GETTING-STARTED.md) · [Mimari](ARCHITECTURE.md)

</div>

---

## Sorun

AI ajanları kusursuz kod yazarken hâlâ 2015'ten kalma arayüzler üretiyor: sıkışık
boşluklar, birbirleriyle yarışan beş CTA, griyle gri kontrast hataları. Eksik olan
yetenek değil — **zevk, süreç ve kalite kapısı.**

## Cevap

DesignOS bir "prompt paketi" değil; ajanın içine boot ettiği bir **işletim sistemi**:

```
Sen yazarsın:  "Stripe seviyesinde bir SaaS landing page tasarla."

DesignOS:      kernel'i başlatır → doğru modülleri yönlendirir → sektör kurallarını yükler
               → Design Loop'u çalıştırır → 6 boyutta kendine puan verir
               → 95 altındaki her şeyi yeniden yapar → kararları hafızaya yazar
```

Ajan "bir buton yapayım" diye düşünmeyi bırakır; "dikkat nereye düşüyor, CTA kazanıyor
mu, Apple bu elemanı tamamen siler miydi?" diye düşünmeye başlar.

---

## Beş Katman

| Katman | Ne yapar | Nerede |
|---|---|---|
| **1 · Bilgi** | 50+ görüşlü modül — temeller, 20 komponent, 8 psikoloji, motion, 10 pattern | `foundations/` `components/` `psychology/` `motion/` `patterns/` |
| **2 · Loop'lar** | Research → Wireframe → UI → Review → A11y → Perf → SEO → Refactor → Score | `loops/` |
| **3 · Review Engine** | Düşmanca öz-puanlama, 6 boyut, katı 95 eşiği | `scoring/` |
| **4 · Hafıza** | Proje başına 7 dosya: client, brand, design, pages, todo, bugs, notes | `memory/` |
| **5 · Sektör Zekâsı** | 20+ sektör playbook'u, her birinin ayrı görsel dili | `industries/` |

Artı **9 kişilik ajan stüdyosu** (`agents/`): kreatif direktör, UX araştırmacısı, UI
tasarımcısı, frontend mühendisi, motion tasarımcısı, erişilebilirlik uzmanı, metin
yazarı, SEO ve veto yetkili düşman reviewer.

---

## Hızlı Başlangıç

Proje dizininden tek komut:

```bash
npx github:<sen>/DesignOS init --agents
```

Sistem `./DesignOS`'a kopyalanır, `CLAUDE.md`'ne import eklenir ve 9 uzman gerçek
Claude Code subagent'ı olarak kaydedilir. Sonra sadece iste:

> *Siber güvenlik SaaS'ı için pricing sayfası tasarla. Koyu tema.*

Ajan DesignOS'u boot eder, `industries/cybersecurity.md` + `patterns/pricing.md`'yi
yükler, loop'u çalıştırır ve 95 altında puan alan hiçbir şeyi eline vermez.

---

## Görerek İkna Ol

[`examples/`](examples/README.md) galerisi sistemin ürettiği dört tam sayfayı içerir —
landing, dashboard, pricing ve docs; hepsi tek token sistemiyle, karar izleri
[walkthrough](examples/saas-landing-walkthrough.md) dosyasında.

## Katkı

[CONTRIBUTING.md](CONTRIBUTING.md) — kurallara katkının kuralları. Yol haritası:
[ROADMAP.md](ROADMAP.md).

## Lisans

MIT — [LICENSE](LICENSE). Kullan, forkla, ürününle gönder.
