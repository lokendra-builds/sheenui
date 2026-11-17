"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useScroll } from "motion/react";

import { clamp } from "../../lib/math";
import { addAmbient, markScrolling } from "../../motion/beat";
import { sheenPointer } from "../../motion/pointer-light";
import { auroraSky } from "./sky-state";

/**
 * Aurora Neon sky (lazy): a low-res OPAQUE canvas of light curtains, upscaled (the bilinear
 * stretch is the blur), with a dawn sweep on first sight, a lift under the pointer and a
 * reflection into a registered floor canvas (registerAuroraFloor). One frame per beat (~30 fps,
 * 20 in Lite), only while `active`; otherwise one still frame of the fully risen sky.
 */

type Theme = "light" | "dark";
const TAU = Math.PI * 2;
const DAWN_MS = 2400;
const clamp01 = (v: number) => clamp(v, 0, 1);

type Curtain = {
  y: number;
  slope: number;
  amp: number;
  freq: number;
  speed: number;
  h: number;
  phase: number;
  x0: number;
  x1: number;
  alpha: number;
  rays: number;
  stops: [number, string][];
};

const CURTAINS: Record<Theme, { composite: GlobalCompositeOperation; curtains: Curtain[] }> = {
  dark: {
    composite: "lighter",
    curtains: [
      {
        y: 0.52,
        slope: -0.26,
        amp: 0.07,
        freq: 0.85,
        speed: 0.12,
        h: 0.6,
        phase: 0,
        x0: -0.08,
        x1: 1.08,
        alpha: 1,
        rays: 1,
        stops: [
          [0, "rgba(150,90,255,0)"],
          [0.28, "rgba(150,90,255,0.22)"],
          [0.6, "rgba(118,92,255,0.55)"],
          [0.82, "rgba(60,160,255,0.82)"],
          [0.905, "rgba(44,236,245,1)"],
          [0.945, "rgba(215,254,255,1)"],
          [0.972, "rgba(44,236,245,0.55)"],
          [1, "rgba(44,236,245,0)"],
        ],
      },
      {
        y: 0.36,
        slope: 0.16,
        amp: 0.06,
        freq: 1.25,
        speed: -0.09,
        h: 0.44,
        phase: 2.1,
        x0: 0.16,
        x1: 1.12,
        alpha: 0.92,
        rays: 1,
        stops: [
          [0, "rgba(255,41,189,0)"],
          [0.4, "rgba(255,41,189,0.3)"],
          [0.78, "rgba(220,60,235,0.8)"],
          [0.92, "rgba(255,217,245,1)"],
          [0.965, "rgba(255,41,189,0.45)"],
          [1, "rgba(190,70,255,0)"],
        ],
      },
      {
        y: 0.46,
        slope: -0.18,
        amp: 0.085,
        freq: 1.05,
        speed: 0.16,
        h: 0.12,
        phase: 0.9,
        x0: 0.04,
        x1: 0.96,
        alpha: 0.9,
        rays: 0.55,
        stops: [
          [0, "rgba(44,236,245,0)"],
          [0.68, "rgba(44,236,245,0.32)"],
          [0.9, "rgba(215,254,255,0.95)"],
          [1, "rgba(44,236,245,0)"],
        ],
      },
      {
        y: 0.3,
        slope: 0.12,
        amp: 0.07,
        freq: 1.5,
        speed: -0.13,
        h: 0.1,
        phase: 3.3,
        x0: 0.3,
        x1: 1.05,
        alpha: 0.78,
        rays: 0.55,
        stops: [
          [0, "rgba(255,92,184,0)"],
          [0.68, "rgba(255,92,184,0.32)"],
          [0.9, "rgba(255,217,245,0.92)"],
          [1, "rgba(255,92,184,0)"],
        ],
      },
      {
        y: 0.2,
        slope: 0.1,
        amp: 0.05,
        freq: 1.1,
        speed: 0.07,
        h: 0.3,
        phase: 4.2,
        x0: -0.12,
        x1: 0.62,
        alpha: 0.55,
        rays: 1,
        stops: [
          [0, "rgba(85,93,227,0)"],
          [0.5, "rgba(162,98,255,0.25)"],
          [0.9, "rgba(49,134,233,0.62)"],
          [1, "rgba(49,134,233,0)"],
        ],
      },
    ],
  },
  light: {
    composite: "multiply",
    curtains: [
      {
        y: 0.5,
        slope: -0.26,
        amp: 0.07,
        freq: 0.85,
        speed: 0.12,
        h: 0.56,
        phase: 0,
        x0: -0.08,
        x1: 1.08,
        alpha: 1,
        rays: 1,
        stops: [
          [0, "rgba(170,126,255,0)"],
          [0.34, "rgba(150,100,255,0.6)"],
          [0.7, "rgba(96,118,255,0.95)"],
          [0.88, "rgba(0,196,240,0.98)"],
          [0.962, "rgba(0,196,240,0.98)"],
          [1, "rgba(0,213,239,0)"],
        ],
      },
      {
        y: 0.34,
        slope: 0.16,
        amp: 0.06,
        freq: 1.25,
        speed: -0.09,
        h: 0.42,
        phase: 2.1,
        x0: 0.16,
        x1: 1.12,
        alpha: 1,
        rays: 1,
        stops: [
          [0, "rgba(255,92,184,0)"],
          [0.44, "rgba(255,70,170,0.5)"],
          [0.86, "rgba(255,60,170,0.92)"],
          [0.962, "rgba(190,90,255,0.9)"],
          [1, "rgba(200,110,250,0)"],
        ],
      },
      {
        y: 0.45,
        slope: -0.18,
        amp: 0.085,
        freq: 1.05,
        speed: 0.16,
        h: 0.11,
        phase: 0.9,
        x0: 0.04,
        x1: 0.96,
        alpha: 0.95,
        rays: 0.55,
        stops: [
          [0, "rgba(142,88,242,0)"],
          [0.72, "rgba(130,70,245,0.6)"],
          [0.94, "rgba(130,70,245,0.92)"],
          [1, "rgba(142,88,242,0)"],
        ],
      },
      {
        y: 0.2,
        slope: 0.1,
        amp: 0.05,
        freq: 1.1,
        speed: 0.07,
        h: 0.28,
        phase: 4.2,
        x0: -0.12,
        x1: 0.62,
        alpha: 0.85,
        rays: 1,
        stops: [
          [0, "rgba(0,213,239,0)"],
          [0.5, "rgba(0,200,240,0.4)"],
          [0.92, "rgba(0,170,230,0.8)"],
          [1, "rgba(0,180,216,0)"],
        ],
      },
    ],
  },
};

