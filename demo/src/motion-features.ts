/**
 * The animation engine <LazyMotion> loads after hydration (src/main.tsx): animations, exit,
 * gestures, viewport, drag and layout. `domMax` is what the full `motion` component bundles,
 * so nothing is lost; it only arrives in its own chunk instead of blocking first load.
 */
export { domMax as default } from "motion/react";
