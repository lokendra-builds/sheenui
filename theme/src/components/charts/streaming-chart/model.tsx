"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, usePageInView, useTransform, type MotionValue } from "motion/react";

import { useLatest, useSyncRef } from "../../../hooks/use-latest";
import { duration, ease } from "../../../motion/tokens";
import { decimalsOf, num, type ChartRow, type ChartSeries, ORIGIN_PT, type ChartInstructions } from "../chart-utils";
import { type Pt } from "../streamgraph";

/* ======================================================================
 * Data: a rolling buffer fed by a source function
 * ====================================================================== */

/**
 * A function that makes the next sample of a live chart from the time and the sample number: one
 * number or one number per series key.
 */
export type StreamingSource = (time: number, index: number) => number | Record<string, number>;

/**
 * Options of `useStreamingData`: sample rate, capacity, how much history to start with, the row keys
 * and when to pause.
 */
export type UseStreamingDataOptions = {
  /** Milliseconds between samples. Default 1000. */
  rate?: number;
  /** Samples kept (older ones drop off). Default 240. */
  capacity?: number;
  /** Samples generated for the past at mount, so the chart starts full. Default 60. */
  history?: number;
  /** Key of the timestamp in each row. Default "time". */
  index?: string;
  /** Key of the value when the source returns a plain number. Default "value". */
  valueKey?: string;
  /** Sample at all. Default true. */
  enabled?: boolean;
  /**
   * Time (ms since the epoch) of the newest sample the first render shows. Default: the current time.
   * On a prerendered or server-rendered page the history must be the same on the server and in the
   * browser, so pass a fixed time here: the chart first draws history that ends then, and right after
   * mounting swaps it for history that ends now. Leave it out in a client-only app.
   */
  startAt?: number;
  /**
   * Stop sampling while the tab is hidden (no timers, no re-renders in the background). Back on
   * the tab, the missed samples are filled in from `source`, so the line stays continuous and
   * the chart glides to the present. Default true.
   */
  pauseWhenHidden?: boolean;
  /**
   * Rest without losing time, e.g. while the chart is scrolled off-screen: no timer and no
   * re-renders while true; when it turns false, the missed samples are filled in from `source`
   * (as after a hidden tab). Default false.
   */
  idle?: boolean;
};

/**
 * A rolling buffer of samples: calls `source(time, index)` every `rate` ms and keeps the last
 * `capacity` rows, `{ time, ...values }`. Feed the result to StreamingChart's `data` (and its
 * table). For a socket or server feed, keep your own array instead; the chart only needs rows.
 * Call it in the small component that renders the chart, so each sample re-renders only that.
 *
 * Returns the rows (`{ time, ...values }`, oldest first) as `ChartRow[]`. `source(time, index)` returns one number (stored under `valueKey`, default "value") or an object of numbers. Options: `rate` ms (default 1000), `capacity` rows kept (240), `history` rows prefilled (60), `index` key (default "time"), `valueKey`, `enabled`, `startAt`, `pauseWhenHidden` (default true) and `idle` (rest while off-screen; missed samples are filled in when it resumes).
 * Not a component: no DOM, keyboard or screen-reader behaviour. It stops sampling in hidden tabs, so it costs nothing in the background.
 *
 * @example
 * ```tsx
 * import { StreamingChart, useStreamingData } from "@sheenui/theme";
 *
 * function Cpu() {
 *   const rows = useStreamingData((_time, i) => 40 + 20 * Math.sin(i / 5), { rate: 1000 });
 *   return <StreamingChart data={rows} series={[{ key: "value", label: "CPU load" }]} aria-label="CPU load, live" />;
 * }
 * ```
 *
 * @see /charts/realtime-chart
 */
