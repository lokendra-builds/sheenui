"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type SubmitEvent } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../lib/cn";
import { spring } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { Button } from "../components/button/button";
import { GlassCard } from "../components/glass-card/glass-card";
import { Input } from "../components/input/input";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../components/tabs/tabs";
import { AlertIcon, CardIcon, LockIcon, RefreshIcon, TagIcon } from "./icons";
import { CardPreview, StateLight, SuccessPanel, type CheckoutLightState } from "./payment-checkout/parts";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../lib/heading";

/** One row of the order summary (`PaymentCheckout`'s `lines`, or a discount returned by `onApplyPromo`). */
export type CheckoutLine = {
  /** The row's name ("Pro plan"). */
  label: string;
  /** In major units (e.g. 29.5 = $29.50). Use a negative amount for discounts. */
  amount: number;
  /** Optional second line, e.g. "Billed monthly". */
  description?: string;
};

/** The payment methods the block can offer. */
export type PaymentMethod = "card" | "upi";

/**
 * What `onPay` receives: the validated card or UPI details, discriminated by `method`.
 *
 * PCI warning: for `method: "card"` these are the raw card number, expiry and CVC. Sending them to your own server puts
 * it in PCI DSS scope (SAQ D). Treat this block as a demo and design reference; in production collect card data in
 * your payment provider's hosted or tokenised fields (Stripe Elements, Adyen Drop-in, Braintree Hosted Fields) and
 * pass only the token on.
 */
export type PaymentDetails =
  { method: "card"; number: string; name: string; expiry: string; cvc: string } | { method: "upi"; upiId: string };

/** Every user-facing string, so the block can be translated. Functions receive the formatted amount. */
export type PaymentCheckoutLabels = {
  /** Form heading. */
  title: string;
  /** Line under the heading. */
  subtitle: string;
  /** Accessible name of the method tabs. */
  methodLabel: string;
  /** Card tab text. */
  card: string;
  /** UPI tab text. */
  upi: string;
  /** Card number field label. */
  cardNumber: string;
  /** Cardholder name label. */
  cardName: string;
  /** Cardholder name placeholder. */
  cardNamePlaceholder: string;
  /** Expiry field label. */
  expiry: string;
  /** Security code label. */
  cvc: string;
  /** UPI ID field label. */
  upiId: string;
  /** UPI ID placeholder. */
  upiPlaceholder: string;
  /** Helper text under the UPI field. */
  upiHint: string;
  /** Pay button text; receives the formatted total. */
  pay: (amount: string) => string;
  /** Shown when `onPay` throws without a message. */
  payFailed: string;
  /** Error for a bad card number. */
  errorCardNumber: string;
  /** Error for a missing name. */
  errorCardName: string;
  /** Error for a malformed expiry. */
  errorExpiry: string;
  /** Error for a card that has expired. */
  errorExpired: string;
  /** Error for a bad security code. */
  errorCvc: string;
  /** Error for a bad UPI ID. */
  errorUpi: string;
  /** Order summary heading. */
  summary: string;
  /** Caption of the amount at the top of the summary. */
  amountDue: string;
  /** Label of the total row. */
  total: string;
  /** Promo field label. */
  promo: string;
  /** Promo field placeholder. */
  promoPlaceholder: string;
  /** Apply button text. */
  promoApply: string;
  /** Error for a code `onApplyPromo` rejected. */
  promoInvalid: string;
  /** Error for an empty promo field. */
  promoEmpty: string;
  /** Announcement after a code is applied. */
  promoApplied: (code: string, total: string) => string;
  /** Visible text of the remove-code button. */
  promoRemoveShort: string;
  /** Accessible name of the remove-code button. */
  promoRemove: (code: string) => string;
  /** Announcement after a code is removed. */
  promoRemoved: (total: string) => string;
  /** Success heading after paying. */
  success: string;
  /** Success body; receives the formatted amount. */
  successBody: (amount: string) => string;
  /** Text of the button that brings the form back. */
  again: string;
  /** Name shown on the card preview before one is typed. */
  previewName: string;
  /** Announced (and shown to nobody else) while the payment is being processed. */
  processing: string;
};

