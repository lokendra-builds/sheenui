// node:test audit of the docs search: for every docs route, natural queries a developer would type must put the route in the top 3.
// Routes are read from demo/src/routes/*.ts, exports from the generated route-exports, so this follows the real site.
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const layout = path.join(root, "demo/src/layout");
const { createRanker, MAX_SEARCH_RESULTS } = await import(pathToFileURL(path.join(layout, "search-rank.ts")).href);
const { SEARCH_SYNONYMS } = await import(pathToFileURL(path.join(layout, "search-synonyms.ts")).href);

// route-exports.ts has an extensionless import: load a copy that points at the generated file.
const tmp = mkdtempSync(path.join(tmpdir(), "search-audit-"));
const copy = path.join(tmp, "route-exports.ts");
writeFileSync(
  copy,
  readFileSync(path.join(layout, "route-exports.ts"), "utf8").replace(
    /from "\.\.\/generated\/route-exports"/,
    `from "${pathToFileURL(path.join(root, "demo/src/generated/route-exports.ts")).href}"`,
  ),
);
const { exportsFor, allExportsFor } = await import(pathToFileURL(copy).href);

const routes = [];
const dir = path.join(root, "demo/src/routes");
for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.startsWith("._"))) {
  const src = readFileSync(path.join(dir, file), "utf8");
  for (const m of src.matchAll(/path:\s*"([^"]+)",\s*title:\s*"([^"]+)"([^}]*?)(?=\n\s*\},?\s*\n|\}\s*,?\s*\n|$)/g)) {
    if (m[1] !== "/" && !/hidden:\s*true/.test(m[3])) routes.push({ path: m[1], title: m[2] });
  }
}

const fieldsOf = ({ path: p, title }) => {
  const names = exportsFor(p);
  return {
    title,
    aliases: SEARCH_SYNONYMS[p]?.aliases,
    keywords: [...(SEARCH_SYNONYMS[p]?.keywords ?? []), ...names],
    body: [
      ...allExportsFor(p),
      ...p
        .split("/")
        .filter(Boolean)
        .flatMap((part) => part.split("-")),
    ],
  };
};
const FIELDS = routes.map((r) => [r.path, fieldsOf(r)]);

/** The paths of the matching pages in rank order, capped like the palette. */
const ranker = createRanker(new Map(FIELDS));
function search(query) {
  return FIELDS.map(([p]) => ({ p, m: ranker(p, query.trim().toLowerCase().replace(/\s+/g, " ")) }))
    .filter((r) => r.m)
    .sort((a, b) => b.m.score - a.m.score)
    .slice(0, MAX_SEARCH_RESULTS)
    .map((r) => r.p);
}

