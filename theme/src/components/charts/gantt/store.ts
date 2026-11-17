"use client";

import { useSyncExternalStore } from "react";

/* ---------- The task being read: a tiny store, so a hover never re-renders the chart ---------- */

/** The task being read (its key, or null) and the scroll position its tooltip was placed for. */
export type ActiveState = { key: string | null; scroll: number };

/**
 * Which task is being read, and the scroll position its tooltip was placed for. Outside React
 * state on purpose: a hover changes it on every row it crosses, and only the few pieces that show
 * it (the two rows that light up, the highlight, the arrows, the tooltip) subscribe and re-render;
 * the chart itself, with every bar and tick, never does. Long plans stay smooth.
 */
export function createActiveStore() {
  let state: ActiveState = { key: null, scroll: 0 };
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next: ActiveState) => {
      if (next.key === state.key && next.scroll === state.scroll) return;
      state = next;
      for (const l of listeners) l();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}
/** The store that holds the active task. */
export type ActiveStore = ReturnType<typeof createActiveStore>;
/** Each task's partners: the tasks one of its arrows connects it to (either way). */
export type Links = ReadonlyMap<string, ReadonlySet<string>>;

/** Subscribes to the key of the active task (null when none). */
export const useActiveKey = (store: ActiveStore) =>
  useSyncExternalStore(
    store.subscribe,
    () => store.get().key,
    () => null,
  );
/** Subscribes to whether the task with the given key is the active one. */
export const useIsActive = (store: ActiveStore, key: string) =>
  useSyncExternalStore(
    store.subscribe,
    () => store.get().key === key,
    () => false,
  );
