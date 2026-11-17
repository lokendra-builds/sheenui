import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const groups = [
  "Start",
  "Components",
  "Forms",
  "Overlays",
  "Navigation",
  "Layout",
  "Data display",
  "Chat",
  "Charts",
  "Dashboards",
  "Effects",
  "Blocks",
  "Guides",
] as const;

export type Route = {
  path: string;
  title: string;
  group: (typeof groups)[number];
  /** Code-split page: its chunk loads the first time the route renders. */
  page: LazyExoticComponent<ComponentType>;
  /** Start loading the page's chunk early (on link hover / focus). Safe to call repeatedly. */
  preload: () => Promise<unknown>;
  /** Routable, but not listed in the sidebar. */
  hidden?: boolean;
};

/** One lazy page per route. Pages use named exports, so pick the component out of the module. */
export function lazyPage<M>(load: () => Promise<M>, pick: (module: M) => ComponentType) {
  let promise: Promise<M> | undefined;
  const preload = () => (promise ??= load());
  return { page: lazy(() => preload().then((module) => ({ default: pick(module) }))), preload };
}
