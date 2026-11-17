// `pnpm budget:measure`: the measured twin of `pnpm budget`'s "fetched by load + idle" column. Serves the built site the way
// GitHub Pages does (gzip), opens every prerendered route in Chromium (desktop viewport, no scrolling, no clicks), waits
// IDLE_MS (default 5000) after the load event and adds up the gzip size of every JavaScript file the page requested.
// Gates each route against its class's fetched budget (scripts/lib/budget-classes.mjs) and prints the model's error.
// Env: DIST_DIR (default dist), BUDGET_OUT (default ../test-results), IDLE_MS, MEASURE_ROUTES (comma list, default all),
// MEASURE_CONCURRENCY (default 3), MEASURE_PORT (default 5312). Run after `pnpm build`; it is slow (about a minute per 30 routes), so it is not part of CI.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import { chromium } from "@playwright/test";

import { classOf, fetchedBudgetFor } from "./lib/budget-classes.mjs";
import { startServer } from "./lib/serve.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(DEMO, process.env.DIST_DIR ?? "dist");
const OUT = resolve(DEMO, process.env.BUDGET_OUT ?? "../test-results");
const IDLE_MS = Number(process.env.IDLE_MS ?? 5000);
const CONCURRENCY = Number(process.env.MEASURE_CONCURRENCY ?? 3);

const modelRows = JSON.parse(readFileSync(join(OUT, "budget.json"), "utf8")).rows;
const only = process.env.MEASURE_ROUTES?.split(",");
const routes = modelRows.filter((r) => !only || only.includes(r.path));

const { origin, close } = await startServer({
  dist: DIST,
  basePath: "/sheenui/",
  port: Number(process.env.MEASURE_PORT ?? 5312),
});
const browser = await chromium.launch();
const results = [];
let next = 0;
async function worker() {
  while (next < routes.length) {
    const row = routes[next++];
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    let bytes = 0;
    let files = 0;
    const pending = [];
    page.on("response", (res) => {
      if (!/\/assets\/[^?#]+\.js$/.test(res.url())) return;
      pending.push(
        res
          .body()
          .then((body) => {
            bytes += gzipSync(body).length;
            files++;
          })
          .catch(() => undefined),
      );
    });
    await page.goto(`${origin}/sheenui${row.path === "/" ? "/" : row.path}`, { waitUntil: "load" });
    await page.waitForTimeout(IDLE_MS);
    await Promise.all(pending);
    await context.close();
    results.push({
      path: row.path,
      cls: classOf(row.path),
      limit: fetchedBudgetFor(row.path),
      initialKb: row.kb,
      modelKb: row.fetchedKb,
      measuredKb: Math.round((bytes / 1024) * 10) / 10,
      files,
    });
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();
await close();

results.sort((a, b) => b.measuredKb - a.measuredKb);
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "budget-measured.json"), JSON.stringify({ idleMs: IDLE_MS, rows: results }, null, 2));
console.log(`JS fetched ${IDLE_MS / 1000} s after load, measured (gzip), ${results.length} routes`);
for (const r of results.slice(0, 15))
  console.log(
    `  ${r.measuredKb.toFixed(1).padStart(7)} KB (model ${r.modelKb.toFixed(0).padStart(3)}, initial ${r.initialKb.toFixed(0).padStart(3)})  ${r.path}${r.measuredKb > r.limit ? `   OVER ${r.limit}` : ""}`,
  );
const over = results.filter((r) => r.measuredKb > r.limit);
if (over.length) {
  console.error(`budget:measure: ${over.length} route(s) over their fetched budget`);
  process.exit(1);
}
console.log("budget:measure: every route within its fetched budget");
