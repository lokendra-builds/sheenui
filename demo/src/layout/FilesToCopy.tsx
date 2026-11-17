import { useHeadingId } from "./heading-ids";
import graph from "virtual:sheen-deps";

import { resolveCopyList, type SheenGraph } from "../../sheen-closure.mjs";
import { href } from "../router";
import { SITE_URL } from "../seo/site";

/** Group "components/charts/a.tsx" style units by folder, so a long list reads as a few lines. */
function groupUnits(units: string[]) {
  const groups = new Map<string, string[]>();
  for (const unit of units) {
    const slash = unit.lastIndexOf("/", unit.endsWith("/") ? unit.length - 2 : unit.length);
    const dir = unit.endsWith("/") ? unit : unit.slice(0, slash + 1);
    const names = groups.get(dir) ?? [];
    groups.set(dir, names);
    if (!unit.endsWith("/")) names.push(unit.slice(slash + 1));
  }
  return [...groups].map(([dir, names]) => ({ dir, names }));
}

const MANY_ITEMS = 6;

const warned = new Set<string>();
function warnEmptyFiles(sources: string[]) {
  const key = sources.join("|");
  if (!import.meta.env.DEV || warned.has(key)) return;
  warned.add(key);
  console.warn(
    `[docs] "Files to copy" is empty for source ${JSON.stringify(sources)}: no file under theme/src/ matches (check the path, or pass files={false}).`,
  );
}

/** The "Files to copy" panel of a docs page, worked out from the real import graph of its `source`. */
export default function FilesToCopy({ sources }: { sources: string[] }) {
  const headingId = useHeadingId("Files to copy");
  const Title = "h2";
  const { units, packages, items } = resolveCopyList(graph as SheenGraph, sources);
  if (units.length === 0) {
    // A page that asks for "Files to copy" must get one: an empty panel means `source` points at
    // nothing the import graph (virtual:sheen-deps) knows. Say so in dev instead of dropping it silently.
    warnEmptyFiles(sources);
    return null;
  }

  const fileCount = units.reduce((n, u) => n + (u.endsWith("/") ? 0 : 1), 0);
  const groups = groupUnits(units);
  const many = items.length > MANY_ITEMS;
  // A dashboard's page-level install line brings its sample data; this panel's command is the component alone.
  const componentOnly = items.some((n) => /^analytics-(web|saas|ecommerce|product|finance)$/.test(n));
  const command = `npx shadcn@latest add ${(many ? items.slice(0, 1) : items).map((n) => `${SITE_URL}/r/${n}.json`).join(" ")}`;
  // Count what the list shows: one folder per line, and the files named inside the braces.
  const folderCount = groups.length;
  const summary = `${folderCount} ${folderCount === 1 ? "folder" : "folders"}${fileCount > 0 ? ` · ${fileCount} ${fileCount === 1 ? "file" : "files"}` : ""}${packages.length > 0 ? ` · ${packages.length} ${packages.length === 1 ? "package" : "packages"}` : ""}`;

  return (
    // Collapsed by default: the live demo is the hero of the page, the file list one click away.
    <details className="group/files max-w-3xl min-w-0 rounded-sheen-lg border border-sheen-border bg-sheen-hover text-sm">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-sheen-lg px-4 py-2 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden">
        <Title id={headingId} className="text-sm font-semibold">
          Files to copy
        </Title>
        <span className="text-sheen-fg-muted">{summary}</span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="ms-auto size-4 shrink-0 text-sheen-fg-muted transition-transform group-open/files:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      {/* minmax(0, …) tracks: long paths and the install line wrap instead of widening the page at 320px. */}
      <dl className="grid grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-2.5 px-4 pb-4 sm:grid-cols-[auto_minmax(0,1fr)]">
        <dt className="text-sheen-fg-muted">
          From <code className="font-sheen-mono text-xs">theme/src/</code>
        </dt>
        <dd className="min-w-0">
          <ul className="flex flex-col gap-1.5">
            {groups.map(({ dir, names }) => (
              <li key={dir} className="max-w-full">
                <code className="inline-block max-w-full rounded-sheen-sm bg-sheen-hover px-2 py-0.5 font-sheen-mono text-xs [overflow-wrap:anywhere] text-sheen-fg">
                  {dir}
                  {names.length === 1 ? names[0] : names.length > 1 ? `{${names.join(", ")}}` : ""}
                </code>
              </li>
            ))}
          </ul>
        </dd>
        {items.length > 0 && (
          <>
            <dt className="text-sheen-fg-muted">{componentOnly ? "shadcn CLI (component only)" : "shadcn CLI"}</dt>
            <dd className="min-w-0">
              <code className="block rounded-sheen-sm bg-sheen-hover px-2 py-0.5 font-sheen-mono text-xs [overflow-wrap:anywhere] text-sheen-fg">
                {command}
              </code>
              <span className="mt-1 block text-xs text-sheen-fg-muted">
                {/* Every registry item is listed (no "and N more"); the span wraps normally. */}
                <span className="[overflow-wrap:anywhere]">
                  Registry {items.length === 1 ? "item" : "items"}: {items.join(", ")}.
                  {many ? " The command installs the first; swap the name in the URL for any other." : ""} The styles
                  need the{" "}
                  <a href={href("/docs/tailwind-v4")} className="underline underline-offset-2 hover:text-sheen-fg">
                    Tailwind v4 glass UI setup
                  </a>
                  .
                </span>
              </span>
            </dd>
          </>
        )}
        {packages.length > 0 && (
          <>
            <dt className="text-sheen-fg-muted">Packages</dt>
            <dd className="min-w-0">
              <code className="block rounded-sheen-sm bg-sheen-hover px-2 py-0.5 font-sheen-mono text-xs [overflow-wrap:break-word] text-sheen-fg">
                pnpm add {packages.join(" ")}
              </code>
            </dd>
          </>
        )}
      </dl>
    </details>
  );
}
