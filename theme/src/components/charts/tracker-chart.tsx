"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import { useInputSource } from "./chart-fit";
import {
  chartFocusClass,
  clamp,
  slotColor,
  useElementWidth,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import { ChartValueTable, defaultCompact, useEntrance } from "./heatmap";
import {
  AboveTip,
  markGlow,
  ShowAllRows,
  stepKeys,
  useDeferredDraw,
  useStaggerEntrance,
  useTableRows,
} from "./category-bar";
import { useChartDirection } from "./chart-pointer";
import { ChartFigure } from "./chart-figure";

/* ---------- Statuses ---------- */

/** Colour of a status: a palette slot (1–8) or one of the theme's status colours. */
export type TrackerTone = ChartColor | "success" | "warning" | "danger" | "neutral";

/**
 * A status a TrackerChart block can have: a label and a tone, and optionally an icon, stripes or a
 * flag.
 */
export type TrackerStatus = {
  /** Name of the status, shown with its icon in the tooltip, the legend and the table. */
  label: string;
  tone: TrackerTone;
  /** Icon shown with the label (decorative; drawn in the status colour, next to text). */
  icon?: ReactNode;
  /** A second cue besides colour: diagonal stripes on the block. */
  striped?: boolean;
  /** A second cue besides colour: a small caret under the block (e.g. outages). */
  flag?: boolean;
};

const icon = (d: string) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

/** The "none" (no data) status: also the fallback for a key the statuses do not define. */
const noDataStatus: TrackerStatus = { label: "No data", tone: "neutral", icon: icon("M4 8h8") };

/** The default statuses: "ok", "degraded", "down" and "none" (no data). */
export const defaultTrackerStatuses: Record<string, TrackerStatus> = {
  ok: { label: "Operational", tone: "success", icon: icon("M3.5 8.5l3 3 6-7") },
  degraded: { label: "Degraded", tone: "warning", icon: icon("M8 2.5l6 11H2zM8 7v2.5M8 11.6v.1"), striped: true },
  down: { label: "Outage", tone: "danger", icon: icon("M4 4l8 8M12 4l-8 8"), flag: true },
  none: noDataStatus,
};

/** CSS colour of a status tone. Neutral is a quiet grey that still reads as "a block". */
export function trackerToneColor(tone: TrackerTone) {
  if (tone === "success") return "var(--sheen-success)";
  if (tone === "warning") return "var(--sheen-warning)";
  if (tone === "danger") return "var(--sheen-danger)";
  if (tone === "neutral") return "color-mix(in oklab, var(--sheen-fg-subtle) 38%, transparent)";
  return slotColor(tone);
}

/* ---------- Types ---------- */

/** One block of a TrackerChart: what it covers (a label or date) and the key of its status. */
export type TrackerBlock = {
  /** What the block covers: a day (Date / timestamp, formatted in `locale`) or any text ("Build #412"). */
  label: string | number | Date;
  /** Key into `statuses`. Unknown keys read as "none". */
  status: string;
  /** Extra line in the tooltip and table, e.g. "14 min of elevated errors". */
  detail?: string;
};

/**
 * Every string TrackerChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type TrackerChartLabels = {
  instructions: ChartInstructions;
  /** Spoken summary of how many blocks have each status, e.g. "Operational: 86". */
  count: (status: string, count: number) => string;
  /** Table column headers. */
  period: string;
  status: string;
  detail: string;
  empty: string;
  /** Button under a long table, e.g. "Show all 90 rows". */
  showAll: (rows: number) => string;
};

