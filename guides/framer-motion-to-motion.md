Canonical: https://lokendra-builds.github.io/sheenui/guides/framer-motion-to-motion

# Framer Motion to Motion: Migrating to motion/react

URL: https://lokendra-builds.github.io/sheenui/guides/framer-motion-to-motion
Sidebar name: Framer Motion to Motion

Framer Motion to Motion migration: switch from framer-motion to the motion package and motion/react imports, with a codemod, Next.js notes and bundle size.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 15, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Guides](https://lokendra-builds.github.io/sheenui/guides/) > Framer Motion Is Now Motion

Framer Motion renamed itself Motion, and moving over takes one package swap and one import change. The animation library for React is now called Motion, it is published on npm as `motion`, and React code imports from `motion/react` instead of `framer-motion`. The `motion` component API you already know stays the same. The TypeScript samples in this guide are compiled by the repo's checks: against the installed `motion` package, and against SheenUI where they use it.

This guide covers what changed, a small script that rewrites your imports, what to check for React 19 and Next.js, and how to cut bundle size with `LazyMotion`. We verified the package facts with `npm view` on 8 Nov 2026; the version SheenUI's components use is Motion 14.14.0. For examples after you migrate, see [12 Framer Motion examples](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples).

Basis: Motion's upgrade guide, package facts from npm dated in the text (8 Nov 2026, and the re-check of Motion 14.14.0 dated 15 Nov 2026), and the Motion version SheenUI's components use. First published 8 Nov 2026, last revised 15 Nov 2026; a revision date does not mean every fact was re-checked that day.

## What changed: the name, the package and the import path

| Before | Now |
|---|---|
| `npm install framer-motion` | `npm install motion` |
| `import { motion } from "framer-motion"` | `import { motion } from "motion/react"` |
| `framer-motion/m` | `motion/react-m` |
| `framer-motion/client` | `motion/react-client` |

Motion's [upgrade guide](https://motion.dev/docs/react-upgrade-guide) says to uninstall `framer-motion`, install `motion` and import from `motion/react`. The two packages are not separate code bases. We re-checked the installed `motion` 14.14.0 on 15 Nov 2026: `motion/react` is the single line `export * from 'framer-motion'`, `motion/react-client` re-exports `framer-motion/client` and `motion/react-m` re-exports `framer-motion/m`. `motion` also depends on `framer-motion` at exactly the same version (14.14.0). SheenUI's peer range starts at `^14.10.1`; 14.14.0 is the version this guide was checked against.

The `motion` package has more entry points than React alone. Its `exports` include `motion/react`, `motion/react-client`, `motion/react-m`, `motion/react-mini`, `motion/react-animate-view`, `motion/mini` and the vanilla JavaScript entry `motion`.

One naming trap: versions of `motion` up to 10.18.0 were a different library. npm shows 10.18.0 depending on `@motionone/*` packages, and the next published version is 11.11.12. If an old tutorial tells you to install `motion@10`, it means the vanilla Motion One library, not this one.

## Install, then search and replace the imports

```bash
npm uninstall framer-motion
npm install motion
```

In a monorepo, change every package in one pull request so the workspace resolves a single copy, and commit the updated lockfile so CI installs the same versions you tested. Then rewrite the imports. A search and replace for `"framer-motion"` to `"motion/react"` is enough for most projects. This script does it across a folder, including dynamic `import()` and `require()` calls, and leaves everything else alone:

```js
// codemod.mjs, run with: node codemod.mjs src
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? "src";
/** @type {string[]} */
const files = [];

/** @param {string} dir */
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== "node_modules") walk(path);
    } else if (/\.(tsx?|jsx?|mdx?)$/.test(name)) {
      files.push(path);
    }
  }
}

walk(root);

let changed = 0;
for (const file of files) {
  const source = readFileSync(file, "utf8");
  const output = source
    .replace(/(from\s+|import\s*\(\s*|require\(\s*)(["'])framer-motion\/m\2/g, "$1$2motion/react-m$2")
    .replace(/(from\s+|import\s*\(\s*|require\(\s*)(["'])framer-motion\/client\2/g, "$1$2motion/react-client$2")
    .replace(/(from\s+|import\s*\(\s*|require\(\s*)(["'])framer-motion\2/g, "$1$2motion/react$2");
  if (output !== source) {
    writeFileSync(file, output);
    changed++;
  }
}
console.log(`updated ${changed} of ${files.length} files`);
```

We ran it on a sample folder with static, dynamic and `require` imports and it rewrote all of them. Commit before you run it, then check the diff. Other entry points, such as `framer-motion/dom`, have no one-to-one rename: look them up in the upgrade guide.

Afterwards, run `npm ls framer-motion`. Libraries in your tree that depend on `framer-motion` themselves may pull in a second copy at a different version. That usually does not break anything, but it adds weight to your bundle.

## Verify the migration

A short checklist after the swap:

1. `npm ls framer-motion` should list one version, the one `motion` depends on. Extra copies from third-party libraries are fine, but note them.
2. Search your source for the old name (`grep -rn "framer-motion" src`). Only intentional leftovers, such as `framer-motion-3d` or `framer-motion/dom`, should remain.
3. Run `tsc --noEmit`. In our check, `motion/react` resolved under TypeScript 6.0.3 with `moduleResolution` set to `node10`, `bundler` and `nodenext`, so you do not need to change your tsconfig.
4. Open the pages with the most animation and check exits, shared layouts and gestures by hand. Automated tests rarely catch a changed spring.
5. Test reduced motion: turn on the OS setting and confirm that transforms stop (see [the examples guide](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples)).
6. Compare your bundle before and after with your bundler's analyzer. If the `motion` component is a large share, consider `LazyMotion` below.

## What stays the same

The component API: `motion.div`, `animate`, `initial`, `exit`, `variants`, `layout`, `layoutId`, `AnimatePresence`, `useMotionValue`, `useScroll` and the rest. According to the upgrade guide, versions 12.0 and 14.0 had no breaking changes for Motion for React; 14.0 deprecated some internal APIs and made versioning between internal dependencies stricter.

If you are jumping from an older Framer Motion, these are the changes that can bite. They are from the guide, listed by the release that introduced them:

| Version | Change |
|---|---|
| 7.0 | Requires React 18 or later |
| 9.0 | Tap-enabled elements get `tabindex="0"`; `whileFocus` follows `:focus-visible` |
| 10.0 | The `IntersectionObserver` fallback for `whileInView` is removed; `exitBeforeEnter` on `AnimatePresence` now throws, use `mode="wait"` |
| 11.0 | `MotionValue` velocity calculation changed; the initial render moves to a microtask, so Jest tests may need to await an animation frame |
| 13.0 | `@emotion/is-prop-valid` is no longer an optional dependency; Styled Components and Emotion users may need `MotionConfig`'s `isValidProp` |

Current peer dependencies are React `^18.0.0 || ^19.0.0` (read from the installed package).

## React 19 and Next.js

In the Next.js App Router, anything that uses hooks or event handlers must be a client component. Put `"use client"` at the top of files that import from `motion/react`. For a Server Component that only needs static initial and animate props, import from `motion/react-client`:

```tsx
import * as motion from "motion/react-client";

export default function Page() {
  return (
    <motion.h1 initial={{ opacity: 0.2, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      Hello
    </motion.h1>
  );
}
```

Motion's upgrade page does not discuss Next.js; the `react-client` entry above is documented only by the package's own exports. Check Motion's current Next.js notes before relying on it in production. Hooks such as `useReducedMotion`, `useScroll` and `AnimatePresence` still need a client component. Every SheenUI component that uses Motion begins with `"use client"` for this reason.

## Bundle size: LazyMotion and m

The `motion` component cannot be tree-shaken below roughly 43 kB, according to Motion's [bundle size docs](https://motion.dev/docs/react-reduce-bundle-size). Using the lighter `m` component with `LazyMotion` brings the initial render to just over 5 kB, and you add features as needed: `domAnimation` (about +24 kB) covers animations, variants, exit animations and tap, hover and focus gestures; `domMax` (about +38 kB) adds drag and layout animations. The figures come from Rollup builds; Webpack output is slightly larger.

```tsx
import { LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

export function Fade({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {children}
      </m.div>
    </LazyMotion>
  );
}
```

With `strict`, a plain `motion` component inside the provider throws, which keeps you from accidentally pulling in the full bundle. To load the features after the first render, pass an async function:

```ts
// file: features.ts
import { domMax } from "motion/react";

export default domMax;
```

```tsx
import { LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

const loadFeatures = () => import("./features").then((module) => module.default);

export function Card({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures}>
      <m.div layout drag="x">
        {children}
      </m.div>
    </LazyMotion>
  );
}
```

Remember that layout animations and drag need `domMax`, not `domAnimation`.

## When not to migrate (yet)

- **You are pinned to an old major.** If you are on React 16 or 17 and framer-motion below 7, jumping straight to Motion 14 means upgrading React first.
- **Your dependencies still use `framer-motion`.** Migrating your own code is fine, but you will carry two import names until they update. They resolve to the same library at the same version when the versions match.
- **You have no reason to touch it.** The old package is still published, so a working project does not have to change the import line this week.

## Frequently asked questions

### How do I migrate from Framer Motion to Motion?

Uninstall `framer-motion`, install `motion`, and change each import from `framer-motion` to `motion/react` (`framer-motion/m` becomes `motion/react-m`, `framer-motion/client` becomes `motion/react-client`). The `motion` component API stays the same, and Motion's upgrade guide lists no breaking changes for React in 12.0 and 14.0. The script above rewrites the imports for you; then run your build and tests.

### Is framer-motion still published?

Yes, as of 8 Nov 2026. The npm registry's [`framer-motion` record](https://registry.npmjs.org/framer-motion/latest) and [`motion` record](https://registry.npmjs.org/motion/latest) both showed 14.10.1 as the latest version with no deprecation message, and `npm view` lists both packages as last modified on 6 Nov 2026. Check again on the day you migrate.

### Do I have to change anything besides the imports?

Not if you are already on a recent version. The upgrade guide lists no breaking changes for React in 12.0 and 14.0. If you are coming from an older release, check the table above.

### Does Motion work with React 19 and Tailwind CSS v4?

Yes. Its peer dependencies allow React 18 or 19, and SheenUI ships React 19.2+ components animated with Motion 14.14.0 and styled with Tailwind CSS v4 (see the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) and the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation)). SheenUI's [Tabs](https://lokendra-builds.github.io/sheenui/components/tabs), [Toast](https://lokendra-builds.github.io/sheenui/components/toast), [Number ticker](https://lokendra-builds.github.io/sheenui/effects/number-ticker) and [Morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog) pages show it in use.

### Is Motion for vanilla JavaScript the same package?

The `motion` package exposes both: the React API under `motion/react` and the vanilla `animate()` function from `motion`.

---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
