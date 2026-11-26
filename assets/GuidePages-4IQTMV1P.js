import{t as e}from"./GuideArticle-BgNvfX9x.js";import"./guides-k3OSKJ-Y.js";import"./guide-images-DfUluOYJ.js";import"./router-KJTTT7HX.js";import{t}from"./vendor-react-D30i__oY.js";var n=`---
title: "backdrop-filter Performance: Fast Glassmorphism | SheenUI"
description: "backdrop-filter performance, measured: what blur costs, why a moving backdrop is the real problem, rules for fast glass, and a lite mode for weak devices."
slug: "backdrop-filter-performance"
route: "/guides/backdrop-filter-performance"
targetKeyword: "backdrop-filter performance"
secondaryKeywords: ["glassmorphism performance", "backdrop-filter blur lag", "css blur performance"]
published: "2026-11-08"
updated: "2026-11-14"
relatedRoutes: ["/components/glass-card", "/effects/liquid-glass", "/foundations", "/dashboards/web-analytics", "/charts"]
---

# backdrop-filter Performance: Fast Glassmorphism

Backdrop-filter performance depends on one thing more than any other: how much of the screen is blurred while what is behind it changes. We measured this on a real machine instead of repeating folklore. On an Apple M1, with a static backdrop, 32 full-screen blurred layers held 60 fps. With a moving backdrop, 8 of them did not. If you are chasing backdrop-filter blur lag on scroll or drag, those numbers show where it starts. To try the rules in your own app, start from the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation); the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) shows how the glass tokens reach your Tailwind classes.

Basis: one set of measurements on an Apple M1 in headed Chrome 156, as reported in this guide (first published 8 Nov 2026, last revised 14 Nov 2026; the date of the measurement run itself is not recorded). Browser-support facts are quoted from MDN browser-compat-data 8.1.8 (2 Nov 2026).

This guide gives those numbers with their limits, the rules SheenUI follows because of them, and the code for a "lite glass" mode. The glass surfaces mentioned are on the [Glass card page](https://lokendra-builds.github.io/sheenui/components/glass-card) and the [Foundations page](https://lokendra-builds.github.io/sheenui/foundations).

## What backdrop-filter costs

A surface with \`backdrop-filter\` makes the browser take what is painted behind it, filter it, and draw the result under the element's own content. If anything behind it changes (an animated background, a scroll, a video), the filtered copy must be redone. So the work grows with the area filtered, the number of surfaces, and how often the backdrop changes.

Two related facts from [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) shape the rules below. An ancestor with \`opacity\` below 1, a \`filter\`, a \`mask\`, a \`clip-path\` or a \`mix-blend-mode\` becomes a backdrop root, and the blur stops at it. And the property is baseline across browsers since September 2024.

### What we measured

Setup: Apple M1, headed Chrome 156, a 1440 by 900 viewport at 2x device pixel ratio, a backdrop of six drifting gradient blobs animated on the compositor, and N glass panels (\`blur(20px) saturate(160%)\` over a faint white tint). Each configuration ran twice for 3 seconds after a 1.2 second warm-up; the table gives the range across the two runs. The Mac was shared with other jobs (load average 12 to 15), so read the shape, not the exact values.

| Configuration | fps |
|---|---|
| 1 or 4 full-viewport blurred layers, moving backdrop | 60 |
| 8 full-viewport layers | 44 to 50 |
| 16 full-viewport layers | 22 to 26 |
| 32 full-viewport layers | 12 to 13 |
| 8, 16 or 32 full-viewport layers, **static** backdrop | 60 |
| 24 panels of 400 by 300, moving backdrop | 60 |
| 1 full-viewport SVG lens (refraction) | 60 |
| 4 full-viewport SVG lenses | 32 to 38 |
| 8 full-viewport SVG lenses | 15 to 19 |
| 8 SVG lenses of 400 by 300 | 60 |

What this shows, for this machine:

- **Area and a changing backdrop drive the cost.** Sixteen full-screen layers were free when nothing behind them moved and cost more than half the frame rate when something did.
- **The number of small panels barely mattered.** 24 panels of 400 by 300 (about two screens of area) held 60 fps.
- **Refraction costs more per area.** Four full-viewport lenses fell to 32 to 38 fps, where four plain blurs held 60.
- **Blur radius made no measurable difference.** Eight full-viewport layers ran at 44 to 50 fps with a 20 px blur and the same with 80 px.
- **Animating the blur radius** from 8 to 40 px on eight 400 by 300 panels still held 60 fps on this GPU, so we cannot show a cost for it here.

What it does not show: any phone, any low-end GPU, Safari or Firefox. Our automated WebKit and Firefox builds did not paint \`backdrop-filter\` in screenshots at all, so we have no numbers for them. Treat our figures as a ranking of what hurts, and measure on your own target devices.

## Measuring on your own page

In Chrome, open DevTools and show the Rendering tab (Command Menu, then "Show Rendering", [per the DevTools docs](https://developer.chrome.com/docs/devtools/rendering)). Turn on Frame Rendering Stats for a live FPS meter, Paint flashing to see what repaints, and Layer borders to see compositing layers. Then record a Performance trace while scrolling and look at the frames lane.

To log numbers from code, this function records frame gaps over a window. We ran it in the benchmark page above:

\`\`\`ts
export function measureFrames(ms = 3000): Promise<{ fps: number; p95: number; slowFrames: number }> {
  return new Promise((resolve) => {
    const stamps: number[] = [];
    const tick = (t: number) => {
      stamps.push(t);
      if (t - (stamps[0] ?? t) < ms) {
        requestAnimationFrame(tick);
        return;
      }
      const gaps = stamps.slice(1).map((stamp, i) => stamp - (stamps[i] ?? stamp));
      const sorted = [...gaps].sort((a, b) => a - b);
      resolve({
        fps: Math.round((gaps.length / ms) * 10000) / 10,
        p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
        slowFrames: gaps.filter((gap) => gap > 20).length,
      });
    };
    requestAnimationFrame(tick);
  });
}
\`\`\`

Call it while the interaction you care about runs (a scroll, a hover). Frames over 20 ms are the ones people notice.

## Rules that follow

1. **Pause animated backdrops.** This was the largest lever in our test. A moving wallpaper forces every glass surface above it to re-filter each frame. Pause ambient loops when they leave the screen, when the tab is hidden, and on reduced motion. SheenUI's loops do all three.
2. **Count area, not elements.** A few large panels cost more than many small ones. SheenUI's budget is at most 8 blurred surfaces in view and at most 3 refracting lenses, and it drops the blur on the smallest level (its chips use a tint and a rim, no blur at all).
3. **Never blur inside a blur.** The outer surface already is a backdrop root, so a nested blur can only blur the outer surface's own tint. SheenUI turns off \`backdrop-filter\` for glass nested in glass.
4. **Keep the radius moderate for look and for weak GPUs.** We could not measure a radius effect on an M1, but strong blurs wash out color and we only tested one GPU. SheenUI uses 20 px for cards, 32 px for dialogs and bars, and 8 px in lite mode.
5. **Do not animate the blur radius.** We did not see a cost on this GPU, but there is no reason to pay for it: animate the opacity or transform of the glass element and keep the blur constant.
6. **Avoid fading wrappers.** Besides being a performance habit, it breaks the blur (backdrop root). Animate the glass element itself.
7. **Budget refraction separately.** Our four-lens result fits SheenUI's cap of 3 lenses at once, where a lens that scrolls away hands its slot to the next. Read [Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react).
8. **Contain what you can.** \`contain: paint\` tells the browser an element's contents never paint outside its box, so it can skip them when the box is offscreen. We did not benchmark it, so use it where it is safe and measure the result.

## A lite-glass mode for weak devices

Give weak devices a cheaper surface, and let people choose it. In CSS it is an attribute on the root:

\`\`\`css
[data-glass="lite"] .glass {
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px) saturate(160%);
}
\`\`\`

SheenUI decides automatically on three signals: 4 GB of device memory or less, 4 or fewer CPU cores, or the Save-Data hint, plus a measured fallback: under 45 fps over a 2-second window once the entrance has settled. A saved choice by the visitor always wins. A minimal version of the same idea:

\`\`\`ts
type Hints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

export function isWeakDevice(): boolean {
  const nav = navigator as Hints;
  return (
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) ||
    nav.connection?.saveData === true
  );
}

if (isWeakDevice()) document.documentElement.dataset.glass = "lite";
\`\`\`

\`deviceMemory\` and the Save-Data hint exist in Chromium only (Chrome and Edge, not Firefox or Safari, per MDN browser-compat-data), so Safari and Firefox rely on the core count and your own toggle. With SheenUI the whole thing, including the visitor's switch, is two hooks:

\`\`\`tsx
import { useAutoLiteGlass } from "@/components/sheenui/backdrop/auto-lite";
import { useGlassMode } from "@/components/sheenui/hooks/use-preferences";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { Switch, useAutoLiteGlass, useGlassMode } from "@sheenui/theme";

export function GlassQuality() {
  useAutoLiteGlass();
  const [lite, setLite] = useGlassMode();
  return <Switch label="Lite glass" description="A cheaper blur for slower devices." checked={lite} onCheckedChange={setLite} />;
}
\`\`\`

## Safari specifics

Safari supports unprefixed \`backdrop-filter\` from version 18 and the \`-webkit-\` prefix since version 9 ([MDN browser-compat-data 8.1.8](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter), 2 Nov 2026), so ship both lines. SheenUI writes literal values in the prefixed line, because its source notes that older Safari ignored \`var()\` there. We did not measure real Safari hardware: test on an actual iPhone and Mac before you rely on any frame budget.

## Effect on INP

INP measures an interaction up to the moment the next frame is presented; web.dev lists [presentation delay](https://web.dev/articles/inp) as one of its three parts, and a good INP is 200 ms or less at the 75th percentile. A page that spends 40 ms per frame on blur can therefore make every interaction feel slower, even if your JavaScript is quick. Check INP on your own pages with real users or a field tool.

## Checklist

- Fewer than about 8 blurred surfaces in view, and no more than 3 lenses.
- Nothing behind the glass animates unless it has to, and it pauses off-screen.
- No \`opacity\`, \`filter\` or \`mask\` on ancestors of glass.
- A lite mode, automatic or manual, and a solid fallback for reduced transparency.
- Measured on a low-end phone, not only your laptop.

## When not to optimize, and the limits of these numbers

If your glass sits over a static background, our test suggests cost is small even at large sizes; you may never need lite mode. If your audience is on recent phones and your page has two or three panels, stop optimizing. The advice here matters for dashboards, hero sections with animated backdrops, and long pages full of cards. For an example of a page with many panels, see the [web analytics dashboard](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics).

## Frequently asked questions

### Why is my backdrop-filter laggy?

Usually because a large blurred area sits over something that changes every frame, such as an animated background, video or a scrolling list. Pause the movement, shrink the area, or reduce the number of layers.

### Does a bigger blur radius make it slower?

Not measurably on our M1: 20 px and 80 px ran the same. It may on weaker GPUs, which we did not test.

### Is backdrop-filter bad for mobile?

We did not measure phones. Use fewer and smaller surfaces, a lite mode and a real-device test. See [the accessibility guide](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism) for the solid fallbacks, which are also the cheapest surfaces.

### Can I use \`will-change: backdrop-filter\`?

We did not benchmark it. It can create extra layers and memory use, so apply it only to a surface you have measured.
`,r=t();function i(){return(0,r.jsx)(e,{slug:`backdrop-filter-performance`,markdown:n})}export{i as default};