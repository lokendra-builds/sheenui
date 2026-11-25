"use client";

import { useRef, type ComponentProps, type ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";

import { cn, classNameWith } from "../lib/cn";
import { useMergedRef } from "../lib/form";
import { modalSurfaceRef } from "../lib/modal-flag";
import { StateLightLayer } from "../lib/state-light";
import { dialogMotion } from "../lib/popup-motion";
import {
  SheetHandle,
  useSheetActionsRef,
  SheetActionsProvider,
  SheetProvider,
  sheetPopupClass,
  useIsSheet,
  useSheetMode,
  type MobilePresentation,
} from "../drawer/parts/sheet";

/**
 * Glass dialog: a modal window that blocks the page until the person answers or dismisses it. This
 * is the root: it holds the open state (`open`, `defaultOpen`, `onOpenChange`) and renders no element.
 * Compose it with `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`,
 * `DialogFooter` and `DialogClose`. For a "are you sure?" that must be answered use `AlertDialog`;
 * for a panel beside the page use `Drawer`.
 *
 * Keyboard: Enter or Space on the trigger opens it; focus moves to the first control inside, Tab and
 * Shift+Tab stay inside, Escape closes, and focus returns to the trigger.
 * Accessibility: `role="dialog"` with `aria-modal`, named by `DialogTitle` and described by `DialogDescription`;
 * the page behind is inert and scroll is locked. Always render a title.
 * Glass and motion: the animations are pure CSS driven by Base UI's `data-starting-style` and
 * `data-ending-style`, and they animate the glass popup itself (never a wrapper), so the blur never
 * flickers. Enter is a fade plus spring scale; exit is shorter, ease-in, no overshoot. Reduced motion fades only.
 *
 * On a phone-width screen (`max-width: 640px`) `mobile="sheet"` presents the window as a bottom sheet instead: full width,
 * a drag handle you can swipe down to dismiss (Escape and the × still work), height capped at 85 dvh with the content
 * scrolling inside, padded past the home indicator. Reduced motion fades it in place. The default `"popup"` keeps the
 * centred window everywhere.
 *
 * @example
 * ```tsx
 * import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger render={<Button>Edit profile</Button>} />
 *       <DialogContent>
 *         <DialogHeader>
 *           <DialogTitle>Edit profile</DialogTitle>
 *           <DialogDescription>Changes are saved when you press Save.</DialogDescription>
 *         </DialogHeader>
 *         <DialogFooter>
 *           <Button>Save</Button>
 *         </DialogFooter>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * ```
 *
 * @see /components/dialog
 */
export function Dialog<Payload = unknown>({ mobile = "popup", ...props }: DialogProps<Payload>) {
  const sheet = useSheetMode(mobile);
  const actionsRef = useSheetActionsRef(props.actionsRef);
  return (
    <SheetProvider value={sheet}>
      <SheetActionsProvider value={actionsRef}>
        <BaseDialog.Root {...props} actionsRef={actionsRef} />
      </SheetActionsProvider>
    </SheetProvider>
  );
}
/**
 * The element that opens a `Dialog`. By default a `<button>`; pass `render={<Button />}` to use a SheenUI button.
 *
 * Keyboard: Enter or Space opens the dialog. Accessibility: gets `aria-haspopup="dialog"` and `aria-expanded`
 * automatically. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { Button, DialogTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DialogTrigger render={<Button variant="glass">Open</Button>} />
 *   );
 * }
 * ```
 *
 * @see /components/dialog
 */
export const DialogTrigger = BaseDialog.Trigger;
/**
 * A button inside the dialog that closes it (a "Cancel" or "Done" action in `DialogFooter`).
 *
 * Keyboard: Enter or Space closes the dialog and focus returns to the trigger. Accessibility: a normal
 * `<button>`, so give it visible text. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { Button, DialogClose, DialogFooter } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DialogFooter>
 *       <DialogClose render={<Button variant="ghost">Cancel</Button>} />
 *     </DialogFooter>
 *   );
 * }
 * ```
 *
 * @see /components/dialog
 */
export const DialogClose = BaseDialog.Close;

/** Every user-facing string of `DialogContent`. */
export type DialogLabels = {
  /** Accessible name of the × button. */
  close: string;
};

/** English defaults of `DialogLabels`. */
export const defaultDialogLabels: DialogLabels = { close: "Close" };

/**
 * Props of `DialogContent`: the Base UI `Dialog.Popup` props plus SheenUI's own options, each
 * documented on its field.
 */
export type DialogContentProps = ComponentProps<typeof BaseDialog.Popup> & {
  /** Show the × button in the top-right corner. Default true. */
  showClose?: boolean;
  /** Translate the × button: `{ close: "Schließen" }`. Default `{ close: "Close" }`. */
  labels?: Partial<DialogLabels>;
  /**
   * Lights the open window with a soft accent glow: a lit edge and a light pool on the glass's own layer
   * (`data-state="on"`; set `data-state` to `"working"`, `"success"`, `"warning"` or `"error"` to change it). Off with
   * reduced transparency and forced colours. The window scrolls, so its outer aura is clipped: the glow reads inside the edge.
   * @default false
   */
  stateLight?: boolean;
  /**
   * Where the window is portalled. Pass an element to keep it inside a region (a stage, a preview) instead of the end of the body.
   * @default the end of document.body
   */
  container?: ComponentProps<typeof BaseDialog.Portal>["container"];
  /**
   * Render the dimmed scrim behind the window. Turn it off for a non-modal dialog (`modal={false}` on `Dialog`), where the page stays usable.
   * @default true
   */
  backdrop?: boolean;
  /** The dialog body: usually `DialogHeader`, your content and `DialogFooter`. */
  children?: ReactNode;
};

/**
 * The glass window of a `Dialog`, portalled to the end of the body with a dimmed scrim behind it.
 * It is centred, at most 28rem wide and never taller than the viewport (it scrolls inside).
 *
 * - `container` portals it into an element instead of the body; `backdrop={false}` drops the scrim (for `Dialog modal={false}`).
 * - `showClose` toggles the × button in the corner (default on). Turn it off only when the footer has an
 *   obvious close action.
 * - Every other prop goes to the Base UI popup (`className`, `initialFocus`, `finalFocus`, ...).
 *
 * Keyboard: focus lands on the first control inside; Escape or a click on the scrim closes it.
 * Accessibility: label it with `DialogTitle`; the × button has `aria-label="Close"` and a 44px hit area on touch.
 * Glass and motion: `glass-3` (the most opaque level, as it sits over content); reduced transparency and
 * forced colors give it a solid surface. Fade plus spring scale in, quicker out; reduced motion fades only.
 *
 * @example
 * ```tsx
 * import { DialogContent, DialogTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DialogContent showClose={false} className="max-w-lg">
 *       <DialogTitle>Delete project</DialogTitle>
 *     </DialogContent>
 *   );
 * }
 * ```
 *
 * @see /components/dialog
 */
export function DialogContent({
  className,
  children,
  showClose = true,
  labels,
  stateLight = false,
  container,
  backdrop = true,
  ref,
  ...props
}: DialogContentProps) {
  const sheet = useIsSheet();
  const ownRef = useRef<HTMLDivElement>(null);
  // While the popup is in the DOM, <html> carries data-modal-open: styles/glass.css stops the page's own blur behind it.
  const popupRef = useMergedRef(ref, modalSurfaceRef, ownRef);
  return (
    <BaseDialog.Portal container={container}>
      {backdrop && (
        <BaseDialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 min-h-dvh bg-sheen-scrim",
            "transition-opacity duration-(--sheen-duration-base) ease-sheen-out motion-reduced:duration-(--sheen-duration-fast)",
            "data-starting-style:opacity-0",
            "data-ending-style:opacity-0 data-ending-style:duration-(--sheen-duration-exit) data-ending-style:ease-sheen-exit",
          )}
        />
      )}
      <BaseDialog.Popup
        ref={popupRef}
        data-slot="dialog-content"
        aria-modal="true"
        data-state={stateLight ? "on" : undefined}
        className={classNameWith(className, (extra) =>
          cn(
            sheet
              ? cn(
                  sheetPopupClass,
                  "glass-3 fixed inset-x-0 top-auto bottom-0 left-0 z-50 flex translate-none flex-col gap-5 pt-3 [--sheen-sheet-pb:1.5rem] [--sheen-sheet-px:1.5rem]",
                )
              : cn(
                  "glass-3 fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto overscroll-contain rounded-sheen-xl p-6",
                  "outline-none",
                  dialogMotion,
                ),
            extra,
          ),
        )}
        {...props}
      >
        {stateLight && <StateLightLayer className="[--sl-edge:0.7] [--sl-pool:0.6] [--sl-strength:0.65]" />}
        {/* One sweep of light across the glass as it opens (motion.css "Micro-interaction layer"). */}
        <span aria-hidden data-slot="sheen-sweep" className="sheen-sweep">
          <i />
        </span>
        {sheet && (
          <SheetHandle popupRef={ownRef} label={labels?.close ?? defaultDialogLabels.close} redundant={showClose} />
        )}
        {children}
        {showClose && (
          <BaseDialog.Close
            data-sheen-close=""
            aria-label={labels?.close ?? defaultDialogLabels.close}
            className={cn(
              "absolute top-4 end-4 flex size-8 items-center justify-center rounded-sheen-full text-sheen-fg-muted",
              "transition-[color,background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
              // 44×44 invisible hit area on touch screens.
              "sheen-hit",
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
          </BaseDialog.Close>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

/**
 * Layout wrapper for `DialogTitle` and `DialogDescription`. It leaves room on the right for the × button.
 *
 * Keyboard: none. Accessibility: a plain `div`, no role. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { DialogDescription, DialogHeader, DialogTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DialogHeader>
 *       <DialogTitle>Invite people</DialogTitle>
 *       <DialogDescription>They will get an email.</DialogDescription>
 *     </DialogHeader>
 *   );
 * }
 * ```
 *
 * @see /components/dialog
 */
export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5 pe-8", className)} {...props} />;
}

/**
 * The dialog's heading. It is the dialog's accessible name (`aria-labelledby` is wired for you) and renders an `<h2>`.
 *
 * Keyboard: none. Accessibility: always render one, even if you hide it visually with `className="sr-only"`.
 * Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { DialogTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DialogTitle>Delete project</DialogTitle>
 *   );
 * }
 * ```
 *
 * @see /components/dialog
 */
export function DialogTitle({ className, ...props }: ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={classNameWith(className, (extra) => cn("text-lg leading-tight font-semibold tracking-tight", extra))}
      {...props}
    />
  );
}

/**
 * Muted helper text under the title. It is the dialog's accessible description (`aria-describedby` is wired for you) and renders a `<p>`.
 *
 * Keyboard: none. Accessibility: keep it to one or two sentences. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { DialogDescription } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DialogDescription>This cannot be undone.</DialogDescription>
 *   );
 * }
 * ```
 *
 * @see /components/dialog
 */
export function DialogDescription({ className, ...props }: ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={classNameWith(className, (extra) => cn("text-sm text-sheen-fg-muted", extra))}
      {...props}
    />
  );
}

/**
 * Layout wrapper for the dialog's actions: a column on phones (primary action last in the DOM, so it is
 * first on screen) and a right-aligned row from `sm` up.
 *
 * Keyboard: none. Accessibility: a plain `div`; the buttons inside are normal tab stops. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { Button, DialogClose, DialogFooter } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DialogFooter>
 *       <DialogClose render={<Button variant="ghost">Cancel</Button>} />
 *       <Button>Save</Button>
 *     </DialogFooter>
 *   );
 * }
 * ```
 *
 * @see /components/dialog
 */
export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

/** Props of {@link Dialog}. Glass dialog: a modal window that blocks the page until the person answers or dismisses it. */
export type DialogProps<Payload = unknown> = BaseDialog.Root.Props<Payload> & {
  /**
   * How the window opens on a phone-width screen (`max-width: 640px`): `"popup"` is the usual centred window;
   * `"sheet"` is a bottom sheet with a drag handle, swipe-down to dismiss, a scrollable body capped at 85 dvh and
   * home-indicator padding. Focus is trapped and returned and Escape closes in both.
   *
   * @default "popup"
   */
  mobile?: MobilePresentation;
};

/** Props of {@link DialogTrigger}. The element that opens a `Dialog`. */
export type DialogTriggerProps = ComponentProps<typeof DialogTrigger>;

/** Props of {@link DialogClose}. A button inside the dialog that closes it (a "Cancel" or "Done" action in `DialogFooter`). */
export type DialogCloseProps = ComponentProps<typeof DialogClose>;

/** Props of {@link DialogHeader}. Layout wrapper for `DialogTitle` and `DialogDescription`. */
export type DialogHeaderProps = ComponentProps<typeof DialogHeader>;

/** Props of {@link DialogTitle}. The dialog's heading. */
export type DialogTitleProps = ComponentProps<typeof DialogTitle>;

/** Props of {@link DialogDescription}. Muted helper text under the title. */
export type DialogDescriptionProps = ComponentProps<typeof DialogDescription>;

/** Props of {@link DialogFooter}. Layout wrapper for the dialog's actions: a column on phones (primary action last in the DOM, so it is first on screen) and a right-aligned row from `sm` up. */
export type DialogFooterProps = ComponentProps<typeof DialogFooter>;
