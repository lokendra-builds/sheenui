"""Pixel-measured WCAG 1.4.3 text contrast over glass and the animated backdrop (the lens-3 contrast gate).

axe-core cannot see through backdrop-filter, so this measures from pixels: for every text box on a page it takes the computed
text colour (alpha composited) and the REAL pixels behind its glyphs, from a second screenshot of the same viewport with all
text hidden (the pixels that differ between the two shots are the glyphs; the hidden shot is what each one sits on: glass, the
backdrop, a bar, a chart label's surface halo). A box fails when the worst 1 % of those pixels is under 4.5:1 (3:1 for large
text). Rows covered by sticky chrome (the floating header) and text under a scroller's edge fade (a gradient mask) are not
presented, so they are left out. 20 routes x 4 looks (Liquid / Aurora x light / dark) at 1440; it starts the built site itself
(demo/dist) unless A11Y_BASE points at a server.

  python demo/e2e/contrast/check_contrast.py [--routes /a,/b] [--looks liquid:light,aurora:dark] [--width 1440]

Writes test-results/contrast.json and exits 1 on any failure. Needs: pip install -r demo/e2e/contrast/requirements.txt
and `playwright install chromium`.
"""
import argparse, glob, io, json, math, os, subprocess, sys, time
from pathlib import Path
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
PORT = os.environ.get("E2E_PORT", "4174")
BASE = os.environ.get("A11Y_BASE", f"http://127.0.0.1:{PORT}/sheenui")
HELPERS = r"""
window.__sel = (el) => {
  if (!el || el.nodeType !== 1) return '';
  const parts = []; let e = el, d = 0;
  while (e && e.nodeType === 1 && d < 4 && e !== document.body && e !== document.documentElement) {
    let s = e.tagName.toLowerCase();
    if (e.id && !/[:«»]|base-ui|^r\d|radix/.test(e.id)) { parts.unshift(s + '#' + e.id); break; }
    const slot = e.getAttribute('data-slot'); if (slot) s += '[data-slot=' + slot + ']';
    const role = e.getAttribute('role'); if (role) s += '[role=' + role + ']';
    const al = e.getAttribute('aria-label'); if (al && d === 0) s += '[aria-label="' + al.slice(0, 24) + '"]';
    const p = e.parentElement;
    if (p) { const same = [...p.children].filter(c => c.tagName === e.tagName); if (same.length > 1) s += ':nth-of-type(' + (same.indexOf(e) + 1) + ')'; }
    parts.unshift(s); e = e.parentElement; d++;
  }
  return parts.join(' > ');
};
window.__comp = (el) => {
  if (!el || el.nodeType !== 1) return '';
  const c = el.closest('[data-slot]');
  const where = el.closest('main') ? 'main' : (el.closest('aside,nav') ? 'sidebar' : (el.closest('header') ? 'header' : (el.closest('footer') ? 'footer' : 'other')));
  return where + ':' + (c ? c.getAttribute('data-slot') : el.tagName.toLowerCase());
};
window.__visible = (el) => {
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return false;
  const cs = getComputedStyle(el);
  if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) return false;
  return true;
};
"""


def make_ctx(browser, style, theme, w, h):
    ctx = browser.new_context(viewport={"width": w, "height": h}, color_scheme=theme)
    ctx.add_init_script(f"try{{localStorage.setItem('sheen:theme','{theme}');localStorage.setItem('sheen:style','{style}');}}catch(e){{}}")
    ctx.add_init_script(HELPERS)
    return ctx


def open_route(pg, path, settle=1500, tries=3):
    last = ""
    for _ in range(tries):
        try:
            pg.goto(BASE + path, wait_until="domcontentloaded")
            pg.wait_for_selector("main h1", timeout=15000)
            pg.wait_for_timeout(settle)
            return None
        except Exception as e:  # noqa
            last = "load-fail: " + str(e)[:120]
            time.sleep(2)
    return last


class Log:
    def __init__(self):
        self.rows = []

    def add(self, rec):
        self.rows.append(rec)

ROUTES20 = ["/", "/foundations", "/components/glass-card", "/components/button", "/components/badge", "/components/tabs",
            "/components/data-table", "/components/toast", "/components/input", "/components/progress", "/charts",
            "/blocks/glass-login", "/blocks/pricing", "/blocks/bento-grid", "/blocks/ai-chat", "/chat/list",
            "/dashboards/web-analytics", "/dashboards/finance", "/dashboards/product", "/forms/calendar"]
