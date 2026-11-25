import{t as e}from"./GuideArticle-HJW9W3wR.js";import"./guides-BOD_LkRi.js";import"./guide-images-CcTVZ8vq.js";import"./router-gsYXKOBR.js";import{t}from"./vendor-react-D30i__oY.js";var n=`---
title: "shadcn Alternatives with Animation in 2026 | SheenUI"
description: "shadcn alternatives with animation, glass and charts, checked on 8 Nov 2026: license, install method, primitives and paid tiers for nine libraries."
slug: "shadcn-alternatives"
route: "/guides/shadcn-alternatives"
targetKeyword: "shadcn alternatives"
secondaryKeywords: ["shadcn ui alternatives 2026", "shadcn glass theme", "copy paste component libraries"]
published: "2026-11-08"
updated: "2026-11-15"
relatedRoutes: ["/components/glass-card", "/effects/liquid-glass", "/charts", "/components/dialog"]
---

# shadcn Alternatives with Animation: Nine Libraries Compared (2026)

Most searches for shadcn alternatives are not about leaving shadcn/ui. They are about what it does not ship: animated components, a glass look, charts beyond the basics, or a different primitive layer. This guide lists nine copy-paste libraries that cover those gaps, with the facts checked on 8 Nov 2026 (license, install method, primitives, paid tiers, stars and last push from the GitHub API). SheenUI, our glass library, is one of the nine, and we say where it falls short. Every library here follows the shadcn model: the code lands in your repo and you own it.

Quick answer by need:

- Landing-page animation: Magic UI or Aceternity UI (free tiers plus paid ones).
- Text and background effects: React Bits (MIT with the Commons Clause).
- Motion-based primitives: Motion Primitives (in beta).
- Animation plus glass, charts and Base UI primitives: SheenUI (ours).

Basis: each library's own docs, npm and the GitHub API, gathered on 8 Nov 2026 as the text says; SheenUI is the author's own library and is marked as such. First published 8 Nov 2026, last revised 15 Nov 2026; each figure keeps the date given in the text, and licences, tiers, stars and push dates can have changed since.

## What people want beyond shadcn/ui

shadcn/ui is the baseline: 127,576 stars and a push on 7 Nov 2026 ([shadcn-ui/ui](https://github.com/shadcn-ui/ui)), MIT, CLI package \`shadcn\` 4.23.0 on npm (27 Oct 2026). Four things send people looking elsewhere:

1. Animation. shadcn/ui components transition, but they do not ship marquees, number tickers, text effects or spotlight cards.
2. Glass. The default styles are flat. A "shadcn glass theme" means either restyling the stock components or replacing them.
3. Charts. shadcn/ui's chart components are a thin layer; dashboard-heavy apps want more chart types.
4. Primitives. Some teams want Base UI rather than Radix.

That fourth reason is weaker than it was. shadcn/ui's July 2026 changelog entry "Base UI as the Default" says "New projects now use Base UI by default. Radix is still fully supported", and the CLI's \`init\` takes \`-b base|radix|aria\` ([CLI docs](https://ui.shadcn.com/docs/cli)). If Base UI is your only reason to leave, you no longer need to. SheenUI's [Base UI docs page](https://lokendra-builds.github.io/sheenui/docs/base-ui) explains how it builds on it, and its [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) shows the shadcn CLI route (it needs Tailwind CSS v4; see the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4)). The remaining reasons are real, and the libraries below address them.

## The libraries

Strengths first for each; stars and push dates are from the GitHub API on 8 Nov 2026.

### Magic UI

Animated components and effects for landing pages, installed with the shadcn CLI through a namespaced registry: the docs show \`pnpm dlx shadcn@latest add @magicui/globe\` and call it "the exact same installation process as shadcn/ui". MIT, 23,128 stars, pushed 5 Nov 2026 ([magicuidesign/magicui](https://github.com/magicuidesign/magicui)). Paid tier: Magic UI Pro, "$199" one-time, with "8 production-ready templates and 50+ premium components" per the docs page. Primitives: not stated on the installation page; the components are effects rather than form controls.

### Aceternity UI

"The React component library for beautiful landing pages", built "with React, Tailwind CSS and Motion". Free components are copy and paste ("118+ free components"); blocks and pages install with the shadcn CLI. Paid: All-Access at $169 for a one-year license, $199 lifetime, $1,590 for teams, all one-time, per the [pricing page](https://ui.aceternity.com/pricing). We could not find a public GitHub repository for the components, so stars, license text and last push are not verified.

### React Bits

The largest animated collection by stars: 51,456, pushed 31 Oct 2026 ([DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)). Installs through the shadcn CLI, \`npx shadcn@latest add @react-bits/SplitText-TS-TW\`, where the suffix picks JS or TS and CSS or Tailwind. License: "MIT + Commons Clause", which allows use "as part of an application, website, or product" but not selling or redistributing the components themselves. A "Pro" link exists on the site; pricing was not shown on the pages we read, so not verified.

### Motion Primitives

"Beautifully designed, easy-to-integrate motion components" built with Motion and Tailwind CSS, MIT, in beta per the README. 6,909 stars, pushed 28 Sep 2026 ([ibelick/motion-primitives](https://github.com/ibelick/motion-primitives)). Install method and paid tiers: the docs site returned an error when we checked, and the README gives no install command, so both are not verified.

### coss ui (formerly Origin UI)

"A new, modern UI component library built on top of Base UI", "Built by and for the team of Cal.com, Inc.", styled with Tailwind CSS and distributed as source: "Instead of installing a package, you get the source code." The docs sidebar lists 56 components. MIT, 10,797 stars, pushed 5 Nov 2026 ([cosscom/ui](https://github.com/cosscom/ui)). No paid tier mentioned on the docs page. The exact CLI command is not on the overview page, so not verified.

### basecn

"shadcn/ui components powered by Base UI." MIT, 287 stars, last push 14 Mar 2026 ([akash3444/basecn](https://github.com/akash3444/basecn)). Its reason to exist, a Base UI port of shadcn/ui, has since been absorbed into shadcn/ui itself (see above), and the push date reflects that. The docs show no install command or pricing; not verified.

### Tremor

Charts and dashboard components: "35+ fully open-source, accessible components for dashboards and charts", "Built on Recharts and Radix UI", with both copy-and-paste source and an npm package. Apache-2.0, 3,691 stars, last push 10 Oct 2025 ([tremorlabs/tremor](https://github.com/tremorlabs/tremor)); the \`@tremor/react\` npm package is at 3.18.7, last published 13 Jan 2025, with a React 18 peer dependency. The homepage sells "300+ Premium Blocks" (price not shown) and states "Tremor is joining Vercel". Requires Tailwind CSS v4.0+ per the install page.

### liqui.design

Liquid glass components built on Base UI, with real refraction (canvas displacement map plus SVG filter) in Chromium and an automatic frosted fallback in Safari and Firefox. Install: \`npx shadcn@latest add https://liqui.design/r/button.json\`, which also installs an \`@liqui-design/glass\` package. 21 components, MIT, 170 stars, pushed 22 Oct 2026 ([leefanv/liqui-design](https://github.com/leefanv/liqui-design)). No paid tier mentioned. No accessibility section in the README.

### SheenUI (ours)

Glass and motion in one set: 86 component pages, 20 blocks and 5 dashboard templates on Base UI 1.9.0, Motion 14.14.0, Tailwind CSS v4 and React 19, MIT. Liquid Glass refraction runs in Chromium (SVG \`feDisplacementMap\` inside \`backdrop-filter\`); Safari and Firefox get frosted glass; the glass turns solid under reduced transparency, more contrast or forced colors; a Lite glass mode and budgets (at most 8 blurred surfaces and 3 refraction lenses in view) keep weak devices usable. Two presets: Liquid Glass (default) and Aurora Neon. Components render through Base UI's \`render\` prop, so a [Dialog](https://lokendra-builds.github.io/sheenui/components/dialog) trigger can be any glass button.

Limits, stated plainly: SheenUI is copy-the-source. The \`@sheenui/theme\` package is not on npm yet; you install through the shadcn registry, by copying files, or from a packed tarball ([install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks)). There are no stars or releases to report because the repository has not been published. No paid tier. Start at the [Glass Card](https://lokendra-builds.github.io/sheenui/components/glass-card) and the [charts index](https://lokendra-builds.github.io/sheenui/charts/).

## Install commands: shadcn CLI and registries

The shadcn CLI documents \`add\` as \`pnpm dlx shadcn@latest add [component]\`, where the argument is a "name, url or local path to component", and namespaced registries as \`@namespace/resource-name\` configured under \`registries\` in \`components.json\` ([namespace docs](https://ui.shadcn.com/docs/registry/namespace)). Most libraries above use one of these two forms:

\`\`\`bash
# shadcn/ui component (npm form of the documented pnpm dlx command)
npx shadcn@latest add dialog

# Namespaced registry: Magic UI, React Bits and others
npx shadcn@latest add @magicui/globe

# Registry item by URL: liqui.design
npx shadcn@latest add https://liqui.design/r/button.json

# Registry item by URL: SheenUI (served from the docs site once it is deployed)
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json
\`\`\`

SheenUI's registry has 183 items: a shared \`sheenui-theme\` item (tokens, glass, motion, hooks), 149 UI items for the components, charts and effects, and 33 block items. \`pnpm registry:build\` writes them to \`r/\` in the docs build. We ran \`shadcn add\` against a local copy with shadcn 4.23.0 in a Next.js 16 app and a Vite app on 8 Nov 2026. The URL above works once the site is on GitHub Pages; Next.js needs one CSS import changed to a relative path, which the [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) shows.

## Comparison table

Only verified cells have values; "nv" means not verified on 8 Nov 2026.

| Library | Style | Primitives | Install method | License | Price |
|---|---|---|---|---|---|
| shadcn/ui | Flat, neutral | Base UI default, Radix or React Aria | \`shadcn add <name>\` | MIT | Free |
| Magic UI | Animated effects | nv | \`shadcn add @magicui/<name>\` | MIT | Free; Pro $199 one-time |
| Aceternity UI | Animated landing pages | nv (Motion, Tailwind) | Copy-paste; blocks via shadcn CLI | nv | Free; All-Access $169/yr, $199 lifetime |
| React Bits | Animated effects | nv | \`shadcn add @react-bits/<Name>-TS-TW\` | MIT + Commons Clause | Free; Pro price nv |
| Motion Primitives | Motion components | nv (Motion, Tailwind) | nv | MIT | nv |
| coss ui | Flat, Cal.com design system | Base UI | Copy source (command nv) | MIT | Free |
| basecn | shadcn look | Base UI | nv | MIT | nv |
| Tremor | Charts, dashboards | Radix, Recharts | Copy-paste or \`@tremor/react\` | Apache-2.0 | Free; premium blocks price nv |
| liqui.design | Liquid glass | Base UI | \`shadcn add https://liqui.design/r/<name>.json\` | MIT | Free |
| SheenUI (ours) | Liquid glass, Aurora Neon | Base UI | \`shadcn add https://lokendra-builds.github.io/sheenui/r/<name>.json\` or copy source | MIT | Free |

## When not to switch: staying with shadcn/ui

- You want one maintainer and one update path. shadcn/ui ships new components for Base UI, React Aria and Radix together (October 2026 changelog), and every library above adds a second source of truth.
- You need forms, data tables and menus more than effects. The animated libraries are additive; they do not replace the core, so you keep shadcn/ui underneath anyway.
- Your product cannot afford \`backdrop-filter\`. Glass libraries, ours included, cost GPU time on every blurred surface. Read [backdrop-filter performance](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance) before choosing one.
- Licensing must be plain MIT. React Bits adds a Commons Clause; Aceternity's component license text was not verifiable from the pages we read.
- You need an npm package today. \`@sheenui/theme\` is not on npm yet, so SheenUI installs through its shadcn registry, by copying files or from a packed tarball. (coss ui and basecn did not show an install command on their overview pages.)

## Frequently asked questions

### Which shadcn alternatives include animation?

For landing-page animation, Magic UI and Aceternity UI; for text and background effects, React Bits; for Motion-based primitives, Motion Primitives (in beta); for animation plus glass, charts and Base UI primitives, SheenUI (ours, not yet on npm). They all copy source into your repo like shadcn/ui, and the comparison table above lists each one's licence, install method and price, with "nv" where we could not verify a cell.

### What is the best shadcn alternative for a glass look?

For a Base UI foundation like current shadcn/ui, liqui.design (21 components, shadcn registry) or SheenUI (ours, larger scope, installed with the shadcn CLI or by copying the source). Radix-based glass restyles exist too; see our [glassmorphism library comparison](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries).

### Can I use these libraries together with shadcn/ui?

Yes, that is the design. Magic UI, React Bits, Aceternity and liqui.design install into the same \`components/\` folder through the shadcn CLI. Watch for primitive overlap: a Radix-based add-on next to a Base UI shadcn/ui project ships both primitive sets.

### Is there a free shadcn glass theme?

liqui.design and SheenUI are MIT and free. For Radix-based shadcn projects, Glassy UI and crenspire Glass UI are covered in the comparison linked above.

### Do I still need a Base UI port of shadcn/ui?

No. Since July 2026 shadcn/ui defaults to Base UI itself, which is why basecn's last push is from March 2026.
`,r=t();function i(){return(0,r.jsx)(e,{slug:`shadcn-alternatives`,markdown:n})}export{i as default};