Canonical: https://lokendra-builds.github.io/sheenui/forms/segmented-control

# Segmented Control for React with Sliding Pill

URL: https://lokendra-builds.github.io/sheenui/forms/segmented-control
Sidebar name: Segmented control

An iOS-style segmented control for React: a glass pill slides to the chosen segment with Motion and arrow keys move between options. Tailwind v4, MIT.

What it is: An iOS-style segmented control for React where a glass pill slides to the chosen segment and the arrow keys move between segments.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/segmented.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Segmented control

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/segmented/`
- `hooks/{use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: segmented. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { SegmentedControl } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Submits the chosen value with a form (a hidden input). |
| disabled | boolean | false | Disables every segment of the control. |
| items | SegmentedControlItem[] | required | The segments to show, in order. |
| value | string | optional, no default | Sets the chosen value when controlled. |
| defaultValue | string | the first enabled item | Sets the starting value when uncontrolled. |
| onValueChange | ((value: string) => void) | optional, no default | Called with the new value when a different segment is chosen. |
| size | "sm" \| "md" \| "lg" | "md" | Height and text size: "sm" (28px), "md" (32px, default) or "lg" (40px). |
| fullWidth | boolean | false | Stretch to the container's width; segments share it equally. |
| iconOnly | boolean | false | Show only the icons. Each item's label (or aria-label) becomes its accessible name and tooltip. |
| adaptive | boolean | true | When the container is too narrow: tighten the padding, then (if every segment has an icon) show icons only, then truncate labels. Off: labels truncate straight away. |
| aria-label | string | optional, no default | Name of the control for screen readers, when no visible label points at it. |
| aria-labelledby | string | optional, no default | Id of an element that names the control. |
| className | string | optional, no default | Adds extra classes to the glass track. |

## Example 1 of 3: With icons

When its container gets narrow, the control tightens its padding, then shows icons only (each label stays the segment's accessible name and becomes its tooltip). Labels only truncate as a last resort. Resize the window to see it.

```tsx
import { useState } from "react";
import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
// Package build (after the first npm release, or a packed tarball): import { SegmentedControl } from "@sheenui/theme";
import { LayoutDashboard as BoardIcon, Calendar as CalendarIcon, List as ListIcon } from "lucide-react";

export function Example() {
  const [view, setView] = useState("board");

  return (
    <SegmentedControl
      aria-label="View"
      value={view}
      onValueChange={setView}
      items={[
        { value: "list", label: "List", icon: <ListIcon /> },
        { value: "board", label: "Board", icon: <BoardIcon /> },
        { value: "calendar", label: "Calendar", icon: <CalendarIcon /> },
      ]}
    />
  );
}
```

## Example 2 of 3: Sizes

sm, md and lg. On touch screens every size is at least 44px tall.

```tsx
import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
// Package build (after the first npm release, or a packed tarball): import { SegmentedControl } from "@sheenui/theme";

export function Example() {
  const ranges = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SegmentedControl key={size} size={size} aria-label={`Range (${size})`} defaultValue="week" items={ranges} />
      ))}
    </div>
  );
}
```

## Example 3 of 3: Full width and icon only

fullWidth shares the row equally, which suits phones and narrow cards. iconOnly hides the labels; each one becomes the segment's accessible name and tooltip.

```tsx
import { useState } from "react";
import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
// Package build (after the first npm release, or a packed tarball): import { SegmentedControl } from "@sheenui/theme";
import { Monitor as MonitorIcon, Moon as MoonIcon, Sun as SunIcon } from "lucide-react";

const ranges = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export function Example() {
  const [range, setRange] = useState("week");
  const [theme, setTheme] = useState("system");

  return (
    <div className="glass-2 flex w-full max-w-sm flex-col gap-4 rounded-sheen-lg p-4">
      <SegmentedControl fullWidth aria-label="Range" value={range} onValueChange={setRange} items={ranges} />
      <div className="flex items-center justify-between gap-3">
        <span id="theme-label" className="text-sm font-medium">Theme</span>
        <SegmentedControl
          iconOnly
          size="sm"
          aria-labelledby="theme-label"
          value={theme}
          onValueChange={setTheme}
          items={[
            { value: "light", label: "Light", icon: <SunIcon /> },
            { value: "dark", label: "Dark", icon: <MoonIcon /> },
            { value: "system", label: "System", icon: <MonitorIcon /> },
          ]}
        />
      </div>
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Enter or leave the control once, on the chosen segment. |
| Arrow Left / Arrow Right (or Up / Down) | Move between segments. |
| Home / End | Jump to the first or last segment. |
| Enter / Space | Pick the focused segment. |

## Accessibility

- A group of toggle buttons with aria-pressed: name the group with aria-label or aria-labelledby.
- iconOnly segments keep their label as the accessible name. Segments are 44 px tall on touch screens.
- In forced colors the chosen segment is outlined and underlined, since the pill's fill is dropped.

## When to use the segmented control

- Use it as a toggle button group for a chart toolbar that switches between Day, Week and Month, where the choice changes how the same data is shown and a sliding glass pill marks the current one. It gives you an iOS segmented control look in CSS without custom styling, with one glass pill that slides to the chosen segment.
- Use it for a List or Grid view toggle above a gallery, with icons on each item and iconOnly for narrow headers where labels become accessible names and tooltips.
- Use it inside a narrow sidebar or a mobile header, since the adaptive default tightens padding first, then switches to icons only if every segment has one, and only then truncates labels.
- Skip it when each choice swaps a whole panel of content; Tabs gives the right semantics there, and RadioGroup fits a form answer with longer labels and descriptions.
- Pair it with a visible label that points at it through aria-labelledby (or aria-label), Button or Badge elsewhere in the same toolbar, and the chart or DataTable you are filtering by the chosen value.


## Frequently asked questions

### How do I make a segmented control in React with Tailwind?

Pass items as objects with value, label, optional icon, disabled and aria-label, then use value with onValueChange or defaultValue. It is a Base UI ToggleGroup with one pressed item, styled with Tailwind v4 and the SheenUI glass track.

### Can the selection be empty?

No. It never ends up empty: pressing the chosen segment again keeps it chosen. That makes it suited to a required view mode. Use name to submit the value with a form, and size sm, md or lg and fullWidth to share the row equally.

### Which keys and ARIA does the segmented control use?

Tab enters once on the chosen segment. The arrow keys move between segments, Home and End jump to the ends, and Enter or Space picks. Segments are toggle buttons with aria-pressed, so name the group with aria-label or aria-labelledby. Segments are 44px tall on touch screens.

### Why does my segmented control overflow in a flex layout?

Like any shrinkable content, it needs a width-constrained parent. In a flex row or column that sizes to its content, give the parent min-w-0 and w-full so the adaptive steps can run. Without that, the container never gets narrower and nothing needs to adapt.


## Related pages

- [Tags input](https://lokendra-builds.github.io/sheenui/forms/tags-input)
- [Textarea](https://lokendra-builds.github.io/sheenui/forms/textarea)
- [Toggle](https://lokendra-builds.github.io/sheenui/forms/toggle)
- [Calendar](https://lokendra-builds.github.io/sheenui/forms/calendar)
- [Color picker](https://lokendra-builds.github.io/sheenui/forms/color-picker)
- [Date picker](https://lokendra-builds.github.io/sheenui/forms/date-picker)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
