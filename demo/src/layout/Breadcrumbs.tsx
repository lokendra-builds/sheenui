import { Fragment } from "react";

import { href } from "../router";
import { routes } from "../routes";
import { breadcrumbs } from "../seo/head";

/**
 * The visible breadcrumb trail (Home › Hub › Page). It is built from the same `breadcrumbs()` as the
 * page's BreadcrumbList JSON-LD, so what visitors see and what search engines read cannot differ.
 */
export function Breadcrumbs({ path }: { path: string }) {
  const route = routes.find((r) => r.path === path);
  if (!route || path === "/") return null;
  const trail = breadcrumbs(route);
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 flex-nowrap items-center gap-x-1.5 text-sm whitespace-nowrap text-sheen-fg-muted">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <Fragment key={crumb.path}>
              <li className={last ? "flex min-w-0 items-center" : "flex shrink-0 items-center"}>
                {last ? (
                  // A long leaf wraps to a second line rather than losing its end to an ellipsis.
                  <span
                    aria-current="page"
                    title={crumb.name}
                    className="line-clamp-2 min-w-0 font-medium whitespace-normal text-sheen-fg [overflow-wrap:anywhere]"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <a
                    href={href(crumb.path)}
                    className="inline-flex items-center justify-center rounded-sheen-sm py-0.5 underline-offset-4 hover:text-sheen-accent hover:underline any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11"
                  >
                    {crumb.name}
                  </a>
                )}
              </li>
              {!last && (
                <li aria-hidden className="flex shrink-0 items-center">
                  ›
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
