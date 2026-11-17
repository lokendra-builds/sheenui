// Production build only: one chunk per route instead of one per page FILE.
//
// Several routes share a page module (ChartsDistributionPages.tsx holds seven chart pages, each of which
// imports its own chart). Bundled as written, opening /charts/gauge-chart downloads the code of all
// seven charts. This plugin gives each route its own copy of the module:
//
//   1. src/routes.ts and src/routes/*.ts:  lazyPage(overlays, (m) => m.PopoverPage)
//                  →   lazyPage(() => import("./pages/OverlayPages.tsx?page=PopoverPage"), (m) => m.default)
//   2. a module loaded with `?page=Name` keeps only `Name` (as its default export); the bundler's
//      normal tree-shaking then drops the other pages and every import only they used. Helpers a
//      page shares with its siblings are duplicated per route (a few hundred bytes of sample data);
//      the shared components (Page, Example, charts) stay in shared chunks.
//
// The sources stay as they are, `pnpm dev` is unaffected (plugin is not in vite.config.ts), and
// scripts/prerender.mjs finds each route's chunk under the "...tsx?page=Name" manifest key.

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, sep } from "node:path";

import { rewriteRouteLoaders } from "./vite.route-rewrite.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROUTES = join(HERE, "src", "routes.ts");
/** The per-group route tables (src/routes/*.ts): they sit one folder deeper, so their page imports start with `../`. */
const ROUTES_DIR = join(HERE, "src", "routes") + sep;

/** `from "./X"` or `import("./X")` of a sibling module inside a page instance (DocSections excepted). */
const SIBLING_IMPORT = /(\bfrom\s*|\bimport\s*\(\s*)(["'])\.\/((?!DocSections\b)[\w-]+)\2/g;

/** "./pages/X" → "./pages/X.tsx" (or .ts), checked on disk. */
function withExtension(spec) {
  for (const ext of [".tsx", ".ts"])
    if (existsSync(join(HERE, "src", spec.replace(/^\.\//, "") + ext))) return spec + ext;
  return spec;
}

/** @returns {import("vite").Plugin[]} */
export function pageInstances() {
  return [
    {
      name: "sheen:page-instances:routes",
      enforce: "pre",
      transform(code, id) {
        const file = id.split("?")[0] ?? "";
        if (file !== ROUTES && !file.startsWith(ROUTES_DIR)) return null;
        // How this file reaches src/: its own folder (routes.ts) or one up (routes/*.ts).
        const up = file === ROUTES ? "./" : "../";
        const out = rewriteRouteLoaders(code, up, withExtension);
        return { code: out, map: null };
      },
    },
    {
      name: "sheen:page-instances:pages",
      // After TypeScript and JSX are compiled, so the exports are plain `export function Name`.
      enforce: "post",
      transform(code, id) {
        const m = id.match(/[\\/]src[\\/]pages[\\/][^?]+\.tsx?\?page=(\w+)$/);
        if (!m) return null;
        const name = m[1];
        // Rewrite real export statements only, found in the AST: a line-anchored regex also matched `export default`
        // lines inside a template literal (a code sample a page displays) and corrupted the shown code.
        let ast;
        try {
          ast = this.parse(code);
        } catch {
          return null;
        }
        const edits = [];
        for (const node of ast.body) {
          if (node.type === "ExportDefaultDeclaration") {
            edits.push([node.start, node.declaration.start, "const __unusedDefault = "]);
          } else if (node.type === "ExportNamedDeclaration") {
            // `export function X` / `export const X` / `export class X` lose the keyword; `export { A, B }` goes away.
            if (node.declaration) edits.push([node.start, node.declaration.start, ""]);
            else edits.push([node.start, node.end, ""]);
          } else if (node.type === "ExportAllDeclaration") {
            edits.push([node.start, node.end, ""]);
          }
        }
        let rewritten = "";
        let at = 0;
        for (const [from, to, text] of edits) {
          rewritten += code.slice(at, from) + text;
          at = to;
        }
        rewritten += code.slice(at);
        const stripped = rewritten
          // A helper module shared by sibling pages (PrimitiveShowcases.tsx, demo-dashboards.tsx) gets a copy per
          // route too (`./X.tsx?for=Name`): as one shared module it would ship whole, every showcase for every
          // route (about 90 KB gzip on each of the 20 primitive pages). The copy is imported by this route alone,
          // so the bundler drops the exports it does not render. DocSections stays shared: every page uses it.
          .replace(SIBLING_IMPORT, (whole, lead, quote, base) => {
            const spec = withExtension(`./pages/${base}`);
            if (spec === `./pages/${base}`) return whole;
            return `${lead}${quote}./${base}${spec.slice(`./pages/${base}`.length)}?for=${name}${quote}`;
          });
        return { code: `${stripped}\nexport { ${name} as default };\n`, map: null };
      },
    },
    {
      name: "sheen:page-instances:side-effects",
      // A page module only declares components and sample data (nothing in src/pages registers itself on import: no
      // bare `import "./x"`). Saying so lets the bundler drop a helper module (an example file, a sibling page file
      // `?for=`) whose exports this route never uses. Without it, every `import { XExample } from "./Page/x"` that
      // only a stripped sibling page used still pulled that module and its charts / Base UI parts into the route's
      // preload list (the histogram page downloaded the dumbbell, box-plot and gauge charts).
      // src/layout (the docs shell and its blocks) is the same: nothing there is imported for its side effects, so a page
      // that only imports HubPreview or AboutAccordion in a sibling page it does not render no longer loads them.
      enforce: "post",
      transform(code, id) {
        const file = id.split("?")[0] ?? "";
        // A stylesheet is the one thing in these folders that IS imported for its side effect: flagged pure, its import was
        // dropped and the CSS never reached the build. Left alone it is emitted with its chunk, and scripts/prerender.mjs
        // stops the build when a chunk carries CSS that no page links (import it from src/index.css instead).
        if (/\.(?:css|scss|sass|less|styl)$/.test(file)) return null;
        if (!/[\\/]src[\\/](?:pages|layout)[\\/]/.test(file)) return null;
        return { code, map: null, moduleSideEffects: false };
      },
    },
  ];
}
