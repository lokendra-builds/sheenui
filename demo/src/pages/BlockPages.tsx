import { wait } from "../demo-utils";
import { useToast } from "@sheenui/theme";

import { lazyBlock } from "../layout/lazy-block";

import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import {
  DashboardStatsStage,
  GlassLoginStage,
  LampLoginStage,
  OtpVerificationStage,
  PaymentCheckoutStage,
} from "./BlockStages.forms";
import * as PROPS from "../generated/component-props";

const DashboardStats = lazyBlock(
  () => import("../../../theme/src/blocks/dashboard-stats").then((m) => m.DashboardStats),
  { minHeight: "24rem" },
);
const GlassLogin = lazyBlock(() => import("../../../theme/src/blocks/glass-login").then((m) => m.GlassLogin), {
  minHeight: "24rem",
});
const LampLogin = lazyBlock(() => import("../../../theme/src/blocks/lamp-login").then((m) => m.LampLogin), {
  minHeight: "24rem",
});
const OtpVerification = lazyBlock(
  () => import("../../../theme/src/blocks/otp-verification").then((m) => m.OtpVerification),
  { minHeight: "24rem" },
);
const PaymentCheckout = lazyBlock(
  () => import("../../../theme/src/blocks/payment-checkout").then((m) => m.PaymentCheckout),
  { minHeight: "24rem" },
);

/** The "Glass login" docs page (/blocks/glass-login): live examples, props and notes. */
export function GlassLoginPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Block"
      title="Glass login"
      description="A complete sign-in card: validation, password reveal, loading state and social buttons. Built only from Button, GlassCard and Input."
      source="theme/src/blocks/glass-login.tsx"
    >
      <GlassLoginStage />
      <Example
        title="Sign in"
        stageClassName="min-h-[36rem]"
        description="Try submitting empty, then with any email and an 8+ character password."
        code={`
import { GlassLogin } from "@sheenui/theme";

// Your auth calls; signIn throws on failure so the card shows the error
async function signIn(email: string, password: string) {
  const res = await fetch("/api/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Wrong email or password");
}

function startOAuth(provider: "github" | "google") {
  window.location.assign("/auth/" + provider);
}

export function Example() {
  return (
    <GlassLogin
      onSubmit={async ({ email, password }) => {
        await signIn(email, password);
      }}
      onSocial={(provider) => startOAuth(provider)}
    />
  );
}`}
      >
        <GlassLogin
          headingLevel="none"
          onSubmit={async ({ email }) => {
            await wait(1200);
            toast.success("Signed in", `Welcome back, ${email}`);
          }}
          onSocial={(provider) => toast.info(`Continue with ${provider}`, "Connect this to your OAuth flow.")}
        />
      </Example>

      <Example
        title="Your copy, a stricter rule, a failing sign-in"
        stageClassName="min-h-[34rem]"
        description="Change the heading and the line under it, require 12 characters, hide the sign-up link and leave out the social buttons (they only show when onSocial is given). This one always fails, so you can see the error."
        code={`
import { GlassLogin } from "@sheenui/theme";

<GlassLogin
  title="Sign in to Acme"
  subtitle="Use your work email."
  minPasswordLength={12}
  signUpHref={null}
  onSubmit={async () => {
    throw new Error("Wrong email or password"); // the card shows the error and stays editable
  }}
/>`}
      >
        <GlassLogin
          headingLevel="none"
          title="Sign in to Acme"
          subtitle="Use your work email."
          minPasswordLength={12}
          signUpHref={null}
          onSubmit={async () => {
            await wait(700);
            throw new Error("Wrong email or password");
          }}
        />
      </Example>

      <PropsTable of={PROPS.GlassLogin} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Email, password, the reveal button, the forgot link, submit, the social buttons, then the sign-up link.",
          ],
          ["Enter", "Submit the form."],
        ]}
      />
      <A11yNotes
        notes={[
          "A real <form> with noValidate and visible error text linked to its field (aria-describedby).",
          "A failed check moves focus to the first invalid field once its message is linked, and the message is announced.",
          "The reveal button has a state-aware name (“Show password” / “Hide password” by default).",
          "Targets are at least 44 px on touch devices.",
        ]}
      />
    </Page>
  );
}

