// `pnpm readme:index`: rewrites the two generated tables in README.md (the component index and the chart
// index) from demo/src/routes.ts, so a new route or a renamed slug cannot leave the README with a dead link.
// It also fills every `<!--n:key-->…<!--/n-->` number in the README (registry items, exports, pages, test files) from the
// code and fails when a guide quotes a different number. It prints the page counts the README quotes. It stops with a message when a chart page is not in a
// category below (add it to CHARTS), so the chart table cannot silently drop a page.
//
//   node scripts/readme-index.mjs            rewrite the blocks between the <!-- ...:start/end --> markers
//   node scripts/readme-index.mjs --check    change nothing; exit 1 when README.md is out of date

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

import { readSplitSource } from "../demo/scripts/lib/split-source.mjs";
import { withoutAppleDouble } from "./lib/fs-filter.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://lokendra-builds.github.io/sheenui";

const source = readSplitSource(join(ROOT, "demo", "src", "routes.ts"));

/** Every route with its group, in file order; `hidden` routes (test pages) are left out of the README. */
const starts = [...source.matchAll(/path: "([^"]+)"/g)];
const routes = starts.map((match, i) => {
  const chunk = source.slice(match.index, i + 1 < starts.length ? starts[i + 1].index : undefined);
  return {
    path: match[1],
    title: /title: "([^"]+)"/.exec(chunk)?.[1] ?? "",
    group: /group: "([^"]+)"/.exec(chunk)?.[1] ?? "",
    hidden: /hidden: true/.test(chunk),
  };
});
const visible = routes.filter((r) => !r.hidden);
const byGroup = new Map();
for (const r of visible) byGroup.set(r.group, [...(byGroup.get(r.group) ?? []), r]);

const link = (r) => `[${r.title}](${SITE}${r.path})`;
const byTitle = (a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase());
/** Hub routes list a group's pages; they document no component, so no page count includes them. */
const HUB_PATHS = new Set(["/components", "/charts", "/blocks", "/effects", "/dashboards", "/guides"]);
const isHub = (r) => HUB_PATHS.has(r.path);

/* ---------- Components ---------- */

const COMPONENT_GROUPS = [
  ["Start", "Install, setup, theory and the forms recipe"],
  ["Components", "Core controls and display"],
  ["Forms", "Inputs, pickers, upload"],
  ["Overlays", "Dialogs, menus, drawers, palettes"],
  ["Navigation", "Navbars and sidebars"],
  ["Layout", "Structure and flow"],
  ["Data display", "Content and feedback"],
  ["Chat", "Messaging UI"],
  ["Effects", "Motion and Liquid Glass"],
];
const SECTION_GROUPS = [
  ["Blocks", "Ready-made sections"],
  ["Dashboards", "Analytics templates"],
  ["Guides", "Tutorials, comparisons and install steps (the hub page comes first)"],
];

const rows = ["| Group | Components |", "|---|---|"];
let componentPages = 0;
for (const [group, blurb] of COMPONENT_GROUPS) {
  const items = (byGroup.get(group) ?? []).slice().sort(byTitle);
  const pages = items.filter((r) => !isHub(r));
  if (group !== "Start") componentPages += pages.length;
  rows.push(`| **${group}** (${pages.length})<br>${blurb} | ${items.map(link).join(" · ")} |`);
}
/** The two halves of componentPages: what the /components hub lists (every component group but Effects) and the effects pages. */
const componentsHub = COMPONENT_GROUPS.filter(([g]) => g !== "Start" && g !== "Effects").reduce(
  (n, [g]) => n + (byGroup.get(g) ?? []).filter((r) => !isHub(r)).length,
  0,
);
const effectsPages = (byGroup.get("Effects") ?? []).filter((r) => !isHub(r)).length;
for (const [group, blurb] of SECTION_GROUPS) {
  const items = byGroup.get(group) ?? [];
  const label = group === "Guides" ? items.filter((r) => r.path !== "/guides").length : items.length;
  rows.push(`| **${group}** (${label})<br>${blurb} | ${items.map(link).join(" · ")} |`);
}
const componentTable = rows.join("\n");

/* ---------- Charts ---------- */

