import type { Plugin } from "vite";

/** Production build only: one chunk per route instead of one per page file (see vite.page-instances.mjs). */
export function pageInstances(): Plugin[];
