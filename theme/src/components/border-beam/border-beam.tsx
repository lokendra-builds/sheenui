"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { observeIntersection } from "../../hooks/use-intersection";

/**
 * Border beam: a comet of light running around a rounded border.
 *
 * Drop it inside any positioned, rounded element (a GlassCard, a button, an input wrapper):
 * it fills its parent, takes the parent's border radius and is masked to a thin ring, so it
 * never covers the content and never touches the parent's own blur.
 *
 * Motion: two registered (@property) angles drive a conic gradient: where the beam is and
 * how wide it is. The keyframes are worked out from the real outline (the rounded rectangle's
 * perimeter), so the beam keeps one speed and one length all the way round, even on a wide
 * bar, instead of racing along the long sides like a plain spinning gradient.
 *   - pauses while off-screen (IntersectionObserver); `paused` holds it where it is
 *   - reduced motion: a still beam lit on the top-left corner
 *   - the halo is a soft light that travels with the beam by transform (compositor), seen through
 *     a ring mask blurred once per size: no filter runs per frame
 *   - forced colors: hidden (decoration only)
 */

const STYLE = `
@property --sheen-beam-angle { syntax: "<angle>"; inherits: true; initial-value: 0deg; }
@property --sheen-beam-size { syntax: "<angle>"; inherits: true; initial-value: 40deg; }
`;

/** Props of {@link BorderBeam}. */
export type BorderBeamProps = {
  /**
   * Seconds one lap around the border takes.
   * @default 8
   */
  duration?: number;
  /**
   * Seconds before the first lap (lets several beams run out of step).
   * @default 0
   */
  delay?: number;
  /**
   * Length of the beam in px, measured along the border.
   * @default 120
   */
  length?: number;
  /**
   * Sets the thickness of the ring in px.
   * @default 1.5
   */
  width?: number;
  /** Sets the tail colour (any CSS colour). Defaults to the accent. */
  colorFrom?: string;
  /** Colour of the beam's bright head, any CSS colour; the tail fades in from `colorFrom`. Defaults to the second accent (teal). */
  colorTo?: string;
  /**
   * Runs the beam anticlockwise instead of clockwise.
   * @default false
   */
  reverse?: boolean;
  /**
   * Draws two beams on opposite sides.
   * @default false
   */
  double?: boolean;
  /**
   * Soft halo around the beam (skipped for lite glass and reduced transparency). It moves by transform; nothing is blurred per frame.
   * @default true
   */
  glow?: boolean;
  /**
   * Faint, static rim under the beam, so the border reads as lit even between laps.
   * @default true
   */
  track?: boolean;
  /**
   * Distance from the parent's padding edge in px. -1 sits on a 1px border.
   * @default -1
   */
  offset?: number;
  /**
   * Hold the beam where it is (it carries on from there when unpaused).
   * @default false
   */
  paused?: boolean;
  /** Adds extra classes to the beam element. */
  className?: string;
  /** Inline style for the beam element (for example custom properties). */
  style?: CSSProperties;
};

/** Steps per lap: dense enough that linear interpolation between them is indistinguishable from the true curve. */
const STEPS = 64;

type Box = { width: number; height: number; radius: number };

/** Point at distance `s` along a rounded rectangle's outline, clockwise from the top centre (origin at the centre). */
function pointAt({ width, height, radius }: Box, s: number) {
  const r = Math.min(radius, width / 2, height / 2);
  const hw = width / 2;
  const hh = height / 2;
  const sx = hw - r; // half of each straight horizontal run
  const sy = hh - r;
  const arc = (Math.PI / 2) * r;
  const perimeter = 4 * sx + 4 * sy + 4 * arc;
  let d = ((s % perimeter) + perimeter) % perimeter;

  // Segments, clockwise from the top centre: top-right half, corner, right, corner, bottom, corner, left, corner, top-left half.
  const segments: [number, (t: number) => [number, number]][] = [
    [sx, (t) => [t, -hh]],
    [arc, (t) => cornerPoint(sx, -sy, r, -Math.PI / 2 + t / (r || 1))],
    [2 * sy, (t) => [hw, -sy + t]],
    [arc, (t) => cornerPoint(sx, sy, r, t / (r || 1))],
    [2 * sx, (t) => [sx - t, hh]],
    [arc, (t) => cornerPoint(-sx, sy, r, Math.PI / 2 + t / (r || 1))],
    [2 * sy, (t) => [-hw, sy - t]],
    [arc, (t) => cornerPoint(-sx, -sy, r, Math.PI + t / (r || 1))],
    [sx, (t) => [-sx + t, -hh]],
  ];
  for (const [length, at] of segments) {
    if (d <= length) return at(d);
    d -= length;
  }
  return [0, -hh] as [number, number];
}

