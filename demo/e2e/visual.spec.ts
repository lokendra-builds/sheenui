// Visual snapshots of ten key pages, each in two looks (Liquid light, Aurora dark), at 1440x900
// above the fold, with motion reduced so ambient backdrops and charts hold still.
// Baselines live next to this file (visual.spec.ts-snapshots/, git-ignored: ~1.7 MB each, one per
// page x look x engine x OS). Create or refresh them for this machine with:
//   pnpm e2e:visual:update
// CI keeps its Linux baselines on the orphan branch `visual-baselines` (see the header of ci.yml): the
// `visual` job compares with `--update-snapshots=none` and REQUIRE_VISUAL=1, so a missing baseline fails; the manual
// `update_snapshots` run regenerates and pushes them.

import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { expect, test } from "@playwright/test";

import { preferenceScript, settle, urlFor } from "./routes";

const PAGES = [
  "/",
  "/foundations",
  "/components/button",
  "/components/dialog",
  "/components/data-table",
  "/charts",
  "/charts/pie-chart",
  "/effects/liquid-glass",
  "/blocks/glass-login",
  "/dashboards/web-analytics",
];

const LOOKS = [
  { theme: "light", style: "liquid" },
  { theme: "dark", style: "aurora" },
] as const;

/** True when this platform and engine have at least one committed or locally created baseline. */
function hasBaselines(specFile: string, project: string): boolean {
  try {
    return readdirSync(join(dirname(specFile), "visual.spec.ts-snapshots")).some((f) =>
      f.endsWith(`-${project}-${process.platform}.png`),
    );
  } catch {
    return false;
  }
}

const slug = (path: string) => (path === "/" ? "home" : path.slice(1).replace(/\//g, "-"));

for (const { theme, style } of LOOKS) {
  test.describe(`${style} ${theme}`, () => {
    // Scale 1, not the engine default of 2 (Safari): baselines stay small enough to live in the repo.
    test.use({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      colorScheme: theme,
      reducedMotion: "reduce",
    });

    for (const path of PAGES) {
      test(path, async ({ page }, testInfo) => {
        // A fresh clone has no baselines (they are git-ignored). Skip with a notice instead of failing on "missing
        // snapshot"; CI sets REQUIRE_VISUAL=1 once its baselines exist, and `pnpm e2e:visual:update` creates them.
        const updating = testInfo.config.updateSnapshots === "all" || testInfo.config.updateSnapshots === "changed";
        if (!updating && process.env.REQUIRE_VISUAL !== "1" && !hasBaselines(testInfo.file, testInfo.project.name)) {
          console.warn(
            `visual: no ${testInfo.project.name}-${process.platform} baselines in e2e/visual.spec.ts-snapshots; skipping. Run \`pnpm e2e:visual:update\` once to create them (REQUIRE_VISUAL=1 makes this a failure).`,
          );
          testInfo.skip(true, "no visual baselines on this machine");
        }
        await page.addInitScript(preferenceScript(theme, style, true));
        await page.goto(urlFor(path), { waitUntil: "domcontentloaded" });
        await page.locator("main h1").first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        // Hydration, lazy chunks and chart entrance settle: no finite animation running for 12 frames.
        await page.waitForLoadState("networkidle"); // lazy chunks and images have arrived
        await settle(page, 12);
        await expect(page).toHaveScreenshot(`${slug(path)}-${style}-${theme}.png`, {
          mask: [page.locator("[data-visual-mask]")],
        });
      });
    }
  });
}
