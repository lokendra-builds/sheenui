// llms.txt (facts + an index: one line per page), llms-full.txt (a table of contents) and llms/<section>.txt (every page of a
// section: intro, files to copy, props tables, an example, keyboard and accessibility notes; each file under 150 KB),
// generated from the prerendered HTML and the page sources.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

import {
  alsoLine,
  extraItems,
  loadAlsoUses,
  loadInstallMap,
  PACKAGE_NOTE,
  withCopiedImports,
} from "../../../scripts/lib/install-imports.mjs";

const SUMMARY =
  "SheenUI is a free, MIT-licensed library of glassmorphism and Liquid Glass React components, animated with Motion and built on Base UI and Tailwind CSS v4. Copy the source into a React 19.2+ app and own the code.";

/** Quotable definitions (the same text as the home FAQ), so an answer engine can lift a sentence with its source. */
const DEFINITIONS = [
  "Glassmorphism is a UI style where surfaces look like frosted glass: a translucent tint, a background blur (CSS backdrop-filter) and a thin, light border, over a colorful background.",
  "Liquid Glass is Apple's design language since iOS 26: it blurs what is behind a surface, also bends it like a lens (refraction) and adds a bright rim. In SheenUI the LiquidGlass component refracts in Chromium and shows frosted glass in Safari and Firefox.",
  "SheenUI is a free, MIT-licensed, copy-the-source React library of glass components, charts and blocks, built on Base UI and Tailwind CSS v4 and animated with Motion. You copy the source into your app and own the code.",
  "SheenUI is not on npm: install a component with the shadcn CLI (npx shadcn@latest add <url>.json) or copy the files a docs page lists.",
];

/** The licence and citation lines of every file that gives the facts. */
const citation = (siteUrl) => [
  `- License: MIT (https://opensource.org/licenses/MIT). Free for personal and commercial use; keep the copyright notice with the copied source.`,
  `- Cite as: "SheenUI. Glassmorphism and Liquid Glass React components. Lokendra Singh Rathore. MIT license. ${siteUrl}/about". Cite a single fact with the URL of the page it comes from.`,
  `- Every docs page also exists as Markdown: the page URL plus ".md" (the home page is ${siteUrl}/index.md); each page links its twin with <link rel="alternate" type="text/markdown">.`,
];

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
/** The Glass Admin starter apps in the public repository. */
const TEMPLATES_URL = "https://github.com/lokendra-builds/sheenui/tree/main/templates";
/** Each section file stays well under 150 KB (what one fetch or one context window handles comfortably). */
const MAX_BYTES = 140_000;

const GUIDES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../docs/guides");

/**
 * A guide's Markdown (front matter read, leading H1 dropped: the page title above it is that heading, and every other
 * heading moves one level down under it), so answer engines get the article itself, with the same dates the HTML byline shows.
 */
function guideBody(path) {
  const slug = /^\/guides\/([\w-]+)$/.exec(path)?.[1];
  const file = slug && join(GUIDES_DIR, `${slug}.md`);
  if (!file || !existsSync(file)) return null;
  const raw = readFileSync(file, "utf8");
  const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(raw)?.[1] ?? "";
  const field = (name) => new RegExp(`^${name}:\\s*["']?([^"'\\r\\n]+?)["']?\\s*$`, "m").exec(front)?.[1];
  const body = raw
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    .trim()
    .replace(/^# [^\n]*\n+/, "");
  return { body: shiftHeadings(body, 1), published: field("published"), updated: field("updated") };
}

/** Moves every Markdown heading outside code fences `by` levels (positive: deeper). */
function shiftHeadings(md, by) {
  let fenced = false;
  return md
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) fenced = !fenced;
      if (fenced) return line;
      const m = /^(#{1,6}) (.*)$/.exec(line);
      if (!m) return line;
      const level = Math.min(6, Math.max(1, m[1].length + by));
      return `${"#".repeat(level)} ${m[2]}`;
    })
    .join("\n");
}

const longDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" });

/** "By <author>. Published <date>, updated <date>." from the same dates the page's HTML byline and JSON-LD use. */
function byline(author, published, modified) {
  if (!published) return null;
  return `By ${author}. Published ${longDate(published)}${modified && modified !== published ? `, updated ${longDate(modified)}` : ""}.`;
}

/**
 * The page that documents an export: its own (canonical) route from the generated route exports when it has one, else
 * the first page whose example imported it. A page that merely uses a component in a recipe never wins over the owner.
 * @param {string} name
 * @param {Map<string, string>} routeOf export name -> route path
 * @param {Map<string, string>} byRoute route path -> canonical URL
 * @param {string} firstSeen canonical URL of the first page whose example imports the name
 */
export function apiPageUrl(name, routeOf, byRoute, firstSeen) {
  const own = routeOf.get(name);
  // A type or helper has no @see route of its own ("FileUploadItem" belongs to FileUpload): the longest owned name it starts with.
  const prefix = [...routeOf.keys()]
    .filter((k) => name.startsWith(k) && k.length < name.length && routeOf.get(k) !== "/charts")
    .sort((x, y) => y.length - x.length)[0];
  const resolved = OWNER_OVERRIDES[name] ?? (own && own !== "/charts" ? own : undefined) ?? routeOf.get(prefix);
  if (resolved) return byRoute.get(resolved) ?? firstSeen;
  // A shared chart helper (ChartCard, ChartTable, formatCompact...) is listed under the /charts hub in the route exports; point at
  // the chart page whose example first uses it, which shows it in a working chart, when there is one.
  if (own === "/charts") {
    if (/\/charts\/[^/]+$/.test(firstSeen)) return firstSeen;
    const reference = byRoute.get("/charts/line-chart"); // the reference chart page: its example uses the shared card, table and legend
    if (reference) return reference;
  }
  return byRoute.get(own ?? "") ?? firstSeen;
}

/** True when `text` names the export (as a whole word: `ChartLegend` is not found in `ChartLegendProps`). */
export function namesExport(text, name) {
  const escaped = name.replace(/[$]/g, "\\$");
  return new RegExp(`(?<![\\w$])${escaped}(?![\\w$])`).test(text);
}

