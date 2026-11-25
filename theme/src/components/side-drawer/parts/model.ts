"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode, type RefObject } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";

import { useLatest } from "../../../hooks/use-latest";
import { type DrawerProps } from "../../drawer/drawer";

/* ---------- Types ---------- */

/** Panel width presets of `SideDrawer` (`sm` 24, `md` 32, `lg` 40, `xl` 48 rem). */
export type SideDrawerSize = "sm" | "md" | "lg" | "xl";

/** Width of each size, in rem. */
export const sideDrawerSizes: Record<SideDrawerSize, number> = { sm: 24, md: 32, lg: 40, xl: 48 };

/**
 * Every user-facing string of `SideDrawer` (accessible names, announcements, placeholders); pass a
 * partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type SideDrawerLabels = {
  /** The × button (and its tooltip). */
  close: string;
  /** Key cap for the Escape key in the × tooltip ("Esc", "Échap"…). */
  escapeKey: string;
  /** The resize handle. */
  resize: string;
  /** Spoken value of the resize handle. */
  resizeValue: (width: number) => string;
  /** Step button that makes the panel wider (the non-drag alternative to the handle, WCAG 2.5.7). */
  resizeWider: string;
  /** Step button that makes the panel narrower. */
  resizeNarrower: string;
};

/**
 * Default English strings of `SideDrawerLabels`; spread it and override single keys to reword. Plain
 * data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React
 * Server Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultSideDrawerLabels: SideDrawerLabels = {
  close: "Close",
  escapeKey: "Esc",
  resize: "Resize panel",
  resizeValue: (width) => `${Math.round(width)} pixels wide`,
  resizeWider: "Make panel wider",
  resizeNarrower: "Make panel narrower",
};

/** Options for `useSideDrawer().notify()`. */
export type SideDrawerNoticeOptions = {
  /** What screen readers hear (defaults to the message), e.g. "Order #1042 archived". */
  announce?: ReactNode;
  /** How long the notice stays, in ms. */
  duration?: number;
};

/** One in-drawer notice: message, announcement and duration. @internal */
export type Notice = { id: number; message: ReactNode; announce: ReactNode; duration: number };

/**
 * Asked before the drawer closes. Return true to allow it, false to keep it open, or a promise
 * (e.g. the answer of a confirmation dialog). It runs for every way of closing.
 */
export type SideDrawerCloseGuard = () => boolean | Promise<boolean>;

/**
 * The details Base UI passes when a `SideDrawer` opens or closes: the reason, the event and a way to
 * cancel.
 */
export type SideDrawerChangeDetails = BaseDrawer.Root.ChangeEventDetails;

/** Props of `SideDrawer`; each option is documented on its field. */
export type SideDrawerProps = Omit<
  DrawerProps,
  "side" | "snapPoints" | "snapPoint" | "defaultSnapPoint" | "onSnapPointChange" | "labels" | "onOpenChange"
> & {
  /**
   * Called when the drawer opens or closes. `details` is Base UI's event details; it is
   * undefined when a close guard settled later (e.g. after "Discard?") or `requestClose` closed it.
   */
  onOpenChange?: (open: boolean, details?: SideDrawerChangeDetails) => void;
  /** Reading direction: the panel slides from the inline end (right in "ltr", left in "rtl"). Defaults to Base UI's DirectionProvider, then the page's `dir`. */
  dir?: "ltr" | "rtl";
  /** Any UI string (i18n). */
  labels?: Partial<SideDrawerLabels>;
};

/** The state the side drawer parts share. @internal */
export type SideDrawerContextValue = {
  open: boolean;
  /** The physical edge the panel is attached to. */
  side: "left" | "right";
  dir: "ltr" | "rtl";
  modal: SideDrawerProps["modal"];
  labels: SideDrawerLabels;
  popupRef: RefObject<HTMLDivElement | null>;
  /** Close, asking the close guards first (unless `force`). Resolves true when it closed. */
  requestClose: (options?: { force?: boolean }) => Promise<boolean>;
  registerGuard: (guard: SideDrawerCloseGuard) => () => void;
  /** Show a short confirmation next to the header's title (null clears it). */
  notify: (message: ReactNode | null, options?: SideDrawerNoticeOptions) => void;
};

/** Shares the side drawer state with its parts. @internal */
export const SideDrawerContext = createContext<SideDrawerContextValue | null>(null);
/** Kept apart from the main context so a notice only re-renders the header and the live region. */
export const NoticeContext = createContext<Notice | null>(null);

