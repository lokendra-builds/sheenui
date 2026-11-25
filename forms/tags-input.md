Canonical: https://lokendra-builds.github.io/sheenui/forms/tags-input

# React Tags Input: Chips with Paste & Keyboard

URL: https://lokendra-builds.github.io/sheenui/forms/tags-input
Sidebar name: Tags input

A glass React tags input: Enter or comma makes a chip, paste a list to add many, walk chips with arrow keys and remove with Backspace. Tailwind v4, MIT.

What it is: A glass React tags input that turns typed text into chips, adds a pasted list at once and lets you walk and remove chips from the keyboard.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/tags-input.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Tags input

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/tags-input/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, field-size.ts, form.ts, ime.ts, popup-a11y.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: tags-input. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { TagsInput } from "@/components/sheenui/tags-input/tags-input";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { TagsInput } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Submits one hidden input per tag with a form. |
| required | boolean | required | Marks the field as required. |
| disabled | boolean | false | Disables typing and removing tags. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| value | string[] | optional, no default | Sets the current list of tags when controlled. |
| defaultValue | string[] | [] | Sets the starting tags when uncontrolled. |
| onValueChange | ((tags: string[]) => void) | optional, no default | Called with the new list whenever a tag is added or removed. |
| label | ReactNode | optional, no default | Text above the field, linked to the input as its accessible name. |
| description | ReactNode | optional, no default | Muted helper text under the field. |
| error | ReactNode | optional, no default | Error message from outside (e.g. form validation). Overrides the built-in messages. |
| placeholder | string | "Add a tag…" | Hint shown while the field is empty. |
| placeholderMore | string | "Add more…" | Placeholder once at least one tag exists. |
| max | number | optional, no default | Maximum number of tags a person can add. |
| maxLength | number | optional, no default | Sets the maximum number of characters in one tag. |
| allowDuplicates | boolean | false | Allow the same tag twice. Duplicates compare case-insensitively unless caseSensitive. |
| caseSensitive | boolean | false | Makes "Tag" and "tag" count as different tags. |
| delimiters | string[] | [","] | Keys that add a tag, besides Enter. |
| pasteSplit | RegExp | commas, semicolons, tabs, new lines and your delimiters | Splits pasted text into tags. |
| transform | ((tag: string) => string) | defaultTransform | Clean a tag before it is added. |
| validate | ((tag: string, tags: string[]) => string \| null \| undefined \| void) | optional, no default | Your own rule: return an error message to reject the tag. |
| addOnBlur | boolean | false | Add what's typed when the field loses focus. |
| suggestions | TagSuggestion[] | [] | Lists suggestions under the field while typing. |
| restrictToSuggestions | boolean | false | With suggestions: only tags from the list can be added. |
| clearable | boolean | true | Show the × button that removes every tag. |
| readOnly | boolean | false | Show the tags but do not allow changes. |
| id | string | optional, no default | id of the text input (so a <label htmlFor> can point at it). |
| size | FieldSize | "md" | Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. |
| aria-label | string | optional, no default | Accessible name when there is no visible label. |
| labels | Partial<TagsInputLabels> | defaultTagsInputLabels | Every other string, for translation: labels={{ tagsLabel: "…" }}; omitted keys keep the English of defaultTagsInputLabels. All 14 keys of TagsInputLabels are listed in the key table under the props table. |
| className | string | optional, no default | Class for the outer wrapper (label + field + helper text). |
| inputClassName | string | optional, no default | Adds extra classes to the text input. |

## Example 1 of 3: Basic

Enter or comma adds; Backspace at the start selects the last tag, a second Backspace removes it. Try pasting “glass, motion; a11y”.

```tsx
import { TagsInput } from "@/components/sheenui/tags-input/tags-input";
// Package build (after the first npm release, or a packed tarball): import { TagsInput } from "@sheenui/theme";

export function Example() {
  return (
    <TagsInput
      label="Topics"
      defaultValue={["design", "motion"]}
      placeholder="Add a topic…"
      description="Press Enter or comma to add."
    />
  );
}
```

## Example 2 of 3: Suggestions and a limit

Suggestions open under the field while you type (or on click). Matching text is highlighted; the counter turns accent at the limit.

