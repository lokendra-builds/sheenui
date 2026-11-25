"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { cn } from "../../lib/cn";
import { useMotionGate } from "../../motion/gate";

/** Props of {@link SheenScene}. */
export type SheenSceneProps = {
  /** The fallback image (WebP or JPEG). Required. Decorative: it gets an empty `alt`. */
  src: string;
  /** Optional AVIF source for modern browsers; the browser falls back to `src`. */
  avifSrc?: string;
  /** `srcset` of the fallback image, e.g. `"/scenes/room-800.webp 800w, /scenes/room.webp 1600w"`. */
  srcSet?: string;
  /** Sets the `srcset` of the AVIF source, like `srcSet` for the fallback image. */
  avifSrcSet?: string;
  /**
   * Sets the `sizes` attribute that tells the browser how wide the image displays, so it picks a `srcSet` candidate.
   * @default "100vw"
   */
  sizes?: string;
  /**
   * Intrinsic width of the image in pixels. It is written on the `<img>` with `height` so the browser knows the aspect
   * ratio before the file arrives; the scene itself still fills its container.
   * @default 1600
   */
  width?: number;
  /**
   * Intrinsic height of the image in pixels, written on the `<img>` with `width` to reserve its aspect ratio.
   * @default 900
   */
  height?: number;
  /**
   * How much of the page background colour is laid over the image (0 to 1). It dims the scene in
   * dark mode and washes it in light mode, so text over glass keeps 4.5:1.
   * @default 0.5
   */
  dim?: number;
  /**
   * Drift the image slowly against the scroll (transform only). Off under reduced motion; it is
   * driven by scroll progress, so nothing runs while the scene is off screen.
   * @default false
   */
  parallax?: boolean;
  /**
   * Scene is above the fold: load it eagerly with high fetch priority. Otherwise it is lazy,
   * decoded async and low priority.
   * @default false
   */
  priority?: boolean;
  /**
   * Pin the scene behind the whole page (position fixed, z-index -1) instead of filling its
   * positioned parent.
   * @default false
   */
  fixed?: boolean;
  /** Adds extra classes to the scene element. */
  className?: string;
};

/**
 * A real picture behind your glass, so the blur has something to refract. Drop it as the first
 * child of a positioned container (or pass `fixed` to pin it behind the page); glass surfaces
 * siblings above it blur the photograph. Images are yours: pass `src` (WebP/JPEG), optionally
 * `avifSrc` and `srcSet`/`avifSrcSet` for a `<picture>` with AVIF first.
 *
 * Props (see {@link SheenSceneProps}): `src` (required), `avifSrc`, `srcSet`, `avifSrcSet`,
 * `sizes` (default "100vw"), `width` (default 1600), `height` (default 900), `dim` (0 to 1, default 0.5), `parallax` (default false), `priority`
 * (default false), `fixed` (default false), `className`.
 *
 * Keyboard: Not focusable and never takes pointer events; Tab and clicks pass through to the
 * content above it.
 * Accessibility: Decorative (`aria-hidden`, empty `alt`). The `dim` layer is the page background
 * colour mixed in by token, so contrast follows light and dark mode; verify text over your own
 * image. Reduced motion turns the parallax off; reduced transparency or forced colours show the
 * solid page background instead of the image.
 * Glass: A sibling layer behind the glass, never a wrapper of it, with no opacity or filter on any
 * ancestor of glass, so every glass surface still blurs the real image.
 * Motion: Optional parallax is a scroll-linked transform (no loop, nothing runs off screen).
 *
 * @example
 * ```tsx
 * import { SheenScene } from "@sheenui/theme";
 *
 * export function Hero() {
 *   return (
 *     <section style={{ position: "relative", minHeight: 480 }}>
 *       <SheenScene
 *         src="/scenes/room.webp"
 *         avifSrc="/scenes/room.avif"
 *         srcSet="/scenes/room-800.webp 800w, /scenes/room.webp 1600w"
 *         avifSrcSet="/scenes/room-800.avif 800w, /scenes/room.avif 1600w"
 *         dim={0.4}
 *         priority
 *       />
 *       <div className="glass-2" style={{ position: "relative", padding: 24 }}>Over the scene</div>
 *     </section>
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function SheenScene({
  src,
  avifSrc,
  srcSet,
  avifSrcSet,
  sizes = "100vw",
  width = 1600,
  height = 900,
  dim = 0.5,
  parallax = false,
  priority = false,
  fixed = false,
  className,
}: SheenSceneProps) {
  const { reduced } = useMotionGate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const drift = parallax && !reduced;
  const amount = Math.min(1, Math.max(0, dim));

  const picture = (
    <picture>
      {avifSrc || avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet ?? avifSrc} sizes={sizes} /> : null}
      <img
        className="sheen-scene__img"
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt=""
        width={width}
        height={height}
        aria-hidden="true"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        draggable={false}
      />
    </picture>
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="scene"
      data-sheen-scene=""
      data-fixed={fixed ? "" : undefined}
      data-parallax={drift ? "" : undefined}
      className={cn("sheen-scene", className)}
      style={{ "--sheen-scene-dim": amount } as CSSProperties}
    >
      {drift ? (
        <motion.div className="sheen-scene__layer" style={{ y }}>
          {picture}
        </motion.div>
      ) : (
        <div className="sheen-scene__layer">{picture}</div>
      )}
      <span className="sheen-scene__dim" />
    </div>
  );
}
