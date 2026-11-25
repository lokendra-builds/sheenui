"use client";

import { useId, type MouseEvent, type ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";

import { cn } from "../lib/cn";
import { useControllable } from "../hooks/use-controllable";
import { spring } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";

/**
 * Every user-facing string of `Pagination` (accessible names, announcements, placeholders); pass a
 * partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type PaginationLabels = {
  /** Accessible name of the <nav> landmark. */
  nav: string;
  /** Accessible name of the "first page" button. */
  first: string;
  /** Accessible name of the "previous page" button. */
  previous: string;
  /** Accessible name of the "next page" button. */
  next: string;
  /** Accessible name of the "last page" button. */
  last: string;
  /** Accessible name of a page button, e.g. "Page 3". */
  page: (page: number) => string;
  /** Screen-reader text for an ellipsis. */
  morePages: string;
  /** Compact text on small screens, e.g. "Page 3 of 32". */
  pageOf: (page: number, pageCount: number) => string;
};

/**
 * Default English strings of `PaginationLabels`; spread it and override single keys to reword. Plain
 * data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React
 * Server Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultPaginationLabels: PaginationLabels = {
  nav: "Pagination",
  first: "First page",
  previous: "Previous page",
  next: "Next page",
  last: "Last page",
  page: (page) => `Page ${page}`,
  morePages: "More pages",
  pageOf: (page, pageCount) => `Page ${page} of ${pageCount}`,
};

/** A slot in the pagination bar: a 1-based page number or one of the two ellipses. */
export type PageItem = number | "start-ellipsis" | "end-ellipsis";

/**
 * The page slots to show (1-based). Always returns the same number of slots for a given
 * page count, so the control keeps its width as the current page moves.
 *
 *   getPageItems(6, 20) → [1, "start-ellipsis", 5, 6, 7, "end-ellipsis", 20]
 */
export function getPageItems(page: number, pageCount: number, siblingCount = 1, boundaryCount = 1): PageItem[] {
  const count = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(1, Math.floor(page)), count);
  const range = (start: number, end: number) =>
    end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);
  const firstEnd = endPages[0] ?? count + 1;

  const siblingsStart = Math.max(
    Math.min(current - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2), firstEnd - 2);

  const items: PageItem[] = [...startPages];
  if (siblingsStart > boundaryCount + 2) items.push("start-ellipsis");
  else if (boundaryCount + 1 < count - boundaryCount) items.push(boundaryCount + 1);
  items.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < count - boundaryCount - 1) items.push("end-ellipsis");
  else if (count - boundaryCount > boundaryCount) items.push(count - boundaryCount);
  items.push(...endPages);

  // Small page counts can produce duplicates at the seams; keep the first of each.
  const seen = new Set<PageItem>();
  return items.filter((item) => (seen.has(item) ? false : (seen.add(item), true)));
}

// On touch screens the gap grows so the 44px hit areas of neighbouring buttons don't overlap.
const sizes = {
  sm: {
    button: "h-8 min-w-8 px-2 text-xs rounded-sheen-sm",
    icon: "size-8 rounded-sheen-sm",
    gap: "gap-0.5 any-pointer-coarse:gap-3",
  },
  md: { button: "h-10 min-w-10 px-3 text-sm rounded-sheen-md", icon: "size-10 rounded-sheen-md", gap: "gap-1" },
} as const;

