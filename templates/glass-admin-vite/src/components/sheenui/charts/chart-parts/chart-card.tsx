"use client";

import type { ComponentProps } from "react";
import {
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import { cn } from "../../lib/cn";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../../lib/heading";
import { Skeleton } from "../../skeleton/skeleton";
import {
  chartCsv,
  chartFileName,
  downloadCsv,
  exportChartImage,
  tableCsv,
  type ChartCsvOptions,
  type ChartExportFormat,
} from "../chart-export";
import { ChartTwinContext } from "../chart-figure";
import { useChartSeriesState, ChartExportMenu, type SeriesContextValue, SeriesContext } from "./state";
import {
  type LegendItem,
  type ChartLegendLabels,
  defaultChartLegendLabels,
  ChartLegend,
  LegendKey,
  ChartAnnouncer,
} from "./legend-tooltip";
import { ChartEmpty, ChartTable, LabelsContext, TableLabelContext } from "./empty-table";

/* ---------- Chart card ---------- */

/**
 * Translatable text of ChartCard: tab names, export menu items, download announcements and the legend
 * strings.
 */
export type ChartCardLabels = {
  /** Tab names. */
  chart: string;
  table: string;
  /** Spoken name of the loading placeholder shown while `loading` is true. */
  loading: string;
  /** Name of the Chart / Table tab list. */
  viewAs: (title: string) => string;
  /** Name of the screen-reader copy of the data table. */
  dataTable: (title: string) => string;
  /** Empty table / empty chart text inside this card. */
  noData: ReactNode;
  /** Header of previous-period table columns. */
  previous: (label: string) => string;
  /** The export menu button's accessible name. */
  options: (title: string) => string;
  downloadPng: string;
  downloadSvg: string;
  downloadCsv: string;
  /** Second lines of the menu items. */
  pngHint: string;
  svgHint: string;
  csvHint: string;
  /** Announced after a download starts. */
  downloaded: (file: string) => string;
  exportFailed: string;
} & ChartLegendLabels;

/**
 * The built-in English strings of ChartCard; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultChartCardLabels: ChartCardLabels = {
  chart: "Chart",
  table: "Table",
  loading: "Loading chart",
  viewAs: (title) => `${title}: view as`,
  dataTable: (title) => `${title} data table`,
  noData: "No data",
  previous: (label) => `${label} (previous)`,
  options: (title) => `${title}: download`,
  downloadPng: "Download PNG",
  downloadSvg: "Download SVG",
  downloadCsv: "Download CSV",
  pngHint: "Image, 2× resolution",
  svgHint: "Vector, for slides and docs",
  csvHint: "The data, for spreadsheets",
  downloaded: (file) => `Downloaded ${file}`,
  exportFailed: "Download failed",
  ...defaultChartLegendLabels,
};

/** Props of ChartCard: title, the chart and its table view, legend, export menu and `labels`. */
export type ChartCardProps = {
  /** Sets the card's heading text. */
  title: string;
  /** A line of context under the title (period, unit, source). */
  description?: ReactNode;
  /** Shown at the top right, e.g. a headline number. */
  aside?: ReactNode;
  /** Legend shown under the header. Omit for single-series charts (the title names the series). */
  legend?: readonly LegendItem[];
  /** Table view of the same data. When given, the card gets Chart / Table tabs. */
  table?: ReactNode;
  /** Heading level of the title (1 to 6, default 3), to fit the page outline, or `"none"` for a paragraph with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
  /** The chart (or table) the card frames; it fills the card body under the title and description. */
  children: ReactNode;
  /** Adds extra classes to the card's outer element. */
  className?: string;
  /**
   * Interactive legend: when the chart inside supports it (Line, Area, Bar, Donut), legend
   * items become toggle buttons that hide / show a series. Default true; false keeps it static.
   */
  legendToggle?: boolean;
  /** Hides these series at first (interactive legends). */
  defaultHiddenSeries?: readonly string[];
  /**
   * A download menu: PNG / SVG of the chart (colours resolved, exactly as shown) and CSV of the
   * data. `true` offers every format; or pick some, and name the file (default: the title).
   */
  exportable?: boolean | { formats?: ChartExportFormat[]; filename?: string };
  /** Data for the CSV download. Without it the CSV is read from the table view. */
  csv?: ChartCsvOptions;
  /** The card's built-in strings (tab names, CSV button, table text); a partial object over the English defaults, so pass only the keys you translate. */
  labels?: Partial<ChartCardLabels>;
  /**
   * "glass" (default): a glass-2 card. "plain": the same card without backdrop blur, for cards
   * nested inside another glass panel or many cards in view at once (the glass budget).
   */
  surface?: "glass" | "plain";
  /** Show a skeleton placeholder instead of the chart (and the table) while data is on its way. Default false. */
  loading?: boolean;
};

/** The glass card classes of a chart with a header. @internal */
export const cardClass = "glass-2 flex min-w-0 flex-col gap-4 rounded-sheen-lg p-5";
/** The plain card classes of a chart without glass. @internal */
export const plainCardClass =
  "flex min-w-0 flex-col gap-4 rounded-sheen-lg border border-sheen-border bg-sheen-surface/55 p-5 shadow-[inset_0_1px_0_0_var(--sheen-glass-highlight)] forced-colors:border-[CanvasText]";
/* Compact view tabs. On touch screens an invisible ::before grows each hit area to 44px tall. */
/** The class string of a compact view tab, with a 44px touch hit area. @internal */
export const viewTabClass = cn(
  "relative z-10 inline-flex h-7 items-center justify-center rounded-sheen-full px-3 text-xs font-medium whitespace-nowrap text-sheen-fg-muted select-none",
  "transition-[color] duration-(--sheen-duration-fast) hover:text-sheen-fg data-active:text-sheen-fg",
  "touch-manipulation [-webkit-tap-highlight-color:transparent]",
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
  "sheen-hit-before",
  "forced-colors:data-active:underline forced-colors:data-active:decoration-2 forced-colors:data-active:underline-offset-4",
);
// `flex-1 justify-end`: in a row of cards of unequal content (one has a legend row, one a donut) the plots sit on the card's bottom edge, so their baselines line up across the row.
/** The inner panel classes of a chart card. @internal */
export const panelClass =
  "flex min-w-0 flex-1 flex-col justify-end gap-4 rounded-sheen-sm outline-none " +
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus";

/**
 * A glass card with header, legend and (when `table` is given) Chart / Table tabs.
 * The tabs control real tab panels, so assistive tech hears "Chart, tab 1 of 2" and lands in
 * the matching panel. Switching is cheap: both panels stay mounted once shown (the chart is
 * never torn down and re-drawn), a visually hidden copy of the table keeps the data in the accessibility tree while the chart shows (the figure's `aria-details` points at it), the table tab is built the first time it's wanted (or when the
 * pointer heads for its tab), and the active pill moves with a transform, never a measurement.
 *
 * Keyboard: Tab reaches the Chart / Table tabs (arrow keys switch them), the interactive legend (Enter or Space toggles a series) and the download menu. Reading a point inside the chart is each chart's own arrow-key behaviour.
 * Glass and motion: one glass-2 surface (`surface="plain"` drops the blur). The tab pill moves with a transform; reduced motion makes it instant. The table view is the colour-free, screen-reader view of the same data.
 *
 * @example
 * ```tsx
 * import { ChartCard, ChartTable, LineChart, seriesLegend, type ChartSeries } from "@sheenui/theme";
 *
 * const series: ChartSeries[] = [{ key: "v", label: "Visits" }];
 * const rows = [
 *   { m: "Jan", v: 4 },
 *   { m: "Feb", v: 7 },
 * ];
 *
 * export function Example() {
 *   return (
 *     <ChartCard title="Visits" description="Last two months" legend={seriesLegend(series, "line")} table={<ChartTable data={rows} index="m" series={series} caption="Visits per month" />} exportable>
 *       <LineChart data={rows} index="m" series={series} aria-label="Visits per month" />
 *     </ChartCard>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function ChartCard({
  title,
  description,
  aside,
  legend,
  table,
  headingLevel = 3,
  children,
  className,
  legendToggle = true,
  defaultHiddenSeries,
  exportable = false,
  csv,
  labels,
  surface = "glass",
  loading = false,
}: ChartCardProps) {
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const surfaceClass = surface === "plain" ? plainCardClass : cardClass;
  const t = { ...defaultChartCardLabels, ...labels };
  const [view, setView] = useState<string>("chart");
  const [tableMounted, setTableMounted] = useState(false);
  // While the table is still being built (in a transition), the empty panel keeps the card at
  // the chart's height, so switching never collapses and re-grows the card.
  const [holdHeight, setHoldHeight] = useState(0);
  const titleId = useId();
  const tableId = useId();
  const twinId = useId();
  // The Table tab's panel is display:none while the chart shows, so it is out of the accessibility tree. A visually hidden
  // copy of the table (built after first paint) keeps the data reachable through the figure's aria-details at all times.
  const [twinReady, setTwinReady] = useState(false);
  useEffect(() => {
    if (table) startTransition(() => setTwinReady(true));
  }, [table]);
  const chartPanel = useRef<HTMLDivElement>(null);
  const tablePanel = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");

  // Series visibility shared with the chart inside.
  const series = useChartSeriesState(defaultHiddenSeries);
  const [registered, setRegistered] = useState(0);
  const register = useCallback(() => {
    setRegistered((n) => n + 1);
    return () => setRegistered((n) => n - 1);
  }, []);
  const seriesContext = useMemo<SeriesContextValue>(() => ({ ...series, register }), [series, register]);
  const shared = useMemo(
    () => ({ noData: labels?.noData, previous: labels?.previous }),
    [labels?.noData, labels?.previous],
  );

  const toggleable = legendToggle && registered > 0;
  const legendEl =
    legend && legend.length > 1 ? (
      toggleable ? (
        <ChartLegend
          items={legend}
          hidden={series.hidden}
          onToggle={series.toggle}
          onHighlight={series.setHighlighted}
          labels={{ legend: t.legend, shown: t.shown, hidden: t.hidden }}
        />
      ) : (
        <ChartLegend items={legend} />
      )
    ) : null;

  const formats: ChartExportFormat[] = exportable
    ? exportable === true
      ? ["png", "svg", "csv"]
      : (exportable.formats ?? ["png", "svg", "csv"])
    : [];
  const named = typeof exportable === "object" ? exportable.filename : undefined;
  const fileBase = chartFileName(named !== undefined && named !== "" ? named : title);

  async function runExport(format: ChartExportFormat) {
    try {
      if (format === "csv") {
        let text = csv ? chartCsv(csv) : "";
        if (!text && table) {
          // The table view is the source of truth: build it now if it hasn't been shown yet.
          if (!tableMounted) flushSync(() => setTableMounted(true));
          const el = tablePanel.current?.querySelector("table");
          if (el) text = tableCsv(el);
        }
        if (!text) throw new Error("no data");
        downloadCsv(fileBase, text);
        setAnnouncement(t.downloaded(`${fileBase}.csv`));
      } else {
        const ok = await exportChartImage(chartPanel.current, format, fileBase, { title });
        if (!ok) throw new Error("no chart");
        setAnnouncement(t.downloaded(`${fileBase}.${format}`));
      }
    } catch {
      setAnnouncement(t.exportFailed);
    }
  }

  const menu =
    formats.length > 0 ? (
      // The server renders the real menu button; the fallback only shows on a client-side
      // navigation, and holds the button's box so the header does not shift.
      <Suspense fallback={<span aria-hidden className="inline-block size-8" />}>
        <ChartExportMenu
          title={title}
          labels={t}
          formats={formats}
          csv={!!csv || !!table}
          onExport={(format) => void runExport(format)}
        />
      </Suspense>
    ) : null;

  const tabs = table ? (
    <BaseTabs.List
      aria-label={t.viewAs(title)}
      // Two views: arrowing between them switches at once (automatic activation), as the
      // keyboard docs promise. The table is built in a transition, so the switch stays instant.
      activateOnFocus
      className="relative grid grid-cols-2 rounded-sheen-full bg-sheen-hover p-0.5 shadow-[inset_0_0_0_1px_var(--sheen-border)]"
    >
      {/* The active pill: half the track, moved by a transform (no measuring, no layout). */}
      <span
        aria-hidden
        data-slot="chart-view-pill"
        className={cn(
          "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-sheen-full bg-sheen-indicator shadow-(--sheen-indicator-shadow)",
          "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-snappy) motion-ok:ease-sheen-snappy",
          "forced-colors:hidden",
        )}
        style={{ transform: view === "table" ? "translateX(100%)" : "translateX(0)" }}
      />
      <BaseTabs.Tab value="chart" className={viewTabClass}>
        {t.chart}
      </BaseTabs.Tab>
      <BaseTabs.Tab
        value="table"
        className={viewTabClass}
        // Build the table as soon as the pointer or focus heads for its tab, in a transition
        // that yields to input: by the time it's clicked, switching only flips visibility.
        onPointerEnter={() => !tableMounted && startTransition(() => setTableMounted(true))}
        onFocus={() => !tableMounted && startTransition(() => setTableMounted(true))}
      >
        {t.table}
      </BaseTabs.Tab>
    </BaseTabs.List>
  ) : null;

  const header = (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <Heading id={titleId} className="font-semibold">
          {title}
        </Heading>
        {description && <p className="mt-0.5 text-sm text-sheen-fg-muted">{description}</p>}
      </div>
      {(!!aside || !!tabs || !!menu) && (
        <div className="flex items-center gap-2">
          {aside && <div className="me-1">{aside}</div>}
          {tabs}
          {menu}
        </div>
      )}
    </header>
  );

  // While loading, a skeleton stands in for the chart: a polite status, the card keeps a chart-sized height.
  const content = loading ? (
    <div role="status" aria-busy="true" className="flex flex-col gap-3">
      <span className="sr-only">{t.loading}</span>
      <Skeleton shape="rect" height={192} className="w-full" />
      <Skeleton shape="text" width="40%" />
    </div>
  ) : (
    children
  );

  const body = !table ? (
    <section aria-labelledby={titleId} className={cn(surfaceClass, className)}>
      {header}
      {legendEl}
      <div ref={chartPanel} className="flex min-w-0 flex-1 flex-col justify-end gap-4">
        {content}
      </div>
      {menu && <ChartAnnouncer text={announcement} />}
    </section>
  ) : (
    <BaseTabs.Root
      value={view}
      onValueChange={(v) => {
        const next = String(v);
        // The switch itself is instant (the pill moves, the panels swap). A table that hasn't
        // been built yet is rendered in a transition, which yields to input instead of
        // blocking the tap in one long task (on touch screens there's no hover to pre-build it).
        setView(next);
        if (next === "table" && !tableMounted) {
          setHoldHeight(chartPanel.current?.offsetHeight ?? 0);
          startTransition(() => setTableMounted(true));
        }
      }}
      render={<section aria-labelledby={titleId} />}
      className={cn(surfaceClass, className)}
    >
      {header}
      {/* The chart itself is focusable, so its panel isn't a separate tab stop. */}
      <BaseTabs.Panel ref={chartPanel} value="chart" keepMounted tabIndex={-1} className={panelClass}>
        {legendEl}
        {content}
      </BaseTabs.Panel>
      <BaseTabs.Panel
        ref={tablePanel}
        id={tableId}
        value="table"
        keepMounted
        aria-busy={!tableMounted || undefined}
        className={panelClass}
        style={tableMounted || holdHeight <= 0 ? undefined : { minHeight: holdHeight }}
      >
        {tableMounted ? table : null}
      </BaseTabs.Panel>
      {twinReady && view === "chart" ? (
        <div id={twinId} className="sr-only">
          <TableLabelContext value={t.dataTable(title)}>{table}</TableLabelContext>
        </div>
      ) : null}
      {menu && <ChartAnnouncer text={announcement} />}
    </BaseTabs.Root>
  );

  return (
    <SeriesContext value={seriesContext}>
      <LabelsContext value={shared}>
        <ChartTwinContext value={table ? (twinReady && view === "chart" ? twinId : tableId) : null}>
          {body}
        </ChartTwinContext>
      </LabelsContext>
    </SeriesContext>
  );
}

/** Props of {@link ChartTable}. Every chart has a table view: the accessible, colour-free way to read every value. */
export type ChartTableProps = ComponentProps<typeof ChartTable>;

/** Props of {@link ChartAnnouncer}. Screen-reader announcement of the active data point (charts are keyboard-navigable). */
export type ChartAnnouncerProps = ComponentProps<typeof ChartAnnouncer>;

/** Props of {@link ChartEmpty}. Shown instead of a chart when there is nothing to plot. */
export type ChartEmptyProps = ComponentProps<typeof ChartEmpty>;

/** Props of {@link LegendKey}. The colour key for a series, drawn as SVG (not a CSS background) so it survives forced-colors / Windows High Contrast, where it also gains a CanvasText outline. */
export type LegendKeyProps = ComponentProps<typeof LegendKey>;
