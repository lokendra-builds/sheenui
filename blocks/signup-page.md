Canonical: https://lokendra-builds.github.io/sheenui/blocks/signup-page

# Split-Screen Sign-Up Page for React & Tailwind

URL: https://lokendra-builds.github.io/sheenui/blocks/signup-page
Sidebar name: Sign-up page

A split-screen React sign-up page: aurora brand panel with testimonials beside a glass form with social sign-up and a live password-strength meter. MIT.

What it is: A split-screen sign-up page for React: an animated brand panel beside a glass form with social sign-up and a live password-strength meter.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/auth-split.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Sign-up page

Files to copy from `theme/src/`:

- `blocks/{auth-split.tsx, icons.tsx}`
- `components/button/`
- `components/checkbox/`
- `components/glass-card/`
- `components/input/`
- `components/logo/`
- `components/spinner/`
- `components/status-icons/`
- `blocks/auth-split/`
- `hooks/{use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, light-follower.ts, tokens.ts}`
- `lib/{cn.ts, field-control-shell.tsx, field-size.ts, form.ts, heading.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: auth-split. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { AuthSplit } from "@/components/sheenui/blocks/auth-split";
import { type AuthSplitValues } from "@/components/sheenui/blocks/auth-split/model";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { AuthSplit, type AuthSplitValues } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | from labels | Sets the card heading (ReactNode, default from labels). |
| subtitle | ReactNode | from labels | The line under the card heading (ReactNode, default from labels). |
| headline | ReactNode | optional, no default | Shows a big line on the brand panel. |
| description | ReactNode | optional, no default | Shows a paragraph under the headline (ReactNode). |
| features | ReactNode[] | [ "Forty-plus glass components, copy-paste ready", "Motion that bows out for reduced-motion users", "AA contrast in light and dark, measured", ] | Short selling points with check marks. Pass [] to hide. |
| stats | AuthSplitStat[] | [ { value: "12,400+", label: "teams building" }, { value: "4.9/5", label: "average rating" }, { value: "99.99%", label: "uptime last year" }, ] | A few numbers under the features. Pass [] to hide. |
| testimonials | AuthSplitTestimonial[] | defaultAuthSplitTestimonials | One or more quotes; several rotate. Pass [] to hide. The default is sample content for demos and prototypes: pass your own in production. |
| rotateEvery | number | 7 | Seconds between testimonials; 0 turns auto-rotation off (number, default 7). |
| brand | ReactNode | optional, no default | Logo on the panel and above the form on narrow screens. |
| onSubmit | ((values: AuthSplitValues) => void \| Promise<void>) | optional, no default | Called with the values once they are valid. Return a promise for the loading state; throw to show an error. |
| onSocial | ((provider: "github" \| "google") => void) | optional, no default | Shows the GitHub / Google buttons. |
| onResend | ((email: string) => void \| Promise<void>) | optional, no default | Runs when the user clicks "Resend email" on the success screen. |
| termsHref | string | "#" | Target of the terms link (string, default "#"). |
| privacyHref | string | "#" | Target of the privacy link (string, default "#"). |
| signInHref | string \| null | "#" | Hide the sign-in line with null. |
| minPasswordLength | number | 8 | Minimum password length, the first checklist rule (number, default 8). |
| reverse | boolean | false | Put the form on the left and the brand panel on the right (boolean, default false). |
| headingLevel | HeadingLevelOption | 1 | Level of the card heading (1 \| 2 \| 3, default 1). "none" renders it, and the brand panel's quote heading, as paragraphs with no heading role (for an example). |
| labels | Partial<AuthSplitLabels> | defaultAuthSplitLabels | Every other string, for translation: labels={{ title: "…" }}; omitted keys keep the English of defaultAuthSplitLabels. All 44 keys of AuthSplitLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element (string). |

## Example 1 of 2: Sign up

Type a password and watch the meter and checklist; try “password1”. Submit empty to see the errors, then fill it in for the success state. Hover the testimonial to hold it.

```tsx
import { AuthSplit } from "@/components/sheenui/blocks/auth-split";
// Package build (after the first npm release, or a packed tarball): import { AuthSplit } from "@sheenui/theme";

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
}
```

## Example 2 of 2: Reversed, with your own story

Form on the left, one testimonial (no rotation controls), your headline and features, no numbers.

```tsx
import { AuthSplit } from "@/components/sheenui/blocks/auth-split";
import { type AuthSplitValues } from "@/components/sheenui/blocks/auth-split/model";
// Package build (after the first npm release, or a packed tarball): import { AuthSplit, type AuthSplitValues } from "@sheenui/theme";

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
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Name, email, password (with its reveal button and strength checklist), the terms checkbox, submit, then the social buttons. |
| Enter | Submit the form. A failed check moves focus to the first invalid field. |
| Enter / Space on the pause button or a dot | Pause the testimonials / show that one. |

