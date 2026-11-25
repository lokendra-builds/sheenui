import type { KeyboardEvent } from "react";
import { itemAt } from "../chart-utils";
import type { Graph } from "./model";
import type { NetworkGraphProps } from "./types";

/** What a key press needs to know: the graph, the active node, the entrance order, positions and the view's actions. */
export type KeyContext = {
  graph: Graph;
  n: number;
  act: number | null;
  /** Entrance order of each node; the one with rank 0 is where the arrows start from. */
  rank: number[];
  /** Node positions (simulation units), or null before the layout. */
  pos: number[] | null;
  onNodeClick: NetworkGraphProps["onNodeClick"];
  zoomBy: (factor: number) => void;
  fit: () => void;
  move: (i: number | null, from: "keyboard" | "pointer") => void;
};

/**
 * The keyboard model: arrows move to the nearest node in that direction, Page Up / Page Down step through every
 * node in order, Home / End jump to the first and last, + / − zoom, 0 fits, Enter activates (with `onNodeClick`)
 * and Escape clears the reading.
 */
export function graphKeyDown(
  event: KeyboardEvent,
  { graph, n, act, rank, pos, onNodeClick, zoomBy, fit, move }: KeyContext,
) {
  if (n === 0) return;
  let next: number | null | undefined;
  const key = event.key;
  if (key === "+" || key === "=") {
    zoomBy(1.4);
    event.preventDefault();
    return;
  }
  if (key === "-" || key === "_") {
    zoomBy(1 / 1.4);
    event.preventDefault();
    return;
  }
  if (key === "0") {
    fit();
    event.preventDefault();
    return;
  }
  const P = pos;
  const px = (i: number) => P?.[i * 2] ?? 0;
  const py = (i: number) => P?.[i * 2 + 1] ?? 0;
  const start = rank.indexOf(0);
  switch (key) {
    case "PageDown":
      next = act === null ? 0 : Math.min(n - 1, act + 1);
      break;
    case "PageUp":
      next = act === null ? 0 : Math.max(0, act - 1);
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = n - 1;
      break;
    case "ArrowRight":
    case "ArrowLeft":
    case "ArrowUp":
    case "ArrowDown": {
      if (act === null) {
        next = start >= 0 ? start : 0;
        break;
      }
      const [dx, dy] =
        key === "ArrowRight" ? [1, 0] : key === "ArrowLeft" ? [-1, 0] : key === "ArrowUp" ? [0, -1] : [0, 1];
      let best: number | null = null;
      let bestScore = Infinity;
      let fallback: number | null = null;
      let fallbackScore = Infinity;
      for (let i = 0; i < n; i++) {
        if (i === act) continue;
        const vx = px(i) - px(act);
        const vy = py(i) - py(act);
        const along = vx * dx + vy * dy;
        if (along <= 0.5) continue;
        const across = Math.abs(vx * dy - vy * dx);
        const score = along + across * 2.5;
        if (across <= along * 1.2) {
          if (score < bestScore) {
            bestScore = score;
            best = i;
          }
        } else if (score < fallbackScore) {
          fallbackScore = score;
          fallback = i;
        }
      }
      next = best ?? fallback ?? act;
      break;
    }
    case "Enter":
    case " ": {
      if (act === null || !onNodeClick) return;
      const node = itemAt(graph.nodes, act);
      onNodeClick({
        id: node.id,
        label: node.label,
        group: node.group,
        connections: node.neighbours.map((j) => itemAt(graph.nodes, j).id),
      });
      event.preventDefault();
      return;
    }
    case "Escape":
      if (act === null) return;
      next = null;
      break;
    default:
      return;
  }
  event.preventDefault();
  move(next ?? null, "keyboard");
}
