---
title: "Install SheenUI Glass UI in Next.js and Vite | SheenUI"
description: "Tested install steps for SheenUI in Next.js App Router and Vite (React Router or TanStack Router): the shadcn CLI, the packed package, or copying files."
slug: "install-frameworks"
route: "/guides/install-frameworks"
targetKeyword: "sheenui install nextjs"
secondaryKeywords: ["shadcn registry react glass components", "install glassmorphism components next.js", "tailwind css v4 next.js components"]
published: "2026-11-08"
updated: "2026-11-16"
relatedRoutes: ["/components/button", "/components/dialog", "/components/tabs", "/components/data-table", "/foundations"]
---

# Install SheenUI Glass Components in Next.js and Vite

Every step below was first run end to end on 8 Nov 2026 in throwaway apps; on 12 Nov 2026 the versions in the table were re-checked against the packages installed in this repository (Vite 8.3.8, React 19.3.1, Tailwind 4.3.5). A real browser exercised ten components (button, dialog, menu, tabs, toast, data table, line chart, chat widget, backdrop, theme switcher) and reported no console errors or hydration warnings, and every interaction worked.

| Setup | Versions tested | Result |
|---|---|---|
| Next.js App Router, package | Next 16.4.5, React 19.3.1, Tailwind 4.3.5 | `next build` passes with Turbopack and with `--webpack`; dev and production; 0 hydration warnings |
| Next.js App Router, shadcn CLI | Next 16.4.4 (made by `shadcn init`) | passes after one manual CSS-path fix (see Next.js, option B) |
| Vite + React Router | Vite 8.3.8, React Router 8.5.1 | build, preview and dev pass |
| Vite + TanStack Router | Vite 8.3.8, TanStack Router 1.170.46 | build and preview pass |

For the short version (one CLI command and two CSS lines) see the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation); this guide has the framework detail and the tested versions.

SheenUI needs React 19.2 or newer (the components use `useEffectEvent`) and Tailwind CSS v4 (the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) explains how the tokens and layers fit). Two ways to get the code:

- **Package** (`@sheenui/theme`): compiled ES modules plus the stylesheet. `clsx`, `tailwind-merge` and `@tanstack/react-table` install with it; `react`, `react-dom`, `tailwindcss`, `@base-ui/react` and `motion` are peer dependencies that your app adds (see below; the [Base UI docs page](https://lokendra-builds.github.io/sheenui/docs/base-ui) explains what Base UI contributes).
- **Copy the files**: the shadcn CLI or a manual copy puts the source into your project, like shadcn/ui.

Many code samples on the docs pages use icons from `lucide-react`. The components do not need it, but a pasted sample does: `pnpm add lucide-react`.

Basis: the end-to-end runs and the version re-check this guide reports in its opening (8 Nov 2026 and 12 Nov 2026), and the files the registry installs. First published 8 Nov 2026, last revised 16 Nov 2026; the later date marks an edit of the text, and the table lists the versions that were actually tested.

## 0. Get the package (until it is on npm)

`@sheenui/theme` is marked `private` in the repo, so it is not on npm yet. Pack it from a clone, then install the tarball:

```bash
git clone https://github.com/lokendra-builds/sheenui && cd sheenui
pnpm install
pnpm --filter @sheenui/theme pack --pack-destination ..   # builds dist/, writes ../sheenui-theme-0.1.0.tgz (my-app sits next to the clone)
cd ../my-app && pnpm add ../sheenui-theme-0.1.0.tgz motion @base-ui/react
```

Once it is published, this becomes `pnpm add @sheenui/theme`. Publish with `pnpm publish` (not `npm publish`): the repo keeps `exports` pointing at `src/` for development and relies on pnpm's `publishConfig.exports` to point at `dist/` in the tarball.

## 1. Next.js (App Router)

### Option A: the package

```bash
pnpm create next-app@latest my-app --ts --tailwind --app --src-dir --import-alias "@/*"
cd my-app
pnpm add ../sheenui-theme-0.1.0.tgz motion @base-ui/react
```

`src/app/globals.css`: Tailwind first, then SheenUI. No `@source` line is needed, the stylesheet already scans the package.

```css
@import "tailwindcss";
@import "@sheenui/theme/styles.css";
```

`src/app/layout.tsx` (a Server Component; no `"use client"` needed):

```tsx
import type { ReactNode } from "react";
import { SheenBackdrop, SheenMotionProvider, ToastProvider, Toaster, sheenPreferenceScript } from "@sheenui/theme";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-sheen-style="liquid" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: sheenPreferenceScript }} />
      </head>
      <body>
        <SheenMotionProvider>
          <ToastProvider>
            <SheenBackdrop />
            {children}
            <Toaster />
          </ToastProvider>
        </SheenMotionProvider>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` and the inline script are what keep a saved theme or style from flashing or mismatching: the script sets `data-theme`, `data-sheen-style` and friends on `<html>` before React hydrates.

Pages can be Server Components that compose SheenUI components directly. Only code that uses a hook or an event handler of your own needs `"use client"`:

```tsx
// src/app/page.tsx (Server Component)
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";
import { ThemeSwitcher, ToastButton } from "./islands";

export default function Page() {
  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-6">
      <ToastButton />
      <ThemeSwitcher />
      <Dialog>
        <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hello</DialogTitle>
            <DialogDescription>Composed in a Server Component.</DialogDescription>
          </DialogHeader>
          <DialogClose render={<Button variant="ghost" />}>Close</DialogClose>
        </DialogContent>
      </Dialog>
      <Tabs defaultValue="a">
        <TabsList><TabsTab value="a">One</TabsTab><TabsTab value="b">Two</TabsTab></TabsList>
        <TabsPanel value="a">Panel one</TabsPanel>
        <TabsPanel value="b">Panel two</TabsPanel>
      </Tabs>
    </main>
  );
}
```

```tsx
// src/app/islands.tsx (hooks live in a Client Component)
"use client";
import { Button, SegmentedControl, useTheme, useToast, type ThemeChoice } from "@sheenui/theme";

export function ToastButton() {
  const toast = useToast();
  return <Button onClick={() => toast.success("Saved", "Your changes are live.")}>Show toast</Button>;
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <SegmentedControl
      aria-label="Theme"
      value={theme}
      onValueChange={(v) => setTheme(v as ThemeChoice)}
      items={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]}
    />
  );
}
```

Notes, all verified:

- Next 16's `create-next-app` sets up Tailwind v4 for Turbopack (`@tailwindcss/turbopack` rule in `next.config.ts`). To build with `next build --webpack`, add the PostCSS plugin instead: `pnpm add -D @tailwindcss/postcss` and a `postcss.config.mjs` with `export default { plugins: { "@tailwindcss/postcss": {} } };`. The CSS lines above stay the same.
- No `transpilePackages` and no `next.config` change: the package ships compiled JavaScript, and every component module starts with `"use client"`. Importing from the `@sheenui/theme` barrel in a Server Component is safe; client modules become client references and nothing client-only runs on the server.
- Values that are not components are only usable on the server when they live in a plain module. Safe in Server Components: `cn`, the motion tokens (`duration`, `ease`, `spring`, `fadeUp`, ...), `defaultChatLabels`, `defaultDataTableLabels`, `toCsv`, `tokenize`, `formatBytes`, `parseColor`, date helpers such as `toISODate`. Helpers and `default…Labels` objects that sit next to a component (`formatCompact`, `formatCurrency`, `getPageItems`, `defaultLineChartLabels`, ...) and every hook belong to a client module: call them in a Client Component. In a Server Component, calling one throws `Attempted to call formatCompact() from the server but formatCompact is on the client`, and spreading a label object gives `{}`.
- `ChatWidget`, `DataTable` and the charts take plain props, so a Server Component can pass them arrays and a `Date` (pass a fixed `now` and `locale` to the chat so server and client text match).
- In `next dev`, Motion logs `You have Reduced Motion enabled on your device` when the OS or the in-app switch asks for reduced motion. It is an informational notice from the Motion library, not an error.
- Smaller CSS: `@sheenui/theme/styles.css` makes Tailwind generate the utilities of every component (about 390 KB, 66 KB gzip). To pay only for the components you use, import the base and scan just those folders (about 110 KB, 30 KB gzip with Button):

  ```css
  @import "tailwindcss";
  @import "@sheenui/theme/styles/base.css";
  @source "../../node_modules/@sheenui/theme/dist/components/button";
  ```

### Option B: copy the files with the shadcn CLI

```bash
pnpm create next-app@latest my-app --ts --tailwind --app --src-dir --import-alias "@/*"
cd my-app
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json \
  https://lokendra-builds.github.io/sheenui/r/glass-card.json https://lokendra-builds.github.io/sheenui/r/dialog.json \
  https://lokendra-builds.github.io/sheenui/r/input.json https://lokendra-builds.github.io/sheenui/r/backdrop.json \
  https://lokendra-builds.github.io/sheenui/r/line-chart.json https://lokendra-builds.github.io/sheenui/r/analytics-demo-saas.json
```

Each item installs into `components/sheenui/<item>/` and pulls in `sheenui-theme` (tokens, glass, motion, hooks, styles) and the npm packages it needs. `input` is listed because the Dialog example uses it, and `analytics-demo-saas` is the SaaS dashboard together with its sample data (the plain `analytics-saas` item is the dashboard alone). Then:

1. The CLI appends `@import "@/components/sheenui/styles/index.css";` to your global CSS. **Next.js cannot resolve the `@/` alias inside CSS** (`next build` fails with `Can't resolve '@/components/sheenui/styles/index.css'`). Change it to the relative path:

   ```css
   @import "tailwindcss";
   @import "../components/sheenui/styles/index.css";
   ```

   This is the same text in `src/app/globals.css` and in `app/globals.css` (an app made without `--src-dir`): `components/` sits next to `app/` in both layouts. Vite resolves the alias, so keep the `@/` form there.
2. Import from the installed paths and mount the motion provider and the backdrop once. Use the `RootLayout` from option A (`src/app/layout.tsx`, or `app/layout.tsx` without `--src-dir`) and replace only its package import with these three copied-files imports (`SheenMotionProvider` from `@/components/sheenui/motion/provider`, `SheenBackdrop` from `@/components/sheenui/backdrop/backdrop`, `sheenPreferenceScript` from `@/components/sheenui/hooks/use-preferences`), written as `import { SheenMotionProvider } from "@/components/sheenui/motion/provider";` and so on. Add `toast.json` and wrap the children in `ToastProvider` and `Toaster` (`@/components/sheenui/toast/toast`, `.../toast/toaster`) only if you use toasts.
3. Components that only take plain props can sit in a Server Component. Anything that takes a function (a chart's `format`, `legend={seriesLegend(...)}`, a dashboard's `load`) must live in a file that starts with `"use client"`; see "Function props" below. This page is a Server Component (`src/app/page.tsx`):

   ```tsx
   import { Button } from "@/components/sheenui/button/button";
   import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
   import {
     Dialog,
     DialogClose,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
   } from "@/components/sheenui/dialog/dialog";
   import { Input } from "@/components/sheenui/input/input";
   import { Revenue, SaasDashboard } from "./sheen-islands";

   export default function Page() {
     return (
       <main className="mx-auto grid max-w-5xl gap-6 p-6">
         <GlassCard className="p-6">
           <Button>Hello</Button>
         </GlassCard>
         <Dialog>
           <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Edit profile</DialogTitle>
               <DialogDescription>Change your name.</DialogDescription>
             </DialogHeader>
             <Input label="Name" defaultValue="Ada Lovelace" />
             <DialogClose render={<Button variant="ghost" />}>Close</DialogClose>
           </DialogContent>
         </Dialog>
         <Revenue />
         <SaasDashboard />
       </main>
     );
   }
   ```

To install a whole family instead of single items, use a bundle. A bundle has no files of its own, it only lists existing items, so nothing is copied twice:

```bash
pnpm dlx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/all.json          # the whole library (several hundred files)
pnpm dlx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/dashboards.json   # the 5 dashboards with what they need
```

The other bundles are `components`, `charts` and `blocks`. With the namespace entry below in `components.json`, the same installs read `pnpm dlx shadcn@latest add @sheenui/all` (also `@sheenui/button` and so on); the CLI replaces `{name}` with the item name. This was run with shadcn CLI 4.23.

```json
"registries": { "@sheenui": "https://lokendra-builds.github.io/sheenui/r/{name}.json" }
```

The site serves the registry at `https://lokendra-builds.github.io/sheenui/r/<name>.json`. To test the steps without the network, or against changes you have not published, serve a local copy (this is how the steps above were tested):

```bash
node scripts/build-registry.mjs --base http://127.0.0.1:4410/r --out /tmp/sheenui-registry/r --no-root --quiet
cd /tmp/sheenui-registry && python3 -m http.server 4410 --bind 127.0.0.1
pnpm dlx shadcn@latest add http://127.0.0.1:4410/r/button.json
```

#### Function props: charts and dashboards in Next.js

Every chart and dashboard module already starts with `"use client"`, so you can render them from a Server Component. What cannot cross the server/client boundary is a function: a chart's `format`, the `seriesLegend(...)` and `formatCompact(...)` helpers (they live in client modules, so calling one on the server throws `Attempted to call seriesLegend() from the server but seriesLegend is on the client`), and a dashboard's `load` and `liveStep`. The docs samples for charts and dashboards pass functions, so paste them into a file that starts with `"use client"` and import that file from your page. They work there exactly as written; only the import lines change to the copied paths. For example `src/app/sheen-islands.tsx`:

```tsx
// src/app/sheen-islands.tsx
"use client";
import { LineChart } from "@/components/sheenui/charts/line-chart";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { formatCompact, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { SaasRevenueDashboard } from "@/components/sheenui/blocks/analytics-saas";
import { saasRevenueDemoLoader, saasLiveStep } from "@/components/sheenui/blocks/analytics/demo-saas";

const usd = (n: number) => "$" + formatCompact(n);

const data = [
  { month: "Jan", organic: 4200, paid: 2100 },
  { month: "Feb", organic: 4800, paid: 2300 },
  { month: "Mar", organic: 5600, paid: 2200 },
];

const series: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
];

export function Revenue() {
  return (
    <ChartCard
      title="Monthly revenue by channel"
      legend={seriesLegend(series, "line")}
      table={<ChartTable data={data} index="month" series={series} format={usd} />}
    >
      <LineChart data={data} index="month" series={series} format={usd} aria-label="Monthly revenue by channel" />
    </ChartCard>
  );
}

export function SaasDashboard() {
  return <SaasRevenueDashboard load={saasRevenueDemoLoader} liveStep={saasLiveStep} product="Acme Cloud" />;
}
```

## 2. Vite + React Router or TanStack Router (SPA, no SSR)

Start from any Vite React TypeScript app (`pnpm create vite@latest my-app --template react-ts`), then:

```bash
pnpm add ../sheenui-theme-0.1.0.tgz motion @base-ui/react react-router        # or @tanstack/react-router
pnpm add -D tailwindcss @tailwindcss/vite
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [react(), tailwindcss()] });
```

`src/index.css`:

```css
@import "tailwindcss";
@import "@sheenui/theme/styles.css";
```

`index.html`: inline the preference script in `<head>` (it is the text of `sheenPreferenceScript`) and set the default style on `<html>`:

```html
<html lang="en" data-sheen-style="liquid">
  <head>
    <script>
      (function(){try{var r=document.documentElement;["theme","motion","transparency","glass"].forEach(function(k){var v=localStorage.getItem("sheen:"+k);if(v)r.setAttribute("data-"+k,v);});var s=localStorage.getItem("sheen:style");r.setAttribute("data-sheen-style",s==="aurora"||s==="liquid"?s:"liquid");}catch(e){document.documentElement.setAttribute("data-sheen-style","liquid");}})();
    </script>
  </head>
```

`src/main.tsx` with React Router: the providers wrap the router, so the backdrop and toasts survive navigation. `Home` is any page component of yours; this one is enough to try it:

```tsx
// src/home.tsx
import { Button } from "@sheenui/theme";

export function Home() {
  return <Button>Hello</Button>;
}
```

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { SheenBackdrop, SheenMotionProvider, ToastProvider, Toaster } from "@sheenui/theme";
import "./index.css";
import { Home } from "./home";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SheenMotionProvider>
      <ToastProvider>
        <SheenBackdrop />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ToastProvider>
    </SheenMotionProvider>
  </StrictMode>,
);
```

With TanStack Router the shape is the same: replace `<BrowserRouter>…</BrowserRouter>` with `<RouterProvider router={router} />` (code-based routes via `createRootRoute`, `createRoute`, `createRouter`).

Verified: `tsc --noEmit` with `skipLibCheck: false`, `vite build`, `vite preview` and `vite dev` all pass; navigating away and back remounts every component without errors.

### Option B: copy the files with the shadcn CLI

The add command only copies files. The alias, the CSS import, the `SheenMotionProvider` and backdrop, and the preference script are still your steps below before a dashboard looks styled. In Vite the preference script goes into `index.html` as an inline `<script>` in `<head>` (its text is `sheenPreferenceScript`), because a component cannot be imported there. If the CLI fails with a 503 from `github.io`, run the command again.

`pnpm dlx shadcn@latest init` stops on a fresh Vite app with `Could not find valid path aliases` until the `@/*` alias exists in three files. Add it first, then run `init`. Start from the same app as above and add Tailwind:

```bash
pnpm create vite@latest my-app --template react-ts
cd my-app
pnpm install
pnpm add tailwindcss @tailwindcss/vite
```

1. `src/index.css`: replace the whole file with the Tailwind import (the CLI adds the SheenUI import after it):

   ```css
   @import "tailwindcss";
   ```

2. `tsconfig.json` and `tsconfig.app.json`: add the same `paths` entry to the `compilerOptions` of both files. `tsconfig.json` has no `compilerOptions` yet, so add the object; in `tsconfig.app.json` add one line to the existing one. The CLI reads the first file and TypeScript uses the second.

   ```json
   {
     "files": [],
     "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
     "compilerOptions": {
       "paths": { "@/*": ["./src/*"] }
     }
   }
   ```

   ```json
   {
     "compilerOptions": {
       "paths": { "@/*": ["./src/*"] }
     }
   }
   ```

   The second block shows only the line to add to `tsconfig.app.json`; keep its other options. Do not add `baseUrl`: TypeScript 7 (what `create-vite` installs today) rejects it, and TypeScript 6 deprecates it. `paths` alone has worked since TypeScript 4.1 and resolves relative to the tsconfig file, so this exact form is the same on TypeScript 5, 6 and 7 (checked with 5.9.3, 6.0.3 and 7.0.2). On TypeScript 5 the build also needs `"DOM.Iterable"` in the `lib` array of `tsconfig.app.json` (`"lib": ["ES2023", "DOM", "DOM.Iterable"]`), because the copied files loop over a `NodeList`; 6 and 7 do not need it.

3. `vite.config.ts`: the same alias for the bundler (no `@types/node` needed):

   ```ts
   import { fileURLToPath } from "node:url";
   import react from "@vitejs/plugin-react";
   import tailwindcss from "@tailwindcss/vite";
   import { defineConfig } from "vite";

   export default defineConfig({
     plugins: [react(), tailwindcss()],
     resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
   });
   ```

Now the CLI works: run the same `shadcn init -d` and `shadcn add` commands as in the Next.js option B above (the list of items is the same).

`init` creates `components.json` and `src/lib/utils.ts`; `add` copies the items into `src/components/sheenui/` and appends `@import "@/components/sheenui/styles/index.css";` to `src/index.css`. Vite resolves the `@/` alias inside CSS, so keep that line as it is (only Next.js needs the relative path). Use `input` for the Dialog example and `analytics-demo-saas` for the SaaS dashboard with its sample data. Wrap the app once in the motion provider and the backdrop (`src/providers.tsx`):

```tsx
// src/providers.tsx
import type { ReactNode } from "react";
import { SheenMotionProvider } from "@/components/sheenui/motion/provider";
import { SheenBackdrop } from "@/components/sheenui/backdrop/backdrop";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SheenMotionProvider>
      <SheenBackdrop />
      {children}
    </SheenMotionProvider>
  );
}
```

In `src/main.tsx` add `import { Providers } from "./providers";` and render `<Providers><App /></Providers>` instead of `<App />`. Then `src/App.tsx` can use every item. A Vite app has no server, so the function props of charts and dashboards need no `"use client"` here: copy `sheen-islands.tsx` from the Next.js section into `src/` without its `"use client"` line and import `Revenue` and `SaasDashboard` from it. The `GlassCard` and the `Dialog` are the ones from the Next.js page in step 3 (same imports, same markup):

```tsx
// src/App.tsx
import { Revenue, SaasDashboard } from "./sheen-islands";

export default function App() {
  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-6">
      {/* the GlassCard and the Dialog of the Next.js page go here */}
      <Revenue />
      <SaasDashboard />
    </main>
  );
}
```

## 3. Copy the files by hand

Use this when you want the source in your repo without the CLI (any bundler, any framework):

```bash
git clone https://github.com/lokendra-builds/sheenui
mkdir -p my-app/src/components/sheenui/components
cp -R sheenui/theme/src/{styles,lib,motion,hooks} my-app/src/components/sheenui/
cp -R sheenui/theme/src/components/{button,dialog,tabs} my-app/src/components/sheenui/components/
cd my-app && pnpm add @base-ui/react motion clsx tailwind-merge
```

Every docs page has a "Files to copy" box with the exact folders and npm packages for that component, computed from the real import graph (`pnpm copy-test` builds each one in an empty Vite app). Then in your global CSS, after Tailwind:

```css
@import "tailwindcss";
@import "@/components/sheenui/styles/index.css";
```

This is the same stylesheet path the shadcn CLI writes (option B; in Next.js use the relative path there too). Files inside your project are scanned by Tailwind automatically; add an `@source` line pointing at `components/sheenui`, relative to the CSS file, only if your setup excludes them (for example a git-ignored folder). A hand copy keeps the folder layout of `theme/src`, so a component is one level deeper than after `shadcn add`: `import { Button } from "@/components/sheenui/components/button/button"`. Each file already carries `"use client"` where it needs it, so the copy also works in the Next.js App Router.

## Package hygiene (what `pnpm pack` ships)

Checked against the tarball of `@sheenui/theme`:

- `exports`: `.` (barrel, ESM + `.d.ts`), `./components/*`, `./blocks/*`, `./motion/*`, `./hooks/*` (one file per module, for importing a single component), `./styles.css`, `./styles/*`, `./package.json`.
- `sideEffects: ["**/*.css"]`: bundlers drop every unused module and keep CSS imports. A bundle that imports only `Button` contains no charts, chat or Motion engine: 276 KB (88 KB gzip) in total against 220 KB (69 KB gzip) for a bare `react-dom` app, so Button adds about 57 KB (19 KB gzip) of JavaScript, including Base UI, `clsx` and `tailwind-merge` (measured on 16 Nov 2026 with Vite 8.3.8 and React 19.3.1). Importing `@sheenui/theme/components/button/button` directly gives the same size. The stylesheet is separate and carries every token and both style presets: 473 KB, 76 KB gzip.
- Types resolve with `moduleResolution` `bundler`, `node16` and `nodenext` (`skipLibCheck: false`), and Node can `import("@sheenui/theme")` directly.
- Peer dependencies: `react`, `react-dom` (19.2 or newer), `tailwindcss` (4.1 or newer), `@base-ui/react` (1.9 or newer), `motion` (14.10 or newer), optional `@types/react`. Two copies of Motion would break `MotionConfig`, so the app owns the one copy.
- The tarball holds `dist/`, `LICENSE`, `README.md` and `package.json` only: no tests, source maps, local paths or secrets.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Components render unstyled | The CSS import is missing or comes before `@import "tailwindcss"`. Both lines are in the steps above, in that order. |
| `Can't resolve '@/components/sheenui/styles/index.css'` in Next.js | Use the relative path (Next.js, option B, step 1). |
| `Could not find valid path aliases` from `shadcn init` in Vite | Add the `@/*` alias to `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts` before `init` (Vite, option B). |
| `Attempted to call seriesLegend() from the server` (or `formatCompact`, a `format` function, a dashboard `load`) in Next.js | Move that code into a file that starts with `"use client"` (Next.js, function props). |
| Utilities missing under `next build --webpack` | Add `@tailwindcss/postcss` and `postcss.config.mjs` (Next.js, option A notes). |
| `Attempted to call X() from the server but X is on the client` | `X` is a helper or hook inside a client module. Call it from a Client Component, or use the server-safe list above. |
| Theme or style flashes, or a hydration warning on `<html>` | Inline `sheenPreferenceScript` in `<head>` and keep `suppressHydrationWarning` on `<html>`. |
| TypeScript 6+: `Cannot find module or type declarations for side-effect import of '@sheenui/theme/styles.css'` | Only without `vite/client` or Next's types. The package ships a `types` entry for that import (resolves under `bundler`, `node16` and `nodenext`); if you still see it, reinstall from a tarball packed after 8 Nov 2026, or add `declare module "*.css";`. |

