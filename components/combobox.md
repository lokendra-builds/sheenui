Canonical: https://lokendra-builds.github.io/sheenui/components/combobox

# React Combobox: Searchable Multi-Select (Select2)

URL: https://lokendra-builds.github.io/sheenui/components/combobox
Sidebar name: Combobox (Select2)

A Select2-style React combobox: type to filter, multi-select animated chips, groups, created options and async search. Built on Base UI + Tailwind CSS v4.

What it is: A React combobox with search in the style of Select2: type to filter, pick one or many as animated chips, group or create options, or search a server as you type.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/combobox.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Combobox (Select2)

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/combobox/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-direction.ts, use-latest.ts, use-media-query.ts, use-preferences.ts, use-virtual-window.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, field-size.ts, glide-highlight.tsx, group-segments.ts, popup-a11y.ts, popup-motion.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: combobox. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Combobox, type ComboboxOption } from "@/components/sheenui/combobox/combobox";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Combobox, type ComboboxOption } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| options | ComboboxOption[] | [] | All options. With loadOptions, these are shown before the user types. |
| label | ReactNode | optional, no default | Visible label above the field. Without one, pass aria-label or aria-labelledby. |
| description | ReactNode | optional, no default | Helper text under the field; replaced by error when there is one. |
| error | ReactNode | optional, no default | Shows an error message under the field. Marks the field invalid and is announced. |
| placeholder | string | "Search…" | Sets the placeholder of the text input. |
| onCreate | ((label: string) => ComboboxOption \| Promise<ComboboxOption>) | optional, no default | Let users add an option that isn't in the list. Return the new option (or a promise of it). |
| loadOptions | ((query: string) => Promise<ComboboxOption[]>) | optional, no default | Fetch options from a server as the user types (debounced). Errors are caught and shown in the popup. |
| debounceMs | number | 250 | Sets the debounce for loadOptions, in ms. |
| onError | ((error: unknown) => void) | optional, no default | Called when loadOptions or onCreate throws, for logging. The UI already shows the error. |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called with the new state when the popup opens or closes. |
| clearOnEscape | boolean | on for single, off for multiple | Escape on a closed popup clears the selection (ARIA combobox pattern). In a multiple Combobox it is off unless you set it, so one key press can't wipe every chip. |
| onFocus | FocusEventHandler<HTMLInputElement> | optional, no default | Runs when the text input gains focus. |
| onBlur | FocusEventHandler<HTMLInputElement> | optional, no default | Blur handler of the text input. |
| id | string | generated | Id of the text input; a generated one is used when omitted. |
| name | string | optional, no default | Submits the selected value(s) with a form. |
| required | boolean | required | Mark the field as required. |
| disabled | boolean | optional, no default | Disable the whole field. |
| readOnly | boolean | optional, no default | Show the value but do not let it change. |
| autoFocus | boolean | optional, no default | Focus the input on mount. |
| aria-label | string | optional, no default | Accessible name when there is no visible label. |
| aria-labelledby | string | optional, no default | Id of an element that names the field. |
| aria-describedby | string | optional, no default | Id of extra descriptive text (the helper text is linked automatically). |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Force the invalid state (also set by error). |
| size | FieldSize | "md" | Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. |
| className | string | optional, no default | Class for the outer wrapper (label + field + helper text), same as Input and Select. |
| inputClassName | string | optional, no default | Class for the text <input> inside the field. |
| virtualized | boolean \| "auto" | "auto" | Windows the option list so only the options near the viewport are in the DOM: true always, false never, "auto" only above 200 options (VIRTUALIZE_THRESHOLD). Keyboard navigation, aria-activedescendant, filtering and aria-setsize / aria-posinset work across every option, and the scroll height does not change. Windowed rows are a fixed height (one line; a description is cut to fit); options are listed group by group and group headings are visual only. |
| emptyState | ReactNode | "No results found." | What shows when nothing matches (a string or any node). |
| labels | Partial<ComboboxLabels> | defaultComboboxLabels | Every other string, for translation: labels={{ clear: "Effacer" }}. A partial object is merged over defaultComboboxLabels. Every other string, for translation: labels={{ otherGroup: "…" }}; omitted keys keep the English of defaultComboboxLabels. All 15 keys of ComboboxLabels are listed in the key table under the props table. |
| multiple (= false) | false | false | Lets the person pick only one option. |
| multiple (= true) | true | required | Select2-style tags: pick many, shown as removable chips. |
| value (multiple = false) | string \| null | optional, no default | The selected option's value (controlled). null is no selection. |
| value (multiple = true) | string[] | optional, no default | Sets the selected values when controlled. |
| defaultValue (multiple = false) | string \| null | optional, no default | The selected option's value on mount (uncontrolled). |
| defaultValue (multiple = true) | string[] | optional, no default | The selected values on mount (uncontrolled). |
| onValueChange (multiple = false) | (value: string \| null) => void | optional, no default | Called with the new value, or null when cleared. |
| onValueChange (multiple = true) | (value: string[]) => void | optional, no default | Called with the new list of values. |
| maxSelected (multiple = true) | number | optional, no default | Stop adding chips after this many. |

