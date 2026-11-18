import{t as e}from"./GuideArticle-C-o4yp6k.js";import"./guides-BOD_LkRi.js";import"./guide-images-CcTVZ8vq.js";import"./router-XutXN1EB.js";import{t}from"./vendor-react-D30i__oY.js";var n=`---
title: "Glassmorphism vs Liquid Glass vs Neumorphism | SheenUI"
description: "Glassmorphism vs Liquid Glass vs Neumorphism: how each works in CSS, browser support, accessibility and cost, when to use which, with React code."
slug: "glassmorphism-vs-liquid-glass"
route: "/guides/glassmorphism-vs-liquid-glass"
targetKeyword: "glassmorphism vs liquid glass"
secondaryKeywords: ["glassmorphism vs neumorphism", "glassmorphism vs claymorphism", "what is liquid glass"]
published: "2026-11-08"
updated: "2026-11-12"
relatedRoutes: ["/components/glass-card", "/effects/liquid-glass", "/foundations", "/components/button"]
---

# Glassmorphism vs Liquid Glass vs Neumorphism

The short version of glassmorphism vs Liquid Glass: glassmorphism blurs what is behind a surface, Liquid Glass bends it like a lens, and neumorphism has no transparency at all, it extrudes shapes from a flat background with two shadows. They look related but they are different techniques, with different browser support, accessibility problems and costs.

Basis: browser support quoted from MDN browser-compat-data 8.1.8 (2 Nov 2026) and Apple's 9 June 2025 Liquid Glass announcement, as read while writing; first published 8 Nov 2026, last revised 12 Nov 2026.

This guide defines each, compares them in a table, and ends with a recommendation for product UI. We make a glass component library, SheenUI, so we have a bias toward glass; we say where it is the wrong tool.

## The three styles side by side

Here is each style in CSS. The glass and Liquid Glass rules need something colorful behind them; the neumorphic card needs the same flat color as its surroundings:

\`\`\`css
/* Glassmorphism: blur what is behind */
.glassmorphic {
  background: rgb(255 255 255 / 0.55);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 20px;
}

/* Liquid Glass: bend what is behind (Chromium only; see the Liquid Glass guide) */
[data-refraction] .liquid {
  backdrop-filter: url(#liquid) saturate(150%);
}

/* Neumorphism: raise a shape out of a flat background */
.neumorphic {
  background: #e0e5ec;
  border-radius: 20px;
  box-shadow:
    8px 8px 16px #a3b1c6,
    -8px -8px 16px #ffffff;
}
\`\`\`

And as React, using SheenUI for the first two. SheenUI is copy-the-source (the \`@sheenui/theme\` package is not on npm yet; the [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) and the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) show the registry and copy routes, and the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) the CSS it needs), and the [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card) and [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass) pages show both live:

\`\`\`tsx
import { GlassCard, GlassCardContent } from "@/components/sheenui/glass-card/glass-card";
import { LiquidGlass } from "@/components/sheenui/liquid-glass/liquid-glass";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, GlassCardContent, LiquidGlass } from "@sheenui/theme";

export function ThreeStyles() {
  return (
    <div className="grid gap-6 bg-linear-to-br from-violet-500 via-fuchsia-400 to-amber-300 p-8 md:grid-cols-3">
      <GlassCard level={2}>
        <GlassCardContent>Glassmorphism: blurred backdrop</GlassCardContent>
      </GlassCard>
      <LiquidGlass className="p-6">Liquid Glass: refracted backdrop</LiquidGlass>
      <div className="rounded-2xl bg-[#e0e5ec] p-6 text-[#44476a] shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]">
        Neumorphism: extruded shape
      </div>
    </div>
  );
}
\`\`\`

## Comparison table

| | Glassmorphism | Liquid Glass (web) | Neumorphism |
|---|---|---|---|
| Look | Frosted, translucent pane | A lens: refracted edges, specular rim | Soft shapes pushed out of a flat surface |
| CSS technique | \`backdrop-filter: blur()\` plus a tint and a lit border | SVG \`feDisplacementMap\` inside \`backdrop-filter\`, plus a rim | Two opposite \`box-shadow\`s on a matching background |
| Browser support | Chrome 76, Edge 79, Firefox 103, Safari 18 (\`-webkit-\` since 9) | Refraction in Chromium only; frosted fallback elsewhere | Everywhere \`box-shadow\` works |
| Accessibility risk | Contrast varies with the backdrop | Same, plus distortion at the edges | Edges are low contrast by design |
| Performance cost | A blur pass per surface (SheenUI budgets 8 in view) | An SVG filter pass per lens (SheenUI budgets 3 in view) | Static paint, no backdrop sampling |
| Best use | Cards, panels, nav bars, overlays | One or two hero controls | Decorative tiles; rarely interactive controls |

Support data is from [MDN browser-compat-data 8.1.8](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) (2 Nov 2026). The Liquid Glass row is explained in [Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react).

## Glassmorphism (2020 onwards)

Glassmorphism is a translucent surface with a background blur. Nielsen Norman Group says it has been [gaining popularity since 2020](https://www.nngroup.com/articles/glassmorphism/) and notes that it is prominent in Apple's and Microsoft's design systems; Microsoft's Fluent "Acrylic" material is one example.

Four layers make it: a colorful backdrop, a tint, a blur and a lit border. The recipe, with working code, is in the [glassmorphism React tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial). Its weak point is legibility: the background behind text changes with the page. NN/g's advice is to meet contrast everywhere the text sits, use more blur over busy backgrounds, and let users reduce transparency. The [accessibility guide](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism) shows how to measure and respond.

## Liquid Glass (Apple, 2025 onwards)

Apple introduced Liquid Glass on 9 June 2025 with iOS 26, iPadOS 26 and macOS Tahoe 26. Its press release calls it a translucent material that [reflects and refracts its surroundings](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) and reacts to movement with specular highlights.

The key difference from glassmorphism is that the backdrop is displaced, not only blurred. On the web that means an SVG displacement map, which only Chromium honors inside \`backdrop-filter\`. Elsewhere you ship frosted glass. It is a hero effect: SheenUI limits itself to three refracting lenses in view at once. Apple's own version is rendered in real time across its operating systems; a web version is a static imitation of it.

## Neumorphism, claymorphism and Frutiger Aero

Neumorphism (soft UI) makes elements look extruded from the page. It appeared around 2019 and 2020; sources disagree on who named it, so we do not attribute it. It has no transparency, so none of the glass fallbacks apply. Its problem is contrast. In the palette above, the page color \`#e0e5ec\` against the dark shadow \`#a3b1c6\` is 1.72:1 and against the white highlight 1.27:1 (computed with the WCAG formula). WCAG 1.4.11 asks [3:1 for the boundaries of UI components](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), so a neumorphic button's edge cannot pass unless you add an outline, which defeats the look.

Claymorphism is the inflated cousin: puffy, rounded shapes built from stacked inner and outer shadows, usually filled with saturated colors. Those fills sit against a contrasting page, so the boundary problem is smaller than with same-color neumorphism, but you still have to check it. Frutiger Aero refers to the glossy, aqua-gradient look of roughly the mid-2000s. We include it only because people compare it with Liquid Glass; it is a visual reference, not a technique.

## What each style needs from the rest of the page

Each style makes demands on its surroundings, and breaking them is the usual reason a demo looks good and a real page does not.

- **Glassmorphism** needs a varied backdrop behind the pane: a gradient, soft color blobs or an image. It also needs wrappers that leave the blur alone: an ancestor with \`opacity\` below 1, a \`filter\` or a \`mask\` becomes a backdrop root and the blur stops seeing the page ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)).
- **Liquid Glass** needs detail behind the lens (text, edges, photos), because refraction of a flat color shows nothing. It needs an engine check, a frosted fallback and a displacement map that matches the lens size.
- **Neumorphism** needs the element's fill to match its parent's exactly, because the two shadows imitate light on one continuous surface. Put it on a different background and the effect collapses into two odd shadows.

Light direction matters for all three. A rim highlight on the top left and a shadow on the bottom right read as one consistent light source; mixing directions between components makes a page feel broken even when each piece is fine.

## Which to choose for a product UI

- **Default: glassmorphism at small scale.** Use it for the frame around content (nav bars, dialogs, toasts, side panels), with solid surfaces for dense data. It works in every current browser.
- **Add Liquid Glass sparingly.** One or two controls, built with a frosted fallback, where the effect is the brand. Not for text blocks.
- **Use neumorphism for decoration only.** Avoid it on buttons, inputs and toggles unless you add visible, high-contrast boundaries.
- **Combine by role.** For instance a frosted card containing a solid table, with one refractive CTA pill.
- **Always provide the solid fallback.** Reduced transparency, more contrast and forced colors should turn any of them into plain surfaces.

## When not to use any of them

If your product is mostly forms, tables or long text, a flat design system with a single glass overlay will serve users better. If your audience skews toward low-end devices, avoid blur and refraction altogether, or ship a lite mode; see [the performance guide](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance). If brand consistency matters more than novelty, a trend-driven look will date.

## Frequently asked questions

### What is Liquid Glass?

Apple's design material for iOS 26, iPadOS 26 and macOS Tahoe 26: translucent, with refraction and highlights that react to movement. On the web it is imitated with SVG filters.

### Is Liquid Glass just glassmorphism?

No. Glassmorphism blurs the backdrop. Liquid Glass also distorts it near the edges, like a lens, and adds a specular rim.

### Glassmorphism vs neumorphism: which is more accessible?

Neither is automatically accessible. Glass can pass WCAG with enough tint and measurement; neumorphism's boundaries usually fail the 3:1 rule for components, as computed above.

### Can I use more than one style in the same interface?

Yes, by role: glass for chrome, solid for content, Liquid Glass for one hero control. Mixing neumorphism with glass is hard to make coherent, because glass needs a varied backdrop and neumorphism needs a flat one.

### Does glassmorphism work in Safari and Firefox?

Yes. Safari supports unprefixed \`backdrop-filter\` from version 18 and Firefox from 103. Only the SVG-refraction variant of Liquid Glass does not carry over; see [the best libraries comparison](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries) for tools that handle the fallback.
`,r=t();function i(){return(0,r.jsx)(e,{slug:`glassmorphism-vs-liquid-glass`,markdown:n})}export{i as default};