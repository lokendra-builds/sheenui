// `pnpm --filter @sheenui/theme build` (also run by `pnpm pack` through `prepack`).
//
// Compiles theme/src to theme/dist as plain ES modules, one output file per source file:
//   - dist/**/*.js + *.d.ts  (tsc; module-level "use client" directives are kept on every file that has one)
//   - dist/styles/**         (the CSS, copied; index.css also tells Tailwind to scan the compiled components)
// Source files import each other without extensions (that is what bundlers and the copy-paste install
// want), but Node and TypeScript's node16/nodenext resolution need explicit ones, so this script
// rewrites every relative specifier in the output ("./x" -> "./x.js", "./dir" -> "./dir/index.js"), located with the
// TypeScript parser rather than a regex.
// TypeScript's `rewriteRelativeImportExtensions` (5.7+) is not used: it only rewrites specifiers that already end in
// `.ts`/`.tsx`, and the sources deliberately import extensionless ("./x", "./dir") for bundlers and the copy-paste install,
// so it would leave every output specifier untouched. `package:check` imports the built barrel in plain Node to prove they resolve.
// One file per module, no bundling: a consumer's bundler tree-shakes at module level.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// The compiler binary is the theme's own TypeScript (7, native, no JS API); the parser used to read specifiers is the
// monorepo root's TypeScript 6, which still ships the JavaScript API.
const ts = createRequire(join(root, "..", "package.json"))("typescript");
const dist = join(root, "dist");
const tsc = join(root, "node_modules", "typescript", "bin", "tsc");

rmSync(dist, { recursive: true, force: true });
const compiled = spawnSync(process.execPath, [tsc, "-p", join(root, "tsconfig.build.json")], {
  cwd: root,
  stdio: "inherit",
});
if (compiled.status !== 0) process.exit(compiled.status ?? 1);

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir)
    .filter((name) => !name.startsWith("._")) // macOS AppleDouble metadata, not source
    .flatMap((name) => {
      const full = join(dir, name);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
}

const isFile = (file) => existsSync(file) && statSync(file).isFile();

/**
 * Relative specifiers of a compiled file, found with the TypeScript parser (never a regex over text, so comments,
 * strings and template literals are ignored by construction): `import x from "./a"`, `import "./a"`,
 * `export * from "./a"`, `export { x } from "./a"`, `import("./a")` and `typeof import("./a")` in declarations.
 * @returns {{ start: number; end: number; spec: string }[]} the position of each specifier's text, without quotes
 */
function relativeSpecifiers(file, source) {
  const found = [];
  const add = (literal) => {
    if (literal && ts.isStringLiteralLike(literal) && /^\.{1,2}(?:\/|$)/.test(literal.text))
      found.push({ start: literal.getStart() + 1, end: literal.getEnd() - 1, spec: literal.text });
  };
  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier)
      add(node.moduleSpecifier);
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) add(node.arguments[0]);
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) add(node.argument.literal);
    ts.forEachChild(node, visit);
  };
  visit(
    ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".d.ts") ? ts.ScriptKind.TS : ts.ScriptKind.JS,
    ),
  );
  return found;
}

let rewritten = 0;
for (const file of walk(dist)) {
  const declaration = file.endsWith(".d.ts");
  if (!declaration && !file.endsWith(".js")) continue;
  const ext = declaration ? ".d.ts" : ".js";
  const source = readFileSync(file, "utf8");
  let next = source;
  // Back to front, so earlier positions stay valid.
  for (const { start, end, spec } of relativeSpecifiers(file, source).sort((a, b) => b.start - a.start)) {
    if (/\.(?:js|css|json)$/.test(spec)) continue;
    const target = resolve(dirname(file), spec);
    let fixed;
    if (isFile(target + ext)) fixed = spec + ".js";
    else if (isFile(join(target, "index" + ext))) fixed = spec.replace(/\/$/, "") + "/index.js";
    else throw new Error(`${file}: cannot resolve "${spec}"`);
    next = next.slice(0, start) + fixed + next.slice(end);
    rewritten++;
  }
  if (next !== source) writeFileSync(file, next);
}

// CSS: copied as-is. dist/styles/base.css is the source entry (tokens, glass, presets, variants). dist/styles/index.css
// (what "@sheenui/theme/styles.css" resolves to) imports it and also tells Tailwind to scan the compiled components, so
// their utilities are generated without the app pointing an @source at node_modules (Tailwind skips node_modules).
// Apps that use only a few components can import base.css and add their own @source for those folders.
// `._*` are macOS AppleDouble metadata that a copied tree can carry; they must never reach dist (and so the tarball).
cpSync(join(root, "src", "styles"), join(dist, "styles"), {
  recursive: true,
  filter: (source) => !basename(source).startsWith("._"),
});
const entry = join(dist, "styles", "index.css");
const base = join(dist, "styles", "base.css");
const original = readFileSync(entry, "utf8");
const baseCss = original.replace(
  /^ \* {3}@import "@sheenui\/theme\/styles.css";\n \* {3}@source "<path-to>\/theme\/src";\n/m,
  ' *   @import "@sheenui/theme/styles/base.css";\n *   @source "../node_modules/@sheenui/theme/dist/components/button";  (one line per folder you use)\n',
);
if (baseCss === original) throw new Error("styles/index.css: header comment changed, update scripts/build.mjs");
writeFileSync(base, baseCss);
writeFileSync(
  entry,
  `/*
 * SheenUI styles: everything. Import this AFTER Tailwind in your app's CSS:
 *
 *   @import "tailwindcss";
 *   @import "@sheenui/theme/styles.css";
 *
 * It loads base.css (tokens, glass, motion, both style presets, the backdrop and the Tailwind variants)
 * and makes Tailwind generate the utilities used by every compiled SheenUI component.
 * Smaller CSS: import "@sheenui/theme/styles/base.css" instead and @source only the components you use.
 */
@import "./base.css";
@source "../";
@source not "../**/*.d.ts";
`,
);
// Lets TypeScript (TS 6+ checks side-effect imports) resolve `import "@sheenui/theme/styles.css"` without an ambient *.css declaration.
writeFileSync(
  join(dist, "styles.d.ts"),
  "// The stylesheet has no exports; this file only makes the import resolvable for TypeScript.\nexport {};\n",
);

console.log(`sheenui build: ${walk(dist).length} files, ${rewritten} relative imports given extensions`);
