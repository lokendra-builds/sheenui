"use client";

import { useDockedReadout } from "./chart-fit";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type LegendItem } from "./chart-parts";
import {
  chartFocusClass,
  changeEase,
  enterEase,
  exitTransition,
  num,
  slotColor,
  tooltipDockSpace,
  truncate,
  useElementWidth,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
  useFirstPlay,
} from "./chart-utils";
import {
  ChartDockHint,
  ChartTip,
  ChartValueTable,
  defaultCompact,
  defaultPercent,
  MissingValue,
  useContrastInk,
  useEntrance,
} from "./heatmap";
import { ChartFigure } from "./chart-figure";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";

/* ======================================================================
 * Squarified layout (Bruls, Huizing & van Wijk, 2000)
 * ====================================================================== */

/** A rectangle in px: `x` and `y` of its corner and its width `w` and height `h`. */
export type TreemapRect = { x: number; y: number; w: number; h: number };

/**
 * Lays `values` out inside `rect` as rectangles whose areas are proportional to the values,
 * keeping each as close to square as the greedy row algorithm allows. Returns one rect per
 * value, in the input order; zero, negative and non-finite values get an empty rect.
 */
export function squarify(values: readonly number[], rect: TreemapRect): TreemapRect[] {
  const out: TreemapRect[] = values.map(() => ({ x: rect.x, y: rect.y, w: 0, h: 0 }));
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const total = clean.reduce((s, v) => s + v, 0);
  if (total <= 0 || rect.w <= 0 || rect.h <= 0) return out;

  // Biggest first: the algorithm needs descending areas to stay close to square.
  const order = clean
    .map((v, i) => [v, i] as const)
    .filter(([v]) => v > 0)
    .sort((a, b) => b[0] - a[0])
    .map(([, i]) => i);
  const scale = (rect.w * rect.h) / total;
  const area = (i: number) => (clean[i] ?? 0) * scale;

  let { x, y, w, h } = rect;
  let row: number[] = [];
  let rowArea = 0;
  let rowMin = Infinity;
  let rowMax = 0;

  /** Worst aspect ratio in a row of total area `s` laid along a side of length `side`. */
  const worst = (s: number, min: number, max: number, side: number) => {
    const s2 = s * s;
    const side2 = side * side;
    return Math.max((side2 * max) / s2, s2 / (side2 * min));
  };

  const flush = () => {
    if (row.length === 0) return;
    if (w >= h) {
      // A column on the left: full height, width = row area / height.
      const thick = h > 0 ? rowArea / h : 0;
      let cursor = y;
      row.forEach((i, k) => {
        const len = k === row.length - 1 ? y + h - cursor : area(i) / thick;
        out[i] = { x, y: cursor, w: thick, h: len };
        cursor += len;
      });
      x += thick;
      w = Math.max(0, w - thick);
    } else {
      // A row along the top: full width, height = row area / width.
      const thick = w > 0 ? rowArea / w : 0;
      let cursor = x;
      row.forEach((i, k) => {
        const len = k === row.length - 1 ? x + w - cursor : area(i) / thick;
        out[i] = { x: cursor, y, w: len, h: thick };
        cursor += len;
      });
      y += thick;
      h = Math.max(0, h - thick);
    }
    row = [];
    rowArea = 0;
    rowMin = Infinity;
    rowMax = 0;
  };

  for (let k = 0; k < order.length;) {
    const i = order[k] ?? 0;
    const a = area(i);
    const side = Math.min(w, h);
    if (
      row.length === 0 ||
      worst(rowArea + a, Math.min(rowMin, a), Math.max(rowMax, a), side) <= worst(rowArea, rowMin, rowMax, side)
    ) {
      row.push(i);
      rowArea += a;
      rowMin = Math.min(rowMin, a);
      rowMax = Math.max(rowMax, a);
      k++;
    } else flush();
  }
  flush();
  return out;
}

/* ======================================================================
 * Data model
 * ====================================================================== */

