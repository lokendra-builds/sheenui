// Generates demo/src/generated/component-props.ts: one `PropRow[]` per public component, extracted from the
// TypeScript source (see lib/extract-props.mjs). Docs pages render it with <PropsTable of={PROPS.Tooltip} />.
//
//   node scripts/gen-props.mjs           write the file
//   node scripts/gen-props.mjs --check   exit 1 when the file is stale (used by `pnpm docs:check`)
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCopyList } from "../sheen-closure.mjs";
import { scanThemeDeps } from "../vite.sheen-deps.mjs";
import { pageSources, resolvePageModule, routeModules } from "./lib/routes-source.mjs";
import { splitFiles, stripComments } from "./lib/split-source.mjs";
import { routeSampleNames } from "./lib/sample-uses.mjs";
import { cleanSummary } from "./lib/summary-text.mjs";
import {
  cleanDescription,
  stripProseDefault,
  extractExportFiles,
  extractInstallPaths,
  extractProps,
  extractRouteExports,
} from "./lib/extract-props.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../src/generated/component-props.ts");
/** One small module per component (`props/<Name>.ts`): a route's chunk then carries only the props tables it renders, not all ~360 KB. */
const PROPS_DIR = join(dirname(OUT), "props");
const PATHS_OUT = join(dirname(OUT), "install-paths.ts");
/** What each page's examples import besides the page's own item (see lib/sample-uses.mjs): the data, loaded only by a page that has it, and the list of those routes, which every page carries. */
const ALSO_OUT = join(dirname(OUT), "also-uses.ts");
const ALSO_ROUTES_OUT = join(dirname(OUT), "also-routes.ts");
const EXPORTS_OUT = join(dirname(OUT), "route-exports.ts");
// BEGIN export summaries (the lazily loaded "All exports on this page" index)
const SUMMARIES_OUT = join(dirname(OUT), "export-summaries.ts");
const SUMMARY_CHUNK = 250;
let routeExportData;
/** extractRouteExports with the JSDoc summaries, computed once per run (it builds a TypeScript program). */
const routeExportsWithSummaries = () => (routeExportData ??= extractRouteExports(undefined, true));
// END export summaries

let pageOf;
/** Export name -> the docs route that covers it (the first route wins), as the docs' RichText resolves `{@link Name}`. */
const routeFor = (n) => {
  if (!pageOf) {
    pageOf = new Map();
    for (const [route, names] of Object.entries(routeExportsWithSummaries().routes))
      for (const x of names) if (!pageOf.has(x)) pageOf.set(x, route);
  }
  return pageOf.get(n);
};

/**
 * Resolves `{@link X}` in a description: a link to X's docs route (`[`X`](/route)`) when X is a documented export, else X in code
 * font. On a `labels` row, the row's own XLabels / defaultXLabels point at the key table rendered under the props table.
 */
export function linkify(text, prop) {
  return text.replace(/\{@link\s+([^\s}|]+)(?:[\s|]+([^}]*))?\}/g, (_, n, label) => {
    const shown = (label ?? "").trim() || n;
    if (prop.labels && (n === prop.labels.type || n === prop.labels.const))
      return `\`${shown}\`${n === prop.labels.type ? " (every key is listed below the table)" : ""}`;
    const route = routeFor(n);
    return route ? `[\`${shown}\`](${route})` : `\`${shown}\``;
  });
}

/** Generic one-liners ("Text for i18n.", "Override the chart's strings (i18n).") that say nothing the sentence below does not. */
const GENERIC_LABELS_DOC =
  /^(?:text for i18n|every string, for translation|ui strings?(?: \(i18n\))?|any ui string(?: \(i18n\))?|override(?:s)? (?:the |any |for the )?[^."]*strings?\b[^."]*)\.?$/i;

/**
 * A labels row's description: the JSDoc's own sentence when it says something specific, then the standard sentence (what to pass,
 * the exported default it merges over and the key count), so no labels row is a bare "UI strings (i18n)." and a translator is
 * never left guessing the shape.
 */
