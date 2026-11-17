// `pnpm budget`: the JavaScript budgets, two columns per prerendered route (gzip).
//   1. Initial JS: what the browser fetches before the page can run: the entry script and every modulepreload in that
//      route's HTML, plus their static imports from the Vite manifest. Gated here per page class
//      (scripts/lib/budget-classes.mjs: home 135, plain docs 190, example / popup / form 210, chart 250 KB).
//   2. Fetched by load + idle: initial JS plus the shell's idle chunks plus every island (lazyBlock chunk, eager or idle)
//      the page's own chunks import, to two levels. From the module graph, so it is an UPPER BOUND (it also counts chunks
//      the page only loads on scroll or click); it is reported here and not gated. `pnpm budget:measure`
//      (scripts/budget-measure.mjs, which `pnpm budget` runs after this script) measures the same number in Chromium after 5 s
//      idle and gates it against the fetched budgets of the same file.
// Fails (exit 1) when any route is over its initial class budget. Env: BUDGET_KB (one flat limit for every route, instead of
// the classes), BUDGET_TOP (rows printed, default 12), FETCH_DEPTH (levels of dynamic imports followed, default 2).
// Writes test-results/budget.json. Run after `pnpm build`.

import { routeHtml } from "./lib/serve.mjs";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import { BUDGETS_KB, FETCHED_BUDGETS_KB, budgetFor, classOf, fetchedBudgetFor } from "./lib/budget-classes.mjs";
import { readSplitSource } from "./lib/split-source.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// DIST_DIR / BUDGET_OUT: measure another build folder (profiling builds) without touching the real output.
const DIST = resolve(DEMO, process.env.DIST_DIR ?? "dist");
const OUT = resolve(DEMO, process.env.BUDGET_OUT ?? "../test-results");
const FLAT_KB = process.env.BUDGET_KB ? Number(process.env.BUDGET_KB) : null;
/** The budget of one route: its class's, or the flat override. */
const limitFor = (path) => FLAT_KB ?? budgetFor(path);
/** The entry's dynamic imports every page fetches on its own: the animation features, backdrop, toaster, preference bar. */
const SHELL_IDLE = [
  "src/motion-features.ts",
  "src/layout/LazyBackdrop.tsx",
  "src/layout/LazyToaster.tsx",
  "src/layout/PreferenceBar.tsx",
];
const FETCH_DEPTH = Number(process.env.FETCH_DEPTH ?? 2);
const TOP = Number(process.env.BUDGET_TOP ?? 12);

const manifestFile = join(DIST, ".vite", "manifest.json");
if (!existsSync(manifestFile)) {
  console.error("budget: demo/dist has no .vite/manifest.json. Run `pnpm build` first.");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
/** file ("assets/x.js") → manifest entry */
const byFile = new Map(Object.values(manifest).map((entry) => [entry.file, entry]));

const gzipCache = new Map();
/** gzip size in bytes of a built file, cached across routes. */
function gzipSize(file) {
  if (!gzipCache.has(file)) gzipCache.set(file, gzipSync(readFileSync(join(DIST, file))).length);
  return gzipCache.get(file);
}

/** The route's HTML file: "/" → index.html, "/a/b" → a/b.html. */
function htmlFor(path) {
  return routeHtml(DIST, path);
}

/** Every route path, from the sitemap-independent source of truth: the route table. */
const routesSource = readSplitSource(join(DEMO, "src", "routes.ts"));
const paths = [...routesSource.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]);

/**
 * JS files referenced by a route's HTML, without the base path: module scripts and modulepreloads in the markup,
 * plus the entry and preloads the page's `#sheen-assets` block lists (scripts/prerender.mjs adds them after the
 * first paint; they are the same files the <head> used to carry).
 */
