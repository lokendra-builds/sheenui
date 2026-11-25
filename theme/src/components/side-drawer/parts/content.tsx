"use client";

import { createContext, useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";

import { cn, classNameWith } from "../../../lib/cn";
import { StateLightLayer } from "../../../lib/state-light";
import { DrawerContent, type DrawerContentProps } from "../../drawer/drawer";
import { useMergedRef } from "../../../lib/form";
import { type SideDrawerSize, sideDrawerSizes, firstField, useSideDrawerContext } from "./model";
import { ResizeHandle } from "./resize";
import { NoticeAnnouncer } from "./header";

/* ---------- Content (the panel) ---------- */

/** Scroll position of the body, shared with the header / footer for their edge shadows. */
export type ScrollState = { atTop: boolean; atBottom: boolean };
/** The scroll state of a body that does not scroll. @internal */
export const SCROLL_REST: ScrollState = { atTop: true, atBottom: true };
/** Shares the body scroll state with the header and footer. @internal */
export const ScrollContext = createContext<{ scroll: ScrollState; setScroll: (state: ScrollState) => void }>({
  scroll: SCROLL_REST,
  setScroll: () => undefined,
});

/**
 * Props of `SideDrawerContent`: the props of `DrawerContent` minus the ones it sets itself, plus its
 * own options.
 */
export type SideDrawerContentProps = Omit<DrawerContentProps, "showClose" | "handle" | "keyboardAware" | "inset"> & {
  /**
   * Float the panel off the screen edges with a full radius, a lit leading edge and an accent aura spilling onto the
   * page (like an iOS 26 sheet). `false` attaches it flush to the edge (the old look). Default true.
   */
  inset?: boolean;
  /**
   * Lights the panel while a `SideDrawerForm` inside it saves (accent glow) or has saved or failed (green, red): a lit
   * edge and a light pool on the glass's own layer (`data-state` on the panel). The seal and the lit leading edge stay.
   * @default true
   */
  stateLight?: boolean;
  /** Width: sm 24rem · md 32rem · lg 40rem · xl 48rem. Full width under 640px. Default "md". */
  size?: SideDrawerSize;
  /** A handle on the free edge to drag (or arrow-key) the width. Hidden under 640px. Default false. */
  resizable?: boolean;
  /** Starting width in px when resizable (instead of `size`). */
  defaultWidth?: number;
  /** Sets the narrowest width in px when resizing. Default 320. */
  minWidth?: number;
  /** Widest width in px when resizing (never more than the screen minus 3rem). */
  maxWidth?: number;
  /** Remember the resized width under this key (localStorage, per browser). */
  storageKey?: string;
  /** Called when a resize ends (pointer up, a key press, a reset). `null` = back to `size`. */
  onWidthChange?: (width: number | null) => void;
  /**
   * Publish the panel's width as `--sheen-side-drawer-right` (or `-left`) on `<html>` while it is open, so fixed
   * UI in that corner (a toast stack) can move out of its way. Off by default: an inherited custom property on
   * the root element restyles the whole document on every open and close (200 to 290 ms on a 4x-throttled phone
   * for a 3,500-element page), and nothing in SheenUI reads it. Default false.
   */
  publishEdge?: boolean;
};

/** The prefix of the key that stores a resized width. @internal */
export const STORAGE_PREFIX = "sheen:side-drawer:";

/** Reads a stored drawer width, or null. @internal */
export function readStoredWidth(key: string | undefined): number | null {
  if (!key || typeof window === "undefined") return null;
  try {
    const value = Number(window.localStorage.getItem(STORAGE_PREFIX + key));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

/** Stores a drawer width, or clears it with null. @internal */
export function writeStoredWidth(key: string | undefined, width: number | null) {
  if (!key) return;
  try {
    if (width === null) window.localStorage.removeItem(STORAGE_PREFIX + key);
    else window.localStorage.setItem(STORAGE_PREFIX + key, String(Math.round(width)));
  } catch {
    /* storage blocked (private mode): the width just isn't remembered */
  }
}

/**
 * Dims the panel while a dialog (e.g. "Discard unsaved changes?") is open on top of it. Base UI
 * nests such dialogs in the drawer's portal and skips their backdrop, so the panel steps back
 * itself. A layer over the panel (opacity on the layer only): nothing glass is faded.
 */
export function NestedDialogDim() {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const root = ref.current?.closest("[data-base-ui-portal]");
    if (!root) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      setVisible(
        Boolean(
          root.querySelector(
            ":is([role='alertdialog'], [role='dialog']):not([data-slot='side-drawer'], [data-ending-style])",
          ),
        ),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-ending-style"],
    });
    check();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
  return (
    <span
      ref={ref}
      aria-hidden
      data-visible={visible || undefined}
      className={cn(
        "pointer-events-none absolute inset-0 z-40 rounded-[inherit] bg-[var(--sheen-scrim,var(--sheen-shadow-far))] opacity-0",
        "transition-opacity duration-(--sheen-duration-base) ease-sheen-out data-visible:opacity-100 forced-colors:hidden",
      )}
    />
  );
}

/**
 * The lit leading edge of a floating panel: a thin accent line along the edge facing the page, with a soft aura
 * spilling outwards. Decorative (a layer over the panel, `pointer-events-none`); `forced-colors` hides it.
 * @internal
 */
export function LitEdge({ side }: { side: "left" | "right" }) {
  const edge = cn(
    "pointer-events-none absolute inset-y-8 z-30 w-0.5 rounded-full forced-colors:hidden",
    side === "right" ? "-start-px" : "-end-px",
  );
  return (
    <>
      <span
        aria-hidden
        data-slot="side-drawer-lit-edge-success"
        className={cn(
          edge,
          "[background-image:linear-gradient(to_bottom,transparent,var(--sheen-success-glow)_30%,var(--sheen-success-glow)_70%,transparent)]",
          "[box-shadow:0_0_36px_10px_var(--sheen-success-glow)] opacity-0 transition-opacity duration-(--sheen-duration-base)",
          "[[data-slot=side-drawer]:has([data-slot=side-drawer-seal])_&]:opacity-100",
        )}
      />
      <span
        aria-hidden
        data-slot="side-drawer-lit-edge"
        className={cn(
          "pointer-events-none absolute inset-y-8 z-30 w-0.5 rounded-full forced-colors:hidden",
          side === "right" ? "-start-px" : "-end-px",
          "[background-image:linear-gradient(to_bottom,transparent,var(--sheen-accent-glow)_30%,var(--sheen-accent-glow)_70%,transparent)]",
          "[box-shadow:0_0_28px_6px_var(--sheen-accent-glow)]",
        )}
      />
    </>
  );
}

/*
 * Opt-in (`publishEdge`). While open, tells fixed UI in the panel's corner how much of the screen edge it covers:
 * --sheen-side-drawer-right (or -left) on <html>, in px. A toast stack can add it to its offset
 * (from 640px up, where the panel isn't full width) to stay clear of the panel's header.
 * Rendered inside the popup, so it runs once the popup is actually in the page. Setting and removing an
 * inherited custom property on <html> restyles the whole document, which is why it is not on by default.
 */
/** Publishes the open drawer's edge as a custom property on the document, so the page can react to it. @internal */
export function EdgePublisher({ open, side }: { open: boolean; side: "left" | "right" }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const popup = ref.current?.closest<HTMLElement>("[data-slot='side-drawer']");
    if (!open || !popup) return;
    const root = document.documentElement;
    const name = `--sheen-side-drawer-${side}`;
    // offsetWidth ignores the slide-in transform.
    const publish = () => root.style.setProperty(name, `${popup.offsetWidth}px`);
    publish();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(publish);
    observer?.observe(popup);
    return () => {
      observer?.disconnect();
      root.style.removeProperty(name);
    };
  }, [open, side]);
  return <span ref={ref} hidden />;
}

