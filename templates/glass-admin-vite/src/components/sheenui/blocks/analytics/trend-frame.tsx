"use client";

import { useRef, useState, type ReactNode, type RefObject } from "react";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { duration, ease, follow } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

import { ChartAnnouncer, ChartTooltip, type TooltipRow } from "../../charts/chart-parts";
import {
  chartFocusClass,
  chartKeyHandler,
  clamp,
  linear,
  niceTicks,
  thinLabels,
  useElementWidth,
  TOOLTIP_DOCK_BELOW,
  useInViewSettled,
} from "../../charts/chart-utils";

import { useLoopPlayback } from "../../motion/gate";
import { ChartFigure } from "../../charts/chart-figure";

/** The spring of the trend charts' hover marker and highlight. */
export const trendSpring = { type: "spring" as const, visualDuration: 0.3, bounce: 0 };

const followPointer = { type: "spring" as const, ...follow.pointer };

/** A point as `[x, y]`. */
export type Pt = readonly [number, number];

/* ---------- Shared frame: geometry, axes and a cheap reading overlay ---------- */

/** The geometry of a chart frame: the ticks and their y positions, the plot area, the x of each point and the y scale. */
export type FrameGeometry = {
  ticks: number[];
  tickY: number[];
  left: number;
  top: number;
  innerW: number;
  innerH: number;
  /** x of each point (band mode: the centre of its slot). */
  xs: number[];
  /** Width of one slot (band mode) or the distance between points. */
  step: number;
  y: (v: number) => number;
  shownLabels: Set<number>;
  band: boolean;
};

/** Computes the frame geometry (ticks, margins and scales) from the labels, the largest value and the size (pure). */
export function frameGeometry(
  labels: string[],
  max: number,
  width: number,
  height: number,
  docked: boolean,
  tickFormat: (n: number) => string,
  band = false,
): FrameGeometry {
  const ticks = niceTicks(0, max > 0 ? max : 1, height < 230 ? 3 : 4);
  const hi = ticks[ticks.length - 1] ?? 1;
  const longest = ticks.reduce((m, tk) => Math.max(m, tickFormat(tk).length), 0);
  const left = Math.max(30, Math.round(longest * 6.6 + 14));
  const top = docked ? 46 : 14;
  const innerW = Math.max(0, width - left - 14);
  const innerH = Math.max(0, height - top - 26);
  const n = labels.length;
  const step = band ? innerW / Math.max(1, n) : n > 1 ? innerW / (n - 1) : innerW;
  const xs = labels.map((_, i) => (band ? (i + 0.5) * step : n <= 1 ? innerW / 2 : i * step));
  const yScale = linear(0, hi, innerH, 0);
  const y = (v: number) => clamp(yScale(Math.max(0, v)), 0, innerH);
  return {
    ticks,
    tickY: ticks.map(y),
    left,
    top,
    innerW,
    innerH,
    xs,
    step,
    y,
    shownLabels: thinLabels(labels, step),
    band,
  };
}

/** Grid lines, y ticks (they glide when the scale changes) and thinned x labels. */
export function FrameAxes({
  geo,
  labels,
  structure,
  morph,
  tickFormat,
}: {
  geo: FrameGeometry;
  labels: string[];
  structure: string;
  morph: object;
  tickFormat: (n: number) => string;
}) {
  const { ticks, tickY, innerW, innerH, xs, shownLabels, band } = geo;
  const n = labels.length;
  return (
    <>
      <AnimatePresence initial={false}>
        {ticks.map((tk, i) => (
          <motion.g
            key={tk}
            initial={{ opacity: 0, y: tickY[i] }}
            animate={{ opacity: 1, y: tickY[i] }}
            exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
            transition={{ y: morph, opacity: { duration: duration.base } }}
          >
            <line x2={innerW} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} strokeWidth={1} />
            <text x={-10} dy="0.32em" textAnchor="end" className="fill-sheen-fg-muted text-2xs tabular-nums">
              {tickFormat(tk)}
            </text>
          </motion.g>
        ))}
      </AnimatePresence>
      {labels.map((label, i) =>
        shownLabels.has(i) ? (
          <text
            key={`${structure}-${i}`}
            x={xs[i]}
            y={innerH + 18}
            textAnchor={band || n <= 1 ? "middle" : i === n - 1 ? "end" : i === 0 ? "start" : "middle"}
            className="fill-sheen-fg-muted text-2xs"
          >
            {label}
          </text>
        ) : null,
      )}
    </>
  );
}

