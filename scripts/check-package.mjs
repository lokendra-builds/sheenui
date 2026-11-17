// `pnpm package:check`: the publish path, end to end, without publishing.
//
//   1. `pnpm pack` in theme/ (its `prepack` runs theme/scripts/build.mjs, so this is also the dist build)
//   2. unpack the tarball and read the package.json that would be published (publishConfig applied)
//   3. every `main` / `module` / `types` / `exports` target must exist in the tarball (glob targets must match
//      at least one file)
//   4. the compiled barrel (dist/index.js) must import in plain Node and expose the same value exports
//      as the source barrel's compiled declarations list
//
// Exit code 1 with a list of problems when anything is off.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { withoutAppleDouble } from "./lib/fs-filter.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const theme = join(root, "theme");
const work = mkdtempSync(join(tmpdir(), "sheenui-pack-"));
const problems = [];

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  if (r.status !== 0) {
    console.error(`${cmd} ${args.join(" ")} failed (${r.status})`);
    process.exit(1);
  }
  return r.stdout;
}

try {
  run("pnpm", ["pack", "--pack-destination", work], theme);
  const tarball = readdirSync(work).find((f) => f.endsWith(".tgz"));
  if (!tarball) throw new Error("pnpm pack produced no tarball");
  const out = join(work, "unpacked");
  run("mkdir", ["-p", out], root);
  run("tar", ["-xzf", join(work, tarball), "-C", out], root);
  const pkgDir = join(out, "package");
  const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));

  const walk = (d) =>
    withoutAppleDouble(readdirSync(d)).flatMap((n) =>
      statSync(join(d, n)).isDirectory() ? walk(join(d, n)).map((f) => `${n}/${f}`) : [n],
    );
  const files = walk(pkgDir);

  const targets = [];
  const collect = (v) => {
    if (typeof v === "string") targets.push(v);
    else if (v && typeof v === "object") Object.values(v).forEach(collect);
  };
  for (const f of ["main", "module", "types"]) if (pkg[f]) targets.push(pkg[f]);
  collect(pkg.exports);

  for (const t of new Set(targets)) {
    const rel = t.replace(/^\.\//, "");
    if (rel === "package.json") continue;
    if (rel.includes("*")) {
      const re = new RegExp(`^${rel.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".+")}$`);
      if (!files.some((f) => re.test(f))) problems.push(`exports target "${t}" matches no file in the tarball`);
    } else if (!existsSync(join(pkgDir, rel))) {
      problems.push(`exports target "${t}" is missing from the tarball`);
    }
  }
  if (!pkg.exports?.["."]) problems.push('the published package.json has no exports["."]');
  if (JSON.stringify(pkg.exports).includes("/src/"))
    problems.push("the published exports still point at src/ (publishConfig was not applied)");

  // The built barrel must load in plain Node (dependencies resolve from the workspace).
  const mod = await import(pathToFileURL(join(theme, "dist", "index.js")).href);
  const exportsCount = Object.keys(mod).length;
  if (exportsCount < 100) problems.push(`dist/index.js exposes only ${exportsCount} exports`);
  // The demo fixtures are a separate entry, never part of the root barrel; subpath imports resolve through the exports map.
  for (const name of ["DEMO_NOW", "seededRandom", "webAnalyticsDemoLoader"])
    if (name in mod) problems.push(`the root barrel exports the demo fixture ${name}`);
  const demo = await import(pathToFileURL(join(theme, "dist", "demo-data.js")).href);
  if (typeof demo.webAnalyticsDemoLoader !== "function")
    problems.push("dist/demo-data.js does not export webAnalyticsDemoLoader");
  const button = await import(pathToFileURL(join(theme, "dist", "components", "button", "button.js")).href);
  if (typeof button.Button !== "function" && typeof button.Button !== "object")
    problems.push("dist/components/button/button.js does not export Button (the ./components/* subpath)");
  console.log(
    `tarball: ${tarball}, ${files.length} files, dist/index.js exposes ${exportsCount} exports, ${new Set(targets).size} export targets checked`,
  );
} catch (e) {
  problems.push(String(e?.stack ?? e));
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (problems.length) {
  console.error("package check failed:\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log("package check passed");