export function labelsDescription(description, labels, prop = "labels") {
  const own = description.trim();
  const keep = own && !GENERIC_LABELS_DOC.test(own) ? `${own.replace(/([^.!?])$/, "$1.")} ` : "";
  const first = labels.keys[0]?.[0] ?? "key";
  const shape = labels.full
    ? `Spread \`${labels.const}\` and override single keys, e.g. \`${prop}={{ ...${labels.const}, ${first}: "…" }}\`.`
    : `Every other string, for translation: \`${prop}={{ ${first}: "…" }}\`; omitted keys keep the English of \`${labels.const}\`.`;
  const count =
    labels.keys.length === 1 ? "Its only key is" : `All ${labels.keys.length} keys of \`${labels.type}\` are`;
  return `${keep}${shape} ${count} listed in the key table under the props table.`;
}

/**
 * The props data as files: `component-props.ts` (a barrel of re-exports, so `import * as PROPS` + `PROPS.Tooltip` keeps working
 * and the bundler tree-shakes it) and one `props/<Name>.ts` per component. Returns { path: content }.
 */
export function renderFiles() {
  const data = extractProps();
  const names = Object.keys(data).sort();
  const barrel = [
    "// GENERATED by demo/scripts/gen-props.mjs from the TypeScript source of @sheenui/theme. Do not edit by hand:",
    "// change the prop's type, default or JSDoc in theme/src and run `pnpm docs:props` (`pnpm docs:check` fails when stale).",
    "// A barrel only: every component's rows live in props/<Name>.ts, so a docs route bundles just the tables it uses.",
    'import type { PropRow } from "../layout/Page";',
    "",
    "/** Props table rows of each public component: [name, type, default, description, required]. */",
    "export type GeneratedProps = readonly PropRow[];",
    "",
  ];
  const files = {};
  for (const name of names) {
    const rows = data[name].props.map((p) => {
      const described = p.defaultSource === "prose" ? stripProseDefault(p.description) : p.description;
      const text = linkify(cleanDescription(described, p.defaultSource ? undefined : p.default), p);
      const row = [
        p.name,
        p.type,
        p.default ?? "",
        p.labels ? labelsDescription(text, p.labels, p.name) : text,
        p.required,
      ];
      return p.labels ? [...row, p.labels] : row;
    });
    barrel.push(`export { ${name} } from "./props/${name}";`);
    files[join(PROPS_DIR, `${name}.ts`)] = [
      "// GENERATED by demo/scripts/gen-props.mjs (`pnpm docs:props`). Do not edit by hand.",
      'import type { GeneratedProps } from "../component-props";',
      "",
      `/** Props of \`${name}\` (theme/src/${data[name].file}). */`,
      `export const ${name}: GeneratedProps = ${JSON.stringify(rows)};`,
      "",
    ].join("\n");
  }
  barrel.push("");
  files[OUT] = barrel.join("\n");
  return files;
}

/** The install-path table (see extractInstallPaths), as a module the Code panel loads on demand. */
export function renderPaths() {
  return [
    "// GENERATED by demo/scripts/gen-props.mjs (`pnpm docs:props`). Do not edit by hand.",
    "/** Export name -> the theme/src file that declares it (no extension): the package entry, and the `@sheenui/theme/demo-data` entry. */",
    `const paths: { barrel: Record<string, string>; demoData: Record<string, string> } = ${JSON.stringify(extractInstallPaths())};`,
    "",
    "export default paths;",
    "",
  ].join("\n");
}