/** Extra natural queries per route (what a developer types), on top of the title and the URL words. */
const QUERIES = {
  "/docs/rtl": [
    "rtl",
    "arabic",
    "hebrew",
    "i18n",
    "l10n",
    "localization",
    "localisation",
    "direction",
    "right to left",
  ],
  "/docs/installation": ["install", "getting started", "setup", "npm"],
  "/docs/tailwind-v4": ["tailwind", "tailwind 4", "css setup"],
  "/docs/dark-mode": ["dark", "theme", "light mode"],
  "/docs/base-ui": ["base ui", "headless", "radix"],
  "/docs/forms": ["form", "react hook form", "validation"],
  "/components/dialog": ["modal", "popup", "dialog"],
  "/overlays/alert-dialog": ["confirm", "confirmation dialog", "alert dialog"],
  "/overlays/dropdown-menu": ["dropdown", "menu", "dropdown menu"],
  "/overlays/context-menu": ["right click", "context menu"],
  "/overlays/menubar": ["menu bar", "menubar"],
  "/overlays/hover-card": ["hover card", "preview card"],
  "/overlays/command-palette": ["command palette", "cmd k", "command menu", "spotlight"],
  "/overlays/drawer": ["drawer", "bottom sheet", "sheet"],
  "/overlays/kbd": ["keyboard shortcut", "kbd"],
  "/components/select": ["select", "dropdown select", "picker"],
  "/components/combobox": ["combobox", "autocomplete", "select2", "searchable select"],
  "/components/switch": ["toggle switch", "switch", "on off"],
  "/forms/toggle": ["toggle button", "toggle"],
  "/components/toast": ["notification", "snackbar", "toast"],
  "/blocks/notification-center": ["notifications", "inbox", "notification center"],
  "/components/spinner": ["loader", "loading", "spinner"],
  "/components/skeleton": ["skeleton", "loading placeholder", "shimmer loading"],
  "/components/tabs": ["tabs", "tab bar"],
  "/layout/breadcrumb": ["breadcrumb", "breadcrumbs"],
  "/forms/date-picker": ["datepicker", "date picker", "date"],
  "/forms/calendar": ["calendar", "month view"],
  "/forms/color-picker": ["colour picker", "color picker", "colour", "color"],
  "/forms/file-upload": ["file upload", "dropzone", "upload"],
  "/forms/tags-input": ["tags", "chips input", "tags input"],
  "/forms/number-field": ["number input", "stepper input", "number field"],
  "/forms/radio-group": ["radio", "radio buttons"],
  "/forms/rating": ["stars", "star rating", "rating"],
  "/forms/segmented-control": ["segmented control", "button toggle group"],
  "/forms/textarea": ["textarea", "multiline"],
  "/components/checkbox": ["checkbox", "check box"],
  "/components/slider": ["slider", "range slider"],
  "/components/input": ["input", "text field", "text input"],
  "/components/otp-input": ["otp", "verification code", "pin input"],
  "/components/button": ["button", "cta"],
  "/components/button-group": ["button group"],
  "/components/glass-card": ["card", "glass card", "glassmorphism"],
  "/components/data-table": ["data table", "datagrid", "data grid", "table"],
  "/components/table": ["table"],
  "/components/progress": ["progress bar", "progress"],
  "/components/meter": ["meter", "gauge meter"],
  "/components/carousel": ["carousel", "slider images", "slideshow"],
  "/components/code-block": ["code block", "syntax highlight", "code snippet"],
  "/components/empty-state": ["empty state", "no results", "no data"],
  "/components/avatar": ["avatar", "profile picture"],
  "/components/badge": ["badge", "tag", "pill"],
  "/components/alert": ["alert", "banner message", "callout"],
  "/components/tooltip": ["tooltip", "hint"],
  "/components/popover": ["popover", "popup"],
  "/layout/accordion": ["accordion", "faq accordion", "expandable"],
  "/layout/collapsible": ["collapsible", "collapse", "expand"],
  "/layout/pagination": ["pagination", "pager", "pages"],
  "/layout/resizable": ["resizable", "split pane", "splitter"],
  "/layout/scroll-area": ["scroll area", "scrollbar"],
  "/layout/separator": ["separator", "divider"],
  "/layout/stepper": ["stepper", "wizard", "steps"],
  "/layout/timeline": ["timeline", "activity feed"],
  "/layout/toolbar": ["toolbar"],
  "/layout/aspect-ratio": ["aspect ratio", "16:9"],
  "/navigation/navbar": ["navbar", "header", "top nav"],
  "/navigation/sidebar": ["sidebar", "side nav"],
  "/navigation/navigation-menu": ["navigation menu", "mega menu"],
  "/navigation/vertical-nav": ["vertical nav", "vertical navigation"],
  "/blocks/glass-login": ["login", "sign in", "signin", "auth"],
  "/blocks/lamp-login": ["lamp login", "sign in", "login"],
  "/blocks/signup-page": ["signup", "sign up", "register", "registration"],
  "/blocks/pricing": ["pricing", "plans", "price table"],
  "/blocks/not-found-page": ["404", "not found"],
  "/blocks/faq-section": ["faq", "questions"],
  "/blocks/hero-section": ["hero", "landing page"],
  "/blocks/feature-grid": ["features", "feature grid"],
  "/blocks/testimonials": ["testimonials", "reviews"],
  "/blocks/contact-form": ["contact form", "contact"],
  "/blocks/site-footer": ["footer"],
  "/blocks/announcement-banner": ["announcement", "banner"],
  "/blocks/ai-chat": ["ai chat", "chatbot", "assistant"],
  "/blocks/bento-grid": ["bento", "bento grid"],
  "/blocks/chat-app": ["chat app", "messenger"],
  "/blocks/settings-page": ["settings", "preferences"],
  "/blocks/otp-verification": ["otp", "2fa", "verification"],
  "/blocks/payment-checkout": ["checkout", "payment", "credit card"],
  "/blocks/dashboard-stats": ["kpi", "stats", "dashboard stats", "metrics"],
  "/dashboards/web-analytics": ["analytics", "web analytics"],
  "/dashboards/saas": ["saas", "revenue", "mrr"],
  "/dashboards/ecommerce": ["ecommerce", "e-commerce", "shop"],
  "/dashboards/crypto-dashboard": ["crypto", "bitcoin"],
  "/chat/list": ["chat list", "conversations"],
  "/chat/thread": ["chat view", "messages", "chat thread"],
  "/chat/widget": ["chat widget", "popover chat"],
  "/charts/line-chart": ["line chart", "line graph", "line"],
  "/charts/area-chart": ["area chart", "area"],
  "/charts/bar-chart": ["bar chart", "bar graph", "column chart"],
  "/charts/donut-chart": ["donut", "doughnut"],
  "/charts/pie-chart": ["pie chart", "pie"],
  "/charts/sparkline": ["sparkline", "mini chart"],
  "/charts/heatmap": ["heatmap", "heat map"],
  "/charts/radar-chart": ["radar", "spider chart"],
  "/charts/scatter-plot": ["scatter", "bubble chart", "scatter plot"],
  "/charts/funnel-chart": ["funnel", "conversion funnel"],
  "/charts/gauge-chart": ["gauge", "speedometer"],
  "/charts/candlestick": ["candlestick", "stock chart", "ohlc"],
  "/charts/gantt": ["gantt", "project timeline"],
  "/charts/treemap": ["treemap"],
  "/charts/sankey-diagram": ["sankey", "flow diagram"],
  "/charts/waterfall-chart": ["waterfall"],
  "/charts/histogram": ["histogram", "distribution"],
  "/charts/box-plot": ["box plot", "boxplot", "violin"],
  "/charts/world-map": ["world map", "map", "geo", "choropleth"],
  "/charts/network-graph": ["network graph", "node graph"],
  "/charts/stacked-area-chart": ["stacked area"],
  "/charts/percent-stacked-bar-chart": ["stacked bar", "100% stacked"],
  "/charts/cohort-retention": ["cohort", "retention"],
  "/charts/realtime-chart": ["real time", "realtime", "live chart", "streaming chart"],
  "/charts/uptime-tracker": ["uptime", "status page"],
  "/charts/error-bar-chart": ["error bars", "confidence interval"],
  "/charts/waffle": ["waffle"],
  "/charts/sunburst": ["sunburst"],
  "/charts/chord-diagram": ["chord"],
  "/charts/combo-chart": ["combo chart", "dual axis"],
  "/charts/bullet-chart": ["bullet chart"],
  "/charts/marimekko": ["marimekko", "mekko"],
  "/charts/streamgraph": ["streamgraph", "stream graph"],
  "/charts/dumbbell": ["dumbbell", "slope chart"],
  "/charts/lollipop": ["lollipop"],
  "/charts/bar-list": ["bar list"],
  "/charts/calendar-heatmap": ["calendar heatmap", "github contributions"],
  "/effects/confetti": ["confetti", "celebration"],
  "/effects/marquee": ["marquee", "logo ticker", "infinite scroll"],
  "/effects/typewriter": ["typewriter", "typing effect"],
  "/effects/number-ticker": ["number ticker", "count up", "counter"],
  "/effects/shimmer-text": ["shimmer text", "shimmer"],
  "/effects/macos-dock": ["dock", "macos dock"],
  "/effects/liquid-glass": ["liquid glass", "refraction"],
  "/effects/spotlight-card": ["spotlight card", "spotlight"],
  "/effects/3d-tilt-card": ["tilt", "3d tilt", "tilt card"],
  "/effects/word-rotate": ["word rotate", "rotating words"],
  "/effects/blur-in": ["blur in", "fade in"],
  "/effects/morphing-dialog": ["morphing dialog", "shared element"],
  "/effects/animated-beam": ["beam", "animated beam"],
  "/effects/border-beam": ["border beam", "beam"],
  "/effects/meteors": ["meteors", "shooting stars"],
  "/effects/particles": ["particles"],
  "/effects/orbiting-circles": ["orbit", "orbiting circles"],
  "/effects/scroll-progress": ["scroll progress", "reading progress"],
  "/effects/text-reveal": ["text reveal", "scroll reveal"],
  "/guides/install-frameworks": ["next.js", "nextjs", "vite", "install nextjs"],
  "/guides/shadcn-alternatives": ["shadcn", "shadcn alternative"],
  "/guides/shadcn-glassmorphism": ["shadcn glass", "shadcn glassmorphism"],
  "/guides/base-ui-vs-radix": ["base ui vs radix", "radix"],
  "/guides/framer-motion-to-motion": ["framer motion", "migrate framer motion"],
  "/guides/backdrop-filter-performance": ["backdrop filter", "performance"],
  "/guides/accessible-glassmorphism": ["accessible glassmorphism", "contrast"],
  "/guides/accessible-react-charts": ["accessible charts", "chart accessibility"],
  "/showcase": ["showcase", "examples"],
  "/foundations": ["foundations", "tokens", "design tokens"],
};

