"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Menu } from "@base-ui/react/menu";
import { useRender } from "@base-ui/react/use-render";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { popupMotion } from "../../lib/popup-motion";
import { popupA11yProps } from "../../lib/popup-a11y";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { spring } from "../../motion/tokens";

/**
 * Breadcrumb: where the current page sits in the hierarchy.
 *
 *   <Breadcrumb items={[
 *     { label: "Home", href: "/", icon: <HomeIcon />, iconOnly: true },
 *     { label: "Projects", href: "/projects" },
 *     { label: "Q3 roadmap" },                       // last item = current page
 *   ]} />
 *
 * - A <nav aria-label="Breadcrumb"> with an ordered list; the last item is the current page
 *   (aria-current="page"). Separators are decorative and hidden from assistive tech.
 * - Collapse: when the trail does not fit its width (or has more than `maxItems`), middle
 *   items fold into a "…" menu (Base UI Menu: arrow keys, typeahead, Escape). Widths are
 *   measured from a hidden copy of the trail, so the result is computed before paint, never
 *   by trial and error, and it re-expands as soon as there is room again.
 * - Router links: pass `renderLink={(item) => <Link to={item.href!} />}` (or `render` per item).
 *   The element is used for inline links and for the links inside the collapse menu.
 * - All strings are props (`labels`) for translation. With several breadcrumbs on one page,
 *   give each its own `labels.nav` so their landmarks can be told apart.
 *
 * The breadcrumb fills the width it is given; inside a flex row give it `flex-1 min-w-0`.
 */

/** One step of the trail. The last item is the current page. */
export type BreadcrumbItem = {
  /** Visible label. */
  label: ReactNode;
  /** Link target. Items without one (and the last item) render as plain text. */
  href?: string;
  /** Icon before the label. */
  icon?: ReactNode;
  /** Show only the icon; the label stays available to screen readers. */
  iconOnly?: boolean;
  /** Plain-text label for the collapse menu's typeahead when `label` is not a string. */
  textValue?: string;
  /** Element to render this link as, e.g. <Link to="/projects" />. Overrides `renderLink`. */
  render?: ReactElement;
  /** Stable key (defaults to href, then the position). */
  id?: string;
};

/** Every UI string of {@link Breadcrumb}; pass a partial through its `labels` prop to translate it. */
export type BreadcrumbLabels = {
  /** Accessible name of the <nav>. */
  nav: string;
  /** Accessible name of the "…" button that opens the hidden items. */
  more: (hiddenCount: number) => string;
};

/** The English strings of {@link Breadcrumb} ("Breadcrumb" for the landmark, "Show N hidden pages" for the "…" button). */
export const defaultBreadcrumbLabels: BreadcrumbLabels = {
  nav: "Breadcrumb",
  more: (count) => `Show ${count} hidden ${count === 1 ? "page" : "pages"}`,
};

/** Props of {@link Breadcrumb}. */
export type BreadcrumbProps = {
  /** The trail, root first. The last item is the current page. */
  items: BreadcrumbItem[];
  /**
   * Between items: the presets "chevron", "slash" or "dot", or any node (rendered decoratively).
   * @default "chevron"
   */
  separator?: ReactNode;
  /**
   * "auto" folds middle items into a menu when the trail does not fit; "never" wraps instead.
   * @default "auto"
   */
  collapse?: "auto" | "never";
  /** Always collapse when there are more items than this. Default: no limit. */
  maxItems?: number;
  /**
   * Items always shown before the "…" menu.
   * @default 1
   */
  itemsBefore?: number;
  /**
   * Items kept after the "…" when `maxItems` collapses (width-driven collapse keeps at least 1).
   * @default 1
   */
  itemsAfter?: number;
  /** Render every link as your router's link: `(item) => <Link to={item.href!} />`. */
  renderLink?: (item: BreadcrumbItem) => ReactElement;
  /**
   * Picks a "plain" text trail or a "glass" pill.
   * @default "plain"
   */
  variant?: "plain" | "glass";
  /**
   * Sets the text and row size.
   * @default "md"
   */
  size?: "sm" | "md";
  /** Any UI string (i18n): `nav` and `more`. Give each breadcrumb on a page its own `nav`. */
  labels?: Partial<BreadcrumbLabels>;
  /** Adds extra classes to the `<nav>`. */
  className?: string;
};

