"use client";

import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { uid } from "../../lib/uid";

/* ---------- Media queries ---------- */

/** The shared media-query hooks (see `hooks/use-media-query.ts`), re-exported for the chat modules. */
export { PHONE_QUERY, useMediaQuery, useCoarsePointer } from "../../hooks/use-media-query";

/* ---------- A shared clock for relative times ---------- */

/*
 * One interval for every component that shows "5m" or "Last seen 2m ago", however many there
 * are: it starts with the first subscriber and stops after the last one leaves.
 */
let now = typeof Date === "undefined" ? 0 : Date.now();
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | undefined;

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (!clockTimer) {
    now = Date.now();
    clockTimer = setInterval(() => {
      now = Date.now();
      clockListeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

/**
 * The current time, refreshed every 30 seconds (relative times like "5m" stay right).
 * Pass `fixed` to freeze it (tests, screenshots, server rendering).
 *
 * Accessibility: No UI of its own. One shared interval serves every subscriber and stops after the last one leaves.
 *
 * @internal
 * @example
 * ```tsx
 * import { useNow } from "./hooks";
 *
 * export function Clock({ fixed }: { fixed?: Date }) {
 *   const now = useNow(fixed);
 *   return <time dateTime={now.toISOString()}>{now.toLocaleTimeString("en-US")}</time>;
 * }
 * ```
 *
 * @see /chat/list
 */
export function useNow(fixed?: Date): Date {
  const value = useSyncExternalStore(
    subscribeClock,
    () => now,
    () => now,
  );
  const fixedTime = fixed?.getTime();
  return useMemo(() => new Date(fixedTime ?? value), [fixedTime, value]);
}

/* ---------- Live announcements ---------- */

/**
 * One polite live region per component. `announce(text)` clears it first, so the same words
 * are read again when repeated. The region stays mounted (a region that mounts together with
 * its text is often not read). Returns `[announce, node]`: call `announce(text)` to speak, and
 * render `node` once.
 *
 * Accessibility: Renders a visually hidden `role="status"` polite live region; repeated text is read again because the region is cleared first.
 *
 * @internal
 * @example
 * ```tsx
 * import { useAnnouncer } from "./hooks";
 *
 * export function Saved() {
 *   const [announce, region] = useAnnouncer();
 *   return (
 *     <>
 *       <button type="button" onClick={() => announce("Draft saved")}>Save</button>
 *       {region}
 *     </>
 *   );
 * }
 * ```
 *
 * @see /chat/thread
 */
export function useAnnouncer(): [(text: string) => void, ReactNode] {
  const [message, setMessage] = useState("");
  const frame = useRef(0);
  const announce = useCallback((text: string) => {
    setMessage("");
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setMessage(text));
  }, []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const node = createElement(
    "div",
    { role: "status", "aria-live": "polite", "aria-atomic": true, className: "sr-only" },
    message,
  );
  return [announce, node];
}

/* ---------- Visual viewport (on-screen keyboard) ---------- */

/** The visible part of the screen: its `height` and how far it is scrolled from the top (`offsetTop`), in px. */
export type VisualViewportBox = { height: number; offsetTop: number };

/**
 * The visible part of the screen while the on-screen keyboard is up (iOS keeps the layout
 * viewport full height and slides the keyboard over it). A full-screen sheet sized to this
 * keeps its composer just above the keyboard. Null when unsupported or disabled.
 *
 * Accessibility: No UI of its own; it keeps the focused composer visible for people using the on-screen keyboard.
 *
 * @internal
 * @example
 * ```tsx
 * import { useVisualViewport } from "./hooks";
 *
 * export function Sheet() {
 *   const box = useVisualViewport(true);
 *   return <div style={box ? { height: box.height } : undefined}>Composer sits above the keyboard</div>;
 * }
 * ```
 *
 * @see /chat/widget
 */
export function useVisualViewport(enabled: boolean): VisualViewportBox | null {
  const [box, setBox] = useState<VisualViewportBox | null>(null);
  useEffect(() => {
    const vv = typeof window === "undefined" ? undefined : window.visualViewport;
    if (!enabled || !vv) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setBox((prev) =>
          prev && Math.abs(prev.height - vv.height) < 1 && Math.abs(prev.offsetTop - vv.offsetTop) < 1
            ? prev
            : { height: vv.height, offsetTop: vv.offsetTop },
        );
      });
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      // Disabled (or unmounted): forget the last box, so re-enabling starts from null again.
      setBox(null);
    };
  }, [enabled]);
  return enabled ? box : null;
}

/* ---------- Modal isolation (a full-screen sheet) ---------- */

