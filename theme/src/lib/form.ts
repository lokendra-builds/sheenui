"use client";

import { useCallback, useMemo } from "react";
import type { FocusEvent, FocusEventHandler, Ref, RefCallback } from "react";

import { useLatest } from "../hooks/use-latest";

/**
 * Props every SheenUI form control accepts so it plugs into a form library (react-hook-form's `Controller`,
 * TanStack Form, Formik) and into a native `<form>`: a `ref` to the focusable element (so a failed
 * validation can focus it), `onBlur` (so the library can mark it touched), `name`, `required`, `disabled`,
 * `aria-invalid` and `aria-describedby`.
 */
export type FormControlProps<T extends HTMLElement = HTMLElement> = {
  /** Ref to the control's focusable element (the trigger, input or first thumb). Form libraries use it to focus the field after a failed validation. */
  ref?: Ref<T>;
  /** Called when focus leaves the control (not when it moves between the control's own parts). */
  onBlur?: FocusEventHandler<HTMLElement>;
  /** Field name, used for native form submission and by form libraries. */
  name?: string;
  /** Marks the field as required. */
  required?: boolean;
  /** Disables the field. */
  disabled?: boolean;
  /** Marks the field as invalid (also set automatically when `error` is shown). */
  "aria-invalid"?: boolean | "true" | "false";
  /** Ids of elements that describe the field, merged with the control's own description and error ids. */
  "aria-describedby"?: string;
};

/** Combine refs (callback or object) into one callback ref; `undefined` entries are skipped. */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const cleanups: (() => void)[] = [];
    for (const ref of refs) {
      if (typeof ref === "function") {
        const cleanup = ref(node);
        if (typeof cleanup === "function") cleanups.push(cleanup);
        else cleanups.push(() => ref(null));
      } else if (ref) {
        (ref as { current: T | null }).current = node;
        cleanups.push(() => {
          (ref as { current: T | null }).current = null;
        });
      }
    }
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  };
}

/**
 * Wraps `onBlur` for a control made of several focusable parts: it fires only when focus leaves the whole
 * group, not when it moves from one part to the next.
 */
export function groupBlur<T extends HTMLElement>(handler?: FocusEventHandler<T>): FocusEventHandler<T> | undefined {
  if (!handler) return undefined;
  return (event: FocusEvent<T>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    handler(event);
  };
}

/** Join description ids, dropping anything that is not a non-empty string (so `cond && id` works); `undefined` when nothing is left. */
export function joinIds(...ids: unknown[]): string | undefined {
  return ids.filter((id): id is string => typeof id === "string" && id !== "").join(" ") || undefined;
}

/**
 * `mergeRefs` as a hook: returns one stable callback ref that forwards the node to every ref passed in, always the latest ones.
 *
 * @example
 * ```tsx
 * import { useRef, type Ref } from "react";
 * import { useMergedRef } from "@sheenui/theme";
 *
 * export function Field({ ref }: { ref?: Ref<HTMLInputElement> }) {
 *   const own = useRef<HTMLInputElement>(null);
 *   return <input ref={useMergedRef(own, ref)} />;
 * }
 * ```
 *
 * @see /forms/field
 */
export function useMergedRef<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  const latestRef = useLatest(refs);
  return useCallback((node: T | null) => mergeRefs(...latestRef.current)(node), [latestRef]);
}

/**
 * A ref for a control made of several focusable parts (a radio group, a rating, an OTP field). It attaches
 * `ref` to the control's container and makes the container's `focus()` move focus to the first matching
 * descendant (selectors are tried in order, e.g. the checked radio first), so a form library that calls
 * `ref.focus()` after a failed validation lands on something a person can use.
 *
 * @example
 * ```tsx
 * import type { Ref } from "react";
 * import { useFocusProxyRef } from "@sheenui/theme";
 *
 * export function Options({ ref }: { ref?: Ref<HTMLDivElement> }) {
 *   const group = useFocusProxyRef(ref, "[aria-checked='true']", "button");
 *   return <div ref={group}><button>A</button></div>;
 * }
 * ```
 *
 * @see /forms/field
 */
export function useFocusProxyRef<T extends HTMLElement>(
  ref: Ref<T> | undefined,
  ...selectors: string[]
): RefCallback<T> {
  const key = selectors.join("\n");
  return useMemo(
    () =>
      mergeRefs<T>((node) => {
        if (!node) return;
        const original = node.focus.bind(node);
        node.focus = (options?: FocusOptions) => {
          for (const selector of key.split("\n")) {
            const target = node.querySelector<HTMLElement>(selector);
            if (target) {
              target.focus(options);
              return;
            }
          }
          original(options);
        };
        // On detach (or when the selectors / ref change and the ref re-attaches) the element gets its own `focus` back.
        return () => {
          Reflect.deleteProperty(node, "focus");
        };
      }, ref),
    [ref, key],
  );
}
