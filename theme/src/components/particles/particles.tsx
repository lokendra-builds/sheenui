"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { cn } from "../../lib/cn";
import { deviceBudget, resolveCssColor, seededRandom, watchColorScheme } from "../../lib/canvas-effects";
import { useAmbientBeat } from "../../motion/beat";
import { useLoopPlayback, useMotionGate } from "../../motion/gate";

/** How the pointer moves nearby particles. */
export type ParticlesPointer = "repel" | "attract" | "none";

/** Props of {@link Particles}. */
export type ParticlesProps = {
  /**
   * How many particles per 10,000 px² of the field (a 1000 x 600 field at 1 draws 60). The count is always capped by `maxCount`, and halved on devices with little memory, few cores or Save-Data.
   * @default 1.4
   */
  density?: number;
  /**
   * The most particles ever drawn, whatever the density and the size of the field.
   * @default 120
   */
  maxCount?: number;
  /**
   * Radius of a particle in px; each one varies a little around it.
   * @default 2
   */
  radius?: number;
  /**
   * Sets the drift speed in px per second.
   * @default 10
   */
  speed?: number;
  /**
   * What a nearby pointer does: push particles away softly, draw them in, or nothing. Only mouse and trackpad react; touch screens and reduced motion never do.
   * @default "repel"
   */
  pointer?: ParticlesPointer;
  /**
   * Distance in px within which the pointer moves particles.
   * @default 120
   */
  pointerRadius?: number;
  /** Sets the colour of most particles, any CSS colour. Defaults to the accent token, so the theme and preset recolour it. */
  color?: string;
  /** Colour of the rest (about a third), any CSS colour. Defaults to the second accent (teal). */
  colorTo?: string;
  /**
   * Hold the particles where they are (they carry on from there when unpaused).
   * @default false
   */
  paused?: boolean;
  /**
   * Seed for the starting positions, so a field looks the same on every visit and on the server.
   * @default 1
   */
  seed?: number;
  /** Adds extra classes to the overlay. Size it with `inset-0` inside a `relative` parent, or give it its own size. */
  className?: string;
  /** Applies an inline style to the overlay. */
  style?: CSSProperties;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Offset from the rest position, pushed by the pointer and easing back. */
  ox: number;
  oy: number;
  r: number;
  phase: number;
  /** Depth 0 (far: small, slow, dim) to 1 (near: bigger, faster, brighter, with a halo). */
  z: number;
  second: boolean;
};

type FieldOptions = Required<
  Pick<ParticlesProps, "density" | "maxCount" | "radius" | "speed" | "pointer" | "pointerRadius">
>;

const HARD_CAP = 400;
const DPR_CAP = 2;
/** How fast a pushed particle eases back, per second. */
const SETTLE = 3.2;

/** The simulation and its drawing: plain data and methods, so the React side only starts and stops it. */
class Field {
  width = 0;
  height = 0;
  dpr = 1;
  particles: Particle[] = [];
  colors: [string, string] = ["transparent", "transparent"];
  mouse = { x: 0, y: 0, active: false };

  /** Where the pointer is, in the field's own pixels, and whether it is near enough to matter. */
  point(x: number, y: number, active: boolean) {
    this.mouse = { x, y, active };
  }

  /** The pointer left: stop reacting to it. */
  release() {
    this.mouse = { ...this.mouse, active: false };
  }

  /** Sets the two particle colours (already resolved to something a canvas can paint). */
  tint(first: string, second: string) {
    this.colors = [first, second];
  }

  /** Sizes the canvas to `rect` and seeds the particles for the current options. */
  resize(canvas: HTMLCanvasElement, rect: DOMRect, options: FieldOptions, seed: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    this.width = Math.max(1, Math.round(rect.width));
    this.height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(this.width * this.dpr);
    canvas.height = Math.round(this.height * this.dpr);
    const wanted = ((this.width * this.height) / 10000) * options.density * deviceBudget();
    const count = Math.max(0, Math.min(Math.round(wanted), options.maxCount, HARD_CAP));
    const random = seededRandom(seed);
    this.particles = Array.from({ length: count }, () => {
      const angle = random() * Math.PI * 2;
      const z = random();
      const v = (0.4 + random() * 0.6) * options.speed * (0.5 + z);
      return {
        x: random() * this.width,
        y: random() * this.height,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        ox: 0,
        oy: 0,
        r: options.radius * (0.5 + z * 1.1),
        phase: random() * Math.PI * 2,
        z,
        second: random() < 0.34,
      };
    });
  }