/**
 * The built-in English strings of TrackerChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultTrackerChartLabels: TrackerChartLabels = {
  instructions: "Use the arrow keys to read each block.",
  count: (status, count) => `${status}: ${count}`,
  period: "Period",
  status: "Status",
  detail: "Detail",
  empty: "No data",
  showAll: (rows) => `Show all ${rows} rows`,
};

/**
 * Props of TrackerChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type TrackerChartProps = {
  /** Takes one block per period, oldest first. */
  data: readonly TrackerBlock[];
  /** Sets the status definitions, keyed by status name. Default: ok / degraded / down / none. */
  statuses?: Record<string, TrackerStatus>;
  /** Height of the blocks in px. Default 32. */
  height?: number;
  /** Text under the first and last block, e.g. "90 days ago" / "Today". */
  startLabel?: ReactNode;
  /** Caption under the right end of the strip, e.g. "Today". */
  endLabel?: ReactNode;
  /** Show each status (icon, label and count) under the strip. Default true. */
  showLegend?: boolean;
  /** Formats Date / number labels. Default: "Mar 3" in `locale`. */
  formatLabel?: (label: Date) => string;
  /**
   * Locale of the default formats.
   * @default "en"
   */
  locale?: string;
  /** Shown when there are no blocks. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<TrackerChartLabels>;
  /** Names the strip for assistive tech (e.g. "API uptime, last 90 days"). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const MIN_BLOCK = 3; // px; narrower strips scroll inside their own container (latest end in view)

/**
 * One period's block. Memoised, so moving from block to block re-renders only the two that
 * change; the others step back through the strip's data attribute (one CSS rule), never by
 * restyling each block.
 */
const Block = memo(function Block({
  color,
  striped,
  flag,
  on,
  width,
  height,
  delay,
}: {
  color: string;
  striped: boolean;
  flag: boolean;
  on: boolean;
  /** Fixed width when the strip scrolls; otherwise blocks share the width. */
  width: number | undefined;
  height: number;
  /** Entrance delay in seconds (none under reduced motion). */
  delay: string | undefined;
}) {
  return (
    <div className="relative flex-1 self-end" style={{ minWidth: width ?? 0 }}>
      <div
        data-delay={delay}
        data-on={on ? "" : undefined}
        className={cn(
          "origin-bottom rounded-[3px] forced-colors:border forced-colors:border-[CanvasText]",
          "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out",
          "in-data-tracker-active:not-data-on:opacity-55",
          "data-on:outline-2 data-on:outline-offset-1 data-on:outline-sheen-fg data-on:outline-solid",
          "motion-ok:data-on:-translate-y-0.5 motion-ok:data-on:scale-y-110",
        )}
        style={{
          width,
          height,
          background: striped
            ? `repeating-linear-gradient(135deg, ${color} 0 3px, color-mix(in oklab, ${color} 42%, var(--sheen-chart-surface)) 3px 5.5px)`
            : color,
          filter: on ? markGlow(color) : undefined,
        }}
      />
      {flag && (
        <svg
          viewBox="0 0 8 5"
          className="absolute top-full left-1/2 mt-1 h-[5px] w-2 -translate-x-1/2 fill-sheen-fg-muted forced-colors:fill-[CanvasText]"
        >
          <path d="M4 0l4 5H0z" />
        </svg>
      )}
    </div>
  );
});

/** Text of a block's label: dates and timestamps in the locale, anything else as given. */
function useLabelText(locale: string | undefined, formatLabel: ((d: Date) => string) | undefined) {
  return useMemo(() => {
    let dateFormat: Intl.DateTimeFormat;
    try {
      dateFormat = new Intl.DateTimeFormat(locale ?? "en", { month: "short", day: "numeric" });
    } catch {
      dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
    }
    return (label: TrackerBlock["label"]) => {
      if (typeof label === "string") return label;
      const d = label instanceof Date ? label : new Date(label);
      if (Number.isNaN(d.getTime())) return "";
      return formatLabel ? formatLabel(d) : dateFormat.format(d);
    };
  }, [locale, formatLabel]);
}

