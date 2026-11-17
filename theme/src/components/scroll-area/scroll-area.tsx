"use client";

import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";

import { cn } from "../../lib/cn";

/**
 * Props of `ScrollArea`: the Base UI `ScrollArea.Root` props plus SheenUI's own options, each
 * documented on its field.
 */
export type ScrollAreaProps = Omit<ComponentProps<typeof BaseScrollArea.Root>, "className" | "children" | "style"> & {
  /** Holds the content that scrolls. */
  children?: ReactNode;
  /** Sets the inline styles for the root element. */
  style?: CSSProperties;
  /** Root element: give it a height (vertical) or width (horizontal). */
  className?: string;
  /** Which way the content scrolls. Default "vertical". */
  orientation?: "vertical" | "horizontal" | "both";
  /** How the edges show there is more content. Default "mask". */
  fade?: "mask" | "shadow" | "none";
  /** Length of the edge fade, in px. Default 32. */
  fadeSize?: number;
  /** "hover" (default): scrollbars appear on hover / scroll / focus. "always": always shown. */
  scrollbars?: "hover" | "always";
  /** Accessible name for the scrollable region (adds role="region"). */
  label?: string;
  /** Adds classes to the scrolling element (Base UI Viewport). */
  viewportClassName?: string;
  /** Adds classes to the content wrapper inside the viewport. */
  contentClassName?: string;
  /** Ref to the scrolling element, e.g. to scroll programmatically. */
  viewportRef?: Ref<HTMLDivElement>;
};

/*
 * Base UI keeps --scroll-area-overflow-{x,y}-{start,end} on the viewport: how far (px) the
 * content runs past each edge. min() with the fade length makes each edge fade in gradually
 * as you scroll away from it, and stay crisp at the very start / end.
 */
function maskFor(axis: "x" | "y", dir: string) {
  return (
    `linear-gradient(${dir}, transparent 0, black min(var(--sheen-scroll-fade), var(--scroll-area-overflow-${axis}-start, 0px)),` +
    ` black calc(100% - min(var(--sheen-scroll-fade), var(--scroll-area-overflow-${axis}-end, 0px))), transparent 100%)`
  );
}

function maskStyle(orientation: NonNullable<ScrollAreaProps["orientation"]>): CSSProperties {
  const y = maskFor("y", "to bottom");
  // Inline start → end: the direction flips in RTL (set by a class on the viewport).
  const x = maskFor("x", "var(--sheen-scroll-dir-x)");
  const image = orientation === "vertical" ? y : orientation === "horizontal" ? x : `${y}, ${x}`;
  return {
    maskImage: image,
    WebkitMaskImage: image,
    // Both axes: only what both layers keep stays visible.
    ...(orientation === "both" ? { maskComposite: "intersect", WebkitMaskComposite: "source-in" } : null),
  };
}

/**
 * ScrollArea: a native scroll container (Base UI ScrollArea) with slim glass scrollbars and edges that fade
 * only where there is more to scroll. Use it for panels, lists and code with a fixed height or width.
 *
 * - Give the root a size with `className` (`h-72` for vertical, `w-full` for horizontal); `orientation` is
 *   "vertical" (default), "horizontal" or "both".
 * - `fade` picks how the edges show more content: "mask" (default) fades the content itself; "shadow" draws soft
 *   scroll shadows over it, which is safe with glass content (a mask turns the viewport into a backdrop root, so glass
 *   placed INSIDE a masked area loses its blur: use "shadow" or "none" for lists of glass cards); "none" for no fade.
 * - `scrollbars` is "hover" (default) or "always"; `label` names the region; `viewportRef` gives you the scrolling
 *   element; `viewportClassName` and `contentClassName` style the viewport and its content wrapper.
 *
 * Keyboard: scrolling stays native (wheel, touch, arrows, Page keys, Space, find-in-page). The viewport is focusable while it can scroll,
 * so keyboard users can scroll it with arrows; its focus ring is drawn inside the root's edge (following the root's radius),
 * above the content, so the edge fades never hide it.
 * Accessibility: pass `label` to give the scrollable area `role="region"` and a name; the ring is an outline, so it shows in forced colors.
 * Glass and motion: scrollbars appear on hover, while scrolling and while the viewport has keyboard focus
 * (`scrollbars="always"` keeps them visible). Their fade is opacity only, so it stays under reduced motion; the thumb
 * follows the scroll position without transitions.
 *
 * @example
 * ```tsx
 * import { ScrollArea } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ScrollArea className="h-72" label="Release notes">
 *       <article className="p-4">…long content…</article>
 *     </ScrollArea>
 *   );
 * }
 * ```
 *
 * @see /layout/scroll-area
 */
