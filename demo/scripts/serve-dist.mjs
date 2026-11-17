// Serves the built demo (dist/) the way GitHub Pages does, under the Pages base path, for the
// Playwright suite and the perf script. Reads E2E_PORT (default 4174) and E2E_BASE (default
// "/sheenui/", which Playwright's config passes from src/seo/site.ts so there is one source).
// Run `pnpm build` first; this only serves what is already in dist/.

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { startServer } from "./lib/serve.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(DEMO, "dist");
if (!existsSync(join(dist, "index.html"))) {
  console.error("serve-dist: demo/dist is empty. Run `pnpm build` first.");
  process.exit(1);
}

const port = Number(process.env.E2E_PORT ?? 4174);
const basePath = process.env.E2E_BASE ?? "/sheenui/";
const { origin, close } = await startServer({ dist, basePath, port });
console.log(`serving dist at ${origin}${basePath}`);

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    void close().then(() => process.exit(0));
  });
}
