import assert from "node:assert/strict";
import { test } from "node:test";

import {
  commandedItems,
  hasAlsoGroup,
  hasAlsoLine,
  panelItems,
  uncoveredItems,
} from "../../demo/scripts/lib/files-panel.mjs";

const panel = (also) =>
  `<dl><dt>From <code>theme/src/</code></dt><dd><ul><li><code>components/dialog/</code></li></ul></dd>` +
  `<dt>shadcn CLI</dt><dd><code class="x">npx shadcn@latest add https://x.test/r/dialog.json</code><span>Registry item: dialog.</span></dd>` +
  (also
    ? `<dt>The examples also use</dt><dd><ul><li><code>components/button/</code></li></ul><code class="y">npx shadcn@latest add https://x.test/r/button.json https://x.test/r/input.json</code></dd>`
    : "") +
  `</dl>`;

test("the panel's own command and its also-uses command are read apart", () => {
  assert.deepEqual(panelItems(panel(true)), { own: ["dialog"], also: ["button", "input"] });
  assert.deepEqual(panelItems(panel(false)), { own: ["dialog"], also: [] });
});

test("an example import is covered by the item closure or the also-uses group, else reported", () => {
  const closure = new Set(["dialog", "portal"]);
  assert.deepEqual(uncoveredItems(["portal", "button", "button"], closure, ["button"]), []);
  assert.deepEqual(uncoveredItems(["portal", "button", "toast"], closure, ["button"]), ["toast"]);
});

test("the caller passes the closure of the install item plus the closures of the also-uses items", () => {
  const covered = new Set(["dialog", "button", "data-table", "avatar"]);
  assert.deepEqual(uncoveredItems(["avatar", "data-table"], covered, ["data-table"]), []);
  assert.deepEqual(uncoveredItems(["avatar", "select"], covered, ["data-table"]), ["select"]);
});

test("the also-use group and the twin line are detected, so the two can be required to agree", () => {
  assert.equal(hasAlsoGroup(panel(true)), true);
  assert.equal(hasAlsoGroup(panel(false)), false);
  assert.equal(hasAlsoLine("Import:\n\nThese examples also use button: `npx shadcn@latest add x`\n"), true);
  assert.equal(hasAlsoLine("This example also uses button"), false);
  assert.equal(hasAlsoLine("Nothing here"), false);
});

test("a long panel list installs only its first item, a short one installs all", () => {
  assert.deepEqual(commandedItems(["a", "b", "c"], 6), ["a", "b", "c"]);
  assert.deepEqual(commandedItems(["a", "b", "c", "d", "e", "f", "g"], 6), ["a"]);
});

test("the also-uses command is read when it sits in the focusable span of a command field", () => {
  const html = panel(true).replace(
    /<code class="y">([^<]*)<\/code>/,
    '<code class="home-cta__cmd" tabindex="0" role="region"><span tabindex="-1" class="outline-none">$1</span></code>',
  );
  assert.deepEqual(panelItems(html), { own: ["dialog"], also: ["button", "input"] });
});
