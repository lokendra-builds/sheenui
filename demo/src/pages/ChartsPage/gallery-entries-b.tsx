import {
  BOXES,
  BUBBLES,
  BULLET,
  CANDLES,
  CHORD_GROUPS,
  CHORD_MATRIX,
  FUNNEL,
  GANTT,
  GAUGE_BANDS,
  H,
  HEAT,
  HOURS,
  LATENCIES,
  MEKKO,
  MEKKO_SERIES,
  Middle,
  NETWORK_GROUPS,
  NETWORK_LINKS,
  NETWORK_NODES,
  PICTOGRAM,
  PIE,
  PLANS,
  PLATFORM_SERIES,
  RADIAL,
  RIDGES,
  SANKEY_LINKS,
  SANKEY_NODES,
  SCATTER,
  SCORE_BANDS,
  SPARKBAR,
  SUNBURST,
  SWARM,
  SWARM_SERIES,
  TRACKER,
  TREEMAP,
  WAFFLE,
  WATERFALL,
  WINLOSS,
  WORLD,
  formatShortDate,
  price0,
} from "./gallery-samples";
import type { GalleryEntry } from "./gallery-types";

/** The composition, distribution, flow, hierarchy, geo, finance and KPI previews of the gallery. */
export const GALLERY_B: GalleryEntry[] = [
  /* ---------- Composition ---------- */
  {
    slug: "pie",
    title: "Pie chart",
    path: "/charts/pie-chart",
    categories: ["Composition"],
    blurb: "A few slices of one whole",
    load: () =>
      import("../../../../theme/src/components/charts/pie-chart").then(
        (m) =>
          function PiePreview() {
            return (
              <m.PieChart data={PIE} height={H} legend={false} outerLabels={false} aria-label="Traffic by source" />
            );
          },
      ),
  },
  {
    slug: "percent-bars",
    title: "100% stacked bars",
    path: "/charts/percent-stacked-bar-chart",
    categories: ["Composition", "Comparison"],
    blurb: "Shares within each category, side by side",
    load: () =>
      import("../../../../theme/src/components/charts/percent-bar-chart").then(
        (m) =>
          function PercentBarPreview() {
            return (
              <m.PercentBarChart
                data={PLANS}
                index="p"
                series={PLATFORM_SERIES}
                height={H}
                aria-label="Platform share by plan"
              />
            );
          },
      ),
  },
  {
    slug: "waffle",
    title: "Waffle chart",
    path: "/charts/waffle",
    categories: ["Composition", "KPI"],
    blurb: "Shares as a 10 × 10 grid, one cell a percent",
    load: () =>
      import("../../../../theme/src/components/charts/waffle-chart").then(
        (m) =>
          function WafflePreview() {
            return (
              <Middle>
                <m.WaffleChart data={WAFFLE} maxCell={18} showLegend={false} aria-label="Sessions by device" />
              </Middle>
            );
          },
      ),
  },
  {
    slug: "pictogram",
    title: "Pictogram",
    path: "/charts/waffle",
    categories: ["Composition", "KPI"],
    blurb: "Shares as icons, e.g. 23 of 30 people",
    load: () =>
      import("../../../../theme/src/components/charts/waffle-chart").then(
        (m) =>
          function PictogramPreview() {
            return (
              <Middle>
                <m.WaffleChart
                  data={PICTOGRAM}
                  total={30}
                  rows={3}
                  columns={10}
                  variant="pictogram"
                  showLegend={false}
                  aria-label="23 of 30 people vaccinated"
                />
              </Middle>
            );
          },
      ),
  },
  {
    slug: "marimekko",
    title: "Marimekko chart",
    path: "/charts/marimekko",
    categories: ["Composition", "Comparison"],
    blurb: "Segment size and share in one mosaic",
    load: () =>
      import("../../../../theme/src/components/charts/marimekko-chart").then(
        (m) =>
          function MarimekkoPreview() {
            // Below 480px wide the chart adds a 38–56px readout band above `height`.
            return (
              <m.MarimekkoChart
                data={MEKKO}
                index="seg"
                series={MEKKO_SERIES}
                cellText="none"
                height={H}
                aria-label="Market share by segment"
              />
            );
          },
      ),
  },

  /* ---------- Distribution ---------- */
  {
    slug: "scatter",
    title: "Scatter chart",
    path: "/charts/scatter-plot",
    categories: ["Distribution", "Comparison"],
    blurb: "How two measures relate, point by point",
    load: () =>
      import("../../../../theme/src/components/charts/scatter-chart").then(
        (m) =>
          function ScatterPreview() {
            return <m.ScatterChart series={SCATTER} height={H} aria-label="Effort against output by team" />;
          },
      ),
  },
  {
    slug: "bubble",
    title: "Bubble chart",
    path: "/charts/scatter-plot",
    categories: ["Comparison", "Distribution"],
    blurb: "Three measures at once: x, y and size",
    load: () =>
      import("../../../../theme/src/components/charts/scatter-chart").then(
        (m) =>
          function BubblePreview() {
            return (
              <m.ScatterChart series={BUBBLES} bubble height={H} aria-label="Growth against margin, sized by revenue" />
            );
          },
      ),
  },
  {
    slug: "heatmap",
    title: "Heatmap",
    path: "/charts/heatmap",
    categories: ["Distribution"],
    blurb: "Values across two categorical axes",
    load: () =>
      import("../../../../theme/src/components/charts/heatmap").then(
        (m) =>
          function HeatmapPreview() {
            return (
              <m.Heatmap
                data={HEAT}
                index="day"
                columns={HOURS}
                cellHeight={26}
                legend={false}
                aria-label="Sessions by weekday and hour"
              />
            );
          },
      ),
  },
  {
    slug: "histogram",
    title: "Histogram",
    path: "/charts/histogram",
    categories: ["Distribution"],
    blurb: "How values spread across bins",
    load: () =>
      import("../../../../theme/src/components/charts/histogram").then(
        (m) =>
          function HistogramPreview() {
            return <m.Histogram values={LATENCIES} bins={12} height={H} aria-label="Request latency distribution" />;
          },
      ),
  },
  {
    slug: "box-plot",
    title: "Box plot",
    path: "/charts/box-plot",
    categories: ["Distribution", "Comparison"],
    blurb: "Median, quartiles and outliers per group",
    load: () =>
      import("../../../../theme/src/components/charts/box-plot").then(
        (m) =>
          function BoxPlotPreview() {
            return <m.BoxPlot data={BOXES} orientation="vertical" height={H} aria-label="Response time by quarter" />;
          },
      ),
  },
  {
    slug: "violin",
    title: "Violin plot",
    path: "/charts/box-plot",
    categories: ["Distribution"],
    blurb: "The full shape of each group's values",
    load: () =>
      import("../../../../theme/src/components/charts/box-plot").then(
        (m) =>
          function ViolinPreview() {
            return (
              <m.BoxPlot
                data={BOXES}
                variant="violin"
                orientation="vertical"
                color={3}
                height={H}
                aria-label="Response time by quarter"
              />
            );
          },
      ),
  },
  {
    slug: "beeswarm",
    title: "Beeswarm",
    path: "/charts/beeswarm",
    categories: ["Distribution"],
    blurb: "Every observation as a dot, none hidden",
    load: () =>
      import("../../../../theme/src/components/charts/beeswarm").then(
        (m) =>
          function BeeswarmPreview() {
            return (
              <Middle>
                <m.Beeswarm data={SWARM} series={SWARM_SERIES} aria-label="Deal size, organic and paid" />
              </Middle>
            );
          },
      ),
  },
  {
    slug: "ridgeline",
    title: "Ridgeline chart",
    path: "/charts/ridgeline",
    categories: ["Distribution", "Comparison"],
    blurb: "Distributions stacked as overlapping ridges",
    load: () =>
      import("../../../../theme/src/components/charts/ridgeline-chart").then(
        (m) =>
          function RidgelinePreview() {
            return <m.RidgelineChart data={RIDGES} rowHeight={34} aria-label="Delivery time by weekday" />;
          },
      ),
  },

  /* ---------- Flow ---------- */
  {
    slug: "funnel",
    title: "Funnel chart",
    path: "/charts/funnel-chart",
    categories: ["Flow", "Comparison"],
    blurb: "Conversion through ordered stages",
    load: () =>
      import("../../../../theme/src/components/charts/funnel-chart").then(
        (m) =>
          function FunnelPreview() {
            // No height prop: ~270px tall at this width, so the tile shows its top stages.
            return <m.FunnelChart data={FUNNEL} showDropOff={false} aria-label="Signup funnel" />;
          },
      ),
  },
  {
    slug: "sankey",
    title: "Sankey diagram",
    path: "/charts/sankey-diagram",
    categories: ["Flow"],
    blurb: "Flows between stages, sized by volume",
    load: () =>
      import("../../../../theme/src/components/charts/sankey-chart").then(
        (m) =>
          function SankeyPreview() {
            // Below 480px wide the diagram adds a 38–56px readout band above `height`.
            return (
              <m.SankeyChart
                nodes={SANKEY_NODES}
                links={SANKEY_LINKS}
                height={H}
                nodePadding={10}
                aria-label="Visitors from source to plan"
              />
            );
          },
      ),
  },
  {
    slug: "chord",
    title: "Chord diagram",
    path: "/charts/chord-diagram",
    categories: ["Flow"],
    blurb: "Two-way flows between a few groups",
    load: () =>
      import("../../../../theme/src/components/charts/chord-diagram").then(
        (m) =>
          function ChordPreview() {
            return (
              <m.ChordDiagram
                groups={CHORD_GROUPS}
                matrix={CHORD_MATRIX}
                showLabels={false}
                height={H}
                aria-label="Trade between regions"
              />
            );
          },
      ),
  },
  {
    slug: "network",
    title: "Network graph",
    path: "/charts/network-graph",
    categories: ["Flow", "Hierarchy"],
    blurb: "Connections between entities",
    load: () =>
      import("../../../../theme/src/components/charts/network-graph").then(
        (m) =>
          function NetworkPreview() {
            return (
              <m.NetworkGraph
                nodes={NETWORK_NODES}
                links={NETWORK_LINKS}
                groups={NETWORK_GROUPS}
                showLabels="none"
                forces={{ ticks: 150 }}
                height={H}
                aria-label="Service dependencies"
              />
            );
          },
      ),
  },
  {
    slug: "gantt",
    title: "Gantt chart",
    path: "/charts/gantt",
    categories: ["Flow"],
    blurb: "Tasks on a timeline, with dependencies",
    load: () =>
      import("../../../../theme/src/components/charts/gantt-chart").then(
        (m) =>
          function GanttPreview() {
            return <m.GanttChart tasks={GANTT} toolbar={false} today={null} aria-label="Launch plan" />;
          },
      ),
  },

  /* ---------- Hierarchy ---------- */
  {
    slug: "treemap",
    title: "Treemap",
    path: "/charts/treemap",
    categories: ["Hierarchy", "Composition"],
    blurb: "Part-to-whole as nested tiles",
    load: () =>
      import("../../../../theme/src/components/charts/treemap").then(
        (m) =>
          function TreemapPreview() {
            // Below 480px wide the treemap adds a 40–58px readout band above `height`.
            return <m.Treemap data={TREEMAP} drillDown={false} height={H} aria-label="Traffic by channel" />;
          },
      ),
  },
  {
    slug: "sunburst",
    title: "Sunburst chart",
    path: "/charts/sunburst",
    categories: ["Hierarchy", "Composition"],
    blurb: "A hierarchy as nested rings",
    load: () =>
      import("../../../../theme/src/components/charts/sunburst-chart").then(
        (m) =>
          function SunburstPreview() {
            return (
              <m.SunburstChart
                data={SUNBURST}
                rings={2}
                drillDown={false}
                height={H}
                aria-label="Headcount by department and team"
              />
            );
          },
      ),
  },

  /* ---------- Geo ---------- */
  {
    slug: "world-map",
    title: "World map",
    path: "/charts/world-map",
    categories: ["Geo"],
    blurb: "Values by country on a world map",
    load: () =>
      import("../../../../theme/src/components/charts/geo-map").then(
        (m) =>
          function WorldMapPreview() {
            // No height prop: the map is 0.4375 × its width, so cap the width at 310px (136px tall).
            return (
              <m.WorldMap
                data={WORLD}
                scaleType="log"
                legend={false}
                zoomable={false}
                className="mx-auto"
                aria-label="Revenue by country"
              />
            );
          },
      ),
  },

  /* ---------- Finance ---------- */
  {
    slug: "candlestick",
    title: "Candlestick chart",
    path: "/charts/candlestick",
    categories: ["Finance", "Trend"],
    blurb: "Open, high, low and close per period",
    load: () =>
      import("../../../../theme/src/components/charts/candlestick-chart").then(
        (m) =>
          function CandlestickPreview() {
            // The readout row above the plot can't be hidden: 32–44px + 8px gap + 36px of axes + 48.
            return (
              <m.CandlestickChart
                data={CANDLES}
                volume={false}
                zoom={false}
                height={H - 70}
                format={price0}
                formatDate={formatShortDate}
                timeZone="UTC"
                aria-label="Daily price, September"
              />
            );
          },
      ),
  },
  {
    slug: "ohlc",
    title: "OHLC bars",
    path: "/charts/candlestick",
    categories: ["Finance"],
    blurb: "Price bars with open and close ticks",
    load: () =>
      import("../../../../theme/src/components/charts/candlestick-chart").then(
        (m) =>
          function OhlcPreview() {
            return (
              <m.CandlestickChart
                data={CANDLES}
                mode="ohlc"
                volume={false}
                zoom={false}
                height={H - 70}
                format={price0}
                formatDate={formatShortDate}
                timeZone="UTC"
                aria-label="Daily price, September"
              />
            );
          },
      ),
  },
  {
    slug: "waterfall",
    title: "Waterfall chart",
    path: "/charts/waterfall-chart",
    categories: ["Finance", "Composition"],
    blurb: "How a total builds up step by step",
    load: () =>
      import("../../../../theme/src/components/charts/waterfall-chart").then(
        (m) =>
          function WaterfallPreview() {
            return (
              <m.WaterfallChart
                data={WATERFALL}
                layout="vertical"
                showValues={false}
                height={H}
                aria-label="Revenue bridge, start to end of quarter"
              />
            );
          },
      ),
  },

  /* ---------- KPI ---------- */
  {
    slug: "sparkbar",
    title: "Sparkbar",
    path: "/charts/sparkbar",
    categories: ["KPI", "Trend"],
    blurb: "Tiny columns or win/loss marks in a tile",
    load: () =>
      import("../../../../theme/src/components/charts/sparkbar").then(
        (m) =>
          function SparkbarPreview() {
            return (
              <Middle>
                <m.Sparkbar values={SPARKBAR} height={84} aria-label="Daily orders" />
                <m.Sparkbar values={WINLOSS} variant="winloss" height={52} aria-label="Match results" />
              </Middle>
            );
          },
      ),
  },
  {
    slug: "gauge",
    title: "Gauge",
    path: "/charts/gauge-chart",
    categories: ["KPI"],
    blurb: "One value on a scale with colored bands",
    load: () =>
      import("../../../../theme/src/components/charts/gauge-chart").then(
        (m) =>
          function GaugePreview() {
            return (
              <m.GaugeChart
                value={72}
                bands={GAUGE_BANDS}
                ticks={false}
                height={H}
                aria-label="Customer satisfaction score"
              />
            );
          },
      ),
  },
  {
    slug: "radial-bar",
    title: "Radial bar chart",
    path: "/charts/radial-bar-chart",
    categories: ["KPI", "Comparison"],
    blurb: "A few goals as concentric rings",
    load: () =>
      import("../../../../theme/src/components/charts/radial-bar-chart").then(
        (m) =>
          function RadialBarPreview() {
            return <m.RadialBarChart data={RADIAL} diameter={H} aria-label="Weekly training goals" />;
          },
      ),
  },
  {
    slug: "bullet",
    title: "Bullet chart",
    path: "/charts/bullet-chart",
    categories: ["KPI", "Comparison"],
    blurb: "A measure against its target and ranges",
    load: () =>
      import("../../../../theme/src/components/charts/bullet-chart").then(
        (m) =>
          function BulletPreview() {
            return (
              <Middle>
                <m.BulletChart data={BULLET} aria-label="Revenue against target" />
              </Middle>
            );
          },
      ),
  },
  {
    slug: "category-bar",
    title: "Category bar",
    path: "/charts/category-bar",
    categories: ["KPI"],
    blurb: "Where one value falls among bands",
    load: () =>
      import("../../../../theme/src/components/charts/category-bar").then(
        (m) =>
          function CategoryBarPreview() {
            return (
              <Middle>
                <m.CategoryBar
                  data={SCORE_BANDS}
                  start={300}
                  marker={712}
                  markerLabel="Score"
                  size="lg"
                  aria-label="Credit score bands"
                />
              </Middle>
            );
          },
      ),
  },
  {
    slug: "tracker",
    title: "Tracker",
    path: "/charts/uptime-tracker",
    categories: ["KPI", "Trend"],
    blurb: "Status per period, e.g. 30 days of uptime",
    load: () =>
      import("../../../../theme/src/components/charts/tracker-chart").then(
        (m) =>
          function TrackerPreview() {
            return (
              <Middle>
                <m.TrackerChart data={TRACKER} height={64} showLegend={false} aria-label="API uptime, last 30 days" />
              </Middle>
            );
          },
      ),
  },
];
