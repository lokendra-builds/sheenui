"use client";

import { useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../lib/cn";
import { duration, ease, spring } from "../motion/tokens";
import { exitTransition } from "../motion/presets";
import { useControllable } from "../hooks/use-controllable";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { CheckIcon, CloseIcon, InfoIcon, WarningIcon, AlertIcon } from "../components/status-icons/icons";

/** The tones `AnnouncementBanner` can take. */
export type AnnouncementTone = "accent" | "info" | "success" | "warning" | "danger" | "neutral";

/** The optional link of an `AnnouncementBanner`. */
export type AnnouncementLink = {
  /** The link text. */
  label: string;
  /** The link target. */
  href: string;
  /** Called on click, in addition to following the link (for analytics, for example). */
  onClick?: () => void;
};

/** Every string `AnnouncementBanner` renders or announces, so the block can be translated. */
export type AnnouncementBannerLabels = {
  /** Accessible name of the banner's region. */
  region: string;
  /** Accessible name of the dismiss button. */
  dismiss: string;
  /** Polite announcement read out after the banner is dismissed. */
  dismissed: string;
};

/** The English {@link AnnouncementBannerLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultAnnouncementBannerLabels: AnnouncementBannerLabels = {
  region: "Announcement",
  dismiss: "Dismiss announcement",
  dismissed: "Announcement dismissed",
};

/** Props of `AnnouncementBanner`. */
export type AnnouncementBannerProps = {
  /** The announcement text (`ReactNode`). Keep it to a sentence; it is static copy, not a live countdown. */
  children: ReactNode;
  /**
   * The semantic colour and icon (`"accent" | "info" | "success" | "warning" | "danger" | "neutral"`). The words carry the meaning; the colour only lights the edge.
   * @default "accent"
   */
  tone?: AnnouncementTone;
  /** A link after the text (`AnnouncementLink`). */
  link?: AnnouncementLink;
  /** Replaces the tone's icon (`ReactNode`); it is `aria-hidden`. Pass `null` for none. */
  icon?: ReactNode;
  /**
   * Show the dismiss button (`boolean`).
   * @default true
   */
  dismissible?: boolean;
  /** Controls whether the banner is shown (`boolean`). Use with `onOpenChange`; leave it out to let the block keep the state. */
  open?: boolean;
  /**
   * Whether the banner is shown at first when uncontrolled (`boolean`). Pass `false` when you have already stored that this visitor dismissed it.
   * @default true
   */
  defaultOpen?: boolean;
  /** Called whenever the banner is shown or hidden (`(open: boolean) => void`). */
  onOpenChange?: (open: boolean) => void;
  /** Called once when the visitor presses dismiss (`() => void`). The block stores nothing: save the choice here (a cookie, localStorage, your account settings) and pass `defaultOpen={false}` next time. */
  onDismiss?: () => void;
  /** Where focus goes when the banner is dismissed (`RefObject<HTMLElement | null>`). Without it, focus moves to the next focusable element after the banner, or to the `<main>` landmark when there is none. */
  restoreFocusTo?: RefObject<HTMLElement | null>;
  /** Overrides for the block's strings (`Partial<AnnouncementBannerLabels>`). */
  labels?: Partial<AnnouncementBannerLabels>;
  /** Adds extra classes to the banner (`string`). */
  className?: string;
};

const toneVars: Record<AnnouncementTone, string> = {
  accent: "[--tone:var(--sheen-accent)] [--tone-glow:var(--sheen-accent-glow)]",
  // Info uses the style's second accent (teal), so it reads differently from the violet "accent" tone.
  info: "[--tone:var(--sheen-accent-2)] [--tone-glow:color-mix(in_oklch,var(--sheen-accent-2)_70%,transparent)]",
  success: "[--tone:var(--sheen-success)] [--tone-glow:var(--sheen-success-glow)]",
  warning: "[--tone:var(--sheen-warning)] [--tone-glow:var(--sheen-warning-glow)]",
  danger: "[--tone:var(--sheen-danger)] [--tone-glow:var(--sheen-danger-glow)]",
  neutral: "[--tone:var(--sheen-fg-muted)] [--tone-glow:transparent]",
};

const toneIcons: Record<AnnouncementTone, ReactNode> = {
  accent: <InfoIcon className="size-4" />,
  info: <InfoIcon className="size-4" />,
  success: <CheckIcon className="size-4" strokeWidth={2.4} />,
  warning: <WarningIcon className="size-4" />,
  danger: <AlertIcon className="size-4" />,
  neutral: <InfoIcon className="size-4" />,
};

/**
 * A dismissible announcement bar for the top of a page: one sentence, an optional link and a close button, on glass with
 * a lit edge in the tone's colour. Use it for a release, a maintenance notice or a promotion. It never counts down and
 * never stores anything: you keep the dismissal (a cookie, `localStorage`, an account setting) in `onDismiss` and pass
 * `defaultOpen={false}` on the next visit.
 *
 * Props (see `AnnouncementBannerProps`): `children`, `tone` (`"accent"`), `link` (`{ label, href, onClick? }`), `icon`,
 * `dismissible` (`true`), `open` / `defaultOpen` (`true`) / `onOpenChange`, `onDismiss`, `restoreFocusTo`, `labels`
 * (`Partial<AnnouncementBannerLabels>`), `className`.
 *
 * Keyboard: Tab reaches the link, then the dismiss button (Enter or Space dismisses it). After dismissing, focus moves
 * to `restoreFocusTo` when given, else to the next focusable element after the banner, else to the `<main>` landmark,
 * so it never drops to the top of the page; "Announcement dismissed" is announced politely.
 * Accessibility: a labelled `group` (`labels.region`; not a landmark, so several banners on a page never collide) that is not a live region, so it is not read out on load;
 * the tone's colour never carries the meaning on its own (the text does, with a tone icon that is `aria-hidden`); the
 * dismiss button has a name and a 44 px target.
 * Glass and motion: one glass surface (a single backdrop blur). It slides up by transform and fades on its own surface
 * when dismissed, faster than it entered. Reduced motion: a short fade only.
 *
 * @example
 * ```tsx
 * import { AnnouncementBanner } from "@sheenui/theme";
 *
 * // Your own storage: this banner only reports the dismissal.
 * const remember = () => window.localStorage.setItem("banner-v2", "dismissed");
 * const wasDismissed = () => window.localStorage.getItem("banner-v2") === "dismissed";
 *
 * export function Example() {
 *   return (
 *     <AnnouncementBanner
 *       tone="accent"
 *       link={{ label: "Read the notes", href: "/changelog" }}
 *       defaultOpen={!wasDismissed()}
 *       onDismiss={remember}
 *     >
 *       Version 2 is out: new blocks and a faster build.
 *     </AnnouncementBanner>
 *   );
 * }
 * ```
 *
 * @see /blocks/announcement-banner
 */
export function AnnouncementBanner({
  children,
  tone = "accent",
  link,
  icon,
  dismissible = true,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  onDismiss,
  restoreFocusTo,
  labels,
  className,
}: AnnouncementBannerProps) {
  const L = { ...defaultAnnouncementBannerLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);

  const bannerRef = useRef<HTMLDivElement>(null);
  const [announced, setAnnounced] = useState(false);

  function dismiss() {
    const target = restoreFocusTo?.current ?? nextFocusTarget(bannerRef.current);
    target?.focus({ preventScroll: true });
    setAnnounced(true);
    setOpen(false);
    onDismiss?.();
  }

  return (
    <>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="banner"
            ref={bannerRef}
            role="group"
            aria-label={L.region}
            data-slot="announcement-banner"
            data-tone={tone}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: duration.fast } }
                : { opacity: 0, y: -12, transition: exitTransition }
            }
            transition={
              reduced
                ? { duration: duration.fast }
                : { y: spring.smooth, opacity: { duration: duration.base, ease: ease.out } }
            }
            className={cn(
              "glass-2 relative isolate flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-sheen-lg py-1.5 ps-4 pe-1.5 text-sm text-sheen-fg",
              toneVars[tone],
              className,
            )}
          >
            {/* The tone's light: a wash from the leading edge and a lit hairline under the bar, behind the text. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--tone)_18%,transparent),transparent_55%)] rtl:bg-[linear-gradient(to_left,color-mix(in_oklch,var(--tone)_18%,transparent),transparent_55%)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--tone),transparent)] opacity-70"
            />

            {icon !== null && (
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-sheen-fg shadow-[0_0_0_1px_color-mix(in_oklch,var(--tone)_50%,transparent),0_0_14px_-2px_var(--tone-glow)] [&_svg]:size-4"
              >
                {icon ?? toneIcons[tone]}
              </span>
            )}

            <p className="min-w-0 flex-1 py-1.5 text-pretty">
              {children}
              {link && (
                <>
                  {" "}
                  <a
                    href={link.href}
                    onClick={link.onClick}
                    className="inline-flex min-h-6 items-center gap-1 rounded-sheen-sm font-semibold underline decoration-[color-mix(in_oklch,var(--tone)_70%,transparent)] decoration-2 underline-offset-4 hover:decoration-[var(--tone)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11"
                  >
                    {link.label}
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="size-3.5 rtl:-scale-x-100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </a>
                </>
              )}
            </p>

            {dismissible && (
              <button
                type="button"
                aria-label={L.dismiss}
                onClick={dismiss}
                className="flex size-11 shrink-0 items-center justify-center rounded-sheen-full text-sheen-fg-muted transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus"
              >
                <CloseIcon className="size-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <span role="status" className="sr-only">
        {announced && !open ? L.dismissed : ""}
      </span>
    </>
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The first focusable element after `banner` in document order, else the `<main>` landmark (made programmatically focusable). */
function nextFocusTarget(banner: HTMLElement | null): HTMLElement | null {
  if (!banner) return null;
  const next = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).find(
    (el) =>
      !banner.contains(el) &&
      Boolean(banner.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) &&
      !el.closest("[inert]") &&
      el.getClientRects().length > 0,
  );
  if (next) return next;
  const main = document.querySelector<HTMLElement>("main, [role='main']");
  if (main && !main.hasAttribute("tabindex")) main.tabIndex = -1;
  return main;
}
