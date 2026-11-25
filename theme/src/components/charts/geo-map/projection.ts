"use client";

import { useEffect, useState } from "react";
import { clamp } from "../chart-utils";
import type { WorldCountryShape } from "../geo/world-110m";

/* ======================================================================
 * Projection: Equal Earth (Šavrič, Patterson & Jenny, 2018), an equal-area
 * projection, so a country's ink is proportional to its real area. The frame
 * must match geo/world-110m.ts (generated with the same constants).
 * ====================================================================== */

/** Size of the map frame (SVG user units). */
export const WORLD_FRAME_WIDTH = 2000;
/**
 * Height of the world map's drawing frame (875 units); the frame is 2000 units wide. The country
 * outlines of `WORLD_110M` are drawn in that frame.
 */
export const WORLD_FRAME_HEIGHT = 875;
/** The northernmost latitude of the drawing frame (degrees). */
export const TOP_LAT = 84;
/** The southernmost latitude of the drawing frame (degrees), which leaves out Antarctica. */
export const BOTTOM_LAT = -58;
/** First coefficient of the Equal Earth projection polynomial. */
export const A1 = 1.340264;
/** Second coefficient of the Equal Earth projection polynomial. */
export const A2 = -0.081106;
/** Third coefficient of the Equal Earth projection polynomial. */
export const A3 = 0.000893;
/** Fourth coefficient of the Equal Earth projection polynomial. */
export const A4 = 0.003796;
/** The Equal Earth constant `sqrt(3) / 2`. */
export const M = Math.sqrt(3) / 2;
/** Units of the map frame per unit of projected x, so the world fills the frame width. */
export const SCALE = WORLD_FRAME_WIDTH / 2 / (Math.PI / (M * A1));

/** The Equal Earth projection of a longitude and latitude (degrees) to unscaled x and y (pure). */
export function equalEarth(lon: number, lat: number): [number, number] {
  const lambda = (lon * Math.PI) / 180;
  const theta = Math.asin(M * Math.sin((lat * Math.PI) / 180));
  const t2 = theta * theta;
  const t6 = t2 * t2 * t2;
  const x = (lambda * Math.cos(theta)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, y];
}

/** The projected y of the top latitude, the origin of the frame's y axis. */
export const Y_TOP = equalEarth(0, TOP_LAT)[1];

/** Longitude / latitude (degrees) to a point in the map frame. Latitudes are clamped to the frame. */
export function projectWorld(lon: number, lat: number): [number, number] {
  const [x, y] = equalEarth(clamp(lon, -180, 180), clamp(lat, BOTTOM_LAT, TOP_LAT));
  return [WORLD_FRAME_WIDTH / 2 + x * SCALE, (Y_TOP - y) * SCALE];
}

/** Rounds to one decimal place (keeps the SVG paths short). */
export const r1 = (n: number) => Math.round(n * 10) / 10;

/** Short, stable hash of a string (FNV-1a), for React keys. */
export function hash(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** The sphere's outline inside the frame (left and right edges are the ±180° meridians). */
export const SPHERE_PATH = (() => {
  const left: string[] = [];
  const right: string[] = [];
  for (let lat = TOP_LAT; lat >= BOTTOM_LAT; lat -= 2) {
    const [lx, ly] = projectWorld(-180, lat);
    const [rx, ry] = projectWorld(180, lat);
    left.push(`${r1(lx)},${r1(ly)}`);
    right.unshift(`${r1(rx)},${r1(ry)}`);
  }
  return `M${left.join("L")}L${right.join("L")}Z`;
})();

/** Graticule every 30°: meridians as curves, parallels as straight lines. */
export const GRATICULE_PATH = (() => {
  let d = "";
  for (let lon = -150; lon <= 150; lon += 30) {
    const pts: string[] = [];
    for (let lat = TOP_LAT; lat >= BOTTOM_LAT; lat -= 4) {
      const [x, y] = projectWorld(lon, lat);
      pts.push(`${r1(x)},${r1(y)}`);
    }
    d += `M${pts.join("L")}`;
  }
  for (const lat of [-30, 0, 30, 60]) {
    const [x0, y] = projectWorld(-180, lat);
    const [x1] = projectWorld(180, lat);
    d += `M${r1(x0)},${r1(y)}H${r1(x1)}`;
  }
  return d;
})();

/* ======================================================================
 * Country outlines: loaded on demand (their own ~19 KB gzipped chunk).
 * ====================================================================== */

/** The country outlines once loaded (null until then); shared by every map. */
export let worldCache: readonly WorldCountryShape[] | null = null;
/** The pending load of the country outlines (null before the first load and after a failed one, so a later mount retries). */
export let worldPromise: Promise<readonly WorldCountryShape[]> | null = null;

/** Starts loading the bundled 1:110m world outlines (cached; safe to call repeatedly, e.g. on hover). */
export function loadWorld110m() {
  worldPromise ??= import("../geo/world-110m").then(
    (m) => (worldCache = m.WORLD_110M),
    (error: unknown) => {
      worldPromise = null; // let a later mount retry
      throw error;
    },
  );
  return worldPromise;
}

/** The country outlines to draw: `shapes` when given, else the bundled world, loaded once. */
export function useWorldShapes(shapes: readonly WorldCountryShape[] | undefined) {
  const [loaded, setLoaded] = useState<readonly WorldCountryShape[] | null>(() => worldCache);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (shapes || worldCache) return;
    let alive = true;
    loadWorld110m().then(
      (s) => alive && setLoaded(s),
      () => alive && setFailed(true),
    );
    return () => {
      alive = false;
    };
  }, [shapes]);
  return { shapes: shapes ?? loaded ?? worldCache, failed: !shapes && failed };
}

/** "in", "IND", "356", 356 → the key used in the code index. */
export function normalizeCode(code: string | number) {
  const c = String(code).trim().toUpperCase();
  return /^\d+$/.test(c) ? c.padStart(3, "0") : c;
}

/** Index of every alias of each country: alpha-3, alpha-2 and numeric codes. */
export function codeIndex(shapes: readonly WorldCountryShape[]) {
  const map = new Map<string, number>();
  shapes.forEach((s, i) => {
    for (const code of [s.id, s.a2, s.numeric]) if (code) map.set(normalizeCode(code), i);
  });
  return map;
}

/** Cache of `Intl.DisplayNames` by locale (null where the locale is not supported). */
export const regionNames = new Map<string, Intl.DisplayNames | null>();

/**
 * A country's name in `locale` (Intl.DisplayNames), e.g. "Allemagne" for DEU in "fr";
 * Natural Earth's English name when the browser has no name for it.
 */
export function worldCountryName(shape: Pick<WorldCountryShape, "a2" | "name">, locale = "en") {
  let names = regionNames.get(locale);
  if (names === undefined) {
    try {
      names = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      names = null;
    }
    regionNames.set(locale, names);
  }
  if (names && shape.a2) {
    try {
      const name = names.of(shape.a2);
      if (name && name !== shape.a2) return name;
    } catch {
      /* unknown region code: fall back */
    }
  }
  return shape.name;
}
