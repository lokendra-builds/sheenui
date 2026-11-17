// The home hero's headline word ("light." / "within.") must stay complete and visible in every look and in every
// transparency toggle combination (Reduce transparency, Lite glass, both): the refracting slab may bend it, but in the
// fallbacks it must sit BEHIND the word as a solid plate. Also guards the revenue odometer at rest: after the roll,
// one digit row per column is visible (no neighbour digits peeking above or below the figure).

import { expect, test } from "@playwright/test";

import { preferenceScript, settle, urlFor } from "./routes";

const STYLES = ["liquid", "aurora"] as const;
const THEMES = ["light", "dark"] as const;
const TOGGLES = [
  { name: "full glass", reduced: false, lite: false },
  { name: "reduce transparency", reduced: true, lite: false },
  { name: "lite glass", reduced: false, lite: true },
  { name: "reduce transparency + lite glass", reduced: true, lite: true },
];

for (const style of STYLES) {
  for (const theme of THEMES) {
    for (const toggle of TOGGLES) {
      test(`hero word is complete and visible: ${style} ${theme}, ${toggle.name}`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const flags =
          (toggle.reduced ? `localStorage.setItem("sheen:transparency","reduced");` : "") +
          (toggle.lite ? `localStorage.setItem("sheen:glass","lite");` : "");
        await context.addInitScript(preferenceScript(theme, style) + `try{${flags}}catch(e){}`);
        const page = await context.newPage();
        await page.goto(urlFor("/"), { waitUntil: "load" });
        const h1 = page.locator("#home-hero-title");
        await expect(h1).toBeVisible();
        await settle(page, 12); // the entrance (slab landing, word wipe) is over: no finite animation running
        const found = await page.evaluate(() => {
          const h = document.querySelector<HTMLElement>("#home-hero-title")!;
          const word = h.querySelector<HTMLElement>(".home-lightword .sheen-accent-text")!;
          const wrap = h.querySelector<HTMLElement>(".home-slabwrap");
          const chain: { opacity: number; visibility: string; clipPath: string }[] = [];
          for (let el: HTMLElement | null = word; el && el !== document.body; el = el.parentElement) {
            const s = getComputedStyle(el);
            chain.push({ opacity: Number(s.opacity), visibility: s.visibility, clipPath: s.clipPath });
          }
          const box = word.getBoundingClientRect();
          return {
            text: h.textContent.replace(/\s+/g, " ").trim(),
            word: word.textContent.trim(),
            chain,
            size: [box.width, box.height],
            // The slab is either absent, or behind the word (negative z-index in an isolated word box).
            slabZ: wrap ? getComputedStyle(wrap).zIndex : null,
            slabRefracting: Boolean(wrap?.querySelector("[data-refracting]")),
            fill: getComputedStyle(word).webkitTextFillColor,
            ink: getComputedStyle(word).backgroundImage,
          };
        });
        expect(found.text).toMatch(/\w+ \w+ components,? .+ (light|within)\.$/);
        expect(found.word).toMatch(/^(light|within)\.$/);
        for (const step of found.chain) {
          expect(step.opacity).toBe(1);
          expect(step.visibility).toBe("visible");
          expect(step.clipPath).toBe("none");
        }
        expect(found.size[0]).toBeGreaterThan(40);
        expect(found.ink).toContain("gradient");
        if (toggle.reduced || toggle.lite) {
          // No lens in the fallbacks: a slab, when drawn, never covers the word.
          if (found.slabZ !== null) expect(Number(found.slabZ)).toBeLessThan(0);
          expect(found.slabRefracting).toBe(false);
        }
        await context.close();
      });
    }
  }
}

// The home hero is the lamp story now (the six-card constellation with its "Revenue" odometer is no longer mounted), so the odometer
// checked here is the home page's "Number ticker" tile in the component wall below the hero (same NumberTicker, same wheel markup).
test("home odometer at rest shows one digit row per column", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(preferenceScript("dark", "liquid"));
  const page = await context.newPage();
  await page.goto(urlFor("/"), { waitUntil: "load" });
  await settle(page, 12);
  await page.locator(".wall-number").first().scrollIntoViewIfNeeded();
  await settle(page, 12);
  const bad = await page.evaluate(() => {
    const value = document.querySelector<HTMLElement>(".wall-number");
    if (!value) return ["no .wall-number"];
    const out: string[] = [];
    // Each digit wheel: a clipped window (clip-path) around a column of cells. At rest no roll is flagged and the clip
    // is exactly the cell: only one cell intersects the window.
    for (const column of value.querySelectorAll<HTMLElement>(".flex-col")) {
      const win = column.parentElement!;
      if (win.hasAttribute("data-rolling")) continue; // a tick in flight (the odometer ticks again every few seconds)
      const clip = getComputedStyle(win).clipPath;
      if (clip === "none") out.push("window not clipped at rest");
      const box = win.getBoundingClientRect();
      const em = parseFloat(getComputedStyle(win).fontSize);
      const top = box.top + 0.25 * em;
      const bottom = box.bottom - 0.25 * em;
      const rows = [...column.querySelectorAll<HTMLElement>(":scope > span")].filter((cell) => {
        const r = cell.getBoundingClientRect();
        return r.bottom > top + 1 && r.top < bottom - 1;
      });
      if (rows.length !== 1) out.push(`${rows.length} rows visible`);
    }
    return out;
  });
  expect(bad).toEqual([]);
  await context.close();
});
