import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { SheenLogo, cn } from "@sheenui/theme";

import { groups, routes } from "../routes";
import { href } from "../router";
import { HUBS } from "../seo/hubs";

/** The SheenUI logo and wordmark link in the docs header. */
export function Brand() {
  return (
    <a
      href={href("/")}
      className="mb-6 flex w-fit items-center rounded-sheen-sm px-2 pt-1 any-pointer-coarse:min-h-11"
      aria-label="SheenUI home"
    >
      <SheenLogo px={32} />
    </a>
  );
}

/* ---------- Docs navigation: collapsible sections with distinct headings ---------- */

/** Small 16px stroke icons, one per section. Unknown sections fall back to `default`. */
const GROUP_ICONS: Record<string, ReactNode> = {
  Start: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" />,
  Components: <path d="M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z" />,
  Forms: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />,
  Overlays: <path d="M12 4 3 9l9 5 9-5-9-5ZM3 14l9 5 9-5" />,
  Navigation: <path d="M4 6h16M4 12h10M4 18h16" />,
  Layout: <path d="M4 4h16v16H4zM4 10h16M10 10v10" />,
  "Data display": <path d="M4 5h16v14H4zM8 9h8M8 13h5" />,
  Chat: <path d="M5 5h14v10H10l-4 4v-4H5z" />,
  Charts: <path d="M5 20V11M12 20V5M19 20v-6M3 20h18" />,
  Dashboards: <path d="M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z" />,
  Effects: <path d="M5 19 15 9M14 4v3M19 9h-3M17.5 5.5l-2 2M9 4.5v2M4 9h2" />,
  Blocks: <path d="M4 4h16v6H4zM4 13h7v7H4zM14 13h6v7h-6z" />,
  default: <path d="M5 5h14v14H5z" />,
};

const COLLAPSED_KEY = "sheen:nav-collapsed";

function readCollapsed(): string[] {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((g): g is string => typeof g === "string") : [];
  } catch {
    return [];
  }
}

/**
 * The docs navigation. Each section has a prominent, clickable heading (icon chip, name,
 * page count, chevron) that opens or closes it; the choice is remembered. The section that
 * holds the current page is always open. Links sit under a guide line, indented beneath
 * their heading, so the hierarchy reads at a glance.
 *
 * Each instance gets its own landmark label (sidebar vs. menu), so screen-reader landmark
 * lists can tell them apart.
 */
