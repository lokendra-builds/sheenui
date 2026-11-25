Canonical: https://lokendra-builds.github.io/sheenui/layout/pagination

# React Pagination Component with Ellipses

URL: https://lokendra-builds.github.io/sheenui/layout/pagination
Sidebar name: Pagination

A glass React pagination component with ellipses, first and last buttons, crawlable page links and translatable labels. Accessible, Tailwind v4, MIT.

What it is: A React pagination component with page numbers, ellipses and first, previous, next and last buttons in a labeled navigation landmark.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/pagination.json
```

By Lokendra Singh Rathore. Published November 11, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Pagination

Files to copy from `theme/src/`:

- `components/pagination/`
- `hooks/{use-controllable.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: pagination. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Pagination } from "@/components/sheenui/pagination/pagination";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Pagination } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| page | number | optional, no default | Sets the current page, 1-based, when controlled. |
| defaultPage | number | 1 | Sets the starting page when uncontrolled. |
| onPageChange | ((page: number) => void) | optional, no default | Called with the new 1-based page. |
| pageCount | number | required | Total number of pages. 0 is treated as 1. |
| siblingCount | number | 1 | Pages shown on each side of the current one. |
| boundaryCount | number | 1 | Pages always shown at the start and the end. |
| showFirstLast | boolean | true | Shows the first-page and last-page buttons. |
| showPrevNext | boolean | true | Shows the previous and next buttons. |
| size | "sm" \| "md" | "md" | Button size: "sm" (32px) or "md" (40px, default). |
| disabled | boolean | false | Disables every button of the pagination. |
| getPageHref | ((page: number) => string) | optional, no default | Render page links instead of buttons (crawlable, open in new tab). With onPageChange as well, clicks are handled in-app (the browser's own navigation is prevented). |
| labels | Partial<PaginationLabels> | defaultPaginationLabels | Every other string, for translation: labels={{ nav: "…" }}; omitted keys keep the English of defaultPaginationLabels. All 8 keys of PaginationLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds a class name to the <nav> element. |
| id | string | optional, no default | Sets the id attribute of the <nav> element. |
| aria-label | string | optional, no default | Overrides labels.nav. Give each pagination on a page its own name. |

## Example: Controlled pagination

Page numbers with ellipses; first, previous, next and last buttons.

```tsx
import { useState } from "react";
import { Pagination } from "@/components/sheenui/pagination/pagination";
// Package build (after the first npm release, or a packed tarball): import { Pagination } from "@sheenui/theme";

export function Example() {
  const [page, setPage] = useState(6);
  return <Pagination page={page} onPageChange={setPage} pageCount={32} />;
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move between the first, previous, page, next and last controls. |
| Enter / Space | Go to the focused page (a button). With getPageHref the items are links: Enter follows the link. |
| Edge arrows | Previous on page 1 and Next on the last page stay focusable but do nothing (aria-disabled), so focus never drops to the page body. |

## Accessibility

- The control is a <nav> landmark named “Pagination”; give each pagination on a page its own aria-label.
- The current page has aria-current="page"; every page button is named “Page 3”, and ellipses read “More pages”.
- While disabled, nothing can be activated; on touch the targets are 44px; every string is in labels.

## When to use pagination

Use pagination under a long list or table when people need to know where they are and jump to a position: search results, an orders table, an admin list. The data table already uses it in its footer. Prefer infinite scroll or a load-more button only when position does not matter, and prefer a [combobox with search](https://lokendra-builds.github.io/sheenui/components/combobox) when the goal is finding one item.

Keep the page size predictable: a bar with seven slots (first and last page, the current one with a neighbor on each side, and two ellipses) fits a phone, and on small screens the control switches to the compact "Page 3 of 32" text. Disable it while a request is in flight so a second click cannot start a second request, and reset to page 1 whenever a filter changes.

Pair it with the [React data table](https://lokendra-builds.github.io/sheenui/components/data-table) for server-side paging, with [skeleton](https://lokendra-builds.github.io/sheenui/components/skeleton) rows while a page loads, and with [breadcrumbs](https://lokendra-builds.github.io/sheenui/layout/breadcrumb) for orientation.


## Frequently asked questions

### How do I make the page links crawlable?

Pass getPageHref. The control then renders anchors instead of buttons, so search engines and open-in-new-tab work; add onPageChange as well and clicks are handled in the app with the default navigation prevented.

### Does the control keep its width as the page changes?

Yes. getPageItems always returns the same number of slots for a given page count, using ellipses for the gap, so the bar does not jump while someone clicks through.

### How do I translate the labels?

Pass a partial labels prop. Every accessible name and screen-reader string, including Page 3 and the ellipsis text, is in PaginationLabels; spread defaultPaginationLabels and override single keys.

### Can I show two paginations on one page?

Yes, but give each its own aria-label so the navigation landmarks are distinguishable to screen reader users.


## All exports on this page

- Pagination — Pagination: page numbers with ellipses, first / previous / next / last, in a labelled <nav> landmark.
- defaultPaginationLabels — Default English strings of PaginationLabels; spread it and override single keys to reword.
- getPageItems — The page slots to show (1-based).


## Related pages

- [Data table](https://lokendra-builds.github.io/sheenui/components/data-table)
- [Skeleton](https://lokendra-builds.github.io/sheenui/components/skeleton)
- [Resizable panels](https://lokendra-builds.github.io/sheenui/layout/resizable)
- [Scroll area](https://lokendra-builds.github.io/sheenui/layout/scroll-area)
- [Separator](https://lokendra-builds.github.io/sheenui/layout/separator)
- [Stepper](https://lokendra-builds.github.io/sheenui/layout/stepper)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
