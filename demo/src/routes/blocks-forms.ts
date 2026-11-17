import { lazyPage, type Route } from "./shared";

const blocks = () => import("../pages/BlockPages");
const hubs = () => import("../pages/HubPages");

/** The "Blocks" routes of the docs site, in sidebar order. */
export const blocksFormsRoutes: Route[] = [
  { path: "/blocks", title: "All blocks", group: "Blocks", ...lazyPage(hubs, (m) => m.BlocksHubPage) },
  { path: "/blocks/glass-login", title: "Glass login", group: "Blocks", ...lazyPage(blocks, (m) => m.GlassLoginPage) },
  { path: "/blocks/lamp-login", title: "Lamp login", group: "Blocks", ...lazyPage(blocks, (m) => m.LampLoginPage) },
  {
    path: "/blocks/otp-verification",
    title: "OTP verification",
    group: "Blocks",
    ...lazyPage(blocks, (m) => m.OtpVerificationPage),
  },
  {
    path: "/blocks/payment-checkout",
    title: "Payment checkout",
    group: "Blocks",
    ...lazyPage(blocks, (m) => m.PaymentCheckoutPage),
  },
  {
    path: "/blocks/dashboard-stats",
    title: "Dashboard stats",
    group: "Blocks",
    ...lazyPage(blocks, (m) => m.DashboardStatsPage),
  },
];