function htmlScripts(html) {
  const files = new Set();
  const add = (src) => {
    const m = src?.match(/(assets\/[^"?#]+\.js)$/);
    if (m) files.add(m[1]);
  };
  const tag = /<(?:script|link)\b[^>]*>/g;
  for (const [t] of html.matchAll(tag)) {
    const isScript = t.startsWith("<script") && /type="module"/.test(t);
    const isPreload = t.startsWith("<link") && /rel="modulepreload"/.test(t);
    if (!isScript && !isPreload) continue;
    add(t.match(/(?:src|href)="([^"]+)"/)?.[1]);
  }
  const assets = html.match(/<script type="application\/json" id="sheen-assets">([^<]*)<\/script>/);
  if (assets) {
    const { entry, preload } = JSON.parse(assets[1]);
    for (const src of [entry, ...preload]) add(src);
  }
  return files;
}

/** Adds the static-import closure of a built file (never the dynamic imports). */
function withStaticImports(files) {
  const all = new Set();
  const visit = (file) => {
    if (all.has(file)) return;
    all.add(file);
    const entry = byFile.get(file);
    for (const key of entry?.imports ?? []) {
      const dep = manifest[key];
      if (dep) visit(dep.file);
    }
  };
  files.forEach(visit);
  return all;
}

/** Files of the entry's own static closure: shared by every route, so never the source of an island. */
const entryClosure = withStaticImports(new Set([manifest["index.html"]?.file].filter(Boolean)));

/**
 * What the page fetches on its own within a few seconds of loading: the initial files, plus the islands (lazyBlock
 * chunks, eager or idle) its own chunks import dynamically, plus those islands' static imports, to FETCH_DEPTH
 * levels of dynamic imports (the page chunk loads the body, the body its demos). The entry's and shared chunks'
 * dynamic imports (every other page, on-demand code) are not followed.
 * A Playwright capture of 5 s idle (BUDGET_VERIFY) confirms the model on a sample of routes.
 */
function fetchedFiles(initial) {
  const all = new Set(initial);
  // The shell's own load/idle chunks (the entry's dynamic imports that every page fetches without interaction).
  for (const key of SHELL_IDLE) {
    const dep = manifest[key];
    if (dep) for (const f of withStaticImports(new Set([dep.file]))) all.add(f);
  }
  let frontier = [...initial].filter((f) => !entryClosure.has(f));
  for (let depth = 0; depth < FETCH_DEPTH && frontier.length; depth++) {
    const next = [];
    for (const file of frontier) {
      for (const key of byFile.get(file)?.dynamicImports ?? []) {
        const dep = manifest[key];
        if (!dep || all.has(dep.file) || entryClosure.has(dep.file)) continue;
        for (const f of withStaticImports(new Set([dep.file]))) {
          if (all.has(f) || entryClosure.has(f)) continue;
          all.add(f);
          next.push(f);
        }
      }
    }
    frontier = next;
  }
  return all;
}

const rows = [];
const missing = [];
for (const path of paths) {
  const file = htmlFor(path);
  if (!existsSync(file)) {
    missing.push(path);
    continue;
  }
  const files = withStaticImports(htmlScripts(readFileSync(file, "utf8")));
  const bytes = [...files].reduce((sum, f) => sum + gzipSize(f), 0);
  const fetched = fetchedFiles(files);
  const fetchedBytes = [...fetched].reduce((sum, f) => sum + gzipSize(f), 0);
  rows.push({
    path,
    cls: classOf(path),
    limit: limitFor(path),
    kb: Math.round((bytes / 1024) * 10) / 10,
    files: files.size,
    fetchedKb: Math.round((fetchedBytes / 1024) * 10) / 10,
    fetchedFiles: fetched.size,
    fetchedLimit: FLAT_KB ?? fetchedBudgetFor(path),
  });
}

rows.sort((a, b) => b.kb - a.kb);
const over = rows.filter((r) => r.kb > r.limit);
const median = rows.length ? rows[Math.floor(rows.length / 2)].kb : 0;

/** Per section ("charts", "components"...): how many routes, min / median / max KB, how many are over. "/" is "home". */
const sections = {};
for (const r of rows) {
  const key = r.path === "/" ? "home" : r.path.split("/")[1];
  (sections[key] ??= []).push(r);
}
const bySection = Object.fromEntries(
  Object.entries(sections).map(([key, group]) => {
    const kbs = group.map((r) => r.kb).sort((a, b) => a - b);
    return [
      key,
      {
        routes: kbs.length,
        min: kbs[0],
        median: kbs[kbs.length >> 1],
        max: kbs.at(-1),
        over: group.filter((r) => r.kb > r.limit).length,
      },
    ];
  }),
);

mkdirSync(OUT, { recursive: true });
writeFileSync(
  join(OUT, "budget.json"),
  JSON.stringify(
    {
      limitsKb: FLAT_KB ?? BUDGETS_KB,
      fetchedLimitsKb: FETCHED_BUDGETS_KB,
      routes: rows.length,
      over: over.length,
      max: rows[0] ?? null,
      median,
      bySection,
      missing,
      rows,
    },
    null,
    2,
  ),
);

console.log(
  `Initial JS per route (gzip), budget ${FLAT_KB ? `${FLAT_KB} KB` : "per page class"}, ${rows.length} routes`,
);
for (const r of rows.slice(0, TOP))
  console.log(
    `  ${r.kb.toFixed(1).padStart(7)} KB  ${r.files.toString().padStart(2)} files  ${r.path}${r.kb > r.limit ? `   OVER ${r.limit}` : ""}`,
  );
const fetchedKbs = rows.map((r) => r.fetchedKb).sort((a, b) => a - b);
console.log(
  `  fetched by load + idle (graph upper bound): median ${fetchedKbs[fetchedKbs.length >> 1]?.toFixed(0)} KB, max ${fetchedKbs.at(-1)?.toFixed(0)} KB (gated by budget:measure)`,
);
console.log(`  ... median ${median.toFixed(1)} KB, smallest ${rows.at(-1)?.kb.toFixed(1) ?? "-"} KB`);
console.log("By section (KB gzip):");
for (const [key, v] of Object.entries(bySection))
  console.log(
    `  ${key.padEnd(12)} ${String(v.routes).padStart(3)} routes  min ${v.min.toFixed(0).padStart(3)}  median ${v.median.toFixed(0).padStart(3)}  max ${v.max.toFixed(0).padStart(3)}  over ${v.over}`,
  );
if (missing.length) {
  console.error(`budget: ${missing.length} route(s) have no prerendered HTML: ${missing.slice(0, 5).join(", ")}`);
  process.exit(1);
}
if (over.length) {
  console.error(
    `budget: ${over.length} route(s) over their class budget (gzip): ${over.map((r) => `${r.path} (${r.kb} of ${r.limit} KB)`).join(", ")}`,
  );
  process.exit(1);
}
console.log(`budget: all ${rows.length} routes within their class budget`);
