// `node scripts/hosting-check.mjs`: loads every hub page (and a few ordinary pages) from dist/ through a
// GitHub-Pages-like server, in a real browser, with and without the trailing slash, and fails when a URL
// redirects more than once, loops, or ends on a different page than it was asked for.
// DIST_DIR picks the build folder (default dist); PORT the port (default 4811).

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

import { startGithubPagesServer } from "./lib/ghpages.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(DEMO, process.env.DIST_DIR ?? "dist");
const BASE = "/sheenui";
const hubs = ["charts", "guides", "components", "effects", "blocks", "dashboards"];
const pages = ["", "charts/heatmap", "guides/base-ui-vs-radix", "components/button", "docs/installation"];

const log = [];
const server = await startGithubPagesServer({
  dist: DIST,
  basePath: `${BASE}/`,
  port: Number(process.env.PORT ?? 4811),
  log,
});
const browser = await chromium.launch({ channel: "chrome" });
let failures = 0;
const rows = [];

for (const [name, spellings] of [
  ["hub", hubs.flatMap((h) => [`${h}`, `${h}/`])],
  ["page", pages.map((p) => p)],
]) {
  for (const path of spellings) {
    const page = await browser.newPage();
    const navigations = [];
    page.on("framenavigated", (frame) => frame === page.mainFrame() && navigations.push(new URL(frame.url()).pathname));
    log.length = 0;
    await page.goto(`${server.origin}${BASE}/${path}`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const h1 =
      (await page
        .locator("h1")
        .first()
        .textContent()
        .catch(() => "")) ?? "";
    const finalPath = new URL(page.url()).pathname;
    const requests = log.filter((l) => !/\.(js|css|woff2|png|webp|svg|json|xml|txt)\b/.test(l));
    const wantHub = name === "hub";
    const ok =
      navigations.length <= 2 &&
      requests.length <= 3 &&
      h1.trim().length > 0 &&
      !/not found/i.test(h1) &&
      (!wantHub || finalPath.startsWith(`${BASE}/${path.replace(/\/$/, "")}`));
    if (!ok) failures++;
    rows.push(
      `${ok ? "ok  " : "FAIL"} /${path || ""} -> ${finalPath} (${requests.join(", ")}) h1="${h1.trim().slice(0, 40)}"`,
    );
    await page.close();
  }
}
await browser.close();
await server.close();
console.log(rows.join("\n"));
console.log(
  failures
    ? `hosting-check: ${failures} URL(s) failed`
    : `hosting-check: ${rows.length} URLs load with no redirect loop`,
);
process.exit(failures ? 1 : 0);
