"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../lib/form";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../lib/cn";
import { duration } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { Button } from "../button/button";
import { ChartEmpty } from "./chart-parts";
import { KEY_SEP, changeEase, enterEase, exitTransition, num, slotColor, type ChartColor } from "./chart-utils";
import { ChartValueTable, defaultCompact, defaultPercent, useEntrance } from "./heatmap";

/** One row of a BarList: a name and a value, and optionally a link, an icon and a stable key. */
export type BarListItem = {
  name: string;
  value: number;
  /** Makes the row a link (the whole row is its hit area). */
  href?: string;
  /** An icon or logo before the name (decorative). */
  icon?: ReactNode;
  /** A stable key when names repeat. Defaults to the name. */
  key?: string;
};

/**
 * Every string BarList speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type BarListLabels = {
  /** The "Show more" button, given how many rows are hidden. */
  showMore: (hidden: number) => string;
  showLess: string;
  /** Read after a row's share, e.g. "32% of total". */
  ofTotal: string;
};

/**
 * The built-in English strings of BarList; spread it into your own `labels` and change what you need.
 * This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultBarListLabels: BarListLabels = {
  showMore: (hidden) => `Show ${hidden} more`,
  showLess: "Show less",
  ofTotal: "of total",
};

/**
 * Props of BarList. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type BarListProps = {
  /** One row per item: { name: "Searchly", value: 4821 }. Negative values draw no bar. */
  data: readonly BarListItem[];
  /** Hue of the bars: a palette slot (1–8). One list, one hue. */
  color?: ChartColor;
  /** Row order. "none" keeps the order of `data`. */
  sortOrder?: "descending" | "ascending" | "none";
  /** Rows shown before "Show more". Omit to show every row. */
  limit?: number;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown. Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Print each row's share of the total after its value. */
  showShare?: boolean;
  /** Column captions above the rows, e.g. "Source" / "Visits". */
  nameHeader?: ReactNode;
  /** Column caption above the values, e.g. "Visits". */
  valueHeader?: ReactNode;
  /** Makes every row a button. */
  onValueChange?: (item: BarListItem) => void;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
  /** Override the "Show more", "Show less" and "of total" strings (i18n). */
  labels?: Partial<BarListLabels>;
  /** Names the list for assistive tech. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const rowKey = (item: BarListItem) => item.key ?? item.name;

/** Rows: a full-width, focusable hit area (44px tall on touch) with a solid, inset focus ring. */
const rowClass = cn(
  "group flex w-full items-center gap-3 rounded-sheen-sm p-1 text-start",
  "motion-ok:transition-colors motion-ok:duration-(--sheen-duration-fast)",
  "hover:bg-sheen-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus focus-visible:outline-solid",
  "any-pointer-coarse:min-h-11",
);

/**
 * A ranked list with each value drawn as a soft bar behind its label (Tremor style): the most
 * compact way to compare many named values, and readable as a plain list by screen readers.
 *
 * - Bars share one scale (the largest value in the whole list), so "Show more" never rescales them.
 * - The bar is a tint of one palette hue with a solid 2px data end; where that end would cut
 *   through the name it becomes two short ticks above and below the text. Text stays in text colours.
 * - Rows can be buttons (`onValueChange`) or links (`href`), each with a 44px hit area on touch.
 * - Bars grow in, top to bottom, the first time the list scrolls into view; new data re-ranks the
 *   rows (they glide to their new place) and re-sizes the bars. Instant with reduced motion.
 *
 * Keyboard: rows that are buttons (`onValueChange`) or links (`href`) are normal tab stops (Enter or Space activates the button, Enter follows the link) with a solid inset focus ring; "Show more" is a button. A plain list has no tab stops.
 * Accessibility: a real `<ul>` of rows, so screen readers read name, value and (with `showShare`) share as text; `aria-label` names the list (required). `BarListTable` is the table view.
 * Glass and motion: no backdrop blur. Reduced motion skips the grow-in and the re-rank glide.
 *
 * @example
 * ```tsx
 * import { BarList } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BarList
 *       data={[
 *         { name: "Searchly", value: 4821 },
 *         { name: "Direct", value: 3102 },
 *         { name: "codehost.example", value: 960, href: "https://github.com" },
 *       ]}
 *       showShare
 *       nameHeader="Source"
 *       valueHeader="Visits"
 *       aria-label="Visits by source"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/bar-list
 */
