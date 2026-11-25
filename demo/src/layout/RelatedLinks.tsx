import { useHeadingId } from "./heading-ids";

import { guidePath } from "../guides";
import { href } from "../router";
import { routes } from "../routes";
import { HUBS, hubChildren, hubOf } from "../seo/hubs";
import { guidesOf, labelFor, relatedFor } from "../seo/related";

/**
 * "Related" at the foot of a docs page: the components, blocks or charts used with this one, the
 * guides that cover it, and its hub. Link text is each target's keyword-map H1, so the anchors
 * say what the target page is about.
 */
export function RelatedLinks({ path }: { path: string }) {
  const headingId = useHeadingId("Related pages");
  const route = routes.find((r) => r.path === path);
  if (!route) return null;
  const related = relatedFor(routes, path);
  const guides = guidesOf(path);
  const hub = hubOf(route);
  if (related.length === 0 && guides.length === 0) return null;
  const link =
    "inline-flex items-center any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11 font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg";
  return (
    <section aria-labelledby={headingId} className="flex max-w-3xl flex-col gap-4">
      <h2 id={headingId} className="text-xl font-semibold tracking-tight">
        Related pages
      </h2>
      {related.length > 0 && (
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {related.map((r) => (
            <li key={r.path}>
              <a href={href(r.path)} className={link}>
                {labelFor(routes, r.path)}
              </a>
            </li>
          ))}
        </ul>
      )}
      {guides.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 id="guides-that-cover-it" className="text-sm font-semibold text-sheen-fg-muted">
            Guides that cover it
          </h3>
          <ul className="flex flex-col gap-2">
            {guides.map((g) => (
              <li key={g.slug}>
                <a href={href(guidePath(g.slug))} className={link}>
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {hub && (
        <p className="text-sm text-sheen-fg-muted">
          {hubChildren(routes, hub).length} {HUBS[hub]?.name.toLowerCase()} pages in all: browse them on{" "}
          <a href={href(hub)} className={link}>
            {labelFor(routes, hub)}
          </a>
          .
        </p>
      )}
    </section>
  );
}
