// Autoplay demos (the shared Example hook): play once per page view, never again on a re-scroll, announce nothing mid-play
// (aria-busy on the preview region), and never under reduced motion. Run it with
//   pnpm --filter demo exec playwright test autoplay --project chromium
import { expect, test } from "@playwright/test";

import { settle, urlFor } from "./routes";

// A tall viewport: the demo plays once 60 % of its stage is on screen.
test.use({ viewport: { width: 1440, height: 900 } });

const OPEN_FAQ = 'button[aria-expanded="true"]';

test("accordion demo autoplays once, with aria-busy while it plays, and not again on re-scroll", async ({ page }) => {
  await page.goto(urlFor("/layout/accordion"));
  const preview = page
    .locator("section", { has: page.getByRole("heading", { name: "FAQ" }) })
    .getByRole("tabpanel")
    .first();
  await page.getByRole("heading", { name: "FAQ" }).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 160));
  await expect(preview).toHaveAttribute("aria-busy", "true", { timeout: 4000 });
  await expect(preview).not.toHaveAttribute("aria-busy", "true", { timeout: 8000 });
  const settled = await preview.locator(OPEN_FAQ).first().textContent();
  // Scroll away and back several times: the open item must not move.
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await settle(page);
    await page.getByRole("heading", { name: "FAQ" }).scrollIntoViewIfNeeded();
    // Absence check: an autoplay would start within this window, so it is observed for 900 ms, not awaited.
    await page.waitForTimeout(900);
    await expect(preview).not.toHaveAttribute("aria-busy", "true");
    expect(await preview.locator(OPEN_FAQ).first().textContent()).toBe(settled);
  }
});

test("autoplay never starts under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(urlFor("/layout/accordion"));
  // The heading can be swapped by hydration while Playwright waits for it to be stable (a busy machine): retry the scroll.
  await expect(async () => {
    await page.getByRole("heading", { name: "FAQ" }).scrollIntoViewIfNeeded({ timeout: 3000 });
  }).toPass({ timeout: 15_000 });
  // Absence check: nothing may start by itself, so a fixed observation window is the assertion (not a wait for a state).
  await page.waitForTimeout(1200);
  await expect(
    page
      .locator("section", { has: page.getByRole("heading", { name: "FAQ" }) })
      .getByRole("tabpanel")
      .first(),
  ).not.toHaveAttribute("aria-busy", "true");
});
