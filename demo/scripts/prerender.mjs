// Static prerender: one HTML file per route, from the SSR bundle (dist-ssr/entry-server.js)
// into the client build (dist/). Also writes 404.html, sitemap.xml, robots.txt, llms.txt,
// llms-full.txt and llms/*.txt (the OG cards are committed in public/og; see og-images.mjs). Runs as the last step of `pnpm build`.
//
// File layout (GitHub Pages and `vite preview` both serve `x.html` at `/x`):
//   /                      → dist/index.html
//   /components/button     → dist/components/button.html
//   /charts                → dist/charts.html and dist/charts/index.html (a route with children)
//   anything else          → dist/404.html (GitHub Pages serves it with a real 404 status)

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { firstExample, pageSources, resolvePageModule, routeModules } from "./lib/routes-source.mjs";
import { createCriticalCss, htmlTokens } from "./lib/critical-css.mjs";
import { createSplitter, jsTokens, planSheets, routeVocabulary } from "./lib/css-split.mjs";
import { writeLlmsFiles } from "./lib/llms.mjs";
import {
  extraItems,
  extrasLine,
  loadInstallMap,
  withCopiedImports,
  withNoteUnderImports,
} from "../../scripts/lib/install-imports.mjs";
import { tocOf } from "./lib/headings.mjs";
import { visibleFaq } from "./lib/faq.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// DIST_DIR / SSR_DIR: build into other folders (profiling builds); the defaults are the real output.
const DIST = resolve(DEMO, process.env.DIST_DIR ?? "dist");
const SSR = join(resolve(DEMO, process.env.SSR_DIR ?? "dist-ssr"), "entry-server.js");

if (!existsSync(SSR) || !existsSync(join(DIST, "index.html"))) {
  console.error("prerender: run `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr` first");
  process.exit(1);
}

/**
 * React's server renderer writes every `hidden` as `hidden=""`; the client upgrades closed accordion panels to
 * `hidden="until-found"` in an effect. The theme marks panels of a `hiddenUntilFound` Accordion with `data-until-found`,
 * so the static HTML can say the same thing the live DOM does (find-in-page and #fragment links open them before JS runs).
 */
function untilFound(body) {
  return body.replace(/<[a-z][\w-]*\b[^>]*\bdata-until-found=""[^>]*>/g, (tag) =>
    tag.replace(/(\s)hidden=""/, '$1hidden="until-found"'),
  );
}

const t0 = Date.now();
const server = await import(pathToFileURL(SSR).href);
const {
  routes,
  notFoundRoute,
  pageSeo,
  seoRow,
  contentRow,
  buildJsonLd,
  jsonLdScript,
  linkTargets,
  HUBS,
  GUIDE_IMAGE_SIZES,
  HUB_COVER_SIZES,
  guideImageSrcSet,
  guideImages,
  guideStyledShots,
  SITE_URL,
  BASE_PATH,
  canonicalUrl,
  pageDates,
  COUNTS,
  AUTHOR,
} = server;

// Hub pages are also folders (/charts → charts.html and charts/index.html). A static host may answer /charts
// with a redirect to /charts/, so the inline script in index.html must leave a trailing slash alone on these
// paths and canonicalise every other page (see the script there). The list is written into the template.
const hubPaths = Object.keys(HUBS)
  .filter((path) => routes.some((r) => r.path.startsWith(`${path}/`)))
  .map((path) => `${BASE_PATH.replace(/\/$/, "")}${path}/`);
const builtTemplate = readFileSync(join(DIST, "index.html"), "utf8").replace(
  "/*sheen-hubs*/[]",
  JSON.stringify(hubPaths),
);
const manifest = JSON.parse(readFileSync(join(DIST, ".vite", "manifest.json"), "utf8"));

/*
 * First paint (lib/critical-css.mjs has the why). Vite put one render-blocking stylesheet and the entry
 * script into the template's <head>. The prerender instead
 *   - inlines each page's critical CSS (the rules its HTML can use) and loads the full stylesheet later;
 *   - lists the scripts (the entry, the modulepreloads of its static imports and of the route's chunk) in a
 *     JSON block, and a tiny inline script at the end of <body> adds them to <head> right after the first
 *     frame has painted (the first `paint` entry, delivered once the frame is presented, then `setTimeout 0`; or after 1 s in a hidden tab), together
 *     with the full stylesheet. The HTML, the hero image and the preloaded fonts are then the only requests
 *     before the first paint, on a slow network as in Lighthouse's model; the code arrives one frame later
 *     than it would have, in parallel as before (the preloads keep the module graph flat).
 * `pnpm budget` reads the same JSON block. Both steps can be switched off for a comparison build:
 * SHEEN_CRITICAL_CSS=0 keeps the blocking stylesheet, SHEEN_SCRIPTS=head keeps the tags in <head>.
 */
