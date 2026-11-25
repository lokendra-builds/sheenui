"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useSyncRef } from "../hooks/use-latest";

/**
 * Synced crosshairs. Charts inside one <ChartSyncProvider> share the point being read: hover
 * (or arrow-key through) one chart and every other chart with the same x values draws its
 * crosshair at the same place. Charts are matched by the VALUE of their index (e.g. "Mar"),
 * not by position, so a 6-month chart and a 12-month chart still line up on March.
 *
 *   <ChartSyncProvider>
 *     <LineChart data={revenue} index="month" … />
 *     <BarChart data={orders} index="month" … />
 *   </ChartSyncProvider>
 *
 * The shared value lives in a tiny external store: only charts in the group re-render, and
 * only when the active x value changes (never per pointer move).
 */

export type ChartSyncPoint = {
  /** The index value being read (e.g. "Mar"). */
  key: string;
  /** Which chart is being read: the others draw a passive crosshair. */
  source: string;
};

/** A store that shares the hovered point between synced charts: `get`, `set` and `subscribe`. */
export type ChartSyncStore = {
  get: () => ChartSyncPoint | null;
  set: (point: ChartSyncPoint | null) => void;
  subscribe: (listener: () => void) => () => void;
};

/** A standalone sync store, for syncing charts that don't share a parent (pass it as `store`). */
export function createChartSyncStore(): ChartSyncStore {
  let point: ChartSyncPoint | null = null;
  const listeners = new Set<() => void>();
  return {
    get: () => point,
    set: (next) => {
      if (next === point || (next?.key === point?.key && next?.source === point?.source)) return;
      point = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const SyncContext = createContext<ChartSyncStore | null>(null);

/**
 * Props of ChartSyncProvider: the charts that share a hover (`children`) and an optional `store`
 * (default: a new one).
 */
export type ChartSyncProviderProps = {
  children: ReactNode;
  /** Share an existing store (e.g. one made with createChartSyncStore) instead of a new one. */
  store?: ChartSyncStore;
};

/**
 * Groups charts so one reading drives all of them: hover (or arrow-key through) one chart and every other chart in the group with the same index value draws its crosshair there. Wrap related charts (a revenue line and an orders bar, say) in one provider.
 *
 * Props: `children`, and `store` (a store from `createChartSyncStore()`, to sync charts that do not share a parent; default a new store per provider). Each chart opts out with its own `sync={false}`.
 * Keyboard and accessibility: adds none of its own. Each chart keeps its own arrow-key reading; the synced crosshair on the other charts is visual and `aria-hidden`. Only charts in the group re-render, and only when the active value changes.
 *
 * @example
 * ```tsx
 * import { BarChart, ChartSyncProvider, LineChart } from "@sheenui/theme";
 *
 * const rows = [
 *   { month: "Jan", revenue: 4, orders: 12 },
 *   { month: "Feb", revenue: 7, orders: 15 },
 * ];
 *
 * export function Example() {
 *   return (
 *     <ChartSyncProvider>
 *       <LineChart data={rows} index="month" series={[{ key: "revenue", label: "Revenue" }]} aria-label="Revenue per month" />
 *       <BarChart data={rows} index="month" series={[{ key: "orders", label: "Orders" }]} aria-label="Orders per month" />
 *     </ChartSyncProvider>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function ChartSyncProvider({ children, store }: ChartSyncProviderProps) {
  const [own] = useState(createChartSyncStore);
  return <SyncContext value={store ?? own}>{children}</SyncContext>;
}

const noop = () => () => undefined;
const none = () => null;

/**
 * For chart authors. Returns the key another chart in the group is reading (null when nothing,
 * or when this chart is the one being read) and `publish(key | null)` for this chart's own
 * active point. Outside a provider, or with `enabled` false, it is inert.
 *
 * Returns `{ synced, external, publish }`: whether the chart is in a group, the index value another chart is reading (or null), and `publish(key | null)` to share this chart's own active value. Call `publish(null)` on blur or pointer leave.
 * Not a component: no DOM, keyboard or screen-reader behaviour. Draw the `external` crosshair `aria-hidden`.
 *
 * @example
 * ```tsx
 * import { useChartSync } from "@sheenui/theme";
 *
 * function Chart({ months }: { months: string[] }) {
 *   const { external, publish } = useChartSync();
 *   return (
 *     <div tabIndex={0} onPointerLeave={() => publish(null)} onFocus={() => publish(months[0] ?? null)}>
 *       {external ? `Another chart is reading ${external}` : "No crosshair"}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function useChartSync(enabled = true) {
  const store = useContext(SyncContext);
  const active = enabled ? store : null;
  const id = useId();
  const point = useSyncExternalStore(active ? active.subscribe : noop, active ? active.get : none, none);
  const published = useRef<string | null>(null);
  const storeRef = useRef(active);
  useSyncRef(storeRef, active);

  const [publish] = useState(() => (key: string | null) => {
    const s = storeRef.current;
    if (!s) return;
    if (key === null) {
      // Only clear the group when this chart was the one being read.
      if (published.current !== null && s.get()?.source === id) s.set(null);
      published.current = null;
      return;
    }
    published.current = key;
    s.set({ key, source: id });
  });

  // Leaving the page (unmount) while being read clears the group.
  useEffect(
    () => () => {
      const s = storeRef.current;
      if (s && s.get()?.source === id) s.set(null);
    },
    [id],
  );

  return {
    /** Whether this chart is inside a sync group. */
    synced: active !== null,
    /** The key some OTHER chart in the group is reading, or null. */
    external: point && point.source !== id ? point.key : null,
    publish,
  } as const;
}
