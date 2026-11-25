"use client";

import {
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  type ReactNode,
  type Ref,
  type RefObject,
  useLayoutEffect,
} from "react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { duration, ease } from "../../../motion/tokens";
import { useSheenReducedMotion } from "../../../hooks/use-preferences";
import { LegendKey } from "../chart-parts";
import { clamp, slotColor, TOOLTIP_DOCK_SPACE, type ChartColor, itemAt } from "../chart-utils";
import { hueMix } from "../heatmap";
import type { WorldCountryShape } from "../geo/world-110m";
import { WORLD_FRAME_WIDTH, r1 } from "./projection";

/* ======================================================================
 * Colour scales
 * ====================================================================== */

/** Land without a value, and the bubble map's land. */
export const LAND = "color-mix(in oklab, var(--sheen-fg-subtle) 16%, var(--sheen-chart-surface))";
/** Land without data: fainter than `LAND`, so hatched areas recede and the data stands out. */
const NO_DATA = "color-mix(in oklab, var(--sheen-fg-subtle) 7%, var(--sheen-chart-surface))";
/** Neutral centre of a diverging scale. */
export const NEUTRAL = "color-mix(in oklab, var(--sheen-fg-subtle) 22%, var(--sheen-chart-surface))";

/** One step of a diverging scale: t in [-1, 1], 0 is the neutral midpoint. */
export function divergingColor(t: number, [low, high]: [ChartColor, ChartColor] = [2, 7]) {
  const s = clamp(Number.isFinite(t) ? t : 0, -1, 1);
  if (s === 0) return NEUTRAL;
  return hueMix(s < 0 ? low : high, Math.abs(s), NEUTRAL);
}

/** Maps a value to a step position from -1 to 1 around `mid`, so a diverging scale can pick a colour (pure). */
export function divergingPosition(value: number, lo: number, mid: number, hi: number, steps: number) {
  let t = value < mid ? -(mid - value) / Math.max(1e-12, mid - lo) : (value - mid) / Math.max(1e-12, hi - mid);
  t = clamp(t, -1, 1);
  if (steps >= 2) t = Math.sign(t) * (Math.ceil(Math.abs(t) * steps - 1e-9) / steps);
  return t;
}

/* ======================================================================
 * Small pieces
 * ====================================================================== */

/** The hatch that marks "no data" (never painted as 0). */
export function HatchPattern({ id, scale = 1, ref }: { id: string; scale?: number; ref?: Ref<SVGPatternElement> }) {
  return (
    <pattern
      ref={ref}
      id={id}
      width={6}
      height={6}
      patternUnits="userSpaceOnUse"
      patternTransform={`rotate(45) scale(${scale})`}
    >
      <rect width={6} height={6} style={{ fill: NO_DATA }} />
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={6}
        stroke="color-mix(in oklab, var(--sheen-fg-subtle) 14%, transparent)"
        strokeWidth={1}
      />
    </pattern>
  );
}

/** The legend key for regions without data: a hatched swatch and its label. */
export function NoDataKey({ label }: { label: string }) {
  const id = useId();
  return (
    <span className="inline-flex items-center gap-1.5 text-2xs text-sheen-fg-muted">
      <svg aria-hidden width={12} height={10} viewBox="0 0 12 10" className="shrink-0 forced-color-adjust-none">
        <defs>
          <HatchPattern id={id} />
        </defs>
        <rect
          x={0.5}
          y={0.5}
          width={11}
          height={9}
          rx={2.5}
          fill={`url(#${id})`}
          className="forced-colors:stroke-[CanvasText]"
        />
      </svg>
      {label}
    </span>
  );
}

/**
 * A legend's caption and its key. The caption wraps onto its own line on narrow maps; the key
 * (low value, ramp, high value) always stays on one line, so a value is never orphaned.
 */