const CHARTS = [
  ["Core charts", ["line-chart", "area-chart", "bar-chart", "donut-chart", "sparkline"]],
  [
    "Trends and time",
    [
      "bump-chart",
      "combo-chart",
      "stacked-area-chart",
      "step-line-chart",
      "range-area-chart",
      "streamgraph",
      "realtime-chart",
      "candlestick",
      "calendar-heatmap",
      "gantt",
    ],
  ],
  [
    "Comparison",
    [
      "percent-stacked-bar-chart",
      "bar-list",
      "category-bar",
      "diverging-bar",
      "dumbbell",
      "lollipop",
      "population-pyramid",
      "radar-chart",
      "polar-area",
      "radial-bar-chart",
      "waterfall-chart",
    ],
  ],
  [
    "Distribution and correlation",
    ["histogram", "box-plot", "error-bar-chart", "beeswarm", "scatter-plot", "ridgeline", "heatmap"],
  ],
  ["Parts of a whole", ["pie-chart", "treemap", "sunburst", "waffle", "marimekko"]],
  ["Flow and funnels", ["sankey-diagram", "chord-diagram", "network-graph", "funnel-chart", "cohort-retention"]],
  ["KPIs and status", ["gauge-chart", "bullet-chart", "sparkbar", "uptime-tracker"]],
  ["Maps", ["world-map"]],
];
const chartPages = new Map(
  (byGroup.get("Charts") ?? []).filter((r) => r.path !== "/charts").map((r) => [r.path.split("/").pop(), r]),
);
const listed = CHARTS.flatMap(([, slugs]) => slugs);
const missing = [...chartPages.keys()].filter((slug) => !listed.includes(slug));
const unknown = listed.filter((slug) => !chartPages.has(slug));
if (missing.length || unknown.length) {
  console.error(
    `readme-index: the chart categories are out of date. Not in a category: ${missing.join(", ") || "none"}. No such route: ${unknown.join(", ") || "none"}.`,
  );
  process.exit(1);
}
const chartTable = [
  "| Category | Chart pages |",
  "|---|---|",
  ...CHARTS.map(
    ([name, slugs]) =>
      `| **${name}** (${slugs.length}) | ${slugs.map((slug) => link(chartPages.get(slug))).join(" · ")} |`,
  ),
].join("\n");

/* ---------- Facts: every number the README and the guides quote, computed from the code ---------- */

const registry = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8")).items;
const kinds = (kind) => registry.filter((i) => i.meta?.kind === kind).length;

function countFiles(dir, pattern) {
  let n = 0;
  for (const name of withoutAppleDouble(readdirSync(dir))) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) n += countFiles(abs, pattern);
    else if (pattern.test(name)) n += 1;
  }
  return n;
}

/** Runtime (value) exports of the package barrel, from the TypeScript API. */
function barrelValueExports() {
  const theme = join(ROOT, "theme");
  const config = ts.getParsedCommandLineOfConfigFile(
    join(theme, "tsconfig.json"),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
  );
  const entry = join(theme, "src/index.ts");
  const program = ts.createProgram([entry], { ...config.options, noEmit: true });
  const checker = program.getTypeChecker();
  return checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry))).filter((e) => {
    const target = e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e;
    return (target.flags & ts.SymbolFlags.Value) !== 0;
  }).length;
}

const themePkg = JSON.parse(readFileSync(join(ROOT, "theme", "package.json"), "utf8"));
const pinned = (name) =>
  String(themePkg.devDependencies?.[name] ?? themePkg.peerDependencies?.[name] ?? "").replace(/^[^\d]*/, "");

/** The gates of `pnpm verify`, in order, without the `pnpm ` prefix. */
const VERIFY_STEPS = String(JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).scripts.verify ?? "")
  .split("&&")
  .map((step) => step.trim().replace(/^pnpm /, ""));
const verifySteps = VERIFY_STEPS.join(", ");

const facts = {
  verifySteps,
  routes: routes.length,
  listed: visible.length,
  motion: pinned("motion"),
  baseUi: pinned("@base-ui/react"),
  registry: registry.length,
  registryUi: kinds("component") + kinds("chart"),
  registryBlocks: kinds("block"),
  exports: barrelValueExports(),
  components: componentPages,
  componentsHub,
  effects: effectsPages,
  charts: chartPages.size,
  blocks: (byGroup.get("Blocks") ?? []).filter((r) => r.path !== "/blocks").length,
  dashboards: (byGroup.get("Dashboards") ?? []).filter((r) => r.path !== "/dashboards").length,
  guides: (byGroup.get("Guides") ?? []).filter((r) => r.path !== "/guides").length,
  testFiles: countFiles(join(ROOT, "theme", "test"), /\.test\.tsx?$/),
};

