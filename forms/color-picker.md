Canonical: https://lokendra-builds.github.io/sheenui/forms/color-picker

# React Color Picker: Hex, RGB, HSL & Eyedropper

URL: https://lokendra-builds.github.io/sheenui/forms/color-picker
Sidebar name: Color picker

A glass React color picker: saturation area, hue and opacity sliders, hex/RGB/HSL inputs, swatches and the eyedropper. Keyboard-accessible, Tailwind v4.

What it is: A glass React color picker with a saturation area, hue and opacity sliders, typed hex, RGB and HSL values, swatches and the screen eyedropper.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/color-picker.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Color picker

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/color-picker/`
- `components/date-picker/picker-surface.tsx`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, field-size.ts, form.ts, math.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: color-picker. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ColorField, ColorPicker } from "@/components/sheenui/color-picker/color-picker";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ColorField, ColorPicker } from "@sheenui/theme";
```

## ColorPicker props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Field name, used for native form submission and by form libraries. |
| disabled | boolean | false | Disables every control in the picker. |
| value | string | optional, no default | The colour (controlled): any hex, rgb() or hsl() string. |
| defaultValue | string | a violet | The colour on mount (uncontrolled). |
| onValueChange | ((value: string) => void) | optional, no default | Called while the colour changes (dragging, typing), with hex. |
| onValueCommit | ((value: string) => void) | optional, no default | Called once a change is done (pointer up, Enter, blur), with hex. |
| alpha | boolean | true | Show the opacity slider and channel. |
| format | ColorFormat | optional, no default | The channel format shown under the sliders (controlled): "hex", "rgb" or "hsl". |
| defaultFormat | ColorFormat | "hex" | The channel format on mount (uncontrolled). |
| onFormatChange | ((format: ColorFormat) => void) | optional, no default | Called with the new format when the format switch changes. |
| formats | ColorFormat[] | ["hex", "rgb", "hsl"] | Formats offered by the switch. |
| swatches | ColorSwatch[] | [] | Sets the preset colours, as strings or { value, label }. |
| eyeDropper | boolean | true | Offer the screen eyedropper (only shown where window.EyeDropper exists). |
| copyButton | boolean | true | Show the copy button. |
| variant | "card" \| "plain" | "card" | "card": its own glass card. "plain": no surface, for popovers and your own layouts. |
| aria-label | string | optional, no default | Accessible name of the whole picker group. |
| labels | Partial<ColorPickerLabels> | defaultColorPickerLabels | Every other string, for translation: labels={{ area: "…" }}; omitted keys keep the English of defaultColorPickerLabels. All 25 keys of ColorPickerLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## ColorField props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| defaultValue | string | "#7c5cff" | The colour on mount (uncontrolled). |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| format | ColorFormat | optional, no default | The channel format shown under the sliders (controlled): "hex", "rgb" or "hsl". |
| disabled | boolean | false | Disables every control in the picker. |
| value | string | optional, no default | The colour (controlled): any hex, rgb() or hsl() string. |
| onValueChange | ((value: string) => void) | optional, no default | Called while the colour changes (dragging, typing), with hex. |
| onValueCommit | ((value: string) => void) | optional, no default | Called once a change is done (pointer up, Enter, blur), with hex. |
| alpha | boolean | true | Show the opacity slider and channel. |
| defaultFormat | ColorFormat | "hex" | The channel format on mount (uncontrolled). |
| onFormatChange | ((format: ColorFormat) => void) | optional, no default | Called with the new format when the format switch changes. |
| formats | ColorFormat[] | ["hex", "rgb", "hsl"] | Formats offered by the switch. |
| swatches | ColorSwatch[] | optional, no default | Sets the preset colours, as strings or { value, label }. |
| eyeDropper | boolean | true | Offer the screen eyedropper (only shown where window.EyeDropper exists). |
| copyButton | boolean | true | Show the copy button. |
| labels | Partial<ColorPickerLabels> | defaultColorPickerLabels | Every other string, for translation: labels={{ area: "…" }}; omitted keys keep the English of defaultColorPickerLabels. All 25 keys of ColorPickerLabels are listed in the key table under the props table. |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Submits the hex value with a form. |
| required | boolean | required | Marks the field as required. |
| size | FieldSize | "md" | Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. |
| label | ReactNode | optional, no default | Visible label above the field. Without one, pass aria-label. |
| description | ReactNode | optional, no default | Helper text under the field; replaced by error when there is one. |
| error | ReactNode | optional, no default | Shows an error message under the field. |
| id | string | optional, no default | Sets the id of the text input. |
| aria-label | string | optional, no default | Accessible name of the text input when there is no label. |
| placeholder | string | "#000000" | Sets the placeholder of the text input. |
| className | string | optional, no default | Adds extra classes to the outer wrapper. |

## Example 1 of 3: Picker

Drag the area or use the arrow keys on it (Shift for bigger steps). The value is always emitted as hex.

```tsx
import { useState } from "react";
import { ColorPicker } from "@/components/sheenui/color-picker/color-picker";
// Package build (after the first npm release, or a packed tarball): import { ColorPicker } from "@sheenui/theme";

export function Example() {
  const [color, setColor] = useState("#6d4aff");

  return (
      <ColorPicker
        value={color}
        onValueChange={setColor}
        swatches={[{ value: "#6d4aff", label: "Violet" }, "#3b82f6", "#10b981", "#f59e0b"]}
        aria-label="Accent color"
      />
  );
}
```

