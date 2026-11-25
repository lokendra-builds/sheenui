---
title: "Best Glassmorphism React Libraries (2026) | SheenUI"
description: "The best glassmorphism React libraries compared on checked data: components, Liquid Glass refraction, Safari fallback, accessibility, license, install."
slug: "best-glassmorphism-react-libraries"
route: "/guides/best-glassmorphism-react-libraries"
targetKeyword: "best glassmorphism react libraries"
secondaryKeywords: ["best liquid glass react library", "glassmorphism library comparison", "react ui library 2026"]
published: "2026-11-08"
updated: "2026-11-14"
relatedRoutes: ["/effects/liquid-glass", "/components/glass-card", "/components/dialog", "/foundations"]
---

# Best Glassmorphism React Libraries (2026)

Searching for the best glassmorphism React libraries gets you demos and little hard data. This guide compares nine options, including our own, on things you can check: component count, whether the glass refracts (Liquid Glass) or only blurs, what Safari and Firefox get, which accessibility preferences are honored, install method, primitives, license, and when it last shipped. Every number was checked on 8 Nov 2026 against npm, the GitHub API or the library's own docs, with the source linked next to it.

Basis: npm, the GitHub REST API and each library's own docs, as linked next to each number and dated 8 Nov 2026 in the text; a cell with no verified value says so. First published 8 Nov 2026, last revised 14 Nov 2026; each figure keeps the date given in the text, and stars, versions and release dates can have changed since.

## How we compared (and a note that SheenUI is ours)

SheenUI is our library. It is in this list because it belongs here, and we applied the same rules to it as to everyone else:

- A cell gets a value only if we verified it today; otherwise it says "not verified" or "not documented". Nothing is estimated.
- Component counts come from each library's own README or docs; we quote their wording when counts conflict.
- "Refraction" means the backdrop is displaced (bent), usually with an SVG `feDisplacementMap` inside `backdrop-filter` or a WebGL shader. Blur plus a white overlay is frosted glass. The [Liquid Glass effect page](https://lokendra-builds.github.io/sheenui/effects/liquid-glass) shows the difference.
- "Safari fallback" is what the library documents, because Safari and Firefox do not apply SVG filters inside `backdrop-filter`.
- Accessibility lists only documented behavior for reduced transparency, reduced motion, forced colors and keyboard support.
- Stars and push dates come from the GitHub REST API; release dates from npm where a package exists.
- The 21st.dev collection is a marketplace rather than a library, and the table says so.

## Comparison table

All values as of 8 Nov 2026. "Push" is the repository's last push date.

| Library | Components | Liquid Glass refraction | Safari fallback | Accessibility features | Install | Primitives | License | Last release / push | Stars |
|---|---|---|---|---|---|---|---|---|---|
| SheenUI (ours) | 86 component pages, 20 blocks, 5 templates | Yes, Chromium only (SVG feDisplacementMap in backdrop-filter) | Frosted glass | Solid glass for reduced transparency, more contrast, forced colors; Lite glass mode; blur and lens budgets | `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/<name>.json` (183 items), or copy the source | Base UI 1.9 | MIT | Not published yet | n/a |
| [liqui.design](https://github.com/leefanv/liqui-design) | 21 (README list) | Yes, canvas displacement map plus SVG filter, Chromium only | Automatic frosted blur | Not documented ("comes from the primitives") | `npx shadcn@latest add https://liqui.design/r/button.json` | Base UI | MIT | Push 22 Oct 2026 | 170 |
| [Glassy UI](https://github.com/alexburlis/glassyui) | 38 web (plus React Native set) | "Chromium adds a refracting edge" over live content; optional `LiquidFilters` SVG | Homepage says Safari, Chrome and Firefox bend the backdrop the same way (blur) | Reduce Transparency turns glass solid; Reduce Motion holds it still; Radix keyboard support | `npx shadcn@4.14.1 add @glassyui/glass-button` | Radix | MIT | Push 6 Nov 2026 | 164 |
| [liquid-glass-react](https://github.com/rdev/liquid-glass-react) | 1 (`LiquidGlass` wrapper) | Yes, displacement | Documented: "displacement will not be visible" in Safari and Firefox | None documented | `npm install liquid-glass-react` | None | MIT | npm 1.1.1 on 11 Jun 2025; push 13 Jun 2025 | 6,635 |
| [shadcn-glass-ui](https://github.com/artyhoo/shadcn-glass-ui-library) | "59 components" (catalog page says 57) | Not documented | Not documented | Not documented | `npm install shadcn-glass-ui` or `npx shadcn@latest add @shadcn-glass-ui/button-glass` | Radix (npm dependencies) | MIT on npm, Apache-2.0 on GitHub (conflict) | npm 2.11.2 on 25 Dec 2025; push 14 Sep 2026 | 38 |
| [glasscn-ui](https://github.com/itsjavi/glasscn-ui) | Not stated | No (blur variants) | Not documented | Not documented | `npm install glasscn-ui` | Radix (npm dependencies) | MIT | npm 0.7.1 on 19 Oct 2024; repo archived 2 Sep 2026 | 99 |
| [crenspire Glass UI](https://github.com/crenspire/glass-ui) | "49 Liquid Glass Components" (37 named) | Yes, WebGL shader (refraction, dispersion, rim light) | Not documented; CSS look without WebGL or with reduced transparency | Radix primitives; reduced transparency fallback | `npx shadcn@latest add @glass-ui/button` | Radix | README says MIT; GitHub detects none | Push 14 Oct 2026 | 102 |
| [Ein UI](https://github.com/einui/einui) | Not stated in README | No (frosted glass) | Not documented | "Built-in accessibility" via Radix; no specifics | shadcn CLI from `https://ui.eindev.ir/r/registry.json` | Radix, Tailwind v4 | MIT | Push 18 Oct 2026 | 157 |
| [21st.dev glass collection](https://21st.dev/community/components/s/glassmorphism) | "135 components available" (community authored) | Varies per component | Varies | Varies | 21st.dev install; free tier is 2 copies per day | Varies | Per component, not verified | n/a | n/a |

## Short reviews, strengths first

### SheenUI (ours)

Strengths: the broadest scope here, with 86 component pages, 20 blocks and 5 dashboard templates on Base UI 1.9.0, Motion 14.14.0, Tailwind CSS v4 (the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) explains the two CSS imports) and React 19. The refraction is real Liquid Glass (SVG `feDisplacementMap` inside `backdrop-filter`), and the fallbacks are explicit: Safari and Firefox get frosted glass; the glass turns solid under reduced transparency, more contrast or forced colors. A Lite glass mode covers weak devices, with a budget of at most 8 blurred surfaces and 3 refraction lenses in view. Two presets ship: Liquid Glass (default) and Aurora Neon. MIT.

Limits: it is a copy-the-source library. The `@sheenui/theme` package is not on npm yet, so you install through the shadcn registry (183 items: the shared theme, every component and chart, and the blocks), copy files from the repo, or use a packed tarball; the [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) has the tested steps for Next.js and Vite, and the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) has the short version. No release or star count exists yet. Start with the [Glass Card](https://lokendra-builds.github.io/sheenui/components/glass-card) and the [foundations page](https://lokendra-builds.github.io/sheenui/foundations).

### liqui.design

Strengths: the closest match to SheenUI's approach. Built on Base UI, it refracts with a canvas-generated displacement map driving an SVG filter, and is clear about browsers: Chromium gets full displacement, Safari "drops `backdrop-filter` entirely when it references an SVG filter", Firefox the same, and the frosted fallback is automatic ([README](https://github.com/leefanv/liqui-design)). One shadcn command per component also installs an `@liqui-design/glass` package and adds tokens to `globals.css`. 21 components, MIT, pushed 22 Oct 2026, 170 stars.

Limits: no accessibility section; the site says "accessibility comes from the primitives, not from us", so reduced transparency and forced colors are undocumented.

### Glassy UI

Strengths: the clearest accessibility statement among the third-party options: "Reduce Transparency turns the glass solid. Reduce Motion holds it still", with controls on Radix for keyboard support. 38 free web components plus a React Native set, installed through the `@glassyui` shadcn namespace. MIT, pushed 6 Nov 2026, 164 stars ([repo](https://github.com/alexburlis/glassyui)).

Limits: refraction is a Chromium "refracting edge" rather than a full lens, and the optional `LiquidFilters` SVG is something "no Glassy UI component needs". Pro templates are paid ($99 pre-order for the first 100, then $199, per the homepage).

### rdev/liquid-glass-react

Strengths: the component that made "Liquid Glass in React" popular, with 6,635 stars. A single `LiquidGlass` wrapper with props for `displacementScale`, `blurAmount`, `saturation`, `aberrationIntensity` and `elasticity`; the README states that "Safari and Firefox only partially support the effect (displacement will not be visible)" ([repo](https://github.com/rdev/liquid-glass-react)). MIT.

Limits: one effect, not a component library, with no accessibility notes. npm 1.1.1 was published on 11 Jun 2025; last push 13 Jun 2025. Peer dependency: React 19 or newer.

### shadcn-glass-ui

Strengths: a drop-in layer over an existing shadcn/ui project with "59 components, 3 themes" (Glass, Light, Aurora), installable from npm or a namespaced registry. npm dependencies are individual `@radix-ui/react-*` packages plus `framer-motion` and `recharts`.

Limits: no documented refraction, browser fallback or accessibility behavior. The license is MIT on npm but Apache-2.0 on GitHub; resolve that before adopting. The repo moved to [artyhoo/shadcn-glass-ui-library](https://github.com/artyhoo/shadcn-glass-ui-library) (38 stars, pushed 14 Sep 2026); the last npm release was 2.11.2 on 25 Dec 2025.

### glasscn-ui

Strengths: an early glass variant of shadcn/ui as a real npm package with a Tailwind preset, MIT licensed.

Limits: the repository was archived on 2 Sep 2026 and is read-only; the last npm release (0.7.1) is from 19 Oct 2024, and it targets Tailwind v3 (`tailwind.config.ts`, `@tailwind` directives). Not a starting point for new work.

### crenspire Glass UI

Strengths: the only library here that draws glass with a WebGL shader ("refraction, chromatic dispersion and a light-tracking rim"), with a documented CSS fallback when WebGL is missing or reduced transparency is on. Radix and shadcn/ui underneath, installed via `@glass-ui/*`, pushed 14 Oct 2026, 102 stars ([repo](https://github.com/crenspire/glass-ui)).

Limits: a WebGL canvas per surface has a different performance profile from CSS glass; measure it (see [backdrop-filter performance](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance)). The README says MIT but GitHub detects no license file. No Safari notes.

### Ein UI

Strengths: a clean frosted-glass set on Radix, shadcn/ui and Tailwind v4, MIT, with a public shadcn registry. Pushed 18 Oct 2026, 157 stars at its new home [einui/einui](https://github.com/einui/einui).

Limits: frosted glass, not refraction; the README states no component count (third-party listings say 44, not verified) and no browser or preference handling.

### The 21st.dev glass collection

Strengths: volume. The glassmorphism tag lists "135 components available", each by an individual author, useful for one-off hero sections.

Limits: a marketplace, not a maintained library. No shared primitive layer; accessibility and licenses vary per component (not verified). The free Hobby tier allows "2 free copies / day"; unlimited installs start at Builder ($6/month billed yearly) per the [pricing page](https://21st.dev/pricing).

## Which one to pick, by use case

- A full app with Liquid Glass and documented fallbacks: SheenUI, which installs with a shadcn command or by copying the source (no npm package yet); liqui.design for the same Base UI foundation with a smaller surface.
- A shadcn/ui project to restyle without changing primitives: Glassy UI (Radix, strong preference handling) or crenspire Glass UI (Radix, WebGL look).
- One hero element with a real lens: liquid-glass-react, if the 2025 release dates are acceptable.
- Mobile too: Glassy UI, the only one with a React Native set.
- A single landing block: 21st.dev, with per-component license checks.

## Limitations of this comparison, and when glass is the wrong choice

Counts are self-reported and sometimes inconsistent across a project's own pages (we quoted both where they differ). Stars measure attention, not quality. Push dates say a repository is alive, not that the glass is correct. We ran no benchmarks on the other libraries, so no cell claims frame rates.

Glass is the wrong choice for dense data tools, text-heavy pages and anything that must meet contrast targets with user content behind the surface. Every library here depends on `backdrop-filter`, and every blurred surface costs GPU time, so long lists of glass cards hurt on low-end phones. If your users often enable reduced transparency or forced colors, pick a library that documents a solid fallback or skip glass. Read [accessible glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism) first.

## Frequently asked questions

### What is the best liquid glass React library?

For true refraction with documented fallbacks: SheenUI (ours, Base UI, not yet published), liqui.design (Base UI, 21 components) and crenspire Glass UI (Radix, WebGL). liquid-glass-react is the best single-effect wrapper but has not shipped since June 2025.

### Does Liquid Glass refraction work in Safari?

Not with the SVG-filter technique. liqui.design documents that Safari drops `backdrop-filter` when it references an SVG filter; liquid-glass-react documents that displacement is not visible in Safari or Firefox. SheenUI falls back to frosted glass there. Only a WebGL approach (crenspire) can refract in Safari.

### Which glassmorphism libraries use Base UI instead of Radix?

SheenUI and liqui.design. Glassy UI, shadcn-glass-ui, glasscn-ui, crenspire Glass UI and Ein UI are on Radix. See our [Base UI vs Radix guide](https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix).

### Are these libraries free?

Every verified license is MIT (shadcn-glass-ui shows MIT on npm and Apache-2.0 on GitHub). Glassy UI sells templates separately; 21st.dev limits free copies to two per day.

Updated 8 Nov 2026; we re-check this quarterly.
