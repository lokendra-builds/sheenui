// Only `animateView`, as its own module: a dynamic `import("motion/react")` would hand the bundler the whole library
// namespace and make it keep every export in the entry's shared chunk (see themeWave.ts).
export { animateView } from "motion/react";
