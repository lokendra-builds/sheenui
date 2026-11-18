Canonical: https://lokendra-builds.github.io/sheenui/components/data-table

# React Data Table on TanStack Table v9 + Tailwind

URL: https://lokendra-builds.github.io/sheenui/components/data-table
Sidebar name: Data table

A glass React data table on TanStack Table v9: search, filters, multi-sort, pagination, row selection, CSV export and server mode. Accessible, free, MIT.

What it is: A typed, accessible React data table on TanStack Table v9 with search, faceted filters, multi-sort, pagination, selection and CSV export, all in glass.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/data-table.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Data table

Files to copy from `theme/src/`:

- `components/data-table/`
- `components/pagination/`
- `components/alert/`
- `components/avatar/`
- `components/badge/`
- `components/button/`
- `components/checkbox/`
- `components/drawer/parts/sheet.tsx`
- `components/input/`
- `components/progress/`
- `components/select/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts, use-virtual-window.ts}`
- `motion/{gate.ts, reorder.tsx, tokens.ts}`
- `lib/{cn.ts, csv.ts, field-control-shell.tsx, field-size.ts, form.ts, glide-highlight.tsx, group-segments.ts, initials.ts, motion-props.ts, page-size.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react @tanstack/react-table clsx motion tailwind-merge
```

