"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

import { cn } from "../../lib/cn";
import { useBeatAnimations } from "../../motion/beat-animations";
import { useLoopPlayback } from "../../motion/gate";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/** A pixel offset from the centre of an element, used to nudge where a beam leaves or arrives. */
export type BeamOffset = {
  /** Horizontal offset in px (positive moves towards the inline end). */
  x?: number;
  /** Vertical offset in px (positive moves down). */
  y?: number;
};

/** Props of {@link AnimatedBeam}. */
export type AnimatedBeamProps = {
  /** The positioned element that holds both ends (the beam fills it). Pass the same ref you put on that element. */
  containerRef: RefObject<HTMLElement | null>;
  /** Element the beam leaves from. Must be inside `containerRef`'s element. */
  fromRef: RefObject<HTMLElement | null>;
  /** Element the beam arrives at. Must be inside `containerRef`'s element. */
  toRef: RefObject<HTMLElement | null>;
  /**
   * Bend of the path in px, measured sideways from the straight line between the two elements. Positive bends to the
   * left of the direction of travel; 0 draws a straight line.
   * @default 0
   */
  curvature?: number;
  /**
   * Run from `toRef` to `fromRef` instead.
   * @default false
   */
  reverse?: boolean;
  /**
   * Seconds one pass of the beam takes from one end to the other.
   * @default 2.4
   */
  duration?: number;
  /**
   * Seconds the path rests, empty, between two passes.
   * @default 1.2
   */
  interval?: number;
  /**
   * Seconds before the first pass (lets several beams in one diagram run out of step).
   * @default 0
   */
  delay?: number;
  /**
   * Length of the travelling light in px, measured along the path.
   * @default 96
   */
  length?: number;
  /**
   * Thickness of the light and of the track in px.
   * @default 2.5
   */
  thickness?: number;
  /**
   * Gap in px kept between the path and the edge of each element.
   * @default 6
   */
  gap?: number;
  /** Colour at the tail of the light, any CSS colour. Defaults to the accent. */
  colorFrom?: string;
  /** Colour at the bright head of the light, any CSS colour. Defaults to the second accent (teal). */
  colorTo?: string;
  /**
   * Draw the faint static track under the light, so the connection reads even between passes.
   * @default true
   */
  track?: boolean;
  /** Nudges where the beam leaves `fromRef`, in px from its centre. */
  fromOffset?: BeamOffset;
  /** Nudges where the beam arrives at `toRef`, in px from its centre. */
  toOffset?: BeamOffset;
  /**
   * Hold the light where it is (it carries on from there when unpaused).
   * @default false
   */
  paused?: boolean;
  /** Adds extra classes to the overlay. */
  className?: string;
  /** Applies an inline style to the overlay. */
  style?: CSSProperties;
};

type Point = { x: number; y: number };
type Geometry = { width: number; height: number; d: string };

/** Samples per pass: dense enough that straight segments between them are indistinguishable from the curve. */
const STEPS = 48;
/** Share of a pass spent fading in and out at the two ends. */
const FADE = 0.12;

/** Where a ray from the centre of `rect` towards `toward` leaves the rectangle, pushed out by `gap`. */
function edgePoint(rect: DOMRect, origin: DOMRect, toward: Point, offset: BeamOffset | undefined, gap: number): Point {
  const cx = rect.left - origin.left + rect.width / 2 + (offset?.x ?? 0);
  const cy = rect.top - origin.top + rect.height / 2 + (offset?.y ?? 0);
  const dx = toward.x - cx;
  const dy = toward.y - cy;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return { x: cx, y: cy };
  const reach = Math.min(rect.width / 2 / Math.max(Math.abs(dx), 1e-6), rect.height / 2 / Math.max(Math.abs(dy), 1e-6));
  const travel = Math.min(reach, 1) * len + gap;
  return { x: cx + (dx / len) * travel, y: cy + (dy / len) * travel };
}

/** The soft radial glow of a lit endpoint. */
const flareBackground = (colour: string) =>
  `radial-gradient(circle, color-mix(in oklab, ${colour} 75%, transparent) 0%, color-mix(in oklab, ${colour} 25%, transparent) 45%, transparent 70%)`;

/** An ease that is mostly steady with a soft start and end, so the light speeds up out of one node and settles into the next. */
const soften = (t: number) => 0.5 * t + 0.5 * (t * t * (3 - 2 * t));

