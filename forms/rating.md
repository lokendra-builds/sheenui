Canonical: https://lokendra-builds.github.io/sheenui/forms/rating

# React Star Rating Component with Half Stars

URL: https://lokendra-builds.github.io/sheenui/forms/rating
Sidebar name: Rating

An animated React star rating with hover preview, half steps and any icon. It's a radio group underneath, so keyboards and screen readers work. MIT.

What it is: An animated React star rating with hover preview and half steps, built as a radio group so arrow keys and screen readers just work.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/rating.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Rating

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/rating/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: rating. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Rating } from "@/components/sheenui/rating/rating";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Rating } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Submits the value with a form. |
| required | boolean | optional, no default | Marks the field as required for form validation. |
| disabled | boolean | false | Disables the rating so it cannot be changed. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| value | number \| null | optional, no default | The rating (controlled): a number from 0 to max, or null for none. |
| defaultValue | number \| null | null | Sets the starting rating when uncontrolled. |
| onValueChange | ((value: number \| null) => void) | optional, no default | Called with the new value, or null when cleared. |
| max | number | 5 | Number of icons the rating shows. |
| allowHalf | boolean | false | Allows half-star steps (0.5, 1, 1.5 …). |
| clearable | boolean | true | Click the current value (or press Backspace / Delete) to clear it. |
| readOnly | boolean | false | Show the value as an image only: not focusable, no hover. |
| size | "sm" \| "md" \| "lg" | "md" | Icon size: "sm" (16px), "md" (24px, default) or "lg" (32px). |
| tone | "accent" \| "success" \| "warning" \| "danger" | "warning" | Colour of the filled icons: "warning" (gold, default), "accent", "danger" or "success". |
| icon | ReactNode | a star | Sets a custom filled icon (an SVG using currentColor). |
| emptyIcon | ReactNode | icon drawn as a faint outline | Sets a custom empty icon. |
| valueLabels | string[] | optional, no default | Words for each whole value, shown next to the icons, e.g. ["Poor", …, "Excellent"]. |
| showValue | boolean | false | Show the number (e.g. "4.5") next to the icons. |
| locale | string | optional, no default | Locale used to format the number. |
| label | ReactNode | optional, no default | Visible text above the icons; it names the group. |
| description | ReactNode | optional, no default | Muted helper text under the icons. |
| aria-label | string | optional, no default | Accessible name when there is no visible label. |
| aria-labelledby | string | optional, no default | Id of an element that names the rating. |
| labels | Partial<RatingLabels> | defaultRatingLabels | Every other string, for translation: labels={{ item: "…" }}; omitted keys keep the English of defaultRatingLabels. All 3 keys of RatingLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 4: Basic

Hover to preview, click to rate, click the same star again to clear (or press Backspace).

```tsx
import { Rating } from "@/components/sheenui/rating/rating";
// Package build (after the first npm release, or a packed tarball): import { Rating } from "@sheenui/theme";

export function Example() {
  return (
    <Rating label="Rate your stay" defaultValue={4} />
  );
}
```

## Example 2 of 4: Half stars with words

allowHalf gives every star a left and a right half (on touch screens, tap a star again for its half). valueLabels and showValue echo the hovered or chosen value.

```tsx
import { useState } from "react";
import { Rating } from "@/components/sheenui/rating/rating";
// Package build (after the first npm release, or a packed tarball): import { Rating } from "@sheenui/theme";

export function Example() {
  const [value, setValue] = useState<number | null>(3.5);

  return (
    <Rating
      label="Overall"
      allowHalf
      value={value}
      onValueChange={setValue}
      valueLabels={["Poor", "Fair", "Good", "Great", "Excellent"]}
      showValue
      size="lg"
    />
  );
}
```

## Example 3 of 4: Read-only and sizes

Read-only ratings are one image with a full label (“Rated 4.5 out of 5”), not a set of controls.

