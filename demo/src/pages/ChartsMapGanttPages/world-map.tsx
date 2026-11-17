import { useState } from "react";
import { NumberTicker, useToast } from "@sheenui/theme";
import { ChartCard } from "../../layout/ExampleChartCard";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { WorldMap, WorldMapTable, type WorldMapDatum, type WorldMapPoint } from "@sheenui/theme";

/* ====================================================================== */
/* World map                                                              */
/* ====================================================================== */

/** [ISO code, annual revenue (USD), monthly active users]. */
const countryStats: [string, number, number][] = [
  ["US", 4_820_000, 1_240_000],
  ["CA", 612_000, 188_000],
  ["MX", 248_000, 142_000],
  ["BR", 386_000, 296_000],
  ["AR", 92_000, 71_000],
  ["CL", 74_000, 39_000],
  ["CO", 66_000, 58_000],
  ["PE", 31_000, 27_000],
  ["GB", 1_240_000, 352_000],
  ["IE", 188_000, 41_000],
  ["FR", 702_000, 214_000],
  ["DE", 948_000, 268_000],
  ["NL", 356_000, 92_000],
  ["BE", 142_000, 38_000],
  ["ES", 318_000, 131_000],
  ["PT", 96_000, 44_000],
  ["IT", 402_000, 156_000],
  ["CH", 264_000, 48_000],
  ["AT", 118_000, 31_000],
  ["SE", 236_000, 64_000],
  ["NO", 158_000, 33_000],
  ["DK", 131_000, 29_000],
  ["FI", 87_000, 22_000],
  ["PL", 172_000, 97_000],
  ["CZ", 64_000, 30_000],
  ["IN", 538_000, 912_000],
  ["CN", 296_000, 204_000],
  ["JP", 684_000, 233_000],
  ["KR", 322_000, 118_000],
  ["ID", 118_000, 176_000],
  ["PH", 72_000, 109_000],
  ["VN", 58_000, 94_000],
  ["TH", 81_000, 73_000],
  ["MY", 69_000, 51_000],
  ["AU", 476_000, 121_000],
  ["NZ", 84_000, 22_000],
  ["ZA", 108_000, 79_000],
  ["NG", 46_000, 88_000],
  ["KE", 28_000, 41_000],
  ["EG", 39_000, 62_000],
  ["MA", 22_000, 26_000],
  ["AE", 162_000, 37_000],
  ["SA", 121_000, 46_000],
  ["IL", 143_000, 34_000],
  ["TR", 97_000, 83_000],
];

export const revenue: WorldMapDatum[] = countryStats.map(([id, value]) => ({ id, value }));

/** The hero map's data: the 45 markets above plus smaller ones, so every continent reads as a map of values, not of gaps. */
const smallerMarkets: [string, number][] = [
  ["RU", 118_000],
  ["KZ", 21_000],
  ["UA", 61_000],
  ["BY", 14_000],
  ["RO", 52_000],
  ["HU", 44_000],
  ["GR", 49_000],
  ["BG", 23_000],
  ["RS", 17_000],
  ["HR", 26_000],
  ["SK", 29_000],
  ["IS", 12_000],
  ["LT", 16_000],
  ["LV", 11_000],
  ["EE", 18_000],
  ["IR", 24_000],
  ["IQ", 13_000],
  ["PK", 57_000],
  ["BD", 34_000],
  ["LK", 15_000],
  ["NP", 9_000],
  ["UZ", 8_000],
  ["SG", 204_000],
  ["VE", 19_000],
  ["EC", 27_000],
  ["BO", 10_000],
  ["PY", 12_000],
  ["UY", 33_000],
  ["CU", 6_000],
  ["PA", 21_000],
  ["CR", 24_000],
  ["GT", 13_000],
  ["DZ", 19_000],
  ["TN", 17_000],
  ["LY", 7_000],
  ["SD", 6_000],
  ["ET", 14_000],
  ["GH", 25_000],
  ["CI", 18_000],
  ["SN", 11_000],
  ["TZ", 16_000],
  ["UG", 12_000],
  ["AO", 9_000],
  ["MZ", 8_000],
  ["ZM", 7_000],
  ["ZW", 6_000],
  ["CD", 10_000],
  ["CM", 13_000],
  ["MG", 5_000],
  ["NA", 8_000],
  ["BW", 9_000],
  ["JO", 20_000],
  ["LB", 12_000],
  ["QA", 56_000],
  ["KW", 37_000],
  ["OM", 15_000],
  ["AF", 4_000],
  ["MN", 7_000],
  ["MM", 11_000],
  ["KH", 10_000],
  ["LA", 5_000],
];
export const stageRevenue: WorldMapDatum[] = [...revenue, ...smallerMarkets.map(([id, value]) => ({ id, value }))];

const users: WorldMapDatum[] = countryStats.map(([id, , value]) => ({ id, value }));

