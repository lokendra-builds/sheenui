"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "../../lib/cn";
import { useOsSolidGlass } from "../../hooks/use-media-query";
import { observeIntersection } from "../../hooks/use-intersection";
import { useGlassMode, useReducedTransparency } from "../../hooks/use-preferences";
import { lensGeometry, lensImages, supportsBackdropSvgFilter } from "./lens-map";

/** Whether this browser bends the light (Chromium); elsewhere LiquidGlass is frosted glass. */
export { supportsBackdropSvgFilter as supportsLiquidGlass };

/** Props of `LiquidGlass`: the native `<div>` props plus its own options, each documented on its field. */
export type LiquidGlassProps = useRender.ComponentProps<"div"> & {
  /**
   * Outline of the lens. "rect" uses the element's own border radius (rounded-sheen-xl
   * by default, override with className); "pill" and "circle" are fully rounded. Default "rect".
   */
  shape?: "rect" | "pill" | "circle";
  /**
   * "regular": frosted and tinted, for text and controls (legible on anything).
   * "clear": barely tinted, most see-through. For icons and bold labels over media. Default "regular".
   */
  variant?: "regular" | "clear";
  /** How strongly the rim bends the backdrop. 0 = flat glass, 1 = default, up to 2. Default 1. */
  refraction?: number;
  /** Sets the width of the curved rim in px. Defaults to most of the corner radius (capped at 40). */
  bezel?: number;
  /** Sets the frost inside the lens, in px. Defaults to 12 (regular) or 1 (clear). */
  frost?: number;
  /** Colour boost of the backdrop seen through the lens (1 = none). Default 1.5. */
  saturation?: number;
  /** Splits the refracted edge into its colours, like a prism (0 to 1). Default 0. */
  aberration?: number;
  /** Adds a bright specular rim along the edge. Default true. */
  specular?: boolean;
  /** Grows slightly on hover and presses in on tap (scale only; none with reduced motion). Default false. */
  interactive?: boolean;
};

const shapeClass = {
  rect: "rounded-sheen-xl",
  pill: "rounded-sheen-full",
  circle: "aspect-square rounded-full",
} as const;

const variantClass = {
  regular: "glass-2 [background-color:var(--sheen-lg-tint-regular)]",
  // glass-1 carries no blur of its own (glass budget); a clear lens is nothing without its frost.
  clear:
    "glass-1 bg-none [background-color:var(--sheen-lg-tint-clear)] [-webkit-backdrop-filter:blur(12px)_saturate(170%)] [backdrop-filter:blur(var(--sheen-glass-1-blur))_saturate(var(--sheen-glass-saturate))]",
} as const;

/** While refracting, a regular lens moves its tint onto the masked inner layer. */
const refractingClass = {
  regular: "[background-color:transparent]",
  clear: "",
} as const;

/*
 * Tints and rim colours, built from theme tokens. Regular uses the glass-3 tint, a quarter of
 * the way to the solid surface: a lens is often dropped over photos and bold type, and measured
 * pixel by pixel, muted text on it keeps 4.5:1 even over solid black lettering. While refracting,
 * that tint thins out over the outer rim only (see lens-map.ts), where the light bends most.
 * Clear is a whisper of white so the refraction carries the look; keep text off it, or make it
 * bold and large.
 */
const tokens = [
  "[--sheen-lg-tint-regular:color-mix(in_oklab,var(--sheen-glass-3-bg),var(--sheen-surface-solid)_25%)]",
  "[--sheen-lg-tint-clear:light-dark(color-mix(in_oklab,var(--sheen-ink-0)_16%,transparent),color-mix(in_oklab,var(--sheen-ink-0)_5%,transparent))]",
  "[--sheen-lg-rim-hi:light-dark(var(--sheen-ink-0),color-mix(in_oklab,var(--sheen-ink-0)_70%,transparent))]",
  "[--sheen-lg-rim-lo:light-dark(color-mix(in_oklab,var(--sheen-ink-0)_35%,transparent),color-mix(in_oklab,var(--sheen-ink-0)_12%,transparent))]",
].join(" ");

/** One-time engine check, read during render without a hydration mismatch (false on the server). */
const noop = () => () => undefined;
function useSvgBackdropSupport() {
  return useSyncExternalStore(noop, supportsBackdropSvgFilter, () => false);
}

/** Refraction only where it can be seen: Chromium, full glass, no solid-surface preference. */
function useRefractionAllowed() {
  const supported = useSvgBackdropSupport();
  const [lite] = useGlassMode();
  const [reducedTransparency] = useReducedTransparency();
  const osSolid = useOsSolidGlass();
  return supported && !lite && !reducedTransparency && !osSolid;
}

