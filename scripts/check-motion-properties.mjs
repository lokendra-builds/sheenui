#!/usr/bin/env node
// Motion-property gate: walks EVERY source file in theme/src and demo/src (all CSS, every component, block and chart, every Motion
// prop) and fails when something transitions or animates a property other than transform / opacity / a colour without an
// entry in theme/motion-exceptions.json. It is the static twin of the runtime walk in theme/test/motion-gates.test.tsx.
//   node scripts/check-motion-properties.mjs          check; also fails on a stale or imprecise exception
//   node scripts/check-motion-properties.mjs --list   print every hit with its exception
//
// An exception names the component, the property, the FILE it lives in, a duration cap and a reason. Only the paint-only colour
// properties may use the component `*` (they are policy, see MOTION 6.1). An entry that no file needs any more is stale and fails.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { withoutAppleDouble } from "./lib/fs-filter.mjs";
import { scanSource } from "./lib/motion-scan.mjs";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const DIRS = ["theme/src", "demo/src"];
const SKIP_DIR = /(^|\/)(generated|seo|node_modules)(\/|$)/;
const SKIP_FILE = /(\.test\.tsx?|\.d\.ts)$/;
const WILDCARD_OK = new Set(["color", "background-color", "border-color", "outline-color", "text-decoration-color"]);

/** The component a file belongs to (the exception's `component`). */
export function componentOf(rel) {
  let m = /^theme\/src\/components\/charts\/([^/]+?)(?:\.tsx?|\/)/.exec(rel);
  if (m) return m[1];
  m = /^theme\/src\/components\/([^/]+)\//.exec(rel);
  if (m) return m[1];
  m = /^theme\/src\/blocks\/([^/]+?)(?:\.tsx?|\/)/.exec(rel);
  if (m) return m[1];
  if (rel.startsWith("theme/src/styles")) return "styles";
  if (rel.startsWith("theme/src/motion")) return "motion";
  return rel.startsWith("demo/") ? "demo" : "library";
}

/**
 * Checks `hits` ([{ file, line, property, via }]) against `exceptions`: returns the problems (hits without an entry, stale
 * or imprecise entries). Pure, so scripts/test can drive it.
 */
export function check(hits, exceptions) {
  const problems = [];
  const used = new Set();
  exceptions.forEach((e, i) => {
    const id = `${e.component}/${e.property}${e.file ? ` (${e.file})` : ""}`;
    if (!e.component || !e.property || !e.reason || e.reason.length < 15)
      problems.push(`exception ${id}: needs component, property and a real reason`);
    if (e.component === "*" && !WILDCARD_OK.has(e.property))
      problems.push(`exception ${id}: only the paint-only colour properties may use the wildcard component`);
    if (e.component !== "*" && (!e.file || !e.cap))
      problems.push(`exception ${id}: needs a "file" and a duration "cap"`);
    if (e.file && componentOf(e.file) !== e.component)
      problems.push(`exception ${id}: component should be "${componentOf(e.file)}" for that file`);
    void i;
  });
  for (const h of hits) {
    const idx = exceptions.findIndex(
      (e) =>
        e.property === h.property &&
        (e.component === "*" || (e.file === h.file && e.component === componentOf(h.file))),
    );
    if (idx < 0)
      problems.push(
        `${h.file}:${h.line}  ${h.property} animated by ${h.via}: no entry in theme/motion-exceptions.json`,
      );
    else used.add(idx);
  }
  exceptions.forEach((e, i) => {
    if (e.file && !used.has(i))
      problems.push(`stale exception ${e.component}/${e.property} (${e.file}): nothing animates it any more`);
  });
  return problems;
}

function* files(dir) {
  for (const name of withoutAppleDouble(readdirSync(dir))) {
    const p = join(dir, name);
    const rel = relative(root, p);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIR.test(rel)) yield* files(p);
    } else if (/\.(tsx?|css)$/.test(name) && !SKIP_FILE.test(rel)) yield p;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const exceptions = JSON.parse(readFileSync(join(root, "theme/motion-exceptions.json"), "utf8"));
  const hits = [];
  let scanned = 0;
  for (const d of DIRS)
    for (const file of files(join(root, d))) {
      scanned++;
      const rel = relative(root, file);
      for (const h of scanSource(rel, readFileSync(file, "utf8"))) hits.push({ file: rel, ...h });
    }
  if (process.argv.includes("--list")) {
    for (const h of hits) console.log(`${h.file}:${h.line}\t${h.property}\t${h.via}`);
    process.exit(0);
  }
  const problems = check(hits, exceptions);
  if (problems.length) {
    console.error(`motion properties: ${problems.length} problem(s):\n`);
    for (const p of problems) console.error("  " + p);
    console.error(
      "\nAnimate transform / opacity instead, or record a precise exception (file, property, cap, reason) in theme/motion-exceptions.json.",
    );
    process.exit(1);
  }
  console.log(
    `motion properties: ok (${scanned} files walked, ${hits.length} non-compositor animations, all with a precise exception)`,
  );
}
