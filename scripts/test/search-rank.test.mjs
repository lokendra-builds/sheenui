// node:test for the docs search ranker (demo/src/layout/search-rank.ts + search-synonyms.ts), with a small set of real titles.
import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_SEARCH_RESULTS, createRanker } from "../../demo/src/layout/search-rank.ts";
import { SEARCH_SYNONYMS } from "../../demo/src/layout/search-synonyms.ts";

const PAGES = {
  "/effects/animated-beam": "Animated beam",
  "/effects/border-beam": "Border beam",
  "/charts/heatmap": "Heatmap",
  "/charts/streamgraph": "Streamgraph",
  "/charts/calendar-heatmap": "Calendar heatmap",
  "/overlays/drawer": "Drawer / Sheet",
  "/overlays/side-drawer": "Side drawer",
  "/components/dialog": "Dialog",
  "/components/popover": "Popover",
  "/overlays/dropdown-menu": "Dropdown menu",
  "/components/select": "Select",
  "/components/data-table": "Data table",
  "/components/combobox": "Combobox (Select2)",
  "/overlays/command-palette": "Command palette (⌘K)",
  "/components/table": "Table",
  "/charts/error-bar-chart": "Error bars",
  "/charts/bar-chart": "Bar chart",
  "/blocks/not-found-page": "404 page",
  "/blocks/hero-section": "Hero section",
  "/blocks/site-footer": "Site footer",
  "/effects/orbiting-circles": "Orbiting circles",
  "/effects/scroll-progress": "Scroll progress",
  "/effects/text-reveal": "Text reveal",
  "/charts/population-pyramid": "Population pyramid",
  "/charts/bump-chart": "Bump chart",
  "/components/button": "Button",
  "/forms/segmented-control": "Segmented control",
};

/** The paths of the matching pages in rank order, capped like the palette. */
const ranker = createRanker(
  new Map(
    Object.entries(PAGES).map(([path, title]) => [
      path,
      { title, ...SEARCH_SYNONYMS[path], body: path.split("/").flatMap((p) => p.split("-")) },
    ]),
  ),
);
function search(query) {
  return Object.keys(PAGES)
    .map((path) => ({ path, match: ranker(path, query) }))
    .filter((r) => r.match)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, MAX_SEARCH_RESULTS)
    .map((r) => r.path);
}

test("an exact title beats a prefix, a prefix beats a word, a word beats a keyword", () => {
  assert.equal(search("button")[0], "/components/button");
  assert.equal(search("table")[0], "/components/table");
  assert.equal(search("table")[1], "/components/data-table");
  assert.equal(search("heat")[0], "/charts/heatmap");
});

test("beam: Animated beam and Border beam lead", () => {
  const top = search("beam").slice(0, 3);
  assert.ok(top.includes("/effects/animated-beam") && top.includes("/effects/border-beam"), top.join());
  assert.ok(!search("beam").includes("/charts/streamgraph"));
});

test("sheet: the drawers first, then the bottom-sheet examples, no noise", () => {
  const found = search("sheet");
  assert.deepEqual(found.slice(0, 2), ["/overlays/drawer", "/overlays/side-drawer"]);
  for (const path of ["/components/dialog", "/components/popover", "/overlays/dropdown-menu", "/components/select"]) {
    assert.ok(found.includes(path), path);
  }
  assert.ok(found.length <= 8, `${found.length} results`);
  assert.deepEqual(search("bottom sheet").slice(0, 2).sort(), ["/overlays/drawer", "/overlays/side-drawer"]);
});

test("virtualized and virtual list find the four virtualized pages", () => {
  for (const query of ["virtualized", "virtual list", "virtual"]) {
    const found = search(query);
    for (const path of [
      "/components/data-table",
      "/components/select",
      "/components/combobox",
      "/overlays/command-palette",
    ]) {
      assert.ok(found.includes(path), `${query}: ${path}`);
    }
  }
});

test("aliases of the newer pages", () => {
  assert.equal(search("confidence interval")[0], "/charts/error-bar-chart");
  assert.equal(search("404")[0], "/blocks/not-found-page");
  assert.equal(search("hero")[0], "/blocks/hero-section");
  assert.equal(search("footer")[0], "/blocks/site-footer");
  assert.equal(search("orbit")[0], "/effects/orbiting-circles");
  assert.equal(search("scroll progress")[0], "/effects/scroll-progress");
  assert.equal(search("text reveal")[0], "/effects/text-reveal");
  assert.equal(search("bump")[0], "/charts/bump-chart");
  assert.equal(search("pyramid")[0], "/charts/population-pyramid");
});

test("letters out of order still find a title, last; nothing matches nonsense", () => {
  assert.equal(search("segcon")[0], "/forms/segmented-control");
  assert.deepEqual(search("zzzq"), []);
});
