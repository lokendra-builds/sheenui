"use client";

import { useMergedRef } from "../../lib/form";
import { useDockedReadout } from "./chart-fit";
import type { ChartRoot } from "./chart-utils";
import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";
import {
  chartFocusClass,
  changeEase,
  enterEase,
  num,
  tooltipDockSpace,
  useElementWidth,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
  useFirstPlay,
} from "./chart-utils";
import {
  ChartDockHint,
  ChartTip,
  ChartValueTable,
  defaultCompact,
  defaultPercent,
  formatPercent,
  hueMix,
  MissingValue,
  useEntrance,
  type ChartTipAnchor,
} from "./heatmap";
import { ChartFigure } from "./chart-figure";

/** One stage of a FunnelChart: a label and how many reached it. */
export type FunnelStage = { label: string; value: number };

/**
 * Every string FunnelChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type FunnelChartLabels = {
  /** Step line between two stages, e.g. "62.4% continued". */
  continued: string;
  /** e.g. "1,204 dropped off". */
  droppedOff: string;
  /** Tooltip rows. */
  ofFirst: string;
  ofPrevious: string;
  /** Appended to the accessible name. */
  instructions: ChartInstructions;
  roleDescription: string;
  /** Shown in the readout band of a narrow funnel while no stage is being read. */
  hint: string;
};

/**
 * The built-in English strings of FunnelChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultFunnelChartLabels: FunnelChartLabels = {
  continued: "continued",
  droppedOff: "dropped off",
  ofFirst: "of first stage",
  ofPrevious: "of previous stage",
  instructions: "Use the up and down arrow keys to read each stage.",
  roleDescription: "funnel chart",
  hint: "Tap or hover a stage for its conversion",
};

/**
 * Props of FunnelChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type FunnelChartProps = {
  /** The stages in order, e.g. [{ label: "Visited", value: 48200 }, ...]. Negative values count as 0. */
  data: readonly FunnelStage[];
  /** "center": a classic funnel, bars centred; "start": bars from a shared left edge (easier to compare). */
  align?: "center" | "start";
  /** Hue: stages step from the full slot colour (first) to lighter (last), an ordinal ramp. */
  color?: ChartColor;
  /** Formats a stage count for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats a ratio (0.412 → "41.2%"). Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /**
   * Tell stages apart without colour (hatch fills). Default: on when the funnel has more than 3 stages.
   *
   * @default true when data.length > 3
   */
  patterns?: boolean;
  /** Show the "continued / dropped off" line between stages. */
  showDropOff?: boolean;
  /** Called with the stage and its index when it is clicked, tapped, or activated with Enter or Space. Makes stages interactive. */
  onStageClick?: (stage: FunnelStage, index: number) => void;
  /** Shown when there are no stages. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<FunnelChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

export { formatPercent };

type StageModel = {
  label: string;
  value: number;
  /** Bar width as a share of the widest stage (0–1). */
  share: number;
  ofFirst: number;
  ofPrevious: number;
  dropped: number;
  color: string;
};

function model(data: readonly FunnelStage[], color: ChartColor): StageModel[] {
  const values = data.map((d) => Math.max(0, num(d.value)));
  const max = values.reduce((m, v) => Math.max(m, v), 0);
  const first = values[0] ?? 0;
  const n = values.length;
  return data.map((d, i) => {
    const value = values[i] ?? 0;
    const prev = i === 0 ? value : (values[i - 1] ?? 0);
    return {
      label: d.label,
      value,
      share: max > 0 ? value / max : 0,
      ofFirst: first > 0 ? value / first : NaN,
      ofPrevious: prev > 0 ? value / prev : NaN,
      dropped: Math.max(0, prev - value),
      // Ordinal ramp: full hue → 56%, which keeps the lightest stage >= 2:1 on the surface (slots 1, 7, 8).
      color: hueMix(color, n <= 1 ? 1 : 1 - (0.44 * i) / (n - 1)),
    };
  });
}

