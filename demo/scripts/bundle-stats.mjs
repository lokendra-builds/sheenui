// `node scripts/bundle-stats.mjs [outDir]`: what is inside the bundle. Runs the client build
// (no prerender, nothing written to demo/dist) and prints, for the entry's static closure and
// for any chunk named on the command line (CHUNK=react), the biggest source modules grouped by
// package, with rendered (minified, pre-gzip) bytes. Use it to find what pulls a heavy library
// into a shared chunk before touching `manualChunks`.
//
// Env: TOP (rows per chunk, default 25), MODULES (substring: also list matching modules of each expanded chunk), CHUNK (substring of a chunk file name to expand in
// addition to the entry), OUT (write the JSON report there).

import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "vite";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.argv[2] ?? join(tmpdir(), "sheenui-bundle-stats");
const TOP = Number(process.env.TOP ?? 25);
const CHUNK = process.env.CHUNK;

/** "…/node_modules/.pnpm/pkg@1/node_modules/pkg/dist/x.js" → "pkg"; theme / demo sources → their folder. */
function owner(id) {
  const nm = id.lastIndexOf("node_modules/");
  if (nm >= 0) {
    const rest = id.slice(nm + "node_modules/".length).split("/");
    return rest[0].startsWith("@") ? `${rest[0]}/${rest[1]}` : rest[0];
  }
  const theme = id.match(/theme\/src\/([^/]+(?:\/[^/]+)?)/);
  if (theme) return `theme/${theme[1].replace(/\.tsx?$/, "")}`;
  const demo = id.match(/demo\/src\/([^?]+)/);
  if (demo) return `demo/${demo[1]}`;
  return id.replace(/^.*\//, "");
}

const report = { chunks: [] };
const collect = {
  name: "collect-bundle-stats",
  apply: "build",
  generateBundle(_options, bundle) {
    for (const item of Object.values(bundle)) {
      if (item.type !== "chunk") continue;
      const owners = new Map();
      for (const [id, info] of Object.entries(item.modules ?? {})) {
        const key = owner(id);
        owners.set(key, (owners.get(key) ?? 0) + (info.renderedLength ?? 0));
      }
      report.chunks.push({
        file: item.fileName,
        isEntry: item.isEntry,
        isDynamicEntry: item.isDynamicEntry,
        bytes: Buffer.byteLength(item.code),
        gzip: gzipSync(item.code).length,
        imports: item.imports,
        dynamicImports: item.dynamicImports,
        owners: [...owners].sort((a, b) => b[1] - a[1]).map(([name, bytes]) => ({ name, bytes })),
        modules: Object.entries(item.modules ?? {})
          .map(([id, info]) => ({
            id: id.replace(/^.*node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?/, ""),
            bytes: info.renderedLength ?? 0,
          }))
          .sort((a, b) => b.bytes - a.bytes),
      });
    }
  },
};

await build({
  root: DEMO,
  configFile: join(DEMO, "vite.config.ts"),
  logLevel: "error",
  plugins: [collect],
  build: { outDir, emptyOutDir: true, manifest: false, reportCompressedSize: false },
});

const byFile = new Map(report.chunks.map((c) => [c.file, c]));
const entry = report.chunks.find((c) => c.isEntry);
const closure = new Set();
(function visit(file) {
  if (closure.has(file)) return;
  closure.add(file);
  for (const dep of byFile.get(file)?.imports ?? []) visit(dep);
})(entry.file);

const kb = (n) => (n / 1024).toFixed(1).padStart(7);
let total = 0;
console.log("Entry static closure (gzip KB, raw KB):");
for (const file of [...closure].sort((a, b) => byFile.get(b).gzip - byFile.get(a).gzip)) {
  const c = byFile.get(file);
  total += c.gzip;
  console.log(`${kb(c.gzip)} ${kb(c.bytes)}  ${file}`);
}
console.log(`${kb(total)}  total gzip\n`);

const expand = [...closure].filter((f) => f === entry.file || (CHUNK && f.includes(CHUNK)));
if (CHUNK) for (const c of report.chunks) if (c.file.includes(CHUNK) && !expand.includes(c.file)) expand.push(c.file);
for (const file of expand) {
  const c = byFile.get(file);
  console.log(`${file} (${kb(c.bytes).trim()} KB raw):`);
  for (const o of c.owners.slice(0, TOP)) console.log(`${kb(o.bytes)}  ${o.name}`);
  if (process.env.MODULES)
    for (const m of c.modules.filter((x) => x.id.includes(process.env.MODULES)).slice(0, TOP))
      console.log(`${kb(m.bytes)}    ${m.id}`);
  console.log("");
}

if (process.env.OUT) {
  mkdirSync(dirname(process.env.OUT), { recursive: true });
  writeFileSync(process.env.OUT, JSON.stringify(report, null, 2));
}
