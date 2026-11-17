import { href } from "../router";
import { Page } from "../layout/Page";

const LINKS = [
  ["/", "Introduction"],
  ["/components/glass-card", "Glass card"],
  ["/components/button", "Button"],
  ["/charts", "Charts"],
  ["/effects/liquid-glass", "Liquid glass"],
  ["/blocks/glass-login", "Glass login"],
] as const;

/** Opens the docs search palette: it listens for Ctrl/Cmd + K on the window (layout/SiteSearch.tsx). */
function openSearch() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
}

/**
 * The 404 page: prerendered to 404.html, which GitHub Pages serves (with a real 404 status) for unknown paths.
 * A lit glass slab with a large 404, a search field that opens the palette, and a card of glass floating beside it.
 * Glass budget: the slab, the search field and the floating card (three); the page links are flat chips.
 */
export function NotFoundPage() {
  return (
    <Page
      eyebrow="404"
      title="Page not found"
      description="There is no page at this address. It may have moved, or the link may be wrong. These pages are a good place to start."
      fullLede
    >
      <section aria-labelledby="nf-start" className="nf">
        <div aria-hidden className="nf-glow" />
        <div className="nf-slab glass-2">
          <p aria-hidden className="nf-code sheen-display">
            404
          </p>
          <div className="nf-body">
            <h2 id="nf-start" className="text-lg font-semibold tracking-tight">
              Find what you were looking for
            </h2>
            <button type="button" className="nf-search glass-1" onClick={openSearch}>
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
              <span className="min-w-0 flex-1 text-start text-pretty">Search pages and components</span>
              <kbd className="nf-kbd any-pointer-coarse:hidden!">Ctrl K</kbd>
            </button>
            <ul className="flex flex-wrap gap-2">
              {LINKS.map(([path, label]) => (
                <li key={path}>
                  <a href={href(path)} className="nf-chip">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <aside aria-label="Tip: finding a page" className="nf-float glass-1">
          <span aria-hidden className="nf-float__dot" />
          <p className="text-sm font-semibold">Lost a link?</p>
          <p className="text-xs text-sheen-fg-muted">
            Every page is in the sidebar, and the search finds components by name.
          </p>
        </aside>
      </section>
    </Page>
  );
}