const CRITICAL_CSS = process.env.SHEEN_CRITICAL_CSS !== "0";
const DEFER_SCRIPTS = process.env.SHEEN_SCRIPTS !== "head";
const styleTag = /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/.exec(builtTemplate);
const entryTag = /<script type="module"[^>]*src="([^"]+\.js)"[^>]*><\/script>/.exec(builtTemplate);
if (!styleTag || !entryTag) {
  console.error("prerender: the built index.html has no stylesheet link or module script to rewrite");
  process.exit(1);
}
const [, cssHref] = styleTag;
const [, entryHref] = entryTag;
const template = builtTemplate.replace(styleTag[0], "<!--app-css-->").replace(entryTag[0], "<!--app-scripts-->");
// A stylesheet imported from a lazy component (`import "./X.css"`) is emitted with that component's chunk and linked by
// nothing: no page would ever load it. All CSS goes through src/index.css (`@import`), which the split below then divides
// by what each route can use.
const strayCss = Object.entries(manifest).filter(([key, chunk]) => key !== "index.html" && chunk.css?.length);
if (strayCss.length) {
  console.error(
    `prerender: stylesheet imported by a chunk, which no page links: ${strayCss.map(([key, c]) => `${key} -> ${c.css.join(", ")}`).join("; ")}.\n` +
      "  @import the file from src/index.css (inside `layer(pages)`) and drop the import from the component.",
  );
  process.exit(1);
}
const fullCss = readFileSync(join(DIST, cssHref.slice(BASE_PATH.length)), "utf8");
// SHEEN_CSS_SPLIT=0 keeps the single stylesheet on every route (a comparison build); see the CSS sheets block below.
const SPLIT_CSS = process.env.SHEEN_CSS_SPLIT !== "0";
/** One critical-CSS extractor per sheet set (the sheets a route links, concatenated), created on first use. */
const criticalCache = new Map();
const criticalFor = (hrefs, text) => {
  const key = hrefs.join("|");
  if (!criticalCache.has(key)) criticalCache.set(key, createCriticalCss(text()));
  return criticalCache.get(key);
};

/** The inline loader: reads #sheen-assets and appends its preloads, the stylesheet and the entry after the first paint. */
const ASSET_LOADER =
  '<script>(function(){var d=document,a=JSON.parse(d.getElementById("sheen-assets").textContent),done=false;' +
  "function add(t,p){var e=d.createElement(t);for(var k in p)e.setAttribute(k,p[k]);d.head.appendChild(e)}" +
  'function go(){if(done)return;done=true;a.preload.forEach(function(h){add("link",{rel:"modulepreload",crossorigin:"",href:h})});' +
  'a.css.forEach(function(h){if(!d.querySelector(\'link[rel=stylesheet][href="\'+h+\'"]\'))add("link",{rel:"stylesheet",crossorigin:"",href:h})});add("script",{type:"module",crossorigin:"",src:a.entry})}' +
  'try{new PerformanceObserver(function(l,o){o.disconnect();setTimeout(go,0)}).observe({type:"paint",buffered:true})}' +
  "catch(e){requestAnimationFrame(function(){setTimeout(go,0)})}setTimeout(go,1000)})();</script>";

/**
 * The saved Aurora look needs rules the inline critical CSS leaves out (it is built for the HTML's Liquid first paint), so for
 * that visitor the full stylesheet must be applied before the first paint. This tiny parser-blocking script runs after the
 * look script of index.html has set `data-sheen-style` and inserts the sheet's <link> into <head> with DOM APIs:
 * `blocking="render"` makes the browser hold the first paint until it has loaded (a stylesheet inserted this way would
 * otherwise only be render-blocking in some engines), and a sheet being inserted by script also keeps later scripts waiting.
 * A Liquid visitor (the default) and a visitor without JavaScript get the stylesheet from the loader / <noscript> below.
 */
