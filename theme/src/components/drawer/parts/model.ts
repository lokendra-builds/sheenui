"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";

/* ---------- Types ---------- */

/** Edge a `Drawer` slides in from (physical: `left` and `right` never flip). */
export type DrawerSide = "bottom" | "top" | "left" | "right";
/** What the `side` prop accepts: a physical {@link DrawerSide}, or the logical `start` / `end`, which resolve against the text direction (`start` is the left edge in `ltr`, the right edge in `rtl`). */
export type DrawerSideProp = DrawerSide | "start" | "end";

/** Named snap heights for bottom sheets. */
export type DrawerSnapPreset = "peek" | "half" | "full";

/**
 * A snap height: a preset name, a fraction of the viewport height (0–1), a pixel number (> 1),
 * or a "px" / "rem" string such as "240px" or "18rem".
 */
export type DrawerSnapPoint = DrawerSnapPreset | number | (string & {});

/**
 * Every user-facing string of `Drawer` (accessible names, announcements, placeholders); pass a partial
 * `labels` prop to translate or reword them. Entries that need a count or a name are functions.
 */
export type DrawerLabels = {
  /** The × button. */
  close: string;
  /** Drag handle, when a taller snap point is available. */
  expand: string;
  /** Drag handle, at the tallest snap point. */
  collapse: string;
  /** Names of the preset heights: read out by the handle, and announced when it changes height. */
  snapPoints: Record<DrawerSnapPreset, string>;
  /** Name of a custom height (a number or "px" / "rem" snap point), 1-based from the smallest. */
  customSnapPoint: (position: number, count: number) => string;
  /** Read after the current height on the handle: how to change it. */
  handleHint: string;
};

/**
 * What `labels` accepts: any string, and any of the snap point names.
 *
 * @defaultLabels defaultDrawerLabels
 */
export type DrawerLabelsInput = Partial<Omit<DrawerLabels, "snapPoints">> & {
  snapPoints?: Partial<DrawerLabels["snapPoints"]>;
};

/**
 * Default English strings of `DrawerLabels`; spread it and override single keys to reword. Plain data
 * with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React Server
 * Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultDrawerLabels: DrawerLabels = {
  close: "Close",
  expand: "Expand sheet",
  collapse: "Collapse sheet",
  snapPoints: { peek: "Peek height", half: "Half height", full: "Full height" },
  customSnapPoint: (position, count) => `Height ${position} of ${count}`,
  handleHint: "Arrow keys change the height.",
};

/**
 * Starting values of the presets. Once the sheet is open, "peek" is measured from the content
 * (handle + header + first row of DrawerBody) and "half" is kept at least a row taller than peek.
 *
 * @see /overlays/drawer
 */
export const drawerSnapPresets: Record<DrawerSnapPreset, number | string> = {
  peek: "10rem",
  half: 0.5,
  full: 1,
};

/** The props of the underlying Base UI drawer root. @internal */
export type BaseRootProps = BaseDrawer.Root.Props;

/** Props of `Drawer`; each option is documented on its field. */
export type DrawerProps = Omit<
  BaseRootProps,
  "swipeDirection" | "snapPoints" | "snapPoint" | "defaultSnapPoint" | "onSnapPointChange"
> & {
  /**
   * The edge the drawer slides in from. It is also the direction a swipe dismisses it. Default "bottom". `"left"` and
   * `"right"` are physical and never flip; `"start"` and `"end"` follow the text direction (`<html dir>` or Base UI's
   * `DirectionProvider`): `"start"` is the left edge in `ltr` and the right edge in `rtl`.
   */
  side?: DrawerSideProp;
  /** Snap heights for a bottom sheet, smallest first. Ignored on other sides. */
  snapPoints?: readonly DrawerSnapPoint[];
  /** Controlled snap point (use with `onSnapPointChange`). */
  snapPoint?: DrawerSnapPoint | null;
  /** Snap point the sheet opens at. Defaults to the first one. */
  defaultSnapPoint?: DrawerSnapPoint | null;
  /**
   * Called when the snap point changes: by a drag (with Base UI's event details), or by the
   * handle button / keyboard / focus (no event details).
   */
  onSnapPointChange?: (
    snapPoint: DrawerSnapPoint | null,
    eventDetails?: BaseDrawer.Root.SnapPointChangeEventDetails,
  ) => void;
  /** Override any UI string (i18n). */
  labels?: DrawerLabelsInput;
};

/* ---------- Snap point helpers ---------- */

/** "half" stays at least this much taller than "peek" (about one list row). */
export const HALF_ABOVE_PEEK = 72;
/** The tallest a "first row" may be when measuring "peek". */
export const PEEK_ROW_MAX = 88;
/** Base UI keeps a sheet this far below the top of the screen at full height (--sheen-drawer-gap). */
export const FULL_GAP = 24;

/** The snap presets resolved to numbers or CSS lengths. @internal */
export type ResolvedPresets = Record<DrawerSnapPreset, number | string>;

/** True when a snap point is a named preset. @internal */
export function isPreset(value: DrawerSnapPoint): value is DrawerSnapPreset {
  return value === "peek" || value === "half" || value === "full";
}

/** Converts a snap point to the value Base UI expects. @internal */
export function toBaseSnapPoint(value: DrawerSnapPoint, presets: ResolvedPresets): number | string {
  return isPreset(value) ? presets[value] : value;
}

/** The root font size in pixels, for converting rem snap points. @internal */
export function rootFontSize() {
  if (typeof document === "undefined") return 16;
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/** Height in px a Base UI snap value stands for (same rules as Base UI). */
export function toPx(value: number | string, viewport: number): number {
  if (typeof value === "number") return value <= 1 ? Math.max(0, value) * viewport : value;
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return 0;
  return value.trim().endsWith("rem") ? amount * rootFontSize() : amount;
}

/** The layout viewport height, kept current (snap heights are relative to it). */
export function useViewportHeight(enabled: boolean) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const measure = () => setHeight(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [enabled]);
  return height;
}

/* ---------- Context ---------- */

/** The state the drawer parts share. @internal */
export type DrawerContextValue = {
  side: DrawerSide;
  modal: BaseRootProps["modal"];
  labels: DrawerLabels;
  /** Snap points of a bottom sheet, smallest first, one per distinct height (empty otherwise). */
  orderedSnapPoints: DrawerSnapPoint[];
  /** Index of the current snap point in orderedSnapPoints (nearest height when not listed). */
  snapIndex: number;
  snapPoint: DrawerSnapPoint | null;
  setSnapPoint: (value: DrawerSnapPoint) => void;
  /** DrawerContent reports the measured "peek" height here. */
  setPeekHeight: (px: number) => void;
};

/** Shares the drawer state with its parts. @internal */
export const DrawerContext = createContext<DrawerContextValue | null>(null);

/** Reads the drawer context, throwing when used outside a drawer. @internal */
export function useDrawerContext(component: string) {
  const context = useContext(DrawerContext);
  if (!context) throw new Error(`SheenUI: <${component}> must be used inside <Drawer>.`);
  return context;
}

/** The swipe direction that dismisses a drawer on each side. @internal */
export const swipeDirections = { bottom: "down", top: "up", left: "left", right: "right" } as const;
