"""Reproduces the public screenshots/ folder (WebP, 1440x900 @2x) from a running dev or preview server.

    python demo/scripts/screenshots.py [--base http://localhost:5180/sheenui] [--out screenshots] [--only name,name]

Needs Python Playwright + Pillow and Chrome. The looks are set through localStorage (sheen:style, sheen:theme)
before the page loads, as the site's own preference script reads them.
"""
import argparse, io, sys, time
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("--base", default="http://localhost:5180/sheenui")
ap.add_argument("--out", default=str(Path(__file__).resolve().parents[2] / "screenshots"))
ap.add_argument("--only", default="")
args = ap.parse_args()
OUT = Path(args.out); OUT.mkdir(exist_ok=True)
only = set(filter(None, args.only.split(",")))

# (file name, route, style, theme, mode, width)
SHOTS = [
    ("home-liquid-dark", "/", "liquid", "dark", "hero", 1440),
    ("home-aurora-light", "/", "aurora", "light", "hero", 1440),
    ("home-liquid-light", "/", "liquid", "light", "hero", 1440),
    ("home-aurora-dark", "/", "aurora", "dark", "hero", 1440),
    ("home-wall-liquid-dark", "/", "liquid", "dark", "wall", 1440),
    ("home-morph-liquid-dark", "/", "liquid", "dark", "morph", 1440),
    ("components-liquid-dark", "/components", "liquid", "dark", "page", 1440),
    ("dashboards-saas-liquid-dark", "/dashboards/saas", "liquid", "dark", "page", 1440),
    ("charts-line-chart-aurora-dark", "/charts/line-chart", "aurora", "dark", "page", 1440),
    ("charts-heatmap-liquid-light", "/charts/heatmap", "liquid", "light", "page", 1440),
    ("chat-thread-aurora-dark", "/chat/thread", "aurora", "dark", "page", 1440),
    ("components-glass-card-liquid-dark", "/components/glass-card", "liquid", "dark", "page", 1440),
    ("blocks-pricing-aurora-light", "/blocks/pricing", "aurora", "light", "page", 1440),
    ("404-liquid-dark", "/no-such-page", "liquid", "dark", "page", 1440),
    ("search-liquid-dark", "/components", "liquid", "dark", "search", 1440),
    ("home-liquid-dark-390", "/", "liquid", "dark", "hero", 390),
    ("home-aurora-light-390", "/", "aurora", "light", "hero", 390),
    ("dashboards-saas-liquid-dark-390", "/dashboards/saas", "liquid", "dark", "page", 390),
    ("dashboards-saas-aurora-light-390", "/dashboards/saas", "aurora", "light", "page", 390),
]

# Docs pages open on the intro; scroll down to the live demo before shooting (desktop only).
SCROLL = {"dashboards-saas-liquid-dark": 560, "charts-line-chart-aurora-dark": 330, "charts-heatmap-liquid-light": 330,
          "chat-thread-aurora-dark": 330, "components-glass-card-liquid-dark": 330, "blocks-pricing-aurora-light": 330}

def scroll_to(page, selector, frac):
    """Scroll so the section is `frac` of the way through the morph/wall travel."""
    page.evaluate("""([sel, frac]) => {
      const el = document.querySelector(sel); const r = el.getBoundingClientRect(); const vh = innerHeight;
      const startTop = vh * 0.8, endTop = vh * 0.4 - r.height; // section top when progress 0 / 1
      const top = startTop + (endTop - startTop) * frac;
      scrollTo(0, scrollY + r.top - top);
    }""", [selector, frac])

def settle(page, ms):
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(ms)

def check_clean(page, name):
    bad = page.evaluate("""() => !!document.querySelector('vite-error-overlay, nextjs-portal, #webpack-dev-server-client-overlay')""")
    if bad: raise SystemExit(f"{name}: dev error overlay present")

def save(png: bytes, path: Path, width):
    img = Image.open(io.BytesIO(png)).convert("RGB")
    q = 85
    while True:
        img.save(path, "WEBP", quality=q, method=6)
        if path.stat().st_size <= 400 * 1024 or q <= 60: break
        q -= 5
    return path.stat().st_size // 1024

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    for name, route, style, theme, mode, width in SHOTS:
        if only and name not in only: continue
        mobile = width < 600
        ctx = browser.new_context(
            viewport={"width": width, "height": 844 if mobile else 900},
            device_scale_factor=2, reduced_motion="no-preference", is_mobile=mobile, has_touch=mobile,
            color_scheme=theme)
        ctx.add_init_script(f"try{{localStorage.setItem('sheen:style','{style}');localStorage.setItem('sheen:theme','{theme}')}}catch(e){{}}")
        page = ctx.new_page()
        page.goto(args.base + route, wait_until="load")
        settle(page, 4200 if mode == "hero" else 2800)
        if mode == "wall":
            scroll_to(page, ".home-wall", 0.35); settle(page, 3000)
        elif mode == "morph":
            scroll_to(page, ".home-morph", 0.5); settle(page, 3500)
        elif mode == "search":
            page.keyboard.press("Control+k"); settle(page, 700)
            page.keyboard.type("glass", delay=60); settle(page, 1200)
        elif mode == "page" and not mobile:
            if name in SCROLL:
                page.evaluate("y => scrollTo(0, y)", SCROLL[name]); settle(page, 2500)
            page.mouse.move(width / 2, 450); settle(page, 800)
        check_clean(page, name)
        png = page.screenshot(type="png")
        kb = save(png, OUT / f"{name}.webp", width)
        print(f"{name}.webp {kb} KB", flush=True)
        ctx.close()
        time.sleep(1)
    if not only or "hero" in only:
        # hero.png: a 1920 x 1200 viewport at 1x, wide enough that every floating card sits inside the frame
        ctx = browser.new_context(viewport={"width": 1920, "height": 1200}, device_scale_factor=1, color_scheme="dark")
        ctx.add_init_script("try{localStorage.setItem('sheen:style','liquid');localStorage.setItem('sheen:theme','dark')}catch(e){}")
        page = ctx.new_page()
        page.goto(args.base + "/", wait_until="load"); settle(page, 4500); check_clean(page, "hero")
        img = Image.open(io.BytesIO(page.screenshot(type="png"))).convert("RGB")
        img.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(OUT / "hero.png", optimize=True)
        print("hero.png", (OUT / "hero.png").stat().st_size // 1024, "KB")
        ctx.close()
    browser.close()