function cornerPoint(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

/** Conic-gradient angle (degrees, clockwise from 12 o'clock) of a point seen from the centre. */
function angleOf([x, y]: [number, number]) {
  return (Math.atan2(x, -y) * 180) / Math.PI;
}

function perimeterOf({ width, height, radius }: Box) {
  const r = Math.min(radius, width / 2, height / 2);
  return 2 * (width - 2 * r) + 2 * (height - 2 * r) + 2 * Math.PI * r;
}

/** Shortest signed difference b − a, in degrees. */
function delta(a: number, b: number) {
  return ((((b - a + 180) % 360) + 360) % 360) - 180;
}

/** Keyframes for one lap: the beam's head angle (unwrapped, so it only ever increases) and its angular length. */
function lapKeyframes(box: Box, length: number, reverse: boolean): Keyframe[] {
  const perimeter = perimeterOf(box);
  const beam = Math.min(length, perimeter * 0.45);
  const frames: Keyframe[] = [];
  let unwrapped = 0;
  let previous = 0;
  for (let i = 0; i <= STEPS; i++) {
    const s = (i / STEPS) * perimeter;
    const head = angleOf(pointAt(box, s));
    unwrapped = i === 0 ? head : unwrapped + delta(previous, head);
    previous = head;
    // The tail trails behind the head, so it sits back along the direction of travel.
    const tail = angleOf(pointAt(box, reverse ? s + beam : s - beam));
    const size = Math.max(1, Math.abs(delta(tail, head)));
    frames.push({
      offset: i / STEPS,
      "--sheen-beam-angle": `${unwrapped.toFixed(2)}deg`,
      "--sheen-beam-size": `${size.toFixed(2)}deg`,
    });
  }
  return frames;
}

/** The beam held still with its middle on the top-left corner, like light falling from there (both directions). */
function restFrame(box: Box, length: number, reverse: boolean) {
  const perimeter = perimeterOf(box);
  const beam = Math.min(length, perimeter * 0.45);
  const r = Math.min(box.radius, box.width / 2, box.height / 2);
  // Middle of the top-left corner, measured clockwise from the top centre.
  const corner = perimeter - (box.width / 2 - r) - (Math.PI / 4) * r;
  const s = reverse ? corner - beam / 2 : corner + beam / 2;
  const head = angleOf(pointAt(box, s));
  const tail = angleOf(pointAt(box, reverse ? s + beam : s - beam));
  return { angle: `${head.toFixed(2)}deg`, size: `${Math.max(1, Math.abs(delta(tail, head))).toFixed(2)}deg` };
}

function readBox(el: HTMLElement): Box {
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  return { width, height, radius: Math.min(radius, width / 2, height / 2) };
}

/** Whether registered custom properties can be animated smoothly here (otherwise the beam would jump). */
function canAnimateAngles() {
  return typeof CSS !== "undefined" && "registerProperty" in CSS && typeof Element.prototype.animate === "function";
}

/** How far the halo reaches past the ring, in px, and how soft it is. */
const HALO_SPREAD = 10;
const HALO_BLUR = 3.5;
const haloCache = new Map<string, string>();

/**
 * Where the halo may glow: a softly blurred copy of the ring, drawn once per size on a canvas
 * and used as a mask. Nothing is blurred while the beam runs.
 */
function haloMask({ width, height, radius }: Box, ring: number): string | null {
  if (typeof document === "undefined") return null;
  const w = Math.round(width + 2 * HALO_SPREAD);
  const h = Math.round(height + 2 * HALO_SPREAD);
  const key = `${w}x${h}r${radius.toFixed(1)}w${ring}`;
  const hit = haloCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx || typeof ctx.roundRect !== "function") return null;
  // Shadow trick: the stroke is drawn off the canvas and only its blurred shadow lands on it.
  const away = w + 4 * HALO_SPREAD;
  ctx.shadowColor = "black";
  ctx.shadowBlur = HALO_BLUR * 2;
  ctx.shadowOffsetX = away;
  ctx.strokeStyle = "black";
  ctx.lineWidth = ring + 2;
  ctx.beginPath();
  const inset = HALO_SPREAD + ring / 2;
  ctx.roundRect(inset - away, inset, width - ring, height - ring, Math.max(0, radius - ring / 2));
  ctx.stroke();
  const url = `url("${canvas.toDataURL("image/png")}")`;
  haloCache.set(key, url);
  if (haloCache.size > 32) {
    const oldest = haloCache.keys().next().value;
    if (oldest !== undefined) haloCache.delete(oldest);
  }
  return url;
}

