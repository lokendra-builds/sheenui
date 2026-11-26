import{r as e}from"./demo-utils-DKtmFFFD.js";import{r as t}from"./toast-PePh6sao.js";import{t as n}from"./lazy-block-BfzH_8EP.js";import{i as r,n as i,o as a,r as o}from"./Page-BAL5Idhy.js";import{t as s}from"./Example-BPfHvEYD.js";import{n as c}from"./BlockStages.forms-CZ1yRCeX.js";import{t as l}from"./vendor-react-D30i__oY.js";import{t as u}from"./preload-helper-BrmCrVM7.js";var d=[[`title`,`ReactNode`,`"Welcome back"`,'Sets the heading (`ReactNode`, default "Welcome back").',!1],[`subtitle`,`ReactNode`,`"Sign in to continue to your workspace."`,'The line under the heading (`ReactNode`, default "Sign in to continue to your workspace.").',!1],[`onSubmit`,`((values: GlassLoginValues) => void | Promise<void>)`,``,`Called with the form values. Return a promise to show a loading state; throw to show an error.`,!1],[`onSocial`,`((provider: "github" | "google") => void)`,``,`Show "Continue with GitHub / Google" buttons. Without it the social row is hidden.`,!1],[`forgotHref`,`string`,`"#"`,'Target of the "Forgot password?" link (`string`, default `"#"`).',!1],[`signUpHref`,`string | null`,`"#"`,'Target of the sign-up link (`string | null`, default `"#"`). Hide the sign-up line by passing null.',!1],[`minPasswordLength`,`number`,`8`,"Minimum password length checked before submitting (`number`, default 8).",!1],[`labels`,`Partial<GlassLoginLabels>`,`defaultGlassLoginLabels`,'Every other string, for translation: `labels={{ email: "…" }}`; omitted keys keep the English of `defaultGlassLoginLabels`. All 15 keys of `GlassLoginLabels` are listed in the key table under the props table.',!1,{type:`GlassLoginLabels`,const:`defaultGlassLoginLabels`,keys:[[`email`,`Email`],[`emailPlaceholder`,`you@example.com`],[`password`,`Password`],[`showPassword`,`Show password`],[`hidePassword`,`Hide password`],[`forgot`,`Forgot password?`],[`submit`,`Sign in`],[`divider`,`or continue with`],[`github`,`GitHub`],[`google`,`Google`],[`signUpPrompt`,`New here?`],[`signUp`,`Create an account`],[`invalidEmail`,`Enter a valid email address.`],[`shortPassword`,"(min) => `Password must be at least ${min} characters.`"],[`genericError`,`Something went wrong. Try again.`]]}],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the title heading (`1` to `6`, default `2`); set it to fit the page\'s outline. `"none"` renders a paragraph with no heading role (for an example).',!1],[`className`,`string`,``,"Adds extra classes to the outer glass card (`string`).",!1]],f=l();n(()=>u(()=>import(`./dashboard-stats-CF8TzT6c.js`).then(e=>e.DashboardStats),[]),{minHeight:`24rem`});var p=n(()=>u(()=>import(`./glass-login-D-ovMPE7.js`).then(e=>e.GlassLogin),[]),{minHeight:`24rem`});n(()=>u(()=>import(`./lamp-login-DTPTcjCc.js`).then(e=>e.LampLogin),[]),{minHeight:`24rem`}),n(()=>u(()=>import(`./otp-verification-Biqt-IFN.js`).then(e=>e.OtpVerification),[]),{minHeight:`24rem`}),n(()=>u(()=>import(`./payment-checkout-4ttxUhN8.js`).then(e=>e.PaymentCheckout),[]),{minHeight:`24rem`});function m(){let n=t();return(0,f.jsxs)(i,{eyebrow:`Block`,title:`Glass login`,description:`A complete sign-in card: validation, password reveal, loading state and social buttons. Built only from Button, GlassCard and Input.`,source:`theme/src/blocks/glass-login.tsx`,children:[(0,f.jsx)(c,{}),(0,f.jsx)(s,{title:`Sign in`,stageClassName:`min-h-[36rem]`,description:`Try submitting empty, then with any email and an 8+ character password.`,code:`
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
}`,children:(0,f.jsx)(p,{headingLevel:`none`,onSubmit:async({email:t})=>{await e(1200),n.success(`Signed in`,`Welcome back, ${t}`)},onSocial:e=>n.info(`Continue with ${e}`,`Connect this to your OAuth flow.`)})}),(0,f.jsx)(s,{title:`Your copy, a stricter rule, a failing sign-in`,stageClassName:`min-h-[34rem]`,description:`Change the heading and the line under it, require 12 characters, hide the sign-up link and leave out the social buttons (they only show when onSocial is given). This one always fails, so you can see the error.`,code:`
import { GlassLogin } from "@sheenui/theme";

<GlassLogin
  title="Sign in to Acme"
  subtitle="Use your work email."
  minPasswordLength={12}
  signUpHref={null}
  onSubmit={async () => {
    throw new Error("Wrong email or password"); // the card shows the error and stays editable
  }}
/>`,children:(0,f.jsx)(p,{headingLevel:`none`,title:`Sign in to Acme`,subtitle:`Use your work email.`,minPasswordLength:12,signUpHref:null,onSubmit:async()=>{throw await e(700),Error(`Wrong email or password`)}})}),(0,f.jsx)(o,{of:d}),(0,f.jsx)(a,{rows:[[`Tab`,`Email, password, the reveal button, the forgot link, submit, the social buttons, then the sign-up link.`],[`Enter`,`Submit the form.`]]}),(0,f.jsx)(r,{notes:[`A real <form> with noValidate and visible error text linked to its field (aria-describedby).`,`A failed check moves focus to the first invalid field once its message is linked, and the message is announced.`,`The reveal button has a state-aware name (“Show password” / “Hide password” by default).`,`Targets are at least 44 px on touch devices.`]})]})}export{m as default};