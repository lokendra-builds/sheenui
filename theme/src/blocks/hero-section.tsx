"use client";

import { useId, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "../lib/cn";
import { duration, spring, distance } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { HEADING_TAGS, type HeadingLevelOption } from "../lib/heading";
import { Button } from "../components/button/button";

/** One call-to-action of `HeroSection`: a link when `href` is given, otherwise a button that calls `onClick`. */
export type HeroAction = {
  /** The button text. */
  label: string;
  /** Link target; the action renders as an anchor when it is set. */
  href?: string;
  /** Called on click (for a button, or in addition to following a link). */
  onClick?: () => void;
};

/** One entry of the logo strip: a wordmark or logo node plus the name screen readers hear. */
export type HeroLogo = {
  /** Stable key and the accessible name. */
  name: string;
  /** Artwork (an inline `<svg>`, an `<img alt="">`). Without it the name is shown as a text wordmark. */
  logo?: ReactNode;
};

/** Every string `HeroSection` adds around your content, so the block can be translated. */
export type HeroSectionLabels = {
  /** Accessible name of the `<section>` when `headingLevel` is `"none"` and there is no heading to name it. */
  region: string;
  /** Visible line above the logo strip. */
  logosTitle: string;
};

/** The English {@link HeroSectionLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultHeroSectionLabels: HeroSectionLabels = {
  region: "Introduction",
  logosTitle: "Trusted by teams at",
};

/** Props of `HeroSection`. */
export type HeroSectionProps = {
  /** Small pill above the headline (`ReactNode`), for a release note or a category. */
  eyebrow?: ReactNode;
  /** The headline (`ReactNode`). Wrap a phrase in `<em>` to light it with the accent. */
  title: ReactNode;
  /** Sets the lede that sits under the headline (`ReactNode`). */
  description?: ReactNode;
  /** The main call to action (`HeroAction`). */
  primaryAction?: HeroAction;
  /** The quieter call to action next to it (`HeroAction`). */
  secondaryAction?: HeroAction;
  /** A product shot, video or live demo shown in a glass frame (`ReactNode`). Below the copy when centered, beside it when `align="start"`. */
  media?: ReactNode;
  /** Classes for the media frame (`string`), e.g. an aspect ratio. */
  mediaClassName?: string;
  /**
   * What sits behind the copy (`ReactNode`): pass a `SheenScene`, an image or your own art. Omit it for the built-in
   * aurora of token colours; pass `null` for none. It is decorative and hidden from assistive technology.
   */
  background?: ReactNode;
  /** The logo strip under the hero (`HeroLogo[]`). It is a labelled list. */
  logos?: HeroLogo[];
  /**
   * Alignment of the copy: `"center"` stacks everything on the middle line, `"start"` aligns it to the start edge
   * and puts `media` beside it.
   * @default "center"
   */
  align?: "center" | "start";
  /**
   * Level of the headline (`1` to `6`); `"none"` renders a paragraph with no heading role (for an example).
   * A landing page's hero is usually its `h1`: pass `headingLevel={1}`.
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** Overrides for the block's strings (`Partial<HeroSectionLabels>`). */
  labels?: Partial<HeroSectionLabels>;
  /** Adds extra classes to the section (`string`). */
  className?: string;
};

/** The built-in backdrop: token-coloured radial lights over a faint grid. Drawn in CSS only, no filter, no loop. */
function AuroraBackground() {
  return (
    <div aria-hidden data-slot="hero-background" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_12%_0%,var(--sheen-blob-1),transparent_70%),radial-gradient(55%_50%_at_92%_8%,var(--sheen-blob-2),transparent_70%),radial-gradient(50%_45%_at_60%_100%,var(--sheen-blob-3),transparent_72%),radial-gradient(40%_40%_at_0%_90%,var(--sheen-blob-4),transparent_70%)]" />
      <div className="absolute inset-0 [background-image:linear-gradient(var(--sheen-backdrop-grid)_1px,transparent_1px),linear-gradient(90deg,var(--sheen-backdrop-grid)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_50%_30%,black,transparent_75%)]" />
    </div>
  );
}

