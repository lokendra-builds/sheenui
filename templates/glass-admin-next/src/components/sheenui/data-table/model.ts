"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useTable, type RowData } from "@tanstack/react-table";

import { foldText } from "./cells";
import {
  features,
  inSetFilter,
  readValue,
  stringify,
  type RowLike,
  type SearchState,
  type Setter,
  type Updater,
} from "./shared";
import type {
  DataTableColumn,
  DataTableColumnFilters,
  DataTableColumnVisibility,
  DataTablePagination,
  DataTableProps,
  DataTableSorting,
} from "./types";

/**
 * Builds the TanStack table from the column definitions and the table state, and derives what the view needs:
 * the rows of the page, every matching row, the counts, the visible columns and each row's accessible label.
 * It also steps back to the last page when paging past the end (rows deleted, filters narrowed on the server).
 */
export function useTableModel<TData extends RowData>({
  data,
  columns,
  getRowId: getRowIdProp,
  getRowLabel,
  enableSorting,
  enableMultiSort,
  sorting,
  setSorting,
  pagination,
  setPagination,
  query,
  setGlobalFilter,
  columnFilters,
  setColumnFilters,
  columnVisibility,
  setColumnVisibility,
  manualPagination,
  manualSorting,
  manualFiltering,
  rowCount,
  loading,
}: {
  data: TData[];
  columns: DataTableColumn<TData>[];
  getRowId: DataTableProps<TData>["getRowId"];
  getRowLabel: DataTableProps<TData>["getRowLabel"];
  enableSorting: boolean;
  enableMultiSort: boolean;
  sorting: DataTableSorting;
  setSorting: Setter<DataTableSorting>;
  pagination: DataTablePagination;
  setPagination: Setter<DataTablePagination>;
  /** The applied (trimmed) search text. */
  query: string;
  setGlobalFilter: (value: string) => void;
  columnFilters: DataTableColumnFilters;
  setColumnFilters: Setter<DataTableColumnFilters>;
  columnVisibility: DataTableColumnVisibility;
  setColumnVisibility: Setter<DataTableColumnVisibility>;
  manualPagination: boolean;
  manualSorting: boolean;
  manualFiltering: boolean;
  rowCount: number | undefined;
  loading: boolean;
}) {
  const colById = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns]);
  const tableColumns = useMemo(
    () =>
      columns.map((col) => ({
        id: col.id,
        // null and undefined both sort last (sortUndefined only knows undefined).
        accessorFn: (row: TData) => {
          const value = readValue(col, row);
          return value === null ? undefined : value;
        },
        header: col.header,
        enableSorting: enableSorting && col.enableSorting !== false,
        enableMultiSort,
        enableHiding: col.enableHiding !== false,
        enableGlobalFilter: col.searchable !== false,
        enableColumnFilter: col.filter === "faceted",
        filterFn: inSetFilter,
        sortFn:
          typeof col.sortFn === "function"
            ? (
                (compare) => (a: RowLike<TData>, b: RowLike<TData>) =>
                  compare(a.original, b.original)
              )(col.sortFn)
            : (col.sortFn ?? (col.numeric ? "basic" : "alphanumeric")),
        sortUndefined: "last" as const,
        sortDescFirst: false,
      })),
    [columns, enableSorting, enableMultiSort],
  );

  // Only visible columns are searched: a match in a hidden column would show a row with nothing marked.
  const searchedColumns = columns
    .filter((c) => c.searchable !== false && columnVisibility[c.id] !== false)
    .map((c) => c.id)
    .join(",");
  const searchState = useMemo<SearchState | undefined>(
    () => (query ? { folded: foldText(query), columns: searchedColumns } : undefined),
    [query, searchedColumns],
  );
  const globalFilterFn = useMemo(() => {
    const searchers = new Map(columns.map((c) => [c.id, c.searchValue]));
    return (row: RowLike<TData>, columnId: string, filterValue: unknown) => {
      const q = (filterValue as SearchState | undefined)?.folded;
      if (!q) return true;
      const custom = searchers.get(columnId);
      const text = custom ? custom(row.original) : stringify(row.getValue(columnId));
      return foldText(text).includes(q);
    };
  }, [columns]);

  const getRowId = useCallback(
    (row: TData, index: number) => {
      if (getRowIdProp) return getRowIdProp(row, index);
      const maybe = (row as { id?: unknown }).id;
      return typeof maybe === "string" || typeof maybe === "number" ? String(maybe) : String(index);
    },
    [getRowIdProp],
  );

  const table = useTable<typeof features, TData>({
    features,
    columns: tableColumns,
    data,
    getRowId,
    // The search goes in as SearchState (re-filters when the visible columns change); callers only see the string.
    state: { sorting, pagination, globalFilter: searchState, columnFilters, columnVisibility },
    onSortingChange: (u) => setSorting(u),
    onPaginationChange: (u) => setPagination(u),
    onGlobalFilterChange: (u) => {
      const next: unknown = typeof u === "function" ? (u as (prev: unknown) => unknown)(searchState) : u;
      setGlobalFilter(typeof next === "string" ? next : "");
    },
    onColumnFiltersChange: (u) => setColumnFilters(u as Updater<DataTableColumnFilters>),
    onColumnVisibilityChange: (u) => setColumnVisibility(u),
    manualPagination,
    manualSorting,
    manualFiltering,
    rowCount: manualPagination ? (rowCount ?? data.length) : undefined,
    autoResetPageIndex: false,
    enableSorting,
    enableMultiSort,
    maxMultiSortColCount: 3,
    enableSortingRemoval: true,
    sortDescFirst: false,
    globalFilterFn,
    getColumnCanGlobalFilter: (column) =>
      (column.columnDef as { enableGlobalFilter?: boolean }).enableGlobalFilter !== false &&
      columnVisibility[column.id] !== false,
  });

  /* ----- derived ----- */
  const rows = table.getRowModel().rows;
  /** Every row that passes the search and filters, in table order (client-side); the page in server mode. */
  const matchingRows = manualPagination ? rows : table.getPrePaginatedRowModel().rows;
  const total = manualPagination ? (rowCount ?? data.length) : matchingRows.length;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));
  const page = Math.min(pagination.pageIndex + 1, pageCount);
  const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const to = Math.min(total, pagination.pageIndex * pagination.pageSize + rows.length);
  const visibleColumns = table
    .getVisibleLeafColumns()
    .map((c) => colById.get(c.id))
    .filter((c): c is DataTableColumn<TData> => Boolean(c));
  const firstColumn = visibleColumns[0];
  const filtersActive = columnFilters.length > 0;

  // Paging past the end (rows deleted, filters narrowed on the server): step back to the last page.
  useEffect(() => {
    if (!loading && pagination.pageIndex > pageCount - 1) setPagination((p) => ({ ...p, pageIndex: pageCount - 1 }));
  }, [loading, pageCount, pagination.pageIndex, setPagination]);

  const rowLabel = useCallback(
    (row: TData, index: number) => {
      if (getRowLabel) return getRowLabel(row);
      const first = columns[0];
      if (!first) return String(index + 1);
      const value = readValue(first, row);
      return stringify(value) || String(index + 1);
    },
    [getRowLabel, columns],
  );
  return {
    colById,
    getRowId,
    table,
    rows,
    matchingRows,
    total,
    pageCount,
    page,
    from,
    to,
    visibleColumns,
    firstColumn,
    filtersActive,
    rowLabel,
  };
}
