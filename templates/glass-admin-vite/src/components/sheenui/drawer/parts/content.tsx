"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";

import { cn, classNameWith } from "../../lib/cn";
import { useMergedRef } from "../../lib/form";
import { PEEK_ROW_MAX, useDrawerContext } from "./model";
import { DrawerHandle } from "./parts";

/* ---------- Content ---------- */

/**
 * Props of `DrawerContent`: the Base UI `Drawer.Popup` props plus SheenUI's own options, each
 * documented on its field.
 */
export type DrawerContentProps = ComponentProps<typeof BaseDrawer.Popup> & {
  /** Show the × button in the top corner. Default true. */
  showClose?: boolean;
  /** Show the drag handle. Defaults to on for bottom and top sheets. */
  handle?: boolean;
  /** Float the panel off the edges (rounded on every side) instead of attaching it to the edge. Default false. */
  inset?: boolean;
  /**
   * Keep focused fields above the on-screen keyboard (bottom sheets with forms).
   * Uses Base UI's Drawer.VirtualKeyboardProvider. Default true.
   */
  keyboardAware?: boolean;
  /** Where to portal the drawer (defaults to <body>). */
  container?: ComponentProps<typeof BaseDrawer.Portal>["container"];
  /** Adds extra classes to the full-screen positioning layer. */
  viewportClassName?: string;
  /** Class for the dimmed scrim behind a modal drawer. */
  backdropClassName?: string;
  /** The sheet's content: usually `DrawerHeader`, `DrawerBody` and `DrawerFooter`. */
  children?: ReactNode;
};

/*
 * Spring in; a shorter, overshoot-free ease-in out. Opacity only matters under reduced motion.
 * The exit of a large panel is derived from the exit token (x1.5, overridable with
 * --sheen-duration-exit-panel): still well under the enter spring, and never overshooting.
 */
/** The transition classes of the drawer popup: a smooth enter and a shorter, non-overshooting exit. @internal */
export const popupMotion = cn(
  "[transition:transform_var(--sheen-duration-smooth)_var(--sheen-ease-smooth),scale_var(--sheen-duration-smooth)_var(--sheen-ease-smooth),opacity_var(--sheen-duration-base)_var(--sheen-ease-out)]",
  "data-ending-style:[transition:transform_var(--sheen-duration-exit-panel,calc(var(--sheen-duration-exit)*1.5))_var(--sheen-ease-exit),opacity_var(--sheen-duration-exit)_var(--sheen-ease-exit)]",
  // Released by a swipe: keep the finger's momentum, faster for a faster flick.
  "data-ending-style:data-swipe-dismiss:[transition:transform_calc(var(--drawer-swipe-strength)*var(--sheen-duration-slow))_var(--sheen-ease-out),opacity_var(--sheen-duration-exit)_var(--sheen-ease-exit)]",
  // Reduced motion (OS setting or in-app toggle): nothing slides, the panel fades in place.
  "motion-reduced:data-starting-style:opacity-0 motion-reduced:data-ending-style:opacity-0",
);

/*
 * Per side: where the panel sits, how it follows the finger, and where it enters from.
 * "Bleed": a strip of the same surface just past the screen edge (::after), so a drag past
 * the open position or the spring's tiny overshoot never shows a gap.
 */
