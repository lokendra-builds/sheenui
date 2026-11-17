"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { PreviewCard } from "@base-ui/react/preview-card";

import { cn, classNameWith } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { createLightFollower } from "../../motion/light-follower";
import { popupMotion } from "../../lib/popup-motion";
import { popupA11yProps } from "../../lib/popup-a11y";
import { Avatar, type AvatarProps } from "../avatar/avatar";

/* ---------- Root ---------- */

type HoverCardContextValue = {
  handle: PreviewCard.Handle<unknown>;
  /** The card was opened by a tap (touch), so a second tap on the trigger follows the link. */
  openedByTouch: boolean;
  setOpenedByTouch: (value: boolean) => void;
};

const HoverCardContext = createContext<HoverCardContextValue | null>(null);

/** Lets a detached trigger (outside <HoverCard>, linked by `handle`) report a tap to its card. */
const touchRegistry = new WeakMap<object, (value: boolean) => void>();

/** Props of `HoverCard`; each option is documented on its field. */
export type HoverCardProps<Payload = unknown> = PreviewCard.Root.Props<Payload>;

/**
 * Hover card: a glass preview of what is behind a link (a profile, a page) shown on hover or keyboard focus, after a short delay so passing the pointer over a link does nothing. Use it as an extra for links; use `Popover` for interactive content and `Tooltip`
 * for a short label. This is the root: it holds the open state (`open`, `defaultOpen`, `onOpenChange`). Compose `HoverCardTrigger` and `HoverCardContent`; pass a `handle` (from `createHoverCardHandle()`) to link triggers rendered elsewhere.
 *
 * Touch screens can't hover, so the first tap on the trigger opens the card and a second tap follows the link (a tap outside closes it).
 * Keyboard: focusing the link opens it, Escape closes it.
 * Accessibility: the card is a visual extra: its content is not reachable by Tab or read by screen readers (Base UI keeps the link as the one accessible element). Keep anything essential on the page the link goes to, and don't put buttons in the card.
 * Glass and motion: the `glass-3` popup itself fades and springs out of the trigger (transform-origin follows the side it opens on) and drifts 4px away from it; content rows rise in, staggered. Exit is shorter and never overshoots. Reduced motion: fades only.
 *
 * Built on Base UI Preview Card: https://base-ui.com/react/components/preview-card
 *
 * @example
 * ```tsx
 * import { HoverCard, HoverCardContent, HoverCardTrigger, ProfilePreview } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <HoverCard>
 *       <HoverCardTrigger href="https://github.com/ada">@ada</HoverCardTrigger>
 *       <HoverCardContent padded={false}>
 *         <ProfilePreview name="Ada Lovelace" handle="ada" bio="Wrote the first program." />
 *       </HoverCardContent>
 *     </HoverCard>
 *   );
 * }
 * ```
 *
 * @see /overlays/hover-card
 */
export function HoverCard<Payload = unknown>({ handle: handleProp, onOpenChange, ...props }: HoverCardProps<Payload>) {
  // A handle lets a tap open the card imperatively (Base UI only opens it on mouse hover and focus).
  const [ownHandle] = useState(() => PreviewCard.createHandle<Payload>());
  const handle = handleProp ?? ownHandle;
  const [openedByTouch, setOpenedByTouchState] = useState(false);
  // Read synchronously by onOpenChange: the compatibility mouse events of a tap arrive before React re-renders.
  const touchOpenRef = useRef(false);
  const setOpenedByTouch = useCallback((value: boolean) => {
    touchOpenRef.current = value;
    setOpenedByTouchState(value);
  }, []);
  const context = useMemo(
    // Triggers only call open(id) on it, which does not depend on the payload type.
    () => ({ handle, openedByTouch, setOpenedByTouch }),
    [handle, openedByTouch, setOpenedByTouch],
  );

  useEffect(() => {
    touchRegistry.set(handle, setOpenedByTouch);
    return () => {
      touchRegistry.delete(handle);
    };
  }, [handle, setOpenedByTouch]);

  // Base UI's preview card closes on hover-leave, focus-out and Escape, none of which a finger produces: a tap
  // anywhere outside the trigger and the card closes a touch-opened card.
  useEffect(() => {
    if (!openedByTouch) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('[data-slot="hover-card-content"],[data-slot="hover-card-trigger"]')
      ) {
        return;
      }
      handle.close();
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [openedByTouch, handle]);

  return (
    <HoverCardContext value={context}>
      <PreviewCard.Root<Payload>
        handle={handle}
        onOpenChange={(open, details) => {
          // A tap-opened card ignores the hover-leave that browsers synthesise right after a tap (mouseleave and
          // friends within the compatibility window): it closes on an outside tap, Escape or a second tap only.
          if (!open && touchOpenRef.current && details.reason === "trigger-hover") {
            details.cancel();
            return;
          }
          if (!open) setOpenedByTouch(false);
          onOpenChange?.(open, details);
        }}
        {...props}
      />
    </HoverCardContext>
  );
}