/** The "OTP verification" docs page (/blocks/otp-verification): live examples, props and notes. */
export function OtpVerificationPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Block"
      title="OTP verification"
      description="Verify a one-time code with auto-submit on the last digit, shake on a wrong code, a success state and a resend countdown."
      source="theme/src/blocks/otp-verification.tsx"
    >
      <OtpVerificationStage />
      <Example
        title="Verify a code"
        stageClassName="min-h-[34rem]"
        description="The correct code is 123456."
        code={`
import { OtpVerification } from "@sheenui/theme";

<OtpVerification
  destination="you@example.com"
  onVerify={async (code) => {
    const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code }) });
    return res.ok;
  }}
  onResend={async () => {
    await fetch("/api/resend", { method: "POST" });
  }}
/>`}
      >
        <OtpVerification
          headingLevel="none"
          destination="you@example.com"
          resendAfter={15}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- explicitly turns the block's autofocus off, so this page does not steal focus on load
          autoFocus={false}
          onVerify={async (code) => {
            await wait(800);
            return code === "123456";
          }}
          onResend={() => {
            toast.info("New code sent", "Check your inbox.");
          }}
        />
      </Example>

      <Example
        title="Unlock variant"
        stageClassName="min-h-[38rem]"
        description='variant="unlock" puts a padlock inside a ring that fills with every digit. A right code opens the lock and floods the card with light; a wrong code rattles it and clears the digits. The correct code is 482913.'
        code={`
import { OtpVerification } from "@sheenui/theme";

export function Example() {
  return (
    <OtpVerification
      variant="unlock"
      destination="the phone ending in 47"
      onVerify={async (code) => code === "482913"}
      onContinue={() => window.location.assign("/app")}
    />
  );
}`}
      >
        <OtpVerification
          variant="unlock"
          headingLevel="none"
          destination="the phone ending in 47"
          resendAfter={15}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- explicitly turns the block's autofocus off, so this page does not steal focus on load
          autoFocus={false}
          onVerify={async (code) => {
            await wait(900);
            return code === "482913";
          }}
          onContinue={() => toast.success("Unlocked", "You would be sent to your account.")}
        />
      </Example>

      <Example
        title="Four digits, with a Continue button"
        stageClassName="min-h-[34rem]"
        description="length changes the number of slots; onContinue adds a Continue button once the code is accepted. The correct code is 4821."
        code={`
import { OtpVerification } from "@sheenui/theme";

const router = { push: (to: string) => window.location.assign(to) };

export function Example() {
  return (
    <OtpVerification
      length={4}
      destination="+1 ••• ••• 0142"
      onVerify={async (code) => code === "4821"}
      onContinue={() => router.push("/welcome")}
    />
  );
}`}
      >
        <OtpVerification
          headingLevel="none"
          length={4}
          destination="+1 ••• ••• 0142"
          // eslint-disable-next-line jsx-a11y/no-autofocus -- explicitly turns the block's autofocus off, so this page does not steal focus on load
          autoFocus={false}
          onVerify={async (code) => {
            await wait(600);
            return code === "4821";
          }}
          onContinue={() => toast.success("Verified", "You would be sent to the welcome page.")}
        />
      </Example>

      <PropsTable of={PROPS.OtpVerification} />
      <KeyboardTable
        rows={[
          ["0–9", "Type or paste the digits; focus advances by itself."],
          ["Backspace", "Step back to the previous digit."],
          [
            "Tab, then Enter / Space on Verify",
            "Verify (the code also verifies as soon as the last digit is in). Verify pressed early moves focus to the first empty slot and explains.",
          ],
          ["Enter / Space on Resend", "Ask for a new code, once the countdown is over."],
        ]}
      />
      <A11yNotes
        notes={[
          "The digit field is named by codeLabel; wrong-code, incomplete, resent and success messages share one polite live region.",
          "The resend countdown is text, not color only.",
          "After success focus moves to Continue (or the heading).",
        ]}
      />
    </Page>
  );
}