/** The static sky the curtains hang in: the same values as .sheen-sky__base in backdrop.css. */
const SKY_BASE: Record<
  Theme,
  { bg: string; glows: [number, number, number, number, string, string, number][]; veil: string }
> = {
  dark: {
    bg: "oklch(12% 0.03 282)",
    glows: [
      [0.5, 1.1, 0.9, 0.6, "oklch(24% 0.1 280 / 0.6)", "oklch(24% 0.1 280 / 0)", 0.7],
      [0.55, 0.38, 0.55, 0.45, "oklch(36% 0.18 340 / 0.35)", "oklch(36% 0.18 340 / 0)", 0.72],
      [0.22, 0, 0.6, 0.5, "oklch(40% 0.2 295 / 0.5)", "oklch(40% 0.2 295 / 0)", 0.7],
      [0.78, 0.08, 0.7, 0.55, "oklch(45% 0.14 215 / 0.35)", "oklch(45% 0.14 215 / 0)", 0.7],
    ],
    veil: "oklch(12% 0.03 282 / 0.5)",
  },
  light: {
    bg: "oklch(94% 0.034 300)",
    glows: [
      [0.5, 1.1, 0.9, 0.6, "oklch(85% 0.11 70 / 0.72)", "oklch(85% 0.11 70 / 0)", 0.7],
      [0.55, 0.38, 0.55, 0.45, "oklch(80% 0.16 350 / 0.6)", "oklch(80% 0.16 350 / 0)", 0.72],
      [0.22, 0, 0.6, 0.5, "oklch(74% 0.18 300 / 0.7)", "oklch(74% 0.18 300 / 0)", 0.7],
      [0.78, 0.08, 0.7, 0.55, "oklch(78% 0.15 210 / 0.7)", "oklch(78% 0.15 210 / 0)", 0.7],
    ],
    veil: "oklch(98.2% 0.009 300 / 0.3)",
  },
};

function paintBase(theme: Theme, W: number, H: number) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return c;
  const { bg, glows } = SKY_BASE[theme];
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  for (const [cx, cy, rx, ry, col, clear, stop] of glows) {
    g.save();
    g.translate(cx * W, cy * H);
    g.scale(rx * W, ry * H);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    grad.addColorStop(0, col);
    grad.addColorStop(stop, clear);
    g.fillStyle = grad;
    g.fillRect(-cx / rx - 1, -cy / ry - 1, 1 / rx + 2, 1 / ry + 2);
    g.restore();
  }
  return c;
}

