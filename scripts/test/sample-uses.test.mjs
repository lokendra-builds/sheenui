import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { declarations, sampleNames } from "../../demo/scripts/lib/sample-uses.mjs";
import { alsoMask } from "../../demo/scripts/gen-props.mjs";

test("a sample's own `export function` inside a template literal is not a page declaration", () => {
  const source = [
    "const sample = `",
    'import { useToast } from "@sheenui/theme";',
    "export function Example() {}",
    "${nested}`;",
    "export function Page() {}",
  ].join("\n");
  assert.deepEqual([...declarations(source).keys()], ["sample", "Page"]);
  assert.match(declarations(source).get("sample"), /useToast/);
});

test("the also-uses mask marks the sorted route paths that have an entry", () => {
  // sorted: /a /b /c /d /e -> bits 0 1 0 0 1 (+ padding 000) = 0100 1000
  assert.equal(alsoMask(["/e", "/a", "/c", "/b", "/d"], ["/b", "/e"]), "48");
});

test("a type-only name in a sample's import counts: the copied sample still imports its file", () => {
  const dir = mkdtempSync(join(tmpdir(), "sample-uses-"));
  const file = join(dir, "page.tsx");
  const sample = [
    "const code = `",
    'import { type DateRange, DatePicker } from "@sheenui/theme";',
    'import type { Foo } from "@sheenui/theme";',
    "`;",
  ];
  writeFileSync(file, [...sample, "export function Page() { return code; }"].join("\n"));
  assert.deepEqual([...sampleNames(file, "Page")].sort(), ["DatePicker", "DateRange", "Foo"]);
});