/** Connects one HoverCard to triggers rendered elsewhere; pass `payload` on each trigger. */
export const createHoverCardHandle = PreviewCard.createHandle;

/* ---------- Trigger ---------- */

/**
 * Props of `HoverCardTrigger`: the `PreviewCard.Trigger` props plus SheenUI's own options, each
 * documented on its field.
 */
export type HoverCardTriggerProps = ComponentProps<typeof PreviewCard.Trigger> & {
  /** "link" (default): accent underlined text for links in a sentence. "plain": only the focus ring (avatars, chips). */
  variant?: "link" | "plain";
};

const triggerVariants = {
  link: cn(
    "rounded-sheen-sm font-medium text-sheen-accent underline decoration-sheen-accent/40 decoration-1 underline-offset-[3px]",
    "transition-[text-decoration-color] duration-(--sheen-duration-fast) hover:decoration-sheen-accent data-popup-open:decoration-sheen-accent",
  ),
  plain: cn(
    "relative inline-flex rounded-sheen-sm",
    // At least 44 × 44 to tap on touch screens, centred on the trigger (avatars are often 40px).
    "any-pointer-coarse:after:absolute any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:left-1/2 any-pointer-coarse:after:size-full any-pointer-coarse:after:min-h-11 any-pointer-coarse:after:min-w-11 any-pointer-coarse:after:-translate-1/2",
  ),
} as const;

/**
 * The link that opens the card. Renders an `<a>`; pass `href`. Hover delay: `delay` (default 500) / `closeDelay` (default 250), in ms.
 * `variant="link"` is accent underlined text for links in a sentence; `"plain"` leaves only the focus ring (avatars, chips). Pass a `handle` from `createHoverCardHandle()` to link a trigger that is outside `<HoverCard>`.
 *
 * Keyboard: focusing the link opens the card after the delay, Escape closes it, Enter follows the link. Touch: the first tap opens the card, a second tap follows the link.
 * Accessibility: the link is the one accessible element; the card is not announced (see `HoverCard`). Plain triggers get a 44px tap area on touch screens.
 * Glass and motion: none of its own (only the underline colour fades).
 *
 * @example
 * ```tsx
 * import { HoverCardTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <HoverCardTrigger href="https://github.com/ada">@ada</HoverCardTrigger>
 *   );
 * }
 * ```
 *
 * @see /overlays/hover-card
 */
