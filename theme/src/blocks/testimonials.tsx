"use client";

import { useId, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "../lib/cn";
import { NoScriptReveal } from "../lib/no-script-reveal";
import { duration, ease, spring, distance, staggerStep } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { useControllable } from "../hooks/use-controllable";
import { HEADING_TAGS, type HeadingLevelOption } from "../lib/heading";
import { GlassCard } from "../components/glass-card/glass-card";
import { Marquee, type MarqueeLabels } from "../components/marquee/marquee";
import { initials } from "../lib/initials";

/** One quote of `Testimonials`. */
export type Testimonial = {
  /** Stable key. */
  id: string;
  /** The quote itself (`ReactNode`), without quotation marks: the card draws them. */
  quote: ReactNode;
  /** Who said it. Shown under the quote and used for the initials when there is no `avatar`. */
  name: string;
  /** Their role or company line, shown under the name. */
  role?: string;
  /** Your own avatar (an `<img alt="">` or a component). Without it the name's initials are drawn. */
  avatar?: ReactNode;
  /** A star rating from 1 to 5. It is announced as text through `labels.rating`. */
  rating?: 1 | 2 | 3 | 4 | 5;
};

/** Every string `Testimonials` adds around your content, so the block can be translated. */
export type TestimonialsLabels = {
  /** Accessible name of the `<section>` when there is no `title`. */
  region: string;
  /** Accessible name of the list of quotes. */
  list: string;
  /** Text alternative of a star rating, for example "Rated 5 out of 5". */
  rating: (stars: number) => string;
  /** The marquee's Pause / Play button (`Partial<MarqueeLabels>`). */
  marquee: Partial<MarqueeLabels>;
};

/** The English {@link TestimonialsLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultTestimonialsLabels: TestimonialsLabels = {
  region: "Testimonials",
  list: "Customer quotes",
  rating: (stars) => `Rated ${stars} out of 5`,
  marquee: { pause: "Pause the quotes", play: "Play the quotes" },
};

/** Props of `Testimonials`. */
export type TestimonialsProps = {
  /** Lists the quotes the section shows (`Testimonial[]`). */
  testimonials: Testimonial[];
  /** Shows a small label above the title (`ReactNode`). */
  eyebrow?: ReactNode;
  /** Sets the section heading (`ReactNode`). */
  title?: ReactNode;
  /** Sets the line under the heading (`ReactNode`). */
  description?: ReactNode;
  /**
   * `"grid"` lays the quotes out in columns; `"marquee"` scrolls them in one or two rows that rest when the block is
   * off-screen, hovered or focused, with a Pause button.
   * @default "grid"
   */
  layout?: "grid" | "marquee";
  /**
   * Columns of the grid on a wide block (`2 | 3`; it steps down by the block's own width).
   * @default 3
   */
  columns?: 2 | 3;
  /**
   * Rows of the marquee (`1 | 2`); the second row runs the other way. Needs at least four quotes.
   * @default 1
   */
  rows?: 1 | 2;
  /**
   * Sets the marquee speed in pixels per second (`number`).
   * @default 32
   */
  speed?: number;
  /** Controls whether the marquee is paused (`boolean`). Use with `onPausedChange`. */
  paused?: boolean;
  /**
   * Whether the marquee starts paused when uncontrolled (`boolean`).
   * @default false
   */
  defaultPaused?: boolean;
  /** Called when the Pause / Play button is pressed (`(paused: boolean) => void`). */
  onPausedChange?: (paused: boolean) => void;
  /**
   * Level of the section heading (`1` to `6`); `"none"` renders plain text.
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** Overrides for the block's strings (`Partial<TestimonialsLabels>`). */
  labels?: Partial<TestimonialsLabels>;
  /** Adds extra classes to the section (`string`). */
  className?: string;
};

const gridCols = { 2: "@2xl:grid-cols-2", 3: "@2xl:grid-cols-2 @5xl:grid-cols-3" } as const;

const MotionGlassCard = motion.create(GlassCard);

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="flex gap-0.5 text-sheen-warning-text">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          aria-hidden
          viewBox="0 0 24 24"
          className="size-4"
          fill={n <= value ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          opacity={n <= value ? 1 : 0.35}
        >
          <path d="m12 3.5 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8z" />
        </svg>
      ))}
    </span>
  );
}

