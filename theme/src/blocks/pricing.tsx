"use client";

import { useCallback, useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

import { cn } from "../lib/cn";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { useControllable } from "../hooks/use-controllable";
import { Button } from "../components/button/button";
import { HEADING_TAGS, headingBelow, headingTag } from "../lib/heading";

import {
  type PricingBilling,
  type PricingProps,
  defaultPricingLabels,
  defaultTiers,
  defaultFeatures,
  gridCols,
  useMoney,
  bestSaving,
} from "./pricing/model";
import { BillingSwitch, PricingCard, ComparisonTable } from "./pricing/parts";

export {
  defaultPricingLabels,
  type PricingBilling,
  type PricingTier,
  type PricingFeatureValue,
  type PricingFeature,
  type PricingLabels,
  type PricingProps,
} from "./pricing/model";
/* ---------- Block ---------- */

/**
 * Props (see `PricingProps`): `tiers`, `features`, `title`, `description`, `headingLevel` (`2`),
 * `billing` / `defaultBilling` (`"yearly"`) / `onBillingChange`, `currency` (`"USD"`), `locale`
 * (`"en-US"`), `onSelect(tier, billing)`, `compareOpen`, `defaultCompareOpen` (`false`), `onCompareOpenChange`, `footnote`, `labels`,
 * `className`.
 * Keyboard: Tab reaches the billing switch (Space toggles it), each plan's button and the "Compare
 * plans" disclosure (Enter or Space opens the table, which scrolls horizontally on small screens).
 * Accessibility: a labelled `<section>`; tier names are headings one level below the title; the price
 * is real text with its period; the billing switch announces the saving; the table has column and row
 * headers.
 * Glass and motion: one glass card per plan; prices roll like an odometer when they appear and when
 * the billing changes, and the popular plan's light beam circles twice when it scrolls into view, then
 * rests (WCAG 2.2.2). Reduced motion: no movement, prices switch at once.
 *
 * @example
 * ```tsx
 * import { Pricing } from "@sheenui/theme";
 *
 * const checkout = (tierId: string, billing: string) => {
 *   window.location.href = `/checkout?plan=${tierId}&billing=${billing}`;
 * };
 *
 * export function Example() {
 *   return (
 *     <Pricing
 *       title="Simple pricing"
 *       currency="USD"
 *       onSelect={(tier, billing) => checkout(tier.id, billing)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/pricing
 */
export function Pricing({
  tiers = defaultTiers,
  features = defaultFeatures,
  title,
  description,
  headingLevel = 2,
  billing: billingProp,
  defaultBilling = "yearly",
  onBillingChange,
  currency = "USD",
  locale = "en-US",
  onSelect,
  compareOpen: compareOpenProp,
  defaultCompareOpen = false,
  onCompareOpenChange,
  footnote,
  labels,
  className,
}: PricingProps) {
  const L = { ...defaultPricingLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const money = useMoney(locale, currency);
  const headingId = useId();
  const tableId = useId();

  const [innerBilling, setInnerBilling] = useState<PricingBilling>(defaultBilling);
  const billing = billingProp ?? innerBilling;
  const [announcement, setAnnouncement] = useState("");
  const [compareOpen, setCompareOpen] = useControllable(compareOpenProp, defaultCompareOpen, onCompareOpenChange);

  // Each card notices on its own when it scrolls into view (a tall stack of cards can never
  // be a set fraction visible on a short landscape screen). Cards that arrive together, like
  // a row of them, share a batch and stagger within it.
  const batch = useRef({ at: -Infinity, count: 0 });
  const nextDelay = useCallback(() => {
    const now = performance.now();
    if (now - batch.current.at > 160) batch.current = { at: now, count: 0 };
    return batch.current.count++ * 0.07;
  }, []);
  const hasCardFeatures = features.some((f) => f.inCards !== false);

  const saving = bestSaving(tiers);
  const hasPrices = tiers.some((t) => t.price);
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];

  function changeBilling(next: PricingBilling) {
    if (next === billing) return;
    setInnerBilling(next);
    onBillingChange?.(next);
    setAnnouncement(L.pricesShown(next));
  }

  return (
    <section
      role="group"
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : L.region}
      data-slot="pricing"
      className={cn("@container flex w-full min-w-0 flex-col gap-8", className)}
    >
      {(Boolean(title) || Boolean(description) || hasPrices) && (
        <div className="flex flex-col items-center gap-4 text-center">
          {title && (
            <Heading id={headingId} className="text-3xl font-semibold tracking-tight text-balance @xl:text-4xl">
              {title}
            </Heading>
          )}
          {description && <p className="max-w-xl text-base text-pretty text-sheen-fg-muted">{description}</p>}
          {hasPrices && (
            <BillingSwitch
              value={billing}
              onChange={changeBilling}
              savePercent={saving > 0 ? money.percent(saving) : null}
              labels={L}
              reduced={reduced}
            />
          )}
          {/* Announces the switch to screen readers; the radios already say which period is chosen. */}
          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </div>
      )}

      {/* Each card spans these rows as a subgrid (header, price, button, features), so prices,
          buttons and feature lists line up across a row of cards whatever the copy length. */}
      <div
        className={cn("grid items-stretch gap-4 pt-3 @4xl:gap-5", gridCols[Math.min(tiers.length, 4)] ?? gridCols[4])}
      >
        {tiers.map((tier, index) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            previous={tiers[index - 1]}
            billing={billing}
            features={features}
            rows={hasCardFeatures ? 4 : 3}
            money={money}
            labels={L}
            nextDelay={nextDelay}
            reduced={reduced}
            headingLevel={headingTag(headingLevel, 1)}
            onSelect={onSelect}
          />
        ))}
      </div>

      {(features.length > 0 || footnote) && (
        <div className="flex flex-col items-center gap-3">
          {footnote && <p className="text-center text-xs text-sheen-fg-muted">{footnote}</p>}
          {features.length > 0 && (
            <Button
              variant="glass"
              aria-expanded={compareOpen}
              aria-controls={compareOpen ? tableId : undefined}
              onClick={() => setCompareOpen((open) => !open)}
              trailing={
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className={cn(
                    "size-4 motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
                    compareOpen && "rotate-180",
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              }
            >
              {compareOpen ? L.hideCompare : L.compare}
            </Button>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {compareOpen && features.length > 0 && (
          <ComparisonTable
            key="table"
            id={tableId}
            tiers={tiers}
            features={features}
            billing={billing}
            money={money}
            labels={L}
            reduced={reduced}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