/** The popup classes of an edge-attached drawer, per side. @internal */
export const attached = {
  bottom: cn(
    "w-full max-w-2xl max-h-[calc(100dvh-var(--sheen-drawer-gap))] rounded-t-sheen-xl border-b-0",
    "pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]",
    "[transform:translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))]",
    "motion-ok:data-starting-style:[transform:translateY(calc(100%+2px))] motion-ok:data-ending-style:[transform:translateY(calc(100%+2px))]",
    "after:pointer-events-none after:absolute after:-inset-x-px after:top-full after:bottom-auto after:h-16 after:bg-[inherit] after:content-['']",
  ),
  top: cn(
    "w-full max-w-2xl max-h-[calc(100dvh-var(--sheen-drawer-gap))] rounded-b-sheen-xl border-t-0",
    "pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]",
    "[transform:translateY(var(--drawer-swipe-movement-y))]",
    "motion-ok:data-starting-style:[transform:translateY(calc(-100%-2px))] motion-ok:data-ending-style:[transform:translateY(calc(-100%-2px))]",
    "after:pointer-events-none after:absolute after:-inset-x-px after:bottom-full after:top-auto after:h-16 after:bg-[inherit] after:content-['']",
  ),
  left: cn(
    "h-full w-[min(22rem,calc(100vw-3rem))] rounded-r-sheen-xl border-l-0",
    "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]",
    "[transform:translateX(var(--drawer-swipe-movement-x))]",
    "motion-ok:data-starting-style:[transform:translateX(calc(-100%-2px))] motion-ok:data-ending-style:[transform:translateX(calc(-100%-2px))]",
    "after:pointer-events-none after:absolute after:-inset-y-px after:right-full after:left-auto after:w-16 after:bg-[inherit] after:content-['']",
  ),
  right: cn(
    "h-full w-[min(22rem,calc(100vw-3rem))] rounded-l-sheen-xl border-r-0",
    "pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]",
    "[transform:translateX(var(--drawer-swipe-movement-x))]",
    "motion-ok:data-starting-style:[transform:translateX(calc(100%+2px))] motion-ok:data-ending-style:[transform:translateX(calc(100%+2px))]",
    "after:pointer-events-none after:absolute after:-inset-y-px after:left-full after:right-auto after:w-16 after:bg-[inherit] after:content-['']",
  ),
} as const;

/* Floating: rounded all round, held off the edges (and out of the safe areas) by the viewport's padding. */
/** The popup classes of a floating drawer, per side: rounded and held off the edges. @internal */
export const floating = {
  bottom: cn(
    "w-full max-w-2xl max-h-[calc(100dvh-var(--sheen-drawer-gap)-0.5rem)] rounded-sheen-xl",
    "[transform:translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))]",
    "motion-ok:data-starting-style:[transform:translateY(calc(100%+var(--sheen-drawer-inset-bottom)+2px))] motion-ok:data-ending-style:[transform:translateY(calc(100%+var(--sheen-drawer-inset-bottom)+2px))]",
  ),
  top: cn(
    "w-full max-w-2xl max-h-[calc(100dvh-var(--sheen-drawer-gap)-0.5rem)] rounded-sheen-xl",
    "[transform:translateY(var(--drawer-swipe-movement-y))]",
    "motion-ok:data-starting-style:[transform:translateY(calc(-100%-var(--sheen-drawer-inset-top)-2px))] motion-ok:data-ending-style:[transform:translateY(calc(-100%-var(--sheen-drawer-inset-top)-2px))]",
  ),
  left: cn(
    "h-full w-[min(22rem,calc(100vw-3rem))] rounded-sheen-xl",
    "[transform:translateX(var(--drawer-swipe-movement-x))]",
    "motion-ok:data-starting-style:[transform:translateX(calc(-100%-var(--sheen-drawer-inset-left)-2px))] motion-ok:data-ending-style:[transform:translateX(calc(-100%-var(--sheen-drawer-inset-left)-2px))]",
  ),
  right: cn(
    "h-full w-[min(22rem,calc(100vw-3rem))] rounded-sheen-xl",
    "[transform:translateX(var(--drawer-swipe-movement-x))]",
    "motion-ok:data-starting-style:[transform:translateX(calc(100%+var(--sheen-drawer-inset-right)+2px))] motion-ok:data-ending-style:[transform:translateX(calc(100%+var(--sheen-drawer-inset-right)+2px))]",
  ),
} as const;

