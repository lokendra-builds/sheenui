"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

import { cn } from "../lib/cn";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { areaPath, chartSpring, clamp, extent, fadeColor, linePath, useElementWidth } from "./chart-utils";

/**
 * A range selector (brush) for long time series: a miniature of the whole series with a
 * window over it. Drag the window to pan, drag its edges to zoom, tap outside it to jump.
 * The two edges are sliders (WAI-ARIA multi-thumb): arrows move one step, Page Up / Page Down
 * ten percent, Home / End to the ends, and Shift + arrows pan the whole window.
 *
 * Smooth and cheap: while you drag, the window follows the pointer through MotionValues
 * (transforms only, no React renders); the chart above re-renders only when the selected
 * range changes by a whole step. On release the window snaps to the nearest steps.
 */

export type ChartBrushRange = readonly [start: number, end: number];

/** Translatable text of ChartBrush (the two handles and the window between them). */
export type ChartBrushLabels = {
  /** Name of the whole control. */
  group: string;
  start: string;
  end: string;
  /** Spoken value of an edge: the row's label. */
  value: (label: string) => string;
};

/**
 * The built-in English strings of ChartBrush; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultChartBrushLabels: ChartBrushLabels = {
  group: "Visible range",
  start: "Start of range",
  end: "End of range",
  value: (label) => label,
};

/**
 * Props of ChartBrush: the row count, how to label a row, the selected range and its change handler,
 * plus optional sizing and `labels`.
 */
export type ChartBrushProps = {
  /** Sets the number of rows in the full series. */
  count: number;
  /** Label of row i (e.g. "Mar 4"), read out by screen readers. */
  labelOf: (i: number) => string;
  /** The values drawn in the miniature (one series, all rows). */
  values?: readonly number[];
  /** Selected rows, inclusive [start, end]. */
  range: ChartBrushRange;
  /** Called with the selected window as `[start, end]` (inclusive row indexes) while the handles move. */
  onRangeChange: (range: ChartBrushRange) => void;
  /** True while a drag is in progress (charts skip their tweens while scrubbing). */
  onScrubChange?: (scrubbing: boolean) => void;
  /** Fewest rows the window can show. Default 2. */
  minSpan?: number;
  /** Height of the chart in px; the width follows the container. Default 44. */
  height?: number;
  /** Sets the colour used for the miniature chart. Default the first chart colour. */
  color?: string;
  /** Overrides for the brush's built-in English strings. */
  labels?: Partial<ChartBrushLabels>;
  className?: string;
};

/** A sensible starting window: the last `fraction` of `count` rows (at least `minSpan`). */
export function defaultBrushRange(count: number, fraction = 1, minSpan = 2): ChartBrushRange {
  if (count <= 1) return [0, Math.max(0, count - 1)];
  const span = clamp(Math.round(count * fraction), Math.min(minSpan, count), count);
  return [count - span, count - 1];
}

/** Keep a range inside [0, count - 1] with at least `minSpan` rows. */
export function clampBrushRange([a, b]: ChartBrushRange, count: number, minSpan = 2): ChartBrushRange {
  const last = Math.max(0, count - 1);
  const span = Math.min(Math.max(1, minSpan), count) - 1;
  let start = clamp(Math.round(Math.min(a, b)), 0, last);
  let end = clamp(Math.round(Math.max(a, b)), 0, last);
  if (end - start < span) {
    end = Math.min(last, start + span);
    start = Math.max(0, end - span);
  }
  return [start, end];
}

type Drag = { mode: "start" | "end" | "pan"; x0: number; l0: number; r0: number; id: number };

/**
 * Memoised: the chart above re-renders on every pointer move, the brush only when its range does.
 *
 * Props: `count` (rows in the full series), `labelOf(i)` (row label for screen readers), `values` (the miniature), `range` + `onRangeChange` (controlled [start, end], inclusive), `onScrubChange`, `minSpan` (default 2), `height` (default 44), `color` (default the first chart colour), `labels` and `className`.
 * Keyboard: each handle is a slider. Arrow keys move it one row, Page Up and Page Down move it a tenth of the rows, Home and End jump to the ends. Dragging the window or a handle works with mouse and touch, and a tap on the track re-centres the window. Handles announce their row through `aria-valuetext`.
 * Charts skip their tweens while `onScrubChange(true)`, and reduced motion keeps the window instant.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { ChartBrush, defaultBrushRange } from "@sheenui/theme";
 *
 * const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
 *
 * function Window() {
 *   const [range, setRange] = useState(defaultBrushRange(days.length, 0.5));
 *   return <ChartBrush count={days.length} labelOf={(i) => days[i] ?? ""} values={[3, 5, 4, 8, 6, 9, 7]} range={range} onRangeChange={setRange} />;
 * }
 * ```
 *
 * @see /charts
 */
