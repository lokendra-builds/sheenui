"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * A ref that always holds the latest `value`, for stable callbacks that must read current props or state
 * without becoming dependencies. The ref is updated in a layout effect after each commit (never during
 * render, so it is StrictMode-, concurrent- and React Compiler-safe). Read `ref.current` only inside event
 * handlers, effects and animation frames, never while rendering. Prefer `useEffectEvent` when the callback
 * is only called from an effect; use this when the callback is passed to children or other hooks.
 *
 * @example
 * ```tsx
 * import { useLatest } from "@sheenui/theme";
 *
 * function Logger({ count }: { count: number }) {
 *   const latestRef = useLatest(count);
 *   return <button type="button" onClick={() => console.log(latestRef.current)}>Log</button>;
 * }
 * ```
 *
 * @see /components
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/**
 * Keeps an existing `ref` in step with `value`: the same layout-effect update as `useLatest`, for when the
 * ref is declared earlier (for example because a lazy initialiser closes over it). Never writes during render.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useSyncRef } from "@sheenui/theme";
 *
 * function Logger({ count }: { count: number }) {
 *   const ref = useRef(count);
 *   useSyncRef(ref, count);
 *   return <button type="button" onClick={() => console.log(ref.current)}>Log</button>;
 * }
 * ```
 *
 * @see /components
 */
export function useSyncRef<T>(ref: { current: T }, value: T) {
  useLayoutEffect(() => {
    ref.current = value;
  });
}
