Canonical: https://lokendra-builds.github.io/sheenui/components/otp-input

# React OTP Input: Animated One-Time Code Field

URL: https://lokendra-builds.github.io/sheenui/components/otp-input
Sidebar name: OTP input

An animated React OTP input with paste, arrow keys and SMS autofill from Base UI's OTP field. Digits pop in, errors shake. Tailwind CSS v4, free, MIT.

What it is: A React OTP input with one slot per digit, paste and SMS autofill, and Motion feedback: digits pop in, errors shake and success ripples.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/otp-input.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > OTP input

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/otp-input/`
- `hooks/{use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: otp-input. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { OtpInput, type OtpStatus } from "@/components/sheenui/otp-input/otp-input";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { OtpInput, type OtpStatus } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Form field name (the joined code is submitted under it). |
| required | boolean | optional, no default | Mark the field as required for form validation. |
| disabled | boolean | optional, no default | Disables every digit slot of the field. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| size | "sm" \| "md" \| "lg" | "md" | Slot size, in step with the other controls: "sm", "md" (default) or "lg". |
| length | number | 6 | Number of digits the code has. |
| value | string | optional, no default | Sets the code so far when controlled. Digits only. |
| defaultValue | string | optional, no default | Sets the starting code when uncontrolled. |
| onValueChange | ((value: string) => void) | optional, no default | Called on every change with the digits entered so far. |
| onComplete | ((value: string) => void) | optional, no default | Fires once every slot is filled. |
| status | OtpStatus | "idle" | "error" shakes the field and glows red; "success" plays successEffect. Set back to "idle" before re-triggering. |
| successEffect | OtpSuccessEffect | "seal" | What "success" plays: "seal" (the slots fold into one glass seal with a drawn check), "ring" (a ring ripples round each slot) or "none" (colour only). Reduced motion fades the seal in and skips the rest. |
| stateLight | boolean | true | Lights the row by status: a red aura and lit edge for "error", green for "success" (data-state on the row, drawn on its own layer). The status is always written as text and border colour too. |
| label | ReactNode | optional, no default | Visible text above the slots; it names the first slot. |
| labels | Partial<OtpInputLabels> | defaultOtpInputLabels | Every string, for translation: { name: "Verification code" } (the default accessible name). Every other string, for translation: labels={{ name: "…" }}; omitted keys keep the English of defaultOtpInputLabels. Its only key is listed in the key table under the props table. |
| aria-label | string | labels?.name ?? defaultOtpInputLabels.name | Accessible name when no visible label is shown. |
| aria-labelledby | string | optional, no default | Id of an element that names the field (instead of label / aria-label). |
| description | ReactNode | optional, no default | Muted helper text under the slots. |
| errorMessage | ReactNode | optional, no default | Shown and announced while status is "error". |
| successMessage | ReactNode | optional, no default | Shown and announced while status is "success". |
| digitLabel | ((position: number, length: number) => string) | (position, total) => `Digit ${position} of ${total}` | Accessible name of slots 2…n. Translate it with the rest of your UI. |
| grouped | boolean | false | Visually split the slots into two groups (e.g. 3 + 3). |
| mask | boolean | false | Hide the digits like a password field. |
| autoFocus | boolean | optional, no default | Focus the first slot on mount. Use it only when the code is the one thing on the screen. |
| id | string | generated | Id of the first slot; a generated one is used when omitted. |
| className | string | optional, no default | Class for the outer wrapper (label + slots + messages). |

## Example 1 of 4: Basic

Enter the code we sent you.

```tsx
import { OtpInput } from "@/components/sheenui/otp-input/otp-input";
// Package build (after the first npm release, or a packed tarball): import { OtpInput } from "@sheenui/theme";

export function Example() {
  return (
    <OtpInput length={6} label="Verification code" description="Enter the code we sent you." />
  );
}
```

## Example 2 of 4: Status feedback

The correct code is 123456. Anything else shakes the field.

```tsx
import { useState } from "react";
import { OtpInput, type OtpStatus } from "@/components/sheenui/otp-input/otp-input";
// Package build (after the first npm release, or a packed tarball): import { OtpInput, type OtpStatus } from "@sheenui/theme";

export function Example() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<OtpStatus>("idle");

  return (
    <OtpInput
      grouped
      value={value}
      status={status}
      errorMessage="That code didn't match. Try 123456."
      successMessage="Code verified."
      // Only clear the status once the code is incomplete again: onValueChange also fires for the
      // last digit, and an unconditional reset there would undo onComplete's result.
      onValueChange={(v) => { setValue(v); if (v.length < 6) setStatus("idle"); }}
      onComplete={(v) => setStatus(v === "123456" ? "success" : "error")}
    />
  );
}
```

## Example 3 of 4: Success effect

Type any 6 digits. "seal" (the default) scans the slots with light, folds them into one glass seal and draws a check; "ring" ripples a ring round each slot; "none" only recolours them. Reduced motion fades the seal in and skips the rest.

```tsx
import { OtpInput } from "@/components/sheenui/otp-input/otp-input";
// Package build (after the first npm release, or a packed tarball): import { OtpInput } from "@sheenui/theme";

export function Example() {
  return (
    <OtpInput
      successEffect="seal" // "seal" (default) | "ring" | "none"
      status="success"
      defaultValue="123456"
      successMessage="Code verified."
    />
  );
}
```

## Example 4 of 4: Masked, 4 digits

```tsx
import { OtpInput } from "@/components/sheenui/otp-input/otp-input";
// Package build (after the first npm release, or a packed tarball): import { OtpInput } from "@sheenui/theme";

export function Example() {
  return (
    <OtpInput length={4} mask label="PIN" />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the first empty slot. |
| 0-9 (or letters, for alphanumeric) | Fill the slot and advance. |
| Backspace | Clear the slot and move back. |
| Arrow Left / Arrow Right | Move between slots. |
| Paste | Fill every slot at once. |

## Accessibility

- The first slot is named by the label and the others "Digit n of N"; autoComplete="one-time-code" lets phones suggest the code.
- The error and success messages sit in a polite live region; the seal and its sparks are decorative (aria-hidden), so the announcement is the same for every successEffect.
- Slots are at least 44 px wide and 48 px tall with a 3:1 border (WCAG 1.4.11).

## All exports on this page

- OtpInput — One-time code input: a row of single-digit slots for SMS, email and authenticator codes.
- defaultOtpInputLabels — The English OtpInputLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the OTP input

- Use OtpInput as a verification code input in React on a two-factor sign-in or phone verification screen, where an SMS or authenticator code of fixed length arrives and people type or paste it. Treat it as an input-otp alternative when you want styled, labeled code slots instead of a headless primitive.
- Use onComplete to verify the code the moment the last digit lands, and set status to error or success to shake the field or play a soft ripple with a message.
- Use grouped for a six digit code shown as 3 + 3, or mask when the code is sensitive and should not be readable over someone's shoulder.
- Skip it when the value is not a fixed-length numeric code. Use Input for an email or a recovery phrase, including a password with a show button in its trailing slot.
- Pair it with Button for a resend action, Alert for a rate-limit message, and the OTP verification block, which already assembles these pieces on one screen.


## SheenUI OtpInput or input-otp?

input-otp is a headless one-time-code library. SheenUI's OtpInput is built on Base UI's OTP field and arrives styled: glass slots, paste and SMS autofill, grouped and mask options, and error and success feedback through the status prop. Use input-otp if you want to draw every slot yourself; use this one if you want a finished, accessible field to copy.


## Frequently asked questions

### How do I build a React OTP input with SheenUI?

Render OtpInput with a length, 6 by default, and handle value with onValueChange or leave it uncontrolled with defaultValue. onComplete fires once every slot is filled. It is built on Base UI OTPField, and name submits the joined code with a form.

### Can users paste a code or use SMS autofill?

Yes to both. Pasting a whole code fills every slot at once, and the slots use autoComplete one-time-code, so phones can offer the SMS code. Typing advances to the next slot, Backspace clears and moves back, and the left and right arrow keys move between slots.

### How are the slots named for screen readers?

The first slot is named by the label or aria-label, which defaults to Verification code. The others are named Digit n of N through digitLabel, which you can translate. Error and success messages sit in a polite live region, and each slot is at least 44px wide and 48px tall.

### How do I trigger the error shake more than once?

Set status back to idle before setting it to error again. The shake and the success ripple play when the status changes, so repeating the same status does nothing. Both animations use transform and opacity only, and both are skipped when reduced motion is on.


## Related pages

- [OTP verification](https://lokendra-builds.github.io/sheenui/blocks/otp-verification)
- [Number field](https://lokendra-builds.github.io/sheenui/forms/number-field)
- [Popover](https://lokendra-builds.github.io/sheenui/components/popover)
- [Progress](https://lokendra-builds.github.io/sheenui/components/progress)
- [Select](https://lokendra-builds.github.io/sheenui/components/select)
- [Slider](https://lokendra-builds.github.io/sheenui/components/slider)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
