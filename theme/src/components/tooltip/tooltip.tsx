"use client";

import type { ComponentProps } from "react";
import { cloneElement, useEffect, useId, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactElement, ReactNode } from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "../../lib/cn";
import { useControllable } from "../../hooks/use-controllable";
import { tooltipMotion } from "../../lib/popup-motion";

/** Touch: how long a finger rests on the trigger before the tooltip shows, and how long it then stays (ms). */
const TOUCH_HOLD_MS = 500;
const TOUCH_SHOW_MS = 2600;
/** A finger that travels farther than this (px) while holding is scrolling, not pressing. */
const TOUCH_SLOP = 10;

/** Props of `Tooltip`; each option is documented on its field. */
export type TooltipProps = {
  /** What the tooltip says. */
  content: ReactNode;
  /** The element that shows the tooltip on hover, keyboard focus or (touch) a long press. Must accept a ref (a native element or a SheenUI component). */
  children: ReactElement;
  /** Which side of the trigger it opens on. It flips when there is no room. Default "top". */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment along that side: "start", "center" or "end". Default "center". */
  align?: "start" | "center" | "end";
  /** Sets the delay before showing, in ms. Default 300. */
  delay?: number;
  /** Open state (controlled). Pair with `onOpenChange`. Leave it out to let hover, focus and touch decide. */
  open?: boolean;
  /** Starting open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called when the tooltip wants to open or close (hover, focus, Escape, touch hold). */
  onOpenChange?: (open: boolean) => void;
  /** Never show the tooltip (the trigger still works). Default false. */
  disabled?: boolean;
  /** Adds extra classes to the tooltip bubble. */
  className?: string;
};

/**
 * Wrap a group of tooltips in `TooltipProvider` so moving from one trigger to the next shows the
 * next tooltip instantly instead of waiting for the delay again. Put it once near the app root.
 *
 * Keyboard and accessibility: it renders nothing itself, so it adds no tab stops. Each `Tooltip`
 * inside keeps its own behaviour.
 * Glass and motion: the instant swap is a `transition: none`, so reduced motion needs no extra case.
 *
 * @example
 * ```tsx
 * import { Tooltip, TooltipProvider } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TooltipProvider>
 *       <Tooltip content="Save"><button>Save</button></Tooltip>
 *       <Tooltip content="Share"><button>Share</button></Tooltip>
 *     </TooltipProvider>
 *   );
 * }
 * ```
 *
 * @see /components/tooltip
 */
export const TooltipProvider = BaseTooltip.Provider;