/** The viewport anchoring classes of each drawer side. @internal */
export const viewportSide = {
  bottom: "items-end justify-center",
  top: "items-start justify-center",
  left: "items-stretch justify-start",
  right: "items-stretch justify-end",
} as const;

/** The first "row" of the body: step into lists and wrappers until something row-sized. */
export function firstRow(body: HTMLElement): Element | null {
  let element = body.firstElementChild;
  while (element?.firstElementChild && element.getBoundingClientRect().height > PEEK_ROW_MAX) {
    element = element.firstElementChild;
  }
  return element;
}

/** Height that shows the handle, the header and the first row of the body (plus the home-indicator area). */
export function measurePeek(popup: HTMLElement): number | null {
  // Scaled back behind a nested sheet: distances are off until it returns.
  if (popup.hasAttribute("data-nested-drawer-open")) return null;
  const top = popup.getBoundingClientRect().top;
  const safeArea = popup.querySelector<HTMLElement>(':scope > [data-slot="drawer-safe-area"]')?.offsetHeight ?? 0;
  const body = popup.querySelector<HTMLElement>(':scope > [data-slot="drawer-body"]');
  if (!body) {
    const header = popup.querySelector(':scope > [data-slot="drawer-header"]');
    return header ? Math.ceil(header.getBoundingClientRect().bottom - top + safeArea) : null;
  }
  const bodyTop = body.getBoundingClientRect().top;
  const row = firstRow(body);
  const rowBottom = row ? row.getBoundingClientRect().bottom - bodyTop + body.scrollTop : 0;
  return Math.ceil(bodyTop - top + Math.min(Math.max(0, rowBottom), PEEK_ROW_MAX) + 4 + safeArea);
}

/** Whether a focused element sits (partly) below the visible part of a snapped sheet. */
export function isBelowFold(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const visibleBottom = window.visualViewport?.height ?? window.innerHeight;
  if (rect.top >= visibleBottom - 8 || rect.bottom > visibleBottom + 1) return true;
  // The scroll body itself: only when too little of it is on screen to scroll through.
  if (element.getAttribute("data-slot") === "drawer-body") return element.clientHeight < 48;
  const body = element.closest<HTMLElement>('[data-slot="drawer-body"]');
  return body ? rect.bottom > body.getBoundingClientRect().bottom + 1 : false;
}