/** Props of `Pagination`; each option is documented on its field. */
export type PaginationProps = {
  /** Sets the current page, 1-based, when controlled. */
  page?: number;
  /** Sets the starting page when uncontrolled. */
  defaultPage?: number;
  /** Called with the new 1-based page. */
  onPageChange?: (page: number) => void;
  /** Total number of pages. 0 is treated as 1. */
  pageCount: number;
  /** Pages shown on each side of the current one. Default 1. */
  siblingCount?: number;
  /** Pages always shown at the start and the end. Default 1. */
  boundaryCount?: number;
  /** Shows the first-page and last-page buttons. Default true. */
  showFirstLast?: boolean;
  /** Shows the previous and next buttons. Default true. */
  showPrevNext?: boolean;
  /** Button size: "sm" (32px) or "md" (40px, default). */
  size?: keyof typeof sizes;
  /** Disables every button of the pagination. */
  disabled?: boolean;
  /**
   * Render page links instead of buttons (crawlable, open in new tab). With `onPageChange`
   * as well, clicks are handled in-app (the browser's own navigation is prevented).
   */
  getPageHref?: (page: number) => string;
  /** UI strings (i18n). */
  labels?: Partial<PaginationLabels>;
  /** Adds a class name to the `<nav>` element. */
  className?: string;
  /** Sets the `id` attribute of the `<nav>` element. */
  id?: string;
  /** Overrides labels.nav. Give each pagination on a page its own name. */
  "aria-label"?: string;
};

/**
 * Pagination: page numbers with ellipses, first / previous / next / last, in a labelled `<nav>` landmark. Use it under any
 * long list or table; DataTable uses it in its footer.
 *
 * - Controlled with `page` + `onPageChange` (1-based), or uncontrolled with `defaultPage`; `pageCount` is the total.
 * - The number of slots stays constant while you page through (MUI's algorithm), so the buttons never jump around under the
 *   pointer; `siblingCount` and `boundaryCount` shape it. On phones the numbers collapse into "Page 3 of 32" between the arrows.
 * - `getPageHref` renders real links (crawlable, open in a new tab); with `onPageChange` as well, plain clicks are handled in-app.
 * - `labels` translates every string; `aria-label` names the landmark (give each pagination on a page its own).
 *
 * Keyboard: every control is a normal tab stop (Tab and Shift+Tab); Enter or Space activates a button, Enter follows a link.
 * Accessibility: a `<nav>` with a name; the current page has `aria-current="page"`; ellipses read "More pages"; targets are 44px on touch
 * screens (the gap grows so neighbours do not overlap). Disabled arrows keep their place.
 * Glass and motion: an accent pill glides between pages with `spring.snappy` (a shared layout animation); instant with reduced motion.
 * No backdrop blur on the page buttons themselves.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { Pagination } from "@sheenui/theme";
 *
 * export function Example() {
 *   const [page, setPage] = useState(1);
 *
 *   return <Pagination page={page} pageCount={24} onPageChange={setPage} aria-label="Search results pages" />;
 * }
 * ```
 *
 * @see /layout/pagination
 */