function blockingSheets(sheets) {
  return (
    '<script>(function(){if(document.documentElement.getAttribute("data-sheen-style")!=="aurora")return;' +
    JSON.stringify(sheets) +
    '.forEach(function(h){var l=document.createElement("link");l.rel="stylesheet";l.crossOrigin="";l.href=h;l.setAttribute("blocking","render");document.head.appendChild(l)})})();</script>'
  );
}

/**
 * The CSS and script tags of one page: see the note above. `sheets` are the stylesheets the route links (the shared base
 * and its route class's sheet, see "CSS sheets" below); `critical` is the CSS inlined for the first paint.
 */
function assetTags(preloadFiles, critical, sheets, routePath) {
  const links = (extra = "") => sheets.map((h) => `<link rel="stylesheet" crossorigin href="${h}"${extra}>`).join("");
  const css = CRITICAL_CSS
    ? `<style id="sheen-critical">${critical}</style>\n    ${blockingSheets(sheets)}\n    <noscript>${links()}</noscript>` +
      (DEFER_SCRIPTS ? "" : `\n    ${links(` media="print" onload="this.media='all'"`)}`)
    : links();
  if (!DEFER_SCRIPTS) {
    const preloads = modulepreload(preloadFiles).join("\n    ");
    return { head: `${css}\n    ${preloads}\n    ${entryTag[0]}`, body: "" };
  }
  const assets = {
    css: CRITICAL_CSS ? sheets : [],
    cssMap: cssMapHref,
    cssRoute: routePath,
    entry: entryHref,
    preload: preloadFiles.map((f) => `${BASE_PATH}${f}`),
  };
  const json = `<script type="application/json" id="sheen-assets">${JSON.stringify(assets).replace(/</g, "\\u003c")}</script>`;
  return { head: css, body: `${json}\n    ${ASSET_LOADER}` };
}
let cssMapHref = "";
const modules = routeModules(join(DEMO, "src", "routes.ts"));
const pageSourceCache = new Map();
/** The route's page module with lazy wrappers followed: { module, exportName, text }. */
const resolvePage = (mod) => {
  const key = `${mod.module}#${mod.exportName}`;
  if (!pageSourceCache.has(key)) pageSourceCache.set(key, resolvePageModule(DEMO, mod.module, mod.exportName));
  return pageSourceCache.get(key);
};

/* ---------- Helpers ---------- */

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Manifest keys → the chunk files they need, static imports included, each file once. */
function closureFiles(keys, seen = new Set()) {
  const files = [];
  const walk = (key) => {
    const c = manifest[key];
    if (!c || seen.has(c.file)) return;
    seen.add(c.file);
    files.push(c.file);
    (c.imports ?? []).forEach(walk);
  };
  keys.forEach(walk);
  return files;
}

const modulepreload = (files) => files.map((f) => `<link rel="modulepreload" crossorigin href="${BASE_PATH}${f}">`);

/**
 * build.modulePreload is off (vite.config.ts: the helper's chunk list cost ~8 KB gzip in the entry),
 * so Vite writes no <link rel="modulepreload"> for the entry's static imports; they are added here, so the
 * browser fetches them in parallel with the entry instead of one import level at a time.
 */
const entryEntry = manifest["index.html"];
const entryFiles = new Set([entryEntry?.file]);
const entryPreloadFiles = closureFiles(entryEntry?.imports ?? [], entryFiles).filter(
  (f) => f !== entryHref.slice(BASE_PATH.length),
);

/** The manifest key of a route's own page chunk, or "". */
function routeChunkKey(path) {
  const mod = modules.get(path);
  // vite.page-instances.mjs gives each route its own copy of its page module: "src/pages/X.tsx?page=Name".
  const key =
    mod && (manifest[`${mod.module}?page=${mod.exportName}`] ? `${mod.module}?page=${mod.exportName}` : mod.module);
  return key && manifest[key] ? key : "";
}

/** The route's page chunk and its static imports (not the entry's): files to modulepreload. */
function routeChunkFiles(path) {
  const key = routeChunkKey(path);
  return key ? closureFiles([key], new Set(entryFiles)) : [];
}