/** The Ctrl+K queries of the R4 completeness review (plus the fixes for its misses): [query, the page that must be in the top 3]. Fixed so they cannot regress. */
const REVIEW_CASES = [
  ["rtl", "/docs/rtl"],
  ["arabic", "/docs/rtl"],
  ["i18n", "/docs/rtl"],
  ["direction", "/docs/rtl"],
  ["hebrew", "/docs/rtl"],
  ["right to left", "/docs/rtl"],
  ["localization", "/docs/rtl"],
  ["sign in", "/blocks/glass-login"],
  ["login", "/blocks/glass-login"],
  ["register", "/blocks/signup-page"],
  ["sign up", "/blocks/signup-page"],
  ["forgot password", "/blocks/glass-login"],
  ["kanban", "/layout/scroll-area"],
  ["tree view", "/layout/collapsible"],
  ["date picker", "/forms/date-picker"],
  ["time picker", "/forms/date-picker"],
  ["date range", "/forms/date-picker"],
  ["toast", "/components/toast"],
  ["toast position", "/components/toast"],
  ["notification", "/blocks/notification-center"],
  ["tooltip", "/components/tooltip"],
  ["modal", "/components/dialog"],
  ["table", "/components/table"],
  ["data grid", "/components/data-table"],
  ["chart", "/charts"],
  ["pie chart", "/charts/pie-chart"],
  ["dark mode", "/docs/dark-mode"],
  ["theme", "/docs/dark-mode"],
  ["install", "/docs/installation"],
  ["shadcn", "/guides/shadcn-alternatives"],
  ["registry", "/docs/installation"],
  ["phone", "/overlays/drawer"],
  ["bottom sheet", "/overlays/drawer"],
  ["drawer", "/overlays/drawer"],
  ["pricing", "/blocks/pricing"],
  ["hero", "/blocks/hero-section"],
  ["testimonial", "/blocks/testimonials"],
  ["footer", "/blocks/site-footer"],
  ["navbar", "/navigation/navbar"],
  ["sidebar", "/navigation/sidebar"],
  ["tabs", "/components/tabs"],
  ["accordion", "/layout/accordion"],
  ["form validation", "/docs/forms"],
  ["file upload", "/forms/file-upload"],
  ["avatar", "/components/avatar"],
  ["badge", "/components/badge"],
  ["skeleton", "/components/skeleton"],
  ["spinner", "/components/spinner"],
  ["carousel", "/components/carousel"],
  ["command palette", "/overlays/command-palette"],
  ["confetti", "/effects/confetti"],
  ["beam", "/effects/animated-beam"],
  ["glass", "/components/glass-card"],
  ["aurora", "/foundations"],
  ["neon", "/foundations"],
  ["accessibility", "/guides/accessible-glassmorphism"],
  ["keyboard", "/overlays/kbd"],
  ["about", "/about"],
  ["search", "/overlays/command-palette"],
  ["dashboard", "/dashboards"],
  ["sankey", "/charts/sankey-diagram"],
  ["heatmap", "/charts/heatmap"],
  ["gauge", "/charts/gauge-chart"],
  ["stepper", "/layout/stepper"],
  ["otp", "/components/otp-input"],
  ["combobox", "/components/combobox"],
  ["autocomplete", "/components/combobox"],
  ["dropdown", "/overlays/dropdown-menu"],
  ["popover", "/components/popover"],
  ["switch", "/components/switch"],
  ["slider", "/components/slider"],
  ["rating", "/forms/rating"],
  ["countdown", "/effects/number-ticker"],
  ["empty state", "/components/empty-state"],
  ["404", "/blocks/not-found-page"],
  ["faq", "/blocks/faq-section"],
  ["chat", "/blocks/chat-app"],
  ["markdown", "/components/code-block"],
  ["code block", "/components/code-block"],
  ["copy button", "/components/code-block"],
  ["stat", "/blocks/dashboard-stats"],
  ["alert", "/components/alert"],
  ["select", "/components/select"],
  ["input", "/components/input"],
  ["checkbox", "/components/checkbox"],
  ["button", "/components/button"],
  ["progress", "/components/progress"],
  ["world map", "/charts/world-map"],
  ["sparkline", "/charts/sparkline"],
  ["toggle", "/forms/toggle"],
  ["breadcrumb", "/layout/breadcrumb"],
  ["pagination", "/layout/pagination"],
  ["calendar", "/forms/calendar"],
  ["color picker", "/forms/color-picker"],
  ["number ticker", "/effects/number-ticker"],
  ["typewriter", "/effects/typewriter"],
  ["marquee", "/effects/marquee"],
  ["dock", "/effects/macos-dock"],
  ["spotlight", "/effects/spotlight-card"],
  ["tilt", "/effects/3d-tilt-card"],
  ["liquid glass", "/effects/liquid-glass"],
  ["nextjs", "/guides/install-frameworks"],
  ["vite", "/guides/install-frameworks"],
  ["tailwind", "/docs/tailwind-v4"],
  ["base ui", "/docs/base-ui"],
  ["radix", "/docs/base-ui"],
  ["motion", "/foundations"],
  ["reduced motion", "/foundations"],
  ["settings", "/blocks/settings-page"],
  ["account", "/blocks/settings-page"],
  ["profile", "/components/avatar"],
  ["vertical nav", "/navigation/vertical-nav"],
  ["scroll area", "/layout/scroll-area"],
  ["text field", "/components/input"],
  ["textarea", "/forms/textarea"],
  ["tag input", "/forms/tags-input"],
  ["multi select", "/components/combobox"],
  ["mobile", "/overlays/drawer"],
  ["prefers-reduced-motion", "/foundations"],
  ["tokens", "/foundations"],
  ["style", "/foundations"],
  ["preset", "/foundations"],
  ["password reset", "/blocks/glass-login"],
];

