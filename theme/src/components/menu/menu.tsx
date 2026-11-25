"use client";

import { CheckIcon } from "../status-icons/icons";
import { useRef, type ComponentProps, type ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";

import { cn, classNameWith } from "../../lib/cn";
import { GlideHighlightScope, MenuHighlight } from "../../lib/glide-highlight";
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
import { defaultSubmenuName, usePopupA11yProps } from "../../lib/popup-a11y";
import { KbdShortcut, useShortcutPlatform } from "../kbd/kbd";
import { toAriaKeyShortcuts, type KbdLabels } from "../kbd/shortcut";

/**
 * Dropdown menu on Base UI Menu: arrow keys, Home/End, typeahead, submenus, Escape and focus return, plus menuitem / menuitemcheckbox / menuitemradio semantics. Use it for a list of actions
 * behind one button; use `Select` to choose a value and `Menubar` for an application menu bar. This is the root: it holds the open state (`open`, `defaultOpen`, `onOpenChange`) and renders no element.
 * Compose `MenuTrigger`, `MenuContent` and the items (`MenuItem`, `MenuLinkItem`, `MenuCheckboxItem`, `MenuRadioGroup` > `MenuRadioItem`, `MenuSub`, `MenuLabel`, `MenuSeparator`, `MenuHeader`).
 *
 * Keyboard: Enter, Space or ↓ on the trigger opens it (↑ opens with the last item highlighted); ↑ ↓ move, Home and End jump, typing jumps to a matching item, Enter or Space activates, → (← in RTL) opens a
 * submenu and ← closes it, Escape closes and returns focus to the trigger.
 * Accessibility: `role="menu"` with `menuitem`, `menuitemcheckbox` and `menuitemradio` items; shortcuts are exposed as `aria-keyshortcuts`; items are 44px tall on touch screens; the highlighted row becomes `Highlight` in forced colors.
 * Glass and motion: the `glass-3` popup itself springs in from the trigger (opacity + scale, never a wrapper, so the blur holds) and leaves faster with no overshoot. Items drift in one after another, and the highlight pill glides from item to
 * item, smoothly even while a long menu scrolls. Reduced motion: the popup only fades and the highlight jumps.
 *
 * On a phone-width screen (`max-width: 640px`) `mobile="sheet"` presents the menu as a bottom sheet: full width, a drag handle with
 * swipe-down to dismiss, height capped at 85 dvh with the items scrolling inside, home-indicator padding and a dimmed scrim; focus
 * moves in and returns, Escape closes. The default `"popup"` keeps the anchored menu. Submenus stay floating panels over the sheet.
 *
 * @example
 * ```tsx
 * import { Button, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Menu>
 *       <MenuTrigger render={<Button variant="glass" />}>Options</MenuTrigger>
 *       <MenuContent>
 *         <MenuItem shortcut="mod+e">Edit</MenuItem>
 *         <MenuSeparator />
 *         <MenuItem tone="danger">Delete</MenuItem>
 *       </MenuContent>
 *     </Menu>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function Menu<Payload = unknown>({ mobile = "popup", ...props }: MenuProps<Payload>) {
  const sheet = useSheetMode(mobile);
  const actionsRef = useSheetActionsRef(props.actionsRef);
  return (
    <SheetProvider value={sheet}>
      <SheetActionsProvider value={actionsRef}>
        <BaseMenu.Root {...props} actionsRef={actionsRef} />
      </SheetActionsProvider>
    </SheetProvider>
  );
}
/**
 * The element that opens a `Menu`. By default a `<button>`; use `render={<Button variant="glass" />}` for a SheenUI button, or pass a `handle` from `createMenuHandle()` for a trigger outside `<Menu>`.
 *
 * Keyboard: Enter, Space or ↓ opens the menu. Accessibility: gets `aria-haspopup="menu"` and `aria-expanded`. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { Button, MenuTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuTrigger render={<Button variant="glass" />}>Options</MenuTrigger>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export const MenuTrigger = BaseMenu.Trigger;
/**
 * Groups related items inside a menu; put a `MenuLabel` first to name it.
 *
 * Keyboard: none of its own. Accessibility: `role="group"` named by its `MenuLabel`. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { MenuGroup, MenuItem, MenuLabel } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuGroup>
 *       <MenuLabel>Share</MenuLabel>
 *       <MenuItem>Copy link</MenuItem>
 *     </MenuGroup>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuGroup(props: MenuGroupProps) {
  return <BaseMenu.Group data-slot="menu-group" {...props} />;
}
/**
 * Holds the chosen value of a set of `MenuRadioItem`s: controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`.
 *
 * Keyboard: ↑ ↓ move between the items; Enter or Space chooses one. Accessibility: `role="group"` of `menuitemradio` items. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { MenuLabel, MenuRadioGroup, MenuRadioItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuRadioGroup defaultValue="grid">
 *       <MenuLabel>View</MenuLabel>
 *       <MenuRadioItem value="grid">Grid</MenuRadioItem>
 *       <MenuRadioItem value="list">List</MenuRadioItem>
 *     </MenuRadioGroup>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuRadioGroup(props: MenuRadioGroupProps) {
  return <BaseMenu.RadioGroup data-slot="menu-radio-group" {...props} />;
}
/**
 * Wraps a `MenuSubTrigger` and its `MenuSubContent`. Renders no element.
 *
 * Keyboard: → (← in RTL) or Enter on the trigger opens it; ← or Escape closes it. Accessibility: the trigger gets `aria-haspopup="menu"`. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { MenuItem, MenuSub, MenuSubContent, MenuSubTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuSub>
 *       <MenuSubTrigger>Share</MenuSubTrigger>
 *       <MenuSubContent>
 *         <MenuItem>Email</MenuItem>
 *       </MenuSubContent>
 *     </MenuSub>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export const MenuSub = BaseMenu.SubmenuRoot;
/** For triggers that live outside <Menu>: `const handle = createMenuHandle()`. */
export const createMenuHandle = BaseMenu.createHandle;

/** Props of `Menu`: the Base UI `Menu.Root` props plus `mobile`. */
export type MenuProps<Payload = unknown> = BaseMenu.Root.Props<Payload> & {
  /**
   * How the menu opens on a phone-width screen (`max-width: 640px`): `"popup"` is the usual menu next to the trigger;
   * `"sheet"` is a bottom sheet with a drag handle, swipe-down to dismiss, scrolling items capped at 85 dvh and
   * home-indicator padding. Escape closes and focus returns to the trigger in both.
   *
   * @default "popup"
   */
  mobile?: MobilePresentation;
};
/** Props of `MenuTrigger`: the Base UI `Menu.Trigger` props, unchanged. */
export type MenuTriggerProps = ComponentProps<typeof BaseMenu.Trigger>;
/** Props of `MenuGroup`: the Base UI `Menu.Group` props, unchanged. */
export type MenuGroupProps = ComponentProps<typeof BaseMenu.Group>;
/** Props of `MenuRadioGroup`: the Base UI `Menu.RadioGroup` props, unchanged. */
export type MenuRadioGroupProps = ComponentProps<typeof BaseMenu.RadioGroup>;
/** Props of `MenuSub`: the Base UI `Menu.SubmenuRoot` props, unchanged. */
export type MenuSubProps = ComponentProps<typeof BaseMenu.SubmenuRoot>;

/* ---------- Shared highlight ---------- */

export { MenuHighlight, type MenuHighlightProps } from "../../lib/glide-highlight";

/* ---------- Popup ---------- */

/** Glass popup look + enter/exit, shared by dropdown, context and menubar menus. */
export const menuPopupClass = cn(
  "glass-3 max-h-(--available-height) min-w-52 max-w-[min(22rem,calc(100vw-2rem))] origin-(--transform-origin) overflow-y-auto overscroll-contain rounded-sheen-md p-1.5 text-sm outline-none [scrollbar-width:thin]",
  // The shared popup recipe (fade + 0.96 scale + 4px drift in, 100ms out); data-instant skips it.
  popupMotion,
  "data-instant:transition-none",
  // Items drift in one after another (sibling-index() where supported; all at once elsewhere).
  "motion-ok:[&>*]:animate-[sheen-item-in_var(--sheen-duration-base)_var(--sheen-ease-out)_both]",
  "motion-ok:[&>*]:[animation-delay:calc(min(sibling-index(),10)*14ms)]",
  "data-instant:[&>*]:animate-none",
);

/**
 * Props of `MenuContent`: the Base UI `Menu.Popup` props plus SheenUI's own options, each documented
 * on its field.
 */
export type MenuContentProps = ComponentProps<typeof BaseMenu.Popup> & {
  /** Preferred side of the trigger; it flips when there is no room. Default "bottom". */
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  /** Sets the alignment along that side. Default "start". */
  align?: "start" | "center" | "end";
  /** Gap between the trigger and the menu, in px (each part has its own default). */
  sideOffset?: number;
  /** Shift along the alignment axis, in px (each part has its own default). */
  alignOffset?: number;
  /** Space kept from the viewport edges, in px. Default 12. */
  collisionPadding?: number;
  /** Make the menu at least as wide as its trigger. Default false. */
  matchTriggerWidth?: boolean;
  /** Element to position against instead of the trigger. */
  anchor?: ComponentProps<typeof BaseMenu.Positioner>["anchor"];
  /** Classes for the positioner (the fixed element around the popup). */
  positionerClassName?: string;
  /** Spoken text. Merged over {@link defaultMenuLabels}. */
  labels?: Partial<MenuLabels>;
};

/** The spoken text of a menu. `submenu` names a nested popup (its positioner is a landmark region): level 1 is a first submenu. */
export type MenuLabels = {
  submenu: (level: number) => string;
  /** Accessible name of the sheet's handle, which closes the sheet (`mobile="sheet"`). */
  close: string;
};

/** English defaults of {@link MenuLabels} ("Submenu", "Submenu, level 2"). */
export const defaultMenuLabels: MenuLabels = {
  submenu: defaultSubmenuName,
  close: "Close",
};

/**
 * The glass popup of a `Menu`, portalled to the end of the body and positioned next to the trigger. `side`, `align`, `sideOffset`, `alignOffset` and `collisionPadding` place it (it flips and shifts to stay on screen);
 * `matchTriggerWidth` makes it at least as wide as the trigger; `anchor` positions it against another element; `positionerClassName` styles the fixed wrapper. Every other prop goes to the Base UI popup.
 *
 * Keyboard: see `Menu`. Accessibility: `role="menu"`; max height follows the space available and scrolls. Glass and motion: `glass-3` surface; spring-scale enter, quicker exit; items drift in; reduced motion fades only.
 *
 * @example
 * ```tsx
 * import { MenuContent, MenuItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuContent side="bottom" align="end" matchTriggerWidth>
 *       <MenuItem>Profile</MenuItem>
 *     </MenuContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuContent({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  alignOffset = 0,
  collisionPadding = 12,
  matchTriggerWidth = false,
  anchor,
  positionerClassName,
  labels,
  children,
  ref,
  ...props
}: MenuContentProps) {
  const a11y = usePopupA11yProps(labels?.submenu ?? defaultMenuLabels.submenu);
  const sheet = useIsSheet();
  const ownRef = useRef<HTMLDivElement>(null);
  const popupRef = useMergedRef(ref, ownRef);
  return (
    <BaseMenu.Portal>
      {sheet && <BaseMenu.Backdrop className={sheetBackdropClass} />}
      <BaseMenu.Positioner
        {...a11y}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        anchor={anchor}
        className={cn("z-50 outline-none", sheet && sheetPositionerClass, positionerClassName)}
      >
        <BaseMenu.Popup
          ref={popupRef}
          data-slot="menu-content"
          data-sheet={sheet ? "" : undefined}
          className={classNameWith(className, (extra) =>
            cn(
              sheet
                ? cn("glass-3 pt-1.5 text-sm [--sheen-sheet-pb:0.375rem] [--sheen-sheet-px:0.375rem]", sheetPopupClass)
                : menuPopupClass,
              !sheet && matchTriggerWidth && "min-w-(--anchor-width)",
              extra,
            ),
          )}
          {...props}
        >
          {sheet && <SheetHandle popupRef={ownRef} label={labels?.close ?? defaultMenuLabels.close} />}
          <GlideHighlightScope>{children}</GlideHighlightScope>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

/* ---------- Items ---------- */

/*
 * Windows High Contrast: the highlighted row becomes Highlight / HighlightText via .sheen-fill
 * (set from the render functions below). It also turns off the forced text backplate, which
 * would otherwise paint a Canvas box behind every label on the Highlight row.
 */
const itemBase = cn(
  "relative isolate flex min-h-9 cursor-default items-center gap-2.5 rounded-sheen-sm px-2.5 py-1.5 text-sm text-sheen-fg outline-none select-none any-pointer-coarse:min-h-11",
  "touch-manipulation [-webkit-tap-highlight-color:transparent]",
  "data-disabled:cursor-not-allowed data-disabled:opacity-45",
  "forced-colors:data-disabled:text-[GrayText] forced-colors:data-disabled:opacity-100",
);

/** Icon slot: keeps labels aligned whether or not an item has an icon. */
function Slot({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("flex size-4 shrink-0 items-center justify-center text-sheen-fg-muted [&>svg]:size-4", className)}
    >
      {children}
    </span>
  );
}

