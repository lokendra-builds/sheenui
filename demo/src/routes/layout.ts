import { lazyPage, type Route } from "./shared";

const primitives = () => import("../pages/PrimitivePages");
const tableSidebar = () => import("../pages/TableSidebarPages");
const guideDocs = () => import("../pages/GuideDocsPages");

/** The "Layout" routes of the docs site, in sidebar order. */
export const layoutRoutes: Route[] = [
  {
    path: "/layout/accordion",
    title: "Accordion",
    group: "Layout",
    ...lazyPage(
      () => import("../pages/LayoutPages"),
      (m) => m.AccordionPage,
    ),
  },
  {
    path: "/layout/aspect-ratio",
    title: "Aspect ratio",
    group: "Layout",
    ...lazyPage(tableSidebar, (m) => m.AspectRatioPage),
  },
  {
    path: "/layout/breadcrumb",
    title: "Breadcrumb",
    group: "Layout",
    ...lazyPage(
      () => import("../pages/LayoutPages"),
      (m) => m.BreadcrumbPage,
    ),
  },
  {
    path: "/layout/collapsible",
    title: "Collapsible",
    group: "Layout",
    ...lazyPage(primitives, (m) => m.CollapsiblePage),
  },
  { path: "/layout/pagination", title: "Pagination", group: "Layout", ...lazyPage(guideDocs, (m) => m.PaginationPage) },
  {
    path: "/layout/resizable",
    title: "Resizable panels",
    group: "Layout",
    ...lazyPage(tableSidebar, (m) => m.ResizablePage),
  },
  {
    path: "/layout/scroll-area",
    title: "Scroll area",
    group: "Layout",
    ...lazyPage(
      () => import("../pages/TimelineScrollPages"),
      (m) => m.ScrollAreaPage,
    ),
  },
  {
    path: "/layout/separator",
    title: "Separator",
    group: "Layout",
    ...lazyPage(
      () => import("../pages/TimelineScrollPages"),
      (m) => m.SeparatorPage,
    ),
  },
  {
    path: "/layout/stepper",
    title: "Stepper",
    group: "Layout",
    ...lazyPage(
      () => import("../pages/LayoutPages"),
      (m) => m.StepperPage,
    ),
  },
  {
    path: "/layout/timeline",
    title: "Timeline",
    group: "Layout",
    ...lazyPage(
      () => import("../pages/TimelineScrollPages"),
      (m) => m.TimelinePage,
    ),
  },
  {
    path: "/layout/toolbar",
    title: "Toolbar",
    group: "Layout",
    ...lazyPage(
      () => import("../pages/TimelineScrollPages"),
      (m) => m.ToolbarPage,
    ),
  },
];
