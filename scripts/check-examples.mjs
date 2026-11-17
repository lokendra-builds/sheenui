// Type-checks every `@example` code block in the JSDoc of theme/src (the blocks AI tools and readers copy from).
//
//   node scripts/check-examples.mjs            check all; exit 1 when an example does not compile
//   node scripts/check-examples.mjs --list     print every example and its result
//
// Each ```tsx block becomes a virtual module next to theme/src, so `import ... from "@sheenui/theme"` resolves to
// the real sources and a wrong prop name or variant is a type error. A block that does not import from the package
// is wrapped in a function body (JSX in a fragment) so loose snippets are checked too. In --strict mode `@internal` examples
// are compiled as well (next to their own source file, importing it by relative path); without it they and relative-import blocks are skipped.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

import { readSplitSource } from "../demo/scripts/lib/split-source.mjs";
import { withoutAppleDouble } from "./lib/fs-filter.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "theme");
const SRC = join(THEME, "src");
const list = process.argv.includes("--list");
// --strict: the bar for the JSDoc examples AI tools and readers copy verbatim. Each block is compiled as written: no
// wrapping of loose JSX, no tolerated "snippet" errors, no skipped relative imports. It must import from
// "@sheenui/theme", declare a component or function, and type-check. Without it, loose snippets are tolerated.
const strict = process.argv.includes("--strict");

function walk(dir) {
  const out = [];
  for (const name of withoutAppleDouble(readdirSync(dir))) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) out.push(...walk(abs));
    else if (/\.(ts|tsx)$/.test(name)) out.push(abs);
  }
  return out;
}

/** Every `@example` fenced block of a file, with the line it starts on and whether its doc comment is `@internal`. */
function extract(file) {
  const text = readFileSync(file, "utf8");
  const found = [];
  const comment = /\/\*\*[\s\S]*?\*\//g;
  for (let m = comment.exec(text); m; m = comment.exec(text)) {
    if (!m[0].includes("@example")) continue;
    const internal = /@internal/.test(m[0]);
    const body = m[0].split("\n").map((l) => l.replace(/^\s*\/?\*+\/?\s?/, ""));
    const fence = /```(?:tsx|ts|jsx)?\n([\s\S]*?)```/g;
    const joined = body.join("\n");
    for (let f = fence.exec(joined); f; f = fence.exec(joined)) {
      const first = f[1].split("\n").find((l) => l.trim()) ?? "";
      const at = text.indexOf(first.trim(), m.index);
      const line = text.slice(0, at < 0 ? m.index : at).split("\n").length;
      found.push({ file, line, code: f[1], internal });
    }
  }
  return found;
}

const examples = walk(SRC)
  .flatMap(extract)
  .filter((e) => strict || (!e.internal && !/from "\.{1,2}\//.test(e.code)));
const virtual = new Map();
examples.forEach((e, i) => {
  const hasImport = /^\s*import /m.test(e.code);
  const jsx = e.code.trimStart().startsWith("<");
  const wrapped = jsx ? `  return (\n    <>\n${e.code}\n    </>\n  );` : e.code;
  const code = hasImport || strict ? e.code : `import "@sheenui/theme";\nexport function Example() {\n${wrapped}\n}\n`;
  // An @internal example imports its own module by relative path, so it is compiled next to its source file.
  const name = join(e.internal ? dirname(e.file) : SRC, `__example_${i}.tsx`);
  virtual.set(name, hasImport || strict ? `${code}\nexport {};\n` : code);
  e.virtual = name;
});

const config = ts.getParsedCommandLineOfConfigFile(
  join(THEME, "tsconfig.json"),
  {},
  { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
);
const options = { ...config.options, noEmit: true, noUnusedLocals: false, noUnusedParameters: false };
const host = ts.createCompilerHost(options);
const readFile = host.readFile.bind(host);
const fileExists = host.fileExists.bind(host);
const getSourceFile = host.getSourceFile.bind(host);
host.fileExists = (f) => virtual.has(f) || fileExists(f);
host.readFile = (f) => virtual.get(f) ?? readFile(f);
host.getSourceFile = (f, lang, onError, shouldCreate) =>
  virtual.has(f)
    ? ts.createSourceFile(f, virtual.get(f), lang, true, ts.ScriptKind.TSX)
    : getSourceFile(f, lang, onError, shouldCreate);
const program = ts.createProgram({
  rootNames: [...config.fileNames.filter((f) => f.endsWith("index.ts") && f.startsWith(SRC)), ...virtual.keys()],
  options,
  host,
});

// A snippet that shows only part of a program ("Cannot find name 'items'", a loose statement, an implicit any on a
// callback parameter whose type comes from context that is not shown) is tolerated. Everything else is a real error:
// an unknown prop, a wrong variant, a missing required prop, a name the package does not export.
const SNIPPET_CODES = strict
  ? new Set()
  : new Set([2304, 2657, 17014, 1382, 1381, 1005, 1003, 1109, 1128, 1434, 7006, 7031, 2552, 2503]);

/** Statements of an example that run at module scope and call a hook or are bare JSX. */
function moduleScopeProblems(sf) {
  const found = [];
  const scan = (node, top) => {
    if (ts.isFunctionLike(node) || ts.isClassLike(node)) return; // hooks and JSX inside components are fine
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node))
      found.push(
        `JSX at module scope: \`${node.getText().slice(0, 40).replace(/\s+/g, " ")}…\` (wrap it in a component)`,
      );
    else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && /^use[A-Z]/.test(node.expression.text))
      found.push(`hook \`${node.expression.text}()\` called at module scope (call it inside a component)`);
    else ts.forEachChild(node, (child) => scan(child, top));
  };
  for (const stmt of sf.statements) {
    if (
      ts.isImportDeclaration(stmt) ||
      ts.isExportDeclaration(stmt) ||
      ts.isFunctionDeclaration(stmt) ||
      ts.isTypeAliasDeclaration(stmt) ||
      ts.isInterfaceDeclaration(stmt)
    )
      continue;
    scan(stmt, true);
  }
  return found;
}

