"use client";

import { useDockedReadout } from "./chart-fit";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useLayoutEffect,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import {
  chartFocusClass,
  clamp,
  enterEase,
  thinLabels,
  TOOLTIP_DOCK_SPACE,
  truncate,
  useElementWidth,
  resolveInstructions,
} from "./chart-utils";
import { useEntrance, ChartTip } from "./chart-tip";
import { ChartFigure } from "./chart-figure";
export {
  useEntrance,
  placeChartTip,
  ChartTip,
  ChartValueTable,
  type ChartTipAnchor,
  type ChartTipSide,
  type ChartTipProps,
  type ChartValueTableColumn,
  type ChartValueTableProps,
} from "./chart-tip";

import {
  sequentialColor,
  scalePosition,
  defaultCompact,
  useContrastInk,
  useMarksEntrance,
  ChartDockHint,
  useScrollFade,
  SequentialLegend,
  type HeatmapCell,
  defaultHeatmapLabels,
  type HeatmapProps,
  ROW_LABEL_CHAR,
  VALUE_CHAR,
  COL_LABEL_H,
  GAP,
  valueOrNull,
} from "./heatmap/kit";

export {
  hueMix,
  sequentialColor,
  scalePosition,
  type ChartNumberFormat,
  chartNumberFormat,
  formatPercent,
  defaultCompact,
  defaultPercent,
  type Ink,
  useContrastInk,
  useMarksEntrance,
  ChartDockHint,
  useScrollFade,
  type SequentialLegendProps,
  SequentialLegend,
  MissingValue,
  type HeatmapColumn,
  type HeatmapCell,
  type HeatmapLabels,
  defaultHeatmapLabels,
  type HeatmapProps,
} from "./heatmap/kit";
export { type HeatmapTableProps, HeatmapTable, type MissingValueProps, type ChartDockHintProps } from "./heatmap/table";

