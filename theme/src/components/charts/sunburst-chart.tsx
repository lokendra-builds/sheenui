"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { animate } from "motion/react";

import { cn } from "../../lib/cn";
import { useSyncRef } from "../../hooks/use-latest";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import { chartFocusClass, slotColor, TOOLTIP_DOCK_BELOW, useElementWidth, resolveInstructions } from "./chart-utils";
import { defaultCompact, defaultPercent, useContrastInk, useEntrance } from "./heatmap";
import {
  enterCurve,
  FlowTip,
  markGlow,
  marksById,
  measureText,
  mix,
  polar,
  ringSector,
  useFontsLoaded,
  type TapState,
} from "./flow-utils";
import { ChartFigure } from "./chart-figure";

import {
  defaultSunburstChartLabels,
  type SunburstChartProps,
  type Arc,
  depthFill,
  partition,
  pathOf,
  find,
  heightOf,
  type Drawn,
  type SunView,
  VALUE_STEPS,
  ROUND,
  GAP,
  HOLE,
  type Geometry,
  arcGeometry,
  visibleArcs,
  sameView,
} from "./sunburst-chart/model";
import { RollingValue, ArcLabel, Chevron } from "./sunburst-chart/parts";

export {
  type SunburstNode,
  type SunburstChartLabels,
  defaultSunburstChartLabels,
  type SunburstChartProps,
  sunburstLegend,
} from "./sunburst-chart/model";
export {
  type SunburstTableLabels,
  defaultSunburstTableLabels,
  type SunburstTableProps,
  SunburstTable,
} from "./sunburst-chart/parts";
/**
 * A hierarchy as rings around a centre: each ring is a level, each arc's angle its share.
 *
 * - Every top-level group has its own palette slot; its descendants share the hue in lighter
 *   steps outwards. Arcs are separated by parallel 2px gaps with softly rounded corners.
 * - Hover or tap an arc to trace its path from the centre (the rest steps back) and read it in
 *   the centre, where the number rolls to the new value; wide charts add a tooltip.
 * - Click (or Enter) a group to zoom into it: the rings sweep to the new level with an animated
 *   zoom; the breadcrumb, the centre or Escape zoom back out.
 * - Labels are printed along or across their arc, only where they fit (once the view settles).
 * - Keyboard: left / right go around a ring, down / up move out to the children and back in.
 * - First view: the rings sweep in clockwise, inner ring first. Zoom and entrance are one tween
 *   each, written straight to the arcs (React renders once per zoom, not per frame). Instant
 *   with reduced motion.
 *
 * Keyboard: Tab focuses the chart; Left and Right go around a ring, Down moves out to the children, Up moves back in, Home and End jump to the first and last arc, Enter zooms into a group (with `drillDown`), Escape or Backspace zooms back out.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; the centre reads the active arc, and zooming is announced. `SunburstTable` lists every node as the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and zooms instantly.
 *
 * @example
 * ```tsx
 * import { SunburstChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SunburstChart
 *       data={[
 *         { label: "Web", children: [{ label: "Search", value: 40 }, { label: "Ads", value: 25 }] },
 *         { label: "Mobile", children: [{ label: "iOS", value: 35 }, { label: "Android", value: 30 }] },
 *       ]}
 *       aria-label="Sessions by platform and source"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/sunburst
 */
