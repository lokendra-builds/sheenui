Canonical: https://lokendra-builds.github.io/sheenui/blocks/lamp-login

# React Lamp Login: Pull-Cord Glass Sign-In

URL: https://lokendra-builds.github.io/sheenui/blocks/lamp-login
Sidebar name: Lamp login

A React login screen on a dark stage: pull the lamp cord and a warm light cone reveals a glass sign-in card. Keyboard accessible. Tailwind v4, MIT.

What it is: A dark stage with a pull cord: pull it and a warm light cone reveals a glass sign-in card. The card is always there for keyboards and screen readers.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/lamp-login.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Lamp login

Files to copy from `theme/src/`:

- `blocks/{lamp-login.tsx, glass-login.tsx, icons.tsx}`
- `components/button/`
- `components/glass-card/`
- `components/input/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, light-follower.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, heading.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: lamp-login. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { LampLogin } from "@/components/sheenui/blocks/lamp-login";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { LampLogin } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| lit | boolean | optional, no default | Controls whether the light is on (boolean). Use with onLitChange; leave it out to let the block keep the state. |
| defaultLit | boolean | false | The light's starting state when uncontrolled (boolean, default false; with reduced motion the light starts on). |
| onLitChange | ((lit: boolean) => void) | optional, no default | Called when the light is switched by the cord, or by focus entering the card ((lit: boolean) => void). |
| title | ReactNode | "Welcome back" | Sets the card heading (ReactNode, default "Welcome back"). |
| subtitle | ReactNode | "Sign in to continue to your workspace." | The line under the heading (ReactNode, default "Sign in to continue to your workspace."). |
| onSubmit | ((values: GlassLoginValues) => void \| Promise<void>) | optional, no default | Called with the form values. Return a promise to show a loading state; throw to show an error. |
| onSocial | ((provider: "github" \| "google") => void) | optional, no default | Show "Continue with GitHub / Google" buttons. Without it the social row is hidden. |
| forgotHref | string | "#" | Target of the "Forgot password?" link (string, default "#"). |
| signUpHref | string \| null | "#" | Target of the sign-up link (string \| null, default "#"). Hide the sign-up line by passing null. |
| minPasswordLength | number | 8 | Minimum password length checked before submitting (number, default 8). |
| loginLabels | Partial<GlassLoginLabels> | defaultGlassLoginLabels | Every other string, for translation: loginLabels={{ email: "…" }}; omitted keys keep the English of defaultGlassLoginLabels. All 15 keys of GlassLoginLabels are listed in the key table under the props table. |
| labels | Partial<LampLoginLabels> | defaultLampLoginLabels | Every other string, for translation: labels={{ cord: "…" }}; omitted keys keep the English of defaultLampLoginLabels. All 3 keys of LampLoginLabels are listed in the key table under the props table. |
| headingLevel | HeadingLevelOption | 2 | Level of the card heading (1 to 6). "none" renders a paragraph with no heading role (for an example). |
| className | string | optional, no default | Adds extra classes to the stage (string). |

## Example 1 of 2: Pull the cord

Click the bead, press Enter or Space on it, or drag it down on a touch screen. Tabbing into the card also switches the light on. With reduced motion the light starts on.

```tsx
import { LampLogin } from "@/components/sheenui/blocks/lamp-login";
// Package build (after the first npm release, or a packed tarball): import { LampLogin } from "@sheenui/theme";

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
}
```

## Example 2 of 2: Starts lit, with social buttons

defaultLit starts with the light on; onLitChange reports every switch. onSocial and the other GlassLogin options pass straight through.

```tsx
import { LampLogin } from "@/components/sheenui/blocks/lamp-login";
// Package build (after the first npm release, or a packed tarball): import { LampLogin } from "@sheenui/theme";

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
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The cord first, then the card's fields, links and buttons in order. |
| Enter / Space on the cord | Pull it: switch the light on or off. |
| Drag the cord down | On touch: past about 24 px counts as a pull. |
| Focus into the card | Switches the light on, so nobody types into the dark. |

## Accessibility

- The cord is a real toggle button named by labels.cord; its pressed state says whether the light is on. The hint under the lamp is text.
- The card is always in the page and in tab order. The lamp, cone and dimming layer are aria-hidden: nothing is said by light alone.
- The stage is forced dark, so the glass and its text keep at least 4.5:1 contrast whatever the page theme.
- Reduced motion: the light starts on, the cord does not swing and the cone does not grow; pulling it still changes the light with a short fade.

## All exports on this page

- LampLogin — A sign-in card on a dark stage: a lamp with a pull cord.
- defaultLampLoginLabels — The English LampLoginLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the lamp login form

- Use LampLogin as an animated login page for a product that wants one memorable first impression: a dark stage, a lamp with a pull cord, and a sign-in card that the light reveals.
- Use it for a portfolio, a game or a creative tool where the sign-in screen is part of the brand, and the form itself still needs real validation, a loading state and error messages.
- Use lit, defaultLit and onLitChange when the surrounding page needs to know whether the light is on, for example to start the stage already lit after a failed sign-in.
- Skip it for a plain admin sign-in where speed matters more than delight; GlassLogin is the same form without the stage.
- Pair it with GlassLogin options such as onSocial and forgotHref, which it passes straight through, and with useSheenReducedMotion if you add motion of your own around it.


## Frequently asked questions

### How do I build a pull-cord lamp login in React?

Render LampLogin from @sheenui/theme with an onSubmit that receives { email, password }. Pulling the cord (click, Enter, Space, or a drag down on touch) switches the light on and reveals the card. Return a promise from onSubmit to show the loading state, or throw to show an error.

### Can keyboard and screen-reader users sign in without pulling the cord?

Yes. The card is always in the page and in tab order; the light is only a look. The cord is a real toggle button named by labels.cord, and focus entering the card switches the light on, so nobody types into the dark.

### What happens with reduced motion?

The light starts on, the cord does not swing and the cone does not grow. Pulling the cord still switches the light with a short fade.

### Can I translate the text?

Yes. labels holds the cord name and the two hints, and loginLabels holds every string of the card (it is a GlassLogin). Pass partial objects and they are merged over the English defaults.


## Related pages

- [Glass login](https://lokendra-builds.github.io/sheenui/blocks/glass-login)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [OTP verification](https://lokendra-builds.github.io/sheenui/blocks/otp-verification)
- [Payment checkout](https://lokendra-builds.github.io/sheenui/blocks/payment-checkout)
- [Dashboard stats](https://lokendra-builds.github.io/sheenui/blocks/dashboard-stats)
- [AI chat](https://lokendra-builds.github.io/sheenui/blocks/ai-chat)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
