// The docs header (menu, logo, search, style and theme switches, GitHub) must fit the viewport on a phone: nothing in it may
// widen the page, and no two of its controls (or the wordmark) may overlap. Checked at 320, 360 and 390 px WITH touch
// emulation (a fine-pointer 390 px page renders 36 px controls and hides the bug a real phone shows: 44 px controls
// crowding the wordmark) on the longest-text routes, the newest routes and a long guide page, in both style presets.
// Also guards the sticky toolbar's height on a landscape iPad (1024x768) and a landscape phone (844x390), and that a
// focused field is never left under the sticky header.

import { expect, test } from "@playwright/test";

import { preferenceScript, settle, urlFor } from "./routes";

const WIDTHS = [320, 360, 390];
const STYLES = ["liquid", "aurora"] as const;
const ROUTES = [
  "/",
  "/components/button",
  "/forms/field",
  "/charts/line-chart",
  "/dashboards/saas",
  "/guides",
  "/guides/install-frameworks",
  "/components/table",
  "/components/button-group",
  "/navigation/sidebar",
  "/layout/aspect-ratio",
  "/layout/pagination",
  "/layout/resizable",
  "/forms/input-group",
  "/docs/tailwind-v4",
  "/docs/dark-mode",
  "/docs/base-ui",
];

for (const style of STYLES) {
  for (const width of WIDTHS) {
    test(`header fits at ${width}px, touch (${style})`, async ({ browser, browserName }) => {
      const context = await browser.newContext({
        viewport: { width, height: 800 },
        hasTouch: true,
        isMobile: browserName !== "firefox",
        deviceScaleFactor: 2,
      });
      await context.addInitScript(preferenceScript("light", style));
      const page = await context.newPage();
      const problems: string[] = [];
      for (const path of ROUTES) {
        await page.goto(urlFor(path), { waitUntil: "domcontentloaded" });
        await page.locator("header").first().waitFor();
        await settle(page);
        const found = await page.evaluate(() => {
          const el = document.scrollingElement!;
          const header = document.querySelector("header")!;
          const box = header.getBoundingClientRect();
          const visible = [...header.querySelectorAll<HTMLElement>("a, button")].filter((node) => {
            const r = node.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && getComputedStyle(node).visibility !== "hidden";
          });
          const name = (node: HTMLElement) =>
            node.getAttribute("aria-label") ?? (node.textContent.trim() || node.tagName);
          const overlaps: string[] = [];
          for (let i = 0; i < visible.length; i++) {
            for (let j = i + 1; j < visible.length; j++) {
              const first = visible[i];
              const second = visible[j];
              if (!first || !second) continue;
              const a = first.getBoundingClientRect();
              const b = second.getBoundingClientRect();
              const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (w > 1 && h > 1) overlaps.push(`"${name(first)}" and "${name(second)}" overlap by ${Math.round(w)}px`);
            }
          }
          // The wordmark (or the mark alone) must also stay clear of the right-hand group, even when it is clipped.
          const logo = header.querySelector<HTMLElement>('a[aria-label="SheenUI home"]')?.getBoundingClientRect();
          const search = header
            .querySelector<HTMLElement>('button[aria-label="Search the docs"]')
            ?.getBoundingClientRect();
          if (logo && search && logo.right > search.left + 1)
            overlaps.push(
              `wordmark ends at ${Math.round(logo.right)}px, Search starts at ${Math.round(search.left)}px`,
            );
          return {
            page: el.scrollWidth - el.clientWidth,
            header: Math.max(0, Math.round(box.right - window.innerWidth)),
            overlaps,
            coarse: matchMedia("(any-pointer: coarse)").matches,
          };
        });
        if (found.page > 0 || found.header > 0)
          problems.push(`${path}: page ${found.page}px, header ${found.header}px too wide`);
        for (const overlap of found.overlaps) problems.push(`${path}: ${overlap}`);
        // The point of touch emulation: the coarse-pointer layout must really be the one measured (Firefox cannot emulate it).
        if (browserName !== "firefox" && !found.coarse) problems.push(`${path}: not measured with a coarse pointer`);
      }
      expect(problems, problems.join("\n")).toEqual([]);
      await context.close();
    });
  }
}

