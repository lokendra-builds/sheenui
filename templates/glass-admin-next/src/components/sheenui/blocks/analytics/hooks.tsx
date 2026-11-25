"use client";

import type { ComponentProps } from "react";
import { useControllable } from "../../hooks/use-controllable";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useLatest } from "../../hooks/use-latest";

import { isScrolling } from "../../motion/beat";
import { useLoopPlayback } from "../../motion/gate";
import { type AnalyticsLoader, type AnalyticsRange, type AnalyticsStatus, shareStructure } from "./data";

/** Where `useDashboardData` is: first load or reload (`loading`), data on screen (`ready`), or the last load failed (`error`). */
export type DashboardStatus = "loading" | "ready" | "error";

type DataState<Q, D> = { data: D | null; error: unknown; key: string | null; query: Q | null };

/**
 * The one data-loading hook of every dashboard. It loads data for `query` whenever `queryKey` changes (a dashboard's
 * query is not always just range + filters). The previous data stays on screen while the next loads (the frame never
 * flashes empty), stale responses are dropped and their request is aborted, errors keep the old data for a retry, and
 * `update` evolves the data in place (live ticks) without a loading state. `loading` is derived (the loaded key differs
 * from the asked one), so a click never pays for an extra render, and `retry` / `update` keep their identity. New data
 * is committed in a transition, so React renders big charts in slices. `query` is what the data on screen answers.
 *
 * Parameters: `load` (`(query: Q, signal: AbortSignal) => D | Promise<D>`; the `signal` aborts when the key changes or the
 * component unmounts), `query` (`Q`, the current request) and `queryKey` (`string`, a stable key of `query`: the load
 * re-runs when it changes). Returns `{ data, status, loading, error, query, retry, update }`: `data` is `D | null`,
 * `status` a `DashboardStatus`, `retry()` reloads after an error and `update(fn)` patches the data in place.
 * Accessibility, keyboard, glass and motion: none of its own (a data hook, no DOM); show `status` with an
 * `AnalyticsState` or a live region.
 *
 * @example
 * ```tsx
 * import { useDashboardData } from "@sheenui/theme";
 *
 * function Orders({ team }: { team: string }) {
 *   const { data, status, retry } = useDashboardData(
 *     async (q: { team: string }, signal) => (await fetch(`/api/orders?team=${q.team}`, { signal })).json() as Promise<number[]>,
 *     { team },
 *     team,
 *   );
 *   if (status === "error") return <button type="button" onClick={retry}>Retry</button>;
 *   return <p>{data ? data.length : "Loading"}</p>;
 * }
 * ```
 *
 * @see /dashboards/product
 */
export function useDashboardData<Q, D>(
  load: (query: Q, signal: AbortSignal) => D | Promise<D>,
  query: Q,
  queryKey: string,
) {
  const [state, setState] = useState<DataState<Q, D>>({ data: null, error: null, key: null, query: null });
  const [attempt, setAttempt] = useState(0);
  const latestRef = useLatest({ load, query });
  const key = `${queryKey}\u0000${attempt}`;

  useEffect(() => {
    // One AbortSignal per request: a newer query (or unmounting) aborts the one still in flight.
    const controller = new AbortController();
    Promise.resolve()
      .then(() => {
        const q = latestRef.current.query;
        return Promise.resolve(latestRef.current.load(q, controller.signal)).then((data) => [data, q] as const);
      })
      .then(
        ([data, q]) => {
          if (controller.signal.aborted) return;
          // A transition: React renders the new charts in slices instead of one long task.
          startTransition(() => setState((s) => ({ data: shareStructure(s.data, data), error: null, key, query: q })));
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          startTransition(() => setState((s) => ({ ...s, error: error ?? new Error("Failed to load"), key })));
        },
      );
    return () => controller.abort();
  }, [key, latestRef]);

  const update = useCallback((patch: (prev: D) => D) => {
    startTransition(() => setState((s) => (s.data === null || s.error ? s : { ...s, data: patch(s.data) })));
  }, []);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const loading = state.key !== key;
  const failed = !loading && Boolean(state.error);
  const status: DashboardStatus = failed ? "error" : loading ? "loading" : "ready";
  /** `query` is the one the data on screen answers (it lags the asked one while loading). */
  return { data: state.data, query: state.query, error: loading ? null : state.error, status, loading, update, retry };
}

/**
 * Hands `value` on after `index × step` ms, in a transition: when a dashboard's data changes,
 * its panels take the new data one after another, and each re-render is its own small task.
 *
 * Parameters: `value` (`T`, the latest value), `index` (`number`, this panel's place in the
 * order), `step` (`number`, default 45, milliseconds between panels). Returns the value to show.
 * Accessibility: none of its own (the delay is under half a second even for twelve panels).
 * Motion: no animation; it only staggers when the new data renders, so reduced motion needs no
 * special case.
 *
 * @example
 * ```tsx
 * import { useCascade } from "@sheenui/theme";
 *
 * function Panel({ rows, index }: { rows: number[]; index: number }) {
 *   const shown = useCascade(rows, index); // later panels update a little later
 *   return <p>{shown.length} rows</p>;
 * }
 * ```
 *
 * @see /dashboards/crypto-dashboard
 */
