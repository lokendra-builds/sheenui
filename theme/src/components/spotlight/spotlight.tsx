"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type RefObject,
} from "react";
import { useLatest } from "../../hooks/use-latest";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { createLightFollower } from "../../motion/light-follower";

const GroupContext = createContext(false);

type Point = { x: number; y: number };

type Light = { follower: ReturnType<typeof createLightFollower>; layers: HTMLElement[] };
const lights = new WeakMap<HTMLElement, Light>();

/**
 * Sends the pointer to each card's light layers. The layers are fixed-size, pre-painted gradients that
 * move with `translate` (a composited property), so a pointer move never repaints the card; a lerp
 * follower (see `createLightFollower`) smooths the path. Offsets are relative to the layer's resting
 * position (top centre of the card).
 */
function paint(cards: Iterable<HTMLElement>, point: Point) {
  for (const card of cards) {
    let light = lights.get(card);
    if (!light) {
      const layers = Array.from(card.querySelectorAll<HTMLElement>("[data-spot-layer]"));
      light = {
        layers,
        follower: createLightFollower((x, y) => {
          for (const layer of layers) layer.style.translate = `calc(-50% + ${x}px) calc(-50% + ${y}px)`;
        }),
      };
      lights.set(card, light);
    }
    const rect = card.getBoundingClientRect();
    light.follower.to(point.x - rect.left - rect.width / 2, point.y - rect.top);
  }
}

/** Parks the light of each card back at rest (the next pointer entry jumps instead of gliding in). */
function release(cards: Iterable<HTMLElement>) {
  for (const card of cards) lights.get(card)?.follower.reset();
}

/** Pointer tracking for an element: calls `onFrame` at most once per animation frame. */
function usePointerFrames(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  onFrame: (el: HTMLElement, point: Point) => void,
  onActive?: (el: HTMLElement, active: boolean) => void,
) {
  // Latest callbacks, synced after render (refs are never written while rendering).
  const frameRef = useLatest(onFrame);
  const activeRef = useLatest(onActive);

  // Reduced motion: the light stays where it rests (a static highlight) instead of following the pointer.
  const reduced = useSheenReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || reduced) return;
    let frame = 0;
    let point: Point = { x: 0, y: 0 };

    const flush = () => {
      frame = 0;
      frameRef.current(el, point);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      point = { x: event.clientX, y: event.clientY };
      frame ||= requestAnimationFrame(flush);
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      move(event);
      activeRef.current?.(el, true);
    };
    const leave = () => {
      activeRef.current?.(el, false);
      cancelAnimationFrame(frame);
      frame = 0;
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  }, [ref, enabled, reduced, activeRef, frameRef]);
}

/** Props of `SpotlightGroup`: the native `<div>` props, unchanged. */
export type SpotlightGroupProps = ComponentProps<"div">;

/**
 * Shares one pointer between several spotlight cards: each card's rim lights up as the pointer
 * nears it, even from a neighbouring card (the effect on Linear's and Vercel's feature grids).
 * It is a plain div: lay the cards out with className (grid, flex). Cards outside a group still work,
 * each tracking the pointer on its own.
 *
 * Keyboard: none, it is a wrapper. Accessibility: no role. Glass and motion: it adds no surface of its own;
 * pointer tracking runs at most once per frame with no React state and is mouse and pen only.
 *
 * @example
 * ```tsx
 * import { SpotlightCard, SpotlightGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SpotlightGroup className="grid gap-4 sm:grid-cols-2">
 *       <SpotlightCard className="p-6">Fast</SpotlightCard>
 *       <SpotlightCard className="p-6">Accessible</SpotlightCard>
 *     </SpotlightGroup>
 *   );
 * }
 * ```
 *
 * @see /effects/spotlight-card
 */
