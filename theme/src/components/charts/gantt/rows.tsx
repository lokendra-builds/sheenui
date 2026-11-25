"use client";

import { memo, useRef, useSyncExternalStore, type RefObject, useLayoutEffect } from "react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { duration, ease } from "../../../motion/tokens";
import { slotColor, type ChartColor } from "../chart-utils";
import { hueMix } from "../heatmap";
import { type Row } from "./model";
import { BAR_H, DIAMOND, HALO, cssEase, glow, cascadeDelay, useRow, useEntranceAnimation, GroupDot } from "./layout";
import { useActiveKey, useIsActive, type ActiveStore, type Links } from "./store";

/* ---------- Memoised rows: a hover re-renders only the rows that change ---------- */

/** Props of a row of the label column: the row, its position and its state. */
export type LabelRowProps = {
  row: Row;
  y: number;
  height: number;
  store: ActiveStore;
  links: Links;
  collapsed: boolean;
  collapsible: boolean;
  countText: string | null;
  reduced: boolean;
  /** False on long plans: rows jump instead of gliding. */
  glide: boolean;
  /** True during the chart's first render: rows present then don't fade in. */
  firstView: RefObject<boolean>;
  onEnter: (key: string) => void;
  onLeave: () => void;
  onToggle: (group: string) => void;
};

/** A row of the task-name column: a phase (a disclosure button) or a task name. */
export const LabelRow = memo(function LabelRow({
  row,
  y,
  height,
  store,
  links,
  collapsed,
  collapsible,
  countText,
  reduced,
  glide,
  firstView,
  onEnter,
  onLeave,
  onToggle,
}: LabelRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  useRow(ref, y, reduced, firstView, { appear: true, glide });
  // Lit while its task is being read, or one linked to it by an arrow.
  const hot = useSyncExternalStore(
    store.subscribe,
    () => {
      const key = store.get().key;
      return row.kind === "task" && key !== null && (key === row.key || (links.get(key)?.has(row.key) ?? false));
    },
    () => false,
  );
  const name =
    row.kind === "group" ? (
      <>
        <GroupDot color={row.color} />
        <span dir="auto" className="truncate">
          {row.name}
        </span>
        {countText && (
          <span className="shrink-0 font-normal text-sheen-fg-muted">
            <span aria-hidden>· </span>
            <bdi>{countText}</bdi>
          </span>
        )}
      </>
    ) : null;
  return (
    <div
      ref={ref}
      className="absolute inset-x-0 flex items-center"
      style={{ height, top: y }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse" && row.kind === "task") onEnter(row.key);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") onLeave();
      }}
    >
      {row.kind === "group" ? (
        collapsible ? (
          <button
            type="button"
            aria-expanded={!collapsed}
            onClick={() => onToggle(row.name)}
            className={cn(
              "mx-1 flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-sheen-sm px-1 text-start text-xs font-semibold text-sheen-fg",
              "transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover",
              "focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
            )}
          >
            <svg
              aria-hidden
              width={10}
              height={10}
              viewBox="0 0 10 10"
              className={cn(
                "shrink-0 text-sheen-fg-muted motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
                collapsed ? "rtl:rotate-180" : "rotate-90",
              )}
            >
              <path
                d="M3.5 2l3 3-3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {name}
          </button>
        ) : (
          <span className="flex min-w-0 items-center gap-1.5 px-2 text-xs font-semibold text-sheen-fg">{name}</span>
        )
      ) : (
        <span
          dir="auto"
          className={cn(
            "truncate pe-2 text-xs transition-colors duration-(--sheen-duration-fast)",
            row.group ? "ps-6" : "ps-2",
            // Colour only: a weight change would re-lay out (and widen) the name on every hover.
            hot ? "text-sheen-fg" : "text-sheen-fg-muted",
          )}
          title={row.task.label}
        >
          {row.milestone && (
            <svg
              aria-hidden
              width={8}
              height={8}
              viewBox="0 0 8 8"
              className="me-1.5 inline-block align-[-0.5px] text-sheen-fg-subtle"
            >
              <rect x={1.2} y={1.2} width={5.6} height={5.6} rx={1} transform="rotate(45 4 4)" fill="currentColor" />
            </svg>
          )}
          {row.task.label}
        </span>
      )}
    </div>
  );
});

