Canonical: https://lokendra-builds.github.io/sheenui/components/code-block

# React Code Block with Copy Button & Highlighting

URL: https://lokendra-builds.github.io/sheenui/components/code-block
Sidebar name: Code block

A glass React code block with built-in syntax highlighting (no dependency), line numbers, diff lines, file tabs and a copy button. Tailwind CSS v4, MIT.

What it is: A glass React code block with a small built-in syntax highlighter, line numbers, highlighted and diff lines, a file tab and a copy button.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/code-block.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Code block

Files to copy from `theme/src/`:

- `components/code-block/`
- `components/button/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, presets.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: code-block. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { CodeBlock, CodeBlockTabs } from "@/components/sheenui/code-block/code-block";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { CodeBlock, CodeBlockTabs } from "@sheenui/theme";
```

## CodeBlock

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onCopy | (ClipboardEventHandler<HTMLDivElement> & ((code: string) => void)) | optional, no default | Called after a successful copy, with the copied text. |
| showLineNumbers | boolean | true when there is more than one line | Show line numbers. |
| startLineNumber | number | 1 | Number of the first line (for excerpts of a longer file). |
| highlightLines | LineSpec | optional, no default | Lines to highlight: [3, 4] or "3-4, 9". Rendered as <mark>. |
| addedLines | LineSpec | optional, no default | Marks added lines in a diff (green, "+", <ins>). |
| removedLines | LineSpec | optional, no default | Marks removed lines in a diff (red, "−", <del>). |
| wrap | boolean | optional, no default | Controlled wrapping of long lines. |
| defaultWrap | boolean | false | Sets the starting wrap state when uncontrolled. |
| onWrapChange | ((wrap: boolean) => void) | optional, no default | Called with the new value when the wrap toggle is pressed. |
| showWrapToggle | boolean | true | Show the wrap toggle in the header. |
| copyable | boolean | true | Show the copy button. |
| maxHeight | string \| number | "32rem" | Taller code scrolls inside. A number is px; "none" never limits it. |
| level | 2 \| 1 \| 3 | 2 | Glass level of the block (1 lightest, 3 most opaque). |
| labels | Partial<CodeBlockLabels> | defaultCodeBlockLabels | Every other string, for translation: labels={{ copy: "…" }}; omitted keys keep the English of defaultCodeBlockLabels. All 10 keys of CodeBlockLabels are listed in the key table under the props table. |
| code | string | required | The source. Leading blank lines and trailing whitespace are trimmed. |
| language | (string & {}) \| CodeLanguage | "text" | ts, tsx, js, jsx, json, css, bash, python, html, text (or an alias like "typescript", "sh"). |
| filename | ReactNode | optional, no default | File name shown as a tab in the header (e.g. "app/page.tsx"). |
| icon | ReactNode | a file, or a terminal for shell | Icon before the file name (defaults to a file, or a terminal for shell). |
| header | boolean | true | Show the header bar (file name, language, wrap, copy). Without it, copy floats top-right. |

## CodeBlockTabs

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onCopy | (ClipboardEventHandler<HTMLDivElement> & ((code: string) => void)) | optional, no default | Called after a successful copy, with the copied text. |
| labels | Partial<CodeBlockLabels> | defaultCodeBlockLabels | Every other string, for translation: labels={{ copy: "…" }}; omitted keys keep the English of defaultCodeBlockLabels. All 10 keys of CodeBlockLabels are listed in the key table under the props table. |
| wrap | boolean | optional, no default | Controlled wrapping of long lines. |
| showLineNumbers | boolean | true when there is more than one line | Show line numbers. |
| startLineNumber | number | 1 | Number of the first line (for excerpts of a longer file). |
| defaultWrap | boolean | false | Sets the starting wrap state when uncontrolled. |
| onWrapChange | ((wrap: boolean) => void) | optional, no default | Called with the new value when the wrap toggle is pressed. |
| showWrapToggle | boolean | true | Show the wrap toggle in the header. |
| copyable | boolean | true | Show the copy button. |
| maxHeight | string \| number | "32rem" | Taller code scrolls inside. A number is px; "none" never limits it. |
| level | 2 \| 1 \| 3 | 2 | Glass level of the block (1 lightest, 3 most opaque). |
| files | CodeBlockFile[] | required | The tabs to show, in order. |
| value | string | optional, no default | Controlled active tab (a file label). |
| defaultValue | string | the first | Initially active tab when uncontrolled (defaults to the first). |
| onValueChange | ((label: string) => void) | optional, no default | Called with the label of the tab that was just selected. |

