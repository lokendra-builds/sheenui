"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { cn } from "../../lib/cn";
import { seededRandom } from "../../lib/canvas-effects";
import { useBeatAnimations } from "../../motion/beat-animations";
import { useLoopPlayback } from "../../motion/gate";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/** Props of {@link Meteors}. */
export type MeteorsProps = {
  /**
   * How many meteors share the field. Each one flies, then rests for a few seconds, so only a couple are ever in view at once. Capped at 24.
   * @default 12
   */
  count?: number;
  /**
   * Direction of travel in degrees, clockwise from pointing right: 90 flies straight down, 125 down and to the left, 45 down and to the right.
   * @default 125
   */
  angle?: number;
  /**
   * Length of a streak in px; each one varies a little around it.
   * @default 140
   */
  length?: number;
  /**
   * Seconds one flight takes, on average.
   * @default 1.6
   */
  duration?: number;
  /**
   * Seconds a meteor rests between flights, on average; this is what keeps them occasional.
   * @default 3.2
   */
  interval?: number;
  /** Colour of the bright head, any CSS colour. Defaults to the second accent (teal). */
  color?: string;
  /**
   * Hold every streak where it is (they carry on from there when unpaused).
   * @default false
   */
  paused?: boolean;
  /**
   * Seed for the layout and timing, so the same card looks the same on the server and in the browser.
   * @default 3
   */
  seed?: number;
  /** Adds extra classes to the overlay. It fills its `relative` parent and takes the parent's corner radius. */
  className?: string;
  /** Applies an inline style to the overlay. */
  style?: CSSProperties;
};

type Meteor = {
  /** Start along the cross axis, 0..1 of the field. */
  at: number;
  /** Seconds of flight and of rest, for this meteor. */
  flight: number;
  rest: number;
  /** Seconds before its first flight. */
  wait: number;
  length: number;
  /** 0.55..1 */
  strength: number;
  /** Streak thickness in px: nearer (bigger, faster, brighter) meteors are thicker. */
  thickness: number;
};

const MAX = 24;
/** How many still streaks reduced motion draws. */
const STILL = 4;

function plan(count: number, seed: number, length: number, duration: number, interval: number): Meteor[] {
  const random = seededRandom(seed);
  return Array.from({ length: Math.min(Math.max(Math.round(count), 0), MAX) }, () => {
    // Depth: near meteors are longer, thicker, brighter and faster; far ones are short, thin and slow.
    const depth = random();
    const flight = (duration * (0.8 + random() * 0.4)) / (0.75 + depth * 0.5);
    const rest = interval * (0.4 + random() * 0.9);
    return {
      at: random(),
      flight,
      rest,
      wait: random() * (flight + rest),
      length: length * (0.6 + depth * 0.8),
      strength: 0.7 + depth * 0.3,
      thickness: 1.5 + depth * 2,
    };
  });
}

/**
 * Meteors: occasional streaks of light crossing a card or a section background. Put it inside a `relative` card (a glass card, a hero) to add a quiet sense of space.
 *
 * It fills its parent, follows the parent's corner radius, clips its streaks to it and never takes pointer events. Each meteor flies for about `duration` seconds and then rests for about `interval` seconds, at its own offset, so the card is mostly still with a streak now and then. `count` is capped at 24, `angle` sets the direction, and the head colour is a token (the second accent) so themes and presets recolour it.
 *
 * Keyboard: Not focusable and never takes pointer events.
 * Accessibility: Decorative and `aria-hidden`. Streaks are thin and fade quickly, and never cross text for long enough to hurt reading; use `paused` as a control wherever a card sits next to long text (WCAG 2.2.2).
 * Glass: A clipped sibling layer with no blur, mask or filter on it; place it behind glass content so the glass blurs the streaks, or above flat content.
 * Motion: Every streak is one element moved by `transform` (and faded by `opacity`) on the compositor, so nothing repaints per frame. They follow the shared 30 Hz beat (so glass above re-blurs in step with everything else) and pause off-screen and in hidden tabs. Reduced motion: no flight; a few faint still streaks stay as texture.
 *
 * @example
 * ```tsx
 * import { GlassCard, Meteors } from "@sheenui/theme";
 *
 * export function Card() {
 *   return (
 *     <GlassCard className="relative overflow-hidden p-10">
 *       <Meteors count={6} />
 *       <h3 className="relative text-xl font-semibold">Launch week</h3>
 *     </GlassCard>
 *   );
 * }
 * ```
 *
 * @see /effects/meteors
 */
