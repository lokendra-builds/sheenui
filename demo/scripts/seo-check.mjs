// `pnpm seo:check`: the SEO gates of the project, run over dist/.
// Every route prerendered · one H1 and no skipped heading level · unique titles (≤ 60) and descriptions (70–155) · canonical =
// og:url = sitemap loc · all OG/Twitter tags · the OG file exists, is 1200×630 and under 300 KB ·
// JSON-LD parses, FAQPage only as a copy of the visible FAQ, no SearchAction · noindex only on hidden pages and 404 · lang="en" ·
// no "#/" links · alt text on images · no broken internal links · a valid sitemap and robots.txt ·
// the primary keyword in the H1 and in the first 100 words (≥ 95 %) · no page without a link from another page's
// content · a visible breadcrumb that matches the BreadcrumbList · hubs also as <dir>/index.html · guides with a
// byline, dates, og:type article and Article JSON-LD · no JSON-LD and no canonical on the 404.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "node-html-parser";
import sharp from "sharp";

import { findDuplicatePages } from "./lib/duplicate-pages.mjs";
import { panelItems, uncoveredItems } from "./lib/files-panel.mjs";
import { findDuplicatedRun, findRepeatedNumber, htmlTextContent } from "./lib/duplicate-run.mjs";
import { headingOrderErrors } from "./lib/heading-order.mjs";
import { visibleFaq } from "./lib/faq.mjs";
import { findCountClaims, textWithSeparators } from "./lib/count-claims.mjs";
import { resolveFile } from "./lib/serve.mjs";
import { itemClosure, loadInstallMap } from "../../scripts/lib/install-imports.mjs";
import { installLabel, namesExport } from "./lib/llms.mjs";
import { articleFragment, cardMismatch } from "./lib/hub-cards.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// DIST_DIR / SSR_DIR: check a build made into other folders (same variables as prerender.mjs).
const DIST = resolve(DEMO, process.env.DIST_DIR ?? "dist");
const { routes, notFoundRoute, pageSeo, SITE_URL, BASE_PATH, canonicalUrl, HUBS, COUNTS } = await import(
  pathToFileURL(join(resolve(DEMO, process.env.SSR_DIR ?? "dist-ssr"), "entry-server.js")).href
);

/** A heading that ends on one of these words stops short of the thing it names ("When to use the SaaS revenue"). */
const FRAGMENT_TAIL =
  /\b(?:revenue|analytics|e-commerce|ecommerce|blur in|liquid glass|upload|violin|stats|login|verification|checkout|retention|bars|particles|meteors|marquee|typewriter)$/i;
/** A "When to use" bullet may share at most this many consecutive words with the intro (a repeated sentence shares dozens). */
const MAX_SHARED_RUN = 8;

/** The longest run of consecutive words two texts share (case and punctuation ignored). */
function sharedWordRun(a, b) {
  const words = (t) => t.toLowerCase().match(/[\p{L}\p{N}'’-]+/gu) ?? [];
  const A = words(a);
  const B = words(b);
  const at = new Map();
  B.forEach((w, j) => at.set(w, [...(at.get(w) ?? []), j]));
  let best = 0;
  for (let i = 0; i < A.length; i++)
    for (const j of at.get(A[i]) ?? []) {
      let k = 0;
      while (i + k < A.length && j + k < B.length && A[i + k] === B[j + k]) k++;
      best = Math.max(best, k);
    }
  return best;
}

/** `key: JSON value` front matter of docs/guides/<slug>.md. */
function guideFrontMatter(slug) {
  const file = join(DEMO, "..", "docs", "guides", `${slug}.md`);
  if (!existsSync(file)) return null;
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, "utf8"));
  const meta = {};
  for (const line of (match?.[1] ?? "").split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    try {
      meta[line.slice(0, colon).trim()] = JSON.parse(line.slice(colon + 1).trim());
    } catch {
      /* not a JSON value */
    }
  }
  return meta;
}
const guidesIndex = readFileSync(join(DEMO, "src", "guides.ts"), "utf8");
const guideDatesSrc = readFileSync(join(DEMO, "src", "guide-dates.ts"), "utf8");

/** The text of an HTML fragment the prerender escaped (quotes and angle brackets). */
const unesc = (t) =>
  t
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const errors = [];
const warnings = [];
/** canonical URL -> the dateModified of the page's JSON-LD (the sitemap's lastmod and the visible date must equal it). */
const modifiedByUrl = new Map();
const fail = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

// A hub (a route with children) is a folder: its one page is <hub>/index.html; <hub>.html is a redirect stub (checked below).
const hasChildren = (path) => routes.some((r) => r.path.startsWith(`${path}/`));
const distFile = (path) =>
  path === "/" ? "index.html" : hasChildren(path) ? `${path.slice(1)}/index.html` : `${path.slice(1)}.html`;