/** Length of the beam along the outline, in px. */
function beamLength(box: Box, length: number) {
  return Math.min(length, perimeterOf(box) * 0.45);
}

/** Diameter of a halo light: about the beam's length, so the glow covers the whole comet. */
function lightSize(box: Box, length: number) {
  return Math.round(Math.max(32, Math.min(240, beamLength(box, length))));
}

/**
 * Keyframes that carry a halo light along the outline with the beam: a plain translate, so
 * the browser runs it on the compositor. It sits on the middle of the comet; `shift` (px along
 * the outline) puts the second light of a double beam on the opposite side.
 */
function lightKeyframes(box: Box, length: number, reverse: boolean, shift: number): Keyframe[] {
  const perimeter = perimeterOf(box);
  const beam = beamLength(box, length);
  const frames: Keyframe[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const s = (i / STEPS) * perimeter + shift + (reverse ? beam / 2 : -beam / 2);
    const [x, y] = pointAt(box, s);
    frames.push({ offset: i / STEPS, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` });
  }
  return frames;
}

/** The halo lights at rest, with the beam on the top-left corner. */
function restLight(box: Box, shift: number) {
  const perimeter = perimeterOf(box);
  const r = Math.min(box.radius, box.width / 2, box.height / 2);
  const corner = perimeter - (box.width / 2 - r) - (Math.PI / 4) * r;
  const [x, y] = pointAt(box, corner + shift);
  return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
}

/**
 * A comet of light running around a rounded border. Drop it inside any positioned, rounded
 * element (a GlassCard, a button, an input wrapper): it fills its parent, takes the parent's
 * radius and is masked to a thin ring, so it never covers content or touches the parent's blur.
 *
 * Props: see {@link BorderBeamProps} (`duration` 8s, `delay` 0, `length` 120px, `width` 1.5px,
 * `colorFrom`, `colorTo`, `reverse`, `double`, `glow` true, `track` true, `offset` -1, `paused`,
 * `className`, `style`).
 *
 * Accessibility: Purely decorative: `aria-hidden`, no focus, no pointer events, and hidden in forced colors.
 * Glass: Adds no backdrop blur of its own; the halo is a mask blurred once per size on a canvas, then moved by transform. Skipped for Lite glass and reduced transparency.
 * Motion: Pauses while off-screen (IntersectionObserver) and when `paused` is set. Reduced motion shows a still beam on the top-left corner.
 *
 * @example
 * ```tsx
 * import { BorderBeam, GlassCard } from "@sheenui/theme";
 *
 * export function Featured() {
 *   return (
 *     <GlassCard className="relative rounded-sheen-xl p-6">
 *       <BorderBeam duration={6} double />
 *       Pro plan
 *     </GlassCard>
 *   );
 * }
 * ```
 *
 * @see /effects/border-beam
 */
export function BorderBeam({
  duration = 8,
  delay = 0,
  length = 120,
  width = 1.5,
  colorFrom,
  colorTo,
  reverse = false,
  double = false,
  glow = true,
  track = true,
  offset = -1,
  paused = false,
  className,
  style,
}: BorderBeamProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const haloRef = useRef<HTMLSpanElement>(null);
  const reduced = useSheenReducedMotion();
  const control = useRef({ animations: [] as Animation[], visible: true, hidden: false, paused });

  /** Runs only while wanted: on screen and not paused. Pausing holds the beam where it is. */
  const update = () => {
    const { animations, visible, hidden, paused: hold } = control.current;
    for (const animation of animations) {
      if (visible && !hidden && !hold) animation.play();
      else animation.pause();
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const c = control.current;
    const stop = () => {
      for (const animation of c.animations) animation.cancel();
      c.animations = [];
    };

    const sync = () => {
      const box = readBox(el);
      if (box.width < 2 || box.height < 2) return;
      const halo = haloRef.current;
      const lights = halo ? [...halo.querySelectorAll<HTMLElement>("[data-light]")] : [];
      const half = perimeterOf(box) / 2;
      if (halo) {
        const mask = haloMask(box, width);
        halo.style.maskImage = mask ?? "";
        halo.style.setProperty("-webkit-mask-image", mask);
        halo.hidden = !mask;
        const size = `${lightSize(box, length)}px`;
        for (const light of lights) {
          light.style.width = size;
          light.style.height = size;
        }
      }
      if (reduced || !canAnimateAngles()) {
        stop();
        const rest = restFrame(box, length, reverse);
        el.style.setProperty("--sheen-beam-angle", rest.angle);
        el.style.setProperty("--sheen-beam-size", rest.size);
        lights.forEach((light, i) => {
          light.style.transform = restLight(box, i * half);
        });
        return;
      }
      const frames = [
        lapKeyframes(box, length, reverse),
        ...lights.map((_, i) => lightKeyframes(box, length, reverse, i * half)),
      ];
      if (c.animations.length === frames.length) {
        // Same lap, new outline: keep the beam where it is.
        c.animations.forEach((animation, i) => {
          const next = frames[i];
          if (animation.effect instanceof KeyframeEffect && next) animation.effect.setKeyframes(next);
        });
        return;
      }
      stop();
      const timing: KeyframeAnimationOptions = {
        duration: duration * 1000,
        delay: delay * 1000,
        iterations: Infinity,
        easing: "linear",
        direction: reverse ? "reverse" : "normal",
      };
      // Created together, so they share a start time and stay in step.
      const [lap = [], ...lightFrames] = frames;
      c.animations = [
        el.animate(lap, timing),
        ...lights.map((light, i) => light.animate(lightFrames[i] ?? [], timing)),
      ];
      update();
    };

    sync();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
    ro?.observe(el);
    const stopObserving = observeIntersection(el, (entry) => {
      c.visible = entry.isIntersecting;
      update();
    });
    // A background tab pauses it too.
    const onVisibility = () => {
      c.hidden = document.visibilityState === "hidden";
      update();
    };
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      ro?.disconnect();
      stopObserving();
      stop();
    };
  }, [duration, delay, length, reverse, reduced, width, glow, double]);

  useEffect(() => {
    control.current.paused = paused;
    update();
  }, [paused]);

  const head = colorTo ?? "var(--sheen-accent-2)";
  const tail = colorFrom ?? "var(--sheen-accent)";
  const gradient = beamGradient(tail, head, reverse, double);
  // A soft light, brightest at its centre: the mask keeps it to a glow around the ring.
  const light = `radial-gradient(closest-side, ${head}, color-mix(in oklab, ${tail} 55%, transparent) 55%, transparent)`;

  return (
    <span
      ref={ref}
      aria-hidden
      data-slot="border-beam"
      data-paused={paused ? "" : undefined}
      className={cn("pointer-events-none absolute rounded-[inherit] forced-colors:hidden", className)}
      style={{ inset: `${offset}px`, ...style }}
    >
      <style href="sheen-border-beam" precedence="sheen">
        {STYLE}
      </style>
      {track && (
        <span className="absolute inset-0 rounded-[inherit]" style={ringStyle(width, "var(--sheen-accent-border)")} />
      )}
      {glow && (
        // The halo: one or two soft lights that travel with the beam (transform only), seen
        // through a pre-blurred ring mask. No filter runs per frame.
        <span
          ref={haloRef}
          data-slot="border-beam-halo"
          hidden
          className={cn(
            "absolute opacity-70",
            "[[data-glass=lite]_&]:hidden [[data-transparency=reduced]_&]:hidden [@media(prefers-reduced-transparency:reduce)]:hidden",
          )}
          style={{ inset: `${-HALO_SPREAD}px`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }}
        >
          {(double ? [0, 1] : [0]).map((i) => (
            <span
              key={i}
              data-light=""
              className="absolute top-1/2 left-1/2 will-change-transform"
              style={{ background: light, translate: "-50% -50%" }}
            />
          ))}
        </span>
      )}
      <span className="absolute inset-0 rounded-[inherit]" style={ringStyle(width, gradient)} />
    </span>
  );
}

/**
 * The comet, as a conic gradient: transparent everywhere except an arc that ends at the head
 * (--sheen-beam-angle) and is --sheen-beam-size long, fading from the tail colour to the head.
 */
function beamGradient(tail: string, head: string, reverse: boolean, double: boolean) {
  const size = "var(--sheen-beam-size)";
  const span = double ? "180deg" : "360deg";
  // Clockwise: the arc runs from (head − size) up to the head. Anticlockwise: from the head to (head + size).
  const from = reverse ? "var(--sheen-beam-angle)" : `calc(var(--sheen-beam-angle) - ${size})`;
  const stops = reverse
    ? `${head} 0deg, ${tail} calc(${size} * 0.6), transparent ${size}, transparent ${span}`
    : `transparent 0deg, ${tail} calc(${size} * 0.4), ${head} calc(${size} - 1deg), transparent ${size}, transparent ${span}`;
  return double ? `repeating-conic-gradient(from ${from}, ${stops})` : `conic-gradient(from ${from}, ${stops})`;
}

const mask = "linear-gradient(black 0 0)";
function ringStyle(width: number, background: string): CSSProperties {
  return {
    padding: `${width}px`,
    background,
    WebkitMask: `${mask} content-box, ${mask}`,
    WebkitMaskComposite: "xor",
    mask: `${mask} content-box exclude, ${mask}`,
  };
}