/** A node of a Treemap: a label, a value (leaves) or children, and an optional palette slot. */
export type TreemapNode = {
  label: string;
  /** Size of a leaf. A node with `children` is the sum of its children (its own value is ignored). */
  value?: number;
  children?: TreemapNode[];
  /**
   * Colour slot (1–8). Top-level nodes of a hierarchy take their position by default and their
   * descendants share it; a node's own `color` always wins. Past slot 8 a node is neutral grey
   * (fold the rest into "Other").
   */
  color?: ChartColor;
};

type Resolved = {
  id: string;
  label: string;
  value: number;
  color: string;
  children: Resolved[];
  parent: Resolved | null;
};

function resolve(data: readonly TreemapNode[], hue: ChartColor, byGroup: boolean): Resolved {
  const root: Resolved = { id: "", label: "", value: 0, color: slotColor(hue), children: [], parent: null };
  const build = (nodes: readonly TreemapNode[], parent: Resolved, depth: number) => {
    const seen = new Map<string, number>();
    for (const [i, node] of nodes.entries()) {
      const n = seen.get(node.label) ?? 0;
      seen.set(node.label, n + 1);
      const color =
        node.color !== undefined ? slotColor(node.color) : depth === 0 && byGroup ? slotColor(i + 1) : parent.color;
      const r: Resolved = {
        id: `${parent.id}/${node.label}\u0000${n}`,
        label: node.label,
        value: 0,
        color,
        children: [],
        parent,
      };
      if (node.children && node.children.length > 0) {
        build(node.children, r, depth + 1);
        r.value = r.children.reduce((s, c) => s + c.value, 0);
      } else r.value = Math.max(0, num(node.value));
      parent.children.push(r);
    }
  };
  build(data, root, 0);
  root.value = root.children.reduce((s, c) => s + c.value, 0);
  return root;
}

const pathOf = (node: Resolved) => {
  const out: Resolved[] = [];
  for (let n: Resolved = node; n.parent; n = n.parent) out.unshift(n);
  return out;
};

/** The node a list of labels leads to (stops at the deepest one that exists). */
function find(root: Resolved, path: readonly string[]) {
  let node = root;
  for (const label of path) {
    const next = node.children.find((c) => c.label === label && c.children.length > 0);
    if (!next) break;
    node = next;
  }
  return node;
}

/* ======================================================================
 * Layout of one level: groups (with a header band) and tiles
 * ====================================================================== */

type Tile = TreemapRect & { node: Resolved; order: number };
type Frame = TreemapRect & { node: Resolved; header: boolean };

const GAP = 2;
const HEADER = 22;
const FRAME_PAD = 2;

function layoutLevel(level: Resolved, W: number, H: number, nested: boolean) {
  const tiles: Tile[] = [];
  const frames: Frame[] = [];
  // Lay out in a rect 1px larger on every side, then inset each tile by 1px: inner gaps come
  // out at exactly 2px while the outer tiles still meet the container's edge.
  const inset = (r: TreemapRect): TreemapRect => ({
    x: r.x + GAP / 2,
    y: r.y + GAP / 2,
    w: Math.max(0, r.w - GAP),
    h: Math.max(0, r.h - GAP),
  });
  const rects = squarify(
    level.children.map((c) => c.value),
    { x: -GAP / 2, y: -GAP / 2, w: W + GAP, h: H + GAP },
  );
  level.children.forEach((child, i) => {
    const r = inset(itemAt(rects, i));
    if (r.w <= 0 || r.h <= 0) return;
    const roomy = r.w >= 56 && r.h >= HEADER + 26;
    if (nested && child.children.length > 0 && roomy) {
      frames.push({ ...r, node: child, header: true });
      const inner = squarify(
        child.children.map((c) => c.value),
        {
          x: r.x + FRAME_PAD - GAP / 2,
          y: r.y + HEADER - GAP / 2,
          w: r.w - FRAME_PAD * 2 + GAP,
          h: r.h - HEADER - FRAME_PAD + GAP,
        },
      );
      child.children.forEach((grand, j) => {
        const g = inset(itemAt(inner, j));
        if (g.w > 0 && g.h > 0) tiles.push({ ...g, node: grand, order: tiles.length });
      });
    } else tiles.push({ ...r, node: child, order: tiles.length });
  });
  return { tiles, frames };
}

