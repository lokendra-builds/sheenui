import { href } from "../router";
import { HubPreview, useHubLive } from "./HubPreview";
import { slugify } from "./heading-ids";
import { routes } from "../routes";
import { seoRow } from "../seo/head";

/** One card per page. The link text is the page's name in the sidebar (the same as its H1); the whole card is the target (the link's ::after). */
const nameOf = (path: string) => routes.find((r) => r.path === path)?.title ?? path;

export function HubCards({ paths }: { paths: string[] }) {
  const list = useHubLive();
  return (
    // grid-cols-1 (minmax(0, 1fr)), not the implicit auto column: a live preview with a wide row (the marquee's pill
    // rows) would otherwise size the single phone column to its min-content and push the page sideways.
    <ul ref={list} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {paths.map((path) => (
        <li key={path} className="flex min-w-0">
          {/* home-flat: the flat frost (no backdrop-filter), so a long list of cards stays within the glass budget. */}
          <div className="hubp-card sheen-spot glass-2 home-flat relative flex w-full min-w-0 flex-col gap-2 rounded-sheen-lg p-5 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sheen-focus">
            <HubPreview path={path} />
            <h3 id={`page-${slugify(nameOf(path))}`} className="text-base font-semibold tracking-tight text-balance">
              <a
                href={href(path)}
                className="outline-none after:absolute after:inset-0 after:content-[''] hover:text-sheen-accent"
              >
                {nameOf(path)}
              </a>
            </h3>
            <p className="text-sm text-pretty text-sheen-fg-muted">{seoRow(path)?.intro}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