/**
 * Refraction budget: SVG refraction on at most MAX_REFRACTION_SURFACES
 * lenses at once, page-wide. A lens claims a slot while it is near the viewport (an
 * IntersectionObserver with a 25% margin, so it already refracts as it scrolls in) and releases
 * it when it scrolls away; the rest render as plain frosted glass and move up as soon as a slot
 * frees. Without IntersectionObserver, slots go in mount order.
 */
export const MAX_REFRACTION_SURFACES = 3;

/** How far outside the viewport a lens still counts as in view (claims a slot early). */
const NEAR_VIEWPORT = "25% 0px";

const refracting = new Set<symbol>();
const waiting = new Set<symbol>();
const budgetListeners = new Set<() => void>();

function notifyBudget() {
  for (const listener of budgetListeners) listener();
}

function claimSlot(key: symbol) {
  if (refracting.size < MAX_REFRACTION_SURFACES) refracting.add(key);
  else waiting.add(key);
  notifyBudget();
}

function releaseSlot(key: symbol) {
  waiting.delete(key);
  if (!refracting.delete(key)) return;
  const next = waiting.values().next();
  if (!next.done) {
    waiting.delete(next.value);
    refracting.add(next.value);
  }
  notifyBudget();
}

function subscribeBudget(listener: () => void) {
  budgetListeners.add(listener);
  return () => {
    budgetListeners.delete(listener);
  };
}

/** True while this lens holds one of the refraction slots (false until mounted and near the viewport, or when `wanted` is false). */
function useRefractionSlot(ref: RefObject<HTMLElement | null>, wanted: boolean) {
  const key = useRef<symbol | null>(null);
  key.current ??= Symbol("sheen-lens");
  useEffect(() => {
    const k = key.current;
    if (!wanted || !k) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      claimSlot(k);
      return () => releaseSlot(k);
    }
    let held = false;
    const stopObserving = observeIntersection(
      el,
      (entry) => {
        const near = entry.isIntersecting;
        if (near === held) return;
        held = near;
        if (near) claimSlot(k);
        else releaseSlot(k);
      },
      { rootMargin: NEAR_VIEWPORT },
    );
    return () => {
      stopObserving();
      if (held) releaseSlot(k);
    };
  }, [ref, wanted]);
  return useSyncExternalStore(
    subscribeBudget,
    () => wanted && key.current !== null && refracting.has(key.current),
    () => false,
  );
}

type Lens = { width: number; height: number; radius: number; bezel: number; map: string; tint: string };

/** Redraws are throttled: while the lens is being resized, the last map stretches to fit. */
const REDRAW_MS = 120;

function readRadius(el: HTMLElement, width: number, height: number) {
  const value = parseFloat(getComputedStyle(el).borderTopLeftRadius);
  return Number.isFinite(value) ? Math.min(value, Math.min(width, height) / 2) : 0;
}

/**
 * Measures the element and keeps its displacement map in sync with its size and radius.
 * `shapeKey` (shape + className) redraws it when the outline changes at the same size.
 */
function useLens(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  bezelProp: number | undefined,
  shapeKey: string,
) {
  const [lens, setLens] = useState<Lens | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof ResizeObserver === "undefined") return;
    let timer = 0;
    let idle = 0;
    let last = 0;
    let size = { width: 0, height: 0 };

    const draw = () => {
      timer = 0;
      idle = 0;
      last = performance.now();
      const { width, height } = size;
      if (width < 2 || height < 2) return;
      const radius = readRadius(el, width, height);
      const bezel = bezelProp ?? Math.min(40, Math.max(8, radius * 0.85));
      const geometry = lensGeometry({ width, height, radius, bezel });
      const images = lensImages({ width, height, ...geometry });
      if (!images) return;
      setLens((prev) =>
        prev?.map === images.map && prev.width === width && prev.height === height
          ? prev
          : { width, height, ...geometry, ...images },
      );
    };

    const ro = new ResizeObserver(([entry]) => {
      // `borderBoxSize` is missing in older browsers, whatever the DOM types say.
      const boxes: readonly ResizeObserverSize[] | undefined = entry?.borderBoxSize;
      const box = boxes?.[0];
      size = box
        ? { width: Math.round(box.inlineSize), height: Math.round(box.blockSize) }
        : { width: Math.round(el.offsetWidth), height: Math.round(el.offsetHeight) };
      if (timer || idle) return;
      const wait = Math.max(0, REDRAW_MS - (performance.now() - last));
      // The first map encodes two PNGs on the main thread (100-290 ms on a slow phone): do it when the browser is idle, not in the load's first tasks.
      if (last === 0 && typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(draw, { timeout: 600 });
      else timer = window.setTimeout(draw, last === 0 ? 0 : wait);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    };
  }, [ref, enabled, bezelProp, shapeKey]);

  return enabled ? lens : null;
}

