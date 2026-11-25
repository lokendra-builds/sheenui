"use client";

import { createContext, useContext, useRef, type ComponentProps, type KeyboardEvent } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn, classNameWith } from "../../lib/cn";
import { popupMotion } from "../../lib/popup-motion";
import { useMergedRef } from "../../lib/form";
import {
  SheetHandle,
  useSheetActionsRef,
  SheetActionsProvider,
  SheetProvider,
  sheetBackdropClass,
  sheetPopupClass,
  sheetPositionerClass,
  useIsSheet,
  useSheetMode,
  type MobilePresentation,
} from "../drawer/parts/sheet";

const TABBABLE =
  'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/** Whether the popover is modal, so its popup says `aria-modal`. */
const ModalContext = createContext(false);

/**
 * Glass popover: a small floating panel anchored to a button, for extra controls or details that
 * do not deserve a full dialog. This is the root: it holds the open state (`open`,
 * `defaultOpen`, `onOpenChange`) and renders no element. Compose it with `PopoverTrigger`,
 * `PopoverContent`, `PopoverTitle`, `PopoverDescription` and `PopoverClose`.
 *
 * Keyboard: Enter or Space on the trigger opens it; focus moves into the panel, Tab cycles inside
 * it, Escape closes and returns focus to the trigger.
 * Accessibility: the panel is a `dialog` labelled by `PopoverTitle` and described by `PopoverDescription`.
 * Glass and motion: `glass-2` surface. Enter is a fade plus spring scale from the trigger side, exit is
 * shorter with no overshoot; reduced motion fades only.
 *
 * On a phone-width screen (`max-width: 640px`) `mobile="sheet"` presents the panel as a bottom sheet: full width, a drag
 * handle with swipe-down to dismiss, height capped at 85 dvh with the content scrolling inside, home-indicator padding, a
 * dimmed scrim and a focus trap (the sheet is modal unless you set `modal`). The default `"popup"` keeps the anchored panel.
 *
 * @example
 * ```tsx
 * import { Button, Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Popover>
 *       <PopoverTrigger render={<Button variant="glass">Details</Button>} />
 *       <PopoverContent>
 *         <PopoverTitle>Billing</PopoverTitle>
 *         <PopoverDescription>Next invoice on 1 Dec.</PopoverDescription>
 *       </PopoverContent>
 *     </Popover>
 *   );
 * }
 * ```
 *
 * @see /components/popover
 */
export function Popover<Payload = unknown>({ mobile = "popup", modal, ...props }: PopoverProps<Payload>) {
  const sheet = useSheetMode(mobile);
  const actionsRef = useSheetActionsRef(props.actionsRef);
  const resolvedModal = modal ?? (sheet ? true : undefined);
  return (
    <SheetProvider value={sheet}>
      <SheetActionsProvider value={actionsRef}>
        <ModalContext value={resolvedModal === true || resolvedModal === "trap-focus"}>
          <BasePopover.Root modal={resolvedModal} {...props} actionsRef={actionsRef} />
        </ModalContext>
      </SheetActionsProvider>
    </SheetProvider>
  );
}

/**
 * The element that opens a `Popover`. By default it renders a `<button>`; pass `render={<Button />}`
 * to use a SheenUI button instead.
 *
 * Keyboard: Enter or Space toggles the popover. Accessibility: gets `aria-expanded` and
 * `aria-controls` automatically. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { Popover, PopoverContent, PopoverTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Popover>
 *       <PopoverTrigger>Open</PopoverTrigger>
 *       <PopoverContent>Hello</PopoverContent>
 *     </Popover>
 *   );
 * }
 * ```
 *
 * @see /components/popover
 */
export const PopoverTrigger = BasePopover.Trigger;

/**
 * A button inside `PopoverContent` that closes the popover (for "Done" or "Cancel" actions).
 *
 * Keyboard: Enter or Space closes it and focus returns to the trigger. Accessibility: a normal
 * `<button>`, so give it visible text or an `aria-label`. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { PopoverClose, PopoverContent } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PopoverContent>
 *       <PopoverClose>Done</PopoverClose>
 *     </PopoverContent>
 *   );
 * }
 * ```
 *
 * @see /components/popover
 */
export const PopoverClose = BasePopover.Close;

/** Every user-facing string of `PopoverContent`. */
export type PopoverLabels = {
  /** Accessible name of the sheet's handle, which closes the sheet (`mobile="sheet"`). */
  close: string;
};

/** English defaults of `PopoverLabels`. */
export const defaultPopoverLabels: PopoverLabels = { close: "Close" };

/**
 * Props of `PopoverContent`: the Base UI `Popover.Popup` props plus SheenUI's own options, each
 * documented on its field.
 */
export type PopoverContentProps = ComponentProps<typeof BasePopover.Popup> & {
  /** Spoken text. Merged over {@link defaultPopoverLabels}. */
  labels?: Partial<PopoverLabels>;
  /** Preferred side of the trigger. It flips when there is no room. Default "bottom". */
  side?: "top" | "bottom" | "left" | "right";
  /** Sets the alignment along that side. Default "center". */
  align?: "start" | "center" | "end";
  /** Gap between trigger and panel, in px. Default 8. */
  sideOffset?: number;
};

