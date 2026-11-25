import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{r as n}from"./toast-PePh6sao.js";import{t as r}from"./lazy-block-BfzH_8EP.js";import{i,n as a,o,r as s}from"./Page-DQ8sr8qt.js";import{t as c}from"./Example-DMEbQwm9.js";import"./demo-clock-CoEY-AlH.js";import{r as l}from"./demo-utils-DKtmFFFD.js";import{t as u}from"./BlockStages.account-Bp8j6vSz.js";import{t as d}from"./preload-helper-BrmCrVM7.js";var f=[[`title`,`ReactNode`,`from labels`,"Sets the card heading (`ReactNode`, default from `labels`).",!1],[`subtitle`,`ReactNode`,`from labels`,"The line under the card heading (`ReactNode`, default from `labels`).",!1],[`headline`,`ReactNode`,``,`Shows a big line on the brand panel.`,!1],[`description`,`ReactNode`,``,"Shows a paragraph under the headline (`ReactNode`).",!1],[`features`,`ReactNode[]`,`[ "Forty-plus glass components, copy-paste ready", "Motion that bows out for reduced-motion users", "AA contrast in light and dark, measured", ]`,`Short selling points with check marks. Pass [] to hide.`,!1],[`stats`,`AuthSplitStat[]`,`[ { value: "12,400+", label: "teams building" }, { value: "4.9/5", label: "average rating" }, { value: "99.99%", label: "uptime last year" }, ]`,`A few numbers under the features. Pass [] to hide.`,!1],[`testimonials`,`AuthSplitTestimonial[]`,`defaultAuthSplitTestimonials`,`One or more quotes; several rotate. Pass [] to hide. The default is sample content for demos and prototypes: pass your own in production.`,!1],[`rotateEvery`,`number`,`7`,"Seconds between testimonials; 0 turns auto-rotation off (`number`, default 7).",!1],[`brand`,`ReactNode`,``,`Logo on the panel and above the form on narrow screens.`,!1],[`onSubmit`,`((values: AuthSplitValues) => void | Promise<void>)`,``,`Called with the values once they are valid. Return a promise for the loading state; throw to show an error.`,!1],[`onSocial`,`((provider: "github" | "google") => void)`,``,`Shows the GitHub / Google buttons.`,!1],[`onResend`,`((email: string) => void | Promise<void>)`,``,`Runs when the user clicks "Resend email" on the success screen.`,!1],[`termsHref`,`string`,`"#"`,'Target of the terms link (`string`, default `"#"`).',!1],[`privacyHref`,`string`,`"#"`,'Target of the privacy link (`string`, default `"#"`).',!1],[`signInHref`,`string | null`,`"#"`,`Hide the sign-in line with null.`,!1],[`minPasswordLength`,`number`,`8`,"Minimum password length, the first checklist rule (`number`, default 8).",!1],[`reverse`,`boolean`,`false`,"Put the form on the left and the brand panel on the right (`boolean`, default `false`).",!1],[`headingLevel`,`HeadingLevelOption`,`1`,'Level of the card heading (`1 | 2 | 3`, default 1). `"none"` renders it, and the brand panel\'s quote heading, as paragraphs with no heading role (for an example).',!1],[`labels`,`Partial<AuthSplitLabels>`,`defaultAuthSplitLabels`,'Every other string, for translation: `labels={{ title: "…" }}`; omitted keys keep the English of `defaultAuthSplitLabels`. All 44 keys of `AuthSplitLabels` are listed in the key table under the props table.',!1,{type:`AuthSplitLabels`,const:`defaultAuthSplitLabels`,keys:[[`title`,`Create your account`],[`subtitle`,`Free for 14 days. No credit card needed.`],[`name`,`Full name`],[`namePlaceholder`,`Ada Lovelace`],[`email`,`Work email`],[`emailPlaceholder`,`you@example.com`],[`password`,`Password`],[`passwordPlaceholder`,`Create a password`],[`showPassword`,`Show password`],[`hidePassword`,`Hide password`],[`strength`,`Strength`],[`strengthLevel`,`(score) => ["", "Weak", "Fair", "Good", "Strong"][score] ?? ""`],[`ruleLength`,"(min) => `${min}+ characters`"],[`ruleCase`,`Upper & lowercase`],[`ruleNumber`,`A number`],[`ruleSymbol`,`A symbol`],[`ruleMet`,`done`],[`ruleUnmet`,`not yet`],[`tooCommon`,`That one is on every list of common passwords. Try a phrase only you would use.`],[`termsLink`,`Terms`],[`privacyLink`,`Privacy Policy`],[`terms`,`({ terms, privacy }) => ( <> I agree to the {terms} and {privacy}. </> )`],[`submit`,`Create account`],[`divider`,`or sign up with email`],[`github`,`GitHub`],[`google`,`Google`],[`signInPrompt`,`Already have an account?`],[`signIn`,`Sign in`],[`nameRequired`,`Tell us what to call you.`],[`invalidEmail`,`Enter a valid email address.`],[`weakPassword`,`Choose a stronger password: Fair or better on the meter.`],[`termsRequired`,`Please accept the terms to continue.`],[`genericError`,`Something went wrong. Try again.`],[`successTitle`,`Check your inbox`],[`successBody`,`(email) => ( <> We sent a confirmation link to{" "} <span className="font-semibold text-sheen-fg [overflow-...`],[`resend`,`Resend email`],[`resent`,`Sent again`],[`changeEmail`,`Use a different email`],[`testimonials`,`What people say`],[`showTestimonial`,"(i, n) => `Show testimonial ${i} of ${n}`"],[`pause`,`Pause testimonials`],[`play`,`Play testimonials`],[`rating`,"(n) => `Rated ${n} out of 5`"],[`announceStrength`,"(level) => `Password strength: ${level}`"]]}],[`className`,`string`,``,"Adds extra classes to the outer element (`string`).",!1]];e();var p=t();r(()=>d(()=>import(`./settings-page-liP5TBCk.js`).then(e=>e.SettingsPage),[]),{minHeight:`40rem`,eager:!0});var m=r(()=>d(()=>import(`./auth-split-BnEQlilF.js`).then(e=>e.AuthSplit),[]),{minHeight:`32rem`,eager:!0});function h(){let e=n();return(0,p.jsxs)(a,{eyebrow:`Block`,title:`Auth split`,description:`A split-screen sign-up page: a dark brand panel with a drifting aurora, a pointer light, selling points, numbers and rotating testimonials, beside a glass form with social sign-up, a live password-strength meter and checklist, terms, and a “check your inbox” finish. Side by side from 56rem of its own width; narrower, the form leads.`,source:`theme/src/blocks/auth-split.tsx`,children:[(0,p.jsx)(u,{}),(0,p.jsx)(c,{title:`Sign up`,description:`Type a password and watch the meter and checklist; try “password1”. Submit empty to see the errors, then fill it in for the success state. Hover the testimonial to hold it.`,frame:`example.com/signup`,stageClassName:`p-0 sm:p-0`,code:`
import { AuthSplit } from "@sheenui/theme";

// Your API; each call throws on failure so the form shows the message
async function post(path: string, body: unknown) {
  const res = await fetch("/api/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Request failed");
}

const api = {
  signUp: (values: { name: string; email: string; password: string }) => post("sign-up", values),
  resendConfirmation: (email: string) => post("resend-confirmation", { email }),
};

const signInWith = (provider: "github" | "google") => window.location.assign("/auth/" + provider);

export function Example() {
  return (
    <AuthSplit
      onSubmit={async ({ name, email, password }) => {
        await api.signUp({ name, email, password }); // throw to show the message in the form
      }}
      onSocial={(provider) => signInWith(provider)}
      onResend={(email) => api.resendConfirmation(email)}
      termsHref="/terms"
      privacyHref="/privacy"
      signInHref="/login"
      className="min-h-dvh"
    />
  );
}`,children:(0,p.jsx)(m,{headingLevel:`none`,onSubmit:async e=>{if(await l(1100),e.email.endsWith(`@example.com`))throw Error(`An account with this email already exists.`)},onSocial:t=>e.info(`Continue with ${t===`github`?`GitHub`:`Google`}`,`Wire onSocial to your OAuth flow.`),onResend:async()=>{await l(900),e.success(`Confirmation sent again`)}})}),(0,p.jsx)(c,{title:`Reversed, with your own story`,description:`Form on the left, one testimonial (no rotation controls), your headline and features, no numbers.`,frame:`example.com/join`,stageClassName:`p-0 sm:p-0`,code:`
import { AuthSplit, type AuthSplitValues } from "@sheenui/theme";

async function joinWaitlist({ name, email }: AuthSplitValues) {
  const res = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) throw new Error("Could not join the waitlist");
}

export function Example() {
  return (
    <AuthSplit
      reverse
      title="Join the beta"
      subtitle="We’re letting in a few teams each week."
      headline="Your design system, minus the busywork."
      description="Tokens, components and docs that stay in sync."
      features={["Design tokens to code in one click", "Every component AA in both themes"]}
      stats={[]}
      testimonials={[{ quote: "Our handoff meetings are gone.", name: "Ines Duarte", role: "Design lead, Fieldnote", rating: 5 }]}
      signInHref={null}
      onSubmit={joinWaitlist}
    />
  );
}`,children:(0,p.jsx)(m,{reverse:!0,headingLevel:`none`,title:`Join the beta`,subtitle:`We’re letting in a few teams each week.`,headline:`Your design system, minus the busywork.`,description:`Tokens, components and docs that stay in sync, so designers and engineers argue about ideas instead of hex codes.`,features:[`Design tokens to code in one click`,`Every component AA in both themes`,`Docs that write their own props tables`],stats:[],testimonials:[{quote:`Our handoff meetings are gone. We just open the docs together.`,name:`Ines Duarte`,role:`Design lead, Fieldnote`,rating:5}],signInHref:null,labels:{testimonials:`Beta feedback`},onSubmit:()=>l(900)})}),(0,p.jsx)(s,{of:f}),(0,p.jsx)(o,{rows:[[`Tab`,`Name, email, password (with its reveal button and strength checklist), the terms checkbox, submit, then the social buttons.`],[`Enter`,`Submit the form. A failed check moves focus to the first invalid field.`],[`Enter / Space on the pause button or a dot`,`Pause the testimonials / show that one.`]]}),(0,p.jsx)(i,{notes:[`A real <form> with linked error text (role="alert" for a failed submit) and polite status regions; the success screen takes focus.`,`The password-strength bar is a role="meter" and the checklist is text, so strength never rests on color.`,`Testimonials rotate with a pause button and dots, both reachable by keyboard; rotation is manual-only with reduced motion.`]})]})}export{h as default};