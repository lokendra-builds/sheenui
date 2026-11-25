"use client";

import { useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { animate, motion, useInView, useMotionValue, type Variants } from "motion/react";

import { cn } from "../../lib/cn";
import type { HeadingTag } from "../../lib/heading";
import { duration, ease, spring } from "../../motion/tokens";
import { exitTransition } from "../../motion/presets";
import { Badge } from "../../components/badge/badge";
import { Button } from "../../components/button/button";
import { GlassCard } from "../../components/glass-card/glass-card";
import { CheckIcon } from "../icons";
import {
  type PricingBilling,
  type PricingTier,
  type PricingFeatureValue,
  type PricingFeature,
  type PricingLabels,
  type Money,
} from "./model";

/* ---------- Billing switch ---------- */

/** The monthly/yearly toggle above the plans. @internal */
export function BillingSwitch({
  value,
  onChange,
  savePercent,
  labels,
  reduced,
}: {
  value: PricingBilling;
  onChange: (value: PricingBilling) => void;
  savePercent: string | null;
  labels: PricingLabels;
  reduced: boolean;
}) {
  const pillId = useId();
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next)}
      aria-label={labels.billing}
      className="glass-1 inline-flex max-w-full items-center gap-0.5 rounded-sheen-full p-1"
    >
      {(["monthly", "yearly"] as const).map((option) => (
        <Radio.Root
          key={option}
          value={option}
          className={cn(
            // isolate: the pill (z -10) sits behind the label but inside this option.
            "relative isolate inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-sheen-full px-4 text-sm font-medium whitespace-nowrap select-none",
            "touch-manipulation [-webkit-tap-highlight-color:transparent]",
            "text-sheen-fg-muted transition-[color,scale] duration-(--sheen-duration-fast) ease-sheen-out hover:text-sheen-fg data-checked:text-sheen-fg",
            "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
            "motion-ok:active:scale-[0.97] any-pointer-coarse:min-h-11",
            // High contrast drops the pill's fill: underline the chosen option instead.
            "forced-colors:data-checked:underline forced-colors:data-checked:decoration-2 forced-colors:data-checked:underline-offset-4",
          )}
        >
          {value === option && (
            <motion.span
              aria-hidden
              layoutId={pillId}
              transition={reduced ? { duration: 0 } : spring.snappy}
              className={cn(
                "pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
                // The tabs' indicator token, not the glass highlight: at night the highlight's 0.34 white put the chosen
                // option's label at 4.4:1 (measured from pixels); the indicator keeps it above 4.5:1 in both styles.
                "bg-(--sheen-indicator) [background-image:var(--sheen-glass-specular)]",
                "shadow-[inset_0_1px_0_var(--sheen-glass-highlight),0_0_0_1px_var(--sheen-glass-edge),0_1px_2px_var(--sheen-shadow-near),0_4px_12px_-6px_var(--sheen-shadow-far)]",
                "forced-colors:border-2 forced-colors:border-[Highlight]",
              )}
            />
          )}
          {labels[option]}
          {option === "yearly" && savePercent && (
            <Badge tone="success" className="h-5 px-2 text-2xs font-semibold">
              {labels.save(savePercent)}
            </Badge>
          )}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

/* ---------- Tier card ---------- */

/** A `GlassCard` that Motion can animate. @internal */
export const MotionGlassCard = motion.create(GlassCard);

/* The card rises on a spring; its opacity only blinks in (duration.fast), so the glass
   controls inside it (buttons, the billing pill) are never seen half-faded over the card. */
/** The entrance variants of a plan card: it rises on a spring while its opacity blinks in. @internal */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { y: { ...spring.gentle, delay }, opacity: { duration: duration.fast, ease: ease.out, delay } },
  }),
};
/** The card entrance variants for reduced motion: a fade with no movement. @internal */
export const cardVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast } },
};

