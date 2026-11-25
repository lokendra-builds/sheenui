import { lazyPage, type Route } from "./shared";

const hubs = () => import("../pages/HubPages");

/** The "Dashboards" routes of the docs site, in sidebar order. */
export const dashboardsRoutes: Route[] = [
  { path: "/dashboards", title: "All dashboards", group: "Dashboards", ...lazyPage(hubs, (m) => m.DashboardsHubPage) },
  {
    path: "/dashboards/web-analytics",
    title: "Web analytics",
    group: "Dashboards",
    ...lazyPage(
      () => import("../pages/WebSaasEcommerceDashboardPages"),
      (m) => m.WebAnalyticsPage,
    ),
  },
  {
    path: "/dashboards/saas",
    title: "SaaS revenue",
    group: "Dashboards",
    ...lazyPage(
      () => import("../pages/WebSaasEcommerceDashboardPages"),
      (m) => m.SaasRevenuePage,
    ),
  },
  {
    path: "/dashboards/ecommerce",
    title: "E-commerce",
    group: "Dashboards",
    ...lazyPage(
      () => import("../pages/WebSaasEcommerceDashboardPages"),
      (m) => m.EcommercePage,
    ),
  },
  {
    path: "/dashboards/product",
    title: "Product analytics",
    group: "Dashboards",
    ...lazyPage(
      () => import("../pages/ProductFinanceDashboardPages"),
      (m) => m.ProductDashboardPage,
    ),
  },
  {
    path: "/dashboards/crypto-dashboard",
    title: "Crypto dashboard",
    group: "Dashboards",
    ...lazyPage(
      () => import("../pages/ProductFinanceDashboardPages"),
      (m) => m.FinanceDashboardPage,
    ),
  },
];
