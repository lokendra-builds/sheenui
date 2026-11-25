// Generates demo/src/generated/page-dates.ts: the real "last modified" date of every docs page.
//
// A page's date is the day its own sources last changed: the page component (and the module a lazy wrapper
// resolves to), the library folder/file its `source=` prop documents, its "When to use it" content file and, for
// the home page, its section files. The ledger (demo/page-dates.ledger.json, committed) keeps a content hash of those files
// next to the date: when the hash is unchanged the date is kept; when it differs the date becomes today. A fresh
// clone therefore reproduces the same dates (file mtimes are not used after the first seeding, so a checkout never
// resets them). Paths with no ledger entry are seeded from the newest file mtime, which is the day they were last edited.
// Guides carry their own dates (docs/guides/*.md front matter) and are not listed here.
//
//   node scripts/gen-page-dates.mjs           update the ledger and the generated file
//   node scripts/gen-page-dates.mjs --check   exit 1 when a route is missing from, or extra in, the ledger
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { pageSources, resolvePageModule, routeModules } from "./lib/routes-source.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = resolve(DEMO, "..");
const LEDGER = join(DEMO, "page-dates.ledger.json");
const OUT = join(DEMO, "src/generated/page-dates.ts");
const FACTS_OUT = join(DEMO, "src/generated/repo-facts.ts");

/** Every file under a path (a file is itself), skipping macOS AppleDouble files. */
function filesUnder(p) {
  if (!existsSync(p)) {
    const withExt = [".tsx", ".ts"].map((e) => p + e).find(existsSync);
    return withExt ? [withExt] : [];
  }
  if (!statSync(p).isDirectory()) return [p];
  return readdirSync(p)
    .filter((n) => !n.startsWith("._"))
    .flatMap((n) => filesUnder(join(p, n)));
}

/** route path → the content file that holds its "When to use it" text (parsed from src/seo/content/index.ts). */
function contentFiles() {
  const text = readFileSync(join(DEMO, "src/seo/content/index.ts"), "utf8");
  return Object.fromEntries([...text.matchAll(/"(\/[^"]*)":\s*"([\w-]+)"/g)].map((m) => [m[1], m[2]]));
}

/** Files whose content decides a page's date. */
export function filesOf(path, modules, content) {
  const files = [];
  if (content[path]) files.push(join(DEMO, "src/seo/content", `${content[path]}.ts`));
  if (path === "/")
    for (const f of ["HomeHero", "HomeSections", "HomeSeoSections"]) files.push(join(DEMO, `src/pages/${f}.tsx`));
  const mod = modules.get(path);
  if (mod) {
    const page = resolvePageModule(DEMO, mod.module, mod.exportName);
    files.push(join(DEMO, mod.module));
    if (page.module !== mod.module) files.push(join(DEMO, page.module));
    for (const s of pageSources(page.text, page.exportName, page.consts)) files.push(...filesUnder(join(REPO, s)));
  }
  return [...new Set(files)].filter(existsSync).sort();
}

const hashOf = (files) => {
  const h = createHash("sha256");
  for (const f of files)
    h.update(`${f.slice(REPO.length)}\0`)
      .update(readFileSync(f))
      .update("\0");
  return h.digest("hex").slice(0, 16);
};
const day = (ms) => new Date(ms).toISOString().slice(0, 10);

const modules = routeModules(join(DEMO, "src/routes.ts"));
// Every route path, from the route tables (text), plus the extra pages written by hand below.
const routeText = readdirSync(join(DEMO, "src/routes"))
  .filter((f) => f.endsWith(".ts") && !f.startsWith("._"))
  .map((f) => readFileSync(join(DEMO, "src/routes", f), "utf8"))
  .join("\n");
const paths = [...new Set([...routeText.matchAll(/path:\s*"(\/[^"]*)"/g)].map((m) => m[1]))]
  .filter((p) => !p.startsWith("/guides/") && p !== "/404")
  .sort();

const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : {};
const content = contentFiles();
const next = {};
const today = day(Date.now());
for (const path of paths) {
  const files = filesOf(path, modules, content);
  const hash = hashOf(files);
  const prev = ledger[path];
  const seeded = day(Math.max(0, ...files.map((f) => statSync(f).mtimeMs)) || Date.now());
  next[path] = { hash, modified: !prev ? seeded : prev.hash === hash ? prev.modified : today };
}

if (process.argv.includes("--check")) {
  const missing = paths.filter((p) => !(p in ledger));
  const extra = Object.keys(ledger).filter((p) => !paths.includes(p));
  if (missing.length || extra.length || !existsSync(OUT)) {
    console.error(
      `page dates ledger is stale (missing: ${missing.join(", ") || "-"}; extra: ${extra.join(", ") || "-"}): run \`pnpm docs:props\``,
    );
    process.exit(1);
  }
  console.log("page dates ledger covers every route");
} else {
  writeFileSync(LEDGER, `${JSON.stringify(next, null, 2)}\n`);
  const dates = Object.fromEntries(paths.map((p) => [p, next[p].modified]));
  writeFileSync(
    OUT,
    [
      "// GENERATED by demo/scripts/gen-page-dates.mjs (`pnpm docs:props`). Do not edit by hand.",
      "/** Route path -> the day the page's own sources last changed (ISO date). */",
      `export const PAGE_MODIFIED: Readonly<Record<string, string>> = ${JSON.stringify(dates, null, 1)};`,
      "",
    ].join("\n"),
  );
  // Repo facts the /about page quotes: counted from the repo, never typed by hand.
  const countFiles = (dir, re) =>
    existsSync(dir)
      ? readdirSync(dir, { withFileTypes: true })
          .filter((e) => !e.name.startsWith("._"))
          .reduce((n, e) => n + (e.isDirectory() ? countFiles(join(dir, e.name), re) : re.test(e.name) ? 1 : 0), 0)
      : 0;
  const registry = JSON.parse(readFileSync(join(REPO, "registry.json"), "utf8"));
  writeFileSync(
    FACTS_OUT,
    [
      "// GENERATED by demo/scripts/gen-page-dates.mjs (`pnpm docs:props`). Do not edit by hand.",
      "/** Numbers counted from the repository, quoted on /about. */",
      `export const REPO_FACTS = ${JSON.stringify(
        {
          testFiles: countFiles(join(REPO, "theme/test"), /\.test\.tsx?$/),
          e2eSpecs: countFiles(join(DEMO, "e2e"), /\.spec\.ts$/),
          registryItems: registry.items.length,
        },
        null,
        1,
      )} as const;`,
      "",
    ].join("\n"),
  );
  console.log(
    `wrote demo/page-dates.ledger.json, src/generated/page-dates.ts and repo-facts.ts (${paths.length} routes)`,
  );
}
