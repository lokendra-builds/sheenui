"use client";

import { useEffect, useEffectEvent, useRef, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { useInView } from "motion/react";

import { cn } from "../../lib/cn";
import { ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { usePlayback } from "./text-utils";

/**
 * Props of `ShimmerText`: the native `<span>` props plus its own options, each documented on its
 * field.
 */
export type ShimmerTextProps = Omit<ComponentProps<"span">, "children"> & {
  /** Text (and inline icons). Avoid interactive content: it is copied for the highlight layer. */
  children: ReactNode;
  /**
   * When the light sweeps:
   *  "view"  once, the first time the text scrolls into view (default)
   *  "hover" each time a pointer enters it, or keyboard focus reaches the control around it
   *  "loop"  continuously while on screen (status lines); pauses off screen and in hidden tabs
   *  "mount" once, right away.
   */
  trigger?: "view" | "hover" | "loop" | "mount";
  /** Seconds one sweep takes. Default 1.6. */
  duration?: number;
  /** Sets the number of seconds before the first sweep. Default 0. */
  delay?: number;
  /** Sets the number of seconds between sweeps when looping. Default 1. */
  repeatDelay?: number;
  /** Highlight colour, any CSS colour. Defaults to the accent, which keeps AA contrast. */
  color?: string;
  /** Sets the width of the light band, in em. Default 5. */
  spread?: number;
  /** Stop a looping shimmer. Default false. */
  paused?: boolean;
};

/**
 * Shimmer text: a band of light sweeps across the letters, once when the text appears, on hover, or on a loop (a "Thinking..." status line). `trigger` is "view"
 * (default), "hover", "loop" or "mount"; `duration`, `delay`, `repeatDelay`, `color` and `spread` shape the sweep; `paused` stops a loop from outside.
 * Inside a link or button, "hover" listens to that whole control (its padding included).
 *
 * How it stays cheap (transform only, no per-frame paint):
 * - The real text is untouched and stays the accessible text (nothing is split or hidden).
 * - On top sits an `aria-hidden` copy in the highlight colour, seen through a soft-edged band (a static mask). The band's window slides right with a transform while the copy
 *   inside it slides left by the same amount, so the copy stays exactly over the real letters and only the band appears to move.
 * - The sweep is clipped sideways (`overflow-x: clip`) so it can never widen the page.
 *
 * Keyboard: none; with "hover", keyboard focus reaching the control around it triggers the sweep too. Accessibility: the highlight copy is `aria-hidden`; the default highlight colour is the accent,
 * which keeps AA contrast. A looping shimmer pauses off screen and in hidden tabs.
 * Glass and motion: no backdrop blur. Reduced motion: no overlay at all, just the text. Forced colours: the overlay is hidden.
 *
 * @example
 * ```tsx
 * import { ShimmerText } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ShimmerText trigger="loop" className="text-sheen-fg-muted">Generating your report...</ShimmerText>
 *   );
 * }
 * ```
 *
 * @see /effects/shimmer-text
 */
export function ShimmerText({
  children,
  trigger = "view",
  duration = 1.6,
  delay = 0,
  repeatDelay = 1,
  color,
  spread = 5,
  paused = false,
  className,
  style,
  ...props
}: ShimmerTextProps) {
  const reduced = useSheenReducedMotion();
  const outerRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);

  const windowRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  // Text box width and band width in px, read at play time (kept current by the observer below).
  const sizes = useRef({ width: 0, band: 0 });
  // The running sweep: native Web Animations on two transforms (compositor, off the main thread).
  const running = useRef<Animation[]>([]);

  // Effect Events: called from the effects below, they read the latest timings without making them a reason to restart.
  const stop = useEffectEvent(() => {
    running.current.forEach((a) => a.cancel());
    running.current = [];
  });
  /** One sweep (`loops` false) or a repeating one with `rest` seconds between sweeps, baked into the keyframes. */
  const play = useEffectEvent((opts: { delay?: number; loops?: boolean }) => {
    const win = windowRef.current;
    const copy = copyRef.current;
    if (!win || !copy) return;
    stop();
    const { width, band } = sizes.current;
    const sweep = duration * 1000;
    const total = opts.loops ? sweep + repeatDelay * 1000 : sweep;
    const at = sweep / total;
    const timing: KeyframeAnimationOptions = {
      duration: total,
      delay: (opts.delay ?? 0) * 1000,
      easing: `cubic-bezier(${ease.inOut.join(",")})`,
      iterations: opts.loops ? Infinity : 1,
      fill: "none",
    };
    const frames = (from: string, to: string): Keyframe[] =>
      opts.loops
        ? [{ transform: from }, { transform: to, offset: at }, { transform: to }]
        : [{ transform: from }, { transform: to }];
    running.current = [
      win.animate(frames(`translateX(${-band}px)`, `translateX(${width}px)`), timing),
      copy.animate(frames(`translateX(${band}px)`, `translateX(${-width}px)`), timing),
    ];
  });

  // Measure the text box and the band (spread × font size), and keep them current.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || reduced) return;
    const measure = () => {
      const px = spread * parseFloat(getComputedStyle(box).fontSize || "16");
      sizes.current = { width: box.offsetWidth, band: px };
      box.style.setProperty("--shimmer-band", `${px}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [reduced, spread]);

  const inView = useInView(outerRef, { once: true, amount: 0.6 });
  const looping = usePlayback(outerRef, { paused: paused || reduced || trigger !== "loop", pauseOnHover: false });

  // One-shot sweeps: "mount" and "view".
  useEffect(() => {
    if (reduced || (trigger !== "mount" && trigger !== "view")) return;
    if (trigger === "view" && !inView) return;
    play({ delay });
    return () => stop();
  }, [reduced, trigger, inView, duration, delay]);

  // Looping sweep, only while on screen and visible (usePlayback pauses it off screen and in hidden tabs).
  useEffect(() => {
    if (!looping) return;
    play({ delay, loops: true });
    return () => stop();
  }, [looping, duration, delay, repeatDelay]);

  // Hover / keyboard focus: on the closest link or button if there is one, else the text itself.
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer || reduced || trigger !== "hover") return;
    const target = outer.closest<HTMLElement>("a, button, [role='button'], [role='link'], label") ?? outer;
    const sweep = () => {
      if (running.current.some((a) => a.playState === "running")) return;
      play({});
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "touch") sweep();
    };
    const focus = () => {
      if (target.matches(":focus-visible")) sweep();
    };
    target.addEventListener("pointerenter", enter);
    target.addEventListener("focus", focus);
    return () => {
      target.removeEventListener("pointerenter", enter);
      target.removeEventListener("focus", focus);
      stop();
    };
  }, [reduced, trigger, duration]);

  return (
    <span
      ref={outerRef}
      data-slot="shimmer-text"
      className={cn("inline-block", className)}
      style={{ ...(color && { "--shimmer-color": color }), ...style }}
      {...props}
    >
      <span ref={boxRef} className="relative inline-block overflow-x-clip">
        {children}
        {!reduced && (
          <span
            ref={windowRef}
            aria-hidden
            inert
            data-slot="shimmer-band"
            className="pointer-events-none absolute inset-0 select-none forced-colors:hidden"
            style={{ transform: "translateX(calc(var(--shimmer-band, 5em) * -1))", ...bandMask }}
          >
            <span
              ref={copyRef}
              className="absolute inset-0 [color:var(--shimmer-color,var(--sheen-accent))] [&_*]:text-inherit"
              style={{ transform: "translateX(var(--shimmer-band, 5em))" }}
            >
              {children}
            </span>
          </span>
        )}
      </span>
    </span>
  );
}

/** A soft band at the left end of the window: transparent → opaque → transparent. */
const bandMask: CSSProperties = {
  WebkitMaskImage: "linear-gradient(90deg, transparent, black 50%, transparent)",
  maskImage: "linear-gradient(90deg, transparent, black 50%, transparent)",
  WebkitMaskSize: "var(--shimmer-band, 5em) 100%",
  maskSize: "var(--shimmer-band, 5em) 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "0 0",
  maskPosition: "0 0",
};
