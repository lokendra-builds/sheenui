import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Button, SheenLogo, cn, useSheenStyle } from "@sheenui/theme";

import { href } from "../router";
import { Deferred } from "./Deferred";
import { Brand, Nav } from "./Nav";
import { lazyBlock } from "./lazy-block";
import { SiteSearch } from "./SiteSearch";
import { useThemeWave } from "./themeWave";
import { GithubIcon, REPO } from "./links";

type ShellProps = {
  path: string;
  /** A route's code is loading: the old page stays up and a thin bar shows at the top. */
  pending?: boolean;
  /** Polite screen-reader message, e.g. the page just navigated to. */
  announcement?: string;
  children: ReactNode;
};

/** Move focus to the page's h1 (or <main> while it loads) without scrolling. */
export function focusMainHeading() {
  const main = document.getElementById("main");
  const target = main?.querySelector<HTMLElement>("h1") ?? main;
  if (!target) return;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

/**
 * The header's Style / theme bar (the library's SegmentedControl on Base UI's toggle group): a lazy island, loaded at idle after the
 * page has hydrated, so its code stays out of the initial JS of every route. The prerendered HTML already contains the bar
 * and keeps it in place until the chunk lands; it is only shown at 64rem and up, so no empty placeholder is ever visible.
 */
const PreferenceBar = lazyBlock(() => import("./PreferenceBar").then((m) => m.PreferenceBar), {
  minHeight: "2.25rem",
  hold: true,
});

/** The docs app shell: skip link, header, navigation, Style and theme switches, and the page outlet. */
export function Shell({ path, pending = false, announcement = "", children }: ShellProps) {
  const header = useRef<HTMLElement>(null);

  // Keep `scroll-padding-top` on <html> equal to the sticky header's bottom edge, so a field that takes focus (Tab, or
  // an in-page jump) scrolls clear of the glass header instead of sitting under it. Not sticky (short landscape
  // screens)? Then only a small gap.
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => {
      const style = getComputedStyle(el);
      const stuck = style.position === "sticky" ? parseFloat(style.top) || 0 : 0;
      // The property itself, not a custom property that the rule below reads: a custom property set on <html> is
      // inherited, so changing it restyles every element of the page (75 ms of style recalculation at 4x CPU).
      root.style.scrollPaddingTop = `${Math.ceil(stuck + (style.position === "sticky" ? el.offsetHeight : 0)) + 16}px`;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("scroll-padding-top");
    };
  }, []);
  // The "Preview on a phone" frame is this same page in a 390 px iframe, scrolled to one example. Assistive tech sees both
  // documents as one tree, so every landmark would exist twice (landmark-unique): inside the frame only the example stays
  // live and named for the frame, and the rest of the page is inert (not focusable, not announced).
  useEffect(() => {
    if (window.self === window.top) return;
    const root = document.getElementById("root");
    if (!root) return;
    // Lazy islands and late sections keep arriving after hydration, so the rule is re-applied as the page grows.
    const apply = () => {
      const id = window.location.hash.length > 1 ? decodeURIComponent(window.location.hash.slice(1)) : "";
      const heading = id ? document.getElementById(id) : null;
      const target = heading?.closest("section");
      if (!heading || !target) return;
      for (let node: HTMLElement | null = target; node && node !== root; node = node.parentElement) {
        for (const sibling of node.parentElement?.children ?? []) {
          if (sibling !== node && !(sibling as HTMLElement).inert) (sibling as HTMLElement).inert = true;
        }
      }
      document.getElementById("main")?.setAttribute("aria-label", "Phone preview");
      // The toaster region is portaled to <body>, outside the page tree above: it exists in the page and in the frame.
      for (const region of document.querySelectorAll('[data-slot="toaster"]')) {
        const name = region.getAttribute("aria-label") ?? "";
        if (name && !name.endsWith("(phone preview)")) region.setAttribute("aria-label", `${name} (phone preview)`);
      }
      if (target.hasAttribute("aria-labelledby")) {
        target.removeAttribute("aria-labelledby");
        target.setAttribute("aria-label", `${heading.textContent} (phone preview)`);
      }
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [path]);
  function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
    // The router owns the hash, so jump with focus instead of "#main".
    event.preventDefault();
    focusMainHeading();
    document.getElementById("main")?.scrollIntoView({ block: "start" });
  }

  return (
    <>
      <a
        href="#main"
        onClick={skipToContent}
        className="glass-3 fixed top-[max(0.75rem,env(safe-area-inset-top))] start-[max(0.75rem,env(safe-area-inset-left))] rtl:start-[max(0.75rem,env(safe-area-inset-right))] z-[100] inline-flex min-h-11 -translate-y-[200%] items-center rounded-sheen-full px-4 text-sm font-semibold focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Route-loading hint: opacity only, appears after a short delay so fast loads never flash it. */}
      <div
        aria-hidden
        className={cn(
          "sheen-fill pointer-events-none fixed inset-x-0 top-0 z-[90] h-0.5 [background-image:var(--sheen-accent-fill)] transition-opacity",
          pending
            ? "opacity-100 delay-200 duration-(--sheen-duration-base)"
            : "opacity-0 duration-(--sheen-duration-exit)",
        )}
      />

      <p role="status" className="sr-only">
        {announcement}
      </p>

      {/*
        viewport-fit=cover (index.html) lets the page run under notches and the home indicator,
        so every edge padding and sticky offset is at least the device's safe-area inset.
      */}
      <div className="mx-auto flex min-h-dvh max-w-[90rem] gap-8 pt-[max(1rem,env(safe-area-inset-top))] [@media(max-height:30rem)]:pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] lg:pt-[max(1.5rem,env(safe-area-inset-top))] lg:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Desktop sidebar */}
        <aside
          aria-label="Site"
          className="sticky top-[max(1.5rem,env(safe-area-inset-top))] hidden h-[calc(100dvh-max(1.5rem,env(safe-area-inset-top))-max(1.5rem,env(safe-area-inset-bottom)))] w-60 shrink-0 lg:block"
        >
          <div className="glass-2 flex h-full flex-col rounded-sheen-xl p-4">
            <Brand />
            {/* Its own hydration boundary: 127 links hydrate in a task of their own (see Deferred). */}
            <Deferred>
              <Nav
                path={path}
                label="Documentation"
                className="[mask-image:linear-gradient(to_bottom,transparent,#000_0.5rem,#000_calc(100%-1.25rem),transparent)] pt-2 -mt-2"
              />
            </Deferred>
            <p className="mt-auto px-2 pt-4 text-xs text-sheen-fg-muted">v0.1 · MIT</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <header
            ref={header}
            className="glass-2 [@media(min-height:30rem)]:sticky top-[max(1rem,env(safe-area-inset-top))] z-40 flex items-center justify-between gap-3 rounded-sheen-xl px-3 py-2.5 sm:px-4 lg:any-pointer-coarse:min-h-20 lg:top-[max(1.5rem,env(safe-area-inset-top))] lg:py-3 [@media(max-height:30rem)]:py-1.5"
          >
            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <MobileMenu path={path} />
              {/* Below 25rem the wordmark is dropped (the mark stays): the 44px touch controls on the right need the room. */}
              <a
                href={href("/")}
                className="flex min-w-0 items-center overflow-hidden rounded-sheen-sm any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11 any-pointer-coarse:justify-center"
                aria-label="SheenUI home"
              >
                <SheenLogo px={28} className="max-w-full max-[25rem]:[&>span]:hidden" />
              </a>
            </div>
            <PreferenceBar compact className="hidden min-w-0 lg:flex" />
            {/* min-w is the final width of the cluster under lg (measured: 4 or 3 controls, fine or coarse pointer): a slow connection paints
                the header while its HTML is still arriving, and a cluster that grows child by child would push the first controls left. */}
            <div className="flex min-w-32 shrink-0 items-center gap-1.5 min-[22.5rem]:min-w-[10.8rem] sm:min-w-[18.9rem] sm:gap-2 any-pointer-coarse:min-w-36 any-pointer-coarse:min-[22.5rem]:min-w-[12.1rem] any-pointer-coarse:sm:min-w-[19.4rem] lg:min-w-0 lg:flex-1 lg:justify-end lg:any-pointer-coarse:min-w-0">
              <SiteSearch />
              {/* Below 360px the header has no room for it; the Style switch is in the menu's preference bar. */}
              <StyleToggle className="hidden min-[22.5rem]:inline-flex lg:hidden" />
              <ThemeToggle className="lg:hidden" />
              <a
                href={REPO}
                target="_blank"
                rel="noopener"
                aria-label="SheenUI on GitHub (opens in a new tab)"
                className="glass-1 inline-flex h-9 min-w-9 shrink-0 items-center justify-center gap-2 rounded-sheen-full px-2.5 text-sm font-medium transition-colors hover:text-sheen-accent sm:px-3.5 any-pointer-coarse:h-11 any-pointer-coarse:min-w-11"
              >
                <GithubIcon /> <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </header>

          <main id="main" aria-busy={pending || undefined} className="min-w-0 scroll-mt-28 pb-10 outline-none">
            {children}
          </main>

          <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-sheen-border pt-6 text-sm text-sheen-fg-muted">
            <span>
              Designed &amp; built by <strong className="font-semibold text-sheen-fg">Lokendra Singh Rathore</strong>
            </span>
            <a
              href={href("/about")}
              className="inline-flex items-center rounded-sheen-sm underline-offset-4 hover:text-sheen-fg hover:underline any-pointer-coarse:min-h-11"
            >
              About SheenUI
            </a>
            <a
              href={REPO}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-sheen-sm underline-offset-4 hover:text-sheen-fg hover:underline any-pointer-coarse:min-h-11"
            >
              <span aria-hidden>⭐</span> Star SheenUI on GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </footer>
        </div>
      </div>
    </>
  );
}

