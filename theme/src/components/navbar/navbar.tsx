"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";

import { cn } from "../../lib/cn";
import { spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { useLatest } from "../../hooks/use-latest";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";

/**
 * Props a nav passes to `renderLink`. Spread all of them onto the element you
 * return (it must render an <a> and forward its ref), e.g.
 *
 *   // Next.js
 *   renderLink={(props) => <Link {...props} />}
 *   // React Router
 *   renderLink={({ href, ...props }) => <Link to={href} {...props} />}
 *
 * Shared by Navbar and VerticalNav.
 */
export type NavLinkProps = {
  href: string;
  "data-slot": string;
  className: string;
  children: ReactNode;
  "aria-current": "page" | undefined;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
};

/** True for a click that navigates in place (not cmd/ctrl/shift-click into a new tab or window). */
export function isPlainLeftClick(event: MouseEvent) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/** One item of the `Navbar`: its `value`, label, optional icon and `href` (a link) or none (a button). */
export type NavbarItem = {
  /** Unique id of the item; compared with the navbar's `value` to find the active one. */
  value: string;
  /** Visible text (or any node). */
  label: ReactNode;
  /** An icon before the label (decorative). */
  icon?: ReactNode;
  /** Render as a link. Without href the item is a button that calls onValueChange. */
  href?: string;
  /** Not selectable; drops out of the tab order. */
  disabled?: boolean;
};

/** Translatable text of {@link Navbar}. */
export type NavbarLabels = {
  /** Accessible name of the menu button shown when the items are folded away. */
  menu: string;
  /** Landmark name of the `<nav>` when `aria-label` is not given. */
  name: string;
};

/** The English {@link NavbarLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultNavbarLabels: NavbarLabels = { menu: "Menu", name: "Main" };

/** Props of `Navbar`; each option is documented on its field. */
export type NavbarProps = {
  /** Takes the navigation items, in order. */
  items: NavbarItem[];
  /** Sets the `value` of the active item when controlled. */
  value: string;
  /** Called with an item's `value` when it is chosen (a plain left click on a link also calls it). */
  onValueChange?: (value: string) => void;
  /** Shows the logo or product name on the left. */
  brand?: ReactNode;
  /** Buttons on the right (theme toggle, sign in, ...). */
  actions?: ReactNode;
  /**
   * Render items that have an `href` through your router's link component.
   * Defaults to a plain <a>. See `NavLinkProps`.
   */
  renderLink?: (props: NavLinkProps, item: NavbarItem) => ReactElement;
  /**
   * Once the page scrolls past this many px, the bar tightens and turns more opaque
   * (the floating pill also shrinks a touch). `false` turns it off. Default 24.
   */
  shrinkOnScroll?: number | false;
  /**
   * Slide the bar out of view while scrolling down and bring it back on any scroll up.
   * `true` starts hiding after 64px; pass a number for a different distance.
   * Make the navbar `sticky` or `fixed` for this to make sense.
   */
  hideOnScroll?: boolean | number;
  /** Track this element's scroll instead of the window's (e.g. an app shell's scrolling <main>). */
  scrollContainer?: RefObject<HTMLElement | null>;
  /**
   * "floating" = centred glass pill, highlight morphs between items (Apple style).
   * "bar" = full-width top bar, a sliding underline marks the active item. Default "floating".
   */
  variant?: "floating" | "bar";
  /**
   * When the items don't fit next to the brand and actions (phones, narrow containers),
   * fold them into a menu button that opens a glass popover. `false` lets them scroll
   * sideways instead. Default true.
   */
  collapsible?: boolean;
  /** Every string, for translation: `{ menu: "Menu", name: "Main" }` (accessible name of the menu button shown when the items are folded away, and the default landmark name). */
  labels?: Partial<NavbarLabels>;
  /** Landmark name. Give each navigation on a page its own, e.g. "Main" and "Account". Default `labels.name`. */
  "aria-label"?: string;
  /** Extra classes for the `<nav>` (position it with `sticky`, `fixed` or margins). */
  className?: string;
};

/** Scroll movement (px) to ignore before deciding the direction changed: absorbs trackpad jitter. */
const SCROLL_SLOP = 6;
const DEFAULT_HIDE_AFTER = 64;
/** Pill radius for Motion: it can only keep corners round during a layout animation when given in px. */
const PILL_RADIUS = 999;

const px = (value: string) => parseFloat(value) || 0;

/**
 * Horizontal navigation. "floating" is an Apple-style glass pill whose highlight
 * morphs between items; "bar" is a full-width top bar with a sliding underline.
 * When the items run out of room they fold into a menu button + glass popover. Use it for a site or app header;
 * use `VerticalNav` for a sidebar and `Tabs` to switch panels in place.
 *
 * - Items with an `href` are links (pass `renderLink` to use your router's link component, same contract as `VerticalNav`), the rest are buttons that call `onValueChange`.
 * - `brand` sits on the left and `actions` on the right. `shrinkOnScroll` tightens the bar after scrolling; `hideOnScroll` slides it away while scrolling down and back on any scroll up (make it `sticky` or `fixed`);
 *   `scrollContainer` tracks another scrolling element.
 * - `collapsible` folds the items into a menu button + glass popover when they do not fit; off, they scroll sideways.
 *
 * Keyboard: Tab moves through brand, items and actions; Enter follows a link or selects a button. A bar hidden by `hideOnScroll` comes back when focus enters it. In the folded menu, ArrowDown / ArrowUp / Home / End move between items and
 * Escape closes it, returning focus to the menu button.
 * Accessibility: a `<nav>` landmark (name it with `aria-label`, and give each navigation on a page its own); the active item has `aria-current="page"`; the menu button reports `aria-expanded`; targets are 44px on touch screens.
 * Glass and motion: one `glass-2` surface (the folded menu is a `glass-2` popover). The highlight or underline glides between items with `spring.snappy`; the bar tightens and slides with transforms. Reduced motion: the glide jumps and the bar does not slide.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { Button, Navbar, SheenLogo } from "@sheenui/theme";
 *
 * export function Example() {
 *   const [page, setPage] = useState("home");
 *
 *   return (
 *     <Navbar
 *       aria-label="Main"
 *       value={page}
 *       onValueChange={setPage}
 *       brand={<SheenLogo />}
 *       items={[{ value: "home", label: "Home" }, { value: "docs", label: "Docs", href: "/docs" }]}
 *       actions={<Button size="sm">Sign in</Button>}
 *     />
 *   );
 * }
 * ```
 *
 * @see /navigation/navbar
 */
export function Navbar({
  items,
  value,
  onValueChange,
  brand,
  actions,
  renderLink,
  shrinkOnScroll = 24,
  hideOnScroll = false,
  scrollContainer,
  variant = "floating",
  collapsible = true,
  labels: labelsProp,
  "aria-label": ariaLabelProp,
  className,
}: NavbarProps) {
  const labels = { ...defaultNavbarLabels, ...labelsProp };
  const ariaLabel = ariaLabelProp ?? labels.name;
  const layoutId = useId();
  const reduced = useSheenReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const hasBrand = Boolean(brand);
  const hasActions = Boolean(actions);
  const brandRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const activeMenuItemRef = useRef<HTMLElement | null>(null);
  const [compact, setCompact] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // null = visible; otherwise the nav's own CSS `top` when it hid, so it can slide clear of it.
  const [hiddenTop, setHiddenTop] = useState<number | null>(null);
  const lastY = useRef<number | null>(null); // null until the first measurement
  const focusWithin = useRef(false);
  const { scrollY } = useScroll(scrollContainer ? { container: scrollContainer } : undefined);
  const bar = variant === "bar";
  const hideAfter = hideOnScroll === true ? DEFAULT_HIDE_AFTER : hideOnScroll === false ? null : hideOnScroll;
  const folded = collapsible && collapsed;
  const itemKeys = items.map((item) => item.value).join("\u0000");
  const open = menuOpen && folded;
  const menuOpenRef = useLatest(open);

  // Also fires when the position is first measured, so a page restored mid-scroll starts compact.
  useMotionValueEvent(scrollY, "change", (y) => {
    if (shrinkOnScroll !== false) setCompact(y > shrinkOnScroll);
    if (hideAfter === null) return;

    // The first reading is only a baseline: landing on a page (or a restored scroll) shows the bar.
    if (lastY.current === null || y <= hideAfter) {
      lastY.current = y;
      setHiddenTop(null);
      return;
    }
    const delta = y - lastY.current;
    if (Math.abs(delta) < SCROLL_SLOP) return;
    lastY.current = y;
    // Never hide while the menu is open (its popover is anchored to the bar) or focus is inside.
    if (delta < 0 || focusWithin.current || menuOpenRef.current) {
      setHiddenTop(null);
    } else if (navRef.current) {
      // Slide clear of the nav's own offset too (sticky top-4, fixed top-6, ...).
      const top = parseFloat(getComputedStyle(navRef.current).top);
      setHiddenTop(Number.isFinite(top) ? Math.max(top, 0) : 0);
    }
  });

  /*
   * Collapse: do the items fit next to the brand and actions? The list keeps its natural
   * item widths even while folded away (it stays in the DOM, invisible and out of flow), so
   * the answer never depends on the current state and the bar can't flip back and forth.
   * Measured before paint, so a phone never sees items cut off mid-word first.
   */
  useLayoutEffect(() => {
    const nav = navRef.current;
    const list = listRef.current;
    if (!collapsible || !nav || !list) {
      setCollapsed(false);
      return;
    }
    const measure = () => {
      const ns = getComputedStyle(nav);
      const ls = getComputedStyle(list);
      const gap = px(ns.columnGap);
      const room =
        nav.clientWidth -
        px(ns.paddingLeft) -
        px(ns.paddingRight) -
        (brandRef.current ? brandRef.current.offsetWidth + gap : 0) -
        (actionsRef.current ? actionsRef.current.offsetWidth + gap : 0);
      const lis = Array.from(list.children) as HTMLElement[];
      const need =
        lis.reduce((sum, li) => sum + li.offsetWidth, 0) +
        Math.max(0, lis.length - 1) * px(ls.columnGap) +
        px(ls.paddingLeft) +
        px(ls.paddingRight) +
        px(ls.marginLeft) +
        px(ls.marginRight);
      setCollapsed(need > room + 0.5);
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const el of [nav, list, brandRef.current, actionsRef.current, ...Array.from(list.children)]) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // Item sizes, brand and actions are watched by the observer; re-run only when elements come or go.
  }, [collapsible, variant, itemKeys, hasBrand, hasActions]);

  // Leaving the folded state (the window grew) closes the menu (adjusting state while rendering, not in an effect).
  const [wasFolded, setWasFolded] = useState(folded);
  if (wasFolded !== folded) {
    setWasFolded(folded);
    if (!folded) setMenuOpen(false);
  }

  // Without collapse, the item list scrolls sideways on narrow screens: keep the active item in
  // view. Only the list scrolls (never the page); it jumps on first render and under reduced motion.
  const listScrolled = useRef(false);
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector("[aria-current='page']");
    if (!list || !active || folded) return;
    const l = list.getBoundingClientRect();
    const a = active.getBoundingClientRect();
    const by = a.left < l.left ? a.left - l.left - 8 : a.right > l.right ? a.right - l.right + 8 : 0;
    // "auto" rather than "instant": older WebKit throws on the newer keyword.
    if (by !== 0) list.scrollBy({ left: by, behavior: reduced || !listScrolled.current ? "auto" : "smooth" });
    listScrolled.current = true;
  }, [value, reduced, folded]);

  // Keyboard users must never tab into an off-screen bar: focusing it brings it back.
  const onFocus = () => {
    focusWithin.current = true;
    setHiddenTop(null);
  };
  const onBlur = (event: FocusEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget)) focusWithin.current = false;
  };

  const hidden = hiddenTop !== null;

  /** One item as a link (href), a disabled link, or a button. */
  function renderItem(item: NavbarItem, slot: string, className: string, content: ReactNode, afterSelect?: () => void) {
    const active = item.value === value;
    const select = () => {
      onValueChange?.(item.value);
      afterSelect?.();
    };
    if (item.href && !item.disabled) {
      const linkProps: NavLinkProps = {
        href: item.href,
        "data-slot": slot,
        className,
        "aria-current": active ? "page" : undefined,
        onClick: (event) => {
          if (isPlainLeftClick(event)) select();
        },
        children: content,
      };
      return renderLink ? renderLink(linkProps, item) : <a {...linkProps}>{content}</a>;
    }
    if (item.href) {
      // A disabled link has no href, so it drops out of the tab order like a disabled button.
      return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid -- the ARIA disabled-link pattern: no href on purpose
        <a data-slot={slot} role="link" aria-disabled="true" className={className}>
          {content}
        </a>
      );
    }
    return (
      <button
        data-slot={slot}
        type="button"
        aria-current={active ? "page" : undefined}
        disabled={item.disabled}
        onClick={select}
        className={className}
      >
        {content}
      </button>
    );
  }

  // Arrow keys / Home / End move between the menu's items (Tab works too).
  const onMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const els = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "[data-slot='navbar-menu-item']:not([aria-disabled='true']):not(:disabled)",
      ),
    );
    if (!els.length) return;
    event.preventDefault();
    const i = els.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? els.length - 1
          : event.key === "ArrowDown"
            ? (i + 1) % els.length
            : (i - 1 + els.length) % els.length;
    els[next]?.focus();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- focus handlers only track focus-within to reveal a hidden bar
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      data-slot="navbar"
      data-variant={variant}
      data-compact={compact || undefined}
      data-hidden={hidden || undefined}
      data-collapsed={folded || undefined}
      onFocus={onFocus}
      onBlur={onBlur}
      // `transform`, not `translate`, so it composes with a consumer's -translate-x-1/2 centring.
      style={hidden ? { transform: `translateY(calc(-100% - ${hiddenTop + 8}px))` } : undefined}
      className={cn(
        "glass-3 relative flex w-full items-center gap-2",
        bar ? "rounded-sheen-lg px-4 py-2" : "max-w-3xl rounded-sheen-full px-3 py-2.5",
        // The floating pill shrinks a touch when compact; never on touch screens, where it would push
        // the 44px items below the minimum touch target.
        !bar && "origin-top not-any-pointer-coarse:data-compact:scale-[0.97]",
        // Hidden also fades out, so the glass shadow doesn't linger at the top edge.
        hidden && "pointer-events-none opacity-0",
        "motion-ok:transition-[transform,scale,opacity]",
        // Leaving is quicker than coming back, and never overshoots.
        hidden
          ? "motion-ok:duration-(--sheen-duration-exit) motion-ok:ease-sheen-exit"
          : "motion-ok:duration-(--sheen-duration-slow) motion-ok:ease-sheen-out",
        className,
      )}
    >
      {/* Compact state: a second glass layer fades in so the bar reads more opaque over busy content. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-(--sheen-glass-3-bg) shadow-(--sheen-glass-shadow)",
          "transition-opacity duration-(--sheen-duration-slow) ease-sheen-out",
          compact ? "opacity-100" : "opacity-0",
        )}
      />

      {brand && (
        <div ref={brandRef} className="flex shrink-0 items-center gap-2 pe-1 ps-2 font-semibold">
          {brand}
        </div>
      )}

      {/* -m-1 p-1: room for focus outlines inside the scrolling list.
          Folded: still laid out (so its width can be measured) but invisible, inert and out of flow. */}
      <ul
        ref={listRef}
        inert={folded}
        aria-hidden={folded || undefined}
        className={cn(
          "-m-1 flex items-center gap-1 p-1",
          folded
            ? "pointer-events-none invisible absolute top-0 start-0 w-0 overflow-hidden"
            : "min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          bar && "ps-5",
        )}
      >
        {items.map((item) => {
          const active = item.value === value;
          const content = (
            <>
              {active && !folded && (
                <motion.span
                  aria-hidden
                  // Reduced motion: no shared layout at all, so the highlight simply appears on the new item.
                  layoutId={reduced ? undefined : layoutId}
                  transition={spring.snappy}
                  style={{ borderRadius: PILL_RADIUS }}
                  className={
                    bar
                      ? "absolute inset-x-3 -bottom-px h-0.5 bg-sheen-accent"
                      : "absolute inset-0 -z-10 bg-sheen-hover shadow-[inset_0_1px_0_var(--sheen-glass-border)]"
                  }
                />
              )}
              {item.icon && <span className="flex size-4 items-center justify-center">{item.icon}</span>}
              <span>{item.label}</span>
            </>
          );
          const itemClass = cn(
            "relative z-0 flex items-center gap-1.5 px-3.5 text-sm font-medium whitespace-nowrap select-none",
            bar ? "h-12 rounded-sheen-sm" : "h-9 rounded-sheen-full any-pointer-coarse:h-11",
            "transition-colors duration-(--sheen-duration-fast)",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
            active ? "text-sheen-fg" : "text-sheen-fg-muted hover:text-sheen-fg",
            item.disabled && "cursor-not-allowed opacity-45 hover:text-sheen-fg-muted",
          );

          return (
            // Floating: auto margins centre the items but, unlike justify-center, never push overflow off the start.
            <li key={item.value} className={cn("shrink-0", !bar && "first:ms-auto last:me-auto")}>
              {renderItem(item, "navbar-item", itemClass, content)}
            </li>
          );
        })}
      </ul>

      {folded && (
        <Popover open={open} onOpenChange={setMenuOpen}>
          <PopoverTrigger
            aria-label={labels.menu}
            data-slot="navbar-menu-trigger"
            className={cn(
              "group relative ms-auto flex size-9 shrink-0 items-center justify-center rounded-sheen-full text-sheen-fg",
              "any-pointer-coarse:size-11",
              "transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover data-popup-open:bg-sheen-hover",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
            )}
          >
            {/* Three bars that fold into an X while the menu is open (they just swap with reduced motion). */}
            <span aria-hidden className="relative block h-3 w-4">
              {[
                "top-0 group-data-popup-open:translate-y-[5px] group-data-popup-open:rotate-45",
                "top-[5px] group-data-popup-open:scale-x-0 group-data-popup-open:opacity-0",
                "top-[10px] group-data-popup-open:-translate-y-[5px] group-data-popup-open:-rotate-45",
              ].map((line, i) => (
                <span
                  key={i}
                  className={cn(
                    "absolute inset-x-0 h-0.5 rounded-sheen-full bg-current",
                    "motion-ok:transition-[translate,rotate,scale,opacity] motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
                    line,
                  )}
                />
              ))}
            </span>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            sideOffset={bar ? 10 : 12}
            aria-label={ariaLabel}
            // Keyboard: start on the current page. Touch: focus the popup itself (no stray focus ring).
            initialFocus={(type) => (type === "touch" ? true : (activeMenuItemRef.current ?? true))}
            className="w-auto max-h-[min(70dvh,32rem)] min-w-52 overflow-y-auto overscroll-contain p-1.5"
          >
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- arrow-key navigation between the menu's links */}
            <ul className="flex flex-col gap-0.5" onKeyDown={onMenuKeyDown}>
              {items.map((item) => {
                const active = item.value === value;
                const content = (
                  <>
                    {item.icon && <span className="flex size-4 shrink-0 items-center justify-center">{item.icon}</span>}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {active && (
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="size-4 shrink-0 text-sheen-accent"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    )}
                  </>
                );
                const className = cn(
                  "flex h-10 w-full items-center gap-2.5 rounded-sheen-md px-3 text-start text-sm font-medium select-none any-pointer-coarse:h-11",
                  "transition-colors duration-(--sheen-duration-fast)",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
                  active
                    ? "bg-sheen-hover text-sheen-fg"
                    : "text-sheen-fg-muted hover:bg-sheen-hover hover:text-sheen-fg",
                  item.disabled && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-sheen-fg-muted",
                );
                return (
                  <li
                    key={item.value}
                    ref={
                      active
                        ? (li) => {
                            activeMenuItemRef.current =
                              li?.querySelector<HTMLElement>("[data-slot='navbar-menu-item']") ?? null;
                          }
                        : undefined
                    }
                  >
                    {renderItem(item, "navbar-menu-item", className, content, () => setMenuOpen(false))}
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      )}

      {actions && (
        <div ref={actionsRef} className="flex shrink-0 items-center gap-1.5">
          {actions}
        </div>
      )}
    </nav>
  );
}