export function LegendRow({ caption, children }: { caption?: ReactNode; children: ReactNode }) {
  return (
    <div aria-hidden className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
      {caption && <span className="text-2xs font-medium text-sheen-fg-muted">{caption}</span>}
      {children}
    </div>
  );
}

/** Key to a diverging scale: low hue → neutral → high hue, with the three anchor values. */
export function DivergingLegend({
  lo,
  mid,
  hi,
  colors,
  format,
  marker,
  width: W = 160,
}: {
  lo: number;
  mid: number;
  hi: number;
  colors: [ChartColor, ChartColor];
  format: (n: number) => string;
  marker: number | null;
  /** Length of the ramp in px. */
  width?: number;
}) {
  const id = useId();
  const reduced = useSheenReducedMotion();
  return (
    <div className="flex flex-nowrap items-center gap-x-2 text-2xs text-sheen-fg-muted">
      <span className="tabular-nums">{format(lo)}</span>
      <span className="relative inline-flex flex-col items-center pb-4">
        <svg
          width={W}
          height={16}
          viewBox={`0 -6 ${W} 16`}
          className="shrink-0 overflow-visible forced-color-adjust-none"
        >
          <defs>
            <linearGradient id={`${id}-d`} x1="0" x2="1" y1="0" y2="0">
              {[-1, -0.66, -0.33, 0, 0.33, 0.66, 1].map((t) => (
                <stop key={t} offset={(t + 1) / 2} style={{ stopColor: divergingColor(t, colors) }} />
              ))}
            </linearGradient>
          </defs>
          <rect width={W} height={10} rx={3} fill={`url(#${id}-d)`} className="forced-colors:stroke-[CanvasText]" />
          <line x1={W / 2} x2={W / 2} y1={-2} y2={12} className="stroke-sheen-fg-subtle" strokeWidth={1} />
          {marker !== null && (
            <motion.path
              d="M-4,-6 L4,-6 L0,-1 Z"
              className="fill-sheen-fg forced-colors:fill-[CanvasText]"
              initial={false}
              animate={{ x: ((clamp(marker, -1, 1) + 1) / 2) * W }}
              transition={reduced ? { duration: 0 } : { duration: duration.fast, ease: ease.out }}
            />
          )}
        </svg>
        <span className="absolute top-full mt-0.5 tabular-nums">{format(mid)}</span>
      </span>
      <span className="tabular-nums">{format(hi)}</span>
    </div>
  );
}

