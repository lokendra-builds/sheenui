import{t as e}from"./GuideArticle-HJW9W3wR.js";import"./guides-BOD_LkRi.js";import"./guide-images-CcTVZ8vq.js";import"./router-gsYXKOBR.js";import{t}from"./vendor-react-D30i__oY.js";var n=`---
title: "Glassmorphism React Tutorial: Step by Step | SheenUI"
description: "Glassmorphism in React is a frosted-glass UI style: a tint, backdrop-filter blur and light border. Build it in CSS, Tailwind v4 and React, with contrast."
slug: "glassmorphism-react-tutorial"
route: "/guides/glassmorphism-react-tutorial"
targetKeyword: "glassmorphism react tutorial"
secondaryKeywords: ["how to make glassmorphism in react", "glassmorphism css backdrop-filter", "glassmorphism react example"]
published: "2026-11-08"
updated: "2026-11-14"
relatedRoutes: ["/components/glass-card", "/foundations", "/components/button", "/blocks/glass-login", "/navigation/navbar", "/dashboards/web-analytics"]
---

# Glassmorphism in React: A Step-by-Step Tutorial

Glassmorphism in React is a UI style where a component looks like frosted glass: a translucent tint, a \`backdrop-filter\` blur and a thin light border over a colorful background. This tutorial builds it from four layers in plain CSS, then Tailwind CSS v4, then a typed React component, with contrast checks and fallbacks for people who turn transparency off.

SheenUI is our library, so we use it at the end. Everything before that section needs only React, Tailwind and, for the last animation, \`motion\`. If you want ready-made parts instead of a tutorial, start from the [glassmorphism React components](https://lokendra-builds.github.io/sheenui/) home page. Each step is a short glassmorphism React example you can paste into a project and see working before you read on. To see the finished surface live, open the [Glass card page](https://lokendra-builds.github.io/sheenui/components/glass-card).

Quick answer, the smallest glassmorphism in React or any page (a colorful background behind it makes it visible):

\`\`\`css
.glass {
  background: rgb(255 255 255 / 0.12);
  backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgb(255 255 255 / 0.25);
  border-radius: 16px;
}
\`\`\`

Basis: written for React 19.2+ and Tailwind CSS v4; the Tailwind statement about variants refers to Tailwind CSS 4.3.5, and browser support is quoted from MDN browser-compat-data. First published 8 Nov 2026, last revised 14 Nov 2026.

## What glassmorphism is

Glassmorphism is a surface that looks like frosted glass: you see a blurred version of whatever sits behind it. It is not a color or a shadow. It only works when there is something colorful behind the glass, which is why flat white pages make it look like a gray box.

Nielsen Norman Group describes the style and its risk in one line: if overused, it can [pose significant accessibility and usability challenges](https://www.nngroup.com/articles/glassmorphism/). Keep that in mind; sections 4 and 5 are about it.

## The four layers

Build the effect in this order. Each layer fixes a specific problem of the one before.

1. **A vivid background.** Without color variation there is nothing to blur. A gradient or a few soft blobs is enough.
2. **A tint.** A semi-transparent fill (white in light mode, a dark smoke in dark mode) lowers the contrast of whatever shows through, so text on top stays readable.
3. **A backdrop blur.** \`backdrop-filter: blur()\` blurs what is behind the element, not the element itself. A small \`saturate()\` brings back the color the blur washes out.
4. **A lit border.** A 1px light border and a thin inner highlight on the top edge make the pane read as a physical sheet.

In plain CSS:

\`\`\`css
.glass {
  background: rgb(255 255 255 / 0.55);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    0 12px 32px -12px rgb(30 20 80 / 0.35);
}
\`\`\`

\`backdrop-filter\` is supported unprefixed in Chrome 76, Edge 79, Firefox 103 and Safari 18, with a \`-webkit-\` prefix back to Safari 9 ([MDN browser-compat-data 8.1.8, 2 Nov 2026](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)). Keep the prefixed line for older Safari.

The same four layers as Tailwind CSS v4 utilities (SheenUI's [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) shows the imports it needs). In v4, \`backdrop-blur-xl\` is a 24px blur:

\`\`\`html
<div class="relative min-h-screen bg-linear-to-br from-violet-500 via-fuchsia-400 to-amber-300">
  <div
    class="rounded-2xl border border-white/60 bg-white/55 p-6 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]"
  >
    Frosted glass
  </div>
</div>
\`\`\`

## A reusable GlassCard in TypeScript

Three levels cover most interfaces: level 1 for small chips, level 2 for cards, level 3 for dialogs and bars. Higher levels use more tint and more blur. This component has no dependencies except React:

\`\`\`tsx
import type { ComponentProps } from "react";

type GlassLevel = 1 | 2 | 3;

const levels: Record<GlassLevel, string> = {
  1: "bg-white/40 backdrop-blur-md dark:bg-slate-900/40",
  2: "bg-white/55 backdrop-blur-xl dark:bg-slate-900/50",
  3: "bg-white/75 backdrop-blur-2xl dark:bg-slate-900/70",
};

export type GlassCardProps = ComponentProps<"div"> & { level?: GlassLevel };

export function GlassCard({ level = 2, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={\`rounded-2xl border border-white/60 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] backdrop-saturate-150 dark:border-white/10 \${levels[level]} \${className}\`}
      {...props}
    />
  );
}
\`\`\`

Because it spreads \`ComponentProps<"div">\`, it accepts \`onClick\`, \`aria-*\` and \`ref\` like a normal \`div\`.

One rule saves hours of debugging: never fade or filter a *wrapper* of a glass element. An ancestor with \`opacity\` below 1, a \`filter\`, a \`mask\`, a \`clip-path\` or a \`mix-blend-mode\` becomes a "backdrop root", and the blur then only sees content inside that ancestor, not the page behind it ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)). Animate the glass element itself.

## Keeping text readable

The tint is not decoration; it is what keeps text legible. WCAG 2 asks for [4.5:1 contrast for normal text and 3:1 for large text](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), and on glass the background behind the text is different at every point.

So test the worst case, not the average. Composite your tint over the brightest and darkest parts of your backdrop and keep the minimum:

\`\`\`tsx
export type RGB = readonly [number, number, number];

const channel = (value: number) => {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export const luminance = ([r, g, b]: RGB) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

export function contrast(a: RGB, b: RGB) {
  const [light, dark] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** The tint (rgb + alpha) laid over one backdrop sample. */
export const over = (tint: RGB, alpha: number, back: RGB): RGB => [
  Math.round(tint[0] * alpha + back[0] * (1 - alpha)),
  Math.round(tint[1] * alpha + back[1] * (1 - alpha)),
  Math.round(tint[2] * alpha + back[2] * (1 - alpha)),
];

export function worstContrast(text: RGB, tint: RGB, alpha: number, backdrop: readonly RGB[]) {
  return Math.min(...backdrop.map((sample) => contrast(text, over(tint, alpha, sample))));
}
\`\`\`

Run it with text \`#1b1b2f\` and a white tint at 55% opacity. In our run (computed with the code above), that text scored 7.98:1 over a pure \`#e11d48\` red, 13.29:1 over \`#fbbf24\` amber and 5.02:1 over pure black. The darkest sample is the limit here. Without the tint the same red gives only 3.59:1 and black 1.24:1, which is why the tint matters. If your worst sample falls under 4.5, raise the tint opacity, change the text color, or move the text off that part of the background.

SheenUI's own tokens file records the same kind of measurement. On its brightest backdrop blob, muted text measured 5.2:1 (light theme) bare and 6.7:1 on level-2 glass, because the tint lifts it. Numbers like these come from sampling rendered pixels, not from guessing; [the accessibility guide](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism) shows how.

## Fallbacks for people who turn transparency off

Some people cannot read through translucency. Operating systems expose that as media queries, and glass should answer each of them by becoming a solid surface:

\`\`\`css
:root {
  color-scheme: light dark;
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass {
    background: rgb(255 255 255 / 0.92);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .glass {
    background: Canvas;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .glass {
    background: Canvas;
    border-color: CanvasText;
  }
}

@media (forced-colors: active) {
  .glass {
    background: Canvas;
    border: 1px solid CanvasText;
    box-shadow: none;
    backdrop-filter: none;
  }
}
\`\`\`

Browser support differs. \`prefers-reduced-transparency\` is in Chrome and Edge 118, behind a flag in Firefox 113 and absent from Safari, and MDN still marks it experimental. \`prefers-contrast\` is supported from Chrome 96, Firefox 101 and Safari 14.1, and \`forced-colors\` from Chrome 89, Firefox 89 and Safari 16 ([MDN browser-compat-data](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency)). Because Safari has no transparency query, also offer an in-app toggle that sets a \`data-transparency="reduced"\` attribute and mirror the same rules under it.

In Tailwind, \`contrast-more:\` and \`forced-colors:\` are built-in variants, but Tailwind 4.3.5 has none for reduced transparency, so define one once:

\`\`\`css
@import "tailwindcss";
@custom-variant reduced-transparency (@media (prefers-reduced-transparency: reduce));
\`\`\`

\`\`\`html
<div class="bg-white/55 backdrop-blur-xl reduced-transparency:bg-white reduced-transparency:backdrop-blur-none contrast-more:border-black">
  Falls back to a solid white card
</div>
\`\`\`

## Performance in one paragraph

Each blurred surface costs a render pass, and the cost grows with its area and blur radius. SheenUI's budget is at most 8 blurred surfaces in view, a 20px blur on level-2 glass and 32px on level 3, and no blur at all on tiny level-1 chips, which only use tint. For the reasons and how to measure on your own pages, read [the backdrop-filter performance guide](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance).

## Adding Motion: a pointer sheen, springs and reduced motion

A soft highlight that follows the pointer sells the glass. With \`motion\`, the pointer position lives in motion values, so moving the mouse never re-renders React:

\`\`\`tsx
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

export function SheenCard({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(120);
  const y = useMotionValue(-40);
  const sheen = useMotionTemplate\`radial-gradient(260px circle at \${x}px \${y}px, rgb(255 255 255 / 0.55), transparent 65%)\`;

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType === "touch") return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - box.left);
    y.set(event.clientY - box.top);
  }

  return (
    <motion.div
      onPointerMove={onPointerMove}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ type: "spring", visualDuration: 0.22, bounce: 0.12 }}
      className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/55 p-6 backdrop-blur-xl"
    >
      <motion.div aria-hidden style={{ background: sheen }} className="pointer-events-none absolute inset-0" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
\`\`\`

\`useReducedMotion\` reports the operating system setting, so the lift and the sheen turn off for people who asked for less motion. Touch is skipped because a finger dragging across the card is scrolling, not hovering.

## Copy-paste glass components: card, navbar, login, dashboard

Writing every piece yourself gets long. SheenUI is a copy-the-source library (the \`@sheenui/theme\` package is not on npm yet, so you add components with \`npx shadcn@latest add\` or copy the folders you need; the README, the [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) and the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) list the steps). It adds the lit rim, three glass levels, the fallbacks above and the preference hooks. A card and a floating [navbar](https://lokendra-builds.github.io/sheenui/navigation/navbar) with a [button](https://lokendra-builds.github.io/sheenui/components/button):

\`\`\`tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/sheenui/glass-card/glass-card";
import { Navbar } from "@/components/sheenui/navbar/navbar";
// Package build (after the first npm release, or a packed tarball): import { Button, GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle, Navbar } from "@sheenui/theme";

const items = [
  { value: "overview", label: "Overview" },
  { value: "billing", label: "Billing" },
];

export function Page() {
  const [tab, setTab] = useState("overview");
  return (
    <>
      <Navbar brand="Acme" items={items} value={tab} onValueChange={setTab} actions={<Button size="sm">Sign in</Button>} />
      <GlassCard level={2} interactive>
        <GlassCardHeader>
          <GlassCardTitle>Team plan</GlassCardTitle>
          <GlassCardDescription>Up to 10 seats</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>$12 per seat</GlassCardContent>
      </GlassCard>
    </>
  );
}
\`\`\`

A complete [glass login form](https://lokendra-builds.github.io/sheenui/blocks/glass-login) is one component, and the [web analytics dashboard](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics) shows how many glass panels one page can carry. The [foundations page](https://lokendra-builds.github.io/sheenui/foundations) documents the Tailwind tokens behind all of it.

## When not to use glassmorphism

- **Dense data and long reading.** Tables, forms with many fields and body text are better on solid surfaces. Use glass for the frame around them.
- **Flat or white backgrounds.** There is nothing to blur, so you get a pale gray box with a cost.
- **Low-end devices and many panels.** A page full of blurred cards drops frames on weak GPUs. Use fewer, larger panels.
- **Text on small, busy areas.** If you cannot guarantee 4.5:1 over the worst backdrop point, use a solid surface.
- **Brand or product rules that need exact color.** Translucency changes color depending on what is behind it.

## Frequently asked questions

### What is glassmorphism in React?

Glassmorphism in React is a UI style where a component looks like frosted glass: a translucent background, a \`backdrop-filter: blur()\` and a thin light border over a colorful backdrop. In React you apply it with a class or a styled component, and it only shows when something colorful sits behind it. This tutorial builds it in plain CSS, in Tailwind CSS v4 and as a typed \`GlassCard\`; the \`.glass\` rule near the top is the shortest version.

### How do you make glassmorphism in React?

Give an element a semi-transparent background, a \`backdrop-filter: blur()\`, a light border and a vivid page behind it. In React that is a small component with a \`className\` and a level prop, as above. No library is required.

### Does glassmorphism work with Tailwind CSS v4?

Yes. \`bg-white/55\`, \`backdrop-blur-xl\`, \`backdrop-saturate-150\` and \`border-white/60\` are core utilities. Tailwind 4.3.5 has no built-in variant for \`prefers-reduced-transparency\`, so define one with \`@custom-variant\`, as shown above.

### Why is my backdrop-filter not blurring anything?

Most often an ancestor is a backdrop root (it has \`opacity\` below 1, a \`filter\`, a \`mask\` or \`will-change\` on one of those). The blur then ends at that ancestor. Remove the property from the wrapper and apply it to the glass element instead.

### Is glassmorphism accessible?

It can be, if text keeps its contrast over the worst backdrop point and the surface turns solid for reduced transparency, more contrast and forced colors. Read the [accessible glassmorphism guide](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism). For the lens-like variant, see [Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react).
`,r=t();function i(){return(0,r.jsx)(e,{slug:`glassmorphism-react-tutorial`,markdown:n})}export{i as default};