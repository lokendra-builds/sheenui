import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  CurrencyCell,
  Pagination,
  StatusCell,
  Switch,
  UserCell,
  formatCurrency,
  type DataTableColumn,
  type DataTableColumnFilters,
  type DataTablePagination,
  type DataTableSorting,
} from "@sheenui/theme";
import { DataTable } from "../../layout/lazy-data-table";
import { Example } from "../../layout/Example";
import { USERS, statusLabel, statusOptions, roleOptions, type User } from "./data-table";

/* ---------- (b) Server-side ---------- */

type Query = {
  sorting: DataTableSorting;
  pagination: DataTablePagination;
  search: string;
  filters: DataTableColumnFilters;
};

type ServerPage = { rows: User[]; total: number; facets: Partial<Record<string, Partial<Record<string, number>>>> };

/** What the pretend API answers: filters, sorts and pages the sample users. */
function queryUsers(q: Query): ServerPage {
  const s = q.search.trim().toLowerCase();
  const matchSearch = (u: User) =>
    !s || `${u.name} ${u.email} ${u.role} ${statusLabel[u.status]}`.toLowerCase().includes(s);
  const matchFilters = (u: User, except?: string) =>
    q.filters.every((f) => f.id === except || f.value.includes(String(u[f.id as keyof User])));
  const rows = USERS.filter((u) => matchSearch(u) && matchFilters(u));
  for (const { id, desc } of [...q.sorting].reverse()) {
    rows.sort((a, b) => {
      const x = a[id as keyof User];
      const y = b[id as keyof User];
      const order = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return desc ? -order : order;
    });
  }
  // Facet counts ignore the column's own filter, like the client-side table.
  const facets: ServerPage["facets"] = {};
  for (const key of ["status", "role"] as const) {
    const counts: Record<string, number> = {};
    for (const u of USERS) if (matchSearch(u) && matchFilters(u, key)) counts[u[key]] = (counts[u[key]] ?? 0) + 1;
    facets[key] = counts;
  }
  const start = q.pagination.pageIndex * q.pagination.pageSize;
  return { rows: rows.slice(start, start + q.pagination.pageSize), total: rows.length, facets };
}

/** Pretend API: answers after 600ms. */
function fetchUsers(q: Query, fail: boolean): Promise<ServerPage> {
  return new Promise((resolve, reject) =>
    window.setTimeout(() => {
      if (fail) {
        reject(new Error("502 Bad Gateway"));
        return;
      }
      resolve(queryUsers(q));
    }, 600),
  );
}

/** The first page, as the first request would answer it. The example starts with it in place (the table never grows when the first answer lands: no layout shift). */
const FIRST_QUERY: Query = {
  sorting: [{ id: "mrr", desc: true }],
  pagination: { pageIndex: 0, pageSize: 10 },
  search: "",
  filters: [],
};

const serverColumns: DataTableColumn<User>[] = [
  {
    id: "name",
    header: "Name",
    minWidth: 180,
    cell: ({ row, highlight }) => <UserCell name={row.name} email={row.email} highlight={highlight} />,
  },
  { id: "role", header: "Role", filter: "faceted" },
  {
    id: "status",
    header: "Status",
    filter: "faceted",
    cell: ({ row, highlight }) => (
      <StatusCell
        value={row.status}
        label={highlight(statusLabel[row.status])}
        tones={{ active: "success", trial: "accent", past_due: "warning", churned: "danger" }}
      />
    ),
  },
  { id: "mrr", header: "MRR", numeric: true, cell: ({ row }) => <CurrencyCell value={row.mrr} locale="en-US" /> },
];