/** The "Lamp login" docs page (/blocks/lamp-login): live examples, props and notes. */
export function LampLoginPage() {
  return (
    <Page
      eyebrow="Block"
      title="Lamp login"
      description="A dark stage with a pull cord. Pull it and a warm light cone reveals a glass sign-in card. The card is always in the page: the light is only a look."
      source="theme/src/blocks/lamp-login.tsx"
    >
      <LampLoginStage />
      <Example
        title="Pull the cord"
        stageClassName="min-h-[44rem] p-3 sm:p-10"
        description="Click the bead, press Enter or Space on it, or drag it down on a touch screen. Tabbing into the card also switches the light on. With reduced motion the light starts on."
        code={`
import { LampLogin } from "@sheenui/theme";

// Your call; throw to show the error under the form
async function signIn(email: string, password: string) {
  const res = await fetch("/api/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Wrong email or password");
}

export function Example() {
  return (
    <LampLogin
      onSubmit={async ({ email, password }) => {
        await signIn(email, password);
      }}
    />
  );
}`}
      >
        <LampLogin headingLevel="none" onSubmit={() => wait(1200)} />
      </Example>

      <Example
        title="Starts lit, with social buttons"
        stageClassName="min-h-[44rem] p-3 sm:p-10"
        description="defaultLit starts with the light on; onLitChange reports every switch. onSocial and the other GlassLogin options pass straight through."
        code={`
import { LampLogin } from "@sheenui/theme";

export function Example() {
  return (
    <LampLogin
      defaultLit
      onLitChange={(lit) => console.log(lit ? "light on" : "light off")}
      onSocial={(provider) => console.log(provider)}
      title="Back in the studio"
      subtitle="Sign in to pick up where you left off."
      labels={{ cord: "Studio lamp" }}
    />
  );
}`}
      >
        <LampLogin
          headingLevel="none"
          defaultLit
          onSocial={() => undefined}
          title="Back in the studio"
          subtitle="Sign in to pick up where you left off."
          labels={{ cord: "Studio lamp" }}
          onSubmit={() => wait(1200)}
        />
      </Example>

      <PropsTable of={PROPS.LampLogin} />
      <KeyboardTable
        rows={[
          ["Tab", "The cord first, then the card's fields, links and buttons in order."],
          ["Enter / Space on the cord", "Pull it: switch the light on or off."],
          ["Drag the cord down", "On touch: past about 24 px counts as a pull."],
          ["Focus into the card", "Switches the light on, so nobody types into the dark."],
        ]}
      />
      <A11yNotes
        notes={[
          "The cord is a real toggle button named by labels.cord; its pressed state says whether the light is on. The hint under the lamp is text.",
          "The card is always in the page and in tab order. The lamp, cone and dimming layer are aria-hidden: nothing is said by light alone.",
          "The stage is forced dark, so the glass and its text keep at least 4.5:1 contrast whatever the page theme.",
          "Reduced motion: the light starts on, the cord does not swing and the cone does not grow; pulling it still changes the light with a short fade.",
        ]}
      />
    </Page>
  );
}