## Frequently asked questions

### Is SheenUI on npm?

Not yet. `@sheenui/theme` is marked `private` in the repository, so you either pack it from a clone and install the tarball, or let the shadcn CLI or a manual copy put the source into your project. Once it is published, the install becomes `pnpm add @sheenui/theme`.

### Which versions of React and Tailwind CSS does it need?

React 19.2 or newer (the components use `useEffectEvent`) and Tailwind CSS 4.1 or newer. The other peer dependencies are `@base-ui/react` 1.9 or newer and `motion` 14.10 or newer, and your app owns the single copy of Motion.

### Does it work with the Next.js App Router and server components?

Yes. It was built and run on Next 16 with Turbopack and with `--webpack`, in dev and production, with no hydration warnings. Every component module starts with `"use client"`, so a Server Component can import and render them (they become client references). Helpers and hooks that live in those modules must be called from a Client Component.

### Why does the theme flash or React warn about hydration on the html element?

The saved theme and style are applied by a script that has to run before first paint. Inline `sheenPreferenceScript` in `<head>` and keep `suppressHydrationWarning` on `<html>`.

### How much JavaScript does one component add?

Importing only `Button` adds about 57 KB (19 KB gzip) over a bare `react-dom` app, including Base UI, `clsx` and `tailwind-merge`. Unused components, charts and the Motion engine are dropped because the package declares `sideEffects: ["**/*.css"]`.
