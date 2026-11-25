"use client";

import { createContext, useContext } from "react";

/* ---------- Cell ---------- */

/** Tells a tile's demo whether the grid is on screen, so it can pause off-screen loops. @internal */
export const VisibleContext = createContext(true);

/**
 * True while the surrounding BentoCell is on screen: pause loops and timers when it's false.
 *
 * Returns `boolean` (`true` outside a cell). Call it inside a `BentoCell`'s `visual` to run intervals,
 * timers and loops only while the cell is on screen. Accessibility and keyboard: none of its own.
 * Motion: it is the off-screen pause rule of the motion playbook for bento demos.
 *
 * @example
 * ```tsx
 * import { useEffect, useState } from "react";
 * import { useBentoCellVisible } from "@sheenui/theme";
 *
 * function Ticker() {
 *   const visible = useBentoCellVisible();
 *   const [n, setN] = useState(0);
 *   useEffect(() => {
 *     if (!visible) return;
 *     const timer = window.setInterval(() => setN((v) => v + 1), 1000);
 *     return () => window.clearInterval(timer);
 *   }, [visible]);
 *   return <p>{n}</p>;
 * }
 * ```
 *
 * @see /blocks/bento-grid
 */
export function useBentoCellVisible() {
  return useContext(VisibleContext);
}
