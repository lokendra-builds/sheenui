import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  AreaChart,
  BarChart,
  Button,
  ChartCard,
  ChartTable,
  DonutChart,
  LineChart,
  NumberTicker,
  Sparkline,
  Switch,
  seriesLegend,
  type ChartSeries,
  type LegendItem,
} from "@sheenui/theme";
import { ChartSyncProvider } from "@sheenui/theme";
import { Deferred } from "../../layout/Deferred";
import type { ChartBrushRange } from "@sheenui/theme";
import { percentChange, useLiveData, type CompareSeries } from "@sheenui/theme";
import {
  DAILY,
  conversionAnnotations,
  conversionSeries,
  dailySeries,
  hash,
  heroAnnotations,
  orderSeries,
  percent1,
  percentFormat,
  plainFormat,
  previousLegend,
  usd,
  usd0,
  wholeUsdFormat,
} from "./shared-data";

/* ====================================================================================
 * Featured dashboard: synced crosshairs, a brush that zooms everything, legend toggling,
 * previous-period comparison, annotations, export and a live chart.
 * ==================================================================================== */

function sum<T>(rows: readonly T[], pick: (row: T) => number) {
  return rows.reduce((s, r) => s + pick(r), 0);
}

function Delta({ current, previous, invert = false }: { current: number; previous: number; invert?: boolean }) {
  const change = percentChange(current, previous);
  if (!change) return null;
  const good = change.direction === "flat" ? null : (change.direction === "up") !== invert;
  return (
    <span
      className={
        good === null
          ? "text-xs font-medium text-sheen-fg-muted"
          : good
            ? "text-xs font-medium text-sheen-success-text"
            : "text-xs font-medium text-sheen-danger-text"
      }
    >
      <span aria-hidden>{change.direction === "up" ? "▲" : change.direction === "down" ? "▼" : "■"}</span>{" "}
      {/* The sign stays in front of the number in right-to-left pages (bidi isolation). */}
      <bdi dir="ltr">{change.text}</bdi>
      <span className="sr-only"> versus the previous period</span>
    </span>
  );
}

/**
 * Hands back `value` a few frames later per `order`, so the four KPI tiles re-count one after
 * another: one rolling number (which measures its glyphs in its commit) per task, instead of
 * four forced layouts inside the same task as the charts' redraw.
 */
function useStaggered<T>(value: T, order: number): T {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => startTransition(() => setShown(value)), 40 + order * 60);
    return () => window.clearTimeout(id);
  }, [value, order]);
  return shown;
}

function Kpi({
  label,
  value: nextValue,
  previous: nextPrevious,
  format,
  trend: nextTrend,
  compare,
  order,
}: {
  label: string;
  value: number;
  previous: number;
  format: Intl.NumberFormatOptions;
  trend: number[];
  compare: boolean;
  /** Position in the row (staggers the re-count). */
  order: number;
}) {
  const { value, previous, trend } = useStaggered(
    useMemo(
      () => ({ value: nextValue, previous: nextPrevious, trend: nextTrend }),
      [nextValue, nextPrevious, nextTrend],
    ),
    order,
  );
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-sheen-lg border border-sheen-border bg-sheen-surface/45 p-4 shadow-[inset_0_1px_0_0_var(--sheen-glass-highlight)]">
      <p className="text-xs font-medium text-sheen-fg-muted">{label}</p>
      <p className="flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold tracking-tight">
        <NumberTicker value={value} format={format} locales="en-US" live="off" />
        {compare && <Delta current={value} previous={previous} />}
      </p>
      <Sparkline values={trend} height={32} aria-label={`${label} trend`} />
    </div>
  );
}

const liveTime = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const LIVE_START = Date.UTC(2026, 10, 1, 12, 0, 0);

export const liveLabel = (tick: number) => liveTime.format(new Date(LIVE_START + tick * 2000));

export const LIVE_INITIAL = Array.from({ length: 24 }, (_, i) => ({
  t: liveLabel(i - 24),
  v: Math.round(820 + Math.sin(i / 3) * 90 + hash(i, 4) * 60),
}));

export const liveSeries: ChartSeries[] = [{ key: "v", label: "Visitors", color: 1 }];