## Theming tokens

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| --sheen-code-keyword | color | tokens.css | Also: string, number, literal, function, type, tag, attr, property, variable, comment, punctuation. |
| Defaults |  | optional, no default | Each >= 4.5:1 on the block's glass and on highlighted, added and removed lines, in light and dark. Override on the block or any ancestor. |

## Example 1 of 4: A file with highlighted lines

highlightLines takes "10-11, 16" or an array. Highlighted lines are <mark>; numbers are left out of copy and of screen readers.

```tsx
import { CodeBlock } from "@/components/sheenui/code-block/code-block";
// Package build (after the first npm release, or a packed tarball): import { CodeBlock } from "@sheenui/theme";

// The file's text: fetched, or imported with Vite's ?raw suffix.
declare const source: string;

export function Example() {
  return (
    <CodeBlock
      filename="components/counter.tsx"
      language="tsx"
      highlightLines="10-11, 16"
      code={source}
    />
  );
}
```

## Example 2 of 4: Diff

addedLines and removedLines render as <ins> / <del> with + and − markers, so color is never the only signal.

```tsx
import { CodeBlock } from "@/components/sheenui/code-block/code-block";
// Package build (after the first npm release, or a packed tarball): import { CodeBlock } from "@sheenui/theme";

// The file's text: fetched, or imported with Vite's ?raw suffix.
declare const source: string;

export function Example() {
  return (
    <CodeBlock
      filename="motion/tokens.ts"
      language="ts"
      startLineNumber={28}
      removedLines={[31]}
      addedLines={[32]}
      code={source}
    />
  );
}
```

## Example 3 of 4: Tabs: commands and languages

CodeBlockTabs keeps several snippets in one block. The underline slides between tabs (transform only); copy and wrap act on the active one. When the tabs don't fit, the hidden edge fades and the list scrolls sideways.

```tsx
import { CodeBlockTabs } from "@/components/sheenui/code-block/code-block";
// Package build (after the first npm release, or a packed tarball): import { CodeBlockTabs } from "@sheenui/theme";

// File contents for the second group of tabs.
declare const css: string, json: string, bash: string, python: string, html: string;

export function Example() {
  return (
    <>
      <CodeBlockTabs
        labels={{ tabs: "Package manager" }}
        files={[
          { label: "pnpm", language: "bash", code: "pnpm add motion @base-ui/react" },
          { label: "npm", language: "bash", code: "npm install motion @base-ui/react" },
          { label: "yarn", language: "bash", code: "yarn add motion @base-ui/react" },
          { label: "bun", language: "bash", code: "bun add motion @base-ui/react" },
        ]}
      />

      <CodeBlockTabs
        files={[
          { label: "toast.css", language: "css", code: css, highlightLines: "7" },
          { label: "package.json", language: "json", code: json },
          { label: "dev.sh", language: "bash", code: bash },
          { label: "swatch.py", language: "python", code: python },
          { label: "index.html", language: "html", code: html },
        ]}
      />
    </>
  );
}
```

## Example 4 of 4: Long lines and no header

Unwrapped, a long line scrolls inside the block (it becomes keyboard-focusable only when it actually scrolls): the line numbers stay pinned and a fade at the end edge shows there is more. Toggle wrap in the header, or start wrapped with defaultWrap. Without a header, copy floats in the corner.

