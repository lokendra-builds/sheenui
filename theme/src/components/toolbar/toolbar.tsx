"use client";

import {
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { spring } from "../../motion/tokens";
import { Tooltip } from "../tooltip/tooltip";
import { KbdShortcut, useShortcutPlatform } from "../kbd/kbd";
import { toAriaKeyShortcuts } from "../kbd/shortcut";
import { useMergedRef } from "../../lib/form";

/** Control height of a toolbar: "sm" (32px) or "md" (36px). */
export type ToolbarSize = "sm" | "md";
type Orientation = "horizontal" | "vertical";

const ToolbarContext = createContext<{ size: ToolbarSize; orientation: Orientation }>({
  size: "md",
  orientation: "horizontal",
});
/** Present inside a single-choice ToolbarToggleGroup: the id its gliding pill shares. */
const PillContext = createContext<string | null>(null);

/* ---------- Root ---------- */

/**
 * Props of `Toolbar`: the Base UI `Toolbar.Root` props plus SheenUI's own options, each documented on
 * its field.
 */
export type ToolbarProps = Omit<ComponentProps<typeof BaseToolbar.Root>, "className"> & {
  /** "glass" panel (default), "floating" pill for selection / canvas toolbars, or "plain" (no surface). */
  variant?: "glass" | "floating" | "plain";
  /** Control height: "sm" (32px) or "md" (36px, default). */
  size?: ToolbarSize;
  /** Horizontal toolbars on narrow screens: wrap onto more rows (default), or scroll sideways in one row. */
  overflow?: "wrap" | "scroll";
  /** Sets the layout direction of the toolbar and its arrow-key navigation. */
  orientation?: Orientation;
  /** Adds a class name to the toolbar element. */
  className?: string;
  /** overflow="scroll" only: the scrolling row inside the toolbar. */
  contentClassName?: string;
};

const surfaces = {
  glass: "glass-1 rounded-sheen-lg",
  floating: "glass-3 rounded-sheen-xl",
  plain: "",
} as const;

/** Inner padding. In scroll mode it moves onto the scroller, so focus rings are never clipped. */
const paddings = {
  glass: "p-1",
  floating: "p-1.5",
  plain: "",
} as const;

/**
 * Toolbar: a row (or column) of related controls with ONE tab stop (Base UI Toolbar). Use it for editor formatting bars, canvas tools and table actions;
 * use `Menubar` for application menus. Compose `ToolbarButton`, `ToolbarToggleGroup` > `ToolbarToggle`, `ToolbarGroup`, `ToolbarSeparator`, `ToolbarSpacer`, `ToolbarLink` and `ToolbarInput`.
 *
 * - `variant` is "glass" panel (default), "floating" pill for selection / canvas toolbars, or "plain" (no surface); `size` is "sm" or "md"; `orientation` is "horizontal" or "vertical".
 * - Narrow screens: `overflow="wrap"` (default) wraps onto more rows; `overflow="scroll"` keeps one row that scrolls sideways inside the toolbar, with soft fades at the edges that have
 *   more. Focusing a control scrolls it into view, so arrow keys reach every control.
 * - Popups: put a Menu / Popover / Select trigger in the toolbar with `<ToolbarButton render={<MenuTrigger />}>...</ToolbarButton>`.
 * - Pressed states: in a single-choice group (alignment, tools) one accent pill glides between the options; in a multiple group (B / I / U) each pressed toggle blooms its own tint.
 *
 * Keyboard (roving focus): Tab enters and leaves the toolbar as one stop; the arrow keys move between controls (Left/Right, or Up/Down when vertical), wrapping at the ends; Home/End jump to the first / last
 * control (inside a ToolbarInput they move the caret instead). Disabled controls stay focusable, so keyboard users can still discover them.
 * Accessibility: `role="toolbar"` (name it with `aria-label`); toggles use `aria-pressed`; icon-only controls take their name from `tooltip` unless `aria-label` is set, and shortcuts are exposed with `aria-keyshortcuts`;
 * targets are 44px on touch screens.
 * Glass and motion: "glass" is `glass-1`, "floating" is `glass-3` (one backdrop surface; controls inside are flat). Reduced motion: the pill jumps and the tint fades; nothing scales.
 *
 * @example
 * ```tsx
 * import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const BoldIcon: () => React.JSX.Element;
 * declare const ItalicIcon: () => React.JSX.Element;
 * declare const LinkIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <Toolbar aria-label="Formatting">
 *       <ToolbarToggleGroup multiple aria-label="Text style">
 *         <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b"><BoldIcon /></ToolbarToggle>
 *         <ToolbarToggle value="italic" tooltip="Italic" shortcut="mod+i"><ItalicIcon /></ToolbarToggle>
 *       </ToolbarToggleGroup>
 *       <ToolbarSeparator />
 *       <ToolbarButton tooltip="Insert link"><LinkIcon /></ToolbarButton>
 *     </Toolbar>
 *   );
 * }
 * ```
 *
 * @see /layout/toolbar
 */
export function Toolbar({
  variant = "glass",
  size = "md",
  overflow = "wrap",
  orientation = "horizontal",
  className,
  contentClassName,
  children,
  ref,
  onKeyDown,
  ...props
}: ToolbarProps) {
  const vertical = orientation === "vertical";
  const scroll = overflow === "scroll" && !vertical;
  const context = useMemo(() => ({ size, orientation }), [size, orientation]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useRowEdgeSeparators(rootRef, !vertical && !scroll);
  const setRef = useMergedRef(rootRef, ref);

  return (
    <ToolbarContext value={context}>
      <BaseToolbar.Root
        ref={setRef}
        data-slot="toolbar"
        data-variant={variant}
        orientation={orientation}
        onKeyDown={(event) => {
          // A focusable-but-disabled control swallows keys (preventDefault) before they reach the toolbar.
          // Home / End must still move off it, so that one case is not treated as "someone handled it".
          const swallowedByDisabled =
            event.defaultPrevented && (event.target as HTMLElement).matches("[aria-disabled=true], [data-disabled]");
          onKeyDown?.(event);
          if (!event.defaultPrevented || swallowedByDisabled) jumpToEdge(event, rootRef.current);
        }}
        className={cn(
          "flex w-fit max-w-full min-w-0 items-center gap-0.5",
          vertical ? "flex-col" : scroll ? "flex-nowrap" : "flex-wrap",
          surfaces[variant],
          !scroll && paddings[variant],
          "data-disabled:opacity-60",
          className,
        )}
        {...props}
      >
        {scroll ? (
          <EdgeScroller
            className={cn(
              "flex min-w-0 flex-nowrap items-center gap-0.5",
              paddings[variant] || "p-1",
              contentClassName,
            )}
          >
            {children}
          </EdgeScroller>
        ) : (
          children
        )}
      </BaseToolbar.Root>
    </ToolbarContext>
  );
}

/**
 * Home / End: focus the first / last control in the toolbar's arrow-key order (Base UI's
 * Toolbar handles the arrows only). Focusing a control also makes it the toolbar's tab stop.
 * In a text field the keys keep moving the caret.
 */
function jumpToEdge(event: KeyboardEvent<HTMLDivElement>, root: HTMLDivElement | null) {
  if (!root || (event.key !== "Home" && event.key !== "End")) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const target = event.target as HTMLElement;
  if (target.closest("input, textarea, select, [contenteditable]:not([contenteditable=false])")) return;
  // Roving items carry tabindex 0 / -1; natively disabled ones cannot take focus.
  const items = Array.from(root.querySelectorAll<HTMLElement>("[tabindex]")).filter(
    (el) => el.closest("[role=toolbar]") === root && !el.matches(":disabled") && el.tabIndex >= -1,
  );
  const next = event.key === "Home" ? items[0] : items[items.length - 1];
  if (!next) return;
  event.preventDefault();
  if (next !== document.activeElement) next.focus();
}

/**
 * When a wrapping toolbar breaks onto more rows, a separator can end up dangling at the end
 * (or start) of a row. Mark those with data-row-edge so they hide, keeping their space.
 */
function useRowEdgeSeparators(ref: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    const update = () => {
      for (const sep of Array.from(root.querySelectorAll<HTMLElement>("[data-slot=toolbar-separator]"))) {
        const box = sep.getBoundingClientRect();
        const mid = box.top + box.height / 2;
        const off = (el: Element | null) => {
          if (!el) return true;
          const r = el.getBoundingClientRect();
          return mid < r.top || mid > r.bottom;
        };
        const edge = off(sep.previousElementSibling) || off(sep.nextElementSibling);
        if (edge) sep.setAttribute("data-row-edge", "");
        else sep.removeAttribute("data-row-edge");
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, [ref, enabled]);
}

/**
 * One scrolling row. The edges fade only where there is more to scroll, so the first and last
 * controls are crisp at rest. The fade is a mask on this row (its controls are not glass).
 */
function EdgeScroller({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // scrollLeft is negative in RTL; work with the distance from the inline start.
    const from = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    const next = { start: from > 1, end: max - from > 1 };
    setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [update]);

  const fade = "1.5rem";
  const start = edges.start ? `transparent, black ${fade}` : "black, black";
  const end = edges.end ? `black calc(100% - ${fade}), transparent` : "black, black";
  const mask = `linear-gradient(var(--sheen-toolbar-dir), ${start}, ${end})`;

  return (
    <div
      ref={ref}
      onScroll={update}
      data-slot="toolbar-scroller"
      className={cn(
        // The padding (from the toolbar surface) leaves room for focus outlines inside the clip.
        "overflow-x-auto overscroll-x-contain rounded-[inherit] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "[--sheen-toolbar-dir:to_right] rtl:[--sheen-toolbar-dir:to_left]",
        className,
      )}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      {children}
    </div>
  );
}

/* ---------- Buttons ---------- */

const itemSizes: Record<ToolbarSize, string> = {
  sm: "h-8 min-w-8 gap-1.5 px-2 text-xs [&_svg]:size-3.5",
  md: "h-9 min-w-9 gap-2 px-2.5 text-sm [&_svg]:size-4",
};

function itemClass(size: ToolbarSize, iconOnly: boolean) {
  return cn(
    "group/tb relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sheen-md font-medium whitespace-nowrap select-none",
    "touch-manipulation [-webkit-tap-highlight-color:transparent] [&_svg]:shrink-0",
    "text-sheen-fg-muted transition-[color] duration-(--sheen-duration-fast) hover:text-sheen-fg",
    itemSizes[size],
    iconOnly && "aspect-square px-0",
    // Hover wash on its own layer (under the pressed tint).
    "before:pointer-events-none before:absolute before:inset-0 before:-z-20 before:rounded-[inherit] before:bg-sheen-hover before:opacity-0",
    "before:transition-opacity before:duration-(--sheen-duration-fast) hover:before:opacity-100 data-popup-open:before:opacity-100",
    "data-popup-open:text-sheen-fg",
    // A small squeeze on press (transform only).
    "motion-ok:transition-[color,scale] motion-ok:active:not-data-disabled:scale-95",
    "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
    "data-disabled:cursor-not-allowed data-disabled:opacity-45 data-disabled:hover:text-sheen-fg-muted data-disabled:hover:before:opacity-0",
    // At least 44×44 on touch screens.
    "any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11",
    "forced-colors:before:hidden",
  );
}

type TooltipExtras = {
  /** Tooltip text. For an icon-only control it also becomes the accessible name (unless aria-label is set). */
  tooltip?: ReactNode;
  /** Keyboard shortcut shown in the tooltip, e.g. "mod+b". Also set as `aria-keyshortcuts`. */
  shortcut?: string;
  /** Which side the tooltip opens on. Default "top" ("right" in a vertical toolbar). */
  tooltipSide?: "top" | "bottom" | "left" | "right";
};

/** Wraps a control in a Tooltip (the Tooltip trigger renders the toolbar control itself). */
function withTooltip(
  control: ReactElement,
  { tooltip, shortcut, tooltipSide }: TooltipExtras,
  orientation: Orientation,
) {
  if (!tooltip) return control;
  return (
    <Tooltip
      side={tooltipSide ?? (orientation === "vertical" ? "right" : "top")}
      content={
        <span className="inline-flex items-center gap-2">
          {tooltip}
          {shortcut && <KbdShortcut keys={shortcut} announce={false} />}
        </span>
      }
    >
      {control}
    </Tooltip>
  );
}

/** A lone <svg> or icon component (not text, not a <span>) makes a square, icon-only control. */
function iconOnlyOf(children: ReactNode) {
  return isValidElement(children) && (children.type === "svg" || typeof children.type !== "string");
}

/**
 * Props of `ToolbarButton`: the Base UI `Toolbar.Button` props plus SheenUI's own options, each
 * documented on its field.
 */
export type ToolbarButtonProps = Omit<ComponentProps<typeof BaseToolbar.Button>, "className"> &
  TooltipExtras & {
    /** Square button for a lone icon. Detected automatically for a single element child. */
    iconOnly?: boolean;
    /** Adds extra classes to the button. */
    className?: string;
  };

/**
 * A button in the toolbar's arrow-key order. A lone icon child makes it a square, icon-only control (`iconOnly` overrides the detection); `tooltip` names it for assistive tech (unless `aria-label` is set) and
 * shows a tooltip with the optional `shortcut`. Use `render` to turn it into a popup trigger (Menu, Popover, Select).
 *
 * Keyboard: reached by the arrow keys; Enter or Space presses it. Accessibility: a native `<button>`; the shortcut is exposed as `aria-keyshortcuts` for the visitor's platform. Glass and motion: flat button with a hover wash; no backdrop blur.
 *
 * @example
 * ```tsx
 * import { ToolbarButton } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const LinkIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <>
 *       <ToolbarButton tooltip="Insert link" shortcut="mod+k"><LinkIcon /></ToolbarButton>
 *       <ToolbarButton>Share</ToolbarButton>
 *     </>
 *   );
 * }
 * ```
 *
 * @see /layout/toolbar
 */
export function ToolbarButton({
  tooltip,
  shortcut,
  tooltipSide,
  iconOnly,
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: ToolbarButtonProps) {
  const { size, orientation } = useContext(ToolbarContext);
  const square = iconOnly ?? iconOnlyOf(children);
  const ariaShortcut = useAriaShortcut(shortcut);
  const control = (
    <BaseToolbar.Button
      data-slot="toolbar-button"
      aria-label={ariaLabel ?? (square && typeof tooltip === "string" ? tooltip : undefined)}
      aria-keyshortcuts={ariaShortcut}
      className={cn(itemClass(size, square), className)}
      {...props}
    >
      {children}
    </BaseToolbar.Button>
  );
  return withTooltip(control, { tooltip, shortcut, tooltipSide }, orientation);
}

/** aria-keyshortcuts for the visitor's platform ("mod+b" → "Meta+B" on a Mac, "Control+B" elsewhere). */
function useAriaShortcut(shortcut: string | undefined) {
  const platform = useShortcutPlatform();
  return shortcut ? toAriaKeyShortcuts(shortcut, platform) : undefined;
}

/* ---------- Toggles ---------- */

/**
 * Props of `ToolbarToggleGroup`: the Base UI `ToggleGroup` props plus SheenUI's own options, each
 * documented on its field.
 */
export type ToolbarToggleGroupProps = Omit<ComponentProps<typeof BaseToggleGroup>, "className"> & {
  /**
   * Single choice: one option always stays pressed (pressing the pressed one again does
   * nothing), e.g. text alignment or the active tool.
   */
  required?: boolean;
  /** Extra classes for the group. */
  className?: string;
};

/**
 * A set of toggles inside a toolbar. Single choice by default (one pressed at a time, with a gliding pill, `required` keeps one always pressed); `multiple` for independent options (B / I / U).
 * Name it with aria-label. Controlled with `value` + `onValueChange` (arrays of strings), or uncontrolled with `defaultValue`.
 *
 * Keyboard: the toolbar's roving focus; Enter or Space presses the focused toggle. Accessibility: `role="group"`; toggles use `aria-pressed`. Glass and motion: the accent pill glides between options (it jumps under reduced motion).
 *
 * @example
 * ```tsx
 * import { ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const AlignLeftIcon: () => React.JSX.Element;
 * declare const AlignCenterIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <ToolbarToggleGroup defaultValue={["left"]} aria-label="Alignment">
 *       <ToolbarToggle value="left" tooltip="Align left"><AlignLeftIcon /></ToolbarToggle>
 *       <ToolbarToggle value="center" tooltip="Align centre"><AlignCenterIcon /></ToolbarToggle>
 *     </ToolbarToggleGroup>
 *   );
 * }
 * ```
 *
 * @see /layout/toolbar
 */
export function ToolbarToggleGroup({
  multiple = false,
  required = false,
  orientation,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: ToolbarToggleGroupProps) {
  const pillId = useId();
  const toolbar = useContext(ToolbarContext);
  // `required` needs to veto an empty selection, so it keeps its own state when uncontrolled.
  const [inner, setInner] = useState<NonNullable<ToolbarToggleGroupProps["value"]>>(() => defaultValue ?? []);
  const guard = required && !multiple;
  const stateProps: Pick<ToolbarToggleGroupProps, "value" | "defaultValue" | "onValueChange"> = guard
    ? {
        value: value ?? inner,
        onValueChange: (next, details) => {
          if (next.length === 0) return;
          if (value === undefined) setInner(next);
          onValueChange?.(next, details);
        },
      }
    : { value, defaultValue, onValueChange };
  return (
    <PillContext value={multiple ? null : pillId}>
      <BaseToggleGroup
        data-slot="toolbar-toggle-group"
        multiple={multiple}
        // Follows the toolbar, so a vertical toolbar stacks its toggles too.
        orientation={orientation ?? toolbar.orientation}
        className={cn("flex items-center gap-0.5 data-[orientation=vertical]:flex-col", className)}
        {...stateProps}
        {...props}
      />
    </PillContext>
  );
}

/**
 * Props of `ToolbarToggle`: the Base UI `Toggle` props plus SheenUI's own options, each documented on
 * its field.
 */
export type ToolbarToggleProps = Omit<ComponentProps<typeof BaseToggle>, "className" | "render"> &
  TooltipExtras & {
    /** Square toggle for a lone icon. Detected automatically for a single element child. */
    iconOnly?: boolean;
    /** Adds extra classes to the toggle. */
    className?: string;
  };

/**
 * A pressable toggle (aria-pressed). Use inside a `ToolbarToggleGroup` (give it a `value`), or on its own with `pressed` / `onPressedChange`. `tooltip`, `shortcut` and `iconOnly` work as on `ToolbarButton`.
 *
 * Keyboard: the toolbar's roving focus; Enter or Space toggles it. Accessibility: `aria-pressed`; a pressed toggle is filled with `Highlight` in forced colors. Glass and motion: the pressed tint blooms or the shared pill glides; nothing scales under reduced motion.
 *
 * @example
 * ```tsx
 * import { ToolbarToggle } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const BoldIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b"><BoldIcon /></ToolbarToggle>
 *   );
 * }
 * ```
 *
 * @see /layout/toolbar
 */
export function ToolbarToggle({
  tooltip,
  shortcut,
  tooltipSide,
  iconOnly,
  className,
  children,
  disabled,
  "aria-label": ariaLabel,
  ...props
}: ToolbarToggleProps) {
  const { size, orientation } = useContext(ToolbarContext);
  const pillId = useContext(PillContext);
  const reduced = useSheenReducedMotion();
  const square = iconOnly ?? iconOnlyOf(children);
  const ariaShortcut = useAriaShortcut(shortcut);

  const control = (
    <BaseToolbar.Button
      data-slot="toolbar-toggle"
      disabled={disabled}
      aria-label={ariaLabel ?? (square && typeof tooltip === "string" ? tooltip : undefined)}
      aria-keyshortcuts={ariaShortcut}
      className={cn(
        itemClass(size, square),
        "data-pressed:text-sheen-accent data-pressed:hover:text-sheen-accent",
        // High contrast: pressed = Highlight fill, so the state never relies on the tint.
        "forced-colors:data-pressed:bg-[Highlight] forced-colors:data-pressed:text-[HighlightText] forced-colors:data-pressed:[forced-color-adjust:none]",
        className,
      )}
      render={
        <BaseToggle
          disabled={disabled}
          {...props}
          render={(toggleProps, state) => (
            <button type="button" {...toggleProps}>
              {pillId ? (
                state.pressed && (
                  <motion.span
                    aria-hidden
                    layoutId={pillId}
                    transition={reduced ? { duration: 0 } : spring.snappy}
                    className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-sheen-accent-soft shadow-[inset_0_0_0_1px_var(--sheen-accent-border)] forced-colors:hidden"
                  />
                )
              ) : (
                // Independent toggle: the tint blooms from the centre in, and fades quickly out.
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-sheen-accent-soft shadow-[inset_0_0_0_1px_var(--sheen-accent-border)] forced-colors:hidden",
                    "opacity-0 transition-[opacity,scale] duration-(--sheen-duration-exit) ease-sheen-exit motion-ok:scale-75",
                    "group-data-pressed/tb:opacity-100 group-data-pressed/tb:duration-(--sheen-duration-snappy) group-data-pressed/tb:ease-sheen-snappy motion-ok:group-data-pressed/tb:scale-100",
                  )}
                />
              )}
              {toggleProps.children}
            </button>
          )}
        />
      }
    >
      {children}
    </BaseToolbar.Button>
  );
  return withTooltip(control, { tooltip, shortcut, tooltipSide }, orientation);
}

/* ---------- Structure ---------- */

/**
 * Props of `ToolbarGroup`: the Base UI `Toolbar.Group` props plus SheenUI's own options, each
 * documented on its field.
 */
export type ToolbarGroupProps = Omit<ComponentProps<typeof BaseToolbar.Group>, "className"> & { className?: string };

/**
 * A labelled cluster of controls (aria-label it, e.g. "History"). It keeps them together when the toolbar wraps.
 *
 * Keyboard: none of its own; controls inside keep the toolbar's roving focus. Accessibility: `role="group"`. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { ToolbarButton, ToolbarGroup } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const UndoIcon: () => React.JSX.Element;
 * declare const RedoIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <ToolbarGroup aria-label="History">
 *       <ToolbarButton tooltip="Undo"><UndoIcon /></ToolbarButton>
 *       <ToolbarButton tooltip="Redo"><RedoIcon /></ToolbarButton>
 *     </ToolbarGroup>
 *   );
 * }
 * ```
 *
 * @see /layout/toolbar
 */
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return (
    <BaseToolbar.Group
      data-slot="toolbar-group"
      className={cn("flex items-center gap-0.5 data-[orientation=vertical]:flex-col", className)}
      {...props}
    />
  );
}

/**
 * Props of `ToolbarSeparator`: the Base UI `Toolbar.Separator` props plus SheenUI's own options, each
 * documented on its field.
 */
export type ToolbarSeparatorProps = Omit<ComponentProps<typeof BaseToolbar.Separator>, "className"> & {
  className?: string;
};

/**
 * A hairline between clusters; vertical in a horizontal toolbar and vice versa. A separator that ends up at the edge of a wrapped row hides itself but keeps its space.
 *
 * Keyboard: none. Accessibility: `role="separator"` with the matching orientation. Glass and motion: a flat line, no motion.
 *
 * @example
 * ```tsx
 * import { ToolbarSeparator } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ToolbarSeparator />
 *   );
 * }
 * ```
 *
 * @see /layout/toolbar
 */
export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return (
    <BaseToolbar.Separator
      data-slot="toolbar-separator"
      className={cn(
        "shrink-0 self-center border-sheen-fg-subtle/35",
        "data-[orientation=vertical]:mx-1 data-[orientation=vertical]:h-5 data-[orientation=vertical]:border-s",
        "data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:w-5 data-[orientation=horizontal]:border-t",
        // Wrapped onto the edge of a row (see useRowEdgeSeparators): hide, keep the space.
        "data-row-edge:invisible",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Pushes what follows to the far end of the toolbar (a flexible, empty gap).
 *
 * Keyboard: none. Accessibility: `aria-hidden`. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { Toolbar, ToolbarButton, ToolbarLink, ToolbarSpacer } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Toolbar aria-label="Editor">
 *       <ToolbarButton>Save</ToolbarButton>
 *       <ToolbarSpacer />
 *       <ToolbarLink href="/history">Edited 2m ago</ToolbarLink>
 *     </Toolbar>
 *   );
 * }
 * ```
 *
 * @see /layout/toolbar
 */
export function ToolbarSpacer({ className }: { className?: string }) {
  return <div aria-hidden data-slot="toolbar-spacer" className={cn("min-w-2 flex-1", className)} />;
}

/**
 * Props of `ToolbarLink`: the Base UI `Toolbar.Link` props plus SheenUI's own options, each documented
 * on its field.
 */
export type ToolbarLinkProps = Omit<ComponentProps<typeof BaseToolbar.Link>, "className"> & { className?: string };

/**
 * A link in the toolbar's arrow-key order, e.g. "Edited 2m ago" linking to version history. Accepts every anchor prop (`href`, `target`, ...).
 *
 * Keyboard: reached by the arrow keys; Enter follows the link. Accessibility: a real `<a>`; 44px tall on touch screens. Glass and motion: the underline fades in on hover; no backdrop blur.
 *
 * @example
 * ```tsx
 * import { ToolbarLink } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ToolbarLink href="/history">Edited 2m ago</ToolbarLink>
 *   );
 * }
 * ```
 *
 * @see /layout/toolbar
 */
export function ToolbarLink({ className, ...props }: ToolbarLinkProps) {
  const { size } = useContext(ToolbarContext);
  return (
    <BaseToolbar.Link
      data-slot="toolbar-link"
      className={cn(
        "relative inline-flex shrink-0 items-center gap-1.5 rounded-sheen-sm px-2 whitespace-nowrap text-sheen-fg-muted",
        size === "sm" ? "h-8 text-xs" : "h-9 text-sm",
        "underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-(--sheen-duration-fast)",
        "hover:text-sheen-fg hover:decoration-sheen-fg-subtle",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
        "any-pointer-coarse:min-h-11",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Props of `ToolbarInput`: the Base UI `Toolbar.Input` props plus SheenUI's own options, each
 * documented on its field.
 */
export type ToolbarInputProps = Omit<ComponentProps<typeof BaseToolbar.Input>, "className"> & { className?: string };

/**
 * A text field in the toolbar (e.g. a search or a zoom value). Arrow keys move the caret inside it, so put at most one, as the last control. Accepts every input prop; give it an `aria-label`.
 *
 * Keyboard: reached by the arrow keys; inside it, Left/Right/Home/End move the caret and Tab leaves the toolbar. Accessibility: a native input with a 3:1 border; 16px text on touch screens so iOS does not zoom.
 * Glass and motion: flat field, border colour transition only.
 *
 * @example
 * ```tsx
 * import { ToolbarInput } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ToolbarInput aria-label="Search" placeholder="Search..." />
 *   );
 * }
 * ```
 *
 * @see /layout/toolbar
 */
export function ToolbarInput({ className, ...props }: ToolbarInputProps) {
  const { size } = useContext(ToolbarContext);
  return (
    <BaseToolbar.Input
      data-slot="toolbar-input"
      className={cn(
        // control-border: a >= 3:1 boundary against the toolbar glass (WCAG 1.4.11).
        "min-w-0 rounded-sheen-sm border border-sheen-control-border bg-sheen-hover px-2.5 text-sheen-fg placeholder:text-sheen-fg-subtle",
        "transition-[border-color] duration-(--sheen-duration-fast) hover:border-sheen-fg-muted",
        size === "sm" ? "h-8 w-32 text-xs" : "h-9 w-40 text-sm",
        // 16px text on touch screens, so iOS does not zoom in on focus.
        "any-pointer-coarse:min-h-11 any-pointer-coarse:text-base",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
        "data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** Props of {@link ToolbarSpacer}. Pushes what follows to the far end of the toolbar (a flexible, empty gap). */
export type ToolbarSpacerProps = ComponentProps<typeof ToolbarSpacer>;