let failed = 0;
let partial = 0;
for (const e of examples) {
  const sf = program.getSourceFile(e.virtual);
  const all = [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)];
  const diagnostics = all.filter((d) => !SNIPPET_CODES.has(d.code));
  if (strict) {
    // Pasted as written, an example must not run hooks or build JSX at module scope (Rules of Hooks, invalid outside React).
    for (const problem of moduleScopeProblems(sf))
      diagnostics.push({ code: 0, messageText: problem, file: sf, start: 0 });
  }
  if (strict && !e.internal && /from "\.{1,2}\//.test(e.code))
    diagnostics.push({
      code: 0,
      messageText: 'imports an internal relative path; import from "@sheenui/theme"',
      file: sf,
      start: 0,
    });
  if (strict && !e.internal && !/from "@sheenui\/theme"/.test(e.code))
    diagnostics.push({ code: 0, messageText: 'must import from "@sheenui/theme"', file: sf, start: 0 });
  if (all.length && !diagnostics.length) partial += 1;
  if (list) console.log(`${relative(ROOT, e.file)}:${e.line} ${diagnostics.length ? "FAIL" : "ok"}`);
  if (!diagnostics.length) continue;
  failed += 1;
  for (const d of diagnostics.slice(0, list ? 99 : 2)) {
    console.error(
      `${relative(ROOT, e.file)}:${e.line}: TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, " ").slice(0, 220)}`,
    );
  }
}
// Every `@see /route` in theme/src must be a real docs route (demo/src/routes.ts).
const routes = new Set(
  [...readSplitSource(join(ROOT, "demo/src/routes.ts")).matchAll(/path: "([^"]+)"/g)].map((m) => m[1]),
);
let brokenSee = 0;
for (const file of walk(SRC)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const m = /@see\s+(\S+)/.exec(line);
    if (!m) return;
    const target = m[1].replace(/[#?].*$/, "");
    if (!target.startsWith("/") || !routes.has(target)) {
      brokenSee += 1;
      console.error(`${relative(ROOT, file)}:${i + 1}: @see ${m[1]} is not a docs route`);
    }
  });
}
failed += brokenSee;
// theme/src is copied into users' apps and published: its comments may not cite planning files the public repo does not ship.
let citations = 0;
for (const file of [
  ...walk(SRC),
  ...withoutAppleDouble(readdirSync(join(SRC, "styles")))
    .filter((f) => f.endsWith(".css"))
    .map((f) => join(SRC, "styles", f)),
]) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const m = /\b(?!README\b)[A-Z]{3,}\.md\b/.exec(line);
      if (!m) return;
      citations += 1;
      console.error(
        `${relative(ROOT, file)}:${i + 1}: cites ${m[0]}, which the public repo does not ship (state the rule itself or link the docs site)`,
      );
    });
}
failed += citations;
console.log(
  `check-examples${strict ? " --strict" : ""}: ${examples.length} examples, ${failed} failing, ${partial} partial snippets tolerated`,
);
process.exit(failed ? 1 : 0);
