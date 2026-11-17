import { lazyPage, type Route } from "./shared";

/** The "Chat" routes of the docs site, in sidebar order. */
export const chatRoutes: Route[] = [
  {
    path: "/chat/list",
    title: "Chat list",
    group: "Chat",
    ...lazyPage(
      () => import("../pages/ChatPages"),
      (m) => m.ChatListPage,
    ),
  },
  {
    path: "/chat/thread",
    title: "Chat view",
    group: "Chat",
    ...lazyPage(
      () => import("../pages/ChatPages"),
      (m) => m.ChatThreadPage,
    ),
  },
  {
    path: "/chat/widget",
    title: "Popover chat",
    group: "Chat",
    ...lazyPage(
      () => import("../pages/ChatPages"),
      (m) => m.ChatWidgetPage,
    ),
  },
];
