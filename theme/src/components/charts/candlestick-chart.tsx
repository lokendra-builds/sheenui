"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useDeferredValue, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useShortcutPlatform } from "../kbd/kbd";
import { animate, cancelFrame, frame, motion, useMotionValue } from "motion/react";

import { cn } from "../../lib/cn";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import { useInputSource } from "./chart-fit";
import { useDarkScheme } from "./flow-utils";
import {
  chartFocusClass,
  clamp,
  linear,
  niceTicks,
  slotColor,
  useElementWidth,
  resolveInstructions,
} from "./chart-utils";
import { defaultCompact, useEntrance } from "./heatmap";
import { markGlow, solidOverlayClass, useDeferredDraw, useStaggerEntrance } from "./category-bar";
import { ChartFigure } from "./chart-figure";

import {
  defaultCandlestickChartLabels,
  type CandlestickChartProps,
  parseCandles,
  type Parsed,
  MIN_SPAN,
  PILL_H,
  UP,
  DOWN,
  AXIS_CH,
} from "./candlestick-chart/model";
import { useWheelZoom, type LiveView } from "./candlestick-chart/wheel";
import { useCandleInteraction } from "./candlestick-chart/interaction";
import { priceRange, useCandleFormats } from "./candlestick-chart/derive";
import { CandleReadout } from "./candlestick-chart/readout";
import { Crosshair } from "./candlestick-chart/crosshair";
import { paintDisplay } from "./candlestick-chart/display";
import { candleShape, volumeBarShape } from "./candlestick-chart/shapes";

export {
  type Candle,
  type CandlestickChartLabels,
  defaultCandlestickChartLabels,
  type CandlestickChartProps,
  parseCandles,
} from "./candlestick-chart/model";
export { type CandlestickTableProps, CandlestickTable } from "./candlestick-chart/table";

/**
 * Candlesticks (or OHLC bars) for prices over time, with a volume strip, a moving average and a
 * crosshair readout: the chart traders expect, built for a design system.
 *
 * - Rising candles are hollow and falling ones filled, and the readout names the move with an
 *   arrow, a sign and a percentage, so colour is never the only cue.
 * - Volume sits in its own strip under the prices, sharing the time axis (never a second y-axis).
 * - The readout above the chart always shows a candle: the latest one, or the one under the
 *   pointer / keyboard focus, with a crosshair and price and date tags on the axes.
 * - Zoom with Ctrl/⌘ + scroll, a trackpad pinch, a two-finger pinch on touch, the + / − keys
 *   or the buttons; pan with a mouse drag, a two-finger drag on touch (one finger reads the
 *   candles), scrolling sideways or Shift + arrows. The price axis eases to fit what's in view.
 * - Candles grow in from their middles, left to right, the first time the chart scrolls into
 *   view; the average draws in after them. Reduced motion: everything is drawn in place.
 *
 * Keyboard: Tab focuses the chart; Left and Right read the previous and next candle, Home and End jump to the first and last, Escape clears. With `zoom`: + and - zoom, 0 resets, Shift with Left or Right pans.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; rising candles are hollow and falling ones filled, and the readout names each move with an arrow, a sign and a percentage, so colour is never the only cue. `CandlestickTable` is the table view.
 * Glass and motion: the tooltip is a solid glass-look overlay (no backdrop blur). Reduced motion draws candles and zooms instantly.
 *
 * @example
 * ```tsx
 * import { CandlestickChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CandlestickChart
 *       data={[
 *         { date: "2026-03-02", open: 100, high: 108, low: 97, close: 105, volume: 1200 },
 *         { date: "2026-03-03", open: 105, high: 110, low: 101, close: 103, volume: 980 },
 *         { date: "2026-03-04", open: 103, high: 112, low: 102, close: 111, volume: 1500 },
 *       ]}
 *       aria-label="ACME share price, March"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/candlestick
 */