const loadMenu = () => import("./MobileMenuDialog");
const MobileMenuDialog = lazy(loadMenu);

/** The menu button. The dialog itself (Base UI Dialog + scroll lock) is fetched on hover, focus or idle, never up front. */
function MobileMenu({ path }: { path: string }) {
  const [requested, setRequested] = useState(false);
  const [open, setOpen] = useState(false);
  // When a link navigates away, focus goes to the new page's h1, not back to the menu button.
  const navigatingAway = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);

  // The button only exists below lg: on a phone or tablet, fetch the menu once the page is idle.
  useEffect(() => {
    if (window.matchMedia("(min-width: 64rem)").matches) return;
    // Safari has no requestIdleCallback: typed as optional here, so the fallback is a real branch.
    const scheduler: {
      requestIdleCallback?: Window["requestIdleCallback"];
      cancelIdleCallback?: Window["cancelIdleCallback"];
    } = window;
    const idle: (cb: () => void, options?: IdleRequestOptions) => number =
      scheduler.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 1500));
    const cancel: (handle: number) => void = scheduler.cancelIdleCallback ?? ((handle) => window.clearTimeout(handle));
    const id = idle(() => void loadMenu(), { timeout: 4000 });
    return () => cancel(id);
  }, []);

  return (
    <>
      <Button
        ref={trigger}
        variant="glass"
        size="icon"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="any-pointer-coarse:size-11"
        onPointerEnter={() => void loadMenu()}
        onFocus={() => void loadMenu()}
        onClick={() => {
          navigatingAway.current = false;
          setRequested(true);
          setOpen(true);
        }}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </Button>
      {requested && (
        <Suspense fallback={null}>
          <MobileMenuDialog
            path={path}
            open={open}
            onOpenChange={setOpen}
            onNavigate={(to) => {
              navigatingAway.current = to !== path;
            }}
            returnFocus={() => (navigatingAway.current ? false : trigger.current)}
          />
        </Suspense>
      )}
    </>
  );
}

