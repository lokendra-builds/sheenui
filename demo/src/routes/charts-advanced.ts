import { lazyPage, type Route } from "./shared";

const chartsStackedPie = () => import("../pages/ChartsStackedPiePages");
const chartsHeatmapFunnel = () => import("../pages/ChartsHeatmapFunnelPages");
const chartsTreemapWaterfall = () => import("../pages/ChartsTreemapWaterfallPages");
const chartsRadial = () => import("../pages/ChartsRadialPages");
const chartsStepRange = () => import("../pages/ChartsStepRangePages");
const chartsDistribution = () => import("../pages/ChartsDistributionPages");
const chartsComparison = () => import("../pages/ChartsComparisonPages");
const chartsProgress = () => import("../pages/ChartsProgressPages");
const chartsTimeSeries = () => import("../pages/ChartsTimeSeriesPages");
const chartsFlow = () => import("../pages/ChartsFlowPages");
const chartsWorldMap = () => import("../pages/WorldMapPage");
const chartsCohort = () => import("../pages/CohortChartPage");
const chartsGantt = () => import("../pages/GanttChartPage");
const chartsRankingInterval = () => import("../pages/ChartsRankingIntervalPages");

/** The "Charts" routes of the docs site, in sidebar order. */
export const chartsAdvancedRoutes: Route[] = [
  {
    path: "/charts/percent-stacked-bar-chart",
    title: "100% stacked bars",
    group: "Charts",
    ...lazyPage(chartsStackedPie, (m) => m.PercentBarChartPage),
  },
  {
    path: "/charts/bar-list",
    title: "Bar list",
    group: "Charts",
    ...lazyPage(chartsTreemapWaterfall, (m) => m.BarListPage),
  },
  {
    path: "/charts/beeswarm",
    title: "Beeswarm",
    group: "Charts",
    ...lazyPage(chartsComparison, (m) => m.BeeswarmPage),
  },
  {
    path: "/charts/box-plot",
    title: "Box plot & violin",
    group: "Charts",
    ...lazyPage(chartsDistribution, (m) => m.BoxPlotPage),
  },
  {
    path: "/charts/bullet-chart",
    title: "Bullet chart",
    group: "Charts",
    ...lazyPage(chartsRadial, (m) => m.BulletChartPage),
  },
  {
    path: "/charts/calendar-heatmap",
    title: "Calendar heatmap",
    group: "Charts",
    ...lazyPage(chartsHeatmapFunnel, (m) => m.CalendarHeatmapPage),
  },
  {
    path: "/charts/candlestick",
    title: "Candlestick chart",
    group: "Charts",
    ...lazyPage(chartsTimeSeries, (m) => m.CandlestickChartPage),
  },
  {
    path: "/charts/category-bar",
    title: "Category bar",
    group: "Charts",
    ...lazyPage(chartsProgress, (m) => m.CategoryBarPage),
  },
  {
    path: "/charts/chord-diagram",
    title: "Chord diagram",
    group: "Charts",
    ...lazyPage(chartsFlow, (m) => m.ChordDiagramPage),
  },
  {
    path: "/charts/cohort-retention",
    title: "Cohort retention",
    group: "Charts",
    ...lazyPage(chartsCohort, (m) => m.CohortChartPage),
  },
  {
    path: "/charts/combo-chart",
    title: "Combo chart",
    group: "Charts",
    ...lazyPage(
      () => import("../pages/ChartsComboScatterPages"),
      (m) => m.ComboChartPage,
    ),
  },
  {
    path: "/charts/diverging-bar",
    title: "Diverging bar chart",
    group: "Charts",
    ...lazyPage(chartsComparison, (m) => m.DivergingBarChartPage),
  },
  {
    path: "/charts/bump-chart",
    title: "Bump chart",
    group: "Charts",
    ...lazyPage(chartsRankingInterval, (m) => m.BumpChartPage),
  },
  {
    path: "/charts/error-bar-chart",
    title: "Error bars",
    group: "Charts",
    ...lazyPage(chartsRankingInterval, (m) => m.ErrorBarChartPage),
  },
  {
    path: "/charts/population-pyramid",
    title: "Population pyramid",
    group: "Charts",
    ...lazyPage(chartsRankingInterval, (m) => m.PopulationPyramidPage),
  },
  {
    path: "/charts/dumbbell",
    title: "Dumbbell & slope chart",
    group: "Charts",
    ...lazyPage(chartsComparison, (m) => m.DumbbellChartPage),
  },
  {
    path: "/charts/funnel-chart",
    title: "Funnel chart",
    group: "Charts",
    ...lazyPage(chartsHeatmapFunnel, (m) => m.FunnelChartPage),
  },
  {
    path: "/charts/gantt",
    title: "Gantt chart",
    group: "Charts",
    ...lazyPage(chartsGantt, (m) => m.GanttChartPage),
  },
  {
    path: "/charts/gauge-chart",
    title: "Gauge",
    group: "Charts",
    ...lazyPage(chartsDistribution, (m) => m.GaugeChartPage),
  },
  {
    path: "/charts/heatmap",
    title: "Heatmap",
    group: "Charts",
    ...lazyPage(chartsHeatmapFunnel, (m) => m.HeatmapPage),
  },
  {
    path: "/charts/histogram",
    title: "Histogram",
    group: "Charts",
    ...lazyPage(chartsDistribution, (m) => m.HistogramPage),
  },
  {
    path: "/charts/lollipop",
    title: "Lollipop chart",
    group: "Charts",
    ...lazyPage(chartsDistribution, (m) => m.LollipopChartPage),
  },
  {
    path: "/charts/marimekko",
    title: "Marimekko chart",
    group: "Charts",
    ...lazyPage(chartsFlow, (m) => m.MarimekkoChartPage),
  },
  {
    path: "/charts/network-graph",
    title: "Network graph",
    group: "Charts",
    ...lazyPage(chartsFlow, (m) => m.NetworkGraphPage),
  },
  {
    path: "/charts/pie-chart",
    title: "Pie chart",
    group: "Charts",
    ...lazyPage(chartsStackedPie, (m) => m.PieChartPage),
  },
  {
    path: "/charts/polar-area",
    title: "Polar area chart",
    group: "Charts",
    ...lazyPage(
      () => import("../pages/ChartsRidgelinePolarPages"),
      (m) => m.PolarAreaChartPage,
    ),
  },
  {
    path: "/charts/radar-chart",
    title: "Radar chart",
    group: "Charts",
    ...lazyPage(chartsRadial, (m) => m.RadarChartPage),
  },
  {
    path: "/charts/radial-bar-chart",
    title: "Radial bar chart",
    group: "Charts",
    ...lazyPage(chartsRadial, (m) => m.RadialBarChartPage),
  },
  {
    path: "/charts/range-area-chart",
    title: "Range area chart",
    group: "Charts",
    ...lazyPage(chartsStepRange, (m) => m.RangeAreaChartPage),
  },
  {
    path: "/charts/ridgeline",
    title: "Ridgeline chart",
    group: "Charts",
    ...lazyPage(
      () => import("../pages/ChartsRidgelinePolarPages"),
      (m) => m.RidgelineChartPage,
    ),
  },
  {
    path: "/charts/sankey-diagram",
    title: "Sankey diagram",
    group: "Charts",
    ...lazyPage(chartsFlow, (m) => m.SankeyChartPage),
  },
  {
    path: "/charts/scatter-plot",
    title: "Scatter & bubble chart",
    group: "Charts",
    ...lazyPage(
      () => import("../pages/ChartsComboScatterPages"),
      (m) => m.ScatterChartPage,
    ),
  },
  {
    path: "/charts/sparkbar",
    title: "Sparkbar",
    group: "Charts",
    ...lazyPage(chartsStepRange, (m) => m.SparkbarPage),
  },
  {
    path: "/charts/stacked-area-chart",
    title: "Stacked area chart",
    group: "Charts",
    ...lazyPage(chartsStackedPie, (m) => m.StackedAreaChartPage),
  },
  {
    path: "/charts/step-line-chart",
    title: "Step line chart",
    group: "Charts",
    ...lazyPage(chartsStepRange, (m) => m.StepLineChartPage),
  },
  {
    path: "/charts/streamgraph",
    title: "Streamgraph",
    group: "Charts",
    ...lazyPage(chartsTimeSeries, (m) => m.StreamgraphPage),
  },
  {
    path: "/charts/realtime-chart",
    title: "Real-time chart",
    group: "Charts",
    ...lazyPage(chartsTimeSeries, (m) => m.StreamingChartPage),
  },
  {
    path: "/charts/sunburst",
    title: "Sunburst chart",
    group: "Charts",
    ...lazyPage(chartsFlow, (m) => m.SunburstChartPage),
  },
  {
    path: "/charts/uptime-tracker",
    title: "Uptime tracker",
    group: "Charts",
    ...lazyPage(chartsProgress, (m) => m.TrackerChartPage),
  },
  {
    path: "/charts/treemap",
    title: "Treemap",
    group: "Charts",
    ...lazyPage(chartsTreemapWaterfall, (m) => m.TreemapPage),
  },
  {
    path: "/charts/waffle",
    title: "Waffle chart",
    group: "Charts",
    ...lazyPage(chartsProgress, (m) => m.WaffleChartPage),
  },
  {
    path: "/charts/waterfall-chart",
    title: "Waterfall chart",
    group: "Charts",
    ...lazyPage(chartsTreemapWaterfall, (m) => m.WaterfallChartPage),
  },
  {
    path: "/charts/world-map",
    title: "World map",
    group: "Charts",
    ...lazyPage(chartsWorldMap, (m) => m.WorldMapPage),
  },
];
