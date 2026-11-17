// node:test: the page-instances transform rewrites real export statements only, never text inside a code sample.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const require = createRequire(new URL("../../demo/package.json", import.meta.url));
const { parseAst } = await import(pathToFileURL(require.resolve("vite")).href);
const { pageInstances } = await import("../../demo/vite.page-instances.mjs");

const plugin = pageInstances().find((p) => p.name === "sheen:page-instances:pages");
const run = (code) =>
  plugin.transform.call({ parse: (c) => parseAst(c) }, code, "/x/demo/src/pages/Some.tsx?page=Demo")?.code ?? "";

test("export statements are rewritten", () => {
  const out = run("export function Demo() { return 1; }\nexport const Other = 2;\nexport default function D() {}\n");
  assert.match(out, /^function Demo\(\)/m);
  assert.match(out, /^const Other = 2;/m);
  assert.match(out, /^const __unusedDefault = function D\(\)/m);
});

test("`export default` / `export const` lines inside a template literal are left exactly as authored", () => {
  const sample = "export default { plugins: [react()] };\nexport const x = 1;";
  const out = run("export function Demo() { return `" + sample + "`; }\n");
  assert.ok(out.includes(sample), out);
  assert.ok(!out.includes("__unused"), out);
});