/**
 * Preload the latin face(s) of the active style's text fonts: the body text and the display headings (the LCP element).
 * Liquid sets in Inter and Inter Tight, Aurora in Geist. An Aurora first paint gets its own font rather than a late swap from the
 * fallback (which moved the LCP candidate to the font's arrival).
 */
function fontPreloads() {
  const assets = readdirSync(join(DIST, "assets"));
  const pick = (prefixes) =>
    prefixes
      .map((prefix) => assets.find((f) => f.startsWith(prefix) && f.endsWith(".woff2")))
      .filter(Boolean)
      .map((f) => `${BASE_PATH}assets/${f}`);
  const link = (h) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${h}">`;
  // Liquid is the default look: its faces are plain <link>s, found by the preload scanner with the HTML. Only a saved
  // Aurora preference (read by the inline script of index.html) adds Geist, so nobody else fetches it.
  const liquid = pick(["inter-latin-wght-normal", "inter-tight-latin-wght-normal"]).map(link).join("\n    ");
  const aurora = pick(["geist-latin-wght-normal"]);
  return (
    liquid +
    '\n    <script>(function(){if(document.documentElement.getAttribute("data-sheen-style")!=="aurora")return;' +
    JSON.stringify(aurora) +
    '.forEach(function(h){var l=document.createElement("link");l.rel="preload";l.as="font";l.type="font/woff2";l.crossOrigin="anonymous";l.href=h;document.head.appendChild(l)})})();</script>'
  );
}

/**
 * The head `<link rel="preload">` for the look the HTML is built for (Liquid, light): found by the preload scanner with the
 * HTML, before any script. Its `media` keeps it from fetching the light picture for a dark-scheme visitor; `guideHeroScript`
 * preloads the saved look (a dark OS, an Aurora or an explicit theme choice) when it is another one.
 */
function guideStaticHeroPreload(shots, sizes = GUIDE_IMAGE_SIZES) {
  return `<link rel="preload" as="image" type="image/webp" fetchpriority="high" media="(prefers-color-scheme: light)" data-guide-hero imagesrcset="${guideImageSrcSet(shots.liquid.light, BASE_PATH)}" imagesizes="${sizes}">`;
}

/**
 * A guide whose hero is one of the four look pictures carries all four lazy <img>s (only one is displayed). The look is only known
 * once the saved preference is read (the inline script of index.html, which runs before this one), so this script preloads the
 * hero of the saved style and theme with high priority and makes that one <img> eager as soon as the parser creates it. The other
 * three stay lazy and display:none, so they are never fetched. The theme follows the CSS: an explicit data-theme, else the OS.
 * The /guides hub does the same for the cover of its first card (`img` selects that card's picture, `sizes` is the card's).
 */
function guideHeroScript(shots, { sizes = GUIDE_IMAGE_SIZES, img = "img.guide-hero-s--" } = {}) {
  const srcsets = {};
  for (const style of ["liquid", "aurora"])
    for (const tone of ["light", "dark"]) srcsets[`${style}-${tone}`] = guideImageSrcSet(shots[style][tone], BASE_PATH);
  return (
    "<script>(function(){var d=document,r=d.documentElement,S=" +
    JSON.stringify(srcsets) +
    ',t=r.getAttribute("data-theme"),k=(r.getAttribute("data-sheen-style")==="aurora"?"aurora":"liquid")+"-"+' +
    '(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light"),s=S[k];if(!s)return;' +
    // The static <link data-guide-hero> in the head already preloads Liquid light for a light-scheme visitor: skip a duplicate.
    'var e=d.querySelector("link[data-guide-hero]");if(!(k==="liquid-light"&&e&&matchMedia(e.media).matches)){' +
    'var l=d.createElement("link");l.rel="preload";l.as="image";l.type="image/webp";l.setAttribute("fetchpriority","high");' +
    'l.setAttribute("imagesrcset",s);l.setAttribute("imagesizes",' +
    JSON.stringify(sizes) +
    ");d.head.appendChild(l)}" +
    "function fix(){var i=d.querySelector(" +
    JSON.stringify(img) +
    '+k);if(i){i.loading="eager";i.setAttribute("fetchpriority","high");' +
    // The HTML has Liquid light eager (the LCP of the default look, kept eager for crawlers and first visits). For another saved
    // look it is made lazy again so a later re-render does not re-request it; the browser has already started its one fetch at
    // parse time (no script can run between the parser creating an <img> and the fetch), which is the price of an eager default.
    'if(k!=="liquid-light"){var f=d.querySelector(' +
    JSON.stringify(`${img}liquid-light`) +
    ');if(f){f.loading="lazy";f.removeAttribute("fetchpriority")}}return 1}}' +
    "if(!fix()){var o=new MutationObserver(function(){fix()&&o.disconnect()});o.observe(d,{childList:true,subtree:true});" +
    'd.addEventListener("DOMContentLoaded",function(){o.disconnect()})}})();</script>'
  );
}