/** Label + optional second line. */
function Label({ children, description }: { children: ReactNode; description?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate">{children}</span>
      {description && <span className="truncate text-xs text-sheen-fg-muted">{description}</span>}
    </span>
  );
}

type ItemExtras = {
  /** Shows an icon before the label (decorative). */
  icon?: ReactNode;
  /** Shows the second line under the label. */
  description?: ReactNode;
  /**
   * Keyboard shortcut to show, e.g. "mod+c" (⌘C on a Mac, Ctrl+C elsewhere). It is also set
   * as aria-keyshortcuts. Showing it does not bind it: handle the key yourself.
   */
  shortcut?: string | readonly string[];
  /** Key names for the shortcut (i18n). */
  shortcutLabels?: Partial<KbdLabels>;
  /** Anything else at the end of the row (a badge, a count). */
  trailing?: ReactNode;
  /** Leave the icon slot empty so the label lines up with items that have icons. */
  inset?: boolean;
};

function Trailing({
  shortcut,
  shortcutLabels,
  trailing,
}: Pick<ItemExtras, "shortcut" | "shortcutLabels" | "trailing">) {
  if (!shortcut && !trailing) return null;
  return (
    <span className="ms-auto flex shrink-0 items-center gap-2 ps-3">
      {trailing}
      {shortcut && (
        <KbdShortcut keys={shortcut} variant="inline" announce={false} labels={shortcutLabels} aria-hidden />
      )}
    </span>
  );
}