Registry item: data-table. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { CurrencyCell, formatCurrency, ProgressCell, RelativeDateCell, StatusCell, UserCell } from "@/components/sheenui/data-table/cells";
import { DataTable } from "@/components/sheenui/data-table/data-table";
import { type DataTableColumn, type DataTableColumnFilters, type DataTableFilterOption, type DataTableSorting } from "@/components/sheenui/data-table/types";
import { AnimatedList, AnimatedListItem } from "@/components/sheenui/motion/reorder";
import { Pagination } from "@/components/sheenui/pagination/pagination";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { AnimatedList, AnimatedListItem, CurrencyCell, DataTable, type DataTableColumn, type DataTableColumnFilters, type DataTableFilterOption, type DataTableSorting, formatCurrency, Pagination, ProgressCell, RelativeDateCell, StatusCell, UserCell } from "@sheenui/theme";
```

## DataTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | TData[] | required | The rows. With server-side mode, only the current page. |
| columns | DataTableColumn<TData>[] | required | Column definitions; see DataTableColumn. |
| getRowId | ((row: TData, index: number) => string) | row.id when present, otherwise the index | Returns a stable id for a row; it is the row's React key and keys the selection and expansion state. |
| getRowLabel | ((row: TData) => string) | the first column's value | Short name for a row, used in labels ("Select row Ravi Kumar"). |
| caption | string | required | Table caption: names the table for screen readers. |
| showCaption | boolean | false | Show the caption visually (it is visually hidden by default). |
| id | string | optional, no default | Sets the id of the table element. |
| aria-label | string | labels.scrollRegion(caption) | Accessible name of the scroll region (a landmark only while the table overflows). |
| className | string | optional, no default | Class for the outer wrapper (toolbar + table + footer). |
| tableClassName | string | optional, no default | Class for the glass panel around the table. |
| enableSearch | boolean | true | Shows a search box that filters every column. |
| searchDebounceMs | number | 200 | Delay in ms before typing in the search box filters the rows. |
| enableSelection | boolean | false | Checkbox column, select-all and the bulk-actions bar. |
| enableViewOptions | boolean | true | Adds column visibility and density options to a View menu. |
| enableExport | boolean | true | Shows a button that exports the rows as CSV. |
| exportFilename | string | "data" | File name of the CSV download (".csv" is added). |
| onExport | ((rows: TData[], scope: "filtered" \| "selected") => void) | optional, no default | Replace the built-in CSV download. Receives the rows being exported, in table order. With manual pagination the table only holds the current page, so the toolbar Export is shown only when this is set: fetch the full export from your server here. |
| enableSorting | boolean | true | Lets people sort by clicking a column header; set false to turn sorting off for the whole table. |
| enableMultiSort | boolean | true | Shift-click headers to sort by more than one column. |
| stickyFirstColumn | boolean | true | Pin the first data column (and the checkbox / expand columns) while scrolling sideways. Under 640px the pinned columns are capped at about 45% of the screen. |
| animateRows | boolean | true | Slide rows to their new place when sorting, filtering or paging reorders them (Motion layout, transform only, spring.smooth; rows are measured once per change). Instant with reduced motion. |
| virtualize | boolean \| "auto" | "auto" | Render only the rows in view (plus a few more) with spacers for the rest, so a long page (100 rows) sorts and scrolls without a long task. "auto" windows a page of 50 rows or more when maxHeight is set and the layout is the table (not cards). Rows are measured as they render, expanded panels included. Rows outside the window are not in the DOM, so Tab skips them and a focused row that scrolls out loses focus: set false for tables people tab through row by row. |
| maxHeight | string | optional, no default | Max height of the scroll area; the header sticks to its top. |
| pageSizeOptions | number[] | [10, 20, 50, 100] | Page sizes offered in the footer. |
| defaultPageSize | number | 10 | Sets the starting page size when uncontrolled. |
| hidePagination | boolean | false | Hide the footer (pagination). |
| rowActions | DataTableRowAction<TData>[] \| ((row: TData) => DataTableRowAction<TData>[]) | optional, no default | Items of the ⋯ menu at the end of each row: a list, or a function that returns one for a row. |
| renderExpanded | ((row: TData) => ReactNode) | optional, no default | Detail panel shown under an expanded row. Enables the chevron column. |
| bulkActions | DataTableBulkAction<TData>[] | [] | Shows the buttons in the floating selection bar. |
| toolbarLeft | ReactNode | optional, no default | Extra controls at the start / end of the toolbar. |
| toolbarRight | ReactNode | optional, no default | Extra controls at the end of the toolbar. |
| mobileLayout | "scroll" \| "cards" | "scroll" | "cards": rows become glass cards under 640px. |
| loading | boolean | false | First load (skeleton) or, when rows are present, a refetch (rows stay, dimmed). |
| error | ReactNode | optional, no default | Shows an error message (or true for the default). |
| onRetry | (() => void) | optional, no default | Called by the error state's Retry button. Without it the button is hidden. |
| emptyState | ReactNode | optional, no default | Custom empty state (replaces the default). |
| density | DataTableDensity | optional, no default | Row height, controlled: "comfortable" or "compact". Pair with onDensityChange; the View menu changes it. |
| defaultDensity | DataTableDensity | "comfortable" | Sets the starting density when uncontrolled. |
| onDensityChange | ((density: DataTableDensity) => void) | optional, no default | Called with the new density from the View menu. |
| sorting | DataTableSorting | optional, no default | Current sort order, as an array of column id and direction; pass it with onSortingChange to control sorting. |
| defaultSorting | DataTableSorting | optional, no default | Sets the starting sorting when uncontrolled. |
| onSortingChange | ((sorting: DataTableSorting) => void) | optional, no default | Called with the next sorting. |
| pagination | DataTablePagination | optional, no default | Sets the page index and size when controlled. |
| onPaginationChange | ((pagination: DataTablePagination) => void) | optional, no default | Called with the next page index and size. |
| globalFilter | string | optional, no default | Current search text; pass it with onGlobalFilterChange to control the search box. |
| defaultGlobalFilter | string | optional, no default | Initial search text when uncontrolled (a pre-filled search box). |
| onGlobalFilterChange | ((value: string) => void) | optional, no default | Called with the applied (debounced) search text. |
| columnFilters | DataTableColumnFilters | optional, no default | Currently applied faceted filters; pass it with onColumnFiltersChange to control them. |
| defaultColumnFilters | DataTableColumnFilters | optional, no default | Sets the starting faceted filters when uncontrolled. |
| onColumnFiltersChange | ((filters: DataTableColumnFilters) => void) | optional, no default | Called with the next faceted filters. |
| rowSelection | DataTableRowSelection | optional, no default | Selected row ids (controlled). |
| defaultRowSelection | DataTableRowSelection | optional, no default | Sets the row ids selected at first when uncontrolled ({ [rowId]: true }). |
| onRowSelectionChange | ((selection: DataTableRowSelection) => void) | optional, no default | Called with the next selection. |
| columnVisibility | DataTableColumnVisibility | optional, no default | Which columns are shown, keyed by column id; pass it with onColumnVisibilityChange to control it. |
| onColumnVisibilityChange | ((visibility: DataTableColumnVisibility) => void) | optional, no default | Called with the next visibility map. |
| manual | boolean | false | Works as shorthand for manualPagination + manualSorting + manualFiltering. |
| manualPagination | boolean | optional, no default | data is already the current page; use rowCount for the total. |
| manualSorting | boolean | optional, no default | data is already sorted. |
| manualFiltering | boolean | optional, no default | data is already searched and filtered. |
| rowCount | number | optional, no default | Sets the total rows on the server (manual pagination). |
| labels | Partial<DataTableLabels> | defaultDataTableLabels | Every other string, for translation: labels={{ searchLabel: "…" }}; omitted keys keep the English of defaultDataTableLabels. All 60 keys of DataTableLabels are listed in the key table under the props table. |

## Column options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| id | string | optional, no default | Unique; also the accessor key unless accessorKey / accessorFn is set. |
| header | string | optional, no default | Header text; reused for the View menu, CSV, cards and announcements. |
| accessorKey / accessorFn | keyof TData / (row) => unknown | id | Sets where the value comes from. |
| cell | (ctx) => ReactNode | text | Custom cell. ctx has row, value, highlight(), query, density. |
| align / numeric | "left" \| "center" \| "right" / boolean | "left" | numeric right-aligns with tabular figures and sorts numerically. |
| width / minWidth | number \| string | optional, no default | Preferred and minimum width. For wrap columns, width is also the minimum. |
| enableSorting / enableHiding | boolean | true | Switches that turn sorting and hiding on or off for one column. |
| defaultHidden | boolean | false | Starts hidden (show it from the View menu). |
| searchable / searchValue | boolean / (row) => string | true | Whether, and on what text, the global search matches. Hidden columns are never searched. |
| filter / filterOptions | "faceted" / DataTableFilterOption[] | optional, no default | Multi-select filter with counts. Options are derived from the data when omitted. |
| sortFn | "alphanumeric" \| "text" \| "basic" \| "datetime" \| (a, b) => number | by column type | Picks how the column sorts: a built-in sort or your own comparison function. |
| exportValue / enableExport | (row) => value / boolean | value / true | Controls what the CSV export writes for this column: the cell value, and whether it is included. |
| wrap / hideInCards | boolean | false | Let text wrap / leave out of the card layout. |

## Cell helpers

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| UserCell | { name, email?, src?, highlight? } | optional, no default | Shows an avatar, name and email. |
| StatusCell | { value, tones?, label? } | optional, no default | Shows a badge with a tone per value. |
| ProgressCell | { value, label } | optional, no default | Shows a thin progress bar with a percentage. |
| CurrencyCell / formatCurrency | { value, currency?, locale? } | "USD" | Formats the value as currency with tabular figures. |
| RelativeDateCell / formatRelativeDate | { value, now?, locale? } | optional, no default | “3 days ago”, full date in the title and for screen readers. |
| highlightText / Highlight | (text, query) | optional, no default | Wrap search matches in <mark>. |
| toCsv / exportCsv | (headers, rows) / (filename, headers, rows) | optional, no default | RFC 4180 CSV with formula-injection guard and a UTF-8 BOM. |

## CurrencyCell props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | number | required | The amount, in major units (12.5 is 12.50). |
| currency | string | "USD" | Sets the ISO 4217 currency code, for example "USD". |
| locale | string | the runtime's locale | BCP 47 locale used to format the amount; defaults to the runtime's locale. |
| highlight | Highlighter | (t) => t | Highlights the part of the formatted amount that matches the table's search text. |

## Highlight props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| text | string \| number \| null \| undefined | required | The text to show. A number is shown as is; null or undefined renders nothing. |
| query | string | required | The search text to mark inside text, matched case-insensitively. An empty string marks nothing. |

## ProgressCell props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | number | required | 0–100. Values outside the range are clamped. |
| label | string | required | Accessible name of the bar, e.g. "Usage". |
| className | string | optional, no default | Adds extra classes to the cell. |

## RelativeDateCell props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | string \| number \| Date | required | The moment to describe: a Date, an ISO string or a timestamp in ms. |
| now | number \| Date | optional, no default | The reference time for "3 hours ago". Pass a fixed value on a prerendered page so the server and browser agree. |
| locale | string | the runtime's locale | BCP 47 locale for the relative phrase; defaults to the runtime's locale. |

## StatusCell props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | string | required | The status text from your data, e.g. "active". |
| tones | Record<string, StatusTone> | optional, no default | Tone per value, e.g. { active: "success", churned: "danger" }. Unknown values are neutral. |
| label | ReactNode | the value | Display text (defaults to the value). |
| className | string | optional, no default | Adds extra classes to the badge. |

## UserCell props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| name | string | required | The person's full name; also the avatar's initials. |
| email | string | optional, no default | Shows the secondary line under the name. |
| src | string | optional, no default | Avatar image URL; initials show without it. |
| status | "online" \| "away" \| "offline" | optional, no default | Shows the presence dot on the avatar. |
| highlight | Highlighter | (t) => t | The highlight function from the cell context, so search matches stay marked. |
| className | string | optional, no default | Adds extra classes to the cell. |

## Example 1 of 7: Full-featured (client-side)

312 generated users. Search highlights matches, filters show counts, shift-click headers to sort by several columns, shift-click checkboxes to select a range. Selection survives paging. Under 640px the rows become cards.

```tsx
import { CurrencyCell, ProgressCell, RelativeDateCell, StatusCell, UserCell } from "@/components/sheenui/data-table/cells";
import { DataTable } from "@/components/sheenui/data-table/data-table";
import { type DataTableColumn, type DataTableFilterOption } from "@/components/sheenui/data-table/types";
// Package build (after the first npm release, or a packed tarball): import { CurrencyCell, DataTable, type DataTableColumn, ProgressCell, RelativeDateCell, StatusCell, UserCell, type DataTableFilterOption } from "@sheenui/theme";
import { Pencil as EditIcon, Eye as EyeIcon, Trash2 as TrashIcon } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer" | "Billing";
  status: "active" | "trial" | "past_due" | "churned" | "invited";
  mrr: number;
  signedUp: string; // ISO date
  usage: number; // 0 to 100
  country: string;
};