```tsx
import { useState } from "react";
import { TagsInput } from "@/components/sheenui/tags-input/tags-input";
// Package build (after the first npm release, or a packed tarball): import { TagsInput } from "@sheenui/theme";

export function Example() {
  const [skills, setSkills] = useState(["React", "TypeScript"]);

  return (
      <TagsInput
        label="Skills"
        value={skills}
        onValueChange={setSkills}
        suggestions={[{ value: "React", description: "UI library" }, "GraphQL", "Node.js", "PostgreSQL"]}
        max={6}
        placeholder="Search or add a skill…"
      />
  );
}
```

## Example 3 of 3: Validation

Your own rule plus built-ins: each address must be valid and unique, lower-cased on the way in. Paste a whole list: the bad ones are reported, the rest are added.

```tsx
import { TagsInput } from "@/components/sheenui/tags-input/tags-input";
// Package build (after the first npm release, or a packed tarball): import { TagsInput } from "@sheenui/theme";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Example() {
  return (
    <TagsInput
      label="Invite by email"
      placeholder="name@example.com"
      delimiters={[",", " ", ";"]}
      transform={(t) => t.trim().toLowerCase()}
      validate={(t) => (EMAIL.test(t) ? null : `“${t}” isn’t an email address.`)}
      max={10}
      name="invites"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / , | Add what you typed (or the highlighted suggestion). |
| Backspace | At the start of the field, select the last tag; press again to remove it. |
| Arrow Left / Arrow Right | From the start of the field, walk the tags (flipped in right-to-left pages). |
| Backspace / Delete on a tag | Remove it; focus moves to the neighboring tag. |
| Any letter on a tag | Jump back to the field and type. |
| Paste | "a, b; c" (or one per line) adds several tags. |

## Accessibility

- The field is a labeled input with a hidden keyboard hint; each tag has a name and a remove button ("Remove React").
- Added, removed and rejected tags (duplicate, too long, over max) are announced politely, and the error is linked to the field.
- During IME composition Enter confirms the text and never adds a tag.

## All exports on this page

- TagsInput — Tags input: type and press Enter (or a comma) to turn text into a chip.
- defaultTagsInputLabels — Default English strings of TagsInputLabels; spread it and override single keys to reword.


## When to use the tags input

- Use it as a tag input component for a blog editor's keywords field where people type a word and press Enter or a comma to turn it into a chip, with max capping how many are allowed. Use it as a multi-value input in Tailwind projects when people add several short values, such as topics, and each becomes a removable tag.
- Use it for an email recipients or invite field where pasting a list such as a, b; c or one per line adds several tags at once through pasteSplit.
- Use it for labels on a task or file, where the optional suggestions prop opens a glass list under the field so people reuse existing tags instead of inventing near duplicates.
- Skip it when users must pick only from a fixed, known list; Combobox with multiple selection validates against it, and plain Input fits one free value such as a title.
- Pair it with its own label and error props for the name and message, Badge for how the saved tags display elsewhere, and Button to submit the list that name posts as hidden inputs.


## Frequently asked questions

### How do I make a React tags input with Enter and comma?

Enter and the comma key turn typed text into a tag by default, or add the highlighted suggestion. The delimiters prop changes what splits text, transform cleans a tag before it is added, and addOnBlur adds whatever is typed when the field loses focus.

### Which keyboard shortcuts remove or move between tags?

Backspace at the start of the field selects the last tag, and pressing it again removes it. Left and Right from the start walk the tags, flipped in right-to-left. Backspace or Delete on a tag removes it, and typing any letter on a tag jumps back to the field.

### How are tags exposed to assistive technology?

The tags form a real list with role="list" and a named remove button on each chip. The field is described by a hint, the counter and any error, and additions, removals and errors are announced politely. Chips and buttons are 44px targets on touch screens.

### How do I submit the tags with a form or validate them?

The name prop renders one hidden input per tag. Use value with onValueChange for controlled use, or defaultValue. The error prop overrides the built-in messages with your own, and labels translates every string, including announcements. Reduced motion makes chips fade rather than move.


## Related pages

- [Textarea](https://lokendra-builds.github.io/sheenui/forms/textarea)
- [Toggle](https://lokendra-builds.github.io/sheenui/forms/toggle)
- [Calendar](https://lokendra-builds.github.io/sheenui/forms/calendar)
- [Color picker](https://lokendra-builds.github.io/sheenui/forms/color-picker)
- [Date picker](https://lokendra-builds.github.io/sheenui/forms/date-picker)
- [Field and Label](https://lokendra-builds.github.io/sheenui/forms/field)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