/**
 * A strip of status blocks, one per period (Tremor's Tracker): uptime, build health, SLA days.
 *
 * - Every block has a tooltip (period, status icon + label, detail); hover, tap-and-drag or
 *   arrow through them. Colour is never the only cue: degraded blocks are striped, outages carry
 *   a caret, and the legend, tooltip and table name every status with an icon.
 * - Blocks share the width; when they would get thinner than 3px the strip scrolls inside its
 *   own container, opened at the latest end.
 * - Blocks rise in from the baseline, left to right, the first time the strip scrolls into
 *   view; the active block lifts. Reduced motion: drawn in place.
 *
 * Keyboard: Tab focuses the strip; the arrow keys move between blocks (mirrored in right-to-left; the strip scrolls to keep the block in view), Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="group"` named by `aria-label`; colour is never the only cue (striped, flagged and labelled statuses), and keyboard moves announce the block. `TrackerTable` is the table view.
 * Glass and motion: the tooltip is a solid glass-look overlay (no backdrop blur). Reduced motion draws the blocks in place.
 *
 * @example
 * ```tsx
 * import { TrackerChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TrackerChart
 *       data={[
 *         { label: "Mon", status: "up" },
 *         { label: "Tue", status: "up" },
 *         { label: "Wed", status: "down", detail: "API outage, 42 min" },
 *       ]}
 *       statuses={{
 *         up: { label: "Operational", tone: "success" },
 *         down: { label: "Outage", tone: "danger", flag: true },
 *       }}
 *       aria-label="API uptime, last three days"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/uptime-tracker
 */
