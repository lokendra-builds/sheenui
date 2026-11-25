import { useEffect, useState, useTransition } from "react";

import { startRouteTransition } from "@sheenui/theme";

import { activateRouteCss, ensureRouteCss } from "./route-css";
import { HUBS } from "./seo/hubs";
import { BASE_PATH } from "./seo/site";

/**
 * Tiny path router. Every page has a real URL (`/sheenui/components/button`), prerendered to
 * its own HTML file; in the browser, clicks on in-app links are intercepted and the page swaps
 * without a reload. No dependency needed.
 *
 * Route paths never include the base: `href()` adds it, `toRoutePath()` strips it.
 */

/** The base without its trailing slash ("/sheenui"), or "" when the site is at a domain root. */
const BASE = BASE_PATH.replace(/\/$/, "");

/** Route path from a location pathname: strips the base, ".html", "/index" and trailing slashes. */
export function toRoutePath(pathname: string): string {
  let p = pathname;
  if (BASE && (p === BASE || p.startsWith(`${BASE}/`))) p = p.slice(BASE.length);
  try {
    p = decodeURIComponent(p);
  } catch {
    /* keep it as it is */
  }
  p = p
    .replace(/\.html$/, "")
    .replace(/\/index$/, "")
    .replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

/**
 * The href for a route path: "/" → "/sheenui/", "/charts/button" → "/sheenui/charts/button". The six hubs get the
 * trailing slash their canonical URL, sitemap entry and `<hub>/index.html` use ("/charts" → "/sheenui/charts/"), so no
 * internal link costs a 301. Every internal link is built here (nav, cards, breadcrumbs, prose, related, footer).
 */
export function href(path: string) {
  if (path === "/") return BASE_PATH;
  return path in HUBS ? `${BASE}${path}/` : `${BASE}${path}`;
}

function readPath() {
  return toRoutePath(window.location.pathname);
}

const commitWaiters: (() => void)[] = [];
/** The route whose stylesheet is waiting to replace the shown page's, in the frame its page commits (src/route-css.ts). */
let pendingCss: string | undefined;
function commitCss() {
  if (pendingCss === undefined) return;
  const path = pendingCss;
  pendingCss = undefined;
  activateRouteCss(path);
}

/** Call from a layout effect once a navigated page is in the DOM: lets the view transition take its "new" snapshot. */
export function notifyRouteCommitted() {
  commitCss();
  for (const resolve of commitWaiters.splice(0)) resolve();
}

/** True for a URL the app owns (same origin, under the base). */
function isAppUrl(url: URL) {
  if (url.origin !== window.location.origin) return false;
  return url.pathname === BASE || url.pathname.startsWith(BASE_PATH);
}

/**
 * The current path. Route changes run in a transition, so while a page's code is still
 * loading the previous page stays on screen (no blank fallback, no layout jump);
 * `pending` is true during that wait.
 *
 * `initialPath` is what the server rendered; the client reads the real location after mount
 * (they differ only when 404.html answered for a URL spelling the client router does understand).
 */
export function usePath(initialPath?: string) {
  const [path, setPath] = useState(() => initialPath ?? (typeof window === "undefined" ? "/" : readPath()));
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // Direction of a history move: each entry we push carries an index, so popstate can tell back from forward.
    let index = (window.history.state as { i?: number } | null)?.i ?? 0;
    // The Navigation API (where present) says whether the browser already animates this move itself
    // (a phone's back-swipe): then we add nothing on top.
    let uaAnimates = false;
    const nav = (window as unknown as { navigation?: EventTarget }).navigation;
    const onNavigate = (event: Event) => {
      const e = event as Event & { navigationType?: string; hasUAVisualTransition?: boolean };
      uaAnimates = e.navigationType === "traverse" && Boolean(e.hasUAVisualTransition);
    };
    nav?.addEventListener("navigate", onNavigate);
    const sync = (animate = true, types: string[] = ["push"]) => {
      const next = readPath();
      // Same route (a hash-only change, a repeated popstate): nothing to commit, so no transition either.
      if (!animate || next === shown) {
        shown = next;
        startTransition(() => setPath(next));
        return;
      }
      // The new page's stylesheets first (src/route-css.ts): the old page stays up until they are in, so the new one
      // never paints unstyled. Usually already cached by the link hover, so no wait.
      const go = () => {
        if (readPath() !== next || shown === next) return; // a later navigation superseded this one while the sheets loaded
        shown = next;
        pendingCss = next;
        // Wrapped in a view transition: the old frame is held until the new page has
        // committed (RouteFocus calls notifyRouteCommitted), or 1 s at most. Instant under reduced motion.
        const update = () =>
          new Promise<void>((resolve) => {
            commitWaiters.push(resolve);
            startTransition(() => setPath(next));
          });
        if (uaAnimates) void update();
        else startRouteTransition(update, { types });
      };
      const css = ensureRouteCss(next);
      if (css) void css.then(go);
      else go();
    };
    let shown = path;
    if (readPath() !== path) sync(false);

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (!isAppUrl(url)) return;
      // Same document, only the fragment differs (#main, #props): let the browser jump.
      if (url.pathname === window.location.pathname && url.hash) return;
      event.preventDefault();
      if (toRoutePath(url.pathname) === readPath()) {
        window.scrollTo(0, 0); // immediate (no smooth scrolling is set) and valid on old WebKit, which rejects behavior:"instant"
        return;
      }
      window.history.pushState({ i: ++index }, "", url.pathname + url.search + url.hash);
      sync();
    }

    document.addEventListener("click", onClick);
    const onPop = () => {
      const now = (window.history.state as { i?: number } | null)?.i ?? 0;
      const back = now < index;
      index = now;
      sync(true, [back ? "back" : "forward"]);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      nav?.removeEventListener("navigate", onNavigate);
    };
    // Runs once: the listeners read the live location, never the closed-over path.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once (see above)
  }, []);

  return { path, pending };
}

/** Programmatic navigation (pushState + a popstate event, so every usePath() follows). */
export function navigate(path: string, { replace = false } = {}) {
  const url = href(path);
  const index = (window.history.state as { i?: number } | null)?.i ?? 0;
  if (replace) window.history.replaceState({ i: index }, "", url);
  else window.history.pushState({ i: index + 1 }, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
