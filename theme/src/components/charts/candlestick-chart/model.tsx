"use client";

import { type ReactNode } from "react";

import { type ChartColor, type ChartInstructions } from "../chart-utils";
import { safeDateFormat } from "../category-bar";

/* ---------- Types ---------- */

/** One candlestick: its period start and the open, high, low and close prices, plus an optional volume. */
export type Candle = {
  /** When the period starts: a Date, an ISO string or a timestamp. Oldest first. */
  date: Date | string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Traded volume, drawn in its own strip under the prices. */
  volume?: number;
};

/**
 * Every string CandlestickChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type CandlestickChartLabels = {
  instructions: ChartInstructions;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  /** Short names in the readout. */
  openShort: string;
  highShort: string;
  lowShort: string;
  closeShort: string;
  volumeShort: string;
  /** Spoken direction of a candle against the previous close. */
  up: string;
  down: string;
  unchanged: string;
  /** Moving average name, e.g. "MA 20". */
  average: (period: number) => string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  /** Shown briefly when someone scrolls over the chart without the zoom key held. */
  zoomHint: (key: string) => string;
  /** Table headers. */
  date: string;
  change: string;
  empty: string;
  /** Button under a long table, e.g. "Show all 160 rows". */
  showAll: (rows: number) => string;
};

/**
 * The built-in English strings of CandlestickChart; spread it into your own `labels` and change what
 * you need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultCandlestickChartLabels: CandlestickChartLabels = {
  instructions:
    "Use left and right arrow keys to read each candle, plus and minus to zoom, Shift with the arrows to pan.",
  open: "open",
  high: "high",
  low: "low",
  close: "close",
  volume: "volume",
  openShort: "O",
  highShort: "H",
  lowShort: "L",
  closeShort: "C",
  volumeShort: "Vol",
  up: "up",
  down: "down",
  unchanged: "unchanged",
  average: (n) => `MA ${n}`,
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetZoom: "Show all",
  zoomHint: (key) => `Hold ${key} and scroll to zoom`,
  date: "Date",
  change: "Change",
  empty: "No data",
  showAll: (rows) => `Show all ${rows} rows`,
};

/**
 * Props of CandlestickChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type CandlestickChartProps = {
  /** One candle per period, oldest first. Candles with a missing price are skipped. */
  data: readonly Candle[];
  /** "candle" (default): bodies and wicks. "ohlc": bars with an open tick (left) and a close tick (right). */
  mode?: "candle" | "ohlc";
  /** Show the volume strip under the prices. Default: when any candle has a volume. */
  volume?: boolean;
  /** Overlay a simple moving average of the close over this many periods (e.g. 20). */
  average?: number;
  /** Sets the height of the price panel in px. Default 300. */
  height?: number;
  /** Sets the height of the volume strip in px. Default 64. */
  volumeHeight?: number;
  /**
   * Palette slots for rising and falling candles: green and red that hold >= 3:1 on the chart surface in both themes
   * (slot 6 / 8 in light, the status hues in dark). Rising candles are hollow, falling ones filled.
   *
   * @default green (rising), red (falling)
   */
  upColor?: ChartColor;
  /** Sets the palette slot (1 to 8) of falling candles. */
  downColor?: ChartColor;
  /** Sets the palette slot of the moving average. Default 1. */
  averageColor?: ChartColor;
  /** Formats a price for the axis, tooltip and data table: takes the number, returns the text shown. Default: 2 decimals in `locale`. */
  format?: (n: number) => string;
  /** Formats a volume figure as text. Default: compact in `locale`. */
  formatVolume?: (n: number) => string;
  /**
   * Formats dates (readout, table): "Thu, Oct 3, 2026" in `locale`, with the time for intraday data.
   *
   * @default "Thu, Oct 3, 2026" in locale
   */
  formatDate?: (d: Date) => string;
  /** Locale of the default number and date formats. Default "en". */
  locale?: string;
  /** IANA time zone of the default date formats, e.g. the exchange's "America/New_York". Default: the viewer's. */
  timeZone?: string;
  /** Zoom (Ctrl/⌘ + scroll, pinch, + / −) and pan (drag, Shift + arrows). Default true. */
  zoom?: boolean;
  /** Initial visible window, as candle indices [start, end). Default: every candle. */
  defaultRange?: [number, number];
  /** Called with the visible window [start, end) whenever it changes. */
  onRangeChange?: (range: [number, number]) => void;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<CandlestickChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** One candle with its date parsed and prices in `o/h/l/c` form. @internal */
export type Parsed = {
  date: Date;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number | null;
  prev: number | null;
  ma: number | null;
};

/** The fewest candles a zoom can show. @internal */
export const MIN_SPAN = 12; // fewest candles a zoom can show
/** The height of the price and date tags on the axes, in pixels. @internal */
export const PILL_H = 18; // price and date tags on the axes
/** Default rising / falling hues: >= 3:1 on the chart surface in both themes. */
export const UP = "light-dark(var(--sheen-chart-6), var(--sheen-success))";
/** The colour of a falling candle. @internal */
export const DOWN = "light-dark(var(--sheen-chart-8), var(--sheen-danger))";
/** The average glyph width used to size the axis gutters, in pixels. @internal */
export const AXIS_CH = 6.6;

/** Coerces at the data boundary: prices often arrive from JSON as numeric strings, whatever the `Candle` type says. */
export const asNumber = (value: unknown) => Number(value);

/** Valid candles with their previous close and the moving average (when asked).
 *
 * @see /charts/candlestick
 */
export function parseCandles(data: readonly Candle[], average = 0): Parsed[] {
  const out: Parsed[] = [];
  let sum = 0;
  const window: number[] = [];
  for (const d of data) {
    const o = asNumber(d.open);
    const c = asNumber(d.close);
    const hi = asNumber(d.high);
    const lo = asNumber(d.low);
    if (![o, c, hi, lo].every(Number.isFinite)) continue;
    const date = d.date instanceof Date ? d.date : new Date(d.date);
    const v = d.volume === undefined || !Number.isFinite(asNumber(d.volume)) ? null : Math.max(0, asNumber(d.volume));
    let ma: number | null = null;
    if (average > 0) {
      window.push(c);
      sum += c;
      if (window.length > average) sum -= window.shift() ?? 0;
      if (window.length === average) ma = sum / average;
    }
    out.push({
      date,
      o,
      c,
      h: Math.max(hi, lo, o, c),
      l: Math.min(hi, lo, o, c),
      v,
      prev: out[out.length - 1]?.c ?? null,
      ma,
    });
  }
  return out;
}

/** The axis and tooltip date formatters for the candle interval and time zone. @internal */
export function dateFormats(locale: string | undefined, intraday: boolean, timeZone?: string) {
  const make = (opts: Intl.DateTimeFormatOptions) => safeDateFormat(locale, { ...opts, timeZone });
  return {
    axis: make(intraday ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" }),
    full: make(
      intraday
        ? { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
        : { weekday: "short", month: "short", day: "numeric", year: "numeric" },
    ),
  };
}

/** The small up or down triangle of a price change. @internal */
export const Triangle = ({ down }: { down?: boolean }) => (
  <svg aria-hidden width={8} height={8} viewBox="0 0 8 8" className="shrink-0 fill-current">
    <path d={down ? "M0 1.5h8L4 7z" : "M0 6.5h8L4 1z"} />
  </svg>
);