```tsx
import { CodeBlock } from "@/components/sheenui/code-block/code-block";
// Package build (after the first npm release, or a packed tarball): import { CodeBlock } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <CodeBlock
        language="tsx"
        filename="hero.tsx"
        code={`<Button className="…a very long class list…">Get started</Button>`}
      />
      <CodeBlock header={false} language="bash" code="npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/carousel.json" />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Reach the wrap toggle and the copy button. |
| Enter / Space | Press the focused button. |
| Arrow keys | Scroll the code once it is focused; it is focusable only when it actually scrolls. |
| Arrow Left / Arrow Right, Home / End | CodeBlockTabs: move between file tabs. |

## Accessibility

- The code area is a named region ("Code: button.tsx"). Line numbers and diff markers are not read or copied; diff lines also carry +/- text.
- Copy announces "Code copied" politely; if copying fails, the code is selected for manual copy.
- Code is always left to right and translate="no". Syntax colors keep 4.5:1 on glass in light and dark.

## All exports on this page

- CodeBlock — Syntax-highlighted code on glass, with no highlighting dependency (a small built-in tokenizer for ts, tsx, js, jsx, json, css, bash, python and html).
- CodeBlockTabs — Several files (or one command for several package managers) in one block.
- defaultCodeBlockLabels — The English strings of CodeBlock and CodeBlockTabs.
- parseLineSpec — Turn a LineSpec ("1, 4-6" or [1, 4, 5, 6]) into a set of 1-based line numbers.


## When to use the code block

- Use it as a syntax highlighter in documentation and blog posts to show a file with a filename tab, line numbers and highlightLines for the two or three lines the paragraph is explaining.
- Use addedLines and removedLines to show a migration or a diff, since the lines render as ins and del elements with plus and minus markers, so color is never the only signal.
- Use CodeBlockTabs for an install command in npm, pnpm and yarn, or the same snippet in several languages, with one copy and wrap control acting on the active tab.
- Skip it when users need to edit or run the code; it is a read-only display, so a real editor or sandbox fits, and Kbd is the right tool for a single key or short inline command.
- Pair it with Tabs-style CodeBlockTabs for variants, Toast for your own copy confirmation through onCopy, and GlassCard or Accordion to group long examples.


## Frequently asked questions

### How do I add a react code block with a copy button?

Render CodeBlock with the code string and a language. A copy button is shown by default, copyable controls it, and onCopy fires after a successful copy. A successful copy is announced politely, and if the clipboard and its fallback both fail, the code is selected so the user can copy it by hand.

### Which languages does the syntax highlighting support?

A small built-in tokenizer covers ts, tsx, js, jsx, json, css, bash, python, html and text, with aliases such as typescript, sh and py. There is no highlighting dependency to install. Colors are CSS variables like --sheen-code-keyword that you can override on the block or any ancestor.

### How are long lines and line numbers handled?

Unwrapped, a long line scrolls inside the block while the line numbers stay pinned, and the code area becomes keyboard-focusable only when it scrolls. The wrap toggle in the header, or defaultWrap, wraps lines. Line numbers are left out of copy and from screen readers.

### Does it work in right-to-left pages?

Code always reads left to right, and the block carries translate="no" so browsers do not translate it. The code area is a named region such as Code: button.tsx. Use the labels prop to translate the copy, wrap and region strings, and startLineNumber when showing an excerpt.


## Related pages

- [Empty state](https://lokendra-builds.github.io/sheenui/components/empty-state)
- [Meter](https://lokendra-builds.github.io/sheenui/components/meter)
- [Table](https://lokendra-builds.github.io/sheenui/components/table)
- [Skeleton](https://lokendra-builds.github.io/sheenui/components/skeleton)
- [Carousel](https://lokendra-builds.github.io/sheenui/components/carousel)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
