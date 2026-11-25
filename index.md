Canonical: https://lokendra-builds.github.io/sheenui/

# Glassmorphism & Liquid Glass React Components

URL: https://lokendra-builds.github.io/sheenui/
Sidebar name: Introduction

Free glassmorphism and Liquid Glass React components with Motion: 86 components (67 UI, 19 effects), 48 charts and 20 blocks for Tailwind v4 and shadcn.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

v0.1 · MIT

## 86 React components, 67 UI and 19 effects

Charts draw, numbers count, chat types, toasts stack, switches flip. Every piece is a real SheenUI component, built with Motion and CSS springs.


## Two looks. One scroll.

Liquid Glass bends the wallpaper at its rim. Aurora Neon frosts it under curtains of light. Same components, same tokens: scroll to watch one app window change look, or switch the whole site.


## Glass has depth

Backdrop, rim light and content are separate layers. Scroll and they separate: each moves at its own speed, on transforms only.

- Backdrop: Blur and saturation of whatever sits behind: the layer that makes glass read as glass.
- Rim light: A specular edge that follows the pointer, lit from the top left on every surface.
- Content: Text and controls sit on top, always AA-legible, turning solid when transparency is reduced.


## Key features

- Glassmorphism and Apple-style Liquid Glass, with a Safari and Firefox fallback
- Two switchable styles: Liquid Glass and Aurora Neon
- 86 components (67 UI components and 19 effects), plus 48 charts, 20 blocks and 5 dashboards
- Motion built in (motion.dev): springs, choreography, reduced-motion safe
- Accessible: WCAG AA, checked by automated axe and contrast tests (scope on the About page), keyboard, screen readers, High Contrast mode
- Built for frame rate: animation uses only transform and opacity, loops pause off screen, and Lite glass is there for weak devices
- Copy-paste or npx shadcn add; built on Base UI + Tailwind v4
- AI-ready: documented source + llms.txt
- Free and MIT licensed, for personal and commercial work


## Why SheenUI

- Glass with guardrails: Three glass levels that turn solid with reduced transparency, more contrast or Windows high contrast.
- Motion that respects you: Springs and micro-interactions that turn into gentle fades when reduced motion is on.
- Built on Base UI: Keyboard navigation, focus management and ARIA come from accessible headless primitives.
- Copy, don't install: Every component is plain source in theme/. Take what you need and make it yours.


## About SheenUI

The short version of what the library is, how it handles glass, motion and accessibility, and how to install it.

### Glassmorphism React components that stay readable

SheenUI is a library of glassmorphism React components: buttons, inputs, dialogs, menus, tables and more, drawn as frosted glass with a tint, a backdrop blur and a lit rim. Three glass levels come from a few Tailwind CSS v4 tokens, and every surface turns solid when someone asks for reduced transparency or more contrast, so text stays readable on any background. Taken together it is a glassmorphism UI kit for React rather than a single effect.

