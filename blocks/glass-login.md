Canonical: https://lokendra-builds.github.io/sheenui/blocks/glass-login

# React Glass Login Page: Glassmorphism Form

URL: https://lokendra-builds.github.io/sheenui/blocks/glass-login
Sidebar name: Glass login

A glassmorphism login form for React and Tailwind CSS v4: validation, password reveal, loading state and social buttons. Accessible, free, copy-paste.

What it is: A glassmorphism login form for React with validation, a password reveal, a loading state and social sign-in buttons, built from SheenUI's Button, GlassCard and Input.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-login.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Glass login

Files to copy from `theme/src/`:

- `blocks/{glass-login.tsx, icons.tsx}`
- `components/button/`
- `components/glass-card/`
- `components/input/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, light-follower.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, heading.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: glass-login. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { GlassLogin } from "@/components/sheenui/blocks/glass-login";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassLogin } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | "Welcome back" | Sets the heading (ReactNode, default "Welcome back"). |
| subtitle | ReactNode | "Sign in to continue to your workspace." | The line under the heading (ReactNode, default "Sign in to continue to your workspace."). |
| onSubmit | ((values: GlassLoginValues) => void \| Promise<void>) | optional, no default | Called with the form values. Return a promise to show a loading state; throw to show an error. |
| onSocial | ((provider: "github" \| "google") => void) | optional, no default | Show "Continue with GitHub / Google" buttons. Without it the social row is hidden. |
| forgotHref | string | "#" | Target of the "Forgot password?" link (string, default "#"). |
| signUpHref | string \| null | "#" | Target of the sign-up link (string \| null, default "#"). Hide the sign-up line by passing null. |
| minPasswordLength | number | 8 | Minimum password length checked before submitting (number, default 8). |
| labels | Partial<GlassLoginLabels> | defaultGlassLoginLabels | Every other string, for translation: labels={{ email: "…" }}; omitted keys keep the English of defaultGlassLoginLabels. All 15 keys of GlassLoginLabels are listed in the key table under the props table. |
| headingLevel | HeadingLevelOption | 2 | Level of the title heading (1 to 6, default 2); set it to fit the page's outline. "none" renders a paragraph with no heading role (for an example). |
| className | string | optional, no default | Adds extra classes to the outer glass card (string). |

## Example 1 of 2: Sign in

Try submitting empty, then with any email and an 8+ character password.

```tsx
import { GlassLogin } from "@/components/sheenui/blocks/glass-login";
// Package build (after the first npm release, or a packed tarball): import { GlassLogin } from "@sheenui/theme";

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
}
```

## Example 2 of 2: Your copy, a stricter rule, a failing sign-in

Change the heading and the line under it, require 12 characters, hide the sign-up link and leave out the social buttons (they only show when onSocial is given). This one always fails, so you can see the error.

```tsx
import { GlassLogin } from "@/components/sheenui/blocks/glass-login";
// Package build (after the first npm release, or a packed tarball): import { GlassLogin } from "@sheenui/theme";

<GlassLogin
  title="Sign in to Acme"
  subtitle="Use your work email."
  minPasswordLength={12}
  signUpHref={null}
  onSubmit={async () => {
    throw new Error("Wrong email or password"); // the card shows the error and stays editable
  }}
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Email, password, the reveal button, the forgot link, submit, the social buttons, then the sign-up link. |
| Enter | Submit the form. |

## Accessibility

- A real <form> with noValidate and visible error text linked to its field (aria-describedby).
- A failed check moves focus to the first invalid field once its message is linked, and the message is announced.
- The reveal button has a state-aware name (“Show password” / “Hide password” by default).
- Targets are at least 44 px on touch devices.

## All exports on this page

- GlassLogin — A sign-in card: email and password with show/hide, inline validation, a loading state, optional GitHub and Google buttons and a sign-up link.
- defaultGlassLoginLabels — The English GlassLoginLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the glass login form

- Use GlassLogin as a glassy login page for a SaaS dashboard, where one frosted card with email, password and a forgot-password link sits over an aurora or gradient background. Use it as a liquid glass login form when the sign-in screen sits over a SheenBackdrop.
- Use it inside a modal or drawer when a signed-out visitor clicks a gated action, such as saving a design or posting a comment, and you want sign-in without leaving the page.
- Use it for an internal admin tool that needs only email and password plus optional GitHub and Google buttons, with the built-in strings translated through the labels prop and the heading through title and subtitle.
- Skip it when sign-up and sign-in share one screen with a brand panel and password-strength feedback; AuthSplit covers that layout, while GlassLogin only links out to a sign-up page.
- Pair it with SheenBackdrop for the aurora behind the card, the Input component for any extra fields you add around it, and useSheenReducedMotion if you animate the page behind the card.


## Frequently asked questions

### How do I build a glassmorphism login form in React with GlassLogin?

Import GlassLogin from @sheenui/theme and pass onSubmit, which receives { email, password }. Return a promise to show the button loading state, or throw an Error to display its message under the form. Add onSocial(provider) to reveal the GitHub and Google buttons, which stay hidden without it.

### How does GlassLogin validate the email and password?

It renders a real form with noValidate and runs its own checks on submit. A malformed email or a password shorter than minPasswordLength (default 8) shows visible error text linked with aria-describedby, and focus moves to the first invalid field. Change the messages through the labels prop, including the shortPassword function.

### Can I translate or rename the text in the login card?

Yes, every user-facing string lives in GlassLoginLabels: field labels, the show and hide password names, the divider, the submit text and the error messages. Pass a partial labels object and it is merged over defaultGlassLoginLabels, so you only override the strings you change. title and subtitle accept any ReactNode.

### Does the login block work with Next.js and reduced motion?

The file starts with "use client", so import it from a client component or a route that renders one. The loading state and hover fades use the shared motion tokens, and reduced motion and reduced transparency preferences are honored. Targets grow to 44 px on touch devices.


## Related pages

- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [Button](https://lokendra-builds.github.io/sheenui/components/button)
- [Sign-up page](https://lokendra-builds.github.io/sheenui/blocks/signup-page)
- [Lamp login](https://lokendra-builds.github.io/sheenui/blocks/lamp-login)
- [OTP verification](https://lokendra-builds.github.io/sheenui/blocks/otp-verification)
- [Payment checkout](https://lokendra-builds.github.io/sheenui/blocks/payment-checkout)

### Guides that cover it

- [Glassmorphism in React: A Step-by-Step Tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