/** Replaces `<!--n:key-->old<!--/n-->` with the computed number. */
const fillFacts = (text) =>
  text.replace(/<!--n:(\w+)-->[^<]*<!--\/n-->/g, (whole, key) => {
    if (!(key in facts)) {
      console.error(`readme-index: unknown fact "${key}" in a <!--n:…--> marker (README or an optional local note)`);
      process.exit(1);
    }
    return `<!--n:${key}-->${facts[key]}<!--/n-->`;
  });

/** The guides hold the same numbers as prose; they must agree with the facts (they are rendered as pages, so no markers). */
const guideProblems = [];
const GUIDE_CLAIMS = [
  [/registry (?:has|is built:) (\d+) items|\((\d+) items[:)]/g, "registry"],
  [/(\d+) component pages/g, "components"],
  [/(\d+) blocks/g, "blocks"],
  [/(\d+) (?:dashboard )?templates|(\d+) dashboard templates/g, "dashboards"],
  [/(\d+) UI items/g, "registryUi"],
  [/(\d+) block items/g, "registryBlocks"],
  [/Motion (\d+\.\d+\.\d+)/g, "motion"],
  [/Base UI (\d+\.\d+\.\d+)/g, "baseUi"],
];
// docs/guides is not part of every checkout (a fresh clone may have none): the guide-claim check runs only when the folder exists.
const guidesDir = join(ROOT, "docs", "guides");
if (!existsSync(guidesDir)) console.log("readme-index: docs/guides not present, guide-claim check skipped");
for (const name of existsSync(guidesDir)
  ? withoutAppleDouble(readdirSync(guidesDir)).filter((f) => f.endsWith(".md"))
  : []) {
  const text = readFileSync(join(ROOT, "docs", "guides", name), "utf8");
  for (const [pattern, key] of GUIDE_CLAIMS) {
    for (const m of text.matchAll(pattern)) {
      const n = key === "motion" || key === "baseUi" ? (m[1] ?? m[2]) : Number(m[1] ?? m[2]);
      if (n !== facts[key])
        guideProblems.push(`docs/guides/${name}: says ${n} for "${m[0]}", the code has ${facts[key]} (${key})`);
    }
  }
}

/* ---------- optional local contributor notes: the verify gates, generated from package.json; CI must run every one ---------- */

/** One sentence per gate. A verify step without a sentence here fails the check, so the contributor list cannot go stale. */
const VERIFY_NOTES = {
  "generated:check":
    "the generated files are current: props tables (`gen-props --check`), the registry (`registry:check:fast`: schema, consistency, no @internal name or constant in a documented import) and the README and optional local-note numbers and lists (`readme:index --check`).",
  "format:check": "Prettier, the whole repo.",
  "motion:literals":
    "no hard-coded `cubic-bezier(` curve, `ms` duration or `ease: [` array outside the token files (`scripts/check-motion-literals.mjs`).",
  "motion:properties":
    "only `transform` and `opacity` are animated (`scripts/check-motion-properties.mjs`; paint-only colours and listed exceptions aside).",
  typecheck: "theme, demo and the test projects, TypeScript strict.",
  lint: "ESLint with `--max-warnings 0`, including the doc-comment gate and the SheenUI rules.",
  "test:coverage":
    "the unit suite (Vitest browser mode + axe-core) with enforced coverage (lines, functions, statements >= 90 %, branches >= 80 %, and every file >= 55 % lines / 25 % branches; set in `theme/vitest.config.ts`).",
  build: "props tables, registry, demo bundle, SSR bundle and prerender of every route.",
  "outdated:check":
    "no dependency is behind its latest release except the one documented pin (root `typescript` 6.0.3, for typescript-eslint); the allow-list is in `scripts/check-outdated.mjs`.",
  "treeshake:check":
    "a consumer that imports only `Button` from the built package stays under a gzipped KB budget and pulls in none of the heavy modules (`scripts/check-treeshake.mjs`).",
  "package:check":
    "builds the `@sheenui/theme` package, runs `pnpm pack`, and checks that every export target exists in the tarball and that the built barrel imports in Node.",
  "seo:check":
    "titles, descriptions, canonicals, JSON-LD, sitemap and internal links of the built site (needs the build).",
  "docs:check":
    "every public prop on its page with a description and a Default that matches the code; every page code sample type-checks as pasted (`pagecode:check`); llms-full.txt carries every code block, heading and paragraph; every runtime export is searchable and summarised on the page it leads to.",
  "readme:index --check":
    "the README tables and the numbers quoted in the README and optional local notes (this list included) match the code; CI runs every verify gate; the changelog records new pages.",
  budget: "initial JS per route (gzip) against the 200 KB budget.",
  "examples:check": "every doc-comment `@example` compiles as a complete module (`--strict`).",
  "types:check": "every type named in a props table is exported from the package.",
  "e2e:chromium":
    "every Playwright spec except the timing gates, in Chromium, in parallel (`E2E_SKIP_TIMING=1`), including the visual snapshots. Local baselines are per machine (`*-darwin.png`, git-ignored): create them once with `pnpm e2e:visual:update`. CI compares against Linux baselines kept on the `visual-baselines` branch and fails when one is missing.",
  "e2e:motion":
    "the timing gates (`motion-gates.spec.ts`: no long task over 50 ms, layout shift under 0.002) alone with `--workers=1`, after the parallel suite. A run on a busy machine retries after the load falls and fails, never silently passes.",
};
const verifyList = VERIFY_STEPS.map((step, i) => {
  if (!(step in VERIFY_NOTES)) {
    console.error(`readme-index: the verify step "${step}" has no sentence in VERIFY_NOTES (scripts/readme-index.mjs)`);
    process.exit(1);
  }
  return `${i + 1}. \`pnpm ${step}\`: ${VERIFY_NOTES[step]}`;
}).join("\n");