function useAriaShortcut(shortcut: ItemExtras["shortcut"]) {
  const platform = useShortcutPlatform();
  return shortcut ? toAriaKeyShortcuts(shortcut, platform) : undefined;
}

/**
 * Props of `MenuItem`: the Base UI `Menu.Item` props plus SheenUI's own options, each documented on
 * its field.
 */
export type MenuItemProps = Omit<ComponentProps<typeof BaseMenu.Item>, "render"> &
  ItemExtras & {
    /** "danger" for destructive actions: red text and a red highlight. Default "neutral". */
    tone?: "neutral" | "danger";
  };

/**
 * One action in a menu. `icon` goes before the label, `description` is a second line, `shortcut` shows a platform-aware key combination (and sets `aria-keyshortcuts`; it does not bind the key: handle it yourself), `trailing`
 * holds a badge or count, `inset` leaves the icon slot empty so labels line up. `tone="danger"` is for destructive actions. Handle the action with `onClick`; the menu closes after it (set `closeOnClick={false}` to keep it open).
 *
 * Keyboard: highlighted with the arrow keys or by typing; Enter or Space activates. Accessibility: `role="menuitem"`; disabled items stay in the arrow-key order but cannot be activated. Glass and motion: the shared highlight pill glides to it; no backdrop blur of its own.
 *
 * @example
 * ```tsx
 * import { MenuItem } from "@sheenui/theme";
 *
 * const EditIcon = () => (
 *   <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
 *     <path d="M4 20h4L19 9l-4-4L4 16z" />
 *   </svg>
 * );
 * const edit = () => console.log("edit");
 *
 * export function Example() {
 *   return (
 *     <>
 *       <MenuItem icon={<EditIcon />} shortcut="mod+e" onClick={() => edit()}>Edit</MenuItem>
 *       <MenuItem tone="danger">Delete</MenuItem>
 *     </>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuItem({
  icon,
  description,
  shortcut,
  shortcutLabels,
  trailing,
  inset,
  tone = "neutral",
  className,
  children,
  ...props
}: MenuItemProps) {
  const aria = useAriaShortcut(shortcut);
  return (
    <BaseMenu.Item
      data-slot="menu-item"
      aria-keyshortcuts={aria}
      className={classNameWith(className, (extra) =>
        cn(itemBase, tone === "danger" && "text-sheen-danger-text", extra),
      )}
      render={(itemProps, state) => (
        <div {...itemProps} className={cn(itemProps.className, state.highlighted && "sheen-fill")}>
          <MenuHighlight active={state.highlighted} tone={tone} />
          {itemProps.children}
        </div>
      )}
      {...props}
    >
      {(Boolean(icon) || Boolean(inset)) && (
        <Slot className={tone === "danger" ? "text-current" : undefined}>{icon}</Slot>
      )}
      <Label description={description}>{children}</Label>
      <Trailing shortcut={shortcut} shortcutLabels={shortcutLabels} trailing={trailing} />
    </BaseMenu.Item>
  );
}

/**
 * Props of `MenuLinkItem`: the Base UI `Menu.LinkItem` props plus SheenUI's own options, each
 * documented on its field.
 */
