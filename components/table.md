Canonical: https://lokendra-builds.github.io/sheenui/components/table

# React Table Component: Styled HTML Table

URL: https://lokendra-builds.github.io/sheenui/components/table
Sidebar name: Table

Styled React table primitives for small static tables: real table elements in a glass region that scrolls sideways. Tailwind CSS v4, copy-paste, MIT.

What it is: The React table component is a set of plain, styled table primitives for small static tables, in a glass region that scrolls sideways on narrow screens. Use Table for small static tables: a pricing comparison, a spec sheet, a list of keyboard shortcuts or API limits.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/table.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Table

Files to copy from `theme/src/`:

- `components/table/`
- `hooks/use-latest.ts`
- `lib/{cn.ts, form.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx tailwind-merge
```

Registry item: table. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/sheenui/table/table";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| Table regionLabel | string | the text of the TableCaption | Accessible name of the scrolling region while the table overflows; defaults to the caption's text. |
| Table className | string | optional, no default | Extra classes for the outer glass region that scrolls sideways (the root element). |
| Table tableClassName | string | optional, no default | Extra classes for the <table> itself. Other table attributes are forwarded. |
| TableCaption / TableHeader / TableBody / TableFooter / TableRow / TableHead / TableCell | element props | optional, no default | Each is the matching HTML element with glass styling; props and className pass through. |

## Example: Plan limits

Compose Table, TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableHead and TableCell like HTML.

```tsx
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/sheenui/table/table";
// Package build (after the first npm release, or a packed tarball): import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@sheenui/theme";
export function Example() {
  return (
    <Table regionLabel="Plan limits table" tableClassName="min-w-96">
      <TableCaption>Plan limits</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Plan</TableHead>
          <TableHead scope="col" className="text-end">Seats</TableHead>
          <TableHead scope="col" className="text-end">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow><TableHead scope="row">Free</TableHead><TableCell className="text-end">1</TableCell><TableCell className="text-end">$0</TableCell></TableRow>
        <TableRow><TableHead scope="row">Team</TableHead><TableCell className="text-end">10</TableCell><TableCell className="text-end">$29</TableCell></TableRow>
        <TableRow><TableHead scope="row">Business</TableHead><TableCell className="text-end">50</TableCell><TableCell className="text-end">$99</TableCell></TableRow>
      </TableBody>
      <TableFooter>
        <TableRow><TableCell colSpan={3} className="text-sheen-fg-muted">Prices per month, billed yearly.</TableCell></TableRow>
      </TableFooter>
    </Table>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focuses the scrolling region; the arrow keys then scroll it sideways without a mouse. |

## Accessibility

- Native table semantics: use TableCaption (or aria-label) to name the table, and scope="col" or scope="row" on TableHead.
- The glass wrapper is a focusable region named by regionLabel, so a table wider than the screen can be scrolled from the keyboard (WCAG 2.1.1).
- Row hover tint is decoration only; nothing depends on it. Text keeps 4.5:1 on the glass.

## When to use Table

- Use Table for a pricing comparison, a spec sheet or the rate limits of an API plan: a handful of rows read top to bottom, with no sorting or paging. It renders a real table element, so screen readers announce rows and columns, and on a narrow screen the glass region scrolls sideways.
- Give every table a TableCaption, visible or sr-only. It names the table, and the scrolling region takes the caption text as its own name unless you pass regionLabel.
- Use scope="col" or scope="row" on TableHead so a screen reader announces the right header for each cell.
- Skip it when people need to sort, filter, page or select rows. Use DataTable for that, and Pagination below a long list.
- Pair it with Badge in cells for status, Tooltip for column help, and ScrollArea only when you need a fixed height.


## Frequently asked questions

### How do I build an accessible React table with glass styling?

Compose Table, TableCaption, TableHeader, TableBody, TableRow, TableHead and TableCell like HTML. Table renders native table semantics inside one glass-2 region, so no ARIA roles are added by hand.

### What happens when the table is wider than its container?

The region becomes a keyboard tab stop and scrolls sideways, so the page never overflows. A table that fits adds no tab stop.

### Where do className and ref go?

To the outer scrolling region. Use tableClassName to style the table element itself; every other attribute lands on the table.

### Should I use Table or DataTable?

Use Table for static content you write by hand. Use DataTable when the data is dynamic and needs sorting, filtering, paging, selection or column visibility.

### How does a screen reader name the table and its scrolling region?

The table is named by its TableCaption, visible or with className="sr-only". While the table overflows, the scrolling region becomes a named region that takes the caption text as its name, or the regionLabel prop if you pass one. TableHead with scope="col" or scope="row" tells assistive tech which header belongs to each cell.

### Can I add a totals row?

Yes. TableFooter holds the summary rows and is written like TableBody. The full set is Table, TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableHead and TableCell.

### Does the table animate?

No. Rows tint on hover and nothing moves, so reduced motion has nothing to switch off.


## Related pages

- [Data table](https://lokendra-builds.github.io/sheenui/components/data-table)
- [Scroll area](https://lokendra-builds.github.io/sheenui/layout/scroll-area)
- [Skeleton](https://lokendra-builds.github.io/sheenui/components/skeleton)
- [Carousel](https://lokendra-builds.github.io/sheenui/components/carousel)
- [Code block](https://lokendra-builds.github.io/sheenui/components/code-block)
- [Empty state](https://lokendra-builds.github.io/sheenui/components/empty-state)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