/** Concept words that appear across the docs: each has one clear best page, ranked first. */
const CONCEPT_FIRST = {
  aurora: "/foundations",
  neon: "/foundations",
  preset: "/foundations",
  tokens: "/foundations",
  registry: "/docs/installation",
  install: "/docs/installation",
  "dark mode": "/docs/dark-mode",
  theme: "/docs/dark-mode",
  accessibility: "/guides/accessible-glassmorphism",
  keyboard: "/overlays/kbd",
  "reduced motion": "/foundations",
  phone: "/overlays/drawer",
  "forgot password": "/blocks/lamp-login",
};

test("the review's queries all put the right page in the top 3", () => {
  const misses = REVIEW_CASES.filter(([q, p]) => !search(q).slice(0, 3).includes(p));
  assert.deepEqual(
    misses.map(([q, p]) => `${q} -> ${p} (got ${search(q).slice(0, 3).join(", ") || "nothing"})`),
    [],
  );
  console.log(`search audit (review queries): ${REVIEW_CASES.length - misses.length}/${REVIEW_CASES.length}`);
});

test("concept words have a clear best page", () => {
  for (const [q, p] of Object.entries(CONCEPT_FIRST)) assert.equal(search(q)[0], p, q);
});

const cases = [];
for (const r of routes) {
  const slug = r.path.startsWith("/guides/") ? "" : r.path.split("/").filter(Boolean).pop()?.replace(/-/g, " ");
  for (const q of new Set([r.title.toLowerCase(), slug, ...(QUERIES[r.path] ?? [])]))
    if (q) cases.push({ path: r.path, q });
}

