// `pnpm registry:build`: turns theme/src into a shadcn registry, so every SheenUI component installs with
//
//   npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/<name>.json
//
// What it writes (idempotent: files are only rewritten when their content changes, stale ones are removed):
//   registry.json            repo root: the registry definition (name, homepage, items with file paths, no content)
//   demo/public/r/*.json     one registry-item per item with every file inlined, plus r/registry.json (the index).
//                            The demo build copies demo/public to the site, so these are served from
//                            https://lokendra-builds.github.io/sheenui/r/<name>.json
//
// How items are derived (same import graph as the docs' "Files to copy" panel and `pnpm copy-test`, but file
// level, parsed with the TypeScript scanner so imports in comments never count):
//   sheenui-theme            lib/, motion/, hooks/, styles/ (tokens, glass, motion, presets) + the `css` import.
//                            Every other item depends on it.
//   <component>              one item per folder in components/ (button, dialog, data-table, chat, ...)
//   <chart>                  one item per file in components/charts/ (line-chart, heatmap, sparkline, ...);
//                            files that import each other in a cycle are merged into one item
//   <block>                  one item per file in blocks/ (glass-login, chat-app, analytics-web, ...)
//
// Install layout in the user's app (the `@components` placeholder resolves to the components.json alias):
//   <components>/sheenui/lib|motion|hooks|styles/...   theme
//   <components>/sheenui/<component>/...               components (button/button.tsx)
//   <components>/sheenui/charts/<chart>.tsx            charts
//   <components>/sheenui/blocks/<block>.tsx            blocks
// That drops the extra `components/` level of theme/src, so relative imports are rewritten here (the source is
// untouched): "../../lib/cn" in components/button becomes "../lib/cn" in sheenui/button.
//
//   node scripts/build-registry.mjs                          default output + root registry.json
//   node scripts/build-registry.mjs --base http://localhost:4000/r --out /tmp/r --no-root   (what registry:check serves)
//   node scripts/build-registry.mjs --quiet

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

import { readSplitSource, splitFiles } from "../demo/scripts/lib/split-source.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "theme", "src");
const DEMO_SRC = join(ROOT, "demo", "src");
const DEFAULT_OUT = join(ROOT, "demo", "public", "r");

const SCHEMA_ITEM = "https://ui.shadcn.com/schema/registry-item.json";
const SCHEMA_REGISTRY = "https://ui.shadcn.com/schema/registry.json";
const THEME = "sheenui-theme";
/** Folder every item installs into, under the user's `components` alias. */
const INSTALL_DIR = "sheenui";
const EXTENSIONS = [".ts", ".tsx"];
const IGNORED_PACKAGES = new Set(["react", "react-dom"]);
const THEME_FOLDERS = new Set(["lib", "motion", "hooks", "styles"]);
/** Sub-folders of components/charts/ that belong to one chart file. */
const ABSORB = { geo: "geo-map", gantt: "gantt-chart" };

/** Docs route per item where the item name does not match the last route segment. */
const ROUTE_ALIAS = {
  command: "/overlays/command-palette",
  menu: "/overlays/dropdown-menu",
  segmented: "/forms/segmented-control",
  navbar: "/navigation/navbar",
  "vertical-nav": "/navigation/vertical-nav",
  spotlight: "/effects/spotlight-card",
  "text-effects": "/effects/shimmer-text",
  chat: "/chat/list",
  "chat-app": "/blocks/chat-app",
  "analytics-web": "/dashboards/web-analytics",
  "analytics-saas": "/dashboards/saas",
  "analytics-ecommerce": "/dashboards/ecommerce",
  "analytics-product": "/dashboards/product",
  "analytics-finance": "/dashboards/crypto-dashboard",
  "analytics-demo": "/dashboards/web-analytics",
  "analytics-demo-web": "/dashboards/web-analytics",
  "analytics-demo-saas": "/dashboards/saas",
  "analytics-demo-ecommerce": "/dashboards/ecommerce",
  "analytics-demo-product": "/dashboards/product",
  "analytics-demo-finance": "/dashboards/crypto-dashboard",
  "chart-export": "/charts",
  "chart-pointer": "/charts",
  "percent-bar-chart": "/charts/percent-stacked-bar-chart",
  "geo-map": "/charts/world-map",
  "chord-diagram": "/charts/chord-diagram",
  "network-graph": "/charts/network-graph",
  charts: "/charts",
};

