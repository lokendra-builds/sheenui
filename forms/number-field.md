Canonical: https://lokendra-builds.github.io/sheenui/forms/number-field

# React Number Input with Steppers & Formatting

URL: https://lokendra-builds.github.io/sheenui/forms/number-field
Sidebar name: Number field

A glass React number input with hold-to-repeat steppers, a drag-to-scrub label and Intl formatting for currency, percent and units. Base UI, Tailwind v4.

What it is: A glass React number input with steppers you can hold, a scrub label you can drag, and Intl formatting for currency, percentages and units.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/number-field.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Number field

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/number-field/`
- `hooks/{use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, field-size.ts, form.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: number-field. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { NumberField } from "@/components/sheenui/number-field/number-field";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, NumberField } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| aria-describedby | string | optional, no default | Id of extra describing text, merged with the description and error. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the input invalid without an error message. |
| aria-label | string | optional, no default | Name for screen readers when there is no visible label. |
| onBlur | FocusEventHandler<HTMLInputElement> | optional, no default | Called when the input loses focus (react-hook-form: marks the field touched). |
| onValueChange | ((value: number \| null, eventDetails: BaseNumberField.Root.ChangeEventDetails) => void) | optional, no default | Called with the new value (null when cleared). Base UI's change details come second. |
| label | ReactNode | optional, no default | Text above the field, linked to the input as its accessible name. |
| description | ReactNode | optional, no default | Muted helper text under the field. |
| error | ReactNode | optional, no default | Error message; marks the field invalid and is announced politely to screen readers when it appears. |
| steppers | "none" \| "split" \| "stacked" | "split" | Where the − / + buttons go: "split" (default), "stacked" or "none". "stacked" falls back to "split" on touch screens (bigger targets). |
| scrub | boolean | false | Drag the label sideways to change the value. |
| animated | boolean | true | Slide changed digits when the value steps. Off with reduced motion. |
| size | FieldSize | "md" | Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. |
| placeholder | string | optional, no default | Hint shown while the field is empty. |
| labels | Partial<NumberFieldLabels> | defaultNumberFieldLabels | Every string, for translation: { increment: "Increase", decrement: "Decrease" } (accessible names of the + and − buttons). Every other string, for translation: labels={{ increment: "…" }}; omitted keys keep the English of defaultNumberFieldLabels. All 2 keys of NumberFieldLabels are listed in the key table under the props table. |
| className | string | optional, no default | Class for the outer wrapper (label + field + messages). |
| inputClassName | string | optional, no default | Adds extra classes to the native <input>. |
| ...props | Base UI props | optional, no default | Every other prop of Base UI's NumberField.Root is passed through, for example form, id, inputRef, allowOutOfRange, allowWheelScrub and snapOnStep. |

## Example 1 of 3: Steppers

Hold a button to repeat. Arrow keys step by 1, Shift by 10; Home and End jump to the limits. The buttons switch off at min and max. Reset sets the value from outside, and the digits still roll the right way.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { NumberField } from "@/components/sheenui/number-field/number-field";
// Package build (after the first npm release, or a packed tarball): import { Button, NumberField } from "@sheenui/theme";

export function Example() {
  const [quantity, setQuantity] = useState<number | null>(2);

  return (
    <>
      <NumberField
        label="Quantity"
        value={quantity}
        onValueChange={setQuantity}
        min={1}
        max={20}
        description="Up to 20 per order."
      />
      {/* A change from outside rolls the digits the right way too. */}
      <Button variant="ghost" size="sm" onClick={() => setQuantity(1)}>
        Reset
      </Button>
    </>
  );
}
```

## Example 2 of 3: Formatting

Pass any Intl.NumberFormat options. Typing is parsed back in the same format and locale.

```tsx
import { NumberField } from "@/components/sheenui/number-field/number-field";
// Package build (after the first npm release, or a packed tarball): import { NumberField } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <NumberField
        label="Price"
        defaultValue={49}
        step={0.5}
        min={0}
        format={{ style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" }}
      />
      <NumberField
        label="Discount"
        defaultValue={0.15}
        step={0.05}
        min={0}
        max={1}
        steppers="stacked"
        format={{ style: "percent" }}
      />
      <NumberField
        label="Weight"
        defaultValue={2.5}
        step={0.1}
        min={0}
        steppers="stacked"
        format={{ style: "unit", unit: "kilogram", maximumFractionDigits: 1 }}
      />
    </>
  );
}
```

## Example 3 of 3: Scrub and validation

With scrub, drag the label sideways to change the value (the pointer is captured, so you can keep dragging). Errors are linked to the input and announced politely when they appear.

```tsx
import { useState } from "react";
import { NumberField } from "@/components/sheenui/number-field/number-field";
// Package build (after the first npm release, or a packed tarball): import { NumberField } from "@sheenui/theme";

