import { routes } from "../routes";
import { hubChildren } from "./hubs";

const inHub = (hub: string) => hubChildren(routes, hub).length;

/**
 * The one source of the page counts the site quotes (home, hubs, titles, llms.txt, README). Every number is derived from
 * the route table and the hub table, so adding a page changes all of them at once. "components" is the /components hub
 * plus the /effects pages (the components, hooks and effects an app can import); the registry item count is not here
 * because it is a build artefact (registry.json), and llms.txt computes it from there.
 */
export const COUNTS = {
  /** Pages under the /components hub. */
  ui: inHub("/components"),
  /** Pages under /effects. */
  effects: inHub("/effects"),
  /** Component pages: UI plus effects. */
  components: inHub("/components") + inHub("/effects"),
  charts: inHub("/charts"),
  blocks: inHub("/blocks"),
  dashboards: inHub("/dashboards"),
  guides: inHub("/guides"),
} as const;
