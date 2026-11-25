"use client";

import type { ChartRoot } from "./chart-utils";
import { useChartDirection } from "./chart-pointer";
import { useMergedRef } from "../../lib/form";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useLayoutEffect,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartEmpty } from "./chart-parts";
import { useDockedReadout, useInputSource } from "./chart-fit";
import { useCoarsePointer } from "../../hooks/use-media-query";
import { clamp, slotColor, useElementWidth, resolveInstructions } from "./chart-utils";
import { ChartDockHint, useEntrance } from "./heatmap";
import { localeWeekStart } from "./calendar-heatmap";
import { ChartFigure } from "./chart-figure";
import { defaultGanttChartLabels, type GanttScale, type GanttChartProps } from "./gantt/types";
import {
  ganttDay,
  ymd,
  monthStart,
  PX_PER_DAY,
  ORDER,
  slotOf,
  buildModel,
  type TaskRow,
  type Row,
} from "./gantt/model";
import {
  DOCK_BAND,
  HEADER,
  BAR_H,
  DIAMOND,
  isolate,
  cssEase,
  DockedReadout,
  StableTip,
  syncTimeline,
  scrollStart,
  setScrollStart,
} from "./gantt/layout";
import { describeGanttTask, ganttPercent } from "./gantt/describe";
import { startGanttGlide } from "./gantt/glide";
import { buildArrows } from "./gantt/arrows";
import { buildTicks, ganttFormats } from "./gantt/ticks";
import { createActiveStore, type Links } from "./gantt/store";
import { LabelRow, BarRow, GroupBracket, IdleArrows, HotArrows } from "./gantt/rows";
import { GanttToolbar } from "./gantt/toolbar";
import { GanttOverlay } from "./gantt/overlay";
import { LabelHighlight, TimelineHighlight, GanttReadout, GanttAnnouncer, GridLayer, type Ticks } from "./gantt/layers";

export {
  type GanttTask,
  type GanttScale,
  type GanttChartLabels,
  defaultGanttChartLabels,
  type GanttChartProps,
} from "./gantt/types";
export { ganttDay, ganttLegend } from "./gantt/model";
export { type GanttTableProps, GanttTable } from "./gantt/table";

/**
 * Gantt chart: tasks as bars on a timeline, with progress, finish-to-start dependency arrows,
 * milestones, collapsible phases and a today line.
 *
 * - Zoom between days, weeks and months; by default it opens at the most detailed zoom that fits
 *   the whole plan. A zoom change glides around the date in the middle of the view (one
 *   compositor transform for the bars and grid, so it stays smooth on any plan size). Short
 *   plans stretch to fill the width.
 * - The task names stay put while the timeline scrolls sideways inside its own container (on a
 *   phone, a month of days is wider than the screen: it never widens the page); an edge fades
 *   while there's more plan beyond it.
 * - Hover or tap a bar for a glass tooltip (it pins on touch; docked on narrow touch screens);
 *   the task's arrows light up. Focus the timeline: ↑ ↓ move between tasks, ← → scroll, T jumps
 *   to today, + / − zoom; Enter calls onTaskClick.
 * - Bars grow from their start date in a cascade, then the arrows draw in and milestones pop;
 *   rows glide when a phase collapses. Instant with reduced motion.
 * - Right-to-left pages get a mirrored timeline (time runs leftwards).
 *
 * Keyboard: Tab focuses the timeline; Up and Down move between tasks, Left and Right scroll the timeline (mirrored in right-to-left), Home and End jump to the first and last task, T jumps to today, + and - zoom between day, week and month, Escape clears. Enter calls `onTaskClick`. The toolbar buttons (zoom, today, collapse) are normal tab stops.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the task with its dates, progress and dependencies, and the timeline scrolls inside its own container instead of widening the page. `GanttTable` is the table view.
 * Glass and motion: the tooltip is the shared glass surface; the bars and grid are plain SVG. Reduced motion draws and zooms instantly.
 *
 * @example
 * ```tsx
 * import { GanttChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GanttChart
 *       tasks={[
 *         { id: "design", label: "Design", start: "2026-03-02", end: "2026-03-11", progress: 1 },
 *         { id: "build", label: "Build", start: "2026-03-12", end: "2026-03-27", progress: 0.6, dependencies: ["design"] },
 *         { id: "launch", label: "Launch", start: "2026-04-01", milestone: true, dependencies: ["build"] },
 *       ]}
 *       aria-label="Project plan, March to April"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/gantt
 */