/**
 * While `enabled`, the rest of the page is out of reach: every element outside `ref`'s element
 * (its siblings, and its ancestors' siblings, up to <body>) gets `inert` (no focus, no clicks,
 * hidden from screen readers) and the page stops scrolling. Popups opened from inside later
 * (menus, the emoji picker, the photo viewer) are added after this runs, so they stay usable.
 * Attributes that were already there are left alone and everything is restored on cleanup.
 *
 * Keyboard: With the rest of the page inert, Tab cannot leave the sheet.
 * Accessibility: Hides everything outside the sheet from screen readers and blocks page scroll while enabled; restores both on close.
 *
 * @internal
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useModalIsolation } from "./hooks";
 *
 * export function FullScreenSheet({ open }: { open: boolean }) {
 *   const ref = useRef<HTMLDivElement>(null);
 *   useModalIsolation(ref, open);
 *   return <div ref={ref}>Sheet</div>;
 * }
 * ```
 *
 * @see /chat/widget
 */
export function useModalIsolation(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const changed: Element[] = [];
    for (let node: Element = el; node.parentElement && node !== document.body; node = node.parentElement) {
      for (const sibling of Array.from(node.parentElement.children)) {
        if (
          sibling === node ||
          sibling.hasAttribute("inert") ||
          sibling.localName === "script" ||
          sibling.localName === "style" ||
          sibling.localName === "link"
        )
          continue;
        sibling.setAttribute("inert", "");
        changed.push(sibling);
      }
    }
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      for (const node of changed) node.removeAttribute("inert");
      root.style.overflow = overflow;
    };
  }, [ref, enabled]);
}

/* ---------- On-screen keyboard over a fixed-height box ---------- */

/**
 * How far the on-screen keyboard covers the bottom of `ref`'s element (0 when it doesn't).
 * iOS Safari (and Chrome's default "resizes-visual" mode) keeps the layout viewport full height
 * and slides the keyboard over it, so a full-height chat would have its composer hidden. Pad the
 * bottom by this much to keep the composer just above the keyboard. Only the part of the box
 * under the keyboard counts (a box that merely runs past the screen's bottom doesn't).
 * Updates on visualViewport resize / scroll, at most once per frame, only when it changes.
 *
 * Accessibility: No UI of its own; keeps the composer above the on-screen keyboard.
 *
 * @internal
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useKeyboardInset } from "./hooks";
 *
 * export function Panel() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const inset = useKeyboardInset(ref, true);
 *   return <div ref={ref} style={{ paddingBottom: inset }}>Chat</div>;
 * }
 * ```
 *
 * @see /chat/thread
 */
export function useKeyboardInset(ref: RefObject<HTMLElement | null>, enabled: boolean): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = typeof window === "undefined" ? undefined : window.visualViewport;
    const el = ref.current;
    if (!enabled || !vv || !el) {
      setInset(0);
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const visibleBottom = vv.offsetTop + vv.height;
        const keyboard = Math.max(0, window.innerHeight - visibleBottom);
        const overlap = Math.max(0, el.getBoundingClientRect().bottom - visibleBottom);
        const next = Math.round(Math.min(keyboard, overlap));
        setInset((prev) => (Math.abs(prev - next) < 2 ? prev : next));
      });
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [ref, enabled]);
  return inset;
}

/* ---------- Long-press context menus that stay open ---------- */

/**
 * Base UI opens a context menu after a 500ms long-press, and from 500ms after opening it lets
 * an outside click close it. A finger held for a second or more therefore closes the menu it
 * just opened: the mouse events that follow touchend land outside the popup (its backdrop or
 * <body>). While the menu is open, this swallows the ones that follow a long touch. Spread the returned
 * handlers on the ContextMenuTrigger; `isOpen` reads the menu's state (a ref, not a render).
 *
 * Accessibility: No UI of its own; it only stops a held touch from closing the menu it just opened.
 *
 * @internal
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useLongPressMenuGuard } from "./hooks";
 *
 * export function Bubble() {
 *   const open = useRef(false);
 *   const guard = useLongPressMenuGuard(() => open.current);
 *   return <div {...guard}>Message</div>;
 * }
 * ```
 *
 * @see /chat/thread
 */
export function useLongPressMenuGuard(isOpen: () => boolean) {
  const start = useRef(0);
  const release = useRef<(() => void) | null>(null);
  useEffect(() => () => release.current?.(), []);
  return useMemo(
    () => ({
      onTouchStartCapture: () => {
        start.current = performance.now();
      },
      onTouchEndCapture: () => {
        if (performance.now() - start.current < 450 || !isOpen()) return;
        release.current?.();
        // The mouse events a browser makes up after a touch (mousedown, mouseup, click) land on the
        // menu's backdrop or <body>: each would count as a press outside.
        const types = ["mousedown", "mouseup", "click"] as const;
        const swallow = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.type === "click") done();
        };
        const timer = window.setTimeout(() => done(), 700);
        function done() {
          for (const type of types) window.removeEventListener(type, swallow, true);
          window.clearTimeout(timer);
          release.current = null;
        }
        for (const type of types) window.addEventListener(type, swallow, true);
        release.current = done;
      },
    }),
    [isOpen],
  );
}

/* ---------- Ids ---------- */

/** A unique id for client-created things (attachments, optimistic messages): `uid` with the chat's default prefix. */
export function chatUid(prefix = "chat") {
  return uid(prefix);
}