/* Bars cap at 24px; the step between two stages is a soft trapezoid of the hue. */
const BAR_H = 24;
const STEP_H = 30;

/**
 * Stages as horizontal bars with the conversion between each pair.
 *
 * - Every stage shows its count and its share of the first stage; the line between two stages says
 *   how many continued (and how many dropped off), so colour never carries the reading.
 * - Container-query layout: label | bar | value in one row on wide cards; label and value above
 *   the bar on narrow ones, where the tooltip docks in a band above the stages.
 * - Hover or tap a stage for its tooltip; focus the chart and use the up / down arrow keys.
 * - Bars grow from their base the first time the chart scrolls into view; when the data or the
 *   alignment changes they glide to their new size and place with a transform (FLIP) and the steps
 *   morph with them. Instant with reduced motion.
 *
 * Keyboard: Tab focuses the chart; Down/Right and Up/Left move between stages, Home and End jump to the first and last, Escape clears. With `onStageClick`, Enter or Space activates the stage being read.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; counts and conversion are text, so colour never carries the reading, and keyboard moves announce the stage. `FunnelTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion skips the grow-in and the glide to new sizes.
 *
 * @example
 * ```tsx
 * import { FunnelChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <FunnelChart
 *       data={[
 *         { label: "Visited", value: 12000 },
 *         { label: "Signed up", value: 3400 },
 *         { label: "Subscribed", value: 820 },
 *       ]}
 *       aria-label="Conversion from visit to subscription"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/funnel-chart
 */
