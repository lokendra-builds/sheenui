"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useDeferredValue, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";

import { cn } from "../../lib/cn";
import { useSyncRef } from "../../hooks/use-latest";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import {
  DockHint,
  dockHintHeight,
  dockSpace,
  FittedTooltip,
  useDockedReadout,
  useInputSource,
  type Readout,
} from "./chart-fit";
import {
  chartFocusClass,
  chartKeyHandler,
  clamp,
  dataSignature,
  linear,
  num,
  rowKeys,
  thinLabels,
  useElementWidth,
  useHasMounted,
  ORIGIN_PT,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import { defaultCompact, defaultPercent, useEntrance } from "./heatmap";
import { solidTipsScope, useDeferredDraw } from "./category-bar";
import { ChartFigure } from "./chart-figure";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";

import {
  type Pt,
  type MorphTiming,
  useMorphClock,
  insideOutOrder,
  streamBaseline,
  defaultStreamgraphLabels,
  type StreamgraphProps,
  foldStreamSeries,
  CHAR_W,
  LABEL_CHAR_W,
  enterCurve,
  changeCurve,
  StreamLayer,
  layerColor,
} from "./streamgraph/model";

export {
  type Pt,
  monotoneTangents,
  curveSegments,
  bandArea,
  curvePath,
  SETTLED,
  type MorphTiming,
  useMorphPoints,
  useMorphClock,
  insideOutOrder,
  streamBaseline,
  type StreamgraphLabels,
  defaultStreamgraphLabels,
  type StreamgraphProps,
  foldStreamSeries,
  streamgraphLegend,
} from "./streamgraph/model";
export { type StreamgraphTableProps, StreamgraphTable } from "./streamgraph/parts";
/**
 * Stacked areas flowing around a moving centre line: how a mix of categories swells and fades
 * over time (genres, topics, traffic sources). Shape and share read at a glance; exact values
 * are one hover, tap or arrow key away.
 *
 * - Byron & Wattenberg's "wiggle" baseline and inside-out order keep the layers as flat and
 *   legible as possible; smooth monotone curves never overshoot a value.
 * - Each layer is named inside its thickest stretch when the name fits, on a small tag of the
 *   chart surface so the name reads on any layer colour.
 * - Hover a layer: it glows (dark theme) and the others step back; the crosshair reads every
 *   layer at that point, with its share of the total.
 * - Layers swell out of the centre line, inside out, the first time the chart scrolls into
 *   view; new data morphs them. Reduced motion: drawn in place.
 *
 * Keyboard: Tab focuses the chart; Left and Right move along the x axis, Up and Down walk the layers as they are stacked on screen, Home and End jump to the first and last x value, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce every layer's value at that point with its share of the total, and layer names are text on a chart-surface tag so they read on any colour. `StreamgraphTable` is the table view.
 * Glass and motion: the tooltip is a solid glass-look overlay (no backdrop blur). Reduced motion draws and morphs layers instantly.
 *
 * @example
 * ```tsx
 * import { Streamgraph } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Streamgraph
 *       data={[
 *         { year: "2022", rock: 30, pop: 45, jazz: 12 },
 *         { year: "2023", rock: 25, pop: 52, jazz: 18 },
 *         { year: "2024", rock: 20, pop: 58, jazz: 22 },
 *       ]}
 *       index="year"
 *       series={[
 *         { key: "rock", label: "Rock" },
 *         { key: "pop", label: "Pop" },
 *         { key: "jazz", label: "Jazz" },
 *       ]}
 *       aria-label="Listening share by genre"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/streamgraph
 */
export function Streamgraph({
  data: dataProp,
  index,
  series: seriesProp,
  offset: offsetProp = "wiggle",
  order: orderProp = "insideOut",
  inlineLabels = true,
  height = 300,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  emptyState,
  patterns,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<StreamgraphProps>) {
  const t = { ...defaultStreamgraphLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const id = useId();
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const docked = useDockedReadout(width);
  const [active, setActive] = useState<number | null>(null);
  const [layer, setLayer] = useState<number | null>(null);
  const { fromKeyboard, fromPointer, announce } = useInputSource();
  // New data or a new baseline is laid out in a deferred render (React yields while it rebuilds
  // the layers), so the control that changed it responds at once; then the layers morph.
  const data = useDeferredValue(dataProp);
  const series = useDeferredValue(seriesProp);
  const offset = useDeferredValue(offsetProp);
  const order = useDeferredValue(orderProp);
  // Marks are built once the chart nears the viewport, in a deferred render (see useDeferredDraw):
  // a page load or a ChartCard's Chart tab coming back paints the frame at once, the marks right after.
  const drawn = useDeferredDraw(rootRef);

  const { rows, series: layers } = useMemo(() => foldStreamSeries(data, series, t.other), [data, series, t.other]);
  const hatched = resolvePatterns(patterns, layers.length);
  const count = rows.length;
  const values = useMemo(() => layers.map((s) => rows.map((row) => Math.max(0, num(row[s.key])))), [layers, rows]);
  const stackOrder = useMemo(
    () => (order === "insideOut" ? insideOutOrder(values) : values.map((_, i) => i)),
    [values, order],
  );
  const totals = useMemo(() => rows.map((_, j) => values.reduce((s, v) => s + (v[j] ?? 0), 0)), [rows, values]);
  const isEmpty = count === 0 || layers.length === 0 || totals.every((v) => v === 0);

  const keys = useMemo(() => rowKeys(rows, index), [rows, index]);
  const version = keys.join("\u0001") + "|" + stackOrder.join(",");
  const signature = dataSignature(rows, [index, ...layers.map((s) => s.key)]) + offset + order;
  const mounted = useHasMounted(width > 0 && !isEmpty && play);

  // Per x: the layers by value (largest first), then the total. `order` keeps which layer each row is.
  const readouts = useMemo(
    () =>
      rows.map((row, j) => {
        const byValue = layers.map((s, si) => ({ s, si, v: values[si]?.[j] ?? 0 })).sort((a, b) => b.v - a.v);
        return {
          title: String(row[index] ?? ""),
          order: byValue.map((r) => r.si),
          rows: [
            ...byValue.map(({ s, si, v }) => ({
              label: `${s.label} · ${pct(totals[j] ? v / totals[j] : NaN)}`,
              value: format(v),
              color: layerColor(s, si),
              kind: "rect" as const,
            })),
            { label: t.total, value: format(totals[j] ?? 0), color: "transparent" },
          ],
        } satisfies Readout & { order: number[] };
      }),
    [rows, layers, values, totals, index, format, pct, t.total],
  );
  const dock = docked ? dockSpace(width, readouts, 3) : 0;

  const M = { top: 8 + dock, bottom: 28, left: 8, right: 8 };
  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = Math.max(0, height - M.top - M.bottom);
  const x = useCallback((j: number) => (count <= 1 ? innerW / 2 : (j / (count - 1)) * innerW), [count, innerW]);

  // Layer edges in value space, bottom layer first.
  const geometry = useMemo(() => {
    const ordered = stackOrder.map((i) => values[i] ?? []);
    const base = streamBaseline(ordered, offset);
    const edges: { lo: number[]; hi: number[] }[] = [];
    const run = base.slice();
    for (const v of ordered) {
      const lo = run.slice();
      const hi = run.map((b, j) => b + (v[j] ?? 0));
      edges.push({ lo, hi });
      for (let j = 0; j < run.length; j++) run[j] = hi[j] ?? 0;
    }
    let min = Infinity;
    let max = -Infinity;
    for (const e of edges)
      for (let j = 0; j < count; j++) {
        min = Math.min(min, e.lo[j] ?? 0);
        max = Math.max(max, e.hi[j] ?? 0);
      }
    return { edges, base, min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 1 };
  }, [values, stackOrder, offset, count]);

  // Layer paths and inline names depend on the data and the size only, never on what is being
  // read: built once per layout, so hovering re-renders no curves.
  const { paths, names } = useMemo(() => {
    const pad = (geometry.max - geometry.min) * 0.04 || 1;
    const y = linear(geometry.min - pad, geometry.max + pad, innerH, 0);

    const paths = stackOrder.map((si, p) => {
      const e = itemAt(geometry.edges, p);
      const top: Pt[] = e.hi.map((v, j) => [x(j), y(v)]);
      const bottom: Pt[] = e.lo.map((v, j) => [x(j), y(v)]);
      const mid: Pt[] = e.lo.map((v, j) => [x(j), y((v + (e.hi[j] ?? 0)) / 2)]);
      const s = itemAt(layers, si);
      return { si, s, color: layerColor(s, si), top, bottom, mid };
    });

    // Inline names: at the thickest x of each layer where the name's tag fits inside it (trying
    // the next thickest when it doesn't), so even a layer with one cramped peak gets its name.
    const names = inlineLabels
      ? paths.map((p) => {
          const w = p.s.label.length * CHAR_W + 18;
          // The name's tag (its width, 20px tall around the layer's middle there) must stay inside
          // the layer all along, with a little air: check its edges at five points across.
          const edgesAt = (px: number) => {
            const k = count <= 1 ? 0 : clamp((px / Math.max(1, innerW)) * (count - 1), 0, count - 1);
            const a = Math.floor(k);
            const b = Math.min(count - 1, a + 1);
            const tt = k - a;
            return {
              top: (p.top[a] ?? ORIGIN_PT)[1] * (1 - tt) + (p.top[b] ?? ORIGIN_PT)[1] * tt,
              bot: (p.bottom[a] ?? ORIGIN_PT)[1] * (1 - tt) + (p.bottom[b] ?? ORIGIN_PT)[1] * tt,
            };
          };
          const candidates: { j: number; th: number }[] = [];
          for (let j = 0; j < count; j++) {
            const th = (p.bottom[j] ?? ORIGIN_PT)[1] - (p.top[j] ?? ORIGIN_PT)[1];
            const cx = x(j);
            if (th >= 26 && cx - w / 2 >= 0 && cx + w / 2 <= innerW) candidates.push({ j, th });
          }
          candidates.sort((a, b) => b.th - a.th);
          for (const { j } of candidates.slice(0, 12)) {
            const cx = x(j);
            const centre = edgesAt(cx);
            const cy = (centre.top + centre.bot) / 2;
            const fits = [-0.5, -0.25, 0, 0.25, 0.5].every((f) => {
              const e = edgesAt(cx + f * w);
              return e.top <= cy - 12 && e.bot >= cy + 12;
            });
            if (fits) return { x: cx, y: cy, w, text: p.s.label };
          }
          return null;
        })
      : [];
    return { paths, names };
  }, [geometry, stackOrder, layers, innerW, innerH, count, inlineLabels, x]);

  // Choreography on one clock: layers swell out of their centre lines, inside out; data changes
  // morph them. Resizes snap; reduced motion draws in place.
  const clock = useMotionValue(0);
  const centre = (layers.length - 1) / 2;
  const centreRef = useRef(centre);
  useSyncRef(centreRef, centre);
  const phase = useMorphClock(clock, {
    play,
    ready: width > 0 && !isEmpty && drawn,
    reduced,
    signature,
    version: paths,
    entrance: duration.slower * 1.3 + centre * 0.07,
    change: duration.slow,
  });
  const [timing] = useState(
    () =>
      (order: number): MorphTiming =>
        phase.current === "enter"
          ? { delay: Math.abs(order - centreRef.current) * 0.07, span: duration.slower * 1.3, ease: enterCurve }
          : { delay: 0, span: duration.slow, ease: changeCurve },
  );

  if (isEmpty) {
    return (
      <div ref={measureRef} className={cn("w-full", className)}>
        <ChartEmpty height={height} aria-label={ariaLabel}>
          {emptyState ?? t.empty}
        </ChartEmpty>
      </div>
    );
  }

  const act = active !== null && active < count ? active : null;
  const focusLayer = layer !== null && layer < layers.length ? layer : null;
  const readout = act !== null ? readouts[act] : undefined;
  const focusName = focusLayer !== null ? itemAt(layers, focusLayer).label : null;
  const announceText = (() => {
    if (!readout || act === null) return focusLayer !== null && focusName ? focusName : "";
    if (focusLayer !== null && focusName) {
      const v = values[focusLayer]?.[act] ?? 0;
      return `${readout.title}, ${focusName}: ${format(v)}, ${pct(totals[act] ? v / totals[act] : NaN)}`;
    }
    const total = totals[act] ?? 0;
    const parts = readout.order.map((si) => {
      const v = values[si]?.[act] ?? 0;
      return `${itemAt(layers, si).label} ${format(v)} (${pct(total ? v / total : NaN)})`;
    });
    return `${readout.title}: ${parts.join(", ")}. ${t.total} ${format(total)}`;
  })();

  const xLabels = rows.map((row) => String(row[index] ?? ""));
  const shownLabels = thinLabels(xLabels, count > 1 ? innerW / (count - 1) : innerW);
  // Labels stay inside the plot: centred on their x, but slid in where that would cross an edge
  // (the first and last labels sit flush with the ends in every browser).
  const labelBox = (j: number) => {
    const w = (xLabels[j]?.length ?? 0) * LABEL_CHAR_W;
    const cx = x(j);
    if (cx - w / 2 < 0) return { x: Math.max(cx - w / 2, -M.left + 2), anchor: "start" as const };
    if (cx + w / 2 > innerW) return { x: Math.min(cx + w / 2, innerW + M.right - 2), anchor: "end" as const };
    return { x: cx, anchor: "middle" as const };
  };

  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    fromPointer();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const j = count <= 1 ? 0 : clamp(Math.round((px / Math.max(1, rect.width)) * (count - 1)), 0, count - 1);
    setActive(j);
    // Which layer is under the pointer (between its edges at this x)?
    const k = count <= 1 ? 0 : clamp((px / Math.max(1, rect.width)) * (count - 1), 0, count - 1);
    const a = Math.floor(k);
    const b = Math.min(count - 1, a + 1);
    const tt = k - a;
    const hit = paths.find((p) => {
      const top = (p.top[a] ?? ORIGIN_PT)[1] * (1 - tt) + (p.top[b] ?? ORIGIN_PT)[1] * tt;
      const bot = (p.bottom[a] ?? ORIGIN_PT)[1] * (1 - tt) + (p.bottom[b] ?? ORIGIN_PT)[1] * tt;
      return py >= top && py <= bot;
    });
    setLayer(hit ? hit.si : null);
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    fromKeyboard();
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      // Up and down walk the layers as stacked on screen (top layer first).
      const onScreen = [...stackOrder].reverse();
      const at = focusLayer === null ? -1 : onScreen.indexOf(focusLayer);
      const next = e.key === "ArrowDown" ? Math.min(onScreen.length - 1, at + 1) : Math.max(0, at <= 0 ? 0 : at - 1);
      setLayer(onScreen[next] ?? null);
      if (act === null) setActive(count - 1);
      return;
    }
    if (e.key === "Escape") setLayer(null);
    chartKeyHandler(count, act, setActive)(e);
  };

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)}>
      <div ref={measureRef} className={cn("relative w-full", solidTipsScope)} style={{ height }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            width={width}
            height={height}
            label={ariaLabel}
            description={resolveInstructions(t.instructions)}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onBlur={() => {
              setActive(null);
              setLayer(null);
            }}
            className={cn("overflow-visible rounded-sheen-sm", chartFocusClass)}
            // Time runs left to right in every locale; horizontal drags scrub (vertical swipes scroll).
            style={{ direction: "ltr", touchAction: "pan-y pinch-zoom" }}
          >
            <defs>
              {/* A soft sheen across every layer: lighter at the crest, the pure hue below. */}
              <linearGradient id={`${id}-sheen`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--sheen-ink-0)" }} stopOpacity={0.16} />
                <stop offset="0.55" style={{ stopColor: "var(--sheen-ink-0)" }} stopOpacity={0} />
              </linearGradient>
              <clipPath id={`${id}-clip`}>
                <rect x={-2} y={-2} width={innerW + 4} height={innerH + 4} />
              </clipPath>
            </defs>
            {hatched && (
              <ChartPatternDefs id={id} entries={layers.map((s, i) => ({ index: i, color: layerColor(s, i) }))} />
            )}
            <g aria-hidden transform={`translate(${M.left},${M.top})`}>
              {/* Centre line (silhouette) or a faint baseline for orientation. */}
              <line x1={0} x2={innerW} y1={innerH + 6} y2={innerH + 6} stroke="var(--sheen-chart-grid)" />

              <g clipPath={`url(#${id}-clip)`} className="forced-color-adjust-none">
                <AnimatePresence>
                  {drawn &&
                    paths.map((p, pi) => (
                      <StreamLayer
                        key={`${p.s.key}-${version}`}
                        top={p.top}
                        bottom={p.bottom}
                        mid={p.mid}
                        clock={clock}
                        timing={timing}
                        order={pi}
                        color={p.color}
                        fill={patternFill(hatched, id, p.si, p.color)}
                        sheen={`url(#${id}-sheen)`}
                        stroke={layers.length > 1 ? 2 : 0}
                        lit={focusLayer === p.si}
                        dim={focusLayer !== null && focusLayer !== p.si}
                        reduced={reduced}
                      />
                    ))}
                </AnimatePresence>
              </g>

              {/* Inline names on small frosted tags: ink text on the chart surface, so they read
                  (AA) on every layer colour in both themes, never text in a series colour. */}
              {names.map((nm, i) =>
                nm && drawn ? (
                  <motion.g
                    key={`${itemAt(paths, i).s.key}-${version}`}
                    className="pointer-events-none"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: focusLayer !== null && focusLayer !== itemAt(paths, i).si ? 0 : 1 }}
                    transition={{
                      duration: reduced ? 0 : duration.base,
                      delay: mounted || reduced ? 0 : duration.slower,
                    }}
                  >
                    <rect
                      x={nm.x - nm.w / 2}
                      y={nm.y - 10}
                      width={nm.w}
                      height={20}
                      rx={10}
                      fill="var(--sheen-chart-surface)"
                      fillOpacity={0.86}
                      className="forced-colors:fill-[Canvas] forced-colors:stroke-[CanvasText]"
                    />
                    <text
                      x={nm.x}
                      y={nm.y}
                      dy="0.35em"
                      textAnchor="middle"
                      className="fill-sheen-fg text-xs font-medium forced-colors:fill-[CanvasText]"
                    >
                      {nm.text}
                    </text>
                  </motion.g>
                ) : null,
              )}

              {xLabels.map((label, j) => {
                if (!shownLabels.has(j)) return null;
                const box = labelBox(j);
                return (
                  <text
                    key={keys[j]}
                    x={box.x}
                    y={innerH + 22}
                    textAnchor={box.anchor}
                    className="fill-sheen-fg-muted text-2xs"
                  >
                    {label}
                  </text>
                );
              })}

              {/* Crosshair: a hairline and a ringed dot in the middle of each layer. */}
              {act !== null && (
                <g pointerEvents="none">
                  <line x1={x(act)} x2={x(act)} y1={0} y2={innerH} stroke="var(--sheen-fg-subtle)" />
                  <g className="forced-color-adjust-none">
                    {paths.map((p) => {
                      const th = (p.bottom[act] ?? ORIGIN_PT)[1] - (p.top[act] ?? ORIGIN_PT)[1];
                      if (th < 3) return null;
                      return (
                        <circle
                          key={p.si}
                          cx={x(act)}
                          cy={((p.top[act] ?? ORIGIN_PT)[1] + (p.bottom[act] ?? ORIGIN_PT)[1]) / 2}
                          r={focusLayer === p.si ? 5 : 4}
                          fill={p.color}
                          stroke="var(--sheen-chart-surface)"
                          strokeWidth={2}
                        />
                      );
                    })}
                  </g>
                </g>
              )}

              <rect
                width={innerW}
                height={innerH}
                fill="transparent"
                onPointerDown={onPointer}
                onPointerMove={onPointer}
                onPointerLeave={(e) => {
                  if (e.pointerType !== "mouse") return;
                  setActive(null);
                  setLayer(null);
                }}
              />
            </g>
          </ChartFigure>
        )}

        {docked && act === null && <DockHint height={dockHintHeight(dock)}>{t.touchHint}</DockHint>}
        {readout && act !== null && (
          <FittedTooltip
            title={readout.title}
            rows={(() => {
              // The layer under the pointer (or picked with up / down) leads the list.
              const at = focusLayer === null ? -1 : readout.order.indexOf(focusLayer);
              return at <= 0 ? readout.rows : [itemAt(readout.rows, at), ...readout.rows.filter((_, i) => i !== at)];
            })()}
            x={M.left + x(act)}
            y={M.top + innerH / 2}
            containerWidth={width}
            docked={docked}
          />
        )}
      </div>
      <ChartAnnouncer text={announce(announceText)} />
    </div>
  );
}
