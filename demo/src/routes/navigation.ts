import { lazyPage, type Route } from "./shared";

const primitives = () => import("../pages/PrimitivePages");
const tableSidebar = () => import("../pages/TableSidebarPages");

/** The "Navigation" routes of the docs site, in sidebar order. */
export const navigationRoutes: Route[] = [
  {
    path: "/navigation/navbar",
    title: "Navbar",
    group: "Navigation",
    ...lazyPage(
      () => import("../pages/NavbarPage"),
      (m) => m.NavbarPage,
    ),
  },
  {
    path: "/navigation/navigation-menu",
    title: "Navigation menu",
    group: "Navigation",
    ...lazyPage(primitives, (m) => m.NavigationMenuPage),
  },
  {
    path: "/navigation/sidebar",
    title: "Sidebar",
    group: "Navigation",
    ...lazyPage(tableSidebar, (m) => m.SidebarPage),
  },
  {
    path: "/navigation/vertical-nav",
    title: "Vertical nav",
    group: "Navigation",
    ...lazyPage(
      () => import("../pages/VerticalNavPage"),
      (m) => m.VerticalNavPage,
    ),
  },
];
