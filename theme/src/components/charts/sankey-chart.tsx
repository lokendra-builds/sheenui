"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { cn } from "../../lib/cn";
import { useSyncRef } from "../../hooks/use-latest";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import { dockSpace, type Readout, useDockedReadout } from "./chart-fit";
import { chartFocusClass, clamp, useElementWidth, resolveInstructions } from "./chart-utils";
import {
  ChartDockHint,
  defaultCompact,
  defaultPercent,
  useEntrance,
  useScrollFade,
  type ChartTipAnchor,
} from "./heatmap";
import {
  FlowTip,
  haloTextClass,
  markGlow,
  measureText,
  fitText,
  r2,
  roundedRectPath,
  useDarkScheme,
  useFontsLoaded,
  useFrameStore,
  wrapText,
} from "./flow-utils";

import { type SankeyLayoutLink, type SankeyLayoutNode, layoutSankey, byY } from "./sankey-chart/layout";
import { useSankeyStaticLayers } from "./sankey-chart/layers";
import { useSankeyPaint } from "./sankey-chart/use-sankey-paint";
import { sankeyLinkReadout, sankeyNodeReadout } from "./sankey-chart/readout";
import { placeSankeyLabels } from "./sankey-chart/labels";
import { defaultSankeyChartLabels, type SankeyChartProps } from "./sankey-chart/model";
import {
  type Active,
  LABEL_GAP,
  LABEL_SIZE,
  VALUE_SIZE,
  NAME_LINE,
  VALUE_LINE,
  PAD_Y,
  type SankeyMarks,
  sankeyGeo,
} from "./sankey-chart/paint";

export {
  type SankeyNode,
  type SankeyLink,
  type SankeyAlign,
  type SankeyLayoutLink,
  type SankeyLayoutNode,
  type SankeyLayout,
  type SankeyLayoutOptions,
  layoutSankey,
  sankeyLinkPath,
} from "./sankey-chart/layout";
export { type SankeyChartLabels, defaultSankeyChartLabels, type SankeyChartProps } from "./sankey-chart/model";
export { type SankeyTableProps, SankeyTable } from "./sankey-chart/table";

// The shared flow-chart helpers moved to ./flow-utils; re-exported here for code that imported them from the sankey.
export {
  fitText,
  haloTextClass,
  markGlow,
  measureText,
  PointerFollow,
  polar,
  ribbonBlend,
  ringSector,
  roundedRectPath,
  useDarkScheme,
  useFontsLoaded,
  usePointerStore,
  type PointerStore,
  type TapState,
} from "./flow-utils";
import type { TapState } from "./flow-utils";
import { ChartFigure } from "./chart-figure";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";

/**
 * Flows between stages as ribbons whose thickness is the amount: where traffic comes from and
 * where it goes, a budget split, energy in and out.
 *
 * - The layout is computed here (no dependency): nodes in columns, relaxed so ribbons run as
 *   straight as possible. Ribbons fade from the source's colour into the target's.
 * - Hover or tap a node to trace every path through it; hover a ribbon to read that flow. Tap
 *   pins the readout on touch screens; a second tap activates (onNodeClick / onLinkClick).
 * - Keyboard: arrows walk the graph — up/down within a column, right/left along a node's flows
 *   and on to the next node. Values are announced; the table view (SankeyTable) lists every flow.
 * - Labels sit beside their node and are only printed where they fit, without colliding; a long
 *   name takes a second line before it is ever shortened.
 * - First view: columns grow in from left to right and ribbons draw across; data changes tween.
 *   One tween drives every mark (no per-mark animations, no React render per frame). Instant
 *   with reduced motion. A narrow card scrolls the diagram inside its own container.
 *
 * Keyboard: Tab focuses the chart; Up and Down move between the nodes of a column, Right and Left follow the flows out of and into a node, Escape clears. Enter or Space activates the node or flow being read (`onNodeClick`, `onLinkClick`).
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce each node or flow with its values. `SankeyTable` lists every flow as the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws columns and ribbons instantly.
 *
 * @example
 * ```tsx
 * import { SankeyChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SankeyChart
 *       links={[
 *         { source: "Search", target: "Signup", value: 60 },
 *         { source: "Social", target: "Signup", value: 25 },
 *         { source: "Signup", target: "Paid", value: 30 },
 *         { source: "Signup", target: "Free", value: 55 },
 *       ]}
 *       aria-label="Traffic sources to plans"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/sankey-diagram
 */
