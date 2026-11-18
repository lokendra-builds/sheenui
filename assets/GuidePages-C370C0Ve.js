import{t as e}from"./GuideArticle-C-o4yp6k.js";import"./guides-BOD_LkRi.js";import"./guide-images-CcTVZ8vq.js";import"./router-XutXN1EB.js";import{t}from"./vendor-react-D30i__oY.js";var n=`---
title: "Glassmorphism Accessibility: Contrast & Fallbacks | SheenUI"
description: "Glassmorphism accessibility in React: WCAG contrast on glass, prefers-reduced-transparency, prefers-contrast, forced colors and reduced motion, with code."
slug: "accessible-glassmorphism"
route: "/guides/accessible-glassmorphism"
targetKeyword: "glassmorphism accessibility"
secondaryKeywords: ["accessible glassmorphism react", "prefers-reduced-transparency css", "glassmorphism contrast"]
published: "2026-11-08"
updated: "2026-11-12"
relatedRoutes: ["/components/glass-card", "/foundations", "/components/switch", "/effects/liquid-glass", "/components/button"]
---

# Accessible Glassmorphism

Glassmorphism accessibility comes down to two things: text keeps its contrast over the worst point of the backdrop, and the glass turns solid for people who ask for less transparency, more contrast or forced colors. Both are testable, and neither needs you to give up the look. This guide shows how we measure and how we respond, with code we ran against SheenUI's own docs pages.

SheenUI is our library, and where we cite numbers about it they come from its source or from scripts we ran on 8 Nov 2026. See the [Glass card page](https://lokendra-builds.github.io/sheenui/components/glass-card) for the surfaces we tested.

Basis: WCAG 2.2 and the Nielsen Norman Group review as linked, plus the measurement scripts shown in this guide, which the text says were run against SheenUI's own docs pages on 8 Nov 2026. First published 8 Nov 2026, last revised 12 Nov 2026; a revision date marks an edit of the text, not a new measurement run.

## Why glass UI fails real users

Nielsen Norman Group's review of the style says that if overused, [glassmorphism can pose significant accessibility and usability challenges](https://www.nngroup.com/articles/glassmorphism/). Its recommendations are to meet contrast requirements across every background area, to use more blur over intricate backgrounds, and to let users control contrast or transparency where feasible. It gives no contrast numbers, so we use WCAG's.

Three things go wrong in practice:

- **The background moves under the text.** Contrast is a property of a text and background pair. On glass the background is different at every pixel and can change while an animation plays.
- **Edges disappear.** WCAG 1.4.11 asks for [3:1 contrast for UI component boundaries](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). A white 1px border on a light backdrop does not make it.
- **Some people cannot read through translucency at all.** That is a setting at the OS level, and your CSS can listen to it.

## Measuring contrast on glass

WCAG 2's [text contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) is 4.5:1 for normal text and 3:1 for large text. To check it on glass, measure the worst pixel behind the text, not an average and not the CSS color.

First, do not rely on an automated checker alone. We ran axe-core 4.14.0 on the Glass card docs page. It reported 0 violations, but marked \`color-contrast\` as "needs review" on 208 nodes, because it cannot compute a ratio over gradients and backdrops:

\`\`\`ts
// file: axe-run.ts
import { chromium } from "playwright";
import axe from "axe-core";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:5180/sheenui/components/glass-card");
await page.addScriptTag({ content: axe.source });

const results = await page.evaluate(() => (globalThis as unknown as { axe: typeof import("axe-core") }).axe.run());
console.log("violations:", results.violations.length);
for (const item of results.incomplete) console.log("needs review:", item.id, item.nodes.length);
await browser.close();
\`\`\`

So sample the pixels instead. This script hides an element's text, screenshots what is left (backdrop, tint and blur) and returns the lowest contrast ratio between the text color and any pixel:

\`\`\`ts
// file: measure.ts
import { chromium, type Page } from "playwright";

type RGB = [number, number, number];

const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: RGB) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

/** Worst-case contrast of an element's text over the pixels actually painted behind it. */
export async function worstContrast(page: Page, selector: string) {
  const target = page.locator(selector).first();
  // 1. The text color, converted to sRGB by a canvas (computed colors may be oklch()).
  const text = await target.evaluate((el): RGB => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.fillStyle = getComputedStyle(el).color;
    ctx.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  });
  // 2. Hide the glyphs, so the screenshot shows only the backdrop, the tint and the blur.
  await target.evaluate((el) => el.setAttribute("style", \`\${el.getAttribute("style") ?? ""};color:transparent;text-shadow:none\`));
  const png = (await target.screenshot()).toString("base64");
  await target.evaluate((el) => el.setAttribute("style", (el.getAttribute("style") ?? "").replace(";color:transparent;text-shadow:none", "")));
  // 3. Read every pixel and keep the lowest ratio.
  const pixels = await page.evaluate(async (data) => {
    const bitmap = await createImageBitmap(await (await fetch(\`data:image/png;base64,\${data}\`)).blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    return Array.from(ctx.getImageData(0, 0, bitmap.width, bitmap.height).data);
  }, png);
  let worst = Infinity;
  for (let i = 0; i < pixels.length; i += 4) worst = Math.min(worst, ratio(text, [pixels[i] ?? 0, pixels[i + 1] ?? 0, pixels[i + 2] ?? 0]));
  return worst;
}

const browser = await chromium.launch();
for (const colorScheme of ["light", "dark"] as const) {
  const page = await browser.newPage({ colorScheme, viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:5180/sheenui/components/glass-card");
  await page.waitForSelector('[data-slot="glass-card-description"]');
  console.log(colorScheme, (await worstContrast(page, '[data-slot="glass-card-description"]')).toFixed(2));
}
await browser.close();
\`\`\`

On the Glass card docs page this printed 8.85:1 in light and 11.62:1 in dark for the muted description text. That is one element on one page at 1280 px, not a guarantee for every position of an animated backdrop. Take samples at several scroll positions and over the brightest and darkest part of your background.

SheenUI's token file documents the stricter version of this. Measured over its brightest backdrop blob, muted text reached 5.2:1 (light) bare and 6.7:1 on level-2 glass, and a control's 1px edge reached 3.1:1 in light and 3.6:1 in dark. The same notes record that its plain light-theme red and green status colors reach only about 2.1 and 1.5 against that backdrop as a control edge, so they are not used for borders. A measurement caught what looking would not.

Dark mode needs its own tint, not an inverted one. SheenUI's glass stylesheet records why: over the brightest part of a dark backdrop, a white frost lifted the background so far that status, accent and caption text on small glass dropped to about 3.3:1. The fix was a smoked tint, a dark translucent fill that darkens bright spots instead of lightening dark ones. If your dark theme uses white at low opacity, run the sampling script above in dark mode before you ship. SheenUI's [dark mode docs](https://lokendra-builds.github.io/sheenui/docs/dark-mode) show how the theme switch works, and the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) shows how the glass tokens reach your classes.

## prefers-reduced-transparency, and an in-app toggle

\`prefers-reduced-transparency: reduce\` is the direct signal. It is experimental: Chrome and Edge 118 support it, Firefox only behind a flag from version 113, and Safari does not ([MDN browser-compat-data 8.1.8](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency), 2 Nov 2026). Users enable the OS setting under Settings > Personalization > Colors > Transparency effects on Windows, System Settings > Accessibility > Display > Reduce transparency on macOS, and Accessibility > Display & Text Size > Reduce Transparency on iOS.

Because Safari cannot read it, add your own switch and mirror the rule under an attribute. In SheenUI, \`useReducedTransparency\` sets \`data-transparency="reduced"\` on \`<html>\` and stores it:

\`\`\`tsx
import { useReducedTransparency } from "@/components/sheenui/hooks/use-preferences";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { Switch, useReducedTransparency } from "@sheenui/theme";

export function TransparencySetting() {
  const [reduced, setReduced] = useReducedTransparency();
  return <Switch label="Reduce transparency" description="Show solid surfaces instead of glass." checked={reduced} onCheckedChange={setReduced} />;
}
\`\`\`

The CSS for all the preferences in one place, in plain CSS you can adapt:

\`\`\`css
:root {
  color-scheme: light dark;
  --glass-bg: light-dark(rgb(255 255 255 / 0.6), rgb(30 28 45 / 0.5));
  --glass-edge: light-dark(rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.12));
  --solid: light-dark(white, rgb(34 32 50));
}

.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-edge);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  backdrop-filter: blur(20px) saturate(160%);
}

.glass :focus-visible {
  outline: 2px solid;
  outline-offset: 2px;
}

@media (prefers-reduced-transparency: reduce) {
  .glass {
    background: var(--solid);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

[data-transparency="reduced"] .glass {
  background: var(--solid);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

@media (prefers-contrast: more) {
  .glass {
    background: var(--solid);
    border-color: CanvasText;
  }
}

@media (forced-colors: active) {
  .glass {
    background: Canvas;
    border: 1px solid CanvasText;
    box-shadow: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
\`\`\`

## prefers-contrast: more

\`prefers-contrast\` is widely supported: Chrome 96, Firefox 101, Safari 14.1 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)). \`more\` means the person wants stronger contrast, so replace the tint with a solid surface and give edges a full-contrast border, as above.

## forced-colors (Windows High Contrast)

In forced colors mode the browser replaces your colors with a system palette and, per [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors), forces \`box-shadow\` and \`text-shadow\` to none and removes non-URL \`background-image\`. Glass built from shadows and gradients loses its edge. The fix is a real border in system colors (\`Canvas\`, \`CanvasText\`), as in the last rule above. Support: Chrome 89, Firefox 89, Safari 16.

## Reduced motion for glass effects

Glass is often paired with moving backdrops, shimmer sweeps and pointer highlights. \`prefers-reduced-motion\` has been supported since Chrome 74, Firefox 63 and Safari 10.1. Stop ambient loops, drop parallax, and keep short fades. With Motion, \`MotionConfig reducedMotion="user"\` disables transform animations; see [Framer Motion examples](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples) for the pattern, and offer an in-app toggle as well.

## Focus rings and touch targets on glass

Focus indicators must survive translucency and forced colors. Use \`outline\`, not a \`box-shadow\` ring: shadows vanish in forced colors mode. Check the ring against the glass and the backdrop, not just the page (WCAG asks 3:1 for non-text contrast). Targets should be at least 24 by 24 CSS px under WCAG 2.2's [target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); SheenUI grows controls to 44 px on touch screens.

## Checklist, and testing with axe and Playwright

- Text is 4.5:1 (3:1 if large) over the worst backdrop sample, measured from pixels.
- Control edges and focus rings reach 3:1.
- Glass becomes solid under reduced transparency, more contrast and forced colors, and in your in-app toggle.
- Motion stops under \`prefers-reduced-motion\`.
- Nothing depends on a shadow to be visible.

Automate the preference checks. Chromium can emulate the media features through the DevTools protocol. We ran this against the real SheenUI CSS and it printed what the comments say:

\`\`\`ts
// file: emulate.ts
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage();
await page.goto("http://localhost:5180/sheenui/components/glass-card");
await page.waitForSelector(".glass-2");
const cdp = await page.context().newCDPSession(page);

async function blurWith(features: Record<string, string>) {
  await cdp.send("Emulation.setEmulatedMedia", { features: Object.entries(features).map(([name, value]) => ({ name, value })) });
  return page.locator(".glass-2").first().evaluate((el) => getComputedStyle(el).backdropFilter);
}

console.log(await blurWith({}));
console.log(await blurWith({ "prefers-reduced-transparency": "reduce" }));
await page.emulateMedia({ forcedColors: "active" });
console.log(await page.locator(".glass-2").first().evaluate((el) => getComputedStyle(el).backdropFilter));
await browser.close();
\`\`\`

In Chrome 156 the three lines were a \`blur(20px) saturate(1.9) brightness(1.05)\` backdrop filter, then \`none\`, then \`none\`. Under \`prefers-contrast: more\` the same surface kept its blur declared but gained an opaque background and a dark border, which has the same effect.

## When not to use glass

If your audience includes many low-vision users, or the screen is dense with text, use solid surfaces by default and glass only as a decorative frame. Glass also needs a vivid, controlled background; over user-uploaded images you cannot guarantee any contrast. See [Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react) for the most contrast-hostile variant, and [the tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial) for the base recipe.

## Frequently asked questions

### Is glassmorphism WCAG compliant?

It can be. WCAG does not forbid translucency; it asks for contrast ratios, which you can meet by using enough tint and by testing the worst backdrop sample. See the checklist above.

### Does \`prefers-reduced-transparency\` work in Safari?

No. Safari does not support the media query. Provide an in-app toggle that sets an attribute your CSS also listens to.

### How much blur is enough?

NN/g says more blur is better over intricate backgrounds. Blur alone does not guarantee contrast: tint does the work, and blur costs performance, so check [the performance guide](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance).

### Can automated tools check glass contrast?

Not reliably. On our docs page axe-core flagged 208 contrast checks as needing review. Sample the rendered pixels as shown above.
`,r=t();function i(){return(0,r.jsx)(e,{slug:`accessible-glassmorphism`,markdown:n})}export{i as default};