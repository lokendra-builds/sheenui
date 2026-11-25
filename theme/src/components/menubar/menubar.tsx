"use client";

import { createContext, useCallback, useContext, useId, type ComponentProps } from "react";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { motion } from "motion/react";

import { cn, classNameWith } from "../../lib/cn";
import { useMergedRef } from "../../lib/form";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { spring } from "../../motion/tokens";
import { MenuContent, type MenuContentProps } from "../menu/menu";

const BarContext = createContext<string | null>(null);

/** Props of `Menubar`: the Base UI `Menubar` props, unchanged. */
export type MenubarProps = ComponentProps<typeof BaseMenubar>;

/**
 * Application menu bar (File · Edit · View) on Base UI Menubar. Use it for desktop-style apps with
 * many commands; for one menu use `Menu`. Compose `MenubarMenu` > `MenubarTrigger` + `MenubarContent`.
 * Items are the dropdown menu's parts (MenuItem, MenuCheckboxItem, MenuSub...). `className` goes on the
 * bar; `orientation` ("horizontal" by default, or "vertical") and other Base UI Menubar props pass through.
 *
 * Keyboard: Tab reaches the bar once; ← → move between menus (and, while one is open,
 * switch the open menu); ↓, Enter or Space open one; Escape closes it and returns focus to
 * its trigger. With the pointer, once a menu is open, hovering a neighbour opens that one.
 * Accessibility: `role="menubar"`, with `aria-expanded` and `aria-haspopup` on the triggers; triggers are
 * 44px tall on touch screens and the bar scrolls sideways instead of wrapping on narrow screens.
 * Glass and motion: `glass-2` bar. The open menu's tint glides between triggers (a shared layout
 * animation); reduced motion: it jumps. The tint is hidden in forced colors.
 *
 * @example
 * ```tsx
 * import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger, MenuItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Menubar>
 *       <MenubarMenu>
 *         <MenubarTrigger>File</MenubarTrigger>
 *         <MenubarContent>
 *           <MenuItem shortcut="mod+n">New note</MenuItem>
 *         </MenubarContent>
 *       </MenubarMenu>
 *     </Menubar>
 *   );
 * }
 * ```
 *
 * @see /overlays/menubar
 */
export function Menubar({ className, ...props }: MenubarProps) {
  const id = useId();
  return (
    <BarContext value={`${id}-open`}>
      <BaseMenubar
        data-slot="menubar"
        className={classNameWith(className, (extra) =>
          cn(
            "glass-2 flex max-w-full items-center gap-0.5 overflow-x-auto rounded-sheen-md p-1 [scrollbar-width:none]",
            "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
            extra,
          ),
        )}
        {...props}
      />
    </BarContext>
  );
}

/**
 * One menu in the bar: holds the open state of a `MenubarTrigger` and its `MenubarContent`. Renders no element.
 *
 * Keyboard and accessibility: see `Menubar`. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { MenubarContent, MenubarMenu, MenubarTrigger, MenuItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenubarMenu>
 *       <MenubarTrigger>Edit</MenubarTrigger>
 *       <MenubarContent>
 *         <MenuItem>Undo</MenuItem>
 *       </MenubarContent>
 *     </MenubarMenu>
 *   );
 * }
 * ```
 *
 * @see /overlays/menubar
 */
export const MenubarMenu = BaseMenu.Root;
/** Props of `MenubarMenu`: the Base UI `Menu.Root` props, unchanged. */
export type MenubarMenuProps = ComponentProps<typeof BaseMenu.Root>;

/** Props of `MenubarTrigger`: the Base UI `Menu.Trigger` props minus the ones it sets itself. */
export type MenubarTriggerProps = Omit<ComponentProps<typeof BaseMenu.Trigger>, "render">;