type ChartReaderProps = {
  width: number;
  height: number;
  geo: FrameGeometry;
  docked: boolean;
  items: { label: string; long?: string }[];
  /** The plotted layers, memoised by the caller: reading a point never re-renders them. */
  layers: ReactNode;
  /** Marks for the point being read, drawn at x = 0 (the overlay moves to the point). */
  marks: (i: number) => ReactNode;
  rows: (i: number) => TooltipRow[];
  reduced: boolean;
  svgRef: RefObject<SVGSVGElement | null>;
  ariaLabel: string;
  instructions: string;
  touchHint: string;
};

/**
 * The interactive part of a dashboard chart: the focusable SVG, pointer / touch / keyboard
 * reading, the crosshair (gliding on the pointer spring), the glass tooltip (docked on phones)
 * and the announcer. Only this re-renders while a point is read.
 */
export function ChartReader({
  width,
  height,
  geo,
  docked,
  items,
  layers,
  marks,
  rows,
  reduced,
  svgRef,
  ariaLabel,
  instructions,
  touchHint,
}: ChartReaderProps) {
  const [active, setActive] = useState<number | null>(null);
  const n = items.length;
  const act = active !== null && active < n ? active : null;
  const item = act !== null ? items[act] : undefined;
  const tooltipRows = act !== null ? rows(act) : [];
  const { left, top, innerW, innerH, xs, band } = geo;

  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const t = (event.clientX - rect.left) / Math.max(1, rect.width);
    const i = band ? Math.floor(t * n) : Math.round(t * (n - 1));
    setActive(n <= 1 ? 0 : clamp(i, 0, n - 1));
  }

  return (
    <>
      <ChartFigure
        as="svg"
        ref={svgRef}
        width={width}
        height={height}
        label={ariaLabel}
        description={instructions}
        tabIndex={0}
        onKeyDown={chartKeyHandler(n, act, setActive)}
        onBlur={() => setActive(null)}
        className={cn(
          "block touch-pan-y touch-pinch-zoom overflow-visible rounded-sheen-sm forced-color-adjust-none",
          chartFocusClass,
        )}
      >
        {layers}
        <g aria-hidden transform={`translate(${left},${top})`}>
          {act !== null && (
            <motion.g
              pointerEvents="none"
              initial={false}
              animate={{ x: xs[act] ?? 0 }}
              transition={reduced ? { duration: 0 } : followPointer}
            >
              {!band && <line y2={innerH} stroke="var(--sheen-fg-subtle)" strokeWidth={1} />}
              {marks(act)}
            </motion.g>
          )}
          <rect
            width={innerW}
            height={innerH}
            fill="transparent"
            style={{ touchAction: "pan-y pinch-zoom" }}
            onPointerDown={onPointer}
            onPointerMove={onPointer}
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
          />
        </g>
      </ChartFigure>
      {docked && !item && (
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 flex min-h-7.5 items-center rounded-sheen-md px-3 text-xs text-sheen-fg-muted"
        >
          {touchHint}
        </p>
      )}
      {item && act !== null && (
        <ChartTooltip
          title={item.long ?? item.label}
          rows={tooltipRows}
          x={left + (xs[act] ?? 0)}
          y={top + innerH / 2}
          containerWidth={width}
          docked={docked}
        />
      )}
      <ChartAnnouncer
        text={item ? `${item.long ?? item.label}: ${tooltipRows.map((r) => `${r.label} ${r.value}`).join(", ")}` : ""}
      />
    </>
  );
}

/** Shared state of the dashboard charts: width, first view, reduced motion, live pulse visibility. */
export function useDashChart(height: number) {
  const reduced = useSheenReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  // The svg only exists once the width is measured: observe it from then on (an effect that ran before it mounted would never run again).
  const seen = useInViewSettled(svgRef, { amount: 0.3, ready: width > 0 });
  const pulse = useLoopPlayback(svgRef, { respectReducedMotion: false });
  const docked = width > 0 && width < TOOLTIP_DOCK_BELOW;
  return { reduced, ref, width, svgRef, shown: reduced || seen, pulse, docked, height };
}

/** The clip that wipes the plot in from the start on first view and on every new range. */
export function WipeClip({
  id,
  structure,
  innerW,
  innerH,
  shown,
  reduced,
}: {
  id: string;
  structure: string;
  innerW: number;
  innerH: number;
  shown: boolean;
  reduced: boolean;
}) {
  return (
    <clipPath id={id}>
      <motion.rect
        key={structure}
        x={-4}
        y={-12}
        width={innerW + 12}
        height={innerH + 24}
        style={{ originX: 0, transformBox: "fill-box" }}
        initial={{ scaleX: reduced ? 1 : 0 }}
        animate={{ scaleX: shown ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.9, ease: ease.out }}
      />
    </clipPath>
  );
}

/** The cubic ease-out curve: maps 0-1 to 0-1, fast at first. */
export const easeOutCubic = (x: number) => 1 - (1 - x) ** 3;
