// Client-side navigation swaps one complete stylesheet per route class (src/route-css.ts). Once a navigation has settled
// only the current page's sheet may remain in the document (the old one is removed, not piled up), and no frame may show
// a page without its sheet (a bare, unstyled flash).

import { expect, test, type Page } from "@playwright/test";

import { urlFor } from "./routes";

// One page per route class that has sidebar links, so every step swaps the class.
const TOUR = [
  "/components/button",
  "/charts/line-chart",
  "/forms/calendar",
  "/layout/accordion",
  "/effects/blur-in",
  "/navigation/navbar",
  "/overlays/drawer",
  "/docs/installation",
  "/components/alert", // back to the first class
  "/components/avatar", // same class: nothing to swap
];

/** Route sheets in the document: [all, in effect]. A sheet in effect is a loaded route sheet not parked with media="not all". */
const sheetState = (page: Page) =>
  page.evaluate(() => {
    const raw = document.getElementById("sheen-assets")?.textContent;
    return fetch((JSON.parse(raw ?? "{}") as { cssMap: string }).cssMap)
      .then((r) => r.json() as Promise<{ classes: Record<string, string[]> }>)
      .then(({ classes }) => {
        const all = new Set(Object.values(classes).flat());
        const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].filter((l) =>
          all.has(new URL(l.href).pathname),
        );
        return {
          total: links.length,
          active: links.filter((l) => l.media !== "not all" && l.sheet).length,
          sheets: document.styleSheets.length,
        };
      });
  });

test("client navigation keeps only the current route's stylesheet and never shows a bare frame", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(urlFor("/"), { waitUntil: "load" });
  await page.locator("main h1").first().waitFor();
  // Wait for hydration: the router only takes over link clicks after it.
  await page.waitForFunction(() => !!document.querySelector("aside[aria-label='Site'] a"));

  // A frame recorder: every animation frame notes whether a route sheet is in effect and the tokens resolve.
  await page.evaluate(() => {
    const w = window as unknown as { __bare: string[]; __stop?: boolean };
    w.__bare = [];
    const tick = () => {
      const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href*="/css-"]')];
      const applied = links.some((l) => l.media !== "not all" && l.sheet && !l.sheet.disabled);
      const inline = !!document.getElementById("sheen-critical");
      const token = getComputedStyle(document.body).getPropertyValue("--sheen-fg").trim();
      if ((!applied && !inline) || token === "")
        w.__bare.push(`${location.pathname}: applied=${applied} token="${token}"`);
      if (!w.__stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  let max = 0;
  for (const route of TOUR) {
    const link = page.locator(`aside[aria-label='Site'] a[href$='${route}']`).first();
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${route}/?$`));
    await page.locator("main h1").first().waitFor();
    // Settled: the old sheet is gone, exactly one route sheet is in effect, and a token-styled element is styled by it.
    await expect.poll(async () => (await sheetState(page)).active, { message: route }).toBe(1);
    const s = await sheetState(page);
    max = Math.max(max, s.total);
    expect(s.total, `route sheets in the document after ${route}`).toBeLessThanOrEqual(2);
    const style = await page
      .locator("main h1")
      .first()
      .evaluate((h1) => ({
        family: getComputedStyle(h1).fontFamily,
        token: getComputedStyle(document.body).getPropertyValue("--sheen-fg").trim(),
      }));
    expect(style.token, `--sheen-fg after ${route}`).not.toBe("");
    expect(style.family.toLowerCase(), `heading font after ${route}`).not.toMatch(/^"?times/);
  }

  // Rapid history: back and forward through the tour without waiting for anything to settle.
  for (let i = 0; i < 4; i++) await page.goBack();
  for (let i = 0; i < 3; i++) await page.goForward();
  await page.locator("main h1").first().waitFor();
  await expect.poll(async () => (await sheetState(page)).active).toBe(1);
  expect((await sheetState(page)).total).toBeLessThanOrEqual(2);

  const bare = await page.evaluate(() => {
    const w = window as unknown as { __bare: string[]; __stop?: boolean };
    w.__stop = true;
    return w.__bare;
  });
  expect(bare, "frames without the page's stylesheet").toEqual([]);
  expect(max).toBeGreaterThan(0);
});