const totalRevenue = countryStats.reduce((s, [, v]) => s + v, 0);

const totalUsers = countryStats.reduce((s, [, , v]) => s + v, 0);

/** Year-over-year change in active users, as a ratio. */
export const growth: WorldMapDatum[] = [
  ["US", 0.08],
  ["CA", 0.11],
  ["MX", 0.27],
  ["BR", 0.34],
  ["AR", -0.12],
  ["CL", 0.05],
  ["CO", 0.22],
  ["PE", 0.18],
  ["GB", -0.04],
  ["IE", 0.09],
  ["FR", 0.02],
  ["DE", -0.07],
  ["NL", 0.06],
  ["ES", 0.14],
  ["PT", 0.21],
  ["IT", -0.02],
  ["SE", 0.03],
  ["NO", -0.09],
  ["PL", 0.31],
  ["UA", -0.24],
  ["RU", -0.31],
  ["TR", 0.12],
  ["IN", 0.58],
  ["CN", -0.15],
  ["JP", 0.01],
  ["KR", 0.07],
  ["ID", 0.44],
  ["PH", 0.39],
  ["VN", 0.52],
  ["TH", 0.17],
  ["AU", 0.04],
  ["NZ", -0.03],
  ["ZA", 0.16],
  ["NG", 0.61],
  ["KE", 0.47],
  ["EG", 0.23],
  ["SA", 0.19],
  ["AE", 0.26],
].map(([id, value]) => ({ id: id as string, value: value as number }));

export const offices: WorldMapPoint[] = [
  { label: "San Francisco", lon: -122.42, lat: 37.77, value: 182_000 },
  { label: "New York", lon: -74.0, lat: 40.71, value: 241_000 },
  { label: "Toronto", lon: -79.38, lat: 43.65, value: 64_000 },
  { label: "Mexico City", lon: -99.13, lat: 19.43, value: 52_000 },
  { label: "São Paulo", lon: -46.63, lat: -23.55, value: 97_000 },
  { label: "Buenos Aires", lon: -58.38, lat: -34.6, value: 31_000 },
  { label: "London", lon: -0.13, lat: 51.51, value: 168_000 },
  { label: "Paris", lon: 2.35, lat: 48.86, value: 92_000 },
  { label: "Berlin", lon: 13.4, lat: 52.52, value: 104_000 },
  { label: "Stockholm", lon: 18.07, lat: 59.33, value: 38_000 },
  { label: "Madrid", lon: -3.7, lat: 40.42, value: 47_000 },
  { label: "Lagos", lon: 3.38, lat: 6.52, value: 29_000 },
  { label: "Nairobi", lon: 36.82, lat: -1.29, value: 17_000 },
  { label: "Cairo", lon: 31.24, lat: 30.04, value: 21_000 },
  { label: "Dubai", lon: 55.27, lat: 25.2, value: 44_000 },
  { label: "Bengaluru", lon: 77.59, lat: 12.97, value: 156_000 },
  { label: "Mumbai", lon: 72.88, lat: 19.08, value: 88_000 },
  { label: "Singapore", lon: 103.82, lat: 1.35, value: 73_000 },
  { label: "Jakarta", lon: 106.85, lat: -6.21, value: 41_000 },
  { label: "Tokyo", lon: 139.69, lat: 35.69, value: 131_000 },
  { label: "Seoul", lon: 126.98, lat: 37.57, value: 69_000 },
  { label: "Shanghai", lon: 121.47, lat: 31.23, value: 58_000 },
  { label: "Sydney", lon: 151.21, lat: -33.87, value: 76_000 },
  { label: "Auckland", lon: 174.76, lat: -36.85, value: 14_000 },
  { label: "Johannesburg", lon: 28.05, lat: -26.2, value: 23_000 },
];

const usd = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatUsd = (n: number) => usd.format(n);

const signedPercent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

export const formatGrowth = (n: number) => signedPercent.format(n).replace("-", "−");

/** Internet users per 100 people (rounded, illustrative), for the classed example. */
export const internet: WorldMapDatum[] = [
  ["DE", 92],
  ["FR", 86],
  ["ES", 94],
  ["IT", 85],
  ["PL", 87],
  ["SE", 96],
  ["NO", 99],
  ["FI", 93],
  ["GB", 96],
  ["IE", 95],
  ["PT", 84],
  ["GR", 83],
  ["RO", 86],
  ["HU", 89],
  ["CZ", 85],
  ["AT", 93],
  ["CH", 96],
  ["NL", 97],
  ["BE", 94],
  ["DK", 98],
  ["UA", 79],
  ["TR", 83],
  ["EG", 72],
  ["MA", 88],
  ["DZ", 71],
  ["NG", 55],
  ["KE", 40],
  ["ET", 19],
  ["ZA", 72],
  ["CD", 27],
  ["US", 92],
  ["CA", 94],
  ["MX", 76],
  ["BR", 81],
  ["AR", 88],
  ["IN", 46],
  ["CN", 77],
  ["JP", 84],
  ["ID", 66],
  ["AU", 96],
  ["RU", 90],
  ["KZ", 91],
  ["IR", 79],
  ["PK", 33],
  ["BD", 39],
  ["SA", 100],
  ["VN", 79],
  ["TH", 88],
  ["PH", 73],
  ["CO", 73],
].map(([id, value]) => ({ id: id as string, value: value as number }));

