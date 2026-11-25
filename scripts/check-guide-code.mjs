// Type-checks the code samples of the guides (docs/guides/*.md, rendered at /guides/<slug>).
//
//   node scripts/check-guide-code.mjs                 check all; exit 1 when a sample does not compile
//   node scripts/check-guide-code.mjs --list          print every sample and its result
//   node scripts/check-guide-code.mjs --dir <folder>  check another folder of guides (the script test uses a fixture)
//
// Every ts / tsx / jsx / js fence is a sample (see scripts/lib/guide-code.mjs for the fence markers): a module compiles as
// written, a `fragment` is wrapped in a function body, and an `external` one (another library's API) is not compiled but is
// counted and listed. Each guide is its own folder of virtual modules beside theme/src, so `@sheenui/theme` resolves to the
// real exports and a sample can import a sibling sample of the same guide ("./x" for a block headed `// file: x.ts`). The
// copied-files form (`@/components/sheenui/...`) is resolved through the registry mapping of scripts/lib/install-imports.mjs:
// each imported name must be installed at exactly that path, then it is compiled against the library.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { withoutAppleDouble } from "./lib/fs-filter.mjs";
import { extractGuideSamples } from "./lib/guide-code.mjs";
import { loadInstallMap } from "./lib/install-imports.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "theme");
const SRC = join(THEME, "src");
const args = process.argv.slice(2);
const list = args.includes("--list");
const dirArg = args.includes("--dir") ? args[args.indexOf("--dir") + 1] : "";
const GUIDES = dirArg ? resolve(dirArg) : join(ROOT, "docs/guides");

/** Third-party packages a guide shows that this repo does not install: only the names the samples import, so a typo still fails. */
const AMBIENT = `declare module "react-router" {
  import type { ComponentType } from "react";
  export const BrowserRouter: ComponentType<{ children?: import("react").ReactNode }>;
  export const Routes: ComponentType<{ children?: import("react").ReactNode }>;
  export const Route: ComponentType<{ path: string; element: import("react").ReactNode }>;
}
declare module "*.css";
`;

const installMap = loadInstallMap();
const files = withoutAppleDouble(readdirSync(GUIDES, { withFileTypes: true }))
  .filter((e) => e.isFile() && e.name.endsWith(".md"))
  .map((e) => e.name)
  .sort();