/**
 * The page an export is mapped to: the owner `apiPageUrl` derives, but only when that page's text names the export; else the page
 * its generated route names, else the page whose props table or heading carries the name, else the page that names it most. An
 * export no page names gets no page.
 * @param {string} name
 * @param {{ routeOf: Map<string, string>; byRoute: Map<string, string>; textOf: Map<string, string>; firstSeen: string }} ctx
 * @returns {string} canonical URL, or "" when no page names the export
 */
export function apiPageFor(name, { routeOf, byRoute, textOf, firstSeen }) {
  const names = (url) => Boolean(url) && namesExport(textOf.get(url) ?? "", name);
  const derived = apiPageUrl(name, routeOf, byRoute, firstSeen);
  if (names(derived)) return derived;
  const own = byRoute.get(routeOf.get(name) ?? "");
  if (names(own)) return own;
  const carrying = [...textOf].filter(([, text]) => namesExport(text, name));
  const inHeading = carrying.find(([, text]) =>
    text.split("\n").some((line) => /^###? /.test(line) && namesExport(line, name)),
  );
  if (inHeading) return inHeading[0];
  const count = (text) => text.split(name).length;
  return carrying.sort((x, y) => count(y[1]) - count(x[1]) || x[0].localeCompare(y[0]))[0]?.[0] ?? "";
}

/** Exports whose owner page is not derivable from a `@see` route: a type shared by every chart page, and a renamed chart. */
const OWNER_OVERRIDES = {
  ChartSeries: "/charts/line-chart",
  RadialProgress: "/charts/radial-bar-chart",
  // The dark-mode page teaches the theme hook and the pre-paint script; /foundations only lists them.
  useTheme: "/docs/dark-mode",
  sheenPreferenceScript: "/docs/dark-mode",
};

/** Exports every project imports once at its root (the provider and the pre-paint script) but no example sample does: added to the API index by hand. */
const SETUP_EXPORTS = ["SheenMotionProvider", "sheenPreferenceScript"];

/** One merged `import { … } from "@sheenui/theme";` line from every example on a page. */
function importLine(examples) {
  const names = new Set();
  for (const code of examples) {
    for (const m of code.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"@sheenui\/theme"/g)) {
      for (const raw of m[1].split(",")) {
        const name = raw.trim();
        if (name) names.add(name);
      }
    }
  }
  if (!names.size) return null;
  return `import { ${[...names].sort((x, y) => x.replace(/^type /, "").localeCompare(y.replace(/^type /, ""))).join(", ")} } from "@sheenui/theme";`;
}

/** The label of a page's install line: a dashboard's install item brings its sample data, its files panel's command does not. */
export const installLabel = (item) => (/^analytics-demo/.test(item ?? "") ? "Install (with demo data)" : "Install");

/** The Markdown twin of a route's page, relative to the site root: "/" is index.md, "/a/b" is a/b.md. */
const markdownTwin = (path) => (path === "/" ? "index.md" : `${path.slice(1)}.md`);

/** The visually hidden "(opens in a new tab)" / "(GitHub, opens in a new tab)" hint of an external link: interface text, not content. */
const OPENS_IN_NEW_TAB = /\s*\((?:[^()]*,\s*)?opens in a new tab\)/gi;

/** A node's text with whitespace collapsed; what a region marked `data-llms="skip"` holds (a decorative numeral) is left out. */
const text = (node) => {
  if (!node) return "";
  const source = node.innerHTML?.includes('data-llms="skip"') ? parse(`<div>${node.innerHTML}</div>`) : node;
  if (source !== node) for (const skipped of source.querySelectorAll('[data-llms="skip"]')) skipped.remove();
  return source.textContent.replace(OPENS_IN_NEW_TAB, "").replace(/\s+/g, " ").trim();
};

/** The origin root-relative links of the page are made absolute with (set by `writeLlmsFiles` from its `siteUrl`). */
let siteOrigin = "";

/** An href as an absolute URL for the Markdown twin, or "" for a link that goes nowhere useful (an in-page anchor, mailto, javascript). */
function absoluteHref(href) {
  if (!href || href.startsWith("#")) return "";
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith("/") && !href.startsWith("//") && siteOrigin) return `${siteOrigin}${href}`;
  return "";
}

/** Separates the block-level pieces of one node in {@link mdWalk}'s output. */
const SEP = "\u0001";
const BLOCK_TAGS = new Set(
  "address article aside blockquote br caption dd details div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p section summary table tbody td tfoot th thead tr ul".split(
    " ",
  ),
);
/** Elements that are interface, never documentation: scripts, icons, buttons and the like. */
const CHROME_TAGS = new Set([
  "script",
  "style",
  "svg",
  "noscript",
  "button",
  "template",
  "select",
  "input",
  "textarea",
]);

/**
 * True for what a reader of the twin should not get: decorative or hidden-from-assistive-tech parts (`aria-hidden`, `inert`),
 * live regions that announce UI state (`aria-live="polite"`; a ticker's `off` region is its value) ("Showing 12 of 52"), and regions the page marks `data-llms="skip"`.
 */
function isChrome(el) {
  const tag = el.tagName?.toLowerCase();
  return (
    CHROME_TAGS.has(tag) ||
    (tag !== "pre" && el.getAttribute("aria-hidden") === "true") || // a code sample is content even when its highlighted copy is hidden
    el.hasAttribute("inert") ||
    ["polite", "assertive"].includes(el.getAttribute("aria-live")) ||
    el.getAttribute("data-llms") === "skip"
  );
}

/**
 * Inline Markdown of a node's children: links become `[text](absolute url)`, block boundaries become {@link SEP} (so a card's
 * name and its description never glue together), interface chrome is dropped. A paragraph of short sibling spans (a card's category chips)
 * is joined with ", ".
 */