/** Props of a row of the bar area: the row, its position and its state. */
export type BarRowProps = {
  index: number;
  y: number;
  x: number;
  w: number;
  rowH: number;
  color: ChartColor | 0;
  progress: number | null;
  rowKey: string;
  store: ActiveStore;
  rtl: boolean;
  play: boolean;
  reduced: boolean;
  order: number;
  glide: boolean;
  firstView: RefObject<boolean>;
};

/** A task bar: tinted for the whole task, full colour for what's done; it grows from its start date. */
export const BarRow = memo(function BarRow({
  index,
  y,
  x,
  w,
  rowH,
  color,
  progress,
  rowKey,
  store,
  rtl,
  play,
  reduced,
  order,
  glide,
  firstView,
}: BarRowProps) {
  const hot = useIsActive(store, rowKey);
  const rowRef = useRef<SVGGElement>(null);
  const growRef = useRef<SVGGElement>(null);
  const doneRef = useRef<SVGPathElement>(null);
  useRow(rowRef, y, reduced, firstView, { glide });
  // A progress change glides: the done part is drawn at its new width, then scaled from the old one.
  const lastProgress = useRef(progress);
  useLayoutEffect(() => {
    const prev = lastProgress.current;
    lastProgress.current = progress;
    const el = doneRef.current;
    if (
      reduced ||
      !el ||
      typeof el.animate !== "function" ||
      prev === null ||
      progress === null ||
      prev === progress ||
      progress <= 0
    )
      return;
    el.animate([{ transform: `scaleX(${prev / progress})` }, { transform: "none" }], {
      duration: duration.slow * 1000,
      easing: cssEase(ease.inOut),
    });
  }, [progress, reduced]);
  const waiting = useEntranceAnimation(
    growRef,
    play,
    reduced,
    () => [{ transform: "scaleX(0)" }, { transform: "none" }],
    () => ({ duration: duration.slow * 1000, delay: cascadeDelay(order, 0.05) * 1000, easing: cssEase(ease.out) }),
  );
  const c = slotColor(color);
  const origin = rtl ? "right center" : "left center";
  const top = y + (rowH - BAR_H) / 2;
  const doneW = progress === null ? 0 : w * progress;
  return (
    <g ref={rowRef}>
      <g
        data-task={index}
        ref={growRef}
        style={{ transformBox: "fill-box", transformOrigin: origin, transform: waiting ? "scaleX(0)" : undefined }}
      >
        <g style={{ filter: hot ? glow(color) : undefined }}>
          <rect
            x={x}
            y={top}
            width={w}
            height={BAR_H}
            rx={4}
            style={{ fill: progress === null ? c : hueMix(color || 1, 0.3) }}
            className="forced-colors:stroke-[CanvasText]"
          />
          {/* What's done, from the task's start: rounded at the start (and at the end once complete).
              A shaped path rather than a clip: a clip per bar would cost a paint chunk per bar. */}
          {progress !== null && doneW > 0 && (
            <path
              ref={doneRef}
              d={donePath(x, top, w, doneW, rtl)}
              style={{ fill: c, transformBox: "fill-box", transformOrigin: origin }}
            />
          )}
          {/* Hairline top sheen: a touch of depth on every bar. */}
          <rect
            x={x + 3}
            y={top + 1}
            width={Math.max(0, w - 6)}
            height={1}
            className="pointer-events-none"
            fill="var(--sheen-chart-surface)"
            opacity={0.35}
          />
        </g>
      </g>
    </g>
  );
});

/**
 * The done part of a bar `w` wide at `x`: `doneW` from its start, with the bar's 4px corners at
 * the start, and at the end too once it reaches it.
 */
export function donePath(x: number, y: number, w: number, doneW: number, rtl: boolean) {
  const r = Math.min(4, doneW / 2, BAR_H / 2);
  const full = doneW >= w - 0.5;
  const re = full ? r : 0; // the end's corner radius
  const a = rtl ? x + w : x; // the start edge
  const b = rtl ? a - doneW : a + doneW; // the end edge
  const s = rtl ? -1 : 1; // inline direction
  const f = (n: number) => Math.round(n * 100) / 100;
  // Start top corner → end top → end bottom → start bottom, every corner an arc.
  return (
    `M${f(a + s * r)},${f(y)}H${f(b - s * re)}` +
    (re ? `A${f(re)},${f(re)} 0 0 ${rtl ? 0 : 1} ${f(b)},${f(y + re)}` : "") +
    `V${f(y + BAR_H - re)}` +
    (re ? `A${f(re)},${f(re)} 0 0 ${rtl ? 0 : 1} ${f(b - s * re)},${f(y + BAR_H)}` : "") +
    `H${f(a + s * r)}A${f(r)},${f(r)} 0 0 ${rtl ? 0 : 1} ${f(a)},${f(y + BAR_H - r)}V${f(y + r)}A${f(r)},${f(r)} 0 0 ${rtl ? 0 : 1} ${f(a + s * r)},${f(y)}Z`
  );
}