/** The tile in `direction` from `from`: nearest along that axis, preferring tiles that overlap it across. */
function neighbour(tiles: Tile[], from: Tile, direction: "left" | "right" | "up" | "down") {
  let best: Tile | null = null;
  let bestScore = Infinity;
  const horizontal = direction === "left" || direction === "right";
  for (const t of tiles) {
    if (t === from) continue;
    let primary: number;
    if (direction === "right") primary = t.x - (from.x + from.w);
    else if (direction === "left") primary = from.x - (t.x + t.w);
    else if (direction === "down") primary = t.y - (from.y + from.h);
    else primary = from.y - (t.y + t.h);
    if (primary < -GAP) continue;
    const [a0, a1, b0, b1] = horizontal
      ? [from.y, from.y + from.h, t.y, t.y + t.h]
      : [from.x, from.x + from.w, t.x, t.x + t.w];
    const apart = Math.max(0, Math.max(a0, b0) - Math.min(a1, b1));
    const centre = Math.abs((a0 + a1) / 2 - (b0 + b1) / 2);
    const score = Math.max(0, primary) + apart * 4 + centre * 0.05;
    if (score < bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return best;
}

/* ======================================================================
 * Component
 * ====================================================================== */

/**
 * Every string Treemap speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type TreemapLabels = {
  /** First breadcrumb: the whole tree. */
  root: string;
  /** Accessible name of the breadcrumb. */
  breadcrumb: string;
  /** Tooltip row: share of the parent, e.g. "of Engineering". */
  ofParent: (parent: string) => string;
  /** Tooltip row: share of everything. */
  ofTotal: string;
  /** Appended to the accessible name. */
  instructions: ChartInstructions;
  /** Appended too when groups can be zoomed into. */
  drillInstructions: ChartInstructions;
  /** Announced after zooming. */
  zoomedTo: (label: string, count: number) => string;
  roleDescription: string;
  /** Shown in the readout band of a narrow treemap while no tile is being read. */
  hint: string;
  /** The same, when groups can be zoomed into. */
  drillHint: string;
};

/**
 * The built-in English strings of Treemap; spread it into your own `labels` and change what you need.
 * This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultTreemapLabels: TreemapLabels = {
  root: "All",
  breadcrumb: "Treemap level",
  ofParent: (parent) => `of ${parent}`,
  ofTotal: "of total",
  instructions: "Use the arrow keys to move between tiles.",
  drillInstructions: "Press Enter to zoom into a group and Escape to zoom out.",
  zoomedTo: (label, count) => `${label}: ${count} ${count === 1 ? "item" : "items"}`,
  roleDescription: "treemap",
  hint: "Tap or hover a tile for its value",
  drillHint: "Tap a tile for its value, again to zoom in",
};

/**
 * Props of Treemap. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type TreemapProps = {
  /** Nodes: leaves carry a `value`; groups carry `children` (any depth). */
  data: readonly TreemapNode[];
  /** Height of the treemap in px; the width follows the container. */
  height?: number;
  /**
   * Hue for tiles that don't get a group colour (flat data: one series, one hue).
   * Hierarchies colour each top-level group by its own slot instead.
   */
  color?: ChartColor;
  /**
   * Tell groups apart without colour (hatch fills). Default: on when the chart has more than 3 groups.
   * A flat treemap is one hue, so it has no groups to tell apart.
   *
   * @default true when there are more than 3 top-level groups
   */
  patterns?: boolean;
  /** Show each group's children inside it, under a header. Default true. */
  nested?: boolean;
  /** Click / Enter on a group zooms into it, with a breadcrumb to zoom back out. Default true when there are groups. */
  drillDown?: boolean;
  /** The zoomed-in path (group labels from the top), controlled. */
  path?: readonly string[];
  /** Path of the node the chart starts zoomed into (uncontrolled). */
  defaultPath?: readonly string[];
  /** Called with the path of labels when the user zooms in or out (controlled `path`). */
  onPathChange?: (path: string[]) => void;
  /** Called on click / Enter on a tile that has nothing to zoom into. */
  onNodeClick?: (node: { label: string; value: number; path: string[] }) => void;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown. Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<TreemapLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** Legend items for a hierarchical treemap's top-level groups (pass to ChartCard's `legend`). */
