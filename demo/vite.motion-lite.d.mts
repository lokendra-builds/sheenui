import type { Plugin } from "vite";

/** Production build only: `motion.*` becomes the lean `m.*` components (see vite.motion-lite.mjs). */
export function motionLite(): Plugin;
