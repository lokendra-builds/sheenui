"use client";

import { useMemo, type ReactNode } from "react";
import { DataTable } from "@/components/sheenui/data-table/data-table";
import type { DataTableColumn } from "@/components/sheenui/data-table/types";
import { StatusCell } from "@/components/sheenui/data-table/cells";
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { useToast } from "@/components/sheenui/toast/toast";
import { CUSTOMERS, type Customer } from "@/data/customers";
import { PageHeader } from "./page-header";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

const STATUS_TONES = { Active: "success", Trial: "accent", "Past due": "warning", Churned: "danger" } as const;

/**
 * Avatar, company and email. Unlike SheenUI's `UserCell`, which wraps an email at any letter, the email
 * truncates with an ellipsis here; `title` and the text node keep it fully available.
 */
function CustomerCell({ company, email, highlight }: { company: string; email: string; highlight: (text: string) => ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span aria-hidden className="inline-flex shrink-0">
        <Avatar name={company} size="sm" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-medium text-sheen-fg">{highlight(company)}</span>
        <span className="truncate text-xs text-sheen-fg-muted" title={email}>
          {highlight(email)}
        </span>
      </span>
    </span>
  );
}

export function CustomersView() {
  const toast = useToast();
  const columns = useMemo<DataTableColumn<Customer>[]>(
    () => [
      {
        id: "company",
        header: "Customer",
        accessorKey: "company",
        searchValue: (row) => `${row.company} ${row.contact} ${row.email}`,
        cell: ({ row, highlight }) => <CustomerCell company={row.company} email={row.email} highlight={highlight} />,
        minWidth: 240,
      },
      { id: "contact", header: "Contact", accessorKey: "contact", defaultHidden: true },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        filter: "faceted",
        cell: ({ row }) => <StatusCell value={row.status} tones={STATUS_TONES} />,
      },
      { id: "plan", header: "Plan", accessorKey: "plan", filter: "faceted" },
      {
        id: "mrr",
        header: "MRR",
        accessorKey: "mrr",
        numeric: true,
        cell: ({ row }) => money.format(row.mrr),
        exportValue: (row) => row.mrr,
      },
      { id: "seats", header: "Seats", accessorKey: "seats", numeric: true },
      { id: "country", header: "Country", accessorKey: "country" },
      {
        id: "since",
        header: "Customer since",
        accessorKey: "since",
        sortFn: "datetime",
        cell: ({ row }) => date.format(new Date(`${row.since}T00:00:00Z`)),
      },
    ],
    [],
  );

  return (
    <div className="grid gap-4 pb-2">
      <PageHeader title="Customers" description="Search, sort, filter and page through every account. Rows are demo data." />
      <DataTable
        data={CUSTOMERS}
        columns={columns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.company}
        caption="Customers"
        showCaption={false}
        enableSearch
        enableExport
        exportFilename="customers"
        defaultSorting={[{ id: "mrr", desc: true }]}
        defaultPageSize={10}
        pageSizeOptions={[10, 25, 50]}
        mobileLayout="cards"
        rowActions={(row) => [
          { label: "Copy email", onSelect: () => void navigator.clipboard?.writeText(row.email).then(() => toast.success("Copied", row.email)) },
          { label: "Send invoice", onSelect: () => toast.info("Invoice queued", `An invoice for ${row.company} is on its way.`) },
        ]}
      />
    </div>
  );
}
