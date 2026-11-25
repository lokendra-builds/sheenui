// Small shared helpers for component tests.

import { expect } from "vitest";
import { userEvent } from "vitest/browser";

/** Same switch the app's motion toggle flips: `html[data-motion="reduced"]` (setup.ts clears it after each test). */
export function reduceMotion() {
  document.documentElement.setAttribute("data-motion", "reduced");
}

/** A tiny valid image as a data: URI, so <img> loads without a network request. */
export const pixel =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#888"/></svg>',
  );

/** Resolve after `n` animation frames (a real clock tick, not a guessed delay). */
export function frames(n = 1): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
    step(n);
  });
}

/** Wait until `read()` returns the same value on `count` consecutive frames (scroll position, a spring, a layout that is still settling). */
export async function stable<T>(read: () => T, count = 5): Promise<T> {
  let last = read();
  let same = 0;
  await expect
    .poll(
      async () => {
        await frames(1);
        const now = read();
        same = Object.is(now, last) ? same + 1 : 0;
        last = now;
        return same >= count;
      },
      { timeout: 5000, interval: 0 },
    )
    .toBe(true);
  return last;
}

/** Wait until `ms` of real time has passed on the frame clock (for product timers such as long-press and typeahead reset; never a guess for async work). */
export async function holdFor(ms: number): Promise<void> {
  const end = performance.now() + ms;
  do await frames(1);
  while (performance.now() < end);
}

/**
 * Wait until every finite CSS transition / animation has finished and no overlay is mid-enter or
 * mid-exit, so axe and unmount assertions see the settled DOM. Infinite animations (spinners,
 * shimmer) are ignored.
 *
 * A closing animation starts one frame AFTER the state change (Base UI sets `data-ending-style`,
 * then the browser starts the transition), so "zero running animations" is briefly true before
 * anything has run. We therefore require the page to look idle (no finite animation, no
 * `data-starting-style` / `data-ending-style` element) on several consecutive frames.
 */
export async function settle(quietFrames = 3) {
  const busy = () =>
    document
      .getAnimations()
      .some(
        (a) =>
          a.playState !== "finished" &&
          a.playState !== "idle" &&
          Number.isFinite(a.effect?.getComputedTiming().endTime ?? 0),
      ) || document.querySelector("[data-starting-style], [data-ending-style]") !== null;
  let quiet = 0;
  await expect
    .poll(
      async () => {
        await frames(1);
        quiet = busy() ? 0 : quiet + 1;
        return quiet >= quietFrames;
      },
      { timeout: 5000, interval: 0 },
    )
    .toBe(true);
}

/**
 * Move the real pointer to a corner, away from the content under test. The browser keeps the
 * pointer where an earlier test left it, and a chart (or any hover-driven widget) that sits under it
 * would otherwise react to the stationary pointer while a keyboard test is running.
 */
export async function parkPointer() {
  await userEvent.hover(document.documentElement, {
    position: { x: window.innerWidth - 4, y: window.innerHeight - 4 },
  });
}

/** First argument of the most recent call to a mock (cast it where you use it). */
export function lastArg(mock: { mock: { lastCall?: unknown[] } }): unknown {
  return mock.mock.lastCall?.[0];
}