/**
 * Liquid glass: a lens that bends the page behind it, like Apple's Liquid Glass. Use it for a few hero surfaces (a floating control, a media overlay, a nav pill); use `GlassCard` for ordinary cards, since refraction is limited to three lenses per page.
 * Renders a `div` (use `render` to change the element) and accepts its props. `shape` ("rect", "pill", "circle"), `variant` ("regular" for text and controls, "clear" for icons and bold labels over media), `refraction` (0 to 2), `bezel`, `frost`, `saturation`, `aberration`,
 * `specular` and `interactive` (hover/press scale) tune the lens.
 *
 * How it works (Chromium): `backdrop-filter: url(#lens)` runs the backdrop through an SVG filter: a light frost (feGaussianBlur), then feDisplacementMap with a displacement map drawn once per size on a canvas (see lens-map.ts), then a saturation boost. A thin specular rim,
 * brightest where light from the top-left would catch it, sits on top. Regular lenses carry their tint on an inner layer that thins towards the rim, so the bent backdrop shows at the edge while text inside keeps a solid backplate.
 *
 * Everywhere else it is ordinary SheenUI frosted glass (it carries the glass-1 / glass-2 class), so every fallback of the glass engine applies for free:
 * - Safari and Firefox: they accept `backdrop-filter: url()` but draw nothing, so it is only turned on in Chromium (engine check) and they keep the frosted blur. `supportsLiquidGlass()` tells you which one you got.
 * - Reduced transparency (OS or `[data-transparency="reduced"]`), more contrast and no backdrop-filter support: a solid surface.
 * - `[data-glass="lite"]`: the cheaper frosted blur instead of the refraction.
 * - Budget: at most `MAX_REFRACTION_SURFACES` (3) lenses refract at once, page-wide, among the lenses near the viewport; the rest are frosted glass until a slot frees up. A lens that scrolls away hands its slot to the next one in view.
 * - Forced colors: system colours, no rim.
 * In all of those, no displacement map is drawn at all.
 *
 * Keyboard: none of its own; give it `role`, `tabIndex` and handlers when it is a control (`interactive` adds a solid focus ring). Accessibility: pure decoration around your content; text on a regular lens keeps 4.5:1 contrast on any backdrop; the rim is decorative.
 * Glass and motion: only `scale` ever animates (the `interactive` hover/press), never the size, so the displacement map is never redrawn mid-animation. No movement with reduced motion.
 *
 * @example
 * ```tsx
 * import { LiquidGlass } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <LiquidGlass shape="pill" interactive className="px-6 py-3">
 *       Get started
 *     </LiquidGlass>
 *   );
 * }
 * ```
 *
 * @see /effects/liquid-glass
 */
