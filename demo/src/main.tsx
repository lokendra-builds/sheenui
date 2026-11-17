import "./chunk-recovery";
import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { LazyMotion } from "motion/react";
import { SheenMotionProvider } from "@sheenui/theme";

// Self-hosted fonts: no render-blocking stylesheet from Google Fonts.
// Every face is declared in index.css (woff2 only, Latin and Latin Extended, `font-display: swap` with metric-matched
// fallback faces, so a late font moves nothing). A face is only downloaded once text uses it.
// Liquid: Inter + Inter Tight; Aurora: Geist, Geist Mono, Instrument Serif; code: JetBrains Mono. The prerender
// preloads the active look's Latin files.
import "./index.css";

import { App } from "./App";
import { routes } from "./routes";
import { toRoutePath } from "./router";
import { notFoundRoute } from "./seo/NotFoundPage";
import { syncInitialRouteCss } from "./route-css";

/**
 * The animation engine (animations, gestures, layout, drag) is its own chunk. In the production
 * build `motion.*` resolves to the engine-less `m.*` components (vite.motion-lite.mjs); in dev the
 * full components ignore this. It is downloaded in parallel with the page's chunk and handed to
 * <LazyMotion> as a plain object BEFORE hydration starts. A motion component that mounted without
 * the engine would have no visual element, and anything it started animating from a motion value
 * (chart bars, count-ups, draw-ins) stayed on its first frame for good; with the engine in place
 * from the first render that race cannot happen, and the context value never changes later (so
 * React never has to client-render a dehydrated boundary either). Cost: the chunk is awaited with
 * the page chunk, not after hydration.
 */
const motionFeatures = import("./motion-features").then((module) => module.default);

const path = toRoutePath(window.location.pathname);
// The page's chunk is needed to hydrate the prerendered HTML in place; wait for it first.
// If it cannot load, render anyway: the routed page then fails inside the error boundary (a Reload button) instead of a blank page.
const features = await Promise.all([
  motionFeatures,
  (routes.find((r) => r.path === path) ?? notFoundRoute).preload().catch(() => undefined),
]).then(([f]) => f);
// 404.html shown for a URL the router resolves to another page: bring that page's stylesheet in before hydrating.
await syncInitialRouteCss(path);

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");
const app = (
  <StrictMode>
    {/* One MotionConfig for the whole app: reduced motion (OS or the in-app toggle), the default spring. */}
    <LazyMotion features={features}>
      <SheenMotionProvider skipAnimations={new URLSearchParams(location.search).has("snapshot")}>
        <App initialPath={path} />
      </SheenMotionProvider>
    </LazyMotion>
  </StrictMode>
);

if (root.firstElementChild) {
  // Production: the HTML was prerendered at build time; React takes over in place. Started in a
  // transition so React hydrates in 5 ms slices and yields to input between them, instead of one
  // blocking pass over the whole page.
  // (The dev template holds only a comment in #root, so this is false there.)
  startTransition(() => {
    hydrateRoot(root, app, {
      onRecoverableError(error, info) {
        console.error("[sheenui] hydration recovered:", error, info.componentStack);
      },
    });
  });
} else {
  // Dev server: an empty #root, rendered from scratch.
  createRoot(root).render(app);
}
