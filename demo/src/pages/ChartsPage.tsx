import { useSheenReducedMotion } from "@sheenui/theme";
import { Page } from "../layout/Page";
import { lazyBlock } from "../layout/lazy-block";
import { AboutHubCharts } from "./ChartsPage/about";
import { Gallery } from "./ChartsPage/gallery";

const CHARTS = "theme/src/components/charts";

/** The documented charts (line, area, bar, donut, features, API) are an island: their chart kits stay out of the page's initial JavaScript. */
/**
 * The featured dashboard (four synced charts, a brush, a live chart) sits below the gallery. As an eager island it hydrates
 * when the reader gets near it (see lazy-block.tsx), not in the page's load: its first render is over 100 ms on a phone.
 */
const FeaturedDashboard = lazyBlock(() => import("./ChartsPage/featured").then((m) => m.FeaturedDashboard), {
  minHeight: "52rem",
  eager: true,
});

const ChartsDocs = lazyBlock(() => import("./ChartsPage/docs").then((m) => m.ChartsDocs), { minHeight: "60rem" });

/* ---------- Page ---------- */

export function ChartsPage() {
  const reduced = useSheenReducedMotion();

  function goToDocs(slug: string) {
    const el = document.getElementById(`chart-${slug}`);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
    // Gallery tiles passed on the way render for real (content-visibility) and may settle a few
    // pixels off their estimate: land exactly once the smooth scroll ends.
    const settle = () => el.scrollIntoView({ behavior: "auto", block: "start" });
    if ("onscrollend" in window) window.addEventListener("scrollend", settle, { once: true });
    else setTimeout(settle, 900);
  }

  return (
    <Page
      eyebrow="Chart"
      title="Charts gallery"
      description="Every analytics chart in SheenUI, live: trends, comparisons, distributions, flows, hierarchies, maps and finance. Each one has a glass tooltip, keyboard reading, a table view and motion that never gets in the way, in a color-blind-safe palette."
      source={CHARTS}
    >
      <Gallery onCore={goToDocs} />
      <FeaturedDashboard />
      <AboutHubCharts />
      <ChartsDocs />
    </Page>
  );
}
