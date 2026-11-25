// Type-checks every code sample the docs show in a Code panel: the `code` of each <Example> / <StatesExample> in
// demo/src/pages (template strings, constants and small functions of a status are resolved from the source).
//
//   node scripts/check-page-code.mjs           check all; exit 1 when a sample does not compile as written
//   node scripts/check-page-code.mjs --list    print every sample and its result
//   node scripts/check-page-code.mjs --only ChartsStackedPie  only the page files whose name contains this
//
// Each sample is a virtual module beside theme/src, so `@sheenui/theme` resolves to the real exports and a wrong prop,
// variant or missing import is a type error. Samples must import from "@sheenui/theme" (or "@sheenui/theme/demo-data"),
// declare what they use, and must not use docs-site helpers.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { withoutAppleDouble } from "./lib/fs-filter.mjs";
import { loadInstallMap, withCopiedImports } from "./lib/install-imports.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "theme");
const SRC = join(THEME, "src");
const PAGES = join(ROOT, "demo/src/pages");
const list = process.argv.includes("--list");
const STATUS_SAMPLE = "loading";

/**
 * How many lists the live preview of an example builds by mapping over data (`.map(`). A sample with none, next to a
 * preview of a dozen rows, is an abridgement (two literal rows), not the code that renders.
 */
function previewShape(element) {
  const tags = new Set();
  let maps = 0;
  const walk = (n) => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) tags.add(n.tagName.getText().split(".")[0]);
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === "map")
      maps += 1;
    ts.forEachChild(n, walk);
  };
  for (const child of element.children) walk(child);
  return { tags: [...tags], maps };
}