// Your data: rows from an API or a store (a few inline here so the example runs as pasted).
const users: User[] = [
  { id: "u1", name: "Ravi Kumar", email: "ravi@example.com", role: "Owner", status: "active", mrr: 240, signedUp: "2025-01-14", usage: 82, country: "IN" },
  { id: "u2", name: "Asha Patel", email: "asha@example.com", role: "Admin", status: "trial", mrr: 0, signedUp: "2025-06-02", usage: 35, country: "GB" },
  { id: "u3", name: "Meera Shah", email: "meera@example.com", role: "Editor", status: "past_due", mrr: 90, signedUp: "2024-11-23", usage: 58, country: "US" },
  { id: "u4", name: "Kabir Rao", email: "kabir@example.com", role: "Viewer", status: "invited", mrr: 0, signedUp: "2025-08-30", usage: 4, country: "DE" },
];

const roleOptions: DataTableFilterOption[] = ["Owner", "Admin", "Editor", "Viewer", "Billing"].map((role) => ({ value: role, label: role }));
const statusOptions: DataTableFilterOption[] = ["active", "trial", "past_due", "churned", "invited"].map((status) => ({ value: status, label: status }));

export function Example() {
  const columns: DataTableColumn<User>[] = [
    {
      id: "name", header: "User", minWidth: 240,
      searchValue: (u) => `${u.name} ${u.email}`,
      cell: ({ row, highlight }) => <UserCell name={row.name} email={row.email} highlight={highlight} />,
    },
    { id: "role", header: "Role", filter: "faceted", filterOptions: roleOptions },
    {
      id: "status", header: "Status", filter: "faceted", filterOptions: statusOptions,
      cell: ({ row }) => <StatusCell value={row.status} tones={{ active: "success", churned: "danger" }} />,
    },
    { id: "mrr", header: "MRR", numeric: true, cell: ({ row }) => <CurrencyCell value={row.mrr} locale="en-US" /> },
    { id: "signedUp", header: "Signed up", sortFn: "datetime", cell: ({ row }) => <RelativeDateCell value={row.signedUp} now={Date.now()} locale="en-US" /> },
    { id: "usage", header: "Usage", numeric: true, cell: ({ row }) => <ProgressCell value={row.usage} label="Usage" /> },
    { id: "country", header: "Country", defaultHidden: true },
  ];

  return (
    <DataTable
      caption="Workspace members"
      data={users}
      columns={columns}
      enableSelection
      mobileLayout="cards"
      maxHeight="36rem"
      rowActions={[
        { label: "View", icon: <EyeIcon />, onSelect: (u) => console.log("view", u.id) },
        { label: "Edit", icon: <EditIcon />, onSelect: (u) => console.log("edit", u.id) },
        { label: "Delete", icon: <TrashIcon />, tone: "danger", separatorBefore: true, onSelect: (u) => console.log("delete", u.id) },
      ]}
      bulkActions={[
        { label: "Delete", tone: "danger", icon: <TrashIcon />, onSelect: (rows, clear) => {
            console.log("delete", rows.length, "users");
            clear();
          } },
      ]}
      renderExpanded={(u) => (
        <p className="p-4 text-sm">
          {u.name} · {u.country} · {u.email}
        </p>
      )}
    />
  );
}
```

## Example 2 of 7: Server-side

manual + rowCount: the table only renders. Sorting, search (debounced), filters and paging go to a fake API that answers after 600ms. While it loads, the previous rows stay in place under a veil, so nothing jumps.

```tsx
import { useState } from "react";
import { DataTable } from "@/components/sheenui/data-table/data-table";
import { type DataTableColumn, type DataTableColumnFilters, type DataTableSorting } from "@/components/sheenui/data-table/types";
// Package build (after the first npm release, or a packed tarball): import { DataTable, type DataTableColumn, type DataTableColumnFilters, type DataTableSorting } from "@sheenui/theme";

