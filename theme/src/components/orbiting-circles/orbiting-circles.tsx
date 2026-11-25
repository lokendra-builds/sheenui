"use client";

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { useLoopPlayback } from "../../motion/gate";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/** Props of {@link OrbitingCircles}. */
export type OrbitingCirclesProps = {
  /** The orbiting items (icons, logos, avatars): each child sits on the ring, evenly spaced. */
  children: ReactNode;
  /**
   * Radius of the ring in px, from the centre of the parent.
   * @default 120
   */
  radius?: number;
  /**
   * Seconds one full turn takes. Slow reads as calm: 20 to 40 suits a hero.
   * @default 28
   */
  duration?: number;
  /**
   * Turn anticlockwise instead of clockwise.
   * @default false
   */
  reverse?: boolean;
  /**
   * Angle of the first item in degrees, clockwise from the top. The others follow evenly; use it to offset one ring from another.
   * @default 0
   */
  startAngle?: number;
  /**
   * Draw the faint ring the items sit on.
   * @default true
   */
  path?: boolean;
  /**
   * Hold the ring still while the pointer or keyboard focus is on one of its items, so an item is never a moving target.
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * Accessible name for the group. Set it when the items mean something (integrations, team) and the ring is exposed as a labelled list; without it the whole ring is decorative and hidden from assistive technology.
   */
  label?: string;
  /**
   * Hold the ring where it is (it carries on from there when unpaused).
   * @default false
   */
  paused?: boolean;
  /** Adds extra classes to the overlay. It fills a `relative` parent; the ring is centred in it. */
  className?: string;
  /** Classes for every item's box (sizing, glass, rounding). */
  itemClassName?: string;
  /** Applies an inline style to the overlay. */
  style?: CSSProperties;
};

const RING_CLASS = "absolute top-1/2 left-1/2 m-0 size-0 list-none p-0";
const TURN = 360;

/**
 * Orbiting circles: items (tech logos, avatars, icons) circling a centre on a ring. Use it for "works with" and integration sections, around a product mark or a central glass card. Stack several with different `radius`, `duration` and `reverse` for a system of rings.
 *
 * Put it inside a `relative` parent with a size (the ring is centred in it) and place your centre content in the same parent. Each child is one item, evenly spaced from `startAngle`. Items stay upright as they travel. The ring is a thin faint circle (`path`). The group turns once per `duration` seconds; a ring that carries interactive items stops while the pointer or focus is on one (`pauseOnHover`), so nobody has to chase a button.
 *
 * Keyboard: Items are ordinary content: links and buttons inside keep their own Tab order. Focusing one holds the ring still. The ring itself is not focusable.
 * Accessibility: By default the ring is decorative and `aria-hidden`; never put interactive items in a hidden ring. Pass `label` and it becomes a labelled list with one list item per child, in order. Items keep their reading order however they move, and `paused` lets a page offer a stop control (WCAG 2.2.2).
 * Glass: The ring is a plain layer; give items a glass class through `itemClassName` and keep them to a handful in view (each blurred item is a backdrop-filter surface). Nothing here blurs, masks or filters the items.
 * Motion: Two `transform` rotations on the compositor per item (the ring turns, the item turns back to stay upright); nothing repaints. The ring pauses off-screen, in hidden tabs and under hover or focus. Reduced motion: the items rest on the ring, still.
 *
 * @example
 * ```tsx
 * import { OrbitingCircles } from "@sheenui/theme";
 *
 * export function Integrations() {
 *   return (
 *     <div className="relative mx-auto grid size-80 place-items-center">
 *       <span className="font-semibold">Your app</span>
 *       <OrbitingCircles label="Integrations" radius={110} duration={30}>
 *         <span className="grid size-10 place-items-center rounded-full bg-sheen-accent-soft">A</span>
 *         <span className="grid size-10 place-items-center rounded-full bg-sheen-accent-soft">B</span>
 *         <span className="grid size-10 place-items-center rounded-full bg-sheen-accent-soft">C</span>
 *       </OrbitingCircles>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /effects/orbiting-circles
 */