export const ChartBrush = memo(function ChartBrush({
  count,
  labelOf,
  values,
  range,
  onRangeChange,
  onScrubChange,
  minSpan = 2,
  height = 44,
  color = "var(--sheen-chart-1)",
  labels,
  className,
}: ChartBrushProps) {
  const t = { ...defaultChartBrushLabels, ...labels };
  const id = useId();
  const reduced = useSheenReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const last = Math.max(1, count - 1);
  const step = width / last;
  const [start, end] = clampBrushRange(range, count, minSpan);

  // Window edges in px, written directly while dragging (no re-render per pointer move).
  const left = useMotionValue(start * step);
  const right = useMotionValue(end * step);
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState<Drag["mode"] | null>(null);
  const live = useRef({ start, end, onRangeChange, onScrubChange, step, minSpan, count });
  live.current = { start, end, onRangeChange, onScrubChange, step, minSpan, count };

  // Follow the controlled range when it changes from outside (keyboard, a reset, new data).
  // A resize (new step) jumps; a new range glides.
  const lastStep = useRef(0);
  useEffect(() => {
    if (drag.current || width <= 0) return;
    const toL = start * step;
    const toR = end * step;
    const resized = lastStep.current !== step;
    lastStep.current = step;
    if (reduced || resized) {
      left.jump(toL);
      right.jump(toR);
      return;
    }
    const a = animate(left, toL, chartSpring.snappy);
    const b = animate(right, toR, chartSpring.snappy);
    return () => {
      a.stop();
      b.stop();
    };
  }, [start, end, step, width, reduced, left, right]);

  const shadeL = useTransform(left, (l) => (width > 0 ? clamp(l / width, 0, 1) : 0));
  const shadeR = useTransform(right, (r) => (width > 0 ? clamp((width - r) / width, 0, 1) : 0));
  const windowScale = useTransform([left, right], ([l, r]) =>
    width > 0 ? clamp(((r as number) - (l as number)) / width, 0, 1) : 0,
  );

  const mini = useMemo(() => {
    if (!values || values.length < 2 || width <= 0) return null;
    const [lo, hi] = extent([...values]);
    const span = hi - lo || 1;
    const pts = values.map(
      (v, i) => [(i / (values.length - 1)) * width, 4 + (1 - (v - lo) / span) * (height - 10)] as const,
    );
    return { line: linePath(pts, "monotone"), area: areaPath(pts, height, "monotone") };
  }, [values, width, height]);

  function commit(l: number, r: number) {
    const s = live.current;
    if (s.step <= 0) return;
    const next = clampBrushRange([l / s.step, r / s.step], s.count, s.minSpan);
    if (next[0] !== s.start || next[1] !== s.end) s.onRangeChange(next);
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>, mode: Drag["mode"]) {
    if (event.button !== 0 || width <= 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { mode, x0: event.clientX, l0: left.get(), r0: right.get(), id: event.pointerId };
    setDragging(mode);
    onScrubChange?.(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (d?.id !== event.pointerId) return;
    const dx = event.clientX - d.x0;
    const minPx = Math.max(1, (Math.min(minSpan, count) - 1) * step);
    let l = d.l0;
    let r = d.r0;
    if (d.mode === "pan") {
      const w = d.r0 - d.l0;
      l = clamp(d.l0 + dx, 0, width - w);
      r = l + w;
    } else if (d.mode === "start") {
      l = clamp(d.l0 + dx, 0, d.r0 - minPx);
    } else {
      r = clamp(d.r0 + dx, d.l0 + minPx, width);
    }
    left.set(l);
    right.set(r);
    commit(l, r);
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (d?.id !== event.pointerId) return;
    drag.current = null;
    setDragging(null);
    onScrubChange?.(false);
    // Snap the window onto whole steps.
    const [s, e] = clampBrushRange([left.get() / step, right.get() / step], count, minSpan);
    if (reduced) {
      left.jump(s * step);
      right.jump(e * step);
    } else {
      animate(left, s * step, chartSpring.snappy);
      animate(right, e * step, chartSpring.snappy);
    }
    commit(s * step, e * step);
  }

  // Tap outside the window: centre the window there (same width).
  function onTrackDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || width <= 0 || event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const span = end - start;
    const centre = Math.round(x / step);
    const s = clamp(centre - Math.round(span / 2), 0, Math.max(0, count - 1 - span));
    onRangeChange(clampBrushRange([s, s + span], count, minSpan));
  }

  function onKey(edge: "start" | "end") {
    return (event: React.KeyboardEvent) => {
      const big = Math.max(1, Math.round(count / 10));
      const delta =
        event.key === "ArrowRight" || event.key === "ArrowUp"
          ? 1
          : event.key === "ArrowLeft" || event.key === "ArrowDown"
            ? -1
            : event.key === "PageUp"
              ? big
              : event.key === "PageDown"
                ? -big
                : 0;
      let next: ChartBrushRange;
      if (delta !== 0 && event.shiftKey) {
        // Pan the whole window.
        const span = end - start;
        const s = clamp(start + delta, 0, Math.max(0, count - 1 - span));
        next = [s, s + span];
      } else if (delta !== 0) {
        next =
          edge === "start"
            ? [clamp(start + delta, 0, end - (minSpan - 1)), end]
            : [start, clamp(end + delta, start + (minSpan - 1), count - 1)];
      } else if (event.key === "Home") {
        next = edge === "start" ? [0, end] : [start, Math.min(count - 1, start + Math.max(1, minSpan - 1))];
      } else if (event.key === "End") {
        next = edge === "start" ? [Math.max(0, end - Math.max(1, minSpan - 1)), end] : [start, count - 1];
      } else return;
      event.preventDefault();
      const clamped = clampBrushRange(next, count, minSpan);
      if (clamped[0] !== start || clamped[1] !== end) onRangeChange(clamped);
    };
  }

  const handle = (edge: "start" | "end") => {
    const value = edge === "start" ? start : end;
    return (
      <motion.div
        role="slider"
        tabIndex={0}
        aria-label={edge === "start" ? t.start : t.end}
        aria-valuemin={0}
        aria-valuemax={count - 1}
        aria-valuenow={value}
        aria-valuetext={t.value(labelOf(value))}
        aria-orientation="horizontal"
        data-slot={`chart-brush-${edge}`}
        onKeyDown={onKey(edge)}
        onPointerDown={(e) => onPointerDown(e, edge)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ x: edge === "start" ? left : right }}
        className={cn(
          "group absolute inset-y-0 left-0 z-20 -ms-3 flex w-6 cursor-ew-resize touch-none items-center justify-center outline-none",
          // Touch: a 44px wide grab area.
          "any-pointer-coarse:-ms-5.5 any-pointer-coarse:w-11",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-[62%] min-h-5 w-2.5 items-center justify-center rounded-full border border-sheen-control-border bg-sheen-surface shadow-sm",
            "transition-[scale,border-color] duration-(--sheen-duration-fast) group-hover:border-sheen-accent group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-sheen-focus group-focus-visible:outline-solid",
            dragging === edge && "border-sheen-accent motion-ok:scale-110",
            "forced-colors:border-[CanvasText]",
          )}
        >
          <span className="h-2.5 w-px rounded-full bg-sheen-fg-subtle" />
        </span>
      </motion.div>
    );
  };

  return (
    <div
      ref={ref}
      dir="ltr"
      role="group"
      aria-label={t.group}
      data-slot="chart-brush"
      className={cn("relative w-full touch-pan-y touch-pinch-zoom select-none", className)}
      style={{ height }}
    >
      {/* Track + miniature. Tapping the track (outside the window) moves the window there. */}
      <div
        className="absolute inset-0 overflow-hidden rounded-sheen-sm bg-sheen-hover shadow-[inset_0_0_0_1px_var(--sheen-border)]"
        onPointerDown={onTrackDown}
      >
        {mini && (
          <svg
            aria-hidden
            width={width}
            height={height}
            className="pointer-events-none absolute inset-0 forced-color-adjust-none"
          >
            <defs>
              <linearGradient id={`${id}-mini`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={mini.area} fill={`url(#${id}-mini)`} />
            <path d={mini.line} fill="none" stroke={fadeColor(color, 70)} strokeWidth={1.25} />
          </svg>
        )}
        {/* Outside the window: dimmed. Scaled from their outer edges (transform only). */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full origin-left bg-sheen-surface/70 forced-colors:hidden"
          style={{ scaleX: shadeL }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full origin-right bg-sheen-surface/70 forced-colors:hidden"
          style={{ scaleX: shadeR }}
        />
      </div>
      {/* The window: drag to pan. Scaled to its width; its outline is drawn by the handles + rails. */}
      <motion.div
        aria-hidden
        data-slot="chart-brush-window"
        onPointerDown={(e) => onPointerDown(e, "pan")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "absolute inset-y-0 left-0 z-10 w-full origin-left touch-none",
          dragging === "pan" ? "cursor-grabbing" : "cursor-grab",
          "shadow-[inset_0_1.5px_0_0_var(--sheen-accent),inset_0_-1.5px_0_0_var(--sheen-accent)]",
          "forced-colors:border-y-2 forced-colors:border-[Highlight]",
        )}
        style={{ x: left, scaleX: windowScale, background: fadeColor("var(--sheen-accent)", 10) }}
      />
      {handle("start")}
      {handle("end")}
    </div>
  );
});