/** One plan card: price, features and call to action. @internal */
export function PricingCard({
  tier,
  previous,
  billing,
  features,
  rows,
  money,
  labels,
  nextDelay,
  reduced,
  headingLevel: TierHeading,
  onSelect,
}: {
  tier: PricingTier;
  /** The tier before this one, for "Everything in …, plus:" lists. */
  previous: PricingTier | undefined;
  billing: PricingBilling;
  features: PricingFeature[];
  /** Subgrid rows the card spans: 4 with a feature list, 3 without. */
  rows: 3 | 4;
  money: Money;
  labels: PricingLabels;
  nextDelay: () => number;
  reduced: boolean;
  headingLevel: HeadingTag;
  onSelect?: (tier: PricingTier, billing: PricingBilling) => void;
}) {
  const nameId = useId();
  const ref = useRef<HTMLDivElement>(null);
  // Any part of the card in view (minus a strip at the bottom edge) starts its entrance.
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const [delay, setDelay] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the stagger slot comes from a shared, impure counter (`nextDelay`), so it is drawn once in the commit when the card enters, never during render
    if (inView && delay === null) setDelay(nextDelay());
  }, [inView, delay, nextDelay]);
  const entered = delay !== null;
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    // A card whose last strip is scrolled under the sticky page header (the top 88 px of the viewport) is not seen
    // through its own glass any more: it gives up its blur until it comes back, so a long page never stacks more
    // blur surfaces than the viewport can show. Cards that are not on screen at all keep their blur (nothing paints).
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const above = entry.boundingClientRect.bottom < (entry.rootBounds?.top ?? 0) + 88;
        setCovered(!entry.isIntersecting && above && entry.boundingClientRect.bottom > 0);
      },
      { rootMargin: "-88px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [engaged, setEngaged] = useState(false);
  const popular = Boolean(tier.popular);
  const cardFeatures = features.filter((f) => {
    if (f.inCards === false) return false;
    if (!tier.featuresTitle || !previous) return true;
    // "Everything in X, plus:" lists only what this tier adds over the one before it.
    const value = f.values[tier.id] ?? false;
    return value !== false && value !== (f.values[previous.id] ?? false);
  });
  const price = tier.price ? tier.price[billing] : null;

  let note: string;
  if (!tier.price) note = labels.customNote;
  else if (tier.price.monthly === 0 && tier.price.yearly === 0) note = labels.free;
  else note = billing === "yearly" ? labels.billedYearly(money.format(tier.price.yearly * 12)) : labels.billedMonthly;

  function leave(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false);
  }

  return (
    <MotionGlassCard
      ref={ref}
      level={popular ? 3 : 2}
      tint={popular}
      role="group"
      aria-labelledby={nameId}
      custom={delay ?? 0}
      variants={reduced ? cardVariantsReduced : cardVariants}
      initial="hidden"
      animate={entered ? "visible" : "hidden"}
      onPointerEnter={(e) => e.pointerType === "mouse" && setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={leave}
      data-covered={covered ? "" : undefined}
      className={cn(
        "data-[covered]:[-webkit-backdrop-filter:none] data-[covered]:[backdrop-filter:none]",
        // A subgrid of the tier grid's rows: header, price, button, features line up across cards.
        "relative grid min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-subgrid content-start gap-y-6 rounded-sheen-xl p-6",
        rows === 4 ? "row-span-4" : "row-span-3",
        popular && "border-sheen-accent-border forced-colors:border-2 forced-colors:border-[Highlight]!",
      )}
    >
      {popular && <Beam engaged={engaged} inView={entered} reduced={reduced} />}
      {popular && (
        <Badge
          tone="solid"
          className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-[0_6px_16px_-8px_var(--sheen-shadow-far)]"
        >
          <SparkIcon className="size-3" />
          {labels.popular}
        </Badge>
      )}

      <div className="flex flex-col gap-2">
        {/* The tier name stays in the body colour (the badge and beam carry the accent): accent
            text on the tinted popular card would sit right at the 4.5:1 line in dark mode. */}
        <TierHeading id={nameId} className="text-lg font-semibold tracking-tight text-sheen-fg">
          {tier.name}
        </TierHeading>
        {tier.description && <p className="text-sm text-pretty text-sheen-fg-muted">{tier.description}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-1">
          {price === null ? (
            <span className="text-4xl leading-none font-semibold tracking-tight">
              {tier.priceLabel ?? labels.custom}
            </span>
          ) : (
            <>
              <RollingNumber
                parts={money.parts(price)}
                digits={money.digits}
                play={entered || reduced}
                reduced={reduced}
                delay={delay ?? 0}
                className="text-4xl leading-none font-semibold tracking-tight"
              />
              <span aria-hidden className="text-sm font-medium text-sheen-fg-muted">
                {labels.perMonth}
              </span>
              <span className="sr-only">{`${money.format(price)} ${labels.perMonthLong}`}</span>
            </>
          )}
        </p>
        <p className="min-h-5 text-sm text-sheen-fg-muted">{note}</p>
      </div>

      <div>
        <Button
          variant={popular ? "primary" : "glass"}
          fullWidth
          // eslint-disable-next-line jsx-a11y/anchor-has-content -- Button injects its children (the label) into the anchor given to `render`
          render={tier.href ? <a href={tier.href} /> : undefined}
          onClick={() => onSelect?.(tier, billing)}
        >
          {tier.cta}
        </Button>
      </div>

      {rows === 4 && (
        <div className="flex flex-col gap-3 border-t border-sheen-border pt-5">
          {tier.featuresTitle && <p className="text-xs font-semibold text-sheen-fg">{tier.featuresTitle}</p>}
          {cardFeatures.length > 0 && (
            <ul className="flex flex-col gap-2.5 text-sm">
              {cardFeatures.map((feature) => (
                <FeatureItem
                  key={feature.label}
                  feature={feature}
                  value={feature.values[tier.id] ?? false}
                  labels={labels}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </MotionGlassCard>
  );
}

/** One feature line of a plan card. @internal */
export function FeatureItem({
  feature,
  value,
  labels,
}: {
  feature: PricingFeature;
  value: PricingFeatureValue;
  labels: PricingLabels;
}) {
  const included = value !== false;
  return (
    <li className="flex min-w-0 items-start gap-2.5">
      <FeatureMark included={included} />
      <span
        className={cn("min-w-0 flex-1 [overflow-wrap:anywhere]", included ? "text-sheen-fg" : "text-sheen-fg-subtle")}
      >
        {feature.label}
        {!included && <span className="sr-only">{`, ${labels.notIncluded.toLowerCase()}`}</span>}
      </span>
      {typeof value === "string" && (
        <span className="shrink-0 text-end font-medium text-sheen-fg tabular-nums">{value}</span>
      )}
    </li>
  );
}

/** Check in an accent disc, or a muted dash. Decorative: the text says the rest. */
export function FeatureMark({ included }: { included: boolean }) {
  return included ? (
    <span
      aria-hidden
      className="mt-px flex size-[1.125rem] shrink-0 items-center justify-center rounded-full bg-sheen-accent-soft text-sheen-accent"
    >
      <CheckIcon className="size-3" strokeWidth={2.6} />
    </span>
  ) : (
    <span aria-hidden className="mt-px flex size-[1.125rem] shrink-0 items-center justify-center text-sheen-fg-subtle">
      <MinusIcon className="size-3.5" />
    </span>
  );
}

/* ---------- Beam ---------- */

/* Keeps only a ring of the given padding: the content box is cut out of the full box. */
/** The mask classes that keep only a padding-wide ring of an element. @internal */
export const ringMask =
  "[mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)] [-webkit-mask-composite:xor]";
/* A square, much larger than the card, holding the arc: a tail that fades in from the accent,
   then the second accent, then a head mixed toward the text colour (lighter in dark mode,
   deeper in light mode), so it reads as a comet on either theme. Only its rotation animates. */
/** The classes of the rotating comet strip behind the highlighted plan's border. @internal */
export const beamStrip =
  "absolute top-1/2 left-1/2 aspect-square w-[max(200%,40rem)] -translate-1/2 " +
  "[background:conic-gradient(from_0deg,transparent_0%,transparent_64%,var(--sheen-accent)_84%,var(--sheen-accent-2)_95%,color-mix(in_oklab,var(--sheen-accent-2)_55%,var(--sheen-fg))_98.5%,transparent_100%)]";

/**
 * A comet of light running around the card's border: a rotating conic gradient masked to a
 * 2px ring, over a blurred copy of itself (a 5px ring) that makes it glow. Only transform
 * animates; the blur sits on a static layer that holds nothing but the beam. Both layers
 * live inside the glass card (they never wrap it), so the card's own blur is untouched.
 */
export function Beam({ engaged, inView, reduced }: { engaged: boolean; inView: boolean; reduced: boolean }) {
  const rotate = useMotionValue(-40);
  const introDone = useRef(false);

  useEffect(() => {
    if (reduced || !inView) return;
    const from = rotate.get();
    if (engaged) {
      // Hover / focus: keep circling until the pointer or focus leaves.
      const controls = animate(rotate, [from, from + 360], {
        duration: duration.slower * 6,
        ease: "linear",
        repeat: Infinity,
      });
      return () => controls.stop();
    }
    // First time in view: two laps that settle; afterwards a short glide to rest.
    const first = !introDone.current;
    const controls = animate(rotate, from + (first ? 720 : 70), {
      duration: first ? duration.slower * 7 : duration.slower,
      ease: first ? ease.inOut : ease.out,
      onComplete: () => {
        introDone.current = true;
      },
    });
    return () => controls.stop();
  }, [engaged, inView, reduced, rotate]);

  return (
    <span aria-hidden className="pointer-events-none absolute -inset-px rounded-[inherit] forced-colors:hidden">
      <span className="absolute inset-0 rounded-[inherit] opacity-70 blur-[6px]">
        <span className={cn(ringMask, "absolute -inset-0.5 overflow-hidden rounded-[inherit] p-[5px]")}>
          <motion.span style={{ rotate }} className={beamStrip} />
        </span>
      </span>
      <span className={cn(ringMask, "absolute inset-0 overflow-hidden rounded-[inherit] p-[2px]")}>
        <motion.span style={{ rotate }} className={beamStrip} />
      </span>
    </span>
  );
}

/* ---------- Rolling number ---------- */

/** One character of an animated price, with its digit value when it is a digit. @internal */
export type Glyph = { key: string; char: string; digit: number | null };

/**
 * Splits formatted price parts into glyphs. Digits are keyed by place (ones, tens...
 * counted from the decimal point), so "$9" → "$19" adds a tens column and the ones column rolls.
 */
export function toGlyphs(parts: Intl.NumberFormatPart[], digits: string[]): Glyph[] {
  const intCount = parts.filter((p) => p.type === "integer").reduce((n, p) => n + Array.from(p.value).length, 0);
  let intSeen = 0;
  let fracSeen = 0;
  const seen: Record<string, number> = {};
  const glyphs: Glyph[] = [];
  for (const part of parts) {
    if (part.type === "integer" || part.type === "fraction") {
      for (const char of part.value) {
        const digit = digits.indexOf(char);
        const key = part.type === "integer" ? `i${intCount - 1 - intSeen++}` : `f${fracSeen++}`;
        glyphs.push({ key, char, digit: digit >= 0 ? digit : null });
      }
    } else {
      const n = (seen[part.type] = (seen[part.type] ?? 0) + 1);
      glyphs.push({ key: `${part.type}-${n}`, char: part.value, digit: null });
    }
  }
  return glyphs;
}

/**
 * Odometer-style number: every digit is a strip 0–9 that slides to its value (transform only).
 * Hidden from screen readers; render the plain value next to it in an sr-only span.
 */
export function RollingNumber({
  parts,
  digits,
  play,
  reduced,
  delay = 0,
  className,
}: {
  parts: Intl.NumberFormatPart[];
  digits: string[];
  /** False shows zeros, so the first roll starts when the block scrolls into view. */
  play: boolean;
  reduced: boolean;
  /** Seconds before the first digit moves (the card's own entrance delay). */
  delay?: number;
  className?: string;
}) {
  const glyphs = toGlyphs(parts, digits);
  let place = 0;
  return (
    <span aria-hidden className={cn("inline-flex items-baseline whitespace-nowrap tabular-nums", className)}>
      {glyphs.map((glyph) => {
        if (glyph.digit === null) return <span key={glyph.key}>{glyph.char}</span>;
        const order = place++;
        return (
          <DigitStrip
            key={glyph.key}
            digit={play ? glyph.digit : 0}
            digits={digits}
            reduced={reduced}
            delay={delay + order * 0.045}
          />
        );
      })}
    </span>
  );
}

/** A rolling column of digits that animates one price digit. @internal */
export function DigitStrip({
  digit,
  digits,
  reduced,
  delay,
}: {
  digit: number;
  digits: string[];
  reduced: boolean;
  delay: number;
}) {
  return (
    // overflow-clip (not hidden): it isn't a scroll container, so the column keeps its text baseline.
    <span className="relative inline-block overflow-clip [mask-image:linear-gradient(transparent,#000_10%,#000_90%,transparent)]">
      {/* Sizes the column (digits share one width with tabular-nums) and gives it a baseline. */}
      {/* The glyphs of the column are generated content (data-glyph), not text: the column adds no text node, so a crawler reading the page gets the value from the sr-only span, not "0 1 2 ... 9" per digit. */}
      <span className="invisible before:content-[attr(data-glyph)]" data-glyph={digits[digit]} />
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-digit * 10}%` }}
        transition={reduced ? { duration: 0 } : { ...spring.gentle, delay }}
      >
        {digits.map((d) => (
          <span key={d} data-glyph={d} className="before:content-[attr(data-glyph)]" />
        ))}
      </motion.span>
    </span>
  );
}

/* ---------- Comparison table ---------- */

/** The feature comparison table across all plans. @internal */
export function ComparisonTable({
  id,
  tiers,
  features,
  billing,
  money,
  labels,
  reduced,
}: {
  id: string;
  tiers: PricingTier[];
  features: PricingFeature[];
  billing: PricingBilling;
  money: Money;
  labels: PricingLabels;
  reduced: boolean;
}) {
  const captionId = useId();
  const regionRef = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);

  // The feature column sticks (with a solid backing) only while the table scrolls sideways.
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const measure = () => setScrolls(region.scrollWidth - region.clientWidth > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(region);
    return () => observer.disconnect();
  }, []);

  const grouped = features.some((f) => f.group);
  const groups = grouped
    ? Object.entries(
        features.reduce<Record<string, PricingFeature[]>>((acc, f) => {
          (acc[f.group ?? labels.otherGroup] ??= []).push(f);
          return acc;
        }, {}),
      )
    : [["", features] as [string, PricingFeature[]]];

  const stickyCell = cn(
    "sticky start-0 z-[1]",
    scrolls && "bg-sheen-surface shadow-[1px_0_0_var(--sheen-border)] forced-colors:bg-[Canvas]",
  );

  return (
    <MotionGlassCard
      id={id}
      level={2}
      sheen={false}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      animate={
        reduced
          ? { opacity: 1, transition: { duration: duration.fast } }
          : { opacity: 1, y: 0, transition: spring.snappy }
      }
      exit={reduced ? { opacity: 0, transition: exitTransition } : { opacity: 0, y: -4, transition: exitTransition }}
      className="min-w-0 overflow-hidden rounded-sheen-xl"
    >
      {/* Focusable so keyboard users can scroll it sideways on small screens. */}
      <div
        ref={regionRef}
        role="group"
        aria-labelledby={captionId}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so the table can be scrolled without a mouse (WCAG 2.1.1)
        tabIndex={0}
        className="overflow-x-auto overscroll-x-contain rounded-[inherit] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus"
      >
        <table className="w-full min-w-[40rem] border-collapse text-start [:where(&)_th]:text-start text-sm">
          <caption id={captionId} className="sr-only">
            {labels.comparison}
          </caption>
          <thead>
            <tr className="border-b border-sheen-border align-bottom">
              <th scope="col" className={cn("w-[28%] px-5 py-4 text-xs font-medium text-sheen-fg-muted", stickyCell)}>
                {labels.feature}
              </th>
              {tiers.map((tier) => {
                const price = tier.price ? tier.price[billing] : null;
                return (
                  <th
                    key={tier.id}
                    scope="col"
                    className={cn(
                      "px-4 py-4 text-center font-semibold text-sheen-fg",
                      tier.popular && "bg-sheen-accent-soft",
                    )}
                  >
                    <span className="block">{tier.name}</span>
                    <span className="block text-xs font-normal text-sheen-fg-muted tabular-nums">
                      {price === null ? (
                        (tier.priceLabel ?? labels.custom)
                      ) : (
                        <>
                          {money.format(price)}
                          <span aria-hidden>{` ${labels.perMonth}`}</span>
                          <span className="sr-only">{` ${labels.perMonthLong}`}</span>
                        </>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          {groups.map(([group, rows]) => (
            <tbody key={group || "all"}>
              {group && (
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={tiers.length + 1}
                    className="px-5 pt-5 pb-2 text-start text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase"
                  >
                    <span className="sticky start-5">{group}</span>
                  </th>
                </tr>
              )}
              {rows.map((feature) => (
                <tr key={feature.label} className="border-t border-sheen-border first:border-t-0 hover:bg-sheen-hover">
                  <th scope="row" className={cn("px-5 py-3 font-normal text-sheen-fg", stickyCell)}>
                    {feature.label}
                  </th>
                  {tiers.map((tier) => (
                    <td key={tier.id} className={cn("px-4 py-3 text-center", tier.popular && "bg-sheen-accent-soft")}>
                      <TableValue value={feature.values[tier.id] ?? false} labels={labels} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </MotionGlassCard>
  );
}

/** One comparison cell: a check, a dash or the value text. @internal */
export function TableValue({ value, labels }: { value: PricingFeatureValue; labels: PricingLabels }) {
  if (typeof value === "string") return <span className="font-medium text-sheen-fg tabular-nums">{value}</span>;
  return (
    <span className="inline-flex justify-center">
      <FeatureMark included={value} />
      <span className="sr-only">{value ? labels.included : labels.notIncluded}</span>
    </span>
  );
}

/* ---------- Icons ---------- */

/** The minus icon of a feature a plan lacks. @internal */
export function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
    >
      <path d="M6 12h12" />
    </svg>
  );
}

/** The spark icon of a highlighted plan. @internal */
export function SparkIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5c.4 4.6 2.9 7.1 7.5 7.5v.1c-4.6.4-7.1 2.9-7.5 7.5h-.1c-.4-4.6-2.9-7.1-7.5-7.5V10c4.6-.4 7.1-2.9 7.5-7.5Z" />
    </svg>
  );
}
