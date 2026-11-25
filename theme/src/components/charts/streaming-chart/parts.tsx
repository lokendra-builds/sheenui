"use client";

import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";

import { cn } from "../../../lib/cn";
import { useControllable } from "../../../hooks/use-controllable";
import { useSyncRef } from "../../../hooks/use-latest";
import { PauseIcon, PlayIcon } from "../chart-icons";
import { duration, ease } from "../../../motion/tokens";
import { useSheenReducedMotion } from "../../../hooks/use-preferences";
import { Button } from "../../button/button";
import { ChartAnnouncer, ChartEmpty, LegendKey, type TooltipRow } from "../chart-parts";
import { FittedTooltip, useDockedReadout, useInputSource } from "../chart-fit";
import {
  axisFormat,
  chartFocusClass,
  clamp,
  linear,
  niceTicks,
  num,
  seriesColor,
  useElementWidth,
  type ChartRow,
  ORIGIN_PT,
  resolveInstructions,
  itemAt,
} from "../chart-utils";
import { ChartValueTable, defaultCompact, useEntrance } from "../heatmap";
import { safeDateFormat, solidTipsScope, useTableRows } from "../category-bar";
import { curvePath, monotoneTangents, type Pt } from "../streamgraph";
import { ChartFigure } from "../chart-figure";
import {
  defaultStreamingChartLabels,
  type StreamingChartProps,
  STEPS,
  CHAR_W,
  TIME_OPTIONS,
  isolate,
  type Line,
  curveAt,
  RollingValue,
  Tick,
} from "./model";

/**
 * One time label on the sliding axis. It fades out as it nears either edge, finishing before any of it would be cut off,
 * so the axis never shows half a label ("AM", "12:00:0"): opacity follows how far the whole label sits inside the plot.
 */
function TimeLabel({
  at,
  slide,
  half,
  plotW,
  y,
  children,
}: {
  at: number;
  slide: MotionValue<number>;
  half: number;
  plotW: number;
  y: number;
  children: string;
}) {
  const opacity = useTransform(slide, (s) => {
    const centre = at + s;
    const room = Math.min(centre - half, plotW - centre - half);
    return Math.max(0, Math.min(1, room / 20));
  });
  return (
    <motion.text
      x={at}
      y={y}
      textAnchor="middle"
      style={{ opacity }}
      className="fill-sheen-fg-muted text-2xs tabular-nums"
    >
      {children}
    </motion.text>
  );
}

/** The streaming chart props plus visibility and the root ref. @internal */
export type BodyProps = StreamingChartProps & { visible: boolean; rootRef: RefObject<HTMLDivElement | null> };

