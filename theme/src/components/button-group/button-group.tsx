"use client";

import { useLayoutEffect, useRef, type ComponentProps, type KeyboardEvent } from "react";

import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/form";
import { isRtlAt } from "../../hooks/use-direction";

/** Props of {@link ButtonGroup}. The attributes of a `div` plus the ones below. */
export type ButtonGroupProps = Omit<ComponentProps<"div">, "role"> & {
  /** Direction of the row and of the arrow keys. Default "horizontal". */
  orientation?: "horizontal" | "vertical";
  /** Accessible name of the group, e.g. "Text alignment". Give one when the buttons only make sense together. */
  "aria-label"?: string;
};

/** The group's focusable members, in DOM order. */
const itemsOf = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]")];
/** Give `target` the group's one tab stop and take it from the others (roving tabindex). */
const setTabStop = (list: HTMLElement[], target: HTMLElement | null) => {
  for (const el of list) el.tabIndex = el === target ? 0 : -1;
};

/**
 * A row of `Button`s joined into one control: corners are squared where buttons touch, edges overlap by a pixel, and the group is
 * one tab stop that arrow keys move through (roving focus). Use it for related actions such as "Bold / Italic / Underline" or
 * "Day / Week / Month"; use `SegmentedControl` when exactly one option is selected, and `Toolbar` for mixed controls.
 *
 * - Put `Button`s (any variant, same `size`) inside; `orientation="vertical"` stacks them.
 * - Roving focus: Tab enters on the last focused button (the first at first); ← → (or ↑ ↓ when vertical) move, Home and End jump.
 * - Name the group with `aria-label` when the buttons share one meaning.
 *
 * Keyboard: Tab focuses the group once; arrow keys move between the buttons, Home and End jump to the ends; Enter or Space presses.
 * Accessibility: `role="group"`; each button keeps its own name and state (`aria-pressed` for toggles); disabled buttons are skipped.
 * Glass and motion: no surface of its own (the buttons carry theirs); buttons keep their hover and press motion, the focused one rises above its neighbours.
 *
 * @example
 * ```tsx
 * import { Button, ButtonGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ButtonGroup aria-label="View">
 *       <Button variant="glass">Day</Button>
 *       <Button variant="glass">Week</Button>
 *       <Button variant="glass">Month</Button>
 *     </ButtonGroup>
 *   );
 * }
 * ```
 *
 * @see /components/button-group
 */
export function ButtonGroup({
  orientation = "horizontal",
  className,
  onKeyDown,
  onFocus,
  children,
  ref: refProp,
  ...props
}: ButtonGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(ref, refProp);
  const items = () => (ref.current ? itemsOf(ref.current) : []);
  // The button that holds the group's single tab stop: the last focused one, else the first.
  const active = useRef<HTMLElement | null>(null);
  // Runs before first paint and again only when the buttons change (added, removed, disabled, turned into links), not on every render.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const sync = () => {
      const list = itemsOf(root);
      active.current = active.current && list.includes(active.current) ? active.current : (list[0] ?? null);
      setTabStop(list, active.current);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "href"] });
    return () => observer.disconnect();
  }, []);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    const rtl = isRtlAt(event.currentTarget);
    const next = orientation === "horizontal" ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
    const prev = orientation === "horizontal" ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
    let target: number | null = null;
    if (event.key === next) target = (index + 1) % list.length;
    else if (event.key === prev) target = (index - 1 + list.length) % list.length;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = list.length - 1;
    if (target === null) return;
    event.preventDefault();
    list[target]?.focus();
  };
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- arrow-key roving between the group's own buttons; each button is the interactive element
    <div
      ref={mergedRef}
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      onKeyDown={handleKeyDown}
      onFocus={(event) => {
        onFocus?.(event);
        const target = event.target as HTMLElement;
        if (items().includes(target)) {
          active.current = target;
          setTabStop(items(), target);
        }
      }}
      className={cn(
        "inline-flex w-fit max-w-full",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        // Attached: squared inner corners, one shared edge, the focused button above its neighbours.
        orientation === "horizontal"
          ? "[&>*:not(:first-child)]:-ms-px [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none"
          : "[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
        "[&>*]:motion-ok:hover:translate-y-0 [&>*:focus-visible]:z-10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