/** Titles for merged items whose docs page title would mislead (the item installs several components). */
const TITLE = {
  "analytics-demo": "Analytics demo helpers",
  "analytics-demo-web": "Web analytics demo data",
  "analytics-demo-saas": "SaaS revenue demo data",
  "analytics-demo-ecommerce": "E-commerce demo data",
  "analytics-demo-product": "Product analytics demo data",
  "analytics-demo-finance": "Finance demo data",
  chat: "Chat (list, thread, composer, widget)",
  "text-effects": "Text effects",
};

/** Kit files whose bare name would be too generic as an item name. */
const RENAME = { icons: "block-icons" };

/** Items whose doc comment is not a good one-line description (shared kits and helpers). */
const DESCRIPTION = {
  pagination:
    "A glass React pagination control: previous and next, and a window of page numbers that keeps a constant number of slots so the control never jumps.",
  "description-list":
    "A glass React description list for key and value pairs in detail views, with inline or stacked layout, an empty-value dash and optional copy buttons.",
  "chart-annotations":
    "Reference lines, bands and event markers drawn inside a SheenUI chart's plot area. Used by the line and bar charts.",
  "chart-brush":
    "A range brush for SheenUI charts: drag its handles under a chart to zoom into a window of the data, with keyboard control.",
  "chart-export": "Helpers that serialise a SheenUI chart to SVG, PNG and CSV. Used by the chart export menu.",
  "chart-fit":
    "Chart helpers that fit tooltips, docked readouts, tick labels and table views to the room a SheenUI chart has.",
  "chart-parts":
    "Shared chart building blocks for every SheenUI chart: tooltip, legend, axes, table view and the export menu.",
  "histogram-kit":
    "Shared building blocks of the histogram, box plot, beeswarm, lollipop, dumbbell and diverging bar charts: distribution statistics, glow filters and mark motion.",
  "chart-sync": "Groups SheenUI charts so one hover or arrow-key reading drives the crosshair of all of them.",
  "chart-utils":
    "Shared chart maths and helpers for every SheenUI chart: scales, ticks, number formatting, the colour-blind-safe palette and responsive sizing.",
  "flow-utils":
    "Shared helpers for SheenUI flow charts (Sankey, chord, sunburst, Marimekko, network): follow-the-pointer tips and ribbon geometry.",
  "radial-progress":
    "A radial progress ring for one ratio against a limit, with the unfilled track in a lighter step of the same colour.",
  sparkline:
    "A tiny React trend line for stat tiles and table cells; the latest point is marked with a dot once the line has drawn.",
  "analytics-kit":
    "Shared pieces for the SheenUI analytics dashboards: time ranges, the cascading chart mount, live tickers, the dashboard shell, panels, KPI strip and trend charts.",
  "analytics-demo":
    "Seeded random numbers, the fixed demo clock and demo series for SheenUI demos and tests. Not needed in production.",
  "analytics-demo-web":
    "Demo data, loader and live step for the SheenUI web analytics dashboard. Not needed in production.",
  "analytics-demo-saas":
    "Demo data, loader and live step for the SheenUI SaaS revenue dashboard. Not needed in production.",
  "analytics-demo-ecommerce":
    "Demo data, loader and live step for the SheenUI e-commerce dashboard. Not needed in production.",
  "analytics-demo-product":
    "Demo data, loader and live update for the SheenUI product analytics dashboard. Not needed in production.",
  "analytics-demo-finance":
    "Demo data, loader and live update for the SheenUI finance dashboard. Not needed in production.",
  "status-icons":
    "Check, close and alert marks shared by SheenUI components: 24px stroke icons that inherit the text colour.",
  "block-icons":
    "Stroke icons shared by the SheenUI blocks: mail, lock, eye, card, shield, arrows, tag, refresh, alert, GitHub and Google.",
};

const ACRONYMS = { otp: "OTP", ai: "AI", csv: "CSV", ui: "UI", kbd: "Kbd" };

// ---------------------------------------------------------------------------------------------- options

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

// ---------------------------------------------------------------------------------------------- helpers

