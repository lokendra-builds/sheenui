// node:test for the llms api-index: a core export points at its own docs page, never at a page that only uses it.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { findDuplicatedRun } from "../../demo/scripts/lib/duplicate-run.mjs";
import { apiPageFor, apiPageUrl, exportCatalog, namesExport, writeLlmsFiles } from "../../demo/scripts/lib/llms.mjs";

test("core exports resolve to their own component page", () => {
  const { routeOf } = exportCatalog();
  const byRoute = new Map([...routeOf.values()].map((path) => [path, `https://example.com${path}`]));
  const want = {
    Button: "/components/button",
    Input: "/components/input",
    Select: "/components/select",
    Alert: "/components/alert",
    Dialog: "/components/dialog",
    Tabs: "/components/tabs",
    DataTable: "/components/data-table",
  };
  for (const [name, path] of Object.entries(want)) {
    assert.equal(
      apiPageUrl(name, routeOf, byRoute, "https://example.com/docs/forms"),
      `https://example.com${path}`,
      name,
    );
  }
});

test("an export without an owner route falls back to the first page that imports it", () => {
  assert.equal(
    apiPageUrl("Nope", new Map(), new Map(), "https://example.com/docs/forms"),
    "https://example.com/docs/forms",
  );
});

test("types and helpers resolve to the page of the component they belong to", () => {
  const { routeOf } = exportCatalog();
  const byRoute = new Map(
    [...routeOf.values(), "/charts/line-chart", "/charts/radial-bar-chart"].map((p) => [p, `https://example.com${p}`]),
  );
  const url = (name) => apiPageUrl(name, routeOf, byRoute, "https://example.com/docs/rtl");
  assert.equal(url("ChartSeries"), "https://example.com/charts/line-chart");
  assert.equal(url("FileUploadItem"), "https://example.com/forms/file-upload");
  assert.equal(url("RadialProgress"), "https://example.com/charts/radial-bar-chart");
});