/** Key to bubble sizes: two nested circles (area ∝ value) with their values. */
export function BubbleLegend({
  max,
  maxR,
  color,
  format,
}: {
  max: number;
  maxR: number;
  color: ChartColor;
  format: (n: number) => string;
}) {
  if (!(max > 0)) return null;
  const nice = (v: number) => {
    const p = 10 ** Math.floor(Math.log10(v));
    return Math.max(p, Math.round(v / p) * p);
  };
  const values = [max, nice(max / 4)].filter((v, i, a) => v > 0 && v <= max && a.indexOf(v) === i);
  const rOf = (v: number) => Math.max(3, Math.sqrt(v / max) * maxR);
  const H = Math.max(maxR * 2, 26) + 8; // room above the largest circle for its value
  const base = H - 1;
  // Each value sits level with its circle's top, pushed down so the labels never touch.
  let lastY = -Infinity;
  const marks = values.map((v) => {
    const r = rOf(v);
    const top = base - 2 * r;
    const y = Math.max(top, lastY + 12, 6);
    lastY = y;
    return { v, r, top, y };
  });
  const W = maxR * 2 + 64;
  return (
    <div className="flex items-center text-2xs text-sheen-fg-muted">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0 forced-color-adjust-none">
        {marks.map(({ v, r, top, y }) => (
          <g key={v}>
            <circle
              cx={maxR + 1}
              cy={base - r}
              r={r}
              style={{ fill: `color-mix(in oklab, ${slotColor(color)} 22%, transparent)`, stroke: slotColor(color) }}
              strokeWidth={1}
              className="forced-colors:stroke-[CanvasText]"
            />
            <path
              d={`M${maxR + 1},${top}H${maxR * 2 + 4}L${maxR * 2 + 8},${y}`}
              fill="none"
              className="stroke-sheen-fg-subtle"
              strokeDasharray="2 2"
            />
            <text x={maxR * 2 + 12} y={y} dy="0.32em" className="fill-sheen-fg-muted text-2xs tabular-nums">
              {format(v)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Height of the band a narrow touch map reserves above itself for the docked readout (two lines). */
export const DOCK_BAND = TOOLTIP_DOCK_SPACE + 18;

/** Wraps text in a first-strong isolate, so numbers and names never reorder inside right-to-left text. */
export const isolate = (text: string) => (text ? `⁨${text}⁩` : text);
/** Formats an easing curve (four numbers) as a CSS `cubic-bezier()`. */
export const cssEase = (e: readonly number[]) => `cubic-bezier(${e.join(",")})`;

/**
 * The reading on a narrow touch map, pinned in the band above it: two fixed lines (the place and
 * its value, then the measure and rank), each truncated, so a long name never spills over the map.
 * Every part is bidi-isolated. Visual only: the map announces the same through ChartAnnouncer.
 */
export function DockedReadout({
  title,
  value,
  color,
  details,
}: {
  title: string;
  value: string;
  color: string | null;
  details: string[];
}) {
  return (
    <div
      aria-hidden
      data-slot="chart-readout"
      className="glass-3 pointer-events-none absolute inset-x-0 top-0 z-10 flex h-12 flex-col justify-center gap-0.5 rounded-sheen-md px-3 text-xs"
    >
      <p className="flex min-w-0 items-center gap-2">
        {color && <LegendKey color={color} />}
        <span dir="auto" className="min-w-0 truncate font-medium text-sheen-fg">
          {title}
        </span>
        <bdi className="ms-auto shrink-0 font-semibold text-sheen-fg tabular-nums">{value}</bdi>
      </p>
      <p dir="auto" className="truncate text-sheen-fg-muted">
        {details.map((part, i) => (
          <span key={i}>
            {i > 0 && " · "}
            <bdi>{part}</bdi>
          </span>
        ))}
      </p>
    </div>
  );
}

/**
 * One bubble, drawn at its place with its zoom-1 radius. It keeps its size on screen while the map
 * zooms through ONE CSS variable on the bubbles' group (--geo-bz = 1 / zoom, a counter-scale), so a
 * zoom frame writes one value, not a radius per bubble. It grows in (and tweens to a new size) with
 * a transform on its own group: no per-frame JS, no geometry attributes.
 */
export function Bubble({
  cx,
  cy,
  r,
  unit,
  color,
  active,
  delay,
  play,
  reduced,
}: {
  cx: number;
  cy: number;
  /** Radius in screen px. */
  r: number;
  /** Frame units per screen px at zoom 1. */
  unit: number;
  color: ChartColor;
  active: boolean;
  delay: number;
  play: boolean;
  reduced: boolean;
}) {
  const growRef = useRef<SVGGElement>(null);
  /** The radius on screen once the last animation settles (null: not shown yet). */
  const shown = useRef<number | null>(null);
  const startDelay = useEffectEvent(() => delay);
  useLayoutEffect(() => {
    const g = growRef.current;
    if (!play || !g) return;
    const prev = shown.current;
    shown.current = r;
    if (reduced || prev === r || typeof g.animate !== "function" || r <= 0) return;
    const anim =
      prev === null
        ? g.animate([{ transform: "scale(0)" }, { transform: "scale(1.06)", offset: 0.7 }, { transform: "none" }], {
            duration: duration.slower * 1000,
            delay: startDelay() * 1000,
            easing: cssEase(ease.out),
            fill: "backwards",
          })
        : g.animate([{ transform: `scale(${prev / r})` }, { transform: "none" }], {
            duration: duration.slow * 1000,
            easing: cssEase(ease.inOut),
          });
    return () => anim.cancel();
  }, [r, play, reduced]);
  const c = slotColor(color);
  return (
    <g transform={`translate(${r1(cx)} ${r1(cy)})`} className="pointer-events-none">
      <g style={{ transform: "scale(var(--geo-bz, 1))", transformOrigin: "0 0" }}>
        <g ref={growRef} style={{ transformOrigin: "0 0" }}>
          {/* A 2px surface ring keeps overlapping bubbles apart (the land still shows through). */}
          <circle
            r={(r + 1.6) * unit}
            fill="none"
            stroke="var(--sheen-chart-surface)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          <circle
            r={r * unit}
            vectorEffect="non-scaling-stroke"
            strokeWidth={active ? 2 : 1.25}
            className={cn("forced-colors:stroke-[CanvasText]", active && "[filter:var(--geo-glow)]")}
            style={{ fill: `color-mix(in oklab, ${c} ${active ? 88 : 58}%, transparent)`, stroke: c }}
          />
        </g>
      </g>
    </g>
  );
}

/**
 * The country outlines, coloured. Two of these layers stay mounted: a data change writes the new
 * colours into the hidden one and cross-fades (one opacity animation), so no outline is ever
 * created (or its path data parsed) again after the first view.
 */
export function CountryLayer({
  shapes,
  fills,
  count,
  hatch,
  hittable,
  entrance,
}: {
  shapes: readonly WorldCountryShape[];
  /** Fill per shape (null: the "no data" hatch). */
  fills: readonly (string | null)[] | null;
  /** How many outlines to draw (the hidden layer is filled in gradually while the page is idle). */
  count: number;
  hatch: string;
  /** Countries carry data-shape for hit-testing (not in bubble mode). */
  hittable: boolean;
  /** Mark the bands for the first-view wave (data-delay, read by useBandsEntrance). */
  entrance: boolean;
}) {
  const bands = useMemo(() => {
    const out: ReactNode[][] = Array.from({ length: BANDS }, () => []);
    shapes.slice(0, count).forEach((s, i) => {
      const band = clamp(Math.floor((s.c[0] / WORLD_FRAME_WIDTH) * BANDS), 0, BANDS - 1);
      itemAt(out, band).push(
        <path
          key={s.id}
          d={s.d}
          data-shape={hittable ? i : undefined}
          style={{ fill: fills?.[i] ?? (fills ? hatch : LAND) }}
          stroke="var(--sheen-chart-surface)"
          strokeWidth={0.75}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="forced-colors:stroke-[CanvasText]"
        />,
      );
    });
    return out;
  }, [shapes, fills, count, hatch, hittable]);
  return (
    <g>
      {bands.map((paths, b) => (
        <g key={b} data-delay={entrance ? r1(0.05 + ((b + 0.5) / BANDS) * 0.55) : undefined}>
          {paths}
        </g>
      ))}
    </g>
  );
}

/** Longitude bands of the first-view wave (west to east). */
export const BANDS = 14;

/**
 * The first-view entrance: the land rises in from west to east, one band of longitude after the
 * other. One Web Animation per band (opacity + transform), not per country: cheap to start, and
 * nothing runs per frame in JavaScript. Nothing runs with reduced motion.
 */
export function useBandsEntrance(layerRef: RefObject<SVGGElement | null>, play: boolean, reduced: boolean) {
  const done = useRef(false);
  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!play || done.current || !layer) return;
    done.current = true;
    if (reduced || typeof layer.animate !== "function") return;
    for (const el of layer.querySelectorAll<SVGGElement>("[data-delay]"))
      el.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: duration.slower * 1000,
          delay: Number(el.dataset.delay ?? 0) * 1000,
          easing: cssEase(ease.out),
          fill: "backwards",
        },
      );
  }, [play, reduced, layerRef]);
}
