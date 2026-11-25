"use client";

import { useEffect, useRef, type ComponentProps, type PointerEvent } from "react";

import { cn } from "../../lib/cn";
import { HEADING_TAGS, type HeadingLevelOption } from "../../lib/heading";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { createLightFollower } from "../../motion/light-follower";

/** Props of `GlassCard`: the native `<div>` props plus its own options, each documented on its field. */
export type GlassCardProps = ComponentProps<"div"> & {
  /** 1 = subtle (chips), 2 = cards (default), 3 = most opaque (dialogs, bars). */
  level?: 1 | 2 | 3;
  /** Soft highlight that follows the pointer (mouse and pen only). */
  sheen?: boolean;
  /** Tints the surface with the accent for featured content. */
  tint?: boolean;
  /** Lifts slightly on hover; use for clickable cards. Movement is off with reduced motion. */
  interactive?: boolean;
};

/**
 * A glass surface for grouping content: the basic building block of SheenUI layouts. Use it for cards,
 * panels and tiles; for a surface that needs the full Liquid Glass lens, use `LiquidGlass`.
 *
 * - `level` picks how opaque the glass is: 1 chips, 2 cards (default), 3 dialogs and bars.
 * - `sheen` (default on) adds a soft highlight that follows a mouse or pen; `tint` gives featured
 *   content an accent tint; `interactive` lifts the card on hover for clickable cards.
 * - Renders a `div` and accepts every `div` prop (`className`, `onClick`, `role`, `tabIndex`, ...).
 * - Compose with `GlassCardHeader`, `GlassCardTitle`, `GlassCardDescription`, `GlassCardContent`, `GlassCardFooter`.
 *
 * Keyboard: a plain card is not focusable. If it is clickable, give it `role="link"` or `role="button"`
 * and `tabIndex={0}` plus key handlers; `interactive` then shows a solid focus ring.
 * Accessibility: no role of its own; touch devices never run the pointer highlight. Forced colors give
 * the card a solid border and background.
 * Glass and motion: one `backdrop-filter` surface (budget: at most 8 in view); reduced transparency makes
 * it opaque. The hover lift is off with reduced motion.
 *
 * @example
 * ```tsx
 * import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GlassCard interactive>
 *       <GlassCardHeader>
 *         <GlassCardTitle>Team plan</GlassCardTitle>
 *         <GlassCardDescription>Up to 10 seats.</GlassCardDescription>
 *       </GlassCardHeader>
 *       <GlassCardContent>$12 per seat</GlassCardContent>
 *     </GlassCard>
 *   );
 * }
 * ```
 *
 * @see /components/glass-card
 */
export function GlassCard({
  level = 2,
  sheen = true,
  tint = false,
  interactive = false,
  className,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  children,
  ...props
}: GlassCardProps) {
  const reduced = useSheenReducedMotion();
  const layerRef = useRef<HTMLSpanElement>(null);
  const followerRef = useRef<ReturnType<typeof createLightFollower> | null>(null);
  useEffect(() => () => followerRef.current?.stop(), []);
  // The card's box is measured once when the pointer enters (and again after a scroll or resize while it is inside),
  // not on every move: reading layout in a pointermove handler forces a style recalculation per event.
  const rectRef = useRef<DOMRect | null>(null);
  const stopWatching = useRef<(() => void) | null>(null);
  useEffect(() => () => stopWatching.current?.(), []);

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    onPointerEnter?.(event);
    const card = event.currentTarget;
    rectRef.current = card.getBoundingClientRect();
    const stale = () => {
      rectRef.current = null;
    };
    stopWatching.current?.();
    window.addEventListener("scroll", stale, { capture: true, passive: true });
    window.addEventListener("resize", stale, { passive: true });
    stopWatching.current = () => {
      window.removeEventListener("scroll", stale, { capture: true });
      window.removeEventListener("resize", stale);
      stopWatching.current = null;
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    // A finger dragging across a card is scrolling, not hovering; reduced motion keeps the light at rest.
    if (!sheen || reduced || event.pointerType === "touch") return;
    const layer = layerRef.current;
    if (!layer) return;
    // The light is a pre-painted layer moved with `translate` (composited): no repaint of the card per move.
    followerRef.current ??= createLightFollower((x, y) => {
      layer.style.translate = `calc(-50% + ${x}px) calc(-50% + ${y}px)`;
    });
    const rect = (rectRef.current ??= event.currentTarget.getBoundingClientRect());
    followerRef.current.to(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top);
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    stopWatching.current?.();
    rectRef.current = null;
    followerRef.current?.reset();
  }

  return (
    <div
      data-slot="glass-card"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        `glass-${level}`,
        sheen && "glass-sheen",
        tint && "glass-tint",
        "rounded-sheen-lg",
        interactive && [
          "cursor-pointer",
          "motion-ok:transition-[translate,scale,border-color] motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out motion-ok:hover:-translate-y-1 motion-ok:active:translate-y-0 motion-ok:active:scale-[0.985]",
          // Lit rim on hover (fine pointers only): the border takes an accent-tinted highlight.
          "[@media(hover:hover)_and_(pointer:fine)]:hover:border-[color-mix(in_oklab,var(--sheen-accent)_60%,white)]",
          // A focusable card (tabIndex / role="link") shows a solid focus ring.
          "focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-sheen-focus",
        ],
        className,
      )}
      {...props}
    >
      {sheen && (
        <span
          aria-hidden
          data-slot="glass-card-sheen"
          className="pointer-events-none absolute inset-0 -z-10 overflow-clip rounded-[inherit] opacity-(--sheen-glow,0.7) transition-opacity duration-(--sheen-duration-base) ease-sheen-out forced-colors:hidden"
        >
          <span
            ref={layerRef}
            className="absolute top-0 left-1/2 size-[504px] -translate-x-1/2 -translate-y-1/2 will-change-transform [background:radial-gradient(circle_closest-side,var(--sheen-glass-sheen),transparent)]"
          />
        </span>
      )}
      <span aria-hidden data-slot="sheen-sweep" className="sheen-sweep">
        <i />
      </span>
      {children}
    </div>
  );
}