export function SpotlightGroup({ className, children, ...props }: SpotlightGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  usePointerFrames(
    ref,
    true,
    (el, point) => paint(el.querySelectorAll<HTMLElement>('[data-slot="spotlight-card"]'), point),
    (el, active) => {
      el.toggleAttribute("data-spotlight-active", active);
      if (!active) release(el.querySelectorAll<HTMLElement>('[data-slot="spotlight-card"]'));
    },
  );

  return (
    <GroupContext value>
      <div ref={ref} data-slot="spotlight-group" className={cn("group/spot", className)} {...props}>
        {children}
      </div>
    </GroupContext>
  );
}

/**
 * Props of `SpotlightCard`: the native `<div>` props plus its own options, each documented on its
 * field.
 */
export type SpotlightCardProps = ComponentProps<"div"> & {
  /** Sets the glass level: 1 = subtle, 2 = cards (default), 3 = most opaque. */
  level?: 1 | 2 | 3;
  /** Tints the surface with the accent colour. */
  tint?: boolean;
  /** Sets the diameter of the glow in px. Defaults to the card's width, at most 380px. */
  diameter?: number;
  /** Colour of the glow inside the card (any CSS colour). Defaults to a soft accent. */
  color?: string;
  /** Sets the colour of the light on the rim. Defaults to the accent. */
  rimColor?: string;
  /** Makes the rim light up near the pointer. Default true. */
  rim?: boolean;
};

/** Default glow: the full width of the card's width, capped, so it reads as a spot on any card. */
const AUTO_SHARE = 1;
const AUTO_MAX = 380;

/** Writes the card's width (capped) to --spot-auto-size while no size is given. A CSS variable, no re-render. */
function useAutoSize(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      // `borderBoxSize` is missing in older browsers, whatever the DOM types say.
      const boxes: readonly ResizeObserverSize[] | undefined = entry?.borderBoxSize;
      const width = boxes?.[0]?.inlineSize ?? el.offsetWidth;
      el.style.setProperty("--spot-auto-size", `${Math.round(Math.min(AUTO_MAX, width * AUTO_SHARE))}px`);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      el.style.removeProperty("--spot-auto-size");
    };
  }, [ref, enabled]);
}

/**
 * Spotlight card: a glass card lit by a soft glow that follows the pointer, plus a rim that catches the
 * light where the pointer is near the edge. Use it for feature grids and pricing tiles; use `GlassCard` for a
 * calm surface and `TiltCard` for a card that leans toward the pointer.
 *
 * - `level` and `tint` pick the glass; `diameter`, `color` and `rimColor` shape the glow (defaults come from
 *   theme tokens and follow the card's width); `rim={false}` removes the edge light.
 * - Wrap several cards in `SpotlightGroup` and the rims of neighbouring cards pick up the same light as the
 *   pointer moves between them. Renders a `div` and accepts its props.
 *
 * The pointer position is written straight to CSS variables (`--spot-x` / `--spot-y`), at most once per
 * frame: no React state, no re-renders. Mouse and pen only; a finger dragging across a card is scrolling.
 * Without hover (touch screens) the glow is static, near the top.
 *
 * Keyboard: a plain card is not focusable; keyboard focus inside a card lights it too, so interactive children
 * get the glow. Accessibility: the glow and rim are `aria-hidden` and hidden in forced colors; text contrast is
 * measured against the glass, not the glow.
 * Glass and motion: one `backdrop-filter` surface. The glow layers live inside the glass element (behind its content),
 * and only their opacity changes, so the card's own backdrop blur is never affected. Reduced motion removes the fades.
 *
 * @example
 * ```tsx
 * import { SpotlightCard } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SpotlightCard tint className="p-6">
 *       <h3>Instant search</h3>
 *       <p>Results as you type.</p>
 *     </SpotlightCard>
 *   );
 * }
 * ```
 *
 * @see /effects/spotlight-card
 */