/** Every route path of the table (src/routes.ts and its parts), as the runtime `routes` array holds them. */
function allRoutePaths(demo) {
  const text = splitFiles(join(demo, "src", "routes.ts")).map((f) => stripComments(readFileSync(f, "utf8")));
  return text.flatMap((t) => [...t.matchAll(/\bpath:\s*(["'])(\/[^"']*)\1/g)].map((m) => m[2]));
}

/** @returns {string} hex digits, one bit per sorted route path, 1 when the path is in `members` */
export function alsoMask(paths, members) {
  const sorted = [...new Set(paths)].sort();
  const bits = sorted.map((p) => (members.includes(p) ? 1 : 0));
  while (bits.length % 4) bits.push(0);
  let hex = "";
  for (let i = 0; i < bits.length; i += 4)
    hex += (bits[i] * 8 + bits[i + 1] * 4 + bits[i + 2] * 2 + bits[i + 3]).toString(16);
  return hex;
}

/**
 * The "The examples also use" data of "Files to copy": for each route whose examples need more than the page's own
 * `source`, the files, registry items and packages on top of it. Returns { path: content } for the data module (loaded
 * lazily, only by those pages) and the small list of their routes (what every page checks first).
 */
export function renderAlsoUses() {
  const byName = new Map();
  for (const [file, names] of Object.entries(extractExportFiles())) for (const n of names) byName.set(n, file);
  const demo = join(dirname(OUT), "../..");
  const { graph } = scanThemeDeps(join(demo, "../theme/src"), join(demo, "../registry.json"));
  const modules = routeModules(join(demo, "src", "routes.ts"));
  const data = {};
  for (const [path, names] of [...routeSampleNames(demo)].sort(([a], [b]) => a.localeCompare(b))) {
    const route = modules.get(path);
    const page = resolvePageModule(demo, route.module, route.exportName);
    const sources = pageSources(page.text, page.exportName, page.consts);
    // The panel only exists on pages whose source is a component, chart or block.
    if (!sources.some((s) => /^theme\/src\/(components|blocks)\//.test(s))) continue;
    const samples = names.flatMap((n) => {
      const file = graph.f.find((f) => f.replace(/\.tsx?$/, "") === byName.get(n));
      return file ? [`theme/src/${file}`] : [];
    });
    const { also } = resolveCopyList(graph, sources, samples);
    if (also.units.length || also.items.length || also.packages.length) data[path] = also;
  }
  const header = "// GENERATED by demo/scripts/gen-props.mjs (`pnpm docs:props`). Do not edit by hand.";
  return {
    [ALSO_OUT]: [
      header,
      "/** Route -> what its examples use besides the page's own item: files (folded to folders), registry items, npm packages. */",
      `const also: Record<string, { units: string[]; items: string[]; packages: string[] }> = ${JSON.stringify(data)};`,
      "",
      "export default also;",
      "",
    ].join("\n"),
    [ALSO_ROUTES_OUT]: [
      header,
      "/**",
      " * Which routes have an entry in also-uses.ts, as a hex bit mask over the route paths sorted as strings (the first path is the",
      " * top bit of the first digit). Kept apart and tiny so a page without an entry never loads that module.",
      " */",
      `const mask = ${JSON.stringify(alsoMask(allRoutePaths(demo), Object.keys(data)))};`,
      "",
      "export default mask;",
      "",
    ].join("\n"),
  };
}

/** Route -> the components and hooks it documents (chips under the page title, and what the site search matches). */
export function renderExports() {
  const routes = routeExportsWithSummaries().routes;
  return [
    "// GENERATED by demo/scripts/gen-props.mjs (`pnpm docs:props`). Do not edit by hand.",
    "/** Docs route -> the public components and hooks whose JSDoc `@see` names it. */",
    "export const ROUTE_EXPORTS: Readonly<Record<string, readonly string[]>> = {",
    ...Object.entries(routes).map(([route, names]) => `  ${JSON.stringify(route)}: ${JSON.stringify(names)},`),
    "};",
    "",
  ].join("\n");
}

// BEGIN export summaries
/**
 * Export name -> the first JSDoc sentence, as its own module: the "All exports on this page" index imports it with a
 * dynamic import() (a separate chunk), so the summaries cost no initial JavaScript; the prerender waits for it, so the
 * static HTML carries them.
 */
export function renderSummaries() {
  const { routes, summaries } = routeExportsWithSummaries();
  const used = [...new Set(Object.values(routes).flat())].sort();
  const entries = used.map((name) => [name, cleanSummary(summaries[name])]);
  const files = {};
  const parts = [];
  // Chunked so no generated file nears the repo's max-lines limit; the barrel merges them.
  for (let i = 0, n = 0; i < entries.length; i += SUMMARY_CHUNK, n++) {
    const id = `SUMMARIES_${n + 1}`;
    parts.push(id);
    files[join(dirname(SUMMARIES_OUT), `export-summaries.${n + 1}.ts`)] = [
      "// GENERATED by demo/scripts/gen-props.mjs (`pnpm docs:props`). Do not edit by hand.",
      `export const ${id}: Readonly<Record<string, string>> = ${JSON.stringify(Object.fromEntries(entries.slice(i, i + SUMMARY_CHUNK)), null, 1)};`,
      "",
    ].join("\n");
  }
  files[SUMMARIES_OUT] = [
    "// GENERATED by demo/scripts/gen-props.mjs (`pnpm docs:props`). Do not edit by hand.",
    ...parts.map((id, i) => `import { ${id} } from "./export-summaries.${i + 1}";`),
    "/** Public export name -> the first sentence of its JSDoc (theme/src). Loaded lazily by the export index of a docs page. */",
    `export const EXPORT_SUMMARIES: Readonly<Record<string, string>> = { ${parts.map((id) => `...${id}`).join(", ")} };`,
    "",
  ].join("\n");
  return files;
}
// END export summaries

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = renderFiles();
  const nextPaths = renderPaths();
  const nextExports = renderExports();
  const alsoFiles = renderAlsoUses();
  const nextSummaries = renderSummaries();
  const staleSummaries = readdirSync(dirname(SUMMARIES_OUT))
    .filter((f) => /^export-summaries\.\d+\.ts$/.test(f))
    .map((f) => join(dirname(SUMMARIES_OUT), f))
    .filter((f) => !(f in nextSummaries));
  const stale = existsSync(PROPS_DIR)
    ? readdirSync(PROPS_DIR)
        .filter((f) => !f.startsWith("._")) // macOS AppleDouble metadata, not source
        .map((f) => join(PROPS_DIR, f))
        .filter((f) => !(f in files))
    : [];
  if (process.argv.includes("--check")) {
    const read = (f) => (existsSync(f) ? readFileSync(f, "utf8") : "");
    const differs = Object.entries(files).some(([f, text]) => read(f) !== text);
    if (
      differs ||
      stale.length > 0 ||
      read(PATHS_OUT) !== nextPaths ||
      read(EXPORTS_OUT) !== nextExports ||
      Object.entries(alsoFiles).some(([f, text]) => read(f) !== text) ||
      staleSummaries.length > 0 ||
      Object.entries(nextSummaries).some(([f, text]) => read(f) !== text)
    ) {
      console.error(
        "generated docs data is stale: run `pnpm docs:props` (demo/src/generated/component-props.ts, props/, install-paths.ts)",
      );
      process.exit(1);
    }
    console.log("generated docs data is up to date");
  } else {
    mkdirSync(PROPS_DIR, { recursive: true });
    for (const f of [...stale, ...staleSummaries]) rmSync(f);
    for (const [f, text] of Object.entries(alsoFiles)) writeFileSync(f, text);
    for (const [f, text] of Object.entries(files)) writeFileSync(f, text);
    writeFileSync(PATHS_OUT, nextPaths);
    writeFileSync(EXPORTS_OUT, nextExports);
    for (const [f, text] of Object.entries(nextSummaries)) writeFileSync(f, text);
    console.log(
      `wrote demo/src/generated/component-props.ts (barrel), props/ (${Object.keys(files).length - 1} files), install-paths.ts and route-exports.ts`,
    );
  }
}
