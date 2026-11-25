import { use } from "react";

import { guideDates } from "../guide-dates";
import { pageContentResource, pageSeo, seoMetaResource, type RouteLike } from "./head";
import { AUTHOR, SITE_NAME, SITE_URL, markdownUrl } from "./site";

/**
 * The per-page head. React 19 hoists <title>, <meta> and <link> into <head> on the server
 * and on the client, reuses them on hydration and swaps them on client navigation, so this
 * is the only place that sets them (index.html carries none of them).
 */
export function Seo({ route }: { route: RouteLike }) {
  // The first page's row is inlined in its HTML; any other page waits here for the full keyword map, which
  // keeps the old page on screen (the navigation is a transition). Both use() calls run on every render:
  // when the row is already present the resource is an already-fulfilled thenable, which use() unwraps
  // without suspending (skipping the call on the retry render makes React warn and drop the result).
  use(seoMetaResource(route.path));
  // Same for the page's "When to use it" and FAQ rows (loaded per group of routes).
  use(pageContentResource(route.path));
  const s = pageSeo(route);
  // A 404 has no address of its own: no canonical and no og:url (it is noindex as well).
  const is404 = route.path === "/404";
  // Guides are articles: og:type article with their dates and author.
  const guide = route.group === "Guides" ? guideDates[route.path.replace(/^\/guides\//, "")] : undefined;
  return (
    <>
      <title>{s.title}</title>
      <meta name="description" content={s.description} />
      {!is404 && <link rel="canonical" href={s.canonical} />}
      {!is404 && <link rel="alternate" type="text/markdown" title="SheenUI for LLMs" href={`${SITE_URL}/llms.txt`} />}
      {!is404 && !s.noindex && (
        <link rel="alternate" type="text/markdown" title="This page as Markdown" href={markdownUrl(route.path)} />
      )}
      <meta name="robots" content={s.noindex ? "noindex" : "index,follow,max-image-preview:large"} />
      <meta property="og:type" content={guide ? "article" : "website"} />
      {guide && (
        <>
          <meta property="article:published_time" content={`${guide.published}T00:00:00Z`} />
          <meta property="article:modified_time" content={`${guide.updated}T00:00:00Z`} />
          <meta property="article:author" content={AUTHOR.url} />
        </>
      )}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={s.ogTitle} />
      <meta property="og:description" content={s.description} />
      {!is404 && <meta property="og:url" content={s.canonical} />}
      <meta property="og:image" content={s.ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={s.ogImageAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={s.ogTitle} />
      <meta name="twitter:description" content={s.description} />
      <meta name="twitter:image" content={s.ogImage} />
    </>
  );
}
