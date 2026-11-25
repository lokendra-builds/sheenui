"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { cn } from "../../lib/cn";
import { clamp } from "../../lib/math";
import { useMergedRef } from "../../lib/form";
import { isRtlAt } from "../../hooks/use-direction";

/** Translatable text of {@link ResizableHandle}. */
export type ResizableLabels = {
  /** Accessible name of a drag handle (a separator). */
  resize: string;
  /** Accessible name of the step button that makes the panel before the divider larger (the non-drag alternative, WCAG 2.5.7). */
  grow: string;
  /** Accessible name of the step button that makes the panel before the divider smaller. */
  shrink: string;
};

/** The English {@link ResizableLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultResizableLabels: ResizableLabels = {
  resize: "Resize panels",
  grow: "Make the first panel larger",
  shrink: "Make the first panel smaller",
};

/** A panel as the group knows it: registered on mount, removed on unmount. */
type PanelEntry = { id: string; el: HTMLElement; min: number; max: number; defaultSize: number | undefined };

type GroupContext = {
  orientation: "horizontal" | "vertical";
  /** Registered panels, in document order. */
  entries: PanelEntry[];
  /** The current size in percent of each registered panel, by id. */
  sizes: Record<string, number>;
  register: (entry: PanelEntry) => () => void;
  resize: (handle: number, delta: number) => void;
  step: number;
  labels: ResizableLabels;
  container: RefObject<HTMLDivElement | null>;
  disabled: boolean;
};

const GroupCtx = createContext<GroupContext | null>(null);

const FOLLOWING = 4; // Node.DOCUMENT_POSITION_FOLLOWING

/** Panels sorted by where their element sits in the document, so wrapped or later-mounted panels keep their place. */
const inDocumentOrder = (list: PanelEntry[]) =>
  [...list].sort((a, b) => (a.el.compareDocumentPosition(b.el) & FOLLOWING ? -1 : 1));

/** Sizes (percent, adding up to 100) for the registered panels: stored sizes first, then `defaults`, then each panel's own default; panels with none share what is left. */
function layoutFor(entries: PanelEntry[], stored: Record<string, number>, defaults?: number[]): number[] {
  const n = entries.length;
  if (n === 0) return [];
  const known = entries.map((e, i) => stored[e.id] ?? (defaults?.length === n ? defaults[i] : e.defaultSize));
  const sumKnown = known.reduce<number>((sum, v) => sum + (v ?? 0), 0);
  const unknown = known.filter((v) => v === undefined).length;
  let out: number[];
  if (unknown === 0) {
    out = known as number[];
  } else {
    const remaining = 100 - sumKnown;
    if (remaining >= 1) {
      out = known.map((v) => v ?? remaining / unknown);
    } else {
      // The room is used up (a panel arrived late): the newcomers take an equal share and the others give way.
      const share = 100 / n;
      const scale = (100 - share * unknown) / Math.max(sumKnown, 1);
      out = known.map((v) => (v === undefined ? share : v * scale));
    }
  }
  const total = out.reduce((a, b) => a + b, 0);
  return total > 0 && Math.abs(total - 100) > 0.01 ? out.map((v) => (v * 100) / total) : out;
}

/** Props of {@link ResizablePanelGroup}. The attributes of a `div` plus the ones below. */
export type ResizablePanelGroupProps = Omit<ComponentProps<"div">, "children" | "onChange"> & {
  /** `ResizablePanel`s with a `ResizableHandle` between each pair (they may sit inside your own components). */
  children: ReactNode;
  /** Direction the panels sit in: "horizontal" (side by side, default) or "vertical" (stacked). */
  orientation?: "horizontal" | "vertical";
  /** Panel sizes as percentages that add up to 100 (controlled). Pair with `onLayoutChange`. */
  layout?: number[];
  /**
   * Starting sizes when uncontrolled: each panel's `defaultSize`, else an equal share of what is left.
   *
   * @default each panel's defaultSize
   */
  defaultLayout?: number[];
  /** Called with the new sizes while a handle is dragged or moved with the keyboard. */
  onLayoutChange?: (layout: number[]) => void;
  /** Percent a handle moves per arrow key (Shift moves five times as much). Default 5. */
  keyboardStep?: number;
  /** Locks every handle so no panel can be resized. Default false. */
  disabled?: boolean;
  /** Every string, for translation. */
  labels?: Partial<ResizableLabels>;
};

