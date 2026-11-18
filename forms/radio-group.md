Canonical: https://lokendra-builds.github.io/sheenui/forms/radio-group

# React Radio Group & Radio Cards with Motion

URL: https://lokendra-builds.github.io/sheenui/forms/radio-group
Sidebar name: Radio group

A glass React radio group with classic radio buttons or rich radio cards where the selection glides with Motion. Arrow keys from Base UI. Tailwind v4.

What it is: A React radio group in two styles: glass dots whose pip springs out, or rich option cards where the selection glides from card to card.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/radio-group.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Radio group

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/radio-group/`
- `hooks/{use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: radio-group. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { Button } from "@/components/sheenui/button/button";
import { RadioCard, RadioGroup } from "@/components/sheenui/radio-group/radio-group";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use badge, button, toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/badge.json https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Badge, Button, RadioCard, RadioGroup, useToast } from "@sheenui/theme";
```

## RadioGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Submits the value with a form. |
| required | boolean | optional, no default | Marks the group as required for form validation. |
| disabled | boolean | false | Disables every option of the group. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| items | RadioItem[] | optional, no default | The options. Leave out to compose <Radio> or <RadioCard> children instead. |
| children | ReactNode | optional, no default | Radio or RadioCard options, when you do not pass items. |
| variant | "card" \| "classic" | "classic" | "classic" dots or rich "card" options (used for items; also sets the layout for children). |
| value | string \| null | optional, no default | Sets the chosen value when controlled. null means nothing chosen. |
| defaultValue | string \| null | optional, no default | Sets the starting value when uncontrolled. |
| onValueChange | ((value: string) => void) | optional, no default | Called with the chosen option's value. |
| label | ReactNode | optional, no default | Visible group label (a legend). Use aria-label when there is none. |
| description | ReactNode | optional, no default | Shows helper text under the label. |
| error | ReactNode | optional, no default | Error message; marks every radio invalid and is announced politely when it appears. |
| orientation | "horizontal" \| "vertical" | "vertical" | Classic variant: stack the options or lay them out in a row (wraps on small screens). |
| columns | 2 \| 1 \| 3 \| 4 | 2 | Card variant: columns once the group is wide enough (always one column when narrow). |
| cardLayout | RadioCardLayout | optional, no default | Card variant: "row" (side by side), "stack" (pricing-card style), or "auto": stacked once a 3- or 4-column group shows several columns, rows otherwise (e.g. one column on phones). |
| form | string | optional, no default | Id of a form outside of which the group is rendered. |
| readOnly | boolean | optional, no default | Show the choice but do not allow changes. |
| aria-label | string | optional, no default | Accessible name of the group when there is no visible label. |
| aria-labelledby | string | optional, no default | Id of an element that names the group. |
| className | string | optional, no default | Class for the outer wrapper (label + options + messages). |
| listClassName | string | optional, no default | Class for the element that lays out the options (list or grid). |

## Radio / RadioCard

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | string | required | Sets the value this option stands for. |
| label | ReactNode | required | Sets the option's visible text and accessible name. |
| description | ReactNode | optional, no default | Second line under the label (linked to the radio as its description). |
| disabled | boolean | optional, no default | Makes this radio unselectable: it is dimmed and skipped by arrow-key navigation and the tab order. |
| className | string | optional, no default | Adds extra classes to the option row (a <label>). |
| icon | ReactNode | optional, no default | Icon or illustration at the start of the card. |
| meta | ReactNode | optional, no default | Trailing content such as a price or a badge. Read with the label ("Pro, $12/mo"). |
| children | ReactNode | optional, no default | Extra content under the description (feature list, preview). Read as part of the description. |
| layout | RadioCardLayout | "row" | "row": icon, label and meta side by side, description underneath. "stack": icon and dot on top, text below, meta pinned to the bottom (pricing-card style). "auto" (the group's default): stack once a 3- or 4-column group shows several columns, row otherwise. |

## Example 1 of 4: Classic

Each option can carry a description; the legend names the group for screen readers.

```tsx
import { RadioGroup } from "@/components/sheenui/radio-group/radio-group";
// Package build (after the first npm release, or a packed tarball): import { RadioGroup } from "@sheenui/theme";

export function Example() {
  return (
    <RadioGroup
      label="Email digest"
      description="How often we send a summary of activity."
      defaultValue="weekly"
      items={[
        { value: "daily", label: "Daily", description: "Every morning at 8:00." },
        { value: "weekly", label: "Weekly", description: "Mondays, with the week's highlights." },
        { value: "never", label: "Never", description: "You can still find everything in the app." },
        { value: "hourly", label: "Hourly", description: "Available on Pro.", disabled: true },
      ]}
    />
  );
}
```

## Example 2 of 4: Option cards

Cards take an icon, a description and meta such as a price. The selection tint slides to the chosen card (it jumps with reduced motion). Columns follow the group's own width: pricing-style cards side by side when there's room, compact rows on phones.

```tsx
import { useState } from "react";
import { RadioGroup } from "@/components/sheenui/radio-group/radio-group";
// Package build (after the first npm release, or a packed tarball): import { RadioGroup } from "@sheenui/theme";
import { Building2 as BuildingIcon, Rocket as RocketIcon, Sparkles as SparkleIcon } from "lucide-react";

