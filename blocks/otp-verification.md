Canonical: https://lokendra-builds.github.io/sheenui/blocks/otp-verification

# OTP Verification Page for React with Resend Timer

URL: https://lokendra-builds.github.io/sheenui/blocks/otp-verification
Sidebar name: OTP verification

A glass OTP verification page for React: auto-submit on the last digit, shake on a wrong code, success state and resend countdown. Tailwind v4, MIT.

What it is: A glass OTP verification page for React that submits on the last digit, shakes on a wrong code and counts down to resend.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/otp-verification.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > OTP verification

Files to copy from `theme/src/`:

- `blocks/{otp-verification.tsx, icons.tsx}`
- `components/button/`
- `components/glass-card/`
- `components/otp-input/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, light-follower.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, heading.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: otp-verification. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { OtpVerification } from "@/components/sheenui/blocks/otp-verification";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { OtpVerification } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| destination | ReactNode | "your email" | Where the code was sent, shown in the description (ReactNode, default "your email"). |
| length | number | 6 | Sets the number of digits (number, default 6). |
| onVerify | (code: string) => boolean \| Promise<boolean> | required | Return true if the code is correct. Throwing counts as a wrong code. |
| onResend | (() => void \| Promise<void>) | optional, no default | Called when the person asks for a new code. Without it the resend control still resets the field. |
| onContinue | (() => void) | optional, no default | Shows a "Continue" button once the code is accepted. |
| resendAfter | number | 30 | Seconds before "Resend" becomes available (number, default 30). |
| autoFocus | boolean | true | Focus the first digit on mount (boolean, default true). Turn it off when the block is not the main task on the page. |
| labels | Partial<OtpVerificationLabels> | defaultOtpVerificationLabels | Every other string, for translation: labels={{ title: "…" }}; omitted keys keep the English of defaultOtpVerificationLabels. All 15 keys of OtpVerificationLabels are listed in the key table under the props table. |
| headingLevel | HeadingLevelOption | 2 | Level of the title heading (1 to 6, default 2); set it to fit the page's outline. "none" renders a paragraph with no heading role (for an example). |
| className | string | optional, no default | Adds extra classes to the outer glass card (string). |
| variant | "default" \| "unlock" | "default" | "default" (the plain card) or "unlock" ("default" \| "unlock", default "default"): a padlock inside a progress ring that fills with every digit and spins while the code is checked. A right code closes the ring in green, opens the lock, bursts sparks, floods the card with light and shows a "Verified" badge; a wrong code rattles the lock and clears the digits. Reduced motion swaps all of it for an instant change. |

## Example 1 of 3: Verify a code

The correct code is 123456.

```tsx
import { OtpVerification } from "@/components/sheenui/blocks/otp-verification";
// Package build (after the first npm release, or a packed tarball): import { OtpVerification } from "@sheenui/theme";

<OtpVerification
  destination="you@example.com"
  onVerify={async (code) => {
    const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code }) });
    return res.ok;
  }}
  onResend={async () => {
    await fetch("/api/resend", { method: "POST" });
  }}
/>
```

## Example 2 of 3: Unlock variant

variant="unlock" puts a padlock inside a ring that fills with every digit. A right code opens the lock and floods the card with light; a wrong code rattles it and clears the digits. The correct code is 482913.

```tsx
import { OtpVerification } from "@/components/sheenui/blocks/otp-verification";
// Package build (after the first npm release, or a packed tarball): import { OtpVerification } from "@sheenui/theme";

export function Example() {
  return (
    <OtpVerification
      variant="unlock"
      destination="the phone ending in 47"
      onVerify={async (code) => code === "482913"}
      onContinue={() => window.location.assign("/app")}
    />
  );
}
```

## Example 3 of 3: Four digits, with a Continue button

length changes the number of slots; onContinue adds a Continue button once the code is accepted. The correct code is 4821.

```tsx
import { OtpVerification } from "@/components/sheenui/blocks/otp-verification";
// Package build (after the first npm release, or a packed tarball): import { OtpVerification } from "@sheenui/theme";

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
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| 0–9 | Type or paste the digits; focus advances by itself. |
| Backspace | Step back to the previous digit. |
| Tab, then Enter / Space on Verify | Verify (the code also verifies as soon as the last digit is in). Verify pressed early moves focus to the first empty slot and explains. |
| Enter / Space on Resend | Ask for a new code, once the countdown is over. |

## Accessibility

- The digit field is named by codeLabel; wrong-code, incomplete, resent and success messages share one polite live region.
- The resend countdown is text, not color only.
- After success focus moves to Continue (or the heading).

## All exports on this page

- OtpVerification — A one-time-code card: digit slots, a verify button, a resend countdown and a success state.
- defaultOtpVerificationLabels — The English OtpVerificationLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the OTP verification page

- Use OtpVerification as an OTP verification UI for the email or SMS confirmation step after sign-up, where the visitor types a six-digit code and, once it is accepted, sees a Continue button if you pass onContinue. Use it as the 2FA code screen after a password step.
- Use it for a two-factor sign-in step in an admin panel, setting length to 4 or 8 to match your provider and resendAfter to the cooldown your backend enforces.
- Use it to confirm a sensitive action such as changing a payout account, with destination naming the phone number or address so the person knows where to look.
- Skip it when you only need the bare digit field inside your own layout; the OtpInput component gives you the slots without the card, verify button and resend countdown.
- Pair it with GlassLogin or AuthSplit for the step that comes before it, and with Toast if your flow needs extra confirmation after Continue.


## Frequently asked questions

### How do I build an OTP verification page in React with this block?

Render OtpVerification with a required onVerify(code) that returns true for a correct code, either directly or from a promise. Add destination, onResend and onContinue as needed. The code is checked automatically when the last digit is entered, and a thrown error counts as a wrong code.

### How does the resend countdown work?

The resend control stays disabled and shows text such as "Resend in 30s" until resendAfter seconds (default 30) pass. Then Resend code calls onResend and starts a new countdown. Without onResend the control still resets the field. The countdown is real text, so it does not depend on color alone.

### Is the OTP field accessible to screen readers and keyboard users?

The field is named by the codeLabel string, and wrong-code, incomplete, resent and success messages share one polite live region. Typing or pasting advances focus, Backspace steps back, and pressing Verify early focuses the first empty slot and explains. After success, focus moves to Continue or the heading.

### Can I stop the first digit from taking focus on page load?

Yes. autoFocus defaults to true, which suits a page whose main task is entering the code. Set autoFocus={false} when the block sits among other content or in a dialog you do not want to steal focus. Every string, including the description function, can be replaced through labels.


## Related pages

- [OTP input](https://lokendra-builds.github.io/sheenui/components/otp-input)
- [Payment checkout](https://lokendra-builds.github.io/sheenui/blocks/payment-checkout)
- [Dashboard stats](https://lokendra-builds.github.io/sheenui/blocks/dashboard-stats)
- [AI chat](https://lokendra-builds.github.io/sheenui/blocks/ai-chat)
- [Sign-up page](https://lokendra-builds.github.io/sheenui/blocks/signup-page)
- [Bento grid](https://lokendra-builds.github.io/sheenui/blocks/bento-grid)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
