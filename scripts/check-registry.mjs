// `pnpm registry:check`: proves the shadcn registry works, with the real tools.
//
//   1. Rebuilds the registry (scripts/build-registry.mjs) and validates registry.json and every
//      demo/public/r/*.json against the OFFICIAL JSON schemas (https://ui.shadcn.com/schema/...), the CLI's own
//      zod schema, and our own rules (inlined content, every registryDependency exists, unique targets).
//   2. Builds a second copy whose registryDependencies point at a local static server, then for each target item, in a
//      Vite app and (a short list, NEXT_ITEMS) in a Next.js app router app, the two consumers the docs promise:
//        fresh Vite + React + Tailwind v4 app (made by `shadcn init -t vite`, once, then cloned), or Next.js
//        (`shadcn init -t next`, `next build`, server components importing the client modules)
//        -> `shadcn add http://127.0.0.1:<port>/r/<item>.json`  (the real CLI, latest version)
//        -> every file of the item and of its registry dependencies exists at its target
//        -> `tsc -b && vite build` of an entry that imports every module of the item
//        -> the built CSS carries the SheenUI tokens (the @import the theme item adds reached the bundle)
//      plus an "incremental" run that adds several items one after another to the same app.
//   3. Runs the official `shadcn build registry.json` over the root registry.json.
//
//   node scripts/check-registry.mjs                      14 representative items + incremental + schema
//   node scripts/check-registry.mjs --all                every item (slow: 15-90 s per item)
//   node scripts/check-registry.mjs --only button,tabs
//   node scripts/check-registry.mjs --skip-cli           schema and consistency only (no network)
//   node scripts/check-registry.mjs --frameworks vite    only the Vite consumer (default: vite,next; `next` runs the NEXT_ITEMS subset)
//   Options: --work <dir> (default <os tmpdir>/sheenui-registry-check, or $REGISTRY_CHECK_DIR)  --concurrency 3  --keep
//            --fresh (rebuild the template app and tools)  --shadcn <version|latest>  --report <file>
//            --max-load 12 (items run one at a time; before each one the script waits while the 1-minute load average is above this)
//
// Needs network on the first run (npm/pnpm installs, shadcn init, the official schemas); later runs reuse the
// pnpm store and the cached schemas. Writes test-results/registry-check.json; exits 1 on any failure.

