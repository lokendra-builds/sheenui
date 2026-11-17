// Production build only: every `import { motion } from "motion/react"` gets the lean `m`
// components (src/motion-lite.ts) and the animation features load lazily (src/main.tsx).
// The theme's sources are untouched and still type-check against the real `motion`.
//
// Inside the shim, "motion/react" is redirected to the `framer-motion` package it re-exports.
// framer-motion is a dependency of `motion`, not of this package: under pnpm's strict layout it
// is only resolvable from inside the `motion` folder, so it is resolved from there.

import { fileURLToPath } from "node:url";

const SHIM = fileURLToPath(new URL("./src/motion-lite.ts", import.meta.url));

/** @returns {import("vite").Plugin} */
export function motionLite() {
  return {
    name: "sheen:motion-lite",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (source !== "motion/react") return null;
      if (importer !== SHIM) return SHIM;
      const motion = await this.resolve(source, importer, { ...options, skipSelf: true });
      return motion ? this.resolve("framer-motion", motion.id, { ...options, skipSelf: true }) : null;
    },
  };
}
