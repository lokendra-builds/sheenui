"use client";

import { memo, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { duration, spring } from "../../../motion/tokens";
import { ChartAnnouncer } from "../chart-parts";
import { type GanttScale } from "./types";
import { HEADER_TOP, HEADER } from "./layout";
import { useActiveKey, type ActiveStore } from "./store";

/** Where the highlight behind the row being read goes (it glides between rows). */
export function useHighlight(store: ActiveStore, rowIndex: ReadonlyMap<string, number>, rowY: number[]) {
  const key = useActiveKey(store);
  const i = key === null ? -1 : (rowIndex.get(key) ?? -1);
  return { y: i >= 0 ? (rowY[i] ?? 0) : (rowY[0] ?? 0), opacity: i >= 0 ? 1 : 0 };
}
/** The transition of the row highlight as it glides between rows (instant under reduced motion). */
export const highlightGlide = (reduced: boolean) =>
  reduced ? { duration: 0 } : { y: spring.snappy, opacity: { duration: duration.fast } };

/** The sliding highlight behind the active row, in the task-name column. */
export const LabelHighlight = memo(function LabelHighlight({
  store,
  rowIndex,
  rowY,
  rowH,
  reduced,
}: {
  store: ActiveStore;
  rowIndex: ReadonlyMap<string, number>;
  rowY: number[];
  rowH: number;
  reduced: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-1 top-0 rounded-sheen-sm bg-sheen-hover"
      initial={false}
      animate={useHighlight(store, rowIndex, rowY)}
      transition={highlightGlide(reduced)}
      style={{ height: rowH }}
    />
  );
});

/** The same highlight across the timeline. */
export const TimelineHighlight = memo(function TimelineHighlight({
  store,
  rowIndex,
  rowY,
  rowH,
  width,
  reduced,
}: {
  store: ActiveStore;
  rowIndex: ReadonlyMap<string, number>;
  rowY: number[];
  rowH: number;
  width: number;
  reduced: boolean;
}) {
  return (
    <motion.rect
      x={0}
      width={width}
      height={rowH}
      rx={6}
      className="fill-sheen-hover"
      initial={false}
      animate={useHighlight(store, rowIndex, rowY)}
      transition={highlightGlide(reduced)}
    />
  );
});

/** The tooltip (or the docked readout) of the task being read; `fallback` while none is. */
export function GanttReadout({
  store,
  read,
  fallback,
}: {
  store: ActiveStore;
  read: (key: string, scroll: number) => ReactNode;
  fallback: ReactNode;
}) {
  const key = useActiveKey(store);
  const scroll = useSyncExternalStore(
    store.subscribe,
    () => store.get().scroll,
    () => 0,
  );
  return (key === null ? null : read(key, scroll)) ?? fallback;
}

/** Announces the task being read (keyboard moves only: `text` returns "" for pointer reads). */
export function GanttAnnouncer({ store, text }: { store: ActiveStore; text: (key: string) => string }) {
  const key = useActiveKey(store);
  return <ChartAnnouncer text={key === null ? "" : text(key)} />;
}

/** The ticks of the timeline: the top header (months) and bottom header (days or weeks) with their day ranges and labels. */
export type Ticks = {
  top: { a: number; b: number; label: string; short: string }[];
  bottom: { a: number; b: number; label: string; weekend?: boolean }[];
};

/**
 * Weekend bands (day zoom) and the grid: a hairline per bottom tick, a firmer one per top tick.
 * Each kind is ONE path, so a zoom to days adds three nodes, not hundreds.
 */
export const GridLayer = memo(function GridLayer({
  ticks,
  weekends,
  rangeStart,
  px,
  contentW,
  height,
  rtl,
}: {
  ticks: Ticks;
  weekends: boolean;
  rangeStart: number;
  px: number;
  contentW: number;
  height: number;
  rtl: boolean;
}) {
  const at = (day: number) => {
    const o = (day - rangeStart) * px;
    return rtl ? contentW - o : o;
  };
  const r = (n: number) => Math.round(n * 10) / 10;
  let bands = "";
  if (weekends)
    for (const t of ticks.bottom)
      if (t.weekend)
        bands += `M${r(Math.min(at(t.a), at(t.b)))},${HEADER}h${r(px * (t.b - t.a))}V${height}h${-r(px * (t.b - t.a))}Z`;
  let minor = "";
  for (const t of ticks.bottom) minor += `M${r(at(t.a))},${HEADER_TOP}V${height}`;
  let major = "";
  for (const t of ticks.top) major += `M${r(at(t.a))},0V${height}`;
  return (
    <g className="pointer-events-none">
      {bands && <path d={bands} fill="var(--sheen-chart-grid)" opacity={0.6} />}
      {minor && <path d={minor} fill="none" stroke="var(--sheen-chart-grid)" />}
      {major && <path d={major} fill="none" className="stroke-sheen-border" />}
      <line x1={0} x2={contentW} y1={HEADER - 0.5} y2={HEADER - 0.5} className="stroke-sheen-border" />
    </g>
  );
});

/**
 * Header labels. The top tier (months, or years) is sticky: syncTimeline slides each label to stay
 * in view while its segment is; labels thin out when they would collide.
 */
export const HeaderLabels = memo(function HeaderLabels({
  ticks,
  scale,
  rangeStart,
  px,
  contentW,
  rtl,
  todayDay,
}: {
  ticks: Ticks;
  scale: GanttScale;
  rangeStart: number;
  px: number;
  contentW: number;
  rtl: boolean;
  todayDay: number | null;
}) {
  const offset = (day: number) => (day - rangeStart) * px;
  return (
    <g>
      {ticks.top.map((t) => {
        const w = (t.b - t.a) * px;
        const text = t.label.length * 6.6 + 12 <= w ? t.label : t.short.length * 6.6 + 12 <= w ? t.short : "";
        return text ? (
          <text
            key={`tl${t.a}:${text}`}
            data-sticky=""
            data-a={offset(t.a)}
            data-b={offset(t.b)}
            data-w={text.length * 6.6}
            visibility="hidden"
            y={HEADER_TOP - 8}
            className="fill-sheen-fg text-xs font-medium"
          >
            {text}
          </text>
        ) : null;
      })}
      {ticks.bottom.map((t) => {
        const w = (t.b - t.a) * px;
        if (t.label.length * 6.2 + 8 > w) return null;
        // Months (month zoom) are sticky too: a month cut by the edge of the view keeps its name.
        if (scale === "month")
          return (
            <text
              key={`bl${t.a}:${t.label}`}
              data-sticky=""
              data-a={offset(t.a)}
              data-b={offset(t.b)}
              data-w={t.label.length * 6.2}
              visibility="hidden"
              y={HEADER - 9}
              className="fill-sheen-fg-muted text-2xs tabular-nums"
            >
              {t.label}
            </text>
          );
        const s = offset(t.a);
        const x = rtl ? contentW - s - w : s;
        const isToday = scale === "day" && t.a === todayDay;
        return (
          <text
            key={`bl${t.a}`}
            x={scale === "day" ? x + w / 2 : x + (rtl ? w - 6 : 6)}
            y={HEADER - 9}
            textAnchor={scale === "day" ? "middle" : rtl ? "end" : "start"}
            className={cn(
              "text-2xs tabular-nums",
              isToday ? "fill-sheen-accent font-semibold" : t.weekend ? "fill-sheen-fg-subtle" : "fill-sheen-fg-muted",
            )}
          >
            {t.label}
          </text>
        );
      })}
    </g>
  );
});

/* ======================================================================
 * GanttChart
 * ====================================================================== */