/** Props of {@link ResizablePanel}. The attributes of a `div` plus the ones below. */
export type ResizablePanelProps = ComponentProps<"div"> & {
  /** Starting size in percent. Panels without one share what is left equally. */
  defaultSize?: number;
  /** Sets the smallest size in percent. Default 10. */
  minSize?: number;
  /** Sets the largest size in percent. Default 90. */
  maxSize?: number;
};

/**
 * Panels with draggable, keyboard-resizable handles between them: a file tree next to an editor, a list next to a detail
 * pane, a console under a canvas. Sizes are percentages of the group, so the layout survives a window resize.
 *
 * - Compose `ResizablePanelGroup` > `ResizablePanel` and `ResizableHandle`, handle between panels. Panels register with the group when they mount, so they may be wrapped in your own components or mounted later (a panel added to the group takes an equal share). Nest groups by putting a `ResizablePanelGroup` inside a panel.
 * - `orientation` is "horizontal" (side by side) or "vertical" (stacked); give the group a size (a height for horizontal groups
 *   in a page, a width and height for a vertical one).
 * - Each panel has `defaultSize`, `minSize` and `maxSize` in percent; `layout` / `onLayoutChange` (or `defaultLayout`) read and set all sizes.
 *
 * Keyboard: Tab focuses a handle; ← → (or ↑ ↓ in a vertical group) move it by `keyboardStep` percent (hold Shift for five times
 * as much); Home and End send it to the ends of its range. Accessibility: each handle is a `role="separator"` with
 * `aria-orientation`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-controls` (the panel before it) and a name
 * from `labels.resize`; handles are 44px to grab on touch screens.
 * Glass and motion: the handle is a thin line that thickens and tints on hover, drag and focus (colour only). Resizing follows
 * the pointer directly; there is no animation to turn off, and reduced motion changes nothing.
 *
 * @example
 * ```tsx
 * import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ResizablePanelGroup className="h-48 rounded-sheen-lg glass-1">
 *       <ResizablePanel defaultSize={35}>Files</ResizablePanel>
 *       <ResizableHandle />
 *       <ResizablePanel>Editor</ResizablePanel>
 *     </ResizablePanelGroup>
 *   );
 * }
 * ```
 *
 * @see /layout/resizable
 */
