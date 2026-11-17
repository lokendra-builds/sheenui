import { lookup } from "../lookup";
import { CONTENT_FILE, CONTENT_LOADERS } from "./content";
import type { PageContent } from "./page-content";
import { HUBS, hubOf } from "./hubs";
import type { SeoMeta } from "./meta";
import { SITE_NAME, canonicalUrl, ogImageUrl } from "./site";

/** The part of a Route the head needs (so the SSR script can pass plain objects too). */
export type RouteLike = { path: string; title: string; group: string; hidden?: boolean };

export type PageSeo = {
  path: string;
  group: string;
  /** The route's short name, as the sidebar shows it. */
  name: string;
  /** The page's visible H1 (the keyword map's, else the route's name). */
  h1: string;
  /** Full <title>, with the " | SheenUI" suffix. */
  title: string;
  /** Title without the brand (og:site_name carries it). */
  ogTitle: string;
  description: string;
  /** Answer-first definition for the page header (see seo/answers.ts), when the page has one. */
  answer?: string;
  /** The shadcn install command for the page, when it has a registry item. */
  install?: string;
  keyword: string;
  secondary: string[];
  canonical: string;
  ogImage: string;
  ogImageAlt: string;
  noindex: boolean;
  /** True when the route has no row in meta.ts (the fallback head is used; seo:check fails). */
  fallback: boolean;
};

/*
 * The keyword map (meta.ts, ~50 KB of text for 127 pages) is a chunk of its own: a visitor needs
 * one page's row, not all of them. The build inlines that page's row into its HTML
 * (<script id="sheen-seo">, see scripts/prerender.mjs), and the full map is fetched only when
 * the visitor navigates to another page (Seo waits for it inside the navigation's transition).
 * The server loads the whole map.
 */
let table: Record<string, SeoMeta> | undefined;
let loading: Promise<Record<string, SeoMeta>> | undefined;
let inline: Record<string, SeoMeta> | undefined;

/** Fetches the whole keyword map (once). */
export function loadSeoMeta() {
  return (loading ??= import("./meta").then((module) => (table = module.seoMeta)));
}

function readInline(): Record<string, SeoMeta> {
  if (typeof document === "undefined") return {};
  try {
    const text = document.getElementById("sheen-seo")?.textContent;
    return text ? (JSON.parse(text) as Record<string, SeoMeta>) : {};
  } catch {
    return {};
  }
}

/** The keyword-map row of a page, or undefined when the map isn't loaded and the page isn't the inlined one. */
export function seoRow(path: string): SeoMeta | undefined {
  return table ? table[path] : (inline ??= readInline())[path];
}

/** True when `seoRow(path)` is final: the whole map is loaded, or this page's row was inlined. */
export function hasSeoRow(path: string) {
  // Inlined rows of other pages carry only their H1 (link text); a row is final once it has a description.
  return !!table || lookup((inline ??= readInline()), path)?.description !== undefined;
}

const FALLBACK: SeoMeta = {
  title: "",
  description: "Glass components for React with Motion animations, built on Base UI and Tailwind CSS v4. Free and MIT.",
  keyword: "",
};

export function pageSeo(route: RouteLike): PageSeo {
  const meta = seoRow(route.path);
  const m = meta ?? FALLBACK;
  const ogTitle = m.title || route.title;
  const noindex = !!m.noindex;
  return {
    path: route.path,
    group: route.group,
    name: route.title,
    h1: m.h1 ?? route.title,
    title: `${ogTitle} | ${SITE_NAME}`,
    ogTitle,
    description: m.description,
    answer: m.answer,
    install: m.install,
    keyword: m.keyword,
    secondary: m.secondary ?? [],
    canonical: canonicalUrl(route.path),
    ogImage: ogImageUrl(route.path),
    ogImageAlt: `${ogTitle} on a violet glass card, labeled React · Tailwind · Motion`,
    noindex,
    fallback: !meta,
  };
}

/** Breadcrumb trail for a route: Home › Hub › Page (the hub level only where the route belongs to one). */
export function breadcrumbs(route: RouteLike): { name: string; path: string }[] {
  const trail = [{ name: "Home", path: "/" }];
  if (route.path === "/") return trail;
  const hub = hubOf(route);
  if (hub) trail.push({ name: HUBS[hub]?.name ?? route.title, path: hub });
  // The last crumb is the short name the sidebar shows; a guide's own headline is its name (the H1 of every page is the keyword row's h1, see layout/Page.tsx).
  const name = route.path.startsWith("/guides/") ? (seoRow(route.path)?.h1 ?? route.title) : route.title;
  trail.push({ name, path: route.path });
  return trail;
}

/* ---------- "When to use it" and FAQ content (content/*.ts), loaded per group of routes ---------- */

const contentRows: Record<string, PageContent> = {};
const contentLoading = new Map<string, Promise<unknown>>();
let inlineContent: Record<string, PageContent> | undefined;

function readInlineContent(): Record<string, PageContent> {
  if (typeof document === "undefined") return {};
  try {
    const text = document.getElementById("sheen-content")?.textContent;
    return text ? (JSON.parse(text) as Record<string, PageContent>) : {};
  } catch {
    return {};
  }
}

/** Loads the content file of the route's group (once). Resolves at once for routes that have no content. */
export function loadPageContent(path: string): Promise<unknown> {
  const file = CONTENT_FILE[path];
  const load = file ? CONTENT_LOADERS[file] : undefined;
  if (!file || !load) return Promise.resolve();
  let promise = contentLoading.get(file);
  if (!promise) {
    promise = load().then((module) => Object.assign(contentRows, module.content));
    contentLoading.set(file, promise);
  }
  return promise;
}

/**
 * A thenable that React's `use()` unwraps without suspending: React reads `status === "fulfilled"`
 * and returns `value` synchronously (the documented thenable contract). `then` still behaves like a
 * real promise for any other consumer.
 */
type Fulfilled<T> = PromiseLike<T> & { status: "fulfilled"; value: T };
function fulfilled<T>(value: T): Fulfilled<T> {
  return {
    status: "fulfilled",
    value,
    then(onFulfilled, onRejected) {
      return Promise.resolve(value).then(onFulfilled, onRejected);
    },
  };
}
const READY = fulfilled(undefined);

/**
 * What `<Seo>` passes to `use()` for the keyword-map row: the cached import while the map is loading, or an
 * already-fulfilled thenable once the row is present (inlined first page, or the map loaded). `use()` has to run
 * on every render in the same order: a call skipped on the retry after a suspend makes React warn
 * ("called use() to suspend in a previous render but did not call use() when it finished") and drop the result.
 */
export function seoMetaResource(path: string): PromiseLike<unknown> {
  return hasSeoRow(path) ? READY : loadSeoMeta();
}

/** Same contract as {@link seoMetaResource}, for the page's "When to use it" and FAQ rows. */
export function pageContentResource(path: string): PromiseLike<unknown> {
  return hasContentRow(path) ? READY : loadPageContent(path);
}

/** True when `contentRow(path)` is final: the route has none, its file is loaded, or its row was inlined. */
export function hasContentRow(path: string) {
  return !CONTENT_FILE[path] || path in contentRows || path in (inlineContent ??= readInlineContent());
}

/** The page's "When to use it" bullets and FAQ, or undefined (none written, or not loaded yet). */
export function contentRow(path: string): PageContent | undefined {
  return lookup(contentRows, path) ?? lookup((inlineContent ??= readInlineContent()), path);
}

/** Every content file (the server and the build scripts need all rows). */
export function loadAllContent() {
  return Promise.all(Object.keys(CONTENT_FILE).map((path) => loadPageContent(path)));
}
