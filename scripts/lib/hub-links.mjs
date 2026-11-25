// A hub page is served at `/<hub>/`; `/<hub>` is answered by a redirect stub, not the page. Public Markdown must link the final form.

/** The hub paths of the docs site (demo/src/seo/hubs.ts). */
export const HUB_NAMES = ["components", "effects", "blocks", "dashboards", "charts", "guides"];

/** Links in `text` to a hub on `site` without the trailing slash (`site/charts`, `site/charts#x`), as the offending URLs. */
export function stubHubLinks(text, site) {
  const escaped = site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped}/(?:${HUB_NAMES.join("|")})(?![/A-Za-z0-9_-]|\\.[A-Za-z])`, "g");
  return [...text.matchAll(pattern)].map((m) => m[0]);
}
