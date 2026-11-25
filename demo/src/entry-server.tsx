import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import { SheenMotionProvider } from "@sheenui/theme";

import { App } from "./App";
import { routes, type Route } from "./routes";
import { notFoundRoute } from "./seo/NotFoundPage";
import { loadAllContent, loadSeoMeta } from "./seo/head";

export { routes, notFoundRoute };
export { pageSeo, breadcrumbs, seoRow, contentRow } from "./seo/head";
export { buildJsonLd, jsonLdScript } from "./seo/jsonld";
import { linkTargets as pageLinkTargets } from "./seo/related";
export { HUBS } from "./seo/hubs";
export { CONTENT_FILE } from "./seo/content";
export { GUIDE_IMAGE_SIZES, guideImageSrcSet, guideImages, guideStyledShots } from "./guide-images";
export { HUB_COVER_SIZES } from "./layout/hub-cover-sizes";
export * from "./seo/site";
export { pageDates } from "./seo/dates";
export { COUNTS } from "./seo/counts";

/** The routes whose H1 and intro this page renders as link text (the prerender inlines them). */
export const linkTargets = (path: string) => pageLinkTargets(routes, path);

// The whole keyword map, loaded up front: pageSeo() is synchronous for every script that imports
// this bundle (prerender, seo-check, smoke...). Only the browser fetches the map lazily.
await loadSeoMeta();
await loadAllContent();

/** React's hoisted head tags (and precedence <style>s) come first in the prelude: split them off the body. */
const HEAD_RE = /^(?:<title>[^<]*<\/title>|<(?:meta|link)\b[^>]*>|<style\b[^>]*>[\s\S]*?<\/style>)+/;

export type Rendered = {
  route: Route;
  /** <title>, <meta> and <link> tags React hoisted, for <head>. */
  head: string;
  /** The app's HTML, for <div id="root">. */
  body: string;
  errors: string[];
};

/** Render one route to static HTML (scripts/prerender.mjs calls this for every route). */
export async function render(path: string): Promise<Rendered> {
  const route = routes.find((r) => r.path === path) ?? notFoundRoute;
  await route.preload();

  const errors: string[] = [];
  const { prelude } = await prerender(
    <StrictMode>
      <SheenMotionProvider>
        <App initialPath={route.path} />
      </SheenMotionProvider>
    </StrictMode>,
    {
      // Fizz streams any completed Suspense boundary bigger than this out of order (a fallback,
      // then a hidden segment and a swap script). Static HTML wants everything inline, so no
      // crawler without JavaScript ever reads the page out of a hidden <div>.
      progressiveChunkSize: Number.MAX_SAFE_INTEGER,
      onError(error) {
        errors.push(error instanceof Error ? (error.stack ?? error.message) : String(error));
      },
    },
  );
  const html = await new Response(prelude).text();
  const head = HEAD_RE.exec(html)?.[0] ?? "";
  return { route, head, body: html.slice(head.length), errors };
}