export function HoverCardTrigger({
  variant = "link",
  className,
  id,
  handle: handleProp,
  delay = 500,
  closeDelay = 250,
  onPointerDown,
  onPointerCancel,
  onClick,
  ...props
}: HoverCardTriggerProps) {
  const context = useContext(HoverCardContext);
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const lastPointer = useRef("");
  const handle = handleProp ?? context?.handle;

  return (
    <PreviewCard.Trigger
      id={triggerId}
      handle={handle}
      delay={delay}
      closeDelay={closeDelay}
      data-slot="hover-card-trigger"
      onPointerDown={(event) => {
        lastPointer.current = event.pointerType;
        onPointerDown?.(event);
      }}
      onPointerCancel={(event) => {
        // The touch turned into a scroll: no tap follows.
        lastPointer.current = "";
        onPointerCancel?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        const pointer = lastPointer.current;
        lastPointer.current = "";
        // Keyboard "clicks" (Enter: detail 0) always follow the link, whatever touched it before.
        if (event.defaultPrevented || !handle || pointer !== "touch" || event.detail === 0) return;
        // First tap: show the preview instead of navigating. Second tap (card open): follow the link.
        if (!event.currentTarget.hasAttribute("data-popup-open")) {
          event.preventDefault();
          (context?.setOpenedByTouch ?? touchRegistry.get(handle))?.(true);
          handle.open(triggerId);
        }
      }}
      className={classNameWith(className, (extra) =>
        cn(
          triggerVariants[variant],
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "[-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]",
          extra,
        ),
      )}
      {...props}
    />
  );
}

/* ---------- Content ---------- */

/**
 * Props of `HoverCardContent`: the `PreviewCard.Popup` props plus SheenUI's own options, each
 * documented on its field.
 */
export type HoverCardContentProps = ComponentProps<typeof PreviewCard.Popup> & {
  /** Preferred side of the trigger; it flips when there is no room. Default "bottom". */
  side?: "top" | "bottom" | "left" | "right";
  /** Sets the alignment along that side. Default "center". */
  align?: "start" | "center" | "end";
  /** Gap between the trigger and the card, in px. Default 10. */
  sideOffset?: number;
  /** Pad the content (1rem). Turn off for edge-to-edge content such as LinkPreview's image. Default true. */
  padded?: boolean;
  /**
   * Shown under the content when a tap opened the card, so touch users know how to follow the
   * link. Pass null to hide it (e.g. when the trigger is not a link). Default "Tap the link again to open it.".
   */
  touchHint?: ReactNode | null;
  /** Where to portal the card (defaults to <body>). */
  container?: ComponentProps<typeof PreviewCard.Portal>["container"];
  /** The card's content: your own markup, `ProfilePreview` or `LinkPreview`. */
  children?: ReactNode;
};

/**
 * The glass card, portalled to the end of the body and positioned next to the trigger. `side`, `align` and `sideOffset` place it; `padded` (default on) pads the content, turn it off for edge-to-edge content such as `LinkPreview`'s image; `touchHint` is the line shown after a tap
 * (pass null when the trigger is not a link); `container` chooses where it portals. A specular highlight follows the pointer across the glass (mouse and pen only).
 *
 * Keyboard: not reachable by Tab (see `HoverCard`). Accessibility: not announced; keep it to visual extras. Glass and motion: `glass-3` surface; spring-scale enter, quicker exit; reduced motion fades only.
 *
 * @example
 * ```tsx
 * import { HoverCardContent } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <HoverCardContent side="top" align="start" touchHint={null}>
 *       <p>Docs for the Button component.</p>
 *     </HoverCardContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/hover-card
 */