type Customer = { id: string; name: string; plan: string; mrr: number };

const columns: DataTableColumn<Customer>[] = [
  { id: "name", header: "Customer" },
  { id: "plan", header: "Plan" },
  { id: "mrr", header: "MRR", numeric: true },
];

// Sketch (the hook is yours to write, so this is not runnable as pasted): sends sorting, pagination, search and filters to the server (TanStack Query, SWR or your own).
declare function useUsers(query: {
  sorting: DataTableSorting;
  pagination: { pageIndex: number; pageSize: number };
  search: string;
  filters: DataTableColumnFilters;
}): { data: Customer[]; total: number; isFetching: boolean; error?: Error; refetch: () => void };

export function Example() {
  const [sorting, setSorting] = useState<DataTableSorting>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<DataTableColumnFilters>([]);
  const { data, total, isFetching, error, refetch } = useUsers({ sorting, pagination, search, filters });

  return (
    <DataTable
      caption="Customers (server)"
      manual
      rowCount={total}
      data={data}
      columns={columns}
      loading={isFetching}
      error={error?.message}
      onRetry={refetch}
      sorting={sorting} onSortingChange={setSorting}
      pagination={pagination} onPaginationChange={setPagination}
      globalFilter={search} onGlobalFilterChange={setSearch}
      columnFilters={filters} onColumnFiltersChange={setFilters}
    />
  );
}
```

## Example 3 of 7: Minimal

Just data, columns and a caption. Search, sorting, export and the View menu come with sensible defaults; turn any of them off with a prop.

```tsx
import { formatCurrency } from "@/components/sheenui/data-table/cells";
import { DataTable } from "@/components/sheenui/data-table/data-table";
import { type DataTableColumn } from "@/components/sheenui/data-table/types";
// Package build (after the first npm release, or a packed tarball): import { DataTable, type DataTableColumn, formatCurrency } from "@sheenui/theme";

