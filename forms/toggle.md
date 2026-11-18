Canonical: https://lokendra-builds.github.io/sheenui/forms/toggle

# React Toggle Button & Toggle Group

URL: https://lokendra-builds.github.io/sheenui/forms/toggle
Sidebar name: Toggle

A React toggle button that stays pressed, with an accent tint that blooms from the center. Group toggles in a glass toolbar. Base UI, Tailwind v4, MIT.

What it is: A React toggle button that stays pressed and is announced as “pressed”, and can be grouped in a glass toolbar.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/toggle.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Toggle

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/toggle/`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: toggle. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Toggle, ToggleGroup, ToggleGroupSeparator } from "@/components/sheenui/toggle/toggle";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Toggle, ToggleGroup, ToggleGroupSeparator } from "@sheenui/theme";
```

## Toggle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| variant | "glass" \| "ghost" | "glass" | "glass" (default) on its own; "ghost" for toolbars. Inside a ToggleGroup it is always ghost. |
| size | "sm" \| "md" \| "lg" | "md" | "sm" (32px), "md" (40px, default) or "lg" (48px). Inherited from the ToggleGroup when inside one. |
| iconOnly | boolean | false | Square button for a lone icon (give it an aria-label). |
| className | string | optional, no default | Adds extra classes to the button. |
| children | ReactNode \| ((state: ToggleState) => ReactNode) | optional, no default | Content, or a function of the state to swap icons: {({ pressed }) => (pressed ? <StarFilled /> : <Star />)}. |
| pressed / defaultPressed | boolean | false | Controlled or uncontrolled pressed state. |
| onPressedChange | (pressed: boolean) => void | optional, no default | Called with the new pressed state when the toggle is pressed. |
| value | string | optional, no default | Names the toggle inside a ToggleGroup. |
| disabled | boolean | false | Makes the toggle non-interactive. |

## ToggleGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| size | "sm" \| "md" \| "lg" | "md" | Size of every toggle in the group. |
| className | string | optional, no default | Adds extra classes to the glass track. |
| value / defaultValue | string[] | optional, no default | Values of the pressed toggles. |
| onValueChange | (value: string[]) => void | optional, no default | Called when any toggle changes. |
| multiple | boolean | false | Allow several pressed toggles (otherwise one at a time; pressing it again clears it). |
| orientation | "horizontal" \| "vertical" | "horizontal" | Sets the layout and arrow-key direction. |
| loopFocus | boolean | true | Arrow keys wrap from the last toggle to the first. |
| disabled | boolean | false | The whole group is not interactive. |
| aria-label | string | optional, no default | Name of the group for screen readers. |

## Example 1 of 2: Standalone toggles

children can be a function of the pressed state, to swap an outline icon for a filled one. The label stays the same: screen readers say “pressed” or “not pressed”, so a label that also changed would contradict it.

```tsx
import { useState } from "react";
import { Toggle } from "@/components/sheenui/toggle/toggle";
// Package build (after the first npm release, or a packed tarball): import { Toggle } from "@sheenui/theme";
import { Bell as BellIcon, BellOff as BellOffIcon, Pin as PinIcon, Star as StarIcon } from "lucide-react";

export function Example() {
  const [muted, setMuted] = useState(false);

  return (
    <>
      <Toggle iconOnly aria-label="Favorite">
        {({ pressed }) => <StarIcon fill={pressed ? "currentColor" : "none"} />}
      </Toggle>

      <Toggle defaultPressed>
        {({ pressed }) => (
          <>
            <PinIcon fill={pressed ? "currentColor" : "none"} />
            Pin
          </>
        )}
      </Toggle>

      <Toggle iconOnly variant="ghost" pressed={muted} onPressedChange={setMuted} aria-label="Mute notifications">
        {muted ? <BellOffIcon /> : <BellIcon />}
      </Toggle>

      <Toggle disabled>Disabled</Toggle>
    </>
  );
}
```

## Example 2 of 2: Formatting toolbar

Two named groups: B / I / U / S are independent (multiple); alignment is one at a time. The arrow keys move inside a group and Tab moves to the next one. For a single tab stop across several groups, put them in a Toolbar.