export function Example() {
  const [guests, setGuests] = useState<number | null>(2);

  return (
    <>
      <NumberField
        label="Opacity"
        scrub
        defaultValue={0.8}
        step={0.01}
        min={0}
        max={1}
        format={{ style: "percent" }}
      />
      <NumberField
        label="Guests"
        value={guests}
        onValueChange={setGuests}
        min={1}
        error={guests !== null && guests > 10 ? "The room seats 10 people at most." : undefined}
      />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Focus the input; the - and + buttons are not tab stops. |
| Arrow Up / Arrow Down | Step the value (Shift: large step, Alt: small step). |
| Home / End | Jump to min or max. |
| Type, paste, clear | Work as in any text field; the typed value is committed when the field loses focus. |

## Accessibility

- A text input with inputmode and aria-roledescription="Number field"; the - and + buttons are named by labels.decrement and labels.increment.
- An error is announced politely. Buttons are 44 px targets on touch screens.
- The odometer motion is decorative; under reduced motion digits change in place.

## All exports on this page

- NumberField — A glass number field on Base UI's NumberField, for quantities, prices and settings where people nudge a number or type an exact one.
- defaultNumberFieldLabels — The English NumberFieldLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the number field

- Use it as a number stepper for a quantity picker in a cart or a guest count on a booking form, where the minus and plus buttons repeat while held and min and max clamp the value.
- Use it for a price or percentage input that must show currency formatting: the format prop takes Intl.NumberFormat options, and typed text is parsed back in the same locale format.
- Use it in a settings panel or design tool where scrub lets people drag the label sideways to change the value, like the numeric fields of an editor.
- Skip it when a rough value on a scale is enough, such as volume or opacity; a Slider fits that better, and plain Input fits free text like a postal code or a phone number.
- Pair it with its description and error props for helper text and the message, SegmentedControl for a unit switch beside the number, and Button for an apply action after editing several values.


## Frequently asked questions

### How do I step a React number input with the keyboard?

Focus the input and use Up and Down to step by step. Shift uses largeStep and Alt uses smallStep. Home and End jump to min and max. The stepper buttons are not tab stops, because the input already offers the same keys, and they repeat when held with a pointer.

### Is the number field a spinbutton for screen readers?

No, deliberately. Base UI renders a text input with a decimal inputMode, announced as a Number field through aria-roledescription, so phones show a numeric keypad. There are no aria-valuenow, min or max attributes; the value is the text itself, and min and max clamp it.

### How do I show currency, percent or units?

Pass format with any Intl.NumberFormat options, for example style currency with currency USD. It uses the visitor's locale unless you set locale. Typing and pasting are parsed back using the same format, and name submits the value with a form.

### What is the odometer effect, and can I turn it off?

When the value steps through buttons, arrow keys, the wheel or scrub, the changing digits slide up or down like an odometer. While you type, the plain input shows. It is a decorative overlay and never animates with reduced motion or in high contrast mode.


## Related pages

- [Radio group](https://lokendra-builds.github.io/sheenui/forms/radio-group)
- [Rating](https://lokendra-builds.github.io/sheenui/forms/rating)
- [Segmented control](https://lokendra-builds.github.io/sheenui/forms/segmented-control)
- [Tags input](https://lokendra-builds.github.io/sheenui/forms/tags-input)
- [Textarea](https://lokendra-builds.github.io/sheenui/forms/textarea)
- [Toggle](https://lokendra-builds.github.io/sheenui/forms/toggle)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
