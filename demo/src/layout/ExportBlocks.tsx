import { Suspense, lazy, use, useEffect, useRef, useState } from "react";
import { cn } from "@sheenui/theme";

import { useHeadingId } from "./heading-ids";
import { allExportsFor, exportsFor } from "./route-exports";
import { whenNear } from "./watch-visible";

/*
 * The export names of a docs page: the chips under the title and the "All exports on this page" index. They live in
 * their own module so the generated route -> exports table (about 5 KB gzip) is not part of every route's initial
 * JavaScript: Page.tsx loads this module as islands (lazyBlock); the prerendered HTML already has the names.
 */

const INDEX_MIN = 9;
/** A longer index starts collapsed (its entries stay in the HTML). */
const INDEX_COLLAPSE = 24;
/** The summaries module is a code-split chunk (see ExportSummaryList.tsx). */
const ExportSummaryList = lazy(() => import("./ExportSummaryList"));

/**
 * Holds the summaries (their own 26 KB chunk) back until the index nears the viewport: `use()` on a promise the section
 * resolves keeps the Suspense boundary dehydrated (the server HTML stays), and the chunk is requested only then.
 */
function NearSummaryList({ near, names }: { near: Promise<void>; names: readonly string[] }) {
  use(near);
  return <ExportSummaryList names={names} />;
}

/** On a page that covers many exports (a gallery, the foundations, a component family): every name, so each one is findable on the page it leads to. */
export function ExportIndex({ path }: { path: string }) {
  const names = allExportsFor(path);
  const id = useHeadingId("All exports on this page");
  const section = useRef<HTMLElement>(null);
  // The server has no viewport: its promise is already settled, so the summaries are in the prerendered HTML.
  const [near] = useState(() => {
    let open!: () => void;
    const promise =
      typeof window === "undefined" ? Promise.resolve() : new Promise<void>((resolve) => (open = resolve));
    return { promise, open };
  });
  useEffect(() => {
    if (section.current) void whenNear(section.current).then(near.open);
  }, [near]);
  const helpers = names.some((n) => /^[a-z]/.test(n) && !/^use[A-Z]/.test(n));
  if (names.length < INDEX_MIN && !helpers) return null;
  // The fallback (a client-side visit, until the summaries chunk arrives) is the bare names; hydration keeps the server's HTML.
  const summaryList = (
    <Suspense
      fallback={
        <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1.5 p-0">
          {names.map((name) => (
            <li key={name}>
              <code className="font-sheen-mono text-xs text-sheen-accent">{name}</code>
            </li>
          ))}
        </ul>
      }
    >
      <NearSummaryList near={near.promise} names={names} />
    </Suspense>
  );
  return (
    <section ref={section} aria-labelledby={id} className="flex max-w-4xl flex-col gap-3">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        All exports on this page
      </h2>
      {/* BEGIN export summaries: name + first JSDoc sentence; the sentences load as their own chunk (ExportSummaryList). */}
      {names.length > INDEX_COLLAPSE ? (
        <details
          data-export-index
          className="group/index rounded-sheen-lg border border-sheen-border bg-sheen-hover text-sm"
        >
          <summary className="flex min-h-10 cursor-pointer items-center rounded-sheen-lg px-4 py-2 text-sheen-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11">
            {`Show all ${names.length} exports`}
          </summary>
          <div className="px-4 pb-4">{summaryList}</div>
        </details>
      ) : (
        summaryList
      )}
      {/* END export summaries */}
    </section>
  );
}

/* ---------- Export names ---------- */

const MAX_CHIPS = 5;
const MAX_CHIPS_PHONE = 2;

/** The names to import on this page (`SegmentedControl`, ...), under the title: the sidebar keeps the short label. Two names on a phone ("+n" for the rest); a long name wraps. */
export function ExportChips({ path }: { path: string }) {
  const names = exportsFor(path);
  if (names.length === 0) return null;
  const shown = names.slice(0, MAX_CHIPS);
  const hiddenOnPhone = names.length - MAX_CHIPS_PHONE;
  const hidden = names.length - shown.length;
  return (
    <ul aria-label="Exports on this page" className="flex min-w-0 flex-wrap items-center gap-1.5">
      {shown.map((name, i) => (
        <li key={name} className={cn("min-w-0", i >= MAX_CHIPS_PHONE && "max-sm:hidden")}>
          <code className="block rounded-sheen-sm [overflow-wrap:anywhere] border border-sheen-border bg-sheen-hover px-2 py-0.5 font-sheen-mono text-xs text-sheen-fg">
            {name}
          </code>
        </li>
      ))}
      {hiddenOnPhone > 0 && <li className="shrink-0 text-xs text-sheen-fg-muted sm:hidden">+{hiddenOnPhone} more</li>}
      {hidden > 0 && <li className="text-xs text-sheen-fg-muted max-sm:hidden">+{hidden} more</li>}
    </ul>
  );
}
