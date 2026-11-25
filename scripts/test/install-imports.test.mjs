import assert from "node:assert/strict";
import { test } from "node:test";

import {
  extraItems,
  extrasLine,
  itemClosure,
  loadInstallMap,
  withCopiedImports,
  withNoteUnderImports,
} from "../lib/install-imports.mjs";

const map = loadInstallMap();

test("every barrel and demo-data name resolves to a file the registry installs", () => {
  assert.ok(Object.keys(map.barrel).length > 1000);
  for (const target of [...Object.values(map.barrel), ...Object.values(map.demoData)])
    assert.ok(map.targets.has(target), target);
});

test("a package import becomes the copied path, with the package form kept as a comment", () => {
  const { code, unknown } = withCopiedImports(
    'import { Button, type ButtonProps } from "@sheenui/theme";\n\nconst x = 1;',
    map,
  );
  assert.deepEqual(unknown, []);
  assert.match(
    code,
    /^import \{ Button, type ButtonProps \} from "@\/components\/sheenui\/button\/button";\n\/\/ Package build \(after the first npm release, or a packed tarball\): import \{ Button, type ButtonProps \} from "@sheenui\/theme";\n\nconst x = 1;$/,
  );
});

test("a name the registry does not install stays on the package import", () => {
  const { code, unknown } = withCopiedImports('import { Button, NoSuchThing } from "@sheenui/theme";', map);
  assert.deepEqual(unknown, ["NoSuchThing"]);
  assert.match(code, /import \{ NoSuchThing \} from "@sheenui\/theme";/);
});

test("the docs site's Copied files tab (import-rewrite.ts) rewrites to the same paths as the registry targets", async () => {
  const { readFileSync } = await import("node:fs");
  const generated = readFileSync(new URL("../../demo/src/generated/install-paths.ts", import.meta.url), "utf8");
  const table = JSON.parse(/=\s*(\{.*\});\s*$/m.exec(generated)[1]);
  // import-rewrite.ts: `@/components/sheenui/${file.replace(/^components\//, "")}`
  for (const [entry, names] of [
    ["barrel", map.barrel],
    ["demoData", map.demoData],
  ])
    for (const [name, file] of Object.entries(table[entry]))
      assert.equal(`@/components/sheenui/${file.replace(/^components\//, "")}`, names[name], name);
});

test("a sample's imports that the install item does not bring in are listed as extra items", () => {
  const code = 'import { Alert, Button } from "@sheenui/theme";\n\n<Alert><Button /></Alert>';
  assert.ok(itemClosure(map, "alert").has("sheenui-theme"));
  assert.deepEqual(extraItems(code, map, "alert"), ["button"]);
  assert.deepEqual(extraItems(code, map, "button"), ["alert"]);
  assert.deepEqual(extraItems('import { Alert } from "@sheenui/theme";', map, "alert"), []);
  // a theme export (hook, provider, script) is installed with every item
  assert.deepEqual(extraItems('import { useTheme } from "@sheenui/theme";', map, "alert"), []);
  const line = extrasLine(["button", "input"], "https://x.test");
  assert.equal(
    line,
    "These examples also use button, input: `npx shadcn@latest add https://x.test/r/button.json https://x.test/r/input.json`",
  );
  assert.equal(extrasLine([], "https://x.test"), "");
});

test("the note goes under the last import (and its package-form comment), also for a multi-line import", () => {
  const { code } = withCopiedImports(
    'import {\n  Alert,\n  Button,\n} from "@sheenui/theme";\nimport { useState } from "react";\n\nconst x = 1;',
    map,
  );
  const noted = withNoteUnderImports(code, "These examples also use Button: `npx shadcn@latest add u`");
  const lines = noted.split("\n");
  const at = lines.findIndex((l) => l.startsWith("// These examples"));
  assert.match(lines[at - 1], /from "react";$/);
  assert.equal(lines[at + 1], "");
  assert.equal(withNoteUnderImports("const x = 1;", "note"), "const x = 1;");
});
