// Reads src/routes.ts (and the per-group tables in src/routes/) as text: which page module and export each
// route uses. No TypeScript evaluation needed, so the build scripts stay plain Node.

import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

import { splitFiles, stripComments } from "./split-source.mjs";

/**
 * @param {string} routesFile absolute path of src/routes.ts
 * @returns {Map<string, { module: string; exportName: string }>} route path → "src/pages/X.tsx" + export
 */
export function routeModules(routesFile) {
  const demo = dirname(dirname(routesFile));
  const files = splitFiles(routesFile).map((file) => ({ file, source: stripComments(readFileSync(file, "utf8")) }));
  /** A page specifier relative to its file ("../pages/X" in src/routes/) → "src/pages/X.tsx". */
  const moduleOf = (file, spec) =>
    relative(demo, resolve(dirname(file), spec))
      .split("\\")
      .join("/")
      .replace(/(\.tsx?)?$/, ".tsx");
  /** @type {Record<string, string>} const name → module path, across every file (a loader may live in the one next to it) */
  const consts = {};
  for (const { file, source } of files)
    for (const m of source.matchAll(/const\s+(\w+)\s*=\s*\(\)\s*=>\s*import\((["'])([^"']+)\2\)/g))
      consts[`${file}:${m[1]}`] = moduleOf(file, m[3]);

  const out = new Map();
  const routeRe =
    /path:\s*(["'])([^"']+)\1[\s\S]*?lazyPage\(\s*(?:\(\)\s*=>\s*import\((["'])([^"']+)\3\)|(\w+))\s*,\s*\(m\)\s*=>\s*m\.(\w+)/g;
  for (const { file, source } of files) {
    for (const m of source.matchAll(routeRe)) {
      const module = m[4] ? moduleOf(file, m[4]) : consts[`${file}:${m[5]}`];
      if (!module) continue;
      out.set(m[2], { module, exportName: m[6] });
    }
  }
  return out;
}

/**
 * The first example's code inside one page component (`code={\`…\`}` or `code={NAME}` with
 * `const NAME = \`…\`` nearby), for llms-full.txt.
 * @param {string} pageSource the module's text
 * @param {string} exportName e.g. "GlassCardPage"
 */
export function firstExample(pageSource, exportName) {
  const start = pageSource.indexOf(`export function ${exportName}(`);
  if (start < 0) return null;
  const nextExport = pageSource.indexOf("\nexport function ", start + 1);
  const body = pageSource.slice(start, nextExport < 0 ? undefined : nextExport);
  const inline = body.match(/code=\{`([\s\S]*?)`\}/);
  if (inline) return inline[1].trim();
  const named = body.match(/code=\{(\w+)\}/);
  if (named) {
    const def = pageSource.match(new RegExp(`const\\s+${named[1]}\\s*=\\s*\`([\\s\\S]*?)\`;`));
    if (def) return def[1].trim();
  }
  return null;
}

/** The `source=` prop(s) of a page component: repo-relative paths it documents (module-level `const X = "…"` prefixes resolved). */
export function pageSources(pageSource, exportName, importedConsts = {}) {
  const start = pageSource.indexOf(`export function ${exportName}(`);
  if (start < 0) return [];
  const nextExport = pageSource.indexOf("\nexport function ", start + 1);
  const body = pageSource.slice(start, nextExport < 0 ? undefined : nextExport);
  const m = body.match(/\bsource=(?:"([^"]+)"|\{?`([^`]+)`\}?|\{"([^"]+)"\}|\{\[([^\]]+)\]\})/);
  if (!m) return [];
  const consts = {
    ...importedConsts,
    ...Object.fromEntries(
      [...pageSource.matchAll(/^(?:export\s+)?const\s+(\w+)\s*=\s*"([^"]*)";/gm)].map((x) => [x[1], x[2]]),
    ),
  };
  const fill = (str) => str.replace(/\$\{(\w+)\}/g, (_, name) => consts[name] ?? "");
  if (m[1] || m[2] || m[3]) return [fill(m[1] ?? m[2] ?? m[3])];
  return [...m[4].matchAll(/"([^"]+)"|`([^`]+)`/g)].map((x) => fill(x[1] ?? x[2]));
}

/**
 * Follows lazy wrappers to the module that really renders the page: `export const X = lazyBlock(() =>
 * import("./XBody").then((m) => m.Inner), …)` (also `lazy(...)`/`lazyPage(...)`, with `default` for a default
 * export) resolves to XBody's `Inner`, recursively (cycle-guarded). A module that defines `export function X(`
 * is final.
 * @param {string} demoDir absolute path of demo/
 * @param {string} module "src/pages/X.tsx"
 * @param {string} exportName
 * @returns {{ module: string; exportName: string; text: string; consts: Record<string, string> }} text is "" when the file is missing
 */
export function resolvePageModule(demoDir, module, exportName) {
  const seen = new Set();
  const read = (m) => (existsSync(resolve(demoDir, m)) ? readFileSync(resolve(demoDir, m), "utf8") : "");
  const find = (from, spec) => {
    const base = relative(demoDir, resolve(dirname(resolve(demoDir, from)), spec))
      .split("\\")
      .join("/");
    return [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, base].find(
      (c) => /\.tsx?$/.test(c) && existsSync(resolve(demoDir, c)),
    );
  };
  let text = read(module);
  for (;;) {
    const key = `${module}#${exportName}`;
    if (seen.has(key) || text.includes(`export function ${exportName}(`)) break;
    seen.add(key);
    const m = stripComments(text).match(
      new RegExp(
        `export\\s+const\\s+${exportName}\\b[^=]*=\\s*(?:lazyBlock|lazyPage|lazy)\\(\\s*\\(\\)\\s*=>\\s*import\\((["'])([^"']+)\\1\\)(?:\\s*\\.then\\(\\s*\\(?\\w+\\)?\\s*=>\\s*\\w+\\.(\\w+))?`,
      ),
    );
    if (!m) break;
    const next = find(module, m[2]);
    if (!next) break;
    module = next;
    exportName = m[3] ?? "default";
    text = read(module);
  }
  return { module, exportName, text, consts: importedStringConsts(demoDir, module, text) };
}

/** String consts a page imports from relative modules (`import { CHARTS } from "./shared"` → its `export const CHARTS = "…"`). */
function importedStringConsts(demoDir, module, text) {
  const out = {};
  for (const m of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*(["'])(\.[^"']*)\2/g)) {
    const base = relative(demoDir, resolve(dirname(resolve(demoDir, module)), m[3]))
      .split("\\")
      .join("/");
    const file = [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find((c) =>
      existsSync(resolve(demoDir, c)),
    );
    if (!file) continue;
    const src = readFileSync(resolve(demoDir, file), "utf8");
    for (const name of m[1].split(",").map((n) =>
      n
        .trim()
        .split(/\s+as\s+/)
        .pop(),
    )) {
      const d = name && src.match(new RegExp(`export\\s+const\\s+${name}\\s*=\\s*"([^"]*)";`));
      if (d) out[name] = d[1];
    }
  }
  return out;
}