export function useStreamingData(source: StreamingSource, options: UseStreamingDataOptions = {}) {
  const {
    rate = 1000,
    capacity = 240,
    history = 60,
    index = "time",
    valueKey = "value",
    enabled = true,
    pauseWhenHidden = true,
    idle = false,
    startAt,
  } = options;
  const sourceRef = useLatest(source);
  const counter = useRef(0);
  const newest = useRef(0); // time of the newest sample
  const pageVisible = usePageInView();
  // Resting (a hidden tab, or `idle`) skips samples; they are filled in when sampling resumes.
  const restPause = useRef(false);
  const resting = idle || (pauseWhenHidden && !pageVisible);
  const running = enabled && !resting;
  useEffect(() => {
    if (enabled && resting) restPause.current = true;
  });

  const toRow = useCallback(
    (time: number, value: number | Record<string, number>): ChartRow =>
      typeof value === "number" ? { [index]: time, [valueKey]: value } : { ...value, [index]: time },
    [index, valueKey],
  );
  /** `history` past samples ending one interval before `now`. */
  const buildHistory = useCallback(
    (now: number, read: StreamingSource) => {
      const count = Math.max(0, Math.min(capacity, Math.floor(history)));
      return Array.from({ length: count }, (_, i) => {
        const time = now - (count - i) * rate;
        return toRow(time, read(time, i));
      });
    },
    [capacity, history, rate, toRow],
  );
  /** Records the sample counter and the newest time from a built history (called from effects only). */
  const seed = useCallback(
    (built: ChartRow[]) => {
      counter.current = built.length;
      const last = built[built.length - 1];
      newest.current = last ? num(last[index]) : 0;
      return built;
    },
    [index],
  );
  const [rows, setRows] = useState<ChartRow[]>(() => buildHistory(startAt ?? Date.now(), source));
  // A fixed `startAt` was only for the first render (the server's and the browser's must match): now that the
  // page is live, the history ends at the real current time, so the first live sample follows it without a gap.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return; // once, on mount: later changes of rate or capacity keep the data on screen
    seeded.current = true;
    if (startAt !== undefined) setRows(seed(buildHistory(Date.now(), sourceRef.current)));
    else seed(rows);
  }, [startAt, buildHistory, seed, rows, sourceRef]);
  useEffect(() => {
    if (!running) return;
    const sample = (time: number) => {
      newest.current = time;
      return toRow(time, sourceRef.current(time, counter.current++));
    };
    const append = (added: ChartRow[]) =>
      setRows((prev) => {
        const next = prev.concat(added);
        return next.length > capacity ? next.slice(next.length - capacity) : next;
      });
    // Back from a rest: fill the gap it left, so the line never jumps across it.
    if (restPause.current && newest.current > 0) {
      const missed = Math.min(capacity, Math.floor((Date.now() - newest.current) / rate));
      const from = newest.current;
      if (missed > 0) append(Array.from({ length: missed }, (_, i) => sample(from + (i + 1) * rate)));
    }
    restPause.current = false;
    const timer = window.setInterval(() => append([sample(Date.now())]), rate);
    return () => window.clearInterval(timer);
  }, [running, rate, capacity, toRow, sourceRef]);
  return rows;
}

/* ======================================================================
 * Chart
 * ====================================================================== */

/**
 * Every string StreamingChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type StreamingChartLabels = {
  instructions: ChartInstructions;
  live: string;
  paused: string;
  /** Status while someone reads a value (the view holds still). */
  holding: string;
  pause: string;
  resume: string;
  waiting: string;
  /** Table header for the timestamp column. */
  time: string;
};

/**
 * The built-in English strings of StreamingChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultStreamingChartLabels: StreamingChartLabels = {
  instructions: "Use left and right arrow keys to read recent values; the view holds still while you read.",
  live: "Live",
  paused: "Paused",
  holding: "Holding",
  pause: "Pause",
  resume: "Resume",
  waiting: "Waiting for data…",
  time: "Time",
};

/**
 * Props of StreamingChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type StreamingChartProps = {
  /** Samples so far, oldest first: `{ time, …values }`. Append rows as they arrive (or use useStreamingData). */
  data: readonly ChartRow[];
  /** Key of the timestamp (ms) in each row. Default "time". */
  index?: string;
  /** Up to 4 lines, each with a fixed `color` slot. */
  series: readonly ChartSeries[];
  /** Expected ms between samples. The view trails the newest sample by this much, so points glide in. Default 1000. */
  rate?: number;
  /** How much time is in view, in samples. Default 60. */
  window?: number;
  /** Pause the view (controlled). Data keeps arriving; resuming glides to the present. */
  paused?: boolean;
  /** Starts in the paused state (uncontrolled). Default false. */
  defaultPaused?: boolean;
  /** Called with the new paused state when the user pauses or resumes (controlled `paused`). */
  onPausedChange?: (paused: boolean) => void;
  /** Fill under each line with a fading wash. Default true. */
  area?: boolean;
  /** Keep zero on the value axis. Default false (the axis hugs the data). */
  zero?: boolean;
  /** Sets the height of the plot in px. Default 240. */
  height?: number;
  /** Formats a value for the axis, tooltip and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats a timestamp as text. Default: "2:05:09 PM" (or "14:05:09") in `locale`. */
  formatTime?: (time: Date) => string;
  /** BCP 47 locale of the default formats. Default: the browser's; pass one on prerendered pages. */
  locale?: string;
  /** IANA time zone of the default time format, e.g. "UTC". Default: the viewer's; pass one on prerendered pages. */
  timeZone?: string;
  /** Shown before the first sample arrives. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<StreamingChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** The time steps, in milliseconds, that tick spacing can snap to. @internal */