export function SankeyChart({
  links,
  nodes,
  height = 360,
  nodeWidth: nodeWidthProp = 12,
  nodePadding = 16,
  align = "justify",
  linkColor = "gradient",
  minColumnWidth = 96,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  onNodeClick,
  onLinkClick,
  emptyState,
  patterns,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<SankeyChartProps>) {
  const labels = { ...defaultSankeyChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const nodeWidth = clamp(nodeWidthProp, 4, 24);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const scrollRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const linkLayer = useRef<SVGGElement>(null);
  const nodeLayer = useRef<SVGGElement>(null);
  const labelLayer = useRef<SVGGElement>(null);
  const leavingLayer = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const fonts = useFontsLoaded();
  // Text tools for the current font state: a new object when the web fonts arrive, so label fits that use it are redone.
  const text = useMemo(() => ({ ready: fonts, width: measureText, fit: fitText, wrap: wrapText }), [fonts]);
  // Ordinary alpha (not multiply/screen) so ribbons stay visible on any surface, including the dark stage a light page may sit on.
  const dark = useDarkScheme();
  const blend = { opacity: dark ? 0.72 : 0.58, blend: "normal" as const };
  const [active, setActive] = useState<Active | null>(null);
  // Only keyboard moves are announced; pointer moves stay visual (no chatter while the mouse sweeps).
  const [source, setSource] = useState<"keyboard" | "pointer">("pointer");
  // Where a ribbon's tooltip is anchored while the pointer runs along it (moved without React renders).
  const tip = useFrameStore<ChartTipAnchor>();
  const boxRef = useRef<{ rect: DOMRect | null; t: number } | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  // The scroller's offset as last reported by its scroll events (reading it from the DOM after a render would force a layout).
  const scrollPos = useRef(0);
  const tapRef = useRef<TapState>({ id: null, wasActive: false, touch: false });
  const uid = useId();

  // Topology only (columns and values, no relaxation passes): the label margins and the empty check.
  const topology = useMemo(
    () => layoutSankey(nodes, links, { width: 400, height: 300, nodeWidth, nodePadding, align, iterations: 0 }),
    [nodes, links, nodeWidth, nodePadding, align],
  );
  const columnCount = topology.columns;

  // Wide cards print the first and last columns' labels outside the diagram; narrow ones inside.
  const outer = width >= 560 && columnCount > 1;
  const labelWidth = (n: SankeyLayoutNode) =>
    measureText(n.label, LABEL_SIZE, 500) + 6 + measureText(format(n.value), VALUE_SIZE, 400);
  const marginL = outer
    ? Math.ceil(
        Math.min(width * 0.2, Math.max(0, ...topology.nodes.filter((n) => n.column === 0).map(labelWidth)) + LABEL_GAP),
      )
    : 0;
  const marginR = outer
    ? Math.ceil(
        Math.min(
          width * 0.2,
          Math.max(0, ...topology.nodes.filter((n) => n.column === columnCount - 1).map(labelWidth)) + LABEL_GAP,
        ),
      )
    : 0;
  const needW = marginL + marginR + Math.max(0, columnCount - 1) * minColumnWidth + nodeWidth;
  const svgW = Math.max(width, needW);
  const innerW = Math.max(nodeWidth, svgW - marginL - marginR);
  const innerH = Math.max(40, height - PAD_Y * 2);

  const hasWidth = width > 0;
  const layout = useMemo(
    () =>
      hasWidth
        ? layoutSankey(nodes, links, { width: innerW, height: innerH, nodeWidth, nodePadding, align })
        : topology,
    [hasWidth, nodes, links, innerW, innerH, nodeWidth, nodePadding, align, topology],
  );
  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout]);
  const linkById = useMemo(() => new Map(layout.links.map((l) => [l.id, l])), [layout]);
  const columns = useMemo(() => {
    const cols: SankeyLayoutNode[][] = Array.from({ length: layout.columns }, () => []);
    for (const n of layout.nodes) cols[n.column]?.push(n);
    for (const c of cols) c.sort(byY);
    return cols;
  }, [layout]);

  const docked = useDockedReadout(width);
  const signature = useMemo(
    () => layout.links.map((l) => `${l.id}:${l.value}`).join("|") + `#${layout.nodes.map((n) => n.id).join("|")}`,
    [layout],
  );

  useScrollFade(scrollRef, svgRef, 0, svgW);

  // Validate the active mark against the current data.
  const act: Active | null =
    active && (active.kind === "node" ? nodeById.has(active.id) : linkById.has(active.id)) ? active : null;
  const actNode = act?.kind === "node" ? nodeById.get(act.id) : undefined;
  const actLink = act?.kind === "link" ? linkById.get(act.id) : undefined;

  // What lights up: every path through a node (upstream and downstream), or one flow and its ends.
  const lit = useMemo(() => {
    const litLinks = new Set<string>();
    const litNodes = new Set<string>();
    if (actNode) {
      litNodes.add(actNode.id);
      const walk = (start: SankeyLayoutNode, dir: "up" | "down") => {
        const stack = [start];
        const seen = new Set<SankeyLayoutNode>();
        while (stack.length > 0) {
          const n = stack.pop();
          if (!n) break;
          if (seen.has(n)) continue;
          seen.add(n);
          for (const l of dir === "down" ? n.sourceLinks : n.targetLinks) {
            litLinks.add(l.id);
            const next = dir === "down" ? l.target : l.source;
            litNodes.add(next.id);
            stack.push(next);
          }
        }
      };
      walk(actNode, "down");
      walk(actNode, "up");
    } else if (actLink) {
      litLinks.add(actLink.id);
      litNodes.add(actLink.source.id);
      litNodes.add(actLink.target.id);
    }
    return { links: litLinks, nodes: litNodes, any: !!actNode || !!actLink };
  }, [actNode, actLink]);

  // Readouts (tooltip rows) for nodes and links.
  const inflow = labelOverrides?.inflow ?? defaultSankeyChartLabels.inflow;
  const outflow = labelOverrides?.outflow ?? defaultSankeyChartLabels.outflow;
  const ofTotal = labelOverrides?.ofTotal ?? defaultSankeyChartLabels.ofTotal;
  const linkTitle = labelOverrides?.linkTitle ?? defaultSankeyChartLabels.linkTitle;
  const ofSource = labelOverrides?.ofSource ?? defaultSankeyChartLabels.ofSource;
  const ofTarget = labelOverrides?.ofTarget ?? defaultSankeyChartLabels.ofTarget;
  const nodeReadout = useCallback(
    (n: SankeyLayoutNode): Readout =>
      sankeyNodeReadout(n, {
        total: layout.total,
        format,
        pct,
        labels: { inflow, outflow, ofTotal, linkTitle, ofSource, ofTarget },
      }),
    [layout.total, format, pct, inflow, outflow, ofTotal, linkTitle, ofSource, ofTarget],
  );
  const linkReadout = useCallback(
    (l: SankeyLayoutLink): Readout =>
      sankeyLinkReadout(l, { format, pct, labels: { inflow, outflow, ofTotal, linkTitle, ofSource, ofTarget } }),
    [format, pct, inflow, outflow, ofTotal, linkTitle, ofSource, ofTarget],
  );

  const dock = useMemo(
    () => (docked ? dockSpace(width, [...layout.nodes.map(nodeReadout), ...layout.links.map(linkReadout)]) : 0),
    [docked, width, layout, nodeReadout, linkReadout],
  );

  // Keep the active node in view when the diagram scrolls sideways: the span to reveal, in px (NaN when nothing is active).
  const [revealX0, revealX1] = actNode
    ? [marginL + actNode.x0 - 120, marginL + actNode.x1 + 140]
    : actLink && source === "keyboard"
      ? [marginL + actLink.source.x1, marginL + actLink.target.x0]
      : [NaN, 0];
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || svgW <= width || Number.isNaN(revealX0)) return;
    if (revealX0 < scroller.scrollLeft) scroller.scrollLeft = Math.max(0, revealX0);
    else if (revealX1 > scroller.scrollLeft + scroller.clientWidth)
      scroller.scrollLeft = revealX1 - scroller.clientWidth;
  }, [revealX0, revealX1, svgW, width, scrollRef]);
  const actId = act?.id;
  useLayoutEffect(() => {
    if (actId !== undefined && scrollPos.current !== scrollLeft) setScrollLeft(scrollPos.current);
  }, [actId, scrollLeft]);

  /* ---------- Labels: beside each node, only where they fit (not redone on hover) ---------- */

  const placed = useMemo(
    () => placeSankeyLabels({ layout, columns, innerW, innerH, nodeWidth, outer, marginL, marginR, format, text }),
    [layout, columns, innerW, innerH, nodeWidth, outer, marginL, marginR, format, text],
  );

  /* ---------- Layers that don't change on hover: gradients and hit areas (rendered once per layout) ---------- */

  const clickableLinks = !!onLinkClick;
  const clickableNodes = !!onNodeClick;
  const { staticLayers, handlersRef } = useSankeyStaticLayers({
    layout,
    linkColor,
    uid,
    nodeWidth,
    clickableLinks,
    clickableNodes,
  });

  // Node hatches: one per distinct node colour, in order of first use (the first colour stays solid).
  const hatchOf = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of layout.nodes) if (!m.has(n.color)) m.set(n.color, m.size);
    return m;
  }, [layout]);
  const hatched = resolvePatterns(patterns, hatchOf.size);
  const nodeFill = useCallback(
    (n: SankeyLayoutNode) => patternFill(hatched, uid, hatchOf.get(n.color) ?? 0, n.color),
    [hatched, uid, hatchOf],
  );

  /* ---------- Ribbons and nodes: rendered once per layout, never restyled one by one ---------- */

  const ribbonStroke = useCallback(
    (l: SankeyLayoutLink) =>
      linkColor === "gradient"
        ? `url("#${uid}-g${l.index}")`
        : linkColor === "source"
          ? l.source.color
          : l.target.color,
    [linkColor, uid],
  );
  const markLayers = useMemo(
    () => (
      <>
        {/* Marks that left the data fade out here (filled by fadeOutLeaving, never by React). */}
        <g ref={leavingLayer} className="pointer-events-none forced-color-adjust-none" fill="none" />

        {/* Ribbons (geometry, stroke width and draw-in are painted by the tween). A reading dims the whole layer at once. */}
        <g
          ref={linkLayer}
          className="forced-color-adjust-none group-data-[dim]/sk:opacity-12 motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)"
          fill="none"
        >
          {layout.links.map((l) => (
            <path
              key={l.id}
              data-id={l.id}
              // Colour for the moment it fades out after leaving the data (its gradient goes with it).
              data-stroke={l.source.color}
              pathLength={1}
              stroke={ribbonStroke(l)}
              style={{ mixBlendMode: blend.blend, opacity: blend.opacity }}
              className="forced-colors:stroke-[CanvasText] forced-colors:mix-blend-normal!"
            />
          ))}
        </g>

        {/* Nodes */}
        <g
          ref={nodeLayer}
          className="forced-color-adjust-none group-data-[dim]/sk:opacity-28 motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)"
        >
          {layout.nodes.map((n) => (
            <path
              key={n.id}
              data-id={n.id}
              fill={nodeFill(n)}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              className="forced-colors:stroke-[CanvasText]"
            />
          ))}
        </g>
      </>
    ),
    [layout, ribbonStroke, nodeFill, blend.blend, blend.opacity],
  );

  // The reading: the base layers dim as a whole (one attribute on their group) and the lit ribbons
  // and nodes are drawn again on top, at full strength. The copies take their shapes from the
  // marks they light up, so they follow every tween.
  const markGroup = useRef<SVGGElement>(null);
  const litLinkLayer = useRef<SVGGElement>(null);
  const litNodeLayer = useRef<SVGGElement>(null);
  const marksRef = useRef<SankeyMarks | null>(null);
  // Takes the marks as an argument (the painter passes the ones it just found), so it never closes over `marksRef`.
  const copyLit = (marks: SankeyMarks | null) => {
    const linkEls = marks?.links;
    const nodeEls = marks?.nodes;
    for (const el of Array.from(litLinkLayer.current?.children ?? []) as SVGPathElement[]) {
      const base = linkEls?.get(el.dataset.id ?? "");
      if (!base) continue;
      el.setAttribute("d", base.getAttribute("d") ?? "");
      el.setAttribute("stroke-width", base.getAttribute("stroke-width") ?? "1");
      el.style.strokeDasharray = base.style.strokeDasharray;
    }
    for (const el of Array.from(litNodeLayer.current?.children ?? []) as SVGPathElement[]) {
      const base = nodeEls?.get(el.dataset.id ?? "");
      if (!base) continue;
      el.setAttribute("d", base.getAttribute("d") ?? "");
      el.style.transform = base.style.transform;
    }
  };
  useLayoutEffect(() => copyLit(marksRef.current), [lit, markLayers]);
  const litOpacity = Math.min(0.9, blend.opacity + 0.3);
  const litLayers = lit.any && (
    <g className="pointer-events-none forced-color-adjust-none">
      <g ref={litLinkLayer} fill="none">
        {layout.links
          .filter((l) => lit.links.has(l.id))
          .map((l) => (
            <path
              key={l.id}
              data-id={l.id}
              pathLength={1}
              stroke={ribbonStroke(l)}
              style={{
                mixBlendMode: blend.blend,
                opacity: litOpacity,
                filter: actLink?.id === l.id ? markGlow(l.source.color, 8) : undefined,
              }}
              className="forced-colors:stroke-[Highlight] forced-colors:mix-blend-normal!"
            />
          ))}
      </g>
      <g ref={litNodeLayer}>
        {layout.nodes
          .filter((n) => lit.nodes.has(n.id))
          .map((n) => (
            <path
              key={n.id}
              data-id={n.id}
              fill={nodeFill(n)}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                filter: actNode?.id === n.id ? markGlow(n.color) : undefined,
              }}
              className="forced-colors:stroke-[CanvasText]"
            />
          ))}
      </g>
    </g>
  );

  /* ---------- Painting: one tween moves every mark, outside React ---------- */

  const geo = useMemo(() => sankeyGeo(layout, placed), [layout, placed]);
  useSankeyPaint({
    geo,
    columns: layout.columns,
    play,
    reduced,
    width,
    signature,
    nodeWidth,
    layers: { links: linkLayer, nodes: nodeLayer, labels: labelLayer, leaving: leavingLayer },
    marksRef,
    copyLit,
  });

  /* ---------- Interaction ---------- */

  function move(next: Active | null, from: "keyboard" | "pointer") {
    setSource(from);
    setActive(next);
  }

  const nearestIn = (c: number, y: number) =>
    (columns[c] ?? []).reduce<SankeyLayoutNode | null>((best, n) => {
      const d = Math.abs((n.y0 + n.y1) / 2 - y);
      return !best || d < Math.abs((best.y0 + best.y1) / 2 - y) ? n : best;
    }, null);

  function onKeyDown(event: KeyboardEvent) {
    const firstNode = columns[0]?.[0];
    let next: Active | null | undefined;
    const key = event.key;
    if (key === "Escape") {
      if (!act) return;
      next = null;
    } else if (key === "Enter" || key === " ") {
      if (actNode && onNodeClick)
        onNodeClick({ id: actNode.id, label: actNode.label, inflow: actNode.inflow, outflow: actNode.outflow });
      else if (actLink && onLinkClick)
        onLinkClick({ source: actLink.source.id, target: actLink.target.id, value: actLink.value });
      else return;
      event.preventDefault();
      return;
    } else if (key === "Home") next = firstNode ? { kind: "node", id: firstNode.id } : null;
    else if (key === "End") {
      const lastCol = columns[columns.length - 1] ?? [];
      const n = lastCol[lastCol.length - 1];
      next = n ? { kind: "node", id: n.id } : null;
    } else if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) return;
    else if (!actNode && !actLink) next = firstNode ? { kind: "node", id: firstNode.id } : null;
    else if (actNode) {
      const col = columns[actNode.column] ?? [];
      const i = col.indexOf(actNode);
      const cy = (actNode.y0 + actNode.y1) / 2;
      if (key === "ArrowDown") next = { kind: "node", id: (col[Math.min(col.length - 1, i + 1)] ?? actNode).id };
      else if (key === "ArrowUp") next = { kind: "node", id: (col[Math.max(0, i - 1)] ?? actNode).id };
      else if (key === "ArrowRight") {
        const l = actNode.sourceLinks[0];
        if (l) next = { kind: "link", id: l.id, via: "source" };
        else {
          let n: SankeyLayoutNode | null = null;
          for (let c = actNode.column + 1; c < columns.length && !n; c++) n = nearestIn(c, cy);
          next = n ? { kind: "node", id: n.id } : act;
        }
      } else {
        const l = actNode.targetLinks[0];
        if (l) next = { kind: "link", id: l.id, via: "target" };
        else {
          let n: SankeyLayoutNode | null = null;
          for (let c = actNode.column - 1; c >= 0 && !n; c--) n = nearestIn(c, cy);
          next = n ? { kind: "node", id: n.id } : act;
        }
      }
    } else if (actLink && act?.kind === "link") {
      const base = act.via === "source" ? actLink.source : actLink.target;
      const siblings = act.via === "source" ? base.sourceLinks : base.targetLinks;
      const i = siblings.indexOf(actLink);
      if (key === "ArrowDown")
        next = { kind: "link", id: (siblings[Math.min(siblings.length - 1, i + 1)] ?? actLink).id, via: act.via };
      else if (key === "ArrowUp")
        next = { kind: "link", id: (siblings[Math.max(0, i - 1)] ?? actLink).id, via: act.via };
      else if (key === "ArrowRight") next = { kind: "node", id: actLink.target.id };
      else next = { kind: "node", id: actLink.source.id };
    }
    if (next === undefined) return;
    event.preventDefault();
    move(next, "keyboard");
  }

  /** The tooltip's anchor for a pointer at (x, y) in the scroller's box: a small square under it. */
  const pointerAnchor = (x: number, y: number): ChartTipAnchor => ({ x: x - 10, y: dock + y - 10, w: 20, h: 20 });

  function onMarkPointerDown(id: string, next: Active, event: PointerEvent) {
    const same = act?.id === id;
    tapRef.current = { id, wasActive: same, touch: event.pointerType !== "mouse" };
    if (event.pointerType !== "mouse") {
      const box = scrollRef.current?.getBoundingClientRect();
      if (box) tip.set(pointerAnchor(event.clientX - box.left, event.clientY - box.top));
      move(next, "pointer");
    }
  }
  function onMarkClick(id: string, activate: () => void) {
    const t = tapRef.current;
    if (t.touch && t.id === id && !t.wasActive) return; // first tap pins the readout
    activate();
  }
  // The box is read when the pointer enters a ribbon (and a few times a second after), not on every move.
  function trackPointer(event: PointerEvent, fresh = false) {
    if (event.pointerType !== "mouse") return;
    const cached = boxRef.current;
    if (fresh || !cached || event.timeStamp - cached.t > 250)
      boxRef.current = { rect: scrollRef.current?.getBoundingClientRect() ?? null, t: event.timeStamp };
    const box = boxRef.current?.rect;
    if (box) tip.set(pointerAnchor(event.clientX - box.left, event.clientY - box.top));
  }
  const clickNode = (id: string) => {
    const n = nodeById.get(id);
    if (n && onNodeClick)
      onMarkClick(n.id, () => onNodeClick({ id: n.id, label: n.label, inflow: n.inflow, outflow: n.outflow }));
  };
  // The memoised hit layers call the latest handlers through this ref.
  useSyncRef(handlersRef, {
    enterLink: (l, e) => {
      if (e.pointerType !== "mouse") return;
      trackPointer(e, true);
      move({ kind: "link", id: l.id, via: "source" }, "pointer");
    },
    moveLink: (e) => trackPointer(e),
    leave: (e) => {
      if (e.pointerType === "mouse") setActive(null);
    },
    downLink: (l, e) => onMarkPointerDown(l.id, { kind: "link", id: l.id, via: "source" }, e),
    clickLink: (l) => {
      if (onLinkClick)
        onMarkClick(l.id, () => onLinkClick({ source: l.source.id, target: l.target.id, value: l.value }));
    },
    enterNode: (id, e) => {
      if (e.pointerType === "mouse") move({ kind: "node", id }, "pointer");
    },
    downNode: (id, e) => onMarkPointerDown(id, { kind: "node", id }, e),
    clickNode,
  });

  // Nothing to draw (declared after the last hook above so hook order never changes).
  if (layout.nodes.length === 0 || layout.links.length === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  /* ---------- Tooltip + announcement ---------- */

  let tooltip: ReactNode = null;
  let announcement = "";
  const readout = actNode ? nodeReadout(actNode) : actLink ? linkReadout(actLink) : null;
  if (readout) {
    const bounds = { w: width, h: height + dock };
    if (actNode) {
      // The node and its label: the tooltip opens beside both, never over the node's own name.
      let x0 = actNode.x0;
      let x1 = actNode.x1;
      let y0 = actNode.y0;
      let y1 = Math.max(actNode.y0 + 2, actNode.y1);
      const lb = placed.find((p) => p.id === actNode.id);
      if (lb) {
        const nameW = Math.max(...lb.name.map((line) => measureText(line, LABEL_SIZE, 500)));
        const valueW = lb.value ? measureText(lb.value, VALUE_SIZE) : 0;
        const w = lb.inline ? nameW + 6 + valueW : Math.max(nameW, valueW);
        const h = lb.name.length * NAME_LINE + (lb.value && !lb.inline ? VALUE_LINE : 0);
        x0 = Math.min(x0, lb.anchor === "start" ? lb.x : lb.x - w);
        x1 = Math.max(x1, lb.anchor === "start" ? lb.x + w : lb.x);
        y0 = Math.min(y0, lb.y - h / 2);
        y1 = Math.max(y1, lb.y + h / 2);
      }
      const anchor = { x: marginL + x0 - scrollLeft, y: dock + PAD_Y + y0, w: x1 - x0, h: y1 - y0 };
      tooltip = <FlowTip title={readout.title} rows={readout.rows} anchor={anchor} bounds={bounds} docked={docked} />;
    } else if (actLink) {
      const l = actLink;
      const mx = marginL + (l.source.x1 + l.target.x0) / 2 - scrollLeft;
      const my = PAD_Y + (l.y0 + l.y1) / 2;
      const middle = { x: mx - 4, y: dock + my - l.width / 2, w: 8, h: Math.max(4, l.width) };
      // A ribbon read with the pointer: the tooltip follows it (a transform write per frame, no render).
      tooltip = (
        <FlowTip
          title={readout.title}
          rows={readout.rows}
          anchor={middle}
          bounds={bounds}
          docked={docked}
          store={source === "pointer" ? tip : undefined}
        />
      );
    }
    const parts = readout.rows.map((r) => `${r.value} ${r.label}`.trim());
    announcement = `${readout.title}: ${parts.join(", ")}`;
    if (actNode) announcement += `. ${labels.linkCount(actNode.sourceLinks.length + actNode.targetLinks.length)}`;
  }

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col", className)}>
      <div ref={measureRef} className="relative w-full" style={{ paddingTop: dock }}>
        {width > 0 && (
          <>
            {}
            <ChartFigure
              as="div"
              ref={scrollRef}
              // The diagram reads left to right in every writing direction: so does its scroller.
              dir="ltr"
              roleDescription={labels.roleDescription}
              label={ariaLabel}
              description={resolveInstructions(labels.instructions)}

              tabIndex={0}
              onKeyDown={onKeyDown}
              onBlur={() => setActive(null)}
              // Only a shown tooltip needs the scroll offset: scrolling with nothing read re-renders nothing.
              onScroll={(e) => {
                boxRef.current = null;
                scrollPos.current = e.currentTarget.scrollLeft;
                if (act) setScrollLeft(scrollPos.current);
              }}
              className={cn(
                "overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-sheen-sm [scrollbar-width:thin]",
                chartFocusClass,
              )}
            >
              <svg
                ref={svgRef}
                aria-hidden
                // Drawn left to right in every writing direction: text anchors stay physical under dir="rtl".
                direction="ltr"
                width={svgW}
                height={height}
                className="block"
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) setActive(null);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") {
                    setActive(null);
                    tip.set(null);
                    boxRef.current = null;
                  }
                }}
              >
                <defs>{staticLayers.gradients}</defs>
                {hatched && (
                  <ChartPatternDefs id={uid} entries={[...hatchOf].map(([color, index]) => ({ index, color }))} />
                )}
                <g
                  ref={markGroup}
                  transform={`translate(${marginL},${PAD_Y})`}
                  data-dim={lit.any ? "" : undefined}
                  className="group/sk"
                >
                  {markLayers}
                  {litLayers}
                  <g>
                    {/* The active node gets a ring, like every other chart's active mark. */}
                    {actNode && (
                      <path
                        d={roundedRectPath(
                          actNode.x0 - 2.5,
                          actNode.y0 - 2.5,
                          nodeWidth + 5,
                          Math.max(1, actNode.y1 - actNode.y0) + 5,
                          5,
                        )}
                        fill="none"
                        strokeWidth={1.5}
                        className="pointer-events-none stroke-sheen-fg forced-colors:stroke-[Highlight]"
                      />
                    )}
                  </g>

                  {staticLayers.hits}

                  {/* Labels (never in a series colour; a halo keeps them legible over ribbons). Hovering one reads its node. */}
                  <g ref={labelLayer}>
                    {placed.map((lb) => {
                      const on = lit.nodes.has(lb.id);
                      const dim = lit.any && !on;
                      const full = nodeById.get(lb.id)?.label ?? "";
                      const nameClass = cn(
                        "font-medium",
                        dim
                          ? "fill-sheen-fg-subtle forced-colors:fill-[GrayText]"
                          : "fill-sheen-fg forced-colors:fill-[CanvasText]",
                        on && actNode?.id === lb.id && "font-semibold",
                      );
                      // Stacked lines are centred on the node: baselines from the top line down.
                      const steps = [
                        ...lb.name.map((_, i) => (i === 0 ? 0 : NAME_LINE)),
                        ...(lb.value && !lb.inline ? [VALUE_LINE] : []),
                      ];
                      const span = steps.reduce((s, v) => s + v, 0);
                      return (
                        <text
                          key={lb.id}
                          data-id={lb.id}
                          textAnchor={lb.anchor}
                          stroke="var(--sheen-chart-surface)"
                          className={cn("text-xs", haloTextClass, onNodeClick && "cursor-pointer")}
                          onPointerEnter={(e) =>
                            e.pointerType === "mouse" && move({ kind: "node", id: lb.id }, "pointer")
                          }
                          onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                          onPointerDown={(e) => onMarkPointerDown(lb.id, { kind: "node", id: lb.id }, e)}
                          onClick={() => clickNode(lb.id)}
                        >
                          {lb.name.join(" ") !== full && <title>{full}</title>}
                          {lb.name.map((line, i) => (
                            <tspan key={i} x={0} dy={i === 0 ? r2(4.2 - span / 2) : NAME_LINE} className={nameClass}>
                              {line}
                            </tspan>
                          ))}
                          {lb.value &&
                            (lb.inline ? (
                              <tspan
                                dx={6}
                                className="fill-sheen-fg-muted text-2xs tabular-nums forced-colors:fill-[CanvasText]"
                              >
                                {lb.value}
                              </tspan>
                            ) : (
                              <tspan
                                x={0}
                                dy={VALUE_LINE}
                                className="fill-sheen-fg-muted text-2xs tabular-nums forced-colors:fill-[CanvasText]"
                              >
                                {lb.value}
                              </tspan>
                            ))}
                        </text>
                      );
                    })}
                  </g>
                </g>
              </svg>
            </ChartFigure>
            {tooltip ?? (docked && <ChartDockHint>{labels.hint}</ChartDockHint>)}
          </>
        )}
      </div>
      <ChartAnnouncer text={source === "keyboard" ? announcement : ""} />
    </div>
  );
}