/** Samples of one page file. */
function extract(file) {
  const text = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const consts = new Map();
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const d of stmt.declarationList.declarations)
      if (ts.isIdentifier(d.name) && d.initializer) consts.set(d.name.text, d.initializer);
  }
  // Code strings a page imports from a sibling module (for example `./PrimitiveShowcases`) resolve like local constants.
  for (const stmt of sf.statements) {
    if (
      !ts.isImportDeclaration(stmt) ||
      !ts.isStringLiteral(stmt.moduleSpecifier) ||
      !stmt.moduleSpecifier.text.startsWith(".")
    )
      continue;
    const base = resolve(dirname(file), stmt.moduleSpecifier.text);
    const target = [".tsx", ".ts"].map((e) => base + e).find((f) => existsSync(f));
    const bindings = stmt.importClause?.namedBindings;
    if (!target || !bindings || !ts.isNamedImports(bindings)) continue;
    const other = ts.createSourceFile(
      target,
      readFileSync(target, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const theirs = new Map();
    for (const st of other.statements)
      if (ts.isVariableStatement(st))
        for (const d of st.declarationList.declarations)
          if (ts.isIdentifier(d.name) && d.initializer) theirs.set(d.name.text, d.initializer);
    for (const el of bindings.elements) {
      const init = theirs.get((el.propertyName ?? el.name).text);
      if (
        init &&
        (ts.isNoSubstitutionTemplateLiteral(init) ||
          ts.isStringLiteral(init) ||
          ts.isTemplateExpression(init) ||
          ts.isArrowFunction(init)) &&
        !consts.has(el.name.text)
      )
        consts.set(el.name.text, init);
    }
  }
  const found = [];
  const lineOf = (n) => sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
  /** Evaluates a template/string/arrow-of-a-status; null when it needs anything else. */
  const evaluate = (node, depth = 0) => {
    if (depth > 4) return null;
    if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node)) return node.text;
    if (ts.isIdentifier(node)) {
      const init = consts.get(node.text);
      return init ? evaluate(init, depth + 1) : null;
    }
    if (ts.isTemplateExpression(node) || ts.isArrowFunction(node) || ts.isCallExpression(node)) {
      try {
        const fnSource = (n) => n.getText();
        let src = fnSource(node);
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
          const init = consts.get(node.expression.text);
          if (!init) return null;
          src = `(${fnSource(init)})(${node.arguments.map((a) => JSON.stringify(STATUS_SAMPLE) && (ts.isIdentifier(a) ? JSON.stringify(STATUS_SAMPLE) : a.getText())).join(",")})`;
        } else if (ts.isArrowFunction(node)) {
          src = `(${src})(${JSON.stringify(STATUS_SAMPLE)})`;
        }
        const names = [...consts.keys()].filter((k) => new RegExp(`\\b${k}\\b`).test(src));
        const values = names.map((k) => evaluate(consts.get(k), depth + 1));
        if (values.some((v) => v === null)) return null;
        return new Function(...names, `return ${src};`)(...values);
      } catch {
        return null;
      }
    }
    return null;
  };
  const visit = (n) => {
    if (
      ts.isJsxAttribute(n) &&
      n.name.getText() === "code" &&
      n.initializer &&
      ts.isJsxExpression(n.initializer) &&
      n.initializer.expression
    ) {
      const tag = n.parent.parent.tagName?.getText();
      if (tag === "Example" || tag === "StatesExample") {
        const code = evaluate(n.initializer.expression);
        const element = n.parent.parent.parent;
        found.push({
          file,
          line: lineOf(n),
          code: typeof code === "string" ? code.trim() : null,
          shape: ts.isJsxElement(element) ? previewShape(element) : { tags: [], maps: 0 },
        });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

/**
 * Examples whose sample still writes literal rows where the preview maps over data, as a count per page file
 * (scripts/page-code-abridged.json). A ratchet: the count of a file may only go down, and a file not listed may have none.
 */
const abridged = new Map();
const baseline = JSON.parse(readFileSync(join(ROOT, "scripts/page-code-abridged.json"), "utf8"));
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : "";
/** Every .tsx file under `dir`, as paths relative to it (the page files and the folders of their split-out demos). */
const pageFiles = (dir, prefix = "") =>
  withoutAppleDouble(readdirSync(join(dir, prefix), { withFileTypes: true })).flatMap((entry) =>
    entry.isDirectory() ? pageFiles(dir, join(prefix, entry.name)) : [join(prefix, entry.name)],
  );
const samples = pageFiles(PAGES)
  .filter((f) => f.endsWith(".tsx") && f.includes(only))
  .flatMap((f) => extract(join(PAGES, f)));
const virtual = new Map();
/**
 * Third-party packages the samples import (the docs show them next to SheenUI, but they are the reader's own
 * dependencies): declared here from the names the samples import, so a typo in a SheenUI import still fails.
 */
const AMBIENT = {
  "lucide-react": (names) =>
    `import type { ComponentType, SVGProps } from "react";\nexport type LucideProps = SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string };\n${names.map((n) => `export const ${n}: ComponentType<LucideProps>;`).join("\n")}`,
};
AMBIENT["react-router"] = (names) =>
  `import type { AnchorHTMLAttributes, ComponentType } from "react";\n${names.map((n) => (n === "Link" ? "export const Link: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>;" : `export const ${n}: (...args: never[]) => unknown;`)).join("\n")}`;
const ambientDecls = [];
for (const [pkg, make] of Object.entries(AMBIENT)) {
  const names = new Set();
  for (const s of samples)
    for (const m of (s.code ?? "").matchAll(new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*"${pkg}"`, "g")))
      for (const raw of m[1].split(","))
        if (raw.trim())
          names.add(
            raw
              .trim()
              .replace(/^type\s+/, "")
              .split(/\s+as\s+/)[0],
          );
  if (names.size) ambientDecls.push(`declare module "${pkg}" {\n${make([...names])}\n}`);
}
/**
 * Every third-party package a sample imports must be one the docs know: a dependency of the demo or theme package, or
 * declared in AMBIENT above. The Code panel lists such packages as "Also needs" (demo/src/layout/import-mode.ts), so a
 * package that is neither would send readers to install something this repo never checked.
 */
const known = new Set(Object.keys(AMBIENT));
for (const pkgFile of ["demo/package.json", "theme/package.json"]) {
  const pkg = JSON.parse(readFileSync(join(ROOT, pkgFile), "utf8"));
  for (const group of ["dependencies", "devDependencies", "peerDependencies"])
    for (const name of Object.keys(pkg[group] ?? {})) known.add(name);
}
const NOT_PACKAGES = new Set(["@sheenui/theme"]);
let unknownPackages = 0;
for (const s of samples) {
  for (const m of (s.code ?? "").matchAll(/(?:from|import)\s+"([^"./][^"]*)"/g)) {
    const parts = m[1].split("/");
    const name = m[1].startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
    if (NOT_PACKAGES.has(name) || known.has(name)) continue;
    unknownPackages += 1;
    console.error(
      `${relative(ROOT, s.file)}:${s.line}: the sample imports "${name}", which is not a known dependency (add it to AMBIENT or a package.json)`,
    );
  }
}
const ambientFile = join(SRC, "__page_ambient.d.ts");
virtual.set(ambientFile, ambientDecls.join("\n") + "\n");
samples.forEach((s, i) => {
  if (s.code === null) return;
  s.virtual = join(SRC, `__page_${i}.tsx`);
  virtual.set(s.virtual, `${s.code}\nexport {};\n`);
});

const config = ts.getParsedCommandLineOfConfigFile(
  join(THEME, "tsconfig.json"),
  {},
  { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
);
const options = { ...config.options, noEmit: true, noUnusedLocals: true, noUnusedParameters: false };
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
  rootNames: [
    ambientFile,
    ...config.fileNames.filter((f) => f.endsWith("index.ts") && f.startsWith(SRC)),
    ...virtual.keys(),
  ],
  options,
  host,
});

let failed = unknownPackages;
// The copied-files form of every sample (what the static HTML, the .md twins and llms files show first) is derived from the
// same code with the registry's real file targets: each name must resolve, and each resulting path must be a registry output.
const installMap = loadInstallMap();
for (const s of samples) {
  if (s.code === null) continue;
  const { unknown, paths } = withCopiedImports(s.code, installMap);
  const missing = paths.filter((p) => !installMap.targets.has(p));
  if (unknown.length || missing.length) {
    failed += 1;
    console.error(
      `${relative(ROOT, s.file)}:${s.line}: no installed file in registry.json for ${[...unknown, ...missing].join(", ")} (a copied install cannot import it)`,
    );
  }
}
for (const s of samples) {
  const where = `${relative(ROOT, s.file)}:${s.line}`;
  if (s.code === null) {
    failed += 1;
    console.error(`${where}: the sample could not be resolved from the source (use a template string or a constant)`);
    continue;
  }
  const sf = program.getSourceFile(s.virtual);
  const diagnostics = [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)];
  if (!/from "@sheenui\/theme(\/demo-data)?"/.test(s.code))
    diagnostics.push({ code: 0, messageText: 'must import from "@sheenui/theme"', file: sf, start: 0 });
  if (list) console.log(`${where} ${diagnostics.length ? "FAIL" : "ok"}`);
  // The sample must show what renders: where the preview maps over data to build its rows, so does the sample (a
  // sample of two literal rows next to a preview of a dozen is an abridgement). Wrapper markup may differ.
  if (s.shape.maps > 0 && !s.code.includes(".map(")) {
    const file = relative(ROOT, s.file);
    (abridged.get(file) ?? abridged.set(file, []).get(file)).push(s.line);
  }
  if (!diagnostics.length) continue;
  failed += 1;
  for (const d of diagnostics.slice(0, list ? 99 : 2))
    console.error(`${where}: TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, " ").slice(0, 200)}`);
}
for (const [file, lines] of abridged) {
  const allowed = baseline[file] ?? 0;
  if (lines.length > allowed) {
    failed += 1;
    console.error(
      `${file}: ${lines.length} sample(s) (lines ${lines.join(", ")}) show literal rows where the preview maps over data (${allowed} allowed): make the sample the code that renders`,
    );
  } else if (list) console.log(`${file}: ${lines.length} abridged (${allowed} allowed)`);
}
for (const [file, allowed] of Object.entries(baseline))
  if ((abridged.get(file)?.length ?? 0) < allowed && !only)
    console.warn(
      `${file}: only ${abridged.get(file)?.length ?? 0} abridged sample(s) now, lower its allowance in scripts/page-code-abridged.json (${allowed})`,
    );
console.log(`check-page-code: ${samples.length} samples, ${failed} failing`);
process.exit(failed ? 1 : 0);