/** A guide's real content date: the `updated` line of its Markdown front matter (docs/guides/<slug>.md), else "". */
function guideUpdated(path) {
  const guide = /^\/guides\/([\w-]+)$/.exec(path);
  if (!guide) return "";
  const file = join(DEMO, "..", "docs", "guides", `${guide[1]}.md`);
  return (existsSync(file) && /^updated:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m.exec(readFileSync(file, "utf8"))?.[1]) || "";
}

/**
 * dist file(s) for a route path. A hub (a route with children) is a folder: its one page is `<hub>/index.html`, the file
 * that answers `/hub/` (its canonical URL). `<hub>.html` is not a second copy of the page but a redirect stub
 * (`hubStub`), so the page exists at one URL only.
 */
function outFiles(path) {
  if (path === "/") return ["index.html"];
  return isHubFolder(path) ? [`${path.slice(1)}/index.html`] : [`${path.slice(1)}.html`];
}

const isHubFolder = (path) => path !== "/" && routes.some((r) => r.path.startsWith(`${path}/`));

/**
 * The minimal page at `<hub>.html`: the same canonical as the hub page, a zero-second refresh and a script that keeps
 * the query and hash. On a host that serves `/hub` from `hub.html` (instead of redirecting to the folder) a visitor lands on
 * the canonical `/hub/`; on GitHub Pages `/hub` is a 301 to `/hub/` and the stub only answers `/hub.html`. It has no
 * robots tag: a noindex next to a canonical would tell Google to drop the canonical target as well.
 */