/** A phase summary: a bracket spanning the phase. */
export const GroupBracket = memo(function GroupBracket({
  y,
  x,
  w,
  groupH,
  color,
  order,
  play,
  reduced,
  glide,
  firstView,
}: {
  y: number;
  x: number;
  w: number;
  groupH: number;
  color: ChartColor | 0;
  order: number;
  play: boolean;
  reduced: boolean;
  glide: boolean;
  firstView: RefObject<boolean>;
}) {
  const ref = useRef<SVGGElement>(null);
  useRow(ref, y, reduced, firstView, { glide });
  const waiting = useEntranceAnimation(
    ref,
    play,
    reduced,
    () => [{ opacity: 0 }, { opacity: 1 }],
    () => ({ duration: duration.slow * 1000, delay: cascadeDelay(order, 0) * 1000, easing: cssEase(ease.out) }),
  );
  return (
    <g ref={ref} style={{ opacity: waiting ? 0 : undefined }}>
      <path
        d={`M${x},${y + groupH / 2 + 6}V${y + groupH / 2 - 1}H${x + w}V${y + groupH / 2 + 6}`}
        fill="none"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ stroke: `color-mix(in oklab, ${slotColor(color)} 70%, var(--sheen-fg-subtle))` }}
        className="forced-colors:stroke-[CanvasText]"
      />
    </g>
  );
});

/** A milestone diamond. `data-fx` lets a zoom glide slide it (it never stretches). */
export const MilestoneMark = memo(function MilestoneMark({
  index,
  y,
  cx,
  rowH,
  color,
  rowKey,
  store,
  order,
  play,
  reduced,
  glide,
  firstView,
}: {
  index: number;
  y: number;
  cx: number;
  rowH: number;
  color: ChartColor | 0;
  rowKey: string;
  store: ActiveStore;
  order: number;
  play: boolean;
  reduced: boolean;
  glide: boolean;
  firstView: RefObject<boolean>;
}) {
  const hot = useIsActive(store, rowKey);
  const rowRef = useRef<SVGGElement>(null);
  const popRef = useRef<SVGGElement>(null);
  useRow(rowRef, y, reduced, firstView, { glide });
  // It pops in with a little overshoot (a playful moment, like spring.bouncy), after the bars.
  const waiting = useEntranceAnimation(
    popRef,
    play,
    reduced,
    () => [
      { transform: "scale(0) rotate(-45deg)" },
      { transform: "scale(1.14) rotate(3deg)", offset: 0.62 },
      { transform: "none" },
    ],
    () => ({
      duration: duration.slower * 1000,
      delay: (0.25 + Math.min(0.8, order * 0.045)) * 1000,
      easing: cssEase(ease.out),
    }),
  );
  return (
    <g ref={rowRef}>
      <g data-fx={cx}>
        <g
          ref={popRef}
          data-task={index}
          style={{ transformBox: "fill-box", transformOrigin: "center", transform: waiting ? "scale(0)" : undefined }}
        >
          <rect
            x={cx - DIAMOND / 2}
            y={y + rowH / 2 - DIAMOND / 2}
            width={DIAMOND}
            height={DIAMOND}
            rx={2.5}
            transform={`rotate(45 ${cx} ${y + rowH / 2})`}
            strokeWidth={2}
            style={{
              fill: slotColor(color),
              stroke: "var(--sheen-chart-surface)",
              filter: hot ? glow(color) : undefined,
            }}
            className="forced-colors:stroke-[CanvasText]"
          />
        </g>
      </g>
    </g>
  );
});