export function Nav({
  path,
  label,
  onNavigate,
  className,
}: {
  path: string;
  label: string;
  onNavigate?: (to: string) => void;
  /** The sidebar scrolls the list itself; the phone menu lets the dialog scroll instead. */
  className?: string;
}) {
  const idPrefix = useId();
  // Every section starts open, which is what the prerendered HTML shows; the saved choice is
  // applied after mount so hydration never sees a different tree.
  const [collapsed, setCollapsed] = useState<string[]>([]);
  useEffect(() => {
    const saved = readCollapsed();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- applied after mount on purpose: hydration must see the same tree as the prerendered HTML
    if (saved.length > 0) setCollapsed(saved);
  }, []);

  // Keep the current page in view inside the sidebar's own scroller (never scrolls the page itself).
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (!nav || !link || nav.scrollHeight <= nav.clientHeight) return;
    const navBox = nav.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    const top = linkBox.top - navBox.top + nav.scrollTop;
    const pad = 48;
    if (top < nav.scrollTop + pad || top + linkBox.height > nav.scrollTop + nav.clientHeight - pad) {
      nav.scrollTop = Math.max(0, top - nav.clientHeight / 2 + linkBox.height / 2);
    }
  }, [path]);

  function toggle(group: string) {
    setCollapsed((current) => {
      const next = current.includes(group) ? current.filter((g) => g !== group) : [...current, group];
      try {
        localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
      } catch {
        /* storage blocked: the choice just isn't remembered */
      }
      return next;
    });
  }

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className={cn(
        "relative -mx-1 -me-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-1 pe-2 pb-1 [scrollbar-width:thin]",
        className,
      )}
    >
      {groups.map((group) => {
        const items = routes.filter((r) => r.group === group && !r.hidden);
        if (items.length === 0) return null;
        const holdsCurrent = items.some((r) => r.path === path);
        const open = holdsCurrent || !collapsed.includes(group);
        // An id can't contain spaces: aria-controls is a space-separated id list ("Data display" broke it).
        const listId = `${idPrefix}-${group.toLowerCase().replace(/\s+/g, "-")}`;

        return (
          <section key={group} className="flex flex-col">
            {/* A div, not an h2: 13 navigation headings before the page's h1 would swamp its outline. */}
            <div>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={listId}
                // The current page's section can't be closed (it would hide where you are).
                aria-disabled={holdsCurrent || undefined}
                onClick={() => !holdsCurrent && toggle(group)}
                className={cn(
                  "group/heading flex w-full items-center gap-2.5 rounded-sheen-md px-2 py-1.5 text-start",
                  "transition-colors duration-(--sheen-duration-fast) any-pointer-coarse:min-h-11",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                  holdsCurrent ? "cursor-default" : "hover:bg-sheen-hover",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-sheen-sm border transition-colors duration-(--sheen-duration-fast)",
                    holdsCurrent
                      ? "sheen-fill border-transparent text-white [background-image:var(--sheen-accent-fill)] forced-colors:border-[CanvasText]"
                      : "border-sheen-accent-border bg-sheen-accent-soft text-sheen-accent",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {GROUP_ICONS[group] ?? GROUP_ICONS.default}
                  </svg>
                </span>
                <span className="flex-1 text-xs font-semibold tracking-[0.08em] text-sheen-fg uppercase">{group}</span>
                <span className="rounded-sheen-full bg-sheen-hover px-1.5 py-0.5 text-2xs font-medium text-sheen-fg-muted tabular-nums">
                  <span className="sr-only">, </span>
                  {items.filter((r) => !HUBS[r.path]).length}
                  <span className="sr-only"> pages</span>
                </span>
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className={cn(
                    "size-3.5 shrink-0 text-sheen-fg-muted motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
                    open ? "rotate-0" : "-rotate-90 rtl:rotate-90",
                    holdsCurrent && "opacity-0",
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            {/*
              Height animates with grid rows 0fr ↔ 1fr (no measuring). Closed sections are
              `inert`, so their links leave the tab order and the accessibility tree.
            */}
            <div
              id={listId}
              inert={!open}
              className={cn(
                "grid motion-ok:transition-[grid-template-rows] motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <ul className="ms-[1.375rem] flex min-h-0 flex-col gap-0.5 overflow-hidden border-s border-sheen-border ps-2.5 pt-1 pb-2">
                {items.map((r) => {
                  const active = r.path === path;
                  return (
                    <li key={r.path} className="relative">
                      {active && (
                        <span
                          aria-hidden
                          className="sheen-fill absolute top-1.5 bottom-1.5 -start-[0.6875rem] w-0.5 rounded-full [background-image:var(--sheen-accent-fill)] forced-colors:bg-[Highlight]"
                        />
                      )}
                      <a
                        href={href(r.path)}
                        onClick={() => onNavigate?.(r.path)}
                        onPointerEnter={r.preload}
                        onFocus={r.preload}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex rounded-sheen-sm px-2.5 py-1.5 text-[0.8125rem] transition-colors duration-(--sheen-duration-fast) any-pointer-coarse:min-h-11 any-pointer-coarse:items-center any-pointer-coarse:py-2.5",
                          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
                          active
                            ? "bg-sheen-accent-soft font-medium text-sheen-accent forced-colors:outline forced-colors:outline-1"
                            : "text-sheen-fg-muted hover:bg-sheen-hover hover:text-sheen-fg",
                        )}
                      >
                        {r.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        );
      })}
    </nav>
  );
}