/** The chart body that draws the lines, axes and live readout. @internal */
export const StreamingBody = memo(function StreamingBody({
  data,
  index = "time",
  series,
  rate = 1000,
  window: windowSize = 60,
  paused: pausedProp,
  defaultPaused = false,
  onPausedChange,
  area = true,
  zero = false,
  height = 240,
  format: formatProp,
  formatTime,
  locale,
  timeZone,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  visible,
  rootRef,
}: BodyProps) {
  const t = { ...defaultStreamingChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const tickFormat = axisFormat(formatProp);
  const id = useId();
  const reduced = useSheenReducedMotion();
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const docked = useDockedReadout(width);
  const { fromKeyboard, fromPointer, announce } = useInputSource();

  const [paused, setPaused] = useControllable(pausedProp, defaultPaused, onPausedChange);
  const [active, setActive] = useState<number | null>(null); // timestamp of the sample being read
  const holding = active !== null;
  const frozen = paused || holding;

  const timeFormat = useMemo(() => {
    if (formatTime) return formatTime;
    const f = safeDateFormat(locale, { ...TIME_OPTIONS, timeZone });
    return (d: Date) => f.format(d);
  }, [formatTime, locale, timeZone]);

  const lines = useMemo(() => series.slice(0, 4), [series]);
  const samples = useMemo(
    () =>
      data
        .map((row) => ({ time: num(row[index]), row }))
        .filter((s) => s.time > 0)
        .sort((a, b) => a.time - b.time),
    [data, index],
  );
  const count = samples.length;
  const tLast = samples[count - 1]?.time ?? 0;
  const span = Math.max(1, windowSize) * rate;

  // The view's end time is kept in a ref by the frame loop. When the view freezes (paused, or a
  // value being read), the end time at that moment is kept in state, so the frozen view, the
  // crosshair and the keyboard all use the same, stable end.
  const display = useMotionValue(0);
  const viewEndNow = () => (reduced || display.get() === 0 ? tLast : display.get());
  const [frozenEnd, setFrozenEnd] = useState<number | null>(null);
  // Adjusted while rendering (the live clock is a MotionValue, readable here): no effect round-trip.
  if (frozen && frozenEnd === null) setFrozenEnd(viewEndNow());
  else if (!frozen && frozenEnd !== null) setFrozenEnd(null);
  const end = frozen ? (frozenEnd ?? tLast) : tLast;

  // Samples in view (plus a margin, so lines run off the edges) set the value axis.
  const { ticks, tLo, tHi } = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const s of samples) {
      if (s.time < end - span - rate * 2 || s.time > end + rate) continue;
      for (const l of lines) {
        const v = num(s.row[l.key]);
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    if (!Number.isFinite(lo)) [lo, hi] = [0, 1];
    if (zero) [lo, hi] = [Math.min(0, lo), Math.max(0, hi)];
    const tk = niceTicks(lo, hi, height >= 220 ? 4 : 3);
    return { ticks: tk, tLo: tk[0] ?? 0, tHi: tk[tk.length - 1] ?? 0 };
  }, [samples, lines, end, span, rate, zero, height]);

  const widestTick = Math.max(...ticks.map((v) => tickFormat(v).length), 1);
  const M = { top: 12, bottom: 26, left: clamp(Math.ceil(widestTick * CHAR_W) + 18, 36, 88), right: 14 };
  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = Math.max(0, height - M.top - M.bottom);
  // Marks are drawn on the TARGET value axis; while the axis eases, a transform maps them onto it.
  const y = useMemo(() => linear(tLo, tHi, innerH, 0), [tLo, tHi, innerH]);
  // x in the sliding layer: the newest sample sits at 0, older ones to the left.
  const xRel = (time: number) => ((time - tLast) / span) * innerW;

  const drawFrom = Math.min(end, tLast) - span - rate * 3;
  const geometry: Line[] = useMemo(() => {
    const drawn = samples.filter((s) => s.time >= drawFrom);
    return lines.map((l, i) => {
      const pts: Pt[] = drawn.map((s) => [((s.time - tLast) / span) * innerW, y(num(s.row[l.key]))]);
      return { key: l.key, color: seriesColor(l, i), pts, tangents: monotoneTangents(pts) };
    });
  }, [samples, drawFrom, lines, tLast, span, innerW, y]);
  const paths = useMemo(() => geometry.map((g) => (g.pts.length > 1 ? curvePath(g.pts) : "")), [geometry]);

  // Time labels on round times (every 5 s, 10 s, 1 min…), sliding with the line.
  // Sized from the widest time this format can print, never from the newest sample: the label width flipping by a character at 9:59:59 -> 10:00:00 changed the label step, which swapped the whole label grid for another one in a single frame.
  const labelW =
    Math.max(
      timeFormat(new Date(2000, 0, 1, 23, 59, 59)).length,
      timeFormat(new Date(2000, 0, 1, 10, 38, 38)).length,
      timeFormat(new Date(2000, 0, 1, 0, 0, 0)).length,
    ) *
      CHAR_W +
    18;
  const labelStep = STEPS.find((s) => (s / span) * innerW >= labelW) ?? STEPS[STEPS.length - 1] ?? 0;
  const labelTimes: number[] = [];
  for (
    let tt = Math.ceil((tLast - span - rate * 3) / labelStep) * labelStep;
    tt <= tLast + rate * 2 && labelTimes.length < 60;
    tt += labelStep
  )
    labelTimes.push(tt);

  /* ---------- The value axis: two MotionValues easing to the target ---------- */

  const domLo = useMotionValue(tLo);
  const domHi = useMotionValue(tHi);
  const sized = width > 0;
  useEffect(() => {
    if (reduced || !sized) {
      domLo.jump(tLo);
      domHi.jump(tHi);
      return;
    }
    const opts = { duration: duration.slow, ease: ease.out };
    const a = animate(domLo, tLo, opts);
    const b = animate(domHi, tHi, opts);
    return () => {
      a.stop();
      b.stop();
    };
  }, [tLo, tHi, reduced, sized, domLo, domHi]);

  /* ---------- The frame loop: slide the layer, ride the head ---------- */

  const slide = useMotionValue(innerW);
  const heads = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)] as const;
  const headX = useMotionValue(innerW);
  const affineRef = useRef<SVGGElement>(null);
  const arrival = useRef({ time: 0, perf: 0 });
  const live = useRef({ geometry, tLast, span, innerW, innerH, rate, tLo, tHi });
  const lastAffine = useRef("");

  // Where the view's end time is drawn: the layer's offset, its value-axis transform, and the head on each line.
  const [place] = useState(() => (viewEnd: number) => {
    const g = live.current;
    const cLo = domLo.get();
    const cHi = domHi.get();
    const k = (g.tHi - g.tLo) / Math.max(1e-9, cHi - cLo);
    const b = (g.innerH * (cHi - g.tHi)) / Math.max(1e-9, cHi - cLo);
    const affine =
      Math.abs(k - 1) < 1e-4 && Math.abs(b) < 0.01 ? "" : `translate(0 ${b.toFixed(2)}) scale(1 ${k.toFixed(5)})`;
    if (affine !== lastAffine.current && affineRef.current) {
      lastAffine.current = affine;
      if (affine) affineRef.current.setAttribute("transform", affine);
      else affineRef.current.removeAttribute("transform");
    }
    const offset = g.innerW - ((viewEnd - g.tLast) / g.span) * g.innerW;
    slide.set(offset);
    // The head rides the line at the right edge, or sits on the newest sample once the data stops.
    const headAt = Math.min(g.innerW - offset, 0);
    headX.set(offset + headAt);
    g.geometry.forEach((line, i) => {
      const yv = curveAt(line, headAt);
      if (yv !== null) heads[i]?.set(k * yv + b);
    });
  });
  const currentEnd = () => (frozen ? (frozenEnd ?? display.get()) : reduced ? tLast : display.get());
  const endRef = useRef(currentEnd);
  useSyncRef(endRef, currentEnd);

  useLayoutEffect(() => {
    if (tLast !== arrival.current.time) arrival.current = { time: tLast, perf: performance.now() };
    live.current = { geometry, tLast, span, innerW, innerH, rate, tLo, tHi };
    if (display.get() === 0) display.set(tLast - rate);
    // Reduced motion: no trailing, no sliding; the newest sample sits at the edge.
    place(currentEnd());
  });
  // The value axis eases on its own clock: keep the layer and heads on it between samples.
  useEffect(() => {
    const update = () => place(endRef.current());
    const offLo = domLo.on("change", update);
    const offHi = domHi.on("change", update);
    return () => {
      offLo();
      offHi();
    };
  }, [domLo, domHi, place]);

  const looping = !reduced && !frozen && visible && sized && count > 0;
  useEffect(() => {
    if (!looping) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const g = live.current;
      // The data's own clock: the newest sample's time plus the time since it arrived, minus one interval.
      const target = arrival.current.time + (now - arrival.current.perf) - g.rate;
      // Ease towards the target (a glide after a pause, steady tracking otherwise).
      const gap = target - display.get();
      display.set(Math.abs(gap) > g.span ? target : display.get() + gap * (1 - Math.exp(-dt / 120)));
      place(display.get());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [looping, place, display]);

  if (count === 0) {
    return (
      <div ref={measureRef} className="w-full">
        <ChartEmpty height={height + 44} aria-label={ariaLabel}>
          {emptyState ?? t.waiting}
        </ChartEmpty>
      </div>
    );
  }

  /* ---------- Reading values ---------- */

  const activeSample = active !== null ? samples.find((s) => s.time === active) : undefined;
  // Tooltip values are isolated (they may sit in right-to-left text); the announcement is plain.
  const readRows = (row: ChartRow, iso = true): TooltipRow[] =>
    lines.map((l, i) => {
      const value = format(num(row[l.key]));
      return { label: l.label, value: iso ? isolate(value) : value, color: seriesColor(l, i), kind: "line" as const };
    });
  const announceText = activeSample
    ? `${timeFormat(new Date(activeSample.time))}: ${readRows(activeSample.row, false)
        .map((r) => `${r.label} ${r.value}`)
        .join(", ")}`
    : "";

  // Newest sample at or before the view's end: the header's "latest" values.
  let latest = itemAt(samples, count - 1);
  for (let i = count - 1; i >= 0; i--) {
    if (itemAt(samples, i).time <= end) {
      latest = itemAt(samples, i);
      break;
    }
  }

  // The samples on screen right now: read from the end that is actually drawn, so the first
  // key press or touch never lands on a point outside the view.
  const onScreen = (viewEnd: number) => samples.filter((s) => s.time >= viewEnd - span && s.time <= viewEnd);
  // Reading freezes the view where it is drawn, in the same render as the first value.
  const pick = (time: number | null, viewEnd?: number) => {
    if (time !== null && !frozen && viewEnd !== undefined) setFrozenEnd(viewEnd);
    setActive(time);
  };
  function onPointer(e: React.PointerEvent<SVGRectElement>) {
    fromPointer();
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const viewEnd = currentEnd();
    const time = viewEnd - ((innerW - px) / Math.max(1, innerW)) * span;
    const list = onScreen(viewEnd);
    let best = list[0] ?? latest;
    for (const s of list) if (Math.abs(s.time - time) < Math.abs(best.time - time)) best = s;
    pick(best.time, viewEnd);
  }
  function onKeyDown(e: React.KeyboardEvent) {
    fromKeyboard();
    if ((e.key === " " || e.key === "k") && !e.repeat) {
      e.preventDefault();
      setPaused(!paused);
      return;
    }
    const viewEnd = currentEnd();
    const visibleNow = onScreen(viewEnd);
    const list = visibleNow.length ? visibleNow : [latest];
    const at = activeSample ? list.findIndex((s) => s.time === activeSample.time) : -1;
    let next: number | null | undefined;
    if (e.key === "ArrowLeft") next = list[at < 0 ? list.length - 1 : Math.max(0, at - 1)]?.time;
    else if (e.key === "ArrowRight") next = list[at < 0 ? list.length - 1 : Math.min(list.length - 1, at + 1)]?.time;
    else if (e.key === "Home") next = list[0]?.time;
    else if (e.key === "End") next = list[list.length - 1]?.time;
    else if (e.key === "Escape" && active !== null) next = null;
    if (next === undefined) return;
    e.preventDefault();
    pick(next, viewEnd);
  }

  const status = paused ? t.paused : holding ? t.holding : t.live;
  // While reading, the view is frozen at `end`, so the sample's x is fixed.
  const activeX = activeSample ? innerW - ((end - activeSample.time) / span) * innerW : 0;
  const fade = Math.min(0.5, 40 / Math.max(1, innerW));

  return (
    <>
      {/* Status, latest values (they double as the legend), and the pause control. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className={cn(
            "inline-flex h-6 items-center gap-1.5 rounded-sheen-full px-2.5 text-xs font-medium",
            frozen ? "bg-sheen-hover text-sheen-fg-muted" : "bg-sheen-success-soft text-sheen-success-text",
          )}
        >
          <span aria-hidden className="relative flex size-2">
            {!frozen && visible && (
              <span className="absolute inset-0 rounded-full bg-sheen-success motion-ok:animate-ping" />
            )}
            <span className={cn("relative size-2 rounded-full", frozen ? "bg-sheen-fg-subtle" : "bg-sheen-success")} />
          </span>
          {status}
        </span>
        <ul aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {lines.map((l, i) => (
            <li key={l.key} className="flex items-center gap-1.5 whitespace-nowrap">
              <LegendKey color={seriesColor(l, i)} kind="line" />
              <span className="text-sheen-fg-muted">{l.label}</span>
              <span className="min-w-[4ch] text-sm font-semibold text-sheen-fg tabular-nums">
                <RollingValue value={num(latest.row[l.key])} format={format} reduced={reduced} />
              </span>
            </li>
          ))}
        </ul>
        <Button
          variant="ghost"
          size="sm"
          className="ms-auto border border-sheen-control-border any-pointer-coarse:h-11"
          aria-label={paused ? t.resume : t.pause}
          leading={paused ? <PlayIcon /> : <PauseIcon />}
          onClick={() => setPaused(!paused)}
        >
          {paused ? t.resume : t.pause}
        </Button>
      </div>

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
            onBlur={() => pick(null)}
            className={cn("rounded-sheen-sm", chartFocusClass)}
            // Time runs left to right in every locale; horizontal drags scrub (vertical swipes scroll).
            style={{ direction: "ltr", touchAction: "pan-y pinch-zoom" }}
          >
            <defs>
              <clipPath id={`${id}-clip`}>
                <rect x={0} y={-8} width={innerW} height={innerH + 36} />
              </clipPath>
              {/* Luminance masks (white = shown): older values fade out at the left edge as they slide away… */}
              <linearGradient id={`${id}-fade`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" style={{ stopColor: "var(--sheen-ink-0)" }} stopOpacity={0} />
                <stop offset={fade} style={{ stopColor: "var(--sheen-ink-0)" }} stopOpacity={1} />
              </linearGradient>
              <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={0} y={-8} width={innerW + 8} height={innerH + 36}>
                <rect x={0} y={-8} width={innerW + 8} height={innerH + 36} fill={`url(#${id}-fade)`} />
              </mask>
              {geometry.map((g, i) => (
                <linearGradient
                  key={g.key}
                  id={`${id}-a${i}`}
                  gradientUnits="userSpaceOnUse"
                  x1={0}
                  x2={0}
                  y1={0}
                  y2={innerH}
                >
                  <stop offset="0" stopColor={g.color} stopOpacity={lines.length > 1 ? 0.16 : 0.26} />
                  <stop offset="1" stopColor={g.color} stopOpacity={0} />
                </linearGradient>
              ))}
              {/* The head's glow: a pre-blurred halo (dark theme only), so the moving dot needs no filter. */}
              {geometry.map((g, i) => (
                <radialGradient key={g.key} id={`${id}-h${i}`}>
                  <stop
                    offset="0"
                    style={{ stopColor: `light-dark(transparent, color-mix(in oklab, ${g.color} 60%, transparent))` }}
                  />
                  <stop offset="1" stopColor="transparent" />
                </radialGradient>
              ))}
            </defs>
            <g aria-hidden transform={`translate(${M.left},${M.top})`}>
              {ticks.map((tk) => (
                <Tick
                  key={tk}
                  value={tk}
                  label={tickFormat(tk)}
                  innerW={innerW}
                  innerH={innerH}
                  lo={domLo}
                  hi={domHi}
                />
              ))}

              <g clipPath={`url(#${id}-clip)`} mask={`url(#${id}-mask)`}>
                {/* The sliding layer: one transform per frame. */}
                <motion.g style={{ x: slide }} className="forced-color-adjust-none">
                  {labelTimes.map((tt) => (
                    <line
                      key={tt}
                      x1={xRel(tt)}
                      x2={xRel(tt)}
                      y1={0}
                      y2={innerH}
                      stroke="var(--sheen-chart-grid)"
                      strokeDasharray="2 4"
                    />
                  ))}
                  {/* Lines on the target value axis; this group's transform eases them onto the drawn one. */}
                  <g ref={affineRef}>
                    {area &&
                      geometry.map((g, i) =>
                        g.pts.length > 1 ? (
                          <path
                            key={`a-${g.key}`}
                            // Closed well below the plot (the fill has faded out by then), so it never shows an edge while the axis eases.
                            d={`${paths[i]} L${(g.pts[g.pts.length - 1] ?? ORIGIN_PT)[0].toFixed(1)},${innerH * 3} L${(g.pts[0] ?? ORIGIN_PT)[0].toFixed(1)},${innerH * 3} Z`}
                            fill={`url(#${id}-a${i})`}
                            className="motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-slower) motion-ok:delay-300"
                            style={{ opacity: play ? 1 : 0 }}
                          />
                        ) : null,
                      )}
                    {geometry.map((g, i) =>
                      g.pts.length > 1 ? (
                        <motion.path
                          key={`l-${g.key}`}
                          d={paths[i]}
                          fill="none"
                          stroke={g.color}
                          strokeWidth={2}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          initial={reduced ? false : { pathLength: 0 }}
                          animate={{ pathLength: play ? 1 : 0 }}
                          transition={{ pathLength: { duration: reduced ? 0 : duration.slower * 1.6, ease: ease.out } }}
                        />
                      ) : (
                        <circle
                          key={`p-${g.key}`}
                          cx={g.pts[0]?.[0] ?? 0}
                          cy={g.pts[0]?.[1] ?? 0}
                          r={4}
                          fill={g.color}
                          stroke="var(--sheen-chart-surface)"
                          strokeWidth={2}
                        />
                      ),
                    )}
                  </g>
                </motion.g>
              </g>

              <g>
                <motion.g style={{ x: slide }}>
                  {labelTimes.map((tt) => (
                    <TimeLabel
                      key={tt}
                      at={xRel(tt)}
                      slide={slide}
                      half={(labelW - 18) / 2}
                      plotW={innerW}
                      y={innerH + 18}
                    >
                      {timeFormat(new Date(tt))}
                    </TimeLabel>
                  ))}
                </motion.g>
              </g>

              {/* Head: a dot riding each line at the edge, with a soft pulse while live. It lands
                  once the lines have drawn in. */}
              <g
                className="forced-color-adjust-none motion-ok:transition-opacity motion-ok:delay-700 motion-ok:duration-(--sheen-duration-base)"
                style={{ opacity: play ? 1 : 0 }}
                pointerEvents="none"
              >
                {geometry.map((g, i) => (
                  <Head
                    key={g.key}
                    x={headX}
                    y={itemAt(heads, i)}
                    color={g.color}
                    halo={`url(#${id}-h${i})`}
                    pulse={!frozen && !reduced && visible}
                  />
                ))}
              </g>

              {/* Crosshair while reading. */}
              {activeSample && (
                <g pointerEvents="none">
                  <line x1={activeX} x2={activeX} y1={0} y2={innerH} stroke="var(--sheen-fg-subtle)" />
                  {lines.map((l, i) => (
                    <g
                      key={l.key}
                      transform={`translate(${activeX},${y(num(activeSample.row[l.key]))})`}
                      className="forced-color-adjust-none"
                    >
                      <circle r={11} fill={`url(#${id}-h${i})`} />
                      <circle r={4.5} fill={seriesColor(l, i)} stroke="var(--sheen-chart-surface)" strokeWidth={2} />
                    </g>
                  ))}
                </g>
              )}

              <rect
                width={innerW}
                height={innerH}
                fill="transparent"
                onPointerDown={onPointer}
                onPointerMove={onPointer}
                onPointerLeave={(e) => e.pointerType === "mouse" && pick(null)}
              />
            </g>
          </ChartFigure>
        )}
        {activeSample && (
          <FittedTooltip
            title={isolate(timeFormat(new Date(activeSample.time)))}
            rows={readRows(activeSample.row)}
            x={M.left + activeX}
            y={M.top + innerH / 2}
            containerWidth={width}
            docked={docked}
          />
        )}
      </div>
      <ChartAnnouncer text={announce(announceText)} />
    </>
  );
});

