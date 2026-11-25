/**
 * Production-only stand-in for `motion/react` (see vite.motion-lite.mjs, used by
 * vite.config.ts, `vite build` only). Same API, with two differences:
 *
 *   1. The build points the import below at `framer-motion` itself. `motion/react` does
 *      `import * as fm from "framer-motion"` to alias two names, and that namespace object
 *      defeats tree-shaking: every export (Reorder, drag, layout, scroll...) ships even when
 *      unused. Going to the library directly lets the bundler keep only what the app calls.
 *   2. `motion.div`, `motion.button`... are the `m` components. `m.*` carries no animation
 *      engine of its own; the engine arrives through <LazyMotion> (src/main.tsx) as a separate
 *      chunk right after hydration, so the ~35 KB gzip `motion` component stays out of the entry.
 *
 * Until that chunk lands (tens of milliseconds after hydration) a motion component shows its
 * initial / animated-to styles without animating, and the prerendered HTML is identical.
 */
import { m } from "motion/react";

export * from "motion/react";
export { m as motion };
