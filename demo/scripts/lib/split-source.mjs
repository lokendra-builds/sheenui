// Reads a table that is split into sibling modules (src/routes.ts + src/routes/*.ts, src/seo/meta.ts +
// src/seo/meta/*.ts) as text, for the build and check scripts that parse the source instead of importing it.

import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

/**
 * The files of a split table, in the order its index imports them: the index itself first, then each
 * part from the folder named like the index (`routes.ts` → `routes/`).
 * @param {string} indexFile absolute path of the index module (src/routes.ts, src/seo/meta.ts)
 * @returns {string[]} absolute paths
 */
export function splitFiles(indexFile) {
  const name = basename(indexFile).replace(/\.tsx?$/, "");
  const dir = join(dirname(indexFile), name);
  const re = new RegExp(`from\\s*(["'])\\./${name}/([\\w-]+)(?:\\.[cm]?[jt]sx?)?\\1`, "g");
  const parts = [...stripComments(readFileSync(indexFile, "utf8")).matchAll(re)].map((m) => resolvePart(dir, m[2]));
  return [indexFile, ...parts];
}

/** Drops block and line comments, so a commented-out import is not read as a part. */
export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

/** `<dir>/<name>.ts` or `.tsx`; a clear error when neither exists (a part the index imports but the folder lacks). */
function resolvePart(dir, name) {
  for (const ext of [".ts", ".tsx"]) {
    const file = join(dir, `${name}${ext}`);
    if (existsSync(file)) return file;
  }
  throw new Error(`split-source: part "${name}" is imported by the index but ${join(dir, name)}.ts(x) does not exist`);
}

/**
 * The text of a split table: its index and every part, joined in import order (the order the rows
 * appear in at run time). A table that is not split reads as the one file.
 * @param {string} indexFile absolute path of the index module
 * @returns {string}
 */
export function readSplitSource(indexFile) {
  return splitFiles(indexFile)
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}