import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { loadavg, tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { buildRegistry, isImportable, ROOT } from "./build-registry.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

// Outside the repo on purpose: pnpm would treat an app under the repo's pnpm-workspace.yaml as part of the workspace.
const WORK = resolve(option("work", process.env.REGISTRY_CHECK_DIR ?? join(tmpdir(), "sheenui-registry-check")));
const TOOLS = join(WORK, "tools");
const SERVED = join(WORK, "served");
const APPS = join(WORK, "apps");
const SHIPPED = join(ROOT, "demo", "public", "r");
const REPORT = resolve(option("report", join(ROOT, "test-results", "registry-check.json")));
const CONCURRENCY = Number(option("concurrency", "1"));
const MAX_LOAD = Number(option("max-load", "12"));
const SHADCN_VERSION = option("shadcn", "latest");
const REPRESENTATIVE = [
  "sheenui-theme",
  "button",
  "input",
  "dialog",
  "tabs",
  "select",
  "data-table",
  "line-chart",
  "geo-map",
  "liquid-glass",
  "side-drawer",
  "glass-login",
  "analytics-web",
  "chat-app",
];
// The Next.js (app router) consumer: a subset covering a client-only primitive, an overlay, and the heaviest data components.
const NEXT_ITEMS = ["sheenui-theme", "button", "dialog", "data-table", "line-chart"];
/** The consumer apps a registry item must install and build in. `src`: where the entry lives; `css`: where the built CSS ends up. */
const FRAMEWORKS = {
  vite: { id: "vite", template: "template", init: "vite", css: ["dist", "assets"] },
  next: { id: "next", template: "template-next", init: "next", css: [".next", "static"] },
};
const wantedFrameworks = option("frameworks", "vite,next")
  .split(",")
  .map((n) => n.trim())
  .filter(Boolean);
for (const n of wantedFrameworks)
  if (!FRAMEWORKS[n]) {
    console.error(`registry-check: unknown --frameworks entry "${n}" (vite, next)`);
    process.exit(1);
  }
const INCREMENTAL = ["button", "dialog", "line-chart", "data-table"];
const SCHEMA_URLS = {
  item: "https://ui.shadcn.com/schema/registry-item.json",
  registry: "https://ui.shadcn.com/schema/registry.json",
};

const log = (...parts) => console.log(...parts);
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const tail = (text, lines = 25) => text.trim().split("\n").slice(-lines).join("\n");

/** Runs a command; resolves with its exit code and combined output. Never rejects. */
function run(command, argv, { cwd = ROOT, timeout = 600_000, env = {} } = {}) {
  return new Promise((done) => {
    const child = spawn(command, argv, {
      cwd,
      env: { ...process.env, CI: "1", FORCE_COLOR: "0", ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    const timer = setTimeout(() => child.kill("SIGKILL"), timeout);
    child.on("error", (error) => {
      clearTimeout(timer);
      done({ code: 1, output: `${output}\n${error.message}` });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      done({ code: code ?? 1, output });
    });
  });
}

/** Waits (up to 10 minutes) while the machine is busy, so a long check never piles onto an overloaded Mac. */
async function waitForQuiet() {
  const started = Date.now();
  let announced = false;
  while (loadavg()[0] > MAX_LOAD && Date.now() - started < 600_000) {
    if (!announced) log(`registry-check: load average ${loadavg()[0].toFixed(1)} > ${MAX_LOAD}, waiting`);
    announced = true;
    await sleep(10_000);
  }
}

// ------------------------------------------------------------------------------------------ tools and schemas

async function ensureTools() {
  mkdirSync(TOOLS, { recursive: true });
  writeFileSync(
    join(TOOLS, "package.json"),
    JSON.stringify({ name: "registry-check-tools", private: true, type: "module" }),
  );
  const installed = existsSync(join(TOOLS, "node_modules", "shadcn", "package.json"));
  if (!installed || flag("fresh") || SHADCN_VERSION === "latest") {
    const r = await run(
      "npm",
      ["install", "--no-audit", "--no-fund", "--loglevel=error", `shadcn@${SHADCN_VERSION}`, "ajv@8", "ajv-formats@3"],
      { cwd: TOOLS },
    );
    if (r.code !== 0) throw new Error(`could not install shadcn/ajv into ${TOOLS}:\n${tail(r.output)}`);
  }
  const cli = join(TOOLS, "node_modules", "shadcn", "dist", "index.js");
  const version = JSON.parse(readFileSync(join(TOOLS, "node_modules", "shadcn", "package.json"), "utf8")).version;
  return { cli, version };
}

async function loadSchema(kind) {
  const cache = join(WORK, "schemas", `${kind}.json`);
  try {
    const response = await fetch(SCHEMA_URLS[kind], { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    JSON.parse(text);
    mkdirSync(dirname(cache), { recursive: true });
    writeFileSync(cache, text);
    return { schema: JSON.parse(text), source: SCHEMA_URLS[kind] };
  } catch (error) {
    if (!existsSync(cache))
      throw new Error(`cannot fetch ${SCHEMA_URLS[kind]} (${error.message}) and no cached copy exists`, {
        cause: error,
      });
    return {
      schema: JSON.parse(readFileSync(cache, "utf8")),
      source: `cache of ${SCHEMA_URLS[kind]} (offline: ${error.message})`,
    };
  }
}

async function validateShipped(registryResult) {
  const require = createRequire(join(TOOLS, "package.json"));
  const Ajv = require("ajv").default ?? require("ajv");
  const [itemSchema, registrySchema] = await Promise.all([loadSchema("item"), loadSchema("registry")]);
  const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
  ajv.addSchema(itemSchema.schema, SCHEMA_URLS.item);
  const validateItem = ajv.getSchema(SCHEMA_URLS.item);
  const validateRegistry = ajv.compile(registrySchema.schema);
  const zod = await import(pathToFileURL(join(TOOLS, "node_modules", "shadcn", "dist", "schema", "index.js")).href);

  const problems = [];
  const names = new Set(registryResult.items.map((i) => i.name));
  const targets = new Map();
  const check = (label, data, validator) => {
    if (!validator(data))
      problems.push(
        `${label}: ${ajv.errorsText(validator.errors, { separator: "; ", dataVar: "item" }).slice(0, 400)}`,
      );
  };

  // The root registry.json and the hosted index.
  const rootIndex = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8"));
  check("registry.json", rootIndex, validateRegistry);
  const hostedIndex = JSON.parse(readFileSync(join(SHIPPED, "registry.json"), "utf8"));
  check("demo/public/r/registry.json", hostedIndex, validateRegistry);
  const registryParse = zod.registrySchema?.safeParse(rootIndex);
  if (registryParse && !registryParse.success)
    problems.push(`registry.json fails the CLI's zod registrySchema: ${registryParse.error.message.slice(0, 300)}`);
  if (rootIndex.name !== "sheenui" || !rootIndex.homepage)
    problems.push('registry.json needs name "sheenui" and a homepage');

  const results = [];
  for (const item of registryResult.items) {
    const file = join(SHIPPED, `${item.name}.json`);
    const itemProblems = [];
    if (!existsSync(file)) {
      problems.push(`${item.name}: ${file} is missing`);
      continue;
    }
    const shipped = JSON.parse(readFileSync(file, "utf8"));
    const before = problems.length;
    check(item.name, shipped, validateItem);
    const parsed = zod.registryItemSchema.safeParse(shipped);
    if (!parsed.success) itemProblems.push(`CLI zod schema: ${parsed.error.message.slice(0, 300)}`);
    for (const f of shipped.files ?? []) {
      if (!f.content || !f.content.trim()) itemProblems.push(`${f.path} has no inlined content`);
      if (!f.target) itemProblems.push(`${f.path} has no target`);
      if (targets.has(f.target)) itemProblems.push(`target ${f.target} also installed by ${targets.get(f.target)}`);
      else targets.set(f.target, item.name);
      if (/^\s*(import|export)[^;]*from\s+["'](\.\.\/){2,}components\//m.test(f.content ?? ""))
        itemProblems.push(`${f.path} still imports the theme/src layout`);
    }
    for (const url of shipped.registryDependencies ?? []) {
      const dep = url.replace(/^.*\/r\//, "").replace(/\.json$/, "");
      if (!url.startsWith(`${registryResult.baseUrl}/`) || !names.has(dep))
        itemProblems.push(`registryDependency ${url} is not a shipped SheenUI item`);
    }
    if (
      item.name !== "sheenui-theme" &&
      !(shipped.registryDependencies ?? []).some((u) => u.endsWith("/sheenui-theme.json"))
    )
      itemProblems.push("does not depend on sheenui-theme");
    for (const dep of shipped.dependencies ?? [])
      if (!/^(@[a-z0-9-]+\/)?[a-z0-9._-]+(@.+)?$/.test(dep)) itemProblems.push(`odd dependency "${dep}"`);
    problems.push(...itemProblems.map((p) => `${item.name}: ${p}`));
    results.push({ name: item.name, ok: problems.length === before });
  }
  return { problems, results, itemSchemaSource: itemSchema.source, registrySchemaSource: registrySchema.source };
}

// ------------------------------------------------------------------------------------------ local server

function serve(dir) {
  const types = { ".json": "application/json; charset=utf-8" };
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
    const file = join(dir, path);
    if (!file.startsWith(dir) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, {
      "content-type": types[extname(file)] ?? "application/octet-stream",
      "access-control-allow-origin": "*",
    });
    res.end(readFileSync(file));
  });
  return new Promise((done) => server.listen(0, "127.0.0.1", () => done({ server, port: server.address().port })));
}

// ------------------------------------------------------------------------------------------ the consumer app

const templateDir = (fw) => join(WORK, fw.template);

async function ensureTemplate(cli, fw) {
  const TEMPLATE = templateDir(fw);
  if (existsSync(join(TEMPLATE, "components.json")) && existsSync(join(TEMPLATE, "pnpm-lock.yaml")) && !flag("fresh"))
    return;
  rmSync(TEMPLATE, { recursive: true, force: true });
  log(`registry-check: creating the ${fw.id} template app with \`shadcn init -t ${fw.init}\` (first run only)`);
  const init = await run(process.execPath, [
    cli,
    "init",
    "-t",
    fw.init,
    "-b",
    "base",
    "-p",
    "nova",
    "-n",
    fw.template,
    "-y",
    "--no-monorepo",
    "--cwd",
    WORK,
  ]);
  if (init.code !== 0 || !existsSync(join(TEMPLATE, "components.json")))
    throw new Error(`shadcn init (${fw.id}) failed:\n${tail(init.output)}`);
  // init installs with npm; every clone installs with pnpm from the shared store, which is much faster.
  rmSync(join(TEMPLATE, "node_modules"), { recursive: true, force: true });
  rmSync(join(TEMPLATE, "package-lock.json"), { force: true });
  rmSync(join(TEMPLATE, ".git"), { recursive: true, force: true });
  const install = await run("pnpm", ["install", "--ignore-workspace"], { cwd: TEMPLATE });
  if (install.code !== 0) throw new Error(`pnpm install in the ${fw.id} template failed:\n${tail(install.output)}`);
  rmSync(join(TEMPLATE, "node_modules"), { recursive: true, force: true });
}

async function cloneTemplate(dest, fw) {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(templateDir(fw), dest, { recursive: true, filter: (src) => !src.includes("node_modules") });
  const r = await run("pnpm", ["install", "--frozen-lockfile", "--prefer-offline", "--ignore-workspace"], {
    cwd: dest,
  });
  if (r.code !== 0) throw new Error(`pnpm install failed:\n${tail(r.output)}`);
}

/** The item plus every item it (transitively) depends on, from the shipped files served locally. */
function closure(name, items) {
  const seen = new Map();
  const visit = (n) => {
    if (seen.has(n)) return;
    const item = items.get(n);
    seen.set(n, item);
    for (const url of item.registryDependencies ?? []) visit(url.replace(/^.*\/r\//, "").replace(/\.json$/, ""));
  };
  visit(name);
  return [...seen.values()];
}

/** Where a registry target lands, relative to the app: under `src/` when the app has one (Vite always, Next when init chose it). */
const sourceRoot = (app) => (existsSync(join(app, "src")) ? "src" : "");
const installedPath = (app, target) => join(sourceRoot(app), "components", target.replace(/^@components\//, ""));

/** shadcn add (one or more items) into `app`, then check that every file landed. */
async function addItems(cli, app, names, port, items) {
  const urls = names.map((n) => `http://127.0.0.1:${port}/r/${n}.json`);
  const add = await run(process.execPath, [cli, "add", ...urls, "-y", "--cwd", app], { cwd: app, timeout: 300_000 });
  if (add.code !== 0) return { ok: false, stage: "shadcn add", error: tail(add.output) };
  // Next.js: Tailwind's PostCSS plugin ignores tsconfig paths, so the `@/` CSS import the theme item adds must be made
  // relative by hand, exactly the step the theme item's docs tell a Next.js consumer to take.
  for (const css of [join(app, "src", "app", "globals.css"), join(app, "app", "globals.css")]) {
    if (!existsSync(css)) continue;
    const text = readFileSync(css, "utf8");
    const fixed = text.replace(/@import "@\/components\/sheenui\//g, '@import "../components/sheenui/');
    if (fixed !== text) writeFileSync(css, fixed);
  }
  const missing = [];
  for (const name of names)
    for (const item of closure(name, items))
      for (const f of item.files)
        if (!existsSync(join(app, installedPath(app, f.target)))) missing.push(installedPath(app, f.target));
  if (missing.length)
    return {
      ok: false,
      stage: "files",
      error: `not installed: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? ` (+${missing.length - 8})` : ""}`,
    };
  return { ok: true };
}

/** Imports every module of the given items from the app entry, so tsc and the bundler see all of them. */
function wireEntry(app, names, items, fw) {
  const modules = names.flatMap((n) => items.get(n).files.map((f) => f.target)).filter((t) => /\.(ts|tsx)$/.test(t));
  const root = sourceRoot(app);
  const lines = modules.map(
    (t, i) =>
      `import * as m${i} from "./${installedPath(app, t)
        .slice(root ? root.length + 1 : 0)
        .replace(/\.tsx?$/, "")}";`,
  );
  writeFileSync(
    join(app, root, "sheen-check.tsx"),
    `${lines.join("\n")}\n\n// Referenced so the bundler keeps every module.\n(globalThis as Record<string, unknown>).__sheen = [${modules.map((_, i) => `m${i}`).join(", ")}];\n`,
  );
  // Vite: src/main.tsx. Next.js: the app router page (a Server Component importing the client modules, as a consumer would).
  const entry = fw.id === "next" ? join(app, root, "app", "page.tsx") : join(app, "src", "main.tsx");
  const specifier = fw.id === "next" ? "../sheen-check" : "./sheen-check";
  writeFileSync(entry, `import "${specifier}";\n${readFileSync(entry, "utf8")}`);
  return modules.length;
}

/** `tsc -b && vite build` (the template's own build script), then a look at the built CSS. */
async function buildApp(app, fw) {
  const build = await run("pnpm", ["run", "build"], { cwd: app, timeout: 420_000 });
  if (build.code !== 0) {
    const stage = /error TS\d+/.test(build.output) ? "tsc" : "vite build";
    return { ok: false, stage, error: tail(build.output, 30) };
  }
  const assets = join(app, ...fw.css);
  const css = readdirSync(assets, { recursive: true })
    .filter((f) => String(f).endsWith(".css"))
    .map((f) => readFileSync(join(assets, String(f)), "utf8"))
    .join("\n");
  if (!css.includes("--sheen-bg") || !css.includes("sheen-glass"))
    return {
      ok: false,
      stage: "css",
      error: "the built CSS has no SheenUI tokens: the theme @import did not reach the bundle",
    };
  return { ok: true };
}

async function checkItem(cli, name, port, items, keep, fw) {
  const started = Date.now();
  const app = join(APPS, fw.id, name);
  const result = { name, framework: fw.id, ok: false, files: 0, modules: 0, stage: "clone" };
  try {
    await waitForQuiet();
    await cloneTemplate(app, fw);
    const added = await addItems(cli, app, [name], port, items);
    if (!added.ok) return { ...result, stage: added.stage, error: added.error, ms: Date.now() - started };
    result.files = closure(name, items).reduce((n, i) => n + i.files.length, 0);
    result.modules = wireEntry(app, [name], items, fw);
    const built = await buildApp(app, fw);
    Object.assign(result, built);
    if (built.ok) result.stage = "done";
  } catch (error) {
    result.error = error.message;
  }
  result.ms = Date.now() - started;
  if (result.ok && !keep) rmSync(app, { recursive: true, force: true });
  return result;
}

async function checkIncremental(cli, names, port, items, keep, fw) {
  const started = Date.now();
  const app = join(APPS, fw.id, "_incremental");
  const result = { name: `incremental (${fw.id}): ${names.join(" -> ")}`, framework: fw.id, ok: false, stage: "clone" };
  try {
    await waitForQuiet();
    await cloneTemplate(app, fw);
    for (const name of names) {
      const added = await addItems(cli, app, [name], port, items);
      if (!added.ok)
        return { ...result, stage: `${added.stage} (${name})`, error: added.error, ms: Date.now() - started };
    }
    // The second and later adds must not have asked to overwrite or duplicated the theme.
    result.modules = wireEntry(app, names, items, fw);
    Object.assign(result, await buildApp(app, fw));
    if (result.ok) result.stage = "done";
  } catch (error) {
    result.error = error.message;
  }
  result.ms = Date.now() - started;
  if (result.ok && !keep) rmSync(app, { recursive: true, force: true });
  return result;
}

// ------------------------------------------------------------------------------------------ main

const caveats = [];
const report = {
  generatedAt: new Date().toISOString(),
  cli: null,
  schema: null,
  official: null,
  items: null,
  results: [],
  incremental: null,
  caveats,
};
let failed = false;
const finish = () => {
  mkdirSync(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  log(`registry-check: report written to ${REPORT}`);
  process.exit(failed ? 1 : 0);
};

log("registry-check: building the registry");
const built = await buildRegistry({ quiet: true });
const itemMap = new Map(built.items.map((i) => [i.name, i]));
report.items = built.items.length;
log(
  `registry-check: ${built.items.length} items${built.changed ? ` (${built.changed} files were out of date and have been rewritten)` : ", output was up to date"}`,
);
if (built.changed) {
  // A stale committed registry is a failure, not a caveat: CI must not go green while registry.json / demo/public/r lag the sources.
  // The files have been rewritten, so commit them (locally a second run passes).
  failed = true;
  report.stale = built.changed;
  log(
    `registry-check: FAILED, the committed registry output was stale; ${built.changed} files were rewritten (commit registry.json and demo/public/r)`,
  );
}

// Every import line printed in an item's docs resolves: the file is one of the item's own files and exports each name.
{
  const bad = [];
  for (const item of built.items) {
    for (const m of (item.docs ?? "").matchAll(/import \{ ([^}]+) \} from "@\/components\/sheenui\/([^"]+)"/g)) {
      const file = (item.files ?? []).find(
        (f) => (f.target ?? "").replace(/^@components\/sheenui\//, "").replace(/\.tsx?$/, "") === m[2],
      );
      if (!file) {
        bad.push(`${item.name}: the docs import from "${m[2]}", which is not one of the item's files`);
        continue;
      }
      // A barrel file (`export * from "./x"`) re-exports its parts: its names are checked at their own files.
      if (/^export\s+\*\s+from/m.test(file.content ?? "")) continue;
      for (const name of m[1].split(",").map((x) => x.trim())) {
        const direct = new RegExp(`^export\\s+(?:async\\s+)?(?:function|const|class)\\s+${name}\\b`, "m").test(
          file.content ?? "",
        );
        const listed = new RegExp(`^export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`, "m").test(file.content ?? "");
        if (!direct && !listed) bad.push(`${item.name}: ${m[2]} does not export ${name}`);
      }
    }
  }
  report.docsImports = bad;
  if (bad.length) {
    failed = true;
    log(`registry-check: docs imports FAILED (${bad.length})\n  ${bad.slice(0, 20).join("\n  ")}`);
  } else {
    log("registry-check: every documented import resolves");
  }
}

// No documented import line names an `@internal` symbol or a SCREAMING_CASE constant: those are not for people to import.
{
  const bad = [];
  for (const item of built.items) {
    for (const m of (item.docs ?? "").matchAll(/import \{ ([^}]+) \} from "@\/components\/sheenui\/([^"]+)"/g)) {
      const file = (item.files ?? []).find(
        (f) => (f.target ?? "").replace(/^@components\/sheenui\//, "").replace(/\.tsx?$/, "") === m[2],
      );
      const names = m[1]
        .split(",")
        .map((x) => x.trim())
        .filter((n) => !isImportable(file?.content ?? "", n));
      if (names.length)
        bad.push(
          `${item.name}: the docs import ${names.join(", ")} from "${m[2]}", which is @internal or a SCREAMING_CASE constant`,
        );
    }
  }
  report.docsInternalImports = bad;
  if (bad.length) {
    failed = true;
    log(`registry-check: docs list non-public names FAILED (${bad.length})\n  ${bad.slice(0, 20).join("\n  ")}`);
  } else {
    log("registry-check: no documented import names an @internal symbol or a constant");
  }
}

const { cli, version } = await ensureTools();
report.cli = { package: "shadcn", version, command: "shadcn add <url>" };
log(`registry-check: shadcn CLI ${version}`);

const schema = await validateShipped(built);
report.schema = {
  ok: schema.problems.length === 0,
  problems: schema.problems,
  itemSchema: schema.itemSchemaSource,
  registrySchema: schema.registrySchemaSource,
  validatedItems: schema.results.length,
};
log(
  `registry-check: schema ${schema.problems.length ? `FAILED (${schema.problems.length} problems)` : "ok"} for ${schema.results.length} items + registry.json`,
);
for (const p of schema.problems.slice(0, 20)) log(`  - ${p}`);
if (schema.problems.length) failed = true;

// The official `shadcn build` must accept the root registry.json too.
{
  const out = join(WORK, "official-build");
  rmSync(out, { recursive: true, force: true });
  const official = await run(process.execPath, [cli, "build", "registry.json", "--output", out], { cwd: ROOT });
  const count = existsSync(out)
    ? readdirSync(out).filter((f) => f.endsWith(".json") && f !== "registry.json").length
    : 0;
  report.official = {
    ok: official.code === 0 && count === built.items.length,
    command: "shadcn build registry.json",
    outputs: count,
    error: official.code === 0 ? undefined : tail(official.output),
  };
  log(
    `registry-check: official \`shadcn build registry.json\` ${report.official.ok ? "ok" : "FAILED"} (${count} outputs)`,
  );
  if (!report.official.ok) failed = true;
  rmSync(out, { recursive: true, force: true });
}

if (flag("skip-cli")) {
  caveats.push("--skip-cli: the CLI install and build runs were skipped");
  finish();
}

let targets = flag("all")
  ? built.items.map((i) => i.name)
  : option("only", "")
    ? option("only").split(",").filter(Boolean)
    : REPRESENTATIVE;
const unknown = targets.filter((t) => !itemMap.has(t));
if (unknown.length) {
  log(`registry-check: unknown items: ${unknown.join(", ")}`);
  process.exit(1);
}

await waitForQuiet();
for (const id of wantedFrameworks) await ensureTemplate(cli, FRAMEWORKS[id]);
rmSync(SERVED, { recursive: true, force: true });
const { server, port } = await serve(SERVED);
const local = await buildRegistry({
  out: join(SERVED, "r"),
  base: `http://127.0.0.1:${port}/r`,
  writeRoot: false,
  quiet: true,
});
const localItems = new Map(local.items.map((i) => [i.name, i]));
log(
  `registry-check: serving ${local.items.length} items at http://127.0.0.1:${port}/r; checking ${targets.length}: ${targets.join(", ")}`,
);

mkdirSync(APPS, { recursive: true });
for (const id of wantedFrameworks) {
  const fw = FRAMEWORKS[id];
  // Next.js runs a representative subset (NEXT_ITEMS) unless --only / --all names the items.
  const fwTargets =
    id === "next" && !flag("all") && !option("only", "") ? NEXT_ITEMS.filter((n) => itemMap.has(n)) : targets;
  const queue = [...fwTargets];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let name = queue.shift(); name; name = queue.shift()) {
        const r = await checkItem(cli, name, port, localItems, flag("keep"), fw);
        report.results.push(r);
        log(
          `${r.ok ? "ok  " : "FAIL"} [${id}] ${name.padEnd(26)} ${((r.ms ?? 0) / 1000).toFixed(1)}s ${r.ok ? `${r.files} files, ${r.modules} modules` : `[${r.stage}]\n${r.error ?? ""}`}`,
        );
      }
    }),
  );
  if (!option("only", "")) {
    const inc = await checkIncremental(
      cli,
      INCREMENTAL.filter((n) => itemMap.has(n)),
      port,
      localItems,
      flag("keep"),
      fw,
    );
    (report.incremental ??= []).push(inc);
    log(
      `${inc.ok ? "ok  " : "FAIL"} ${inc.name} ${((inc.ms ?? 0) / 1000).toFixed(1)}s${inc.ok ? "" : `\n[${inc.stage}] ${inc.error ?? ""}`}`,
    );
    if (!inc.ok) failed = true;
  }
}
report.results.sort((a, b) => `${a.framework}${a.name}`.localeCompare(`${b.framework}${b.name}`));
server.close();

const bad = report.results.filter((r) => !r.ok);
if (bad.length) failed = true;
log(
  `\nregistry-check: ${report.results.length - bad.length}/${report.results.length} item installs built (${wantedFrameworks.join(", ")})${bad.length ? `; failed: ${bad.map((b) => `${b.framework}/${b.name}`).join(", ")}` : ""}`,
);
if (!failed && !flag("keep")) rmSync(APPS, { recursive: true, force: true });
finish();
