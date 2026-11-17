"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type PointerEvent, type RefObject } from "react";

import { cn } from "../../../lib/cn";
import { PHONE_QUERY, useMediaQuery } from "../../../hooks/use-media-query";

/**
 * How an overlay presents itself on a phone-width screen (`max-width: 640px`).
 *
 * - `"popup"`: the same floating panel as everywhere else.
 * - `"sheet"`: a bottom sheet: full width, a drag handle, swipe down to dismiss, height capped in `dvh` with the content
 *   scrolling inside, padded past the home indicator.
 */
export type MobilePresentation = "popup" | "sheet";

/**
 * True when `mobile` asks for a sheet and the viewport is phone-width. `false` on the server and during hydration, so markup never mismatches.
 *
 * @internal
 */
export function useSheetMode(mobile: MobilePresentation | undefined) {
  const phone = useMediaQuery(PHONE_QUERY, { enabled: mobile === "sheet" });
  return mobile === "sheet" && phone;
}

const SheetContext = createContext(false);

/**
 * Provides whether the overlay root above is presenting as a sheet. The root wrappers (Dialog, Popover, Menu) render it.
 *
 * @internal
 */
export const SheetProvider = SheetContext;

/**
 * True inside an overlay root that is presenting as a bottom sheet right now.
 *
 * @internal
 */
export function useIsSheet() {
  return useContext(SheetContext);
}

/** The imperative handle every Base UI overlay root exposes through `actionsRef`; `close` goes through `onOpenChange`. */
export type SheetActions = { close: () => void; unmount: () => void };

const SheetActionsContext = createContext<RefObject<SheetActions | null> | null>(null);

/**
 * Hands the overlay root's `actionsRef` to the sheet handle below it, so a swipe closes the overlay through the
 * primitive's own open-change path.
 *
 * @internal
 */
export const SheetActionsProvider = SheetActionsContext;

/**
 * The `actionsRef` to give a Base UI root: the caller's own when it passed one, else a private one.
 *
 * @internal
 */
export function useSheetActionsRef(own?: RefObject<SheetActions | null>): RefObject<SheetActions | null> {
  const fallback = useRef<SheetActions | null>(null);
  return own ?? fallback;
}

/**
 * Classes of the fixed element Base UI positions around a popup, turned into a full-width strip on the bottom edge.
 *
 * @internal
 */
export const sheetPositionerClass =
  "fixed! inset-x-0! top-auto! bottom-0! left-0! z-50 w-full! max-w-none! translate-none! transform-none! outline-none";

/**
 * The dimmed scrim behind a sheet (Base UI's `Backdrop` of each overlay).
 *
 * @internal
 */
export const sheetBackdropClass = cn(
  "fixed inset-0 z-50 min-h-dvh bg-sheen-scrim",
  "transition-opacity duration-(--sheen-duration-base) ease-sheen-out motion-reduced:duration-(--sheen-duration-fast)",
  "data-starting-style:opacity-0",
  "data-ending-style:opacity-0 data-ending-style:duration-(--sheen-duration-exit) data-ending-style:ease-sheen-exit",
);

/**
 * The sheet itself (replaces the popup's own placement and motion): the strong glass slides up from the edge, follows a
 * finger (`--sheen-sheet-drag`, set by {@link useSheetSwipe}), leaves with a shorter ease-in. Reduced motion: no sliding,
 * a plain fade.
 *
 * @internal
 */
export const sheetPopupClass = cn(
  "relative w-full! max-w-none! rounded-b-none! rounded-t-sheen-xl border-b-0 outline-none",
  "max-h-[min(85dvh,calc(100dvh-2rem))]! overflow-y-auto overscroll-contain",
  // Padding model: the popup states its own inline and block-end padding as `--sheen-sheet-px` / `--sheen-sheet-pb` (and
  // its own top padding with `pt-*`; defaults 0 and 0.5rem). The home-indicator inset is added below the content; the side insets (landscape
  // notches) only matter when they are larger than the popup's own padding. Both sides are symmetric, so RTL is the same.
  "pr-[max(var(--sheen-sheet-px,0px),env(safe-area-inset-right))] pl-[max(var(--sheen-sheet-px,0px),env(safe-area-inset-left))]",
  "pb-[calc(var(--sheen-sheet-pb,0.5rem)+env(safe-area-inset-bottom))]",
  "[transform:translateY(var(--sheen-sheet-drag,0px))]",
  "[transition:transform_var(--sheen-duration-smooth)_var(--sheen-ease-smooth),opacity_var(--sheen-duration-base)_var(--sheen-ease-out)]",
  "motion-ok:data-starting-style:[transform:translateY(calc(100%+2px))]",
  "data-ending-style:[transition:transform_var(--sheen-duration-exit-panel,calc(var(--sheen-duration-exit)*1.5))_var(--sheen-ease-exit),opacity_var(--sheen-duration-exit)_var(--sheen-ease-exit)]",
  // A sheet dragged past its own height (a short one) keeps going from where the finger left it, never back up to the edge.
  "motion-ok:data-ending-style:[transform:translateY(max(calc(100%+2px),var(--sheen-sheet-drag,0px)))]",
  "motion-reduced:data-starting-style:opacity-0 motion-reduced:data-ending-style:opacity-0",
  // While a finger holds it, it follows with no easing.
  "data-dragging:[transition:none]",
  "after:pointer-events-none after:absolute after:-inset-x-px after:top-full after:h-16 after:bg-[inherit] after:content-['']",
);

