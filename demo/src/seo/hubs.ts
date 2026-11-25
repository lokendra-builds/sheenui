import type { Route } from "../routes";

/**
 * The hub pages (/components, /effects, /blocks, /dashboards, /charts, /guides): each lists every page
 * of the sidebar groups it owns. Breadcrumbs, the hub JSON-LD (CollectionPage + ItemList) and the
 * "Related" links all derive from this one table.
 */
export const HUBS: Record<string, { name: string; groups: readonly string[] } | undefined> = {
  "/components": {
    name: "Components",
    groups: ["Components", "Forms", "Overlays", "Navigation", "Layout", "Data display", "Chat"],
  },
  "/effects": { name: "Effects", groups: ["Effects"] },
  "/blocks": { name: "Blocks", groups: ["Blocks"] },
  "/dashboards": { name: "Dashboards", groups: ["Dashboards"] },
  "/charts": { name: "Charts", groups: ["Charts"] },
  "/guides": { name: "Guides", groups: ["Guides"] },
};

/** The hub path a page belongs to ("/forms/date-picker" → "/components"), or undefined for hubs and loose pages. */
export function hubOf(route: { path: string; group: string }): string | undefined {
  if (HUBS[route.path]) return undefined;
  return Object.keys(HUBS).find((hub) => HUBS[hub]?.groups.includes(route.group));
}

/** The public pages a hub lists, in sidebar order (the hub itself and hidden test pages excluded). */
export function hubChildren(routes: readonly Route[], hub: string): Route[] {
  const groups = HUBS[hub]?.groups ?? [];
  return routes.filter((r) => r.path !== hub && !r.hidden && groups.includes(r.group));
}
