Canonical: https://lokendra-builds.github.io/sheenui/blocks/pricing

# React Pricing Table with Monthly/Yearly Toggle

URL: https://lokendra-builds.github.io/sheenui/blocks/pricing
Sidebar name: Pricing

A glass React pricing section: monthly/yearly toggle, odometer prices, a border beam on the popular plan and a full comparison table. Tailwind v4 + Motion.

What it is: A glass React pricing table with a monthly/yearly toggle, prices that roll like an odometer and a full comparison table. Use Pricing as a pricing section with a monthly and yearly toggle for a SaaS product, with several tiers, billing that defaults to yearly, and a highlighted popular plan.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/pricing.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Pricing

Files to copy from `theme/src/`:

- `blocks/{pricing.tsx, icons.tsx}`
- `components/badge/`
- `components/button/`
- `components/glass-card/`
- `components/spinner/`
- `components/status-icons/`
- `blocks/pricing/`
- `hooks/{use-controllable.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, light-follower.ts, presets.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, heading.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: pricing. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Pricing } from "@/components/sheenui/blocks/pricing";
import { type PricingBilling, type PricingFeature, type PricingTier } from "@/components/sheenui/blocks/pricing/model";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Pricing, type PricingBilling, type PricingFeature, type PricingTier } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| tiers | PricingTier[] | defaultTiers (The default plan tiers) | The plans (PricingTier[], default: three sample tiers). The default is sample content for demos and prototypes: pass your own in production. |
| features | PricingFeature[] | defaultFeatures (The default feature rows of the comparison table) | Rows of the comparison table (PricingFeature[], default: sample features). The default is sample content for demos and prototypes: pass your own in production. |
| title | ReactNode | optional, no default | Heading above the block. Leave out to render without a heading. |
| description | ReactNode | optional, no default | Shows text under the heading (ReactNode). |
| headingLevel | HeadingLevelOption | 2 | Heading level of title, to fit the page outline. Tier names are one level below (2 \| 3, default 2). "none" renders both as paragraphs with no heading role, for a block shown as an example. |
| billing | PricingBilling | optional, no default | The billing period shown (controlled): "monthly" or "yearly". |
| defaultBilling | PricingBilling | "yearly" | The billing period at first when billing is not controlled (PricingBilling, default "yearly"). |
| onBillingChange | ((billing: PricingBilling) => void) | optional, no default | Called when the billing switch is flipped. |
| currency | string | "USD" | Sets the ISO 4217 currency code (string, default "USD"). |
| locale | string | "en-US" | BCP 47 locale for prices and the savings percentage (string, default "en-US"). |
| onSelect | ((tier: PricingTier, billing: PricingBilling) => void) | optional, no default | Called when a tier's button is pressed (tiers with href navigate as well). |
| compareOpen | boolean | optional, no default | Whether the comparison table is open (controlled). Pair with onCompareOpenChange. |
| defaultCompareOpen | boolean | false | Start with the comparison table open (boolean, default false). |
| onCompareOpenChange | ((open: boolean) => void) | optional, no default | Called when the comparison table opens or closes. |
| footnote | ReactNode | optional, no default | Small print under the cards, e.g. "Prices in USD. Taxes may apply." |
| labels | Partial<PricingLabels> | defaultPricingLabels | Every other string, for translation: labels={{ region: "…" }}; omitted keys keep the English of defaultPricingLabels. All 21 keys of PricingLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer <section>. |

## Example 1 of 2: Four tiers

Switch between monthly and yearly: every digit rolls to its new value. Hover or focus the popular tier to keep its beam circling, then open the comparison table.

```tsx
import { Pricing } from "@/components/sheenui/blocks/pricing";
import { type PricingBilling } from "@/components/sheenui/blocks/pricing/model";
// Package build (after the first npm release, or a packed tarball): import { Pricing, type PricingBilling } from "@sheenui/theme";

// Your call: create a checkout session, then send the person to it
async function startCheckout(tierId: string, billing: PricingBilling) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier: tierId, billing }),
  });
  const { url } = (await res.json()) as { url: string };
  window.location.assign(url);
}