function mdWalk(node, { lists = true } = {}) {
  let out = "";
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      out += child.text;
      continue;
    }
    if (!child.tagName) continue;
    const tag = child.tagName.toLowerCase();
    if (isChrome(child) || (!lists && (tag === "ul" || tag === "ol"))) continue;
    if (tag === "a") {
      const label = mdWalk(child).split(SEP).join(" ").replace(OPENS_IN_NEW_TAB, "").replace(/\s+/g, " ").trim();
      const href = absoluteHref(child.getAttribute("href"));
      out += href && label ? `[${label.replace(/([[\]])/g, "\\$1")}](${href})` : label;
    } else if (BLOCK_TAGS.has(tag)) {
      const kids = child.childNodes.filter((c) => c.tagName);
      const chips =
        tag === "p" &&
        kids.length > 1 &&
        kids.every((k) => k.tagName.toLowerCase() === "span") &&
        !child.childNodes.some((c) => c.nodeType === 3 && c.text.trim());
      const inner = chips
        ? kids
            .map((k) => text(k))
            .filter(Boolean)
            .join(", ")
        : mdWalk(child, { lists });
      out += `${SEP}${inner}${SEP}`;
    } else out += mdWalk(child, { lists });
  }
  return out;
}

/** The block-level pieces of a node as trimmed Markdown strings (a card: its name, then its description, then its chips). */
function mdParts(node, options) {
  return mdWalk(node, options)
    .split(SEP)
    .map((part) => part.replace(OPENS_IN_NEW_TAB, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** One line of Markdown for a node: its pieces joined with a space, links kept. */
const mdInline = (node) => (node ? mdParts(node).join(" ") : "");

/**
 * The Markdown lines of one list item. An item with a heading (a card: `Badge` + its description) is `Name: description`
 * (the name a link when the card is one); short trailing pieces (category chips) go in parentheses; a nested list becomes
 * indented sub-items.
 */
function listItemLines(li, indent = "") {
  const parts = mdParts(li, { lists: false });
  const heading = li.querySelector("h2, h3, h4");
  let line = parts.join(" ");
  if (heading && parts.length > 1) {
    const label = mdInline(heading);
    const at = parts.indexOf(label);
    if (at >= 0) {
      const rest = parts.slice(at + 1);
      const chips = rest.slice(1).filter((p) => p.length <= 40 && !/[.!?]$/.test(p));
      const more = rest.slice(1).filter((p) => !chips.includes(p));
      line = `${label}: ${[rest[0], ...more].join(" ")}${chips.length ? ` (${chips.join(", ")})` : ""}`;
    }
  }
  const lines = line ? [`${indent}- ${line}`] : [];
  for (const nested of li.childNodes.filter((c) => /^(ul|ol)$/i.test(c.tagName ?? "")))
    for (const sub of nested.childNodes.filter((c) => c.tagName?.toLowerCase() === "li"))
      lines.push(...listItemLines(sub, `${indent}  `));
  return lines;
}

/**
 * The source of one example. The hidden block is `<pre><code>…</code></pre>`; node-html-parser keeps a <pre>'s content as
 * raw text, so the <code> wrapper (and the escaped entities) must be removed by hand or every example would paste as
 * `<code>import …</code>`, which is not valid TSX.
 */
function exampleCode(block) {
  const raw = block.querySelector("pre")?.innerHTML ?? block.innerHTML;
  const inner = raw.replace(/^\s*<code[^>]*>/, "").replace(/<\/code>\s*$/, "");
  return parse(`<div>${inner}</div>`).textContent.trim();
}

/** A <pre> as plain text (node-html-parser keeps a <pre>'s content raw: unwrap <code> and decode the entities). */
function preText(pre) {
  const inner = pre.innerHTML.replace(/^\s*<code[^>]*>/, "").replace(/<\/code>\s*$/, "");
  return parse(`<div>${inner}</div>`).textContent.trim();
}

/** The language of a prose code block, guessed from its first line, so a reader (or an LLM) never has to guess it. */
function fenceLanguage(code) {
  const first = code.trimStart().split("\n", 1)[0];
  if (/^(npx|pnpm|npm|yarn|bun|corepack|cd|mkdir|git)\b/.test(first)) return "bash";
  if (/^(@import|@source|@theme|@custom-variant|@layer|:root\b|[.#][\w-]+\s*\{|html\b)/.test(first)) return "css";
  if (/^(import|export|const|type|function|\/\/ \w+\.tsx?|<[A-Za-z])/.test(first)) return "tsx";
  if (/^\/\/ [\w./-]+\.(?:ts|mts|js|mjs)\b/.test(first)) return "ts";
  if (/^[\w-]+:\s*[^;]+;$/.test(first)) return "css"; // a declaration line ("background: var(--sheen-glass-2-bg);")
  if (/^[A-Z][^\n]*\bMIT license\b/.test(first)) return "text"; // a citation line
  if (/^[{[]/.test(first)) return "json";
  return "";
}

/** Sections the structured extraction above already writes (tables, keyboard, accessibility, the files panel). */
const STRUCTURED = new Set(["Keyboard", "Accessibility"]);

/**
 * Markdown for the part of a page the structured extraction does not cover: prose, headings, code blocks, lists, the "When
 * to use" list, the FAQ, the "All exports on this page" index and "Related pages". Every <pre> and heading of the page ends up
 * in llms-full.txt (docs:check asserts it).
 */
function markdownOf(node, out, skipSections = false) {
  for (const child of node.childNodes) {
    if (!child.tagName) continue;
    const tag = child.tagName.toLowerCase();
    if (skipSections && tag === "section") continue; // a wrapper of examples: its nested sections are written on their own
    if (isChrome(child)) continue; // decorative (aria-hidden), live-region counters, data-llms="skip": not documentation
    if (/^h[2-4]$/.test(tag)) out.push("", `#### ${text(child)}`, "");
    else if (tag === "p") {
      const t = mdInline(child);
      if (t) out.push(t, "");
    } else if (tag === "pre") {
      const code = preText(child);
      out.push("```" + fenceLanguage(code), code, "```", "");
    } else if (tag === "ul" || tag === "ol") {
      for (const li of child.childNodes.filter((c) => c.tagName?.toLowerCase() === "li"))
        out.push(...listItemLines(li));
      out.push("");
    } else if (tag === "dl") {
      const terms = child.querySelectorAll("dt");
      for (const dt of terms) out.push(`- ${text(dt)}: ${mdInline(dt.nextElementSibling)}`);
      out.push("");
    } else if (tag === "details" && child.hasAttribute("data-export-index"))
      markdownOf(child, out); // the collapsed "All exports on this page" list: name + summary per export
    else if (tag === "table") {
      // Every prose table is written as a GitHub-flavoured Markdown table. Not these: props tables (structured above), a demo's
      // own table (a chart's data table inside a preview), and a region marked data-llms="skip".
      const rows = child
        .querySelectorAll("tr")
        .map((tr) => tr.querySelectorAll("th, td").map((c) => text(c).replace(/\|/g, "\\|")));
      const isProps = text(child.querySelector("thead th")) === "Prop";
      const inDemo = child.closest('[role="tabpanel"], [data-example-code], [data-llms="skip"]');
      if (rows.length > 1 && !isProps && !inDemo) {
        const caption = text(child.querySelector("caption"));
        if (caption) out.push(caption, "");
        out.push(`| ${rows[0].join(" | ")} |`, `| ${rows[0].map(() => "---").join(" | ")} |`);
        for (const row of rows.slice(1)) out.push(`| ${row.join(" | ")} |`);
        out.push("");
      }
    } else if (tag === "div" && /\bhome-cta__term\b/.test(child.getAttribute("class") ?? "")) {
      // A command widget (CommandField): the command in a fenced block, so the twin keeps what the page tells you to run.
      const command = text(child.querySelector("code"));
      if (command) out.push("```bash", command, "```", "");
    } else if (tag === "details" || tag === "script" || tag === "style" || tag === "nav") continue;
    else markdownOf(child, out, skipSections);
  }
}

/** What llms-full.txt needs from one prerendered page. */
function extract(html) {
  const root = parse(html);
  const article = root.querySelector("article") ?? root.querySelector("#root");
  const header = article?.querySelector("header");
  // The header's paragraphs minus the eyebrow (the small uppercase group label).
  const introNodes = header
    ? header
        .querySelectorAll("p")
        .filter((p) => !/\buppercase\b/.test(p.getAttribute("class") ?? "") && p.getAttribute("data-llms") !== "skip")
    : [];
  // Each intro paragraph twice: as Markdown (links kept) and as plain text (to tell it from the description and the answer).
  const intro = introNodes.map((p) => ({ md: mdInline(p), plain: text(p) })).filter((p) => p.plain);
  // The breadcrumb trail as one line: `[Home](url) > [Components](url) > Dialog`.
  const breadcrumb = article
    ?.querySelectorAll('nav[aria-label="Breadcrumb"] li')
    .map((li) => (li.getAttribute("aria-hidden") === "true" ? "" : mdInline(li)))
    .filter(Boolean)
    .join(" > ");

  // The rest of the lede: the page template clamps the header paragraph on a phone, and a page may continue it in loose
  // paragraphs right after the header (the installation page's "works like shadcn/ui" paragraph). Every paragraph that is
  // outside a section, a details box, a table, a list, the nav and a demo belongs to the intro.
  const headerPs = new Set(header?.querySelectorAll("p") ?? []);
  for (const p of article?.querySelectorAll("p") ?? []) {
    if (headerPs.has(p)) continue;
    if (p.closest("section, details, table, li, nav, [data-example-code], [role=tabpanel], [data-llms=skip]")) continue;
    const t = text(p);
    if (t && !intro.some((i) => i.plain === t)) intro.push({ md: mdInline(p), plain: t });
  }

  const files = [];
  const packages = [];
  let shadcn = "";
  let shadcnLabel = "shadcn CLI";
  let shadcnNote = "";
  for (const section of article?.querySelectorAll("section, details") ?? []) {
    const heading = section.querySelector("h2");
    if (text(heading) !== "Files to copy") continue;
    if (files.length || packages.length) break; // the page renders the panel twice (phone and desktop position): read the first
    for (const dt of section.querySelectorAll("dt")) {
      const label = text(dt);
      const dd = dt.nextElementSibling;
      if (label.startsWith("From")) files.push(...(dd?.querySelectorAll("li code").map(text) ?? []));
      else if (label === "Packages") packages.push(text(dd?.querySelector("code")));
      else if (label.startsWith("shadcn CLI")) {
        shadcn = text(dd?.querySelector("code"));
        shadcnLabel = label;
        // The sentence after the command ("Registry item: dialog. The styles need the [Tailwind v4 glass UI setup](url).").
        const rest = parse(`<div>${dd?.innerHTML ?? ""}</div>`);
        rest.querySelector("code")?.remove();
        shadcnNote = mdInline(rest);
      }
    }
  }

  const tables = [];
  for (const table of article?.querySelectorAll("table") ?? []) {
    const headers = table.querySelectorAll("thead th").map(text);
    if (headers[0] !== "Prop") continue;
    const section = table.closest("section");
    const title = text(section?.querySelector("h2, h3")) || "Props";
    const rows = table.querySelectorAll("tbody tr").map((tr) => {
      const cells = tr.querySelectorAll("th, td");
      const cell = (c) => text(c).replace(/\|/g, "\\|");
      // The name cell carries a visually hidden "(required)" for required props.
      const required = /\(required\)/.test(text(cells[0]));
      const description = cell(cells[3]);
      const rawDefault =
        cells[2]?.querySelector(".sr-only") && text(cells[2].querySelector(".sr-only")) === "None"
          ? ""
          : cell(cells[2]);
      // A prop without a default is either required (the description says so) or optional.
      const fallback =
        required || /^required\b|\brequired\.|\(required\)/i.test(description) ? "required" : "optional, no default";
      return [cell(cells[0]).replace(/\s*\(required\)$/, ""), cell(cells[1]), rawDefault || fallback, description];
    });
    tables.push({ title, headers, rows });
  }
  // Keyboard and Accessibility sections (every docs page has them), as Markdown tables / lists.
  const keyboard = [];
  const a11y = [];
  for (const section of article?.querySelectorAll("section") ?? []) {
    const name = text(section.querySelector("h2, h3"));
    if (name === "Keyboard") {
      for (const tr of section.querySelectorAll("tbody tr")) {
        const th = tr.querySelector("th");
        const keys = th?.querySelectorAll("kbd").map(text).join(" / ");
        const context = text(th?.querySelector("span.ps-1\\.5"));
        const cells = tr.querySelectorAll("td");
        keyboard.push([
          `${keys || text(th)}${context ? ` ${context}` : ""}`.replace(/\|/g, "\\|"),
          text(cells[0]).replace(/\|/g, "\\|"),
        ]);
      }
    } else if (name === "Accessibility") {
      for (const li of section.querySelectorAll("li")) a11y.push(text(li));
    }
  }
  // Every example's code (the prerendered page keeps it in a hidden block); the imports of all of them make the page's import line.
  const examples = (article?.querySelectorAll("div") ?? [])
    .filter((d) => d.hasAttribute("data-example-code"))
    .map(exampleCode)
    .filter(Boolean);
  // The sections that are neither examples, props tables nor the keyboard / accessibility lists: When to use, FAQ, the exports
  // index, related pages, and everything on pages that have no template (installation, setup guides, hubs).
  const sections = [];
  const cards = [];
  const exampleSections = [];
  for (const section of article?.querySelectorAll("section") ?? []) {
    if (section.closest('[data-llms="skip"]')) continue; // a decorative section (a stage, a demo dashboard) is not documentation
    const heading = section.querySelector("h2, h3");
    const name = text(heading);
    // An Example is a section with its own hidden code block as a direct child (it may sit inside a wrapper section).
    const own = section.childNodes.some(
      (c) => c.tagName && c.tagName.toLowerCase() === "div" && c.hasAttribute("data-example-code"),
    );
    if (own) {
      exampleSections.push({ title: name, description: text(section.querySelector("p")) });
      continue;
    }
    if (!name || STRUCTURED.has(name) || name === "Files to copy") continue;
    if (section.parentNode && section.parentNode.closest("section")) continue; // only outermost sections
    if (section.querySelector("[data-example-code]")) {
      // a wrapper of examples: its heading and its own prose stay, the examples are written with their code
      const wrapped = [];
      markdownOf(section, wrapped, true);
      sections.push({
        title: name,
        body: wrapped
          .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
          .join("\n")
          .replace(/^\s*####[^\n]*\n+/, "")
          .trim(),
      });
      continue;
    }
    if (section.querySelector("table") && !section.querySelector("section")) {
      // A props / keyboard table section is written above, but its own prose (a gallery section's lede, notes) is not.
      const prose = [];
      markdownOf(section, prose);
      const body = prose
        .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
        .join("\n")
        .replace(/^\s*####[^\n]*\n+/, "")
        .trim();
      if (body) sections.push({ title: name, body });
      continue;
    }
    const lines = [];
    markdownOf(section, lines);
    sections.push({
      title: text(section.querySelector("h2, h3")),
      body: lines
        .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
        .join("\n")
        .replace(/^\s*####[^\n]*\n+/, ""),
    });
  }
  // Hub pages and the installation page carry their prose below the header: keep it (cards and FAQ answers included).
  const prose = [];
  const headerParagraphs = new Set(header?.querySelectorAll("p") ?? []);
  if (article && !article.querySelector("table")) {
    for (const p of article.querySelectorAll("p")) {
      if (headerParagraphs.has(p) || p.closest("li") || p.closest("nav") || p.closest('[data-llms="skip"]')) continue;
      const t = text(p);
      if (t.length > 60 && !intro.some((i) => i.plain === t)) prose.push(mdInline(p));
    }
  }
  // The showcase gallery: one card per story (kind, linked title, one-line description); the stage itself is decorative.
  for (const card of article?.querySelectorAll("[data-card]") ?? []) {
    const heading = card.querySelector("h2, h3");
    if (!heading) continue;
    const kind = text(heading.parentNode?.querySelector("p"));
    const href = heading.querySelector("a")?.getAttribute("href");
    const desc = text(heading.parentNode?.querySelectorAll("p").at(-1));
    const link = absoluteHref(href);
    cards.push(
      `- ${kind && kind !== desc ? `${kind}: ` : ""}${link ? `[${text(heading)}](${link})` : text(heading)}${desc ? `: ${desc}` : ""}`,
    );
  }
  if (cards.length) sections.push({ title: "Showcase", body: cards.join("\n") });
  // The home page's wall of live components is decoration: its labels and numbers ("Line chart", "8,1208,120") are not documentation.
  const kept = sections.filter((section) => !/\ball alive\b/i.test(section.title));
  sections.length = 0;
  sections.push(...kept);
  return {
    intro,
    files,
    packages,
    shadcn,
    shadcnLabel,
    shadcnNote,
    breadcrumb,
    tables,
    keyboard,
    a11y,
    examples,
    exampleSections,
    sections,
    prose,
  };
}

/** Name -> summary of every public runtime export, and name -> docs route (both generated by `pnpm docs:props`). */
export function exportCatalog() {
  const dir = join(ROOT, "demo/src/generated");
  const summaries = new Map();
  const routeOf = new Map();
  try {
    for (const f of readdirSync(dir).filter((x) => /^export-summaries\.\d+\.ts$/.test(x)))
      for (const m of readFileSync(join(dir, f), "utf8").matchAll(/^ ("[^"]+"): (".*"),?$/gm))
        summaries.set(JSON.parse(m[1]), JSON.parse(m[2]));
    for (const m of readFileSync(join(dir, "route-exports.ts"), "utf8").matchAll(/^ {2}"([^"]+)": (\[.*\]),$/gm))
      for (const name of JSON.parse(m[2])) if (!routeOf.has(name)) routeOf.set(name, m[1]);
  } catch {
    /* generated files missing: the index just lists what the examples import */
  }
  return { summaries, routeOf };
}

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * @param {{ dist: string; siteUrl: string; author: string; counts?: Record<string, number>; pages: { route: any; seo: any; files: string[]; example: string | null; dates?: { published: string; modified: string } }[] }} args
 */
export function writeLlmsFiles({ dist, siteUrl, pages, counts, author, alsoUses = loadAlsoUses() }) {
  siteOrigin = new URL(siteUrl).origin;
  const groups = new Map();
  for (const page of pages) {
    if (!groups.has(page.route.group)) groups.set(page.route.group, []);
    groups.get(page.route.group).push(page);
  }

  // ---- Facts: one canonical block, from the route table (counts), registry.json and theme/package.json ----
  const theme = JSON.parse(readFileSync(join(ROOT, "theme/package.json"), "utf8"));
  const registryItems = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8")).items.filter(
    (i) => i.meta?.kind !== "bundle",
  ).length;
  const peer = (name) =>
    String(theme.peerDependencies?.[name] ?? "")
      .replace(/^[^\d]*/, "")
      .replace(/(\.0)+$/, "");
  const c = counts ?? {};
  const facts = [
    `- Name and licence: SheenUI (also written Sheen UI), version ${theme.version} (pre-1.0), MIT, by Lokendra Singh Rathore.`,
    `- What it is: a copy-the-source React library of glassmorphism and Liquid Glass components, animated with Motion, on Base UI primitives and Tailwind CSS v4. Two style presets (Liquid Glass, Aurora Neon), light and dark.`,
    `- Size: ${c.components} components (${c.ui} UI components and ${c.effects} effects), ${c.charts} charts, ${c.blocks} blocks, ${c.dashboards} dashboards and ${c.guides} guides; ${registryItems} shadcn registry items plus 5 install bundles.`,
    `- Requires: React ${peer("react")}+, Tailwind CSS v${peer("tailwindcss").split(".")[0]}, Motion ${peer("motion")}+, @base-ui/react ${peer("@base-ui/react")}+.`,
    `- Install: \`npx shadcn@latest add ${siteUrl}/r/<name>.json\`, or copy the files a page lists. The \`@sheenui/theme\` package is not on npm yet.`,
    `- Install bundles: five registry items install a family in one command: \`all\`, \`components\`, \`charts\`, \`blocks\` and \`dashboards\` (\`npx shadcn@latest add ${siteUrl}/r/all.json\`, or \`npx shadcn@latest add @sheenui/all\` once the \`@sheenui\` registry is in components.json; see ${siteUrl}/docs/installation).`,
    `- Starter template: Glass Admin, a free admin dashboard app for Vite or Next.js (\`npx degit lokendra-builds/sheenui/templates/glass-admin-vite my-app\`, or \`templates/glass-admin-next\`; ${TEMPLATES_URL}).`,
    `- Performance: measured load, Lighthouse and interaction numbers, the budgets and their limits are on ${siteUrl}/docs/performance.`,
    `- Browsers: Liquid Glass refraction runs in Chromium; Safari and Firefox get frosted glass. Reduced motion and reduced transparency are honoured.`,
  ];

  facts.push(...citation(siteUrl));
  const definitions = DEFINITIONS.map((d) => `- ${d}`);

  const installMap = loadInstallMap();

  // ---- Per-page text, then section files of at most MAX_BYTES ----
  /** export name -> page URL that documents it (first page wins). */
  const apiIndex = new Map();
  /** page URL -> its full text, the evidence that a page names an export. */
  const textOf = new Map();
  const pageText = (page) => {
    const { route, seo, files, example } = page;
    const full = [];
    const {
      intro,
      files: units,
      packages,
      shadcn,
      shadcnLabel,
      shadcnNote,
      breadcrumb,
      tables,
      keyboard,
      a11y,
      examples,
      exampleSections,
      sections,
      prose,
    } = extract(readFileSync(join(dist, files[0]), "utf8"));
    full.push(
      `## ${seo.ogTitle}`,
      ``,
      `URL: ${seo.canonical}`,
      `Sidebar name: ${route.title}`,
      ``,
      seo.description,
      ``,
    );
    if (seo.answer) full.push(`What it is: ${seo.answer}`, ``);
    const installItem = /\/r\/([\w-]+)\.json$/.exec(seo.install ?? "")?.[1];
    if (seo.install) full.push(`${installLabel(installItem)}:`, ``, "```bash", seo.install, "```", ``);
    const guide = guideBody(route.path);
    const dates = guide ? { published: guide.published, modified: guide.updated } : page.dates;
    const credit = byline(author, dates?.published, dates?.modified);
    if (credit) full.push(credit, ``);
    if (breadcrumb) full.push(`Breadcrumb: ${breadcrumb}`, ``);
    // A guide's Markdown source already holds its whole text, lede included: the rendered paragraphs would repeat it.
    if (!guide) for (const p of intro) if (p.plain !== seo.description && p.plain !== seo.answer) full.push(p.md, ``);
    if (!guide && !sections.length) for (const p of prose) full.push(p, ``);
    if (guide) full.push(guide.body, ``);
    if (units.length) {
      // Paths and commands as code, one per line, so a reader can copy them as they are.
      full.push(`Files to copy from \`theme/src/\`:`, ``, ...units.map((u) => `- \`${u}\``), ``);
      if (packages.length) full.push(`Packages:`, ``, "```bash", ...packages, "```", ``);
      // The install line above already carries the same command: say it once, keep the sentence after it.
      if (shadcn && shadcn !== seo.install)
        full.push(`${shadcnLabel}:`, ``, "```bash", shadcn, "```", ...(shadcnNote ? [``, shadcnNote] : []), ``);
      else if (shadcn && shadcnNote) full.push(shadcnNote, ``);
    }
    const imp = importLine(examples);
    for (const m of imp?.matchAll(/(?:type )?(\w+)(?:,| \})/g) ?? [])
      if (!apiIndex.has(m[1])) apiIndex.set(m[1], seo.canonical);
    const also = alsoUses[route.path];
    // A page with an "also use" group lists, besides its items, the ones the examples import that the install item does not bring.
    const extras = alsoLine(also, siteUrl, also && imp && installItem ? extraItems(imp, installMap, installItem) : []);
    // The "also use" line is the HTML group "The examples also use", whether or not the page's samples import from the barrel.
    if (!imp && extras) full.push(extras, ``);
    if (imp) {
      // Both forms: what a shadcn / copied install has today, and the package barrel (not on npm yet).
      const copied = withCopiedImports(imp, installMap).code;
      full.push(
        `Import (after \`shadcn add\` or copying the files, use this today):`,
        ``,
        "```tsx",
        ...copied.split("\n").filter((l) => !l.startsWith("//")),
        "```",
        ``,
        ...(extras ? [extras, ``] : []),
        `Import from the package (${PACKAGE_NOTE.replace(/^Package build \(/, "").replace(/\)$/, "")}):`,
        ``,
        "```tsx",
        imp,
        "```",
        ``,
      );
    }
    for (const table of tables) {
      full.push(
        `### ${table.title}`,
        ``,
        `| ${table.headers.join(" | ")} |`,
        `| ${table.headers.map(() => "---").join(" | ")} |`,
      );
      for (const row of table.rows) full.push(`| ${row.join(" | ")} |`);
      full.push(``);
    }
    const shown = examples.length ? examples : example ? [example] : [];
    shown.forEach((code, i) => {
      const info = exampleSections[i];
      full.push(
        `### Example${shown.length > 1 ? ` ${i + 1} of ${shown.length}` : ""}${info?.title ? `: ${info.title}` : ""}`,
        ``,
        ...(info?.description ? [info.description, ``] : []),
        "```tsx",
        withCopiedImports(code, installMap).code,
        "```",
        ``,
      );
    });
    if (keyboard.length) {
      full.push(`### Keyboard`, ``, `| Keys | Action |`, `| --- | --- |`);
      for (const [keys, action] of keyboard) full.push(`| ${keys} | ${action} |`);
      full.push(``);
    }
    if (a11y.length) full.push(`### Accessibility`, ``, ...a11y.map((n) => `- ${n}`), ``);
    if (!guide) for (const section of sections) full.push(`### ${section.title}`, ``, section.body, ``);
    // Links that are root-relative on the page (the showcase cards) are absolute in the text files.
    textOf.set(seo.canonical, full.join("\n"));
    return full
      .join("\n")
      .split("\n")
      .map((line) =>
        line.startsWith("- [") || /^- [^:]+: \[/.test(line)
          ? line.replace(/\]\(\//g, `](${new URL(siteUrl).origin}/`)
          : line,
      )
      .join("\n");
  };

  const outDir = join(dist, "llms");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  /** { file, title, pages: [seo], bytes } for the table of contents. */
  const parts = [];
  /** group name -> the section files that hold its pages. */
  const groupFiles = new Map();
  const writePart = (file, title, body, entries) => {
    const text = [
      `# SheenUI: ${title}`,
      ``,
      `> ${SUMMARY}`,
      ``,
      `Facts and the page index: ${siteUrl}/llms.txt`,
      ``,
      body,
    ].join("\n");
    writeFileSync(join(outDir, file), text);
    parts.push({ file, title, entries, bytes: Buffer.byteLength(text) });
  };
  for (const [group, items] of groups) {
    const chunks = [];
    let current = { texts: [], entries: [], bytes: 0 };
    for (const page of items) {
      const text = pageText(page);
      // The page's Markdown twin (<path>.md, linked from the page's <head>): the same text the section file holds.
      const mdFile = join(dist, markdownTwin(page.route.path));
      mkdirSync(dirname(mdFile), { recursive: true });
      writeFileSync(
        mdFile,
        `Canonical: ${page.seo.canonical}\n\n${shiftHeadings(text, -1)}\n---\n\nPart of SheenUI (${siteUrl}/llms.txt). MIT license.\n`,
      );
      const bytes = Buffer.byteLength(text);
      if (current.entries.length && current.bytes + bytes > MAX_BYTES) {
        chunks.push(current);
        current = { texts: [], entries: [], bytes: 0 };
      }
      current.texts.push(text);
      current.entries.push(page.seo);
      current.bytes += bytes;
    }
    if (current.entries.length) chunks.push(current);
    chunks.forEach((chunk, i) => {
      const suffix = chunks.length > 1 ? ` (part ${i + 1} of ${chunks.length})` : "";
      groupFiles.set(group, [
        ...(groupFiles.get(group) ?? []),
        `${slug(group)}${chunks.length > 1 ? `-${i + 1}` : ""}.txt`,
      ]);
      writePart(
        `${slug(group)}${chunks.length > 1 ? `-${i + 1}` : ""}.txt`,
        `${group}${suffix}`,
        chunk.texts.join("\n"),
        chunk.entries,
      );
    });
  }

  // ---- API index: what the examples import, then every public runtime export with its first sentence ----
  const { summaries, routeOf } = exportCatalog();
  const api = [
    `## API index`,
    ``,
    `The names imported from "@sheenui/theme" in the examples, plus the two setup exports every project uses (SheenMotionProvider, sheenPreferenceScript), with the page that documents each. Every public export is in ${siteUrl}/llms/exports.txt.`,
    ``,
  ];
  const byRoute = new Map(pages.map((p) => [p.route.path, p.seo.canonical]));
  for (const name of SETUP_EXPORTS) if (!apiIndex.has(name)) apiIndex.set(name, "");
  for (const [name, seen] of [...apiIndex].sort((x, y) => x[0].localeCompare(y[0])))
    api.push(`- ${name}: ${apiPageFor(name, { routeOf, byRoute, textOf, firstSeen: seen })}`.trimEnd());
  if (summaries.size) {
    api.push(``, `## All public exports`, ``, `One line per export: name, the page that documents it, what it is.`, ``);
    for (const [name, summary] of [...summaries].sort((x, y) => x[0].localeCompare(y[0]))) {
      const url = apiPageFor(name, { routeOf, byRoute, textOf, firstSeen: apiIndex.get(name) ?? "" });
      api.push(`- ${name}${url ? ` (${url})` : ""}: ${summary}`);
    }
  }
  // The export list is long: split it like a section so every file stays under the limit.
  const exportsAt = api.indexOf("## All public exports");
  const head = exportsAt < 0 ? api : api.slice(0, exportsAt);
  writePart("api-index.txt", "API index", head.join("\n"), []);
  if (exportsAt >= 0) {
    const lines = api.slice(exportsAt + 4);
    const chunks = [[]];
    let bytes = 0;
    for (const line of lines) {
      if (bytes + line.length + 1 > MAX_BYTES) {
        chunks.push([]);
        bytes = 0;
      }
      chunks.at(-1).push(line);
      bytes += line.length + 1;
    }
    chunks.forEach((chunk, i) =>
      writePart(
        `exports${chunks.length > 1 ? `-${i + 1}` : ""}.txt`,
        `All public exports${chunks.length > 1 ? ` (part ${i + 1} of ${chunks.length})` : ""}`,
        [`One line per export: name, the page that documents it, what it is.`, ``, ...chunk].join("\n"),
        [],
      ),
    );
  }

  const exportFiles = parts.map((part) => part.file).filter((file) => /^exports(-\d+)?\.txt$/.test(file));

  // ---- llms-full.txt: the table of contents of the section files ----
  const kb = (n) => `${Math.max(1, Math.round(n / 1024))} KB`;
  const toc = [
    `# SheenUI: index of the full documentation`,
    ``,
    `> ${SUMMARY}`,
    ``,
    `## Facts`,
    ``,
    ...facts,
    ``,
    `## Definitions`,
    ``,
    ...definitions,
    ``,
    `## Sections`,
    ``,
    `This file is the complete index: every page with its URL, grouped by the section file that holds its full text. The text is split into one file per section, each under 150 KB: fetch only the section you need. The Start and Guides sections hold the setup steps and the long-form articles. Every page has its intro, the files to copy, props tables, examples, keyboard and accessibility notes.`,
    ``,
  ];
  for (const part of parts) {
    toc.push(
      `- [${part.title}](${siteUrl}/llms/${part.file}) (${kb(part.bytes)})`,
      ...part.entries.map((e) => `  - [${e.ogTitle}](${e.canonical})`),
    );
  }
  toc.push(``);
  writeFileSync(join(dist, "llms-full.txt"), toc.join("\n"));

  // ---- llms.txt ----
  const index = [
    `# SheenUI`,
    ``,
    `> ${SUMMARY}`,
    ``,
    `## Facts`,
    ``,
    ...facts,
    ``,
    `## Definitions`,
    ``,
    ...definitions,
    ``,
    `Every docs page below is static HTML with a live demo and, for most, a props table, keyboard notes and a "Files to copy" box; the Guides section holds long-form articles (Markdown files in docs/guides). Individual component, chart and block pages are not listed here: their description, props, examples and keyboard notes are in the section files under ${siteUrl}/llms/ (linked per section below), every page's URL is in llms-full.txt, and each page has a .md twin. Source: https://github.com/lokendra-builds/sheenui (theme/src).`,
    ``,
    `## Install`,
    ``,
    `- Install with the shadcn CLI: \`npx shadcn@latest add ${siteUrl}/r/<name>.json\` (one registry item per component, chart and block). The registry index is [r/registry.json](${siteUrl}/r/registry.json); a copy-paste install needs no package.`,
    `- [Installation](${siteUrl}/docs/installation): copy-paste and shadcn steps; every code sample shows the import a copied or shadcn install has (\`@/components/sheenui/<folder>/<file>\`), with the \`@sheenui/theme\` package form beside it as a comment: use that one after the first npm release, or from a packed tarball (${siteUrl}/docs/installation#import-paths).`,
    `- Bundles: \`all\`, \`components\`, \`charts\`, \`blocks\` and \`dashboards\` install a whole family: \`npx shadcn@latest add ${siteUrl}/r/all.json\` (or \`@sheenui/all\` with the registry namespace set in components.json). A bundle has no files of its own; it lists the real items.`,
    `- [Starter template](${siteUrl}/docs/installation#starter-template): Glass Admin, an admin dashboard app for Vite or Next.js. \`npx degit lokendra-builds/sheenui/templates/glass-admin-vite my-app\`. Source: ${TEMPLATES_URL}.`,
    `- [Performance](${siteUrl}/docs/performance): measured LCP, long tasks, Total Blocking Time, Lighthouse and interaction timings on the deployed site, the JavaScript budgets and the known limits.`,
    `- [Framework guide](${siteUrl}/guides/install-frameworks): tested steps for Next.js and Vite.`,
    ``,
    `## Quick start`,
    ``,
    `\`\`\`tsx`,
    ...withCopiedImports(`import { GlassCard, Button } from "@sheenui/theme";`, installMap).code.split("\n"),
    ``,
    `export function Example() {`,
    `  return (`,
    `    <GlassCard>`,
    `      <Button>Hello, glass</Button>`,
    `    </GlassCard>`,
    `  );`,
    `}`,
    `\`\`\``,
    ``,
  ];
  for (const [group, items] of groups) {
    index.push(`## ${group}`, ``);
    // The guides and the hub pages carry their description; every other page is a title and a link, and its description,
    // props and examples live in the section file (llms/<section>.txt), which keeps this first fetch small.
    // Only hubs and guides are listed here; an individual component, chart or block page is in the section files, which
    // this file points to (and llms-full.txt lists every page with its URL).
    const hidden = items.filter(({ route }) => group !== "Guides" && route.path.split("/").filter(Boolean).length > 1);
    for (const { seo, route } of items) {
      if (hidden.some((h) => h.route === route)) continue;
      index.push(`- [${seo.ogTitle}](${seo.canonical}): ${seo.description}`);
    }
    if (hidden.length) {
      const files = groupFiles.get(group) ?? [];
      index.push(
        `- ${hidden.length} more ${group} pages (title, description, props, examples, keyboard notes): ${files.map((f) => `[${f}](${siteUrl}/llms/${f})`).join(", ")}; every page's URL is in [llms-full.txt](${siteUrl}/llms-full.txt)`,
      );
    }
    index.push(``);
  }
  index.push(
    `## Optional`,
    ``,
    `- [llms-full.txt](${siteUrl}/llms-full.txt): the table of contents of the full text, split into section files under ${siteUrl}/llms/ (each under 150 KB)`,
    `- [API index](${siteUrl}/llms/api-index.txt): the names the examples import, with the page that documents each`,
    `- [All exports](${siteUrl}/llms/${exportFiles[0] ?? "exports.txt"}): every public export, the page that documents it and a one-line summary${exportFiles.length > 1 ? ` (${exportFiles.length} files)` : ""}`,
    ``,
  );
  writeFileSync(join(dist, "llms.txt"), index.join("\n"));
}