const toPosix = (p) => p.split(sep).join("/");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)
    .filter((n) => !n.startsWith("._"))
    .sort()) {
    // macOS AppleDouble metadata, not source
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (!/\.(test|spec)\./.test(name) && !name.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

function resolveLocal(from, spec) {
  const base = resolve(dirname(from), spec);
  const candidates = [base, ...EXTENSIONS.map((e) => base + e), ...EXTENSIONS.map((e) => join(base, "index" + e))];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
}

/** "@base-ui/react/tabs" -> "@base-ui/react", "motion/react" -> "motion". */
function packageName(spec) {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function humanize(name) {
  const words = name.split("-").map((w, i) => ACRONYMS[w] ?? (i === 0 ? w[0].toUpperCase() + w.slice(1) : w));
  return words.join(" ");
}

/** theme/src path -> path below <components>/sheenui/. */
const installRel = (rel) => (rel.startsWith("components/") ? rel.slice("components/".length) : rel);

/** Value of `export const NAME = "..."` in a TS file (used for the site URL, so it never drifts from the SEO config). */
function constFrom(file, name) {
  const match = readFileSync(file, "utf8").match(new RegExp(`export const ${name}\\s*=\\s*"([^"]+)"`));
  if (!match) throw new Error(`build-registry: cannot read ${name} from ${file}`);
  return match[1];
}

// ---------------------------------------------------------------------------------------------- source scan

/** Which graph node a theme/src file belongs to: "theme", "component:<folder>", "chart:<file>" or "block:<file>". */
function nodeOf(rel) {
  const parts = rel.split("/");
  const top = parts[0];
  if (THEME_FOLDERS.has(top)) return "theme";
  if (top === "blocks" && parts[1] === "analytics") {
    // blocks/analytics/ is the analytics kit split by concern; the demo fixtures are separate, optional items.
    const name = basename(rel, extname(rel));
    return name.startsWith("demo") ? `block:analytics-${name}` : "block:analytics-kit";
  }
  // A block split into files lives in a folder named like it (blocks/ai-chat/*.tsx); the folder is the item.
  if (top === "blocks") return `block:${parts.length > 2 ? parts[1] : basename(rel, extname(rel))}`;
  if (top === "components") {
    const folder = parts[1];
    if (folder !== "charts") return `component:${folder}`;
    // A shared kit lives in charts/kits/<name>/ and is its own installable item named after the folder ("histogram-kit").
    if (parts[2] === "kits" && parts.length > 4) return `chart:${parts[3]}`;
    if (parts.length > 3) {
      // A sub-folder belongs to the chart file named like it ("gantt/" -> gantt-chart.tsx, "geo-map/" -> geo-map.tsx), unless ABSORB says otherwise.
      const sibling = readdirSync(join(SRC, "components", "charts"))
        .filter((f) => !f.startsWith("._"))
        .map((f) => basename(f, extname(f)))
        .find((n) => n === parts[2] || n.startsWith(`${parts[2]}-`));
      const owner = ABSORB[parts[2]] ?? sibling;
      if (!owner) throw new Error(`build-registry: ${rel} is in an unmapped charts sub-folder; add it to ABSORB`);
      return `chart:${owner}`;
    }
    return `chart:${basename(rel, extname(rel))}`;
  }
  return null; // index.ts barrel and other root files: not installable
}

function scanSource() {
  const files = new Map();
  for (const abs of walk(SRC)) {
    const rel = toPosix(relative(SRC, abs));
    const node = nodeOf(rel);
    if (!node) continue;
    const ext = extname(rel);
    const record = { rel, abs, node, ext, text: readFileSync(abs, "utf8"), imports: [], packages: [] };
    if (EXTENSIONS.includes(ext)) {
      for (const found of ts.preProcessFile(record.text, true, true).importedFiles) {
        const spec = found.fileName;
        // pos is the opening quote; the specifier follows it.
        const start = found.pos + 1;
        if (record.text.slice(start, start + spec.length) !== spec)
          throw new Error(`build-registry: cannot locate "${spec}" in ${rel}`);
        if (spec.startsWith(".")) {
          const target = resolveLocal(abs, spec);
          if (!target) throw new Error(`build-registry: ${rel} imports "${spec}", which does not resolve`);
          const targetRel = toPosix(relative(SRC, target));
          if (!nodeOf(targetRel))
            throw new Error(
              `build-registry: ${rel} imports "${spec}" (${targetRel}), which is not installable (barrel?)`,
            );
          record.imports.push({ spec, start, targetRel, targetAbs: target });
        } else if (!spec.startsWith("node:")) {
          const name = packageName(spec);
          if (!IGNORED_PACKAGES.has(name) && !record.packages.includes(name)) record.packages.push(name);
        }
      }
    }
    files.set(rel, record);
  }
  return files;
}

/** Rewrites relative imports from the theme/src layout to the installed layout. */
function rewriteImports(record, files) {
  let text = record.text;
  const fromDir = posix.dirname(installRel(record.rel));
  for (const imp of [...record.imports].sort((a, b) => b.start - a.start)) {
    const target = installRel(imp.targetRel);
    const exact = resolve(dirname(record.abs), imp.spec);
    let installed;
    if (exact === imp.targetAbs)
      installed = target; // spec named the file with its extension
    else if (exact + extname(imp.targetAbs) === imp.targetAbs) installed = target.slice(0, -extname(target).length);
    else installed = posix.dirname(target); // folder import resolved to its index file
    let spec = posix.relative(fromDir, installed);
    if (!spec.startsWith(".")) spec = `./${spec}`;
    text = text.slice(0, imp.start) + spec + text.slice(imp.start + imp.spec.length);
    if (!files.has(imp.targetRel))
      throw new Error(`build-registry: ${record.rel} imports unknown file ${imp.targetRel}`);
  }
  return text;
}

// ---------------------------------------------------------------------------------------------- graph

/** Tarjan's strongly connected components over `edges` (Map<node, Set<node>>). */
function components(nodes, edges) {
  let index = 0;
  const stack = [];
  const meta = new Map();
  const out = [];
  const visit = (v) => {
    meta.set(v, { index, low: index, on: true });
    index += 1;
    stack.push(v);
    for (const w of edges.get(v) ?? []) {
      if (!meta.has(w)) {
        visit(w);
        meta.get(v).low = Math.min(meta.get(v).low, meta.get(w).low);
      } else if (meta.get(w).on) meta.get(v).low = Math.min(meta.get(v).low, meta.get(w).index);
    }
    if (meta.get(v).low === meta.get(v).index) {
      const group = [];
      let w;
      do {
        w = stack.pop();
        meta.get(w).on = false;
        group.push(w);
      } while (w !== v);
      out.push(group.sort());
    }
  };
  for (const v of [...nodes].sort()) if (!meta.has(v)) visit(v);
  return out;
}

const plainName = (node) => {
  const name = node.split(":")[1];
  return RENAME[name] ?? name;
};

// ---------------------------------------------------------------------------------------------- metadata

function loadRoutes() {
  const text = readSplitSource(join(DEMO_SRC, "routes.ts"));
  const routes = new Map();
  for (const m of text.matchAll(/path:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*group:\s*"([^"]+)"/g))
    routes.set(m[1], { title: m[2], group: m[3] });
  return routes;
}

async function loadSeo() {
  // The keyword map is split into one table per route group (seo/meta/*.ts): load each and merge them in order.
  const load = async (file) => {
    // A table may quote the page counts (`import { COUNTS } from "../counts"`); counts.ts pulls in the whole route graph (TSX),
    // which Node cannot load. The registry reads only the keyword/description of component pages, so the counts are stubbed.
    const source = readFileSync(file, "utf8").replace(
      /^import \{ COUNTS \} from "\.\.\/counts";$/m,
      'const COUNTS = new Proxy({}, { get: () => "N" });',
    );
    const js = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
  };
  const [, ...parts] = splitFiles(join(DEMO_SRC, "seo", "meta.ts"));
  const seoMeta = {};
  for (const file of parts) if (!file.endsWith("types.ts")) Object.assign(seoMeta, ...Object.values(await load(file)));
  return seoMeta;
}

/** First paragraph of the doc comment above the component named `preferred` (else the first exported component), as one line. */
function docSummary(text, preferred) {
  const blocks = [...text.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export\s+(function|const|class)\s+(\w+)/g)];
  const pick =
    blocks.find((m) => m[3] === preferred) ??
    blocks.find((m) => /^[A-Z]/.test(m[3]) && m[2] === "function") ??
    blocks.find((m) => /^[A-Z]/.test(m[3])) ??
    blocks[0];
  if (!pick) return "";
  const lines = pick[1].split("\n").map((l) => l.replace(/^\s*\*\s?/, "").trim());
  const paragraph = [];
  for (const line of lines) {
    if (line.startsWith("@") || line.startsWith("```") || (!line && paragraph.length)) break;
    if (line) paragraph.push(line);
  }
  const one = paragraph.join(" ").replace(/\s+/g, " ");
  return one.length > 200 ? `${one.slice(0, one.lastIndexOf(" ", 197))}...` : one;
}

const pascal = (name) =>
  name
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");

/** Value names the package barrel (theme/src/index.ts) exports per source file (no extension), so an item's Import line names real exports. */
function barrelNames() {
  const byFile = new Map();
  // The package entry and the `@sheenui/theme/demo-data` entry (its names are imported from that path).
  // index.ts re-exports the sibling barrels under src/exports/ (`export * from "./exports/<part>"`), which hold the lines.
  const barrels = readdirSync(join(SRC, "exports"))
    .filter((f) => f.endsWith(".ts") && !f.startsWith("._"))
    .sort()
    .map((f) => ["exports/" + f, ""]);
  for (const [entry, prefix] of [...barrels, ["demo-data.ts", "demo:"]]) {
    const text = readFileSync(join(SRC, entry), "utf8");
    for (const m of text.matchAll(/export\s*\{([^}]*)\}\s*from\s*"\.{1,2}\/([^"]+)"/g)) {
      const names = m[1]
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x && !x.startsWith("type "));
      const key = prefix + m[2];
      byFile.set(key, [...(byFile.get(key) ?? []), ...names.map((n) => n.split(/\s+as\s+/).pop())]);
    }
  }
  return byFile;
}

