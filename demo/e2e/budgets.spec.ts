// Design budgets that were only enforced by review (R1): measured on the built site, in a real browser.
//
//   (a) glass cost: at most MAX_BLUR_SURFACES elements with a `backdrop-filter` are in view at once, at every scroll position
//       (each one is a full-screen-sized blur pass on a phone GPU).
//   (b) touch (390 px): every visible interactive control has a hit area of at least 44 x 44 px (WCAG 2.5.5 / platform guidance;
//       measured as the real tap target: the region where `document.elementFromPoint` resolves to the control, a descendant of it
//       (a `.sheen-hit-area` child, its own `::after`) or its label; see `measureTargets`) and no text is
//       smaller than 12 px. The sizes below are a ratchet: today's known count per route, lowered as the fixes land. A count
//       above the baseline fails; a count below it passes and is printed as an annotation: lower BASELINE in the change that fixed it.
//
//   (c) scroll CLS: scrolling a page from top to bottom in steps adds at most MAX_SCROLL_CLS of cumulative layout shift
//       (layout-shift entries without recent input), at 1440 and at a 390 touch phone. Content that arrives, swaps or
//       un-hides while the visitor scrolls (a lazy island, an idle-hydrated block, a stage whose story ends) must reserve
//       its box. Set E2E_PORT to point the suite at another build.
//
//   BUDGET_MEASURE=1 prints the measured counts (JSON) instead of asserting the ratchet, to refresh BASELINE.

import { expect, test, type Page } from "@playwright/test";

import { preferenceScript, settle, urlFor } from "./routes";

const MAX_BLUR_SURFACES = 8;
const MIN_HIT = 44;
const MIN_FONT_PX = 12;
const ROUTES = [
  "/",
  "/foundations",
  "/components/button",
  "/components/tabs",
  "/components/dialog",
  "/components/data-table",
  "/charts",
  "/dashboards/saas",
  "/effects/liquid-glass",
];
/** The glass-cost sample: the touch-budget routes plus the blocks that stack the most glass. */
const GLASS_ROUTES = [...ROUTES, "/blocks/pricing"];

/** Known violations per route at 390 px (small hit areas, small text). Lower these as the fixes land; never raise them. */
const BASELINE: Record<string, { hit: number; text: number }> = {
  "/foundations": { hit: 0, text: 21 },
  "/components/button": { hit: 0, text: 12 },
  "/components/dialog": { hit: 0, text: 13 },
  "/components/data-table": { hit: 0, text: 19 },
  "/charts": { hit: 0, text: 123 },
  "/dashboards/saas": { hit: 0, text: 40 },
  "/effects/liquid-glass": { hit: 0, text: 4 },
};

async function blurSurfacesInView(page: Page): Promise<{ max: number; at: number; sample: string[] }> {
  return page.evaluate(async () => {
    const step = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const count = () => {
      const found: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("body *")) {
        const style = getComputedStyle(el);
        const filter =
          style.backdropFilter || (style as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter;
        if (!filter || filter === "none" || style.visibility === "hidden" || style.display === "none") continue;
        if (Number(style.opacity) === 0) continue;
        const r = el.getBoundingClientRect();
        if (
          r.width < 2 ||
          r.height < 2 ||
          r.bottom <= 0 ||
          r.top >= innerHeight ||
          r.right <= 0 ||
          r.left >= innerWidth
        )
          continue;
        found.push(`${el.tagName.toLowerCase()}.${(el.getAttribute("class") ?? "").split(/\s+/)[0]}`);
      }
      return found;
    };
    let max = 0;
    let at = 0;
    let sample: string[] = [];
    const total = document.documentElement.scrollHeight;
    for (let y = 0; y < total; y += Math.round(innerHeight * 0.75)) {
      window.scrollTo(0, y);
      await step();
      const found = count();
      if (found.length > max) {
        max = found.length;
        at = y;
        sample = found.slice(0, 12);
      }
    }
    window.scrollTo(0, 0);
    return { max, at, sample };
  });
}

/**
 * The real tap target of every interactive control, measured with `document.elementFromPoint`: a point counts for a control
 * when the element hit there is the control, one of its descendants (a `.sheen-hit-area` child, the control's own `::after`
 * resolves to the control) or the `<label>` associated with it. Where hit areas of neighbours overlap, only the topmost one
 * gets the point. The target is the extent of the credited points along the horizontal and vertical lines through the
 * control's centre, clipped to the viewport. Self-contained: it runs inside the page (`page.evaluate`).
 */
