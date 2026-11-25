"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useShortcutPlatform } from "../kbd/kbd";
import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer } from "./chart-parts";
import { useDockedReadout, useInputSource } from "./chart-fit";
import { chartFocusClass, slotColor, useElementWidth, resolveInstructions, itemAt } from "./chart-utils";
import { ChartDockHint, ChartTip, defaultCompact, SequentialLegend, useEntrance } from "./heatmap";
import { ChartFigure } from "./chart-figure";
import {
  WORLD_FRAME_WIDTH,
  WORLD_FRAME_HEIGHT,
  hash,
  SPHERE_PATH,
  GRATICULE_PATH,
  useWorldShapes,
} from "./geo-map/projection";
import { useWorldMapKeyboard, useWorldMapPointer } from "./geo-map/interaction";
import { useWorldMapView } from "./geo-map/view";
import { MAP_RAMP_FLOOR, useWorldMapData } from "./geo-map/data";
import { defaultWorldMapLabels, type WorldMapDatum, type WorldMapProps } from "./geo-map/types";
import {
  LAND,
  divergingPosition,
  HatchPattern,
  NoDataKey,
  LegendRow,
  DivergingLegend,
  BubbleLegend,
  DOCK_BAND,
  isolate,
  cssEase,
  DockedReadout,
  Bubble,
  CountryLayer,
  useBandsEntrance,
} from "./geo-map/parts";

export {
  WORLD_FRAME_WIDTH,
  WORLD_FRAME_HEIGHT,
  projectWorld,
  loadWorld110m,
  worldCountryName,
} from "./geo-map/projection";
export {
  type WorldMapDatum,
  type WorldMapPoint,
  type WorldMapSelection,
  type WorldMapLabels,
  defaultWorldMapLabels,
  type WorldMapProps,
} from "./geo-map/types";
export { divergingColor } from "./geo-map/parts";
export { type WorldMapTableProps, WorldMapTable } from "./geo-map/table";

/* ======================================================================
 * WorldMap
 * ====================================================================== */

const NO_DATA: WorldMapDatum[] = [];

/**
 * World map: a choropleth (each country coloured on a sequential or diverging scale) or a bubble
 * map (circles sized by value at each country's centre, or at any longitude / latitude).
 *
 * - Equal Earth projection: areas are true to scale, so big countries don't overstate their value.
 * - Country names come from Intl in `locale`; values accept any ISO 3166-1 code.
 * - Hover or tap a country (or bubble) for a glass tooltip; it pins on touch. Focus the map and
 *   use the arrow keys to move between neighbouring countries, Page Up / Page Down by rank,
 *   or type a name.
 * - Zoom: buttons, ⌘/Ctrl + scroll or trackpad pinch, two-finger pinch on touch, double-click,
 *   + / − keys; drag to pan once zoomed. Borders stay hairline and bubbles keep their size.
 * - The land rises in from west to east the first time the map scrolls into view, bubbles grow
 *   after it; new data cross-fades (on the compositor). All instant with reduced motion.
 * - The outlines (Natural Earth 1:110m, public domain) load on demand in their own chunk.
 *
 * Keyboard: Tab focuses the map; the arrow keys move to the neighbouring country, Page Up and Page Down step through countries by value, Home and End jump to the highest and lowest, typing a name jumps to it, + and - zoom and 0 resets, Escape clears. With `onSelect`, Enter selects the country being read. The zoom buttons are tab stops.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the country and its value, and the legend names the colour scale. The choropleth has no `patterns` prop on purpose: it is one ordered ramp that differs in lightness, not a set of unordered categories, so it stays readable in greyscale and with colour blindness, countries without data are already hatched, and every value is in the tooltip, the keyboard readout and the table. `WorldMapTable` is the table view (a ranked list).
 * Glass and motion: the tooltip is the shared glass surface; the map itself has no backdrop blur. Reduced motion draws, zooms and cross-fades instantly.
 *
 * @example
 * ```tsx
 * import { WorldMap } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <WorldMap
 *       data={[
 *         { id: "USA", value: 4200 },
 *         { id: "DEU", value: 1800 },
 *         { id: "IND", value: 2600 },
 *       ]}
 *       valueLabel="Users"
 *       aria-label="Users by country"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/world-map
 */
