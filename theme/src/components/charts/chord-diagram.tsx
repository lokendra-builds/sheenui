"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { animate } from "motion/react";

import { cn } from "../../lib/cn";
import { useSyncRef } from "../../hooks/use-latest";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, ChartLegend } from "./chart-parts";
import { dockSpace, type Readout, useDockedReadout } from "./chart-fit";
import { chartFocusClass, clamp, useElementWidth, resolveInstructions, itemAt } from "./chart-utils";
import { ChartDockHint, defaultCompact, defaultPercent, useEntrance, type ChartTipAnchor } from "./heatmap";
import {
  enterCurve,
  fitText,
  FlowTip,
  markGlow,
  marksById,
  measureText,
  polar,
  ribbonBlend,
  ringSector,
  useDarkScheme,
  useFontsLoaded,
  useFrameStore,
  type TapState,
} from "./flow-utils";
import { ChartFigure } from "./chart-figure";

import {
  defaultChordDiagramLabels,
  type ChordDiagramProps,
  fold,
  type Ribbon,
  layoutChord,
  type Active,
  type ChordAngles,
  type ChordGeometry,
  type ChordMarks,
  anglesOf,
  mixAngles,
  paintChord,
} from "./chord-diagram/model";

export {
  type ChordGroup,
  type ChordDiagramLabels,
  defaultChordDiagramLabels,
  type ChordDiagramProps,
  chordLegend,
} from "./chord-diagram/model";
export {
  type ChordTableProps,
  type ChordTableLabels,
  defaultChordTableLabels,
  ChordTable,
} from "./chord-diagram/parts";
/**
 * Flows between a handful of groups (≤ 8) as ribbons across a circle: who hands work to whom,
 * plan upgrades and downgrades, trade between regions.
 *
 * - Each group's arc is its total outflow; each ribbon's width at an end is the flow from that
 *   end to the other. Ribbons blend from one group's colour into the other's.
 * - Hover or tap a group to light up its ribbons (the rest step back); hover a ribbon to read
 *   both directions. Keyboard: arrows go around the groups and through a group's ribbons.
 * - First view: the ring sweeps in clockwise, then the ribbons bloom from the centre. Data changes
 *   tween every angle. One tween drives every mark, written straight to the SVG (no React render
 *   per frame). Instant with reduced motion.
 *
 * Keyboard: Tab focuses the chart; Left and Right move around the groups, Down and Up step through a group's ribbons, Left and Right on a ribbon jump between its two ends, Escape clears. With `onGroupClick`, Enter activates the group being read.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the group or ribbon with its flows in both directions. `ChordTable` is the table view (the whole flow matrix).
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws the ring and ribbons instantly.
 *
 * @example
 * ```tsx
 * import { ChordDiagram } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChordDiagram
 *       groups={[{ id: "eu", label: "Europe" }, { id: "us", label: "US" }, { id: "asia", label: "Asia" }]}
 *       matrix={[
 *         [0, 12, 7],
 *         [9, 0, 5],
 *         [4, 6, 0],
 *       ]}
 *       aria-label="Trade flows between regions"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/chord-diagram
 */
