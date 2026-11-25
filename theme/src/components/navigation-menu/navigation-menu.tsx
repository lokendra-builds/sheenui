"use client";

import type { ComponentProps, ReactNode } from "react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";

import { classNameWith, cn } from "../../lib/cn";
import { popupMotion } from "../../lib/popup-motion";
import { popupA11yProps } from "../../lib/popup-a11y";
import { ChevronDownIcon } from "../status-icons/icons";

const item =
  "relative inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-sheen-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-sheen-fg-muted select-none no-underline any-pointer-coarse:min-h-11 " +
  "touch-manipulation [-webkit-tap-highlight-color:transparent] transition-[background-color,color,scale] duration-(--sheen-duration-fast) ease-sheen-out " +
  "hover:bg-sheen-hover hover:text-sheen-fg data-popup-open:bg-sheen-hover data-popup-open:text-sheen-fg motion-ok:active:scale-[0.97] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus data-disabled:cursor-not-allowed data-disabled:opacity-50";

/** Props of {@link NavigationMenu}: everything Base UI's `NavigationMenu.Root` takes (`value`, `defaultValue`, `onValueChange`, `delay`, `closeDelay`, `orientation`) plus the ones below. */
export type NavigationMenuProps = Omit<ComponentProps<typeof BaseNavigationMenu.Root>, "children"> & {
  /** `NavigationMenuList` and anything else that belongs in the nav. */
  children?: ReactNode;
  /** Adds extra classes to the shared dropdown panel. */
  popupClassName?: string;
  /** Distance between the bar and the panel, in px. Default 10. */
  sideOffset?: number;
};

/**
 * Base UI places the panel with `top`/`left`, so re-anchoring it to another trigger is a layout move (a layout shift, even
 * though it is the answer to the pointer). This ref keeps the panel at `0 0` and carries the same offset in `translate`
 * instead, which moves it without touching layout. It runs in the same task as Base UI's write, before any paint. It also
 * applies the popup a11y fix-ups (`popupA11yProps.ref`), since a ref given after that spread would replace it.
 */
function anchorWithTranslate(node: HTMLElement | null) {
  if (!node) return;
  const undoA11y = popupA11yProps.ref(node);
  // The offset carried so far. Base UI may write `top` and `left` in separate commits, and our own reset to 0 lands here
  // too: only a non-zero value is a new position (a panel never anchors at exactly 0 px, the page header is above it).
  let x = 0;
  let y = 0;
  const apply = () => {
    if (node.style.position !== "absolute" && node.style.position !== "fixed") return;
    const left = parseFloat(node.style.left);
    const top = parseFloat(node.style.top);
    if (!left && !top) return;
    if (left) x = left;
    if (top) y = top;
    node.style.translate = `${x}px ${y}px`;
    node.style.left = "0px";
    node.style.top = "0px";
  };
  apply();
  const observer = new MutationObserver(apply);
  observer.observe(node, { attributes: true, attributeFilter: ["style"] });
  return () => {
    observer.disconnect();
    undoA11y?.();
  };
}

/**
 * A site-level navigation bar whose items can open a rich dropdown panel: links with descriptions, feature lists, a
 * grid of products. Use `Navbar` for a flat bar of links and `Menu` for a list of actions.
 *
 * - Compose `NavigationMenuList` > `NavigationMenuItem` > `NavigationMenuTrigger` + `NavigationMenuContent` (a dropdown)
 *   or `NavigationMenuLink` (a plain link). One glass panel is shared by all items: it resizes and slides between them.
 * - Hover intent: the panel opens after `delay` (default 120 ms) and closes after `closeDelay` (default 150 ms), so passing the
 *   pointer across the bar does not flicker it. Click or Enter opens it too, and a click on the open item closes it.
 * - Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`; each item has a `value`.
 * - Wrap it in your own `aria-label` (it renders a `<nav>`).
 *
 * Keyboard: Tab enters the bar; ← → move between items; Enter, Space or ↓ opens an item's panel and moves focus into it;
 * Tab and the arrow keys move through its links; Escape closes the panel and returns focus to the trigger.
 * Accessibility: a `nav` landmark with a list of items; triggers have `aria-expanded` and `aria-controls`; links use
 * `aria-current="page"` when `active`; panels are 44px-target on touch and keep 4.5:1 text on the glass.
 * Glass and motion: a `glass-1` bar and one `glass-3` panel (one backdrop blur open at a time). The panel's size morphs to
 * each item's content and the content slides in from the side you came from; the chevron turns. Reduced motion fades only.
 *
 * @example
 * ```tsx
 * import {
 *   NavigationMenu,
 *   NavigationMenuContent,
 *   NavigationMenuItem,
 *   NavigationMenuLink,
 *   NavigationMenuList,
 *   NavigationMenuTrigger,
 * } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NavigationMenu aria-label="Main">
 *       <NavigationMenuList>
 *         <NavigationMenuItem>
 *           <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *           <NavigationMenuContent>
 *             <NavigationMenuLink href="/charts" plain>Charts</NavigationMenuLink>
 *             <NavigationMenuLink href="/blocks" plain>Blocks</NavigationMenuLink>
 *           </NavigationMenuContent>
 *         </NavigationMenuItem>
 *         <NavigationMenuItem>
 *           <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
 *         </NavigationMenuItem>
 *       </NavigationMenuList>
 *     </NavigationMenu>
 *   );
 * }
 * ```
 *
 * @see /navigation/navigation-menu
 */