/**
 * The glass panel of a `Drawer`, portalled to the end of the body with a dimmed scrim (for a modal drawer). `showClose` toggles the × button, `handle` the drag handle (on for bottom and top sheets), `inset` floats the panel off the edges,
 * `keyboardAware` keeps focused fields above the on-screen keyboard (bottom sheets with forms), `container` chooses where it portals, and `viewportClassName` / `backdropClassName` style the positioning layer and the scrim.
 * Every other prop goes to the Base UI popup.
 *
 * Keyboard: see `Drawer` (focus trapped, Escape closes). Accessibility: `role="dialog"`; label it with `DrawerTitle`. Glass and motion: `glass-3` panel that slides from its edge; reduced transparency and forced colors give it a solid surface; see `Drawer` for the motion rules.
 *
 * @example
 * ```tsx
 * import { DrawerContent, DrawerHeader, DrawerTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DrawerContent inset showClose={false}>
 *       <DrawerHeader><DrawerTitle>Notifications</DrawerTitle></DrawerHeader>
 *     </DrawerContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export function DrawerContent({
  className,
  children,
  showClose = true,
  handle,
  inset = false,
  keyboardAware = true,
  container,
  viewportClassName,
  backdropClassName,
  ref,
  onFocus,
  onPointerDownCapture,
  onKeyDownCapture,
  ...props
}: DrawerContentProps) {
  const { side, modal, labels, orderedSnapPoints, snapPoint, setSnapPoint, setPeekHeight } =
    useDrawerContext("DrawerContent");
  const vertical = side === "bottom" || side === "top";
  const showHandle = handle ?? vertical;
  const snaps = orderedSnapPoints.length > 0;
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const popupRef = useMergedRef(setPopup, ref);
  /** The last input was a pointer press (until a key is pressed). */
  const pointerInput = useRef(false);

  // Measure "peek" (handle + header + first row) while the sheet is open.
  useEffect(() => {
    if (!snaps || !popup || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const height = measurePeek(popup);
      if (height !== null && height > 0) setPeekHeight(height);
    };
    const resize = new ResizeObserver(measure);
    const observeAll = () => {
      resize.disconnect();
      resize.observe(popup);
      for (const child of Array.from(popup.children)) resize.observe(child);
      const row = popup.querySelector<HTMLElement>(':scope > [data-slot="drawer-body"]');
      const first = row ? firstRow(row) : null;
      if (first) resize.observe(first);
      measure();
    };
    const mutations = new MutationObserver(observeAll);
    mutations.observe(popup, { childList: true });
    observeAll();
    return () => {
      resize.disconnect();
      mutations.disconnect();
    };
  }, [snaps, popup, setPeekHeight]);

  /*
   * A snapped sheet hides part of its content below the screen edge. When KEYBOARD focus moves
   * to something down there, open the sheet fully so the focused control is visible. A click or
   * tap never changes the height (the person can already see what they pressed).
   */
  function handleFocus(event: Parameters<NonNullable<DrawerContentProps["onFocus"]>>[0]) {
    onFocus?.(event);
    if (!snaps || pointerInput.current || event.target === event.currentTarget) return;
    const tallest = orderedSnapPoints[orderedSnapPoints.length - 1];
    if (tallest === undefined || Object.is(snapPoint, tallest)) return;
    const target = event.target;
    const sheet = event.currentTarget;
    // A frame later: the browser has scrolled the focused element into view inside the body. While
    // the sheet is still sliding in (or out) everything is below the screen edge, so wait until it
    // has stopped moving before judging (focus on the handle right after opening must not expand it).
    let frames = 0;
    const check = () => {
      if (document.activeElement !== target) return;
      const moving =
        sheet.hasAttribute("data-starting-style") ||
        sheet.hasAttribute("data-ending-style") ||
        sheet.getAnimations().length > 0;
      if (moving && frames++ < 90) {
        requestAnimationFrame(check);
        return;
      }
      if (isBelowFold(target)) setSnapPoint(tallest);
    };
    requestAnimationFrame(check);
  }

  const portal = (
    <BaseDrawer.Portal container={container}>
      {modal !== false && (
        <BaseDrawer.Backdrop
          className={cn(
            "fixed inset-0 z-50 min-h-dvh bg-sheen-scrim",
            // Lightens as the sheet is dragged away. With snap points Base UI reports full progress
            // below the tallest point, so keep a lighter dim there instead of none.
            snaps
              ? "opacity-[calc(1-0.6*var(--drawer-swipe-progress))]"
              : "opacity-[calc(1-var(--drawer-swipe-progress))]",
            "transition-opacity duration-(--sheen-duration-slow) ease-sheen-out data-swiping:duration-0",
            "data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[var(--sheen-duration-exit-panel,calc(var(--sheen-duration-exit)*1.5))] data-ending-style:ease-sheen-exit",
            // iOS Safari: a fixed full-height layer jumps with the toolbar; absolute does not.
            "supports-[-webkit-touch-callout:none]:absolute",
            "forced-colors:hidden",
            backdropClassName,
          )}
        />
      )}
      <BaseDrawer.Viewport
        className={cn(
          "fixed inset-0 z-50 flex",
          // Room kept above a bottom sheet (and below a top sheet), clear of the notch / status bar.
          "[--sheen-drawer-gap:max(1.5rem,calc(env(safe-area-inset-top)+0.75rem))]",
          viewportSide[side],
          inset && [
            "[--sheen-drawer-inset-top:max(0.5rem,env(safe-area-inset-top))] [--sheen-drawer-inset-right:max(0.5rem,env(safe-area-inset-right))]",
            "[--sheen-drawer-inset-bottom:max(0.5rem,env(safe-area-inset-bottom))] [--sheen-drawer-inset-left:max(0.5rem,env(safe-area-inset-left))]",
            "pt-(--sheen-drawer-inset-top) pr-(--sheen-drawer-inset-right) pb-(--sheen-drawer-inset-bottom) pl-(--sheen-drawer-inset-left)",
          ],
          // Non-modal: the page behind stays usable.
          modal === false && "pointer-events-none",
          viewportClassName,
        )}
      >
        <BaseDrawer.Popup
          ref={popupRef}
          data-slot="drawer-content"
          data-side={side}
          data-inset={inset ? "" : undefined}
          onFocus={handleFocus}
          onPointerDownCapture={(event) => {
            pointerInput.current = true;
            onPointerDownCapture?.(event);
          }}
          onKeyDownCapture={(event) => {
            pointerInput.current = false;
            onKeyDownCapture?.(event);
          }}
          className={classNameWith(className, (extra) =>
            cn(
              "glass-3 group/drawer pointer-events-auto relative flex min-h-0 flex-col text-sheen-fg outline-none",
              "touch-none",
              inset ? floating[side] : attached[side],
              side === "bottom" && !inset && !snaps && "pb-[env(safe-area-inset-bottom)]",
              snaps &&
                (inset
                  ? "h-[calc(100dvh-var(--sheen-drawer-gap)-0.5rem)] [padding-bottom:max(0px,calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))]"
                  : "h-[calc(100dvh-var(--sheen-drawer-gap))] [padding-bottom:max(env(safe-area-inset-bottom),calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))]"),
              popupMotion,
              side === "bottom" &&
                "origin-top motion-ok:data-nested-drawer-open:scale-[calc(1-0.05*var(--nested-drawers))]",
              "data-swiping:select-none",
              extra,
            ),
          )}
          {...props}
        >
          {showHandle && side !== "top" && <DrawerHandle />}
          {children}
          {showHandle && side === "top" && <DrawerHandle />}
          {/* Measures the home-indicator area, so "peek" keeps its first row above it. */}
          {snaps && (
            <span
              aria-hidden
              data-slot="drawer-safe-area"
              className="pointer-events-none invisible absolute bottom-0 left-0 h-[env(safe-area-inset-bottom)] w-px"
            />
          )}
          {/* Dims this sheet while a nested one is on top of it. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-sheen-scrim opacity-0 transition-opacity duration-(--sheen-duration-base) group-data-nested-drawer-open/drawer:opacity-100"
          />
          {showClose && (
            <BaseDrawer.Close
              aria-label={labels.close}
              className={cn(
                "absolute top-3 end-3 z-20 flex size-9 items-center justify-center rounded-sheen-full text-sheen-fg-muted",
                side === "top" && "top-[calc(env(safe-area-inset-top)+0.75rem)]",
                // The close button sits at the logical end; only the physical outer edge needs the notch inset.
                side === "right" &&
                  !inset &&
                  "end-[calc(env(safe-area-inset-right)+0.75rem)] top-[calc(env(safe-area-inset-top)+0.75rem)] rtl:end-3",
                side === "left" &&
                  !inset &&
                  "top-[calc(env(safe-area-inset-top)+0.75rem)] rtl:end-[calc(env(safe-area-inset-left)+0.75rem)]",
                "transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                // 44 × 44 hit area on touch screens.
                "any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-1",
                "forced-colors:border forced-colors:border-[ButtonText]",
              )}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </BaseDrawer.Close>
          )}
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  );

  return keyboardAware && side === "bottom" ? (
    <BaseDrawer.VirtualKeyboardProvider>{portal}</BaseDrawer.VirtualKeyboardProvider>
  ) : (
    portal
  );
}
