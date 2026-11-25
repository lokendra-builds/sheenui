import { lazy } from "react";

import type { Route } from "../routes";

/** Loaded on demand: the 404 body pulls in the docs Page layout, which no other first-load route needs. */
const load = () => import("./NotFoundContent");
let promise: ReturnType<typeof load> | undefined;
const preload = () => (promise ??= load());

/** Routable like the others, but never in the nav, never indexed and never in the sitemap. */
export const notFoundRoute: Route = {
  path: "/404",
  title: "Page not found",
  group: "Start",
  hidden: true,
  page: lazy(() => preload().then((module) => ({ default: module.NotFoundPage }))),
  preload,
};