/** Reads the side drawer context, throwing when used outside a side drawer. @internal */
export function useSideDrawerContext(component: string) {
  const context = useContext(SideDrawerContext);
  if (!context) throw new Error(`SheenUI: <${component}> must be used inside <SideDrawer>.`);
  return context;
}

/**
 * The surrounding SideDrawer: `open`, `requestClose()` (runs the close guards), `side`, `dir`, `modal` and `notify(message)`. Returns null outside a SideDrawer.
 *
 * `notify("Archived", { announce: "Order #1042 archived" })` shows a check and the message next to the header's title for a moment, and says `announce` politely. Use it instead of a toast for actions that
 * keep the drawer open: a corner toast would sit on top of the panel's header.
 *
 * @returns The drawer's state and actions, or null when called outside a `SideDrawer`.
 *
 * Accessibility: `notify` writes into a polite live region that lives in the panel, so it works with a modal drawer too.
 *
 * @example
 * ```tsx
 * import { Button, useSideDrawer } from "@sheenui/theme";
 *
 * function ArchiveButton() {
 *   const drawer = useSideDrawer();
 *   return <Button onClick={() => drawer?.notify("Archived", { announce: "Order #1042 archived" })}>Archive</Button>;
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function useSideDrawer() {
  const context = useContext(SideDrawerContext);
  return useMemo(
    () =>
      context
        ? {
            open: context.open,
            side: context.side,
            dir: context.dir,
            modal: context.modal,
            requestClose: context.requestClose,
            notify: context.notify,
          }
        : null,
    [context],
  );
}

/**
 * Ask before the drawer closes. Pass a function returning true (close), false (stay) or a promise of either; pass false / null to turn the guard off. Every way of closing asks the guard first: the ×, Escape,
 * the scrim, a swipe and any `SideDrawerClose` button.
 *
 * Accessibility: when the guard keeps the drawer open, focus stays where it is; show your own confirmation (a dialog) so the person knows why.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { useSideDrawerCloseGuard } from "@sheenui/theme";
 *
 * export function Example() {
 *   const [dirty, setDirty] = useState(false);
 *   useSideDrawerCloseGuard(() => (dirty ? confirm("Discard changes?") : true));
 *   return <input aria-label="Name" onChange={() => setDirty(true)} />;
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function useSideDrawerCloseGuard(guard: SideDrawerCloseGuard | false | null | undefined) {
  const context = useContext(SideDrawerContext);
  const latestRef = useLatest(guard);
  const register = context?.registerGuard;
  useEffect(() => {
    if (!register) return;
    return register(() => (latestRef.current ? latestRef.current() : true));
  }, [register, latestRef]);
}

/** Runs guards one after another; stays synchronous until one of them answers with a promise. */
export function runGuards(guards: SideDrawerCloseGuard[]): boolean | Promise<boolean> {
  for (const [i, guard] of guards.entries()) {
    const verdict = guard();
    if (verdict === false) return false;
    if (verdict !== true) return verdict.then((ok) => (ok ? runGuards(guards.slice(i + 1)) : false));
  }
  return true;
}

/* ---------- Direction ---------- */

/* ---------- Last input: touch or not (keeps the on-screen keyboard shut on touch opens) ---------- */

let lastPointerType = "";
let pointerListeners = 0;
/** Records that the last input was a pointer. @internal */
export const notePointer = (event: globalThis.PointerEvent) => {
  lastPointerType = event.pointerType;
};
/** Records that the last input was the keyboard. @internal */
export const noteKey = () => {
  lastPointerType = "keyboard";
};

/** Tracks whether the last input was a pointer or the keyboard, once for the document. @internal */
export function useTrackPointerType() {
  useEffect(() => {
    if (pointerListeners++ === 0) {
      document.addEventListener("pointerdown", notePointer, true);
      document.addEventListener("keydown", noteKey, true);
    }
    return () => {
      if (--pointerListeners === 0) {
        document.removeEventListener("pointerdown", notePointer, true);
        document.removeEventListener("keydown", noteKey, true);
      }
    };
  }, []);
}

/** True when the last interaction was a finger on a touch screen. */
export function lastInteractionWasTouch() {
  return lastPointerType === "touch";
}

/** The first editable field inside `root`, skipping hidden / disabled / non-tabbable ones. */
export function firstField(root: ParentNode | null | undefined): HTMLElement | null {
  return (
    root?.querySelector<HTMLElement>(
      ":is(input, textarea, select, [role='combobox'], [contenteditable='true']):not([type='hidden'], :disabled, [aria-hidden='true'], [tabindex='-1'], [readonly])",
    ) ?? null
  );
}