type Invoice = { id: string; customer: string; due: string; amount: number };

const invoices: Invoice[] = [
  { id: "INV-1001", customer: "Acme Corp", due: "Nov 30", amount: 1280 },
  { id: "INV-1002", customer: "Globex", due: "Dec 04", amount: 640.5 },
  { id: "INV-1003", customer: "Initech", due: "Dec 12", amount: 2210 },
];

export function Example() {
  const columns: DataTableColumn<Invoice>[] = [
    { id: "id", header: "Invoice" },
    { id: "customer", header: "Customer" },
    { id: "due", header: "Due" },
    { id: "amount", header: "Amount", numeric: true, cell: ({ row }) => formatCurrency(row.amount, "USD", "en-US", 2) },
  ];

  return (
    <DataTable caption="Recent invoices" data={invoices} columns={columns} hidePagination />
  );
}
```

## Example 4 of 7: Animated sort

Click a column header: rows slide to their new place (transform only, spring.smooth) instead of swapping. It is on by default (animateRows) and instant with reduced motion. For any other list, AnimatedList and AnimatedListItem do the same on insert, remove and reorder.

```tsx
import { useState } from "react";
import { DataTable } from "@/components/sheenui/data-table/data-table";
import { type DataTableColumn } from "@/components/sheenui/data-table/types";
import { AnimatedList, AnimatedListItem } from "@/components/sheenui/motion/reorder";
// Package build (after the first npm release, or a packed tarball): import { AnimatedList, AnimatedListItem, DataTable, type DataTableColumn } from "@sheenui/theme";

