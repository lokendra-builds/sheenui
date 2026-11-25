// The copied-files form of a sample's imports, derived mechanically from the package form.
//
// The docs write every sample against the package barrel (`import { Button } from "@sheenui/theme"`), because that is what
// `pnpm pagecode:check` compiles. A reader who installed through the shadcn registry has no barrel: each name lives in the
// file the registry item copies to `@/components/sheenui/...`. The two forms are tied together here, once:
//
//   name --(demo/src/generated/install-paths.ts: the theme/src file that declares it)--> theme/src/<file>.ts(x)
//        --(registry.json: that file's real `target`)--> `@components/sheenui/<...>` --> `@/components/sheenui/<...>`
//
// Used by the prerender (the plain code copy in the static HTML), the Markdown twins, llms files and the checks, so the
// copied form can never drift from what the registry installs.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** Matches `import { A, type B } from "@sheenui/theme";` and the `/demo-data` entry (`import type { … }` too). */
export const PACKAGE_IMPORT = /import\s+(type\s+)?\{([^}]*)\}\s+from\s+"@sheenui\/theme(\/demo-data)?";?/g;

/** Label of the package form wherever both forms are shown. */
export const PACKAGE_NOTE = "Package build (after the first npm release, or a packed tarball)";

/**
 * @typedef {{
 *   barrel: Record<string, string>;
 *   demoData: Record<string, string>;
 *   targets: Set<string>;
 *   owner: Map<string, string>;
 *   deps: Map<string, string[]>;
 * }} InstallMap
 */

/** The registry item name in a `.../r/<name>.json` URL. */
const itemName = (url) => /\/r\/([\w-]+)\.json$/.exec(url)?.[1] ?? url;

/**
 * @param {string} [root]
 * @returns {InstallMap}
 */
export function loadInstallMap(root = ROOT) {
  const generated = readFileSync(join(root, "demo/src/generated/install-paths.ts"), "utf8");
  const table = JSON.parse(/=\s*(\{.*\});\s*$/m.exec(generated)?.[1] ?? "null");
  const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));
  /** theme/src file path -> installed module path, `@/components/sheenui/<...>` without the extension. */
  const installed = new Map();
  /** installed module path -> the registry item that installs it. */
  const owner = new Map();
  /** registry item -> the items it lists in `registryDependencies`. */
  const deps = new Map();
  for (const item of registry.items) {
    deps.set(item.name, (item.registryDependencies ?? []).map(itemName));
    for (const file of item.files ?? [])
      if (/^theme\/src\/.+\.tsx?$/.test(file.path) && /^@components\/sheenui\//.test(file.target ?? "")) {
        const target = file.target.replace(/^@components/, "@/components").replace(/\.tsx?$/, "");
        installed.set(file.path.replace(/\.tsx?$/, ""), target);
        owner.set(target, item.name);
      }
  }
  /** @param {Record<string, string>} names */
  const resolveAll = (names) => {
    const out = {};
    for (const [name, file] of Object.entries(names)) {
      const target = installed.get(`theme/src/${file}`);
      if (target) out[name] = target;
    }
    return out;
  };
  return {
    barrel: resolveAll(table.barrel),
    demoData: resolveAll(table.demoData),
    targets: new Set(installed.values()),
    owner,
    deps,
  };
}

/**
 * The item and everything it installs with it (its `registryDependencies`, transitively).
 * @param {InstallMap} map
 * @param {string} item
 * @returns {Set<string>}
 */
export function itemClosure(map, item) {
  const seen = new Set();
  const stack = [item];
  while (stack.length) {
    const name = stack.pop();
    if (seen.has(name)) continue;
    seen.add(name);
    stack.push(...(map.deps.get(name) ?? []));
  }
  return seen;
}

/**
 * The registry items a sample's package imports come from, minus the ones `installItem` already installs (with its
 * dependencies): what a reader must add besides the page's install command.
 * @param {string} code samples written against the package barrel (or already rewritten to the copied form)
 * @param {InstallMap} map
 * @param {string} installItem
 * @returns {string[]} sorted item names
 */
export function extraItems(code, map, installItem) {
  const have = itemClosure(map, installItem);
  const found = new Set();
  const { paths } = withCopiedImports(code, map);
  for (const path of paths) {
    const item = map.owner.get(path);
    if (item && !have.has(item)) found.add(item);
  }
  for (const m of code.matchAll(/from\s+"(@\/components\/sheenui\/[^"]+)"/g)) {
    const item = map.owner.get(m[1]);
    if (item && !have.has(item)) found.add(item);
  }
  return [...found].sort();
}

/**
 * The one line a page shows when its examples use items the install command does not add, or "" when there are none.
 * @param {string[]} items
 * @param {string} siteUrl
 * @param {"examples" | "example"} [subject]
 */
export function extrasLine(items, siteUrl, subject = "examples") {
  if (!items.length) return "";
  const urls = items.map((n) => `${siteUrl}/r/${n}.json`).join(" ");
  const names = items.join(", ");
  const lead = subject === "example" ? "This example also uses" : "These examples also use";
  return `${lead} ${names}: \`npx shadcn@latest add ${urls}\``;
}

/**
 * Inserts \`line\` as a comment under the last import of a sample (the copied imports and their package-form comments
 * stay above it). A sample with no import gets nothing.
 * @param {string} code
 * @param {string} line
 */
export function withNoteUnderImports(code, line) {
  if (!line) return code;
  const lines = code.split("\n");
  let last = -1;
  let i = 0;
  while (i < lines.length) {
    if (!/^import\b/.test(lines[i])) {
      i += 1;
      continue;
    }
    let end = i;
    while (end < lines.length - 1 && !/["'];?\s*$/.test(lines[end])) end += 1;
    last = end;
    i = end + 1;
    if (/^\/\/ Package build/.test(lines[i] ?? "")) {
      last = i;
      i += 1;
    }
  }
  if (last < 0) return code;
  lines.splice(last + 1, 0, `// ${line.replace(/`/g, "")}`);
  return lines.join("\n");
}

/**
 * Rewrites every package import of a code sample to the installed files, and keeps the package form as a comment under
 * it, so both are in the text: the copied-files import is the one to use today, the package one applies after the first
 * npm release or with a packed tarball. Names with no installed file stay on the package import.
 * @param {string} code
 * @param {InstallMap} map
 * @returns {{ code: string; unknown: string[]; paths: string[] }}
 */
export function withCopiedImports(code, map) {
  const unknown = [];
  const paths = [];
  const out = code.replace(PACKAGE_IMPORT, (whole, typeOnly, list, demo) => {
    const names = demo ? map.demoData : map.barrel;
    const byFile = new Map();
    const rest = [];
    for (const raw of list.split(",")) {
      const item = raw.trim();
      if (!item) continue;
      const name = item
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        .trim();
      const target = names[name];
      if (!target) {
        rest.push(item);
        unknown.push(name);
        continue;
      }
      byFile.set(target, [...(byFile.get(target) ?? []), item]);
    }
    const keyword = typeOnly ? "import type" : "import";
    const lines = [...byFile]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([target, items]) => {
        paths.push(target);
        return `${keyword} { ${items.join(", ")} } from "${target}";`;
      });
    if (rest.length) lines.push(`${keyword} { ${rest.join(", ")} } from "@sheenui/theme${demo ?? ""}";`);
    if (!byFile.size) return whole;
    const pkg = `${keyword} { ${list
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ")} } from "@sheenui/theme${demo ?? ""}";`;
    return `${lines.join("\n")}\n// ${PACKAGE_NOTE}: ${pkg}`;
  });
  return { code: out, unknown, paths };
}
