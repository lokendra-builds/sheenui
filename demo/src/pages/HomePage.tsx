import { Suspense, lazy, useMemo } from "react";
import { useSheenStyle } from "@sheenui/theme";

import { PageByline } from "../layout/PageByline";

/*
 * The home page. This file is all the home route ships up front: the hero and the sections below
 * it are separate chunks, fetched as soon as the page renders (the hero) or once the browser is
 * idle (the rest). The prerendered HTML contains every one of them, so a visitor or crawler has
 * the whole page, and the headline paints, before any of this code runs.
 */

/** Resolves when the browser is idle (or after `timeout` ms). On the server (the prerender) it resolves at once. */
function whenIdle(timeout = 1000) {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise<void>((resolve) => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => resolve(), { timeout });
    else window.setTimeout(resolve, 200);
  });
}

const loadHero = () => import("./HomeHero");
// Start fetching the hero the moment this module is evaluated, in parallel with hydration.
if (typeof window !== "undefined") {
  void loadHero();
}

const Hero = lazy(loadHero);

/**
 * Key features, "Why SheenUI", the OTP demo and the live stats: Motion variants, the OTP input
 * and the dashboard stats arrive after the hero is interactive instead of ahead of it.
 */
const HomeSections = lazy(() => whenIdle().then(() => import("./HomeSections")));

// The hero's fallback must be exactly as tall as the hero it replaces: when Aurora hydrates a Liquid prerender, React
// swaps the dehydrated hero for this box for a moment, and a shorter box would pull the sections below it into view
// (a layout shift, then a second one when the hero returns). So the prerendered hero's height is read once, before
// hydration, and the fallback holds it (the viewport-based guess only serves a client-side visit).
if (typeof window !== "undefined") {
  const prerendered = document.querySelector<HTMLElement>(".home-hero");
  if (prerendered) document.documentElement.style.setProperty("--home-hero-h", `${prerendered.offsetHeight}px`);
}

// The page's one <h1> must never disappear while the hero swaps: the fallback keeps the prerendered headline text (screen-reader
// only; the box holds the height), so a slow hero chunk leaves the heading in the document, not a moment with none.
const prerenderedTitle =
  typeof window === "undefined" ? "" : (document.getElementById("home-hero-title")?.textContent ?? "");
const heroFallback = (
  <div className="min-h-[var(--home-hero-h,calc(100dvh-12rem))]">
    {prerenderedTitle && <h1 className="sr-only">{prerenderedTitle}</h1>}
  </div>
);

/*
 * Each island's <Suspense> element is memoised (this one is a constant). While an island is still
 * dehydrated, a re-render of this page that hands it a NEW element makes React give up on the
 * server HTML and client-render it, showing the fallback in between. A client-side visit can show
 * the fallback for a moment too (a hydrating page keeps its server HTML).
 */
const sections = (
  <Suspense fallback={<div aria-hidden className="min-h-[90rem]" />}>
    <HomeSections />
  </Suspense>
);

export function HomePage() {
  const { style } = useSheenStyle();
  // Keyed on the style: the composition, copy and choreography are the style's own.
  const hero = useMemo(
    () => (
      <Suspense fallback={heroFallback}>
        <Hero key={style} style={style} />
      </Suspense>
    ),
    [style],
  );

  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      {hero}
      {sections}
      <PageByline path="/" />
    </div>
  );
}
