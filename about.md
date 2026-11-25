Canonical: https://lokendra-builds.github.io/sheenui/about

# About SheenUI: MIT Glass React Components

URL: https://lokendra-builds.github.io/sheenui/about
Sidebar name: About SheenUI

SheenUI is an MIT-licensed, pre-1.0 library of glass React components by Lokendra Singh Rathore: what it is, its status, how it is tested, how to cite it.

By Lokendra Singh Rathore. Published November 17, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > About SheenUI

SheenUI is a free, MIT-licensed library of glassmorphism and Liquid Glass React components, built on Base UI, Tailwind CSS v4 and Motion, at version 0.1 and not on npm.

## What SheenUI is

SheenUI is a copy-the-source library of glass React components: 67 UI components, 19 animated effects, 48 charts, 20 blocks and 5 dashboards. Each is built on a [Base UI](https://lokendra-builds.github.io/sheenui/docs/base-ui) primitive where one exists, styled with Tailwind CSS v4 and animated with Motion. Two looks ship with it, Liquid Glass and Aurora Neon, each in light and dark.

It is a source library, not a package you import from node_modules: the CLI copies the files into your repository and you own them. The [glass design tokens](https://lokendra-builds.github.io/sheenui/foundations) (three glass levels, blur, tint and rim) and the [Tailwind v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) are the whole contract between the library and your app.


## Who makes it

SheenUI is designed and built by [Lokendra Singh Rathore](https://github.com/lokendra-builds) (GitHub: lokendra-builds), as an open-source project. The source, the issue tracker and the history live in the [SheenUI repository](https://github.com/lokendra-builds/sheenui). There is no company behind it and no paid tier.


## License and cost

SheenUI is released under the [MIT license](https://opensource.org/licenses/MIT). It costs nothing, needs no account and sends no telemetry. Third-party licenses (Base UI, Motion, the fonts) are listed in the repository’s notices file.


## Status: version 0.1, pre-1.0, not on npm

The current version is 0.1.0. Until 1.0, a prop or a file can move between versions. No GitHub release has been published yet, so 0.1.0 is simply the version in the source. The package is private, so there is nothing to npm install; the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) shows the shadcn CLI route (183 registry items) and the manual one.

Known limits, stated plainly: Liquid Glass refraction is Chromium-only (other browsers show frosted glass), and no real iPhone or Android phone has been used, so iOS Safari blur is unverified. It needs React 19.2 or newer and Tailwind CSS 4.1 or newer.


## How it is built and checked

Each component has a unit test that renders it in light and dark, in both looks, and runs axe-core on every render: 143 test files run in a real Chromium through Vitest browser mode, with coverage gates (90% of lines, functions and statements, 80% of branches). 15 Playwright specs cover the built site: a sweep of every route, visual baselines, accessibility, a pixel-level contrast check and the motion rules (loops pause off-screen, reduced motion is respected).

Every docs page lists the exact files to copy, computed from the import graph, and a copy test builds each list in an empty Vite app. A build check fails on a missing title, a duplicate description, a broken link or a number on the site that disagrees with the code. The [dark mode](https://lokendra-builds.github.io/sheenui/docs/dark-mode) and [right-to-left](https://lokendra-builds.github.io/sheenui/docs/rtl) pages describe the two behaviours that touch every component, and the [performance](https://lokendra-builds.github.io/sheenui/docs/performance) page lists the budgets and lab numbers.


## How to cite SheenUI

Link to [https://lokendra-builds.github.io/sheenui](https://lokendra-builds.github.io/sheenui) or to the repository. For a text citation, use:

```text
SheenUI. Glassmorphism and Liquid Glass React components. Lokendra Singh Rathore. MIT license. https://lokendra-builds.github.io/sheenui/about
```

A page-level fact (a prop, a count, a browser limit) is best cited with the page it comes from: every docs page has a stable URL, and [the component index](https://lokendra-builds.github.io/sheenui/components/), [the charts](https://lokendra-builds.github.io/sheenui/charts/) and the [guides](https://lokendra-builds.github.io/sheenui/guides/) list them.


## Frequently asked questions

### Is SheenUI on npm?

No. The theme package is marked private on purpose, so it cannot be published by accident. You install a component with the shadcn CLI (npx shadcn@latest add <url>.json), which copies the source into your app, or you copy the files the page lists.

### Is it free for commercial use?

Yes. The license is MIT: use, change and ship the copied source in a commercial product. Keep the copyright and license notice with the source.

### Is it stable enough for production?

It is version 0.1, pre-1.0, so props and file layout can still change between releases. The tests, the type checks and the accessibility checks run on every component, but no real iPhone or Android phone has been used yet and the Liquid Glass refraction only works in Chromium.

### Who maintains it, and where do I report a problem?

Lokendra Singh Rathore maintains it. Open an issue on the GitHub repository; a reproduction (the component, browser and the look: Liquid Glass or Aurora Neon, light or dark) is the fastest way to a fix.


## Related pages

- [Introduction](https://lokendra-builds.github.io/sheenui/)
- [Foundations](https://lokendra-builds.github.io/sheenui/foundations)
- [Showcase](https://lokendra-builds.github.io/sheenui/showcase)
- [Installation](https://lokendra-builds.github.io/sheenui/docs/installation)
- [Forms recipe](https://lokendra-builds.github.io/sheenui/docs/forms)
- [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
