// `node scripts/budget-route.mjs /path [/path2]`: the files behind one route's initial-JS number
// (see budget.mjs), biggest first, with the dynamic imports each file could trigger left out.
// Debug helper for `pnpm budget`; run after `pnpm build`.

import { existsSync, readFileSync } from "node:fs";
import { routeHtml } from "./lib/serve.mjs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), "..", process.env.DIST_DIR ?? "dist");
const manifest = JSON.parse(readFileSync(join(DIST, ".vite", "manifest.json"), "utf8"));
const byFile = new Map(Object.entries(manifest).map(([key, entry]) => [entry.file, { key, ...entry }]));

for (const path of process.argv.slice(2)) {
  const htmlFile = routeHtml(DIST, path);
  if (!existsSync(htmlFile)) {
    console.error(`no prerendered HTML for ${path}`);
    continue;
  }
  const html = readFileSync(htmlFile, "utf8");
  const seeds = new Set();
  const add = (src) => {
    const file = src?.match(/(assets\/[^"?#]+\.js)$/)?.[1];
    if (file) seeds.add(file);
  };
  for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/g)) {
    if (!/type="module"|rel="modulepreload"/.test(tag)) continue;
    add(tag.match(/(?:src|href)="([^"]+)"/)?.[1]);
  }
  // The entry and modulepreloads the page adds after its first paint (scripts/prerender.mjs).
  const assets = html.match(/<script type="application\/json" id="sheen-assets">([^<]*)<\/script>/);
  if (assets) {
    const { entry, preload } = JSON.parse(assets[1]);
    for (const src of [entry, ...preload]) add(src);
  }
  const all = new Set();
  const visit = (file) => {
    if (all.has(file)) return;
    all.add(file);
    for (const key of byFile.get(file)?.imports ?? []) if (manifest[key]) visit(manifest[key].file);
  };
  seeds.forEach(visit);
  const rows = [...all].map((file) => ({
    file,
    gz: gzipSync(readFileSync(join(DIST, file))).length,
    key: byFile.get(file)?.key ?? "",
  }));
  rows.sort((a, b) => b.gz - a.gz);
  console.log(`${path}: ${(rows.reduce((s, r) => s + r.gz, 0) / 1024).toFixed(1)} KB gzip in ${rows.length} files`);
  for (const r of rows.slice(0, Number(process.env.TOP ?? 14)))
    console.log(`  ${(r.gz / 1024).toFixed(1).padStart(6)}  ${r.file}  ${r.key}`);
}