/** The "Payment checkout" docs page (/blocks/payment-checkout): live examples, props and notes. */
export function PaymentCheckoutPage() {
  return (
    <Page
      eyebrow="Block"
      title="Payment checkout"
      description="Card or UPI with a live card preview that turns over for the CVC, input formatting, an order summary, and a card that glows by state: amber while processing, red on a refusal, green with a drawn check when paid. Built from GlassCard, Tabs, Input and Button."
      source="theme/src/blocks/payment-checkout.tsx"
    >
      <PaymentCheckoutStage />
      <Example
        title="Checkout"
        stageClassName="min-h-[40rem] p-3 sm:p-10"
        description="Fill in any 16-digit card number, a name, an expiry like 12/29 and a CVC, or a UPI ID like name@bank."
        code={`
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
}`}
      >
        <PaymentCheckout headingLevel="none" onPay={() => wait(1400)} />
      </Example>

      <Example
        title="Card only, in euros, with a promo code"
        stageClassName="min-h-[40rem] p-3 sm:p-10"
        description="One method hides the tabs; currency and locale format the amounts. Try the code SHEEN10: onApplyPromo resolves to a discount line, or to null to reject a code."
        code={`
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
}`}
      >
        <div lang="de" className="contents">
          <PaymentCheckout
            headingLevel="none"
            methods={["card"]}
            currency="EUR"
            locale="de-DE"
            lines={[
              { label: "Team plan", description: "5 seats, billed yearly", amount: 240 },
              { label: "VAT (19%)", amount: 45.6 },
            ]}
            onApplyPromo={(code) =>
              code.trim().toUpperCase() === "SHEEN10" ? { label: "Promo SHEEN10", amount: -24 } : null
            }
            assurances={[{ text: "Invoice by email" }]}
            labels={{ title: "Card payment details", summary: "Team order summary" }}
            onPay={() => wait(1400)}
          />
        </div>
      </Example>

      <Example
        title="Without the flip and the light"
        stageClassName="min-h-[40rem] p-3 sm:p-10"
        description="flipCard and stateLight are on by default. Turn them off for the plain card: the preview stays on its front and the card is never lit. The same states are still written as text."
        code={`
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
}`}
      >
        <PaymentCheckout
          headingLevel="none"
          flipCard={false}
          stateLight={false}
          labels={{ title: "Plain card details", summary: "Plain order summary", processing: "Contacting your bank" }}
          onPay={() => wait(1400)}
        />
      </Example>

      <section
        aria-labelledby="pci-note"
        className="glass-2 flex max-w-3xl flex-col gap-2 rounded-sheen-lg p-5 text-sm"
      >
        <h2 id="pci-note" className="text-lg font-semibold tracking-tight">
          Card data and PCI DSS
        </h2>
        <p className="text-sheen-fg-muted">
          The card fields are ordinary inputs, so <code>onPay</code> receives the raw card number, expiry and CVC. Do
          not post those to your own server: that puts it in PCI DSS scope (SAQ D). In production use your payment
          provider&apos;s hosted or tokenised fields (Stripe Elements, Adyen Drop-in, Braintree Hosted Fields) in place
          of the card inputs and pass only the token on, or treat this block as the layout and validation reference. The
          UPI method carries no card data.
        </p>
      </section>

      <PropsTable of={PROPS.PaymentCheckout} />
      <KeyboardTable
        rows={[
          ["Tab", "The method tabs, the fields, the promo field and the pay button."],
          ["← / →", "Switch between payment method tabs."],
          ["Enter on a field", "Submit the form."],
          ["Focus into CVC", "The card preview turns over to its back."],
        ]}
      />
      <A11yNotes
        notes={[
          "The flip and the state light are visual only: processing is announced through a status region, a refusal is an alert and the paid result takes focus.",
          "Reduced motion: the preview cross-fades instead of turning, the check is drawn at once.",
          "Errors are visible text linked to their field (aria-describedby); a failed check focuses the first invalid field.",
          'onPay failures use role="alert"; promo changes and the paid result are announced through a status region.',
          "The numeric fields raise the numeric keyboard and carry autocomplete hints (cc-number, cc-exp, cc-csc).",
        ]}
      />
    </Page>
  );
}