export function treemapLegend(
  data: readonly TreemapNode[],
  /** Hatch the swatches like the chart's `patterns` prop. Default: on from 4 groups. */
  patterns?: boolean,
): LegendItem[] {
  const hatched = resolvePatterns(patterns, data.length);
  return data.map((node, i) => ({
    label: node.label,
    color: slotColor(node.color ?? i + 1),
    kind: "rect" as const,
    pattern: hatched && i > 0 ? i : undefined,
  }));
}

/**
 * Part-to-whole as nested rectangles, laid out with the squarified algorithm so tiles stay
 * close to square (and comparable).
 *
 * - Labels are printed only where they fit (truncated with an ellipsis at worst), in black or
 *   white, whichever contrasts more with the tile. Tiles are separated by 2px gaps.
 * - Hierarchies: each top-level group keeps one palette slot; its children share the hue and sit
 *   under a header. Click (or Enter) zooms into a group: its tiles grow into place with a
 *   transform-only layout animation, and a breadcrumb (or Escape) zooms back out.
 * - Hover or tap a tile for its value and share; focus the chart and move with the arrow keys
 *   (spatially: the tile to the right, above...). Home / End jump to the largest / smallest.
 * - Tiles bloom in, largest first, the first time the chart scrolls into view; data changes
 *   re-flow them. Instant with reduced motion.
 *
 * Keyboard: Tab focuses the chart; the arrow keys move spatially between tiles, Home and End jump to the largest and smallest, Enter zooms into a group (with `drillDown`), Escape or Backspace zooms back out.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive (and the drill-down hint when it is on); zooming is announced, and the breadcrumb is real buttons. `TreemapTable` lists every node as the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws tiles and zooms instantly.
 *
 * @example
 * ```tsx
 * import { Treemap } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Treemap
 *       data={[
 *         { label: "Europe", children: [{ label: "DE", value: 40 }, { label: "FR", value: 30 }] },
 *         { label: "Americas", children: [{ label: "US", value: 90 }, { label: "BR", value: 25 }] },
 *       ]}
 *       drillDown
 *       aria-label="Revenue by region and country"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/treemap
 */