const DISMISS_DISTANCE = 96;
const DISMISS_VELOCITY = 0.6;
/** Pointer travel (px) below which a press on the handle is a tap, not a drag. */
const TAP_SLOP = 6;
/** Frames to wait for a closing overlay to enter its exit before treating the dismiss as vetoed. */
const SETTLE_FRAMES = 4;

/**
 * Swipe-to-dismiss for a sheet drawn from a floating-popup primitive (Select, Menu, Popover, Dialog). Spread the result
 * on the drag handle: the sheet follows the finger and, past a third of the way or on a fast flick, closes the overlay
 * through the root's `close` action (so `onOpenChange` still sees the dismiss and can veto it). Released early, it springs back.
 * @internal
 */
export function useSheetSwipe(popupRef: RefObject<HTMLElement | null>, actionsRef?: RefObject<SheetActions | null>) {
  const fromContext = useContext(SheetActionsContext);
  const actions = actionsRef ?? fromContext;
  const settle = useRef(0);
  const drag = useRef<{ id: number; startY: number; startAt: number; dy: number } | null>(null);
  const dragged = useRef(false);

  const setOffset = useCallback(
    (px: number | null) => {
      const popup = popupRef.current;
      if (!popup) return;
      if (px === null) {
        popup.style.removeProperty("--sheen-sheet-drag");
        popup.removeAttribute("data-dragging");
      } else {
        popup.style.setProperty("--sheen-sheet-drag", `${px}px`);
        popup.setAttribute("data-dragging", "");
      }
    },
    [popupRef],
  );

  useEffect(
    () => () => {
      cancelAnimationFrame(settle.current);
      setOffset(null);
    },
    [setOffset],
  );

  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* a synthetic pointer has nothing to capture */
      }
      dragged.current = false;
      drag.current = { id: event.pointerId, startY: event.clientY, startAt: event.timeStamp, dy: 0 };
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const state = drag.current;
      if (state?.id !== event.pointerId) return;
      state.dy = Math.max(0, event.clientY - state.startY);
      if (Math.abs(event.clientY - state.startY) > TAP_SLOP) dragged.current = true;
      setOffset(state.dy);
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      const state = drag.current;
      if (state?.id !== event.pointerId) return;
      drag.current = null;
      const popup = popupRef.current;
      const height = popup?.getBoundingClientRect().height ?? 0;
      const velocity = state.dy / Math.max(1, event.timeStamp - state.startAt);
      const dismiss =
        state.dy > Math.min(DISMISS_DISTANCE, height / 3) || (state.dy > 24 && velocity > DISMISS_VELOCITY);
      if (dismiss && popup) {
        // The overlay closes through its own dismiss path; its exit animation continues from the dragged position.
        popup.removeAttribute("data-dragging");
        actions?.current?.close();
        // Some roots (Popover) start their exit a frame or two after `close()`. Only when the overlay is still open after
        // that (the app vetoed it) does the sheet settle back; otherwise the exit carries on in the drag direction, never up.
        let frames = 0;
        const check = () => {
          const left =
            !popup.isConnected || popup.hasAttribute("data-ending-style") || popup.hasAttribute("data-closed");
          if (left) return;
          if (++frames < SETTLE_FRAMES) settle.current = requestAnimationFrame(check);
          else setOffset(null);
        };
        settle.current = requestAnimationFrame(check);
      } else {
        setOffset(null);
      }
    },
    /** A tap, Enter or Space on the handle closes the sheet through the same vetoable path as a swipe; the click that ends a drag is not a tap. */
    onClick() {
      if (dragged.current) {
        dragged.current = false;
        return;
      }
      actions?.current?.close();
    },
    onPointerCancel(event: PointerEvent<HTMLElement>) {
      if (drag.current?.id !== event.pointerId) return;
      drag.current = null;
      setOffset(null);
    },
  };
}

/**
 * The grab handle of a sheet: a real button (44 px tall hit area) named by the overlay's `labels.close`. Tap, click,
 * Enter or Space close the overlay and dragging it down dismisses it ({@link useSheetSwipe}); both go through the root's
 * own `close` action, so `onOpenChange` can veto them.
 *
 * @internal
 */
export function SheetHandle({
  popupRef,
  actionsRef,
  label,
  redundant = false,
}: {
  popupRef: RefObject<HTMLElement | null>;
  actionsRef?: RefObject<SheetActions | null>;
  /** Accessible name of the handle (the overlay's `labels.close`). */
  label: string;
  /**
   * The sheet already has a visible, named close button (a Dialog's ×): the handle then stays a touch target but is
   * hidden from assistive technology, so the sheet has exactly one "Close" to find.
   */
  redundant?: boolean;
}) {
  const swipe = useSheetSwipe(popupRef, actionsRef);
  return (
    <button
      type="button"
      aria-label={redundant ? undefined : label}
      aria-hidden={redundant || undefined}
      // Out of the Tab order on purpose: the overlay's own initial focus (a Select's highlighted option, a Dialog's first field)
      // must not land on the handle. Escape and the overlay's own controls are the keyboard way out; assistive technology
      // and touch operate the handle directly.
      tabIndex={-1}
      data-slot="sheet-handle"
      className="group sticky top-0 z-10 -mb-2 flex h-11 w-full shrink-0 cursor-grab touch-none items-start justify-center bg-transparent pt-1.5 select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus active:cursor-grabbing"
      {...swipe}
    >
      <span className="flex h-6 w-16 items-center justify-center">
        <span className="block h-1.5 w-10 rounded-sheen-full bg-sheen-fg-subtle/55 forced-colors:bg-[CanvasText]" />
      </span>
    </button>
  );
}
