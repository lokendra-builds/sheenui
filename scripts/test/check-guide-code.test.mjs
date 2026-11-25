import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { extractGuideSamples } from "../lib/guide-code.mjs";

const script = fileURLToPath(new URL("../check-guide-code.mjs", import.meta.url));
const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const run = (dir) => spawnSync(process.execPath, [script, "--dir", fixture(dir)], { encoding: "utf8" });

test("fences: ts/tsx/jsx/js are samples, markers pick fragment or external, other languages are ignored", () => {
  const md =
    "```tsx\nconst a = 1;\n```\n```ts fragment\nb();\n```\n```tsx external\nc();\n```\n```css\nx{}\n```\n```bash\nls\n```\n";
  const found = extractGuideSamples(md, "g.md");
  assert.deepEqual(
    found.map((s) => [s.lang, s.kind, s.line]),
    [
      ["tsx", "module", 1],
      ["ts", "fragment", 4],
      ["tsx", "external", 7],
    ],
  );
});

test("a file header names the module so a sibling sample can import it", () => {
  const [s] = extractGuideSamples("```ts\n// file: displacement-map.ts\nexport const a = 1;\n```\n", "g.md");
  assert.equal(s.name, "displacement-map.ts");
});

test("a guide with a good module, a fragment and an external sample passes and counts each", () => {
  const r = run("guides-ok");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /guide\.md: 1 compiled, 1 fragment, 1 external/);
  assert.match(r.stdout, /3 samples \(1 compiled as modules, 1 fragments, 1 external, not compiled\), 0 failing/);
});

test("a broken sample fails the check and is named by file and line", () => {
  const r = run("guides-bad");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /guides-bad\/guide\.md:\d+ .*TS2322/);
  assert.match(r.stdout, /1 failing/);
});
