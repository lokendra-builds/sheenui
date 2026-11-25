Canonical: https://lokendra-builds.github.io/sheenui/docs/tailwind-v4

# Tailwind v4 Glass UI: Setup, Layers & Tokens

URL: https://lokendra-builds.github.io/sheenui/docs/tailwind-v4
Sidebar name: Tailwind CSS v4 setup

Tailwind v4 glass UI in two CSS imports: no config file, the @source rule, layer order, @theme tokens, glass utilities and v3 changes. Vite and Next.js.

By Lokendra Singh Rathore. Published November 11, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Tailwind CSS v4 setup

A Tailwind v4 glass UI needs two CSS imports and no config file: the SheenUI stylesheet defines the glass tokens, the layer order, the motion variants and the dark variant.

## The two imports

SheenUI is styled with Tailwind CSS v4 and needs no configuration file. In your global stylesheet, import Tailwind first and the SheenUI styles after it:

```css
@import "tailwindcss";
@import "@/components/sheenui/styles/index.css";
```

This is the copied-files form: the shadcn CLI adds the second line for you when it installs the sheenui-theme item, and a hand copy puts the same stylesheet in the same folder. Vite resolves the @/ alias inside CSS; Next.js cannot, so there write the path relative to your global stylesheet, for example ../components/sheenui/styles/index.css in app/globals.css.

Package build (packed tarball; the package is not on npm yet):

```css
@import "tailwindcss";
@import "@sheenui/theme/styles.css";
```

A Vite app also needs Tailwind’s Vite plugin (pnpm add -D tailwindcss @tailwindcss/vite), added next to the React plugin:

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default { plugins: [react(), tailwindcss()] };
```

In a Next.js app, use @tailwindcss/postcss in postcss.config.mjs instead; the CSS file is the same. The [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) has the exact paths for the CLI and manual routes, and the [framework guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) covers Next.js, Vite and React Router.


## Telling Tailwind where the classes are

Tailwind only generates the utilities it finds in files it scans, and it skips node_modules. The packed package solves that itself: its stylesheet ends with an @source line that points at the package’s own components, so the two package imports above are enough. If you import only the component folders you use, take @sheenui/theme/styles/base.css and add one @source line per folder.

When you copy the source into your app, the files are part of your project and Tailwind finds them. Add @source only if your setup excludes the folder (for example a git-ignored one), with a path relative to the CSS file that points at components/sheenui. The copy test that backs every “Files to copy” list builds each one in an empty Vite app with the two imports and such an @source line.


## Layer order

Tailwind v4 declares four cascade layers: theme, base, components and utilities. SheenUI uses three of them and adds one. The glass classes (glass-1, glass-2, glass-3) live in components, so a utility on the same element, such as p-6 or rounded-sheen-lg, overrides them without !important. Page defaults (body color, the focus ring, the forced-colors border on buttons) are in base. Everything else the library writes by hand (motion rules, presets, backdrops, the reduced-transparency and contrast fallbacks) is in a layer named sheen.

Because sheen is first mentioned after Tailwind’s own declaration, it ranks above utilities. If your app needs its own order, declare the layers once at the top of the stylesheet, as this docs site does, and put your page rules in a layer after sheen.


## Tokens exposed through @theme

The entry file imports tokens, motion, glass, backgrounds, the two style presets (Liquid Glass and Aurora Neon), the backdrop styles and a contrast layer for the prefers-contrast: more setting. Colors are oklch values held in --sheen-* custom properties; the presets re-point them through a data-sheen-style attribute on the html element, and light or dark comes from color-scheme and light-dark().

A @theme inline block maps those properties to Tailwind names, so ordinary utilities read the tokens: bg-sheen-bg, text-sheen-fg-muted, bg-sheen-accent-soft, outline-sheen-focus, rounded-sheen-lg and ease-sheen-exit. Because the utilities point at variables, switching the theme or the preset restyles them without a rebuild. A small @theme block adds text-2xs (11px labels). [Glassmorphism tokens for Tailwind CSS](https://lokendra-builds.github.io/sheenui/foundations) explains the glass tokens one by one.


## The smallest glass surface in plain Tailwind

Without SheenUI, one Tailwind CSS v4 glass surface is a handful of utilities over a colorful background (blur needs something to blur). backdrop-blur-xl is a 24px blur:

```tsx
<div className="bg-linear-to-br from-violet-500 via-fuchsia-400 to-amber-300 p-8">
  <div className="rounded-2xl border border-white/60 bg-white/55 p-6 backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-slate-900/50">
    Frosted glass
  </div>
