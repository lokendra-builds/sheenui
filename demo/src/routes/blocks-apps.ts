import { lazyPage, type Route } from "./shared";

/** The "Blocks" routes of the docs site, in sidebar order. */
export const blocksAppsRoutes: Route[] = [
  {
    path: "/blocks/ai-chat",
    title: "AI chat",
    group: "Blocks",
    ...lazyPage(
      () => import("../pages/BlockPricingChatPages"),
      (m) => m.AiChatPage,
    ),
  },
  {
    path: "/blocks/signup-page",
    title: "Sign-up page",
    group: "Blocks",
    ...lazyPage(
      () => import("../pages/BlockAccountPages"),
      (m) => m.AuthSplitPage,
    ),
  },
  {
    path: "/blocks/bento-grid",
    title: "Bento grid",
    group: "Blocks",
    ...lazyPage(
      () => import("../pages/BlockPricingChatPages"),
      (m) => m.BentoGridPage,
    ),
  },
  {
    path: "/blocks/chat-app",
    title: "Chat app",
    group: "Blocks",
    ...lazyPage(
      () => import("../pages/ChatPages"),
      (m) => m.ChatAppPage,
    ),
  },
  {
    path: "/blocks/notification-center",
    title: "Notification center",
    group: "Blocks",
    ...lazyPage(
      () => import("../pages/BlockAccountPages"),
      (m) => m.NotificationCenterPage,
    ),
  },
  {
    path: "/blocks/pricing",
    title: "Pricing",
    group: "Blocks",
    ...lazyPage(
      () => import("../pages/BlockPricingChatPages"),
      (m) => m.PricingPage,
    ),
  },
  {
    path: "/blocks/settings-page",
    title: "Settings page",
    group: "Blocks",
    ...lazyPage(
      () => import("../pages/BlockAccountPages"),
      (m) => m.SettingsBlockPage,
    ),
  },
];