function makeStrip(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 256;
  const g = c.getContext("2d");
  if (!g) return c;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  for (const [o, col] of stops) grad.addColorStop(o, col);
  g.fillStyle = grad;
  g.fillRect(0, 0, 1, 256);
  return c;
}

/**
 * The calm (text-safe) version of a curtain: its white-hot seams take the colour of the nearest
 * coloured stop. Body text on the bare page between panels keeps AA over it once the alpha is
 * lowered too (see `calm` below); the vivid version is for the hero's first viewport only.
 */
function calmStops(stops: [number, string][]): [number, string][] {
  const parse = (s: string) => s.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
  const rgba = stops.map(([, s]) => parse(s));
  const isHot = (c: number[]) => Math.min(c[0] ?? 0, c[1] ?? 0, c[2] ?? 0) >= 190;
  const coloured = rgba.map((c, i) => (isHot(c) ? -1 : i)).filter((i) => i >= 0);
  return stops.map(([o, s], i) => {
    const c = rgba[i] ?? [0, 0, 0, 1];
    if (!isHot(c) || coloured.length === 0) return [o, s];
    const near = coloured.reduce((best, j) => (Math.abs(j - i) < Math.abs(best - i) ? j : best), coloured[0] ?? i);
    const [nr = 0, ng = 0, nb = 0] = rgba[near] ?? c;
    return [o, `rgba(${nr},${ng},${nb},${c[3] ?? 1})`];
  });
}

/** How much of the vivid light is left at full calm (page mode, or the hero scrolled away). */
const CALM_LIGHT = 0.34;

