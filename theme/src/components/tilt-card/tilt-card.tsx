"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

type TiltContextValue = { x: MotionValue<number>; y: MotionValue<number>; on: MotionValue<number> };

/** Shows only the element's padding (a 1px ring): the content box is cut out of a full mask. */
const rimMask: CSSProperties = {
  WebkitMask: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(black, black) content-box exclude, linear-gradient(black, black)",
};

const TiltContext = createContext<TiltContextValue | null>(null);

type MotionConflicts =
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd" | "style";

/** Props of `TiltCard`: the native `<div>` props plus its own options, each documented on its field. */
export type TiltCardProps = Omit<ComponentProps<"div">, MotionConflicts> & {
  /** Sets the glass level: 1 = subtle, 2 = cards (default), 3 = most opaque. */
  level?: 1 | 2 | 3;
  /** Tints the surface with the accent colour. */
  tint?: boolean;
  /** Largest tilt in degrees, 0 to 8 (clamped). Default 6. */
  maxTilt?: number;
  /** Draws a light that slides across the surface. Default true. */
  glare?: boolean;
  /** Colour of the glare (any CSS colour, keep it translucent). Defaults to a white light, stronger in light mode. */
  glareColor?: string;
  /** Scale while the pointer is on the card (1 for none). Default 1.02. */
  hoverScale?: number;
  /** Distance to the "camera" in px: smaller is more dramatic. Default 1000. */
  perspective?: number;
  /** Inline styles for the card (merged with the tilt transform, which wins). */
  style?: CSSProperties;
};

const follow = { stiffness: 320, damping: 32, mass: 0.6 }; // follow.pointer

type Box = { left: number; top: number; width: number; height: number };

/** The card's box in the viewport without its own transform: where it sits in the layout. */
function untransformedBox(el: HTMLElement): Box {
  const transform = el.style.transform;
  el.style.transform = "none";
  const rect = el.getBoundingClientRect();
  el.style.transform = transform;
  return { left: rect.left, top: rect.top, width: rect.width || 1, height: rect.height || 1 };
}

/**
 * Tilt card: a glass card that leans toward the pointer in 3D (at most 8°), with a glare and a specular streak
 * that slide across its surface and a rim light that runs along its edge nearest the pointer, all on springs.
 * It eases into the lean, even when the pointer enters right at an edge. Use it for hero tiles and featured
 * cards; use `SpotlightCard` for a flat glow and `GlassCard` for a calm surface.
 *
 * - `level` and `tint` pick the glass; `maxTilt` (0 to 8), `hoverScale` and `perspective` shape the motion;
 *   `glare={false}` removes the light and `glareColor` recolours the glare, streak and rim together.
 * - Wrap content in `TiltCardLayer depth={12}` for parallax: that layer drifts toward the pointer, so the card
 *   reads as having depth without preserve-3d (which glass cannot use).
 * - The tilt is applied to the glass element itself (`transform: perspective() rotateX rotateY`), never to a
 *   wrapper, so its backdrop blur keeps working.
 * - Steady at the edges: whether the pointer is on the card is decided against the card's untilted box, not the
 *   tilted shape. A tilted corner pulls in a few px; testing against the moving shape would make the card shake when
 *   the pointer rests near a corner.
 *
 * Keyboard: a plain card is not focusable; interactive children keep their own tab stops and the tilt does not
 * move them out from under the focus ring. Accessibility: the glare, streak and rim are decorative (`aria-hidden`); the
 * glare sits behind the content inside the glass, so text stays crisp and AA. Hidden in forced colors.
 * Glass and motion: one `backdrop-filter` surface. Off for touch (a finger on a card is scrolling) and under reduced
 * motion: then it is a still glass card. The tilt is capped at 8° for comfort.
 *
 * @example
 * ```tsx
 * import { TiltCard, TiltCardLayer } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TiltCard className="p-6" maxTilt={6}>
 *       <TiltCardLayer depth={12}>
 *         <h3>Pro plan</h3>
 *       </TiltCardLayer>
 *       <p>Everything in Free, plus more.</p>
 *     </TiltCard>
 *   );
 * }
 * ```
 *
 * @see /effects/3d-tilt-card
 */
