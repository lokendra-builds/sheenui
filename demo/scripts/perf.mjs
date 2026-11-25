// `pnpm perf`: runtime performance gate, report-only. Drives *headed* Chrome
// (a real GPU path, like a visitor's) against the built site for the home page, /charts and one
// dashboard, in both style presets, at 1x and 4x CPU throttle, and measures per page:
//   - fps while idle, while the pointer moves, and while scrolling (requestAnimationFrame deltas)
//   - long tasks over 50 ms (PerformanceObserver "longtask")
//   - backdrop-filter surfaces in view (budget 8) and refraction surfaces among them (budget 3)
// Prints a table with a pass/fail per gate and writes test-results/perf.json. Always exits 0:
// the numbers are for the performance pass and the nightly report, not a merge gate.
//
// Env: PERF_PAGES ("/,/charts,/dashboards/web-analytics"), PERF_WIDTHS ("1440,390"),
// PERF_CPU ("1,4"), PERF_STYLES ("liquid,aurora"), PERF_PHASE_MS (3000), PERF_PORT (4175),
// PERF_HEADLESS=1 (CI without a display; fps is then indicative only), PERF_CHANNEL ("chrome";
// "" uses the bundled Chromium). Run after `pnpm build`.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "@playwright/test";

import { startServer } from "./lib/serve.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(DEMO, "..", "test-results");
const { BASE_PATH } = await import(pathToFileURL(join(DEMO, "dist-ssr", "entry-server.js")).href);

const list = (name, fallback) => (process.env[name] ?? fallback).split(",").filter(Boolean);
const PAGES = list("PERF_PAGES", "/,/charts,/dashboards/web-analytics");
const WIDTHS = list("PERF_WIDTHS", "1440,390").map(Number);
const CPU = list("PERF_CPU", "1,4").map(Number);
const STYLES = list("PERF_STYLES", "liquid,aurora");
const PHASE_MS = Number(process.env.PERF_PHASE_MS ?? 3000);
const PORT = Number(process.env.PERF_PORT ?? 4175);
const HEADLESS = Boolean(process.env.PERF_HEADLESS);
const CHANNEL = process.env.PERF_CHANNEL ?? "chrome";

const GATES = { fps: 55, longTaskMs: 50, glass: 8, refraction: 3 };

const { origin, close } = await startServer({ dist: join(DEMO, "dist"), basePath: BASE_PATH, port: PORT });
const base = BASE_PATH.replace(/\/$/, "");

/** Installed before any page script: collects long tasks. */
const LONG_TASKS = `window.__long = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(e.duration); }).observe({ type: "longtask", buffered: true }); } catch (e) {}`;

/** Mean fps and the worst 1 % frame over `ms`, counted from requestAnimationFrame timestamps. */
const MEASURE_FPS = (ms) =>
  new Promise((done) => {
    const deltas = [];
    let last = performance.now();
    const end = last + ms;
    const tick = (now) => {
      deltas.push(now - last);
      last = now;
      if (now < end) requestAnimationFrame(tick);
      else {
        const sorted = deltas.slice(1).sort((a, b) => a - b);
        const mean = sorted.reduce((s, d) => s + d, 0) / Math.max(sorted.length, 1);
        const worst = sorted[Math.max(0, Math.floor(sorted.length * 0.99) - 1)] ?? mean;
        done({ fps: 1000 / mean, p99Ms: worst });
      }
    };
    requestAnimationFrame(tick);
  });

/** Visible backdrop-filter surfaces in the viewport, and how many of them refract (url(...)). */
const COUNT_GLASS = () => {
  let glass = 0;
  let refraction = 0;
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    const filter = cs.backdropFilter && cs.backdropFilter !== "none" ? cs.backdropFilter : cs.webkitBackdropFilter;
    if (!filter || filter === "none" || cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0)
      continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth)
      continue;
    glass++;
    if (filter.includes("url(")) refraction++;
  }
  return { glass, refraction };
};

