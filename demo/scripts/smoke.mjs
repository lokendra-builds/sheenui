// `pnpm seo:smoke`: starts `vite preview` on a strict port, fetches a sample of routes and
// checks each answers 200 with its prerendered title and a single H1; unknown paths get 404.
// The preview server is killed afterwards, whatever happens.

import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.SMOKE_PORT ?? 5184);
const { BASE_PATH, pageSeo, routes } = await import(pathToFileURL(join(DEMO, "dist-ssr", "entry-server.js")).href);

const SAMPLE = [
  "/",
  "/foundations",
  "/components/button",
  "/components/glass-card",
  "/components/data-table",
  "/charts",
  "/charts/pie-chart",
  "/effects/liquid-glass",
  "/blocks/glass-login",
  "/dashboards/web-analytics",
  "/components/table",
  "/components/button-group",
  "/navigation/sidebar",
  "/layout/aspect-ratio",
  "/forms/input-group",
  "/layout/resizable",
  "/layout/pagination",
  "/docs/tailwind-v4",
  "/docs/dark-mode",
  "/docs/base-ui",
];

// Spawn vite itself (not through pnpm), so killing this process kills the server and not just a wrapper.
const viteBin = join(DEMO, "node_modules", "vite", "bin", "vite.js");
const preview = spawn(process.execPath, [viteBin, "preview", "--port", String(PORT), "--strictPort"], {
  cwd: DEMO,
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
preview.stdout.on("data", (d) => (output += d));
preview.stderr.on("data", (d) => (output += d));

const kill = () => {
  if (!preview.killed) preview.kill("SIGTERM");
};
process.on("exit", kill);

const origin = `http://localhost:${PORT}`;
const base = BASE_PATH.replace(/\/$/, "");

/** Waits for *our* preview's ready line, so a stranger already on the port can't answer the checks. */
async function waitForServer() {
  for (let i = 0; i < 150; i++) {
    if (output.includes(`:${PORT}/`)) return;
    if (preview.exitCode !== null)
      throw new Error(`vite preview could not start on port ${PORT} (in use? set SMOKE_PORT): ${output.trim()}`);
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`vite preview did not start on ${PORT}: ${output}`);
}

const results = [];
let failed = 0;
try {
  await waitForServer();
  for (const path of SAMPLE) {
    const route = routes.find((r) => r.path === path);
    const url = `${origin}${path === "/" ? BASE_PATH : base + path}`;
    const res = await fetch(url);
    const html = await res.text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
    const expected = pageSeo(route).title.replace(/&/g, "&amp;");
    const ok = res.status === 200 && title === expected && h1s === 1 && html.includes('rel="canonical"');
    if (!ok) failed++;
    results.push({ path, status: res.status, ok, title, h1s });
    console.log(`${ok ? "ok  " : "FAIL"} ${res.status} ${path} (${h1s} h1) ${title}`);
  }
  const missing = await fetch(`${origin}${base}/does-not-exist`);
  const missingHtml = await missing.text();
  // vite preview has no 404.html rule (GitHub Pages serves it with a 404): its SPA fallback answers with
  // index.html, and the client router then shows the 404 page. Anything else as 200 is a bug.
  const { readFileSync } = await import("node:fs");
  const notFoundOk = missing.status === 404 || missingHtml === readFileSync(join(DEMO, "dist", "index.html"), "utf8");
  results.push({ path: "/does-not-exist", status: missing.status, ok: notFoundOk });
  if (!notFoundOk) failed++;
  console.log(`${notFoundOk ? "ok  " : "FAIL"} ${missing.status} /does-not-exist`);
} catch (e) {
  failed++;
  console.error(String(e));
} finally {
  kill();
}
console.log(`seo:smoke ${JSON.stringify({ checked: results.length, failed })}`);
if (process.env.SEO_REPORT) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(process.env.SEO_REPORT, JSON.stringify({ checked: results.length, failed, results }, null, 2));
}
process.exit(failed ? 1 : 0);
