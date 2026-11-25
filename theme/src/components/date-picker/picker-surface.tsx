"use client";

import { CloseIcon } from "../status-icons/icons";
export { CloseIcon };
import {
  cloneElement,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { Drawer } from "@base-ui/react/drawer";
import { Popover } from "@base-ui/react/popover";

import { cn } from "../../lib/cn";
import { popupMotion } from "../../lib/popup-motion";
export { useMediaQuery } from "../../hooks/use-media-query";

/** Media query under which the date pickers swap their popover for a bottom sheet (just under Tailwind's `sm`). */
export { PHONE_QUERY } from "../../hooks/use-media-query";

/**
 * When the pickers open as a bottom sheet: a phone-width viewport, or a touch screen turned sideways (under 500px
 * high). A popover has no room there (it shrank to ~130px with a nested scroll); the sheet takes the screen's height
 * and scrolls as one area.
 */
export const PICKER_SHEET_QUERY = "(max-width: 639.98px), (max-height: 500px) and (any-pointer: coarse)";

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/**
 * The viewport width in CSS pixels (Infinity during server rendering). It re-renders on window resize, so
 * use it only where CSS cannot decide (for example choosing how many calendar months fit).
 *
 * @returns The current `window.innerWidth`.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useViewportWidth } from "./picker-surface";
 *
 * export function Example() {
 *   const months = useViewportWidth() >= 720 ? 2 : 1;
 * }
 * ```
 *
 * @see /forms/date-picker
 */
export function useViewportWidth() {
  return useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth,
    () => Infinity,
  );
}

type SideOffset = number | ((data: { side: string }) => number);

/** Props of `PickerSurface`; each option is documented on its field. */
export type PickerSurfaceProps = {
  /** True renders the bottom sheet; false the popover. Usually `useMediaQuery(PICKER_SHEET_QUERY)`. */
  phone: boolean;
  /** Whether the panel is open (controlled). */
  open: boolean;
  /** Called when the panel wants to open or close (Escape, outside click, swipe down). */
  onOpenChange: (open: boolean) => void;
  /** The field button. Base UI adds aria-expanded, aria-haspopup and the click handler; Arrow Down also opens it. */
  trigger: ReactElement<{ onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void }>;
  /** `id` placed on the trigger, so a label can point at it. */
  triggerId?: string;
  /** Sheet heading (phones) and the popover's accessible name. */
  title: string;
  /** Accessible name of the close button (sheet) and of the hidden close control (popover). */
  closeLabel: string;
  /** The panel's content (a calendar, a colour area, ...). */
  children: ReactNode;
  /** Extra classes for the popover panel (not the sheet). */
  popupClassName?: string;
  /** Element the popover lines up with (defaults to the trigger). */
  anchor?: RefObject<Element | null>;
  /** Gap between the field and the popover in px, or a function of the resolved side. Default 8. */
  sideOffset?: SideOffset;
  /** Keep Tab inside the popover, like the WAI-ARIA date picker dialog. Outside clicks still close it. */
  trapFocus?: boolean;
  /** What gets focus on open (the first match inside the panel), else the first focusable. */
  initialFocusSelector?: string;
};

/**
 * PickerSurface: where a picker field opens its panel (shared by DatePicker, DateRangePicker and
 * ColorField; internal, not exported from the package).
 *
 * - From 640px up (and taller than 500px on touch): a glass popover under the field. It never falls back to the field's side, and when
 *   neither above nor below has room it scrolls inside itself.
 * - On phones: a full-width bottom sheet (Base UI Drawer) you can swipe down to close.
 *
 * Keyboard: Enter, Space or Arrow Down on the trigger opens it; focus moves into the panel (to
 * `initialFocusSelector` if given); Tab stays inside while `trapFocus` is on (the WAI-ARIA date picker dialog
 * pattern); Escape closes and focus returns to the trigger.
 * Accessibility: the popover is labelled by `title`; the sheet by its heading. A visually hidden close control lets
 * touch screen readers leave the popover. The sheet keeps a focused text field above the software keyboard.
 * Glass and motion: `glass-3` panel. The popover springs out of the field and leaves faster without overshoot;
 * the sheet springs up and follows your finger. Reduced motion: both only fade.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { PICKER_SHEET_QUERY, PickerSurface, useMediaQuery } from "./picker-surface";
 *
 * export function Example() {
 *   const [open, setOpen] = useState(false);
 *   const calendar = <p>Calendar goes here</p>;
 *   return (
 *     <PickerSurface
 *       phone={useMediaQuery(PICKER_SHEET_QUERY)}
 *       open={open}
 *       onOpenChange={setOpen}
 *       trigger={<button type="button">Pick a date</button>}
 *       title="Choose a date"
 *       closeLabel="Close"
 *     >
 *       {calendar}
 *     </PickerSurface>
 *   );
 * }
 * ```
 *
 * @see /forms/date-picker
 */