function measureTargets(hit: number): string[] {
  const small: string[] = [];
  const label = (el: Element) =>
    `${el.tagName.toLowerCase()}${el.getAttribute("aria-label") ? `[${el.getAttribute("aria-label")}]` : ""} "${el.textContent.trim().slice(0, 24)}"`;
  const interactive =
    "a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=menuitem], [role=switch], [role=checkbox], [role=radio], summary";
  const slop = 40; // how far past the control's box a hit area may reach
  for (const el of document.querySelectorAll<HTMLElement>(interactive)) {
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none" || el.closest("[aria-hidden=true], [inert]"))
      continue;
    // Inside a closed <details> (the /charts API reference) the content is not rendered: `content-visibility: hidden` leaves
    // stale boxes (some far past the page's end) but nothing there can be seen or tapped until the disclosure is open. Its
    // <summary> is the control that opens it and is measured like any other.
    const closed = el.closest("details:not([open])");
    if (closed && !(el.tagName === "SUMMARY" && el.parentElement === closed)) continue;
    if (el.matches("a[href]") && style.display === "inline") continue; // an inline link inside prose is exempt (WCAG 2.5.8)
    if (el.getBoundingClientRect().width === 0 || el.getBoundingClientRect().height === 0) continue;
    const box = el.getBoundingClientRect();
    // A control parked off-screen until it takes focus (the skip link) cannot be tapped, so it has no touch target.
    if (
      style.position === "fixed" &&
      (box.bottom <= 0 || box.top >= innerHeight || box.right <= 0 || box.left >= innerWidth)
    )
      continue;
    el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
    const r = el.getBoundingClientRect();
    // Still outside the viewport after scrolling it into view: no scroll position shows it, so nobody can tap it.
    if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
    const labels =
      el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement
        ? el.labels
        : null;
    const reaches = (x: number, y: number) => {
      const top = document.elementFromPoint(x, y);
      if (!top) return false;
      if (el.contains(top)) return true;
      const lab = top.closest("label");
      return Boolean(lab && labels && Array.from(labels).includes(lab));
    };
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let x0 = Infinity;
    let x1 = -Infinity;
    for (let x = Math.max(0, Math.floor(r.left - slop)); x <= Math.min(innerWidth - 1, Math.ceil(r.right + slop)); x++)
      if (reaches(x + 0.5, cy)) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x + 1);
      }
    let y0 = Infinity;
    let y1 = -Infinity;
    for (let y = Math.max(0, Math.floor(r.top - slop)); y <= Math.min(innerHeight - 1, Math.ceil(r.bottom + slop)); y++)
      if (reaches(cx, y + 0.5)) {
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y + 1);
      }
    const w = x1 > x0 ? x1 - x0 : 0;
    const h = y1 > y0 ? y1 - y0 : 0;
    // 0.5 px of rounding slack: the 44 px hit areas are rem based and land on half pixels.
    if (w < hit - 0.5 || h < hit - 0.5) small.push(`${label(el)} ${Math.round(w)}x${Math.round(h)}`);
  }
  return small;
}

async function touchViolations(page: Page, minHit: number, minFont: number) {
  const small = await page.evaluate(measureTargets, minHit);
  return page
    .evaluate(
      ([font]) => {
        const text: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const parent = node.parentElement;
          if (
            !parent ||
            !(node.textContent ?? "").trim() ||
            parent.closest("script, style, noscript, [aria-hidden=true]")
          )
            continue;
          const style = getComputedStyle(parent);
          if (style.visibility === "hidden" || style.display === "none") continue;
          const r = parent.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (parseFloat(style.fontSize) < font - 0.01)
            text.push(
              `${parent.tagName.toLowerCase()} ${style.fontSize} "${(node.textContent ?? "").trim().slice(0, 24)}"`,
            );
        }
        return { text };
      },
      [minFont] as const,
    )
    .then((r) => ({ small, text: r.text }));
}

test.describe("glass cost: backdrop-filter surfaces in view", () => {
  for (const route of GLASS_ROUTES) {
    test(`at most ${MAX_BLUR_SURFACES} at any scroll position: ${route}`, async ({ browser, baseURL }) => {
      test.setTimeout(90_000);
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, baseURL });
      try {
        await context.addInitScript(preferenceScript("dark", "liquid"));
        const page = await context.newPage();
        await page.goto(urlFor(route), { waitUntil: "domcontentloaded" });
        await page.locator("main h1").first().waitFor({ timeout: 30_000 });
        await settle(page, 12);
        const got = await blurSurfacesInView(page);
        test.info().annotations.push({ type: "blur surfaces", description: `${got.max} at y=${got.at}` });
        expect(
          got.max,
          `${got.max} backdrop-filter surfaces in view at y=${got.at}: ${got.sample.join(", ")}`,
        ).toBeLessThanOrEqual(MAX_BLUR_SURFACES);
      } finally {
        await context.close();
      }
    });
  }
});

