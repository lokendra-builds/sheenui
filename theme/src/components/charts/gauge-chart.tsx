"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type TooltipRow } from "./chart-parts";
import { useInputSource } from "./chart-fit";
import {
  chartFocusClass,
  clamp,
  decimalsOf,
  niceTicks,
  slotColor,
  useElementWidth,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import { ChartTip, useEntrance } from "./chart-tip";
import { isolate, textWidth, useChartDirection, useHitBounds, usePointerReading } from "./chart-pointer";
import { ChartFigure } from "./chart-figure";

import {
  defaultGaugeChartLabels,
  type GaugeChartProps,
  annularSector,
  DEG,
  TONES,
  unlit,
  TRACK,
  NEEDLE_SPRING,
  polar,
  resolveBands,
  ToneIcon,
  LitBand,
  type Part,
  partKey,
  parsePart,
  safeNumberFormat,
  withMinus,
} from "./gauge-chart/model";
import { TIP_ORDER, BAND_DIM, GaugeNumber } from "./gauge-chart/parts";

export {
  type GaugeTone,
  type GaugeBand,
  type GaugeChartLabels,
  defaultGaugeChartLabels,
  type GaugeChartProps,
  annularSector,
  gaugeLegend,
} from "./gauge-chart/model";
export { type GaugeTableProps, GaugeTable } from "./gauge-chart/parts";
/**
 * A gauge for one number against its scale: a semicircle or a 270° speedometer whose needle springs
 * to the value (a touch of overshoot, then it settles), the arc lighting up to it band by band, a
 * target tick, and the number rolling into place underneath with the band it sits in (icon + name,
 * so the status never rests on colour alone) and its distance from the target.
 *
 * Hover or tap a band, the target or the needle to read it, or focus the gauge and use the arrow
 * keys. The needle sweeps up from the bottom of the scale the first time the gauge scrolls into
 * view and springs to every new value; reduced motion sets it instantly.
 *
 * Keyboard: Tab focuses the gauge; the arrow keys step through the value, the target and each band, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; the value, its band (icon and name) and its distance from the target are text, so status never rests on colour alone. `GaugeTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. The needle springs to each value; reduced motion sets it instantly.
 *
 * @example
 * ```tsx
 * import { GaugeChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GaugeChart
 *       value={72}
 *       target={80}
 *       bands={[
 *         { to: 50, label: "Low" },
 *         { to: 80, label: "Healthy" },
 *         { to: 100, label: "High" },
 *       ]}
 *       label="CPU load"
 *       aria-label="CPU load, percent"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/gauge-chart
 */
export function GaugeChart({
  value,
  min: minProp = 0,
  max: maxProp = 100,
  target,
  bands: bandsProp,
  shape = "semicircle",
  label,
  color = 1,
  ticks: showTicks = true,
  numberFormat,
  format: formatProp,
  locale,
  higherIsBetter = true,
  height = 260,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<GaugeChartProps>) {
  const t = { ...defaultGaugeChartLabels, ...labels };
  const id = useId();
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  // Right to left the scale runs from the right (min) to the left (max), like the other charts'
  // value axes; its numbers still read left to right.
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const input = useInputSource();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = parsePart(activeKey);
  const setActive = (p: Part | null) => setActiveKey(partKey(p));
  // Touch: tap a part to pin it, tap it again (or empty space) to unpin; a tap's jitter never re-pins.
  const pointer = usePointerReading<string>(activeKey, setActiveKey, input.fromPointer);
  const bounds = useHitBounds(width);

  const min = Math.min(minProp, maxProp);
  const max = maxProp > minProp ? maxProp : minProp === maxProp ? minProp + 1 : minProp;
  const valid = Number.isFinite(value);
  const bands = useMemo(() => resolveBands(bandsProp, min, max, color), [bandsProp, min, max, color]);
  const hasBands = Boolean(bandsProp && bandsProp.length > 0);

  // Numbers: one Intl formatter (the big number rolls its digits) unless a format function is given.
  const step = niceTicks(min, max, 5);
  const defaultDigits = Math.max(decimalsOf(value), decimalsOf((step[1] ?? 1) - (step[0] ?? 0)));
  const intlOptions = useMemo<Intl.NumberFormatOptions>(
    () => numberFormat ?? { maximumFractionDigits: Math.min(2, defaultDigits) },
    [numberFormat, defaultDigits],
  );
  const intl = useMemo(() => safeNumberFormat(locale, intlOptions), [locale, intlOptions]);
  const format = useMemo(() => formatProp ?? ((n: number) => withMinus(intl.format(n))), [formatProp, intl]);
  /** A number for HTML text (readouts, the status line): isolated, so right-to-left pages keep its sign in front. */
  const num = (n: number) => isolate(format(n));

  // Where the value sits: its band, its distance from the target, and whether it's off the scale.
  const bandIndex = valid ? bands.findIndex((b) => value <= b.to) : -1;
  const current = valid ? (bands[bandIndex < 0 ? bands.length - 1 : bandIndex] ?? null) : null;
  const delta = target !== undefined && valid ? value - target : null;
  const deltaGood = delta === null || delta === 0 ? null : delta > 0 === higherIsBetter;
  const deltaText =
    delta === null
      ? ""
      : delta === 0
        ? t.onTarget
        : t.vsTarget(isolate(`${delta > 0 ? "+" : "−"}${format(Math.abs(delta)).replace("−", "")}`));
  const outside = valid && value < min ? t.belowScale : valid && value > max ? t.aboveScale : "";
  // Width of the status line (icon + band name, then ▲ + delta) in 12px medium text.
  const statusW =
    (current?.label ? 18 + current.label.length * 6.6 : 0) +
    (current?.label && deltaText ? 8 : 0) +
    (deltaText ? (deltaText.length + 2) * 6.6 : 0);

  // Geometry.
  const half = (shape === "speedometer" ? 135 : 90) * DEG;
  const a0 = -half;
  const a1 = half;
  // Room around the arc for the scale labels: the widest label sits beside each end. In a tile too
  // narrow for them around a readable arc (radius < 48), the scale steps aside and the arc keeps the room.
  const widestTick = Math.max(textWidth(format(min)), textWidth(format(max)), textWidth(format((min + max) / 2)));
  const fullPad = Math.max(30, Math.ceil(widestTick) + 22);
  const showScale = showTicks && (width - 2 * fullPad) / 2 >= 48;
  const tickPad = showScale ? fullPad : 10;
  const topPad = showScale ? 30 : 10;
  const numberPx = (R: number) => clamp(Math.round(R * (shape === "speedometer" ? 0.27 : 0.3)), 26, 44);
  const mainH = (R: number) => numberPx(R) * 1.15 + (label ? 22 : 0);
  const statusH = hasBands || target !== undefined ? 24 : 0;
  // Where the status line (band + delta) starts. A speedometer keeps it below its arc's lower ends,
  // where the opening between them gets too narrow for it, and below the end labels of the scale
  // (min / max sit just outside those ends) when it's wider than the gap between them.
  const statusClear = (R: number) => {
    if (shape !== "speedometer" || !statusH) return 0;
    const labelGap = 0.707 * (R + 18) - 8; // half the gap between the min and max labels
    return showScale && statusW / 2 > labelGap ? R * 0.71 + 28 : R * 0.71 + 8;
  };
  const statusTopOf = (R: number) => Math.max(16 + mainH(R) + 4, statusClear(R));
  // Height for a radius: the arc and its labels above the hub, then the number and status under it.
  const fitR = (R: number) =>
    topPad + R + Math.max(statusTopOf(R) + statusH + 4, shape === "speedometer" ? R * 0.71 + 30 : 0);
  // Radius: as wide as the card allows (up to 170), then shrunk to fit `height`; never under 40,
  // unless the card itself is narrower than that (a small KPI tile), down to 28.
  const minR = clamp((width - 2 * tickPad) / 2, 28, 40);
  let R = Math.max(minR, Math.min(170, (width - 2 * tickPad) / 2));
  for (let k = 0; k < 6 && fitR(R) > height && R > minR; k++) R = Math.max(minR, R - (fitR(R) - height) * 0.7);
  const totalH = Math.ceil(fitR(R));
  const thick = clamp(R * 0.15, 10, 22);
  const r1 = R;
  const r0 = R - thick;
  const cx = width / 2;
  const cy = topPad + R;
  /** Physical x of a point laid out left to right (the gauge is symmetric, so it mirrors around its centre). */
  const mx = (x: number) => (rtl ? width - x : x);
  const anchorOf = (a: "start" | "middle" | "end") => (rtl && a !== "middle" ? (a === "start" ? "end" : "start") : a);
  const angleOf = (v: number) => a0 + ((clamp(v, min, max) - min) / (max - min)) * (a1 - a0);
  const gapAngle = 2 / ((r0 + r1) / 2) / 2; // half of a 2px surface gap, as an angle

  // The needle: one motion value drives the needle, the lit arc and the glow.
  const angle = useMotionValue(reduced ? angleOf(value) : a0);
  const target0 = valid ? angleOf(value) : a0;
  useEffect(() => {
    if (!play) return;
    if (reduced) {
      angle.set(target0);
      return;
    }
    const controls = animate(angle, target0, { ...NEEDLE_SPRING, delay: angle.get() === a0 ? 0.25 : 0 });
    return () => controls.stop();
  }, [play, reduced, target0, angle, a0]);
  // A real needle stops at the pins: overshoot is clamped a hair past the ends.
  const needle = useTransform(angle, (a) => {
    const aa = clamp(a, a0 - 1.5 * DEG, a1 + 1.5 * DEG);
    const tip = polar(cx, cy, r0 - 7, aa);
    const tail = polar(cx, cy, -12, aa);
    const l = polar(cx, cy, 4.5, aa - Math.PI / 2);
    const r = polar(cx, cy, 4.5, aa + Math.PI / 2);
    const f = (p: [number, number]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
    return `M${f(tip)} L${f(r)} L${f(tail)} L${f(l)} Z`;
  });

  // Scale ticks around the arc, thinned so labels never collide.
  const arcLen = R * (a1 - a0);
  const tickValues = niceTicks(min, max, clamp(Math.floor(arcLen / 64), 2, 10)).filter(
    (v) => v >= min - 1e-9 && v <= max + 1e-9,
  );
  if (tickValues[0] !== min) tickValues.unshift(min);
  if (tickValues[tickValues.length - 1] !== max) tickValues.push(max);
  const majors = tickValues.filter(
    (v, i, all) =>
      i === 0 ||
      i === all.length - 1 ||
      (((v - min) / (max - min)) * arcLen >= 18 && ((max - v) / (max - min)) * arcLen >= 18),
  );
  const tickText = (v: number) => format(v);
  const labelGap = majors.reduce((m, v) => Math.max(m, tickText(v).length * 6.2), 0) + 6;
  const every = Math.max(1, Math.ceil(labelGap / Math.max(1, ((R + 16) * (a1 - a0)) / Math.max(1, majors.length - 1))));
  const lastTick = majors.length - 1;
  const shownTick = (i: number) =>
    i === 0 || i === lastTick || (i % every === 0 && lastTick - i >= Math.ceil(every / 2));

  // What arrow keys and the pointer can read.
  const parts: Part[] = [
    { kind: "value" },
    ...(target !== undefined ? [{ kind: "target" } as const] : []),
    ...(hasBands ? bands.map((_, index) => ({ kind: "band", index }) as const) : []),
  ];
  const same = (a: Part | null, b: Part | null) =>
    a?.kind === b?.kind && (a?.kind !== "band" || (b?.kind === "band" && a.index === b.index));
  const readoutOf = (p: Part): { title: string; rows: TooltipRow[] } => {
    if (p.kind === "value") {
      const rows: TooltipRow[] = [
        { label: t.value, value: num(value), color: current?.fill ?? slotColor(color), kind: "rect" },
      ];
      if (current?.label) rows.push({ label: t.band, value: current.label, color: "transparent" });
      if (deltaText) rows.push({ label: "", value: deltaText, color: "transparent" });
      if (outside) rows.push({ label: "", value: outside, color: "transparent" });
      return { title: typeof label === "string" ? label : t.value, rows };
    }
    if (p.kind === "target") {
      return {
        title: t.target,
        rows: [
          { label: t.target, value: num(target ?? 0), color: "var(--sheen-fg)", kind: "line" },
          ...(deltaText ? [{ label: t.value, value: `${num(value)} · ${deltaText}`, color: "transparent" }] : []),
        ],
      };
    }
    const b = itemAt(bands, p.index);
    return {
      title: b.label,
      rows: [
        { label: t.range, value: t.between(num(b.from), num(b.to)), color: b.fill, kind: "rect" },
        ...(current === b ? [{ label: "", value: t.current, color: "transparent" }] : []),
      ],
    };
  };
  const readout = active ? readoutOf(active) : null;

  if (!valid) {
    return (
      <ChartEmpty height={Math.min(height, 200)} aria-label={ariaLabel} className={className}>
        {t.noData}
      </ChartEmpty>
    );
  }

  function partAt(event: React.PointerEvent<SVGElement>, fresh = false): Part | null {
    // The box is read once per pointer visit, not on every move.
    const rect = bounds.rect(event.currentTarget.ownerSVGElement ?? event.currentTarget, fresh);
    const x = (event.clientX - rect.left - cx) * (rtl ? -1 : 1);
    const y = event.clientY - rect.top - cy;
    const r = Math.hypot(x, y);
    const a = Math.atan2(x, -y);
    if (r < r0 - 12) return { kind: "value" };
    if (r > r1 + 14 || a < a0 - 0.08 || a > a1 + 0.08) return null;
    if (target !== undefined && Math.abs(a - angleOf(target)) * r < 8) return { kind: "target" };
    if (!hasBands) return { kind: "value" };
    const v = min + ((a - a0) / (a1 - a0)) * (max - min);
    const i = bands.findIndex((b) => v <= b.to);
    return { kind: "band", index: i < 0 ? bands.length - 1 : i };
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const at = active ? parts.findIndex((p) => same(p, active)) : -1;
    let next: Part | null | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = parts[Math.min(parts.length - 1, at + 1)] ?? null;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = parts[at < 0 ? 0 : Math.max(0, at - 1)] ?? null;
    else if (event.key === "Home") next = parts[0] ?? null;
    else if (event.key === "End") next = parts[parts.length - 1] ?? null;
    else if (event.key === "Escape" && active) next = null;
    if (next === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    setActive(next);
  }

  // Tooltip anchor: the active band's middle, the target tick, or the hub (mirrored right to left).
  let tipAnchor = { x: cx - 10, y: cy - 10, w: 20, h: 20 };
  // The reading of the value itself sits beside the dial when the chart is wide enough, so it never covers the big number or the needle.
  if (width - (cx + r1 + 36) >= 150) tipAnchor = { x: cx + r1 + 36, y: cy - 40, w: 4, h: 4 };
  else if (cx - r1 - 36 >= 150) tipAnchor = { x: cx - r1 - 40, y: cy - 40, w: 4, h: 4 };
  if (active?.kind === "band") {
    const b = itemAt(bands, active.index);
    const [x, y] = polar(cx, cy, r1, (angleOf(b.from) + angleOf(b.to)) / 2);
    tipAnchor = { x: mx(x) - 6, y: y - 6, w: 12, h: 12 };
  } else if (active?.kind === "target" && target !== undefined) {
    const [x, y] = polar(cx, cy, r1 + 4, angleOf(target));
    tipAnchor = { x: mx(x) - 6, y: y - 6, w: 12, h: 12 };
  }

  const summary = [
    `${format(value)}${current?.label ? `, ${current.label}` : ""}`,
    deltaText,
    outside,
    t.scale(format(min), format(max)),
  ]
    .filter(Boolean)
    .join(". ");
  const tickDelay = (i: number) => (reduced ? 0 : 0.05 + i * 0.03);
  const blockTop = cy + 16;
  const statusTop = cy + statusTopOf(R);

  return (
    <div data-slot="gauge-chart" {...rest} ref={rootMerged} className={cn("relative w-full", className)}>
      <div ref={measureRef} className="relative w-full" style={{ height: totalH }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            roleDescription={t.roleDescription}
            width={width}
            height={totalH}
            label={`${ariaLabel}: ${summary}`}
            description={resolveInstructions(t.instructions)}
            tabIndex={0}
            direction="ltr"
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
          >
            <defs>
              <filter id={`${id}-glow`} filterUnits="userSpaceOnUse" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation={6} />
              </filter>
              {!hasBands && (
                <linearGradient id={`${id}-arc`} gradientUnits="userSpaceOnUse" x1={cx - R} x2={cx + R} y1={0} y2={0}>
                  <stop offset="0%" stopColor={itemAt(bands, 0).fill} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={itemAt(bands, 0).fill} />
                </linearGradient>
              )}
            </defs>
            <g aria-hidden>
              {/* Scale: minor ticks, major ticks and their labels, outside the arc. */}
              {showScale &&
                majors.map((v, i) => {
                  const a = angleOf(v);
                  const [x1, y1] = polar(cx, cy, r1 + 4, a);
                  const [x2, y2] = polar(cx, cy, r1 + 9, a);
                  return (
                    <motion.g
                      key={`t${v}`}
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: play ? 1 : 0 }}
                      transition={{ duration: reduced ? 0 : duration.base, delay: tickDelay(i) }}
                    >
                      <line
                        x1={mx(x1)}
                        y1={y1}
                        x2={mx(x2)}
                        y2={y2}
                        stroke="var(--sheen-fg-subtle)"
                        strokeWidth={1.25}
                        strokeLinecap="round"
                      />
                    </motion.g>
                  );
                })}
              {showScale &&
                majors.slice(0, -1).flatMap((v, i) => {
                  const next = majors[i + 1] ?? 0;
                  return [0.25, 0.5, 0.75].map((k) => {
                    const a = angleOf(v + (next - v) * k);
                    const [x1, y1] = polar(cx, cy, r1 + 4, a);
                    const [x2, y2] = polar(cx, cy, r1 + 6.5, a);
                    return (
                      <line
                        key={`m${v}-${k}`}
                        x1={mx(x1)}
                        y1={y1}
                        x2={mx(x2)}
                        y2={y2}
                        stroke="var(--sheen-chart-grid)"
                        strokeWidth={1}
                      />
                    );
                  });
                })}

              {/* The arc: each band's unlit tint with 2px surface gaps; the lit part follows the needle.
                  Laid out left to right and mirrored as a whole on right-to-left pages. */}
              <g className="forced-color-adjust-none" transform={rtl ? `matrix(-1 0 0 1 ${width} 0)` : undefined}>
                {bands.map((b, i) => {
                  const s = angleOf(b.from) + (i > 0 ? gapAngle : 0);
                  const e = angleOf(b.to) - (i < bands.length - 1 ? gapAngle : 0);
                  const dim = active?.kind === "band" && active.index !== i;
                  return (
                    // The entrance fades each band in once; reading a band dims the others with a CSS
                    // opacity transition (no Motion animation restarts while hovering).
                    <motion.g
                      key={`b${i}`}
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: play ? 1 : 0 }}
                      transition={{ duration: reduced ? 0 : duration.base, delay: reduced ? 0 : 0.05 + i * 0.07 }}
                    >
                      <g data-dim={dim ? "" : undefined} className={BAND_DIM}>
                        <path
                          d={annularSector(cx, cy, r0, r1, s, e, i === 0 ? 4 : 0, i === bands.length - 1 ? 4 : 0)}
                          style={{ fill: hasBands ? unlit(b.fill) : TRACK }}
                          className="forced-colors:stroke-[CanvasText]"
                        />
                        <LitBand
                          angle={angle}
                          a0={s}
                          a1={e}
                          cx={cx}
                          cy={cy}
                          r0={r0}
                          r1={r1}
                          fill={hasBands ? b.fill : `url(#${id}-arc)`}
                          glow={b.fill}
                          roundStart={i === 0}
                          roundEnd={i === bands.length - 1}
                          glowId={current === b || !hasBands ? `${id}-glow` : undefined}
                        />
                      </g>
                      {active?.kind === "band" && active.index === i && (
                        <path
                          d={annularSector(cx, cy, r0 - 3, r1 + 3, s - 0.01, e + 0.01, 6, 6)}
                          fill="none"
                          stroke="var(--sheen-fg)"
                          strokeWidth={1.5}
                          className="forced-colors:stroke-[Highlight]"
                        />
                      )}
                    </motion.g>
                  );
                })}

                {/* Target: an ink tick across the arc, ringed in the surface colour. */}
                {target !== undefined &&
                  Number.isFinite(target) &&
                  (() => {
                    const a = angleOf(target);
                    const [x1, y1] = polar(cx, cy, r0 - 5, a);
                    const [x2, y2] = polar(cx, cy, r1 + 5, a);
                    const on = active?.kind === "target";
                    return (
                      <motion.g
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: play ? 1 : 0 }}
                        transition={{ duration: reduced ? 0 : duration.base, delay: reduced ? 0 : 0.35 }}
                      >
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="var(--sheen-chart-surface)"
                          strokeWidth={on ? 8 : 7}
                          strokeLinecap="round"
                        />
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="var(--sheen-fg)"
                          strokeWidth={on ? 4 : 3}
                          strokeLinecap="round"
                          className="forced-colors:stroke-[CanvasText]"
                        />
                      </motion.g>
                    );
                  })()}

                {/* Scale labels last, on a surface plate: the target tick, needle and bands never run through the digits (1.4.3). */}
                {showScale &&
                  majors.map((v, i) => {
                    if (!shownTick(i)) return null;
                    const a = angleOf(v);
                    const [lx, ly] = polar(cx, cy, r1 + 18, a);
                    const sin = Math.sin(a);
                    const anchor = Math.abs(sin) < 0.25 ? "middle" : sin > 0 ? "start" : "end";
                    const cos = Math.cos(a);
                    const label = tickText(v);
                    const w = Math.ceil(textWidth(label, 10)) + 6;
                    const x = mx(lx);
                    const side = anchorOf(anchor);
                    const left = side === "middle" ? x - w / 2 : side === "end" ? x - w + 3 : x - 3;
                    const dy = cos > 0.4 ? 0.2 : cos < -0.4 ? 0.8 : 0.32;
                    return (
                      <motion.g
                        key={`l${v}`}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: play ? 1 : 0 }}
                        transition={{ duration: reduced ? 0 : duration.base, delay: tickDelay(i) }}
                      >
                        <rect
                          x={left}
                          y={ly - 7 + dy * 10 - 3.2}
                          width={w}
                          height={14}
                          rx={4}
                          fill="var(--sheen-chart-surface)"
                        />
                        <text
                          x={x}
                          y={ly}
                          dy={`${dy}em`}
                          textAnchor={side}
                          className="fill-sheen-fg text-2xs tabular-nums"
                        >
                          {label}
                        </text>
                      </motion.g>
                    );
                  })}

                {/* Needle and hub. */}
                <motion.path
                  d={needle}
                  fill="var(--sheen-fg)"
                  className="forced-colors:fill-[CanvasText]"
                  initial={false}
                  animate={{ opacity: play ? 1 : 0 }}
                  transition={{ duration: reduced ? 0 : duration.fast }}
                />
                <circle cx={cx} cy={cy} r={8} fill="var(--sheen-fg)" className="forced-colors:fill-[CanvasText]" />
                <circle cx={cx} cy={cy} r={3} fill="var(--sheen-chart-surface)" />
                {active?.kind === "value" && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={13}
                    fill="none"
                    stroke="var(--sheen-fg)"
                    strokeWidth={1.5}
                    className="forced-colors:stroke-[Highlight]"
                  />
                )}
              </g>

              {/* Hit area: the whole gauge. */}
              <rect
                x={0}
                y={0}
                width={width}
                height={totalH}
                fill="transparent"
                style={{ touchAction: "pan-y pinch-zoom" }}
                onPointerEnter={bounds.reset}
                onPointerDown={(e) => pointer.down(e, partKey(partAt(e, true)))}
                onPointerMove={(e) => pointer.move(e, partKey(partAt(e)))}
                onPointerUp={pointer.up}
                onPointerLeave={pointer.leave}
              />
            </g>
          </ChartFigure>
        )}

        {/* The number and its caption under the hub, then the status line. Visual only: the chart's name says it all. */}
        {width > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 flex flex-col items-center gap-1 text-center"
            style={{ top: blockTop }}
          >
            <GaugeNumber
              value={value}
              min={min}
              count={Boolean(formatProp) || min < 0 || value < 0}
              format={format}
              locale={locale}
              intlOptions={intlOptions}
              play={play}
              reduced={reduced}
              fontSize={numberPx(R)}
            />
            {label && <span className="text-sm text-sheen-fg-muted">{label}</span>}
          </div>
        )}
        {width > 0 && (!!current?.label || !!deltaText) && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-2 text-xs font-medium"
            style={{ top: statusTop }}
          >
            {current?.label && (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  current.tone ? TONES[current.tone].text : "text-sheen-fg",
                )}
              >
                <ToneIcon tone={current.tone} />
                {current.label}
              </span>
            )}
            {deltaText && (
              <span
                dir="auto"
                className={cn(
                  "tabular-nums",
                  deltaGood === null
                    ? "text-sheen-fg-muted"
                    : deltaGood
                      ? "text-sheen-success-text"
                      : "text-sheen-danger-text",
                )}
              >
                {delta !== null && delta !== 0 && <span aria-hidden>{delta > 0 ? "▲ " : "▼ "}</span>}
                {deltaText}
              </span>
            )}
          </div>
        )}

        {readout && (
          <ChartTip
            title={readout.title}
            rows={readout.rows}
            anchor={tipAnchor}
            bounds={{ w: width, h: totalH }}
            order={TIP_ORDER}
          />
        )}
      </div>
      <ChartAnnouncer
        text={input.announce(
          readout ? `${readout.title}: ${readout.rows.map((r) => `${r.label} ${r.value}`.trim()).join(", ")}` : "",
        )}
      />
    </div>
  );
}
