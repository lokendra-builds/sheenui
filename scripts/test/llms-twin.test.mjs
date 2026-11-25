// node:test for the Markdown twins: hub cards become link lists, in-body links survive, interface chrome stays out.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { writeLlmsFiles } from "../../demo/scripts/lib/llms.mjs";

const SITE = "https://example.com/sheenui";

/** Writes `files` ({ name: html }) into a temp dist, runs the generator and returns a reader for the dist. */
function build(files, group, paths, alsoUses = {}) {
  const dist = mkdtempSync(join(tmpdir(), "llms-twin-"));
  for (const [name, html] of Object.entries(files)) writeFileSync(join(dist, name), html);
  writeLlmsFiles({
    dist,
    siteUrl: SITE,
    pages: paths.map(([path, file]) => ({
      route: { path, group, title: "T" },
      seo: { canonical: `${SITE}${path}`, ogTitle: "T", description: "D", answer: "", install: "" },
      files: [file],
      example: null,
    })),
    counts: {},
    author: "A. Author",
    alsoUses,
  });
  return (twin) => readFileSync(join(dist, twin), "utf8");
}

const card = (name, href, desc, chips = []) =>
  `<li><div><div aria-hidden="true" data-kind="x"><i></i></div><h3 id="page-${name}"><a href="${href}">${name}</a></h3><p>${desc}</p>${
    chips.length ? `<p>${chips.map((c) => `<span>${c}</span>`).join("")}</p>` : ""
  }</div></li>`;

test("hub twin: every card is `- [Name](absolute url): description`, chips in parentheses, counters left out", () => {
  const read = build(
    {
      "components.html": `<html><body><article><header><nav aria-label="Breadcrumb"><ol><li><a href="/sheenui/">Home</a></li><li aria-hidden="true">›</li><li><span aria-current="page">All components</span></li></ol></nav><h1>Hub</h1><p>Glass UI components for React: buttons, forms and dialogs, ready to copy.</p></header>
      <section><h2>Components (2)</h2><p>The everyday parts, from buttons to dialogs and tabs.</p>
      <ul>${card("Badge", "/sheenui/components/badge", "A React badge is a small glass label.")}${card("Line chart", "/sheenui/charts/line-chart", "Change over time for a few series", ["Trend", "KPI"])}</ul>
      <p aria-live="polite">Showing 12 of 52 chart previews</p></section></article></body></html>`,
    },
    "Components",
    [["/components", "components.html"]],
  );
  const twin = read("components.md");
  assert.match(
    twin,
    /^- \[Badge\]\(https:\/\/example\.com\/sheenui\/components\/badge\): A React badge is a small glass label\.$/m,
  );
  assert.match(
    twin,
    /^- \[Line chart\]\(https:\/\/example\.com\/sheenui\/charts\/line-chart\): Change over time for a few series \(Trend, KPI\)$/m,
  );
  assert.equal(
    /Badge[A-Z]|seriesTrend|Showing 12 of 52/.test(twin),
    false,
    "names glued to descriptions or a UI counter leaked",
  );
  assert.match(twin, /^Breadcrumb: \[Home\]\(https:\/\/example\.com\/sheenui\/\) > All components$/m);
});

test("component page twin: in-body links, Related pages, files and install as code, no interface text", () => {
  const read = build(
    {
      "dialog.html": `<html><body><article><header><nav aria-label="Breadcrumb"><ol><li><a href="/sheenui/">Home</a></li><li aria-hidden="true">›</li><li><a href="/sheenui/components/">Components</a></li><li aria-hidden="true">›</li><li><span aria-current="page">Dialog</span></li></ol></nav><h1>Dialog</h1>
      <p>A glass modal dialog; pair it with the <a href="/sheenui/components/button">Button</a> for the trigger and follow the <a href="https://github.com/o/r" target="_blank">repo<span> (GitHub, opens in a new tab)</span></a>.</p>
      <p>Static copy. <span class="sr-only">(opens in a new tab)</span></p></header>
      <details><summary><h2>Files to copy</h2><span>2 folders</span></summary><dl><dt>From <code>theme/src/</code></dt><dd><ul><li><code>components/dialog/</code></li><li><code>hooks/<!-- -->{use-latest.ts, cn.ts}</code></li></ul></dd><dt>shadcn CLI</dt><dd><code>npx shadcn@latest add ${SITE}/r/dialog.json</code><span>Registry item: dialog. The styles need the <a href="/sheenui/docs/tailwind-v4">Tailwind v4 setup</a>.</span></dd><dt>Packages</dt><dd><code>pnpm add @base-ui/react clsx</code></dd></dl></details>
      <section><h2>Related pages</h2><ul><li><a href="/sheenui/overlays/alert-dialog">Alert dialog</a></li><li><a href="/sheenui/overlays/drawer">Drawer / Sheet</a></li></ul>
      <p>67<!-- --> <!-- -->components<!-- --> pages in all: browse them on <a href="/sheenui/components/">All components</a>.</p></section></article></body></html>`,
    },
    "Components",
    [["/components/dialog", "dialog.html"]],
  );
  const twin = read("components/dialog.md");
  assert.match(
    twin,
    /pair it with the \[Button\]\(https:\/\/example\.com\/sheenui\/components\/button\) for the trigger/,
  );
  assert.match(twin, /follow the \[repo\]\(https:\/\/github\.com\/o\/r\)\./);
  assert.match(twin, /^- \[Alert dialog\]\(https:\/\/example\.com\/sheenui\/overlays\/alert-dialog\)$/m);
  assert.match(twin, /browse them on \[All components\]\(https:\/\/example\.com\/sheenui\/components\/\)\./);
  assert.match(twin, /^Breadcrumb: \[Home\]\(.*\/sheenui\/\) > \[Components\]\(.*\/sheenui\/components\/\) > Dialog$/m);
  assert.match(twin, /^- `components\/dialog\/`$/m);
  assert.match(twin, /^- `hooks\/\{use-latest\.ts, cn\.ts\}`$/m);
  assert.match(twin, /```bash\npnpm add @base-ui\/react clsx\n```/);
  assert.match(twin, /```bash\nnpx shadcn@latest add https:\/\/example\.com\/sheenui\/r\/dialog\.json\n```/);
  assert.equal(twin.split("npx shadcn@latest add").length - 1, 1, "the shadcn command is emitted once per twin");
  assert.match(twin, /\[Tailwind v4 setup\]\(https:\/\/example\.com\/sheenui\/docs\/tailwind-v4\)/);
  assert.equal(/opens in a new tab/.test(twin), false, "the hidden external-link hint leaked");
});

test('a page with an "also use" entry gets the "These examples also use" line, files-only entries included', () => {
  const html = `<html><body><article><header><h1>Carousel</h1><p>A carousel.</p></header>
  <pre><code>import { Carousel } from "@sheenui/theme";\nexport const X = () => null;</code></pre></article></body></html>`;
  const read = build({ "carousel.html": html }, "Components", [["/components/carousel", "carousel.html"]], {
    "/components/carousel": { units: ["components/carousel/carousel-caption.tsx"], items: [], packages: [] },
  });
  assert.match(
    read("components/carousel.md"),
    /^These examples also use files from `theme\/src\/`.*carousel-caption\.tsx`$/m,
  );
  const none = build({ "carousel.html": html }, "Components", [["/components/carousel", "carousel.html"]]);
  assert.doesNotMatch(none("components/carousel.md"), /These examples also use/);
});
