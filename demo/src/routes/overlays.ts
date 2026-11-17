import { lazyPage, type Route } from "./shared";

/** The "Overlays" routes of the docs site, in sidebar order. */
export const overlaysRoutes: Route[] = [
  {
    path: "/overlays/alert-dialog",
    title: "Alert dialog",
    group: "Overlays",
    ...lazyPage(
      () => import("../pages/OverlayKitPages"),
      (m) => m.AlertDialogPage,
    ),
  },
  {
    path: "/overlays/command-palette",
    title: "Command palette (⌘K)",
    group: "Overlays",
    ...lazyPage(
      () => import("../pages/ContextMenuPages"),
      (m) => m.CommandPalettePage,
    ),
  },
  {
    path: "/overlays/context-menu",
    title: "Context menu",
    group: "Overlays",
    ...lazyPage(
      () => import("../pages/ContextMenuPages"),
      (m) => m.ContextMenuPage,
    ),
  },
  {
    path: "/overlays/drawer",
    title: "Drawer / Sheet",
    group: "Overlays",
    ...lazyPage(
      () => import("../pages/OverlayKitPages"),
      (m) => m.DrawerPage,
    ),
  },
  {
    path: "/overlays/dropdown-menu",
    title: "Dropdown menu",
    group: "Overlays",
    ...lazyPage(
      () => import("../pages/MenuPages"),
      (m) => m.DropdownMenuPage,
    ),
  },
  {
    path: "/overlays/hover-card",
    title: "Hover card",
    group: "Overlays",
    ...lazyPage(
      () => import("../pages/OverlayKitPages"),
      (m) => m.HoverCardPage,
    ),
  },
  {
    path: "/overlays/kbd",
    title: "Kbd",
    group: "Overlays",
    ...lazyPage(
      () => import("../pages/MenuPages"),
      (m) => m.KbdPage,
    ),
  },
  {
    path: "/overlays/menubar",
    title: "Menubar",
    group: "Overlays",
    ...lazyPage(
      () => import("../pages/ContextMenuPages"),
      (m) => m.MenubarPage,
    ),
  },
  {
    path: "/overlays/side-drawer",
    title: "Side drawer",
    group: "Overlays",
    ...lazyPage(
      () => import("../pages/SideDrawerPage"),
      (m) => m.SideDrawerPage,
    ),
  },
];
