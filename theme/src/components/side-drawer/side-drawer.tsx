"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useResolvedDirection } from "../../hooks/use-direction";
import { useControllable } from "../../hooks/use-controllable";
import { Drawer, DrawerClose, DrawerTrigger, createDrawerHandle } from "../drawer/drawer";

import {
  defaultSideDrawerLabels,
  type SideDrawerNoticeOptions,
  type SideDrawerCloseGuard,
  type SideDrawerChangeDetails,
  type SideDrawerProps,
  type Notice,
  type SideDrawerContextValue,
  SideDrawerContext,
  NoticeContext,
  runGuards,
  useTrackPointerType,
} from "./parts/model";

export {
  type SideDrawerSize,
  sideDrawerSizes,
  type SideDrawerLabels,
  defaultSideDrawerLabels,
  type SideDrawerNoticeOptions,
  type SideDrawerCloseGuard,
  type SideDrawerChangeDetails,
  type SideDrawerProps,
  useSideDrawer,
  useSideDrawerCloseGuard,
  lastInteractionWasTouch,
  firstField,
} from "./parts/model";
export { type SideDrawerContentProps, SideDrawerContent } from "./parts/content";
export {
  type SideDrawerNoticeProps,
  SideDrawerNotice,
  sideDrawerIconButtonClass,
  type SideDrawerCloseButtonProps,
  SideDrawerCloseButton,
  type SideDrawerHeaderProps,
  SideDrawerHeader,
  type SideDrawerTitleProps,
  type SideDrawerDescriptionProps,
  SideDrawerTitle,
  SideDrawerDescription,
} from "./parts/header";
export {
  type SideDrawerBodyProps,
  SideDrawerBody,
  type SideDrawerFooterProps,
  SideDrawerFooter,
  type SideDrawerTriggerProps,
  type SideDrawerCloseProps,
} from "./parts/body";

/* ---------- Root ---------- */