/** How ci.yml runs a gate when it is not a literal `pnpm <step>` line. */
const CI_EQUIVALENTS = {
  "readme:index --check": "pnpm generated:check", // generated:check runs readme-index --check
  "e2e:chromium": "playwright test",
  "e2e:motion": "motion-gates",
};
// .github is not part of every checkout (a fresh clone of the public repo has none): the CI-drift check runs only when ci.yml exists.
const ciFile = join(ROOT, ".github", "workflows", "ci.yml");
if (existsSync(ciFile)) {
  const ci = readFileSync(ciFile, "utf8");
  const ciMissing = VERIFY_STEPS.filter(
    (step) => !ci.includes(`pnpm ${step}`) && !ci.includes(CI_EQUIVALENTS[step] ?? ""),
  );
  if (ciMissing.length) {
    console.error(`readme-index: .github/workflows/ci.yml does not run the verify gate(s): ${ciMissing.join(", ")}`);
    process.exit(1);
  }
} else console.log("readme-index: .github/workflows/ci.yml not present, CI-drift check skipped");

/* ---------- optional local notes: numbers from the code, no dead routes, no finished work listed as open ---------- */

// Notes that live only on the owner's machine are named in an optional, git-ignored config (`.handoff/readme-index.json`,
// read when present). A fresh clone and CI have none and skip all of this. Shape:
//   { "notes":     [{ "file": "x.md", "verifySteps": true }],       numbers refreshed; `verifySteps` also fills <!-- verify-steps -->
//     "changelog": "x.md",                                         routes named must exist; Unreleased must list new pages
//     "openTasks": { "file": "x.md", "doneMarkers": [], "stalePhrases": [] } }
const localConfigFile = join(ROOT, ".handoff", "readme-index.json");
const local = existsSync(localConfigFile) ? JSON.parse(readFileSync(localConfigFile, "utf8")) : {};
const readOptional = (name) => {
  const path = join(ROOT, name);
  return existsSync(path) ? { path, text: readFileSync(path, "utf8") } : null;
};

const changelog = local.changelog ? readOptional(local.changelog) : null;
const changelogBefore = changelog?.text ?? "";
const routePaths = new Set(routes.map((r) => r.path));
const changelogProblems = [];
for (const m of changelogBefore.matchAll(/`(\/[a-z0-9-]+(?:\/[a-z0-9-]+)+)`/g)) {
  if (!routePaths.has(m[1]))
    changelogProblems.push(`${local.changelog} names \`${m[1]}\`, which is not a route in demo/src/routes.ts`);
}
const unreleased = /## \[Unreleased\]([\s\S]*?)\n## \[/.exec(changelogBefore)?.[1] ?? "";
const lastRelease = /## \[\d+\.\d+\.\d+\][\s\S]*?(\d+) routes/.exec(changelogBefore);
if (lastRelease && Number(lastRelease[1]) !== routes.length) {
  const added = /### Added\n([\s\S]*?)(?:\n### |$)/.exec(unreleased)?.[1] ?? "";
  if (/Nothing yet/.test(added) || !/`\/[a-z0-9-]+\/[a-z0-9-]+`/.test(added))
    changelogProblems.push(
      `${local.changelog}: the code has ${routes.length} routes and the last release entry says ${lastRelease[1]}; the Unreleased "Added" section must list the new pages by route`,
    );
}
if (changelogProblems.length) {
  console.error(`readme-index: ${local.changelog} is out of step with the code:\n- ${changelogProblems.join("\n- ")}`);
  process.exit(1);
}

