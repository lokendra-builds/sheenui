import type { ComponentType } from "react";

/* ====================================================================================
 * The gallery: every chart in the theme as a live mini preview.
 *
 * Performance (the page holds ~50 real charts):
 *   - each chart's code is its own chunk, fetched only when its tile nears the viewport;
 *   - tiles mount ONE chart per frame through a small queue, so a screenful of tiles never
 *     becomes one long task;
 *   - previews are inert and drawn on a fixed 520 × 260 stage scaled to the tile (transform),
 *     so every chart lays out at a desktop width and nothing in them is interactive;
 *   - tiles use content-visibility: auto (off-screen tiles skip rendering and painting) and
 *     no backdrop-filter (the glass budget stays at the page chrome + one featured panel);
 *   - entrances are CSS transform/opacity animations, paused until the tile is in view;
 *   - live previews (streaming) pause off-screen and in hidden tabs.
 * ==================================================================================== */

export type GalleryCategory =
  "Comparison" | "Trend" | "Composition" | "Distribution" | "Flow" | "Hierarchy" | "Geo" | "Finance" | "KPI";

export type GalleryEntry = {
  slug: string;
  title: string;
  /** Route of the chart's page, or "" for the charts documented on this page. */
  path: string;
  /** 1–2 categories, the first is primary. */
  categories: GalleryCategory[];
  blurb: string;
  load: () => Promise<ComponentType>;
};

export const CATEGORIES: readonly GalleryCategory[] = [
  "Comparison",
  "Trend",
  "Composition",
  "Distribution",
  "Flow",
  "Hierarchy",
  "Geo",
  "Finance",
  "KPI",
];
