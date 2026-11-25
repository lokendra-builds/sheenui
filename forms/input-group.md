Canonical: https://lokendra-builds.github.io/sheenui/forms/input-group

# React Input Group: Prefix, Suffix & Button

URL: https://lokendra-builds.github.io/sheenui/forms/input-group
Sidebar name: Input group

A React input group that attaches a prefix, suffix, unit or button to a field inside one glass edge with a shared focus ring. Tailwind CSS v4, MIT.

What it is: A React input group that attaches text, icons or buttons to a field and shares one focus ring. Use InputGroup when one field needs things attached to it: an https:// prefix, a .com suffix, a currency or unit, or a button such as Apply inside the same edge.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/input-group.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Input group

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/input-group/`
- `lib/{cn.ts, field-size.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: input-group. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/sheenui/field/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/sheenui/input-group/input-group";
```

These examples also use button, field: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/field.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Field, FieldControl, FieldError, FieldLabel, InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";
```

## InputGroup props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | InputGroupAddons and one InputGroupInput, in reading order. |
| size | FieldSize | "md" | Height, the same scale as Button and every field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens). |
| invalid | boolean | false | Mark the group invalid (danger edge). Pair it with aria-invalid on the input. |
| disabled | boolean | false | Dim the group; disable the input yourself. |

## InputGroupAddon props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| align | "end" \| "start" | "start" | Which end of the field it sits on: "start" (before the input, default) or "end". It only changes the divider side: put the addon where you want it in the markup (DOM order is the reading order and the visual order). |

## Other parts

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| InputGroupText | span props | optional, no default | Shows plain text inside an addon. |
| InputGroupInput | input props | optional, no default | The text field, as tall as the group, forwarding ref. |

## Example 1 of 2: Prefix, suffix, unit and button

Compose InputGroupAddon and InputGroupInput in reading order. Use Input's leading and trailing for a single icon.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/sheenui/input-group/input-group";
// Package build (after the first npm release, or a packed tarball): import { Button, InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Domain" placeholder="example" />
        <InputGroupAddon align="end">
          <InputGroupText>.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup size="lg">
        <InputGroupInput aria-label="Amount" inputMode="decimal" placeholder="0.00" />
        <InputGroupAddon align="end">USD</InputGroupAddon>
      </InputGroup>
      <InputGroup size="sm" invalid>
        <InputGroupInput aria-label="Coupon" aria-invalid defaultValue="SPRING" />
        <InputGroupAddon align="end">
          <Button variant="ghost" size="sm">Apply</Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
```

## Example 2 of 2: Inside a Field

Field wires the label, the description and the error to the input: wrap the InputGroupInput in FieldControl, and set invalid on both the Field and the group so the danger edge and the message agree.

```tsx
import { useState } from "react";
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/sheenui/field/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/sheenui/input-group/input-group";
// Package build (after the first npm release, or a packed tarball): import { Field, FieldControl, FieldError, FieldLabel, InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";

export function Example() {
  const [slug, setSlug] = useState("");
  const invalid = slug.length > 0 && !/^[a-z0-9-]+$/.test(slug);

  return (
    <Field invalid={invalid} className="max-w-sm">
      <FieldLabel>Workspace address</FieldLabel>
      <InputGroup invalid={invalid}>
        <InputGroupAddon>
          <InputGroupText>example.com/</InputGroupText>
        </InputGroupAddon>
        <FieldControl>
          <InputGroupInput value={slug} onChange={(event) => setSlug(event.target.value)} />
        </FieldControl>
      </InputGroup>
      <FieldError>Use lowercase letters, numbers and dashes.</FieldError>
    </Field>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focuses the input, then any button inside an addon. |
| Typing | Works as in any text input; the addons are not focusable text. |

## Accessibility

- The group is role="group". Name the input with aria-label or a Field label: addon text is read as part of the page but is not the input's name unless you link it with aria-describedby.
- invalid shows the danger edge; set aria-invalid on the input too, so the state is not carried by colour alone.
- Icons in an addon should be aria-hidden; text such as https:// is read in order with the field.
- Height follows the shared control scale (sm 32px, md 40px, lg 48px; 44px for sm and md on touch screens).

## When to use the input group

- Use InputGroup for a URL field with an https:// prefix, a price with a currency symbol and a unit, or a search box with an Apply button on its right edge, all sharing one focus ring.
- Compose InputGroupAddon and InputGroupInput in reading order. Use align end on an addon that follows the input, and put it after the input in the markup.
- Wrap the input in Field with FieldControl when it needs a label, a description or an error message, and set invalid on the Field and the group together.
- Skip it for a single icon inside a plain field. Input has leading and trailing slots for that.
- Pair it with Button for an inline action, Tooltip on an icon-only addon, and Select when the addon is a currency or unit picker.


## Frequently asked questions

### How do I put a prefix or a suffix on a React input?

Wrap InputGroupAddon with InputGroupText around the prefix, put InputGroupInput next, and add a second InputGroupAddon with align end for the suffix. All of it shares one glass edge and one focus ring.

### How does the invalid state work?

invalid on the group draws the danger edge. Also set aria-invalid on the input, or put the group inside a Field with invalid, so the state is not carried by color alone.

### How tall is the group?

It follows the shared control scale: sm 32px, md 40px, lg 48px, and 44px for sm and md on touch screens.

### Is the addon text part of the input's name?

No. Name the input with aria-label or a Field label. Addon text such as https:// is read in page order but is not the input's accessible name.


## Related pages

- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [Number field](https://lokendra-builds.github.io/sheenui/forms/number-field)
- [Field and Label](https://lokendra-builds.github.io/sheenui/forms/field)
- [Radio group](https://lokendra-builds.github.io/sheenui/forms/radio-group)
- [Rating](https://lokendra-builds.github.io/sheenui/forms/rating)
- [Segmented control](https://lokendra-builds.github.io/sheenui/forms/segmented-control)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