/**
 * Animated beam: a light that travels along a path between two elements, for integration diagrams, data-flow maps and
 * "connected to" sections.
 *
 * Pass a `containerRef` (the positioned element that holds the diagram) and two refs, `fromRef` and `toRef`. The beam
 * measures them, draws a faint track from the edge of one to the edge of the other (straight, or bent with `curvature`)
 * and sends a short comet of light along it, then rests for `interval` seconds before the next pass. It re-measures when
 * the container or either element resizes, so it follows a responsive layout. Several beams in one container read as a
 * network: stagger them with `delay`.
 *
 * Keyboard: Not focusable; it never takes pointer events, so the elements it connects stay clickable.
 * Accessibility: Purely decorative and `aria-hidden`. The relationship it draws must also be in the text or the labels of
 * the elements themselves (for example "Billing sends events to your API"), because the picture is invisible to assistive technology.
 * `paused` holds the light, so a page can offer a pause control for it (WCAG 2.2.2).
 * Glass: A sibling overlay above the content that never blurs, masks or filters anything, so glass nodes keep their backdrop.
 * Motion: The light is one element moved by `transform` along positions sampled from the real path, and it fades by `opacity`;
 * nothing is repainted per frame. It follows the shared 30 Hz beat (so glass nodes re-blur in step with everything else) and pauses off-screen and in hidden tabs. Reduced motion: no light, only the still track.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { AnimatedBeam, GlassCard } from "@sheenui/theme";
 *
 * export function Integration() {
 *   const container = useRef<HTMLDivElement>(null);
 *   const source = useRef<HTMLDivElement>(null);
 *   const target = useRef<HTMLDivElement>(null);
 *
 *   return (
 *     <div ref={container} className="relative flex items-center justify-between gap-24 p-8">
 *       <GlassCard ref={source} className="p-4">Events</GlassCard>
 *       <GlassCard ref={target} className="p-4">Your API</GlassCard>
 *       <AnimatedBeam containerRef={container} fromRef={source} toRef={target} curvature={40} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /effects/animated-beam
 */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration: pass = 2.4,
  interval = 1.2,
  delay = 0,
  length = 96,
  thickness = 2.5,
  gap = 6,
  colorFrom,
  colorTo,
  track = true,
  fromOffset,
  toOffset,
  paused = false,
  className,
  style,
}: AnimatedBeamProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cometRef = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation[]>([]);
  const startRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const reduced = useSheenReducedMotion();
  const playing = useLoopPlayback(rootRef, { paused });
  const clock = useBeatAnimations((ms) => {
    for (const anim of animation.current) anim.currentTime = ms;
  }, playing);

  const fromX = fromOffset?.x ?? 0;
  const fromY = fromOffset?.y ?? 0;
  const toX = toOffset?.x ?? 0;
  const toY = toOffset?.y ?? 0;

  // Measure (in an effect, not a layout effect: the container's own ref is attached only after its children's layout effects run): the path from the edge of one element to the edge of the other, in the container's own coordinates.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const from = fromRef.current;
      const to = toRef.current;
      if (!from || !to) return;
      const origin = container.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const centreA = {
        x: a.left - origin.left + a.width / 2 + fromX,
        y: a.top - origin.top + a.height / 2 + fromY,
      };
      const centreB = { x: b.left - origin.left + b.width / 2 + toX, y: b.top - origin.top + b.height / 2 + toY };
      const dx = centreB.x - centreA.x;
      const dy = centreB.y - centreA.y;
      const len = Math.hypot(dx, dy) || 1;
      const control = {
        x: (centreA.x + centreB.x) / 2 + (dy / len) * curvature,
        y: (centreA.y + centreB.y) / 2 - (dx / len) * curvature,
      };
      const start = edgePoint(a, origin, control, { x: fromX, y: fromY }, gap);
      const end = edgePoint(b, origin, control, { x: toX, y: toY }, gap);
      const round = (n: number) => Math.round(n * 10) / 10;
      const d = `M ${round(start.x)} ${round(start.y)} Q ${round(control.x)} ${round(control.y)} ${round(end.x)} ${round(end.y)}`;
      const next = { width: Math.round(origin.width), height: Math.round(origin.height), d };
      setGeometry((prev) =>
        prev?.d === next.d && prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    if (fromRef.current) observer.observe(fromRef.current);
    if (toRef.current) observer.observe(toRef.current);
    return () => observer.disconnect();
  }, [containerRef, fromRef, toRef, curvature, gap, fromX, fromY, toX, toY]);

  // The light: positions sampled once along the real path, played as one transform animation.
  useEffect(() => {
    const path = pathRef.current;
    const comet = cometRef.current;
    if (reduced || !geometry || !path || !comet || typeof comet.animate !== "function") return;
    const total = path.getTotalLength();
    if (!(total > 0)) return;

    const points: Point[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const s = soften(i / STEPS) * total;
      const p = path.getPointAtLength(reverse ? total - s : s);
      points.push({ x: p.x, y: p.y });
    }
    const period = Math.max(pass + Math.max(interval, 0), 0.1);
    const run = pass / period;
    const half = thickness / 2;
    const frames: Keyframe[] = points.map((p, i) => {
      const before = points[Math.max(i - 1, 0)] ?? p;
      const after = points[Math.min(i + 1, STEPS)] ?? p;
      const angle = Math.atan2(after.y - before.y, after.x - before.x);
      const t = i / STEPS;
      const opacity = t < FADE ? t / FADE : t > 1 - FADE ? (1 - t) / FADE : 1;
      return {
        offset: t * run,
        opacity,
        transform: `translate3d(${(p.x - length).toFixed(1)}px, ${(p.y - half).toFixed(1)}px, 0) rotate(${angle.toFixed(4)}rad)`,
      };
    });
    frames.push({ offset: 1, opacity: 0, transform: frames[frames.length - 1]?.transform });

    const anim = comet.animate(frames, {
      duration: period * 1000,
      delay: delay * 1000,
      iterations: Infinity,
      easing: "linear",
      fill: "both",
    });
    // The two ends light up: the source flares as the light leaves, the target as it arrives.
    const flare = (el: HTMLElement | null, at: Point | undefined, keys: [number, number][]) => {
      if (!el || !at || typeof el.animate !== "function") return null;
      const place = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
      return el.animate(
        keys.map(([offset, level]) => ({
          offset,
          opacity: level,
          transform: `${place} scale(${(0.5 + level * 0.9).toFixed(2)})`,
        })),
        { duration: period * 1000, delay: delay * 1000, iterations: Infinity, easing: "linear", fill: "both" },
      );
    };
    const settle = Math.min(run + (1 - run) * 0.6, 1);
    const made = [
      anim,
      flare(startRef.current, points[0], [
        [0, 1],
        [Math.min(run * 0.25, 0.5), 0.2],
        [1, 0.2],
      ]),
      flare(endRef.current, points[STEPS], [
        [0, 0.15],
        [run * 0.82, 0.15],
        [run, 1],
        [settle, 0.15],
        [1, 0.15],
      ]),
    ].filter((a): a is Animation => a !== null);
    // Paused: the shared beat moves them (~30 Hz), so glass nodes re-blur on the same frames as everything else.
    made.forEach((a) => {
      a.pause();
      a.currentTime = clock.current;
    });
    animation.current = made;
    return () => {
      made.forEach((a) => a.cancel());
      animation.current = [];
    };
  }, [reduced, geometry, reverse, pass, interval, delay, length, thickness, clock]);

  const tail = colorFrom ?? "var(--sheen-accent)";
  const head = colorTo ?? "var(--sheen-accent-2)";

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="animated-beam"
      data-paused={paused ? "" : undefined}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={style}
    >
      {geometry && (
        <>
          <svg
            width={geometry.width}
            height={geometry.height}
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            className="absolute top-0 left-0 overflow-visible"
          >
            <path
              d={geometry.d}
              fill="none"
              strokeWidth={thickness * 5}
              strokeLinecap="round"
              style={{ stroke: `color-mix(in oklab, ${tail} 9%, transparent)`, opacity: track ? 1 : 0 }}
            />
            <path
              ref={pathRef}
              d={geometry.d}
              fill="none"
              strokeWidth={Math.max(thickness * 0.8, 1.5)}
              strokeLinecap="round"
              strokeDasharray={`${thickness * 3} ${thickness * 2.5}`}
              style={{
                stroke: `color-mix(in oklab, ${tail} 55%, var(--sheen-fg) 12%)`,
                opacity: track ? 0.75 : 0,
              }}
            />
          </svg>
          {!reduced && (
            <>
              <span
                ref={startRef}
                data-slot="animated-beam-source"
                className="absolute top-0 left-0 -mt-4 -ml-4 block size-8 rounded-full opacity-0"
                style={{ background: flareBackground(tail) }}
              />
              <span
                ref={endRef}
                data-slot="animated-beam-target"
                className="absolute top-0 left-0 -mt-4 -ml-4 block size-8 rounded-full opacity-0"
                style={{ background: flareBackground(head) }}
              />
            </>
          )}
          {!reduced && (
            <span
              ref={cometRef}
              data-slot="animated-beam-light"
              className="absolute top-0 left-0 block origin-[100%_50%] rounded-full opacity-0"
              style={{
                width: length,
                height: thickness,
                background: `linear-gradient(to right, transparent, color-mix(in oklab, ${tail} 70%, transparent) 40%, ${tail} 72%, ${head})`,
                boxShadow: `0 0 ${thickness * 5}px ${thickness * 1.2}px color-mix(in oklab, ${head} 55%, transparent)`,
              }}
            >
              <span
                className="absolute top-1/2 right-0 block -translate-y-1/2 translate-x-1/2 rounded-full"
                style={{
                  width: thickness * 4,
                  height: thickness * 4,
                  background: `radial-gradient(circle, var(--sheen-fg) 0%, ${head} 40%, transparent 72%)`,
                  boxShadow: `0 0 ${thickness * 7}px ${thickness * 2}px color-mix(in oklab, ${head} 50%, transparent)`,
                }}
              />
            </span>
          )}
        </>
      )}
    </div>
  );
}