const samples = files.flatMap((f) => extractGuideSamples(readFileSync(join(GUIDES, f), "utf8"), f));
const SHEEN_NAMES = new Set(Object.keys(installMap.barrel));
const COPIED = /(import\s+(?:type\s+)?\{)([^}]*)(\}\s+from\s+")(@\/components\/sheenui\/[^"]+)(")/g;

/** Rewrites copied-files imports to the package barrel after checking each name is installed at that very path. */
function resolveCopied(code) {
  const problems = [];
  const out = code.replace(COPIED, (_, a, list, b, path, c) => {
    for (const raw of list.split(",")) {
      const name = raw
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        .trim();
      if (!name) continue;
      const target = installMap.barrel[name] ?? installMap.demoData[name];
      if (target !== path)
        problems.push(`${name} is ${target ? `installed at ${target}` : "not exported"}, not ${path}`);
    }
    return `${a}${list}${b}@sheenui/theme${c}`;
  });
  return { code: out, problems };
}

let exportKinds;
/** Whether a barrel export is a type only (a fragment must import it with `type`: verbatimModuleSyntax). */
function isTypeOnly(name) {
  if (!exportKinds) {
    const cfg = ts.getParsedCommandLineOfConfigFile(
      join(THEME, "tsconfig.json"),
      {},
      { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
    );
    const p = ts.createProgram({
      rootNames: cfg.fileNames.filter((f) => f.endsWith("index.ts") && f.startsWith(SRC)),
      options: cfg.options,
    });
    const checker = p.getTypeChecker();
    const index = p.getSourceFile(join(SRC, "index.ts"));
    exportKinds = new Map(
      checker.getExportsOfModule(checker.getSymbolAtLocation(index)).map((sym) => {
        const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
        return [sym.name, !(target.flags & ts.SymbolFlags.Value)];
      }),
    );
  }
  return exportKinds.get(name) === true;
}

const virtual = new Map();
const ambient = join(SRC, "__guide_ambient.d.ts");
virtual.set(ambient, AMBIENT);
const used = new Map(); // guide folder -> names taken
for (const s of samples) {
  const slug = s.file.replace(/\.md$/, "");
  const taken = used.get(slug) ?? used.set(slug, new Set()).get(slug);
  let name = s.name;
  for (let n = 2; taken.has(name); n += 1) name = s.name.replace(/(\.\w+)$/, `-${n}$1`);
  taken.add(name);
  s.path = join(SRC, `__guide_${slug}`, name);
  s.problems = [];
  if (s.kind === "external") continue;
  const resolved = resolveCopied(s.code);
  s.problems = resolved.problems;
  let body = resolved.code;
  s.offset = 0;
  if (s.kind === "fragment") {
    // Module-level statements (a bare JSX expression, a `declare const`) with every SheenUI export the lines name imported.
    const names = [...new Set(body.match(/\b[A-Za-z_]\w*\b/g) ?? [])].filter((n) => SHEEN_NAMES.has(n));
    const head = names.length
      ? `import { ${names.map((n) => (isTypeOnly(n) ? `type ${n}` : n)).join(", ")} } from "@sheenui/theme";\n`
      : "";
    s.offset = head ? 1 : 0;
    body = head + body;
  }
  virtual.set(s.path, `${body}\nexport {};\n`);
}

const config = ts.getParsedCommandLineOfConfigFile(
  join(THEME, "tsconfig.json"),
  {},
  { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
);
const options = { ...config.options, noEmit: true, allowJs: true, checkJs: true, noUnusedParameters: false };
const host = ts.createCompilerHost(options);
const readFile = host.readFile.bind(host);
const fileExists = host.fileExists.bind(host);
const getSourceFile = host.getSourceFile.bind(host);
host.fileExists = (f) => virtual.has(f) || fileExists(f);
const dirExists = host.directoryExists?.bind(host);
const virtualDirs = new Set([...virtual.keys()].map((f) => dirname(f)));
host.directoryExists = (d) => virtualDirs.has(d) || (dirExists ? dirExists(d) : true);
host.readFile = (f) => virtual.get(f) ?? readFile(f);
host.getSourceFile = (f, lang, onError, shouldCreate) =>
  virtual.has(f)
    ? ts.createSourceFile(
        f,
        virtual.get(f),
        lang,
        true,
        /\.[mc]?js$/.test(f) ? ts.ScriptKind.JS : f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      )
    : getSourceFile(f, lang, onError, shouldCreate);
const program = ts.createProgram({
  rootNames: [
    ambient,
    ...config.fileNames.filter((f) => f.endsWith("index.ts") && f.startsWith(SRC)),
    ...virtual.keys(),
  ],
  options,
  host,
});

let failed = 0;
const perGuide = new Map();
for (const s of samples) {
  const tally = perGuide.get(s.file) ?? perGuide.set(s.file, { compiled: 0, fragment: 0, external: 0 }).get(s.file);
  const where = `${relative(ROOT, join(GUIDES, s.file))}:${s.line}`;
  if (s.kind === "external") {
    tally.external += 1;
    if (list) console.log(`${where} external (not compiled: shows another library's API)`);
    continue;
  }
  tally[s.kind === "fragment" ? "fragment" : "compiled"] += 1;
  const sf = program.getSourceFile(s.path);
  const diagnostics = [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)];
  if (list) console.log(`${where} ${s.kind} ${diagnostics.length || s.problems.length ? "FAIL" : "ok"}`);
  if (!diagnostics.length && !s.problems.length) continue;
  failed += 1;
  for (const p of s.problems) console.error(`${where}: copied import: ${p}`);
  for (const d of diagnostics.slice(0, list ? 99 : 3)) {
    const at =
      d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 - (s.offset ?? 0) : 0;
    console.error(
      `${where} (code line ${at}): TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, " ").slice(0, 200)}`,
    );
  }
}
const total = { compiled: 0, fragment: 0, external: 0 };
for (const [file, t] of perGuide) {
  if (list || t.compiled + t.fragment + t.external)
    console.log(`  ${file}: ${t.compiled} compiled, ${t.fragment} fragment, ${t.external} external`);
  for (const k of Object.keys(total)) total[k] += t[k];
}
console.log(
  `check-guide-code: ${samples.length} samples (${total.compiled} compiled as modules, ${total.fragment} fragments, ${total.external} external, not compiled), ${failed} failing`,
);
process.exit(failed ? 1 : 0);
