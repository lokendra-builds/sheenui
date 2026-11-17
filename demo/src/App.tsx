import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ToastProvider, riseIn, useSheenReducedMotion } from "@sheenui/theme";

import { DeferredBackdrop } from "./layout/DeferredBackdrop";
import { RouteErrorBoundary } from "./layout/RouteErrorBoundary";
import { Shell, focusMainHeading } from "./layout/Shell";
import { routes } from "./routes";
import { notifyRouteCommitted, usePath } from "./router";
import { Seo } from "./seo/Seo";
import { RoutePathContext } from "./seo/route-context";
import { notFoundRoute } from "./seo/NotFoundPage";
import { markFirstPageHydrated } from "./hydration";

/**
 * The toast viewport (Base UI's toast root, swipe handling and stack, ~14 KB gzip with its swipe and portal code) loads on
 * the person's first interaction, after a long wait, or the moment a toast is raised (`useToast` holds the call and
 * asks for it through `onViewportNeeded`). Base UI starts a toast's timer when it is added, so ToastProvider keeps
 * early toasts out of the store until the viewport has mounted (`viewportReady`); none can expire unseen.
 */
const Toaster = lazy(() => whenInteracted().then(() => import("./layout/LazyToaster")));

let loadToasterNow: (() => void) | undefined;

/** Resolves on the first press, key, touch or scroll, on `loadToasterNow()`, or after `fallbackMs`, whichever comes first. */
function whenInteracted(fallbackMs = 12000): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve(); // the prerender renders the viewport at once
  return new Promise((resolve) => {
    const events = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
    const done = () => {
      for (const type of events) window.removeEventListener(type, done, true);
      window.clearTimeout(timer);
      loadToasterNow = undefined;
      resolve();
    };
    loadToasterNow = done;
    const timer = window.setTimeout(done, fallbackMs);
    for (const type of events) window.addEventListener(type, done, { capture: true, passive: true });
  });
}

export function App({ initialPath }: { initialPath?: string } = {}) {
  const { path, pending } = usePath(initialPath);
  // Unknown paths get the 404 page (prerendered as 404.html), never a silent fall-back to home.
  const route = routes.find((r) => r.path === path) ?? notFoundRoute;
  const PageComponent = route.page;
  const [announcement, setAnnouncement] = useState("");
  // Each motion component reads the reduced-motion setting once, when it mounts:
  // remount the routed page when the preference flips, never the shell (focus stays on the toggle).
  const reduced = useSheenReducedMotion();
  const [toasterMounted, setToasterMounted] = useState(false);

  return (
    <ToastProvider viewportReady={toasterMounted} onViewportNeeded={() => loadToasterNow?.()}>
      {/* Title, description, canonical, Open Graph: hoisted into <head> by React 19. */}
      <Seo route={route} />
      {/* The live wallpaper of the active style: a fixed sibling behind the page, never a wrapper of glass. */}
      <DeferredBackdrop mode={route.path === "/" ? "hero" : "page"} />
      <RoutePathContext value={route.path}>
        <Shell path={route.path} pending={pending} announcement={announcement}>
          {/* Only the very first load can show this; later navigations keep the old page up (see usePath). */}
          <RouteErrorBoundary resetKey={route.path}>
            <Suspense fallback={<div aria-busy="true" className="min-h-dvh" />}>
              <PageComponent key={`${route.path}:${reduced ? "reduced" : "full"}`} />
              <RouteFocus path={route.path} title={route.title} onNavigated={setAnnouncement} />
            </Suspense>
          </RouteErrorBoundary>
        </Shell>
      </RoutePathContext>
      <Suspense fallback={null}>
        <Toaster onMounted={() => setToasterMounted(true)} />
      </Suspense>
    </ToastProvider>
  );
}

/**
 * After an in-app navigation (not the first load, so Tab still starts at the skip link):
 * scroll to the top, move focus to the new page's h1 and announce the page.
 * It sits inside the Suspense boundary, so it runs only once the new page is on screen.
 */
function RouteFocus({
  path,
  title,
  onNavigated,
}: {
  path: string;
  title: string;
  onNavigated: (message: string) => void;
}) {
  const lastPath = useRef(path);

  // Effects run only once the page's boundary has hydrated: the first load's "ready" signal.
  useEffect(() => markFirstPageHydrated(), []);

  // Layout effect: the route transition's "new" snapshot is taken once this runs, so the page must
  // already be at the top, and the transition is told the new page is in the DOM (router.ts).
  // Browsers without View Transitions get the transform-only rise instead (riseIn).
  useLayoutEffect(() => {
    if (lastPath.current !== path) {
      window.scrollTo(0, 0); // the legacy form: old WebKit rejects behavior:"instant"; nothing sets scroll-behavior:smooth, so it is immediate
      riseIn(document.getElementById("main"));
    }
    notifyRouteCommitted();
  }, [path]);

  useEffect(() => {
    if (lastPath.current === path) return;
    lastPath.current = path;
    focusMainHeading();
    // Clear first so revisiting a page still changes the live region; set it a beat after
    // the focus move, so screen readers don't drop it.
    onNavigated("");
    const timer = window.setTimeout(() => onNavigated(`${title} page`), 150);
    return () => window.clearTimeout(timer);
  }, [path, title, onNavigated]);

  return null;
}