export function useCascade<T>(value: T, index: number, step = 45) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (Object.is(value, shown)) return;
    const t = window.setTimeout(() => startTransition(() => setShown(value)), index * step);
    return () => window.clearTimeout(t);
  }, [value, shown, index, step]);
  return shown;
}

/**
 * Render-prop form of `useCascade`: only this wrapper re-renders when its turn comes, so the
 * parent (and its other panels) stay untouched.
 *
 * Props: `value` (`T`, required, the latest value), `index` (`number`, required, the panel's
 * place in the order), `step` (`number`, default 45, milliseconds between panels), `children`
 * (`(value: T) => ReactNode`, required, renders with the delayed value).
 * Accessibility and keyboard: none of its own; it renders no element. Glass and motion: none; it
 * only staggers when data renders.
 *
 * @example
 * ```tsx
 * import { Cascade } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Cascade value={{ visitors: 1280 }} index={2}>
 *       {(data) => <p>{data.visitors} visitors</p>}
 *     </Cascade>
 *   );
 * }
 * ```
 *
 * @see /dashboards/crypto-dashboard
 */
export function Cascade<T>({
  value,
  index,
  step = 45,
  children,
}: {
  /** The data to hand to the children; panel number `index` receives it a beat after the one before. */
  value: T;
  /** Position of this panel in the cascade (0 is first). */
  index: number;
  /** Milliseconds between one panel receiving new data and the next. */
  step?: number;
  children: (value: T) => ReactNode;
}) {
  const shown = useCascade(value, index, step);
  return <>{children(shown)}</>;
}

/* ====================================================================================
 * Data + live hooks
 * ==================================================================================== */

/**
 * Calls `onTick` every `interval` ms while `enabled`, but only while `ref` is on screen and the
 * tab is visible: a live dashboard nobody is looking at costs nothing. Returns whether it runs.
 *
 * Parameters: `enabled` (`boolean`), `onTick` (`(tick: number) => void`, the tick count starts at
 * 1; the latest function is always used), and an options object: `ref` (`RefObject<Element | null>`,
 * required, the element whose visibility gates the ticks) and `interval` (`number`, default 2400,
 * milliseconds, never below 250).
 * Accessibility: pair live data with a pause control (WCAG 2.2.2); `enabled` is that switch.
 * Motion: it only schedules updates; it pauses off-screen and in hidden tabs.
 *
 * @example
 * ```tsx
 * import { useRef, useState } from "react";
 * import { useLiveTicker } from "@sheenui/theme";
 *
 * function LiveCount() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const [n, setN] = useState(0);
 *   useLiveTicker(true, (tick) => setN(tick), { ref, interval: 1000 });
 *   return <div ref={ref}>{n} ticks</div>;
 * }
 * ```
 *
 * @see /dashboards/product
 */
export function useLiveTicker(
  enabled: boolean,
  onTick: (tick: number) => void,
  { interval = 2400, ref }: { interval?: number; ref: RefObject<Element | null> },
) {
  const callbackRef = useLatest(onTick);
  const running = useLoopPlayback(ref, { paused: !enabled, margin: "0px", respectReducedMotion: false });
  useEffect(() => {
    if (!running) return;
    let tick = 0;
    // A tick that lands mid-scroll would rewrite chart paths in the frame being scrolled: skip it (the next one is at most `interval` away).
    const timer = window.setInterval(
      () => {
        if (!isScrolling()) callbackRef.current(++tick);
      },
      Math.max(250, interval),
    );
    return () => window.clearInterval(timer);
  }, [running, interval, callbackRef]);
  return running;
}

/* ====================================================================================
 * One hook for a whole dashboard's state
 * ==================================================================================== */

/** The state props every dashboard template takes (controlled or not). */
export type AnalyticsDashboardStateProps<T> = {
  /**
   * Loads the data for a range + filters (sync or async). Required: no dashboard falls back to fake data. The demo
   * loaders live in `@sheenui/theme/demo-data`, which the package root does not export.
   */
  load: AnalyticsLoader<T>;
  /** Evolves the data on each live tick (omit for no live updates). Return a new object; unchanged parts keep their identity. */
  liveStep?: (prev: T, tick: number) => T;
  /** Sets the active range when controlled. Pair with `onRangeChange`. */
  range?: AnalyticsRange;
  /**
   * The range at first when `range` is not controlled (`AnalyticsRange`); each dashboard picks its own.
   *
   * @default per dashboard
   */
  defaultRange?: AnalyticsRange;
  /** Called when the range changes. */
  onRangeChange?: (range: AnalyticsRange) => void;
  /** Values of the active filter chips (controlled). */
  activeFilters?: string[];
  /** The filters on at first when `activeFilters` is not controlled (`string[]`, default none). */
  defaultFilters?: string[];
  /** Called when the filter chips change. */
  onFiltersChange?: (filters: string[]) => void;
  /** Simulated live updates. The Live toggle pauses them (WCAG 2.2.2). */
  live?: boolean;
  /**
   * Whether live updates are on at first when `live` is not controlled (`boolean`); each dashboard picks its own.
   *
   * @default per dashboard
   */
  defaultLive?: boolean;
  /** Called when the Live toggle changes. */
  onLiveChange?: (live: boolean) => void;
  /** Show the previous period (dashed lines, "vs" values). */
  compare?: boolean;
  /**
   * Whether the comparison is on at first when `compare` is not controlled (`boolean`); each dashboard picks its own.
   *
   * @default per dashboard
   */
  defaultCompare?: boolean;
  /** Called when the Compare toggle changes. */
  onCompareChange?: (compare: boolean) => void;
  /**
   * Pin a state (docs, tests); "auto" follows the loader.
   * @default "auto"
   */
  status?: AnalyticsStatus;
};