export function ServerExample() {
  const [sorting, setSorting] = useState<DataTableSorting>(FIRST_QUERY.sorting);
  const [pagination, setPagination] = useState<DataTablePagination>(FIRST_QUERY.pagination);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<DataTableColumnFilters>([]);
  const [result, setResult] = useState<ServerPage>(() => queryUsers(FIRST_QUERY));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [failNext, setFailNext] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const request = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    // The first page is already in place; only a change (sorting, paging, search, filters, Fail, Retry) calls the API.
    if (first.current && !failNext && attempt === 0) {
      first.current = false;
      return;
    }
    first.current = false;
    const id = ++request.current;
    setLoading(true);
    setError(undefined);
    fetchUsers({ sorting, pagination, search, filters }, failNext)
      .then((page) => {
        if (id !== request.current) return; // a newer request is in flight
        setResult(page);
      })
      .catch((e: unknown) => id === request.current && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => id === request.current && setLoading(false));
  }, [sorting, pagination, search, filters, failNext, attempt]);

  const columns = useMemo(
    () =>
      serverColumns.map((c) =>
        c.filter
          ? {
              ...c,
              filterOptions: (c.id === "status" ? statusOptions : roleOptions).map((o) => ({
                ...o,
                count: result.facets[c.id]?.[o.value] ?? 0,
              })),
            }
          : c,
      ),
    [result.facets],
  );

  return (
    <Example
      title="Server-side"
      deferRender
      lazyPreview
      intrinsicHeight={921}
      description="manual + rowCount: the table only renders. Sorting, search (debounced), filters and paging go to a fake API that answers after 600ms. While it loads, the previous rows stay in place under a veil, so nothing jumps."
      variant="bare"
      controls={
        <Switch
          checked={failNext}
          onCheckedChange={setFailNext}
          label="Fail requests"
          description="Shows the error state and Retry."
        />
      }
      code={`
import { useState } from "react";
import { DataTable, type DataTableColumn, type DataTableColumnFilters, type DataTableSorting } from "@sheenui/theme";

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
}`}
    >
      <DataTable
        caption="Customers (server)"
        manual
        rowCount={result.total}
        data={result.rows}
        columns={columns}
        getRowLabel={(u) => u.name}
        loading={loading}
        error={error}
        onRetry={() => {
          setFailNext(false);
          setAttempt((n) => n + 1);
        }}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={pagination}
        onPaginationChange={setPagination}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        columnFilters={filters}
        onColumnFiltersChange={setFilters}
        // No onExport: with manual pagination the toolbar Export stays hidden (the table only has one page).
        labels={{ searchPlaceholder: "Search customers…" }}
      />
    </Example>
  );
}

/* ---------- (c) Minimal ---------- */

type Invoice = { id: string; customer: string; amount: number; due: string; status: "paid" | "open" | "overdue" };

export const invoices: Invoice[] = [
  { id: "INV-1042", customer: "Acme Corp", amount: 1200, due: "2026-11-02", status: "open" },
  { id: "INV-1041", customer: "Globex", amount: 845.5, due: "2026-10-20", status: "overdue" },
  { id: "INV-1040", customer: "Initech", amount: 3200, due: "2026-10-12", status: "paid" },
  { id: "INV-1039", customer: "Umbrella", amount: 99, due: "2026-10-05", status: "paid" },
  { id: "INV-1038", customer: "Hooli", amount: 15000, due: "2026-09-28", status: "paid" },
];

export const invoiceColumns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice" },
  { id: "customer", header: "Customer" },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusCell
        value={row.status}
        label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        tones={{ paid: "success", open: "accent", overdue: "danger" }}
      />
    ),
  },
  { id: "due", header: "Due", sortFn: "alphanumeric" },
  { id: "amount", header: "Amount", numeric: true, cell: ({ row }) => formatCurrency(row.amount, "USD", "en-US", 2) },
];

export function MinimalExample() {
  return (
    <Example
      title="Minimal"
      lazyPreview
      deferRender
      intrinsicHeight={476}
      description="Just data, columns and a caption. Search, sorting, export and the View menu come with sensible defaults; turn any of them off with a prop."
      variant="bare"
      code={`
import { DataTable, type DataTableColumn, formatCurrency } from "@sheenui/theme";

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
}`}
    >
      <DataTable caption="Recent invoices" data={invoices} columns={invoiceColumns} hidePagination />
    </Example>
  );
}

/* ---------- (c2) Loading and error states ---------- */

export function StatesExample() {
  const [attempts, setAttempts] = useState(0);
  return (
    <Example
      title="Loading and error states"
      deferRender
      lazyPreview
      intrinsicHeight={1067}
      description="While the first request runs the table shows skeleton rows with a sweep of light and a progress bar under the header. When it fails, an inline alert with a Retry button replaces the body (rows that were already on screen stay under a veil, with the alert below them)."
      variant="bare"
      code={`
import { DataTable, type DataTableColumn } from "@sheenui/theme";

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
}`}
    >
      <div className="flex flex-col gap-6">
        <DataTable
          caption="Loading invoices"
          data={[]}
          columns={invoiceColumns}
          loading
          hidePagination
          enableSearch={false}
        />
        <DataTable
          caption="Invoices that failed to load"
          data={[]}
          columns={invoiceColumns}
          error="The billing service timed out. Check your connection and try again."
          onRetry={() => setAttempts((n) => n + 1)}
          hidePagination
          enableSearch={false}
        />
        <p className="m-0 text-xs text-sheen-fg-muted" aria-live="polite">
          {attempts === 0
            ? "Press Retry on the error to see it called."
            : `Retry pressed ${attempts} time${attempts === 1 ? "" : "s"}.`}
        </p>
      </div>
    </Example>
  );
}