function ActionButton({ action, variant }: { action: HeroAction; variant: "primary" | "glass" }) {
  return (
    <Button
      size="lg"
      variant={variant}
      onClick={action.onClick}
      // eslint-disable-next-line jsx-a11y/anchor-has-content -- Button injects its children (the label) into the anchor given to `render`
      render={action.href ? <a href={action.href} /> : undefined}
      className="max-w-full"
    >
      {action.label}
    </Button>
  );
}

/**
 * A landing-page hero: a display headline, a lede, one or two calls to action, an optional product shot in a lit glass
 * frame and a logo strip, over a backdrop of your choice. Use it as the first block of a marketing page; put your
 * own `SheenScene` or image in `background`, or keep the built-in aurora.
 *
 * Props (see `HeroSectionProps`): `eyebrow`, `title`, `description`, `primaryAction` / `secondaryAction`
 * (`{ label, href?, onClick? }`), `media`, `mediaClassName`, `background`, `logos` (`{ name, logo? }[]`), `align`
 * (`"center"`), `headingLevel` (`2`), `labels` (`Partial<HeroSectionLabels>`), `className`.
 *
 * Keyboard: Tab visits the calls to action in order (Enter follows a link or presses a button) and then whatever
 * your `media` contains. The logo strip is plain text and is not a tab stop.
 * Accessibility: a `<section>` named by its headline (or, when the heading is `"none"`, a `role="group"` named by `labels.region`, not a landmark, so repeated heroes never collide); the
 * background is `aria-hidden`; the logo strip is a list labelled by `labels.logosTitle`, and every logo has a text name.
 * Glass and motion: the media frame is one glass surface; text and buttons rise a few pixels on a spring (transform
 * only, so nothing glass is faded behind a wrapper) and the frame fades in on itself. Reduced motion: no movement.
 *
 * @example
 * ```tsx
 * import { HeroSection } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <HeroSection
 *       headingLevel={1}
 *       eyebrow="New: dark mode for every block"
 *       title="Interfaces that catch the light"
 *       description="A glass component library for React, built on Base UI and Tailwind."
 *       primaryAction={{ label: "Get started", href: "/docs/installation" }}
 *       secondaryAction={{ label: "Browse components", href: "/components" }}
 *       logos={[{ name: "Alder" }, { name: "Brightloom" }, { name: "Cobalt" }]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/hero-section
 */
