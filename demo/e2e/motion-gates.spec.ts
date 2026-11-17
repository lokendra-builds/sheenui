// Lens-2 motion gate (c): during real interactions on six routes, no long task over 50 ms and no
// layout shift. The shift counter includes shifts the
// browser flags `hadRecentInput` (the standard CLS ignores those, and they are exactly the ones an
// interaction causes). Each route also ends with an in-app navigation, so the route transition
// is inside the measurement.
//
//   CI / production preview:   pnpm --filter demo exec playwright test motion-gates --project chromium
//   dev server (indicative):   MOTION_BASE_URL=http://localhost:5180/sheenui/ MOTION_TOLERANCE_MS=60 \
//                              pnpm --filter demo exec playwright test motion-gates --project chromium
//
// Load rule (long-task assertions only): a long task is CPU contention as much as code, and the shared machine is busy.
// Before each long-task assertion the machine is judged busy if the 1-min load average is >= MOTION_LOAD_RETRY (6: the
// run itself adds 3 to 4, so 6 means about 3 other busy processes) or a quick CPU calibration (a fixed ~20 ms spin, compared with the fastest spin seen so far) runs >= 1.5x slower. If a run
// fails while the machine was busy, that one measurement is repeated once after a 2 s idle, and the test fails only if it
// fails twice. The limit is never raised and layout-shift assertions are never retried. Every failure message prints the
// load and calibration of each attempt. A pass on the first attempt is what CI expects; the retry only absorbs load spikes.
//
// Busy machine: when a long task shows up and the 1-min load average is still >= MOTION_LOAD_SKIP (8) after the retry, the
// measurement is not valid. It is then re-measured (up to MOTION_LOAD_ATTEMPTS, 3, waiting for the load to fall below the
// limit between attempts) and, if every attempt was busy and slow, the test FAILS with the loads printed: a load-induced
// failure is never reported as a pass. MOTION_ALLOW_LOAD_SKIP=1 (local, indicative runs only) records such a case as a
// skipped assertion instead; `pnpm verify` never sets it. Layout-shift assertions are never retried and never skipped.
// This file is timing-sensitive: `pnpm verify` runs it in its own serial step (`pnpm e2e:motion`, --workers=1) after the
// parallel suite, which skips it via E2E_SKIP_TIMING.
//
// Env: MOTION_BASE_URL (default: the config's built-site server), MOTION_LONGTASK_MS (limit, 50),
// MOTION_TOLERANCE_MS (added to the limit; 0 in CI, set it for the dev server, whose on-demand
// module compiles are not production), MOTION_CLS_TOLERANCE (0.002), MOTION_THROTTLE (CPU slowdown, 1).

import { loadavg } from "node:os";

import { expect, test, type Browser, type Page } from "@playwright/test";

import { preferenceScript, urlFor } from "./routes";

const LIMIT = Number(process.env.MOTION_LONGTASK_MS ?? 50) + Number(process.env.MOTION_TOLERANCE_MS ?? 0);
// CLS tolerance. A shift scores impact fraction x distance fraction, so it is sub-pixel noise or a layout regression,
// never in between. Measured on the built site (the per-test "cls" annotation, 26 interaction walks over both looks, run on
// a box at load 4-11): 22 walks scored exactly 0 and the rest 0.00004-0.00051 (font subpixel rounding while a dialog or
// toast opens; verify21 failed at 0.000146 with the old 0.0001 limit). 0.002 is ~4x that noise ceiling and still
// below every real shift this gate has caught (tab panel swap 0.005-0.015, route shell 0.0039+, accordion push 0.006-0.017):
// a full-width 400 px section moving 4 px scores about 0.002. Tighten it only with a new noise measurement.
const CLS_TOLERANCE = Number(process.env.MOTION_CLS_TOLERANCE ?? 0.002);
const ALLOW_LOAD_SKIP = process.env.MOTION_ALLOW_LOAD_SKIP === "1";
const LOAD_ATTEMPTS = Number(process.env.MOTION_LOAD_ATTEMPTS ?? 3);
const LOAD_RETRY = Number(process.env.MOTION_LOAD_RETRY ?? 6);
const LOAD_SKIP = Number(process.env.MOTION_LOAD_SKIP ?? 8);
const THROTTLE = Number(process.env.MOTION_THROTTLE ?? 1);
// Routes whose component animates height by design (the accordion panel is the one allowed height exception).
// The items below the opening panel, and the demo stage that wraps them, follow it, so a click shifts layout by
// definition. Measured 0.006-0.017 across looks; the budget catches a regression (a hover that resizes a box, a
// panel that jumps) without pretending the intended push is a bug. Every other route keeps CLS_TOLERANCE.
const CLS_BUDGET: Record<string, number> = { "/layout/accordion": 0.03 };