export function Meteors({
  count = 12,
  angle = 125,
  length = 140,
  duration = 1.6,
  interval = 3.2,
  color,
  paused = false,
  seed = 3,
  className,
  style,
}: MeteorsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useSheenReducedMotion();
  const playing = useLoopPlayback(rootRef, { paused });
  const animations = useRef<Animation[]>([]);
  const clock = useBeatAnimations((ms) => {
    for (const anim of animations.current) anim.currentTime = ms;
  }, playing);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const meteors = useMemo(
    () => plan(count, seed, length, duration, interval),
    [count, seed, length, duration, interval],
  );
  const head = color ?? "var(--sheen-accent-2)";

  // The field's size, so a flight is exactly long enough to cross it.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      setBox((prev) =>
        prev.width === Math.round(rect.width) && prev.height === Math.round(rect.height)
          ? prev
          : { width: Math.round(rect.width), height: Math.round(rect.height) },
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const rad = (angle * Math.PI) / 180;
  const dirX = Math.cos(rad);
  const dirY = Math.sin(rad);

  // Where a meteor starts: just outside the edge it flies in from, spread along that edge by `at`.
  function startOf(m: Meteor) {
    const { width, height } = box;
    const reach = Math.abs(dirX) * width + Math.abs(dirY) * height;
    // The start line is perpendicular to the flight; centre it on the field and slide along it.
    const nx = -dirY;
    const ny = dirX;
    const half = (Math.abs(nx) * width + Math.abs(ny) * height) / 2;
    const slide = (m.at * 2 - 1) * half;
    return {
      x: width / 2 - dirX * (reach / 2 + m.length) + nx * slide,
      y: height / 2 - dirY * (reach / 2 + m.length) + ny * slide,
      distance: reach + m.length * 2,
    };
  }

  useEffect(() => {
    const root = rootRef.current;
    if (reduced || !root || box.width === 0 || typeof root.animate !== "function") return;
    const lights = root.querySelectorAll<HTMLElement>("[data-meteor]");
    const made: Animation[] = [];
    lights.forEach((el, i) => {
      const m = meteors[i];
      if (!m) return;
      const s = startOf(m);
      const period = m.flight + m.rest;
      const run = m.flight / period;
      const at = (t: number) =>
        `translate3d(${(s.x + dirX * s.distance * t).toFixed(1)}px, ${(s.y + dirY * s.distance * t).toFixed(1)}px, 0) rotate(${angle}deg)`;
      const anim = el.animate(
        [
          { offset: 0, opacity: 0, transform: at(0) },
          { offset: run * 0.12, opacity: m.strength, transform: at(0.12) },
          { offset: run * 0.8, opacity: m.strength, transform: at(0.8) },
          { offset: run, opacity: 0, transform: at(1) },
          { offset: 1, opacity: 0, transform: at(1) },
        ],
        { duration: period * 1000, delay: m.wait * 1000, iterations: Infinity, easing: "linear", fill: "both" },
      );
      // Paused: the shared beat moves it (~30 Hz), so glass above the streaks re-blurs on the same frames as everything else.
      anim.pause();
      anim.currentTime = clock.current;
      made.push(anim);
    });
    animations.current = made;
    return () => {
      made.forEach((anim) => anim.cancel());
      animations.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startOf is recreated every render; its inputs are listed
  }, [reduced, meteors, box.width, box.height, angle]);

  // Reduced motion: a few faint still streaks, frozen part-way across.
  const still = reduced ? meteors.slice(0, STILL) : [];

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="meteors"
      data-paused={paused ? "" : undefined}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}
      style={style}
    >
      {reduced
        ? box.width > 0 &&
          still.map((m, i) => {
            const s = startOf(m);
            const t = 0.3 + 0.4 * ((i * 0.37) % 1);
            return (
              <Streak
                key={i}
                length={m.length}
                thickness={m.thickness}
                head={head}
                style={{
                  opacity: 0.7,
                  transform: `translate3d(${(s.x + dirX * s.distance * t).toFixed(1)}px, ${(s.y + dirY * s.distance * t).toFixed(1)}px, 0) rotate(${angle}deg)`,
                }}
              />
            );
          })
        : meteors.map((m, i) => (
            <Streak
              key={i}
              data-meteor=""
              length={m.length}
              thickness={m.thickness}
              head={head}
              style={{ opacity: 0 }}
            />
          ))}
    </div>
  );
}

function Streak({
  length,
  thickness,
  head,
  style,
  ...rest
}: {
  length: number;
  thickness: number;
  head: string;
  style: CSSProperties;
  "data-meteor"?: string;
}) {
  return (
    <span
      {...rest}
      className="absolute top-0 left-0 block origin-[0%_50%] rounded-full"
      style={{
        ...style,
        width: length,
        height: thickness,
        // The tail is on the left (behind the direction of travel), tapering from nothing to the bright head on the right.
        background: `linear-gradient(to right, transparent, color-mix(in oklab, var(--sheen-accent) 55%, transparent) 40%, color-mix(in oklab, ${head} 85%, transparent) 80%, ${head})`,
      }}
    >
      <i
        className="absolute top-1/2 right-0 block -translate-y-1/2 rounded-full"
        style={{
          width: thickness * 2.6,
          height: thickness * 2.6,
          marginRight: -thickness * 0.8,
          background: `radial-gradient(circle, var(--sheen-fg) 0%, ${head} 45%, transparent 72%)`,
          boxShadow: `0 0 ${thickness * 5}px ${thickness * 1.2}px color-mix(in oklab, ${head} 55%, transparent)`,
        }}
      />
    </span>
  );
}