/** Props of `PaymentCheckout`. */
export type PaymentCheckoutProps = {
  /** The order summary rows (`CheckoutLine[]`, default: a small demo order). Amounts are in major units. The default is sample content for demos and prototypes: pass your own in production. */
  lines?: CheckoutLine[];
  /** Sets the ISO 4217 currency code (`string`, default `"USD"`). */
  currency?: string;
  /** BCP 47 locale used to format amounts (`string`, default `"en-US"`). */
  locale?: string;
  /** Which payment methods to offer, in tab order (`PaymentMethod[]`, default `["card", "upi"]`). With one method the tabs are hidden. */
  methods?: PaymentMethod[];
  /** Called with valid details when the user pays. Return a promise to show a loading state; throw to show an error. */
  onPay?: (method: PaymentMethod, details: PaymentDetails) => void | Promise<void>;
  /**
   * Shows a promo-code field. Resolve to a discount line (negative amount) to apply it,
   * or to null to reject the code.
   */
  onApplyPromo?: (code: string) => CheckoutLine | null | undefined | Promise<CheckoutLine | null | undefined>;
  /** Short reassurance notes under the summary (default: two generic notes). Pass [] to hide them. The default is sample content for demos and prototypes: pass your own in production. */
  assurances?: { icon?: ReactNode; text: ReactNode }[];
  /** Turns the card preview over to its back (the security code strip) while the CVC field has focus (`boolean`, default `true`). Reduced motion cross-fades the two sides instead of turning. */
  flipCard?: boolean;
  /** Lights the card by state (`boolean`, default `true`): amber while the payment is processing, red after a refusal, green once paid. The state is always written as text too. */
  stateLight?: boolean;
  /** Overrides for the built-in English strings (`Partial<PaymentCheckoutLabels>`). */
  labels?: Partial<PaymentCheckoutLabels>;
  /** Level of the headings (`1` to `6`, default `2`); set it to fit the page's outline. `"none"` renders them as paragraphs with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
  /** Adds extra classes to the outer glass card (`string`). */
  className?: string;
};