export function NavigationMenu({
  className,
  popupClassName,
  sideOffset = 10,
  delay = 120,
  closeDelay = 150,
  children,
  ...props
}: NavigationMenuProps) {
  return (
    <BaseNavigationMenu.Root
      data-slot="navigation-menu"
      delay={delay}
      closeDelay={closeDelay}
      className={classNameWith(className, (extra) => cn("relative inline-flex max-w-full min-w-0", extra))}
      {...props}
    >
      {children}
      <BaseNavigationMenu.Portal>
        <BaseNavigationMenu.Positioner
          sideOffset={sideOffset}
          collisionPadding={8}
          {...popupA11yProps}
          ref={anchorWithTranslate}
          // Moving to another item re-anchors the panel at once (animating top/left/width/height shifts layout every
          // frame); the panel's content slides and fades instead (see NavigationMenuContent).
          // Base UI makes the Popup `position: absolute` while it morphs between items, so the Positioner must take its
          // size from --positioner-width/-height; with no size of its own it measures 0 px and the flip (side=top near
          // the bottom edge) is computed against the wrong box, leaving the panel hundreds of px from its trigger.
          // An open panel whose trigger has scrolled out of view must not float over unrelated content.
          className="z-50 data-anchor-hidden:invisible h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width)"
        >
          <BaseNavigationMenu.Popup
            data-slot="navigation-menu-popup"
            className={cn(
              "glass-3 relative h-(--popup-height,auto) max-h-(--available-height) w-(--popup-width,auto) origin-(--transform-origin) overflow-hidden rounded-sheen-lg",
              popupMotion,
              "data-instant:transition-none",
              popupClassName,
            )}
          >
            <BaseNavigationMenu.Viewport className="relative h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain" />
          </BaseNavigationMenu.Popup>
        </BaseNavigationMenu.Positioner>
      </BaseNavigationMenu.Portal>
    </BaseNavigationMenu.Root>
  );
}

/**
 * The row of items. A `glass-1` pill that wraps on narrow screens. Holds `NavigationMenuItem`s.
 *
 * Accessibility: A list inside the `nav` landmark; arrow keys move between the items.
 *
 * @example
 * ```tsx
 * import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NavigationMenu aria-label="Main">
 *       <NavigationMenuList>
 *         <NavigationMenuItem>
 *           <NavigationMenuLink href="/">Home</NavigationMenuLink>
 *         </NavigationMenuItem>
 *       </NavigationMenuList>
 *     </NavigationMenu>
 *   );
 * }
 * ```
 *
 * @see /navigation/navigation-menu
 */
export function NavigationMenuList({ className, ...props }: ComponentProps<typeof BaseNavigationMenu.List>) {
  return (
    <BaseNavigationMenu.List
      data-slot="navigation-menu-list"
      className={classNameWith(className, (extra) =>
        cn(
          "glass-1 m-0 flex max-w-full min-w-0 list-none flex-wrap items-center gap-0.5 rounded-sheen-full p-1",
          extra,
        ),
      )}
      {...props}
    />
  );
}

/**
 * One entry of the bar: holds either a `NavigationMenuTrigger` with its `NavigationMenuContent`, or a single `NavigationMenuLink`.
 * Give an item with a dropdown a `value` when you control the menu.
 *
 * Accessibility: Renders a list item.
 *
 * @example
 * ```tsx
 * import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NavigationMenu aria-label="Main">
 *       <NavigationMenuList>
 *         <NavigationMenuItem value="docs">
 *           <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
 *         </NavigationMenuItem>
 *       </NavigationMenuList>
 *     </NavigationMenu>
 *   );
 * }
 * ```
 *
 * @see /navigation/navigation-menu
 */
export function NavigationMenuItem(props: ComponentProps<typeof BaseNavigationMenu.Item>) {
  return <BaseNavigationMenu.Item data-slot="navigation-menu-item" {...props} />;
}

/**
 * The button of an item that opens a dropdown. Shows a chevron that turns while the panel is open.
 *
 * Accessibility: A real `button` with `aria-expanded`; Enter, Space or ArrowDown opens the panel.
 *
 * @example
 * ```tsx
 * import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NavigationMenu aria-label="Main">
 *       <NavigationMenuList>
 *         <NavigationMenuItem>
 *           <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
 *           <NavigationMenuContent>Guides and examples.</NavigationMenuContent>
 *         </NavigationMenuItem>
 *       </NavigationMenuList>
 *     </NavigationMenu>
 *   );
 * }
 * ```
 *
 * @see /navigation/navigation-menu
 */