/**
 * A category × category grid coloured on a single-hue sequential scale.
 *
 * - Hover or tap a cell for its tooltip; focus the grid and move with the arrow keys
 *   (Home / End along a row, Ctrl+Home / Ctrl+End to the corners, Escape to clear).
 * - Missing values are hatched, never painted as zero.
 * - Narrow screens: columns shrink to `minCellWidth`, then the grid scrolls sideways inside
 *   its own focusable container while the row labels stay put.
 * - Cells bloom in on a diagonal wave the first time the chart scrolls into view; changed
 *   data cross-fades as one layer. Both are instant with reduced motion.
 *
 * @example
 * ```tsx
 * import { Heatmap } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Heatmap
 *       data={[{ day: "Mon", am: 3, pm: 8 }, { day: "Tue", am: 5, pm: 2 }]}
 *       index="day"
 *       columns={[{ key: "am", label: "Morning" }, { key: "pm", label: "Afternoon" }]}
 *       onCellClick={({ row, column, value }) => console.log(row, column, value)}
 *       aria-label="Traffic by time of day"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function Heatmap({
  data,
  index,
  columns,
  color = 1,
  domain,
  steps = 0,
  showValues = false,
  cellHeight,
  minCellWidth = 12,
  format: formatProp,
  locale,
  legend = true,
  legendLabel,
  onCellClick,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<HeatmapProps>) {
  const labels = { ...defaultHeatmapLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const reduced = useSheenReducedMotion();
  const patternId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const rowCount = data.length;
  const colCount = columns.length;

  // Values, the scale domain and each cell's fill.
  const grid = useMemo(() => data.map((row) => columns.map((col) => valueOrNull(row[col.key]))), [data, columns]);
  const [lo, hi] = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const row of grid)
      for (const v of row) {
        if (v === null) continue;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    if (lo > hi) return [0, 0];
    return domain ?? [Math.min(0, lo), hi];
  }, [grid, domain]);
  const fills = useMemo(
    () =>
      grid.map((row) => row.map((v) => (v === null ? null : sequentialColor(scalePosition(v, lo, hi, steps), color)))),
    [grid, lo, hi, steps, color],
  );
  const ink = useContrastInk(rootRef, showValues ? fills.flat().filter((f): f is string => f !== null) : []);

  // Geometry.
  const rowNames = data.map((row) => String(row[index] ?? ""));
  const longest = rowNames.reduce((n, l) => Math.max(n, l.length), 0);
  const rowLabelW = clamp(Math.ceil(longest * ROW_LABEL_CHAR) + 14, 36, Math.max(36, Math.floor(width * 0.32)));
  const avail = Math.max(0, width - rowLabelW);
  const cellW = colCount > 0 ? Math.max(minCellWidth, avail / colCount) : 0;
  const gridW = Math.ceil(cellW * colCount);
  const cellH = cellHeight ?? clamp(Math.round(cellW), 24, 40);
  const docked = useDockedReadout(width);
  const dock = docked ? TOOLTIP_DOCK_SPACE : 0;
  const plotH = COL_LABEL_H + rowCount * cellH;
  const rowChars = Math.max(2, Math.floor((rowLabelW - 10) / ROW_LABEL_CHAR));

  const act = active && active.r < rowCount && active.c < colCount ? active : null;

  useMarksEntrance(layerRef, play && width > 0, reduced);
  useScrollFade(scrollRef, gridRef, rowLabelW, width > 0 ? gridW : 0);

  // Keep the active cell in view when the grid scrolls sideways (the sticky labels cover the start).
  const actRow = act ? act.r : -1;
  const actCol = act ? act.c : -1;
  useEffect(() => {
    const scroller = scrollRef.current;
    if (actCol < 0 || !scroller) return;
    const view = scroller.clientWidth - rowLabelW;
    const left = actCol * cellW;
    const right = left + cellW;
    if (left < scroller.scrollLeft) scroller.scrollLeft = Math.max(0, left - 8);
    else if (right > scroller.scrollLeft + view) scroller.scrollLeft = right - view + 8;
  }, [actCol, cellW, rowLabelW]);
  useLayoutEffect(() => {
    if (actRow >= 0 && scrollRef.current) setScrollLeft(scrollRef.current.scrollLeft);
  }, [actRow, actCol]);

  // Every cell, as plain SVG (one layer). The diagonal-wave entrance reads data-delay.
  const version = useMemo(
    () =>
      fills
        .map((row, r) => row.map((f, c) => `${f ?? "-"}${showValues ? `:${grid[r]?.[c] ?? ""}` : ""}`).join(","))
        .join(";"),
    [fills, grid, showValues],
  );
  const cells = useMemo(
    () =>
      grid.flatMap((row, r) =>
        row.map((value, c) => {
          const fill = fills[r]?.[c] ?? null;
          const x = c * cellW + GAP / 2;
          const y = r * cellH + GAP / 2;
          const w = Math.max(0, cellW - GAP);
          const h = Math.max(0, cellH - GAP);
          const text = value === null ? "" : format(value);
          const fits = showValues && text !== "" && text.length * VALUE_CHAR + 16 <= w && h >= 18;
          return (
            <g
              key={`${r}:${c}`}
              data-delay={Math.min((r + c) * 0.022, 0.7)}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={Math.min(4, w / 4, h / 4)}
                style={{ fill: fill ?? `url("#${patternId}-missing")` }}
              />
              {fits && (
                <text
                  x={x + w / 2}
                  y={y + h / 2}
                  dy="0.32em"
                  textAnchor="middle"
                  className={cn(
                    "text-2xs font-medium tabular-nums",
                    ink(fill ?? "") === "light" ? "fill-sheen-ink-on-dark" : "fill-sheen-ink-on-light",
                  )}
                >
                  {text}
                </text>
              )}
            </g>
          );
        }),
      ),
    [grid, fills, cellW, cellH, showValues, format, ink, patternId],
  );

  if (rowCount === 0 || colCount === 0) {
    return (
      <ChartEmpty height={220} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const shownCols = thinLabels(
    columns.map((c) => c.label),
    cellW,
    6.2,
  );
  const cellAt = (r: number, c: number): HeatmapCell => ({
    row: rowNames[r] ?? "",
    column: columns[c]?.key ?? "",
    columnLabel: columns[c]?.label ?? "",
    value: grid[r]?.[c] ?? null,
  });
  const describe = (r: number, c: number) => {
    const cell = cellAt(r, c);
    return {
      title: `${cell.row} · ${cell.columnLabel}`,
      value: cell.value === null ? labels.noData : format(cell.value),
    };
  };

  function onKeyDown(event: KeyboardEvent) {
    const cur = act ?? { r: -1, c: -1 };
    const start = act ?? { r: 0, c: 0 };
    let next: { r: number; c: number } | null | undefined;
    const ctrl = event.ctrlKey || event.metaKey;
    switch (event.key) {
      case "ArrowRight":
        next = act ? { r: cur.r, c: Math.min(colCount - 1, cur.c + 1) } : start;
        break;
      case "ArrowLeft":
        next = act ? { r: cur.r, c: Math.max(0, cur.c - 1) } : start;
        break;
      case "ArrowDown":
        next = act ? { r: Math.min(rowCount - 1, cur.r + 1), c: cur.c } : start;
        break;
      case "ArrowUp":
        next = act ? { r: Math.max(0, cur.r - 1), c: cur.c } : start;
        break;
      case "Home":
        next = ctrl ? { r: 0, c: 0 } : { r: Math.max(0, cur.r), c: 0 };
        break;
      case "End":
        next = ctrl ? { r: rowCount - 1, c: colCount - 1 } : { r: Math.max(0, cur.r), c: colCount - 1 };
        break;
      case "PageUp":
        next = { r: 0, c: Math.max(0, cur.c) };
        break;
      case "PageDown":
        next = { r: rowCount - 1, c: Math.max(0, cur.c) };
        break;
      case "Escape":
        if (!act) return;
        next = null;
        break;
      case "Enter":
      case " ":
        if (!act || !onCellClick) return;
        onCellClick(cellAt(act.r, act.c));
        event.preventDefault();
        return;
      default:
        return;
    }
    event.preventDefault();
    setActive(next);
  }

  /** Set the active cell; the same cell again keeps the old object, so a pointer moving inside one cell re-renders nothing. */
  function activate(next: { r: number; c: number } | null) {
    setActive((prev) => (prev?.r === next?.r && prev?.c === next?.c ? prev : next));
  }

  function cellFromPointer(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const c = Math.floor((event.clientX - rect.left) / cellW);
    const r = Math.floor((event.clientY - rect.top - COL_LABEL_H) / cellH);
    return r >= 0 && r < rowCount && c >= 0 && c < colCount ? { r, c } : null;
  }

  // Tooltip beside the active cell (in the chart box's coordinates), or docked on phones.
  let tooltip: ReactNode = null;
  let announcement = "";
  if (act) {
    const { title, value } = describe(act.r, act.c);
    const fill = fills[act.r]?.[act.c];
    announcement = `${title}: ${value}`;
    tooltip = (
      <ChartTip
        title={title}
        rows={[
          {
            label: typeof legendLabel === "string" ? legendLabel : "",
            value,
            color: fill ?? "transparent",
            kind: "rect",
          },
        ]}
        anchor={{
          x: rowLabelW + act.c * cellW - scrollLeft,
          y: dock + COL_LABEL_H + act.r * cellH,
          w: cellW,
          h: cellH,
        }}
        bounds={{ w: width, h: dock + plotH }}
        docked={docked}
      />
    );
  }
  const activeValue = act ? (grid[act.r]?.[act.c] ?? null) : null;

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col gap-3", className)}>
      <div ref={measureRef} className="relative w-full" style={{ paddingTop: dock }}>
        {width > 0 && (
          <>
            {/* The scroller is the focusable chart: arrow keys read cells (and keep them in view). */}
            {}
            <ChartFigure
              as="div"
              ref={scrollRef}
              roleDescription={labels.roleDescription}
              label={ariaLabel}
              description={resolveInstructions(labels.instructions)}

              tabIndex={0}
              onKeyDown={onKeyDown}
              onBlur={() => setActive(null)}
              onScroll={(e) => {
                // The offset only places the tooltip of the active cell (re-read when a cell becomes active): no re-render per scroll event otherwise.
                if (active) setScrollLeft(e.currentTarget.scrollLeft);
              }}
              className={cn(
                "overflow-x-auto overscroll-x-contain rounded-sheen-sm [scrollbar-width:thin]",
                chartFocusClass,
              )}
            >
              <div className="flex w-max min-w-full">
                {/* Row labels stay put (sticky) while a wide grid scrolls under them. */}
                <svg aria-hidden width={rowLabelW} height={plotH} className="sticky left-0 z-1 block shrink-0">
                  {rowNames.map((name, r) => {
                    const short = truncate(name, rowChars);
                    return (
                      <text
                        key={r}
                        x={rowLabelW - 10}
                        y={COL_LABEL_H + r * cellH + cellH / 2}
                        dy="0.32em"
                        textAnchor="end"
                        className={cn("text-xs", act?.r === r ? "fill-sheen-fg font-semibold" : "fill-sheen-fg-muted")}
                      >
                        {short !== name && <title>{name}</title>}
                        {short}
                      </text>
                    );
                  })}
                </svg>

                <svg
                  ref={gridRef}
                  aria-hidden
                  width={gridW}
                  height={plotH}
                  className={cn("block shrink-0", onCellClick && "cursor-pointer")}
                  onPointerMove={(e) => e.pointerType === "mouse" && activate(cellFromPointer(e))}
                  onPointerDown={(e) => activate(cellFromPointer(e))}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                  onClick={(e) => {
                    const cell = onCellClick && cellFromPointer(e);
                    if (cell) onCellClick(cellAt(cell.r, cell.c));
                  }}
                >
                  <defs>
                    <pattern
                      id={`${patternId}-missing`}
                      width={5}
                      height={5}
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(45)"
                    >
                      <line
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={5}
                        stroke="color-mix(in oklab, var(--sheen-fg-subtle) 45%, transparent)"
                        strokeWidth={1.25}
                      />
                    </pattern>
                  </defs>

                  {/* Column labels, thinned so they never collide. */}
                  {columns.map((col, c) =>
                    shownCols.has(c) ? (
                      <text
                        key={col.key}
                        // Centred on its column, but never past the grid's edges.
                        x={clamp(
                          c * cellW + cellW / 2,
                          (col.label.length * 6.2) / 2,
                          gridW - (col.label.length * 6.2) / 2,
                        )}
                        y={COL_LABEL_H - 8}
                        textAnchor="middle"
                        className={cn("text-2xs", act?.c === c ? "fill-sheen-fg font-semibold" : "fill-sheen-fg-muted")}
                      >
                        {col.label}
                      </text>
                    ) : null,
                  )}

                  <g
                    ref={layerRef}
                    transform={`translate(0,${COL_LABEL_H})`}
                    opacity={play ? 1 : 0}
                    className="forced-color-adjust-none"
                  >
                    {/* A data change fades the new layer in over the old one (removed once covered). */}
                    <AnimatePresence initial={false}>
                      <motion.g
                        key={version}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0, delay: reduced ? 0 : duration.base } }}
                        transition={{ duration: reduced ? 0 : duration.base, ease: enterEase }}
                      >
                        {cells}
                      </motion.g>
                    </AnimatePresence>

                    {/* The active cell lifts with a ring (never by dimming the rest: that would change the reading). */}
                    {act && (
                      <rect
                        x={act.c * cellW}
                        y={act.r * cellH}
                        width={cellW}
                        height={cellH}
                        rx={Math.min(5, cellW / 3)}
                        fill="none"
                        strokeWidth={2}
                        className="pointer-events-none stroke-sheen-fg forced-colors:stroke-[Highlight]"
                      />
                    )}
                  </g>
                </svg>
              </div>
            </ChartFigure>
            {tooltip ?? (docked && <ChartDockHint>{labels.hint}</ChartDockHint>)}
          </>
        )}
      </div>

      {legend && grid.some((row) => row.some((v) => v !== null)) && (
        <SequentialLegend
          className="self-end"
          min={lo}
          max={hi}
          color={color}
          steps={steps}
          format={format}
          label={legendLabel}
          marker={activeValue === null ? null : scalePosition(activeValue, lo, hi, steps)}
        />
      )}
      <ChartAnnouncer text={announcement} />
    </div>
  );
}