export const STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200].map((s) => s * 1000);
/** The average glyph width of the tick labels, in pixels. @internal */
export const CHAR_W = 6.8; // average glyph width of the 11px tick labels ("%" and "$" run wide)
/** The time formatter options of the x-axis ticks. @internal */
export const TIME_OPTIONS: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", second: "2-digit" };
/** Isolates a formatted value inside right-to-left text, so "11:18:30 PM" never reads "PM 11:18:30". */
export const isolate = (s: string) => `⁨${s}⁩`;

/** One drawn line: points, colour and curve tangents. @internal */
export type Line = { key: string; color: string; pts: Pt[]; tangents: number[] };

/** Value of a monotone curve at x (exact Hermite evaluation of the segment containing x). */
export function curveAt(line: Line, x: number) {
  const { pts, tangents } = line;
  const n = pts.length;
  if (n === 0) return null;
  if (x <= (pts[0] ?? ORIGIN_PT)[0]) return (pts[0] ?? ORIGIN_PT)[1];
  if (x >= (pts[n - 1] ?? ORIGIN_PT)[0]) return (pts[n - 1] ?? ORIGIN_PT)[1];
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((pts[mid] ?? ORIGIN_PT)[0] <= x) lo = mid;
    else hi = mid;
  }
  const [x0, y0] = pts[lo] ?? ORIGIN_PT;
  const [x1, y1] = pts[hi] ?? ORIGIN_PT;
  const h = x1 - x0 || 1;
  const s = (x - x0) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * y0 +
    (s3 - 2 * s2 + s) * h * (tangents[lo] ?? 0) +
    (-2 * s3 + 3 * s2) * y1 +
    (s3 - s2) * h * (tangents[hi] ?? 0)
  );
}

/** A number that rolls to each new value (a MotionValue text node: no re-render while it rolls). */
export function RollingValue({
  value,
  format,
  reduced,
}: {
  value: number;
  format: (n: number) => string;
  reduced: boolean;
}) {
  const mv = useMotionValue(value);
  // While it rolls, the number keeps the target's precision (a custom format never shows 41.2938%).
  const places = useRef(decimalsOf(value));
  const text = useTransform(mv, (v) => format(Number(v.toFixed(places.current))));
  useEffect(() => {
    places.current = decimalsOf(value);
    if (reduced) {
      mv.jump(value);
      return;
    }
    const controls = animate(mv, value, { duration: duration.slow, ease: ease.out });
    return () => controls.stop();
  }, [value, reduced, mv]);
  return (
    <bdi>
      <motion.span>{text}</motion.span>
    </bdi>
  );
}

/** One value-axis gridline and label. It follows the easing value axis through MotionValues. */
export function Tick({
  value,
  label,
  innerW,
  innerH,
  lo,
  hi,
}: {
  value: number;
  label: string;
  innerW: number;
  innerH: number;
  lo: MotionValue<number>;
  hi: MotionValue<number>;
}) {
  const geo = useRef({ value, innerH });
  useSyncRef(geo, { value, innerH });
  const y = useTransform([lo, hi], ([l, h]: number[]) => {
    const g = geo.current;
    return (g.innerH * ((h ?? 0) - g.value)) / Math.max(1e-9, (h ?? 0) - (l ?? 0));
  });
  const opacity = useTransform([lo, hi], ([l, h]: number[]) =>
    geo.current.value >= (l ?? 0) - 1e-9 && geo.current.value <= (h ?? 0) + 1e-9 ? 1 : 0,
  );
  return (
    <motion.g style={{ y, opacity }}>
      <line x2={innerW} stroke="var(--sheen-chart-grid)" />
      <text x={-10} dy="0.32em" textAnchor="end" className="fill-sheen-fg-muted text-2xs tabular-nums">
        {label}
      </text>
    </motion.g>
  );
}
