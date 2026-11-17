// `pnpm copy-test`: proves the docs' "Files to copy" box is true (the docs completeness gate).
//
// For each docs page it takes exactly what the page lists (folders and files from the transitive file-level import
// closure of the page's `source`, computed by demo/sheen-closure.mjs from the same graph the page uses), copies
// that into a scratch Vite + React + TypeScript app that has only the toolchain plus the npm packages the page
// lists, and runs `tsc --noEmit` over EVERY copied file (strict, noUncheckedIndexedAccess, like the theme). A
// missing file, an undeclared package or a broken relative import in any copied file fails the page. With
// `--build` it also runs `vite build` on an entry that imports the page's own source files.
//
//   node scripts/copy-test.mjs                         15 representative pages
//   node scripts/copy-test.mjs --all                   every docs page that has a "Files to copy" box
//   node scripts/copy-test.mjs --pages /charts/sankey-diagram,/components/button
//   node scripts/copy-test.mjs --build --concurrency 3 --keep
//
// Apps live under node_modules/.cache/copy-test/ (git-ignored); packages are symlinked from theme/node_modules, so
// nothing is downloaded. Writes test-results/copy-test.json; exits 1 on any failure.

import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { routeModules, pageSources, resolvePageModule } from "../demo/scripts/lib/routes-source.mjs";
import { resolveCopyList } from "../demo/sheen-closure.mjs";
import { scanThemeDeps } from "../demo/vite.sheen-deps.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "theme");
const SRC = join(THEME, "src");
const DEMO = join(ROOT, "demo");
const CACHE = join(ROOT, "node_modules", ".cache", "copy-test");
const OUT = join(ROOT, "test-results");
const VITE_BIN = join(THEME, "node_modules", "vite", "bin", "vite.js");
const TSC_BIN = join(THEME, "node_modules", "typescript", "bin", "tsc");

/** Pages that cover every kind of box: a small component, big chart/flow charts, a data table, chat, colour picker, effects, blocks, dashboards. */
const DEFAULT_PAGES = [
  "/components/button",
  "/components/dialog",
  "/components/data-table",
  "/charts/sankey-diagram",
  "/charts/line-chart",
  "/charts/world-map",
  "/chat/list",
  "/blocks/chat-app",
  "/forms/color-picker",
  "/forms/date-picker",
  "/effects/typewriter",
  "/blocks/payment-checkout",
  "/blocks/bento-grid",
  "/overlays/side-drawer",
  "/dashboards/web-analytics",
];

/** What every consumer app has regardless of the page: the toolchain from the setup guide. */
const TOOLCHAIN = [
  "react",
  "react-dom",
  "vite",
  "@vitejs/plugin-react",
  "tailwindcss",
  "@tailwindcss/vite",
  "@types/react",
  "@types/react-dom",
  "typescript",
];

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const concurrency = Number(option("concurrency", "3"));
const keep = flag("keep");
const build = flag("build");

const themePackage = JSON.parse(readFileSync(join(THEME, "package.json"), "utf8"));
// Only what a consumer installs with the package counts: a devDependency (tests, tooling) would not be there.
const declared = new Set([
  ...Object.keys(themePackage.dependencies ?? {}),
  ...Object.keys(themePackage.peerDependencies ?? {}),
]);

const { graph } = scanThemeDeps(SRC, join(ROOT, "registry.json"));

