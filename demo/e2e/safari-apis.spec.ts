// Guard for APIs Safari does not have. CI and `pnpm verify` run Chromium only, so a call to `requestIdleCallback`
// without a fallback passes every other gate and then crashes the page in Safari ("This page didn't load").
// This removes the API before any script runs and loads a route of every kind: the page must render its heading,
// throw nothing and never fall back to the route error message (the boundary swallows the error, so both are checked).

import { expect, test } from "@playwright/test";

import { routePaths, settle, urlFor } from "./routes";

const WANTED = [
  "/",
  "/components",
  "/components/data-table",
  "/charts",
  "/charts/world-map",
  "/dashboards/saas",
  "/blocks/pricing",
  "/blocks/analytics",
  "/effects",
  "/showcase",
  "/docs/installation",
  "/guides",
];
const routes = WANTED.filter((path) => routePaths.includes(path));

test.describe("without requestIdleCallback (Safari)", () => {
  for (const width of [1440, 390]) {
    for (const path of routes) {
      test(`${path} at ${width}px renders and throws nothing`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        await context.addInitScript(() => {
          Reflect.deleteProperty(window, "requestIdleCallback");
          Reflect.deleteProperty(window, "cancelIdleCallback");
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(urlFor(path), { waitUntil: "load" });
        await expect(page.locator("main h1").first()).toBeVisible();
        expect(await page.evaluate(() => "requestIdleCallback" in window)).toBe(false);
        // Scroll through the page so idle-scheduled and near-viewport islands all get their turn.
        await page.evaluate(async () => {
          const step = window.innerHeight;
          for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            window.scrollTo(0, y);
            for (let i = 0; i < 4; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
          }
          window.scrollTo(0, 0);
        });
        await settle(page, 6);
        await expect(page.locator("main h1").first()).toBeVisible();
        // A crash inside the page is caught by the route error boundary: no `pageerror`, but its message replaces the page.
        await expect(page.locator("#route-error-title"), `${path} fell back to the error message`).toHaveCount(0);
        expect(errors, `page errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
        await context.close();
      });
    }
  }
});