const sizes = {
  sm: { text: "text-xs", row: "min-h-7", icon: "[&_svg]:size-3.5", gap: "gap-1", glass: "h-8 px-2.5" },
  md: { text: "text-sm", row: "min-h-8", icon: "[&_svg]:size-4", gap: "gap-1.5", glass: "h-10 px-3.5" },
} as const;

function textOf(item: BreadcrumbItem) {
  if (item.textValue) return item.textValue;
  return typeof item.label === "string" || typeof item.label === "number" ? String(item.label) : undefined;
}

function keyOf(item: BreadcrumbItem, index: number) {
  return item.id ?? (item.href ? `${item.href}#${index}` : `crumb-${index}`);
}

/**
 * Which items are folded into the menu: indices [start, start + count).
 * `count` 0 means nothing is collapsed.
 */
type Fold = { start: number; count: number };

/**
 * Where the current page sits in the hierarchy. When the trail does not fit its width (or has
 * more than `maxItems`), the middle items fold into a "…" menu, and they come back as soon as
 * there is room. Widths are measured from a hidden copy before paint, so there is no flicker.
 *
 * Props: see {@link BreadcrumbProps} (`items`, `separator`, `collapse`, `maxItems`,
 * `itemsBefore`, `itemsAfter`, `renderLink`, `variant`, `size`, `labels`, `className`).
 *
 * Keyboard: Tab moves through the links and the "…" button; Enter opens the menu, then arrow keys, typeahead and Escape work as in any menu.
 * Accessibility: A `<nav aria-label="Breadcrumb">` with an ordered list; the last item has `aria-current="page"`. Separators are hidden from assistive tech. An icon-only item keeps its label for screen readers.
 * Glass: The "glass" variant is one `glass-1` pill; the "plain" variant has no surface.
 * Motion: Items fade in and out as the trail folds (spring); the first render does not animate, and reduced motion removes it.
 *
 * @example
 * ```tsx
 * import { Breadcrumb } from "@sheenui/theme";
 *
 * export const Trail = () => (
 *   <Breadcrumb
 *     items={[
 *       { label: "Home", href: "/" },
 *       { label: "Projects", href: "/projects" },
 *       { label: "Q3 roadmap" },
 *     ]}
 *   />
 * );
 * ```
 *
 * @see /layout/breadcrumb
 */