test.describe("touch budget at 390 px: hit area and text size (ratchet)", () => {
  const measured: Record<string, { hit: number; text: number }> = {};
  for (const route of ROUTES) {
    test(route, async ({ browser, baseURL }) => {
      test.setTimeout(60_000);
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: browser.browserType().name() !== "firefox",
        deviceScaleFactor: 2,
        baseURL,
      });
      try {
        await context.addInitScript(preferenceScript("light", "liquid"));
        const page = await context.newPage();
        await page.goto(urlFor(route), { waitUntil: "domcontentloaded" });
        await page.locator("main h1").first().waitFor({ timeout: 30_000 });
        await settle(page, 12);
        const got = await touchViolations(page, MIN_HIT, MIN_FONT_PX);
        measured[route] = { hit: got.small.length, text: got.text.length };
        test.info().annotations.push({ type: "touch budget", description: JSON.stringify(measured[route]) });
        if (process.env.BUDGET_MEASURE) {
          console.log(
            `[budgets] ${route} ${JSON.stringify(measured[route])}\n  hit: ${got.small.slice(0, 30).join(" | ")}\n  text: ${got.text.slice(0, 8).join(" | ")}`,
          );
          return;
        }
        const base = BASELINE[route] ?? { hit: 0, text: 0 };
        expect(
          got.small.length,
          `${got.small.length} controls under ${MIN_HIT}x${MIN_HIT} px (baseline ${base.hit}): ${got.small.slice(0, 10).join(" | ")}`,
        ).toBeLessThanOrEqual(base.hit);
        expect(
          got.text.length,
          `${got.text.length} text runs under ${MIN_FONT_PX} px (baseline ${base.text}): ${got.text.slice(0, 10).join(" | ")}`,
        ).toBeLessThanOrEqual(base.text);
      } finally {
        await context.close();
      }
    });
  }
});

test.describe("touch target measurement (fixtures)", () => {
  const css = `<style>
    body { margin: 0; padding: 60px 100px; }
    .box { position: relative; display: block; inline-size: 20px; block-size: 20px; background: #888; border: 0; padding: 0; }
    .hit { position: absolute; inset-block-start: 50%; inset-inline-start: 50%; transform: translate(-50%, -50%); inline-size: 44px; block-size: 44px; }
    .cover { position: absolute; inset-block-start: 40px; inset-inline-start: 90px; inline-size: 60px; block-size: 60px; background: #ccc; }
  </style>`;
  async function measure(browser: import("@playwright/test").Browser, body: string): Promise<string[]> {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    try {
      const page = await context.newPage();
      await page.setContent(`${css}<main>${body}</main>`);
      return await page.evaluate(measureTargets, MIN_HIT);
    } finally {
      await context.close();
    }
  }
  test("a 20x20 button without a hit area fails", async ({ browser }) => {
    const got = await measure(browser, `<button class="box" aria-label="tiny"></button>`);
    expect(got).toHaveLength(1);
    expect(got[0]).toMatch(/ 2[01]x2[01]$/);
  });
  test("a hit area covered by a sibling does not count", async ({ browser }) => {
    const got = await measure(
      browser,
      `<button class="box" aria-label="covered"><span class="hit" aria-hidden="true"></span></button><div class="cover"></div>`,
    );
    expect(got).toHaveLength(1);
  });
  test("a .sheen-hit child area of 44x44 passes", async ({ browser }) => {
    const got = await measure(
      browser,
      `<span role="switch" aria-checked="false" class="box"><span class="hit" aria-hidden="true"></span></span>`,
    );
    expect(got).toEqual([]);
  });
  test("a label associated with the input credits its area, a foreign label does not", async ({ browser }) => {
    const ok = await measure(
      browser,
      `<label style="display:block;padding:12px 0"><input type="checkbox" style="margin:0;width:20px;height:20px"></label>`,
    );
    expect(ok).toEqual([]);
    const bad = await measure(
      browser,
      `<label for="other" style="display:block;padding:12px 0"><span>x</span></label><input type="checkbox" style="margin:0;width:20px;height:20px">`,
    );
    expect(bad).toHaveLength(1);
  });
  test("overlapping hit areas are credited to the topmost control only", async ({ browser }) => {
    const got = await measure(
      browser,
      `<div style="display:flex;gap:4px"><button class="box" aria-label="a"><span class="hit" aria-hidden="true"></span></button><button class="box" aria-label="b"><span class="hit" aria-hidden="true"></span></button></div>`,
    );
    expect(got).toHaveLength(1); // 24 px pitch: the later control's area sits on top, so only it keeps its full 44 px
    expect(got[0]).toContain("[a]");
  });
});

