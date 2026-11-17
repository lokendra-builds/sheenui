"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import {
  startTransition,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  useLayoutEffect,
} from "react";

import { cn } from "../../lib/cn";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { SegmentedControl } from "../segmented/segmented";
import { ChartEmpty } from "./chart-parts";
import { useDockedReadout } from "./chart-fit";
import { clamp, useElementWidth, resolveInstructions, itemAt } from "./chart-utils";
import {
  ChartDockHint,
  defaultCompact,
  scalePosition,
  SequentialLegend,
  sequentialColor,
  useContrastInk,
  useEntrance,
} from "./heatmap";
import { isRtlAt } from "../../hooks/use-direction";

import {
  type CohortCell,
  type CohortView,
  defaultCohortChartLabels,
  type CohortChartProps,
  cohortPercent,
  cohortModel,
  DOCK_BAND,
  isolate,
  cssEase,
  DockedReadout,
  useCellsEntrance,
  CellTip,
  type RowView,
  CohortRowView,
} from "./cohort-chart/parts";

export {
  type CohortRow,
  type CohortCell,
  type CohortView,
  type CohortChartLabels,
  defaultCohortChartLabels,
  type CohortChartProps,
  cohortPercent,
  cohortModel,
} from "./cohort-chart/parts";
export { type CohortTableProps, CohortTable } from "./cohort-chart/table";
/* ======================================================================
 * CohortChart
 * ====================================================================== */

/**
 * Retention cohort table: one row per cohort, one column per period since it started, each cell
 * coloured on a single-hue scale by the share of the cohort still active.
 *
 * - A weighted-average row sits on top; the tooltip compares each cell with it.
 * - Switch between percentages and user counts (the colour always follows retention, so cohorts
 *   of different sizes stay comparable).
 * - It is a real ARIA grid: Tab lands on one cell, the arrow keys move (Home / End along a row,
 *   Ctrl+Home / Ctrl+End to the corners), Enter or Space calls onCellClick. Screen readers hear
 *   the cohort and the period with every cell.
 * - Wide or long tables scroll inside their own container; the header row and the cohort column
 *   stay put.
 * - Cells bloom in on a diagonal wave the first time the table scrolls into view; switching
 *   views sweeps the new numbers in with one glint across the grid. Instant with reduced motion.
 *
 * @example
 * ```tsx
 * import { CohortChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CohortChart
 *       data={[{ cohort: "Jan 2026", size: 120, values: [120, 84, 61] }]}
 *       aria-label="Retention by signup month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/cohort-retention
 */