function LiveVisitors() {
  const ref = useRef<HTMLDivElement>(null);
  const { data, paused, setPaused } = useLiveData(LIVE_INITIAL, {
    next: (rows, tick) => {
      const last = rows[rows.length - 1]?.v ?? 820;
      const v = Math.round(
        Math.max(520, Math.min(1180, last + (hash(tick, 11) - 0.5) * 120 + Math.sin(tick / 5) * 18)),
      );
      return { t: liveLabel(tick), v };
    },
    interval: 2000,
    max: 24,
    ref,
  });
  const latest = data[data.length - 1]?.v ?? 0;
  return (
    <ChartCard
      surface="plain"
      className="p-4 sm:p-5"
      title="Visitors right now"
      description="A new reading every 2 s; pauses off-screen and in hidden tabs."
      aside={
        <Button variant="ghost" size="sm" onClick={() => setPaused(!paused)} aria-pressed={paused}>
          {paused ? "Resume" : "Pause"}
        </Button>
      }
    >
      <div ref={ref} className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-sm text-sheen-fg-muted">
          <span
            aria-hidden
            className={
              paused
                ? "size-2 rounded-full bg-sheen-fg-subtle"
                : "size-2 rounded-full bg-sheen-success motion-ok:animate-pulse"
            }
          />
          <span className="text-xl font-semibold text-sheen-fg tabular-nums">
            <NumberTicker value={latest} locales="en-US" live="off" />
          </span>
          on the site
        </p>
        <AreaChart
          live
          data={data}
          index="t"
          series={liveSeries}
          height={150}
          zero={false}
          endLabels={false}
          aria-label="Visitors on the site, last 48 seconds"
        />
      </div>
    </ChartCard>
  );
}

const FIRST_RANGE: ChartBrushRange = [DAILY.length - 42, DAILY.length - 1];

/**
 * The brushed revenue chart owns the live brush range, so dragging re-renders only this card.
 * The rest of the dashboard (numbers, bars, the donut) moves to the new range when the drag
 * ends, in one smooth tween: dragging stays at 60 fps even on a slow phone. Keyboard changes
 * apply straight away.
 */
function RevenueCard({
  series,
  legend,
  rows,
  onCommit,
}: {
  series: CompareSeries[];
  legend: LegendItem[];
  /** The committed rows (table + CSV). */
  rows: typeof DAILY;
  onCommit: (range: ChartBrushRange) => void;
}) {
  const [range, setRange] = useState<ChartBrushRange>(FIRST_RANGE);
  const scrub = useRef({ on: false, range });
  const onRangeChange = (next: ChartBrushRange) => {
    scrub.current.range = next;
    setRange(next);
    if (!scrub.current.on) startTransition(() => onCommit(next));
  };
  const onScrubChange = (on: boolean) => {
    scrub.current.on = on;
    if (!on) startTransition(() => onCommit(scrub.current.range));
  };
  return (
    <ChartCard
      surface="plain"
      className="p-4 sm:p-5"
      title="Revenue by channel"
      description={`${DAILY[range[0]]?.day} – ${DAILY[range[1]]?.day}, daily, US dollars`}
      legend={legend}
      exportable
      csv={{ data: rows, index: "day", series, indexLabel: "Day" }}
      table={
        <ChartTable
          data={rows}
          index="day"
          indexLabel="Day"
          series={series}
          format={usd}
          caption="Daily revenue by channel"
        />
      }
    >
      <AreaChart
        data={DAILY}
        index="day"
        series={series}
        format={usd}
        height={280}
        annotations={heroAnnotations}
        brush={{ range, onRangeChange, onScrubChange, minSpan: 7 }}
        aria-label="Daily revenue by channel"
      />
    </ChartCard>
  );
}