export function ScrollArea({
  children,
  className,
  orientation = "vertical",
  fade = "mask",
  fadeSize = 32,
  scrollbars = "hover",
  label,
  viewportClassName,
  contentClassName,
  viewportRef,
  overflowEdgeThreshold = 1,
  style,
  ...props
}: ScrollAreaProps) {
  const vertical = orientation !== "horizontal";
  const horizontal = orientation !== "vertical";

  return (
    <BaseScrollArea.Root
      data-slot="scroll-area"
      data-scrollbars={scrollbars}
      overflowEdgeThreshold={overflowEdgeThreshold}
      style={{ "--sheen-scroll-fade": `${fadeSize}px`, ...style } as CSSProperties}
      className={cn(
        "group/scroll relative flex min-h-0 min-w-0 overflow-hidden",
        // Keyboard focus ring. The viewport is masked at its edges (which would hide a ring
        // drawn on it), so the ring is an inset outline on an overlay of the unmasked root,
        // above the content and the scrollbars. Outlines stay visible in forced colours.
        "after:pointer-events-none after:absolute after:inset-0 after:z-30 after:rounded-[inherit]",
        "has-[>[data-slot=scroll-area-viewport]:focus-visible]:after:outline-2",
        "has-[>[data-slot=scroll-area-viewport]:focus-visible]:after:-outline-offset-2",
        "has-[>[data-slot=scroll-area-viewport]:focus-visible]:after:outline-sheen-focus",
        className,
      )}
      {...props}
    >
      <BaseScrollArea.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        role={label ? "region" : undefined}
        aria-label={label}
        style={fade === "mask" ? maskStyle(orientation) : undefined}
        className={cn(
          // No ring on the viewport itself: the root draws it (see above).
          "size-full min-h-0 flex-1 overscroll-contain rounded-[inherit] outline-none",
          "[--sheen-scroll-dir-x:to_right] rtl:[--sheen-scroll-dir-x:to_left]",
          viewportClassName,
        )}
      >
        <BaseScrollArea.Content
          data-slot="scroll-area-content"
          className={cn(
            // Room for the overlay scrollbar, so it never sits on top of text.
            vertical && "pe-3",
            horizontal && "pb-3",
            contentClassName,
          )}
        >
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>

      {vertical && <Scrollbar orientation="vertical" />}
      {horizontal && <Scrollbar orientation="horizontal" />}
      {orientation === "both" && <BaseScrollArea.Corner className="bg-transparent" />}

      {fade === "shadow" && (
        <>
          {vertical && (
            <>
              <EdgeShadow className="inset-x-0 top-0 h-5 bg-linear-to-b group-data-overflow-y-start/scroll:opacity-100" />
              <EdgeShadow className="inset-x-0 bottom-0 h-5 bg-linear-to-t group-data-overflow-y-end/scroll:opacity-100" />
            </>
          )}
          {horizontal && (
            <>
              <EdgeShadow className="inset-y-0 start-0 w-5 bg-linear-to-r rtl:bg-linear-to-l group-data-overflow-x-start/scroll:opacity-100" />
              <EdgeShadow className="inset-y-0 end-0 w-5 bg-linear-to-l rtl:bg-linear-to-r group-data-overflow-x-end/scroll:opacity-100" />
            </>
          )}
        </>
      )}
    </BaseScrollArea.Root>
  );
}

/** A soft shadow over one edge, shown while content is hidden past it. Opacity-only transition. */
function EdgeShadow({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-10 rounded-[inherit] from-(--sheen-shadow-far) to-transparent opacity-0",
        "transition-opacity duration-(--sheen-duration-base) ease-sheen-out",
        "forced-colors:hidden",
        className,
      )}
    />
  );
}

function Scrollbar({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const v = orientation === "vertical";
  return (
    <BaseScrollArea.Scrollbar
      orientation={orientation}
      data-slot="scroll-area-scrollbar"
      className={cn(
        "group/bar z-20 flex touch-none p-0.5 select-none",
        v ? "w-3 justify-center" : "h-3 flex-col justify-center",
        // The track: a faint frosted rail that shows on hover.
        "rounded-sheen-full before:absolute before:inset-0.5 before:rounded-[inherit] before:bg-sheen-hover before:opacity-0",
        "before:transition-opacity before:duration-(--sheen-duration-base) hover:before:opacity-100 data-scrolling:before:opacity-60",
        // Visibility: on hover / while scrolling / while the viewport has keyboard focus.
        "transition-opacity duration-(--sheen-duration-base) ease-sheen-out",
        "group-data-[scrollbars=hover]/scroll:pointer-events-none group-data-[scrollbars=hover]/scroll:opacity-0",
        "group-data-[scrollbars=hover]/scroll:data-hovering:pointer-events-auto group-data-[scrollbars=hover]/scroll:data-hovering:opacity-100",
        "group-data-[scrollbars=hover]/scroll:data-scrolling:pointer-events-auto group-data-[scrollbars=hover]/scroll:data-scrolling:opacity-100 data-scrolling:duration-0",
        "group-has-[[data-slot=scroll-area-viewport]:focus-visible]/scroll:opacity-100",
        // A bit wider on touch screens, where it is dragged with a finger.
        v ? "any-pointer-coarse:w-3.5" : "any-pointer-coarse:h-3.5",
      )}
    >
      <BaseScrollArea.Thumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative rounded-sheen-full",
          v ? "w-full" : "h-full",
          // The visible pill is a pseudo-element, so it can thicken on hover with a transform
          // (Base UI moves the thumb itself with a transform every frame).
          "before:absolute before:rounded-[inherit] before:bg-sheen-fg/28 before:shadow-[inset_0_0_0_1px_var(--sheen-glass-border)]",
          v ? "before:inset-y-0 before:inset-x-[1px]" : "before:inset-x-0 before:inset-y-[1px]",
          "before:transition-[background-color] before:duration-(--sheen-duration-fast)",
          "group-hover/bar:before:bg-sheen-fg/42 data-scrolling:before:bg-sheen-fg/40",
          "motion-ok:before:transition-[background-color,scale] motion-ok:before:duration-(--sheen-duration-snappy) motion-ok:before:ease-sheen-snappy",
          // Slim at rest, full width under the pointer (an instant swap under reduced motion).
          v
            ? "before:scale-x-75 group-hover/bar:before:scale-x-100"
            : "before:scale-y-75 group-hover/bar:before:scale-y-100",
          // High contrast: a solid system-coloured thumb.
          "forced-colors:before:bg-[CanvasText] forced-colors:before:[forced-color-adjust:none]",
        )}
      />
    </BaseScrollArea.Scrollbar>
  );
}