export function HeroSection({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  media,
  mediaClassName,
  background,
  logos,
  align = "center",
  headingLevel = 2,
  labels,
  className,
}: HeroSectionProps) {
  const L = { ...defaultHeroSectionLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const logosId = useId();
  const Heading = HEADING_TAGS[headingLevel];
  const centered = align === "center";
  const beside = !centered && Boolean(media);
  const hasLogos = Boolean(logos?.length);

  // Text and buttons move by transform only (never faded: the buttons are glass, and the headline is the page's
  // largest paint). Each step follows the one before it.
  const rise = (step: number) => ({
    initial: reduced ? false : { y: distance.reveal },
    animate: { y: 0 },
    transition: { ...spring.gentle, delay: reduced ? 0 : step * 0.07 },
  });

  return (
    <section
      data-slot="hero-section"
      // A named group, not a region landmark: a stage copy and an example can share a page, and duplicate landmark names
      // fail axe's landmark-unique. The name is still read out.
      role={headingLevel === "none" ? "group" : undefined}
      aria-label={headingLevel === "none" ? L.region : undefined}
      className={cn(
        "@container relative isolate flex w-full min-w-0 flex-col gap-14 overflow-hidden rounded-sheen-xl px-5 py-14 text-sheen-fg @2xl:px-10 @4xl:px-14 @4xl:py-20",
        className,
      )}
    >
      {background === undefined ? <AuroraBackground /> : background}
      {background !== undefined && (
        // A scrim between a photo or scene and the copy: the page colour, strongest where the text sits, so the lede, the
        // accent phrase and the logo strip keep their contrast over any backdrop in every look.
        <div
          aria-hidden
          data-slot="hero-scrim"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(75%_70%_at_50%_45%,color-mix(in_oklab,var(--sheen-bg)_80%,transparent),color-mix(in_oklab,var(--sheen-bg)_45%,transparent)_80%)]"
        />
      )}

      <div
        className={cn(
          "relative mx-auto grid w-full max-w-6xl items-center gap-12",
          beside && "@4xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] @4xl:gap-16",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-col gap-6",
            centered ? "mx-auto items-center text-center" : "items-start text-start",
          )}
        >
          {eyebrow && (
            <motion.p
              {...rise(0)}
              className="glass-1 inline-flex min-h-8 max-w-full items-center gap-2 rounded-sheen-full px-3.5 py-1 text-sm font-medium text-sheen-fg"
            >
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-sheen-accent shadow-[0_0_10px_2px_var(--sheen-accent-glow)]"
              />
              <span className="min-w-0 text-pretty">{eyebrow}</span>
            </motion.p>
          )}

          <motion.div {...rise(1)} className="min-w-0">
            <Heading
              className={cn(
                "font-sheen-display text-[clamp(2.25rem,7.5cqi,4.75rem)] leading-[1.02] font-semibold tracking-(--sheen-display-tracking) text-balance",
                // <em> in the headline is the accent phrase: upright, lit by the accent, not italic.
                "[&_em]:text-sheen-accent [&_em]:not-italic",
                centered && "max-w-4xl",
              )}
            >
              {title}
            </Heading>
          </motion.div>

          {description && (
            <motion.p
              {...rise(2)}
              className={cn("max-w-2xl text-lg text-pretty text-sheen-fg @2xl:text-xl", centered && "mx-auto")}
            >
              {description}
            </motion.p>
          )}

          {(primaryAction ?? secondaryAction) && (
            <motion.div
              {...rise(3)}
              className={cn("flex flex-wrap gap-3 pt-2", centered ? "justify-center" : "justify-start")}
            >
              {primaryAction && <ActionButton action={primaryAction} variant="primary" />}
              {secondaryAction && <ActionButton action={secondaryAction} variant="glass" />}
            </motion.div>
          )}
        </div>

        {media && (
          <div className={cn("relative min-w-0", centered && "mx-auto w-full max-w-5xl")}>
            {/* The light the frame sits in: a pool of accent glow behind it, below the glass. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[6%] -bottom-6 -z-10 h-1/2 rounded-full bg-[radial-gradient(closest-side,var(--sheen-accent-glow),transparent)] opacity-60"
            />
            <motion.div
              data-slot="hero-media"
              // Transform only: the frame is glass, and any opacity below 1 on it would flatten the glass.
              initial={reduced ? false : { y: distance.panel }}
              animate={{ y: 0 }}
              transition={{ ...spring.gentle, delay: reduced ? 0 : duration.slow }}
              className={cn(
                "glass-3 relative overflow-hidden rounded-sheen-xl p-1.5",
                // The lit top edge: a hairline of light that fades out to both sides.
                "before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:z-10 before:h-px before:bg-[linear-gradient(90deg,transparent,var(--sheen-glass-highlight),transparent)]",
                mediaClassName,
              )}
            >
              <div className="min-h-0 overflow-hidden rounded-[calc(var(--sheen-radius-xl)-0.375rem)]">{media}</div>
            </motion.div>
          </div>
        )}
      </div>

      {hasLogos && logos && (
        <div data-slot="hero-logos" className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-5">
          <p id={logosId} className="text-center text-sm font-medium text-sheen-fg">
            {L.logosTitle}
          </p>
          <ul
            aria-labelledby={logosId}
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-sheen-fg"
          >
            {logos.map((item) => (
              <li key={item.name} className="flex min-h-8 items-center text-xl font-semibold tracking-tight">
                {item.logo ? (
                  <>
                    <span aria-hidden className="flex items-center">
                      {item.logo}
                    </span>
                    <span className="sr-only">{item.name}</span>
                  </>
                ) : (
                  item.name
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
