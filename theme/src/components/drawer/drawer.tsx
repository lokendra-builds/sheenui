"use client";

import { useCallback, useMemo, useState } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";

import { useResolvedDirection } from "../../hooks/use-direction";

import {
  type DrawerSide,
  type DrawerSnapPoint,
  type DrawerLabels,
  defaultDrawerLabels,
  drawerSnapPresets,
  type DrawerProps,
  type BaseRootProps,
  HALF_ABOVE_PEEK,
  FULL_GAP,
  type ResolvedPresets,
  toBaseSnapPoint,
  toPx,
  useViewportHeight,
  type DrawerContextValue,
  DrawerContext,
  swipeDirections,
} from "./parts/model";

export {
  type DrawerSide,
  type DrawerSideProp,
  type DrawerSnapPreset,
  type DrawerSnapPoint,
  type DrawerLabels,
  type DrawerLabelsInput,
  defaultDrawerLabels,
  drawerSnapPresets,
  type DrawerProps,
} from "./parts/model";
export { type DrawerContentProps, DrawerContent } from "./parts/content";
export {
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerSwipeArea,
  type DrawerTriggerProps,
  type DrawerCloseProps,
  type DrawerHandleProps,
  type DrawerHeaderProps,
  type DrawerTitleProps,
  type DrawerDescriptionProps,
  type DrawerBodyProps,
  type DrawerFooterProps,
  type DrawerSwipeAreaProps,
} from "./parts/parts";

/* ---------- Root ---------- */