export function PickerSurface({
  phone,
  open,
  onOpenChange,
  trigger: triggerProp,
  triggerId,
  title,
  closeLabel,
  children,
  popupClassName,
  anchor,
  sideOffset = 8,
  trapFocus = true,
  initialFocusSelector,
}: PickerSurfaceProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  // Arrow Down (or Alt+Arrow Down) opens the panel, like a combobox-style date field; Enter and Space
  // already open it through the button's click.
  const trigger = cloneElement(triggerProp, {
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      triggerProp.props.onKeyDown?.(event);
      if (
        event.defaultPrevented ||
        open ||
        event.key !== "ArrowDown" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      event.preventDefault();
      onOpenChange(true);
    },
  });
  const initialFocus = () =>
    (initialFocusSelector ? contentRef.current?.querySelector<HTMLElement>(initialFocusSelector) : null) ?? true;

  if (phone) {
    return (
      <Drawer.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
        <Drawer.Trigger id={triggerId} render={trigger} />
        {/* Keeps a focused text field (ColorField's hex input) above the software keyboard. */}
        <Drawer.VirtualKeyboardProvider>
          <Drawer.Portal>
            <Drawer.Backdrop
              className={cn(
                "fixed inset-0 z-50 min-h-dvh bg-sheen-scrim",
                "opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-(--sheen-duration-slow) ease-sheen-out",
                "data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-(--sheen-duration-exit) data-ending-style:ease-sheen-exit",
                "data-swiping:duration-0",
              )}
            />
            <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
              <Drawer.Popup
                data-slot="date-picker-popup"
                initialFocus={initialFocus}
                className={cn(
                  // The sheet bleeds 2rem below the screen, so the spring's tiny overshoot never shows a gap.
                  "glass-3 -mb-8 flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-sheen-xl rounded-b-none px-3 pt-2 outline-none min-[360px]:px-4",
                  "pb-[calc(max(1rem,env(safe-area-inset-bottom))+2rem)]",
                  // WCAG 2.4.11: the 2rem bleed is below the screen edge, so a focused control scrolls to the edge of the
                  // visible part, not to the bottom of the (partly off-screen) scrollport.
                  "scroll-pb-[calc(max(1rem,env(safe-area-inset-bottom))+2rem)] scroll-pt-2",
                  "[transform:translateY(var(--drawer-swipe-movement-y,0px))] data-swiping:select-none",
                  // Enter: spring up. Exit: shorter, ease-in, no overshoot. Reduced motion: fade only.
                  "transition-opacity duration-(--sheen-duration-base) ease-sheen-out",
                  "motion-ok:[transition:transform_var(--sheen-duration-smooth)_var(--sheen-ease-smooth),opacity_var(--sheen-duration-base)_var(--sheen-ease-out)]",
                  "data-starting-style:opacity-0 motion-ok:data-starting-style:opacity-100 motion-ok:data-starting-style:[transform:translateY(100%)]",
                  "data-ending-style:opacity-0 data-ending-style:duration-(--sheen-duration-exit) motion-ok:data-ending-style:opacity-100 motion-ok:data-ending-style:[transform:translateY(100%)]",
                  "motion-ok:data-ending-style:[transition:transform_var(--sheen-duration-exit)_var(--sheen-ease-exit)]",
                  "motion-ok:data-swiping:[transition:none]",
                )}
              >
                <div aria-hidden className="mx-auto mb-2 h-1.5 w-10 shrink-0 rounded-full bg-sheen-fg-subtle/40" />
                <Drawer.Content className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Drawer.Title className="text-base font-semibold">{title}</Drawer.Title>
                    <Drawer.Close
                      aria-label={closeLabel}
                      className={cn(
                        "-me-2 flex size-11 items-center justify-center rounded-sheen-full text-sheen-fg-muted",
                        "transition-[background-color,color] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
                        "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
                      )}
                    >
                      <CloseIcon className="size-4" />
                    </Drawer.Close>
                  </div>
                  <div ref={contentRef} className="flex flex-col gap-3">
                    {children}
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.VirtualKeyboardProvider>
      </Drawer.Root>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={(next) => onOpenChange(next)} modal={trapFocus ? "trap-focus" : false}>
      <Popover.Trigger id={triggerId} render={trigger} />
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchor}
          side="bottom"
          align="start"
          sideOffset={sideOffset}
          collisionPadding={16}
          // Above or below only (never beside the field); too tall for both, it scrolls.
          collisionAvoidance={{ side: "flip", align: "flip", fallbackAxisSide: "none" }}
          className="z-50"
        >
          <Popover.Popup
            data-slot="date-picker-popup"
            initialFocus={initialFocus}
            aria-label={title}
            className={cn(
              // overflow-x-hidden: a month sliding out mid-animation must not flash a scrollbar.
              "glass-3 max-h-(--available-height) max-w-[calc(100vw-2rem)] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain rounded-sheen-xl p-3 outline-none",
              popupMotion,
              popupClassName,
            )}
          >
            <div ref={contentRef} className="flex flex-col gap-3">
              {children}
            </div>
            {/* Lets touch screen readers leave the popover (keyboards use Escape, so no tab stop). */}
            <Popover.Close tabIndex={-1} className="sr-only">
              {closeLabel}
            </Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
