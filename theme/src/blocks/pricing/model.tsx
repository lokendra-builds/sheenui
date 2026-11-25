"use client";

import type { HeadingLevelOption } from "../../lib/heading";
import { useMemo, type ReactNode } from "react";

/**
 * Pricing: tier cards with a monthly / yearly switch, prices that roll like an odometer,
 * a "Most popular" tier traced by a beam of light, and a full feature comparison table.
 *
 * Motion
 *   - Cards rise in one after another the first time the block scrolls into view (the glass
 *     cards themselves move, never a wrapper around them).
 *   - Prices roll digit by digit when they first appear and whenever the billing period
 *     changes. The visual digits are hidden from screen readers, which read the final price.
 *   - The popular tier's beam circles twice when it comes into view (under 5 s, WCAG 2.2.2),
 *     then rests; it keeps circling while the card is hovered or has focus.
 *   - Reduced motion (OS or [data-motion="reduced"]): no movement at all. Prices switch at
 *     once, the beam rests, the cards and the table only fade.
 *
 * Layout follows the block's own width (container queries), so it stacks correctly in a
 * sidebar layout as well as full width: 1 column, then 2, then one per tier.
 */

export type PricingBilling = "monthly" | "yearly";

/** One plan: id, name, description, monthly and yearly price (or a `priceLabel` for "talk to us" tiers), button text and link, the `popular` highlight and the "Everything in X, plus:" line. */
export type PricingTier = {
  /** Stable id; feature values are keyed by it. */
  id: string;
  name: string;
  description?: ReactNode;
  /**
   * Price per month, in major units, for each billing period (yearly = the monthly price
   * when paid yearly). Leave it out for "talk to us" tiers: `priceLabel` is shown instead.
   */
  price?: { monthly: number; yearly: number };
  /** Shown instead of a price when `price` is left out. Defaults to labels.custom. */
  priceLabel?: string;
  /** Button text. */
  cta: string;
  /** Turns the button into a link. */
  href?: string;
  /** The highlighted tier: beam border, tinted glass, filled button and the "Most popular" badge. */
  popular?: boolean;
  /**
   * Line above the card's feature list, e.g. "Everything in Pro, plus:". When it is set, the
   * card lists only what this tier adds over the tier before it (features that are included
   * here with a different value), so the line and the list never contradict each other.
   */
  featuresTitle?: string;
};

/** true = included, false = not included, a string = included with a detail ("10 GB"). */
export type PricingFeatureValue = boolean | string;

/** One row of the feature comparison: label, optional group heading, a value per tier id (true, false or a detail string) and whether it is also listed on the tier cards. */
export type PricingFeature = {
  label: string;
  /** Rows with the same group sit under one heading in the comparison table. */
  group?: string;
  /** Value per tier id. A missing tier reads as not included. */
  values: Record<string, PricingFeatureValue>;
  /** List this feature on the tier cards too (default true). Table-only rows set false. */
  inCards?: boolean;
};

/** Every user-facing string, so the block can be translated. */
export type PricingLabels = {
  /** Accessible name of the block when it has no `title`. */
  region: string;
  /** Accessible name of the billing switch. */
  billing: string;
  monthly: string;
  yearly: string;
  /** Savings badge on the yearly option. Receives the formatted percentage ("20%"). */
  save: (percent: string) => string;
  /** Short suffix after a price ("/mo"). */
  perMonth: string;
  /** Spoken suffix after a price ("per month"). */
  perMonthLong: string;
  billedMonthly: string;
  /** Receives the formatted yearly total. */
  billedYearly: (total: string) => string;
  /** Note under a price of 0. */
  free: string;
  /** Price text for tiers without a price. */
  custom: string;
  /** Note under a custom price. */
  customNote: string;
  popular: string;
  included: string;
  notIncluded: string;
  compare: string;
  hideCompare: string;
  /** Caption of the comparison table. */
  comparison: string;
  /** Header of the feature column. */
  feature: string;
  /** Group heading for features without a group, when other features have one. */
  otherGroup: string;
  /** Announced after the billing period changes. */
  pricesShown: (billing: PricingBilling) => string;
};

