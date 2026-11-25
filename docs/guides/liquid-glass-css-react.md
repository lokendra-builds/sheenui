---
title: "Liquid Glass CSS & React with Safari Fallback | SheenUI"
description: "Liquid Glass CSS for React: Apple's iOS 26 look with an SVG displacement map, plus a frosted fallback for Safari and Firefox. Working code."
slug: "liquid-glass-css-react"
route: "/guides/liquid-glass-css-react"
targetKeyword: "liquid glass css"
secondaryKeywords: ["apple liquid glass css", "liquid glass react safari", "ios 26 liquid glass css"]
published: "2026-11-08"
updated: "2026-11-12"
relatedRoutes: ["/effects/liquid-glass", "/components/glass-card", "/components/button", "/navigation/navbar", "/foundations"]
---

# Apple Liquid Glass in CSS and React

Liquid Glass CSS is possible on the web, with one big limit: the refraction part works in Chromium only. This guide builds the effect step by step with an SVG displacement map inside `backdrop-filter`, wraps it in a React component, and shows the frosted-glass fallback that Safari and Firefox get.

SheenUI is our library, so we also show its `LiquidGlass` component at the end. The live version is on the [Liquid glass effect page](https://lokendra-builds.github.io/sheenui/effects/liquid-glass).

## What Liquid Glass is, and how it differs from frosted glass

Apple announced Liquid Glass on 9 June 2025 for iOS 26, iPadOS 26 and macOS Tahoe 26. Apple describes the material as one that [reflects and refracts its surroundings](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/), with specular highlights that react to movement.

The practical difference from the older frosted style (see [our glassmorphism tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial)) is this. Frosted glass only blurs what is behind it. Liquid Glass bends it, like a thick lens: the backdrop is shifted and magnified near the edges, and stays sharp in the middle. On the web we approximate that with a static map, not Apple's real-time rendering, so treat the result as a convincing imitation.

## How refraction works on the web

CSS has no "refract" function. The trick is `backdrop-filter` accepting a reference to an SVG filter, and one SVG primitive, [`feDisplacementMap`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap), which moves pixels according to a second image.

For every output pixel P, the filter reads the input at `P + scale × (R − 0.5, G − 0.5)`, where R and G come from the map image at P. A mid-gray map pixel (128, 128) means no shift. So you draw a map that is gray in the middle of the lens and pushes pixels along the surface normal near the rim. The rim width is called the bezel.

## Quick answer

Liquid Glass in CSS is a `backdrop-filter` that points at an SVG displacement filter. The smallest version:

```css
.lens {
  border-radius: 28px;
  backdrop-filter: blur(14px) saturate(160%); /* frosted fallback: Safari, Firefox */
}

/* Only where refraction works: a script sets data-refraction on <html> in Chromium. */
[data-refraction] .lens {
  backdrop-filter: url(#liquid) saturate(150%);
}
```

The `#liquid` filter is an `feGaussianBlur` followed by an `feDisplacementMap` that reads a map image (step 2). It refracts in Chromium only. Safari and Firefox keep the frosted rule, and `@supports` cannot choose between them, because those engines report `url()` as supported, so engine detection sets `data-refraction` (see Browser support). The steps below build the map, the filter, the rim and the React component.

Basis: the refraction was confirmed in Chromium 156; we could not confirm the Safari and Firefox rendering ourselves, and the support data is from MDN browser-compat-data 8.1.8 (2 Nov 2026). First published 8 Nov 2026, last revised 12 Nov 2026.

## Step by step

### 1. The displacement map

This function draws the map on a canvas for a rounded rectangle. It computes each pixel's distance in from the edge and the direction out of the shape, and pushes hardest at the edge, fading to nothing at the inner end of the bezel:

```tsx
// file: displacement-map.ts
export function createDisplacementMap(width: number, height: number, radius: number, bezel: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(width, height);
  const hx = width / 2;
  const hy = height / 2;
  const r = Math.min(radius, hx, hy);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - hx;
      const py = y + 0.5 - hy;
      // Signed distance to a rounded rectangle, and the direction pointing out of it.
      const qx = Math.abs(px) - (hx - r);
      const qy = Math.abs(py) - (hy - r);
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const depth = r - outside - Math.min(Math.max(qx, qy), 0); // pixels in from the edge
      let nx = 0;
      let ny = 0;
      if (qx > 0 && qy > 0) {
        nx = (qx / outside) * Math.sign(px);
        ny = (qy / outside) * Math.sign(py);
      } else if (qx > qy) nx = Math.sign(px);
      else ny = Math.sign(py);
      const t = Math.min(Math.max(depth / bezel, 0), 1); // 0 at the edge, 1 where the flat top begins
      const strength = depth < 0 ? 0 : (1 - t) ** 3; // steep at the edge, fading to nothing
      const i = (y * width + x) * 4;
      image.data[i] = 128 + nx * strength * 127;
      image.data[i + 1] = 128 + ny * strength * 127;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
```

The curve `(1 - t) ** 3` is a simple stand-in. SheenUI's own map derives the shift from a squircle profile and Snell's law for glass with an index of 1.5, which looks thicker.

### 2. The SVG filter and the element

Save the map as an image (or set it from the function above) and reference it from `feImage`. A light blur first gives the frosted look, then the displacement bends it:

```html
<svg width="0" height="0" aria-hidden="true" style="position: absolute">
  <filter id="liquid" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="2" edgeMode="duplicate" result="frost" />
    <feImage href="lens-map.png" x="0" y="0" width="320" height="120" preserveAspectRatio="none" result="map" />
    <feDisplacementMap in="frost" in2="map" scale="44" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>

<div class="lens">Liquid glass</div>
```

Set `color-interpolation-filters="sRGB"` so the map's gray is read as 128, not converted to linear light. The map's size must match the element's size. And do not set `x`, `y`, `width` or `height` on the `filter` element: SheenUI's source records that Chromium blanks the backdrop when a filter region is set.

### 3. The CSS, including a specular rim

```css
.lens {
  position: relative;
  width: 320px;
  height: 120px;
  border-radius: 40px;
  background: rgb(255 255 255 / 0.08);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  backdrop-filter: blur(14px) saturate(160%); /* the fallback everyone gets */
}

/* Only where refraction works: a script sets data-refraction on <html> (see the detection below). */
[data-refraction] .lens {
  -webkit-backdrop-filter: none;
  backdrop-filter: url(#liquid) saturate(150%);
}

/* A thin ring, brightest where light from the top left would catch it. */
.lens::after {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1.5px;
  border-radius: inherit;
  pointer-events: none;
  background: conic-gradient(
    from 0deg,
    rgb(255 255 255 / 0.3) 0deg 40deg,
    white 135deg,
    rgb(255 255 255 / 0.3) 200deg 240deg,
    white 315deg,
    rgb(255 255 255 / 0.3) 360deg
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}
```

### 4. The chromatic edge

Real glass splits colors slightly at a curved edge. Run three displacement passes with slightly different scales, keep one channel from each, and add them back with `screen`. Keep the split small, around 5%, or the edge shows color fringes and hairlines:

```html
<filter id="liquid-prism" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceGraphic" stdDeviation="2" edgeMode="duplicate" result="frost" />
  <feImage result="map" preserveAspectRatio="none" href="lens-map.png" x="0" y="0" width="320" height="120" />
  <feDisplacementMap in="frost" in2="map" scale="46.5" xChannelSelector="R" yChannelSelector="G" result="dr" />
  <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
  <feDisplacementMap in="frost" in2="map" scale="44" xChannelSelector="R" yChannelSelector="G" result="dg" />
  <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
  <feDisplacementMap in="frost" in2="map" scale="41.5" xChannelSelector="R" yChannelSelector="G" result="db" />
  <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
  <feBlend in="r" in2="g" mode="screen" result="rg" />
  <feBlend in="rg" in2="b" mode="screen" />
</filter>
```

## Browser support and feature detection

| Engine | `backdrop-filter: blur()` | `backdrop-filter: url(#svg)` | What to ship |
|---|---|---|---|
| Chrome and Edge (Chromium) | Chrome 76, Edge 79 | Refracts (confirmed in Chrome 156) | The lens |
| Safari | 18 unprefixed, `-webkit-` since 9 | Accepted but, as reported, draws nothing | Frosted glass |
| Firefox | 103 | Accepted but, as reported, draws nothing | Frosted glass |

Blur support comes from [MDN browser-compat-data 8.1.8](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) (2 Nov 2026). For the last column, one developer reports that Safari parses `backdrop-filter: url(#f)` and [renders nothing, so the feature query lies](https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07). We checked the part that matters for code: `CSS.supports("backdrop-filter", "url(#f)")` returned `true` in Playwright's Chromium 156, WebKit 27.2 and Firefox 159. So `@supports` cannot gate this. We could not confirm the blank rendering ourselves, because those WebKit and Firefox builds did not paint even a plain `blur()` backdrop in our automated screenshots on a Mac.

That leaves engine detection. Prefer `navigator.userAgentData` where it exists (Chromium only, per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData)) and fall back to the user agent string, excluding iOS browsers, which use WebKit:

```ts
// file: supports-refraction.ts
type BrandsNavigator = Navigator & { userAgentData?: { brands: { brand: string }[] } };

export function supportsRefraction(): boolean {
  if (typeof navigator === "undefined") return false;
  const brands = (navigator as BrandsNavigator).userAgentData?.brands;
  if (brands?.length) return brands.some((entry) => entry.brand === "Chromium");
  const ua = navigator.userAgent;
  return /\bChrom(e|ium)\/\d/.test(ua) && !/\b(CriOS|FxiOS|EdgiOS)\b/.test(ua);
}
```

In plain HTML and CSS, call it once at startup and let the stylesheet do the rest:

```ts
import { supportsRefraction } from "./supports-refraction";

if (supportsRefraction()) document.documentElement.dataset.refraction = "";
```

## The React component with its fallback

The component measures itself, draws a map at its own size, and applies the filter only when the engine supports it and the map exists. Otherwise it renders ordinary frosted glass:

```tsx
import { useEffect, useId, useState, useSyncExternalStore, type ComponentProps } from "react";
import { createDisplacementMap } from "./displacement-map";
import { supportsRefraction } from "./supports-refraction";

const subscribe = () => () => {};

type LensMap = { href: string; width: number; height: number };

export function RefractiveGlass({
  radius = 40,
  bezel = 32,
  scale = 44,
  style,
  children,
  ...props
}: ComponentProps<"div"> & { radius?: number; bezel?: number; scale?: number }) {
  const id = `lens-${useId().replace(/:/g, "")}`;
  const canRefract = useSyncExternalStore(subscribe, supportsRefraction, () => false);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<LensMap | null>(null);

  useEffect(() => {
    if (!canRefract || !el) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize[0];
      if (!box) return;
      const width = Math.round(box.inlineSize);
      const height = Math.round(box.blockSize);
      if (width > 1 && height > 1) setMap({ href: createDisplacementMap(width, height, radius, bezel), width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [canRefract, el, radius, bezel]);

  const filter = map ? `url(#${id}) saturate(150%)` : "blur(14px) saturate(160%)";

  return (
    <div
      ref={setEl}
      style={{ borderRadius: radius, WebkitBackdropFilter: "blur(14px) saturate(160%)", backdropFilter: filter, ...style }}
      {...props}
    >
      {map && (
        <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
          <filter id={id} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={2} edgeMode="duplicate" result="frost" />
            <feImage href={map.href} x={0} y={0} width={map.width} height={map.height} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="frost" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
}
```

This is a starting point, not production code. Drawing a map is per-pixel work, so a real component should cap the map size and throttle redraws while the element resizes. SheenUI caps maps at 240,000 pixels and redraws at most every 120 ms.

## Rules that keep it usable

- **One hero element, never body text.** Refraction distorts what is behind the glass. Use it on a button, a nav pill or a floating control, not on paragraphs.
- **Solid when transparency is off.** Reduced transparency, more contrast and forced colors should drop the lens for a solid surface. SheenUI's `LiquidGlass` does this by listening to all three media queries.
- **Budget the lenses.** Each lens runs an SVG filter per frame. SheenUI refracts at most 3 lenses at once; extra ones in view fall back to frosted glass until a slot frees.
- **Never animate size.** A new size means a new map. SheenUI only animates `scale` on hover and press.

## Liquid Glass button, navbar and hero

SheenUI is a copy-the-source library (the `@sheenui/theme` package is not on npm yet; add it from the shadcn registry or copy the files, see the [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) and the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation); the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) covers the CSS). `LiquidGlass` does the map drawing, the budget, the specular rim and every fallback above, in Chromium and elsewhere:

```tsx
import { LiquidGlass } from "@/components/sheenui/liquid-glass/liquid-glass";
// Package build (after the first npm release, or a packed tarball): import { LiquidGlass } from "@sheenui/theme";

export function Examples() {
  return (
    <div className="grid gap-6 p-8">
      <LiquidGlass shape="pill" interactive render={<a href="/signup" />} className="inline-flex px-6 py-3 font-medium">
        Get started
      </LiquidGlass>

      <LiquidGlass shape="pill" aberration={0.3} className="flex items-center gap-6 px-6 py-3" render={<nav aria-label="Main" />}>
        <a href="/docs">Docs</a>
        <a href="/pricing">Pricing</a>
      </LiquidGlass>

      <LiquidGlass variant="clear" shape="circle" refraction={1.4} className="grid size-40 place-items-center text-2xl font-bold">
        Play
      </LiquidGlass>
    </div>
  );
}
```

The default `regular` variant carries a tint that keeps text legible. The `clear` variant is barely tinted: keep text off it, or make it bold and large. For ordinary cards, use the [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card); for a nav, the [navbar](https://lokendra-builds.github.io/sheenui/navigation/navbar); and the [button page](https://lokendra-builds.github.io/sheenui/components/button) shows the glass variant.

## When not to use Liquid Glass

- **Safari, Firefox and iOS browsers.** They get frosted glass, not refraction. If the effect is the point of your design, you can't deliver it there.
- **Reading surfaces.** Refraction and body text fight each other. Use solid or frosted glass.
- **Many lenses on one page.** The cost is per lens, per frame. Use one or two.
- **Backgrounds with no detail.** A flat color shows nothing to bend.
- **Native apps.** This is DOM and SVG. In React Native, the native iOS 26 material is wrapped by libraries such as [`@callstack/liquid-glass`](https://github.com/callstack/liquid-glass) (version 0.8.2 on npm on 8 Nov 2026); check their platform limits yourself.

Read [the accessible glassmorphism guide](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism) before shipping, and [the performance guide](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance) for the costs.

## Frequently asked questions

### What is Liquid Glass in CSS and React?

Liquid Glass is Apple's glass material, announced on 9 June 2025 for iOS 26, iPadOS 26 and macOS Tahoe 26, which reflects and refracts what is behind it. On the web you build it with an SVG displacement map applied through `backdrop-filter` and wrap it in a React component. The refraction works in Chromium only; Safari and Firefox get frosted glass instead. SheenUI's `LiquidGlass` component packages this, with the fallback built in.

### Why doesn't Liquid Glass work in Safari?

Safari supports `backdrop-filter` with `blur()` and similar functions (unprefixed since version 18), but, as reported, it does not render SVG filters referenced from `backdrop-filter`. The declaration parses, so `@supports` says yes. Detect the engine and serve frosted glass.

### Does this work in React Native?

No. It relies on the DOM, CSS and SVG filters. React Native needs the native platform material, for example through a library like the one linked above.

### Can I use Liquid Glass for a whole page layout?

You can, but you should not. Use it for one or two controls, and keep content on solid or frosted surfaces.

### Does SheenUI support Firefox and Safari?

Yes, as frosted glass. `LiquidGlass` renders the same component there, with the refraction switched off.