/** Is `name` documented `@internal` in this file (an icon or helper that is exported for the package, not for people to import)? */
export const isInternal = (text, name) =>
  [...text.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export\s+(?:async\s+)?(?:function|const|class)\s+(\w+)/g)].some(
    (m) => m[2] === name && /@internal\b/.test(m[1]),
  );

/** A SCREAMING_CASE constant (FENCE, RUN_GAP, DEMO_NOW): a value, never something a reader imports. */
export const isConstantName = (name) => /^[A-Z][A-Z0-9_]+$/.test(name);

/** Names an import line may list for this file: not `@internal`, not a SCREAMING_CASE constant. */
export const isImportable = (text, name) => !isConstantName(name) && !isInternal(text, name);

const exportedNames = (text) =>
  [...text.matchAll(/^export\s+(?:function|const|class)\s+([A-Z]\w*)/gm)]
    .map((m) => m[1])
    .filter((n) => isImportable(text, n));

// ---------------------------------------------------------------------------------------------- build

/**
 * Builds the registry in memory.
 * @param {{ base?: string }} [options] base: URL prefix used in registryDependencies (no trailing slash).
 */
export async function createRegistry({ base } = {}) {
  const site = constFrom(join(DEMO_SRC, "seo", "site.ts"), "SITE_URL");
  const repoUrl = constFrom(join(DEMO_SRC, "seo", "site.ts"), "REPO_URL");
  const authorUrl = readFileSync(join(DEMO_SRC, "seo", "site.ts"), "utf8").match(
    /export const AUTHOR = \{[^}]*?url:\s*"([^"]+)"/,
  )?.[1];
  if (!authorUrl) throw new Error("build-registry: cannot read AUTHOR.url from demo/src/seo/site.ts");
  const baseUrl = (base ?? `${site}/r`).replace(/\/$/, "");
  const files = scanSource();
  const themePkg = JSON.parse(readFileSync(join(ROOT, "theme", "package.json"), "utf8"));
  const declared = { ...themePkg.dependencies, ...themePkg.peerDependencies };

  // Graph between items (theme edges are implicit: everything depends on the theme).
  const nodes = new Set([...files.values()].map((f) => f.node).filter((n) => n !== "theme"));
  const edges = new Map([...nodes].map((n) => [n, new Set()]));
  for (const f of files.values()) {
    if (f.node === "theme") continue;
    for (const imp of f.imports) {
      const to = files.get(imp.targetRel).node;
      if (to !== f.node && to !== "theme") edges.get(f.node).add(to);
    }
  }
  const groups = components(nodes, edges);
  const group = new Map();
  const cycles = [];
  for (const members of groups) {
    let key = members[0];
    if (members.length > 1) {
      // Name a merged item after the member the rest of the graph imports most.
      const inbound = (n) => [...nodes].filter((o) => !members.includes(o) && edges.get(o).has(n)).length;
      key = [...members].sort((a, b) => inbound(b) - inbound(a) || a.localeCompare(b))[0];
      cycles.push(members.map(plainName));
    }
    for (const m of members) group.set(m, key);
  }

  // One item per group key (+ the theme).
  const itemFiles = new Map([[THEME, []]]);
  const kindOf = new Map([[THEME, "theme"]]);
  const keyOf = new Map([[THEME, THEME]]);
  for (const f of files.values()) {
    const key = f.node === "theme" ? THEME : group.get(f.node);
    const name = key === THEME ? THEME : plainName(key);
    if (key !== THEME) {
      kindOf.set(name, key.split(":")[0]);
      keyOf.set(name, key);
    }
    if (!itemFiles.has(name)) itemFiles.set(name, []);
    itemFiles.get(name).push(f);
  }
  const nameCount = new Map();
  for (const key of new Set(group.values())) nameCount.set(plainName(key), (nameCount.get(plainName(key)) ?? 0) + 1);
  for (const [name, n] of nameCount)
    if (n > 1 || name === THEME) throw new Error(`build-registry: item name "${name}" is used twice`);

  const routes = loadRoutes();
  const seo = await loadSeo();
  const routeFor = (name, kind) => {
    if (ROUTE_ALIAS[name]) return ROUTE_ALIAS[name];
    const candidates = [...routes.keys()].filter((p) => p !== "/");
    const exact = candidates.find((p) => p.split("/").pop() === name);
    if (exact) return exact;
    if (kind === "chart") {
      const short = name.replace(/-(chart|graph|diagram|map)$/, "");
      const hit = candidates.find((p) => p.startsWith("/charts/") && p.split("/").pop() === short);
      if (hit) return hit;
    }
    return null;
  };

  const items = [];
  for (const [name, list] of itemFiles) {
    const kind = kindOf.get(name);
    const sorted = [...list].sort((a, b) => a.rel.localeCompare(b.rel));
    const packages = new Set(sorted.flatMap((f) => f.packages));
    const dependencies = [...packages].sort().map((pkg) => {
      if (!declared[pkg])
        throw new Error(`build-registry: ${name} imports "${pkg}", which is not in theme/package.json dependencies`);
      return `${pkg}@${declared[pkg]}`;
    });
    const deps = new Set();
    for (const f of sorted) {
      for (const imp of f.imports) {
        const to = files.get(imp.targetRel).node;
        if (to !== "theme" && group.get(to) !== keyOf.get(name)) deps.add(plainName(group.get(to)));
      }
    }
    const registryDependencies = [...(name === THEME ? [] : [THEME]), ...[...deps].sort()].map(
      (d) => `${baseUrl}/${d}.json`,
    );

    const itemType = kind === "theme" ? "registry:theme" : kind === "block" ? "registry:block" : "registry:ui";
    const fileEntries = sorted.map((f) => {
      const top = f.rel.split("/")[0];
      const type =
        f.ext === ".css" || ![".ts", ".tsx"].includes(f.ext)
          ? "registry:file"
          : top === "hooks"
            ? "registry:hook"
            : top === "lib" || top === "motion"
              ? "registry:lib"
              : kind === "block"
                ? "registry:block"
                : "registry:ui";
      const content = [".ts", ".tsx"].includes(f.ext) ? rewriteImports(f, files) : f.text;
      return { path: `theme/src/${f.rel}`, content, type, target: `@components/${INSTALL_DIR}/${installRel(f.rel)}` };
    });

    // Titles, descriptions and docs links from the docs pages (routes.ts + SEO meta) and the source's doc comment.
    let route = kind === "theme" ? null : routeFor(name, kind);
    let viaSee = false;
    if (!route && kind !== "theme") {
      // No page named like the item: use the first `@see /route` in its sources (e.g. Backdrop -> /foundations).
      for (const f of sorted) {
        const see = [...f.text.matchAll(/@see\s+(\/[\w/-]+)/g)].map((m) => m[1]).find((p) => routes.has(p));
        if (see) {
          route = see;
          viaSee = true;
          break;
        }
      }
    }
    const page = route ? routes.get(route) : null;
    const seoRow = route ? seo[route] : null;
    const specificRoute = route && !viaSee && !(["chart"].includes(kind) && route === "/charts");
    const main =
      sorted.find((f) => f.rel.endsWith(`/${name}.tsx`)) ?? sorted.find((f) => f.ext === ".tsx") ?? sorted[0];
    let title = TITLE[name] ?? (specificRoute && page ? page.title : humanize(name));
    let description =
      DESCRIPTION[name] ??
      (specificRoute && seoRow?.description ? seoRow.description : docSummary(main.text, pascal(name)));
    if (kind === "theme") {
      title = "SheenUI theme";
      description =
        "SheenUI base layer: light and dark tokens, glass levels, the Liquid Glass and Aurora Neon style presets, motion tokens and CSS, the cn() helper and the theme, motion and transparency hooks. Every SheenUI item depends on it.";
    }
    if (!description)
      description = `${title}: a SheenUI ${kind === "chart" ? "chart" : kind === "block" ? "block" : "component"}.`;

    // Import line: the barrel's components of this item (main file first), not whatever the first file happens to export.
    const barrel = barrelNames();
    const stem = (f) => f.rel.replace(/\.tsx?$/, "");
    const ordered = [main, ...sorted.filter((f) => f !== main)];
    const demoExports = ordered.flatMap((f) =>
      (barrel.get("demo:" + stem(f)) ?? []).filter((n) => isImportable(f.text, n)),
    );
    // One import line per file of the item, each listing every component that file exports (a family such as Sidebar,
    // Table or Field keeps all its parts), at the file's own install path.
    const publicIn = (f) => [
      ...new Set((barrel.get(stem(f)) ?? []).filter((n) => /^[A-Z][a-z]/.test(n) && isImportable(f.text, n))),
    ];
    const importGroups = ordered
      .map((f) => ({ f, names: publicIn(f).length ? publicIn(f) : exportedNames(f.text) }))
      .filter((g) => g.names.length > 0);
    if (!importGroups.length && demoExports.length) importGroups.push({ f: main, names: [...new Set(demoExports)] });
    const importLines = importGroups.map(
      (g) =>
        `import { ${g.names.join(", ")} } from "@/components/${INSTALL_DIR}/${installRel(g.f.rel).replace(/\.tsx?$/, "")}";`,
    );
    const docsUrl = route ? `${site}${route}` : site;
    const docs =
      kind === "theme"
        ? [
            `SheenUI base layer, installed in components/${INSTALL_DIR}/{lib,motion,hooks,styles}. Docs: ${site}/foundations`,
            ``,
            `Requires React 19.2 or newer (the components use useEffectEvent; the CLI does not install react) and Tailwind CSS v4.`,
            ``,
            `1. Check your global CSS (components.json "tailwind.css"): the CLI added \`@import "@/components/${INSTALL_DIR}/styles/index.css";\`. It must come AFTER \`@import "tailwindcss";\`. Vite resolves the "@/" alias in CSS. Next.js does not (Tailwind's PostCSS plugin ignores tsconfig paths, and \`next build\` fails with "Can't resolve '@/components/${INSTALL_DIR}/styles/index.css'"): there, change it to the relative path from your global CSS, e.g. \`@import "../components/${INSTALL_DIR}/styles/index.css";\` in app/globals.css or src/app/globals.css.`,
            `2. Optional but recommended: wrap your app in <SheenMotionProvider> (components/${INSTALL_DIR}/motion/provider) and inline sheenPreferenceScript (components/${INSTALL_DIR}/hooks/use-preferences) in <head> to apply the saved theme and style preset before first paint.`,
            `3. Fonts: Liquid Glass uses Inter Variable (Aurora Neon uses Geist). Install \`@fontsource-variable/inter\` and import it, or SheenUI falls back to the system font.`,
            `4. SheenUI switches dark mode with <html data-theme="dark"> and redefines Tailwind's dark: variant to follow it. In an app that also uses shadcn/ui's .dark class, set both attributes or keep one convention.`,
          ].join("\n")
        : [
            `${title}: ${docsUrl}`,
            ``,
            `Installed in components/${INSTALL_DIR}/${installRel(main.rel).split("/").slice(0, -1).join("/") || "."}/. ${importLines.length ? `Import (use your components alias):\n${importLines.join("\n")}` : "A helper module that the other items import; you rarely import it yourself."}`,
          ].join("\n");

    const category = page
      ? page.group.toLowerCase().replace(/\s+/g, "-")
      : kind === "chart"
        ? "charts"
        : kind === "block"
          ? "blocks"
          : kind === "theme"
            ? "theme"
            : "components";
    const item = {
      $schema: SCHEMA_ITEM,
      name,
      type: itemType,
      title,
      description,
      author: `lokendra-builds <${authorUrl}>`,
      ...(dependencies.length ? { dependencies } : {}),
      ...(registryDependencies.length ? { registryDependencies } : {}),
      files: fileEntries,
      ...(kind === "theme" ? { css: { [`@import "@/components/${INSTALL_DIR}/styles/index.css"`]: {} } } : {}),
      docs,
      categories: [category],
      meta: { kind, source: `${repoUrl}/tree/main/theme/src`, ...(route && { route, docsUrl }) },
    };
    items.push(item);
  }

  const order = { theme: 0, component: 1, chart: 2, block: 3 };
  items.sort((a, b) => order[a.meta.kind] - order[b.meta.kind] || a.name.localeCompare(b.name));

  // Self-check: every dependency exists, every target is unique.
  const names = new Set(items.map((i) => i.name));
  const targets = new Set();
  for (const item of items) {
    for (const url of item.registryDependencies ?? []) {
      const dep = url.slice(baseUrl.length + 1, -".json".length);
      if (!names.has(dep)) throw new Error(`build-registry: ${item.name} depends on unknown item "${dep}"`);
    }
    for (const file of item.files) {
      if (targets.has(file.target)) throw new Error(`build-registry: target ${file.target} is installed by two items`);
      targets.add(file.target);
    }
  }

  const strip = (item) => ({ ...item, files: item.files.map(({ content: _content, ...rest }) => rest) });
  const index = { $schema: SCHEMA_REGISTRY, name: "sheenui", homepage: site, items: items.map(strip) };
  return { items, index, cycles, baseUrl, site };
}

