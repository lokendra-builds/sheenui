# Glass Admin (Next.js)

A free admin dashboard starter built with [SheenUI](https://lokendra-builds.github.io/sheenui/): glass surfaces on Base UI and Tailwind CSS v4, animated with Motion. Next.js (App Router), React 19, TypeScript.

It is a small, real app, not a component dump: an app shell (collapsible glass sidebar that becomes an off-canvas menu on phones, header with a style switch and a theme switch, a Ctrl/Cmd+K command palette) and five pages.

| Page | Route | Built from |
|---|---|---|
| Overview | `/overview` | KPI cards (`dashboard-stats`) and four charts: revenue, sign-ups, plan mix, traffic |
| Customers | `/customers` | `data-table`: search, sort, filters, pagination, CSV export, row menu, card layout on phones |
| Analytics | `/analytics` | SheenUI's own SaaS revenue dashboard (`analytics-saas`): MRR, churn, cohorts, plan movement |
| Settings | `/settings` | `settings-page`: profile, notifications, appearance, save bar |
| Sign in | `/sign-in` | `glass-login` (no backend: any valid email and a password of 8+ characters opens the app) |

All data is made up (addresses on `example.com`, invented companies) and lives in `src/data/`.

## Quick start

```bash
npx degit lokendra-builds/sheenui/templates/glass-admin-next my-app
cd my-app
pnpm install && pnpm dev
```

`npm install && npm run dev` and `yarn` work the same. Node 20.19 or newer. There is no lockfile on purpose, so your package manager creates its own.

```bash
pnpm build      # production build (also type-checks)
pnpm start      # serve the build
```


## Liquid Glass or Aurora Neon, light or dark

SheenUI has two style presets, each in a light and a dark theme.

- **In the app:** the header has a style switch (Liquid Glass / Aurora Neon) and a theme switch (light / dark / system), and the command palette has the same choices. The choice is saved in `localStorage` and restored before the first paint.
- **In code:** `<html data-sheen-style="liquid">` or `"aurora"` sets the default style (see `src/app/layout.tsx` (its inline `sheenPreferenceScript` restores the saved choice before paint)); `data-theme="light"` or `"dark"` forces a theme. The hooks `useSheenStyle()` and `useTheme()` change them at runtime; see `src/shell/theme-controls.tsx`.
- Reduced motion and reduced transparency are respected automatically (OS settings, plus the toggles on the Settings page). The charts and the backdrop pause off-screen, so nothing here adds its own animation.

## Where the SheenUI code lives

The library is copy-the-source and not on npm. Every component was added with the shadcn CLI from the live registry, and the files sit in your project, so you own them:

```
src/components/sheenui/
  styles/      tokens, glass, both style presets (imported by `src/app/globals.css`)
  motion/      springs, durations, the motion provider
  hooks/       useTheme, useSheenStyle, ...
  sidebar/ command/ data-table/ charts/ blocks/ ...   one folder per component
```

Add more (the registry has 86 components, 48 charts, 20 blocks and 5 dashboards):

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/dialog.json
```

`components.json` is already set up for that. Browse everything at <https://lokendra-builds.github.io/sheenui/>. Next.js cannot resolve the `@/` alias inside CSS, so `src/app/globals.css` imports the styles by relative path (`../components/sheenui/styles/index.css`). If `shadcn add` appends an `@/` import there, change it to the relative path.

## Project layout

```
src/app/layout.tsx           providers, preference script, global CSS
src/app/(app)/layout.tsx     the app shell around the four pages
src/app/(app)/*/page.tsx     overview, customers, analytics, settings
src/app/sign-in/page.tsx     sign-in
src/shell/                   app shell, nav, icons, style and theme switches
src/views/                   the page bodies (client components)
src/data/                    demo customers and chart data
src/lib/router.tsx           router adapter (next/link, next/navigation)
src/components/sheenui/      the copied SheenUI source
```

The router adapter in `src/lib/router.tsx` is the only file that knows which router runs; the shell and the pages are the same in both SheenUI admin starters.

## Make it yours

- Replace the loaders and the files in `src/data/` with your API. `SaasRevenueDashboard` takes a `load` function that returns a `SaasRevenueData`; `DataTable` takes plain rows.
- `onSave` in `src/views/settings.tsx` and `onSubmit` in `src/views/sign-in.tsx` are the places to call your backend. Sign-in here has no auth.
- Rename the product in `src/shell/nav.ts`.

## License

MIT, see [LICENSE](LICENSE). SheenUI is MIT too.