const TABLETS = [
  { name: "iPad landscape 1024x768", width: 1024, height: 768, maxRows: 2, maxShare: 0.15 },
  { name: "landscape phone 844x390", width: 844, height: 390, maxRows: 2, maxShare: 0.45 },
];

for (const tablet of TABLETS) {
  test(`header toolbar stays compact on ${tablet.name}`, async ({ browser, browserName }) => {
    const context = await browser.newContext({
      viewport: { width: tablet.width, height: tablet.height },
      hasTouch: true,
      isMobile: browserName !== "firefox",
      deviceScaleFactor: 2,
    });
    await context.addInitScript(preferenceScript("light", "liquid"));
    const page = await context.newPage();
    for (const path of ["/components/table", "/overlays/side-drawer"]) {
      await page.goto(urlFor(path), { waitUntil: "domcontentloaded" });
      await page.locator("header").first().waitFor();
      await settle(page);
      const m = await page.evaluate(() => {
        const header = document.querySelector("header")!;
        const rows = new Set(
          [...header.querySelectorAll("a, button")]
            .filter((n) => n.getBoundingClientRect().width > 0)
            .map((n) => Math.round(n.getBoundingClientRect().top / 20)),
        );
        return {
          height: header.getBoundingClientRect().height,
          vh: window.innerHeight,
          rows: rows.size,
          sticky: getComputedStyle(header).position === "sticky",
        };
      });
      // A pinned header may take at most `maxShare` of the viewport on the iPad; a landscape phone header is not pinned at all.
      if (m.sticky)
        expect(m.height / m.vh, `${path} sticky header is ${m.height}px of ${m.vh}px`).toBeLessThanOrEqual(
          tablet.maxShare,
        );
      expect(m.height / m.vh, `${path} header is ${m.height}px of ${m.vh}px`).toBeLessThanOrEqual(
        tablet.maxShare + (m.sticky ? 0 : 0.2),
      );
      expect(m.rows, `${path} header control rows`).toBeLessThanOrEqual(tablet.maxRows);
    }
    await context.close();
  });
}

test("a focused field is not left under the sticky header (390 px, touch)", async ({ browser, browserName }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: browserName !== "firefox",
    deviceScaleFactor: 2,
  });
  await context.addInitScript(preferenceScript("light", "liquid"));
  const page = await context.newPage();
  await page.goto(urlFor("/overlays/side-drawer"), { waitUntil: "domcontentloaded" });
  await page.locator("header").first().waitFor();
  await settle(page);
  const problems: string[] = [];
  const seen: string[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); // focus scroll applied
    const m = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      const header = document.querySelector("header")!.getBoundingClientRect();
      if (!el || el === document.body || el.closest("header") || el.closest("[role=dialog]")) return null;
      const r = el.getBoundingClientRect();
      return {
        label: el.getAttribute("aria-label") ?? (el.textContent.trim().slice(0, 24) || el.tagName),
        top: r.top,
        bottom: r.bottom,
        headerBottom: header.bottom,
        vh: window.innerHeight,
        stuck: getComputedStyle(document.querySelector("header")!).position === "sticky",
      };
    });
    if (!m || m.label === "Skip to content" || m.bottom - m.top >= m.vh) continue; // the skip link is fixed by design; a container taller than the screen is not a field
    seen.push(m.label);
    if (m.stuck && m.top < m.headerBottom - 1)
      problems.push(`"${m.label}" top ${Math.round(m.top)} is under the header (bottom ${Math.round(m.headerBottom)})`);
    if (m.bottom > m.vh + 1) problems.push(`"${m.label}" bottom ${Math.round(m.bottom)} is below the viewport`);
  }
  expect(seen.length, "tabbed through some page controls").toBeGreaterThan(5);
  expect(problems, problems.join("\n")).toEqual([]);
  await context.close();
});
