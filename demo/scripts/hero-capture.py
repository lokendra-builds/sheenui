"""Records screenshots/hero.webp and hero.gif: the home intro, a scroll to the component wall, then the style morph.

    python demo/scripts/hero-capture.py [--base http://localhost:5180/sheenui]

Frames come from the Chrome screencast (about 57 fps) into a temp folder, are resampled (15 fps WebP, 12 fps 256-colour GIF under 8 MB), then written next to the stills. Needs Python Playwright + Pillow.
"""
import argparse, base64, json, os, tempfile
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("--base", default="http://localhost:5180/sheenui")
args = ap.parse_args()
OUTDIR = Path(__file__).resolve().parents[2] / "screenshots"
FR = tempfile.mkdtemp(prefix="sheen-hero-")
frames = []
with sync_playwright() as p:
    b=p.chromium.launch(channel="chrome")
    ctx=b.new_context(viewport={"width":1200,"height":750},device_scale_factor=1,reduced_motion="no-preference")
    ctx.add_init_script("try{localStorage.setItem('sheen:style','liquid');localStorage.setItem('sheen:theme','dark')}catch(e){}")
    pg=ctx.new_page()
    cdp=ctx.new_cdp_session(pg)
    def on_frame(ev):
        frames.append((ev["metadata"]["timestamp"],ev["data"]))
        try: cdp.send("Page.screencastFrameAck",{"sessionId":ev["sessionId"]})
        except Exception: pass
    cdp.on("Page.screencastFrame",on_frame)
    pg.goto(args.base + "/",wait_until="commit")
    pg.evaluate("document.fonts.ready")
    pg.wait_for_selector(".home-h1")
    cdp.send("Page.startScreencast",{"format":"jpeg","quality":88,"maxWidth":1200,"maxHeight":750,"everyNthFrame":1})
    pg.wait_for_timeout(2800)
    def scroll_to(sel,frac,steps,ms):
        y1=pg.evaluate("""([sel,frac])=>{const el=document.querySelector(sel);const r=el.getBoundingClientRect();const vh=innerHeight;
          const top=vh*0.8+(vh*0.4-r.height-vh*0.8)*frac;return scrollY+r.top-top}""",[sel,frac])
        y0=pg.evaluate("scrollY")
        for i in range(1,steps+1):
            t=i/steps; e=t*t*(3-2*t)
            pg.evaluate("y=>scrollTo(0,y)",y0+(y1-y0)*e); pg.wait_for_timeout(ms)
    scroll_to(".home-wall",0.3,50,20); pg.wait_for_timeout(1300)
    scroll_to(".home-morph",0.1,50,20); pg.wait_for_timeout(200)
    scroll_to(".home-morph",0.85,60,30); pg.wait_for_timeout(500)
    cdp.send("Page.stopScreencast")
    ctx.close(); b.close()
t0=frames[0][0]
meta=[]
for i,(t,d) in enumerate(frames):
    open(f"{FR}/f{i:04d}.jpg","wb").write(base64.b64decode(d)); meta.append(t-t0)
json.dump(meta,open(FR+"/times.json","w"))
print(len(frames),meta[-1])

t = json.load(open(FR + "/times.json"))
segs = [(0, 1.8), (2.9, 9.0)]  # skip the idle gap after the intro


def pick(fps):
    src = []
    for a, b in segs:
        k = a
        while k < b:
            src.append(min(range(len(t)), key=lambda j: abs(t[j] - k)))
            k += 1 / fps
    return [Image.open(f"{FR}/f{i:04d}.jpg").convert("RGB") for i in src]


ims = pick(15)
d = [1000 // 15] * len(ims); d[-1] = 900
ims[0].save(OUTDIR / "hero.webp", save_all=True, append_images=ims[1:], duration=d, loop=0, quality=62, method=5)
# GIF: 12 fps, 1000 px wide, one shared 256-colour palette from eight sample frames, no dithering (dithering
# defeats the frame diffing and made the file about 16 MB; this keeps it under 8 MB). Tail trimmed to 8.0 s.
segs = [(0, 1.8), (2.9, 8.0)]
ims = [im.resize((1000, 625), Image.LANCZOS) for im in pick(12)]
samp = Image.new("RGB", (1000, 625 * 8))
for n in range(8): samp.paste(ims[n * (len(ims) - 1) // 7], (0, 625 * n))
pal = samp.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
q = [im.quantize(palette=pal, dither=Image.Dither.NONE) for im in ims]
d = [1000 // 12] * len(q); d[-1] = 900
q[0].save(OUTDIR / "hero.gif", save_all=True, append_images=q[1:], duration=d, loop=0, optimize=True)
for f in ("hero.webp", "hero.gif"): print(f, round(os.path.getsize(OUTDIR / f) / 1048576, 2), "MB")
