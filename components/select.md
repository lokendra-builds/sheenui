Canonical: https://lokendra-builds.github.io/sheenui/components/select

# React Select Dropdown with Glass Menu

URL: https://lokendra-builds.github.io/sheenui/components/select
Sidebar name: Select

A glassmorphism React select dropdown: the chevron flips, items drift in with Motion and typing jumps to an option. Built on Base UI and Tailwind CSS v4.

What it is: A glass React select dropdown for picking one option, with type-to-jump and items that drift in; for search or multi-select, use the Combobox.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/select.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Select

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/select/`
- `components/drawer/parts/sheet.tsx`
- `components/spinner/`
- `hooks/{use-controllable.ts, use-latest.ts, use-media-query.ts, use-preferences.ts, use-virtual-window.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, field-size.ts, form.ts, glide-highlight.tsx, group-segments.ts, page-size.ts, popup-a11y.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: select. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Select } from "@/components/sheenui/select/select";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Select } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | SelectItem[] | required | Takes the options, in display order. |
| value | string \| null | optional, no default | The selected value (controlled). null means nothing selected. |
| defaultValue | string \| null | optional, no default | Sets the starting value when uncontrolled. |
| onValueChange | ((value: string \| null) => void) | optional, no default | Called with the new value when the person picks an option. |
| open | boolean | optional, no default | Whether the list is open (controlled). Pair with onOpenChange. Leave it out to let the trigger decide. |
| defaultOpen | boolean | false | Whether the list starts open when uncontrolled. |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called when the list opens or closes. |
| label | ReactNode | optional, no default | Text above the trigger, linked to it as its accessible name. |
| description | ReactNode | optional, no default | Muted helper text under the trigger. |
| error | ReactNode | optional, no default | Error message under the trigger. Marks the select invalid and is announced. |
| placeholder | ReactNode | labels.placeholder ("Select…") | Shown in the trigger while nothing is selected, as a node. |
| labels | Partial<SelectLabels> | defaultSelectLabels | Every string, for translation: the placeholder and the heading of ungrouped items. Every other string, for translation: labels={{ placeholder: "…" }}; omitted keys keep the English of defaultSelectLabels. All 3 keys of SelectLabels are listed in the key table under the props table. |
| id | string | generated | Id of the trigger button; a generated one is used when omitted. |
| name | string | optional, no default | Submits the value with a form. |
| required | boolean | optional, no default | Marks the field as required for form validation. |
| disabled | boolean | optional, no default | Disables the select and its popup. |
| size | FieldSize | "md" | Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. |
| loading | boolean | false | The options are on their way: the trigger shows a spinner and is marked busy (aria-busy). Keep passing the items you have. |
| readOnly | boolean | optional, no default | Show the value but do not allow changes. |
| aria-label | string | optional, no default | Accessible name when there is no visible label. |
| aria-labelledby | string | optional, no default | Id of an element that names the select. |
| aria-describedby | string | optional, no default | Id of extra help text; joined with the description and error ids. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the select invalid without an error message. |
| onBlur | FocusEventHandler<HTMLButtonElement> | optional, no default | Called when the trigger loses focus (react-hook-form: marks the field touched). |
| className | string | optional, no default | Class for the outer wrapper (label + trigger + helper text), same as Input and Combobox. |
| triggerClassName | string | optional, no default | Class for the trigger button. |
| virtualized | boolean \| "auto" | "auto" | Windows the list so only the options near the viewport are in the DOM: true always, false never, "auto" only above 200 options (VIRTUALIZE_THRESHOLD). Arrow keys, Home / End, PageUp / PageDown and type-ahead still reach every option, aria-setsize / aria-posinset keep the count for screen readers, and the scroll height does not change. Windowed rows are a fixed height (one line; a description is cut to fit) and group headings are visual only. |
| mobile | MobilePresentation | "popup" | How the list opens on a phone-width screen (max-width: 640px): "popup" is the usual floating list; "sheet" is a bottom sheet with a drag handle, swipe-down to dismiss, a scrollable body capped at 85 dvh, home-indicator padding and a dimmed scrim. Focus is trapped and returned and Escape closes in both. |

## Example 1 of 4: Icons and descriptions

```tsx
import { useState } from "react";
import { Select } from "@/components/sheenui/select/select";
// Package build (after the first npm release, or a packed tarball): import { Select } from "@sheenui/theme";

const Dot = ({ color }: { color: string }) => <span aria-hidden className="size-2.5 rounded-full" style={{ background: color }} />;

export function Example() {
  const [value, setValue] = useState<string | null>("react");

  return (
    <Select
      label="Framework"
      items={[
        { value: "react", label: "React", description: "UI library by Meta", icon: <Dot color="#58c4dc" /> },
        { value: "vue", label: "Vue", description: "Progressive framework", icon: <Dot color="#42b883" /> },
        { value: "angular", label: "Angular", description: "Not available on your plan", disabled: true },
      ]}
      value={value}
      onValueChange={setValue}
    />
  );
}
```

## Example 2 of 4: Grouped

Where your data is stored.