async function pointerPhase(page, width, height) {
  const run = page.evaluate(MEASURE_FPS, PHASE_MS);
  const t0 = Date.now();
  while (Date.now() - t0 < PHASE_MS) {
    const a = ((Date.now() - t0) / 500) * Math.PI;
    await page.mouse.move(width / 2 + Math.cos(a) * width * 0.35, height / 2 + Math.sin(a) * height * 0.3);
    await page.waitForTimeout(16);
  }
  return run;
}

async function scrollPhase(page, height) {
  const run = page.evaluate(MEASURE_FPS, PHASE_MS);
  const t0 = Date.now();
  let dir = 1;
  while (Date.now() - t0 < PHASE_MS) {
    await page.mouse.wheel(0, dir * 90);
    await page.waitForTimeout(24);
    if (Date.now() - t0 > PHASE_MS / 2) dir = -1;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  void height;
  return run;
}

const results = [];
const browser = await chromium.launch({ headless: HEADLESS, ...(CHANNEL ? { channel: CHANNEL } : {}) });
try {
  for (const style of STYLES) {
    for (const width of WIDTHS) {
      for (const cpu of CPU) {
        const height = width >= 1024 ? 900 : 844;
        const context = await browser.newContext({ viewport: { width, height }, colorScheme: "dark" });
        await context.addInitScript(
          `try{localStorage.setItem("sheen:theme","dark");localStorage.setItem("sheen:style","${style}");}catch(e){}`,
        );
        await context.addInitScript(LONG_TASKS);
        for (const path of PAGES) {
          const page = await context.newPage();
          const cdp = await context.newCDPSession(page);
          if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
          await page.goto(`${origin}${path === "/" ? BASE_PATH : base + path}`, { waitUntil: "load" });
          await page.locator("main h1").first().waitFor({ timeout: 20_000 });
          await page.waitForTimeout(2500); // entrance animations, lazy chunks, chart mount
          await page.evaluate(() => (window.__long = []));

          const idle = await page.evaluate(MEASURE_FPS, PHASE_MS);
          const pointer = await pointerPhase(page, width, height);
          const scroll = await scrollPhase(page, height);
          const surfaces = await page.evaluate(COUNT_GLASS);
          const long = await page.evaluate(() => window.__long);

          const row = {
            path,
            style,
            width,
            cpu,
            fps: { idle: round(idle.fps), pointer: round(pointer.fps), scroll: round(scroll.fps) },
            worstFrameMs: round(Math.max(idle.p99Ms, pointer.p99Ms, scroll.p99Ms)),
            longTasks: { count: long.length, maxMs: round(Math.max(0, ...long)) },
            glass: surfaces.glass,
            refraction: surfaces.refraction,
          };
          const failed = [];
          for (const [phase, value] of Object.entries(row.fps))
            if (value < GATES.fps) failed.push(`${phase} ${value} fps`);
          if (row.longTasks.maxMs > GATES.longTaskMs) failed.push(`long task ${row.longTasks.maxMs} ms`);
          if (row.glass > GATES.glass) failed.push(`${row.glass} glass surfaces`);
          if (row.refraction > GATES.refraction) failed.push(`${row.refraction} refraction surfaces`);
          row.failed = failed;
          results.push(row);
          console.log(
            `${failed.length ? "FAIL" : "ok  "} ${style.padEnd(6)} ${String(width).padStart(4)}px ${cpu}x ${path.padEnd(26)} fps idle/pointer/scroll ${row.fps.idle}/${row.fps.pointer}/${row.fps.scroll}  long ${row.longTasks.count} (max ${row.longTasks.maxMs} ms)  glass ${row.glass}/${row.refraction}${failed.length ? "  -> " + failed.join(", ") : ""}`,
          );
          await page.close();
        }
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  await close();
}

function round(n) {
  return Math.round(n * 10) / 10;
}

const failing = results.filter((r) => r.failed.length);
mkdirSync(OUT, { recursive: true });
writeFileSync(
  join(OUT, "perf.json"),
  JSON.stringify({ gates: GATES, headless: HEADLESS, runs: results.length, failing: failing.length, results }, null, 2),
);
console.log(
  `\nperf: ${results.length} runs, ${failing.length} outside the gates (report-only; see test-results/perf.json)`,
);
process.exit(0);