/** Every route that shows a box: its sources and the box contents. */
function pages() {
  const modules = routeModules(join(DEMO, "src", "routes.ts"));
  const out = [];
  for (const [path, { module, exportName }] of modules) {
    const page = resolvePageModule(DEMO, module, exportName);
    const sources = pageSources(page.text, page.exportName, page.consts);
    if (!sources.some((s) => /^theme\/src\/(components|blocks)\//.test(s))) continue;
    out.push({ path, sources, ...resolveCopyList(graph, sources) });
  }
  return out;
}

function targets() {
  const all = pages();
  if (flag("all")) return all;
  const wanted = option("pages", "") ? option("pages", "").split(",") : DEFAULT_PAGES;
  const missing = wanted.filter((w) => !all.some((p) => p.path === w));
  if (missing.length) {
    console.error(`copy-test: no page with a "Files to copy" box for ${missing.join(", ")}`);
    process.exit(1);
  }
  return wanted.map((w) => all.find((p) => p.path === w));
}

function linkPackage(appDir, name) {
  const from = join(THEME, "node_modules", name);
  if (!existsSync(from)) throw new Error(`package "${name}" is not installed in theme/node_modules`);
  const to = join(appDir, "node_modules", name);
  mkdirSync(dirname(to), { recursive: true });
  symlinkSync(from, to);
}

function run(bin, binArgs, cwd, timeoutMs) {
  return new Promise((done) => {
    const child = spawn(process.execPath, [bin, ...binArgs], { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.on("close", (code) => {
      clearTimeout(timer);
      done({ ok: code === 0, output });
    });
  });
}

/** Copies the page's list into a fresh app, type-checks all of it, optionally builds. */
async function runPage(page) {
  const started = Date.now();
  const name = page.path.replace(/^\//, "").replace(/\//g, "-");
  const appDir = join(CACHE, name);
  rmSync(appDir, { recursive: true, force: true });
  mkdirSync(join(appDir, "src", "sheen"), { recursive: true });

  const undeclared = page.packages.filter((p) => !declared.has(p));
  if (undeclared.length)
    return { ok: false, ms: 0, error: `imports packages missing from theme/package.json: ${undeclared.join(", ")}` };

  // Copy exactly the listed units (a trailing slash is a folder), keeping their layout so relative imports resolve unchanged.
  let copied = 0;
  for (const unit of page.units) {
    const from = join(SRC, unit);
    const to = join(appDir, "src", "sheen", unit);
    if (!existsSync(from)) return { ok: false, ms: 0, error: `listed file is missing: theme/src/${unit}` };
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to, { recursive: true, filter: (file) => !/\.(test|spec)\.tsx?$/.test(file) });
    copied += 1;
  }

  // Only the packages the page lists, plus the toolchain.
  for (const pkg of new Set([...page.packages, ...TOOLCHAIN])) linkPackage(appDir, pkg);

  const entries = page.files.filter((f) =>
    page.sources.some(
      (s) => f === s.replace("theme/src/", "") || f.startsWith(`${s.replace("theme/src/", "").replace(/\/$/, "")}/`),
    ),
  );
  writeFileSync(
    join(appDir, "src", "main.tsx"),
    `${entries.map((e, i) => `import * as m${i} from "./sheen/${e.replace(/\.tsx?$/, "")}";`).join("\n")}\nimport "./app.css";\n\n// Referenced so the bundler keeps every module the page lists.\n(globalThis as Record<string, unknown>).__sheen = [${entries.map((_, i) => `m${i}`).join(", ")}];\n`,
  );
  writeFileSync(join(appDir, "src", "env.d.ts"), `declare module "*.css";\n`);
  writeFileSync(
    join(appDir, "src", "app.css"),
    `@import "tailwindcss";\n@import "./sheen/styles/index.css";\n@source "./sheen";\n`,
  );
  writeFileSync(
    join(appDir, "index.html"),
    `<!doctype html>\n<html lang="en"><head><meta charset="utf-8" /><title>copy test</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`,
  );
  writeFileSync(
    join(appDir, "vite.config.mjs"),
    `import react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\nexport default { plugins: [react(), tailwindcss()], logLevel: "error", build: { outDir: "dist", emptyOutDir: true, chunkSizeWarningLimit: 8000 } };\n`,
  );
  writeFileSync(
    join(appDir, "package.json"),
    JSON.stringify({ name: `copy-test-${name}`, private: true, type: "module" }),
  );
  // The same strictness the theme itself is checked with; every .ts/.tsx under src/ (so all copied files) is compiled.
  const base = JSON.parse(readFileSync(join(THEME, "tsconfig.json"), "utf8"));
  writeFileSync(
    join(appDir, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { ...base.compilerOptions, types: ["react", "react-dom"] }, include: ["src"] }),
  );

  let result = await run(TSC_BIN, ["--noEmit", "-p", "tsconfig.json"], appDir, 240_000);
  let stage = "tsc";
  if (result.ok && build) {
    stage = "vite build";
    result = await run(VITE_BIN, ["build", "--config", "vite.config.mjs"], appDir, 240_000);
  }
  if (result.ok && !keep) rmSync(appDir, { recursive: true, force: true });
  const lines = result.output.trim().split("\n");
  return {
    ok: result.ok,
    ms: Date.now() - started,
    copied,
    files: page.files.length,
    error: result.ok ? undefined : `[${stage}] ${lines.length} lines\n${lines.slice(0, 8).join("\n")}`,
  };
}

if (!existsSync(TSC_BIN) || !existsSync(VITE_BIN)) {
  console.error("copy-test: run `pnpm install` first (theme/node_modules/typescript or vite is missing).");
  process.exit(1);
}

const list = targets();
mkdirSync(CACHE, { recursive: true });
console.log(`copy-test: ${list.length} pages, concurrency ${concurrency}${build ? ", with vite build" : ""}`);

const results = [];
const queue = [...list];
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    for (let page = queue.shift(); page; page = queue.shift()) {
      const r = await runPage(page);
      results.push({ page: page.path, units: page.units, packages: page.packages, shadcn: page.items, ...r });
      console.log(
        `${r.ok ? "ok  " : "FAIL"} ${page.path.padEnd(32)} ${String(r.files ?? 0).padStart(3)} files  ${(r.ms / 1000).toFixed(1)}s${r.ok ? "" : `\n${r.error}`}`,
      );
    }
  }),
);

results.sort((a, b) => a.page.localeCompare(b.page));
const failed = results.filter((r) => !r.ok);
mkdirSync(OUT, { recursive: true });
writeFileSync(
  join(OUT, "copy-test.json"),
  JSON.stringify(
    {
      pages: results.length,
      passed: results.length - failed.length,
      failed: failed.map((f) => ({ page: f.page, error: f.error })),
      results,
    },
    null,
    2,
  ),
);
console.log(
  `\ncopy-test: ${results.length - failed.length}/${results.length} pages type-check${failed.length ? `; failed: ${failed.map((f) => f.page).join(", ")}` : ""}`,
);
if (!failed.length && !keep) rmSync(CACHE, { recursive: true, force: true });
process.exit(failed.length ? 1 : 0);
