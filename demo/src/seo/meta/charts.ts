import { COUNTS } from "../counts";
import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Charts" routes (and the pages that sit beside them). */
export const seoCharts: Record<string, SeoMeta> = {
  "/charts": {
    title: `Animated React Charts: ${COUNTS.charts} Chart Types`,
    description: `${COUNTS.charts} animated React chart components in glass, from line and pie to heatmap and Sankey, with tooltips, keyboard reading and table view. MIT.`,
    keyword: "animated react charts",
    h1: "Animated React Charts",
    intro: "Animated React charts with tooltips, keyboard reading and a table view for every one.",
    secondary: ["react charts tailwind", "shadcn charts alternative", "react chart components", "base ui charts"],
  },
  "/charts/edge-cases": {
    title: "Chart Edge Cases (Test Page)",
    description:
      "Test page for empty, single-point, negative and live data in SheenUI charts. Not meant for search; noindex and excluded from the sitemap.",
    keyword: "",
    h1: "Chart Edge Cases",
    intro:
      "A test page for the charts: empty, single-point, negative, duplicate and live data, shown the way each chart component handles them.",
    noindex: true,
  },
  "/charts/percent-stacked-bar-chart": {
    title: "100% Stacked Bar Chart for React",
    description:
      "A 100% stacked bar chart for React that compares the mix inside each category. Hover or arrow through segments for share and value. Animated, accessible.",
    keyword: "100% stacked bar chart react",
    h1: "100% Stacked Bar Chart for React",
    intro:
      "A React 100% stacked bar chart that scales every bar to 100%, so you can compare the mix inside each category whatever its size.",
    secondary: ["percentage bar chart", "normalized stacked bar chart"],
  },
  "/charts/bar-list": {
    title: "React Bar List: Ranked Top-N Chart",
    description:
      "A React bar list: a ranked top-N chart with a soft bar behind each name, compact in cards and a plain list to screen readers. A Tremor-style bar list. MIT.",
    keyword: "react bar list",
    h1: "Bar List for React",
    intro:
      "A React bar list draws each value as a soft bar behind its name: the most compact way to rank many named values in a card.",
    secondary: ["ranked list chart", "top n chart react", "tremor bar list alternative"],
  },
  "/charts/beeswarm": {
    title: "Beeswarm Chart for React",
    description:
      "A React beeswarm chart: every observation as its own dot, nudged so none overlap, so the distribution shows and each item stays hoverable and named. MIT.",
    keyword: "beeswarm chart react",
    h1: "Beeswarm Chart for React",
    intro:
      "A React beeswarm chart plots every observation as its own dot along one axis, nudged just enough that none overlap.",
    secondary: ["swarm plot", "strip plot react"],
  },
  "/charts/box-plot": {
    title: "Box Plot & Violin Chart for React",
    description:
      "A React box plot and violin chart to compare distributions: median, IQR whiskers, dodged outliers and full density shapes. Animated and accessible. MIT.",
    keyword: "box plot react",
    h1: "Box Plot and Violin Chart for React",
    intro:
      "A React box plot compares distributions across groups; the violin variant shows the full shape, so two-peaked groups stand out.",
    secondary: ["violin plot react", "box and whisker chart"],
  },
  "/charts/bullet-chart": {
    title: "Bullet Chart for React: Actual vs Target",
    description:
      "A React bullet chart, Stephen Few's compact gauge: actual as a bar, target as a marker and ranges behind, with deltas that never rely on color. MIT.",
    keyword: "bullet chart react",
    h1: "Bullet Chart for React",
    intro:
      "A React bullet chart shows actual against target with qualitative ranges behind, so many KPIs fit where one gauge would.",
    secondary: ["actual vs target chart", "kpi bullet graph"],
  },
  "/charts/calendar-heatmap": {
    title: "Calendar Heatmap for React (GitHub-Style Graph)",
    description:
      "A GitHub-style contribution graph for React: a calendar heatmap with locale-aware weeks, Intl month names and time-zone-safe dates. Accessible, MIT.",
    keyword: "calendar heatmap react",
    h1: "Calendar Heatmap for React",
    intro:
      "A React calendar heatmap that draws a GitHub-style contribution graph: one cell per day on sequential color steps.",
    secondary: ["github contribution graph react", "activity heatmap react"],
  },
  "/charts/candlestick": {
    title: "Candlestick Chart for React (OHLC + Volume)",
    description:
      "A React candlestick chart with OHLC bars, a volume strip and moving average, pinch or Ctrl/⌘-scroll zoom and a readout that follows the crosshair. MIT.",
    keyword: "candlestick chart react",
    h1: "Candlestick Chart for React",
    intro:
      "A React candlestick chart shows prices over time as candles or OHLC bars, with a volume strip and a moving average.",
    secondary: ["ohlc chart react", "stock chart react", "crypto price chart"],
  },
  "/charts/category-bar": {
    title: "Category Bar: Segmented Score Bar for React",
    description:
      "A React category bar: one bar split into named bands with a pin for the current value, for credit scores, latency budgets and NPS. Accessible, glass style.",
    keyword: "category bar react",
    h1: "Category Bar for React",
    intro:
      "A React category bar splits one bar into named bands and pins where a value sits, such as a credit score or an NPS.",
    secondary: ["segmented bar chart", "credit score bar", "nps bar chart"],
  },
  "/charts/chord-diagram": {
    title: "Chord Diagram for React",
    description:
      "A React chord diagram for flows between a handful of groups (upgrades and downgrades, code reviews, trade) drawn as ribbons across a circle. Accessible.",
    keyword: "chord diagram react",
    h1: "Chord Diagram for React",
    intro: "A React chord diagram draws flows between a handful of groups as ribbons across a circle.",
    secondary: ["chord chart", "relationship diagram react"],
  },
  "/charts/cohort-retention": {
    title: "Cohort Retention Chart for React",
    description:
      "A React cohort retention chart: one row per cohort, colored light to dark by retention, with a weighted-average row and comparing tooltips. Accessible.",
    keyword: "cohort retention chart react",
    h1: "Cohort Retention Chart for React",
    intro: "A React cohort retention chart shows how many people from each starting week or month are still around.",
    secondary: ["retention heatmap", "cohort analysis table"],
  },
  "/charts/combo-chart": {
    title: "Combo Chart for React: Bar + Line on One Axis",
    description:
      "A React combo chart with bars and lines on one shared y-axis: a daily count with its rolling average, or parts against a target. No dual axis. Accessible.",
    keyword: "combo chart react",
    h1: "Combo Chart (Bar and Line) for React",
    intro:
      "A React combo chart that draws bars and lines on one shared y-axis, such as a daily count with its rolling average.",
    secondary: ["bar and line chart react", "combined chart"],
  },
  "/charts/diverging-bar": {
    title: "Diverging Bar Chart & Population Pyramid (React)",
    description:
      "A React diverging bar chart for Likert survey answers around a neutral midpoint, plus a butterfly population pyramid on one shared scale. Accessible, MIT.",
    keyword: "diverging bar chart react",
    h1: "Diverging Bar Chart for React",
    intro:
      "A React diverging bar chart centers survey answers on a neutral midpoint; the butterfly variant draws a population pyramid.",
    secondary: ["likert scale chart", "population pyramid react"],
  },
  "/charts/bump-chart": {
    title: "Bump Chart for React: Rank Over Time",
    description:
      "A React bump chart that shows how a ranking changes over time, with the rank in every dot, end labels and dash patterns. Animated, accessible.",
    keyword: "bump chart react",
    h1: "Bump Chart for React",
    intro: "A React bump chart shows how a ranking changes over time, one line per series, with the rank in every dot.",
    secondary: ["rank chart react", "ranking over time chart", "league table chart"],
  },
  "/charts/error-bar-chart": {
    title: "Error Bar Chart for React: Confidence Intervals",
    description:
      "A React error bar chart with bars, points or a shaded confidence band. Whiskers show the interval, with keyboard reading and a table view. Accessible.",
    keyword: "error bar chart react",
    h1: "Error Bar Chart for React",
    intro:
      "A React error bar chart draws an estimate with the confidence interval around it, as bars, points or a shaded band.",
    secondary: ["confidence interval chart react", "forest plot react", "confidence band line chart"],
  },
  "/charts/population-pyramid": {
    title: "Population Pyramid Chart for React",
    description:
      "A React population pyramid: mirrored horizontal bars by age group on one scale, with counts or shares, hatching and keyboard reading. Animated, accessible.",
    keyword: "population pyramid react",
    h1: "Population Pyramid for React",
    intro:
      "A React population pyramid mirrors two sets of bars around a centre line, one row per age group, on one shared scale.",
    secondary: ["age pyramid chart", "butterfly chart react", "demographic chart react"],
  },
  "/charts/dumbbell": {
    title: "Dumbbell & Slope Chart for React",
    description:
      "React dumbbell and slope charts for before-and-after comparisons, with every change printed as ▲/▼ so it never depends on color. Animated, accessible.",
    keyword: "dumbbell chart react",
    h1: "Dumbbell and Slope Chart for React",
    intro:
      "A React dumbbell or slope chart shows before and after for each item, with every change printed in words and arrows.",
    secondary: ["slope chart react", "before and after chart"],
  },
  "/charts/funnel-chart": {
    title: "Funnel Chart for React: Conversion Drop-Off",
    description:
      "A React funnel chart for conversion: bars narrow by stage and every step shows how many continued and dropped off. Animated, accessible, Tailwind v4.",
    keyword: "funnel chart react",
    h1: "Funnel Chart for React",
    intro:
      "A React funnel chart that shows conversion stage by stage, printing how many continued and how many dropped off at every step.",
    secondary: ["conversion funnel chart", "sales funnel visualization"],
  },
  "/charts/gantt": {
    title: "Gantt Chart for React with Dependencies",
    description:
      "A React Gantt chart with progress bars, finish-to-start dependency arrows, milestones, collapsible phases, a today line and day/week/month zoom. Free, MIT.",
    keyword: "gantt chart react",
    h1: "Gantt Chart for React",
    intro:
      "A React Gantt chart puts a plan on a timeline, with progress, dependency arrows, milestones and a today line.",
    secondary: ["react timeline gantt", "project timeline chart"],
  },
  "/charts/gauge-chart": {
    title: "Gauge Chart for React: Animated Speedometer",
    description:
      "A React gauge chart: a semicircle or 270° speedometer whose needle springs to the value while bands light up, with icons and names, never color alone.",
    keyword: "gauge chart react",
    h1: "Gauge Chart for React",
    intro:
      "A React gauge chart shows one number against its scale as a semicircle or a speedometer whose needle springs into place.",
    secondary: ["speedometer chart react", "radial gauge react"],
  },
  "/charts/heatmap": {
    title: "React Heatmap Chart with Scale Legend",
    description:
      "A React heatmap chart on a single-hue sequential scale, with tooltips on hover, tap and keyboard, a live scale legend and hatched missing values. MIT.",
    keyword: "react heatmap",
    h1: "Heatmap for React",
    intro:
      "A React heatmap chart that colors a category-by-category grid from light to dark, with a tooltip on every cell.",
    secondary: ["heatmap chart react", "matrix heatmap", "correlation heatmap"],
  },
  "/charts/histogram": {
    title: "Histogram Chart for React with Density Curve",
    description:
      "A React histogram with Freedman-Diaconis or Sturges bins, an optional density curve and median or percentile markers. Animated, accessible, Tailwind v4.",
    keyword: "histogram react",
    h1: "Histogram for React",
    intro:
      "A React histogram shows how a measure is spread, with automatic bins, an optional density curve and percentile markers.",
    secondary: ["distribution chart react", "histogram with density curve"],
  },
  "/charts/lollipop": {
    title: "Lollipop Chart for React",
    description:
      "A React lollipop chart: a thin stem and a dot per value, so long ranked lists stay calm, with reference lines and highlights. Animated, accessible, MIT.",
    keyword: "lollipop chart react",
    h1: "Lollipop Chart for React",
    intro:
      "A React lollipop chart gives all the reading of a bar chart with a fraction of the ink: a thin stem and a dot per value.",
    secondary: ["dot plot react", "ranked chart"],
  },
  "/charts/marimekko": {
    title: "Marimekko (Mekko) Chart for React",
    description:
      "A React Marimekko chart: a 100% stacked mosaic whose columns are as wide as their totals, showing market size and share in one picture. Accessible, MIT.",
    keyword: "marimekko chart react",
    h1: "Marimekko Chart for React",
    intro: "A React Marimekko chart is a 100% stacked mosaic whose columns are as wide as their totals.",
    secondary: ["mosaic chart", "mekko chart"],
  },
  "/charts/network-graph": {
    title: "Network Graph for React (Force-Directed)",
    description:
      "A force-directed network graph for React with no dependency: springs, charge and collision computed between frames. For dependencies, teams and links. MIT.",
    keyword: "network graph react",
    h1: "Network Graph for React",
    intro:
      "A force-directed React network graph shows who is connected to whom, laid out by a simulation written in the component.",
    secondary: ["force directed graph react", "node graph react"],
  },
  "/charts/pie-chart": {
    title: "React Pie Chart with Labels & Legend",
    description:
      "A React pie chart for part-to-whole at a glance: up to 6 slices, leader-line labels that never collide and an always-complete legend. Animated, accessible.",
    keyword: "react pie chart",
    h1: "Pie Chart for React",
    intro: "A React pie chart for part-to-whole at a glance, folding the smallest slices into “Other” after six.",
    secondary: ["pie chart component react", "pie chart with labels"],
  },
  "/charts/polar-area": {
    title: "Polar Area Chart (Nightingale Rose) for React",
    description:
      "A React polar area chart, Nightingale's rose: one wedge per category with area proportional to value, stacking series outward. Hover, tap or keys. MIT.",
    keyword: "polar area chart react",
    h1: "Polar Area Chart for React",
    intro:
      "A React polar area chart, Nightingale's rose, draws one wedge per category around a circle, its area proportional to the value.",
    secondary: ["nightingale rose chart", "coxcomb chart"],
  },
  "/charts/radar-chart": {
    title: "Radar Chart for React (Spider Chart)",
    description:
      "A React radar chart (spider chart) to compare a few profiles across the same measures, with collision-free axis labels and keyboard reading. Animated, MIT.",
    keyword: "radar chart react",
    h1: "Radar Chart for React",
    intro: "A React radar chart, also called a spider chart, compares a few profiles across the same set of measures.",
    secondary: ["spider chart react", "skill radar chart"],
  },
  "/charts/radial-bar-chart": {
    title: "Radial Bar Chart for React: KPI Rings",
    description:
      "A React radial bar chart: 2 to 5 concentric KPI rings against their goals, each on its own track. Hover or arrow through rings to read them. Animated, MIT.",
    keyword: "radial bar chart react",
    h1: "Radial Bar Chart for React",
    intro:
      "A React radial bar chart draws 2 to 5 measures as concentric rings against their goals, like activity rings.",
    secondary: ["progress rings react", "activity rings chart"],
  },
  "/charts/range-area-chart": {
    title: "Range Area Chart for React: Forecast Bands",
    description:
      "A React range area chart: a line with a min-max band, for forecasts with confidence intervals or daily lows and highs. Gaps stay gaps. Accessible, MIT.",
    keyword: "range area chart react",
    h1: "Range Area Chart for React",
    intro:
      "A React range area chart draws a line inside a min-max band, such as a forecast and its confidence interval.",
    secondary: ["confidence interval chart", "forecast band chart"],
  },
  "/charts/ridgeline": {
    title: "Ridgeline Chart (Joy Plot) for React",
    description:
      "A React ridgeline chart: overlapping density ridges per group, computed with a Gaussian kernel and Silverman's bandwidth, with median ticks. Accessible.",
    keyword: "ridgeline chart react",
    h1: "Ridgeline Chart for React",
    intro:
      "A React ridgeline chart stacks overlapping density ridges, one per group, to show how a spread shifts between groups.",
    secondary: ["joy plot", "density plot react"],
  },
  "/charts/sankey-diagram": {
    title: "Sankey Diagram for React: Flow Charts",
    description:
      "A React Sankey diagram with no chart dependency: ribbons sized by flow for user journeys and revenue-to-profit, with a computed layout. Accessible.",
    keyword: "sankey diagram react",
    h1: "Sankey Diagram for React",
    intro:
      "A React Sankey diagram draws flows between stages as ribbons whose thickness is the amount, laid out without a chart library. Pass links as readonly SankeyLink[]: { source, target, value } objects, and optionally nodes with an id, a label and a color slot.",
    secondary: ["sankey chart react", "user flow chart"],
  },
  "/charts/scatter-plot": {
    title: "Scatter Plot & Bubble Chart for React",
    description:
      "A React scatter plot and bubble chart with nearest-point hover, arrow-key navigation and a least-squares trend line in one prop. Animated, accessible, MIT.",
    keyword: "scatter plot react",
    h1: "Scatter Plot and Bubble Chart for React",
    intro:
      "A React scatter plot and bubble chart that shows how two measures relate, one dot per item, with an optional trend line. Pass series as readonly ScatterSeries[]: each a label plus a data array of { x, y } points, with an optional size for bubbles.",
    secondary: ["bubble chart react", "scatter chart with trend line"],
  },
  "/charts/sparkbar": {
    title: "Sparkbar: Mini Bar Chart for React Tables",
    description:
      "A React sparkbar: a mini bar chart for stat tiles and table cells, with a win/loss mode and a spoken summary for screen readers. Glass style, Tailwind v4.",
    keyword: "mini bar chart react",
    h1: "Sparkbar (Mini Bar Chart) for React",
    intro: "A React sparkbar is a mini bar chart for stat tiles and table cells, the bar twin of the sparkline.",
    secondary: ["sparkbar", "win loss chart", "sparkline bar chart"],
  },
  "/charts/stacked-area-chart": {
    title: "Stacked Area Chart for React (100% Mode)",
    description:
      "A React stacked area chart that shows how a total builds from its parts, with a 100% mode, a crosshair listing every series and morphing data. Accessible.",
    keyword: "stacked area chart react",
    h1: "Stacked Area Chart for React",
    intro:
      "A React stacked area chart shows how a total builds from its parts over time, or in 100% mode how the mix shifts.",
    secondary: ["100% stacked area chart", "stacked area graph"],
  },
  "/charts/step-line-chart": {
    title: "Step Line Chart for React",
    description:
      "A React step line chart for values that hold, then jump: prices, plan limits, rates and headcount. Snapping crosshair and hover bands. Animated, MIT.",
    keyword: "step line chart react",
    h1: "Step Line Chart for React",
    intro: "A React step line chart for values that hold and then jump, such as prices, plan limits and headcount.",
    secondary: ["step chart", "stepped line graph"],
  },
  "/charts/streamgraph": {
    title: "Streamgraph Chart for React",
    description:
      "A React streamgraph: stacked areas flowing around a moving center line, with a wiggle baseline, inside labels and a crosshair that reads every layer. MIT.",
    keyword: "streamgraph react",
    h1: "Streamgraph for React",
    intro:
      "A React streamgraph shows how a mix swells and fades over time as stacked areas flowing around a moving center line.",
    secondary: ["stream chart", "wiggle stacked area"],
  },
  "/charts/realtime-chart": {
    title: "Real-Time Streaming Line Chart for React",
    description:
      "A live, real-time line chart for React: new samples glide in while the time axis slides, with a Pause button and a still mode for reduced motion. MIT.",
    keyword: "real time chart react",
    h1: "Real-Time Line Chart for React",
    intro:
      "A real-time React line chart: each new sample glides in from the right while the time axis slides under it.",
    secondary: ["streaming line chart", "live chart react"],
  },
  "/charts/sunburst": {
    title: "Sunburst Chart for React with Zoom",
    description:
      "A React sunburst chart: a hierarchy as rings with hover path tracing, rolling numbers and click-to-zoom with an animated sweep and breadcrumb. Accessible.",
    keyword: "sunburst chart react",
    h1: "Sunburst Chart for React",
    intro:
      "A React sunburst chart shows a hierarchy as rings around a center; click a group to zoom into it with an animated sweep.",
    secondary: ["hierarchical pie chart", "drill down chart react"],
  },
  "/charts/uptime-tracker": {
    title: "Uptime Tracker for React Status Pages",
    description:
      "A React uptime tracker: one status block per day, build or check, each with its own tooltip, plus icons and patterns so color is never the only cue.",
    keyword: "uptime tracker react",
    h1: "Uptime Tracker for React",
    intro:
      "A React uptime tracker draws the status-page view of uptime: one block per day, build or check, each with its own tooltip.",
    secondary: ["status page uptime bar", "tracker chart tremor alternative"],
  },
  "/charts/treemap": {
    title: "React Treemap Chart: Animated & Accessible",
    description:
      "A squarified React treemap with zoomable groups, labels only where they fit and black or white text chosen by contrast. No chart dependency. Free, MIT.",
    keyword: "react treemap",
    h1: "Treemap for React",
    intro:
      "A React treemap shows part-to-whole as nested rectangles, laid out by the squarified algorithm so tiles stay easy to compare.",
    secondary: ["treemap chart react", "squarified treemap", "hierarchical chart react"],
  },
  "/charts/waffle": {
    title: "Waffle Chart & Pictogram for React",
    description:
      "A React waffle chart: a 10×10 grid where each cell is one percent, split by largest remainder, plus a pictogram variant with any icon. Accessible, MIT.",
    keyword: "waffle chart react",
    h1: "Waffle Chart for React",
    intro:
      "A React waffle chart is a 10 × 10 grid where every cell is one percent, so “61 in 100” lands faster than any pie.",
    secondary: ["pictogram chart", "percentage grid chart"],
  },
  "/charts/waterfall-chart": {
    title: "Waterfall Chart for React (Bridge Chart)",
    description:
      "A React waterfall chart: a running total split into increases and decreases, with subtotals, totals and hairline connectors. Animated, accessible, MIT.",
    keyword: "waterfall chart react",
    h1: "Waterfall Chart for React",
    intro: "A React waterfall chart, or bridge chart, breaks a running total into its increases and decreases.",
    secondary: ["bridge chart", "profit and loss chart"],
  },
  "/charts/world-map": {
    title: "Choropleth World Map for React (No Map Library)",
    description:
      "A React choropleth world map and bubble map on Equal Earth, with Natural Earth outlines embedded as SVG and Intl country names. No map library. MIT.",
    keyword: "choropleth map react",
    h1: "World Map (Choropleth) for React",
    intro: "A React choropleth world map and bubble map on the Equal Earth projection, with no map library.",
    secondary: [
      "world map chart react",
      "bubble map react",
      "react map without library",
      "react choropleth component",
      "choropleth map component",
    ],
  },
  "/charts/line-chart": {
    title: "React Line Chart: Animated & Accessible",
    description:
      "An animated React line chart with end labels, hover and arrow-key tooltips, a legend and a table view. Color-blind-safe palette in glass style. Free, MIT.",
    keyword: "react line chart",
    h1: "React Line Chart",
    intro:
      "An animated React line chart with end labels, a crosshair tooltip you can drive with the arrow keys, and a table view of the same data.",
    secondary: ["animated line chart react", "line chart tailwind", "shadcn line chart alternative"],
  },
  "/charts/area-chart": {
    title: "React Area Chart with Gradient Fill",
    description:
      "An animated React area chart with gradient fills, a crosshair tooltip, keyboard reading and a table view, in a color-blind-safe palette. Tailwind v4, MIT.",
    keyword: "react area chart",
    h1: "React Area Chart",
    intro: "An animated React area chart with soft gradient fills, a crosshair tooltip and keyboard reading.",
    secondary: ["gradient area chart react", "area chart tailwind"],
  },
  "/charts/bar-chart": {
    title: "React Bar Chart: Grouped, Stacked & Horizontal",
    description:
      "Animated React bar charts, grouped, stacked or horizontal, with rounded thin bars, tooltips, keyboard reading and a table view. Accessible, Tailwind v4.",
    keyword: "react bar chart",
    h1: "React Bar Chart",
    intro:
      "A React bar chart compares values as animated bars in grouped, stacked or horizontal layouts, each with tooltips, keyboard reading and a table view.",
    secondary: ["stacked bar chart react", "horizontal bar chart react", "grouped bar chart"],
  },
  "/charts/donut-chart": {
    title: "Donut Chart for React with Center Label",
    description:
      "An animated React donut chart with a center total, hover and keyboard tooltips, a full legend and a table view. Color-blind-safe palette. Free, MIT.",
    keyword: "donut chart react",
    h1: "Donut Chart for React",
    intro: "An animated React donut chart with the total in the center, a full legend and keyboard-readable slices.",
    secondary: ["doughnut chart react", "donut chart with center label"],
  },
  "/charts/sparkline": {
    title: "Sparkline for React: Tiny Trend Charts",
    description:
      "A React sparkline for stat tiles and tables: a tiny animated trend line with a spoken summary for screen readers. Glass style, Tailwind CSS v4, free, MIT.",
    keyword: "sparkline react",
    h1: "Sparkline for React",
    intro:
      "A React sparkline is a tiny trend line for stat tiles and table cells, summarized in words for screen readers. Pass values as a readonly number[], oldest first.",
    secondary: ["mini line chart react", "sparkline tailwind"],
  },
};
