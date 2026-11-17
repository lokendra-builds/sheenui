import { ROUTE_EXPORTS } from "../generated/route-exports";

const pascal = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

/** How well an export name fits the page: the exact page name, then names that start or end with it, then the rest. */
function rank(name: string, main: string): number {
  if (name === main) return 0;
  if (!/^use[A-Z]/.test(name) && (name.startsWith(main) || name.endsWith(main))) return 1;
  if (/^use[A-Z]/.test(name)) return 4;
  if (/^[a-z]|^[A-Z0-9_]+$/.test(name)) return 5; // helpers, label objects, constants
  if (name.endsWith("Demo")) return 3;
  return 2;
}

/** Every public component and hook whose JSDoc `@see` names the page: what the site search matches (the chips show fewer). */
export function allExportsFor(path: string): readonly string[] {
  return (ROUTE_EXPORTS as Readonly<Record<string, readonly string[] | undefined>>)[path] ?? [];
}

/**
 * The public components and hooks a docs page covers, main one first: the export named like the page ("segmented-control"
 * -> `SegmentedControl`, "web-analytics" -> `WebAnalyticsDashboard`), then the other components, shortest first, and the
 * hooks last. A hub-like page (no export fits its name and many share it) lists none. Generated from the JSDoc `@see`
 * tags in theme/src.
 */
export function exportsFor(path: string): readonly string[] {
  const all = (ROUTE_EXPORTS as Readonly<Record<string, readonly string[] | undefined>>)[path];
  if (!all) return [];
  const main = pascal(path.split("/").pop() ?? "");
  const sorted = [...all].sort((a, b) => rank(a, main) - rank(b, main) || a.length - b.length || a.localeCompare(b));
  if (rank(sorted[0] ?? "", main) <= 1 || sorted.length <= 6) return sorted;
  // A page for a family without a page-named export ("dropdown-menu" -> Menu, MenuItem, ...): lead with the shared root name.
  const root = [...sorted]
    .filter((n) => !/^use[A-Z]/.test(n))
    .sort((a, b) => a.length - b.length)
    .find((n) => sorted.filter((o) => o.startsWith(n)).length >= Math.ceil(sorted.length / 2));
  if (!root) return []; // a hub-like gallery page (/charts, /foundations, /components): the search still finds every name
  return sorted.filter((n) => n.startsWith(root));
}
