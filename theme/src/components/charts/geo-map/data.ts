"use client";

import { useCallback, useMemo } from "react";

import { clamp, type ChartColor } from "../chart-utils";
import { scalePosition, sequentialColor } from "../heatmap";
import type { WorldCountryShape } from "../geo/world-110m";
import { codeIndex, normalizeCode, projectWorld, worldCountryName } from "./projection";
import { divergingColor, divergingPosition } from "./parts";
import type { WorldMapDatum, WorldMapPoint, WorldMapProps } from "./types";

/** Lightest step of a map's colour ramp: raised from the heatmap's 0.08 so data out-contrasts the faint no-data land. */
export const MAP_RAMP_FLOOR = 0.3;

/** One thing the keyboard, pointer and tooltip move between: a country or a bubble. @internal */
export type MapItem = {
  /** Index into shapes (countries) or into the bubble list. */
  key: string;
  name: string;
  value: number | null;
  x: number;
  y: number;
  /** Bubble radius in px (bubble mode). */
  r: number;
  shape: number | null;
};

/** What the map's data derivation reads. @internal */
export type WorldMapDataInput = {
  shapes: readonly WorldCountryShape[] | null | undefined;
  data: readonly WorldMapDatum[];
  points: readonly WorldMapPoint[] | undefined;
  mode: NonNullable<WorldMapProps["mode"]>;
  scale: NonNullable<WorldMapProps["scale"]>;
  scaleType: NonNullable<WorldMapProps["scaleType"]>;
  midpoint: number;
  color: ChartColor;
  divergingColors: [ChartColor, ChartColor];
  domain: [number, number] | undefined;
  steps: number;
  locale: string;
  width: number;
};

/**
 * Everything the map derives from its props: values by country, the colour scale (`fillOf`), bubble
 * sizes, and the ordered `items` (with their rank) that the keyboard, pointer and tooltip move between.
 * @internal
 */