test("exports.txt lists the first export alphabetically (Accordion) and a guide twin holds its body once", () => {
  const dist = mkdtempSync(join(tmpdir(), "llms-test-"));
  const html = `<html><body><article><header><p>Lede paragraph that the Markdown source also holds, long enough to be noticed.</p></header>
    <p>A loose paragraph after the header that the Markdown source also holds in its own words.</p></article></body></html>`;
  writeFileSync(join(dist, "index.html"), html);
  mkdirSync(join(dist, "guides"), { recursive: true });
  const page = (path, group) => ({
    route: { path, group, title: "T" },
    seo: { canonical: `https://example.com${path}`, ogTitle: "T", description: "D", answer: "", install: "" },
    files: ["index.html"],
    example: null,
  });
  writeLlmsFiles({
    dist,
    siteUrl: "https://example.com",
    pages: [page("/guides/base-ui-vs-radix", "Guides"), page("/layout/accordion", "Layout")],
    counts: {},
    author: "A. Author",
  });
  // llms.txt lists hubs and guides and points to the section files; llms-full.txt lists every page with its URL.
  const index = readFileSync(join(dist, "llms.txt"), "utf8");
  assert.match(index, /\]\(https:\/\/example.com\/guides\/base-ui-vs-radix\)/);
  assert.equal(index.includes("(https://example.com/layout/accordion)"), false);
  assert.match(index, /llms\/layout\.txt/);
  assert.match(readFileSync(join(dist, "llms-full.txt"), "utf8"), /\]\(https:\/\/example.com\/layout\/accordion\)/);
  assert.match(readFileSync(join(dist, "llms/exports.txt"), "utf8"), /^- Accordion \(/m);
  const twin = readFileSync(join(dist, "guides/base-ui-vs-radix.md"), "utf8");
  // A guide's twin carries the author and the dates of its front matter, and one H1.
  assert.match(twin, /^By A\. Author\. Published November 8, 2026, updated /m);
  assert.equal(twin.split("\n").filter((l) => /^# /.test(l)).length, 1);
  assert.equal(twin.includes("A loose paragraph after the header"), false);
  assertNoDuplicatedRun(twin);
  assertNoDuplicatedRun(readFileSync(join(dist, "llms/guides.txt"), "utf8"));
});

function assertNoDuplicatedRun(text) {
  assert.equal(findDuplicatedRun(text), null);
}

test("findDuplicatedRun spots a body emitted twice and passes a single copy", () => {
  const body = Array.from({ length: 30 }, (_, i) => `Sentence number ${i} says something distinct about glass.`).join(
    " ",
  );
  assert.equal(findDuplicatedRun(body), null);
  assert.ok(findDuplicatedRun(`${body}\n\n${body}`));
});

test("every table of a page's main content appears in its Markdown twin (props tables are structured, demo tables skipped)", () => {
  const dist = mkdtempSync(join(tmpdir(), "llms-table-"));
  writeFileSync(
    join(dist, "index.html"),
    `<html><body><article><header><p>Lede paragraph long enough to be noticed as the intro of this page.</p></header>
    <section><h2>Compared</h2><table><caption>Templates</caption><thead><tr><th>Name</th><th>Data</th></tr></thead>
    <tbody><tr><th>Web</th><td>points | kpis</td></tr></tbody></table></section>
    <section><h2>Live</h2><div role="tabpanel"><table><thead><tr><th>Skip</th><th>Me</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table></div></section>
    </article></body></html>`,
  );
  writeLlmsFiles({
    dist,
    siteUrl: "https://example.com",
    pages: [
      {
        route: { path: "/dashboards", group: "Dashboards", title: "T" },
        seo: { canonical: "https://example.com/dashboards", ogTitle: "T", description: "D", answer: "", install: "" },
        files: ["index.html"],
        example: null,
      },
    ],
    counts: {},
    author: "A. Author",
  });
  const twin = readFileSync(join(dist, "dashboards.md"), "utf8");
  assert.match(twin, /\| Name \| Data \|\n\| --- \| --- \|\n\| Web \| points \\\| kpis \|/);
  assert.equal(twin.includes("| Skip | Me |"), false);
});

test("an export maps to a page only when that page's text names it", () => {
  assert.equal(namesExport("uses ChartLegend here", "ChartLegend"), true);
  assert.equal(namesExport("uses ChartLegendProps here", "ChartLegend"), false);
  const routeOf = new Map([
    ["ChartLegend", "/charts"],
    ["CalendarDatum", "/forms/calendar"],
    ["Ghost", "/charts"],
  ]);
  const byRoute = new Map(
    ["/charts", "/charts/line-chart", "/forms/calendar", "/charts/calendar-heatmap"].map((p) => [
      p,
      `https://x.test${p}`,
    ]),
  );
  const textOf = new Map([
    ["https://x.test/charts", "### ChartLegend props\n| a |"],
    ["https://x.test/charts/line-chart", "a line chart"],
    ["https://x.test/forms/calendar", "a calendar page"],
    ["https://x.test/charts/calendar-heatmap", "Pass CalendarDatum[] as data. CalendarDatum CalendarDatum"],
  ]);
  const at = (name, firstSeen = "") => apiPageFor(name, { routeOf, byRoute, textOf, firstSeen });
  assert.equal(at("ChartLegend"), "https://x.test/charts"); // the hub documents it, line-chart does not
  assert.equal(at("CalendarDatum"), "https://x.test/charts/calendar-heatmap"); // not /forms/calendar
  assert.equal(at("Ghost"), ""); // no page names it: no page
});

test("a hook, a provider and a script map to the files the registry installs", async () => {
  const { loadInstallMap } = await import("../lib/install-imports.mjs");
  const map = loadInstallMap();
  assert.equal(map.barrel.useTheme, "@/components/sheenui/hooks/use-preferences");
  assert.equal(map.barrel.sheenPreferenceScript, "@/components/sheenui/hooks/use-preferences");
  assert.equal(map.barrel.SheenMotionProvider, "@/components/sheenui/motion/provider");
});