type Invoice = { id: string; customer: string; amount: number };

const invoices: Invoice[] = [
  { id: "INV-1001", customer: "Acme Corp", amount: 1280 },
  { id: "INV-1002", customer: "Globex", amount: 640 },
  { id: "INV-1003", customer: "Initech", amount: 2210 },
];

const columns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice" },
  { id: "customer", header: "Customer" },
  { id: "amount", header: "Amount", numeric: true },
];

export function Example() {
  const [names, setNames] = useState(invoices.map((invoice) => invoice.customer));
  return (
    <>
      <DataTable caption="Invoices" data={invoices} columns={columns} animateRows hidePagination />
      <button type="button" onClick={() => setNames((list) => [...list].reverse())}>
        Reverse
      </button>
      <AnimatedList>
        {names.map((name) => (
          <AnimatedListItem key={name}>{name}</AnimatedListItem>
        ))}
      </AnimatedList>
    </>
  );
}
```

## Example 5 of 7: Loading and error states

While the first request runs the table shows skeleton rows with a sweep of light and a progress bar under the header. When it fails, an inline alert with a Retry button replaces the body (rows that were already on screen stay under a veil, with the alert below them).

```tsx
import { DataTable } from "@/components/sheenui/data-table/data-table";
import { type DataTableColumn } from "@/components/sheenui/data-table/types";
// Package build (after the first npm release, or a packed tarball): import { DataTable, type DataTableColumn } from "@sheenui/theme";

type Invoice = { id: string; customer: string; due: string };

const columns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice" },
  { id: "customer", header: "Customer" },
  { id: "due", header: "Due" },
];

export function Example() {
  return (
    <div className="flex flex-col gap-6">
      <DataTable caption="Loading invoices" data={[]} columns={columns} loading hidePagination enableSearch={false} />
      <DataTable
        caption="Invoices that failed to load"
        data={[]}
        columns={columns}
        error="The billing service timed out. Check your connection and try again."
        onRetry={() => undefined}
        hidePagination
        enableSearch={false}
      />
    </div>
  );
}
```

## Example 6 of 7: Ten thousand rows

With maxHeight set, a page of 50 rows or more renders only the rows in view plus a few more (virtualize defaults to auto; pass virtualize to force it). Scroll to the end: the count below stays small, yet the scrollbar spans all 10,000. Rows outside the window are not in the DOM, so Tab skips them: set virtualize={false} for a table people tab through row by row.

```tsx
import { useEffect, useState } from "react";
import { formatCurrency } from "@/components/sheenui/data-table/cells";
import { DataTable } from "@/components/sheenui/data-table/data-table";
import { type DataTableColumn } from "@/components/sheenui/data-table/types";
// Package build (after the first npm release, or a packed tarball): import { DataTable, formatCurrency, type DataTableColumn } from "@sheenui/theme";