export default function AuroraSky({
  theme,
  reduced,
  active,
  lite,
  mode,
}: {
  theme: Theme;
  reduced: boolean;
  active: boolean;
  lite: boolean;
  mode: "hero" | "page";
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const kickRef = useRef<(on: boolean) => void>(() => undefined);
  const { scrollY } = useScroll();

  useEffect(() => {
    activeRef.current = active;
    kickRef.current(active);
  }, [active]);

  // Layout effect: the first frame is painted in the same commit (no blank sky on a theme switch).
  useLayoutEffect(() => {
    const canvas = ref.current;
    // Opaque: the canvas paints its own base sky, so the compositor can cull the CSS layer under it.
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;
    const { composite, curtains } = CURTAINS[theme];
    const vivid = curtains.map((r) => makeStrip(r.stops));
    const calmed = curtains.map((r) => makeStrip(calmStops(r.stops)));
    // 0 = the hero's vivid sky, 1 = the text-safe page look (page mode, or the hero scrolled away).
    let calm = mode === "page" ? 1 : 0;
    const SCALE = lite ? 4 : 3;
    let W = 0;
    let H = 0;
    let aspect = 1;
    let boost = 1;
    let step = 1;
    let base: HTMLCanvasElement | null = null;
    let veil: CanvasGradient | null = null;
    let dim = 1;
    auroraSky.dawnStart ??= performance.now();
    let dawnStart = reduced ? -Infinity : auroraSky.dawnStart;
    let dawn = reduced ? 1 : 0;
    let gx = sheenPointer.x;
    let glow = 0;

    const resize = () => {
      W = Math.max(48, Math.ceil(window.innerWidth / SCALE));
      H = Math.max(48, Math.ceil(window.innerHeight / SCALE));
      aspect = Math.min(1.6, Math.max(0.55, W / H)) / 1.6;
      boost = window.innerWidth < 640 ? 1.4 : 1;
      step = W > 300 ? 2 : 1;
      canvas.width = W;
      canvas.height = H;
      base = paintBase(theme, W, H);
      veil = ctx.createLinearGradient(0, 0, 0, H);
      veil.addColorStop(0.45, SKY_BASE[theme].veil.replace(/\/ [\d.]+\)/, "/ 0)"));
      veil.addColorStop(1, SKY_BASE[theme].veil);
    };

    // The curtains are drawn into their own transparent canvas (the floor reflects only the
    // light), then laid over the base sky in one call.
    const light = document.createElement("canvas");
    const lctx = light.getContext("2d");
    if (!lctx) return;

    const drawCurtains = (t: number) => {
      const lift = reduced ? 0 : auroraSky.lift;
      const colW = step + 0.5;
      const strips = calm > 0.5 ? calmed : vivid;
      // The phone boost (curtains read faint on a narrow canvas) belongs to the vivid hero; once calm
      // it fades to 1, so bare text over the page look keeps AA on phones as it does on desktop.
      // Light-theme curtains carry deeper colours than before (vivid hero), so the calm page keeps the same measured light.
      const calmLight = theme === "light" ? CALM_LIGHT * 0.72 : CALM_LIGHT;
      const calmBoost = (boost - (boost - 1) * calm) * (1 - (1 - calmLight) * calm);
      curtains.forEach((r, i) => {
        const strip = strips[i];
        if (!strip) return;
        const f = r.freq * (0.55 + 0.45 * aspect);
        for (let x = 0; x <= W; x += step) {
          const nx = x / W;
          if (nx < r.x0 || nx > r.x1) continue;
          const ignite = clamp01(dawn * 1.9 - nx * 0.8 - i * 0.08);
          if (ignite <= 0) continue;
          const env = Math.pow(Math.sin((Math.PI * (nx - r.x0)) / (r.x1 - r.x0)), 0.7);
          const breathe = 0.74 + 0.26 * Math.sin(nx * 3.1 + t * 0.17 + r.phase);
          const raw =
            0.5 +
            0.28 * Math.sin(nx * 47 + t * 0.45 + r.phase) +
            0.15 * Math.sin(nx * 131 - t * 0.7 + r.phase * 1.7) +
            0.07 * Math.sin(nx * 293 + t * 0.9);
          const rays = 1 - r.rays * (0.65 - 0.65 * raw);
          const d = nx - gx;
          const bump = glow * Math.exp(-(d * d) / 0.012);
          const yb =
            H *
            (r.y -
              lift * 0.1 +
              (1 - ignite) * 0.09 +
              r.slope * (nx - 0.5) +
              r.amp * Math.sin(nx * f * TAU + t * r.speed + r.phase) +
              r.amp * 0.45 * Math.sin(nx * f * 2.3 * TAU - t * r.speed * 1.6 + r.phase * 2) -
              bump * 0.03);
          const h =
            H *
            r.h *
            (0.72 + 0.28 * Math.sin(nx * 4.3 - t * 0.2 + r.phase)) *
            (0.55 + 0.45 * ignite) *
            (1 + lift * 0.15);
          lctx.globalAlpha = clamp01(
            (theme === "light" ? 1 + 0.35 * (1 - calm) : 1) *
              r.alpha *
              env *
              breathe *
              rays *
              ignite *
              calmBoost *
              (1 + lift * 0.22) *
              (1 + bump * 0.55),
          );
          lctx.drawImage(strip, 0, 0, 1, 256, x - 0.25, yb - h, colW, h * 1.04);
        }
      });
    };

    const drawSky = (t: number) => {
      if (light.width !== W || light.height !== H) {
        light.width = W;
        light.height = H;
      }
      lctx.globalCompositeOperation = "source-over";
      lctx.globalAlpha = 1;
      lctx.clearRect(0, 0, W, H);
      lctx.globalCompositeOperation = composite;
      drawCurtains(t);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      if (base) ctx.drawImage(base, 0, 0);
      ctx.globalCompositeOperation = composite;
      ctx.drawImage(light, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      if (dim < 1 && base) {
        ctx.globalAlpha = 1 - dim;
        ctx.drawImage(base, 0, 0);
        ctx.globalAlpha = 1;
      }
      if (veil) {
        ctx.fillStyle = veil;
        ctx.fillRect(0, 0, W, H);
      }
    };

    // The floor reflects the band of sky where the curtains hang: flipped, squashed, rippled in
    // bands, its fade-out baked into the pixels (no CSS mask on a layer that changes per frame).
    let fade: CanvasGradient | null = null;
    let fadeH = 0;
    let measuredAt = 0;
    const drawReflection = (t: number, now: number) => {
      const rf = auroraSky.reflection;
      const rctx = rf?.getContext("2d");
      if (!rf || !rctx) return;
      if (now - measuredAt > 500) {
        measuredAt = now;
        auroraSky.measureFloor?.();
      }
      rctx.setTransform(1, 0, 0, 1, 0, 0);
      rctx.globalCompositeOperation = "source-over";
      rctx.clearRect(0, 0, rf.width, rf.height);
      if (lite) return;
      const vh = window.innerHeight;
      const horizon = auroraSky.floorTop - window.scrollY;
      if (horizon > vh + 40 || horizon + auroraSky.floorH < 0) return;
      const sy0 = H * 0.18;
      const sy1 = H * 0.72;
      if (sy1 - sy0 < 2) return;
      const RW = rf.width;
      const RH = rf.height;
      if (RW < 2 || RH < 2) return;
      const bands = 12;
      for (let b = 0; b < bands; b++) {
        const f0 = b / bands;
        const f1 = (b + 1) / bands;
        const srcTop = sy1 - (sy1 - sy0) * f1;
        const srcBot = sy1 - (sy1 - sy0) * f0;
        const dy = RH * f0;
        const dh = RH * (f1 - f0) + 0.5;
        const wob = reduced ? 0 : Math.sin(t * 1.2 + b * 0.9) * (0.4 + b * 0.35) * (RW / 240);
        rctx.setTransform(1, 0, 0, -1, wob, dy + dh);
        rctx.drawImage(light, 0, srcTop, W, srcBot - srcTop, 0, 0, RW, dh);
      }
      rctx.setTransform(1, 0, 0, 1, 0, 0);
      if (!fade || fadeH !== RH) {
        fadeH = RH;
        fade = rctx.createLinearGradient(0, 0, 0, RH);
        fade.addColorStop(0, "rgba(0,0,0,1)");
        fade.addColorStop(0.4, "rgba(0,0,0,0.8)");
        fade.addColorStop(0.72, "rgba(0,0,0,0.35)");
        fade.addColorStop(0.96, "rgba(0,0,0,0)");
      }
      rctx.globalCompositeOperation = "destination-in";
      rctx.fillStyle = fade;
      rctx.fillRect(0, 0, RW, RH);
      rctx.globalCompositeOperation = "source-over";
    };

    const redraw = () => {
      drawSky(auroraSky.clock);
      drawReflection(auroraSky.clock, performance.now());
    };

    // One sky frame per ambient beat.
    const frame = (now: number, dt: number) => {
      auroraSky.clock += dt;
      gx += (sheenPointer.x - gx) * 0.07;
      glow += ((sheenPointer.on ? 1 : 0) - glow) * 0.04;
      const p = Math.min(1, (now - dawnStart) / DAWN_MS);
      dawn = 0.5 - 0.5 * Math.cos(Math.PI * p);
      drawSky(auroraSky.clock);
      drawReflection(auroraSky.clock, now);
      auroraSky.tick.forEach((fn) => fn(auroraSky.clock));
    };

    let stop: (() => void) | null = null;
    const kick = (on: boolean) => {
      const want = on && !reduced;
      if (want === (stop !== null)) {
        // Never moving (paused from the start, or off screen at load): the still sky must be
        // the fully risen one, not an unlit pre-dawn frame.
        if (!want && dawn < 1) {
          dawn = 1;
          dawnStart = auroraSky.dawnStart = -Infinity;
          redraw();
        }
        return;
      }
      if (want) {
        stop = addAmbient(frame);
      } else {
        stop?.();
        stop = null;
        if (dawn < 1) {
          dawn = 1;
          dawnStart = auroraSky.dawnStart = -Infinity;
          redraw();
        }
      }
    };
    kickRef.current = kick;
    auroraSky.redraw = redraw;

    resize();
    redraw();
    kick(activeRef.current);

    const onResize = () => {
      resize();
      redraw();
    };
    // The aurora rises as the first viewport scrolls away, then settles deeper down the page.
    // While the loop is paused, a dim change repaints one frame (coalesced).
    let pending = 0;
    let vh = window.innerHeight;
    const onScroll = (y: number) => {
      markScrolling();
      auroraSky.lift = clamp01(y / (vh * 1.1));
      // Hero mode: the vivid sky belongs to the first viewport; by half a viewport down it has
      // calmed to the page look (body text on the bare page keeps AA over it).
      const nextCalm = mode === "page" ? 1 : clamp01((y - vh * 0.15) / (vh * 0.55));
      const deep = clamp01((y - vh * 1.8) / vh);
      const next = 1 - deep * 0.35;
      if (Math.abs(next - dim) < 0.01 && Math.abs(nextCalm - calm) < 0.01) return;
      dim = next;
      calm = nextCalm;
      if (stop === null && !pending) {
        pending = requestAnimationFrame(() => {
          pending = 0;
          drawSky(auroraSky.clock);
        });
      }
    };
    onScroll(scrollY.get());
    const offScroll = scrollY.on("change", onScroll);
    const onResizeVh = () => {
      vh = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("resize", onResizeVh);
    return () => {
      kick(false);
      cancelAnimationFrame(pending);
      kickRef.current = () => undefined;
      if (auroraSky.redraw === redraw) auroraSky.redraw = () => undefined;
      offScroll();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("resize", onResizeVh);
    };
  }, [theme, reduced, lite, mode, scrollY]);

  return (
    <>
      <canvas ref={ref} className="sheen-sky__aurora" aria-hidden />
      <i className="sheen-sky__grid" />
      <i className="sheen-sky__veil" />
      <i className="sheen-sky__vignette" />
    </>
  );
}