/** A bar's progress or a milestone's date, beside it. Hidden (by syncTimeline) while the view's edge would cut it. */
export const RowLabel = memo(function RowLabel({
  y,
  x,
  text,
  rowH,
  rowKey,
  store,
  rtl,
  fitStart,
  order,
  play,
  reduced,
  glide,
  firstView,
}: {
  y: number;
  x: number;
  text: string;
  rowH: number;
  rowKey: string;
  store: ActiveStore;
  rtl: boolean;
  /** Offset of the label's start from the timeline's inline start (px). */
  fitStart: number;
  order: number;
  play: boolean;
  reduced: boolean;
  glide: boolean;
  firstView: RefObject<boolean>;
}) {
  const hot = useIsActive(store, rowKey);
  const rowRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  useRow(rowRef, y, reduced, firstView, { glide });
  const waiting = useEntranceAnimation(
    textRef,
    play,
    reduced,
    () => [{ opacity: 0 }, { opacity: 1 }],
    () => ({ duration: duration.slow * 1000, delay: cascadeDelay(order, 0.35) * 1000, easing: cssEase(ease.out) }),
  );
  return (
    <g ref={rowRef}>
      <g
        data-fit=""
        data-o={fitStart}
        data-w={text.length * 6.2}
        className="motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast) data-out:opacity-0"
      >
        <text
          ref={textRef}
          x={x}
          y={y + rowH / 2}
          dy="0.32em"
          textAnchor={rtl ? "end" : "start"}
          style={{ opacity: waiting ? 0 : undefined }}
          className={cn("text-2xs tabular-nums", HALO, hot ? "fill-sheen-fg" : "fill-sheen-fg-muted")}
        >
          {text}
        </text>
      </g>
    </g>
  );
});

/** A dependency arrow. It draws in during the entrance; later (a hover lights it up) it just fades in. */
export const ArrowPath = memo(function ArrowPath({
  d,
  head,
  hot,
  order,
  play,
  reduced,
  settled,
}: {
  d: string;
  head: string;
  hot: boolean;
  order: number;
  play: boolean;
  reduced: boolean;
  settled: boolean;
}) {
  const draw = !reduced && !settled;
  const delay = 0.55 + Math.min(0.6, order * 0.05);
  const instant = reduced || !play;
  return (
    <g>
      <motion.path
        d={d}
        strokeWidth={hot ? 1.75 : 1.25}
        initial={reduced ? false : draw ? { pathLength: 0 } : { opacity: 0 }}
        animate={play ? (draw ? { pathLength: 1 } : { opacity: 1 }) : undefined}
        transition={
          instant
            ? { duration: 0 }
            : draw
              ? { duration: duration.slow, ease: ease.out, delay }
              : { duration: duration.fast }
        }
      />
      <motion.path
        d={head}
        strokeWidth={hot ? 1.75 : 1.25}
        initial={reduced ? false : { opacity: 0 }}
        animate={play ? { opacity: 1 } : undefined}
        transition={
          instant
            ? { duration: 0 }
            : draw
              ? { duration: duration.fast, delay: delay + duration.slow }
              : { duration: duration.fast }
        }
      />
    </g>
  );
});

/** A dependency arrow between two tasks: the keys of both, its path and its arrowhead. */
export type Arrow = { key: string; from: string; to: string; d: string; head: string };

/** Every arrow, under the bars; dimmed while a task is being read (re-renders only on that flip). */
export const IdleArrows = memo(function IdleArrows({
  store,
  arrows,
  play,
  reduced,
  settled,
}: {
  store: ActiveStore;
  arrows: Arrow[];
  play: boolean;
  reduced: boolean;
  settled: boolean;
}) {
  const reading = useSyncExternalStore(
    store.subscribe,
    () => store.get().key !== null,
    () => false,
  );
  return (
    <g
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={reading ? 0.4 : 0.75}
      className="pointer-events-none stroke-sheen-fg-subtle forced-colors:stroke-[CanvasText]"
    >
      {arrows.map((a, i) => (
        <ArrowPath
          key={a.key}
          d={a.d}
          head={a.head}
          hot={false}
          order={i}
          play={play}
          reduced={reduced}
          settled={settled}
        />
      ))}
    </g>
  );
});

/** The arrows of the task being read, lit up above the bars (plain paths that fade in: cheap to add on hover). */
export const HotArrows = memo(function HotArrows({
  store,
  arrows,
  fadeIn,
}: {
  store: ActiveStore;
  arrows: Arrow[];
  fadeIn: (el: SVGGElement | null) => void;
}) {
  const key = useActiveKey(store);
  return (
    <g
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      className="pointer-events-none stroke-sheen-fg forced-colors:stroke-[CanvasText]"
    >
      {key !== null &&
        arrows.map((a) =>
          a.from === key || a.to === key ? (
            <g key={a.key} ref={fadeIn}>
              <path d={a.d} />
              <path d={a.head} />
            </g>
          ) : null,
        )}
    </g>
  );
});
