import"./rolldown-runtime-WkwZ5CU-.js";import{r as e}from"./demo-utils-DKtmFFFD.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{r}from"./toast-PePh6sao.js";import{n as i}from"./BlockStages.marketing-DYS_HwJw.js";import{i as a,n as o,o as s,r as c}from"./Page-BAL5Idhy.js";import{t as l}from"./Example-BPfHvEYD.js";import{t as u}from"./lazy-block-BfzH_8EP.js";import{t as d}from"./preload-helper-BrmCrVM7.js";var f=[[`onSubmit`,`((values: ContactFormValues) => void | Promise<void>)`,``,"Called with the trimmed values once they pass validation (`(values: ContactFormValues) => void | Promise<void>`). Return a promise to show the loading state; throw to show an error under the form.",!1],[`validate`,`boolean`,`true`,"Run the block's own checks on submit (`boolean`). Pass `false` when a form library validates for you, and feed its messages back through `errors`.",!1],[`errors`,`Partial<Record<"form" | ContactField, string>>`,``,"Error messages from outside (`Partial<Record<ContactField | \"form\", string>>`), for example from react-hook-form's `formState.errors`. They win over the block's own.",!1],[`fieldProps`,`Partial<Record<ContactField, ClassAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLTextAreaElement> & TextareaHTMLAttributes<HTMLTextAreaElement>>>`,``,'Extra props for each control (`Partial<Record<ContactField, ComponentProps<"input"> | ComponentProps<"textarea">>>`), so `{...register("email")}` from react-hook-form can be handed over.',!1],[`status`,`ContactFormStatus`,``,"Controls the status (`ContactFormStatus`), for when a form library or your own state knows it. Leave it out to let the block track it.",!1],[`defaultValues`,`Partial<ContactFormValues>`,``,"The values the fields start with (`Partial<ContactFormValues>`).",!1],[`minMessageLength`,`number`,`10`,"The shortest message accepted by the block's own check (`number`).",!1],[`maxMessageLength`,`number`,`1000`,"The longest message (`number`); a character counter is shown.",!1],[`onReset`,`(() => void)`,``,"Called when the success view's button returns to an empty form (`() => void`), e.g. to reset your form library.",!1],[`eyebrow`,`ReactNode`,``,"Shows a small label above the title (`ReactNode`).",!1],[`title`,`ReactNode`,``,"Sets the heading (`ReactNode`).",!1],[`description`,`ReactNode`,``,"Sets the line under the heading (`ReactNode`).",!1],[`aside`,`ReactNode`,``,"Contact details or a map beside the form on a wide block (`ReactNode`).",!1],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the heading (`1` to `6`); `"none"` renders plain text, no heading.',!1],[`labels`,`Partial<ContactFormLabels>`,`defaultContactFormLabels`,'Every other string, for translation: `labels={{ name: "…" }}`; omitted keys keep the English of `defaultContactFormLabels`. All 14 keys of `ContactFormLabels` are listed in the key table under the props table.',!1,{type:`ContactFormLabels`,const:`defaultContactFormLabels`,keys:[[`name`,`Name`],[`namePlaceholder`,`Your name`],[`email`,`Email`],[`emailPlaceholder`,`you@example.com`],[`message`,`Message`],[`messagePlaceholder`,`How can we help?`],[`submit`,`Send message`],[`nameRequired`,`Enter your name.`],[`invalidEmail`,`Enter a valid email address.`],[`shortMessage`,"(min) => `Write at least ${min} characters.`"],[`genericError`,`Something went wrong. Try again.`],[`successTitle`,`Message sent`],[`successText`,`Thanks for writing. We usually reply within one working day.`],[`another`,`Send another message`]]}],[`className`,`string`,``,"Adds extra classes to the outer element (`string`).",!1]];t();var p=n();u(()=>d(()=>import(`./announcement-banner-B9G8vRh-.js`).then(e=>e.AnnouncementBanner),[]),{minHeight:`24rem`});var m=u(()=>d(()=>import(`./contact-form-BUIEL7EF.js`).then(e=>e.ContactForm),[]),{minHeight:`24rem`});u(()=>d(()=>import(`./not-found-page-CL8Jt2b3.js`).then(e=>e.NotFound),[]),{minHeight:`24rem`}),u(()=>d(()=>import(`./site-footer-CxdNf__b.js`).then(e=>e.SiteFooter),[]),{minHeight:`24rem`});var h=u(()=>d(()=>import(`./BlockMarketingPages2.hook-form-Lwpw_DKa.js`).then(e=>e.HookFormDemo),[]),{minHeight:`30rem`});function g(){let t=r();return(0,p.jsxs)(o,{eyebrow:`Block`,title:`Contact form`,description:`Name, email and message on glass with inline validation, a loading button and a success seal that lights green. It validates on its own, or hands that job to react-hook-form.`,source:`theme/src/blocks/contact-form.tsx`,children:[(0,p.jsx)(i,{}),(0,p.jsx)(l,{title:`Plain onSubmit`,stageClassName:`min-h-[36rem] p-3 sm:p-10`,description:`Submit it empty to see the messages and the focus move, then fill it in. onSubmit returns a promise, so the button shows its loading light until it settles; throw from it to show an error under the form.`,code:`
import { ContactForm } from "@sheenui/theme";

// Your call; throw to show the error under the form
async function sendMessage(values: { name: string; email: string; message: string }) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error("We could not send that. Try again in a minute.");
}

export function Example() {
  return (
    <ContactForm
      eyebrow="Contact"
      title="Talk to us"
      description="Questions, feedback or a project in mind. We reply within one working day."
      onSubmit={async (values) => {
        await sendMessage(values);
      }}
    />
  );
}`,children:(0,p.jsx)(m,{headingLevel:`none`,eyebrow:`Contact`,title:`Talk to us`,description:`Questions, feedback or a project in mind. We reply within one working day.`,onSubmit:async n=>{await e(1200),t.success(`Message sent`,`We will reply to ${n.email}.`)}})}),(0,p.jsx)(l,{title:`With react-hook-form`,stageClassName:`min-h-[36rem] p-3 sm:p-10`,description:`validate={false} turns the block's own checks off. fieldProps takes register(...) for each field, errors takes formState.errors, and status follows isSubmitting and isSubmitSuccessful. The state light and the success seal work the same.`,code:`
import { useForm } from "react-hook-form";
import { ContactForm, type ContactFormStatus, type ContactFormValues } from "@sheenui/theme";

declare function sendMessage(values: ContactFormValues): Promise<void>;

export function Example() {
  const { register, handleSubmit, reset, formState } = useForm<ContactFormValues>();
  const { errors, isSubmitting, isSubmitSuccessful } = formState;
  const status: ContactFormStatus = isSubmitting ? "submitting" : isSubmitSuccessful ? "success" : "idle";

  return (
    <ContactForm
      title="Write to us"
      validate={false}
      status={status}
      errors={{ name: errors.name?.message, email: errors.email?.message, message: errors.message?.message }}
      fieldProps={{
        name: register("name", { required: "Enter your name." }),
        email: register("email", {
          required: "Enter your email.",
          pattern: { value: /^\\S+@\\S+\\.\\S+$/, message: "Enter a valid email address." },
        }),
        message: register("message", { required: "Write a message.", minLength: { value: 10, message: "Write at least 10 characters." } }),
      }}
      onSubmit={() => handleSubmit(sendMessage)()}
      onReset={() => reset()}
    />
  );
}`,children:(0,p.jsx)(h,{})}),(0,p.jsx)(c,{of:f}),(0,p.jsx)(s,{rows:[[`Tab`,`Name, email, message, then the send button.`],[`Enter`,`In a single-line field: submit the form.`],[`Tab after success`,`Focus has moved to the success message; Tab reaches 'Send another message'.`]]}),(0,p.jsx)(a,{notes:[`A real <form> with noValidate. Errors are visible text linked with aria-describedby; a failed check moves focus to the first invalid field.`,`The success view is a status region and receives focus; the outcome is always text, never light alone.`,`The form and the success view share one grid cell, so the card never changes height.`,`The button glows while sending (state light) and the seal's check is drawn once. Reduced motion: the seal fades in and the check appears at once.`]})]})}export{g as default};