type Order = { id: string; customer: string; status: string; total: number };

const statuses = ["Paid", "Pending", "Shipped", "Refunded"];
const orders: Order[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(5, "0")}`,
  customer: `Customer ${String(((i * 37) % 900) + 100)}`,
  status: statuses[i % statuses.length] ?? "Paid",
  total: 20 + ((i * 7919) % 48000) / 100,
}));

const columns: DataTableColumn<Order>[] = [
  { id: "id", header: "Order", minWidth: 120 },
  { id: "customer", header: "Customer", minWidth: 150 },
  { id: "status", header: "Status", minWidth: 110 },
  {
    id: "total",
    header: "Total",
    numeric: true,
    minWidth: 110,
    cell: ({ row }) => formatCurrency(row.total, "USD", "en-US", 2),
  },
];

export function Example() {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [inDom, setInDom] = useState<number | null>(null);

  useEffect(() => {
    if (!wrapper) return;
    const count = () => setInDom(wrapper.querySelectorAll("tbody tr[data-row-id]").length);
    count();
    const observer = new MutationObserver(count);
    observer.observe(wrapper, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [wrapper]);

  return (
    <div ref={setWrapper} className="flex w-full flex-col gap-3">
      <p className="text-sm text-sheen-fg-muted">Rows in the DOM: {inDom} of 10,000</p>
      <DataTable
        caption="Orders"
        data={orders}
        columns={columns}
        maxHeight="22rem"
        virtualize
        hidePagination
        defaultPageSize={10_000}
      />
    </div>
  );
}
```

## Example 7 of 7: Pagination on its own

A nav landmark with aria-current on the current page. The number of slots stays the same as you page, so buttons never jump under the pointer; on phones it collapses to “Page x of y”.