/**
 * The glass panel of a `Popover`, portalled to the end of the body and positioned next to the
 * trigger. Put the title, description and your controls inside.
 *
 * - `side`, `align` and `sideOffset` place it; everything else is passed to the Base UI popup
 *   (`className`, `id`, `initialFocus`, `finalFocus`, ...).
 * - It is `w-72` and never wider than the viewport minus 2rem; override with `className`.
 *
 * Keyboard: focus moves into the panel on open; Escape or an outside press closes it.
 * Accessibility: `role="dialog"`; label it with `PopoverTitle` (or `aria-label`).
 * Glass and motion: `glass-2` surface with a spring-scale enter and a short exit; reduced motion
 * fades only, reduced transparency and forced colors give it a solid surface.
 *
 * @example
 * ```tsx
 * import { PopoverContent, PopoverDescription, PopoverTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PopoverContent side="top" align="start">
 *       <PopoverTitle>Share</PopoverTitle>
 *       <PopoverDescription>Anyone with the link can view.</PopoverDescription>
 *     </PopoverContent>
 *   );
 * }
 * ```
 *
 * @see /components/popover
 */
export function PopoverContent({
  className,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  labels,
  ref,
  children,
  ...props
}: PopoverContentProps) {
  const sheet = useIsSheet();
  const modal = useContext(ModalContext);
  const ownRef = useRef<HTMLDivElement>(null);
  const popupRef = useMergedRef(ref, ownRef);
  // Base UI's popover hands Tab on to the page after the trigger once the last control is passed. A modal popover (a sheet
  // always is) holds Tab inside instead, like a dialog.
  const trapTab = (event: KeyboardEvent<HTMLDivElement>) => {
    (props.onKeyDown as ((e: KeyboardEvent<HTMLDivElement>) => void) | undefined)?.(event);
    if (!modal || event.key !== "Tab" || event.defaultPrevented) return;
    const popup = event.currentTarget;
    const tabbables = Array.from(popup.querySelectorAll<HTMLElement>(TABBABLE)).filter(
      (el) => !el.closest("[inert]") && el.getClientRects().length > 0,
    );
    const first = tabbables[0];
    const last = tabbables.at(-1);
    if (!first || !last) {
      event.preventDefault();
      popup.focus();
      return;
    }
    const at = document.activeElement;
    if (event.shiftKey && (at === first || at === popup)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && at === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return (
    <BasePopover.Portal>
      {sheet && <BasePopover.Backdrop className={sheetBackdropClass} />}
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={16}
        className={cn("z-50", sheet && sheetPositionerClass)}
      >
        <BasePopover.Popup
          ref={popupRef}
          data-slot="popover-content"
          data-sheet={sheet ? "" : undefined}
          aria-modal={modal ? true : undefined}
          className={classNameWith(className, (extra) =>
            cn(
              sheet
                ? cn("glass-2 pt-4 [--sheen-sheet-pb:1rem] [--sheen-sheet-px:1rem]", sheetPopupClass)
                : cn(
                    "glass-2 w-72 max-w-[calc(100vw-2rem)] origin-(--transform-origin) rounded-sheen-lg p-4 outline-none",
                    popupMotion,
                  ),
              extra,
            ),
          )}
          {...props}
          onKeyDown={trapTab}
        >
          {sheet && <SheetHandle popupRef={ownRef} label={labels?.close ?? defaultPopoverLabels.close} />}
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

/**
 * The popover's heading. It names the dialog for assistive tech (`aria-labelledby` is wired for you).
 *
 * Keyboard: none. Accessibility: renders an `<h2>`; keep it short. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { PopoverTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PopoverTitle>Notifications</PopoverTitle>
 *   );
 * }
 * ```
 *
 * @see /components/popover
 */
export function PopoverTitle({ className, ...props }: ComponentProps<typeof BasePopover.Title>) {
  return (
    <BasePopover.Title className={classNameWith(className, (extra) => cn("text-sm font-semibold", extra))} {...props} />
  );
}

/**
 * Muted helper text under the title. It describes the dialog for assistive tech (`aria-describedby`
 * is wired for you).
 *
 * Keyboard: none. Accessibility: renders a `<p>`. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { PopoverDescription } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PopoverDescription>You have 3 unread messages.</PopoverDescription>
 *   );
 * }
 * ```
 *
 * @see /components/popover
 */
export function PopoverDescription({ className, ...props }: ComponentProps<typeof BasePopover.Description>) {
  return (
    <BasePopover.Description
      className={classNameWith(className, (extra) => cn("mt-1 text-sm text-sheen-fg-muted", extra))}
      {...props}
    />
  );
}

/** Props of {@link Popover}. Glass popover: a small floating panel anchored to a button, for extra controls or details that do not deserve a full dialog. */
export type PopoverProps<Payload = unknown> = Omit<BasePopover.Root.Props<Payload>, "modal"> & {
  /** Traps focus and locks scroll while open (Base UI's `modal`). A sheet is modal unless you set this. @default false (a sheet: true) */
  modal?: boolean | "trap-focus";
  /**
   * How the panel opens on a phone-width screen (`max-width: 640px`): `"popup"` is the usual panel next to the trigger;
   * `"sheet"` is a bottom sheet with a drag handle, swipe-down to dismiss, a scrollable body capped at 85 dvh and
   * home-indicator padding. Escape closes and focus returns to the trigger in both.
   *
   * @default "popup"
   */
  mobile?: MobilePresentation;
};

/** Props of {@link PopoverTrigger}. The element that opens a `Popover`. */
export type PopoverTriggerProps = ComponentProps<typeof PopoverTrigger>;

/** Props of {@link PopoverClose}. A button inside `PopoverContent` that closes the popover (for "Done" or "Cancel" actions). */
export type PopoverCloseProps = ComponentProps<typeof PopoverClose>;

/** Props of {@link PopoverTitle}. The popover's heading. */
export type PopoverTitleProps = ComponentProps<typeof PopoverTitle>;

/** Props of {@link PopoverDescription}. Muted helper text under the title. */
export type PopoverDescriptionProps = ComponentProps<typeof PopoverDescription>;
