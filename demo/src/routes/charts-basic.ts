import { lazyPage, type Route } from "./shared";

const chartCore = () => import("../pages/ChartCorePages");

/** The "Charts" routes of the docs site, in sidebar order. */
export const chartsBasicRoutes: Route[] = [
  {
    path: "/charts",
    title: "Charts",
    group: "Charts",
    ...lazyPage(
      () => import("../pages/ChartsPage"),
      (m) => m.ChartsPage,
    ),
  },
  { path: "/charts/line-chart", title: "Line chart", group: "Charts", ...lazyPage(chartCore, (m) => m.LineChartPage) },
  { path: "/charts/area-chart", title: "Area chart", group: "Charts", ...lazyPage(chartCore, (m) => m.AreaChartPage) },
  { path: "/charts/bar-chart", title: "Bar chart", group: "Charts", ...lazyPage(chartCore, (m) => m.BarChartPage) },
  {
    path: "/charts/donut-chart",
    title: "Donut chart",
    group: "Charts",
    ...lazyPage(chartCore, (m) => m.DonutChartPage),
  },
  { path: "/charts/sparkline", title: "Sparkline", group: "Charts", ...lazyPage(chartCore, (m) => m.SparklinePage) },
  {
    path: "/charts/edge-cases",
    title: "Chart edge cases",
    group: "Charts",
    hidden: true,
    ...lazyPage(
      () => import("../pages/ChartEdgeCasesPage"),
      (m) => m.ChartEdgeCasesPage,
    ),
  },
];
