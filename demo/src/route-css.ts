/**
 * Per-route stylesheets (scripts/prerender.mjs, scripts/lib/css-split.mjs). The build splits its one stylesheet into one
 * COMPLETE sheet per route class (home, hubs, guides, components, charts...), each holding everything the pages of that class
 * can use, in the source's cascade order; the prerender links a page's own class sheet and inlines its critical CSS.
 *
 * Why complete sheets and not "shared base + extras": rules of equal specificity are ordered by position, so a rule moved to
 * an extra sheet that loads after the base changes which of two competing utilities wins. A sheet that is complete keeps the
 * source order, and the client therefore never stacks two class sheets: it loads the next page's sheet switched off
 * (`media="not all"`: fetched, not applied) and, when that page commits (router.ts, notifyRouteCommitted), swaps it in
 * for the old one in the same frame as the DOM swap.
 *
 * `#sheen-assets` (written by the prerender) names the map file: { classes: { class: [href] }, routes: { path: class } }.
 * The dev server and a build without the split have no map: nothing to load, the one stylesheet has everything.
 */

type CssMap = { classes: Record<string, string[]>; routes: Record<string, string> };

let mapPromise: Promise<CssMap | null> | undefined;
let map: CssMap | null = null;
const loading = new Map<string, Promise<void>>();

const OFF = "not all";
const pathOf = (href: string) => new URL(href, location.href).pathname;

function mapUrl(): string | undefined {
  try {
    const raw = document.getElementById("sheen-assets")?.textContent;
    const url = raw ? (JSON.parse(raw) as { cssMap?: string }).cssMap : undefined;
    return url === "" ? undefined : url;
  } catch {
    return undefined;
  }
}

function loadMap(): Promise<CssMap | null> {
  const url = mapUrl();
  if (!url) return Promise.resolve(null);
  // A failed fetch is not remembered: the next navigation tries again.
  return (mapPromise ??= fetch(url)
    .then((r) => (r.ok ? (r.json() as Promise<CssMap>) : null))
    .catch(() => null)
    .then((m) => {
      if (m) map = m;
      else mapPromise = undefined;
      return m;
    }));
}

const sheetsOf = (path: string): string[] => {
  if (!map) return [];
  const cls = map.routes[path] ?? map.routes["/404"] ?? "404";
  return map.classes[cls] ?? [];
};

const linksFor = (href: string) =>
  [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].filter(
    (l) => pathOf(l.href) === pathOf(href),
  );

/** Resolves once `href` is in the document and fetched (or failed: a missing sheet must not block navigation for ever). */
function fetchSheet(href: string): Promise<void> {
  const known = loading.get(href);
  if (known) return known;
  const done = new Promise<void>((resolve) => {
    const present = linksFor(href)[0];
    if (present?.sheet) {
      resolve();
      return;
    }
    const link = present ?? document.createElement("link");
    const timer = window.setTimeout(resolve, 4000);
    const settle = (failed: boolean) => {
      window.clearTimeout(timer);
      if (failed) loading.delete(href); // retry on the next navigation
      resolve();
    };
    link.addEventListener("load", () => settle(false), { once: true });
    link.addEventListener("error", () => settle(true), { once: true });
    if (!present) {
      link.rel = "stylesheet";
      link.crossOrigin = "";
      link.media = OFF;
      link.href = href;
      document.head.appendChild(link);
    }
  });
  loading.set(href, done);
  return done;
}

/**
 * Fetches the sheet of the page at `path` (a route path, no base) without applying it. Returns undefined when there is
 * nothing to wait for (the server, a build without the split), else a promise that resolves when it has arrived.
 */
export function ensureRouteCss(path: string): Promise<void> | undefined {
  if (typeof document === "undefined" || !mapUrl()) return undefined;
  return loadMap().then(() => Promise.all(sheetsOf(path).map(fetchSheet)).then(() => undefined));
}

/**
 * Makes the page's sheet the only route sheet in effect: turns it on, turns the others (and the first page's inline
 * critical CSS, which belongs to its own class) off. Synchronous, so it runs in the commit's layout effect.
 */
export function activateRouteCss(path: string): void {
  if (typeof document === "undefined" || !map) return;
  const want = new Set(sheetsOf(path).map(pathOf));
  if (!want.size) return;
  const all = new Set(Object.values(map.classes).flat().map(pathOf));
  for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')) {
    const p = pathOf(link.href);
    if (!all.has(p)) continue;
    if (want.has(p)) link.removeAttribute("media");
    else link.media = OFF;
  }
  document.getElementById("sheen-critical")?.remove();
}

/**
 * First load only: a page can be served for a URL that is not its own (404.html answers a spelling the router understands,
 * such as a trailing slash), so it links the sheet of the page it was prerendered for, not of the page the router shows.
 * Returns a promise while the right sheet is being brought in, undefined in the normal case (nothing to do, no request).
 */
export function syncInitialRouteCss(path: string): Promise<void> | undefined {
  if (typeof document === "undefined") return undefined;
  let rendered: string | undefined;
  try {
    const raw = document.getElementById("sheen-assets")?.textContent;
    rendered = raw ? (JSON.parse(raw) as { cssRoute?: string }).cssRoute : undefined;
  } catch {
    return undefined;
  }
  if (rendered === undefined || rendered === path) return undefined;
  return ensureRouteCss(path)?.then(() => activateRouteCss(path));
}
