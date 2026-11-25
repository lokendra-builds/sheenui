"use client";

import type { ComponentProps, ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";

import { cn, classNameWith } from "../lib/cn";
import { popupMotion } from "../lib/popup-motion";
import { popupA11yProps } from "../lib/popup-a11y";

/**
 * Glass menu parts used by DataTable (row actions, faceted filters, the View menu).
 * Base UI Menu gives arrow-key navigation, typeahead, Escape/Tab handling and
 * menuitem / menuitemcheckbox / menuitemradio semantics.
 */

/**
 * Keyboard: Arrow keys, Home / End and typeahead move; Enter runs an item; Escape closes.
 * Accessibility: `menu`, `menuitem`, `menuitemcheckbox` and `menuitemradio` semantics come from Base UI.
 *
 * @internal Root of a DataTable menu (row actions, faceted filters, the View menu): Base UI's `Menu.Root` as is (`open`, `onOpenChange`, ...).
 *
 * @example
 * ```tsx
 * import { DataMenu, DataMenuContent, DataMenuItem, DataMenuTrigger } from "./menu";
 *
 * export const Actions = () => (
 *   <DataMenu>
 *     <DataMenuTrigger>Actions</DataMenuTrigger>
 *     <DataMenuContent>
 *       <DataMenuItem>Edit</DataMenuItem>
 *     </DataMenuContent>
 *   </DataMenu>
 * );
 * ```
 *
 * @see /components/data-table
 */
export const DataMenu = Menu.Root;
/**
 * Keyboard: Enter, Space or Down opens the menu.
 * Accessibility: Exposes `aria-haspopup="menu"` and `aria-expanded`; give an icon-only trigger an `aria-label`.
 *
 * @internal The button that opens a {@link DataMenu} (Base UI `Menu.Trigger`, a native button; use `render` to style it).
 *
 * @example
 * ```tsx
 * import { DataMenu, DataMenuContent, DataMenuTrigger } from "./menu";
 *
 * export const Open = () => (
 *   <DataMenu>
 *     <DataMenuTrigger aria-label="Row actions">...</DataMenuTrigger>
 *     <DataMenuContent>{null}</DataMenuContent>
 *   </DataMenu>
 * );
 * ```
 *
 * @see /components/data-table
 */
export const DataMenuTrigger = Menu.Trigger;
/**
 * Accessibility: Renders `role="group"` named by its label.
 *
 * @internal Groups related items inside a {@link DataMenuContent} (Base UI `Menu.Group`); pair it with a {@link DataMenuLabel}.
 *
 * @example
 * ```tsx
 * import { DataMenuGroup, DataMenuItem, DataMenuLabel } from "./menu";
 *
 * export const Section = () => (
 *   <DataMenuGroup>
 *     <DataMenuLabel>Status</DataMenuLabel>
 *     <DataMenuItem>Active</DataMenuItem>
 *   </DataMenuGroup>
 * );
 * ```
 *
 * @see /components/data-table
 */
export const DataMenuGroup = Menu.Group;
/**
 * Keyboard: Arrow keys move; Enter or Space selects an item.
 * Accessibility: `role="group"` of `menuitemradio` items.
 *
 * @internal A group of mutually exclusive {@link DataMenuRadioItem}s (Base UI `Menu.RadioGroup`: `value`, `onValueChange`).
 *
 * @example
 * ```tsx
 * import { DataMenuRadioGroup, DataMenuRadioItem } from "./menu";
 *
 * export const Density = () => (
 *   <DataMenuRadioGroup value="compact">
 *     <DataMenuRadioItem value="compact">Compact</DataMenuRadioItem>
 *     <DataMenuRadioItem value="comfortable">Comfortable</DataMenuRadioItem>
 *   </DataMenuRadioGroup>
 * );
 * ```
 *
 * @see /components/data-table
 */
export const DataMenuRadioGroup = Menu.RadioGroup;

/**
 * Keyboard: The popup is focusable so a long menu can scroll from the keyboard; Tab still closes it (no extra tab stop).
 * Accessibility: Keeps 12px from the viewport edges and never grows past the available height.
 * Glass: One `glass-3` surface (a single backdrop blur).
 * Motion: Fades and scales in from the trigger; the exit is shorter. Reduced motion drops the scale.
 *
 * @internal The glass popup of a {@link DataMenu}. Props: `side` ("top" | "bottom" | "left" | "right", default "bottom"), `align` ("start" | "center" | "end", default "start"), `className`, plus Base UI popup props.
 *
 * @example
 * ```tsx
 * import { DataMenu, DataMenuContent, DataMenuItem, DataMenuTrigger } from "./menu";
 *
 * export const Popup = () => (
 *   <DataMenu>
 *     <DataMenuTrigger>View</DataMenuTrigger>
 *     <DataMenuContent side="bottom" align="end">
 *       <DataMenuItem>Columns</DataMenuItem>
 *     </DataMenuContent>
 *   </DataMenu>
 * );
 * ```
 *
 * @see /components/data-table
 */
export function DataMenuContent({
  className,
  side = "bottom",
  align = "start",
  children,
  ...props
}: ComponentProps<typeof Menu.Popup> & {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        {...popupA11yProps}
        side={side}
        align={align}
        sideOffset={6}
        collisionPadding={12}
        className="z-50 outline-none"
      >
        <Menu.Popup
          // Focusable so a popup that scrolls (long View menu on a phone) can be scrolled from the keyboard.
          // Tab still closes the menu, so this adds no tab stop.
          tabIndex={0}
          className={classNameWith(className, (extra) =>
            cn(
              "glass-3 max-h-(--available-height) min-w-48 max-w-[calc(100vw-1.5rem)] origin-(--transform-origin) overflow-y-auto overscroll-contain rounded-sheen-md p-1 text-sm outline-none",
              popupMotion,
              extra,
            ),
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

const itemBase = cn(
  "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-sheen-sm px-2.5 py-2 outline-none select-none any-pointer-coarse:min-h-11",
  "data-highlighted:bg-sheen-hover data-disabled:cursor-not-allowed data-disabled:opacity-45",
  // High contrast: the highlighted row is a Highlight bar with HighlightText, like a native menu.
  // forced-color-adjust: none stops the browser painting Canvas backplates behind the labels
  // (which left "holes" in the bar); every child then follows the row's colours explicitly.
  "forced-colors:data-highlighted:forced-color-adjust-none forced-colors:data-highlighted:bg-[Highlight] forced-colors:data-highlighted:text-[HighlightText]",
  "forced-colors:data-highlighted:**:text-[HighlightText]",
);

/**
 * Keyboard: Enter or Space runs it; arrow keys move between items.
 * Accessibility: `menuitem`; touch rows are at least 44px tall; the danger tone also changes the text, not just the hover colour. Forced colors draw the highlighted row as a Highlight bar.
 *
 * @internal A plain menu row. Props: `tone` ("neutral" | "danger", default "neutral"), `icon` (decorative, before the label), `className`, plus Base UI `Menu.Item` props (`onClick`, `disabled`, `closeOnClick`).
 *
 * @example
 * ```tsx
 * import { DataMenuItem } from "./menu";
 *
 * export const Delete = () => <DataMenuItem tone="danger">Delete row</DataMenuItem>;
 * ```
 *
 * @see /components/data-table
 */
export function DataMenuItem({
  tone = "neutral",
  icon,
  className,
  children,
  ...props
}: ComponentProps<typeof Menu.Item> & { tone?: "neutral" | "danger"; icon?: ReactNode }) {
  return (
    <Menu.Item
      className={classNameWith(className, (extra) =>
        cn(
          itemBase,
          tone === "danger" ? "text-sheen-danger-text data-highlighted:bg-sheen-danger-soft" : "text-sheen-fg",
          extra,
        ),
      )}
      {...props}
    >
      {icon && (
        <span aria-hidden className="flex size-4 shrink-0 items-center justify-center opacity-80">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </Menu.Item>
  );
}

function Check() {
  return (
    // Hidden by visibility (not a transparent colour) while unchecked: forced colours would repaint
    // a transparent stroke and make an unchecked box look checked.
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="invisible size-3.5 in-data-checked:visible"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/**
 * Keyboard: Enter or Space toggles it; the menu stays open.
 * Accessibility: `menuitemcheckbox` with `aria-checked`; the unchecked box keeps a 3:1 border and forced colors invert it on the highlighted row.
 *
 * @internal Checkbox item: a glass box that fills with the accent when checked. Props: `trailing` (content at the row's end), `className`, plus Base UI `Menu.CheckboxItem` props (`checked`, `onCheckedChange`).
 *
 * @example
 * ```tsx
 * import { DataMenuCheckboxItem } from "./menu";
 *
 * export const Column = () => <DataMenuCheckboxItem checked onCheckedChange={() => undefined}>Email</DataMenuCheckboxItem>;
 * ```
 *
 * @see /components/data-table
 */
export function DataMenuCheckboxItem({
  className,
  children,
  trailing,
  ...props
}: ComponentProps<typeof Menu.CheckboxItem> & { trailing?: ReactNode }) {
  return (
    <Menu.CheckboxItem className={classNameWith(className, (extra) => cn(itemBase, "text-sheen-fg", extra))} {...props}>
      <span
        aria-hidden
        className={cn(
          // Unchecked, the box's edge is its only cue: the >= 3:1 control boundary (WCAG 1.4.11).
          "glass-1 flex size-4 shrink-0 items-center justify-center rounded-[0.3rem] border-sheen-control-border text-transparent",
          "in-data-checked:border-transparent in-data-checked:text-sheen-accent-fg in-data-checked:[background-image:var(--sheen-accent-fill)]",
          // High contrast (`!` beats glass.css's unlayered Canvas fallback): a CanvasText box; checked fills
          // with Highlight. On the highlighted (Highlight) row the box inverts so it never melts into the bar.
          "forced-colors:in-data-checked:border-[Highlight]! forced-colors:in-data-checked:bg-[Highlight]! forced-colors:in-data-checked:text-[HighlightText]!",
          "forced-colors:in-data-highlighted:border-[HighlightText]! forced-colors:in-data-highlighted:bg-[Highlight]!",
          "forced-colors:[[data-highlighted][data-checked]_&]:bg-[HighlightText]! forced-colors:[[data-highlighted][data-checked]_&]:text-[Highlight]!",
          // The check mark follows the box's colour, not the row's.
          "forced-colors:**:text-inherit!",
        )}
      >
        <Check />
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </Menu.CheckboxItem>
  );
}

/**
 * Keyboard: Enter or Space selects it.
 * Accessibility: `menuitemradio` with `aria-checked`; the dot is hidden from screen readers and replaced by a system-coloured dot in forced colors.
 *
 * @internal One choice in a {@link DataMenuRadioGroup} (Base UI `Menu.RadioItem`: `value`, `disabled`), with an accent dot when selected.
 *
 * @example
 * ```tsx
 * import { DataMenuRadioGroup, DataMenuRadioItem } from "./menu";
 *
 * export const Pick = () => (
 *   <DataMenuRadioGroup value="a">
 *     <DataMenuRadioItem value="a">First</DataMenuRadioItem>
 *   </DataMenuRadioGroup>
 * );
 * ```
 *
 * @see /components/data-table
 */
export function DataMenuRadioItem({ className, children, ...props }: ComponentProps<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem className={classNameWith(className, (extra) => cn(itemBase, "text-sheen-fg", extra))} {...props}>
      <span aria-hidden className="flex size-4 shrink-0 items-center justify-center text-sheen-accent">
        <Menu.RadioItemIndicator>
          {/* forced-colors: a system-coloured dot (a currentColor background would be forced to Canvas). */}
          <span className="block size-2 rounded-full bg-current forced-colors:bg-[CanvasText] forced-colors:in-data-highlighted:bg-[HighlightText]" />
        </Menu.RadioItemIndicator>
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </Menu.RadioItem>
  );
}

/**
 * Accessibility: Names its group for screen readers; it is not focusable.
 *
 * @internal A small uppercase heading for a {@link DataMenuGroup} (Base UI `Menu.GroupLabel`).
 *
 * @example
 * ```tsx
 * import { DataMenuLabel } from "./menu";
 *
 * export const Heading = () => <DataMenuLabel>Columns</DataMenuLabel>;
 * ```
 *
 * @see /components/data-table
 */
export function DataMenuLabel({ className, ...props }: ComponentProps<typeof Menu.GroupLabel>) {
  return (
    <Menu.GroupLabel
      className={classNameWith(className, (extra) =>
        cn(
          "px-2.5 pt-2 pb-1 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase select-none",
          extra,
        ),
      )}
      {...props}
    />
  );
}

/**
 * Accessibility: Rendered as a `separator`; skipped by arrow-key navigation.
 *
 * @internal A hairline between menu sections. Takes `className`.
 *
 * @example
 * ```tsx
 * import { DataMenuItem, DataMenuSeparator } from "./menu";
 *
 * export const Parts = () => (
 *   <>
 *     <DataMenuItem>Edit</DataMenuItem>
 *     <DataMenuSeparator />
 *     <DataMenuItem tone="danger">Delete</DataMenuItem>
 *   </>
 * );
 * ```
 *
 * @see /components/data-table
 */
export function DataMenuSeparator({ className }: { className?: string }) {
  return <Menu.Separator className={cn("mx-1 my-1 h-px bg-sheen-border", className)} />;
}