## Accessibility

- A real <form> with linked error text (role="alert" for a failed submit) and polite status regions; the success screen takes focus.
- The password-strength bar is a role="meter" and the checklist is text, so strength never rests on color.
- Testimonials rotate with a pause button and dots, both reachable by keyboard; rotation is manual-only with reduced motion.

## All exports on this page

- AuthSplit — Props (see AuthSplitProps): title, subtitle, headline, description, features, stats, testimonials (defaultAuthSplitTestimonials).
- defaultAuthSplitLabels — The English AuthSplitLabels used when labels is omitted; a partial labels prop is merged over them.
- passwordStrength — Scores a password from 1 (weak) to 4 (strong) by length (minLength, default 8), mixed case, a digit and a symbol.


## When to use the sign-up page

- Use AuthSplit as a split-screen sign up page where a glass form with name, email, password and a terms checkbox sits beside a dark brand panel with a headline, feature list and testimonials.
- Use it for a marketing site's registration route, filling stats and testimonials to show social proof and setting reverse to put the brand panel on the other side.
- Use it when you want live password guidance, since it renders a strength meter with a text checklist, and a confirmation screen that asks the person to check their email.
- Skip it when you only need a compact returning-user form inside a modal; GlassLogin is smaller and has no brand panel, strength checklist or resend flow.
- Pair it with OtpVerification for a code step after submit, Checkbox and Input for any extra consent or profile fields you add, and SheenLogo if you supply your own brand mark.


## Frequently asked questions

### How do I build a sign up page in React with AuthSplit?

Render AuthSplit with onSubmit({ name, email, password }) and optionally onSocial(provider) and onResend(email). Throw inside onSubmit to show an error above the button. Set headline, description, features, stats and testimonials to fill the brand panel, plus termsHref and privacyHref for the consent line.

### How does the password strength meter work for assistive tech?

The strength bar uses role="meter", and the same requirements appear as a text checklist, so the state does not depend on color. The minimum comes from minPasswordLength (default 8). Failed submits show linked error text, with role="alert" for the submit failure, and focus moves to the first invalid field.

### Do the testimonials rotate, and can users stop them?

Testimonials rotate every rotateEvery seconds (default 7), with a pause button and dots reachable by keyboard. Under reduced motion there is no auto-rotation and no aurora drift; people use the dots instead. Pass your own testimonials array to replace defaultAuthSplitTestimonials.

### Which heading level and layout options can I change?

headingLevel defaults to 1, so lower it if the page already has an h1. reverse swaps the form and brand panel, signInHref defaults to "#" and null hides the sign-in link, and labels translates the strings. The success screen takes focus when the account is created.


## Related pages

- [Glass login](https://lokendra-builds.github.io/sheenui/blocks/glass-login)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [Bento grid](https://lokendra-builds.github.io/sheenui/blocks/bento-grid)
- [Chat app](https://lokendra-builds.github.io/sheenui/blocks/chat-app)
- [Notification center](https://lokendra-builds.github.io/sheenui/blocks/notification-center)
- [Pricing](https://lokendra-builds.github.io/sheenui/blocks/pricing)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
