/**
 * Site-wide SEO constants. Public values, not secrets.
 *
 * The demo deploys to GitHub Pages under a project sub-path. When a custom domain arrives,
 * change SITE_URL and BASE_PATH here and nothing else: the router, canonicals, sitemap,
 * robots.txt, OG image URLs, JSON-LD and llms.txt all read them from this file.
 */

import { HUBS } from "./hubs";

/** Origin + base path, no trailing slash. Canonical URLs are `${SITE_URL}${route.path}`. */
export const SITE_URL = "https://lokendra-builds.github.io/sheenui";

/** Vite `base`: the path the site is served from, with both slashes. "/" for a root domain. */
export const BASE_PATH = "/sheenui/";

export const SITE_NAME = "SheenUI";
export const SITE_ALT_NAMES = ["Sheen UI"];
export const SITE_TAGLINE = "Glassy, classy React components with motion";

export const REPO_URL = "https://github.com/lokendra-builds/sheenui";

export const AUTHOR = {
  name: "Lokendra Singh Rathore",
  /** GitHub handle, shown as the byline on guides (no email is published). */
  handle: "lokendra-builds",
  url: "https://github.com/lokendra-builds",
};

export const LICENSE_URL = "https://opensource.org/licenses/MIT";

/**
 * Absolute URL for a route path ("/" and the hub pages → with a trailing slash, others without one). A hub is
 * written as `<hub>/index.html`, so GitHub Pages answers `/hub` with a 301 to `/hub/`: the canonical is the URL
 * that returns 200 (hosting-check's mimic shows both).
 */
export function canonicalUrl(path: string) {
  return path === "/" || path in HUBS ? `${SITE_URL}${path === "/" ? "" : path}/` : `${SITE_URL}${path}`;
}

/** URL of a route's Markdown twin ("/" is index.md, "/a/b" is a/b.md); written next to the page by scripts/lib/llms.mjs. */
export function markdownUrl(path: string) {
  return `${SITE_URL}/${path === "/" ? "index" : path.slice(1)}.md`;
}

/** File name of a route's OG card, e.g. "/components/glass-card" → "components-glass-card". */
export function ogSlug(path: string) {
  return path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
}

/**
 * The file type of a route's og:image. Home, the hubs and the guides (the pages people share) advertise a JPEG: Facebook,
 * LinkedIn and several chat apps still ignore WebP. Every other page keeps the smaller WebP card.
 */
export function ogFormat(path: string): "jpg" | "webp" {
  return path === "/" || path in HUBS || path.startsWith("/guides/") ? "jpg" : "webp";
}

export function ogImageUrl(path: string) {
  return `${SITE_URL}/og/${ogSlug(path)}.${ogFormat(path)}`;
}