const ROUTES = [
  "/",
  "/components/button",
  "/components/tabs",
  "/components/dialog",
  "/overlays/dropdown-menu",
  "/charts/line-chart",
  "/components/select",
  "/components/toast",
  "/components/carousel",
  "/layout/accordion",
  "/overlays/hover-card",
  "/navigation/navigation-menu",
  "/navigation/vertical-nav",
];
const LOOKS = [
  { theme: "dark", style: "liquid" },
  { theme: "light", style: "aurora" },
] as const;

type Recorded = {
  longTasks: { start: number; duration: number; phase: string }[];
  shifts: { value: number; at: number; phase: string; sources: string[] }[];
};

const OBSERVER = `
window.__gate = { longTasks: [], shifts: [], on: false, phase: "" };
try {
  new PerformanceObserver((list) => { if (window.__gate.on) for (const e of list.getEntries()) window.__gate.longTasks.push({ start: Math.round(e.startTime), duration: Math.round(e.duration), phase: window.__gate.phase }); }).observe({ type: "longtask" });
  new PerformanceObserver((list) => { if (window.__gate.on) for (const e of list.getEntries()) window.__gate.shifts.push({ value: e.value, at: Math.round(e.startTime), phase: window.__gate.phase, sources: (e.sources || []).map((s) => (s.node && s.node.nodeName) || "?") }); }).observe({ type: "layout-shift" });
} catch (e) {}
`;

/** Resolves once no finite animation or transition has been running for 6 frames in a row. */
async function idle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let quiet = 0;
        const step = () => {
          const busy = document
            .getAnimations()
            .some((a) => a.playState === "running" && Number.isFinite(a.effect?.getComputedTiming().endTime ?? 0));
          quiet = busy ? 0 : quiet + 1;
          if (quiet >= 6) resolve();
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
  );
}

/** Resolves once `window.scrollY` has not changed for 6 frames (smooth/inertial scroll and lazy layout have settled). */
async function scrolled(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = -1;
        let quiet = 0;
        const step = () => {
          quiet = window.scrollY === last ? quiet + 1 : 0;
          last = window.scrollY;
          if (quiet >= 6) resolve();
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
  );
}

/** Label the step in progress, so a failure names the interaction that caused it. */
const phase = (page: Page, name: string) =>
  page.evaluate((n) => ((window as unknown as { __gate: { phase: string } }).__gate.phase = n), name);

/** Switch a tab, interrupting the first switch with a second (the Preview / Code switch on every docs page). */
async function switchTabs(page: Page) {
  await phase(page, "tabs");
  const tabs = page.locator("#main").getByRole("tab");
  if ((await tabs.count()) > 2) {
    await tabs.nth(1).click({ timeout: 5000 });
    await tabs
      .nth(2)
      .click({ timeout: 5000 })
      .catch(() => undefined);
    await idle(page);
  }
}

async function interact(page: Page) {
  const main = page.locator("#main");
  await phase(page, "scroll");
  // Scroll down and back: parallax, reveals, sticky chrome.
  await page.mouse.wheel(0, 700);
  await idle(page);
  await page.mouse.wheel(0, -700);
  await idle(page);
  await phase(page, "hover");
  // Hover the first few buttons and cards.
  for (const target of await main
    .locator("button:visible, a.glass-2:visible, [data-slot=card]:visible")
    .all()
    .then((all) => all.slice(0, 3))) {
    await target.hover({ timeout: 3000 }).catch(() => undefined);
    await idle(page);
  }
  // A hover can leave a popup open (navigation menu: hover opens it and Base UI then makes the other triggers
  // pointer-events: none). Close it before the click phase, as a person would by moving away; otherwise Playwright
  // scrolls the page hunting for a clickable target and the popup flips side mid-scroll (a scroll shift, not a popup shift).
  await page.keyboard.press("Escape");
  await page.mouse.move(2, 2);
  await idle(page);
  await phase(page, "popup");
  // Open and close the first popup trigger in the page content. Accordion triggers are not popups: the FAQ at the foot of
  // every docs page would be picked first, and its panel animates height by design (see CLS_BUDGET).
  const trigger = main
    .locator("button[aria-haspopup], button[aria-expanded=false]:not([data-slot=accordion-trigger])")
    .first();
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click({ timeout: 3000 }).catch(() => undefined);
    await idle(page);
    await page.keyboard.press("Escape");
    await idle(page);
  }
  await phase(page, "route");
  // Route transition: follow a sidebar link and wait for the new page's heading.
  const before = (await page.locator("main h1").first().textContent()) ?? "";
  const link = page.locator("nav a[href]").filter({ hasNotText: before }).nth(3);
  await link.click({ timeout: 5000 });
  await expect(page.locator("main h1").first()).not.toHaveText(before, { timeout: 15_000 });
  await idle(page);
}