/* ---------- (d) Pagination on its own ---------- */

export function PaginationExample() {
  const [page, setPage] = useState(6);
  return (
    <Example
      title="Pagination on its own"
      deferRender
      lazyPreview
      intrinsicHeight={420}
      description="A nav landmark with aria-current on the current page. The number of slots stays the same as you page, so buttons never jump under the pointer; on phones it collapses to “Page x of y”."
      stageClassName="flex-col gap-8"
      code={`
import { useState } from "react";
import { Pagination } from "@sheenui/theme";

export function Example() {
  const [page, setPage] = useState(6);

  return (
    <>
      <Pagination page={page} pageCount={24} onPageChange={setPage} aria-label="Search results pages" />
      <Pagination page={page} pageCount={24} onPageChange={setPage} size="sm" showFirstLast={false} siblingCount={2} />
      <Pagination defaultPage={2} pageCount={5} getPageHref={(p) => \`?page=\${p}\`} />
    </>
  );
}`}
    >
      <Pagination page={page} pageCount={24} onPageChange={setPage} aria-label="Search results pages" />
      <Pagination
        page={page}
        pageCount={24}
        onPageChange={setPage}
        size="sm"
        showFirstLast={false}
        siblingCount={2}
        aria-label="Compact pages"
      />
      <div className="flex flex-col items-center gap-2">
        <Pagination
          defaultPage={2}
          pageCount={5}
          getPageHref={(p) => `#page-${p}`}
          onPageChange={() => undefined}
          aria-label="Linked pages"
        />
        <Badge tone="neutral">Renders links with getPageHref</Badge>
      </div>
    </Example>
  );
}

/* ---------- (d) Ten thousand rows, virtualized ---------- */

type Order = { id: string; customer: string; status: string; total: number };

const ORDER_STATUS = ["Paid", "Pending", "Shipped", "Refunded"] as const;
const ORDERS: Order[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(5, "0")}`,
  customer: `Customer ${String(((i * 37) % 900) + 100)}`,
  status: ORDER_STATUS[i % ORDER_STATUS.length] ?? "Paid",
  total: 20 + ((i * 7919) % 48000) / 100,
}));
const orderColumns: DataTableColumn<Order>[] = [
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

export function VirtualizedExample() {
  // A callback ref: the preview mounts later than this component when it is deferred.
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [inDom, setInDom] = useState<number | null>(null);
  // Counts the rows that are really in the DOM, whenever the window moves.
  useEffect(() => {
    const el = wrapper;
    if (!el) return;
    const count = () => setInDom(el.querySelectorAll("tbody tr[data-row-id]").length);
    count();
    const observer = new MutationObserver(count);
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [wrapper]);
  return (
    <Example
      title="Ten thousand rows"
      lazyPreview
      deferRender
      intrinsicHeight={612}
      description="With maxHeight set, a page of 50 rows or more renders only the rows in view plus a few more (virtualize defaults to auto; pass virtualize to force it). Scroll to the end: the count below stays small, yet the scrollbar spans all 10,000. Rows outside the window are not in the DOM, so Tab skips them: set virtualize={false} for a table people tab through row by row."
      variant="bare"
      code={`
import { useEffect, useState } from "react";
import { DataTable, formatCurrency, type DataTableColumn } from "@sheenui/theme";

type Order = { id: string; customer: string; status: string; total: number };

const statuses = ["Paid", "Pending", "Shipped", "Refunded"];
const orders: Order[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: \`ORD-\${String(i + 1).padStart(5, "0")}\`,
  customer: \`Customer \${String(((i * 37) % 900) + 100)}\`,
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
}`}
    >
      <div ref={setWrapper} className="flex w-full flex-col gap-3">
        <p className="text-sm text-sheen-fg-muted" aria-live="off">
          Rows in the DOM: {inDom ?? "…"} of 10,000
        </p>
        <DataTable
          caption="Orders"
          data={ORDERS}
          columns={orderColumns}
          maxHeight="22rem"
          virtualize
          hidePagination
          defaultPageSize={10_000}
        />
      </div>
    </Example>
  );
}
