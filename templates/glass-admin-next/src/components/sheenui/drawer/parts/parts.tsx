"use client";

import { useEffect, useId, useRef, useState, type ComponentProps, type KeyboardEvent, type RefObject } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";

import { cn, classNameWith } from "../../lib/cn";
import { isPreset, useDrawerContext } from "./model";

/* ---------- Handle ---------- */

/**
 * The grab bar. It always drags the sheet; with snap points it is also a button that steps
 * through them (click / Enter / Space cycles, ArrowUp / ArrowDown step, Home / End jump).
 * It describes the current height to screen readers and announces the new one when it changes it.
 * Rendered by DrawerContent; export it only to place it yourself (`handle={false}` on the content).
 *
 * Keyboard: with two or more snap points it is a normal tab stop (see above). Accessibility: a labelled button
 * that reads the current height and how to change it, plus a polite status announcement. Without snap points it is a decorative bar.
 * Glass and motion: colour and scale transitions only; none under reduced motion beyond the colour change.
 *
 * @example
 * ```tsx
 * import { DrawerContent, DrawerHandle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DrawerContent handle={false}>
 *       <DrawerHandle className="mx-auto" />
 *     </DrawerContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export function DrawerHandle({ className }: { className?: string }) {
  const { side, labels, orderedSnapPoints, snapIndex: index, setSnapPoint } = useDrawerContext("DrawerHandle");
  const count = orderedSnapPoints.length;
  const atTallest = index >= count - 1;
  const descriptionId = useId();
  const [announcement, setAnnouncement] = useState("");
  const interactive = count >= 2;

  const nameOf = (position: number) => {
    const point = orderedSnapPoints[position];
    if (point === undefined) return "";
    return isPreset(point) ? labels.snapPoints[point] : labels.customSnapPoint(position + 1, count);
  };

  const pill = (
    <span
      aria-hidden
      className={cn(
        "block h-1.5 w-10 rounded-sheen-full",
        "transition-[background-color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
        // A button needs a 3:1 boundary; the purely decorative grabber can stay quieter.
        interactive
          ? "bg-sheen-control-border group-hover/handle:bg-sheen-fg-muted group-data-swiping/drawer:bg-sheen-fg-muted"
          : "bg-sheen-fg-subtle/55 group-data-swiping/drawer:bg-sheen-fg-subtle",
        // Grabbed: the bar stretches a little.
        "motion-ok:group-data-swiping/drawer:scale-x-125",
        "forced-colors:bg-[CanvasText]",
      )}
    />
  );

  const wrapper = cn("flex shrink-0 justify-center", side === "top" ? "pt-1 pb-2.5" : "pt-2.5 pb-1", className);

  if (!interactive) {
    return (
      <div data-slot="drawer-handle" className={wrapper}>
        <span className="flex h-5 w-16 items-center justify-center">{pill}</span>
      </div>
    );
  }

  function go(next: number) {
    const position = Math.max(0, Math.min(count - 1, next));
    const target = orderedSnapPoints[position];
    if (target === undefined) return;
    setSnapPoint(target);
    setAnnouncement(nameOf(position));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const keys: Record<string, () => void> = {
      ArrowUp: () => go(index + 1),
      ArrowRight: () => go(index + 1),
      ArrowDown: () => go(index - 1),
      ArrowLeft: () => go(index - 1),
      Home: () => go(0),
      End: () => go(count - 1),
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    // Keep Base UI's composite key handling (and the page) from reacting too.
    event.stopPropagation();
    action();
  }

  return (
    <div data-slot="drawer-handle" className={wrapper}>
      <button
        type="button"
        aria-label={atTallest ? labels.collapse : labels.expand}
        aria-describedby={descriptionId}
        onClick={() => go(atTallest ? 0 : index + 1)}
        onKeyDown={handleKeyDown}
        className={cn(
          "group/handle relative flex h-5 w-16 cursor-grab items-center justify-center rounded-sheen-full active:cursor-grabbing",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          // 44 px tall, 80 px wide hit area on touch screens.
          "any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-x-2 any-pointer-coarse:after:-inset-y-3",
        )}
      >
        {pill}
      </button>
      <span id={descriptionId} className="sr-only">
        {`${nameOf(index)}. ${labels.handleHint}`}
      </span>
      {/* Announces the new height after the handle changed it. */}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

