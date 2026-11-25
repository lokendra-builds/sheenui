"use client";

import { memo, useId, useState } from "react";

import { Input } from "../input/input";
import { Pagination } from "../pagination/pagination";
import { Select } from "../select/select";
import type { DataTableLabels, DataTablePagination } from "./types";

/**
 * The footer: rows per page, the "Showing x-y of z" text, the page jump and the pager. Memoised: sorting leaves
 * every prop unchanged, and re-rendering the pager's shared-layout pill would make Motion re-measure the page.
 */
export const TableFooter = memo(function TableFooter({
  labels,
  caption,
  pagination,
  setPagination,
  pageSizeOptions,
  rowsPerPageId,
  initialLoading,
  from,
  to,
  total,
  page,
  pageCount,
  cards,
}: {
  labels: DataTableLabels;
  caption: string;
  pagination: DataTablePagination;
  setPagination: (update: DataTablePagination | ((prev: DataTablePagination) => DataTablePagination)) => void;
  pageSizeOptions: number[];
  rowsPerPageId: string;
  initialLoading: boolean;
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
  cards: boolean;
}) {
  return (
    <div
      data-slot="data-table-pagination"
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-sheen-border px-3 py-3 text-sm sm:justify-between sm:px-4"
    >
      <div className="flex items-center gap-2.5">
        <span id={rowsPerPageId} className="whitespace-nowrap text-sheen-fg-muted">
          {labels.rowsPerPage}
        </span>
        <Select
          aria-labelledby={rowsPerPageId}
          className="w-auto"
          triggerClassName="min-w-20"
          value={String(pagination.pageSize)}
          onValueChange={(v) => {
            const size = Number(v);
            if (!size) return;
            // Keep the first visible row in view when the page size changes.
            setPagination((p) => ({ pageSize: size, pageIndex: Math.floor((p.pageIndex * p.pageSize) / size) }));
          }}
          items={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
        />
      </div>
      <p className="whitespace-nowrap text-sheen-fg-muted tabular-nums">
        {initialLoading ? labels.loading : labels.showing(from, to, total)}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {pageCount > 3 && !cards && (
          <PageJump
            label={labels.goToPage}
            page={page}
            pageCount={pageCount}
            onJump={(p) => setPagination((s) => ({ ...s, pageIndex: p - 1 }))}
          />
        )}
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={(p) => setPagination((s) => ({ ...s, pageIndex: p - 1 }))}
          siblingCount={1}
          size="md"
          disabled={initialLoading}
          labels={{ ...labels.pagination, pageOf: labels.pageOf }}
          aria-label={`${caption}: ${labels.pagination.nav ?? "pagination"}`}
        />
      </div>
    </div>
  );
});

/** A go-to-page number box next to the pager (hidden on phones, which already show the page count between the arrows). */
export function PageJump({
  label,
  page,
  pageCount,
  onJump,
}: {
  label: string;
  page: number;
  pageCount: number;
  onJump: (page: number) => void;
}) {
  const [draft, setDraft] = useState("");
  const labelId = useId();
  const commit = () => {
    const n = Number.parseInt(draft, 10);
    if (Number.isFinite(n)) onJump(Math.min(Math.max(1, n), pageCount));
    setDraft("");
  };
  return (
    // Phones already get "Page x of y" between the arrows.
    <div className="flex items-center gap-2 max-sm:hidden">
      <span id={labelId} className="whitespace-nowrap text-sheen-fg-muted">
        {label}
      </span>
      <Input
        aria-labelledby={labelId}
        type="number"
        inputMode="numeric"
        min={1}
        max={pageCount}
        placeholder={String(page)}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        onBlur={() => draft && commit()}
        // Wide enough that the input itself (not just its padding) is a 44px target on touch.
        className="w-20"
        inputClassName="any-pointer-coarse:h-11 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}
