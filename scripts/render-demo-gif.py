#!/usr/bin/env python3
"""
Render press/demo.gif from the deterministic terminal transcript.

This is a maintainer asset script, not a runtime dependency. It uses Pillow when
available and leaves the zero-dependency CLI untouched.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "press" / "demo.gif"

W, H = 960, 540
BG = "#0b0f14"
PANEL = "#111827"
PANEL_EDGE = "#1f2937"
TEXT = "#d1d5db"
MUTED = "#8b949e"
GREEN = "#10b981"
CYAN = "#67e8f9"
YELLOW = "#fbbf24"
RED = "#fb7185"

LINES = [
    ("$ ", "Design a pricing page for a cybersecurity SaaS. Dark theme.", TEXT),
    ("DesignOS ", "kernel v2.0.2 booting...", GREEN),
    ("route ", "patterns/pricing.md + industries/cybersecurity.md + components/cards.md", CYAN),
    ("load ", "memory/brand.md + memory/design.md + memory/pages.md", CYAN),
    ("loop ", "research -> wireframe -> ui -> review -> a11y -> perf -> seo", TEXT),
    ("review ", "UI Craft 91: pricing cards lack hierarchy; redo required", YELLOW),
    ("fix ", "tightened tier contrast, clearer primary CTA, removed unverified metric", GREEN),
    ("a11y ", "body contrast 4.2:1 failed; raised muted text to 6.28:1", RED),
    ("score ", "UI 96 · UX 97 · A11y 96 · Perf 97 · Modernity 96 · Conversion 95", GREEN),
    ("ship ", "all gates >= 95; decision log written to memory/design.md", GREEN),
    ("open ", "examples/showcase-relay-pricing.html", CYAN),
]


def font(size: int) -> ImageFont.FreeTypeFont:
    for path in (
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Menlo.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    ):
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            pass
    return ImageFont.load_default()


FONT = font(22)
FONT_BOLD = font(22)
TITLE = font(18)


def draw_frame(visible_lines: int, cursor: bool) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((38, 34, W - 38, H - 34), radius=18, fill=PANEL, outline=PANEL_EDGE, width=2)
    d.ellipse((64, 58, 76, 70), fill="#ef4444")
    d.ellipse((86, 58, 98, 70), fill="#f59e0b")
    d.ellipse((108, 58, 120, 70), fill="#22c55e")
    d.text((142, 53), "DesignOS launch demo", font=TITLE, fill=MUTED)

    x0, y = 72, 108
    line_h = 34
    for label, body, color in LINES[:visible_lines]:
        d.text((x0, y), label, font=FONT_BOLD, fill=color)
        lx = x0 + int(d.textlength(label, font=FONT_BOLD))
        d.text((lx, y), body, font=FONT, fill=TEXT)
        y += line_h
    if cursor:
        d.rectangle((x0, y + 4, x0 + 14, y + 28), fill=GREEN)
    return img


def main() -> None:
    frames = []
    durations = []
    for i in range(1, len(LINES) + 1):
        frames.append(draw_frame(i, True))
        durations.append(520)
        frames.append(draw_frame(i, False))
        durations.append(180)
    frames.extend([draw_frame(len(LINES), bool(i % 2)) for i in range(6)])
    durations.extend([220] * 6)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        OUT,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=True,
    )
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
