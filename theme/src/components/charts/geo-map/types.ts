import { type ReactNode } from "react";
import { type ChartColor, type ChartInstructions } from "../chart-utils";
import type { WorldCountryShape } from "../geo/world-110m";

/* ======================================================================
 * Types
 * ====================================================================== */

/** A value for one country. `id` is any ISO 3166-1 code: alpha-2 ("IN"), alpha-3 ("IND") or numeric ("356"). */
export type WorldMapDatum = {
  id: string;
  /** null (or missing) reads "No data", never 0. */
  value: number | null;
  /** Name shown instead of the country's own (localised) name. */
  label?: string;
};

/** A bubble at a place (cities, offices, data centres). */
export type WorldMapPoint = {
  /** Stable identity, so the bubble tweens when the data changes. Defaults to the label. */
  id?: string;
  label: string;
  lon: number;
  lat: number;
  value: number;
};

/** What `onSelect` receives. */
export type WorldMapSelection = {
  /** The country's alpha-3 code, or the point's id. */
  id: string;
  name: string;
  value: number | null;
  kind: "country" | "point";
};

/**
 * Every string WorldMap speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type WorldMapLabels = {
  /** Appended to the accessible name: how to read the map with the keyboard (choropleth). */
  instructions: ChartInstructions;
  /** The same for a bubble map, whose items are places rather than countries. */
  instructionsBubble: ChartInstructions;
  /** Role description announced for the map. */
  roleDescription: string;
  /** Tooltip / table text for a country without a value. */
  noData: string;
  /** Legend key for countries without a value. */
  noDataKey: string;
  /** Shown in the readout band of a narrow touch map while nothing is being read (choropleth / bubbles). */
  hint: string;
  hintBubble: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  /** Accessible name of the zoom buttons' group; `name` is the map's aria-label. */
  zoomControls: (name: string) => string;
  /** Flashed when someone scrolls over the map without the zoom modifier. `mac` picks ⌘ or Ctrl. */
  zoomHint: (mac: boolean) => string;
  /** Legend caption of a log scale; `caption` is valueLabel. */
  logScale: (caption: string) => string;
  /** "Rank 3 of 42". */
  rank: (rank: number, total: number) => string;
  /** Shown if the map outlines fail to load. */
  loadError: string;
  /** Table headers. */
  rankHeader: string;
  country: string;
  place: string;
  value: string;
  share: string;
};

/**
 * The built-in English strings of WorldMap; spread it into your own `labels` and change what you need.
 * This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultWorldMapLabels: WorldMapLabels = {
  instructions:
    "Arrow keys move to the neighbouring country, Page Up and Page Down step through them by value, Home and End jump to the highest and lowest. Type a name to jump to it. Plus and minus zoom, 0 resets.",
  instructionsBubble:
    "Arrow keys move to the nearest place in that direction, Page Up and Page Down step through them by value, Home and End jump to the highest and lowest. Type a name to jump to it. Plus and minus zoom, 0 resets.",
  roleDescription: "map",
  noData: "No data",
  noDataKey: "No data",
  hint: "Tap a country for its value",
  hintBubble: "Tap a bubble for its value",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetZoom: "Reset zoom",
  zoomControls: (name) => `${name}: zoom`,
  zoomHint: (mac) => (mac ? "Use ⌘ + scroll to zoom the map" : "Use Ctrl + scroll to zoom the map"),
  logScale: (caption) => `${caption} (log)`,
  rank: (rank, total) => `Rank ${rank} of ${total}`,
  loadError: "The map could not be loaded.",
  rankHeader: "Rank",
  country: "Country",
  place: "Place",
  value: "Value",
  share: "Share",
};

/**
 * Props of WorldMap. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type WorldMapProps = {
  /** Values by country (choropleth), or bubble sizes at each country's centre (`mode="bubble"`). */
  data?: readonly WorldMapDatum[];
  /** Bubbles at coordinates (cities, offices). Drawn in bubble mode. */
  points?: readonly WorldMapPoint[];
  /** Colour each country by its value, or size a bubble by it. Default "choropleth". */
  mode?: "choropleth" | "bubble";
  /**
   * Choropleth scale: "sequential" (one hue, light → dark: counts, rates) or "diverging"
   * (two hues around a neutral `midpoint`: growth, change, sentiment). Default "sequential".
   */
  scale?: "sequential" | "diverging";
  /** Value at the neutral centre of a diverging scale. Default 0. */
  midpoint?: number;
  /**
   * How values spread over a sequential scale: "linear" (default); "log" for skewed data where one
   * market dwarfs the rest (revenue, population); "quantile" ranks the values, so each colour holds
   * about the same number of countries.
   */
  scaleType?: "linear" | "log" | "quantile";
  /** Hue of the sequential scale and of bubbles: a palette slot 1–8. Default 1. */
  color?: ChartColor;
  /** Hues below and above the midpoint of a diverging scale. Default [2, 7] (orange, blue). */
  divergingColors?: [ChartColor, ChartColor];
  /** The [min, max] the color scale spans; values outside it take the end colors. Default: the data's range (from 0 when every value is positive). */
  domain?: [number, number];
  /** Classes on the scale (e.g. 5); 0 = continuous. */
  steps?: number;
  /** Formats a region's value for the tooltips, legend and data table: takes the number, returns the text shown. Default: compact numbers in `locale`. */
  format?: (n: number) => string;
  /** Locale of the number format and of country names (Intl). Default "en". */
  locale?: string;
  /** Name of the measure (legend caption, tooltip), e.g. "Revenue". */
  valueLabel?: string;
  /** Show the colour (or size) key under the map. Default true. */
  legend?: boolean;
  /** Allow zooming and panning (buttons, ⌘/Ctrl + scroll, pinch, drag, + / −). Default true. */
  zoomable?: boolean;
  /** Deepest zoom level: the map magnifies up to this many times its fitted size. Default 8. */
  maxZoom?: number;
  /** Your own outlines in the same frame (skips loading the bundled world). */
  shapes?: readonly WorldCountryShape[];
  /** Called with a country (or bubble) on click, Enter or Space. */
  onSelect?: (selection: WorldMapSelection) => void;
  /** Shown over the map when there is no data. Default "No data". */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<WorldMapLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};