/** Writes `content` to `file` only when it differs. @returns {boolean} whether the file changed. */
function writeIfChanged(file, content) {
  if (existsSync(file) && readFileSync(file, "utf8") === content) return false;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  return true;
}

/**
 * Builds the registry and writes it.
 * @param {{ out?: string; base?: string; writeRoot?: boolean; quiet?: boolean }} [options]
 */
export async function buildRegistry({ out = DEFAULT_OUT, base, writeRoot = true, quiet = false } = {}) {
  const { items, index, cycles, baseUrl } = await createRegistry({ base });
  let changed = 0;
  const wanted = new Set(["registry.json"]);
  for (const item of items) {
    wanted.add(`${item.name}.json`);
    if (writeIfChanged(join(out, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`)) changed += 1;
  }
  if (writeIfChanged(join(out, "registry.json"), `${JSON.stringify(index, null, 2)}\n`)) changed += 1;
  let removed = 0;
  for (const name of existsSync(out) ? readdirSync(out) : []) {
    if (name.endsWith(".json") && !name.startsWith("._") && !wanted.has(name)) {
      // ._*: macOS AppleDouble metadata, never ours to remove
      rmSync(join(out, name));
      removed += 1;
    }
  }
  if (writeRoot && writeIfChanged(join(ROOT, "registry.json"), `${JSON.stringify(index, null, 2)}\n`)) changed += 1;
  if (!quiet) {
    const kinds = items.reduce((acc, i) => ({ ...acc, [i.meta.kind]: (acc[i.meta.kind] ?? 0) + 1 }), {});
    console.log(
      `registry: ${items.length} items (${Object.entries(kinds)
        .map(([k, n]) => `${n} ${k}`)
        .join(", ")}) -> ${relative(ROOT, out) || out}; ${changed} written, ${removed} removed`,
    );
    if (cycles.length) console.log(`registry: merged import cycles: ${cycles.map((c) => c.join(" + ")).join("; ")}`);
    console.log(`registry: install with  npx shadcn@latest add ${baseUrl}/<name>.json`);
  }
  return { items, index, out, changed, removed, baseUrl };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildRegistry({
    out: resolve(option("out", DEFAULT_OUT)),
    base: option("base"),
    writeRoot: !flag("no-root"),
    quiet: flag("quiet"),
  });
}