</div>
```

That is the whole idea; the [glassmorphism tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial) adds the lit rim, contrast checks and fallbacks. SheenUI replaces the repeated utilities with glass-1, glass-2 and glass-3 (below), tokens that follow the preset, and solid fallbacks. The dark: variant above follows the data-theme attribute once the SheenUI styles are imported (see the [dark mode page](https://lokendra-builds.github.io/sheenui/docs/dark-mode)); in plain Tailwind v4, declare it yourself:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```


## The glass utilities

Three classes make a surface glass. glass-1 is a tint, a specular gradient, noise and a lit rim with no blur of its own, which keeps a page with dozens of small controls inside the budget of eight blurred surfaces. glass-2 adds a backdrop blur and saturation, and glass-3 a stronger blur with the deepest shadow. Use them like any class:

```tsx
<div className="glass-2 rounded-sheen-xl p-6 text-sheen-fg">
  <h2 className="text-lg font-semibold">Plan</h2>
  <p className="text-sheen-fg-muted">Billed yearly.</p>
</div>
```

Each level falls back on its own: a solid surface where backdrop-filter is missing, under reduced transparency and under prefers-contrast: more, and system colors in forced-colors mode. Never fade or filter a wrapper of a glass element; the blur then stops seeing the page behind it.


## Custom variants

Two custom variants ship with it: dark follows data-theme, and motion-ok applies a class only when movement is welcome, which keeps transforms out of reduced-motion sessions. A third, motion-reduced, is its inverse, for the calmer stand-in such as a short fade. Write motion-ok:hover:-translate-y-0.5 or motion-ok:translate-x-2 motion-reduced:transition-opacity. See [dark mode](https://lokendra-builds.github.io/sheenui/docs/dark-mode) for the first.


## Coming from Tailwind v3

Four things change. Configuration moves from tailwind.config.js into CSS (@theme, @custom-variant, @source). The three @tailwind directives become one @import "tailwindcss". Colors are oklch variables rather than hex values, so an opacity modifier such as bg-sheen-accent/20 is computed with color-mix. And the dark variant is no longer the dark class: here it reads data-theme="dark". If you have a v3 project, upgrade it first with Tailwind’s own migration tool, then add the two imports.


## Frequently asked questions

### How do I set up glassmorphism with Tailwind CSS v4?

Import tailwindcss first and the SheenUI stylesheet after it in your global CSS, with Tailwind's plugin for your bundler (@tailwindcss/vite or @tailwindcss/postcss); no tailwind.config.js is needed. The stylesheet defines the glass-1, glass-2 and glass-3 classes and the --sheen tokens, so a panel is className="glass-2 rounded-sheen-lg p-6" over something colorful, such as the sheen-backdrop class on the body.

### Does SheenUI work with Tailwind CSS v3?

No. The styles use Tailwind v4 features: CSS-first configuration with @theme and @custom-variant, and the oklch tokens in the stylesheet. The peer dependency is tailwindcss 4.1 or newer.

### Do I need a tailwind.config.js?

No. Tailwind v4 reads its configuration from your CSS. Import tailwindcss first, then the SheenUI styles; add an @source line only if Tailwind does not scan the folder that holds the copied components.

### Why must the SheenUI import come after Tailwind?

The stylesheet defines tokens, glass levels, motion variants and presets that build on Tailwind's layers. Importing it afterwards lets its rules and custom variants win over the base layer, and the order is the same in the Vite and Next.js steps.

### How do I get the dark: variant to follow the theme switch?

SheenUI declares @custom-variant dark against the data-theme attribute on the html element, so dark: classes follow the visitor's saved choice, with the operating system as the fallback when nothing is saved.

### Can my own utilities override a glass class?

Yes. The glass-1, glass-2 and glass-3 classes sit in the components layer, which Tailwind orders before utilities, so p-6, rounded-sheen-lg or bg-transparent on the same element win without !important.

### Which Tailwind plugin do I use with Vite and with Next.js?

@tailwindcss/vite in a Vite app and @tailwindcss/postcss in a Next.js app. Both read the same CSS entry file; SheenUI adds nothing to either config.


## Related pages

- [Foundations](https://lokendra-builds.github.io/sheenui/foundations)
- [Dark mode](https://lokendra-builds.github.io/sheenui/docs/dark-mode)
- [Installation](https://lokendra-builds.github.io/sheenui/docs/installation)
- [Built on Base UI](https://lokendra-builds.github.io/sheenui/docs/base-ui)
- [Right-to-left and localisation](https://lokendra-builds.github.io/sheenui/docs/rtl)
- [Performance](https://lokendra-builds.github.io/sheenui/docs/performance)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