/** Every string of the German map (WorldMapLabels), so nothing falls back to English. */
export const germanMapLabels = {
  instructions:
    "Pfeiltasten wechseln zum Nachbarland, Bild auf und Bild ab gehen nach Wert, Pos1 und Ende springen zum höchsten und niedrigsten Wert. Tippen Sie einen Namen, um dorthin zu springen. Plus und Minus zoomen, 0 setzt zurück.",
  roleDescription: "Karte",
  noData: "Keine Daten",
  noDataKey: "Keine Daten",
  hint: "Tippen Sie auf ein Land",
  zoomIn: "Vergrößern",
  zoomOut: "Verkleinern",
  resetZoom: "Zurücksetzen",
  zoomControls: (name: string) => `${name}: Zoom`,
  zoomHint: (mac: boolean) => (mac ? "⌘ + Scrollen zoomt die Karte" : "Strg + Scrollen zoomt die Karte"),
  logScale: (caption: string) => `${caption} (log.)`,
  rank: (rank: number, total: number) => `Rang ${rank} von ${total}`,
  loadError: "Die Karte konnte nicht geladen werden.",
};

/** Holds its own measure state, so switching re-renders this example only, not the whole page. */
export function ChoroplethExample() {
  const [measure, setMeasure] = useState<"revenue" | "users">("revenue");
  const data = measure === "revenue" ? revenue : users;
  const format = measure === "revenue" ? formatUsd : undefined;
  const label = measure === "revenue" ? "Revenue" : "Active users";
  const toast = useToast();
  return (
    <Example
      title="Choropleth map in React"
      description='Revenue by country on a single-hue scale, light to dark. One market dwarfs the rest, so scaleType="log" spreads the others across the ramp. Switch the measure: the map cross-fades to the new colors and the headline rolls to the new total. Hover a country, or focus the map and use the arrow keys; ⌘/Ctrl + scroll, pinch or the buttons zoom.'
      variant="bare"
      controls={
        <Segmented
          label="Measure"
          size="sm"
          options={[
            { value: "revenue", label: "Revenue" },
            { value: "users", label: "Active users" },
          ]}
          value={measure}
          onValueChange={setMeasure}
        />
      }
      code={`
import { useToast, ChartCard, NumberTicker, WorldMapTable, WorldMap } from "@sheenui/theme";

const revenue = [
  { id: "US", value: 4_820_000 },
  { id: "GB", value: 1_240_000 },
  { id: "DE", value: 948_000 },
  { id: "IN", value: 538_000 },
  // … any ISO 3166-1 code: "IN", "IND" or "356"
];
const total = revenue.reduce((sum, d) => sum + (d.value ?? 0), 0);
const usd = new Intl.NumberFormat("en", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const toast = useToast(); // inside your component

<ChartCard
  title="Revenue by country"
  description="Last 12 months"
  aside={<NumberTicker value={total} format={{ style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }} />}
  table={<WorldMapTable data={revenue} valueLabel="Revenue" format={usd.format} share />}
>
  <WorldMap
    data={revenue}
    scaleType="log" // one market dwarfs the rest: spread them on a log scale
    valueLabel="Revenue"
    format={usd.format}
    onSelect={(country) => toast.info(country.name, country.value === null ? "No data" : usd.format(country.value))}
    aria-label="Revenue by country, last 12 months"
  />
</ChartCard>`}
    >
      <ChartCard
        className="w-full"
        title={`${label} by country`}
        description="Last 12 months, 45 markets"
        aside={
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            <NumberTicker
              value={measure === "revenue" ? totalRevenue : totalUsers}
              format={
                measure === "revenue"
                  ? { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }
                  : { notation: "compact", maximumFractionDigits: 1 }
              }
              locales="en"
            />
          </span>
        }
        table={<WorldMapTable data={data} valueLabel={label} format={format} share caption={`${label} by country`} />}
      >
        <WorldMap
          data={data}
          scaleType="log"
          valueLabel={label}
          format={format}
          onSelect={(country) =>
            toast.info(
              country.name,
              country.value === null
                ? "No data"
                : `${label}: ${(format ?? ((n: number) => n.toLocaleString("en")))(country.value)}`,
            )
          }
          aria-label={`${label} by country, last 12 months`}
        />
      </ChartCard>
    </Example>
  );
}
