"use client";

import { createContext, lazy, useCallback, useContext, useEffect, useMemo, useState } from "react";

/** Base UI's Menu is ~45 KB gzip: the download menu loads as its own chunk (see chart-export-menu.tsx). */
export const ChartExportMenu = lazy(() => import("../chart-export-menu"));

/* ====================================================================================
 * Series visibility: interactive legends (click hides a series, hover dims the others).
 * A ChartCard owns the state and shares it with the chart inside through context; charts
 * that support it (LineChart, AreaChart, BarChart, DonutChart) register, which turns the
 * card's legend into toggle buttons. Charts that don't register keep a static legend.
 * ==================================================================================== */

/**
 * The shared legend state of a ChartCard: hidden series, the highlighted series and the functions that
 * change them.
 */
export type ChartSeriesState = {
  /** Keys of the hidden series. */
  hidden: ReadonlySet<string>;
  /** Key of the series being pointed at in the legend (the others dim), or null. */
  highlighted: string | null;
  toggle: (key: string) => void;
  setHighlighted: (key: string | null) => void;
};

/** The shared series state plus the `register` call a series makes on mount. @internal */
export type SeriesContextValue = ChartSeriesState & { register: () => () => void };

/** Shares series visibility between a legend and its chart. @internal */
export const SeriesContext = createContext<SeriesContextValue | null>(null);
/** A stable empty set, so a default never changes identity. @internal */
export const EMPTY_SET: ReadonlySet<string> = new Set();

/**
 * Hidden / highlighted series state for building your own interactive legend + chart pair.
 *
 * Returns `{ hidden, highlighted, toggle, setHighlighted }`. `defaultHidden` lists the series keys hidden at first. A ChartCard does this for you; use the hook when the legend and the chart live in different parts of the page.
 * Not a component: no DOM, keyboard or screen-reader behaviour of its own (the legend you pair it with is a group of toggle buttons).
 *
 * @example
 * ```tsx
 * import { ChartLegend, LineChart, seriesLegend, useChartSeriesState } from "@sheenui/theme";
 *
 * const series = [
 *   { key: "a", label: "Organic" },
 *   { key: "b", label: "Paid" },
 * ];
 * const rows = [
 *   { m: "Jan", a: 4, b: 2 },
 *   { m: "Feb", a: 6, b: 3 },
 * ];
 *
 * function Pair() {
 *   const state = useChartSeriesState();
 *   return (
 *     <>
 *       <ChartLegend items={seriesLegend(series, "line")} hidden={state.hidden} onToggle={state.toggle} onHighlight={state.setHighlighted} />
 *       <LineChart data={rows} index="m" series={series} hiddenSeries={[...state.hidden]} highlightedSeries={state.highlighted} aria-label="Visits by channel" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function useChartSeriesState(defaultHidden: readonly string[] = []): ChartSeriesState {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set(defaultHidden));
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const toggle = useCallback((key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);
  return useMemo(() => ({ hidden, highlighted, toggle, setHighlighted }), [hidden, highlighted, toggle]);
}

/**
 * For chart authors: the series visibility to draw with. Explicit props win; otherwise the
 * enclosing ChartCard's legend state (and this chart registers itself, so the legend becomes
 * interactive). Pass `enabled: false` to opt out.
 *
 * Options: `hiddenSeries` (keys to hide; wins over the card), `highlightedSeries` (key to emphasise, or null) and `enabled` (default true; false ignores the card). Returns `{ hidden: ReadonlySet<string>, highlighted: string | null }`.
 * Not a component: no DOM, keyboard or screen-reader behaviour. Registering with the card is what turns its legend into toggle buttons.
 *
 * @example
 * ```tsx
 * import { useChartSeriesVisibility } from "@sheenui/theme";
 *
 * function MyChart({ hiddenSeries }: { hiddenSeries?: string[] }) {
 *   const { hidden, highlighted } = useChartSeriesVisibility({ hiddenSeries });
 *   return (
 *     <p>
 *       {hidden.size} hidden, {highlighted ?? "none"} highlighted
 *     </p>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function useChartSeriesVisibility({
  hiddenSeries,
  highlightedSeries,
  enabled = true,
}: {
  hiddenSeries?: readonly string[];
  highlightedSeries?: string | null;
  enabled?: boolean;
} = {}) {
  const ctx = useContext(SeriesContext);
  const fromCard = enabled ? ctx : null;
  const register = fromCard?.register;
  useEffect(() => (register ? register() : undefined), [register]);
  // The joined keys are the identity, so a new array with the same keys doesn't re-render marks.
  const hiddenKey = hiddenSeries?.join("\u0001");
  const cardHidden = fromCard?.hidden;
  const hidden = useMemo<ReadonlySet<string>>(
    () => (hiddenKey !== undefined ? new Set(hiddenKey ? hiddenKey.split("\u0001") : []) : (cardHidden ?? EMPTY_SET)),
    [hiddenKey, cardHidden],
  );
  return {
    hidden,
    highlighted: highlightedSeries !== undefined ? highlightedSeries : (fromCard?.highlighted ?? null),
  };
}