function QuoteCard({ item, labels, className }: { item: Testimonial; labels: TestimonialsLabels; className?: string }) {
  return (
    <figure className={cn("flex h-full min-w-0 flex-col gap-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <svg
          aria-hidden
          viewBox="0 0 32 24"
          className="h-7 w-9 shrink-0 text-sheen-accent opacity-80 rtl:-scale-x-100"
          fill="currentColor"
        >
          <path d="M0 24V13.6C0 5.7 4.3 1 11.5 0l1.3 3.6C9 4.7 7.2 7 7 10.4h5.5V24H0Zm19.5 0V13.6C19.5 5.7 23.8 1 31 0l1 3.6c-3.7 1.1-5.5 3.4-5.7 6.8h5.5V24H19.5Z" />
        </svg>
        {item.rating && <Stars value={item.rating} label={labels.rating(item.rating)} />}
      </div>
      <blockquote className="text-pretty text-base leading-relaxed text-sheen-fg @xl:text-lg">{item.quote}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-1">
        {item.avatar ? (
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full [&_img]:size-full [&_img]:object-cover"
          >
            {item.avatar}
          </span>
        ) : (
          <span
            aria-hidden
            className="glass-1 flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-sheen-fg"
          >
            {initials(item.name, "first-last")}
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          <cite className="truncate text-sm font-semibold text-sheen-fg not-italic">{item.name}</cite>
          {item.role && <span className="truncate text-sm text-sheen-fg-muted">{item.role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * A wall of customer quotes in glass cards, as a grid or as a marquee. Use it for social proof under the features or the
 * pricing; the marquee form fits many short quotes, the grid fits three to six longer ones.
 *
 * Props (see `TestimonialsProps`): `testimonials` (`{ id, quote, name, role?, avatar?, rating? }[]`), `eyebrow`, `title`,
 * `description`, `layout` (`"grid"`), `columns` (`3`), `rows` (`1`), `speed` (`32`), `paused` / `defaultPaused` (`false`) /
 * `onPausedChange`, `headingLevel` (`2`), `labels` (`Partial<TestimonialsLabels>`), `className`.
 *
 * Keyboard: the grid has no tab stops. In the marquee, Tab reaches the Pause / Play button first (Enter or Space
 * toggles it); focusing inside the strip also rests it.
 * Accessibility: each quote is a `<figure>` with a `<blockquote>` and a `<figcaption>`; ratings are text alternatives
 * from `labels.rating`; avatars are decorative; the marquee has a Pause button (WCAG 2.2.2), rests while hovered, focused,
 * off-screen or in a background tab, and stands still under reduced motion.
 * Glass and motion: one glass card per quote; the marquee fades each card's own edge, never a wrapper of glass. Grid cards
 * rise on a spring when scrolled into view. Reduced motion: no movement; the marquee does not scroll.
 *
 * @example
 * ```tsx
 * import { Testimonials } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Testimonials
 *       title="Loved by small teams"
 *       layout="marquee"
 *       testimonials={[
 *         { id: "a", quote: "We shipped our dashboard in a week.", name: "Sam Rivera", role: "Engineer, Alder" },
 *         { id: "b", quote: "The focus states are the best I have used.", name: "Jo Lindqvist", role: "Designer, Brightloom" },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/testimonials
 */
export function Testimonials({
  testimonials,
  eyebrow,
  title,
  description,
  layout = "grid",
  columns = 3,
  rows = 1,
  speed = 32,
  paused: pausedProp,
  defaultPaused = false,
  onPausedChange,
  headingLevel = 2,
  labels,
  className,
}: TestimonialsProps) {
  const L = { ...defaultTestimonialsLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const headingId = useId();
  const Heading = HEADING_TAGS[headingLevel];
  const [paused, setPaused] = useControllable(pausedProp, defaultPaused, onPausedChange);

  const twoRows = layout === "marquee" && rows === 2 && testimonials.length >= 4;
  const half = Math.ceil(testimonials.length / 2);
  const strips = twoRows ? [testimonials.slice(0, half), testimonials.slice(half)] : [testimonials];

  return (
    <section
      // A named group, not a region landmark: the same section can appear twice on one page and duplicate landmark names fail landmark-unique.
      role="group"
      data-slot="testimonials"
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : L.region}
      className={cn("@container flex w-full min-w-0 flex-col gap-10", className)}
    >
      {(Boolean(eyebrow) || Boolean(title) || Boolean(description)) && (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          {eyebrow && <p className="text-sm font-semibold tracking-widest text-sheen-accent uppercase">{eyebrow}</p>}
          {title && (
            <Heading
              id={headingId}
              className="font-sheen-display text-3xl font-semibold tracking-(--sheen-display-tracking) text-balance @xl:text-5xl"
            >
              {title}
            </Heading>
          )}
          {description && <p className="text-base text-pretty text-sheen-fg-muted @xl:text-lg">{description}</p>}
        </div>
      )}

      {layout === "grid" ? (
        <>
          <NoScriptReveal />
          <ul aria-label={L.list} className={cn("grid list-none gap-4 p-0 @4xl:gap-5", gridCols[columns])}>
            {testimonials.map((item, index) => {
              const delay = (index % columns) * staggerStep.cards;
              return (
                <li key={item.id} className="flex min-w-0">
                  <MotionGlassCard
                    data-sheen-reveal=""
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: distance.reveal }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                    transition={
                      reduced
                        ? { duration: duration.fast }
                        : {
                            y: { ...spring.gentle, delay },
                            opacity: { duration: duration.fast, ease: ease.out, delay },
                          }
                    }
                    className="w-full p-6 @xl:p-7"
                  >
                    <QuoteCard item={item} labels={L} />
                  </MotionGlassCard>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {strips.map((strip, index) => (
            <Marquee
              key={index}
              speed={speed}
              reverse={index === 1}
              gap={20}
              paused={paused}
              onPausedChange={setPaused}
              controls={index === 0}
              listLabel={L.list}
              labels={L.marquee}
              itemClassName="w-[min(22rem,80vw)] py-3"
            >
              {strip.map((item) => (
                <GlassCard key={item.id} className="h-full p-6">
                  <QuoteCard item={item} labels={L} />
                </GlassCard>
              ))}
            </Marquee>
          ))}
        </div>
      )}
    </section>
  );
}