/* ---------- Quick style switch for small screens (the full bar lives in the menu) ---------- */

function StyleToggle({ className }: { className?: string }) {
  const { style, setStyle } = useSheenStyle();
  const aurora = style === "aurora";

  return (
    <Button
      variant="glass"
      size="icon"
      aria-label={aurora ? "Switch to the Liquid Glass style" : "Switch to the Aurora Neon style"}
      onClick={() => setStyle(aurora ? "liquid" : "aurora")}
      className={cn("any-pointer-coarse:size-11", className)}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {aurora ? (
          // Aurora: curtains of light
          <path d="M3 16c3-6 5-6 8 0s5 6 8 0M3 9c3-5 5-5 8 0s5 5 8 0" />
        ) : (
          // Liquid: a drop
          <path d="M12 3.5c3.5 4.5 6 7.6 6 10.5a6 6 0 0 1-12 0c0-2.9 2.5-6 6-10.5ZM9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
        )}
      </svg>
    </Button>
  );
}

/* ---------- Quick light/dark switch for small screens (the full bar lives in the menu) ---------- */

const darkQuery = "(prefers-color-scheme: dark)";
function subscribeDark(onChange: () => void) {
  const mq = window.matchMedia(darkQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function ThemeToggle({ className }: { className?: string }) {
  const { theme, sweepTo } = useThemeWave();
  const systemDark = useSyncExternalStore(
    subscribeDark,
    () => window.matchMedia(darkQuery).matches,
    () => false,
  );
  const dark = theme === "dark" || (theme === "system" && systemDark);

  return (
    <Button
      variant="glass"
      size="icon"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={(event) => sweepTo(dark ? "light" : "dark", event.currentTarget)}
      className={cn("any-pointer-coarse:size-11", className)}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {dark ? (
          <path d="M12 4V2M12 22v-2M4.93 4.93 3.51 3.51M20.49 20.49l-1.42-1.42M4 12H2M22 12h-2M4.93 19.07l-1.42 1.42M20.49 3.51l-1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </Button>
  );
}