/**
 * SideDrawer: a glass panel that slides in from the inline end of the screen (the right in left-to-right pages, the left in right-to-left ones) to edit a record or show its details without leaving the page. Think Linear's
 * issue peek, Stripe's payment panel, shadcn's Sheet. Use `Drawer` for a bottom sheet or a plain side menu. This is the root: it holds the open state (`open`, `defaultOpen`, `onOpenChange`) and the close guards. Compose
 * `SideDrawerTrigger`, `SideDrawerContent`, `SideDrawerHeader`, `SideDrawerBody`, `SideDrawerFooter`, and `SideDrawerForm` or `SideDrawerDetail` for the two common bodies.
 *
 * Built on SheenUI's Drawer (side="right" / "left"), so it shares its motion and safe areas. The panel floats: inset from the screen edges with a full radius (like an iOS 26 sheet), a lit leading edge, and an accent aura that spills onto
 * the dimmed page (`inset={false}` on `SideDrawerContent` attaches it to the edge). Form fields rise in sequence when it opens:
 * - Sizes: sm 24rem · md 32rem · lg 40rem · xl 48rem, always leaving 3rem of page visible. Under 640px it spans the screen width minus a small margin; swipe it towards its edge to close it.
 * - Sticky header (title, description, leading avatar / icon, actions, ×), a scrolling body with scroll shadows at its edges, and a sticky footer.
 * - `resizable` (on `SideDrawerContent`): a handle on the free edge. Drag it, or focus it (`role="separator"`) and use ← / → (Shift for bigger steps), Home / End for the min / max width; double-click resets. `storageKey` remembers the width (localStorage).
 * - `modal={false}` (inspector): no scrim, no focus trap, the page stays usable, outside clicks don't close it, and Escape closes it only while focus is inside.
 * - Close guards (`useSideDrawerCloseGuard`): every way of closing (×, Escape, scrim, swipe, a Cancel button) asks the guard first, e.g. "Discard unsaved changes?" (see `SideDrawerForm`).
 * - Notices (`useSideDrawer().notify("Saved")`): a check pops in next to the title and the message is announced. For feedback on actions that keep the panel open, where a corner toast would cover the header.
 * - `labels` translates every string; `dir` forces the reading direction.
 *
 * The panel is a size container named `side-drawer`: style its content with `@sm/side-drawer:` ... so it adapts to the panel's width (which the person can change), not the screen's.
 *
 * Keyboard: Enter or Space on the trigger opens it; focus lands on the first field (or the panel itself on touch), Tab is trapped when modal, Escape closes (after the guards), and focus returns to the trigger.
 * Accessibility: `role="dialog"` named by the header title and described by its description; the × has a tooltip and 44px target; the resize handle is a labelled window splitter with a spoken width; notices are announced politely.
 * Glass and motion: the `glass-3` popup itself moves, never a wrapper, so the blur never drops out. Enter springs (`--sheen-ease-smooth`); a button / Escape / scrim close is shorter and eases in with no overshoot; a swipe keeps the finger's
 * momentum. Reduced motion: a fade, no slide.
 *
 * @example
 * ```tsx
 * import { Button, SideDrawer, SideDrawerBody, SideDrawerContent, SideDrawerFooter, SideDrawerHeader, SideDrawerTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawer>
 *       <SideDrawerTrigger render={<Button />}>Edit profile</SideDrawerTrigger>
 *       <SideDrawerContent size="md" resizable storageKey="profile">
 *         <SideDrawerHeader title="Edit profile" description="Visible to your team." />
 *         <SideDrawerBody>...</SideDrawerBody>
 *         <SideDrawerFooter><Button>Save</Button></SideDrawerFooter>
 *       </SideDrawerContent>
 *     </SideDrawer>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  disablePointerDismissal,
  dir: dirProp,
  labels: labelsProp,
  children,
  ...props
}: SideDrawerProps) {
  const dir = useResolvedDirection(dirProp);
  const side = dir === "rtl" ? "left" : "right";
  const [open, setOpenValue] = useControllable(openProp, defaultOpen);
  const labels = useMemo(() => ({ ...defaultSideDrawerLabels, ...labelsProp }), [labelsProp]);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const guards = useRef(new Set<SideDrawerCloseGuard>());
  useTrackPointerType();

  const setOpen = useCallback(
    (next: boolean, details?: SideDrawerChangeDetails) => {
      setOpenValue(next);
      onOpenChange?.(next, details);
    },
    [setOpenValue, onOpenChange],
  );

  const registerGuard = useCallback((guard: SideDrawerCloseGuard) => {
    guards.current.add(guard);
    return () => {
      guards.current.delete(guard);
    };
  }, []);

  const requestClose = useCallback(
    async (options?: { force?: boolean }) => {
      const verdict = options?.force ? true : runGuards([...guards.current]);
      const ok = verdict === true || verdict === false ? verdict : await verdict;
      if (ok) setOpen(false);
      return ok;
    },
    [setOpen],
  );

  /* Notices ("Saved", "Archived"): one at a time, gone after `duration` or when the drawer closes. */
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeCount = useRef(0);
  const notify = useCallback((message: ReactNode | null, options?: SideDrawerNoticeOptions) => {
    if (message === null || message === undefined || message === false) {
      setNotice(null);
      return;
    }
    setNotice({
      id: ++noticeCount.current,
      message,
      announce: options?.announce ?? message,
      duration: options?.duration ?? 2600,
    });
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(
      () => setNotice((current) => (current?.id === notice.id ? null : current)),
      notice.duration,
    );
    return () => window.clearTimeout(timer);
  }, [notice]);
  const [noticeOpen, setNoticeOpen] = useState(open);
  if (noticeOpen !== open) {
    setNoticeOpen(open);
    if (!open) setNotice(null);
  }

  function handleOpenChange(next: boolean, details: SideDrawerChangeDetails) {
    if (next) {
      setOpen(true, details);
      return;
    }
    // Escape in the middle of a resize drag cancels the drag (the handle restores the width), not the drawer.
    if (details.reason === "escape-key" && popupRef.current?.hasAttribute("data-resizing")) {
      details.cancel();
      return;
    }
    // Inspector (non-modal): Escape closes it only while focus is inside the panel, so Escape in
    // a field on the page (clearing a search, closing a menu) never takes the panel away.
    if (modal === false && details.reason === "escape-key" && !popupRef.current?.contains(document.activeElement)) {
      details.cancel();
      return;
    }
    const verdict = runGuards([...guards.current]);
    if (verdict === true) {
      setOpen(false, details);
      return;
    }
    // Keep it open (a swipe springs back); close later if the guard says yes.
    details.cancel();
    if (verdict !== false) void verdict.then((ok) => ok && setOpen(false));
  }

  const context = useMemo<SideDrawerContextValue>(
    () => ({ open, side, dir, modal, labels, popupRef, requestClose, registerGuard, notify }),
    [open, side, dir, modal, labels, requestClose, registerGuard, notify],
  );

  return (
    <SideDrawerContext value={context}>
      <NoticeContext value={notice}>
        <Drawer
          side={side}
          open={open}
          onOpenChange={handleOpenChange}
          modal={modal}
          // An inspector sits beside the page you are working in: clicking the page must not close it.
          disablePointerDismissal={disablePointerDismissal ?? modal === false}
          labels={{ close: labels.close }}
          {...props}
        >
          {children}
        </Drawer>
      </NoticeContext>
    </SideDrawerContext>
  );
}

/**
 * The element that opens a `SideDrawer` (a `<button>` by default; use `render={<Button />}` for a SheenUI button). Pass a `handle` from `createSideDrawerHandle()` for a trigger outside `<SideDrawer>`.
 *
 * Keyboard: Enter or Space opens the drawer. Accessibility: `aria-haspopup="dialog"` and `aria-expanded`. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { Button, SideDrawerTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawerTrigger render={<Button variant="glass" />}>Details</SideDrawerTrigger>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export const SideDrawerTrigger = DrawerTrigger;
/**
 * Closes the drawer (through the close guards). Use `render` to make it a Button, for example a Cancel button in `SideDrawerFooter`.
 *
 * Keyboard: Enter or Space closes it (after the guards) and focus returns to the trigger. Accessibility: a native button, so give it visible text or an `aria-label`. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { Button, SideDrawerClose, SideDrawerFooter } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawerFooter>
 *       <SideDrawerClose render={<Button variant="ghost" />}>Cancel</SideDrawerClose>
 *     </SideDrawerFooter>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export const SideDrawerClose = DrawerClose;
/** Connects a SideDrawer to triggers rendered elsewhere: `<SideDrawer handle={h}>` + `<SideDrawerTrigger handle={h}>`. */
export const createSideDrawerHandle: typeof createDrawerHandle = createDrawerHandle;
