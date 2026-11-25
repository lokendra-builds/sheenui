import { useEffect, useRef } from "react";
import { usePathname } from "@/lib/router";
import { NAV, PRODUCT, SIGN_IN_HREF } from "@/shell/nav";

const TITLES: Record<string, string> = {
  ...Object.fromEntries(NAV.map((item) => [item.href, item.label])),
  [SIGN_IN_HREF]: "Sign in",
};

/**
 * Makes a client-side page change perceivable without sight. A single-page app never reloads, so a screen
 * reader says nothing on its own: this sets a title per page (what a tab, history and a screen reader's
 * window list show) and, after a navigation, moves focus to the new page's heading, which is read out.
 * The first render only sets the title, so it never steals focus on load. Next.js does the same job itself
 * (per-page `metadata` plus its built-in route announcer), so the Next template has no copy of this file.
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    const page = TITLES[pathname];
    document.title = page ? `${page} | ${PRODUCT}` : PRODUCT;
    if (first.current) {
      first.current = false;
      return;
    }
    // Pages load lazily and React may reuse or replace the <h1>, so for about two seconds keep putting focus
    // on the current heading, as long as focus is still where the navigation left it (the link that was
    // pressed) or has been dropped on <body>. If the person has moved focus elsewhere, leave it alone.
    const start = document.activeElement;
    let frames = 0;
    let raf = 0;
    const focusHeading = () => {
      const heading = document.querySelector<HTMLElement>("h1");
      const active = document.activeElement;
      if (heading && active !== heading) {
        if (active !== document.body && active !== start) return;
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      if (frames++ < 120) raf = requestAnimationFrame(focusHeading);
    };
    raf = requestAnimationFrame(focusHeading);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