```tsx
import { Rating } from "@/components/sheenui/rating/rating";
// Package build (after the first npm release, or a packed tarball): import { Rating } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Rating readOnly value={4.5} size="sm" showValue />
      <Rating readOnly value={4.5} size="md" showValue />
      <Rating readOnly value={4.5} size="lg" showValue />
    </>
  );
}
```

## Example 4 of 4: Custom icon and tone

Any SVG that uses currentColor. Labels are yours to translate.

```tsx
import { Rating } from "@/components/sheenui/rating/rating";
// Package build (after the first npm release, or a packed tarball): import { Rating } from "@sheenui/theme";
import { Heart as HeartIcon } from "lucide-react";

export function Example() {
  return (
    <Rating
      aria-label="Favorite level"
      icon={<HeartIcon fill="currentColor" />}
      emptyIcon={<HeartIcon />}
      tone="danger"
      max={6}
      defaultValue={3}
      labels={{ item: (v) => `${v} ${v === 1 ? "heart" : "hearts"}` }}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Enter or leave the group once. |
| Arrow keys | Change the value (and select it). |
| Backspace / Delete | Clear the value. |

## Accessibility

- A radiogroup of stars named by aria-label; each item has a spoken name ("3 of 5 stars", customisable through labels).
- readOnly shows a score as an image (role="img") whose label states the value (translate it with labels.readOnly).
- Pointer, touch and keyboard all select; the group announces how to clear the value.

## All exports on this page

- Rating — Rating: stars (or any icon) you can pick with the pointer, touch or keyboard.
- defaultRatingLabels — Default English strings of RatingLabels; spread it and override single keys to reword.


## When to use Rating

- Use it as a star rating for a review form where a buyer picks one to five stars, with valueLabels showing words such as Poor to Excellent while hovering and once selected.
- Use it for a feedback prompt in the corner of a help article, with allowHalf off and clearable on so a person can take their answer back by clicking the same star.
- Use it with readOnly to display an average on a product card, where it renders a single image labeled like Rated 4.5 out of 5 and shows half stars.
- Skip it when you need a long scale or a bipolar choice such as a 0 to 10 satisfaction score; a Slider or a SegmentedControl reads better for that.
- Pair it with Textarea for the written review under the stars, Field for outer labeling and errors, and Badge or DescriptionList to show review counts next to a read-only score.


## Frequently asked questions

### How do I build a half star rating in React?

Set allowHalf. Each star then holds two radios, its left and right half, for assistive tech. On touch screens every icon stays one 44px target: tap for the whole icon, tap the same icon again for the half, and once more to clear when clearable is on.

### How is the star rating exposed to screen readers?

The interactive version is a Base UI radio group with one radio per step, so a reader hears something like 4 stars, radio, 4 of 5. A readOnly rating is a single image with a label like Rated 4.5 out of 5. The labels prop translates both.

### Which keys change the rating?

Tab enters the group once. The Left, Right, Up and Down arrows change the value and select it, and Backspace or Delete clears it. The group announces how to clear. With the pointer, hovering previews the value, and clicking the same value again clears it when clearable.

### Can I use hearts or another icon, and set the max?

Yes. Use icon and emptyIcon to swap the star, max to set how many icons appear, and tone and size to style it. Controlled use takes value and onValueChange, which receives null when cleared. With reduced motion the pop animation is dropped and the fill just changes.


## Related pages

- [Segmented control](https://lokendra-builds.github.io/sheenui/forms/segmented-control)
- [Tags input](https://lokendra-builds.github.io/sheenui/forms/tags-input)
- [Textarea](https://lokendra-builds.github.io/sheenui/forms/textarea)
- [Toggle](https://lokendra-builds.github.io/sheenui/forms/toggle)
- [Calendar](https://lokendra-builds.github.io/sheenui/forms/calendar)
- [Color picker](https://lokendra-builds.github.io/sheenui/forms/color-picker)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
