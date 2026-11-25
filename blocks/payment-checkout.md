Canonical: https://lokendra-builds.github.io/sheenui/blocks/payment-checkout

# React Checkout Form: Card & UPI Payment UI

URL: https://lokendra-builds.github.io/sheenui/blocks/payment-checkout
Sidebar name: Payment checkout

A glass payment checkout for React: card form with live card preview and formatting, a UPI option, order summary and success state. Tailwind CSS v4, MIT.

What it is: A glass React checkout form for card or UPI payments, with a live card preview, input formatting and an order summary.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/payment-checkout.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Payment checkout

Files to copy from `theme/src/`:

- `blocks/{payment-checkout.tsx, icons.tsx}`
- `components/button/`
- `components/glass-card/`
- `components/input/`
- `components/spinner/`
- `components/status-icons/`
- `components/tabs/`
- `blocks/payment-checkout/`
- `hooks/{use-direction.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, light-follower.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, heading.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: payment-checkout. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { PaymentCheckout, type PaymentDetails, type PaymentMethod } from "@/components/sheenui/blocks/payment-checkout";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { PaymentCheckout, type PaymentDetails, type PaymentMethod } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| lines | CheckoutLine[] | defaultLines | The order summary rows (CheckoutLine[], default: a small demo order). Amounts are in major units. The default is sample content for demos and prototypes: pass your own in production. |
| currency | string | "USD" | Sets the ISO 4217 currency code (string, default "USD"). |
| locale | string | "en-US" | BCP 47 locale used to format amounts (string, default "en-US"). |
| methods | PaymentMethod[] | ["card", "upi"] | Which payment methods to offer, in tab order (PaymentMethod[], default ["card", "upi"]). With one method the tabs are hidden. |
| onPay | ((method: PaymentMethod, details: PaymentDetails) => void \| Promise<void>) | optional, no default | Called with valid details when the user pays. Return a promise to show a loading state; throw to show an error. |
| onApplyPromo | ((code: string) => CheckoutLine \| null \| undefined \| Promise<CheckoutLine \| null \| undefined>) | optional, no default | Shows a promo-code field. Resolve to a discount line (negative amount) to apply it, or to null to reject the code. |
| assurances | { icon?: ReactNode; text: ReactNode; }[] | defaultAssurances | Short reassurance notes under the summary (default: two generic notes). Pass [] to hide them. The default is sample content for demos and prototypes: pass your own in production. |
| flipCard | boolean | true | Turns the card preview over to its back (the security code strip) while the CVC field has focus (boolean, default true). Reduced motion cross-fades the two sides instead of turning. |
| stateLight | boolean | true | Lights the card by state (boolean, default true): amber while the payment is processing, red after a refusal, green once paid. The state is always written as text too. |
| labels | Partial<PaymentCheckoutLabels> | defaultPaymentCheckoutLabels | Every other string, for translation: labels={{ title: "…" }}; omitted keys keep the English of defaultPaymentCheckoutLabels. All 38 keys of PaymentCheckoutLabels are listed in the key table under the props table. |
| headingLevel | HeadingLevelOption | 2 | Level of the headings (1 to 6, default 2); set it to fit the page's outline. "none" renders them as paragraphs with no heading role (for an example). |
| className | string | optional, no default | Adds extra classes to the outer glass card (string). |

## Example 1 of 3: Checkout

Fill in any 16-digit card number, a name, an expiry like 12/29 and a CVC, or a UPI ID like name@bank.

```tsx
import { PaymentCheckout, type PaymentDetails, type PaymentMethod } from "@/components/sheenui/blocks/payment-checkout";
// Package build (after the first npm release, or a packed tarball): import { PaymentCheckout, type PaymentDetails, type PaymentMethod } from "@sheenui/theme";

// Your call; send a provider token, not the raw card (see PCI note)
async function createPayment(method: PaymentMethod, details: PaymentDetails) {
  const res = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, details }),
  });
  if (!res.ok) throw new Error("Payment failed");
}

export function Example() {
  return (
    <PaymentCheckout
      currency="USD"
      lines={[
        { label: "Pro plan", description: "Billed monthly", amount: 29 },
        { label: "Sales tax (8%)", amount: 2.32 },
      ]}
      onPay={async (method, details) => {
        await createPayment(method, details);
      }}
    />
  );
}
```

## Example 2 of 3: Card only, in euros, with a promo code

One method hides the tabs; currency and locale format the amounts. Try the code SHEEN10: onApplyPromo resolves to a discount line, or to null to reject a code.

```tsx
import { PaymentCheckout, type PaymentDetails, type PaymentMethod } from "@/components/sheenui/blocks/payment-checkout";
// Package build (after the first npm release, or a packed tarball): import { PaymentCheckout, type PaymentDetails, type PaymentMethod } from "@sheenui/theme";

// Your call; send a provider token, not the raw card
async function createPayment(method: PaymentMethod, details: PaymentDetails) {
  const res = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, details }),
  });
  if (!res.ok) throw new Error("Payment failed");
}

