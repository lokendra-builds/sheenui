# SheenUI demo and docs site

The documentation site at https://lokendra-builds.github.io/sheenui: a Vite + React 19 app that renders every SheenUI component, chart, block and dashboard with live examples, code, props tables, keyboard and accessibility notes, and a "Files to copy" box with the matching shadcn registry command. It is built from the theme in [`../theme`](../theme) and the Markdown guides in [`../docs/guides`](../docs/guides).

```bash
pnpm --filter demo dev --port 5180      # http://localhost:5180/sheenui/ (the base path matters)
pnpm --filter demo build                # props tables, registry, client and SSR bundles, then a static HTML file per route
python3 -m venv .venv && .venv/bin/pip install -r demo/scripts/requirements-screenshots.txt  # once (needs Chrome); with the dev server up: .venv/bin/python demo/scripts/screenshots.py (stills) and hero-capture.py (animation)
```

Every script in `package.json`:

| Script | Purpose |
| --- | --- |
| `dev` | Vite dev server |
| `build` | Generate props, build the registry, build the client and SSR bundles, prerender every route |
| `preview` | Serve the finished build with Vite |
| `typecheck` | `tsc --noEmit` for the app and for the Playwright specs |
| `docs:props` | Regenerate `src/generated/props/` (one props table module per component) from the theme source; `--check` fails when stale |
| `docs:check` | Check the built pages: props tables, defaults, links, search and `llms.txt` |
| `og:build` | Redraw `public/og/<slug>.webp` (1200x630 per page) from a finished build; commit the result |
| `seo:check` | Head, canonical, JSON-LD, sitemap and links of the built pages |
| `seo:smoke` | Load the built pages in a browser and check they render |
| `seo:console` | Fail on console errors and warnings across the built pages |
| `seo:hosting` | Check the hosting setup (base path, 404 page, static files) |
| `seo:lighthouse` | Lighthouse scores for sample pages |
| `seo:verify` | Build, then run `seo:check`, `seo:smoke` and `seo:lighthouse` |
| `e2e`, `e2e:chromium` | Playwright specs for all engines, or Chromium only |
| `e2e:sweep` | The per-page sweep spec (Chromium) |
| `e2e:visual` | Visual snapshot spec |
| `budget` | Both JavaScript budgets per route: `budget:initial` then `budget:measure` |
| `budget:initial` | Initial JavaScript per route (before hydration) against its page-class budget |
| `budget:measure` | JavaScript each route really fetches in Chromium by load plus 5 s idle, against its page-class budget |
| `bundle:stats` | Size of each chunk of the build |
| `perf` | Runtime performance measurements |

Helpers the scripts above call (run directly with `node scripts/<name>.mjs`): `budget-route.mjs` (budget of one route), `serve-dist.mjs` (static server for `dist/`), `make-guide-images.mjs` (images of the Markdown guides).

How it is put together:

| Path                                                                         | What                                                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes.ts`, `src/routes/`                                               | Every route: path, title, group and the lazily loaded page module (one table per group)                                                                                    |
| `src/pages/`                                                                 | One docs page per route; `Page` (`src/layout/Page.tsx`) is the template                                                                                 |
| `src/layout/ShowcaseStage.tsx`, `ShowcaseStage.<page>.ts` | The showcase stage at the top of a component page: one live component, a state-coloured aura and light, and a story (a lazy chunk) that plays once in view and on Replay |
| `src/layout/FilesToCopy.tsx`, `sheen-closure.mjs`, `vite.sheen-deps.mjs`     | The "Files to copy" box: the exact transitive file closure of a page's `source`, plus the registry item and the `shadcn add` command                    |
| `scripts/prerender.mjs`, `scripts/lib/llms.mjs`                              | Static HTML per route, `sitemap.xml`, `llms.txt` and `llms-full.txt`                                                                                    |
| `scripts/og-images.mjs`, `scripts/screenshots.py`, `scripts/hero-capture.py` | The per-page OG cards in `public/og/` (run after a build), and the README screenshots and animated hero in `../screenshots/` (run against a dev server) |
| `src/generated/props/`                                                       | One generated props-table module per component, written by `pnpm docs:props` (do not edit by hand)                                                        |
| `public/r/`                                                                  | The shadcn registry items written by `pnpm registry:build` (served at `/r/<name>.json`)                                                                 |
| `e2e/`                                                                       | Playwright specs for the docs site                                                                                                                      |

## Updating visual baselines

Baselines are not committed: they are per machine and git-ignored. After a change that alters how pages look, refresh your own baselines with `pnpm --filter demo exec playwright test e2e/visual.spec.ts --project chromium --update-snapshots`.
