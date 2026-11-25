// `node scripts/console-check.mjs` (pnpm seo:console): loads a sample of 20 routes from dist/ in both styles and then
// clicks through 5 pages with in-app links (client-side navigation, no reload). Any console error or warning, or any
// uncaught exception, fails the run: hydration mismatches and React's use()/Suspense warnings show up here.
// DIST_DIR picks the build (default dist); PORT the port (default 4812); ROUTES overrides the sample.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

import { startGithubPagesServer } from "./lib/ghpages.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(DEMO, process.env.DIST_DIR ?? "dist");
const BASE = "/sheenui";
const ROUTES = (
  process.env.ROUTES ??
  "/,/foundations,/docs/installation,/components,/components/button,/components/dialog,/forms/date-picker,/overlays/menubar,/layout/accordion,/charts,/charts/pie-chart,/charts/line-chart,/effects/liquid-glass,/blocks/glass-login,/blocks/chat-app,/dashboards/web-analytics,/chat/thread,/guides,/guides/base-ui-vs-radix,/charts/edge-cases,/docs/tailwind-v4,/docs/dark-mode,/docs/base-ui,/components/button-group,/navigation/sidebar,/layout/pagination,/components/table,/layout/aspect-ratio,/forms/input-group,/layout/resizable"
).split(",");
const NAV = [
  "/components/button",
  "/charts/pie-chart",
  "/layout/accordion",
  "/guides/base-ui-vs-radix",
  "/components/dialog",
];

const server = await startGithubPagesServer({
  dist: DIST,
  basePath: `${BASE}/`,
  port: Number(process.env.PORT ?? 4812),
});
const browser = await chromium.launch({ channel: "chrome" });
const problems = [];
let loads = 0;

// A phone cell must emulate touch (any-pointer: coarse gives the 44 px controls); a fine-pointer 390 px page is not a phone.
const CELLS = [
  { name: "desktop", options: { viewport: { width: 1440, height: 900 } } },
  {
    name: "phone",
    options: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
  },
];

for (const { style, cell } of ["liquid", "aurora"].flatMap((style) => CELLS.map((cell) => ({ style, cell })))) {
  const context = await browser.newContext(cell.options);
  await context.addInitScript(
    `try{localStorage.setItem("sheen:style","${style}");localStorage.setItem("sheen:theme","dark")}catch(e){}`,
  );
  const page = await context.newPage();
  let where = "";
  page.on(
    "console",
    (m) =>
      (m.type() === "error" || m.type() === "warning") &&
      problems.push(`${style} ${cell.name} ${where}: console ${m.type()}: ${m.text().slice(0, 200)}`),
  );
  page.on("pageerror", (e) => problems.push(`${style} ${cell.name} ${where}: exception: ${String(e).slice(0, 200)}`));

  for (const route of ROUTES) {
    where = `load ${route}`;
    await page.goto(`${server.origin}${BASE}${route === "/" ? "/" : route}`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    loads++;
  }
  // Client-side navigation: start on the home page and click through the sidebar.
  where = "load /";
  await page.goto(`${server.origin}${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  for (const route of NAV) {
    where = `navigate to ${route}`;
    // Click a real <a href>: the router's document click handler turns it into a client-side navigation (no reload).
    // (The sidebar is one source of such links, but its groups animate open and are not always clickable yet.)
    await page.evaluate((to) => {
      const a = document.createElement("a");
      a.href = to;
      a.textContent = "nav";
      document.body.append(a);
      a.click();
      a.remove();
    }, `${BASE}${route}`);
    await page.waitForFunction((r) => location.pathname === r, `${BASE}${route}`);
    await page.waitForSelector("main h1");
    await page.waitForTimeout(1200);
  }
  await context.close();
}
await browser.close();
await server.close();
console.log(problems.length ? problems.join("\n") : "");
console.log(
  problems.length
    ? `console-check: ${problems.length} problem(s)`
    : `console-check: ${loads} loads and ${NAV.length * 4} client-side navigations, both styles on desktop and a touch phone, no console errors or warnings`,
);
process.exit(problems.length ? 1 : 0);
