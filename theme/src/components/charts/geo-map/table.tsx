"use client";

import { useMemo, type ReactNode } from "react";
import { ChartValueTable, defaultCompact, defaultPercent, MissingValue } from "../heatmap";
import { useWorldShapes, normalizeCode, codeIndex, worldCountryName } from "./projection";
import { defaultWorldMapLabels, type WorldMapProps } from "./types";

/* ======================================================================
 * Table view
 * ====================================================================== */

/**
 * Props of WorldMapTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type WorldMapTableProps = Pick<
  WorldMapProps,
  "data" | "points" | "mode" | "format" | "locale" | "valueLabel" | "shapes" | "labels"
> & {
  /** Add a share-of-total column (for additive measures: revenue, users). */
  share?: boolean;
  /** Sets a visually hidden caption that names the table. */
  caption?: string;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
};

/**
 * Every value on the map as a ranked table: rank, country (or place), value and optional share.
 *
 * Props: the map's `data`, `points`, `mode`, `format`, `locale`, `valueLabel`, `shapes` and `labels`, plus `share` (adds a share column), `caption` (hidden, names the table) and `emptyState`. A real table ranking every value on the map: rank, country (or place) and value. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { WorldMapTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <WorldMapTable data={[{ id: "USA", value: 4200 }, { id: "DEU", value: 1800 }]} valueLabel="Users" share caption="Users by country" />
 *   );
 * }
 * ```
 *
 * @see /charts/world-map
 */
export function WorldMapTable({
  data = [],
  points,
  mode = "choropleth",
  format: formatProp,
  locale = "en",
  valueLabel,
  shapes: shapesProp,
  labels: labelOverrides,
  share = false,
  caption,
  emptyState,
}: WorldMapTableProps) {
  const labels = { ...defaultWorldMapLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const percent = defaultPercent(locale);
  const { shapes } = useWorldShapes(shapesProp);
  const index = useMemo(() => (shapes ? codeIndex(shapes) : new Map<string, number>()), [shapes]);

  const rows = useMemo(() => {
    let list: { name: string; value: number | null }[];
    if (mode === "bubble" && points)
      list = points.map((p) => ({ name: p.label, value: Number.isFinite(p.value) ? p.value : null }));
    else {
      // Exactly what the map draws: codes that match no country are left out (so the ranks agree
      // with the map's "Rank n of N"), and a country given twice keeps its last value, as on the map.
      const byShape = new Map<number, { name: string; value: number | null }>();
      for (const d of data) {
        const i = index.get(normalizeCode(d.id));
        const s = i === undefined ? undefined : shapes?.[i];
        if (i === undefined || !s) continue;
        byShape.set(i, {
          name: d.label ?? worldCountryName(s, locale),
          value: typeof d.value === "number" && Number.isFinite(d.value) ? d.value : null,
        });
      }
      list = [...byShape.values()];
    }
    return list.sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity) || a.name.localeCompare(b.name, locale));
  }, [data, points, mode, index, shapes, locale]);
  const total = rows.reduce((s, r) => s + (r.value !== null && r.value > 0 ? r.value : 0), 0);

  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState ?? labels.noData}
      columns={[
        { label: mode === "bubble" && points ? labels.place : labels.country },
        { label: valueLabel ?? labels.value },
        ...(share ? [{ label: labels.share }] : []),
        { label: labels.rankHeader },
      ]}
      rows={rows.map((r, i) => [
        r.name,
        r.value === null ? <MissingValue label={labels.noData} /> : format(r.value),
        ...(share
          ? [
              r.value === null || total <= 0 ? (
                <MissingValue label={labels.noData} />
              ) : (
                percent(Math.max(0, r.value) / total)
              ),
            ]
          : []),
        r.value === null ? <MissingValue label={labels.noData} /> : String(i + 1),
      ])}
    />
  );
}