export function HoverCardContent({
  className,
  side = "bottom",
  align = "center",
  sideOffset = 10,
  padded = true,
  touchHint = "Tap the link again to open it.",
  container,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: HoverCardContentProps) {
  const context = useContext(HoverCardContext);
  const reduced = useSheenReducedMotion();
  const layerRef = useRef<HTMLSpanElement>(null);
  const followerRef = useRef<ReturnType<typeof createLightFollower> | null>(null);
  useEffect(() => () => followerRef.current?.stop(), []);

  // Specular highlight that follows the pointer across the glass (mouse and pen only): a pre-painted layer moved with
  // `translate` (composited, as on GlassCard), never a gradient position rewritten per move.
  function handlePointerMove(event: Parameters<NonNullable<HoverCardContentProps["onPointerMove"]>>[0]) {
    onPointerMove?.(event);
    // Reduced motion: the highlight stays where it rests (static) instead of following the pointer.
    const layer = layerRef.current;
    if (event.pointerType === "touch" || reduced || !layer) return;
    followerRef.current ??= createLightFollower((x, y) => {
      layer.style.translate = `calc(-50% + ${x}px) calc(-50% + ${y}px)`;
    });
    const rect = event.currentTarget.getBoundingClientRect();
    followerRef.current.to(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top);
  }

  function handlePointerLeave(event: Parameters<NonNullable<HoverCardContentProps["onPointerLeave"]>>[0]) {
    onPointerLeave?.(event);
    followerRef.current?.reset();
  }
  return (
    <PreviewCard.Portal container={container}>
      <PreviewCard.Positioner
        {...popupA11yProps}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={16}
        className="z-50"
      >
        <PreviewCard.Popup
          data-slot="hover-card-content"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className={classNameWith(className, (extra) =>
            cn(
              "glass-2 glass-sheen w-80 max-w-[calc(100vw-2rem)] origin-(--transform-origin) overflow-hidden rounded-sheen-lg text-sm outline-none",
              popupMotion,
              "data-instant:transition-none",
              extra,
            ),
          )}
          {...props}
        >
          <span
            aria-hidden
            data-slot="glass-card-sheen"
            className="pointer-events-none absolute inset-0 -z-10 overflow-clip rounded-[inherit] opacity-(--sheen-glow,0.7) forced-colors:hidden"
          >
            <span
              ref={layerRef}
              className="absolute top-0 left-1/2 size-[504px] -translate-x-1/2 -translate-y-1/2 will-change-transform [background:radial-gradient(circle_closest-side,var(--sheen-glass-sheen),transparent)]"
            />
          </span>
          <div data-slot="hover-card-body" className={padded ? "p-4" : undefined}>
            {children}
          </div>
          {context?.openedByTouch && touchHint !== null && (
            <p className="flex items-center gap-1.5 border-t border-sheen-border bg-sheen-hover px-4 py-2.5 text-xs text-sheen-fg-muted">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
              {touchHint}
            </p>
          )}
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  );
}

/* ---------- Rich content presets ---------- */

/** Content rows rise in one after another (transform only: they sit inside the glass). */
const rise = "motion-ok:animate-[sheen-item-in_var(--sheen-duration-snappy)_var(--sheen-ease-snappy)_both]";
const riseDelay = (step: number): CSSProperties => ({ animationDelay: `${step * 40}ms` });

/** One count shown in a `ProfilePreview` card: a label and a number (or a ready string). */
export type ProfilePreviewStat = {
  /** What the number counts, e.g. "Followers". */
  label: string;
  /** The number (shortened for the locale) or a ready string. */
  value: number | string;
};

/** Props of `ProfilePreview`; each option is documented on its field. */
export type ProfilePreviewProps = {
  /** Shows the person's name as the card heading. */
  name: string;
  /** Sets the username, shown as "@handle". */
  handle?: string;
  /** Avatar image URL; without it the avatar shows initials. */
  avatarSrc?: string;
  /** Shows the presence dot on the avatar ("online", "away", ...). */
  status?: AvatarProps["status"];
  /** Small element next to the name, e.g. <Badge tone="accent">Pro</Badge>. */
  badge?: ReactNode;
  /** Shows a line or two about the person. */
  bio?: ReactNode;
  /** Numbers are shortened for the locale (12 400 → "12.4K"). */
  stats?: ProfilePreviewStat[];
  /** Join date; formatted with Intl for `locale`. */
  joined?: Date | string | number;
  /** Wording around the formatted join date (i18n). */
  joinedLabel?: (formattedDate: string) => ReactNode;
  /** Locale for numbers and dates (defaults to the browser's). */
  locale?: string;
  /** Draws a decorative gradient band behind the avatar. Default true. */
  cover?: boolean;
  /** Adds extra classes to the card content. */
  className?: string;
};

/**
 * A date from a Date, a timestamp or a string. Date-only strings ("2021-08-01", "2021-08") are
 * read as local calendar dates: new Date("2021-08-01") would be UTC midnight, which shows as the
 * previous month anywhere west of UTC.
 */
function toDate(value: Date | string | number | undefined): Date | null {
  if (value === undefined) return null;
  const parts = typeof value === "string" ? /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value.trim()) : null;
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3] ?? 1))
    : value instanceof Date
      ? value
      : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Profile card content: avatar, name, handle, bio, stats and join date. Put it inside `HoverCardContent`. Numbers are shortened for the `locale` (12 400 becomes "12.4K"); a date-only `joined` string is read as a local calendar date.
 *
 * Keyboard: none; the card's content is not reachable by Tab. Accessibility: decorative extras only; keep anything essential on the page the link goes to. The cover band is `aria-hidden`.
 * Glass and motion: rows rise in one after another (transform only: they sit inside the glass); reduced motion removes the rise.
 *
 * @example
 * ```tsx
 * import { HoverCardContent, ProfilePreview } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <HoverCardContent padded={false}>
 *       <ProfilePreview name="Ada Lovelace" handle="ada" bio="Wrote the first program." stats={[{ label: "Followers", value: 12400 }]} joined="2021-08-01" />
 *     </HoverCardContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/hover-card
 */
export function ProfilePreview({
  name,
  handle,
  avatarSrc,
  status,
  badge,
  bio,
  stats,
  joined,
  joinedLabel = (date) => `Joined ${date}`,
  locale,
  cover = true,
  className,
}: ProfilePreviewProps) {
  const numbers = useMemo(
    () => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }),
    [locale],
  );
  const joinedText = useMemo(() => {
    const date = toDate(joined);
    return date ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date) : null;
  }, [joined, locale]);

  return (
    <div data-slot="profile-preview" className={cn("flex flex-col gap-3", className)}>
      {cover && (
        <div
          aria-hidden
          className="-mx-4 -mt-4 h-16 [background-image:var(--sheen-accent-gradient)] opacity-80 [mask-image:linear-gradient(to_bottom,black_40%,transparent)] forced-colors:hidden"
        />
      )}
      {/* The cover is hidden in forced colors: don't pull the avatar up into its (now empty) space. */}
      <div
        style={riseDelay(0)}
        className={cn("flex items-end justify-between gap-3", cover && "-mt-10 forced-colors:mt-0", rise)}
      >
        <Avatar
          name={name}
          src={avatarSrc}
          status={status}
          size="lg"
          className="rounded-full ring-4 ring-[var(--sheen-glass-2-bg)]"
        />
      </div>
      <div style={riseDelay(1)} className={cn("flex min-w-0 flex-col", rise)}>
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-base leading-tight font-semibold text-sheen-fg">{name}</p>
          {badge}
        </div>
        {handle && <p className="truncate text-sm text-sheen-fg-muted">@{handle}</p>}
      </div>
      {bio && (
        <p style={riseDelay(2)} className={cn("text-sm text-pretty text-sheen-fg", rise)}>
          {bio}
        </p>
      )}
      {((stats?.length ?? 0) > 0 || Boolean(joinedText)) && (
        <div style={riseDelay(3)} className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm", rise)}>
          {stats?.map((stat) => (
            <span key={stat.label} className="whitespace-nowrap text-sheen-fg-muted">
              <span className="font-semibold text-sheen-fg tabular-nums">
                {typeof stat.value === "number" ? numbers.format(stat.value) : stat.value}
              </span>{" "}
              {stat.label}
            </span>
          ))}
          {joinedText && (
            <span className="flex items-center gap-1.5 whitespace-nowrap text-sheen-fg-muted">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {joinedLabel(joinedText)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Props of `LinkPreview`; each option is documented on its field. */
export type LinkPreviewProps = {
  /** The page's address; its host name is shown under the title. */
  url: string;
  /** Shows the page's title as the card heading. */
  title: ReactNode;
  /** Shows one or two lines about the page. */
  description?: ReactNode;
  /** Sets the preview image (1.91 : 1, the usual social-card shape). */
  image?: string;
  /** Sets the alt text for the image. Default "" (decorative). */
  imageAlt?: string;
  /** Shown instead of the host name, e.g. "GitHub". */
  siteName?: ReactNode;
  /** Small site icon: an image URL or your own element. Defaults to the site's first letter. */
  favicon?: string | ReactNode;
  /** Adds extra classes to the card content. */
  className?: string;
};

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

type ImageStatus = "loading" | "loaded" | "error";

/**
 * Link card content: image, site, title and description. Put it inside `<HoverCardContent padded={false}>`. `url` shows its host name under the title (override with `siteName`); `image` is the preview (1.91 : 1) with `imageAlt` (empty by default: decorative);
 * `favicon` is an image URL or your own element and defaults to the site's first letter. The image fades in once loaded, and a placeholder shows until then or when it fails.
 *
 * Keyboard: none; the card is not reachable by Tab. Accessibility: the image is hidden from assistive tech unless you give `imageAlt`. Glass and motion: flat content inside the card's glass; rows rise in (transform only); reduced motion removes the rise.
 *
 * @example
 * ```tsx
 * import { HoverCardContent, LinkPreview } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <HoverCardContent padded={false}>
 *       <LinkPreview url="https://example.com/docs" title="SheenUI docs" description="Glass components for React." image="/og.png" />
 *     </HoverCardContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/hover-card
 */