test("every route is found in the top 3 by its natural queries (at least 95 %)", () => {
  assert.ok(routes.length > 150, `only ${routes.length} routes parsed`);
  for (const p of Object.keys(QUERIES))
    assert.ok(
      routes.some((r) => r.path === p),
      `unknown route in QUERIES: ${p}`,
    );
  const misses = cases.filter(({ path: p, q }) => !search(q).slice(0, 3).includes(p));
  const rate = 1 - misses.length / cases.length;
  if (misses.length)
    console.log(
      `search audit: ${cases.length - misses.length}/${cases.length} (${(rate * 100).toFixed(1)} %)\n` +
        misses
          .map((m) => `  "${m.q}" -> ${m.path} (got ${search(m.q).slice(0, 3).join(", ") || "nothing"})`)
          .join("\n"),
    );
  assert.ok(rate >= 0.95, `search audit ${(rate * 100).toFixed(1)} % < 95 %`);
});

test("short words do not pad the list with weak body matches", () => {
  for (const q of ["stat", "table", "select", "alert", "toast", "tooltip"]) {
    const found = search(q);
    assert.ok(found.length <= 8, `${q}: ${found.length} results`);
  }
  assert.equal(
    search("sign in")
      .slice(0, 4)
      .filter((p) => /login|signup|auth/.test(p)).length >= 3,
    true,
  );
});

test("rtl and its relatives find the RTL page first and only", () => {
  for (const q of [
    "rtl",
    "arabic",
    "hebrew",
    "i18n",
    "l10n",
    "localization",
    "localisation",
    "direction",
    "right to left",
  ]) {
    assert.equal(search(q)[0], "/docs/rtl", q);
  }
  assert.deepEqual(search("rtl"), ["/docs/rtl"]);
});