```tsx
import { useState } from "react";
import { Toggle, ToggleGroup, ToggleGroupSeparator } from "@/components/sheenui/toggle/toggle";
// Package build (after the first npm release, or a packed tarball): import { Toggle, ToggleGroup, ToggleGroupSeparator } from "@sheenui/theme";
import { AlignCenter as AlignCenterIcon, AlignLeft as AlignLeftIcon, AlignRight as AlignRightIcon, Bold as BoldIcon, Italic as ItalicIcon, Strikethrough as StrikeIcon, Underline as UnderlineIcon } from "lucide-react";

export function Example() {
  const [format, setFormat] = useState(["bold"]);
  const [align, setAlign] = useState(["left"]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup multiple size="sm" aria-label="Style" value={format} onValueChange={setFormat}>
        <Toggle value="bold" iconOnly aria-label="Bold"><BoldIcon /></Toggle>
        <Toggle value="italic" iconOnly aria-label="Italic"><ItalicIcon /></Toggle>
        <Toggle value="underline" iconOnly aria-label="Underline"><UnderlineIcon /></Toggle>
        <ToggleGroupSeparator />
        <Toggle value="strike" iconOnly aria-label="Strikethrough"><StrikeIcon /></Toggle>
      </ToggleGroup>
      <ToggleGroup size="sm" aria-label="Alignment" value={align} onValueChange={setAlign}>
        <Toggle value="left" iconOnly aria-label="Align left"><AlignLeftIcon /></Toggle>
        <Toggle value="center" iconOnly aria-label="Align center"><AlignCenterIcon /></Toggle>
        <Toggle value="right" iconOnly aria-label="Align right"><AlignRightIcon /></Toggle>
      </ToggleGroup>
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Toggle: move focus to or from it. ToggleGroup: enter or leave the group once. |
| Enter / Space | Press or release the focused toggle. |
| Arrow keys | ToggleGroup: move between toggles. |

## Accessibility

- A native button with aria-pressed; give an icon-only toggle an aria-label.
- A group has role="group"; name it with aria-label. Pressed state is shown by fill and weight, not only by color.
- The touch hit area is 44 px; under reduced motion the state changes without a scale.

## When to use Toggle

- Use it as a toggle button for Bold or Italic in a text editor toolbar, with variant="ghost" so there is no surface until pressed and a ToggleGroup holding several together.
- Use it for a stand-alone Mute, Pin or Favorite button that keeps its pressed state, with iconOnly for a square button and children as a function to swap an outline icon for a filled one.
- Use a ToggleGroup with the multiple prop for independent options such as text formatting, or without it for a single choice like text alignment where pressing the active one clears it.
- Skip it when the control is a setting that applies at once, which is what Switch is for, or a form value that submits with the form, where Checkbox is the right element.
- Pair it with Toolbar for grouped editor actions, Tooltip to name icon-only buttons, and Kbd or KbdShortcut to show the key that triggers the same action elsewhere.


## Frequently asked questions

### How do I build a React toggle button with a pressed state?

Use Toggle uncontrolled with defaultPressed, or controlled with pressed and onPressedChange. It renders a native button with aria-pressed. Children can be a function receiving the pressed state, so you can return a filled icon when pressed and an outline icon otherwise.

### Does an icon-only Toggle need an accessible name?

Yes. iconOnly makes a square button for a lone icon, and it then needs an aria-label, such as Favorite, because there is no text to read. In forced colors a pressed toggle is filled with Highlight, so the state never depends on the tint alone.

### How does ToggleGroup handle keyboard focus and values?

Tab enters the group once, the arrow keys move between toggles, and Enter or Space presses. Give each Toggle a value; the group holds an array of strings through value and onValueChange, or defaultValue. It has role="group", so name it with aria-label.

### What is the difference between the glass and ghost variants?

The glass variant is one frosted glass-1 surface, meant for stand-alone toggles. Ghost has no surface until pressed, and suits toolbars and groups. Inside a ToggleGroup the toggles are ghost, so the group is a single backdrop surface. Reduced motion fades the tint without scaling.


## Related pages

- [Calendar](https://lokendra-builds.github.io/sheenui/forms/calendar)
- [Color picker](https://lokendra-builds.github.io/sheenui/forms/color-picker)
- [Date picker](https://lokendra-builds.github.io/sheenui/forms/date-picker)
- [Field and Label](https://lokendra-builds.github.io/sheenui/forms/field)
- [File upload](https://lokendra-builds.github.io/sheenui/forms/file-upload)
- [Input group](https://lokendra-builds.github.io/sheenui/forms/input-group)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