Browse [all glass UI components](https://lokendra-builds.github.io/sheenui/components/), learn the system in [glass design tokens](https://lokendra-builds.github.io/sheenui/foundations), or see how contrast is checked in [accessible glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism).

### Liquid Glass for React, with a Safari fallback

Liquid Glass is the Apple look that bends the background behind a panel like a lens. SheenUI’s [Liquid Glass React component](https://lokendra-builds.github.io/sheenui/effects/liquid-glass) does it with an SVG displacement map in Chrome and Edge, and falls back to ordinary frosted glass in Safari and Firefox, so every browser gets a good result.

The [Liquid Glass CSS and React guide](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react) shows the code, and [the best glassmorphism React libraries](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries) compares the alternatives honestly.

### Animated React components, made with Motion

The animation comes from Motion (formerly Framer Motion). Buttons lift and press, switches spring, tabs slide a pill to the active tab, and a shared set of springs and durations keeps every component in the same rhythm. Reduced motion turns movement into short fades.

The [animated React components](https://lokendra-builds.github.io/sheenui/effects/) page lists the effects, including a border beam, a macOS-style dock and a number ticker. Patterns for your own code are in [12 Framer Motion examples](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples).

### 48 animated, accessible React charts

The chart set covers line, area, bar and donut charts, funnels, heatmaps, treemaps, Sankey diagrams and more, 48 chart components in all. Each has a glass tooltip you can drive with the arrow keys, a color-blind-safe palette and a table view of the same data.

Start with the [animated React charts gallery](https://lokendra-builds.github.io/sheenui/charts/), or open the [React line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart), [bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart) and [donut chart](https://lokendra-builds.github.io/sheenui/charts/donut-chart) pages. [Accessible React charts](https://lokendra-builds.github.io/sheenui/guides/accessible-react-charts) explains the reading model.

### Glassmorphism blocks: login, OTP, checkout, pricing, AI chat and dashboards

Blocks are whole sections made only from SheenUI components. There are 20 of them, from a [glassmorphism login form](https://lokendra-builds.github.io/sheenui/blocks/glass-login) and an [OTP verification page](https://lokendra-builds.github.io/sheenui/blocks/otp-verification) to a [pricing table](https://lokendra-builds.github.io/sheenui/blocks/pricing), a [checkout form](https://lokendra-builds.github.io/sheenui/blocks/payment-checkout) and an [AI chat UI](https://lokendra-builds.github.io/sheenui/blocks/ai-chat).

5 full [glassmorphism dashboard templates](https://lokendra-builds.github.io/sheenui/dashboards/) cover web analytics, SaaS revenue, e-commerce, product analytics and crypto. Browse them all as [React Tailwind blocks](https://lokendra-builds.github.io/sheenui/blocks/).

### Install with the shadcn CLI, or copy the source

Every component is a registry item, so one command copies its source and installs the packages it needs:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json
```

SheenUI needs React 19.2+ and Tailwind CSS v4 (the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) shows the two CSS imports) and is free under the MIT license. The [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) and the guide to [installing in Next.js and Vite](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) list the tested steps.


## Frequently asked questions

### What is SheenUI?

SheenUI is a free, open-source (MIT) library of glassmorphism and Liquid Glass React components. It has 86 components (67 UI components and 19 effects), 48 charts and 20 blocks, animated with Motion and built on Base UI and Tailwind CSS v4. You copy the source into your app and own the code, including for commercial projects.

### What is glassmorphism?

Glassmorphism is a UI style where surfaces look like frosted glass: a translucent tint, a background blur (CSS backdrop-filter) and a thin, light border, over a colorful background. SheenUI ships three glass levels as Tailwind CSS v4 utilities; the [glassmorphism React tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial) builds one from scratch.

### What is the difference between glassmorphism and Liquid Glass?

Glassmorphism blurs what is behind a surface. Liquid Glass, Apple’s design language since iOS 26, also bends that background like a lens and adds a bright rim. SheenUI’s LiquidGlass component refracts in Chrome and Edge and shows frosted glass in Safari and Firefox. See [Glassmorphism vs Liquid Glass](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-vs-liquid-glass).

### Does Liquid Glass work in Safari and Firefox?

The refraction uses an SVG displacement map inside backdrop-filter, which only Chromium browsers support today. Safari and Firefox get SheenUI's normal frosted glass instead, so nothing breaks.

### Is glassmorphism accessible?

It can be. SheenUI checks text contrast on the glass (WCAG AA, at least 4.5:1), turns the glass solid when the user asks for reduced transparency or more contrast, and switches to system colors in Windows forced-colors mode. Under reduced motion, movement becomes short fades. Read [accessible glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism) for the details.

### Does SheenUI use Framer Motion?

It uses Motion for React, the library formerly called Framer Motion: the motion package, imported from motion/react. The [Framer Motion to Motion guide](https://lokendra-builds.github.io/sheenui/guides/framer-motion-to-motion) explains the rename.

### Is SheenUI free, and what is the licence?

Yes. SheenUI is MIT-licensed, so you can use, change and ship the copied source in personal and commercial projects. It is at version 0.1 and is not on npm yet: you install it with the shadcn CLI or by copying the files a page lists.

### Which React and Tailwind CSS versions does it need?

React 19.2 or newer, Tailwind CSS 4.1 or newer, Motion 14 and Base UI 1.9 or newer. There is no tailwind.config file: the glass tokens and utilities are plain CSS for Tailwind v4.

### How is SheenUI different from shadcn/ui?

Both are copy-the-source libraries, so you own the code. shadcn/ui is a neutral, flat design system on Radix. SheenUI is glass by default (frosted and Liquid Glass surfaces, two style presets, light and dark), is built on Base UI, animates with Motion and adds charts, blocks and dashboards. You can install SheenUI items through the shadcn CLI and use both side by side.

### How do I install SheenUI components?

Copy the folders listed in each page’s “Files to copy” box into a React 19.2+ and Tailwind CSS v4 app, or use the shadcn CLI with one registry URL per component. The [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) has the commands and the Next.js and Vite notes, and the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) covers the two CSS imports.

### Can I use SheenUI with Next.js or shadcn/ui?

Yes. The components are React 19.2+ client components styled with Tailwind CSS v4. They work in Next.js, Vite and React Router apps, next to shadcn/ui components, and they are built on Base UI rather than Radix. Compare the options in [shadcn alternatives](https://lokendra-builds.github.io/sheenui/guides/shadcn-alternatives).

### Who makes SheenUI, and is it ready for production?

Lokendra Singh Rathore designs and builds it as an open-source project. It is version 0.1 (pre-1.0), so props can still change between releases, and no real iPhone or Android phone has been used to check it yet. The [About SheenUI](https://lokendra-builds.github.io/sheenui/about) page says what is tested, how and how to cite it.


## One command to start

Copy a component into your React 19 and Tailwind v4 app and own the code. Free, MIT licensed.

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json
```


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
