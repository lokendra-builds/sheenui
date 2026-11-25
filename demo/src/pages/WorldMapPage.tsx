import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { WorldMap, WorldMapTable } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { CHARTS } from "./ChartsMapGanttPages/shared";
import {
  ChoroplethExample,
  formatGrowth,
  germanMapLabels,
  growth,
  internet,
  offices,
  formatUsd,
  stageRevenue,
} from "./ChartsMapGanttPages/world-map";

/** The "World map" docs page (/charts/world-map): live examples, props and notes. */
export function WorldMapPage() {
  return (
    <Page
      eyebrow="Chart"
      title="World map"
      description="Where your numbers are, at a glance: a choropleth on a sequential or diverging scale, or a bubble map at any longitude and latitude. Equal Earth keeps every country's area true to scale, names come from Intl in your locale, and the outlines (Natural Earth, public domain) load on demand in their own 19 KB chunk."
      source={[`${CHARTS}geo-map.tsx`, `${CHARTS}geo/world-110m.ts`]}
    >
      <ChartStage label="World map demo" title="Revenue by country" hue={1} height="22rem">
        <WorldMap
          data={stageRevenue}
          scaleType="log"
          valueLabel="Revenue"
          format={formatUsd}
          aria-label="Revenue by country, last 12 months"
        />
      </ChartStage>
      <ChoroplethExample />

      <Example
        title="Diverging scale"
        description='Growth sits around a meaningful middle, so scale="diverging" uses two hues that meet at a neutral midpoint (0% here): orange for shrinking markets, blue for growing ones. The scale is symmetric, so equal changes get equally strong colors.'
        variant="bare"
        code={`
import { WorldMap, type WorldMapDatum } from "@sheenui/theme";

const signedPercent = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });
const formatGrowth = (n: number) => signedPercent.format(n).replace("-", "\\u2212"); // a true minus sign

// Year-over-year change in active users, as a ratio
const growth: WorldMapDatum[] = [
  { id: "US", value: 0.08 },
  { id: "BR", value: 0.34 },
  { id: "AR", value: -0.12 },
  { id: "DE", value: -0.07 },
  { id: "NG", value: 0.61 },
  { id: "IN", value: 0.58 },
  { id: "VN", value: 0.52 },
  { id: "RU", value: -0.31 },
];

export function Example() {
  return (
    <WorldMap
      data={growth}
      scale="diverging"
      midpoint={0}
      divergingColors={[2, 7]}
      valueLabel="Change"
      format={formatGrowth}
      aria-label="Year-over-year change in active users by country"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Year-over-year change in active users"
          description="2026 against 2025, by country"
          table={
            <WorldMapTable
              data={growth}
              valueLabel="Change"
              format={formatGrowth}
              caption="Year-over-year change by country"
            />
          }
        >
          <WorldMap
            data={growth}
            scale="diverging"
            valueLabel="Change"
            format={formatGrowth}
            aria-label="Year-over-year change in active users by country"
          />
        </ChartCard>
      </Example>

      <div className="grid grid-cols-1 gap-6 *:min-w-0 xl:grid-cols-2">
        <Example
          title="Bubble map"
          description="Bubbles at coordinates: their area follows the value, they keep their size on screen when you zoom, and a surface ring keeps neighbors apart. The size key reads in the same units."
          variant="bare"
          code={`
import { WorldMap } from "@sheenui/theme";

const offices = [
  { label: "New York", lon: -74.0, lat: 40.71, value: 241_000 },
  { label: "San Francisco", lon: -122.42, lat: 37.77, value: 182_000 },
  { label: "London", lon: -0.13, lat: 51.51, value: 168_000 },
  // …
];

<WorldMap
  mode="bubble"
  points={offices}
  color={7}
  valueLabel="Active users"
  aria-label="Active users by city"
/>`}
        >
          <ChartCard
            title="Active users by city"
            description="Top 25 metro areas"
            table={
              <WorldMapTable
                mode="bubble"
                points={offices}
                valueLabel="Active users"
                share
                caption="Active users by city"
              />
            }
          >
            <WorldMap
              mode="bubble"
              points={offices}
              color={7}
              valueLabel="Active users"
              aria-label="Active users by city"
            />
          </ChartCard>
        </Example>

        <Example
          title="Classed scale, any locale"
          description='steps={5} snaps colors to five classes, easier to match against the key. locale="de-DE" formats the numbers and names every country in German (Intl.DisplayNames).'
          variant="bare"
          code={`
import { WorldMap, type WorldMapDatum } from "@sheenui/theme";

// Internet users per 100 people
const internetUsers: WorldMapDatum[] = [
  { id: "DE", value: 92 },
  { id: "FR", value: 86 },
  { id: "NO", value: 99 },
  { id: "BR", value: 81 },
  { id: "IN", value: 46 },
  { id: "NG", value: 55 },
  { id: "ET", value: 19 },
];

export function Example() {
  return (
    <WorldMap
      data={internetUsers}
      steps={5}
      color={3}
      domain={[0, 100]}
      locale="de-DE"
      valueLabel="Je 100"
      labels={{
        instructions: "Pfeiltasten wechseln zum Nachbarland, Bild auf und Bild ab nach Wert …",
        noData: "Keine Daten",
        zoomIn: "Vergrößern",
        zoomControls: (name) => \`\${name}: Zoom\`,
        // … every string is in WorldMapLabels
      }}
      aria-label="Internetnutzer je 100 Einwohner"
    />
  );
}`}
        >
          <div lang="de" className="contents">
            <ChartCard
              title="Internetnutzer je 100 Einwohner"
              description="Gerundet, illustrativ"
              table={
                <WorldMapTable
                  data={internet}
                  locale="de-DE"
                  valueLabel="Je 100"
                  labels={{ country: "Land", rankHeader: "Rang" }}
                  caption="Internetnutzer nach Land"
                />
              }
            >
              <WorldMap
                data={internet}
                steps={5}
                color={3}
                domain={[0, 100]}
                locale="de-DE"
                valueLabel="Je 100"
                labels={germanMapLabels}
                aria-label="Internetnutzer je 100 Einwohner"
              />
            </ChartCard>
          </div>
        </Example>
      </div>

      <PropsTable of={PROPS.WorldMap} />
      <PropsTable as="h2" title="WorldMapTable props" of={PROPS.WorldMapTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the map (one stop), then the zoom buttons."],
          [
            "← / → / ↑ / ↓",
            "Move to the neighboring country (or bubble) in that direction; it pans into view when zoomed.",
          ],
          ["Page Down / Page Up", "Next / previous place by value (rank order)."],
          ["Home / End", "Highest / lowest value."],
          ["Letters", "Type a name to jump to it (type-ahead)."],
          ["+ / −", "Zoom in / out around the active place."],
          ["0", "Reset the zoom."],
          ["Enter / Space", "Call onSelect for the active place."],
          ["Escape", "Clear the active place; again to reset the zoom."],
        ]}
      />
      <A11yNotes>
        <li>
          The map is one focusable figure with a role description of “map”; its accessible name ends with the keyboard
          instructions.
        </li>
        <li>
          Keyboard moves are announced once through a polite live region (“India: 912K, Rank 2 of 45”); pointer hovers
          stay silent.
        </li>
        <li>Missing values are hatched, never painted as the lowest color; the key includes a “No data” swatch.</li>
        <li>
          The Table view lists every value ranked, with an optional share column: the color-free way to read the map.
        </li>
        <li>
          Zoom buttons are real buttons (44px on touch), disabled at the limits; a plain scroll never hijacks the page.
        </li>
        <li>Forced colors: borders become CanvasText and the active country gets a Highlight outline.</li>
      </A11yNotes>
    </Page>
  );
}