export function TiltCard({
  level = 2,
  tint = false,
  maxTilt = 6,
  glare = true,
  glareColor,
  hoverScale = 1.02,
  perspective = 1000,
  className,
  style,
  children,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: TiltCardProps) {
  const reduced = useSheenReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const tilt = Math.min(Math.max(maxTilt, 0), 8);

  // Pointer position in the card, -1..1 per axis (0 = centre), and whether it is on the card.
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const targetOn = useMotionValue(0);
  const x = useSpring(targetX, follow);
  const y = useSpring(targetY, follow);
  const on = useSpring(targetOn, follow);
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  // Everything is weighted by `on`, so the card eases into its lean (and back) on a spring
  // even when the pointer comes in right at an edge.
  const rotateX = useTransform(() => -y.get() * tilt * on.get());
  const rotateY = useTransform(() => x.get() * tilt * on.get());
  const scale = useTransform(() => 1 + (hoverScale - 1) * on.get());
  // A glare disc 1.5× the card's width, centred on the pointer, brightest near the top edge.
  const glareX = useTransform(() => ((x.get() + 1) / 2 - 0.75) * width.get());
  const glareY = useTransform(() => ((y.get() + 1) / 2) * height.get() - 0.75 * width.get());
  const glareOpacity = useTransform(() => on.get() * (0.6 + 0.4 * Math.max(0, -y.get())));
  // A diagonal streak, like light catching a sheet of glass: it runs ahead of the pointer.
  const streakX = useTransform(() => x.get() * 0.45 * width.get());
  const streakOpacity = useTransform(() => on.get() * (0.35 + 0.35 * Math.abs(x.get())));
  // Rim light: the card's edge catches the light nearest the pointer (a disc seen through a 1px ring).
  const rimX = useTransform(() => ((x.get() + 1) / 2 - 0.45) * width.get());
  const rimY = useTransform(() => ((y.get() + 1) / 2) * height.get() - 0.45 * width.get());

  // The box is measured once per hover and again after any scroll or resize.
  const box = useRef<Box | null>(null);
  const endSession = useRef<(() => void) | null>(null);

  function locate(clientX: number, clientY: number) {
    const el = ref.current;
    if (!el) return null;
    box.current ??= untransformedBox(el);
    const b = box.current;
    const px = ((clientX - b.left) / b.width) * 2 - 1;
    const py = ((clientY - b.top) / b.height) * 2 - 1;
    return { px, py, inside: px >= -1 && px <= 1 && py >= -1 && py <= 1 };
  }

  function settle() {
    endSession.current?.();
    endSession.current = null;
    targetX.set(0);
    targetY.set(0);
    targetOn.set(0);
  }

  /** Starts following the pointer (window listeners, so the tilting shape never matters). */
  function begin(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || reduced || event.pointerType === "touch" || endSession.current) return;
    box.current = null;
    const at = locate(event.clientX, event.clientY);
    if (!at?.inside) return;
    width.set(el.offsetWidth);
    height.set(el.offsetHeight);
    // Start the glare where the pointer came in, not sliding over from the centre.
    targetX.set(at.px);
    targetY.set(at.py);
    x.jump(at.px);
    y.jump(at.py);
    targetOn.set(1);

    const move = (e: globalThis.PointerEvent) => {
      if (e.pointerType === "touch") return;
      const next = locate(e.clientX, e.clientY);
      if (!next?.inside) {
        settle();
        return;
      }
      targetX.set(next.px);
      targetY.set(next.py);
    };
    // The pointer left the window.
    const out = (e: globalThis.PointerEvent) => {
      if (!e.relatedTarget) settle();
    };
    const invalidate = () => {
      box.current = null;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", out);
    window.addEventListener("blur", settle);
    window.addEventListener("scroll", invalidate, { capture: true, passive: true });
    window.addEventListener("resize", invalidate);
    endSession.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", out);
      window.removeEventListener("blur", settle);
      window.removeEventListener("scroll", invalidate, { capture: true });
      window.removeEventListener("resize", invalidate);
    };
  }

  // Reduced motion switched on mid-hover: stop following and settle flat. Unmount: stop listening.
  useEffect(() => {
    if (!reduced) return;
    endSession.current?.();
    endSession.current = null;
    targetX.set(0);
    targetY.set(0);
    targetOn.set(0);
  }, [reduced, targetX, targetY, targetOn]);
  useEffect(() => () => endSession.current?.(), []);

  const glareStyle = (glareColor ? { "--tilt-glare": glareColor } : undefined) as CSSProperties | undefined;

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    onPointerEnter?.(event);
    begin(event);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    // Back on the card after the session ended (e.g. it scrolled under a resting pointer).
    if (!endSession.current) begin(event);
  }

  return (
    <TiltContext value={{ x, y, on }}>
      <motion.div
        ref={ref}
        data-slot="tilt-card"
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={onPointerLeave}
        style={
          reduced
            ? { ...glareStyle, ...style }
            : { ...glareStyle, ...style, rotateX, rotateY, scale, transformPerspective: perspective }
        }
        className={cn(`glass-${level}`, tint && "glass-tint", "rounded-sheen-lg", className)}
        {...props}
      >
        {glare && !reduced && (
          // Clipped to the card, behind its content (z -1 inside the glass's own stacking context).
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] forced-colors:hidden",
              // White light: strong enough to read on a pale card, gentler on a dark one (muted text keeps AA).
              "[--tilt-glare-default:light-dark(color-mix(in_oklab,var(--sheen-ink-0)_75%,transparent),color-mix(in_oklab,var(--sheen-ink-0)_20%,transparent))]",
              // The rim never sits under text, so it can be bright in both modes.
              "[--tilt-rim-default:light-dark(var(--sheen-ink-0),color-mix(in_oklab,var(--sheen-ink-0)_85%,transparent))]",
            )}
          >
            <motion.span
              data-slot="tilt-card-glare"
              className="absolute top-0 left-0 aspect-square w-[150%] rounded-full [background:radial-gradient(closest-side,var(--tilt-glare,var(--tilt-glare-default)),transparent)]"
              style={{ x: glareX, y: glareY, opacity: glareOpacity }}
            />
            <motion.span
              data-slot="tilt-card-streak"
              className="absolute inset-y-0 -left-full w-[300%] [background:linear-gradient(105deg,transparent_44%,var(--tilt-glare,var(--tilt-glare-default))_50%,transparent_56%)]"
              style={{ x: streakX, opacity: streakOpacity }}
            />
            {/* A 1px ring (masked to the edge) holding a disc of light that follows the pointer. No glass inside. */}
            <span data-slot="tilt-card-rim" className="absolute inset-0 rounded-[inherit] p-px" style={rimMask}>
              <motion.span
                className="absolute top-0 left-0 aspect-square w-[90%] rounded-full [background:radial-gradient(closest-side,var(--tilt-glare,var(--tilt-rim-default)),transparent)]"
                style={{ x: rimX, y: rimY, opacity: on }}
              />
            </span>
          </span>
        )}
        {children}
      </motion.div>
    </TiltContext>
  );
}