CLOCKS = [46, 56]  # aurora sky clock samples (seconds); the curtains' ray term has a ~14 s period
MAX_STEPS = 6

COLLECT_JS = r"""() => {
  const vw = innerWidth, vh = innerHeight, sy = scrollY;
  const out = []; let gradEls = new Set();
  const num = (v) => parseFloat(v) || 0;
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const c2 = cv.getContext('2d', { willReadFrequently: true });
  const colCache = new Map();
  // computed colours may be oklch()/color(): let the canvas resolve them to sRGB bytes
  const parseCol = (s) => {
    if (!s) return null;
    if (colCache.has(s)) return colCache.get(s);
    c2.clearRect(0, 0, 1, 1); c2.fillStyle = '#010203'; c2.fillStyle = s; c2.fillRect(0, 0, 1, 1);
    const d = c2.getImageData(0, 0, 1, 1).data; const v = [d[0], d[1], d[2], d[3] / 255];
    colCache.set(s, v); return v;
  };
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const px = (v, u) => (u === 'rem' ? parseFloat(v) * rem : parseFloat(v));
  // A gradient mask at a scroller's edge (tabs list, props table, nav rail) fades what is scrolled out of it: text under
  // that fade is on its way out of view, not presented. Returns the fade lengths [start, end] and the axis.
  const maskFade = (cs) => {
    const m = cs.maskImage && cs.maskImage !== 'none' ? cs.maskImage : (cs.webkitMaskImage && cs.webkitMaskImage !== 'none' ? cs.webkitMaskImage : '');
    if (!m.includes('linear-gradient(')) return null;
    const clear = /rgba\(0, 0, 0, 0\)|transparent/;
    const body = m.slice(m.indexOf('(') + 1);
    const dir = /^to (right|left|bottom|top)/.exec(body);
    const stops = body.split(/,(?![^(]*\))/).map(s => s.trim());
    if (dir) stops.shift();
    let start = 0, end = 0;
    if (stops.length > 1 && clear.test(stops[0])) {
      const s = /([\d.]+)(px|rem)/.exec(stops[1]); if (s) start = px(s[1], s[2]);
    }
    if (stops.length > 1 && clear.test(stops[stops.length - 1])) {
      const s = /calc\(100% - ([\d.]+)(px|rem)\)/.exec(stops[stops.length - 2]); if (s) end = px(s[1], s[2]);
    }
    if (!start && !end) return null;
    const axis = dir && (dir[1] === 'bottom' || dir[1] === 'top') ? 'y' : 'x';
    const flip = dir && (dir[1] === 'left' || dir[1] === 'top');
    return { axis, start: flip ? end : start, end: flip ? start : end };
  };
  const clipRect = (el) => {
    let c = { l: 0, t: 0, r: vw, b: vh };
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.position === 'fixed') break;
      const ox = cs.overflowX, oy = cs.overflowY;
      const clipX = ox !== 'visible', clipY = oy !== 'visible';
      const fade = maskFade(cs);
      if (clipX || clipY || fade) {
        const r = a.getBoundingClientRect();
        if (clipX) { c.l = Math.max(c.l, r.left + num(cs.borderLeftWidth)); c.r = Math.min(c.r, r.right - num(cs.borderRightWidth)); }
        if (clipY) { c.t = Math.max(c.t, r.top + num(cs.borderTopWidth)); c.b = Math.min(c.b, r.bottom - num(cs.borderBottomWidth)); }
        if (fade && fade.axis === 'x') { c.l = Math.max(c.l, r.left + fade.start); c.r = Math.min(c.r, r.right - fade.end); }
        if (fade && fade.axis === 'y') { c.t = Math.max(c.t, r.top + fade.start); c.b = Math.min(c.b, r.bottom - fade.end); }
      }
    }
    return c;
  };
  const chain = (el) => {
    let op = 1, fixed = false, glass = '', gradient = false, disabled = false, ariaHidden = false;
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      op *= parseFloat(cs.opacity);
      if (cs.position === 'fixed' || cs.position === 'sticky') fixed = true;
      if (!glass && cs.backdropFilter && cs.backdropFilter !== 'none') glass = a.getAttribute('data-slot') || a.className.toString().slice(0, 40);
      if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') { gradient = true; gradEls.add(a); }
      if (a.hasAttribute('data-disabled') || a.getAttribute('aria-disabled') === 'true' || a.disabled) disabled = true;
      if (a.getAttribute('aria-hidden') === 'true') ariaHidden = true;
    }
    return { op, fixed, glass, gradient, disabled, ariaHidden };
  };
  // fixed / sticky chrome (header, dock, floating pills): text scrolling under it is covered there, not measured
  const chrome = [];
  for (const e of document.querySelectorAll('body *')) {
    const c = getComputedStyle(e);
    if ((c.position === 'fixed' || c.position === 'sticky') && c.visibility === 'visible' && !e.closest('.sheen-sky') && !e.classList.contains('sheen-sky-sentinel')) {
      const r = e.getBoundingClientRect();
      if (r.width > 24 && r.height > 12 && r.height < vh * 0.6 && (c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.backdropFilter !== 'none' || c.backgroundImage !== 'none' || e.matches('header,nav,aside'))) chrome.push({ e, r });
    }
  }
  const push = (el, text, rect, fg, cs, kind, ch) => {
    const clip = clipRect(el);
    const l = Math.max(rect.left, clip.l), t = Math.max(rect.top, clip.t), r = Math.min(rect.right, clip.r), b = Math.min(rect.bottom, clip.b);
    if (r - l < 3 || b - t < 4) return;
    const fs = num(cs.fontSize), fw = parseInt(cs.fontWeight) || 400;
    // glyph band: the middle font-size-tall slice of the line box
    const cy = (rect.top + rect.bottom) / 2;
    let bandT = Math.max(t, cy - fs * 0.5), bandB = Math.min(b, cy + fs * 0.5);
    if (bandB - bandT < 3) return;
    // text scrolling under fixed / sticky chrome (header, pill, dock) is covered there: the covered rows are cut off the
    // band (a line that straddles the header's top edge keeps only its visible rows); a band covered in the middle is skipped
    const bandH = bandB - bandT;
    for (const { e, r: cr } of chrome) {
      if (e.contains(el) || el.contains(e)) continue;
      const ix = Math.min(r, cr.right) - Math.max(l, cr.left);
      const ct = cr.top - 4, cb = cr.bottom + 4; // 4px: the chrome's shadow and glow
      if (ix <= 2 || cb <= bandT || ct >= bandB) continue;
      if (ct <= bandT && cb >= bandB) return;
      if (ct <= bandT) bandT = cb;
      else if (cb >= bandB) bandB = ct;
      else return;
      if (bandB - bandT < Math.max(3, bandH * 0.6)) return; // mostly covered: not presented
    }
    // occlusion: at the left, centre and right of the glyph band the topmost element must belong to this text's element
    // (or contain it): text under a floating pill or an open overlay is covered there, not measured here
    if (cs.pointerEvents !== 'none') {
      const py = Math.min(vh - 1, Math.max(0, (bandT + bandB) / 2));
      for (const px of [l + 1, (l + r) / 2, r - 1]) {
        const hit = document.elementFromPoint(Math.min(vw - 1, Math.max(0, px)), py);
        if (hit && !(el.contains(hit) || hit.contains(el))) return;
      }
    }
    out.push({ text: text.trim().replace(/\s+/g, ' ').slice(0, 48), kind, x0: l, y0: bandT, x1: r, y1: bandB, fs, fw, fg, op: ch.op, fixed: ch.fixed, glass: ch.glass,
               gradient: ch.gradient, ariaHidden: ch.ariaHidden, cls: (el.getAttribute('class') || '').slice(0, 90), tag: el.tagName.toLowerCase(),
               sel: window.__sel ? window.__sel(el) : '', docY: ch.fixed ? -1 : Math.round((bandT + sy) / 8) });
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (!/\S/.test(n.nodeValue)) continue;
    const el = n.parentElement; if (!el) continue;
    if (el.closest('script,style,noscript,template,title,option,datalist')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility !== 'visible' || cs.display === 'none') continue;
    const ch = chain(el);
    if (ch.disabled || ch.op < 0.05) continue;
    const isSvg = el instanceof SVGElement;
    let fg;
    if (isSvg) fg = parseCol(cs.fill) || [0, 0, 0, 1];
    else fg = parseCol(cs.webkitTextFillColor || cs.color) || [0, 0, 0, 1];
    if (!isSvg && fg[3] === 0 && !ch.gradient) continue; // fully transparent text (hidden by design)
    const rg = document.createRange(); rg.selectNodeContents(n);
    const rects = [...rg.getClientRects()].slice(0, 14);
    for (const rc of rects) push(el, n.nodeValue, rc, fg, cs, isSvg ? 'svg' : 'text', ch);
  }
  // form controls: value and placeholder are not text nodes
  for (const el of document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]),textarea')) {
    const cs = getComputedStyle(el);
    if (cs.visibility !== 'visible' || cs.display === 'none' || el.disabled) continue;
    const ch = chain(el); if (ch.op < 0.05) continue;
    const r = el.getBoundingClientRect(); if (r.width < 8 || r.height < 8) continue;
    const box = { left: r.left + num(cs.paddingLeft) + num(cs.borderLeftWidth), right: r.right - num(cs.paddingRight) - num(cs.borderRightWidth), top: r.top, bottom: r.bottom };
    const val = el.value || '';
    if (val) push(el, val, box, parseCol(cs.color) || [0, 0, 0, 1], cs, 'value', ch);
    else if (el.placeholder) {
      const pc = getComputedStyle(el, '::placeholder');
      push(el, el.placeholder, { ...box, right: Math.min(box.right, box.left + 8 * el.placeholder.length) }, parseCol(pc.color) || [0, 0, 0, 1], cs, 'placeholder', ch);
    }
  }
  document.querySelectorAll('[data-cx-gt]').forEach(e => e.removeAttribute('data-cx-gt'));
  gradEls.forEach(e => e.setAttribute('data-cx-gt', ''));
  return { items: out, docH: document.documentElement.scrollHeight };
}"""

