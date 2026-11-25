// The docs search (Ctrl/Cmd + K) finds a page by the name of an export, including the exports of gallery and foundation pages.

import { expect, test } from "@playwright/test";

import { urlFor } from "./routes";

const CASES: [query: string, route: string][] = [
  ["ChartCard", "/charts"],
  ["MenuItem", "/overlays/dropdown-menu"],
  ["useTheme", "/foundations"],
  ["SheenBackdrop", "/foundations"],
  ["SegmentedControl", "/forms/segmented-control"],
];

for (const [query, route] of CASES) {
  test(`searching ${query} opens ${route}`, async ({ page }) => {
    await page.goto(urlFor("/"), { waitUntil: "domcontentloaded" });
    await page.locator("main h1").first().waitFor();
    const box = page.getByRole("combobox").first();
    // The prerendered page shows its h1 before React has hydrated, and a shortcut pressed then is lost (the listener
    // is not attached yet). Press again until the palette opens; closing first keeps a late hydration from toggling it shut.
    await expect(async () => {
      if (!(await box.isVisible())) await page.keyboard.press("ControlOrMeta+k");
      await expect(box).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 20_000 });
    await box.fill(query);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${route.replace(/\//g, "\\/")}/?$`));
  });
}
