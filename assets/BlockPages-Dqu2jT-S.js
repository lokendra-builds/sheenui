import{r as e}from"./demo-utils-DKtmFFFD.js";import{r as t}from"./toast-PePh6sao.js";import{t as n}from"./lazy-block-BfzH_8EP.js";import{i as r,n as i,o as a,r as o}from"./Page-vzU90LKc.js";import{t as s}from"./Example-CmMsgUlK.js";import{i as c}from"./BlockStages.forms-CZ1yRCeX.js";import{t as l}from"./vendor-react-D30i__oY.js";import{t as u}from"./preload-helper-BrmCrVM7.js";var d=[[`destination`,`ReactNode`,`"your email"`,'Where the code was sent, shown in the description (`ReactNode`, default "your email").',!1],[`length`,`number`,`6`,"Sets the number of digits (`number`, default 6).",!1],[`onVerify`,`(code: string) => boolean | Promise<boolean>`,``,`Return true if the code is correct. Throwing counts as a wrong code.`,!0],[`onResend`,`(() => void | Promise<void>)`,``,`Called when the person asks for a new code. Without it the resend control still resets the field.`,!1],[`onContinue`,`(() => void)`,``,`Shows a "Continue" button once the code is accepted.`,!1],[`resendAfter`,`number`,`30`,'Seconds before "Resend" becomes available (`number`, default 30).',!1],[`autoFocus`,`boolean`,`true`,"Focus the first digit on mount (`boolean`, default `true`). Turn it off when the block is not the main task on the page.",!1],[`labels`,`Partial<OtpVerificationLabels>`,`defaultOtpVerificationLabels`,'Every other string, for translation: `labels={{ title: "…" }}`; omitted keys keep the English of `defaultOtpVerificationLabels`. All 15 keys of `OtpVerificationLabels` are listed in the key table under the props table.',!1,{type:`OtpVerificationLabels`,const:`defaultOtpVerificationLabels`,keys:[[`title`,`Check your inbox`],[`titleVerified`,`You're verified`],[`description`,`(length, destination) => ( <> Enter the {length}-digit code we sent to {destination}. </> )`],[`descriptionVerified`,`Your code was accepted. You can continue.`],[`codeLabel`,`Verification code`],[`error`,`That code didn't match. Try again.`],[`incomplete`,"(length) => `Enter all ${length} digits.`"],[`success`,`Code accepted.`],[`resent`,`We sent you a new code.`],[`verify`,`Verify code`],[`continue`,`Continue`],[`resendPrompt`,`Didn't get it?`],[`resendIn`,"(s) => `Resend in ${s}s`"],[`resend`,`Resend code`],[`verifiedBadge`,`Verified`]]}],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the title heading (`1` to `6`, default `2`); set it to fit the page\'s outline. `"none"` renders a paragraph with no heading role (for an example).',!1],[`className`,`string`,``,"Adds extra classes to the outer glass card (`string`).",!1],[`variant`,`"default" | "unlock"`,`"default"`,'`"default"` (the plain card) or `"unlock"` (`"default" | "unlock"`, default `"default"`): a padlock inside a progress ring that fills with every digit and spins while the code is checked. A right code closes the ring in green, opens the lock, bursts sparks, floods the card with light and shows a "Verified" badge; a wrong code rattles the lock and clears the digits. Reduced motion swaps all of it for an instant change.',!1]],f=l();n(()=>u(()=>import(`./dashboard-stats-CF8TzT6c.js`).then(e=>e.DashboardStats),[]),{minHeight:`24rem`}),n(()=>u(()=>import(`./glass-login-D-ovMPE7.js`).then(e=>e.GlassLogin),[]),{minHeight:`24rem`}),n(()=>u(()=>import(`./lamp-login-DTPTcjCc.js`).then(e=>e.LampLogin),[]),{minHeight:`24rem`});var p=n(()=>u(()=>import(`./otp-verification-Biqt-IFN.js`).then(e=>e.OtpVerification),[]),{minHeight:`24rem`});n(()=>u(()=>import(`./payment-checkout-4ttxUhN8.js`).then(e=>e.PaymentCheckout),[]),{minHeight:`24rem`});function m(){let n=t();return(0,f.jsxs)(i,{eyebrow:`Block`,title:`OTP verification`,description:`Verify a one-time code with auto-submit on the last digit, shake on a wrong code, a success state and a resend countdown.`,source:`theme/src/blocks/otp-verification.tsx`,children:[(0,f.jsx)(c,{}),(0,f.jsx)(s,{title:`Verify a code`,stageClassName:`min-h-[34rem]`,description:`The correct code is 123456.`,code:`
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
/>`,children:(0,f.jsx)(p,{headingLevel:`none`,destination:`you@example.com`,resendAfter:15,autoFocus:!1,onVerify:async t=>(await e(800),t===`123456`),onResend:()=>{n.info(`New code sent`,`Check your inbox.`)}})}),(0,f.jsx)(s,{title:`Unlock variant`,stageClassName:`min-h-[38rem]`,description:`variant="unlock" puts a padlock inside a ring that fills with every digit. A right code opens the lock and floods the card with light; a wrong code rattles it and clears the digits. The correct code is 482913.`,code:`
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
}`,children:(0,f.jsx)(p,{variant:`unlock`,headingLevel:`none`,destination:`the phone ending in 47`,resendAfter:15,autoFocus:!1,onVerify:async t=>(await e(900),t===`482913`),onContinue:()=>n.success(`Unlocked`,`You would be sent to your account.`)})}),(0,f.jsx)(s,{title:`Four digits, with a Continue button`,stageClassName:`min-h-[34rem]`,description:`length changes the number of slots; onContinue adds a Continue button once the code is accepted. The correct code is 4821.`,code:`
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
}`,children:(0,f.jsx)(p,{headingLevel:`none`,length:4,destination:`+1 ••• ••• 0142`,autoFocus:!1,onVerify:async t=>(await e(600),t===`4821`),onContinue:()=>n.success(`Verified`,`You would be sent to the welcome page.`)})}),(0,f.jsx)(o,{of:d}),(0,f.jsx)(a,{rows:[[`0–9`,`Type or paste the digits; focus advances by itself.`],[`Backspace`,`Step back to the previous digit.`],[`Tab, then Enter / Space on Verify`,`Verify (the code also verifies as soon as the last digit is in). Verify pressed early moves focus to the first empty slot and explains.`],[`Enter / Space on Resend`,`Ask for a new code, once the countdown is over.`]]}),(0,f.jsx)(r,{notes:[`The digit field is named by codeLabel; wrong-code, incomplete, resent and success messages share one polite live region.`,`The resend countdown is text, not color only.`,`After success focus moves to Continue (or the heading).`]})]})}export{m as default};