/** The live head of a line: a ringed dot on a soft halo, positioned by motion values (a transform). */
export function Head({
  x,
  y,
  color,
  halo,
  pulse,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  color: string;
  halo: string;
  pulse: boolean;
}) {
  return (
    <motion.g style={{ x, y }}>
      <circle r={11} fill={halo} />
      {pulse && (
        <circle
          r={4}
          fill={color}
          opacity={0.5}
          className="motion-ok:animate-ping [transform-box:fill-box] [transform-origin:center]"
        />
      )}
      <circle r={4.5} fill={color} stroke="var(--sheen-chart-surface)" strokeWidth={2} />
    </motion.g>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of StreamingTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type StreamingTableProps = Pick<
  StreamingChartProps,
  "data" | "index" | "series" | "format" | "formatTime" | "locale" | "timeZone" | "labels"
> & {
  /** Limits the rows shown, newest first. Default 20. */
  limit?: number;
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
};

/**
 * The latest samples, newest first: time and each series' value.
 *
 * Props: the chart's `data`, `index`, `series`, `format`, `formatTime`, `locale`, `timeZone` and `labels`, plus `limit` (how many of the latest rows to list; default 20) and `caption` (hidden, names the table). A real table, newest first: time and each series' value. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { StreamingTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <StreamingTable data={[{ time: 1_700_000_000_000, value: 42 }]} index="time" series={[{ key: "value", label: "CPU load" }]} caption="CPU load samples" />
 *   );
 * }
 * ```
 *
 * @see /charts/realtime-chart
 */
export function StreamingTable({
  data,
  index = "time",
  series,
  format: formatProp,
  formatTime,
  locale,
  timeZone,
  labels: labelOverrides,
  limit = 20,
  caption,
}: StreamingTableProps) {
  const t = { ...defaultStreamingChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const tf = useMemo(() => safeDateFormat(locale, { ...TIME_OPTIONS, timeZone }), [locale, timeZone]);
  const latest = useMemo(() => data.slice(-limit).reverse(), [data, limit]);
  const { rows } = useTableRows(latest, { cap: limit });
  const lines = series.slice(0, 4);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={t.waiting}
      columns={[
        { label: t.time },
        ...lines.map((l, i) => ({
          label: (
            <span className="inline-flex items-center gap-1.5">
              <LegendKey color={seriesColor(l, i)} kind="line" />
              {l.label}
            </span>
          ),
        })),
      ]}
      rows={rows.map((row) => {
        const d = new Date(num(row[index]));
        return [
          <bdi key="t">{formatTime ? formatTime(d) : tf.format(d)}</bdi>,
          ...lines.map((l) => <bdi key={l.key}>{format(num(row[l.key]))}</bdi>),
        ];
      })}
    />
  );
}