export function GanttChart({
  tasks,
  scale: scaleProp,
  defaultScale = "auto",
  onScaleChange,
  toolbar = true,
  today: todayProp,
  locale,
  labelWidth,
  collapsible = true,
  defaultCollapsed = [],
  onTaskClick,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<GanttChartProps>) {
  const labels = { ...defaultGanttChartLabels, ...labelOverrides };
  const reduced = useSheenReducedMotion();
  const coarse = useCoarsePointer();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stretchRef = useRef<SVGSVGElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const fadeRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const docked = useDockedReadout(width);
  const { fromKeyboard, fromPointer, announce } = useInputSource();

  /* ---------- Model ---------- */

  const { taskRows, groups } = useMemo(() => buildModel(tasks), [tasks]);
  const hasTasks = taskRows.length > 0;
  const rtl = useChartDirection(rootRef);
  const todayDay = todayProp === null ? null : (ganttDay(todayProp ?? new Date()) ?? null);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set(defaultCollapsed));

  const [rangeStart, rangeEnd] = useMemo(() => {
    if (!taskRows.length) return [0, 1];
    let lo = Infinity;
    let hi = -Infinity;
    for (const t of taskRows) {
      lo = Math.min(lo, t.start);
      hi = Math.max(hi, t.end);
    }
    // Whole months around the plan (a day of air on each side).
    const a = ymd(lo - 1);
    const b = ymd(hi + 1);
    return [monthStart(a.y, a.m), monthStart(b.y, b.m + 1)];
  }, [taskRows]);
  const totalDays = Math.max(1, rangeEnd - rangeStart);

  const byId = useMemo(() => new Map(taskRows.map((t) => [t.task.id, t])), [taskRows]);

  /** Visible rows (groups and the tasks of expanded groups), in order. */
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const t of taskRows) if (!t.group) out.push(t);
    groups.forEach((g, gi) => {
      const members = taskRows.filter((t) => t.group === g);
      if (!members.length) return;
      out.push({
        kind: "group",
        key: `\u0000group:${g}`,
        name: g,
        start: Math.min(...members.map((m) => m.start)),
        end: Math.max(...members.map((m) => m.end)),
        count: members.length,
        color: slotOf(gi),
      });
      if (!collapsed.has(g)) out.push(...members);
    });
    return out;
  }, [taskRows, groups, collapsed]);

  /* ---------- Geometry ---------- */

  const rowH = coarse ? 44 : 36;
  const groupH = coarse ? 44 : 32;
  const longest = taskRows.reduce(
    (n, t) => Math.max(n, t.task.label.length),
    Math.max(...groups.map((g) => g.length + 4), 0),
  );
  const labelW =
    labelWidth ??
    Math.round(clamp(longest * 7 + 36, 104, Math.max(104, Math.min(260, width * (width < 520 ? 0.38 : 0.3)))));
  const viewW = Math.max(0, width - labelW);
  const fitPx = viewW / totalDays;

  // Uncontrolled and untouched: the most detailed zoom at which the whole plan fits.
  const [innerScale, setInnerScale] = useState<GanttScale | null>(defaultScale === "auto" ? null : defaultScale);
  const autoScale: GanttScale = fitPx >= PX_PER_DAY.day ? "day" : fitPx >= PX_PER_DAY.week ? "week" : "month";
  const scale = scaleProp ?? innerScale ?? autoScale;
  // A zoom re-renders every bar and tick: a transition, so the render is sliced and never blocks input.
  const setScale = (s: GanttScale) =>
    startTransition(() => {
      if (scaleProp === undefined) setInnerScale(s);
      onScaleChange?.(s);
    });

  const px = Math.max(PX_PER_DAY[scale], fitPx);
  const contentW = Math.ceil(totalDays * px);
  /** Inline-start offset of a day. */
  const xOf = (day: number) => (day - rangeStart) * px;
  /** Inline-start offset → x in the SVG (mirrored on right-to-left pages). */
  const X = (offset: number) => (rtl ? contentW - offset : offset);
  /** Box of the span [a, b) in SVG x. */
  const span = (a: number, b: number) => {
    const s = xOf(a);
    const e = xOf(b);
    return rtl ? { x: contentW - e, w: e - s } : { x: s, w: e - s };
  };

  const rowY = useMemo(() => {
    const ys: number[] = [];
    let y = HEADER;
    for (const r of rows) {
      ys.push(y);
      y += r.kind === "group" ? groupH : rowH;
    }
    ys.push(y);
    return ys;
  }, [rows, rowH, groupH]);
  const height = rowY[rowY.length - 1] ?? HEADER;
  const rowIndex = useMemo(() => new Map(rows.map((r, i) => [r.key, i])), [rows]);
  const taskOrder = useMemo(() => rows.flatMap((r, i) => (r.kind === "task" ? [i] : [])), [rows]);

  /* ---------- Active task ---------- */

  const store = useMemo(() => createActiveStore(), []);
  const posRef = useRef(0);
  const activate = useCallback((key: string | null) => store.set({ key, scroll: posRef.current }), [store]);

  /** Each task's partners by an arrow (either way): they light up with it. */
  const links = useMemo<Links>(() => {
    const map = new Map<string, Set<string>>();
    const link = (a: string, b: string) => {
      const set = map.get(a);
      if (set) set.add(b);
      else map.set(a, new Set([b]));
    };
    const ids = new Set(taskRows.map((t) => t.task.id));
    for (const t of taskRows)
      for (const dep of t.task.dependencies ?? [])
        if (ids.has(dep) && dep !== t.task.id) {
          link(t.task.id, dep);
          link(dep, t.task.id);
        }
    return map;
  }, [taskRows]);

  /* ---------- Scrolling: written to the DOM, never a render per frame ---------- */

  const sync = useCallback(() => {
    const el = scrollRef.current;
    const overlay = overlayRef.current;
    if (el && overlay) syncTimeline(el, overlay, posRef.current);
  }, []);
  const raf = useRef(0);
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    posRef.current = scrollStart(el, rtl);
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      sync();
      const { key } = store.get();
      if (key !== null) store.set({ key, scroll: posRef.current }); // keep the tooltip on its bar
    });
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // First layout: the plan's start, unless that would leave today out of view: then today, a third
  // of the way in. Again if the page's direction flips.
  const placedFor = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (placedFor.current === rtl || !el || width === 0 || !taskRows.length) return;
    placedFor.current = rtl;
    const first = Math.min(...taskRows.map((t) => t.start));
    const startAt = (first - rangeStart) * px - 24;
    const view = el.clientWidth;
    const todayAt =
      todayDay !== null && todayDay >= rangeStart && todayDay < rangeEnd ? (todayDay - rangeStart) * px : null;
    setScrollStart(
      el,
      rtl,
      todayAt === null || (todayAt > startAt + 40 && todayAt < startAt + view - 40) ? startAt : todayAt - view / 3,
    );
    posRef.current = scrollStart(el, rtl);
    sync();
  }, [width, taskRows, rtl, px, rangeStart, rangeEnd, todayDay, sync]);

  // A zoom (or resize) keeps the day in the middle of the view where it is. A zoom also GLIDES:
  // the bars and grid render once at the new zoom, then one transform (on the compositor) takes
  // them from where they were to where they are; diamonds slide, labels fade back in.
  const [gliding, setGliding] = useState(false);
  const flips = useRef<Animation[]>([]);
  const before = useRef<{ px: number; width: number; scale: GanttScale } | null>(null);
  useLayoutEffect(() => {
    const prev = before.current;
    before.current = { px, width, scale };
    const el = scrollRef.current;
    if (!prev || !el || prev.width === 0 || width === 0 || prev.px === px || placedFor.current === null) return;
    const view = el.clientWidth;
    const from = posRef.current;
    const anchor = (from + view / 2) / prev.px;
    setScrollStart(el, rtl, anchor * px - view / 2);
    const to = scrollStart(el, rtl);
    posRef.current = to;
    sync();
    if (prev.scale === scale || prev.width !== width || reduced) return;

    for (const a of flips.current) a.cancel();
    const list = startGanttGlide({
      fromPx: prev.px,
      px,
      shift: (rtl ? -1 : 1) * (to - from),
      rtl,
      contentW,
      stretch: stretchRef.current,
      overlay: overlayRef.current,
      fade: fadeRef.current,
    });
    flips.current = list;
    const lead = list[0];
    if (!lead) return;
    // The glide is started here with the Web Animations API, from layout measured in this effect; the state only marks it running.
    setGliding(true);
    lead.finished.then(
      () => {
        setGliding(false);
        const { key } = store.get();
        store.set({ key, scroll: posRef.current });
      },
      () => undefined, // cancelled by the next zoom, which takes over
    );
  }, [px, width, scale, rtl, reduced, contentW, sync, store]);
  useEffect(() => () => flips.current.forEach((a) => a.cancel()), []);

  // A lit-up arrow fades in when it appears (a stable ref callback: no component, no state).
  const fadeIn = useCallback(
    (el: SVGGElement | null) => {
      if (el && !reduced && typeof el.animate === "function")
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration.fast * 1000, easing: cssEase(ease.out) });
    },
    [reduced],
  );

  // Rows drawn in the first commit with a width are the first view (no fade-in); later ones fade in.
  // (Children's layout effects run before this one, so they still see `true` in that commit.)
  const firstView = useRef(true);
  // Long plans skip the collapse glide: a hundred rows animating at once would not stay smooth.
  const glide = rows.length <= 60;
  useLayoutEffect(() => {
    if (width > 0 && hasTasks) firstView.current = false;
  });

  // The arrows draw in once; arrows that light up later (hover) just fade in.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!play || settled) return;
    const t = window.setTimeout(() => setSettled(true), 1900);
    return () => window.clearTimeout(t);
  }, [play, settled]);

  /* ---------- Ticks ---------- */

  const fmt = useMemo(() => ganttFormats(locale), [locale]);
  const weekStart = useMemo(() => localeWeekStart(locale), [locale]);

  const ticks = useMemo<Ticks>(
    () => buildTicks(rangeStart, rangeEnd, scale, fmt, weekStart),
    [rangeStart, rangeEnd, scale, fmt, weekStart],
  );

  // New or moved labels get their sticky position / visibility before they paint. (Only when the
  // geometry changes: a hover never pays for it.)
  useLayoutEffect(() => {
    sync();
  }, [sync, ticks, rows, rowY, px, contentW, viewW, rtl]);

  // Arrows: finish-to-start. They leave from under the end of the predecessor (so they never cross
  // its progress label) and enter the successor's start from the side.
  const arrows = useMemo(
    () => buildArrows({ rows, byId, rowIndex, rowY, rowH, rangeStart, px, rtl, contentW }),
    [rows, rowIndex, rowY, byId, rangeStart, px, rowH, rtl, contentW],
  );

  /* ---------- Handlers ---------- */

  const toggleGroup = useCallback(
    (name: string) =>
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      }),
    [],
  );
  const onLabelEnter = useCallback(
    (key: string) => {
      fromPointer();
      activate(key);
    },
    [fromPointer, activate],
  );
  const onLabelLeave = useCallback(() => activate(null), [activate]);

  const revealTask = (row: TaskRow) => {
    const el = scrollRef.current;
    if (!el) return;
    const a = xOf(row.start) - (row.milestone ? DIAMOND : 0);
    const b = xOf(row.end) + (row.milestone ? DIAMOND : 0);
    const s = scrollStart(el, rtl);
    const view = el.clientWidth;
    if (a >= s + 16 && b <= s + view - 16) return;
    const target = b - a > view - 32 ? a - 24 : a - Math.max(24, (view - (b - a)) / 3);
    setScrollStart(el, rtl, target, !reduced);
  };

  function moveTo(i: number | undefined) {
    if (i === undefined) return;
    const row = rows[i];
    if (row?.kind !== "task") return;
    fromKeyboard();
    activate(row.key);
    revealTask(row);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const activeKey = store.get().key;
    const activeRow = activeKey === null ? undefined : rows[rowIndex.get(activeKey) ?? -1];
    const activeTask = activeRow?.kind === "task" ? activeRow : null;
    const cur = activeTask ? taskOrder.indexOf(rowIndex.get(activeTask.key) ?? -1) : -1;
    const el = scrollRef.current;
    const unit = scale === "day" ? px : scale === "week" ? px * 7 : px * 30;
    switch (event.key) {
      case "ArrowDown":
        moveTo(taskOrder[cur < 0 ? 0 : Math.min(taskOrder.length - 1, cur + 1)]);
        break;
      case "ArrowUp":
        moveTo(taskOrder[cur < 0 ? 0 : Math.max(0, cur - 1)]);
        break;
      case "Home":
        moveTo(taskOrder[0]);
        break;
      case "End":
        moveTo(taskOrder[taskOrder.length - 1]);
        break;
      case "ArrowRight":
      case "ArrowLeft": {
        if (!el) return;
        const forward = (event.key === "ArrowRight") !== rtl;
        setScrollStart(el, rtl, scrollStart(el, rtl) + (forward ? unit : -unit), !reduced);
        break;
      }
      case "t":
      case "T":
        if (todayDay === null || !el) return;
        setScrollStart(el, rtl, xOf(todayDay) - el.clientWidth / 3, !reduced);
        break;
      case "+":
      case "=":
      case "-":
      case "_": {
        const i = ORDER.indexOf(scale);
        const next = ORDER[clamp(i + (event.key === "+" || event.key === "=" ? 1 : -1), 0, ORDER.length - 1)];
        if (next && next !== scale) setScale(next);
        break;
      }
      case "Enter":
      case " ":
        if (!activeTask || !onTaskClick) return;
        onTaskClick(activeTask.task);
        break;
      case "Escape":
        if (activeKey === null) return;
        activate(null);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  /** The row under a pointer event on the timeline. */
  const rowAt = (event: ReactPointerEvent<HTMLDivElement>) => {
    const y = event.clientY - event.currentTarget.getBoundingClientRect().top;
    const i = rowY.findIndex((top, k) => y >= top && y < (rowY[k + 1] ?? -1));
    return rows[i];
  };

  /* ---------- Formatting ---------- */

  const pct = useMemo(() => ganttPercent(locale), [locale]);
  const describe = (row: TaskRow) => describeGanttTask(row, { fmt, labels, pct, byId });

  if (!hasTasks) {
    return (
      <ChartEmpty height={240} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  /* ---------- Tooltip ---------- */

  const dock = docked ? DOCK_BAND : 0;
  /** The reading of the task `key` (with the timeline scrolled to `scroll`): the tooltip or the docked readout. */
  const read = (key: string, scroll: number): ReactNode => {
    const row = rows[rowIndex.get(key) ?? -1];
    if (row?.kind !== "task" || width === 0 || gliding) return null;
    const i = rowIndex.get(row.key) ?? 0;
    const y = rowY[i] ?? 0;
    const box = row.milestone ? { x: X(xOf(row.start) + px / 2) - DIAMOND / 2, w: DIAMOND } : span(row.start, row.end);
    // From timeline coordinates to the chart box: past the label column, minus the scroll.
    const scrolledX = rtl ? box.x - (contentW - viewW - scroll) : box.x - scroll;
    const left = clamp(scrolledX, -box.w, viewW) + (rtl ? 0 : labelW);
    const parts = describe(row);
    return docked ? (
      <DockedReadout
        title={row.task.label}
        value={parts[0] ?? ""}
        color={slotColor(row.color)}
        details={parts.slice(1)}
      />
    ) : (
      <StableTip
        title={isolate(row.task.label)}
        rows={parts.map((p, k) => ({
          label: k === 0 ? "" : isolate(p),
          value: k === 0 ? isolate(p) : "",
          color: k === 0 ? slotColor(row.color) : "transparent",
          kind: "rect" as const,
        }))}
        anchor={{ x: left, y: y + (rowH - BAR_H) / 2, w: Math.min(box.w, viewW), h: BAR_H }}
        bounds={{ w: width, h: height }}
        order={["below", "above", rtl ? "left" : "right", rtl ? "right" : "left"]}
      />
    );
  };
  /** What a keyboard move to `key` announces (nothing for pointer reads). */
  const announcement = (key: string) => {
    const row = rows[rowIndex.get(key) ?? -1];
    return row?.kind === "task" ? announce(`${row.task.label}: ${describe(row).join(", ")}`) : "";
  };

  /* ---------- Render ---------- */

  const todayIn = todayDay !== null && todayDay >= rangeStart && todayDay < rangeEnd;
  const todayX = todayDay === null ? 0 : X(xOf(todayDay) + px / 2);
  const countText = (n: number) => (labelW >= 160 ? labels.tasks(n) : null);

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col gap-3", className)}>
      {toolbar && (
        <GanttToolbar
          labels={labels}
          scale={scale}
          onScale={setScale}
          showToday={todayDay !== null}
          todayEnabled={todayIn}
          onToday={() => {
            const el = scrollRef.current;
            if (el && todayDay !== null) setScrollStart(el, rtl, xOf(todayDay) - el.clientWidth / 3, !reduced);
          }}
        />
      )}

      <div ref={measureRef} className="relative w-full" style={{ paddingTop: dock }}>
        {width > 0 && (
          <div className="flex w-full" style={{ height }}>
            {/* Task names stay put while the timeline scrolls; phase rows are real disclosure buttons. */}
            <div className="relative shrink-0 overflow-hidden border-e border-sheen-border" style={{ width: labelW }}>
              <p
                aria-hidden
                className="absolute inset-x-0 top-0 flex items-end px-2 pb-1.5 text-xs font-medium text-sheen-fg-muted"
                style={{ height: HEADER }}
              >
                {labels.task}
              </p>
              {/* Sliding highlight behind the active row. */}
              <LabelHighlight store={store} rowIndex={rowIndex} rowY={rowY} rowH={rowH} reduced={reduced} />
              <AnimatePresence initial={false}>
                {rows.map((row, i) => (
                  <LabelRow
                    key={row.key}
                    row={row}
                    y={rowY[i] ?? 0}
                    height={row.kind === "group" ? groupH : rowH}
                    store={store}
                    links={links}
                    collapsed={row.kind === "group" && collapsed.has(row.name)}
                    collapsible={collapsible}
                    countText={row.kind === "group" ? countText(row.count) : null}
                    reduced={reduced}
                    glide={glide}
                    firstView={firstView}
                    onEnter={onLabelEnter}
                    onLeave={onLabelLeave}
                    onToggle={toggleGroup}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* The timeline: one focusable, sideways-scrolling region. Its focus ring is drawn by the
                wrapper, outside the edge-fade mask. */}
            <div className="relative min-w-0 flex-1 rounded-sheen-sm has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sheen-focus">
              <ChartFigure
                as="div"
                ref={scrollRef}
                roleDescription={labels.roleDescription}
                label={ariaLabel}
                description={resolveInstructions(labels.instructions)}
                tabIndex={0}
                onKeyDown={onKeyDown}
                onScroll={onScroll}
                onBlur={() => activate(null)}
                onPointerLeave={(e) => e.pointerType === "mouse" && activate(null)}
                className={cn(
                  "relative overflow-x-auto overflow-y-hidden overscroll-x-contain outline-none [scrollbar-width:thin]",
                  "data-fade:[mask-image:linear-gradient(to_right,transparent,#000_var(--gantt-fade-l),#000_calc(100%_-_var(--gantt-fade-r)),transparent)]",
                )}
              >
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- pointer-only hit area over the timeline; the keyboard equivalent is the focusable timeline group around it */}
                <div
                  className="relative"
                  style={{ width: contentW, height }}
                  onPointerMove={(e) => {
                    if (e.pointerType !== "mouse") return;
                    const row = rowAt(e);
                    fromPointer();
                    activate(row?.kind === "task" ? row.key : null);
                  }}
                  onPointerDown={(e) => {
                    if (e.pointerType === "mouse") return;
                    const row = rowAt(e);
                    fromPointer();
                    activate(row?.kind === "task" ? row.key : null);
                  }}
                  onClick={(e) => {
                    if (!onTaskClick) return;
                    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                    const row = rows[rowY.findIndex((top, k) => y >= top && y < (rowY[k + 1] ?? -1))];
                    if (row?.kind === "task") onTaskClick(row.task);
                  }}
                >
                  {/* Bars, grid and arrows: one layer a zoom stretches on the compositor. */}
                  <svg
                    ref={stretchRef}
                    aria-hidden
                    width={contentW}
                    height={height}
                    className="block"
                    // Coordinates are already mirrored for right-to-left pages: anchors must stay physical.
                    style={{ direction: "ltr", transformOrigin: rtl ? "100% 0" : "0 0" }}
                  >
                    <GridLayer
                      ticks={ticks}
                      weekends={scale === "day"}
                      rangeStart={rangeStart}
                      px={px}
                      contentW={contentW}
                      height={height}
                      rtl={rtl}
                    />

                    {/* Active row highlight (glides between rows). */}
                    <TimelineHighlight
                      store={store}
                      rowIndex={rowIndex}
                      rowY={rowY}
                      rowH={rowH}
                      width={contentW}
                      reduced={reduced}
                    />

                    {/* Today: under the bars and their labels, so it never strikes through a value. */}
                    {todayIn && (
                      <motion.line
                        x1={todayX}
                        x2={todayX}
                        y1={HEADER}
                        y2={height}
                        strokeWidth={1.5}
                        className="pointer-events-none stroke-sheen-accent forced-colors:stroke-[Highlight]"
                        style={{
                          filter: "drop-shadow(0 0 4px light-dark(transparent, var(--sheen-accent-glow)))",
                          originY: 0,
                        }}
                        initial={reduced ? false : { scaleY: 0 }}
                        animate={play ? { scaleY: 1 } : undefined}
                        transition={
                          reduced ? { duration: 0 } : { duration: duration.slower, ease: ease.out, delay: 0.2 }
                        }
                      />
                    )}

                    {/* Idle arrows run under the bars, so they never cover a task. */}
                    <IdleArrows store={store} arrows={arrows} play={play} reduced={reduced} settled={settled} />

                    {/* Phase brackets and task bars. */}
                    <AnimatePresence initial={false}>
                      {rows.map((row, i) => {
                        const y = rowY[i] ?? 0;
                        if (row.kind === "group") {
                          const { x, w } = span(row.start, row.end);
                          return (
                            <GroupBracket
                              key={row.key}
                              y={y}
                              x={x}
                              w={w}
                              groupH={groupH}
                              color={row.color}
                              order={i}
                              play={play}
                              reduced={reduced}
                              glide={glide}
                              firstView={firstView}
                            />
                          );
                        }
                        if (row.milestone) return null;
                        const { x, w } = span(row.start, row.end);
                        return (
                          <BarRow
                            key={row.key}
                            index={row.index}
                            y={y}
                            x={x}
                            w={Math.max(2, w - 2)}
                            rowH={rowH}
                            color={row.color}
                            progress={row.progress}
                            rowKey={row.key}
                            store={store}
                            rtl={rtl}
                            play={play}
                            reduced={reduced}
                            order={i}
                            glide={glide}
                            firstView={firstView}
                          />
                        );
                      })}
                    </AnimatePresence>

                    {/* The active task's arrows, lit up above the bars. */}
                    <HotArrows store={store} arrows={arrows} fadeIn={fadeIn} />
                  </svg>

                  <GanttOverlay
                    svgRef={overlayRef}
                    fadeRef={fadeRef}
                    store={store}
                    rows={rows}
                    rowY={rowY}
                    rowH={rowH}
                    ticks={ticks}
                    scale={scale}
                    rangeStart={rangeStart}
                    px={px}
                    contentW={contentW}
                    viewW={viewW}
                    height={height}
                    rtl={rtl}
                    todayDay={todayDay}
                    todayIn={todayIn}
                    todayX={todayX}
                    X={X}
                    xOf={xOf}
                    fmt={fmt}
                    pct={pct}
                    play={play}
                    reduced={reduced}
                    glide={glide}
                    firstView={firstView}
                  />
                </div>
              </ChartFigure>
            </div>
          </div>
        )}
        {width === 0 && <div aria-hidden style={{ height: HEADER + rows.length * rowH }} />}
        <GanttReadout
          store={store}
          read={read}
          fallback={docked ? <ChartDockHint>{labels.hint}</ChartDockHint> : null}
        />
      </div>

      <GanttAnnouncer store={store} text={announcement} />
    </div>
  );
}
