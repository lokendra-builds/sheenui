import { guidesFor, type GuideInfo } from "../guides";
import type { Route } from "../routes";
import { seoRow } from "./head";
import { HUBS, hubChildren, hubOf } from "./hubs";

/**
 * Hand-picked links between pages that are used together or replace one another, across sidebar
 * groups. The rest of a page's "Related" list is filled from its own group (see `relatedFor`).
 */
const EXTRA: Record<string, string[] | undefined> = {
  "/showcase": ["/components/button", "/effects", "/blocks/lamp-login"],
  "/foundations": ["/components/glass-card", "/effects/liquid-glass", "/docs/installation"],
  "/docs/base-ui": ["/guides/base-ui-vs-radix", "/components/dialog", "/components/tabs"],
  "/docs/tailwind-v4": ["/foundations", "/docs/dark-mode", "/docs/installation"],
  "/docs/dark-mode": ["/docs/tailwind-v4", "/foundations", "/guides/accessible-glassmorphism"],
  "/docs/rtl": ["/forms/date-picker", "/forms/calendar", "/charts/world-map"],
  "/layout/pagination": ["/components/data-table", "/components/skeleton"],
  "/docs/installation": ["/docs/tailwind-v4", "/foundations", "/components/button", "/components/glass-card"],
  "/components/button": ["/effects/border-beam", "/overlays/dropdown-menu"],
  "/components/glass-card": ["/effects/spotlight-card", "/effects/liquid-glass", "/effects/3d-tilt-card"],
  "/components/dialog": ["/effects/morphing-dialog", "/overlays/alert-dialog", "/overlays/drawer"],
  "/components/input": ["/forms/textarea", "/forms/number-field", "/blocks/glass-login"],
  "/components/otp-input": ["/blocks/otp-verification", "/forms/number-field"],
  "/components/data-table": ["/charts", "/dashboards/saas"],
  "/components/tabs": ["/forms/segmented-control", "/navigation/navbar"],
  "/components/toast": ["/overlays/alert-dialog", "/blocks/notification-center"],
  "/components/progress": ["/components/meter", "/charts/bullet-chart"],
  "/components/button-group": ["/components/button", "/forms/segmented-control", "/layout/toolbar"],
  "/navigation/sidebar": ["/navigation/vertical-nav", "/layout/collapsible", "/navigation/navigation-menu"],
  "/components/table": ["/components/data-table", "/layout/scroll-area"],
  "/layout/aspect-ratio": ["/components/avatar", "/components/skeleton", "/components/carousel"],
  "/layout/resizable": ["/layout/scroll-area", "/navigation/sidebar", "/layout/accordion"],
  "/forms/input-group": ["/components/input", "/forms/number-field", "/forms/field"],
  "/components/alert": ["/components/toast", "/overlays/alert-dialog", "/forms/field"],
  "/components/spinner": ["/components/progress", "/components/skeleton", "/components/button"],
  "/forms/field": ["/components/input", "/components/select", "/forms/textarea"],
  "/layout/collapsible": ["/layout/accordion", "/components/popover"],
  "/navigation/navigation-menu": ["/navigation/navbar", "/navigation/vertical-nav", "/overlays/dropdown-menu"],
  "/components/select": ["/components/combobox", "/forms/radio-group"],
  "/components/combobox": ["/components/select", "/forms/tags-input"],
  "/components/switch": ["/forms/toggle", "/components/checkbox"],
  "/effects/liquid-glass": ["/components/glass-card", "/foundations"],
  "/effects/macos-dock": ["/navigation/navbar"],
  "/effects/number-ticker": ["/blocks/dashboard-stats", "/charts/sparkbar"],
  "/blocks/glass-login": ["/components/input", "/components/button", "/blocks/signup-page"],
  "/blocks/signup-page": ["/blocks/glass-login", "/components/input"],
  "/blocks/lamp-login": ["/blocks/glass-login", "/components/input"],
  "/blocks/otp-verification": ["/components/otp-input"],
  "/blocks/payment-checkout": ["/components/input", "/forms/radio-group"],
  "/blocks/dashboard-stats": ["/charts/sparkbar", "/dashboards/web-analytics", "/effects/number-ticker"],
  "/blocks/ai-chat": ["/chat/thread", "/components/code-block"],
  "/blocks/chat-app": ["/chat/list", "/chat/thread", "/chat/widget"],
  "/blocks/pricing": ["/components/switch", "/components/badge"],
  "/blocks/hero-section": ["/blocks/feature-grid", "/blocks/testimonials", "/components/button"],
  "/blocks/feature-grid": ["/blocks/hero-section", "/blocks/bento-grid", "/components/glass-card"],
  "/blocks/testimonials": ["/blocks/faq-section", "/effects/marquee", "/blocks/pricing"],
  "/blocks/faq-section": ["/layout/accordion", "/blocks/pricing", "/blocks/contact-form"],
  "/blocks/contact-form": ["/forms/textarea", "/components/input", "/blocks/faq-section"],
  "/blocks/site-footer": ["/blocks/hero-section", "/components/input", "/navigation/navbar"],
  "/blocks/not-found-page": ["/components/empty-state", "/components/input", "/blocks/site-footer"],
  "/blocks/announcement-banner": ["/components/alert", "/components/toast", "/blocks/hero-section"],
  "/blocks/settings-page": ["/components/switch", "/forms/textarea"],
  "/blocks/notification-center": ["/components/toast", "/components/badge"],
  "/blocks/bento-grid": ["/components/glass-card", "/effects/spotlight-card"],
  "/dashboards/web-analytics": ["/charts", "/charts/heatmap", "/blocks/dashboard-stats"],
  "/dashboards/saas": ["/charts/waterfall-chart", "/charts/funnel-chart", "/components/data-table"],
  "/dashboards/ecommerce": ["/charts/treemap", "/charts/funnel-chart"],
  "/dashboards/product": ["/charts/cohort-retention", "/charts/funnel-chart"],
  "/dashboards/crypto-dashboard": ["/charts/candlestick", "/charts/realtime-chart"],
  "/charts/line-chart": [
    "/charts/area-chart",
    "/charts/step-line-chart",
    "/charts/realtime-chart",
    "/charts/sparkline",
  ],
  "/charts/area-chart": ["/charts/line-chart", "/charts/stacked-area-chart", "/charts/range-area-chart"],
  "/charts/bar-chart": [
    "/charts/bar-list",
    "/charts/category-bar",
    "/charts/diverging-bar",
    "/charts/percent-stacked-bar-chart",
  ],
  "/charts/donut-chart": ["/charts/pie-chart", "/charts/radial-bar-chart", "/charts/gauge-chart"],
  "/charts/sparkline": ["/charts/sparkbar", "/charts/line-chart", "/dashboards/web-analytics"],
  "/navigation/navbar": ["/navigation/vertical-nav", "/overlays/menubar", "/effects/macos-dock"],
  "/navigation/vertical-nav": ["/navigation/navbar", "/overlays/side-drawer", "/layout/accordion"],
  "/overlays/command-palette": ["/overlays/dropdown-menu", "/overlays/kbd"],
};

