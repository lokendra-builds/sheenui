import { wait } from "../demo-utils";
import { lazyBlock } from "../layout/lazy-block";

import { BlockStage } from "../layout/ShowcaseStage.block.scene";
import { all, press, type } from "../layout/ShowcaseStage.block.drive";

const DashboardStats = lazyBlock(
  () => import("../../../theme/src/blocks/dashboard-stats").then((m) => m.DashboardStats),
  { minHeight: "36rem", eager: true },
);
const GlassLogin = lazyBlock(() => import("../../../theme/src/blocks/glass-login").then((m) => m.GlassLogin), {
  minHeight: "36rem",
  eager: true,
});
const LampLogin = lazyBlock(() => import("../../../theme/src/blocks/lamp-login").then((m) => m.LampLogin), {
  minHeight: "36rem",
  eager: true,
});
const OtpVerification = lazyBlock(
  () => import("../../../theme/src/blocks/otp-verification").then((m) => m.OtpVerification),
  { minHeight: "36rem", eager: true },
);
const PaymentCheckout = lazyBlock(
  () => import("../../../theme/src/blocks/payment-checkout").then((m) => m.PaymentCheckout),
  { minHeight: "36rem", eager: true },
);

/** The stage at the top of /blocks/glass-login: the card is filled in, signed in, and the workspace opens. */
export function GlassLoginStage() {
  return (
    <BlockStage
      label="Glass login demo"
      story="submit"
      width={400}
      height={496}
      actions={[type("Email", "maya@example.com"), type("Password", "correct-horse"), press("Sign in")]}
    >
      {(step, reduced) => (
        <GlassLogin
          headingLevel="none"
          title={step >= 4 ? "Signed in" : undefined}
          subtitle={step >= 4 ? "Opening your workspace." : undefined}
          onSubmit={() => wait(reduced ? 0 : 900)}
        />
      )}
    </BlockStage>
  );
}
GlassLoginStage.isShowcaseStage = true;

/** The stage at the top of /blocks/lamp-login: pull the cord, the light comes on, the card is filled in and signed. */
export function LampLoginStage() {
  return (
    <BlockStage
      label="Lamp login demo"
      story="submit"
      width={520}
      height={754}
      fit={480}
      actions={[
        press("Lamp light"),
        all(type("Email", "maya@example.com"), type("Password", "correct-horse")),
        press("Sign in"),
      ]}
    >
      {(step, reduced) => (
        <LampLogin
          headingLevel="none"
          title={step >= 4 ? "Signed in" : undefined}
          subtitle={step >= 4 ? "Opening your workspace." : undefined}
          onSubmit={() => wait(reduced ? 0 : 900)}
        />
      )}
    </BlockStage>
  );
}
LampLoginStage.isShowcaseStage = true;

/** The stage at the top of /blocks/otp-verification: the code is typed, checked and the block turns to "verified". */
export function OtpVerificationStage() {
  return (
    <BlockStage
      label="OTP verification demo"
      story="three"
      width={470}
      height={304}
      frameClassName="sheen-blk-otp"
      align="start"
      actions={[type("Verification code", "123456", 160), press("Verify code")]}
    >
      {(_step, reduced) => (
        <OtpVerification
          headingLevel="none"
          destination="maya@example.com"
          // eslint-disable-next-line jsx-a11y/no-autofocus -- turns the block's autofocus off, so the stage never takes focus
          autoFocus={false}
          resendAfter={30}
          onVerify={async (code) => {
            await wait(reduced ? 0 : 700);
            return code === "123456";
          }}
        />
      )}
    </BlockStage>
  );
}
OtpVerificationStage.isShowcaseStage = true;

/** The stage at the top of /blocks/payment-checkout: card details go in, Pay is pressed and the payment goes through. */
export function PaymentCheckoutStage() {
  return (
    <BlockStage
      label="Payment checkout demo"
      story="pay"
      width={760}
      height={555}
      actions={[
        all(type("Card number", "4242424242424242", 30), type("Name on card", "Maya Rivera", 30)),
        all(type("Expiry", "1229", 60), type("CVC", "123", 80)),
        press("Pay"),
      ]}
    >
      {(_step, reduced) => <PaymentCheckout headingLevel="none" onPay={() => wait(reduced ? 0 : 1100)} />}
    </BlockStage>
  );
}
PaymentCheckoutStage.isShowcaseStage = true;

/** The stage at the top of /blocks/dashboard-stats: the period tabs are switched and every figure and trend follows. */
export function DashboardStatsStage() {
  return (
    <BlockStage
      label="Dashboard stats demo"
      story="tour"
      width={1000}
      height={232}
      actions={[press("30d"), press("90d"), press("7d")]}
    >
      <DashboardStats headingLevel="none" />
    </BlockStage>
  );
}
DashboardStatsStage.isShowcaseStage = true;
