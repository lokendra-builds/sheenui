Canonical: https://lokendra-builds.github.io/sheenui/guides/

# React Glass UI Guides and Tutorials

URL: https://lokendra-builds.github.io/sheenui/guides/
Sidebar name: Guides

Guides for accessible glass UI in React: glassmorphism, Liquid Glass with a Safari fallback, backdrop-filter speed, Motion, Base UI and installing SheenUI.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Guides

Step-by-step guides for building accessible glass UI in React: tutorials, Safari and Firefox fallbacks, performance, Motion, Base UI and how to install SheenUI.

## Getting started

Read these to get glass UI running: install SheenUI in Next.js or Vite, build a glass card from scratch in React, or give an AI coding agent rules that produce readable glass.

- [Install SheenUI Glass Components in Next.js and Vite](https://lokendra-builds.github.io/sheenui/guides/install-frameworks): Tested install steps for SheenUI in Next.js App Router and Vite (React Router or TanStack Router): the shadcn CLI, the packed package, or copying files.
- [Glassmorphism in React: A Step-by-Step Tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial): Glassmorphism in React is a frosted-glass UI style: a tint, backdrop-filter blur and light border. Build it in CSS, Tailwind v4 and React, with contrast.
- [Glassmorphism UI Prompts for AI Coding Agents](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-ui-prompt): A glassmorphism UI prompt for Claude, Cursor and v0: copy-paste prompts, a rules file and a review checklist for accessible glass and Liquid Glass UI.


## Concepts and patterns

Read these to understand how a technique works before you use it: Apple's Liquid Glass refraction with a Safari and Firefox fallback, and twelve Motion patterns for React.

- [Apple Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react): Liquid Glass CSS for React: Apple's iOS 26 look with an SVG displacement map, plus a frosted fallback for Safari and Firefox. Working code.
- [Framer Motion Examples: 12 Animated React Patterns](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples): 12 Framer Motion examples for React in Motion (motion/react): springs, shared layouts, scroll reveals, drag, tilt, reduced motion. Copy-paste code.


## Comparisons

Read these to choose: glassmorphism against Liquid Glass and neumorphism, Base UI against Radix, glass libraries against each other, and shadcn alternatives. Each compares checked data and says where SheenUI is the author's own.

- [Glassmorphism vs Liquid Glass vs Neumorphism](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-vs-liquid-glass): Glassmorphism vs Liquid Glass vs Neumorphism: how each works in CSS, browser support, accessibility and cost, when to use which, with React code.
- [Base UI vs Radix UI for React in 2026](https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix): Base UI vs Radix UI for React compared on checked data: component coverage, render prop vs asChild, release dates, shadcn support and migration notes.
- [Best Glassmorphism React Libraries (2026)](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries): The best glassmorphism React libraries compared on checked data: components, Liquid Glass refraction, Safari fallback, accessibility, license, install.
- [shadcn Alternatives with Animation: Nine Libraries Compared (2026)](https://lokendra-builds.github.io/sheenui/guides/shadcn-alternatives): shadcn alternatives with animation, glass and charts, checked on 8 Nov 2026: license, install method, primitives and paid tiers for nine libraries.


## Migration

Read this if your code still imports from framer-motion: the package is now Motion, imported from motion/react, and the guide covers the switch, Next.js and bundle size.

- [Framer Motion Is Now Motion](https://lokendra-builds.github.io/sheenui/guides/framer-motion-to-motion): Framer Motion to Motion migration: switch from framer-motion to the motion package and motion/react imports, with a codemod, Next.js notes and bundle size.


## Performance and accessibility

Read these before shipping glass: what backdrop-filter costs and how to keep it fast, how to measure and meet contrast on translucent surfaces, and how to make charts usable without color or a mouse.

- [backdrop-filter Performance: Fast Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance): backdrop-filter performance, measured: what blur costs, why a moving backdrop is the real problem, rules for fast glass, and a lite mode for weak devices.
- [Accessible Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism): Glassmorphism accessibility in React: WCAG contrast on glass, prefers-reduced-transparency, prefers-contrast, forced colors and reduced motion, with code.
- [Accessible React Charts](https://lokendra-builds.github.io/sheenui/guides/accessible-react-charts): Accessible React charts with a table fallback: color-blind-safe palettes, keyboard reading, screen-reader summaries, never relying on color. Tested code.


## Frequently asked questions

### Which guide should I read first?

To install, read the Next.js and Vite install guide. To learn the technique, read the glassmorphism React tutorial. To choose a library, start with the comparison of glassmorphism React libraries.

### Do the guides say which versions they were checked against?

Where a guide quotes third-party facts (versions, licences, star counts, browser support), it dates them in the text, such as React 19.3, Tailwind CSS 4.3 and Vite 8.3 in the install guide. Several guides also say near the top what they are based on, and every guide shows its published and updated dates; those are when the text was written and revised, not a claim that every fact was re-checked that day.

### Is the code in the guides tested?

Yes, the TypeScript samples that use SheenUI are compiled against the library by the repo's checks. The Code panel samples on the component pages and the guides' own code blocks are type-checked against the real SheenUI exports by pnpm pagecode:check, and the @example blocks in the library source by pnpm examples:check. A guide sample that shows another library's API, such as the Radix version in the Base UI comparison, is marked external and is not compiled. Compiling is not running: where a guide says it ran or checked something, such as the install guide's end-to-end runs in Next.js and Vite apps, it says what and on which date.

### Are the comparison guides neutral?

They say up front that SheenUI is the author's own library, give strengths first and mark data they could not verify instead of guessing.

### Can I read the guides outside the site?

Yes. Each guide is a Markdown file in the docs/guides folder of the repository, and the full text is also in the llms.txt files.


## About the guides

### How the guides are written

Each guide is a Markdown file in the repository (docs/guides), so you can read it on GitHub or here. The component pages’ code samples are type-checked against the real exports, and so are the guides’ own TypeScript samples that use SheenUI, and every guide links to the SheenUI pages it talks about. Who writes them and how the facts are checked is on the [About SheenUI](https://lokendra-builds.github.io/sheenui/about) page.


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
