"use client";

import { useMemo, useRef, type KeyboardEvent } from "react";

type Run = { target: number; active: boolean };
const running = new WeakMap<HTMLInputElement, Run>();

/**
 * How many options fit in the open list: the height of its scroll area over the height of one option, at least 1. It
 * does not depend on where the list is scrolled to, so every page is the same size.
 */
function visibleOptions(list: HTMLElement, option: HTMLElement) {
  const style = getComputedStyle(list);
  const inner = list.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  return Math.max(1, Math.floor(inner / Math.max(1, option.getBoundingClientRect().height)));
}

function handlePageKey(event: KeyboardEvent<HTMLInputElement>, current: () => number | null): boolean {
  if (event.key !== "PageDown" && event.key !== "PageUp") return false;
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return false;
  const input = event.currentTarget;
  const list =
    input.getAttribute("aria-expanded") === "true"
      ? document.getElementById(input.getAttribute("aria-controls") ?? "")
      : null;
  const first = list?.querySelector<HTMLElement>('[role="option"]');
  if (!list || !first) return false;
  event.preventDefault();
  const down = event.key === "PageDown";
  const total = Number(first.getAttribute("aria-setsize")) || list.querySelectorAll('[role="option"]').length;
  const page = visibleOptions(list, first);
  // A press while the previous page is still on its way adds to it, so a held key pages at the key-repeat rate.
  const run = running.get(input) ?? { target: current() ?? -1, active: false };
  run.target = down ? Math.min(total - 1, run.target + page) : Math.max(0, run.target - page);
  running.set(input, run);
  if (run.active) return true;
  run.active = true;
  // One arrow per task: Base UI reads the highlight it rendered last, so every step has to see the move before it.
  let stalled = 0;
  const step = () => {
    const at = current() ?? -1;
    const wanted = Math.sign(run.target - at);
    if (!input.isConnected || wanted === 0 || stalled > 3) {
      run.active = false;
      running.delete(input);
      return;
    }
    stalled = 0;
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: wanted > 0 ? "ArrowDown" : "ArrowUp", bubbles: true, cancelable: true }),
    );
    const before = at;
    setTimeout(() => {
      if ((current() ?? -1) === before) stalled += 1;
      step();
    }, 0);
  };
  setTimeout(step, 0);
  return true;
}

/**
 * PageUp / PageDown for a Combobox input: moves the highlight by one page of the visible options, clamped at the first
 * and the last option (no wrap), by replaying the arrow key Base UI already handles, so the windowing, the group
 * headings, disabled options and `aria-activedescendant` stay Base UI's job.
 *
 * `track` is called with the highlighted option's position (`null` for none) from the root's `onItemHighlighted`;
 * `onKeyDown` goes on the input.
 *
 * @example
 * ```tsx
 * import { Combobox } from "@sheenui/theme";
 *
 * export function Example() {
 *   return <Combobox label="Item" options={[{ value: "a", label: "A" }]} multiple />;
 * }
 * ```
 *
 * @see /components/combobox
 *
 * @internal
 */
export function usePageKeys() {
  const at = useRef<number | null>(null);
  return useMemo(
    () => ({
      track: (index: number | null) => {
        at.current = index !== null && index >= 0 ? index : null;
      },
      onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
        handlePageKey(event, () => at.current);
      },
    }),
    [],
  );
}
