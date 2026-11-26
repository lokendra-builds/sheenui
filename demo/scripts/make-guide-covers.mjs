// Renders the 14 guide covers (4 looks each: Liquid / Aurora x light / dark, 1200x630 WebP + 480 / 768 px srcset files)
// into demo/public/img as guide-<slug>-<style>-<theme>.webp. Each cover is a composition on the site's own look (glass chips,
// blobs, display type) around live captures of the docs site, so it needs the dev server: `pnpm dev`, then
//   node demo/scripts/make-guide-covers.mjs        (ONLY=<slug> renders one guide)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("@playwright/test");
const sharp = createRequire(import.meta.url)("sharp");
const CAPS = path.join(os.tmpdir(), "sheen-guide-caps");
const routes = {
  glasscard: "/components/glass-card",
  dialog: "/components/dialog",
  tabs: "/components/tabs",
  toast: "/components/toast",
  button: "/components/button",
  datatable: "/components/data-table",
  select: "/components/select",
  liquid: "/effects/liquid-glass",
  dock: "/effects/macos-dock",
  morph: "/effects/morphing-dialog",
  charts: "/charts/line-chart",
  dash: "/dashboards/web-analytics",
  login: "/blocks/glass-login",
  saas: "/dashboards/saas",
  components: "/components",
  foundations: "/foundations",
  install: "/docs/installation",
  switch: "/components/switch",
  ticker: "/effects/number-ticker",
  navbar: "/navigation/navbar",
  pricing: "/blocks/pricing",
};
const capLooks = [
  ["liquid", "light"],
  ["liquid", "dark"],
  ["aurora", "light"],
  ["aurora", "dark"],
];
const b = await chromium.launch();
fs.mkdirSync(CAPS, { recursive: true });
for (const [st, th] of capLooks) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript(
    ([s, t]) => {
      try {
        localStorage.setItem("sheen:style", s);
        localStorage.setItem("sheen:theme", t);
      } catch {
        // storage is optional
      }
    },
    [st, th],
  );
  const p = await ctx.newPage();
  for (const [k, r] of Object.entries(routes)) {
    await p.goto("http://127.0.0.1:5173/sheenui" + r, { waitUntil: "load" }).catch(() => undefined);
    await p.waitForTimeout(1800);
    await p.screenshot({
      path: `${CAPS}/${k}_${st}_${th}.png`,
      clip: {
        x: 296,
        y: { components: 400, install: 470 }[k] ?? 360,
        width: 1120,
        height: k === "login" || k === "pricing" || k === "dash" || k === "saas" ? 500 : 440,
      },
    });
  }
  await ctx.close();
}
await b.close();

const browser = await chromium.launch();
const OUT = new URL("../public/img", import.meta.url).pathname;
const G = {
  "install-frameworks": ["Install in Next.js and Vite", "Guide", ["install", "button", "dialog"]],
  "glassmorphism-react-tutorial": ["Glassmorphism React tutorial", "Tutorial", ["glasscard", "login", "button"]],
  "liquid-glass-css-react": ["Liquid Glass in CSS and React", "Effect", ["liquid", "glasscard"]],
  "accessible-glassmorphism": ["Accessible glassmorphism", "Accessibility", ["switch", "dialog", "foundations"]],
  "glassmorphism-vs-liquid-glass": ["Glassmorphism vs Liquid Glass", "Comparison", ["glasscard", "liquid"]],
  "backdrop-filter-performance": ["backdrop-filter performance", "Performance", ["dash", "saas"]],
  "accessible-react-charts": ["Accessible React charts", "Charts", ["charts", "dash"]],
  "framer-motion-examples": ["Framer Motion examples", "Motion", ["dock", "morph", "ticker"]],
  "framer-motion-to-motion": ["Framer Motion to Motion", "Migration", ["tabs", "toast", "morph"]],
  "base-ui-vs-radix": ["Base UI vs Radix", "Comparison", ["dialog", "select", "tabs"]],
  "best-glassmorphism-react-libraries": [
    "Best glassmorphism libraries",
    "Roundup",
    ["components", "glasscard", "dash"],
  ],
  "shadcn-alternatives": ["shadcn alternatives", "Roundup", ["button", "dialog", "datatable", "tabs"]],
  "shadcn-glassmorphism": ["shadcn glassmorphism", "How-to", ["glasscard", "dialog", "button"]],
  "glassmorphism-ui-prompt": ["Glassmorphism UI prompts", "AI prompts", ["login", "foundations"]],
};
const looks = [
  ["liquid", "light"],
  ["liquid", "dark"],
  ["aurora", "light"],
  ["aurora", "dark"],
];
const b64 = (f) => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
// The brand lockup from public/brand, in the variant that reads on the cover's theme: the FULL mark (ribbon S, orbit
// ring and star) over the wide "Sheenui" wordmark side by side, as one HTML snippet.
const BRAND = path.join(path.dirname(new URL(import.meta.url).pathname), "../public/brand");
const svgUri = (f) => "data:image/svg+xml;base64," + fs.readFileSync(path.join(BRAND, f)).toString("base64");
const lockup = (theme) =>
  `<img alt="" class="m" src="${svgUri(theme === "dark" ? "mark-a1.svg" : "mark-light.svg")}">` +
  `<img alt="" class="w" src="${svgUri(`wordmark-${theme}.svg`)}">`;

