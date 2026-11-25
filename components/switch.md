Canonical: https://lokendra-builds.github.io/sheenui/components/switch

# Animated React Toggle Switch with Motion

URL: https://lokendra-builds.github.io/sheenui/components/switch
Sidebar name: Switch

An iOS-style React toggle switch: the thumb springs across a glass track with Motion and fills with the accent. Base UI, Tailwind CSS v4, free, MIT.

What it is: An animated React toggle switch, an iOS switch in Tailwind, whose thumb springs across a glass track with Motion and fills with the accent color when on.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/switch.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Switch

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/switch/`
- `hooks/{use-direction.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, field-control-shell.tsx, form.ts, motion-props.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: switch. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Switch } from "@/components/sheenui/switch/switch";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Switch } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| className | string | optional, no default | Classes for the outer element: the <label> (or the wrapper holding an error); the control itself when there is neither. |
| controlClassName | string \| ((state: SwitchRootState) => string \| undefined) | optional, no default | Classes for the switch track itself. Base UI's state function form works here. |
| label | ReactNode | optional, no default | Text next to the switch. Clicking it toggles the switch. |
| description | ReactNode | optional, no default | Muted helper text under the label. Only shown together with label. |
| error | ReactNode | optional, no default | Error message under the control. Marks it invalid (aria-invalid, danger border) and is announced; linked with aria-describedby. |
| stateLight | boolean | false | A calm accent light round the track while it is on (data-state="on", an aura on its own layer). The checked fill already says "on": this is the glow only. Off with reduced transparency and forced colours. |
| checked / defaultChecked | boolean | false | Controlled or uncontrolled state. |
| onCheckedChange | (checked) => void | optional, no default | Called with the new checked state when the control is toggled. |
| disabled | boolean | false | Makes the control non-interactive. |

## Example 1 of 2: With label and description

```tsx
import { useState } from "react";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { Switch } from "@sheenui/theme";

export function Example() {
  const [on, setOn] = useState(true);

  return (
    <Switch
      checked={on}
      onCheckedChange={setOn}
      label="Email notifications"
      description="Get a summary every Monday."
    />
  );
}
```

## Example 2 of 2: A settings list

One piece of state for a group of switches, each with its own name.

```tsx
import { useState } from "react";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { Switch } from "@sheenui/theme";

const channels = [
  { key: "email", label: "Email", description: "Receipts and weekly summaries." },
  { key: "push", label: "Push notifications", description: "Mentions and replies." },
  { key: "sms", label: "Text messages", description: "Security alerts only." },
] as const;

export function Example() {
  const [enabled, setEnabled] = useState({ email: true, push: true, sms: false });

  return (
    <div className="flex flex-col gap-5">
      {channels.map(({ key, label, description }) => (
        <Switch
          key={key}
          label={label}
          description={description}
          checked={enabled[key]}
          onCheckedChange={(checked) => setEnabled((prev) => ({ ...prev, [key]: checked }))}
        />
      ))}
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move focus to or from the switch. |
| Space / Enter | Toggle it. |

## Accessibility

- role="switch" with aria-checked; the label and description share one <label>.
- On and off differ by thumb position as well as color; forced colors outline the track.
- The touch hit area is 44 px; under reduced motion the thumb jumps instead of sliding.

## When to use Switch

- Use Switch as an animated switch in React for settings that apply the moment they change, such as dark mode, push notifications or a public profile toggle in an account page. Use it as a Framer Motion switch: the thumb moves with Motion, the library formerly called Framer Motion, on the shared SheenUI spring.
- Use label and description together for a preferences row, so the text and the helper line sit in one label element and clicking the words flips the switch.
- Use the error prop when a toggle can fail to save, for example a server rejection, so the message shows under the control and is announced to screen readers.
- Skip it when the choice is only applied after a form is submitted. Use Checkbox for that, and use RadioGroup or SegmentedControl when the choice is between named options.
- Pair it with GlassCard for a settings panel, Toast to confirm that a change was saved, and Field or the settings-page block for grouped preference rows.


## Frequently asked questions

### How do I make a react toggle switch with SheenUI?

Render Switch with label and either checked plus onCheckedChange, or defaultChecked for uncontrolled use. It takes every Base UI Switch.Root prop, so name, value, disabled, readOnly and required work. className goes on the switch track, not on the wrapper around the label.

### Which keys toggle the switch?

Tab focuses it, and Space toggles it. Enter toggles it too, since it is a button, and Enter from the switch never submits a surrounding form. It exposes role switch with aria-checked, and the off-state track keeps a 3:1 border for WCAG 1.4.11.

### How does the thumb animate?

The accent fill fades in on its own layer and the thumb springs across, stretching toward its destination while pressed and carrying its velocity if toggled again mid-slide. With reduced motion the thumb snaps into place and only the fill fades.

### Does a switch need a label?

Yes, it needs an accessible name. Use the label prop, which wraps the control in a label element, or pass aria-label when the design shows no text. The description only renders together with a label. Touch screens get a 44px hit area around the track.


## Related pages

- [Toggle](https://lokendra-builds.github.io/sheenui/forms/toggle)
- [Checkbox](https://lokendra-builds.github.io/sheenui/components/checkbox)
- [Spinner](https://lokendra-builds.github.io/sheenui/components/spinner)
- [Tabs](https://lokendra-builds.github.io/sheenui/components/tabs)
- [Toast](https://lokendra-builds.github.io/sheenui/components/toast)
- [Tooltip](https://lokendra-builds.github.io/sheenui/components/tooltip)

### Guides that cover it

- [Accessible Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