export function TrackerChart({
  data,
  statuses = defaultTrackerStatuses,
  height = 32,
  startLabel,
  endLabel,
  showLegend = true,
  formatLabel,
  locale,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<TrackerChartProps>) {
  const t = { ...defaultTrackerChartLabels, ...labelOverrides };
  const reduced = useSheenReducedMotion();
  const descId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const [active, setActive] = useState<number | null>(null);
  const { fromKeyboard, fromPointer, announce } = useInputSource();
  const labelText = useLabelText(locale, formatLabel);
  // Marks are built once the chart nears the viewport, in a deferred render (see useDeferredDraw):
  // a page load or a ChartCard's Chart tab coming back paints the frame at once, the marks right after.
  const drawn = useDeferredDraw(rootRef);
  const count = data.length;
  const fmtCount = defaultCompact(locale);

  const fallback = statuses.none ?? noDataStatus;
  const statusOf = (key: string) => statuses[key] ?? fallback;

  // Block size: share the width with 2px gaps (1px when tight); below 3px a block, scroll.
  const gap = count > 1 && (width - (count - 1) * 2) / count < 5 ? 1 : 2;
  const fit = count > 0 ? (width - (count - 1) * gap) / count : 0;
  const block = Math.max(MIN_BLOCK, fit);
  const inner = count > 0 ? count * block + (count - 1) * gap : 0;
  const scrolls = width > 0 && inner > width + 0.5;

  // Open a scrolling strip at its latest end. The tooltip reads the scroll offset when it is
  // placed (scrolling itself never re-renders the blocks); scrolling with a tooltip open moves it.
  const [scrollX, setScrollX] = useState(0);
  const scrollFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(scrollFrame.current), []);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !scrolls) return;
    el.scrollLeft = rtl ? -el.scrollWidth : el.scrollWidth;
  }, [scrolls, rtl, count]);

  useStaggerEntrance(stripRef, play && width > 0 && drawn, reduced, [
    { transform: "scaleY(0)", opacity: 0 },
    { transform: "scaleY(1)", opacity: 1 },
  ]);

  // Count per status, in the order the statuses are defined ("none" last when it isn't defined).
  const counts = useMemo(() => {
    const tally = new Map<string, number>();
    for (const b of data) {
      const key = statuses[b.status] ? b.status : "none";
      tally.set(key, (tally.get(key) ?? 0) + 1);
    }
    const order = [...Object.keys(statuses), "none"];
    return new Map(
      order.filter((k, i) => tally.has(k) && order.indexOf(k) === i).map((k) => [k, tally.get(k) ?? 0] as const),
    );
  }, [data, statuses]);

  if (count === 0) {
    return (
      <ChartEmpty height={height + 40} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.empty}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < count ? active : null;
  const activeBlock = act !== null ? data[act] : undefined;
  const activeStatus = activeBlock ? statusOf(activeBlock.status) : undefined;
  const activeTitle = activeBlock ? labelText(activeBlock.label) : "";
  const announceText =
    activeBlock && activeStatus
      ? `${activeTitle}: ${activeStatus.label}${activeBlock.detail ? `. ${activeBlock.detail}` : ""}`
      : "";
  const summary = [...counts].map(([key, n]) => t.count(statusOf(key).label, n)).join(", ");

  const blockAt = (clientX: number) => {
    const el = stripRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    let x = clientX - rect.left;
    if (rtl) x = rect.width - x;
    return clamp(Math.floor((x + gap / 2) / (block + gap)), 0, count - 1);
  };
  // Tooltip anchor: the block's centre, in the scroller's visible coordinates.
  const blockCentre = (i: number) => {
    const fromStart = i * (block + gap) + block / 2;
    const physical = rtl ? inner - fromStart : fromStart;
    return physical - (scrolls ? (rtl ? scrollX + (inner - width) : scrollX) : 0);
  };

  const hasFlags = Object.values(statuses).some((s) => s.flag);
  const stagger = Math.min(0.012, 0.55 / Math.max(1, count));

  return (
    <div {...rest} ref={rootMerged} className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      <div ref={measureRef} className="relative w-full">
        <div className="relative">
          <p id={descId} className="sr-only">
            {summary}
          </p>
          {/* The focusable chart is the scroller itself, so a strip that scrolls can always be
              reached and scrolled from the keyboard; the tooltip sits outside it, never clipped. */}
          {}
          <ChartFigure
            as="div"
            ref={scrollRef}
            label={ariaLabel}
            description={resolveInstructions(t.instructions)}
            aria-describedby={descId}

            tabIndex={0}
            className={cn(
              "relative rounded-sheen-sm",
              chartFocusClass,
              scrolls && "overflow-x-auto overscroll-x-contain [scrollbar-width:thin]",
            )}
            onKeyDown={(e) => {
              fromKeyboard();
              stepKeys(count, act, rtl, (i) => {
                setActive(i);
                // Keep the block in view when the strip scrolls.
                if (i !== null && scrolls)
                  stripRef.current?.children[i]?.scrollIntoView({ block: "nearest", inline: "nearest" });
              })(e);
            }}
            onBlur={() => setActive(null)}
            // Only an open tooltip follows the scroll; otherwise scrolling renders nothing.
            onScroll={(e) => {
              const el = e.currentTarget;
              cancelAnimationFrame(scrollFrame.current);
              scrollFrame.current = requestAnimationFrame(() => setScrollX(el.scrollLeft));
            }}
          >
            <div
              ref={stripRef}
              aria-hidden
              data-tracker-active={act !== null ? "" : undefined}
              className="relative flex items-end py-1.5 forced-color-adjust-none any-pointer-coarse:py-2"
              style={{
                width: scrolls ? inner : "100%",
                gap,
                height: height + 12 + (hasFlags ? 8 : 0),
                paddingBottom: hasFlags ? 14 : undefined,
                // Drag sideways to scrub (vertical swipes still scroll the page); a scrolling strip pans natively.
                touchAction: scrolls ? "pan-x pan-y pinch-zoom" : "pan-y pinch-zoom",
              }}
              onPointerMove={(e) => {
                fromPointer();
                setActive(blockAt(e.clientX));
              }}
              onPointerDown={(e) => {
                fromPointer();
                setActive(blockAt(e.clientX));
              }}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            >
              {drawn &&
                data.map((b, i) => {
                  const s = statusOf(b.status);
                  return (
                    <Block
                      key={i}
                      color={trackerToneColor(s.tone)}
                      striped={!!s.striped}
                      flag={!!s.flag}
                      on={act === i}
                      width={scrolls ? block : undefined}
                      height={height}
                      delay={reduced ? undefined : (i * stagger).toFixed(3)}
                    />
                  );
                })}
            </div>
          </ChartFigure>

          {activeBlock && activeStatus && act !== null && width > 0 && (
            <AboveTip
              title={activeTitle}
              rows={[
                {
                  label: "",
                  value: activeStatus.label,
                  color: trackerToneColor(activeStatus.tone),
                  icon: activeStatus.icon,
                },
              ]}
              x={blockCentre(act)}
              y={4}
              bounds={width}
            >
              {activeBlock.detail && (
                <p className="mt-1.5 max-w-60 text-xs whitespace-normal text-sheen-fg-muted">{activeBlock.detail}</p>
              )}
            </AboveTip>
          )}
        </div>

        {(!!startLabel || !!endLabel) && (
          <div aria-hidden className="mt-1 flex items-center justify-between gap-3 text-2xs text-sheen-fg-muted">
            <bdi>{startLabel}</bdi>
            <span className="h-px flex-1 bg-sheen-border" />
            <bdi>{endLabel}</bdi>
          </div>
        )}
      </div>

      {showLegend && (
        <ul aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-sheen-fg-muted">
          {[...counts].map(([key, n]) => {
            const s = statusOf(key);
            return (
              <li key={key} className="flex items-center gap-1.5">
                <span
                  className="flex size-3.5 items-center justify-center [&>svg]:size-3.5"
                  style={{ color: trackerToneColor(s.tone) }}
                >
                  {s.icon ?? (
                    <span className="size-2.5 rounded-[3px]" style={{ background: trackerToneColor(s.tone) }} />
                  )}
                </span>
                <span>{s.label}</span>
                <span className="font-semibold text-sheen-fg tabular-nums">{fmtCount(n)}</span>
              </li>
            );
          })}
        </ul>
      )}
      <ChartAnnouncer text={announce(announceText)} />
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of TrackerTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type TrackerTableProps = Pick<TrackerChartProps, "data" | "statuses" | "formatLabel" | "locale" | "labels"> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Sets the sort order: newest first (default), or oldest first. */
  order?: "newest" | "oldest";
  /** Rows shown before "Show all" (opening the table stays instant on long strips). Default 30. */
  limit?: number;
};

/**
 * Every block: its period, status (icon + label) and detail.
 *
 * Props: the chart's `data`, `statuses`, `formatLabel`, `locale` and `labels`, plus `caption` (hidden, names the table), `order` ("newest" first by default, or "oldest") and `limit` (rows before "Show all"). A real table: period, status (icon and label) and detail. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { TrackerTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TrackerTable
 *       data={[{ label: "Mon", status: "up" }, { label: "Tue", status: "down", detail: "API outage" }]}
 *       statuses={{ up: { label: "Operational", tone: "success" }, down: { label: "Outage", tone: "danger" } }}
 *       caption="API uptime"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/uptime-tracker
 */
export function TrackerTable({
  data,
  statuses = defaultTrackerStatuses,
  formatLabel,
  locale,
  labels: labelOverrides,
  caption,
  order = "newest",
  limit = 30,
}: TrackerTableProps) {
  const t = { ...defaultTrackerChartLabels, ...labelOverrides };
  const labelText = useLabelText(locale, formatLabel);
  const fallback = statuses.none ?? noDataStatus;
  const ordered = useMemo(() => (order === "newest" ? [...data].reverse() : data), [data, order]);
  const { rows, hidden, showAll } = useTableRows(ordered, { cap: limit });
  return (
    <div className="flex flex-col gap-3">
      <ChartValueTable
        caption={caption}
        emptyState={t.empty}
        className="max-h-80 overflow-y-auto overscroll-contain"
        columns={[{ label: t.period }, { label: t.status, align: "start" }, { label: t.detail, align: "start" }]}
        rows={rows.map((b) => {
          const s = statuses[b.status] ?? fallback;
          return [
            labelText(b.label),
            <span key="s" className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="flex size-3.5 items-center justify-center [&>svg]:size-3.5"
                style={{ color: trackerToneColor(s.tone) }}
              >
                {s.icon}
              </span>
              {s.label}
            </span>,
            b.detail ?? "",
          ];
        })}
      />
      <ShowAllRows hidden={hidden} total={data.length} label={t.showAll} onClick={showAll} />
    </div>
  );
}
