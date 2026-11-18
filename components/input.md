Canonical: https://lokendra-builds.github.io/sheenui/components/input

# Glass Input Field for React with Label & Errors

URL: https://lokendra-builds.github.io/sheenui/components/input
Sidebar name: Input

A glassmorphism text input for React with label, description and error wired for screen readers by Base UI Field, plus a soft focus glow. Tailwind v4.

What it is: A glass text input for React with its label, description and error message wired up for screen readers, and a soft accent glow on focus.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/input.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Input

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/input/`
- `components/spinner/`
- `lib/{cn.ts, field-size.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: input. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Input } from "@/components/sheenui/input/input";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Input } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| className | string | optional, no default | Class for the outer wrapper (label + field + messages), same as Select and Combobox. |
| onBlur | FocusEventHandler<HTMLInputElement> | optional, no default | Called when the field loses focus (native onBlur; also the point where a form library marks the field touched). |
| size | FieldSize | "md" | Height and padding, the same scale as Button and every other field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens). |
| label | ReactNode | optional, no default | Text above the field, linked to the input as its accessible name. |
| description | ReactNode | optional, no default | Muted helper text under the field. Hidden while an error shows. |
| error | ReactNode | optional, no default | Error message; marks the field invalid and is announced to screen readers. |
| leading | ReactNode | optional, no default | Icon or text shown inside the field, on the left. |
| trailing | ReactNode | optional, no default | Icon, text or button shown inside the field, on the right. |
| loading | boolean | false | Shows a spinner at the field's trailing edge and sets aria-busy (a lookup or validation is running). The field stays editable. |
| name | string | optional, no default | Field name for form submission and for matching an error from a form library. |
| readOnly | boolean | false | The value can be selected and copied but not edited; the field stays focusable and is submitted with the form. |
| required | boolean | false | The field must be filled before the form can be submitted. |
| autoComplete | string | "email" for type="email" | Autofill hint (the HTML autocomplete token, for example "email" or "one-time-code"). |
| enterKeyHint | "search" \| "enter" \| "done" \| "go" \| "next" \| "previous" \| "send" | "search" for type="search" | Label of the on-screen keyboard's Enter key. |
| inputClassName | string | optional, no default | Adds extra classes to the native <input> element. |

## Example 1 of 3: Label, description and icon

Press / to focus from anywhere.

```tsx
import { Input } from "@/components/sheenui/input/input";
// Package build (after the first npm release, or a packed tarball): import { Input } from "@sheenui/theme";
import { Search as SearchIcon } from "lucide-react";

export function Example() {
  return (
    <Input
      label="Search"
      placeholder="Find components…"
      description="Press / to focus from anywhere."
      leading={<SearchIcon />}
    />
  );
}
```

## Example 2 of 3: Validation

Pass error to mark the field invalid; the message is linked to the input and announced.

```tsx
import { useState } from "react";
import { Input } from "@/components/sheenui/input/input";
// Package build (after the first npm release, or a packed tarball): import { Input } from "@sheenui/theme";

export function Example() {
  const [email, setEmail] = useState("hello@");
  const error = /^\S+@\S+\.\S+$/.test(email) ? undefined : "Enter a valid email address.";

  return (
    <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
  );
}
```

## Example 3 of 3: Sizes

sm (32px), md (40px, default) and lg (48px): the same scale as Button, so a button beside an input lines up. On touch screens sm and md are 44px.

```tsx
import { Input } from "@/components/sheenui/input/input";
// Package build (after the first npm release, or a packed tarball): import { Input } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input size="md" placeholder="Medium" aria-label="Medium" />
      <Input size="lg" placeholder="Large" aria-label="Large" />
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move focus to or from the input. |
| Type, select, paste | Everything the native input does works, including autofill and undo. |

## Accessibility

- label, description and error are linked with aria-labelledby and aria-describedby; an error is announced politely.
- Icons and affixes are decorative (aria-hidden); the input keeps its own name.
- Text is 16 px on touch screens so iOS does not zoom on focus; the border keeps 3:1 contrast.

## When to use Input

- Use Input as a text input with label and error for single-line entry like email, password, search and names in a sign-in or checkout form, where a label and an error message must be tied to the field.
- Use leading and trailing for a search box with a magnifier icon, or a password field with a show button inside the right edge of the field.
- Use the error prop for server-side validation messages, which mark the field invalid with aria-invalid and are announced without moving focus.
- Skip it when the text spans several lines or the value is a stepped number. Use Textarea for multi-line text, NumberField for a stepper, and OtpInput for a fixed-length code.
- Pair it with Button for submit, its label, description and error props for the field text, and Select or Combobox in the same form, since all three share the className wrapper convention.


## Frequently asked questions

### How do I add a label and error to a glass input in React?

Pass label, description and error. Base UI Field links them to the input through aria-labelledby, aria-describedby and aria-invalid. The description is hidden while an error shows, and the error is announced to screen readers. Without a visible label, set aria-label instead.

### What does className style on the Input?

className styles the outer wrapper that holds label, field and messages, matching Select and Combobox. Use inputClassName for the native input element. Every other prop, such as type, value, onChange and autoComplete, passes to the input.

### Will iOS zoom into the field on focus?

The input is 44px tall with 16px text on touch screens, which is what stops iOS Safari from zooming on focus. The control border keeps a 3:1 contrast against its surroundings for WCAG 1.4.11, and forced colors mode keeps a visible border.

### Does the input work with form libraries?

Yes. It accepts the native input props, so value, onChange, name, ref and onBlur work with controlled state or libraries such as react-hook-form. Typing, selection and browser autofill behave natively, because the field renders a real input element inside the glass wrapper.


## Related pages

- [Textarea](https://lokendra-builds.github.io/sheenui/forms/textarea)
- [Number field](https://lokendra-builds.github.io/sheenui/forms/number-field)
- [Glass login](https://lokendra-builds.github.io/sheenui/blocks/glass-login)
- [OTP input](https://lokendra-builds.github.io/sheenui/components/otp-input)
- [Popover](https://lokendra-builds.github.io/sheenui/components/popover)
- [Progress](https://lokendra-builds.github.io/sheenui/components/progress)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
