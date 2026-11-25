import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { sheenDeps } from "./vite.sheen-deps.mjs";
import { motionLite } from "./vite.motion-lite.mjs";
import { pageInstances } from "./vite.page-instances.mjs";
import { BASE_PATH } from "./src/seo/site";

/** The theme's TypeScript sources (its CSS is matched separately and keeps its side effects). */
const THEME_SOURCE = /[\\/]theme[\\/]src[\\/].+\.tsx?$/;
/** A library's JavaScript (its CSS stays in the one built stylesheet, which the prerender splits per route class). */
const LIB_JS = /node_modules[\\/].*\.(?:[mc]?js)$/;

/**
 * `pnpm dev` (command "serve") is the plain app: the theme's real sources and the full `motion` library, so
 * what a developer edits behaves exactly like the library. `vite build` (the client bundle and the SSR bundle
 * the prerender runs) adds the bundle-size work: lean Motion components (vite.motion-lite.mjs), one chunk per
 * route (vite.page-instances.mjs) and the chunk groups below. `pnpm budget` measures that build.
 */
export default defineConfig(({ command, isSsrBuild }) => {
  const building = command === "build";

  return {
    // GitHub Pages serves the site from a project sub-path; one constant (src/seo/site.ts) owns it.
    base: BASE_PATH,
    plugins: [
      react(),
      tailwindcss(),
      // `virtual:sheen-deps`: what each theme file needs copied, read from the real import graph.
      sheenDeps(),
      ...(building ? [motionLite(), ...pageInstances()] : []),
    ],
    build: {
      // scripts/prerender.mjs reads .vite/manifest.json to preload each page's chunk.
      manifest: true,
      // No module-preload helper. It wraps every dynamic import in __vite__mapDeps([...]) and ships a
      // list of every chunk file name: ~8 KB gzip in the entry for 127 lazy routes. scripts/prerender.mjs
      // writes the <link rel="modulepreload"> tags itself (entry closure, then the route's chunks).
      // All CSS is in the entry's one file (src/index.css and what it @imports; a stylesheet imported from a lazy chunk fails the
      // prerender). scripts/prerender.mjs splits that file per route class and links each page's own sheet (lib/css-split.mjs).
      modulePreload: false,
      rolldownOptions: {
        treeshake: {
          // The theme's modules only declare things; importing one runs nothing. Saying so lets
          // every page import from the "@sheenui/theme" barrel and still get only what it uses:
          // without it, the barrel pulls every component (charts, tables, combobox...) into the
          // main chunk. Anything else keeps the default (package.json "sideEffects").
          moduleSideEffects: (id) => (THEME_SOURCE.test(id) ? false : undefined),
        },
        // Shared chunks. Rolldown's default is ~100 tiny files (each with its own import/export glue and a
        // worse gzip ratio); these groups make a handful without any route downloading code it never uses:
        //   vendor-react  react + react-dom + scheduler: unchanged between deploys, cached across routes and releases
        //   vendor-core   every other library module the entry itself imports (every route loads them anyway)
        //   vendor-docs   library modules used by at least 100 of the 128 routes (Base UI composite and tabs, Motion's
        //                 component layer and animation engine...). The home page needs few of them and does not load
        //                 this chunk. (Splitting the engine out of it was tried: the docs shell needs its spring generator,
        //                 so every docs page loaded it anyway and the chart pages lost the merge.)
        // Everything else stays automatic, so a route's own libraries (Base UI select, TanStack table...) live in
        // chunks only the routes that need them fetch. The SSR bundle (the prerender) is not split.
        ...(building && !isSsrBuild
          ? {
              output: {
                codeSplitting: {
                  groups: [
                    {
                      name: "vendor-react",
                      test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/].*\.(?:[mc]?js)$/,
                      priority: 10,
                    },
                    { name: "vendor-core", test: LIB_JS, tags: ["$initial"], priority: 5 },
                    { name: "vendor-docs", test: LIB_JS, minShareCount: 100, priority: 3 },
                  ],
                },
              },
            }
          : {}),
      },
    },
    ssr: {
      // The prerender bundle (src/entry-server.tsx) carries every dependency, so it runs from
      // dist-ssr without pnpm's strict node_modules layout getting in the way.
      noExternal: true,
    },
  };
});
