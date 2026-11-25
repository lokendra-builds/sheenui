"use client";

import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, ease, follow, spring } from "../../motion/tokens";
import { ChartAnnouncer } from "../../components/charts/chart-parts";
import {
  chartFocusClass,
  clamp,
  extent,
  linear,
  niceTicks,
  useDataChanged,
  useElementWidth,
} from "../../components/charts/chart-utils";
import { useCoarsePointer } from "../../hooks/use-media-query";
import { ChartFigure } from "../../components/charts/chart-figure";
import { type FinanceData, type FinanceLabels } from "./model";

/** An `[x, y]` point in chart pixels. @internal */
export type Pt = readonly [number, number];
/** Rounds to one decimal and maps non-finite values to 0. @internal */
export const r1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

/** Smooth path through the points (monotone cubic: never overshoots a value). Same command structure for any data of the same length, so it morphs. */
export function smoothPath(pts: readonly Pt[]) {
  const n = pts.length;
  if (n === 0) return "";
  if (n < 3) return pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)},${r1(y)}`).join(" ");
  const slope = (a: Pt, b: Pt) => (b[0] === a[0] ? 0 : (b[1] - a[1]) / (b[0] - a[0]));
  /** The point at `i` (always in range here; the fallback only satisfies the index type). */
  const at = (i: number): Pt => pts[i] ?? [0, 0];
  const t = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const s0 = slope(at(i - 1), at(i));
    const s1 = slope(at(i), at(i + 1));
    t[i] = s0 * s1 <= 0 ? 0 : (2 * s0 * s1) / (s0 + s1);
  }
  t[0] = slope(at(0), at(1));
  t[n - 1] = slope(at(n - 2), at(n - 1));
  let d = `M${r1(at(0)[0])},${r1(at(0)[1])}`;
  for (let i = 1; i < n; i++) {
    const [ax, ay] = at(i - 1);
    const [bx, by] = at(i);
    const dx = (bx - ax) / 3;
    d += ` C${r1(ax + dx)},${r1(ay + dx * (t[i - 1] ?? 0))} ${r1(bx - dx)},${r1(by - dx * (t[i] ?? 0))} ${r1(bx)},${r1(by)}`;
  }
  return d;
}

/** The portfolio line colour (chart slot 1). @internal */
export const LINE = "var(--sheen-chart-1)";
/** The drop-shadow glow behind the portfolio line, softer in light mode. @internal */
export const GLOW = `drop-shadow(0 0 6px light-dark(transparent, color-mix(in oklab, ${LINE} 75%, transparent)))`;
/** The spring the hover marker uses to follow the pointer. @internal */
export const FOLLOW = { type: "spring", ...follow.pointer } as const;
/** The inner margins of the portfolio chart, in pixels. @internal */
export const MARGIN = { top: 14, right: 58, bottom: 26, left: 2 };

/**
 * The balance chart: gradient area + smooth line, a crosshair that follows the pointer on a
 * spring, and a measured band between two points. Values reach assistive tech through the arrow
 * keys and the announcer (plus the table view). Data changes morph the line point for point.
 */
export function PortfolioChart({
  series,
  previous,
  active,
  anchor,
  onActive,
  onAnchor,
  live,
  formatValue,
  formatAxisValue,
  formatAxisTime,
  formatPointTime,
  labels: L,
  height = 236,
}: {
  series: FinanceData["series"];
  previous: number[] | null;
  active: number | null;
  anchor: number | null;
  onActive: (i: number | null) => void;
  onAnchor: (i: number | null) => void;
  live: boolean;
  formatValue: (v: number) => string;
  formatAxisValue: (v: number) => string;
  formatAxisTime: (t: number) => string;
  formatPointTime: (t: number) => string;
  labels: FinanceLabels;
  height?: number;
}) {
  const id = useId();
  const reduced = useSheenReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const n = series.length;
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  // Same data, new width: no tween. New data (a range or filter): morph. A live tick that only
  // moves the latest point doesn't morph the whole path either (the end dot's ping shows it).
  const signature =
    series
      .slice(0, -1)
      .map((p) => r1(p.value))
      .join(",") + (previous ? `|${previous.length}` : "");
  const dataChanged = useDataChanged(signature);
  const [seen, setSeen] = useState(false);
  if (!seen && width > 0 && n > 0) setSeen(true);

  const { ticks, y, x } = useMemo(() => {
    const values = series.map((p) => p.value).concat(previous ?? []);
    const [lo, hi] = extent(values);
    const pad = (hi - lo || Math.abs(hi) || 1) * 0.12;
    const t = niceTicks(lo - pad, hi + pad, 3);
    const y0 = t[0] ?? lo;
    const y1 = t[t.length - 1] ?? hi;
    const yScale = linear(y0, y1, innerH, 0);
    return {
      ticks: t,
      y: (v: number) => clamp(yScale(v), 0, innerH),
      x: (i: number) => (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW),
    };
  }, [series, previous, innerW, innerH, n]);

  const pts = series.map((p, i) => [x(i), y(p.value)] as const);
  const line = smoothPath(pts);
  const area = pts.length ? `${line} L${r1(x(n - 1))},${r1(innerH)} L${r1(x(0))},${r1(innerH)} Z` : "";
  const prevLine = previous ? smoothPath(previous.slice(0, n).map((v, i) => [x(i), y(v)] as const)) : "";

  const move = reduced || !dataChanged ? { duration: 0 } : spring.smooth;
  const draw = reduced ? 0 : duration.slower * 1.2;

  // ---- interaction ----
  const press = useRef<{ id: number; x: number; hold: number | undefined; measuring: boolean } | null>(null);
  const indexAt = (clientX: number, rect: DOMRect) =>
    clamp(Math.round(((clientX - rect.left) / Math.max(1, rect.width)) * (n - 1)), 0, n - 1);
  const coarse = useCoarsePointer();

  function onPointerDown(e: React.PointerEvent<SVGRectElement>) {
    if (n === 0) return;
    const i = indexAt(e.clientX, e.currentTarget.getBoundingClientRect());
    e.currentTarget.setPointerCapture(e.pointerId);
    onActive(i);
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      onAnchor(i);
      press.current = { id: e.pointerId, x: e.clientX, hold: undefined, measuring: true };
      return;
    }
    // Touch: drag reads values; touch and HOLD, then drag, measures.
    onAnchor(null);
    const hold = window.setTimeout(() => {
      if (press.current) press.current.measuring = true;
      onAnchor(i);
    }, 380);
    press.current = { id: e.pointerId, x: e.clientX, hold, measuring: false };
  }
  function onPointerMove(e: React.PointerEvent<SVGRectElement>) {
    if (n === 0) return;
    const p = press.current;
    if (!p && e.pointerType !== "mouse") return;
    if (p && !p.measuring && Math.abs(e.clientX - p.x) > 8) window.clearTimeout(p.hold);
    onActive(indexAt(e.clientX, e.currentTarget.getBoundingClientRect()));
  }
  function onPointerUp(e: React.PointerEvent<SVGRectElement>) {
    const p = press.current;
    press.current = null;
    if (p) window.clearTimeout(p.hold);
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      // A click (no drag) is not a measurement.
      if (anchor !== null && active === anchor) onAnchor(null);
      return;
    }
    onActive(null);
    onAnchor(null);
  }
  function onPointerLeave(e: React.PointerEvent<SVGRectElement>) {
    if (e.pointerType === "mouse" && !press.current) {
      onActive(null);
      onAnchor(null);
    }
  }
  function onKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
    if (n === 0) return;
    const current = active ?? n - 1;
    let next: number;
    if (e.key === "ArrowRight" || e.key === "ArrowUp")
      next = active === null ? n - 1 : Math.min(n - 1, current + (e.altKey ? 10 : 1));
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown")
      next = active === null ? n - 1 : Math.max(0, current - (e.altKey ? 10 : 1));
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if (e.key === "Escape" && (active !== null || anchor !== null)) {
      onActive(null);
      onAnchor(null);
      e.preventDefault();
      return;
    } else return;
    e.preventDefault();
    if (e.shiftKey) {
      if (anchor === null) onAnchor(current);
    } else if (anchor !== null) onAnchor(null);
    onActive(next);
  }

  const act = active !== null && active < n ? active : null;
  const anc = anchor !== null && anchor < n && act !== null && anchor !== act ? anchor : null;
  const actPoint = act !== null ? series[act] : undefined;
  const ancPoint = anc !== null ? series[anc] : undefined;
  const announce = actPoint
    ? ancPoint
      ? `${formatPointTime(ancPoint.time)} to ${formatPointTime(actPoint.time)}: ${formatValue(ancPoint.value)} to ${formatValue(actPoint.value)}`
      : `${formatPointTime(actPoint.time)}: ${formatValue(actPoint.value)}`
    : "";

  // X labels: the first, the last and a few between, never colliding.
  const xTicks = useMemo(() => {
    if (n < 2 || innerW <= 0) return [] as number[];
    const count = Math.max(2, Math.min(6, Math.floor(innerW / 96)));
    return Array.from({ length: count }, (_, k) => Math.round((k / (count - 1)) * (n - 1)));
  }, [n, innerW]);
  const lastPt = pts[n - 1];

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {/* A time series reads left to right (oldest → latest) in every language, like a price chart. */}
      {/* touch-action on the HTML wrapper: browsers ignore it on SVG shapes. Vertical swipes still scroll. */}
      <div
        ref={ref}
        dir="ltr"
        className="relative w-full touch-pan-y touch-pinch-zoom select-none [-webkit-touch-callout:none]"
        style={{ height }}
      >
        {width > 0 && n > 0 && (
          <ChartFigure
            as="svg"
            width={width}
            height={height}
            label={L.balance}
            description={L.chartInstructions}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onBlur={() => {
              onActive(null);
              onAnchor(null);
            }}
            className={cn("overflow-visible rounded-sheen-sm", chartFocusClass)}
          >
            <defs>
              <linearGradient id={`${id}-area`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={LINE} stopOpacity={0.3} />
                <stop offset="60%" stopColor={LINE} stopOpacity={0.08} />
                <stop offset="100%" stopColor={LINE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <g aria-hidden transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* Hairline grid; value ticks on the right, like a trading chart. */}
              <AnimatePresence initial={false}>
                {ticks.map((t) => (
                  <motion.g
                    key={t}
                    initial={{ opacity: 0, y: y(t) }}
                    animate={{ opacity: 1, y: y(t) }}
                    exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
                    transition={{ y: move, opacity: { duration: duration.base } }}
                  >
                    <line x2={innerW} stroke="var(--sheen-chart-grid)" strokeWidth={1} />
                    <text x={innerW + 8} dy="0.32em" className="fill-sheen-fg-muted text-2xs tabular-nums">
                      {formatAxisValue(t)}
                    </text>
                  </motion.g>
                ))}
              </AnimatePresence>
              {xTicks.map((i, k) => (
                <text
                  key={k}
                  x={x(i)}
                  y={innerH + 18}
                  textAnchor={k === 0 ? "start" : k === xTicks.length - 1 ? "end" : "middle"}
                  className="fill-sheen-fg-muted text-2xs"
                >
                  {formatAxisTime(series[i]?.time ?? 0)}
                </text>
              ))}

              {/* Measured band between the two points. */}
              {anc !== null && act !== null && (
                <rect
                  x={Math.min(x(anc), x(act))}
                  width={Math.abs(x(act) - x(anc))}
                  height={innerH}
                  fill="color-mix(in oklab, var(--sheen-chart-1) 12%, transparent)"
                  stroke="color-mix(in oklab, var(--sheen-chart-1) 40%, transparent)"
                  strokeDasharray="3 3"
                />
              )}

              <motion.path
                fill={`url(#${id}-area)`}
                initial={{ opacity: reduced ? 1 : 0, d: area }}
                animate={{ opacity: seen ? 1 : 0, d: area }}
                transition={{
                  d: move,
                  opacity: { duration: reduced ? duration.fast : duration.slower, delay: reduced ? 0 : draw * 0.45 },
                }}
              />
              {previous && (
                <motion.path
                  fill="none"
                  stroke="var(--sheen-fg-subtle)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  initial={{ opacity: 0, d: prevLine }}
                  animate={{ opacity: 1, d: prevLine }}
                  transition={{ d: move, opacity: { duration: duration.base } }}
                />
              )}
              <motion.path
                fill="none"
                stroke={LINE}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: reduced ? 1 : 0, d: line }}
                animate={{ pathLength: seen ? 1 : 0, d: line }}
                transition={{ pathLength: { duration: draw, ease: ease.out }, d: move }}
                style={{ filter: act !== null ? GLOW : undefined }}
              />

              {/* The latest point, with a soft ping on every live update. */}
              {lastPt && act === null && (
                <g transform={`translate(${r1(lastPt[0])},${r1(lastPt[1])})`}>
                  {live && !reduced && (
                    <circle
                      key={r1(lastPt[1])}
                      r={5}
                      fill={LINE}
                      className="origin-center opacity-50 [transform-box:fill-box] motion-ok:animate-ping"
                      style={{ animationIterationCount: 1 }}
                    />
                  )}
                  <circle r={4} fill={LINE} stroke="var(--sheen-chart-surface)" strokeWidth={2} />
                </g>
              )}

              {/* Anchor of a measurement. */}
              {anc !== null && (
                <g transform={`translate(${r1(x(anc))},0)`}>
                  <line y2={innerH} stroke="var(--sheen-fg-subtle)" strokeWidth={1} />
                  <circle
                    cy={y(series[anc]?.value ?? 0)}
                    r={4.5}
                    fill={LINE}
                    stroke="var(--sheen-chart-surface)"
                    strokeWidth={2}
                  />
                </g>
              )}

              {/* Crosshair: glides between points on the pointer spring. */}
              <AnimatePresence>
                {act !== null && (
                  <motion.g
                    key="crosshair"
                    initial={{ opacity: 0, x: x(act) }}
                    animate={{ opacity: 1, x: x(act) }}
                    exit={{ opacity: 0, transition: { duration: duration.exit } }}
                    transition={{ x: reduced ? { duration: 0 } : FOLLOW, opacity: { duration: duration.fast } }}
                  >
                    <line y2={innerH} stroke="var(--sheen-fg-subtle)" strokeWidth={1} />
                    <motion.circle
                      initial={false}
                      animate={{ cy: y(series[act]?.value ?? 0) }}
                      transition={reduced ? { duration: 0 } : FOLLOW}
                      r={5}
                      fill={LINE}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      style={{ filter: GLOW }}
                    />
                  </motion.g>
                )}
              </AnimatePresence>

              {/* Hit area: the whole plot. Vertical swipes still scroll the page on touch. */}
              <rect
                width={innerW}
                height={innerH}
                fill="transparent"
                style={{ touchAction: "pan-y pinch-zoom", cursor: "crosshair" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerLeave={onPointerLeave}
              />
            </g>
          </ChartFigure>
        )}
        {width > 0 && n === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-sheen-fg-muted">
            {L.noAssets}
          </div>
        )}
      </div>
      <p className="text-2xs text-sheen-fg-muted">{coarse ? L.measureHintTouch : L.measureHint}</p>
      <ChartAnnouncer text={announce} />
    </div>
  );
}
