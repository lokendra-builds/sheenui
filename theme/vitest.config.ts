// Vitest in browser mode (real Chromium through Playwright): components render with the real
// Tailwind + SheenUI CSS, so keyboard focus, layout and axe colour-contrast checks are genuine.
// `pnpm test` runs once headless; `pnpm test:coverage` adds V8 coverage with enforced thresholds (lines >= 90%, branches >= 80%).

import { readdirSync, readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Every `@base-ui/react/<part>` entry the theme imports. Vite's dependency optimiser only
 * discovers an import when a test first reaches it, then reloads the page mid-run, which
 * Vitest reports as a flaky first run ("Vite unexpectedly reloaded a test"). Pre-listing
 * them keeps a cold CI run as stable as a warm one.
 */
function baseUiEntries(dir = "src"): string[] {
  const found = new Set<string>();
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || entry.name.startsWith("._") || !/\.tsx?$/.test(entry.name)) continue; // ._*: macOS AppleDouble metadata, not source
    const text = readFileSync(`${entry.parentPath}/${entry.name}`, "utf8");
    for (const m of text.matchAll(/from "(@base-ui\/react\/[^"]+)"/g)) found.add(m[1]!);
  }
  return [...found].sort();
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      ...baseUiEntries(),
      "react",
      "react-dom",
      "react/jsx-dev-runtime",
      "motion/react",
      "clsx",
      "tailwind-merge",
      "axe-core",
      "@testing-library/react",
      "@testing-library/jest-dom/matchers",
      "@tanstack/react-table",
    ],
  },
  test: {
    // 12 parallel browser pages starve timing-sensitive interaction tests (results were load-dependent across unrelated components); raise with VITEST_MAX_WORKERS on a quiet CI box.
    maxWorkers: Number(process.env.VITEST_MAX_WORKERS) || 4,
    include: ["test/**/*.test.tsx"],
    exclude: ["**/node_modules/**", "**/._*"],
    // expect.poll defaults to 1 s, which a loaded CI runner can miss; polls return as soon as they pass, so a longer ceiling costs nothing.
    expect: { poll: { timeout: 4000 } },
    setupFiles: ["./test/setup.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: "chromium" }],
      viewport: { width: 1024, height: 768 },
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/._*", "src/index.ts", "src/exports/**", "src/**/*.d.ts", "src/components/charts/geo/**"],
      reporter: ["text-summary", "html", "json-summary", "lcov"],
      reportsDirectory: "./coverage",
      // Always enforced (CI and `pnpm verify`): `pnpm test:coverage` fails below these.
      // Per file as well, so one file cannot sink to near zero behind a healthy total. The floor stays at 55 % lines / 25 % branches:
      // measured 16 Nov 2026 (total 93.2 % lines / 81.2 % branches over 446 files), the files under 70 % lines are
      // charts/candlestick-chart/interaction.ts (59.7 / 56.3: pointer-drag paths only exercised in the browser e2e),
      // charts/network-graph/refs.ts (57.1: ref plumbing), animated-beam.tsx (36.6 while its motion tests were being
      // rewritten) and the type-only charts/gantt/types.ts (80 / 25). Raising the floor to 70 would fail those four, so it
      // rises only with tests for them; the files at 0 % in that run were new, untested chart pages (bump, error-bar,
      // population-pyramid), which this floor is what catches.
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 80,
        "src/**": { lines: 55, branches: 25, perFile: true },
      },
    },
  },
});