export function NavigationMenuTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseNavigationMenu.Trigger>) {
  return (
    <BaseNavigationMenu.Trigger
      data-slot="navigation-menu-trigger"
      className={classNameWith(className, (extra) => cn(item, extra))}
      {...props}
    >
      {children}
      <BaseNavigationMenu.Icon className="flex">
        <ChevronDownIcon className="size-3.5 motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out [[data-popup-open]>&]:rotate-180" />
      </BaseNavigationMenu.Icon>
    </BaseNavigationMenu.Trigger>
  );
}

/**
 * What an item's dropdown shows. It slides in from the side of the item you came from. Put links, text or any content in it;
 * it is laid out in a box up to 36rem wide.
 *
 * Accessibility: Focus moves into the panel when it opens from the keyboard; its links are normal tab stops.
 *
 * @example
 * ```tsx
 * import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NavigationMenu aria-label="Main">
 *       <NavigationMenuList>
 *         <NavigationMenuItem>
 *           <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
 *           <NavigationMenuContent>
 *             <NavigationMenuLink href="/guides">Guides</NavigationMenuLink>
 *           </NavigationMenuContent>
 *         </NavigationMenuItem>
 *       </NavigationMenuList>
 *     </NavigationMenu>
 *   );
 * }
 * ```
 *
 * @see /navigation/navigation-menu
 */
export function NavigationMenuContent({ className, ...props }: ComponentProps<typeof BaseNavigationMenu.Content>) {
  return (
    <BaseNavigationMenu.Content
      data-slot="navigation-menu-content"
      className={classNameWith(className, (extra) =>
        cn(
          "w-[min(36rem,calc(100vw-2rem))] max-w-full p-2",
          "motion-ok:transition-[opacity,translate] motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
          "data-starting-style:opacity-0 data-ending-style:opacity-0 motion-ok:data-ending-style:duration-(--sheen-duration-exit) motion-ok:data-ending-style:ease-sheen-exit",
          "motion-ok:data-starting-style:data-[activation-direction=left]:-translate-x-1/4 motion-ok:data-starting-style:data-[activation-direction=right]:translate-x-1/4",
          "motion-ok:data-ending-style:data-[activation-direction=left]:translate-x-1/4 motion-ok:data-ending-style:data-[activation-direction=right]:-translate-x-1/4",
          extra,
        ),
      )}
      {...props}
    />
  );
}

/** Props of {@link NavigationMenuLink}: everything Base UI's `NavigationMenu.Link` takes (`href`, `active`, `closeOnClick`, `render`) plus `plain`. */
export type NavigationMenuLinkProps = ComponentProps<typeof BaseNavigationMenu.Link> & {
  /** A block row with a hover tint instead of the bar's pill: for links inside a `NavigationMenuContent` panel. Default false. */
  plain?: boolean;
};

/**
 * A link. In the bar it is a pill like a trigger; inside a `NavigationMenuContent` pass `plain` for a block row with a hover
 * tint, and lay the panel out yourself. Mark the current page with `active`; use `render` to swap in a router's link.
 *
 * Accessibility: An `<a>`; `active` sets `aria-current="page"`. Enter follows it.
 *
 * @example
 * ```tsx
 * import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NavigationMenu aria-label="Main">
 *       <NavigationMenuList>
 *         <NavigationMenuItem>
 *           <NavigationMenuLink href="/pricing" active>Pricing</NavigationMenuLink>
 *         </NavigationMenuItem>
 *       </NavigationMenuList>
 *     </NavigationMenu>
 *   );
 * }
 * ```
 *
 * @see /navigation/navigation-menu
 */
export function NavigationMenuLink({ className, plain = false, ...props }: NavigationMenuLinkProps) {
  return (
    <BaseNavigationMenu.Link
      data-slot="navigation-menu-link"
      className={classNameWith(className, (extra) =>
        plain
          ? cn(
              "block rounded-sheen-md p-3 text-sm no-underline transition-[background-color] duration-(--sheen-duration-fast) ease-sheen-out hover:bg-sheen-hover any-pointer-coarse:min-h-11",
              "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sheen-focus data-[active]:bg-sheen-hover",
              extra,
            )
          : cn(item, "data-[active]:bg-sheen-hover data-[active]:text-sheen-fg", extra),
      )}
      {...props}
    />
  );
}

/** Props of {@link NavigationMenuList}. The row of items. */
export type NavigationMenuListProps = ComponentProps<typeof NavigationMenuList>;

/** Props of {@link NavigationMenuItem}. One entry of the bar: holds either a `NavigationMenuTrigger` with its `NavigationMenuContent`, or a single `NavigationMenuLink`. */
export type NavigationMenuItemProps = ComponentProps<typeof NavigationMenuItem>;

/** Props of {@link NavigationMenuTrigger}. The button of an item that opens a dropdown. */
export type NavigationMenuTriggerProps = ComponentProps<typeof NavigationMenuTrigger>;

/** Props of {@link NavigationMenuContent}. What an item's dropdown shows. */
export type NavigationMenuContentProps = ComponentProps<typeof NavigationMenuContent>;