## Example 1 of 5: Searchable, single

Type to filter. Arrow keys move, Enter picks, Escape closes.

```tsx
import { useState } from "react";
import { Combobox } from "@/components/sheenui/combobox/combobox";
// Package build (after the first npm release, or a packed tarball): import { Combobox } from "@sheenui/theme";

export function Example() {
  const [country, setCountry] = useState<string | null>("in");

  return (
    <Combobox
      label="Country"
      placeholder="Search countries…"
      options={[
        { value: "in", label: "India", icon: "🇮🇳", description: "+91" },
        { value: "us", label: "United States", icon: "🇺🇸", description: "+1" },
        { value: "gb", label: "United Kingdom", icon: "🇬🇧", description: "+44" },
        { value: "de", label: "Germany", icon: "🇩🇪", description: "+49" },
      ]}
      value={country}
      onValueChange={setCountry}
    />
  );
}
```

## Example 2 of 5: Multiple with chips, groups and a limit

Chips pop in and out. Backspace removes the last one; Left Arrow moves into the chips.

```tsx
import { useState } from "react";
import { Combobox } from "@/components/sheenui/combobox/combobox";
// Package build (after the first npm release, or a packed tarball): import { Combobox } from "@sheenui/theme";

export function Example() {
  const [picked, setPicked] = useState<string[]>(["py", "django", "react"]);

  return (
    <Combobox
      multiple
      maxSelected={5}
      label="Skills"
      options={[
        { value: "py", label: "Python", group: "Languages" },
        { value: "django", label: "Django", group: "Frameworks" },
        { value: "temporal", label: "Temporal", group: "Infrastructure" },
        { value: "react", label: "React", group: "Frameworks" },
        { value: "postgres", label: "PostgreSQL", group: "Infrastructure" },
      ]}
      value={picked}
      onValueChange={setPicked}
    />
  );
}
```

## Example 3 of 5: Creatable tags

Type something new and choose “Create …” to add it.

```tsx
import { Combobox, type ComboboxOption } from "@/components/sheenui/combobox/combobox";
// Package build (after the first npm release, or a packed tarball): import { Combobox, type ComboboxOption } from "@sheenui/theme";

const tags: ComboboxOption[] = [
  { value: "design", label: "design" },
  { value: "frontend", label: "frontend" },
  { value: "bug", label: "bug" },
  { value: "urgent", label: "urgent" },
];

export function Example() {
  return (
    <Combobox
      multiple
      label="Labels"
      options={tags}
      defaultValue={["design"]}
      onCreate={(label) => ({ value: label.toLowerCase(), label })}
    />
  );
}
```

## Example 4 of 5: Async search

Results come from a (pretend) server as you type, with a loading state. Try “ra” or “sh”.

```tsx
import { Combobox } from "@/components/sheenui/combobox/combobox";
// Package build (after the first npm release, or a packed tarball): import { Combobox } from "@sheenui/theme";

export function Example() {
  return (
    <Combobox
      multiple
      label="Invite people"
      placeholder="Search by name…"
      loadOptions={async (query) => {
        const res = await fetch(`/api/people?q=${encodeURIComponent(query)}`);
        return res.json(); // [{ value, label, description?, icon? }]
      }}
    />
  );
}
```