## Example 2 of 3: Color field

A hex field with a swatch that opens the picker in a glass popover (a bottom sheet on phones). Type a hex straight into the field, or submit it with name.

```tsx
import { useState } from "react";
import { ColorField } from "@/components/sheenui/color-picker/color-picker";
// Package build (after the first npm release, or a packed tarball): import { ColorField } from "@sheenui/theme";

const SWATCHES = ["#6d4aff", "#3b82f6", "#06b6d4", "#10b981", "#84cc16", "#f59e0b", "#ef4444", "#ec4899"];

export function Example() {
  const [brand, setBrand] = useState("#6d4aff");

  return (
    <ColorField
      label="Brand color"
      value={brand}
      onValueChange={setBrand}
      swatches={SWATCHES.slice(0, 8)}
      alpha={false}
      name="brand"
      description="Used for buttons and links."
    />
  );
}
```

## Example 3 of 3: Hex only, no opacity

Trim it down: one format, no opacity, no swatches.

```tsx
import { ColorPicker } from "@/components/sheenui/color-picker/color-picker";
// Package build (after the first npm release, or a packed tarball): import { ColorPicker } from "@sheenui/theme";

export function Example() {
  return (
    <ColorPicker defaultValue="#22c55e" formats={["hex"]} alpha={false} />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Arrow Left / Arrow Right | Color area: change saturation. Hue and opacity sliders: change the value. |
| Arrow Up / Arrow Down | Color area: change brightness (Shift for steps of 10). |
| Page Up / Page Down | Change brightness (or slider value) by 10. |
| Home / End | Saturation 0 / 100 in the area; the ends of a slider. |
| Enter / Space / Arrow Down | ColorField: open the picker from the swatch button. Escape closes it. |

## Accessibility

- The color area is a 2-D slider; the area, hue and opacity sliders and each channel input have a name and a spoken value ("Saturation 64%, brightness 100%").
- In ColorField, type a hex value and press Enter or leave the field to apply it (Escape discards); description and error are linked with aria-describedby.
- Copying announces the copied value politely. The color graphics opt out of forced colors (they are content, like an image); the controls around them keep system colors.

## All exports on this page

- ColorField — A hex text field with a swatch button that opens the full ColorPicker (a glass popover from 640px up, a bottom sheet on phones).
- ColorPicker — A colour picker: a saturation / brightness area, hue and opacity sliders, typed values (hex, RGB or HSL), swatches, copy.
- defaultColorPickerLabels — The English strings of ColorPicker.


## When to use the color picker

- Use it as a hex, RGB and HSL color picker in a theme editor or brand settings screen where people tune an accent color with the saturation and brightness area, a hue slider and an opacity slider, then copy the result.
- Use it for design-tool style inputs such as a highlight color for a note, a chart series color or a label color, where presets via the swatches prop give one-click choices beside free selection.
- Use ColorField when the picker belongs in a form: it shows a swatch plus a hex text field and opens the picker as a popover from 640px up, or as a bottom drawer on phones.
- Skip it when users only choose from five or six fixed brand colors; a RadioGroup with swatch cards or a SegmentedControl is simpler and needs no continuous color space or typed values.
- Pair it with Popover for custom trigger layouts, the label, description and error props of ColorField for the name and message, and Slider or Switch next to it for related theme settings like contrast.


## Frequently asked questions

### What format does the React color picker return?

The value is always emitted as hex, like #7c5cff, or an eight-digit hex such as #7c5cff80 when the opacity is below 100%. Any hex, rgb() or hsl() string is accepted as input. The format prop only changes which channel inputs are shown under the sliders, from hex, rgb or hsl.

### How do I use the color picker with the keyboard?

The saturation and brightness area is a two-dimensional slider: Left and Right change saturation, Up and Down change brightness, and Shift makes steps of 10. Page Up and Down adjust brightness by 10, and Home and End set saturation to 0 or 100. Hue and opacity are sliders.

### Can users pick a color from anywhere on the screen?

Yes, where the browser supports it. The eyedropper button only appears when window.EyeDropper exists, so it is hidden in browsers without it. Turn it off with eyeDropper={false}. A copy button is also on by default, and copyButton={false} removes it.

### How do I disable transparency or reword the labels?

Set alpha={false} to hide the opacity slider and channel. Every UI string, including the accessible names of the area, sliders and inputs, can be replaced by passing a partial labels object. Use variant="plain" to drop the glass card surface when placing it inside your own popover.


## Related pages

- [Date picker](https://lokendra-builds.github.io/sheenui/forms/date-picker)
- [Field and Label](https://lokendra-builds.github.io/sheenui/forms/field)
- [File upload](https://lokendra-builds.github.io/sheenui/forms/file-upload)
- [Input group](https://lokendra-builds.github.io/sheenui/forms/input-group)
- [Number field](https://lokendra-builds.github.io/sheenui/forms/number-field)
- [Radio group](https://lokendra-builds.github.io/sheenui/forms/radio-group)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
