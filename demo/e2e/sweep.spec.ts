// Route sweep: every route x {390, 1440} x {light, dark} x {liquid, aurora}. For each page:
//   - it answers 200 and renders a <main> H1 within the timeout
//   - exactly one <h1> in the document
//   - no console errors, uncaught exceptions, or failed same-origin requests (hydration
//     mismatches show up here as console errors)
//   - no horizontal overflow (scrollWidth <= clientWidth)
//
// One test per (look x slice of routes): pages are reused inside a test, so the 1016 page loads
// cost a few minutes, and a failure lists every offending route of that slice at once.

import { expect, test, type Page } from "@playwright/test";

import { preferenceScript, routePaths, settle, urlFor } from "./routes";

const SIZES = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];
const THEMES = ["light", "dark"] as const;
const STYLES = ["liquid", "aurora"] as const;
/** Routes per test: small enough to spread over workers/shards, big enough to amortise setup. */
const SLICE = 32;
/** After the H1 is up: time for hydration, effects and lazy chunks to log their errors. */
const SETTLE_FRAMES = 6; // quiet frames (no finite animation running) before the route is judged

const filter = process.env.SWEEP_ROUTES?.split(",").filter(Boolean);
const paths = filter ? routePaths.filter((p) => filter.some((f) => p.includes(f))) : routePaths;

const looks = SIZES.flatMap((size) => THEMES.flatMap((theme) => STYLES.map((style) => ({ size, theme, style }))));
const selected = process.env.SWEEP_QUICK
  ? looks.filter(
      (l) =>
        (l.size.name === "1440" && l.theme === "dark" && l.style === "liquid") ||
        (l.size.name === "390" && l.theme === "light" && l.style === "aurora"),
    )
  : looks;

const slices: string[][] = [];
for (let i = 0; i < paths.length; i += SLICE) slices.push(paths.slice(i, i + SLICE));

/** Visits one route and returns what is wrong with it (empty = fine). */
async function inspect(page: Page, path: string, problems: string[]): Promise<string[]> {
  const found: string[] = [];
  problems.length = 0;
  // "domcontentloaded", not "load": the H1 wait below is the real readiness signal, and a busy CI
  // box (or a Mac running other browsers) can take far longer to fire `load` than to render.
  const response = await page.goto(urlFor(path), { waitUntil: "domcontentloaded" });
  if (response?.status() !== 200) found.push(`HTTP ${response?.status() ?? "none"}`);
  try {
    await page.locator("main h1").first().waitFor({ timeout: 30_000 });
  } catch {
    found.push("no <main> h1 within 30 s");
  }
  await settle(page, SETTLE_FRAMES);

  const h1 = await page.locator("h1").count();
  if (h1 !== 1) found.push(`${h1} <h1> elements (want exactly 1)`);
  const { overflow, wide } = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    // On a phone, content wider than the screen silently widens the LAYOUT viewport (innerWidth 423 on a 390 screen)
    // and the page pans sideways while scrollWidth still equals clientWidth.
    wide: Math.round(window.innerWidth - (window.visualViewport?.width ?? window.innerWidth)),
  }));
  if (overflow > 0) found.push(`horizontal overflow of ${overflow}px`);
  if (wide > 0) found.push(`layout viewport is ${wide}px wider than the visual viewport (page pans sideways)`);
  found.push(...problems.map((p) => `console: ${p}`));
  return found;
}

for (const { size, theme, style } of selected) {
  test.describe(`${size.name}px ${theme} ${style}`, () => {
    slices.forEach((slice, index) => {
      test(`routes ${index * SLICE + 1}-${index * SLICE + slice.length}`, async ({ browser, baseURL }) => {
        test.setTimeout(10 * 60_000);
        // A phone cell must emulate touch: only then does `any-pointer: coarse` apply and the 44 px controls render.
        // (Firefox has no mobile emulation, so it gets touch only.)
        const phone = size.width < 500;
        const context = await browser.newContext({
          viewport: { width: size.width, height: size.height },
          colorScheme: theme,
          ...(phone
            ? { hasTouch: true, isMobile: browser.browserType().name() !== "firefox", deviceScaleFactor: 2 }
            : {}),
        });
        await context.addInitScript(preferenceScript(theme, style));
        const page = await context.newPage();
        page.setDefaultTimeout(45_000);

        const problems: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") problems.push(msg.text().slice(0, 240));
        });
        page.on("pageerror", (error) => problems.push(`uncaught: ${error.message.slice(0, 240)}`));
        const origin = new URL(baseURL!).origin;
        page.on("response", (res) => {
          if (res.status() >= 400 && res.url().startsWith(origin))
            problems.push(`HTTP ${res.status()} ${new URL(res.url()).pathname}`);
        });

        const failures: string[] = [];
        for (const path of slice) {
          const found = await inspect(page, path, problems);
          if (found.length) failures.push(`${path}: ${found.join("; ")}`);
        }
        await context.close();
        expect(failures, `${failures.length} of ${slice.length} routes failed:\n${failures.join("\n")}`).toEqual([]);
      });
    });
  });
}
