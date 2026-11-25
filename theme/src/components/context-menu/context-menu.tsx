"use client";

import { useRef, type ComponentProps } from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";

import { cn, classNameWith } from "../../lib/cn";
import { defaultMenuLabels, MenuContent, type MenuContentProps } from "../menu/menu";

/**
 * Context menu: right-click, long-press (touch, 500ms) or Shift+F10 / the Menu key on a
 * focused trigger. The popup and every item are the dropdown menu's parts, so a context
 * menu and a "⋯" button can share one list of actions:
 *
 *   <ContextMenu>
 *     <ContextMenuTrigger tabIndex={0} aria-label="Photo, press Shift+F10 for actions">…</ContextMenuTrigger>
 *     <ContextMenuContent>
 *       <MenuItem shortcut="mod+d">Duplicate</MenuItem>
 *     </ContextMenuContent>
 *   </ContextMenu>
 *
 * A context menu is a shortcut, never the only way to reach an action: show the same
 * actions in a visible menu button too.
 */

/**
 * Root of a context menu: holds the open state for a {@link ContextMenuTrigger} and its
 * {@link ContextMenuContent}. It is Base UI's `ContextMenu.Root` as is (`open`, `defaultOpen`,
 * `onOpenChange`, `disabled`). The items inside are the dropdown menu's parts.
 *
 * Keyboard: Right-click, long-press (touch, 500 ms), Shift+F10 or the Menu key on a focused trigger opens it; then arrow keys, Home / End, typeahead, Enter and Escape work as in any menu.
 * Accessibility: A context menu is a shortcut, never the only way to reach an action: show the same actions in a visible menu button too.
 *
 * @example
 * ```tsx
 * import { ContextMenu, ContextMenuContent, ContextMenuTrigger, MenuItem } from "@sheenui/theme";
 *
 * export const Photo = () => (
 *   <ContextMenu>
 *     <ContextMenuTrigger tabIndex={0} aria-label="Photo, press Shift+F10 for actions">
 *       <img src="/photo.jpg" alt="Sunset" />
 *     </ContextMenuTrigger>
 *     <ContextMenuContent>
 *       <MenuItem>Duplicate</MenuItem>
 *       <MenuItem>Delete</MenuItem>
 *     </ContextMenuContent>
 *   </ContextMenu>
 * );
 * ```
 *
 * @see /overlays/context-menu
 */
export const ContextMenu = BaseContextMenu.Root;

/** Props of {@link ContextMenu}. Base UI's `ContextMenu.Root` props. */
export type ContextMenuProps = ComponentProps<typeof BaseContextMenu.Root>;

/** Props of {@link ContextMenuTrigger}. The attributes of a `div` plus Base UI's trigger props (`render`, `disabled`). */
export type ContextMenuTriggerProps = ComponentProps<typeof BaseContextMenu.Trigger>;

/**
 * The area that opens the menu. Make it focusable (tabIndex={0}) when it isn't already a
 * control, so keyboard users can open the menu with Shift+F10 or the Menu key.
 *
 * Keyboard: Shift+F10 or the Menu key opens the menu at the focused element (just inside its top-left corner); the browser's own duplicate context-menu event is swallowed so it cannot move the open menu.
 * Accessibility: Give the trigger an accessible name that mentions the shortcut. Text selection and the iOS callout are disabled so a long press opens the menu instead.
 *
 * @example
 * ```tsx
 * import { ContextMenu, ContextMenuContent, ContextMenuTrigger, MenuItem } from "@sheenui/theme";
 *
 * export const Area = () => (
 *   <ContextMenu>
 *     <ContextMenuTrigger tabIndex={0} className="rounded-sheen-lg p-8" aria-label="Notes area, press Shift+F10 for actions">
 *       Right-click anywhere here
 *     </ContextMenuTrigger>
 *     <ContextMenuContent>
 *       <MenuItem>Paste</MenuItem>
 *     </ContextMenuContent>
 *   </ContextMenu>
 * );
 * ```
 *
 * @see /overlays/context-menu
 */