/* ---------- Write ---------- */

function splice(text, tag, body, file = "README.md") {
  const pattern = new RegExp(`(<!-- ${tag}:start -->\\n)[\\s\\S]*?(<!-- ${tag}:end -->)`);
  if (!pattern.test(text)) {
    console.error(`readme-index: marker "${tag}" not found in ${file}`);
    process.exit(1);
  }
  return text.replace(pattern, (_, start, end) => `${start}${body}\n${end}`);
}

const file = join(ROOT, "README.md");
const before = readFileSync(file, "utf8");
const after = fillFacts(splice(splice(before, "components-index", componentTable), "chart-index", chartTable));
// Every other local note quotes the same numbers; the changelog is handled with the same list.
const notes = (local.notes ?? [])
  .map((note) => ({ name: note.file, verifySteps: note.verifySteps === true, found: readOptional(note.file) }))
  .filter((note) => note.found)
  .map(({ name, verifySteps, found }) => ({
    name,
    path: found.path,
    before: found.text,
    after: fillFacts(verifySteps ? splice(found.text, "verify-steps", verifyList, name) : found.text),
  }));
const changelogAfter = changelogBefore === "" ? "" : fillFacts(changelogBefore);
// An unticked task item may not name work that is finished: `doneMarkers` are the markers of things that shipped.
const openTasks = local.openTasks ? readOptional(local.openTasks.file) : null;
const doneMarkers = local.openTasks?.doneMarkers ?? [];
const staleTasks = (openTasks?.text ?? "")
  .split("\n")
  .filter((line) => /^\s*- \[ \]/.test(line) && doneMarkers.some((m) => line.includes(m)));
if (staleTasks.length) {
  console.error(`readme-index: ${local.openTasks.file} lists finished work as open:\n- ${staleTasks.join("\n- ")}`);
  process.exit(1);
}
// Claims inside ticked items that the code has since overtaken; a number belongs in a <!--n:--> marker instead.
const stalePhrases = (local.openTasks?.stalePhrases ?? []).filter((p) => (openTasks?.text ?? "").includes(p));
if (stalePhrases.length) {
  console.error(`readme-index: ${local.openTasks.file} still says: ${stalePhrases.map((p) => `"${p}"`).join(", ")}`);
  process.exit(1);
}

const guidePages = (byGroup.get("Guides") ?? []).filter((r) => r.path !== "/guides").length;
console.log(
  `readme-index: ${routes.length} routes (${visible.length} listed), ${componentPages} component pages, ${chartPages.size} chart pages (+ the gallery), ` +
    `${byGroup.get("Blocks")?.length ?? 0} blocks, ${byGroup.get("Dashboards")?.length ?? 0} dashboards, ${guidePages} guides`,
);

if (guideProblems.length) {
  console.error(`readme-index: guide numbers out of date:\n- ${guideProblems.join("\n- ")}`);
  process.exit(1);
}

if (process.argv.includes("--check")) {
  const stale = [
    after !== before && "README.md",
    ...notes.filter((n) => n.after !== n.before).map((n) => n.name),
    changelogAfter !== changelogBefore && local.changelog,
  ].filter(Boolean);
  if (stale.length) {
    console.error(`readme-index: ${stale.join(", ")} out of date; run \`pnpm readme:index\`.`);
    process.exit(1);
  }
} else {
  if (after !== before) {
    writeFileSync(file, after);
    console.log("readme-index: README.md updated");
  }
  for (const n of notes) {
    if (n.after === n.before) continue;
    writeFileSync(n.path, n.after);
    console.log(`readme-index: ${n.name} updated`);
  }
  if (changelog && changelogAfter !== changelogBefore) {
    writeFileSync(changelog.path, changelogAfter);
    console.log(`readme-index: ${local.changelog} updated`);
  }
}
