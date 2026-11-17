// `pnpm docs:check`: the docs can no longer drift from the code.
//   1. demo/src/generated/* (props tables, install paths) is up to date with theme/src.
//   1b. Every code sample of every Code panel type-checks as pasted (scripts/check-page-code.mjs).
//   2. Every public component with props whose JSDoc `@see` names a docs page has ALL of its props in that page's
//      props tables (the built HTML of dist/, or DIST_DIR), and the `@see` route exists.
//   3. llms-full.txt: no fenced example starts or ends with a literal <code> tag, and every prop row has a description.
// Needs a build first (`pnpm build`), like seo:check.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { routeHtml } from "./lib/serve.mjs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parse } from "node-html-parser";

import { cleanSummary } from "./lib/summary-text.mjs";
import { readSplitSource } from "./lib/split-source.mjs";
import {
  cleanDescription,
  extractProps,
  extractRouteExports,
  parseLabelsType,
  runtimeExportCount,
  statedDefault,
  statedDefaultClause,
  statesLiteralDefault,
} from "./lib/extract-props.mjs";
import { DEFAULT_APPLIED_ELSEWHERE } from "./lib/default-applied-elsewhere.mjs";
import { findFragments, MIN_WORDS, VERBLESS_MAX_WORDS } from "./lib/fragment-check.mjs";

/** An element's text without its decorative parts (`aria-hidden` glyphs such as a trend arrow), as the Markdown twin writes it. */
function visibleText(node) {
  const copy = parse(`<div>${node.outerHTML}</div>`);
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  return copy.textContent;
}

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(DEMO, process.env.DIST_DIR ?? "dist");
const errors = [];

// 1. generated files
const gen = spawnSync(process.execPath, [join(DEMO, "scripts/gen-props.mjs"), "--check"], { encoding: "utf8" });
if (gen.status !== 0) errors.push((gen.stderr || gen.stdout).trim());

// 1a. the description cleaner's fixtures
const unit = spawnSync(process.execPath, ["--test", join(DEMO, "scripts/lib/extract-props.test.mjs")], {
  encoding: "utf8",
});
if (unit.status !== 0)
  errors.push(
    `extract-props fixtures fail:\n${unit.stdout
      .split("\n")
      .filter((l) => /✖|not ok|Error|expected|actual/.test(l))
      .slice(0, 12)
      .join("\n")}`,
  );

// 1b. every code sample in a Code panel type-checks as pasted (scripts/check-page-code.mjs)
const pageCode = spawnSync(process.execPath, [join(DEMO, "../scripts/check-page-code.mjs")], { encoding: "utf8" });
if (pageCode.status !== 0)
  errors.push(
    `code samples do not compile:\n${(pageCode.stderr || pageCode.stdout).trim().split("\n").slice(0, 25).join("\n")}`,
  );

// 1c. no fragment descriptions in either source of the props tables: the generated rows and the hand-written
// `<PropsTable rows={[...]}>` of src/pages. A description needs at least MIN_WORDS words, and a finite verb (closed list; noun homographs only in -s form) up to VERBLESS_MAX_WORDS.
{
  const fragments = findFragments(DEMO);
  for (const f of fragments.slice(0, 20))
    errors.push(
      `${f.source}: "${f.name}" description is a fragment (${f.reason}): "${f.description}" (write a sentence)`,
    );
  if (fragments.length > 20)
    errors.push(
      `...and ${fragments.length - 20} more fragment descriptions (${MIN_WORDS}+ words, a finite verb up to ${VERBLESS_MAX_WORDS})`,
    );
}

// Routes: path -> exists, and the hidden / noindex ones (a test page is not documentation).
const routesSource = readSplitSource(join(DEMO, "src/routes.ts"));
const pathMatches = [...routesSource.matchAll(/path: "([^"]+)"/g)];
const known = new Set(pathMatches.map((m) => m[1]));
const hidden = new Set(
  pathMatches
    .filter((m, i) =>
      /hidden:\s*true/.test(routesSource.slice(m.index, pathMatches[i + 1]?.index ?? undefined).split("\n  {")[0]),
    )
    .map((m) => m[1]),
);

