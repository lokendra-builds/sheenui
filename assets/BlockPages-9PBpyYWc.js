import{r as e}from"./demo-utils-DKtmFFFD.js";import{t}from"./lazy-block-BfzH_8EP.js";import{i as n,n as r,o as i,r as a}from"./Page-ClekXXh-.js";import{t as o}from"./Example-jva669kg.js";import{a as s}from"./BlockStages.forms-CZ1yRCeX.js";import{t as c}from"./vendor-react-D30i__oY.js";import{t as l}from"./preload-helper-BrmCrVM7.js";var u=[[`lines`,`CheckoutLine[]`,`defaultLines`,"The order summary rows (`CheckoutLine[]`, default: a small demo order). Amounts are in major units. The default is sample content for demos and prototypes: pass your own in production.",!1],[`currency`,`string`,`"USD"`,'Sets the ISO 4217 currency code (`string`, default `"USD"`).',!1],[`locale`,`string`,`"en-US"`,'BCP 47 locale used to format amounts (`string`, default `"en-US"`).',!1],[`methods`,`PaymentMethod[]`,`["card", "upi"]`,'Which payment methods to offer, in tab order (`PaymentMethod[]`, default `["card", "upi"]`). With one method the tabs are hidden.',!1],[`onPay`,`((method: PaymentMethod, details: PaymentDetails) => void | Promise<void>)`,``,`Called with valid details when the user pays. Return a promise to show a loading state; throw to show an error.`,!1],[`onApplyPromo`,`((code: string) => CheckoutLine | null | undefined | Promise<CheckoutLine | null | undefined>)`,``,`Shows a promo-code field. Resolve to a discount line (negative amount) to apply it, or to null to reject the code.`,!1],[`assurances`,`{ icon?: ReactNode; text: ReactNode; }[]`,`defaultAssurances`,`Short reassurance notes under the summary (default: two generic notes). Pass [] to hide them. The default is sample content for demos and prototypes: pass your own in production.`,!1],[`flipCard`,`boolean`,`true`,"Turns the card preview over to its back (the security code strip) while the CVC field has focus (`boolean`, default `true`). Reduced motion cross-fades the two sides instead of turning.",!1],[`stateLight`,`boolean`,`true`,"Lights the card by state (`boolean`, default `true`): amber while the payment is processing, red after a refusal, green once paid. The state is always written as text too.",!1],[`labels`,`Partial<PaymentCheckoutLabels>`,`defaultPaymentCheckoutLabels`,'Every other string, for translation: `labels={{ title: "…" }}`; omitted keys keep the English of `defaultPaymentCheckoutLabels`. All 38 keys of `PaymentCheckoutLabels` are listed in the key table under the props table.',!1,{type:`PaymentCheckoutLabels`,const:`defaultPaymentCheckoutLabels`,keys:[[`title`,`Payment details`],[`subtitle`,`Choose how you'd like to pay.`],[`methodLabel`,`Payment method`],[`card`,`Card`],[`upi`,`UPI`],[`cardNumber`,`Card number`],[`cardName`,`Name on card`],[`cardNamePlaceholder`,`Jane Doe`],[`expiry`,`Expiry`],[`cvc`,`CVC`],[`upiId`,`UPI ID`],[`upiPlaceholder`,`name@bank`],[`upiHint`,`We'll send a payment request to your UPI app.`],[`pay`,"(amount) => `Pay ${amount}`"],[`payFailed`,`Your payment didn't go through. Check your details and try again.`],[`errorCardNumber`,`Enter the 16-digit card number.`],[`errorCardName`,`Enter the name shown on the card.`],[`errorExpiry`,`Use the format MM/YY.`],[`errorExpired`,`This card has expired.`],[`errorCvc`,`Enter 3 or 4 digits.`],[`errorUpi`,`Enter a UPI ID like name@bank.`],[`summary`,`Order summary`],[`amountDue`,`Amount due`],[`total`,`Total due today`],[`promo`,`Promo code`],[`promoPlaceholder`,`Enter a code`],[`promoApply`,`Apply`],[`promoInvalid`,`That code isn't valid.`],[`promoEmpty`,`Enter a promo code first.`],[`promoApplied`,"(code, total) => `${code} applied. New total ${total}.`"],[`promoRemoveShort`,`Remove`],[`promoRemove`,"(code) => `Remove promo code ${code}`"],[`promoRemoved`,"(total) => `Promo code removed. Total ${total}.`"],[`success`,`Payment successful`],[`successBody`,"(amount) => `${amount} paid. A receipt is on its way.`"],[`again`,`Make another payment`],[`previewName`,`Your name`],[`processing`,`Processing your payment`]]}],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the headings (`1` to `6`, default `2`); set it to fit the page\'s outline. `"none"` renders them as paragraphs with no heading role (for an example).',!1],[`className`,`string`,``,"Adds extra classes to the outer glass card (`string`).",!1]],d=c();t(()=>l(()=>import(`./dashboard-stats-CF8TzT6c.js`).then(e=>e.DashboardStats),[]),{minHeight:`24rem`}),t(()=>l(()=>import(`./glass-login-D-ovMPE7.js`).then(e=>e.GlassLogin),[]),{minHeight:`24rem`}),t(()=>l(()=>import(`./lamp-login-DTPTcjCc.js`).then(e=>e.LampLogin),[]),{minHeight:`24rem`}),t(()=>l(()=>import(`./otp-verification-Biqt-IFN.js`).then(e=>e.OtpVerification),[]),{minHeight:`24rem`});var f=t(()=>l(()=>import(`./payment-checkout-4ttxUhN8.js`).then(e=>e.PaymentCheckout),[]),{minHeight:`24rem`});function p(){return(0,d.jsxs)(r,{eyebrow:`Block`,title:`Payment checkout`,description:`Card or UPI with a live card preview that turns over for the CVC, input formatting, an order summary, and a card that glows by state: amber while processing, red on a refusal, green with a drawn check when paid. Built from GlassCard, Tabs, Input and Button.`,source:`theme/src/blocks/payment-checkout.tsx`,children:[(0,d.jsx)(s,{}),(0,d.jsx)(o,{title:`Checkout`,stageClassName:`min-h-[40rem] p-3 sm:p-10`,description:`Fill in any 16-digit card number, a name, an expiry like 12/29 and a CVC, or a UPI ID like name@bank.`,code:`
import { PaymentCheckout, type PaymentDetails, type PaymentMethod } from "@sheenui/theme";

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
}`,children:(0,d.jsx)(f,{headingLevel:`none`,onPay:()=>e(1400)})}),(0,d.jsx)(o,{title:`Card only, in euros, with a promo code`,stageClassName:`min-h-[40rem] p-3 sm:p-10`,description:`One method hides the tabs; currency and locale format the amounts. Try the code SHEEN10: onApplyPromo resolves to a discount line, or to null to reject a code.`,code:`
import { PaymentCheckout, type PaymentDetails, type PaymentMethod } from "@sheenui/theme";

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
}`,children:(0,d.jsx)(`div`,{lang:`de`,className:`contents`,children:(0,d.jsx)(f,{headingLevel:`none`,methods:[`card`],currency:`EUR`,locale:`de-DE`,lines:[{label:`Team plan`,description:`5 seats, billed yearly`,amount:240},{label:`VAT (19%)`,amount:45.6}],onApplyPromo:e=>e.trim().toUpperCase()===`SHEEN10`?{label:`Promo SHEEN10`,amount:-24}:null,assurances:[{text:`Invoice by email`}],labels:{title:`Card payment details`,summary:`Team order summary`},onPay:()=>e(1400)})})}),(0,d.jsx)(o,{title:`Without the flip and the light`,stageClassName:`min-h-[40rem] p-3 sm:p-10`,description:`flipCard and stateLight are on by default. Turn them off for the plain card: the preview stays on its front and the card is never lit. The same states are still written as text.`,code:`
import { PaymentCheckout } from "@sheenui/theme";

export function Example() {
  return (
    <PaymentCheckout
      flipCard={false}
      stateLight={false}
      labels={{ title: "Plain card details", summary: "Plain order summary", processing: "Contacting your bank" }}
      onPay={() => new Promise<void>((resolve) => setTimeout(resolve, 1400))}
    />
  );
}`,children:(0,d.jsx)(f,{headingLevel:`none`,flipCard:!1,stateLight:!1,labels:{title:`Plain card details`,summary:`Plain order summary`,processing:`Contacting your bank`},onPay:()=>e(1400)})}),(0,d.jsxs)(`section`,{"aria-labelledby":`pci-note`,className:`glass-2 flex max-w-3xl flex-col gap-2 rounded-sheen-lg p-5 text-sm`,children:[(0,d.jsx)(`h2`,{id:`pci-note`,className:`text-lg font-semibold tracking-tight`,children:`Card data and PCI DSS`}),(0,d.jsxs)(`p`,{className:`text-sheen-fg-muted`,children:[`The card fields are ordinary inputs, so `,(0,d.jsx)(`code`,{children:`onPay`}),` receives the raw card number, expiry and CVC. Do not post those to your own server: that puts it in PCI DSS scope (SAQ D). In production use your payment provider's hosted or tokenised fields (Stripe Elements, Adyen Drop-in, Braintree Hosted Fields) in place of the card inputs and pass only the token on, or treat this block as the layout and validation reference. The UPI method carries no card data.`]})]}),(0,d.jsx)(a,{of:u}),(0,d.jsx)(i,{rows:[[`Tab`,`The method tabs, the fields, the promo field and the pay button.`],[`← / →`,`Switch between payment method tabs.`],[`Enter on a field`,`Submit the form.`],[`Focus into CVC`,`The card preview turns over to its back.`]]}),(0,d.jsx)(n,{notes:[`The flip and the state light are visual only: processing is announced through a status region, a refusal is an alert and the paid result takes focus.`,`Reduced motion: the preview cross-fades instead of turning, the check is drawn at once.`,`Errors are visible text linked to their field (aria-describedby); a failed check focuses the first invalid field.`,`onPay failures use role="alert"; promo changes and the paid result are announced through a status region.`,`The numeric fields raise the numeric keyboard and carry autocomplete hints (cc-number, cc-exp, cc-csc).`]})]})}export{p as default};