type Look = (typeof LOOKS)[number];

/** Open `route`, warm it up, run `steps`, and return what the observers saw. */
async function measure(
  browser: Browser,
  baseURL: string | undefined,
  route: string,
  look: Look,
  steps: (page: Page) => Promise<void>,
  options: { width?: number } = {},
) {
  const context = await browser.newContext({
    viewport: { width: options.width ?? 1440, height: options.width && options.width < 500 ? 844 : 900 },
    colorScheme: look.theme,
    baseURL: process.env.MOTION_BASE_URL ?? baseURL,
  });
  try {
    await context.addInitScript(preferenceScript(look.theme, look.style));
    await context.addInitScript(OBSERVER);
    const page = await context.newPage();
    if (THROTTLE > 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
    }
    await page.goto(urlFor(route), { waitUntil: "domcontentloaded" });
    await page.locator("main h1").first().waitFor({ timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await idle(page);
    // Warm the lazy chunks and the motion engine, then measure only what the interactions cause.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          ("requestIdleCallback" in window ? window.requestIdleCallback.bind(window) : setTimeout)(() => resolve()),
        ),
    );
    await idle(page);
    await page.evaluate(() => {
      (window as unknown as { __gate: { on: boolean } }).__gate.on = true;
    });
    await steps(page);
    return await page.evaluate(() => (window as unknown as { __gate: Recorded }).__gate);
  } finally {
    await context.close();
  }
}

function verdict(got: Recorded, route: string) {
  const slow = got.longTasks.filter((t) => t.duration > LIMIT);
  // The home page has no sidebar, so leaving it re-lays out the whole shell: that is a page change, not an interaction shift.
  const shifts = got.shifts.filter((s) => !(route === "/" && s.phase === "route"));
  return { slow, shifts, shift: shifts.reduce((sum, s) => sum + s.value, 0) };
}

/** A fixed CPU spin, in ms. The fastest ever seen is the unloaded baseline; a slower one means contention. */
let baseline = Infinity;
function calibrate() {
  const t0 = performance.now();
  let x = 0;
  for (let i = 0; i < 4_000_000; i++) x = (x + i * 31) % 1_000_003;
  const ms = performance.now() - t0 + x * 0; // x keeps the loop from being optimised away
  baseline = Math.min(baseline, ms);
  return ms / baseline;
}
// Two spins at load time seed the baseline before any browser is running.
calibrate();
calibrate();
const busy = () => {
  const ratio = calibrate();
  const load = loadavg()[0] ?? 0;
  return {
    load,
    busy: load >= LOAD_RETRY || ratio >= 1.5,
    text: `load ${load.toFixed(1)}, cpu x${ratio.toFixed(2)}`,
  };
};

/** Poll the 1-min load average until it drops below `LOAD_SKIP` (or `ms` pass); returns the load seen last. */
async function waitForQuiet(ms: number) {
  const deadline = Date.now() + ms;
  while ((loadavg()[0] ?? 0) >= LOAD_SKIP && Date.now() < deadline) await new Promise((r) => setTimeout(r, 1000)); // eslint-disable-line no-restricted-syntax -- polling the machine load, not page state
  return loadavg()[0] ?? 0;
}

/**
 * Measure, and when a long task over the limit shows up while the machine is busy (see the top of the file), measure
 * again (waiting for the load to fall first) up to LOAD_ATTEMPTS times. Returns the verdict of the last attempt plus the
 * loads seen (in failure messages). A slow result while still busy is a failure, unless MOTION_ALLOW_LOAD_SKIP=1.
 */
async function gated(
  browser: Browser,
  baseURL: string | undefined,
  route: string,
  look: Look,
  steps: (page: Page) => Promise<void>,
) {
  const loads: string[] = [];
  let result = verdict(await measure(browser, baseURL, route, look, steps), route);
  let state = busy();
  loads.push(state.text);
  let allBusy = state.busy;
  for (let attempt = 1; attempt < LOAD_ATTEMPTS && result.slow.length > 0 && state.busy; attempt++) {
    await waitForQuiet(30_000);
    result = verdict(await measure(browser, baseURL, route, look, steps), route);
    state = busy();
    loads.push(state.text);
    allBusy &&= state.busy;
    console.log(`[motion-gates] retried ${route} ${look.style}: ${loads.join(" -> ")}`);
  }
  const loadSkipped = ALLOW_LOAD_SKIP && allBusy && result.slow.length > 0 && state.load >= LOAD_SKIP;
  if (loadSkipped) {
    console.log(
      `[motion-gates] long-task assertion SKIPPED (MOTION_ALLOW_LOAD_SKIP) ${route}: ${loads.join(" then ")}`,
    );
    longTaskSkipped++;
  } else longTaskRan++;
  const note =
    allBusy && result.slow.length > 0 ? " [machine was busy on every attempt: rerun on a quiet machine]" : "";
  return { ...result, slow: loadSkipped ? [] : result.slow, load: loads.join(" then ") + note };
}
let longTaskRan = 0;
let longTaskSkipped = 0;