export function Pagination({
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  size = "md",
  disabled = false,
  getPageHref,
  labels: labelsProp,
  className,
  id,
  "aria-label": ariaLabel,
}: PaginationProps) {
  const labels = { ...defaultPaginationLabels, ...labelsProp };
  const groupId = useId();
  const reduced = useSheenReducedMotion();
  const [pageState, setPageState] = useControllable(pageProp, defaultPage, onPageChange);
  const count = Math.max(1, Math.floor(pageCount));
  const page = Math.min(Math.max(1, pageState), count);
  const items = getPageItems(page, count, siblingCount, boundaryCount);
  const s = sizes[size];

  const go = (next: number) => {
    const target = Math.min(Math.max(1, next), count);
    if (target === page || disabled) return;
    setPageState(target);
  };

  const control = (
    target: number,
    label: string,
    children: ReactNode,
    opts: { current?: boolean; icon?: boolean } = {},
  ) => {
    // At an edge (previous on page 1, …) the arrows are aria-disabled, not disabled: a focused
    // "Last page" button that becomes disabled would drop keyboard focus on <body>.
    const atEdge = !opts.current && (target === page || target < 1 || target > count);
    const off = disabled || atEdge;
    const className = cn(
      "relative inline-flex shrink-0 items-center justify-center font-medium tabular-nums select-none",
      "touch-manipulation [-webkit-tap-highlight-color:transparent]",
      "transition-[background-color,color] duration-(--sheen-duration-fast) ease-sheen-out",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
      // 44×44 hit area on touch screens without changing the look.
      "sheen-hit",
      opts.icon ? s.icon : s.button,
      // Forced colours: the page number is drawn by us (no backplate) in HighlightText on the Highlight pill.
      opts.current
        ? "text-sheen-accent-fg forced-colors:text-[HighlightText] forced-colors:[forced-color-adjust:none]"
        : "text-sheen-fg hover:bg-sheen-hover",
      off && !opts.current && "cursor-not-allowed text-sheen-fg-subtle opacity-60",
      atEdge && "hover:bg-transparent",
    );
    const content = (
      <>
        {opts.current && (
          <motion.span
            aria-hidden
            layoutId="sheen-pagination-current"
            transition={reduced ? { duration: 0 } : spring.snappy}
            className="sheen-fill absolute inset-0 rounded-[inherit] [background-image:var(--sheen-accent-fill)] forced-colors:bg-[Highlight] forced-colors:[forced-color-adjust:none]"
          />
        )}
        <span className={cn("relative flex items-center", opts.current && "forced-colors:text-[HighlightText]")}>
          {children}
        </span>
      </>
    );

    if (getPageHref) {
      return (
        <a
          data-slot="pagination-item"
          href={off && !opts.current ? undefined : getPageHref(target)}
          // Without href a link is not focusable: keep edge links in the tab order (see atEdge).
          role={off && !opts.current ? "link" : undefined}
          tabIndex={atEdge && !disabled ? 0 : undefined}
          aria-label={label}
          aria-current={opts.current ? "page" : undefined}
          aria-disabled={off && !opts.current ? true : undefined}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (!onPageChange || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            event.preventDefault();
            go(target);
          }}
          className={className}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        data-slot="pagination-item"
        type="button"
        aria-label={label}
        aria-current={opts.current ? "page" : undefined}
        disabled={disabled}
        aria-disabled={atEdge || undefined}
        onClick={() => go(target)}
        className={className}
      >
        {content}
      </button>
    );
  };

  return (
    <nav data-slot="pagination" id={id} aria-label={ariaLabel ?? labels.nav} className={cn("flex min-w-0", className)}>
      <LayoutGroup id={groupId}>
        <ul className={cn("flex items-center", s.gap)}>
          {showFirstLast && <li>{control(1, labels.first, <FirstIcon />, { icon: true })}</li>}
          {showPrevNext && <li>{control(page - 1, labels.previous, <ChevronIcon dir="left" />, { icon: true })}</li>}

          {items.map((item) =>
            typeof item === "number" ? (
              // Numbers collapse into "Page x of y" on phones (no invisible focus stop for the current one).
              <li key={item} className="max-sm:hidden">
                {control(item, labels.page(item), item, { current: item === page })}
              </li>
            ) : (
              <li key={item} className="max-sm:hidden">
                <span className={cn("inline-flex items-center justify-center text-sheen-fg-muted select-none", s.icon)}>
                  <span aria-hidden>…</span>
                  <span className="sr-only">{labels.morePages}</span>
                </span>
              </li>
            ),
          )}

          {/* Phones only (display: none, so hidden from screen readers too, above 640px). */}
          <li className="px-2 text-sm whitespace-nowrap text-sheen-fg-muted tabular-nums sm:hidden">
            {labels.pageOf(page, count)}
          </li>

          {showPrevNext && <li>{control(page + 1, labels.next, <ChevronIcon dir="right" />, { icon: true })}</li>}
          {showFirstLast && <li>{control(count, labels.last, <FirstIcon flip />, { icon: true })}</li>}
        </ul>
      </LayoutGroup>
    </nav>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4 rtl:-scale-x-100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

function FirstIcon({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("size-4", flip ? "-scale-x-100 rtl:scale-x-100" : "rtl:-scale-x-100")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m17 18-6-6 6-6M7 6v12" />
    </svg>
  );
}
