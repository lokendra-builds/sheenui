Canonical: https://lokendra-builds.github.io/sheenui/components/checkbox

# Animated Checkbox for React (Indeterminate Too)

URL: https://lokendra-builds.github.io/sheenui/components/checkbox
Sidebar name: Checkbox

An animated glass React checkbox whose check pops in with Motion, with an indeterminate state for select-all. Built on Base UI, styled with Tailwind v4.

What it is: An animated checkbox for React whose check pops in, with an indeterminate state for “select all”, built on Base UI's accessible checkbox.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/checkbox.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Checkbox

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/checkbox/`
- `hooks/use-latest.ts`
- `lib/{cn.ts, field-control-shell.tsx, form.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: checkbox. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Checkbox } from "@/components/sheenui/checkbox/checkbox";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Checkbox } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| className | string | optional, no default | Classes for the outer element: the <label> (or the wrapper holding an error); the control itself when there is neither. |
| controlClassName | string \| ((state: CheckboxRootState) => string \| undefined) | optional, no default | Classes for the checkbox box itself. Base UI's state function form works here. |
| label | ReactNode | optional, no default | Text next to the box. Clicking it toggles the checkbox. Without a label, give the checkbox an aria-label. |
| description | ReactNode | optional, no default | Secondary line under the label. It sits inside the same <label>, so screen readers read it with the label. |
| error | ReactNode | optional, no default | Error message under the control. Marks it invalid (aria-invalid, danger border) and is announced; linked with aria-describedby. |
| checked / defaultChecked | boolean | false | Controlled or uncontrolled state. |
| indeterminate | boolean | false | Shows a dash: some, but not all, children are checked. |
| onCheckedChange | (checked) => void | optional, no default | Called with the new checked state when the control is toggled. |
| disabled | boolean | false | Makes the control non-interactive. |

## Example 1 of 2: Select all (indeterminate)

```tsx
import { useState } from "react";
import { Checkbox } from "@/components/sheenui/checkbox/checkbox";
// Package build (after the first npm release, or a packed tarball): import { Checkbox } from "@sheenui/theme";

export function Example() {
  const [items, setItems] = useState({ design: true, code: false, ship: false });
  const all = Object.values(items).every(Boolean);
  const some = Object.values(items).some(Boolean);

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="All tasks"
        checked={all}
        indeterminate={some && !all}
        onCheckedChange={(v) => setItems({ design: v, code: v, ship: v })}
      />
      <div className="ms-8 flex flex-col gap-3">
        {(["design", "code", "ship"] as const).map((key) => (
          <Checkbox
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            checked={items[key]}
            onCheckedChange={(v) => setItems({ ...items, [key]: v })}
          />
        ))}
      </div>
    </div>
  );
}
```

## Example 2 of 2: In a form

Checkboxes submit with the form through name. Here the button stays disabled until the terms are accepted.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Checkbox } from "@/components/sheenui/checkbox/checkbox";
// Package build (after the first npm release, or a packed tarball): import { Button, Checkbox } from "@sheenui/theme";

export function Example() {
  const [terms, setTerms] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log(Object.fromEntries(new FormData(event.currentTarget)));
      }}
      className="flex flex-col items-start gap-4"
    >
      <Checkbox name="updates" label="Send me product updates" description="One email a month. Unsubscribe any time." defaultChecked />
      <Checkbox name="terms" label="I accept the terms" checked={terms} onCheckedChange={setTerms} />
      <Checkbox disabled label="Single sign-on" description="Managed by your administrator." />
      <Button type="submit" disabled={!terms}>Create account</Button>
    </form>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move focus to or from the checkbox. |
| Space | Toggle it (Enter does not, as with a native checkbox). |

## Accessibility

- A real checkbox role; indeterminate sets aria-checked="mixed".
- The label and description share one <label>, so clicking either toggles it.
- The unchecked border keeps 3:1 contrast; forced colors fill the box with Highlight. The touch hit area is 44 x 44 px.

## When to use Checkbox

- Use Checkbox as a React checkbox component for independent yes or no options in a settings form, such as email me about product updates, where each choice can be on or off without affecting the others.
- Use the indeterminate prop for a select all row above a list, so the parent shows a mixed state when only some of the child checkboxes are checked.
- Use label and description for a terms and conditions line, with the explanation under the label sharing one label element so clicking either toggles the box.
- Skip it when the setting applies immediately with no submit step. Use Switch for that, and RadioGroup when exactly one option out of several must be picked.
- Pair it with Field or a form library for validation, Button for the submit action, and DataTable, which uses checkbox cells for row selection and bulk actions.


## Frequently asked questions

### How do I build an animated checkbox in React with SheenUI?

Use the Checkbox component. The accent fill fades in on its own layer and the check mark draws itself using SVG pathLength; both leave faster than they arrive. Under reduced motion the mark simply fades, with no drawing or scaling. You get that without writing any animation code.

### How do I show an error on a checkbox?

Pass the error prop. It marks the control invalid with aria-invalid and a danger border, shows the message under the control and links it through aria-describedby so it is announced. Any aria-describedby you pass yourself is kept alongside it.

### Which keys toggle the checkbox?

Tab focuses it and Space toggles it. It is a real checkbox role, so indeterminate is exposed as aria-checked mixed. Clicking the label or description also toggles it, because they share a label element. Without a visible label, give the checkbox an aria-label.

### What props does the checkbox accept?

Everything Base UI Checkbox.Root takes, including checked, defaultChecked, onCheckedChange, indeterminate, disabled, readOnly, required, name and value. On top of that it adds label, description and error. The checked state works controlled with useState or uncontrolled with defaultChecked.


## Related pages

- [Combobox (Select2)](https://lokendra-builds.github.io/sheenui/components/combobox)
- [Data table](https://lokendra-builds.github.io/sheenui/components/data-table)
- [Dialog](https://lokendra-builds.github.io/sheenui/components/dialog)
- [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [OTP input](https://lokendra-builds.github.io/sheenui/components/otp-input)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
