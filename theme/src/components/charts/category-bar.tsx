"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useEffect, useEffectEvent, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { useChartDirection } from "./chart-pointer";

import { cn } from "../../lib/cn";
import { duration, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, LegendKey } from "./chart-parts";
import { useInputSource } from "./chart-fit";
import {
  chartFocusClass,
  clamp,
  decimalsOf,
  enterEase,
  num,
  slotColor,
  useDataChanged,
  useElementWidth,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import { defaultCompact, useEntrance } from "./heatmap";
import { ChartFigure } from "./chart-figure";

import {
  markGlow,
  solidOverlayClass,
  AboveTip,
  stepKeys,
  defaultCategoryBarLabels,
  type CategoryBarProps,
  THICKNESS,
  CHAR_W,
  fitBoundaryLabels,
} from "./category-bar/model";

export {
  useDeferredDraw,
  markGlow,
  solidOverlayClass,
  solidTipsScope,
  type TipRow,
  AboveTip,
  useStaggerEntrance,
  safeDateFormat,
  safeNumberFormat,
  useTableRows,
  ShowAllRows,
  stepKeys,
  type CategoryBarItem,
  type CategoryBarLabels,
  defaultCategoryBarLabels,
  type CategoryBarProps,
} from "./category-bar/model";
export { type CategoryBarTableProps, CategoryBarTable } from "./category-bar/parts";
/**
 * A single bar split into bands, with an optional marker: where a score, a reading or a
 * forecast sits on a scale of named ranges (Tremor's CategoryBar).
 *
 * - Bands are sized to their values on one scale, 2px apart; the boundary values are printed
 *   under the bar and thinned so they never collide (the two ends always show).
 * - The marker is a pin with a glass bubble (label + value) that never leaves the bar's width;
 *   its number rolls as the pin slides to its value.
 * - Hover, tap or arrow through the bands: each band's span is shown and announced. Every band
 *   and the marker are also in the chart's description, so nothing depends on colour.
 * - Bands grow in from the start, then the pin slides in. Data changes glide (transforms only).
 *   Reduced motion: everything is drawn in place.
 *
 * Keyboard: Tab focuses the bar; the arrow keys move between bands (mirrored in right-to-left), Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; every band and the marker are in the chart's description, and keyboard moves announce a band's span. `CategoryBarTable` is the table view.
 * Glass and motion: the marker bubble is a solid glass-look overlay (no backdrop blur). Reduced motion draws everything in place.
 *
 * @example
 * ```tsx
 * import { CategoryBar } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CategoryBar
 *       data={[
 *         { label: "Poor", value: 580 },
 *         { label: "Fair", value: 90 },
 *         { label: "Good", value: 130 },
 *       ]}
 *       start={300}
 *       marker={655}
 *       markerLabel="Your score"
 *       aria-label="Credit score on a scale of named ranges"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/category-bar
 */
export function CategoryBar({
  data,
  start = 0,
  marker = null,
  markerLabel,
  showValues = true,
  showLegend = false,
  size = "md",
  format: formatProp,
  locale,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<CategoryBarProps>) {
  const t = { ...defaultCategoryBarLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const reduced = useSheenReducedMotion();
  const descId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const barRef = useRef<HTMLDivElement>(null);
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const [active, setActive] = useState<number | null>(null);
  const { fromKeyboard, fromPointer, announce } = useInputSource();

  const bands = useMemo(() => {
    const values = data.map((d) => Math.max(0, num(d.value)));
    return data.map((d, i) => {
      const value = values[i] ?? 0;
      const from = values.slice(0, i).reduce((sum, v) => sum + v, start);
      return { label: d.label, value, from, to: from + value, color: slotColor(d.color ?? i + 1) };
    });
  }, [data, start]);
  const total = bands.reduce((s, b) => s + b.value, 0);
  const end = start + total;
  const signature = bands.map((b) => `${b.label}:${b.value}`).join("|") + `@${start}`;
  const dataChanged = useDataChanged(signature);
  const thickness = THICKNESS[size];
  const hasMarker = marker !== null && Number.isFinite(marker) && total > 0;
  // The real value is shown, announced and tabulated; the pin itself stays on the bar.
  const markerReal = hasMarker ? marker : start;
  const markerValue = clamp(markerReal, start, end);
  const outside = !hasMarker ? 0 : markerReal > end ? 1 : markerReal < start ? -1 : 0;
  const bandOf = (v: number) => bands.find((b, i) => v < b.to || i === bands.length - 1);
  const markerBand = hasMarker && outside === 0 ? bandOf(markerValue) : undefined;

  // Offset from the start of the bar (reading direction), and the physical x for that offset.
  const along = (v: number) => (total > 0 ? ((v - start) / total) * width : 0);
  const px = (v: number) => (rtl ? width - along(v) : along(v));

  /*
   * The pin slides from the start to its value with its number rolling alongside; later changes
   * glide from where it is. One MotionValue drives it: the pin and the bubble move by transform
   * and the number is a text node Motion writes, so the slide never re-renders React or reads
   * layout. The bubble's width comes from a ResizeObserver, not a per-frame measurement.
   */
  const shownMv = useMotionValue(start);
  const pinX = useMotionValue(0);
  const bubbleX = useMotionValue(0);
  const shownText = useMotionValue("");
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [bubbleReady, setBubbleReady] = useState(false);
  const geo = useRef({ width, rtl, total, start, end, bubbleW: 0, places: 0, format });
  const [apply] = useState(() => (v: number) => {
    const g = geo.current;
    const a = g.total > 0 ? ((clamp(v, g.start, g.end) - g.start) / g.total) * g.width : 0;
    const p = g.rtl ? g.width - a : a;
    pinX.set(p);
    bubbleX.set(clamp(p - g.bubbleW / 2, 0, Math.max(0, g.width - g.bubbleW)));
    // While it rolls, the number keeps the marker's own precision (no 341.2938 ms mid-way).
    shownText.set(g.format(Number(v.toFixed(g.places))));
  });
  useLayoutEffect(() => {
    geo.current = { ...geo.current, width, rtl, total, start, end, places: decimalsOf(markerReal), format };
    apply(shownMv.get());
  });
  useEffect(() => shownMv.on("change", apply), [shownMv, apply]);
  const entranceDelay = duration.slower * 0.7 + bands.length * 0.06;
  const sized = width > 0;
  // With reduced motion the marker is shown at once: there is no tween to wait for.
  const pinStarted = started || (reduced && hasMarker && play && sized);
  // `started` only picks the first glide: it is read when the effect runs, and flipping it (the timer below does) must not restart that glide.
  const firstGlideDone = useEffectEvent(() => started);
  useEffect(() => {
    if (!hasMarker || !play || !sized) return;
    if (reduced) {
      shownMv.jump(markerReal);
      return;
    }
    if (!firstGlideDone()) {
      // First view: the pin lands once the bands have grown in, then slides from the start.
      let controls: { stop: () => void } | undefined;
      const timer = window.setTimeout(() => {
        shownMv.jump(start);
        setStarted(true);
        controls = animate(shownMv, markerReal, spring.gentle);
      }, entranceDelay * 1000);
      return () => {
        window.clearTimeout(timer);
        controls?.stop();
      };
    }
    const controls = animate(shownMv, markerReal, spring.snappy);
    return () => controls.stop();
  }, [hasMarker, play, reduced, sized, markerReal, start, entranceDelay, shownMv]);
  useLayoutEffect(() => {
    const el = bubbleRef.current;
    if (!el) return;
    const measure = () => {
      geo.current.bubbleW = el.offsetWidth;
      apply(shownMv.get());
      setBubbleReady(true);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [pinStarted, hasMarker, sized, apply, shownMv]);

  if (bands.length === 0 || total === 0) {
    return (
      <ChartEmpty height={64} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.empty}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < bands.length ? active : null;
  const activeBand = act !== null ? bands[act] : undefined;
  const rangeText = (b: { from: number; to: number }) => t.range(format(b.from), format(b.to));
  const bubbleText = markerLabel ?? t.marker;
  const markerText = format(markerReal);
  const markerWhere =
    outside > 0
      ? t.markerAbove(markerText)
      : outside < 0
        ? t.markerBelow(markerText)
        : markerBand
          ? t.markerIn(markerText, markerBand.label)
          : markerText;
  // Reading the end band also names a marker waiting past that end.
  const markerAt = (i: number) =>
    hasMarker && (markerBand === bands[i] || (outside > 0 && i === bands.length - 1) || (outside < 0 && i === 0));
  const announceText =
    activeBand && act !== null
      ? `${activeBand.label}: ${rangeText(activeBand)}${markerAt(act) ? `. ${bubbleText}: ${outside ? markerWhere : markerText}` : ""}`
      : "";
  const summary = [...bands.map((b) => `${b.label} ${rangeText(b)}`), hasMarker ? `${bubbleText}: ${markerWhere}` : ""]
    .filter(Boolean)
    .join(". ");

  const hitTest = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return null;
    let p = (clientX - rect.left) / Math.max(1, rect.width);
    if (rtl) p = 1 - p;
    const v = start + clamp(p, 0, 1) * total;
    const i = bands.findIndex((b) => v < b.to);
    return i < 0 ? bands.length - 1 : i;
  };

  // Ends of the bar are fully rounded; inner ends are squared off (1px) behind a 2px gap.
  const radius = thickness / 2;
  const geometry = bands.map((b, i) => {
    const a = px(b.from);
    const z = px(b.to);
    const left = Math.min(a, z);
    const physicalFirst = rtl ? i === bands.length - 1 : i === 0;
    const physicalLast = rtl ? i === 0 : i === bands.length - 1;
    const x = left + (physicalFirst ? 0 : 1);
    const w = Math.max(0, Math.abs(z - a) - (physicalFirst ? 0 : 1) - (physicalLast ? 0 : 1));
    return { x, w, rl: physicalFirst ? radius : 1, rr: physicalLast ? radius : 1 };
  });
  const layoutTransition = reduced || !dataChanged ? { duration: 0 } : spring.snappy;

  const boundaries = [start, ...bands.map((b) => b.to)];
  const boundaryText = boundaries.map((v) => format(v));
  const shownBoundaries = fitBoundaryLabels(
    boundaries.map(along),
    boundaryText.map((s) => s.length * CHAR_W),
    width,
  );

  const showPin = hasMarker && pinStarted && width > 0;
  const knob = thickness + 8;
  // Past an end, a small arrow in the bubble and the knob points off the scale.
  const outward = outside === 0 ? 0 : outside > 0 !== rtl ? 1 : -1;
  const arrow = (size: number) => (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 8 8"
      className="shrink-0 fill-current"
      style={{ transform: outward < 0 ? "scaleX(-1)" : undefined }}
    >
      <path d="M1.5 0.5L7 4L1.5 7.5z" />
    </svg>
  );
  const top = hasMarker ? 40 : 0;
  const hitPad = 6;

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col gap-2", className)}>
      {}
      <ChartFigure
        as="div"
        ref={measureRef}
        label={ariaLabel}
        description={resolveInstructions(t.instructions)}
        aria-describedby={descId}

        tabIndex={0}
        className={cn("relative rounded-sheen-sm", chartFocusClass)}
        style={{ paddingTop: top }}
        onKeyDown={(e) => {
          fromKeyboard();
          stepKeys(bands.length, act, rtl, setActive)(e);
        }}
        onBlur={() => setActive(null)}
      >
        <p id={descId} className="sr-only">
          {summary}
        </p>

        {/* Marker bubble (decorative: the description and the announcer carry the value). */}
        {showPin && (
          <motion.div
            ref={bubbleRef}
            aria-hidden
            className={cn(
              solidOverlayClass,
              "pointer-events-none absolute top-0 left-0 flex h-7 w-max max-w-full items-center gap-1.5 rounded-sheen-full px-3 text-xs whitespace-nowrap",
            )}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : duration.base }}
            style={{ x: bubbleX, visibility: bubbleReady ? undefined : "hidden" }}
          >
            <span className="min-w-0 truncate text-sheen-fg-muted">{bubbleText}</span>
            <bdi
              className="shrink-0 text-end font-semibold tabular-nums"
              style={{ minWidth: `${markerText.length}ch` }}
            >
              <motion.span>{shownText}</motion.span>
            </bdi>
            {outward !== 0 && <span className="text-sheen-fg-muted">{arrow(8)}</span>}
          </motion.div>
        )}

        <div
          ref={barRef}
          className="relative w-full touch-pan-y touch-pinch-zoom"
          style={{ paddingBlock: hitPad }}
          onPointerMove={(e) => {
            fromPointer();
            setActive(hitTest(e.clientX));
          }}
          onPointerDown={(e) => {
            fromPointer();
            setActive(hitTest(e.clientX));
          }}
          onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
        >
          {/* Touch screens: the hit area grows to 44px without moving anything. */}
          <span
            aria-hidden
            className="absolute inset-x-0 hidden any-pointer-coarse:block"
            style={{ top: -(22 - thickness / 2 - hitPad), bottom: -(22 - thickness / 2 - hitPad) }}
          />
          <div aria-hidden className="relative w-full forced-color-adjust-none" style={{ height: thickness }}>
            {width > 0 &&
              bands.map((b, i) => {
                const g = itemAt(geometry, i);
                if (g.w <= 0) return null;
                const dim = act !== null && act !== i;
                return (
                  <motion.div
                    key={`${b.label}\u0000${i}`}
                    layout
                    layoutDependency={signature}
                    className="absolute inset-y-0 origin-left forced-colors:border forced-colors:border-[CanvasText] rtl:origin-right"
                    initial={reduced ? false : { scaleX: 0 }}
                    animate={{ scaleX: play ? 1 : 0, opacity: dim ? 0.38 : 1 }}
                    transition={{
                      layout: layoutTransition,
                      scaleX: reduced
                        ? { duration: 0 }
                        : { duration: duration.slower, ease: enterEase, delay: i * 0.06 },
                      opacity: { duration: reduced ? 0 : duration.fast },
                    }}
                    style={{
                      left: g.x,
                      width: g.w,
                      background: b.color,
                      borderTopLeftRadius: g.rl,
                      borderBottomLeftRadius: g.rl,
                      borderTopRightRadius: g.rr,
                      borderBottomRightRadius: g.rr,
                      filter: act === i ? markGlow(b.color) : undefined,
                    }}
                  />
                );
              })}

            {/* Pin: a knob on the bar (surface fill, ink ring, soft shadow) with a caret under the bubble. */}
            {showPin && (
              <motion.div aria-hidden className="pointer-events-none absolute top-1/2 left-0" style={{ x: pinX }}>
                <svg
                  width={10}
                  height={6}
                  viewBox="0 0 10 6"
                  className="absolute left-[-5px] fill-sheen-fg-muted forced-colors:fill-[CanvasText]"
                  style={{ top: -knob / 2 - 9 }}
                >
                  <path d="M0 0h10L5 6z" />
                </svg>
                <span
                  className="absolute flex items-center justify-center rounded-full border-[3px] border-sheen-fg bg-(--sheen-chart-surface) text-sheen-fg shadow-[0_1px_3px_var(--sheen-shadow-near),0_0_0_2px_var(--sheen-chart-surface)] forced-colors:border-[CanvasText]"
                  style={{ width: knob, height: knob, left: -knob / 2, top: -knob / 2 }}
                >
                  {outward !== 0 && knob >= 16 && arrow(Math.max(5, knob - 10))}
                </span>
              </motion.div>
            )}
          </div>

          {act !== null && activeBand && width > 0 && (
            <AboveTip
              title={activeBand.label}
              rows={[
                { label: "", value: rangeText(activeBand), color: activeBand.color, kind: "rect" },
                ...(markerAt(act) ? [{ label: bubbleText, value: markerText, color: "transparent" }] : []),
              ]}
              x={itemAt(geometry, act).x + itemAt(geometry, act).w / 2}
              y={hitPad - (hasMarker ? 0 : 2)}
              bounds={width}
            />
          )}
        </div>

        {showValues && width > 0 && (
          <div aria-hidden className="relative mt-1 h-4 text-2xs text-sheen-fg-muted tabular-nums">
            {boundaries.map((v, i) =>
              shownBoundaries.has(i) ? (
                <motion.span
                  key={i}
                  className="absolute top-0 left-0 whitespace-nowrap"
                  initial={reduced ? false : { opacity: 0, x: px(v) }}
                  animate={{ opacity: play ? 1 : 0, x: px(v) }}
                  transition={{
                    opacity: reduced ? { duration: 0 } : { duration: duration.base, delay: 0.25 + i * 0.05 },
                    x: reduced || !dataChanged ? { duration: 0 } : spring.snappy,
                  }}
                  style={{
                    translate:
                      i === 0
                        ? rtl
                          ? "-100% 0"
                          : "0 0"
                        : i === boundaries.length - 1
                          ? rtl
                            ? "0 0"
                            : "-100% 0"
                          : "-50% 0",
                  }}
                >
                  <bdi>{boundaryText[i]}</bdi>
                </motion.span>
              ) : null,
            )}
          </div>
        )}
      </ChartFigure>

      {showLegend && (
        <ul aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-sheen-fg-muted">
          {bands.map((b, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <LegendKey color={b.color} />
              <span>{b.label}</span>
            </li>
          ))}
        </ul>
      )}
      <ChartAnnouncer text={announce(announceText)} />
    </div>
  );
}