## Example 5 of 5: Thousands of options

Windowed above 200 options (virtualized defaults to auto): filtering runs over all 5,000, only the visible rows are in the DOM, the arrow keys and aria-activedescendant follow the active option, and group headings stay in order. Type 'Item 4999' or arrow down.

```tsx
import { Combobox } from "@/components/sheenui/combobox/combobox";
// Package build (after the first npm release, or a packed tarball): import { Combobox } from "@sheenui/theme";

const options = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i + 1),
  label: `Item ${String(i + 1).padStart(4, "0")}`,
  group: i < 2500 ? "First half" : "Second half",
}));

export function Example() {
  return <Combobox label="Item" options={options} virtualized />;
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Type | Filter the options. |
| Arrow Down / Arrow Up | Move through the options; Arrow Down opens the list. |
| Enter | Pick the highlighted option (or create one, with onCreate). |
| Escape | Close the list; on a closed list it clears a single selection. |
| Backspace | Multiple: remove the last chip when the input is empty. |
| Arrow Left / Arrow Right | Multiple: move between the chips from the start of the input. |

## Accessibility

- The ARIA combobox pattern: an input with aria-expanded and aria-controls plus a listbox of options.
- Result counts, loading, errors and the "create" option are announced politely; focus never leaves the input.
- error marks the field invalid and is linked to it; chips have remove buttons with names.
- Without a visible label, pass aria-label or aria-labelledby. Every string is translatable through the label props.

## All exports on this page

- Combobox — Searchable select (Select2-style): single or multiple selection with chips, groups, icons, a "create" option and async search.
- defaultComboboxLabels — The English ComboboxLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use Combobox

- Use Combobox as a Select2-style searchable select for a country or timezone picker, where the list has dozens of entries and people would rather type a few letters than scroll a long menu. Use it as an autocomplete for React and Tailwind projects when a plain select is too long to scan and people need to type to narrow the options.
- Use multiple with chips for choosing tags or assignees, with maxSelected to cap the count and Backspace to remove the last chip from the keyboard.
- Use loadOptions for a user search backed by an API; requests are debounced by debounceMs, and loading, empty and failed states with a Try again option are shown in the popup.
- Skip it when there are only a handful of fixed options. Use Select for a short list, RadioGroup for two or three visible choices, or Command for an app-wide action search.
- Pair it with Field or react-hook-form through name, ref and onBlur, Badge or Avatar as option icons, and Button for the submit step of the form around it.


## Looking for Select2 in React?

Select2 is a jQuery plugin for searchable selects, tags and remote data. SheenUI's Combobox gives the same features in React without jQuery: type to filter, multiple selection as removable chips, grouped options, created options through onCreate and async search through loadOptions, built on Base UI's Combobox so the ARIA pattern is correct.


## Frequently asked questions

### How do I build a React combobox with search and multi-select?

Pass options with value and label, then set multiple and manage value as a string array with onValueChange. Selected items appear as removable chips. Add maxSelected to stop adding after a limit. It is built on Base UI Combobox, so the ARIA combobox pattern comes with it.

### How does async search work?

Provide loadOptions, a function that takes the query and returns a promise of options. Calls are debounced, 250ms by default, tunable with debounceMs. The popup shows searching, a start typing hint, and an error with a retry option; onError receives the thrown error for logging.

### Can users create an option that is not in the list?

Yes. Pass onCreate, which receives the typed label and returns the new option or a promise of it. A Create option then appears in the list. If it throws, a message shows under the field and onError is called. All of these strings can be translated through labels.

### Which keyboard shortcuts does the combobox support?

Type to filter, Down or Up to move through options, Enter to pick and Escape to close. On a closed single-select list Escape clears the value, controlled by clearOnEscape. In multiple mode Backspace removes the last chip and Left or Right move across the chips.


## Related pages

- [Select](https://lokendra-builds.github.io/sheenui/components/select)
- [Tags input](https://lokendra-builds.github.io/sheenui/forms/tags-input)
- [Data table](https://lokendra-builds.github.io/sheenui/components/data-table)
- [Dialog](https://lokendra-builds.github.io/sheenui/components/dialog)
- [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
