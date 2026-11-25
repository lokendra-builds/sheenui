import { Suspense, lazy, useEffect, useState } from "react";

const loadPalette = () => import("./SearchPalette");
const SearchPalette = lazy(loadPalette);

/**
 * The header's search: a button (and Ctrl/Cmd + K) that opens a command palette listing every docs page. It matches the
 * sidebar title and every component or hook the page documents, so `SegmentedControl` finds "Segmented control". The
 * palette's chunk is only fetched on hover, focus or first use.
 */
export function SiteSearch() {
  const [requested, setRequested] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // A Ctrl/Cmd+K or a Search click made before hydration was noted by the inline script in index.html: open once.
    const early = (window as { __sheenSearch?: { n: number; off: () => void } }).__sheenSearch;
    if (early) {
      early.off();
      if (early.n) {
        queueMicrotask(() => {
          setRequested(true);
          setOpen(true);
        });
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        setRequested(true);
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* The shortcut hint sits beside the button, not inside it: a visible "Ctrl K" inside would have to be part of the
          button's accessible name (WCAG 2.5.3, label in name), and "Search the docs" is the name screen readers need. */}
      <span className="relative inline-flex shrink-0 lg:min-w-0 lg:shrink lg:grow lg:basis-0">
        <button
          type="button"
          aria-label="Search the docs"
          aria-keyshortcuts="Control+K Meta+K"
          aria-haspopup="dialog"
          aria-expanded={open}
          className="glass-1 inline-flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sheen-full px-2.5 text-sm font-medium transition-colors hover:text-sheen-accent sm:px-3.5 lg:w-full lg:min-w-0 lg:justify-start lg:px-4 min-[72rem]:pe-16 any-pointer-coarse:h-11 any-pointer-coarse:min-w-11"
          onPointerEnter={() => void loadPalette()}
          onFocus={() => void loadPalette()}
          onClick={() => {
            setRequested(true);
            setOpen(true);
          }}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <span className="hidden sm:inline">Search</span>
        </button>
        {/* The field fills the header between the switches and GitHub (lg and up); the shortcut shows at its end where it fits. */}
        <kbd
          aria-hidden
          className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 rounded-sheen-sm border border-sheen-border px-1.5 py-0.5 font-sans text-xs whitespace-nowrap text-sheen-fg-muted min-[72rem]:[@media(any-pointer:fine),(any-pointer:none)]:inline"
        >
          Ctrl K
        </kbd>
      </span>
      {requested && (
        <Suspense fallback={null}>
          <SearchPalette open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}