export function ResizablePanelGroup({
  orientation = "horizontal",
  layout,
  defaultLayout,
  onLayoutChange,
  keyboardStep = 5,
  disabled = false,
  labels: labelsProp,
  className,
  children,
  ...props
}: ResizablePanelGroupProps) {
  const container = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<PanelEntry[]>([]);
  const [stored, setStored] = useState<Record<string, number>>({});

  // Panels register themselves (and leave again), so wrapping them or mounting one later just works.
  const register = useCallback((entry: PanelEntry) => {
    setEntries((list) => inDocumentOrder([...list.filter((e) => e.id !== entry.id), entry]));
    return () => setEntries((list) => list.filter((e) => e.id !== entry.id));
  }, []);

  const ordered = layout?.length === entries.length ? layout : layoutFor(entries, stored, defaultLayout);
  const sizes = Object.fromEntries(entries.map((e, i) => [e.id, ordered[i] ?? 0]));

  // Move the handle after panel `handle` by `delta` percent, inside both neighbours' limits.
  const resize = (handle: number, delta: number) => {
    const a = entries[handle];
    const b = entries[handle + 1];
    const before = ordered[handle];
    const after = ordered[handle + 1];
    if (!a || !b || before === undefined || after === undefined) return;
    const total = before + after;
    const nextBefore = clamp(before + delta, Math.max(a.min, total - b.max), Math.min(a.max, total - b.min));
    if (nextBefore === before) return;
    const next = [...ordered];
    next[handle] = nextBefore;
    next[handle + 1] = total - nextBefore;
    if (layout === undefined) setStored(Object.fromEntries(entries.map((e, i) => [e.id, next[i] ?? 0])));
    onLayoutChange?.(next);
  };

  return (
    <GroupCtx
      value={{
        orientation,
        entries,
        sizes,
        register,
        resize,
        step: keyboardStep,
        labels: { ...defaultResizableLabels, ...labelsProp },
        container,
        disabled,
      }}
    >
      <div
        ref={container}
        data-slot="resizable-group"
        data-orientation={orientation}
        className={cn(
          "flex min-h-0 min-w-0 overflow-hidden",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </GroupCtx>
  );
}

/**
 * One panel of a {@link ResizablePanelGroup}. Its size is set by the group (`flex-grow` in percent); put any content inside.
 * The panel scrolls its own overflow.
 *
 * Keyboard and accessibility: a plain container; the handle before it is the control. Glass and motion: no surface of its own.
 *
 * @example
 * ```tsx
 * import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ResizablePanelGroup orientation="vertical" className="h-56">
 *       <ResizablePanel defaultSize={70} minSize={30}>Canvas</ResizablePanel>
 *       <ResizableHandle />
 *       <ResizablePanel>Console</ResizablePanel>
 *     </ResizablePanelGroup>
 *   );
 * }
 * ```
 *
 * @see /layout/resizable
 */
export function ResizablePanel({
  defaultSize,
  minSize = 10,
  maxSize = 90,
  className,
  style,
  id: idProp,
  ref,
  ...props
}: ResizablePanelProps) {
  const group = useContext(GroupCtx);
  const autoId = useId();
  const id = idProp ?? autoId;
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const mergedRef = useMergedRef(setEl, ref);
  const register = group?.register;
  useLayoutEffect(() => {
    if (!register || !el) return;
    return register({ id, el, min: minSize, max: maxSize, defaultSize });
  }, [register, id, el, minSize, maxSize, defaultSize]);
  const size = group?.sizes[id] ?? defaultSize ?? 1;
  return (
    <div
      ref={mergedRef}
      id={id}
      data-slot="resizable-panel"
      data-size={Math.round(size)}
      style={{ ...style, flex: `${size} 1 0%` }}
      className={cn("min-h-0 min-w-0 overflow-auto", className)}
      {...props}
    />
  );
}

/** Props of {@link ResizableHandle}. The attributes of a `div` plus the ones below. */
export type ResizableHandleProps = Omit<ComponentProps<"div">, "role" | "children"> & {
  /** Draw a small grip in the middle of the line. Default false. */
  withGrip?: boolean;
};

/**
 * The draggable divider between two panels of a {@link ResizablePanelGroup}. Drag it with a mouse, finger or pen, or focus it and use
 * the arrow keys. Place it between two `ResizablePanel`s.
 *
 * Keyboard: ← → (↑ ↓ when vertical) move it, Shift for bigger steps, Home and End jump to the limits; a double click or double tap
 * puts it back where it started. Pointer without dragging (WCAG 2.5.7): two step buttons ("Make the first panel larger / smaller",
 * named by `labels.grow` and `labels.shrink`) sit on the divider, always visible on coarse pointers and shown whenever the divider
 * or a button has keyboard focus. Accessibility: `role="separator"`
 * with `aria-orientation` and the value of the panel before it (`aria-valuenow` in percent) plus its limits; named by `labels.resize`;
 * the grab area is 44px on touch screens. Glass and motion: a hairline that thickens and tints on hover, drag and focus.
 *
 * @example
 * ```tsx
 * import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ResizablePanelGroup className="h-40">
 *       <ResizablePanel>One</ResizablePanel>
 *       <ResizableHandle withGrip />
 *       <ResizablePanel>Two</ResizablePanel>
 *     </ResizablePanelGroup>
 *   );
 * }
 * ```
 *
 * @see /layout/resizable
 */
export function ResizableHandle({
  withGrip = false,
  className,
  onKeyDown,
  onDoubleClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ref,
  ...props
}: ResizableHandleProps) {
  const group = useContext(GroupCtx);
  const drag = useRef<{ pointer: number; start: number } | null>(null);
  const initial = useRef<number | null>(null);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const mergedRef = useMergedRef(setEl, ref);
  const orientation = group?.orientation ?? "horizontal";
  const entries = group?.entries ?? [];
  const sizes = group?.sizes ?? {};
  const horizontal = orientation === "horizontal";
  // The handle sits between the last panel before it in the document and the next one.
  const index = el ? entries.filter((e) => e.el.compareDocumentPosition(el) & FOLLOWING).length - 1 : -1;
  const beforeEntry = entries[index];
  const afterEntry = entries[index + 1];
  const value = beforeEntry ? (sizes[beforeEntry.id] ?? 0) : 0;
  const total = value + (afterEntry ? (sizes[afterEntry.id] ?? 0) : 0);
  const min = beforeEntry && afterEntry ? Math.max(beforeEntry.min, total - afterEntry.max) : 0;
  const max = beforeEntry && afterEntry ? Math.min(beforeEntry.max, total - afterEntry.min) : 100;

  // The size the divider started at: a double click or double tap puts it back there.
  const paired = Boolean(beforeEntry && afterEntry);
  useLayoutEffect(() => {
    if (initial.current === null && paired) initial.current = value;
  }, [paired, value]);

  if (!group) return null;
  const { resize, step, labels, container, disabled } = group;

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const box = container.current?.getBoundingClientRect();
    if (!drag.current || !box) return;
    const span = horizontal ? box.width : box.height;
    const rtl = horizontal && isRtlAt(event.currentTarget);
    const now = horizontal ? event.clientX : event.clientY;
    const deltaPx = (now - drag.current.pointer) * (rtl ? -1 : 1);
    resize(index, (deltaPx / span) * 100 - (value - drag.current.start));
  };

  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || index < 0) return;
    const rtl = horizontal && isRtlAt(event.currentTarget);
    const grow = horizontal ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
    const shrink = horizontal ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
    const amount = step * (event.shiftKey ? 5 : 1);
    if (event.key === grow) resize(index, amount);
    else if (event.key === shrink) resize(index, -amount);
    else if (event.key === "Home") resize(index, min - value);
    else if (event.key === "End") resize(index, max - value);
    else return;
    event.preventDefault();
  };

  const handle = (
    // A focusable separator is an interactive widget (ARIA window splitter); the lint rule does not know the role.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role=separator with tabIndex is a focusable widget
    <div
      ref={mergedRef}
      role="separator"
      tabIndex={disabled ? -1 : 0}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={Math.round(value)}
      aria-valuemin={Math.round(min)}
      aria-valuemax={Math.round(max)}
      aria-controls={beforeEntry?.id}
      aria-label={labels.resize}
      aria-disabled={disabled || undefined}
      data-slot="resizable-handle"
      onKeyDown={keys}
      onDoubleClick={(event) => {
        onDoubleClick?.(event);
        if (event.defaultPrevented || disabled || index < 0 || initial.current === null) return;
        resize(index, initial.current - value);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || disabled || index < 0) return;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // No active pointer to capture (a synthetic event): the drag still follows the handle's own move events.
        }
        drag.current = { pointer: horizontal ? event.clientX : event.clientY, start: value };
      }}
      // The consumer's handlers run first and never replace the drag: ours always run, so a drag cannot get stuck.
      onPointerMove={(event) => {
        onPointerMove?.(event);
        move(event);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
        drag.current = null;
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        drag.current = null;
      }}
      className={cn(
        "group/handle peer/handle relative flex shrink-0 touch-none items-center justify-center bg-sheen-border select-none",
        horizontal ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
        // A wider, invisible grab area (44px on touch screens).
        "after:absolute after:content-['']",
        horizontal
          ? "after:inset-y-0 after:-inset-x-1.5 any-pointer-coarse:after:-inset-x-[21.5px]"
          : "after:inset-x-0 after:-inset-y-1.5 any-pointer-coarse:after:-inset-y-[21.5px]",
        "transition-[background-color] duration-(--sheen-duration-fast) hover:bg-sheen-accent focus-visible:bg-sheen-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {withGrip && (
        <span
          aria-hidden
          className={cn(
            "z-10 rounded-sheen-full border border-sheen-control-border bg-sheen-surface",
            horizontal ? "h-6 w-2.5" : "h-2.5 w-6",
          )}
        />
      )}
    </div>
  );
  const rtlHandle = horizontal && el !== null && isRtlAt(el);
  const stepButton = (direction: 1 | -1) => (
    <button
      type="button"
      tabIndex={disabled ? -1 : 0}
      disabled={disabled}
      aria-label={direction === 1 ? labels.grow : labels.shrink}
      aria-controls={beforeEntry?.id}
      data-slot="resizable-step"
      onClick={() => index >= 0 && resize(index, direction * step * 2)}
      className={cn(
        "flex size-7 items-center justify-center rounded-sheen-full border border-sheen-control-border bg-sheen-surface text-sheen-fg any-pointer-coarse:size-11",
        "cursor-pointer transition-[background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={cn("size-3.5", !horizontal && "rotate-90")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={(direction === 1) !== rtlHandle ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
      </svg>
    </button>
  );
  return (
    // The step buttons are the single-pointer alternative to dragging (WCAG 2.5.7): always on show for coarse pointers,
    // and whenever the handle or a button has keyboard focus. They are siblings of the separator, not children (a
    // separator's children are presentational).
    <div
      data-slot="resizable-divider"
      className={cn("group/divider relative flex shrink-0 self-stretch", !horizontal && "flex-col")}
    >
      {handle}
      <div
        className={cn(
          "absolute z-20 hidden gap-1 any-pointer-coarse:flex group-has-[:focus-visible]/divider:flex",
          horizontal
            ? "top-1/2 start-1/2 -translate-y-1/2 flex-col -translate-x-1/2 rtl:translate-x-1/2"
            : "start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-row rtl:translate-x-1/2",
        )}
      >
        {stepButton(-1)}
        {stepButton(1)}
      </div>
    </div>
  );
}