export function SunburstChart({
  data,
  height = 360,
  rings: ringsProp = 3,
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
}: ChartRoot<SunburstChartProps>) {
  const labels = { ...defaultSunburstChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const arcLayer = useRef<SVGGElement>(null);
  const litLayer = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const setGroup = useMergedRef(groupRef, measureRef);
  const play = useEntrance(rootRef, reduced);
  useFontsLoaded(); // labels are fitted with measureText: fit them again once the font arrives
  const [active, setActive] = useState<string | null>(null);
  const [source, setSource] = useState<"keyboard" | "pointer">("pointer");
  const [innerPath, setInnerPath] = useState<readonly string[]>(defaultPath);
  const [announcement, setAnnouncement] = useState("");
  // Bumped when a zoom or the entrance ends: the labels appear then.
  const tapRef = useRef<TapState>({ id: null, wasActive: false, touch: false });

  const tree = useMemo(() => partition(data), [data]);
  const hierarchical = tree.children.some((c) => c.children.length > 0);
  const canDrill = drillDown ?? hierarchical;
  const path = pathProp ?? innerPath;
  const focus = canDrill ? find(tree, path) : tree;
  const crumbs = pathOf(focus);
  const rings = Math.max(1, Math.min(ringsProp, heightOf(focus) || 1));
  const byId = useMemo(() => {
    const map = new Map<string, Arc>();
    const walk = (a: Arc) => {
      map.set(a.id, a);
      a.children.forEach(walk);
    };
    walk(tree);
    return map;
  }, [tree]);

  const size = Math.max(0, Math.min(width, height));
  // A card narrower than `height` gets a shorter chart: the circle, without empty bands above and below.
  const boxH = width > 0 ? Math.min(height, Math.max(width, 120)) : height;
  const R = size / 2 - 2;
  const hole = R * HOLE;
  const cx = width / 2;
  const cy = boxH / 2;
  const geometry = useMemo<Geometry>(() => ({ cx, cy, R, hole, rings }), [cx, cy, R, hole, rings]);

  // The zoom on screen (tweened toward the focus), and the entrance progress: refs, painted per frame.
  const target = useMemo<SunView>(
    () => ({ v0: focus.x0, v1: focus.x1, vd: focus.depth, vr: rings }),
    [focus.x0, focus.x1, focus.depth, rings],
  );
  const viewRef = useRef<SunView>(target);
  const intro = useRef(reduced ? 1 : 0);
  // The view and the entrance as React state only once they settle (the refs above change every frame):
  // each landing requests one render, so labels and the tooltip follow the settled view.
  const [settledView, setSettledView] = useState<SunView>(target);
  const [introDone, setIntroDone] = useState(reduced);
  const zooming = !sameView(settledView, target);

  // Arcs in the DOM: those shown now and those shown once the zoom lands (the painter draws each frame).
  const shownArcs = useMemo(() => {
    const set = new Set<Arc>();
    if (width > 0 && tree.value > 0) {
      visibleArcs(tree, settledView, geometry, set);
      visibleArcs(tree, target, geometry, set);
    }
    return [...set].sort((a, b) => a.depth - b.depth || a.x0 - b.x0);
  }, [tree, settledView, target, geometry, width]);

  // Arcs where they settle (labels, the active ring, the tooltip): once per zoom or size, not per hover.
  const drawn = useMemo(() => {
    const out: Drawn[] = [];
    for (const arc of shownArcs) {
      const geo = arcGeometry(arc, target, 1, geometry);
      if (geo) out.push({ arc, d: "", ...geo });
    }
    return out;
  }, [shownArcs, target, geometry]);

  // Label ink for every fill in the tree, probed once per data set (zooming never re-probes).
  const fills = useMemo(
    () => Array.from(new Set([...byId.values()].filter((a) => a !== tree).map((a) => a.fill))),
    [byId, tree],
  );
  const ink = useContrastInk(rootRef, fills);
  const act = active ? (byId.get(active) ?? null) : null;
  const actDrawn = act ? drawn.find((d) => d.arc === act) : undefined;

  /* ---------- Painting: the zoom and the entrance write each arc's d directly ---------- */

  const paint = useRef<() => void>(() => undefined);
  // The d each arc was last given: an arc whose shape didn't change (out of view, or settled) isn't written again.
  const written = useRef(new WeakMap<Element, string>());
  useSyncRef(paint, () => {
    const layer = arcLayer.current;
    if (!layer) return;
    const last = written.current;
    for (const el of Array.from(layer.children) as SVGPathElement[]) {
      const arc = byId.get(el.dataset.id ?? "");
      const geo = arc ? arcGeometry(arc, viewRef.current, intro.current, geometry) : null;
      const d = geo ? ringSector(cx, cy, geo.r0, geo.r1, geo.a0, geo.a1, GAP + ROUND * 2) : "";
      if (last.get(el) === d) continue;
      last.set(el, d);
      el.setAttribute("d", d);
    }
    // The reading's copies of the arcs on the active path follow them.
    for (const el of Array.from(litLayer.current?.children ?? []) as SVGPathElement[]) {
      const base = layer.querySelector(`:scope > [data-id="${CSS.escape(el.dataset.id ?? "")}"]`);
      el.setAttribute("d", (base && last.get(base)) ?? "");
    }
  });

  // Zoom: one tween from the view on screen to the focus.
  const hasWidth = width > 0;
  const { v0, v1, vd, vr } = target;
  useEffect(() => {
    const to = { v0, v1, vd, vr };
    const from = viewRef.current;
    if (sameView(from, to)) return;
    if (reduced || !hasWidth) {
      viewRef.current = to;
      paint.current();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- after the imperative paint (instant with reduced motion or before the chart has a width) a render is requested so labels follow the settled view
      setSettledView(to);
      return;
    }
    const controls = animate(0, 1, {
      duration: duration.slower,
      ease: "linear",
      onUpdate: (k) => {
        const t = enterCurve(k);
        viewRef.current = {
          v0: mix(from.v0, to.v0, t),
          v1: mix(from.v1, to.v1, t),
          vd: mix(from.vd, to.vd, t),
          vr: mix(from.vr, to.vr, t),
        };
        paint.current();
      },
      onComplete: () => {
        viewRef.current = to;
        setSettledView(to);
      },
    });
    return () => controls.stop();
  }, [v0, v1, vd, vr, reduced, hasWidth, paint, viewRef]);

  // Entrance: the rings sweep in once the chart is first seen.
  useEffect(() => {
    if (!play || intro.current >= 1 || !hasWidth) return;
    if (reduced) {
      intro.current = 1;
      paint.current();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- after the imperative paint (instant with reduced motion) a render is requested so the labels appear
      setIntroDone(true);
      return;
    }
    const start = intro.current;
    const controls = animate(start, 1, {
      duration: 1.2 * (1 - start),
      ease: [...ease.out],
      onUpdate: (v) => {
        intro.current = v;
        paint.current();
      },
      onComplete: () => {
        intro.current = 1;
        setIntroDone(true);
      },
    });
    return () => controls.stop();
  }, [play, reduced, hasWidth, intro, paint]);

  /* ---------- Navigation ---------- */

  /** Visible arcs at a depth, clockwise. */
  const ringArcs = (depth: number) => {
    const out: Arc[] = [];
    const walk = (a: Arc) => {
      if (a.depth === depth) {
        if (a.x1 > focus.x0 && a.x0 < focus.x1 && a.value > 0) out.push(a);
        return;
      }
      a.children.forEach(walk);
    };
    walk(focus);
    return out;
  };

  function move(id: string | null, from: "keyboard" | "pointer") {
    setSource(from);
    setAnnouncement("");
    setActive(id);
  }

  function setPath(next: Arc, focusAfter: string | null = null) {
    const labelsPath = pathOf(next).map((a) => a.label);
    // A zoom re-renders the whole chart: as a transition, React renders it in small slices, so
    // the click never blocks the main thread (the zoom tween starts right after).
    startTransition(() => {
      if (pathProp === undefined) setInnerPath(labelsPath);
      onPathChange?.(labelsPath);
      setActive(focusAfter);
    });
    setAnnouncement(labels.zoomedTo(next === tree ? labels.root : next.label, next.children.length));
  }

  function activate(arc: Arc) {
    if (canDrill && arc.children.length > 0 && arc !== focus) setPath(arc);
    else onNodeClick?.({ label: arc.label, value: arc.value, path: pathOf(arc).map((a) => a.label) });
  }

  function zoomOut(keepOn: Arc | null) {
    if (!canDrill || focus === tree) return false;
    setPath(focus.parent ?? tree, keepOn?.id ?? null);
    return true;
  }

  function onKeyDown(event: KeyboardEvent) {
    const firstRing = ringArcs(focus.depth + 1);
    let next: Arc | null | undefined;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowLeft": {
        if (!act) next = firstRing[0];
        else {
          const ring = ringArcs(act.depth);
          const i = ring.indexOf(act);
          const step = event.key === "ArrowRight" ? 1 : -1;
          next = ring[(i + step + ring.length) % Math.max(1, ring.length)] ?? act;
        }
        break;
      }
      case "ArrowDown":
        next = !act
          ? firstRing[0]
          : act.depth - focus.depth < rings
            ? (act.children.find((c) => c.value > 0) ?? act)
            : act;
        break;
      case "ArrowUp":
        next = !act ? firstRing[0] : act.parent && act.parent.depth > focus.depth ? act.parent : act;
        break;
      case "Home":
        next = act ? ringArcs(act.depth)[0] : firstRing[0];
        break;
      case "End": {
        const ring = act ? ringArcs(act.depth) : firstRing;
        next = ring[ring.length - 1];
        break;
      }
      case "Enter":
      case " ":
        if (!act) return;
        event.preventDefault();
        activate(act);
        return;
      case "Escape":
      case "Backspace":
        if (zoomOut(focus)) {
          event.preventDefault();
          return;
        }
        if (event.key === "Escape" && act) {
          event.preventDefault();
          move(null, "keyboard");
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    move(next?.id ?? null, "keyboard");
  }

  function onArcPointerDown(arc: Arc, event: PointerEvent) {
    tapRef.current = { id: arc.id, wasActive: active === arc.id, touch: event.pointerType !== "mouse" };
    if (event.pointerType !== "mouse") move(arc.id, "pointer");
  }

  function onArcClick(arc: Arc) {
    const t = tapRef.current;
    if (t.touch && t.id === arc.id && !t.wasActive) return; // first tap reads, a second one activates
    activate(arc);
  }

  // Arcs: rendered once per zoom. A reading dims their layer as a whole and draws the active
  // path's copies on top (below), so hovering never re-renders or restyles them; handlers read
  // the latest closures from a ref.
  const arcHandlers = useRef({
    enter: (_arc: Arc): void => undefined,
    down: (_arc: Arc, _e: PointerEvent): void => undefined,
    click: (_arc: Arc): void => undefined,
  });
  useSyncRef(arcHandlers, { enter: (arc) => move(arc.id, "pointer"), down: onArcPointerDown, click: onArcClick });
  const clickable = !!onNodeClick;
  const arcsLayer = useMemo(
    () => (
      <g
        ref={arcLayer}
        // A reading dims the whole layer at once (one opacity, never every arc) and draws the active path on top.
        className="forced-color-adjust-none data-[dim]:opacity-35 motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)"
        strokeLinejoin="round"
      >
        {shownArcs.map((arc) => (
          <path
            key={arc.id}
            data-id={arc.id}
            fillRule="evenodd"
            strokeWidth={ROUND * 2}
            style={{ fill: arc.fill, stroke: arc.fill }}
            className={cn(
              "forced-colors:[stroke:CanvasText]",
              arc.children.length > 0 && canDrill ? "cursor-zoom-in" : clickable && "cursor-pointer",
            )}
            onPointerEnter={(e) => e.pointerType === "mouse" && arcHandlers.current.enter(arc)}
            onPointerDown={(e) => arcHandlers.current.down(arc, e)}
            onClick={() => arcHandlers.current.click(arc)}
          />
        ))}
      </g>
    ),
    [shownArcs, canDrill, clickable, arcHandlers, arcLayer],
  );
  // New arcs (a zoom, new data, a resize) get their shape for the current moment; a hover renders no new arcs.
  const paintedFor = useRef<unknown>(null);
  useLayoutEffect(() => {
    if (paintedFor.current === arcsLayer) return;
    paintedFor.current = arcsLayer;
    paint.current();
  });

  // The reading: the arc layer dims as a whole (one attribute) and the active path's copies (drawn
  // below the arcs, by React) take the shapes the painter gave their arcs.
  useLayoutEffect(() => {
    const layer = arcLayer.current;
    if (!layer) return;
    if (act) layer.setAttribute("data-dim", "");
    else layer.removeAttribute("data-dim");
    const els = marksById<SVGPathElement>(layer);
    for (const el of Array.from(litLayer.current?.children ?? []) as SVGPathElement[]) {
      const base = els.get(el.dataset.id ?? "");
      el.setAttribute("d", (base && written.current.get(base)) ?? "");
    }
  }, [act, arcsLayer]);
  const litArcs = act ? pathOf(act).filter((a) => a.depth > focus.depth) : [];

  // The label layer depends on the settled view only: hovering never re-fits a label.
  const showLabels = !zooming && introDone;
  const labelLayer = useMemo(
    () =>
      showLabels ? (
        <g
          key={`labels-${focus.id}`}
          className="pointer-events-none motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-base) motion-ok:starting:opacity-0"
        >
          {drawn.map((dr) => (
            <ArcLabel key={dr.arc.id} drawn={dr} cx={cx} cy={cy} ink={ink(dr.arc.fill)} />
          ))}
        </g>
      ) : null,
    [showLabels, drawn, ink, focus.id, cx, cy],
  );

  // Zooming resets any reading that left the view (state adjusted while rendering, no effect round-trip).
  if (act && !(act.x1 > focus.x0 && act.x0 < focus.x1 && act.depth > focus.depth)) setActive(null);

  if (tree.value <= 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const total = tree.value;
  const instructions =
    resolveInstructions(labels.instructions) + (canDrill ? ` ${resolveInstructions(labels.drillInstructions)}` : "");
  const shown = act ?? focus;
  const shownParent = act ? (act.parent && act.parent !== tree ? act.parent : null) : null;
  const caption = act ? act.label : focus === tree ? labels.root : focus.label;
  const share = act
    ? shownParent
      ? `${pct(act.value / shownParent.value)} ${labels.ofParent(shownParent.label)}`
      : `${pct(act.value / total)} ${labels.ofTotal}`
    : focus !== tree
      ? `${pct(focus.value / total)} ${labels.ofTotal}`
      : "";

  // Tooltip beside the active arc (wide charts; narrow ones read in the centre).
  let tooltip: ReactNode = null;
  let readout = "";
  if (act) {
    const parent = act.parent;
    const rows = [{ label: "", value: format(act.value), color: act.fill, kind: "rect" as const }];
    if (parent && parent !== tree)
      rows.push({
        label: labels.ofParent(parent.label),
        value: pct(act.value / parent.value),
        color: "transparent",
        kind: "rect",
      });
    rows.push({ label: labels.ofTotal, value: pct(act.value / total), color: "transparent", kind: "rect" });
    if (actDrawn && width >= TOOLTIP_DOCK_BELOW && !zooming) {
      const mid = (actDrawn.a0 + actDrawn.a1) / 2;
      const [x, y] = polar(cx, cy, (actDrawn.r0 + actDrawn.r1) / 2, mid);
      tooltip = (
        <FlowTip
          title={act.label}
          rows={rows}
          anchor={{ x: x - 6, y: y - 6, w: 12, h: 12 }}
          bounds={{ w: width, h: boxH }}
        />
      );
    }
    readout = `${pathOf(act)
      .map((a) => a.label)
      .join(", ")}: ${rows.map((r) => `${r.value} ${r.label}`.trim()).join(", ")}`;
  }

  const centreR = hole - GAP;
  const big = centreR >= 56;
  // The centre number takes the biggest size step at which its final text fits the disc.
  const centreW = centreR * 1.64 - 6;
  const shownText = format(shown.value);
  const valueClass =
    VALUE_STEPS.find(([px]) => (big || px <= 16) && measureText(shownText, px, 600) * 0.98 <= centreW)?.[1] ??
    "text-xs";

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col gap-3", className)}>
      {canDrill && (
        <nav aria-label={`${labels.breadcrumb}: ${ariaLabel}`} className="-my-1 min-w-0">
          <ol className="flex min-w-0 flex-wrap items-center gap-0.5 text-sm">
            {[tree, ...crumbs].map((arc, i, all) => {
              const current = i === all.length - 1;
              const text = arc === tree ? labels.root : arc.label;
              const onCrumb = (event: MouseEvent) => {
                setPath(arc, event.detail === 0 ? (all[i + 1]?.id ?? null) : null);
                requestAnimationFrame(() => groupRef.current?.focus());
              };
              return (
                <li key={arc.id} className="flex min-w-0 items-center gap-0.5">
                  {i > 0 && <Chevron />}
                  {current ? (
                    <span aria-current="location" className="truncate px-2 py-1 font-semibold text-sheen-fg">
                      {text}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={onCrumb}
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
        onBlur={() => setActive(null)}
        className={cn("relative w-full rounded-sheen-sm", chartFocusClass)}
        style={{ height: boxH }}
      >
        {width > 0 && (
          <svg
            aria-hidden
            // Drawn left to right in every writing direction: text anchors stay physical under dir="rtl".
            direction="ltr"
            width={width}
            height={boxH}
            className="block"
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) setActive(null);
            }}
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
          >
            {/* Centre: a quiet disc; when zoomed in it takes the group's tint and zooms out on click. */}
            <circle
              cx={cx}
              cy={cy}
              r={Math.max(0, centreR)}
              className={cn(
                "forced-colors:stroke-[CanvasText]",
                focus !== tree && canDrill ? "cursor-zoom-out" : "pointer-events-none",
              )}
              style={{
                fill: focus !== tree ? depthFill(focus.slot, 6) : "transparent",
                stroke: "var(--sheen-chart-grid)",
              }}
              onClick={() => zoomOut(null)}
            >
              {focus !== tree && <title>{labels.zoomOut}</title>}
            </circle>

            {/* Arcs: their shapes are written by the painter (zoom and entrance), the rest by React. */}
            {arcsLayer}

            {/* The active path at full strength over the dimmed arcs (copies of a few arcs; the painter keeps their shapes). */}
            <g ref={litLayer} className="pointer-events-none forced-color-adjust-none" strokeLinejoin="round">
              {litArcs.map((a) => (
                <path
                  key={a.id}
                  data-id={a.id}
                  fillRule="evenodd"
                  strokeWidth={ROUND * 2}
                  style={{
                    fill: a.fill,
                    stroke: a.fill,
                    filter: a === act ? markGlow(slotColor(a.slot), 7) : undefined,
                  }}
                  className="forced-colors:[stroke:CanvasText]"
                />
              ))}
            </g>

            {/* The active arc lifts with a ring in the text colour. */}
            {actDrawn && !zooming && (
              <path
                d={ringSector(cx, cy, actDrawn.r0, actDrawn.r1, actDrawn.a0, actDrawn.a1, GAP - 1)}
                fill="none"
                strokeWidth={2}
                strokeLinejoin="round"
                className="pointer-events-none stroke-sheen-fg forced-colors:stroke-[Highlight]"
              />
            )}

            {/* Labels: only once the view has settled, only where they fit; they fade in (CSS). */}
            {labelLayer}
          </svg>
        )}

        {/* The centre readout: the active arc, else the level shown. The number rolls. */}
        {width > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute flex flex-col items-center justify-center text-center"
            style={{
              left: cx - centreR * 0.82,
              top: cy - centreR * 0.82,
              width: centreR * 1.64,
              height: centreR * 1.64,
            }}
          >
            <span className={cn("w-full truncate text-sheen-fg-muted", big ? "text-xs" : "text-2xs")}>{caption}</span>
            <RollingValue
              value={play ? shown.value : 0}
              format={format}
              reduced={reduced}
              className={cn("max-w-full truncate font-semibold tracking-tight text-sheen-fg tabular-nums", valueClass)}
            />
            {share && (
              <span className={cn("w-full truncate text-sheen-fg-muted tabular-nums", big ? "text-2xs" : "hidden")}>
                {share}
              </span>
            )}
          </div>
        )}
        {tooltip}
      </ChartFigure>
      <ChartAnnouncer text={[announcement, source === "keyboard" ? readout : ""].filter(Boolean).join(". ")} />
    </div>
  );
}
