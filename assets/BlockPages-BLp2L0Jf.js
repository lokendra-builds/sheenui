import{r as e}from"./demo-utils-DKtmFFFD.js";import{t}from"./lazy-block-BfzH_8EP.js";import{i as n,n as r,o as i,r as a}from"./Page-BAL5Idhy.js";import{t as o}from"./Example-BPfHvEYD.js";import{r as s}from"./BlockStages.forms-CZ1yRCeX.js";import{t as c}from"./vendor-react-D30i__oY.js";import{t as l}from"./preload-helper-BrmCrVM7.js";var u=[[`lit`,`boolean`,``,"Controls whether the light is on (`boolean`). Use with `onLitChange`; leave it out to let the block keep the state.",!1],[`defaultLit`,`boolean`,`false`,"The light's starting state when uncontrolled (`boolean`, default `false`; with reduced motion the light starts on).",!1],[`onLitChange`,`((lit: boolean) => void)`,``,"Called when the light is switched by the cord, or by focus entering the card (`(lit: boolean) => void`).",!1],[`title`,`ReactNode`,`"Welcome back"`,'Sets the card heading (`ReactNode`, default "Welcome back").',!1],[`subtitle`,`ReactNode`,`"Sign in to continue to your workspace."`,'The line under the heading (`ReactNode`, default "Sign in to continue to your workspace.").',!1],[`onSubmit`,`((values: GlassLoginValues) => void | Promise<void>)`,``,`Called with the form values. Return a promise to show a loading state; throw to show an error.`,!1],[`onSocial`,`((provider: "github" | "google") => void)`,``,`Show "Continue with GitHub / Google" buttons. Without it the social row is hidden.`,!1],[`forgotHref`,`string`,`"#"`,'Target of the "Forgot password?" link (`string`, default `"#"`).',!1],[`signUpHref`,`string | null`,`"#"`,'Target of the sign-up link (`string | null`, default `"#"`). Hide the sign-up line by passing null.',!1],[`minPasswordLength`,`number`,`8`,"Minimum password length checked before submitting (`number`, default 8).",!1],[`loginLabels`,`Partial<GlassLoginLabels>`,`defaultGlassLoginLabels`,'Every other string, for translation: `loginLabels={{ email: "…" }}`; omitted keys keep the English of `defaultGlassLoginLabels`. All 15 keys of `GlassLoginLabels` are listed in the key table under the props table.',!1,{type:`GlassLoginLabels`,const:`defaultGlassLoginLabels`,keys:[[`email`,`Email`],[`emailPlaceholder`,`you@example.com`],[`password`,`Password`],[`showPassword`,`Show password`],[`hidePassword`,`Hide password`],[`forgot`,`Forgot password?`],[`submit`,`Sign in`],[`divider`,`or continue with`],[`github`,`GitHub`],[`google`,`Google`],[`signUpPrompt`,`New here?`],[`signUp`,`Create an account`],[`invalidEmail`,`Enter a valid email address.`],[`shortPassword`,"(min) => `Password must be at least ${min} characters.`"],[`genericError`,`Something went wrong. Try again.`]]}],[`labels`,`Partial<LampLoginLabels>`,`defaultLampLoginLabels`,'Every other string, for translation: `labels={{ cord: "…" }}`; omitted keys keep the English of `defaultLampLoginLabels`. All 3 keys of `LampLoginLabels` are listed in the key table under the props table.',!1,{type:`LampLoginLabels`,const:`defaultLampLoginLabels`,keys:[[`cord`,`Lamp light`],[`hintOff`,`Pull the cord to switch the light on`],[`hintOn`,`Pull the cord to switch it off`]]}],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the card heading (`1` to `6`). `"none"` renders a paragraph with no heading role (for an example).',!1],[`className`,`string`,``,"Adds extra classes to the stage (`string`).",!1]],d=c();t(()=>l(()=>import(`./dashboard-stats-CF8TzT6c.js`).then(e=>e.DashboardStats),[]),{minHeight:`24rem`}),t(()=>l(()=>import(`./glass-login-D-ovMPE7.js`).then(e=>e.GlassLogin),[]),{minHeight:`24rem`});var f=t(()=>l(()=>import(`./lamp-login-DTPTcjCc.js`).then(e=>e.LampLogin),[]),{minHeight:`24rem`});t(()=>l(()=>import(`./otp-verification-Biqt-IFN.js`).then(e=>e.OtpVerification),[]),{minHeight:`24rem`}),t(()=>l(()=>import(`./payment-checkout-4ttxUhN8.js`).then(e=>e.PaymentCheckout),[]),{minHeight:`24rem`});function p(){return(0,d.jsxs)(r,{eyebrow:`Block`,title:`Lamp login`,description:`A dark stage with a pull cord. Pull it and a warm light cone reveals a glass sign-in card. The card is always in the page: the light is only a look.`,source:`theme/src/blocks/lamp-login.tsx`,children:[(0,d.jsx)(s,{}),(0,d.jsx)(o,{title:`Pull the cord`,stageClassName:`min-h-[44rem] p-3 sm:p-10`,description:`Click the bead, press Enter or Space on it, or drag it down on a touch screen. Tabbing into the card also switches the light on. With reduced motion the light starts on.`,code:`
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
}`,children:(0,d.jsx)(f,{headingLevel:`none`,onSubmit:()=>e(1200)})}),(0,d.jsx)(o,{title:`Starts lit, with social buttons`,stageClassName:`min-h-[44rem] p-3 sm:p-10`,description:`defaultLit starts with the light on; onLitChange reports every switch. onSocial and the other GlassLogin options pass straight through.`,code:`
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
}`,children:(0,d.jsx)(f,{headingLevel:`none`,defaultLit:!0,onSocial:()=>void 0,title:`Back in the studio`,subtitle:`Sign in to pick up where you left off.`,labels:{cord:`Studio lamp`},onSubmit:()=>e(1200)})}),(0,d.jsx)(a,{of:u}),(0,d.jsx)(i,{rows:[[`Tab`,`The cord first, then the card's fields, links and buttons in order.`],[`Enter / Space on the cord`,`Pull it: switch the light on or off.`],[`Drag the cord down`,`On touch: past about 24 px counts as a pull.`],[`Focus into the card`,`Switches the light on, so nobody types into the dark.`]]}),(0,d.jsx)(n,{notes:[`The cord is a real toggle button named by labels.cord; its pressed state says whether the light is on. The hint under the lamp is text.`,`The card is always in the page and in tab order. The lamp, cone and dimming layer are aria-hidden: nothing is said by light alone.`,`The stage is forced dark, so the glass and its text keep at least 4.5:1 contrast whatever the page theme.`,`Reduced motion: the light starts on, the cord does not swing and the cone does not grow; pulling it still changes the light with a short fade.`]})]})}export{p as default};