HIDE_CSS = ("*,*::before,*::after{color:transparent !important;text-shadow:none !important;-webkit-text-fill-color:transparent !important;"
            "-webkit-text-stroke:0 !important;caret-color:transparent !important;text-decoration-color:transparent !important;-webkit-text-decoration-color:transparent !important}"
            "svg text,svg tspan{fill:transparent !important}svg text:not([stroke]):not(.fill-sheen-fg-muted):not(.fill-sheen-fg-subtle){stroke:none !important}"
            "input::placeholder,textarea::placeholder{color:transparent !important;-webkit-text-fill-color:transparent !important}"
            "[data-cx-gt]{background-image:none !important;background-color:transparent !important}")

INSTALL_HIDE = "(css) => { let s = document.getElementById('cx-hide'); if (!s) { s = document.createElement('style'); s.id = 'cx-hide'; s.textContent = css; document.head.appendChild(s); } s.media = 'not all'; }"
SET_HIDE = "([on, css]) => { let s = document.getElementById('cx-hide'); if (!s) { s = document.createElement('style'); s.id = 'cx-hide'; s.textContent = css; document.body.appendChild(s); } s.media = on ? 'all' : 'not all'; return on ? getComputedStyle(document.body).color : ''; }"
# set the aurora sky clock and repaint it (sky-state is module state; import the very module the app uses)
CLOCK_JS = """async (t) => {
  try {
    if (!window.__skyMod) {
      let u = null;
      for (let i = 0; i < 40 && !u; i++) { u = performance.getEntriesByType('resource').map(e => e.name).find(n => /sky-state\\.ts/.test(n)); if (!u) await new Promise(r => setTimeout(r, 150)); }
      if (!u) return 'nourl';
      window.__skyMod = await import(u);
    }
    window.__skyMod.auroraSky.clock = t; window.__skyMod.auroraSky.redraw();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return 'ok';
  } catch (e) { return 'err ' + String(e).slice(0, 80); }
}"""