const answers = new Map();
const registryNames = new Set(
  JSON.parse(readFileSync(join(DEMO, "..", "registry.json"), "utf8")).items.map((item) => item.name),
);
const titles = new Map();
const descriptions = new Map();
const internalLinks = new Set();
let pagesChecked = 0;
const wordCounts = [];
const contentInbound = new Map(); // route path → pages whose <main> links to it
const proseRows = []; // { page, words } for docs pages (the words of prose outside code, tables and navigation)
/** path -> { title, h1, first100, noindex }, for the target-query check below. */
const pageFacts = new Map();
/** target path -> [{ from, text }]: the anchors of other pages' main content that point at it. */
const anchorsTo = new Map();
/** Route class -> the largest initial bytes of its pages (gzip KB), for the report. */
const cwvByClass = new Map();
const gzCache = new Map();
/** { page, name, href, hash } of every card title link on a hub or the home page, checked against its target after the loop. */
const hubCards = [];
const keywordRows = []; // { page, keyword, inH1, inFirst100, h1 }

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/next\.js/g, "nextjs")
    .replace(/&#x27;|’/g, "'")
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
const stem = (t) => t.replace(/s$/, "");
/** Every token of the keyword (plural-insensitive) appears in the text. */
const hasKeyword = (text, keyword) => {
  const words = new Set(norm(text).split(" ").map(stem));
  return norm(keyword)
    .split(" ")
    .filter(Boolean)
    .every((t) => words.has(stem(t)));
};
const routeOfHref = (href) => {
  const path = href.split(/[?#]/)[0];
  const base = BASE_PATH.replace(/\/$/, "");
  if (!path.startsWith(BASE_PATH) && path !== base) return null;
  const rel = (path === base ? "/" : path.slice(base.length)).replace(/\/+$/, "") || "/";
  return routes.some((r) => r.path === rel) ? rel : null;
};

for (const route of [...routes, notFoundRoute]) {
  const is404 = route === notFoundRoute;
  const file = join(DIST, is404 ? "404.html" : distFile(route.path));
  const page = route.path;
  if (!existsSync(file)) {
    fail(page, `not prerendered (${file} missing)`);
    continue;
  }
  pagesChecked++;
  const html = readFileSync(file, "utf8");
  const root = parse(html);
  const seo = pageSeo(route);
  if (seo.fallback) fail(page, "no row in src/seo/meta.ts");

  if (!/<html[^>]*\blang="en"/.test(html)) fail(page, 'missing lang="en"');

  const h1s = root.querySelectorAll("h1");
  if (h1s.length !== 1) fail(page, `${h1s.length} <h1> elements`);
  // One h1 and no skipped level in the outline (the 404 included): a reader and a crawler get a sound document structure.
  for (const problem of headingOrderErrors(root)) fail(page, problem);

  const title = root.querySelector("head > title")?.textContent ?? "";
  if (!title) fail(page, "no <title>");
  if (title.length > 60) fail(page, `title is ${title.length} chars (> 60): ${title}`);
  if (title.length < 30) warn(page, `title is ${title.length} chars (< 30)`);
  if (!is404 && titles.has(title)) fail(page, `title duplicates ${titles.get(title)}`);
  titles.set(title, page);

  const meta = (sel) => root.querySelector(`head > meta[${sel}]`)?.getAttribute("content") ?? "";
  const description = meta('name="description"');
  if (!description) fail(page, "no meta description");
  if (description.length > 155) fail(page, `description is ${description.length} chars (> 155)`);
  if (description.length < 70) fail(page, `description is ${description.length} chars (< 70)`);
  if (!is404 && descriptions.has(description)) fail(page, `description duplicates ${descriptions.get(description)}`);
  descriptions.set(description, page);

  // A guide's head repeats its Markdown front matter (src/seo/meta.ts, src/guides.ts): they must agree.
  const guideSlug = /^\/guides\/([\w-]+)$/.exec(route.path)?.[1];
  if (guideSlug) {
    const fm = guideFrontMatter(guideSlug);
    if (!fm) fail(page, `docs/guides/${guideSlug}.md is missing`);
    else {
      if (fm.title !== title) fail(page, `<title> "${title}" differs from the front matter "${fm.title}"`);
      if (fm.description !== description) fail(page, "meta description differs from the front matter");
      if (fm.targetKeyword !== seo.keyword)
        fail(page, `keyword "${seo.keyword}" differs from the front matter "${fm.targetKeyword}"`);
      if (!guidesIndex.includes(JSON.stringify(fm.description)))
        fail(page, "src/guides.ts does not hold the front-matter description");
      if (!fm.published || !guideDatesSrc.includes(`"${guideSlug}": { published: ${JSON.stringify(fm.published)}`))
        fail(page, "front-matter `published` is missing or not in src/guide-dates.ts");
      if (
        !guideDatesSrc.includes(
          `"${guideSlug}": { published: ${JSON.stringify(fm.published)}, updated: ${JSON.stringify(fm.updated)} }`,
        )
      )
        fail(page, "front-matter `updated` is not in src/guide-dates.ts");
      for (const related of fm.relatedRoutes ?? []) {
        if (!routes.some((r) => r.path === related)) fail(page, `relatedRoutes "${related}" is not a route`);
      }
    }
  }

  if (seo.keyword && !`${title} ${description}`.toLowerCase().includes(seo.keyword.split(" ")[0].toLowerCase())) {
    warn(page, `primary keyword "${seo.keyword}" not in the title or description`);
  }

  const canonical = root.querySelector('head > link[rel="canonical"]')?.getAttribute("href") ?? "";
  if (is404) {
    if (canonical) fail(page, `the 404 page has a canonical ("${canonical}")`);
  } else {
    if (canonical !== canonicalUrl(route.path)) fail(page, `canonical is "${canonical}"`);
    if (root.querySelectorAll('head > link[rel="canonical"]').length !== 1) fail(page, "canonical count is not 1");
  }
  if (root.querySelectorAll("head > title").length !== 1) fail(page, "title count is not 1");

  const robots = meta('name="robots"');
  const shouldNoindex = is404 || !!route.hidden;
  if (shouldNoindex && !robots.includes("noindex")) fail(page, "hidden page without noindex");
  if (!shouldNoindex && robots.includes("noindex")) fail(page, "noindex on a public page");

  for (const tag of [
    "og:type",
    "og:site_name",
    "og:title",
    "og:description",
    ...(is404 ? [] : ["og:url"]),
    "og:image",
    "og:image:width",
    "og:image:height",
    "og:image:alt",
  ]) {
    if (!meta(`property="${tag}"`)) fail(page, `missing ${tag}`);
  }
  for (const tag of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    if (!meta(`name="${tag}"`)) fail(page, `missing ${tag}`);
  }
  if (!is404 && meta('property="og:url"') !== canonical) fail(page, "og:url differs from the canonical");
  const isGuide = !!guideSlug;
  const ogType = meta('property="og:type"');
  if (isGuide && ogType !== "article") fail(page, `og:type is "${ogType}" on a guide (article expected)`);
  if (!isGuide && ogType !== "website") fail(page, `og:type is "${ogType}" (website expected)`);
  if (isGuide) {
    for (const tag of ["article:published_time", "article:modified_time"])
      if (!meta(`property="${tag}"`)) fail(page, `missing ${tag}`);
  }

  const ogImage = meta('property="og:image"');
  if (!ogImage.startsWith(`${SITE_URL}/og/`)) fail(page, `og:image "${ogImage}" is not under ${SITE_URL}/og/`);
  else {
    const ogFile = join(DIST, ogImage.slice(SITE_URL.length + 1));
    if (!existsSync(ogFile)) fail(page, `OG image missing: ${ogFile}`);
    else {
      const bytes = statSync(ogFile).size;
      const jpg = ogFile.endsWith(".jpg");
      if (!jpg && !ogFile.endsWith(".webp")) fail(page, `OG image "${ogImage}" is neither .webp nor .jpg`);
      // Home, hubs and guides advertise a JPEG (src/seo/site.ts ogFormat); everything else the WebP card.
      const wantJpg = route.path === "/" || !!HUBS[route.path] || route.path.startsWith("/guides/");
      if (jpg !== wantJpg) fail(page, `OG image "${ogImage}" should be a .${wantJpg ? "jpg" : "webp"}`);
      const limit = jpg ? 200 : 60;
      if (bytes > limit * 1024) fail(page, `OG image is ${(bytes / 1024).toFixed(0)} KB (> ${limit} KB)`);
      const { width, height } = await sharp(ogFile).metadata();
      if (width !== 1200 || height !== 630) fail(page, `OG image is ${width}×${height}, not 1200×630`);
    }
  }

  // Answer-first line: every component, chart, effect, block and dashboard page has a plain definition and an install line
  // (src/seo/answers.ts), 1 to 2 sentences, unique, and the registry item it names exists.
  if (
    /^\/(components|forms|overlays|layout|navigation|chat|charts|effects|blocks|dashboards)\//.test(route.path) &&
    !seo.noindex
  ) {
    const { answer, install } = seo;
    if (!answer || answer.length < 60 || answer.length > 300)
      fail(page, `answer is ${answer ? answer.length : 0} characters, expected 60 to 300 (src/seo/answers.ts)`);
    else if (answers.has(answer)) fail(page, `answer duplicates ${answers.get(answer)}`);
    else answers.set(answer, page);
    const item = /\/r\/([\w-]+)\.json$/.exec(install ?? "")?.[1];
    if (!item || !registryNames.has(item)) fail(page, `install line "${install}" names no registry item`);
  }

  // "When to use ..." section: the heading names the thing as a complete phrase (src/seo/when-heading.ts), and the first bullet adds
  // a situation instead of repeating the intro's sentence.
  const whenHeading = root
    .querySelectorAll("main article h2")
    .find((h) => /^When to use\b/.test(h.textContent.trim()) && !h.closest('[role="tabpanel"], [data-llms="skip"]'));
  if (whenHeading && !route.hidden && !seo.noindex) {
    const heading = whenHeading.textContent.trim();
    const group = route.path.split("/")[1];
    // A dashboard or an effect page is named with its noun ("the SaaS revenue dashboard", "the particles effect"); on any page a
    // bare modifier ("SaaS revenue", "blur in", "file upload", "violin") is a fragment, not a name.
    if (group === "dashboards" && !/ dashboard$/i.test(heading))
      fail(page, `"${heading}" is a fragment: a dashboard heading ends with "dashboard"`);
    if (group === "effects" && !/ effect$/i.test(heading))
      fail(page, `"${heading}" is a fragment: an effect heading ends with "effect"`);
    if (articleFragment(heading))
      fail(page, `"${heading}" is a fragment: a single-word name stands alone and capitalised ("When to use Select")`);
    if (FRAGMENT_TAIL.test(heading))
      fail(page, `"${heading}" is a fragment: it ends on a bare modifier, name the thing`);
    const first = whenHeading.closest("section")?.querySelector("li");
    if (first) {
      const bullet = first.textContent.replace(/\s+/g, " ").trim();
      const intro = [
        seo.answer ?? "",
        seo.description,
        ...root.querySelectorAll("main article header p").map((p) => p.textContent),
      ].join(" ");
      const sentences = intro.split(/(?<=[.!?])\s+/).map((x) => x.trim());
      if (sentences.includes(bullet) || sharedWordRun(bullet, intro) >= MAX_SHARED_RUN)
        fail(
          page,
          `the first "When to use" bullet repeats the intro ("${bullet.slice(0, 60)}...": add a concrete situation)`,
        );
    }
  }

  // One source of truth for the counts (src/seo/counts.ts): no number of components, charts, blocks, dashboards or guides
  // quoted on the home page or a hub may differ from it.
  if (route.path === "/" || HUBS[route.path]) {
    const want = {
      component: [COUNTS.components, COUNTS.ui, COUNTS.effects],
      chart: [COUNTS.charts],
      block: [COUNTS.blocks],
      dashboard: [COUNTS.dashboards],
      guide: [COUNTS.guides],
    };
    // Live regions announce a filter's result ("12 charts" for the KPI chip): not a claim about the whole library.
    const mainCopy = parse(root.querySelector("main")?.toString() ?? "");
    for (const live of mainCopy.querySelectorAll("[aria-live]")) live.remove();
    const text = textWithSeparators(mainCopy.toString()) + " " + description + " " + title;
    for (const claim of findCountClaims(text)) {
      if (!want[claim.kind].includes(claim.number) || claim.plus)
        fail(
          page,
          `"${claim.text}" disagrees with the page counts (${claim.kind}: ${want[claim.kind].join(" / ")}, src/seo/counts.ts)`,
        );
    }
  } else if (!isGuide && !is404) {
    // Every other page (a docs demo, a block) may mention the size of the chart set too: a stale "46 charts" in a demo
    // reached /navigation/navigation-menu once. Small numbers ("3 chart components") are not claims about the whole set.
    const mainCopy = parse(root.querySelector("main")?.toString() ?? "");
    for (const live of mainCopy.querySelectorAll("[aria-live]")) live.remove();
    for (const claim of findCountClaims(textWithSeparators(mainCopy.toString()))) {
      if (claim.kind === "chart" && claim.number >= 30 && claim.number !== COUNTS.charts)
        fail(page, `"${claim.text}" disagrees with the chart count (${COUNTS.charts}, src/seo/counts.ts)`);
    }
  }

  const ld = root.querySelectorAll('script[type="application/ld+json"]');
  if (is404 ? ld.length !== 0 : ld.length !== 1) fail(page, `${ld.length} JSON-LD scripts`);
  for (const s of ld) {
    try {
      const data = JSON.parse(s.textContent);
      const types = JSON.stringify(data);
      if (types.includes("SearchAction")) fail(page, "JSON-LD contains SearchAction");
      const fullGraph = data["@graph"] ?? [];
      // FAQPage is checked against the FAQ the page shows (same questions, same answers, none empty), then set aside.
      const faqNodes = fullGraph.filter((n) => n["@type"] === "FAQPage");
      const shownFaq = visibleFaq(root);
      if (faqNodes.length > 1) fail(page, `${faqNodes.length} FAQPage nodes`);
      const entities = faqNodes[0]?.mainEntity ?? [];
      if (entities.length !== shownFaq.length)
        fail(page, `FAQPage has ${entities.length} questions, the page shows ${shownFaq.length}`);
      entities.forEach((e, i) => {
        const a = e.acceptedAnswer?.text;
        if (!e.name?.trim() || !a?.trim()) fail(page, `FAQPage question ${i + 1} has an empty name or answer`);
        else if (e.name !== shownFaq[i]?.q || a !== shownFaq[i]?.a)
          fail(page, `FAQPage question ${i + 1} ("${e.name}") differs from the visible FAQ`);
      });
      const graph = fullGraph.filter((n) => n["@type"] !== "FAQPage");
      const expected =
        route.path === "/"
          ? ["WebSite", "Person", "Organization", "SoftwareSourceCode", "SoftwareApplication"]
          : route.path === "/about"
            ? ["BreadcrumbList", "Person", "Organization", "SoftwareSourceCode", "SoftwareApplication", "AboutPage"]
            : HUBS[route.path]
              ? ["BreadcrumbList", "CollectionPage"]
              : isGuide
                ? ["BreadcrumbList", "Article"]
                : ["BreadcrumbList", "TechArticle"];
      const got = graph.map((n) => n["@type"]);
      if (expected.some((t) => !got.includes(t)) || got.length !== expected.length)
        fail(page, `JSON-LD types are ${got.join(", ")}, expected ${expected.join(", ")}`);
      const main = graph.find((n) => n["@type"] === expected[expected.length - 1]);
      if (route.path === "/") {
        // The home page's WebSite declares the dates the home footer shows; the sitemap lastmod is the same day.
        const site = graph.find((n) => n["@type"] === "WebSite");
        if (!site?.datePublished || !site.dateModified)
          fail(page, "WebSite JSON-LD lacks datePublished or dateModified");
        else {
          modifiedByUrl.set(seo.canonical, site.dateModified);
          const shownHome = [...root.querySelectorAll("main time[datetime]")].map((t) => t.getAttribute("datetime"));
          for (const d of [site.datePublished, site.dateModified])
            if (!shownHome.includes(d)) fail(page, `the home footer does not show the JSON-LD date ${d}`);
        }
      }
      {
        // The publisher (the project Organization) is on the home page and the hubs too, not only on articles.
        const org = graph.find((n) => n["@type"] === "Organization");
        const holder = graph.find((n) => n["@type"] === "WebSite" || n["@type"] === "CollectionPage");
        const pub = holder?.publisher;
        if (holder && (route.path === "/" || HUBS[route.path])) {
          if (route.path === "/" ? !org || pub?.["@id"] !== org["@id"] : !pub?.name || !pub.url || !pub.logo?.url)
            fail(page, "JSON-LD of the home page and the hubs must name the project Organization as publisher");
        }
      }
      if (route.path !== "/" && main) {
        // The visible H1 is the keyword headline (seo.h1) of the keyword map; the JSON-LD headline is the same text.
        const h1 = h1s[0]?.textContent.trim();
        if (h1 !== seo.h1) fail(page, `H1 "${h1}" differs from the keyword map's h1 "${seo.h1}"`);
        if (main.headline !== seo.h1) fail(page, `JSON-LD headline "${main.headline}" differs from "${seo.h1}"`);
        // The sitemap's lastmod for this page must be the same day (checked below, once the sitemap is read).
        if (main.dateModified) modifiedByUrl.set(seo.canonical, main.dateModified);
        if (isGuide && (!main.datePublished || !main.dateModified || !main.author))
          fail(page, "guide Article JSON-LD lacks datePublished, dateModified or author");
        if (isGuide) {
          // Author signal: a Person with name and url; the visible <time> dates equal the JSON-LD dates.
          if (main.author?.["@type"] !== "Person" || !main.author.name || !main.author.url)
            fail(page, "guide Article author is not a Person with name and url");
          const shownDates = [...root.querySelectorAll("main time[datetime]")].map((t) => t.getAttribute("datetime"));
          for (const d of [main.datePublished, main.dateModified])
            if (d && !shownDates.includes(d) && !(d === main.dateModified && d === main.datePublished))
              fail(page, `guide byline does not show the JSON-LD date ${d}`);
        }
        if (HUBS[route.path]) {
          // A hub's CollectionPage declares the dates its footer shows (layout/PageByline.tsx), the sitemap lastmod included.
          if (!main.datePublished || !main.dateModified)
            fail(page, "CollectionPage JSON-LD lacks datePublished or dateModified");
          const shownHub = [...root.querySelectorAll("main time[datetime]")].map((t) => t.getAttribute("datetime"));
          for (const d of [main.datePublished, main.dateModified])
            if (d && !shownHub.includes(d)) fail(page, `the hub footer does not show the JSON-LD date ${d}`);
        }
        if (!isGuide && !HUBS[route.path]) {
          // datePublished is optional (only pages with a real first-written date carry one), but must be an ISO date when present.
          if (main.datePublished !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(main.datePublished)))
            fail(page, "TechArticle JSON-LD datePublished is not an ISO date");
          if (main.mainEntityOfPage !== seo.canonical)
            fail(page, "TechArticle JSON-LD mainEntityOfPage is not the canonical URL");
          if (
            !main.publisher?.name ||
            !main.publisher.url ||
            main.publisher.logo?.["@type"] !== "ImageObject" ||
            !main.publisher.logo.url
          )
            fail(page, "TechArticle JSON-LD publisher lacks name, url or a logo ImageObject");
          // The footer byline shows the same author and dates (layout/PageByline.tsx), so structured data claims nothing hidden.
          if (main.author?.["@type"] !== "Person" || !main.author.name || !main.author.url)
            fail(page, "TechArticle JSON-LD author is not a Person with name and url");
          if (!main.datePublished || !main.dateModified)
            fail(page, "TechArticle JSON-LD lacks datePublished or dateModified");
          const shown = [...root.querySelectorAll("main time[datetime]")].map((t) => t.getAttribute("datetime"));
          for (const d of [main.datePublished, main.dateModified])
            if (d && !shown.includes(d)) fail(page, `the page footer does not show the JSON-LD date ${d}`);
        }
      }
      const crumbs = graph.find((n) => n["@type"] === "BreadcrumbList")?.itemListElement?.map((c) => c.name);
      const shown = [...root.querySelectorAll('nav[aria-label="Breadcrumb"] li')]
        .filter((li) => !li.getAttribute("aria-hidden"))
        .map((li) => li.textContent.trim());
      if (route.path !== "/" && JSON.stringify(crumbs) !== JSON.stringify(shown))
        fail(
          page,
          `visible breadcrumb [${shown.join(" > ")}] differs from the JSON-LD [${(crumbs ?? []).join(" > ")}]`,
        );
    } catch (e) {
      fail(page, `JSON-LD does not parse: ${e.message}`);
    }
  }

  if (/href="#\//.test(html)) fail(page, 'contains href="#/…" hash links');
  for (const img of root.querySelectorAll("img")) {
    if (!img.hasAttribute("alt")) fail(page, `<img src="${img.getAttribute("src")}"> without alt`);
  }

  for (const a of root.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:|data:)/.test(href)) continue;
    internalLinks.add(`${page} → ${href}`);
  }

  if (root.querySelector("#root")?.innerHTML.trim() === "") fail(page, "#root is empty");

  // Keyword in the H1 and in the first 100 words of the article.
  if (!is404 && !route.hidden && seo.keyword) {
    const article = parse((root.querySelector("main article") ?? root.querySelector("main"))?.toString() ?? "");
    article.querySelectorAll("pre,code,script,style,svg,table,nav").forEach((x) => x.remove());
    // Tags become spaces, so the eyebrow, the H1 and the intro are separate words (textContent would glue them).
    const first100 = article
      .toString()
      .replace(/<[^>]+>/g, " ")
      .replace(/&#x27;|&amp;|&quot;/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 100)
      .join(" ");
    const proseWords = article
      .toString()
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    if (!HUBS[route.path] && !isGuide && route.path !== "/") proseRows.push({ page, words: proseWords });
    pageFacts.set(route.path, { title, h1: h1s[0]?.textContent ?? "", first100, noindex: seo.noindex });
    keywordRows.push({
      page,
      keyword: seo.keyword,
      // The visible H1 is the sidebar name by design; the keyword lives in the <title>, the meta description or the JSON-LD
      // headline (seo.h1), so any of those (or the H1 itself) counts.
      inH1:
        hasKeyword(h1s[0]?.textContent ?? "", seo.keyword) ||
        hasKeyword(seo.h1, seo.keyword) ||
        hasKeyword(seo.title ?? title, seo.keyword) ||
        hasKeyword(description, seo.keyword),
      inFirst100: hasKeyword(first100, seo.keyword),
      h1: h1s[0]?.textContent.trim(),
    });
  }
  // Every section heading of the page (an h2 or h3 of a top-level <section>; the headings inside demos are the demos'
  // own) needs an id that survives a rebuild and a client-side navigation: the slug of its text (layout/heading-ids.ts).
  const generatedId = (id) => /(^|-)(_r_|_R_|:r)/.test(id) || id.startsWith(":");
  for (const h of root.querySelectorAll("main article h2, main article h3")) {
    // Demos (inside an Example's preview panel) and the decorative stage (data-llms="skip") have their own headings: not page sections.
    if (route.hidden || h.closest("header") || h.closest('[role="tabpanel"], [data-example-code], [data-llms="skip"]'))
      continue;
    const section = h.closest("section");
    if (section?.parentNode?.closest?.("section")) continue;
    const id = h.getAttribute("id");
    if (!id || generatedId(id)) fail(page, `heading "${h.textContent.trim().slice(0, 40)}" has no stable id`);
  }
  const seenIds = new Set();
  for (const el of root.querySelectorAll("[id]")) {
    const id = el.getAttribute("id");
    if (id && !generatedId(id) && seenIds.has(id)) fail(page, `duplicate id "${id}"`);
    if (id) seenIds.add(id);
  }
  if (!is404 && route.path !== "/" && !root.querySelector('nav[aria-label="Breadcrumb"]'))
    fail(page, "no visible breadcrumb");
  if (isGuide) {
    const article = root.querySelector("main article");
    if (!article?.querySelector('a[rel~="author"]')) fail(page, "guide without an author byline");
    if (!article?.querySelector("time[datetime]")) fail(page, "guide without a visible date");
    if (!article?.querySelector("img[alt][width][height]")) fail(page, "guide without a hero image");
  }
  if (
    HUBS[route.path] &&
    routes.some((r) => r.path.startsWith(`${route.path}/`)) &&
    !existsSync(join(DIST, route.path.slice(1), "index.html"))
  ) {
    fail(page, `hub without ${route.path.slice(1)}/index.html (a host that redirects the folder URL would 404)`);
  }
  // Core Web Vitals readiness of the static HTML: nothing in <head> blocks the first paint, the LCP image is fetched early,
  // images have a size, and the text fonts are preloaded (the guides preload their LCP image instead).
  if (!is404) {
    const head = html
      .slice(0, html.indexOf("</head>"))
      .replace(/<noscript>[\s\S]*?<\/noscript>/g, "")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, (tag) => (/\bsrc=/.test(tag) ? tag : ""));
    if (/<link\b[^>]*rel="stylesheet"/.test(head))
      fail(page, "render-blocking <link rel=stylesheet> in <head> (the CSS is inlined)");
    if (/<script\b[^>]*\bsrc=/.test(head) && !/<script\b[^>]*\bsrc=[^>]*(?:async|defer|type="module")/.test(head))
      fail(page, "render-blocking <script src> in <head>");
    for (const img of root.querySelectorAll("img")) {
      const decorative = img.getAttribute("alt") === "" && img.getAttribute("aria-hidden") === "true";
      if (!decorative && !(img.getAttribute("width") && img.getAttribute("height")))
        fail(page, `<img src="${img.getAttribute("src")}"> has no width and height (layout shift)`);
      if (img.getAttribute("loading") === "lazy" && /^high$/i.test(img.getAttribute("fetchpriority") ?? ""))
        fail(page, `<img src="${img.getAttribute("src")}"> is lazy and fetchpriority=high at once`);
    }
    // The guides and the /guides hub have a cover picture as their LCP: preloaded with high priority; their first picture is not lazy-only.
    const coverLcp = isGuide || route.path === "/guides";
    if (coverLcp && !root.querySelector('link[rel="preload"][as="image"][fetchpriority="high"]'))
      fail(page, "guide (or the guides hub) without a high-priority preload of its cover image (its LCP)");
    if (route.path === "/guides" && !root.querySelector("[data-lcp] img.hubp-cover--liquid-light"))
      fail(page, "the guides hub's first card has no data-lcp cover for the preload script to upgrade");
    // The cover that is the LCP of the default look is eager with high priority in the static HTML itself (not only after a script).
    if (coverLcp) {
      const first = root.querySelector(
        isGuide ? "img.guide-hero-s--liquid-light" : "[data-lcp] img.hubp-cover--liquid-light",
      );
      if (
        first &&
        (first.getAttribute("loading") === "lazy" || !/^high$/i.test(first.getAttribute("fetchpriority") ?? ""))
      )
        fail(page, "the cover that is the LCP is lazy or not fetchpriority=high in the static HTML");
    }
    if (!coverLcp && !root.querySelector('link[rel="preload"][as="font"][type="font/woff2"][crossorigin]'))
      fail(page, "no preload of the text font (woff2)");
    // Initial bytes of this page's class, for the report: HTML, inlined CSS, linked sheet and the JS the loader adds (gzip).
    const assets = /<script type="application\/json" id="sheen-assets">([\s\S]*?)<\/script>/.exec(html)?.[1];
    if (assets) {
      const { css, entry, preload } = JSON.parse(assets.replace(/\\u003c/g, "<"));
      const gz = (href) => {
        const file = join(DIST, href.slice(BASE_PATH.length));
        if (!gzCache.has(file)) gzCache.set(file, existsSync(file) ? gzipSync(readFileSync(file)).length : 0);
        return gzCache.get(file);
      };
      const cls = route.path === "/" ? "home" : route.path.split("/").length === 2 ? "hub" : route.path.split("/")[1];
      const row = cwvByClass.get(cls) ?? { pages: 0, htmlKB: 0, criticalCssKB: 0, sheetKB: 0, jsKB: 0 };
      row.pages++;
      row.htmlKB = Math.max(row.htmlKB, Math.round(gzipSync(html).length / 102.4) / 10);
      row.criticalCssKB = Math.max(
        row.criticalCssKB,
        Math.round(Buffer.byteLength(/<style id="sheen-critical">([\s\S]*?)<\/style>/.exec(html)?.[1] ?? "") / 102.4) /
          10,
      );
      row.sheetKB = Math.max(row.sheetKB, Math.round(css.reduce((n, h) => n + gz(h), 0) / 102.4) / 10);
      row.jsKB = Math.max(row.jsKB, Math.round([entry, ...preload].reduce((n, h) => n + gz(h), 0) / 102.4) / 10);
      cwvByClass.set(cls, row);
    }
  }
  // A card on a hub or the home page links to the page that carries its name.
  if (!is404 && (HUBS[route.path] || route.path === "/")) {
    for (const a of root.querySelectorAll("main :is(h2, h3, h4) > a[href]")) {
      const href = a.getAttribute("href") ?? "";
      const target = routeOfHref(href);
      const name = a.textContent.replace(/\s+/g, " ").trim();
      if (target) hubCards.push({ page, name, target, hash: href.split("#")[1] ?? "" });
    }
  }
  // Which pages does this page's own content (not the sidebar) link to?
  if (!is404) {
    for (const a of root.querySelectorAll("main a[href]")) {
      const target = routeOfHref(a.getAttribute("href") ?? "");
      if (target && target !== route.path) {
        if (!contentInbound.has(target)) contentInbound.set(target, new Set());
        contentInbound.get(target).add(route.path);
        if (!anchorsTo.has(target)) anchorsTo.set(target, []);
        anchorsTo.get(target).push({ from: route.path, text: a.textContent.replace(/\s+/g, " ").trim() });
      }
    }
  }
  const words = ((root.querySelector("article") ?? root.querySelector("#root"))?.textContent ?? "")
    .split(/\s+/)
    .filter(Boolean).length;
  wordCounts.push({ page, words });
  if (!is404 && words < 250) warn(page, `${words} words in <main> (< 250)`);
}

/* ---------- Internal links ---------- */

const base = BASE_PATH.replace(/\/$/, "");
let brokenLinks = 0;
for (const entry of internalLinks) {
  const [page, href] = entry.split(" → ");
  const path = href.split(/[?#]/)[0];
  if (!path.startsWith(BASE_PATH) && path !== base) {
    // A root-relative link without the base path ("/", "/docs") leaves the site on a project page: a crawler
    // follows it to a 404 on someone else's origin. Demo links must be fragments (see demoHref in LayoutPages).
    fail(page, `link "${href}" points outside the site (missing the ${BASE_PATH} base)`);
    continue;
  }
  const rel = path === base ? "/" : path.slice(base.length);
  // A hub's canonical, sitemap entry and index.html all use the slash form; a slashless link is a 301 away from it.
  if (rel in HUBS) fail(page, `link "${href}" points to the hub without its trailing slash (use "${path}/")`);
  if (!resolveFile(DIST, rel)) {
    fail(page, `broken internal link "${href}"`);
    brokenLinks++;
  }
}

/* ---------- One URL per page ---------- */

// Every built HTML file: a real page exists once (at the file that answers its canonical URL), the other files are
// redirect stubs that point at a real page (the hub twins x.html, the renamed routes). See lib/duplicate-pages.mjs.
{
  const walk = (dir, rel = "") =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.name.startsWith("._") || e.name === "assets" || e.name === "r" || e.name === "og"
        ? []
        : e.isDirectory()
          ? walk(join(dir, e.name), `${rel}${e.name}/`)
          : e.name.endsWith(".html")
            ? [`${rel}${e.name}`]
            : [],
    );
  const files = walk(DIST)
    .filter((f) => f !== "404.html")
    .map((file) => ({ file, html: readFileSync(join(DIST, file), "utf8") }));
  for (const message of findDuplicatePages(files, SITE_URL)) fail("duplicates", message);
  for (const route of routes.filter((r) => hasChildren(r.path) && r.path !== "/")) {
    const stubFile = join(DIST, `${route.path.slice(1)}.html`);
    if (!existsSync(stubFile)) continue; // absent is fine too: the host answers /hub with a 301 to /hub/
    const stub = readFileSync(stubFile, "utf8");
    if (!stub.includes(`rel="canonical" href="${canonicalUrl(route.path)}"`))
      fail(`${route.path.slice(1)}.html`, `hub twin lacks the canonical ${canonicalUrl(route.path)}`);
    if (!/http-equiv="refresh"/.test(stub) || /<h1[\s>]/.test(stub))
      fail(`${route.path.slice(1)}.html`, "hub twin is not a minimal redirect stub");
  }
}

/* ---------- Sitemap and robots ---------- */

const sitemapFile = join(DIST, "sitemap.xml");
if (!existsSync(sitemapFile)) fail("sitemap.xml", "missing");
else {
  const xml = readFileSync(sitemapFile, "utf8");
  try {
    execFileSync("xmllint", ["--noout", sitemapFile], { stdio: "pipe" });
  } catch (e) {
    if (e.code === "ENOENT") warn("sitemap.xml", "xmllint not installed, skipped well-formedness check");
    else fail("sitemap.xml", `not well-formed XML: ${String(e.stderr).trim()}`);
  }
  if (!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'))
    fail("sitemap.xml", "missing the sitemaps.org namespace");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !u.includes("/og/"));
  const expected = routes.filter((r) => !r.hidden && !pageSeo(r).noindex).map((r) => canonicalUrl(r.path));
  for (const u of expected) if (!locs.includes(u)) fail("sitemap.xml", `missing ${u}`);
  for (const u of locs) if (!expected.includes(u)) fail("sitemap.xml", `unexpected ${u}`);
  if (new Set(locs).size !== locs.length) fail("sitemap.xml", "duplicate <loc> entries");
  for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(m[1])) fail("sitemap.xml", `bad lastmod ${m[1]}`);
  }
  // The dates are written in the author's time zone, so a lastmod one day ahead of UTC is today.
  const nextDay = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  for (const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
    const ld = modifiedByUrl.get(m[1]);
    if (ld && ld !== m[2]) fail("sitemap.xml", `${m[1]}: lastmod ${m[2]} differs from the JSON-LD dateModified ${ld}`);
    if (m[2] > nextDay) fail("sitemap.xml", `${m[1]}: lastmod ${m[2]} is in the future`);
  }
  const urlCount = (xml.match(/<url>/g) ?? []).length;
  const lastmodCount = (xml.match(/<lastmod>/g) ?? []).length;
  if (lastmodCount !== urlCount) fail("sitemap.xml", `${lastmodCount} <lastmod> for ${urlCount} <url> entries`);
}
const robotsFile = join(DIST, "robots.txt");
if (!existsSync(robotsFile)) fail("robots.txt", "missing");
else {
  const robots = readFileSync(robotsFile, "utf8");
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) fail("robots.txt", "no absolute Sitemap line");
  if (/Disallow:\s*\/\s*$/m.test(robots)) fail("robots.txt", "disallows everything");
  for (const bot of [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "PerplexityBot",
    "Perplexity-User",
    "DuckAssistBot",
    "anthropic-ai",
    "cohere-ai",
    "Meta-ExternalAgent",
    "Amazonbot",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
    "Bingbot",
  ])
    if (!robots.includes(`User-agent: ${bot}\nAllow: /`)) fail("robots.txt", `${bot} is not explicitly allowed`);
}
if (existsSync(join(DIST, "llms.txt"))) {
  const c = COUNTS;
  const sentence = `${c.components} components (${c.ui} UI components and ${c.effects} effects), ${c.charts} charts, ${c.blocks} blocks, ${c.dashboards} dashboards and ${c.guides} guides`;
  if (!readFileSync(join(DIST, "llms.txt"), "utf8").includes(sentence))
    fail("llms.txt", `the Facts block does not say "${sentence}"`);
}
/* LLM visibility: every indexable page is in llms.txt, has its full text in llms/*.txt and a Markdown twin linked from its head. */
if (existsSync(join(DIST, "llms.txt")) && existsSync(join(DIST, "llms"))) {
  const llms = readFileSync(join(DIST, "llms.txt"), "utf8");
  const llmsFull = readFileSync(join(DIST, "llms-full.txt"), "utf8");
  const installMap = loadInstallMap();
  const sectionText = readdirSync(join(DIST, "llms"))
    .filter((f) => !f.startsWith("._"))
    .map((f) => readFileSync(join(DIST, "llms", f), "utf8"))
    .join("\n");
  for (const [needle, what] of [
    ["## Definitions", "a quotable Definitions block"],
    ["License: MIT", "a license line"],
    ["Cite as:", "a citation line"],
  ])
    for (const [name, text] of [
      ["llms.txt", llms],
      ["llms-full.txt", llmsFull],
    ])
      if (!text.includes(needle)) fail(name, `lacks ${what}`);
  for (const route of routes.filter((r) => !r.hidden && !pageSeo(r).noindex)) {
    const seo = pageSeo(route);
    // llms.txt lists hubs and guides only and points to the section files; llms-full.txt is the complete index of every page.
    if (!llmsFull.includes(`(${seo.canonical})`)) fail(route.path, "not listed in llms-full.txt");
    if (
      (route.path.startsWith("/guides/") || route.path.split("/").filter(Boolean).length <= 1) &&
      !llms.includes(`(${seo.canonical})`)
    )
      fail(route.path, "a hub or guide not listed in llms.txt");
    if (!sectionText.includes(`URL: ${seo.canonical}\n`)) fail(route.path, "its full text is in no llms/*.txt file");
    // A guide's section in llms/*.txt runs from its "URL:" line to the next page's.
    if (route.path.startsWith("/guides/")) {
      const at = sectionText.indexOf(`URL: ${seo.canonical}\n`);
      const next = sectionText.indexOf("\nURL: ", at + 5);
      const dup = at < 0 ? null : findDuplicatedRun(sectionText.slice(at, next < 0 ? undefined : next));
      if (dup) fail(route.path, `its llms/*.txt section holds the body twice ("${dup.slice(0, 50)}...")`);
    }
    const installItem = /\/r\/([\w-]+)\.json$/.exec(seo.install ?? "")?.[1];
    if (seo.install && !sectionText.includes(`${installLabel(installItem)}:\n\n\`\`\`bash\n${seo.install}\n\`\`\`\n`))
      fail(route.path, "the llms text lacks its install command");
    const twin = route.path === "/" ? "index.md" : `${route.path.slice(1)}.md`;
    const html = readFileSync(join(DIST, route.path === "/" ? "index.html" : distFile(route.path)), "utf8");
    // A value rendered as text more than once ("12,48012,48012,480") reads wrong to a crawler, a screen reader and a copy-paste.
    const repeated = findRepeatedNumber(htmlTextContent(html));
    if (repeated)
      fail(route.path, `the page text repeats the number "${repeated}" back to back (a value rendered as text twice)`);
    if (
      !html.includes(
        `<link rel="alternate" type="text/markdown" title="This page as Markdown" href="${SITE_URL}/${twin}"/>`,
      )
    )
      fail(route.path, "no <link rel=alternate type=text/markdown> to its Markdown twin");
    else if (!existsSync(join(DIST, twin))) fail(route.path, `Markdown twin ${twin} is missing`);
    else {
      const twinText = readFileSync(join(DIST, twin), "utf8");
      // Every command widget of the page (a `$ command` field) is also in the twin, so the twin keeps what the page says to run.
      for (const m of html.matchAll(/<code class="home-cta__cmd"[^>]*>([^<]*)<\/code>/g))
        if (!twinText.includes(unesc(m[1]).trim()))
          fail(route.path, `Markdown twin ${twin} drops the command "${unesc(m[1]).trim().slice(0, 60)}"`);
      // The install item named on the page is the item that owns the page's own source (its "shadcn CLI" line): its closure holds them.
      const installItem = /\/r\/([\w-]+)\.json$/.exec(seo.install ?? "")?.[1];
      if (installItem) {
        const have = itemClosure(installMap, installItem);
        const { own, also } = panelItems(html);
        const missing = own.filter((n) => !have.has(n));
        if (missing.length)
          fail(
            route.path,
            `its install item "${installItem}" does not install ${missing.join(", ")}, the item of the page's own source`,
          );
        // No example imports a file outside the install item's closure unless the example lists the item as an extra.
        const wanted = new Set();
        for (const m of html.matchAll(/<div[^>]*data-example-code[^>]*><pre><code>([\s\S]*?)<\/code><\/pre>/g)) {
          const code = unesc(m[1]);
          const listed = new Set(/^\/\/ This example also uses .*$/m.exec(code)?.[0].match(/[\w-]+(?=\.json)/g) ?? []);
          for (const imp of code.matchAll(/from "(@\/components\/sheenui\/[^"]+)"/g)) {
            const item = installMap.owner.get(imp[1]);
            if (!item || have.has(item)) continue;
            wanted.add(item);
            if (!listed.has(item))
              fail(
                route.path,
                `an example imports ${imp[1]} (item "${item}"), which the install item "${installItem}" does not install and no extras line lists`,
              );
          }
        }
        // Every component an example imports is in the page's item or in the panel's "The examples also use" group.
        // An "also uses" item installs its own registry dependencies too (data-table brings avatar and select).
        const covered = new Set(have);
        for (const item of also) for (const dep of itemClosure(installMap, item)) covered.add(dep);
        for (const item of uncoveredItems([...wanted], covered, also))
          fail(
            route.path,
            `an example imports item "${item}", which neither the install item "${installItem}" nor the panel's "The examples also use" group installs`,
          );
        // The same extras are named in the twin, under the page's import block.
        for (const item of wanted)
          if (!twinText.includes(`/r/${item}.json`) || !/These examples also use /.test(twinText))
            fail(route.path, `Markdown twin ${twin} does not say to add "${item}", which the examples import`);
      }
      // A prose code sample that imports from the package must show the copied-files import too (the Code tabs do).
      for (const m of html.matchAll(/<pre\b[^>]*><code>([\s\S]*?)<\/code><\/pre>/g)) {
        const code = unesc(m[1]);
        if (
          /from "@sheenui\/theme(\/demo-data)?"/.test(code) &&
          !/@\/components\/sheenui\//.test(code) &&
          !/^\/\/ Package build/m.test(code)
        )
          fail(
            route.path,
            `a code sample imports only from "@sheenui/theme" ("${code.slice(0, 50).replace(/\n/g, " ")}...") with no copied-files import`,
          );
      }
      if (!twinText.includes(`URL: ${seo.canonical}`))
        fail(route.path, `Markdown twin ${twin} does not state the page URL`);
      const repeatedInTwin = findRepeatedNumber(twinText);
      if (repeatedInTwin) fail(route.path, `Markdown twin ${twin} repeats the number "${repeatedInTwin}" back to back`);
      const dup = route.path.startsWith("/guides/") ? findDuplicatedRun(twinText) : null;
      if (dup) fail(route.path, `Markdown twin ${twin} holds its body twice ("${dup.slice(0, 50)}...")`);
    }
  }
}
/* An export is mapped to a page only when that page's text names it (llms/exports*.txt and the api index). */
if (existsSync(join(DIST, "llms"))) {
  const pageTextByUrl = new Map();
  for (const route of routes.filter((r) => !r.hidden && !pageSeo(r).noindex)) {
    const twin = route.path === "/" ? "index.md" : `${route.path.slice(1)}.md`;
    if (existsSync(join(DIST, twin)))
      pageTextByUrl.set(pageSeo(route).canonical, readFileSync(join(DIST, twin), "utf8"));
  }
  for (const file of readdirSync(join(DIST, "llms")).filter((f) => /^(exports(-\d+)?|api-index)\.txt$/.test(f)))
    for (const line of readFileSync(join(DIST, "llms", file), "utf8").split("\n")) {
      const m = /^- ([\w$]+)(?: \((https?:[^)\s]+)\)|: (https?:\S+))/.exec(line);
      const url = m?.[2] ?? m?.[3];
      if (!m || !url) continue;
      const text = pageTextByUrl.get(url);
      if (text === undefined) fail(`llms/${file}`, `${m[1]} maps to ${url}, which is no indexable page`);
      else if (!namesExport(text, m[1])) fail(`llms/${file}`, `${m[1]} maps to ${url}, whose text never names it`);
    }
}
for (const f of ["llms.txt", "llms-full.txt", "llms/api-index.txt", "404.html", ".nojekyll"])
  if (!existsSync(join(DIST, f))) fail(f, "missing");

