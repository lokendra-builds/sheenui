Canonical: https://lokendra-builds.github.io/sheenui/docs/installation

# Install Glassmorphism Components with shadcn CLI

URL: https://lokendra-builds.github.io/sheenui/docs/installation
Sidebar name: Installation

Add SheenUI's glassmorphism components to any React 19 + Tailwind CSS v4 app with one shadcn CLI command, or copy the source. Works with Vite and Next.js.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Installation

Add SheenUI's shadcn glassmorphism components to a React 19 and Tailwind CSS v4 app with one shadcn command, or copy the source folders you need.

SheenUI works like shadcn/ui: you copy the source of the components you use into your project and own it. The fastest way is the shadcn CLI, because every component, chart and block is a registry item. One command copies the files and installs the packages they need, so you can add the [glass card](https://lokendra-builds.github.io/sheenui/components/glass-card) or the [button](https://lokendra-builds.github.io/sheenui/components/button) without reading an import graph. You end up with plain React components in your own folders that you can read, change and keep.

## First, the @/* path alias

The shadcn CLI needs an @/* alias that points at your source folder. A Next.js app made with create-next-app --import-alias "@/*" has it already. A fresh Vite app does not, and shadcn init stops with Could not find valid path aliases. In Vite, add the same paths entry to tsconfig.json and tsconfig.app.json (inside compilerOptions):

```
"paths": { "@/*": ["./src/*"] }
```

Do not add baseUrl: TypeScript 7 rejects it, and paths alone works on TypeScript 5, 6 and 7. Then give Vite the same alias in vite.config.ts, next to the React and Tailwind plugins:

```tsx
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
```

Make sure src/index.css holds @import "tailwindcss";, then run npx shadcn@latest init -d. The [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) shows every file in full.


## Install with the shadcn CLI

In a project that already has React 19.2 and Tailwind CSS v4 (new to it? the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) is two lines of CSS), run the add command with the registry URL of the component:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json
```

The item installs into components/sheenui/ and pulls in the shared tokens, glass styles, motion presets and hooks. Replace glass-card with any item name: button, dialog, data-table, a chart or a block.

An example can use more than the page's own component: the dialog example has an Input, so add input too. The Files to copy box on each page lists every item its examples import. A dashboard is the item analytics-demo-saas (dashboard plus sample data; the other four are analytics-demo-web, -ecommerce, -product and -finance) or analytics-saas for the dashboard alone.

The command only adds files. To see a styled page you still need the alias, the two CSS imports below, the SheenMotionProvider and the backdrop, and the preference script. In Vite that script goes into index.html as an inline <script> in the head (its text is sheenPreferenceScript), because a component cannot be imported there. If the CLI fails with a 503 from github.io, run the command again.


## Install everything, or a whole family

Five bundle items install a family in one command. A bundle has no files of its own: it lists the real items it needs, so nothing is copied twice and the shared theme comes along once.

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/all.json
```

all is the whole library. The smaller ones are components, charts, blocks and dashboards (the five dashboards with the components, charts and demo data they need). Expect a lot of files: all copies several hundred, so prefer a family or single items when you only need part of the library. To use short names, add the registry to your components.json once:

```
"registries": {
  "@sheenui": "https://lokendra-builds.github.io/sheenui/r/{name}.json"
}
```

```bash
npx shadcn@latest add @sheenui/all
```

The namespace form was tested with shadcn CLI 4.23; the URL form above is the one that needs no setup. The same short form works for single items, for example @sheenui/button.


## Starter template

Want a whole app instead of single components? Glass Admin is a small admin dashboard starter with a glass app shell, an overview with charts, a customers table, a settings page and a sign-in page. It comes for Vite (React Router) and for Next.js (App Router). Copy one with degit, then install and start it:

```bash
npx degit lokendra-builds/sheenui/templates/glass-admin-vite my-app
```

For Next.js use templates/glass-admin-next in the same command. Both are on GitHub in the [templates folder](https://github.com/lokendra-builds/sheenui/tree/main/templates). Its analytics page is one of the [dashboard templates](https://lokendra-builds.github.io/sheenui/dashboards/).


## Add the two CSS imports

Import Tailwind first and the SheenUI styles after it in your global stylesheet. The CLI adds the second line for you; check the order and the path:

```css
@import "tailwindcss";
@import "@/components/sheenui/styles/index.css";
```

That is the line the CLI adds, and Vite resolves the @/ alias inside CSS. Next.js cannot, so there write the relative path from your global stylesheet, for example ../components/sheenui/styles/index.css in app/globals.css. Then put sheenPreferenceScript in the document head to avoid a flash of the wrong theme (see [dark mode](https://lokendra-builds.github.io/sheenui/docs/dark-mode)). The [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) explains what the stylesheet defines.

In Next.js, a chart or dashboard example that passes a function (a format formatter, seriesLegend, a dashboard's load) must live in a file that starts with "use client"; a Server Component cannot pass functions to client components.


## Copy the files by hand

Prefer no CLI? Every docs page has a Files to copy box computed from the real import graph: the folders to copy from theme/src and the npm packages to add, usually @base-ui/react, motion, clsx and tailwind-merge. Copy the shared styles, lib, motion and hooks folders once, then the component folders you need, all under components/sheenui/ (the folder the CLI uses, so the stylesheet import above is the same), and import the styles after Tailwind. Components that need the browser already start with "use client", so they also work in the Next.js App Router.


## Set up the providers and the backdrop

Glass needs something colorful behind it, and Motion needs one shared configuration. Mount them once at the root of your app: SheenMotionProvider follows the reduced-motion setting, SheenBackdrop is the live wallpaper of the active style (or give <body> the static sheen-backdrop class), and ToastProvider with Toaster are only needed if you use toasts.

```tsx
import { SheenMotionProvider } from "@/components/sheenui/motion/provider";
import { SheenBackdrop } from "@/components/sheenui/backdrop/backdrop";
import { ToastProvider } from "@/components/sheenui/toast/toast";
import { Toaster } from "@/components/sheenui/toast/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SheenMotionProvider>
      <ToastProvider>
        <SheenBackdrop />
        {children}
        <Toaster />
      </ToastProvider>
    </SheenMotionProvider>
  );
}
```

In Next.js put this in a client component and render it inside <body>. The README's Project setup section also shows how to inline sheenPreferenceScript before first paint.


## Import paths: copied files or the package

A copied install (the shadcn CLI or a hand copy) has no barrel: every component is its own file under components/sheenui/, so you import it from that file, for example import { Button } from "@/components/sheenui/button/button". @/components is the alias from your components.json.

The @sheenui/theme package (one barrel, import { Button } from "@sheenui/theme") is the single import form for a project that consumes the theme as a package. Copying files is the route this site documents, so the Code tab of every example shows the Copied files imports by default. The Import path switch above each code sample changes it to Package, and the choice is remembered. Helpers from @sheenui/theme/demo-data map to their own files too, for example @/components/sheenui/blocks/analytics/demo-web, which a dashboard page lists as an optional extra registry item.


## Common install problems

- Components render unstyled: the SheenUI import is missing or comes before @import "tailwindcss" (the order is explained in the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4)).
- Next.js reports it cannot resolve @/components/sheenui/styles/index.css: change the import to the relative path.
- The theme flashes or html shows a hydration warning: inline sheenPreferenceScript in the head and add suppressHydrationWarning to html.

Framework steps, tested versions and the rest of the troubleshooting table are in the [guide to installing SheenUI in Next.js and Vite](https://lokendra-builds.github.io/sheenui/guides/install-frameworks). The components sit on Base UI: see [Base UI components styled with glass](https://lokendra-builds.github.io/sheenui/docs/base-ui), and browse [all glass UI components](https://lokendra-builds.github.io/sheenui/components/) when you are set up. To see who maintains the project and what is tested, read the [About SheenUI](https://lokendra-builds.github.io/sheenui/about) page.


## Frequently asked questions

### Which versions do I need?

React 19.2 or newer and Tailwind CSS v4. The components also use Base UI, Motion, clsx and tailwind-merge; the shadcn CLI installs the ones a component needs.

### Do I need a tailwind.config.js?

No. Tailwind v4 is configured in CSS. Import tailwindcss first and the SheenUI styles after it, and add an @source line only if Tailwind does not scan the folder that holds your copied components.

### Does it work with Next.js and Vite?

Yes. Next.js App Router and Vite with React Router or TanStack Router were tested end to end. The installation guide lists the tested versions and the one CSS path to change in Next.js.

### Can I copy files instead of using the CLI?

Yes. Every docs page has a Files to copy box with the exact folders and npm packages for that component, so you take only what you use.


## Related pages

- [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4)
- [Foundations](https://lokendra-builds.github.io/sheenui/foundations)
- [Button](https://lokendra-builds.github.io/sheenui/components/button)
- [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card)
- [Forms recipe](https://lokendra-builds.github.io/sheenui/docs/forms)
- [Dark mode](https://lokendra-builds.github.io/sheenui/docs/dark-mode)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