export function LinkPreview({
  url,
  title,
  description,
  image,
  imageAlt = "",
  siteName,
  favicon,
  className,
}: LinkPreviewProps) {
  const host = hostOf(url);
  // Status belongs to one image: a new `image` starts loading again (and fades in again).
  const [state, setState] = useState<{ src: string | undefined; status: ImageStatus }>({
    src: image,
    status: "loading",
  });
  const status: ImageStatus = state.src === image ? state.status : "loading";
  if (state.src !== image) setState({ src: image, status: "loading" });
  const showImage = Boolean(image) && status !== "error";

  return (
    <div data-slot="link-preview" className={cn("flex flex-col", className)}>
      <div
        aria-hidden={!showImage || !imageAlt}
        className="relative aspect-[1.91/1] overflow-hidden bg-sheen-accent-soft"
      >
        {/* Decorative placeholder until (or instead of) the image. */}
        <div
          aria-hidden
          className="absolute inset-0 [background-image:var(--sheen-accent-gradient)] opacity-35 forced-colors:hidden"
        />
        {!showImage && (
          // No image (or it failed to load): a small glass badge with the site's initial, so the card still has a face.
          <span
            aria-hidden
            className="glass-1 absolute top-1/2 left-1/2 flex size-14 -translate-1/2 items-center justify-center rounded-sheen-lg text-2xl font-semibold text-sheen-accent uppercase"
          >
            {host.charAt(0)}
          </span>
        )}
        {showImage && (
          <img
            key={image}
            src={image}
            alt={imageAlt}
            decoding="async"
            // Already decoded (cached) before React attached onLoad.
            ref={(element) => {
              if (element?.complete && element.naturalWidth > 0 && status === "loading")
                setState({ src: image, status: "loaded" });
            }}
            onLoad={() => setState({ src: image, status: "loaded" })}
            onError={() => setState({ src: image, status: "error" })}
            className={cn(
              "relative size-full object-cover transition-opacity duration-(--sheen-duration-base) ease-sheen-out",
              status === "loaded" ? "opacity-100" : "opacity-0",
            )}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <p style={riseDelay(0)} className={cn("flex min-w-0 items-center gap-2 text-xs text-sheen-fg-muted", rise)}>
          {typeof favicon === "string" ? (
            <img src={favicon} alt="" className="size-4 shrink-0 rounded-[4px]" />
          ) : (
            (favicon ?? (
              <span
                aria-hidden
                className="flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-sheen-accent-soft text-2xs leading-none font-semibold text-sheen-accent uppercase"
              >
                {host.charAt(0)}
              </span>
            ))
          )}
          <span className="truncate">{siteName ?? host}</span>
        </p>
        <p style={riseDelay(1)} className={cn("line-clamp-2 text-sm leading-snug font-semibold text-sheen-fg", rise)}>
          {title}
        </p>
        {description && (
          <p style={riseDelay(2)} className={cn("line-clamp-3 text-sm text-pretty text-sheen-fg-muted", rise)}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