export type MenuLinkItemProps = Omit<ComponentProps<typeof BaseMenu.LinkItem>, "render"> &
  Omit<ItemExtras, "shortcut" | "shortcutLabels">;

/**
 * A menu item that is a real link (`<a href>`): opens in a new tab with Cmd/Ctrl-click, shows the URL on hover. Takes `icon`, `description`, `trailing` and `inset` like `MenuItem`.
 *
 * Keyboard: Enter follows the link. Accessibility: a native anchor inside the menu; give it descriptive text. Glass and motion: the shared highlight pill glides to it.
 *
 * @example
 * ```tsx
 * import { MenuLinkItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuLinkItem href="/docs">Documentation</MenuLinkItem>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuLinkItem({ icon, description, trailing, inset, className, children, ...props }: MenuLinkItemProps) {
  return (
    <BaseMenu.LinkItem
      data-slot="menu-link-item"
      className={classNameWith(className, (extra) => cn(itemBase, "cursor-pointer", extra))}
      render={(itemProps, state) => (
        <a {...itemProps} className={cn(itemProps.className, state.highlighted && "sheen-fill")}>
          <MenuHighlight active={state.highlighted} />
          {itemProps.children}
        </a>
      )}
      {...props}
    >
      {(Boolean(icon) || Boolean(inset)) && <Slot>{icon}</Slot>}
      <Label description={description}>{children}</Label>
      {trailing && <span className="ms-auto flex shrink-0 items-center gap-2 ps-3">{trailing}</span>}
    </BaseMenu.LinkItem>
  );
}

/** Indicators pop in with a spring and leave quickly; under reduced motion they only fade. */
const indicatorMotion = cn(
  "flex items-center justify-center",
  "transition-[opacity,scale] duration-(--sheen-duration-snappy) ease-sheen-snappy",
  "data-starting-style:opacity-0 motion-ok:data-starting-style:scale-50",
  "data-ending-style:opacity-0 data-ending-style:duration-(--sheen-duration-exit) data-ending-style:ease-sheen-exit motion-ok:data-ending-style:scale-75",
);