function hubStub(path) {
  const target = `${BASE_PATH.replace(/\/$/, "")}${path}/`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>This page moved | SheenUI</title>
    <link rel="canonical" href="${escapeHtml(canonicalUrl(path))}" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <script>location.replace(${JSON.stringify(target)} + location.search + location.hash);</script>
  </head>
  <body>
    <p>This page is at <a href="${target}">${escapeHtml(canonicalUrl(path))}</a>.</p>
  </body>
</html>
`;
}

function write(rel, content) {
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

/* ---------- Render every route ---------- */

const fonts = fontPreloads();
const all = [...routes, notFoundRoute];
const pages = [];
/** Rendered routes waiting for their stylesheets: written once every route has been rendered. */
const pending = [];
let failures = 0;

for (const route of all) {
  // Pass 1 finds the page's sections (their ids are the slugs of their text, from layout/heading-ids.ts); pass 2
  // renders it again with its "On this page" list (src/seo/toc.ts), so the server HTML and the client agree.
  globalThis.__sheenToc = {};
  let rendered = await server.render(route.path);
  let toc = route === notFoundRoute ? [] : tocOf(rendered.body);
  if (toc.length >= 4) {
    globalThis.__sheenToc = { [route.path]: toc };
    rendered = await server.render(route.path);
    toc = tocOf(rendered.body);
  } else toc = [];
  const h1s = (rendered.body.match(/<h1[\s>]/g) ?? []).length;
  if (rendered.errors.length || h1s !== 1) {
    failures++;
    console.error(
      `✗ ${route.path}: ${rendered.errors.length ? rendered.errors[0].split("\n")[0] : `${h1s} <h1> elements`}`,
    );
    continue;
  }

  const seo = pageSeo(route);
  const mod = modules.get(route.path);
  const sources = mod ? pageSources(resolvePage(mod).text, resolvePage(mod).exportName, resolvePage(mod).consts) : [];
  const dateModified = guideUpdated(route.path) || pageDates(route.path).modified;
  // FAQPage markup is built from the FAQ the page shows (read back from its HTML), so the two cannot differ.
  const faq = route === notFoundRoute ? [] : visibleFaq(rendered.body);
  const graph = buildJsonLd(route, seo, { dateModified, sources, faq });
  const jsonLd = graph ? jsonLdScript(graph) : "";

  // This page's row of the keyword map, for the client's first render (src/seo/head.ts), so the
  // 50 KB map itself stays out of the entry bundle.
  // It also carries the H1 and intro of the pages this page links to (related pages, a hub's cards), because
  // their link text must be the same on the client's first render as in this HTML.
  const inlineRows = { [route.path]: seoRow(route.path) };
  for (const target of linkTargets(route.path)) {
    const row = seoRow(target);
    if (row) inlineRows[target] = { h1: row.h1, intro: row.intro };
  }
  const seoRowScript = `<script type="application/json" id="sheen-seo">${JSON.stringify(inlineRows).replace(/</g, "\\u003c")}</script>`;

  const json = (id, value) =>
    `<script type="application/json" id="${id}">${JSON.stringify(value).replace(/</g, "\\u003c")}</script>`;
  const content = contentRow(route.path);
  const extraScripts = [
    json("sheen-toc", { [route.path]: toc }),
    content ? json("sheen-content", { [route.path]: content }) : "",
  ];

  // A guide's hero screenshot is its mobile LCP: preload it (responsive, high priority) so it starts with the HTML.
  const guideImage = guideImages[route.path.replace(/^\/guides\//, "")];
  const styledShots = route.path.startsWith("/guides/") && guideImage ? guideStyledShots(guideImage) : undefined;
  // The /guides hub: the cover of its first card (the install guide, `priority` in GuidePages) is its LCP.
  const hubShots = route.path === "/guides" ? guideStyledShots(guideImages["install-frameworks"]) : undefined;
  const imagePreload =
    route.path.startsWith("/guides/") && guideImage
      ? styledShots
        ? guideStaticHeroPreload(styledShots) + guideHeroScript(styledShots)
        : `<link rel="preload" as="image" type="image/webp" fetchpriority="high" imagesrcset="${guideImageSrcSet(guideImage, BASE_PATH)}" imagesizes="${GUIDE_IMAGE_SIZES}">`
      : hubShots
        ? guideStaticHeroPreload(hubShots, HUB_COVER_SIZES) +
          guideHeroScript(hubShots, { sizes: HUB_COVER_SIZES, img: "[data-lcp] img.hubp-cover--" })
        : "";
  // A page whose LCP is its hero image preloads the image only: the fonts (swap, metric-matched fallbacks) then load from the
  // CSS, off the image's critical path (Lighthouse's model gave the guides 3.4 s with the font preloads and 3.0 s without).
  // The page paints once its whole HTML has been parsed (Chrome's rel=expect, ignored elsewhere): on a slow connection the first
  // frame would otherwise show a half-parsed page (the header's controls arriving one by one, the footer pushed down as the
  // content streams in), and every such step is a layout shift. The HTML is the first request either way and the critical CSS is
  // inline, so this only waits for the document's last bytes.
  const head = [
    rendered.head,
    '<link rel="expect" href="#sheen-end" blocking="render">',
    imagePreload,
    imagePreload ? "" : fonts,
    "<!--app-css-->",
    jsonLd,
    seoRowScript,
    ...extraScripts,
  ]
    .filter(Boolean)
    .join("\n    ");
  // The critical CSS is read off the assembled page (the <html> and <body> attributes of the template included), once the
  // sheets of every route are known (see "CSS sheets" below).
  const assembled = template
    .replace("<!--app-css-->", "")
    .replace("<!--app-head-->", () => head)
    .replace("<!--app-html-->", () => `${untilFound(rendered.body)}<!--app-scripts-->`);
  const files = route === notFoundRoute ? ["404.html"] : outFiles(route.path);
  pending.push({ route, assembled, preloadFiles: [...entryPreloadFiles, ...routeChunkFiles(route.path)], files });

  pages.push({
    route,
    seo,
    dateModified,
    dates: pageDates(route.path),
    files,
    example: mod ? firstExample(resolvePage(mod).text, resolvePage(mod).exportName) : null,
  });
}

if (failures) {
  console.error(`prerender: ${failures} route(s) failed`);
  process.exit(1);
}

/* ---------- CSS sheets ---------- */

/*
 * The build's one stylesheet is split here (lib/css-split.mjs has the why): a shared base sheet plus one sheet per route
 * class (home, the hubs, guides, components, charts, dashboards...). Each route links exactly its base and its class's
 * sheet, and inlines the critical CSS of those two. A route class is the first path segment; the hub pages (one segment)
 * are one class, as the home page is. What a route may use is read from its prerendered HTML plus the text of every chunk
 * it can load (the entry and shell, its page chunk, their static imports and the lazy blocks they import), so a class
 * that appears after hydration (a popup, an island) is in the sheet too. The client adds the sheets of the page it
 * navigates to before showing it (src/route-css.ts reads `cssMap`).
 */
const classOfRoute = (route) =>
  route === notFoundRoute
    ? "404"
    : route.path === "/"
      ? "home"
      : route.path.split("/").length === 2
        ? "hub"
        : route.path.split("/")[1];
/** @type {Map<string, string[]>} sheet class → the hrefs a route of that class links */
const classSheets = new Map();
/** @type {Map<string, { href: string; text: string }>} sheet name → its file and text */
const sheetFiles = new Map();
if (SPLIT_CSS) {
  const lazyClosure = (keys, seen) => {
    const files = [];
    const walk = (key) => {
      const c = manifest[key];
      if (!c || seen.has(c.file)) return;
      seen.add(c.file);
      files.push(c.file);
      (c.imports ?? []).forEach(walk);
      (c.dynamicImports ?? []).forEach(walk);
    };
    keys.forEach(walk);
    return files;
  };
  const tokenCache = new Map();
  const tokensOf = (file) => {
    if (!tokenCache.has(file)) tokenCache.set(file, jsTokens(readFileSync(join(DIST, file), "utf8")));
    return tokenCache.get(file);
  };
  const entryStatic = [entryEntry.file, ...entryPreloadFiles];
  const shellKeys = (entryEntry.dynamicImports ?? []).filter((k) => !/NotFoundContent|motion-features/.test(k));
  const splitter = createSplitter(fullCss);
  const needs = new Map();
  for (const { route, assembled } of pending) {
    const seen = new Set(entryStatic);
    const keys =
      route === notFoundRoute ? ["src/seo/NotFoundContent.tsx"] : [routeChunkKey(route.path)].filter(Boolean);
    const files = [...entryStatic, ...lazyClosure([...shellKeys, ...keys], seen)];
    needs.set(route.path, splitter.needed(routeVocabulary(htmlTokens(assembled), files.map(tokensOf))));
  }
  const byPath = new Map(pending.map(({ route }) => [route.path, route]));
  const plan = planSheets(splitter, needs, (path) => classOfRoute(byPath.get(path)));
  for (const [name, indices] of plan.sheets) {
    const text = splitter.emit(indices, { includeShared: true });
    const hash = createHash("sha256").update(text).digest("hex").slice(0, 8);
    const rel = `assets/css-${name}-${hash}.css`;
    write(rel, text);
    sheetFiles.set(name, { href: `${BASE_PATH}${rel}`, text });
  }
  for (const c of plan.classes.keys()) classSheets.set(c, [c]);
  rmSync(join(DIST, cssHref.slice(BASE_PATH.length)));
  const map = { classes: {}, routes: {} };
  for (const [c, names] of classSheets) map.classes[c] = names.map((n) => sheetFiles.get(n).href);
  for (const { route } of pending) map.routes[route.path] = classOfRoute(route);
  const mapText = JSON.stringify(map);
  const mapRel = `assets/css-routes-${createHash("sha256").update(mapText).digest("hex").slice(0, 8)}.json`;
  write(mapRel, mapText);
  cssMapHref = `${BASE_PATH}${mapRel}`;
}

for (const { route, assembled, preloadFiles, files } of pending) {
  const names = SPLIT_CSS ? classSheets.get(classOfRoute(route)) : [];
  const sheets = SPLIT_CSS ? names.map((n) => sheetFiles.get(n).href) : [cssHref];
  const critical = CRITICAL_CSS
    ? criticalFor(sheets, () => (SPLIT_CSS ? names.map((n) => sheetFiles.get(n).text).join("\n") : fullCss)).extract(
        assembled,
      )
    : "";
  const tags = assetTags(preloadFiles, critical, sheets, route.path);
  const html = assembled.replace("<!--app-css-->", () => tags.head).replace("<!--app-scripts-->", () => tags.body);
  for (const f of files) write(f, html);
  if (route !== notFoundRoute && isHubFolder(route.path)) write(`${route.path.slice(1)}.html`, hubStub(route.path));
}

/* ---------- sitemap.xml, robots.txt ---------- */

const indexable = pages.filter(({ route, seo }) => route !== notFoundRoute && !seo.noindex);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${indexable
  .map(
    ({ route, seo }) => `  <url>
    <loc>${escapeHtml(canonicalUrl(route.path))}</loc>
    <lastmod>${guideUpdated(route.path) || pageDates(route.path).modified}</lastmod>
    <image:image>
      <image:loc>${escapeHtml(seo.ogImage)}</image:loc>
    </image:image>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
write("sitemap.xml", sitemap);
// Everything is public: allow all crawlers, and name the search and AI crawlers so no default rule can be read as a "no".
const CRAWLERS = [
  "Googlebot",
  "Bingbot",
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
];
// The Markdown twins (<page>.md) are for AI crawlers and agents. GitHub Pages cannot send an X-Robots-Tag: noindex, so search
// crawlers are kept out of them here instead: `Disallow: /*.md$` (the longer rule beats `Allow: /` for Google and Bing; both
// support `*` and `$`), so a twin never competes with its HTML page, which carries the canonical. The AI crawlers keep a plain
// `Allow: /`, and llms.txt stays crawlable. Twins are not in sitemap.xml and name their canonical page on their first line.
const SEARCH_ONLY = new Set(["Googlebot", "Bingbot"]);
const NO_TWINS = "Disallow: /*.md$\n";
write(
  "robots.txt",
  `User-agent: *\nAllow: /\n${NO_TWINS}\n${CRAWLERS.map((bot) => `User-agent: ${bot}\nAllow: /\n${SEARCH_ONLY.has(bot) ? NO_TWINS : ""}`).join("\n")}\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);

/* ---------- llms.txt, llms-full.txt ---------- */

writeLlmsFiles({ dist: DIST, pages: indexable, siteUrl: SITE_URL, counts: COUNTS, author: AUTHOR.name });

/* ---------- Copied-files imports in the static code copy ---------- */

/*
 * The hidden plain copy of every example (`data-example-code`) is what crawlers and AI fetches read. Samples are written
 * against the package barrel (what pagecode:check compiles), but the package is not on npm: the copy shows the imports a
 * reader gets after `shadcn add` (scripts/lib/install-imports.mjs, derived from registry.json) with the package form as a
 * comment. After the llms files, which read the original code. The client keeps the same text node (suppressHydrationWarning).
 */
{
  const map = loadInstallMap();
  const unescape = (t) =>
    t
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  const re = /(<div\b[^>]*\bdata-example-code="(?:true)?"[^>]*><pre><code>)([\s\S]*?)(<\/code><\/pre>)/g;
  for (const page of pages) {
    // The page's install item: an example that imports something it does not install gets one line saying what to add.
    const installItem = /\/r\/([\w-]+)\.json$/.exec(page.seo.install ?? "")?.[1];
    for (const rel of page.files) {
      const file = join(DIST, rel);
      const html = readFileSync(file, "utf8");
      const next = html.replace(re, (_whole, open, code, close) => {
        const original = unescape(code);
        let { code: copied } = withCopiedImports(original, map);
        if (installItem)
          copied = withNoteUnderImports(
            copied,
            extrasLine(extraItems(original, map, installItem), SITE_URL, "example"),
          );
        return `${open}${escapeHtml(copied)}${close}`;
      });
      // A prose sample marked `data-copy-imports` (the dashboards' "Data" section) gets the same rewrite.
      const done = next.replace(
        /(<code data-copy-imports="">)([\s\S]*?)(<\/code>)/g,
        (_whole, open, code, close) => `${open}${escapeHtml(withCopiedImports(unescape(code), map).code)}${close}`,
      );
      if (done !== html) writeFileSync(file, done);
    }
  }
}

/* ---------- .nojekyll: GitHub Pages must serve files as they are (no Jekyll pass) ---------- */

write(".nojekyll", "");

console.log(
  `prerender: ${pages.length} pages (${indexable.length} in the sitemap), llms.txt, in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
);