```tsx
import { Select } from "@/components/sheenui/select/select";
// Package build (after the first npm release, or a packed tarball): import { Select } from "@sheenui/theme";

export function Example() {
  return (
    <Select
      label="Region"
      placeholder="Choose a region"
      items={[
        { value: "bom", label: "Mumbai", description: "ap-south-1", group: "Asia Pacific" },
        { value: "fra", label: "Frankfurt", description: "eu-central-1", group: "Europe" },
        { value: "iad", label: "Virginia", description: "us-east-1", group: "Americas" },
      ]}
    />
  );
}
```

## Example 3 of 4: Thousands of options

Above 200 options the list is windowed on its own (virtualized defaults to auto); pass virtualized to force it. Only the rows near the viewport are in the DOM, yet Home, End, PageUp, PageDown and type-ahead reach every option and screen readers still hear 'item 3,000 of 5,000'. Press End, or type 'Item 4321'.

```tsx
import { Select } from "@/components/sheenui/select/select";
// Package build (after the first npm release, or a packed tarball): import { Select } from "@sheenui/theme";

const items = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i + 1),
  label: `Item ${String(i + 1).padStart(4, "0")}`,
}));

export function Example() {
  return <Select label="Item" items={items} virtualized />;
}
```

## Example 4 of 4: Bottom sheet on phones

mobile='sheet' opens the list as a bottom sheet under 640px wide: a drag handle you can swipe down, a scrolling body capped at 85dvh, safe-area padding and a dimmed scrim. The default, 'popup', keeps the floating list. Press “Preview on a phone” to try it on a desktop screen (or narrow the window).

```tsx
import { Select } from "@/components/sheenui/select/select";
// Package build (after the first npm release, or a packed tarball): import { Select } from "@sheenui/theme";

export function Example() {
  return (
    <Select
      label="Region"
      mobile="sheet"
      items={[
        { value: "bom", label: "Mumbai", description: "ap-south-1" },
        { value: "fra", label: "Frankfurt", description: "eu-central-1" },
        { value: "iad", label: "Virginia", description: "us-east-1" },
      ]}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space / Arrow Down | Open the list from the trigger. |
| Arrow Down / Arrow Up | Move through the options. |
| Home / End | Jump to the first or last option. |
| Type a letter | Jump to the next option that starts with it. |
| Enter / Space | Pick the highlighted option. |
| Escape | Close the list and return focus to the trigger. |

## Accessibility

- A Base UI Select: the trigger is a combobox-style button with aria-expanded, the popup a listbox of options.
- label, description and error are linked to the trigger; the error is announced politely.
- name submits the value with a form. Pass aria-label when there is no visible label.

## All exports on this page

- Select — A glass select: opens below the trigger, supports groups, icons and descriptions, and you can type to jump to an option.
- VIRTUALIZE_THRESHOLD — Lists longer than this are windowed on their own (virtualized="auto"): Select, Combobox and CommandPalette.
- defaultSelectLabels — The English SelectLabels used when labels is omitted; a partial labels prop is merged over it.
- useVirtualWindow — A small windowing hook for long lists of equally tall rows.


## When to use Select

- Use Select as a glass select for a short, fixed list like a sort order, a time zone preset or a billing plan, where people pick one value and the options fit in one popup. Use it as a custom select in Tailwind projects when the native dropdown cannot be styled to match the rest of the page.
- Use group, icon and description on items for a language or workspace picker, where headings, flags or a second line help people choose the right entry.
- Use error, required and name for a field inside a form, with the value submitted natively and the message linked to the trigger for screen readers.
- Skip it when the list is long enough that people want to type to find an item, or when several values can be picked. Combobox handles both, and RadioGroup suits two or three visible choices.
- Pair it with Input and Combobox in the same form, which share the className wrapper convention, and Field or react-hook-form through ref, onBlur and name.


## Frequently asked questions

### How do I build a React select dropdown with SheenUI?

Render Select with an items array of value and label objects, then control it with value and onValueChange, or leave it uncontrolled with defaultValue. Add label, description and placeholder, which defaults to "Select…". It wraps Base UI Select, so the listbox behavior comes included.

### Which keys work on the select?

Enter, Space or the Down arrow opens the list. Up and Down move through options, Home and End jump to the ends, and typing jumps to a matching option. Enter or Space selects, and Escape closes and returns focus to the trigger. Disabled items are shown but cannot be selected.

### How do I style the trigger and wrapper separately?

className styles the outer wrapper that holds label, trigger and helper text, as in Input and Combobox. triggerClassName styles the button. For forms it forwards ref to the trigger, plus onBlur, name, required, disabled, aria-invalid and aria-describedby, so form libraries can focus it after a failed validation.

### When should I switch from Select to Combobox?

Switch when people would rather type than scroll, or when they need several values. Select supports typeahead jumping but has no search box, async loading or chips. Combobox adds filtering, loadOptions, onCreate and a multiple mode with removable chips, and takes options with the same value and label fields.


## Related pages

- [Combobox (Select2)](https://lokendra-builds.github.io/sheenui/components/combobox)
- [Radio group](https://lokendra-builds.github.io/sheenui/forms/radio-group)
- [Slider](https://lokendra-builds.github.io/sheenui/components/slider)
- [Switch](https://lokendra-builds.github.io/sheenui/components/switch)
- [Spinner](https://lokendra-builds.github.io/sheenui/components/spinner)
- [Tabs](https://lokendra-builds.github.io/sheenui/components/tabs)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