export function ChordDiagram({
  groups: groupsIn,
  matrix: matrixIn,
  height = 360,
  padAngle = 0.04,
  showLabels = true,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  onGroupClick,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<ChordDiagramProps>) {
  const labels = { ...defaultChordDiagramLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const reduced = useSheenReducedMotion();
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const defsRef = useRef<SVGDefsElement>(null);
  const ribbonLayer = useRef<SVGGElement>(null);
  const arcLayer = useRef<SVGGElement>(null);
  const nameLayer = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const fonts = useFontsLoaded(); // names are fitted with measureText: fit them again once the font arrives
  // Text tools for the current font state: a new object when the web fonts arrive, so fits that use it are redone.
  const text = useMemo(() => ({ ready: fonts, width: measureText, fit: fitText }), [fonts]);
  const dark = useDarkScheme();
  const [active, setActive] = useState<Active | null>(null);
  const [source, setSource] = useState<"keyboard" | "pointer">("pointer");
  // Where a ribbon's tooltip is anchored while the pointer runs along it (moved without React renders).
  const tip = useFrameStore<ChartTipAnchor>();
  // The svg box, read when the pointer enters a ribbon (and a few times a second after), not on every move.
  const boxRef = useRef<{ rect: DOMRect | null; t: number } | null>(null);
  const tapRef = useRef<TapState>({ id: null, wasActive: false, touch: false });

  const { groups, matrix } = useMemo(() => fold(groupsIn, matrixIn, labels.other), [groupsIn, matrixIn, labels.other]);
  const target = useMemo(() => layoutChord(matrix, padAngle), [matrix, padAngle]);
  const blend = ribbonBlend(dark, groups.length);
  const G = target.groups.length;

  // Geometry: room for the names outside the ring when it fits, else just the ring (use the legend).
  const docked = useDockedReadout(width);
  const longest = useMemo(() => Math.max(0, ...groups.map((g) => text.width(g.label, 12, 500))), [groups, text]);
  const labelRoom = Math.min(longest + 14, width * 0.26);
  const fullR = Math.min(width / 2 - labelRoom, height / 2 - 26);
  const withLabels = showLabels && fullR >= 72;
  const R = withLabels ? fullR : Math.min(width, height) / 2 - 4;
  // A card too narrow for `height` gets a shorter chart: the circle (and its names), no empty bands.
  const boxH = width > 0 ? Math.min(height, Math.ceil(2 * R + (withLabels ? 52 : 8))) : height;
  const ringW = clamp(R * 0.07, 8, 14);
  const rIn = R - ringW;
  const rRibbon = rIn - 4;
  const cx = width / 2;
  const cy = boxH / 2;

  const outflowLabel = labelOverrides?.outflow ?? defaultChordDiagramLabels.outflow;
  const inflowLabel = labelOverrides?.inflow ?? defaultChordDiagramLabels.inflow;
  const ofTotalLabel = labelOverrides?.ofTotal ?? defaultChordDiagramLabels.ofTotal;
  const directionLabel = labelOverrides?.direction ?? defaultChordDiagramLabels.direction;
  const ribbonTitleLabel = labelOverrides?.ribbonTitle ?? defaultChordDiagramLabels.ribbonTitle;
  const groupReadout = useCallback(
    (gi: number): Readout => {
      const g = itemAt(target.groups, gi);
      const grp = itemAt(groups, gi);
      return {
        title: grp.label,
        rows: [
          { label: outflowLabel, value: format(g.outflow), color: grp.color, kind: "rect" },
          { label: inflowLabel, value: format(g.inflow), color: "transparent", kind: "rect" },
          {
            label: ofTotalLabel,
            value: pct(target.total > 0 ? g.outflow / target.total : NaN),
            color: "transparent",
            kind: "rect",
          },
        ],
      };
    },
    [target, groups, format, pct, outflowLabel, inflowLabel, ofTotalLabel],
  );
  const ribbonReadout = useCallback(
    (r: Ribbon): Readout => {
      const a = itemAt(groups, r.i);
      const b = itemAt(groups, r.j);
      if (r.i === r.j)
        return {
          title: directionLabel(a.label, a.label),
          rows: [{ label: "", value: format(r.ij), color: a.color, kind: "rect" }],
        };
      return {
        title: ribbonTitleLabel(a.label, b.label),
        rows: [
          { label: directionLabel(a.label, b.label), value: format(r.ij), color: a.color, kind: "rect" },
          { label: directionLabel(b.label, a.label), value: format(r.ji), color: b.color, kind: "rect" },
        ],
      };
    },
    [groups, format, directionLabel, ribbonTitleLabel],
  );
  const dock = useMemo(
    () =>
      docked
        ? dockSpace(width, [...target.groups.map((_, i) => groupReadout(i)), ...target.ribbons.map(ribbonReadout)])
        : 0,
    [docked, width, target, groupReadout, ribbonReadout],
  );

  // Names outside the ring, placed on the settled angles: the biggest groups first; one that would
  // collide steps back (and is listed in the legend under the circle instead).
  type Name = { gi: number; anchor: "start" | "middle" | "end"; dy: string; text: string };
  const names = useMemo(() => {
    const placed: Name[] = [];
    if (!withLabels || width === 0) return placed;
    const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
    const order = [...target.groups].filter((g) => g.a1 - g.a0 > 0.02).sort((a, b) => b.value - a.value);
    for (const g of order) {
      const mid = (g.a0 + g.a1) / 2;
      const [x, y] = polar(cx, cy, R + 8, mid);
      const sin = Math.sin(mid);
      const cos = Math.cos(mid);
      const anchor = sin > 0.2 ? "start" : sin < -0.2 ? "end" : "middle";
      const room = anchor === "start" ? width - x - 4 : anchor === "end" ? x - 4 : Math.min(x, width - x) * 2 - 8;
      const shown = text.fit(itemAt(groups, g.index).label, room, 12, 500);
      if (!shown) continue;
      const w = text.width(shown, 12, 500);
      const dy = cos > 0.6 ? "-0.25em" : cos < -0.6 ? "0.95em" : "0.35em";
      const top = y + (cos > 0.6 ? -14 : cos < -0.6 ? 0 : -7);
      const box = { x0: anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2, x1: 0, y0: top, y1: top + 15 };
      box.x1 = box.x0 + w;
      if (boxes.some((b) => box.x0 < b.x1 + 4 && box.x1 > b.x0 - 4 && box.y0 < b.y1 && box.y1 > b.y0)) continue;
      boxes.push(box);
      placed.push({ gi: g.index, anchor, dy, text: shown });
    }
    return placed;
  }, [target, groups, withLabels, width, cx, cy, R, text]);

  /* ---------- Painting: one tween per change, written straight to the marks ---------- */

  const angles = useMemo(() => anglesOf(target), [target]);
  const shownRef = useRef<ChordAngles | null>(null);
  const runRef = useRef<{ now: () => ChordAngles } | null>(null);
  const intro = useRef(reduced ? 1 : 0);
  const marksRef = useRef<ChordMarks | null>(null);
  const geometry: ChordGeometry = { cx, cy, R, rIn, rRibbon };
  const geometryRef = useRef(geometry);
  useSyncRef(geometryRef, geometry);

  // After every render: find the marks and paint them at the angles on screen now.
  useLayoutEffect(() => {
    if (width === 0) return;
    marksRef.current = {
      arcs: marksById(arcLayer.current),
      ribbons: marksById(ribbonLayer.current),
      gradients: marksById(defsRef.current),
      names: marksById(nameLayer.current),
      ribbonLayer: ribbonLayer.current,
      nameLayer: nameLayer.current,
    };
    paintChord(marksRef.current, runRef.current?.now() ?? shownRef.current ?? angles, intro.current, geometry);
  });

  // Data changes: every angle tweens from where it is (new arcs grow from the top).
  const hasWidth = width > 0;
  useEffect(() => {
    if (!hasWidth) return;
    const from = runRef.current?.now() ?? shownRef.current;
    shownRef.current = angles;
    runRef.current = null;
    const marks = marksRef.current;
    if (!marks) return;
    if (reduced || !from || from === angles) {
      paintChord(marks, angles, intro.current, geometryRef.current);
      return;
    }
    let t = 0;
    const controls = animate(0, 1, {
      duration: duration.slower,
      ease: "linear",
      onUpdate: (k) => {
        t = enterCurve(k);
        paintChord(marks, mixAngles(from, angles, t), intro.current, geometryRef.current);
      },
      onComplete: () => {
        runRef.current = null;
      },
    });
    runRef.current = { now: () => mixAngles(from, angles, t) };
    return () => controls.stop();
  }, [angles, reduced, hasWidth]);

  // Entrance: the ring sweeps clockwise, then the ribbons bloom out of the centre. The angles are only the fallback for a frame painted before any data tween, so they are read, not watched.
  const anglesNow = useEffectEvent(() => angles);
  useEffect(() => {
    if (!play || intro.current >= 1 || !hasWidth) return;
    const paintNow = () => {
      const marks = marksRef.current;
      if (marks)
        paintChord(marks, runRef.current?.now() ?? shownRef.current ?? anglesNow(), intro.current, geometryRef.current);
    };
    if (reduced) {
      intro.current = 1;
      paintNow();
      return;
    }
    const start = intro.current;
    const controls = animate(start, 1, {
      duration: 1.3 * (1 - start),
      ease: [...ease.out],
      onUpdate: (v) => {
        intro.current = v;
        paintNow();
      },
    });
    return () => controls.stop();
  }, [play, reduced, hasWidth]);

  if (G === 0 || target.total <= 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const ribbons = target.ribbons;
  const groupArcs = target.groups;
  const ribbonsOf = (gi: number) =>
    ribbons
      .filter((r) => r.i === gi || r.j === gi)
      .sort((a, b) => b.ij + b.ji - (a.ij + a.ji) || a.id.localeCompare(b.id));
  const liveGroups = groupArcs.filter((g) => g.value > 0 || g.inflow > 0).map((g) => g.index);

  const act =
    active && (active.kind === "group" ? active.i < G : ribbons.some((r) => r.id === active.id)) ? active : null;
  const actRibbon = act?.kind === "ribbon" ? ribbons.find((r) => r.id === act.id) : undefined;
  const actGroup = act?.kind === "group" ? act.i : null;
  const litGroup = (gi: number) =>
    act === null || actGroup === gi || (actRibbon !== undefined && (actRibbon.i === gi || actRibbon.j === gi));
  const litRibbon = (r: Ribbon) =>
    act === null || (actGroup !== null && (r.i === actGroup || r.j === actGroup)) || actRibbon?.id === r.id;

  function move(next: Active | null, from: "keyboard" | "pointer") {
    setSource(from);
    setActive(next);
  }

  function onKeyDown(event: KeyboardEvent) {
    let next: Active | null | undefined;
    const firstLive = liveGroups[0];
    switch (event.key) {
      case "ArrowRight":
      case "ArrowLeft": {
        const step = event.key === "ArrowRight" ? 1 : -1;
        if (!act) next = firstLive === undefined ? null : { kind: "group", i: firstLive };
        else if (act.kind === "group") {
          const k = liveGroups.indexOf(act.i);
          const gi = liveGroups[(k + step + liveGroups.length) % liveGroups.length];
          next = gi === undefined ? act : { kind: "group", i: gi };
        } else if (actRibbon) {
          const other = actRibbon.i === act.from ? actRibbon.j : actRibbon.i;
          next = { kind: "group", i: step > 0 ? other : act.from };
        }
        break;
      }
      case "ArrowDown":
      case "ArrowUp": {
        const step = event.key === "ArrowDown" ? 1 : -1;
        if (!act) next = firstLive === undefined ? null : { kind: "group", i: firstLive };
        else {
          const from = act.kind === "group" ? act.i : act.from;
          const list = ribbonsOf(from);
          if (list.length === 0) next = act;
          else if (act.kind === "group") {
            // Down to the group's first ribbon, up round to its last one.
            next = { kind: "ribbon", id: itemAt(list, step > 0 ? 0 : list.length - 1).id, from };
          } else {
            const k = list.findIndex((r) => r.id === act.id);
            // Up from the first ribbon goes back to the group itself.
            next =
              step < 0 && k <= 0
                ? { kind: "group", i: from }
                : { kind: "ribbon", id: itemAt(list, clamp(k + step, 0, list.length - 1)).id, from };
          }
        }
        break;
      }
      case "Home":
        next = firstLive === undefined ? null : { kind: "group", i: firstLive };
        break;
      case "End": {
        const gi = liveGroups[liveGroups.length - 1];
        next = gi === undefined ? null : { kind: "group", i: gi };
        break;
      }
      case "Enter":
      case " ": {
        if (act?.kind !== "group" || !onGroupClick) return;
        const g = itemAt(target.groups, act.i);
        const grp = itemAt(groups, act.i);
        if (!grp.other) onGroupClick({ id: grp.ids[0] ?? "", label: grp.label, outflow: g.outflow, inflow: g.inflow });
        event.preventDefault();
        return;
      }
      case "Escape":
        if (!act) return;
        next = act.kind === "ribbon" ? { kind: "group", i: act.from } : null;
        break;
      default:
        return;
    }
    // Every key the chart handles stays in the chart (no page scroll), even when nothing changes.
    event.preventDefault();
    move(next ?? null, "keyboard");
  }

  /** The tooltip's anchor for a pointer at (x, y) in the svg's box: a small square under it. */
  const pointerAnchor = (x: number, y: number): ChartTipAnchor => ({ x: x - 8, y: dock + y - 8, w: 16, h: 16 });
  function track(event: PointerEvent, fresh = false) {
    const cached = boxRef.current;
    if (fresh || !cached || event.timeStamp - cached.t > 250)
      boxRef.current = {
        rect: (event.currentTarget as SVGElement).ownerSVGElement?.getBoundingClientRect() ?? null,
        t: event.timeStamp,
      };
    const box = boxRef.current?.rect;
    if (box) tip.set(pointerAnchor(event.clientX - box.left, event.clientY - box.top));
  }

  function onMarkDown(id: string, next: Active, event: PointerEvent) {
    tapRef.current = {
      id,
      wasActive: (act?.kind === "group" ? `g${act.i}` : act?.kind === "ribbon" ? act.id : null) === id,
      touch: event.pointerType !== "mouse",
    };
    if (event.pointerType !== "mouse") {
      track(event, true);
      move(next, "pointer");
    }
  }

  // Tooltip and announcement.
  let tooltip: ReactNode = null;
  let announcement = "";
  const readout = act?.kind === "group" ? groupReadout(act.i) : actRibbon ? ribbonReadout(actRibbon) : null;
  if (act && readout) {
    let anchor = { x: cx - 4, y: dock + cy - 4, w: 8, h: 8 };
    if (act.kind === "group") {
      const g = itemAt(groupArcs, act.i);
      const [x, y] = polar(cx, cy, R - ringW / 2, (g.a0 + g.a1) / 2);
      anchor = { x: x - 6, y: dock + y - 6, w: 12, h: 12 };
    } else if (actRibbon) {
      const [x, y] = polar(cx, cy, rRibbon * 0.35, (actRibbon.s0 + actRibbon.s1 + actRibbon.t0 + actRibbon.t1) / 4);
      anchor = { x: x - 4, y: dock + y - 4, w: 8, h: 8 };
    }
    const bounds = { w: width, h: boxH + dock };
    // A ribbon read with the pointer: the tooltip follows it (a transform write per frame, no render).
    tooltip = (
      <FlowTip
        title={readout.title}
        rows={readout.rows}
        anchor={anchor}
        bounds={bounds}
        docked={docked}
        store={act.kind === "ribbon" && source === "pointer" ? tip : undefined}
      />
    );
    // Group rows read value first ("1,186 out"); ribbon rows name their direction first ("Free → Pro 640").
    announcement = `${readout.title}: ${readout.rows.map((r) => (act.kind === "group" ? `${r.value} ${r.label}` : `${r.label} ${r.value}`).trim()).join(", ")}`;
    if (act.kind === "group") announcement += `. ${labels.ribbonCount(ribbonsOf(act.i).length)}`;
  }

  // Names that can't be printed around the ring (a narrow card, a crowded side) are listed in a legend below.
  const nameless = showLabels && liveGroups.some((gi) => !names.some((nm) => nm.gi === gi));
  const drawOrder = [...ribbons].sort((a, b) => b.ij + b.ji - (a.ij + a.ji));

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col", className)}>
      {}
      <ChartFigure
        as="div"
        ref={measureRef}
        roleDescription={labels.roleDescription}
        label={ariaLabel}
        description={resolveInstructions(labels.instructions)}

        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        className={cn("relative w-full rounded-sheen-sm", chartFocusClass)}
        style={{ height: boxH + dock, paddingTop: dock }}
      >
        {width > 0 && (
          <svg
            aria-hidden
            // Drawn left to right in every writing direction: text anchors stay physical under dir="rtl".
            direction="ltr"
            width={width}
            height={boxH}
            className="block overflow-visible"
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
            {/* Gradient ends follow the ribbons (painted). */}
            <defs ref={defsRef}>
              {ribbons.map((r) => (
                <linearGradient key={r.id} data-id={r.id} id={`${uid}-r${r.id}`} gradientUnits="userSpaceOnUse">
                  <stop offset="0.1" style={{ stopColor: itemAt(groups, r.i).color }} />
                  <stop offset="0.9" style={{ stopColor: itemAt(groups, r.j).color }} />
                </linearGradient>
              ))}
            </defs>

            {/* Ribbons (their shapes, and the layer's bloom, are painted). */}
            <g ref={ribbonLayer} className="forced-color-adjust-none">
              {drawOrder.map((r) => {
                const on = actRibbon?.id === r.id;
                const lit = litRibbon(r);
                return (
                  <path
                    key={r.id}
                    data-id={r.id}
                    fill={`url("#${uid}-r${r.id}")`}
                    className="motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast) forced-colors:fill-[CanvasText] forced-colors:mix-blend-normal!"
                    style={{
                      mixBlendMode: blend.blend,
                      opacity: act === null ? blend.opacity + 0.08 : lit ? Math.min(0.92, blend.opacity + 0.3) : 0.22,
                      filter: on ? markGlow(itemAt(groups, r.ij >= r.ji ? r.i : r.j).color, 8) : undefined,
                    }}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== "mouse") return;
                      track(e, true);
                      move({ kind: "ribbon", id: r.id, from: r.ij >= r.ji ? r.i : r.j }, "pointer");
                    }}
                    onPointerMove={(e) => e.pointerType === "mouse" && track(e)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                    onPointerDown={(e) =>
                      onMarkDown(r.id, { kind: "ribbon", id: r.id, from: r.ij >= r.ji ? r.i : r.j }, e)
                    }
                  />
                );
              })}
            </g>

            {/* Group arcs */}
            <g className="forced-color-adjust-none">
              <g ref={arcLayer}>
                {groupArcs.map((g) => {
                  const grp = itemAt(groups, g.index);
                  const on = actGroup === g.index;
                  return (
                    <path
                      key={grp.ids.join("|")}
                      data-id={g.index}
                      fill={grp.color}
                      className={cn(
                        "motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast) forced-colors:stroke-[CanvasText]",
                        onGroupClick && !grp.other && "cursor-pointer",
                      )}
                      style={{ opacity: litGroup(g.index) ? 1 : 0.35, filter: on ? markGlow(grp.color) : undefined }}
                      onPointerEnter={(e) =>
                        e.pointerType === "mouse" && move({ kind: "group", i: g.index }, "pointer")
                      }
                      onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                      onPointerDown={(e) => onMarkDown(`g${g.index}`, { kind: "group", i: g.index }, e)}
                      onClick={() => {
                        const t = tapRef.current;
                        if (!onGroupClick || grp.other || (t.touch && t.id === `g${g.index}` && !t.wasActive)) return;
                        onGroupClick({ id: grp.ids[0] ?? "", label: grp.label, outflow: g.outflow, inflow: g.inflow });
                      }}
                    />
                  );
                })}
              </g>
              {actGroup !== null && groupArcs[actGroup] && (
                <path
                  d={ringSector(
                    cx,
                    cy,
                    rIn - 2,
                    R + 2,
                    groupArcs[actGroup].a0 - 1 / R,
                    groupArcs[actGroup].a1 + 1 / R,
                    0,
                  )}
                  fill="none"
                  strokeWidth={1.5}
                  className="pointer-events-none stroke-sheen-fg forced-colors:stroke-[Highlight]"
                />
              )}
            </g>

            {/* Names (text colours only, never the series colour); placed on the settled angles, moved by the painter. */}
            <g ref={nameLayer} className="pointer-events-none">
              {names.map((nm) => (
                <text
                  key={nm.gi}
                  data-id={nm.gi}
                  dy={nm.dy}
                  textAnchor={nm.anchor}
                  className={cn(
                    "text-xs font-medium motion-ok:transition-[fill] motion-ok:duration-(--sheen-duration-fast)",
                    litGroup(nm.gi)
                      ? "fill-sheen-fg forced-colors:fill-[CanvasText]"
                      : "fill-sheen-fg-subtle forced-colors:fill-[GrayText]",
                  )}
                >
                  {nm.text}
                </text>
              ))}
            </g>
          </svg>
        )}
        {tooltip ?? (docked && <ChartDockHint>{labels.hint}</ChartDockHint>)}
      </ChartFigure>
      {nameless && (
        <ChartLegend
          className="mt-3 justify-center"
          items={groups.map((g) => ({ label: g.label, color: g.color, kind: "rect" }))}
        />
      )}
      <ChartAnnouncer text={source === "keyboard" ? announcement : ""} />
    </div>
  );
}