export function useWorldMapData(o: WorldMapDataInput) {
  const { shapes, data, points, mode, scale, scaleType, midpoint, color, divergingColors, domain, steps, locale } = o;
  const { width } = o;
  const index = useMemo(() => (shapes ? codeIndex(shapes) : new Map<string, number>()), [shapes]);
  const names = useMemo(() => (shapes ? shapes.map((s) => worldCountryName(s, locale)) : []), [shapes, locale]);
  /** Value and label per shape index. */
  const byShape = useMemo(() => {
    const map = new Map<number, { value: number | null; label?: string }>();
    for (const d of data) {
      const i = index.get(normalizeCode(d.id));
      if (i === undefined) continue;
      const v = typeof d.value === "number" && Number.isFinite(d.value) ? d.value : null;
      map.set(i, { value: v, label: d.label });
    }
    return map;
  }, [data, index]);

  const values = useMemo(() => {
    const list: number[] = [];
    if (mode === "bubble" && points) {
      for (const p of points) if (Number.isFinite(p.value)) list.push(p.value);
    } else {
      for (const { value } of byShape.values()) if (value !== null) list.push(value);
    }
    return list;
  }, [byShape, points, mode]);
  const hasData = values.length > 0;

  const [lo, hi] = useMemo<[number, number]>(() => {
    if (domain) return domain;
    if (!values.length) return [0, 0];
    let a = Infinity;
    let b = -Infinity;
    for (const v of values) {
      a = Math.min(a, v);
      b = Math.max(b, v);
    }
    if (scale === "diverging") {
      const reach = Math.max(Math.abs(a - midpoint), Math.abs(b - midpoint)) || 1;
      return [midpoint - reach, midpoint + reach];
    }
    return [Math.min(0, a), b];
  }, [values, domain, scale, midpoint]);

  // Where a value sits on a sequential scale (0–1), for each scale type.
  const sorted = useMemo(() => [...values].sort((a, b) => a - b), [values]);
  const logLo = useMemo(() => {
    const floor = domain && domain[0] > 0 ? domain[0] : (sorted.find((v) => v > 0) ?? 1);
    return Math.max(1e-12, Math.min(floor, hi > 0 ? hi : floor));
  }, [sorted, domain, hi]);
  const positionOf = useCallback(
    (value: number) => {
      if (scaleType === "log" && hi > 0) {
        const a = Math.log10(logLo);
        const b = Math.log10(hi);
        return scalePosition(Math.log10(Math.max(logLo, value)), a, b, steps);
      }
      if (scaleType === "quantile" && sorted.length > 1) {
        // Share of values below this one (ties share the middle of their run).
        let below = 0;
        let equal = 0;
        for (const v of sorted) {
          if (v < value) below++;
          else if (v === value) equal++;
        }
        const t = (below + Math.max(0, equal - 1) / 2) / (sorted.length - 1);
        return steps >= 2 ? Math.min(steps - 1, Math.floor(t * steps)) / (steps - 1) : clamp(t, 0, 1);
      }
      return scalePosition(value, lo, hi, steps);
    },
    [scaleType, lo, hi, logLo, sorted, steps],
  );

  // The two hues as plain values, so a new (but equal) array prop never re-colours the map.
  const [divLow, divHigh] = divergingColors;
  const fillOf = useCallback(
    (value: number | null) => {
      if (value === null) return null;
      if (scale === "diverging")
        return divergingColor(divergingPosition(value, lo, midpoint, hi, steps), [divLow, divHigh]);
      return sequentialColor(positionOf(value), color, MAP_RAMP_FLOOR);
    },
    [scale, lo, hi, midpoint, steps, color, divLow, divHigh, positionOf],
  );

  // Bubble sizes: area ∝ value; the largest bubble scales with the map (10–30px).
  const maxR = clamp(width * 0.032, 10, 30);
  const maxValue = values.reduce((m, v) => Math.max(m, v), 0);
  const radius = useCallback(
    (v: number) => (v > 0 && maxValue > 0 ? Math.max(4, Math.sqrt(v / maxValue) * maxR) : 0),
    [maxValue, maxR],
  );

  /** What the keyboard, pointer and tooltip move between. */
  const items = useMemo<MapItem[]>(() => {
    if (!shapes) return [];
    if (mode === "bubble") {
      const list: MapItem[] = [];
      if (points) {
        points.forEach((p) => {
          if (!Number.isFinite(p.value) || p.value <= 0) return;
          const [x, y] = projectWorld(p.lon, p.lat);
          list.push({ key: p.id ?? p.label, name: p.label, value: p.value, x, y, r: radius(p.value), shape: null });
        });
      } else {
        for (const [i, d] of byShape) {
          const s = shapes[i];
          if (!s || d.value === null || d.value <= 0) continue;
          list.push({
            key: s.id,
            name: d.label ?? names[i] ?? s.name,
            value: d.value,
            x: s.c[0],
            y: s.c[1],
            r: radius(d.value),
            shape: i,
          });
        }
      }
      // Largest first, so small bubbles draw on top.
      return list.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    }
    return shapes.map((s, i) => {
      const d = byShape.get(i);
      return {
        key: s.id,
        name: d?.label ?? names[i] ?? s.name,
        value: d?.value ?? null,
        x: s.c[0],
        y: s.c[1],
        r: 0,
        shape: i,
      };
    });
  }, [shapes, mode, points, byShape, names, radius]);

  /** Items with a value, highest first (rank order). */
  const ranked = useMemo(
    () =>
      items
        .map((it, i) => ({ i, v: it.value }))
        .filter((e): e is { i: number; v: number } => e.v !== null)
        .sort((a, b) => b.v - a.v)
        .map((e) => e.i),
    [items],
  );
  const rankOf = useMemo(() => new Map(ranked.map((i, r) => [i, r + 1])), [ranked]);
  return { byShape, hasData, lo, hi, sorted, logLo, positionOf, fillOf, maxR, maxValue, items, ranked, rankOf };
}
