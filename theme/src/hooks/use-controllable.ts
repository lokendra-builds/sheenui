"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { warnOnce } from "../lib/warn-once";

/** A new value, or a function of the previous one (like `setState`). */
export type ControllableUpdate<T> = T | ((prev: T) => T);

/**
 * One controlled/uncontrolled state hook for every SheenUI component. `value` controls it (only `undefined`
 * means uncontrolled, so `null` is a valid controlled value); otherwise `defaultValue` seeds internal state.
 * The setter accepts a value or an updater, skips a value equal to the current one (`Object.is`, so
 * `onChange` never fires for a no-op) and is referentially stable. Uncontrolled, chained updates in one tick build
 * on each other; controlled, every request is compared with the current `value` prop and reported, so an owner that
 * rejects a change is asked again on the next attempt.
 * Returns `[value, set, ref]`, where `ref.current` is the latest value for event handlers. A component must stay
 * controlled or uncontrolled for its whole life: the internal state is not carried across a switch, and development
 * builds print a one-time warning when it happens.
 *
 * @example
 * ```tsx
 * import { useControllable } from "@sheenui/theme";
 *
 * function Counter({ value, onChange }: { value?: number; onChange?: (next: number) => void }) {
 *   const [count, setCount] = useControllable(value, 0, onChange);
 *   return <button type="button" onClick={() => setCount((n) => n + 1)}>{count}</button>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useControllable<T>(value: T | undefined, defaultValue: T | (() => T), onChange?: (next: T) => void) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const ref = useRef(current);
  const wasControlled = useRef(controlled);
  useEffect(() => {
    if (wasControlled.current !== controlled) {
      warnOnce(
        controlled
          ? "A component changed from uncontrolled to controlled: `value` was undefined and is now set. Pick one for the component's whole life."
          : "A component changed from controlled to uncontrolled: `value` was set and is now undefined. Pass `null`/a value, or switch to `defaultValue` from the start.",
      );
      wasControlled.current = controlled;
    }
  }, [controlled]);
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    ref.current = current;
    onChangeRef.current = onChange;
  });
  const set = useCallback(
    (update: ControllableUpdate<T>) => {
      const next = typeof update === "function" ? (update as (prev: T) => T)(ref.current) : update;
      if (Object.is(next, ref.current)) return;
      // Controlled: never remember the request. `ref.current` stays the prop value until the owner commits a new one,
      // so a rejected change is reported again the next time (and an updater never builds on a value that was never shown).
      if (!controlled) {
        ref.current = next;
        setInner(next);
      }
      onChangeRef.current?.(next);
    },
    [controlled],
  );
  return [current, set, ref] as const;
}