type LayerConflicts = MotionConflicts;

/**
 * Props of `TiltCardLayer`: the native `<div>` props plus its own options, each documented on its
 * field.
 */
export type TiltCardLayerProps = Omit<ComponentProps<"div">, LayerConflicts> & {
  /** How far (px) the layer drifts toward the pointer at the card's edge. Negative drifts away. */
  depth?: number;
  /** Inline styles for the layer (the drift transform is added to them). */
  style?: CSSProperties;
};

/**
 * A layer inside a `TiltCard` that drifts with the pointer (parallax), so a title or image floats above the card
 * surface. `depth` is how far in px it moves at the card's edge (negative drifts away). Outside a `TiltCard`, or
 * under reduced motion or on touch, it stays still.
 *
 * Keyboard: none. Accessibility: a plain `div`; it does not change reading order. Glass and motion: transform only
 * (spring-driven MotionValues, no React state); no backdrop blur of its own.
 *
 * @example
 * ```tsx
 * import { TiltCardLayer } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TiltCardLayer depth={16} className="text-xl font-semibold">Pro</TiltCardLayer>
 *   );
 * }
 * ```
 *
 * @see /effects/3d-tilt-card
 */
export function TiltCardLayer({ depth = 10, className, style, ...props }: TiltCardLayerProps) {
  const ctx = useContext(TiltContext);
  const fallback = useMotionValue(0);
  const x = useTransform(() => (ctx?.x ?? fallback).get() * depth * (ctx?.on ?? fallback).get());
  const y = useTransform(() => (ctx?.y ?? fallback).get() * depth * (ctx?.on ?? fallback).get());
  return (
    <motion.div
      data-slot="tilt-card-layer"
      className={cn("relative", className)}
      style={{ ...style, x, y }}
      {...props}
    />
  );
}
