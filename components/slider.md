Canonical: https://lokendra-builds.github.io/sheenui/components/slider

# React Range Slider: Single & Dual Thumb

URL: https://lokendra-builds.github.io/sheenui/components/slider
Sidebar name: Slider

A glass React slider for one value or a range: drag, click the track or use the arrow keys. Built on Base UI Slider and Tailwind CSS v4. Free and MIT.

What it is: A glass React slider that picks a single value or a range by dragging, clicking the track or pressing the arrow keys. Use Slider as a React slider component for a volume or brightness control where people want to drag and hear or see the change as they go, and exact digits matter less than feel.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/slider.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Slider

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/slider/`
- `components/field/`
- `hooks/use-latest.ts`
- `lib/{cn.ts, form.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: slider. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Slider } from "@/components/sheenui/slider/slider";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Slider } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Field name, used for native form submission and by form libraries. |
| disabled | boolean | optional, no default | Disables the slider so it cannot be moved. |
| value | number \| number[] | optional, no default | Takes one number, or two for a range. |
| defaultValue | number \| number[] | optional, no default | Sets the starting value when uncontrolled. |
| onValueChange | ((value: number \| number[]) => void) | optional, no default | Called on every change while dragging or using the keyboard. |
| onValueCommitted | ((value: number \| number[]) => void) | optional, no default | Called once when a change ends: the pointer is released, or a key press is done. Use it to save, instead of saving on every step. |
| min | number | 0 | Lowest selectable value, the value at the left end of the track; keep it below max. |
| max | number | 100 | Highest selectable value, the value at the right end of the track; keep it above min. |
| step | number | 1 | Sets the size of one step. |
| largeStep | number | 10 (a change of 10 in the value, not ten steps) | Sets the step for PageUp / PageDown and Shift + arrows. |
| minStepsBetweenValues | number | 0 | For a range: the smallest allowed gap between two thumbs, in steps. |
| id | string | optional, no default | Id of the slider root (a label or a form library can point at it). |
| form | string | optional, no default | Id of a <form> element to submit with when the slider is outside it. |
| label | ReactNode | optional, no default | Text above the track, also the slider's accessible name. |
| showValue | boolean | true | Show the current value(s) next to the label. |
| showBubble | boolean | true | Show a bubble with the value above the thumb while dragging (useful on touch, where a finger covers the thumb). |
| aria-label | string | optional, no default | Label for screen readers when there is no visible label. |
| aria-labelledby | string | optional, no default | Id of an element that names the slider (instead of label). |
| labels | Partial<SliderLabels> | defaultSliderLabels | Every string, for translation: the names of the two range thumbs. Every other string, for translation: labels={{ minimum: "…" }}; omitted keys keep the English of defaultSliderLabels. All 2 keys of SliderLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: Single value and range

```tsx
import { useState } from "react";
import { Slider } from "@/components/sheenui/slider/slider";
// Package build (after the first npm release, or a packed tarball): import { Slider } from "@sheenui/theme";

export function Example() {
  const [volume, setVolume] = useState(40);

  return (
    <>
      <Slider label="Volume" value={volume} onValueChange={(v) => setVolume(Array.isArray(v) ? (v[0] ?? 0) : v)} />
      <Slider label="Price range" defaultValue={[200, 800]} min={0} max={1000} step={10} />
    </>
  );
}
```

## Example 2 of 2: Step, bounds and states

```tsx
import { Slider } from "@/components/sheenui/slider/slider";
// Package build (after the first npm release, or a packed tarball): import { Slider } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider label="Temperature" min={16} max={30} step={0.5} defaultValue={21.5} />
      <Slider aria-label="Brightness" defaultValue={70} showValue={false} />
      <Slider label="Locked" defaultValue={40} disabled />
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Focus each thumb in turn. |
| Arrow keys | Change the value by one step. |
| Page Up / Page Down | Change the value by 10 by default (set with largeStep). |
| Home / End | Jump to the minimum or maximum. |

## Accessibility

- Each thumb is role="slider" with aria-valuenow, aria-valuemin and aria-valuemax; a range slider has one thumb per value.
- The label names the group; the value text is announced as it changes.
- The track is 44 px tall on touch screens and its edge has a 3:1 border; a value bubble shows above the thumb while dragging.

## All exports on this page

- Slider — A slider for picking a number (volume, price) or a range between two numbers.
- defaultSliderLabels — The English SliderLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use Slider

- Use Slider for a price range filter, a zoom level or an audio volume, where a thumb on a track is quicker than typing; pair it with a visible value when the exact number matters. For a dual range slider in Tailwind, pass two values and the component draws two thumbs on one track.
- Use two values for a price range filter on a product list, with minStepsBetweenValues keeping the thumbs from crossing and the bubble showing the value above the thumb while dragging.
- Use onValueCommitted to save a setting once when the drag or key press ends, rather than firing a request on every step of onValueChange.
- Skip it when people must enter an exact figure, where NumberField fits, or when there are three or four named choices, where SegmentedControl or RadioGroup is clearer.
- Pair it with NumberField for a typed fallback, Field to describe the range, and Button to apply the filter after the range is chosen.


## Frequently asked questions

### How do I build a React range slider with two thumbs?

Pass an array of two numbers as value or defaultValue, and one thumb appears per entry. The thumbs are named Minimum and Maximum unless you set your own labels. Use minStepsBetweenValues to enforce a gap between them, and min, max and step to set the scale.

### Which keyboard keys move the slider?

Tab focuses each thumb. The arrow keys change the value by one step, PageUp and PageDown by 10 (the value, not ten steps) by default, which largeStep can change, and Home and End jump to the ends. Each thumb is a native input type range, so it reports value, min and max.

### How do I stop saving on every drag step?

Use onValueCommitted. onValueChange fires on every change while dragging or pressing keys, while onValueCommitted fires once when the pointer is released or a key press is done. Saving there avoids a flood of requests while the value moves under the thumb.

### Does the slider work on touch screens?

Yes. The track is 44px tall on touch, and showBubble, on by default, shows the value above the thumb during a drag so a finger does not hide it. Thumb scaling and the bubble spring are gated by motion preferences; reduced motion keeps only color and opacity changes.


## Related pages

- [Switch](https://lokendra-builds.github.io/sheenui/components/switch)
- [Spinner](https://lokendra-builds.github.io/sheenui/components/spinner)
- [Tabs](https://lokendra-builds.github.io/sheenui/components/tabs)
- [Toast](https://lokendra-builds.github.io/sheenui/components/toast)
- [Tooltip](https://lokendra-builds.github.io/sheenui/components/tooltip)
- [Alert](https://lokendra-builds.github.io/sheenui/components/alert)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
