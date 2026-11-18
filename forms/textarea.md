Canonical: https://lokendra-builds.github.io/sheenui/forms/textarea

# Auto-Resize Textarea for React with Counter

URL: https://lokendra-builds.github.io/sheenui/forms/textarea
Sidebar name: Textarea

An auto-resize textarea for React that grows with its content, with an optional character-counter ring and label, hint and errors for screen readers.

What it is: A glass React textarea that auto-resizes to fit its content and can show a character counter whose ring fills as you type.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/textarea.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Textarea

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/textarea/`
- `hooks/{use-controllable.ts, use-latest.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: textarea. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Textarea } from "@/components/sheenui/textarea/textarea";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use button, toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Textarea, useToast } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| className | string | optional, no default | Class for the outer wrapper (label + field + messages). |
| maxLength | number | optional, no default | Character limit; shows the counter. |
| size | FieldSize | "md" | Padding that matches Input at the same size: "sm" (one line is 32px tall), "md" (40px) or "lg" (48px); sm and md are 44px on touch screens. |
| label | ReactNode | optional, no default | Text above the field, linked to the textarea as its accessible name. |
| description | ReactNode | optional, no default | Muted helper text under the field. |
| error | ReactNode | optional, no default | Error message; marks the field invalid and is announced politely to screen readers when it appears. |
| autoResize | boolean | true | Grow with the content between minRows and maxRows. |
| minRows | number | 3 | Height in lines when empty (and the fixed height when autoResize is off). |
| maxRows | number | 10 | Sets how tall it grows before scrolling, in lines. |
| limit | "block" \| "warn" | "block" | "block" (default) stops typing at maxLength; "warn" allows more but marks the field invalid. |
| showCount | boolean | on when maxLength is set | Show the counter. Without maxLength it counts up. |
| footer | ReactNode | optional, no default | Content for the bottom row inside the field, left of the counter (e.g. buttons). |
| labels | Partial<TextareaLabels> | defaultTextareaLabels | Screen-reader strings for the counter (i18n). Every other string, for translation: labels={{ count: "…" }}; omitted keys keep the English of defaultTextareaLabels. All 4 keys of TextareaLabels are listed in the key table under the props table. |
| textareaClassName | string | optional, no default | Adds extra classes to the native <textarea>. |

## Example 1 of 3: Auto-resize

Grows between minRows and maxRows, then scrolls. Measured off-screen, so the page never jumps while you type.

```tsx
import { Textarea } from "@/components/sheenui/textarea/textarea";
// Package build (after the first npm release, or a packed tarball): import { Textarea } from "@sheenui/theme";

export function Example() {
  return (
    <Textarea
      label="Notes"
      placeholder="Write as much as you like…"
      description="Grows from 2 up to 8 lines."
      minRows={2}
      maxRows={8}
    />
  );
}
```

## Example 2 of 3: Character limit

The counter turns amber near the limit and red at it; typing past the limit is blocked with a little shake. Screen readers hear the count with the field and a polite note at 20 and 10 characters left.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Textarea } from "@/components/sheenui/textarea/textarea";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Button, Textarea, useToast } from "@sheenui/theme";
import { Paperclip as PaperclipIcon, Smile as SmileIcon } from "lucide-react";

export function Example() {
  const [post, setPost] = useState("Shipping glass components that stay readable is mostly about contrast budgets.");
  const toast = useToast();

  return (
    <form
      className="flex w-full max-w-md flex-col items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Posted", `${post.length} characters`);
      }}
    >
      <Textarea
        label="Post"
        value={post}
        onChange={(e) => setPost(e.target.value)}
        maxLength={140}
        minRows={2}
        footer={
          <>
            <Button variant="ghost" size="icon" type="button" aria-label="Attach a file" className="size-8 any-pointer-coarse:size-11">
              <PaperclipIcon />
            </Button>
            <Button variant="ghost" size="icon" type="button" aria-label="Add an emoji" className="size-8 any-pointer-coarse:size-11">
              <SmileIcon />
            </Button>
          </>
        }
      />
      <Button type="submit" disabled={post.trim() === ""}>
        Post
      </Button>
    </form>
  );
}
```

## Example 3 of 3: Soft limit

limit="warn" lets people keep typing and trim later: the field turns invalid and the counter shows how far over it is. This bio is a few characters short of the limit; keep typing.

```tsx
import { useState } from "react";
import { Textarea } from "@/components/sheenui/textarea/textarea";
// Package build (after the first npm release, or a packed tarball): import { Textarea } from "@sheenui/theme";

export function Example() {
  const [bio, setBio] = useState("Designer and front-end developer in Lisbon. I care about motion that helps, contrast that holds up, and calm UI.");

  return (
    <Textarea
      label="Bio"
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      maxLength={120}
      limit="warn"
      error={bio.length > 120 ? "Keep your bio to 120 characters." : undefined}
      description="Shown on your public profile."
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move focus to or from the textarea. |
| Type, select, undo | Everything the native control does works. |

## Accessibility

- label, description, error and the character count are linked with aria-labelledby and aria-describedby; an error is announced politely.
- The character count sits in a polite live region. Text is 16 px on touch screens so iOS does not zoom.
- autoResize grows the field with its content and keeps the caret and scroll position.

## All exports on this page

- Textarea — A glass multi-line field.
- defaultTextareaLabels — Default English strings of TextareaLabels; spread it and override single keys to reword.


## When to use Textarea

- Use it as an auto-resize textarea for a comment box or a chat reply composer that should grow as people type, between minRows and maxRows, and then scroll instead of pushing the page down.
- Use it for a profile bio with a 280 character limit, where the counter ring turns amber near the limit and red at it, and screen readers hear the count with the field.
- Use it for a message form with actions beneath the text, since the footer prop places buttons in the bottom row left of the counter without extra layout code.
- Skip it when the answer is a single line; Input handles that, and a code or rich text editor needs a dedicated editor component rather than a styled native textarea.
- Pair it with Button in the footer slot for send or save, Rating above it for a feedback form, and the Field-style label, description and error props already built into it.


## Frequently asked questions

### How does the auto resize textarea in React avoid page jumps?

It measures height on an off-screen twin of the content, so the visible field never reflows while you type. It grows between minRows and maxRows and then scrolls. Set autoResize={false} for a fixed height with a native resize handle.

### What happens when someone reaches the character limit?

With limit="block", the default, typing stops at maxLength and the counter gives a small shake; reduced motion drops the shake. With limit="warn", people can keep typing and the field is marked invalid until they trim it. showCount overrides when the counter appears.

### Is the character counter announced to screen readers?

The count is linked to the field through aria-describedby, so it is read with the textarea. A polite announcement also fires at 20 and 10 characters left and at the limit, not on every keystroke. The labels prop translates those counter strings.

### Which props go to the native element?

Every prop other than the component's own, such as value, onChange, placeholder and name, goes to the native textarea. className styles the outer wrapper and textareaClassName styles the textarea itself. On touch screens the text is 16px so iOS does not zoom in.


## Related pages

- [Toggle](https://lokendra-builds.github.io/sheenui/forms/toggle)
- [Calendar](https://lokendra-builds.github.io/sheenui/forms/calendar)
- [Color picker](https://lokendra-builds.github.io/sheenui/forms/color-picker)
- [Date picker](https://lokendra-builds.github.io/sheenui/forms/date-picker)
- [Field and Label](https://lokendra-builds.github.io/sheenui/forms/field)
- [File upload](https://lokendra-builds.github.io/sheenui/forms/file-upload)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