/** Props of `Pricing`. Everything is optional: with none it shows three sample plans. */
export type PricingProps = {
  /** The plans (`PricingTier[]`, default: three sample tiers). The default is sample content for demos and prototypes: pass your own in production. */
  tiers?: PricingTier[];
  /** Rows of the comparison table (`PricingFeature[]`, default: sample features). The default is sample content for demos and prototypes: pass your own in production. */
  features?: PricingFeature[];
  /** Heading above the block. Leave out to render without a heading. */
  title?: ReactNode;
  /** Shows text under the heading (`ReactNode`). */
  description?: ReactNode;
  /** Heading level of `title`, to fit the page outline. Tier names are one level below (`2 | 3`, default 2). `"none"` renders both as paragraphs with no heading role, for a block shown as an example. */
  headingLevel?: HeadingLevelOption;
  /** The billing period shown (controlled): `"monthly"` or `"yearly"`. */
  billing?: PricingBilling;
  /** The billing period at first when `billing` is not controlled (`PricingBilling`, default `"yearly"`). */
  defaultBilling?: PricingBilling;
  /** Called when the billing switch is flipped. */
  onBillingChange?: (billing: PricingBilling) => void;
  /** Sets the ISO 4217 currency code (`string`, default `"USD"`). */
  currency?: string;
  /** BCP 47 locale for prices and the savings percentage (`string`, default `"en-US"`). */
  locale?: string;
  /** Called when a tier's button is pressed (tiers with `href` navigate as well). */
  onSelect?: (tier: PricingTier, billing: PricingBilling) => void;
  /** Whether the comparison table is open (controlled). Pair with `onCompareOpenChange`. */
  compareOpen?: boolean;
  /** Start with the comparison table open (`boolean`, default `false`). */
  defaultCompareOpen?: boolean;
  /** Called when the comparison table opens or closes. */
  onCompareOpenChange?: (open: boolean) => void;
  /** Small print under the cards, e.g. "Prices in USD. Taxes may apply." */
  footnote?: ReactNode;
  /** Overrides for the built-in English strings (`Partial<PricingLabels>`). */
  labels?: Partial<PricingLabels>;
  /** Adds extra classes to the outer <section>. */
  className?: string;
};

/** The English strings of the pricing block; pass `labels` to override any of them. */
export const defaultPricingLabels: PricingLabels = {
  region: "Pricing plans",
  billing: "Billing period",
  monthly: "Monthly",
  yearly: "Yearly",
  save: (percent) => `Save ${percent}`,
  perMonth: "/mo",
  perMonthLong: "per month",
  billedMonthly: "Billed monthly",
  billedYearly: (total) => `Billed ${total} yearly`,
  free: "Free forever",
  custom: "Custom",
  customNote: "Volume pricing for your org",
  popular: "Most popular",
  included: "Included",
  notIncluded: "Not included",
  compare: "Compare all features",
  hideCompare: "Hide comparison",
  comparison: "Feature comparison",
  feature: "Feature",
  otherGroup: "Other",
  pricesShown: (billing) => `Showing ${billing} prices`,
};

/** The default plan tiers. @internal */
export const defaultTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For side projects and trying things out.",
    price: { monthly: 0, yearly: 0 },
    cta: "Start for free",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For freelancers and small teams shipping fast.",
    price: { monthly: 25, yearly: 20 },
    cta: "Start 14-day trial",
    popular: true,
    featuresTitle: "Everything in Starter, plus:",
  },
  {
    id: "team",
    name: "Team",
    description: "For growing teams that need shared control.",
    price: { monthly: 50, yearly: 40 },
    cta: "Upgrade to Team",
    featuresTitle: "Everything in Pro, plus:",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Security, scale and support for large orgs.",
    cta: "Contact sales",
    featuresTitle: "Everything in Team, plus:",
  },
];