export function SpotlightCard({
  level = 2,
  tint = false,
  diameter: size,
  color,
  rimColor,
  rim = true,
  className,
  style,
  children,
  ...props
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inGroup = useContext(GroupContext);
  // On its own, a card tracks the pointer itself; in a group, the group does it for every card.
  usePointerFrames(
    ref,
    !inGroup,
    (el, point) => paint([el], point),
    (el, active) => {
      if (!active) release([el]);
    },
  );
  useAutoSize(ref, size === undefined);

  const vars = {
    ...(size !== undefined && { "--spot-size": `${size}px` }),
    ...(color && { "--spot-color": color }),
    ...(rimColor && { "--spot-rim": rimColor }),
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-slot="spotlight-card"
      style={vars}
      className={cn(
        `glass-${level}`,
        tint && "glass-tint",
        "group/card rounded-sheen-lg",
        // Defaults, built from theme tokens; override with the size / color / rimColor props.
        // Without a size prop, the glow follows the card's width once it is measured.
        "[--spot-size:var(--spot-auto-size,320px)]",
        "[--spot-color:light-dark(color-mix(in_oklab,var(--sheen-accent)_30%,transparent),color-mix(in_oklab,var(--sheen-accent)_40%,transparent))]",
        "[--spot-rim:var(--sheen-accent)]",
        className,
      )}
      {...props}
    >
      {/* Glow behind the content (z -1 inside the glass's own stacking context). The clip is static; the
          gradient inside it is a pre-painted layer that moves with `translate`, so pointer moves never repaint the card. */}
      <span
        aria-hidden
        data-slot="spotlight-glow"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 overflow-clip rounded-[inherit] opacity-0 forced-colors:hidden",
          "motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-slow) motion-ok:ease-sheen-out",
          // Pointer over the card, keyboard focus inside it, or a touch screen (static glow).
          "group-hover/card:opacity-100 group-has-[:focus-visible]/card:opacity-100 [@media(hover:none)]:opacity-70",
        )}
      >
        <span data-spot-layer className={layerClass} style={glowStyle} />
      </span>
      {rim && (
        <span
          aria-hidden
          data-slot="spotlight-rim"
          className={cn(
            "pointer-events-none absolute -inset-px overflow-clip rounded-[inherit] opacity-0 forced-colors:hidden",
            "motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-slow) motion-ok:ease-sheen-out",
            inGroup ? "group-data-[spotlight-active]/spot:opacity-100" : "group-hover/card:opacity-100",
            "group-has-[:focus-visible]/card:opacity-100 [@media(hover:none)]:opacity-60",
          )}
          style={rimMask}
        >
          <span data-spot-layer className={layerClass} style={rimStyle} />
        </span>
      )}
      {children}
    </div>
  );
}

/*
 * Light layers: a square of the glow's diameter, resting at the card's top centre and moved with `translate`
 * (written by `paint`). Until the pointer moves (touch screens, keyboard focus) it stays at rest.
 */
const layerClass = "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform";

/* A bright core that falls off fast: a spot of light, not a wash over the whole card. */
const glowStyle: CSSProperties = {
  width: "var(--spot-size)",
  height: "var(--spot-size)",
  background:
    "radial-gradient(circle closest-side, var(--spot-color), color-mix(in oklab, var(--spot-color) 55%, transparent) 25%, color-mix(in oklab, var(--spot-color) 15%, transparent) 50%, transparent 72%)",
};

const ring = "linear-gradient(black 0 0)";
/* The rim is a 1px ring (a static mask); the light moving under it is what you see. */
const rimMask: CSSProperties = {
  padding: "1px",
  WebkitMask: `${ring} content-box, ${ring}`,
  WebkitMaskComposite: "xor",
  mask: `${ring} content-box exclude, ${ring}`,
};
const rimStyle: CSSProperties = {
  width: "calc(var(--spot-size) * 1.2)",
  height: "calc(var(--spot-size) * 1.2)",
  background:
    "radial-gradient(circle closest-side, var(--spot-rim), color-mix(in oklab, var(--spot-rim) 85%, transparent) 30%, color-mix(in oklab, var(--spot-rim) 35%, transparent) 65%, transparent 100%)",
};
