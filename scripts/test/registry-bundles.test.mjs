import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { ROOT } from "../build-registry.mjs";

const index = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8"));
const byName = new Map(index.items.map((i) => [i.name, i]));
const nameOf = (url) => url.replace(/^.*\/r\//, "").replace(/\.json$/, "");
const bundles = index.items.filter((i) => i.meta.kind === "bundle");

test("the five bundles exist and carry no files", () => {
  assert.deepEqual(bundles.map((b) => b.name).sort(), ["all", "blocks", "charts", "components", "dashboards"]);
  for (const b of bundles) {
    assert.equal(b.type, "registry:item");
    assert.deepEqual(b.files, []);
    assert.ok(b.registryDependencies.length > 1);
  }
});

test("bundle dependencies are absolute live URLs of existing items, theme first", () => {
  for (const b of bundles) {
    assert.match(b.registryDependencies[0], /^https:\/\/lokendra-builds\.github\.io\/sheenui\/r\/sheenui-theme\.json$/);
    for (const url of b.registryDependencies) assert.ok(byName.has(nameOf(url)), `${b.name} -> ${url}`);
  }
});

test("families hold exactly the items of their kind; dashboards are the five dashboards", () => {
  const of = (name) => new Set(byName.get(name).registryDependencies.map(nameOf));
  for (const [bundle, kind] of [
    ["components", "component"],
    ["charts", "chart"],
    ["blocks", "block"],
  ]) {
    const want = index.items.filter((i) => i.meta.kind === kind).map((i) => i.name);
    assert.deepEqual([...of(bundle)].filter((n) => n !== "sheenui-theme").sort(), want.sort());
  }
  assert.equal(of("dashboards").size, 6);
  assert.ok(of("dashboards").has("analytics-web"));
  assert.deepEqual([...of("all")].sort(), ["blocks", "charts", "components", "sheenui-theme"]);
});

test("bundles are not counted as registry items by the README facts", () => {
  const real = index.items.filter((i) => i.meta.kind !== "bundle").length;
  assert.equal(index.items.length - real, bundles.length);
});
