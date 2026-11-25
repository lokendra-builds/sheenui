"use client";

import { useId, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "../lib/cn";
import { duration, spring, distance } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { HEADING_TAGS, type HeadingLevelOption } from "../lib/heading";
import { Button } from "../components/button/button";

/** One suggested destination on `NotFound`: a glass link with an optional line of text. */
export type NotFoundLink = {
  /** The link text. */
  label: string;
  /** The link target. */
  href: string;
  /** A short line under the label, saying what is there. */
  description?: string;
};

/** The main way out on `NotFound`: a link when `href` is given, otherwise a button that calls `onClick`. */
export type NotFoundAction = {
  /** The button text. */
  label: string;
  /** Link target; the action renders as an anchor when it is set. */
  href?: string;
  /** Called on click. */
  onClick?: () => void;
};

/** Every string `NotFound` renders or announces, so the block can be translated. */
export type NotFoundLabels = {
  /** The heading. */
  title: string;
  /** The text under the heading. */
  description: string;
  /** The spoken form of the decorative code, for example "Error 404". */
  codeLabel: string;
  /** Visible line above the list of links. */
  linksTitle: string;
};

/** The English {@link NotFoundLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultNotFoundLabels: NotFoundLabels = {
  title: "This page has drifted off",
  description:
    "The address may be mistyped, or the page may have moved. Search for what you need, or pick up from one of these.",
  codeLabel: "Error 404",
  linksTitle: "Popular places",
};

/** Props of `NotFound`. */
export type NotFoundProps = {
  /**
   * The big code (`string`). Each `0` is drawn as a glass ring. It is decorative: `labels.codeLabel` is what is read aloud.
   * @default "404"
   */
  code?: string;
  /** The main way out, usually back home (`NotFoundAction`). */
  action?: NotFoundAction;
  /** A slot for your search field (`ReactNode`), shown under the text: a `Input`, a `Combobox` or a command palette trigger. The block does not search for you. */
  search?: ReactNode;
  /** Suggested destinations (`NotFoundLink[]`). */
  links?: NotFoundLink[];
  /**
   * Level of the heading (`1` to `6`); `"none"` renders plain text. A 404 page's heading is its `h1`, so a real page passes `headingLevel={1}`.
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** Overrides for the block's strings (`Partial<NotFoundLabels>`). */
  labels?: Partial<NotFoundLabels>;
  /** Adds extra classes to the section (`string`). */
  className?: string;
};

function Digit({ char, index, reduced }: { char: string; index: number; reduced: boolean }) {
  if (char === "0") {
    return (
      <motion.span
        data-slot="not-found-ring"
        initial={reduced ? false : { y: -distance.hero, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduced ? { duration: duration.fast } : { ...spring.bouncy, delay: duration.instant }}
        className="glass-2 relative mx-[0.04em] inline-block h-[0.86em] w-[0.62em] rounded-full shadow-[inset_0_0_0_0.06em_var(--sheen-glass-edge),0_0.1em_0.5em_-0.15em_var(--sheen-accent-glow)] after:absolute after:inset-[18%_24%] after:rounded-full after:shadow-[inset_0_0_0_0.04em_var(--sheen-glass-edge)] after:content-['']"
      />
    );
  }
  return (
    <motion.span
      key={index}
      initial={reduced ? false : { y: distance.panel }}
      animate={{ y: 0 }}
      transition={{ ...spring.gentle, delay: index * 0.06 }}
      className="inline-block bg-clip-text text-transparent [background-image:var(--sheen-accent-gradient)]"
    >
      {char}
    </motion.span>
  );
}

/**
 * A 404 page: a large code whose zeros are glass rings, a plain heading and explanation, a slot for your search field, a
 * way back, and a few suggested links. Use it as the not-found route of an app or a marketing site.
 *
 * Props (see `NotFoundProps`): `code` (`"404"`), `action` (`{ label, href?, onClick? }`), `search` (`ReactNode`), `links`
 * (`{ label, href, description? }[]`), `headingLevel` (`2`), `labels` (`Partial<NotFoundLabels>`), `className`.
 *
 * Keyboard: Tab walks the main action, whatever your `search` slot holds, and then the suggested links in order.
 * Accessibility: a `<section>` named by its heading; the big code is `aria-hidden` and replaced by the spoken
 * `labels.codeLabel`; the suggested links are a labelled list of real anchors with 44 px targets. A real 404 route
 * should also answer with HTTP status 404; this block only draws the page.
 * Glass and motion: the zeros are glass surfaces (keep to two or three zeros) and the link cards are glass; digits settle
 * on a spring and the rings drop in once. Nothing loops. Reduced motion: no movement.
 *
 * @example
 * ```tsx
 * import { NotFound, Input } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NotFound
 *       headingLevel={1}
 *       action={{ label: "Back to home", href: "/" }}
 *       search={<Input type="search" aria-label="Search the site" placeholder="Search…" />}
 *       links={[
 *         { label: "Documentation", href: "/docs", description: "Guides and API reference" },
 *         { label: "Pricing", href: "/pricing" },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/not-found-page
 */
export function NotFound({
  code = "404",
  action,
  search,
  links = [],
  headingLevel = 2,
  labels,
  className,
}: NotFoundProps) {
  const L = { ...defaultNotFoundLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const Heading = HEADING_TAGS[headingLevel];
  const headingId = useId();
  const linksId = useId();

  return (
    <section
      data-slot="not-found"
      role="group"
      aria-labelledby={headingLevel === "none" ? undefined : headingId}
      aria-label={headingLevel === "none" ? L.title : undefined}
      className={cn(
        "@container relative isolate flex w-full min-w-0 flex-col items-center gap-8 px-5 py-14 text-center @3xl:py-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(45%_40%_at_50%_18%,var(--sheen-blob-1),transparent_72%),radial-gradient(35%_30%_at_80%_30%,var(--sheen-blob-2),transparent_70%)]"
      />

      <p className="sr-only">{L.codeLabel}</p>
      <div
        aria-hidden
        data-slot="not-found-code"
        className="flex items-center justify-center font-sheen-display text-[clamp(5.5rem,26cqi,13rem)] leading-none font-bold tracking-(--sheen-display-tracking)"
      >
        {Array.from(code).map((char, index) => (
          <Digit key={index} char={char} index={index} reduced={reduced} />
        ))}
      </div>

      <div className="flex max-w-xl flex-col items-center gap-3">
        <Heading
          id={headingId}
          className="font-sheen-display text-2xl font-semibold tracking-(--sheen-display-tracking) text-balance @xl:text-4xl"
        >
          {L.title}
        </Heading>
        <p className="text-base text-pretty text-sheen-fg-muted @xl:text-lg">{L.description}</p>
      </div>

      {search && <div className="w-full max-w-md text-start">{search}</div>}

      {action && (
        <Button
          size="lg"
          onClick={action.onClick}
          // eslint-disable-next-line jsx-a11y/anchor-has-content -- Button injects its children (the label) into the anchor given to `render`
          render={action.href ? <a href={action.href} /> : undefined}
        >
          {action.label}
        </Button>
      )}

      {links.length > 0 && (
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 pt-4">
          <p id={linksId} className="text-sm font-medium text-sheen-fg-muted">
            {L.linksTitle}
          </p>
          <ul aria-labelledby={linksId} className="grid w-full list-none gap-3 p-0 @xl:grid-cols-2 @3xl:grid-cols-3">
            {links.map((link) => (
              <li key={link.href + link.label} className="flex">
                <a
                  href={link.href}
                  className="glass-1 group/link flex min-h-11 w-full flex-col gap-1 rounded-sheen-lg p-4 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out motion-ok:hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-between gap-2 font-semibold text-sheen-fg">
                    {link.label}
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0 text-sheen-fg-muted rtl:-scale-x-100 motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:group-hover/link:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  {link.description && <span className="text-sm text-sheen-fg-muted">{link.description}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