/**
 * The glass panel of a `SideDrawer`, portalled to the end of the body. `size` sets the width (sm 24rem to xl 48rem, full width under 640px); `resizable` adds a drag/arrow-key handle on the free edge, with `defaultWidth`, `minWidth` (320),
 * `maxWidth`, `storageKey` (remembers the width in localStorage) and `onWidthChange`; `inset` (default true) floats the panel off the edge with a lit leading edge, `false` attaches it; `initialFocus` overrides where focus goes on open.
 * Every other `DrawerContent` prop passes through.
 *
 * By default focus goes to an element marked `data-autofocus`, else (keyboard / mouse) the first field of a `SideDrawerForm`, else the panel itself so screen readers read its title. On touch screens a field is never focused on open:
 * the on-screen keyboard would cover the panel. With `publishEdge` it also publishes its width as `--sheen-side-drawer-right` / `-left` on the root element, so the page can make room for a non-modal panel.
 *
 * Keyboard: see `SideDrawer`; the resize handle takes ← / → (Shift: bigger steps), Home / End, double-click to reset, and Escape cancels a drag. Accessibility: `role="dialog"`; the resize handle is a labelled `separator` with `aria-valuenow`.
 * Glass and motion: `glass-3` panel sliding from its edge; see `SideDrawer`.
 *
 * @example
 * ```tsx
 * import { SideDrawerContent, SideDrawerHeader } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawerContent size="lg" resizable storageKey="order-details">
 *       <SideDrawerHeader title="Order #1042" />
 *     </SideDrawerContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerContent({
  size = "md",
  resizable = false,
  defaultWidth,
  minWidth = 320,
  maxWidth,
  storageKey,
  onWidthChange,
  publishEdge = false,
  inset = true,
  stateLight = true,
  initialFocus,
  className,
  viewportClassName,
  backdropClassName,
  style,
  children,
  ref,
  ...props
}: SideDrawerContentProps) {
  const { open, side, labels, popupRef } = useSideDrawerContext("SideDrawerContent");
  const mergedPopupRef = useMergedRef(popupRef, ref);
  const [width, setWidth] = useState<number | null>(() => readStoredWidth(storageKey) ?? defaultWidth ?? null);
  /** The width before a drag started, restored when the drag is cancelled (Escape). */
  const widthBeforeDrag = useRef<number | null>(null);
  // Another size or storage key starts from that key's remembered width (or the size's own).
  const [widthSource, setWidthSource] = useState(`${size}|${storageKey ?? ""}`);
  if (widthSource !== `${size}|${storageKey ?? ""}`) {
    setWidthSource(`${size}|${storageKey ?? ""}`);
    setWidth(readStoredWidth(storageKey) ?? defaultWidth ?? null);
  }
  const [scroll, setScroll] = useState<ScrollState>(SCROLL_REST);
  const scrollContext = useMemo(() => ({ scroll, setScroll }), [scroll]);
  const [resizing, setResizing] = useState(false);
  const popupId = useId();

  /*
   * Where focus goes on open: an element marked data-autofocus, else (keyboard / mouse) the first
   * field of a SideDrawerForm, else the panel itself so screen readers read its title. On touch
   * screens a field is never focused on open: the on-screen keyboard would cover the panel.
   */
  const defaultInitialFocus = useCallback(
    (openType: string) => {
      const popup = popupRef.current;
      if (!popup) return true;
      const marked = popup.querySelector<HTMLElement>("[data-autofocus]");
      if (marked) return marked;
      if (openType !== "touch") {
        const field = firstField(popup.querySelector("[data-side-drawer-form]"));
        if (field) return field;
      }
      return popup;
    },
    [popupRef],
  );

  const commitWidth = useCallback(
    (next: number | null) => {
      setWidth(next);
      writeStoredWidth(storageKey, next);
      onWidthChange?.(next);
    },
    [storageKey, onWidthChange],
  );

  const widthVar = { "--sd-width": width === null ? `${sideDrawerSizes[size]}rem` : `${width}px` } as CSSProperties;

  return (
    <ScrollContext value={scrollContext}>
      <DrawerContent
        ref={mergedPopupRef}
        id={popupId}
        showClose={false}
        handle={false}
        keyboardAware={false}
        inset={inset}
        viewportClassName={cn(
          // A little more air around the floating panel from 640px up (the base margin is 0.5rem, safe areas included).
          inset &&
            "sm:[--sheen-drawer-inset-top:max(0.75rem,env(safe-area-inset-top))] sm:[--sheen-drawer-inset-right:max(0.75rem,env(safe-area-inset-right))] sm:[--sheen-drawer-inset-bottom:max(0.75rem,env(safe-area-inset-bottom))] sm:[--sheen-drawer-inset-left:max(0.75rem,env(safe-area-inset-left))]",
          viewportClassName,
        )}
        backdropClassName={cn(
          // The page recedes on this layer only (never a wrapper of the page: that would flatten its glass), and the
          // panel's accent light spills over it from the panel's edge.
          "[background-image:radial-gradient(ellipse_60%_75%_at_var(--sd-aura-x)_50%,color-mix(in_oklab,var(--sheen-accent-glow)_38%,transparent),transparent_70%)]",
          side === "right" ? "[--sd-aura-x:100%]" : "[--sd-aura-x:0%]",
          backdropClassName,
        )}
        initialFocus={initialFocus ?? defaultInitialFocus}
        data-slot="side-drawer"
        data-resizing={resizing || undefined}
        style={typeof style === "function" ? (state) => ({ ...widthVar, ...style(state) }) : { ...widthVar, ...style }}
        className={classNameWith(className, (extra) =>
          cn(
            "@container/side-drawer w-full sm:w-[min(var(--sd-width),calc(100vw-3rem))]",
            side === "right" ? "ml-auto" : "mr-auto",
            !inset && [
              "max-sm:rounded-none max-sm:border-x-0",
              // Full width, the free edge touches the screen too: keep clear of a landscape notch.
              side === "right" ? "max-sm:pl-[env(safe-area-inset-left)]" : "max-sm:pr-[env(safe-area-inset-right)]",
            ],
            "data-resizing:select-none",
            extra,
          ),
        )}
        {...props}
      >
        {children}
        {inset && <LitEdge side={side} />}
        {stateLight && (
          <StateLightLayer className="[--sl-aura:0.5] [--sl-edge:0.7] [--sl-pool:0.7] [--sl-strength:0.8]" />
        )}
        <NoticeAnnouncer />
        {publishEdge && <EdgePublisher open={open} side={side} />}
        <NestedDialogDim />
        {resizable && (
          <ResizeHandle
            open={open}
            side={side}
            label={labels.resize}
            valueText={labels.resizeValue}
            widerLabel={labels.resizeWider}
            narrowerLabel={labels.resizeNarrower}
            popupRef={popupRef}
            popupId={popupId}
            minWidth={minWidth}
            maxWidth={maxWidth}
            onResize={setWidth}
            onCommit={commitWidth}
            onCancel={() => setWidth(widthBeforeDrag.current)}
            onResizingChange={(next) => {
              if (next) widthBeforeDrag.current = width;
              setResizing(next);
            }}
          />
        )}
      </DrawerContent>
    </ScrollContext>
  );
}