export function OrbitingCircles({
  children,
  radius = 120,
  duration = 28,
  reverse = false,
  startAngle = 0,
  path = true,
  pauseOnHover = true,
  label,
  paused = false,
  className,
  itemClassName,
  style,
}: OrbitingCirclesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLUListElement>(null);
  const animations = useRef<Animation[]>([]);
  const playingRef = useRef(false);
  const [engaged, setEngaged] = useState(false);
  const reduced = useSheenReducedMotion();
  const items = Children.toArray(children);
  const playing = useLoopPlayback(rootRef, { paused: paused || (pauseOnHover && engaged) });
  useEffect(() => {
    playingRef.current = playing;
  });

  useEffect(() => {
    const ring = ringRef.current;
    if (reduced || !ring || typeof ring.animate !== "function" || items.length === 0) return;
    const turn = reverse ? -TURN : TURN;
    const options: KeyframeAnimationOptions = {
      duration: duration * 1000,
      iterations: Infinity,
      easing: "linear",
    };
    const made = [
      ring.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${turn}deg)` }], options),
      // Each item turns back by the same amount, so it stays upright.
      ...Array.from(ring.querySelectorAll<HTMLElement>(":scope > li")).map((li) =>
        li.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${-turn}deg)` }], options),
      ),
    ];
    for (const anim of made) if (!playingRef.current) anim.pause();
    animations.current = made;
    return () => {
      made.forEach((anim) => anim.cancel());
      animations.current = [];
    };
  }, [reduced, duration, reverse, items.length]);

  useEffect(() => {
    for (const anim of animations.current) {
      if (playing) anim.play();
      else anim.pause();
    }
  }, [playing]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- focus inside an item holds the decorative ring still (the pointer does the same on the items); the root is not itself interactive
    <div
      ref={rootRef}
      aria-hidden={label ? undefined : true}
      data-slot="orbiting-circles"
      data-paused={paused ? "" : undefined}
      className={cn("pointer-events-none absolute inset-0", className)}
      style={style}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
    >
      {path && (
        <>
          <span
            aria-hidden="true"
            data-slot="orbiting-circles-glow"
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: radius * 1.6,
              height: radius * 1.6,
              marginLeft: -radius * 0.8,
              marginTop: -radius * 0.8,
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--sheen-accent) 26%, transparent) 0%, color-mix(in oklab, var(--sheen-accent-2) 10%, transparent) 45%, transparent 70%)",
            }}
          />
          <span
            data-slot="orbiting-circles-path"
            className="absolute top-1/2 left-1/2 rounded-full border"
            style={{
              width: radius * 2,
              height: radius * 2,
              marginLeft: -radius,
              marginTop: -radius,
              borderColor: "color-mix(in oklab, var(--sheen-accent) 38%, var(--sheen-fg) 10%)",
              boxShadow:
                "0 0 18px color-mix(in oklab, var(--sheen-accent) 22%, transparent), inset 0 0 22px color-mix(in oklab, var(--sheen-accent) 14%, transparent)",
            }}
          />
        </>
      )}
      <ul ref={ringRef} aria-label={label} className={RING_CLASS}>
        {items.map((item, i) => {
          const angle = ((startAngle + (i * TURN) / items.length) * Math.PI) / 180;
          return (
            <li
              key={i}
              className="absolute m-0 size-0 p-0"
              style={{ left: Math.sin(angle) * radius, top: -Math.cos(angle) * radius }}
            >
              <div
                data-orbit-item=""
                onPointerEnter={() => setEngaged(true)}
                onPointerLeave={() => setEngaged(false)}
                className={cn("pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2", itemClassName)}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in oklab, var(--sheen-accent) 42%, transparent) 0%, transparent 70%)",
                  }}
                />
                {item}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
