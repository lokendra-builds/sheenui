// Guard for the production-only "engine race": in the built site `motion.*` is the engine-less `m.*`, and anything that
// started animating from a motion value before the animation engine reached <LazyMotion> used to stay on its first frame
// for good (chart bars at opacity 0, undrawn paths). The dev server has the engine at once, so only the built site shows it.
//
// For ~28 routes of every kind this scrolls through the page, waits for it to settle and fails if an element of visible
// size is still stuck in a start state: an inline `opacity: 0` (motion writes its start styles inline), or an SVG path
// whose dash offset still hides all of it. Elements hidden on purpose (aria-hidden, [hidden], inert, visibility:hidden,
// closed popups, sr-only, an empty gauge at 0 or a "No data" chart) are skipped. It also fails on a chart whose marks were never
// painted: a layer of `path[data-id]` marks that mostly has no `d` (a hover copy of a painted mark does not count; a lone sliver may be empty), which is what an imperatively painted
// chart looks like when it lost its marks (the sankey ribbons once did: the prerendered ids no longer matched after hydration). ENGINE_RACE_ALL=1 sweeps every route; ENGINE_RACE_CPU=4 throttles the CPU 4x.

import { expect, test } from "@playwright/test";

import { routePaths, settle, urlFor } from "./routes";

const ALL = process.env.ENGINE_RACE_ALL === "1";
const CPU = Number(process.env.ENGINE_RACE_CPU ?? 1);

/** Routes swept on every run whatever the sample: every imperatively painted chart, and all five dashboards. */
const ALWAYS = [
  "/charts/sankey-diagram",
  "/charts/chord-diagram",
  "/charts/streamgraph",
  "/charts/sunburst",
  "/charts/treemap",
  "/charts/world-map",
  "/charts/network-graph",
  "/charts/marimekko",
  "/charts/bar-list",
  "/dashboards/web-analytics",
  "/dashboards/saas",
  "/dashboards/ecommerce",
  "/dashboards/product",
  "/dashboards/crypto-dashboard",
];

/** Up to `perGroup` routes of each top-level group, always including the hubs. */
function sample(perGroup: number): string[] {
  const groups = new Map<string, string[]>();
  for (const path of routePaths) {
    const group = path.split("/")[1] ?? "";
    groups.set(group, [...(groups.get(group) ?? []), path]);
  }
  const picked = new Set<string>(["/", ...ALWAYS]);
  for (const list of groups.values()) {
    const step = Math.max(1, Math.floor(list.length / perGroup));
    for (let i = 0; i < list.length && picked.size < 400; i += step) picked.add(list[i] ?? "");
  }
  return [...picked].filter((p) => routePaths.includes(p));
}

const routes = ALL ? routePaths : sample(3);

type Stuck = { selector: string; kind: string };