/**
 * Props of `MenuCheckboxItem`: the Base UI `Menu.CheckboxItem` props plus SheenUI's own options, each
 * documented on its field.
 */
export type MenuCheckboxItemProps = Omit<ComponentProps<typeof BaseMenu.CheckboxItem>, "render"> &
  Omit<ItemExtras, "icon" | "inset">;

/**
 * A toggle (`menuitemcheckbox`). A check appears in the icon slot when on. Stays open on click by default. Controlled with `checked` + `onCheckedChange`, or uncontrolled with `defaultChecked`.
 *
 * Keyboard: Enter or Space toggles it. Accessibility: `role="menuitemcheckbox"` with `aria-checked`. Glass and motion: the check pops in with a spring and leaves quickly; reduced motion only fades.
 *
 * @example
 * ```tsx
 * import { MenuCheckboxItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuCheckboxItem defaultChecked>Show grid</MenuCheckboxItem>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuCheckboxItem({
  description,
  shortcut,
  shortcutLabels,
  trailing,
  className,
  children,
  ...props
}: MenuCheckboxItemProps) {
  const aria = useAriaShortcut(shortcut);
  return (
    <BaseMenu.CheckboxItem
      data-slot="menu-checkbox-item"
      aria-keyshortcuts={aria}
      className={classNameWith(className, (extra) => cn(itemBase, extra))}
      render={(itemProps, state) => (
        <div {...itemProps} className={cn(itemProps.className, state.highlighted && "sheen-fill")}>
          <MenuHighlight active={state.highlighted} />
          {itemProps.children}
        </div>
      )}
      {...props}
    >
      <Slot className="text-sheen-accent forced-colors:text-current">
        <BaseMenu.CheckboxItemIndicator className={indicatorMotion}>
          <CheckIcon className="size-3.5" />
        </BaseMenu.CheckboxItemIndicator>
      </Slot>
      <Label description={description}>{children}</Label>
      <Trailing shortcut={shortcut} shortcutLabels={shortcutLabels} trailing={trailing} />
    </BaseMenu.CheckboxItem>
  );
}

/**
 * Props of `MenuRadioItem`: the Base UI `Menu.RadioItem` props plus SheenUI's own options, each
 * documented on its field.
 */
