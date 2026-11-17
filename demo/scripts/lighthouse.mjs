// `pnpm seo:lighthouse`: Lighthouse (mobile, the default) on a sample of built pages, served
// GitHub-Pages-style from dist/. Fails unless SEO and Best Practices score 100 on every page;
// prints Performance, Accessibility and the lab vitals (LCP, CLS, TBT) for each.
// INP needs real interaction, which Lighthouse's navigation mode has none of, so it is not reported.

import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { startServer } from "./lib/serve.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(DEMO, process.env.DIST_DIR ?? "dist");
const { BASE_PATH } = await import(pathToFileURL(join(DEMO, "dist-ssr", "entry-server.js")).href);

const SAMPLE = (
  process.env.LH_PAGES ??
  "/,/components/glass-card,/charts,/charts/pie-chart,/dashboards/web-analytics,/effects/liquid-glass"
).split(",");
const OUT = process.env.LH_OUT ?? join(DEMO, "node_modules", ".cache", "lighthouse");
const PORT = Number(process.env.LH_PORT ?? 5186);
const PERF_MIN = Number(process.env.LH_PERF_MIN ?? 0);

mkdirSync(OUT, { recursive: true });
const { origin, close } = await startServer({ dist: DIST, basePath: BASE_PATH, port: PORT });
const base = BASE_PATH.replace(/\/$/, "");
const cli = join(DEMO, "node_modules", "lighthouse", "cli", "index.js");

function runLighthouse(args) {
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, args, { cwd: DEMO, stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d));
    const timer = setTimeout(() => child.kill("SIGTERM"), 300_000);
    child.on("close", (status) => {
      clearTimeout(timer);
      resolveRun({ status, stderr });
    });
  });
}

const results = [];
let failed = 0;
try {
  for (const path of SAMPLE) {
    const url = `${origin}${path === "/" ? BASE_PATH : base + path}`;
    const file = join(OUT, `${path === "/" ? "home" : path.slice(1).replace(/\//g, "-")}.json`);
    // Asynchronous on purpose: the static server runs in this process, so a blocking spawnSync
    // would starve it and Lighthouse would wait for ever.
    const run = await runLighthouse([
      cli,
      url,
      "--output=json",
      `--output-path=${file}`,
      "--quiet",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new --no-sandbox",
    ]);
    if (run.status !== 0) {
      failed++;
      console.error(`FAIL ${path}: lighthouse exited ${run.status}\n${run.stderr.slice(-800)}`);
      continue;
    }
    const lhr = JSON.parse(readFileSync(file, "utf8"));
    const score = (id) => Math.round((lhr.categories[id]?.score ?? 0) * 100);
    const audit = (id) => lhr.audits[id]?.numericValue;
    const r = {
      path,
      seo: score("seo"),
      bestPractices: score("best-practices"),
      accessibility: score("accessibility"),
      performance: score("performance"),
      lcpMs: Math.round(audit("largest-contentful-paint") ?? 0),
      cls: Number((audit("cumulative-layout-shift") ?? 0).toFixed(3)),
      tbtMs: Math.round(audit("total-blocking-time") ?? 0),
      fcpMs: Math.round(audit("first-contentful-paint") ?? 0),
      failingSeo: Object.values(lhr.audits)
        .filter((a) => lhr.categories.seo.auditRefs.some((ref) => ref.id === a.id) && a.score !== null && a.score < 1)
        .map((a) => a.id),
      failingBestPractices: Object.values(lhr.audits)
        .filter(
          (a) =>
            lhr.categories["best-practices"].auditRefs.some((ref) => ref.id === a.id) &&
            a.score !== null &&
            a.score < 1,
        )
        .map((a) => a.id),
    };
    const ok = r.seo === 100 && r.bestPractices === 100 && r.performance >= PERF_MIN;
    if (!ok) failed++;
    results.push(r);
    console.log(
      `${ok ? "ok  " : "FAIL"} ${path}  SEO ${r.seo}  BP ${r.bestPractices}  A11y ${r.accessibility}  Perf ${r.performance}  LCP ${r.lcpMs} ms  CLS ${r.cls}  TBT ${r.tbtMs} ms` +
        (r.failingSeo.length || r.failingBestPractices.length
          ? `  failing: ${[...r.failingSeo, ...r.failingBestPractices].join(", ")}`
          : ""),
    );
  }
} finally {
  await close();
}
console.log(`seo:lighthouse ${JSON.stringify({ pages: results.length, failed })}`);
if (process.env.SEO_REPORT)
  writeFileSync(process.env.SEO_REPORT, JSON.stringify({ pages: results.length, failed, results }, null, 2));
process.exit(failed ? 1 : 0);
