Canonical: https://lokendra-builds.github.io/sheenui/blocks/not-found-page

# React 404 Page: Glass Not Found Block with Search

URL: https://lokendra-builds.github.io/sheenui/blocks/not-found-page
Sidebar name: 404 page

A React 404 page block with a large code whose zeros are glass rings, a search slot, a way back and suggested links. Accessible, Tailwind v4, MIT.

What it is: NotFound is a React 404 page block: a large code whose zeros are glass rings, a plain explanation, a slot for your own search field, a main action and suggested links. It is also usable for 403 and 500 pages.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/not-found-page.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > 404 page

Files to copy from `theme/src/`:

- `blocks/not-found-page.tsx`
- `components/button/`
- `components/spinner/`
- `hooks/{use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, heading.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: not-found-page. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { NotFound } from "@/components/sheenui/blocks/not-found-page";
import { Input } from "@/components/sheenui/input/input";
```

These examples also use input: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/input.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Input, NotFound } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| code | string | "404" | The big code (string). Each 0 is drawn as a glass ring. It is decorative: labels.codeLabel is what is read aloud. |
| action | NotFoundAction | optional, no default | The main way out, usually back home (NotFoundAction). |
| search | ReactNode | optional, no default | A slot for your search field (ReactNode), shown under the text: a Input, a Combobox or a command palette trigger. The block does not search for you. |
| links | NotFoundLink[] | [] | Suggested destinations (NotFoundLink[]). |
| headingLevel | HeadingLevelOption | 2 | Level of the heading (1 to 6); "none" renders plain text. A 404 page's heading is its h1, so a real page passes headingLevel={1}. |
| labels | Partial<NotFoundLabels> | defaultNotFoundLabels | Every other string, for translation: labels={{ title: "…" }}; omitted keys keep the English of defaultNotFoundLabels. All 4 keys of NotFoundLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the section (string). |

## Example 1 of 2: With search and links

The search slot takes any node: an Input, a Combobox or a command palette trigger. The block does not search for you. Remember to answer with HTTP status 404 from your router.

```tsx
import { NotFound } from "@/components/sheenui/blocks/not-found-page";
import { Input } from "@/components/sheenui/input/input";
// Package build (after the first npm release, or a packed tarball): import { Input, NotFound } from "@sheenui/theme";

export function Example() {
  return (
    <NotFound
      headingLevel={1}
      action={{ label: "Back to home", href: "/" }}
      search={<Input type="search" aria-label="Search the site" placeholder="Search the docs" />}
      links={[
        { label: "Documentation", href: "/docs", description: "Guides and API reference" },
        { label: "Pricing", href: "/pricing", description: "Plans for every team" },
        { label: "Contact", href: "/contact", description: "Talk to a person" },
      ]}
    />
  );
}
```

## Example 2 of 2: A custom status code and your own wording

code takes any short string (each 0 becomes a ring), and labels replaces every sentence, so the same block serves a 403 or a 500.

```tsx
import { NotFound } from "@/components/sheenui/blocks/not-found-page";
// Package build (after the first npm release, or a packed tarball): import { NotFound } from "@sheenui/theme";

export function Example() {
  return (
    <NotFound
      code="403"
      action={{ label: "Sign in", onClick: () => console.log("sign in") }}
      labels={{
        codeLabel: "Error 403",
        title: "You need permission for this page",
        description: "Sign in with an account that has access, or ask the owner to invite you.",
      }}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The main action, your search field, then the suggested links in order. |
| Enter | Follow a link or press the action. |

## Accessibility

- A <section> named by its heading. A 404 page's heading is its h1: pass headingLevel={1}.
- The large code is aria-hidden; labels.codeLabel ('Error 404') is read instead.
- Suggested links are a labelled list of real anchors with 44 px targets. The zeros are glass surfaces (keep to two or three), and nothing loops.
- Digits settle on a spring and the rings drop in once. Reduced motion removes the movement.

## All exports on this page

- NotFound — A 404 page: a large code whose zeros are glass rings, a plain heading and explanation, a slot for your search field, a way back.
- defaultNotFoundLabels — The English NotFoundLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the 404 page

- Use NotFound as the not-found route of an app or a marketing site, with a main action back home, three or four suggested links and your search field in the search slot.
- Use the search slot for an Input, a Combobox or a command-palette trigger; the block does not search by itself, so it never promises a result it cannot give.
- Use code="403" or "500" with labels for the title and description to reuse the block for other error pages without a second component.
- Skip it as an inline empty state inside a list; EmptyState is the right component for 'no results', while NotFound is a whole page.
- Pair it with AnnouncementBanner and SiteFooter, and have your router answer with HTTP status 404, because the block only draws the page.


## Frequently asked questions

### How do I make a custom 404 page in React with NotFound?

Render NotFound as your catch-all route with an action like { label: 'Back to home', href: '/' }, a search node, and links as { label, href, description? }. Pass headingLevel={1} for a real page, and make your server or router respond with status 404.

### Can I change the text and the code?

Yes. code takes any short string and draws each 0 as a glass ring. labels replaces the title, description, spoken code label and links heading, so the same block serves 403 and 500 pages and any language.

### How is the large 404 made accessible?

The big code is decorative and aria-hidden; a visually hidden line from labels.codeLabel ('Error 404') is read instead, and the heading names the section. The suggested links are a labelled list of real anchors with 44 px targets.

### Does it loop or distract?

No. The digits settle on a spring and the rings drop in once; nothing loops. The rings are glass surfaces, so keep the code to two or three zeros. Reduced motion removes the movement and keeps the page static.


## Related pages

- [Empty state](https://lokendra-builds.github.io/sheenui/components/empty-state)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [Site footer](https://lokendra-builds.github.io/sheenui/blocks/site-footer)
- [Announcement banner](https://lokendra-builds.github.io/sheenui/blocks/announcement-banner)
- [Glass login](https://lokendra-builds.github.io/sheenui/blocks/glass-login)
- [Lamp login](https://lokendra-builds.github.io/sheenui/blocks/lamp-login)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