const MAX_RELATED = 6;

/**
 * The pages worth linking from `path`: the hand-picked ones first, then the next pages of its own
 * sidebar group (a ring, so every page of a group is linked from three others). Hubs and guides
 * have their own lists and return none here.
 */
export function relatedFor(routes: readonly Route[], path: string): Route[] {
  const route = routes.find((r) => r.path === path);
  if (!route || route.hidden || HUBS[path] || route.group === "Guides") return [];
  const picked: Route[] = [];
  const add = (r: Route | undefined) => {
    if (r && r.path !== path && !r.hidden && !HUBS[r.path] && !picked.includes(r)) picked.push(r);
  };
  for (const p of EXTRA[path] ?? []) add(routes.find((r) => r.path === p));
  const same = routes.filter((r) => r.group === route.group && !r.hidden && !HUBS[r.path]);
  const at = same.indexOf(route);
  for (let step = 1; step < same.length && picked.length < MAX_RELATED; step++) add(same[(at + step) % same.length]);
  return picked.slice(0, MAX_RELATED);
}

/** The guides that cover a page (`guides.ts`), for the "Guides" part of the Related section. */
export function guidesOf(path: string): GuideInfo[] {
  return guidesFor(path);
}

/** Link text for a route: its plain sidebar name ("Border beam"). The keyword H1s live in the title and meta, not in link text. */
export function labelFor(routes: readonly Route[], path: string): string {
  return routes.find((r) => r.path === path)?.title ?? seoRow(path)?.h1 ?? path;
}

/**
 * Every route whose label a page renders as a link text (related pages, the hub, a hub's children),
 * so the prerender can inline those H1s next to the page's own row and the client's first render
 * matches the server HTML without loading the whole keyword map.
 */
export function linkTargets(routes: readonly Route[], path: string): string[] {
  const route = routes.find((r) => r.path === path);
  if (!route) return [];
  const out = new Set<string>(relatedFor(routes, path).map((r) => r.path));
  if (HUBS[path]) for (const r of hubChildren(routes, path)) out.add(r.path);
  const hub = hubOf(route);
  if (hub) out.add(hub);
  out.delete(path);
  return [...out];
}