export type MenuRadioItemProps = Omit<ComponentProps<typeof BaseMenu.RadioItem>, "render"> &
  Omit<ItemExtras, "icon" | "inset">;

/**
 * One choice in a `MenuRadioGroup` (`menuitemradio`). A dot marks the chosen one. Give it a `value`.
 *
 * Keyboard: Enter or Space chooses it. Accessibility: `role="menuitemradio"` with `aria-checked`. Glass and motion: the dot pops in with a spring; reduced motion only fades.
 *
 * @example
 * ```tsx
 * import { MenuRadioItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuRadioItem value="list">List</MenuRadioItem>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuRadioItem({
  description,
  shortcut,
  shortcutLabels,
  trailing,
  className,
  children,
  ...props
}: MenuRadioItemProps) {
  const aria = useAriaShortcut(shortcut);
  return (
    <BaseMenu.RadioItem
      data-slot="menu-radio-item"
      aria-keyshortcuts={aria}
      className={classNameWith(className, (extra) => cn(itemBase, extra))}
      render={(itemProps, state) => (
        <div {...itemProps} className={cn(itemProps.className, state.highlighted && "sheen-fill")}>
          <MenuHighlight active={state.highlighted} />
          {itemProps.children}
        </div>
      )}
      {...props}
    >
      <Slot className="text-sheen-accent forced-colors:text-current">
        <BaseMenu.RadioItemIndicator className={indicatorMotion}>
          {/* currentColor fill (not a background), so it follows the text colour in high contrast too. */}
          <svg aria-hidden viewBox="0 0 8 8" className="size-2">
            <circle cx="4" cy="4" r="4" fill="currentColor" />
          </svg>
        </BaseMenu.RadioItemIndicator>
      </Slot>
      <Label description={description}>{children}</Label>
      <Trailing shortcut={shortcut} shortcutLabels={shortcutLabels} trailing={trailing} />
    </BaseMenu.RadioItem>
  );
}

/* ---------- Structure ---------- */

/**
 * Props of `MenuLabel`: the Base UI `Menu.GroupLabel` props plus SheenUI's own options, each
 * documented on its field.
 */
export type MenuLabelProps = ComponentProps<typeof BaseMenu.GroupLabel> & {
  /**
   * Indent to line up with item labels that sit after an icon.
   * @default false
   */
  inset?: boolean;
};

/**
 * Heading for a `MenuGroup` or `MenuRadioGroup` (place it inside the group). `inset` indents it to line up with item labels that sit after an icon.
 *
 * Keyboard: none, it is not focusable. Accessibility: names its group. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { MenuLabel } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuLabel>Account</MenuLabel>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuLabel({ className, inset, ...props }: MenuLabelProps) {
  return (
    <BaseMenu.GroupLabel
      data-slot="menu-label"
      className={classNameWith(className, (extra) =>
        cn(
          "px-2.5 pt-2 pb-1 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase select-none",
          inset && "ps-9",
          extra,
        ),
      )}
      {...props}
    />
  );
}

/** Props of `MenuSeparator`: the Base UI `Menu.Separator` props, unchanged. */
export type MenuSeparatorProps = ComponentProps<typeof BaseMenu.Separator>;

