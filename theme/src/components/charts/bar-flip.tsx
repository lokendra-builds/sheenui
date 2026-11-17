"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { animate, type Transition } from "motion/react";

import { useLatest } from "../../hooks/use-latest";

/** Narrowest rendered bar (SVG user units): a bar that shrinks to nothing keeps a sliver so the scale ratio stays finite. */
export const MIN_BAR = 0.01;

/**
 * Wraps a horizontal bar whose `x` and `width` are written as final attributes, and animates changes of them with a
 * transform only (FLIP): the group is scaled and shifted from the previous geometry back to identity around its left
 * edge, so no SVG `width` or `x` is ever interpolated. The first render and `Transition` of `duration: 0` (reduced
 * motion) do not animate. Put the bar's own grow-in (a `scaleX` from its anchored edge) on the child.
 *
 * Props: `x` and `width` are the bar's final geometry in user units; `transition` is the Motion transition to use.
 * Accessibility: purely visual; the group adds no semantics and the child keeps its own.
 *
 * @internal Not part of the public barrel: the example documents the module's own helper.
 * @example
 * ```tsx
 * import { BarFlip } from "./bar-flip";
 *
 * export function Example() {
 *   return (
 *     <svg width={100} height={20}>
 *       <BarFlip x={10} width={60} transition={{ duration: 0.3 }}>
 *         <rect x={10} width={60} height={10} />
 *       </BarFlip>
 *     </svg>
 *   );
 * }
 * ```
 *
 * @see /charts/population-pyramid
 */
export function BarFlip({
  x,
  width,
  transition,
  children,
}: {
  x: number;
  width: number;
  transition: Transition;
  children: ReactNode;
}) {
  const ref = useRef<SVGGElement>(null);
  const prev = useRef({ x, width });
  // A fresh object every render: read it through a ref so only a geometry change restarts the animation.
  const latest = useLatest(transition);
  useLayoutEffect(() => {
    const was = prev.current;
    prev.current = { x, width };
    const el = ref.current;
    const options = latest.current;
    if (!el || (was.x === x && was.width === width) || (options as { duration?: number }).duration === 0) return;
    const scale = Math.max(was.width, MIN_BAR) / Math.max(width, MIN_BAR);
    const controls = animate(el, { x: [was.x - x, 0], scaleX: [scale, 1] }, options);
    return () => controls.stop();
  }, [x, width, latest]);
  return (
    <g ref={ref} style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}>
      {children}
    </g>
  );
}