/** The English {@link PaymentCheckoutLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultPaymentCheckoutLabels: PaymentCheckoutLabels = {
  title: "Payment details",
  subtitle: "Choose how you'd like to pay.",
  methodLabel: "Payment method",
  card: "Card",
  upi: "UPI",
  cardNumber: "Card number",
  cardName: "Name on card",
  cardNamePlaceholder: "Jane Doe",
  expiry: "Expiry",
  cvc: "CVC",
  upiId: "UPI ID",
  upiPlaceholder: "name@bank",
  upiHint: "We'll send a payment request to your UPI app.",
  pay: (amount) => `Pay ${amount}`,
  payFailed: "Your payment didn't go through. Check your details and try again.",
  errorCardNumber: "Enter the 16-digit card number.",
  errorCardName: "Enter the name shown on the card.",
  errorExpiry: "Use the format MM/YY.",
  errorExpired: "This card has expired.",
  errorCvc: "Enter 3 or 4 digits.",
  errorUpi: "Enter a UPI ID like name@bank.",
  summary: "Order summary",
  amountDue: "Amount due",
  total: "Total due today",
  promo: "Promo code",
  promoPlaceholder: "Enter a code",
  promoApply: "Apply",
  promoInvalid: "That code isn't valid.",
  promoEmpty: "Enter a promo code first.",
  promoApplied: (code, total) => `${code} applied. New total ${total}.`,
  promoRemoveShort: "Remove",
  promoRemove: (code) => `Remove promo code ${code}`,
  promoRemoved: (total) => `Promo code removed. Total ${total}.`,
  success: "Payment successful",
  successBody: (amount) => `${amount} paid. A receipt is on its way.`,
  again: "Make another payment",
  previewName: "Your name",
  processing: "Processing your payment",
};

const defaultLines: CheckoutLine[] = [
  { label: "Pro plan", description: "Billed monthly", amount: 29 },
  { label: "Sales tax (8%)", amount: 2.32 },
];

const defaultAssurances: NonNullable<PaymentCheckoutProps["assurances"]> = [
  { icon: <LockIcon className="size-4" />, text: "Payments are encrypted end to end." },
  { icon: <RefreshIcon className="size-4" />, text: "Cancel or change your plan anytime." },
];

type FieldKey = "number" | "name" | "expiry" | "cvc" | "upi";
type Values = Record<FieldKey, string>;
type Errors = Partial<Record<FieldKey, string>>;

const emptyValues: Values = { number: "", name: "", expiry: "", cvc: "", upi: "" };
const fieldsFor = (method: PaymentMethod): FieldKey[] =>
  method === "card" ? ["number", "name", "expiry", "cvc"] : ["upi"];

const digits = (s: string) => s.replace(/\D/g, "");
const formatCard = (s: string) =>
  digits(s)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
const formatExpiry = (s: string) =>
  digits(s)
    .slice(0, 4)
    .replace(/^(\d{2})(\d)/, "$1/$2");

function validate(key: FieldKey, v: Values, L: PaymentCheckoutLabels): string | undefined {
  switch (key) {
    case "number":
      return digits(v.number).length === 16 ? undefined : L.errorCardNumber;
    case "name":
      return v.name.trim().length >= 2 ? undefined : L.errorCardName;
    case "expiry": {
      const match = /^(\d{2})\/(\d{2})$/.exec(v.expiry);
      const month = Number(match?.[1]);
      const year = 2000 + Number(match?.[2]);
      if (!match || month < 1 || month > 12) return L.errorExpiry;
      const now = new Date();
      const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
      return expired ? L.errorExpired : undefined;
    }
    case "cvc":
      return /^\d{3,4}$/.test(v.cvc) ? undefined : L.errorCvc;
    case "upi":
      return /^[\w.-]{2,}@[a-z]{2,}$/i.test(v.upi) ? undefined : L.errorUpi;
  }
}

/**
 * A checkout card: card or UPI details with live validation, an order summary, an optional promo
 * code and a success state. Use it as the payment step of a purchase flow; it never talks to a
 * payment provider itself, `onPay` receives the validated details so you can.
 *
 * PCI note: the card fields here are ordinary inputs, so `onPay` gets the raw card number, expiry
 * and CVC. Do not post those to your own server: it makes you responsible for PCI DSS scope (SAQ D).
 * In production use your payment provider's hosted or tokenised fields (Stripe Elements, Adyen
 * Drop-in, Braintree Hosted Fields) in place of the card inputs, or treat this block as the layout
 * and validation reference only. The UPI method carries no card data.
 *
 * Props (see `PaymentCheckoutProps`): `lines` (`CheckoutLine[]`), `currency` (`"USD"`), `locale`
 * (`"en-US"`), `methods` (`["card", "upi"]`), `onPay(method, details)`, `onApplyPromo(code)`,
 * `assurances`, `flipCard` (`true`), `stateLight` (`true`), `labels` (`Partial<PaymentCheckoutLabels>`),
 * `headingLevel` (`2`), `className`.
 *
 * Keyboard: Tab moves through the method tabs, the fields, the promo field and the pay button;
 * Left and Right switch method tabs; Enter in a field submits. A failed check focuses the first
 * invalid field once its message is linked (`aria-describedby`). The numeric fields raise the
 * numeric keyboard and carry `autocomplete` hints (`cc-number`, `cc-exp`, `cc-csc`).
 * Accessibility: errors are visible text linked to their field and `onPay` failures use
 * `role="alert"`; promo changes and the paid result are announced through a status region. The light
 * and the flip are visual only: every state is also text (the processing status is announced, a refusal
 * is an alert, the paid result takes focus).
 * Light: while the CVC field has focus the card preview turns over to show the security code strip
 * (`flipCard`); while `onPay` runs the card glows amber and the pay button shows its spinner; a refusal
 * glows red; success glows green and draws a check (`stateLight`).
 * Glass and motion: one level-3 glass card (a single backdrop blur); the form and the success
 * panel swap with a short spring (opacity and transform), the flip is a transform on the preview,
 * the glow is an opacity fade on a layer with no glass in it. Reduced motion cross-fades the preview
 * sides, drops the movement and draws the check at once.
 *
 * @example
 * ```tsx
 * import { PaymentCheckout } from "@sheenui/theme";
 *
 * // `charge` is your own function. With a real card, send a provider token, never the raw number (see the PCI note).
 * declare function charge(method: string, details: unknown): Promise<void>;
 *
 * export function Checkout() {
 *   return (
 *     <PaymentCheckout
 *       currency="USD"
 *       lines={[{ label: "Pro plan", description: "Billed monthly", amount: 29 }]}
 *       onPay={async (method, details) => {
 *         await charge(method, details); // throw to show an error above the button
 *       }}
 *       onApplyPromo={(code) => (code === "SAVE10" ? { label: `Code ${code}`, amount: -2.9 } : null)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/payment-checkout
 */