/**
 * A hairline between groups of items.
 *
 * Keyboard: skipped by the arrow keys. Accessibility: `role="separator"`; visible in forced colors. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { MenuSeparator } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuSeparator />
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <BaseMenu.Separator
      data-slot="menu-separator"
      className={classNameWith(className, (extra) =>
        cn("mx-1.5 my-1.5 h-px bg-sheen-border forced-colors:bg-[CanvasText]", extra),
      )}
      {...props}
    />
  );
}

/** Props of `MenuHeader`: the native `<div>` props, unchanged. */
export type MenuHeaderProps = ComponentProps<"div">;

/**
 * A non-interactive header row, e.g. the signed-in account above an account menu. A plain `div`: put an avatar and two lines of text inside.
 *
 * Keyboard: skipped by the arrow keys. Accessibility: plain content, no role. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { Avatar, MenuHeader } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuHeader>
 *       <Avatar name="Ada Lovelace" />
 *       <span>ada@example.com</span>
 *     </MenuHeader>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuHeader({ className, ...props }: MenuHeaderProps) {
  return (
    <div data-slot="menu-header" className={cn("flex items-center gap-3 px-2.5 pt-2 pb-2.5", className)} {...props} />
  );
}

/* ---------- Submenus ---------- */

function ChevronIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4 rtl:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/**
 * Props of `MenuSubTrigger`: the Base UI `Menu.SubmenuTrigger` props plus SheenUI's own options, each
 * documented on its field.
 */
export type MenuSubTriggerProps = Omit<ComponentProps<typeof BaseMenu.SubmenuTrigger>, "render"> &
  Omit<ItemExtras, "shortcut" | "shortcutLabels">;

/**
 * The item that opens a submenu: hover, click, → (← in RTL) or Enter. Takes `icon`, `description`, `trailing` and `inset` like `MenuItem`; a chevron is added.
 *
 * Keyboard: → or Enter opens the submenu, ← or Escape closes it. Accessibility: `aria-haspopup="menu"` and `aria-expanded`. Glass and motion: while its submenu is open and focus is inside it, the trigger keeps a resting tint.
 *
 * @example
 * ```tsx
 * import { MenuSubTrigger } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const ShareIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <MenuSubTrigger icon={<ShareIcon />}>Share</MenuSubTrigger>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuSubTrigger({
  icon,
  description,
  trailing,
  inset,
  className,
  children,
  ...props
}: MenuSubTriggerProps) {
  return (
    <BaseMenu.SubmenuTrigger
      data-slot="menu-sub-trigger"
      // While its submenu is open and focus is inside it, the trigger keeps a resting tint.
      className={classNameWith(className, (extra) =>
        cn(itemBase, "data-popup-open:not-data-highlighted:bg-sheen-hover", extra),
      )}
      render={(itemProps, state) => (
        <div {...itemProps} className={cn(itemProps.className, state.highlighted && "sheen-fill")}>
          <MenuHighlight active={state.highlighted} />
          {itemProps.children}
        </div>
      )}
      {...props}
    >
      {(Boolean(icon) || Boolean(inset)) && <Slot>{icon}</Slot>}
      <Label description={description}>{children}</Label>
      <span className="ms-auto flex shrink-0 items-center gap-2 ps-3 text-sheen-fg-muted">
        {trailing}
        <ChevronIcon />
      </span>
    </BaseMenu.SubmenuTrigger>
  );
}

/**
 * Props of `MenuSubContent`: the props of `MenuContent` minus the ones it sets itself, plus its own
 * options.
 */
export type MenuSubContentProps = Omit<MenuContentProps, "side" | "align" | "matchTriggerWidth">;

/**
 * The submenu popup. Opens beside its trigger, with its first item level with the trigger. Takes the `MenuContent` props except `side`, `align` and `matchTriggerWidth`.
 *
 * Keyboard: ↑ ↓ move, ← or Escape closes. Accessibility: `role="menu"`. Glass and motion: same glass popup and spring as `MenuContent`; its highlight never glides in from the parent menu.
 *
 * @example
 * ```tsx
 * import { MenuItem, MenuSubContent } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenuSubContent>
 *       <MenuItem>Email</MenuItem>
 *       <MenuItem>Copy link</MenuItem>
 *     </MenuSubContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuSubContent({ sideOffset = 4, alignOffset = -6, ...props }: MenuSubContentProps) {
  return <MenuContent side="inline-end" align="start" sideOffset={sideOffset} alignOffset={alignOffset} {...props} />;
}