/* ---------- Layout parts ---------- */

/**
 * Top section of the sheet: stacks the title and description, with room on the right for the × button.
 *
 * Keyboard: none. Accessibility: a plain `div`; the title and description inside name the dialog. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { DrawerDescription, DrawerHeader, DrawerTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DrawerHeader>
 *       <DrawerTitle>Filters</DrawerTitle>
 *       <DrawerDescription>Narrow the results.</DrawerDescription>
 *     </DrawerHeader>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  const { side } = useDrawerContext("DrawerHeader");
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex shrink-0 flex-col gap-1 px-5 pe-14",
        side === "bottom" ? "pt-2 pb-3" : side === "top" ? "pt-5 pb-3" : "pt-5 pb-4",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The drawer's heading. It is the dialog's accessible name (`aria-labelledby` is wired for you).
 *
 * Keyboard: none. Accessibility: always render one, even if hidden visually with `className="sr-only"`. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { DrawerTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DrawerTitle>Filters</DrawerTitle>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export function DrawerTitle({ className, ...props }: ComponentProps<typeof BaseDrawer.Title>) {
  return (
    <BaseDrawer.Title
      className={classNameWith(className, (extra) =>
        cn("text-lg leading-tight font-semibold tracking-tight text-balance", extra),
      )}
      {...props}
    />
  );
}

/**
 * Muted helper text under the title. It is the dialog's accessible description (`aria-describedby` is wired for you).
 *
 * Keyboard: none. Accessibility: keep it to a sentence. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { DrawerDescription } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DrawerDescription>Narrow the results.</DrawerDescription>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export function DrawerDescription({ className, ...props }: ComponentProps<typeof BaseDrawer.Description>) {
  return (
    <BaseDrawer.Description
      className={classNameWith(className, (extra) => cn("text-sm text-pretty text-sheen-fg-muted", extra))}
      {...props}
    />
  );
}

/**
 * The scrolling part of the sheet. Text in it can be selected with a mouse without dragging
 * the sheet, and touch scrolling hands over to swipe-to-dismiss at the scroll edge (Base UI).
 * It becomes a keyboard tab stop only while it actually overflows, so it can be scrolled with arrows.
 *
 * Keyboard: when it overflows, Tab focuses it and the arrow keys scroll. Accessibility: gets `tabIndex=0` only while scrollable, with an inset focus ring.
 * Glass and motion: flat; no motion of its own.
 *
 * @example
 * ```tsx
 * import { DrawerBody } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DrawerBody>
 *       <p>Long content...</p>
 *     </DrawerBody>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export function DrawerBody({ className, ...props }: ComponentProps<typeof BaseDrawer.Content>) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollable = useOverflows(ref);
  return (
    <BaseDrawer.Content
      ref={ref}
      data-slot="drawer-body"
      tabIndex={scrollable ? 0 : undefined}
      className={classNameWith(className, (extra) =>
        cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2 touch-auto [scrollbar-width:thin]",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
          extra,
        ),
      )}
      {...props}
    />
  );
}

/**
 * Bottom row of actions, separated by a hairline: a column on phones (primary action first on screen) and a right-aligned row from `sm` up.
 *
 * Keyboard: none of its own. Accessibility: a plain `div`; the buttons inside are normal tab stops. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { Button, DrawerClose, DrawerFooter } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DrawerFooter>
 *       <DrawerClose render={<Button variant="ghost">Cancel</Button>} />
 *       <Button>Apply</Button>
 *     </DrawerFooter>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 border-t border-sheen-border px-5 pt-3 pb-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

/**
 * An invisible strip along a screen edge that opens the drawer with a swipe (touch screens).
 * Place it inside <Drawer>; it sits on the drawer's own side.
 *
 * Keyboard: none (touch only; keep a visible trigger as the keyboard route). Accessibility: not focusable and hidden from pointer-fine devices.
 * Glass and motion: invisible; the drawer follows the finger as it opens.
 *
 * @example
 * ```tsx
 * import { Drawer, DrawerContent, DrawerSwipeArea } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Drawer side="left">
 *       <DrawerSwipeArea />
 *       <DrawerContent>...</DrawerContent>
 *     </Drawer>
 *   );
 * }
 * ```
 *
 * @see /overlays/drawer
 */
