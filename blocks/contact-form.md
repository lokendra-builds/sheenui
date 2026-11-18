Canonical: https://lokendra-builds.github.io/sheenui/blocks/contact-form

# React Contact Form with Validation

URL: https://lokendra-builds.github.io/sheenui/blocks/contact-form
Sidebar name: Contact form

A React contact form on glass: name, email and message with validation, a loading button and a success seal. Plain onSubmit or react-hook-form. MIT.

What it is: ContactForm is a React contact form block with name, email and message fields on glass, inline validation, a button that glows while sending and a success seal. It works with a plain onSubmit or react-hook-form.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/contact-form.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Contact form

Files to copy from `theme/src/`:

- `blocks/{contact-form.tsx, icons.tsx}`
- `components/button/`
- `components/glass-card/`
- `components/input/`
- `components/spinner/`
- `components/status-icons/`
- `components/textarea/`
- `hooks/{use-controllable.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, light-follower.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, heading.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: contact-form. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ContactForm, type ContactFormStatus, type ContactFormValues } from "@/components/sheenui/blocks/contact-form";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ContactForm, type ContactFormStatus, type ContactFormValues } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onSubmit | ((values: ContactFormValues) => void \| Promise<void>) | optional, no default | Called with the trimmed values once they pass validation ((values: ContactFormValues) => void \| Promise<void>). Return a promise to show the loading state; throw to show an error under the form. |
| validate | boolean | true | Run the block's own checks on submit (boolean). Pass false when a form library validates for you, and feed its messages back through errors. |
| errors | Partial<Record<"form" \| ContactField, string>> | optional, no default | Error messages from outside (Partial<Record<ContactField \| "form", string>>), for example from react-hook-form's formState.errors. They win over the block's own. |
| fieldProps | Partial<Record<ContactField, ClassAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLTextAreaElement> & TextareaHTMLAttributes<HTMLTextAreaElement>>> | optional, no default | Extra props for each control (Partial<Record<ContactField, ComponentProps<"input"> \| ComponentProps<"textarea">>>), so {...register("email")} from react-hook-form can be handed over. |
| status | ContactFormStatus | optional, no default | Controls the status (ContactFormStatus), for when a form library or your own state knows it. Leave it out to let the block track it. |
| defaultValues | Partial<ContactFormValues> | optional, no default | The values the fields start with (Partial<ContactFormValues>). |
| minMessageLength | number | 10 | The shortest message accepted by the block's own check (number). |
| maxMessageLength | number | 1000 | The longest message (number); a character counter is shown. |
| onReset | (() => void) | optional, no default | Called when the success view's button returns to an empty form (() => void), e.g. to reset your form library. |
| eyebrow | ReactNode | optional, no default | Shows a small label above the title (ReactNode). |
| title | ReactNode | optional, no default | Sets the heading (ReactNode). |
| description | ReactNode | optional, no default | Sets the line under the heading (ReactNode). |
| aside | ReactNode | optional, no default | Contact details or a map beside the form on a wide block (ReactNode). |
| headingLevel | HeadingLevelOption | 2 | Level of the heading (1 to 6); "none" renders plain text, no heading. |
| labels | Partial<ContactFormLabels> | defaultContactFormLabels | Every other string, for translation: labels={{ name: "…" }}; omitted keys keep the English of defaultContactFormLabels. All 14 keys of ContactFormLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element (string). |

## Example 1 of 2: Plain onSubmit

Submit it empty to see the messages and the focus move, then fill it in. onSubmit returns a promise, so the button shows its loading light until it settles; throw from it to show an error under the form.

```tsx
import { ContactForm } from "@/components/sheenui/blocks/contact-form";
// Package build (after the first npm release, or a packed tarball): import { ContactForm } from "@sheenui/theme";

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
}
```

## Example 2 of 2: With react-hook-form

validate={false} turns the block's own checks off. fieldProps takes register(...) for each field, errors takes formState.errors, and status follows isSubmitting and isSubmitSuccessful. The state light and the success seal work the same.

```tsx
import { useForm } from "react-hook-form";
import { ContactForm, type ContactFormStatus, type ContactFormValues } from "@/components/sheenui/blocks/contact-form";
// Package build (after the first npm release, or a packed tarball): import { ContactForm, type ContactFormStatus, type ContactFormValues } from "@sheenui/theme";

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
          pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
        }),
        message: register("message", { required: "Write a message.", minLength: { value: 10, message: "Write at least 10 characters." } }),
      }}
      onSubmit={() => handleSubmit(sendMessage)()}
      onReset={() => reset()}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Name, email, message, then the send button. |
| Enter | In a single-line field: submit the form. |
| Tab after success | Focus has moved to the success message; Tab reaches 'Send another message'. |

## Accessibility

- A real <form> with noValidate. Errors are visible text linked with aria-describedby; a failed check moves focus to the first invalid field.
- The success view is a status region and receives focus; the outcome is always text, never light alone.
- The form and the success view share one grid cell, so the card never changes height.
- The button glows while sending (state light) and the seal's check is drawn once. Reduced motion: the seal fades in and the check appears at once.

## All exports on this page

- ContactForm — A contact form on glass: name, email and a message with inline validation, a loading button and a success seal that lights green.
- defaultContactFormLabels — The English ContactFormLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the contact form

- Use ContactForm on a contact or support page, with onSubmit(values) returning a promise so the button shows its loading light and a thrown error appears under the form.
- Use it beside react-hook-form by passing validate={false}, fieldProps from register(...), errors from formState.errors and a status derived from isSubmitting and isSubmitSuccessful.
- Use the aside slot for an address, hours or a map beside the form on a wide block, and eyebrow, title and description for the heading.
- Skip it for a long multi-step form; the Stepper and Field components are built for that, while ContactForm is three fields and a message.
- Pair it with FaqSection above it and SiteFooter below, and send the message from your server with a spam check rather than from the browser alone.


## Frequently asked questions

### How do I build a contact form in React with ContactForm?

Render ContactForm with an onSubmit that receives { name, email, message }. Return a promise to show the loading state, or throw an Error to show its message under the form. Pass title and description for the heading. On success it shows a seal and a 'Send another message' button.

### How do I use ContactForm with react-hook-form?

Pass validate={false}, fieldProps={{ name: register('name'), email: register('email'), message: register('message') }}, errors built from formState.errors, and status from isSubmitting and isSubmitSuccessful. Call handleSubmit(send)() inside onSubmit and reset() in onReset.

### How does validation work without a library?

The block checks on submit: a name is required, the email must look like an address and the message must reach minMessageLength (default 10). Errors are visible text linked with aria-describedby, focus moves to the first invalid field, and a message clears as soon as it is fixed.

### Is the success state accessible?

Yes. The success view is a status region and receives focus, so a screen reader announces 'Message sent'. The green light is only decoration: the outcome is always text. Reduced motion fades the seal in and shows the check at once.


## Related pages

- [Textarea](https://lokendra-builds.github.io/sheenui/forms/textarea)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [FAQ section](https://lokendra-builds.github.io/sheenui/blocks/faq-section)
- [Site footer](https://lokendra-builds.github.io/sheenui/blocks/site-footer)
- [404 page](https://lokendra-builds.github.io/sheenui/blocks/not-found-page)
- [Announcement banner](https://lokendra-builds.github.io/sheenui/blocks/announcement-banner)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