/** Runs in the page: every element that still shows its start state, and every chart layer with marks that were never painted. */
const scan = (): Stuck[] => {
  const out: Stuck[] = [];
  const label = (el: Element) =>
    `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${[...el.classList]
      .slice(0, 2)
      .map((c) => `.${c}`)
      .join("")}`;
  const hiddenByDesign = (el: Element) =>
    Boolean(
      el.closest(
        "[aria-hidden=true],[hidden],[inert],[aria-valuenow='0'],[aria-label*='No data'],[data-closed],[data-ending-style],[data-starting-style],.sr-only,[role=tooltip],[popover],template,noscript",
      ),
    );
  // Like hiddenByDesign, but a chart's marks are drawn inside aria-hidden groups (the figure is read through its table twin) and the stage is inert while its story plays.
  const offByDesign = (el: Element) =>
    Boolean(
      el.closest(
        "[hidden],[aria-valuenow='0'],[aria-label*='No data'],[data-closed],[data-ending-style],[data-starting-style],.sr-only,[role=tooltip],[popover],template,noscript",
      ),
    );
  for (const el of document.body.querySelectorAll<HTMLElement | SVGElement>("*")) {
    const rect = el.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8 || hiddenByDesign(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (el.style.opacity !== "" && Number(el.style.opacity) < 0.05 && Number(cs.opacity) < 0.05) {
      // Only an inline start style counts, and only when nothing in the ancestor chain hides it for another reason.
      out.push({ selector: label(el), kind: "opacity 0" });
    }
  }
  for (const path of document.querySelectorAll<SVGGeometryElement>("svg path, svg line, svg circle")) {
    if (hiddenByDesign(path)) continue;
    const cs = getComputedStyle(path);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (cs.stroke === "none" || cs.strokeDasharray === "none") continue;
    const [dash = NaN, gap = NaN] = cs.strokeDasharray.split(/[ ,]+/).map(parseFloat);
    const offset = parseFloat(cs.strokeDashoffset);
    if (path.getTotalLength() <= 8) continue;
    // A draw-in (pathLength 1) starts as dasharray "0 1": nothing is drawn. Or the offset hides the whole dash.
    if (dash === 0 && gap > 0) out.push({ selector: label(path), kind: "dash 0" });
    else if (dash > 0 && offset >= dash - 0.5) out.push({ selector: label(path), kind: "offset=length" });
  }
  // A chart whose marks were never painted. A painted mark has a `d`; a hover or lit copy of it (same `data-id`, same svg)
  // stays empty until it is used, so a mark counts as unpainted only when no path of its svg with that id has a `d`.
  for (const svg of document.querySelectorAll("svg")) {
    const box = svg.getBoundingClientRect();
    // Only a chart on screen: one that has scrolled away may have reset itself to its first frame on purpose.
    if (box.width < 8 || box.height < 8 || box.bottom < 0 || box.top > innerHeight) continue;
    const marks = [...svg.querySelectorAll<SVGPathElement>("path[data-id]")].filter((p) => !offByDesign(p));
    const painted = new Set(marks.filter((p) => (p.getAttribute("d") ?? "").trim() !== "").map((p) => p.dataset.id));
    // A mark can be empty on purpose (a sliver too thin to draw), so a layer counts as lost when most of its marks are empty.
    const layers = new Map<Element | null, SVGPathElement[]>();
    for (const p of marks) layers.set(p.parentElement, [...(layers.get(p.parentElement) ?? []), p]);
    for (const layer of layers.values()) {
      // A chart that has not hydrated yet is still the prerendered HTML (its marks are painted by the live chart): not a defect.
      const empty = layer.filter(
        (p) =>
          Object.keys(p).some((k) => k.startsWith("__reactFiber")) &&
          !painted.has(p.dataset.id) &&
          getComputedStyle(p).display !== "none",
      );
      if (empty.length >= 2 && empty.length * 2 >= layer.length)
        for (const p of empty) out.push({ selector: `${label(p)}[data-id=${p.dataset.id ?? ""}]`, kind: "empty d" });
    }
  }
  return out;
};

test.describe("engine race: nothing stays on its first frame", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "CPU throttling needs CDP");
  test.setTimeout(120_000);

  for (const width of [1440, 390]) {
    for (const route of routes) {
      test(`${route} @${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        if (CPU > 1) {
          const cdp = await page.context().newCDPSession(page);
          await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
        }
        await page.goto(urlFor(route), { waitUntil: "domcontentloaded" });
        await page.waitForSelector("html[data-hydrated=true]", { timeout: 30_000 });
        // Right after hydration, before the page settles or scrolls (a chart that remounts later hides it): a chart that lost its marks to the prerendered HTML shows it here.
        // A chart paints its marks a frame or two after it measures itself, so give it up to 2 s; a mark that is still empty then is lost.
        let early: Stuck[] = [];
        for (let i = 0; i < 8; i += 1) {
          early = (await page.evaluate<Stuck[]>(scan)).filter((x) => x.kind === "empty d");
          if (early.length === 0) break;
          await page.waitForTimeout(250);
        }
        await settle(page, 6, 20_000).catch(() => undefined);
        // Scroll through the page in steps so every in-view gate fires, then come back to the top.
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        const stepPx = Math.round(width === 390 ? 600 : 700);
        for (let y = 0; y < Math.min(height, 30_000); y += stepPx) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await page.waitForTimeout(150);
        }
        // Let the last in-view animations finish (springs and draw-ins take under ~2 s).
        await page.waitForTimeout(2500);
        const stuck = [...early, ...(await page.evaluate<Stuck[]>(scan))];
        expect(stuck, `elements stuck in their start state on ${route} @${width}`).toEqual([]);
      });
    }
  }
});