const names = (th) =>
  th
    .split(/\s*[/,]\s*/)
    .map(
      (p) =>
        p
          .replace(/\(.*$/, "")
          .replace(/\?$/, "")
          .replace(/\s*\(required\)$/, "")
          .trim()
          .split(/\s+/)
          .pop() ?? "",
    )
    .filter(Boolean);

// 2. props on pages
if (!existsSync(join(DIST, "index.html"))) {
  errors.push(`no build in ${DIST}: run \`pnpm build\` (or set DIST_DIR) before \`pnpm docs:check\``);
} else {
  const components = extractProps();
  const pageProps = new Map(); // route -> Set of prop names in its tables
  const pageNames = (route) => {
    if (pageProps.has(route)) return pageProps.get(route);
    const file = routeHtml(DIST, route);
    let set = null;
    if (existsSync(file)) {
      set = new Set();
      for (const table of parse(readFileSync(file, "utf8")).querySelectorAll("table")) {
        if (table.querySelectorAll("thead th")[0]?.textContent.trim() !== "Prop") continue;
        for (const th of table.querySelectorAll("tbody th")) for (const n of names(th.textContent)) set.add(n);
      }
    }
    pageProps.set(route, set);
    return set;
  };
  let checked = 0;
  for (const [name, info] of Object.entries(components)) {
    if (!info.route) continue;
    if (!known.has(info.route)) {
      errors.push(`${name}: its @see route ${info.route} is not a docs page (theme/src/${info.file})`);
      continue;
    }
    if (hidden.has(info.route)) continue;
    const documented = pageNames(info.route);
    if (!documented) {
      errors.push(`${name}: page ${info.route} is not in the build`);
      continue;
    }
    checked++;
    const missing = [...new Set(info.props.map((p) => p.name.replace(/\s*\(.*$/, "")))].filter(
      (p) => !documented.has(p),
    );
    if (missing.length)
      errors.push(
        `${name}: ${info.route} has no row for ${missing.join(", ")}. Add <PropsTable of={PROPS.${name}} /> to the page.`,
      );
  }
  console.log(`docs:check: ${checked} components compared with their pages' props tables`);

  // 2b. the generated rows themselves: description complete, and not at odds with the Default column
  {
    const norm = (v) =>
      v
        .replace(/[`"'\s]/g, "")
        .replace(/^h(\d)$/, "$1")
        .toLowerCase();
    for (const [name, info] of Object.entries(extractProps())) {
      for (const p of info.props) {
        const text = cleanDescription(p.description, p.default);
        const where = `${name}.${p.name}`;
        if (!p.description)
          errors.push(`${where}: no description (add a JSDoc comment to the prop in theme/src/${info.file})`);
        else if (!/[.!?:)`"”]$/.test(text) || (text.match(/\(/g) ?? []).length > (text.match(/\)/g) ?? []).length)
          errors.push(`${where}: description looks cut off: "${text.slice(-50)}"`);
        const leads = p.description
          .split(/(?<=[.!?])\s+/)
          .map((x) => x.split(/\s+/).slice(0, 3).join(" ").toLowerCase().replace(/s\b/g, ""));
        if (leads.length > 1 && new Set(leads).size < leads.length)
          errors.push(`${where}: description repeats itself ("${p.description.slice(0, 70)}...")`);
        const stated = statedDefault(p.description);
        if (
          stated !== undefined &&
          p.default !== undefined &&
          /^(?:-?\d+(?:\.\d+)?|true|false|"[^"]*")$/.test(p.default) &&
          norm(stated) !== norm(p.default)
        )
          errors.push(`${where}: Default column says ${p.default} but the description says "Default ${stated}"`);
      }
    }
  }
  // DEFAULT_APPLIED_ELSEWHERE (lib/default-applied-elsewhere.mjs) keeps only the hook-applied defaults: each needs a real reason,
  // which is what the Default cell shows, and must name a prop that exists.
  const allProps = extractProps();
  for (const [where, why] of DEFAULT_APPLIED_ELSEWHERE) {
    if (!why || why.length < 12) errors.push(`DEFAULT_APPLIED_ELSEWHERE ${where}: give a real reason`);
    const [component, prop] = where.split(".");
    if (!allProps[component]?.props.some((p) => p.name === prop))
      errors.push(`DEFAULT_APPLIED_ELSEWHERE ${where}: no such prop (remove the entry)`);
  }
  // 2b-ii. (R6-N5, tightened R8) a "None" Default cell must mean no default: a description that states one in any phrasing
  // ("Default: x", "defaults to x", "(default x)", `x (default)`) must show it in the cell (the generator reads a short clause
  // from the prose; a longer one needs an `@default` tag at the source, or a reviewed entry in DEFAULT_APPLIED_ELSEWHERE).
  {
    for (const [name, info] of Object.entries(allProps)) {
      for (const p of info.props) {
        if (p.default) continue;
        const stated = statedDefaultClause(p.description) ?? statesLiteralDefault(p.description);
        if (stated !== undefined)
          errors.push(
            `${name}.${p.name}: the description states a default ("${stated}") but the Default cell reads None (set @default on the prop, or add a reviewed entry to DEFAULT_APPLIED_ELSEWHERE)`,
          );
      }
    }
  }
  // 2b-ii-b. (R9) the same rule on what the BUILT pages show: a props table written by hand in a page (`<PropsTable rows={[...]}>`)
  // never passes through the generator, so 2b-ii above cannot see it. Every Default cell that reads None must sit beside a
  // description that states no default.
  {
    const htmlFiles = (dir) =>
      readdirSync(dir, { withFileTypes: true })
        .filter((e) => !e.name.startsWith("._")) // macOS AppleDouble metadata, not source
        .flatMap((e) =>
          e.isDirectory() ? htmlFiles(join(dir, e.name)) : e.name.endsWith(".html") ? [join(dir, e.name)] : [],
        );
    let noneCells = 0;
    for (const file of htmlFiles(DIST)) {
      const html = readFileSync(file, "utf8");
      if (!html.includes('data-label="Default"')) continue;
      for (const cell of parse(html).querySelectorAll('td[data-label="Default"]')) {
        if (cell.textContent.replace(/[\s—]/g, "") !== "None") continue;
        noneCells++;
        const description = cell.parentNode.querySelectorAll("td")[2]?.textContent ?? "";
        const stated = statedDefaultClause(description) ?? statesLiteralDefault(description);
        if (stated !== undefined)
          errors.push(
            `${file.slice(DIST.length + 1)}: a props row's description states a default ("${stated}") but its Default cell reads None ("${description.slice(0, 60)}...")`,
          );
      }
    }
    console.log(`docs:check: ${noneCells} None Default cells on the built pages, none beside a stated default`);
  }
  // 2b-iii. (R7) a `labels` prop shows the exported `defaultXLabels` and its key table; no raw `{@link}` reaches a description
  {
    const propsDir = join(dirname(fileURLToPath(import.meta.url)), "../src/generated/props");
    if (existsSync(propsDir))
      for (const f of readdirSync(propsDir).filter((n) => !n.startsWith("._")))
        if (readFileSync(join(propsDir, f), "utf8").includes("{@link"))
          errors.push(`generated/props/${f}: a raw {@link} tag is left in a description (gen-props must resolve it)`);
    // Every labels-typed prop (Partial<XLabels>, Pick<XLabels, ...>, XLabels, XLabelsInput) carries the key table of ITS OWN type
    // (the generator maps type -> `@defaultLabels` tag or default<Type>, never the nearest name) and shows that constant.
    let labelsRows = 0;
    for (const [name, info] of Object.entries(allProps))
      for (const p of info.props) {
        const parsed = parseLabelsType(p.type);
        if (!parsed) continue;
        labelsRows++;
        if (!p.labels || p.labels.type !== parsed.type)
          errors.push(`${name}.${p.name}: a labels prop (${p.type}) has no key table for ${parsed.type}`);
        else if (p.default !== p.labels.const || !p.labels.keys.length)
          errors.push(`${name}.${p.name}: a labels prop must show its default constant and key table`);
      }
    if (labelsRows < 150) errors.push(`only ${labelsRows} labels props found: the labels type parser has regressed`);
  }
  // 2c. anchors the docs link to must exist (the Code panel's "Which one?" link, llms.txt's install line)
  {
    const installPage = join(DIST, "docs/installation.html");
    const installHtml = existsSync(installPage) ? readFileSync(installPage, "utf8") : "";
    for (const id of ["import-paths", "install-setup"])
      if (!installHtml.includes(`id="${id}"`))
        errors.push(`/docs/installation has no #${id} section (linked from the Code panels and llms.txt)`);
  }

  // 2d. search: every public component and hook is reachable by name (the palette matches ROUTE_EXPORTS) and the page it
  // leads to documents it (its name appears in the page's text: a props table, a heading or an example).
  {
    const textCache = new Map();
    const pageText = (route) => {
      if (!textCache.has(route)) {
        const file = routeHtml(DIST, route);
        textCache.set(route, existsSync(file) ? parse(readFileSync(file, "utf8")).textContent : null);
      }
      return textCache.get(route);
    };
    let searchable = 0;
    for (const [route, names] of Object.entries(extractRouteExports())) {
      const text = pageText(route);
      for (const name of names) {
        searchable++;
        if (text === null) errors.push(`search: ${name} leads to ${route}, which is not in the build`);
        else if (!text.includes(name))
          errors.push(
            `search: ${name} leads to ${route}, but that page never mentions it (document it there or change its @see)`,
          );
      }
    }
    const total = runtimeExportCount();
    if (new Set(Object.values(extractRouteExports()).flat()).size !== total)
      errors.push(
        `search covers ${new Set(Object.values(extractRouteExports()).flat()).size} of the ${total} runtime exports of the package`,
      );
    console.log(
      `docs:check: ${searchable} of ${total} runtime exports are searchable and documented on the page they lead to`,
    );

    // BEGIN export summaries rule: a helper, label or constant has no props table, so the page must carry its JSDoc summary
    // (the "All exports on this page" index), not only its bare name.
    {
      const squash = (v) => v.replace(/\s+/g, " ").trim();
      const { routes: byRoute, summaries } = extractRouteExports(undefined, true);
      let withSummary = 0;
      for (const [route, names] of Object.entries(byRoute)) {
        const text = pageText(route);
        if (text === null) continue; // reported above
        // The page lists the index from 9 exports up, or when it has a helper / label / constant (Page.tsx: INDEX_MIN).
        if (names.length < 9 && !names.some((n) => /^[a-z]/.test(n) && !/^use[A-Z]/.test(n))) continue;
        const flat = squash(text);
        for (const name of names) {
          if (components[name]?.props?.length) continue; // documented by a props table
          const summary = squash(cleanSummary(summaries[name]));
          if (!summary) {
            errors.push(`export summary: ${name} has no JSDoc summary sentence in theme/src (add one)`);
            continue;
          }
          withSummary++;
          if (!flat.includes(summary) && !flat.includes(summary.slice(0, 40)))
            errors.push(
              `export summary: ${route} lists ${name} without its summary "${summary.slice(0, 40)}..." (the "All exports on this page" index must carry the first JSDoc sentence)`,
            );
        }
      }
      console.log(`docs:check: ${withSummary} exports without a props table carry their summary on their page`);
    }
    // END export summaries rule
  }

  // 3. llms-full.txt
  // llms-full.txt is the table of contents; the text lives in llms/<section>.txt (each under 150 KB).
  const llms = join(DIST, "llms-full.txt");
  const llmsDir = join(DIST, "llms");
  if (existsSync(llms) && existsSync(llmsDir)) {
    const partFiles = readdirSync(llmsDir).filter((f) => f.endsWith(".txt") && !f.startsWith("._"));
    for (const f of partFiles)
      if (statSync(join(llmsDir, f)).size > 150 * 1024) errors.push(`llms/${f} is over 150 KB`);
    const text = partFiles.map((f) => readFileSync(join(llmsDir, f), "utf8")).join("\n");
    const wrapped = (text.match(/```tsx\n<code>|<\/code>\n```/g) ?? []).length;
    if (wrapped) errors.push(`llms-full.txt: ${wrapped} fenced example edge(s) carry a literal <code> tag`);

    // 3b. (a [data-llms="skip"] region, the auto-playing stage story, is decorative and skipped here and by the generator.)
    // llms-full.txt keeps what every page shows: each <pre> block and each h2/h3 heading of the page is in its section.
    const norm = (v) => v.replace(/\s+/g, " ").trim().toLowerCase();
    const sections = new Map(); // route path -> normalised section text
    const parts = text.split(/\n(?=## )/);
    for (const part of parts) {
      const url = /^URL: (\S+)/m.exec(part)?.[1];
      if (!url) continue;
      sections.set(new URL(url).pathname.replace(/^\/[^/]+(?=\/|$)/, "") || "/", norm(part));
    }
    let checkedPages = 0;
    for (const [route, section] of sections) {
      if (route.startsWith("/guides/")) continue; // a guide's Markdown body is copied whole
      const file = routeHtml(DIST, route);
      if (!existsSync(file)) continue;
      const article = parse(readFileSync(file, "utf8")).querySelector("article");
      if (!article) continue;
      checkedPages++;
      const missing = [];
      for (const pre of article.querySelectorAll("pre")) {
        if (pre.closest("[role=tabpanel]") || pre.closest("[data-example-code]") || pre.closest('[data-llms="skip"]'))
          continue; // a demo's own content is not documentation text
        const inner = pre.innerHTML.replace(/^\s*<code[^>]*>/, "").replace(/<\/code>\s*$/, "");
        const code = norm(parse(`<div>${inner}</div>`).textContent).slice(0, 60);
        if (code && !section.includes(code)) missing.push(`code "${code.slice(0, 40)}…"`);
      }
      for (const heading of article.querySelectorAll("h2, h3")) {
        if (
          heading.closest("header") ||
          heading.closest("[role=tabpanel]") ||
          heading.closest("[data-example-code]") ||
          heading.closest('[data-llms="skip"]')
        )
          continue; // demos are not documentation text
        const label = norm(heading.textContent);
        if (label && !section.includes(label)) missing.push(`heading "${label}"`);
      }
      // BEGIN paragraphs rule: every visible <p> outside the demos (and the known <summary> lines) is in the page's llms section.
      // llms escapes pipes in table cells and writes links as `[text](absolute url)`: compare the visible text.
      const flatSection = section.replace(/\\\|/g, "|").replace(/\[((?:[^\]\\]|\\.)*)\]\([^)\s]*\)/g, "$1");
      for (const p of article.querySelectorAll("p")) {
        if (
          p.closest("[role=tabpanel]") ||
          p.closest("[data-example-code]") ||
          p.closest('[data-llms="skip"]') ||
          p.closest("summary") ||
          p.closest('[aria-hidden="true"], [inert], [aria-live=polite], [aria-live=assertive]') // decorative stages and live-region counters are interface, not text
        )
          continue;
        // The visually hidden "(opens in a new tab)" hint of an external link is interface text the twin leaves out.
        // A paragraph of sibling spans (a card's category chips) is written as "(Trend, KPI)": each chip must be there, not the glued run.
        const kids = p.childNodes.filter((c) => c.tagName);
        const chips =
          kids.length > 1 &&
          kids.every((k) => k.tagName === "SPAN") &&
          !p.childNodes.some((c) => c.nodeType === 3 && c.text.trim());
        const paras = chips
          ? kids.map((k) => norm(visibleText(k)))
          : [norm(visibleText(p).replace(/\s*\((?:[^()]*,\s*)?opens in a new tab\)/gi, ""))];
        for (const para of paras)
          if (para && !flatSection.includes(para)) missing.push(`paragraph "${para.slice(0, 40)}…"`);
      }
      // END paragraphs rule
      if (missing.length)
        errors.push(
          `llms-full.txt: ${route} drops ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? ` and ${missing.length - 4} more` : ""}`,
        );
    }
    console.log(`docs:check: llms-full.txt keeps every code block, heading and paragraph of ${checkedPages} pages`);
  }
}

// 4. No bundler-transform artefact (demo/vite.page-instances.mjs rewrites `export default` to `const __unusedDefault =`) may
// reach a displayed code sample or an llms file: every shown block is exactly the authored sample.
{
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const f = join(dir, e.name);
      if (e.isDirectory()) return e.name === "assets" || e.name === "r" ? [] : walk(f);
      return /\.(html|txt)$/.test(e.name) ? [f] : [];
    });
  const leaks = existsSync(DIST) ? walk(DIST).filter((f) => /__unused\w*/.test(readFileSync(f, "utf8"))) : [];
  for (const f of leaks.slice(0, 10))
    errors.push(`${f.slice(DIST.length + 1)} shows a transform artefact (__unused...) in its code or text`);
  if (leaks.length > 10) errors.push(`...and ${leaks.length - 10} more files with __unused artefacts`);
}

if (errors.length) {
  console.error(`docs:check FAILED (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("docs:check passed");
