import { lazyPage, type Route } from "./shared";

const tableSidebar = () => import("../pages/TableSidebarPages");

/** The "Data display" routes of the docs site, in sidebar order. */
export const dataDisplayRoutes: Route[] = [
  {
    path: "/components/carousel",
    title: "Carousel",
    group: "Data display",
    ...lazyPage(
      () => import("../pages/CarouselMeterPages"),
      (m) => m.CarouselPage,
    ),
  },
  {
    path: "/components/code-block",
    title: "Code block",
    group: "Data display",
    ...lazyPage(
      () => import("../pages/DisplayKitPages"),
      (m) => m.CodeBlockPage,
    ),
  },
  {
    path: "/components/empty-state",
    title: "Empty state",
    group: "Data display",
    ...lazyPage(
      () => import("../pages/DisplayKitPages"),
      (m) => m.EmptyStatePage,
    ),
  },
  {
    path: "/components/meter",
    title: "Meter",
    group: "Data display",
    ...lazyPage(
      () => import("../pages/CarouselMeterPages"),
      (m) => m.MeterPage,
    ),
  },
  {
    path: "/components/table",
    title: "Table",
    group: "Data display",
    ...lazyPage(tableSidebar, (m) => m.TablePage),
  },
  {
    path: "/components/skeleton",
    title: "Skeleton",
    group: "Data display",
    ...lazyPage(
      () => import("../pages/DisplayKitPages"),
      (m) => m.SkeletonPage,
    ),
  },
];