  /** Moves every particle by `dt` seconds: drift, wrap around the edges, ease back from a push, lean from the pointer. */
  step(dt: number, options: FieldOptions) {
    const push = options.pointer === "attract" ? -1 : 1;
    const settle = Math.min(1, SETTLE * dt);
    const lean = Math.min(1, dt * 8);
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -4) p.x += this.width + 8;
      else if (p.x > this.width + 4) p.x -= this.width + 8;
      if (p.y < -4) p.y += this.height + 8;
      else if (p.y > this.height + 4) p.y -= this.height + 8;
      p.ox -= p.ox * settle;
      p.oy -= p.oy * settle;
      if (!this.mouse.active) continue;
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.5 && dist < options.pointerRadius) {
        const strength = (1 - dist / options.pointerRadius) ** 2 * 14;
        p.ox += (dx / dist) * strength * push * lean;
        p.oy += (dy / dist) * strength * push * lean;
      }
    }
  }

  draw(canvas: HTMLCanvasElement, time: number) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    for (const p of this.particles) {
      const twinkle = 0.5 + 0.5 * Math.sin(time / 900 + p.phase * 3);
      const alpha = (0.3 + 0.7 * twinkle) * (0.45 + 0.55 * p.z);
      const px = p.x + p.ox * (0.5 + p.z);
      const py = p.y + p.oy * (0.5 + p.z);
      ctx.fillStyle = p.second ? this.colors[1] : this.colors[0];
      if (p.z > 0.55) {
        // A soft halo for the near layer: a wider, fainter disc under the core.
        ctx.globalAlpha = alpha * 0.18;
        ctx.beginPath();
        ctx.arc(px, py, p.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(px, py, p.r * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = Math.min(1, alpha + 0.1);
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/**
 * Particles: a field of small lights drifting slowly on a canvas, leaning softly away from (or towards) the pointer. Use it behind a hero or a glass card for depth; it is a texture, not a focal point.
 *
 * Put it inside a `relative` parent: it fills it, never takes pointer events and never covers content. The number of particles follows the area (`density`) and is always capped (`maxCount`, 400 at most), then halved on weak devices (low memory, few cores, Save-Data), so a big hero stays cheap. Particles use the accent and second-accent tokens, read from the page, so a theme or style switch recolours them.
 *
 * Keyboard: Not focusable and never takes pointer events.
 * Accessibility: Decorative and `aria-hidden`; no information is carried by it. Particles are small and low contrast so text above stays readable. Offer `paused` as a control where the field sits behind long reading (WCAG 2.2.2).
 * Glass: A canvas sibling behind or above the content with no blur, mask or filter, so glass above it keeps its backdrop (the particles are what the glass blurs).
 * Motion: One canvas drawn on the shared ambient beat (about 30 Hz, fewer while scrolling), only while the field is on screen, the tab is visible and motion is allowed; the pointer reaction needs a mouse or trackpad. Reduced motion: one still frame, no loop and no pointer reaction.
 *
 * @example
 * ```tsx
 * import { GlassCard, Particles } from "@sheenui/theme";
 *
 * export function Hero() {
 *   return (
 *     <div className="relative overflow-hidden rounded-sheen-xl p-16">
 *       <Particles className="inset-0" density={1.2} />
 *       <GlassCard className="relative mx-auto max-w-md p-8">Build something calm.</GlassCard>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /effects/particles
 */
export function Particles({
  density = 1.4,
  maxCount = 120,
  radius = 2,
  speed = 10,
  pointer = "repel",
  pointerRadius = 120,
  color,
  colorTo,
  paused = false,
  seed = 1,
  className,
  style,
}: ParticlesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playing = useLoopPlayback(rootRef, { paused });
  const { pointerFx } = useMotionGate();
  const [field] = useState(() => new Field());
  const options = useMemo<FieldOptions>(
    () => ({ density, maxCount, radius, speed, pointer, pointerRadius }),
    [density, maxCount, radius, speed, pointer, pointerRadius],
  );

  // Size the canvas and (re)seed the particles whenever the field or its options change.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const resize = () => {
      field.resize(canvas, root.getBoundingClientRect(), options, seed);
      field.draw(canvas, 0);
    };
    resize();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    return () => observer.disconnect();
  }, [field, options, seed]);

  // Colours: the given colours or the tokens, resolved to what a canvas can paint, again on a theme or preset switch.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const read = () => {
      field.tint(
        resolveCssColor(root, color ?? "var(--sheen-accent)"),
        resolveCssColor(root, colorTo ?? "var(--sheen-accent-2)"),
      );
      field.draw(canvas, performance.now());
    };
    read();
    return watchColorScheme(read);
  }, [field, color, colorTo]);

  // The pointer, in the field's own coordinates. Listened to on the window so the overlay itself can stay click-through.
  const reactive = playing && pointerFx && pointer !== "none";
  useEffect(() => {
    if (!reactive) return;
    const onMove = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      field.point(
        x,
        y,
        x >= -pointerRadius &&
          y >= -pointerRadius &&
          x <= rect.width + pointerRadius &&
          y <= rect.height + pointerRadius,
      );
    };
    const onLeave = () => {
      field.release();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      field.release();
    };
  }, [field, reactive, pointerRadius]);

  useAmbientBeat((now, dt) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    field.step(dt, options);
    field.draw(canvas, now);
  }, playing);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="particles"
      data-paused={paused ? "" : undefined}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={style}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
