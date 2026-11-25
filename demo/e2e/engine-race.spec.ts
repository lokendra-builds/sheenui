// Guard for the production-only "engine race": in the built site `motion.*` is the engine-less `m.*`, and anything that
// started animating from a motion value before the animation engine reached <LazyMotion> used to stay on its first frame
// for good (chart bars at opacity 0, undrawn paths). The dev server has the engine at once, so only the built site shows it.
//
// For ~28 routes of every kind this scrolls through the page, waits for it to settle and fails if an element of visible
// size is still stuck in a start state: an inline `opacity: 0` (motion writes its start styles inline), or an SVG path
// whose dash offset still hides all of it. Elements hidden on purpose (aria-hidden, [hidden], inert, visibility:hidden,
// closed popups, sr-only, an empty gauge at 0 or a "No data" chart) are skipped. ENGINE_RACE_ALL=1 sweeps every route; ENGINE_RACE_CPU=4 throttles the CPU 4x.

import { expect, test } from "@playwright/test";

import { routePaths, settle, urlFor } from "./routes";

const ALL = process.env.ENGINE_RACE_ALL === "1";
const CPU = Number(process.env.ENGINE_RACE_CPU ?? 1);

/** Up to `perGroup` routes of each top-level group, always including the hubs. */
function sample(perGroup: number): string[] {
  const groups = new Map<string, string[]>();
  for (const path of routePaths) {
    const group = path.split("/")[1] ?? "";
    groups.set(group, [...(groups.get(group) ?? []), path]);
  }
  const picked = new Set<string>(["/"]);
  for (const list of groups.values()) {
    const step = Math.max(1, Math.floor(list.length / perGroup));
    for (let i = 0; i < list.length && picked.size < 400; i += step) picked.add(list[i] ?? "");
  }
  return [...picked].filter((p) => routePaths.includes(p));
}

const routes = ALL ? routePaths : sample(3);

type Stuck = { selector: string; kind: string };

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
        const stuck = await page.evaluate<Stuck[]>(() => {
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
          return out;
        });
        expect(stuck, `elements stuck in their start state on ${route} @${width}`).toEqual([]);
      });
    }
  }
});
