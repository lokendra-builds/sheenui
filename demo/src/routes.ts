import { groups, type Route } from "./routes/shared";
import { ensureRouteCss } from "./route-css";
import { startRoutes } from "./routes/start";
import { componentsRoutes } from "./routes/components";
import { navigationRoutes } from "./routes/navigation";
import { chartsBasicRoutes } from "./routes/charts-basic";
import { blocksFormsRoutes } from "./routes/blocks-forms";
import { formsRoutes } from "./routes/forms";
import { overlaysRoutes } from "./routes/overlays";
import { layoutRoutes } from "./routes/layout";
import { dataDisplayRoutes } from "./routes/data-display";
import { chatRoutes } from "./routes/chat";
import { chartsAdvancedRoutes } from "./routes/charts-advanced";
import { effectsRoutes } from "./routes/effects";
import { blocksAppsRoutes } from "./routes/blocks-apps";
import { blocksMarketingRoutes } from "./routes/blocks-marketing";
import { dashboardsRoutes } from "./routes/dashboards";
import { guidesRoutes } from "./routes/guides";

export { groups, type Route };

/**
 * The route table: the per-group tables in `routes/`, in sidebar order. Each one holds a lazy page per route,
 * keyed by path, title and group (the groups' order is `groups`).
 */
export const routes: Route[] = [
  ...startRoutes,
  ...componentsRoutes,
  ...navigationRoutes,
  ...chartsBasicRoutes,
  ...blocksFormsRoutes,
  ...formsRoutes,
  ...overlaysRoutes,
  ...layoutRoutes,
  ...dataDisplayRoutes,
  ...chatRoutes,
  ...chartsAdvancedRoutes,
  ...effectsRoutes,
  ...blocksAppsRoutes,
  ...blocksMarketingRoutes,
  ...dashboardsRoutes,
  ...guidesRoutes,
].map(
  // Hovering or focusing a link also fetches the page's stylesheets (src/route-css.ts), so the navigation does not wait for them.
  (route): Route => ({
    ...route,
    preload: () => {
      void ensureRouteCss(route.path);
      return route.preload();
    },
  }),
);

export function findRoute(path: string): Route {
  const found = routes.find((r) => r.path === path) ?? routes[0];
  if (!found) throw new Error("findRoute: the route table is empty");
  return found;
}