export function FeaturedDashboard() {
  const [compare, setCompare] = useState(true);
  const [committed, setCommitted] = useState<ChartBrushRange>(FIRST_RANGE);
  const [start, end] = useDeferredValue(committed);
  const rows = useMemo(() => DAILY.slice(start, end + 1), [start, end]);
  const days = end - start + 1;

  const revenueNow = sum(rows, (d) => d.organic + d.paid);
  const revenuePrev = sum(rows, (d) => d.organicPrev + d.paidPrev);
  const ordersNow = sum(rows, (d) => d.orders);
  const ordersPrev = sum(rows, (d) => d.ordersPrev);
  const conversion = sum(rows, (d) => d.conversion) / Math.max(1, days);
  const aov = revenueNow / Math.max(1, ordersNow);
  const aovPrev = revenuePrev / Math.max(1, ordersPrev);

  // Stable identities per setting, so a commit doesn't redraw what didn't change.
  const series = useMemo(() => (compare ? dailySeries : dailySeries.map(({ compareKey: _, ...s }) => s)), [compare]);
  const orders = useMemo(() => (compare ? orderSeries : orderSeries.map(({ compareKey: _, ...s }) => s)), [compare]);
  const legend = useMemo<LegendItem[]>(
    () => [...seriesLegend(series, "line"), ...(compare ? [previousLegend] : [])],
    [series, compare],
  );
  const mix = [
    { label: "Organic", value: sum(rows, (d) => d.organic), color: 1 as const },
    { label: "Paid", value: sum(rows, (d) => d.paid), color: 7 as const },
  ];
  return (
    <section
      data-llms="skip"
      aria-labelledby="featured-title"
      className="glass-2 relative flex min-w-0 flex-col gap-5 rounded-sheen-xl p-3 sm:p-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-semibold tracking-[0.14em] text-sheen-accent uppercase">Featured</p>
          <h2 id="featured-title" className="text-2xl font-semibold tracking-tight text-balance">
            One store, four charts, moving together
          </h2>
          <p className="max-w-2xl text-sm text-pretty text-sheen-fg-muted">
            Hover or arrow-key through any chart and the others follow. Drag the brush to zoom all of them, click a
            legend key to hide a series, and every number re-counts for the days you picked.
          </p>
        </div>
        <Switch checked={compare} onCheckedChange={setCompare} label="Compare to previous period" />
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label={`Revenue, ${days} days`}
          value={revenueNow}
          previous={revenuePrev}
          format={usd0}
          compare={compare}
          trend={rows.map((d) => d.organic + d.paid)}
          order={0}
        />
        <Kpi
          label="Orders"
          value={ordersNow}
          previous={ordersPrev}
          format={plainFormat}
          compare={compare}
          trend={rows.map((d) => d.orders)}
          order={1}
        />
        <Kpi
          label="Average order"
          value={aov}
          previous={aovPrev}
          format={wholeUsdFormat}
          compare={compare}
          trend={rows.map((d) => (d.organic + d.paid) / Math.max(1, d.orders))}
          order={2}
        />
        <Kpi
          label="Conversion"
          value={conversion / 100}
          previous={conversion / 100}
          format={percentFormat}
          compare={false}
          trend={rows.map((d) => d.conversion)}
          order={3}
        />
      </div>

      <ChartSyncProvider>
        {/* Each card is a hydration boundary of its own (see Deferred): four charts in one task were 120 ms on a phone. */}
        <Deferred>
          <RevenueCard series={series} legend={legend} rows={rows} onCommit={setCommitted} />
        </Deferred>

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          <Deferred>
            <ChartCard
              surface="plain"
              className="p-4 sm:p-5"
              title="Orders"
              legend={compare ? [...seriesLegend(orders, "rect"), { ...previousLegend, kind: "line" }] : undefined}
              table={<ChartTable data={rows} index="day" indexLabel="Day" series={orders} caption="Orders per day" />}
            >
              <BarChart data={rows} index="day" series={orders} height={200} aria-label="Orders per day" />
            </ChartCard>
          </Deferred>
          <Deferred>
            <ChartCard
              surface="plain"
              className="p-4 sm:p-5"
              title="Conversion rate"
              table={
                <ChartTable
                  data={rows}
                  index="day"
                  indexLabel="Day"
                  series={conversionSeries}
                  format={percent1}
                  caption="Conversion rate per day"
                />
              }
            >
              <LineChart
                data={rows}
                index="day"
                series={conversionSeries}
                format={percent1}
                height={200}
                zero={false}
                annotations={conversionAnnotations}
                aria-label="Conversion rate per day"
              />
            </ChartCard>
          </Deferred>
          <Deferred>
            <ChartCard surface="plain" className="p-4 sm:p-5" title="Channel mix" description="Share of revenue">
              <DonutChart
                data={mix}
                diameter={168}
                labels={{ center: "Revenue" }}
                format={usd}
                aria-label="Revenue by channel, share"
              />
            </ChartCard>
          </Deferred>
        </div>
      </ChartSyncProvider>

      <Deferred>
        <LiveVisitors />
      </Deferred>
    </section>
  );
}
