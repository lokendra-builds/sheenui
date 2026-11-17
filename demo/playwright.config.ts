// Playwright e2e for the demo, run against the *built* site served the way GitHub Pages serves
// it (base /sheenui/), never the dev server: prerendered HTML, hydration and real chunking are
// what visitors get, and what the suite must protect.
//
//   pnpm e2e              everything (sweep + visual), three engines
//   pnpm e2e:chromium     every spec except the timing gates, Chromium only, parallel (`pnpm verify` step 1)
//   pnpm e2e:motion       the timing gates (motion-gates.spec.ts), Chromium, --workers=1 (`pnpm verify` step 2, after e2e:chromium)
//   pnpm e2e:sweep        route sweep, Chromium only
//   pnpm e2e:visual       visual snapshots, three engines
//
// Env: E2E_PORT (4174), E2E_WORKERS, E2E_SKIP_TIMING=1 (leave out the timing-sensitive specs: they get their own serial run), SWEEP_QUICK=1 (2 looks instead of 8), SWEEP_ROUTES=a,b
// (only routes containing one of these), E2E_UPDATE=1 is spelled `--update-snapshots`.

import { defineConfig, devices } from "@playwright/test";

import { BASE_PATH } from "./src/seo/site";

const PORT = Number(process.env.E2E_PORT ?? 4174);
const CI = Boolean(process.env.CI);
// E2E_HOST: point the specs at a dev server that listens on localhost only (e.g. E2E_HOST=localhost E2E_PORT=5180).
const ORIGIN = `http://${process.env.E2E_HOST ?? "127.0.0.1"}:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  outputDir: "../test-results/e2e",
  // E2E_SKIP_DEDICATED=1: the CI `e2e` shards skip the specs that have their own job (`visual` runs the snapshots against the committed
  // baselines, `motion-gates` runs the timing gates alone on a quiet runner, `a11y` its own matrix).
  // E2E_SKIP_TIMING=1: skip only the timing-sensitive specs (long-task and layout-shift gates). `pnpm verify` runs the
  // rest in parallel (`e2e:chromium`), then these alone with `--workers=1` (`e2e:motion`), so load from sibling workers
  // never reaches a 50 ms long-task limit.
  // `._*` are macOS AppleDouble metadata files, never specs.
  testIgnore: process.env.E2E_SKIP_DEDICATED
    ? [/(^|\/)\._/, /(visual|motion-gates|a11y)\.spec\.ts$/]
    : process.env.E2E_SKIP_TIMING
      ? [/(^|\/)\._/, /motion-gates\.spec\.ts$/]
      : /(^|\/)\._/,
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  // Local default is 6, not "half the cores": with 16 parallel browsers the layout-shift and stage tests of unrelated
  // routes failed under their own load (3-5 per run); at 6 the suite is stable. Raise it with E2E_WORKERS on a quiet box.
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : CI ? 4 : 6,
  reporter: [
    [CI ? "github" : "list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "../test-results/e2e.json" }],
  ],
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.002 },
  },
  use: {
    // Trailing slash on purpose: `page.goto("components/button")` resolves under /sheenui/.
    baseURL: `${ORIGIN}${BASE_PATH}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve-dist.mjs",
    url: `${ORIGIN}${BASE_PATH}`,
    reuseExistingServer: !CI,
    timeout: 30_000,
    env: { E2E_PORT: String(PORT), E2E_BASE: BASE_PATH },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