export function Treemap({
  data,
  height = 320,
  color = 1,
  patterns,
  nested = true,
  drillDown,
  path: pathProp,
  defaultPath = [],
  onPathChange,
  onNodeClick,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<TreemapProps>) {
  const labels = { ...defaultTreemapLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const setGroup = useMergedRef(groupRef, measureRef);
  const play = useEntrance(rootRef, reduced);
  const [active, setActive] = useState<string | null>(null);
  const [innerPath, setInnerPath] = useState<readonly string[]>(defaultPath);
  const [announcement, setAnnouncement] = useState("");
  const touchRef = useRef<{ id: string | null; wasActive: boolean; touch: boolean }>({
    id: null,
    wasActive: false,
    touch: false,
  });

  const hierarchical = data.some((d) => (d.children?.length ?? 0) > 0);
  const tree = useMemo(() => resolve(data, color, hierarchical), [data, color, hierarchical]);
  // One hatch per distinct group colour, in top-level order (a flat treemap is a single hue: no cues).
  const groupColors = useMemo(() => Array.from(new Set(tree.children.map((n) => n.color))), [tree]);
  const patternUid = useId();
  const hatched = hierarchical && resolvePatterns(patterns, groupColors.length);
  const canDrill = drillDown ?? hierarchical;
  const path = pathProp ?? innerPath;
  const level = canDrill ? find(tree, path) : tree;
  const crumbs = pathOf(level);

  const docked = useDockedReadout(width);
  // One line of readout, or two when the longest tile's readout wouldn't fit on one.
  const { ofParent, ofTotal } = labels;
  const dock = useMemo(() => {
    if (!docked) return 0;
    const all: Resolved[] = [];
    const walk = (n: Resolved) =>
      n.children.forEach((c) => {
        all.push(c);
        walk(c);
      });
    walk(tree);
    const longestGroup = all
      .filter((n) => n.children.length > 0)
      .reduce((m, n) => (n.label.length > m.length ? n.label : m), "");
    return tooltipDockSpace(
      width,
      all.map((n) => ({ label: n.label })),
      "label",
      [
        { label: "", values: all.map((n) => format(n.value)) },
        ...(longestGroup ? [{ label: ofParent(longestGroup), values: [pct(0.999)] }] : []),
        { label: ofTotal, values: [pct(0.999)] },
      ],
    );
  }, [docked, width, tree, format, pct, ofTotal, ofParent]);
  const { tiles, frames } = useMemo(() => layoutLevel(level, width, height, nested), [level, width, height, nested]);
  const ink = useContrastInk(rootRef, Array.from(new Set(tiles.map((t) => t.node.color))));

  // Entrance: only the first time; later mounts (zooming out brings tiles back) just fade.
  const first = useFirstPlay(play && width !== 0);

  // Layout animations run when the data or the zoom level changes, never on resize.
  const signature = `${level.id}|${tiles.map((t) => `${t.node.id}:${t.node.value}`).join(",")}|${nested}`;
  const layoutTransition = reduced ? { duration: 0 } : { duration: duration.slower, ease: changeEase };

  // A group that is drawn as a frame hands its focus to its first tile (e.g. after zooming out of it).
  const act = tiles.find((t) => t.node.id === active) ?? tiles.find((t) => t.node.parent?.id === active) ?? null;

  /** Move the reading position (clears the last zoom announcement, so the new tile is read). */
  function move(id: string | null) {
    setAnnouncement("");
    setActive(id);
  }

  function setPath(next: Resolved, focusAfter: string | null = null) {
    const labelsPath = pathOf(next).map((n) => n.label);
    if (pathProp === undefined) setInnerPath(labelsPath);
    onPathChange?.(labelsPath);
    setActive(focusAfter);
    setAnnouncement(labels.zoomedTo(next === tree ? labels.root : next.label, next.children.length));
  }

  /** What a tile zooms into: itself if it is a group, else its group within this level. */
  function drillTarget(tile: Tile): Resolved | null {
    if (!canDrill) return null;
    if (tile.node.children.length > 0) return tile.node;
    const parent = tile.node.parent;
    return parent && parent !== level ? parent : null;
  }

  function activate(tile: Tile) {
    const target = drillTarget(tile);
    if (target) setPath(target);
    else onNodeClick?.({ label: tile.node.label, value: tile.node.value, path: pathOf(tile.node).map((n) => n.label) });
  }

  function onKeyDown(event: KeyboardEvent) {
    if (tiles.length === 0) return;
    const ordered = tiles;
    let next: Tile | null | undefined;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowLeft":
      case "ArrowUp":
      case "ArrowDown": {
        if (!act) next = ordered[0];
        else {
          const dir =
            event.key === "ArrowRight"
              ? "right"
              : event.key === "ArrowLeft"
                ? "left"
                : event.key === "ArrowUp"
                  ? "up"
                  : "down";
          next = neighbour(ordered, act, dir) ?? act;
        }
        break;
      }
      case "Home":
        next = ordered[0];
        break;
      case "End":
        next = ordered[ordered.length - 1];
        break;
      case "Enter":
      case " ":
        if (!act) return;
        event.preventDefault();
        activate(act);
        return;
      case "Escape":
      case "Backspace":
        if (canDrill && level !== tree) {
          event.preventDefault();
          // Zoom out, keeping the keyboard on the group we just left.
          setPath(level.parent ?? tree, level.id);
          return;
        }
        if (event.key === "Escape" && act) {
          event.preventDefault();
          move(null);
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    move(next?.node.id ?? null);
  }

  function onPointerDown(tile: Tile, event: PointerEvent) {
    touchRef.current = { id: tile.node.id, wasActive: active === tile.node.id, touch: event.pointerType !== "mouse" };
    if (event.pointerType !== "mouse") move(tile.node.id);
  }

  function onClick(tile: Tile) {
    // Touch: the first tap shows the tooltip, a second tap on the same tile activates it.
    const t = touchRef.current;
    if (t.touch && t.id === tile.node.id && !t.wasActive) return;
    activate(tile);
  }

  if (tree.value <= 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const clickable = canDrill || !!onNodeClick;
  const total = tree.value;
  const instructions =
    resolveInstructions(labels.instructions) + (canDrill ? ` ${resolveInstructions(labels.drillInstructions)}` : "");

  // Tooltip for the active tile, beside it (or docked on phones).
  let tooltip: ReactNode = null;
  let readout = "";
  if (act) {
    const parent = act.node.parent;
    const rows = [{ label: "", value: format(act.node.value), color: act.node.color, kind: "rect" as const }];
    if (parent && parent !== tree)
      rows.push({
        label: labels.ofParent(parent.label),
        value: pct(act.node.value / parent.value),
        color: "transparent",
        kind: "rect",
      });
    rows.push({ label: labels.ofTotal, value: pct(act.node.value / total), color: "transparent", kind: "rect" });
    tooltip = (
      <ChartTip
        title={act.node.label}
        rows={rows}
        anchor={{ x: act.x, y: dock + act.y, w: act.w, h: act.h }}
        bounds={{ w: width, h: height + dock }}
        docked={docked}
      />
    );
    readout = `${pathOf(act.node)
      .map((n) => n.label)
      .join(", ")}: ${rows.map((r) => `${r.value} ${r.label}`.trim()).join(", ")}`;
  }

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col gap-3", className)}>
      {canDrill && (
        <nav aria-label={labels.breadcrumb} className="-my-1 min-w-0">
          <ol className="flex min-w-0 flex-wrap items-center gap-0.5 text-sm">
            {[tree, ...crumbs].map((node, i, all) => {
              const current = i === all.length - 1;
              /** The crumb unmounts once it's the current level: keep the keyboard in the chart, on the group just left. */
              const zoomOut = (event: MouseEvent) => {
                setPath(node, event.detail === 0 ? (all[i + 1]?.id ?? null) : null);
                requestAnimationFrame(() => groupRef.current?.focus());
              };
              const text = node === tree ? labels.root : node.label;
              return (
                <li key={node.id} className="flex min-w-0 items-center gap-0.5">
                  {i > 0 && <Chevron />}
                  {current ? (
                    <span aria-current="location" className="truncate px-2 py-1 font-semibold text-sheen-fg">
                      {text}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={zoomOut}
                      className={cn(
                        "relative truncate rounded-sheen-sm px-2 py-1 text-sheen-fg-muted motion-ok:transition-colors motion-ok:duration-(--sheen-duration-fast)",
                        "hover:bg-sheen-hover hover:text-sheen-fg",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                        "any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:h-11 any-pointer-coarse:after:-translate-y-1/2",
                      )}
                    >
                      {text}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {}
      <ChartFigure
        as="div"
        ref={setGroup}
        roleDescription={labels.roleDescription}
        label={ariaLabel}
        description={instructions}

        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => move(null)}
        className={cn("relative w-full rounded-sheen-sm", chartFocusClass)}
        style={{ height: height + dock, paddingTop: dock }}
      >
        {width > 0 && (
          <div aria-hidden className="relative isolate w-full forced-color-adjust-none" style={{ height }}>
            {hatched && (
              <svg aria-hidden className="pointer-events-none absolute size-0">
                <ChartPatternDefs id={patternUid} entries={groupColors.map((c, i) => ({ index: i, color: c }))} />
              </svg>
            )}
            <AnimatePresence>
              {frames.map((f) => (
                <motion.div
                  key={`${f.node.id}#frame`}
                  layout
                  layoutDependency={signature}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: play ? 1 : 0 }}
                  exit={{ opacity: 0, transition: reduced ? { duration: 0 } : exitTransition }}
                  transition={{ layout: layoutTransition, opacity: { duration: reduced ? 0 : duration.base } }}
                  onClick={() => canDrill && setPath(f.node)}
                  className={cn(
                    "absolute z-0 overflow-hidden rounded-[6px] forced-colors:border forced-colors:border-[CanvasText]",
                    canDrill && "cursor-zoom-in",
                  )}
                  style={{
                    left: f.x,
                    top: f.y,
                    width: f.w,
                    height: f.h,
                    background: `color-mix(in oklab, ${f.node.color} 14%, transparent)`,
                  }}
                >
                  <motion.div
                    layout="position"
                    layoutDependency={signature}
                    transition={{ layout: layoutTransition }}
                    className="flex items-baseline gap-1.5 px-1.5 text-xs whitespace-nowrap"
                    style={{ height: HEADER, lineHeight: `${HEADER}px` }}
                  >
                    <FrameHeader frame={f} format={format} />
                  </motion.div>
                </motion.div>
              ))}

              {tiles.map((t) => {
                const tileInk = ink(t.node.color);
                const groupIndex = hatched ? groupColors.indexOf(t.node.color) : -1;
                return (
                  <motion.div
                    key={t.node.id}
                    layout
                    layoutDependency={signature}
                    initial={reduced ? false : first ? { opacity: 0, scale: 0.88 } : { opacity: 0 }}
                    animate={play ? { opacity: 1, scale: 1, zIndex: 1 } : { opacity: 0 }}
                    exit={{ opacity: 0, zIndex: 0, transition: reduced ? { duration: 0 } : exitTransition }}
                    transition={{
                      layout: layoutTransition,
                      opacity: {
                        duration: reduced ? 0 : first ? duration.slow : duration.base,
                        delay: reduced || !first ? 0 : Math.min(t.order * 0.03, 0.6),
                      },
                      scale: {
                        duration: reduced ? 0 : duration.slower,
                        ease: enterEase,
                        delay: reduced || !first ? 0 : Math.min(t.order * 0.03, 0.6),
                      },
                    }}
                    onPointerEnter={(e) => e.pointerType === "mouse" && move(t.node.id)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && move(null)}
                    onPointerDown={(e) => onPointerDown(t, e)}
                    onClick={() => clickable && onClick(t)}
                    className={cn(
                      "absolute overflow-hidden shadow-[inset_0_1px_0_var(--sheen-glass-highlight-side)]",
                      // High contrast keeps the fills (forced-color-adjust: none) and adds a CanvasText edge.
                      "forced-colors:border forced-colors:border-[CanvasText]",
                      clickable && (drillTarget(t) ? "cursor-zoom-in" : "cursor-pointer"),
                      tileInk === "light" ? "text-sheen-ink-on-dark" : "text-sheen-ink-on-light",
                    )}
                    style={{
                      left: t.x,
                      top: t.y,
                      width: t.w,
                      height: t.h,
                      background: t.node.color,
                      borderRadius: Math.max(1, Math.min(4, t.w / 4, t.h / 4)),
                    }}
                  >
                    {groupIndex > 0 && (
                      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
                        <rect
                          width="100%"
                          height="100%"
                          fill={patternFill(true, patternUid, groupIndex, t.node.color)}
                        />
                      </svg>
                    )}
                    <motion.div
                      layout="position"
                      layoutDependency={signature}
                      transition={{ layout: layoutTransition }}
                      className="relative"
                    >
                      <TileLabel tile={t} format={format} />
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* The active tile lifts with a ring (never by dimming the rest). */}
            {act && (
              <div
                className="pointer-events-none absolute z-10 rounded-[5px] border-2 border-sheen-fg shadow-[inset_0_0_0_1px_var(--sheen-chart-surface)] forced-colors:border-[Highlight]"
                style={{ left: act.x - 1, top: act.y - 1, width: act.w + 2, height: act.h + 2 }}
              />
            )}
          </div>
        )}
        {tooltip ?? (docked && <ChartDockHint>{canDrill ? labels.drillHint : labels.hint}</ChartDockHint>)}
      </ChartFigure>
      <ChartAnnouncer text={[announcement, readout].filter(Boolean).join(". ")} />
    </div>
  );
}

/** A tile's name (and value, when there's room): printed only where it fits. */
function TileLabel({ tile, format }: { tile: Tile; format: (n: number) => string }) {
  const PAD = 6;
  const room = tile.w - PAD * 2;
  const chars = Math.floor(room / 6.7);
  if (tile.h < 22 || chars < Math.min(tile.node.label.length, 4)) return null;
  const name = truncate(tile.node.label, chars);
  const value = format(tile.node.value);
  const showValue = tile.h >= 40 && value.length * 6.2 <= room;
  return (
    <div className="flex min-w-0 flex-col gap-0.5 leading-none" style={{ padding: `${PAD + 1}px ${PAD}px` }}>
      <span className="text-xs font-medium whitespace-nowrap">{name}</span>
      {showValue && <span className="text-2xs whitespace-nowrap tabular-nums">{value}</span>}
    </div>
  );
}

function FrameHeader({ frame, format }: { frame: Frame; format: (n: number) => string }) {
  const room = frame.w - 12;
  const value = format(frame.node.value);
  const nameChars = Math.floor(room / 6.9);
  if (nameChars < Math.min(frame.node.label.length, 3)) return null;
  const name = truncate(frame.node.label, nameChars);
  const showValue = room - name.length * 6.9 - 8 >= value.length * 6.2;
  return (
    <>
      <span className="font-semibold text-sheen-fg">{name}</span>
      {showValue && <span className="text-2xs text-sheen-fg-muted tabular-nums">{value}</span>}
    </>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden
      width={14}
      height={14}
      viewBox="0 0 16 16"
      className="shrink-0 text-sheen-fg-subtle rtl:-scale-x-100"
    >
      <path
        d="M6 3.5 10.5 8 6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Table view ---------- */

/** The text of `TreemapTable` that is not a column header. */
export type TreemapTableLabels = {
  /** Read for top-level rows' "% of group" (they have no group). */
  notApplicable: string;
};

/** English defaults of {@link TreemapTableLabels}. */
export const defaultTreemapTableLabels: TreemapTableLabels = {
  notApplicable: "Not applicable",
};

/**
 * Props of TreemapTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type TreemapTableProps = Pick<TreemapProps, "data" | "format" | "formatPercent" | "locale"> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Override the column headers: { name, value, ofParent, ofTotal }. */
  headers?: Partial<{ name: string; value: string; ofParent: string; ofTotal: string }>;
  /** Strings for the cells that have no value. Merged over {@link defaultTreemapTableLabels}. */
  labels?: Partial<TreemapTableLabels>;
  /** Shown when there are no nodes. */
  emptyState?: ReactNode;
};

/**
 * Every node, depth first (groups in bold, children indented), with its value and shares.
 *
 * Props: the chart's `data`, `format`, `formatPercent` and `locale`, plus `caption` (hidden, names the table), `headers` ({ name, value, ofParent, ofTotal }), `labels` (`notApplicable` "Not applicable") and `emptyState`. A real table: every node depth first (groups in bold, children indented) with its value and shares. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { TreemapTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TreemapTable data={[{ label: "Europe", children: [{ label: "DE", value: 40 }, { label: "FR", value: 30 }] }]} caption="Revenue by region" />
 *   );
 * }
 * ```
 *
 * @see /charts/treemap
 */
export function TreemapTable({
  data,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  caption,
  headers,
  labels,
  emptyState,
}: TreemapTableProps) {
  const { notApplicable: notApplicableLabel } = { ...defaultTreemapTableLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const h = { name: "Name", value: "Value", ofParent: "% of group", ofTotal: "% of total", ...headers };
  const tree = resolve(data, 1, false);
  const rows: ReactNode[][] = [];
  const walk = (node: Resolved, depth: number) => {
    for (const child of node.children) {
      const group = child.children.length > 0;
      rows.push([
        <span
          className={cn("inline-block", group && "font-semibold text-sheen-fg")}
          style={{ paddingInlineStart: depth * 16 }}
        >
          {child.label}
        </span>,
        group ? <strong className="font-semibold">{format(child.value)}</strong> : format(child.value),
        depth === 0 ? (
          <MissingValue label={notApplicableLabel} />
        ) : (
          pct(node.value > 0 ? child.value / node.value : NaN)
        ),
        pct(tree.value > 0 ? child.value / tree.value : NaN),
      ]);
      walk(child, depth + 1);
    }
  };
  walk(tree, 0);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[{ label: h.name }, { label: h.value }, { label: h.ofParent }, { label: h.ofTotal }]}
      rows={rows}
    />
  );
}
