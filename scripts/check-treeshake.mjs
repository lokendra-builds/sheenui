// `pnpm treeshake:check`: proves the compiled package tree-shakes for a consumer, with a recorded size budget.
//
// Builds a three-line consumer (`import { Button } from "@sheenui/theme"; render it`) with Vite 8 / Rollup against
// theme/dist (what `pnpm pack` publishes; run `pnpm --filter @sheenui/theme build` first), with react and react-dom
// external (the app brings its own), and asserts:
//   1. the minified output stays under BUDGET_KB gzipped: importing one component from the barrel must not pull in
//      the other ~165 (charts, blocks, the Base UI parts they use, the geo data);
//   2. none of a list of heavy, unrelated modules ended up in the bundle (a marker string per module).
// It uses the theme's own Vite, so nothing is installed. Exit 1 with the numbers when either check fails.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";

/** Gzipped KB ceiling for the one-import consumer (the Button-only consumer measures about 18.5 KB; lower it when the real number drops). */
const BUDGET_KB = 25;
/** Strings that exist only in heavy modules and must be absent from a Button-only bundle. */
const MARKERS = ["world-110m", "Sankey", "Candlestick", "Histogram", "NetworkGraph", "ChordDiagram"];

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const theme = join(root, "theme");
const entryDist = join(theme, "dist", "index.js");
if (!existsSync(entryDist)) {
  console.error("treeshake:check: theme/dist is missing; run `pnpm --filter @sheenui/theme build` first");
  process.exit(1);
}
const { build } = await import(pathToFileURL(createRequire(join(theme, "package.json")).resolve("vite")).href);

const work = join(theme, "node_modules", ".cache", "treeshake-check");
const out = join(work, "out");
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
writeFileSync(
  join(work, "entry.js"),
  [
    'import { createElement } from "react";',
    'import { createRoot } from "react-dom/client";',
    'import { Button } from "@sheenui/theme";',
    'createRoot(document.body).render(createElement(Button, null, "Save"));',
    "",
  ].join("\n"),
);

try {
  await build({
    root: work,
    logLevel: "silent",
    configFile: false,
    resolve: { alias: { "@sheenui/theme": entryDist } },
    build: {
      outDir: out,
      emptyOutDir: true,
      minify: true,
      target: "es2022",
      rollupOptions: {
        input: join(work, "entry.js"),
        external: ["react", "react-dom", "react-dom/client", /^react\//],
      },
    },
  });
  const files = readdirSync(out, { recursive: true, withFileTypes: true }).filter(
    (f) => f.isFile() && f.name.endsWith(".js"),
  );
  const code = files.map((f) => readFileSync(join(f.parentPath, f.name), "utf8")).join("\n");
  const kb = gzipSync(code).length / 1024;
  const problems = [];
  if (kb > BUDGET_KB)
    problems.push(
      `measured ${kb.toFixed(1)} KB gzipped for the one-import bundle, which is over the ${BUDGET_KB} KB budget`,
    );
  for (const marker of MARKERS)
    if (code.includes(marker)) problems.push(`"${marker}" is in a Button-only bundle: something stopped tree-shaking`);
  console.log(`treeshake:check: Button-only consumer = ${kb.toFixed(1)} KB gzipped (budget ${BUDGET_KB} KB)`);
  if (problems.length) {
    for (const p of problems) console.error(`  ${p}`);
    process.exitCode = 1;
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