/**
 * Wires a dashboard: controllable range / filters / live / compare, the loader, live ticks
 * (paused off-screen and in hidden tabs) and the resulting status. Attach `rootRef` to the root.
 * It is what every ready-made dashboard (web, SaaS, e-commerce, product, finance) is built on;
 * use it to build your own.
 *
 * Parameters: `props` (`AnalyticsDashboardStateProps<T>`, the controlled / default / callback
 * trios plus the required `load`, an optional `liveStep` and a pinned `status`) and an options object:
 * `liveStep` (`(prev, tick) => next`, a default for `props.liveStep`; makes the data live),
 * `liveInterval` (`number`, default 2400 ms), `defaults` (`{ range, live, compare }`) and
 * `isEmpty` (`(data) => boolean`). Returns the data result plus `status`
 * (`"ready" | "loading" | "empty" | "error"`), `ready`, `busy`, `range` / `setRange`,
 * `live` / `setLive`, `compare` / `setCompare`, `filters` / `setFilters`, `running` and `rootRef`.
 * Accessibility: live updates must stay pausable (WCAG 2.2.2): bind `live` to a toggle, as
 * `AnalyticsShell` does. Keyboard and glass: none of its own. Motion: ticks pause off-screen and
 * in hidden tabs.
 *
 * @example
 * ```tsx
 * import { useAnalyticsDashboard, type AnalyticsDashboardStateProps } from "@sheenui/theme";
 *
 * function MyDashboard(props: AnalyticsDashboardStateProps<number[]>) {
 *   const d = useAnalyticsDashboard(props, {
 *     defaults: { range: "7d", live: false, compare: false },
 *     isEmpty: (data) => data.length === 0,
 *   });
 *   return <div ref={d.rootRef}>{d.status === "ready" ? d.data?.join(", ") : d.status}</div>;
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function useAnalyticsDashboard<T>(
  props: AnalyticsDashboardStateProps<T>,
  {
    liveStep: defaultLiveStep,
    liveInterval = 2400,
    defaults,
    isEmpty,
  }: {
    liveStep?: (prev: T, tick: number) => T;
    liveInterval?: number;
    defaults: { range: AnalyticsRange; live: boolean; compare: boolean };
    isEmpty: (data: T) => boolean;
  },
) {
  const status = props.status ?? "auto";
  const liveStep = props.liveStep ?? defaultLiveStep;
  const [range, setRange] = useControllable(props.range, props.defaultRange ?? defaults.range, props.onRangeChange);
  const [live, setLive] = useControllable(props.live, props.defaultLive ?? defaults.live, props.onLiveChange);
  const [compare, setCompare] = useControllable(
    props.compare,
    props.defaultCompare ?? defaults.compare,
    props.onCompareChange,
  );
  const [filters, setFilters] = useControllable<string[]>(
    props.activeFilters,
    props.defaultFilters ?? EMPTY,
    props.onFiltersChange,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const query = useMemo(() => ({ range, filters }), [range, filters]);
  const filtersKey = filters.join("\u0001");
  const result = useDashboardData(props.load, query, `${range}\u0002${filtersKey}`);
  const { data, error, update } = result;

  const stepRef = useLatest(liveStep);
  const tick = useCallback(
    (n: number) => update((prev) => (stepRef.current ? stepRef.current(prev, n) : prev)),
    [update, stepRef],
  );
  const running = useLiveTicker(Boolean(liveStep) && live && status === "auto" && data !== null, tick, {
    ref: rootRef,
    interval: liveInterval,
  });

  const shown: "ready" | "loading" | "empty" | "error" =
    status === "loading"
      ? "loading"
      : status === "empty"
        ? "empty"
        : status === "error"
          ? "error"
          : error
            ? "error"
            : data && isEmpty(data)
              ? "empty"
              : data
                ? "ready"
                : "loading";
  return {
    ...result,
    status: shown,
    ready: shown === "ready",
    busy: status === "auto" && result.loading && data !== null,
    range,
    setRange,
    live,
    setLive,
    compare,
    setCompare,
    filters,
    setFilters,
    running,
    rootRef,
  };
}

const EMPTY: string[] = [];

/** Props of {@link Cascade}. Render-prop form of `useCascade`: only this wrapper re-renders when its turn comes, so the parent (and its other panels) stay untouched. */
export type CascadeProps = ComponentProps<typeof Cascade>;