/* ---------- Fonts: every @font-face swaps ---------- */
{
  const assets = join(DIST, "assets");
  for (const f of existsSync(assets)
    ? readdirSync(assets).filter((n) => n.endsWith(".css") && !n.startsWith("._"))
    : []) {
    const css = readFileSync(join(assets, f), "utf8");
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    // The metric-matched fallbacks use local() only: no download, so no swap to speak of.
    const bad = faces.filter(
      (face) => /url\(/.test(face) && !/font-display:\s*(swap|optional|fallback|var\()/.test(face),
    );
    if (bad.length) fail(`assets/${f}`, `${bad.length} @font-face without font-display swap`);
  }
}

/* ---------- Target queries: exactly one page owns each ---------- */

// Every hub / home card names the page it links to (an example that lives on the hub itself is reached by its #anchor, whose id must exist).
const hubCardsByPage = new Map();
for (const card of hubCards) {
  const target = routes.find((r) => r.path === card.target);
  const facts = pageFacts.get(card.target);
  if (!target || !facts) continue;
  if (card.target === card.page) {
    if (!card.hash || !readFileSync(join(DIST, distFile(card.page)), "utf8").includes(`id="${card.hash}"`))
      fail(card.page, `card "${card.name}" links to an anchor (#${card.hash}) that is not on the page`);
    continue;
  }
  const why = cardMismatch(card.name, [target.title, facts.title, facts.h1, pageSeo(target).description]);
  if (why) fail(card.page, `card "${card.name}" links to ${card.target}: ${why}`);
  hubCardsByPage.set(card.page, (hubCardsByPage.get(card.page) ?? 0) + 1);
}
if (!hubCardsByPage.size) fail("/", "no hub card was found: the card check reads `main h3 > a` on every hub");

// The queries the site is built to rank for. Each has ONE target page: its title, H1 and first 100 words carry every word of
// the query, at least `anchors` other pages link to it with matching link text, and no other indexable page carries the
// whole query in both its title and its H1 (two pages competing for one query split the ranking).
const TARGET_QUERIES = [
  {
    query: "glassmorphism react components",
    path: "/",
    anchor: /glassmorphism|sheenui|home|introduction/i,
    anchors: 3,
  },
  { query: "liquid glass ui react", path: "/effects/liquid-glass", anchor: /liquid glass/i, anchors: 4 },
  { query: "shadcn alternatives", path: "/guides/shadcn-alternatives", anchor: /shadcn alternatives/i, anchors: 3 },
  { query: "tailwind v4 glass ui", path: "/docs/tailwind-v4", anchor: /tailwind.*v4|v4.*tailwind/i, anchors: 5 },
  { query: "react glass dashboard template", path: "/dashboards", anchor: /dashboard template/i, anchors: 3 },
  { query: "animated react components", path: "/effects", anchor: /animated|effects/i, anchors: 3 },
  {
    query: "accessible react charts",
    path: "/guides/accessible-react-charts",
    anchor: /accessible.*chart/i,
    anchors: 3,
  },
  { query: "react glass login page", path: "/blocks/glass-login", anchor: /login/i, anchors: 3 },
];
for (const { query, path, anchor, anchors } of TARGET_QUERIES) {
  const facts = pageFacts.get(path);
  if (!facts) {
    fail(path, `target page of "${query}" was not checked`);
    continue;
  }
  if (!hasKeyword(facts.title, query)) fail(path, `target of "${query}": the <title> lacks a word of the query`);
  if (!hasKeyword(facts.h1, query)) fail(path, `target of "${query}": the H1 "${facts.h1}" lacks a word of the query`);
  if (!hasKeyword(facts.first100, query))
    fail(path, `target of "${query}": the first 100 words lack a word of the query`);
  const linkTexts = (anchorsTo.get(path) ?? []).filter((a) => anchor.test(a.text));
  const from = new Set(linkTexts.map((a) => a.from));
  if (from.size < anchors)
    fail(
      path,
      `target of "${query}": ${from.size} other pages link to it with text matching ${anchor} (need ${anchors})`,
    );
  for (const [other, f] of pageFacts)
    if (other !== path && !f.noindex && hasKeyword(f.title, query) && hasKeyword(f.h1, query))
      fail(other, `competes with ${path} for "${query}": its title and H1 both carry the whole query`);
}

/* ---------- Keyword coverage and content links ---------- */

const pct = (n, of) => (of ? Math.round((n / of) * 1000) / 10 : 100);
const kwInH1 = keywordRows.filter((r) => r.inH1).length;
const kwFirst100 = keywordRows.filter((r) => r.inFirst100).length;
const h1Coverage = pct(kwInH1, keywordRows.length);
const first100Coverage = pct(kwFirst100, keywordRows.length);
if (h1Coverage < 95)
  fail("keywords", `primary keyword in the H1 on ${h1Coverage}% of ${keywordRows.length} pages (< 95%)`);
if (first100Coverage < 95)
  fail(
    "keywords",
    `primary keyword in the first 100 words on ${first100Coverage}% of ${keywordRows.length} pages (< 95%)`,
  );
for (const r of keywordRows.filter((r) => !r.inH1))
  warn(r.page, `no title, meta description, JSON-LD headline or H1 carries the keyword "${r.keyword}" (H1 "${r.h1}")`);
for (const r of keywordRows.filter((r) => !r.inFirst100))
  warn(r.page, `the first 100 words lack the keyword "${r.keyword}"`);
const orphans = routes
  .filter((r) => !r.hidden && r.path !== "/" && !(contentInbound.get(r.path)?.size > 0))
  .map((r) => r.path);
for (const path of orphans) fail(path, "no other page links to it from its content (only the sidebar does)");

const thin = proseRows.filter((r) => r.words < 350);
const thinShare = pct(thin.length, proseRows.length);
if (thinShare > 5)
  fail("prose", `${thin.length} of ${proseRows.length} docs pages (${thinShare}%) have fewer than 350 words of prose`);
for (const r of thin) warn(r.page, `${r.words} words of prose (< 350)`);

/* ---------- Report ---------- */

const thinnest = wordCounts.sort((a, b) => a.words - b.words).slice(0, 5);
const summary = {
  pages: pagesChecked,
  routes: routes.length + 1,
  internalLinks: internalLinks.size,
  brokenLinks,
  errors: errors.length,
  warnings: warnings.length,
  thinnest,
  initialBytesByRouteClass: Object.fromEntries(cwvByClass),
  keywordInH1: `${h1Coverage}% (${kwInH1}/${keywordRows.length})`,
  keywordInFirst100Words: `${first100Coverage}% (${kwFirst100}/${keywordRows.length})`,
  contentOrphans: orphans.length,
  docsPagesWithAtLeast350ProseWords: `${proseRows.length - thin.length}/${proseRows.length}`,
  medianProseWords: [...proseRows].sort((a, b) => a.words - b.words)[Math.floor(proseRows.length / 2)]?.words,
};
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`FAIL  ${e}`);
console.log(`seo:check ${JSON.stringify(summary)}`);
if (process.env.SEO_REPORT) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(process.env.SEO_REPORT, JSON.stringify({ summary, errors, warnings }, null, 2));
}
process.exit(errors.length ? 1 : 0);
