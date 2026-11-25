"use client";

import { useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode, type Ref } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";

import { cn, classNameWith } from "../../../lib/cn";
import { useMergedRef } from "../../../lib/form";
import { DrawerClose, DrawerTrigger } from "../../drawer/drawer";
import { SCROLL_REST, ScrollContext } from "./content";

/* ---------- Body ---------- */

/**
 * Props of `SideDrawerBody`: the Base UI `Drawer.Content` props plus SheenUI's own options, each
 * documented on its field.
 */
export type SideDrawerBodyProps = ComponentProps<typeof BaseDrawer.Content> & {
  /** Receives the ref to the scrolling element. */
  scrollRef?: Ref<HTMLDivElement>;
  /** Class for the outer wrapper (holds the scroll shadows). */
  wrapperClassName?: string;
};

/**
 * The scrolling part. Soft shadows appear at the top / bottom edge while there is more to scroll that way (drawn over the content, never a mask, so glass inside keeps its blur). `scrollRef` gives you the scrolling element;
 * `wrapperClassName` styles the wrapper that holds the shadows. Touch: vertical drags scroll, a horizontal swipe towards the edge closes the drawer.
 *
 * Keyboard: a tab stop only while it overflows, so keyboard users can scroll it with the arrows. Accessibility: gets `tabIndex=0` only when scrollable, with an inset focus ring. Glass and motion: shadows fade with opacity only.
 *
 * @example
 * ```tsx
 * import { DescriptionList, SideDrawerBody } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawerBody>
 *       <DescriptionList items={[{ label: "Email", value: "ada@example.com" }]} />
 *     </SideDrawerBody>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerBody({ className, wrapperClassName, scrollRef, children, ...props }: SideDrawerBodyProps) {
  const { scroll, setScroll } = useContext(ScrollContext);
  const ref = useRef<HTMLDivElement | null>(null);
  const mergedBodyRef = useMergedRef(ref, scrollRef);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    let last = "";
    const measure = () => {
      frame = 0;
      const max = element.scrollHeight - element.clientHeight;
      const atTop = element.scrollTop <= 1;
      const atBottom = element.scrollTop >= max - 1;
      const key = `${max > 1}|${atTop}|${atBottom}`;
      if (key === last) return;
      last = key;
      setOverflows(max > 1);
      setScroll({ atTop, atBottom });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    element.addEventListener("scroll", schedule, { passive: true });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    const observeAll = () => {
      if (!resize) return;
      resize.disconnect();
      resize.observe(element);
      for (const child of Array.from(element.children)) resize.observe(child);
    };
    observeAll();
    const mutations = new MutationObserver(() => {
      observeAll();
      schedule();
    });
    mutations.observe(element, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("scroll", schedule);
      resize?.disconnect();
      mutations.disconnect();
      setScroll(SCROLL_REST);
    };
  }, [setScroll]);

  return (
    <div data-slot="side-drawer-body-wrapper" className={cn("relative flex min-h-0 flex-1 flex-col", wrapperClassName)}>
      <BaseDrawer.Content
        ref={mergedBodyRef}
        data-slot="side-drawer-body"
        tabIndex={overflows ? 0 : undefined}
        className={classNameWith(className, (extra) =>
          cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-width:thin] @sm/side-drawer:px-5",
            "touch-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
            extra,
          ),
        )}
        {...props}
      >
        {children}
      </BaseDrawer.Content>
      {/* Scroll shadows: overlays (not a mask), so glass in the content keeps its blur. */}
      <span
        aria-hidden
        data-visible={!scroll.atTop || undefined}
        className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-linear-to-b from-[var(--sheen-shadow-far)] to-transparent opacity-0 transition-opacity duration-(--sheen-duration-base) data-visible:opacity-45 forced-colors:hidden"
      />
      <span
        aria-hidden
        data-visible={!scroll.atBottom || undefined}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-[var(--sheen-shadow-far)] to-transparent opacity-0 transition-opacity duration-(--sheen-duration-base) data-visible:opacity-45 forced-colors:hidden"
      />
    </div>
  );
}

/* ---------- Footer ---------- */

/**
 * Props of `SideDrawerFooter`: the native `<div>` props plus its own options, each documented on its
 * field.
 */
export type SideDrawerFooterProps = ComponentProps<"div"> & {
  /** Content on the inline start: a hint ("Unsaved changes"), record navigation. */
  start?: ReactNode;
};

/**
 * Sticky footer: `start` on the inline start (a hint such as "Unsaved changes", record navigation), the buttons (children) on the other end. Gets the panel's width-aware padding.
 *
 * Keyboard: the buttons are normal tab stops. Accessibility: a plain `div`. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { Button, SideDrawerFooter } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawerFooter start="Unsaved changes">
 *       <Button variant="ghost">Cancel</Button>
 *       <Button>Save</Button>
 *     </SideDrawerFooter>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerFooter({ start, className, children, ...props }: SideDrawerFooterProps) {
  return (
    <div
      data-slot="side-drawer-footer"
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-2 border-t border-sheen-border px-4 py-3 @sm/side-drawer:px-5",
        className,
      )}
      {...props}
    >
      {start && <div className="me-auto flex min-w-0 items-center gap-2">{start}</div>}
      {children && <div className="flex min-w-0 items-center gap-2">{children}</div>}
    </div>
  );
}

/** Props of {@link SideDrawerTrigger}. The element that opens a `SideDrawer` (a `<button>` by default; use `render={<Button />}` for a SheenUI button). */
export type SideDrawerTriggerProps = ComponentProps<typeof DrawerTrigger>;

/** Props of {@link SideDrawerClose}. Closes the drawer (through the close guards). */
export type SideDrawerCloseProps = ComponentProps<typeof DrawerClose>;
