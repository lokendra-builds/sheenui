// Phone and tablet layout guards that need real touch emulation: the navigation menu keeps its anchor when it flips above
// its trigger, and a props table is readable on a phone (cards below 40rem, a fading scroll region above it) instead of
// showing a blank-looking "Prop" column.

import { expect, test } from "@playwright/test";

import { preferenceScript, settle, urlFor } from "./routes";

test("navigation menu stays attached to its trigger when it flips upward", async ({ browser, browserName }) => {
  for (const [width, height, touch] of [
    [1440, 900, false],
    [390, 844, true],
  ] as const) {
    const emulation = touch ? { hasTouch: true, isMobile: browserName !== "firefox", deviceScaleFactor: 2 } : {};
    // The trigger can sit too high on the page to scroll it to the bottom edge (the stage above it is short on a wide
    // screen): so the viewport is made short enough (a fresh context: resizing a page with the menu open closes it) that
    // the trigger is 140 px from the bottom either way.
    const probe = await browser.newContext({ viewport: { width, height }, ...emulation });
    await probe.addInitScript(preferenceScript("dark", "liquid"));
    const probePage = await probe.newPage();
    await probePage.goto(urlFor("/navigation/navigation-menu"), { waitUntil: "domcontentloaded" });
    const probeTrigger = probePage.locator("main button", { hasText: "Products" }).first();
    await probeTrigger.waitFor();
    const reach = await probeTrigger.evaluate((el) => {
      const max = document.scrollingElement!.scrollHeight - window.innerHeight;
      return (
        el.getBoundingClientRect().top +
        window.scrollY -
        Math.min(max, Math.max(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight + 140))
      );
    });
    await probe.close();
    const context = await browser.newContext({
      viewport: { width, height: Math.min(height, Math.round(reach) + 140) },
      ...emulation,
    });
    await context.addInitScript(preferenceScript("dark", "liquid"));
    const page = await context.newPage();
    await page.goto(urlFor("/navigation/navigation-menu"), { waitUntil: "domcontentloaded" });
    const trigger = page.locator("main button", { hasText: "Products" }).first();
    await trigger.waitFor();
    // Trigger near the bottom edge so there is no room below and the panel must flip to the top.
    await trigger.evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight + 140),
    );
    await settle(page);
    await trigger.focus();
    await page.keyboard.press("Enter");
    const popup = page.locator("[data-slot=navigation-menu-popup]");
    await popup.waitFor();
    await settle(page, 12);
    const m = await page.evaluate(() => {
      const t = [...document.querySelectorAll("main button")]
        .find((b) => b.textContent.trim().startsWith("Products"))!
        .getBoundingClientRect();
      const p = document.querySelector("[data-slot=navigation-menu-popup]")!.getBoundingClientRect();
      const side = document.querySelector("[data-side]")?.getAttribute("data-side");
      return {
        side,
        gap: side === "top" ? t.top - p.bottom : p.top - t.bottom,
        left: p.left,
        right: p.right,
        top: p.top,
        vw: window.innerWidth,
      };
    });
    expect(m.side, `${width}px: panel flipped`).toBe("top");
    expect(m.gap, `${width}px: gap between trigger and panel`).toBeGreaterThanOrEqual(0);
    expect(m.gap, `${width}px: gap between trigger and panel`).toBeLessThanOrEqual(14);
    expect(m.left, `${width}px: panel inside the viewport`).toBeGreaterThanOrEqual(0);
    expect(m.right, `${width}px: panel inside the viewport`).toBeLessThanOrEqual(m.vw);
    expect(m.top, `${width}px: panel top inside the viewport`).toBeGreaterThanOrEqual(0);
    await context.close();
  }
});

test("a props table on a phone is a stack of cards, and just above it a scroll region with a fade", async ({
  browser,
  browserName,
}) => {
  for (const width of [320, 390, 520, 700]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      hasTouch: true,
      isMobile: browserName !== "firefox",
      deviceScaleFactor: 2,
    });
    await context.addInitScript(preferenceScript("light", "liquid"));
    const page = await context.newPage();
    await page.goto(urlFor("/components/table"), { waitUntil: "domcontentloaded" });
    const region = page
      .locator("[role=region]")
      .filter({ has: page.locator("th:text-is('Prop')") })
      .first();
    await region.waitFor();
    await settle(page);
    const m = await region.evaluate((el) => {
      const rows = [...el.querySelectorAll("tbody tr")];
      const labels = [...el.querySelectorAll("td[data-label]")].filter(
        (td) => getComputedStyle(td, "::before").content !== "none",
      ).length;
      return {
        fade: (el as HTMLElement).dataset.fade,
        sw: el.scrollWidth,
        cw: el.clientWidth,
        rows: rows.length,
        tallest: Math.max(...rows.map((r) => r.getBoundingClientRect().height)),
        labels,
      };
    });
    if (width < 640) {
      expect(m.sw, `${width}px: cards fit, no sideways scroll`).toBeLessThanOrEqual(m.cw + 1);
      expect(m.labels, `${width}px: cells carry their column name`).toBeGreaterThan(0);
    } else {
      expect(m.fade, `${width}px: scrolls sideways, so the edge fades`).toBe(m.sw > m.cw + 4 ? "end" : "none");
    }
    // No row may be mostly blank: a row is never taller than its content needs (a prop card is < 260 px even with 3 lines of text).
    expect(m.tallest, `${width}px: tallest row`).toBeLessThan(260);
    await context.close();
  }
});
