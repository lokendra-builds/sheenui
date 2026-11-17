"use client";

import { useCallback, useSyncExternalStore } from "react";

/** @internal The hover-toolbar state of a thread, outside React state so a hover re-renders two rows, not the whole thread. */
export type ToolbarStore = {
  /** Subscribe one row (by message id) to its own "shows the toolbar" flag. Returns the unsubscribe function. */
  subscribe: (id: string, callback: () => void) => () => void;
  /** Whether the row with this message id shows its toolbar now. */
  shown: (id: string) => boolean;
  /** The row under the pointer (null when the pointer left). */
  setHover: (id: string | null) => void;
  /** The row whose menu or reaction picker is open (it keeps its toolbar until the menu closes). */
  setPinned: (id: string | null) => void;
  /** The row that holds keyboard focus (focus-visible only). */
  setKeyboard: (id: string | null) => void;
  /** Touch devices have no hover toolbar: actions open as a sheet instead. */
  setCoarse: (coarse: boolean) => void;
};

/**
 * Accessibility: No UI of its own. It decides which message shows its (keyboard-reachable) toolbar.
 *
 * @internal Creates the store behind the hover toolbar. A thread owns one; each row listens only to its own id, so
 * moving the pointer from one message to the next notifies exactly two rows (the one it left and the one it entered).
 * Which row wins: the pinned one, then the hovered one, then the keyboard-focused one; none on a coarse pointer.
 *
 * @example
 * ```tsx
 * import { createToolbarStore } from "./toolbar-store";
 *
 * const store = createToolbarStore();
 * store.setHover("m1");
 * store.shown("m1"); // true
 * ```
 *
 * @see /chat/thread
 */
export function createToolbarStore(): ToolbarStore {
  let hover: string | null = null;
  let pinned: string | null = null;
  let keyboard: string | null = null;
  let coarse = false;
  const listeners = new Map<string, Set<() => void>>();

  const current = () => (coarse ? null : (pinned ?? hover ?? keyboard));
  const notify = (id: string | null) => {
    if (id) listeners.get(id)?.forEach((callback) => callback());
  };
  /** Runs a change and wakes only the rows whose answer flipped. */
  const change = (apply: () => void) => {
    const before = current();
    apply();
    const after = current();
    if (before === after) return;
    notify(before);
    notify(after);
  };

  return {
    subscribe(id, callback) {
      let set = listeners.get(id);
      if (!set) listeners.set(id, (set = new Set()));
      set.add(callback);
      return () => {
        set.delete(callback);
        if (set.size === 0) listeners.delete(id);
      };
    },
    shown: (id) => current() === id,
    setHover: (id) => change(() => void (hover = id)),
    setPinned: (id) => change(() => void (pinned = id)),
    setKeyboard: (id) => change(() => void (keyboard = id)),
    setCoarse: (value) => change(() => void (coarse = value)),
  };
}

/**
 * Accessibility: No UI of its own.
 *
 * @internal Whether the message with this id shows its hover toolbar. Re-renders only the row that calls it, and only
 * when its own answer changes.
 *
 * @example
 * ```tsx
 * import { useToolbarShown, type ToolbarStore } from "./toolbar-store";
 *
 * export function Row({ id, store }: { id: string; store: ToolbarStore }) {
 *   return useToolbarShown(store, id) ? <div role="toolbar" /> : null;
 * }
 * ```
 *
 * @see /chat/thread
 */
export function useToolbarShown(store: ToolbarStore, id: string) {
  const subscribe = useCallback((callback: () => void) => store.subscribe(id, callback), [store, id]);
  return useSyncExternalStore(
    subscribe,
    () => store.shown(id),
    () => false,
  );
}