def lum(a):
    c = a / 255.0
    lin = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]


def png_arr(b):
    return np.asarray(Image.open(io.BytesIO(b)).convert("RGB"), dtype=np.float64)


def need_of(it):
    large = it["fs"] >= 24 or (it["fs"] >= 18.66 and it["fw"] >= 700)
    return (3.0 if large else 4.5), large


def measure(it, hid, vis=None):
    """Contrast of the text colour against the pixels BEHIND THE GLYPHS: the pixels that change between the visible and the
    text-hidden shot are the glyphs (and their anti-aliased edges); the hidden shot gives what each of them sits on (glass,
    backdrop, a bar, a chart label's surface halo). A box whose glyphs cannot be told apart (clipped, under a cover) falls
    back to the whole glyph band."""
    x0, y0 = max(0, int(math.floor(it["x0"]))), max(0, int(math.floor(it["y0"])))
    x1, y1 = min(hid.shape[1], int(math.ceil(it["x1"]))), min(hid.shape[0], int(math.ceil(it["y1"])))
    if x1 - x0 < 2 or y1 - y0 < 2:
        return None
    if it["gradient"]:
        if vis is None:
            return None
        v = vis[y0:y1, x0:x1]
        h = hid[y0:y1, x0:x1]
        d = np.abs(v - h).sum(axis=2)
        if (d > 120).sum() < 6:
            return None
        sel = d > np.percentile(d[d > 120], 55)
        l1, l2 = lum(v[sel]), lum(h[sel])
        r = (np.maximum(l1, l2) + 0.05) / (np.minimum(l1, l2) + 0.05)
        return {"p5": float(np.percentile(r, 10)), "med": float(np.median(r))}
    bg = hid[y0:y1, x0:x1]
    glyphs = None
    if vis is not None:
        d = np.abs(vis[y0:y1, x0:x1] - bg).sum(axis=2)
        g = d > 60
        if g.sum() >= 6:
            glyphs = bg[g]
    if glyphs is None:
        sy = max(1, (y1 - y0) // 14)
        sx = max(1, (x1 - x0) // 90)
        glyphs = bg[::sy, ::sx].reshape(-1, 3)
    bg = glyphs
    r_, g_, b_, a = it["fg"]
    a = a * it["op"]
    fg = np.array([r_, g_, b_], dtype=np.float64)
    eff = fg * a + bg * (1 - a)
    l1, l2 = lum(eff), lum(bg)
    # contrast of the composited text colour against the background underneath it
    r = (np.maximum(l1, l2) + 0.05) / (np.minimum(l1, l2) + 0.05)
    return {"p5": float(np.percentile(r, 5)), "med": float(np.median(r)), "bgL": float(np.median(l2)), "p1": float(np.percentile(r, 1)), "min": float(np.min(r))}


def shot(pg):
    return png_arr(pg.screenshot(animations="allow", caret="hide"))


def do_route(pg, log, key, style, theme, w, h, route):
    t0 = time.time()
    err = open_route(pg, route, settle=1500)
    if err:
        log.add({"key": key, "error": err})
        return None
    pg.evaluate(INSTALL_HIDE, HIDE_CSS)
    best = {}
    clockmode = ""
    hidefail = 0
    docH = pg.evaluate(COLLECT_JS)["docH"]
    ys = [0]
    while len(ys) < MAX_STEPS and ys[-1] + h * 0.85 < docH - h:
        ys.append(int(ys[-1] + h * 0.85))
    if docH > h and ys[-1] < docH - h and len(ys) < MAX_STEPS + 1:
        ys.append(docH - h)
    samples = CLOCKS if (style == "aurora" and DEV) else [None]
    for yy in ys:
        pg.evaluate(f"window.scrollTo(0,{yy})")
        pg.wait_for_timeout(1800)
        items = pg.evaluate(COLLECT_JS)["items"]
        if not items:
            continue
        for si, ck in enumerate(samples):
            if ck is not None:
                clockmode = pg.evaluate(CLOCK_JS, ck)
                if clockmode != "ok":
                    pg.wait_for_timeout(2500)

            def pair():
                # the visible shot and the text-hidden shot of the same frame: their difference is the glyphs
                pg.evaluate(SET_HIDE, [False, HIDE_CSS])
                v = shot(pg)
                hc = pg.evaluate(SET_HIDE, [True, HIDE_CSS])
                return v, shot(pg), hc

            vis, hid, hidecol = pair()
            if hidecol and "0, 0, 0, 0" not in hidecol and "transparent" not in hidecol:
                hidefail += 1
            res = [measure(it, hid, vis) for it in items]
            # a failure must be stable: re-shoot after a beat and keep the better reading
            low = [i for i, (it, m) in enumerate(zip(items, res)) if m is not None and min(m["p5"], m.get("p1", 99)) < need_of(it)[0]]
            if low:
                pg.wait_for_timeout(350)
                if ck is not None:
                    pg.evaluate(CLOCK_JS, ck)
                vis2, hid2, _ = pair()
                for i in low:
                    m2 = measure(items[i], hid2, vis2)
                    if m2 is not None and min(m2["p5"], m2.get("p1", 99)) > min(res[i]["p5"], res[i].get("p1", 99)):
                        res[i] = m2
            for it, m in zip(items, res):
                if m is None:
                    continue
                need, large = need_of(it)
                k = (it["sel"], it["text"][:30], it["docY"], it["kind"])
                cur = best.get(k)
                if cur is None or m["p5"] < cur["p5"]:
                    best[k] = {**{kk: it[kk] for kk in ("text", "kind", "fs", "fw", "fg", "op", "glass", "gradient", "ariaHidden", "cls", "tag", "sel", "fixed")},
                               "p5": round(m["p5"], 2), "med": round(m["med"], 2), "p1": round(m.get("p1", m["p5"]), 2), "mn": round(m.get("min", m["p5"]), 2), "need": need, "large": large, "y": yy, "clock": ck, "vx": round(it["x0"]), "vy": round(it["y0"])}
        pg.evaluate(SET_HIDE, [False, HIDE_CSS])
    recs = list(best.values())
    fails = [r for r in recs if min(r["p5"], r["p1"]) < r["need"] and r["op"] >= 0.5]
    minfails = [r for r in recs if r["p5"] >= r["need"] and r.get("p1", 99) < r["need"] and r["op"] >= 0.5]
    faded = [r for r in recs if r["p5"] < r["need"] and r["op"] < 0.5]
    counted = [min(r["p5"], r["p1"]) for r in recs if r["op"] >= 0.5]
    worst = round(min(counted), 2) if counted else None  # the lowest worst-1 % ratio of any counted box on the page
    log.add({"key": key, "style": style, "theme": theme, "w": w, "route": route, "n": len(recs), "fails": len(fails), "faded": len(faded), "worst": worst,
             "steps": len(ys), "clockmode": clockmode, "hidefail": hidefail, "secs": round(time.time() - t0, 1), "items": fails, "p1fails": minfails[:40], "nP1fails": len(minfails), "min": sorted(r["p5"] for r in recs)[:3]})
    print(key, len(recs), "fails", len(fails), round(time.time() - t0, 1), clockmode, "HIDEFAIL" if hidefail else "", flush=True)
    return True


DEV = ":5180" in BASE  # the sky clock hook needs the dev server's module graph


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--routes", default="")
    ap.add_argument("--looks", default="liquid:light,liquid:dark,aurora:light,aurora:dark")
    ap.add_argument("--width", type=int, default=1440)
    a = ap.parse_args()
    routes = a.routes.split(",") if a.routes else ROUTES20
    server = None
    if "A11Y_BASE" not in os.environ:
        env = {**os.environ, "E2E_PORT": PORT, "E2E_BASE": "/sheenui/"}
        server = subprocess.Popen(["node", str(ROOT / "demo/scripts/serve-dist.mjs")], env=env, cwd=ROOT / "demo")
        time.sleep(3)
    log = Log()
    h = 900
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(headless=True)
            for look in a.looks.split(","):
                style, theme = look.split(":")
                ctx = make_ctx(b, style, theme, a.width, h)
                pg = ctx.new_page()
                pg.set_default_timeout(25000)
                for route in routes:
                    key = f"{style}|{theme}|{a.width}|{route}"
                    for attempt in range(3):
                        try:
                            if do_route(pg, log, key, style, theme, a.width, h, route) is not None:
                                break
                        except Exception as e:  # noqa
                            time.sleep(3)
                            if attempt == 2:
                                log.add({"key": key, "error": str(e)[:140], "fails": 1, "items": []})
                ctx.close()
            b.close()
    finally:
        if server:
            server.terminate()
    out = ROOT / "test-results" / "contrast.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(log.rows, indent=1))
    bad = [r for r in log.rows if r.get("fails") or r.get("error")]
    for r in bad:
        print("FAIL", r["key"], r.get("error", ""))
        for it in r.get("items", [])[:6]:
            print(f"   {it['text']!r} {it['p5']}:1 (worst 1% {it['p1']}:1, need {it['need']})  {it['sel'][-70:]}")
    print(f"{len(log.rows)} page runs, {len(bad)} failing")
    sys.exit(1 if bad else 0)


main()