for (const [st, th] of looks) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce" });
  await ctx.addInitScript(
    ([s, t]) => {
      try {
        localStorage.setItem("sheen:style", s);
        localStorage.setItem("sheen:theme", t);
      } catch {
        // storage is optional
      }
    },
    [st, th],
  );
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:5173/sheenui/foundations", { waitUntil: "load" });
  await p.waitForTimeout(1500);
  for (const [slug, [title, kick, shots]] of Object.entries(G).filter(
    ([s]) => !process.env.ONLY || s === process.env.ONLY,
  )) {
    const imgs = shots.map((s) => b64(`${CAPS}/${s}_${st}_${th}.png`));
    await p.evaluate(
      ({ title, kick, imgs, logo }) => {
        document.getElementById("cover")?.remove();
        const d = document.createElement("div");
        d.id = "cover";
        const pos = [
          ["right:-40px;top:70px;width:640px;--r:3deg;z-index:1"],
          ["right:250px;top:300px;width:560px;--r:-4deg;z-index:2"],
          ["right:-20px;top:380px;width:480px;--r:2deg;z-index:3"],
          ["right:420px;top:40px;width:420px;--r:-2deg;z-index:0"],
        ];
        d.innerHTML =
          `<style>
       #cover{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:
        radial-gradient(60% 90% at 10% 0%,var(--sheen-blob-1),transparent 70%),radial-gradient(55% 80% at 70% 100%,var(--sheen-blob-2),transparent 70%),radial-gradient(50% 70% at 100% 10%,var(--sheen-blob-3),transparent 70%),radial-gradient(40% 60% at 0% 100%,var(--sheen-blob-4),transparent 70%),var(--sheen-bg);color:var(--sheen-fg);font-family:var(--sheen-font-sans)}
       #cover .k{position:absolute;left:64px;top:64px;padding:8px 16px;border-radius:999px;font-size:20px;font-weight:600;color:var(--sheen-accent)}
       #cover h1{position:absolute;left:64px;top:150px;width:470px;margin:0;font-family:var(--sheen-font-display);font-size:68px;line-height:1.04;font-weight:var(--sheen-display-weight,650);letter-spacing:-0.025em}
       #cover .b{position:absolute;left:40px;bottom:44px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;z-index:5}
       #cover .b .m{display:block;height:104px;width:auto}
       #cover .b .w{display:block;height:34px;width:auto;margin-left:24px}
       #cover .f{position:absolute;border-radius:24px;padding:10px;transform:rotate(var(--r));box-shadow:0 30px 60px -20px rgba(0,0,0,.45)}
       #cover .f img{display:block;width:100%;border-radius:16px;border:1px solid var(--sheen-border)}
      </style><div class="k glass-2">SheenUI ${kick}</div><h1>${title}</h1><div class="b">${logo}</div>` +
          imgs.map((s, i) => `<div class="f glass-3" style="${pos[i]}"><img src="${s}"></div>`).join("");
        document.body.appendChild(d);
      },
      { title, kick, imgs, logo: lockup(th) },
    );
    await p.waitForTimeout(500);
    const buf = await p.screenshot({ type: "png" });
    const name = `guide-${slug}-${st}-${th}`;
    await sharp(buf).webp({ quality: 80 }).toFile(`${OUT}/${name}.webp`);
    for (const w of [480, 768])
      await sharp(buf).resize({ width: w }).webp({ quality: 78 }).toFile(`${OUT}/${name}-${w}.webp`);
  }
  await ctx.close();
}
await browser.close();