export function Example() {
  const [plan, setPlan] = useState("pro");

  return (
    <RadioGroup
      variant="card"
      columns={3}
      label="Plan"
      value={plan}
      onValueChange={setPlan}
      items={[
        { value: "starter", label: "Starter", description: "For side projects…", icon: <SparkleIcon />, meta: "Free" },
        { value: "pro", label: "Pro", description: "For growing teams…", icon: <RocketIcon />, meta: "$12/mo" },
        { value: "enterprise", label: "Enterprise", description: "SSO, audit logs…", icon: <BuildingIcon />, meta: "Custom" },
      ]}
    />
  );
}
```

## Example 3 of 4: Composed cards

Compose RadioCard children for custom content, such as a badge or a delivery estimate.

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { RadioCard, RadioGroup } from "@/components/sheenui/radio-group/radio-group";
// Package build (after the first npm release, or a packed tarball): import { Badge, RadioCard, RadioGroup } from "@sheenui/theme";
import { Zap as BoltIcon, Store as StoreIcon, Truck as TruckIcon } from "lucide-react";

export function Example() {
  return (
    <RadioGroup variant="card" columns={1} label="Delivery" defaultValue="standard">
      <RadioCard value="standard" label="Standard" description="3–5 working days" icon={<TruckIcon />} meta="Free" />
      <RadioCard value="express" label="Express" description="Next working day" icon={<BoltIcon />} meta="$9">
        <Badge tone="accent">Order within 4 h 12 min</Badge>
      </RadioCard>
      <RadioCard value="pickup" label="Pick up in store" description="Out of stock nearby" icon={<StoreIcon />} disabled />
    </RadioGroup>
  );
}
```

## Example 4 of 4: Horizontal, with validation

A required choice in a row (it wraps on small screens). The error is linked to every radio and announced politely when it appears; focus moves to the group so the fix is one key press away.

```tsx
import { useState, type FormEvent } from "react";
import { Button } from "@/components/sheenui/button/button";
import { RadioGroup } from "@/components/sheenui/radio-group/radio-group";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Button, RadioGroup, useToast } from "@sheenui/theme";

export function Example() {
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const toast = useToast();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!size) {
      setError("Choose a size to continue.");
      // Take keyboard and screen-reader users straight to the choice.
      event.currentTarget.querySelector<HTMLElement>("[role=radio]")?.focus();
      return;
    }
    setError(undefined);
    toast.success("Added to bag", `Size ${size.toUpperCase()}`);
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col items-start gap-4">
      <RadioGroup
        label="Size"
        orientation="horizontal"
        name="size"
        required
        value={size}
        onValueChange={(v) => {
          setSize(v);
          setError(undefined);
        }}
        error={error}
        items={["xs", "s", "m", "l", "xl"].map((v) => ({ value: v, label: v.toUpperCase() }))}
      />
      <Button type="submit">Add to bag</Button>
    </form>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Enter or leave the group once, landing on the chosen option (or the first). |
| Arrow keys | Move the choice and select it. |
| Space | Select the focused option. |

## Accessibility

- role="radiogroup" named by label; each radio is linked to its label and description. error is announced politely and linked to the group.
- RadioCard shows the focus ring on the whole card although the dot holds focus.
- The unchecked ring keeps 3:1 contrast; the touch hit area is 44 px.

## When to use the radio group

- Use it as a radio card group for a pricing step where the user must pick exactly one plan, with variant="card" showing an icon, a description and a price in meta for each option.
- Use it for a checkout shipping choice such as Standard or Express, where each option needs a second line of text that a plain dropdown could not show next to the label.
- Use it for a short survey answer or a notification preference, with the classic variant giving a compact dot per option and a legend from the label prop.
- Skip it when the list is long or the choices are many; Select is better, Checkbox suits many-of-many answers, and SegmentedControl suits a few view modes rather than form answers.
- Pair it with Field-style helper text through description and error props, Badge in the meta slot for labels like Popular, and Button to submit the chosen value after name posts it.


## Frequently asked questions

### How do I make selectable cards in a React radio group?

Set variant="card" and pass items with value, label, description, icon and meta, or compose RadioCard children yourself. The columns prop (1 to 4) and cardLayout (row, stack or auto) shape the grid, and the selection tint glides between cards using transform only.

### Which keys move the selection in the radio group?

Tab enters the group once, on the chosen option or the first one. The arrow keys move the choice and select it, and Space selects the focused option. The group is role="radiogroup" named by the legend or aria-label, and each option is role="radio" with aria-checked.

### Does it work as a controlled component?

Yes. Use value with onValueChange, or defaultValue for uncontrolled use. The label is the legend, error marks every radio invalid, and name submits the value with a form. It is built on Base UI RadioGroup inside Field and Fieldset, so description and error link to each radio.

### Is there a limit on how many cards I can show?

Classic dots and cards are glass-1 surfaces, and the component docs advise that card groups should stay within a budget of 8 backdrop-filter surfaces in view. For longer lists, use Select instead. In forced colors a checked card gets a thick Highlight edge.


## Related pages

- [Rating](https://lokendra-builds.github.io/sheenui/forms/rating)
- [Segmented control](https://lokendra-builds.github.io/sheenui/forms/segmented-control)
- [Tags input](https://lokendra-builds.github.io/sheenui/forms/tags-input)
- [Textarea](https://lokendra-builds.github.io/sheenui/forms/textarea)
- [Toggle](https://lokendra-builds.github.io/sheenui/forms/toggle)
- [Calendar](https://lokendra-builds.github.io/sheenui/forms/calendar)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