export function FunnelChart({
  data,
  align = "center",
  color = 1,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  showDropOff = true,
  patterns,
  onStageClick,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<FunnelChartProps>) {
  const labels = { ...defaultFunnelChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const setRoot = useMergedRef(rootRef, measureRef);
  const rootMerged = useMergedRef(setRoot, outerRef);
  const play = useEntrance(rootRef, reduced);
  const [active, setActive] = useState<number | null>(null);
  const [tip, setTip] = useState<{ anchor: ChartTipAnchor; bounds: { w: number; h: number } } | null>(null);
  const stages = useMemo(() => model(data, color), [data, color]);
  const uid = useId();
  const hatched = resolvePatterns(patterns, stages.length);
  const signature = stages.map((s) => s.value).join(",");
  const centred = align === "center";

  // The steps' staggered fade plays once; later data changes morph them with the bars.
  const first = useFirstPlay(play);

  // Narrow funnels read out in a band above the stages (a floating tooltip would sit under the finger).
  const docked = useDockedReadout(width);
  const dock = docked
    ? tooltipDockSpace(
        width,
        stages.map((s) => ({ label: s.label })),
        "label",
        [
          { label: "", values: stages.map((s) => format(s.value)) },
          { label: labels.ofPrevious, values: stages.map((s) => pct(s.ofPrevious)) },
        ],
      )
    : 0;

  // Anchor the floating tooltip to the active bar (measured from its track: the layout is fluid CSS).
  const activeShare = active === null ? 0 : (stages[active]?.share ?? 0);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = active === null ? null : root?.querySelector<HTMLElement>(`[data-track="${active}"]`);
    if (!root || !track || active === null) return;
    const r = root.getBoundingClientRect();
    const t = track.getBoundingClientRect();
    const w = Math.max(2, t.width * activeShare);
    setTip({
      anchor: { x: t.left - r.left + (centred ? (t.width - w) / 2 : 0), y: t.top - r.top, w, h: t.height },
      bounds: { w: r.width, h: r.height },
    });
  }, [active, activeShare, width, centred]);

  if (stages.length === 0) {
    return (
      <ChartEmpty height={200} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < stages.length ? active : null;
  const focus = act !== null ? stages[act] : undefined;

  function onKeyDown(event: KeyboardEvent) {
    const n = stages.length;
    let next: number | null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = act === null ? 0 : Math.min(n - 1, act + 1);
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = act === null ? 0 : Math.max(0, act - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = n - 1;
    else if (event.key === "Escape" && act !== null) next = null;
    else if ((event.key === "Enter" || event.key === " ") && act !== null && onStageClick) {
      event.preventDefault();
      onStageClick(itemAt(data, act), act);
      return;
    } else return;
    event.preventDefault();
    setActive(next);
  }

  const describe = (s: StageModel, i: number) => {
    const parts = [`${s.label}: ${format(s.value)}`];
    if (i > 0)
      parts.push(
        `${pct(s.ofFirst)} ${labels.ofFirst}`,
        `${pct(s.ofPrevious)} ${labels.ofPrevious}`,
        `${format(s.dropped)} ${labels.droppedOff}`,
      );
    return parts.join(", ");
  };

  // Points of the step between stage i and i + 1, in % of the track width.
  const stepPoints = (a: number, b: number) => {
    const A = a * 100;
    const B = b * 100;
    const p = (n: number) => Number(n.toFixed(2));
    return centred
      ? `${p(50 - A / 2)},0 ${p(50 + A / 2)},0 ${p(50 + B / 2)},${STEP_H} ${p(50 - B / 2)},${STEP_H}`
      : `0,0 ${p(A)},0 ${p(B)},${STEP_H} 0,${STEP_H}`;
  };

  const radius = centred ? "4px" : "0 4px 4px 0";
  const layoutTransition = reduced ? { duration: 0 } : { duration: duration.slow, ease: changeEase };

  // Tooltip rows: everything on a wide chart; the count and the step's conversion in the docked band.
  const tipRows =
    focus && act !== null
      ? docked
        ? [
            { label: "", value: format(focus.value), color: focus.color, kind: "rect" as const },
            ...(act > 0 ? [{ label: labels.ofPrevious, value: pct(focus.ofPrevious), color: "transparent" }] : []),
          ]
        : [
            { label: "", value: format(focus.value), color: focus.color, kind: "rect" as const },
            ...(act > 0
              ? [
                  { label: labels.ofFirst, value: pct(focus.ofFirst), color: "transparent" },
                  { label: labels.ofPrevious, value: pct(focus.ofPrevious), color: "transparent" },
                  { label: labels.droppedOff, value: format(focus.dropped), color: "transparent" },
                ]
              : []),
          ]
      : [];

  return (
    <ChartFigure
      as="div"
      {...rest}
      ref={rootMerged}
      roleDescription={labels.roleDescription}
      label={ariaLabel}
      description={resolveInstructions(labels.instructions)}

      tabIndex={0}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
      className={cn("@container relative w-full rounded-sheen-sm", chartFocusClass, className)}
      style={{ paddingTop: dock }}
    >
      {/* One grid for every stage (rows are subgrids), so bars, steps and values share their columns. */}
      <ol
        aria-hidden
        className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 @lg:grid-cols-[minmax(6rem,26%)_minmax(0,1fr)_auto]"
      >
        {stages.map((s, i) => {
          const next = stages[i + 1];
          const dim = act !== null && act !== i;
          return (
            <li key={i} className="col-span-full grid grid-cols-subgrid">
              {/* Stage: label | bar | value (wide) or label · value over the bar (narrow). */}
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- pointer convenience for the stage row; the keyboard equivalent (Enter/Space on the focused chart) is handled on the group above */}
              <div
                className={cn(
                  "col-span-full grid grid-cols-subgrid items-center gap-y-1.5 rounded-sheen-sm py-1",
                  onStageClick && "cursor-pointer",
                )}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onPointerDown={() => setActive(i)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                onClick={() => onStageClick?.(itemAt(data, i), i)}
              >
                <span className="col-start-1 row-start-1 flex min-w-0 items-baseline gap-2">
                  <span className="text-2xs text-sheen-fg-subtle tabular-nums">{i + 1}</span>
                  <span className="truncate text-sm font-medium text-sheen-fg">{s.label}</span>
                </span>
                <span className="col-start-2 row-start-1 flex items-baseline justify-end gap-2 @lg:col-start-3">
                  <span className="text-sm font-semibold text-sheen-fg tabular-nums">{format(s.value)}</span>
                  <span className="w-12 text-end text-xs text-sheen-fg-muted tabular-nums">
                    {i === 0 ? pct(s.share > 0 ? 1 : NaN) : pct(s.ofFirst)}
                  </span>
                </span>
                <div
                  data-track={i}
                  className={cn(
                    "relative col-span-full row-start-2 flex @lg:col-span-1 @lg:col-start-2 @lg:row-start-1",
                    centred ? "justify-center" : "justify-start",
                  )}
                  style={{ height: BAR_H }}
                >
                  <motion.div
                    layout
                    layoutDependency={`${signature}|${align}`}
                    transition={{
                      layout: layoutTransition,
                      opacity: { duration: reduced ? 0 : duration.fast },
                      scaleX: {
                        duration: reduced ? 0 : duration.slower,
                        ease: enterEase,
                        delay: reduced ? 0 : i * 0.08,
                      },
                    }}
                    initial={reduced ? false : { scaleX: 0, opacity: 1 }}
                    animate={{ scaleX: play ? 1 : 0, opacity: dim ? 0.45 : 1 }}
                    className="h-full overflow-hidden forced-color-adjust-none forced-colors:outline forced-colors:outline-1 forced-colors:outline-[CanvasText]"
                    style={{
                      width: `${s.share * 100}%`,
                      minWidth: s.value > 0 ? 2 : 0,
                      background: s.color,
                      borderRadius: radius,
                      transformOrigin: centred ? "50% 50%" : "0% 50%",
                    }}
                  >
                    {hatched && i > 0 && (
                      <svg aria-hidden className="block size-full">
                        <ChartPatternDefs id={uid} entries={[{ index: i, color: s.color }]} />
                        <rect width="100%" height="100%" fill={patternFill(true, uid, i, s.color)} />
                      </svg>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Step to the next stage: the soft trapezoid shows the narrowing, the words carry the numbers. */}
              {next && (
                <div className="col-span-full grid grid-cols-subgrid" style={{ minHeight: STEP_H }}>
                  <div
                    className="relative col-span-full row-start-1 @lg:col-span-1 @lg:col-start-2"
                    style={{ minHeight: STEP_H }}
                  >
                    <svg
                      viewBox={`0 0 100 ${STEP_H}`}
                      preserveAspectRatio="none"
                      className="absolute inset-0 size-full forced-color-adjust-none"
                    >
                      {/* Same four points in both alignments, so a data or align change morphs it with the bars. */}
                      <motion.polygon
                        style={{ fill: hueMix(color, 0.16, "transparent") }}
                        initial={reduced ? false : { opacity: 0, points: stepPoints(s.share, next.share) }}
                        animate={{ opacity: play ? 1 : 0, points: stepPoints(s.share, next.share) }}
                        transition={{
                          opacity: {
                            duration: reduced ? 0 : duration.slow,
                            delay: reduced || !first ? 0 : 0.25 + i * 0.08,
                          },
                          points: layoutTransition,
                        }}
                      />
                    </svg>
                  </div>
                  {showDropOff && (
                    <p
                      className={cn(
                        "pointer-events-none relative col-span-full row-start-1 flex flex-wrap items-baseline gap-x-1.5 self-center py-1 ps-2 text-xs text-sheen-fg-muted",
                        // Wide: two lines in the label column.
                        "@lg:col-span-1 @lg:col-start-1 @lg:flex-col @lg:gap-y-0.5 @lg:ps-5",
                      )}
                    >
                      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <ArrowDown />
                        <span className="font-semibold text-sheen-fg tabular-nums">{pct(next.ofPrevious)}</span>
                        <span>{labels.continued}</span>
                      </span>
                      <span className="whitespace-nowrap tabular-nums @lg:ps-4">
                        <span aria-hidden className="text-sheen-fg-subtle @lg:hidden">
                          ·{" "}
                        </span>
                        {format(next.dropped)} {labels.droppedOff}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {focus && act !== null && (docked || tip) ? (
        <ChartTip
          title={focus.label}
          rows={tipRows}
          anchor={tip?.anchor ?? { x: 0, y: 0, w: 0, h: 0 }}
          bounds={tip?.bounds ?? { w: width, h: 0 }}
          docked={docked}
        />
      ) : (
        docked && <ChartDockHint>{labels.hint}</ChartDockHint>
      )}
      <ChartAnnouncer text={focus && act !== null ? describe(focus, act) : ""} />
    </ChartFigure>
  );
}

function ArrowDown() {
  return (
    <svg aria-hidden width={10} height={10} viewBox="0 0 10 10" className="shrink-0 self-center text-sheen-fg-subtle">
      <path
        d="M5 1.5v7M2 5.5l3 3 3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Table view ---------- */

/** The text of `FunnelTable` that is not a column header: the two stand-ins for a conversion that has no value. */
export type FunnelTableLabels = {
  /** Read for the first stage's conversion cells, which have no previous stage. */
  notApplicable: string;
  /** Read for a conversion that can't be computed (the stage before had 0). */
  noData: string;
};

/** English defaults of {@link FunnelTableLabels}. */
export const defaultFunnelTableLabels: FunnelTableLabels = {
  notApplicable: "Not applicable",
  noData: "No data",
};

/**
 * Props of FunnelTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type FunnelTableProps = Pick<FunnelChartProps, "data" | "format" | "formatPercent" | "locale"> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Text of the table's column headers (stage, count, share of first, share of previous, dropped); pass only the ones you translate. */
  headers?: Partial<{ stage: string; count: string; ofFirst: string; ofPrevious: string; dropped: string }>;
  /** Strings for the cells that have no value. Merged over {@link defaultFunnelTableLabels}. */
  labels?: Partial<FunnelTableLabels>;
  /** Shown when there are no stages. */
  emptyState?: ReactNode;
};

/**
 * Every stage with its count, conversion and drop-off.
 *
 * Props: the chart's `data`, `format`, `formatPercent` and `locale`, plus `caption` (hidden, names the table), `headers`, `labels` (`notApplicable` "Not applicable", `noData` "No data") and `emptyState`. A real table: each stage's count, conversion and drop-off. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { FunnelTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <FunnelTable data={[{ label: "Visited", value: 12000 }, { label: "Signed up", value: 3400 }]} caption="Conversion from visit to signup" />
 *   );
 * }
 * ```
 *
 * @see /charts/funnel-chart
 */
export function FunnelTable({
  data,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  caption,
  headers,
  labels,
  emptyState,
}: FunnelTableProps) {
  const { notApplicable: notApplicableLabel, noData: noDataLabel } = { ...defaultFunnelTableLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const h = {
    stage: "Stage",
    count: "Count",
    ofFirst: "% of first",
    ofPrevious: "% of previous",
    dropped: "Dropped off",
    ...headers,
  };
  const stages = model(data, 1);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[
        { label: h.stage },
        { label: h.count },
        { label: h.ofFirst },
        { label: h.ofPrevious },
        { label: h.dropped },
      ]}
      rows={stages.map((s, i) => [
        s.label,
        format(s.value),
        Number.isFinite(s.ofFirst) ? pct(s.ofFirst) : <MissingValue label={noDataLabel} />,
        i === 0 ? (
          <MissingValue label={notApplicableLabel} />
        ) : Number.isFinite(s.ofPrevious) ? (
          pct(s.ofPrevious)
        ) : (
          <MissingValue label={noDataLabel} />
        ),
        i === 0 ? <MissingValue label={notApplicableLabel} /> : format(s.dropped),
      ])}
    />
  );
}