export function CandlestickChart({
  data,
  mode = "candle",
  volume: volumeProp,
  average = 0,
  height = 300,
  volumeHeight = 64,
  upColor,
  downColor,
  averageColor = 1,
  format: formatProp,
  formatVolume: formatVolumeProp,
  formatDate,
  locale,
  timeZone,
  zoom = true,
  defaultRange,
  onRangeChange,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<CandlestickChartProps>) {
  const t = { ...defaultCandlestickChartLabels, ...labelOverrides };
  const id = useId();
  const reduced = useSheenReducedMotion();
  const platform = useShortcutPlatform();
  const dark = useDarkScheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const svgRef = useRef<SVGSVGElement>(null);
  const marksRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const { fromKeyboard, fromPointer, announce } = useInputSource();

  // New data (another symbol, a new range) is drawn in a transition: React yields while it
  // builds the candles, so the control that changed it responds at once.
  const shownData = useDeferredValue(data);
  // Marks are built once the chart nears the viewport, in a deferred render (see useDeferredDraw):
  // a page load or a ChartCard's Chart tab coming back paints the frame at once, the marks right after.
  const drawn = useDeferredDraw(rootRef);
  const candles = useMemo(() => parseCandles(shownData, average > 0 ? Math.floor(average) : 0), [shownData, average]);
  const count = candles.length;
  const showVolume = (volumeProp ?? candles.some((c) => c.v !== null)) && count > 0;

  // Number and date formats.
  const { priceFormat, dates, pctFormat } = useCandleFormats({ formatProp, locale, candles, count, timeZone });
  const volumeFormat = formatVolumeProp ?? defaultCompact(locale);
  const fullDate = (d: Date) => (Number.isNaN(d.getTime()) ? "" : formatDate ? formatDate(d) : dates.full.format(d));

  /* ---------- View window (zoom + pan) ---------- */

  const minSpan = Math.min(count, MIN_SPAN);
  const fit = (start: number, end: number) => {
    const span = clamp(end - start, Math.max(1, minSpan), Math.max(1, count));
    const s = clamp(start, 0, Math.max(0, count - span));
    return { start: s, end: s + span };
  };
  const dataKey = `${count}:${candles[0]?.date.getTime() ?? 0}:${candles[count - 1]?.date.getTime() ?? 0}`;
  const [viewState, setViewState] = useState<{ key: string; start: number; end: number } | null>(null);
  // The first view: `defaultRange` (or everything), narrowed on small screens so candles stay
  // at least ~5px apart (the latest end stays in view; zooming out shows the rest).
  const initial = defaultRange ? fit(defaultRange[0], defaultRange[1]) : { start: 0, end: count };
  const roomy = width > 0 && zoom ? Math.max(minSpan, Math.floor(Math.max(0, width - 110) / 5)) : Infinity;
  const view =
    viewState?.key === dataKey
      ? fit(viewState.start, viewState.end)
      : initial.end - initial.start > roomy
        ? fit(initial.end - roomy, initial.end)
        : initial;
  const span = Math.max(1e-6, view.end - view.start);
  const zoomed = span < count - 0.01;
  const commitView = (start: number, end: number) => {
    const next = fit(start, end);
    setViewState({ key: dataKey, ...next });
  };
  // The zoom glide: the displayed view (start, span) lives in MotionValues, `glidingRef` marks a glide in flight.
  const [glideFrom, setGlideFrom] = useState<{ start: number; end: number } | null>(null);
  const dS = useMotionValue(view.start);
  const dSpan = useMotionValue(span);
  const glidingRef = useRef(false);
  const stopGlide = () => {
    glidingRef.current = false;
    dS.stop();
    dSpan.stop();
    setGlideFrom(null);
  };
  // Direct changes (drag, pinch, wheel, keys) apply at once and end any zoom glide.
  const setView = (start: number, end: number) => {
    if (glidingRef.current) stopGlide();
    commitView(start, end);
  };
  const lastRange = useRef("");
  useEffect(() => {
    const key = `${Math.round(view.start)}-${Math.round(view.end)}`;
    if (key === lastRange.current) return;
    lastRange.current = key;
    onRangeChange?.([Math.round(view.start), Math.round(view.end)]);
  });

  /* ---------- Geometry ---------- */

  // While a zoom glides, the candles of both the old and the new view are drawn.
  const drawStart = glideFrom ? Math.min(view.start, glideFrom.start) : view.start;
  const drawEnd = glideFrom ? Math.max(view.end, glideFrom.end) : view.end;
  const first = Math.max(0, Math.floor(drawStart) - 1);
  const last = Math.min(count - 1, Math.ceil(drawEnd));
  const visible = useMemo(() => candles.slice(first, last + 1), [candles, first, last]);
  const { tLo, tHi, tV } = priceRange(candles, view, count);

  const ticks = useMemo(() => {
    const n = Math.max(2, Math.floor(height / 56));
    return niceTicks(tLo, tHi, n).filter((v) => v >= tLo && v <= tHi);
  }, [tLo, tHi, height]);

  const lastCandle = candles[count - 1];
  const axisChars = Math.max(
    ...ticks.map((v) => priceFormat(v).length),
    lastCandle ? priceFormat(lastCandle.c).length : 4,
  );
  const M = { top: 10, left: 4, right: clamp(Math.ceil(axisChars * AXIS_CH) + 22, 48, 104) };
  const innerW = Math.max(0, width - M.left - M.right);
  const priceH = height;
  const gap = showVolume ? 10 : 0;
  const volH = showVolume ? volumeHeight : 0;
  const axisH = 26;
  const svgH = M.top + priceH + gap + volH + axisH;
  const x = useCallback((i: number) => ((i + 0.5 - view.start) / span) * innerW, [view.start, span, innerW]);
  const step = innerW / span;
  const yP = useMemo(() => linear(tLo, tHi, priceH, 0), [tLo, tHi, priceH]);
  const yV = useMemo(() => linear(0, tV * 1.12, volH, 0), [tV, volH]);
  const priceAt = (py: number) => tLo + ((priceH - py) / Math.max(1, priceH)) * (tHi - tLo);
  const rawBodyW = clamp(step * 0.64, 1, 24);
  const bodyW = step - rawBodyW < 2 ? Math.max(1, step - 2) : rawBodyW;
  const hollow = bodyW >= 4; // below 4px a hollow body can't be told apart: fill both
  const up = upColor ? slotColor(upColor) : UP;
  const down = downColor ? slotColor(downColor) : DOWN;
  const maColor = slotColor(averageColor);
  const colorOf = useCallback((c: Parsed) => (c.c >= c.o ? up : down), [up, down]);
  const perCandle = Math.min(0.02, 0.6 / Math.max(1, visible.length));

  /** One candle (or OHLC bar): its wick and body, in its rising / falling colour. */
  const drawCandle = useCallback(
    (c: Parsed, i: number) => candleShape(c, x(i), colorOf(c), { mode, step, bodyW, hollow, yP }),
    [x, yP, colorOf, mode, step, bodyW, hollow],
  );
  const volumeBar = useCallback(
    (c: Parsed, i: number, strength: number) => volumeBarShape(c, x(i), strength, colorOf(c), { volH, bodyW, yV }),
    [x, yV, volH, bodyW, colorOf],
  );

  // The marks depend on the view and the price scale only, never on the candle being read:
  // built once per layout, so scrubbing re-renders just the crosshair and the active candle.
  const candleMarks = useMemo(
    () =>
      !drawn
        ? null
        : visible.map((c, k) => (
            <g
              key={first + k}
              data-delay={reduced ? undefined : (k * perCandle).toFixed(3)}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              {drawCandle(c, first + k)}
            </g>
          )),
    [visible, first, drawCandle, reduced, perCandle, drawn],
  );
  const volumeMarks = useMemo(
    () =>
      showVolume && drawn
        ? visible.map((c, k) => {
            const bar = volumeBar(c, first + k, 45);
            return bar ? (
              <path
                key={first + k}
                data-delay={reduced ? undefined : (0.1 + k * perCandle).toFixed(3)}
                d={bar.d}
                fill={bar.fill}
                style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
              />
            ) : null;
          })
        : null,
    [visible, first, volumeBar, showVolume, reduced, perCandle, drawn],
  );

  /* ---------- Interaction state ---------- */

  const [active, setActive] = useState<number | null>(null);
  const [crossY, setCrossY] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const act = active !== null && active < count ? active : null;
  const shownCandle = act !== null ? candles[act] : lastCandle;

  // The latest view, size and actions for the native listeners below (bound once), so a wheel
  // or a trackpad pinch always acts on the current data, even after it changes.
  const live = useRef<LiveView>({
    view,
    innerW,
    count,
    zoom,
    left: M.left,
    setView: (_s: number, _e: number): void => undefined,
    zoomBy: (_f: number, _a: number): void => undefined,
    nudgeMoving: (): void => undefined,
  });

  // While the view is being dragged, pinched or wheeled (or glides), the average line drops its
  // glow, so nothing has to re-blur on those frames.
  const [moving, setMoving] = useState(false);
  const movingTimer = useRef(0);
  const nudgeMoving = () => {
    setMoving(true);
    window.clearTimeout(movingTimer.current);
    movingTimer.current = window.setTimeout(() => setMoving(false), 180);
  };
  useEffect(() => () => window.clearTimeout(movingTimer.current), []);

  /*
   * What is on screen, as MotionValues: the view (start, span) and the price and volume ranges.
   * React draws the marks once, on the target view and ranges; `applyDisplay` maps them onto the
   * displayed ones with a transform per layer (and moves the axis labels), so a zoom glide or an
   * easing axis never re-renders React per frame (FLIP, for SVG). x follows the view at once,
   * except while a zoom glides; the ranges always ease (instantly under reduced motion).
   */
  const dLo = useMotionValue(tLo);
  const dHi = useMotionValue(tHi);
  const dV = useMotionValue(tV);
  const priceLayerRef = useRef<SVGGElement>(null);
  const volumeLayerRef = useRef<SVGGElement>(null);
  const dateAxisRef = useRef<SVGGElement>(null);
  const lastLineRef = useRef<SVGGElement>(null);
  const lastPillRef = useRef<SVGGElement>(null);
  const tickRefs = useRef(new Map<number, SVGGElement>());
  const target = useRef({
    start: view.start,
    span,
    lo: tLo,
    hi: tHi,
    v: tV,
    w: innerW,
    h: priceH,
    volH,
    last: null as number | null,
    right: innerW + 2,
    pillH: 18,
  });
  const [applyDisplay] = useState(
    () => () =>
      paintDisplay(target.current, {
        dS,
        dSpan,
        dLo,
        dHi,
        dV,
        priceLayer: priceLayerRef,
        volumeLayer: volumeLayerRef,
        dateAxis: dateAxisRef,
        lastLine: lastLineRef,
        lastPill: lastPillRef,
        ticks: tickRefs,
      }),
  );
  // Several MotionValues change per frame: apply once, in Motion's render step.
  useEffect(() => {
    const schedule = () => frame.render(applyDisplay);
    const offs = [dS, dSpan, dLo, dHi, dV].map((mv) => mv.on("change", schedule));
    return () => {
      offs.forEach((off) => off());
      cancelFrame(applyDisplay);
      [dS, dSpan, dLo, dHi, dV].forEach((mv) => mv.stop());
    };
  }, [dS, dSpan, dLo, dHi, dV, applyDisplay]);
  const sized = width > 0;
  const hasCandles = count > 0;
  useLayoutEffect(() => {
    const prev = target.current;
    target.current = {
      start: view.start,
      span,
      lo: tLo,
      hi: tHi,
      v: tV,
      w: innerW,
      h: priceH,
      volH,
      last: lastCandle ? yP(lastCandle.c) : null,
      right: innerW + 2,
      pillH: PILL_H,
    };
    if (!glidingRef.current) {
      dS.jump(view.start);
      dSpan.jump(span);
    }
    if (prev.lo !== tLo || prev.hi !== tHi || prev.v !== tV) {
      if (reduced || !sized) {
        dLo.jump(tLo);
        dHi.jump(tHi);
        dV.jump(tV);
      } else {
        const opts = { duration: duration.base, ease: ease.out };
        animate(dLo, tLo, opts);
        animate(dHi, tHi, opts);
        animate(dV, tV, opts);
      }
    }
    // The marks were just drawn on the new targets: map them onto the screen before paint.
    applyDisplay();
  });

  const zoomBy = (factor: number, anchor: number) => {
    const { view: v, count: n } = live.current;
    const s = v.end - v.start;
    const next = clamp(s * factor, Math.max(1, Math.min(n, MIN_SPAN)), n);
    const k = next / s;
    setView(anchor - (anchor - v.start) * k, anchor - (anchor - v.start) * k + next);
  };
  useLayoutEffect(() => {
    live.current = { view, innerW, count, zoom, left: M.left, setView, zoomBy, nudgeMoving };
  });
  /** Zoom buttons and the 0 key: the new view is drawn once, then glides into place by transform. */
  const glide = (start: number, end: number) => {
    const to = fit(start, end);
    if (reduced) {
      setView(to.start, to.end);
      return;
    }
    const fromStart = dS.get();
    glidingRef.current = true;
    setGlideFrom({ start: fromStart, end: fromStart + dSpan.get() });
    commitView(to.start, to.end);
    setMoving(true);
    const opts = { duration: duration.slow, ease: ease.out };
    animate(dS, to.start, opts);
    animate(dSpan, to.end - to.start, {
      ...opts,
      onComplete: () => {
        glidingRef.current = false;
        setGlideFrom(null);
        setMoving(false);
      },
    });
  };

  useWheelZoom(svgRef, live, setHint, [sized, hasCandles]);

  const { onPointerDown, onPointerMove, onPointerEnd, onKeyDown, gesture } = useCandleInteraction({
    svgRef,
    view,
    span,
    count,
    zoom,
    zoomed,
    minSpan,
    innerW,
    priceH,
    margin: M,
    active: act,
    setActive,
    setCrossY,
    setView,
    zoomBy,
    glide,
    nudgeMoving,
    fromPointer,
    fromKeyboard,
  });
  // Entrance: candles grow from their middles (volume from the floor), left to right.
  useStaggerEntrance(
    marksRef,
    play && drawn && width > 0 && count > 0,
    reduced,
    [
      { transform: "scaleY(0)", opacity: 0 },
      { transform: "scaleY(1)", opacity: 1 },
    ],
    duration.slow * 1000,
  );

  if (count === 0) {
    return (
      <div ref={measureRef} className={cn("w-full", className)}>
        <ChartEmpty height={height + (volumeProp ? volumeHeight : 0) + 40} aria-label={ariaLabel}>
          {emptyState ?? t.empty}
        </ChartEmpty>
      </div>
    );
  }

  /* ---------- Readout ---------- */

  const changeOf = (c: Parsed) => (c.prev === null ? c.c - c.o : c.c - c.prev);
  const base = (c: Parsed) => c.prev ?? c.o;
  const move = shownCandle ? changeOf(shownCandle) : 0;
  const moveRatio = shownCandle && base(shownCandle) !== 0 ? move / base(shownCandle) : 0;
  const dir = move > 0 ? "up" : move < 0 ? "down" : "flat";
  const sign = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "");
  const moveText = `${sign(move)}${priceFormat(Math.abs(move))} (${pctFormat.format(moveRatio).replace("-", "−")})`;
  const widest = Math.max(...candles.map((c) => priceFormat(c.h).length), 4);
  const announceText =
    act !== null && shownCandle
      ? `${fullDate(shownCandle.date)}: ${t.open} ${priceFormat(shownCandle.o)}, ${t.high} ${priceFormat(shownCandle.h)}, ${t.low} ${priceFormat(shownCandle.l)}, ${t.close} ${priceFormat(shownCandle.c)}, ${dir === "up" ? t.up : dir === "down" ? t.down : t.unchanged} ${pctFormat.format(Math.abs(moveRatio)).replace(/^\+/, "")}${shownCandle.v !== null ? `, ${t.volume} ${volumeFormat(shownCandle.v)}` : ""}${shownCandle.ma !== null ? `, ${t.average(average)} ${priceFormat(shownCandle.ma)}` : ""}`
      : "";

  /* ---------- Drawing ---------- */

  // Date labels on every k-th candle (by index, so they slide with the candles when panning).
  const labelW = Math.max(...visible.map((c) => dates.axis.format(c.date).length), 3) * AXIS_CH + 16;
  const every = Math.max(1, Math.ceil(labelW / Math.max(1e-6, step)));
  const lastUp = lastCandle ? lastCandle.c >= (lastCandle.prev ?? lastCandle.o) : true;
  const lastColor = lastUp ? up : down;
  const maPath = (() => {
    if (!(average > 0)) return "";
    let d = "";
    for (let i = first; i <= last; i++) {
      const m = candles[i]?.ma;
      if (m === null || m === undefined) continue;
      d += `${d ? "L" : "M"}${x(i).toFixed(1)},${yP(m).toFixed(1)} `;
    }
    return d;
  })();
  // The candle being read is redrawn over the (dimmed) memoised marks; its volume bar too, so
  // the two layers add up to ~80% strength.
  const activeParsed = act !== null && act >= first && act <= last ? candles[act] : undefined;
  const activeVolume = activeParsed && act !== null && showVolume ? volumeBar(activeParsed, act, 64) : null;
  const crossPrice = crossY !== null ? priceAt(crossY) : act !== null && shownCandle ? shownCandle.c : null;
  const crossPy = crossY ?? (crossPrice !== null ? yP(crossPrice) : null);
  const pillH = PILL_H;
  // The last-price tag steps aside while the crosshair's price tag would cover it.
  const lastPy = lastCandle ? clamp(yP(lastCandle.c), pillH / 2, priceH - pillH / 2) : null;
  const crossPillPy = crossPy !== null && crossPrice !== null ? clamp(crossPy, pillH / 2, priceH - pillH / 2) : null;
  const lastTagHidden = lastPy !== null && crossPillPy !== null && Math.abs(lastPy - crossPillPy) < pillH + 2;
  const dateText = shownCandle && act !== null ? dates.axis.format(shownCandle.date) : "";
  const dateW = dateText.length * AXIS_CH + 14;
  // Left edge of the crosshair's date tag (kept inside the plot), and its centre for collisions.
  const dateTagLeft = act !== null ? clamp(x(act) - dateW / 2, 0, Math.max(0, innerW - dateW)) : 0;
  const dateTagX = act !== null ? dateTagLeft + dateW / 2 : null;

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col gap-2", className)}>
      <CandleReadout
        candle={shownCandle}
        dateText={shownCandle ? fullDate(shownCandle.date) : ""}
        labels={t}
        widest={widest}
        priceFormat={priceFormat}
        volumeFormat={volumeFormat}
        dir={dir}
        moveText={moveText}
        showVolume={showVolume}
        average={average}
        maColor={maColor}
        zoomButtons={zoom && count > 2}
        zoomed={zoomed}
        canZoomIn={span > minSpan + 0.01}
        onZoomOut={() => glide((view.start + view.end) / 2 - span * 0.75, (view.start + view.end) / 2 + span * 0.75)}
        onZoomIn={() => glide((view.start + view.end) / 2 - span * 0.35, (view.start + view.end) / 2 + span * 0.35)}
        onReset={() => glide(0, count)}
      />

      <div ref={measureRef} className="relative w-full" style={{ height: svgH }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            ref={svgRef}
            width={width}
            height={svgH}
            label={ariaLabel}
            description={resolveInstructions(t.instructions)}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onBlur={() => {
              setActive(null);
              setCrossY(null);
            }}
            className={cn("rounded-sheen-sm select-none", chartFocusClass)}
            // Time runs left to right in every locale. Vertical swipes scroll the page; one finger
            // reads the candles and two fingers pinch or pan, never zooming the page.
            style={{ direction: "ltr", touchAction: "pan-y pinch-zoom" }}
          >
            <defs>
              <clipPath id={`${id}-price`}>
                <rect x={0} y={-4} width={innerW} height={priceH + 8} />
              </clipPath>
              <clipPath id={`${id}-vol`}>
                <rect x={0} y={0} width={innerW} height={volH} />
              </clipPath>
            </defs>
            <g aria-hidden transform={`translate(${M.left},${M.top})`}>
              {/* Price grid + axis (right, as traders expect). */}
              {/* Positioned by applyDisplay, so they follow the easing price range. */}
              {ticks.map((tk) => (
                <g
                  key={tk}
                  ref={(el) => {
                    if (!el) return;
                    tickRefs.current.set(tk, el);
                    return () => {
                      tickRefs.current.delete(tk);
                    };
                  }}
                >
                  <line x2={innerW} stroke="var(--sheen-chart-grid)" />
                  <text x={innerW + 8} dy="0.32em" className="fill-sheen-fg-muted text-2xs tabular-nums">
                    {priceFormat(tk)}
                  </text>
                </g>
              ))}
              {showVolume && (
                <line
                  x1={0}
                  x2={innerW}
                  y1={priceH + gap + volH}
                  y2={priceH + gap + volH}
                  stroke="var(--sheen-border)"
                />
              )}
              {/* Last price: a dashed level across the plot (placed by applyDisplay). */}
              {lastCandle && (
                <g ref={lastLineRef}>
                  <line
                    x1={0}
                    x2={innerW}
                    stroke={lastColor}
                    strokeOpacity={0.7}
                    strokeDasharray="3 3"
                    className="forced-color-adjust-none"
                  />
                </g>
              )}

              <g ref={marksRef} className="forced-color-adjust-none">
                <g clipPath={`url(#${id}-price)`}>
                  {/* Drawn on the target view and range; applyDisplay maps this layer onto the screen. */}
                  <g ref={priceLayerRef}>
                    {/* Every candle (memoised), stepping back while one is read… */}
                    <g
                      className="motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)"
                      style={{ opacity: act !== null ? 0.55 : 1 }}
                    >
                      {candleMarks}
                    </g>
                    {/* …and the one being read, redrawn on top at full strength with a soft glow (dark theme). */}
                    {activeParsed && act !== null && (
                      <g pointerEvents="none" style={{ filter: markGlow(colorOf(activeParsed), 6) }}>
                        {drawCandle(activeParsed, act)}
                      </g>
                    )}
                    {maPath && drawn && (
                      <motion.path
                        d={maPath}
                        fill="none"
                        stroke={maColor}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        initial={reduced ? false : { pathLength: 0 }}
                        animate={{ pathLength: play ? 1 : 0 }}
                        transition={{
                          pathLength: {
                            duration: reduced ? 0 : duration.slower * 1.4,
                            ease: ease.out,
                            delay: reduced ? 0 : 0.35,
                          },
                        }}
                        // A soft glow in the dark theme only, and never while the view moves (no re-blur per frame).
                        style={{
                          filter:
                            dark && !moving
                              ? `drop-shadow(0 0 4px color-mix(in oklab, ${maColor} 45%, transparent))`
                              : undefined,
                        }}
                      />
                    )}
                  </g>
                </g>

                {showVolume && (
                  <g transform={`translate(0,${priceH + gap})`} clipPath={`url(#${id}-vol)`}>
                    <g ref={volumeLayerRef}>
                      {volumeMarks}
                      {activeVolume && <path pointerEvents="none" d={activeVolume.d} fill={activeVolume.fill} />}
                    </g>
                  </g>
                )}
              </g>

              {/* Volume scale, haloed so it reads over the bars. */}
              {showVolume && (
                <text
                  x={4}
                  y={priceH + gap + 11}
                  className="fill-sheen-fg-muted text-2xs"
                  stroke="var(--sheen-chart-surface)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                >
                  {t.volumeShort} {volumeFormat(tV)}
                </text>
              )}

              {/* Date axis: every k-th candle, sliding with the candles. Labels under the
                  crosshair's date tag step aside, so the two never overprint. */}
              <g ref={dateAxisRef}>
                {visible.map((c, k) => {
                  const i = first + k;
                  if (i % every !== 0) return null;
                  const px = x(i);
                  if (px < 12 || px > innerW - 12) return null;
                  if (dateTagX !== null) {
                    const w = dates.axis.format(c.date).length * AXIS_CH;
                    if (Math.abs(px - dateTagX) < (w + dateW) / 2 + 4) return null;
                  }
                  return (
                    <text
                      key={i}
                      x={px}
                      y={priceH + gap + volH + 18}
                      textAnchor="middle"
                      className="fill-sheen-fg-muted text-2xs"
                      // While a zoom glides the axis is scaled sideways: the text is scaled back.
                      style={{
                        transform: "scaleX(var(--inv-x, 1))",
                        transformBox: "fill-box",
                        transformOrigin: "center",
                      }}
                    >
                      {dates.axis.format(c.date)}
                    </text>
                  );
                })}
              </g>

              {/* Last price tag on the axis, in the direction's colour with ink-coloured text. */}
              {lastCandle && (
                <g ref={lastPillRef} style={{ opacity: lastTagHidden ? 0 : 1 }}>
                  <rect
                    width={M.right - 4}
                    height={pillH}
                    rx={5}
                    fill="var(--sheen-chart-surface)"
                    stroke={lastColor}
                    strokeWidth={1.5}
                    className="forced-color-adjust-none"
                  />
                  <text x={6} y={pillH / 2} dy="0.34em" className="fill-sheen-fg text-2xs font-semibold tabular-nums">
                    {priceFormat(lastCandle.c)}
                  </text>
                </g>
              )}

              {act !== null && (
                <Crosshair
                  x={x(act)}
                  priceH={priceH}
                  gap={gap}
                  volH={volH}
                  innerW={innerW}
                  tagW={M.right - 4}
                  crossPy={crossPy}
                  crossPrice={crossPrice}
                  priceText={priceFormat}
                  dateTagLeft={dateTagLeft}
                  dateW={dateW}
                  dateText={dateText}
                />
              )}

              {/* Hit area over both panels: scrub, drag to pan, pinch to zoom (vertical swipes still scroll). */}
              <rect
                width={innerW}
                height={priceH + gap + volH}
                fill="transparent"
                className={zoom && zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                onPointerLeave={(e) => {
                  if (e.pointerType !== "mouse" || gesture.current) return;
                  setActive(null);
                  setCrossY(null);
                }}
              />
            </g>
          </ChartFigure>
        )}
        {hint && zoom && (
          <p
            aria-hidden
            className={cn(
              solidOverlayClass,
              "pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sheen-full px-3.5 py-2 text-xs font-medium whitespace-nowrap",
            )}
          >
            {t.zoomHint(platform === "mac" ? "⌘" : "Ctrl")}
          </p>
        )}
      </div>
      <ChartAnnouncer text={announce(announceText)} />
    </div>
  );
}