/** The "Dashboard stats" docs page (/blocks/dashboard-stats): live examples, props and notes. */
export function DashboardStatsPage() {
  return (
    <Page
      eyebrow="Block"
      title="Dashboard stats"
      description="Stat cards that count up, draw their sparklines and switch periods with the sliding tab pill."
      source="theme/src/blocks/dashboard-stats.tsx"
    >
      <DashboardStatsStage />
      {/* Not "Overview": the block's own <section> is already named that, and two regions with one name trip axe landmark-unique. */}
      <Example
        title="Stat cards"
        stageClassName="p-3 sm:p-8"
        code={`
import { DashboardStats } from "@sheenui/theme";

<DashboardStats
  title="Overview"
  currency="USD"
  data={{
    "7d":  [{ label: "Revenue", value: 48250, change: 12.4, trend: [30, 34, 31, 38, 42, 40, 48], format: "currency" } /* … */],
    "30d": [/* … */],
  }}
/>`}
      >
        <DashboardStats headingLevel="none" />
      </Example>

      <Example
        title="Your numbers, periods and currency"
        stageClassName="p-3 sm:p-8"
        description="The keys of data become the period tabs (“4w” reads as “Last 4 weeks”). goodWhen: “down” turns a falling churn rate green; currency and locale format every figure."
        code={`
import { DashboardStats } from "@sheenui/theme";

<DashboardStats
  title="Team health"
  currency="EUR"
  locale="de-DE"
  data={{
    "4w": [
      { label: "Revenue", value: 18400, change: 6.2, trend: [11, 12, 14, 13, 16, 18], format: "currency" },
      { label: "Churn", value: 2.1, change: -0.4, trend: [3, 2.8, 2.6, 2.4, 2.2, 2.1], format: "percent", goodWhen: "down" },
    ],
    "12m": [
      { label: "Revenue", value: 212000, change: 18.9, trend: [90, 110, 130, 160, 190, 212], format: "currency" },
      { label: "Churn", value: 2.4, change: 0.3, trend: [2.1, 2.0, 2.2, 2.3, 2.3, 2.4], format: "percent", goodWhen: "down" },
    ],
  }}
/>`}
      >
        <div lang="de" className="contents">
          <DashboardStats
            headingLevel="none"
            title="Team health"
            currency="EUR"
            locale="de-DE"
            className="docs-flat"
            data={{
              "4w": [
                { label: "Revenue", value: 18400, change: 6.2, trend: [11, 12, 14, 13, 16, 18], format: "currency" },
                {
                  label: "Churn",
                  value: 2.1,
                  change: -0.4,
                  trend: [3, 2.8, 2.6, 2.4, 2.2, 2.1],
                  format: "percent",
                  goodWhen: "down",
                },
              ],
              "12m": [
                {
                  label: "Revenue",
                  value: 212000,
                  change: 18.9,
                  trend: [90, 110, 130, 160, 190, 212],
                  format: "currency",
                },
                {
                  label: "Churn",
                  value: 2.4,
                  change: 0.3,
                  trend: [2.1, 2.0, 2.2, 2.3, 2.3, 2.4],
                  format: "percent",
                  goodWhen: "down",
                },
              ],
            }}
          />
        </div>
      </Example>

      <PropsTable
        of={PROPS.DashboardStats}
        rows={[
          [
            "Stat",
            "{ label, value, change, trend, format?, goodWhen? }",
            "",
            'change is a % vs the previous period; goodWhen: "down" suits churn or response time.',
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab", "Reach the period tabs."],
          ["← / →", "Previous / next period."],
          ["Home / End", "First / last period."],
        ]}
      />
      <A11yNotes
        notes={[
          "A labeled <section>; each period tab shows “7d” and is named “7d, Last 7 days”, so the visible text is part of the name.",
          "The change badge reads “Up 12.4% vs previous period”, and the animated count is hidden from screen readers, which get the final figure at once.",
          "Each sparkline has a text name.",
        ]}
      />
    </Page>
  );
}