export function Breadcrumb({
  items,
  separator = "chevron",
  collapse = "auto",
  maxItems,
  itemsBefore = 1,
  itemsAfter = 1,
  renderLink,
  variant = "plain",
  size = "md",
  labels: labelsProp,
  className,
}: BreadcrumbProps) {
  const labels = { ...defaultBreadcrumbLabels, ...labelsProp };
  const s = sizes[size];
  const n = items.length;
  const before = Math.max(0, Math.min(itemsBefore, n - 1));
  // The most that can fold: everything between the leading items and the current page.
  const maxFold = Math.max(0, n - 1 - before);
  const after = Math.max(1, Math.min(itemsAfter, n - before));
  // Forced by maxItems: keep `before` + "…" + `after`.
  const minFold = maxItems !== undefined && n > maxItems ? Math.min(maxFold, Math.max(0, n - before - after)) : 0;

  const navRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [folded, setFolded] = useState(minFold);
  const reduced = useSheenReducedMotion();
  // False during the first render, so the initial trail does not animate in.
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- a mounted flag: it must stay false for the first client render (also without hydration), so the initial trail never animates in
  useEffect(() => setReady(true), []);
  const fold: Fold = {
    start: before,
    count: collapse === "never" ? minFold : Math.max(minFold, Math.min(folded, maxFold)),
  };

  const measure = useCallback(() => {
    const nav = navRef.current;
    const list = listRef.current;
    const box = measureRef.current;
    if (!nav || !list || !box || collapse === "never") return;
    const widths = Array.from(box.querySelectorAll<HTMLElement>("[data-measure=item]")).map(
      (el) => el.getBoundingClientRect().width,
    );
    const sep = box.querySelector<HTMLElement>("[data-measure=sep]")?.getBoundingClientRect().width ?? 0;
    const more = box.querySelector<HTMLElement>("[data-measure=more]")?.getBoundingClientRect().width ?? 0;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const listStyle = getComputedStyle(list);
    const chrome =
      parseFloat(listStyle.paddingLeft) +
      parseFloat(listStyle.paddingRight) +
      parseFloat(listStyle.borderLeftWidth) +
      parseFloat(listStyle.borderRightWidth);
    const available = nav.clientWidth - chrome - 1;

    let next = maxFold;
    for (let count = minFold; count <= maxFold; count++) {
      let total = 0;
      let slots = 0;
      for (let i = 0; i < n; i++) {
        if (count > 0 && i >= before && i < before + count) continue;
        total += widths[i] ?? 0;
        slots++;
      }
      if (count > 0) {
        total += more;
        slots++;
      }
      // Every slot but the last is followed by a separator, with a gap on each side of it.
      total += (slots - 1) * (sep + gap * 2);
      if (total <= available) {
        next = count;
        break;
      }
    }
    setFolded((prev) => (prev === next ? prev : next));
  }, [before, collapse, maxFold, minFold, n]);

  // Observe once (per configuration): the nav's width, and the hidden trail's natural width,
  // which changes with font loading and label changes.
  useLayoutEffect(() => {
    if (collapse === "never") return;
    const observer = new ResizeObserver(() => measure());
    if (navRef.current) observer.observe(navRef.current);
    const inner = measureRef.current?.firstElementChild;
    if (inner) observer.observe(inner);
    return () => observer.disconnect();
  }, [measure, collapse]);

  // Re-measure before paint when the trail's content changes: a different item can change
  // what fits even when the total width does not. Keyed on the labels and links, not on the
  // `items` array, which callers often rebuild on every render.
  const signature = items
    .map((item, i) => `${keyOf(item, i)}\u0000${textOf(item) ?? ""}\u0000${item.iconOnly ? 1 : 0}`)
    .join("\u0001");
  useLayoutEffect(() => {
    if (collapse !== "never") measure();
  }, [measure, collapse, signature]);

  const separatorNode = <SeparatorGlyph separator={separator} />;
  const visible: ({ kind: "item"; item: BreadcrumbItem; index: number } | { kind: "more" })[] = [];
  for (let i = 0; i < n; i++) {
    if (fold.count > 0 && i === fold.start) visible.push({ kind: "more" });
    if (fold.count > 0 && i >= fold.start && i < fold.start + fold.count) continue;
    const item = items[i];
    if (item) visible.push({ kind: "item", item, index: i });
  }
  const hidden = items.slice(fold.start, fold.start + fold.count);

  return (
    <nav
      ref={navRef}
      aria-label={labels.nav}
      data-slot="breadcrumb"
      className={cn("relative w-full min-w-0", s.text, className)}
    >
      <ol
        ref={listRef}
        className={cn(
          "inline-flex max-w-full min-w-0 items-center text-sheen-fg-muted",
          s.gap,
          collapse === "never" ? "flex-wrap" : "flex-nowrap",
          variant === "glass" && ["glass-1 rounded-sheen-full", s.glass],
        )}
      >
        {visible.map((entry, position) => {
          const last = position === visible.length - 1;
          const key = entry.kind === "more" ? "more" : keyOf(entry.item, entry.index);
          return (
            <Fragment key={key}>
              <Crumb last={last} animate={ready && !reduced}>
                {entry.kind === "more" ? (
                  <MoreMenu items={hidden} label={labels.more(hidden.length)} renderLink={renderLink} size={size} />
                ) : (
                  <CrumbContent item={entry.item} current={entry.index === n - 1} renderLink={renderLink} size={size} />
                )}
              </Crumb>
              {!last && (
                <li
                  role="presentation"
                  aria-hidden
                  // Never covers a neighbour's 44px touch area.
                  className={cn("pointer-events-none flex shrink-0 items-center text-sheen-fg-subtle", s.icon)}
                >
                  {separatorNode}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>

      {/* Hidden copy of the full trail, measured to decide how much to fold. Zero-size and
          clipped, so it can never widen the page; inert and hidden from assistive tech. */}
      {collapse === "auto" && (
        <div
          ref={measureRef}
          aria-hidden
          inert
          className="pointer-events-none invisible absolute top-0 start-0 h-0 w-0 overflow-hidden"
        >
          <div className={cn("flex w-max items-center", s.gap)}>
            {items.map((item, i) => (
              <span key={keyOf(item, i)} data-measure="item" className="inline-flex shrink-0">
                <CrumbContent item={item} current={i === n - 1} size={size} measuring />
              </span>
            ))}
            <span data-measure="sep" className={cn("inline-flex shrink-0", s.icon)}>
              {separatorNode}
            </span>
            <span data-measure="more" className="inline-flex shrink-0">
              <MoreButtonFace size={size} />
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}

/**
 * One list item. Items that appear after the first render (a deeper page, or items coming
 * back out of the menu as the trail widens) slide in; the first render is static.
 */
function Crumb({ last, animate, children }: { last: boolean; animate: boolean; children: ReactNode }) {
  return (
    <motion.li
      initial={animate ? { opacity: 0, x: -6 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={spring.snappy}
      className={cn("flex items-center", last ? "min-w-0 shrink" : "shrink-0")}
    >
      {children}
    </motion.li>
  );
}

const linkBase = cn(
  // The padding is cancelled by negative margins (a hover wash wider than the text, with no
  // layout shift), so the cap is the item's width plus that padding.
  "relative inline-flex max-w-[calc(100%+0.5rem)] min-w-0 items-center gap-1.5 rounded-sheen-sm px-1 -mx-1 any-pointer-coarse:min-w-11 any-pointer-coarse:justify-center",
  "touch-manipulation [-webkit-tap-highlight-color:transparent]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
  // 44px hit area on touch screens, without changing the layout.
  "any-pointer-coarse:after:absolute any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:left-1/2 any-pointer-coarse:after:size-full any-pointer-coarse:after:min-h-11 any-pointer-coarse:after:min-w-11 any-pointer-coarse:after:-translate-1/2",
);

function CrumbContent({
  item,
  current,
  renderLink,
  size,
  measuring = false,
}: {
  item: BreadcrumbItem;
  current: boolean;
  renderLink?: (item: BreadcrumbItem) => ReactElement;
  size: "sm" | "md";
  measuring?: boolean;
}) {
  const s = sizes[size];
  const inner = (
    <>
      {item.icon && (
        <span aria-hidden className={cn("flex shrink-0 items-center", s.icon)}>
          {item.icon}
        </span>
      )}
      <span
        className={cn(
          item.iconOnly && item.icon
            ? "sr-only"
            : current
              ? "line-clamp-2 whitespace-normal [overflow-wrap:anywhere]"
              : "truncate",
          // Long ancestors truncate; the current page takes whatever room is left and wraps rather than clip.
          !current && "max-w-[12rem]",
        )}
      >
        {item.label}
      </span>
    </>
  );

  if (current || !item.href) {
    return (
      <span
        aria-current={current && !measuring ? "page" : undefined}
        title={current ? textOf(item) : undefined}
        className={cn(
          "inline-flex max-w-full min-w-0 items-center gap-1.5",
          s.row,
          current ? "font-medium text-sheen-fg" : "text-sheen-fg-muted",
        )}
      >
        {inner}
      </span>
    );
  }

  if (measuring) {
    return <span className={cn(linkBase, s.row)}>{inner}</span>;
  }

  return (
    <CrumbLink item={item} renderLink={renderLink} className={cn(linkBase, s.row)}>
      {inner}
    </CrumbLink>
  );
}

function CrumbLink({
  item,
  renderLink,
  className,
  children,
}: {
  item: BreadcrumbItem;
  renderLink?: (item: BreadcrumbItem) => ReactElement;
  className: string;
  children: ReactNode;
}) {
  return useRender({
    defaultTagName: "a",
    render: item.render ?? renderLink?.(item),
    props: {
      href: item.href,
      className: cn(
        className,
        "text-sheen-fg-muted transition-[color,text-decoration-color] duration-(--sheen-duration-fast)",
        "underline decoration-transparent decoration-1 underline-offset-4 hover:text-sheen-fg hover:decoration-sheen-fg-subtle",
      ),
      children,
    },
  });
}

function MoreButtonFace({ size }: { size: "sm" | "md" }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-sheen-sm", size === "sm" ? "h-6 w-7" : "h-7 w-8")}
    >
      <DotsIcon />
    </span>
  );
}

function MoreMenu({
  items,
  label,
  renderLink,
  size,
}: {
  items: BreadcrumbItem[];
  label: string;
  renderLink?: (item: BreadcrumbItem) => ReactElement;
  size: "sm" | "md";
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={label}
        className={cn(
          "relative inline-flex items-center justify-center rounded-sheen-sm text-sheen-fg-muted",
          size === "sm" ? "h-6 w-7" : "h-7 w-8",
          "transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg data-popup-open:bg-sheen-hover data-popup-open:text-sheen-fg",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "any-pointer-coarse:after:absolute any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:left-1/2 any-pointer-coarse:after:size-full any-pointer-coarse:after:min-h-11 any-pointer-coarse:after:min-w-11 any-pointer-coarse:after:-translate-1/2",
          "forced-colors:border forced-colors:border-[ButtonText]",
        )}
      >
        <DotsIcon />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          {...popupA11yProps}
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 outline-none"
        >
          <Menu.Popup
            className={cn(
              "glass-3 max-h-(--available-height) max-w-[min(20rem,calc(100vw-1.5rem))] min-w-44 origin-(--transform-origin) overflow-y-auto overscroll-contain rounded-sheen-md p-1 text-sm outline-none",
              popupMotion,
            )}
          >
            {items.map((item, i) => (
              <Menu.LinkItem
                key={keyOf(item, i)}
                label={textOf(item)}
                href={item.href}
                render={item.render ?? (item.href ? renderLink?.(item) : undefined)}
                closeOnClick
                className={cn(
                  "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-sheen-sm px-2.5 py-2 text-sheen-fg outline-none select-none any-pointer-coarse:min-h-11",
                  "data-highlighted:bg-sheen-hover",
                  "forced-colors:data-highlighted:bg-[Highlight] forced-colors:data-highlighted:text-[HighlightText]",
                  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-sheen-fg-muted",
                )}
                // Each level steps in a little, so the folded items still read as a path.
                style={{ paddingInlineStart: `${0.625 + Math.min(i, 4) * 0.5}rem` }}
              >
                {i > 0 && <CornerIcon />}
                {item.icon && !(i > 0) && (
                  <span aria-hidden className="flex">
                    {item.icon}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function SeparatorGlyph({ separator }: { separator: BreadcrumbProps["separator"] }) {
  if (separator === "chevron") {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="rtl:-scale-x-100"
      >
        <path d="m6 3.5 4.5 4.5L6 12.5" />
      </svg>
    );
  }
  if (separator === "slash") return <span className="px-0.5 text-[1.05em] font-light select-none">/</span>;
  if (separator === "dot") return <span className="px-0.5 font-bold select-none">·</span>;
  return <>{separator}</>;
}

function DotsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="size-4">
      <circle cx="3.5" cy="8" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="12.5" cy="8" r="1.25" />
    </svg>
  );
}

function CornerIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="rtl:-scale-x-100"
    >
      <path d="M4 3v5.5A1.5 1.5 0 0 0 5.5 10H12m-2.5-2.5L12 10l-2.5 2.5" />
    </svg>
  );
}