/**
 * Top section of a `GlassCard`: stacks the title and description with padding.
 *
 * Keyboard: none. Accessibility: plain markup, no role. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { GlassCardHeader, GlassCardTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GlassCardHeader>
 *       <GlassCardTitle>Usage</GlassCardTitle>
 *     </GlassCardHeader>
 *   );
 * }
 * ```
 *
 * @see /components/glass-card
 */
export function GlassCardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="glass-card-header" className={cn("flex flex-col gap-1.5 p-6 pb-0", className)} {...props} />;
}

/**
 * The card's heading (an `<h3>` by default; `headingLevel` picks 2 to 6, or `"none"` for a paragraph).
 *
 * Keyboard: none. Accessibility: a heading; set `headingLevel` to fit your page outline (`"none"` when the card is shown as an example and its title must stay out of the outline). Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { GlassCardTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GlassCardTitle headingLevel={2}>Usage</GlassCardTitle>
 *   );
 * }
 * ```
 *
 * @see /components/glass-card
 */
export function GlassCardTitle({
  className,
  children,
  headingLevel = 3,
  ...props
}: Omit<ComponentProps<"h3">, "ref"> & {
  /**
   * Heading level (`"none"` renders a paragraph with the same look).
   * @default 3
   */
  headingLevel?: HeadingLevelOption;
}) {
  const Title = HEADING_TAGS[headingLevel];
  return (
    <Title
      data-slot="glass-card-title"
      className={cn("text-lg leading-tight font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </Title>
  );
}

/**
 * Muted helper text under the title (a `<p>`).
 *
 * Keyboard: none. Accessibility: plain markup, no role. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { GlassCardDescription } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GlassCardDescription>Last 30 days</GlassCardDescription>
 *   );
 * }
 * ```
 *
 * @see /components/glass-card
 */
export function GlassCardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p data-slot="glass-card-description" className={cn("text-sm text-sheen-fg-muted", className)} {...props} />;
}

/**
 * The main area of a `GlassCard`, with padding.
 *
 * Keyboard: none. Accessibility: plain markup, no role. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { GlassCardContent } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GlassCardContent>Your content</GlassCardContent>
 *   );
 * }
 * ```
 *
 * @see /components/glass-card
 */
export function GlassCardContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="glass-card-content" className={cn("p-6", className)} {...props} />;
}

/**
 * Bottom row of a `GlassCard` for actions or meta, laid out horizontally.
 *
 * Keyboard: none. Accessibility: plain markup, no role. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { Button, GlassCardFooter } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GlassCardFooter>
 *       <Button>Open</Button>
 *     </GlassCardFooter>
 *   );
 * }
 * ```
 *
 * @see /components/glass-card
 */
export function GlassCardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="glass-card-footer" className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />;
}

/** Props of {@link GlassCardHeader}. Top section of a `GlassCard`: stacks the title and description with padding. */
export type GlassCardHeaderProps = ComponentProps<typeof GlassCardHeader>;

/** Props of {@link GlassCardTitle}. The card's heading (an `<h3>` by default; see `headingLevel`). */
export type GlassCardTitleProps = ComponentProps<typeof GlassCardTitle>;

/** Props of {@link GlassCardDescription}. Muted helper text under the title (a `<p>`). */
export type GlassCardDescriptionProps = ComponentProps<typeof GlassCardDescription>;

/** Props of {@link GlassCardContent}. The main area of a `GlassCard`, with padding. */
export type GlassCardContentProps = ComponentProps<typeof GlassCardContent>;

/** Props of {@link GlassCardFooter}. Bottom row of a `GlassCard` for actions or meta, laid out horizontally. */
export type GlassCardFooterProps = ComponentProps<typeof GlassCardFooter>;