/**
 * A small glass label that explains an element on hover or keyboard focus. Use it for short,
 * supplementary hints (an icon button's name, a shortcut), never for essential information or
 * anything interactive: use `Popover` or `HoverCard` for that.
 *
 * - `content` is the text, `children` is the trigger (one element that accepts a ref).
 * - `side` picks the preferred side (it flips near the viewport edge), `align` the alignment along it, `delay` the wait in ms.
 * - Controlled with `open` + `onOpenChange`, or seeded with `defaultOpen`; `disabled` turns the tooltip off.
 *
 * Keyboard: shows when the trigger gets focus, hides on blur or Escape. The trigger keeps its own tab stop.
 * Touch: a long press (about half a second) on the trigger shows it for a couple of seconds; a tap anywhere else, a
 * scroll or Escape hides it, and lifting the finger after the long press does not activate the trigger.
 * Accessibility: the bubble has `role="tooltip"` and, while it is open, the trigger points to it with
 * `aria-describedby` (merged with any description the trigger already has), so the text is announced
 * as the trigger's description. It describes, it does not name: an icon-only trigger still needs its
 * own `aria-label`. The positioning wrapper is `role="presentation"` (no landmark per tooltip); anything interactive or rich belongs in a `Popover` or `HoverCard` (dialog pattern), not here. The bubble stays open while the pointer moves onto it (WCAG 1.4.13 hoverable) but holds no controls. A plain tap never shows it
 * (it would fire the control), so never hide the only label of a control in a tooltip.
 * Glass and motion: `glass-3` surface (one small backdrop blur, solid-ish under reduced transparency
 * and forced colors). Fades with a short spring scale; reduced motion fades only.
 *
 * @example
 * ```tsx
 * import { Tooltip } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Tooltip content="Copy link" side="bottom">
 *       <button type="button" aria-label="Copy link">Copy</button>
 *     </Tooltip>
 *   );
 * }
 * ```
 *
 * @see /components/tooltip
 */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 300,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
}: TooltipProps) {
  const tipId = useId();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  // Touch has no hover: a long press stands in for it. Base UI ignores touch pointers, so this is ours.
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const swallowClick = useRef(false);
  const swallowTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      clearTimeout(holdTimer.current);
      clearTimeout(hideTimer.current);
      clearTimeout(swallowTimer.current);
    },
    [],
  );
  function cancelHold() {
    clearTimeout(holdTimer.current);
    holdTimer.current = undefined;
    pressStart.current = null;
  }
  const touchProps = {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      clearTimeout(swallowTimer.current);
      swallowClick.current = false;
      if (event.pointerType === "mouse") return;
      cancelHold();
      pressStart.current = { x: event.clientX, y: event.clientY };
      holdTimer.current = setTimeout(() => {
        holdTimer.current = undefined;
        swallowClick.current = true;
        clearTimeout(hideTimer.current);
        setOpen(true);
        hideTimer.current = setTimeout(() => setOpen(false), TOUCH_SHOW_MS);
      }, TOUCH_HOLD_MS);
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      const start = pressStart.current;
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > TOUCH_SLOP) cancelHold();
    },
    onPointerUp() {
      cancelHold();
      // The click that follows a long press (iOS) must not activate the trigger; the flag does not outlive it.
      if (swallowClick.current) {
        clearTimeout(swallowTimer.current);
        swallowTimer.current = setTimeout(() => {
          swallowClick.current = false;
        }, 400);
      }
    },
    onPointerCancel: cancelHold,
    onClickCapture(event: ReactMouseEvent<HTMLElement>) {
      if (!swallowClick.current) return;
      swallowClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
    onContextMenu(event: ReactMouseEvent<HTMLElement>) {
      if (swallowClick.current) event.preventDefault();
    },
  };
  // Base UI 1.x renders no tooltip semantics, so link the trigger to the bubble ourselves while it is open.
  const existing = (children.props as { "aria-describedby"?: string })["aria-describedby"];
  const trigger = open
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": existing ? `${existing} ${tipId}` : tipId,
      })
    : children;
  return (
    <BaseTooltip.Root
      open={open}
      disabled={disabled}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) clearTimeout(hideTimer.current);
      }}
    >
      <BaseTooltip.Trigger delay={delay} render={trigger} style={{ WebkitTouchCallout: "none" }} {...touchProps} />
      <BaseTooltip.Portal>
        {/* The wrapper is a plain positioning box: the bubble itself carries role="tooltip", and no landmark is created per tooltip. */}
        <BaseTooltip.Positioner
          role="presentation"
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={8}
          className="z-50"
        >
          <BaseTooltip.Popup
            data-slot="tooltip"
            id={tipId}
            role="tooltip"
            className={cn(
              "glass-3 max-w-[min(20rem,calc(100vw-1rem))] origin-(--transform-origin) rounded-sheen-sm px-2.5 py-1.5 text-xs font-medium",
              // 120ms fade + 2px rise in, 80ms out; moving between tooltips inside a TooltipProvider swaps instantly.
              tooltipMotion,
              className,
            )}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

/** Props of {@link TooltipProvider}. Wrap a group of tooltips in `TooltipProvider` so moving from one trigger to the next shows the next tooltip instantly instead of waiting for the delay again. */
export type TooltipProviderProps = ComponentProps<typeof TooltipProvider>;