export function CohortChart({
  data,
  valuesAre = "counts",
  periods,
  view: viewProp,
  defaultView = "percent",
  onViewChange,
  viewToggle = true,
  average = true,
  color = 1,
  domain,
  steps = 0,
  maxHeight,
  format: formatProp,
  formatPercent: formatPercentProp,
  locale,
  legend = true,
  onCellClick,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<CohortChartProps>) {
  const labels = { ...defaultCohortChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = formatPercentProp ?? cohortPercent(locale);
  const reduced = useSheenReducedMotion();
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const firstColRef = useRef<HTMLTableCellElement>(null);
  const headRef = useRef<HTMLTableSectionElement>(null);
  const play = useEntrance(rootRef, reduced);

  // The root is always mounted (also while empty, e.g. loading), so its width is known from the
  // first render with data, and the entrance observer is attached from the start.
  const [measureRef, rootW] = useElementWidth<HTMLDivElement>();
  const setRoot = useMergedRef(rootRef, measureRef);
  const rootMerged = useMergedRef(setRoot, outerRef);
  const docked = useDockedReadout(rootW);

  const [innerView, setInnerView] = useState<CohortView>(defaultView);
  const view = viewProp ?? innerView;
  const setView = (v: CohortView) => {
    // Every cell's text changes: render the grid as a transition (in slices that never block
    // input), whether the view is ours or the parent's.
    startTransition(() => {
      if (viewProp === undefined) setInnerView(v);
      onViewChange?.(v);
    });
  };

  const model = useMemo(() => cohortModel(data, valuesAre, periods, average), [data, valuesAre, periods, average]);
  const { rows, periods: periodCount } = model;

  // The ramp spans the retention actually seen after period 0 (period 0 is 100% by definition and
  // would squash every other cell into one shade); the legend prints both ends.
  const [lo, hi] = useMemo<[number, number]>(() => {
    if (domain) return domain;
    let min = Infinity;
    let max = -Infinity;
    for (const r of rows)
      for (let p = 1; p < r.cells.length; p++) {
        const v = r.cells[p]?.ratio;
        if (v === null || v === undefined) continue;
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
    if (!(max > 0)) return [0, 1];
    const floor = Math.floor((min * 100) / 5) * 0.05; // a round lower end: 12% → 10%
    return [Math.max(0, floor < max ? floor : 0), max];
  }, [rows, domain]);

  const fillOf = useCallback(
    (ratio: number | null) =>
      ratio === null ? null : sequentialColor(scalePosition(clamp(ratio, lo, hi), lo, hi, steps), color),
    [lo, hi, steps, color],
  );
  const fills = useMemo(
    () => rows.flatMap((r) => r.cells.map((c) => fillOf(c.ratio)).filter((f): f is string => f !== null)),
    [rows, fillOf],
  );
  const ink = useContrastInk(rootRef, fills);

  /* ---------- Active cell (pointer or keyboard) ---------- */

  const [active, setActive] = useState<{ r: number; c: number; from: "pointer" | "keyboard" } | null>(null);
  const [focusCell, setFocusCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const act = active && active.r < rows.length && active.c < periodCount ? active : null;

  // Scroll state drives the sticky header / column surfaces (only shown while something passes
  // under them). It flips at most twice per scroll gesture; the tooltip follows its cell by itself.
  const [scrolled, setScrolled] = useState({ x: false, y: false });
  // While the grid scrolls, the cells sliding under a still pointer must not count as hovers
  // (data-scrolling, until the scroll settles), so scrolling never re-renders a row.
  const scrollIdle = useRef(0);
  useEffect(() => () => window.clearTimeout(scrollIdle.current), []);
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const next = { x: Math.abs(el.scrollLeft) > 1, y: el.scrollTop > 1 };
    setScrolled((s) => (s.x === next.x && s.y === next.y ? s : next));
    if (!el.hasAttribute("data-scrolling")) el.setAttribute("data-scrolling", "");
    window.clearTimeout(scrollIdle.current);
    scrollIdle.current = window.setTimeout(() => el.removeAttribute("data-scrolling"), 150);
  };

  // Keep focus scrolling clear of the sticky column and header. A ResizeObserver reports their
  // size after layout (and again whenever it changes); the old layout effect read offsetWidth and
  // offsetHeight after EVERY render, forcing a layout of the whole table each time.
  const hasRows = rows.length > 0;
  useEffect(() => {
    const el = scrollRef.current;
    const col = firstColRef.current;
    const head = headRef.current;
    if (!el || !hasRows || typeof ResizeObserver === "undefined") return;
    const apply = () => {
      el.style.scrollPaddingInlineStart = `${(col?.offsetWidth ?? 0) + 4}px`;
      el.style.scrollPaddingTop = `${(head?.offsetHeight ?? 0) + 4}px`;
    };
    const observer = new ResizeObserver(apply);
    if (col) observer.observe(col);
    if (head) observer.observe(head);
    return () => observer.disconnect();
  }, [hasRows]);

  useCellsEntrance(tableRef, play && rows.length > 0, reduced);

  // Switching views: the new numbers are swept in by ONE glint that crosses the grid (a single
  // compositor animation, however many cells there are), from the inline start to the end.
  const sweep = useEffectEvent(() => {
    const band = sweepRef.current;
    const table = tableRef.current;
    const scroller = scrollRef.current;
    if (reduced || !band || !table || !scroller || typeof band.animate !== "function") return;
    const viewW = scroller.clientWidth;
    const bandW = Math.max(120, Math.round(viewW * 0.4));
    band.style.width = `${bandW}px`;
    band.style.height = `${table.offsetHeight}px`;
    const rtl = isRtlAt(scroller);
    const s = Math.abs(scroller.scrollLeft);
    const col = firstColRef.current?.offsetWidth ?? 0;
    // Physical x of the band: from behind the cohort column to past the view's far edge.
    const [from, to] = rtl ? [-s - col + bandW, -s - viewW] : [s + col - bandW, s + viewW];
    band.animate(
      [
        { transform: `translateX(${from}px)`, opacity: 0 },
        { opacity: 1, offset: 0.25 },
        { opacity: 1, offset: 0.75 },
        { transform: `translateX(${to}px)`, opacity: 0 },
      ],
      { duration: duration.slower * 1000, easing: cssEase(ease.inOut) },
    );
  });
  const shownView = useRef(view);
  useEffect(() => {
    if (shownView.current === view) return;
    shownView.current = view;
    sweep();
  }, [view]);

  /* ---------- Cells, precomputed: a hover re-renders only the two rows it touches ---------- */

  const averageLabel = labelOverrides?.average ?? defaultCohortChartLabels.average;
  const averageNote = labelOverrides?.averageNote ?? defaultCohortChartLabels.averageNote;
  const sizeLabel = labelOverrides?.size ?? defaultCohortChartLabels.size;
  const retainedLabel = labelOverrides?.retained ?? defaultCohortChartLabels.retained;
  const notYet = labelOverrides?.notYet ?? defaultCohortChartLabels.notYet;
  const rowViews = useMemo<RowView[]>(
    () =>
      rows.map((row, r) => ({
        key: row.average ? "\u0000avg" : `${row.name}\u0000${r}`,
        name: row.average ? averageLabel : row.name,
        sub: row.average ? averageNote : sizeLabel(format(row.size)),
        average: row.average,
        cells: row.cells.map((cell, c) => {
          const fill = fillOf(cell.ratio);
          const text = cell.ratio === null ? "" : view === "percent" ? pct(cell.ratio) : format(cell.count ?? 0);
          const other =
            view === "percent"
              ? retainedLabel(format(cell.count ?? 0), format(row.size))
              : cell.ratio === null
                ? ""
                : pct(cell.ratio);
          return {
            fill,
            light: fill !== null && ink(fill) === "light",
            text,
            sr: cell.ratio === null ? notYet : `${text}, ${other}`,
            delay: fill ? Math.min(0.7, (r + c) * 0.028).toFixed(3) : undefined,
            reached: cell.ratio !== null,
          };
        }),
      })),
    // Only the strings it uses: `labels` itself is a new object every render.
    [rows, view, fillOf, ink, format, pct, averageLabel, averageNote, sizeLabel, retainedLabel, notYet],
  );

  const activateCell = useCallback((r: number, c: number, from: "pointer" | "keyboard") => {
    if (from === "pointer" && scrollRef.current?.hasAttribute("data-scrolling")) return;
    setActive((a) => (a?.r === r && a.c === c && a.from === from ? a : { r, c, from }));
  }, []);
  const focusCellAt = useCallback(
    (r: number, c: number) => {
      setFocusCell((f) => (f.r === r && f.c === c ? f : { r, c }));
      activateCell(r, c, "keyboard");
    },
    [activateCell],
  );
  // The click handler reads the latest props from a ref (set after each commit), so it stays the
  // same function and never breaks the rows' memo.
  const latest = useRef({ onCellClick, rows });
  useLayoutEffect(() => {
    latest.current = { onCellClick, rows };
  });
  const clickCell = useCallback((r: number, c: number) => {
    const { onCellClick: click, rows: all } = latest.current;
    const row = all[r];
    const cell = row?.cells[c];
    click?.({
      cohort: row && !row.average ? row.name : null,
      period: c,
      ratio: cell?.ratio ?? null,
      count: cell?.count ?? null,
      size: row?.size ?? 0,
    });
  }, []);

  const hasData = rows.length > 0 && periodCount > 0;
  if (!hasData) {
    return (
      <div {...rest} ref={rootMerged} className={cn("w-full min-w-0", className)}>
        <ChartEmpty height={220} aria-label={ariaLabel}>
          {emptyState}
        </ChartEmpty>
      </div>
    );
  }

  const cellAt = (r: number, c: number): CohortCell => {
    const row = rows[r];
    const cell = row?.cells[c];
    return {
      cohort: row && !row.average ? row.name : null,
      period: c,
      ratio: cell?.ratio ?? null,
      count: cell?.count ?? null,
      size: row?.size ?? 0,
    };
  };

  const focusAt = (r: number, c: number) => {
    const rr = clamp(r, 0, rows.length - 1);
    const cc = clamp(c, 0, periodCount - 1);
    setFocusCell({ r: rr, c: cc });
    setActive({ r: rr, c: cc, from: "keyboard" });
    tableRef.current?.querySelector<HTMLElement>(`[data-r="${rr}"][data-c="${cc}"]`)?.focus();
  };

  function onKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-r]");
    if (!target) return;
    const r = Number(target.dataset.r);
    const c = Number(target.dataset.c);
    const ctrl = event.ctrlKey || event.metaKey;
    const rtl = isRtlAt(target);
    const right = rtl ? -1 : 1;
    switch (event.key) {
      case "ArrowRight":
        focusAt(r, c + right);
        break;
      case "ArrowLeft":
        focusAt(r, c - right);
        break;
      case "ArrowDown":
        focusAt(r + 1, c);
        break;
      case "ArrowUp":
        focusAt(r - 1, c);
        break;
      case "Home":
        focusAt(ctrl ? 0 : r, 0);
        break;
      case "End":
        focusAt(ctrl ? rows.length - 1 : r, ctrl ? periodCount - 1 : Math.max(0, lastReached(r)));
        break;
      case "PageDown":
        focusAt(rows.length - 1, c);
        break;
      case "PageUp":
        focusAt(0, c);
        break;
      case "Enter":
      case " ":
        if (!onCellClick) return;
        onCellClick(cellAt(r, c));
        break;
      case "Escape":
        if (!act) return;
        setActive(null);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  /** Last period this row has a value for. */
  const lastReached = (r: number) => {
    const cells = rows[r]?.cells ?? [];
    for (let p = cells.length - 1; p >= 0; p--) if (cells[p]?.ratio !== null) return p;
    return 0;
  };

  /* ---------- Tooltip ---------- */

  const avgRow = rows[0]?.average ? rows[0] : null;
  const points = new Intl.NumberFormat(locale ?? "en", { maximumFractionDigits: 1 });
  let tooltip: ReactNode = null;
  if (act) {
    const row = itemAt(rows, act.r);
    const cell = itemAt(row.cells, act.c);
    const name = row.average ? labels.average : row.name;
    const retained = cell.ratio === null ? "" : labels.retained(format(cell.count ?? 0), format(row.size));
    // How the cell compares with the weighted average of its period.
    let comparison: { text: string; arrow: string } | null = null;
    const avgRatio = avgRow?.cells[act.c]?.ratio ?? null;
    if (!row.average && cell.ratio !== null && avgRatio !== null) {
      const rounded = Math.round((cell.ratio - avgRatio) * 1000) / 10;
      const direction = rounded > 0 ? "above" : rounded < 0 ? "below" : "same";
      comparison = {
        text: labels.vsAverage(points.format(Math.abs(rounded)), direction),
        arrow: direction === "above" ? "▲" : direction === "below" ? "▼" : "=",
      };
    }
    if (docked) {
      tooltip = (
        <DockedReadout
          title={`${isolate(name)} · ${isolate(labels.period(act.c))}`}
          value={cell.ratio === null ? "" : pct(cell.ratio)}
          color={fillOf(cell.ratio)}
          details={
            cell.ratio === null
              ? [labels.notYet]
              : [retained, comparison ? `${comparison.arrow} ${comparison.text}` : ""].filter(Boolean)
          }
        />
      );
    } else if (rootW > 0) {
      const tipRows =
        cell.ratio === null
          ? [{ label: "", value: isolate(labels.notYet), color: "transparent", kind: "rect" as const }]
          : [
              {
                label: isolate(labels.retention),
                value: isolate(pct(cell.ratio)),
                color: fillOf(cell.ratio) ?? "transparent",
                kind: "rect" as const,
              },
              { label: isolate(retained), value: "", color: "transparent", kind: "rect" as const },
            ];
      if (comparison)
        tipRows.push({ label: isolate(comparison.text), value: comparison.arrow, color: "transparent", kind: "rect" });
      tooltip = (
        <CellTip
          rootRef={rootRef}
          scrollRef={scrollRef}
          tableRef={tableRef}
          r={act.r}
          c={act.c}
          layoutKey={`${view}:${rootW}:${periodCount}:${rows.length}`}
          title={`${isolate(name)} · ${isolate(labels.period(act.c))}`}
          rows={tipRows}
        />
      );
    }
  }

  const activeRatio = act ? (rows[act.r]?.cells[act.c]?.ratio ?? null) : null;
  // A near-opaque surface (no backdrop blur: a sticky cell per row would blow the glass budget and
  // make scrolling repaint) for the sticky header / column, only while something scrolls under them.
  const stickyBg = "bg-[color-mix(in_oklab,var(--sheen-chart-surface)_96%,transparent)]";
  // On a phone the sticky cohort column may take about a third of the width: its names wrap
  // instead, so more periods stay in view.
  const nameMax = rootW > 0 && rootW < 480 ? Math.max(84, Math.round(rootW * 0.32)) : undefined;

  return (
    <div
      {...rest}
      ref={rootMerged}
      className={cn("relative flex w-full min-w-0 flex-col gap-3", className)}
      style={{ paddingTop: docked ? DOCK_BAND : 0 }}
    >
      {viewToggle && (
        <div className="flex justify-end">
          <SegmentedControl
            size="sm"
            aria-label={labels.viewLabel}
            value={view}
            onValueChange={(v) => setView(v as CohortView)}
            items={[
              { value: "percent", label: labels.percent },
              { value: "count", label: labels.count },
            ]}
          />
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="relative overflow-auto overscroll-contain rounded-sheen-sm [scrollbar-width:thin]"
        style={{ maxHeight }}
      >
        <table
          ref={tableRef}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role -- an ARIA grid: cell-to-cell keyboard navigation is handled in onKeyDown on the table (the instructions are read with its name)
          role="grid"
          aria-label={ariaLabel}
          aria-describedby={`${uid}-help`}
          aria-readonly="true"
          onKeyDown={onKeyDown}
          onPointerLeave={(e) => e.pointerType === "mouse" && act?.from === "pointer" && setActive(null)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setActive((a) => (a?.from === "keyboard" ? null : a));
          }}
          // While the entrance wave runs, cells wait (invisible) for their diagonal's turn.
          className="w-full border-separate border-spacing-0 text-xs data-entering:[&_[data-delay]]:opacity-0"
        >
          <thead ref={headRef}>
            <tr>
              <th
                ref={firstColRef}
                scope="col"
                className={cn(
                  "sticky start-0 top-0 z-3 px-2 pb-1.5 text-start align-bottom font-medium whitespace-nowrap text-sheen-fg-muted",
                  (scrolled.x || scrolled.y) && stickyBg,
                )}
              >
                {labels.cohort}
              </th>
              {Array.from({ length: periodCount }, (_, p) => (
                <th
                  key={p}
                  scope="col"
                  className={cn(
                    "sticky top-0 z-2 px-0.5 pb-1.5 text-center align-bottom font-medium whitespace-nowrap",
                    "transition-colors duration-(--sheen-duration-fast)",
                    act?.c === p ? "text-sheen-fg" : "text-sheen-fg-muted",
                    scrolled.y && stickyBg,
                  )}
                >
                  {labels.period(p)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowViews.map((row, r) => (
              <CohortRowView
                key={row.key}
                row={row}
                r={r}
                activeC={act?.r === r ? act.c : -1}
                focusC={focusCell.r === r ? focusCell.c : -1}
                stickyBg={scrolled.x ? stickyBg : undefined}
                nameMax={nameMax}
                clickable={!!onCellClick}
                onActivate={activateCell}
                onFocusCell={focusCellAt}
                onClickCell={clickCell}
              />
            ))}
          </tbody>
        </table>
        {/* The glint that sweeps the new numbers in on a view switch: above the cells, under the
            sticky header and cohort column (z-1 and up), invisible at rest. */}
        <div
          ref={sweepRef}
          aria-hidden
          className={cn(
            "pointer-events-none absolute start-0 top-0 z-0 opacity-0 forced-colors:hidden",
            "bg-linear-to-r from-transparent via-[light-dark(color-mix(in_oklch,var(--sheen-ink-on-dark)_55%,transparent),color-mix(in_oklch,var(--sheen-ink-on-dark)_16%,transparent))] to-transparent",
          )}
        />
      </div>
      <p id={`${uid}-help`} className="sr-only">
        {resolveInstructions(labels.instructions)}
      </p>

      {/* Scales read low → high left to right on every page (as the ramp is drawn). */}
      {legend && (
        // The caption wraps onto its own line on narrow charts; the key itself stays on one line.
        <div dir="ltr" aria-hidden className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
          <span className="text-2xs font-medium text-sheen-fg-muted">{labels.retention}</span>
          <SequentialLegend
            className="flex-nowrap"
            min={lo}
            max={hi}
            color={color}
            steps={steps}
            format={pct}
            marker={activeRatio === null ? null : scalePosition(clamp(activeRatio, lo, hi), lo, hi, steps)}
          />
        </div>
      )}
      {tooltip ?? (docked && <ChartDockHint>{labels.hint}</ChartDockHint>)}
    </div>
  );
}
