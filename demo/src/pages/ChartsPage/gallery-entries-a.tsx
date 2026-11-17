import { useRef } from "react";
import { useInView } from "motion/react";
import {
  AREA_SERIES,
  BAR_LIST,
  CALENDAR,
  CAL_END,
  CAL_START,
  COHORTS,
  COMBO,
  COMBO_SERIES,
  CPU_SERIES,
  DONUT,
  DUMBBELL,
  H,
  LIKERT,
  LIKERT_LEVELS,
  LOLLIPOP,
  Middle,
  PLATFORM_SERIES,
  POLAR_SERIES,
  PYRAMID,
  PYRAMID_LEVELS,
  RADAR,
  RADAR_SERIES,
  RANGE,
  RANGE_SERIES,
  REGIONS,
  SLOPE,
  SPARK,
  SPARK_MUTED,
  STACK,
  STEPS,
  STEP_SERIES,
  STREAM,
  STREAM_SERIES,
  TREND,
  TREND_SERIES,
  YEAR_SERIES,
  cohortPeriod,
  cpuSource,
  pct0,
} from "./gallery-samples";
import type { GalleryEntry } from "./gallery-types";

/** The core, comparison and trend previews of the gallery. */
export const GALLERY_A: GalleryEntry[] = [
  /* ---------- Core charts (no own route) ---------- */
  {
    slug: "line",
    title: "Line chart",
    path: "/charts/line-chart",
    categories: ["Trend"],
    blurb: "Change over time for a few series",
    load: () =>
      import("../../../../theme/src/components/charts/line-chart").then(
        (m) =>
          function LinePreview() {
            return (
              <m.LineChart
                data={TREND}
                index="m"
                series={TREND_SERIES}
                height={H}
                endLabels={false}
                aria-label="Revenue and costs by month"
              />
            );
          },
      ),
  },
  {
    slug: "area",
    title: "Area chart",
    path: "/charts/area-chart",
    categories: ["Trend"],
    blurb: "Volume over time with a soft fill",
    load: () =>
      import("../../../../theme/src/components/charts/line-chart").then(
        (m) =>
          function AreaPreview() {
            return (
              <m.AreaChart
                data={TREND}
                index="m"
                series={AREA_SERIES}
                height={H}
                endLabels={false}
                aria-label="Sessions by month"
              />
            );
          },
      ),
  },
  {
    slug: "bar",
    title: "Bar chart",
    path: "/charts/bar-chart",
    categories: ["Comparison"],
    blurb: "Compare values across categories",
    load: () =>
      import("../../../../theme/src/components/charts/bar-chart").then(
        (m) =>
          function BarPreview() {
            return (
              <m.BarChart
                data={REGIONS}
                index="r"
                series={YEAR_SERIES}
                height={H}
                aria-label="Revenue by region, 2025 and 2026"
              />
            );
          },
      ),
  },
  {
    slug: "donut",
    title: "Donut chart",
    path: "/charts/donut-chart",
    categories: ["Composition", "KPI"],
    blurb: "Part-to-whole with the total in the center",
    load: () =>
      import("../../../../theme/src/components/charts/donut-chart").then(
        (m) =>
          function DonutPreview() {
            return (
              <Middle>
                <m.DonutChart
                  data={DONUT}
                  diameter={196}
                  labels={{ center: "Visits" }}
                  aria-label="Visits by platform"
                />
              </Middle>
            );
          },
      ),
  },
  {
    slug: "radial-progress",
    title: "Radial progress",
    path: "",
    categories: ["KPI"],
    blurb: "One percentage on the way to a goal",
    load: () =>
      import("../../../../theme/src/components/charts/radial-progress").then(
        (m) =>
          function RadialProgressPreview() {
            return (
              <Middle row>
                <m.RadialProgress value={72} label="Goal" diameter={156} aria-label="Quarterly goal, 72%" />
                <m.RadialProgress
                  value={88}
                  variant="gauge"
                  coloring="severity"
                  diameter={156}
                  aria-label="Storage used, 88%"
                />
              </Middle>
            );
          },
      ),
  },
  {
    slug: "sparkline",
    title: "Sparkline",
    path: "/charts/sparkline",
    categories: ["KPI", "Trend"],
    blurb: "A word-sized trend for tables and KPI tiles",
    load: () =>
      import("../../../../theme/src/components/charts/sparkline").then(
        (m) =>
          function SparklinePreview() {
            return (
              <Middle>
                <m.Sparkline values={SPARK} height={80} aria-label="Signups, last 24 days" />
                <m.Sparkline values={SPARK_MUTED} variant="muted" height={80} aria-label="Churn, last 24 days" />
              </Middle>
            );
          },
      ),
  },

  /* ---------- Comparison ---------- */
  {
    slug: "bar-list",
    title: "Bar list",
    path: "/charts/bar-list",
    categories: ["Comparison"],
    blurb: "Ranked rows with a bar behind each name",
    load: () =>
      import("../../../../theme/src/components/charts/bar-list").then(
        (m) =>
          function BarListPreview() {
            return <m.BarList data={BAR_LIST} aria-label="Visits by referrer" />;
          },
      ),
  },
  {
    slug: "lollipop",
    title: "Lollipop chart",
    path: "/charts/lollipop",
    categories: ["Comparison"],
    blurb: "Ranked values with less ink than bars",
    load: () =>
      import("../../../../theme/src/components/charts/lollipop-chart").then(
        (m) =>
          function LollipopPreview() {
            return (
              <m.LollipopChart
                data={LOLLIPOP}
                layout="vertical"
                sort="descending"
                showValues={false}
                height={H}
                aria-label="Score by city"
              />
            );
          },
      ),
  },
  {
    slug: "dumbbell",
    title: "Dumbbell chart",
    path: "/charts/dumbbell",
    categories: ["Comparison"],
    blurb: "Before and after for each item",
    load: () =>
      import("../../../../theme/src/components/charts/dumbbell-chart").then(
        (m) =>
          function DumbbellPreview() {
            return (
              <m.DumbbellChart
                data={DUMBBELL}
                fromLabel="2025"
                toLabel="2026"
                change="none"
                aria-label="Engagement by team, 2025 to 2026"
              />
            );
          },
      ),
  },
  {
    slug: "slope",
    title: "Slope chart",
    path: "/charts/dumbbell",
    categories: ["Comparison", "Trend"],
    blurb: "Change between two points in time",
    load: () =>
      import("../../../../theme/src/components/charts/dumbbell-chart").then(
        (m) =>
          function SlopePreview() {
            return (
              <m.DumbbellChart
                data={SLOPE}
                variant="slope"
                fromLabel="2025"
                toLabel="2026"
                change="none"
                height={H}
                aria-label="Engagement by team, 2025 to 2026"
              />
            );
          },
      ),
  },
  {
    slug: "radar",
    title: "Radar chart",
    path: "/charts/radar-chart",
    categories: ["Comparison"],
    blurb: "Profiles compared across several axes",
    load: () =>
      import("../../../../theme/src/components/charts/radar-chart").then(
        (m) =>
          function RadarPreview() {
            return (
              <m.RadarChart
                data={RADAR}
                index="axis"
                series={RADAR_SERIES}
                max={100}
                height={H}
                aria-label="Two models scored on six criteria"
              />
            );
          },
      ),
  },
  {
    slug: "polar-area",
    title: "Polar area chart",
    path: "/charts/polar-area",
    categories: ["Comparison", "Trend"],
    blurb: "Cyclic categories as wedges, e.g. months",
    load: () =>
      import("../../../../theme/src/components/charts/polar-area-chart").then(
        (m) =>
          function PolarAreaPreview() {
            return (
              <m.PolarAreaChart data={TREND} index="m" series={POLAR_SERIES} height={H} aria-label="Visits by month" />
            );
          },
      ),
  },
  {
    slug: "diverging-bar",
    title: "Diverging bar chart",
    path: "/charts/diverging-bar",
    categories: ["Comparison", "Distribution"],
    blurb: "Survey answers around a neutral midpoint",
    load: () =>
      import("../../../../theme/src/components/charts/diverging-bar-chart").then(
        (m) =>
          function DivergingBarPreview() {
            return (
              <m.DivergingBarChart
                data={LIKERT}
                index="q"
                levels={LIKERT_LEVELS}
                showNet={false}
                showValues={false}
                height={H}
                aria-label="Survey answers by question"
              />
            );
          },
      ),
  },
  {
    slug: "population-pyramid",
    title: "Population pyramid",
    path: "/charts/diverging-bar",
    categories: ["Comparison", "Distribution"],
    blurb: "Two groups back to back, row by row",
    load: () =>
      import("../../../../theme/src/components/charts/diverging-bar-chart").then(
        (m) =>
          function PyramidPreview() {
            return (
              <m.DivergingBarChart
                data={PYRAMID}
                index="age"
                levels={PYRAMID_LEVELS}
                variant="butterfly"
                showValues={false}
                height={H}
                aria-label="Users by age and gender"
              />
            );
          },
      ),
  },

  /* ---------- Trend ---------- */
  {
    slug: "stacked-area",
    title: "Stacked area chart",
    path: "/charts/stacked-area-chart",
    categories: ["Trend", "Composition"],
    blurb: "A total over time, split into its parts",
    load: () =>
      import("../../../../theme/src/components/charts/stacked-area-chart").then(
        (m) =>
          function StackedAreaPreview() {
            return (
              <m.StackedAreaChart
                data={STACK}
                index="m"
                series={PLATFORM_SERIES}
                curve="monotone"
                height={H}
                aria-label="Active users by platform"
              />
            );
          },
      ),
  },
  {
    slug: "combo",
    title: "Combo chart",
    path: "/charts/combo-chart",
    categories: ["Trend", "Comparison"],
    blurb: "Bars and a line that share one axis",
    load: () =>
      import("../../../../theme/src/components/charts/combo-chart").then(
        (m) =>
          function ComboPreview() {
            return (
              <m.ComboChart
                data={COMBO}
                index="w"
                series={COMBO_SERIES}
                height={H}
                aria-label="Weekly orders and their 3-week average"
              />
            );
          },
      ),
  },
  {
    slug: "step-line",
    title: "Step line chart",
    path: "/charts/step-line-chart",
    categories: ["Trend"],
    blurb: "Values that change in discrete steps",
    load: () =>
      import("../../../../theme/src/components/charts/step-line-chart").then(
        (m) =>
          function StepLinePreview() {
            return (
              <m.StepLineChart
                data={STEPS}
                index="m"
                series={STEP_SERIES}
                zero={false}
                endLabels={false}
                height={H}
                aria-label="Plan price by month"
              />
            );
          },
      ),
  },
  {
    slug: "range-area",
    title: "Range area chart",
    path: "/charts/range-area-chart",
    categories: ["Trend", "Distribution"],
    blurb: "A line with its low–high band or forecast",
    load: () =>
      import("../../../../theme/src/components/charts/range-area-chart").then(
        (m) =>
          function RangeAreaPreview() {
            return (
              <m.RangeAreaChart
                data={RANGE}
                index="m"
                series={RANGE_SERIES}
                curve="monotone"
                forecastFrom="Sep"
                height={H}
                aria-label="Demand with forecast interval"
              />
            );
          },
      ),
  },
  {
    slug: "streamgraph",
    title: "Streamgraph",
    path: "/charts/streamgraph",
    categories: ["Trend", "Composition"],
    blurb: "Flowing layers that swell and shrink",
    load: () =>
      import("../../../../theme/src/components/charts/streamgraph").then(
        (m) =>
          function StreamgraphPreview() {
            return (
              <m.Streamgraph
                data={STREAM}
                index="w"
                series={STREAM_SERIES}
                inlineLabels={false}
                height={H}
                aria-label="Plays by genre, 16 weeks"
              />
            );
          },
      ),
  },
  {
    slug: "streaming",
    title: "Streaming chart",
    path: "/charts/realtime-chart",
    categories: ["Trend", "KPI"],
    blurb: "Live samples sliding in, like a monitor",
    load: () =>
      // useInView is a static import: a dynamic import("motion/react") would make the bundler keep
      // every export of the library (Reorder, drag, layout...) in a shared chunk.
      import("../../../../theme/src/components/charts/streaming-chart").then(
        (m) =>
          function StreamingPreview() {
            const ref = useRef<HTMLDivElement>(null);
            // The chart rests by itself off-screen; the sampling hook only rests in hidden tabs, so
            // tell it when the tile is far from the viewport too (missed samples are filled in later).
            const near = useInView(ref, { margin: "100px" });
            const data = m.useStreamingData(cpuSource, {
              rate: 1000,
              history: 40,
              capacity: 60,
              valueKey: "cpu",
              idle: !near,
            });
            return (
              <div ref={ref}>
                <m.StreamingChart
                  data={data}
                  series={CPU_SERIES}
                  rate={1000}
                  window={40}
                  height={H - 52}
                  format={pct0}
                  aria-label="Live CPU load"
                />
              </div>
            );
          },
      ),
  },
  {
    slug: "calendar-heatmap",
    title: "Calendar heatmap",
    path: "/charts/calendar-heatmap",
    categories: ["Trend", "Distribution"],
    blurb: "Daily activity laid out week by week",
    load: () =>
      import("../../../../theme/src/components/charts/calendar-heatmap").then(
        (m) =>
          function CalendarHeatmapPreview() {
            return (
              <m.CalendarHeatmap
                data={CALENDAR}
                start={CAL_START}
                end={CAL_END}
                today={null}
                cellSize={24}
                legend={false}
                aria-label="Contributions, June to August"
              />
            );
          },
      ),
  },
  {
    slug: "cohort",
    title: "Cohort retention",
    path: "/charts/cohort-retention",
    categories: ["Trend", "Comparison"],
    blurb: "How many users each signup cohort keeps",
    load: () =>
      import("../../../../theme/src/components/charts/cohort-chart").then(
        (m) =>
          function CohortPreview() {
            return (
              <m.CohortChart
                data={COHORTS}
                viewToggle={false}
                legend={false}
                average={false}
                labels={{ period: cohortPeriod }}
                aria-label="Weekly retention by signup cohort"
              />
            );
          },
      ),
  },
];