export function LiquidGlass({
  shape = "rect",
  variant = "regular",
  refraction = 1,
  bezel,
  frost,
  saturation = 1.5,
  aberration = 0,
  specular = true,
  interactive = false,
  render,
  className,
  style,
  children,
  ...props
}: LiquidGlassProps) {
  const ref = useRef<HTMLElement | null>(null);
  const filterId = `sheen-lens-${useId().replace(/[^\w-]/g, "")}`;
  const allowed = useRefractionAllowed();
  const slot = useRefractionSlot(ref, allowed && refraction > 0);
  const lens = useLens(ref, slot, bezel, `${shape} ${className ?? ""}`);
  const blur = frost ?? (variant === "regular" ? 12 : 1);
  const strength = Math.max(0, Math.min(2, refraction));
  // Peak shift at the very edge, in px: a bit more than the rim is wide, so the rim visibly magnifies.
  const scale = lens ? 2 * strength * lens.bezel * 1.1 : 0;
  const split = Math.max(0, Math.min(1, aberration)) * 0.12;

  const element = useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      ...props,
      "data-slot": "liquid-glass",
      "data-refracting": lens ? "" : undefined,
      style: lens ? { ...style, "--sheen-lg-filter": `url(#${filterId})` } : style,
      className: cn(
        tokens,
        variantClass[variant],
        shapeClass[shape],
        // Chromium only: swap the frosted blur for the lens (the glass engine's fallbacks still win).
        lens && [
          "[-webkit-backdrop-filter:var(--sheen-lg-filter)] [backdrop-filter:var(--sheen-lg-filter)]",
          refractingClass[variant],
        ],
        interactive && [
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "motion-ok:transition-[scale] motion-ok:duration-(--sheen-duration-smooth) motion-ok:ease-sheen-smooth",
          "motion-ok:hover:scale-[1.03] motion-ok:active:scale-[0.97] motion-ok:active:duration-(--sheen-duration-fast)",
        ],
        className,
      ),
      children: (
        <>
          {lens && (
            <svg
              aria-hidden
              focusable="false"
              width="0"
              height="0"
              className="pointer-events-none absolute size-0 overflow-hidden"
            >
              {/* No explicit filter region: Chromium blanks the page with x/y/width/height set here. */}
              <filter id={filterId} colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceGraphic" stdDeviation={blur} edgeMode="duplicate" result="frost" />
                <feImage
                  href={lens.map}
                  x="0"
                  y="0"
                  width={lens.width}
                  height={lens.height}
                  preserveAspectRatio="none"
                  result="map"
                />
                {split > 0 ? (
                  <>
                    {/* Each colour bends a little differently (dispersion), then they are added back together. */}
                    <feDisplacementMap
                      in="frost"
                      in2="map"
                      scale={scale * (1 + split)}
                      xChannelSelector="R"
                      yChannelSelector="G"
                      result="dr"
                    />
                    <feColorMatrix
                      in="dr"
                      type="matrix"
                      values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                      result="r"
                    />
                    <feDisplacementMap
                      in="frost"
                      in2="map"
                      scale={scale}
                      xChannelSelector="R"
                      yChannelSelector="G"
                      result="dg"
                    />
                    <feColorMatrix
                      in="dg"
                      type="matrix"
                      values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                      result="g"
                    />
                    <feDisplacementMap
                      in="frost"
                      in2="map"
                      scale={scale * (1 - split)}
                      xChannelSelector="R"
                      yChannelSelector="G"
                      result="db"
                    />
                    <feColorMatrix
                      in="db"
                      type="matrix"
                      values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                      result="b"
                    />
                    <feBlend in="r" in2="g" mode="screen" result="rg" />
                    <feBlend in="rg" in2="b" mode="screen" result="bent" />
                  </>
                ) : (
                  <feDisplacementMap
                    in="frost"
                    in2="map"
                    scale={scale}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="bent"
                  />
                )}
                <feColorMatrix in="bent" type="saturate" values={String(saturation)} />
              </filter>
            </svg>
          )}
          {lens && variant === "regular" && (
            // The tint, thinned towards the rim. Behind the content (z -1 inside the glass's stacking context).
            <span
              aria-hidden
              data-slot="liquid-glass-tint"
              className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] [background-color:var(--sheen-lg-tint-regular)]"
              style={{
                maskImage: `url("${lens.tint}")`,
                WebkitMaskImage: `url("${lens.tint}")`,
                maskSize: "100% 100%",
                WebkitMaskSize: "100% 100%",
              }}
            />
          )}
          {specular && (
            <span
              aria-hidden
              data-slot="liquid-glass-rim"
              className="pointer-events-none absolute inset-0 rounded-[inherit] forced-colors:hidden contrast-more:hidden"
              style={rimStyle}
            />
          )}
          {children}
        </>
      ),
    },
  });

  return element;
}

/*
 * Specular rim: a 1.5px ring (masked, on its own decorative layer) whose brightness follows
 * the angle around the lens: hot at the top-left where the light falls, a softer echo at the
 * bottom-right, dim on the two shadowed sides.
 */
const ring = "linear-gradient(black 0 0)";
const rimStyle: CSSProperties = {
  padding: "1.5px",
  background:
    "conic-gradient(from 0deg, var(--sheen-lg-rim-lo) 0deg, var(--sheen-lg-rim-lo) 40deg, var(--sheen-lg-rim-hi) 135deg, var(--sheen-lg-rim-lo) 200deg, var(--sheen-lg-rim-lo) 240deg, var(--sheen-lg-rim-hi) 315deg, var(--sheen-lg-rim-lo) 360deg)",
  WebkitMask: `${ring} content-box, ${ring}`,
  WebkitMaskComposite: "xor",
  mask: `${ring} content-box exclude, ${ring}`,
};
