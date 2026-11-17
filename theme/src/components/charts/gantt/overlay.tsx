"use client";

import type { RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { DIAMOND, HEADER } from "./layout";
import { dateOf, type Row } from "./model";
import { MilestoneMark, RowLabel } from "./rows";
import type { ActiveStore } from "./store";
import type { ganttFormats } from "./ticks";
import { HeaderLabels, type Ticks } from "./layers";
import type { GanttScale } from "./types";

/** The text layer over the timeline: never stretched by a zoom glide; labels fade back in after it. */
export function GanttOverlay({
  svgRef,
  fadeRef,
  store,
  rows,
  rowY,
  rowH,
  ticks,
  scale,
  rangeStart,
  px,
  contentW,
  viewW,
  height,
  rtl,
  todayDay,
  todayIn,
  todayX,
  X,
  xOf,
  fmt,
  pct,
  play,
  reduced,
  glide,
  firstView,
}: {
  svgRef: RefObject<SVGSVGElement | null>;
  fadeRef: RefObject<SVGGElement | null>;
  store: ActiveStore;
  rows: Row[];
  rowY: number[];
  rowH: number;
  ticks: Ticks;
  scale: GanttScale;
  rangeStart: number;
  px: number;
  contentW: number;
  viewW: number;
  height: number;
  rtl: boolean;
  todayDay: number | null;
  todayIn: boolean;
  todayX: number;
  /** Offset along the timeline → x on screen (mirrored for right-to-left). */
  X: (offset: number) => number;
  /** Day → offset along the timeline. */
  xOf: (day: number) => number;
  fmt: ReturnType<typeof ganttFormats>;
  pct: Intl.NumberFormat;
  play: boolean;
  reduced: boolean;
  glide: boolean;
  firstView: { current: boolean };
}) {
  return (
    <svg
      ref={svgRef}
      aria-hidden
      width={contentW}
      height={height}
      data-cw={contentW}
      data-vw={viewW}
      data-rtl={rtl}
      className="pointer-events-none absolute inset-0 block"
      style={{ direction: "ltr" }}
    >
      <g ref={fadeRef}>
        <HeaderLabels
          ticks={ticks}
          scale={scale}
          rangeStart={rangeStart}
          px={px}
          contentW={contentW}
          rtl={rtl}
          todayDay={todayIn ? todayDay : null}
        />
        <AnimatePresence initial={false}>
          {rows.map((row, i) => {
            if (row.kind !== "task") return null;
            const y = rowY[i] ?? 0;
            if (row.milestone) {
              if (DIAMOND + 60 >= contentW) return null;
              const offset = xOf(row.start) + px / 2 + DIAMOND / 2 + 6;
              return (
                <RowLabel
                  key={row.key}
                  y={y}
                  x={X(offset)}
                  text={fmt.dayMonth.format(dateOf(row.start))}
                  rowH={rowH}
                  rowKey={row.key}
                  store={store}
                  rtl={rtl}
                  fitStart={offset}
                  order={i}
                  play={play}
                  reduced={reduced}
                  glide={glide}
                  firstView={firstView}
                />
              );
            }
            if (row.progress === null) return null;
            const barW = Math.max(2, xOf(row.end) - xOf(row.start) - 2);
            const offset = xOf(row.start) + barW + 6;
            return (
              <RowLabel
                key={row.key}
                y={y}
                x={X(offset)}
                text={pct.format(row.progress)}
                rowH={rowH}
                rowKey={row.key}
                store={store}
                rtl={rtl}
                fitStart={offset}
                order={i}
                play={play}
                reduced={reduced}
                glide={glide}
                firstView={firstView}
              />
            );
          })}
        </AnimatePresence>
      </g>
      <AnimatePresence initial={false}>
        {rows.map((row, i) =>
          row.kind === "task" && row.milestone ? (
            <MilestoneMark
              key={row.key}
              index={row.index}
              y={rowY[i] ?? 0}
              cx={X(xOf(row.start) + px / 2)}
              rowH={rowH}
              color={row.color}
              rowKey={row.key}
              store={store}
              order={i}
              play={play}
              reduced={reduced}
              glide={glide}
              firstView={firstView}
            />
          ) : null,
        )}
      </AnimatePresence>
      {/* Today's marker on the header rule (its line runs under the bars). */}
      {todayIn && (
        <circle
          data-fx={todayX}
          cx={todayX}
          cy={HEADER}
          r={3.5}
          className="fill-sheen-accent forced-colors:fill-[Highlight]"
        />
      )}
    </svg>
  );
}
