// Which components a docs page's code samples import besides the one the page documents ("The examples also use" in
// "Files to copy"). Read from the page's source as text: the page function, the module-level constants and components it
// names, and the modules its lazy islands import. Only the `import { … } from "@sheenui/theme"` lines inside those
// declarations count, and a declaration never contains the file's own imports, so a demo's real imports are not samples.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { resolvePageModule, routeModules } from "./routes-source.mjs";

const DECLARATION = /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|const|let|class)\s+(\w+)/gm;
const SAMPLE_IMPORT = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"@sheenui\/theme";?/g;

/** The text with the inside of every template literal blanked (same length), so a sample's own `export function Example` is not a declaration. */
function maskTemplates(source) {
  let out = "";
  const stack = []; // brace depth of each open `${` inside a template
  let inTemplate = false;
  let depth = 0;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (inTemplate) {
      if (c === "\\") {
        out += "  ";
        i++;
      } else if (c === "`") {
        inTemplate = false;
        out += c;
      } else if (c === "$" && source[i + 1] === "{") {
        stack.push(depth);
        depth = 0;
        inTemplate = false;
        out += "${";
        i++;
      } else out += c === "\n" ? "\n" : " ";
    } else {
      if (c === "`") inTemplate = true;
      else if (c === "{") depth++;
      else if (c === "}") {
        if (depth === 0 && stack.length) {
          depth = stack.pop();
          inTemplate = true;
        } else depth--;
      }
      out += c;
    }
  }
  return out;
}

/** @returns {Map<string, string>} top-level declaration name -> its text, for one module's source */
export function declarations(source) {
  const masked = maskTemplates(source);
  const marks = [...masked.matchAll(DECLARATION)].map((m) => ({ name: m[1], at: m.index }));
  return new Map(marks.map((m, i) => [m.name, source.slice(m.at, marks[i + 1]?.at ?? source.length)]));
}

/** The relative module a name is imported from (`import { A, B as C } from "./x"`), as an absolute file or undefined. */
function importedFrom(file, source, name) {
  for (const m of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*(["'])(\.[^"']*)\2/g)) {
    const names = m[1].split(",").map((n) =>
      n
        .trim()
        .split(/\s+as\s+/)
        .pop(),
    );
    if (names.includes(name)) return resolveModule(file, m[3]);
  }
  return undefined;
}

function resolveModule(from, spec) {
  const base = resolve(dirname(from), spec);
  return [`${base}.tsx`, `${base}.ts`, join(base, "index.tsx"), join(base, "index.ts")].find((f) => existsSync(f));
}

/**
 * Names (exports of `@sheenui/theme`) that the samples reachable from `exportName` of `file` import.
 * @param {string} file absolute path of the page module
 * @param {string} exportName
 * @returns {Set<string>}
 */
export function sampleNames(file, exportName) {
  const names = new Set();
  const seen = new Set();
  const sources = new Map();
  const read = (f) => {
    if (!sources.has(f)) {
      // Block comments that start a line and `//` lines are dropped; a bare `/*` inside a string (`accept="image/*"`) is not a comment.
      const text = readFileSync(f, "utf8")
        .replace(/^[ \t]*\/\*[\s\S]*?\*\//gm, "")
        .replace(/^[ \t]*\/\/.*$/gm, "");
      sources.set(f, { text, decls: declarations(text) });
    }
    return sources.get(f);
  };
  const visit = (f, name) => {
    const key = `${f}#${name}`;
    if (seen.has(key)) return;
    seen.add(key);
    const { text, decls } = read(f);
    const body = decls.get(name);
    if (!body) return;
    for (const m of body.matchAll(SAMPLE_IMPORT))
      for (const raw of m[1].split(",")) {
        const n = raw
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0];
        if (n && !raw.trim().startsWith("type ")) names.add(n);
      }
    // A lazy island: `import("./X").then((m) => m.Foo)` inside the declaration.
    for (const m of body.matchAll(/import\((["'])(\.[^"']+)\1\)(?:\s*\.then\(\s*\(?\w+\)?\s*=>\s*\w+\.(\w+))?/g)) {
      const target = resolveModule(f, m[2]);
      if (target && m[3]) visit(target, m[3]);
    }
    for (const id of new Set(body.match(/\b[A-Za-z_]\w*\b/g) ?? [])) {
      if (id === name) continue;
      if (decls.has(id)) visit(f, id);
      else {
        const from = importedFrom(f, text, id);
        if (from) visit(from, id);
      }
    }
  };
  visit(file, exportName);
  return names;
}

/**
 * Route path -> the export names its samples import.
 * @param {string} demoDir absolute path of demo/
 * @returns {Map<string, string[]>}
 */
export function routeSampleNames(demoDir) {
  const out = new Map();
  for (const [path, { module, exportName }] of routeModules(join(demoDir, "src", "routes.ts"))) {
    const page = resolvePageModule(demoDir, module, exportName);
    if (!page.text) continue;
    const names = sampleNames(resolve(demoDir, page.module), page.exportName);
    if (names.size) out.set(path, [...names].sort());
  }
  return out;
}