```tsx
import { useState } from "react";
import { Pagination } from "@/components/sheenui/pagination/pagination";
// Package build (after the first npm release, or a packed tarball): import { Pagination } from "@sheenui/theme";

export function Example() {
  const [page, setPage] = useState(6);

  return (
    <>
      <Pagination page={page} pageCount={24} onPageChange={setPage} aria-label="Search results pages" />
      <Pagination page={page} pageCount={24} onPageChange={setPage} size="sm" showFirstLast={false} siblingCount={2} />
      <Pagination defaultPage={2} pageCount={5} getPageHref={(p) => `?page=${p}`} />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move through the toolbar, sortable headers, row checkboxes, row menus and the pager. A table that overflows becomes a focusable, scrollable region. |
| Enter / Space | On a sortable header: sort by that column. On a checkbox or button: press it. |
| Shift + Enter (or Shift-click) | On a sortable header: add the column to a multi-sort. |
| Shift-click | On a row checkbox: select the range from the last one. |
| Escape | In the search box: clear the search. |
| Arrow keys, Home / End, typeahead | In the row, view and filter menus: move between items. Enter runs one; Escape closes the menu. |

## Accessibility

- Semantic table: a caption, column headers with scope, aria-sort on the primary sorted column. Secondary sorts are read out on their header buttons.
- Sortable headers are buttons; Shift + Enter (or Shift-click) adds a column to the sort. A plain click on a column of a multi-sort makes it the only sort. Escape clears the search box.
- Checkboxes are named after their row (“Select row Ravi Kumar”); Shift-click selects a range.
- One polite live region announces result counts, sorting, page and page-size changes, and selection.
- Search ignores case and accents (“cafe” finds “Café”) and only looks at visible columns, so every match is marked.
- Focus never drops to the page: clearing the search, removing a filter chip, clearing the selection or deleting rows moves it to the next sensible control. Focused cells are kept clear of the sticky header, the pinned columns and the selection bar.
- The scroll area is focusable (and a named region) when it overflows, so it can be scrolled with arrow keys. Focus outlines are solid; touch targets are 44px; forced-colors mode is supported.

## Pagination props

The pager under the table is the [Pagination component](https://lokendra-builds.github.io/sheenui/layout/pagination). Its props (page, onPageChange, pageCount, siblingCount and the rest) are listed on its page.


## All exports on this page

- CurrencyCell — A money amount, right-aligned digits (tabular figures) formatted with Intl for the locale.
- DataTable — A full data table: global search with highlighted matches, multi-column sorting, faceted filters, row selection with bulk actions.
- Highlight — Highlight as a component: wraps every match of query in a <mark>, ignoring case and accents (the same matching as the table search).
- ProgressCell — A small progress bar with the percentage beside it, for usage or completion columns.
- RelativeDateCell — A date as relative text ("3 days ago", "in 2 hours") inside a <time>.
- StatusCell — A status as a dotted Badge.
- UserCell — A table cell for a person: avatar, name and an optional email.
- defaultDataTableLabels — Default English strings of DataTableLabels; spread it and override single keys to reword.
- foldText — Text as the search compares it: lower case, accents removed, ß → ss, … so "cafe" finds "Café".
- formatCurrency — value as money in currency (default "USD") for locale (default: the browser's), with maximumFractionDigits decimals (default 0).
- formatRelativeDate — "3 days ago", "in 2 hours".
- highlightText — Wrap every match of query in a <mark>.


## When to use the data table

- Use DataTable as a React table with filters and pagination for an admin list of users or orders where people need search with highlighted matches, multi-column sorting and a faceted Status filter with counts. If you are looking for a shadcn data table alternative, this one comes with sorting, paging, selection and a caption in a single component.
- Use enableSelection with bulkActions for a list where people pick rows across several pages and then export, archive or delete them from the floating selection bar.
- Use manual with rowCount and the controlled sorting, pagination and filter props when the dataset lives on a server and only the current page is in memory.
- Skip it when you only need a few static rows or a key value layout. A plain table, DescriptionList or a stack of GlassCard items is lighter and easier to scan.
- Pair it with the Pagination component it already uses in its footer, Badge, Avatar and Progress through the StatusCell, UserCell and ProgressCell helpers, and Toast to confirm a bulk action or a finished CSV export.


## SheenUI DataTable or the shadcn data table recipe?

The shadcn/ui data table is a recipe: you assemble columns, filters and pagination around TanStack Table yourself. SheenUI's DataTable is a finished component on TanStack Table v9: you pass data, columns and a caption and get search, faceted filters, multi-sort, pagination, row selection with bulk actions and a server mode through manual. Choose the recipe for full control of every cell; choose this one to skip the wiring.


## Frequently asked questions

### How do I build a React data table with sorting and search?

Pass data, columns and a caption, the three required props. Each column needs only an id and a header; the id is also the accessor key unless you set accessorKey or accessorFn. Search, sorting, faceted filters, paging and CSV export all run client-side by default. It uses TanStack Table v9 headless underneath, so you do not wire that library yourself.

### How does server-side mode work?

Set manual and pass rowCount, plus controlled state props for sorting, pagination, search and filters. The data prop then holds only the current page. The toolbar Export button appears only when you provide an export handler, because the table cannot export rows it does not have.

### Is the data table accessible?

It renders a real table with a caption, scoped headers and aria-sort on sorted columns. Sorting, paging, selection and result counts are announced through one polite live region, and checkboxes carry row-specific names. Sortable headers work with Enter or Space, and Shift-click or Shift+Enter adds a sort column.

### What happens on small screens?

By default the table scrolls sideways, with the first data column pinned unless you turn off stickyFirstColumn. Set mobileLayout to cards and rows become glass cards under 640px. A column can opt out of the card with hideInCards. The scroll region is keyboard reachable.


## Related pages

- [SaaS revenue](https://lokendra-builds.github.io/sheenui/dashboards/saas)
- [Dialog](https://lokendra-builds.github.io/sheenui/components/dialog)
- [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [OTP input](https://lokendra-builds.github.io/sheenui/components/otp-input)
- [Popover](https://lokendra-builds.github.io/sheenui/components/popover)

### Guides that cover it

- [Install SheenUI Glass Components in Next.js and Vite](https://lokendra-builds.github.io/sheenui/guides/install-frameworks)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