for (const look of LOOKS) {
  test.describe(`${look.theme} ${look.style}`, () => {
    for (const route of ROUTES) {
      test(`no long task over ${LIMIT} ms and no layout shift: ${route}`, async ({ browser, baseURL }) => {
        test.setTimeout(120_000);
        const { slow, shifts, shift, load } = await gated(browser, baseURL, route, look, interact);
        test.info().annotations.push({ type: "cls", description: String(shift) });
        expect(slow, `long tasks over ${LIMIT} ms (${load})`).toEqual([]);
        expect(shift, `layout shift ${JSON.stringify(shifts)}`).toBeLessThanOrEqual(CLS_BUDGET[route] ?? CLS_TOLERANCE);
      });
    }
  });
}

// The home page on a phone, scrolled to the footer: the wall, the morph and the depth stack come into view. No layout
// shift at all (the wall's tiles hold their height; lens 2 round 3 measured 0.0039 here).
for (const look of LOOKS) {
  test(`home at 390 px: no layout shift while scrolling to the footer (${look.theme} ${look.style})`, async ({
    browser,
    baseURL,
  }) => {
    test.setTimeout(120_000);
    const scrollThrough = async (page: Page) => {
      for (let y = 0; y < 14_000; y += 500) {
        await page.mouse.wheel(0, 500);
        await scrolled(page);
      }
      await idle(page);
    };
    const { shifts, shift } = verdict(await measure(browser, baseURL, "/", look, scrollThrough, { width: 390 }), "/");
    expect(shift, `layout shift ${JSON.stringify(shifts)}`).toBeLessThanOrEqual(CLS_TOLERANCE);
  });
}

// Dashboards at the widths where their grids re-flow (700/800/1200 added to the phone and desktop ends), scrolled to the
// TRUE page bottom (the height is re-read after every wheel step, so lazily laid-out sections are included): no shift.
// Each panel reserves its final height per container width (bodyClassName min-heights), so mounting it never moves
// what is below; the sweep holds the same tolerance as every other case.
const DASHBOARDS = [
  "/dashboards/web-analytics",
  "/dashboards/saas",
  "/dashboards/ecommerce",
  "/dashboards/product",
  "/dashboards/crypto-dashboard",
];
for (const width of [390, 700, 800, 1200, 1440]) {
  test(`dashboards at ${width} px: no layout shift scrolling to the true bottom`, async ({ browser, baseURL }) => {
    test.setTimeout(10 * 60_000);
    const toBottom = async (page: Page) => {
      for (let step = 0; step < 120; step++) {
        const atBottom = await page.evaluate(
          () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1,
        );
        if (atBottom) break;
        await page.mouse.wheel(0, 600);
        await scrolled(page);
      }
      await idle(page);
    };
    for (const route of DASHBOARDS) {
      const { shifts, shift } = verdict(await measure(browser, baseURL, route, LOOKS[0], toBottom, { width }), route);
      expect(shift, `${route} layout shift ${JSON.stringify(shifts)}`).toBeLessThanOrEqual(CLS_TOLERANCE);
    }
  });
}

// Switching Preview / Code on a docs page shifts layout (0.005-0.015) and once ran a 91 ms task: the Tabs panel
// swap (lens2 issue 2): fixed by reserving the tallest panel height in Example.tsx.
for (const route of ["/components/button", "/components/tabs", "/components/dialog"]) {
  test(`tab switch: no long task and no layout shift: ${route}`, async ({ browser, baseURL }) => {
    test.setTimeout(120_000);
    const { slow, shifts, shift, load } = await gated(browser, baseURL, route, LOOKS[0], switchTabs);
    expect(slow, `long tasks (${load})`).toEqual([]);
    expect(shift, `layout shift ${JSON.stringify(shifts)}`).toBeLessThanOrEqual(CLS_TOLERANCE);
  });
}

// Last in the file (--workers=1): skipping exists only behind MOTION_ALLOW_LOAD_SKIP, and not for every assertion.
test("at least one long-task assertion ran at a valid load", () => {
  test.skip(longTaskSkipped === 0, "nothing was skipped for load");
  expect(longTaskRan, `all ${longTaskSkipped} long-task assertions were skipped for load`).toBeGreaterThan(0);
});