export function DrawerSwipeArea({ className, ...props }: ComponentProps<typeof BaseDrawer.SwipeArea>) {
  const { side } = useDrawerContext("DrawerSwipeArea");
  return (
    <BaseDrawer.SwipeArea
      className={classNameWith(className, (extra) =>
        cn(
          "fixed z-40 hidden any-pointer-coarse:block",
          {
            bottom: "inset-x-0 bottom-0 h-5",
            top: "inset-x-0 top-0 h-5",
            left: "inset-y-0 left-0 w-5",
            right: "inset-y-0 right-0 w-5",
          }[side],
          extra,
        ),
      )}
      {...props}
    />
  );
}

/* ---------- Hooks ---------- */

/** True while the element's content is taller than its box (re-checked as either changes). */
export function useOverflows(ref: RefObject<HTMLElement | null>) {
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const measure = () => setOverflows(element.scrollHeight > element.clientHeight + 1);
    const resize = new ResizeObserver(measure);
    const observeAll = () => {
      resize.disconnect();
      resize.observe(element);
      for (const child of Array.from(element.children)) resize.observe(child);
      measure();
    };
    const mutations = new MutationObserver(observeAll);
    mutations.observe(element, { childList: true });
    observeAll();
    return () => {
      resize.disconnect();
      mutations.disconnect();
    };
  }, [ref]);
  return overflows;
}

/** Props of {@link DrawerTrigger}. The element that opens a `Drawer` (a `<button>` by default; use `render={<Button />}` for a SheenUI button). */
export type DrawerTriggerProps = ComponentProps<typeof BaseDrawer.Trigger>;

/** Props of {@link DrawerClose}. A button inside the drawer that closes it (a "Done" or "Cancel" action in `DrawerFooter`). */
export type DrawerCloseProps = ComponentProps<typeof BaseDrawer.Close>;

/** Props of {@link DrawerHandle}. The grab bar. */
export type DrawerHandleProps = ComponentProps<typeof DrawerHandle>;

/** Props of {@link DrawerHeader}. Top section of the sheet: stacks the title and description, with room on the right for the × button. */
export type DrawerHeaderProps = ComponentProps<typeof DrawerHeader>;

/** Props of {@link DrawerTitle}. The drawer's heading. */
export type DrawerTitleProps = ComponentProps<typeof DrawerTitle>;

/** Props of {@link DrawerDescription}. Muted helper text under the title. */
export type DrawerDescriptionProps = ComponentProps<typeof DrawerDescription>;

/** Props of {@link DrawerBody}. The scrolling part of the sheet. */
export type DrawerBodyProps = ComponentProps<typeof DrawerBody>;

/** Props of {@link DrawerFooter}. Bottom row of actions, separated by a hairline: a column on phones (primary action first on screen) and a right-aligned row from `sm` up. */
export type DrawerFooterProps = ComponentProps<typeof DrawerFooter>;

/** Props of {@link DrawerSwipeArea}. An invisible strip along a screen edge that opens the drawer with a swipe (touch screens). */
export type DrawerSwipeAreaProps = ComponentProps<typeof DrawerSwipeArea>;
