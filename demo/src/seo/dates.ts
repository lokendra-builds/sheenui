import { seoRow } from "./head";

/** The day the site first shipped. */
export const SITE_PUBLISHED = "2026-11-08";

/** Pages added after the first release keep their own first date. */
const PUBLISHED_FROM: Record<string, string | undefined> = {
  "/docs/base-ui": "2026-11-11",
  "/docs/tailwind-v4": "2026-11-11",
  "/docs/dark-mode": "2026-11-11",
  "/docs/rtl": "2026-11-16",
  "/about": "2026-11-17",
  "/layout/pagination": "2026-11-11",
  "/charts/line-chart": "2026-11-10",
  "/charts/area-chart": "2026-11-10",
  "/charts/bar-chart": "2026-11-10",
  "/charts/donut-chart": "2026-11-10",
  "/charts/sparkline": "2026-11-10",
};

/**
 * The dates a docs page shows in its footer, declares as datePublished / dateModified and uses as the sitemap lastmod:
 * one source, so the three always agree. `modified` is the day the page's own sources last changed
 * (scripts/gen-page-dates.mjs; it rides on the page's keyword-map row, so it costs no entry JavaScript). Guides carry
 * their own dates (front matter) and do not use this.
 */
export function pageDates(path: string) {
  const published = PUBLISHED_FROM[path] ?? SITE_PUBLISHED;
  const modified = seoRow(path)?.modified ?? published;
  return { published, modified: modified < published ? published : modified };
}
