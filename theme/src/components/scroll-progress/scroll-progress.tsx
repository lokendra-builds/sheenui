"use client";

import { useEffect, useRef, type ComponentProps, type RefObject } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";

import { cn } from "../../lib/cn";
import { follow } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/** Where a {@link ScrollProgress} bar sits. */
export type ScrollProgressPlacement = "top" | "bottom" | "inline";

/** Props of {@link ScrollProgress}: the native `<div>` props plus its own options. */
export type ScrollProgressProps = Omit<ComponentProps<"div">, "children"> & {
  /**
   * Fixed to the top or bottom edge of the viewport, or `"inline"` to sit in the flow (for example inside a card header or a sticky bar of your own).
   * @default "top"
   */
  placement?: ScrollProgressPlacement;
  /** The scrollable element to follow. Defaults to the page. */
  container?: RefObject<HTMLElement | null>;
  /**
   * Sets the height of the bar in px.
   * @default 4
   */
  thickness?: number;
  /**
   * Ease the bar after the scroll with the scroll spring, so it glides instead of stepping. Ignored under reduced motion, where it follows the scroll exactly.
   * @default true
   */
  smooth?: boolean;
  /** Colour at the start of the bar, any CSS colour. Defaults to the accent. */
  colorFrom?: string;
  /** Colour at the leading end of the bar, any CSS colour. Defaults to the second accent (teal). */
  colorTo?: string;
  /**
   * Accessible name. Leave it out (the default) when the bar only decorates a page that already has a scrollbar: the bar is then hidden from assistive technology. Set it ("Reading progress") when the position matters, and the bar becomes a `progressbar` whose value updates in 5 % steps.
   */
  label?: string;
};

/** The value of an exposed progress bar changes in steps this big, so it never chatters while someone scrolls. */
const STEP = 5;

/**
 * Scroll progress: a thin bar that fills as the page, or a scrollable panel, is scrolled. Use it on long articles, docs and guides, where it shows how far through the reader is.
 *
 * It sits fixed on the top or bottom edge (`placement`), or in the flow with `placement="inline"`. Give it a `container` ref to follow a scrollable panel instead of the page. The fill is a `scaleX` transform, so scrolling never causes layout or paint work, and it follows `dir`: the bar grows from the inline start. The colours are tokens (accent to second accent) and can be overridden.
 *
 * Keyboard: Not focusable and never takes pointer events.
 * Accessibility: Decision: the bar is decorative by default and `aria-hidden`, because browsers already announce and show scroll position and a progress role that changes on every scroll would be noise. Pass `label` only where the position carries meaning (a reading-progress bar in a course or a long form): it then becomes a `progressbar` with that name, with a value that updates in 5 % steps. Forced colors: the bar uses the system highlight colour.
 * Glass: A plain strip with no blur; it can sit over a glass header without changing it.
 * Motion: The fill is driven by the scroll position through a MotionValue and a transform only; no React renders while scrolling and no loop runs, so there is nothing to pause. Reduced motion: the bar still tracks the scroll exactly (that is a direct mapping, not an animation) but without easing.
 *
 * @example
 * ```tsx
 * import { ScrollProgress } from "@sheenui/theme";
 *
 * export function Article() {
 *   return (
 *     <>
 *       <ScrollProgress label="Reading progress" />
 *       <article className="prose mx-auto h-[300vh]">A long read.</article>
 *     </>
 *   );
 * }
 * ```
 *
 * @see /effects/scroll-progress
 */
export function ScrollProgress({
  placement = "top",
  container,
  thickness = 4,
  smooth = true,
  colorFrom,
  colorTo,
  label,
  className,
  style,
  ...props
}: ScrollProgressProps) {
  const reduced = useSheenReducedMotion();
  const { scrollYProgress } = useScroll(container ? { container } : undefined);
  const spring = useSpring(scrollYProgress, follow.scroll);
  const scaleX = smooth && !reduced ? spring : scrollYProgress;
  const headX = useTransform(scaleX, (v) => `${Math.min(Math.max(v, 0), 1) * 100}%`);
  const barRef = useRef<HTMLDivElement>(null);
  const shown = useRef(-1);

  const write = (progress: number) => {
    const bar = barRef.current;
    if (!bar || label === undefined) return;
    const stepped = Math.min(100, Math.max(0, Math.round((progress * 100) / STEP) * STEP));
    if (stepped === shown.current) return;
    shown.current = stepped;
    bar.setAttribute("aria-valuenow", String(stepped));
    bar.setAttribute("aria-valuetext", `${stepped}%`);
  };
  useMotionValueEvent(scrollYProgress, "change", write);
  useEffect(() => write(scrollYProgress.get()));

  const from = colorFrom ?? "var(--sheen-accent)";
  const to = colorTo ?? "var(--sheen-accent-2)";

  return (
    <div
      ref={barRef}
      data-slot="scroll-progress"
      role={label === undefined ? undefined : "progressbar"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      aria-valuemin={label === undefined ? undefined : 0}
      aria-valuemax={label === undefined ? undefined : 100}
      className={cn(
        "pointer-events-none overflow-x-clip",
        placement === "inline" ? "relative w-full" : "fixed inset-x-0 z-[60]",
        placement === "top" && "top-0",
        placement === "bottom" && "bottom-0",
        className,
      )}
      style={{ height: thickness, ...style }}
      {...props}
    >
      <motion.div
        className="h-full w-full origin-left rtl:origin-right forced-colors:bg-[Highlight] forced-colors:[background-image:none]"
        style={{
          scaleX,
          backgroundImage: `linear-gradient(to right, ${from}, ${to})`,
          boxShadow: `0 0 ${thickness * 3}px color-mix(in oklab, ${to} 50%, transparent)`,
        }}
      />
      {/* The glowing tip: a wide soft ellipse centred on the leading edge, moved by transform only. */}
      <motion.div
        aria-hidden="true"
        data-slot="scroll-progress-glow"
        className="absolute top-1/2 left-0 h-0 w-full rtl:hidden forced-colors:hidden"
        style={{ x: headX }}
      >
        <span
          className="absolute top-0 left-0 block -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: thickness * 14,
            height: thickness * 5,
            background: `radial-gradient(ellipse at center, var(--sheen-fg) 0%, ${to} 22%, color-mix(in oklab, ${to} 40%, transparent) 50%, transparent 72%)`,
            opacity: 0.85,
          }}
        />
      </motion.div>
    </div>
  );
}