/** The default feature rows of the comparison table. @internal */
export const defaultFeatures: PricingFeature[] = [
  {
    group: "Essentials",
    label: "Projects",
    values: { starter: "3", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
  },
  {
    group: "Essentials",
    label: "Storage",
    values: { starter: "5 GB", pro: "100 GB", team: "1 TB", enterprise: "Custom" },
  },
  {
    group: "Essentials",
    label: "Every glass component",
    inCards: false,
    values: { starter: true, pro: true, team: true, enterprise: true },
  },
  { group: "Essentials", label: "Custom themes", values: { starter: false, pro: true, team: true, enterprise: true } },
  {
    group: "Collaboration",
    label: "Team members",
    values: { starter: "1", pro: "5", team: "50", enterprise: "Unlimited" },
  },
  {
    group: "Collaboration",
    label: "Shared libraries",
    values: { starter: false, pro: true, team: true, enterprise: true },
  },
  {
    group: "Collaboration",
    label: "Comments and reviews",
    inCards: false,
    values: { starter: false, pro: false, team: true, enterprise: true },
  },
  {
    group: "Collaboration",
    label: "Version history",
    inCards: false,
    values: { starter: "7 days", pro: "90 days", team: "1 year", enterprise: "Unlimited" },
  },
  {
    group: "Security and support",
    label: "SSO and SAML",
    values: { starter: false, pro: false, team: true, enterprise: true },
  },
  {
    group: "Security and support",
    label: "Audit log",
    inCards: false,
    values: { starter: false, pro: false, team: false, enterprise: true },
  },
  {
    group: "Security and support",
    label: "Uptime SLA",
    inCards: false,
    values: { starter: false, pro: false, team: "99.9%", enterprise: "99.99%" },
  },
  {
    group: "Security and support",
    label: "Support",
    values: { starter: "Community", pro: "Email", team: "Priority", enterprise: "Dedicated" },
  },
];

/* Grid columns per tier count, by the block's own width (written out in full for Tailwind). */
/** The grid column classes for each tier count. @internal */
export const gridCols: Record<number, string> = {
  1: "grid-cols-1 max-w-md mx-auto",
  2: "grid-cols-1 @xl:grid-cols-2 max-w-3xl mx-auto",
  3: "grid-cols-1 @xl:grid-cols-2 @3xl:grid-cols-3",
  4: "grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-4",
};

/* ---------- Number formatting ---------- */

/** The price formatters for one locale and currency. @internal */
export type Money = {
  /** Price parts for the rolling display. */
  parts: (value: number) => Intl.NumberFormatPart[];
  format: (value: number) => string;
  /** The locale's own digits 0–9 (Latin, Arabic-Indic, Devanagari...), for the rolling strips. */
  digits: string[];
  percent: (fraction: number) => string;
};

/** Builds memoised price formatters for a locale and currency. @internal */
export function useMoney(locale: string, currency: string): Money {
  return useMemo(() => {
    const whole = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const cents = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const pick = (value: number) => (Number.isInteger(value) ? whole : cents);
    const plain = new Intl.NumberFormat(locale, { useGrouping: false });
    const pct = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
    return {
      parts: (value) => pick(value).formatToParts(value),
      format: (value) => pick(value).format(value),
      digits: Array.from({ length: 10 }, (_, i) => plain.format(i)),
      percent: (fraction) => pct.format(fraction),
    };
  }, [locale, currency]);
}

/** Largest yearly saving across the tiers, as a fraction (0.2 = 20%). */
export function bestSaving(tiers: PricingTier[]) {
  let best = 0;
  for (const tier of tiers) {
    const p = tier.price;
    if (p && p.monthly > 0 && p.yearly < p.monthly) best = Math.max(best, 1 - p.yearly / p.monthly);
  }
  return best;
}