// (c) Layout shift while scrolling. The observer is installed before any page script runs and keeps a running sum of the
// layout-shift entries that did not follow a user input (a scroll is not an input for this purpose: it does not set
// `hadRecentInput`, so a shift caused by content that loads or swaps as it comes into view is counted).
const MAX_SCROLL_CLS = 0.01;
const CLS_ROUTES = [
  "/",
  "/foundations",
  "/components/button",
  "/components/tabs",
  "/components/dialog",
  "/components/popover",
  "/components/data-table",
  "/charts",
  "/charts/line-chart",
  "/dashboards/saas",
  "/effects/liquid-glass",
  "/blocks/pricing",
  "/guides",
  // Pages that shifted while scrolling once and were fixed: a stories tile that collapsed to height 0 (/showcase) and an
  // autoplaying accordion that grew the section above its neighbours (/layout/accordion).
  "/showcase",
  "/layout/accordion",
];
const CLS_VIEWPORTS = [
  { name: "1440", width: 1440, height: 900, touch: false },
  { name: "390", width: 390, height: 844, touch: true },
];

type ScrollCls = { total: number; sources: string[] };
type ClsWindow = Window & { __scrollCls?: ScrollCls };

/** Scrolls from the top to the very end in three-quarter-screen steps (the page may grow on the way), then reports the shift sum. */
async function scrollCls(page: Page): Promise<ScrollCls> {
  await page.evaluate(async () => {
    const frame = () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    let y = 0;
    for (let guard = 0; guard < 400; guard++) {
      const end = document.documentElement.scrollHeight - innerHeight;
      if (y >= end) break;
      y = Math.min(end, y + Math.round(innerHeight * 0.75));
      window.scrollTo(0, y);
      await frame();
      await pause(16);
    }
    // Let anything that was waiting on the last scroll position land.
    await pause(400);
    await frame();
  });
  return page.evaluate(() => (window as ClsWindow).__scrollCls ?? { total: 0, sources: [] });
}

test.describe(`scroll CLS: at most ${MAX_SCROLL_CLS} from top to bottom`, () => {
  for (const viewport of CLS_VIEWPORTS) {
    for (const route of CLS_ROUTES) {
      test(`${route} at ${viewport.name}`, async ({ browser, baseURL }) => {
        test.setTimeout(120_000);
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          hasTouch: viewport.touch,
          isMobile: viewport.touch && browser.browserType().name() !== "firefox",
          deviceScaleFactor: viewport.touch ? 2 : 1,
          baseURL,
        });
        try {
          await context.addInitScript(preferenceScript("light", "liquid"));
          await context.addInitScript(() => {
            const sum = { total: 0, sources: [] as string[] };
            (window as ClsWindow).__scrollCls = sum;
            type Shift = PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
              sources?: { node?: Node | null }[];
            };
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as Shift[]) {
                if (entry.hadRecentInput) continue;
                sum.total += entry.value;
                const node = entry.sources?.[0]?.node;
                const name =
                  node instanceof Element
                    ? `${node.tagName.toLowerCase()}.${(node.getAttribute("class") ?? "").split(/\s+/)[0]}`
                    : "?";
                sum.sources.push(`${entry.value.toFixed(4)} ${name} at ${Math.round(scrollY)}`);
              }
            }).observe({ type: "layout-shift", buffered: true });
          });
          const page = await context.newPage();
          await page.goto(urlFor(route), { waitUntil: "domcontentloaded" });
          await page.locator("main h1").first().waitFor({ timeout: 30_000 });
          await settle(page, 12);
          // Only what happens while scrolling counts: the load itself is covered by the motion gates.
          await page.evaluate(() => {
            const sum = (window as ClsWindow).__scrollCls;
            if (sum) {
              sum.total = 0;
              sum.sources.length = 0;
            }
          });
          const got = await scrollCls(page);
          test.info().annotations.push({ type: "scroll cls", description: got.total.toFixed(4) });
          expect(
            got.total,
            `cumulative layout shift ${got.total.toFixed(4)} while scrolling ${route} at ${viewport.name}; biggest: ${got.sources.slice(0, 6).join(" | ")}`,
          ).toBeLessThanOrEqual(MAX_SCROLL_CLS);
        } finally {
          await context.close();
        }
      });
    }
  }
});