export function Example() {
  return (
    <Pricing
      title="Simple pricing, no surprises"
      description="Start free, upgrade when your team grows. Cancel any time."
      footnote="Prices in USD, excluding taxes."
      onSelect={(tier, billing) => startCheckout(tier.id, billing)}
    />
  );
}
```

## Example 2 of 2: Your own tiers, currency and language

Three tiers in euros with German labels. Prices, the savings badge and the yearly total are formatted with Intl for the locale, and the comparison table starts open.

```tsx
import { Pricing } from "@/components/sheenui/blocks/pricing";
import { type PricingTier, type PricingFeature } from "@/components/sheenui/blocks/pricing/model";
// Package build (after the first npm release, or a packed tarball): import { Pricing, type PricingTier, type PricingFeature } from "@sheenui/theme";

const tiers: PricingTier[] = [
  { id: "basis", name: "Basis", price: { monthly: 9, yearly: 7.5 }, cta: "Jetzt starten" },
  { id: "studio", name: "Studio", price: { monthly: 29, yearly: 24 }, cta: "14 Tage testen", popular: true },
  { id: "konzern", name: "Konzern", cta: "Vertrieb kontaktieren" }, // no price: "Individuell"
];

const features: PricingFeature[] = [
  { label: "Projekte", values: { basis: "5", studio: "Unbegrenzt", konzern: "Unbegrenzt" } },
  { label: "Eigene Themes", values: { basis: false, studio: true, konzern: true } },
  // true = included, false = not included, a string = included with a detail
];

<Pricing
  tiers={tiers}
  features={features}
  currency="EUR"
  locale="de-DE"
  defaultBilling="monthly"
  defaultCompareOpen
  labels={{ region: "Preispläne", monthly: "Monatlich", yearly: "Jährlich", save: (p) => `${p} sparen`, perMonth: "/Monat" /* … */ }}
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The billing switch, each plan's button, then the “Compare plans” disclosure. |
| Space on the billing switch | Toggle monthly / yearly. |
| Enter / Space on Compare plans | Open the comparison table, which scrolls horizontally on small screens. |

## Accessibility

- A labeled <section>; tier names are headings one level below the title.
- The price is real text with its period, and the billing switch announces the saving.
- The comparison table has column and row headers.

## All exports on this page

- Pricing — Props (see PricingProps): tiers, features, title, description, headingLevel (2).
- defaultPricingLabels — The English strings of the pricing block; pass labels to override any of them.


## When to use the pricing section

- Use Pricing on the plans page of a subscription product to let visitors compare three tiers side by side, switch between monthly and yearly billing and see the popular plan stand out above a full feature table.
- Use it when buyers compare plans, since the Compare all features disclosure opens a feature table with column and row headers that scrolls horizontally on small screens.
- Use it for regional storefronts, setting currency and locale so prices such as euros or rupees are formatted correctly, with onSelect(tier, billing) sending the choice to checkout.
- Skip it when plans are priced per seat or by usage with a calculator; a form with a Slider and a live total communicates that better than fixed tier cards.
- Pair it with PaymentCheckout for the step after a plan is chosen, Badge for plan labels, and AuthSplit if the visitor must create an account first.


## Frequently asked questions

### How do I make a React pricing table with a billing toggle?

Render Pricing with tiers and optionally features, then handle onSelect(tier, billing). The billing prop is controlled, defaultBilling starts at yearly, and onBillingChange reports the switch. The billing switch announces the saving. Set title, description and footnote for the surrounding copy.

### Are the animated prices accessible?

Yes in practice: the price is real text with its period, so screen readers read it normally. Visually, prices roll like an odometer when they appear and when billing changes. With reduced motion there is no movement and the numbers switch immediately.

### Does the highlighted plan's light beam loop forever?

No. The popular plan's light beam circles twice when it scrolls into view and then rests, which respects WCAG 2.2.2 on moving content. It keeps circling only while that card is hovered or has focus. Reduced motion removes the movement altogether.

### How do I control the compare table and heading levels?

compareOpen, defaultCompareOpen (default false) and onCompareOpenChange control the disclosure. Tier names are headings one level below the title, and headingLevel defaults to 2, so adjust it to fit your page outline. The block renders as a labeled section.


## Related pages

- [Switch](https://lokendra-builds.github.io/sheenui/components/switch)
- [Badge](https://lokendra-builds.github.io/sheenui/components/badge)
- [Settings page](https://lokendra-builds.github.io/sheenui/blocks/settings-page)
- [Hero section](https://lokendra-builds.github.io/sheenui/blocks/hero-section)
- [Feature grid](https://lokendra-builds.github.io/sheenui/blocks/feature-grid)
- [Testimonials](https://lokendra-builds.github.io/sheenui/blocks/testimonials)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