export function Example() {
  return (
    <PaymentCheckout
      methods={["card"]}
      currency="EUR"
      locale="de-DE"
      lines={[
        { label: "Team plan", description: "5 seats, billed yearly", amount: 240 },
        { label: "VAT (19%)", amount: 45.6 },
      ]}
      onApplyPromo={(code) => (code.trim().toUpperCase() === "SHEEN10" ? { label: "Promo SHEEN10", amount: -24 } : null)}
      assurances={[{ text: "Invoice by email" }]}
      onPay={async (method, details) => {
        await createPayment(method, details);
      }}
    />
  );
}
```

## Example 3 of 3: Without the flip and the light

flipCard and stateLight are on by default. Turn them off for the plain card: the preview stays on its front and the card is never lit. The same states are still written as text.

```tsx
import { PaymentCheckout } from "@/components/sheenui/blocks/payment-checkout";
// Package build (after the first npm release, or a packed tarball): import { PaymentCheckout } from "@sheenui/theme";

export function Example() {
  return (
    <PaymentCheckout
      flipCard={false}
      stateLight={false}
      labels={{ title: "Plain card details", summary: "Plain order summary", processing: "Contacting your bank" }}
      onPay={() => new Promise<void>((resolve) => setTimeout(resolve, 1400))}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The method tabs, the fields, the promo field and the pay button. |
| ← / → | Switch between payment method tabs. |
| Enter on a field | Submit the form. |
| Focus into CVC | The card preview turns over to its back. |

## Accessibility

- The flip and the state light are visual only: processing is announced through a status region, a refusal is an alert and the paid result takes focus.
- Reduced motion: the preview cross-fades instead of turning, the check is drawn at once.
- Errors are visible text linked to their field (aria-describedby); a failed check focuses the first invalid field.
- onPay failures use role="alert"; promo changes and the paid result are announced through a status region.
- The numeric fields raise the numeric keyboard and carry autocomplete hints (cc-number, cc-exp, cc-csc).

## Card data and PCI DSS

The card fields are ordinary inputs, so onPay receives the raw card number, expiry and CVC. Do not post those to your own server: that puts it in PCI DSS scope (SAQ D). In production use your payment provider's hosted or tokenised fields (Stripe Elements, Adyen Drop-in, Braintree Hosted Fields) in place of the card inputs and pass only the token on, or treat this block as the layout and validation reference. The UPI method carries no card data.


## All exports on this page

- PaymentCheckout — A checkout card: card or UPI details with live validation, an order summary, an optional promo code and a success state.
- defaultPaymentCheckoutLabels — The English PaymentCheckoutLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the payment checkout form

- Use PaymentCheckout as a credit card form with a live card preview in the payment step of a purchase flow, where one side collects card or UPI details and the other shows an order summary with a total.
- Use it for a subscription upgrade screen, passing lines like a Pro plan billed monthly and an onApplyPromo callback that returns a negative discount line for a valid code.
- Use it for storefronts that serve India, since methods can be ["card", "upi"] or just ["upi"], and currency and locale control how every amount is formatted.
- Skip it when you need to collect raw card data on your own servers; use your payment provider's hosted or tokenized fields and treat this block as a layout and validation reference.
- Pair it with an Input for any billing address fields you add around it, and a Button-based confirmation page after the success panel. It already uses Tabs for method switching.


## Frequently asked questions

### How do I make a React checkout form with PaymentCheckout?

Pass lines (label, amount in major units, optional description), a currency such as USD, and onPay(method, details). Return a promise for the loading state or throw to show an error above the button. The block never calls a payment provider itself; it only hands you validated details.

### Is it safe to send the card number from onPay to my server?

No. For method card, onPay receives the raw card number, expiry and CVC, and posting them to your server puts you in PCI DSS scope. In production, replace the card inputs with your provider's hosted or tokenized fields, or use this block only as a design and validation reference.

### How do promo codes and the order total work?

Provide onApplyPromo(code). Resolve a CheckoutLine with a negative amount to apply the discount, or null to reject the code. Applied and removed codes are announced through a status region, and the total updates. Amounts use Intl formatting driven by the currency and locale props.

### How do the card and UPI tabs behave with the keyboard?

The method tabs are built on the Tabs component, so Left and Right switch between them and Tab moves into the fields. Numeric inputs raise the numeric keyboard and carry autocomplete hints (cc-number, cc-exp, cc-csc). With a single entry in methods, the tabs are hidden.


## Related pages

- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [Radio group](https://lokendra-builds.github.io/sheenui/forms/radio-group)
- [Dashboard stats](https://lokendra-builds.github.io/sheenui/blocks/dashboard-stats)
- [AI chat](https://lokendra-builds.github.io/sheenui/blocks/ai-chat)
- [Sign-up page](https://lokendra-builds.github.io/sheenui/blocks/signup-page)
- [Bento grid](https://lokendra-builds.github.io/sheenui/blocks/bento-grid)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
