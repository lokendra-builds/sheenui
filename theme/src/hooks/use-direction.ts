"use client";

import { useSyncExternalStore, type RefObject } from "react";
import { useDirection } from "@base-ui/react/direction-provider";

type Direction = "ltr" | "rtl";

/**
 * ONE MutationObserver for every component that follows the text direction. Flipping `dir` at runtime, on the root or
 * on any ancestor, mirrors a layout without resizing it, so no ResizeObserver fires: this is the cue. Listeners are
 * the components' own (coalesced) read functions; the observer exists only while someone listens.
 *
 * @internal Subscribe from an effect or `useSyncExternalStore`; it returns the unsubscribe function.
 * @example
 * ```tsx
 * import { useEffect, useState } from "react";
 * import { watchDirection } from "./use-direction";
 *
 * export function DirectionLabel() {
 *   const [dir, setDir] = useState(() => document.documentElement.dir || "ltr");
 *   useEffect(() => watchDirection(() => setDir(document.documentElement.dir || "ltr")), []);
 *   return <span>{dir}</span>;
 * }
 * ```
 *
 * @see /components
 */
export function watchDirection(listener: () => void) {
  directionListeners.add(listener);
  if (!directionObserver && typeof MutationObserver !== "undefined") {
    directionObserver = new MutationObserver(() => directionListeners.forEach((fn) => fn()));
    directionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"], subtree: true });
  }
  return () => {
    directionListeners.delete(listener);
    if (directionListeners.size === 0) {
      directionObserver?.disconnect();
      directionObserver = null;
    }
  };
}
const directionListeners = new Set<() => void>();
let directionObserver: MutationObserver | null = null;

/** The direction in force at `element`: its nearest `dir` ancestor (itself included), `ltr` when there is none. */
function directionAt(element: Element | null): Direction {
  const node = element ? element.closest("[dir]") : document.documentElement;
  return (node ?? document.documentElement).getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}

/**
 * Event-time direction read for key handlers: is `element` laid out right-to-left right now? One computed-style read, no
 * ref and no subscription, so a runtime `dir` flip is seen on the next key press. Prefer `useResolvedDirection` for
 * anything that renders differently per direction.
 *
 * @internal Arrow-key handlers that swap Left/Right in right-to-left text.
 * @example
 * ```tsx
 * import { isRtlAt } from "./use-direction";
 *
 * export function Stepper() {
 *   return (
 *     <div
 *       role="group"
 *       aria-label="Steps"
 *       onKeyDown={(event) => {
 *         const forward = isRtlAt(event.currentTarget) ? "ArrowLeft" : "ArrowRight";
 *         if (event.key === forward) event.preventDefault();
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @see /components
 */
export function isRtlAt(element: Element): boolean {
  return getComputedStyle(element).direction === "rtl";
}

/**
 * The ONE place a component learns the text direction (for logical sides, mirrored scroll maths, a mirrored pill).
 * Order: the `direction` prop if given, then Base UI's `DirectionProvider` (`rtl`), then the nearest `dir` ancestor of
 * `ref`'s element, else `<html dir>`. Live: a runtime `dir` flip re-renders the caller (single shared observer), and
 * it is `ltr` on the server. Pass `ref` for anything rendered inside the page (a calendar, a tab list, a chart); leave
 * it out for portalled surfaces (Drawer, Toaster), which sit under `<body>` and follow the provider or `<html dir>`.
 * Key handlers call `isRtlAt(event.currentTarget)` at event time instead: no ref, no subscription.
 *
 * @internal Used by every component that mirrors itself in right-to-left text.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useResolvedDirection } from "./use-direction";
 *
 * export function Edge() {
 *   const ref = useRef<HTMLSpanElement>(null);
 *   const left = useResolvedDirection(undefined, ref) === "ltr";
 *   return <span ref={ref}>{left ? "start is the left edge" : "start is the right edge"}</span>;
 * }
 * ```
 *
 * @see /components
 */
export function useResolvedDirection(prop?: Direction, ref?: RefObject<Element | null>): Direction {
  const provided = useDirection();
  const found = useSyncExternalStore(
    watchDirection,
    () => directionAt(ref?.current ?? null),
    () => "ltr" as const,
  );
  return prop ?? (provided === "rtl" ? "rtl" : found);
}