export function PaymentCheckout({
  lines = defaultLines,
  currency = "USD",
  locale = "en-US",
  methods = ["card", "upi"],
  onPay,
  onApplyPromo,
  assurances = defaultAssurances,
  flipCard = true,
  stateLight = true,
  labels,
  headingLevel = 2,
  className,
}: PaymentCheckoutProps) {
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const L = { ...defaultPaymentCheckoutLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const titleId = useId();
  const summaryId = useId();

  const [method, setMethod] = useState<PaymentMethod>(methods[0] ?? "card");
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Errors>({});
  const [focused, setFocused] = useState<FieldKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<CheckoutLine | null>(null);
  const [promoError, setPromoError] = useState<string>();
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoStatus, setPromoStatus] = useState("");
  const promoRef = useRef<HTMLInputElement | null>(null);

  const money = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency }), [locale, currency]);
  const allLines = promo ? [...lines, promo] : lines;
  const total = Math.max(
    0,
    allLines.reduce((sum, line) => sum + line.amount, 0),
  );
  const totalText = money.format(total);

  /* Focus management: fields register here; a pending key is focused once its input exists
   * (after submit with errors, or when the form comes back after a payment). */
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLInputElement | null>>>({});
  const pendingFocus = useRef<FieldKey | null>(null);
  const focusPending = () => {
    const key = pendingFocus.current;
    const el = key ? fieldRefs.current[key] : null;
    if (!el) return;
    pendingFocus.current = null;
    el.focus();
  };
  // Always one frame late: Base UI links the error message (aria-describedby) in a follow-up
  // render, and focusing before that would make screen readers skip the message.
  // Built once (state initialiser): the callback refs it hands out only run in the commit, never during render.
  const [fieldRef] = useState(() => (key: FieldKey) => (el: HTMLInputElement | null) => {
    fieldRefs.current[key] = el;
    // Covers fields that mount later (the form returns only after the success panel's exit).
    if (el && pendingFocus.current === key) requestAnimationFrame(focusPending);
  });
  useEffect(() => {
    if (!pendingFocus.current) return;
    const frame = requestAnimationFrame(focusPending);
    return () => cancelAnimationFrame(frame);
  });

  function update(key: FieldKey, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    // Once a field shows an error, re-check as the user types so the message clears as soon as it's fixed.
    if (errors[key]) setErrors((e) => ({ ...e, [key]: validate(key, next, L) }));
  }

  function blur(key: FieldKey) {
    setFocused((f) => (f === key ? null : f));
    // Validate on blur only once there's something to check, so tabbing through doesn't nag.
    if (values[key] || errors[key]) setErrors((e) => ({ ...e, [key]: validate(key, values, L) }));
  }

  async function handlePay(event: SubmitEvent) {
    event.preventDefault();
    if (loading) return;
    const keys = fieldsFor(method);
    const next: Errors = {};
    for (const key of keys) next[key] = validate(key, values, L);
    setErrors(next);
    setPayError(null);

    const firstInvalid = keys.find((key) => next[key]);
    if (firstInvalid) {
      pendingFocus.current = firstInvalid;
      return;
    }

    setLoading(true);
    try {
      const details: PaymentDetails =
        method === "card"
          ? { method, number: digits(values.number), name: values.name.trim(), expiry: values.expiry, cvc: values.cvc }
          : { method, upiId: values.upi };
      await onPay?.(method, details);
      setPaid(true);
    } catch (err) {
      setPayError(err instanceof Error && err.message ? err.message : L.payFailed);
    } finally {
      setLoading(false);
    }
  }

  function payAgain() {
    setValues(emptyValues);
    setErrors({});
    pendingFocus.current = fieldsFor(method)[0] ?? null;
    setPaid(false);
  }

  async function applyPromo(event: SubmitEvent) {
    event.preventDefault();
    if (!onApplyPromo || promoLoading) return;
    const code = promoCode.trim();
    if (!code) {
      setPromoError(L.promoEmpty);
      return;
    }
    setPromoLoading(true);
    setPromoError(undefined);
    try {
      const line = await onApplyPromo(code);
      if (line) {
        setPromo(line);
        setPromoCode("");
        const nextTotal = Math.max(
          0,
          [...lines, line].reduce((sum, l) => sum + l.amount, 0),
        );
        setPromoStatus(L.promoApplied(line.label, money.format(nextTotal)));
      } else {
        setPromoError(L.promoInvalid);
      }
    } catch {
      setPromoError(L.promoInvalid);
    } finally {
      setPromoLoading(false);
    }
  }

  function removePromo() {
    setPromo(null);
    setPromoStatus(
      L.promoRemoved(
        money.format(
          Math.max(
            0,
            lines.reduce((sum, l) => sum + l.amount, 0),
          ),
        ),
      ),
    );
    promoRef.current?.focus();
  }

  const lightState: CheckoutLightState = paid ? "success" : loading ? "processing" : payError ? "error" : "idle";

  const preview = (
    <CardPreview
      number={values.number}
      name={values.name}
      expiry={values.expiry}
      cvc={values.cvc}
      focused={focused}
      placeholderName={L.previewName}
      cvcLabel={L.cvc}
      flip={flipCard}
      reduced={reduced}
    />
  );

  const cardFields = (
    <>
      {/* Small screens: the preview sits above the fields. From md up it moves to the summary column. */}
      <div className="md:hidden">{preview}</div>
      <Input
        ref={fieldRef("number")}
        label={L.cardNumber}
        name="cc-number"
        inputMode="numeric"
        autoComplete="cc-number"
        aria-required
        placeholder="1234 5678 9012 3456"
        leading={<CardIcon />}
        value={values.number}
        error={errors.number}
        onChange={(e) => update("number", formatCard(e.target.value))}
        onFocus={() => setFocused("number")}
        onBlur={() => blur("number")}
      />
      <Input
        ref={fieldRef("name")}
        label={L.cardName}
        name="cc-name"
        autoComplete="cc-name"
        aria-required
        placeholder={L.cardNamePlaceholder}
        value={values.name}
        error={errors.name}
        onChange={(e) => update("name", e.target.value)}
        onFocus={() => setFocused("name")}
        onBlur={() => blur("name")}
      />
      <div className="grid grid-cols-2 items-start gap-3">
        <Input
          ref={fieldRef("expiry")}
          label={L.expiry}
          name="cc-exp"
          inputMode="numeric"
          autoComplete="cc-exp"
          aria-required
          placeholder="MM/YY"
          value={values.expiry}
          error={errors.expiry}
          onChange={(e) => update("expiry", formatExpiry(e.target.value))}
          onFocus={() => setFocused("expiry")}
          onBlur={() => blur("expiry")}
        />
        <Input
          ref={fieldRef("cvc")}
          label={L.cvc}
          name="cc-csc"
          inputMode="numeric"
          autoComplete="cc-csc"
          aria-required
          placeholder="123"
          value={values.cvc}
          error={errors.cvc}
          onChange={(e) => update("cvc", digits(e.target.value).slice(0, 4))}
          onFocus={() => setFocused("cvc")}
          onBlur={() => blur("cvc")}
        />
      </div>
    </>
  );

  const upiFields = (
    <Input
      ref={fieldRef("upi")}
      label={L.upiId}
      name="upi-id"
      autoComplete="off"
      autoCapitalize="none"
      spellCheck={false}
      aria-required
      placeholder={L.upiPlaceholder}
      description={L.upiHint}
      value={values.upi}
      error={errors.upi}
      onChange={(e) => update("upi", e.target.value.trim())}
      onBlur={() => blur("upi")}
    />
  );

  return (
    <GlassCard
      level={3}
      className={cn(
        "grid w-full max-w-3xl grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
        className,
      )}
    >
      {stateLight && <StateLight state={lightState} reduced={reduced} />}
      <p role="status" className="sr-only">
        {loading ? L.processing : ""}
      </p>
      {/* Left: payment form */}
      <div className="p-6 sm:p-7">
        <AnimatePresence mode="wait" initial={false}>
          {paid ? (
            <SuccessPanel
              key="done"
              headingLevel={headingLevel}
              reduced={reduced}
              title={L.success}
              body={L.successBody(totalText)}
              again={L.again}
              onAgain={payAgain}
            />
          ) : (
            // Transform only (no fade): the form holds glass inputs, and fading their wrapper breaks the blur.
            <motion.form
              key="form"
              onSubmit={handlePay}
              noValidate
              initial={reduced ? false : { y: 8 }}
              animate={{ y: 0, transition: spring.snappy }}
              className="flex flex-col gap-5"
            >
              <div>
                <Heading id={titleId} className="text-lg font-semibold tracking-tight">
                  {L.title}
                </Heading>
                <p className="text-sm text-sheen-fg-muted">{L.subtitle}</p>
              </div>

              {methods.length > 1 ? (
                <Tabs
                  value={method}
                  onValueChange={(v) => {
                    setMethod(v as PaymentMethod);
                    setPayError(null);
                  }}
                >
                  <TabsList aria-label={L.methodLabel}>
                    {methods.map((m) => (
                      <TabsTab key={m} value={m}>
                        {m === "card" ? L.card : L.upi}
                      </TabsTab>
                    ))}
                  </TabsList>
                  {methods.includes("card") && (
                    <TabsPanel value="card" className="flex flex-col gap-4">
                      {cardFields}
                    </TabsPanel>
                  )}
                  {methods.includes("upi") && (
                    <TabsPanel value="upi" className="flex flex-col gap-4">
                      {upiFields}
                    </TabsPanel>
                  )}
                </Tabs>
              ) : (
                <div className="flex flex-col gap-4">{method === "card" ? cardFields : upiFields}</div>
              )}

              {payError && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-sheen-sm bg-sheen-danger-soft px-3 py-2 text-sm text-sheen-danger-text"
                >
                  <AlertIcon className="mt-0.5 size-4 shrink-0" />
                  {payError}
                </p>
              )}

              <Button type="submit" size="lg" fullWidth loading={loading} leading={<LockIcon />}>
                {L.pay(totalText)}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Right: order summary. Content stacks from the top; only the reassurance notes sit at the bottom. */}
      <section
        role="group"
        aria-labelledby={summaryId}
        className="flex flex-col gap-5 border-t border-sheen-border bg-[color-mix(in_oklch,var(--sheen-accent)_5%,transparent)] p-6 sm:p-7 md:border-t-0 md:border-s"
      >
        {method === "card" && methods.includes("card") && <div className="hidden md:block">{preview}</div>}
        <div>
          <Heading id={summaryId} className="text-2xs font-semibold tracking-[0.08em] text-sheen-fg-muted uppercase">
            {L.summary}
          </Heading>
          <p className="mt-3 text-sm text-sheen-fg-muted">{L.amountDue}</p>
          <p className="text-3xl font-semibold tracking-tight proportional-nums">{totalText}</p>
        </div>

        <dl className="flex flex-col gap-3 text-sm">
          {lines.map((line, i) => (
            <div key={`${line.label}-${i}`} className="flex items-baseline justify-between gap-4">
              <dt className="min-w-0">
                <span className="text-sheen-fg">{line.label}</span>
                {line.description && <span className="block text-xs text-sheen-fg-muted">{line.description}</span>}
              </dt>
              <dd className="shrink-0 tabular-nums">{money.format(line.amount)}</dd>
            </div>
          ))}
          {promo && (
            <div className="flex items-center justify-between gap-4">
              <dt className="flex min-w-0 items-center gap-2">
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-sheen-full bg-sheen-success-soft px-2 py-0.5 text-xs font-medium text-sheen-success-text">
                  <TagIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{promo.label}</span>
                </span>
                <button
                  type="button"
                  onClick={removePromo}
                  aria-label={L.promoRemove(promo.label)}
                  className="inline-flex items-center rounded-sheen-sm px-1 text-xs font-medium text-sheen-fg-muted underline-offset-2 hover:text-sheen-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11 any-pointer-coarse:px-2"
                >
                  {L.promoRemoveShort}
                </button>
              </dt>
              <dd className="shrink-0 font-medium text-sheen-success-text tabular-nums">
                {money.format(promo.amount)}
              </dd>
            </div>
          )}
          <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-sheen-border pt-4">
            <dt className="font-medium">{L.total}</dt>
            <dd className="text-base font-semibold tabular-nums">{totalText}</dd>
          </div>
        </dl>

        {onApplyPromo && (
          <form noValidate onSubmit={applyPromo}>
            <Input
              ref={promoRef}
              label={L.promo}
              name="promo-code"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder={L.promoPlaceholder}
              leading={<TagIcon />}
              value={promoCode}
              error={promoError}
              onChange={(e) => {
                setPromoCode(e.target.value);
                if (promoError) setPromoError(undefined);
              }}
              trailing={
                <button
                  type="submit"
                  disabled={promoLoading}
                  aria-busy={promoLoading || undefined}
                  className="-me-3.5 flex h-11 items-center rounded-e-sheen-md px-3.5 text-sm font-medium text-sheen-accent transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus disabled:cursor-wait disabled:opacity-60"
                >
                  {L.promoApply}
                </button>
              }
            />
          </form>
        )}
        <p role="status" className="sr-only">
          {promoStatus}
        </p>

        {assurances.length > 0 && (
          <ul className="flex flex-col gap-2 text-xs text-sheen-fg-muted md:mt-auto">
            {assurances.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                {item.icon && <span className="mt-px flex shrink-0 text-sheen-fg-muted">{item.icon}</span>}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </GlassCard>
  );
}