export function WorldMap({
  data: dataProp = NO_DATA,
  points: pointsProp,
  mode = "choropleth",
  scale = "sequential",
  midpoint = 0,
  scaleType = "linear",
  color = 1,
  divergingColors = [2, 7],
  domain,
  steps = 0,
  format: formatProp,
  locale = "en",
  valueLabel,
  legend = true,
  zoomable = true,
  maxZoom = 8,
  shapes: shapesProp,
  onSelect,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<WorldMapProps>) {
  const labels = { ...defaultWorldMapLabels, ...labelOverrides };
  // New data re-colours the map in a low-priority render, after everything else the same update
  // changes (a headline number, a switch): the input that caused it never waits for the map.
  const platform = useShortcutPlatform();
  const data = useDeferredValue(dataProp);
  const points = useDeferredValue(pointsProp);
  const format = formatProp ?? defaultCompact(locale);
  const reduced = useSheenReducedMotion();
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const mapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<SVGGElement>(null);
  const zoom1Ref = useRef<SVGGElement>(null);
  const zoom2Ref = useRef<SVGGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const { shapes, failed } = useWorldShapes(shapesProp);
  const ready = !!shapes && width > 0;
  const play = useEntrance(rootRef, reduced) && ready;
  const docked = useDockedReadout(width);
  const { fromKeyboard, fromPointer, announce } = useInputSource();

  const mapH = width > 0 ? Math.round((width * WORLD_FRAME_HEIGHT) / WORLD_FRAME_WIDTH) : 0;
  const dock = docked ? DOCK_BAND : 0;
  const unit = width > 0 ? WORLD_FRAME_WIDTH / width : 1; // frame units per screen px

  /* ---------- Data ---------- */

  const { byShape, hasData, lo, hi, sorted, logLo, positionOf, fillOf, maxR, maxValue, items, ranked, rankOf } =
    useWorldMapData({
      shapes,
      data,
      points,
      mode,
      scale,
      scaleType,
      midpoint,
      color,
      divergingColors,
      domain,
      steps,
      locale,
      width,
    });

  /* ---------- View (zoom / pan) ---------- */

  const mapView = useWorldMapView({ unit, ready, mode, maxZoom, reduced, zoomRef, zoom1Ref, zoom2Ref });
  const { view, moving, hatchRef, bubblesRef, pointer, setPointer, zoomAt, resetView } = mapView;

  /* ---------- Active item ---------- */

  const [active, setActive] = useState<number | null>(null);
  const act = active !== null && active < items.length ? active : null;
  const activeItem = act === null ? null : (items[act] ?? null);

  const select = (i: number) => {
    const it = items[i];
    if (!it || !onSelect) return;
    onSelect({ id: it.key, name: it.name, value: it.value, kind: it.shape === null ? "point" : "country" });
  };

  /* ---------- Pointer and keyboard ---------- */

  const { gesture, lastPointerType, toFrame, onPointerDown, onPointerMove, endGesture, wheelHint } = useWorldMapPointer(
    {
      svgRef,
      mapRef,
      view: mapView,
      items,
      mode,
      unit,
      zoomable,
      maxZoom,
      ready,
      fromPointer,
      setActive,
      select,
    },
  );
  const { onKeyDown, zoomButton } = useWorldMapKeyboard({
    view: mapView,
    items,
    ranked,
    act,
    activeItem,
    zoomable,
    locale,
    fromKeyboard,
    setActive,
    select,
    onSelect,
  });

  /* ---------- Layers ---------- */

  // The colour of every country, and a key that changes when any of them does.
  const fills = useMemo(
    () => (shapes ? shapes.map((_, i) => (mode === "bubble" ? LAND : fillOf(byShape.get(i)?.value ?? null))) : null),
    [shapes, byShape, fillOf, mode],
  );
  const version = useMemo(() => (fills ? hash(fills.map((f) => f ?? "-").join(",")) : ""), [fills]);

  // Two country layers stay mounted. New colours go into the hidden one, which then becomes the
  // front: it fades in over the old (when it's on top), or the old one fades out above it. So a
  // data change creates no outlines, and switching back to the previous data writes nothing at all.
  type Slot = { version: string; fills: readonly (string | null)[] } | null;
  const [layers, setLayers] = useState<{ slots: [Slot, Slot]; front: 0 | 1 }>({ slots: [null, null], front: 0 });
  if (fills && layers.slots[layers.front]?.version !== version) {
    const back = layers.front === 0 ? 1 : 0;
    if (!layers.slots[0]) setLayers({ slots: [{ version, fills }, null], front: 0 });
    else if (layers.slots[back]?.version === version) setLayers({ slots: layers.slots, front: back });
    else
      setLayers({
        slots: back === 0 ? [{ version, fills }, layers.slots[1]] : [layers.slots[0], { version, fills }],
        front: back,
      });
  }
  const front = layers.front;

  // The hidden layer is drawn in small chunks while the page is idle, after the entrance: by the
  // first data change its outlines already exist. (A change before that draws the rest at once.)
  const total = shapes?.length ?? 0;
  const [backCount, setBackCount] = useState(0);
  const needBack = !!layers.slots[1];
  useEffect(() => {
    if (!play || !total || backCount >= total || needBack) return;
    const idle = typeof requestIdleCallback === "function";
    const step = () => setBackCount((n) => Math.min(total, n + 30));
    const id = idle
      ? requestIdleCallback(step, { timeout: 2000 })
      : window.setTimeout(step, backCount === 0 ? 1500 : 50);
    return () => (idle ? cancelIdleCallback(id) : window.clearTimeout(id));
  }, [play, total, backCount, needBack]);
  const layerCount = (i: 0 | 1) => (i === 0 || needBack ? total : backCount);

  // The cross-fade: one opacity animation on the <svg> that holds layer 1 (on top), so it runs on
  // the compositor. It holds its end value until the layer it faded out is hidden (same commit),
  // then lets go, so the layer never flashes back nor stays a compositor layer for nothing.
  const topLayerRef = useRef<SVGSVGElement>(null);
  const [fading, setFading] = useState(false);
  const shownFront = useRef<0 | 1>(0);
  const fadeAnim = useRef<Animation | null>(null);
  useLayoutEffect(() => {
    if (fading) return;
    fadeAnim.current?.cancel();
    fadeAnim.current = null;
  }, [fading]);
  useLayoutEffect(() => {
    if (shownFront.current === front) return;
    shownFront.current = front;
    const top = topLayerRef.current;
    if (reduced || !top || typeof top.animate !== "function") return;
    // Front on top: it fades in over the old. Front underneath: the old one, on top, fades out.
    const anim = top.animate(front === 1 ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], {
      duration: duration.slow * 1000,
      easing: cssEase(ease.out),
      fill: "forwards",
    });
    fadeAnim.current = anim;
    setFading(true);
    anim.finished.then(
      () => setFading(false),
      () => undefined, // replaced by the next cross-fade
    );
    return () => {
      anim.cancel();
      setFading(false);
    };
  }, [front, reduced]);

  useBandsEntrance(layerRef, play, reduced);

  /* ---------- Render ---------- */

  const glow = `drop-shadow(0 0 6px light-dark(transparent, color-mix(in oklab, ${slotColor(color)} 70%, transparent))) drop-shadow(0 1px 2px light-dark(var(--sheen-shadow-far), transparent))`;
  const k = view.k;

  let tooltip: ReactNode = null;
  let announcement = "";
  if (activeItem && act !== null && !moving && width > 0) {
    const value = activeItem.value === null ? labels.noData : format(activeItem.value);
    const rank = rankOf.get(act);
    const rankText = rank !== undefined && ranked.length > 1 ? labels.rank(rank, ranked.length) : "";
    const measure = activeItem.value === null ? "" : (valueLabel ?? "");
    const fill =
      activeItem.value === null
        ? null
        : activeItem.shape !== null && mode !== "bubble"
          ? fillOf(activeItem.value)
          : slotColor(color);
    announcement = `${activeItem.name}: ${value}${rankText ? `, ${rankText}` : ""}`;
    if (docked) {
      tooltip = (
        <DockedReadout
          title={activeItem.name}
          value={value}
          color={fill}
          details={[measure, rankText].filter(Boolean)}
        />
      );
    } else {
      const rows = [
        { label: isolate(measure), value: isolate(value), color: fill ?? "transparent", kind: "rect" as const },
      ];
      if (rankText) rows.push({ label: isolate(rankText), value: "", color: "transparent", kind: "rect" });
      let anchor: { x: number; y: number; w: number; h: number };
      if (pointer) anchor = { x: pointer.x - 1, y: pointer.y - 1, w: 2, h: 2 };
      else {
        const s = width / WORLD_FRAME_WIDTH;
        const cx = (activeItem.x * k + view.x) * s;
        const cy = (activeItem.y * k + view.y) * s;
        const half = Math.max(6, activeItem.r);
        anchor = { x: cx - half, y: cy - half, w: half * 2, h: half * 2 };
      }
      tooltip = (
        <ChartTip title={isolate(activeItem.name)} rows={rows} anchor={anchor} bounds={{ w: width, h: mapH }} />
      );
    }
  }

  // On narrow maps the zoom buttons (44px on touch) would cover the map: they move under it, in a row.
  const compact = width > 0 && width < 480;

  const legendEl = (() => {
    if (!legend || !hasData) return null;
    if (mode === "bubble")
      return (
        <LegendRow caption={valueLabel}>
          <BubbleLegend max={maxValue} maxR={maxR} color={color} format={format} />
        </LegendRow>
      );
    const v = activeItem?.value ?? null;
    if (scale === "diverging")
      return (
        <LegendRow caption={valueLabel}>
          <DivergingLegend
            lo={lo}
            mid={midpoint}
            hi={hi}
            colors={divergingColors}
            format={format}
            width={compact ? 120 : 160}
            marker={v === null ? null : divergingPosition(v, lo, midpoint, hi, steps)}
          />
        </LegendRow>
      );
    return (
      <LegendRow caption={scaleType === "log" && valueLabel ? labels.logScale(valueLabel) : valueLabel}>
        <SequentialLegend
          className="flex-nowrap"
          min={scaleType === "log" ? logLo : scaleType === "quantile" ? (sorted[0] ?? lo) : lo}
          max={scaleType === "quantile" ? (sorted[sorted.length - 1] ?? hi) : hi}
          color={color}
          steps={steps}
          floor={MAP_RAMP_FLOOR}
          format={format}
          marker={v === null ? null : positionOf(v)}
        />
      </LegendRow>
    );
  })();
  const ctrlBtn =
    "relative grid size-8 place-items-center text-sheen-fg transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover " +
    "disabled:cursor-default disabled:text-sheen-fg-subtle disabled:hover:bg-transparent any-pointer-coarse:size-11 " +
    "focus-visible:z-1 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus " +
    "motion-ok:active:scale-95 motion-ok:transition-[background-color,transform]";

  const sep = <span aria-hidden className={compact ? "my-1.5 w-px bg-sheen-border" : "mx-1.5 h-px bg-sheen-border"} />;
  const zoomControls = (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- focus-tracking handlers (onBlur/onFocus) on the zoom button group clear the readout when focus leaves; the group itself is not a widget
    <div
      className={cn(
        // A solid surface with the glass rim and shadow, but no backdrop filter: a page of maps
        // must not spend the glass budget on their zoom buttons.
        "flex overflow-hidden rounded-sheen-md border border-(--sheen-glass-border) text-sheen-fg",
        "bg-[color-mix(in_oklab,var(--sheen-chart-surface)_94%,transparent)] [background-image:var(--sheen-glass-specular)] shadow-(--sheen-glass-1-shadow)",
        compact ? "flex-row" : "absolute end-2 flex-col",
      )}
      style={compact ? undefined : { top: dock + 8 }}
      role="group"
      aria-label={labels.zoomControls(ariaLabel)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget)) {
          setActive(null);
          setPointer(null);
        }
      }}
    >
      <button
        type="button"
        aria-label={labels.zoomIn}
        className={ctrlBtn}
        disabled={k >= maxZoom - 1e-6}
        onClick={() => zoomButton(2)}
      >
        <svg
          aria-hidden
          width={14}
          height={14}
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
        >
          <path d="M7 2.5v9M2.5 7h9" />
        </svg>
      </button>
      {sep}
      <button
        type="button"
        aria-label={labels.zoomOut}
        className={ctrlBtn}
        disabled={k <= 1 + 1e-6}
        onClick={() => zoomButton(0.5)}
      >
        <svg
          aria-hidden
          width={14}
          height={14}
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
        >
          <path d="M2.5 7h9" />
        </svg>
      </button>
      {sep}
      <button
        type="button"
        aria-label={labels.resetZoom}
        className={ctrlBtn}
        disabled={k <= 1 + 1e-6}
        onClick={resetView}
      >
        <svg
          aria-hidden
          width={14}
          height={14}
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 5V2h3M12 9v3H9M2 9v3h3M12 5V2H9" />
        </svg>
      </button>
    </div>
  );
  const showNoDataKey = legend && mode !== "bubble" && hasData && byShape.size < (shapes?.length ?? 0);

  return (
    <div
      data-slot="world-map"
      {...rest}
      ref={rootMerged}
      className={cn("relative flex w-full min-w-0 flex-col gap-3", className)}
      style={{ "--geo-glow": glow } as CSSProperties}
    >
      <div ref={measureRef} className="relative w-full" style={{ paddingTop: dock }}>
        {width > 0 && (
          <>
            <ChartFigure
              as="div"
              ref={mapRef}
              roleDescription={labels.roleDescription}
              label={ariaLabel}
              description={
                mode === "bubble"
                  ? resolveInstructions(labels.instructionsBubble)
                  : resolveInstructions(labels.instructions)
              }
              tabIndex={0}
              onKeyDown={onKeyDown}
              onBlur={(e) => {
                // Focus moving to the zoom buttons keeps the place being read (they zoom around it).
                if (!rootRef.current?.contains(e.relatedTarget)) {
                  setActive(null);
                  setPointer(null);
                }
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endGesture}
              onPointerCancel={endGesture}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse" && !gesture.current) {
                  setActive(null);
                  setPointer(null);
                }
              }}
              onDoubleClick={(e) => {
                // A touch double tap already zoomed in endGesture: skip the dblclick the browser adds.
                if (!zoomable || lastPointerType.current === "touch") return;
                const p = toFrame(e.clientX, e.clientY);
                if (p) zoomAt(e.shiftKey ? 0.5 : 2, p.vx, p.vy);
              }}
              className={cn(
                "relative overflow-hidden rounded-sheen-md select-none",
                chartFocusClass,
                k > 1
                  ? "cursor-grab active:cursor-grabbing"
                  : onSelect && mode !== "bubble"
                    ? "cursor-pointer"
                    : undefined,
              )}
              style={{ height: mapH, touchAction: k > 1 ? "none" : "pan-y" }}
            >
              {/* Three stacked SVGs share one frame and one view transform:
                  1. the sea, graticule and country layer 0;
                  2. country layer 1, whose cross-fade is an opacity animation on the <svg> itself,
                     so it runs on the compositor (no repaint per frame);
                  3. marks: the active country's outline and the bubbles. */}
              <svg
                ref={svgRef}
                aria-hidden
                width={width}
                height={mapH}
                viewBox={`0 0 ${WORLD_FRAME_WIDTH} ${WORLD_FRAME_HEIGHT}`}
                className="block"
              >
                <defs>
                  <HatchPattern ref={hatchRef} id={`${uid}-nodata`} scale={unit * 0.8} />
                  <linearGradient id={`${uid}-sea`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" style={{ stopColor: `color-mix(in oklab, ${slotColor(7)} 9%, transparent)` }} />
                    <stop offset="1" style={{ stopColor: `color-mix(in oklab, ${slotColor(1)} 5%, transparent)` }} />
                  </linearGradient>
                </defs>
                <g ref={zoomRef}>
                  <path
                    d={SPHERE_PATH}
                    fill={`url(#${uid}-sea)`}
                    stroke="var(--sheen-chart-grid)"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d={GRATICULE_PATH}
                    fill="none"
                    stroke="var(--sheen-chart-grid)"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                  <g
                    ref={layerRef}
                    opacity={play ? 1 : 0}
                    visibility={front === 0 || fading ? undefined : "hidden"}
                    className="forced-color-adjust-none"
                  >
                    {shapes && (
                      <CountryLayer
                        shapes={shapes}
                        fills={layers.slots[0]?.fills ?? null}
                        count={layerCount(0)}
                        hatch={`url(#${uid}-nodata)`}
                        hittable={mode !== "bubble"}
                        entrance
                      />
                    )}
                  </g>
                </g>
              </svg>
              <svg
                ref={topLayerRef}
                aria-hidden
                width={width}
                height={mapH}
                viewBox={`0 0 ${WORLD_FRAME_WIDTH} ${WORLD_FRAME_HEIGHT}`}
                visibility={front === 1 || fading ? undefined : "hidden"}
                // Hit-testable only while it is the front layer (the one under it is hidden then).
                className={cn("absolute inset-0 block", front === 1 && !fading ? undefined : "pointer-events-none")}
              >
                <g ref={zoom1Ref} className="forced-color-adjust-none">
                  {shapes && (
                    <CountryLayer
                      shapes={shapes}
                      fills={layers.slots[1]?.fills ?? null}
                      count={layerCount(1)}
                      hatch={`url(#${uid}-nodata)`}
                      hittable={mode !== "bubble"}
                      entrance={false}
                    />
                  )}
                </g>
              </svg>
              <svg
                aria-hidden
                width={width}
                height={mapH}
                viewBox={`0 0 ${WORLD_FRAME_WIDTH} ${WORLD_FRAME_HEIGHT}`}
                className="pointer-events-none absolute inset-0 block"
              >
                <g ref={zoom2Ref}>
                  {/* The active country: a crisp ring that lifts it (a glow in dark mode), never dimming the rest. */}
                  {activeItem && activeItem.shape !== null && mode !== "bubble" && shapes?.[activeItem.shape] && (
                    <path
                      d={itemAt(shapes, activeItem.shape).d}
                      vectorEffect="non-scaling-stroke"
                      strokeWidth={1.75}
                      strokeLinejoin="round"
                      style={{ fill: fillOf(activeItem.value) ?? `url(#${uid}-nodata)`, filter: glow }}
                      className="stroke-sheen-fg forced-colors:stroke-[Highlight]"
                    />
                  )}

                  {mode === "bubble" && (
                    <g ref={bubblesRef} visibility={play ? undefined : "hidden"} className="forced-color-adjust-none">
                      {items.map((it, i) => (
                        <Bubble
                          key={it.key}
                          cx={it.x}
                          cy={it.y}
                          r={it.r}
                          unit={unit}
                          color={color}
                          active={i === act}
                          delay={0.35 + Math.min(0.6, i * 0.035)}
                          play={play}
                          reduced={reduced}
                        />
                      ))}
                    </g>
                  )}
                </g>
              </svg>

              {/* Not ready yet, failed, or nothing to show. */}
              {(!shapes || !hasData) && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  {failed ? (
                    <p className="glass-3 rounded-sheen-md px-3 py-1.5 text-sm text-sheen-fg-muted">
                      {labels.loadError}
                    </p>
                  ) : shapes && !hasData ? (
                    <p className="glass-3 rounded-sheen-md px-3 py-1.5 text-sm text-sheen-fg-muted">
                      {emptyState ?? labels.noData}
                    </p>
                  ) : null}
                </div>
              )}

              {/* Mounted only while it shows, so an invisible pill never holds a backdrop filter. */}
              <AnimatePresence>
                {zoomable && wheelHint && (
                  <motion.p
                    aria-hidden
                    initial={{ opacity: 0, y: reduced ? 0 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: reduced ? 0 : duration.exit, ease: ease.exit } }}
                    transition={{ duration: reduced ? 0 : duration.base, ease: ease.out }}
                    className="glass-3 pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-sheen-full px-3 py-1.5 text-xs text-sheen-fg"
                  >
                    {labels.zoomHint(platform === "mac")}
                  </motion.p>
                )}
              </AnimatePresence>
            </ChartFigure>

            {zoomable && shapes && !compact && zoomControls}

            {tooltip ??
              (docked && hasData && (
                <ChartDockHint>{mode === "bubble" ? labels.hintBubble : labels.hint}</ChartDockHint>
              ))}
          </>
        )}
        {width === 0 && <div aria-hidden style={{ aspectRatio: `${WORLD_FRAME_WIDTH} / ${WORLD_FRAME_HEIGHT}` }} />}
      </div>

      {(!!legendEl || showNoDataKey || (compact && zoomable && shapes)) && (
        // Maps never mirror, so neither do their scales: low → high reads left to right on every page.
        <div dir="ltr" className="flex min-h-10 flex-wrap items-center justify-end gap-x-5 gap-y-2">
          {compact && zoomable && shapes && <div className="me-auto">{zoomControls}</div>}
          {legendEl}
          {showNoDataKey && <NoDataKey label={labels.noDataKey} />}
        </div>
      )}
      <ChartAnnouncer text={announce(announcement)} />
    </div>
  );
}
