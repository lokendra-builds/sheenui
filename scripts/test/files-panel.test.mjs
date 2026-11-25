import assert from "node:assert/strict";
import { test } from "node:test";

import { panelItems, uncoveredItems } from "../../demo/scripts/lib/files-panel.mjs";

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
