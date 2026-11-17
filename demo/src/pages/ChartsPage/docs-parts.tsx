import { useRef, type ReactNode } from "react";
import { Button, ChartCard, LineChart, type ChartSeries } from "@sheenui/theme";
import type { ChartAnnotation } from "@sheenui/theme";
import { useLiveData, type CompareSeries } from "@sheenui/theme";
import { DAILY, hash, months, revenue } from "./shared-data";
import { LIVE_INITIAL, liveLabel, liveSeries } from "./featured";

/* ====================================================================================
 * Docs for the charts on this page (line, area, bar, donut, radial, sparkline) and the
 * chart-wide features (sync, brush, annotations, comparison, export, live data, i18n).
 * ==================================================================================== */

export const visitsDaily = Array.from({ length: 120 }, (_, i) => ({
  day: DAILY[i]?.day ?? "",
  visits: Math.round(1800 + i * 9 + Math.sin(i / 5) * 260 + hash(i, 21) * 220),
}));

export const visitSeries: ChartSeries[] = [{ key: "visits", label: "Visits", color: 7 }];

export const signupAnnotations: ChartAnnotation[] = [
  { type: "band", from: 60000, to: 75000, label: "Forecast range" },
  { type: "line", value: 80000, label: "Goal $80K", tone: "accent" },
  { type: "range", from: "Jan", to: "Feb", label: "Holiday freeze" },
  { type: "event", at: "Jun", label: "Pricing change", tone: "warning" },
];

export const germanCard = {
  chart: "Diagramm",
  table: "Tabelle",
  viewAs: (title: string) => `${title}: Ansicht`,
  noData: "Keine Daten",
  previous: (label: string) => `${label} (Vorperiode)`,
  options: (title: string) => `${title}: herunterladen`,
  downloadPng: "Als PNG herunterladen",
  downloadSvg: "Als SVG herunterladen",
  downloadCsv: "Als CSV herunterladen",
  pngHint: "Bild, doppelte Auflösung",
  svgHint: "Vektor, für Folien",
  csvHint: "Die Daten, für Tabellen",
  downloaded: (file: string) => `${file} heruntergeladen`,
  exportFailed: "Download fehlgeschlagen",
  legend: "Reihen: zum Ein- und Ausblenden drücken",
  shown: (label: string) => `${label} eingeblendet`,
  hidden: (label: string) => `${label} ausgeblendet`,
};

export const germanRevenue = months.map((month, i) => ({
  month,
  umsatz: (revenue[i]?.organic ?? 0) * 0.92,
  vorjahr: (revenue[i]?.organicPrev ?? 0) * 0.92,
}));

export const germanSeries: CompareSeries[] = [{ key: "umsatz", label: "Umsatz", color: 1, compareKey: "vorjahr" }];

export const eur = new Intl.NumberFormat("de", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function LiveExample() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useLiveData(LIVE_INITIAL.slice(-16), {
    next: (rows, tick) => ({
      t: liveLabel(tick + 100),
      v: Math.round(Math.max(500, (rows[rows.length - 1]?.v ?? 800) + (hash(tick, 31) - 0.5) * 140)),
    }),
    interval: 1500,
    max: 16,
    ref,
  });
  return (
    <ChartCard
      className="w-full"
      title="Requests per second"
      aside={
        <Button variant="ghost" size="sm" aria-pressed={live.paused} onClick={() => live.setPaused(!live.paused)}>
          {live.paused ? "Resume" : "Pause"}
        </Button>
      }
    >
      <div ref={ref}>
        <LineChart
          live
          data={live.data}
          index="t"
          series={liveSeries}
          height={200}
          zero={false}
          endLabels={false}
          aria-label="Requests per second, live"
        />
      </div>
    </ChartCard>
  );
}

export function SectionTitle({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 id={id} className="text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {children && <p className="max-w-3xl text-sm text-pretty text-sheen-fg-muted">{children}</p>}
    </div>
  );
}

/** A docs anchor the gallery's core tiles scroll to (focusable, so keyboard users land there too). */
export function Anchor({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div
      id={id}
      tabIndex={-1}
      className="flex scroll-mt-28 flex-col gap-6 rounded-sheen-lg outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheen-focus"
    >
      {children}
    </div>
  );
}