export function BarList({
  data,
  color = 1,
  sortOrder = "descending",
  limit,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  showShare = false,
  nameHeader,
  valueHeader,
  onValueChange,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<BarListProps>) {
  const labels = { ...defaultBarListLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const reduced = useSheenReducedMotion();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const listRef = useRef<HTMLUListElement>(null);
  const play = useEntrance(rootRef, reduced);
  const [expanded, setExpanded] = useState(false);
  // First row "Show more" brought in: those rows cascade in from there.
  const [revealFrom, setRevealFrom] = useState(0);
  // Rows whose bar ends under their name (measured): their solid end turns into two short ticks.
  const [endsInText, setEndsInText] = useState<ReadonlySet<string>>(() => new Set());
  const [measureTick, setMeasureTick] = useState(0);

  const rows = useMemo(() => {
    const list = data.map((item) => ({ item, value: num(item.value) }));
    if (sortOrder === "descending") list.sort((a, b) => b.value - a.value);
    else if (sortOrder === "ascending") list.sort((a, b) => a.value - b.value);
    return list;
  }, [data, sortOrder]);

  const max = rows.reduce((m, r) => Math.max(m, r.value), 0);
  const total = rows.reduce((s, r) => s + Math.max(0, r.value), 0);
  const cap = limit !== undefined && limit > 0 && limit < rows.length ? Math.floor(limit) : rows.length;
  const visible = expanded ? rows : rows.slice(0, cap);
  const hidden = rows.length - cap;
  const signature = rows.map((r) => `${rowKey(r.item)}:${r.value}`).join("|");
  const layoutTransition = reduced ? { duration: 0 } : { duration: duration.slow, ease: changeEase };
  const hue = slotColor(color);

  // Unique keys even when names repeat.
  const seen = new Map<string, number>();
  const keys = visible.map((r) => {
    const k = rowKey(r.item);
    const n = seen.get(k) ?? 0;
    seen.set(k, n + 1);
    return `${k}${KEY_SEP}${n}`;
  });

  // Where each bar ends against its name, from the rendered sizes (fonts, icons, truncation).
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const next = new Set<string>();
    for (const li of list.querySelectorAll<HTMLElement>(":scope > li[data-key]")) {
      const track = li.querySelector<HTMLElement>("[data-track]");
      const label = li.querySelector<HTMLElement>("[data-label]");
      const share = Number(li.dataset.share ?? 0);
      if (!track || !label || !(share > 0)) continue;
      const end = Math.max(3, share * track.clientWidth);
      // The name's text runs from 8px (padding) to its width − 8px.
      const liKey = li.dataset.key;
      if (liKey !== undefined && end > 4 && end < label.offsetWidth - 4) next.add(liKey);
    }
    setEndsInText((prev) => (prev.size === next.size && [...next].every((k) => prev.has(k)) ? prev : next));
  }, [signature, expanded, measureTick]);
  const noRows = rows.length === 0;
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => setMeasureTick((n) => n + 1));
    observer.observe(list);
    return () => observer.disconnect();
  }, [noRows]);

  if (rows.length === 0) {
    return (
      <ChartEmpty height={120} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  return (
    <div {...rest} ref={rootMerged} className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      {(!!nameHeader || !!valueHeader) && (
        <div
          aria-hidden
          className="flex items-baseline justify-between gap-3 px-1 text-xs font-medium text-sheen-fg-muted"
        >
          <span>{nameHeader}</span>
          <span className={cn(showShare && "pe-[3.75rem]")}>{valueHeader}</span>
        </div>
      )}

      <ul ref={listRef} id={listId} aria-label={ariaLabel} className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {visible.map(({ item, value }, i) => {
            const key = keys[i] ?? "";
            const share = max > 0 ? Math.max(0, value) / max : 0;
            const ratio = total > 0 ? Math.max(0, value) / total : NaN;
            const revealed = expanded && i >= revealFrom; // a row that "Show more" brought in
            const stagger = reduced ? 0 : revealed ? Math.min((i - revealFrom) * 0.03, 0.4) : Math.min(i * 0.05, 0.5);
            const link = item.href !== undefined && !onValueChange;
            const ticks = endsInText.has(key);
            const body = (
              <>
                <span data-track className="relative flex h-6 min-w-0 flex-1 items-center">
                  {value > 0 && (
                    <motion.span
                      aria-hidden
                      layout
                      layoutDependency={signature}
                      initial={reduced ? false : { scaleX: 0 }}
                      animate={{ scaleX: play ? 1 : 0 }}
                      transition={{
                        layout: layoutTransition,
                        scaleX: { duration: reduced ? 0 : duration.slower, ease: enterEase, delay: stagger },
                      }}
                      className={cn(
                        "absolute inset-y-0 start-0 origin-left overflow-hidden rounded-s-[2px] rounded-e-[4px] rtl:origin-right",
                        // High contrast drops the tint: outline the bar so its length still reads.
                        "forced-colors:border forced-colors:border-e-2",
                      )}
                      style={{
                        width: `${share * 100}%`,
                        minWidth: 3,
                        background: `color-mix(in oklab, ${hue} 22%, transparent)`,
                      }}
                    >
                      {/* The data end (>= 3:1 against the surface): a solid edge, or two ticks clear of the text. */}
                      {ticks ? (
                        <>
                          <span className="absolute end-0 top-0 h-[3px] w-0.5" style={{ background: hue }} />
                          <span className="absolute end-0 bottom-0 h-[3px] w-0.5" style={{ background: hue }} />
                        </>
                      ) : (
                        <span className="absolute inset-y-0 end-0 w-0.5" style={{ background: hue }} />
                      )}
                    </motion.span>
                  )}
                  <span data-label className="relative flex min-w-0 items-center gap-2 px-2 text-sm text-sheen-fg">
                    {item.icon && (
                      <span
                        aria-hidden
                        className="flex size-4 shrink-0 items-center justify-center text-sheen-fg-muted [&>svg]:size-4"
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className={cn("truncate", link && "underline-offset-2 group-hover:underline")}>
                      {item.name}
                    </span>
                  </span>
                </span>
                <span className="sr-only">: </span>
                <span className="shrink-0 text-sm font-semibold text-sheen-fg tabular-nums">{format(value)}</span>
                {showShare && (
                  <span className="w-12 shrink-0 text-end text-xs text-sheen-fg-muted tabular-nums">
                    {pct(ratio)}
                    <span className="sr-only"> {labels.ofTotal}</span>
                  </span>
                )}
              </>
            );
            return (
              <motion.li
                key={key}
                data-key={key}
                data-share={share}
                layout="position"
                layoutDependency={signature}
                initial={reduced ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: reduced ? { duration: 0 } : exitTransition }}
                transition={{
                  layout: layoutTransition,
                  opacity: { duration: reduced ? 0 : duration.base, delay: revealed ? stagger : 0 },
                  y: { duration: reduced ? 0 : duration.base, ease: enterEase, delay: revealed ? stagger : 0 },
                }}
              >
                {onValueChange ? (
                  <button type="button" onClick={() => onValueChange(item)} className={rowClass}>
                    {body}
                  </button>
                ) : link ? (
                  <a href={item.href} className={rowClass}>
                    {body}
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-1">{body}</div>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {hidden > 0 && (
        <motion.div
          layout="position"
          layoutDependency={visible.length}
          transition={{ layout: layoutTransition }}
          className="flex"
        >
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => {
              if (!expanded) setRevealFrom(cap);
              setExpanded(!expanded);
            }}
            className="-ms-1 text-sheen-fg-muted hover:text-sheen-fg"
            trailing={
              <svg
                aria-hidden
                width={14}
                height={14}
                viewBox="0 0 16 16"
                className={cn(
                  "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
                  expanded && "rotate-180",
                )}
              >
                <path
                  d="M4 6l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            {expanded ? labels.showLess : labels.showMore(hidden)}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of BarListTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type BarListTableProps = Pick<BarListProps, "data" | "sortOrder" | "format" | "formatPercent" | "locale"> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Override the column headers: { name, value, share }. */
  headers?: Partial<{ name: string; value: string; share: string }>;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
};

/**
 * Every row with its value and share of the total, in the list's order.
 *
 * Props: the list's `data`, `sortOrder`, `format`, `formatPercent` and `locale`, plus `caption` (hidden, names the table), `headers` ({ name, value, share }) and `emptyState`. A real table in the list's order; static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { BarListTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BarListTable data={[{ name: "Searchly", value: 4821 }, { name: "Direct", value: 3102 }]} caption="Visits by source" />
 *   );
 * }
 * ```
 *
 * @see /charts/bar-list
 */
export function BarListTable({
  data,
  sortOrder = "descending",
  format: formatProp,
  formatPercent: pctProp,
  locale,
  caption,
  headers,
  emptyState,
}: BarListTableProps) {
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const h = { name: "Name", value: "Value", share: "Share", ...headers };
  const rows = data.map((item) => ({ name: item.name, value: num(item.value) }));
  if (sortOrder === "descending") rows.sort((a, b) => b.value - a.value);
  else if (sortOrder === "ascending") rows.sort((a, b) => a.value - b.value);
  const total = rows.reduce((s, r) => s + Math.max(0, r.value), 0);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[{ label: h.name }, { label: h.value }, { label: h.share }]}
      rows={rows.map((r) => [r.name, format(r.value), pct(total > 0 ? Math.max(0, r.value) / total : NaN)])}
    />
  );
}
