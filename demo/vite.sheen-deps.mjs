// Vite plugin: `import deps from "virtual:sheen-deps"`.
//
// Scans theme/src at dev/build time and returns its import graph (file -> direct local imports and
// npm packages, plus the shadcn registry item that owns each file). The docs' "Files to copy" panel
// folds it into the exact transitive closure of a page's source files (see sheen-closure.mjs), so it
// can never drift from the real import graph. Plain JS (with a .d.mts beside it) so the demo's
// typecheck doesn't need @types/node.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ID = "virtual:sheen-deps";
const RESOLVED = "\0" + ID;
const EXTENSIONS = [".ts", ".tsx"];
/** Every app already has these; listing them would be noise. */
const IGNORED_PACKAGES = new Set(["react", "react-dom"]);
const IMPORT_RE =
  /(?:^|[\s;])(?:import|export)\s+(?:type\s+)?(?:[^'"`;]*?\sfrom\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const name of readdirSync(dir).filter((n) => !n.startsWith("._"))) {
    // macOS AppleDouble metadata, not source
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (EXTENSIONS.some((ext) => name.endsWith(ext)) && !name.endsWith(".d.ts") && !/\.(test|spec)\./.test(name))
      out.push(full);
  }
  return out;
}

/** @param {string} from @param {string} spec */
function resolveLocal(from, spec) {
  const base = resolve(dirname(from), spec);
  const candidates = [base, ...EXTENSIONS.map((e) => base + e), ...EXTENSIONS.map((e) => join(base, "index" + e))];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
}

/** "@base-ui/react/tabs" → "@base-ui/react", "motion/react" → "motion". */
function packageName(spec) {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/** @param {string} root absolute path of theme/src @param {string} [registryFile] registry.json (file -> shadcn item) */
export function scanThemeDeps(root, registryFile) {
  const files = walk(root).sort();
  const toRel = (abs) => relative(root, abs).split(sep).join("/");
  const index = new Map(files.map((f, i) => [f, i]));
  const pn = [];
  const pkgIndex = new Map();
  const e = [];
  const p = [];
  for (const file of files) {
    // Block comments are dropped first: JSDoc `@example` blocks contain `import … from "@sheenui/theme"`
    // lines that are documentation, not real dependencies.
    const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const local = new Set();
    const packages = new Set();
    for (const match of source.matchAll(IMPORT_RE)) {
      const spec = match[1] ?? match[2];
      if (!spec) continue;
      if (spec.startsWith(".")) {
        const target = resolveLocal(file, spec);
        if (target && index.has(target)) local.add(index.get(target));
      } else {
        const name = packageName(spec);
        if (IGNORED_PACKAGES.has(name)) continue;
        if (!pkgIndex.has(name)) pkgIndex.set(name, pn.push(name) - 1);
        packages.add(pkgIndex.get(name));
      }
    }
    e.push([...local].sort((a, b) => a - b));
    p.push([...packages].sort((a, b) => a - b));
  }

  // Registry item per file, from registry.json (written by `pnpm registry:build`), so the page can print the shadcn command.
  const itemNames = [];
  const itemIndex = new Map();
  const rd = {};
  const owner = new Map();
  if (registryFile && existsSync(registryFile)) {
    const registry = JSON.parse(readFileSync(registryFile, "utf8"));
    for (const item of registry.items ?? []) {
      itemIndex.set(item.name, itemNames.push(item.name) - 1);
      const deps = (item.registryDependencies ?? [])
        .map((u) => u.replace(/^.*\//, "").replace(/\.json$/, ""))
        .filter((d) => d !== "sheenui-theme");
      if (deps.length) rd[item.name] = deps;
      for (const f of item.files ?? []) owner.set(String(f.path).replace(/^theme\/src\//, ""), item.name);
    }
  }
  const i = files.map((f) => (owner.has(toRel(f)) ? itemIndex.get(owner.get(toRel(f))) : -1));
  return { files, graph: { f: files.map(toRel), e, p, pn, i, in: itemNames, rd } };
}

/** @param {string} [themeSrc] absolute path of theme/src (defaults to ../theme/src next to this file) */
export function sheenDeps(
  themeSrc = fileURLToPath(new URL("../theme/src", import.meta.url)),
  registryFile = fileURLToPath(new URL("../registry.json", import.meta.url)),
) {
  return {
    name: "sheen-deps",
    resolveId(id) {
      return id === ID ? RESOLVED : undefined;
    },
    load(id) {
      if (id !== RESOLVED) return undefined;
      const { files, graph } = scanThemeDeps(themeSrc, registryFile);
      if (existsSync(registryFile)) this.addWatchFile(registryFile);
      // Re-run when any theme file changes, so the panel follows the real imports.
      for (const file of files) this.addWatchFile(file);
      return `export default ${JSON.stringify(graph)};`;
    },
  };
}
