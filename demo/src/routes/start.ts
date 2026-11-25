import { lazyPage, type Route } from "./shared";

const hubs = () => import("../pages/HubPages");
const guideDocs = () => import("../pages/GuideDocsPages");
const rtlDocs = () => import("../pages/RtlDocsPage");
const performanceDocs = () => import("../pages/PerformanceDocsPage");
const aboutDocs = () => import("../pages/AboutPage");

/** The "Start" routes of the docs site, in sidebar order. */
export const startRoutes: Route[] = [
  {
    path: "/",
    title: "Introduction",
    group: "Start",
    ...lazyPage(
      () => import("../pages/HomePage"),
      (m) => m.HomePage,
    ),
  },
  {
    path: "/foundations",
    title: "Foundations",
    group: "Start",
    ...lazyPage(
      () => import("../pages/FoundationsPage"),
      (m) => m.FoundationsPage,
    ),
  },
  {
    path: "/showcase",
    title: "Showcase",
    group: "Start",
    ...lazyPage(
      () => import("../pages/StoriesPage"),
      (m) => m.StoriesPage,
    ),
  },

  { path: "/docs/installation", title: "Installation", group: "Start", ...lazyPage(hubs, (m) => m.InstallationPage) },
  {
    path: "/docs/forms",
    title: "Forms recipe",
    group: "Start",
    ...lazyPage(
      () => import("../pages/FormsRecipePage"),
      (m) => m.FormsRecipePage,
    ),
  },

  {
    path: "/docs/tailwind-v4",
    title: "Tailwind CSS v4 setup",
    group: "Start",
    ...lazyPage(guideDocs, (m) => m.TailwindV4DocsPage),
  },
  { path: "/docs/dark-mode", title: "Dark mode", group: "Start", ...lazyPage(guideDocs, (m) => m.DarkModeDocsPage) },
  { path: "/docs/base-ui", title: "Built on Base UI", group: "Start", ...lazyPage(guideDocs, (m) => m.BaseUiDocsPage) },
  {
    path: "/docs/rtl",
    title: "Right-to-left and localisation",
    group: "Start",
    ...lazyPage(rtlDocs, (m) => m.RtlDocsPage),
  },
  {
    path: "/docs/performance",
    title: "Performance",
    group: "Start",
    ...lazyPage(performanceDocs, (m) => m.PerformanceDocsPage),
  },
  { path: "/about", title: "About SheenUI", group: "Start", ...lazyPage(aboutDocs, (m) => m.AboutPage) },
];