/**
 * Drawer / sheet: a strong-glass panel that slides in from an edge of the screen. Use it for filters, details and menus on phones and for side panels on desktop; use `Dialog` for a centred modal and `SideDrawer`
 * for a record detail or form panel. This is the root: it holds the open state (`open`, `defaultOpen`, `onOpenChange`) and the snap point. Compose `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`,
 * `DrawerDescription`, `DrawerBody`, `DrawerFooter` and `DrawerClose`.
 *
 * - Bottom sheet (`side="bottom"`) with a drag handle, swipe-to-dismiss and optional snap points ("peek" / "half" / "full", or your own heights; `snapPoints`, `snapPoint`, `defaultSnapPoint`, `onSnapPointChange`).
 *   The handle is a real button when there are snap points: click / Enter cycles them, ArrowUp / ArrowDown step through them, and it tells screen readers the current height.
 * - "peek" is measured from the content: the handle, the header and the first row of the body. "half" never drops below peek plus a row, so a short (landscape) screen still shows content.
 * - Side sheets (`left` / `right`) and a top sheet, attached to the edge or floating (`inset` on `DrawerContent`).
 * - `modal` (default true) traps focus; `labels` translates every string.
 * - Safe-area insets (notches, home indicator) are padded on every side that touches the screen edge.
 *
 * Keyboard: Enter or Space on the trigger opens it; focus moves in and is trapped (modal), Escape and an outside press close it, and focus returns to the trigger.
 * Accessibility: `role="dialog"` named by `DrawerTitle`; the page behind is inert and scroll-locked; the × button has an `aria-label` and a 44px target; the handle reads the current height.
 * Glass and motion: the `glass-3` popup itself slides (never a wrapper, so the blur never drops out). Enter springs (`--sheen-ease-smooth`); a button / Escape close is shorter and eases in with no overshoot; a swipe-dismiss keeps the finger's
 * momentum (ease-out, scaled by swipe speed). Reduced motion (OS or `[data-motion="reduced"]`): no sliding, the panel fades in place; dragging still follows the finger (direct manipulation).
 *
 * Built on Base UI Drawer: https://base-ui.com/react/components/drawer
 *
 * @example
 * ```tsx
 * import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Drawer snapPoints={["peek", "half", "full"]}>
 *       <DrawerTrigger render={<Button>Filters</Button>} />
 *       <DrawerContent>
 *         <DrawerHeader><DrawerTitle>Filters</DrawerTitle></DrawerHeader>
 *         <DrawerBody>...</DrawerBody>
 *       </DrawerContent>
 *     </Drawer>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export function Drawer({
  side: sideProp = "bottom",
  snapPoints,
  snapPoint: snapPointProp,
  defaultSnapPoint,
  onSnapPointChange,
  onOpenChange,
  labels: labelsProp,
  modal = true,
  children,
  ...props
}: DrawerProps) {
  const dir = useResolvedDirection();
  const side: DrawerSide =
    sideProp === "start"
      ? dir === "rtl"
        ? "right"
        : "left"
      : sideProp === "end"
        ? dir === "rtl"
          ? "left"
          : "right"
        : sideProp;
  const usesSnapPoints = side === "bottom" && snapPoints !== undefined && snapPoints.length > 0;
  const initialSnap = defaultSnapPoint !== undefined ? defaultSnapPoint : (snapPoints?.[0] ?? null);
  const [uncontrolledSnap, setUncontrolledSnap] = useState<DrawerSnapPoint | null>(initialSnap);
  const controlled = snapPointProp !== undefined;
  const snapPoint = controlled ? snapPointProp : uncontrolledSnap;

  const labels = useMemo<DrawerLabels>(
    () => ({
      ...defaultDrawerLabels,
      ...labelsProp,
      snapPoints: { ...defaultDrawerLabels.snapPoints, ...labelsProp?.snapPoints },
    }),
    [labelsProp],
  );

  // Keyed by value, so an inline array (snapPoints={["peek", "half"]}) doesn't hand Base UI a new
  // array on every render.
  const snapKey = usesSnapPoints ? JSON.stringify(snapPoints) : "[]";
  const stableSnapPoints = useMemo(() => JSON.parse(snapKey) as DrawerSnapPoint[], [snapKey]);

  // Content-aware presets: "peek" fits the header and a first row, "half" stays above it.
  const viewportHeight = useViewportHeight(usesSnapPoints);
  const [peekHeight, setPeekHeightState] = useState<number | null>(null);
  const setPeekHeight = useCallback((px: number) => {
    setPeekHeightState((previous) => (previous !== null && Math.abs(previous - px) < 2 ? previous : px));
  }, []);

  const presets = useMemo<ResolvedPresets>(() => {
    if (viewportHeight <= 0) return drawerSnapPresets;
    const peek = peekHeight ?? toPx(drawerSnapPresets.peek, viewportHeight);
    const half = Math.max(viewportHeight * 0.5, peek + HALF_ABOVE_PEEK);
    return {
      peek: peekHeight === null ? drawerSnapPresets.peek : `${Math.round(peekHeight)}px`,
      half: half > viewportHeight * 0.5 + 0.5 ? `${Math.round(half)}px` : 0.5,
      full: 1,
    };
  }, [peekHeight, viewportHeight]);

  const baseSnapPoints = useMemo(
    () => (stableSnapPoints.length > 0 ? stableSnapPoints.map((point) => toBaseSnapPoint(point, presets)) : undefined),
    [stableSnapPoints, presets],
  );

  /** Px height of a snap point, capped like Base UI caps it (the sheet can't be taller than the screen). */
  const heightOf = useCallback(
    (point: DrawerSnapPoint) => {
      const viewport = viewportHeight || (typeof window === "undefined" ? 0 : window.innerHeight);
      return Math.min(toPx(toBaseSnapPoint(point, presets), viewport), Math.max(0, viewport - FULL_GAP));
    },
    [presets, viewportHeight],
  );

  // Smallest first, whatever order (and units) they were given in. Points that end up the same
  // height (e.g. "half" on a short landscape screen) collapse into one, like Base UI does.
  const orderedSnapPoints = useMemo(() => {
    const entries = stableSnapPoints
      .map((point, order) => ({ point, order, height: heightOf(point) }))
      .sort((a, b) => a.height - b.height || a.order - b.order);
    return entries
      .filter((entry, index) => {
        const next = entries[index + 1];
        return !next || Math.abs(next.height - entry.height) > 1;
      })
      .map((entry) => entry.point);
  }, [stableSnapPoints, heightOf]);

  const snapIndex = useMemo(() => {
    if (snapPoint === null || orderedSnapPoints.length === 0) return 0;
    const exact = orderedSnapPoints.findIndex((point) => Object.is(point, snapPoint));
    if (exact !== -1) return exact;
    const target = heightOf(snapPoint);
    let best = 0;
    orderedSnapPoints.forEach((point, index) => {
      const bestPoint = orderedSnapPoints[best];
      if (bestPoint !== undefined && Math.abs(heightOf(point) - target) < Math.abs(heightOf(bestPoint) - target))
        best = index;
    });
    return best;
  }, [snapPoint, orderedSnapPoints, heightOf]);

  /** Base UI reports raw values ("182px", 0.5): hand back the name the caller used. */
  const fromBase = useCallback(
    (value: number | string | null): DrawerSnapPoint | null => {
      if (value === null) return value;
      const exact = stableSnapPoints.find((point) => Object.is(toBaseSnapPoint(point, presets), value));
      if (exact !== undefined) return exact;
      // The presets were re-measured in between: pick the nearest height.
      const viewport = viewportHeight || window.innerHeight;
      const target = toPx(value, viewport);
      let best: DrawerSnapPoint | undefined;
      for (const point of stableSnapPoints) {
        if (best === undefined || Math.abs(heightOf(point) - target) < Math.abs(heightOf(best) - target)) best = point;
      }
      return best ?? value;
    },
    [stableSnapPoints, presets, viewportHeight, heightOf],
  );

  const setSnapPoint = useCallback(
    (value: DrawerSnapPoint | null, details?: BaseDrawer.Root.SnapPointChangeEventDetails) => {
      if (!controlled) setUncontrolledSnap(value);
      onSnapPointChange?.(value, details);
    },
    [controlled, onSnapPointChange],
  );

  const context = useMemo<DrawerContextValue>(
    () => ({ side, modal, labels, orderedSnapPoints, snapIndex, snapPoint, setSnapPoint, setPeekHeight }),
    [side, modal, labels, orderedSnapPoints, snapIndex, snapPoint, setSnapPoint, setPeekHeight],
  );

  const snapProps: Partial<BaseRootProps> = usesSnapPoints
    ? {
        snapPoints: baseSnapPoints,
        snapPoint: snapPoint === null ? null : toBaseSnapPoint(snapPoint, presets),
        onSnapPointChange: (value, details) => setSnapPoint(fromBase(value), details),
      }
    : {};

  return (
    <DrawerContext value={context}>
      <BaseDrawer.Root
        swipeDirection={swipeDirections[side]}
        modal={modal}
        {...snapProps}
        onOpenChange={(open, details) => {
          // Every opening starts from the default snap point, not where it was last left.
          if (open && usesSnapPoints && !controlled) setUncontrolledSnap(initialSnap);
          onOpenChange?.(open, details);
        }}
        {...props}
      >
        {children}
      </BaseDrawer.Root>
    </DrawerContext>
  );
}

/**
 * The element that opens a `Drawer` (a `<button>` by default; use `render={<Button />}` for a SheenUI button). Pass a `handle` from `createDrawerHandle()` for a trigger outside `<Drawer>`.
 *
 * Keyboard: Enter or Space opens the drawer. Accessibility: `aria-haspopup="dialog"` and `aria-expanded`. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { Button, DrawerTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DrawerTrigger render={<Button variant="glass">Open</Button>} />
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export const DrawerTrigger = BaseDrawer.Trigger;
/**
 * A button inside the drawer that closes it (a "Done" or "Cancel" action in `DrawerFooter`).
 *
 * Keyboard: Enter or Space closes the drawer and focus returns to the trigger. Accessibility: a native button, so give it visible text or an `aria-label`. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { Button, DrawerClose, DrawerFooter } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DrawerFooter>
 *       <DrawerClose render={<Button variant="ghost">Cancel</Button>} />
 *     </DrawerFooter>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export const DrawerClose = BaseDrawer.Close;
/** Connects a Drawer to triggers rendered elsewhere: `<Drawer handle={h}>` + `<DrawerTrigger handle={h}>`. */
export const createDrawerHandle = BaseDrawer.createHandle;