export function ContextMenuTrigger({
  className,
  onKeyDown,
  onKeyUp,
  onContextMenuCapture,
  ...props
}: ContextMenuTriggerProps) {
  /*
   * After a keyboard open, Windows and Linux browsers can still fire their own contextmenu
   * event for the same key press (on keyup for the Menu key). It would re-anchor the open
   * menu at the browser's guess, so it is swallowed until shortly after the key comes up.
   */
  const suppressNativeUntil = useRef(0);

  const handleKeyDown: ContextMenuTriggerProps["onKeyDown"] = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const viaKeyboard = event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
    if (!viaKeyboard) return;
    // Browsers place a keyboard-opened context menu at (0, 0) or at a guess. Open it at the
    // focused element instead: just inside its top-left corner.
    event.preventDefault();
    suppressNativeUntil.current = performance.now() + 1000;
    const target =
      document.activeElement instanceof HTMLElement && event.currentTarget.contains(document.activeElement)
        ? document.activeElement
        : event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + Math.min(16, rect.width / 2),
        clientY: rect.top + Math.min(24, rect.height / 2),
      }),
    );
  };

  const handleKeyUp: ContextMenuTriggerProps["onKeyUp"] = (event) => {
    onKeyUp?.(event);
    if (event.key === "ContextMenu" || event.key === "F10") {
      // The native event, if any, follows the keyup immediately.
      suppressNativeUntil.current = Math.min(suppressNativeUntil.current, performance.now() + 150);
    }
  };

  const handleContextMenuCapture: ContextMenuTriggerProps["onContextMenuCapture"] = (event) => {
    onContextMenuCapture?.(event);
    if (event.nativeEvent.isTrusted && performance.now() < suppressNativeUntil.current) {
      suppressNativeUntil.current = 0;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <BaseContextMenu.Trigger
      data-slot="context-menu-trigger"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenuCapture={handleContextMenuCapture}
      className={classNameWith(className, (extra) =>
        cn(
          "select-none [-webkit-touch-callout:none]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          extra,
        ),
      )}
      {...props}
    />
  );
}

/** Props of {@link ContextMenuContent}. The dropdown `MenuContentProps` minus `matchTriggerWidth` and `anchor` (it opens at the pointer). `side` defaults to "bottom", `align` to "start", `sideOffset` to 2. */
export type ContextMenuContentProps = Omit<MenuContentProps, "matchTriggerWidth" | "anchor" | "labels"> & {
  /**
   * Spoken text: `menu` names the popup (it is announced when the menu opens) and `submenu` names a nested popup.
   * Merged over {@link defaultContextMenuLabels}.
   *
   * @default defaultContextMenuLabels
   */
  labels?: Partial<ContextMenuLabels>;
};

/** The spoken text of a context menu. */
export type ContextMenuLabels = {
  /** The accessible name of the popup. */
  menu: string;
  /** Names a nested popup (level 1 is a first submenu). */
  submenu: (level: number) => string;
};

/** English defaults of {@link ContextMenuLabels}: the popup is "Context menu (Shift+F10)". */
export const defaultContextMenuLabels: ContextMenuLabels = {
  menu: "Context menu (Shift+F10)",
  submenu: defaultMenuLabels.submenu,
};

/**
 * The menu popup. It opens at the pointer (or the press point), flipping to stay on screen.
 * Put {@link MenuItem}s (and the other menu parts) inside; it is the dropdown menu's popup.
 *
 * Keyboard: Arrow keys move, Home / End jump, typeahead finds items, Enter runs one, Escape closes and returns focus to the trigger.
 * Accessibility: `role="menu"` with `menuitem` children; focus moves into the menu on open.
 * Glass: The same glass surface as the dropdown menu popup (one backdrop blur).
 * Motion: The same entrance and exit as the dropdown menu; reduced motion keeps a fade.
 *
 * @example
 * ```tsx
 * import { ContextMenu, ContextMenuContent, ContextMenuTrigger, MenuItem } from "@sheenui/theme";
 *
 * export const Popup = () => (
 *   <ContextMenu>
 *     <ContextMenuTrigger tabIndex={0}>Right-click me</ContextMenuTrigger>
 *     <ContextMenuContent side="right" align="start">
 *       <MenuItem>Rename</MenuItem>
 *     </ContextMenuContent>
 *   </ContextMenu>
 * );
 * ```
 *
 * @see /overlays/context-menu
 */
export function ContextMenuContent({
  side = "bottom",
  align = "start",
  sideOffset = 2,
  labels,
  ...props
}: ContextMenuContentProps) {
  return (
    <MenuContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      aria-label={labels?.menu ?? defaultContextMenuLabels.menu}
      labels={{ submenu: labels?.submenu ?? defaultContextMenuLabels.submenu }}
      {...props}
    />
  );
}