/**
 * The bar button that opens one menu (File, Edit, ...). Its text is the menu's name.
 *
 * Keyboard: ← → move to the neighbouring trigger; ↓, Enter or Space open the menu; Escape closes it and
 * returns focus here. Accessibility: a real `<button>` with `aria-haspopup="menu"` and `aria-expanded`; 44px tall
 * on touch; an inset focus ring that is never clipped by the scrolling bar. Glass and motion: while open
 * the accent tint glides from the previous trigger (reduced motion: it jumps; forced colors: hidden).
 *
 * @example
 * ```tsx
 * import { MenubarTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenubarTrigger>View</MenubarTrigger>
 *   );
 * }
 * ```
 *
 * @see /overlays/menubar
 */
export function MenubarTrigger({ className, children, ...props }: MenubarTriggerProps) {
  const layoutId = useContext(BarContext);
  const reduced = useSheenReducedMotion();
  return (
    <BaseMenu.Trigger
      data-slot="menubar-trigger"
      className={classNameWith(className, (extra) =>
        cn(
          "relative isolate inline-flex h-8 shrink-0 cursor-default items-center rounded-sheen-sm px-3 text-sm font-medium text-sheen-fg select-none any-pointer-coarse:h-11 any-pointer-coarse:px-3.5",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "transition-colors duration-(--sheen-duration-fast) ease-sheen-out hover:not-data-popup-open:bg-sheen-hover",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
          "data-disabled:cursor-not-allowed data-disabled:opacity-45",
          extra,
        ),
      )}
      render={(triggerProps, state) => (
        <button {...triggerProps} className={cn(triggerProps.className, state.open && "sheen-fill")}>
          {state.open && (
            <motion.span
              aria-hidden
              layoutId={reduced || !layoutId ? undefined : layoutId}
              transition={spring.snappy}
              className="pointer-events-none absolute inset-0 -z-10 rounded-sheen-sm bg-sheen-accent-soft shadow-[inset_0_0_0_1px_var(--sheen-accent-border)] forced-colors:hidden"
            />
          )}
          {triggerProps.children}
        </button>
      )}
      {...props}
    >
      {children}
    </BaseMenu.Trigger>
  );
}

/**
 * Props of `MenubarContent`: the props of `MenuContent` minus the ones it sets itself, plus its own
 * options.
 */
export type MenubarContentProps = Omit<MenuContentProps, "matchTriggerWidth">;

/**
 * A menu's popup: drops below its trigger with the left edges aligned. It takes every `MenuContent` prop
 * (`side`, `align`, `sideOffset`, `alignOffset`, ...) except `matchTriggerWidth`.
 *
 * Keyboard: ↑ ↓ move between items, type to jump, → opens a submenu, ← closes it, Escape closes the menu.
 * Accessibility: `role="menu"`. Glass and motion: the same glass popup and spring enter as `MenuContent`; reduced motion fades only.
 *
 * @example
 * ```tsx
 * import { MenubarContent, MenuItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MenubarContent>
 *       <MenuItem shortcut="mod+n">New note</MenuItem>
 *       <MenuItem shortcut="mod+o">Open...</MenuItem>
 *     </MenubarContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/menubar
 */
export function MenubarContent({
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset = -4,
  ref,
  ...props
}: MenubarContentProps) {
  // Moving along the bar with ← → opens the neighbour with focus on the menu container: a keyboard user should land on
  // the first item, as after ↓ on a trigger. Pointer opens keep the container focused (the hover highlight leads).
  const focusFirstItem = useCallback((popup: HTMLElement | null) => {
    if (!popup) return;
    // Base UI moves focus into the popup a frame or two after it mounts: wait for it (up to ~10 frames).
    let frames = 0;
    const settle = () => {
      if (!popup.isConnected) return;
      if (document.activeElement === popup) {
        if (popup.matches(":focus-visible"))
          popup.querySelector<HTMLElement>("[role^='menuitem']:not([aria-disabled='true'])")?.focus();
        return;
      }
      if (++frames < 10) requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);
  }, []);
  const setRefs = useMergedRef(focusFirstItem, ref);
  return (
    <MenuContent ref={setRefs} side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} {...props} />
  );
}
