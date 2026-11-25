"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";

import { useLatest } from "../../../hooks/use-latest";
import { cn } from "../../../lib/cn";
import { clamp } from "../../../lib/math";

/* ---------- Resize handle ---------- */

/** Keeps 3rem of the page visible (matches the CSS clamp). */
export const PAGE_GUTTER = 48;

/** The viewport width, updated on resize. @internal */
export function useViewportWidth() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("resize", onChange);
      return () => window.removeEventListener("resize", onChange);
    },
    () => window.innerWidth,
    () => 1280,
  );
}

/**
 * Rendered width of an element, kept up to date. 0 until the observer's first report, which arrives right after the
 * element's first layout: reading the rect here, inside the open commit, would force an extra style and layout pass
 * of the panel (the callers fall back to a live measurement while it is 0).
 */
export function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setWidth(element.getBoundingClientRect().width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/** The props of the resize handle. @internal */
export type ResizeHandleProps = {
  open: boolean;
  side: "left" | "right";
  label: string;
  valueText: (width: number) => string;
  widerLabel: string;
  narrowerLabel: string;
  popupRef: RefObject<HTMLDivElement | null>;
  popupId: string;
  minWidth: number;
  maxWidth: number | undefined;
  onResize: (width: number) => void;
  onCommit: (width: number | null) => void;
  /** A drag was cancelled: put the width back. */
  onCancel: () => void;
  onResizingChange: (resizing: boolean) => void;
};

/** The pointer, start position and width of a resize drag. @internal */
export type DragState = { pointerId: number; startX: number; startWidth: number; width: number; target: HTMLElement };

/**
 * The separator on the panel's free edge (WAI-ARIA window splitter): drag it, or focus it and
 * use ← / → (Shift: bigger steps), Home / End. Double-click resets to the size's width; Escape
 * during a drag cancels it. `data-base-ui-swipe-ignore` keeps Base UI's swipe-to-dismiss from
 * claiming the drag.
 */
export function ResizeHandle({
  open,
  side,
  label,
  valueText,
  widerLabel,
  narrowerLabel,
  popupRef,
  popupId,
  minWidth,
  maxWidth,
  onResize,
  onCommit,
  onCancel,
  onResizingChange,
}: ResizeHandleProps) {
  const viewport = useViewportWidth();
  const measured = useElementWidth(popupRef);
  const max = Math.max(minWidth, Math.min(maxWidth ?? Number.POSITIVE_INFINITY, viewport - PAGE_GUTTER));
  const min = Math.min(minWidth, max);
  const fit = (value: number) => clamp(value, min, max);
  const drag = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);
  const frame = useRef(0);
  const latestRef = useLatest({ onResizingChange, onCancel });

  function setDraggingState(next: boolean) {
    setDragging(next);
    latestRef.current.onResizingChange(next);
    // The cursor stays a resize cursor (and text doesn't get selected) wherever the pointer goes.
    document.documentElement.style.cursor = next ? "col-resize" : "";
  }

  /** Ends a drag without keeping its width: Escape, the drawer closing, the handle unmounting. */
  const cancelDrag = useCallback(() => {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    cancelAnimationFrame(frame.current);
    if (state.target.hasPointerCapture(state.pointerId)) state.target.releasePointerCapture(state.pointerId);
    setDragging(false);
    document.documentElement.style.cursor = "";
    latestRef.current.onResizingChange(false);
    latestRef.current.onCancel();
  }, [latestRef]);

  // Closing mid-drag (Escape is taken by the drag, but a guard or the app may close it) and
  // unmounting both end the drag, so the page never keeps the resize cursor.
  useEffect(() => {
    if (!open) cancelDrag();
  }, [open, cancelDrag]);
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      if (!drag.current) return;
      drag.current = null;
      document.documentElement.style.cursor = "";
      latestRef.current.onResizingChange(false);
    },
    [latestRef],
  );

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !popupRef.current) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    const startWidth = popupRef.current.getBoundingClientRect().width;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth,
      width: startWidth,
      target: event.currentTarget,
    };
    setDraggingState(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (state?.pointerId !== event.pointerId) return;
    // The handle is on the panel's left edge when it is attached on the right, and vice versa.
    const delta = side === "right" ? state.startX - event.clientX : event.clientX - state.startX;
    state.width = fit(state.startWidth + delta);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => onResize(state.width));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (state?.pointerId !== event.pointerId) return;
    drag.current = null;
    cancelAnimationFrame(frame.current);
    setDraggingState(false);
    if (Math.abs(state.width - state.startWidth) >= 1) onCommit(state.width);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (drag.current) {
      // Mid-drag: Escape puts the width back (and doesn't close the drawer); other keys wait.
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        cancelDrag();
      }
      return;
    }
    const measuredNow = popupRef.current?.getBoundingClientRect().width ?? 0;
    const current = measured || measuredNow || min;
    const step = event.shiftKey ? 64 : 16;
    const grow = side === "right" ? "ArrowLeft" : "ArrowRight";
    const shrink = side === "right" ? "ArrowRight" : "ArrowLeft";
    let next: number | null = null;
    if (event.key === grow) next = current + step;
    else if (event.key === shrink) next = current - step;
    else if (event.key === "Home") next = min;
    else if (event.key === "End") next = max;
    if (next === null) return;
    event.preventDefault();
    onCommit(fit(next));
  }

  const now = Math.round(measured ? fit(measured) : min);

  const stepBy = (delta: number) => {
    const live = popupRef.current?.getBoundingClientRect().width ?? 0;
    const base = measured > 0 ? measured : live > 0 ? live : min;
    onCommit(fit(base + delta));
  };
  const stepClass = cn(
    "flex size-7 cursor-pointer items-center justify-center rounded-sheen-full border border-sheen-control-border bg-sheen-surface text-sheen-fg any-pointer-coarse:size-11",
    "transition-[background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover",
    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
  );
  const chevron = (d: string) => (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
  // "Wider" points away from the panel's edge: left when the panel sits on the right.
  const widerPath = side === "right" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  const narrowerPath = side === "right" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6";

  return (
    <>
      {/* A focusable separator with a value is the WAI-ARIA window splitter: an interactive widget. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the focusable, valued separator is the WAI-ARIA window splitter (see above): interactive by design */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={label}
        aria-controls={popupId}
        aria-valuenow={now}
        aria-valuemin={Math.round(min)}
        aria-valuemax={Math.round(max)}
        aria-valuetext={valueText(now)}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- window splitter (see above)
        tabIndex={0}
        data-slot="side-drawer-resize"
        data-base-ui-swipe-ignore=""
        data-dragging={dragging || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        // Capture can also go away without a pointerup (the element moved, the window lost focus).
        onLostPointerCapture={endDrag}
        onKeyDown={handleKeyDown}
        onDoubleClick={() => onCommit(null)}
        className={cn(
          "group/resize peer/resize absolute inset-y-0 z-30 hidden w-3 cursor-col-resize touch-none items-center justify-center outline-none select-none sm:flex",
          "any-pointer-coarse:w-11",
          side === "right" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
        )}
      >
        {/* A line along the edge while hovered, focused or dragged. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-3 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-sheen-accent opacity-0",
            "transition-opacity duration-(--sheen-duration-fast) ease-sheen-out",
            "group-hover/resize:opacity-50 group-focus-visible/resize:opacity-100 group-data-dragging/resize:opacity-100",
            "forced-colors:bg-[Highlight]",
          )}
        />
        {/* The grip. */}
        <span
          aria-hidden
          className={cn(
            "relative h-9 w-1.5 rounded-full bg-sheen-fg-subtle/55 shadow-[0_0_0_1px_var(--sheen-glass-3-bg)]",
            "transition-[background-color,height] duration-(--sheen-duration-fast) ease-sheen-out",
            "group-hover/resize:bg-sheen-fg-muted group-data-dragging/resize:bg-sheen-accent motion-ok:group-data-dragging/resize:h-12",
            "group-focus-visible/resize:outline-2 group-focus-visible/resize:outline-offset-2 group-focus-visible/resize:outline-sheen-focus group-focus-visible/resize:outline-solid",
            "forced-colors:bg-[CanvasText]",
          )}
        />
      </div>
      {/* Single-pointer alternative to dragging (WCAG 2.5.7): step buttons, always shown on coarse pointers and while the
          handle or a button has keyboard focus. Siblings of the separator (its children are presentational). */}
      <div
        data-base-ui-swipe-ignore=""
        className={cn(
          // Never display:none: a focus target that only appears once the handle is focused is not there yet when Tab
          // leaves the handle, so focus would drop to <body>. Transparent and inert until shown, always in the tab order.
          "absolute top-1/2 z-30 flex -translate-y-1/2 flex-col gap-1 max-sm:hidden",
          "pointer-events-none opacity-0 transition-opacity duration-(--sheen-duration-fast) ease-sheen-out",
          "peer-focus-visible/resize:pointer-events-auto peer-focus-visible/resize:opacity-100 has-[:focus-visible]:pointer-events-auto has-[:focus-visible]:opacity-100 any-pointer-coarse:pointer-events-auto any-pointer-coarse:opacity-100",
          side === "right" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
        )}
      >
        <button
          type="button"
          aria-label={widerLabel}
          aria-controls={popupId}
          className={stepClass}
          onClick={() => stepBy(32)}
        >
          {chevron(widerPath)}
        </button>
        <button
          type="button"
          aria-label={narrowerLabel}
          aria-controls={popupId}
          className={stepClass}
          onClick={() => stepBy(-32)}
        >
          {chevron(narrowerPath)}
        </button>
      </div>
    </>
  );
}
